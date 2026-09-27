// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-shanhe-jianyi';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
export const SCENE = Object.freeze({
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

export function syncPlaceholder(root) {
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

export function syncOrnament(root, documentRef) {
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

export function flushRich(root, documentRef) {
  syncOrnament(root, documentRef);
  syncPlaceholder(root);
}

export function resetRich(root) {
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
export function scheduleRich(root, documentRef) {
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

export function installRich(root, documentRef) {
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


export const THEME = Object.freeze({
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

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
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

export function decorateRunningStatuses(root) {
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

export function installRunningStatus(root, Observer) {
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

export function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'shanhe: full scene');
}
