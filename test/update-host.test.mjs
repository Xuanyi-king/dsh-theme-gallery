import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import { createUpdateHandler } from '../lib/update-host.js';
const build={version:'0.3.21',fingerprint:'f'.repeat(64)};
const info={manifest:{name:'@xuanyi-king/dsh-theme-gallery',version:'0.3.21'},build,artifactValid:true,source:{kind:'link'},runtimeVersion:'0.2.1-alpha.1'};
// Windows only permits symlinks with Developer Mode or elevation; the tests that
// need them assert a capability, so skip there instead of reporting a false failure.
const symlinkSkip = await (async () => { const dir=await mkdtemp(join(tmpdir(),'gallery-symlink-')); try { await symlink(process.cwd(),join(dir,'link')); return false; } catch { return 'this platform does not permit creating symlinks'; } finally { await rm(dir,{recursive:true,force:true}); } })();
test('only authenticated Connection routes are registered; requests never install anything',async()=>{
  const home=await mkdtemp(join(tmpdir(),'gallery-handler-'));try{
    await mkdir(join(home,'dsh-theme-gallery'));await writeFile(join(home,'dsh-theme-gallery','selection.json'),'{"themeId":"gallery-wang-lin"}');
    let release,calls=0;const handler=createUpdateHandler({home,info:async()=>info,check:()=>{calls++;return new Promise(r=>{release=r})}});
    const req=(path,body)=>new Request('http://localhost/api/dsh-theme-gallery/update/'+path,{method:body===undefined?'GET':'POST',body:body===undefined?undefined:JSON.stringify(body)});
    const pending=handler.fetch(req('check',{}));await new Promise(r=>setTimeout(r,0));assert.equal((await handler.fetch(req('check',{}))).status,409);assert.equal(calls,1);
    release({version:'0.3.22',commit:'a'.repeat(40),build,channel:'commit'});assert.equal((await pending).status,200);
    assert.equal((await handler.fetch(req('install',{}))).status,404);
    assert.equal((await handler.fetch(req('backup',{client:build,configuration:{selection:'gallery-wang-lin',visual:'{"fade":15}'}}))).status,200);
    assert.equal(await readFile(join(home,'dsh-theme-gallery','selection.json'),'utf8'),'{"themeId":"gallery-wang-lin"}');
    handler.dispose();assert.equal((await handler.fetch(req('check',{}))).status,503);
  }finally{await rm(home,{recursive:true,force:true})}
});
test('network and disconnected/unloaded checks leave no installation mutation or success receipt',async()=>{
  const handler=createUpdateHandler({info:async()=>info,check:async()=>{throw Error('offline')}});
  const answer=await handler.fetch(new Request('http://localhost/api/dsh-theme-gallery/update/check',{method:'POST',body:'{}'}));assert.equal(answer.status,502);assert.equal((await answer.json()).status,'failed');handler.dispose();
});

test('cancelled Host operation cannot return a stale successful check after plugin unload',async()=>{
 let resolve;const handler=createUpdateHandler({info:async()=>info,check:()=>new Promise(r=>{resolve=r})});
 const pending=handler.fetch(new Request('http://localhost/api/dsh-theme-gallery/update/check',{method:'POST',body:'{}'}));await new Promise(r=>setTimeout(r,0));handler.dispose();resolve({version:'0.3.21',build,commit:'a'.repeat(40),channel:'commit'});const response=await pending;assert.equal(response.status,503);assert.equal((await response.json()).status,'unknown');
});

