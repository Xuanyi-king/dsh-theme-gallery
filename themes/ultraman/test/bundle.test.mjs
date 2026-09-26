import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('built client bundle registers with the DSH browser module loader and contains scenery', async () => {
  const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
  const modules = [];
  vm.runInNewContext(bundle, { window: { __ModuleLoader__: { load: item => modules.push(item) } } });
  assert.equal(modules.length, 1);
  assert.equal(modules[0].id, 'dsh-ultraman-theme');
  const client = modules[0].factory();
  assert.equal(typeof client.apply, 'function');
  assert.equal(client.THEME.id, 'ultra-light');
  assert.ok(bundle.includes('data:image/webp;base64,'));
  assert.ok(bundle.includes('prefers-reduced-motion'));
});

test('package declares the installable DSH bundle and browser client', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.equal(pkg.exports['./client'], './lib/client.js');
});
