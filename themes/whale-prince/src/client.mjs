// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-whale-prince-theme';

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

export function apply(ctx) {
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
