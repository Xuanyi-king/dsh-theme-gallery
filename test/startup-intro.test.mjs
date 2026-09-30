import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGallery } from '../src/client.mjs';
import * as opening from '../src/startup-intro.mjs';
const { createStartupIntro } = opening;

function clock() {
  let now = 0;
  let sequence = 0;
  const jobs = new Map();
  return {
    setTimer(fn, delay) { const id = ++sequence; jobs.set(id, { fn, at: now + delay }); return id; },
    clearTimer(id) { jobs.delete(id); },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const next = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > target) break;
        now = next[1].at;
        jobs.delete(next[0]);
        next[1].fn();
      }
      now = target;
    },
    get pending() { return jobs.size; },
  };
}

function fixture(saved = 'gallery-shanhe', fetchImpl = null, reducedMotion = () => false) {
  const data = new Map(saved ? [['dsh.themeGallery.selection', saved]] : []);
  const listeners = new Set();
  let preference = 'system';
  const theme = {
    getTheme: () => ({ preference }),
    register: () => () => {},
    setTheme(id) { preference = id; for (const fn of listeners) fn({ preference }); },
  };
  const gallery = applyGallery({ theme, on: (_, fn) => { listeners.add(fn); return () => listeners.delete(fn); } }, {
    document: null, Observer: null, fetchImpl,
    storage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) },
  });
  const time = clock();
  const intro = createStartupIntro(gallery, { setTimer: time.setTimer, clearTimer: time.clearTimer, reducedMotion });
  return { gallery, intro, time, dispose() { intro.dispose(); gallery.dispose(); } };
}

const tick = () => new Promise(resolve => setImmediate(resolve));

test('saved Shanhe plays once at startup and closes at four seconds without replay on theme changes', async () => {
  const h = fixture();
  assert.equal(h.intro.getSnapshot(), null);
  await tick();
  assert.equal(h.intro.getSnapshot()?.slug, 'shanhe');
  h.time.advance(3999);
  assert.equal(h.intro.getSnapshot()?.slug, 'shanhe');
  h.time.advance(1);
  assert.equal(h.intro.getSnapshot(), null);
  h.gallery.select('gallery-nezha');
  h.gallery.select('gallery-shanhe');
  await tick();
  assert.equal(h.intro.getSnapshot(), null);
  assert.equal(h.time.pending, 0);
  h.dispose();
});

test('startup waits for the host and uses its restored selection instead of a stale local choice', async () => {
  let respond;
  const h = fixture('gallery-shanhe', () => new Promise(resolve => { respond = resolve; }));
  await tick();
  assert.equal(h.intro.getSnapshot(), null);
  h.time.advance(1499);
  assert.equal(h.intro.getSnapshot(), null);
  respond({ ok: true, json: async () => ({ themeId: 'gallery-nezha' }) });
  await tick();
  h.time.advance(10000);
  assert.equal(h.intro.getSnapshot(), null);
  assert.equal(h.time.pending, 0);
  h.dispose();
});

test('stalled restoration falls back to the local theme at 1.5 seconds and never reopens', async () => {
  let respond;
  const h = fixture('gallery-shanhe', () => new Promise(resolve => { respond = resolve; }));
  await tick();
  h.time.advance(1499);
  assert.equal(h.intro.getSnapshot(), null);
  h.time.advance(1);
  assert.equal(h.intro.getSnapshot()?.slug, 'shanhe');
  h.intro.skip();
  respond({ ok: true, json: async () => ({ themeId: 'gallery-shanhe' }) });
  await tick();
  assert.equal(h.intro.getSnapshot(), null);
  assert.equal(h.time.pending, 0);
  h.dispose();
});

test('choosing a theme during startup never interrupts the user with a delayed opening', async () => {
  for (const finish of ['ready', 'timeout']) {
    let respond;
    const h = fixture(null, () => new Promise(resolve => { respond = resolve; }));
    await tick();
    h.gallery.select('gallery-shanhe');
    if (finish === 'ready') {
      respond({ ok: true, json: async () => ({ themeId: 'gallery-shanhe' }) });
      await tick();
    } else h.time.advance(1500);
    assert.equal(h.intro.getSnapshot(), null, finish);
    assert.equal(h.time.pending, 0);
    h.dispose();
  }
});

test('reduced motion and every non-Shanhe choice bypass the opening', async () => {
  for (const choice of ['system', 'dark', 'gallery-nezha', 'gallery-unknown', null]) {
    const h = fixture(choice);
    await tick();
    assert.equal(h.intro.getSnapshot(), null, String(choice));
    assert.equal(h.time.pending, 0);
    h.dispose();
  }
  const reduced = fixture('gallery-shanhe', null, () => true);
  await tick();
  assert.equal(reduced.intro.getSnapshot(), null);
  assert.equal(reduced.time.pending, 0);
  reduced.dispose();
});

test('skip, theme change, and disposal cancel the opening and its timers', async () => {
  for (const close of [h => h.intro.skip(), h => h.gallery.select('gallery-nezha'), h => h.intro.dispose()]) {
    const h = fixture();
    await tick();
    let updates = 0;
    const stop = h.intro.subscribe(() => { updates += 1; });
    close(h);
    assert.equal(h.intro.getSnapshot(), null);
    const before = updates;
    h.time.advance(10000);
    assert.equal(updates, before);
    assert.equal(h.time.pending, 0);
    stop();
    h.dispose();
  }
});

test('the opening view exposes theme copy, a modal label, and a working Skip button', async () => {
  const h = fixture();
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }),
    useSyncExternalStore: (_subscribe, read) => read(),
    useRef: () => ({ current: null }),
    useEffect() {},
  };
  const View = opening.createStartupIntroView(React, h.intro, { document: null, window: null });
  assert.equal(View(), null);
  await tick();
  const tree = View();
  assert.equal(tree.props.role, 'dialog');
  assert.equal(tree.props['aria-modal'], true);
  const nodes = [];
  const visit = node => { if (!node || typeof node !== 'object') return; nodes.push(node); node.children.forEach(visit); };
  visit(tree);
  assert.equal(nodes.find(node => node.type === 'h1').children[0], '山河入墨，剑意问心');
  assert.ok(nodes.some(node => node.children.includes('一念为始 · 万里山河')));
  const skip = nodes.find(node => node.type === 'button');
  assert.equal(skip.children[0], '跳过');
  skip.props.onClick();
  assert.equal(View(), null);
  h.dispose();
});

test('disposing before restoration prevents both fallback and late autoplay', async () => {
  let respond;
  const h = fixture('gallery-shanhe', () => new Promise(resolve => { respond = resolve; }));
  await tick();
  h.dispose();
  h.time.advance(10000);
  respond({ ok: true, json: async () => ({ themeId: 'gallery-shanhe' }) });
  await tick();
  assert.equal(h.intro.getSnapshot(), null);
  assert.equal(h.time.pending, 0);
});
