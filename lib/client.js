window.__ModuleLoader__.load({
  id: 'dsh-shanhe-theme',
  factory: (require) => {
// The build replaces this empty value with the bundled CSS and SVG. Keeping
// the source side effect free makes theme registration easy to test in Node.
const STYLE_TEXT = "/* Decorative layer; official semantic tokens in client.mjs own actual colors. */\nbody[data-shanhe-theme] {\n  --dsw-focus-ring-color: #a43d32;\n  --dsw-elevation-stroke-color: rgba(124, 91, 62, .24);\n  background-color: #faf6ed;\n  color: #2d2925;\n}\n\n/* main and role=main cover both existing Web layout variants. */\nbody[data-shanhe-theme] main,\nbody[data-shanhe-theme] [role=\"main\"] {\n  background-color: transparent;\n  background-image: linear-gradient(180deg, rgba(250,246,237,.45), rgba(250,246,237,.16)), url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDkwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgc2xpY2UiPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJmb2ciIHgyPSIwIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iI2ZmZmFmMSIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjNlYWRjIiBzdG9wLW9wYWNpdHk9Ii43NSIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJpZGdlIiB4Mj0iMCIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiM3OTdhNzMiIHN0b3Atb3BhY2l0eT0iLjM2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOTA4ZTgxIiBzdG9wLW9wYWNpdHk9Ii4wMyIvPjwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJibHVyIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxMyIvPjwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmYWY2ZWQiLz4KICA8ZyBvcGFjaXR5PSIuMjgiIGZpbGw9IiNhNmE1OWQiIGZpbHRlcj0idXJsKCNibHVyKSI+CiAgICA8cGF0aCBkPSJNMCAzMTAgMTAwIDI1NSAxODUgMjg5IDI5MiAyMDggMzcxIDI3OSA0NTUgMjIwIDU2MSAyODkgNjg3IDIzMSA4MTEgMjgzIDk2OSAyMTggMTExOSAyODYgMTMwMCAyMDYgMTQ0MCAyNjBWNDUwSDBaIi8+CiAgPC9nPgogIDxwYXRoIGQ9Ik0wIDQwMSA5MyAzNTAgMTc5IDM3OCAyOTggMjc3IDM4MyAzMzUgNDY1IDI4MiA1NjYgMzY4IDcyMCAzMDUgODgzIDM0OSAxMDQzIDI3NCAxMTYyIDM0NCAxMzMwIDI0OCAxNDQwIDMyMlY0ODBIMFoiIGZpbGw9InVybCgjcmlkZ2UpIi8+CiAgPHBhdGggZD0iTTAgMzkwIDkzIDM1MGw0MCAxMyA0MiAxNSAxMjMtMTAxIDQ3IDI4IDM4IDMwIDgyLTUzIDU0IDQ4IDQ3IDM4IDE1NC02MyA3OSAyMCA4NCAyNCAxNjAtNzUgNjUgMjkgNTQgNDEgMTY4LTk2IDU1IDM4IDU1IDM2IiBmaWxsPSJub25lIiBzdHJva2U9IiM2YzZiNjQiIG9wYWNpdHk9Ii4xOCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHBhdGggZD0iTTAgNDEwYzM0MC00NSA0MjAtMTUgNjg5LTMyIDMwMC0zMiA1NDItMjMgNzUxIDIxdjk2SDBaIiBmaWxsPSIjZmFmNmVkIiBvcGFjaXR5PSIuNzUiIGZpbHRlcj0idXJsKCNibHVyKSIvPgogIDxwYXRoIGQ9Ik0wIDcwNCAxNDAgNjYxIDIyOCA2ODYgMzgxIDU5NyA0ODcgNjU5IDY0MCA2MDcgNzc3IDY4OSA5MzEgNTk4IDEwODAgNjgyIDEyMTUgNTkwIDEzMzEgNjI3IDE0NDAgNTY1VjkwMEgwWiIgZmlsbD0iIzY5Njk2MSIgb3BhY2l0eT0iLjEyIi8+CiAgPHBhdGggZD0iTTAgNzg5IDE3MSA3NDkgMjYwIDc4MyA0MDggNjg0IDUxOCA3MzggNjIyIDcxNCA3ODkgODAwIDk0MSA3MDQgMTA3MiA3NjIgMTI0OSA2NDUgMTM3MyA2OTYgMTQ0MCA2NTRWOTAwSDBaIiBmaWxsPSIjNWI1ZTU5IiBvcGFjaXR5PSIuMTkiLz4KICA8cGF0aCBkPSJNMCA5MDBWODI5YzI4My03NiAzOTAgMyA1ODMtNDMgMTQ2LTM1IDI3My00MiA0MzggMzMgMTQwIDYzIDMwNiAxIDQxOS00NnYxMjdaIiBmaWxsPSJ1cmwoI2ZvZykiLz4KICA8Y2lyY2xlIGN4PSIxMTMxIiBjeT0iMjgzIiByPSIzOSIgZmlsbD0iI2I5NjQ0ZCIgb3BhY2l0eT0iLjE1Ii8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE5MCA3MzEpIiBmaWxsPSIjMjUyNzI2IiBvcGFjaXR5PSIuNzIiPjxwYXRoIGQ9Ik0tMy01OGM0LTQgMTAtNCAxNCAwbC0xIDktMTIgMVptLTMgMTAgMTctMSA5IDM5LTI5IDFabTcgMzcgMyAzN2gtNWwtNS0zNVptMTAgMCA4IDM3aC01TDYtOVoiLz48cGF0aCBkPSJNLTEyLTQzIC0zNS01MGwtMiAzIDI3IDEyIDI0IDEgMTYtOC0zLTMtMTcgNFoiLz48cGF0aCBkPSJtMTYtMTggNDEgNDIgMi0yLTM3LTQ2WiIvPjwvZz4KICA8cGF0aCBkPSJNMCAwaDE0NDB2OTAwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NTZlNGQiIG9wYWNpdHk9Ii4wNiIgc3Ryb2tlLXdpZHRoPSIyMCIvPgo8L3N2Zz4K\");\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(h1,h2) {\n  color: #2d2925;\n  letter-spacing: .035em;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(textarea,[contenteditable=\"true\"]) {\n  caret-color: #a43d32;\n}\n\nbody[data-shanhe-theme] :is(main,[role=\"main\"]) :is(textarea,[contenteditable=\"true\"]):focus-visible {\n  outline-color: #a43d32;\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  body[data-shanhe-theme] :is(button,a) { transition: color .18s ease, background-color .18s ease; }\n}\n\n@media (max-width: 700px) {\n  body[data-shanhe-theme] main,\n  body[data-shanhe-theme] [role=\"main\"] { background-position: 58% center; }\n}\n";
const STYLE_ID = 'dsh-shanhe-jianyi';

const THEME = Object.freeze({
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

const inject = ['theme'];

function apply(ctx) {
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

    return { apply, inject, THEME };
  }
});
