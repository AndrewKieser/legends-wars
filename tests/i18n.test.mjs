import test from 'node:test';
import assert from 'node:assert/strict';
import {setLocale,getLocale,loadLocale,translateText,t,resolveText,locales,LOCALE_KEY} from '../dist/i18n.js';
import {freshProfile,battleConfig,exportSave} from '../dist/profile.js';
import {createBattle,advance,hash} from '../dist/engine.js';
const storage={values:new Map(),getItem(k){return this.values.get(k)},setItem(k,v){this.values.set(k,v)}};
test('language persists separately and unknown locale falls back',()=>{
 setLocale('ja',storage);assert.equal(storage.getItem(LOCALE_KEY),'ja');loadLocale(storage);assert.equal(getLocale(),'ja');
 setLocale('unknown',storage);assert.equal(getLocale(),'en');
});
test('text fallback, substitution, and original records',()=>{
 setLocale('ja',storage);assert.equal(translateText(' Pause '),' 一時停止 ');
 assert.equal(translateText('Train · 200 Mana'),'強化・200マナ');
 assert.equal(translateText('Not translated yet'),'Not translated yet');
 assert.equal(t('You need {p0} Mana.',{p0:300}),'300マナが必要です。');
 const record={id:'story.example',source:{locale:'ja',text:'原文',evidence:'test-fixture'},translations:{en:{text:'Original text',status:'draft'}}};
 setLocale('en',storage);assert.equal(resolveText(record),'Original text');setLocale('ja',storage);assert.equal(resolveText(record),'原文');
});
test('all Japanese entries have a source and preserve placeholders',()=>{
 const slots=s=>[...s.matchAll(/\{p\d+\}/g)].map(m=>m[0]).sort();
 for(const [key,value] of Object.entries(locales.ja)){assert.ok(Object.hasOwn(locales.en,key),key);assert.deepEqual(slots(value),slots(key),key);}
});
test('language cannot affect simulation, replay hash or portable save',()=>{
 const p=freshProfile(),config=battleConfig(p,'arrival'),before=exportSave(p);
 setLocale('en',storage);const a=createBattle(config);advance(a,100);
 setLocale('ja',storage);const b=createBattle(config);advance(b,100);
 assert.equal(hash(a),hash(b));assert.equal(exportSave(p),before);
});
test('unavailable storage does not prevent switching',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(setLocale('ja',blocked),'ja');assert.equal(loadLocale(blocked),'en');
});
