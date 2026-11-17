import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import Handlebars from 'handlebars';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
import {createRuleVersionRegistry} from '../src/util/rule-version-registry.js';
import {prerequisiteView} from '../src/util/acquisition.js';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),json=p=>JSON.parse(read(p));
const evidencePaths=['system.json','docs/data/source-authority.json','template.json',...['ability','move','feature'].map(x=>`docs/data/${x}-source-evidence.json`),...['abilities-core','moves-anchored','features-core','pokemon-edges'].map(x=>`docs/data/record-source-review/${x}.json`)];
const evidenceIds=['moves.Y5R5mbVcGq6fwoFj','abilities.oNB76oqVYrjhYd7W','feats.aJ47Z5z6Az9c8Dy8','poke-edges.WkzCUjTOCTI60Uwg','abilities.nuGa21WQ0QD07kQj'];
const upstream={pilot:json('docs/data/rule-version-pilot.json'),revisions:read('docs/data/rules-revisions.json'),sourceEvidence:Object.fromEntries(evidencePaths.map(p=>[p,read(p)])),currentRecords:Object.fromEntries(evidenceIds.map(id=>{const [pack,key]=id.split('.');return[id,read(`packs/${pack}/_source/${key}.json`)];})),contextNote:read('docs/validation/p05-echoes-readiness.md').match(/^> (Researcher[^\r\n]+)$/m)[1],iconSha256:createHash('sha256').update(fs.readFileSync(new URL('css/images/icons/feat_icon.png',root))).digest('hex')};
const documents=[];
for(const pack of fs.readdirSync(new URL('packs/',root),{withFileTypes:true})){if(!pack.isDirectory()||!fs.existsSync(new URL(`packs/${pack.name}/_source/`,root)))continue;for(const file of fs.readdirSync(new URL(`packs/${pack.name}/_source/`,root)).filter(x=>x.endsWith('.json'))){const path=`packs/${pack.name}/_source/${file}`,item=json(path),selected=item.flags?.ptu?.selectedVersion;documents.push({path,id:item._id,filenameId:file.slice(0,-5),selectedVersionId:selected==null?null:typeof selected==='string'?selected:selected.id,sourceId:item._stats?.compendiumSource??item.flags?.core?.sourceId??null});}}
documents.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
const compiled=compileEchoesAdmission(read('docs/data/rule-version-echoes-admission.json'),read('docs/data/rule-version-echoes-draft.json'),JSON.stringify(upstream),JSON.stringify({schemaVersion:1,documents,mappings:[]}));
assert.equal(compiled.status,'prepared-not-installed');
const bundle=compiled.bundle, registry=createRuleVersionRegistry(bundle.mappings);
const getProperty=(value,path)=>path.split('.').reduce((v,k)=>v?.[k],value);
const locale=json('static/lang/en.json');
const localize=key=>getProperty(locale,key)??key;
let writes=0;
class Collection extends Map {
    get contents(){return [...this.values()];}
    [Symbol.iterator](){return this.values();}
    filter(fn){return this.contents.filter(fn);}
    map(fn){return this.contents.map(fn);}
}
globalThis.Collection=Collection;
globalThis.CONFIG={PTU:{data:{typeEffectiveness:{Normal:{}}}}};
globalThis.Application=class {constructor(options){this.options=options;this._tabs=[{activate:()=>{}}];}activateListeners(){}};
globalThis.DOMParser=class {parseFromString(html){return {body:{firstElementChild:rowElement(html)}};}};
globalThis.foundry={utils:{duplicate:structuredClone,deepClone:structuredClone,getProperty}};
globalThis.$=value=>typeof value==='string'?{length:0}:[value];
globalThis.game={settings:{get:(_ns,key)=>key==='compendiumBrowserSources'?{sources:{},ignoreAsGM:false,showEmptySources:true,showUnknownSources:true}:{},set:()=>{writes++;throw Error('No settings writes');}},user:{isGM:false},i18n:{lang:'en',localize,format:localize},packs:new Collection()};
globalThis.ui={notifications:{warn:()=>{}}};
String.prototype.capitalize??=function(){return this.charAt(0).toUpperCase()+this.slice(1);};
const mini={};vm.runInNewContext(read('static/js/minisearch.index.min.js'),mini);globalThis.MiniSearch=mini.MiniSearch;
const {CompendiumBrowser,PackLoader}=await import('../src/module/apps/compendium-browser/index.js');
const {CompendiumBrowserFeatsTab}=await import('../src/module/apps/compendium-browser/tabs/feats.js');
const clone=structuredClone,hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const key=i=>JSON.stringify([bundle.mappings[i].source.id,bundle.mappings[i].version.id,bundle.mappings[i].source.status]);
const uuid=item=>`Compendium.ptu.feats.${item._id}`;
const pair=()=>bundle.items.map(x=>clone(x.item));
const custom=()=>({...pair()[0],_id:'0000000000000001',flags:{user:{custom:'keep'}},name:'Echoes of the Future'});
function packFor(items,collection='ptu.feats'){
    const calls=[];
    return {collection,documentName:'Item',metadata:{label:collection},calls,index:new Collection(items.map(x=>[x._id,x])),async getIndex({fields}){
        calls.push([...fields]);
        const projected=items.map(item=>{
            const row={_id:item._id,type:item.type,name:item.name};
            for(const field of fields){const value=getProperty(item,field);if(value===undefined)continue;let target=row;const keys=field.split('.');for(const k of keys.slice(0,-1))target=target[k]??={};target[keys.at(-1)]=clone(value);}
            return row;
        });
        return new Collection(projected.map(x=>[x._id,x]));
    }};
}
async function browser(items=pair(),options={ruleVersionRegistry:registry}){
    const pack=packFor(items);game.packs=new Collection([[pack.collection,pack]]);
    const b=new CompendiumBrowser(options);b.settings.feats[pack.collection]={load:true,name:pack.collection};
    await b.tabs.feats.init();return {b,tab:b.tabs.feats,pack};
}
function choose(tab,keys){tab.filterData.checkboxes.ruleVersion.selected=keys;for(const [k,o] of Object.entries(tab.filterData.checkboxes.ruleVersion.options))o.selected=Array.isArray(keys)&&keys.includes(k);}
const ids=tab=>tab.getIndexData(0).map(x=>x.uuid).sort();
function renderer(overrides={}){
    const h=Handlebars.create();h.registerHelper('localize',k=>overrides[k]??localize(k));h.registerHelper('toLowerCase',s=>s.toLowerCase());h.registerHelper('checked',s=>s?'checked':'');h.registerHelper('eq',(a,b)=>a===b);h.registerHelper('notEqual',(a,b)=>a!==b);h.registerHelper('selectOptions',()=>new Handlebars.SafeString(''));h.registerHelper('is',(a,b)=>a===b);
    h.registerHelper('json',value=>JSON.stringify(value));
    h.registerPartial('systems/ptu/static/templates/apps/compendium-browser/filters.hbs',read('static/templates/apps/compendium-browser/filters.hbs'));
    return h;
}
function rowElement(html){const listeners={};return {html,dataset:{entryUuid:html.match(/data-entry-uuid="([^"]+)"/)[1],type:'Item'},listeners,querySelector:()=>({addEventListener:(event,fn)=>{listeners[event]=fn;}}),addEventListener:(event,fn)=>{listeners[event]=fn;}};}

test('actual construction opts in only Feature tab; normal construction has no version behavior',async()=>{
    const {b,tab}=await browser();assert.ok(tab.filterData.checkboxes.ruleVersion);assert.equal(b.tabs.edges.ruleVersionOptions,undefined);
    const normal=await browser(pair(),{});assert.equal(normal.tab.filterData.checkboxes.ruleVersion,undefined);assert.equal(normal.tab.indexData.length,2);assert.equal(Object.hasOwn(normal.tab.indexData[0],'ruleVersion'),false);
});
test('real indexed pair defaults to core, permits May and both, resets to core',async()=>{
    const {tab}=await browser();assert.deepEqual(ids(tab),[uuid(pair()[0])]);choose(tab,[key(1)]);assert.deepEqual(ids(tab),[uuid(pair()[1])]);choose(tab,[key(0),key(1)]);assert.deepEqual(ids(tab),pair().map(uuid).sort());tab.resetFilters();assert.deepEqual(ids(tab),[uuid(pair()[0])]);
});
test('empty and invalid version selections expose no attributed alternatives but keep custom rows',async()=>{
    const {tab}=await browser([...pair(),custom()]);for(const selected of [[],['unknown'],null,'core',[key(0),'unknown']]){choose(tab,selected);assert.deepEqual(ids(tab),[uuid(custom())]);}
});
for(const n of [0,1])test(`missing counterpart ${n} never synthesizes a row or silently substitutes May`,async()=>{
    const {tab}=await browser([pair()[n]]);assert.equal(tab.indexData.length,1);assert.deepEqual(ids(tab),n?[]:[uuid(pair()[0])]);choose(tab,[key(n)]);assert.deepEqual(ids(tab),[uuid(pair()[n])]);
});
test('empty packs and absent proposed Items produce no entries despite supplied mappings',async()=>{
    const {tab}=await browser([]);assert.deepEqual(ids(tab),[]);for(const item of bundle.items)assert.equal(fs.existsSync(new URL(item.targetPath,root)),false);
});
test('refresh restores core without repeating complete pack load or duplicating records',async()=>{
    const {tab,pack}=await browser();choose(tab,[key(1)]);await tab.init();await tab.init();assert.deepEqual(ids(tab),[uuid(pair()[0])]);assert.equal(pack.calls.length,1);assert.equal(tab.indexData.length,2);
});
test('bundled MiniSearch stores attribution and original UUID for search and ordinary index results',async()=>{
    const {tab}=await browser();choose(tab,[key(0),key(1)]);const before=tab.getIndexData(0);tab.filterData.search.text='Echoes';const found=tab.getIndexData(0);assert.equal(found.length,2);for(const row of found){const original=before.find(x=>x.uuid===row.uuid);assert.deepEqual(row.ruleVersion,original.ruleVersion);assert.ok(row.ruleVersion.versionId);}
});
test('renamed and same-name Items resolve only by pack identity, never historical provenance',async()=>{
    const items=pair();items[0].name='Renamed <Core>';items[1]._stats={compendiumSource:uuid(items[0])};const c=custom();c._stats={compendiumSource:uuid(items[0])};const {tab}=await browser([...items,c]);assert.equal(tab.indexData.find(x=>x.uuid===uuid(c)).ruleVersion.status,'unresolved');assert.equal(tab.indexData.find(x=>x.name===items[0].name).ruleVersion.versionId,bundle.mappings[0].version.id);assert.deepEqual(ids(tab),[uuid(items[0]),uuid(c)].sort());
});
for(const mode of ['malformed','tampered','unclassified','conflicting'])test(`${mode} attribution never labels core or approved and keeps uncertain browsing`,async()=>{
    const items=pair();let r=clone(registry);
    if(mode==='malformed')r={};if(mode==='tampered')r.aliases[0].canonicalUuid=bundle.mappings[1].documentUuid;
    if(mode==='unclassified'){const m=clone(bundle.mappings);m.forEach(x=>x.generationEligibility='unclassified');r=createRuleVersionRegistry(m);}
    if(mode==='conflicting')items.forEach((x,i)=>x.flags.ptu.selectedVersion.id=bundle.mappings[1-i].version.id);
    const {tab}=await browser(items,{ruleVersionRegistry:r});assert.equal(tab.indexData.length,2);for(const row of tab.indexData){assert.equal(row.ruleVersion.status,'unresolved');assert.equal(row.ruleVersion.versionId,undefined);assert.equal(row.ruleVersion.sourceStatus,undefined);}assert.equal(ids(tab).length,2);
});
test('source, class, keyword and Obsolete filters still intersect the version view',async()=>{
    const items=pair();items[1].system.keywords=['Obsolete'];const {tab}=await browser(items);choose(tab,[key(0),key(1)]);assert.deepEqual(ids(tab),[uuid(items[0])]);tab.filterData.checkboxes.source.selected=['missing'];assert.deepEqual(ids(tab),[]);tab.filterData.checkboxes.source.selected=[];tab.filterData.checkboxes.class.selected=['missing'];assert.deepEqual(ids(tab),[]);tab.filterData.checkboxes.class.selected=[];tab.filterData.multiselects.keywords.selected=[{value:'Missing',not:false}];assert.deepEqual(ids(tab),[]);
});
test('actual row and shared filters render escaped localized attribution and stable keys',async()=>{
    const m=clone(bundle.mappings);m[1].version.label='<script>optional</script>';m[1].source.edition='May <source>';const {tab}=await browser(pair(),{ruleVersionRegistry:createRuleVersionRegistry(m)});choose(tab,Object.keys(tab.filterData.checkboxes.ruleVersion.options));const h=renderer({'PTU.CompendiumBrowser.RuleVersion.OptionalPlaytest':'Optional <translated>'});
    const row=h.compile(read('static/templates/apps/compendium-browser/partials/feats.hbs'))({entry:tab.indexData[1]});assert.ok(row.includes('data-entry-uuid="'+uuid(pair()[1])+'"'));assert.ok(row.includes('&lt;script&gt;optional&lt;/script&gt;'));assert.ok(row.includes('May &lt;source&gt;'));assert.ok(row.includes('Optional &lt;translated&gt;'));assert.equal(row.includes('<script>'),false);
    const filter=h.compile(read('static/templates/apps/compendium-browser/filters.hbs'))({filterData:tab.filterData});for(const name of ['source','class','ruleVersion','keywords'])assert.ok(filter.includes(`data-filter-name="${name}"`));assert.ok(filter.includes('Rule version'));assert.ok(filter.includes('&lt;script&gt;optional&lt;/script&gt;'));for(const k of Object.keys(tab.filterData.checkboxes.ruleVersion.options))assert.ok(filter.includes(`name="${Handlebars.escapeExpression(k)}"`));
});
test('actual base rendering, opening and drag preserve the exact selected UUID without writes',async()=>{
    const {b,tab}=await browser();choose(tab,[key(1)]);const h=renderer();foundry.applications={handlebars:{renderTemplate:async(path,data)=>h.compile(read(path.replace('systems/ptu/','')))(data)}};
    const elements=await tab.renderResult(0);assert.equal(elements[0].dataset.entryUuid,uuid(pair()[1]));
    let opened=null,rendered=0;globalThis.fromUuid=async id=>{opened=id;return {sheet:{render:()=>rendered++}};};
    // Drive the actual list renderer, which installs its private opening listeners.
    let finish;const ready=new Promise(resolve=>finish=resolve);
    const list={innerHTML:'',addEventListener:()=>{},append:fragment=>{list.rows=fragment.rows;finish();}};
    globalThis.document={createDocumentFragment:()=>({append(...rows){this.rows=rows;}})};
    const html={querySelector:selector=>selector==='div.control-area'?{querySelector:()=>null,querySelectorAll:()=>[]}:list};
    b.activeTab='feats';b._dragDrop=[];b.element={0:html,animate:()=>{},css:()=>{}};
    b.activateListeners({0:html});await ready;assert.ok(list.rows?.length);await list.rows[0].listeners.click();assert.equal(opened,uuid(pair()[1]));assert.equal(rendered,1);
    let drag; b._onDragStart({currentTarget:elements[0],dataTransfer:{setData:(_type,value)=>drag=JSON.parse(value)}});assert.deepEqual(drag,{type:'Item',uuid:uuid(pair()[1])});assert.equal(writes,0);
});
test('pack cache obtains union of later fields once, including optional flags absent on custom rows',async()=>{
    const {b,pack}=await browser([...pair(),custom()],{});b.packLoader=new PackLoader();b.settings.edges[pack.collection]={load:true,name:pack.collection};await b.tabs.edges.init();
    assert.equal(pack.calls.at(-1).includes('flags.ptu.selectedVersion'),false);assert.equal(pack.calls.at(-1).includes('system.class'),false);
    const tab=new CompendiumBrowserFeatsTab(b,{registry});await tab.init();assert.equal(tab.indexData.length,3);assert.equal(tab.indexData.find(x=>x.uuid===uuid(pair()[0])).ruleVersion.status,'resolved');const calls=pack.calls.length;await tab.init();assert.equal(pack.calls.length,calls);assert.ok(pack.calls.at(-1).includes('flags.ptu.selectedVersion'));assert.ok(pack.calls.at(-1).includes('system.source.value'));
});
test('pack enrichment preserves source policy and exact stable-ID scope exclusions',async()=>{
    const items=pair();items[0].system.source={value:'Allowed'};items[1].system.source={value:'Blocked'};const excluded={...custom(),_id:'3w7uQfBvzzxATXis',system:{...custom().system,source:{value:'Allowed'}}};const pack=packFor([...items,excluded],'ptu.effects');game.packs=new Collection([[pack.collection,pack]]);const loader=new PackLoader();loader.sourcesSettings={ignoreAsGM:false,showEmptySources:false,showUnknownSources:false,sources:{allowed:{name:'Allowed',load:true},blocked:{name:'Blocked',load:false}}};for(const fields of [['system.source.value'],['system.source.value','flags.ptu.selectedVersion']]){const results=[];for await(const x of loader.loadPacks('Item',[pack.collection],fields))results.push(...x.index);assert.deepEqual(results.map(x=>x._id),[items[0]._id]);}assert.equal(pack.calls.length,2);
});
test('detached browsing preserves content/custom choices and advisory unmet prerequisites',async()=>{
    const items=[...pair(),custom()],before=hash(items);const {tab}=await browser(items);choose(tab,[key(1)]);tab.getIndexData(0);tab.resetFilters();assert.equal(hash(items),before);const view=prerequisiteView(items[0],{system:{skills:{generalEd:{value:{total:1}}}},items:[]});assert.ok(view.unmet.length);assert.equal(view.clear,false);assert.equal(writes,0);
});
test('unselected metadata is optional; a conflicting present selection is unresolved',async()=>{
    const items=pair();delete items[0].flags;items[1].flags.ptu.selectedVersion={id:'conflicting'};
    const {tab}=await browser(items);assert.equal(tab.indexData[0].ruleVersion.status,'resolved');assert.equal(tab.indexData[1].ruleVersion.status,'unresolved');assert.equal(ids(tab).length,2);
});
test('a shared version token with distinct source identities cannot default-select an optional source',async()=>{
    const m=clone(bundle.mappings);m[1].version.id=m[0].version.id;m[1].canonical.id='distinct-benefit';const items=pair();items[1].flags.ptu.selectedVersion.id=m[0].version.id;
    const {tab}=await browser(items,{ruleVersionRegistry:createRuleVersionRegistry(m)});assert.equal(Object.keys(tab.filterData.checkboxes.ruleVersion.options).length,2);assert.deepEqual(ids(tab),[uuid(items[0])]);
});
test('invalid explicit registry is unresolved, while inherited input never opts in',async()=>{
    const explicit=await browser(pair(),{ruleVersionRegistry:undefined});assert.ok(explicit.tab.indexData.every(x=>x.ruleVersion.status==='unresolved'));
    const inherited=await browser(pair(),Object.create({ruleVersionRegistry:registry}));assert.equal(inherited.tab.filterData.checkboxes.ruleVersion,undefined);
});
test('no-registry mode retains existing filters and does not request optional metadata',async()=>{
    const {tab,pack}=await browser([...pair(),custom()],{});assert.equal(ids(tab).length,3);assert.equal(pack.calls[0].includes('flags.ptu.selectedVersion'),false);tab.filterData.checkboxes.class.selected=['missing'];assert.deepEqual(ids(tab),[]);tab.resetFilters();assert.equal(ids(tab).length,3);
});
test('actual inherited Feature keeps its original identity and unresolved approval notice',async()=>{
    const inherited=json('packs/feats/_source/aJ47Z5z6Az9c8Dy8.json');const before=hash(inherited);const {tab}=await browser([...pair(),inherited]);const row=tab.indexData.find(x=>x.uuid===uuid(inherited));assert.ok(row);assert.equal(row.ruleVersion.status,'unresolved');assert.equal(hash(inherited),before);
    const h=renderer(),html=h.compile(read('static/templates/apps/compendium-browser/compendium-browser.hbs'))({tab:'feats',user:{isGM:false},feats:{filterData:tab.filterData}});assert.ok(html.includes('Content approval is incomplete. Some listed inherited entries have not been reviewed for PTU 1.05.'));assert.equal(writes,0);
});
