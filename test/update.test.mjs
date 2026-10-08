import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { classifySource, compatibility, compareTarget, inspectTarget, checkGithub, preflight, saveBaseline, verifyRuntime, validateArtifact, HOST_FILES } from '../lib/update-core.js';
const sha = 'a'.repeat(40), old = 'b'.repeat(40);
const build = { version: '0.3.21', fingerprint: 'f'.repeat(64), sourceCommit: old, sourceDirty: true };
const manifest = { name: 'dsh-theme-gallery', main:'./lib/index.js', version: '0.3.21', engines: { node: '^22.19.0 || >=24' }, peerDependencies: { '@deepseek-ai/dsh': '0.2.0-rc.2 || 0.2.1-alpha.1' }, dsh: { bundle: { patch: './cordis.patch.yml' }, client: {platform:'web',immediately:true,inject:['ui-theme','ui-slots','locale','ui-layout','ui-sidebar'].map(id=>'@deepseek-ai/dsh-client-'+id)} } };
const target = { commit: sha, version: '0.3.22', manifest: { ...manifest, version: '0.3.22' }, build: { ...build, version: '0.3.22' }, artifactValid: true, channel: 'commit' };
const info = { manifest, build, diskBuild: build, artifactValid: true, runtimeVersion: '0.2.1-alpha.1', nodeVersion: '24.19.0', source: { kind: 'github', spec: 'github:Xuanyi-king/dsh-theme-gallery', commit: old }, writable: true, entries: [{ moduleName: 'dsh-theme-gallery', enabled: true, fiberPhase: 'active' }], backupAvailable: true };
const response = (status, value) => new Response(typeof value === 'string' ? value : JSON.stringify(value), { status });
function artifactFixture(targetBuild=target.build) {
 const bundle=`window.__ModuleLoader__.load({id:'dsh-theme-gallery',factory:()=>{const BUILD_INFO = ${JSON.stringify(targetBuild)};/* ${Array.from({length:22},(_,i)=>'data:image/webp;base64,'+Buffer.from(String(i)).toString('base64')).join(' ')} */}});`;
 const files=Object.fromEntries(HOST_FILES.map(file=>[file,'// '+file]));
 const hash=text=>createHash('sha256').update(text).digest('hex');
 files['lib/build-info.js']=`export const BUILD_INFO = ${JSON.stringify(targetBuild)};\n`;
 files['cordis.patch.yml']='- insert:\n    - id: dsh-theme-gallery\n      name: dsh-theme-gallery\n';
 files['lib/artifact.json']=JSON.stringify({...targetBuild,manifestSha256:hash(JSON.stringify(target.manifest)),resourceCount:11,clientSha256:hash(bundle),hostHashes:Object.fromEntries(HOST_FILES.map(file=>[file,hash(files[file])]))});
 return{bundle,files};
}
test('SemVer includes prereleases without accepting a stable floor above alpha', () => {
  assert.equal(compatibility(manifest, info).status, 'compatible');
  assert.equal(compatibility({ ...manifest, peerDependencies: { '@deepseek-ai/dsh-app-boot': '^0.2.1' } }, info).status, 'incompatible');
  assert.equal(compatibility(manifest, { ...info, runtimeVersion: null }).status, 'unknown');
  assert.equal(compatibility(manifest, { ...info, nodeVersion: '20.0.0' }).status, 'incompatible');
});
test('source classification keeps links and junctions outside automatic updates', () => {
  for (const spec of ['link:/repo', 'file:/repo', '/repo']) assert.equal(classifySource(spec).kind, spec.startsWith('link:') ? 'link' : 'directory');
  assert.equal(classifySource('dsh-theme-gallery@0.3.20').kind, 'registry');
  assert.equal(classifySource('file:/tmp/theme.tgz').kind, 'tarball');
  assert.equal(classifySource('https://evil.example/plugin').kind, 'unknown');
  assert.equal(classifySource('github:Xuanyi-king/dsh-theme-gallery', `packages:\n  https://codeload.github.com/Xuanyi-king/dsh-theme-gallery/tar.gz/${old}: {}`).commit, old);
});
test('commit locks are compared independently from manifest versions', () => {
  assert.equal(compareTarget(info, target).status, 'available');
  assert.equal(compareTarget({ ...info, manifest: target.manifest, build: target.build, diskBuild: target.build, source: { ...info.source, commit: old } }, target).status, 'available');
  assert.equal(compareTarget({ ...info, manifest: target.manifest, build: target.build, diskBuild: target.build, source: { ...info.source, commit: sha } }, target).status, 'up-to-date');
  assert.equal(compareTarget({ ...info, source: { kind: 'github', commit: null } }, { ...target, version: '0.3.21' }).status, 'unknown');
  assert.equal(compareTarget({ ...info, manifest: { ...manifest, version: '0.3.22' } }, target).status, 'unknown');
  assert.equal(compareTarget(info, { ...target, version: '0.3.19' }).status, 'unknown');
});
test('target manifest and loaded bundle version must agree exactly', () => {
  const bundle = `window.__ModuleLoader__.load({id:'dsh-theme-gallery',factory:()=>{const BUILD_INFO = ${JSON.stringify(build)};}});`;
  assert.equal(inspectTarget(manifest, bundle).artifactValid, true);
  assert.throws(() => inspectTarget({ ...manifest, version: '0.3.21-rc.1' }, bundle), /artifact/);
  assert.throws(() => inspectTarget(manifest, 'import x from "bad";'), /artifact/);
});
test('network, rate limit and timeout never mean up-to-date', async () => {
  for (const fetchImpl of [async()=>{throw Error('offline')}, async()=>response(403,{}), async()=>response(429,{})]) await assert.rejects(checkGithub({ fetchImpl }), /offline|HTTP/);
  await assert.rejects(checkGithub({ fetchImpl: ()=>new Promise(()=>{}), timeoutMs: 15 }), /timeout/);
});
test('no Release uses the real default branch commit, pinned raw artifacts and no README', async () => {
  const urls=[],{bundle,files}=artifactFixture();
  const fetchImpl=async url=>{urls.push(url);if(url.endsWith('/releases/latest'))return response(404,{});if(url.endsWith('/repos/Xuanyi-king/dsh-theme-gallery'))return response(200,{default_branch:'main'});if(url.includes('/commits/'))return response(200,{sha});if(url.endsWith('/package.json'))return response(200,target.manifest);if(url.endsWith('/lib/client.js'))return response(200,bundle);const path=url.split(sha+'/')[1];if(files[path])return response(200,files[path]);throw Error(url)};
  const found=await checkGithub({fetchImpl});assert.equal(found.commit,sha);assert.equal(found.channel,'commit');assert.ok(urls.every(url=>!url.includes('README')));assert.ok(urls.filter(url=>url.includes('raw.githubusercontent')).every(url=>url.includes(sha)));
});
test('unsafe release URLs and nonexistent commits are refused', async()=>{
  await assert.rejects(checkGithub({fetchImpl:async()=>response(200,{tag_name:'v0.3.22',html_url:'https://evil.example/download'})}),/release/);
  await assert.rejects(checkGithub({fetchImpl:async url=>url.endsWith('/releases/latest')?response(404,{}):url.endsWith('/repos/Xuanyi-king/dsh-theme-gallery')?response(200,{default_branch:'main'}):response(200,{sha:'not-a-commit'})}),/commit/);
});
test('all valid preflight evidence still declines a fake safe upgrade transaction', ()=>{
  const result=preflight(info,target,build);assert.equal(result.status,'unsupported');assert.equal(result.canInstall,false);assert.equal(result.checks.compatibility.status,'compatible');
  assert.equal(preflight(info,{...target,manifest:{...target.manifest,peerDependencies:{'@deepseek-ai/dsh':'^0.2.1'}}},build).status,'incompatible');
  assert.equal(preflight({...info,writable:false},target,build).status,'incompatible');
  assert.equal(preflight({...info,source:{kind:'link'}},target,build).status,'unsupported');
  assert.equal(preflight({...info,entries:[...info.entries,...info.entries]},target,build).status,'incompatible');
  assert.equal(preflight({...info,artifactValid:false},target,build).status,'incompatible');
});
test('backup preserves original config bytes and unknown fields without touching linked installs or other plugins', async()=>{
  const home=await mkdtemp(join(tmpdir(),'gallery-safe-update-'));try{
    await mkdir(join(home,'dsh-theme-gallery'));await mkdir(join(home,'other-plugin'));const raw='{"themeId":"gallery-wang-lin","future":{"x":1}}\n';
    await writeFile(join(home,'dsh-theme-gallery','selection.json'),raw);await writeFile(join(home,'other-plugin','config'),'untouched');await symlink(join(home,'other-plugin'),join(home,'linked'));
    const configuration={selection:'gallery-wang-lin',visual:'{"fade":25,"sidebarOpacity":60,"blur":2,"contrast":120,"extra":1}'};
    const saved=await saveBaseline(home,{info,client:build,configuration,target});const decoded=JSON.parse(await readFile(saved.path,'utf8'));
    assert.equal(decoded.selectionRaw,raw);assert.deepEqual(decoded.configuration,configuration);assert.equal(await readFile(join(home,'other-plugin','config'),'utf8'),'untouched');assert.equal(await readFile(join(home,'dsh-theme-gallery','selection.json'),'utf8'),raw);
    await assert.rejects(saveBaseline(home,{info,configuration:{visual:'x'.repeat(20000)}}),/large/);
  }finally{await rm(home,{recursive:true,force:true})}
});
test('verification distinguishes download, installation, Host/client loading and unknown outcomes', ()=>{
  assert.equal(verifyRuntime(info,target,build,{main:true,sidebar:true}).status,'unknown');
  assert.equal(verifyRuntime({...info,manifest:target.manifest,diskBuild:target.build,source:{...info.source,commit:sha}},target,build,{main:true,sidebar:true}).status,'restart-required');
  const installed={...info,manifest:target.manifest,build:target.build,diskBuild:target.build,source:{...info.source,commit:sha}};
  assert.equal(verifyRuntime(installed,target,build,{main:true,sidebar:true}).status,'restart-required');
  assert.equal(verifyRuntime(installed,target,target.build,{main:true,sidebar:true,resources:true,appearance:true,configuration:true},undefined,{matches:true}).status,'success');
  assert.equal(verifyRuntime({...installed,entries:[{...info.entries[0],fiberPhase:'failed'}]},target,target.build,{}).failureStage,'host-load-failed');
  assert.equal(verifyRuntime(installed,target,target.build,{main:false,sidebar:true}).failureStage,'client-load-failed');
  for(const phase of ['download-failed','install-failed','unknown'])assert.equal(verifyRuntime(info,target,build,{},phase).failureStage,phase);
});

