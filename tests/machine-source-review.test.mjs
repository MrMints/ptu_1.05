import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewWords} from '../tools/record-source-review.mjs';
import {itemSourceWords} from '../tools/item-source-review.mjs';
import {checkMachineSourceReview,parsePrintedMachineCells} from '../tools/machine-source-review.mjs';

const base = await loadRecordSourceReview(), hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textHash = value => createHash('sha256').update(value).digest('hex'), words = value => itemSourceWords(value,sourceReviewWords);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,canonical(v)])) : value;
const equal = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const file = 'record-source-review/technical-machines.json', row = id => base.files[file].records.find(r => r.identity === `items.${id}`);
const machine = id => row(id).sourceComparison.machineReview;
function errors(bundle) {
    const errors = [], rows = new Map(Object.values(bundle.files).flatMap(f => f.records).map(r => [r.identity,r]));
    checkMachineSourceReview(bundle,{audit:bundle.itemSource,batch:bundle.batchManifest.batches.find(b => b.id === 'E2'),rows,actualMap:new Map(bundle.source.rows.map(r => [r.identity,r])),hash,equal,textHash,words,fail:(ok,message) => {if (!ok) errors.push(message);},citations:() => {}});
    return errors;
}
function mutated(change) {const b = structuredClone(base);change(b);return errors(b);}

test('all167 frozen machines have independent source/price/target/version limits',() => {
    assert.deepEqual(errors(base),[]);
    assert.equal(base.files[file].records.length,167);
    assert.ok(base.files[file].records.every(r => r.coverageState === 'unresolved'));
    assert.deepEqual(base.itemSource.completedSlices.E2b.machineNumberCorrespondences,{'same-code-and-concept':92,'code/concept differs-or-untraced':75});
});
test('multi-line chart labels keep their own price cell',() => {
    for (const [code,label,price] of [['10','Hidden\nPower',1500],['91','Flash\nCannon',2700],['96','Nature\nPower',2000],['98','Power-Up\nPunch',2300],['99','Dazzling\nGleam',2700]]) {
        const parsed = parsePrintedMachineCells(`${code} - ${label}`,`$${price}`);
        assert.equal(parsed.machineCode,code);assert.equal(parsed.price,price);assert.equal(parsed.moveLabelForDiscovery,label.replace('\n',' '));
    }
    assert.equal(parsePrintedMachineCells('01 - Work Up',''),null);
});
test('original HM prices and once-per-day route remain distinct from numbered consumable TMs',() => {
    const table = base.itemSource.machineSourceTable;
    assert.equal(table.entries.filter(e => e.teachingRoute === 'HM').length,6);
    assert.deepEqual(parsePrintedMachineCells('A1 - Cut','$75'),{machineCode:'A1',moveLabelForDiscovery:'Cut',price:75,teachingRoute:'HM'});
    const fly = machine('OApCU55eBcabKWJl');
    assert.equal(fly.sameOriginalCodeAndConcept,false);
    assert.deepEqual(fly.originalTableRows.map(e => [e.machineCode,e.moveLabelForDiscovery,e.teachingRoute]),[['76','Struggle Bug','TM'],['A2','Fly','HM']]);
});
test('TM01 Work Up cannot inherit Hone Claws pricing from its current number',() => {
    const m = machine('WVJq12fVOCzz8RjA');
    assert.equal(m.sameOriginalCodeAndConcept,false);
    assert.equal(m.originalTableRows[0].moveLabelForDiscovery,'Hone Claws');
    assert.equal(m.targetIdentity,'moves.gCofXErMduyn6zwf');
    assert.ok(m.profileMachineAttestations.some(a => a.printedMachineCode === '01' && a.printedLabelForDiscovery === 'Work Up'));
    assert.equal(m.currentPriceStatus,'unpriced-inherited-field-not-zero');
});
test('eleven text quantities retain their schema type while every current price stays unspecified',() => {
    const all = base.files[file].records;
    assert.equal(all.filter(r => typeof r.sourceComparison.machineReview.currentQuantityValue === 'string').length,11);
    assert.ok(all.every(r => [null,''].includes(r.fieldReview.find(f => f.field === 'system.cost').recordValue)));
    assert.equal(machine('A4qL4A6RHZZXIm2z').currentQuantityValue,'1');
});
test('the complete shared Move parent keeps Natural exceptions and lost capability grants',() => {
    const p = base.itemSource.parentContexts.find(p => p.id === 'pokemon-move-limit-and-capability-grants:core:200');
    assert.match(p.rawText,/maximum of 6 Moves/);
    assert.match(p.rawText,/Natural Tutor/);
    assert.match(p.rawText,/becomes\s+counted as a “Natural” Move/);
    assert.match(p.rawText,/bonuses are lost if the Move is ever forgotten/);
});
test('Return retains its old literal ally-hit effect and the independently unresolved current plus target',() => {
    const m = machine('6DX8DwQTLcSBoCKs');
    assert.equal(m.targetIdentity,'moves.ZfiKeomwzV8LtjDx');
    assert.equal(m.targetSourceCoverageState,'unresolved');
    assert.ok(m.historicalLiteralComparisons.every(c => c.exactOrderedWords === false));
    assert.ok(m.historicalLiteralComparisons[0].wordDifferences.some(d => /non fainted/.test(d.record)));
});
test('Electric Terrain keeps10 Damage Bonus versus2 Damage Base as a real historical difference',() => {
    const differences = machine('Kdp5PkP3KazEJyKK').historicalLiteralComparisons[0].wordDifferences;
    assert.ok(differences.some(d => d.record === '2' && d.source === '10 bonus to'));
    assert.ok(differences.some(d => d.record === 'base' && d.source === 'rolls'));
});
test('literal line-break formatting cannot create or hide Aurora Veil version differences',() => {
    const m = machine('qmBIECfNhw4N4j3v');
    assert.ok(m.historicalLiteralComparisons.every(c => !c.exactOrderedWords));
    assert.deepEqual(m.historicalLiteralComparisons[0].wordDifferences,[{record:'',source:'blessing'}]);
    assert.equal(words('same\\nSpecial'),words('same\nSpecial'));
});
test('a neighboring table price cannot be substituted while the true row remains present',() => {
    const result = mutated(b => {b.itemSource.machineSourceTable.entries.find(e => e.machineCode === '10').price = 4200;});
    assert.ok(result.some(e => e.includes('label/price/cell association')));
});
test('an unspecified current price cannot be reinterpreted as a free machine',() => {
    const result = mutated(b => {b.source.rows.find(r => r.identity === 'items.0xWbyuCQkWVeCiUj').data.system.cost = 0;});
    assert.ok(result.some(e => e.includes('unpriced current wrapper')));
});
test('an embedded Move cannot be replaced by another stable target under the same machine label',() => {
    const result = mutated(b => {
        b.files[file].records.find(r => r.identity === 'items.0xWbyuCQkWVeCiUj').sourceComparison.machineReview.targetIdentity = 'moves.ZfiKeomwzV8LtjDx';
    });
    assert.ok(result.some(e => e.includes('exact embedded target/source')));
});
