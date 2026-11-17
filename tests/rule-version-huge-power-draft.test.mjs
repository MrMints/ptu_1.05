import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateHugePowerVersionDraft} from '../tools/rule-version-huge-power-draft.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const paths=['system.json','template.json','docs/data/ability-source-evidence.json','docs/data/rules-revisions.json',
    'docs/data/source-authority.json','docs/data/references.json','docs/data/record-source-review/abilities-core.json'];
const huge='abilities.oNB76oqVYrjhYd7W',pure='abilities.nuGa21WQ0QD07kQj';
const draft=JSON.parse(read('docs/data/rule-version-huge-power-draft.json'));
const inputs={pilot:read('docs/data/rule-version-pilot.json'),sourceEvidence:Object.fromEntries(paths.map(p=>[p,read(p)])),
    currentRecords:Object.fromEntries([huge,pure].map(id=>[id,read('packs/abilities/_source/'+id.split('.')[1]+'.json')])),
    packPaths:execFileSync('git',['ls-files','--','packs/*/_source/*.json'],{cwd:new URL('../',import.meta.url),encoding:'utf8'}).trim().split(/\r?\n/)};
const evidence=JSON.parse(inputs.sourceEvidence['docs/data/ability-source-evidence.json']);
const units=['core:320:ability-line34','feb:5:ability-line83'].map(id=>evidence.sourceDefinitions.find(x=>x.id===id));
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function rejected(label,change,expected){
    test(label,()=>{
        const d=structuredClone(draft),i=structuredClone(inputs),before=digest({draft,inputs});
        change(d,i);
        const suppliedBefore=digest({d,i});
        const issues=validateHugePowerVersionDraft(d,i);
        assert.ok(issues.some(x=>x.includes(expected)),JSON.stringify(issues));
        assert.equal(digest({d,i}),suppliedBefore);
        assert.equal(digest({draft,inputs}),before);
    });
}

test('actual committed two-role Ability draft validates against independent committed inputs',()=>{
    assert.deepEqual(validateHugePowerVersionDraft(draft,inputs),[]);
    const schema=JSON.parse(inputs.sourceEvidence['template.json']);
    const expected=[...new Set([...Object.keys(schema.Item.templates.base),...Object.keys(schema.Item.ability).filter(k=>k!=='templates')])].sort();
    assert.equal(expected.length,13);
    assert.deepEqual(draft.roles.map(x=>x.role),['baseline','revised']);
    for(const row of draft.roles){
        assert.deepEqual(Object.keys(row.item).sort(),['name','system','type']);
        assert.equal(row.item.type,'ability');
        assert.deepEqual(Object.keys(row.item.system).sort(),expected);
        assert.deepEqual(row.item.system.rules,[]);
        assert.deepEqual(row.item.system.schema,{version:null,lastMigration:null});
        assert.equal(row.item.system.enabled,true);
        assert.equal(row.item.system.slug,null);
        assert.equal(row.item.system.tier,'');
        for(const key of ['_id','_key','img','effects','ownership','flags','_stats','automation','useCount'])assert.equal(Object.hasOwn(row.item,key)||Object.hasOwn(row.item.system,key),false);
    }
});

test('complete primary evidence distinguishes core exclusions from February additive and cannot-disable text',()=>{
    assert.equal(units[0].ruleStructure.clauses[0].text,"The Pokemon's Base Attack stat is doubled. This may double any bonuses from Nature or Vitamins, but not bonuses from Trainer Features.");
    assert.equal(units[1].ruleStructure.clauses[0].text,"The user's Base Attack Stat is increased by +5, and by +1 more for every 10 Levels the user has. This Ability cannot be disabled in any way.");
    for(const [index,row] of draft.roles.entries()){
        assert.equal(row.item.system.effect,units[index].ruleStructure.clauses[0].text.replace(/\s+/g,' ').trim());
        assert.equal(row.item.system.frequency,units[index].frequency);
        assert.equal(row.item.system.frequency,'Static');
        assert.equal(row.definitionEvidence.jsonSha256,digest(units[index]));
        assert.equal(row.source.sha256,units[index].source.sha256);
    }
    assert.equal(draft.roles[0].item.system.effect.includes('cannot be disabled'),false);
    assert.equal(draft.roles[1].item.system.effect.includes('doubled'),false);
});

