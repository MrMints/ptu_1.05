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

const locale=json('static/lang/en.json'),template=Handlebars.create().compile(read('static/templates/apps/feature-acquisition-review.hbs'));
let active,importWork=0;
class Events {
    handlers=new Map();constructor(root=this,selector='root'){this.root=root;this.selector=selector;}
    find(selector){return new Events(this.root,selector);}off(name){this.root.handlers.delete(`${this.selector}:${name}`);return this;}
    on(name,callback){this.root.handlers.set(`${this.selector}:${name}`,callback);return this;}
    fire(name,event){return Promise.all([...this.root.handlers].filter(([key])=>key.endsWith(`:${name}`)).map(([,fn])=>fn(event)));}
}
class AppDouble {
    static get defaultOptions(){return {};}
    constructor(){if(!active){importWork++;throw Error('No import-time UI');}this.calls=active;this.calls.construct++;this.options=this.constructor.defaultOptions;}
    render(){this.calls.render++;this.calls.events.push('render');this.renderTask=Promise.resolve(this.getData()).then(data=>{this.html=template(data);this.element??=new Events();this.activateListeners(this.element);});return this;}
    activateListeners(){}
    async close(){this.calls.close++;await Promise.resolve();return {approved:true};}
}
// Isolate only ESM linkage to Application-bound classes: the launcher function,
// accepted dialog/class/template and inspector bodies execute unchanged. This
// also keeps the existing dialog suite's separate Application double untouched.
const importGlobals=['Application','game','Hooks','ui','fetch','fromUuid','Actor','Item','Document','foundry','CONFIG'];
const priorImport=Object.fromEntries(importGlobals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
const importDenied=()=>{importWork++;throw Error('No import-time service');};const importTrap=new Proxy(importDenied,{get:importDenied,apply:importDenied,construct:importDenied});
for(const key of importGlobals)Object.defineProperty(globalThis,key,{value:importTrap,writable:true,configurable:true});
Object.defineProperty(globalThis,'Application',{value:AppDouble,writable:true,configurable:true});
const dialogUrl=new URL('../src/module/apps/feature-acquisition-review.js?launcher-service-double',import.meta.url).href;
const skillsUrl=new URL('../src/util/skills.js',import.meta.url).href;
const launcherSource=read('src/module/apps/feature-acquisition-review-launcher.js');
const linked=launcherSource.replace("'./feature-acquisition-review.js'",JSON.stringify(dialogUrl)).replace("'../../util/skills.js'",JSON.stringify(skillsUrl));
const {launchFeatureAcquisitionReview:launch}=await import(`data:text/javascript;base64,${Buffer.from(linked).toString('base64')}`);
for(const key of importGlobals){if(priorImport[key])Object.defineProperty(globalThis,key,priorImport[key]);else delete globalThis[key];}

async function services(run){
    const keys=['game','foundry','ui','Hooks','fromUuid','fetch','Actor','Item','Document','CONFIG'];
    const saved=Object.fromEntries(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),previous=active;
    const calls={construct:0,render:0,close:0,forbidden:0,writes:0,serialize:0,content:0,membership:0,events:[],user:{id:'explicit-current-user'},getUser:0};active=calls;
    const denied=()=>{calls.forbidden++;throw Error('Forbidden implicit service');};const trap=new Proxy(denied,{get:denied,apply:denied,construct:denied});
    const game={i18n:{localize:key=>key.split('.').reduce((value,key)=>value?.[key],locale)??key,lang:'en'}};
    Object.defineProperty(game,'user',{get(){calls.getUser++;if(calls.userError)throw Error('Unreadable user');return calls.user;}});
    for(const key of ['actors','items','packs','settings','permissions','system'])Object.defineProperty(game,key,{get:denied});
    for(const key of keys)Object.defineProperty(globalThis,key,{value:key==='game'?game:trap,writable:true,configurable:true});
    try{await run(calls);assert.equal(calls.forbidden,0);assert.equal(calls.writes,0);}finally{active=previous;for(const key of keys){if(saved[key])Object.defineProperty(globalThis,key,saved[key]);else delete globalThis[key];}}
}
function document(kind,raw,meta={},label=kind){
    const state={raw,prepared:raw.system,permission:true,visible:true,meta:{id:raw._id,uuid:`${kind}.${raw._id}`,pack:undefined,parent:null,isTemporary:false,...meta},label};
    const doc={state,documentName:kind,
        testUserPermission(user,level){active.events.push(`access:${label}`);assert.equal(user,active.user);assert.equal(level,'OBSERVER');if(state.permissionError)throw Error('Hidden permission detail');if(state.onAccess)return state.onAccess();return state.permission;},
        toObject(){active.serialize++;active.events.push(`serialize:${label}`);if(state.serializationError)throw Error('Hidden snapshot detail');if(state.onSerialize)return state.onSerialize();return clone(state.raw);}};
    for(const key of ['id','uuid','pack','parent','isTemporary'])Object.defineProperty(doc,key,{get(){return state.meta[key];}});
    Object.defineProperty(doc,'visible',{configurable:true,get(){if(state.visibilityError)throw Error('Hidden visibility detail');return state.visible;}});
    for(const key of ['type','name','system'])Object.defineProperty(doc,key,{get(){active.content++;active.events.push(`content:${label}:${key}`);if(key==='system'&&state.systemError)throw Error('Unreadable current facts');return key==='system'?state.prepared:state.raw[key];}});
    Object.defineProperty(doc,'isOwner',{get(){return false;}});
    for(const key of ['update','updateSource','createEmbeddedDocuments','deleteEmbeddedDocuments','delete','reset','prepareData','getRollData'])doc[key]=()=>{active.writes++;throw Error('No mutation/evaluation interface');};
    return doc;
}
function fixture(){
    const a=document('Actor',{_id:id(400),type:'character',name:'Explicit actor',system:{level:{current:1,exp:0},skills:{generalEd:{value:{total:1},custom:'keep'},focus:{value:{total:1}}},custom:{keep:true}},items:[],flags:{user:{keep:true}}},{},'actor');
    a.state.prepared={level:{current:8},skills:{generalEd:{value:{total:5}},focus:{value:{total:3}}}};
    const sources=[owned(0,1),owned(0,2)],members=sources.map((item,index)=>{const raw=clone(item);delete raw.uuid;return document('Item',raw,{uuid:item.uuid,parent:a},`owned-${index}`);});
    members.push(document('Item',{_id:id(700),type:'edge',name:'Same label',system:{custom:'retained'},flags:{user:{custom:'edge'}}},{uuid:`Actor.${id(400)}.Item.${id(700)}`,parent:a},'owned-edge'));
    members.push(document('Item',{_id:id(701),type:'custom',name:'Custom',system:{custom:{preserved:true}},flags:{}},{uuid:`Actor.${id(400)}.Item.${id(701)}`,parent:a},'owned-custom'));
    a.state.members=members;
    Object.defineProperty(a,'items',{get(){active.membership++;active.events.push('membership');if(a.state.membershipError)throw Error('Hidden membership detail');return a.state.membershipOverride??{get contents(){return a.state.members;}};}});
    const incoming=[0,1].map(index=>document('Item',clone(bundle.items[index].item),{uuid:bundle.mappings[index].documentUuid,pack:'ptu.feats'},`incoming-${index}`));
    const collection={collection:'ptu.feats',testUserPermission(user,level){active.events.push('access:pack');assert.equal(user,active.user);assert.equal(level,'OBSERVER');return collection.permission;},permission:true,getDocuments(){active.forbidden++;throw Error('No pack load');}};
    return {actor:a,incoming,sourceCollections:[collection],registry,documents:[a,...members,...incoming]};
}
const input=fixture=>Object.fromEntries(['actor','incoming','sourceCollections','registry','versions','references','mechanicChoices'].filter(key=>Object.hasOwn(fixture,key)).map(key=>[key,fixture[key]]));
const rawHash=fixture=>hash(fixture.documents.map(doc=>({raw:doc.state.raw,prepared:doc.state.prepared,meta:{id:doc.id,uuid:doc.uuid,pack:doc.pack,isTemporary:doc.isTemporary}})));
function freezeSources(fixture){for(const doc of fixture.documents){freeze(doc.state.raw);freeze(doc.state.prepared);}return fixture;}
async function opened(value){const result=launch(value);assert.equal(result.status,'review-requested',JSON.stringify(result.issues));await result.review.renderTask;return result;}
function rejected(value,reason){const result=launch(value);assert.equal(result.status,'not-opened');assert.match(JSON.stringify(result.issues),reason);assert.equal(Object.hasOwn(result,'review'),false);return result;}
const noConsent=value=>{for(const key of ['approved','approval','allowed','authorized','canAcquire','canApply','plan','updates'])assert.equal(Object.hasOwn(value,key),false);};
const evt=key=>({key,preventDefault(){},stopPropagation(){}});

test('module linkage defines an explicit launcher without automatic construction or work',()=>services(async calls=>{
    assert.equal(typeof launch,'function');assert.equal(importWork,0);assert.equal(calls.construct,0);assert.equal(calls.render,0);assert.equal(calls.getUser,0);assert.equal(calls.serialize,0);
}));
test('actual launcher opens the accepted class/template/inspector with complete separate membership and current facts',()=>services(async calls=>{
    const f=freezeSources(fixture()),before=rawHash(f),result=await opened(input(f)),data=result.review.getData(),actorSnapshot=JSON.parse(data.actor.snapshot);
    assert.equal(calls.construct,1);assert.equal(calls.render,1);assert.equal(data.owned.length,2);assert.equal(actorSnapshot.items.length,4);assert.deepEqual(actorSnapshot.items.map(x=>x.type),['feat','feat','edge','custom']);assert.equal(data.candidates.length,2);
    assert.equal(actorSnapshot.system.level.current,8);assert.equal(actorSnapshot.system.skills.generalEd.value.total,5);assert.equal(actorSnapshot.system.skills.generalEd.custom,'keep');assert.equal(actorSnapshot.system.custom.keep,true);assert.equal(f.actor.state.raw.system.level.current,1);assert.equal(rawHash(f),before);assert.match(result.review.html,/Evidenced alternate versions/);noConsent(result);noConsent(data);
    const firstCapture=calls.events.findIndex(x=>x.startsWith('content:')||x.startsWith('serialize:'));
    for(const name of ['actor','incoming-0','incoming-1','owned-0','owned-1','owned-edge','owned-custom'])assert.ok(calls.events.indexOf(`access:${name}`)<firstCapture,name);
}));
for(const target of ['actor','incoming','owned','non-feature-owned'])for(const mode of ['denied','missing','throwing','uncertain','invisible'])test(`${target} ${mode} access stops before serialization or content reads`,()=>services(async calls=>{
    const f=fixture(),doc=target==='actor'?f.actor:target==='incoming'?f.incoming[1]:f.actor.state.members[target==='owned'?1:3];
    if(mode==='denied')doc.state.permission=false;if(mode==='missing')doc.testUserPermission=undefined;if(mode==='throwing')doc.state.permissionError=true;if(mode==='uncertain')doc.state.permission=undefined;if(mode==='invisible')doc.state.visible=false;
    const result=rejected(input(f),/read-permission|read-access|visibility/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);assert.equal(calls.render,0);assert.equal(calls.construct,0);if(['actor','incoming'].includes(target))assert.equal(calls.membership,0);assert.ok(result.issues[0].path.length);
}));
for(const mode of ['missing-user','throwing-user','throwing-visibility'])test(`${mode} never falls back to ownership or document possession`,()=>services(async calls=>{
    const f=fixture();if(mode==='missing-user')calls.user=null;if(mode==='throwing-user')calls.userError=true;if(mode==='throwing-visibility')f.actor.state.visibilityError=true;
    rejected(input(f),/current-user|read-access/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);assert.equal(calls.render,0);
}));
for(const mode of ['missing','denied','throwing','duplicate'])test(`${mode} explicit compendium context stops before source capture`,()=>services(async calls=>{
    const f=fixture();if(mode==='missing')delete f.sourceCollections;if(mode==='denied')f.sourceCollections[0].permission=false;if(mode==='throwing')f.sourceCollections[0].testUserPermission=()=>{throw Error('Hidden pack detail');};if(mode==='duplicate')f.sourceCollections.push(f.sourceCollections[0]);
    rejected(input(f),/source-collection|read-access/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);assert.equal(calls.membership,0);assert.equal(calls.render,0);
}));
test('incoming source-parent read denial precedes target actor content',()=>services(async calls=>{
    const f=fixture(),parent=document('Actor',{_id:id(888),type:'character',system:{}},{},'source-parent');parent.state.permission=false;f.incoming[0].state.meta.pack=undefined;f.incoming[0].state.meta.parent=parent;f.incoming[0].state.meta.uuid=`Actor.${id(888)}.Item.${f.incoming[0].id}`;
    const result=rejected(input(f),/read-permission/);assert.deepEqual(result.issues[0].path,['incoming','0','parent']);assert.equal(calls.serialize,0);assert.equal(calls.membership,0);assert.equal(calls.content,0);
}));
test('source ownership is not invented as a requirement or a read-access fallback',()=>services(async()=>{
    const f=fixture();assert.equal(f.actor.isOwner,false);const result=await opened(input(f));assert.equal(result.review.getData().candidates.length,2);await result.review.close();
}));
test('prerequisites use mixed owned membership and never count incoming candidates as grants',()=>services(async()=>{
    const f=fixture(),candidate=f.incoming[1];candidate.state.raw.system.prerequisites=[f.actor.state.members[2].uuid,f.incoming[1].uuid,'Level 5','Expert General Education'];const result=await opened(input(f));
    const report=JSON.parse(result.review.getData().candidates[1].prerequisiteEvidence).report;assert.equal(report.satisfied.length,3);assert.equal(report.unmet.length,1);assert.equal(report.unmet[0].requiredIdentity,f.incoming[1].uuid);
}));
test('prepared missing/invalid facts remain unknown rather than reusing raw totals or guessing ranks',()=>services(async()=>{
    const f=fixture();f.actor.state.prepared={skills:{generalEd:{value:{total:7}},focus:{value:{total:null}}}};f.incoming[0].state.raw.system.prerequisites=['Level 2','Novice Focus','Novice General Education'];const result=await opened(input(f)),data=result.review.getData(),a=JSON.parse(data.actor.snapshot),report=JSON.parse(data.candidates[0].prerequisiteEvidence).report;
    assert.equal(Object.hasOwn(a.system.level,'current'),false);assert.equal(a.system.skills.generalEd.value.total,7);assert.equal(a.system.skills.focus.value.total,null);assert.equal(report.unverifiable.length,3);assert.equal(report.unmet.length,0);
}));
test('all stable skill keys retain their prepared scalar values, never display aliases',()=>services(async()=>{
    const f=fixture();f.actor.state.prepared={level:{current:'8'},skills:Object.fromEntries(['acrobatics','athletics','charm','combat','command','generalEd','medicineEd','occultEd','pokemonEd','techEd','focus','guile','intimidate','intuition','perception','stealth','survival'].map(key=>[key,{value:{total:'3'}}]))};
    const result=await opened(input(f)),a=JSON.parse(result.review.getData().actor.snapshot);assert.equal(Object.keys(a.system.skills).length,17);assert.equal(a.system.skills.generalEd.value.total,'3');assert.equal(a.system.level.current,'8');assert.equal(Object.hasOwn(a.system.skills,'Education'),false);
}));
for(const mode of ['throwing-current','nonfinite-current','throwing-membership','missing-membership','malformed-member'])test(`${mode} yields an explicit capture failure without a partial view`,()=>services(async calls=>{
    const f=fixture();if(mode==='throwing-current')f.actor.state.systemError=true;if(mode==='nonfinite-current')f.actor.state.prepared.level.current=NaN;if(mode==='throwing-membership')f.actor.state.membershipError=true;if(mode==='missing-membership')f.actor.state.membershipOverride={};if(mode==='malformed-member')f.actor.state.members.push(null);
    rejected(input(f),/evaluator|serialized-data|membership|dense-array|read-permission/);assert.equal(calls.render,0);assert.equal(calls.construct,0);
}));
test('modern/legacy provenance, stored choices, distinct repeats and custom state survive capture',()=>services(async()=>{
    const f=fixture();f.actor.state.members[0].state.raw._stats.compendiumSource=f.actor.state.members[0].state.raw._stats.compendiumSource.replace('.Item.','.');f.actor.state.members[0].state.raw.flags.core={sourceId:'Compendium.ptu.feats.ta6bKIiHCuccjTqU'};
    f.incoming.push(f.incoming[1]);const before=rawHash(f),result=await opened(input(f)),data=result.review.getData();assert.equal(data.candidates.length,3);assert.equal(data.candidateComparisons.length,3);assert.equal(data.candidates[0].ownedComparisons.length,2);
    const first=JSON.parse(data.owned[0].snapshot);assert.equal(first._stats.compendiumSource,f.actor.state.members[0].state.raw._stats.compendiumSource);assert.equal(first.flags.core.sourceId,'Compendium.ptu.feats.ta6bKIiHCuccjTqU');assert.equal(first.flags.user.choice,'choice-1');assert.equal(JSON.parse(data.owned[1].snapshot).system.custom.uses,2);assert.equal(first.uuid,f.actor.state.members[0].uuid);assert.equal(first.id,first._id);assert.equal(rawHash(f),before);
}));
test('world Item provenance uses its actual identity without searching or redirecting it',()=>services(async()=>{
    const f=fixture(),raw=clone(f.incoming[1].state.raw);raw._id=id(999);raw._stats={compendiumSource:bundle.mappings[1].documentUuid};raw.flags.core={sourceId:bundle.mappings[0].documentUuid};f.incoming=[document('Item',raw,{},'world-item')];delete f.sourceCollections;
    const result=await opened(input(f)),data=result.review.getData();assert.equal(data.candidates[0].identity[0].value,`Item.${id(999)}`);assert.equal(JSON.parse(data.candidates[0].ownedComparisons[0].relationship).status,'alternate-versions');
}));
for(const mode of ['temporary','missing-id','missing-uuid','unsupported-uuid','conflicting-pack','owned-parent'])test(`${mode} identity remains a failure, never a manufactured counterpart`,()=>services(async calls=>{
    const f=fixture(),doc=mode==='owned-parent'?f.actor.state.members[0]:f.incoming[0];if(mode==='temporary')doc.state.meta.isTemporary=true;if(mode==='missing-id')doc.state.meta.id=null;if(mode==='missing-uuid')doc.state.meta.uuid=null;if(mode==='unsupported-uuid')doc.state.meta.uuid=`Scene.${id(1)}.Token.${id(2)}.Actor.${id(400)}.Item.${doc.id}`;if(mode==='conflicting-pack')doc.state.meta.uuid=`Compendium.ptu.other.Item.${doc.id}`;if(mode==='owned-parent')doc.state.meta.parent=null;
    rejected(input(f),/identity|owned-item-context/);assert.equal(calls.render,0);assert.equal(calls.serialize,0);
}));
for(const mode of ['throwing','null','missing-id','conflicting-uuid','accessor','live-snapshot'])test(`${mode} serialized Item failure is positional and does not open a partial review`,()=>services(async calls=>{
    const f=fixture(),doc=f.actor.state.members[1];if(mode==='throwing')doc.state.serializationError=true;if(mode==='null')doc.state.onSerialize=()=>null;if(mode==='missing-id')delete doc.state.raw._id;if(mode==='conflicting-uuid')doc.state.raw.uuid=`Item.${id(777)}`;let gets=0;if(mode==='accessor')doc.state.onSerialize=()=>Object.defineProperty({...doc.state.raw},'name',{get(){gets++;throw Error('Getter');},enumerable:true});if(mode==='live-snapshot')doc.state.onSerialize=()=>({ ...doc.state.raw,toObject:'not a source field'});
    const result=rejected(input(f),/serialization|snapshot|data-property/);assert.equal(result.issues[0].path[0],'owned');assert.equal(result.issues[0].path[1],'1');assert.equal(gets,0);assert.equal(calls.render,0);assert.equal(calls.construct,0);assert.doesNotMatch(JSON.stringify(result),/Hidden snapshot detail/);
}));
for(const mode of ['registry','versions'])test(`explicit ${mode} mapping mode reaches the accepted inspector unchanged`,()=>services(async()=>{
    const f=fixture();if(mode==='versions'){delete f.registry;f.versions=bundle.mappings;}const result=await opened(input(f)),data=result.review.getData();assert.equal(data.mappingMode,mode==='registry'?'registry':'exact');assert.equal(JSON.parse(data.candidates[1].ownedComparisons[0].relationship).status,'alternate-versions');
}));
for(const value of [bundle.mappings,undefined,null,[]])test(`both mapping fields retain a conflict (${Array.isArray(value)?value.length:String(value)})`,()=>services(async()=>{
    const f=fixture();f.versions=value;const result=await opened(input(f)),data=result.review.getData();assert.equal(data.mappingMode,'conflicting');assert.equal(JSON.parse(data.candidates[1].ownedComparisons[0].relationship).status,'unresolved');
}));
test('a missing mapping input never loads a default or serializes documents',()=>services(async calls=>{
    const f=fixture();delete f.registry;rejected(input(f),/explicit-mappings-required/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);assert.equal(calls.render,0);
}));
for(const value of [null,{},undefined])test(`explicit invalid registry ${String(value)} remains unresolved without replacement`,()=>services(async()=>{
    const f=fixture();f.registry=value;const result=await opened(input(f));assert.equal(JSON.parse(result.review.getData().candidates[1].ownedComparisons[0].relationship).status,'unresolved');
}));
for(const field of ['actor','incoming','registry','versions','references','mechanicChoices','sourceCollections'])test(`${field} request accessor is not invoked`,()=>services(async calls=>{
    const f=fixture(),request=input(f);let gets=0;Object.defineProperty(request,field,{get(){gets++;throw Error('Getter');},enumerable:true});rejected(request,/request-field-not-data/);assert.equal(gets,0);assert.equal(calls.serialize,0);assert.equal(calls.render,0);
}));
test('nested mapping accessor and nonserialized choices fail before document reads',()=>services(async calls=>{
    const f=fixture(),request=input(f);let gets=0;request.registry=clone(registry);Object.defineProperty(request.registry,'aliases',{get(){gets++;throw Error('Getter');},enumerable:true});rejected(request,/data-property-required/);assert.equal(gets,0);request.registry=registry;request.mechanicChoices={custom(){throw Error('Never call');}};rejected(request,/serialized-data-required/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);
}));
test('unsafe incoming arrays and unknown app callbacks are rejected without implicit invocation',()=>services(async calls=>{
    const f=fixture(),request=input(f);request.incoming=new Array(1000000000);rejected(request,/dense-array-required/);let gets=0;request.incoming=[f.incoming[0]];Object.defineProperty(request.incoming,'0',{get(){gets++;throw Error('Getter');},enumerable:true});rejected(request,/data-property-required/);request.incoming=f.incoming;request.onApprove=()=>{gets++;};rejected(request,/unknown-launch-option/);assert.equal(gets,0);assert.equal(calls.serialize,0);assert.equal(calls.render,0);
}));
test('fresh explicit launches capture changes independently while earlier reviews retain their snapshot',()=>services(async()=>{
    const f=fixture(),first=await opened(input(f)),before=first.review.html;f.incoming[1].state.raw.name='Changed outside launcher';f.actor.state.prepared.level.current=20;const second=await opened(input(f));assert.notEqual(first.review,second.review);assert.equal(first.review.html,before);assert.notEqual(second.review.html,before);assert.equal(JSON.parse(first.review.getData().actor.snapshot).system.level.current,8);assert.equal(JSON.parse(second.review.getData().actor.snapshot).system.level.current,20);await first.review.close();assert.equal(await second.review.close(),undefined);
}));
for(const action of ['close','cancel','escape','header','repeated'])test(`${action} through the accepted dialog returns no consent and leaves sources frozen`,()=>services(async calls=>{
    const f=freezeSources(fixture()),before=rawHash(f),result=await opened(input(f)),review=result.review;let values;
    if(action==='escape')values=await review.element.fire('keydown.ptuFeatureAcquisitionReview',evt('Escape'));else if(action==='header')values=[await review.close()];else if(action==='repeated')values=await Promise.all([review.close(),review._onDismiss(evt()),review._onReviewKeyDown(evt('Escape')),review.close()]);else values=await review.element.fire('click.ptuFeatureAcquisitionReview',evt());
    assert.ok(values.every(value=>value===undefined));assert.equal(calls.close,1);assert.equal(rawHash(f),before);noConsent(result);noConsent(review.getData());
}));
test('membership changes during capture stop rendering instead of certifying a partial list',()=>services(async calls=>{
    const f=fixture();f.incoming[0].state.onSerialize=()=>{f.actor.state.members=f.actor.state.members.slice(1);return clone(f.incoming[0].state.raw);};rejected(input(f),/membership-changed-during-capture/);assert.equal(calls.render,0);
}));
test('permission revocation and current-user change during capture stop before dialog construction',()=>services(async calls=>{
    let f=fixture();f.incoming[0].state.onSerialize=()=>{f.actor.state.permission=false;return clone(f.incoming[0].state.raw);};rejected(input(f),/read-permission/);assert.equal(calls.construct,0);
    f=fixture();const initial=calls.user;f.incoming[0].state.onSerialize=()=>{calls.user={id:'other-current-user'};return clone(f.incoming[0].state.raw);};
    // Permission doubles ordinarily assert the original user. Here they model a
    // stable old-user grant so the launcher's explicit final user check is tested.
    for(const doc of f.documents)doc.testUserPermission=()=>true;f.sourceCollections[0].testUserPermission=()=>true;rejected(input(f),/current-user-changed-during-capture/);calls.user=initial;assert.equal(calls.construct,0);
}));

test('an unestablished current-user identity stops before document reads',()=>services(async calls=>{
    calls.user={};const f=fixture();rejected(input(f),/current-user-unavailable/);assert.equal(calls.serialize,0);assert.equal(calls.content,0);assert.equal(calls.render,0);
}));
test('an Actor world UUID with conflicting pack context stops before serialization',()=>services(async calls=>{
    const f=fixture();f.actor.state.meta.pack='ptu.actors';f.sourceCollections.push({collection:'ptu.actors',testUserPermission:()=>true});rejected(input(f),/actor-identity-unsupported/);assert.equal(calls.serialize,0);assert.equal(calls.render,0);
}));

test('stable Item types alone choose owned Features despite identical or misleading labels',()=>services(async()=>{
    const f=fixture();for(const doc of f.actor.state.members){doc.state.raw.name='Same name';doc.state.raw.system.class='Feature-looking label';}const result=await opened(input(f));assert.equal(result.review.getData().owned.length,2);assert.equal(JSON.parse(result.review.getData().actor.snapshot).items.length,4);
}));
test('a non-Feature incoming document is rejected by type before serialization',()=>services(async calls=>{
    const f=fixture();f.incoming[0].state.raw.type='edge';f.incoming[0].state.raw.name='Feature';const result=rejected(input(f),/incoming-feature-required/);assert.deepEqual(result.issues[0].path,['incoming','0']);assert.equal(calls.serialize,0);assert.equal(calls.render,0);
}));
for(const target of ['actor','incoming'])test(`${target} serialization failure is explicit and positional`,()=>services(async calls=>{
    const f=fixture();(target==='actor'?f.actor:f.incoming[0]).state.serializationError=true;const result=rejected(input(f),/document-serialization-failed/);assert.equal(result.issues[0].path[0],target);assert.equal(calls.render,0);assert.doesNotMatch(JSON.stringify(result),/Hidden snapshot detail/);
}));
test('same-object current-user ID changes during capture stop before rendering',()=>services(async calls=>{
    const f=fixture();f.incoming[0].state.onSerialize=()=>{calls.user.id='changed-id';return clone(f.incoming[0].state.raw);};rejected(input(f),/current-user-changed-during-capture/);assert.equal(calls.render,0);assert.equal(calls.construct,0);
}));
test('identity changes during capture never reach a mixed-identity review',()=>services(async calls=>{
    const f=fixture(),doc=f.incoming[0];doc.state.onSerialize=()=>{doc.state.meta.id=id(910);doc.state.meta.uuid=`Compendium.ptu.feats.Item.${id(910)}`;return clone(doc.state.raw);};rejected(input(f),/document-changed-during-capture/);assert.equal(calls.render,0);
}));

test('an explicitly accessible source-parent Item and supplied reference use only target membership',()=>services(async calls=>{
    const f=fixture(),parent=document('Actor',{_id:id(920),type:'character',system:{}},{},'accessible-source-parent'),raw=clone(bundle.items[0].item);raw._id=id(921);raw._stats={compendiumSource:bundle.mappings[0].documentUuid};raw.system.prerequisites=['Explicit owned Edge'];
    const item=document('Item',raw,{uuid:`Actor.${id(920)}.Item.${id(921)}`,parent},'accessible-source-item');f.incoming=[item];f.references={'Explicit owned Edge':f.actor.state.members[2].uuid};f.documents.push(parent,item);freezeSources(f);const before=rawHash(f),result=await opened(input(f)),data=result.review.getData(),report=JSON.parse(data.candidates[0].prerequisiteEvidence).report;
    assert.equal(report.satisfied.length,1);assert.equal(report.satisfied[0].requiredIdentity,f.actor.state.members[2].uuid);assert.equal(JSON.parse(data.candidates[0].snapshot).uuid,item.uuid);assert.equal(JSON.parse(data.actor.snapshot).items.length,4);assert.equal(calls.events.includes('serialize:accessible-source-parent'),false);assert.equal(rawHash(f),before);
}));
