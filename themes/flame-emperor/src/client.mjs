// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = '';
const STYLE_ID = 'dsh-flame-emperor-theme';

export const THEME = Object.freeze({
  id: 'yandi',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#111318',
    '--dsw-alias-bg-layer-1': '#191d22',
    '--dsw-alias-bg-layer-2': '#22272d',
    '--dsw-alias-bg-layer-3': '#2c3138',
    '--dsw-alias-bg-overlay': '#23272d',
    '--dsw-alias-bg-module-platform': '#20252b',
    '--dsw-alias-bg-multi-select': '#293638',
    '--dsw-alias-label-primary': '#edf6f3',
    '--dsw-alias-label-secondary': '#d2e0dc',
    '--dsw-alias-label-tertiary': '#a8bcb7',
    '--dsw-alias-label-caption': '#b2c8be',
    '--dsw-alias-label-primary-inverted': '#111318',
    '--dsw-alias-brand-primary': '#34c8c3',
    '--dsw-alias-state-business-primary': '#d47b48',
    '--dsw-alias-button-primary-fill': '#34c8c3',
    '--dsw-alias-button-primary-hover': '#58e5db',
    '--dsw-alias-button-info-fill': '#d78152',
    '--dsw-alias-button-info-hover': '#f49c61',
    '--dsw-alias-button-elevated-fill': '#293634',
    '--dsw-alias-button-floating-fill': '#2b3c3c',
    '--dsw-alias-button-floating-hover': '#37504b',
    '--dsw-alias-interactive-bg-hover': 'rgba(52, 200, 195, .12)',
    '--dsw-alias-interactive-bg-active': 'rgba(212, 123, 72, .2)',
    '--dsw-alias-interactive-bg-hover-solid': '#304443',
    '--dsw-alias-border-l1': 'rgba(91, 209, 198, .18)',
    '--dsw-alias-border-l2': 'rgba(91, 209, 198, .28)',
    '--dsw-alias-border-l3': 'rgba(91, 209, 198, .38)',
    '--dsw-alias-markdown-code-block': '#1a2025',
    '--dsw-alias-markdown-code-block-banner': '#242e31',
    '--dsw-alias-markdown-inline-code': '#253237',
    '--dsw-alias-markdown-tag': '#2c3b3c',
    '--dsw-alias-scrollbar-bg-l1': '#3f5653',
    '--dsw-alias-scrollbar-hover-l1': '#647b71',
    '--dsw-alias-scrollbar-bg-l2': '#48605a',
    '--dsw-alias-scrollbar-hover-l2': '#728c7e',
    '--dsw-alias-tooltip-bg': '#111318',
    '--dsw-specific-bubble': '#293436',
    '--dsw-specific-bubble-highlight': '#355957',
    '--dsw-specific-sidebar-fill': '#171b21',
    '--dsw-specific-sidebar-nav-item-active': '#234f4f',
    '--dsw-specific-sidebar-nav-item-hover': '#273036',
    '--dsw-specific-input-major': '#222b30',
    '--dsw-specific-menu': '#26343a',
    '--dsw-specific-selector': '#2a393b',
    '--dsw-specific-tip': '#2c393a',
  }),
});

export const inject = ['theme'];

/** The live Turn header is DSH's own `data-turn-process` button. Its adjacent
 * role=status announcement remains untouched for assistive technology. */
export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '异火推演 · 凝焰中';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `异火推演 · 已炼 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Flame forging';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Flame forging · ${match[1]}` : null;
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
      button.removeAttribute('data-yandi-running');
      button.removeAttribute('data-yandi-label');
    } else {
      button.setAttribute('data-yandi-running', '');
      button.setAttribute('data-yandi-label', label);
    }
  }
}

export function installRunningStatus(root, Observer) {
  decorateRunningStatuses(root);
  const observer = new Observer(() => decorateRunningStatuses(root));
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const button of root.querySelectorAll('button[data-yandi-running]')) {
      button.removeAttribute('data-yandi-running');
      button.removeAttribute('data-yandi-label');
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
  }, 'yandi: palette');

  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement?.('style');
    if (style && STYLE_TEXT) {
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      document.head.appendChild(style);
    }
    document.body.setAttribute('data-yandi-theme', '');
    const stopStatus = typeof MutationObserver === 'function'
      ? installRunningStatus(document.body, MutationObserver) : () => {};
    return () => {
      stopStatus();
      document.body.removeAttribute('data-yandi-theme');
      style?.remove();
    };
  }, 'yandi: scenery');
}
