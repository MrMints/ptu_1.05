import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview, sourceReviewText, sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectOtherSourceReview, effectOtherSourceFacts, effectOtherRuleRoles, rolloutStaticComparison} from '../tools/effect-other-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';

const base = await loadRecordSourceReview(), file = 'record-source-review/effects-other-b.json';
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const textHash = v => createHash('sha256').update(v).digest('hex');
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : v;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const audit = b => b.effectSlices.find(a => a.slice === 'F3b');
const row = (b, id) => b.files[file].records.find(r => r.identity === `effects.${id}`);
const detail = (b, id) => row(b, id).sourceComparison.effectReview;
const evidence = (b, id) => audit(b).currentRecordAudit[`effects.${id}`];
const target = (b, id) => audit(b).targetSnapshots.find(s => s.identity === id);
function errors(b) {
    const errors = [];
    checkEffectOtherSourceReview(b, {fail: (ok, m) => { if (!ok) errors.push(m); },
        rows: new Map(Object.values(b.files).flatMap(f => f.records).map(r => [r.identity, r])), actualMap: new Map(b.source.rows.map(r => [r.identity, r])),
        hash, equal, textHash, normalizedText: sourceReviewWords, cleanText: sourceReviewText, citations: () => {}});
    return errors;
}
function tamper(change) {
    const b = {...base, files: {...base.files, [file]: structuredClone(base.files[file])}, effectSlices: base.effectSlices.map(a => a.slice === 'F3b' ? structuredClone(a) : a)};
    change(b);
    for (const r of b.files[file].records) { const e = audit(b).currentRecordAudit[r.identity]; e.dispositionEvidenceSha256 = hash(r); e.examinationSha256 = hash(r.sourceComparison.effectReview); }
    audit(b).closure.recordEvidenceSemanticSha256 = hash(b.files[file]);
    audit(b).closure.examinedDispositionsSemanticSha256 = hash(b.files[file].records.map(r => ({identity: r.identity, contentHash: r.contentHash,
        coverageState: r.coverageState, generationReview: r.generationReview, examination: r.sourceComparison.effectReview})));
    return errors(b);
}

test('F3b examines exactly60 frozen effects;699 F records remain outside its own closure; accepted F3a stays fixed', () => {
    assert.deepEqual(errors(base), []);
    const b = base.batchManifest.batches.find(b => b.id === 'F');
    assert.equal(b.status, 'in-progress'); assert.equal(b.acceptance.status, 'pending-substantive-review');
    assert.equal(b.slices.filter(s => !['F1', 'F2', 'F3a', 'F3b'].includes(s.id)).reduce((n, s) => n + s.records, 0), 699);
    assert.ok(b.slices.filter(s => !['F1', 'F2', 'F3a', 'F3b', 'F3c', 'F3d', 'F3e', 'F3f','F3g','F3h','F4a'].includes(s.id)).every(s => s.status === 'not-started'));
    assert.deepEqual(audit(base).closure.counts, {reviewed: 24, unresolved: 36});
    assert.equal(base.index.coverage.completeAddressableClassification, false);
    assert.equal(hash(base.files['record-source-review/effects-other-a.json']), '609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee');
    assert.equal(hash(base.effectSlices.find(a => a.slice === 'F3a')), 'ffb59dfd1e254a002f57925933555aa6ae06977c6c9c03d00bff348eddf4de47');
});

test('Energy Sphere source gains +1 for YOU on19+ while the actual helper subtracts1', () => {
    const f = audit(base).sourceFacts.energySphere;
    assert.equal(f.signedSpecialDefenseDelta, 1); assert.equal(f.recipient, 'You gain'); assert.equal(f.effectRange, 19); assert.equal(f.limitation, 'Limitation: None');
    assert.equal(evidence(base, '8TLd1Y5aUx8mX8P7').typedCurrentRoles[0].signedDelta, -1);
    assert.equal(row(base, '8TLd1Y5aUx8mX8P7').coverageState, 'unresolved');
    assert.ok(tamper(b => { detail(b, '8TLd1Y5aUx8mX8P7').sourceFindings.energySphere.signedSpecialDefenseDelta = -1; })
        .some(e => e.includes('source-derived assessment')));
});