test('runtime source identity rejects another loaded directory and internal source links',{skip:symlinkSkip},async()=>{
 const {readRuntimeInfo}=await import('../lib/update-host.js');
 const {symlink}=await import('node:fs/promises');
 const home=await mkdtemp(join(tmpdir(),'gallery-source-'));try{
  const profile=join(home,'profile');await mkdir(join(profile,'node_modules'),{recursive:true});
  await writeFile(join(profile,'package.json'),JSON.stringify({dependencies:{'dsh-theme-gallery':'github:Xuanyi-king/dsh-theme-gallery'}}));
  const source=join(profile,'source');await symlink(process.cwd(),source);await symlink(source,join(profile,'node_modules','dsh-theme-gallery'));
  const ctx={profileContext:{dir:profile,home,installAnchor:join(profile,'package.json'),name:'test'},pluginManager:{listPlugins:async()=>[]}};
  const actual=await readRuntimeInfo(ctx,{directory:process.cwd()});assert.equal(actual.source.kind,'link');assert.equal(actual.source.commit,null);
  const separate=join(home,'separate');await mkdir(join(separate,'lib'),{recursive:true});await writeFile(join(separate,'package.json'),JSON.stringify({name:'dsh-theme-gallery',version:'0.3.21'}));await writeFile(join(separate,'lib','client.js'),'');
  const mismatch=await readRuntimeInfo(ctx,{directory:separate});assert.equal(mismatch.source.kind,'unknown');assert.equal(mismatch.source.commit,null);
 }finally{await rm(home,{recursive:true,force:true})}
});
test('saved target and exact configuration are verified after handler restart, never caller flags alone',async()=>{
 const home=await mkdtemp(join(tmpdir(),'gallery-verify-'));try{
  await mkdir(join(home,'dsh-theme-gallery'));await writeFile(join(home,'dsh-theme-gallery','selection.json'),'{"themeId":"gallery-wang-lin","future":1}');
  const local={...info,diskBuild:build,entries:[{enabled:true,fiberPhase:'active'}]};
  const target={version:build.version,commit:'a'.repeat(40),build,artifactValid:true,channel:'commit'};
  const req=(operation,body)=>new Request('http://localhost/api/dsh-theme-gallery/update/'+operation,{method:'POST',body:JSON.stringify(body)});
  const configuration={selection:'gallery-wang-lin',visual:'{"fade":25,"sidebarOpacity":60,"blur":2,"contrast":120}'};
  let handler=createUpdateHandler({home,info:async()=>local,check:async()=>target});
  await handler.fetch(req('check',{client:build}));
  const saved=await (await handler.fetch(req('backup',{client:build,configuration}))).json();handler.dispose();
  handler=createUpdateHandler({home,info:async()=>local});
  const body={client:build,baselineId:saved.baseline.id,configuration,registration:{main:true,sidebar:true,resources:true,appearance:true}};
  assert.equal((await (await handler.fetch(req('verify',body))).json()).status,'success');
  assert.equal((await (await handler.fetch(req('verify',{...body,baselineId:null}))).json()).status,'unknown');
  assert.equal((await (await handler.fetch(req('verify',{...body,configuration:{...configuration,visual:'changed'}}))).json()).status,'rollback-required');
  await writeFile(join(home,'dsh-theme-gallery','selection.json'),'changed');
  assert.equal((await (await handler.fetch(req('verify',body))).json()).failureStage,'configuration-changed');handler.dispose();
 }finally{await rm(home,{recursive:true,force:true})}
});
test('unload during baseline filesystem reads cannot return successful verification',async()=>{
 const home=await mkdtemp(join(tmpdir(),'gallery-unload-'));try{
  await mkdir(join(home,'dsh-theme-gallery'));
  const {saveBaseline}=await import('../lib/update-core.js');
  const saved=await saveBaseline(home,{configuration:{},target:{version:build.version,build,artifactValid:true},client:build});
  const local={...info,diskBuild:build,entries:[{enabled:true,fiberPhase:'active'}]};let handler;
  handler=createUpdateHandler({home,info:async()=>{setImmediate(()=>handler.dispose());return local}});
  const response=await handler.fetch(new Request('http://localhost/api/dsh-theme-gallery/update/verify',{method:'POST',body:JSON.stringify({client:build,baselineId:saved.id,configuration:{},registration:{main:true,sidebar:true,resources:true,appearance:true}})}));
  assert.equal(response.status,503);assert.equal((await response.json()).status,'unknown');
 }finally{await rm(home,{recursive:true,force:true})}
});
test('Windows cross-drive junction paths are never ordinary pnpm store paths',async()=>{
 const {isPnpmStorePath}=await import('../lib/update-host.js');const {win32}=await import('node:path');
 assert.equal(isPnpmStorePath('C:\\profile\\node_modules\\.pnpm','D:\\source',win32),false);
 assert.equal(isPnpmStorePath('C:\\profile\\node_modules\\.pnpm','C:\\profile\\source',win32),false);
 assert.equal(isPnpmStorePath('C:\\profile\\node_modules\\.pnpm','C:\\profile\\node_modules\\.pnpm\\gallery\\node_modules\\dsh-theme-gallery',win32),true);
});
test('read-only runtime info remains available while a background GitHub check is pending',async()=>{
 let resolve;const handler=createUpdateHandler({info:async()=>info,check:()=>new Promise(r=>{resolve=r})});
 const pending=handler.fetch(new Request('http://localhost/api/dsh-theme-gallery/update/check',{method:'POST',body:'{}'}));await new Promise(r=>setTimeout(r,0));
 const runtime=await handler.fetch(new Request('http://localhost/api/dsh-theme-gallery/update/info'));
 assert.equal(runtime.status,200);assert.equal((await runtime.json()).info.build.version,'0.3.21');
 resolve({version:'0.3.21',build,artifactValid:true,channel:'commit',commit:'a'.repeat(40)});await pending;handler.dispose();
});
test('scoped install path resolves and the pre-rename path keeps working',{skip:symlinkSkip},async()=>{
 const {readRuntimeInfo}=await import('../lib/update-host.js');
 const {symlink}=await import('node:fs/promises');
 for(const [name,segments] of [['@xuanyi-king/dsh-theme-gallery',['@xuanyi-king','dsh-theme-gallery']],['dsh-theme-gallery',['dsh-theme-gallery']]]){
  const home=await mkdtemp(join(tmpdir(),'gallery-scoped-'));try{
   const profile=join(home,'profile'),outer=segments.slice(0,-1);
   await mkdir(outer.length?join(profile,'node_modules',...outer):join(profile,'node_modules'),{recursive:true});
   await writeFile(join(profile,'package.json'),JSON.stringify({dependencies:{[name]:'github:Xuanyi-king/dsh-theme-gallery'}}));
   const source=join(profile,'source');await symlink(process.cwd(),source);await symlink(source,join(profile,'node_modules',...segments));
   const ctx={profileContext:{dir:profile,home,installAnchor:join(profile,'package.json'),name:'test'},pluginManager:{listPlugins:async()=>[]}};
   const actual=await readRuntimeInfo(ctx,{directory:process.cwd()});
   assert.equal(actual.source.kind,'link',name);assert.equal(actual.source.commit,null,name);
  }finally{await rm(home,{recursive:true,force:true})}
 }
});
