import semver from 'semver';
import { readFile, mkdir, writeFile, lstat, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
export const REPOSITORY = 'Xuanyi-king/dsh-theme-gallery';
export const REPO_URL = `https://github.com/${REPOSITORY}`;
export const SHA = /^[a-f0-9]{40}$/;
export const HOST_FILES = ['lib/index.js','lib/selection-route.js','lib/update-core.js','lib/update-host.js'];
const hash = text => createHash('sha256').update(text).digest('hex');
const result = (status, reason) => ({ status, reason });
export function classifySource(spec = '', lock = '', linked = false) {
  let kind = 'unknown';
  if (linked || spec.startsWith('link:')) kind = 'link';
  else if (/\.tgz(?:$|[?#])/.test(spec)) kind = 'tarball';
  else if (/^(file:|\.?\.?\/|\/|[A-Za-z]:[\\/])/.test(spec)) kind = 'directory';
  else if (new RegExp(`^(?:github:|https://github.com/|git\\+https://github.com/)${REPOSITORY}(?:\\.git)?(?:#.*)?$`, 'i').test(spec)) kind = 'github';
  else if (/^(?:dsh-theme-gallery@)?[~^\d*]/.test(spec) || spec === 'dsh-theme-gallery') kind = 'registry';
  const commits = [...new Set([...lock.matchAll(new RegExp(`(?:codeload\\.github\\.com/${REPOSITORY}/tar\\.gz/|${REPOSITORY}(?:\\.git)?#)([a-f0-9]{40})`, 'gi'))].map(m => m[1].toLowerCase()))];
  // Multiple archive generations in a lockfile are ambiguous, not a loaded commit.
  return { kind, spec, commit: kind === 'github' && commits.length === 1 ? commits[0] : null };
}
export function compatibility(manifest, info) {
  if (!semver.valid(info.runtimeVersion) || !semver.valid(info.nodeVersion)) return result('unknown', 'runtime-version-unavailable');
  if (manifest.engines?.node && !semver.satisfies(info.nodeVersion, manifest.engines.node, { includePrerelease: true })) return result('incompatible', 'node-engine');
  const peers = Object.entries(manifest.peerDependencies ?? {}).filter(([name]) => name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-'));
  for (const [name, range] of peers) {
    if (typeof range !== 'string' || !semver.validRange(range) || !semver.satisfies(info.runtimeVersion, range, { includePrerelease: true })) return { ...result('incompatible', 'dsh-peer'), peer: name, range };
  }
  if (!peers.length) return result('unknown', 'target-has-no-dsh-peer-evidence');
  return result('compatible', 'semver-matched');
}
export function inspectTarget(manifest, bundle) {
  const matches = [...bundle.matchAll(/const BUILD_INFO = (\{[^\n]*\});/g)];
  if (manifest.name !== 'dsh-theme-gallery' || !semver.valid(manifest.version) || manifest.main !== './lib/index.js' || manifest.dsh?.bundle?.patch !== './cordis.patch.yml' || manifest.dsh?.client?.platform !== 'web' || manifest.dsh.client.immediately !== true || !['ui-theme','ui-slots','locale','ui-layout','ui-sidebar'].every(id=>manifest.dsh.client.inject?.includes('@deepseek-ai/dsh-client-'+id)) || matches.length !== 1 || ! /window\.__ModuleLoader__\.load\(\{\s*id:\s*['"]dsh-theme-gallery['"]/.test(bundle) || /^\s*(?:import|export)\s/m.test(bundle)) throw Error('invalid target artifact');
  let build;try { build = JSON.parse(matches[0][1]); } catch { throw Error('invalid artifact metadata'); }
  if (build.version !== manifest.version || !/^[a-f0-9]{64}$/.test(build.fingerprint)) throw Error('artifact manifest/bundle mismatch');
  return { build, artifactValid: true };
}
export function runningAgreement(info, client) {
  return info.artifactValid && info.manifest.version === info.build.version &&
    info.diskBuild?.version === info.build.version && info.diskBuild?.fingerprint === info.build.fingerprint &&
    (!client || client.version === info.build.version && client.fingerprint === info.build.fingerprint);
}
export function compareTarget(info, target, client) {
  if (!runningAgreement(info, client)) return result('unknown', 'local-artifact-mismatch');
  if (!target.artifactValid && !semver.lt(target.version, info.build.version)) return result('unknown', 'target-artifact-unverified');
  if (semver.gt(target.version, info.build.version)) return result('available', 'newer-version');
  if (semver.lt(target.version, info.build.version)) return result('unknown', 'remote-behind-running-build');
  if (info.build.fingerprint !== target.build?.fingerprint) return result('unknown', 'same-version-different-build');
  if (target.channel === 'commit' && info.source.kind === 'github') {
    if (!info.source.commit) return result('unknown', 'installed-commit-unavailable');
    return result(info.source.commit === target.commit ? 'up-to-date' : 'available', 'commit-and-build-comparison');
  }
  return result('up-to-date', 'version-and-build-matched');
}
export function validateArtifact(manifest, bundle, files) {
  const inspected = inspectTarget(manifest, bundle);
  const metadata = JSON.parse(files['lib/artifact.json']);
  const hostBuild = JSON.parse(files['lib/build-info.js'].match(/^export const BUILD_INFO = (\{[^\n]*\});\s*$/)?.[1] ?? 'null');
  if (!hostBuild || JSON.stringify(hostBuild) !== JSON.stringify(inspected.build) ||
      metadata.manifestSha256 !== hash(JSON.stringify(manifest)) || metadata.version !== manifest.version || metadata.fingerprint !== inspected.build.fingerprint ||
      metadata.clientSha256 !== hash(bundle) ||
      JSON.stringify(Object.keys(metadata.hostHashes ?? {}).sort()) !== JSON.stringify([...HOST_FILES].sort()) ||
      !/^\s*- insert:\s*\n\s+- id: dsh-theme-gallery\s*\n\s+name: dsh-theme-gallery\s*$/.test(files['cordis.patch.yml']) ||
      !Number.isInteger(metadata.resourceCount) || metadata.resourceCount < 11 ||
      new Set(bundle.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g) ?? []).size !== metadata.resourceCount * 2)
    throw Error('incomplete or inconsistent target artifact');
  for (const file of HOST_FILES) if (metadata.hostHashes[file] !== hash(files[file])) throw Error('Host artifact hash mismatch');
  return inspected;
}
export async function checkGithub({ fetchImpl = globalThis.fetch, signal, timeoutMs = 12000 } = {}) {
  const abort = new AbortController();
  const stop = () => abort.abort(signal?.reason);signal?.addEventListener('abort', stop, { once: true });if(signal?.aborted)stop();
  let timer;
  const deadline = new Promise((_,reject) => { timer = setTimeout(() => { abort.abort(); reject(Error('GitHub request timeout')); }, timeoutMs); });
  const operation = (async () => {
    const get = async (url, json = true, allow404 = false) => {
      if(abort.signal.aborted)throw Error('cancelled');
      const r = await fetchImpl(url, { signal: abort.signal, redirect: 'error', headers: { accept: json ? 'application/vnd.github+json' : 'text/plain', 'user-agent': 'dsh-theme-gallery', 'cache-control': 'no-cache' } });
      if (r.status === 404 && allow404) return null;
      if (!r.ok) throw Error(`GitHub HTTP ${r.status}`);
      const raw = await r.text();if(raw.length>6_000_000)throw Error('GitHub artifact too large');return json ? JSON.parse(raw) : raw;
    };
    const api = `https://api.github.com/repos/${REPOSITORY}`;
    const release = await get(`${api}/releases/latest`, true, true);
    let channel = 'commit', ref;
    if (release) {
      if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name) || release.html_url !== `${REPO_URL}/releases/tag/${release.tag_name}`) throw Error('untrusted release');
      channel = 'release';ref = release.tag_name;
    } else {
      const repository = await get(api);
      if (typeof repository.default_branch !== 'string' || !/^[\w./-]+$/.test(repository.default_branch)) throw Error('unknown default branch');
      ref = repository.default_branch;
    }
    const commit = (await get(`${api}/commits/${encodeURIComponent(ref)}`)).sha;
    if (!SHA.test(commit)) throw Error('invalid target commit');
    const raw = `https://raw.githubusercontent.com/${REPOSITORY}/${commit}`;
    const manifest = await get(`${raw}/package.json`);
    const bundle = await get(`${raw}/lib/client.js`, false);
    let inspected;
    if (!bundle.includes('const BUILD_INFO =') && manifest.name === 'dsh-theme-gallery' && semver.valid(manifest.version) && bundle.includes('window.__ModuleLoader__.load') && !/^\s*(?:import|export)\s/m.test(bundle)) {
      inspected = { build: null, artifactValid: false, artifactReason: 'target-build-metadata-unavailable' };
    } else {
      const paths = ['lib/artifact.json','lib/build-info.js','cordis.patch.yml',...HOST_FILES];
      const files = Object.fromEntries(await Promise.all(paths.map(async path => [path, await get(`${raw}/${path}`, false)])));
      inspected = validateArtifact(manifest,bundle,files);
    }
    if(channel==='release' && `v${manifest.version}`!==ref)throw Error('release/manifest mismatch');
    return { channel, commit, version: manifest.version, manifest, ...inspected, url: channel==='release'?`${REPO_URL}/releases/tag/${ref}`:`${REPO_URL}/commit/${commit}` };
  })();
  try { return await Promise.race([operation, deadline]); } finally { clearTimeout(timer);signal?.removeEventListener('abort', stop); }
}
export function preflight(info, target, client) {
  const checks = {
    compatibility: compatibility(target.manifest, info),
    target: result(SHA.test(target.commit) && target.artifactValid ? 'compatible' : 'incompatible', 'pinned-artifact'),
    localArtifact: result(!!client && runningAgreement(info,client) ? 'compatible' : 'incompatible', 'manifest-host-client-agreement'),
    source: result(['github','registry','tarball'].includes(info.source.kind) ? 'compatible' : info.source.kind==='unknown'?'unknown':'unsupported', 'source-boundary'),
    writable: result(info.writable===true?'compatible':info.writable===false?'incompatible':'unknown','install-target-writable'),
    activation: result(info.entries?.length===1 && info.entries[0].fiberPhase==='active' && info.entries[0].enabled ? 'compatible' : info.entries?.length>1?'incompatible':'unknown','single-active-host-entry'),
    backup: result(info.backupAvailable?'compatible':'unknown','plugin-owned-baseline'),
    executor: result('unsupported','no-safe-host-upgrade-transaction'),
  };
  const statuses=Object.values(checks).map(v=>v.status);
  return { status: statuses.includes('incompatible')?'incompatible':statuses.includes('unknown')?'unknown':'unsupported', canInstall: false, checks, target: {version:target.version,commit:target.commit,channel:target.channel,url:target.url} };
}
// Reject links/junctions at every plugin-owned boundary; never follow them into another plugin.
export async function ownedPath(home, child, create = false) {
  const root = await realpath(home);
  let directory = join(root, 'dsh-theme-gallery');
  for (const part of [null, ...(child === 'selection.json' ? [] : ['update-baselines'])]) {
    if (part) directory = join(directory, part);
    if (create) await mkdir(directory, {mode:0o700}).catch(error => {if(error.code !== 'EEXIST') throw error});
    const stat = await lstat(directory);
    if (stat.isSymbolicLink() || !stat.isDirectory() || await realpath(directory) !== directory) throw Error('unsupported configuration boundary');
  }
  const path = join(directory, child);
  try {if ((await lstat(path)).isSymbolicLink() || await realpath(path) !== path) throw Error('unsupported configuration boundary')} catch(error) {if(error.code !== 'ENOENT') throw error}
  return path;
}
export async function readSelection(home) {
  try {const text=await readFile(await ownedPath(home,'selection.json'),'utf8');if(Buffer.byteLength(text)>65536)throw Error('selection too large');return text} catch(error){if(error.code==='ENOENT')return null;throw error}
}
export async function readBaseline(home, id) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id ?? '')) throw Error('invalid baseline identity');
  const text=await readFile(await ownedPath(home,`${id}.json`),'utf8');if(Buffer.byteLength(text)>200000)throw Error('baseline too large');
  const record=JSON.parse(text);if(record.schema!==1||record.id!==id)throw Error('invalid baseline');return record;
}
export async function saveBaseline(home, baseline) {
  if(Buffer.byteLength(JSON.stringify(baseline.configuration??{}))>8192)throw Error('configuration too large');
  const selectionRaw=await readSelection(home);
  const id=randomUUID(),path=await ownedPath(home,`${id}.json`,true);
  const record={schema:1,id,createdAt:new Date().toISOString(),...baseline,selectionRaw};
  await writeFile(path,JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});return{id,path,record};
}
export function verifyRuntime(info,target,client,registration={},failureStage,baseline) {
  if(failureStage)return{status:'unknown',failureStage};
  if(!target?.artifactValid || !target.build || info.manifest.version!==target.version || !info.artifactValid || info.source.kind==='github' && info.source.commit!==target.commit)return{status:'unknown',failureStage:'unknown'};
  if(info.entries?.some(e=>e.fiberPhase==='failed'||e.fiberPhase==='pending'))return{status:'rollback-required',failureStage:'host-load-failed'};
  if(!runningAgreement(info,client) || info.build.version!==target.version || client?.version!==target.version || client?.fingerprint!==target.build.fingerprint)return{status:'restart-required',reason:'restart-host-and-hard-refresh'};
  if(registration.main===false||registration.sidebar===false)return{status:'rollback-required',failureStage:'client-load-failed'};
  if(baseline?.matches===false)return{status:'rollback-required',failureStage:'configuration-changed'};
  if(!baseline?.matches || info.entries?.length!==1||info.entries[0].fiberPhase!=='active'||!info.entries[0].enabled||!registration.main||!registration.sidebar||!registration.resources||!registration.appearance||info.build.fingerprint!==target.build.fingerprint)return{status:'unknown',failureStage:'unknown'};
  return{status:'success',reason:'runtime-and-baseline-verified'};
}
