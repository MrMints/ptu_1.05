import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {itemSourceWords} from '../tools/item-source-review.mjs';
import {consumableComparableWords} from '../tools/consumable-source-derivation.mjs';
import {checkConsumableSourceReview} from '../tools/consumable-source-review.mjs';

const base = await loadRecordSourceReview(), hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex'), textHash = v => createHash('sha256').update(v).digest('hex');
const words = v => itemSourceWords(v,sourceReviewWords), comparable = v => consumableComparableWords(v,words);
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b)).map(([k,x]) => [k,canonical(x)])) : v;
const equal = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const file = 'record-source-review/consumables.json';
const row = id => base.files[file].records.find(r => r.identity === `items.${id}`);
const unit = label => base.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === label);
function errors(b) {
    const errors = [], rows = new Map(Object.values(b.files).flatMap(f => f.records).map(r => [r.identity,r]));
    checkConsumableSourceReview(b,{audit:b.itemSource,batch:b.batchManifest.batches.find(x => x.id === 'E2'),rows,actualMap:new Map(b.source.rows.map(r => [r.identity,r])),hash,equal,textHash,words,cleanText:sourceReviewText,fail:(ok,message) => {if (!ok) errors.push(message);},citations:() => {}});
    return errors;
}

// Deliberately refresh all derived declarations/checksums, not just one hash.
// The immutable raw cells/prose/full footnotes must still reject invented views.
function refreshDerived(b) {
    const audit = b.itemSource, source = audit.consumableSource, units = new Map(source.sourceDefinitions.map(u => [u.id,u])), docs = new Map(b.source.rows.map(r => [r.identity,r.data])), closure = audit.completedSlices.E2c;
    for (const u of units.values()) {u.effectWordsSha256 = textHash(words(u.effect));for (const v of u.effectViews) v.wordsSha256 = textHash(words(v.text));}
    source.sourceDefinitionSetSemanticSha256 = hash(source.sourceDefinitions);source.tableSetSemanticSha256 = hash(source.tables);
    closure.consumableSourceDefinitionSetSemanticSha256 = hash(source.sourceDefinitions);closure.consumableTableSetSemanticSha256 = hash(source.tables);
    const counts = {};let bodyCount = 0;
    for (const row of b.files[file].records) {
        const doc = docs.get(row.identity), d = row.sourceComparison.consumableReview, e = audit.currentRecordAudit[row.identity];let body = false, price = false, baseModifier = null;
        const facts = [];
        for (const c of d.sourceComparisons) {
            const u = units.get(c.sourceUnit), cost = doc.system.cost, parsed = cost === null || String(cost).trim() === '' ? null : Number(cost);
            let prices = u.priceFacts;
            if (u.modificationCostFact) prices = [{amount:u.modificationCostFact.cash,role:u.modificationCostFact.role,requiredIngredient:u.modificationCostFact.requiredIngredient,retailPriceEstablished:false}];
            if (u.derivedProductPriceFacts?.[doc.name]) prices = [u.derivedProductPriceFacts[doc.name]];
            c.sourceEvidenceSha256 = hash(u);c.matchingEffectViewIndices = u.effectViews.flatMap((v,i) => comparable(v.text) === comparable(doc.system.effect) ? [i] : []);
            c.currentEffectComparableSha256 = textHash(comparable(doc.system.effect));c.sourceViewComparableSha256 = u.effectViews.map(v => textHash(comparable(v.text)));
            c.priceFacts = prices;c.priceCorrespondence = prices.length ? prices.some(f => f.amount === parsed) : parsed === null;c.currentParsedPrice = parsed;
            c.sourceBaseModifierValue = u.baseCaptureModifier;c.baseModifierCorrespondence = u.kind === 'capture-ball' ? typeof doc.system.modifier === 'number' && doc.system.modifier === u.baseCaptureModifier : null;
            body ||= c.matchingEffectViewIndices.length > 0;price ||= c.priceCorrespondence;if (c.baseModifierCorrespondence !== null) baseModifier = c.baseModifierCorrespondence;
            facts.push({sourceUnit:u.id,kind:u.kind,effect:u.effect,tier:u.tier,priceFacts:prices,weakeningBerryFacts:u.weakeningBerryFacts ?? null,modificationCostFact:u.modificationCostFact ?? null,onceEverOnPokemon:u.onceEverOnPokemon ?? null});
        }
        d.sourceFacts = facts;d.bodyCorrespondence = body;d.priceCorrespondence = price;d.baseModifierCorrespondence = baseModifier;
        row.coverageState = body && price && baseModifier !== false ? 'reviewed' : 'unresolved';
        row.recordClass = row.coverageState === 'reviewed' ? 'examined-item-source-correspondence' : 'examined-item-version-or-authority-limit';
        e.consumableReviewSha256 = hash(d);e.dispositionEvidenceSha256 = hash(row);
        counts[row.coverageState] = (counts[row.coverageState] ?? 0) + 1;bodyCount += Number(body);
    }
    closure.counts = counts;closure.bodyCorrespondences = bodyCount;closure.recordEvidenceSemanticSha256 = hash(b.files[file]);
}
function tamper(change) {const b = structuredClone(base);change(b);refreshDerived(b);return {bundle:b,errors:errors(b)};}
const rejectsReconstruction = result => assert.ok(result.errors.some(e => e.includes('do not reconstruct from raw source')),result.errors.join('\n'));

