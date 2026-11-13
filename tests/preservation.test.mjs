import test from 'node:test';
import assert from 'node:assert/strict';
import {Migration111PrereqItems} from '../src/module/migration/migrations/111-prereq-items.js';
import {Migration113Keywords} from '../src/module/migration/migrations/113-keywords.js';
import {Migration115RulesAutomation} from '../src/module/migration/migrations/115-rules-automation.js';
import {MigrationRunner} from '../src/module/migration/runner/index.js';
import {compendiumItemIdentity,resolvePreservationSource} from '../src/util/preservation.js';
import {createCompendiumRefreshUpdate} from '../src/util/document-source.js';

const original='Compendium.p02p.sources.Item.AAAAAAAAAAAAAAAA';
const revised='Compendium.p02p.sources.Item.BBBBBBBBBBBBBBBB';
const source=(uuid=original)=>({uuid,type:'move',pack:'p02p.sources',name:'Same Name',system:{
    prerequisites:[uuid===original?'Novice Focus':'Master Focus'],keywords:['Source'],range:{target:'Source'},
    rules:[{key:'RollOption',option:'p02p-synthetic'}],referenceEffect:'Compendium.p02p.sources.Item.CCCCCCCCCCCCCCCC'}});
const item=(type='move')=>({_id:'saved00000000001',name:'Renamed saved record',type,
    _stats:{compendiumSource:original},flags:{core:{sourceId:revised},ptu:{selectedVersion:{id:'synthetic-original'},rulesSelections:{choice:'saved'},itemGrants:{saved:{id:'grant00000000001'}}}},
    system:{schema:{version:0.110},slug:'same-name',prerequisites:['Custom raw requirement'],keywords:['Custom'],range:{target:'Custom'},
        rules:[{key:'CustomRule',value:9}],referenceEffect:null,enabled:false,custom:{value:42}}});
const migrations=()=>[new Migration111PrereqItems(),new Migration113Keywords(),new Migration115RulesAutomation()];
const emptyCollection=()=>({contents:[],documentClass:{updateDocuments:async()=>[]}});

async function env(action) {
    const keys=['game','foundry','ui','fromUuid','$'];
    const previous=keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
    const notices=[],calls=[];let worldSchema=0.110;
    Object.assign(globalThis,{
        foundry:{utils:{deepClone:structuredClone,diffObject:(a,b)=>JSON.stringify(a)===JSON.stringify(b)?{}:b}},
        ui:{notifications:Object.fromEntries(['info','warn','error'].map(k=>[k,(...args)=>notices.push({kind:k,args})]))},
        $:()=>({length:0}),
        fromUuid:async uuid=>{calls.push(uuid);return source(uuid);},
        game:{version:'13.351',system:{version:'4.4.3'},i18n:{format:key=>key,localize:key=>key},
            settings:{get:()=>worldSchema,set:async(scope,key,value)=>{worldSchema=value;}},
            actors:emptyCollection(),items:emptyCollection(),journal:[],macros:[],tables:[],users:[],scenes:[]}
    });
    try{return await action({notices,calls,worldSchema:()=>worldSchema});}
    finally{for(const [key,descriptor] of previous)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];}
}

test('preservation identity requires the full compendium identity; typed and legacy agree',()=>{
    assert.equal(compendiumItemIdentity(original),original);
    assert.equal(compendiumItemIdentity(original.replace('.Item.','.')),original);
    for(const value of ['AAAAAAAAAAAAAAAA','Item.AAAAAAAAAAAAAAAA',original+'x',original+'.extra',null])assert.equal(compendiumItemIdentity(value),null);
});

test('exact modern identity wins conflicts; missing/invalid modern identity never falls back',()=>env(async({calls,notices})=>{
    const saved=item();assert.equal((await resolvePreservationSource(saved)).uuid,original);assert.deepEqual(calls,[original]);
    for(const modern of ['not-an-identity',original]){
        globalThis.fromUuid=async()=>null;saved._stats.compendiumSource=modern;
        const before=structuredClone(saved);assert.equal(await resolvePreservationSource(saved),null);assert.deepEqual(saved,before);
    }
    assert.equal(notices.length,2);
}));