test('historical remote bundle without metadata is unknown but still identifies its declared version',async()=>{
 const legacy={...manifest,version:'0.3.20'};
 const fetchImpl=async url=>url.endsWith('/releases/latest')?response(404,{}):url.endsWith('/repos/Xuanyi-king/dsh-theme-gallery')?response(200,{default_branch:'main'}):url.includes('/commits/')?response(200,{sha}):url.endsWith('/package.json')?response(200,legacy):response(200,"window.__ModuleLoader__.load({id:'dsh-theme-gallery',factory:()=>({apply(){}})});");
 const found=await checkGithub({fetchImpl});assert.equal(found.version,'0.3.20');assert.equal(found.artifactValid,false);assert.equal(compareTarget(info,found).status,'unknown');
});

test('same lock commit cannot hide stale Host, disk or Client builds',()=>{
 const same={...target,version:build.version,manifest,build};
 const local={...info,source:{kind:'github',commit:sha}};
 assert.equal(compareTarget({...local,build:{...build,fingerprint:'e'.repeat(64)}},same,build).status,'unknown');
 assert.equal(compareTarget({...local,diskBuild:{...build,fingerprint:'e'.repeat(64)}},same,build).status,'unknown');
 assert.equal(compareTarget(local,same,{...build,fingerprint:'e'.repeat(64)}).status,'unknown');
 assert.equal(preflight({...local,diskBuild:{...build,fingerprint:'e'.repeat(64)}},same,build).checks.localArtifact.status,'incompatible');
 assert.equal(compareTarget(local,same,build).status,'up-to-date');
});
test('backup refuses symlinked owned directories rather than writing into another plugin',async()=>{
 const home=await mkdtemp(join(tmpdir(),'gallery-boundary-'));try{
  await mkdir(join(home,'dsh-theme-gallery'));await mkdir(join(home,'other-plugin'));
  await symlink(join(home,'other-plugin'),join(home,'dsh-theme-gallery','update-baselines'));
  await assert.rejects(saveBaseline(home,{configuration:{}}),/boundary/);
 }finally{await rm(home,{recursive:true,force:true})}
});
test('verification never reports success without matching saved baseline and disk evidence',()=>{
 const installed={...info,manifest:target.manifest,build:target.build,diskBuild:target.build,source:{...info.source,commit:sha}};
 const registration={main:true,sidebar:true,resources:true,appearance:true,configuration:true};
 assert.equal(verifyRuntime(installed,target,target.build,registration).status,'unknown');
 assert.equal(verifyRuntime({...installed,diskBuild:build},target,target.build,registration,undefined,{matches:true}).status,'restart-required');
 assert.equal(verifyRuntime(installed,target,target.build,registration,undefined,{matches:false}).status,'rollback-required');
});

