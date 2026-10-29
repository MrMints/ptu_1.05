import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview, sourceReviewText, sourceReviewWords, recordSourceReviewErrors} from '../tools/record-source-review.mjs';
import {checkEffectSourceReview, conditionSourceFacts} from '../tools/effect-source-review.mjs';
const base = await loadRecordSourceReview(), file = 'record-source-review/conditions.json';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textHash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const row = (bundle, id) => bundle.files[file].records.find(r => r.identity === `effects.${id}`);
function errors(bundle) {
    const errors = [];
    checkEffectSourceReview(bundle, {
        fail: (ok, message) => { if (!ok) errors.push(message); },
        rows: new Map(Object.values(bundle.files).flatMap(f => f.records).map(r => [r.identity, r])),
        actualMap: new Map(bundle.source.rows.map(r => [r.identity, r])), hash, equal, textHash,
        normalizedText: sourceReviewWords, cleanText: sourceReviewText, citations: () => {}
    });
    return errors;
}
function tamper(change) {
    const bundle = {...base, files: {...base.files, [file]: structuredClone(base.files[file])}, effectSource: structuredClone(base.effectSource)};
    change(bundle);
    for (const r of bundle.files[file].records) {
        const evidence = bundle.effectSource.currentRecordAudit[r.identity];
        evidence.dispositionEvidenceSha256 = hash(r);
        evidence.conditionReviewSha256 = hash(r.sourceComparison.conditionReview);
    }
    bundle.effectSource.completedSlices.F1.recordEvidenceSemanticSha256 = hash(bundle.files[file]);
    return errors(bundle);
}

test('F1 examines exactly38 original conditions;901 F records remain outside closure', () => {
    assert.deepEqual(errors(base), []);
    const batch = base.batchManifest.batches.find(b => b.id === 'F');
    assert.equal(batch.status, 'in-progress');
    assert.equal(batch.slices.find(s => s.id === 'F1').records, 38);
    assert.equal(batch.slices.filter(s => s.id !== 'F1').reduce((n, s) => n + s.records, 0), 901);
    assert.ok(batch.slices.filter(s => !['F1', 'F2', 'F3a', 'F3b', 'F3c', 'F3d', 'F3e', 'F3f','F3g','F3h','F4a','F4b','F4c'].includes(s.id)).every(s => !s.recordFile && s.status === 'not-started'));
    assert.deepEqual(base.effectSource.completedSlices.F1.counts, {reviewed: 12, unresolved: 26});
});

test('new F dispositions preserve the earlier E2 snapshot of prior source availability', () => {
    assert.deepEqual(recordSourceReviewErrors(base), []);
    const snapshot = base.itemSource.equipmentSource.targetSnapshots.find(s => s.identity === 'effects.NA1Vn8A2h6JIIUhj');
    assert.equal(snapshot.priorSourceReview, null);
    assert.equal(row(base, 'NA1Vn8A2h6JIIUhj').coverageState, 'reviewed');
});

test('F1 does not cite its own newly written disposition as prior source evidence', () => {
    const id = 'effects.wqzPWKMbwvOWLVoI';
    const snapshot = base.effectSource.targetSnapshots.find(s => s.identity === id);
    assert.equal(snapshot.priorSourceReview, null);
    const es = tamper(b => {
        b.effectSource.targetSnapshots.find(s => s.identity === id).priorSourceReview = {
            coverageState: row(b, 'wqzPWKMbwvOWLVoI').coverageState,
            recordEvidenceSemanticSha256: hash(row(b, 'wqzPWKMbwvOWLVoI'))
        };
    });
    assert.ok(es.some(e => e.includes('exact target snapshot/prior source limits')));
});

test('a synthetic future-H disposition cannot retroactively become available before F1', () => {
    const es = tamper(b => {
        const identity = 'journals.cP772AChmDjr486z';
        b.files['fixture-future-h.json'] = {records: [{identity, contentHash: b.source.rows.find(r => r.identity === identity).contentHash,
            coverageState: 'unresolved', frozenQueue: {batch: 'H', slice: 'synthetic-future-H'}}]};
    });
    assert.deepEqual(es, []);
});

test('chronology still rejects changed genuinely earlier D source evidence', () => {
    const es = tamper(b => {
        const identity = 'moves.u4agkXP4M88Pd0SO';
        const path = Object.keys(b.files).find(path => b.files[path].records.some(r => r.identity === identity));
        b.files[path] = structuredClone(b.files[path]);
        b.files[path].records.find(r => r.identity === identity).coverageState = 'unresolved';
    });
    assert.ok(es.some(e => e.includes('exact target snapshot/prior source limits changed: moves.u4agkXP4M88Pd0SO')));
});

test('chronology never weakens actual target data checks', () => {
    const es = tamper(b => { b.effectSource.targetSnapshots.find(s => s.identity === 'moves.u4agkXP4M88Pd0SO').document.system.effect = 'different target rule'; });
    assert.ok(es.some(e => e.includes('exact target snapshot/prior source limits changed: moves.u4agkXP4M88Pd0SO')));
});

