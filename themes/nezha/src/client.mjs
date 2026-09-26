// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-nezha-theme';

export const THEME = Object.freeze({
  id: 'nezha',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#0e1d25',
    '--dsw-alias-bg-layer-1': '#162a32',
    '--dsw-alias-bg-layer-2': '#1d333c',
    '--dsw-alias-bg-layer-3': '#27414a',
    '--dsw-alias-bg-overlay': '#1c323a',
    '--dsw-alias-bg-module-platform': '#1a3039',
    '--dsw-alias-bg-multi-select': '#393739',
    '--dsw-alias-label-primary': '#fff0e5',
    '--dsw-alias-label-secondary': '#eed4c5',
    '--dsw-alias-label-tertiary': '#ccada5',
    '--dsw-alias-label-caption': '#d7ada1',
    '--dsw-alias-label-primary-inverted': '#0e1d25',
    '--dsw-alias-brand-primary': '#e89c6e',
    '--dsw-alias-state-business-primary': '#d45c50',
    '--dsw-alias-button-primary-fill': '#e89c6e',
    '--dsw-alias-button-primary-hover': '#ffc68c',
    '--dsw-alias-button-info-fill': '#d76553',
    '--dsw-alias-button-info-hover': '#f29a80',
    '--dsw-alias-button-elevated-fill': '#3e3537',
    '--dsw-alias-button-floating-fill': '#503938',
    '--dsw-alias-button-floating-hover': '#67423d',
    '--dsw-alias-interactive-bg-hover': 'rgba(232, 156, 110, .12)',
    '--dsw-alias-interactive-bg-active': 'rgba(215, 91, 81, .23)',
    '--dsw-alias-interactive-bg-hover-solid': '#44393d',
    '--dsw-alias-border-l1': 'rgba(238, 159, 126, .18)',
    '--dsw-alias-border-l2': 'rgba(238, 159, 126, .29)',
    '--dsw-alias-border-l3': 'rgba(238, 159, 126, .39)',
    '--dsw-alias-markdown-code-block': '#172b34',
    '--dsw-alias-markdown-code-block-banner': '#20353e',
    '--dsw-alias-markdown-inline-code': '#293e47',
    '--dsw-alias-markdown-tag': '#304851',
    '--dsw-alias-scrollbar-bg-l1': '#4e6367',
    '--dsw-alias-scrollbar-hover-l1': '#718689',
    '--dsw-alias-scrollbar-bg-l2': '#60787a',
    '--dsw-alias-scrollbar-hover-l2': '#879b98',
    '--dsw-alias-tooltip-bg': '#0e1d25',
    '--dsw-specific-bubble': '#293e47',
    '--dsw-specific-bubble-highlight': '#6a403c',
    '--dsw-specific-sidebar-fill': '#10242b',
    '--dsw-specific-sidebar-nav-item-active': '#58442f',
    '--dsw-specific-sidebar-nav-item-hover': '#20343c',
    '--dsw-specific-input-major': '#1e323a',
    '--dsw-specific-menu': '#223b42',
    '--dsw-specific-selector': '#29454a',
    '--dsw-specific-tip': '#29424a',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '莲火推演 · 正在凝神';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `莲火推演 · 已历 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Lotus flame insight';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Lotus flame insight · ${match[1]}` : null;
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
      button.removeAttribute('data-nezha-running');
      button.removeAttribute('data-nezha-label');
    } else {
      button.setAttribute('data-nezha-running', '');
      button.setAttribute('data-nezha-label', label);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-nezha-running]')) {
      button.removeAttribute('data-nezha-running');
      button.removeAttribute('data-nezha-label');
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
  }, 'nezha: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-nezha-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-nezha-theme');
      style?.remove();
    };
  }, 'nezha: scenery');
}