test('date precision, source attribution and explicit unapproved states remain distinct',()=>{
    assert.equal(draft.roles[0].source.publicationDate,null);
    assert.equal(draft.roles[0].source.datePrecision,'unknown');
    assert.equal(draft.roles[1].source.publicationDate,'2016-02');
    assert.equal(draft.roles[1].source.datePrecision,'month');
    assert.equal(draft.roles[1].source.status,'optional-playtest');
    assert.equal(draft.roles[0].item.system.source.value,'PTU 1.05 supplied core — p.320');
    assert.equal(draft.roles[1].item.system.source.value,'February 2016 playtest — p.5');
    for(const row of [draft,...draft.roles]){
        assert.equal(row.productionMapping,null);assert.equal(row.generationEligibility,'unclassified');
        assert.deepEqual(row.approvals,{production:false,behavioralVerification:'not-run',implemented:false,automation:false});
    }
});

test('five proposed identities preserve both inherited records and separate Pure Power',()=>{
    const all=draft.roles.flatMap(x=>[x.proposedIdentity.itemId,x.proposedIdentity.versionId]);all.push(draft.roles[0].proposedIdentity.canonicalId);
    assert.equal(new Set(all).size,5);
    assert.equal(draft.roles[0].proposedIdentity.canonicalId,draft.roles[1].proposedIdentity.canonicalId);
    const existing=new Set(inputs.packPaths.map(p=>p.split('/').at(-1).slice(0,-5)));
    for(const id of all){assert.match(id,/^[A-Za-z0-9]{16}$/);assert.equal(existing.has(id),false);assert.equal(draft.identityAllocation.explicitExclusions.includes(id),false);}
    assert.equal(JSON.parse(inputs.currentRecords[huge])._id,'oNB76oqVYrjhYd7W');
    assert.equal(JSON.parse(inputs.currentRecords[pure])._id,'nuGa21WQ0QD07kQj');
    assert.equal(draft.negativeControl.identity,pure);assert.equal(draft.negativeControl.canonicalMerge,false);
    assert.equal(draft.negativeControl.proposalCase,false);
    assert.equal(draft.negativeControl.coreDefinitionId,'core:327:ability-line18');
    const control=evidence.sourceDefinitions.find(x=>x.id===draft.negativeControl.coreDefinitionId);
    assert.equal(draft.negativeControl.coreDefinitionJsonSha256,digest(control));
    assert.notEqual(control.id,units[0].id);
});

test('every authored value has an independently bound source or genuine schema disposition',()=>{
    const schema=JSON.parse(inputs.sourceEvidence['template.json']);
    for(const [index,row] of draft.roles.entries()){
        assert.equal(row.fieldDecisions.length,15);
        const byTarget=Object.fromEntries(row.fieldDecisions.map(x=>[x.target,x]));
        assert.deepEqual(byTarget['system.effect'].sourcePointers,['/ruleStructure/clauses/0/text']);
        assert.deepEqual(byTarget['system.effect'].sourceValueJsonSha256,[digest(units[index].ruleStructure.clauses[0].text)]);
        assert.equal(byTarget['system.frequency'].sourceValueJsonSha256[0],digest(units[index].frequency));
        for(const field of ['origin','snippet','rules','enabled','slug','schema','referenceEffect','stackSlugs','keywords']){
            assert.deepEqual(row.item.system[field],schema.Item.templates.base[field]);
            assert.equal(byTarget['system.'+field].basis,'neutral-schema-default');
        }
        assert.equal(byTarget['system.tier'].schemaPointer,'/Item/ability/tier');
    }
});

test('repeated validation and explicitly supported LF/CRLF evidence transport preserve all inputs',()=>{
    const before=digest({draft,inputs});
    assert.deepEqual(validateHugePowerVersionDraft(draft,inputs),[]);
    assert.deepEqual(validateHugePowerVersionDraft(draft,inputs),[]);
    const crlf=structuredClone(inputs);
    for(const p of paths)crlf.sourceEvidence[p]=crlf.sourceEvidence[p].replaceAll('\r\n','\n').replaceAll('\n','\r\n');
    assert.deepEqual(validateHugePowerVersionDraft(draft,crlf),[]);
    assert.equal(digest({draft,inputs}),before);
});

