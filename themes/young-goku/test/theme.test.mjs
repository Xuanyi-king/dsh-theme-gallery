import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { formatRunningStatus, THEME } from '../src/client.mjs';

test('native running status uses nimbus wording only for active replies', () => {
  assert.equal(formatRunningStatus('深度求索中', '深度求索中'), '乘云思索 · 勇敢向前');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒'), '乘云思索 · 已行 12 秒');
  assert.equal(formatRunningStatus('Deep diving...', 'Deep diving for 12s'), 'Nimbus · 12s');
  assert.equal(formatRunningStatus('已完成工作', '用时 12 秒'), null);
  assert.equal(THEME.colorScheme, 'light');
});

test('standalone bundle embeds the nimbus journey and registers with DSH', async () => {
  const code = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const loaded = [];
  vm.runInNewContext(code, { window: { __ModuleLoader__: { load: value => loaded.push(value) } } });
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'dsh-young-goku-theme');
  assert.equal(loaded[0].factory().THEME.id, 'young-goku');
  assert.ok(code.includes('data:image/webp;base64,'));
  assert.ok(!code.includes('__SCENE_URL__'));
  assert.ok(code.includes('prefers-reduced-motion'));
});
