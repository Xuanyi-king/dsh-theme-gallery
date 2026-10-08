import { CATALOG } from '../src/catalog.mjs';

const descriptions = {
  shanhe: '水墨山河 · 朱砂印章 · 剑意入卷',
  ultraman: '蓝色能量核心 · 星光轨道 · 深空启程',
  'perfect-world': '黑金日轮 · 古老符纹 · 帝境初开',
  'flame-emperor': '青色火莲 · 暖色余烬 · 异火绽放',
  'great-sage': '云海散开 · 金棒光痕 · 踏碎凌霄',
  nezha: '赤色绫带 · 莲瓣火轮 · 逆命而行',
  'whale-prince': '深海光束 · 潮汐圆环 · 气泡上升',
  'jianlai-aliang': '细雨斜落 · 暖灯微光 · 一瞬剑意',
  'sunny-watch': '晨光铺开 · 城市轮廓 · 晴空守望',
  'young-goku': '轻盈筋斗云 · 金色轨迹 · 少年启程',
  'wang-lin': '冷灰雾山 · 赤银逆道印 · 凡心问道',
};
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

// Explicit replay lives only in this isolated review fixture, not in the plugin.
export function createIntroPreview(files) {
  const options = CATALOG.map(item => `<option value="${item.slug}">${escape(item.zh)} / ${escape(item.en)}</option>`).join('');
  const cards = CATALOG.map((item, index) => `<button class="preview-card" type="button" data-preview="${item.slug}" style="--card-accent:${item.accent}"><span class="card-number">${String(index + 1).padStart(2, '0')}</span><strong>${escape(item.zh)}</strong><span class="card-en">${escape(item.en)}</span><span class="card-note">${escape(descriptions[item.slug])}</span></button>`).join('');
  let html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${CATALOG.length} 款主题 · 启动开场预览</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f2f4f7;color:#182638;font-family:system-ui,"Noto Sans CJK SC",sans-serif}
.preview-shell{position:relative;z-index:1;min-height:100vh;max-width:1180px;margin:auto;padding:64px 28px;background:#f2f4f7;color:#182638;font-family:system-ui,"Noto Sans CJK SC",sans-serif}.preview-eyebrow{font-size:11px;letter-spacing:.22em;color:#66778c}
.preview-shell h1{font-size:clamp(30px,5vw,52px);line-height:1.35;letter-spacing:-.03em;margin:14px 0}.preview-lead{font-size:15px;line-height:1.9;color:#52647a;max-width:640px}
.preview-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:30px 0}.preview-controls select,.preview-controls button{font:14px system-ui;border:1px solid #b8c6d4;border-radius:8px;padding:12px 16px;background:white;color:#203b54}.preview-controls button{background:#203b54;color:white;cursor:pointer}
.preview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.preview-card{text-align:left;border:1px solid #d5dce4;border-radius:12px;background:white;padding:22px;cursor:pointer;color:#182638;display:grid;grid-template-columns:40px 1fr;gap:5px 10px;font-family:inherit}
.preview-card:hover,.preview-card:focus-visible{border-color:#577da0;outline:2px solid #577da02a;outline-offset:2px}.preview-card[aria-pressed=true]{border-color:#385d7b;box-shadow:0 0 0 1px #385d7b}
.card-number{grid-row:1/4;color:var(--card-accent);font-size:16px}.preview-card strong{font-size:17px}.card-en{font-size:10px;letter-spacing:.1em;color:#7c8b9c;text-transform:uppercase}.card-note{margin-top:8px;font-size:12px;line-height:1.6;color:#5d7085}
.preview-foot{font-size:12px;color:#708196;line-height:1.9;margin-top:28px}.preview-motion{font-size:13px;color:#854817}.preview-shell button:focus-visible,.preview-shell select:focus-visible{outline:2px solid #547ca2;outline-offset:3px}
@media(max-width:600px){.preview-shell{padding:36px 20px}.preview-grid{grid-template-columns:1fr}.preview-controls select{width:100%}}
</style></head><body>
<section class="preview-shell" aria-label="启动动画预览"><p class="preview-eyebrow">DSH THEME GALLERY / STARTUP COLLECTION</p><h1>${CATALOG.length} 种开场，同一个入口。</h1>
<p class="preview-lead">现有壁纸配合专属矢量动效。每款约 4 秒，按 Esc 或点击「跳过」结束。选择下方主题，可重新播放并比较效果。</p>
<div class="preview-controls"><label for="theme-picker">预览主题</label><select id="theme-picker">${options}</select><button id="replay" type="button">重播当前开场</button></div>
<p class="preview-motion" id="motion-note" hidden>系统已启用「减少动态效果」，本页与插件一样不播放启动动画。</p><div class="preview-grid">${cards}</div>
<p class="preview-foot">这是本地离线预览，不是 DSH 安装包。此页的主题选择和重播只用于展示；真实插件仅在启动时播放，不在切换主题或新建对话时播放。预览不读写浏览器中已有的主题设置，也不请求外部素材。</p></section>
<div id="settings" hidden></div><div id="overlay"></div>
<script src="/react.js"></script><script src="/react-dom.js"></script>
<script>window.__ModuleLoader__={load(entry){window.plugin=entry.factory(name=>{if(name==='react')return React;throw Error(name)})}};</script><script src="/client.js"></script>
<script>
const themes=${JSON.stringify(CATALOG.map(({ slug, id }) => ({ slug, id })))};
const picker=document.getElementById('theme-picker');
const memory=new Map();
Object.defineProperty(window,'localStorage',{value:{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)}});
let cleanups=[];
function disposePreview(){for(const fn of cleanups.reverse())fn();cleanups=[];}
function playIntro(slug=picker.value){
  const selected=themes.find(item=>item.slug===slug)||themes[1];
  disposePreview();picker.value=selected.slug;
  document.querySelectorAll('[data-preview]').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.preview===selected.slug)));
  memory.clear();memory.set('dsh.themeGallery.selection',selected.id);
  window.fetch=async()=>({ok:true,json:async()=>({themeId:selected.id})});
  let preference='system';const listeners=new Set();const locales=new Map();
  const ctx={
    theme:{getTheme:()=>({preference}),register:()=>()=>{},setTheme(id){preference=id;for(const fn of listeners)fn({preference})}},
    on(_name,fn){listeners.add(fn);return()=>listeners.delete(fn)},
    effect(fn){const end=fn();if(typeof end==='function')cleanups.push(end)},
    locale:{register(ns,dict){locales.set(ns,dict);return()=>locales.delete(ns)},bind:ns=>key=>locales.get(ns)?.zh[key]||key},
    slots:{inject(_name,fn){const end=fn();if(typeof end==='function')cleanups.push(end)},register(descriptor,Component){
      const root=ReactDOM.createRoot(document.getElementById(descriptor.name==='shell.overlay'?'overlay':'settings'));
      root.render(React.createElement(Component,{t:ctx.locale.bind('dsh-theme-gallery')}));return()=>root.unmount();
    }}
  };
  document.getElementById('motion-note').hidden=!matchMedia('(prefers-reduced-motion:reduce)').matches;
  plugin.apply(ctx);
}
picker.addEventListener('change',()=>playIntro());document.getElementById('replay').addEventListener('click',()=>playIntro());
document.querySelectorAll('[data-preview]').forEach(card=>card.addEventListener('click',()=>playIntro(card.dataset.preview)));
window.preview={play:playIntro,dispose:disposePreview};
playIntro(new URLSearchParams(location.search).get('theme')||'ultraman');
</script></body></html>`;
  for (const [path, contents] of files) {
    html = html.replace(`<script src="${path}"></script>`, () => '<script>' + contents.toString().replaceAll('</script', '<\\/script') + '</script>');
  }
  return html;
}
