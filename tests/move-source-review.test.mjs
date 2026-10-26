import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRecordSourceReview, recordSourceReviewErrors} from '../tools/record-source-review.mjs';

const original = await loadRecordSourceReview();
const copy = () => ({...original, index: structuredClone(original.index), moveSource: structuredClone(original.moveSource), batchManifest: structuredClone(original.batchManifest),
    files: Object.fromEntries(Object.entries(original.files).map(([path, file]) => [path, path.includes('/moves-') ? structuredClone(file) : file]))});
const rows = data => Object.entries(data.files).filter(([path]) => path.includes('/moves-')).flatMap(([, file]) => file.records);

test('actual Move corpus preserves Curse, unprefixed/compact definitions and true boundaries', () => {
    const units = original.moveSource.sourceDefinitions;
    const curse = units.find(unit => unit.label === 'Curse');
    assert.deepEqual(curse.fields.frequency, ['See Text']);
    assert.match(curse.ruleStructure.clauses.map(clause => clause.text).join(' '), /cannot be prevented/);
    const holdHands = units.find(unit => unit.id.startsWith('sep:4:') && unit.label === 'Hold Hands');
    assert.deepEqual(holdHands.fields['contest-effect'], ['Get Ready!']);
    assert.match(holdHands.nextBoundary, /^Heavy Shields/);
    const phalanx = units.find(unit => unit.label === 'Phalanx');
    assert.equal(phalanx.nextBoundary, 'Jousting Samurott');
    assert.doesNotMatch(phalanx.ruleStructure.clauses.map(clause => clause.text).join(' '), /samurai/);
    const glitch = units.filter(unit => unit.compactSourceEvidence);
    assert.equal(glitch.length, 8);
    assert.ok(glitch.every(unit => unit.fields.type[0] === 'Glitch' && !unit.fields['contest-type']));
    assert.ok(units.some(unit => unit.label === 'Shock Quartz'));
    const gravity = units.find(unit => unit.id.startsWith('porygon:21:'));
    assert.equal(gravity.definitionCompleteness, 'printed-effect-replacement-with-parent-reference');
    assert.equal(gravity.fields.frequency, undefined);
    assert.match(gravity.dependentConditions[0].value, /Home Gravity/);
});

test('Contest counter and same-Move conflicts remain precise despite matching dice', () => {
    const data = copy(), tease = rows(data).find(row => row.labelForReview === 'Tease');
    assert.equal(tease.coverageState, 'unresolved');
    assert.match(tease.missingEvidence.neededArtifact, /Fumble/);
    const reliable = rows(data).find(row => row.labelForReview === 'Reliable');
    assert.equal(reliable.coverageState, 'unresolved');
    assert.match(reliable.missingEvidence.neededArtifact, /SAME Move/);
    tease.coverageState = 'reviewed';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move reviewed state has no complete examined correspondence')));
});

test('Contest X sentinel, original table words and source identities are independently guarded', () => {
    const data = copy(), row = rows(data).find(row => row.labelForReview === 'Reflective Appeal');
    assert.equal(row.currentRecordEvidence.fieldHashes.dice.length, 64);
    assert.equal(row.sourceComparison.fields.find(field => field.field === 'dice').recordValue, -1);
    for (const fields of [row.fieldReview, row.sourceComparison.fields]) fields.find(field => field.field === 'dice').sourceValue = '100d6';
    row.sourceComparison.ruleStructureComparison.sourceClauseKey[0][1] = 'gain 100 voltage';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Contest effect literal dice/parameter evidence changed')));
    assert.ok(errors.some(message => message.includes('Move ordered content/typed-role evidence disagrees')));
});

test('new D evidence cannot change its frozen partition or cached current-field lineage', () => {
    const data = copy(), row = rows(data)[0];
    row.currentRecordEvidence.fieldHashes.frequency = '0'.repeat(64);
    row.exportLineage.snapshots.find(snapshot => snapshot.recordFound).fieldComparisons[0].currentJsonSha256 = '0'.repeat(64);
    data.batchManifest.batches.find(batch => batch.id === 'D').slices[2].membershipSha256 = '0'.repeat(64);
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Move exact current field/structure evidence disagrees')));
    assert.ok(errors.some(message => message.includes('Move historical field comparison disagrees')));
    assert.ok(errors.some(message => message.includes('Move frozen partition changed: D3')));
});