test('Acid Armor has source Set-Up/Resolution +1, not a fabricated original2/optional1 pair', () => {
    const f = audit(base).sourceFacts.acidArmor;
    assert.equal(f.resolutionStageDelta, 1); assert.match(f.completeDefinition, /Set-Up Effect:.*Resolution Effect:/);
    assert.match(f.resolutionEndsLiquefied, /stops being liquified/);
    assert.equal(evidence(base, '8KgzCfk43RLHfQuQ').typedCurrentRoles[0].signedDelta, 2);
    assert.equal(row(base, '8KgzCfk43RLHfQuQ').coverageState, 'unresolved');
    assert.ok(tamper(b => { detail(b, '8KgzCfk43RLHfQuQ').sourceFindings.acidArmor.resolutionStageDelta = 2; }).some(e => e.includes('source-derived assessment')));
});

test('actual current fields cannot be rewritten only in fieldReview even with refreshed derived hashes', () => {
    assert.ok(tamper(b => {
        const f = row(b, '8KgzCfk43RLHfQuQ').fieldReview.find(f => f.recordFieldPath === 'system.rules');
        f.recordValue[0].value = 1; f.recordJsonSha256 = hash(f.recordValue);
    }).some(e => e.includes('actual field/hash disagreement')));
});

test('Study Manual keeps per-rank AP drain, sequential ranks, associated Skill, nonstacking and renewal', () => {
    const f = audit(base).sourceFacts.studyManual;
    assert.equal(f.drainPerRank, 1); assert.equal(f.rank2SkillBonus, 2);
    assert.match(f.halfHour, /half an hour/); assert.match(f.sequential, /sequentially/);
    assert.match(f.completeDefinition, /single Skill.*Expert General Education.*associated Skill/);
    assert.match(f.nonstacking, /Books or Equipment to the same Skill/);
    assert.match(f.restAndRenewal, /Extended Rest.*renew.*Drain/); assert.match(f.bookwormAlternative, /Study Points.*instead of.*Action Points/);
});

test('Study Manual exact17 keys/smt2 choice path and drained1AP are not binding, gain or automatic Rank1', () => {
    const e = evidence(base, '8S5ANEmz5pXLdcNy'), [choice, modifier, ap] = e.currentRules.map(r => r.object);
    assert.equal(choice.flag, 'smt2'); assert.equal(choice.choices.length, 17);
    assert.ok(choice.choices.some(c => c.value === 'techEd'));
    assert.equal(modifier.path, 'system.skills.{item|flags.ptu.rulesSelections.smt2}.modifier.mod');
    assert.equal(ap.drainedValue, 1); assert.equal(e.typedCurrentRoles[2].domain, 'drained-ap');
    assert.ok(!e.currentRules.some(r => r.object.key === 'GrantItem'));
    assert.ok(tamper(b => { evidence(b, '8S5ANEmz5pXLdcNy').typedCurrentRoles[2].domain = 'bound-ap'; }).some(e => e.includes('rule/role')));
});

test('Book rank price/bonus/cost roles cannot be conflated or nonstacking erased through source findings', () => {
    for (const change of [f => { f.drainPerRank = 2; }, f => { f.rank2SkillBonus = 1000; }, f => { f.nonstacking = null; }, f => { f.sequential = null; }])
        assert.ok(tamper(b => { change(detail(b, '8S5ANEmz5pXLdcNy').sourceFindings.studyManual); }).some(e => e.includes('source-derived assessment')));
});

