import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview, sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkFeatureCoreSourceUse} from '../tools/feature-core-source-use.mjs';

const original = await loadRecordSourceReview();
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const textHash = v => createHash('sha256').update(v).digest('hex');
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = data => {
    const errors = [];
    checkFeatureCoreSourceUse(data, {fail: (ok, message) => { if (!ok) errors.push(message); },
        actualMap: new Map(data.source.rows.map(r => [r.identity, r])), hash, equal, textHash, normalizedText: sourceReviewWords});
    return errors;
};
const file = 'record-source-review/features-core.json';
const fork = () => ({...original, featureSource: {...original.featureSource}, files: {...original.files}});
const rowFork = id => {
    const data = fork(), row = structuredClone(data.files[file].records.find(r => r.identity === id));
    assert.ok(row, id);
    data.files[file] = {...data.files[file], records: data.files[file].records.map(r => r.identity === id ? row : r)};
    return {data, row, assessment: row.sourceUseEvidence.assessment};
};
const refreshUseMirror = ({data, row}) => {
    data.featureSource.currentRecordAudit = data.featureSource.currentRecordAudit.map(m => m.identity === row.identity
        ? {...m, sourceUseEvidenceSemanticSha256: hash(row.sourceUseEvidence)} : m);
    const slice = data.batchManifest.batches.find(b => b.id === 'E1').slices.find(s => s.id === 'E1c');
    if (slice.closure) {
        data.batchManifest = structuredClone(data.batchManifest);
        data.batchManifest.batches.find(b => b.id === 'E1').slices.find(s => s.id === 'E1c').closure.evidenceSemanticSha256 = hash(data.files[file]);
    }
};

test('all665 E1c records retain full source/use axes without actor or policy approval', () => {
    assert.deepEqual(check(original), []);
    const rows = original.files[file].records, axes = rows.map(r => r.sourceUseEvidence.assessment);
    assert.equal(axes.reduce((n, a) => n + a.currentRules.length, 0), 507);
    assert.equal(axes.reduce((n, a) => n + a.dependencyBindings.length, 0), 337);
    assert.equal(rows.filter(r => r.coverageState === 'reviewed').length, 310);
    assert.equal(rows.filter(r => r.coverageState === 'unresolved').length, 355);
});

test('the54 prerequisite observations preserve16 literal,10 parent,2 optional and26 unresolved decisions', () => {
    const observations = original.files[file].records.map(r => r.sourceUseEvidence.assessment.prerequisiteReconciliation).filter(Boolean);
    const categories = new Map();
    for (const o of observations) categories.set(o.decision.category, (categories.get(o.decision.category) ?? 0) + 1);
    assert.equal(observations.length, 54);
    assert.equal([...categories].filter(([name]) => name.startsWith('literal-')).reduce((n, [, count]) => n + count, 0), 16);
    assert.equal(categories.get('printed-grant-parent-distinct-from-child-prerequisite'), 10);
    assert.equal(categories.get('complete-optional-prerequisite-alternative'), 2);
    assert.equal(categories.get('unresolved-material-prerequisite-version'), 26);
    assert.equal(observations.filter(o => o.decision.versionAuthorityUnresolved).length, 26);
});

test('an actual printed parent grant cannot become a child prerequisite after mirror refresh', () => {
    const f = rowFork('feats.iIzgbpKtLj5Nat3l');
    assert.equal(f.assessment.prerequisiteReconciliation.parentSourceEvidence.length, 1);
    f.assessment.prerequisiteReconciliation.parentSourceEvidence = [];
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('printed child grant was replaced')));
});

test('a complete optional May alternative is retained instead of forcing the differing core prerequisite', () => {
    const f = rowFork('feats.aJ47Z5z6Az9c8Dy8');
    assert.equal(f.row.sourceComparison.sourceUnit, 'may:7:feature-line27');
    const core = f.row.competingSourceComparisons.find(c => c.sourceUnit === 'core:140:feature-line35');
    assert.ok(core);
    f.row.competingSourceComparisons = [f.row.sourceComparison]; f.row.sourceComparison = core;
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('complete optional alternative lost')));
});

test('equal bodies cannot erase the literal reciprocal telekinetic AP differences', () => {
    const f = rowFork('feats.1Kjd396RbZJt9uxT');
    const axis = f.assessment.materialFieldReconciliation.find(m => m.axis === 'frequency-action-cost');
    assert.equal(axis.currentFrequency, '2 AP - Rapid Action');
    axis.currentFrequency = '1 AP - Rapid Action';
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('action/resource difference changed')));
});

