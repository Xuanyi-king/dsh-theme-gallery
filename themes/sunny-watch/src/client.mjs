const STYLE_TEXT = '';

export const THEME = Object.freeze({
  id: 'sunny-watch',
  colorScheme: 'light',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#f4f9fc',
    '--dsw-alias-bg-layer-1': '#eaf3f9',
    '--dsw-alias-bg-layer-2': '#e0eef7',
    '--dsw-alias-bg-layer-3': '#d7e7f2',
    '--dsw-alias-bg-overlay': '#f6fafd',
    '--dsw-alias-bg-module-platform': '#e9f2f8',
    '--dsw-alias-bg-multi-select': '#d3e7f3',
    '--dsw-alias-label-primary': '#173a54',
    '--dsw-alias-label-secondary': '#31556d',
    '--dsw-alias-label-tertiary': '#516f82',
    '--dsw-alias-label-caption': '#597688',
    '--dsw-alias-label-primary-inverted': '#f4f9fc',
    '--dsw-alias-brand-primary': '#c7773b',
    '--dsw-alias-state-business-primary': '#c7773b',
    '--dsw-alias-button-primary-fill': '#347eaf',
    '--dsw-alias-button-primary-hover': '#4998c7',
    '--dsw-alias-button-info-fill': '#367eb9',
    '--dsw-alias-button-info-hover': '#5a9ad0',
    '--dsw-alias-button-elevated-fill': '#deebf5',
    '--dsw-alias-button-floating-fill': '#dcebf7',
    '--dsw-alias-button-floating-hover': '#cee3f2',
    '--dsw-alias-interactive-bg-hover': 'rgba(52,126,175,.10)',
    '--dsw-alias-interactive-bg-active': 'rgba(52,126,175,.18)',
    '--dsw-alias-interactive-bg-hover-solid': '#d2e7f4',
    '--dsw-alias-border-l1': 'rgba(43,100,142,.18)',
    '--dsw-alias-border-l2': 'rgba(43,100,142,.28)',
    '--dsw-alias-border-l3': 'rgba(229,138,74,.35)',
    '--dsw-alias-markdown-code-block': '#e4f0f8',
    '--dsw-alias-markdown-code-block-banner': '#daeaf4',
    '--dsw-alias-markdown-inline-code': '#e2eff7',
    '--dsw-alias-markdown-tag': '#dcebf4',
    '--dsw-alias-scrollbar-bg-l1': '#a4c3d4',
    '--dsw-alias-scrollbar-hover-l1': '#7fa7be',
    '--dsw-alias-scrollbar-bg-l2': '#93b6c8',
    '--dsw-alias-scrollbar-hover-l2': '#729bb0',
    '--dsw-alias-tooltip-bg': '#1e4259',
    '--dsw-specific-bubble': '#ddecf6',
    '--dsw-specific-bubble-highlight': '#d5e6f2',
    '--dsw-specific-sidebar-fill': '#f6fafd',
    '--dsw-specific-sidebar-nav-item-active': '#d9e9f5',
    '--dsw-specific-sidebar-nav-item-hover': '#e8f2f9',
    '--dsw-specific-input-major': '#f8fcfe',
    '--dsw-specific-menu': '#eaf2f8',
    '--dsw-specific-selector': '#dfebf4',
    '--dsw-specific-tip': '#dfebf4',
  }),
});

export const inject = ['theme'];

export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '晨光映城 · 正在思考';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `晨光映城 · 已持续 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Daylight · thinking';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Daylight · ${match[1]}` : null;
  }
  return null;
}

export function decorateRunningStatuses(root) {
  for (const button of root.querySelectorAll('button[data-turn-process]')) {
    const announcement = button.previousElementSibling;
    const label = announcement?.getAttribute('role') === 'status'
      ? formatRunningStatus(announcement.textContent ?? '', button.textContent ?? '') : null;
    if (label === null) {
      button.removeAttribute('data-sunny-watch-running');
      button.removeAttribute('data-sunny-watch-label');
    } else {
      button.setAttribute('data-sunny-watch-running', '');
      button.setAttribute('data-sunny-watch-label', label);
    }
  }
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
  }, 'sunny-watch: palette');
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement('style');
    style.id = 'dsh-sunny-watch-theme';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
    document.body.setAttribute('data-sunny-watch-theme', '');
    const observer = typeof MutationObserver === 'function'
      ? new MutationObserver(() => decorateRunningStatuses(document.body)) : null;
    if (observer) {
      decorateRunningStatuses(document.body);
      observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      for (const button of document.body.querySelectorAll('button[data-sunny-watch-running]')) {
        button.removeAttribute('data-sunny-watch-running');
        button.removeAttribute('data-sunny-watch-label');
      }
      document.body.removeAttribute('data-sunny-watch-theme');
      style.remove();
    };
  }, 'sunny-watch: scene');
}
