import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { CATALOG } from '../src/catalog.mjs';
import { createIntroArtwork, createIntroEmblem } from '../src/intro-scenes.mjs';

const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }) };
const nodesOf = tree => {
  const nodes = [];
  const visit = node => { if (!node || typeof node !== 'object') return; nodes.push(node); node.children.forEach(visit); };
  visit(tree);
  return nodes;
};

test('every non-Shanhe theme has distinct bounded decorative artwork and a matching emblem', () => {
  const signatures = new Set();
  for (const theme of CATALOG.filter(item => item.slug !== 'shanhe')) {
    const art = createIntroArtwork(React, theme.slug);
    const emblem = createIntroEmblem(React, theme.slug);
    assert.equal(art.props['data-intro-artwork'], theme.slug);
    assert.equal(art.props['aria-hidden'], true);
    assert.equal(emblem.type, 'svg');
    const nodes = nodesOf(art);
    assert.ok(nodes.length <= 90, theme.slug + ' keeps effects bounded');
    assert.ok(!nodes.some(node => ['video', 'img', 'audio', 'canvas'].includes(node.type)));
    const vectors = nodes.filter(node => ['path', 'circle', 'line', 'ellipse', 'polyline'].includes(node.type));
    assert.ok(vectors.length > 0);
    signatures.add(JSON.stringify(vectors.map(node => [node.type, Object.fromEntries(Object.entries(node.props).filter(([key]) => !['className', 'key'].includes(key)))])));
  }
  assert.equal(signatures.size, CATALOG.length - 1, 'themes differ in geometry, not just labels or colors');
  for (const slug of ['shanhe', 'unknown', '__proto__']) {
    assert.equal(createIntroArtwork(React, slug), null);
    assert.equal(createIntroEmblem(React, slug), null);
  }
});

test('the shipped factory includes the new artwork and theme-specific CSS without additional image bytes', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  let entry;
  vm.runInNewContext(client, { window: { __ModuleLoader__: { load(value) { entry = value; } } } });
  const module = entry.factory(name => { if (name === 'react') return React; throw Error(name); });
  for (const theme of CATALOG.filter(item => item.slug !== 'shanhe')) {
    assert.equal(module.createIntroArtwork(React, theme.slug).props['data-intro-artwork'], theme.slug);
    assert.ok(client.includes(`[data-intro-theme=\\"${theme.slug}\\"]`), theme.slug);
  }
  assert.equal((client.match(/data:image\/webp;base64,/g) ?? []).length, CATALOG.length * 2);
  assert.ok(client.includes('dsh-gallery-intro-themed'));
});
