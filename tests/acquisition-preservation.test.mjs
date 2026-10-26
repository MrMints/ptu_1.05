import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const clone=structuredClone;
const merge=(target,source)=>{for(const [key,value] of Object.entries(source??{})){if(value&&typeof value==='object'&&!Array.isArray(value)){target[key]??={};merge(target[key],value);}else target[key]=clone(value);}return target;};
class Collection extends Map{find(fn){return [...this.values()].find(fn);}filter(fn){return [...this.values()].filter(fn);}map(fn){return [...this.values()].map(fn);}}
async function load(path,name,globals){const source=(await readFile(path,'utf8')).replace(/^import .*;?\r?\n/gm,'').replace(/^export .*;?\r?\n?/gm,'');return vm.runInNewContext(source+'\n'+name,globals,{filename:path});}
const parentId='parent0000000001',childId='child00000000001',conditionId='condition0000001';
function graph(){return[
    {_id:parentId,name:'Saved parent',type:'feat',flags:{ptu:{selectedVersion:{id:'synthetic-original'},itemGrants:{savedEdge:{id:childId,onDelete:'detach'}},rulesSelections:{saved:'custom'}}},system:{prerequisites:['Master Focus','GM Permission'],notes:'Custom parent',rules:[{key:'GrantItem',uuid:'Item.sourcechild00001',flag:'savedEdge',allowduplicate:true}]}},
    {_id:childId,name:'Saved child',type:'edge',flags:{ptu:{selectedVersion:{id:'synthetic-revised'},grantedBy:{id:parentId,onDelete:'cascade'}}},system:{prerequisites:['Custom child requirement'],notes:'Custom child',rules:[]}}
];}
const choice=()=>({_id:'choice0000000001',name:'Cancellable feature',type:'feat',system:{prerequisites:['Master Focus'],rules:[{key:'SyntheticChoice'}]}});
async function harness(){
    let next=0,cancel=false,failCreate=false,creates=0,increments=0,ruleCalls=0,Grant;
    const actor={isOwner:true,canHostRuleElements:true,name:'Disposable',allowedItemTypes:['condition','feat','edge','pokeedge','effect'],rollOptions:{all:{}},items:new Collection(),reset(){},get itemTypes(){return{condition:this.items.filter(i=>i.type==='condition')};}};
    const CONFIG={Item:{documentClass:null}};
    class CoreItem{
        constructor(data,options={}){this._source=clone(data);this._source.system={rules:[],...this._source.system};this._source.flags??={};this.actor=options.parent;this.id=this._source._id;this.name=this._source.name;this.type=this._source.type;this.system=this._source.system;this.flags=this._source.flags;}
        get slug(){return this.system.slug??this.name.toLowerCase().replaceAll(' ','-');}
        toObject(){return clone(this._source);}
        clone(changes={}){return new CONFIG.Item.documentClass(merge(this.toObject(),changes));}
        async increase(){increments++;this.system.value.value++;}
        static async createDocuments(sources,{parent,keepId}){if(failCreate==='veto')return[];if(failCreate)throw Error('Synthetic creation failure');const saved=keepId?sources:sources.map(s=>({...s,_id:'core'+String(++next).padStart(12,'0')}));for(const s of saved)if(parent.items.has(s._id))throw Error('ID collision');creates++;return saved.map(s=>{const item=new CONFIG.Item.documentClass(s,{parent});parent.items.set(item.id,item);return item;});}
    }
    const RuleElements={fromOwnedItem:item=>item.system.rules.map((rule,sourceIndex)=>rule.key==='UnknownCustom'?null:Object.assign(rule.key==='GrantItem'?new Grant(rule,item):{preCreate:async()=>{ruleCalls++;if(cancel)throw Error('No selection made');}},{sourceIndex})).filter(Boolean)};
    const globals={console,structuredClone,Item:CoreItem,CONFIG,RuleElements,game:{combat:null,user:{id:'owner'}},ui:{notifications:{warn:()=>{},error:()=>{}}},
        foundry:{utils:{deepClone:clone,randomID:()=>String(++next).padStart(16,'0'),mergeObject:merge}},
        sluggify:s=>s.toLowerCase().replaceAll(' ','-'),prerequisiteView:()=>null,resolvePreservationSource:async()=>null,getDocumentSourceId:()=>null};
    const ItemClass=await load('src/module/item/base.js','PTUItem',globals);CONFIG.Item.documentClass=ItemClass;
    class RuleBase{constructor(source,item){Object.assign(this,source);this.item=item;this.actor=item.actor;this.predicate=[];}resolveInjectedProperties(value){return value;}test(){return true;}}
    const originalChild=new ItemClass(graph()[1]);
    Grant=await load('src/module/rules/rule-element/grant-item/rule-element.js','GrantItemRuleElement',{
        ...globals,PTUItem:ItemClass,RuleElementPTU:RuleBase,MigrationList:{constructFromVersion:()=>[]},MigrationRunner:{},
        fromUuid:async()=>originalChild,compendiumItemIdentity:()=>null,isExcludedContent:()=>false,isStarterTrainingGrant:()=>false,hasStarterTraining:()=>false,
        ui:{notifications:{warn:()=>{},error:()=>{}}}});
    const condition=new ItemClass({_id:conditionId,name:'Test Counter',type:'condition',system:{slug:'test-counter',value:{isValued:true,value:1},rules:[]}},{parent:actor});actor.items.set(condition.id,condition);
    return{actor,ItemClass,condition,setCancel:v=>{cancel=v;},setCreateFailure:v=>{failCreate=v;},counts:()=>({creates,increments,ruleCalls}),snapshot:()=>clone(actor.items.map(i=>i.toObject()))};
}

