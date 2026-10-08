import { CATALOG } from './catalog.mjs';
import { createUpdateController, createUpdatePanel, UPDATE_LOCALES } from './update-client.mjs';
const BUILD_INFO = null;
export const PANEL_ID = 'dsh-theme-gallery';
import { createStartupIntro, createStartupIntroView } from './startup-intro.mjs';

// Replaced with an offline CSS bundle during the build.
const STYLE_TEXT = '';
const REACT = null;
const STORAGE_KEY = 'dsh.themeGallery.selection';
const VISUAL_KEY = 'dsh.themeGallery.visual';
const VISUAL_DEFAULTS = Object.freeze({ fade: 0, sidebarOpacity: 40, blur: 0, contrast: 100 });
const VISUAL_RANGES = Object.freeze({ fade: [0, 80], sidebarOpacity: [0, 90], blur: [0, 12], contrast: [80, 150] });
const ATTR = 'data-dsh-gallery-theme';
const RUNNING = 'data-dsh-gallery-running';
const LABEL = 'data-dsh-gallery-label';
const LIVE_LABEL = 'data-dsh-gallery-live-label';
const NS = 'settings.dshThemeGallery';
const ROUTE = '/dsh-theme-gallery/selection';
const ORN = 'data-dsh-gallery-orn';
const ORN_RING = 'data-dsh-gallery-orn-ring';
const ORN_GLYPH = 'data-dsh-gallery-orn-glyph';
const ORN_TEXT = 'data-dsh-gallery-orn-text';
const BUSY = 'data-dsh-gallery-busy';
const PLACEHOLDER_ORIG = 'data-dsh-gallery-ph';
let richQueued = false;
let richGeneration = 0;
let lastOrnX = null;
let lastOrnY = null;
const originalHeroText = new WeakMap();

export const inject = ['theme', 'slots', 'locale', 'layout'];

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

/** DSH 0.2 renders live Turns in a separate running row, not a process button. */
export function formatLiveRunningStatus(visible, selected) {
  if (!selected) return null;
  const label = visible.trim().replace(/(?:\.{3}|…)$/, '');
  const chinese = /^深度求索中(?:[，,]\s*用时\s*(.+))?$/.exec(label);
  if (chinese) return chinese[1] ? `${selected.elapsed} ${chinese[1]}` : selected.intro;
  if (label === 'Deep diving') return selected.english;
  const english = /^Deep diving for\s+(.+)$/i.exec(label);
  return english ? `${selected.english} · ${english[1]}` : null;
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
  for (const row of root.querySelectorAll('[data-chat-running]')) {
    const content = row.querySelector?.('[class*="runningContent"]');
    const native = row.querySelector?.('[class*="runningText"]');
    const label = content && native ? formatLiveRunningStatus(native.textContent ?? '', selected) : null;
    if (label === null) {
      row.removeAttribute(RUNNING);
      content?.removeAttribute(LIVE_LABEL);
    } else {
      if (row.getAttribute?.(RUNNING) !== '') row.setAttribute(RUNNING, '');
      if (content.getAttribute?.(LIVE_LABEL) !== label) content.setAttribute(LIVE_LABEL, label);
    }
  }
  decorateHero(root, selected);
  scheduleRich(root, selected);
}

export function decorateHero(root, selected) {
  for (const span of root.querySelectorAll('[class*="_titleGroup"] > span:first-child')) {
    if (selected?.hero) {
      if (!originalHeroText.has(span)) originalHeroText.set(span, span.textContent ?? '');
      if (span.textContent !== selected.hero) span.textContent = selected.hero;
    } else if (originalHeroText.has(span)) {
      const original = originalHeroText.get(span);
      if (span.textContent !== original) span.textContent = original;
      originalHeroText.delete(span);
    }
  }
}

