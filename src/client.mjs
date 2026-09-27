import { CATALOG } from './catalog.mjs';

// Replaced with an offline CSS bundle during the build.
const STYLE_TEXT = '';
const REACT = null;
const STORAGE_KEY = 'dsh.themeGallery.selection';
const ATTR = 'data-dsh-gallery-theme';
const RUNNING = 'data-dsh-gallery-running';
const LABEL = 'data-dsh-gallery-label';
const NS = 'settings.dshThemeGallery';
const ROUTE = '/dsh-theme-gallery/selection';

export const inject = ['theme', 'slots', 'locale'];

export function formatRunningStatus(announcement, visible, selected) {
  if (!selected) return null;
  const status = announcement.trim();
  const label = visible.trim();
  if (status === '深度求索中') {
    if (label === status) return selected.intro;
    const match = /^深度求索中[，,]\s*用时\s*(.+)$/.exec(label);
    return match ? `${selected.elapsed} ${match[1]}` : null;
  }
  if (status === 'Deep diving...') {
    if (label === status) return selected.english;
    const match = /^Deep diving for\s+(.+)$/i.exec(label);
    return match ? `${selected.english} · ${match[1]}` : null;
  }
  return null;
}

export function decorateRunningStatuses(root, selected) {
  for (const button of root.querySelectorAll('button[data-turn-process]')) {
    const announcement = button.previousElementSibling;
    const label = announcement?.getAttribute('role') === 'status'
      ? formatRunningStatus(announcement.textContent ?? '', button.textContent ?? '', selected)
      : null;
    if (label === null) {
      button.removeAttribute(RUNNING);
      button.removeAttribute(LABEL);
    } else {
      button.setAttribute(RUNNING, '');
      button.setAttribute(LABEL, label);
    }
  }
}

export function applyGallery(ctx, { catalog = CATALOG, document: doc = globalThis.document,
  storage = globalThis.localStorage, Observer = globalThis.MutationObserver,
  styleText = STYLE_TEXT, fetchImpl = globalThis.fetch } = {}) {
  const valid = new Map(catalog.map(item => [item.id, item]));
  const previous = ctx.theme.getTheme().preference;
  const unregister = [];
  let style;
  let observer;
  let current = previous;
  let desired = null;
  let userSelected = false;
  let disposed = false;
  let writeQueue = Promise.resolve();
  const subscribers = new Set();
  const read = () => { try { return storage?.getItem(STORAGE_KEY) ?? null; } catch { return null; } };
  const remember = id => {
    try { if (valid.has(id)) storage?.setItem(STORAGE_KEY, id); else storage?.removeItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ }
  };
  const sync = id => {
    current = id;
    const active = valid.get(id) ?? null;
    if (active) doc?.body?.setAttribute(ATTR, active.slug);
    else doc?.body?.removeAttribute(ATTR);
    if (doc?.body) decorateRunningStatuses(doc.body, active);
    for (const fn of subscribers) fn(id);
  };
  const persist = id => {
    desired = valid.has(id) ? id : null;
    remember(desired);
    if (typeof fetchImpl === 'function') {
      const target = desired;
      writeQueue = writeQueue.catch(() => {}).then(() => fetchImpl(ROUTE, {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ themeId: target }),
      })).catch(() => {}); // Browser storage remains a fallback if the Host route is absent.
    }
  };

  try {
    for (const item of catalog) unregister.push(ctx.theme.register(item.definition));
    if (doc?.body && styleText) {
      style = doc.createElement('style');
      style.id = 'dsh-theme-gallery-style';
      style.textContent = styleText;
      doc.head.appendChild(style);
    }
    const unlisten = ctx.on?.('theme/change', snapshot => {
      // The host may apply its built-in theme setting after this plugin starts.
      // Keep a gallery choice active until it is explicitly reset in this page.
      if (desired && snapshot.preference !== desired) {
        ctx.theme.setTheme(desired);
        return;
      }
      sync(snapshot.preference);
    });
    const saved = read();
    if (valid.has(saved)) {
      desired = saved;
      ctx.theme.setTheme(saved);
    } else if (saved !== null) remember(null);
    sync(ctx.theme.getTheme().preference);
    if (typeof fetchImpl === 'function') {
      Promise.resolve().then(async () => {
        const response = await fetchImpl(ROUTE, { credentials: 'same-origin', headers: { accept: 'application/json' } });
        if (!response.ok) throw new Error(`theme selection HTTP ${response.status}`);
        const state = await response.json();
        if (userSelected || disposed) return;
        const serverId = valid.has(state.themeId) ? state.themeId : null;
        desired = serverId;
        remember(serverId);
        if (serverId) ctx.theme.setTheme(serverId);
        else if (valid.has(ctx.theme.getTheme().preference)) ctx.theme.setTheme(previous);
        sync(ctx.theme.getTheme().preference);
      }).catch(() => {});
    }
    if (doc?.body && typeof Observer === 'function') {
      observer = new Observer(() => decorateRunningStatuses(doc.body, valid.get(current) ?? null));
      observer.observe(doc.body, { childList: true, characterData: true, subtree: true });
    }
    return {
      getSelection: () => current,
      select(id) {
        if (!valid.has(id) && !['light', 'dark', 'system'].includes(id)) throw new Error(`unknown theme: ${id}`);
        userSelected = true;
        persist(id);
        ctx.theme.setTheme(id);
        sync(ctx.theme.getTheme().preference);
      },
      subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
      dispose() {
        disposed = true;
        observer?.disconnect();
        if (typeof unlisten === 'function') unlisten();
        if (valid.has(ctx.theme.getTheme().preference)) {
          const restore = previous === 'system' || ['light', 'dark'].includes(previous) ? previous : 'system';
          ctx.theme.setTheme(restore);
        }
        doc?.body?.removeAttribute(ATTR);
        if (doc?.body) decorateRunningStatuses(doc.body, null);
        style?.remove();
        for (const stop of unregister.reverse()) stop();
        subscribers.clear();
      },
    };
  } catch (error) {
    style?.remove();
    for (const stop of unregister.reverse()) stop();
    throw error;
  }
}

