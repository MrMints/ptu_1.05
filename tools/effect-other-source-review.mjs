// Offline F3b source/current evidence only. No runtime or policy consumer.
import {effectReferences, effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences, effectRuleRoles} from './effect-slice-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const MEMBERSHIP = '5de1a7967261ca19bdf81cec1ff279fae86d510d7d97ba290911ab679efd1072';
const SOURCE_PRIMITIVES = '70d4195ad851d3453325d42e4962d8a118463bbecf6384857060fbccaf38704d';
const EXAMINED_DISPOSITIONS = '12ce17b499c1ccb6e79e68d1d9b9e59b104886f180a985250f700e869dd69bcb';
const HISTORICAL_OBSERVATIONS = 'ed7859ffb69c770473e42fef1a24730f2bdcd3d279d66de3767cd7ef96ba8d4d';

export function effectOtherRuleRoles(doc) {
    return effectRuleRoles(doc).map((role, i) => {
        const r = doc.system.rules[i];
        return r.key === 'ActionPoint' && Object.hasOwn(r, 'drainedValue')
            ? {...role, domain: 'drained-ap', value: r.drainedValue} : role;
    });
}

export function rolloutStaticComparison(doc) {
    const r = doc?.system?.rules?.find(r => r.key === 'FlatModifier' && r.selectors === 'rollout-damage-base');
    const m = r?.value?.match(/^min\(max\(@actor\.flags\.ptu\.rollout,0\), ([0-9]+)\) \* ([0-9]+)$/);
    const base = Number(doc?.system?.damageBase);
    return m && Number.isFinite(base) ? {formula: r.value, base, flagCap: Number(m[1]), step: Number(m[2]),
        observations: [-1, 0, 1, 2, 3, 4].map(flag => ({flag, damageBase: base + Math.min(Math.max(flag, 0), Number(m[1])) * Number(m[2])})),
        executionAndCounterSequencingVerified: false} : null;
}