test('cancelled mixed condition/choice batch preserves saved state; success and retry increment once',async()=>{
    const h=await harness(),input=[h.condition.toObject(),choice()],before=h.snapshot();h.setCancel(true);
    await assert.rejects(h.ItemClass.createDocuments(input,{parent:h.actor}),/No selection made/);
    assert.deepEqual({saved:h.snapshot(),creates:h.counts().creates},{saved:before,creates:0});
    assert.equal(h.counts().increments,0);
    h.setCancel(false);await h.ItemClass.createDocuments(input,{parent:h.actor});
    assert.equal(h.condition.system.value.value,2);assert.equal(h.counts().increments,1);assert.equal(h.actor.items.size,2);
    h.setCancel(true);const completed=h.snapshot();await assert.rejects(h.ItemClass.createDocuments(input,{parent:h.actor}),/No selection made/);assert.deepEqual(h.snapshot(),completed);
    h.setCancel(false);await h.ItemClass.createDocuments(input,{parent:h.actor});assert.equal(h.condition.system.value.value,3);assert.equal(h.counts().increments,2);
    assert.deepEqual(input,[before[0],choice()]);
});

test('complete saved graph restores exact IDs and relationships without grant replay',async()=>{
    const h=await harness(),input=graph(),before=clone(input);
    const result=await h.ItemClass.createDocuments(input,{parent:h.actor,keepId:true});
    assert.equal(result.length,2);assert.deepEqual(clone(result.map(i=>i.toObject())),before);assert.deepEqual(input,before);
    assert.equal(result[0].flags.ptu.itemGrants.savedEdge.id,childId);assert.equal(result[1].flags.ptu.grantedBy.id,parentId);
    const saved=h.snapshot();await assert.rejects(h.ItemClass.createDocuments(input,{parent:h.actor,keepId:true}),/ID already exists|ID collision/);assert.deepEqual(h.snapshot(),saved);
});

test('ordinary complete-graph copy remaps only exact internal IDs and remains independently repeatable',async()=>{
    const h=await harness(),input=graph(),before=clone(input);
    for(let run=0;run<2;run++){
        const result=await h.ItemClass.createDocuments(input,{parent:h.actor});assert.equal(result.length,2);
        const [parent,child]=result;assert.notEqual(parent.id,parentId);assert.notEqual(child.id,childId);
        assert.equal(parent.flags.ptu.itemGrants.savedEdge.id,child.id);assert.equal(child.flags.ptu.grantedBy.id,parent.id);
        for(const [index,item] of result.entries()){assert.deepEqual(item.system,before[index].system);assert.deepEqual(item.flags.ptu.selectedVersion,before[index].flags.ptu.selectedVersion);}
    }
    assert.equal(h.actor.items.size,5);assert.deepEqual(input,before);
});

test('non-owner cannot increment conditions, stage choices or restore/copy graphs',async()=>{
    const h=await harness();h.actor.isOwner=false;const before=h.snapshot();
    for(const input of [[h.condition.toObject(),choice()],graph()])assert.equal((await h.ItemClass.createDocuments(input,{parent:h.actor})).length,0);
    assert.deepEqual(h.snapshot(),before);assert.deepEqual(h.counts(),{creates:0,increments:0,ruleCalls:0});
});

test('fresh acquisition still runs genuine GrantItem rules and creates their linked child',async()=>{
    const h=await harness(),source=graph()[0];delete source.flags.ptu.itemGrants;
    const result=await h.ItemClass.createDocuments([source],{parent:h.actor});assert.equal(result.length,2);
    assert.equal(result[0].flags.ptu.itemGrants.savedEdge.id,result[1].id);assert.equal(result[1].flags.ptu.grantedBy.id,result[0].id);
});

