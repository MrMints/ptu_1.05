import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EXCLUDED_CONTENT,contentIdentity,isExcludedContent,isExcludedAcquisitionDocument,filterNewContent,assertCompleteSupportedContent} from '../src/util/content-scope.js';
import {createContentInventory} from '../tools/content-scope.mjs';
test('exclusion uses exact reviewed identity across typed/legacy UUIDs and preserves custom labels/IDs',()=>{
    for(const identity of EXCLUDED_CONTENT){const [pack,id]=identity.split('.');assert.ok(isExcludedContent(`Compendium.ptu.${pack}.Item.${id}`));assert.ok(isExcludedContent(`Compendium.ptu.${pack}.${id}`));}
    assert.equal(contentIdentity('Compendium.custom.species.Item.dkQPNz0RLbgzWMLq'),null);
    const custom={name:'Dipplin',uuid:'Item.dkQPNz0RLbgzWMLq'};
    assert.deepEqual(filterNewContent([custom,{uuid:'Compendium.ptu.species.Item.dkQPNz0RLbgzWMLq'}]),[custom]);
    assert.equal(isExcludedContent('Compendium.ptu.species.Item.dkQPNz0RLbgzWMLqq'),false);
});
test('policy equals owner scope ledger; full inventory separates eligibility, approval, verification and dependencies',async()=>{
    const owner=JSON.parse(await readFile('docs/data/supported-content-scope.json'));
    assert.deepEqual([...EXCLUDED_CONTENT].sort(),owner.knownExcludedConsumers.map(x=>x.identity).sort());
    const inventory=await createContentInventory();assert.equal(inventory.records.length,7395);
    assert.equal(inventory.counts.excluded,3);assert.equal(inventory.counts.eligible,6);
    const bulb=inventory.records.find(r=>r.identity==='species.QE7WhquxeuebiEVQ');
    assert.equal(bulb.generationEligibility,'eligible');assert.equal(bulb.ruleVersionApproval,'unclassified');
    assert.ok(inventory.dependencies.blockers.length);assert.throws(()=>assertCompleteSupportedContent(inventory),/release blocked/);
});
test('actual compendium documents are acquisition; saved/imported/world copies retain excluded provenance',()=>{
    const uuid='Compendium.ptu.effects.Item.3w7uQfBvzzxATXis';
    assert.ok(isExcludedAcquisitionDocument({pack:'ptu.effects',uuid}));
    for(const document of [{uuid:'Item.savedIdentifier1',_stats:{compendiumSource:uuid}},
        {uuid:'Item.savedIdentifier1',pack:null,flags:{core:{sourceId:uuid}}},
        {_id:'savedIdentifier1',_stats:{compendiumSource:uuid},flags:{user:{custom:2}}}]) assert.equal(isExcludedAcquisitionDocument(document),false);
});
test('release gate rejects partial classifications and unresolved dependencies instead of promoting a candidate',()=>{
    const ready={completeSupportedScope:true,counts:{unclassifiedGeneration:0,unapprovedRuleVersion:0},dependencies:{blockers:[]}};
    assert.doesNotThrow(()=>assertCompleteSupportedContent(ready));
    for(const inventory of [{...ready,completeSupportedScope:false},{...ready,counts:{...ready.counts,unclassifiedGeneration:1}},
        {...ready,counts:{...ready.counts,unapprovedRuleVersion:1}},{...ready,dependencies:{blockers:[{target:'missing'}]}}])assert.throws(()=>assertCompleteSupportedContent(inventory),/release blocked/);
});