rejected('omit core Trainer Feature exclusion',d=>d.roles[0].item.system.effect="The Pokemon's Base Attack stat is doubled.",'complete-source-or-neutral-fields');
rejected('omit core Nature and Vitamin inclusion',d=>d.roles[0].item.system.effect='Double Base Attack, excluding Trainer Feature bonuses.','complete-source-or-neutral-fields');
rejected('blend February additive rule into core',d=>d.roles[0].item.system.effect=d.roles[1].item.system.effect,'complete-source-or-neutral-fields');
rejected('blend core doubling into February',d=>d.roles[1].item.system.effect=d.roles[0].item.system.effect,'complete-source-or-neutral-fields');
rejected('omit February cannot-disable clause',d=>d.roles[1].item.system.effect=d.roles[1].item.system.effect.split(' This Ability')[0],'complete-source-or-neutral-fields');
rejected('replace cannot-disable clause with Innate',d=>d.roles[1].item.system.effect=d.roles[1].item.system.effect.replace('This Ability cannot be disabled in any way.','Innate.'),'complete-source-or-neutral-fields');
rejected('change February level divisor',d=>d.roles[1].item.system.effect=d.roles[1].item.system.effect.replace('10 Levels','5 Levels'),'complete-source-or-neutral-fields');
rejected('invent a spelling repair',d=>d.roles[0].item.system.effect=d.roles[0].item.system.effect.replace('Pokemon','Pokémon'),'complete-source-or-neutral-fields');
rejected('change Static frequency',d=>d.roles[0].item.system.frequency='At-Will','complete-source-or-neutral-fields');
rejected('omit required tier field',d=>delete d.roles[0].item.system.tier,'complete-source-or-neutral-fields');
rejected('copy undeclared automation even when empty',d=>d.roles[0].item.system.automation=[],'complete-source-or-neutral-fields');
rejected('copy inherited additive executable rule',d=>d.roles[0].item.system.rules=JSON.parse(inputs.currentRecords[huge]).system.rules,'complete-source-or-neutral-fields');
rejected('copy inherited migration stamp',d=>d.roles[1].item.system.schema.version=0.11,'complete-source-or-neutral-fields');
rejected('copy inherited source label',d=>d.roles[1].item.system.source={value:'PTR Compendiums'},'complete-source-or-neutral-fields');
rejected('copy inherited slug',d=>d.roles[0].item.system.slug='huge-power','complete-source-or-neutral-fields');
rejected('invent ability prerequisites',d=>d.roles[0].item.system.prerequisites=[],'complete-source-or-neutral-fields');
rejected('copy ownership',d=>d.roles[0].item.ownership={default:3},'complete-source-or-neutral-fields');
rejected('copy provenance',d=>d.roles[0].item._stats={compendiumSource:'Compendium.ptu.abilities.Item.oNB76oqVYrjhYd7W'},'complete-source-or-neutral-fields');
rejected('introduce selected-version flags',d=>d.roles[0].item.flags={ptu:{selectedVersion:{id:d.roles[0].proposedIdentity.versionId}}},'complete-source-or-neutral-fields');
rejected('place installed ID on draft Item',d=>d.roles[0].item._id=d.roles[0].proposedIdentity.itemId,'complete-source-or-neutral-fields');
rejected('make optional playtest official errata',d=>d.roles[1].source.status='official-errata','source-role');
rejected('invent February publication day',d=>d.roles[1].source.publicationDate='2016-02-01','source-role');
rejected('invent core publication date',d=>d.roles[0].source.publicationDate='2015-01','source-role');
rejected('swap core and February roles',d=>[d.roles[0].source,d.roles[1].source]=[d.roles[1].source,d.roles[0].source],'source-role');
rejected('substitute Pure Power source definition',d=>d.roles[0].definitionEvidence.id='core:327:ability-line18','definition-binding');
rejected('merge Pure Power canonical identity',d=>d.negativeControl.canonicalMerge=true,'pure-power-separate');
rejected('promote Pure Power to proposal case',d=>d.negativeControl.proposalCase=true,'pure-power-separate');
rejected('reuse inherited Huge Power ID',d=>d.roles[0].proposedIdentity.itemId='oNB76oqVYrjhYd7W','identity-collision');
rejected('reuse inherited Pure Power ID',d=>d.roles[1].proposedIdentity.itemId='nuGa21WQ0QD07kQj','identity-collision');
rejected('reuse Echoes proposed ID',d=>d.roles[0].proposedIdentity.itemId='ViZpn17qLA4ACQGa','identity-collision');
rejected('duplicate Item IDs',d=>d.roles[1].proposedIdentity.itemId=d.roles[0].proposedIdentity.itemId,'distinct-pair-identities');
rejected('duplicate version IDs',d=>d.roles[1].proposedIdentity.versionId=d.roles[0].proposedIdentity.versionId,'distinct-pair-identities');
rejected('separate pair canonical IDs',d=>d.roles[1].proposedIdentity.canonicalId='0000000000000001','distinct-pair-identities');
rejected('regenerate an otherwise valid proposed ID',d=>d.roles[0].proposedIdentity.itemId='0000000000000001','identity-proposal-binding');
rejected('use source coordinate as identity',d=>d.roles[0].proposedIdentity.canonicalId='r04-c0046','identity-proposal-binding');
rejected('proposed ID collides with supplied tracked inventory',(d,i)=>i.packPaths.push('packs/abilities/_source/'+d.roles[0].proposedIdentity.itemId+'.json'),'identity-collision');
rejected('duplicate inventory path',(d,i)=>i.packPaths.push(i.packPaths[0]),'inventory-shape');
rejected('missing role',d=>d.roles.pop(),'role-membership');
rejected('extra role',d=>d.roles.push(structuredClone(d.roles[0])),'role-membership');
rejected('omit field disposition',d=>d.roles[0].fieldDecisions.pop(),'field-decision-membership');
rejected('forge source field hash',d=>d.roles[0].fieldDecisions.find(x=>x.target==='system.effect').sourceValueJsonSha256=[],'field-decision');
rejected('forge default disposition',d=>d.roles[0].fieldDecisions.find(x=>x.target==='system.enabled').basis='source-leaf','field-decision');
rejected('stale schema binding',d=>d.schemaEvidence.jsonSha256='0'.repeat(64),'schema-binding');
rejected('stale upstream binding',d=>d.upstream.caseJsonSha256='0'.repeat(64),'upstream-binding');
rejected('stale actual source data',(d,i)=>{const p='docs/data/ability-source-evidence.json',a=JSON.parse(i.sourceEvidence[p]);a.sourceDefinitions.find(x=>x.id===units[1].id).ruleStructure.clauses[0].text='Changed';i.sourceEvidence[p]=JSON.stringify(a);},'protected-input:');
rejected('stale actual current data',(d,i)=>{const a=JSON.parse(i.currentRecords[huge]);a.system.effect='Changed';i.currentRecords[huge]=JSON.stringify(a);},'current-record-binding:');
rejected('stale actual pilot data',(d,i)=>{const p=JSON.parse(i.pilot);p.cases.find(x=>x.caseId==='r04-r0046').type='feat';i.pilot=JSON.stringify(p);},'protected-pilot');
rejected('false production mapping',d=>d.roles[0].productionMapping={documentUuid:'Item.0000000000000001'},'role-approval');
rejected('false eligibility promotion',d=>d.generationEligibility='eligible','unapproved-envelope');
rejected('false production approval',d=>d.approvals.production=true,'unapproved-envelope');
rejected('false behavior approval',d=>d.roles[1].approvals.behavioralVerification='passed','role-approval');
rejected('false automation approval',d=>d.approvals.automation=true,'unapproved-envelope');
rejected('false content implementation',d=>d.roles[0].approvals.implemented=true,'role-approval');
rejected('malformed raw JSON',(d,i)=>i.sourceEvidence['template.json']='{','serialized-input-shape');
rejected('missing input membership',(d,i)=>delete i.sourceEvidence['template.json'],'input-membership');
rejected('malformed role container',d=>d.roles={},'role-membership');
rejected('missing allocation receipt',d=>d.identityAllocation=null,'allocation-receipt');
rejected('falsely claim a second identity set',d=>d.identityAllocation.setsGenerated=2,'allocation-receipt');

test('null and missing containers produce finite issue arrays',()=>{
    assert.deepEqual(validateHugePowerVersionDraft(null,inputs),['draft-shape']);
    assert.deepEqual(validateHugePowerVersionDraft(draft,null),['input-shape']);
    assert.deepEqual(validateHugePowerVersionDraft(draft,{}),['input-shape']);
});
