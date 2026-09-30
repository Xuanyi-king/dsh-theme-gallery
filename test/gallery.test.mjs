import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../src/catalog.mjs';
import { applyGallery, formatRunningStatus, formatLiveRunningStatus, decorateRunningStatuses, decorateHero, createGallerySection } from '../src/client.mjs';

function harness(saved = null, fetchImpl = null, visualSaved = null) {
  const data = new Map(saved ? [['dsh.themeGallery.selection', saved]] : []);
  if (visualSaved !== null) data.set('dsh.themeGallery.visual', visualSaved);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const attrs = new Map();
  const styles = new Map();
  const body = { setAttribute: (k, v) => attrs.set(k, v), removeAttribute: k => attrs.delete(k), querySelectorAll: () => [],
    style: { setProperty: (k, v) => styles.set(k, v), removeProperty: k => styles.delete(k) } };
  const elements = [];
  const document = { body, head: { appendChild: item => elements.push(item) }, createElement: () => ({ remove() {} }) };
  const definitions = new Map([['light', {}], ['dark', {}]]);
  const listeners = new Map();
  let choice = 'dark';
  const theme = {
    getTheme: () => ({ preference: choice }),
    register(def) { if (definitions.has(def.id)) throw Error('duplicate'); definitions.set(def.id, def); return () => definitions.delete(def.id); },
    setTheme(id) {
      if (id !== 'system' && !definitions.has(id)) throw Error('unknown');
      if (choice === id) return;
      choice = id;
      for (const fn of listeners.get('theme/change') ?? []) fn({ preference: id });
    },
  };
  const ctx = { theme, on(name, fn) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(fn);
    return () => listeners.get(name).delete(fn);
  } };
  const controller = applyGallery(ctx, { document, storage, Observer: null, styleText: '.gallery{}', fetchImpl });
  return { ctx, controller, attrs, styles, data, definitions, elements, get choice() { return choice; } };
}

test('one gallery registers ten unique themes and restores the Sunny Watch selection', () => {
  assert.equal(CATALOG.length, 10);
  const h = harness('gallery-sunny-watch');
  assert.equal(h.definitions.size, 12);
  assert.equal(h.choice, 'gallery-sunny-watch');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'sunny-watch');
  h.controller.dispose();
  assert.equal(h.definitions.size, 2);
  assert.equal(h.choice, 'dark');
  assert.equal(h.attrs.has('data-dsh-gallery-theme'), false);
});

test('switching is immediate and built-in selection removes the stored override', () => {
  const h = harness();
  h.controller.select('gallery-nezha');
  assert.equal(h.choice, 'gallery-nezha');
  assert.equal(h.data.get('dsh.themeGallery.selection'), 'gallery-nezha');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'nezha');
  h.controller.select('system');
  assert.equal(h.data.has('dsh.themeGallery.selection'), false);
  assert.equal(h.attrs.has('data-dsh-gallery-theme'), false);
  h.controller.dispose();
});

test('bad saved ids are ignored, and an active gallery theme survives late host adoption', async () => {
  const h = harness('gallery-unknown');
  assert.equal(h.choice, 'dark');
  assert.equal(h.data.has('dsh.themeGallery.selection'), false);
  h.controller.select('gallery-shanhe');
  assert.equal(h.data.get('dsh.themeGallery.selection'), 'gallery-shanhe');
  h.ctx.theme.setTheme('light');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.choice, 'gallery-shanhe');
  h.controller.select('light');
  assert.equal(h.data.has('dsh.themeGallery.selection'), false);
  assert.throws(() => h.controller.select('unknown'), /unknown/i);
  h.controller.dispose();
});

test('startup adoption restores the palette after later theme presenters consume the host snapshot', async () => {
  const h = harness('gallery-perfect-world');
  const present = snapshot => {
    for (const key of [...h.styles.keys()]) if (key.startsWith('--dsw-')) h.styles.delete(key);
    for (const [key, value] of Object.entries(h.definitions.get(snapshot.preference)?.tokens ?? {})) h.styles.set(key, value);
  };
  h.ctx.on('theme/change', present);
  present(h.ctx.theme.getTheme());
  h.ctx.theme.setTheme('light'); // The durable built-in preference arrives after plugin startup.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.choice, 'gallery-perfect-world');
  assert.equal(h.styles.get('--dsw-alias-label-primary'), '#f6e9cd');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'perfect-world');
  h.controller.dispose();
});