export function effectOtherSourceFacts(audit, cleanText) {
    const unit = id => {
        const u = audit.sourceDefinitions.find(u => u.id === id);
        return cleanText(u?.rawDefinition ?? u?.completeSourceUnit?.proseAnchor?.rawText ?? '');
    };
    const printed = id => cleanText(audit.printedDefinitions.find(u => u.id === id)?.rawDefinition ?? '');
    const page = id => cleanText(audit.parentContexts.find(p => p.id === id)?.rawText ?? '');
    const native = id => cleanText(audit.nativeContexts.find(p => p.pageId === id)?.rawText ?? '');
    const take = (text, re) => text.match(re)?.[0] ?? null;
    const number = (text, re) => { const m = text.match(re); return m ? Number(m[1]) : null; };
    const acid = unit('core:414:move-line15'), energy = unit('throhs:44:move-line51'), book = printed('f3b:may:7:book-framework');
    const original = unit('core:326:ability-line77'), optional = unit('feb:8:ability-line3'), songs = printed('f3b:core:164:songs-framework');
    const rollout = unit('core:427:move-line26'), ice = unit('core:389:move-line37');
    const sunny = unit('core:372:move-line57'), tierSunny = native('ETqz0t2fRNU5t0Ty');
    return {
        acidArmor: {completeDefinition: acid, resolutionStageDelta: number(acid, /Resolution Effect: The user gains \+([0-9]+) Defense Combat Stage/),
            resolutionEndsLiquefied: take(acid, /then stops being liquified/), setupAndResolutionMustRemainSeparate: true},
        energySphere: {completeDefinition: energy, signedSpecialDefenseDelta: number(energy, /You gain ([+-][0-9]+) Special Defense Combat Stage/),
            recipient: take(energy, /You gain/), effectRange: number(energy, /on ([0-9]+)\+/), limitation: take(energy, /Limitation: None/)},
        studyManual: {completeDefinition: unit('equipment:may:7:prose:studymanual'), completeBookFramework: book,
            halfHour: take(book, /After half an hour of study/), drainPerRank: number(book, /Drain ([0-9]+) AP to gain the benefits of one Rank/),
            sequential: take(book, /Ranks in an individual book must be gained sequentially/),
            restAndRenewal: take(book, /benefits from a Book last until an Extended Rest.*?continue to gain the effects\./),
            rank2SkillBonus: number(unit('equipment:may:7:prose:studymanual'), /general \+([0-9]+) Bonus to the associated Skill/),
            nonstacking: take(unit('equipment:may:7:prose:studymanual'), /does not stack with other bonuses from Books or Equipment to the same Skill/),
            bookwormAlternative: take(page('may:7'), /You may Drain Study Points.*?instead of Draining your Action Points\./),
            sourceStatus: 'optional May2015 playtest; use/rank conditions, not an automatic Feature/Edge acquisition veto'},
        primeFury: {originalDefinition: original, optionalDefinition: optional, originalSpecialAttackPrinted: /Special Attack/.test(original),
            optionalSpecialAttackDelta: number(optional, /\+([0-9]+) Combat Stage in each of Attack and Special Attack/),
            originalEnraged: take(original, /becomes Enraged/), optionalEnraged: take(optional, /becomes Enraged/),
            originalAction: take(original, /Scene - Swift Action/), optionalAction: take(optional, /Scene - Swift Action/),
            conditionDefinition: unit('f1:core:247:rage'), sourceStatus: 'original core and optional February2016 remain separate; no automatic adoption'},
        milestone: {core30: cleanText(audit.parentContexts.find(p => p.id === 'core:19')?.rawText
            .match(/^Level 30 .*Elite Trainer:[\s\S]*?(?=^Level 40 .*Champion:)/m)?.[0] ?? ''),
            core21: take(page('core:21'), /Elite Trainer Bonus:.*?(?=31 1)/), distinctEliteTrainerFeature: unit('core:75:feature-line20'),
            lifelongLearning: unit('core:88:feature-line42'), completeIndependentPtrProgressionEstablished: false},
        defaultStage: {completeDefinition: unit('core:75:feature-line3'),
            baseline: take(unit('core:75:feature-line3'), /default State of Trained Stats is \+1 Combat Stages instead of 0/),
            perSession: take(unit('core:75:feature-line3'), /Drains 1 AP per training session, not per Pokemon/),
            oneStat: take(unit('core:75:feature-line3'), /only one Trained Stat at a time/), ordinaryModifierProvesDefaultReset: false},
        rollout: {completeDefinition: rollout, initialDamageBase: number(rollout, /Damage Base ([0-9]+):/),
            damageBaseStep: number(rollout, /Damage Base by \+([0-9]+)/), maximumDamageBase: number(rollout, /maximum of DB ([0-9]+)/),
            stop: take(rollout, /until they miss any target.*?during their turn\./),
            iceBallDefinition: ice, iceBallStep: number(ice, /Damage Base by \+([0-9]+)/)},
        sunny: {originalDefinition: sunny, originalFireDamage: number(sunny, /Fire-Type Attacks gain a \+([0-9]+) bonus to Damage Rolls/),
            originalWaterPenalty: number(sunny, /Water-Type Attacks suffer a (-[0-9]+) Damage penalty/),
            tier1Definition: tierSunny, tierFireDamageBase: number(tierSunny, /Fire-Type Attacks gain \+([0-9]+) DB/),
            tierIceDamageBaseReduction: number(tierSunny, /Ice-Type Attacks have their DB decreased by ([0-9]+)/),
            grassMovementAndInitiative: take(tierSunny, /Grass-Types gain \+1 to their Movement Capabilities.*?\+5\./),
            allCapabilityPathEquivalenceVerified: false, independentApprovedWeatherAuthoringEstablished: false},
        forms: {forecast: unit('core:318:ability-line35'), weatherBall: unit('core:413:move-line3'),
            rainy: native('1BAkTJOr6EgKdt6j'), windy: native('CvjwDBLUgtnD8ebr'), introduction: native('7znCkHSW9AWIyFIA'),
            tieredWeatherBallAndFlyingCastformAuthoringEstablished: false},
        song: {completeDefinition: printed('f3b:core:164:song-courage'), completeFramework: songs,
            activationCount: (audit.printedDefinitions.find(p => p.id === 'f3b:core:164:songs-framework')?.rawDefinition.match(/»/g) ?? []).length,
            alwaysAffectsUser: take(songs, /Songs always affect the user/),
            endNextTurn: take(printed('f3b:core:164:song-courage'), /until the end of your next turn/),
            independentNormalStatusMoveIdentityEstablished: false},
        freezeDry: {completeDefinition: unit('core:388:move-line41'), universalFixedMultiplierEstablished: false},
        evasion: {confidence: unit('core:314:ability-line12'), flutter: unit('core:318:ability-line24'),
            decoy: unit('core:315:ability-line31'), shrinkable: unit('core:307:capability-shrinkable'),
            coneOfForce: unit('throhs:45:move-line37'), roundStorageProvesNextTurnOrFullRound: false},
        supporting: {beatUp: unit('core:350:move-line18'), helpingHand: unit('core:399:move-line13'),
            moxie: unit('core:324:ability-line56'), teamwork: unit('core:332:ability-line72'), scrappy: unit('core:328:ability-line74'),
            typeAura: unit('feb:13:ability-line72'), tipTheScales: unit('core:81:feature-line42'), coachingFeature: unit('core:155:feature-line27')}
    };
}

