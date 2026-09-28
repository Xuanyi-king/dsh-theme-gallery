import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('installable root package declares one bundle with all nine theme assets', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const loaded = [];
  vm.runInNewContext(client, { window: { __ModuleLoader__: { load: value => loaded.push(value) } } });
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'dsh-theme-gallery');
  const module = loaded[0].factory(name => { if (name === 'react') return { createElement() {} }; throw Error(name); });
  assert.equal(module.CATALOG.length, 9);
  assert.equal(module.CATALOG[0].id, 'gallery-shanhe');
  assert.equal((client.match(/data:image\/webp;base64,/g) ?? []).length, 18);
  assert.ok(client.includes('settings.section'));
  assert.ok(client.includes('prefers-reduced-motion'));
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.ok(pkg.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-slots'));
  assert.equal(pkg.exports['./client'], './lib/client.js');
});

test('every gallery scene styles its own animated native progress label', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const choices = ['shanhe', 'ultraman', 'perfect-world', 'flame-emperor', 'great-sage', 'nezha', 'whale-prince', 'jianlai-aliang', 'sunny-watch'];
  for (const slug of choices) assert.ok(client.includes(`body[data-dsh-gallery-theme=\\"${slug}\\"]`), slug);
  assert.ok(client.includes('[data-conversation-region=\\"chat\\"]'));
  assert.ok(client.includes('opacity: 0 !important;'));
  assert.ok(client.includes('content: attr(data-dsh-gallery-label) !important;'));
  assert.ok(client.includes('animation: gallery-progress-flow 3.2s linear infinite !important;'));
  for (const motion of ['ink', 'light', 'rune', 'flame', 'staff', 'lotus', 'tide', 'blade', 'sunrise']) {
    assert.ok(client.includes(`@keyframes gallery-${motion}`), motion);
  }
  assert.equal((client.match(/--gallery-status-icon: url\(/g) ?? []).length, 9);
  assert.ok(client.includes('animation: var(--gallery-status-motion) !important;'));
  assert.ok(client.includes("content: '墨' !important;"));
  assert.ok(client.includes('animation: gallery-ink-seal 3.6s ease-in-out infinite !important;'));
  assert.ok(client.includes('@media (prefers-reduced-motion: reduce)'));
});

test('gallery paints the existing sidebar and composer using each scene without adding controls', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  assert.ok(client.includes('[class*=\\"sidebarCol\\"]'));
  assert.ok(client.includes('[data-row-key^=\\"workspace:\\"]'));
  assert.ok(client.includes('[data-row-key^=\\"session:\\"]'));
  assert.ok(client.includes('--gallery-sidebar-fill'));
  assert.ok(client.includes('backdrop-filter: blur(var(--gallery-scene-blur, 0px));'));
  assert.ok(client.includes('--gallery-scene-fade'));
  assert.ok(client.includes('filter: contrast(var(--gallery-text-contrast, 1));'));
  assert.ok(client.includes('color-mix(in srgb, var(--gallery-sidebar-fill) 26%, transparent)'));
  assert.ok(client.includes('--gallery-chrome'));
  assert.ok(client.includes('button[class*=\\"newSession\\"]::before'));
  assert.ok(client.includes('[data-composer-card] button[class*=\\"_primary\\"]'));
  assert.ok(client.includes('content: none !important; display: none !important;'));
  assert.ok(client.includes('data:image/png;base64,'));
  assert.ok(client.includes('[data-conversation-region=\\"composer\\"]'));
  assert.ok(client.includes('--dsh-gallery-scene'));
  assert.ok(client.includes('data:image/webp;base64,'));
  assert.ok(client.includes('content: none !important;\\n  display: none !important;'));
  assert.ok(client.includes('山河入墨，剑意问心'));
  assert.ok(client.includes('诸天为卷，问道而行'));
  assert.ok(client.includes("content: '山' !important;"));
  assert.ok(client.includes('content: none !important;\\n  display: none !important;\\n  background: none !important;'));
});

test('bundled plugin registers a settings page whose cards switch and reset themes', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const loaded = [];
  const attrs = new Map();
  const data = new Map();
  const body = { setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key), querySelectorAll: () => [] };
  const document = { body, head: { appendChild() {} }, createElement: () => ({ remove() {} }) };
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }),
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect() {},
  };
  vm.runInNewContext(client, {
    window: { __ModuleLoader__: { load: entry => loaded.push(entry) } }, document,
    localStorage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) },
  });
  const plugin = loaded[0].factory(name => { if (name === 'react') return React; throw Error(name); });
  const registered = new Map();
  const subscriptions = new Map();
  const effects = [];
  const slots = [];
  let preference = 'system';
  const ctx = {
    theme: {
      getTheme: () => ({ preference }),
      register: definition => { registered.set(definition.id, definition); return () => registered.delete(definition.id); },
      setTheme: id => { preference = id; subscriptions.get('theme/change')?.({ preference: id }); },
    },
    on: (name, handler) => { subscriptions.set(name, handler); return () => subscriptions.delete(name); },
    effect: factory => { effects.push(factory()); },
    locale: { register: () => () => {}, bind: () => key => key },
    slots: { inject: (_slot, register) => register(), register: (descriptor, component) => { slots.push({ descriptor, component }); return () => {}; } },
  };
  plugin.apply(ctx);
  assert.equal(slots.length, 1);
  assert.equal(slots[0].descriptor.id, 'dsh-theme-gallery');
  const rendered = slots[0].component({});
  const nodes = [];
  const visit = node => { if (!node || typeof node !== 'object') return; nodes.push(node); node.children?.forEach(visit); };
  visit(rendered);
  const buttons = nodes.filter(node => node.type === 'button');
  assert.equal(buttons.length, 12);
  buttons.find(node => node.props['data-theme'] === 'gallery-ultraman').props.onClick();
  assert.equal(preference, 'gallery-ultraman');
  assert.equal(attrs.get('data-dsh-gallery-theme'), 'ultraman');
  buttons.find(node => node.props['data-theme'] === 'system').props.onClick();
  assert.equal(preference, 'system');
  assert.equal(attrs.has('data-dsh-gallery-theme'), false);
  for (const stop of effects.reverse()) stop?.();
  assert.equal(registered.size, 0);
});
