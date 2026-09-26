import { readFile, mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const source = await read('src/client.mjs');
const scene = await readFile(new URL('assets/cosmic-scene.webp', root));
const css = (await read('assets/theme.css')).replaceAll(
  '__SCENE_URL__', `data:image/webp;base64,${scene.toString('base64')}`,
);
const body = source
  .replace("const STYLE_TEXT = '';", `const STYLE_TEXT = ${JSON.stringify(css)};`)
  .replaceAll('export const ', 'const ')
  .replaceAll('export function ', 'function ');
const client = `window.__ModuleLoader__.load({\n  id: 'dsh-ultraman-theme',\n  factory: (require) => {\n${body}\n    return { apply, inject, THEME };\n  }\n});\n`;
await mkdir(new URL('lib/', root), { recursive: true });
await writeFile(new URL('lib/client.js', root), client);
await writeFile(new URL('lib/index.js', root), 'export function apply() {}\n');
