import test from 'node:test';
import assert from 'node:assert/strict';
import {createRuleVersionRegistry as create, matchRuleVersionRegistry as match} from '../src/util/rule-version-registry.js';
import {lookupSelectedRuleVersion as selected, lookupEffectiveRule as effective, ruleVersionMetadataErrors} from '../src/util/rule-versions.js';
import {previewRuleVersionReplacement as preview} from '../src/util/rule-version-preview.js';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),json=p=>JSON.parse(read(p));
const evidencePaths=['system.json','docs/data/source-authority.json','template.json',...['ability','move','feature'].map(x=>`docs/data/${x}-source-evidence.json`),...['abilities-core','moves-anchored','features-core','pokemon-edges'].map(x=>`docs/data/record-source-review/${x}.json`)];
const evidenceIds=['moves.Y5R5mbVcGq6fwoFj','abilities.oNB76oqVYrjhYd7W','feats.aJ47Z5z6Az9c8Dy8','poke-edges.WkzCUjTOCTI60Uwg','abilities.nuGa21WQ0QD07kQj'];
const upstream={pilot:json('docs/data/rule-version-pilot.json'),revisions:read('docs/data/rules-revisions.json'),sourceEvidence:Object.fromEntries(evidencePaths.map(p=>[p,read(p)])),currentRecords:Object.fromEntries(evidenceIds.map(id=>{const [pack,key]=id.split('.');return[id,read(`packs/${pack}/_source/${key}.json`)];})),contextNote:read('docs/validation/p05-echoes-readiness.md').match(/^> (Researcher[^\r\n]+)$/m)[1],iconSha256:createHash('sha256').update(fs.readFileSync(new URL('css/images/icons/feat_icon.png',root))).digest('hex')};
const documents=[];
for(const pack of fs.readdirSync(new URL('packs/',root),{withFileTypes:true})){if(!pack.isDirectory()||!fs.existsSync(new URL(`packs/${pack.name}/_source/`,root)))continue;for(const file of fs.readdirSync(new URL(`packs/${pack.name}/_source/`,root)).filter(x=>x.endsWith('.json'))){const path=`packs/${pack.name}/_source/${file}`,item=json(path),selected=item.flags?.ptu?.selectedVersion;documents.push({path,id:item._id,filenameId:file.slice(0,-5),selectedVersionId:selected==null?null:typeof selected==='string'?selected:selected.id,sourceId:item._stats?.compendiumSource??item.flags?.core?.sourceId??null});}}
documents.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
const compiled=compileEchoesAdmission(read('docs/data/rule-version-echoes-admission.json'),read('docs/data/rule-version-echoes-draft.json'),JSON.stringify(upstream),JSON.stringify({schemaVersion:1,documents,mappings:[]}));
const bundle=compiled.bundle;

assert.equal(compiled.status,'prepared-not-installed');assert.deepEqual(compiled.issues,[]);
const mappings=bundle.mappings,registry=create(mappings);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const legacy=uuid=>uuid.replace('.Item.','.');
const pack=(index=0,old=false)=>({...structuredClone(bundle.items[index].item),uuid:old?legacy(mappings[index].documentUuid):mappings[index].documentUuid,pack:'ptu.feats'});
const owned=(index=0,modern=true,old=false)=>{const item=pack(index);delete item.pack;item._id='0000000000007701';item.uuid='Actor.0000000000007700.Item.0000000000007701';const id=old?legacy(mappings[index].documentUuid):mappings[index].documentUuid;if(modern)item._stats={compendiumSource:id};else item.flags.core={sourceId:id};return item;};
const actor=(rank=2,items=[])=>({uuid:'Actor.0000000000007700',system:{skills:{generalEd:{value:{total:rank}}}},items});
const inspect=(current,candidate=pack(1),extra={})=>preview({actor:actor(),current,candidate,registry,...extra});
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}