test('original Paralysis Speed/DC5 remains distinct from optional Initiative/11+', () => {
    const facts = base.effectSource.conditionSourceFacts;
    assert.match(facts.originalParalysis.speed, /Speed Stat.*4 Combat Stages/);
    assert.match(facts.originalParalysis.save, /DC 5/);
    assert.match(facts.optionalParalysis.initiative, /Initiative is halved/);
    assert.match(facts.optionalParalysis.save, /11\+/);
    assert.ok(tamper(b => row(b, 'bzZaLfYxVyKbJOCo').sourceComparison.conditionReview.sourceDefinitionIds.pop())
        .some(e => e.includes('distinct original/optional')));
});

test('complete Confusion definitions retain d20 action bands versus post-attack1d2 loss', () => {
    const facts = base.effectSource.conditionSourceFacts;
    assert.match(facts.originalConfusion.selfAttack, /1-8.*Typeless Physical Struggle/);
    assert.match(facts.optionalConfusion.die, /1d2.*after the attack is resolved/);
    assert.match(facts.optionalConfusion.loss, /half their Attack.*two Ticks/);
    assert.match(facts.optionalConfusion.cure, /end of turn/);
});

test('refreshed hashes and derived facts cannot rewrite the independently read source', () => {
    const es = tamper(b => {
        const u = b.effectSource.sourceDefinitions.find(u => u.id === 'f1:core:246:poisoned');
        u.rawDefinition = u.rawDefinition.replace('5 Hit', '4 Hit'); u.rawSha256 = textHash(u.rawDefinition);
        b.effectSource.conditionSourceFacts = conditionSourceFacts(b.effectSource, sourceReviewText);
        b.effectSource.completedSlices.F1.sourcePrimitivesSemanticSha256 = hash({definitions: b.effectSource.sourceDefinitions});
    });
    assert.ok(es.some(e => e.includes('independently examined source')));
});

test('an exact current persistent formula cannot be replaced with a source-looking formula', () => {
    const es = tamper(b => {
        const f = row(b, '39Ty93ddaWcIhagZ').fieldReview.find(f => f.recordFieldPath === 'system.persistent');
        f.recordValue.formula = '5 * pow(2, (@item.system.value.value - 1))'; f.recordJsonSha256 = hash(f.recordValue);
    });
    assert.ok(es.some(e => e.includes('exact current field changed')));
    assert.equal(row(base, '39Ty93ddaWcIhagZ').sourceComparison.conditionReview.counterSequencing, 'not-run');
});

test('Vortex beginning-turn damage and end-turn DC20/14/8/2 saves stay separate', () => {
    const facts = base.effectSource.conditionSourceFacts.vortex;
    assert.match(facts.damage, /beginning/); assert.match(facts.save, /end/); assert.match(facts.schedule, /20, 14, 8, 2, Dispel/);
    const es = tamper(b => {
        const claims = row(b, 'BuK1xNKNhBn1DZDu').sourceComparison.currentClaims;
        const c = claims.find(c => /beginning/.test(c.text)); c.text = c.text.replace('beginning', 'end'); c.normalizedSha256 = textHash(sourceReviewWords(c.text));
    });
    assert.ok(es.some(e => e.includes('complete current numeric/conditional')));
});

test('Sleep Swift source and Rapid current wording are retained as an examined discrepancy', () => {
    assert.match(base.effectSource.conditionSourceFacts.sleepActions, /Free and Swift/);
    const r = row(base, 'RekZDOcIsADhrfH3');
    assert.match(r.fieldReview.find(f => f.recordFieldPath === 'system.effect').recordValue, /Free and Rapid/);
    assert.equal(r.coverageState, 'unresolved');
    assert.ok(tamper(b => row(b, 'RekZDOcIsADhrfH3').coverageState = 'reviewed').some(e => e.includes('precise version/identity')));
});

test('the captured earlier Sleep wording cannot be silently rewritten to match current Rapid', () => {
    const es = tamper(b => {
        const s = b.effectSource.currentRecordAudit['effects.RekZDOcIsADhrfH3'].exportLineage.snapshots.find(s => s.recordFound);
        assert.match(s.historicalNormativeValues.effect, /Free and Swift/);
        s.historicalNormativeValues.effect = s.historicalNormativeValues.effect.replace('Free and Swift', 'Free and Rapid');
    });
    assert.ok(es.some(e => e.includes('same-ID historical field comparison')));
});

test('exact grant paths are checked even when the genuine target still exists elsewhere', () => {
    const es = tamper(b => b.effectSource.currentRecordAudit['effects.4lqKV4CxikZxxNWJ'].references[0].path = '$.system.rules[1].uuid');
    assert.ok(es.some(e => e.includes('exact outgoing UUID path')));
});

test('incoming Bane relationship cannot be replaced with an unrelated producer/path', () => {
    const es = tamper(b => b.effectSource.currentRecordAudit['effects.qUqJDFoLWLKd7b5K'].incomingReferences[0].sourceIdentity = 'moves.Jx4TeOVUk1DX8R45');
    assert.ok(es.some(e => e.includes('incoming producer/path')));
    assert.match(base.effectSource.conditionSourceFacts.bane, /next three turns.*-2 penalty/);
});