export function createGallerySection(React, controller, catalog = CATALOG) {
  const h = React.createElement;
  return function GallerySection(props) {
    const t = props.t ?? (key => key);
    const [selected, setSelected] = React.useState(() => controller.getSelection());
    React.useEffect(() => controller.subscribe(setSelected), []);
    const choices = [
      { id: 'system', slug: 'system', zh: '跟随 DSH', en: 'DSH default', detail: '恢复内置主题', accent: '#8e9caa' },
      { id: 'light', slug: 'light', zh: 'DSH 明亮', en: 'DSH Light', detail: '内置浅色外观', accent: '#dae5e9' },
      { id: 'dark', slug: 'dark', zh: 'DSH 深色', en: 'DSH Dark', detail: '内置深色外观', accent: '#465871' },
      ...catalog,
    ];
    return h('section', { className: 'dsh-gallery-page' },
      h('header', { className: 'dsh-gallery-header' },
        h('h2', null, t('title')),
        h('p', null, t('intro')),
      ),
      h('div', { className: 'dsh-gallery-grid' }, choices.map(choice =>
        h('button', {
          key: choice.id, type: 'button', className: 'dsh-gallery-card',
          'data-theme': choice.id, 'aria-pressed': selected === choice.id,
          'aria-label': `${choice.zh} · ${choice.detail}`,
          style: { '--dsh-gallery-accent': choice.accent },
          onClick: () => { controller.select(choice.id); setSelected(choice.id); },
        },
          h('span', { className: 'dsh-gallery-scene', 'aria-hidden': true },
            h('span', { className: 'dsh-gallery-light' }),
          ),
          h('span', { className: 'dsh-gallery-copy' },
            h('strong', null, t(choice.slug) === choice.slug ? choice.zh : t(choice.slug)),
            h('small', null, choice.detail),
          ),
          h('span', { className: 'dsh-gallery-check', 'aria-hidden': true }, selected === choice.id ? '✓' : ''),
        ),
      )),
      h('p', { className: 'dsh-gallery-footnote' }, t('footnote')),
    );
  };
}

export function apply(ctx) {
  let controller;
  ctx.effect(() => {
    controller = applyGallery(ctx);
    return () => controller.dispose();
  }, 'dsh-theme-gallery: selection and scenery');
  const zh = { nav: '主题', title: '主题', intro: '挑选喜欢的主题，即点即换。七款主题都包含在这个插件中。', footnote: '选择保存在 DSH 中；可随时恢复默认外观。', system: '跟随 DSH', light: 'DSH 明亮', dark: 'DSH 深色' };
  const en = { nav: 'Themes', title: 'Themes', intro: 'Choose a theme and switch instantly. All seven are included.', footnote: 'Your choice is saved by DSH. Return to the default at any time.', system: 'DSH default', light: 'DSH Light', dark: 'DSH Dark' };
  for (const item of CATALOG) { zh[item.slug] = item.zh; en[item.slug] = item.en; }
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-theme-gallery: locale');
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'dsh-theme-gallery', order: 55,
    label: () => ctx.locale.bind(NS)('nav'), locale: NS, inject: () => ({}),
  }, createGallerySection(REACT, controller)));
}