test('legacy full identity resolves renamed records; wrong namespace, type, and known excluded identities preserve',()=>env(async({calls})=>{
    const saved=item();delete saved._stats;saved.flags.core.sourceId=original.replace('.Item.','.');
    assert.equal(compendiumItemIdentity((await resolvePreservationSource(saved)).uuid),original);
    for(const resolved of [{...source(),uuid:revised},{...source(),type:'feat'},{...source(),uuid:original.replace('p02p','other')}]){
        globalThis.fromUuid=async()=>resolved;assert.equal(await resolvePreservationSource(saved),null);
    }
    saved.flags.core.sourceId='Compendium.ptu.species.Item.dkQPNz0RLbgzWMLq';
    const before=calls.length;assert.equal(await resolvePreservationSource(saved),null);assert.equal(calls.length,before);
}));

test('custom records and same-name records without exact provenance never trigger source search',()=>env(async({calls})=>{
    const custom=item();delete custom._stats;delete custom.flags.core;
    for(const M of [Migration111PrereqItems,Migration113Keywords,Migration115RulesAutomation]){
        const saved=structuredClone(custom);saved.type=M===Migration111PrereqItems?'feat':'move';saved.system={schema:{version:0.110},slug:'same-name'};
        const before=structuredClone(saved);await new M().updateItem(saved);assert.deepEqual(saved,before);
    }
    assert.deepEqual(calls,[]);
}));

test('0.111/0.113/0.115 preserve all saved/custom values, grants and selections on repeated calls',()=>env(async()=>{
    for(const type of ['feat','edge','pokeedge','move','item']){
        const saved=item(type),before=structuredClone(saved);
        for(let n=0;n<2;n++)for(const migration of migrations())await migration.updateItem(saved);
        assert.deepEqual(saved,before);
    }
}));

test('0.111 fills absent prerequisites from each exact same-name version without aliasing source data',()=>env(async()=>{
    for(const uuid of [original,revised])for(const type of ['feat','edge','pokeedge']){
        const saved=item(type);saved._stats.compendiumSource=uuid;delete saved.system.prerequisites;
        const doc={...source(uuid),type};globalThis.fromUuid=async()=>doc;
        await new Migration111PrereqItems().updateItem(saved);
        assert.deepEqual(saved.system.prerequisites,doc.system.prerequisites);assert.notEqual(saved.system.prerequisites,doc.system.prerequisites);
        const once=structuredClone(saved);await new Migration111PrereqItems().updateItem(saved);assert.deepEqual(saved,once);
    }
}));

test('0.113 preserves legacy tags and converts a local array without replacing custom keywords/range',()=>env(async()=>{
    const saved=item('feat');delete saved.system.keywords;saved.system.tags=['Custom Tag'];
    await new Migration113Keywords().updateItem(saved);assert.deepEqual(saved.system.keywords,['Custom Tag']);assert.deepEqual(saved.system.tags,['Custom Tag']);
    const unknown=item('feat');delete unknown.system.keywords;unknown.system.tags='Custom tag syntax';
    const before=structuredClone(unknown);await new Migration113Keywords().updateItem(unknown);assert.deepEqual(unknown,before);
    const missing=item();delete missing.system.keywords;delete missing.system.range;
    await new Migration113Keywords().updateItem(missing);assert.deepEqual(missing.system.range,source().system.range);assert.deepEqual(missing.system.keywords,['Source']);
}));

