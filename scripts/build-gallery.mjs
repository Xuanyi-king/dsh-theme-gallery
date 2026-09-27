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
// Small line-art marks for the native reply status. The marks animate only
// while DSH reports an active model turn; no standalone decoration is added.
const statusMarks = {
  shanhe: '<path d="M3 17c5-7 8-10 17-13M5 19c6-4 10-4 16-5" stroke="__ACCENT__" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M17 6l3-2-1 3" fill="__ACCENT__"/>',
  ultraman: '<path d="M12 1.5l1.9 8.6L22.5 12l-8.6 1.9L12 22.5l-1.9-8.6L1.5 12l8.6-1.9z" fill="none" stroke="__ACCENT__" stroke-width="1.5"/><circle cx="12" cy="12" r="2.3" fill="__ACCENT__"/>',
  'perfect-world': '<circle cx="12" cy="12" r="8.8" fill="none" stroke="__ACCENT__" stroke-width="1.1" stroke-dasharray="11 3"/><path d="M12 4.5l1.5 6 6 1.5-6 1.5-1.5 6-1.5-6-6-1.5 6-1.5z" fill="none" stroke="__ACCENT__" stroke-width="1.2"/>',
  'flame-emperor': '<path d="M12 2c1.5 4-2 5-1 8 1.5-1 2.8-3 2.8-4C19 11 20 14 18 18c-1.3 2.7-3.5 4-6 4s-5.2-1.8-6-4.5C5 14 8 11 8 8c2 1.2 2.4 3.5 2.4 3.5C13 9 12 6 12 2z" fill="none" stroke="__ACCENT__" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 13c-2 2-2.1 4.5 0 6 2.1-1.5 2-4 0-6z" fill="__ACCENT__"/>',
  'great-sage': '<path d="M4 19L19 4" stroke="__ACCENT__" stroke-width="2.6" stroke-linecap="round"/><path d="M3 17l4 4M17 3l4 4" stroke="__ACCENT__" stroke-width="1.5" stroke-linecap="round"/><path d="M2 10c2-2 4-2 6-1M15 20c2 1 5 0 7-2" fill="none" stroke="__ACCENT__" stroke-width="1"/>',
  nezha: '<path d="M12 19c-4-3-6-7-5-11 3 1 5 4 5 6 0-2 2-5 5-6 1 4-1 8-5 11zM12 16c-2-2-2-7 0-11 2 4 2 9 0 11zM5 13c-1 2 0 5 7 7 7-2 8-5 7-7" fill="none" stroke="__ACCENT__" stroke-width="1.4" stroke-linejoin="round"/>',
  'whale-prince': '<path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 14c-1-3 0-5 0-5-4 0-5-3-5-5 3 .5 4 2 5 3 1-1 2-2.5 5-3 0 2-1 5-5 5" fill="none" stroke="__ACCENT__" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
};
const statusMotion = {
  shanhe: 'gallery-ink 3.6s ease-in-out infinite',
  ultraman: 'gallery-light 2.4s ease-in-out infinite',
  'perfect-world': 'gallery-rune 7s linear infinite',
  'flame-emperor': 'gallery-flame 1.55s ease-in-out infinite alternate',
  'great-sage': 'gallery-staff 3s ease-in-out infinite',
  nezha: 'gallery-lotus 3.6s ease-in-out infinite',
  'whale-prince': 'gallery-tide 3.4s ease-in-out infinite',
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
  css += `body[data-dsh-gallery-theme="${slug}"] { --dsh-gallery-scene: url("${url}"); --dsh-gallery-accent: ${item.accent}; --gallery-sidebar-fill: ${fill}; --gallery-sidebar-ink: ${ink}; --gallery-sidebar-muted: ${muted}; --gallery-sidebar-selected: ${selected}; --gallery-sidebar-trim: ${trim}; --gallery-chrome: ${slug === 'shanhe' ? '#a43d32' : trim}; --gallery-card-fill: ${slug === 'shanhe' ? 'rgba(250,247,240,.87)' : `color-mix(in srgb, ${fill} 77%, transparent)`}; }\n`;
  const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${statusMarks[slug].replaceAll('__ACCENT__', item.accent)}</svg>`;
  css += `body[data-dsh-gallery-theme="${slug}"] { --gallery-status-icon: url("data:image/svg+xml,${encodeURIComponent(mark)}"); --gallery-status-motion: ${statusMotion[slug]}; }\n`;
  const preview = await readScene(`../assets/gallery/${slug}.webp`);
  css += `.dsh-gallery-card[data-theme="${item.id}"] .dsh-gallery-scene { background-image: linear-gradient(0deg, rgba(5,12,20,.45), transparent), url("data:image/webp;base64,${preview.toString('base64')}"); background-size: cover; background-position: center; }\n`;
}
css += `
/* Existing DSH surfaces share the theme scene and accent. No controls are
   inserted: the rules style the native sidebar, conversation and composer. */
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) {
  border-right: 1px solid var(--gallery-sidebar-trim);
  background: var(--dsh-gallery-scene) 18% bottom / auto 100% no-repeat;
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) > [class*="root"] {
  --dsw-specific-sidebar-fill: var(--gallery-sidebar-fill);
  --dsw-alias-label-primary: var(--gallery-sidebar-ink);
  --dsw-alias-label-secondary: var(--gallery-sidebar-muted);
  --dsw-alias-label-tertiary: var(--gallery-sidebar-muted);
  --dsw-alias-interactive-bg-hover: var(--gallery-sidebar-selected);
  color: var(--gallery-sidebar-ink);
  background: linear-gradient(180deg, color-mix(in srgb, var(--gallery-sidebar-fill) 83%, transparent), color-mix(in srgb, var(--gallery-sidebar-fill) 59%, transparent) 42%, color-mix(in srgb, var(--gallery-sidebar-fill) 35%, transparent));
  -webkit-backdrop-filter: brightness(var(--gallery-scene-brightness, 1)) blur(var(--gallery-scene-blur, 0px));
  backdrop-filter: brightness(var(--gallery-scene-brightness, 1)) blur(var(--gallery-scene-blur, 0px));
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
body[data-dsh-gallery-theme] [data-dsh-gallery-orn] { display: none !important; }
@media (max-width: 800px) { body[data-dsh-gallery-theme] [data-composer-card] { backdrop-filter: none; } }
`;
css += `
/* The reference art is already bright; paint it on the actual DSH centre
   column, above the shell's stacked translucent backgrounds. */
body[data-dsh-gallery-theme] :is([data-pane="conversation"], [class*="centerCol"]) {
  position: relative;
  isolation: isolate;
  background: transparent !important;
  --dsw-alias-bg-base: rgba(10, 12, 17, .035) !important;
}
body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"]) {
  --dsw-alias-bg-base: rgba(248, 244, 235, .035) !important;
}
body[data-dsh-gallery-theme] :is([data-pane="conversation"], [class*="centerCol"])::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--gallery-scene-blur, 0px));
  z-index: -1;
  background: var(--dsh-gallery-scene) center / cover no-repeat;
  filter: brightness(var(--gallery-scene-brightness, 1)) blur(var(--gallery-scene-blur, 0px));
  pointer-events: none;
}
body[data-dsh-gallery-theme] [data-conversation-scroll],
body[data-dsh-gallery-theme] [data-composer-card] [contenteditable],
body[data-dsh-gallery-theme] [class*="_titleGroup"],
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"]) :is([data-row-key^="workspace:"], [data-row-key^="session:"], [class*="sectionHeader"]) {
  filter: contrast(var(--gallery-text-contrast, 1));
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
  background: linear-gradient(180deg, color-mix(in srgb, var(--gallery-sidebar-fill) 79%, transparent), color-mix(in srgb, var(--gallery-sidebar-fill) 54%, transparent) 48%, color-mix(in srgb, var(--gallery-sidebar-fill) 26%, transparent));
}
@media (max-width: 700px) {
  body[data-dsh-gallery-theme] [class*="_titleGroup"] > span:first-child::before { font-size: clamp(26px, 7vw, 42px); white-space: normal; }
  body[data-dsh-gallery-theme] [class*="composerHero"] { padding-bottom: 36px; }
  body[data-dsh-gallery-theme="shanhe"] :is([data-pane="conversation"], [class*="centerCol"])::after { display: none; }
  body[data-dsh-gallery-theme="shanhe"] [class*="_titleGroup"]::after { display: none; }
}
`;
css += `
/* Native controls are painted as part of each concept scene. Their real
   buttons, disabled state, hit targets and keyboard focus remain DSH-owned. */
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"] {
  border: 1px solid var(--gallery-chrome);
  border-radius: 11px;
  background:
    radial-gradient(ellipse at 4% 50%, color-mix(in srgb, var(--gallery-chrome) 38%, transparent), transparent 37%),
    radial-gradient(ellipse at 96% 50%, color-mix(in srgb, var(--gallery-chrome) 38%, transparent), transparent 37%),
    color-mix(in srgb, var(--gallery-sidebar-fill) 78%, var(--gallery-sidebar-selected));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--gallery-chrome) 38%, transparent),
    inset 0 0 14px color-mix(in srgb, var(--gallery-chrome) 15%, transparent),
    0 0 18px color-mix(in srgb, var(--gallery-chrome) 27%, transparent);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"]::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid color-mix(in srgb, var(--gallery-chrome) 58%, transparent);
  border-radius: 7px;
  pointer-events: none;
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"]::after {
  content: '';
  position: absolute;
  inset: 6px 8px;
  background:
    radial-gradient(circle at 0 0, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 100% 0, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 0 100%, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 100% 100%, var(--gallery-chrome) 0 2px, transparent 3px);
  pointer-events: none;
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"]:is(:hover, :focus-visible) {
  box-shadow: inset 0 0 0 1px var(--gallery-chrome), 0 0 25px color-mix(in srgb, var(--gallery-chrome) 58%, transparent);
}
body[data-dsh-gallery-theme] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"]:focus-visible {
  outline: 2px solid var(--gallery-chrome);
  outline-offset: 2px;
}
body[data-dsh-gallery-theme="shanhe"] :is([data-pane="sidebar"], [class*="sidebarCol"])
  [class*="root"]:not([class*="collapsed"]) button[class*="newSession"] {
  color: #fff9f2;
  background: linear-gradient(145deg, #ab4437, #8e3028);
}
body[data-dsh-gallery-theme] [data-composer-card] {
  border: 1px solid var(--gallery-chrome);
  border-radius: 21px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--gallery-chrome) 9%, transparent), transparent 46%),
    var(--gallery-card-fill);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--gallery-chrome) 30%, transparent),
    0 16px 35px color-mix(in srgb, var(--gallery-sidebar-fill) 45%, transparent),
    0 0 26px color-mix(in srgb, var(--gallery-chrome) 18%, transparent);
  backdrop-filter: blur(10px);
}
body[data-dsh-gallery-theme] [data-composer-card]::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid color-mix(in srgb, var(--gallery-chrome) 30%, transparent);
  border-radius: 17px;
  background:
    radial-gradient(circle at 0 0, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 100% 0, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 0 100%, var(--gallery-chrome) 0 2px, transparent 3px),
    radial-gradient(circle at 100% 100%, var(--gallery-chrome) 0 2px, transparent 3px);
  pointer-events: none;
}
body[data-dsh-gallery-theme] [data-composer-card]:focus-within {
  box-shadow: inset 0 0 0 1px var(--gallery-chrome), 0 0 26px color-mix(in srgb, var(--gallery-chrome) 31%, transparent);
}
body[data-dsh-gallery-theme] [data-composer-card] button[class*="_primary"] {
  width: 40px;
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--gallery-chrome) 82%, white);
  color: #fff;
  background: radial-gradient(circle at 35% 26%, color-mix(in srgb, var(--gallery-chrome) 68%, white), var(--gallery-chrome) 66%);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--gallery-chrome) 42%, transparent), 0 0 19px color-mix(in srgb, var(--gallery-chrome) 75%, transparent);
}
body[data-dsh-gallery-theme] [data-composer-card] button[class*="_primary"]:hover:not(:disabled) {
  box-shadow: 0 0 0 2px var(--gallery-chrome), 0 0 28px var(--gallery-chrome);
}
body[data-dsh-gallery-theme] [data-composer-card] button[class*="_primary"]:disabled {
  opacity: .62;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--gallery-chrome) 42%, transparent), 0 0 10px color-mix(in srgb, var(--gallery-chrome) 30%, transparent);
}
body[data-dsh-gallery-theme] [data-composer-card] button[class*="_add"] {
  border: 1px solid color-mix(in srgb, var(--gallery-chrome) 68%, transparent);
  color: var(--gallery-sidebar-ink);
  background: color-mix(in srgb, var(--gallery-chrome) 20%, var(--gallery-sidebar-fill));
}
/* The real DSH progress button retains its text and disclosure control. Only
   its visual label and baseline follow the selected theme while it is active. */
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running] {
  position: relative;
  color: var(--gallery-sidebar-ink);
  background: linear-gradient(90deg, transparent 0%, var(--gallery-chrome) 36%, color-mix(in srgb, var(--gallery-chrome) 70%, white) 50%, var(--gallery-chrome) 64%, transparent 100%) 100% 100% / 230% 2px no-repeat !important;
  animation: gallery-progress-flow 3.2s linear infinite !important;
}
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running] > span:first-child {
  opacity: 0 !important;
}
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running]::before {
  content: '' !important;
  display: block !important;
  position: absolute;
  inset: 5px auto auto 0;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 0;
  background: var(--gallery-status-icon) center / contain no-repeat;
  box-shadow: none;
  pointer-events: none;
  transform: none;
  animation: var(--gallery-status-motion) !important;
}
body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running]::after {
  content: attr(data-dsh-gallery-label) !important;
  display: block !important;
  position: absolute;
  inset: 0 auto auto 29px;
  width: calc(100% - 53px);
  max-width: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: inherit;
  line-height: 32px;
  letter-spacing: .06em;
  color: var(--gallery-sidebar-ink);
  text-shadow: 0 1px 7px color-mix(in srgb, var(--gallery-sidebar-fill) 82%, transparent);
  pointer-events: none;
}
@keyframes gallery-progress-flow {
  from { background-position: 100% 100%; }
  to { background-position: -100% 100%; }
}
@keyframes gallery-ink { 0%, 100% { opacity: .48; transform: translateX(-2px); } 50% { opacity: 1; transform: translateX(2px); } }
@keyframes gallery-light { 0%, 100% { opacity: .62; transform: scale(.88); filter: drop-shadow(0 0 1px var(--gallery-chrome)); } 50% { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 0 5px var(--gallery-chrome)); } }
@keyframes gallery-rune { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes gallery-flame { from { opacity: .78; transform: translateY(1px) scale(.92, .93) rotate(-5deg); filter: drop-shadow(0 0 2px var(--gallery-chrome)); } to { opacity: 1; transform: translateY(-2px) scale(1.06, 1.1) rotate(5deg); filter: drop-shadow(0 0 5px var(--gallery-chrome)); } }
@keyframes gallery-staff { 0%, 100% { transform: rotate(-10deg) translateY(1px); } 50% { transform: rotate(10deg) translateY(-1px); } }
@keyframes gallery-lotus { 0%, 100% { transform: scale(.86) rotate(-8deg); opacity: .7; } 50% { transform: scale(1.08) rotate(8deg); opacity: 1; } }
@keyframes gallery-tide { 0%, 100% { transform: translateY(2px); opacity: .64; } 50% { transform: translateY(-2px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running] {
    animation: none !important;
    background-position: center bottom !important;
  }
  body[data-dsh-gallery-theme] button[data-turn-process][data-dsh-gallery-running]::before {
    animation: none !important;
  }
}
body[data-dsh-gallery-theme]:not([data-dsh-gallery-theme="shanhe"]) [class*="_titleGroup"]::after {
  content: '';
  display: block;
  flex: 0 0 min(42vw, 240px);
  height: 2px;
  margin: 10px auto 0;
  background: linear-gradient(90deg, transparent, var(--gallery-chrome), transparent);
  box-shadow: 0 0 13px var(--gallery-chrome);
  pointer-events: none;
}
@media (max-width: 700px) {
  body[data-dsh-gallery-theme] [data-composer-card] { backdrop-filter: none; }
  body[data-dsh-gallery-theme] [data-composer-card] button[class*="_primary"] { width: 34px; height: 34px; }
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
