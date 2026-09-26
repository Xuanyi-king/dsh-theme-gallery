import test from 'node:test';
import assert from 'node:assert/strict';
import { apply, THEME } from '../src/client.mjs';

test('registers the indigo-and-sunlit-gold palette and restores previous selection on unload', () => {
  let selected = 'dark';
  let disposed = false;
  const attributes = new Set();
  const body = {
    setAttribute: (name) => attributes.add(name),
    removeAttribute: (name) => attributes.delete(name),
  };
  const oldDocument = globalThis.document;
  globalThis.document = { body };
  const effects = [];
  const ctx = {
    effect(fn) { effects.push(fn()); },
    theme: {
      register(def) {
        assert.equal(def.id, 'qitian');
        assert.equal(def.colorScheme, 'dark');
        assert.equal(def.tokens['--dsw-alias-brand-primary'], '#edba66');
        return () => { disposed = true; };
      },
      getTheme() { return { preference: selected }; },
      setTheme(id) { selected = id; },
    },
  };
  try {
    apply(ctx);
    assert.equal(selected, THEME.id);
    assert.equal(attributes.has('data-qitian-theme'), true);
    for (const cleanup of effects.reverse()) cleanup?.();
    assert.equal(selected, 'dark');
    assert.equal(disposed, true);
    assert.equal(attributes.has('data-qitian-theme'), false);
  } finally {
    globalThis.document = oldDocument;
  }
});

test('unload does not override a theme selected by the user afterward', () => {
  const oldDocument = globalThis.document;
  globalThis.document = { body: { setAttribute() {}, removeAttribute() {} } };
  let selected = 'light';
  const effects = [];
  try {
    apply({
      effect(fn) { effects.push(fn()); },
      theme: {
        register() { return () => {}; },
        getTheme() { return { preference: selected }; },
        setTheme(id) { selected = id; },
      },
    });
    selected = 'dark';
    for (const cleanup of effects.reverse()) cleanup?.();
    assert.equal(selected, 'dark');
  } finally {
    globalThis.document = oldDocument;
  }
});
