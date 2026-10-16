import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {CATALOG} from '../src/catalog.mjs';
const linear=c=>(c/=255)<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const luminance=hex=>hex.slice(1).match(/../g).map(n=>linear(parseInt(n,16))).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
test('Aqua Glass is the twelfth unique gallery choice with readable opaque token surfaces',()=>{
 assert.equal(CATALOG.length,12);assert.equal(new Set(CATALOG.map(t=>t.id)).size,12);
 const aqua=CATALOG.find(t=>t.id==='gallery-aqua-glass');assert.ok(aqua);assert.equal(aqua.definition.colorScheme,'dark');
 const t=aqua.definition.tokens;
 for(const foreground of ['--dsw-alias-label-primary','--dsw-alias-label-secondary','--dsw-alias-label-tertiary'])
 for(const background of ['--dsw-alias-bg-base','--dsw-alias-bg-layer-1','--dsw-alias-markdown-code-block','--dsw-specific-input-major','--dsw-specific-menu'])assert.ok(contrast(t[foreground],t[background])>=4.5,`${foreground}/${background}`);
});
test('Aqua Glass wallpaper and card preview are distinct local WebP assets',async()=>{
 const scene=await readFile(new URL('../themes/aqua-glass/assets/aqua-glass.webp',import.meta.url));
 const preview=await readFile(new URL('../assets/gallery/aqua-glass.webp',import.meta.url));
 const concept=await readFile(new URL('../themes/aqua-glass/assets/concept-preview.webp',import.meta.url));
 for(const bytes of [scene,preview,concept]){assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length>1000)}
 assert.notDeepEqual(scene,preview);assert.ok(scene.length<350000,'wallpaper stays bounded');
});
test('Aqua native primary buttons keep readable text at rest and on hover',()=>{
 const t=CATALOG.find(item=>item.slug==='aqua-glass').definition.tokens;
 assert.ok(t['--dsw-alias-label-primary-foreground']);
 for(const background of ['--dsw-alias-button-primary-fill','--dsw-alias-button-primary-hover'])assert.ok(contrast(t['--dsw-alias-label-primary-foreground'],t[background])>=4.5,background);
});

test('scripted Host fixture refuses to register from the gallery package itself',async()=>{
 const {spawnSync}=await import('node:child_process');
 const {fileURLToPath}=await import('node:url');
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('./fixtures/aqua-scripted-provider.mjs',import.meta.url))],{encoding:'utf8',env:{...process.env,DSH_AQUA_ISOLATED:'1',DSH_AQUA_TEST_RUNTIME:fileURLToPath(new URL('../package.json',import.meta.url))}});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/Copy this test fixture under an independent private manifest without dsh.client/);
});
