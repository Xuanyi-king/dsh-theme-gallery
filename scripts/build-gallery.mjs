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
const sword = await readScene('../assets/gallery/shanhe-sword.png');
// The sidebar is a separate DSH surface. Its palette must be applied to the
// sidebar root itself: the global theme tokens alone leave workspace rows and
// controls looking like the stock UI over a themed conversation scene.
const sidebarPalettes = {
  shanhe: ['#f3eee4', '#282b2a', '#766c62', '#eee3d2', '#d9bda7'],
  ultraman: ['#0d1930', '#f1f6ff', '#afc6e8', '#243954', '#74cfff'],
  'perfect-world': ['#151217', '#f8efda', '#c7b591', '#332b28', '#d6a853'],
  'flame-emperor': ['#121d23', '#f4efe7', '#b9cbc8', '#283b40', '#45cbc3'],
  'great-sage': ['#17222b', '#f9f0dd', '#c9c1b0', '#353b3c', '#edba66'],
  nezha: ['#292332', '#fff2e8', '#d8bbad', '#493442', '#f4a178'],
  'whale-prince': ['#0a2038', '#f4f7fc', '#a9c2d8', '#193b5b', '#dfc28d'],
};
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
  const [fill, ink, muted, selected, trim] = sidebarPalettes[slug];
  css += `body[data-dsh-gallery-theme="${slug}"] { --dsh-gallery-scene: url("${url}"); --dsh-gallery-accent: ${item.accent}; --gallery-sidebar-fill: ${fill}; --gallery-sidebar-ink: ${ink}; --gallery-sidebar-muted: ${muted}; --gallery-sidebar-selected: ${selected}; --gallery-sidebar-trim: ${trim}; }\n`;
  const preview = await readScene(`../assets/gallery/${slug}.webp`);
  css += `.dsh-gallery-card[data-theme="${item.id}"] .dsh-gallery-scene { background-image: linear-gradient(0deg, rgba(5,12,20,.45), transparent), url("data:image/webp;base64,${preview.toString('base64')}"); background-size: cover; background-position: center; }\n`;
}
css += `
/* Existing DSH surfaces share the theme scene and accent. No controls are
   inserted: the rules style the native sidebar, conversation and composer. */
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) { border-right: 1px solid var(--gallery-sidebar-trim); }
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) > [class*="root"] {
  --dsw-specific-sidebar-fill: var(--gallery-sidebar-fill);
  --dsw-alias-label-primary: var(--gallery-sidebar-ink);
  --dsw-alias-label-secondary: var(--gallery-sidebar-muted);
  --dsw-alias-label-tertiary: var(--gallery-sidebar-muted);
  --dsw-alias-interactive-bg-hover: var(--gallery-sidebar-selected);
  color: var(--gallery-sidebar-ink);
  background: linear-gradient(180deg, color-mix(in srgb, var(--gallery-sidebar-fill) 94%, transparent), var(--gallery-sidebar-fill) 42%, color-mix(in srgb, var(--gallery-sidebar-fill) 90%, transparent)), var(--dsh-gallery-scene);
  background-size: cover;
  background-position: left center;
}
/* The original controls and Workspace tree remain interactive and keep their
   native focus, menus, collapse state and row positions. */
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [class*="root"]:not([class*="collapsed"]) button[class*="newSession"] {
  border: 1px solid var(--gallery-sidebar-trim);
  color: var(--gallery-sidebar-ink);
  background: color-mix(in srgb, var(--gallery-sidebar-selected) 70%, var(--gallery-sidebar-fill));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gallery-sidebar-ink) 12%, transparent), 0 5px 18px color-mix(in srgb, var(--gallery-sidebar-trim) 24%, transparent);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [class*="sectionHeader"] {
  color: var(--gallery-sidebar-muted);
  border-bottom: 1px solid color-mix(in srgb, var(--gallery-sidebar-trim) 50%, transparent);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [data-row-key^="workspace:"] {
  color: var(--gallery-sidebar-ink);
  border: 1px solid color-mix(in srgb, var(--gallery-sidebar-trim) 42%, transparent);
  background: color-mix(in srgb, var(--gallery-sidebar-selected) 38%, transparent);
  margin-block: 3px;
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [data-row-key^="workspace:"] [class*="folder"] {
  color: var(--gallery-sidebar-trim);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [data-row-key^="session:"] {
  color: var(--gallery-sidebar-ink);
  border-inline-start: 2px solid transparent;
  transition: background-color .18s ease, border-color .18s ease;
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) :is([data-row-key^="workspace:"], [data-row-key^="session:"]):hover {
  background: var(--gallery-sidebar-selected);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [data-row-key^="session:"][aria-selected="true"] {
  border-inline-start-color: var(--gallery-sidebar-trim);
  background: var(--gallery-sidebar-selected);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gallery-sidebar-trim) 38%, transparent);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) [data-slot="sidebar.settings"] button {
  color: var(--gallery-sidebar-ink);
}
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
css += `
/* The reference art is already bright; paint it on the actual DSH centre
   column, above the shell's stacked translucent backgrounds. */
