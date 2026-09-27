// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-ultraman-theme';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
export const SCENE = Object.freeze({
  title: '以光之名，探索未知',
  tagline: '—— 每一次提问，都是新的出发 ——',
  badge: 'bar',
  placeholder: '输入你的问题，点亮下一程探索…',
});

const ORN = 'data-ultra-orn';
const ORN_RING = 'data-ultra-orn-ring';
const ORN_GLYPH = 'data-ultra-orn-glyph';
const ORN_TEXT = 'data-ultra-orn-text';
const BUSY = 'data-ultra-busy';
const PLACEHOLDER_ORIG = 'data-ultra-ph';
const RUNNING = 'data-ultra-running';
const LABEL = 'data-ultra-label';
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
  id: 'ultra-light',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#071523',
    '--dsw-alias-bg-layer-1': '#0c1f33',
    '--dsw-alias-bg-layer-2': '#142a41',
    '--dsw-alias-bg-layer-3': '#1d354e',
    '--dsw-alias-bg-overlay': '#12273b',
    '--dsw-alias-bg-module-platform': '#11283e',
    '--dsw-alias-bg-multi-select': '#17334b',
    '--dsw-alias-label-primary': '#edf7ff',
    '--dsw-alias-label-secondary': '#bbcad9',
    '--dsw-alias-label-tertiary': '#91a7ba',
    '--dsw-alias-label-caption': '#a2b4c5',
    '--dsw-alias-label-primary-inverted': '#071523',
    '--dsw-alias-brand-primary': '#eb4c4a',
    '--dsw-alias-state-business-primary': '#60cefb',
    '--dsw-alias-button-primary-fill': '#eb4c4a',
    '--dsw-alias-button-primary-hover': '#fa6962',
    '--dsw-alias-button-info-fill': '#49caff',
    '--dsw-alias-button-info-hover': '#7addff',
    '--dsw-alias-button-elevated-fill': '#163048',
    '--dsw-alias-button-floating-fill': '#17334c',
    '--dsw-alias-button-floating-hover': '#214361',
    '--dsw-alias-interactive-bg-hover': 'rgba(115, 204, 245, .11)',
    '--dsw-alias-interactive-bg-active': 'rgba(235, 76, 74, .2)',
    '--dsw-alias-interactive-bg-hover-solid': '#203b54',
    '--dsw-alias-border-l1': 'rgba(160, 204, 235, .14)',
    '--dsw-alias-border-l2': 'rgba(160, 204, 235, .27)',
    '--dsw-alias-border-l3': 'rgba(160, 204, 235, .34)',
    '--dsw-alias-markdown-code-block': '#0b1d2f',
    '--dsw-alias-markdown-code-block-banner': '#132a40',
    '--dsw-alias-markdown-inline-code': '#1d3449',
    '--dsw-alias-markdown-tag': '#21374c',
    '--dsw-alias-scrollbar-bg-l1': '#2f4a62',
    '--dsw-alias-scrollbar-hover-l1': '#52718a',
    '--dsw-alias-scrollbar-bg-l2': '#38566c',
    '--dsw-alias-scrollbar-hover-l2': '#61849e',
    '--dsw-alias-tooltip-bg': '#071523',
    '--dsw-specific-bubble': '#132f49',
    '--dsw-specific-bubble-highlight': '#245179',
    '--dsw-specific-sidebar-fill': '#0b1b2d',
    '--dsw-specific-sidebar-nav-item-active': '#402036',
    '--dsw-specific-sidebar-nav-item-hover': '#172e45',
    '--dsw-specific-input-major': '#10263c',
    '--dsw-specific-menu': '#14293f',
    '--dsw-specific-selector': '#19344e',
    '--dsw-specific-tip': '#142e44',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '光能解析 · 聚焦中';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `光能解析 · 已持续 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Light scan';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Light scan · ${match[1]}` : null;
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
      button.removeAttribute('data-ultra-running');
      button.removeAttribute('data-ultra-label');
    } else {
      button.setAttribute('data-ultra-running', '');
      button.setAttribute('data-ultra-label', label);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-ultra-running]')) {
      button.removeAttribute('data-ultra-running');
      button.removeAttribute('data-ultra-label');
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
  }, 'ultra-light: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-ultra-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-ultra-theme');
      style?.remove();
    };
  }, 'ultra-light: scenery');
}

export function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'ultra: full scene');
}
