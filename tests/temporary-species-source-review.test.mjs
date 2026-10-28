import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview, sourceReviewText, sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkTemporarySpeciesSourceReview, temporarySpeciesSourceFacts, ultraBurstSourceCalculation} from '../tools/temporary-species-source-review.mjs';
import {effectReferences} from '../tools/effect-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';

const base = await loadRecordSourceReview(), file = 'record-source-review/temporary-species.json';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textHash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const row = (b, id) => b.files[file].records.find(r => r.identity === `effects.${id}`);
const detail = (b, id) => row(b, id).sourceComparison.temporarySpeciesReview;
function errors(bundle) {
    const errors = [];
    checkTemporarySpeciesSourceReview(bundle, {
        fail: (ok, message) => { if (!ok) errors.push(message); },
        rows: new Map(Object.values(bundle.files).flatMap(f => f.records).map(r => [r.identity, r])),
        actualMap: new Map(bundle.source.rows.map(r => [r.identity, r])), hash, equal, textHash,
        normalizedText: sourceReviewWords, cleanText: sourceReviewText, citations: () => {}
    });
    return errors;
}
function tamper(change) {
    const b = {...base, files: {...base.files, [file]: structuredClone(base.files[file])}, temporarySpeciesSource: structuredClone(base.temporarySpeciesSource)};
    change(b);
    for (const r of b.files[file].records) {
        const e = b.temporarySpeciesSource.currentRecordAudit[r.identity];
        e.dispositionEvidenceSha256 = hash(r);
        e.examinationSha256 = hash(r.sourceComparison.temporarySpeciesReview);
    }
    b.temporarySpeciesSource.closure.recordEvidenceSemanticSha256 = hash(b.files[file]);
    return errors(b);
}

test('F2 examines the exact82 frozen effects;819 F records remain outside its own closure', () => {
    assert.deepEqual(errors(base), []);
    const b = base.batchManifest.batches.find(b => b.id === 'F');
    assert.equal(b.status, 'in-progress');
    assert.equal(b.slices.filter(s => !['F1', 'F2'].includes(s.id)).reduce((n, s) => n + s.records, 0), 819);
    assert.deepEqual(base.temporarySpeciesSource.closure.counts, {reviewed: 44, unresolved: 38});
    assert.equal(base.index.coverage.completeAddressableClassification, false);
    assert.equal(hash(base.files['record-source-review/conditions.json']), '1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d');
});