body[data-dsh-gallery-theme] :is([data-pane="conversation"], [class*="centerCol"]) {
  background: linear-gradient(rgba(9, 11, 16, .025), rgba(9, 11, 16, .065)), var(--dsh-gallery-scene) center / cover no-repeat;
  --dsw-alias-bg-base: rgba(10, 12, 17, .035) !important;
}
body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"]) {
  background: var(--dsh-gallery-scene) center / cover no-repeat;
  --dsw-alias-bg-base: rgba(248, 244, 235, .035) !important;
}
body[data-dsh-gallery-theme] [class*="composerHero"] { padding-bottom: clamp(64px, 11vh, 150px); }
/* The existing headline becomes the scene's calligraphy. The generic
   'inspired theme' pill is removed from every theme. */
body[data-dsh-gallery-theme] [class*="_titleGroup"]::before { content: none !important; display: none !important; }
body[data-dsh-gallery-theme] [class*="_titleGroup"] > span:first-child::before {
  font-family: "STKaiti", "KaiTi", "Kaiti SC", "Songti SC", serif;
  font-size: clamp(36px, 3.9vw, 66px);
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: .09em;
}
body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"] > span:first-child::before {
  font-size: clamp(38px, 4vw, 68px);
  color: #272522;
  text-shadow: 0 2px 2px rgba(48, 37, 26, .1);
}
body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"] > span:first-child::after {
  font-family: "STKaiti", "KaiTi", "Kaiti SC", serif;
  font-size: clamp(14px, 1.25vw, 21px);
  color: #584d40;
  letter-spacing: .25em;
  margin-top: 12px;
}
body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"] { position: relative; }
body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"]::after {
  content: '深';
  position: absolute;
  inset-inline-end: -28px;
  top: 8px;
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border: 2px solid #a73e35;
  color: #a73e35;
  font: 18px/1 serif;
  transform: rotate(-5deg);
  pointer-events: none;
}
body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"]) { position: relative; }
body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"])::after {
  content: '';
  position: absolute;
  z-index: 3;
  left: -28px;
  top: 0;
  width: 56px;
  height: 100%;
  background: url("data:image/png;base64,${sword.toString('base64')}") center / 56px 100% no-repeat;
  pointer-events: none;
}
body[data-dsh-gallery-theme]:not([data-dsh-gallery-theme="shanhe"]) :is([data-pane="sidebar"], [class*="sidebarCol"]) > [class*="root"] {
  background: linear-gradient(180deg, color-mix(in srgb, var(--gallery-sidebar-fill) 96%, transparent), color-mix(in srgb, var(--gallery-sidebar-fill) 89%, transparent) 53%, color-mix(in srgb, var(--gallery-sidebar-fill) 55%, transparent)), var(--dsh-gallery-scene) left bottom / cover no-repeat;
}
@media (max-width: 700px) {
  body[data-dsh-gallery-theme] [class*="_titleGroup"] > span:first-child::before { font-size: clamp(26px, 7vw, 42px); white-space: normal; }
  body[data-dsh-gallery-theme] [class*="composerHero"] { padding-bottom: 36px; }
  body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"])::after { display: none; }
  body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"]::after { display: none; }
}
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
