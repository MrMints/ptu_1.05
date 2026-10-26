import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {ADVISORY_ITEM_TYPES,prerequisiteView,actorPrerequisiteViews,assignFeatureGroup} from '../src/util/acquisition.js';
import {isExcludedAcquisitionDocument} from '../src/util/content-scope.js';
import {SKILLS} from '../src/util/skills.js';

const actor=()=>({isOwner:true,canHostRuleElements:true,name:'Synthetic actor',uuid:'Actor.actor00000000001',allowedItemTypes:['feat','edge','pokeedge','effect','condition'],
    flags:{},system:{level:{current:5},skills:Object.fromEntries(Object.keys(SKILLS).map(key=>[key,{value:{total:2}}]))},
    items:[],itemTypes:{condition:[]},rollOptions:{all:{}},reset(){this.resets=(this.resets??0)+1;}});
const fixture=(type='feat',id='item000000000001')=>({_id:id,id,uuid:'Item.'+id,type,name:'Same Name',flags:{ptu:{selectedVersion:{id:'synthetic-original'}}},
    system:{prerequisites:['Master Focus','Level 2','GM Permission','Custom condition'],rules:[],enabled:true}});
async function load(path,name,globals){
    // The production class body is unchanged; only ESM linkage is supplied by the controlled Foundry harness.
    const source=(await readFile(path,'utf8')).replace(/^import .*;?\r?\n/gm,'').replace(/^export /gm,'').replace(/^\{ PTUItem, PTUItemProxy \}\s*$/gm,'');
    return vm.runInNewContext(source+'\n'+name,{structuredClone,console,...globals},{filename:path});
}
async function itemClass(){
    const writes=[];let id=0,ruleCalls=0,fail=false;
    class CoreItem {
        constructor(source,options){this._source=structuredClone(source);this._source.system={rules:[],...this._source.system};Object.assign(this,this._source);this.actor=options.parent;}
        prepareActorData(){}
        prepareRuleElements(){return this.system.rules.map(rule=>({preCreate:async({pendingItems})=>{ruleCalls++;if(fail)throw Error('No selection made');if(rule.key==='SyntheticGrant')pendingItems.push(fixture('edge','grant00000000001'));}}));}
        static async createDocuments(sources,context){writes.push(structuredClone(sources));return sources;}
    }
    const globals={Item:CoreItem,game:{combat:null},ui:{notifications:{error:()=>{},warn:()=>{}}},
        foundry:{utils:{deepClone:structuredClone,randomID:()=>String(++id).padStart(16,'0')}},
        sluggify:s=>s,prerequisiteView,resolvePreservationSource:async()=>null,
        RuleElements:{fromOwnedItem:item=>CoreItem.prototype.prepareRuleElements.call(item)},
        CONFIG:{Item:{documentClass:null}}};
    const ItemClass=await load('src/module/item/base.js','PTUItem',globals);globals.CONFIG.Item.documentClass=ItemClass;
    return{ItemClass,writes,getRuleCalls:()=>ruleCalls,setFailure:value=>{fail=value;}};
}

test('actual canvas drop uses v13 token bounds when hitArea is null',async()=>{
    const hooks=[],drops=[];
    const target={hitArea:null,bounds:{contains:(x,y)=>x>=100&&x<200&&y>=200&&y<300},actor:{sheet:{emulateItemDrop:data=>drops.push(data)}}};
    const canvas={tokens:{quadtree:{getObjects:(_rect,{collisionTest})=>collisionTest({t:target})?[target]:[]}}};
    const handler=await load('src/scripts/hooks/drop-canvas-data.js','DropCanvasData',{
        Hooks:{on:(_name,fn)=>hooks.push(fn)},PIXI:{Rectangle:class{}},canvas,fromUuid:async()=>null
    });
    handler.listen();
    const data={type:'Item',uuid:'Item.example000000001',x:150,y:250};
    assert.equal(hooks[1](canvas,data),false);assert.equal(drops[0],data);
    assert.equal(hooks[1](canvas,{...data,x:250}),true);assert.equal(drops.length,1);
});