test('Prime Fury original and optional definitions retain additive Enraged and distinct Special Attack benefits', () => {
    const f = audit(base).sourceFacts.primeFury;
    assert.equal(f.originalSpecialAttackPrinted, false); assert.equal(f.optionalSpecialAttackDelta, 1);
    assert.equal(f.originalEnraged, 'becomes Enraged'); assert.equal(f.optionalEnraged, 'becomes Enraged');
    assert.equal(f.originalAction, 'Scene - Swift Action'); assert.equal(f.optionalAction, 'Scene - Swift Action');
    assert.match(target(base, 'abilities.aOBGGKUF5d2oGykz').document.system.frequency, /Rapid/);
    assert.ok(evidence(base, 'CZQTU2f6iEJAOwQG').references.some(r => r.targetIdentity === 'effects.XWqLLq9Vb9h0eZwh'));
    assert.ok(tamper(b => { detail(b, 'CZQTU2f6iEJAOwQG').sourceFindings.primeFury.originalSpecialAttackPrinted = true; }).some(e => e.includes('source-derived assessment')));
});

test('F3b frozen chronology includes accepted F3a and excludes own/later source dispositions', () => {
    const ids = priorSourceIdentities(base.batchManifest, 'F', 'F3b'), b = base.batchManifest.batches.find(b => b.id === 'F');
    assert.ok(b.slices.find(s => s.id === 'F3a').members.every(([id]) => ids.has(id)));
    assert.ok(b.slices.find(s => s.id === 'F3b').members.every(([id]) => !ids.has(id)));
    assert.ok(b.slices.find(s => s.id === 'F3c').members.every(([id]) => !ids.has(id)));
});

test('Elite milestone core General Feature choice, Lifelong Learning and same-name Feature stay separate', () => {
    const f = audit(base).sourceFacts.milestone;
    assert.match(f.core30, /General Feature/); assert.match(f.core30, /32 through Level 40/);
    assert.match(f.core30, /Gain two Edges/); assert.doesNotMatch(f.core30, /Champion/);
    assert.match(f.distinctEliteTrainerFeature, /Agility Training.*Brutal Training/);
    assert.match(f.lifelongLearning, /up to 4 Moves/); assert.equal(f.completeIndependentPtrProgressionEstablished, false);
    assert.ok(evidence(base, '8qW7U9dHnhjiaHdX').references.some(r => r.targetIdentity === 'feats.pXC58ggNIX6QFb5s'));
    assert.equal(row(base, '8qW7U9dHnhjiaHdX').coverageState, 'unresolved');
    assert.ok(tamper(b => { detail(b, '8qW7U9dHnhjiaHdX').sourceFindings.milestone.core30 = f.core30.split('Level 40')[0]; })
        .some(e => e.includes('source-derived assessment')));
});

test('default trained stage and session AP facts do not certify an ordinary additive modifier reset', () => {
    const f = audit(base).sourceFacts.defaultStage;
    assert.match(f.baseline, /instead of 0/); assert.match(f.perSession, /per training session, not per Pokemon/); assert.match(f.oneStat, /one Trained Stat/);
    assert.equal(f.ordinaryModifierProvesDefaultReset, false);
    assert.equal(row(base, 'B28ejoG9fROULnvd').coverageState, 'unresolved');
});

test('Rollout and Ice Ball retain different increments and both source stop conditions', () => {
    const f = audit(base).sourceFacts.rollout;
    assert.equal(f.initialDamageBase, 3); assert.equal(f.damageBaseStep, 4); assert.equal(f.maximumDamageBase, 15); assert.equal(f.iceBallStep, 3);
    assert.match(f.stop, /miss any target.*not able to hit any target/);
    assert.match(detail(base, 'B9MPZ7Xns8D0AtR3').specificAssessment, /delete-on-miss instruction omits inability-to-hit/);
});

test('Rollout static clamped formula yields3/7/11/15 without certifying flag initialization or execution', () => {
    const f = rolloutStaticComparison(target(base, 'moves.nzhedIfXpsZWaEx9').document);
    assert.deepEqual(f.observations.map(r => r.damageBase), [3, 3, 7, 11, 15, 15]);
    assert.equal(f.executionAndCounterSequencingVerified, false);
    assert.equal(row(base, 'B9MPZ7Xns8D0AtR3').coverageState, 'unresolved');
    assert.ok(tamper(b => { audit(b).rolloutStaticComparison.executionAndCounterSequencingVerified = true; }).some(e => e.includes('static arithmetic')));
});

