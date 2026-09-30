import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGallery } from '../src/client.mjs';
import { createStartupIntro } from '../src/startup-intro.mjs';

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
