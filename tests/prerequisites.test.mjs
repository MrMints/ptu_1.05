import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {SKILLS} from '../src/util/skills.js';
import {Mutex} from '../src/util/mutex.js';
import {evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';

const actor = (overrides={}) => ({uuid:'Actor.actor00000000001',system:{level:{current:5},
    skills:Object.fromEntries(Object.keys(SKILLS).map(key=>[key,{value:{total:2}}]))},items:[],...overrides});
const item = (requirements,extra={}) => ({_id:'item000000000001',uuid:'Item.item000000000001',name:'Synthetic diagnostic fixture',type:'feat',
    system:{source:{value:'Explicit synthetic diagnostic fixture'},prerequisites:requirements},...extra});
const report = (requirements,a=actor()) => diagnosePrerequisites({actor:a,item:item(requirements),selectedVersion:{id:'fixture-original',label:'Synthetic original'}});

test('single/multiple/mixed truth states list every deficiency without mutating inputs',()=>{
    const a=actor(), i=item(['Novice Focus','Adept Charm','Level 3','GM Permission','Custom narrative condition']);
    const before=structuredClone({a,i});
    const r=diagnosePrerequisites({actor:a,item:i,selectedVersion:'synthetic original'});
    assert.deepEqual(r.requirements.map(x=>x.status),['unmet','unmet','satisfied','unverifiable','unverifiable']);
    assert.deepEqual(r.unmet.map(x=>[x.skillKey,x.required,x.actual]),[['focus',3,2],['charm',4,2]]);
    const warnings=formatPrerequisiteDiagnostics(r);
    assert.equal(warnings.unmet.length,2); assert.equal(warnings.unknown.length,2);
    assert.match(warnings.unmet[0],/requires 3, current 2/);
    assert.deepEqual({a,i},before);
    assert.deepEqual(r.rawRequirements,i.system.prerequisites);
});

test('all 17 skills and accepted aliases preserve exact keys, spacing, accents and ranks',()=>{
    for(const [key,{name,aliases}] of Object.entries(SKILLS)) for(const text of [key,name,...aliases]) for(const value of [2,3,5]) {
        const a=actor(); a.system.skills[key].value.total=value;
        const raw=`  NoViCe   ${text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll(' ','  ')}  `;
        const r=evaluatePrerequisite(raw,{actor:a});
        assert.equal(r.skillKey,key,raw); assert.equal(r.actual,value); assert.equal(r.required,3);
        assert.equal(r.status,value>=3?'satisfied':'unmet'); assert.equal(r.raw,raw);
    }
    for(const raw of ['Invented Novice Focus','Novice Zoolog','Novice Focus invented']) assert.equal(evaluatePrerequisite(raw,{actor:actor()}).status,'unverifiable');
});

test('OR/list/count logic distinguishes known failure from uncertainty and counts unique skills',()=>{
    const a=actor(); a.system.skills.charm.value.total=3; a.system.skills.techEd.value.total=4;
    const check=(text,status)=>assert.equal(evaluatePrerequisite(text,{actor:a}).status,status,text);
    check('Novice Focus or Charm','satisfied');
    check('Expert Focus or Charm','unmet');
    check('Expert Focus or Custom condition','unverifiable');
    check('Novice Medicine or Technology Edu','satisfied');
    check('Two of Charm or Technology Edu at Novice','satisfied');
    check('Two Skills at Novice','satisfied');
    check('Three Skills at Novice','unmet');
    check('Two of Charm or Charisma at Novice','unmet');
    check('Two of Unknown A or Unknown B at Novice','unverifiable');
    check('Novice Focus, Charm, or Intuition','satisfied');
    check('Adept Tech Edu Rank or higher','satisfied');
    delete a.system.skills.focus;
    check('Three skills at Novice','unverifiable');
});

test('missing/invalid actor fields and unevidenced textual GM approval are unverifiable',()=>{
    for(const a of [undefined,{}, {system:{skills:{focus:{value:{total:null}}}}}, {system:{skills:{focus:{value:{total:'bad'}}}}}]) {
        assert.equal(evaluatePrerequisite('Novice Focus',{actor:a}).status,'unverifiable');
        assert.equal(evaluatePrerequisite('Level 5',{actor:a}).status,'unverifiable');
    }
    assert.equal(evaluatePrerequisite('GM Permission',{actor:{...actor(),isGM:true}}).status,'unverifiable');
    for(const raw of [null,{},42,'']) assert.equal(evaluatePrerequisite(raw,{actor:actor()}).status,'unverifiable');
    assert.equal(diagnosePrerequisites({actor:actor(),item:{}}).unverifiable.length,1);
    assert.equal(evaluatePrerequisite('Novice Focus',{actor:{system:{skills:{focus:{value:{total:0}}}}}}).status,'unverifiable');
});

test('bare commas never guess a logical pass; explicit OR and count-list commas keep their meaning',()=>{
    const a=actor(); a.system.skills.athletics.value.total=4; a.system.skills.combat.value.total=1;
    const raw='Adept Athletics, Novice Combat';
    const ambiguous=evaluatePrerequisite(raw,{actor:a});
    assert.equal(ambiguous.status,'unverifiable'); assert.equal(ambiguous.reason,'ambiguous-comma-compound');
    assert.equal(ambiguous.raw,raw); assert.deepEqual(ambiguous.children.map(c=>c.status),['satisfied','unmet']);
    assert.equal(evaluatePrerequisite('Adept Athletics or Novice Combat',{actor:a}).status,'satisfied');
    const counted=evaluatePrerequisite('Two of Athletics, Combat at Novice',{actor:a});
    assert.equal(counted.status,'unmet'); assert.equal(counted.actual,1); assert.equal(counted.required,2);
    assert.equal(evaluatePrerequisite('Adept Athletics, custom condition',{actor:a}).status,'unverifiable');
    assert.equal(evaluatePrerequisite('Adept Athletics, Novice Combat or Master Focus',{actor:a}).status,'unverifiable');
    assert.equal(evaluatePrerequisite('Novice Athletics, Combat, or Focus',{actor:a}).status,'satisfied');
    const mixed=report([raw,'Novice Combat','GM Permission','Level 1'],a);
    assert.deepEqual(mixed.requirements.map(r=>r.status),['unverifiable','unmet','unverifiable','satisfied']);
});

test('stable references distinguish same-name versions and survive renaming without name guesses',()=>{
    const a=actor(); a.items=[{name:'Renamed by user',_stats:{compendiumSource:'Compendium.ptu.feats.Item.original00000001'}}];
    const refs={Original:{uuid:'Compendium.ptu.feats.Item.original00000001'},Revised:{uuid:'Compendium.ptu.feats.Item.revised000000001'}};
    assert.equal(evaluatePrerequisite('Original',{actor:a,references:refs}).status,'satisfied');
    assert.equal(evaluatePrerequisite('Revised',{actor:a,references:refs}).status,'unmet');
    assert.equal(evaluatePrerequisite('Renamed by user',{actor:a}).status,'unverifiable');
    assert.equal(evaluatePrerequisite('Two of Original or Revised',{actor:a,references:refs}).status,'unmet');
    assert.equal(evaluatePrerequisite('One of Original or Revised',{actor:a,references:refs}).status,'satisfied');
    assert.equal(evaluatePrerequisite('Original',{actor:{system:{}},references:refs}).status,'unverifiable');
    assert.equal(evaluatePrerequisite('Original',{actor:{...a,items:[{_stats:{compendiumSource:refs.Revised.uuid},flags:{core:{sourceId:refs.Original.uuid}}}]},references:refs}).status,'unmet');
});

test('item counts require distinct evidenced identities and never count skill/level spellings as Items',()=>{
    const a=actor(); a.system.skills.focus.value.total=3;
    const first='Compendium.ptu.feats.Item.original00000001', second='Compendium.ptu.feats.Item.revised000000001';
    a.items=[{uuid:first},{uuid:second}];
    const references={Original:first,'Original alias':first,Revised:second};
    for(const raw of ['Two of Novice Focus or Novice Focus Rank','Two of Novice Focus or Novice Willpower','Two of Level 1 or Level 2','Two of Original or Custom condition','Two of Original or Novice Focus']) {
        const r=evaluatePrerequisite(raw,{actor:a,references});
        assert.equal(r.status,'unverifiable',raw); assert.equal(r.reason,'unresolved-item-count-identities'); assert.equal(r.raw,raw);
    }
    const same=evaluatePrerequisite('Two of Original or Original alias',{actor:a,references});
    assert.equal(same.status,'unmet'); assert.equal(same.actual,1); assert.equal(same.children.length,1);
    const distinct=evaluatePrerequisite('Two of Original or Revised',{actor:a,references});
    assert.equal(distinct.status,'satisfied'); assert.equal(distinct.actual,2);
    const skills=evaluatePrerequisite('Two of Focus or Willpower at Novice',{actor:a,references});
    assert.equal(skills.status,'unmet'); assert.equal(skills.actual,1);
});

test('selected item/version provenance, raw requirements and custom data survive repeat reports and JSON reload',()=>{
    const a=actor(); a.system.skills.focus.value.total=3;
    const original=item(['Novice Focus']), revised=item(['Master Focus'],{_id:'item000000000002',uuid:'Item.item000000000002',name:original.name});
    const reports=[original,revised].map((i,n)=>diagnosePrerequisites({actor:a,item:i,selectedVersion:{id:`synthetic-${n}`,label:n?'Synthetic errata':'Synthetic non-errata'}}));
    assert.equal(reports[0].requirements[0].status,'satisfied'); assert.equal(reports[1].requirements[0].status,'unmet');
    assert.notEqual(reports[0].identity.uuid,reports[1].identity.uuid);
    assert.notDeepEqual(reports[0].identity.selectedVersion,reports[1].identity.selectedVersion);
    const before=structuredClone({a,original,revised});
    for(let n=0;n<2;n++) assert.deepEqual(diagnosePrerequisites({actor:JSON.parse(JSON.stringify(a)),item:JSON.parse(JSON.stringify(revised)),selectedVersion:reports[1].identity.selectedVersion}),reports[1]);
    assert.deepEqual({a,original,revised},before);
    const unresolved=diagnosePrerequisites({actor:a,item:{...original,_stats:{systemVersion:'4.4.3'}}});
    assert.equal(unresolved.identity.selectedVersion,null); assert.ok(unresolved.attributionIssues.includes('rule-version-unestablished'));
    const satisfied=report(['Level 1','Untrained Focus'],a); assert.equal(satisfied.unmet.length,0); assert.equal(satisfied.unverifiable.length,0);
});

async function npcClass(documents) {
    // Execute the actual class unchanged except ESM linkage. Foundry IO is fixture-controlled;
    // the live-client runner independently checks the normal module/constructor/refresh path.
    const source=(await readFile('src/module/apps/npc-quick-build/document.js','utf8'))
        .replace(/^import .*;\r?\n/gm,'').replace('export class NpcQuickBuildData','class NpcQuickBuildData');
    return vm.runInNewContext(source+'\nNpcQuickBuildData;', {
        evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics,Mutex,structuredClone,
        CONFIG:{PTU:{data:{skills:{keys:Object.keys(SKILLS)}}}},foundry:{utils:{deepClone:structuredClone}},
        fromUuid:async uuid=>documents.get(uuid),PTUSkills:{getRankSlug:value=>({1:'pathetic',2:'untrained',3:'novice',4:'adept',5:'expert',6:'master',8:'virtuoso'})[value]},
        PokemonGenerator:{},getSkillLabel:key=>SKILLS[key]?.name, Set
    },{filename:'actual-npc-quick-build-document.js'});
}

test('real NPC refresh with selected feature/edge content preserves ranks, explicit selections, dependencies and choices',async()=>{
    const f=item(['Master Focus','GM Permission','Novice Charm'],{uuid:'Item.feature000000001'});
    f.system.rules=[{key:'ChoiceSet',choices:[{label:'A',value:'A'},{label:'B',value:'B'}]}];
    const e=item(['Adept Technology Edu'],{uuid:'Item.edge00000000001',type:'edge'});
    const extra=item([],{uuid:'Item.dependency000001'});
    const docs=new Map([f,e,extra].map(i=>[i.uuid,{toObject:()=>structuredClone(i)}]));
    const Class=await npcClass(docs), data=Object.create(Class.prototype);
    const selected={features:[{uuid:f.uuid,label:f.name,value:'feature'}],edges:[{uuid:e.uuid,label:e.name,value:'edge'}]};
    Object.assign(data,{_refreshMutex:new Mutex(),_staticMultiselects:{features:{options:[]},edges:{options:[]}},
        trainer:{level:5,partySize:0,classes:{selected:[]},features:{selected:selected.features},edges:{selected:selected.edges},
            skills:Object.fromEntries(Object.keys(SKILLS).map(k=>[k,{value:2,min:6,max:6}])),stats:{},subSelectables:{}},
        party:{},sourceSelect:{updated:false},prerequisiteContext:{references:{},selectedVersions:{[f.uuid]:'synthetic original',[e.uuid]:'synthetic revised'}}});
    const before=structuredClone(data.trainer);
    await data.refresh(); await data.refresh();
    assert.deepEqual(structuredClone(data.trainer.features.selected),before.features.selected);
    assert.deepEqual(structuredClone(data.trainer.edges.selected),before.edges.selected);
    assert.deepEqual(Array.from(data.trainer.features.computed,x=>x.uuid),[f.uuid]);
    assert.deepEqual(Array.from(data.trainer.edges.computed,x=>x.uuid),[e.uuid]);
    assert.equal(Object.values(data.trainer.skills).every(s=>s.value===2&&s.min===1),true);
    assert.equal(data.warnings.unmet.length,3); assert.equal(data.warnings.unknown.length,1);
    assert.ok(data.warnings.unmet.some(s=>s.includes(f.uuid))); assert.ok(data.warnings.unmet.some(s=>s.includes(e.uuid)));
    assert.equal(Object.values(data.trainer.subSelectables)[0].selected,null);
    const old=structuredClone(data.prerequisiteReports);
    data.trainer.skills.focus.value=6;
    await data.refresh(); assert.equal(data.prerequisiteReports[0].requirements[0].status,'satisfied');
    assert.equal(old[0].requirements[0].status,'unmet'); assert.equal(data._refreshMutex.isLocked(),false);
});
