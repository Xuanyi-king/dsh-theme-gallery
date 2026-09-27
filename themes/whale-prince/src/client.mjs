// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-whale-prince-theme';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
export const SCENE = Object.freeze({
  title: '听潮问道，鲸游万象',
  tagline: '',
  badge: '── 鲸少主题 ──',
  placeholder: '把问题交给深海…',
});

const ORN = 'data-whale-prince-orn';
const ORN_RING = 'data-whale-prince-orn-ring';
const ORN_GLYPH = 'data-whale-prince-orn-glyph';
const ORN_TEXT = 'data-whale-prince-orn-text';
const BUSY = 'data-whale-prince-busy';
const PLACEHOLDER_ORIG = 'data-whale-prince-ph';
const RUNNING = 'data-whale-prince-running';
const LABEL = 'data-whale-prince-label';
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
  id: 'whale-prince',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#081828',
    '--dsw-alias-bg-layer-1': '#102237',
    '--dsw-alias-bg-layer-2': '#172b41',
    '--dsw-alias-bg-layer-3': '#20364b',
    '--dsw-alias-bg-overlay': '#172b3e',
    '--dsw-alias-bg-module-platform': '#14293c',
    '--dsw-alias-bg-multi-select': '#243c4a',
    '--dsw-alias-label-primary': '#edf8ff',
    '--dsw-alias-label-secondary': '#d0e3ee',
    '--dsw-alias-label-tertiary': '#9dbccc',
    '--dsw-alias-label-caption': '#a8c9d8',
    '--dsw-alias-label-primary-inverted': '#081828',
    '--dsw-alias-brand-primary': '#49bde2',
    '--dsw-alias-state-business-primary': '#caa468',
    '--dsw-alias-button-primary-fill': '#49bde2',
    '--dsw-alias-button-primary-hover': '#79dbf2',
    '--dsw-alias-button-info-fill': '#c19a66',
    '--dsw-alias-button-info-hover': '#e2ba83',
    '--dsw-alias-button-elevated-fill': '#213b51',
    '--dsw-alias-button-floating-fill': '#244257',
    '--dsw-alias-button-floating-hover': '#30516a',
    '--dsw-alias-interactive-bg-hover': 'rgba(73, 189, 226, .12)',
    '--dsw-alias-interactive-bg-active': 'rgba(73, 189, 226, .2)',
    '--dsw-alias-interactive-bg-hover-solid': '#29495f',
    '--dsw-alias-border-l1': 'rgba(122, 206, 229, .18)',
    '--dsw-alias-border-l2': 'rgba(122, 206, 229, .29)',
    '--dsw-alias-border-l3': 'rgba(122, 206, 229, .39)',
    '--dsw-alias-markdown-code-block': '#12273b',
    '--dsw-alias-markdown-code-block-banner': '#193247',
    '--dsw-alias-markdown-inline-code': '#203b52',
    '--dsw-alias-markdown-tag': '#28435b',
    '--dsw-alias-scrollbar-bg-l1': '#3c586d',
    '--dsw-alias-scrollbar-hover-l1': '#5a758a',
    '--dsw-alias-scrollbar-bg-l2': '#4a6a80',
    '--dsw-alias-scrollbar-hover-l2': '#6b8799',
    '--dsw-alias-tooltip-bg': '#081828',
    '--dsw-specific-bubble': '#203b52',
    '--dsw-specific-bubble-highlight': '#24435c',
    '--dsw-specific-sidebar-fill': '#0b2034',
    '--dsw-specific-sidebar-nav-item-active': '#58442f',
    '--dsw-specific-sidebar-nav-item-hover': '#183047',
    '--dsw-specific-input-major': '#162e44',
    '--dsw-specific-menu': '#1c3b51',
    '--dsw-specific-selector': '#24475f',
    '--dsw-specific-tip': '#214157',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '鲸息推演 · 潮声渐起';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `鲸息推演 · 已航 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Deep sea thinking';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Deep sea thinking · ${match[1]}` : null;
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
      button.removeAttribute('data-whale-prince-running');
      button.removeAttribute('data-whale-prince-label');
    } else {
      button.setAttribute('data-whale-prince-running', '');
      button.setAttribute('data-whale-prince-label', label);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-whale-prince-running]')) {
      button.removeAttribute('data-whale-prince-running');
      button.removeAttribute('data-whale-prince-label');
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
  }, 'whale-prince: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-whale-prince-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-whale-prince-theme');
      style?.remove();
    };
  }, 'whale-prince: scenery');
}

export function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'whale-prince: full scene');
}
