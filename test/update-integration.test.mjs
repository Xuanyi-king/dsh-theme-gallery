import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createUpdateHandler} from '../lib/update-host.js';

test('real HTTP failure injection preserves installation and all owned/other configuration bytes',async()=>{
 const home=await mkdtemp(join(tmpdir(),'gallery-http-'));
 const files={'install/client.js':'original bundle','install/package.json':'original manifest','dsh-theme-gallery/selection.json':'{"themeId":"gallery-wang-lin","extra":true}\n','other-plugin/config.json':'{"secret":"untouched"}'};
 let handler,server;
 try{
  for(const [path,text] of Object.entries(files)){await mkdir(join(home,path.split('/')[0]),{recursive:true});await writeFile(join(home,path),text)}
  const build={version:'0.3.21',fingerprint:'f'.repeat(64)};
  const info={build,diskBuild:build,manifest:{version:build.version},artifactValid:true,source:{kind:'link'}};
  handler=createUpdateHandler({home,info:async()=>info,check:async()=>{throw Error('injected network loss')}});
  server=createServer(async(req,res)=>{
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const request=new Request('http://127.0.0.1/api/dsh-theme-gallery/update/'+req.url.slice(1),{method:req.method,...(req.method==='GET'?{}:{body:Buffer.concat(chunks)})});
   const answer=await handler.fetch(request);res.writeHead(answer.status,Object.fromEntries(answer.headers));res.end(await answer.text());
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/`;
  for(const operation of ['check','install','upgrade','uninstall']){
   const response=await fetch(url+operation,{method:'POST',body:JSON.stringify({client:build})});
   assert.ok([404,502].includes(response.status));assert.notEqual((await response.json()).status,'success');
  }
  const backup=await fetch(url+'backup',{method:'POST',body:JSON.stringify({client:build,configuration:{selection:'gallery-wang-lin',visual:'{"fade":25}'}})});
  assert.equal(backup.status,200);
  handler.dispose();assert.equal((await fetch(url+'check',{method:'POST',body:'{}'})).status,503);
  for(const [path,text] of Object.entries(files))assert.equal(await readFile(join(home,path),'utf8'),text);
 }finally{handler?.dispose();if(server)await new Promise(resolve=>server.close(resolve));await rm(home,{recursive:true,force:true})}
});
