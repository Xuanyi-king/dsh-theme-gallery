// Optional browser verification against the shipped client, with real React.
// Tooling is external to the plugin: pass a directory containing playwright,
// react@18 and react-dom@18 via DSH_INTRO_BROWSER_TOOLS.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const tools = process.env.DSH_INTRO_BROWSER_TOOLS;
if (!tools) throw new Error('Set DSH_INTRO_BROWSER_TOOLS to your browser tooling directory.');
const requireTool = createRequire(join(tools, 'package.json'));
const { chromium } = requireTool('playwright');
const output = process.env.DSH_INTRO_SCREENSHOTS ?? '/tmp/dsh-shanhe-intro-preview';
await mkdir(output, { recursive: true });
const files = new Map([
  ['/react.js', await readFile(join(tools, 'node_modules/react/umd/react.production.min.js'))],
  ['/react-dom.js', await readFile(join(tools, 'node_modules/react-dom/umd/react-dom.production.min.js'))],
  ['/client.js', await readFile(new URL('../lib/client.js', import.meta.url))],
]);
const fixture = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>山河启动动画样板</title></head>
<body style="margin:0"><button id="background">背景控件</button>
<main data-pane="conversation" style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box">
  <div data-conversation-region="chat" data-content-phase="hero" style="width:100%;display:flex;justify-content:center">
    <div class="fixture_titleGroup"><span>有什么可以帮您？</span><span class="fixture_previewBadge">预览版</span></div>
  </div>
  <div data-conversation-region="composer" style="width:min(100%,900px);margin-top:36px">
    <div data-composer-card style="padding:20px;box-sizing:border-box">
      <div class="fixture_input" contenteditable="true" role="textbox" aria-label="输入消息" style="min-height:80px"></div>
      <div class="fixture_placeholder">给 DeepSeek 发送消息</div>
      <button id="send" onclick="this.dataset.sent='true'">发送</button>
    </div>
  </div>
