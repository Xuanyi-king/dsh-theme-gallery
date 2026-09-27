window.__ModuleLoader__.load({
  id: 'dsh-shanhe-theme',
  factory: (require) => {
// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = "/* Decorative layer; official semantic tokens in client.mjs own actual colors. */\nbody[data-shanhe-theme] {\n  --dsw-focus-ring-color: #a43d32;\n  --dsw-elevation-stroke-color: rgba(124, 91, 62, .24);\n  background-color: #faf6ed;\n  color: #2d2925;\n}\n\n/* main and role=main cover both existing Web layout variants. */\nbody[data-shanhe-theme]::before {\n  content: '';\n  position: fixed;\n  inset: 0;\n  z-index: 0;\n  background-color: transparent;\n  background-image: linear-gradient(rgba(247, 242, 232, 0.16), rgba(247, 242, 232, 0.16)), url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDkwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgc2xpY2UiPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYXBlciIgeDI9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjZjZmMGUyIi8+PHN0b3Agb2Zmc2V0PSIuNTUiIHN0b3AtY29sb3I9IiNmYWY2ZWQiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmMGU4ZDYiLz48L2xpbmVhckdyYWRpZW50Pgo8cmFkaWFsR3JhZGllbnQgaWQ9InN1bkdsb3ciPjxzdG9wIHN0b3AtY29sb3I9IiNjMTU1M2YiIHN0b3Atb3BhY2l0eT0iLjYiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iI2MxNTUzZiIgc3RvcC1vcGFjaXR5PSIuMiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2MxNTUzZiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9yYWRpYWxHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJyZiIgeDI9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjOTY5YjkwIiBzdG9wLW9wYWNpdHk9Ii41NSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzk2OWI5MCIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJybSIgeDI9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjNmI2ZTYzIiBzdG9wLW9wYWNpdHk9Ii43MiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzZiNmU2MyIgc3RvcC1vcGFjaXR5PSIuMDUiLz48L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InJuIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiM0MjQzM2MiIHN0b3Atb3BhY2l0eT0iLjk1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNDI0MzNjIiBzdG9wLW9wYWNpdHk9Ii4xNCIvPjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0ibWlzdCIgeDI9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjZmFmNmVkIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjZmFmNmVkIiBzdG9wLW9wYWNpdHk9Ii45Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmFmNmVkIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxNDQwIiBoZWlnaHQ9IjkwMCIgZmlsbD0idXJsKCNwYXBlcikiLz4KPGNpcmNsZSBjeD0iMTE1MCIgY3k9IjIzNiIgcj0iMTU1IiBmaWxsPSJ1cmwoI3N1bkdsb3cpIi8+CjxjaXJjbGUgY3g9IjExNTAiIGN5PSIyMzYiIHI9IjYwIiBmaWxsPSIjYzE1NTNmIiBvcGFjaXR5PSIuODUiLz4KPGcgc3Ryb2tlPSIjM2EzYjM2IiBzdHJva2Utd2lkdGg9IjIuNCIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTgyOCAyMzhxMTAtOSAyMCAwTTg0OCAyMzhxMTAtOSAyMCAwIi8+PHBhdGggZD0iTTkwNSAyODJxOC03IDE2IDBNOTIxIDI4MnE4LTcgMTYgMCIvPjxwYXRoIGQ9Ik03NjIgMzAwcTctNiAxNCAwTTc3NiAzMDBxNy02IDE0IDAiLz48L2c+CjxwYXRoIGQ9Ik0wIDM1MiA5MCAzMDAgMTc1IDMzMCAyODUgMjUwIDM3NSAzMTggNDcwIDI2MiA1NzUgMzMwIDcwNSAyNzIgODE1IDMyMiA5NzUgMjU4IDExMjUgMzI2IDEzMDUgMjQ2IDE0NDAgMzAwVjUyMEgwWiIgZmlsbD0idXJsKCNyZikiLz4KPHJlY3QgeD0iMCIgeT0iMzU2IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIxMjAiIGZpbGw9InVybCgjbWlzdCkiIG9wYWNpdHk9Ii44NSIvPgo8cGF0aCBkPSJNMCA0NTIgMTAwIDM5OCAxOTAgNDI4IDMwNSAzNDAgMzk1IDQwMiA0OTUgMzQ4IDYwMCA0MjggNzQ1IDM2MiA4ODUgNDEwIDEwNDUgMzM2IDExNzAgNDAyIDEzMzAgMzEwIDE0NDAgMzgwVjU2MEgwWiIgZmlsbD0idXJsKCNybSkiLz4KPHJlY3QgeD0iMCIgeT0iNDY2IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIxMzUiIGZpbGw9InVybCgjbWlzdCkiLz4KPHBhdGggZD0iTTAgNTYwIDEyMCA1MDAgMjIwIDU0NSAzNjAgNDQ4IDQ3MCA1MjIgNjEwIDQ2MiA3NDUgNTUyIDkyMCA0NzAgMTA4MCA1NDUgMTI2MCA0NDIgMTM4MCA1MDAgMTQ0MCA0NzBWNzAwSDBaIiBmaWxsPSJ1cmwoI3JuKSIvPgo8cmVjdCB4PSIwIiB5PSI1ODYiIHdpZHRoPSIxNDQwIiBoZWlnaHQ9IjE1MCIgZmlsbD0idXJsKCNtaXN0KSIgb3BhY2l0eT0iLjkiLz4KPHBhdGggZD0iTTAgOTAwVjc2MGMxNDAtNTAgMjQwLTIwIDM2MC01MiAxMjAtMzAgMjIwIDEwIDM0MC04IDEzMC0yMCAyNTAgMjYgMzgwIDYgMTUwLTIyIDI2MCAzMCAzNjAgMTB2MTg0WiIgZmlsbD0iIzQ5NGE0MyIgb3BhY2l0eT0iLjMiLz4KPHBhdGggZD0iTTAgOTAwVjgyMGMyMDAtNzAgMzYwIDEwIDU2MC00MCAxNjAtNDAgMzIwIDMwIDQ4MC02IDE3MC00MCAzMDAgMjAgNDAwLTE0djE0MFoiIGZpbGw9IiMzODM5MzIiIG9wYWNpdHk9Ii42Ii8+CjxwYXRoIGQ9Ik05ODAgOTAwIDEwNjIgNzc4IDExNjAgNzU4IDEyNDIgODAwIDEzMjIgNzU4IDE0NDAgODIwVjkwMFoiIGZpbGw9IiMzMTMyMmMiIG9wYWNpdHk9Ii44OCIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMTUwIDc1NikiIGZpbGw9IiMyODI5MWYiIG9wYWNpdHk9Ii45MiI+PHBhdGggZD0iTTAgMCAtNiA5MiA2IDkyWiIvPjxwYXRoIGQ9Ik0wLTcyIC01NiAtMjIgNTYgLTIyWiIvPjxwYXRoIGQ9Ik0wLTQ2IC00OCA2IDQ4IDZaIi8+PHBhdGggZD0iTTAtMjAgLTQwIDM0IDQwIDM0WiIvPjwvZz4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI2MiA3MDApIHNjYWxlKDEuNikiIGZpbGw9IiMxZDFlMWEiIG9wYWNpdHk9Ii45NSI+PHBhdGggZD0iTS0zLTU4YzQtNCAxMC00IDE0IDBsLTEgOS0xMiAxWm0tMyAxMCAxNy0xIDkgMzktMjkgMVptNyAzNyAzIDM3aC01bC01LTM1Wm0xMCAwIDggMzdoLTVMNi05WiIvPjxwYXRoIGQ9Ik0tMTItNDMgLTM1LTUwbC0yIDMgMjcgMTIgMjQgMSAxNi04LTMtMy0xNyA0WiIvPjxwYXRoIGQ9Im0xNi0xOCA0MSA0MiAyLTItMzctNDZaIi8+PC9nPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAgNzAwKSIgZmlsbD0iIzI4MjkxZiIgb3BhY2l0eT0iLjgyIj48cGF0aCBkPSJNMCAwIC01IDcyIDUgNzJaIi8+PHBhdGggZD0iTTAtNTQgLTQ0IC0xNSA0NCAtMTVaIi8+PHBhdGggZD0iTTAtMzMgLTM3IDcgMzcgN1oiLz48L2c+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMiA3MzIpIHNjYWxlKC44KSIgZmlsbD0iIzI4MjkxZiIgb3BhY2l0eT0iLjciPjxwYXRoIGQ9Ik0wIDAgLTUgNzIgNSA3MloiLz48cGF0aCBkPSJNMC01NCAtNDQgLTE1IDQ0IC0xNVoiLz48cGF0aCBkPSJNMC0zMyAtMzcgNyAzNyA3WiIvPjwvZz4KPHJlY3QgeD0iMCIgeT0iNzE2IiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIxODQiIGZpbGw9InVybCgjbWlzdCkiIG9wYWNpdHk9Ii41NSIvPgo8L3N2Zz4=\");\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n  pointer-events: none;\n}\nbody[data-shanhe-theme] #root {\n  position: relative;\n  z-index: 1;\n  background: transparent;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(h1,h2) {\n  color: #2d2925;\n  letter-spacing: .035em;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(textarea,[contenteditable=\"true\"]) {\n  caret-color: #a43d32;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(textarea,[contenteditable=\"true\"]):focus-visible {\n  outline-color: #a43d32;\n}\n\n/* DSH 0.1.7's live Turn button, selected by its public data attribute.\n   The actual text and adjacent aria-live status remain in the document. */\nbody[data-shanhe-theme] button[data-turn-process][data-shanhe-running] {\n  position: relative;\n  color: #7b5143;\n  background-image: linear-gradient(90deg, transparent 0%, rgba(164,61,50,.1) 37%, #a43d32 50%, rgba(164,61,50,.1) 63%, transparent 100%);\n  background-size: 210% .5px;\n  background-repeat: no-repeat;\n  background-position: 100% 100%;\n  animation: shanhe-ink-trail 3.6s ease-in-out infinite;\n}\n\nbody[data-shanhe-theme] button[data-turn-process][data-shanhe-running] > span:first-child {\n  opacity: 0;\n}\n\nbody[data-shanhe-theme] button[data-turn-process][data-shanhe-running]::before {\n  content: '道';\n  position: absolute;\n  top: 3px;\n  left: 0;\n  width: 16px;\n  height: 16px;\n  border: .5px solid #a43d32;\n  border-radius: 2px;\n  color: #a43d32;\n  text-align: center;\n  font: 11px/16px serif;\n  pointer-events: none;\n  animation: shanhe-seal-breathe 2.8s ease-in-out infinite;\n}\n\nbody[data-shanhe-theme] button[data-turn-process][data-shanhe-running]::after {\n  content: attr(data-shanhe-label);\n  position: absolute;\n  left: 24px;\n  top: 0;\n  max-width: calc(100% - 24px);\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  line-height: 24px;\n  pointer-events: none;\n}\n\n@keyframes shanhe-ink-trail {\n  0%, 100% { background-position: 100% 100%; }\n  50% { background-position: 0 100%; }\n}\n\n@keyframes shanhe-seal-breathe {\n  0%, 100% { opacity: .55; }\n  50% { opacity: 1; }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  body[data-shanhe-theme] :is(button,a) { transition: color .18s ease, background-color .18s ease; }\n}\n\n@media (max-width: 700px) {\n  body[data-shanhe-theme]::before { background-position: 58% center; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  body[data-shanhe-theme] button[data-turn-process][data-shanhe-running],\n  body[data-shanhe-theme] button[data-turn-process][data-shanhe-running]::before {\n    animation: none;\n    background-position: center bottom;\n  }\n}\n\n/* ---- full scene layer: themed hero copy, placeholder and running ornament ---- */\nbody[data-shanhe-theme] [class*=\"_previewBadge\"] { display: none; }\nbody[data-shanhe-theme] [class*=\"_fishHitbox\"] { display: none; }\n\n/* ---- reveal the scene: make the app background family translucent so the fixed body::before scene shows through (orca-link ladder) ---- */\nbody[data-shanhe-theme] {\n  --dsw-alias-bg-base: rgba(247, 242, 232, 0.16) !important;\n  --dsw-alias-bg-layer-1: rgba(251, 247, 239, 0.62) !important;\n  --dsw-alias-bg-layer-2: rgba(240, 233, 220, 0.74) !important;\n  --dsw-alias-bg-layer-3: rgba(230, 218, 200, 0.82) !important;\n  --dsw-alias-bg-module-platform: rgba(245, 238, 227, 0.78) !important;\n  --dsw-alias-bg-overlay: rgba(245, 238, 227, 0.96) !important;\n  --dsw-specific-bubble: rgba(239, 229, 214, 0.84) !important;\n  --dsw-specific-bubble-highlight: rgba(228, 211, 189, 0.94) !important;\n  --dsw-specific-input-major: rgba(251, 248, 241, 0.72) !important;\n  --dsw-specific-menu: rgba(248, 242, 231, 0.96) !important;\n  --dsw-specific-selector: rgba(241, 233, 220, 0.9) !important;\n  --dsw-specific-sidebar-fill: rgba(241, 236, 226, 0.58) !important;\n  --dsw-specific-sidebar-nav-item-active: rgba(233, 223, 209, 0.82) !important;\n  --dsw-specific-sidebar-nav-item-hover: rgba(234, 226, 214, 0.86) !important;\n}\nbody[data-shanhe-theme] [class*=\"_titleGroup\"] > span:first-child::after {\n  content: '—— 以一念为始 行万里山河 ——';\n  font-size: 15px; letter-spacing: .2em; color: #8b8072;\n  text-shadow: none; white-space: nowrap;\n  display: block; margin-top: 8px;\n}\nbody[data-shanhe-theme] [data-shanhe-orn] {\n  position: fixed; left: var(--dsh-orn-x, 50%); top: var(--dsh-orn-y, 72%);\n  transform: translateX(-50%); display: none; flex-direction: column;\n  align-items: center; gap: 10px; pointer-events: none; z-index: 45;\n}\nbody[data-shanhe-theme][data-shanhe-busy] [data-shanhe-orn] { display: flex; }\nbody[data-shanhe-theme] [data-shanhe-orn-glyph] { position: relative; width: 46px; height: 46px; }\nbody[data-shanhe-theme] [data-shanhe-orn-ring] {\n  position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; margin: -11px 0 0 -11px;\n  border: 1px solid rgba(164, 61, 50, 0.85); border-radius: 50%; opacity: 0;\n  animation: shanhe-orn-ring 2.8s ease-out infinite;\n}\nbody[data-shanhe-theme] [data-shanhe-orn-ring]:nth-child(2) { animation-delay: .9s; }\nbody[data-shanhe-theme] [data-shanhe-orn-ring]:nth-child(3) { animation-delay: 1.8s; }\n@keyframes shanhe-orn-ring {\n  0% { transform: scale(.45); opacity: .9; }\n  100% { transform: scale(2.7); opacity: 0; }\n}\nbody[data-shanhe-theme] [data-shanhe-orn-text] {\n  font-size: 13px; letter-spacing: .2em; color: #a43d32;\n  text-shadow: 0 0 14px rgba(164, 61, 50, 0.55);\n  animation: shanhe-orn-glow 3.2s ease-in-out infinite;\n}\n@keyframes shanhe-orn-glow { 0%, 100% { opacity: .68; } 50% { opacity: 1; } }\nbody[data-shanhe-theme] [data-shanhe-orn-glyph] { display: flex; align-items: center; justify-content: center; animation: shanhe-orn-float 3.4s ease-in-out infinite; }\nbody[data-shanhe-theme] [data-shanhe-orn-glyph]::before { content: '道'; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: .5px solid #a43d32; border-radius: 3px; color: #a43d32; font-size: 16px; }\n@keyframes shanhe-orn-float { 0%, 100% { transform: translateY(2px) rotate(-4deg); } 50% { transform: translateY(-3px) rotate(4deg); } }\n@media (min-width: 701px) {\n  body[data-shanhe-theme][data-shanhe-busy]::before { animation: shanhe-scene-drift 32s ease-in-out infinite alternate; }\n}\n@keyframes shanhe-scene-drift { from { background-position: 50% 46%; } to { background-position: 50% 54%; } }\n@media (prefers-reduced-motion: reduce) {\n  body[data-shanhe-theme] [data-shanhe-orn-ring], body[data-shanhe-theme] [data-shanhe-orn-text], body[data-shanhe-theme] [data-shanhe-orn-glyph], body[data-shanhe-theme] [data-shanhe-orn-glyph]::before { animation: none; }\n  body[data-shanhe-theme][data-shanhe-busy]::before { animation: none; }\n}\n";
const STYLE_ID = 'dsh-shanhe-jianyi';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
const SCENE = Object.freeze({
  title: '',
  tagline: '—— 以一念为始 行万里山河 ——',
  badge: '',
  placeholder: '写下你的问题，或唤起一位同行者…',
});

const ORN = 'data-shanhe-orn';
const ORN_RING = 'data-shanhe-orn-ring';
const ORN_GLYPH = 'data-shanhe-orn-glyph';
const ORN_TEXT = 'data-shanhe-orn-text';
const BUSY = 'data-shanhe-busy';
const PLACEHOLDER_ORIG = 'data-shanhe-ph';
const RUNNING = 'data-shanhe-running';
const LABEL = 'data-shanhe-label';
let richQueued = false;
let richGeneration = 0;
let lastX = null;
let lastY = null;

function composerRect(button) {
  let node = button;
  const own = button?.getBoundingClientRect?.() ?? null;
  for (let step = 0; step < 4 && node?.parentElement; step += 1) {
    const outer = node.parentElement.getBoundingClientRect?.();
    if (outer && outer.width >= 320 && outer.height <= 220) return outer;
    node = node.parentElement;
  }
  return own;
}

/** The composer is a Lexical contenteditable: its hint lives in a sibling
 * element whose class ends in "_placeholder", not in a textarea attribute. */
function placeholderBox(root) {
  const boxes = root?.querySelectorAll?.('[class*="_placeholder"]') ?? [];
  for (const box of boxes) {
    const prev = box.previousElementSibling;
    if (prev && typeof prev.className === 'string' && prev.className.includes('_input')) return box;
  }
  return null;
}

function syncPlaceholder(root) {
  const box = placeholderBox(root);
  if (!box?.setAttribute || !box.getAttribute) return;
  const want = SCENE.placeholder || null;
  const stash = box.getAttribute(PLACEHOLDER_ORIG);
  const now = box.textContent ?? '';
  if (want === null) {
    if (stash !== null) {
      box.removeAttribute?.(PLACEHOLDER_ORIG);
      if (stash !== now) box.textContent = stash;
    }
    return;
  }
  if (now === want) return;
  if (stash === null) box.setAttribute(PLACEHOLDER_ORIG, now);
  box.textContent = want;
}

function syncOrnament(root, documentRef) {
  if (!root?.setAttribute) return;
  const button = root.querySelector?.(`button[${RUNNING}]`) ?? null;
  if (!button) {
    root.removeAttribute?.(BUSY);
    return;
  }
  if (!root.getAttribute?.(BUSY)) root.setAttribute(BUSY, '');
  let box = root.querySelector?.(`[${ORN}]`);  if (!box) {
    if (!root.querySelector) return;
    const host = documentRef ?? (typeof document === 'undefined' ? null : document);
    const created = host?.createElement?.('div');
    if (!created?.setAttribute) return;
    created.setAttribute(ORN, '');
    created.setAttribute('aria-hidden', 'true');
    created.innerHTML = `<span ${ORN_GLYPH}><i ${ORN_RING}></i><i ${ORN_RING}></i><i ${ORN_RING}></i></span><span ${ORN_TEXT}></span>`;
    root.appendChild?.(created);
    box = created;
  }
  const text = button.getAttribute?.(LABEL) ?? '';
  const slot = box.querySelector?.(`[${ORN_TEXT}]`);
  if (slot && slot.textContent !== text) slot.textContent = text;
  const rect = composerRect(button);
  if (rect && box.style?.setProperty) {
    const x = `${Math.round(rect.left + rect.width / 2)}px`;
    const y = `${Math.round(rect.bottom + 20)}px`;
    if (x !== lastX || y !== lastY) {
      lastX = x;
      lastY = y;
      box.style.setProperty('--dsh-orn-x', x);
      box.style.setProperty('--dsh-orn-y', y);
    }
  }
}

function flushRich(root, documentRef) {
  syncOrnament(root, documentRef);
  syncPlaceholder(root);
}

function resetRich(root) {
  richGeneration += 1;
  richQueued = false;
  lastX = null;
  lastY = null;
  root?.removeAttribute?.(BUSY);
  root?.querySelector?.(`[${ORN}]`)?.remove?.();
  const box = placeholderBox(root);
  const stash = box?.getAttribute?.(PLACEHOLDER_ORIG);
  if (stash !== null && stash !== undefined && box?.setAttribute) {
    box.removeAttribute?.(PLACEHOLDER_ORIG);
    if (box.textContent !== stash) box.textContent = stash;
  }
}

/** One animation frame per batch of mutations: the theme already observes every
 * mutation, so an unthrottled rect read per streamed token would thrash layout. */
function scheduleRich(root, documentRef) {
  if (richQueued) return;
  if (typeof requestAnimationFrame !== 'function') {
    flushRich(root, documentRef);
    return;
  }
  richQueued = true;
  const generation = richGeneration;
  requestAnimationFrame(() => {
    richQueued = false;
    if (generation !== richGeneration) return;
    flushRich(root, documentRef);
  });
}

function installRich(root, documentRef) {
  if (!root) return () => {};
  flushRich(root, documentRef);
  if (typeof MutationObserver !== 'function') return () => resetRich(root);
  const observer = new MutationObserver(() => scheduleRich(root, documentRef));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    resetRich(root);
  };
}


const THEME = Object.freeze({
  id: 'shanhe-jianyi',
  colorScheme: 'light',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#f7f2e8',
    '--dsw-alias-bg-layer-1': '#fbf7ef',
    '--dsw-alias-bg-layer-2': '#f0e9dc',
    '--dsw-alias-bg-layer-3': '#e6dac8',
    '--dsw-alias-bg-overlay': '#f5eee3',
    '--dsw-alias-bg-module-platform': '#f5eee3',
    '--dsw-alias-bg-multi-select': '#f0e9dc',
    '--dsw-alias-label-primary': '#2d2925',
    '--dsw-alias-label-secondary': '#665e55',
    '--dsw-alias-label-tertiary': '#8b8072',
    '--dsw-alias-label-caption': '#796e62',
    '--dsw-alias-label-primary-inverted': '#fffaf2',
    '--dsw-alias-brand-primary': '#a43d32',
    '--dsw-alias-state-business-primary': '#a43d32',
    '--dsw-alias-button-primary-fill': '#a43d32',
    '--dsw-alias-button-primary-hover': '#8c3028',
    '--dsw-alias-button-info-fill': '#a43d32',
    '--dsw-alias-button-info-hover': '#8c3028',
    '--dsw-alias-button-elevated-fill': '#fbf7ef',
    '--dsw-alias-button-floating-fill': '#fbf7ef',
    '--dsw-alias-button-floating-hover': '#f0e9dc',
    '--dsw-alias-interactive-bg-hover': 'rgba(89, 65, 45, .07)',
    '--dsw-alias-interactive-bg-active': 'rgba(89, 65, 45, .13)',
    '--dsw-alias-interactive-bg-hover-solid': '#eee4d5',
    '--dsw-alias-border-l1': 'rgba(98, 73, 47, .11)',
    '--dsw-alias-border-l2': 'rgba(98, 73, 47, .22)',
    '--dsw-alias-border-l3': 'rgba(98, 73, 47, .28)',
    '--dsw-alias-markdown-code-block': '#eee8dd',
    '--dsw-alias-markdown-code-block-banner': '#e8dfd1',
    '--dsw-alias-markdown-inline-code': '#eae1d2',
    '--dsw-alias-markdown-tag': '#eee4d5',
    '--dsw-alias-scrollbar-bg-l1': '#d6c9b7',
    '--dsw-alias-scrollbar-hover-l1': '#baa78f',
    '--dsw-alias-scrollbar-bg-l2': '#d6c9b7',
    '--dsw-alias-scrollbar-hover-l2': '#baa78f',
    '--dsw-alias-tooltip-bg': '#342d27',
    '--dsw-specific-bubble': '#efe5d6',
    '--dsw-specific-bubble-highlight': '#e4d3bd',
    '--dsw-specific-sidebar-fill': '#f1ece2',
    '--dsw-specific-sidebar-nav-item-active': '#e9dfd1',
    '--dsw-specific-sidebar-nav-item-hover': '#eae2d6',
    '--dsw-specific-input-major': '#fbf8f1',
    '--dsw-specific-menu': '#f8f2e7',
    '--dsw-specific-selector': '#f1e9dc',
    '--dsw-specific-tip': '#f1e9dc',
  }),
});

