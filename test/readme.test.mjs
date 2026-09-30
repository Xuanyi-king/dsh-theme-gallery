import test from 'node:test';
import assert from 'node:assert/strict';
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
      'dsh plugin --profile web add https://github.com/Xuanyi-king/dsh-theme-gallery',
      'npm run build', 'npm test', 'npm run pack:gallery', 'node scripts/verify-startup-browser.mjs',
    ]) assert.ok(guide.includes(command), command);
    assert.ok(guide.includes('dsh-theme-gallery/selection.json'));
    assert.ok(guide.includes('1.5'));
    assert.ok(guide.includes('Esc'));
    assert.ok(guide.includes('theme-intros.html'), 'document the all-theme chooser');
    assert.ok(guide.includes('/tmp/dsh-theme-intros-preview/'));
  }
  assert.ok(pkg.files.includes('README.md'));
  assert.ok(pkg.files.includes('README.en.md'), 'the packaged language switch must not lead to a missing guide');
});