test('a pending startup restore respects a user reset and disposal', async () => {
  const h = harness('gallery-perfect-world');
  h.ctx.theme.setTheme('light');
  h.controller.select('system');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.choice, 'system');
  assert.equal(h.attrs.has('data-dsh-gallery-theme'), false);
  h.controller.dispose();
  const closed = harness('gallery-perfect-world');
  closed.ctx.theme.setTheme('light');
  closed.controller.dispose();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(closed.definitions.size, 2);
  assert.equal(closed.attrs.has('data-dsh-gallery-theme'), false);
});

test('live reply wording tracks selected theme and leaves other statuses intact', () => {
  const whale = CATALOG.find(x => x.slug === 'whale-prince');
  const aliang = CATALOG.find(x => x.slug === 'jianlai-aliang');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中', aliang), '雨落江湖 · 问剑中');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒', aliang), '雨落江湖 · 已行 12 秒');
  const sunny = CATALOG.find(x => x.slug === 'sunny-watch');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中', sunny), '晨光映城 · 正在思考');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒', sunny), '晨光映城 · 已持续 12 秒');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中', whale), '鲸息推演 · 潮声渐起');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒', whale), '鲸息推演 · 已航 12 秒');
  assert.equal(formatRunningStatus('已完成工作', '用时 12 秒', whale), null);
  const attrs = new Map();
  const button = { previousElementSibling: { getAttribute: () => 'status', textContent: '深度求索中' }, textContent: '深度求索中', setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k) };
  const root = { querySelectorAll: selector => selector === 'button[data-turn-process]' ? [button] : [] };
  decorateRunningStatuses(root, whale);
  assert.equal(attrs.get('data-dsh-gallery-label'), '鲸息推演 · 潮声渐起');
  decorateRunningStatuses(root, null);
  assert.equal(attrs.has('data-dsh-gallery-running'), false);
});

test('new DSH running status keeps elapsed time while switching its visible theme copy', () => {
  const emperor = CATALOG.find(x => x.slug === 'perfect-world');
  assert.equal(formatLiveRunningStatus('深度求索中...', emperor), '推演诸天 · 悟道中');
  assert.equal(formatLiveRunningStatus('深度求索中，用时 3分3秒...', emperor), '推演诸天 · 已历 3分3秒');
  assert.equal(formatLiveRunningStatus('Deep diving for 3m 3s...', emperor), 'Realm divination · 3m 3s');
  assert.equal(formatLiveRunningStatus('正在分析请求 · private content', emperor), null);
  const attrs = new Map();
  const visual = { textContent: '深度求索中，用时 3分3秒...' };
  const content = { setAttribute: (k, v) => attrs.set(k, v), removeAttribute: k => attrs.delete(k) };
  const row = {
    querySelector: selector => selector === '[class*="runningText"]' ? visual : selector === '[class*="runningContent"]' ? content : null,
    setAttribute: (k, v) => attrs.set(k, v), removeAttribute: k => attrs.delete(k),
  };
  const root = { querySelectorAll: selector => selector === '[data-chat-running]' ? [row] : [] };
  decorateRunningStatuses(root, emperor);
  assert.equal(attrs.get('data-dsh-gallery-live-label'), '推演诸天 · 已历 3分3秒');
  assert.equal(attrs.has('data-dsh-gallery-running'), true);
  decorateRunningStatuses(root, null);
  assert.equal(attrs.has('data-dsh-gallery-live-label'), false);
  assert.equal(attrs.has('data-dsh-gallery-running'), false);
  assert.equal(visual.textContent, '深度求索中，用时 3分3秒...');
});

test('native hero heading follows the selected theme and restores its original text', () => {
  const span = { textContent: '探索未至之境' };
  const root = { querySelectorAll: () => [span] };
  decorateHero(root, CATALOG[0]);
  assert.equal(span.textContent, '山河入墨，剑意问心');
  decorateHero(root, CATALOG[2]);
  assert.equal(span.textContent, '诸天为卷，问道而行');
  decorateHero(root, null);
  assert.equal(span.textContent, '探索未至之境');
});

test('settings section offers every theme plus DSH default through an accessible click target', () => {
  const h = harness();
  const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }), useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}], useEffect: () => {} };
  const Component = createGallerySection(React, h.controller);
  const root = Component({ t: key => key });
  const nodes = [];
  const walk = x => { if (!x || typeof x !== 'object') return; nodes.push(x); x.children?.forEach(walk); };
  walk(root);
  const buttons = nodes.filter(x => x.type === 'button');
  assert.equal(buttons.length, 13);
  assert.equal(buttons.filter(x => x.props['aria-pressed'] === true).length, 1);
  const ranges = nodes.filter(x => x.type === 'input' && x.props.type === 'range');
  assert.deepEqual(ranges.map(x => x.props['aria-label']), ['fade', 'sidebarOpacity', 'blur', 'contrast']);
  ranges[2].props.onChange({ target: { value: '5' } });
  assert.equal(h.controller.getAdjustments().blur, 5);
  buttons.find(x => x.props['data-theme'] === 'gallery-great-sage').props.onClick();
  assert.equal(h.choice, 'gallery-great-sage');
  h.controller.dispose();
});

