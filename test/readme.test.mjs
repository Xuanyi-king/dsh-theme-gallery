import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CATALOG } from '../src/catalog.mjs';

test('Chinese is the default README and the English guide covers the same themes and commands', async () => {
  const zh = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const en = await readFile(new URL('../README.en.md', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(zh, /^# DSH 主题库/);
  assert.match(zh, /默认/);
  assert.match(zh, /\[English\]\(README\.en\.md\)/);
  assert.match(en, /^# DSH Theme Gallery/);
  assert.ok(en.includes('(README.md)'));
  for (const guide of [zh, en]) {
    for (const theme of CATALOG) assert.ok(guide.includes(`themes/${theme.slug}/assets/concept-preview.webp`), theme.slug);
    for (const command of [
      'dsh plugin --profile web add @xuanyi-king/dsh-theme-gallery',
      'npm run build', 'npm test', 'npm run pack:gallery', 'node scripts/verify-startup-browser.mjs',
    ]) assert.ok(guide.includes(command), command);
    // Installing straight from the GitHub address is what made the install slow/fragile.
    assert.ok(!/add\s+https?:\/\/github\.com\//.test(guide), 'no GitHub-address install command');
    assert.ok(guide.includes(pkg.name), pkg.name);
    assert.ok(guide.includes('dsh-theme-gallery/selection.json'));
    assert.ok(guide.includes('1.5'));
    assert.ok(guide.includes('Esc'));
    assert.ok(guide.includes('theme-intros.html'), 'document the all-theme chooser');
    assert.ok(guide.includes('/tmp/dsh-theme-intros-preview/'));
  }
  assert.ok(pkg.files.includes('README.md'));
  assert.ok(pkg.files.includes('README.en.md'), 'the packaged language switch must not lead to a missing guide');
});

test('both guides advertise the committed CDN tarball and its checksum', async () => {
  const zh = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const en = await readFile(new URL('../README.en.md', import.meta.url), 'utf8');
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  // Source is a new unpublished version; preserve the existing published artifact.
  const releasedVersion = '0.3.22';
  const tarballName = `${pkg.name.replace(/^@/, '').replace('/', '-')}-${releasedVersion}.tgz`;
  // jsDelivr serves the same file from several endpoints; which one is reachable is network-dependent.
  const cdnHosts = ['cdn.jsdmirror.com', 'testingcf.jsdelivr.net', 'jsd.nn.ci', 'jsdelivr.b-cdn.net', 'fastly.jsdelivr.net', 'quantil.jsdelivr.net'];
  const tarballUrl = `https://${cdnHosts[0]}/gh/Xuanyi-king/dsh-theme-gallery@v${releasedVersion}/artifacts/${tarballName}`;
  const tarball = await readFile(new URL(`../artifacts/${tarballName}`, import.meta.url));
  const sha1 = createHash('sha1').update(tarball).digest('hex');
  for (const guide of [zh, en]) {
    assert.ok(guide.includes(tarballUrl), `document the CDN install URL ${tarballUrl}`);
    assert.ok(guide.includes(sha1), `advertise the sha1 of artifacts/${tarballName}`);
    for (const host of cdnHosts.slice(1)) {
      assert.ok(guide.includes(host), `list the fallback CDN host ${host}`);
    }
  }
  assert.ok(!pkg.files.includes('artifacts'), 'the release tarball must never be packed into itself');
});