test('Mega source adds an Ability with duplicate fallback and two HP-preserving stat alternatives', () => {
    const f = base.temporarySpeciesSource.sourceFacts.mega;
    assert.match(f.additionalAbility, /always added.*doesn't replace/);
    assert.match(f.duplicateFallback, /naturally gain but does not currently have/);
    assert.match(f.statAlternatives, /current Stats.*Base Stats.*HP Stat.*Base Relations/);
    assert.match(f.actionAndScene, /Swift Action.*even if.*knocked out.*one Mega Evolution/);
    assert.match(f.stoneRemoval, /Knock Off.*Magician/);
    assert.match(f.customPermissionAndLimit, /net bonus of \+10.*HP is never changed/);
});

test('the two complete Ultra Burst source bases retain different signed deltas and the same non-HP result', () => {
    const [dusk, dawn] = base.temporarySpeciesSource.ultraBurstSourceDefinitions.map(u => ultraBurstSourceCalculation(u, sourceReviewText));
    assert.deepEqual(dusk.deltas, {atk: 1, def: -3, spatk: 6, spdef: -1, spd: 5});
    assert.deepEqual(dawn.deltas, {atk: 6, def: -1, spatk: 1, spdef: -3, spd: 5});
    assert.notDeepEqual(dusk.base, dawn.base);
    assert.deepEqual(dusk.result, {atk: 17, def: 10, spatk: 17, spdef: 10, spd: 13});
    assert.deepEqual(dawn.result, dusk.result);
    const changed = structuredClone(base.temporarySpeciesSource.ultraBurstSourceDefinitions[0]);
    changed.rawDefinition = changed.rawDefinition.replace('-3 Def', '+3 Def');
    assert.equal(ultraBurstSourceCalculation(changed, sourceReviewText).result.def, 16);
});

test('Ultra Burst source does not invent HP, a canonical target, or a second added Illuminate slot', () => {
    for (const u of base.temporarySpeciesSource.ultraBurstSourceDefinitions) {
        assert.equal(u.hpDeltaPrinted, false);
        assert.equal(u.targetUuidClaim, null);
        assert.match(sourceReviewText(u.rawDefinition), /Adv Ability 1 becomes Illuminate; Gains Glow/);
    }
    const d = detail(base, 'bfCbAohvde5wKBZB');
    assert.match(d.specificAssessment, /slot replacement.*Neuroforce full Ability authoring remains C-unresolved/);
    assert.equal(d.temporarySpecies.targetIdentity, 'species.DUMMY');
    assert.equal(d.grantComparisons.length, 2);
});

test('the malformed DUMMY literal remains at its exact path despite the16-character UUID parser', () => {
    const e = base.temporarySpeciesSource.currentRecordAudit['effects.bfCbAohvde5wKBZB'];
    assert.ok(e.literalReferenceClaims.some(r => r.path === '$.system.rules[2].uuid' && r.literal === 'Compendium.ptu.species.Item.DUMMY'));
    assert.ok(!e.references.some(r => r.targetIdentity === 'species.DUMMY'));
    assert.equal(base.temporarySpeciesSource.targetSnapshots.find(s => s.identity === 'species.DUMMY').document, null);
    assert.ok(tamper(b => { b.temporarySpeciesSource.currentRecordAudit['effects.bfCbAohvde5wKBZB'].literalReferenceClaims = []; })
        .some(e => e.includes('malformed/literal reference')));
});

test('Latias and Latios retain their separate wrong selectors without a guessed target repair', () => {
    for (const id of ['NQb88sy14gS2srLk', 'PgQftQ9zGvCBG3Rt']) {
        assert.deepEqual(detail(base, id).temporarySpecies.rule.predicate, ['species:absol']);
        assert.equal(row(base, id).coverageState, 'unresolved');
    }
    const latias = base.temporarySpeciesSource.currentRecordAudit['effects.PgQftQ9zGvCBG3Rt'].currentRules;
    assert.deepEqual(latias[1].object.predicate.and[0], 'species:latios');
    assert.deepEqual(latias[3].object.predicate, ['species:latias']);
});

test('Pidgeot source correspondence keeps the separate incoming Pidgeotto item wording obligation', () => {
    const d = detail(base, 'uD5c1jqPBUxNsm0b');
    assert.deepEqual(d.temporarySpecies.rule.predicate, ['species:pidgeot']);
    assert.match(d.specificAssessment, /items\.JbBaAO3Yhz5ktBTe.*separately accepted E2 Pidgeotto-text/);
    assert.ok(base.temporarySpeciesSource.currentRecordAudit['effects.uD5c1jqPBUxNsm0b'].incomingReferences.some(r => r.sourceIdentity === 'items.JbBaAO3Yhz5ktBTe'));
});

test('Blaziken referenceEffect preserves its actual Ability target and duplicate-Ability limit', () => {
    const e = base.temporarySpeciesSource.currentRecordAudit['effects.h3KQfWFgvc2IDDg8'];
    assert.ok(e.references.some(r => r.path === '$.system.referenceEffect' && r.targetIdentity === 'abilities.xVTWtc7EvwwNyRqt'));
    assert.match(detail(base, 'h3KQfWFgvc2IDDg8').specificAssessment, /duplicate-Speed-Boost fallback.*allowDuplicate:false/);
});

test('Sceptile explicit deletion and null expiry remain distinct from omitted defaults', () => {
    const a = base.temporarySpeciesSource.currentRecordAudit;
    const grant = a['effects.B8mKuoLBgPjeiznG'].currentRules.find(r => r.object.key === 'GrantItem').object;
    assert.deepEqual(grant.onDeleteActions, {grantee: 'restrict', granter: 'cascade'});
    assert.equal(row(base, 'B8mKuoLBgPjeiznG').fieldReview.find(f => f.field === 'system.duration').recordValue.expiry, null);
    assert.equal(Object.hasOwn(a['effects.1gP4r5FmR6xl5tZx'].currentRules.find(r => r.object.key === 'GrantItem').object, 'onDeleteActions'), false);
});

test('Zen keeps original thresholds separate from the optional Scene/Swift Move permissions', () => {
    const f = base.temporarySpeciesSource.sourceFacts;
    assert.match(f.originalZen, /less than 50%.*50% or higher.*once per Scene/);
    assert.match(f.optionalZen, /Scene - Swift Action.*rest of the Scene.*Flamethrower.*Psychic/);
    const ids = detail(base, 'OKJAprzOU3zRSj64').sourceDefinitionIds;
    assert.ok(ids.some(id => id.startsWith('core:336:')) && ids.some(id => id.startsWith('feb:11:')));
    assert.match(detail(base, 'OPXMxELcEGD07r2g').specificAssessment, /not automatic authoring of this regional version/);
});

test('Stance Change and Relic Song keep current-stat, action and equal-HP use conditions', () => {
    const f = base.temporarySpeciesSource.sourceFacts;
    assert.match(f.stanceChange, /swaps its Attack Stat with its Defense.*without changing Combat Stages.*Full Action/);
    assert.match(f.relicSong, /knows Relic Song.*Swift Action.*Standard Action.*same HP Stat/);
    assert.match(detail(base, 'zYlXw6cdHtfeKo58').specificAssessment, /species:meloetta-step.*copied Landorus-therian slug/);
});

test('the complete Deoxys Defense printed page ends at Prepare stats without borrowed continuation', () => {
    const a = base.temporarySpeciesSource;
    assert.equal(a.sourceFacts.deoxys.printedDefenseTail, 'Prepare stats');
    assert.match(a.sourceFacts.deoxys.outsideBattle, /at-will.*Extended Action outside of battle/);
    assert.match(a.deoxysPrintedBoundary.inspection, /printed Multiform note itself ends with Prepare stats/);
    assert.match(a.sourceFacts.deoxys.attackBasicAbility, /Weird Power/);
    assert.match(a.sourceFacts.deoxys.speedBasicAbility, /Speed Boost/);
});

test('Hoopa source retains the two three-day periods, destroyed bottle, Enraged and all substitutions', () => {
    const f = base.temporarySpeciesSource.sourceFacts.hoopa;
    assert.match(f, /three full days.*again for three days.*destroyed.*permanently Unbound/);
    assert.match(f, /always Enraged.*cannot be cured/);
    for (const move of ['Hyperspace Fury', 'Dark Pulse', 'Knock Off']) assert.ok(f.includes(move));
    assert.match(base.temporarySpeciesSource.sourceFacts.shaymin, /sunlight.*Gracidea.*Ice Type Move.*touches ice.*sun is no longer shining/);
});

test('copied slugs and selector capitalization are retained without becoming canonical identity', () => {
    assert.equal(row(base, 'aO0PBZhQp0mVjmna').fieldReview.find(f => f.field === 'system.slug').recordValue, 'form-change-dialga-origin');
    assert.deepEqual(detail(base, '6izGsl9OigI28akT').temporarySpecies.rule.predicate, ['species:Palkia-origin']);
    assert.deepEqual(detail(base, 'C5Bsw88HImUbymX4').temporarySpecies.rule.predicate, ['species:Landorus-therian']);
    assert.ok(base.files[file].records.every(r => r.sourceComparison.temporarySpeciesReview.canonicalRelationshipClaim === false));
});

test('actual current rules are checked even after refreshing the derived disposition hashes', () => {
    assert.ok(tamper(b => {
        const r = row(b, 'B8mKuoLBgPjeiznG'), f = r.fieldReview.find(f => f.field === 'system.rules');
        f.recordValue[3].onDeleteActions.granter = 'detach'; f.recordJsonSha256 = hash(f.recordValue);
    }).some(e => e.includes('actual field/hash disagreement')));
});

test('a refreshed raw-parent hash cannot replace the independently read source', () => {
    assert.ok(tamper(b => {
        const p = b.temporarySpeciesSource.parentContexts.find(p => p.id === 'core:206');
        p.rawText = p.rawText.replace('Swift Action', 'Rapid Action'); p.rawSha256 = textHash(p.rawText);
        b.temporarySpeciesSource.sourceFacts = temporarySpeciesSourceFacts(b.temporarySpeciesSource, sourceReviewText);
    }).some(e => e.includes('independently examined complete source primitives')));
});

test('deleting an available original alternative cannot manufacture single-version authority', () => {
    assert.ok(tamper(b => { b.temporarySpeciesSource.reusedSourceDefinitions = b.temporarySpeciesSource.reusedSourceDefinitions.filter(u => !u.id.startsWith('core:336:')); })
        .some(e => e.includes('complete source primitives') || e.includes('source inventory')));
});

test('name-only generation exclusion is rejected independently of source-absence claims', () => {
    assert.ok(tamper(b => {
        const r = row(b, '4KW4LUFLFULLWOKw'); r.generationReview = {status: 'excluded', basis: 'display-name guess'};
        b.temporarySpeciesSource.scopeDispositions.find(s => s.identity === r.identity).generationReview = r.generationReview;
    }).some(e => e.includes('exact-ID examined scope/version/source')));
});

test('source-absence promotion is rejected independently of generation classification', () => {
    assert.ok(tamper(b => {
        row(b, '4KW4LUFLFULLWOKw').sourceComparison.sourceAbsenceClaim = true;
    }).some(e => e.includes('source-absence limit bypassed')));
});

test('current target corruption fails even with a refreshed target hash', () => {
    assert.ok(tamper(b => {
        const s = b.temporarySpeciesSource.targetSnapshots.find(s => s.identity === 'species.04xRjN4KUKCfrQp6');
        s.document.system.stats.atk++; s.contentHash = hash(s.document);
    }).some(e => e.includes('exact target/current/prior chronology')));
});

test('the actual earlier C disposition still controls full target version limits', () => {
    const id = 'abilities.1eHAkLt91Wb7wU6u';
    assert.ok(tamper(b => {
        const path = Object.keys(b.files).find(p => b.files[p].records.some(r => r.identity === id));
        b.files[path] = structuredClone(b.files[path]);
        b.files[path].records.find(r => r.identity === id).ruleVersionReview.basis = 'unjustified whole-version approval';
    }).some(e => e.includes('exact target/current/prior chronology') || e.includes('complete prior direct definition')));
});

test('F2 prior availability includes F1 and excludes F2 itself and every later frozen slice', () => {
    const prior = priorSourceIdentities(base.batchManifest, 'F', 'F2'), f = base.batchManifest.batches.find(b => b.id === 'F');
    assert.ok(f.slices.find(s => s.id === 'F1').members.every(([id]) => prior.has(id)));
    assert.ok(f.slices.filter(s => s.id !== 'F1').flatMap(s => s.members).every(([id]) => !prior.has(id)));
    assert.ok(tamper(b => { b.files['future-h-fixture.json'] = {records: [{identity: 'journals.cP772AChmDjr486z', coverageState: 'unresolved'}]}; }).length === 0);
});

test('wrong nested paths fail even when the true UUID exists elsewhere', () => {
    assert.ok(tamper(b => {
        const e = b.temporarySpeciesSource.currentRecordAudit['effects.1gP4r5FmR6xl5tZx'];
        e.references.find(r => r.nestedReferences.length).nestedReferences[0].path = '$.system.wrong';
    }).some(e => e.includes('exact nested target/path')));
});

test('legacy and modern reference syntax retain the same exact target without inventing occurrences', () => {
    assert.deepEqual(effectReferences({a: '@Compendium[ptu.species.Item.04xRjN4KUKCfrQp6]', b: 'Compendium.ptu.species.Item.04xRjN4KUKCfrQp6'}).map(r => r.targetIdentity),
        ['species.04xRjN4KUKCfrQp6', 'species.04xRjN4KUKCfrQp6']);
    assert.ok(tamper(b => { b.temporarySpeciesSource.currentRecordAudit['effects.uD5c1jqPBUxNsm0b'].incomingReferences[0].path = '$.system.notTheActualProducer'; })
        .some(e => e.includes('exact incoming producer paths')));
});

test('refreshed historical field hashes cannot rewrite the captured literal observations', () => {
    assert.ok(tamper(b => {
        const e = Object.values(b.temporarySpeciesSource.currentRecordAudit).find(e => e.exportLineage.snapshots.some(s => Object.keys(s.historicalNormativeValues ?? {}).length));
        const s = e.exportLineage.snapshots.find(s => Object.keys(s.historicalNormativeValues ?? {}).length), key = Object.keys(s.historicalNormativeValues)[0];
        s.historicalNormativeValues[key] = 'invented historical value';
        s.fieldComparisons.find(f => f.recordFieldPath === `system.${key}`).historicalJsonSha256 = hash(s.historicalNormativeValues[key]);
    }).some(e => e.includes('independently captured complete historical')));
});

test('excluded-only targets retain numeric/Type/two-metric proofs without blanket shared-Ability exclusion', () => {
    for (const id of ['MRwgSGklIvxzFrgk', 'e6eWrcu5JugErmjT']) {
        const r = row(base, id), d = detail(base, id);
        assert.equal(r.coverageState, 'unresolved');
        assert.equal(r.generationReview.linkedTargetNegativeScopeProof.externalGeneration, 9);
        assert.ok(d.excludedOnlyTargetNestedRecoverySkipped);
        assert.ok(base.temporarySpeciesSource.currentRecordAudit[r.identity].references.every(ref => ref.nestedReferences.length === 0));
    }
    const technician = base.temporarySpeciesSource.targetSnapshots.find(s => s.identity === 'abilities.mfD1Ga7xMCBqOk5H');
    assert.equal(technician.priorSourceReview.coverageState, 'reviewed');
    assert.ok(tamper(b => { detail(b, 'e6eWrcu5JugErmjT').excludedOnlyTargetNestedRecoverySkipped = false; })
        .some(e => e.includes('exact TemporarySpecies literal/target/scope')));
});

test('source examination cannot approve selected variants, Spirit authoring or live foundations', () => {
    assert.ok(tamper(b => {
        b.temporarySpeciesSource.authoringLimits.friendshipSpirit.completeActionAndResourceFrameworkEstablished = true;
    }).some(e => e.includes('missing Spirit authoring or unrun foundations')));
    assert.ok(tamper(b => { detail(b, '1gP4r5FmR6xl5tZx').actualAcquisitionPreservationAndGameplay = 'verified'; })
        .some(e => e.includes('precise per-ID source/version/scope')));
});

test('an empty generic disposition cannot stand in for an examined record-specific comparison', () => {
    assert.ok(tamper(b => { detail(b, '4KW4LUFLFULLWOKw').specificAssessment = 'No hits; unresolved'; })
        .some(e => e.includes('precise per-ID source/version/scope')));
});

test('the inherited native Rapid wording stays separate from core Swift and its Base Relations allowance', () => {
    const a = base.temporarySpeciesSource, native = a.nativeContexts.find(n => n.pageId === 'xkjg2V434caYYxQG');
    assert.match(a.sourceFacts.inheritedNativeMegaAction, /Rapid Action/);
    assert.match(a.sourceFacts.mega.actionAndScene, /Swift Action/);
    assert.match(a.sourceFacts.mega.statAlternatives, /Base Relations/);
    assert.doesNotMatch(native.rawText, /Base Relations/);
    assert.ok(tamper(b => {
        const n = b.temporarySpeciesSource.nativeContexts.find(n => n.pageId === 'xkjg2V434caYYxQG');
        n.rawText = n.rawText.replace('Rapid Action', 'Swift Action');
    }).some(e => e.includes('exact inherited native context')));
});

test('complete campaign pacing advice does not become mandatory acquisition prerequisites', () => {
    const a = base.temporarySpeciesSource;
    assert.match(a.sourceFacts.campaignPacingAdvice, /guideline.*5-10.*4-8 Gym Badges.*pace of your campaign/);
    assert.match(detail(base, '4KW4LUFLFULLWOKw').specificAssessment, /GM advice rather than mandatory acquisition or Feature\/Edge prerequisite vetoes/);
    assert.ok(detail(base, '4KW4LUFLFULLWOKw').parentContextIds.includes('core:206'));
    assert.ok(detail(base, '4KW4LUFLFULLWOKw').parentContextIds.includes('core:470'));
    assert.equal(a.nativeContexts.find(n => n.pageId === 'QMnCJj8vTqWbZovl').productionPolicyPromotion, false);
});

test('printed Mega signed changes and prior stat contradictions remain unnormalized', () => {
    assert.equal(detail(base, 'dx6O3bbEtcFmCOyD').derivedFormEvidence.printedStatDeltas.spd, -3);
    assert.equal(detail(base, 'laW43uor3Z04llLO').derivedFormEvidence.printedStatDeltas.def, -4);
    for (const id of ['ENxCUUXd7oaXX0ht', 'bFWrFvH0sfb72oPH', 'h3KQfWFgvc2IDDg8', 'kHFFJN1SHSeQ9qxM']) {
        assert.notEqual(detail(base, id).linkedTargetSourceFields['system.stats'].status, 'supported');
        assert.equal(row(base, id).coverageState, 'unresolved');
    }
    assert.equal(Object.values(detail(base, 'ENxCUUXd7oaXX0ht').derivedFormEvidence.printedStatDeltas).reduce((a, b) => a + b, 0), 9);
    assert.equal(detail(base, 'WwjMmmyL59Yklh3s').derivedFormEvidence.printedAbility, 'Heat Mirage');
    assert.equal(detail(base, 'NRJBIsOBb780bxtu').derivedFormEvidence.printedAbility, 'Wash Away');
    assert.equal(detail(base, 'dqawgBaW924FhQpx').derivedFormEvidence.printedAbility, 'Run Away');
});
