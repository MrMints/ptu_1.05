import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview} from '../tools/record-source-review.mjs';
import {checkFeatureSupplementSourceUse} from '../tools/feature-supplement-source-use.mjs';

const original = await loadRecordSourceReview();
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const file = 'record-source-review/features-supplemental.json';
const check = data => {
    const errors = [];
    checkFeatureSupplementSourceUse(data, {fail: (ok, message) => { if (!ok) errors.push(message); },
        actualMap: new Map(data.source.rows.map(r => [r.identity, r])), hash, equal});
    return errors;
};
const fork = () => ({...original, featureSource: {...original.featureSource}, files: {...original.files}});
const rowFork = id => {
    const data = fork(), row = structuredClone(data.files[file].records.find(r => r.identity === id));
    assert.ok(row, id);
    data.files[file] = {...data.files[file], records: data.files[file].records.map(r => r.identity === id ? row : r)};
    return {data, row, a: row.sourceUseEvidence.assessment};
};
const refreshMirrors = ({data, row}) => {
    data.featureSource.currentRecordAudit = data.featureSource.currentRecordAudit.map(m => m.identity === row.identity
        ? {...m, sourceUseEvidenceSemanticSha256: hash(row.sourceUseEvidence)} : m);
    data.batchManifest = structuredClone(data.batchManifest);
    const slice = data.batchManifest.batches.find(b => b.id === 'E1').slices.find(s => s.id === 'E1d');
    if (slice.closure) slice.closure.evidenceSemanticSha256 = hash(data.files[file]);
};

test('all387 supplemental records retain full field/rule/dependency evidence with bounded dispositions', () => {
    assert.deepEqual(check(original), []);
    const rows = original.files[file].records, a = rows.map(r => r.sourceUseEvidence.assessment);
    assert.equal(rows.filter(r => r.coverageState === 'reviewed').length, 184);
    assert.equal(rows.filter(r => r.coverageState === 'unresolved').length, 203);
    assert.equal(a.reduce((n, r) => n + r.fieldReconciliations.length, 0), 44);
    assert.equal(a.reduce((n, r) => n + r.materialFieldReconciliation.length, 0), 14);
    assert.equal(a.reduce((n, r) => n + r.executableSourceReview.length, 0), 532);
    assert.equal(a.reduce((n, r) => n + r.dependencyBindings.length, 0), 323);
});

test('the Legendary Hivemind Aura cannot become the authoring of the Bug-Type Teamwork Feature', () => {
    const f = rowFork('feats.lIbnu1npmuEtBwFh');
    assert.equal(f.a.sourceDefinitions.length, 0);
    f.a.parentFrameIds = f.a.parentFrameIds.filter(id => id !== 'blessed-parent-aura-framework-and-hivemind');
    f.a.parentFrameBindings = f.a.parentFrameBindings.filter(b => b.id !== 'blessed-parent-aura-framework-and-hivemind');
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('Hivemind Aura/Feature kind boundary')));
});

test('known Pokebot and augmentation tables cannot disappear behind a short recipe pointer', () => {
    const row = original.files[file].records.find(r => r.sourceUseEvidence.assessment.parentFrameIds.includes('porygon-parent-augmentation-use-and-capacity')
        && r.sourceUseEvidence.assessment.sourceDefinitions.some(d => /^porygon:(84|85):/.test(d.sourceUnit)));
    const f = rowFork(row.identity);
    f.a.parentFrameIds = f.a.parentFrameIds.filter(id => id !== 'porygon-parent-augmentation-use-and-capacity');
    f.a.parentFrameBindings = f.a.parentFrameBindings.filter(b => b.id !== 'porygon-parent-augmentation-use-and-capacity');
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('known recipe/Blessing/effect-use context missing')));
});

test('Rank4 acquisition cannot manufacture a fourth printed Blessing table or erase patron stats', () => {
    const data = fork(), id = 'blessed-parent-blessing-tables-and-patron-stats';
    const frame = structuredClone(data.featureSource.parentFrames.find(f => f.id === id));
    assert.deepEqual(frame.source.pdfPages, [55, 56, 57]);
    assert.match(frame.interpretation, /No rank4 Blessing table/);
    frame.interpretation = 'Rank4 Blessings and current stat choices are all approved.';
    data.featureSource.parentFrames = data.featureSource.parentFrames.map(f => f.id === id ? frame : f);
    assert.ok(check(data).some(e => e.includes('full supplemental parent/table inventory changed')));
});

test('the old Class-granted Ability exception stays distinct from a guessed replacement', () => {
    const f = rowFork('feats.RTCbTWTq5g3GbCx9');
    f.a.sourceModifierBindings = f.a.sourceModifierBindings.filter(b => b.id !== 'feb1-old-class-ability-exception');
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('old Class-granted Ability exception lost')));
});

test('a missing Gift tag cannot erase the known optional substitution instruction', () => {
    const f = rowFork('feats.MVN4pBTOpVnO9UzQ');
    f.a.sourceModifierBindings = f.a.sourceModifierBindings.filter(b => b.id !== 'sep7-gift-substitution');
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('known Gift substitution was lost')));
});

test('Rapid action and prerequisite deltas remain exact fields after mirror refresh', () => {
    const row = original.files[file].records.find(r => r.sourceUseEvidence.assessment.fieldReconciliations.some(f => f.axis === 'frequency'));
    const f = rowFork(row.identity);
    f.a.fieldReconciliations.find(r => r.axis === 'frequency').currentValue = '2 AP – Swift Action';
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('prerequisite/frequency reconciliation changed')));
});

test('source correspondence cannot approve wrong choice targets or lose stored rule objects', () => {
    const f = rowFork('feats.7jXVmYK75q3WIC8J');
    assert.equal(f.a.materialFieldReconciliation[0].axis, 'wrong-first-pool-target');
    f.a.executableSourceReview.pop();
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('stored executable source review missing')));
});

test('an independently reviewed target cannot be promoted by its consuming Feature', () => {
    const f = rowFork('feats.0nWaS0at7Zbu62IL');
    const dep = f.a.dependencyBindings.find(d => d.existingPublishedTargetReview);
    assert.ok(dep);
    dep.existingPublishedTargetReview.currentContentHash = '0'.repeat(64);
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('independent earlier target review changed')));
});
