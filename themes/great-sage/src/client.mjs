// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-great-sage-theme';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
export const SCENE = Object.freeze({
  title: '踏云而来，万法皆通',
  tagline: '',
  badge: '齐天大圣灵感主题',
  placeholder: '且问天地，写下你的问题…',
});

const ORN = 'data-qitian-orn';
const ORN_RING = 'data-qitian-orn-ring';
const ORN_GLYPH = 'data-qitian-orn-glyph';
const ORN_TEXT = 'data-qitian-orn-text';
const BUSY = 'data-qitian-busy';
const PLACEHOLDER_ORIG = 'data-qitian-ph';
const RUNNING = 'data-qitian-running';
const LABEL = 'data-qitian-label';
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
  id: 'qitian',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#111824',
    '--dsw-alias-bg-layer-1': '#1b2430',
    '--dsw-alias-bg-layer-2': '#25303d',
    '--dsw-alias-bg-layer-3': '#313c47',
    '--dsw-alias-bg-overlay': '#26303c',
    '--dsw-alias-bg-module-platform': '#222d3a',
    '--dsw-alias-bg-multi-select': '#3a3b3a',
    '--dsw-alias-label-primary': '#fcf1db',
    '--dsw-alias-label-secondary': '#e9d7b7',
    '--dsw-alias-label-tertiary': '#c8b491',
    '--dsw-alias-label-caption': '#d1bb98',
    '--dsw-alias-label-primary-inverted': '#111824',
    '--dsw-alias-brand-primary': '#edba66',
    '--dsw-alias-state-business-primary': '#d98552',
    '--dsw-alias-button-primary-fill': '#edba66',
    '--dsw-alias-button-primary-hover': '#ffcf81',
    '--dsw-alias-button-info-fill': '#d68452',
    '--dsw-alias-button-info-hover': '#efa972',
    '--dsw-alias-button-elevated-fill': '#40362e',
    '--dsw-alias-button-floating-fill': '#4b3d31',
    '--dsw-alias-button-floating-hover': '#5e4834',
    '--dsw-alias-interactive-bg-hover': 'rgba(237, 186, 102, .12)',
    '--dsw-alias-interactive-bg-active': 'rgba(214, 110, 68, .21)',
    '--dsw-alias-interactive-bg-hover-solid': '#4b4035',
    '--dsw-alias-border-l1': 'rgba(230, 181, 104, .18)',
    '--dsw-alias-border-l2': 'rgba(230, 181, 104, .28)',
    '--dsw-alias-border-l3': 'rgba(230, 181, 104, .38)',
    '--dsw-alias-markdown-code-block': '#1d2733',
    '--dsw-alias-markdown-code-block-banner': '#293340',
    '--dsw-alias-markdown-inline-code': '#303b48',
    '--dsw-alias-markdown-tag': '#374450',
    '--dsw-alias-scrollbar-bg-l1': '#52606a',
    '--dsw-alias-scrollbar-hover-l1': '#74818b',
    '--dsw-alias-scrollbar-bg-l2': '#616c72',
    '--dsw-alias-scrollbar-hover-l2': '#8a9295',
    '--dsw-alias-tooltip-bg': '#111824',
    '--dsw-specific-bubble': '#303b48',
    '--dsw-specific-bubble-highlight': '#584535',
    '--dsw-specific-sidebar-fill': '#161e2a',
    '--dsw-specific-sidebar-nav-item-active': '#58442f',
    '--dsw-specific-sidebar-nav-item-hover': '#2b3440',
    '--dsw-specific-input-major': '#26313d',
    '--dsw-specific-menu': '#2b3641',
    '--dsw-specific-selector': '#34414b',
    '--dsw-specific-tip': '#33414a',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '腾云思索 · 正在推演';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `腾云思索 · 已行 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Cloudbound thinking';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Cloudbound thinking · ${match[1]}` : null;
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
      button.removeAttribute('data-qitian-running');
      button.removeAttribute('data-qitian-label');
    } else {
      button.setAttribute('data-qitian-running', '');
      button.setAttribute('data-qitian-label', label);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-qitian-running]')) {
      button.removeAttribute('data-qitian-running');
      button.removeAttribute('data-qitian-label');
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
  }, 'qitian: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-qitian-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-qitian-theme');
      style?.remove();
    };
  }, 'qitian: scenery');
}

export function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'qitian: full scene');
}