test('Inverse Tailwind is not a printed universal alternative to allied +5 Initiative', () => {
    assert.equal(evidence(base, '9uDrqDIX9OxOn7th').typedCurrentRoles[0].value, -5);
    assert.match(detail(base, '9uDrqDIX9OxOn7th').specificAssessment, /neutral participants.*absolute Initiative/);
    assert.equal(target(base, 'effects.kQdPof3rxBVN6BiS').priorSourceReview, null);
    assert.ok(target(base, 'capabilities.St6x6ofobU8ztcts').priorSourceReview);
});

test('Sunny core damage/Water and proposal DB/Ice/Grass Movement retain separate units and targets', () => {
    const f = audit(base).sourceFacts.sunny;
    assert.equal(f.originalFireDamage, 5); assert.equal(f.originalWaterPenalty, -5);
    assert.equal(f.tierFireDamageBase, 2); assert.equal(f.tierIceDamageBaseReduction, 2);
    assert.match(f.grassMovementAndInitiative, /Movement Capabilities.*Initiative/);
    assert.equal(f.allCapabilityPathEquivalenceVerified, false); assert.equal(f.independentApprovedWeatherAuthoringEstablished, false);
    assert.equal(evidence(base, '8WiOH4IOYo2geGWJ').currentRules[0].object.path, 'system.modifiers.capabilities.all');
    assert.ok(tamper(b => { detail(b, '8WiOH4IOYo2geGWJ').sourceFindings.sunny.originalFireDamage = 2; }).some(e => e.includes('source-derived assessment')));
});

test('Forecast return in normal OR fog and multiple weather choice do not author Flying form or tiered Weather Ball', () => {
    const f = audit(base).sourceFacts.forms;
    assert.match(f.forecast, /normal weather or foggy weather/); assert.match(f.forecast, /multiple Weather Effects.*choose/);
    assert.match(f.weatherBall, /Damage Base of 10/); assert.equal(f.tieredWeatherBallAndFlyingCastformAuthoringEstablished, false);
    assert.match(f.windy, /Wind Keyword.*\+2 DB/);
    assert.ok(evidence(base, 'COyChG0CkHtzauVb').references.some(r => r.targetIdentity === 'moves.7V90U0g5tsj4Wb1g'));
    assert.ok(evidence(base, 'AWpLAN8DbKQWzDtO').references.some(r => r.targetIdentity === 'moves.pXXKfJdBLX6t8EcN'));
});

test('Freeze-Dry preserves Water-only incoming predicate and conditional recalculation rather than universal1.5x', () => {
    assert.match(audit(base).sourceFacts.freezeDry.completeDefinition, /Water-Typed targets.*as if Water was weak to Ice/);
    assert.equal(audit(base).sourceFacts.freezeDry.universalFixedMultiplierEstablished, false);
    const move = target(base, 'moves.AZn05DqBo1RGVRLH').document.system.rules[0]; assert.deepEqual(move.predicate, ['target:types:water']);
    assert.equal(evidence(base, '8sWNt84GAXcgtwjC').typedCurrentRoles[0].value, 4);
    assert.equal(row(base, '8sWNt84GAXcgtwjC').coverageState, 'unresolved');
});

test('Courage full Song retains four activations, always-user,1AP and end-next-turn with skill/save2', () => {
    const f = audit(base).sourceFacts.song;
    assert.equal(f.activationCount, 4); assert.match(f.alwaysAffectsUser, /always affect the user/);
    assert.match(f.completeFramework, /Sonic.*Swift.*Dance.*Shift.*Burst 2.*Standard.*Burst 4.*Full.*two Songs/);
    assert.match(f.completeDefinition, /1 AP.*Skill Checks and Save Checks/); assert.match(f.endNextTurn, /your next turn/);
    assert.equal(f.independentNormalStatusMoveIdentityEstablished, false);
    assert.ok(tamper(b => { detail(b, 'D5WDQbThlwpXtXfV').sourceFindings.song.alwaysAffectsUser = null; }).some(e => e.includes('source-derived assessment')));
});

