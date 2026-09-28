import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATALOG } from '../src/catalog.mjs';

for (const { slug } of CATALOG) {
  test(`${slug} standalone theme decorates the DSH 0.2 live status`, async () => {
    const theme = await import(`../themes/${slug}/src/client.mjs`);
    const attrs = new Map();
    const native = { textContent: '深度求索中，用时 3分3秒...' };
    const content = {
      getAttribute: key => attrs.get(key) ?? null,
      setAttribute: (key, value) => attrs.set(key, value),
      removeAttribute: key => attrs.delete(key),
    };
    const row = {
      matches: selector => selector === '[data-chat-running]',
      querySelector: selector => selector === '[class*="runningText"]' ? native : selector === '[class*="runningContent"]' ? content : null,
      getAttribute: key => attrs.get(key) ?? null,
      setAttribute: (key, value) => attrs.set(key, value),
      removeAttribute: key => attrs.delete(key),
    };
    const root = { querySelectorAll: selector => selector === '[data-chat-running]' ? [row] : [] };
    theme.decorateRunningStatuses(root);
    const expected = theme.formatRunningStatus('深度求索中', '深度求索中，用时 3分3秒');
    assert.ok([...attrs.values()].includes(expected));
    assert.equal(native.textContent, '深度求索中，用时 3分3秒...');
    native.textContent = 'Deep diving...';
    theme.decorateRunningStatuses(root);
    assert.ok([...attrs.values()].includes(theme.formatRunningStatus('Deep diving...', 'Deep diving...')));
    native.textContent = '已完成工作';
    theme.decorateRunningStatuses(root);
    assert.equal(attrs.size, 0);
    const css = await readFile(new URL(`../themes/${slug}/assets/theme.css`, import.meta.url), 'utf8');
    assert.match(css, /\[data-chat-running\]\[data-[\w-]+-running\] \[class\*="runningIcon"\]::before/);
    assert.match(css, /prefers-reduced-motion: reduce/);
  });
}