test('every advisory type derives persistent itemized statuses without saving or mutating inputs',()=>{
    for(const type of ADVISORY_ITEM_TYPES){const a=actor(),i=fixture(type);a.items=[i];const before=structuredClone({system:a.system,items:a.items});
        const view=actorPrerequisiteViews(a)[0];assert.equal(view.unmet.length,1);assert.equal(view.unknown.length,2);assert.equal(view.report.satisfied.length,1);
        assert.match(view.unmet[0],/requires 6, current 2/);assert.deepEqual({system:a.system,items:a.items},before);
        a.system.skills.focus.value.total=6;assert.equal(actorPrerequisiteViews(a)[0].unmet.length,0);
        assert.deepEqual(actorPrerequisiteViews(JSON.parse(JSON.stringify(a))),actorPrerequisiteViews(a));
    }
});

test('same-name, renamed, satisfied and missing-actor/version records keep their own raw requirements',()=>{
    const a=actor(),first=fixture(),second=fixture('edge','item000000000002');second.flags.ptu.selectedVersion.id='synthetic-revised';second.system.prerequisites=['Novice Charm'];
    assert.equal(prerequisiteView(first,a).report.rawRequirements[0],'Master Focus');assert.equal(prerequisiteView(second,a).report.rawRequirements[0],'Novice Charm');
    first.name='Renamed';a.system.skills.focus.value.total=6;first.system.prerequisites=['Master Focus'];assert.ok(prerequisiteView(first,a).clear);
    assert.equal(prerequisiteView(first,null).report.unverifiable.length,1);delete first.flags.ptu.selectedVersion;
    assert.match(prerequisiteView(first,a).unknown[0],/rule-version-unestablished/);assert.equal(prerequisiteView(fixture('move'),a),null);
});

test('actor/Item views distinguish satisfied requirements from empty/unsupported version attribution without mutation',()=>{
    for(const value of [undefined,null,'','   ',{},[],['original'],42,true,{unrelated:'original'},{id:' ',label:''}]){
        const a=actor(),i=fixture();i.system.prerequisites=['Untrained Focus'];i.flags.ptu.selectedVersion=value;a.items=[i];const before=structuredClone(i);
        for(const view of [prerequisiteView(i,a),actorPrerequisiteViews(a)[0]]){
            assert.equal(view.clear,false);assert.equal(view.report.satisfied.length,1);assert.equal(view.report.unmet.length,0);
            assert.deepEqual(view.report.attributionIssues,['rule-version-unestablished']);assert.match(view.unknown[0],/version unestablished/);
        }
        assert.deepEqual(i,before);
    }
    for(const value of ['original',{id:'original'},{label:'Explicit synthetic version'},{id:'original',label:' ',context:{source:'test'}}]){
        const a=actor(),i=fixture();i.system.prerequisites=['Untrained Focus'];i.flags.ptu.selectedVersion=value;
        const before=structuredClone(i);assert.equal(prerequisiteView(i,a).clear,true);assert.deepEqual(i,before);
    }
});

test('Feature creation/update does not guess class grants from display labels; explicit grouping uses owned IDs',async()=>{
    class Base{async _preCreate(){}async _preUpdate(){}}
    const Class=await load('src/module/item/feat/document.js','PTUFeat',{PTUItem:Base});
    const item=new Class();item.system={class:'Same Name'};item.flags={ptu:{grantedBy:{id:'saved-explicit-id'},rulesSelections:{saved:'choice'}}};
    const before=structuredClone({system:item.system,flags:item.flags});await item._preCreate();await item._preUpdate({system:{class:'Renamed'}});assert.deepEqual({system:item.system,flags:item.flags},before);
    const a=actor(),writes=[];const first={id:'class-one',isClass:true,name:'Same Name',actor:a,update:async change=>writes.push({target:'one',change})};
    const second={...first,id:'class-two',update:async change=>writes.push({target:'two',change})};
    const owned={id:'feature-id',actor:a,type:'feat',isGranted:false,flags:{ptu:{grantedBy:{id:first.id}}},update:async change=>writes.push({target:'feature',change})};
    a.items=new Map([[first.id,first],[second.id,second]]);await assignFeatureGroup(a,owned,second);
    assert.equal(writes[0].change['flags.ptu.grantedBy'].id,second.id);assert.equal(writes[1].target,'two');assert.equal(writes[2].target,'one');
    writes.length=0;a.isOwner=false;await assignFeatureGroup(a,owned,first);assert.equal(writes.length,0);
});

