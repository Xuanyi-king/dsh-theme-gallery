// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-perfect-world-theme';

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
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-huangtian-running]')) {
      button.removeAttribute('data-huangtian-running');
      button.removeAttribute('data-huangtian-label');
    }
  };
}

export function apply(ctx) {
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