test('full printed Book and Song source boundaries cannot be replaced with refreshed derived source hashes', () => {
    assert.ok(tamper(b => {
        const u = audit(b).printedDefinitions.find(u => u.id === 'f3b:core:164:songs-framework');
        u.rawDefinition = u.rawDefinition.replace('always affect the user', 'do not affect the user'); u.rawSha256 = textHash(u.rawDefinition);
        audit(b).sourceFacts = effectOtherSourceFacts(audit(b), sourceReviewText);
        audit(b).closure.sourcePrimitivesSemanticSha256 = hash(Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit(b)[k]])));
    }).some(e => e.includes('printed definition/boundary')));
});

test('Evasion source actions/full-round/next-turn clauses stay separate from stored durations', () => {
    const f = audit(base).sourceFacts.evasion;
    assert.match(f.decoy, /Scene - Full Action/); assert.match(target(base, 'abilities.IFgjMY4bmZjv9gcP').document.system.frequency, /Free Action/);
    assert.match(f.flutter, /cannot be Flanked/); assert.match(f.shrinkable, /25%.*does not change its weight/);
    assert.match(f.coneOfForce, /2 meters.*1 full round.*Melee Weapons Only/);
    assert.equal(f.roundStorageProvesNextTurnOrFullRound, false);
});

test('Moxie optional once-per-Move and Helping Hand separate next-roll/this-round clauses remain', () => {
    const f = audit(base).sourceFacts.supporting;
    assert.match(f.moxie, /may raise.*only trigger Moxie once per Move.*multiple targets/);
    assert.match(f.helpingHand, /next Accuracy Roll this round.*next Damage Roll this round/);
    assert.deepEqual(evidence(base, 'BnEsFJWtYoNcHsvN').typedCurrentRoles.map(r => r.value), [2, 10]);
    assert.match(f.beatUp, /up to two allies adjacent to the target.*instead of their usual Type.*Pack Hunt only once/);
});

test('same-named Coaching/Tip the Scales and Type Aura scopes cannot become unqualified current authority', () => {
    const f = audit(base).sourceFacts.supporting;
    assert.match(f.coachingFeature, /Combat Maneuver/); assert.match(f.tipTheScales, /Expert Command.*2 AP - Swift.*At-Will.*10 Meters/);
    assert.match(f.typeAura, /all allies within 3 meters.*Primary Type/); assert.match(f.teamwork, /adjacent to an opponent.*allies using Melee.*that opponent/);
    assert.equal(row(base, '8mDWN64SpDDKoV03').coverageState, 'unresolved'); assert.equal(row(base, 'DNQN6Beuu55A64pY').coverageState, 'unresolved');
});

test('Scrappy source Normal/Fighting and actual fighting/ghost flag mismatch remain literal', () => {
    assert.match(audit(base).sourceFacts.supporting.scrappy, /Normal and Fighting-Type Moves/);
    assert.deepEqual(evidence(base, 'DPNrJia61YZEPPwJ').currentRules.map(r => r.object.option), ['self:immunity-blocked:fighting', 'self:immunity-blocked:ghost']);
    assert.equal(row(base, 'DPNrJia61YZEPPwJ').coverageState, 'unresolved');
});

test('Empathy Pulse text/sign/18-versus19 trigger and100-encounter values remain unnormalized', () => {
    assert.match(detail(base, 'A56F9TJ7SkM5yTl7').specificAssessment, /BODY\/SNIPPET says Attack\+1.*subtracts1 Special Attack.*18\+.*range is19/);
    for (const id of ['DPZRV4RafXAUSbdl', 'CnFt3PHevc0ySinz']) assert.deepEqual(row(base, id).fieldReview.find(f => f.recordFieldPath === 'system.duration').recordValue,
        {value: 100, unit: 'encounter', expiry: null});
});

test('all22 historical presences/240 observations retain actual omitted predicate/phase fields', () => {
    const histories = Object.values(audit(base).currentRecordAudit).flatMap(e => e.exportLineage.snapshots);
    assert.equal(histories.length, 240); assert.equal(histories.filter(s => s.recordFound).length, 22);
    const old = evidence(base, 'B5dNUIb1u2nz14T4').exportLineage.snapshots.find(s => s.recordFound);
    assert.ok(!Object.hasOwn(old.historicalNormativeValues.rules[0], 'predicate'));
    assert.ok(tamper(b => { evidence(b, 'B5dNUIb1u2nz14T4').exportLineage.snapshots[0].historicalNormativeValues.rules[0].predicate = []; })
        .some(e => e.includes('history/provenance')));
});

