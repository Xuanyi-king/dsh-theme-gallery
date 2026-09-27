import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { readSelection, writeSelection, registerSelectionRoute } from '../lib/selection-route.js';

test('host stores a selected theme across independent reads and supports reset', async () => {
  const home = await mkdtemp(join(tmpdir(), 'dsh-theme-gallery-'));
  try {
    assert.equal(await readSelection(home), null);
    await writeSelection('gallery-whale-prince', home);
    assert.equal(await readSelection(home), 'gallery-whale-prince');
    await writeSelection(null, home);
    assert.equal(await readSelection(home), null);
    await assert.rejects(writeSelection('../unsafe', home), /unknown theme/);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('route validates origin and theme ids, and reads back the selected theme', async () => {
  const home = await mkdtemp(join(tmpdir(), 'dsh-theme-gallery-route-'));
  let route;
  const dispose = registerSelectionRoute({ register(def) { route = def; return () => {}; } }, { home });
  const call = async (method, payload, origin = 'http://localhost:3080') => {
    const req = Readable.from(payload === undefined ? [] : [Buffer.from(JSON.stringify(payload))]);
    req.method = method; req.headers = { host: 'localhost:3080', origin };
    const result = { status: null, body: '' };
    const res = { writeHead(code) { result.status = code; }, end(data = '') { result.body = data; } };
    await route.handler(req, res);
    return result;
  };
  try {
    assert.equal(route.path, '/dsh-theme-gallery/selection');
    const written = await call('PUT', { themeId: 'gallery-nezha' });
    assert.equal(written.status, 200, written.body);
    assert.equal(JSON.parse((await call('GET')).body).themeId, 'gallery-nezha');
    assert.equal((await call('PUT', { themeId: 'gallery-unknown' })).status, 400);
    assert.equal((await call('PUT', { themeId: null }, 'https://evil.example')).status, 403);
    assert.equal(JSON.parse((await call('GET')).body).themeId, 'gallery-nezha');
  } finally { dispose(); await rm(home, { recursive: true, force: true }); }
});