test('0.115 installs one absent automation payload but never blends empty/custom/partial payloads',()=>env(async()=>{
    const saved=item();delete saved.system.rules;delete saved.system.referenceEffect;
    await new Migration115RulesAutomation().updateItem(saved);const once=structuredClone(saved);
    await new Migration115RulesAutomation().updateItem(saved);assert.deepEqual(saved,once);assert.equal(saved.system.rules.length,1);
    for(const existing of [{rules:[]},{rules:null},{referenceEffect:'Item.custom'},{rules:[{key:'Custom'}],referenceEffect:null}]){
        const partial=item();delete partial.system.rules;delete partial.system.referenceEffect;Object.assign(partial.system,existing);
        const before=structuredClone(partial);await new Migration115RulesAutomation().updateItem(partial);assert.deepEqual(partial,before);
    }
}));

test('refresh fills missing fields, preserves entire existing system values, and never stamps source schema',()=>{
    const current=item('feat'),latest={...source(),type:'feat'};latest.system.description='Source description';latest.system.schema={version:0.115};
    current.img='custom.svg';const before=structuredClone(current);const update=createCompendiumRefreshUpdate(current,latest,'default.svg');
    assert.deepEqual(update.system,{...current.system,description:'Source description'});assert.equal(update.img,'custom.svg');assert.deepEqual(current,before);
    assert.deepEqual(createCompendiumRefreshUpdate({...current,...update},latest,'default.svg'),update);
    const minimal={type:'move',system:{rules:[]},img:'default.svg'};
    const filled=createCompendiumRefreshUpdate(minimal,{...source(),img:'source.svg'},'default.svg');
    assert.equal(filled.img,'source.svg');assert.deepEqual(filled.system.rules,[]);assert.equal(Object.hasOwn(filled.system,'referenceEffect'),false);assert.equal(Object.hasOwn(filled.system,'schema'),false);
});

test('actual runner transforms older snapshots/embedded Items without mutating inputs; repeated schema record is stable',()=>env(async()=>{
    const saved=item('feat');delete saved.system.prerequisites;delete saved.system.schema;
    globalThis.fromUuid=async()=>({...source(),type:'feat'});
    const actor={_id:'actor00000000001',type:'character',system:{schema:{version:0.110}},items:[saved],effects:[]};
    const before=structuredClone(actor);const runner=new MigrationRunner(migrations());
    const updated=await runner.getUpdatedActor(actor,runner.migrations);assert.deepEqual(actor,before);
    assert.deepEqual(updated.items[0].system.prerequisites,['Novice Focus']);assert.deepEqual(updated.items[0].flags,saved.flags);
    assert.equal(updated.system.schema.version,0.115);assert.equal(updated.items[0].system.schema.version,0.115);
    assert.deepEqual(await runner.getUpdatedActor(updated,runner.migrations),updated);
    const raw={type:'feat',system:{}};assert.equal((await runner.getUpdatedItem(raw,[{version:0.111,updateItem:async()=>{}}])).system.schema.version,0.111);
}));

test('ensureSchemaVersion fails atomically, retains old stamp, then retries only through the supplied completed target',()=>env(async()=>{
    let failing=true;const doc={_source:item(),get schemaVersion(){return this._source.system.schema.version;},updateSource(value){this._source=structuredClone(value);}};
    const migration={version:0.111,updateItem:async data=>{data.system.newField='valid';if(failing)throw Error('Injected transform failure');}};
    const before=structuredClone(doc._source);await assert.rejects(MigrationRunner.ensureSchemaVersion(doc,[migration]),/Injected/);assert.deepEqual(doc._source,before);
    failing=false;await MigrationRunner.ensureSchemaVersion(doc,[migration]);assert.equal(doc.schemaVersion,0.111);assert.equal(doc._source.system.newField,'valid');
    const once=structuredClone(doc._source);await MigrationRunner.ensureSchemaVersion(doc,[migration]);assert.deepEqual(doc._source,once);
}));