test('actual trainer/Pokémon allowed-type getters accept all three kinds without rewriting budget formulas',async()=>{
    for(const [path,name] of [['src/module/actor/character/document.js','PTUTrainerActor'],['src/module/actor/pokemon/document.js','PTUPokemonActor']]){
        const Class=await load(path,name,{PTUActor:class{}});const types=Object.getOwnPropertyDescriptor(Class.prototype,'allowedItemTypes').get.call({});
        for(const type of ADVISORY_ITEM_TYPES)assert.ok(types.includes(type),path+': '+type);
    }
});

test('actual embedded creation accepts unmet/custom/satisfied prerequisites and repeated legitimate additions',async()=>{
    const {ItemClass,writes}=await itemClass(),a=actor();
    for(const type of ADVISORY_ITEM_TYPES)for(const requirements of [[],['Master Focus'],['Master Focus','Level 99'],['Level 2','Master Focus','Custom condition']]){
        const input=fixture(type);input.system.prerequisites=requirements;const before=structuredClone(input);
        const result=await ItemClass.createDocuments([input],{parent:a});assert.equal(result.length,1);assert.deepEqual(input,before);assert.equal(result[0].system.enabled,true);
    }
    await ItemClass.createDocuments([fixture(),fixture()],{parent:a});assert.equal(writes.at(-1).length,2);
    assert.equal(a.system.skills.focus.value.total,2);assert.equal(a.items.length,0);
    const minimal={name:'Minimal core creation',type:'feat'},before=structuredClone(minimal);
    assert.equal((await ItemClass.createDocuments([minimal],{parent:a})).length,1);assert.deepEqual(minimal,before);
});

test('actual permission guard precedes rule execution and all writes; raw world creation still uses core',async()=>{
    const {ItemClass,writes,getRuleCalls}=await itemClass(),a=actor();a.isOwner=false;
    const data=fixture();data.system.rules=[{key:'SyntheticGrant'}];assert.equal((await ItemClass.createDocuments([data],{parent:a})).length,0);assert.equal(getRuleCalls(),0);assert.equal(writes.length,0);
    await ItemClass.createDocuments([data],{});assert.equal(writes.length,1);
});

test('actual staging preserves nested outputs, resolves choices only once, and cancels before any Item write',async()=>{
    const h=await itemClass(),a=actor(),data=fixture();data.system.rules=[{key:'SyntheticGrant'}];
    const prepared=await h.ItemClass.prepareCreation([data],{parent:a});assert.equal(prepared.length,2);assert.equal(h.writes.length,0);
    await h.ItemClass.createDocuments(prepared,{parent:a});assert.equal(h.getRuleCalls(),1);assert.equal(h.writes[0].length,2);
    h.setFailure(true);const before=structuredClone(data);await assert.rejects(h.ItemClass.createDocuments([data],{parent:a}),/No selection/);
    assert.deepEqual(data,before);assert.equal(h.writes.length,1);assert.equal(a.resets,1);
});

test('actual base sheet data and folder route produce reports and retain supported mixed copies/scope guards',async()=>{
    const a=actor();a.items=[fixture('feat'),fixture('edge','item000000000002'),fixture('pokeedge','item000000000003')];a.itemTypes={feat:[a.items[0]],edge:[a.items[1]],pokeedge:[a.items[2]]};
    const documents=a.items.map(d=>({...d,toObject:()=>structuredClone(d)}));let data;
    class CoreSheet{async getData(){return{actor:this.actor};}}
    const Sheet=await load('src/module/actor/sheet.js','PTUActorSheet',{foundry:{appv1:{sheets:{ActorSheet:CoreSheet}}},actorPrerequisiteViews,isExcludedAcquisitionDocument,
        CONFIG:{PTU:{data:{}}},Item:class{},Folder:{implementation:{fromDropData:async()=>({type:'Item',contents:[...documents,{uuid:'excluded'},null]})}},
        fromUuid:async uuid=>uuid==='excluded'?{pack:'ptu.species',uuid:'Compendium.ptu.species.Item.dkQPNz0RLbgzWMLq'}:documents.find(d=>d.uuid===uuid),
        ui:{notifications:{warn:()=>{}}}});
    const sheet=new Sheet();sheet.actor=a;sheet._onDropItemCreate=async rows=>{data=rows;return rows;};
    const view=await sheet.getData();assert.equal(view.prerequisiteViews.length,3);
    const copied=await sheet._onDropFolder(null,{});assert.equal(copied.length,3);assert.deepEqual(Array.from(copied,d=>d.type),['feat','edge','pokeedge']);
    data=undefined;a.isOwner=false;assert.equal((await sheet._onDropFolder(null,{})).length,0);assert.equal(data,undefined);
});

