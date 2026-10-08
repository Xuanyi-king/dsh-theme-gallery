// Optional real-Host acceptance. Run only against an explicitly isolated test Profile.
// Browser tooling is external to the plugin and never part of its installation package.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CATALOG} from '../src/catalog.mjs';
const {DSH_CENTER_BROWSER_TOOLS:tools,DSH_CENTER_HOST_LOG:logPath,DSH_CENTER_TEST_HOME:home}=process.env;
if(!tools||!logPath||!home||process.env.DSH_CENTER_ISOLATED!=='1')throw Error('Set browser tools, isolated Host log/home, and DSH_CENTER_ISOLATED=1; never target a production Profile.');
const requireTool=createRequire(join(tools,'package.json'));
const {chromium}=requireTool('playwright');
const url=(await readFile(logPath,'utf8')).match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[\w-]+/)?.[0];
if(!url)throw Error('Test Host authentication URL unavailable');
const output=process.env.DSH_CENTER_SCREENSHOTS??'/tmp/dsh-theme-center-screenshots';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.DSH_CENTER_CHROMIUM??'/usr/bin/chromium',headless:true});
const errors=[],passed=[];
const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN'});
const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
const mark=label=>{passed.push(label);console.log('PASS '+label)};
async function dismiss(){
 for(const name of ['继续','稍后配置','跳过']){
  const button=page.getByRole('button',{name,exact:true});await button.waitFor({state:'visible',timeout:1200}).catch(()=>{});if(await button.isVisible()){
   if(name==='跳过')await button.click({timeout:1000}).catch(async error=>{if(await page.locator('.dsh-gallery-intro').count())throw error});
   else await button.click();
  }
 }
}
const center=()=>page.getByRole('button',{name:/^(主题|Themes)$/});
const defaultCard=()=>page.locator('.dsh-gallery-card[data-theme="system"]');
try{
 await page.goto(url,{waitUntil:'networkidle'});await dismiss();
 // The official in-page-picker overlay allows a reproducible Linux test workspace.
 const add=page.getByRole('button',{name:'添加工作区',exact:true});
 if(await add.isVisible()){
  await add.click();await page.getByRole('button',{name:'编辑路径',exact:true}).click();
  const input=page.getByRole('textbox',{name:'编辑路径',exact:true});await input.fill(fileURLToPath(new URL('../',import.meta.url)));await input.press('Enter');
  await page.getByRole('button',{name:'打开',exact:true}).click();
 }
 await center().click();await page.locator('.dsh-gallery-page').waitFor();
 assert.equal(await center().count(),1);assert.equal(await page.locator('.dsh-gallery-card').count(),14);
 const native=await page.locator('nav[aria-label]').filter({has:center()}).getByRole('button').allTextContents();
 assert.equal(native.indexOf('主题'),native.indexOf('插件')+1);mark('native single sidebar entry below Plugins and 14 cards');
 const runtime=await page.evaluate(async()=>{const response=await fetch('/api/dsh-theme-gallery/update/info');return response.json()});
 assert.equal(runtime.info.runtimeVersion,process.env.DSH_CENTER_EXPECT_RUNTIME??'0.2.1-alpha.1');
 assert.equal(runtime.info.build.version,'0.3.21');assert.equal(runtime.info.artifactValid,true);
 assert.equal(runtime.info.entries.length,1);assert.equal(runtime.info.entries[0].fiberPhase,'active');assert.equal(runtime.info.entries[0].enabled,true);
 const unauthorized=await fetch(new URL('/api/dsh-theme-gallery/update/info',url));assert.ok([401,403].includes(unauthorized.status));mark('actual Host/client artifact, active entry, runtime identity and authenticated API');
 for(const item of CATALOG){
  await page.locator(`.dsh-gallery-card[data-theme="${item.id}"]`).click();
  await page.waitForFunction(slug=>document.body.getAttribute('data-dsh-gallery-theme')===slug,item.slug);
  await page.getByRole('button',{name:'插件',exact:true}).click();
  assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),item.slug);
  await center().click();assert.equal(await page.locator(`.dsh-gallery-card[data-theme="${item.id}"]`).getAttribute('aria-pressed'),'true');
 }
 mark('all 11 themes switch instantly and remain active with center unmounted');
 const ranges=page.locator('.dsh-gallery-controls input[type="range"]');assert.equal(await ranges.count(),4);
 for(const [index,value] of [25,60,2,120].entries()){
  await ranges.nth(index).focus();await ranges.nth(index).press('Home');for(let i=Number(await ranges.nth(index).getAttribute('min'));i<value;i++)await ranges.nth(index).press('ArrowRight');
 }
 const visuals=await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.themeGallery.visual')));
 assert.deepEqual(visuals,{fade:25,sidebarOpacity:60,blur:2,contrast:120});mark('four native range controls update and persist browser configuration');
 await defaultCard().click();assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),null);
 assert.equal(await ranges.nth(0).isDisabled(),true);mark('DSH default restores native appearance and disables gallery adjustments');
 await page.locator('.dsh-gallery-card[data-theme="gallery-wang-lin"]').click();
 const collapse=page.getByRole('button',{name:'收起侧边栏',exact:true});if(await collapse.isVisible())await collapse.click();
 await center().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.dsh-gallery-page').count(),1);
 assert.equal(await center().getAttribute('aria-current'),'page');mark('collapsed sidebar icon remains keyboard accessible with native current state');
 await page.getByRole('button',{name:'检查更新',exact:true}).click();
 await page.waitForFunction(()=>!['checking','preflight','verifying'].includes(document.querySelector('[data-update-status]')?.getAttribute('data-update-status')));
 assert.notEqual(await page.locator('[data-update-status]').getAttribute('data-update-status'),'success');
 await page.getByRole('button',{name:'查看兼容性',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-update-status]')?.getAttribute('data-update-status')!=='preflight');
 assert.ok(['incompatible','unsupported','unknown'].includes(await page.locator('[data-update-status]').getAttribute('data-update-status')));
 await page.getByRole('button',{name:'保存恢复基线',exact:true}).click();await page.getByRole('button',{name:'下载恢复基线',exact:true}).waitFor();
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'下载恢复基线',exact:true}).click()]);await download.saveAs(join(output,'recovery-baseline.json'));
 const baseline=JSON.parse(await readFile(join(output,'recovery-baseline.json'),'utf8'));assert.equal(baseline.configuration.selection,'gallery-wang-lin');assert.deepEqual(JSON.parse(baseline.configuration.visual),visuals);
 assert.equal(baseline.selectionRaw,await readFile(join(home,'dsh-theme-gallery','selection.json'),'utf8'));
 await page.getByRole('button',{name:'重新验证运行状态',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-update-status]')?.getAttribute('data-update-status')!=='verifying');
 mark('real update check, owned baseline export and honest runtime verification action');
 await page.getByRole('button',{name:'打开 DSH 插件详情',exact:true}).click();assert.equal(await page.locator('.dsh-gallery-page').count(),0);assert.ok((await page.locator('body').innerText()).includes('dsh-theme-gallery'));await center().click();mark('official pluginNavigation opens this bundle without installation');
 await page.getByRole('button',{name:'打开 DSH 插件详情',exact:true}).click();
 const enabled=page.getByRole('switch',{name:/启用 dsh-theme-gallery/});await enabled.click();
 await page.waitForFunction(()=>document.querySelector('[role="switch"][aria-label*="dsh-theme-gallery"]')?.getAttribute('aria-checked')==='false');
 await center().waitFor({state:'detached'});assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),null);
 const unloaded=await page.evaluate(async()=>{const response=await fetch('/api/dsh-theme-gallery/update/info');return response.status});assert.equal(unloaded,404);
 await enabled.click();await page.waitForFunction(()=>document.querySelector('[role="switch"][aria-label*="dsh-theme-gallery"]')?.getAttribute('aria-checked')==='true');await center().waitFor();await center().click();assert.equal(await center().count(),1);
 await page.waitForFunction(()=>document.body.getAttribute('data-dsh-gallery-theme')==='wang-lin');mark('native disable/enable releases routes, theme effects and navigation, then restores exactly one entry');
 const expand=page.getByRole('button',{name:'打开侧边栏',exact:true});if(await expand.isVisible()){await expand.click();await page.waitForTimeout(400)}
 await page.locator('.dsh-gallery-page').evaluate(element=>element.scrollTop=0);
 await page.screenshot({path:join(output,'theme-center-updates.png'),fullPage:false});
 await page.locator('.dsh-gallery-card[data-theme="gallery-wang-lin"]').scrollIntoViewIfNeeded();
 await page.screenshot({path:join(output,'theme-center-desktop.png'),fullPage:false});
 for(const width of [390,320]){
  await page.setViewportSize({width,height:850});await page.waitForTimeout(300);
  const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(metrics.scroll<=metrics.width,JSON.stringify(metrics));
  assert.ok(await center().isVisible());await page.screenshot({path:join(output,`theme-center-${width}.png`)});
 }
 mark('real Web narrow viewports 390px and 320px without document overflow');
 await page.setViewportSize({width:1440,height:1000});await page.reload({waitUntil:'networkidle'});await dismiss();await center().click();
 assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),'wang-lin');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.themeGallery.visual'))),visuals);mark('hard reload restores theme and all four adjustments');
 await context.storageState({path:join(output,'browser-state.json')});
 const english=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US'});
 const ep=await english.newPage();ep.on('pageerror',error=>errors.push(error.message));await ep.goto(url,{waitUntil:'networkidle'});
 for(const name of ['Continue','Configure later','Skip']){const button=ep.getByRole('button',{name,exact:true});await button.waitFor({state:'visible',timeout:1200}).catch(()=>{});if(await button.isVisible()){if(name==='Skip')await button.click({timeout:1000}).catch(async error=>{if(await ep.locator('.dsh-gallery-intro').count())throw error});else await button.click()}}
 await ep.getByRole('button',{name:'Themes',exact:true}).click();assert.equal(await ep.locator('.dsh-gallery-card').count(),14);
 assert.ok(await ep.getByRole('button',{name:'Check for updates',exact:true}).isVisible());
 await ep.screenshot({path:join(output,'theme-center-english.png')});await english.close();mark('real English navigation and update actions');
 assert.deepEqual(errors,[]);mark('no real browser pageerror');
 await writeFile(join(output,'result.json'),JSON.stringify({runtime:runtime.info.runtimeVersion,version:runtime.info.build.version,source:runtime.info.source.kind,artifactValid:runtime.info.artifactValid,active:runtime.info.entries[0].fiberPhase,passed,errors,platform:'Linux Chromium / real DSH Web; not Windows Desktop'},null,2)+'\n');
}finally{await browser.close()}
