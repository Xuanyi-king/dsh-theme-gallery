import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { CATALOG } from '../src/catalog.mjs';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const readScene = path => readFile(new URL(path, import.meta.url));
const body = await read('../src/client.mjs');
const sceneMap = {
  shanhe: 'ink-landscape.webp', ultraman: 'cosmic-scene.webp',
  'perfect-world': 'emperor-scene.webp', 'flame-emperor': 'flame-scene.webp',
  'great-sage': 'cloud-palace.webp', nezha: 'lotus-sea.webp',
  'whale-prince': 'ocean-lord.webp',
};
let css = await read('../assets/gallery.css');
for (const item of CATALOG) {
  const slug = item.slug;
  const originalCss = await read(`../themes/${slug}/assets/theme.css`);
  const scene = await readScene(`../themes/${slug}/assets/${sceneMap[slug]}`);
  const url = `data:image/webp;base64,${scene.toString('base64')}`;
  // Every legacy selector is scoped to exactly this gallery choice.
  const attr = /body\[data-[\w-]+-theme\]/g;
  const running = /data-[\w-]+-running/g;
  const label = /data-[\w-]+-label/g;
  const ornamentPart = /data-[\w-]+-orn-(ring|glyph|text)/g;
  const ornament = /data-[\w-]+-orn\b/g;
  const busy = /data-[\w-]+-busy/g;
  const scoped = originalCss
    .replace(attr, `body[data-dsh-gallery-theme="${slug}"]`)
    .replace(running, 'data-dsh-gallery-running')
    .replace(label, 'data-dsh-gallery-label')
    .replace(ornamentPart, 'data-dsh-gallery-orn-$1')
    .replace(ornament, 'data-dsh-gallery-orn')
    .replace(busy, 'data-dsh-gallery-busy')
    .replaceAll('url("__SCENE_URL__")', 'var(--dsh-gallery-scene)')
    .replaceAll('__SCENE_URL__', url)
    .replaceAll('var(--dsh-shanhe-scene)', 'var(--dsh-gallery-scene)');
  if (scoped.includes('__SCENE_URL__')) throw new Error(`unbundled scene: ${slug}`);
  css += `\n/* ${slug} */\n${scoped}\n`;
  css += `body[data-dsh-gallery-theme="${slug}"] { --dsh-gallery-scene: url("${url}"); --dsh-gallery-accent: ${item.accent}; }\n`;
  const preview = await readScene(`../assets/gallery/${slug}.webp`);
  css += `.dsh-gallery-card[data-theme="${item.id}"] .dsh-gallery-scene { background-image: linear-gradient(0deg, rgba(5,12,20,.45), transparent), url("data:image/webp;base64,${preview.toString('base64')}"); background-size: cover; background-position: center; }\n`;
}
css += `
/* Existing DSH surfaces share the theme scene and accent. No controls are
   inserted: the rules style the native sidebar, conversation and composer. */
body[data-dsh-gallery-theme] div:has(> [data-shell-overlay]) > div:first-child { border-right: 1px solid color-mix(in srgb, var(--dsh-gallery-accent) 48%, transparent); }
body[data-dsh-gallery-theme] div:has(> [data-shell-overlay]) > div:first-child > div:first-child { background-image: linear-gradient(180deg, var(--dsw-specific-sidebar-fill) 0%, color-mix(in srgb, var(--dsw-specific-sidebar-fill) 96%, transparent) 40%, color-mix(in srgb, var(--dsw-specific-sidebar-fill) 68%, transparent) 72%, color-mix(in srgb, var(--dsw-specific-sidebar-fill) 48%, transparent)), var(--dsh-gallery-scene); background-size: cover; background-position: left center; }
body[data-dsh-gallery-theme] div:has(> [data-shell-overlay]) > div:first-child > div:first-child > button:first-of-type { border: 1px solid color-mix(in srgb, var(--dsh-gallery-accent) 60%, transparent); background: color-mix(in srgb, var(--dsh-gallery-accent) 18%, var(--dsw-specific-sidebar-fill)); box-shadow: inset 0 1px 0 color-mix(in srgb, var(--dsh-gallery-accent) 25%, transparent), 0 5px 18px color-mix(in srgb, var(--dsh-gallery-accent) 13%, transparent); }
body[data-dsh-gallery-theme] div:has(> [data-shell-overlay]) > div:first-child [data-row-key^="session:"][aria-selected="true"] { border-left: 2px solid var(--dsh-gallery-accent); background: color-mix(in srgb, var(--dsh-gallery-accent) 16%, transparent); }
body[data-dsh-gallery-theme] [data-conversation-region="chat"] { background: linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-bg-base) 56%, transparent), transparent 78%); }
body[data-dsh-gallery-theme] [data-conversation-region="chat"][data-content-phase="hero"] { background: transparent; }
body[data-dsh-gallery-theme] [data-conversation-scroll] { background: transparent; }
body[data-dsh-gallery-theme] [data-conversation-region="composer"] { background: transparent; }
body[data-dsh-gallery-theme] [data-composer-card] { border: 1px solid color-mix(in srgb, var(--dsh-gallery-accent) 65%, transparent); background: color-mix(in srgb, var(--dsw-specific-input-major) 91%, transparent); box-shadow: 0 14px 38px color-mix(in srgb, var(--dsw-alias-bg-base) 30%, transparent), inset 0 1px 0 color-mix(in srgb, var(--dsh-gallery-accent) 25%, transparent); backdrop-filter: blur(12px); }
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running] { background: none !important; animation: none !important; }
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running] > span:first-child { opacity: 1 !important; }
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running]::before,
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running]::after { display: none !important; }
body[data-dsh-gallery-theme] [data-dsh-gallery-orn] { display: none !important; }
@media (max-width: 800px) { body[data-dsh-gallery-theme] [data-composer-card] { backdrop-filter: none; } }
`;
const catalog = CATALOG.map(({ slug, id, zh, en, detail, accent, intro, elapsed, english, placeholder, definition }) =>
  ({ slug, id, zh, en, detail, accent, intro, elapsed, english, placeholder, definition }));
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