test('all176 C records retain complete raw source and bounded field dispositions',() => {
    assert.deepEqual(errors(base),[]);assert.equal(base.files[file].records.length,176);
    assert.deepEqual(base.itemSource.completedSlices.E2c.counts,{reviewed:134,unresolved:42});
    assert.equal(base.itemSource.consumableSource.sourceDefinitions.filter(u => u.tableAnchor).length,142);
    assert.equal(base.itemSource.consumableSource.sourceDefinitions.filter(u => u.proseAnchor).length,19);
});
test('all176 C quantities stay text and the eleven-count remains in B',() => {
    assert.ok(base.files[file].records.every(r => r.sourceComparison.consumableReview.currentLegacyMetadata.quantity === '1'));
    assert.equal(base.files['record-source-review/technical-machines.json'].records.filter(r => typeof r.sourceComparison.machineReview.currentQuantityValue === 'string').length,11);
});
test('an edited Ultra view/base cannot manufacture correspondence after every derived hash is refreshed',() => {
    const result = tamper(b => {
        const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Ultra Ball');
        u.baseCaptureModifier = -20;for (const v of u.effectViews) v.text = v.text.replaceAll('-15','-20');
    });
    assert.equal(result.bundle.files[file].records.find(r => r.identity === 'items.yJco0xyHka0Bfk0C').coverageState,'reviewed');
    rejectsReconstruction(result);
});
test('changing a stat amount or sign and refreshing hashes still fails raw-cell reconstruction',() => {
    for (const alter of [text => text.replace('Stat 1','Stat 2'),text => text.replace('Raise','Lower')]) {
        rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'HP Up');u.effect = alter(u.effect);for (const v of u.effectViews) v.text = alter(v.text);}));
    }
});
test('a weakened super-effective condition is rejected with refreshed view and record hashes',() => {
    rejectsReconstruction(tamper(b => {
        const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Rindo Berry');
        u.weakeningBerryFacts.requiresSuperEffective = false;for (const v of u.effectViews) v.text = v.text.replaceAll('super effective ','');
    }));
    assert.equal(unit('Chilan Berry').weakeningBerryFacts.requiresSuperEffective,false);
    assert.equal(unit('Rindo Berry').weakeningBerryFacts.requiresSuperEffective,true);
});
test('dropping the Poison-Type target noun cannot survive refreshed derived hashes',() => {
    rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Black Sludge');for (const v of u.effectViews) v.text = v.text.replace('Poison-Type ','');}));
    assert.notEqual(comparable('Poison-Type Pokémon may consume'),comparable('Pokémon may consume'));
    assert.notEqual(comparable('may not consume'),comparable('may consume'));
});
test('a changed Berry tier and price do not replace the original tier cell',() => {
    rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Oran Berry');u.tier = 2;u.priceFacts[0].tier = 2;u.priceFacts[0].amount = 250;for (const v of u.effectViews) v.text = v.text.replace('Tier 1','Tier 2');}));
});
test('omitting complete Treat footnote views is rejected even with refreshed closure hashes',() => {
    rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Figy Berry');u.effectViews = u.effectViews.filter(v => !v.parentContextIds.includes('e2-consumable-parent:core:283'));}));
});
test('May naming stays separate from core and does not select the full revised mechanic',() => {
    const u = unit('Candy Bar');assert.ok(u.effectViews.some(v => v.sourceKind === 'standard-core' && v.text.includes('Digestion Buff')));
    assert.ok(u.effectViews.some(v => v.sourceKind === 'explicit-errata-in-may-playtest' && v.text.includes('Food Buff')));
    assert.equal(row('DbMh7oSIBQdOinsl').sourceComparison.consumableReview.selectedVersionStatus,'not-verified; no automatic adoption or blended-version authority');
    rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Candy Bar');u.effectViews.find(v => v.text.includes('Food Buff')).sourceKind = 'standard-core';}));
});
test('recipe modification fees cannot become finished-ball retail prices by refreshing metadata',() => {
    const u = unit('Type Modification');assert.equal(u.modificationCostFact.cash,300);assert.equal(u.modificationCostFact.requiredIngredient,'Net Ball');assert.equal(u.modificationCostFact.finishedBallRetailEstablished,false);
    rejectsReconstruction(tamper(b => {const u = b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Type Modification');u.modificationCostFact.role = 'printed-retail';u.modificationCostFact.finishedBallRetailEstablished = true;}));
});
test('removing the once-ever footer cannot produce a complete source review after refreshed hashes',() => {
    const result = tamper(b => {const p = b.itemSource.parentContexts.find(p => p.id === 'e2-consumable-parent:porygon:83');p.rawText = p.rawText.replace('work once on a \nPokémon. Ever.','work repeatedly on a \nPokémon.');p.rawSha256 = textHash(p.rawText);b.itemSource.consumableSource.sourceDefinitions.find(u => u.labelForDiscovery === 'Learning Modification').onceEverOnPokemon = false;});
    assert.ok(result.errors.some(e => e.includes('independently read raw source')));rejectsReconstruction(result);
});
test('ingredient/key labels do not turn Shuckle Juice into a Berry or Iron Ball into food use',() => {
    const detail = id => row(id).sourceComparison.consumableReview;
    assert.equal(detail('7fMNsUfMhbr6ZB8W').sourceFacts[0].kind,'refreshment');assert.equal(detail('ewGvyFGcqKkMAOS3').sourceFacts[0].kind,'held-item');
    assert.equal(unit('Heart Booster').priceFacts[0].amount,9800);
    const pp = unit('PP Up');assert.ok(pp.effectViews.some(v => v.text.includes('At-Will Moves cannot')));
});
test('an absent Heavy Ball scalar never becomes a demonstrated zero default',() => {
    const d = row('0W7lg1gF7uWIYtsU').sourceComparison.consumableReview;
    assert.equal(d.bodyCorrespondence,true);assert.equal(d.baseModifierCorrespondence,false);assert.equal(row('0W7lg1gF7uWIYtsU').coverageState,'unresolved');
});
test('same-slug healing targets retain distinct IDs and exact persistent formulas',() => {
    for (const [id,target,denominator] of [['JEHdxfn8EPwDrYmm','effects.MdsaTbmEPwcLaMVm',8],['gKLH9MtGnLh0OPR4','effects.e6wwb737Gl54C8oG',16]]) {
        const reference = base.itemSource.currentRecordAudit[`items.${id}`].references[0];assert.equal(reference.targetIdentity,target);assert.equal(reference.path,'$.system.referenceEffect');
        assert.equal(reference.targetSystem.slug,'leftovers');assert.equal(reference.targetSystem.persistent.formula,`-floor(@actor.system.health.total / ${denominator})`);
        assert.match(reference.targetSourceAssessment,/unverified/);
    }
});
