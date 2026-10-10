import { readFile, access, realpath, lstat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import yaml from 'js-yaml';
import { BUILD_INFO } from './build-info.js';
import { classifySource, checkGithub, compareTarget, inspectTarget, preflight, saveBaseline, readBaseline, readSelection, verifyRuntime, validateArtifact, HOST_FILES, PACKAGE_NAME, LEGACY_PACKAGE_NAME } from './update-core.js';
export const UPDATE_PATH = '/api/dsh-theme-gallery/update/';
export function isPnpmStorePath(store, real, pathApi={relative,isAbsolute}) {
  const rel=pathApi.relative(store,real);return rel!=='' && !rel.startsWith('..') && !pathApi.isAbsolute(rel);
}
const pluginDir = dirname(dirname(fileURLToPath(import.meta.url)));
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const optionalRead = async path => {try{return await readFile(path,'utf8')}catch(e){if(e.code==='ENOENT')return null;throw e}};
export async function readRuntimeInfo(ctx, { directory=pluginDir, build=BUILD_INFO }={}) {
  const profile=ctx.profileContext;
  const manifest=JSON.parse(await readFile(join(directory,'package.json'),'utf8'));
  const client=await readFile(join(directory,'lib','client.js'),'utf8');
  let diskBuild=null,artifactValid=false;
  try{
    const paths=['lib/artifact.json','lib/build-info.js','cordis.patch.yml',...HOST_FILES];
    const files=Object.fromEntries(await Promise.all(paths.map(async path=>[path,await readFile(join(directory,path),'utf8')])));
    diskBuild=validateArtifact(manifest,client,files).build;artifactValid=true;
  }catch{artifactValid=false}
  let runtimeVersion=null;
  try{
    const require=createRequire(profile.installAnchor);
    const boot=await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-app-boot')).href);
    runtimeVersion=boot.getDshRuntimeVersion();
  }catch{ /* No guessed disk/version fallback. */ }
  const profileManifest=JSON.parse(await readFile(join(profile.dir,'package.json'),'utf8'));
  const spec=profileManifest.dependencies?.[PACKAGE_NAME]??profileManifest.dependencies?.[LEGACY_PACKAGE_NAME]??'';
  let lock='',lockHash=null;
  const pnpmLock=await optionalRead(join(profile.dir,'pnpm-lock.yaml'));
  if(pnpmLock){
    lockHash=createHash('sha256').update(pnpmLock).digest('hex');
    const parsed=yaml.load(pnpmLock);
    const dependency=parsed?.importers?.['.']?.dependencies?.[PACKAGE_NAME]??parsed?.importers?.['.']?.dependencies?.[LEGACY_PACKAGE_NAME];
    const resolved=dependency?.version;
    // Select only this dependency's resolved package, never a stale sibling.
    lock=resolved ? JSON.stringify({resolved,package:parsed?.packages?.[resolved],snapshot:parsed?.snapshots?.[resolved]}) : '';
  }
  let source={kind:'unknown',spec:'',commit:null};
  try{
    // The scoped install path first, then the pre-rename package name: a profile
    // that still carries the legacy dependency must keep reporting its source.
    const loaded=await realpath(directory);
    for(const candidate of [join(profile.dir,'node_modules',...PACKAGE_NAME.split('/')), join(profile.dir,'node_modules',LEGACY_PACKAGE_NAME)]){
      let real;try{real=await realpath(candidate)}catch{continue}
      if(real!==loaded)continue;
      const normalStore=isPnpmStorePath(join(profile.dir,'node_modules','.pnpm'),real);
      const linked=(await lstat(candidate)).isSymbolicLink() && !normalStore;
      source=classifySource(spec,lock,linked);
      break;
    }
  }catch{/* Unresolved/custom rows cannot inherit another installation's lock. */}
  let writable=null;try{await access(directory,constants.W_OK);writable=true}catch{writable=false}
  let backupAvailable=false;try{await access(profile.home,constants.W_OK);backupAvailable=true}catch{}
  let entries=null;try{entries=(await ctx.pluginManager.listPlugins()).filter(row=>row.moduleName===PACKAGE_NAME||row.moduleName===LEGACY_PACKAGE_NAME)}catch{}
  return {manifest,build,diskBuild,artifactValid,runtimeVersion,nodeVersion:process.versions.node,source,writable,backupAvailable,entries,profile:profile.name,installPath:directory,lockHash};
}
export function createUpdateHandler({info,home,check=checkGithub}={}) {
  let disposed=false,busy=false,target=null;
  const abort=new AbortController();
  return {
    dispose(){disposed=true;target=null;abort.abort();},
    async fetch(request){
      // Gate every final response, including filesystem work that finishes after unload.
      const reply=(value,status=200)=>disposed||request.signal.aborted
        ? json({status:'unknown',reason:disposed?'plugin-unloaded':'cancelled'},503) : json(value,status);
      if(disposed)return reply({status:'unknown',reason:'plugin-unloaded'},503);
      const operation=new URL(request.url).pathname.slice(UPDATE_PATH.length);
      if(!['info','check','preflight','backup','verify'].includes(operation))return reply({status:'unsupported'},404);
      if(request.method!==(operation==='info'?'GET':'POST'))return reply({status:'unsupported'},405);
      if(operation==='info'){
        try{return reply({info:await info()})}catch(error){return reply({status:'failed',reason:String(error.message??error)},502)}
      }
      if(busy)return reply({status:'unknown',reason:'concurrent-request'},409);
      busy=true;
      try{
        let body={};if(operation!=='info'){
          const text=await request.text();if(Buffer.byteLength(text)>16384)return reply({status:'failed',reason:'request-too-large'},413);body=JSON.parse(text||'{}');
          if(!body||typeof body!=='object'||Array.isArray(body))return reply({status:'failed',reason:'invalid-request'},400);
        }
        const local=await info();if(disposed)throw Error('plugin unloaded');
        if(operation==='check'){
          target=null;target=await check({signal:AbortSignal.any([abort.signal,request.signal])});
          if(disposed)throw Error('plugin unloaded');
          return reply({...(body.client ? compareTarget(local,target,body.client) : {status:'unknown',reason:'client-build-unavailable'}),info:local,target});
        }
        if(operation==='backup'){
          if(!home)return reply({status:'unsupported',reason:'no-profile-home'},400);
          if(!body.configuration||typeof body.configuration!=='object'||Array.isArray(body.configuration))return reply({status:'failed',reason:'missing-configuration'},400);
          const baseline=await saveBaseline(home,{info:local,client:body.client,configuration:body.configuration,target});
          return reply({status:'ready',baseline});
        }
        if(operation==='verify'){
          if(!home || !body.baselineId)return reply({status:'unknown',reason:'saved-baseline-required'});
          const baseline=await readBaseline(home,body.baselineId);
          const matches=await readSelection(home)===baseline.selectionRaw && JSON.stringify(body.configuration)===JSON.stringify(baseline.configuration);
          return reply(verifyRuntime(local,baseline.target,body.client,body.registration,undefined,{matches}));
        }
        if(!target)return reply({status:'unknown',reason:'check-required'},409);
        if(operation==='preflight')return reply(preflight(local,target,body.client));

      }catch(error){return reply({status:disposed?'unknown':'failed',reason:String(error.message??error)},disposed?503:502)}finally{busy=false}
    },
  };
}
export function attachUpdateRoutes(ctx){
  ctx.inject(['connection','profileContext','pluginManager'], host=>{
    const handler=createUpdateHandler({info:()=>readRuntimeInfo(host),home:host.profileContext.home});
    host.effect(()=>()=>handler.dispose(),'dsh-theme-gallery: update requests');
    for(const operation of ['info','check','preflight','backup','verify']) host.effect(()=>host.connection.fetch.register({path:UPDATE_PATH+operation,methods:[operation==='info'?'GET':'POST'],requestBody:'buffered',fetch:request=>handler.fetch(request)}),'dsh-theme-gallery: authenticated update '+operation);
  });
}
