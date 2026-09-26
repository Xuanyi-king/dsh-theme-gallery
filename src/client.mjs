// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-shanhe-jianyi';

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

export function apply(ctx) {
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
    return () => {
      document.body.removeAttribute('data-shanhe-theme');
      style?.remove();
    };
  }, 'shanhe-jianyi: scenery');
}
