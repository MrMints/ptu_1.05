import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {sluggify, sortStringRecord} from '../src/util/misc.js';
import {getDocumentSourceId} from '../src/util/document-source.js';
import {prerequisiteView, assignFeatureGroup} from '../src/util/acquisition.js';
import {diagnosePrerequisites, evaluatePrerequisite, formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';
import {lookupSelectedRuleVersion, lookupEffectiveRule} from '../src/util/rule-versions.js';
import {previewRuleVersionReplacement} from '../src/util/rule-version-preview.js';
import {SKILLS} from '../src/util/skills.js';
import {Mutex} from '../src/util/mutex.js';
import * as npcSelection from '../src/module/apps/npc-quick-build/selection.js';

const read = p => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const draft = JSON.parse(await read('docs/data/rule-version-echoes-draft.json'));
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const plain = x => JSON.parse(JSON.stringify(x));
const contextNote = 'Researcher — General Research Field (core pp.139–140). Choose two Fields; the parent grants one qualifying Feature, restricts later selections to those Fields, and may repeat with two different Fields. Parent selection and owned grouping remain unverified/manual. This context adds no leaf prerequisite or automatic grant.';
const recommended = {class: 'Researcher', keywords: [], notes: contextNote};
// Only detached test adapters receive IDs/UUIDs/selected-version attribution.
// The synthetic pack, actor and class fixtures are not installed/reserved content.
function snapshot(index, presentation = false) {
    const row = draft.roles[index], data = structuredClone(row.item);
    if (presentation) Object.assign(data.system, structuredClone(recommended));
    // An index fixture needs Foundry's ordinary image field; it is not source metadata.
    return {...data, img:'icons/svg/item-bag.svg', _id: row.proposedIdentity.itemId, id: row.proposedIdentity.itemId,
        uuid: `Compendium.readiness.echoes.Item.${row.proposedIdentity.itemId}`, pack: 'readiness.echoes',
        flags: {ptu: {selectedVersion: {id: row.proposedIdentity.versionId, label: `${row.source.edition} (readiness fixture)`}}}};
}
const inputSource = async p => (await read(p)).replace(/^import .*;?\r?\n/gm, '').replace(/^export /gm, '').replace(/^\{[^\r\n]+\}\s*$/gm, '');
async function load(p, name, globals) {
    return vm.runInNewContext(`${await inputSource(p)}\n${name}`, {structuredClone, console, ...globals}, {filename:p});
}
const getProperty = (x, p) => p.split('.').reduce((v,k) => v?.[k], x);

async function browserFor(records) {
    const sandbox = vm.createContext({structuredClone, console, sluggify, DOMParser: class {},
        foundry: {utils: {duplicate: structuredClone, getProperty}}});
    // Foundry's String extension and DOM/parser services are environment stubs;
    // both actual browser class bodies/private methods remain unchanged.
    vm.runInContext('String.prototype.capitalize=function(){return this.charAt(0).toUpperCase()+this.slice(1);}', sandbox);
    vm.runInContext(await inputSource('src/module/apps/compendium-browser/tabs/base.js'), sandbox);
    const Class = vm.runInContext(`${await inputSource('src/module/apps/compendium-browser/tabs/feats.js')}\nCompendiumBrowserFeatsTab`, sandbox);
    const browser = {loadedPacks: () => ['readiness.echoes'], packLoader: {async *loadPacks() {
        yield {pack: {collection:'readiness.echoes'}, index:records};
    }}};
    const tab = new Class(browser);
    await tab.loadData();
    return tab;
}

// A minimal Document shell supplies data and in-memory update spies only. Rules,
// categorization, grant checks and sibling lookup use the actual Item/Feat bodies.
async function featClass() {
    class CoreItem {
        constructor(data, {parent = null, writes = []} = {}) {
            this._source = structuredClone(data); Object.assign(this, this._source);
            this.id = data._id; this.actor = parent; this.parent = parent; this._writes = writes;
            this.flags ??= {ptu:{}};
        }
        toObject() { return structuredClone({name:this.name, type:this.type, _id:this.id, system:this.system, flags:this.flags}); }
        async update(changes) {
            this._writes.push({id:this.id, actor:this.actor?.uuid, changes:structuredClone(changes)});
            for (const [path, value] of Object.entries(changes)) {
                const parts = path.split('.'), leaf = parts.pop(); let target = this;
                for (const part of parts) target = target[part] ??= {};
                if (leaf.startsWith('-=')) delete target[leaf.slice(2)]; else target[leaf] = structuredClone(value);
            }
        }
    }
    const Base = await load('src/module/item/base.js', 'PTUItem', {Item:CoreItem, sluggify, getDocumentSourceId, prerequisiteView});
    return load('src/module/item/feat/document.js', 'PTUFeat', {PTUItem:Base});
}
function actor(n = 1) { return {uuid:`Actor.${String(n).padStart(16,'0')}`, isOwner:true,
    system:{skills:{generalEd:{value:{total:2}}}}, items:new Map(), rollOptions:{all:{}}}; }
async function groupFixture(index = 0) {
    const Class = await featClass(), a = actor(), writes = [];
    const item = new Class(snapshot(index, true), {parent:a, writes});
    item.pack = null; item.name = 'Custom owned Echoes'; item.system.useCount = 1;
    item.flags.user = {label:'Keep custom label'}; item.flags.ptu.rulesSelections = {saved:'choice'};
    const groups = [801, 802].map(n => {
        const source = snapshot(0); source._id = String(n).padStart(16,'0'); source.name = 'Researcher'; source.system.keywords = ['Class'];
        return new Class(source, {parent:a, writes});
    });
    a.items = new Map([item,...groups].map(x => [x.id,x]));
    return {a,item,groups,writes,Class};
}

async function npcFor(records, rank = 6) {
    const docs = records.map(data => ({...data, toObject:() => structuredClone(data)}));
    const lookups = [], writes = [];
    const noop = async () => {};
    const game = {packs:new Map([['ptu.feats',{index:docs}],['ptu.edges',{index:[]}],['ptu.species',{index:[]}]]),
        ptu:{compendiumBrowser:{initCompendiumList(){},tabs:{feats:{loadData:noop},edges:{loadData:noop},species:{loadData:noop}}}}};
    const ranks = {1:'pathetic',2:'untrained',3:'novice',4:'adept',5:'expert',6:'master',8:'virtuoso'};
    const CONFIG = {PTU:{data:{skills:{keys:Object.keys(SKILLS)},stats:{keys:['hp']}}}};
    const Class = await load('src/module/apps/npc-quick-build/document.js', 'NpcQuickBuildData', {
        ...npcSelection, Set, Mutex, game, CONFIG, evaluatePrerequisite, diagnosePrerequisites, formatPrerequisiteDiagnostics,
        foundry:{utils:{deepClone:structuredClone}},PTUSkills:{getRankSlug:n=>ranks[n]},
        fromUuid:async uuid => {lookups.push(uuid); return docs.find(x=>x.uuid===uuid) ?? null;},
        PokemonGenerator:class {}, Actor:{create:()=>writes.push('unexpected actor creation')}
    });
    const data = Object.create(Class.prototype);
    Object.assign(data, {_refreshMutex:new Mutex(), _staticMultiselects:Object.fromEntries(['classes','features','edges','species'].map(k=>[k,{options:[]}])),
        trainer:{level:5,partySize:0,classes:{selected:[]},features:{selected:[],computed:[]},edges:{selected:[],computed:[]},
            skills:Object.fromEntries(Object.keys(SKILLS).map(k=>[k,{value:k==='generalEd'?rank:2,min:1,max:6}])),stats:{hp:{value:0,min:0}},subSelectables:{}},
        party:{},manuallyUpdatedFields:new Set(),sourceSelect:{updated:false},prerequisiteContext:{references:{},selectedVersions:{}}});
    await data.preload();
    return {data,lookups,writes};
}

test('pinned actual drafts retain all five accepted proposals and unapproved source versions', () => {
    assert.equal(hash(draft),'fd95fa42db9996f073d9dc3eb0274a3310011ab154b85128ca0880a6ff91cc03');
    assert.deepEqual(draft.roles.map(x=>x.proposedIdentity), [
        {itemId:'ViZpn17qLA4ACQGa',canonicalId:'UKk9BnAZtm1xMoRB',versionId:'celnYjQjM3jjtAnZ'},
        {itemId:'e9dQ3NmVm7EuQBO5',canonicalId:'UKk9BnAZtm1xMoRB',versionId:'i1OAz3lvuCRIm3n9'}]);
    assert.deepEqual(draft.roles.map(x=>x.item.system.prerequisites), [['Master General Education'],['Breadth of Knowledge','Master General Education']]);
    assert.equal(draft.roles[0].source.publicationDate, null); assert.equal(draft.roles[1].source.publicationDate, '2015-05');
    assert.equal(draft.roles[1].source.status, 'optional-playtest');
    for (const row of draft.roles) {assert.equal(row.productionMapping,null); assert.equal(row.generationEligibility,'unclassified'); assert.equal(row.approvals.production,false);}
});

test('readiness source bindings match the actual accepted complete definitions and parent frame', async () => {
    const evidence=JSON.parse(await read('docs/data/feature-source-evidence.json'));
    for(const row of draft.roles) {
        const unit=evidence.sourceDefinitions.find(x=>x.id===row.definitionEvidence.id);
        assert.equal(hash(unit),row.definitionEvidence.jsonSha256);
        assert.equal(unit.source.sha256,row.source.sha256);
        assert.deepEqual(unit.definition.sections.map(x=>x.kind),['prerequisites','frequency','trigger','effect']);
    }
    assert.equal(hash(evidence.parentFrames.find(x=>x.id==='core-parent-researcher')),draft.parentContext.jsonSha256);
});

for (const presentation of [false,true]) test(`actual browser preserves same-name pair and source/class filters: ${presentation?'recommended':'neutral'}`, async () => {
    const records = [snapshot(0,presentation),snapshot(1,presentation)], before = hash(records);
    const tab = await browserFor(records);
    assert.equal(tab.indexData.length,2);
    assert.notEqual(tab.indexData[0].uuid,tab.indexData[1].uuid);
    assert.ok(tab.indexData.every(x=>x.notes===undefined));
    assert.deepEqual(plain(tab.indexData.map(x=>x.name)), ['Echoes of the Future','Echoes of the Future']);
    tab.filterData.checkboxes.class.selected = ['researcher'];
    assert.deepEqual(plain(tab.indexData.map(x=>tab.filterIndexData(x))), [presentation,presentation]);
    assert.equal(Object.hasOwn(tab.filterData.checkboxes.class.options,'researcher'),presentation);
    tab.filterData.checkboxes.class.selected = [];
    tab.filterData.checkboxes.source.selected = [sluggify(records[1].system.source.value)];
    assert.deepEqual(plain(tab.indexData.map(x=>tab.filterIndexData(x))), [false,true]);
    assert.equal(tab.indexData[1].prerequisites.length,2);
    assert.equal(hash(records),before);
});

test('actual browser rename and Branch filter affect presentation without creating canonical/grant identity', async () => {
    const records = [snapshot(0,true),snapshot(1,true)]; records[1].name = 'Renamed May'; records[1].system.keywords = ['Branch'];
    const tab = await browserFor(records);
    assert.equal(tab.indexData[1].uuid,`Compendium.readiness.echoes.${records[1]._id}`);
    tab.filterData.multiselects.keywords.selected = [{value:'Branch',not:false}];
    assert.deepEqual(plain(tab.indexData.map(x=>tab.filterIndexData(x))), [false,true]);
    for (const entry of tab.indexData) {assert.equal(entry.canonical,undefined); assert.equal(entry.grantedBy,undefined);}
    assert.ok(records.every(x=>!x.flags.ptu.itemGrants&&!x.flags.ptu.grantedBy));
});

for (const presentation of [false,true]) test(`actual Feature category/roll/sibling consumers retain leaf identity: ${presentation?'recommended':'neutral'}`, async () => {
    const Class = await featClass(), a = actor(), writes = [];
    for (let index=0;index<2;index++) {
        const source = snapshot(index,presentation), item = new Class(source,{parent:a,writes}); a.items.set(item.id,item);
        const before = hash(item.toObject());
        assert.equal(item.category,'feat'); assert.equal(item.isClass,false); assert.equal(item.rollable,true);
        item.prepareActorData(); item.prepareSiblingData();
        assert.deepEqual(plain(item.grants),[]); assert.equal(item.flags.ptu.grantedBy,undefined); assert.equal(hash(item.toObject()),before);
    }
    assert.equal(a.items.size,2); assert.equal(a.rollOptions.all['feat:echoes-of-the-future'],true); assert.equal(writes.length,0);
});

test('Class and Branch negative controls prove why neither parent marker is recommended on a leaf', async () => {
    const Class = await featClass();
    for (const [keyword,category] of [['Branch','feat'],['Class','class']]) {
        const source = snapshot(0,true); source.system.keywords = [keyword]; const item = new Class(source,{parent:actor()});
        assert.equal(item.category,category); item.prepareSiblingData(); assert.equal(item.grants.length,0);
        const npc = await npcFor([source]);
        assert.equal(npc.data.multiselects[category==='class'?'classes':'features'].options.length,1);
    }
});

for (const presentation of [false,true]) test(`actual NPC preload/refresh preserves exact pair, repeats and advisory uncertainty: ${presentation?'recommended':'neutral'}`, async () => {
    const records=[snapshot(0,presentation),snapshot(1,presentation)], before=hash(records), h=await npcFor(records,2);
    assert.equal(h.data.multiselects.classes.options.length,0); assert.equal(h.data.multiselects.features.options.length,2);
    const options=h.data.multiselects.features.options;
    assert.ok(options.every(x=>!x.sourceContext.includes('Choose two Fields')));
    h.data.trainer.features.selected=[options[0],options[1],{...options[0],value:`${options[0].uuid}::repeat:2`,label:'My repeated core'}];
    const selected=plain(h.data.trainer.features.selected);
    await h.data.refresh(); await h.data.refresh();
    assert.equal(h.data.trainer.features.computed.length,3);
    assert.deepEqual(plain(h.data.trainer.features.selected),selected);
    assert.deepEqual(plain(h.data.prerequisiteReports.map(x=>[x.unmet.length,x.unverifiable.length])),[[1,0],[1,1],[1,0]]);
    assert.equal(h.data.trainer.skills.generalEd.value,2); assert.deepEqual(plain(h.data.trainer.subSelectables),{});
    assert.ok(h.lookups.every(x=>records.some(r=>r.uuid===x))); assert.equal(h.writes.length,0); assert.equal(hash(records),before);
    const repeats=h.data.multiselects.features.options.filter(x=>x.uuid===records[0].uuid);
    assert.ok(repeats.some(x=>x.value===`${records[0].uuid}::repeat:3`));
});

test('actual NPC options and exact lookup survive renamed copies and do not resolve a same-name string', async () => {
    const records=[snapshot(0,true),snapshot(1,true)]; records[1].name='Custom May display';
    const h=await npcFor(records);
    const option=h.data.multiselects.features.options.find(x=>x.uuid===records[1].uuid);
    assert.equal(option.label,'Custom May display');
    const selected=await h.data._findFromMultiselect('features',x=>x.uuid===records[1].uuid);
    assert.equal(selected._id,records[1]._id);
    const unresolved=npcSelection.documentSelections([{value:'Echoes of the Future',label:'Echoes of the Future'}])[0];
    assert.ok(unresolved.identityIssue); assert.equal(unresolved.uuid,undefined);
});

test('metadata alone preserves saved explicit associations and custom labels through actual sibling lookup', async () => {
    const h=await groupFixture(), [group,other]=h.groups;
    h.item.flags.ptu.grantedBy={id:group.id,onDelete:'detach'}; group.flags.ptu.itemGrants={saved:{id:h.item.id,onDelete:'detach'}};
    other.flags.ptu.itemGrants={self:{id:other.id},missing:{id:'not-owned'}};
    const before=hash([h.item.toObject(),group.toObject(),other.toObject()]);
    h.item.system.class='Unrelated custom grouping label'; h.item.name='Renamed owned leaf';
    const preserved=hash([h.item.toObject(),group.toObject(),other.toObject()]);
    group.prepareSiblingData(); other.prepareSiblingData(); h.item.prepareSiblingData();
    assert.equal(group.grants[0],h.item); assert.equal(other.grants.length,0); assert.equal(h.item.grantedBy,group);
    assert.notEqual(before,preserved); assert.equal(hash([h.item.toObject(),group.toObject(),other.toObject()]),preserved); assert.equal(h.writes.length,0);
});

for (const denial of ['non-owner','foreign-item','foreign-class','self','locked-grant']) test(`actual explicit grouping denies ${denial} without updates despite matching labels/unmet prerequisites`, async () => {
    const h=await groupFixture(1); let target=h.groups[0];
    if(denial==='non-owner')h.a.isOwner=false;
    if(denial==='foreign-item')h.item.actor=actor(2);
    if(denial==='foreign-class')target.actor=actor(2);
    if(denial==='self')target=h.item;
    if(denial==='locked-grant')h.item.flags.ptu.grantedBy={id:target.id,onDelete:'cascade'};
    const before=hash([h.item.toObject(),...h.groups.map(x=>x.toObject())]);
    await assignFeatureGroup(h.a,h.item,target);
    assert.equal(h.writes.length,0); assert.equal(hash([h.item.toObject(),...h.groups.map(x=>x.toObject())]),before);
});

test('actual explicit owner grouping targets chosen owned IDs, retains saved data and ignores prerequisite vetoes', async () => {
    const h=await groupFixture(1), [old,target]=h.groups;
    h.item.flags.ptu.grantedBy={id:old.id,onDelete:'detach'}; old.flags.ptu.itemGrants={[h.item.id]:{id:h.item.id,onDelete:'detach'}};
    const saved=structuredClone({requirements:h.item.system.prerequisites,source:h.item.system.source,count:h.item.system.useCount,
        selected:h.item.flags.ptu.selectedVersion,choices:h.item.flags.ptu.rulesSelections,user:h.item.flags.user,notes:h.item.system.notes,name:h.item.name});
    assert.equal(prerequisiteView(h.item).report.unmet.length,1);
    await assignFeatureGroup(h.a,h.item,target);
    assert.deepEqual(h.writes.map(x=>x.id),[h.item.id,target.id,old.id]);
    assert.deepEqual(h.item.flags.ptu.grantedBy,{id:target.id,onDelete:'detach'});
    assert.equal(target.flags.ptu.itemGrants[h.item.id].id,h.item.id); assert.equal(old.flags.ptu.itemGrants[h.item.id],undefined);
    assert.deepEqual({requirements:h.item.system.prerequisites,source:h.item.system.source,count:h.item.system.useCount,
        selected:h.item.flags.ptu.selectedVersion,choices:h.item.flags.ptu.rulesSelections,user:h.item.flags.user,notes:h.item.system.notes,name:h.item.name},saved);
});

test('actual trainer sheet same-actor drop resolves the target by owned ID; non-owner resolves nothing', async () => {
    const h=await groupFixture(), target=h.groups[1]; let reads=0, sorts=0;
    const Class=await load('src/module/actor/character/sheet.js','PTUCharacterSheet',{PTUActorSheet:class {},assignFeatureGroup,
        Item:{implementation:{fromDropData:async()=>{reads++;return h.item;}}},hasSavedItemGraph:()=>false,
        $:()=>({closest:()=>({data:()=>undefined})})});
    const sheet=Object.create(Class.prototype); sheet.actor=h.a; sheet._onSortItem=()=>{sorts++;return 'sorted';};
    const event={target:{closest:()=>({dataset:{itemId:target.id}})}};
    assert.equal(await sheet._onDropItem(event,{}),'sorted'); assert.equal(h.item.flags.ptu.grantedBy.id,target.id); assert.equal(sorts,1);
    h.writes.length=0; h.a.isOwner=false; const previousReads=reads;
    assert.equal(await sheet._onDropItem(event,{}),false); assert.equal(reads,previousReads); assert.equal(h.writes.length,0);
});

test('explicit grouping keeps both exact version memberships and repeating the same association adds no duplicate key', async () => {
    const h=await groupFixture(),target=h.groups[0],may=new h.Class(snapshot(1,true),{parent:h.a,writes:h.writes});
    h.a.items.set(may.id,may);
    await assignFeatureGroup(h.a,h.item,target); await assignFeatureGroup(h.a,may,target);
    await assignFeatureGroup(h.a,h.item,target);
    assert.deepEqual(Object.keys(target.flags.ptu.itemGrants).sort(),[h.item.id,may.id].sort());
    assert.equal(h.a.items.size,4); assert.equal(h.item.system.useCount,1);
    assert.notEqual(h.item.flags.ptu.selectedVersion.id,may.flags.ptu.selectedVersion.id);
    // This proves membership-key behavior, not permission to stack the two rule benefits.
});

for (const presentation of [false,true]) test(`actual advisory view keeps Breadth unverifiable and raw source/version attribution: ${presentation?'recommended':'neutral'}`, () => {
    const a={uuid:actor().uuid,system:{skills:{generalEd:{value:{total:6}}}},items:[]};
    const records=[snapshot(0,presentation),snapshot(1,presentation)], before=hash(records);
    const views=records.map(x=>prerequisiteView(x,a));
    assert.equal(views[0].clear,true); assert.equal(views[1].report.unmet.length,0); assert.equal(views[1].report.unverifiable.length,1);
    assert.equal(views[1].report.unverifiable[0].reason,'custom-or-unresolved-identity');
    for(let i=0;i<2;i++) {assert.deepEqual(views[i].report.rawRequirements,draft.roles[i].item.system.prerequisites);
        assert.equal(views[i].report.identity.selectedVersion.id,draft.roles[i].proposedIdentity.versionId); assert.deepEqual(views[i].report.identity.source,draft.roles[i].item.system.source);
        assert.equal(views[i].report.advisory,true); assert.equal(views[i].allowed,undefined);}
    assert.equal(hash(records),before);
});

test('actual lookup/preview do not promote presentation metadata or unclassified mappings and preserve saved state', () => {
    const current=snapshot(0,true),candidate=snapshot(1,true);
    current.system.useCount=1; current.flags.user={note:'Custom'}; current.flags.ptu.itemGrants={saved:{id:'0000000000000801',onDelete:'detach'}};
    candidate.name='Renamed May'; const before=hash({current,candidate});
    assert.equal(lookupSelectedRuleVersion(current).status,'unresolved');
    assert.deepEqual(lookupEffectiveRule(current).system,current.system);
    const mappings=draft.roles.map((r,i)=>({schemaVersion:1,documentUuid:[current,candidate][i].uuid,type:'feat',generationEligibility:'unclassified',
        version:{id:r.proposedIdentity.versionId,label:r.source.edition,kind:i?'revised':'original'},canonical:{id:r.proposedIdentity.canonicalId,evidence:'Readiness test attribution only; not an installed mapping'},
        source:{id:r.source.authorityId,edition:r.source.edition,status:i?'optional-playtest':'core',publicationDate:r.source.publicationDate,citation:`p.${r.source.pdfPages[0]}`}}));
    assert.ok(lookupSelectedRuleVersion(current,{versions:mappings}).issues.includes('mapping-outside-approved-generation-scope'));
    const preview=previewRuleVersionReplacement({current,candidate,actor:{system:{skills:{generalEd:{value:{total:6}}}},items:[]},versions:mappings});
    assert.equal(preview.inspectionOnly,true); assert.equal(preview.relationship.status,'unresolved');
    assert.deepEqual(preview.prerequisites.report.rawRequirements,candidate.system.prerequisites);
    assert.equal(preview.prerequisites.report.unverifiable[0].raw,'Breadth of Knowledge');
    assert.equal(preview.update,undefined); assert.equal(preview.allowed,undefined); assert.equal(hash({current,candidate}),before);
});

test('actual Item sheet keeps proposed context note out of mechanics; existing template lacks a notes presentation', async () => {
    const effects=[],foundry={appv1:{sheets:{ItemSheet:class {async getData(){return {item:this.item.toObject(),editable:false};}}}},
        utils:{duplicate:structuredClone},applications:{ux:{TextEditor:{implementation:{enrichHTML:async text=>{effects.push(text);return text;}}}}}};
    const Class=await load('src/module/item/sheet/sheet.js','PTUItemSheet',{foundry,CONFIG:{PTU:{data:{}}},prerequisiteView,
        RuleElements:{all:{}},RULE_ELEMENT_FORMS:{},sortStringRecord,game:{i18n:{localize:x=>x}}});
    for(const presentation of [false,true]) {
        const item=snapshot(1,presentation); item.getFlag=()=>false; item.toObject=()=>plain({...item,getFlag:undefined,toObject:undefined});
        const sheet=Object.create(Class.prototype); sheet.item=item; sheet.object=item; sheet.isEditable=false;
        const data=await sheet.getData();
        assert.equal(data.itemEffect,draft.roles[1].item.system.effect); assert.equal(data.item.system.notes,presentation?contextNote:'');
        assert.equal(data.parentContext,undefined); assert.equal(data.prerequisiteViews[0].report.unverifiable[0].raw,'Breadth of Knowledge');
    }
    assert.ok(effects.every(x=>!x.includes('Choose two Fields')));
    // Static template evidence supplements the actual getData observation; no DOM/live rendering is claimed.
    assert.equal((await read('static/templates/item/feat-sheet.hbs')).includes('item.system.notes'),false);
});
