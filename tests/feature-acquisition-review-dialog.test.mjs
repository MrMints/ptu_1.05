import Handlebars from 'handlebars';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
import {createRuleVersionRegistry} from '../src/util/rule-version-registry.js';
import {inspectFeatureVersionAcquisition as inspect} from '../src/util/rule-version-acquisition-review.js';
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
const clone=value=>structuredClone(value),hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pack=(index=0)=>({...clone(bundle.items[index].item),uuid:bundle.mappings[index].documentUuid,pack:'ptu.feats'});
const id=n=>String(n).padStart(16,'0');
function owned(index=0,n=1){const value=pack(index);delete value.pack;value._id=id(500+n);value.uuid=`Actor.${id(400)}.Item.${value._id}`;value._stats={compendiumSource:bundle.mappings[index].documentUuid};value.flags.user={rank:n,choice:`choice-${n}`};value.system.custom={subchoices:{field:`field-${n}`},uses:n};return value;}
const actor=(rank=2,items=[])=>({uuid:`Actor.${id(400)}`,system:{level:{current:4},skills:{generalEd:{value:{total:rank}},focus:{value:{total:3}}}},items});
const request=(extra={})=>({owned:[],incoming:[pack()],actor:actor(),registry,...extra});
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const reasons=value=>JSON.stringify(value);

