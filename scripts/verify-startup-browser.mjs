// Optional browser verification against the shipped client, with real React.
// Tooling is external to the plugin: pass a directory containing playwright,
// react@18 and react-dom@18 via DSH_INTRO_BROWSER_TOOLS.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CATALOG } from '../src/catalog.mjs';
import { createIntroPreview } from './intro-preview.mjs';

const tools = process.env.DSH_INTRO_BROWSER_TOOLS;
if (!tools) throw new Error('Set DSH_INTRO_BROWSER_TOOLS to your browser tooling directory.');
const requireTool = createRequire(join(tools, 'package.json'));
const { chromium } = requireTool('playwright');
const output = process.env.DSH_INTRO_SCREENSHOTS ?? '/tmp/dsh-theme-intros-preview';
await mkdir(output, { recursive: true });
const files = new Map([
  ['/react.js', await readFile(join(tools, 'node_modules/react/umd/react.production.min.js'))],
  ['/react-dom.js', await readFile(join(tools, 'node_modules/react-dom/umd/react-dom.production.min.js'))],
  ['/client.js', await readFile(new URL('../lib/client.js', import.meta.url))],
]);
const fixture = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>山河启动动画样板</title></head>
<body style="margin:0"><button id="background">背景控件</button><div id="settings" hidden></div><div id="overlay"></div>
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
  locale: { register: () => () => {}, bind: () => key => ({ introSkip: params.get('lang') === 'en' ? 'Skip' : '跳过', introHint: 'Esc 跳过 · 山河即将入卷', introThemedHint: params.get('lang') === 'en' ? 'Esc to skip · Your journey begins' : 'Esc 跳过 · 即将开启对话' }[key] || key) },
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
if (params.has('nested')) {
  const main = document.createElement('main');
  document.getElementById('overlay').replaceWith(main);
  main.id = 'overlay';
}
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
const collectionPath = join(output, 'theme-intros.html');
await writeFile(collectionPath, createIntroPreview(files));

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
  browser = await chromium.launch({ headless: true });
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
  for (const query of ['?saved=system', '?saved=light', '?saved=dark', '?saved=none', '?saved=gallery-unknown']) {
    await page.goto(base + query);
    await page.waitForTimeout(1700);
    assert.equal(await page.evaluate(() => openings), 0, query);
  }
  evidence.push('built-in, default, and invalid selection bypass PASS');
  await page.goto(base + '?saved=gallery-shanhe&host=gallery-nezha');
  await intro.waitFor({ state: 'visible' });
  assert.equal(await intro.getAttribute('data-intro-theme'), 'nezha');
  await page.keyboard.press('Escape');
  evidence.push('restored Host theme uses its own opening, not stale Shanhe PASS');
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
  const freezeFrame = target => target.evaluate(() => {
    for (const animation of document.getAnimations()) { animation.pause(); animation.currentTime = 2200; }
  });
  for (const theme of CATALOG) {
    for (const [target, size] of [[page, 'desktop'], [phone, 'mobile']]) {
      await target.goto(base + '?saved=' + theme.id);
      const frame = target.locator('.dsh-gallery-intro');
      await frame.waitFor({ state: 'visible' });
      assert.equal(await frame.getAttribute('data-intro-theme'), theme.slug);
      assert.equal(await frame.getByRole('heading', { level: 1 }).textContent(), theme.hero);
      if (theme.slug !== 'shanhe') assert.equal(await frame.locator('[data-intro-artwork]').getAttribute('data-intro-artwork'), theme.slug);
      await freezeFrame(target);
      const copy = await frame.getByRole('heading', { level: 1 }).boundingBox();
      const skip = await frame.getByRole('button').boundingBox();
      const { width, height } = target.viewportSize();
      for (const box of [copy, skip]) assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, theme.slug + ' ' + size);
      await target.screenshot({ path: join(output, theme.slug + '-' + size + '.png') });
      await target.keyboard.press('Tab');
      assert.equal(await target.locator(':focus').textContent(), '跳过');
      await frame.getByRole('button').click();
      await frame.waitFor({ state: 'detached' });
      await target.evaluate(() => { fixture.select('gallery-ultraman'); fixture.select('gallery-flame-emperor'); });
      assert.equal(await target.evaluate(() => openings), 1, 'switches do not replay: ' + theme.slug);
    }
  }
  evidence.push('all ten themes: correct copy/art, bounded desktop/mobile layouts, Skip, focus trap and no switch replay PASS');
  await phone.setViewportSize({ width: 320, height: 568 });
  for (const theme of CATALOG) {
    await phone.goto(base + '?saved=' + theme.id);
    const frame = phone.locator('.dsh-gallery-intro');
    await frame.waitFor({ state: 'visible' });
    await freezeFrame(phone);
    const heading = await frame.getByRole('heading', { level: 1 }).boundingBox();
    assert.ok(heading.x >= 0 && heading.x + heading.width <= 321 && heading.y >= 0 && heading.y + heading.height <= 568, theme.slug + ' compact phone');
    await phone.keyboard.press('Escape');
  }
  evidence.push('all ten themes: 320px compact phone layouts PASS');
  await phone.setViewportSize({ width: 844, height: 390 });
  for (const theme of CATALOG) {
    await phone.goto(base + '?saved=' + theme.id);
    const frame = phone.locator('.dsh-gallery-intro');
    await frame.waitFor({ state: 'visible' });
    await freezeFrame(phone);
    const heading = await frame.getByRole('heading', { level: 1 }).boundingBox();
    assert.ok(heading.x >= 0 && heading.x + heading.width <= 845 && heading.y >= 0 && heading.y + heading.height <= 390, theme.slug + ' landscape');
    await phone.keyboard.press('Escape');
  }
  evidence.push('all ten themes: short landscape layouts PASS');
  for (const theme of CATALOG) {
    await quiet.goto(base + '?saved=' + theme.id);
    await quiet.waitForTimeout(350);
    assert.equal(await quiet.evaluate(() => openings), 0, theme.slug);
  }
  evidence.push('all ten themes: reduced-motion bypass PASS');
  await page.goto(base + '?saved=gallery-whale-prince&lang=en');
  await intro.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  evidence.push('English Skip label PASS');
  for (const theme of CATALOG.filter(item => item.slug !== 'shanhe')) {
    await page.goto(base + '?saved=' + theme.id + '&nested=1');
    await intro.waitFor({ state: 'visible' });
    const typography = await intro.evaluate(frame => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--intro-ink)';
      probe.style.fontFamily = 'var(--intro-font)';
      frame.append(probe);
      const actual = getComputedStyle(frame.querySelector('h1'));
      const expected = getComputedStyle(probe);
      const result = { actual: [actual.color, actual.fontFamily], expected: [expected.color, expected.fontFamily] };
      probe.remove();
      return result;
    });
    assert.deepEqual(typography.actual, typography.expected, 'native heading styles do not override ' + theme.slug);
    await page.keyboard.press('Escape');
  }
  evidence.push('nine new themes: native main heading CSS does not override intro typography PASS');
  await page.goto(pathToFileURL(collectionPath).href);
  await intro.waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.selectOption('#theme-picker', 'flame-emperor');
  await intro.waitFor({ state: 'visible' });
  assert.equal(await intro.getAttribute('data-intro-theme'), 'flame-emperor');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '重播当前开场', exact: true }).click();
  await intro.waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.locator('[data-preview="young-goku"]').click();
  await intro.waitFor({ state: 'visible' });
  assert.equal(await intro.getAttribute('data-intro-theme'), 'young-goku');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.preview-shell').evaluate(node => getComputedStyle(node).zIndex), '1', 'preview controls stay above the native wallpaper backdrop');
  assert.equal(await page.locator('.preview-shell').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(242, 244, 247)');
  await page.screenshot({ path: join(output, 'collection.png'), fullPage: true });
  evidence.push('isolated offline chooser, replay and card selection PASS');
  const contact = await desktop.newPage();
  for (const size of ['desktop', 'mobile']) {
    const tiles = await Promise.all(CATALOG.filter(item => item.slug !== 'shanhe').map(async theme => {
      const image = (await readFile(join(output, theme.slug + '-' + size + '.png'))).toString('base64');
      return '<article><header>' + theme.zh + '</header><img src="data:image/png;base64,' + image + '"></article>';
    }));
    const width = size === 'desktop' ? 432 : 216;
    await contact.setViewportSize({ width: width * 3 + 32, height: 1100 });
    await contact.setContent('<html lang="zh"><style>body{margin:0;padding:8px;background:#101722;color:#e7edf4;font:13px system-ui}main{display:grid;grid-template-columns:repeat(3,' + width + 'px);gap:8px}header{padding:10px}img{display:block;width:100%}</style><main>' + tiles.join('') + '</main></html>');
    await contact.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await contact.screenshot({ path: join(output, 'contact-' + size + '.png'), fullPage: true });
  }
  await contact.close();
  assert.deepEqual(failures, [], 'no browser runtime errors');
  console.log(evidence.join('\n'));
  console.log(`Screenshots: ${output}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
