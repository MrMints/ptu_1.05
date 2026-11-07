import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
import {createRuleVersionRegistry} from '../src/util/rule-version-registry.js';
import {inspectFeatureVersionAcquisition as inspect} from '../src/util/rule-version-acquisition-review.js';
import {previewRuleVersionReplacement as preview} from '../src/util/rule-version-preview.js';
import {lookupSelectedRuleVersion as selected} from '../src/util/rule-versions.js';
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

test('empty owned collection is known empty, and candidates still receive their own attribution/diagnostics',()=>{
    const result=inspect(request());assert.equal(result.inspectionOnly,true);assert.equal(result.collections.owned.status,'complete');assert.equal(result.collections.owned.count,0);assert.equal(result.ownedComparisons.length,0);assert.equal(result.candidates.length,1);assert.equal(result.candidates[0].attribution.selectedVersion.id,bundle.mappings[0].version.id);assert.deepEqual(result.candidates[0].prerequisites.report.rawRequirements,pack().system.prerequisites);
});
for(const [a,b] of [[0,1],[1,0]])test(`owned ${a} to incoming ${b} reports an evidenced alternate without permission or a plan`,()=>{
    const source=owned(a),candidate=pack(b),result=inspect(request({owned:[source],incoming:[candidate],actor:actor(2,[source])}));const pair=result.ownedComparisons[0];assert.equal(pair.relationship.status,'alternate-versions');assert.equal(pair.relationship.canonicalId,bundle.mappings[0].canonical.id);assert.equal(pair.identities.current.uuid,source.uuid);assert.equal(pair.identities.current.sourceId,source._stats.compendiumSource);assert.equal(pair.identities.candidate.uuid,candidate.uuid);assert.notEqual(pair.versions.current.id,pair.versions.candidate.id);for(const key of ['canAcquire','canApply','allowed','authorized','plan','updates','replacement'])assert.equal(Object.hasOwn(result,key),false);
});
test('the actual preview and lookup independently agree with each reported pair',()=>{
    const source=owned(),candidate=pack(1),input=request({owned:[source],incoming:[candidate],actor:actor(2,[source])}),result=inspect(input),expected=preview({current:source,candidate,actor:input.actor,registry});assert.deepEqual(result.ownedComparisons[0].relationship,expected.relationship);assert.deepEqual(result.ownedComparisons[0].differences,expected.differences);assert.deepEqual(result.owned[0].attribution,selected(source,{registry}));assert.deepEqual(result.candidates[0].attribution,selected(candidate,{registry}));
});
test('complete Cartesian owned/incoming traversal and all unordered incoming pairs preserve indices',()=>{
    const sources=[owned(0,1),owned(0,2),owned(1,3)],incoming=[pack(0),pack(1),pack(0)],result=inspect(request({owned:sources,incoming,actor:actor(2,sources)}));assert.equal(result.ownedComparisons.length,9);assert.equal(result.candidateComparisons.length,3);assert.deepEqual(result.ownedComparisons.map(p=>[p.candidateIndex,p.ownedIndex]),[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]);assert.deepEqual(result.candidateComparisons.map(p=>[p.firstIndex,p.secondIndex]),[[0,1],[0,2],[1,2]]);assert.equal(result.candidateComparisons[0].relationship.status,'alternate-versions');assert.equal(result.candidateComparisons[1].relationship.status,'same-version');
});
test('same-version ranked/repeated owned instances retain every UUID, local ID, choice and custom field',()=>{
    const sources=[owned(0,1),owned(0,2),owned(0,3)],result=inspect(request({owned:sources}));assert.equal(result.owned.length,3);assert.deepEqual(result.owned.map(x=>x.snapshot),sources);assert.equal(new Set(result.owned.map(x=>x.snapshot._id)).size,3);for(const pair of result.ownedComparisons)assert.equal(pair.relationship.status,'same-version');assert.deepEqual(result.owned.map(x=>x.snapshot.flags.user.choice),['choice-1','choice-2','choice-3']);
});
test('even repeated references to the identical input object remain separate occurrences',()=>{
    const source=owned(),result=inspect(request({owned:[source,source],incoming:[pack(),pack()]}));assert.equal(result.owned.length,2);assert.equal(result.candidates.length,2);assert.equal(result.ownedComparisons.length,4);assert.equal(result.candidateComparisons.length,1);assert.notEqual(result.owned[0].snapshot,result.owned[1].snapshot);
});
test('same-name unrelated canonical identities remain unrelated, while renames never change relationships',()=>{
    const mappings=clone(bundle.mappings);mappings[1].canonical={id:'synthetic-unrelated-benefit',evidence:'Synthetic identity control only'};const r=createRuleVersionRegistry(mappings),candidate=pack(1),source=owned();candidate.name=source.name;let result=inspect(request({registry:r,owned:[source],incoming:[candidate]}));assert.equal(result.ownedComparisons[0].relationship.status,'unrelated-benefits');source.name='Renamed core';candidate.name='Nom traduit';result=inspect(request({owned:[source],incoming:[candidate]}));assert.equal(result.ownedComparisons[0].relationship.status,'alternate-versions');
});
test('owned and incoming snapshots preserve raw modern/legacy provenance without alias rewriting',()=>{
    const source=owned();source._stats.compendiumSource=source._stats.compendiumSource.replace('.Item.','.');source.flags.core={sourceId:'Compendium.ptu.feats.ta6bKIiHCuccjTqU'};const candidate=pack(1);candidate.uuid=candidate.uuid.replace('.Item.','.');const result=inspect(request({owned:[source],incoming:[candidate]}));assert.equal(result.ownedComparisons[0].relationship.status,'alternate-versions');assert.deepEqual(result.owned[0].snapshot,source);assert.deepEqual(result.candidates[0].snapshot,candidate);assert.equal(result.owned[0].attribution.identity.sourceId,source._stats.compendiumSource);assert.equal(result.candidates[0].attribution.identity.uuid,candidate.uuid);
});
test('no supplied registry creates no default mapping, while exact mode does not gain registry aliases',()=>{
    const source=owned(),candidate=pack(1);let input=request({owned:[source],incoming:[candidate]});delete input.registry;let result=inspect(input);assert.equal(result.mappingMode,'unavailable');assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');input.versions=bundle.mappings;result=inspect(input);assert.equal(result.mappingMode,'exact');assert.equal(result.ownedComparisons[0].relationship.status,'alternate-versions');candidate.uuid=candidate.uuid.replace('.Item.','.');result=inspect(input);assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');
});
for(const versions of [bundle.mappings,undefined,[],null])test(`both explicit mapping modes stay conflicting (${Array.isArray(versions)?versions.length:String(versions)})`,()=>{
    const result=inspect(request({owned:[owned()],versions,incoming:[pack(1)]}));assert.equal(result.mappingMode,'conflicting');assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');assert.match(reasons(result.contextIssues),/registry-and-versions-conflict/);
});
for(const mode of ['missing','malformed','tampered','ambiguous','excluded','unclassified'])test(`unavailable ${mode} attribution never becomes safe or unrelated`,()=>{
    const source=owned(),candidate=pack(1);let r=clone(registry);
    if(mode==='missing')r=createRuleVersionRegistry([]);if(mode==='malformed')r={};if(mode==='tampered')r.aliases[0].canonicalUuid=bundle.mappings[1].documentUuid;if(mode==='ambiguous')r=createRuleVersionRegistry([...bundle.mappings,bundle.mappings[0]]);if(['excluded','unclassified'].includes(mode)){const m=clone(bundle.mappings);m.forEach(x=>x.generationEligibility=mode);r=createRuleVersionRegistry(m);}
    const result=inspect(request({owned:[source],incoming:[candidate],registry:r}));assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');assert.deepEqual(result.owned[0].snapshot,source);assert.deepEqual(result.candidates[0].snapshot,candidate);
});
test('registry structure errors are reported even for known empty collections',()=>{
    const result=inspect(request({owned:[],incoming:[],registry:{}}));assert.match(reasons(result.contextIssues),/registry-not-ready-or-invalid/);assert.equal(result.traversal.ownedPairCount,0);
});
test('null canonical relationships stay unresolved in accepted exact mode',()=>{
    const mappings=clone(bundle.mappings);mappings.forEach(x=>x.canonical=null);const input=request({owned:[owned()],incoming:[pack(1)],versions:mappings});delete input.registry;const result=inspect(input);assert.equal(result.owned[0].attribution.status,'resolved');assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');assert.match(reasons(result.ownedComparisons[0]),/canonical-relationship-unestablished/);
});
for(const change of [x=>x.flags.ptu.selectedVersion.id='conflicting',x=>x._stats.compendiumSource={bad:true},x=>x._stats.compendiumSource='Compendium.other.feats.Item.ViZpn17qLA4ACQGa',x=>delete x._stats])test(`unknown/conflicting owned source is explicit uncertainty: ${String(change)}`,()=>{
    const source=owned();change(source);const result=inspect(request({owned:[source],incoming:[pack(1)]}));assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');
});
for(const change of [x=>x.uuid='same-name',x=>x._id=42,x=>x.name={bad:true},x=>x.type='edge',x=>delete x.uuid])test(`malformed/unsupported incoming identities retain raw data without coercion: ${String(change)}`,()=>{
    const candidate=pack(1);change(candidate);const result=inspect(request({owned:[owned()],incoming:[candidate]}));assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');assert.deepEqual(result.candidates[0].snapshot,candidate);assert.ok(result.candidates[0].inputIssues.length);assert.equal(result.candidates[0].attribution,null);
});
test('a malformed entry does not suppress traversal or valid other candidates',()=>{
    const candidate=pack(1);candidate._id=42;const result=inspect(request({owned:[owned(),owned(0,2)],incoming:[candidate,pack(1)]}));assert.equal(result.collections.incoming.status,'invalid-entries');assert.equal(result.ownedComparisons.length,4);assert.ok(result.ownedComparisons.slice(0,2).every(p=>p.relationship.status==='unresolved'));assert.ok(result.ownedComparisons.slice(2).every(p=>p.relationship.status==='alternate-versions'));
});
for(const key of ['owned','incoming'])for(const value of [undefined,null,{},'[]',false,()=>[]])test(`${key} missing/unsupported collection ${typeof value} is unavailable, never empty`,()=>{
    const result=inspect(request({[key]:value}));assert.equal(result.collections[key].status,'unavailable');assert.equal(result.collections[key].count,null);assert.equal(result.traversal[`${key==='owned'?'owned':'incoming'}Complete`],false);
});
test('known empty incoming arrays remain distinct from missing input',()=>{
    const known=inspect(request({incoming:[]})),input=request();delete input.incoming;const missing=inspect(input);assert.equal(known.collections.incoming.count,0);assert.equal(known.collections.incoming.status,'complete');assert.equal(missing.collections.incoming.count,null);assert.equal(missing.collections.incoming.status,'unavailable');
});
test('sparse/extra-property/subclass/iterator collections are rejected without executing interfaces',()=>{
    let calls=0;const sparse=[];sparse.length=1_000_000_000;sparse[999_999_999]=pack();const extra=[pack()];extra.toJSON=()=>{calls++;throw Error('called');};class Items extends Array{};const iterable={*[Symbol.iterator](){calls++;yield pack();}};for(const incoming of [sparse,extra,new Items(pack()),iterable]){const result=inspect(request({incoming}));assert.equal(result.collections.incoming.status,'unavailable');}assert.equal(calls,0);
});
test('index accessors and non-enumerable array fields are never read',()=>{
    let calls=0;for(const enumerable of [true,false]){const array=[pack()];Object.defineProperty(array,'0',{enumerable,get(){calls++;throw Error('called');}});const result=inspect(request({incoming:array}));assert.equal(result.collections.incoming.status,'unavailable');}assert.equal(calls,0);
});
for(const key of ['owned','incoming','actor','registry','versions','mechanicChoices','references'])test(`accessor request ${key} is rejected without getter execution`,()=>{
    let calls=0;const input=request({owned:[owned()],incoming:[pack(1)]});Object.defineProperty(input,key,{enumerable:true,get(){calls++;throw Error('called');}});const result=inspect(input);assert.equal(calls,0);assert.match(reasons(result.contextIssues),/request-field-not-data/);if(['owned','incoming'].includes(key))assert.equal(result.collections[key].status,'unavailable');if(['registry','versions'].includes(key))assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');
});
test('hidden or inherited registry options cannot be laundered into a valid registry',()=>{
    const input=request({owned:[owned()],incoming:[pack(1)]});Object.defineProperty(input,'registry',{value:registry,enumerable:false});assert.equal(inspect(input).ownedComparisons[0].relationship.status,'unresolved');const inherited=Object.assign(Object.create({registry}),{owned:[owned()],incoming:[pack(1)],actor:actor()});const result=inspect(inherited);assert.equal(result.collections.owned.status,'unavailable');assert.match(reasons(result.contextIssues),/plain-request-required/);
});
test('function/class/array request containers are not accepted as ordinary option records',()=>{
    for(const input of [Object.assign(()=>{},request()),Object.assign([],request()),Object.assign(new class {},request()),null]){const result=inspect(input);assert.equal(result.collections.owned.status,'unavailable');assert.equal(result.collections.incoming.status,'unavailable');assert.match(reasons(result.contextIssues),/plain-request-required/);}
});
test('owned/candidate getters and live interfaces are rejected without execution',()=>{
    let calls=0;for(const field of ['name','uuid','system','flags','toObject','toJSON']){const candidate=pack(1);Object.defineProperty(candidate,field,{enumerable:true,get(){calls++;throw Error('called');}});const result=inspect(request({owned:[owned()],incoming:[candidate]}));assert.equal(result.ownedComparisons[0].relationship.status,'unresolved');}const candidate=pack(1);candidate.toObject=()=>{calls++;return pack(1);};inspect(request({incoming:[candidate]}));assert.equal(calls,0);
});
test('nonserialized dates/functions/symbols/cycles are rejected, and safe partial values remain visible',()=>{
    const cycle={};cycle.self=cycle;for(const custom of [new Date(),()=>1,Symbol('data'),NaN,Infinity,cycle]){const candidate=pack();candidate.system.custom=custom;const result=inspect(request({incoming:[candidate]}));assert.equal(result.candidates[0].attribution,null);assert.ok(result.candidates[0].inputIssues.length);assert.equal(result.candidates[0].snapshot.uuid,candidate.uuid);}
});
test('candidate prerequisites come from each own selected version, keeping unmet and custom unknown separate',()=>{
    const incoming=[pack(0),pack(1)];incoming[1].system.prerequisites.push('GM Permission','Custom condition');const result=inspect(request({incoming,actor:actor(2)}));for(const [index,row]of result.candidates.entries()){assert.deepEqual(row.prerequisites.report.rawRequirements,incoming[index].system.prerequisites);assert.equal(row.prerequisites.report.identity.selectedVersion.id,bundle.mappings[index].version.id);assert.equal(row.prerequisites.report.advisory,true);assert.ok(row.prerequisites.report.unmet.length);}assert.ok(result.candidates[1].prerequisites.report.unverifiable.length>=2);assert.equal(result.candidateComparisons[0].relationship.status,'alternate-versions');
});
test('valid actor ranks and levels survive an unreadable membership accessor',()=>{
    let calls=0;const context=actor(1);Object.defineProperty(context,'items',{enumerable:true,get(){calls++;throw Error('called');}});const candidate=pack();candidate.system.prerequisites=['Novice General Education','Level 5','Explicit required Feature'];const result=inspect(request({actor:context,incoming:[candidate],references:{'Explicit required Feature':{uuid:owned().uuid}}}));assert.equal(calls,0);assert.equal(result.actor.membership,'unavailable');assert.equal(result.candidates[0].prerequisites.report.unmet.length,2);assert.equal(result.candidates[0].prerequisites.report.unverifiable.length,1);assert.match(reasons(result.contextIssues),/actor-items-unavailable/);
});
test('valid nested actor facts survive an unrelated skill getter without coercion or rank changes',()=>{
    let calls=0;const context=actor(1);Object.defineProperty(context.system.skills,'custom',{enumerable:true,get(){calls++;throw Error('called');}});const result=inspect(request({actor:context}));assert.equal(calls,0);assert.equal(result.actor.snapshot.system.skills.generalEd.value.total,1);assert.ok(result.candidates[0].prerequisites.report.unmet.length);assert.equal(result.actor.status,'partial');
});
test('empty versus malformed membership yields known unmet versus unknown without dropping actor facts',()=>{
    const candidate=pack();candidate.system.prerequisites=['Explicit required Feature','Novice General Education'];for(const items of [[],{},[null],{contents:[]}]){const result=inspect(request({incoming:[candidate],actor:actor(1,items),references:{'Explicit required Feature':owned().uuid}}));const known=Array.isArray(items)&&items.length===0||Array.isArray(items.contents);assert.equal(result.actor.membership,known?'known':'unavailable');assert.equal(result.candidates[0].prerequisites.report.unmet.length,known?2:1);assert.equal(result.candidates[0].prerequisites.report.unverifiable.length,known?0:1);}
});
test('incoming candidates are never silently granted into prerequisite membership',()=>{
    const required=owned(),candidate=pack(1);candidate.system.prerequisites=['Explicit required Feature'];const result=inspect(request({incoming:[required,candidate],actor:actor(2,[]),references:{'Explicit required Feature':required.uuid}}));assert.equal(result.candidates[1].prerequisites.report.unmet.length,1);assert.deepEqual(result.actor.snapshot.items,[]);
});
test('omitted and explicit undefined independent choices keep accepted standard defaults',()=>{
    for(const extra of [{},{mechanicChoices:undefined,references:undefined}]){const result=inspect(request(extra));assert.deepEqual(result.candidates[0].mechanics,{default:'standard',choices:{}});assert.equal(result.contextIssues.some(x=>['mechanicChoices','references'].includes(x.input)),false);}
});
test('invalid independent choices/references remain unavailable without erasing actor ranks',()=>{
    const result=inspect(request({actor:actor(1),mechanicChoices:()=>{},references:{bad:{uuid:42}}}));assert.equal(result.candidates[0].mechanics.choices,null);assert.ok(result.candidates[0].prerequisites.report.unmet.length);assert.match(reasons(result.contextIssues),/not-serialized-data|prerequisite-reference-identity-invalid/);
});
test('malformed identity/source display data is preserved without manufacturing formatted text',()=>{
    const candidate=pack();candidate._stats={compendiumSource:{bad:true}};candidate.system.source={value:{bad:true}};const result=inspect(request({incoming:[candidate]}));assert.deepEqual(result.candidates[0].snapshot._stats,candidate._stats);assert.equal(result.candidates[0].prerequisites.formatted,null);assert.match(reasons(result.candidates[0].prerequisites.issues),/source-label-not-text|identity-formatting-unavailable/);
});
test('frozen inputs stay unchanged, outputs detach, and no document/settings/network interface runs',()=>{
    const input=request({owned:[owned(),owned(0,2)],incoming:[pack(),pack(1)]}),before=hash(input);freeze(input);const first=inspect(input),second=inspect(input);assert.deepEqual(first,second);assert.equal(hash(input),before);first.owned[0].snapshot.flags.user.choice='changed';first.candidates[0].snapshot.system.prerequisites.push('Changed');assert.equal(hash(input),before);assert.deepEqual(second.owned[0].snapshot,input.owned[0]);for(const item of bundle.items)assert.equal(fs.existsSync(new URL(item.targetPath,root)),false);assert.equal(hash(bundle),'bf41ea796e3167569358368f37d96652de238ba3cc623e15300d1eea05bd5384');
});
test('null-prototype data and own __proto__ keys preserve values without changing any prototype',()=>{
    const input=Object.assign(Object.create(null),request({owned:[owned()]}));input.incoming[0].system.custom=JSON.parse('{"__proto__":{"unsafe":"data only"}}');const result=inspect(input);assert.equal(result.ownedComparisons[0].relationship.status,'same-version');assert.equal(Object.prototype.unsafe,undefined);assert.equal(Object.hasOwn(result.candidates[0].snapshot.system.custom,'__proto__'),true);
});
test('unavailable mappings and malformed references keep valid independent actor facts',()=>{
    let calls=0;const context=actor(1),references={};Object.defineProperty(references,'Explicit required Feature',{enumerable:true,get(){calls++;throw Error('called');}});const result=inspect(request({actor:context,references,registry:null}));assert.equal(calls,0);assert.ok(result.candidates[0].prerequisites.report.unmet.length);assert.equal(result.candidates[0].attribution.status,'unresolved');assert.equal(result.actor.snapshot.system.skills.generalEd.value.total,1);
});
test('serialized actor interface markers retain raw snapshot data while diagnostics stay inert',()=>{
    const context=actor(1);context.toObject='not callable';const result=inspect(request({actor:context}));assert.equal(result.actor.snapshot.toObject,'not callable');assert.equal(result.actor.status,'partial');assert.ok(result.candidates[0].prerequisites.report.unmet.length);
});
test('symbol/hidden optional fields do not become known empty or manufacture default choices',()=>{
    for(const key of ['references','mechanicChoices']){const input=request();Object.defineProperty(input,key,{value:{},enumerable:false});const result=inspect(input);assert.match(reasons(result.contextIssues),/request-field-not-data/);if(key==='mechanicChoices')assert.equal(result.candidates[0].mechanics.choices,null);}const input=request();input[Symbol('bad')]=true;assert.match(reasons(inspect(input).contextIssues),/symbol-key/);
});
test('available actor membership survives a missing system field without a live interface call',()=>{
    let calls=0;const context=actor(2,[]);Object.defineProperty(context,'system',{enumerable:true,get(){calls++;throw Error('called');}});const candidate=pack();candidate.system.prerequisites=['Explicit required Feature','Novice General Education'];const result=inspect(request({actor:context,incoming:[candidate],references:{'Explicit required Feature':owned().uuid}}));assert.equal(calls,0);assert.equal(result.actor.membership,'known');assert.equal(result.candidates[0].prerequisites.report.unmet.length,1);assert.equal(result.candidates[0].prerequisites.report.unverifiable.length,1);
});
test('inspection never calls document/settings/world/network write capabilities',()=>{
    let calls=0;const deny=()=>{calls++;throw Error('write/interface called');};const saved=new Map(['game','Actor','fetch','Hooks'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
    try {for(const [key,value] of Object.entries({game:{settings:{set:deny}},Actor:{create:deny,createDocuments:deny},fetch:deny,Hooks:{callAll:deny}}))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});const context=actor(1);context.update=deny;context.toObject=deny;const candidate=pack();candidate.update=deny;const result=inspect(request({actor:context,incoming:[candidate]}));assert.equal(result.candidates[0].attribution,null);assert.equal(result.actor.snapshot.system.skills.generalEd.value.total,1);assert.equal(calls,0);}finally{for(const [key,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
test('malformed actor collection entries identify the exact unavailable slot',()=>{
    for(const items of [[null],{contents:[42]}]){const result=inspect(request({actor:actor(1,items)}));const expected=Array.isArray(items)?['items','0']:['items','contents','0'];assert.ok(result.actor.inputIssues.some(issue=>JSON.stringify(issue.path)===JSON.stringify(expected)&&issue.reason==='actor-item-snapshot-required'));assert.equal(result.actor.membership,'unavailable');assert.ok(result.candidates[0].prerequisites.report.unmet.length);}
});
test('missing owned/incoming inputs have a missing-input diagnostic distinct from a wrong container',()=>{
    const input=request();delete input.owned;const result=inspect(input);assert.ok(result.collections.owned.inputIssues.some(issue=>issue.reason==='collection-input-missing'));assert.equal(inspect(request({owned:{}})).collections.owned.inputIssues.some(issue=>issue.reason==='collection-input-missing'),false);
});
test('empty collections do not conceal missing mapping context',()=>{
    const input=request({owned:[],incoming:[]});delete input.registry;const result=inspect(input);assert.equal(result.mappingMode,'unavailable');assert.ok(result.contextIssues.some(issue=>issue.reason==='version-mappings-unavailable'));assert.equal(result.collections.owned.count,0);assert.equal(result.collections.incoming.count,0);
});
