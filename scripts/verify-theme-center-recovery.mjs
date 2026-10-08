// Real isolated-Profile recovery rehearsal. Never installs/uninstalls a package.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join} from 'node:path';
const {DSH_CENTER_BROWSER_TOOLS:tools,DSH_CENTER_HOST_LOG:logPath,DSH_CENTER_TEST_HOME:home,DSH_CENTER_SCREENSHOTS:output,DSH_CENTER_RECOVERY_PHASE:phase}=process.env;
if(!tools||!logPath||!home||!output||process.env.DSH_CENTER_ISOLATED!=='1'||!['prepare','verify'].includes(phase))throw Error('Explicit isolated test Profile, output and prepare/verify phase required.');
const {chromium}=createRequire(join(tools,'package.json'))('playwright');
const baseline=JSON.parse(await readFile(join(output,'recovery-baseline.json'),'utf8'));
const url=(await readFile(logPath,'utf8')).match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[\w-]+/)?.[0];if(!url)throw Error('Test auth URL unavailable');
const browser=await chromium.launch({executablePath:process.env.DSH_CENTER_CHROMIUM??'/usr/bin/chromium'});
try{
 const context=await browser.newContext({storageState:join(output,'browser-state.json'),viewport:{width:1440,height:1000},locale:'zh-CN'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});
 const opening=page.locator('.dsh-gallery-intro');
 await opening.waitFor({state:'visible',timeout:1600}).catch(()=>{});
 await opening.waitFor({state:'detached',timeout:7000});
 for(const name of ['继续','稍后配置']){const button=page.getByRole('button',{name,exact:true});await button.waitFor({state:'visible',timeout:2500}).catch(()=>{});if(await button.isVisible())await button.click()}
 await page.getByRole('button',{name:'主题',exact:true}).click();
 if(phase==='prepare'){
  await page.locator('.dsh-gallery-card[data-theme="gallery-shanhe"]').click();
  await page.waitForFunction(()=>localStorage.getItem('dsh.themeGallery.selection')==='gallery-shanhe');
  // Wait for the actual Host write before restoring the baseline's original bytes.
  for(let i=0;i<30;i++){if((await readFile(join(home,'dsh-theme-gallery','selection.json'),'utf8')).includes('gallery-shanhe'))break;await page.waitForTimeout(100)}
  const range=page.locator('.dsh-gallery-controls input[type="range"]').first();await range.focus();await range.press('Home');
  assert.notEqual(await page.evaluate(()=>localStorage.getItem('dsh.themeGallery.visual')),baseline.configuration.visual);
  // Restore only the two owned browser keys and the owned selection file; keep the backup.
  await page.evaluate(configuration=>{for(const [key,value] of [['dsh.themeGallery.selection',configuration.selection],['dsh.themeGallery.visual',configuration.visual]]){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}},baseline.configuration);
  await writeFile(join(home,'dsh-theme-gallery','selection.json'),baseline.selectionRaw);
  await context.storageState({path:join(output,'browser-state.json')});
  console.log('PASS isolated failure simulation changed theme/sliders; original owned bytes restored; backup retained');
 }else{
  assert.equal(await page.locator('body').getAttribute('data-dsh-gallery-theme'),'wang-lin');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.themeGallery.visual'))),JSON.parse(baseline.configuration.visual));
  assert.equal(await readFile(join(home,'dsh-theme-gallery','selection.json'),'utf8'),baseline.selectionRaw);
  const info=await page.evaluate(async()=> (await (await fetch('/api/dsh-theme-gallery/update/info')).json()).info);
  assert.equal(info.runtimeVersion,'0.2.1-alpha.1');assert.equal(info.entries[0].fiberPhase,'active');assert.equal(info.artifactValid,true);
  assert.equal(await page.getByRole('button',{name:'主题',exact:true}).count(),1);assert.deepEqual(errors,[]);
  console.log('PASS actual cold Host restart restores Wang Lin, four sliders, exact owned selection bytes and active unique navigation');
 }
}finally{await browser.close()}
