import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const clone=structuredClone;
const merge=(a,b)=>{for(const[k,v]of Object.entries(b??{})){if(v&&typeof v==='object'&&!Array.isArray(v)){a[k]??={};merge(a[k],v);}else a[k]=clone(v);}return a;};
class Collection extends Map {find(fn){return [...this.values()].find(fn);}filter(fn){return [...this.values()].filter(fn);}map(fn){return [...this.values()].map(fn);}getName(name){return this.find(item=>item.name===name);}}
async function load(path,expression,globals){const source=(await readFile(path,'utf8')).replace(/^import .*\r?\n/gm,'').replace(/^export /gm,'');return vm.runInNewContext(source+'\n'+expression,globals,{filename:path});}
async function harness(){
    let sequence=0,prompts=0,accept=true,onConfirm=()=>{},creates=0,worldPermission=true;
    const world=new Collection(), game={items:world,packs:new Map(),user:{id:'owner'},combat:null};
    const CONFIG={Item:{documentClass:null}};
    const actor=(type='character')=>({documentName:'Actor',uuid:'Actor.'+(++sequence),name:'Test '+type,type,isOwner:true,items:new Collection(),canHostRuleElements:true,allowedItemTypes:['feat','edge','condition','item'],rollOptions:{all:{}},reset(){},get itemTypes(){return{condition:this.items.filter(i=>i.type==='condition')};}});
    class CoreItem {
        constructor(data,options={}){this._source=clone(data);this._source.flags??={};this._source.system={rules:[],...this._source.system};Object.assign(this,{id:this._source._id,name:data.name,type:data.type,flags:this._source.flags,system:this._source.system,parent:options.parent??null,actor:options.parent??null,pack:options.pack??null,readable:true});}
        get uuid(){return(this.parent?.uuid??'')+'.Item.'+this.id;}
        testUserPermission(){return this.readable;}
        toObject(){return clone(this._source);}
        clone(data={},context={}){const source=merge(this.toObject(),data);if(!context.keepId)delete source._id;return context.save?this.constructor.create(source,{parent:this.parent,pack:this.pack}):new this.constructor(source,{parent:this.parent,pack:this.pack});}
        static canUserCreate(){return worldPermission;}
        static async fromDropData(data){return data.document;}
        static async createDocuments(sources,{parent=null,pack=null,keepId}={}){creates++;const collection=parent?.items??(pack?game.packs.get(pack):world);return sources.map(source=>{source=clone(source);if(!keepId||!source._id)source._id=String(++sequence).padStart(16,'0');assert(!collection.has(source._id));const doc=new CONFIG.Item.documentClass(source,{parent,pack});collection.set(doc.id,doc);return doc;});}
    }
    class CoreSheet{constructor(actor){this.actor=actor;}async _onDropItem(){return 'ordinary';}}
    let folderContents=[];
    const globals={console,Item:CoreItem,CONFIG,game,Folder:{implementation:{fromDropData:async()=>({type:'Item',contents:folderContents})}},Dialog:{confirm:async config=>{prompts++;assert.match(config.content,/linked Item/);await onConfirm();return accept;}},
        isExcludedAcquisitionDocument:()=>false,isStarterTrainingGrant:()=>false,RuleElements:{fromOwnedItem:()=>[]},prerequisiteView:()=>null,sluggify:s=>s.toLowerCase().replaceAll(' ','-'),
        foundry:{utils:{deepClone:clone,randomID:()=>String(++sequence).padStart(16,'0'),mergeObject:merge},appv1:{sheets:{ActorSheet:CoreSheet}}},ui:{notifications:{error(){},warn(){}}}};
    const util=await load('src/util/saved-item-graph.js','({hasSavedItemGraph,copySavedItemDocuments})',globals);Object.assign(globals,util);
    const ItemClass=await load('src/module/item/base.js','PTUItem',globals);CONFIG.Item.documentClass=ItemClass;CoreItem.implementation=ItemClass;
    const BaseSheet=await load('src/module/actor/sheet.js','PTUActorSheet',globals);
    const TrainerSheet=await load('src/module/actor/character/sheet.js','PTUCharacterSheet',{...globals,PTUActorSheet:BaseSheet});
    function seed(parent=null){const docs=[{_id:'parent0000000001',name:'Saved parent',type:'feat',system:{prerequisites:['Master Focus'],notes:'Saved custom parent',rules:[]},flags:{ptu:{selectedVersion:'synthetic original',itemGrants:{saved:{id:'child00000000001',onDelete:'detach'}}}}},{_id:'child00000000001',name:'Saved child',type:'condition',system:{prerequisites:['Custom child'],notes:'Saved custom child',slug:'custom-child',stackSlugs:true,value:{isValued:true,value:4},rules:[]},flags:{ptu:{selectedVersion:{id:'synthetic revised'},grantedBy:{id:'parent0000000001',onDelete:'cascade'},rulesSelections:{custom:'saved'}}}}].map(data=>new ItemClass(data,{parent}));for(const doc of docs)(parent?.items??world).set(doc.id,doc);return docs;}
    return {actor,seed,world,ItemClass,BaseSheet,TrainerSheet,...util,setFolder:items=>{folderContents=items;},counts:()=>({prompts,creates}),setAccept:v=>{accept=v;},setConfirm:fn=>{onConfirm=fn;},denyWorld:()=>{worldPermission=false;}};
}
const snapshot=collection=>clone([...collection.values()].map(doc=>doc.toObject()));
function verifyPair(result,source){assert.equal(result.length,2);const root=result.find(item=>item.type==='feat'),child=result.find(item=>item.type==='condition');assert.equal(root.flags.ptu.itemGrants.saved.id,child.id);assert.equal(child.flags.ptu.grantedBy.id,root.id);for(const [doc,original]of[[root,source[0]],[child,source[1]]]){assert.notEqual(doc.id,original.id);assert.deepEqual(clone(doc.system),clone(original.system));assert.deepEqual(clone(doc.flags.ptu.selectedVersion),clone(original.flags.ptu.selectedVersion));}}