test('preparation and failed persistence defer condition effects; a clean retry applies each requested increment once',async()=>{
    const h=await harness(),input=[h.condition.toObject(),h.condition.toObject(),choice()],before=h.snapshot();
    const prepared=await h.ItemClass.prepareCreation(input,{parent:h.actor});assert.deepEqual(h.snapshot(),before);assert.equal(h.counts().increments,0);
    h.setCreateFailure(true);await assert.rejects(h.ItemClass.createDocuments(prepared,{parent:h.actor}),/creation failure/);assert.deepEqual(h.snapshot(),before);
    h.setCreateFailure('veto');await assert.rejects(h.ItemClass.createDocuments(input,{parent:h.actor}),/creation did not complete/);assert.deepEqual(h.snapshot(),before);assert.equal(h.counts().increments,0);
    h.setCreateFailure(false);await h.ItemClass.createDocuments(input,{parent:h.actor});assert.equal(h.condition.system.value.value,3);assert.equal(h.counts().increments,2);
});

test('saved graph rules use source indices despite unknown rules; incomplete or ambiguous graphs fail unchanged',async()=>{
    const h=await harness(),input=graph();input[0].system.rules.unshift({key:'UnknownCustom',custom:'Preserve'});
    const result=await h.ItemClass.createDocuments(input,{parent:h.actor,keepId:true});assert.equal(result.length,2);assert.deepEqual(result[0].system.rules,input[0].system.rules);
    for(const bad of [[graph()[0]],[...graph(),graph()[1]]]){
        const other=await harness(),before=other.snapshot();await assert.rejects(other.ItemClass.createDocuments(bad,{parent:other.actor}),/saved grant|Saved grant/);assert.deepEqual(other.snapshot(),before);assert.equal(other.counts().creates,0);
    }
});

test('prepared graph keeps its mapped IDs with a fresh persistence context and retains custom stack slugs',async()=>{
    const h=await harness(),input=graph();for(const [index,source] of input.entries()){source.system.stackSlugs=true;source.system.slug='custom-saved-'+index;}
    const prepared=await h.ItemClass.prepareCreation(input,{parent:h.actor}),result=await h.ItemClass.createDocuments(prepared,{parent:h.actor});
    assert.equal(result.length,2);assert.equal(result[0].flags.ptu.itemGrants.savedEdge.id,result[1].id);assert.equal(result[1].flags.ptu.grantedBy.id,result[0].id);
    for(const [index,item] of result.entries())assert.deepEqual(item.system,input[index].system);
});

test('an explicit new GrantItem rule still runs alongside a preserved saved edge',async()=>{
    const h=await harness(),input=graph();input[0].system.rules.push({key:'GrantItem',uuid:'Item.sourcechild00001',flag:'newEdge',allowduplicate:true});
    const result=await h.ItemClass.createDocuments(input,{parent:h.actor});assert.equal(result.length,3);
    assert.equal(result[0].flags.ptu.itemGrants.savedEdge.id,result[1].id);assert.equal(result[0].flags.ptu.itemGrants.newEdge.id,result[2].id);assert.notEqual(result[1].id,result[2].id);
});

test('ID-preserving saved Condition-child graph retains its custom slug and reciprocal IDs',async()=>{
    const h=await harness(),input=graph();input[1].type='condition';input[1].system={...input[1].system,slug:'custom-saved-condition',stackSlugs:true,value:{isValued:true,value:4}};
    const before=clone(input),result=await h.ItemClass.createDocuments(input,{parent:h.actor,keepId:true});
    assert.equal(result.length,2);assert.deepEqual(clone(result.map(i=>i.toObject())),before);assert.equal(h.counts().increments,0);assert.deepEqual(input,before);
});

test('unestablished saved rule-to-edge associations stop unchanged for restore and copy',async()=>{
    for(const keepId of [true,false])for(const flag of [undefined,'','changed-unproven-flag']){
        const h=await harness(),input=graph();if(flag===undefined)delete input[0].system.rules[0].flag;else input[0].system.rules[0].flag=flag;
        const raw=clone(input),before=h.snapshot();await assert.rejects(h.ItemClass.createDocuments(input,{parent:h.actor,keepId}),/association/);
        assert.deepEqual(h.snapshot(),before);assert.deepEqual(input,raw);assert.deepEqual(h.counts(),{creates:0,increments:0,ruleCalls:0});
    }
});