// The composer row that the running ornament is centred under: walk up from the
// process button until a parent looks like the composer rather than the page.
function composerRect(button) {
  let node = button;
  const own = button?.getBoundingClientRect?.() ?? null;
  for (let step = 0; step < 4 && node?.parentElement; step += 1) {
    const outer = node.parentElement.getBoundingClientRect?.();
    if (outer && outer.width >= 320 && outer.height <= 220) return outer;
    node = node.parentElement;
  }
  return own;
}

/** The composer is a Lexical contenteditable: its hint lives in a sibling
 * element whose class ends in "_placeholder", not in a textarea attribute. */
function placeholderBox(root) {
  const boxes = root?.querySelectorAll?.('[class*="_placeholder"]') ?? [];
  for (const box of boxes) {
    const prev = box.previousElementSibling;
    if (prev && typeof prev.className === 'string' && prev.className.includes('_input')) return box;
  }
  return null;
}

/** The active theme's composer copy replaces the built-in hint; the original is
 * stashed on the element so a built-in theme can restore it. */
export function syncPlaceholder(root, selected) {
  const box = placeholderBox(root);
  if (!box?.setAttribute || !box.getAttribute) return;
  const want = selected?.placeholder || null;
  const stash = box.getAttribute(PLACEHOLDER_ORIG);
  const now = box.textContent ?? '';
  if (want === null) {
    if (stash !== null) {
      box.removeAttribute?.(PLACEHOLDER_ORIG);
      if (stash !== now) box.textContent = stash;
    }
    return;
  }
  if (now === want) return;
  if (stash === null) box.setAttribute(PLACEHOLDER_ORIG, now);
  box.textContent = want;
}

/** The orphaned box the CSS animates while a turn runs: three expanding rings,
 * a theme glyph and the themed status text. */
export function syncOrnament(root, selected) {
  if (!root?.setAttribute) return;
  const button = root.querySelector?.('button[data-turn-process]') ?? null;
  if (!button || !selected) {
    root.removeAttribute?.(BUSY);
    return;
  }
  if (!root.getAttribute?.(BUSY)) root.setAttribute(BUSY, '');
  let box = root.querySelector?.(`[${ORN}]`);
  if (!box) {
    if (!root.querySelector) return;
    let created = null;
    if (typeof document !== 'undefined') {
      created = document.createElement?.('div');
      if (created) {
        created.setAttribute(ORN, '');
        created.setAttribute('aria-hidden', 'true');
        created.innerHTML = `<span ${ORN_GLYPH}><i ${ORN_RING}></i><i ${ORN_RING}></i><i ${ORN_RING}></i></span><span ${ORN_TEXT}></span>`;
      }
    }
    if (!created?.setAttribute) return;
    root.appendChild?.(created);
    box = created;
  }
  const text = button.getAttribute?.(LABEL) ?? '';
  const slot = box.querySelector?.(`[${ORN_TEXT}]`);
  if (slot && slot.textContent !== text) slot.textContent = text;
  const rect = composerRect(button);
  if (rect && box.style?.setProperty) {
    const x = `${Math.round(rect.left + rect.width / 2)}px`;
    const y = `${Math.round(rect.bottom + 20)}px`;
    if (x !== lastOrnX || y !== lastOrnY) {
      lastOrnX = x;
      lastOrnY = y;
      box.style.setProperty('--dsh-orn-x', x);
      box.style.setProperty('--dsh-orn-y', y);
    }
  }
}

export function resetRich(root) {
  richGeneration += 1;
  richQueued = false;
  lastOrnX = null;
  lastOrnY = null;
  root?.removeAttribute?.(BUSY);
  root?.querySelector?.(`[${ORN}]`)?.remove?.();
  const box = placeholderBox(root);
  const stash = box?.getAttribute?.(PLACEHOLDER_ORIG);
  if (stash !== null && stash !== undefined && box?.setAttribute) {
    box.removeAttribute?.(PLACEHOLDER_ORIG);
    if (box.textContent !== stash) box.textContent = stash;
  }
}

