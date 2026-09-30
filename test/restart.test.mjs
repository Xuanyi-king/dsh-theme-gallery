import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registerSelectionRoute, writeSelection } from '../lib/selection-route.js';
import { applyGallery } from '../src/client.mjs';

// Exercise the actual HTTP validation and disk storage, rather than a fake
// fetch that accepts ids the Host would reject.
for (const id of ['gallery-jianlai-aliang', 'gallery-sunny-watch', 'gallery-young-goku']) {
  test(`${id} replaces an older host selection and restores in a fresh browser`, async () => {
    const home = await mkdtemp(join(tmpdir(), 'dsh-gallery-restart-'));
    const controllers = [];
    let route;
    registerSelectionRoute({ register(value) { route = value; return () => {}; } }, { home });
    const server = createServer((req, res) => route.handler(req, res));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    let written;
    const put = new Promise(resolve => { written = resolve; });
    const newBrowser = () => {
      let preference = 'system';
      const data = new Map();
      const gallery = applyGallery({ theme: {
        getTheme: () => ({ preference }), register: () => () => {},
        setTheme(value) { preference = value; },
      } }, {
        document: null, Observer: null,
        storage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) },
        fetchImpl: async (path, options) => {
          const response = await fetch(base + path, options);
          if (options.method === 'PUT') written(response.status);
          return response;
        },
      });
      controllers.push(gallery);
      return gallery;
    };
    try {
      await writeSelection('gallery-nezha', home);
      const first = newBrowser();
      await first.whenReady();
      assert.equal(first.getSelection(), 'gallery-nezha');
      first.select(id);
      assert.equal(await put, 200, 'the Host accepts the selected new theme');
      first.dispose();
      const restarted = newBrowser();
      await restarted.whenReady();
      assert.equal(restarted.getSelection(), id, 'a fresh browser restores the disk selection');
    } finally {
      for (const gallery of controllers) gallery.dispose();
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
      await rm(home, { recursive: true, force: true });
    }
  });
}