test('scene and text sliders persist, restore, clamp, and clean up visual properties', () => {
  const h = harness('gallery-shanhe');
  assert.deepEqual(h.controller.getAdjustments(), { fade: 0, sidebarOpacity: 40, blur: 0, contrast: 100 });
  h.controller.adjust('sidebarOpacity', 65);
  assert.equal(h.styles.get('--gallery-sidebar-opacity'), '65%');
  h.controller.adjust('fade', 65);
  h.controller.adjust('blur', 5);
  h.controller.adjust('contrast', 130);
  assert.equal(h.styles.get('--gallery-scene-fade'), '65%');
  assert.equal(h.styles.get('--gallery-scene-blur'), '5px');
  assert.equal(h.styles.get('--gallery-text-contrast'), '1.3');
  assert.deepEqual(JSON.parse(h.data.get('dsh.themeGallery.visual')), { fade: 65, sidebarOpacity: 65, blur: 5, contrast: 130 });
  h.controller.adjust('blur', 999);
  assert.equal(h.controller.getAdjustments().blur, 12);
  h.controller.adjust('fade', 'invalid');
  assert.equal(h.controller.getAdjustments().fade, 65);
  const restored = harness('gallery-shanhe', null, h.data.get('dsh.themeGallery.visual'));
  assert.deepEqual(restored.controller.getAdjustments(), { fade: 65, sidebarOpacity: 65, blur: 12, contrast: 130 });
  restored.controller.adjust('sidebarOpacity', 999);
  assert.equal(restored.styles.get('--gallery-sidebar-opacity'), '90%');
  assert.equal(restored.styles.get('--gallery-scene-blur'), '12px');
  const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }), useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}], useEffect: () => {} };
  const preview = createGallerySection(React, restored.controller)({ t: key => key });
  const cards = preview.children.find(child => child.props?.className === 'dsh-gallery-grid').children;
  const chosen = cards.find(card => card.props['data-theme'] === 'gallery-shanhe');
  assert.equal(chosen.props.style['--gallery-preview-fade'], '65%');
  assert.equal(chosen.props.style['--gallery-preview-blur'], '12px');
  restored.controller.dispose();
  h.controller.dispose();
  assert.equal(h.styles.size, 0);
});

test('host choice survives a fresh browser session and reset persists as default', async () => {
  const server = { themeId: 'gallery-nezha' };
  const fetchImpl = async (_, options = {}) => {
    if (options.method === 'PUT') server.themeId = JSON.parse(options.body).themeId;
    return { ok: true, json: async () => ({ themeId: server.themeId }) };
  };
  const tick = () => new Promise(resolve => setImmediate(resolve));
  const first = harness(null, fetchImpl);
  await tick();
  assert.equal(first.choice, 'gallery-nezha');
  first.controller.dispose();
  const second = harness(null, fetchImpl);
  await tick();
  assert.equal(second.choice, 'gallery-nezha');
  second.controller.select('system');
  await tick();
  assert.equal(server.themeId, null);
  second.controller.dispose();
  const third = harness(null, fetchImpl);
  await tick();
  assert.equal(third.choice, 'dark');
  third.controller.dispose();
});

test('a missing host selection does not discard a valid local theme', async () => {
  const h = harness('gallery-whale-prince', async () => ({ ok: true, json: async () => ({ themeId: null }) }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.choice, 'gallery-whale-prince');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'whale-prince');
  h.controller.dispose();
});


test('child Goku theme selects, persists and retains its sky palette', () => {
  const goku = CATALOG.find(item => item.slug === 'young-goku');
  assert.equal(goku?.zh, '少年悟空 · 筋斗云之旅');
  assert.equal(goku?.definition.colorScheme, 'light');
  const h = harness();
  h.controller.select('gallery-young-goku');
  assert.equal(h.choice, 'gallery-young-goku');
  assert.equal(h.data.get('dsh.themeGallery.selection'), 'gallery-young-goku');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'young-goku');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中', goku), '乘云思索 · 勇敢向前');
  h.controller.dispose();
});