test('world entrypoint refuses false success on transform/write failures and safely retries persisted Items',()=>env(async({worldSchema})=>{
    let failTransform=true,failWrite=false;const saved=item();const before=structuredClone(saved);
    const document={toObject:()=>structuredClone(saved)};
    game.items={contents:[document],documentClass:{updateDocuments:async updates=>{if(failWrite)throw Error('Injected write failure');Object.assign(saved,structuredClone(updates[0]));}}};
    const migration={version:0.115,updateItem:async data=>{if(failTransform)throw Error('Injected transform failure');data.system.newField='valid';}};
    await assert.rejects(new MigrationRunner([migration]).runMigration(),/Injected transform/);assert.equal(worldSchema(),0.110);assert.deepEqual(saved,before);
    failTransform=false;failWrite=true;await assert.rejects(new MigrationRunner([migration]).runMigration(),/Injected write/);assert.equal(worldSchema(),0.110);assert.deepEqual(saved,before);
    failWrite=false;await new MigrationRunner([migration]).runMigration();assert.equal(worldSchema(),0.115);assert.equal(saved.system.newField,'valid');
    const once=structuredClone(saved);await new MigrationRunner([migration]).runMigration(true);assert.deepEqual(saved,once);
}));

test('world stamp also waits for embedded and free-form failures; retry does not duplicate an inserted Item',()=>env(async({worldSchema})=>{
    let fail=true;const actor={_id:'actor00000000001',type:'character',system:{schema:{version:0.110}},items:[],effects:[]};
    const doc={items:[],effects:[],toObject:()=>structuredClone(actor),createEmbeddedDocuments:async(type,items)=>{if(fail)throw Error('Injected embedded failure');actor.items.push(...structuredClone(items));doc.items=actor.items.map(i=>({id:i._id}));}};
    game.actors={contents:[doc],documentClass:{updateDocuments:async updates=>{const {items,...update}=updates[0];Object.assign(actor,update);}}};
    const migration={version:0.115,updateActor:async data=>{if(!data.items.some(i=>i._id==='insert0000000001'))data.items.push({_id:'insert0000000001',type:'edge',system:{}});}};
    await assert.rejects(new MigrationRunner([migration]).runMigration(),/Injected embedded/);assert.equal(worldSchema(),0.110);assert.equal(actor.items.length,0);
    fail=false;await new MigrationRunner([migration]).runMigration();assert.equal(actor.items.length,1);assert.equal(actor.system.schema.version,0.115);
    await new MigrationRunner([migration]).runMigration(true);assert.equal(actor.items.length,1);
    game.actors=emptyCollection();await game.settings.set('ptu','worldSchemaVersion',0.110);
    await assert.rejects(new MigrationRunner([{version:0.115,migrate:async()=>{throw Error('Injected free-form failure');}}]).runMigration(),/phase failed/);
    assert.equal(worldSchema(),0.110);
}));

test('an exact source lookup exception aborts transformation without exposing a partially stamped document',()=>env(async()=>{
    const saved=item('feat');delete saved.system.prerequisites;
    const before=structuredClone(saved);globalThis.fromUuid=async()=>{throw Error('Injected resolver failure');};
    const runner=new MigrationRunner(migrations());await assert.rejects(runner.getUpdatedItem(saved,runner.migrations),/resolver failure/);assert.deepEqual(saved,before);
}));

test('actor ensure entrypoint retains every Item on failure and stamps children only after successful retry',()=>env(async()=>{
    let fail=true;const doc={_source:{type:'character',system:{schema:{version:0.110}},items:[item('feat')],effects:[]},
        get schemaVersion(){return this._source.system.schema.version;},updateSource(value){this._source=structuredClone(value);}};
    const migration={version:0.115,updateItem:async data=>{data.system.newField='legitimate';if(fail)throw Error('Injected child failure');}};
    const before=structuredClone(doc._source);await assert.rejects(MigrationRunner.ensureSchemaVersion(doc,[migration]),/child failure/);assert.deepEqual(doc._source,before);
    fail=false;await MigrationRunner.ensureSchemaVersion(doc,[migration]);assert.equal(doc.schemaVersion,0.115);assert.equal(doc._source.items[0].system.schema.version,0.115);
    assert.deepEqual(doc._source.items[0].flags,before.items[0].flags);
}));