test('actual saved clone/save preserves selected return, independent graphs and synchronous ephemeral clone',async()=>{
    for(const type of ['character','pokemon'])for(const selected of [0,1]){
        const h=await harness(),sourceActor=h.actor(type),source=h.seed(sourceActor),before=snapshot(sourceActor.items);
        const ephemeral=source[selected].clone();assert(!(ephemeral instanceof Promise));assert.equal(h.counts().prompts,0);
        for(let repeat=0;repeat<2;repeat++){const result=await source[selected].clone({name:'Requested copy'},{save:true,addSource:true});assert.equal(result.name,'Requested copy');assert.equal(result.type,source[selected].type);assert.equal(result._source._stats.duplicateSource,source[selected].uuid);const additions=[...sourceActor.items.values()].slice(2+repeat*2);assert.equal(additions.length,2);const pair=additions.find(item=>item.type==='feat');assert.equal(pair.flags.ptu.itemGrants.saved.id,additions.find(item=>item.type==='condition').id);assert.equal(additions.find(item=>item.type==='condition').system.value.value,4);}
        assert.deepEqual(snapshot(new Collection([...sourceActor.items].slice(0,2))),before);assert.equal(h.counts().prompts,2);
    }
});

test('actual trainer and inherited Pokémon sheet drop copy parent/child and preserve sources on repeats',async()=>{
    for(const type of ['character','pokemon'])for(const selected of [0,1]){
        const h=await harness(),origin=h.actor(type),target=h.actor(type),source=h.seed(origin),before=snapshot(origin.items),sheet=new(type==='character'?h.TrainerSheet:h.BaseSheet)(target);
        for(let repeat=0;repeat<2;repeat++){const added=await sheet._onDropItem({}, {document:source[selected]});assert.equal(added[0].type,source[selected].type);verifyPair(added,source);}
        assert.deepEqual(snapshot(origin.items),before);assert.equal(target.items.size,4);assert.equal(h.counts().prompts,2);
    }
});

test('actual world clone and world-to-actor copies use only their established world graph',async()=>{
    for(const selected of [0,1]){const h=await harness(),source=h.seed(),before=snapshot(h.world),target=h.actor('pokemon');
        const copy=await source[selected].clone({}, {save:true});assert.equal(copy.type,source[selected].type);verifyPair([...h.world.values()].slice(2),source);
        const result=await new h.BaseSheet(target)._onDropItem({}, {document:source[selected]});verifyPair(result,source);assert.deepEqual(snapshot(new Collection([...h.world].slice(0,2))),before);
    }
});

test('cancel, inaccessible links, inconsistent origins, stale source and non-owner leave source/destination unchanged',async()=>{
    for(const mode of ['cancel','inaccessible','inconsistent','stale','non-owner','unregistered']){const h=await harness(),origin=h.actor(),target=h.actor(),source=h.seed(origin);if(mode==='cancel')h.setAccept(false);if(mode==='inaccessible')source[1].readable=false;if(mode==='inconsistent')source[1].flags.ptu.grantedBy.id='missing';if(mode==='non-owner')target.isOwner=false;if(mode==='unregistered')origin.items.delete(source[0].id);if(mode==='stale')h.setConfirm(()=>{source[1]._source.system.notes='Concurrent change';});const before=snapshot(origin.items);
        if(mode==='cancel'){assert.equal((await h.copySavedItemDocuments([source[0]],{parent:target})).length,0);assert.deepEqual(snapshot(origin.items),before);}
        else await assert.rejects(h.copySavedItemDocuments([source[0]],{parent:target}),/Saved Item copy/);
        assert.equal(target.items.size,0);assert.equal(h.counts().creates,0);if(mode!=='stale')assert.deepEqual(snapshot(origin.items),before);if(['inaccessible','inconsistent','non-owner','unregistered'].includes(mode))assert.equal(h.counts().prompts,0);
    }
});

test('one-sided incoming links refuse, complete selections need no expansion prompt, world create permission stays enforced',async()=>{
    const h=await harness(),source=h.seed(),target=h.actor();delete source[0].flags.ptu.itemGrants;assert(h.hasSavedItemGraph(source[0]));await assert.rejects(h.copySavedItemDocuments([source[0]],{parent:target}),/reciprocal/);assert.equal(h.counts().creates,0);
    const ok=await harness(),pair=ok.seed();verifyPair(await ok.copySavedItemDocuments(pair,{parent:ok.actor()}),pair);assert.equal(ok.counts().prompts,0);ok.denyWorld();await assert.rejects(pair[0].clone({}, {save:true}),/permission/);assert.equal(ok.counts().prompts,0);
});

test('actual folder drop expands missing members once; unrelated contexts with coincident IDs stay independent',async()=>{
    const h=await harness(),worldPair=h.seed(),target=h.actor('pokemon');h.setFolder([worldPair[1]]);const added=await new h.BaseSheet(target)._onDropFolder({},{});assert.equal(added[0].type,'condition');verifyPair(added,worldPair);assert.equal(h.counts().prompts,1);
    const first=h.seed(h.actor()),second=h.seed(h.actor());const result=await h.copySavedItemDocuments([first[0],second[1]],{parent:target});assert.equal(result.length,4);const ids=new Set(result.map(item=>item.id));assert.equal(ids.size,4);for(const root of result.filter(item=>item.type==='feat')){const child=result.find(item=>item.id===root.flags.ptu.itemGrants.saved.id);assert.equal(child.flags.ptu.grantedBy.id,root.id);}
});
