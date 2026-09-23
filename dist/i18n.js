import en from './locales/en.js';
import ja from './locales/ja.js';
export const LOCALE_KEY='sslw-language-v1';
export const locales=Object.freeze({en,ja});
let locale='en';
const own=(o,k)=>Object.hasOwn(o,k);
const missing=new Set();
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=Object.keys(en).filter(k=>/\{p\d+\}/.test(k)).map(source=>{
 const names=[];let end=0,regex='^';
 for(const m of source.matchAll(/\{(p\d+)\}/g)){regex+=escapeRegex(source.slice(end,m.index))+'([\\s\\S]*?)';names.push(m[1]);end=m.index+m[0].length;}
 return {source,names,regex:new RegExp(regex+escapeRegex(source.slice(end))+'$'),specificity:source.replace(/\{p\d+\}/g,'').length};
}).sort((a,b)=>b.specificity-a.specificity);
export function getLocale(){return locale;}
export function setLocale(value,storage){locale=own(locales,value)?value:'en';try{(storage??globalThis.localStorage)?.setItem(LOCALE_KEY,locale);}catch{}return locale;}
export function loadLocale(storage){try{const saved=(storage??globalThis.localStorage)?.getItem(LOCALE_KEY);locale=own(locales,saved)?saved:'en';}catch{locale='en';}return locale;}
export function t(source,params={}){
 const pack=locales[locale];const translation=own(pack,source)?pack[source]:source;
 return translation.replace(/\{(p\d+)\}/g,(match,key)=>own(params,key)?String(params[key]):match);
}
export function translateText(value,depth=0){
 const raw=String(value);if(depth>3)return raw;
 const source=raw.trim();if(!source)return raw;
 let translated=source;
 if(own(locales[locale],source))translated=t(source);
 else {
  // An exact untranslated entry must remain intact; do not partially translate prose.
  if(!own(en,source)){
   for(const pattern of patterns){if(!own(locales[locale],pattern.source))continue;const match=pattern.regex.exec(source);if(!match)continue;
    const params=Object.fromEntries(pattern.names.map((key,i)=>[key,translateText(match[i+1],depth+1)]));translated=t(pattern.source,params);break;
   }
  }
  if(translated===source&&locale!=='en')missing.add(source);
 }
 return raw.slice(0,raw.indexOf(source))+translated+raw.slice(raw.indexOf(source)+source.length);
}
export function untranslatedText(){return [...missing].sort();}
// Recovered story/skill text keeps its source and translation provenance together.
// Never replace the source record with a translated string in simulation/save data.
export function resolveText(record){
 if(typeof record==='string')return translateText(record);
 if(!record||typeof record.source?.text!=='string')throw new TypeError('A source text record is required.');
 const translated=record.translations?.[locale];
 return typeof translated?.text==='string'?translated.text:record.source.text;
}
export function localizeDOM(root){
 function visit(node){
  if(node.nodeType===1){
   if(node.getAttribute('translate')==='no'||['SCRIPT','STYLE','TEXTAREA'].includes(node.tagName))return;
   for(const attr of ['title','aria-label','alt','placeholder'])if(node.hasAttribute(attr))node.setAttribute(attr,translateText(node.getAttribute(attr)));
  }
  if(node.nodeType===3)node.textContent=translateText(node.textContent);
  for(const child of [...(node.childNodes||[])])visit(child);
 }
 visit(root);
}
