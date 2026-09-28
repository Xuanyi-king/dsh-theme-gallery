const STYLE_TEXT = '';

export const THEME = Object.freeze({
  id: 'jianlai-aliang',
  colorScheme: 'dark',
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#172532',
    '--dsw-alias-bg-layer-1': '#223340',
    '--dsw-alias-bg-layer-2': '#2b3d48',
    '--dsw-alias-bg-layer-3': '#344653',
    '--dsw-alias-bg-overlay': '#1b2a36',
    '--dsw-alias-bg-module-platform': '#22333f',
    '--dsw-alias-bg-multi-select': '#394852',
    '--dsw-alias-label-primary': '#f2f0e9',
    '--dsw-alias-label-secondary': '#d3dce0',
    '--dsw-alias-label-tertiary': '#b7c5cb',
    '--dsw-alias-label-caption': '#b6c7ce',
    '--dsw-alias-label-primary-inverted': '#172532',
    '--dsw-alias-brand-primary': '#cfab74',
    '--dsw-alias-state-business-primary': '#cfab74',
    '--dsw-alias-button-primary-fill': '#aa8050',
    '--dsw-alias-button-primary-hover': '#c49b68',
    '--dsw-alias-button-info-fill': '#547884',
    '--dsw-alias-button-info-hover': '#7399a1',
    '--dsw-alias-button-elevated-fill': '#324553',
    '--dsw-alias-button-floating-fill': '#344a59',
    '--dsw-alias-button-floating-hover': '#466172',
    '--dsw-alias-interactive-bg-hover': 'rgba(207,171,116,.14)',
    '--dsw-alias-interactive-bg-active': 'rgba(207,171,116,.22)',
    '--dsw-alias-interactive-bg-hover-solid': '#384b55',
    '--dsw-alias-border-l1': 'rgba(204,217,222,.18)',
    '--dsw-alias-border-l2': 'rgba(204,217,222,.28)',
    '--dsw-alias-border-l3': 'rgba(207,171,116,.42)',
    '--dsw-alias-markdown-code-block': '#1b2c37',
    '--dsw-alias-markdown-code-block-banner': '#2a3d48',
    '--dsw-alias-markdown-inline-code': '#304550',
    '--dsw-alias-markdown-tag': '#38505b',
    '--dsw-alias-scrollbar-bg-l1': '#50636e',
    '--dsw-alias-scrollbar-hover-l1': '#6b818a',
    '--dsw-alias-scrollbar-bg-l2': '#566d78',
    '--dsw-alias-scrollbar-hover-l2': '#78909a',
    '--dsw-alias-tooltip-bg': '#152430',
    '--dsw-specific-bubble': '#2c3f4a',
    '--dsw-specific-bubble-highlight': '#394c56',
    '--dsw-specific-sidebar-fill': '#1b2a36',
    '--dsw-specific-sidebar-nav-item-active': '#4a493d',
    '--dsw-specific-sidebar-nav-item-hover': '#344451',
    '--dsw-specific-input-major': '#263b47',
    '--dsw-specific-menu': '#243642',
    '--dsw-specific-selector': '#304854',
    '--dsw-specific-tip': '#304854',
  }),
});

export const inject = ['theme'];

export function formatRunningStatus(announcement, visible) {
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return '雨落江湖 · 问剑中';
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `雨落江湖 · 已行 ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return 'Rain road · thinking';
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `Rain road · ${match[1]}` : null;
  }
  return null;
}

export function decorateRunningStatuses(root) {
  for (const button of root.querySelectorAll('button[data-turn-process]')) {
    const announcement = button.previousElementSibling;
    const label = announcement?.getAttribute('role') === 'status'
      ? formatRunningStatus(announcement.textContent ?? '', button.textContent ?? '') : null;
    if (label === null) {
      button.removeAttribute('data-jianlai-aliang-running');
      button.removeAttribute('data-jianlai-aliang-label');
    } else {
      button.setAttribute('data-jianlai-aliang-running', '');
      button.setAttribute('data-jianlai-aliang-label', label);
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
  }, 'jianlai-aliang: palette');
  ctx.effect(() => {
    if (typeof document === 'undefined' || !document.body) return;
    const style = document.createElement('style');
    style.id = 'dsh-jianlai-aliang-theme';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
    document.body.setAttribute('data-jianlai-aliang-theme', '');
    const observer = typeof MutationObserver === 'function'
      ? new MutationObserver(() => decorateRunningStatuses(document.body)) : null;
    if (observer) {
      decorateRunningStatuses(document.body);
      observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      for (const button of document.body.querySelectorAll('button[data-jianlai-aliang-running]')) {
        button.removeAttribute('data-jianlai-aliang-running');
        button.removeAttribute('data-jianlai-aliang-label');
      }
      document.body.removeAttribute('data-jianlai-aliang-theme');
      style.remove();
    };
  }, 'jianlai-aliang: scene');
}