test('literal disabled-option selector and exact counter data remain addressable', () => {
    const es = tamper(b => {
        const literal = b.effectSource.currentRecordAudit['effects.GUKAMwsFi0EJ56WD'].literalReferenceClaims.find(r => r.literal === 'flags.ptu.disabledOptions');
        assert.ok(literal); literal.literal = 'flags.ptu.disabled';
    });
    assert.ok(es.some(e => e.includes('literal selector')));
});

test('native weather and Friendship/Spirit links cannot become complete subsystem authoring', () => {
    for (const change of [
        b => b.effectSource.authoringLimits.friendshipSpirit.completeActionAndResourceFrameworkEstablished = true,
        b => b.effectSource.authoringLimits.shadowSubsystem.completeIndependentAuthoringEstablished = true,
        b => b.effectSource.authoringLimits.tieredWeather.completeIndependentAuthoringEstablished = true
    ]) assert.ok(tamper(change).some(e => e.includes('promoted to complete independent authoring')));
});

test('Cheered original expend/reroll and optional stage protection cannot be blended', () => {
    assert.match(base.effectSource.conditionSourceFacts.originalCheered, /roll twice.*best result/);
    assert.match(base.effectSource.conditionSourceFacts.optionalCheered, /1 full round.*cannot be lowered/);
    const es = tamper(b => row(b, 'pZO043r8mNBFfbCD').sourceComparison.conditionReview.selectedVersionStatus = 'both versions enabled');
    assert.ok(es.some(e => e.includes('precise version/identity')));
});

test('distinct Black Sludge, Leftovers and Life Orb IDs retain source signs and denominators', () => {
    for (const [id, formula] of [
        ['MdsaTbmEPwcLaMVm', '-floor(@actor.system.health.total / 8)'],
        ['e6wwb737Gl54C8oG', '-floor(@actor.system.health.total / 16)'],
        ['npnxtIgRN92XBwkw', 'floor(@actor.system.health.total / 16)']
    ]) assert.equal(row(base, id).fieldReview.find(f => f.recordFieldPath === 'system.persistent').recordValue.formula, formula);
    const es = tamper(b => b.effectSource.currentRecordAudit['effects.npnxtIgRN92XBwkw'].exportLineage.snapshots.pop());
    assert.ok(es.some(e => e.includes('same-ID historical')));
});

test('a name-only generation exclusion is rejected independently with refreshed evidence hashes', () => {
    const es = tamper(b => { row(b, 'goLSpno4l7EqYspe').generationReview.status = 'excluded-from-name'; });
    assert.ok(es.some(e => e.includes('exact-ID generation disposition')));
    assert.equal(row(base, 'goLSpno4l7EqYspe').generationReview.status, 'unavailable');
});

test('finite no-hits cannot independently become source absence', () => {
    const es = tamper(b => {
        row(b, 'goLSpno4l7EqYspe').sourceComparison.sourceAbsenceClaim = true;
    });
    assert.ok(es.some(e => e.includes('precise version/identity')));
    assert.equal(base.index.coverage.completeAddressableClassification, false);
});

test('scope evidence cannot borrow another record source or promote unestablished generation', () => {
    const es = tamper(b => {
        const scope = b.effectSource.scopeDispositions.find(d => d.identity === 'effects.goLSpno4l7EqYspe');
        scope.sourceDefinitionIds = ['f1:core:246:poisoned']; scope.fullCurrentGenerationEstablished = true;
        row(b, 'goLSpno4l7EqYspe').sourceComparison.conditionReview.sourceDefinitionIds = scope.sourceDefinitionIds;
    });
    assert.ok(es.some(e => e.includes('exact-ID generation evidence inventory')));
    assert.ok(es.some(e => e.includes('exact-ID generation disposition')));
});

test('legacy status links remain exact incoming paths alongside modern UUIDs', () => {
    const e = base.effectSource.currentRecordAudit['effects.299X6pActAV8ITz7'];
    const legacy = e.incomingReferences.find(r => r.literalUuid === '@Compendium[ptu.effects.299X6pActAV8ITz7]');
    assert.ok(legacy); assert.equal(legacy.path, '$.pages[60].text.content');
    const es = tamper(b => {
        const x = b.effectSource.currentRecordAudit['effects.299X6pActAV8ITz7'];
        x.incomingReferences = x.incomingReferences.filter(r => !r.literalUuid.startsWith('@Compendium['));
    });
    assert.ok(es.some(e => e.includes('incoming producer/path')));
});

test('Boss-template source exceptions do not establish actor role or executed counter scope', () => {
    const r = row(base, 'xE6uIFWZoYXAZQxA').sourceComparison.conditionReview;
    assert.deepEqual(r.bossParentContextIds, ['f1-parent:core:487', 'f1-parent:core:488', 'f1-parent:core:489']);
    const es = tamper(b => { row(b, 'xE6uIFWZoYXAZQxA').sourceComparison.conditionReview.bossRoleAndBehaviorEstablished = true; });
    assert.ok(es.some(e => e.includes('precise version/identity')));
});
