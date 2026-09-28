// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-perfect-world-theme';

/* ---- full scene layer: themed hero copy, composer placeholder, running ornament ---- */
export const SCENE = Object.freeze({
  title: '诸天为卷，问道而行',
  tagline: '',
  badge: '荒天帝灵感主题',
  placeholder: '以心问道，写下你的问题…',
});

const ORN = 'data-huangtian-orn';
const ORN_RING = 'data-huangtian-orn-ring';
const ORN_GLYPH = 'data-huangtian-orn-glyph';
const ORN_TEXT = 'data-huangtian-orn-text';
const BUSY = 'data-huangtian-busy';
const PLACEHOLDER_ORIG = 'data-huangtian-ph';
const RUNNING = 'data-huangtian-running';
const LABEL = 'data-huangtian-label';
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
  id: 'huangtian',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#111114',
    '--dsw-alias-bg-layer-1': '#19191b',
    '--dsw-alias-bg-layer-2': '#232126',
    '--dsw-alias-bg-layer-3': '#2f292a',
    '--dsw-alias-bg-overlay': '#251f21',
    '--dsw-alias-bg-module-platform': '#211d20',
    '--dsw-alias-bg-multi-select': '#332a28',
    '--dsw-alias-label-primary': '#f6e9cd',
    '--dsw-alias-label-secondary': '#dfceb1',
    '--dsw-alias-label-tertiary': '#bfae94',
    '--dsw-alias-label-caption': '#c3ac89',
    '--dsw-alias-label-primary-inverted': '#111114',
    '--dsw-alias-brand-primary': '#d6a853',
    '--dsw-alias-state-business-primary': '#c98047',
    '--dsw-alias-button-primary-fill': '#d6a853',
    '--dsw-alias-button-primary-hover': '#edc477',
    '--dsw-alias-button-info-fill': '#bf754d',
    '--dsw-alias-button-info-hover': '#db9161',
    '--dsw-alias-button-elevated-fill': '#332921',
    '--dsw-alias-button-floating-fill': '#3c2b22',
    '--dsw-alias-button-floating-hover': '#4b3529',
    '--dsw-alias-interactive-bg-hover': 'rgba(214, 168, 83, .12)',
    '--dsw-alias-interactive-bg-active': 'rgba(165, 82, 49, .22)',
    '--dsw-alias-interactive-bg-hover-solid': '#3a302b',
    '--dsw-alias-border-l1': 'rgba(222, 174, 102, .18)',
    '--dsw-alias-border-l2': 'rgba(222, 174, 102, .29)',
    '--dsw-alias-border-l3': 'rgba(222, 174, 102, .4)',
    '--dsw-alias-markdown-code-block': '#1e1c20',
    '--dsw-alias-markdown-code-block-banner': '#2b2524',
    '--dsw-alias-markdown-inline-code': '#302724',
    '--dsw-alias-markdown-tag': '#382b27',
    '--dsw-alias-scrollbar-bg-l1': '#4a3b31',
    '--dsw-alias-scrollbar-hover-l1': '#75614b',
    '--dsw-alias-scrollbar-bg-l2': '#584835',
    '--dsw-alias-scrollbar-hover-l2': '#846a4c',
    '--dsw-alias-tooltip-bg': '#111114',
    '--dsw-specific-bubble': '#302722',
    '--dsw-specific-bubble-highlight': '#503a2a',
    '--dsw-specific-sidebar-fill': '#171719',
    '--dsw-specific-sidebar-nav-item-active': '#443022',
    '--dsw-specific-sidebar-nav-item-hover': '#2b2523',
    '--dsw-specific-input-major': '#262022',
    '--dsw-specific-menu': '#302725',
    '--dsw-specific-selector': '#322a26',
    '--dsw-specific-tip': '#302824',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '推演诸天 · 悟道中';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `推演诸天 · 已历 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Realm divination';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Realm divination · ${match[1]}` : null;
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
      button.removeAttribute('data-huangtian-running');
      button.removeAttribute('data-huangtian-label');
    } else {
      button.setAttribute('data-huangtian-running', '');
      button.setAttribute('data-huangtian-label', label);
    }
  }
  // DSH 0.2 places the live status outside the completed process button.
  for (const row of root.querySelectorAll('[data-chat-running]')) {
    if (!row.matches?.('[data-chat-running]')) continue;
    const content = row.querySelector?.('[class*="runningContent"]');
    const native = row.querySelector?.('[class*="runningText"]');
    const visible = (native?.textContent ?? '').trim().replace(/(?:\.{3}|…)$/, '');
    const announcement = visible.startsWith('深度求索中') ? '深度求索中'
      : visible.toLowerCase().startsWith('deep diving') ? 'Deep diving...' : '';
    const themed = content && announcement ? formatRunningStatus(announcement, visible === 'Deep diving' ? 'Deep diving...' : visible) : null;
    if (themed === null) {
      row.removeAttribute('data-huangtian-running');
      content?.removeAttribute('data-huangtian-live-label');
    } else {
      if (row.getAttribute?.('data-huangtian-running') !== '') row.setAttribute('data-huangtian-running', '');
      if (content.getAttribute?.('data-huangtian-live-label') !== themed) content.setAttribute('data-huangtian-live-label', themed);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const row of root.querySelectorAll('[data-chat-running][data-huangtian-running]')) {
      row.removeAttribute('data-huangtian-running');
      row.querySelector?.('[class*="runningContent"]')?.removeAttribute('data-huangtian-live-label');
    }
    for (const button of root.querySelectorAll('button[data-huangtian-running]')) {
      button.removeAttribute('data-huangtian-running');
      button.removeAttribute('data-huangtian-label');
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
  }, 'huangtian: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-huangtian-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-huangtian-theme');
      style?.remove();
    };
  }, 'huangtian: scenery');
}

export function apply(ctx) {
  applyPalette(ctx);
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    return installRich(document.body);
  }, 'huangtian: full scene');
}
