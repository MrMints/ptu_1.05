import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRecordSourceReview, recordSourceReviewErrors} from '../tools/record-source-review.mjs';

const original = await loadRecordSourceReview();
const copy = () => ({...original, ...structuredClone({index: original.index, files: original.files, dependencyReview: original.dependencyReview, dex: original.dex})});
const records = data => Object.values(data.files).flatMap(file => file.records);
test('record source snapshot keeps exact inventory, separate field axes and complete first dependency coverage', () => {
    assert.deepEqual(recordSourceReviewErrors(original), []);
});
test('record review rejects stale hashes and duplicated source dispositions', () => {
    const data = copy(), file = Object.values(data.files)[0];
    file.records[0].contentHash = '0'.repeat(64);
    file.records.push(structuredClone(file.records[0]));
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('identity/hash stale')));
    assert.ok(errors.some(x => x.includes('Duplicate record disposition')));
});
test('all 87 relationships require exact reviewed source and target evidence', () => {
    const data = copy();
    data.dependencyReview.relationships.pop();
    data.dependencyReview.relationships[0].targetContentHash = '0'.repeat(64);
    data.dependencyReview.relationships[1].relationshipData = [];
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('Missing required dependency disposition')));
    assert.ok(errors.some(x => x.includes('source/target review or hash missing')));
    assert.ok(errors.some(x => x.includes('separate source/target field evidence')));
});
test('available Phione, Tentacruel, Magneton and Torchic profiles cannot become unavailable through heading parsing', () => {
    const data = copy();
    for (const regression of data.index.readingOrderRegressions) {
        const row = records(data).find(x => x.identity === regression.identity);
        assert.ok(row.sourceComparison.fields.find(x => x.field === 'system.stats' && x.status === 'supported'));
        row.coverageState = 'unresolved';
        row.sourceComparison.equalMechanicalGroups = 0;
    }
    assert.equal(recordSourceReviewErrors(data).filter(x => x.includes('Available reading-order profile lost')).length, 4);
});
test('source evidence cannot promote production approval, gameplay or completion', () => {
    const data = copy();
    data.index.productionPolicyPromotion = true;
    data.index.coverage.completeAddressableClassification = true;
    records(data)[0].behavioralVerification = 'verified';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('promote policy')));
    assert.ok(errors.some(x => x.includes('approve policy/behavior')));
    assert.ok(errors.some(x => x.includes('while addressable inventory remains')));
});
test('evolution evidence cannot be lost through capability-scalar scoring overwrite', () => {
    const data = copy(), row = records(data).find(x => x.identity === 'species.04HUofEWMHdMr0Ya');
    assert.equal(row.sourceComparison.equalMechanicalGroups, 4);
    assert.equal(row.sourceComparison.independentGroups.evolutionLevels, true);
    row.sourceComparison.equalMechanicalGroups = 3;
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('independent-group count/evidence disagree')));
    const changed = copy(), evidence = records(changed).find(x => x.identity === row.identity).sourceComparison;
    evidence.fields.find(x => x.field === 'system.evolutions levels').recordValue = [999];
    assert.ok(recordSourceReviewErrors(changed).some(x => x.includes('does not describe current record fields')));
});
test('an excluded consumer does not establish exclusion of a shared older target', () => {
    const data = copy(), row = records(data).find(x => x.identity.startsWith('abilities.'));
    row.coverageState = 'excluded';
    row.generationReview = {status: 'excluded', basis: 'referenced by excluded consumer'};
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('consumer/name alone cannot exclude target')));
});
test('Darmanitan learning schedule is editorial without changing either source value', () => {
    const data = copy();
    const change = data.dex.profileDeltas.find(x => x.id === 'r04-d0418').changes.find(x => x.field === 'levelMoves');
    change.sourceInterpretation.category = 'optional-profile-rule-change';
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('Darmanitan unchanged learning schedule')));
});
