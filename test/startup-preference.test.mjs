import test from 'node:test';
import assert from 'node:assert/strict';
import {applyGallery, createGallerySection} from '../src/client.mjs';
import {createStartupIntro, createStartupIntroView} from '../src/startup-intro.mjs';
import {CATALOG} from '../src/catalog.mjs';
const KEY='dsh.themeGallery.startupIntro.enabled';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup({saved,throwStorage=false,fetchImpl=null}={}){
 const data=new Map([['dsh.themeGallery.selection','gallery-shanhe'],['other-plugin','untouched']]);if(saved!==undefined)data.set(KEY,saved);
 const jobs=new Map();let seq=0,preference='system';const events=new Set();
 const storage={getItem:key=>{if(throwStorage)throw Error('denied');return data.get(key)??null},setItem:(key,value)=>{if(throwStorage)throw Error('denied');data.set(key,value)},removeItem:key=>data.delete(key)};
 const gallery=applyGallery({theme:{getTheme:()=>({preference}),register:()=>()=>{},setTheme:id=>{preference=id;for(const fn of events)fn({preference:id})}},on:(_,fn)=>{events.add(fn);return()=>events.delete(fn)}},{storage,document:null,Observer:null,fetchImpl});
 const intro=createStartupIntro(gallery,{setTimer:(fn,ms)=>{jobs.set(++seq,{fn,ms});return seq},clearTimer:id=>jobs.delete(id),reducedMotion:()=>false});
 return{data,jobs,gallery,intro,dispose(){intro.dispose();gallery.dispose()}};
}
test('missing or invalid intro preference defaults on; false suppresses every theme after reload',async()=>{
 for(const saved of [undefined,'true','invalid']){const h=setup({saved});assert.equal(h.gallery.getStartupIntroEnabled(),true);await tick();assert.equal(h.intro.getSnapshot()?.slug,'shanhe');h.dispose()}
 const h=setup({saved:'false'});for(const theme of CATALOG){h.gallery.select(theme.id);await tick();assert.equal(h.intro.getSnapshot(),null)}assert.equal(h.jobs.size,0);h.dispose();
 const restarted=setup({saved:'false'});await tick();assert.equal(restarted.intro.getSnapshot(),null);restarted.dispose();
});
test('turning off a playing intro ends it and its timers; turning on never replays',async()=>{
 const h=setup();await tick();assert.ok(h.intro.getSnapshot());
 h.gallery.setStartupIntroEnabled(false);assert.equal(h.intro.getSnapshot(),null);assert.equal(h.jobs.size,0);assert.equal(h.data.get(KEY),'false');
 h.gallery.setStartupIntroEnabled(true);await tick();assert.equal(h.intro.getSnapshot(),null);assert.equal(h.jobs.size,0);assert.equal(h.data.get(KEY),'true');assert.equal(h.data.get('other-plugin'),'untouched');h.dispose();
});
test('disabled startup is decided before delayed restoration and re-enable cannot arm it',async()=>{
 let resolve;const h=setup({saved:'false',fetchImpl:()=>new Promise(r=>{resolve=r})});await tick();assert.equal(h.jobs.size,0);
 h.gallery.setStartupIntroEnabled(true);resolve({ok:true,json:async()=>({themeId:'gallery-wang-lin'})});await tick();assert.equal(h.intro.getSnapshot(),null);h.dispose();
});
test('storage write failure keeps the session preference functional and listeners are released',async()=>{
 const h=setup({throwStorage:true});assert.equal(h.gallery.getStartupIntroEnabled(),true);let changes=0;const off=h.gallery.subscribeStartupIntro(()=>changes++);
 h.gallery.setStartupIntroEnabled(false);assert.equal(h.gallery.getStartupIntroEnabled(),false);assert.equal(changes,1);off();h.gallery.setStartupIntroEnabled(true);assert.equal(changes,1);h.dispose();h.gallery.setStartupIntroEnabled(false);assert.equal(changes,1);
});
test('global intro checkbox remains outside disabled sliders and works on built-in DSH',()=>{
 const h=setup();h.gallery.select('system');
 const React={createElement:(type,props,...children)=>({type,props:props??{},children:children.flat()}),useState:fn=>[fn(),()=>{}],useEffect:()=>{}};
 const tree=createGallerySection(React,h.gallery)({});const nodes=[];const walk=(n,disabled=false)=>{if(!n||typeof n!=='object')return;const inherited=disabled||!!n.props.disabled;nodes.push({n,disabled:inherited});n.children.forEach(c=>walk(c,inherited))};walk(tree);
 const check=nodes.find(({n})=>n.type==='input'&&n.props.type==='checkbox');assert.ok(check);assert.equal(check.disabled,false);assert.equal(check.n.props.checked,true);check.n.props.onChange({target:{checked:false}});assert.equal(h.data.get(KEY),'false');h.dispose();
});
test('unmounting an active opening releases keyboard handling and playback timer',async()=>{
 const h=setup();await tick();const cleanups=[];const events=new Set();
 const React={createElement:()=>({}),useSyncExternalStore:(_,read)=>read(),useRef:()=>({current:null}),useEffect:fn=>{cleanups.push(fn())}};
 const win={addEventListener:(_,fn)=>events.add(fn),removeEventListener:(_,fn)=>events.delete(fn)};
 createStartupIntroView(React,h.intro,{window:win,document:null})();for(const cleanup of cleanups)cleanup?.();assert.equal(events.size,0);assert.equal(h.jobs.size,0);assert.equal(h.intro.getSnapshot(),null);h.dispose();
});
test('unmount before Host restoration prevents delayed playback on a later remount',async()=>{
 let resolve;const h=setup({fetchImpl:()=>new Promise(r=>{resolve=r})});await tick();const cleanups=[];
 const React={createElement:()=>({}),useSyncExternalStore:(_,read)=>read(),useRef:()=>({current:null}),useEffect:fn=>cleanups.push(fn())};
 const View=createStartupIntroView(React,h.intro,{window:null,document:null});assert.equal(View(),null);
 for(const cleanup of cleanups)cleanup?.();assert.equal(h.jobs.size,0);
 resolve({ok:true,json:async()=>({themeId:'gallery-aqua-glass'})});await tick();assert.equal(h.intro.getSnapshot(),null);assert.equal(View(),null);h.dispose();
});