test('all actor/item templates include the shared escaped report; both cross-actor collections are visible',async()=>{
    for(const file of ['actor/trainer-sheet-compact','actor/pokemon-sheet-compact','item/feat-sheet','item/edge-sheet','item/pokeedge-sheet']){
        assert.match(await readFile('static/templates/'+file+'.hbs','utf8'),/partials\/prerequisite-diagnostics.hbs/);
    }
    const partial=await readFile('static/templates/partials/prerequisite-diagnostics.hbs','utf8');assert.ok(!partial.includes('{{{'));assert.match(partial,/Unverifiable \/ custom/);
    assert.match(await readFile('static/templates/actor/trainer-sheet-compact.hbs','utf8'),/items=crossActorPokeEdges/);
    assert.match(await readFile('static/templates/actor/pokemon-sheet-compact.hbs','utf8'),/items=crossActorFeatures/);
});

test('actual read-only Item sheet derives reports without icon writes or mutations',async()=>{
    const data=fixture(),a=actor();let iconWrites=0;
    const item={...data,actor:a,getFlag:()=>undefined,toObject:()=>structuredClone(data),_updateIcon:()=>{iconWrites++;},rules:[]};
    class CoreSheet{async getData(){return{item:structuredClone(data),editable:false};}}
    const Sheet=await load('src/module/item/sheet/sheet.js','PTUItemSheet',{
        foundry:{appv1:{sheets:{ItemSheet:CoreSheet}},utils:{mergeObject:(a,b)=>({...a,...b})}},
        CONFIG:{PTU:{data:{}}},prerequisiteView,sortStringRecord:o=>o,RuleElements:{all:{}},game:{i18n:{localize:k=>k}}
    });
    const sheet=new Sheet();sheet.object=sheet.item=item;sheet.isEditable=false;const before=structuredClone(data);
    const view=await sheet.getData();assert.equal(view.prerequisiteViews.length,1);assert.equal(iconWrites,0);assert.deepEqual(data,before);
    sheet.isEditable=true;await sheet.getData();assert.equal(iconWrites,1);
});

test('actual NPC generation resolves choices before folders/actor writes and preserves explicit ranks/selections',async()=>{
    const h=await itemClass(),writes=[];const selected=fixture();selected.system.rules=[{key:'SyntheticGrant'}];
    class Trainer{constructor(data){Object.assign(this,actor(),data);}static async createDocuments(data){writes.push({actor:structuredClone(data[0])});return[{...data[0],_id:'actor00000000001',isOwner:true}];}}
    const Class=await load('src/module/apps/npc-quick-build/document.js','NpcQuickBuildData',{
        CONFIG:{Item:{documentClass:h.ItemClass},PTU:{Actor:{documentClasses:{character:Trainer}},data:{skills:{keys:['focus'],PTUSkills:{getRankSlug:()=> 'untrained'}},stats:{keys:['hp']}}}},
        game:{user:{id:'owner',can:()=>true},i18n:{format:key=>key}},Hooks:{callAll:()=>{}},
        getSkillLabel:key=>key,fromUuid:async()=>({toObject:()=>structuredClone(selected)}),
        Folder:{create:async data=>{writes.push({folder:data});return{_id:'folder0000000001'};}}
    });
    const data=Object.create(Class.prototype);data.trainer={name:'Synthetic NPC',level:5,features:{computed:[{uuid:selected.uuid}]},edges:{computed:[]},skills:{focus:{value:2}},stats:{hp:{value:0}},sex:[],subSelectables:{}};data.party={};
    h.setFailure(true);const before=structuredClone(data.trainer);await assert.rejects(data.generate(),/No selection/);assert.equal(writes.length,0);assert.equal(h.writes.length,0);assert.deepEqual(data.trainer,before);
    h.setFailure(false);const generated=await data.generate();assert.equal(generated.type,'character');assert.equal(writes.length,2);assert.equal(h.writes.length,1);assert.equal(h.writes[0].length,2);
    assert.equal(writes[1].actor.flags.ptu.starterTraining.status,'pending');assert.equal(writes[1].actor.system.skills.focus.value.value,2);assert.equal(h.getRuleCalls(),2);assert.deepEqual(data.trainer,before);
});