test('complete pinned artifacts reject missing Host, corrupt hashes, wrong module and patch',()=>{
 const {bundle,files}=artifactFixture();
 assert.equal(validateArtifact(target.manifest,bundle,files).artifactValid,true);
 for(const corrupted of [{...files,'lib/index.js':'tampered'},{...files,'lib/build-info.js':`export const BUILD_INFO = ${JSON.stringify(build)};`},{...files,'cordis.patch.yml':'- insert: []'}])assert.throws(()=>validateArtifact(target.manifest,bundle,corrupted),/artifact/);
 assert.throws(()=>validateArtifact({...target.manifest,engines:{node:'>=100'}},bundle,files),/artifact/);
 assert.throws(()=>inspectTarget(target.manifest,bundle.replace("id:'dsh-theme-gallery'","id:'another-plugin'")),/artifact/);
 assert.throws(()=>inspectTarget({...target.manifest,dsh:{bundle:{patch:'./missing'}}},bundle),/artifact/);
});
test('official stable Release is pinned and manifest tag must match',async()=>{
 const {bundle,files}=artifactFixture();
 const fetchImpl=async url=>url.endsWith('/releases/latest')?response(200,{tag_name:'v0.3.22',html_url:'https://github.com/Xuanyi-king/dsh-theme-gallery/releases/tag/v0.3.22'}):url.includes('/commits/')?response(200,{sha}):url.endsWith('/package.json')?response(200,target.manifest):url.endsWith('/lib/client.js')?response(200,bundle):response(200,files[url.split(sha+'/')[1]]);
 const found=await checkGithub({fetchImpl});assert.equal(found.channel,'release');assert.equal(found.artifactValid,true);
 await assert.rejects(checkGithub({fetchImpl:async url=>url.endsWith('/package.json')?response(200,{...target.manifest,version:'0.3.21'}):fetchImpl(url)}),/artifact|mismatch/);
});
