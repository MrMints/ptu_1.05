import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as npcSelection from '../src/module/apps/npc-quick-build/selection.js';
import {SKILLS} from '../src/util/skills.js';
import {Mutex} from '../src/util/mutex.js';
import {evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';

const target='Compendium.ptu.feats.Item.WscZukROrNeC7Ayp';
const other='Compendium.ptu.feats.Item.bNVcfm2VHWfhEQGi';

async function bundledTagify() {
    const context={module:{exports:{}},exports:{},window:{},document:{},navigator:{userAgent:'node'},setTimeout,clearTimeout};
    vm.runInNewContext(await readFile('static/js/tagify','utf8'),context,{filename:'actual-bundled-tagify.js'});
    return context.module.exports;
}

async function featureOptions() {
    const index=await Promise.all(['bNVcfm2VHWfhEQGi','WscZukROrNeC7Ayp'].map(async id=>({...JSON.parse(await readFile(`packs/feats/_source/${id}.json`,'utf8')),uuid:`Compendium.ptu.feats.Item.${id}`})));
    const loadData=async()=>{};
    const game={packs:new Map([['ptu.feats',{index}],['ptu.edges',{index:[]}],['ptu.species',{index:[]}]]),
        ptu:{compendiumBrowser:{initCompendiumList(){},tabs:{feats:{loadData},edges:{loadData},species:{loadData}}}}};
    const source=(await readFile('src/module/apps/npc-quick-build/document.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace('export class NpcQuickBuildData','class NpcQuickBuildData');
    const Class=vm.runInNewContext(source+'\nNpcQuickBuildData;', {game,foundry:{utils:{deepClone:structuredClone}},...npcSelection});
    const data=Object.create(Class.prototype);
    data._staticMultiselects=Object.fromEntries(['classes','features','edges','species'].map(key=>[key,{options:[]}]));
    await data.preload();
    return data.multiselects.features.options;
}

test('ordinary bundled dropdown lookup retains the clicked Medical Techniques identity',async()=>{
    const Tagify=await bundledTagify(), options=await featureOptions();
    const intended=options.find(o=>o.uuid===target);
    const state={suggestedListItems:options};
    const node={getAttribute:name=>name==='value'?intended.value:null};
    const actual=Tagify.prototype._dropdown.getSuggestionDataByNode.call(state,node);
    assert.equal(actual.uuid,target,`Clicked ${target}, resolved ${actual.uuid}; other record is ${other}`);
});

test('bundled lookup separates same-name classes, Features, Edges and species; context is printable and escaped',async()=>{
    const Tagify=await bundledTagify();
    for(const type of ['class','feat','edge','species']) {
        const options=['first','second'].map(id=>npcSelection.documentOption({uuid:`Compendium.world.fixture.Item.${id}`,name:'Same <name>',system:{class:type,source:{value:'Source "A"'}}},'Fixture pack'));
        for(const option of options) {
            const result=Tagify.prototype._dropdown.getSuggestionDataByNode.call({suggestedListItems:options},{getAttribute:()=>option.value});
            assert.equal(result.uuid,option.uuid);
            assert.doesNotMatch(option.sourceContext,/[\x00-\x1f]/);
            const html=npcSelection.documentDropdownItem(option);
            assert.match(html,/Same &lt;name&gt;/);assert.match(html,/Source &quot;A&quot;/);assert.ok(html.includes(option.uuid));
        }
    }
    const plain=[{label:'Nonbinary',value:'Nonbinary'}];
    const actual=Tagify.prototype.getWhitelistItem.call({settings:{whitelist:plain,dropdown:{},trim:true,tagTextProp:'label'}},'Nonbinary');
    assert.deepEqual(actual,plain[0]);
});

test('repeat/remove/re-add and rename retain independent exact identities without mutating legacy UUID inputs',()=>{
    const base=npcSelection.documentOption({uuid:target,name:'Same Name',system:{}});
    const second=npcSelection.documentOption({uuid:other,name:'Same Name',system:{}});
    const original=[{...base,value:'Legacy display value'},second,{...base,value:`${target}::repeat:2`}];
    const before=structuredClone(original), selected=npcSelection.documentSelections(original);
    assert.deepEqual(original,before);assert.equal(new Set(selected.map(s=>s.value)).size,3);
    const options=npcSelection.repeatDocumentOptions([base,second],selected);
    assert.equal(new Set(options.map(o=>o.value)).size,options.length);
    const third=options.find(o=>o.uuid===target&&o.value.endsWith('::repeat:3'));assert.ok(third);
    const remaining=[selected[2]];
    const again=npcSelection.repeatDocumentOptions([{...base,label:'Renamed'},second],remaining);
    assert.ok(again.some(o=>o.value===target));assert.ok(again.some(o=>o.value===remaining[0].value));
    assert.equal(npcSelection.subchoiceKey(selected[0].value,0),npcSelection.subchoiceKey({...selected[0],label:'Renamed'}.value,0));
    assert.notEqual(npcSelection.subchoiceKey(selected[0].value,0),npcSelection.subchoiceKey(selected[2].value,0));
    assert.equal(npcSelection.documentSelections([{label:'Same Name',value:'Same Name'}])[0].identityIssue!=null,true);
});

test('actual component normalization accepts exact option objects and refuses bare/ambiguous label input',async()=>{
    const Base=await bundledTagify(),original=Base.prototype.normalizeTags,Widget=npcSelection.documentTagify(Base);
    const options=[target,other].map(uuid=>npcSelection.documentOption({uuid,name:'Medical Techniques',system:{}}));
    const widget=Object.create(Widget.prototype);widget.settings={whitelist:options,tagTextProp:'label',delimiters:',',dropdown:{}};
    assert.deepEqual(Array.from(widget.normalizeTags('Medical Techniques')),[]);
    assert.deepEqual(Array.from(widget.normalizeTags([{value:'Medical Techniques',label:'Medical Techniques'}])),[]);
    for(const option of options)assert.equal(widget.normalizeTags([option])[0].uuid,option.uuid);
    assert.equal(Base.prototype.normalizeTags,original);
});

const source=(id,version)=>({uuid:`Item.${id}`,name:'Same Name',type:'feat',flags:{ptu:{selectedVersion:version,custom:{retained:version}}},system:{source:{value:'Synthetic fixture'},prerequisites:['Master Focus','GM Permission'],rules:[{key:'ChoiceSet',choices:[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}]}]}});
async function npcHarness(sources) {
    const writes=[],prepared=[],state={allowed:true,cancel:false,lookups:0,pokemonHooks:[]};
    // Foundry deepClone retains document instances; fixture Documents must do the same.
    const clone=value=>value?.toObject?value:Array.isArray(value)?value.map(clone):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])):value;
    const ranks={1:'pathetic',2:'untrained',3:'novice',4:'adept',5:'expert',6:'master',8:'virtuoso'};
    const game={user:{id:'owner',can:()=>state.allowed},i18n:{format:key=>key}};
    class Trainer {constructor(data){Object.assign(this,data);}static async createDocuments(data){writes.push({actor:data[0]});return[{...data[0],_id:'newActor'}];}}
    class Generator {constructor(document){this.document=document;}static async getImage(){return null;}async prepare(){return this;}async create(){return{actor:{type:'pokemon',name:this.document.name,system:{}},items:[{flags:{core:{sourceId:this.document.uuid}}}]};}}
    const CONFIG={Item:{documentClass:{prepareCreation:async items=>{if(state.cancel)throw Error('Cancelled choice');prepared.push(structuredClone(items));return items;},createDocuments:async items=>{writes.push({items});return items;}}},
        PTU:{Actor:{documentClasses:{character:Trainer,pokemon:{createDocuments:async data=>{writes.push({pokemon:data});return data;}}}},data:{skills:{keys:Object.keys(SKILLS),PTUSkills:{getRankSlug:n=>ranks[n]}},stats:{keys:['hp']}}}};
    const text=(await readFile('src/module/apps/npc-quick-build/document.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace('export class NpcQuickBuildData','class NpcQuickBuildData');
    const Class=vm.runInNewContext(text+'\nNpcQuickBuildData;', {...npcSelection,game,CONFIG,Mutex,structuredClone,evaluatePrerequisite,diagnosePrerequisites,formatPrerequisiteDiagnostics,
        foundry:{utils:{deepClone:clone}},PTUSkills:{getRankSlug:n=>ranks[n]},getSkillLabel:key=>SKILLS[key]?.name,Hooks:{callAll:(name,data)=>{if(name==='ptu.preTrainerPokemonGenerated')state.pokemonHooks.push(data);}},
        PokemonGenerator:Generator,Folder:{create:async data=>{writes.push({folder:data});return{_id:'newFolder'};}},
        fromUuid:async uuid=>{state.lookups++;const data=sources.find(s=>s.uuid===uuid);return data?{...data,toObject:()=>structuredClone(data)}:null;},Set});
    const data=Object.create(Class.prototype);
    Object.assign(data,{_refreshMutex:new Mutex(),_staticMultiselects:{features:{options:sources.filter(s=>s.type==='feat').map(s=>npcSelection.documentOption(s))},edges:{options:[]}},
        trainer:{name:'Synthetic NPC',level:5,partySize:0,sex:[],classes:{selected:[]},features:{selected:[],computed:[]},edges:{selected:[],computed:[]},
            skills:Object.fromEntries(Object.keys(SKILLS).map(k=>[k,{value:2,min:1,max:6}])),stats:{hp:{value:0,min:0}},subSelectables:{}},
        party:{},manuallyUpdatedFields:new Set(),sourceSelect:{updated:false},prerequisiteContext:{references:{},selectedVersions:{}}});
    return {data,state,writes,prepared};
}

test('actual refresh/generation preserves same-name source/version data and each repeat subchoice after rename/removal',async()=>{
    const a=source('first','synthetic-A'),b=source('second','synthetic-B'),h=await npcHarness([a,b]);
    h.data.trainer.features.selected=[npcSelection.documentOption(a),npcSelection.documentOption(b),{...npcSelection.documentOption(a),value:`${a.uuid}::repeat:2`,label:'Same Name (2)'}];
    const selectedBefore=structuredClone(h.data.trainer.features.selected), sourcesBefore=structuredClone([a,b]);
    await h.data.refresh();assert.equal(Object.keys(h.data.trainer.subSelectables).length,3);
    Object.values(h.data.trainer.subSelectables).forEach((s,n)=>s.selected=n===0?'alpha':'beta');
    await h.data.refresh();await h.data.refresh();
    assert.deepEqual(h.data.trainer.features.selected,selectedBefore);assert.deepEqual([a,b],sourcesBefore);
    assert.equal(h.data.warnings.unmet.length,3);assert.equal(h.data.warnings.unknown.length,3);
    assert.equal(Object.values(h.data.trainer.skills).every(s=>s.value===2),true);
    await h.data.generate();
    assert.deepEqual(h.prepared[0].map(i=>i.flags.core.sourceId),[a.uuid,b.uuid,a.uuid]);
    assert.deepEqual(h.prepared[0].map(i=>i.system.rules[0].selection),['alpha','beta','beta']);
    assert.deepEqual(h.prepared[0].map(i=>i.flags.ptu.selectedVersion),['synthetic-A','synthetic-B','synthetic-A']);
    a.name='Renamed source';await h.data.refresh();
    assert.deepEqual(Object.values(h.data.trainer.subSelectables).map(s=>s.selected),['alpha','beta','beta']);
    h.data.trainer.features.selected.splice(1,1);await h.data.refresh();
    assert.deepEqual(Object.values(h.data.trainer.subSelectables).map(s=>s.selected),['alpha','beta']);
});

test('actual NPC cancellation, denied actor creation and ambiguous-name selections perform no writes',async()=>{
    const a=source('first','synthetic-A'),h=await npcHarness([a]);h.data.trainer.features.selected=[npcSelection.documentOption(a)];await h.data.refresh();
    h.state.cancel=true;await assert.rejects(h.data.generate(),/Cancelled choice/);assert.equal(h.writes.length,0);
    h.state.allowed=false;const lookups=h.state.lookups;await assert.rejects(h.data.generate(),/permission/);assert.equal(h.state.lookups,lookups);assert.equal(h.writes.length,0);
    h.state.allowed=true;h.data.trainer.features.selected=[{label:'Same Name',value:'Same Name'}];await h.data.refresh();
    assert.ok(h.data.warnings.unknown.some(w=>w.includes('identity unestablished')));await assert.rejects(h.data.generate(),/identities require review/);assert.equal(h.writes.length,0);
});

test('actual species refresh follows a changed exact selection and clears an explicit removal',async()=>{
    const a={...source('speciesA','A'),type:'species'},b={...source('speciesB','B'),type:'species'};
    const h=await npcHarness([a,b]);h.data.trainer.partySize=1;h.data.resetPokemonSlot('slot1');
    await h.data.configurePokemonSpecies('slot1',{uuid:a.uuid});
    h.data.party.slot1.species.selected=[npcSelection.documentOption(b)];
    h.data.manuallyUpdatedFields.add('party.slot1.species.selected');await h.data.refresh();
    assert.equal(h.data.party.slot1.species.uuid,b.uuid);
    h.data.party.slot1.species.selected=[];await h.data.refresh();assert.equal(h.data.party.slot1.configured,false);assert.equal(h.data.party.slot1.species.uuid,'');
});

test('selected species reaches the actual NPC party-generation hook and generated data',async()=>{
    const b={...source('speciesB','B'),type:'species'},h=await npcHarness([b]);h.data.trainer.partySize=1;h.data.resetPokemonSlot('slot1');
    h.data.party.slot1.species.selected=[npcSelection.documentOption(b)];await h.data.refresh();
    await h.data.generate();assert.equal(h.state.pokemonHooks.length,1);assert.equal(h.state.pokemonHooks[0].type,'pokemon');
    assert.equal(h.writes.find(w=>w.pokemon).pokemon[0].items[0].flags.core.sourceId,b.uuid);
});