</main><div id="settings" hidden></div><div id="overlay"></div>
<script src="/react.js"></script><script src="/react-dom.js"></script>
<script>
const params = new URLSearchParams(location.search);
localStorage.clear();
if (params.get('saved') !== 'none') localStorage.setItem('dsh.themeGallery.selection', params.get('saved') || 'gallery-shanhe');
window.openings = 0;
new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType === 1 && (node.matches('.dsh-gallery-intro') || node.querySelector('.dsh-gallery-intro'))) window.openings++;
  }
}).observe(document.body, { childList: true, subtree: true });
window.__ModuleLoader__ = { load(entry) { window.plugin = entry.factory(name => { if (name === 'react') return React; throw Error(name); }); } };
</script><script src="/client.js"></script><script>
let preference = 'system';
const definitions = new Map();
const listeners = new Set();
const effects = [];
const roots = [];
const ctx = {
  theme: {
    getTheme: () => ({ preference }),
    register(definition) { definitions.set(definition.id, definition); return () => definitions.delete(definition.id); },
    setTheme(id) { preference = id; for (const fn of listeners) fn({ preference }); },
  },
  on(name, fn) { listeners.add(fn); return () => listeners.delete(fn); },
  effect(fn) { effects.push(fn()); },
  locale: { register: () => () => {}, bind: () => key => ({ introSkip: '跳过', introHint: 'Esc 跳过 · 即将启程' }[key] || key) },
  slots: {
    inject(name, fn) { fn(); },
    register(descriptor, Component) {
      const root = ReactDOM.createRoot(document.getElementById(descriptor.name === 'shell.overlay' ? 'overlay' : 'settings'));
      roots.push(root);
      root.render(React.createElement(Component, { t: key => key }));
      return () => root.unmount();
    },
  },
};
document.getElementById('background').focus();
plugin.apply(ctx);
window.fixture = {
  select(id) { document.querySelector('[data-theme="' + id + '"]').click(); },
  dispose() { for (const fn of effects.reverse()) fn?.(); for (const root of roots) root.unmount(); },
};
</script></body></html>`;
// An offline, self-contained visual demo for human review, not an installable
// plugin. The demo's local Host response fixes the sample to Shanhe.
let offline = fixture
  .replace('localStorage.clear();', '')
  .replace("if (params.get('saved') !== 'none') localStorage.setItem('dsh.themeGallery.selection', params.get('saved') || 'gallery-shanhe');", '')
  .replace("let preference = 'system';", "window.fetch = async () => ({ ok: true, json: async () => ({ themeId: 'gallery-shanhe' }) }); let preference = 'system';")
  .replace('<button id="background">背景控件</button>', '<button id="background" onclick="location.reload()">重播山河开场</button>');
for (const [path, contents] of files) {
  offline = offline.replace(`<script src="${path}"></script>`, () => '<script>' + contents.toString().replaceAll('</script', '<\\/script') + '</script>');
}
const demoPath = join(output, 'shanhe-preview.html');
await writeFile(demoPath, offline);

const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  res.setHeader('cache-control', 'no-store');
  if (path === '/dsh-theme-gallery/selection') {
    res.setHeader('content-type', 'application/json');
    const params = new URL(req.headers.referer ?? 'http://localhost').searchParams;
    const themeId = params.get('host') ?? params.get('saved') ?? 'gallery-shanhe';
    if (req.method === 'PUT') { req.resume(); res.end('{}'); return; }
    setTimeout(() => res.end(JSON.stringify({ themeId: themeId === 'none' ? null : themeId })), 200);
  } else if (files.has(path)) {
    res.setHeader('content-type', 'text/javascript; charset=utf-8');
    res.end(files.get(path));
  } else if (path === '/') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(fixture);
  } else { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const failures = [];
const evidence = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.DSH_INTRO_BROWSER_EXECUTABLE || undefined });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await desktop.newPage();
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(base);
  const intro = page.locator('.dsh-gallery-intro');
  await intro.waitFor({ state: 'visible' });
  assert.equal(await intro.getAttribute('data-intro-theme'), 'shanhe');
  assert.equal(await page.locator(':focus').textContent(), '跳过');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').textContent(), '跳过', 'focus stays inside the opening');
  await page.waitForTimeout(1300);
  await page.screenshot({ path: join(output, 'shanhe-desktop.png') });
  const bounds = await intro.boundingBox();
  assert.deepEqual(bounds, { x: 0, y: 0, width: 1440, height: 900 });
  await intro.waitFor({ state: 'detached', timeout: 5000 });
  assert.equal(await page.locator(':focus').getAttribute('id'), 'background');
  await page.evaluate(() => { fixture.select('gallery-nezha'); fixture.select('gallery-shanhe'); });
  await page.waitForTimeout(300);
  assert.equal(await intro.count(), 0);
  assert.equal(await page.evaluate(() => openings), 1);
  evidence.push('desktop: frame coverage, focus trap, auto-close, focus restoration, no replay PASS');

  await page.reload();
  await intro.waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await intro.waitFor({ state: 'detached' });
  evidence.push('Escape dismissal PASS');
  await page.reload();
  await intro.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '跳过', exact: true }).click();
  await intro.waitFor({ state: 'detached' });
  evidence.push('Skip button PASS');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const phone = await mobile.newPage();
  phone.on('pageerror', error => failures.push(error.message));
  await phone.goto(base);
  await phone.locator('.dsh-gallery-intro').waitFor({ state: 'visible' });
  await phone.waitForTimeout(1300);
  await phone.screenshot({ path: join(output, 'shanhe-mobile.png') });
  const heading = await phone.getByRole('heading', { level: 1 }).boundingBox();
  assert.ok(heading.x >= 0 && heading.x + heading.width <= 390, 'heading fits the mobile viewport');
  await phone.getByRole('button', { name: '跳过', exact: true }).click();
  evidence.push('mobile: heading fits and Skip remains usable PASS');

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const quiet = await reduced.newPage();
  quiet.on('pageerror', error => failures.push(error.message));
  await quiet.goto(base);
  await quiet.waitForTimeout(1700);
  assert.equal(await quiet.evaluate(() => openings), 0);
  evidence.push('reduced motion bypass PASS');
  for (const slug of ['jianlai-aliang', 'sunny-watch', 'young-goku']) {
    // With motion disabled, verify the actual generated CSS on native-shaped
    // home elements without an overlay obscuring the result.
    await quiet.goto(base + '?saved=gallery-' + slug);
    await quiet.waitForFunction(expected => document.body.getAttribute('data-dsh-gallery-theme') === expected, slug);
    assert.equal(await quiet.locator('.fixture_previewBadge').isVisible(), false, slug + ' hides the native preview badge');
    assert.equal(await quiet.evaluate(() => openings), 0, slug + ' respects reduced motion');
    for (const target of [page, phone]) {
      await target.goto(base + '?saved=none&host=gallery-' + slug);
      const opening = target.locator('.dsh-gallery-intro');
      await opening.waitFor({ state: 'visible' });
      assert.equal(await opening.getAttribute('data-intro-theme'), slug);
      assert.equal(await target.locator('.dsh-gallery-intro-seal').count(), 0, 'recent themes do not reuse the Shanhe seal');
      await target.waitForTimeout(1300);
      const viewport = target.viewportSize();
      const title = await opening.locator('h1').boundingBox();
      assert.ok(title.x >= 0 && title.x + title.width <= viewport.width, slug + ' opening fits viewport');
      const size = target === page ? 'desktop' : 'mobile';
      await target.screenshot({ path: join(output, slug + '-' + size + '-intro.png') });
      if (target === page) await opening.waitFor({ state: 'detached', timeout: 5000 });
      else await target.getByRole('button', { name: '跳过', exact: true }).click();
      await opening.waitFor({ state: 'detached' });
      assert.equal(await target.locator('.fixture_previewBadge').isVisible(), false);
      const headline = await target.locator('.fixture_titleGroup > span:first-child').boundingBox();
      assert.ok(headline.x >= 0 && headline.x + headline.width <= viewport.width, slug + ' home title fits viewport');
      await target.getByRole('textbox', { name: '输入消息', exact: true }).fill('主题回归验证');
      await target.getByRole('button', { name: '发送', exact: true }).click();
      assert.equal(await target.locator('#send').getAttribute('data-sent'), 'true', 'the composer remains interactive');
      await target.screenshot({ path: join(output, slug + '-' + size + '-home.png') });
      await target.evaluate(id => { fixture.select('gallery-shanhe'); fixture.select(id); }, 'gallery-' + slug);
      assert.equal(await opening.count(), 0, 'switching themes does not replay the opening');
      assert.equal(await target.evaluate(() => openings), 1, 'one opening per startup');
    }
    evidence.push(slug + ': desktop/mobile opening, auto-close/Skip, reduced motion, hidden badge, home layout, composer input/click, no replay PASS');
  }
  for (const query of ['?saved=gallery-nezha', '?saved=none', '?saved=gallery-shanhe&host=gallery-nezha']) {
    await page.goto(base + query);
    await page.waitForTimeout(1700);
    assert.equal(await page.evaluate(() => openings), 0, query);
  }
  evidence.push('other theme, default, and differing restored Host selection bypass PASS');
  await page.goto(base);
  await intro.waitFor({ state: 'visible' });
  await page.evaluate(() => fixture.dispose());
  await intro.waitFor({ state: 'detached' });
  evidence.push('plugin disposal removes the opening PASS');
  await page.goto(pathToFileURL(demoPath).href);
  await intro.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '跳过', exact: true }).click();
  await intro.waitFor({ state: 'detached' });
  assert.ok(await page.getByRole('button', { name: '重播山河开场', exact: true }).isVisible());
  evidence.push('self-contained offline HTML preview PASS');
  assert.deepEqual(failures, [], 'no browser runtime errors');
  console.log(evidence.join('\n'));
  console.log(`Screenshots: ${output}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
