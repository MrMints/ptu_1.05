import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRecordSourceReview, recordSourceReviewErrors} from '../tools/record-source-review.mjs';

const original = await loadRecordSourceReview();
const copy = () => ({...original, index: structuredClone(original.index), abilitySource: structuredClone(original.abilitySource), batchManifest: structuredClone(original.batchManifest),
    files: Object.fromEntries(Object.entries(original.files).map(([path, file]) => [path, path.includes('/abilities-') ? structuredClone(file) : file]))});
const rows = data => Object.entries(data.files).filter(([path]) => path.includes('/abilities-')).flatMap(([, file]) => file.records);
const comparisons = row => [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean);

test('C source snapshot retains separate printed headers, source spelling and distinct identities', () => {
    const units = original.abilitySource.sourceDefinitions;
    const gentle = units.find(unit => unit.id.startsWith('core:319:') && unit.label === 'Gentle Vibe');
    assert.equal(gentle.frequency, 'Scene – Standard Action');
    assert.deepEqual(gentle.headerFields, {range: 'Burst 2'});
    const veil = units.find(unit => unit.id.startsWith('core:335:') && unit.label === 'Water Veil');
    assert.equal(veil.frequency, 'Static');
    assert.deepEqual(veil.headerFields, {keywords: 'Immune'});
    assert.deepEqual(veil.ruleStructure.explicitTags, ['Defensive', 'Immune']);
    assert.ok(units.some(unit => unit.id.startsWith('core:336:') && unit.label === 'Zen Mode'));
    assert.ok(!units.some(unit => unit.id.startsWith('core:337:')));
    const huge = rows(original).find(row => row.identity === 'abilities.oNB76oqVYrjhYd7W');
    const pure = rows(original).find(row => row.identity === 'abilities.nuGa21WQ0QD07kQj');
    assert.notEqual(huge.contentHash, pure.contentHash);
    assert.equal(comparisons(huge).find(value => value.sourceUnit.startsWith('feb:')).sourceUnit, comparisons(pure).find(value => value.sourceUnit.startsWith('feb:')).sourceUnit);
    assert.equal(huge.coverageState, 'unresolved');
    assert.equal(pure.coverageState, 'unresolved');
});

test('word-equal legacy strings cannot become verified typed-role equivalence', () => {
    const data = copy(), row = rows(data).find(row => comparisons(row).some(value => value.ruleStructureComparison.typedClauseDisposition === 'same-ordered-content-different-label-boundaries'));
    const comparison = comparisons(row).find(value => value.ruleStructureComparison.typedClauseDisposition === 'same-ordered-content-different-label-boundaries');
    assert.equal(comparison.ruleStructureComparison.exactCompleteClauseContent, true);
    assert.equal(comparison.ruleStructureComparison.exactTypedClauseLabelsAndContent, false);
    comparison.ruleStructureComparison.exactTypedClauseLabelsAndContent = true;
    comparison.ruleStructureComparison.typedClauseDisposition = 'same-typed-labels-and-content';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Ability ordered content/typed-role disposition disagrees')));
});

test('ability field and dependency evidence describes exact current values and paths', () => {
    const data = copy(), row = rows(data).find(row => row.dependencyEvidence.length);
    row.currentRecordEvidence.fieldHashes.frequency = '0'.repeat(64);
    row.dependencyEvidence[0].paths = ['$.system.nonexistent'];
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Ability current field/structure evidence disagrees')));
    assert.ok(errors.some(message => message.includes('Ability exact dependency path/target changed')));
});

test('ability source content, full boundaries and frozen attribution cannot be silently replaced', () => {
    const data = copy(), row = rows(data)[0];
    row.frozenQueue.savedPrimarySourceUnit = 'feb:5:ability:wrong-partition';
    row.sourceComparison.anchor.nextBoundary = 'unbounded entire next chapter';
    row.sourceComparison.ruleStructureComparison.sourceClauseKey[0][1] += ' ignores all exceptions';
    data.batchManifest.batches.find(batch => batch.id === 'C').slices[2].membershipSha256 = '0'.repeat(64);
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Ability saved partition attribution changed')));
    assert.ok(errors.some(message => message.includes('Ability complete source boundary/definition changed')));
    assert.ok(errors.some(message => message.includes('Ability ordered content/typed-role disposition disagrees')));
    assert.ok(errors.some(message => message.includes('Ability frozen partition changed: C3')));
});

