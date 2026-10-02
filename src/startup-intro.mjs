import { CATALOG } from './catalog.mjs';
import { createIntroArtwork, createIntroEmblem } from './intro-scenes.mjs';

const STARTUP_RESTORE_TIMEOUT_MS = 1500;
const STARTUP_DURATION_MS = 4000;

/** One startup decision per plugin mount; this is not a conversation listener. */
export function createStartupIntro(gallery, {
  setTimer = globalThis.setTimeout,
  clearTimer = globalThis.clearTimeout,
  reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
} = {}) {
  const listeners = new Set();
  let snapshot = null;
  let decided = false;
  let disposed = false;
  let playbackTimer;
  let restoreTimer;
  const publish = value => {
    snapshot = value;
    for (const fn of listeners) fn();
  };
  const skip = () => {
    decided = true;
    clearTimer(restoreTimer);
    clearTimer(playbackTimer);
    playbackTimer = undefined;
    if (snapshot !== null) publish(null);
  };
  const start = () => {
    if (decided || disposed) return;
    decided = true;
    clearTimer(restoreTimer);
    if (gallery.hasUserSelection() || reducedMotion()) return;
    const theme = CATALOG.find(item => item.id === gallery.getSelection());
    if (!theme) return;
    playbackTimer = setTimer(skip, STARTUP_DURATION_MS);
    publish(theme);
  };
  const stopSelection = gallery.subscribe(() => {
    if (snapshot !== null && gallery.getSelection() !== snapshot.id) skip();
  });
  // A stalled Host request must neither delay the interface forever nor cause
  // an intro to appear long after the user has begun working.
  restoreTimer = setTimer(start, STARTUP_RESTORE_TIMEOUT_MS);
  void gallery.whenReady().then(start, start);
  return {
    getSnapshot: () => snapshot,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    skip,
    dispose() {
      disposed = true;
      stopSelection();
      skip();
      listeners.clear();
    },
  };
}

/** The frame is only a visual layer; no video, audio, or fullscreen permission. */
export function createStartupIntroView(React, intro, {
  document: doc = globalThis.document,
  window: win = globalThis.window,
  skipLabel = '跳过',
  hint = 'Esc 跳过 · 即将启程',
  themedHint = 'Esc 跳过 · 即将开启对话',
} = {}) {
  const h = React.createElement;
  return function StartupIntro() {
    const theme = React.useSyncExternalStore(intro.subscribe, intro.getSnapshot, () => null);
    const skipRef = React.useRef(null);
    React.useEffect(() => {
      if (theme === null) return undefined;
      const previous = doc?.activeElement;
      skipRef.current?.focus({ preventScroll: true });
      const onKey = event => {
        if (event.key !== 'Escape' && event.key !== 'Tab') return;
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Escape') intro.skip();
        else skipRef.current?.focus({ preventScroll: true });
      };
      win?.addEventListener('keydown', onKey, true);
      return () => {
        win?.removeEventListener('keydown', onKey, true);
        if (previous?.isConnected) previous.focus?.({ preventScroll: true });
      };
    }, [theme]);
    if (theme === null) return null;
    const shanhe = theme.slug === 'shanhe';
    return h('div', {
      className: `dsh-gallery-intro${shanhe ? '' : ' dsh-gallery-intro-themed'}`, role: 'dialog', 'aria-modal': true,
      'aria-labelledby': 'dsh-gallery-intro-title', 'data-intro-theme': theme.slug,
      'data-intro-tone': theme.definition.colorScheme,
      style: { '--gallery-intro-duration': `${STARTUP_DURATION_MS}ms` },
    },
      h('div', { className: 'dsh-gallery-intro-scene', 'aria-hidden': true }),
      h('div', { className: 'dsh-gallery-intro-mist', 'aria-hidden': true }),
      createIntroArtwork(React, theme.slug),
      h('div', { className: 'dsh-gallery-intro-copy' },
        shanhe ? h('span', { className: 'dsh-gallery-intro-seal', 'aria-hidden': true }, '山', h('br'), '河') : createIntroEmblem(React, theme.slug),
        h('p', { className: 'dsh-gallery-intro-name' }, theme.zh),
        !shanhe && h('p', { className: 'dsh-intro-chapter', 'aria-hidden': true }, theme.en),
        h('h1', { id: 'dsh-gallery-intro-title' }, shanhe ? theme.hero : theme.hero.split('，').map((line, index, lines) =>
          h('span', { className: 'dsh-intro-title-line', key: index }, line + (index < lines.length - 1 ? '，' : '')),
        )),
        shanhe ? h('svg', { className: 'dsh-gallery-intro-ink', viewBox: '0 0 440 36', 'aria-hidden': true },
          h('path', { d: 'M8 24 C80 8 120 28 205 17 S350 9 432 18', pathLength: 100 }),
          h('path', { d: 'M64 29 C160 20 220 30 380 24', pathLength: 100 }),
        ) : h('div', { className: 'dsh-intro-rule', 'aria-hidden': true }),
        h('p', { className: 'dsh-gallery-intro-tagline' }, theme.tagline),
      ),
      h('button', { type: 'button', className: 'dsh-gallery-intro-skip', ref: skipRef, onClick: intro.skip }, skipLabel),
      h('p', { className: 'dsh-gallery-intro-hint' }, shanhe ? hint : themedHint),
    );
  };
}
