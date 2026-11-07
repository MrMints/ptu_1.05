import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import Handlebars from 'handlebars';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
import {createRuleVersionRegistry} from '../src/util/rule-version-registry.js';
import {lookupSelectedRuleVersion} from '../src/util/rule-versions.js';
import * as selection from '../src/module/apps/npc-quick-build/selection.js';
import {Mutex} from '../src/util/mutex.js';
import {SKILLS} from '../src/util/skills.js';
import {evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';
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
const clone=x=>structuredClone(x),plain=x=>JSON.parse(JSON.stringify(x)),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const getProperty=(v,p)=>p.split('.').reduce((a,k)=>a?.[k],v);
function setProperty(v,p,x){const keys=p.split('.');for(const k of keys.slice(0,-1))v=v[k]??={};v[keys.at(-1)]=x;}
const locale=json('static/lang/en.json'),localize=k=>getProperty(locale,k)??k;
const pair=()=>bundle.items.map((x,i)=>({...clone(x.item),uuid:bundle.mappings[i].documentUuid,pack:'ptu.feats'}));
const custom=()=>({...pair()[0],_id:'0000000000001000',uuid:'Compendium.ptu.feats.Item.0000000000001000',flags:{custom:{keep:true}},name:'Echoes of the Future'});
const sourceText=p=>read(p).replace(/^import .*;?\r?\n/gm,'').replace(/^export /gm,'');
const tagContext={module:{exports:{}},exports:{},window:{},document:{},navigator:{userAgent:'node'},setTimeout,clearTimeout};
vm.runInNewContext(read('static/js/tagify'),tagContext);const BundledTagify=tagContext.module.exports;
async function harness(items=pair(),options={registry},primed=false){
    const state={writes:0,requests:[],lookups:[],widgets:[],renders:0};
    const originals=items;const docs=new Map(items.map(i=>[i.uuid,i]));
    const makePack=(collection,rows)=>({collection,metadata:{label:collection},index:rows.map(x=>({_id:x._id,name:x.name,type:x.type,uuid:x.uuid,system:{keywords:clone(x.system.keywords??[])}})),async getIndex({fields}){state.requests.push({collection,fields:[...fields]});this.index=rows.map(clone);return this.index;}});
    const packs=new Map([['ptu.feats',makePack('ptu.feats',items)],['ptu.edges',makePack('ptu.edges',[])],['ptu.species',makePack('ptu.species',[])]]);
    const game={packs,users:[],tables:[],user:{can:()=>true},settings:{set:()=>{state.writes++;throw Error('No settings writes');}},i18n:{localize,format:localize},ptu:{compendiumBrowser:{settings:{feats:{'ptu.feats':{load:true}},edges:{'ptu.edges':{load:true}},species:{'ptu.species':{load:true}}},initCompendiumList(){},tabs:Object.fromEntries(['feats','edges','species'].map(key=>[key,{filterData:{selected:['unrelated-browser-state']},loadData:async()=>{game.ptu.compendiumBrowser.tabs[key].filterData.selected=['browser-refresh'];for(const [id,pack]of packs)if(id===`ptu.${key}`)await pack.getIndex({fields:['system.keywords']});}}]))}}};
    const ranks={1:'pathetic',2:'untrained',3:'novice',4:'adept',5:'expert',6:'master'};
    const forbid=()=>{state.writes++;throw Error('No document creation or update');};
    const CONFIG={PTU:{data:{alliances:['opposition'],skills:{keys:Object.keys(SKILLS)},stats:{keys:['hp']}}}},foundry={utils:{deepClone:clone,getProperty,setProperty,mergeObject:(a,b)=>({...a,...b})}};
    // The serialized optional input crosses the VM into the actual native lookup.
    const scope={console,structuredClone,Set,Mutex,SKILLS,...selection,lookupSelectedRuleVersion:(item,options)=>lookupSelectedRuleVersion(item,{registry:options.registry}),evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics,game,CONFIG,foundry,
        PTUSkills:{getRankSlug:n=>ranks[n]},getSkillLabel:key=>key,Math:Object.assign(Object.create(Math),{random:()=>0}),PokemonGenerator:class{constructor(){forbid();}},Actor:{create:forbid},Item:{create:forbid},Folder:{create:forbid},
        fromUuid:async uuid=>{state.lookups.push(uuid);const item=docs.get(uuid);return item?{...item,toObject:()=>clone(item),update:forbid}:null;}};
    const context=vm.createContext(scope);const Data=vm.runInContext(sourceText('src/module/apps/npc-quick-build/document.js')+'\nNpcQuickBuildData',context);
    if(primed)Data._preloadedCompendiums=true;
    const data=new Data(options);data.trainer.partySize=0;data.party={};data.page=2;await data.preload();await data.refresh();
    class FormApplication {constructor(){}getData(){return {};}activateListeners(){}async _render(){state.renders++;return this;}static get defaultOptions(){return {};}}
    class TagifyDouble {
        constructor(input,settings){this.settings={...settings,delimiters:',',trim:true,blacklist:[]};this.TEXTS={duplicate:'duplicate',notAllowed:'not allowed',empty:'empty'};this.value=[];this.state={dropdown:{}};this.dropdown={filterListItems:BundledTagify.prototype._dropdown.filterListItems.bind(this)};this.events={};this.value=this.normalizeTags(JSON.parse(input.value));state.widgets.push(this);}
        normalizeTags(input){return BundledTagify.prototype.normalizeTags.call(this,input);}
        isTagDuplicate(value){return this.value.some(x=>x.value===value);}
        getWhitelistItem(...args){return BundledTagify.prototype.getWhitelistItem.apply(this,args);}
        trim(...args){return BundledTagify.prototype.trim.apply(this,args);}
        isTagWhitelisted(...args){return BundledTagify.prototype.isTagWhitelisted.apply(this,args);}
        isTagBlacklisted(...args){return BundledTagify.prototype.isTagBlacklisted.apply(this,args);}
        validateTag(...args){return BundledTagify.prototype.validateTag.apply(this,args);}
        on(name,fn){this.events[name]=fn;return this;}
    }
    context.FormApplication=FormApplication;context.NpcQuickBuildData=Data;context.Tagify=TagifyDouble;
    const Sheet=vm.runInContext(sourceText('src/module/apps/npc-quick-build/sheet.js')+'\nPTUNpcQuickBuild',context);
    const sheet=new Sheet({ruleVersionRegistry:options.registry});sheet.data=data;
    const inputs=[];const listeners={};const empty={on(){},*[Symbol.iterator](){}};
    const html={find:selector=>selector==='.ptu-tagify[data-filter-name]'?inputs:selector==='[data-feature-version-reset]'?{on:(name,fn)=>listeners[name]=fn}:empty};
    function widget(){inputs.length=0;inputs.push({dataset:{filterName:'features'},name:'trainer.features.selected',value:JSON.stringify(data.trainer.features.selected),matches:()=>false});sheet.activateListeners(html);return state.widgets.at(-1);}
    return {data,Data,Sheet,sheet,widget,state,packs,docs,game,originals,listeners};
}
const values=data=>Array.from(data.multiselects.features.options,x=>x.uuid);
function choose(data,which){const options=data.featureVersionFilter.options;data.featureVersionFilter.selected=Object.fromEntries(Object.entries(options).map(([key,o])=>[key,which==='both'||o.ruleVersion.sourceStatus===which]));}
const selected=(item,n=1)=>({...selection.documentOption(item),value:n===1?item.uuid:`${item.uuid}::repeat:${n}`,custom:{keep:n}});

test('actual NPC preload defaults to core and isolates supplied registry from browser filters',async()=>{
    const h=await harness();assert.deepEqual(h.game.ptu.compendiumBrowser.tabs.feats.filterData.selected,['unrelated-browser-state']);assert.deepEqual(values(h.data),[pair()[0].uuid]);assert.ok(h.state.requests.some(x=>x.fields.includes('flags.ptu.selectedVersion')));assert.equal(h.data.multiselects.features.options[0].ruleVersion.status,'resolved');h.game.ptu.compendiumBrowser.tabs.feats.filterData.selected=[];await h.data.refresh();assert.deepEqual(values(h.data),[pair()[0].uuid]);
});
test('actual sheet constructor supplies registry only when explicitly given',async()=>{
    const h=await harness();const supplied=new h.Sheet({ruleVersionRegistry:registry}),normal=new h.Sheet({});assert.equal(supplied.data.hasRuleVersionRegistry,true);assert.equal(normal.data.hasRuleVersionRegistry,false);assert.equal(normal.data.featureVersionFilter,undefined);
});
test('core, optional, both, empty and invalid discovery filters preserve selected values',async()=>{
    const h=await harness(),d=h.data;d.trainer.features.selected=[selected(pair()[1])];for(const [mode,expected]of [['core',pair()[0].uuid],['optional-playtest',pair()[1].uuid]]){choose(d,mode);await d.refresh();assert.ok(values(d).includes(expected));assert.equal(values(d).every(x=>x===expected),true);}choose(d,'both');await d.refresh();assert.ok(pair().every(x=>values(d).includes(x.uuid)));for(const invalid of [{},null,[],{unknown:true},{[Object.keys(d.featureVersionFilter.options)[0]]:'true'}]){d.featureVersionFilter.selected=invalid;await d.refresh();assert.deepEqual(values(d),[]);assert.equal(d.trainer.features.selected[0].uuid,pair()[1].uuid);}
});
test('saved May and repeated May remain valid in actual Tagify normalization while core-only discovery excludes both',async()=>{
    const h=await harness(),d=h.data;d.trainer.features.selected=[selected(pair()[1]),selected(pair()[1],2)];const before=hash(d.trainer.features.selected);await d.refresh();const widget=h.widget();assert.equal(widget.value.length,2);assert.equal(widget.value[1].value,`${pair()[1].uuid}::repeat:2`);assert.equal(widget.value[1].custom.keep,2);assert.equal(hash(d.trainer.features.selected),before);
    assert.equal(widget.settings.whitelist.filter(x=>x.uuid===pair()[1].uuid).length,2);assert.equal(values(d).some(x=>x===pair()[1].uuid),false);const offered=widget.dropdown.filterListItems('');assert.equal(offered.some(x=>x.uuid===pair()[1].uuid),false);assert.equal(widget.state.dropdown.suggestions.some(x=>x.uuid===pair()[1].uuid),false);assert.equal(widget.settings.whitelist.some(x=>x.uuid===pair()[1].uuid),true);
});
test('filtered preserved choices cannot re-enter dropdown through text search or next-repeat options',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1],2)];await h.data.refresh();const widget=h.widget();for(const query of ['', 'Echoes', bundle.mappings[1].source.edition]){const offered=widget.dropdown.filterListItems(query);assert.equal(offered.some(x=>x.uuid===pair()[1].uuid),false);}assert.equal(widget.settings.whitelist.some(x=>x.value.endsWith('::repeat:3')&&x.uuid===pair()[1].uuid),false);
});
test('repetitions and independent subchoices survive filter/refresh/reset without grants or rank changes',async()=>{
    const items=pair();items.forEach(i=>i.system.rules=[{key:'ChoiceSet',choices:[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}]}]);const h=await harness(items),d=h.data;d.trainer.features.selected=[selected(items[1]),selected(items[1],2)];await d.refresh();const keys=Object.keys(d.trainer.subSelectables);d.trainer.subSelectables[keys[0]].selected='alpha';d.trainer.subSelectables[keys[1]].selected='beta';const before=hash(d.trainer.features.selected),skills=hash(d.trainer.skills);choose(d,'core');await d.refresh();d.resetFeatureVersionFilter();await d.refresh();assert.deepEqual(Array.from(Object.values(d.trainer.subSelectables),x=>x.selected),['alpha','beta']);assert.equal(hash(d.trainer.features.selected),before);assert.equal(hash(d.trainer.skills),skills);assert.ok(d.warnings.unmet.length);assert.ok(d.prerequisiteReports.every(x=>x.advisory));assert.equal(h.state.writes,0);
});
test('unavailable selected sources retain whitelist identities, subchoices and explicit uncertainty',async()=>{
    const items=pair();items[1].system.rules=[{key:'ChoiceSet',choices:[{label:'Alpha',value:'alpha'}]}];const h=await harness(items),d=h.data;d.trainer.features.selected=[selected(items[1],2)];await d.refresh();const key=Object.keys(d.trainer.subSelectables)[0];d.trainer.subSelectables[key].selected='alpha';h.docs.delete(items[1].uuid);h.packs.get('ptu.feats').index=[];h.packs.get('ptu.feats').getIndex=async()=>[];await d.preload();await d.refresh();assert.equal(h.widget().value[0].value,`${items[1].uuid}::repeat:2`);assert.equal(d.trainer.subSelectables[key].selected,'alpha');assert.ok(d.warnings.unknown.some(x=>x.includes('unavailable')));assert.deepEqual(values(d),[]);assert.equal(h.state.writes,0);
});
test('missing core never substitutes May; no counterpart is synthesized',async()=>{
    const h=await harness([pair()[1]]);assert.deepEqual(values(h.data),[]);choose(h.data,'optional-playtest');await h.data.refresh();assert.deepEqual(values(h.data),[pair()[1].uuid]);const empty=await harness([]);assert.deepEqual(values(empty.data),[]);for(const item of bundle.items)assert.equal(fs.existsSync(new URL(item.targetPath,root)),false);
});
test('independently primed index caches still obtain selected-version flags and reject conflicting selections',async()=>{
    const items=pair();items[1].flags.ptu.selectedVersion.id='conflicting';const h=await harness(items,{registry},true);assert.ok(h.state.requests.some(x=>x.fields.includes('flags.ptu.selectedVersion')));assert.equal(h.data._staticMultiselects.features.options.find(x=>x.uuid===items[1].uuid).ruleVersion.status,'unresolved');
});
test('missing optional metadata does not remove indexed inherited/custom Features',async()=>{
    const items=pair();delete items[0].flags;const h=await harness([...items,custom()]);assert.equal(h.data._staticMultiselects.features.options.length,3);assert.equal(h.data._staticMultiselects.features.options.find(x=>x.uuid===items[0].uuid).ruleVersion.status,'resolved');assert.equal(h.data._staticMultiselects.features.options.find(x=>x.uuid===custom().uuid).ruleVersion.status,'unresolved');
});
test('malformed/tampered/unclassified registries cannot label records as core or approved',async()=>{
    const unclassified=clone(bundle.mappings);unclassified.forEach(x=>x.generationEligibility='unclassified');const tampered=clone(registry);tampered.aliases[0].canonicalUuid=bundle.mappings[1].documentUuid;for(const r of [{},tampered,createRuleVersionRegistry(unclassified)]){const h=await harness(pair(),{registry:r});assert.ok(h.data._staticMultiselects.features.options.every(x=>x.ruleVersion.status==='unresolved'));assert.equal(values(h.data).length,2);}
});
test('renaming and foreign packs never redirect exact identity or version attribution',async()=>{
    const items=pair();items[0].name='Renamed core';const foreign={...custom(),uuid:pair()[1].uuid.replace('ptu.feats','foreign.feats'),pack:'foreign.feats'};const h=await harness([...items,foreign]);const option=h.data._staticMultiselects.features.options.find(x=>x.uuid===foreign.uuid);assert.equal(option.ruleVersion.status,'unresolved');assert.equal(h.data._staticMultiselects.features.options.find(x=>x.uuid===items[0].uuid).ruleVersion.versionId,bundle.mappings[0].version.id);
});
test('per-instance filters and registries do not share mutable state',async()=>{
    const h=await harness(),other=new h.Data({registry});other.trainer.partySize=0;other.party={};await other.preload();await other.refresh();choose(h.data,'optional-playtest');await h.data.refresh();assert.deepEqual(values(other),[pair()[0].uuid]);assert.notEqual(h.data.featureVersionFilter,other.featureVersionFilter);assert.notEqual(h.data.featureVersionFilter.selected,other.featureVersionFilter.selected);
});
test('actual form updates and reset preserve selected May while changing discovery',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1])];await h.data.refresh();const fields={};for(const [key,o]of Object.entries(h.data.featureVersionFilter.options))fields[`featureVersionFilter.selected.${key}`]=o.ruleVersion.sourceStatus==='optional-playtest';await h.sheet._updateObject({preventDefault(){}},fields);await h.data.refresh();assert.ok(values(h.data).every(x=>x===pair()[1].uuid));h.widget();h.listeners.click({preventDefault(){}});await h.data.refresh();assert.deepEqual(values(h.data),[pair()[0].uuid]);assert.equal(h.data.trainer.features.selected[0].uuid,pair()[1].uuid);
});
test('actual template and dropdown escape localized source/version labels and preserve UUIDs and advisory warnings',async()=>{
    const m=clone(bundle.mappings);m[1].version.label='May <script>';m[1].source.edition='Source <tag>';const h=await harness(pair(),{registry:createRuleVersionRegistry(m)});h.data.trainer.features.selected=[selected(pair()[1])];await h.data.refresh();const engine=Handlebars.create();engine.registerHelper('localize',localize);engine.registerHelper('eq',(a,b)=>a===b);engine.registerHelper('gt',(a,b)=>a>b);engine.registerHelper('checked',v=>v?'checked':'');engine.registerHelper('json',x=>JSON.stringify(x));engine.registerHelper('selectOptions',()=>new Handlebars.SafeString(''));const html=engine.compile(read('static/templates/apps/npc-quick-build-sheet.hbs'))({data:h.data,config:{},allianceOptions:{}});assert.ok(html.includes('May &lt;script&gt;'));assert.ok(html.includes('Source &lt;tag&gt;'));assert.ok(html.includes('Optional playtest'));assert.ok(html.includes('data-uuid="'+pair()[1].uuid+'"'));assert.ok(html.includes('Prerequisite Diagnostics (Advisory)'));assert.ok(html.includes('Selected Features are preserved'));assert.equal(html.includes('May <script>'),false);const option=h.data.multiselects.features.whitelist.find(x=>x.uuid===pair()[1].uuid);const dropdown=selection.documentDropdownItem(option);assert.ok(dropdown.includes('May &lt;script&gt;'));assert.ok(dropdown.includes(pair()[1].uuid));
});
test('randomization uses discovery, including empty eligibility, without selecting preserved May',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1])];await h.data.refresh();h.data.allItemPrereqs=async()=>({allNewFeatures:[],allNewUnmet:[]});await h.data.randomizeFeatures(true);assert.ok(h.data.trainer.features.selected.slice(1).every(x=>x.uuid===pair()[0].uuid));h.data.featureVersionFilter.selected={};await h.data.refresh();const before=hash(h.data.trainer.features.selected);await h.data.randomizeFeatures(true);assert.equal(hash(h.data.trainer.features.selected),before);assert.equal(h.state.writes,0);
});
test('no-registry and non-Feature behavior stay compatible and detached records never change',async()=>{
    const items=pair(),before=hash(items);const h=await harness(items,{});assert.equal(h.data.featureVersionFilter,undefined);assert.equal(new h.Data(null).featureVersionFilter,undefined);assert.equal(values(h.data).length,2);assert.equal(h.data.multiselects.features.whitelist,undefined);assert.equal(Object.hasOwn(h.data.multiselects.features.options[0],'ruleVersion'),false);assert.equal(h.data.multiselects.edges.whitelist,undefined);assert.equal(hash(items),before);assert.equal(h.state.writes,0);
});
test('source return restores attribution and independent subchoice without exposing filtered May',async()=>{
    const items=pair();items[1].system.rules=[{key:'ChoiceSet',choices:[{label:'Alpha',value:'alpha'}]}];const h=await harness(items),d=h.data;d.trainer.features.selected=[selected(items[1],2)];await d.refresh();const key=Object.keys(d.trainer.subSelectables)[0];d.trainer.subSelectables[key].selected='alpha';const pack=h.packs.get('ptu.feats'),getIndex=pack.getIndex;h.docs.delete(items[1].uuid);pack.getIndex=async()=>[clone(items[0])];await d.preload();await d.refresh();assert.deepEqual(values(d),[items[0].uuid]);assert.equal(d.trainer.subSelectables[key].unavailable,true);h.docs.set(items[1].uuid,items[1]);pack.getIndex=getIndex;await d.preload();await d.refresh();assert.equal(d.trainer.subSelectables[key].selected,'alpha');assert.equal(d.trainer.subSelectables[key].unavailable,undefined);assert.deepEqual(values(d),[items[0].uuid]);assert.equal(h.widget().value[0].uuid,items[1].uuid);
});
test('form round trip and repeated Tagify change preserve May repetitions and custom fields',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1]),selected(pair()[1],2)];await h.data.refresh();const before=hash(h.data.trainer.features.selected),widget=h.widget();widget.events.change({preventDefault(){},detail:{value:JSON.stringify(widget.value)}});await h.sheet.renderAsync();await h.data.refresh();assert.equal(hash(h.data.trainer.features.selected),before);assert.equal(h.widget().value.length,2);assert.equal(h.state.writes,0);
});
test('filtered dropdown restores the preservation whitelist even when bundled filtering throws',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1])];await h.data.refresh();const widget=h.widget(),saved=widget.settings.whitelist;widget.isTagDuplicate=()=>{throw Error('dropdown failure');};assert.throws(()=>widget.dropdown.filterListItems(''),/dropdown failure/);assert.equal(widget.settings.whitelist,saved);assert.equal(widget.normalizeTags([selected(pair()[1])])[0].uuid,pair()[1].uuid);
});
test('detached core/May records, source IDs and explicit skills remain unchanged in opt-in mode',async()=>{
    const items=pair(),before=hash(items);const h=await harness(items);h.data.trainer.features.selected=[selected(items[1])];const ranks=Object.fromEntries(Object.entries(h.data.trainer.skills).map(([k,s])=>[k,s.value]));await h.data.refresh();choose(h.data,'both');await h.data.refresh();assert.equal(hash(items),before);assert.deepEqual(Object.fromEntries(Object.entries(h.data.trainer.skills).map(([k,s])=>[k,s.value])),ranks);assert.equal(h.state.writes,0);
});
test('Class and Edge controls retain their ordinary identities and selection options',async()=>{
    const classItem={...custom(),_id:'0000000000001001',uuid:'Compendium.ptu.feats.Item.0000000000001001',name:'Class fixture'};classItem.system.keywords=['Class'];const h=await harness([...pair(),classItem]);const edge={...custom(),uuid:'Compendium.ptu.edges.Item.0000000000001002',type:'edge',name:'Edge fixture'};h.docs.set(edge.uuid,edge);h.packs.get('ptu.edges').index=[edge];await h.data.preload();h.data.trainer.edges.selected=[selected(edge)];await h.data.refresh();assert.equal(h.data.multiselects.classes.options[0].uuid,classItem.uuid);assert.equal(h.data.multiselects.classes.options[0].ruleVersion,undefined);assert.equal(h.data.multiselects.edges.options[0].uuid,edge.uuid);assert.equal(h.data.multiselects.edges.whitelist,undefined);assert.equal(h.data.trainer.edges.computed[0].ruleVersion,undefined);assert.equal(h.state.writes,0);
});
test('empty discovery randomization can clear draft selections without errors or writes',async()=>{
    const h=await harness();h.data.featureVersionFilter.selected={};h.data.trainer.features.selected=[selected(pair()[1])];await h.data.refresh();await h.data.randomizeFeatures(false);assert.deepEqual(plain(h.data.trainer.features.selected),[]);assert.equal(h.state.writes,0);
});
test('bundled whitelist validation accepts exact saved May repeats after filtered discovery',async()=>{
    const h=await harness();h.data.trainer.features.selected=[selected(pair()[1]),selected(pair()[1],2)];await h.data.refresh();const widget=h.widget(),saved=widget.value;widget.value=[];widget.dropdown.filterListItems('');for(const value of saved){assert.equal(widget.isTagWhitelisted(value.value),true);assert.equal(widget.validateTag(value),true);}assert.notEqual(widget.validateTag({...saved[0],value:`${pair()[1].uuid}::repeat:3`}),true);widget.value=saved;
});
test('opt-in warmup does not suppress a later ordinary browser Feature preload',async()=>{
    const h=await harness();const normal=new h.Data({});normal.trainer.partySize=0;normal.party={};await normal.preload();assert.deepEqual(h.game.ptu.compendiumBrowser.tabs.feats.filterData.selected,['browser-refresh']);assert.equal(normal.multiselects.features.options.length,2);assert.equal(normal.featureVersionFilter,undefined);
});
test('indexed UUID properties retain exact attribution even when not enumerable',async()=>{
    const h=await harness(),pack=h.packs.get('ptu.feats'),getIndex=pack.getIndex.bind(pack);pack.getIndex=async options=>(await getIndex(options)).map(row=>{Object.defineProperty(row,'uuid',{value:row.uuid,enumerable:false});return row;});await h.data.preload();await h.data.refresh();assert.equal(h.data._staticMultiselects.features.options.find(x=>x.uuid===pair()[0].uuid).ruleVersion.status,'resolved');assert.deepEqual(values(h.data),[pair()[0].uuid]);
});
