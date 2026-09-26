import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRunningStatus, decorateRunningStatuses, installRunningStatus } from '../src/client.mjs';

test('relabels only live DSH process statuses and preserves elapsed duration', () => {
  assert.equal(formatRunningStatus('深度求索中', '深度求索中，用时 12 秒'), '异火推演 · 已炼 12 秒');
  assert.equal(formatRunningStatus('Deep diving...', 'Deep diving for 12s'), 'Flame forging · 12s');
  assert.equal(formatRunningStatus('已完成工作', '用时 12 秒'), null);
  assert.equal(formatRunningStatus('深度求索中', '处理失败'), null);
  assert.equal(formatRunningStatus('深度求索中', '深度求索中'), '异火推演 · 凝焰中');
});

test('decorates only the button paired with a live status announcement', () => {
  const attrs = new Map();
  const liveButton = {
    previousElementSibling: { getAttribute: name => name === 'role' ? 'status' : null, textContent: '深度求索中' },
    textContent: '深度求索中，用时 3 秒',
    setAttribute: (k,v) => attrs.set(k,v),
    removeAttribute: k => attrs.delete(k),
  };
  const doneAttrs = new Map();
  const doneButton = {
    previousElementSibling: { getAttribute: () => 'status', textContent: '已完成工作' },
    textContent: '用时 4 秒',
    setAttribute: (k,v) => doneAttrs.set(k,v),
    removeAttribute: k => doneAttrs.delete(k),
  };
  decorateRunningStatuses({ querySelectorAll: () => [liveButton, doneButton] });
  assert.equal(attrs.get('data-yandi-running'), '');
  assert.equal(attrs.get('data-yandi-label'), '异火推演 · 已炼 3 秒');
  assert.equal(doneAttrs.has('data-yandi-running'), false);
  liveButton.previousElementSibling.textContent = '已完成工作';
  decorateRunningStatuses({ querySelectorAll: () => [liveButton, doneButton] });
  assert.equal(attrs.has('data-yandi-running'), false);
});

test('observer disconnects and removes theme attributes on unload', () => {
  const attrs = new Map();
  const button = {
    previousElementSibling: { getAttribute: () => 'status', textContent: '深度求索中' },
    textContent: '深度求索中',
    setAttribute: (k,v) => attrs.set(k,v),
    removeAttribute: k => attrs.delete(k),
  };
  const root = { querySelectorAll: () => [button] };
  let disconnected = false;
  class FakeObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  const cleanup = installRunningStatus(root, FakeObserver);
  assert.equal(attrs.get('data-yandi-running'), '');
  cleanup();
  assert.equal(disconnected, true);
  assert.equal(attrs.has('data-yandi-running'), false);
});