test('baseline exact mode resolves typed mappings and leaves legacy spellings unresolved without a registry',()=>{
    assert.equal(hash(bundle),'bf41ea796e3167569358368f37d96652de238ba3cc623e15300d1eea05bd5384');
    assert.deepEqual(bundle.items.map(x=>x.contentHash),['1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289','98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54']);
    for(const i of [0,1]){
        assert.equal(selected(pack(i),{versions:mappings}).status,'resolved');
        assert.equal(selected(pack(i,true),{versions:mappings}).status,'unresolved');
        assert.equal(selected(pack(i)).status,'unresolved');
        assert.equal(Object.hasOwn(selected(pack(i),{versions:mappings}),'registryMatch'),false);
        assert.equal(fs.existsSync(new URL(bundle.items[i].targetPath,root)),false);
    }
});
test('construction uses one canonical mapping per version and only exact typed/derived legacy aliases',()=>{
    assert.equal(registry.status,'ready');assert.deepEqual(registry.issues,[]);
    assert.deepEqual(registry.mappings,mappings);assert.notEqual(registry.mappings,mappings);
    assert.equal(registry.mappings.length,2);assert.equal(registry.aliases.length,4);
    for(const m of mappings){assert.deepEqual(ruleVersionMetadataErrors(m),[]);assert.deepEqual(registry.aliases.filter(x=>x.canonicalUuid===m.documentUuid).map(x=>x.uuid),[m.documentUuid,legacy(m.documentUuid)]);}
});
for(const i of [0,1])for(const old of [false,true]) test(`pack ${i} ${old?'legacy':'typed'} matches canonically while preserving raw identities`,()=>{
    const item=pack(i,old),before=hash(item);freeze(item);
    const result=selected(item,{registry});
    assert.equal(result.status,'resolved');assert.equal(result.registryMatch.canonicalUuid,mappings[i].documentUuid);
    assert.equal(result.identity.uuid,item.uuid);assert.equal(result.identity.mappingUuid,item.uuid);assert.equal(result.identity.sourceId,null);
    assert.equal(result.selectedVersion.id,mappings[i].version.id);assert.equal(result.source.status,i?'optional-playtest':'core');
    assert.deepEqual(result.rawPrerequisites,bundle.items[i].item.system.prerequisites);assert.equal(hash(item),before);
});
for(const i of [0,1])for(const modern of [false,true])for(const old of [false,true]) test(`owned ${i} ${modern?'modern':'legacy-field'} ${old?'untyped':'typed'} provenance preserves original source and selection`,()=>{
    const item=owned(i,modern,old),before=hash(item);freeze(item);
    const r=selected(item,{registry});assert.equal(r.status,'resolved');assert.equal(r.identity.uuid,item.uuid);
    assert.equal(r.identity.sourceId,old?legacy(mappings[i].documentUuid):mappings[i].documentUuid);
    assert.equal(r.identity.mappingUuid,r.identity.sourceId);assert.equal(r.registryMatch.canonicalUuid,mappings[i].documentUuid);
    assert.deepEqual(r.storedSelection,item.flags.ptu.selectedVersion);assert.equal(hash(item),before);
});
test('modern provenance wins over conflicting legacy provenance and pack identity wins over historical pointers',()=>{
    const item=owned(1,true,true);item.flags.core={sourceId:mappings[0].documentUuid};
    assert.equal(selected(item,{registry}).selectedVersion.id,mappings[1].version.id);
    const p=pack(0,true);p._stats={compendiumSource:'Compendium.ptu.feats.ta6bKIiHCuccjTqU'};p.flags.core={sourceId:mappings[1].documentUuid};
    const r=selected(p,{registry});assert.equal(r.status,'resolved');assert.equal(r.selectedVersion.id,mappings[0].version.id);
    assert.equal(r.identity.sourceId,p._stats.compendiumSource);assert.equal(r.identity.mappingUuid,p.uuid);
});
for(const source of ['Compendium.foreign.feats.Item.ViZpn17qLA4ACQGa','Compendium.ptu.other.Item.ViZpn17qLA4ACQGa','not-a-UUID','   ',42,{bad:true}]) test(`unknown/malformed modern provenance ${JSON.stringify(source)} cannot use a convenient legacy fallback`,()=>{
    const item=owned();item._stats.compendiumSource=source;item.flags.core={sourceId:mappings[0].documentUuid};
    const before=hash(item),r=selected(item,{registry});assert.equal(r.status,'unresolved');assert.equal(r.registryMatch.canonicalUuid,null);assert.equal(hash(item),before);
});
test('actual-pack precedence also ignores malformed historical modern provenance without rewriting it',()=>{
    const item=pack();item._stats={compendiumSource:{malformed:true}};const before=hash(item);
    assert.equal(selected(item,{registry}).status,'resolved');assert.equal(hash(item),before);
});
for(const source of [undefined,null,'']) test(`absent/blank modern ${String(source)} permits only the existing explicit legacy accessor fallback`,()=>{
    const item=owned(0,false,true);if(source!==undefined)item._stats={compendiumSource:source};
    const r=selected(item,{registry});assert.equal(r.status,'resolved');assert.equal(r.identity.sourceId,legacy(mappings[0].documentUuid));
});
for(const source of [undefined,null,'']) test(`missing/blank source without an explicit provenance mapping ${String(source)} is unresolved`,()=>{
    const item=owned();if(source===undefined)delete item._stats;else item._stats.compendiumSource=source;
    const before=hash(item);assert.equal(selected(item,{registry}).status,'unresolved');assert.equal(hash(item),before);
});
for(const uuid of ['Compendium.ptu.feats.Item.aJ47Z5z6Az9c8Dy8','Compendium.ptu.feats.aJ47Z5z6Az9c8Dy8','Compendium.ptu.feats.Item.ta6bKIiHCuccjTqU','Compendium.ptu.feats.ta6bKIiHCuccjTqU','Compendium.other.feats.ViZpn17qLA4ACQGa','Compendium.ptu.other.ViZpn17qLA4ACQGa','Item.ViZpn17qLA4ACQGa','',null,{},'Compendium.ptu.feats.Item.short']) test(`no alias by name, historical pointer or malformed/foreign identity ${JSON.stringify(uuid)}`,()=>{
    const item=pack();item.uuid=uuid;item.name='Echoes of the Future';assert.equal(selected(item,{registry}).status,'unresolved');
});
for(const name of ['Echoes of the Future','Renamed by user','Échos personnalisés']) test(`display name ${name} never selects a mapping`,()=>{
    const item=owned(1,false,true);item.name=name;const before=hash(item);assert.equal(selected(item,{registry}).selectedVersion.id,mappings[1].version.id);assert.equal(hash(item),before);
    const unknown={...item,flags:{ptu:item.flags.ptu}};assert.equal(selected(unknown,{registry}).status,'unresolved');
});
test('stored selection conflicts and type conflicts remain unresolved after a successful identity match',()=>{
    const item=pack();item.flags.ptu.selectedVersion.id=mappings[1].version.id;
    const r=selected(item,{registry});assert.equal(r.status,'unresolved');assert.equal(r.registryMatch.status,'matched');assert.ok(r.issues.includes('stored-version-conflict'));
    const wrong={...pack(),type:'edge'},result=selected(wrong,{registry});assert.equal(result.status,'unresolved');assert.ok(result.issues.includes('mapped-item-type-conflict'));
});
test('shared or translated version labels and slugs cannot establish or redirect identity',()=>{
    const rows=structuredClone(mappings);rows.forEach(row=>row.version.label='Même nom');const reg=create(rows),item=pack(1,true);
    item.system.slug='shared-slug';item.name='Same name';const before=hash(item),r=selected(item,{registry:reg});
    assert.equal(r.status,'resolved');assert.equal(r.selectedVersion.id,mappings[1].version.id);assert.equal(hash(item),before);
    const unknown={...item,uuid:'Compendium.ptu.feats.Item.0000000000009191'};assert.equal(selected(unknown,{registry:reg}).status,'unresolved');
});
for(const flag of [undefined,null,'',{},'custom-version']) test(`absent/blank/custom selected-version metadata ${JSON.stringify(flag)} retains exact-mode semantics`,()=>{
    const item=pack();if(flag===undefined)delete item.flags.ptu.selectedVersion;else item.flags.ptu.selectedVersion=flag;
    const exact=selected(item,{versions:mappings}),optional=selected(item,{registry});
    assert.equal(optional.status,exact.status);assert.deepEqual(optional.issues,exact.issues);assert.deepEqual(optional.storedSelection,exact.storedSelection);
});
for(const eligibility of ['excluded','unclassified']) test(`${eligibility} mapping cannot resolve attribution`,()=>{
    const rows=structuredClone(mappings);rows[0].generationEligibility=eligibility;const reg=create(rows),r=selected(pack(),{registry:reg});
    assert.equal(reg.status,'ready');assert.equal(r.status,'unresolved');assert.ok(r.issues.includes('mapping-outside-approved-generation-scope'));
});
for(const [label,mutate] of [
    ['duplicate document',rows=>rows.push(structuredClone(rows[0]))],
    ['duplicate canonical/version',rows=>{rows[1].version.id=rows[0].version.id;}],
    ['legacy rather than canonical typed input',rows=>{rows[0].documentUuid=legacy(rows[0].documentUuid);}],
    ['no canonical relationship',rows=>{rows[0].canonical=null;}],
    ['bad metadata schema',rows=>{rows[0].schemaVersion=99;}],
    ['malformed source date',rows=>{rows[0].source.publicationDate='2015-13';}],
    ['invalid item type',rows=>{rows[0].type='unknown';}],
    ['unevidenced catalog canonical',rows=>{rows[0].canonical.id='r04-not-runtime';}]
]) test(`registry rejects ${label} atomically`,()=>{
    const rows=structuredClone(mappings);mutate(rows);const before=hash(rows),reg=create(rows);
    assert.equal(reg.status,'invalid');assert.ok(reg.issues.length);assert.deepEqual(reg.mappings,[]);assert.deepEqual(reg.aliases,[]);
    assert.equal(selected(pack(),{registry:reg}).status,'unresolved');assert.equal(hash(rows),before);
});
test('distinct canonical benefits may share a version token without false ambiguity',()=>{
    const rows=structuredClone(mappings);rows[1].canonical={id:'fixture:other-benefit',evidence:'Explicit synthetic distinct benefit control'};
    rows[1].version.id=rows[0].version.id;const reg=create(rows);assert.equal(reg.status,'ready');
    const item=pack(1);item.flags.ptu.selectedVersion.id=rows[1].version.id;
    assert.equal(selected(item,{registry:reg}).status,'resolved');
    assert.equal(inspect(pack(),item,{registry:reg}).relationship.status,'unrelated-benefits');
});
for(const [label,value] of [['undefined',undefined],['null',null],['string','{'],['object',{}],['number',42],['Date',new Date(0)],['function',()=>{}]]) test(`constructor rejects non-array serialized input ${label}`,()=>{
    const result=create(value);assert.equal(result.status,'invalid');assert.deepEqual(result.mappings,[]);
});
test('cyclic, sparse, nonfinite, symbol and array-subclass inputs are rejected without throwing',()=>{
    const cyclic=[];cyclic.push(cyclic);const sparse=[];sparse.length=4294967295;
    const symbol=structuredClone(mappings);symbol[Symbol('hidden')]=true;
    class Rows extends Array{};const subclass=new Rows(...mappings);
    for(const value of [cyclic,sparse,[NaN],[Infinity],symbol,subclass])assert.equal(create(value).status,'invalid');
});
test('accessor/toJSON/live fields never execute during construction or registry consumption',()=>{
    let calls=0;const rows=structuredClone(mappings);Object.defineProperty(rows[0],'danger',{enumerable:true,get(){calls++;throw Error();}});
    assert.equal(create(rows).status,'invalid');
    const toJson=structuredClone(mappings);toJson[0].toJSON=()=>{calls++;throw Error();};assert.equal(create(toJson).status,'invalid');
    const reg=structuredClone(registry);Object.defineProperty(reg,'mappings',{enumerable:true,get(){calls++;throw Error();}});
    assert.equal(selected(pack(),{registry:reg}).status,'unresolved');assert.equal(calls,0);
});
for(const [label,change] of [
    ['forged alias target',reg=>reg.aliases[1].canonicalUuid=reg.mappings[1].documentUuid],
    ['extra alias',reg=>reg.aliases.push({uuid:'Compendium.foreign.feats.ViZpn17qLA4ACQGa',canonicalUuid:reg.mappings[0].documentUuid})],
    ['missing alias',reg=>reg.aliases.pop()],
    ['duplicate alias',reg=>reg.aliases.push(reg.aliases[0])],
    ['tampered duplicate mapping',reg=>reg.mappings.push(reg.mappings[0])],
    ['extra envelope field',reg=>reg.defaultVersion='core']
]) test(`registry integrity rejects ${label}`,()=>{
    const reg=structuredClone(registry);change(reg);const before=hash(reg),r=selected(pack(0,true),{registry:reg});assert.equal(r.status,'unresolved');assert.equal(hash(reg),before);
});
test('prototype-like namespaces, packs, canonical/version IDs and own data keys use safe identity tables',()=>{
    const row=structuredClone(mappings[0]);row.documentUuid='Compendium.__proto__.constructor.Item.0000000000009901';
    row.canonical={id:'__proto__',evidence:'Synthetic prototype-like canonical identity control'};row.version.id='constructor';
    Object.defineProperty(row,'__proto__',{enumerable:true,value:{polluted:'not a prototype'}});
    const reg=create([row]);assert.equal(reg.status,'ready');assert.equal({}.polluted,undefined);
    const item={...structuredClone(bundle.items[0].item),_id:'0000000000009901',uuid:'Compendium.__proto__.constructor.0000000000009901',pack:'__proto__.constructor',flags:{ptu:{selectedVersion:{id:'constructor',label:'Synthetic control'}}}};
    assert.equal(selected(item,{registry:reg}).status,'resolved');assert.equal({}.polluted,undefined);
    const inherited=Object.create({mappings});assert.equal(create(inherited).status,'invalid');
});
test('JSON round trips and repeated reads detach all registry/lookup results from frozen supplied mappings',()=>{
    const rows=structuredClone(mappings),before=hash(rows);freeze(rows);
    const first=create(rows),second=create(JSON.parse(JSON.stringify(rows)));assert.deepEqual(first,second);assert.equal(hash(rows),before);
    const frozen=freeze(structuredClone(first)),r=selected(pack(0,true),{registry:frozen}),other=selected(pack(0,true),{registry:frozen});
    assert.deepEqual(r,other);r.source.edition='Edited result only';assert.notEqual(selected(pack(0,true),{registry:frozen}).source.edition,r.source.edition);
    first.mappings[0].source.edition='Edited constructed copy';assert.equal(hash(rows),before);assert.deepEqual(create(rows),second);
});
for(const versions of [undefined,[],mappings]) test(`simultaneous registry/versions is unresolved even with ${versions===undefined?'undefined':versions.length} versions`,()=>{
    const r=selected(pack(),{registry,versions});assert.equal(r.status,'unresolved');assert.ok(r.issues.includes('registry-and-versions-conflict'));
    const p=inspect(pack(),pack(1),{versions});assert.equal(p.relationship.status,'unresolved');assert.ok(p.contextIssues.some(x=>x.reason==='registry-and-versions-conflict'));
});
test('registry option getters and inherited options are rejected without invocation or exact-mode fallback',()=>{
    let calls=0;const options={};Object.defineProperty(options,'registry',{enumerable:true,get(){calls++;throw Error();}});
    assert.equal(selected(pack(),options).status,'unresolved');assert.equal(effective(pack(),options).selection.status,'unresolved');
    const request={actor:actor(),current:pack(),candidate:pack(1)};Object.defineProperty(request,'registry',{enumerable:true,get(){calls++;throw Error();}});
    assert.equal(preview(request).relationship.status,'unresolved');assert.equal(calls,0);
    assert.equal(selected(pack(),Object.create({registry})).status,'unresolved');
});
for(const kind of ['array','function','class']) test(`new registry option container ${kind} must not activate exact-mode fallback or nonserialized options`,()=>{
    const options=kind==='array'?[]:kind==='function'?function(){}:new(class Options{})();options.registry=registry;
    if(kind!=='class')options.versions=mappings;
    const result=selected(pack(),options);assert.equal(result.status,'unresolved');assert.ok(result.issues.some(x=>x.startsWith('registry-')));
});
for(const [left,right] of [[pack(0),pack(0,true)],[pack(0,true),pack(0)],[owned(1,true,true),pack(1)],[owned(1,false,false),pack(1,true)]]) test(`typed/legacy same-version preview ${left.uuid} / ${right.uuid} is same-selection with raw snapshots`,()=>{
    const options={actor:actor(),current:left,candidate:right,registry},before=hash(options);freeze(options);
    const p=preview(options);assert.equal(p.relationship.status,'same-selection');assert.deepEqual(p.current.snapshot,left);assert.deepEqual(p.candidate.snapshot,right);
    assert.deepEqual(p.current.attribution.identity.mappingUuid,selected(left,{registry}).identity.mappingUuid);
    assert.equal(p.contextIssues.length,0);assert.equal(hash(options),before);
});
for(const rank of [2,6]) test(`actual core/May preview preserves independent unmet/unverifiable prerequisites at rank ${rank}`,()=>{
    const current=owned(0,true,true),candidate=pack(1,true),options={actor:actor(rank,[current]),current,candidate,registry};
    const before=hash(options);freeze(options);const p=preview(options);
    assert.equal(p.relationship.status,'alternate-versions');assert.equal(p.prerequisites.report.advisory,true);
    assert.deepEqual(p.prerequisites.report.rawRequirements,['Breadth of Knowledge','Master General Education']);
    assert.equal(p.prerequisites.report.unmet.length,rank===2?1:0);assert.equal(p.prerequisites.report.unverifiable.length,1);
    assert.equal(p.prerequisites.report.unverifiable[0].raw,'Breadth of Knowledge');
    assert.equal(p.update,undefined);assert.equal(p.allowed,undefined);assert.equal(hash(options),before);
});
test('same-selection canonical matching retains custom system differences and both original snapshots',()=>{
    const current=owned(0,true,true);current.system.effect='Custom same-version effect';current.system.useCount=1;
    current.flags.user={note:'Preserve same-selection customization'};
    const options={actor:actor(2,[current]),current,candidate:pack(0),registry},before=hash(options);freeze(options);
    const p=preview(options);assert.equal(p.relationship.status,'same-selection');assert.equal(p.differences.status,'complete');
    assert.ok(p.differences.changes.some(x=>x.path.join('.')==='system.effect'&&x.before.value==='Custom same-version effect'&&x.after.value===bundle.items[0].item.system.effect));
    assert.ok(p.differences.changes.some(x=>x.path.join('.')==='system.useCount'&&x.before.value===1&&x.after.present===false));
    assert.deepEqual(p.current.snapshot,current);assert.deepEqual(p.candidate.snapshot,options.candidate);
    assert.equal(p.update,undefined);assert.equal(hash(options),before);
});
for(const name of ['Echoes of the Future','Saved custom name']) test(`effective/preview keeps custom effects, counters, grants and repeated selections for ${name}`,()=>{
    const current=owned(1,false,true);current.name=name;current.system.effect='Custom saved effect';current.system.useCount=1;current.system.custom={rank:3};
    current.flags.ptu.grantedBy={id:'0000000000008801'};current.flags.ptu.rulesSelections={field:'custom saved Field'};current.flags.user={note:'Preserve'};
    const repeat={...structuredClone(current),_id:'0000000000007702',uuid:'Actor.0000000000007700.Item.0000000000007702'};
    const options={actor:actor(2,[current,repeat]),current,candidate:pack(0),registry,mechanicChoices:{capture:'custom'}},before=hash(options);freeze(options);
    const e=effective(current,{registry,mechanicChoices:options.mechanicChoices});assert.deepEqual(e.system,current.system);
    assert.equal(e.selection.selectedVersion.id,mappings[1].version.id);assert.deepEqual(e.mechanicChoices,options.mechanicChoices);
    const p=preview(options);assert.equal(p.relationship.status,'alternate-versions');assert.deepEqual(p.current.snapshot,current);
    assert.equal(p.mechanics.default,'standard');assert.equal(p.update,undefined);assert.equal(hash(options),before);
    assert.equal(options.actor.items.length,2);assert.equal(current.system.useCount,1);assert.equal(current.flags.ptu.grantedBy.id,'0000000000008801');
});
test('historical inherited Echoes is preserved and unresolved even with the optional registry',()=>{
    const item=JSON.parse(upstream.currentRecords['feats.aJ47Z5z6Az9c8Dy8']);item.uuid='Compendium.ptu.feats.Item.aJ47Z5z6Az9c8Dy8';item.pack='ptu.feats';
    const before=hash(item);assert.equal(selected(item,{registry}).status,'unresolved');assert.equal(hash(item),before);
    assert.equal(item._stats.compendiumSource,'Compendium.ptu.feats.ta6bKIiHCuccjTqU');
});
test('empty explicit registry and omitted registry activate no default content or core replacement',()=>{
    const empty=create([]);assert.equal(empty.status,'ready');assert.equal(selected(pack(1),{registry:empty}).status,'unresolved');
    assert.equal(selected(pack(1)).status,'unresolved');assert.equal(effective(pack(1)).selection.status,'unresolved');
    assert.equal(registry.defaultVersion,undefined);assert.equal(registry.contentApproval,undefined);
});
