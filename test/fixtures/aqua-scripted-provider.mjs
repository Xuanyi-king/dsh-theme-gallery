// Test-only, keyless adapter using DSH's public LlmAdapter contract. Never packed.
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
if(process.env.DSH_AQUA_ISOLATED!=='1'||!process.env.DSH_AQUA_TEST_RUNTIME)throw Error('Explicit isolated Aqua test runtime required');
// DSH discovers Client modules by the nearest package manifest. Run a COPY
// under a separate private lab manifest, never insert this repository path.
for(let directory=dirname(fileURLToPath(import.meta.url));;directory=dirname(directory)){
 let manifest;try{manifest=JSON.parse(await readFile(join(directory,'package.json'),'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 if(manifest){if(manifest.dsh?.client)throw Error('Copy this test fixture under an independent private manifest without dsh.client before loading it');break}
 if(dirname(directory)===directory)throw Error('An independent private test manifest is required');
}
const requireRuntime=createRequire(process.env.DSH_AQUA_TEST_RUNTIME);
const {LlmAdapter}=await import(pathToFileURL(requireRuntime.resolve('@deepseek-ai/dsh-llm')).href);
class AquaScriptedAdapter extends LlmAdapter {
 async resolveModel(provider,model){return{provider,id:model,name:'Aqua visual test (scripted)',reasoning:{efforts:[{id:'off',name:'Off'}],defaultEffort:'off'}}}
 async *stream(options){
  const text='# 清晰阅读 · Clear thinking\n\n这是一条由隔离测试适配器生成的演示回复，用于核对 **正文与强调**、流式排版及原生控件。This is scripted test content, not a model response.\n\n## Markdown 与代码\n\n> 保持专注，也保持清晰。A reliable reading surface matters.\n\n1. 原生导航与输入保持可用。\n2. 列表、引用和 [链接](https://example.com) 保持可读。\n\n```javascript\nfunction greet(name) {\n  const message = `Hello, ${name}!`;\n  return { message, ready: true };\n}\nconsole.log(greet("Aqua Glass"));\n```\n\n内联代码 `const clarity = true` 与复制按钮不应被玻璃效果影响。\n\n| 检查 | 结果 |\n| --- | --- |\n| 正文 / text | 清晰 |\n| 代码 / code | 原生高亮 |\n\n'+('长文本用于验证换行与滚动。Long text remains stable while streaming. '.repeat(12));
  yield{type:'block-start',index:0,blockType:'text'};
  for(let i=0;i<text.length;i+=45){if(options.signal?.aborted)return;await new Promise(r=>setTimeout(r,110));yield{type:'text-delta',index:0,text:text.slice(i,i+45)}}
  yield{type:'block-end',index:0,block:{type:'text',text}};
  yield{type:'usage',usage:{inputTokens:20,outputTokens:400}};
  yield{type:'finish',reason:{kind:'stop'}};
 }
}
export const name='aqua-scripted-provider';
export const inject=['llm'];
export function apply(ctx){
 ctx.effect(()=>ctx.llm.registerAdapter(['aqua-scripted'],new AquaScriptedAdapter()));
 ctx.on('agent/request',async(_,next)=>({...await next(),provider:'aqua-scripted',model:'aqua-visual-test',reasoningEffort:'off'}));
}
