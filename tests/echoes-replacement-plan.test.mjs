import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {compileEchoesAdmission} from '../tools/rule-version-echoes-admission.mjs';
import {planEchoesReplacement as inspect} from '../src/util/echoes-replacement-plan.js';

// Repository-only assembly, independently invoking the actual accepted compiler once. Never import
// another test suite, write a fixture, read an original PDF, or claim that prepared Items are installed.
const root = new URL('../',import.meta.url), read = p => readFileSync(new URL(p,root),'utf8');
const json = p => JSON.parse(read(p)), copy = v => structuredClone(v);
const sha = s => createHash('sha256').update(s,'utf8').digest('hex');
const J = v => sha(JSON.stringify(v));
const C = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v)
    ? `[${v.map(C).join(',')}]` : `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${C(v[k])}`).join(',')}}`;
const H = v => sha(C(v));
const paths = ['system.json','docs/data/source-authority.json','template.json',
    ...['ability','move','feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core','moves-anchored','features-core','pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const ids = ['moves.Y5R5mbVcGq6fwoFj','abilities.oNB76oqVYrjhYd7W','feats.aJ47Z5z6Az9c8Dy8','poke-edges.WkzCUjTOCTI60Uwg','abilities.nuGa21WQ0QD07kQj'];
const upstream = {pilot:json('docs/data/rule-version-pilot.json'),revisions:read('docs/data/rules-revisions.json'),
    sourceEvidence:Object.fromEntries(paths.map(p => [p,read(p)])),
    currentRecords:Object.fromEntries(ids.map(id => {const [p,k] = id.split('.'); return [id,read(`packs/${p}/_source/${k}.json`)];})),
    contextNote:read('docs/validation/p05-echoes-readiness.md').match(/^> (Researcher[^\r\n]+)$/m)[1],
    iconSha256:createHash('sha256').update(readFileSync(new URL('css/images/icons/feat_icon.png',root))).digest('hex')};
const documents = [];
for (const pack of readdirSync(new URL('packs/',root),{withFileTypes:true})) {
    if (!pack.isDirectory() || !existsSync(new URL(`packs/${pack.name}/_source/`,root))) continue;
    for (const file of readdirSync(new URL(`packs/${pack.name}/_source/`,root)).filter(f => f.endsWith('.json')).sort()) {
        const path = `packs/${pack.name}/_source/${file}`, i = json(path), s = i.flags?.ptu?.selectedVersion;
        documents.push({path,id:i._id,filenameId:file.slice(0,-5),selectedVersionId:s == null ? null : typeof s === 'string' ? s : s.id,
            sourceId:i._stats?.compendiumSource ?? i.flags?.core?.sourceId ?? null});
    }
}
documents.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const compiled = compileEchoesAdmission(read('docs/data/rule-version-echoes-admission.json'),read('docs/data/rule-version-echoes-draft.json'),
    JSON.stringify(upstream),JSON.stringify({schemaVersion:1,documents,mappings:[]}));
assert.equal(compiled.status,'prepared-not-installed',JSON.stringify(compiled.issues));
const {items,mappings} = compiled.bundle;
const pins = ['1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289','98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54'];
const expected = [
    ['ViZpn17qLA4ACQGa','celnYjQjM3jjtAnZ','PTU 1.05 supplied core','original','r04-s12','PTU 1.05 supplied core','core',null,
        'Core System/Pokemon Tabletop United 1.05 Core.pdf',140,'core:140:feature-line35','f126c984f96400ae0c953d2d112e4f5999e25eb23f3af851297f00870be82d80'],
    ['e9dQ3NmVm7EuQBO5','i1OAz3lvuCRIm3n9','May 2015 playtest (optional)','revised','r04-s02','May 2015 playtest','optional-playtest','2015-05',
        'Core System/1.05 Errata/PTU May 2015 Playtest Packet.pdf',7,'may:7:feature-line27','c5a578cd887346c246030350b3ee93e2bab83c5c94dc824e813c15e62c566e89']
];
// Assert ALL metadata and complete Item pins BEFORE constructing any owned positive fixture.
for (const [n,[itemId,versionId,label,kind,authority,edition,status,date,path,page,definition,evidence]] of expected.entries()) {
    assert.equal(items[n].item._id,itemId); assert.equal(J(items[n].item),pins[n]); assert.equal(items[n].contentHash,pins[n]);
    assert.deepEqual(mappings[n],{schemaVersion:1,documentUuid:`Compendium.ptu.feats.Item.${itemId}`,type:'feat',generationEligibility:'eligible',
        version:{id:versionId,label,kind},canonical:{id:'UKk9BnAZtm1xMoRB',evidence:`Owner-approved complete core140/May7 Echoes pair; ${definition}; ${evidence}; separate Researcher parent context.`},
        source:{id:authority,edition,status,publicationDate:date,citation:`${path}, printed/PDF p.${page}`}});
}
const id = n => String(n).padStart(16,'0'), actorId = id(400), itemId = id(501), actorUuid = `Actor.${actorId}`;
const present = v => ({state:'present',valueJson:JSON.stringify(v)}), absent = () => ({state:'absent'});
const picked = {leaf:'replace-reviewed',automation:'preserve-reviewed',grants:'preserve-reviewed',otherInstances:'preserve-all',
    presentation:'preserve',legacy:'preserve-raw',usage:'preserve-raw'};
function owned(n=0, key=itemId) {
    const v = copy(items[n].item); v._id=key; delete v._key;
    v._stats={compendiumSource:mappings[n].documentUuid,createdTime:123,modifiedTime:456,exportSource:{uuid:'public-fixture'}};
    return v;
}
function base(n=0,type='character') {
    const v=owned(n), uuid=`${actorUuid}.Item.${v._id}`;
    return {schemaVersion:1,kind:'ptu-echoes-replacement-request',selection:{actorId,actorUuid,itemId,itemUuid:uuid,targetRole:n ? 'core' : 'may'},
        before:{actor:{id:actorId,uuid:actorUuid,type,pack:present(null),tokenAncestor:absent()},
            membership:{coverage:'all-items',entries:[{id:itemId,uuid,type:'feat'}]},
            items:[{id:itemId,uuid,type:'feat',coverage:'complete-source',source:present(v)}],lifecycle:{state:'reported-unattempted',relatedIntent:null}},
        approved:{core:{itemJson:JSON.stringify(items[0].item),mapping:copy(mappings[0])},may:{itemJson:JSON.stringify(items[1].item),mapping:copy(mappings[1])}},
        context:{prerequisiteActor:present({_id:actorId,uuid:actorUuid,type,system:{skills:{generalEd:{value:{total:2}}}},items:[{...copy(v),uuid}]}),
            mechanicChoices:present({}),references:present({})},history:absent(),
        review:{action:'inspect',expectedSeal:null,resumeIntent:null,choices:{...picked,leaf:'unreviewed',automation:'unreviewed',grants:'unreviewed',otherInstances:'unreviewed'},acknowledgements:[]}};
}
const run = r => inspect(JSON.stringify(r));
function mutate(r,fn,index=0) {
    const row=r.before.items[index], v=JSON.parse(row.source.valueJson); fn(v); row.source=present(v);
    const a=JSON.parse(r.context.prerequisiteActor.valueJson);
    const existing=a.items.findIndex(x=>x._id===row.id);
    if(existing>=0) a.items[existing]={...copy(v),uuid:row.uuid};
    r.context.prerequisiteActor=present(a); return r;
}
function ready(r=base()) {
    r.review={action:'inspect',expectedSeal:null,resumeIntent:null,choices:copy(picked),acknowledgements:[]};
    const checked=run(r); assert.ok(checked.bindings,JSON.stringify(checked));
    r.review.action='request-plan'; r.review.expectedSeal=checked.bindings.inspectionSeal;
    r.review.acknowledgements=checked.bindings.requiredAcknowledgements.map(code=>({code,reviewSeal:checked.bindings.inspectionSeal}));
    return {r,report:run(r),checked};
}
const codes = r => r.issues.map(i=>i.code);
function expectStatus(r,status,code) {const v=run(r); assert.equal(v.status,status,JSON.stringify(v)); if(code) assert.ok(codes(v).includes(code),JSON.stringify(v.issues)); if(status!=='conditional-plan') assert.equal(v.historyIntent,null); return v;}
function add(r,n=502,type='feat') {
    const key=id(n), uuid=`${actorUuid}.Item.${key}`, v=owned(0,key); v.type=type;
    r.before.membership.entries.push({id:key,uuid,type});
    r.before.items.push({id:key,uuid,type,coverage:'complete-source',source:present(v)}); return key;
}
function withHistory(r,ledger) {r.history=present(ledger); mutate(r,v=>{v.flags.ptu.ruleVersionHistory=copy(ledger);}); return r;}
function ledgerOf(count) {
    const template=ready().report.historyIntent.entry, ledger={schemaVersion:1,canonicalId:'UKk9BnAZtm1xMoRB',entries:[]};
    for(let n=1;n<=count;n++) {const e=copy(template);e.sequence=n;e.bindings.historyBefore=H(ledger);delete e.operationId;e.operationId=H(e);ledger.entries.push(e);}
    return ledger;
}

test('actual compiler fixture pins and full metadata survive independently constructed production admission',()=>{
    const r=run(base());assert.equal(r.status,'review-required');assert.deepEqual(r.bindings.approved,{core:pins[0],may:pins[1]});
    assert.equal(r.attribution.currentRole,'core');assert.equal(r.attribution.candidateInstallation,'not-established');
});
for(const n of [0,1]) for(const type of ['character','pokemon']) test(`inspect, choose/reinspect, acknowledge, conditional ${n} ${type}`,()=>{
    const r=base(n,type), first=run(r);assert.equal(first.historyIntent,null);
    const {report,checked}=ready(r);assert.equal(report.status,'conditional-plan',JSON.stringify(report.issues));
    assert.notEqual(first.bindings.inspectionSeal,checked.bindings.inspectionSeal);
    assert.equal(report.historyIntent.entry.from.role,n?'may':'core');assert.equal(report.historyIntent.entry.to.role,n?'core':'may');
    assert.equal(report.historyIntent.entry.to.definitionSha256,pins[n?0:1]);
    assert.equal(report.inspectionOnly,true);assert.ok(report.applicationConditions.every(c=>c.status==='unresolved'));
    const P={domain:'ptu.echoes.inspection.v1',schemaVersion:r.schemaVersion,kind:r.kind,selection:r.selection,before:r.before,
        approved:r.approved,context:r.context,history:r.history,choices:r.review.choices};
    assert.equal(report.bindings.inspectionSeal,H(P));
    const e=copy(report.historyIntent.entry), op=e.operationId;delete e.operationId;assert.equal(op,H(e));
    assert.equal(e.bindings.review,H({domain:'ptu.echoes.intent-review.v1',inspectionSeal:report.bindings.inspectionSeal,
        choices:r.review.choices,acknowledgedCodes:r.review.acknowledgements.map(a=>a.code).sort()}));
});
test('genuine coherent same target including untyped alias is no-change without normalization',()=>{
    for(const n of [0,1]) {const r=base(n);r.selection.targetRole=n?'may':'core';mutate(r,v=>{v._stats.compendiumSource=v._stats.compendiumSource.replace('.Item.','.');});
        const v=expectStatus(r,'no-change');assert.deepEqual(v.fieldDecisions,[]);}
});
test('same-target custom or incomplete selection repairs require separate review',()=>{
    for(const f of [v=>v.system.effect='custom',v=>delete v.flags.ptu.selectedVersion,v=>delete v._stats.compendiumSource]) {
        const r=base();r.selection.targetRole='core';mutate(r,f);expectStatus(r,'review-required');
    }
});
test('unmet and unverifiable prerequisites stay itemized and nonblocking',()=>{
    const v=ready().report;assert.equal(v.status,'conditional-plan');assert.equal(v.prerequisites.report.advisory,true);
    assert.ok(v.prerequisites.report.unmet.length);assert.ok(v.prerequisites.report.unverifiable.length);
    const r=base();r.context.prerequisiteActor={state:'unavailable',reason:'not-supplied'};
    const p=ready(r).report;assert.equal(p.status,'conditional-plan');assert.ok(p.prerequisites.report.unverifiable.length);
    assert.ok(codes(p).includes('advisory-context-unavailable'));
});
test('raw manual/partial/exhausted/unknown usage and presentation never acquire counters or reset decisions',()=>{
    for(const usage of [null,'manual',{remaining:0,maximum:2},{used:1},{state:'unknown'}]) {
        const r=base();mutate(r,v=>{v.name='custom name';v.img='custom image';v.system.notes='private notes canary';v.system.class='custom class';
            v.system.usage=usage;v.system.enabled=false;v.system.free=true;v.system.custom={subchoices:{field:'custom'},usage};
            v.flags.user={private:'secret-flag-canary'};v.flags.ptu.selectedVersion.custom={keep:'selection-private-canary'};v.effects=[{changes:[],label:'custom automation'}];});
        const raw=JSON.stringify(r), p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));
        assert.equal(p.preservationRequirements.usage,'preserve-raw-no-calculation-or-reset');
        assert.deepEqual(p.fieldDecisions.map(d=>d.field),['system.effect','system.prerequisites','system.frequency','system.source.value','active-compendium-provenance','selected-version']);
        const history=JSON.stringify(p.historyIntent);for(const canary of ['private notes canary','secret-flag-canary','selection-private-canary','custom name','custom image']) assert.ok(!history.includes(canary));
        assert.equal(JSON.stringify({...r,review:JSON.parse(raw).review}),raw);
    }
});
test('custom leaf requires explicit replacement acknowledgement and complete four-field decisions',()=>{
    const r=base();mutate(r,v=>{v.system.effect='custom effect';v.system.prerequisites=['custom'];v.system.frequency='manual';v.system.source.extra='keep';});
    const {report,checked}=ready(r);assert.equal(report.status,'conditional-plan');assert.ok(checked.bindings.requiredAcknowledgements.includes('custom-leaf-replacement'));
    r.review.choices.leaf='unreviewed';expectStatus(r,'review-required');
});
test('all other instances, reciprocal references and raw grant actions remain distinct',()=>{
    const r=base(), b=add(r), c=add(r,503,'edge');
    mutate(r,v=>{v.system.grants={[b]:{id:b,action:'delete'}};v.system.subchoices=['keep'];});
    mutate(r,v=>{v.system.grantedBy={id:itemId,action:'detach'};},1);
    mutate(r,v=>{v.system.parent=itemId;},2);
    const p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));
    assert.deepEqual(p.preservationRequirements.otherInstances,[b]);assert.deepEqual(p.preservationRequirements.structuralComponent,[itemId,b,c]);
    assert.ok(p.bindings.requiredAcknowledgements.includes('other-instances-preserved'));
    assert.equal(p.preservationRequirements.grants,'preserve-raw-no-retarget');
    r.review.choices.grants='unreviewed';expectStatus(r,'review-required');
});
test('missing owned Feature or referenced endpoint cannot disappear through membership projection',()=>{
    for(const feature of [true,false]) {const r=base();const b=add(r,502,feature?'feat':'edge');
        if(!feature)mutate(r,v=>{v.system.grants=[b];});r.before.items.pop();
        expectStatus(r,'review-required',feature?'required-source-missing':'referenced-source-missing');}
});
test('exact legacy conflicts and opaque private legacy data are retained with bounded private history bindings',()=>{
    for(const legacy of [mappings[1].documentUuid,{secret:'opaque-legacy-canary'},'private-legacy-canary']) {
        const r=base();mutate(r,v=>{v.flags.core={sourceId:legacy};});const p=ready(r).report;
        assert.equal(p.status,'conditional-plan');assert.equal(p.attribution.currentRole,'core');
        assert.ok(p.bindings.requiredAcknowledgements.includes(typeof legacy==='string'&&legacy===mappings[1].documentUuid?'legacy-conflict-retained':'opaque-legacy-retained'));
        assert.ok(!JSON.stringify(p.historyIntent).includes('legacy-canary'));assert.deepEqual(JSON.parse(r.before.items[0].source.valueJson).flags.core.sourceId,legacy);
    }
});
test('verified absent and null modern provenance permit reviewed legacy-only attribution with different seals',()=>{
    const reports=[];for(const isNull of [false,true]) {const r=base();mutate(r,v=>{if(isNull)v._stats.compendiumSource=null;else delete v._stats.compendiumSource;v.flags.core={sourceId:mappings[0].documentUuid};});
        const p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));assert.ok(p.attribution.legacyOnly);assert.ok(p.bindings.requiredAcknowledgements.includes('legacy-only-current'));reports.push(p);}
    assert.notEqual(reports[0].bindings.inspectionSeal,reports[1].bindings.inspectionSeal);
});
test('malformed/blank/unmapped modern provenance never falls through to a valid legacy alias',()=>{
    for(const modern of ['',false,{},'Compendium.ptu.feats.Item.0000000000000000']) {const r=base();mutate(r,v=>{v._stats.compendiumSource=modern;v.flags.core={sourceId:mappings[0].documentUuid};});const p=expectStatus(r,'review-required');assert.equal(p.attribution.currentRole,null);}
    const r=base();mutate(r,v=>{v._stats=null;v.flags.core={sourceId:mappings[0].documentUuid};});const p=expectStatus(r,'review-required');assert.equal(p.attribution.currentRole,null);
});
test('missing/null selection creation is explicit; unknown, conflicting or private labels cannot be overwritten',()=>{
    for(const nullValue of [false,true]) {const r=base();mutate(r,v=>{if(nullValue)v.flags.ptu.selectedVersion=null;else delete v.flags.ptu.selectedVersion;});const p=ready(r).report;assert.equal(p.status,'conditional-plan');assert.ok(p.bindings.requiredAcknowledgements.includes('selection-created'));}
    for(const selection of ['unknown',{},false,mappings[1].version.id,{id:mappings[0].version.id,label:'private label'}]) {const r=base();mutate(r,v=>{v.flags.ptu.selectedVersion=selection;});expectStatus(r,'review-required','stored-selection-unresolved');}
    const r=base();mutate(r,v=>{v.flags.ptu.selectedVersion=mappings[0].version.id;});assert.equal(ready(r).report.status,'conditional-plan');
});
test('cancel is descriptive and cannot clear uncertain/in-flight/unknown/resume evidence',()=>{
    const r=base();r.review.action='cancel';expectStatus(r,'cancelled');
    for(const state of ['uncertain','in-flight','unknown']) {r.before.lifecycle.state=state;expectStatus(r,'review-required','lifecycle-reconciliation');}
    r.before.lifecycle.state='reported-unattempted';r.review.resumeIntent='a'.repeat(64);expectStatus(r,'review-required','resume-reconciliation');
});
test('Item J accepts whitespace/Unicode spelling but raw strings change inspection H',()=>{
    const r=base(), p=run(r), item=JSON.parse(r.approved.core.itemJson);
    r.approved.core.itemJson=JSON.stringify(item,null,2)+'\n';const spaced=run(r);assert.equal(spaced.status,'review-required');assert.notEqual(spaced.bindings.inspectionSeal,p.bindings.inspectionSeal);
    r.approved.core.itemJson=JSON.stringify(item).replaceAll('—','\\u2014');const escaped=run(r);assert.ok(escaped.bindings);assert.notEqual(escaped.bindings.inspectionSeal,p.bindings.inspectionSeal);
    assert.deepEqual(escaped.bindings.approved,p.bindings.approved);
});
test('Item member reordering, content mutation and metadata claims cannot change accepted pins',()=>{
    for(const f of [r=>{const v=JSON.parse(r.approved.core.itemJson);r.approved.core.itemJson=JSON.stringify(Object.fromEntries(Object.entries(v).reverse()));},
        r=>{const v=JSON.parse(r.approved.may.itemJson);v.system.effect+='!';r.approved.may.itemJson=JSON.stringify(v);},
        r=>r.approved.core.mapping.canonical.evidence+='!',r=>r.approved.may.mapping.source.status='official-errata',
        r=>{r.approved.core.mapping={itemId:items[0].item._id};}]) {const r=base();f(r);expectStatus(r,'refused','approved-definition-or-mapping');}
});
test('actual private hashing code passes standard vectors and Unicode/UTF-16 canonical ordering oracle',()=>{
    // Test-only instrumentation of the unchanged module body: no second runtime, custom module
    // loader, added public export or production backdoor. Normal public API tests use the import above.
    const code=read('src/util/echoes-replacement-plan.js').replace(/^import .*;\r?\n/gm,'').replace('export function planEchoesReplacement','function planEchoesReplacement');
    const actual=runInNewContext(code+'\n;({sha256,canonical});',{}, {timeout:10000});
    for(const [input,expected] of [['','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
        ['abc','ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
        ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq','248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
        ['a'.repeat(1000000),'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0']]) assert.equal(actual.sha256(input),expected);
    for(const s of ['é','e\u0301','😀\u{10000}','z'.repeat(55),'z'.repeat(56),'z'.repeat(64),'z'.repeat(65)]) assert.equal(actual.sha256(s),sha(s));
    const v={'2':2,'10':10,'é':1,'Z':0,'😀':3,'\ue000':4};
    assert.equal(actual.canonical(v),'{"10":10,"2":2,"Z":0,"é":1,"😀":3,"":4}');
    assert.equal(actual.sha256(actual.canonical(v)),H(v));
    const r=base();r.context.mechanicChoices=present(v);const p=run(r);assert.ok(p.bindings);assert.equal(p.bindings.context,H(r.context));
});
test('duplicate decoded keys rejected at outer, mapping, candidate, source, all context and history boundaries',()=>{
    const raw=JSON.stringify(base());assert.equal(inspect(raw.replace('"schemaVersion":1','"schemaVersion":1,"schemaVersion":1')).issues[0].code,'duplicate-key');
    assert.equal(inspect(raw.replace('"documentUuid":','"schemaVersion":1,"documentUuid":')).issues[0].code,'duplicate-key');
    for(const slot of ['candidate','source','prerequisiteActor','mechanicChoices','references','history']) {
        const r=base(), text='{"x":1,"\\u0078":2}';
        if(slot==='candidate')r.approved.core.itemJson=text;else if(slot==='source')r.before.items[0].source.valueJson=text;
        else if(slot==='history')r.history={state:'present',valueJson:text};else r.context[slot]={state:'present',valueJson:text};
        expectStatus(r,'refused','duplicate-key');
    }
});
test('unsafe names, BOM, invalid JSON and isolated surrogates refuse without prototype mutation',()=>{
    for(const text of ['{"__proto__":{"polluted":true}}','{"constructor":1}','{"prototype":1}','\ufeff{}','{"s":"\\ud800"}','{"s":"\\udc00"}','{','null true']) {
        const r=base();r.context.references={state:'present',valueJson:text};expectStatus(r,'refused');
    }
    assert.equal({}.polluted,undefined);assert.equal(inspect('\ufeff'+JSON.stringify(base())).status,'refused');
    assert.equal(inspect(JSON.stringify(base()).replace('ptu-echoes','\ud800ptu-echoes')).status,'refused');
});
test('lossy or unsupported snapshot number lexemes require review without a normalization seal',()=>{
    for(const n of ['9007199254740993','9007199254740992','-0','1e0','1.0','1e400','0.10000000000000001','1e-999']) {
        const r=base();r.context.mechanicChoices.valueJson=`{"value":${n}}`;const p=expectStatus(r,'review-required','numeric-representation');assert.equal(p.bindings,null);
    }
    const r=base();r.context.mechanicChoices=present({value:0.5,maximum:9007199254740991});assert.ok(run(r).bindings);
    assert.equal(inspect(JSON.stringify(base()).replace('"schemaVersion":1','"schemaVersion":1.5')).status,'refused');
});
test('request, inner text, scalar, key, depth, node and collection bounds fail finitely',()=>{
    assert.equal(inspect(' '.repeat(1048577)).issues[0].code,'json-byte-limit');
    for(const [slot,length] of [['candidate',65537],['source',262145],['prerequisiteActor',131073],['mechanicChoices',16385],['references',131073],['history',65537]]) {
        const r=base(), text=' '.repeat(length);if(slot==='candidate')r.approved.core.itemJson=text;else if(slot==='source')r.before.items[0].source.valueJson=text;
        else if(slot==='history')r.history={state:'present',valueJson:text};else r.context[slot]={state:'present',valueJson:text};expectStatus(r,'refused','json-byte-limit');
    }
    for(const text of [JSON.stringify({a:'a'.repeat(32769)}),JSON.stringify({['x'.repeat(257)]:0}),'['.repeat(25)+'0'+']'.repeat(25),JSON.stringify(Array(32768).fill(0))]) {
        const r=base();r.context.prerequisiteActor.valueJson=text;expectStatus(r,'refused');
    }
    const r=base();r.before.membership.entries=Array(1025).fill(r.before.membership.entries[0]);expectStatus(r,'refused','membership-coverage-or-limit');
    const s=base();s.before.items=Array(65).fill(s.before.items[0]);expectStatus(s,'refused','source-collection-limit');
});
test('structural graph bounds and malformed coverage/identities cannot be acknowledged away',()=>{
    const r=base();for(let n=502;n<=565;n++){const key=id(n),uuid=`${actorUuid}.Item.${key}`;r.before.membership.entries.push({id:key,uuid,type:'edge'});}
    mutate(r,v=>{v.system.refs=r.before.membership.entries.slice(1).map(m=>m.id);});expectStatus(r,'refused','grant-component-limit');
    const dense=base();const keys=[itemId];for(let n=502;n<=513;n++)keys.push(add(dense,n,'edge'));
    for(let i=0;i<dense.before.items.length;i++)mutate(dense,v=>{v.system.refs=keys;},i);expectStatus(dense,'refused','grant-component-limit');
    for(const f of [r=>r.before.membership.entries.push(r.before.membership.entries[0]),r=>r.before.items[0].coverage='partial',
        r=>r.before.actor.pack=present('ptu.feats'),r=>r.before.actor.tokenAncestor=present('token'),r=>mutate(r,v=>{v._id=id(999);}),r=>mutate(r,v=>{v.toObject={};})]) {
        const r=base();f(r);expectStatus(r,'refused');
    }
});
test('choice/evidence/context/platform metadata changes invalidate old review bindings',()=>{
    for(const f of [r=>r.review.choices.otherInstances='unreviewed',r=>mutate(r,v=>{v._stats.modifiedTime++;}),
        r=>mutate(r,v=>{v.system.notes+=' altered';}),r=>r.context.mechanicChoices=present({custom:'custom'})]) {
        const {r}=ready();f(r);expectStatus(r,'review-required','inspection-seal-mismatch');
    }
    const {r}=ready();mutate(r,v=>{v.system.notes+='changed';});const fresh=copy(r);fresh.review.action='inspect';fresh.review.expectedSeal=null;fresh.review.acknowledgements=[];
    r.review.expectedSeal=run(fresh).bindings.inspectionSeal;expectStatus(r,'review-required','acknowledgement-stale');
});
test('missing, duplicate, unknown, nonapplicable and malformed acknowledgement records',()=>{
    const {r}=ready();r.review.acknowledgements=[];expectStatus(r,'review-required','acknowledgement-missing');
    for(const f of [r=>r.review.acknowledgements.push(r.review.acknowledgements[0]),r=>r.review.acknowledgements[0].code='unknown',
        r=>r.review.acknowledgements[0].reviewSeal='bad',r=>r.review.acknowledgements.push({code:'selection-created',reviewSeal:r.review.expectedSeal}),
        r=>r.review.acknowledgements[0].extra=true]) {const {r}=ready();f(r);expectStatus(r,'refused');}
});
test('acknowledgement order and repeated unattempted requests preserve Q and deterministic IDs',()=>{
    const {r,report}=ready();const original=JSON.stringify(r);r.review.acknowledgements.reverse();const reordered=run(r);
    assert.equal(reordered.status,'conditional-plan');assert.deepEqual(reordered.historyIntent,report.historyIntent);
    assert.deepEqual(inspect(original),report);assert.deepEqual(inspect(original),report);
});
test('existing prefix, append binding, historical privacy and raw history absence remain distinct',()=>{
    const ledger=ledgerOf(2), r=withHistory(base(),ledger), p=ready(r).report;
    assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));assert.equal(p.historyIntent.entry.sequence,3);
    assert.equal(p.historyIntent.expectedPriorBinding,H(ledger));assert.equal(p.historyIntent.entry.bindings.historyBefore,H(ledger));
    const explicit=withHistory(base(),{schemaVersion:1,canonicalId:'UKk9BnAZtm1xMoRB',entries:[]});
    assert.notEqual(ready(explicit).report.bindings.before,ready().report.bindings.before);
    assert.equal(ready(explicit).report.historyIntent.expectedPriorBinding,ready().report.historyIntent.expectedPriorBinding);
});
test('history tampering, wrong prefix, collision, instance, unsafe privacy values and source disagreement refuse',()=>{
    for(const f of [l=>l.entries[0].operationId='a'.repeat(64),l=>l.entries[1].bindings.historyBefore='b'.repeat(64),
        l=>l.entries[1].operationId=l.entries[0].operationId,l=>l.entries[0].instance.itemId=id(999),
        l=>l.entries[0].from.legacy={state:'present',type:'string',value:'private-history-canary'},l=>l.entries[0].extra='private',
        l=>l.entries[0].sequence=2]) {const l=ledgerOf(2);f(l);expectStatus(withHistory(base(),l),'refused');}
    const r=base();r.history=present(ledgerOf(1));expectStatus(r,'refused','history-source-mismatch');
    const l=ledgerOf(1);l.schemaVersion=2;expectStatus(withHistory(base(),l),'review-required','history-version');
});
test('history limits stop earliest without overwrite; no-change does not append to a full valid ledger',()=>{
    const l=ledgerOf(32), r=withHistory(base(),l);const p=ready(r).report;
    assert.equal(p.status,'review-required');assert.ok(codes(p).includes('history-capacity'));assert.equal(p.historyIntent,null);
    r.selection.targetRole='core';r.review={action:'inspect',expectedSeal:null,resumeIntent:null,choices:copy(picked),acknowledgements:[]};expectStatus(r,'no-change');
    const tooMany=ledgerOf(33);expectStatus(withHistory(base(),tooMany),'refused','history-limit');
    const oversized=ledgerOf(1);oversized.entries[0].choices.acknowledgedCodes=Array(200).fill('automation-preservation-reported');
    expectStatus(withHistory(base(),oversized),'refused','history-entry-limit');
});
test('every valid non-null resume requires reconciliation, whether recorded or unknown',()=>{
    const l=ledgerOf(1);for(const resume of [l.entries[0].operationId,'f'.repeat(64)]) {
        const {r}=ready(withHistory(base(),l));r.review.resumeIntent=resume;expectStatus(r,'review-required','resume-reconciliation');
        r.review.action='inspect';r.review.expectedSeal=null;r.review.acknowledgements=[];
        expectStatus(r,'review-required','resume-reconciliation');
    }
});
test('explicit UUID and label byte limits cover independent references and raw snapshot fields',()=>{
    const r=base();r.context.references=present({public:'Compendium.'+'x'.repeat(257)+'.Item.'+itemId});expectStatus(r,'refused','identity-or-label-byte-limit');
    const s=base();mutate(s,v=>{v.flags.ptu.selectedVersion.label='a'.repeat(257);});expectStatus(s,'refused','identity-or-label-byte-limit');
});
test('primitive input boundary cannot invoke supplied code; results are deeply frozen and detached',()=>{
    let calls=0;const executable={toString(){calls++;throw Error('canary');},toJSON(){calls++;}};
    for(const args of [[],[{}],[executable],[JSON.stringify(base()),null],[new String('{}')]]) assert.equal(inspect(...args).status,'refused');
    assert.equal(calls,0);
    const {r,report}=ready(), raw=JSON.stringify(r), second=inspect(raw);
    const check=v=>{if(v&&typeof v==='object'){assert.ok(Object.isFrozen(v));Object.values(v).forEach(check);}assert.notEqual(typeof v,'function');};check(report);
    assert.throws(()=>{report.historyIntent.entry.sequence=99;},TypeError);assert.deepEqual(second,report);
    mutate(r,v=>{v.name='later';});assert.deepEqual(inspect(raw),report);
    assert.deepEqual(Object.keys(report),['schemaVersion','kind','status','inspectionOnly','bindings','attribution','fieldDecisions','preservationRequirements','prerequisites','historyIntent','issues','applicationConditions']);
    for(const k of ['update','updates','apply','callback','permission','allowed','authorized','ledgerAfter']) assert.ok(!Object.hasOwn(report,k));
    assert.ok(!/from ['"]node:|\b(?:fetch|Date|Math\.random|game|canvas)\b/.test(read('src/util/echoes-replacement-plan.js')));
    assert.equal((read('src/util/echoes-replacement-plan.js').match(/export /g)||[]).length,1);
});

// These assertions are first executed against the independently reviewed, unchanged source bytes.
// The reproduction run must fail if a contradictory capture can still produce a conditional intent.
function reviewedClassification(r) {
    const first=run(r);
    return first.bindings ? ready(r).report : first;
}
function assertCaptureStatus(r,expected,code) {
    const report=reviewedClassification(r);
    assert.equal(report.status,expected,`observed=${report.status}; seal=${report.bindings!==null}; intent=${report.historyIntent!==null}`);
    assert.equal(report.historyIntent,null);
    if(code)assert.ok(codes(report).includes(code),JSON.stringify(report.issues));
    return report;
}
for(const location of ['value','dictionary-key','connected-source']) test(`correction: omitted same-Actor endpoint in ${location} requires reconciliation`,()=>{
    const r=base(), missing=`${actorUuid}.Item.${id(599)}`;
    if(location==='connected-source') {
        const key=add(r,502,'edge');mutate(r,v=>{v.system.grants=[`${actorUuid}.Item.${key}`];});
        mutate(r,v=>{v.system.grants=[missing];},1);
    } else mutate(r,v=>{v.system.grants=location==='value'?[missing]:{[missing]:{action:'preserve'}};});
    assertCaptureStatus(r,'review-required','referenced-membership-missing');
});
for(const capture of ['all-identities','id-only']) test(`correction: contradictory prerequisite Actor id in ${capture} is refused`,()=>{
    const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);a.id=id(999);
    if(capture==='id-only'){delete a._id;delete a.uuid;}
    r.context.prerequisiteActor=present(a);assertCaptureStatus(r,'refused','prerequisite-context-identity');
});
test('correction: contextual Item id cannot contradict its _id, UUID and membership',()=>{
    const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);a.items[0].id=id(999);
    r.context.prerequisiteActor=present(a);assertCaptureStatus(r,'refused','prerequisite-context-membership');
});
test('correction: same-Actor UUID endpoints require membership and source without creating either',()=>{
    for(const key of [id(502),id(599)])for(const location of ['value','key'])for(const captured of ['neither','membership-only','source-unavailable']) {
        const r=base(), uuid=`${actorUuid}.Item.${key}`;
        if(captured!=='neither')add(r,Number(key),'edge');
        if(captured==='membership-only')r.before.items.pop();
        if(captured==='source-unavailable')r.before.items.at(-1).source={state:'unavailable',reason:'capture-unavailable'};
        mutate(r,v=>{v.system.grants=location==='value'?[uuid]:{[uuid]:{action:'preserve'}};});
        const before=JSON.stringify(r), report=assertCaptureStatus(r,'review-required');
        assert.ok(codes(report).includes(captured==='neither'?'referenced-membership-missing':captured==='membership-only'?'referenced-source-missing':'complete-source-unavailable'));
        // ready() changes only the explicit review record; no membership/source repair is allowed.
        assert.equal(JSON.stringify({...r,review:JSON.parse(before).review}),before);
    }
});
test('correction: valid self and reciprocal same-Actor UUIDs preserve all other instances',()=>{
    const r=base(), other=add(r), otherUuid=`${actorUuid}.Item.${other}`;
    mutate(r,v=>{v.system.grants=[r.selection.itemUuid,otherUuid];});
    mutate(r,v=>{v.system.grants={[r.selection.itemUuid]:{action:'preserve'}};},1);
    const p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));
    assert.deepEqual(p.preservationRequirements.structuralComponent,[itemId,other]);
    assert.deepEqual(p.preservationRequirements.otherInstances,[other]);
});
test('correction: foreign/compendium UUIDs and unknown bare custom strings remain opaque preserved data',()=>{
    const opaque=[`Actor.${id(888)}.Item.${id(502)}`,`Compendium.ptu.feats.Item.${id(502)}`,id(502),'custom dependency',
        `${actorUuid}.Item.${id(502)}.extra`,`${actorUuid}.Item.bad`];
    const r=base();mutate(r,v=>{v.system.grants=opaque;v.system.custom=Object.fromEntries(opaque.map(k=>[k,'preserve']));});
    const before=JSON.stringify(r), p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));
    assert.deepEqual(p.preservationRequirements.structuralComponent,[itemId]);assert.equal(p.preservationRequirements.structuralEdgeCount,0);
    assert.equal(JSON.stringify({...r,review:JSON.parse(before).review}),before);
});
test('correction: every explicit contextual Actor identity must agree, including partial and malformed identities',()=>{
    for(const [field,value] of [['id',id(999)],['_id',id(999)],['uuid',`Actor.${id(999)}`],['type','pokemon'],['id',null],['uuid',null]]) {
        const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);a[field]=value;
        r.context.prerequisiteActor=present(a);const p=assertCaptureStatus(r,'refused','prerequisite-context-identity');assert.equal(p.bindings,null);
    }
});
test('correction: every contextual Item identity and declared type must agree with one member',()=>{
    for(const [field,value] of [['id',id(999)],['_id',id(999)],['uuid',`${actorUuid}.Item.${id(999)}`],
        ['uuid',`Actor.${id(888)}.Item.${itemId}`],['uuid',mappings[0].documentUuid],['id',null],['uuid',null],['type','edge']]) {
        const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);a.items[0].id=itemId;a.items[0][field]=value;
        r.context.prerequisiteActor=present(a);const p=assertCaptureStatus(r,'refused','prerequisite-context-membership');assert.equal(p.bindings,null);
    }
    const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);
    a.items=[{id:id(999),_id:id(999),uuid:`${actorUuid}.Item.${id(999)}`,type:'feat'}];
    r.context.prerequisiteActor=present(a);assertCaptureStatus(r,'refused','prerequisite-context-membership');
});
test('correction: valid partial Actor and Item facts remain nonblocking diagnostic uncertainty',()=>{
    for(const identity of [{id:itemId},{_id:itemId},{uuid:`${actorUuid}.Item.${itemId}`},{}])for(const wrapped of [false,true]) {
        const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);delete a._id;delete a.uuid;a.id=actorId;
        a.items=wrapped?{contents:[identity]}:[identity];r.context.prerequisiteActor=present(a);
        const p=ready(r).report;assert.equal(p.status,'conditional-plan',JSON.stringify(p.issues));
        assert.ok(p.prerequisites.report.unmet.length);assert.ok(p.prerequisites.report.unverifiable.length);
        if(!Object.hasOwn(identity,'uuid'))assert.ok(codes(p).includes('advisory-context-unavailable'));
    }
    for(const cell of [absent(),present(null),{state:'unavailable',reason:'not-supplied'},{state:'unknown',reason:'unclassified'}]) {
        const r=base();r.context.prerequisiteActor=cell;const p=ready(r).report;
        assert.equal(p.status,'conditional-plan');assert.ok(p.prerequisites.report.unverifiable.length);
    }
});
test('correction: incomplete contextual identities do not become an empty or invented owned collection',()=>{
    const r=base(), a=JSON.parse(r.context.prerequisiteActor.valueJson);a.items=[{id:itemId}];
    r.context.prerequisiteActor=present(a);r.context.references=present({'Breadth of Knowledge':`${actorUuid}.Item.${id(999)}`});
    const p=ready(r).report;assert.equal(p.status,'conditional-plan');
    assert.equal(p.prerequisites.report.requirements.find(x=>x.raw==='Breadth of Knowledge').status,'unverifiable');
    assert.ok(p.prerequisites.report.unmet.some(x=>x.kind==='skill'));assert.equal(JSON.parse(r.context.prerequisiteActor.valueJson).items[0].uuid,undefined);
});
