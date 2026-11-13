import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STARTER_TRAINING_GRANT as grant, STARTER_TRAINING_CHOICES as choices,
    shouldOfferStarterTraining, selectStarterTraining, hasStarterTraining,isStarterTrainingGrant} from '../src/util/starter-training.js';
const source=JSON.parse(await readFile('packs/effects/_source/fm0TZUuQK0uRhkJA.json','utf8'));
function fixture(create) {
    const actor={isOwner:true,items:[],flags:{ptu:{starterTraining:{status:'pending'}}},
        async setFlag(scope,key,value){this.flags[scope][key]=value;},createEmbeddedDocuments:create};
    return {actor,services:{load:async()=>({...source,uuid:grant}),copy:()=>structuredClone(source),warn:()=>{}}};
}
test('only new empty trainers are offered selection; imports, copies and populated actors stay untouched',()=>{
    assert.ok(shouldOfferStarterTraining({type:'character'}));
    for(const data of [{type:'pokemon'},{type:'character',items:[{name:'Custom Training'}]},
        {type:'character',_stats:{duplicateSource:'Actor.legacy'}},{type:'character',_stats:{compendiumSource:'Compendium.custom.actors.Actor.original'}},
        {type:'character',flags:{ptu:{starterTraining:{status:'pending'}}}}]) assert.equal(shouldOfferStarterTraining(data),false);
    assert.equal(shouldOfferStarterTraining({type:'character'},{keepId:true}),false);
});
test('all four exact historical choices resolve to core prerequisites without changing source records',async()=>{
    assert.ok(isStarterTrainingGrant({pack:'ptu.effects',uuid:grant,_stats:{compendiumSource:null}}));
    assert.equal(isStarterTrainingGrant({pack:'ptu.effects',uuid:'Compendium.ptu.effects.Item.0000000000000000',_stats:{compendiumSource:grant}}),false);
    const before=JSON.stringify(source);
    assert.deepEqual(source.system.rules[0].choices.map(row=>row.value),choices);
    const expected=[['Novice Athletics','Untrained Command'],['Novice Intimidate','Untrained Command'],['Novice Command'],['Novice Charm','Untrained Command']];
    for(let n=0;n<choices.length;n++){
        const data=JSON.parse(await readFile(`packs/feats/_source/${choices[n].split('.').at(-1)}.json`));
        assert.equal(data.type,'feat'); assert.deepEqual(data.system.prerequisites,expected[n]);
    }
    assert.equal(JSON.stringify(source),before);
});
test('selection, duplicate calls and completed repeat create one marked Feature with stable identity',async()=>{
    let calls=0;
    const f=fixture(async(type,[data],context)=>{
        calls++;assert.equal(context.ptuStarterTraining,true);
        const rule=data.system.rules.find(r=>r.key==='GrantItem');assert.equal(rule.allowduplicate,false);
        const item={id:'owned',_stats:{compendiumSource:choices[0]},flags:rule.overwrites.flags};f.actor.items.push(item);return[item];
    });
    const before=JSON.stringify(source);
    await Promise.all([selectStarterTraining(f.actor,f.services),selectStarterTraining(f.actor,f.services)]);
    assert.equal(calls,1);assert.ok(hasStarterTraining(f.actor));
    await selectStarterTraining(f.actor,f.services);assert.equal(calls,1);assert.equal(JSON.stringify(source),before);
});
test('cancellation writes no completed choice and permits explicit retry; observers cannot apply',async()=>{
    let calls=0;const f=fixture(async()=>{calls++;throw Error('PTU | ChoiceSetRuleElement | No selection made.');});
    assert.equal((await selectStarterTraining(f.actor,f.services)).status,'cancelled');
    assert.equal(f.actor.flags.ptu.starterTraining.status,'pending');assert.equal(f.actor.items.length,0);
    await selectStarterTraining(f.actor,f.services);assert.equal(calls,2);
    f.actor.isOwner=false;assert.equal((await selectStarterTraining(f.actor,f.services)).status,'not-owner');assert.equal(calls,2);
});
test('changed source relationship refuses creation; existing identities are filtered independently of labels',async()=>{
    const f=fixture(async(type,[data])=>{
        assert.equal(data.system.rules[0].choices.some(x=>x.value===choices[0]),false);
        throw Error('No selection made');
    });
    f.actor.items.push({name:'Renamed choice',_stats:{compendiumSource:choices[0]},flags:{}});
    await selectStarterTraining(f.actor,f.services);
    f.services.copy=()=>({...structuredClone(source),system:{rules:[]}});
    await assert.rejects(selectStarterTraining(f.actor,f.services),/relationships changed/);
});
