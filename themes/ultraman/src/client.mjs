// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-ultraman-theme';

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

export function apply(ctx) {
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
