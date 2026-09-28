import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { formatRunningStatus, THEME } from '../src/client.mjs';

test('native running status uses rain-road wording only for active replies', () => {
  assert.equal(formatRunningStatus('深度求索中', '深度求索中'), '雨落江湖 · 问剑中');
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒'), '雨落江湖 · 已行 12 秒');
  assert.equal(formatRunningStatus('Deep diving...', 'Deep diving for 12s'), 'Rain road · 12s');
  assert.equal(formatRunningStatus('已完成工作', '用时 12 秒'), null);
  assert.equal(THEME.colorScheme, 'dark');
});

test('standalone bundle embeds the rain scene and registers with DSH', async () => {
  const code = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const loaded = [];
  vm.runInNewContext(code, { window: { __ModuleLoader__: { load: value => loaded.push(value) } } });
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, 'dsh-jianlai-aliang-theme');
  assert.equal(loaded[0].factory().THEME.id, 'jianlai-aliang');
  assert.ok(code.includes('data:image/webp;base64,'));
  assert.ok(code.includes('prefers-reduced-motion'));
});
