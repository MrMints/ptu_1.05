import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {compileEchoesAdmission as compile} from '../tools/rule-version-echoes-admission.mjs';
import {ruleVersionMetadataErrors, lookupSelectedRuleVersion, lookupEffectiveRule} from '../src/util/rule-versions.js';
import {previewRuleVersionReplacement} from '../src/util/rule-version-preview.js';
import {diagnosePrerequisites} from '../src/util/prerequisites.js';
import {hash as packHash} from '../tools/pack-sources.mjs';

const root = new URL('../', import.meta.url), read = p => readFileSync(new URL(p, root), 'utf8');
const json = p => JSON.parse(read(p));
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const a = json('docs/data/rule-version-echoes-admission.json'), draft = json('docs/data/rule-version-echoes-draft.json');
const paths = ['system.json', 'docs/data/source-authority.json', 'template.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const ids = ['moves.Y5R5mbVcGq6fwoFj', 'abilities.oNB76oqVYrjhYd7W', 'feats.aJ47Z5z6Az9c8Dy8', 'poke-edges.WkzCUjTOCTI60Uwg', 'abilities.nuGa21WQ0QD07kQj'];
const upstream = {pilot:json('docs/data/rule-version-pilot.json'), revisions:read('docs/data/rules-revisions.json'),
    sourceEvidence:Object.fromEntries(paths.map(p => [p, read(p)])),
    currentRecords:Object.fromEntries(ids.map(id => {const [pack, key] = id.split('.'); return [id, read(`packs/${pack}/_source/${key}.json`)];})),
    contextNote:read('docs/validation/p05-echoes-readiness.md').match(/^> (Researcher[^\r\n]+)$/m)[1],
    iconSha256:createHash('sha256').update(readFileSync(new URL('css/images/icons/feat_icon.png', root))).digest('hex')};
const documents = [];
for (const pack of readdirSync(new URL('packs/',root),{withFileTypes:true})) {
    if(!pack.isDirectory()||!existsSync(new URL(`packs/${pack.name}/_source/`,root)))continue;
    for (const file of readdirSync(new URL(`packs/${pack.name}/_source/`, root)).filter(x => x.endsWith('.json')).sort()) {
        const path = `packs/${pack.name}/_source/${file}`, item = json(path), selected = item.flags?.ptu?.selectedVersion;
        documents.push({path, id:item._id, filenameId:file.slice(0,-5), selectedVersionId:selected == null ? null : typeof selected === 'string' ? selected : selected.id,
            sourceId:item._stats?.compendiumSource ?? item.flags?.core?.sourceId ?? null});
    }
}
documents.sort((x,y) => x.path < y.path ? -1 : x.path > y.path ? 1 : 0);
const inventory = {schemaVersion:1, documents, mappings:[]};
const input = [a, draft, upstream, inventory], raw = input.map(v => JSON.stringify(v));
const run = values => compile(...values.map(v => JSON.stringify(v)));
const successful = compile(...raw);
const bundle = successful.bundle;
function freeze(v) {if (v && typeof v === 'object') {Object.values(v).forEach(freeze); Object.freeze(v);} return v;}
const packView = index => ({...structuredClone(bundle.items[index].item), uuid:bundle.mappings[index].documentUuid, pack:'ptu.feats'});

test('preparation baseline retains neutral historical drafts, absent targets and no installed default mappings', () => {
    assert.equal(draft.status, 'draft-not-production-approved');
    assert.equal(draft.generationEligibility, 'unclassified');
    assert.equal(draft.productionMapping, null);
    assert.equal(hash(draft), 'fd95fa42db9996f073d9dc3eb0274a3310011ab154b85128ca0880a6ff91cc03');
    for (const row of draft.roles) {
        assert.equal(row.item.system.class, ''); assert.equal(row.item.system.notes, '');
        assert.deepEqual(row.approvals, {production:false, behavioralVerification:'not-run', implemented:false, automation:false});
        assert.equal(existsSync(new URL(`packs/feats/_source/${row.proposedIdentity.itemId}.json`, root)), false);
        assert.equal(lookupSelectedRuleVersion({...row.item, uuid:`Compendium.ptu.feats.Item.${row.proposedIdentity.itemId}`}).status, 'unresolved');
    }
    assert.equal(successful.status, 'prepared-not-installed'); assert.deepEqual(successful.issues, []);
    assert.equal(a.contentDecision.consent.response, 'yes'); assert.match(a.contentDecision.validationLimit, /cannot authenticate/);
});

for (const index of [0,1]) test(`${index ? 'May' : 'core'} output independently reproduces complete source facts and only the admitted envelope`, () => {
    const {templates, ...feat} = JSON.parse(upstream.sourceEvidence['template.json']).Item.feat;
    assert.deepEqual(templates, ['base']);
    const defaults = {...JSON.parse(upstream.sourceEvidence['template.json']).Item.templates.base, ...feat};
    const source = JSON.parse(upstream.sourceEvidence['docs/data/feature-source-evidence.json']);
    const unit = source.sourceDefinitions.find(x => x.id === (index ? 'may:7:feature-line27' : 'core:140:feature-line35'));
    const normalize = s => s.replaceAll('Y ou', 'You').replace(/\s+/g, ' ').trim();
    const expectedId = index ? 'e9dQ3NmVm7EuQBO5' : 'ViZpn17qLA4ACQGa';
    const expectedVersion = index ? 'i1OAz3lvuCRIm3n9' : 'celnYjQjM3jjtAnZ';
    const expected = {name:normalize(unit.heading), type:'feat', system:{...defaults,
        prerequisites:index ? ['Breadth of Knowledge', 'Master General Education'] : ['Master General Education'],
        frequency:'Daily x2 – Free Action', effect:'Trigger: You or your Pokémon make a roll\nEffect: You may roll twice and keep the best result.',
        source:{value:index ? 'May 2015 playtest — p.7' : 'PTU 1.05 supplied core — p.140'}, class:'Researcher', keywords:[], notes:upstream.contextNote},
        _id:expectedId, _key:`!items!${expectedId}`, img:'systems/ptu/css/images/icons/feat_icon.png', effects:[],
        flags:{ptu:{selectedVersion:{id:expectedVersion, label:index ? 'May 2015 playtest (optional)' : 'PTU 1.05 supplied core'}}}};
    const row = bundle.items[index]; assert.deepEqual(row.item, expected);
    assert.equal(normalize(unit.definition.sections[1].text), expected.system.frequency);
    assert.equal(normalize(unit.definition.sections[2].text), 'You or your Pokémon make a roll');
    assert.equal(normalize(unit.definition.sections[3].text), 'You may roll twice and keep the best result.');
    assert.equal(row.targetPath, `packs/feats/_source/${expectedId}.json`);
    assert.equal(row.contentHash, hash(expected)); assert.equal(row.contentHash, packHash(row.item));
    assert.equal(row.contentHash, index ? '98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54' : '1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289');
    const narrowed = structuredClone(row.item);
    for (const key of ['_id','_key','img','effects','flags']) delete narrowed[key];
    narrowed.system.class=''; narrowed.system.notes='';
    assert.deepEqual(narrowed, draft.roles[index].item);
    assert.deepEqual(row.item.system.rules, []); assert.deepEqual(row.item.effects, []);
    assert.deepEqual(Object.keys(row.item.flags.ptu), ['selectedVersion']);
    for (const key of ['ownership','_stats','folder','sort','useCount','automation']) assert.equal(Object.hasOwn(row.item,key),false);
});

test('two exact metadata-v1 mappings and prospective eligibility rows retain source status/date and hash bindings', () => {
    assert.deepEqual(Object.keys(bundle).sort(), ['eligibilityReviews','items','mappings','preparation']);
    assert.equal(bundle.items.length,2); assert.equal(bundle.mappings.length,2); assert.equal(bundle.eligibilityReviews.length,2);
    assert.equal(new Set(bundle.mappings.map(x=>x.documentUuid)).size,2);
    for (const [i,m] of bundle.mappings.entries()) {
        assert.deepEqual(ruleVersionMetadataErrors(m),[]); assert.equal(m.schemaVersion,1); assert.equal(m.type,'feat');
        assert.equal(m.documentUuid,`Compendium.ptu.feats.Item.${bundle.items[i].item._id}`);
        assert.equal(m.version.kind,i?'revised':'original'); assert.equal(m.canonical.id,'UKk9BnAZtm1xMoRB');
        assert.equal(m.source.status,i?'optional-playtest':'core'); assert.equal(m.source.publicationDate,i?'2015-05':null);
        assert.equal(m.source.edition,draft.roles[i].source.edition); assert.equal(m.generationEligibility,'eligible');
        assert.ok(m.canonical.evidence.includes(draft.roles[i].definitionEvidence.jsonSha256));
        const review=bundle.eligibilityReviews[i]; assert.equal(review.contentHash,packHash(bundle.items[i].item));
        assert.equal(review.identity,`feats.${bundle.items[i].item._id}`); assert.equal(review.ruleVersionApproval,'approved');
        assert.equal(review.verification,'not-run'); assert.equal(review.generationEligibility,'eligible');
        assert.deepEqual(review.sourceReferences,[{path:draft.roles[i].source.path,sha256:draft.roles[i].source.sha256,pages:draft.roles[i].source.pdfPages}]);
    }
    assert.equal(bundle.preparation.installation,false); assert.equal(bundle.preparation.automation,false);
    assert.equal(bundle.preparation.behavioralVerification,'not-run'); assert.equal(bundle.preparation.defaultVersionId,'celnYjQjM3jjtAnZ');
    assert.deepEqual(bundle.preparation.optionalVersionIds,['i1OAz3lvuCRIm3n9']);
    assert.ok(bundle.preparation.integrationRequirements.includes('production-registry-and-legacy-UUID-adapter'));
});

test('four serialized inputs round trip, remain frozen/unchanged and return deterministic detached bundles', () => {
    const inputs=structuredClone(input), before=hash(inputs); freeze(inputs);
    const first=run(inputs), second=run(JSON.parse(JSON.stringify(inputs)));
    assert.deepEqual(first,second); assert.deepEqual(first,successful); assert.equal(hash(inputs),before);
    first.bundle.items[0].item.system.effect='Edited output only'; first.bundle.mappings[0].source.status='custom';
    first.bundle.eligibilityReviews[0].contentHash='changed';
    assert.deepEqual(run(inputs),second); assert.equal(hash(inputs),before);
    assert.notEqual(second.bundle.items[0].item.system,second.bundle.items[1].item.system);
});

test('nonserialized/live objects are rejected without calling getters, toJSON or update interfaces', () => {
    let calls=0; const live={get admission(){calls++;throw Error();},toJSON(){calls++;throw Error();},update(){calls++;throw Error();}};
    const result=compile(live,...raw.slice(1)); assert.equal(result.bundle,null); assert.ok(result.issues.includes('input-json:admission'));
    assert.equal(calls,0);
});

for (const index of [0,1,2,3]) for (const value of [undefined, null, '', '{', '[]', 'null']) {
    test(`input ${index}: missing/malformed JSON ${String(value)} blocks the entire pair`, () => {
        const values=[...raw]; values[index]=value; const result=compile(...values);
        assert.equal(result.status,'blocked'); assert.equal(result.bundle,null); assert.ok(result.issues.some(x=>x.startsWith('input-json:')));
    });
}

const mutations = [
    ['content not approved',v=>v[0].contentDecision.content='pending','content-decision'],
    ['consent missing',v=>delete v[0].contentDecision.consent,'consent'],
    ['consent contradicted',v=>v[0].contentDecision.consent.response='no','consent'],
    ['May made compulsory',v=>v[0].contentDecision.mayIndividuallyOptional=false,'content-decision'],
    ['invented installation',v=>v[0].implementation.installation='installed','implementation-separation'],
    ['invented automation',v=>v[0].implementation.automation=true,'implementation-separation'],
    ['Generation9 expansion',v=>v[0].scope='Generations 1–9','admission-status'],
    ['stale baseline',v=>v[0].baseline='0'.repeat(40),'baseline'],
    ['missing hash method',v=>delete v[0].hashMethods,'hash-methods'],
    ['extra admission mapping',v=>v[0].mappings=[],'admission-envelope'],
    ['changed core ID',v=>v[0].identities[0].itemId='0000000000000011','exact-approved-identities'],
    ['duplicate version identity',v=>v[0].identities[1].versionId=v[0].identities[0].versionId,'exact-approved-identities'],
    ['third role/alias',v=>v[0].identities.push(v[0].identities[0]),'exact-approved-identities'],
    ['false official errata label',v=>v[0].sourceDefinitions[1].source.status='official-errata','source-definition'],
    ['invented publication date',v=>v[0].sourceDefinitions[0].source.publicationDate='2015-01-01','source-definition'],
    ['context altered',v=>v[0].presentation.notes+=' Automatic grant.','approved-presentation'],
    ['parent context altered',v=>v[0].parentContext.executableGrants=true,'parent-context'],
    ['Researcher class changed',v=>v[0].presentation.class='Class','approved-presentation'],
    ['invented Branch keyword',v=>v[0].presentation.keywords=['Branch'],'approved-presentation'],
    ['icon stale',v=>v[2].iconSha256='0'.repeat(64),'icon-binding'],
    ['core effect altered',v=>v[1].roles[0].item.system.effect='Roll three times','accepted-draft'],
    ['May prerequisite removed',v=>v[1].roles[1].item.system.prerequisites.shift(),'accepted-draft'],
    ['one valid/one invalid role',v=>v[1].roles[1].item.system.prerequisites.push('Researcher'),'complete-source'],
    ['missing draft role',v=>v[1].roles.pop(),'draft'],
    ['source tampered',v=>v[2].sourceEvidence['docs/data/feature-source-evidence.json']=v[2].sourceEvidence['docs/data/feature-source-evidence.json'].replace('Daily x2','Daily x3'),'upstream'],
    ['source missing',v=>delete v[2].sourceEvidence['template.json'],'serialized-evidence-shape'],
    ['pilot stale',v=>v[2].pilot.scope='Generations 1–9','upstream'],
    ['current inherited record tampered',v=>v[2].currentRecords['feats.aJ47Z5z6Az9c8Dy8']='{}','upstream'],
    ['historical inventory filtered',v=>v[0].historicalInventory.ids.pop(),'collision-inventory-binding'],
    ['current inventory filtered',v=>v[3].documents.pop(),'current-repository-inventory-binding'],
    ['inventory malformed',v=>v[3].documents=null,'current-repository-inventory-binding'],
    ['live collision clearance asserted',v=>v[0].repositoryInventory.liveCampaignClearance=true,'current-repository-inventory-binding'],
    ['duplicate current path',v=>v[3].documents.push(v[3].documents[0]),'repository-duplicate-path']
];
for(const [label,change,expected] of mutations) test(`reject ${label} with no partial bundle`,()=>{
    const values=structuredClone(input);change(values);const result=run(values);
    assert.equal(result.status,'blocked');assert.equal(result.bundle,null);assert.ok(result.issues.some(x=>x.includes(expected)),JSON.stringify(result.issues));
});

for(const id of ['ViZpn17qLA4ACQGa','e9dQ3NmVm7EuQBO5','UKk9BnAZtm1xMoRB','celnYjQjM3jjtAnZ','i1OAz3lvuCRIm3n9']) {
    test(`current repository collision with approved identity ${id} is retained and rejected`,()=>{
        const values=structuredClone(input);values[3].documents.push({path:`packs/feats/_source/${id}.json`,id,filenameId:id,selectedVersionId:null,sourceId:null});
        const before=hash(values);const result=run(values);assert.equal(result.bundle,null);assert.ok(result.issues.includes(`repository-identity-collision:${id}`));assert.equal(hash(values),before);
    });
}
test('duplicate supplied mappings and aliases block instead of generating competing mapping records',()=>{
    const values=structuredClone(input);values[3].mappings=[bundle.mappings[0],{...bundle.mappings[0],documentUuid:bundle.mappings[0].documentUuid.replace('.Item.','.')}];
    const result=run(values);assert.equal(result.bundle,null);assert.ok(result.issues.includes('repository-duplicate-mapping'));
});

test('an unlisted pack collision is not removed by manifest or generation filters',()=>{
    const values=structuredClone(input),id='ViZpn17qLA4ACQGa';
    values[3].documents.push({path:`packs/unlisted-pack/_source/${id}.json`,id,filenameId:id,selectedVersionId:null,sourceId:null});
    const before=hash(values),result=run(values);assert.equal(result.bundle,null);
    assert.ok(result.issues.includes(`repository-identity-collision:${id}`));assert.equal(hash(values),before);
});

test('actual typed pack lookup resolves both generated versions, while unadapted legacy UUIDs remain explicit unresolved boundaries',()=>{
    for(const i of [0,1]) {
        const item=packView(i), before=hash(item), result=lookupSelectedRuleVersion(item,{versions:bundle.mappings});
        assert.equal(result.status,'resolved');assert.equal(result.canonical.id,'UKk9BnAZtm1xMoRB');
        assert.equal(result.selectedVersion.id,bundle.mappings[i].version.id);assert.equal(hash(item),before);
        const legacy={...item,uuid:item.uuid.replace('.Item.','.')};const unresolved=lookupSelectedRuleVersion(legacy,{versions:bundle.mappings});
        assert.equal(unresolved.status,'unresolved');assert.ok(unresolved.issues.includes('document-mapping-unestablished'));
    }
});

for(const rank of [2,6]) test(`actual advisory prerequisites at General Education rank${rank} retain unknown Breadth without acquisition decisions`,()=>{
    const actor={system:{skills:{generalEd:{value:{total:rank}}}},items:[]},before=hash(actor);
    for(const i of [0,1]) {
        const report=diagnosePrerequisites({actor,item:packView(i),selectedVersion:bundle.mappings[i].version});
        assert.equal(report.advisory,true);assert.equal(report.unmet.length,rank===2?1:0);assert.equal(report.unverifiable.length,i?1:0);
        assert.deepEqual(report.rawRequirements,bundle.items[i].item.system.prerequisites);
        if(i)assert.equal(report.unverifiable[0].raw,'Breadth of Knowledge');
        for(const key of ['allowed','canAcquire','grants','acquisitionDecision'])assert.equal(Object.hasOwn(report,key),false);
    }
    assert.equal(hash(actor),before);
});

for(const name of ['Echoes of the Future','Custom renamed Echoes']) test(`actual effective/preview composition preserves owned state for ${name}`,()=>{
    const current={...structuredClone(bundle.items[1].item),_id:'0000000000008881',uuid:'Actor.0000000000007777.Item.0000000000008881',name,
        _stats:{compendiumSource:bundle.mappings[1].documentUuid}};
    current.system.useCount=1;current.system.custom={rank:3};current.flags.ptu.grantedBy={id:'0000000000009991'};
    current.flags.ptu.rulesSelections={field:'saved custom selection'};current.flags.user={note:'Keep this'};
    const repeated={...structuredClone(current),_id:'0000000000008882',uuid:'Actor.0000000000007777.Item.0000000000008882'};
    const actor={uuid:'Actor.0000000000007777',system:{skills:{generalEd:{value:{total:2}}}},items:[current,repeated]};
    const options={actor,current,candidate:packView(0),versions:bundle.mappings,mechanicChoices:{capture:'custom'},references:{}};
    const before=hash(options);freeze(options);
    const effective=lookupEffectiveRule(current,{versions:bundle.mappings,mechanicChoices:options.mechanicChoices});
    assert.equal(effective.selection.selectedVersion.id,'i1OAz3lvuCRIm3n9');assert.deepEqual(effective.system,current.system);
    const preview=previewRuleVersionReplacement(options);assert.equal(preview.inspectionOnly,true);assert.equal(preview.relationship.status,'alternate-versions');
    assert.deepEqual(preview.current.snapshot,current);assert.equal(preview.mechanics.default,'standard');
    assert.equal(preview.update,undefined);assert.equal(preview.allowed,undefined);assert.equal(hash(options),before);
    assert.equal(actor.items.length,2);assert.equal(current.system.useCount,1);assert.equal(current.flags.ptu.grantedBy.id,'0000000000009991');
});

test('absent and blank metadata stay distinct without guessed mappings, defaults or mutation',()=>{
    for(const selected of [undefined,'']) {
        const item=packView(1);if(selected===undefined)delete item.flags.ptu.selectedVersion;else item.flags.ptu.selectedVersion=selected;
        const before=hash(item),r=lookupSelectedRuleVersion(item,{versions:bundle.mappings});
        assert.equal(r.status,selected===undefined?'resolved':'unresolved');assert.equal(hash(item),before);
    }
    for(const source of [undefined,'']) {
        const item={...packView(1),uuid:'Actor.0000000000007777.Item.e9dQ3NmVm7EuQBO5'};delete item.pack;
        if(source!==undefined)item._stats={compendiumSource:source};const before=hash(item);
        assert.equal(lookupSelectedRuleVersion(item,{versions:bundle.mappings}).status,'unresolved');assert.equal(hash(item),before);
    }
});

test('actual inherited Echoes snapshots keep historical provenance and custom selections unresolved under the new mappings',()=>{
    const inherited=JSON.parse(upstream.currentRecords['feats.aJ47Z5z6Az9c8Dy8']);
    assert.equal(inherited._stats.compendiumSource,'Compendium.ptu.feats.ta6bKIiHCuccjTqU');
    for(const name of [inherited.name,'Renamed saved historical Echoes']) {
        const current={...structuredClone(inherited),_id:'0000000000005551',uuid:'Actor.0000000000005550.Item.0000000000005551',name};
        current.system.useCount=1;current.flags.ptu.selectedVersion={id:'custom-saved-version',label:'Preserve my selection'};
        current.flags.ptu.grantedBy={id:'0000000000005552'};current.flags.user={notes:'Keep custom history'};
        const actor={system:{skills:{generalEd:{value:{total:2}}}},items:[current]};
        const options={actor,current,candidate:packView(1),versions:bundle.mappings,mechanicChoices:{},references:{}};
        const before=hash(options);freeze(options);
        const effective=lookupEffectiveRule(current,{versions:bundle.mappings});
        assert.equal(effective.selection.status,'unresolved');assert.ok(effective.selection.issues.includes('document-mapping-unestablished'));
        assert.deepEqual(effective.system,current.system);assert.deepEqual(effective.selection.storedSelection,current.flags.ptu.selectedVersion);
        const preview=previewRuleVersionReplacement(options);assert.equal(preview.relationship.status,'unresolved');
        assert.equal(preview.candidate.attribution.status,'resolved');assert.deepEqual(preview.current.snapshot,current);
        assert.equal(preview.update,undefined);assert.equal(hash(options),before);assert.equal(current.system.useCount,1);
        assert.equal(current._stats.compendiumSource,'Compendium.ptu.feats.ta6bKIiHCuccjTqU');
    }
});

test('read-only CLI succeeds under Node filesystem write denial and leaves prospective targets absent',()=>{
    const permission=process.allowedNodeEnvironmentFlags.has('--permission')?'--permission':'--experimental-permission';
    const output=execFileSync(process.execPath,[permission,'--allow-fs-read=*','tools/rule-version-echoes-admission.mjs'],{cwd:fileURLToPath(root),encoding:'utf8'});
    const result=JSON.parse(output);assert.equal(result.status,'prepared-not-installed');assert.deepEqual(result.issues,[]);
    assert.equal(result.targets.length,2);assert.equal(result.bundleJsonSha256,hash(bundle));
    assert.equal(result.preparation.installation,false);
    for(const row of bundle.items)assert.equal(existsSync(new URL(row.targetPath,root)),false);
});