test('the actual Guile predicate cannot be rewritten as the written Intuition condition in evidence', () => {
    const f = rowFork('feats.C1oWw23u7YYSVlYM');
    const axis = f.assessment.materialFieldReconciliation.find(m => m.axis === 'choice-grant-predicate');
    const rule = axis.currentRuleObjects.find(r => JSON.stringify(r).includes('skills.guile'));
    assert.ok(rule); rule.predicate = {gte: ['@actor.system.skills.intuition.value.total', 4]};
    axis.currentRuleHashes = axis.currentRuleObjects.map(hash);
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('material exact selector/grant evidence changed')));
});

test('an added trainer HP rule remains unresolved despite a source body correspondence', () => {
    const f = rowFork('feats.IDVdSzaxEUdh4Rp0');
    assert.ok(f.assessment.materialFieldReconciliation.some(m => m.axis === 'executable-stat-without-printed-stat-grant'));
    f.row.coverageState = 'reviewed'; f.assessment.coverageDisposition = 'reviewed'; f.row.sourceUseEvidence.versionAuthorityUnresolved = false;
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('material source/version limit changed')));
});

test('every stored executable object needs its own examined source-use entry', () => {
    const f = rowFork('feats.DmWUIKIULVBFuJ9M');
    f.assessment.executableSourceReview.pop();
    refreshUseMirror(f);
    const errors = check(f.data);
    assert.ok(errors.some(e => e.includes('material executable source review missing')));
    assert.ok(errors.some(e => e.includes('itemized prerequisite/material/executable/dependency coverage changed')));
});

test('the actual terrain diagram cycle cannot be replaced by extraction order after hash refresh', () => {
    const data = fork(), v = structuredClone(data.featureSource.visualReadings[0]);
    [v.printedClockwiseCycle[1], v.printedClockwiseCycle[8]] = [v.printedClockwiseCycle[8], v.printedClockwiseCycle[1]];
    data.featureSource.visualReadings = [v];
    data.files[file] = {...data.files[file], records: data.files[file].records.map(r => {
        if (!r.sourceUseEvidence.assessment.visualReadings.length) return r;
        const copy = structuredClone(r); copy.sourceUseEvidence.assessment.visualReadings[0].evidenceSha256 = hash(v); return copy;
    })};
    assert.ok(check(data).some(e => e.includes('independently read diagram changed')));
});

test('a packet heading cannot promote an optional correction into official core errata', () => {
    const data = fork(), modifier = structuredClone(data.featureSource.sourceModifiers[0]);
    modifier.interpretation = 'Official core errata replaces all original versions.';
    data.featureSource.sourceModifiers = data.featureSource.sourceModifiers.map(m => m.id === modifier.id ? modifier : m);
    data.files[file] = {...data.files[file], records: data.files[file].records.map(r => {
        if (!r.sourceUseEvidence.assessment.sourceModifierBindings.some(b => b.id === modifier.id)) return r;
        const copy = structuredClone(r);
        copy.sourceUseEvidence.assessment.sourceModifierBindings.find(b => b.id === modifier.id).evidenceSha256 = hash(modifier); return copy;
    })};
    assert.ok(check(data).some(e => e.includes('examined parent/table/modifier/diagram facts changed')));
});

test('exact target source evidence cannot be replaced with another target or a fabricated pass', () => {
    const selected = original.files[file].records.find(r => r.sourceUseEvidence.assessment.dependencyBindings.some(d => d.existingPublishedTargetReview?.coverageState === 'unresolved'));
    assert.ok(selected);
    const f = rowFork(selected.identity), dep = f.assessment.dependencyBindings.find(d => d.existingPublishedTargetReview?.coverageState === 'unresolved');
    dep.existingPublishedTargetReview.coverageState = 'reviewed';
    refreshUseMirror(f);
    assert.ok(check(f.data).some(e => e.includes('prior target review was substituted')));
});

test('source dispositions cannot certify an inherited whole version, Generation scope or gameplay', () => {
    for (const mutate of [r => { r.generationReview.status = 'supported'; }, r => { r.behavioralVerification = 'passed'; }, r => { r.productionPolicyPromotion = true; }]) {
        const f = rowFork('feats.TMPCa2JNiX0o2a7Y'); mutate(f.row); refreshUseMirror(f);
        assert.ok(check(f.data).some(e => e.includes('cannot certify whole-version generation or gameplay')));
    }
});