test('C2 Heatproof retains literal movesf, Defensive wording and the separate core alternative', () => {
    const row = rows(original).find(row => row.identity === 'abilities.0EwtVaObxl7Rimhb');
    assert.equal(row.contentHash, 'eefe5625d66ffb7901efdc9a3e0afbaf30de16045a1168da6dd2ab9f28ee5b20');
    assert.equal(row.frozenQueue.savedPrimarySourceUnit, 'feb:5:ability:1056');
    assert.equal(row.frozenQueue.slice, 'C2');
    const current = row.currentRecordEvidence.currentRuleStructure;
    assert.deepEqual(current.explicitTags, ['Defensive']);
    const revised = comparisons(row).find(value => value.sourceUnit.startsWith('feb:5:'));
    assert.equal(revised.anchor.heading, 'Ability: Heatproof');
    assert.equal(revised.anchor.nextBoundary, 'Ability: Heavy Metal');
    assert.match(revised.ruleStructureComparison.sourceClauseKey.flat().join(' '), /movesf/);
    assert.deepEqual(revised.ruleStructureComparison.sourceExplicitTags, []);
    assert.ok(comparisons(row).some(value => value.sourceUnit.startsWith('core:320:')));
    assert.equal(row.coverageState, 'unresolved');
});

test('C2 omissions and numeric conflicts cannot be approved by matching frequency', () => {
    const danger = rows(original).find(row => row.identity === 'abilities.JM87rlp0Y9maAWQs');
    assert.ok(danger.sourceComparison.ruleStructureComparison.sourceClauseKey.some(([kind, text]) => kind === 'trigger' && text.includes('hit by an attack')));
    assert.ok(!danger.currentRecordEvidence.currentRuleStructure.clauses.some(clause => clause.kind === 'trigger'));
    assert.equal(danger.coverageState, 'unresolved');
    const spike = rows(original).find(row => row.identity === 'abilities.7pvzEiwrxHx3x5F2');
    assert.ok(spike.sourceComparison.ruleStructureComparison.orderedContentWordDifferences.some(value => value.record === '6' && value.source === '8'));
    assert.equal(spike.sourceComparison.fields[0].status, 'supported');
    assert.equal(spike.coverageState, 'unresolved');
    const sequence = rows(original).find(row => row.identity === 'abilities.YWRUQgKcUMBYJvAr');
    const september = comparisons(sequence).find(value => value.sourceUnit.startsWith('sep:9:'));
    assert.doesNotMatch(september.ruleStructureComparison.sourceClauseKey.flat().join(' '), /tutor and inheritance/);
});

test('C3 profile slots and copied wording cannot approve a missing Ability identity', () => {
    const data = copy(), neuroforce = rows(data).find(row => row.identity === 'abilities.8nPRICsIbi4fpoya');
    assert.equal(neuroforce.coverageState, 'unresolved');
    assert.equal(neuroforce.sourceComparison, undefined);
    assert.ok(neuroforce.sourceSearch.printedPassageLocators.some(locator => locator.source.pdfPages.includes(98)));
    assert.match(neuroforce.missingEvidence.neededArtifact, /Ultra Burst/);
    neuroforce.sourceSearch.printedPassageLocators[0].completeDefinitionClaim = true;
    const handyman = rows(data).find(row => row.identity === 'abilities.3sXjwuMpLMYlyrLu');
    assert.equal(handyman.sourceComparison.sourceLabel, 'Delivery Bird');
    assert.equal(handyman.sourceComparison.ruleStructureComparison.exactCompleteClauseContent, true);
    assert.equal(handyman.coverageState, 'unresolved');
    handyman.coverageState = 'reviewed';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Ability printed locator became a fictitious complete definition')));
    assert.ok(errors.some(message => message.includes('Ability copied/slot-only definition cannot approve current identity')));
});

test('C3 fixed Type selectors and linked Weather pages retain their source limitations', () => {
    const data = copy(), aura = rows(data).find(row => row.identity === 'abilities.DQ7zOCNPg8WkDKmO');
    assert.equal(aura.frozenQueue.slice, 'C3');
    assert.match(aura.sourceComparison.ruleStructureComparison.sourceClauseKey.flat().join(' '), /primary type/);
    assert.match(aura.sourceComparison.ruleStructureComparison.recordClauseKey.flat().join(' '), /electric type/);
    assert.equal(aura.coverageState, 'unresolved');
    const weather = rows(data).find(row => row.sourceSearch.linkedNativeDefinitions?.length);
    weather.sourceSearch.linkedNativeDefinitions[0].pageJsonSha256 = '0'.repeat(64);
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Ability native source page identity/hash changed')));
});

test('complete C dispositions still require substantive acceptance before D', () => {
    const data = copy(), batch = data.batchManifest.batches.find(batch => batch.id === 'C');
    assert.equal(batch.acceptance.status, 'pending-substantive-review');
    assert.equal(rows(data).length, 626);
    data.batchManifest.batches.find(batch => batch.id === 'D').status = 'in-progress';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Frozen family review gate not cleared: D')));
});
