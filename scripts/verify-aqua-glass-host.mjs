// Real DSH Web acceptance. No installer; only run against an isolated test Profile.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CATALOG} from '../src/catalog.mjs';
const tools=process.env.DSH_CENTER_BROWSER_TOOLS,log=process.env.DSH_CENTER_HOST_LOG;
if(!tools||!log||process.env.DSH_CENTER_ISOLATED!=='1')throw Error('Explicit isolated Host log and external browser tooling required');
const {chromium}=createRequire(join(tools,'package.json'))('playwright');
const manifest=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const artifact=JSON.parse(await readFile(new URL('../lib/artifact.json',import.meta.url),'utf8'));
const output=process.env.DSH_CENTER_SCREENSHOTS??'/tmp/aqua-verification';await mkdir(output,{recursive:true});
const url=(await readFile(log,'utf8')).match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[\w-]+/)?.[0];if(!url)throw Error('No isolated Host URL');
const browser=await chromium.launch({executablePath:process.env.DSH_CENTER_CHROMIUM??'/usr/bin/chromium'});
const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],passed=[];page.on('pageerror',e=>errors.push(e.message));
const mark=name=>{passed.push(name);console.log('PASS '+name)};
async function dismiss(p=page,en=false){
 const intro=p.locator('.dsh-gallery-intro');await intro.waitFor({state:'visible',timeout:1200}).catch(()=>{});await intro.waitFor({state:'detached',timeout:7000});
 for(const name of en?['Continue','Configure later']:['继续','稍后配置']){const button=p.getByRole('button',{name,exact:true});await button.waitFor({state:'visible',timeout:1500}).catch(()=>{});if(await button.isVisible())await button.click()}
}
const center=()=>page.getByRole('button',{name:'主题',exact:true});
const toggle=()=>page.getByRole('switch',{name:'启动进场动画',exact:true});
const choose=id=>page.locator(`.dsh-gallery-card[data-theme="${id}"]`).click();
try{
 await page.goto(url,{waitUntil:'networkidle'});await dismiss();
 if(await page.locator('[data-row-key^="workspace:"]').count()===0){await page.getByRole('button',{name:'添加工作区',exact:true}).click();await page.getByRole('button',{name:'编辑路径',exact:true}).click();const input=page.getByRole('textbox',{name:'编辑路径',exact:true});await input.fill(fileURLToPath(new URL('../',import.meta.url)));await input.press('Enter');await page.getByRole('button',{name:'打开',exact:true}).click()}
 await center().click();assert.equal(await page.locator('.dsh-gallery-card').count(),15);
 const info=await page.evaluate(async()=>(await(await fetch('/api/dsh-theme-gallery/update/info')).json()).info);
 assert.equal(info.runtimeVersion,process.env.DSH_CENTER_EXPECT_RUNTIME??'0.2.1-alpha.2');assert.equal(info.manifest.version,manifest.version);assert.equal(info.artifactValid,true);assert.equal(info.build.fingerprint,artifact.fingerprint,'installed fixed artifact matches the tested working-tree build');assert.equal(info.entries.length,1);assert.equal(info.entries[0].fiberPhase,'active');
 for(const item of CATALOG){await choose(item.id);assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),item.slug)}
 mark('real active package and all twelve themes switch with fifteen native cards');
 await choose('gallery-aqua-glass');
 assert.equal(await toggle().count(),1);assert.equal(await toggle().isChecked(),true);
 await toggle().focus();await page.keyboard.press('Space');assert.equal(await toggle().isChecked(),false);
 assert.equal(await page.evaluate(()=>localStorage.getItem('dsh.themeGallery.startupIntro.enabled')),'false');
 await choose('system');assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),null);assert.equal(await page.locator('.dsh-gallery-controls input').first().isDisabled(),true);assert.equal(await toggle().isEnabled(),true);
 await choose('gallery-aqua-glass');await page.reload({waitUntil:'networkidle'});await dismiss();await center().click();assert.equal(await toggle().isChecked(),false);assert.equal(await page.locator('.dsh-gallery-intro').count(),0);assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),'aqua-glass');
 mark('global switch keyboard toggle, built-in accessibility and disabled reload persistence');
 await toggle().check();assert.equal(await page.locator('.dsh-gallery-intro').count(),0);
 await page.reload({waitUntil:'networkidle'});const intro=page.locator('.dsh-gallery-intro');await intro.waitFor({state:'visible'});assert.equal(await intro.getAttribute('data-intro-theme'),'aqua-glass');
 await page.waitForTimeout(700);await page.screenshot({path:join(output,'aqua-intro-desktop.png')});await page.keyboard.press('Escape');await intro.waitFor({state:'detached'});await dismiss();await center().click();
 mark('enabling does not replay; next startup uses Aqua artwork and Escape closes it');
 await toggle().uncheck();
 await toggle().scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'aqua-center.png')});
 await page.locator('.dsh-gallery-page').evaluate(n=>n.scrollTop=0);await page.screenshot({path:join(output,'aqua-updates.png')});
 await page.getByRole('button',{name:'新建会话',exact:true}).last().click();const editor=page.locator('[data-composer-input], [contenteditable="true"]').first();await editor.waitFor();await editor.fill('Aqua Glass input check · 输入可见');assert.ok((await editor.innerText()).includes('输入可见'));await editor.fill('');await page.screenshot({path:join(output,'aqua-home.png')});
 // Browser capability simulation: remove only the authored @supports group.
 const fallback=await page.evaluate(()=>{
  const sheet=document.getElementById('dsh-theme-gallery-style').sheet;
  const groups=[...sheet.cssRules].map((r,i)=>({r,i})).filter(({r})=>r.type===CSSRule.SUPPORTS_RULE&&r.conditionText.includes('backdrop-filter'));
  for(const {i} of groups.slice().reverse())sheet.deleteRule(i);
  const input=getComputedStyle(document.querySelector('[data-composer-card]'));
  const answer={background:input.backgroundColor,blur:input.backdropFilter};
  for(const {r,i} of groups)sheet.insertRule(r.cssText,i);return answer;
 });assert.equal(fallback.background,'rgb(23, 37, 58)');assert.equal(fallback.blur,'none');mark('opaque composer fallback survives simulated absence of backdrop support');
 if(process.env.DSH_AQUA_SCRIPTED==='1'){
  await editor.fill('请显示 Aqua Glass 的 Markdown 与代码可读性样例');await page.getByRole('button',{name:'发送消息',exact:true}).click();
  const running=page.locator('[data-chat-running][data-dsh-gallery-running]');await running.waitFor();
  assert.ok((await running.locator('[class*="runningContent"]').getAttribute('data-dsh-gallery-live-label')).includes('清晰思考'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('dsh.themeGallery.startupIntro.enabled')),'false');await page.screenshot({path:join(output,'aqua-streaming.png')});
  await page.locator('pre').waitFor();await running.waitFor({state:'detached',timeout:30000});
  assert.ok((await page.locator('pre').innerText()).includes('function greet'));
  const colors=await page.locator('pre span').evaluateAll(xs=>[...new Set(xs.map(x=>getComputedStyle(x).color))]);assert.ok(colors.length>=3,'native syntax highlighting retains distinct colors');
  assert.ok(await page.locator('[data-conversation-region="chat"] blockquote').count());assert.ok(await page.locator('[data-conversation-region="chat"] table').count());
  const header=page.locator('header[data-window-drag]:has([data-conversation-header-leading])');assert.equal(await header.evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(16, 28, 46, 0.94)','native title/tabs retain an opaque reading surface over the light wallpaper crest');
  const plane=await page.locator('[data-conversation-region="chat"]').evaluate(n=>({bg:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color,blur:getComputedStyle(n).backdropFilter}));
  assert.equal(plane.blur,'none');assert.ok(plane.bg.includes('0.97'),'reading plane stays high-opacity');
  await page.locator('pre').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'aqua-markdown-code.png')});
  const copy=page.locator('pre').locator('xpath=../../..').getByRole('button',{name:/^(复制|Copy)$/}).first();await copy.click();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('function greet'),'native code copy keeps the source text');
  await page.getByRole('button',{name:/选择模型/}).click();assert.ok(await page.getByRole('menu').count()||await page.getByRole('dialog').count()||await page.getByRole('listbox').count());await page.screenshot({path:join(output,'aqua-model-menu.png')});await page.keyboard.press('Escape');
  mark('scripted stream in native DSH renderer: status remains active with intro off; Markdown, code colors, long text and model menu');
 }
 for(const width of [390,320]){await page.setViewportSize({width,height:850});await page.waitForTimeout(450);const collapse=page.getByRole('button',{name:'收起侧边栏',exact:true});if(await collapse.isVisible())await collapse.click({timeout:1500}).catch(async error=>{if(!await page.getByRole('button',{name:'打开侧边栏',exact:true}).isVisible())throw error});await page.waitForTimeout(300);
  const size=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(size.actual<=size.viewport,JSON.stringify(size));await page.screenshot({path:join(output,`aqua-chat-${width}.png`)});
  await center().click();await toggle().scrollIntoViewIfNeeded();assert.equal(await toggle().isVisible(),true);await page.screenshot({path:join(output,`aqua-center-${width}.png`)});
  await page.reload({waitUntil:'networkidle'});await dismiss();if(process.env.DSH_AQUA_SCRIPTED==='1')await page.locator('pre').waitFor();
 }
 mark('390px and 320px real Host conversation and center stay within the viewport');
 const english=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US'});const ep=await english.newPage();ep.on('pageerror',e=>errors.push(e.message));await ep.goto(url,{waitUntil:'networkidle'});await dismiss(ep,true);await ep.getByRole('button',{name:'Themes',exact:true}).click();assert.equal(await ep.getByRole('switch',{name:'Startup intro animation',exact:true}).count(),1);await ep.getByRole('switch',{name:'Startup intro animation',exact:true}).scrollIntoViewIfNeeded();await ep.screenshot({path:join(output,'aqua-english.png')});await english.close();
 mark('English gallery and global preference label');
 await page.setViewportSize({width:1440,height:1000});await center().click();
 const ranges=page.locator('.dsh-gallery-controls input[type="range"]');assert.equal(await ranges.count(),4);
 for(const [index,value] of [25,60,2,120].entries()){
  await ranges.nth(index).focus();await ranges.nth(index).press('Home');for(let i=Number(await ranges.nth(index).getAttribute('min'));i<value;i++)await ranges.nth(index).press('ArrowRight');
 }
 const visuals=await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.themeGallery.visual')));assert.deepEqual(visuals,{fade:25,sidebarOpacity:60,blur:2,contrast:120});
 await page.reload({waitUntil:'networkidle'});await dismiss();await center().click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.themeGallery.visual'))),visuals);assert.equal(await toggle().isChecked(),false);
 await page.getByRole('button',{name:'保存恢复基线',exact:true}).waitFor({state:'visible'});
 await page.waitForFunction(n=>!n.disabled,await page.getByRole('button',{name:'保存恢复基线',exact:true}).elementHandle());
 const backup=page.getByRole('button',{name:'保存恢复基线',exact:true});await backup.click();const downloadButton=page.getByRole('button',{name:'下载恢复基线',exact:true});await downloadButton.waitFor();
 const [download]=await Promise.all([page.waitForEvent('download'),downloadButton.click()]);await download.saveAs(join(output,'recovery-baseline.json'));
 const baseline=JSON.parse(await readFile(join(output,'recovery-baseline.json'),'utf8'));assert.equal(baseline.configuration.startupIntro,'false');assert.equal(baseline.configuration.selection,'gallery-aqua-glass');assert.deepEqual(JSON.parse(baseline.configuration.visual),visuals);
 mark('four keyboard sliders persist across reload; exported recovery baseline includes disabled intro and original configuration');
 await page.getByRole('button',{name:'打开 DSH 插件详情',exact:true}).click();const enabled=page.getByRole('switch',{name:/启用 .*dsh-theme-gallery/});await enabled.click();
 await page.waitForFunction(()=>document.querySelector('[role="switch"][aria-label*="dsh-theme-gallery"]')?.getAttribute('aria-checked')==='false');await center().waitFor({state:'detached'});
 assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),null);assert.equal(await page.locator('#dsh-theme-gallery-style').count(),0);assert.equal(await page.locator('.dsh-gallery-intro').count(),0);
 assert.equal(await page.evaluate(async()=>(await fetch('/api/dsh-theme-gallery/update/info')).status),404);
 await enabled.click();await center().waitFor();await center().click();await page.waitForFunction(()=>document.body.getAttribute('data-dsh-gallery-theme')==='aqua-glass');assert.equal(await center().count(),1);assert.equal(await toggle().isChecked(),false);assert.equal(await page.locator('.dsh-gallery-intro').count(),0);
 mark('native disable/enable removes styles, routes, intro and navigation; reactivation restores theme and disabled preference once');
 await context.storageState({path:join(output,'browser-state.json')});assert.deepEqual(errors,[]);
 await writeFile(join(output,'result.json'),JSON.stringify({version:manifest.version,fingerprint:artifact.fingerprint,runtime:info.runtimeVersion,platform:'Linux Chromium / real DSH Web',scriptedContent:process.env.DSH_AQUA_SCRIPTED==='1',passed,errors,notTested:['Windows Desktop/WebView','real paid model responses','other DSH versions outside tested matrix']},null,2)+'\n');
}finally{await browser.close()}
