import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview} from '../tools/record-source-review.mjs';
import {checkFeatureRemainingSourceUse} from '../tools/feature-remaining-source-use.mjs';

const original = await loadRecordSourceReview();
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const file = 'record-source-review/features-remaining.json';
const check = data => {
    const errors = [];
    checkFeatureRemainingSourceUse(data, {fail: (ok, message) => { if (!ok) errors.push(message); },
        actualMap: new Map(data.source.rows.map(r => [r.identity, r])), hash, equal});
    return errors;
};
const rowFork = id => {
    const data = {...original, featureSource: {...original.featureSource}, files: {...original.files}};
    const row = structuredClone(data.files[file].records.find(r => r.identity === id));
    assert.ok(row, id);
    data.files[file] = {...data.files[file], records: data.files[file].records.map(r => r.identity === id ? row : r)};
    return {data, row, a: row.sourceUseEvidence.assessment};
};
const refreshMirrors = ({data, row}) => {
    data.featureSource.currentRecordAudit = data.featureSource.currentRecordAudit.map(m => m.identity === row.identity
        ? {...m, sourceUseEvidenceSemanticSha256: hash(row.sourceUseEvidence)} : m);
    data.batchManifest = structuredClone(data.batchManifest);
    const slice = data.batchManifest.batches.find(b => b.id === 'E1').slices.find(s => s.id === 'E1e');
    if (slice.closure) slice.closure.evidenceSemanticSha256 = hash(data.files[file]);
};

test('all268 remaining records retain complete source/use limits without approving unknown wrappers', () => {
    assert.deepEqual(check(original), []);
    const rows = original.files[file].records, a = rows.map(r => r.sourceUseEvidence.assessment);
    assert.equal(rows.filter(r => r.coverageState === 'reviewed').length, 20);
    assert.equal(rows.filter(r => r.coverageState === 'unresolved').length, 248);
    assert.equal(a.filter(r => r.finiteNoHeadingCandidateExamination).length, 131);
    assert.equal(a.reduce((n, r) => n + r.underlyingDefinitions.length, 0), 17);
    assert.equal(a.reduce((n, r) => n + r.currentRules.length, 0), 136);
    assert.equal(a.reduce((n, r) => n + r.dependencyBindings.length, 0), 218);
});

test('a missing heading candidate cannot hide the known complete Move Sync definition', () => {
    const f = rowFork('feats.5wzCxnLJ3aC0FKx7');
    assert.equal(f.a.sourceDefinitions.length, 0);
    assert.equal(f.a.underlyingDefinitions[0].sourceUnit, 'core:119:feature-line24');
    f.a.underlyingDefinitions = [];
    f.row.sourceSearch.supportingSourceUnits = [];
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('known underlying source definition missing')));
});

test('known renamed or composite mechanics cannot establish the current inherited identity', () => {
    const f = rowFork('feats.cDtyyCwI7QwbxpTd');
    assert.deepEqual(f.a.underlyingDefinitions.map(d => d.sourceUnit), ['core:88:feature-line24', 'core:88:feature-line42']);
    f.a.underlyingDefinitions[0].bodyCorrespondenceSupported = true;
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('underlying source was promoted to current identity')));
});

test('the actual Ravager parent grant remains distinct from an independent child prerequisite', () => {
    const f = rowFork('feats.l1bMdIUsBsxeri0D');
    assert.equal(f.a.sourceDefinitions[0].printedPrerequisiteAlternatives.length, 0);
    f.a.underlyingDefinitions = [];
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('actual parent grant became a child prerequisite')));
});

test('identical Poison Weapon body words do not manufacture a canonical renamed identity', () => {
    const f = rowFork('feats.5EEgjesWe5xOvp7d');
    assert.equal(f.a.identityOnlyBodyLimits.length, 1);
    assert.equal(f.a.identityOnlyBodyLimits[0].fullTypedClausesEqual, true);
    f.row.coverageState = 'reviewed';
    f.a.coverageDisposition = 'reviewed';
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('identical body cannot invent inherited identity')));
});

test('no-hit evidence cannot approve an unavailable custom Feature or imply source absence', () => {
    const f = rowFork('feats.07yiNvQEqFpZyFpF');
    f.a.finiteNoHeadingCandidateExamination.sourceAbsenceClaim = true;
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('finite no-heading examination cannot prove source absence')));
});

test('exact trainer formulas and capture signs remain unresolved stored facts', () => {
    const f = rowFork('feats.vabusVvoCI8AWfsn');
    assert.equal(f.a.currentRules[0].value, '@actor.system.skills.pokemonEd.value.total * -2');
    f.a.materialFieldReconciliation[0].currentRules[0].value = '@actor.system.skills.pokemonEd.value.total * 2';
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('exact material formula/flag/reference/use limit changed')));
});

test('an independently examined Ability target keeps its source and scope limits', () => {
    const f = rowFork('feats.jkVwLcKtuNd5UULr');
    const dep = f.a.dependencyBindings.find(d => d.target === 'abilities.C6aRawvdZOrPx2xK');
    assert.ok(dep?.existingPublishedTargetReview);
    dep.existingPublishedTargetReview.coverageState = 'reviewed';
    dep.existingPublishedTargetReview.currentContentHash = '0'.repeat(64);
    refreshMirrors(f);
    assert.ok(check(f.data).some(e => e.includes('earlier target source/scope disposition changed')));
});