function flushRich(root, selected) {
  syncOrnament(root, selected);
  syncPlaceholder(root, selected);
}

/** One animation frame per batch of mutations: the gallery already observes every
 * streamed token, so an unthrottled rect read per mutation would thrash layout. */
export function scheduleRich(root, selected) {
  if (selected === null || selected === undefined) {
    resetRich(root);
    return;
  }
  if (richQueued) return;
  if (typeof requestAnimationFrame !== 'function') {
    flushRich(root, selected);
    return;
  }
  richQueued = true;
  const generation = richGeneration;
  requestAnimationFrame(() => {
    richQueued = false;
    if (generation !== richGeneration) return;
    flushRich(root, selected);
  });
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
  let restoreQueued = false;
  let writeQueue = Promise.resolve();
  let ready = Promise.resolve();
  const subscribers = new Set();
  const readVisual = () => {
    try {
      const saved = JSON.parse(storage?.getItem(VISUAL_KEY) ?? 'null');
      if (!saved || typeof saved !== 'object') return { ...VISUAL_DEFAULTS };
      return Object.fromEntries(Object.entries(VISUAL_DEFAULTS).map(([key, fallback]) => {
        const value = Number(saved[key]);
        const [min, max] = VISUAL_RANGES[key];
        return [key, Object.hasOwn(saved, key) && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback];
      }));
    } catch { return { ...VISUAL_DEFAULTS }; }
  };
  let visual = readVisual();
  const syncVisual = () => {
    const style = doc?.body?.style;
    style?.setProperty('--gallery-scene-fade', `${visual.fade}%`);
    style?.setProperty('--gallery-sidebar-opacity', `${visual.sidebarOpacity}%`);
    style?.setProperty('--gallery-scene-blur', `${visual.blur}px`);
    style?.setProperty('--gallery-text-contrast', String(visual.contrast / 100));
  };
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
    syncVisual();
    const unlisten = ctx.on?.('theme/change', snapshot => {
      // The host may apply its built-in theme setting after this plugin starts.
      // Finish dispatching that snapshot before publishing the saved choice.
      // A nested event lets a later presenter overwrite it with the old palette.
      if (desired && snapshot.preference !== desired) {
        if (!restoreQueued) {
          restoreQueued = true;
          queueMicrotask(() => {
            restoreQueued = false;
            if (disposed || !desired) return;
            ctx.theme.setTheme(desired);
            sync(ctx.theme.getTheme().preference);
          });
        }
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
      ready = Promise.resolve().then(async () => {
        const response = await fetchImpl(ROUTE, { credentials: 'same-origin', headers: { accept: 'application/json' } });
        if (!response.ok) throw new Error(`theme selection HTTP ${response.status}`);
        const state = await response.json();
        if (userSelected || disposed) return;
        const serverId = valid.has(state.themeId) ? state.themeId : null;
        // A fresh or unavailable Host route may report no selection even
        // though this browser already remembers a valid gallery choice.
        if (!serverId && valid.has(desired)) return;
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
      // Resolves even when the Host route is absent; local storage is the fallback.
      whenReady: () => ready,
      hasUserSelection: () => userSelected,
      getAdjustments: () => ({ ...visual }),
      adjust(key, value) {
        if (!Object.hasOwn(VISUAL_RANGES, key)) throw new Error(`unknown adjustment: ${key}`);
        const amount = Number(value);
        if (!Number.isFinite(amount)) return;
        const [min, max] = VISUAL_RANGES[key];
        visual = { ...visual, [key]: Math.min(max, Math.max(min, amount)) };
        syncVisual();
        try { storage?.setItem(VISUAL_KEY, JSON.stringify(visual)); } catch { /* Storage may be disabled. */ }
      },
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
        for (const property of ['--gallery-scene-fade', '--gallery-sidebar-opacity', '--gallery-scene-blur', '--gallery-text-contrast']) {
          doc?.body?.style?.removeProperty(property);
        }
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

export function createGallerySection(React, controller, catalog = CATALOG, updates = null) {
  const h = React.createElement;
  const UpdatePanel = updates ? createUpdatePanel(React, updates) : null;
  return function GallerySection(props) {
    const t = props.t ?? (key => key);
    const [selected, setSelected] = React.useState(() => controller.getSelection());
    const [visual, setVisual] = React.useState(() => controller.getAdjustments());
    React.useEffect(() => controller.subscribe(setSelected), []);
    const controls = [
      { key: 'fade', min: 0, max: 80, unit: '%' },
      { key: 'sidebarOpacity', min: 0, max: 90, unit: '%' },
      { key: 'blur', min: 0, max: 12, unit: 'px' },
      { key: 'contrast', min: 80, max: 150, unit: '%' },
    ];
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
      ...(UpdatePanel ? [h(UpdatePanel, { t })] : []),
      h('div', { className: 'dsh-gallery-grid' }, choices.map(choice =>
        h('button', {
          key: choice.id, type: 'button', className: 'dsh-gallery-card',
          'data-theme': choice.id, 'aria-pressed': selected === choice.id,
          'aria-label': `${choice.zh} · ${choice.detail}`,
          style: {
            '--dsh-gallery-accent': choice.accent,
            '--gallery-preview-fade': selected === choice.id ? `${visual.fade}%` : '0%',
            '--gallery-preview-wash': choice.slug === 'shanhe' ? '#faf6ed' : '#111824',
            '--gallery-preview-blur': selected === choice.id ? `${visual.blur}px` : '0px',
            '--gallery-preview-contrast': selected === choice.id ? String(visual.contrast / 100) : '1',
          },
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
      h('fieldset', { className: 'dsh-gallery-controls', disabled: !catalog.some(item => item.id === selected) },
        h('legend', null, t('appearance')),
        h('p', null, t('appearanceHint')),
        controls.map(control => h('label', { key: control.key, className: 'dsh-gallery-control' },
          h('span', null, t(control.key)),
          h('input', { type: 'range', min: control.min, max: control.max, step: 1,
            value: visual[control.key], 'aria-label': t(control.key),
            onChange: event => {
              controller.adjust(control.key, event.target.value);
              setVisual(controller.getAdjustments());
            },
          }),
          h('output', null, `${visual[control.key]}${control.unit}`),
        )),
      ),
      h('p', { className: 'dsh-gallery-footnote' }, t('footnote')),
    );
  };
}

export function apply(ctx) {
  let controller;
  let startup;
  let updates;
  const registered={main:false,sidebar:false};
  ctx.effect(() => {
    controller = applyGallery(ctx);
    startup = createStartupIntro(controller);
    updates = createUpdateController({ client: BUILD_INFO, probe: async signal => {
      const urls=[...new Set(STYLE_TEXT.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g)??[])];
      const decoded=typeof Image==='function' ? await Promise.all(urls.map(url=>new Promise(resolve=>{
        const image=new Image();
        const finish=valid=>{image.onload=null;image.onerror=null;signal?.removeEventListener('abort',cancel);resolve(valid)};
        const cancel=()=>{finish(false);image.src=''};
        image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);
        if(signal?.aborted)cancel();else{signal?.addEventListener('abort',cancel,{once:true});image.src=url}
      }))) : [];
      let appearance=false;try{
        const selected=controller.getSelection(), cached=localStorage.getItem(STORAGE_KEY);
        const saved=JSON.parse(localStorage.getItem(VISUAL_KEY)??'null')??VISUAL_DEFAULTS;
        appearance=(selected??null)===(cached??null) &&
          Object.entries(controller.getAdjustments()).every(([key,value])=>value===Number(saved[key])) &&
          document.body.getAttribute(ATTR)===(CATALOG.find(item=>item.id===selected)?.slug??null);
      }catch{}
      return {...registered,appearance,resources:urls.length===CATALOG.length*2 && decoded.length===urls.length && decoded.every(Boolean)};
    }, navigate: () => {
      const navigation = ctx.get?.('pluginNavigation');
      if (!navigation?.openBundle) throw new Error('DSH plugin navigation unavailable');
      navigation.openBundle('dsh-theme-gallery');
    } });
    void updates.check();
    return () => {
      updates.dispose();
      startup.dispose();
      controller.dispose();
    };
  }, 'dsh-theme-gallery: selection and scenery');
  ctx.on?.('connection/reset', () => { updates.cancel(); void updates.check(); });
  const zh = { nav: '主题', title: '主题', intro: `挑选喜欢的主题，即点即换。${CATALOG.length} 款主题都包含在这个插件中。`, footnote: '选择保存在 DSH 中；可随时恢复默认外观。', system: '跟随 DSH', light: 'DSH 明亮', dark: 'DSH 深色', appearance: '画面与文字', appearanceHint: '调节时立即生效，重启后仍会保留。默认：深淡 0%、侧栏遮罩 40%、模糊 0px、文字对比 100%。', fade: '背景深淡', sidebarOpacity: '侧栏遮罩', blur: '背景模糊', contrast: '文字对比' };
  const en = { nav: 'Themes', title: 'Themes', intro: `Choose a theme and switch instantly. All ${CATALOG.length} are included.`, footnote: 'Your choice is saved by DSH. Return to the default at any time.', system: 'DSH default', light: 'DSH Light', dark: 'DSH Dark', appearance: 'Scene and text', appearanceHint: 'Updates instantly and persists after restart. Defaults: depth 0%, sidebar mask 40%, blur 0px, text contrast 100%.', fade: 'Background depth', sidebarOpacity: 'Sidebar mask', blur: 'Scene blur', contrast: 'Text contrast' };
  Object.assign(zh, { introSkip: '跳过', introHint: 'Esc 跳过 · 即将启程', introThemedHint: 'Esc 跳过 · 即将开启对话' });
  Object.assign(en, { introSkip: 'Skip', introHint: 'Esc to skip · Your journey begins', introThemedHint: 'Esc to skip · Your journey begins' });
  Object.assign(zh, UPDATE_LOCALES.zh);
  Object.assign(en, UPDATE_LOCALES.en);
  for (const item of CATALOG) { zh[item.slug] = item.zh; en[item.slug] = item.en; }
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-theme-gallery: locale');
  ctx.slots.inject('main', () => {
    const release=ctx.slots.register({
    name: 'main', key: PANEL_ID, locale: NS, inject: () => ({}),
  }, createGallerySection(REACT, controller, CATALOG, updates));
    registered.main=true;return()=>{registered.main=false;release?.()};
  });
  ctx.slots.inject('sidebar.panellist', () => {
    const release=ctx.slots.register({
    name: 'sidebar.panellist', id: PANEL_ID, order: 5,
    label: () => ctx.locale.bind(NS)('nav'), locale: NS,
  }, function PaletteIcon({ size = 18 }) {
    return REACT.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24',
      fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true },
      REACT.createElement('path', { d: 'M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1-2.6H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z' }),
      ...[[7.5,10],[10,6.8],[14,6.8],[17,10]].map(([cx,cy]) => REACT.createElement('circle', { key: cx, cx, cy, r: 1, fill: 'currentColor', stroke: 'none' })));
  });
    registered.sidebar=true;return()=>{registered.sidebar=false;release?.()};
  });
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'dsh-theme-gallery-startup', order: 850,
  }, createStartupIntroView(REACT, startup, {
    skipLabel: ctx.locale.bind(NS)('introSkip'),
    hint: ctx.locale.bind(NS)('introHint'),
    themedHint: ctx.locale.bind(NS)('introThemedHint'),
  })));
}
