import { CATALOG } from './catalog.mjs';

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
    if (reducedMotion()) return;
    const theme = CATALOG.find(item => item.id === gallery.getSelection() && item.slug === 'shanhe');
    if (!theme) return;
    playbackTimer = setTimer(skip, 4000);
    publish(theme);
  };
  const stopSelection = gallery.subscribe(() => {
    if (snapshot !== null && gallery.getSelection() !== snapshot.id) skip();
  });
  // A stalled Host request must neither delay the interface forever nor cause
  // an intro to appear long after the user has begun working.
  restoreTimer = setTimer(start, 1500);
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