test('exact incoming and nested producer targets cannot disappear behind a still-present true UUID', () => {
    assert.ok(tamper(b => { evidence(b, '7tDhaSNufkyG9l9V').incomingReferences[0].path = '$.unrelated'; }).some(e => e.includes('outgoing/incoming path')));
    assert.ok(tamper(b => { evidence(b, '8WiOH4IOYo2geGWJ').references[0].nestedReferences.pop(); }).some(e => e.includes('nested reference')));
});

test('actual page suffix and page document are checked independently of journal titles', () => {
    assert.equal(audit(base).pageTargets.length, 3); assert.ok(audit(base).pageTargets.every(p => p.pageFound));
    assert.ok(tamper(b => { audit(b).pageTargets[0].pageDocument.name = 'wrong page'; }).some(e => e.includes('page-ID/hash')));
});

test('own cycles and later-F/H reviews cannot retroactively become earlier source evidence', () => {
    assert.equal(target(base, 'effects.70qQ6LhZkhnZvIty').priorSourceReview, null);
    assert.ok(tamper(b => { target(b, 'effects.70qQ6LhZkhnZvIty').priorSourceReview = row(b, '70qQ6LhZkhnZvIty'); }).some(e => e.includes('prior chronology')));
    assert.deepEqual(tamper(b => { b.files['fixture-future.json'] = {records: [{identity: 'effects.kQdPof3rxBVN6BiS', coverageState: 'unresolved'},
        {identity: 'journals.XaqlAbknAD3Tpx5E', coverageState: 'unresolved'}]}; }), []);
});

test('changed genuinely earlier F1 and C evidence still invalidates current target comparisons', () => {
    for (const id of ['effects.XWqLLq9Vb9h0eZwh', 'abilities.dnokBxCkJAn5nqHN']) assert.ok(tamper(b => {
        const path = Object.keys(b.files).find(path => b.files[path].records.some(r => r.identity === id)); b.files[path] = structuredClone(b.files[path]);
        b.files[path].records.find(r => r.identity === id).ruleVersionReview.basis += ' changed earlier evidence';
    }).some(e => e.includes('prior chronology changed: ' + id)));
});

test('generation/name-only exclusion and finite no-hit source absence are rejected separately', () => {
    assert.ok(tamper(b => { detail(b, '8Lgw7L5us5F8RLs9').completeCurrentGenerationEstablished = true; row(b, '8Lgw7L5us5F8RLs9').coverageState = 'excluded'; })
        .some(e => e.includes('source-derived assessment/version/scope')));
    assert.ok(tamper(b => { evidence(b, '7mcwYp8eigoCl54P').finiteSourceSearch.sourceAbsenceClaim = true; }).some(e => e.includes('finite discovery')));
});

test('source examination never certifies acquisition, selected variants, optional weather adoption or gameplay', () => {
    assert.ok(tamper(b => { audit(b).authoringLimits.actualAcquisitionAndPreservation = 'verified'; }).some(e => e.includes('unrun foundation')));
    assert.ok(tamper(b => { audit(b).nativeContexts[0].independentAuthoringClaim = true; }).some(e => e.includes('native page/authority')));
    assert.ok(tamper(b => { detail(b, '8qW7U9dHnhjiaHdX').specificAssessment = 'No source needed.'; }).some(e => e.includes('source-derived assessment')));
});

test('drained-AP typed observations keep distinct stable role and source quantities', () => {
    const roles = effectOtherRuleRoles({system: {rules: [{key: 'ActionPoint', drainedValue: 1}, {key: 'ActionPoint', boundValue: 2}]}});
    assert.deepEqual(roles.map(r => [r.domain, r.value]), [['drained-ap', 1], ['bound-ap', 2]]);
});