const template=Handlebars.create().compile(read('static/templates/apps/feature-acquisition-review.hbs'));
const locale=json('static/lang/en.json');
let active;
class Events {
    handlers=new Map();
    constructor(root=this,selector='root'){this.root=root;this.selector=selector;}
    find(selector){return new Events(this.root,selector);}
    off(name){this.root.handlers.delete(`${this.selector}:${name}`);return this;}
    on(name,callback){this.root.handlers.set(`${this.selector}:${name}`,callback);return this;}
    fire(name,event){const values=[...this.root.handlers].filter(([key])=>key.endsWith(`:${name}`));return Promise.all(values.map(([,callback])=>callback(event)));}
}
const event=(key,action)=>({key,action,prevented:0,stopped:0,preventDefault(){this.prevented++;},stopPropagation(){this.stopped++;}});
class AppDouble {
    static get defaultOptions(){return {height:'auto'};}
    constructor(){this.calls=active;this.calls.construct++;this.options=this.constructor.defaultOptions;}
    render(){this.calls.render++;this.renderTask=Promise.resolve(this.getData()).then(data=>{this.data=data;this.html=template(data);this.element??=new Events();this.activateListeners(this.element);});return this;}
    activateListeners(){}
    async close(...args){this.calls.close++;this.calls.closeArguments.push(args);this.calls.onBaseClose?.(this);await Promise.resolve();if(this.calls.closeError)throw this.calls.closeError;return {approved:true};}
}
const appDescriptor=Object.getOwnPropertyDescriptor(globalThis,'Application');
Object.defineProperty(globalThis,'Application',{value:AppDouble,writable:true,configurable:true});
const {FeatureAcquisitionReview}=await import('../src/module/apps/feature-acquisition-review.js');
if(appDescriptor)Object.defineProperty(globalThis,'Application',appDescriptor);else delete globalThis.Application;
async function services(run,translations={}){
    const keys=['game','foundry','ui','Hooks','fromUuid','fetch','Actor','Item','Document','CONFIG'];
    const descriptors=Object.fromEntries(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
    const prior=active;const calls={construct:0,render:0,close:0,localize:0,forbidden:0,closeArguments:[]};active=calls;
    const denied=()=>{calls.forbidden++;throw Error('Unexpected live service');};
    const trap=new Proxy(denied,{get:denied,apply:denied,construct:denied});
    const game={i18n:{localize(key){calls.localize++;return Object.hasOwn(translations,key)?translations[key]:key.split('.').reduce((v,k)=>v?.[k],locale)??key;}}};
    for(const key of ['actors','items','packs','settings','user','permissions','system'])Object.defineProperty(game,key,{get:denied});
    for(const key of keys)Object.defineProperty(globalThis,key,{value:key==='game'?game:trap,writable:true,configurable:true});
    try{await run(calls);assert.equal(calls.forbidden,0);}finally{active=prior;for(const key of keys){if(descriptors[key])Object.defineProperty(globalThis,key,descriptors[key]);else delete globalThis[key];}}
}
async function open(input){const app=new FeatureAcquisitionReview(input);assert.equal(app.render(true),app);await app.renderTask;return app;}
const count=(html,pattern)=>[...html.matchAll(pattern)].length;
const noVerdict=value=>{for(const key of ['approved','approval','confirmed','canAcquire','canApply','authorized','allowed','plan','updates','replacement'])assert.equal(Object.hasOwn(value,key),false,key);};

test('ordinary construction only captures the accepted inspector, without rendering, activation or live services',()=>services(async calls=>{
    const input=freeze(request()),before=hash(input);inspect(input);const diagnosticLocalizations=calls.localize;calls.localize=0;const app=new FeatureAcquisitionReview(input);
    assert.equal(calls.construct,1);assert.equal(calls.render,0);assert.equal(calls.localize,diagnosticLocalizations);assert.equal(hash(input),before);assert.equal(app.options.template,'systems/ptu/static/templates/apps/feature-acquisition-review.hbs');noVerdict(app);
}));
for(const [a,b] of [[0,1],[1,0]])test(`real inspector and rendered dialog retain owned ${a}/incoming ${b} alternate attribution`,()=>services(async()=>{
    const source=owned(a),input=freeze(request({owned:[source],incoming:[pack(b)],actor:actor(2,[source])})),before=hash(input),expected=inspect(input),app=await open(input),data=app.getData();
    assert.equal(data.candidates[0].versionLabel,expected.candidates[0].attribution.selectedVersion.label);assert.equal(data.candidates[0].sourceLabel,expected.candidates[0].attribution.source.edition);assert.equal(JSON.parse(data.candidates[0].ownedComparisons[0].relationship).status,'alternate-versions');
    for(const identity of [source.uuid,pack(b).uuid,bundle.mappings[a].version.id,bundle.mappings[b].version.id])assert.ok(app.html.includes(identity));assert.match(app.html,/Evidenced alternate versions/);assert.equal(hash(input),before);noVerdict(data);
}));
test('separate repeated/ranked/custom occurrences and all incoming/owned pairs render without collapsing',()=>services(async()=>{
    const source=owned(),input=freeze(request({owned:[source,source,owned(1,2)],incoming:[pack(),pack(1),pack()]})),before=hash(input),app=await open(input),data=app.getData();
    assert.equal(data.owned.length,3);assert.equal(data.candidates.length,3);assert.deepEqual(data.candidates.map(x=>x.index),[0,1,2]);assert.equal(count(app.html,/class="candidate-occurrence"/g),3);assert.equal(count(app.html,/class="owned-occurrence"/g),3);assert.equal(count(app.html,/data-owned-comparison=/g),9);assert.equal(count(app.html,/data-incoming-pair=/g),3);assert.equal(JSON.parse(data.owned[0].snapshot).flags.user.choice,'choice-1');assert.equal(JSON.parse(data.owned[2].snapshot).system.custom.uses,2);assert.match(app.html,/Same-version occurrences/);assert.equal(hash(input),before);
}));
test('same-name unrelated and renamed alternate versions keep evidenced identities',()=>services(async()=>{
    const mappings=clone(bundle.mappings);mappings[1].canonical={id:'synthetic-unrelated-benefit',evidence:'Synthetic test control only'};const source=owned(),candidate=pack(1);candidate.name=source.name;
    let app=await open(request({owned:[source],incoming:[candidate],registry:createRuleVersionRegistry(mappings)}));assert.match(app.html,/Evidenced unrelated benefits/);
    source.name='Renamed source';candidate.name='Translated choice';app=await open(request({owned:[source],incoming:[candidate]}));assert.match(app.html,/Evidenced alternate versions/);assert.match(app.html,/Translated choice/);
}));
for(const mode of ['no-mapping','missing','malformed','null-canonical','conflicting'])test(`uncertain ${mode} mapping is visible and never labeled unrelated or safe`,()=>services(async()=>{
    const input=request({owned:[owned()],incoming:[pack(1)]});
    if(mode==='no-mapping')delete input.registry;if(mode==='missing')input.registry=createRuleVersionRegistry([]);if(mode==='malformed')input.registry={};if(mode==='conflicting')input.versions=bundle.mappings;
    if(mode==='null-canonical'){delete input.registry;input.versions=clone(bundle.mappings);input.versions.forEach(x=>x.canonical=null);}
    const app=await open(input);assert.equal(JSON.parse(app.getData().candidates[0].ownedComparisons[0].relationship).status,'unresolved');assert.match(app.html,/Unresolved attribution or relationship/);assert.doesNotMatch(app.html,/Evidenced unrelated benefits|Evidenced alternate versions/);assert.match(app.html,/does not verify current world membership/);
}));
for(const input of [undefined,null,[],true,'input',()=>{},new Date()])test(`malformed request ${typeof input} renders explicit unavailability without coercion`,()=>services(async()=>{
    const app=await open(input),data=app.getData();assert.equal(data.candidates.length,0);assert.match(app.html,/Unavailable or unestablished/);assert.ok(data.contextIssues.length);noVerdict(data);
}));
for(const key of ['owned','incoming','actor','registry','versions','mechanicChoices','references'])test(`request ${key} accessor is never invoked through construction/render/close`,()=>services(async()=>{
    let gets=0;const input=request();Object.defineProperty(input,key,{enumerable:true,get(){gets++;throw Error('Getter called');}});const app=await open(input);await app.close();assert.equal(gets,0);assert.match(app.html,/request-field-not-data/);
}));
for(const key of ['name','uuid','system','toJSON','toObject'])test(`malformed entry ${key} accessor is never invoked and its index remains visible`,()=>services(async()=>{
    let gets=0;const candidate=pack(1);Object.defineProperty(candidate,key,{enumerable:true,get(){gets++;throw Error('Getter called');}});const app=await open(request({incoming:[pack(),candidate,pack()]}));assert.equal(gets,0);assert.equal(app.getData().candidates.length,3);assert.match(app.html,/data-candidate-index="1"/);assert.match(app.html,/non-data-property/);
}));
test('nontext names/identities/requirements do not invoke conversion or fabricate IDs',()=>services(async()=>{
    let conversions=0;const bad={toString(){conversions++;throw Error('Coerced');},valueOf(){conversions++;throw Error('Coerced');}};
    const candidate=pack();candidate.name=bad;candidate.uuid=bad;candidate.system.prerequisites=[bad];const app=await open(request({incoming:[candidate]}));assert.equal(conversions,0);assert.match(app.html,/item-name-invalid|not-serialized-data/);assert.equal(app.getData().candidates[0].identity[0].value,'Unavailable or unestablished');
}));
test('known empty, missing and invalid collections are distinct and valid actor facts remain',()=>services(async()=>{
    let app=await open(request({owned:[],incoming:[]}));assert.equal(app.getData().collections[0].count,'0');assert.equal(app.getData().collections[0].status,'Complete supplied data');
    const input=request({incoming:[null,pack()],actor:{system:{level:{current:4},skills:{focus:{value:{total:3}}}},items:[null]}});delete input.owned;app=await open(input);const data=app.getData();assert.equal(data.collections[0].count,'null');assert.match(data.collections[0].status,/Unavailable/);assert.match(data.collections[1].status,/invalid entries/);assert.equal(data.candidates.length,2);assert.equal(JSON.parse(data.actor.snapshot).system.level.current,4);assert.match(app.html,/actor-item-snapshot-required/);assert.match(app.html,/collection-input-missing/);
}));
test('each selected version renders its actual unmet and custom/unknown prerequisites',()=>services(async()=>{
    const first=pack(),second=pack(1);first.system.prerequisites=['Expert General Education','my <custom> condition'];second.system.prerequisites=['Level 20','GM Permission'];
    const input=freeze(request({incoming:[first,second]})),expected=inspect(input),app=await open(input),data=app.getData();
    for(let i=0;i<2;i++){assert.equal(data.candidates[i].unmet.length,expected.candidates[i].prerequisites.report.unmet.length);assert.equal(data.candidates[i].unknown.length,expected.candidates[i].prerequisites.report.unverifiable.length);assert.equal(JSON.parse(data.candidates[i].prerequisiteEvidence).report.identity.uuid,input.incoming[i].uuid);}
    assert.match(app.html,/Known unmet requirements/);assert.match(app.html,/Unknown or custom conditions/);assert.match(app.html,/my &lt;custom&gt; condition/);assert.match(app.html,/Prerequisite warnings are advisory/);assert.doesNotMatch(app.html,/<button[^>]*disabled|<input|<form/);
}));
test('incoming Features never become assumed prerequisite grants',()=>services(async()=>{
    const candidate=pack(1);candidate.system.prerequisites=[pack().uuid];const app=await open(request({incoming:[pack(),candidate],actor:actor(2,[])}));assert.equal(JSON.parse(app.getData().candidates[1].prerequisiteEvidence).report.unmet[0].kind,'item');
}));
test('all supplied labels/source/citations/IDs/diagnostics/issues render as escaped text',()=>services(async()=>{
    const attack='<img src=x onerror="alert(1)"><script>attack</script>',mappings=clone(bundle.mappings);mappings[1].source.edition=attack;mappings[1].source.citation=attack;mappings[1].version.label=attack;mappings[1].version.id=attack;mappings[1].source.id=attack;mappings[1].canonical.id=attack;
    const candidate=pack(1);candidate.name=attack;candidate.flags.ptu.selectedVersion=attack;candidate._stats={compendiumSource:attack};candidate.flags.core={sourceId:attack};candidate.system.prerequisites=[attack];const input=request({incoming:[candidate],registry:createRuleVersionRegistry(mappings)});Object.defineProperty(input,attack,{value:'unknown',enumerable:true});
    let app=await open(input);assert.doesNotMatch(app.html,/<img|<script|onerror="/);assert.match(app.html,/&lt;img/);assert.equal(JSON.parse(app.getData().candidates[0].source).citation,attack);
    candidate.uuid=attack;candidate._id=attack;app=await open(request({incoming:[candidate]}));assert.doesNotMatch(app.html,/<img|<script/);assert.equal(app.getData().candidates[0].identity[0].value,attack);assert.equal(app.getData().candidates[0].identity[1].value,attack);
}));
test('localization text is escaped and nontext localization is never coerced',()=>services(async()=>{
    const app=await open(request());assert.doesNotMatch(app.html,/<script/);assert.match(app.html,/&lt;script/);assert.equal(app.getData().labels.advisory,'PTU.FeatureAcquisitionReview.advisory');
},{'PTU.FeatureAcquisitionReview.limits':'<script>localized</script>','PTU.FeatureAcquisitionReview.advisory':{toString(){throw Error('No coercion');}}}));
test('raw modern/legacy and stored identities survive unchanged, including exact aliases',()=>services(async()=>{
    const source=owned();source._stats.compendiumSource=source._stats.compendiumSource.replace('.Item.','.');source.flags.core={sourceId:'Compendium.ptu.feats.ta6bKIiHCuccjTqU'};const candidate=pack(1);candidate.uuid=candidate.uuid.replace('.Item.','.');const app=await open(request({owned:[source],incoming:[candidate]})),data=app.getData();assert.deepEqual(JSON.parse(data.owned[0].snapshot),source);assert.deepEqual(JSON.parse(data.candidates[0].snapshot),candidate);assert.equal(data.owned[0].identity[2].value,source._stats.compendiumSource);assert.equal(data.owned[0].identity[3].value,source.flags.core.sourceId);
}));
test('repeated rendering returns detached views of the original captured inspection',()=>services(async calls=>{
    const input=request({owned:[owned()],incoming:[pack(1)]}),before=hash(input),app=await open(input),first=app.html;const data=app.getData();data.candidates[0].identity[0].value='changed';input.incoming[0].name='changed after construction';
    app.render(true);await app.renderTask;assert.equal(app.html,first);assert.equal(calls.render,2);assert.notEqual(hash(input),before);assert.notEqual(app.getData().candidates[0].name,'changed after construction');
}));
for(const action of ['close','cancel','escape','header','repeated'])test(`${action} dismissal returns no consent/result, preserves frozen input and closes once`,()=>services(async calls=>{
    const input=freeze(request({owned:[owned()],incoming:[pack(1)]})),before=hash(input),app=await open(input);let results;
    if(action==='header')results=[await app.close()];else if(action==='escape')results=await app.element.fire('keydown.ptuFeatureAcquisitionReview',event('Escape'));
    else if(action==='repeated')results=await Promise.all([app.close(),app._onDismiss(event(null,'cancel')),app._onReviewKeyDown(event('Escape')),app.close()]);
    else results=await app.element.fire('click.ptuFeatureAcquisitionReview',event(null,action));
    assert.ok(results.every(x=>x===undefined));assert.equal(calls.close,1);assert.deepEqual(calls.closeArguments,[[]]);assert.equal(await app.close(),undefined);assert.equal(calls.close,1);assert.equal(hash(input),before);const renders=calls.render;assert.equal(app.render(true),app);assert.equal(calls.render,renders);noVerdict(app);assert.equal(count(app.html,/<button\b/g),2);assert.match(app.html,/data-action="close"/);assert.match(app.html,/data-action="cancel"/);
}));
test('listener reactivation does not duplicate dismissal events; other keys have no decision semantics',()=>services(async calls=>{
    const app=await open(request());app.activateListeners(app.element);app.activateListeners(app.element);assert.equal(app.element.handlers.size,2);const enter=event('Enter');assert.deepEqual(await app.element.fire('keydown.ptuFeatureAcquisitionReview',enter),[undefined]);assert.equal(calls.close,0);assert.equal(enter.prevented,0);const escape=event('Escape');assert.deepEqual(await app.element.fire('keydown.ptuFeatureAcquisitionReview',escape),[undefined]);assert.equal(escape.prevented,1);assert.equal(escape.stopped,1);assert.equal(calls.close,1);
}));
test('independently constructed views share neither captured state nor dismissal',()=>services(async calls=>{
    const first=await open(request()),second=await open(request({incoming:[pack(1),pack(1)]}));await first.close();assert.equal(second.getData().candidates.length,2);second.render(true);await second.renderTask;assert.equal(calls.close,1);await second.close();assert.equal(calls.close,2);
}));

test('a reentrant close event cannot start a second base close or return its result',()=>services(async calls=>{
    const input=freeze(request()),before=hash(input),app=await open(input);let nested;
    calls.onBaseClose=value=>{delete calls.onBaseClose;nested=value.close();};
    assert.equal(await app.close(),undefined);assert.equal(await nested,undefined);assert.equal(calls.close,1);assert.equal(hash(input),before);
}));

test('malformed nontext source labels retain raw evidence and advisory uncertainty',()=>services(async()=>{
    const candidate=pack(1);candidate.system.source={value:{custom:'<source>'}};candidate.system.prerequisites=[{custom:'<condition>'}];
    let app=await open(request({incoming:[candidate]}));assert.ok(JSON.parse(app.getData().candidates[0].prerequisiteEvidence).issues.includes('source-label-not-text'));assert.doesNotMatch(app.html,/<source>|<condition>/);
    candidate.id=null;app=await open(request({incoming:[candidate]}));const data=app.getData();assert.equal(data.candidates[0].identity.at(-1).value,'Unavailable or unestablished');assert.equal(JSON.parse(data.candidates[0].snapshot).id,null);assert.match(app.html,/item-id-uuid-conflict/);
}));
test('unknown request callbacks are reported without reaching the Application constructor',()=>services(async()=>{
    let calls=0;const input=request({render(){calls++;},close(){calls++;},onApprove(){calls++;}});const app=await open(input);await app.close();assert.equal(calls,0);assert.match(app.html,/unknown-option/);assert.equal(Object.hasOwn(app.options,'onApprove'),false);
}));
test('a supplied own id and _id are both displayed without choosing a substitute',()=>services(async()=>{
    const candidate=pack();candidate.id=candidate._id;const app=await open(request({incoming:[candidate]})),data=app.getData();assert.equal(data.candidates[0].identity[1].value,candidate._id);assert.equal(data.candidates[0].identity.at(-1).value,candidate.id);assert.equal(data.candidates[0].sourceStatus,bundle.mappings[0].source.status);assert.ok(app.html.includes(bundle.mappings[0].source.status));
}));

test('repeated rendering and dismissal preserve frozen inputs and candidate-specific warnings',()=>services(async()=>{
    const input=freeze(request({owned:[owned()],incoming:[pack(1),pack(1)]})),before=hash(input),app=await open(input),html=app.html;
    for(let i=0;i<3;i++){app.render(true);await app.renderTask;assert.equal(app.html,html);noVerdict(app.getData());}await app.close();assert.equal(hash(input),before);
}));
for(const mode of ['sparse','slot-accessor'])test(`${mode} collection remains unavailable without reading array slots`,()=>services(async()=>{
    let gets=0;const incoming=mode==='sparse'?new Array(5):[pack()];if(mode==='slot-accessor')Object.defineProperty(incoming,'0',{enumerable:true,get(){gets++;throw Error('Slot getter');}});
    const app=await open(request({incoming}));assert.equal(gets,0);assert.equal(app.getData().candidates.length,0);assert.equal(app.getData().collections[1].count,'null');assert.match(app.html,/Unavailable or unestablished/);assert.match(app.html,/sparse-array|non-data-property/);
}));
test('a base lifecycle error never becomes approval or retries the domain action',()=>services(async calls=>{
    const input=freeze(request()),before=hash(input),app=await open(input);calls.closeError=Error('Synthetic UI close failure');await assert.rejects(app.close(),/Synthetic UI close failure/);await assert.rejects(app.close(),/Synthetic UI close failure/);assert.equal(calls.close,1);assert.equal(hash(input),before);noVerdict(app);
}));