const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '问道山海 · 求索中';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `问道山海 · 已行 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Seeking through mountains';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Seeking through mountains · ${match[1]}` : null;
  }
  return null;
}

function decorateRunningStatuses(root) {
  for (const button of root.querySelectorAll('button[data-turn-process]')) {
    const announcement = button.previousElementSibling;
    const label = announcement?.getAttribute('role') === 'status'
      ? formatRunningStatus(announcement.textContent ?? '', button.textContent ?? '')
      : null;
    if (label === null) {
      button.removeAttribute('data-shanhe-running');
      button.removeAttribute('data-shanhe-label');
    } else {
      button.setAttribute('data-shanhe-running', '');
      button.setAttribute('data-shanhe-label', label);
    }
  }
}

function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-shanhe-running]')) {
      button.removeAttribute('data-shanhe-running');
      button.removeAttribute('data-shanhe-label');
    }
  };
}

function applyPalette(ctx) {
  ctx.effect(() => {
    const previous = ctx.theme.getTheme().preference;
    const unregister = ctx.theme.register(THEME);
    ctx.theme.setTheme(THEME.id);
    return () => {
      if (ctx.theme.getTheme().preference === THEME.id) ctx.theme.setTheme(previous);
      unregister();
    };
  }, 'shanhe-jianyi: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-shanhe-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-shanhe-theme');
      style?.remove();
    };
  }, 'shanhe-jianyi: scenery');
}

function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'shanhe: full scene');
}

    return { apply, inject, THEME };
  }
});
