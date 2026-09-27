import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { CATALOG } from '../src/catalog.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const readScene = path => readFile(new URL(path, import.meta.url));
const body = await read('../src/client.mjs');
const sceneMap = {
  shanhe: 'landscape.svg', ultraman: 'cosmic-scene.webp',
  'perfect-world': 'emperor-scene.webp', 'flame-emperor': 'flame-scene.webp',
  'great-sage': 'cloud-palace.webp', nezha: 'lotus-sea.webp',
  'whale-prince': 'ocean-lord.webp',
};
let css = await read('../assets/gallery.css');
for (const item of CATALOG) {
  const slug = item.slug;
  const originalCss = await read(`../themes/${slug}/assets/theme.css`);
  const scene = await readScene(`../themes/${slug}/assets/${sceneMap[slug]}`);
  const mime = sceneMap[slug].endsWith('.svg') ? 'image/svg+xml' : 'image/webp';
  const url = `data:${mime};base64,${scene.toString('base64')}`;
  // Every legacy selector is scoped to exactly this gallery choice.
  const attr = /body\[data-[\w-]+-theme\]/g;
  const running = /data-[\w-]+-running/g;
  const label = /data-[\w-]+-label/g;
  const scoped = originalCss
    .replace(attr, `body[data-dsh-gallery-theme="${slug}"]`)
    .replace(running, 'data-dsh-gallery-running')
    .replace(label, 'data-dsh-gallery-label')
    .replaceAll('__SCENE_URL__', url);
  if (scoped.includes('__SCENE_URL__')) throw new Error(`unbundled scene: ${slug}`);
  css += `\n/* ${slug} */\n${scoped}\n`;
  const preview = await readScene(`../assets/gallery/${slug}.webp`);
  css += `.dsh-gallery-card[data-theme="${item.id}"] .dsh-gallery-scene { background-image: linear-gradient(0deg, rgba(5,12,20,.45), transparent), url("data:image/webp;base64,${preview.toString('base64')}"); background-size: cover; background-position: center; }\n`;
}
const catalog = CATALOG.map(({ slug, id, zh, en, detail, accent, intro, elapsed, english, definition }) =>
  ({ slug, id, zh, en, detail, accent, intro, elapsed, english, definition }));
const client = body
  .replace("import { CATALOG } from './catalog.mjs';", `const CATALOG = ${JSON.stringify(catalog)};`)
  .replace("const STYLE_TEXT = '';", `const STYLE_TEXT = ${JSON.stringify(css)};`)
  .replace('const REACT = null;', "const REACT = require('react');")
  .replaceAll('export const ', 'const ')
  .replaceAll('export function ', 'function ');
if (client.includes('export ') || client.includes("import { CATALOG }")) throw new Error('untransformed client module');
const bundle = `window.__ModuleLoader__.load({\n  id: 'dsh-theme-gallery',\n  factory: (require) => {\n${client}\n    return { apply, inject, CATALOG, formatRunningStatus, createGallerySection };\n  }\n});\n`;
await mkdir(new URL('../lib/', import.meta.url), { recursive: true });
await writeFile(new URL('../lib/client.js', import.meta.url), bundle);
