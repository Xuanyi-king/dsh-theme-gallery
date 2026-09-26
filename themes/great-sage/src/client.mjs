// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-great-sage-theme';

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

export function apply(ctx) {
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
