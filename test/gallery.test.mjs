import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../src/catalog.mjs';
import { applyGallery, formatRunningStatus, decorateRunningStatuses, createGallerySection } from '../src/client.mjs';

function harness(saved = null, fetchImpl = null) {
  const data = new Map(saved ? [['dsh.themeGallery.selection', saved]] : []);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const attrs = new Map();
  const body = { setAttribute: (k, v) => attrs.set(k, v), removeAttribute: k => attrs.delete(k), querySelectorAll: () => [] };
  const elements = [];
  const document = { body, head: { appendChild: item => elements.push(item) }, createElement: () => ({ remove() {} }) };
  const definitions = new Map([['light', {}], ['dark', {}]]);
  const listeners = new Map();
  let choice = 'dark';
  const theme = {
    getTheme: () => ({ preference: choice }),
    register(def) { if (definitions.has(def.id)) throw Error('duplicate'); definitions.set(def.id, def); return () => definitions.delete(def.id); },
    setTheme(id) { if (id !== 'system' && !definitions.has(id)) throw Error('unknown'); choice = id; listeners.get('theme/change')?.({ preference: id }); },
  };
  const ctx = { theme, on(name, fn) { listeners.set(name, fn); return () => listeners.delete(name); } };
  const controller = applyGallery(ctx, { document, storage, Observer: null, styleText: '.gallery{}', fetchImpl });
  return { ctx, controller, attrs, data, definitions, elements, get choice() { return choice; } };
}

test('one gallery registers all seven unique themes and restores a saved selection', () => {
  assert.equal(CATALOG.length, 7);
  const h = harness('gallery-whale-prince');
  assert.equal(h.definitions.size, 9);
  assert.equal(h.choice, 'gallery-whale-prince');
  assert.equal(h.attrs.get('data-dsh-gallery-theme'), 'whale-prince');
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

test('bad saved ids are ignored, and an active gallery theme survives late host adoption', () => {
  const h = harness('gallery-unknown');
  assert.equal(h.choice, 'dark');
  assert.equal(h.data.has('dsh.themeGallery.selection'), false);
  h.controller.select('gallery-shanhe');
  assert.equal(h.data.get('dsh.themeGallery.selection'), 'gallery-shanhe');
  h.ctx.theme.setTheme('light');
  assert.equal(h.choice, 'gallery-shanhe');
  h.controller.select('light');
  assert.equal(h.data.has('dsh.themeGallery.selection'), false);
  assert.throws(() => h.controller.select('unknown'), /unknown/i);
  h.controller.dispose();
});

test('live reply wording tracks selected theme and leaves other statuses intact', () => {
  const whale = CATALOG.find(x => x.slug === 'whale-prince');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中', whale), '鲸息推演 · 潮声渐起');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒', whale), '鲸息推演 · 已航 12 秒');
  assert.equal(formatRunningStatus('已完成工作', '用时 12 秒', whale), null);
  const attrs = new Map();
  const button = { previousElementSibling: { getAttribute: () => 'status', textContent: '深度求索中' }, textContent: '深度求索中', setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k) };
  decorateRunningStatuses({ querySelectorAll: () => [button] }, whale);
  assert.equal(attrs.get('data-dsh-gallery-label'), '鲸息推演 · 潮声渐起');
  decorateRunningStatuses({ querySelectorAll: () => [button] }, null);
  assert.equal(attrs.has('data-dsh-gallery-running'), false);
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
  assert.equal(buttons.length, 10);
  assert.equal(buttons.filter(x => x.props['aria-pressed'] === true).length, 1);
  buttons.find(x => x.props['data-theme'] === 'gallery-great-sage').props.onClick();
  assert.equal(h.choice, 'gallery-great-sage');
  h.controller.dispose();
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