export const effectOtherFindingKeys = {
    '8KgzCfk43RLHfQuQ': ['acidArmor'], '8TLd1Y5aUx8mX8P7': ['energySphere'], '8S5ANEmz5pXLdcNy': ['studyManual'],
    'CZQTU2f6iEJAOwQG': ['primeFury'], '8qW7U9dHnhjiaHdX': ['milestone'], 'B28ejoG9fROULnvd': ['defaultStage'],
    'B9MPZ7Xns8D0AtR3': ['rollout'], '8WiOH4IOYo2geGWJ': ['sunny'], 'AWpLAN8DbKQWzDtO': ['forms'], 'COyChG0CkHtzauVb': ['forms'],
    'D5WDQbThlwpXtXfV': ['song'], '8sWNt84GAXcgtwjC': ['freezeDry'],
    '9hMhkodr9pNJqwDE': ['evasion'], '9it55X2p1cDzEqpQ': ['evasion'], 'DRFfwfDbPONNVBE0': ['evasion'], 'B5dNUIb1u2nz14T4': ['evasion'], '93cE7dCUpOcBP4ci': ['evasion'],
    '7tDhaSNufkyG9l9V': ['supporting'], 'BnEsFJWtYoNcHsvN': ['supporting'], 'ApML29Dj1Q2qN6b0': ['supporting'],
    'Ct7Pl8Mzx72DkXpN': ['supporting'], 'DPNrJia61YZEPPwJ': ['supporting'], 'DNQN6Beuu55A64pY': ['supporting'],
    '8mDWN64SpDDKoV03': ['supporting'], '7Xvdlzozy9DacaJO': ['supporting'], 'CGRiJmILfNMC9U0K': ['supporting']
};

export function effectOtherFindings(identity, facts) {
    return Object.fromEntries((effectOtherFindingKeys[identity.split('.')[1]] ?? []).map(k => [k, facts[k]]));
}

export function checkEffectOtherSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3b');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3b');
    if (!audit) { fail(!slice.recordFile, 'F3b completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3b record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3b' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3b frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3b independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3b exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 46 && audit.printedDefinitions.length === 3
        && audit.parentContexts.length === 65 && audit.nativeContexts.length === 4, 'F3b bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3b full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3b complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3b full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3b exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectOtherSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && facts.acidArmor.resolutionStageDelta === 1 && facts.acidArmor.resolutionEndsLiquefied
        && facts.energySphere.signedSpecialDefenseDelta === 1 && facts.energySphere.recipient === 'You gain' && facts.energySphere.effectRange === 19 && facts.energySphere.limitation
        && facts.studyManual.drainPerRank === 1 && facts.studyManual.rank2SkillBonus === 2 && facts.studyManual.sequential && facts.studyManual.halfHour
        && facts.studyManual.nonstacking && facts.studyManual.restAndRenewal && facts.studyManual.bookwormAlternative
        && facts.primeFury.originalSpecialAttackPrinted === false && facts.primeFury.optionalSpecialAttackDelta === 1
        && facts.primeFury.originalEnraged && facts.primeFury.optionalEnraged && facts.primeFury.originalAction && facts.primeFury.optionalAction
        && /32 through Level 40.*Gain two Edges.*Gain one General Feature/.test(facts.milestone.core30)
        && facts.milestone.core21 && facts.defaultStage.baseline && facts.defaultStage.perSession && facts.defaultStage.oneStat
        && facts.rollout.initialDamageBase === 3 && facts.rollout.damageBaseStep === 4 && facts.rollout.maximumDamageBase === 15 && facts.rollout.stop && facts.rollout.iceBallStep === 3
        && facts.sunny.originalFireDamage === 5 && facts.sunny.originalWaterPenalty === -5 && facts.sunny.tierFireDamageBase === 2 && facts.sunny.tierIceDamageBaseReduction === 2
        && facts.sunny.grassMovementAndInitiative && facts.song.activationCount === 4 && facts.song.alwaysAffectsUser && facts.song.endNextTurn,
    'F3b independently read signed/recipient/rank/resource/version/trigger/typed-unit source facts changed');
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3b missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3b'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 119 && snapshots.size === audit.targetSnapshots.length, 'F3b exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3b exact current target/prior chronology changed: ' + s.identity);
    }
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3b literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3b exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3a').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3b independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3b per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3b exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectOtherFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3b source-derived assessment/version/scope limits changed: ' + identity);
        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3b complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256, 'F3b actual field/hash disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectOtherRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3b complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3b exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3b exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3b incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3b complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3b historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3b finite discovery became source absence/completion: ' + identity);
    }
    const rolloutDoc = actualMap.get('moves.nzhedIfXpsZWaEx9')?.data;
    fail(equal(audit.rolloutStaticComparison, rolloutStaticComparison(rolloutDoc)) && audit.rolloutStaticComparison?.executionAndCounterSequencingVerified === false,
        'F3b Rollout static arithmetic or unrun timing promoted');
    fail(equal(counts, {reviewed: 24, unresolved: 36}) && equal(counts, closure.counts), 'F3b bounded correspondence/limit counts changed');
}
