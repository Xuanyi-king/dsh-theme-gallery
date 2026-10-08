import test from 'node:test';import assert from 'node:assert/strict';
import {createUpdateController} from '../src/update-client.mjs';
const client={version:'0.3.21',fingerprint:'f'.repeat(64)};
const ok=value=>({ok:true,status:200,json:async()=>value});
test('read-only checking does not install; page subscriptions have no ownership of requests',async()=>{
 const calls=[];let settle;const controller=createUpdateController({client,fetchImpl:async(path,init)=>{calls.push(path);if(path.endsWith('/info'))return ok({info:{build:client}});return new Promise(r=>{settle=r})}});
 const off=controller.subscribe(()=>{});const pending=controller.check();await new Promise(r=>setTimeout(r,0));off();assert.equal(controller.getSnapshot().status,'checking');assert.equal(await controller.check(),false);settle(ok({status:'available',target:{version:'0.3.22'}}));await pending;assert.equal(controller.getSnapshot().status,'available');assert.deepEqual(calls,['/api/dsh-theme-gallery/update/info','/api/dsh-theme-gallery/update/check']);controller.dispose();
});
test('timeout, transport loss, cancel and plugin unload never become success',async()=>{
 for(const failure of ['offline','timeout','cancel','unload']){
  const controller=createUpdateController({client,timeoutMs:10,fetchImpl:failure==='offline'?async()=>{throw Error('offline')}:()=>new Promise(()=>{})});
  const pending=controller.check();if(failure==='cancel')controller.cancel();if(failure==='unload')controller.dispose();await pending;assert.ok(['failed','unknown'].includes(controller.getSnapshot().status));assert.notEqual(controller.getSnapshot().status,'success');controller.dispose();
 }
});
test('preflight unsupported opens only official native navigation and protects browser config',async()=>{
 const data=new Map([['dsh.themeGallery.selection','gallery-wang-lin'],['dsh.themeGallery.visual','{"fade":25,"sidebarOpacity":60,"blur":2,"contrast":120}'],['other-plugin','same']]);let opened=0;
 const storage={getItem:k=>data.get(k)??null};
 const controller=createUpdateController({client,storage,navigate:()=>opened++,fetchImpl:async(path,init)=>{
  if(path.endsWith('info'))return ok({info:{build:client}});
  if(path.endsWith('check'))return ok({status:'available',target:{version:'0.3.22'}});
  if(path.endsWith('preflight'))return ok({status:'unsupported',canInstall:false,checks:{executor:{status:'unsupported'}}});
  if(path.endsWith('backup')){const body=JSON.parse(init.body);assert.equal(body.configuration.visual,data.get('dsh.themeGallery.visual'));return ok({status:'ready',baseline:{id:'backup',record:body}})};
  throw Error('unexpected path');
 }});
 await controller.check();await controller.preflight();assert.equal(controller.getSnapshot().status,'unsupported');assert.equal(opened,0);assert.equal(controller.openManager(),true);assert.equal(opened,1);await controller.backup();assert.equal(controller.getSnapshot().status,'unsupported');assert.equal(controller.getSnapshot().baseline.id,'backup');assert.equal(data.get('other-plugin'),'same');controller.dispose();
});
test('fresh checks invalidate preflight details and send the actual Client build',async()=>{
 let failure=false;
 const controller=createUpdateController({client,fetchImpl:async(path,init)=>{
  if(path.endsWith('/info'))return ok({info:{build:client}});
  if(path.endsWith('/preflight'))return ok({status:'unsupported',checks:{executor:{status:'unsupported'}}});
  assert.deepEqual(JSON.parse(init.body).client,client);
  if(failure)throw Error('offline');return ok({status:'available',target:{version:'0.3.22'}});
 }});
 await controller.check();await controller.preflight();assert.ok(controller.getSnapshot().checks);failure=true;
 await controller.check();assert.equal(controller.getSnapshot().checks,null);assert.equal(controller.getSnapshot().target,null);controller.dispose();
});
