import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview, sourceReviewText, sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectSliceSourceReview, effectPageReferences, effectRuleRoles, effectSliceSourceFacts, umbraSourceFacts, umbraSourceAssessment} from '../tools/effect-slice-source-review.mjs';

const base = await loadRecordSourceReview(), file = 'record-source-review/effects-other-a.json';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textHash = value => createHash('sha256').update(value).digest('hex');
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : v;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const audit = b => b.effectSlices.find(a => a.slice === 'F3a');
const row = (b, id) => b.files[file].records.find(r => r.identity === `effects.${id}`);
const detail = (b, id) => row(b, id).sourceComparison.effectReview;
const evidence = (b, id) => audit(b).currentRecordAudit[`effects.${id}`];
const snapshot = (b, identity) => audit(b).targetSnapshots.find(s => s.identity === identity);
function errors(b) {
    const errors = [];
    checkEffectSliceSourceReview(b, {fail: (ok, m) => { if (!ok) errors.push(m); },
        rows: new Map(Object.values(b.files).flatMap(f => f.records).map(r => [r.identity, r])),
        actualMap: new Map(b.source.rows.map(r => [r.identity, r])), hash, equal, textHash,
        cleanText: sourceReviewText, normalizedText: sourceReviewWords, citations: () => {}});
    return errors;
}
function tamper(change) {
    const b = {...base, files: {...base.files, [file]: structuredClone(base.files[file])}, effectSlices: structuredClone(base.effectSlices)};
    change(b);
    for (const r of b.files[file].records) {
        const e = audit(b).currentRecordAudit[r.identity];
        e.dispositionEvidenceSha256 = hash(r); e.examinationSha256 = hash(r.sourceComparison.effectReview);
    }
    audit(b).closure.recordEvidenceSemanticSha256 = hash(b.files[file]);
    audit(b).closure.examinedDispositionsSemanticSha256 = hash(b.files[file].records.map(r => ({identity: r.identity, contentHash: r.contentHash,
        coverageState: r.coverageState, generationReview: r.generationReview, examination: r.sourceComparison.effectReview})));
    return errors(b);
}

function changeUmbraAssessment(b, change) {
    const r = row(b, '0AFgft7HHsIp6gdQ'), d = r.sourceComparison.effectReview;
    d.specificAssessment = change(d.specificAssessment);
    r.ruleVersionReview.basis = d.specificAssessment;
    r.missingEvidence.neededArtifact = d.specificAssessment;
}

test('F3a closes exactly its60 frozen source examinations;759 F records remain outside its own closure', () => {
    assert.deepEqual(errors(base), []);
    const b = base.batchManifest.batches.find(b => b.id === 'F');
    assert.equal(b.status, 'in-progress');
    assert.equal(b.slices.filter(s => !['F1', 'F2', 'F3a'].includes(s.id)).reduce((n, s) => n + s.records, 0), 759);
    assert.ok(b.slices.filter(s => !['F1', 'F2', 'F3a', 'F3b', 'F3c', 'F3d', 'F3e', 'F3f','F3g','F3h','F4a','F4b'].includes(s.id)).every(s => s.status === 'not-started'));
    assert.deepEqual(audit(base).closure.counts, {reviewed: 21, unresolved: 39});
    assert.equal(audit(base).closure.fullFAcceptance, false);
    assert.equal(base.index.coverage.completeAddressableClassification, false);
    assert.equal(hash(base.files['record-source-review/conditions.json']), '1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d');
    assert.equal(hash(base.files['record-source-review/temporary-species.json']), 'fac63d37f6bd5560786efc5e814f807931d94ba13be573ad02835d3f002ac774');
});

test('Belly Drum gains six stages and costs half MAX HP; it never says set to six', () => {
    const f = audit(base).sourceFacts.bellyDrum;
    assert.equal(f.operation, 'gains'); assert.equal(f.attackStageDelta, 6);
    assert.match(f.cost, /1[\/⁄]2 of their Max Hit Points/);
    const role = evidence(base, '2AMcD9BRrd3NQgvx').typedCurrentRoles[0];
    assert.equal(role.domain, 'combat-stage:atk'); assert.equal(role.operation, 'add'); assert.equal(role.signedDelta, 6);
    assert.match(detail(base, '2AMcD9BRrd3NQgvx').specificAssessment, /no HP-cost object/);
});

test('Bubble source omits the stage amount; DB4/AC2/16+ cannot become a one-stage rule', () => {
    const f = audit(base).sourceFacts.bubble;
    assert.match(f.printedEffect, /lowers.*Speed on 16\+/); assert.equal(f.speedStageAmount, null);
    assert.equal(row(base, '64zLtavH5iBUPWqa').coverageState, 'unresolved');
    assert.ok(tamper(b => { row(b, '64zLtavH5iBUPWqa').coverageState = 'reviewed'; detail(b, '64zLtavH5iBUPWqa').partialFieldCorrespondence = true; })
        .some(e => e.includes('independently') || e.includes('exact-ID source/version')));
});

test('Defense Curl keeps original Swift/DR/Accuracy and optional stage/expiry as two definitions', () => {
    const f = audit(base).sourceFacts.defenseCurl;
    assert.deepEqual(f.original, {damageReduction: 10, accuracyPenalty: -4, exitAction: 'as a Swift Action', defenseStageIncreasePrinted: false});
    assert.equal(f.optional.defenseStageDelta, 1); assert.match(f.optional.duration, /Scene.*Recalled.*Breather/);
    assert.equal(row(base, '2rVbX71BeIqrailD').coverageState, 'unresolved');
    assert.ok(detail(base, '2rVbX71BeIqrailD').sourceDefinitionIds.includes('core:394:move-line48'));
    assert.ok(detail(base, '2rVbX71BeIqrailD').sourceDefinitionIds.includes('sep:4:move-line27'));
    assert.match(detail(base, '2rVbX71BeIqrailD').specificAssessment, /does not restate.*abolish/);
});

test('refreshed local source hashes cannot add a Defense stage to the original definition', () => {
    assert.ok(tamper(b => {
        const u = audit(b).sourceDefinitions.find(u => u.id === 'core:394:move-line48');
        u.rawDefinition = u.rawDefinition.replace('The user becomes Curled Up.', 'The user’s Defense is raised 1 Combat Stage. The user becomes Curled Up.');
        u.rawSha256 = textHash(u.rawDefinition); u.completeSourceUnit.rawDefinitionSha256 = u.rawSha256;
        u.sourceUnitSemanticSha256 = hash(u.completeSourceUnit);
        audit(b).sourceFacts = effectSliceSourceFacts(audit(b), sourceReviewText);
        audit(b).closure.sourcePrimitivesSemanticSha256 = hash(Object.fromEntries(['sourceDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit(b)[k]])));
    }).some(e => e.includes('source primitives')));
});

test('Stockpile count3 and zero cleanup are separate from the per-count +1 objects', () => {
    const f = audit(base).sourceFacts.stockpile;
    assert.equal(f.maximumCount, 3); assert.equal(f.defensePerCount, 1); assert.equal(f.specialDefensePerCount, 1);
    assert.match(f.zeroCleanup, /set to 0.*removed/);
    assert.equal(evidence(base, '4GKMv3FhwJhzpfys').currentRules.length, 2);
    assert.match(detail(base, '4GKMv3FhwJhzpfys').specificAssessment, /do not store count\/cap\/zero cleanup/);
});

test('Swallow percentages and explicit reset never add an unprinted reset to Spit Up', () => {
    const {swallow, spitUp} = audit(base).sourceFacts;
    assert.equal(swallow.oneCountPercent, 25); assert.match(swallow.twoCount, /half/); assert.match(swallow.threeCount, /full/);
    assert.match(swallow.reset, /set to 0/); assert.equal(spitUp.damageBasePerCount, 8); assert.equal(spitUp.resetClausePrinted, false);
    assert.ok(tamper(b => { audit(b).sourceFacts.spitUp.resetClausePrinted = true; }).some(e => e.includes('source roles')));
});

test('Stat Ace uses Pokémon levels/base stats; navigation links do not prove a wrong-stat grant', () => {
    for (const [id, stat] of [['03DmSaMMMaulcXYe', 'spd'], ['1nxph1eBRlqpr3xd', 'atk']]) {
        const r = evidence(base, id).typedCurrentRoles[0];
        assert.equal(r.domain, `base-stat:${stat}`); assert.equal(r.value, '1 + floor(@actor.system.level.current / 10)');
        assert.match(detail(base, id).specificAssessment, /navigation/); assert.match(detail(base, id).specificAssessment, /per20/);
    }
    assert.equal(audit(base).sourceFacts.statAce.pokemonLevelStep, 10);
    assert.equal(audit(base).sourceFacts.statAce.prerequisiteHeaders, 2);
    assert.match(audit(base).sourceFacts.statAce.example, /Level 20.*\+3/);
});

test('Work Up teaching-Edge reprints and Type Brace crafting remain context roles', () => {
    for (const id of ['core:50:feature-line51', 'core:55:feature-line64']) assert.match(audit(base).sourceUnitRoles[id], /not an alternate.*Move/);
    assert.match(audit(base).sourceUnitRoles['core:142:feature-line40'], /not an active-effect cost/);
    assert.match(audit(base).authoringLimits.foundationAssessment, /advisory, visible\/itemized\/non-blocking/);
});

test('Parting Shot independently prints one stage and trapped recall, not two stages', () => {
    assert.match(audit(base).sourceFacts.partingShot.attackAndSpecialAttack, /one Combat Stage.*Trapped/);
    assert.deepEqual(evidence(base, '0E8cdKtKwyX08C2s').typedCurrentRoles.map(r => r.signedDelta), [-1, -1]);
});

test('actual field values cannot be changed only in fieldReview even after refreshing closure hashes', () => {
    assert.ok(tamper(b => {
        const r = row(b, '0E8cdKtKwyX08C2s');
        const f = r.fieldReview.find(f => f.recordFieldPath === 'system.rules');
        f.recordValue[0].value = 2; f.recordJsonSha256 = hash(f.recordValue);
    }).some(e => e.includes('actual field/hash disagreement')));
});

test('Accuracy and Evasion roles never become ordinary Combat Stage percentage multipliers', () => {
    assert.equal(evidence(base, '19B5NNc6NhocDrms').typedCurrentRoles[0].domain, 'accuracy-modifier');
    assert.ok(evidence(base, '0zUf2fY6a4H2dyXS').typedCurrentRoles.every(r => r.domain === 'evasion-modifier' && r.signedDelta === -2));
    assert.equal(audit(base).sourceFacts.accuracyAndEvasion.ordinaryStatMultiplierSubstitutionPermitted, false);
    assert.equal(audit(base).sourceFacts.stages.hpIsOrdinaryStage, false);
});

test('Type Brace15DR, price2000, Booster5damage and STAB2DB remain separate roles', () => {
    assert.deepEqual(evidence(base, '3Z0FXRjOLUkhlBLG').typedCurrentRoles.map(r => [r.domain, r.value]), [['damage-reduction', 15], ['damage-reduction', 15]]);
    const d = detail(base, '3Z0FXRjOLUkhlBLG').specificAssessment;
    assert.match(d, /price2000/); assert.match(d, /Booster\+5 damage and STAB\+2DB/); assert.match(d, /typebrace\/typeplate/);
    assert.match(detail(base, '2zYeDpq6JRFiHIfe').specificAssessment, /price1800/);
});

test('complete incoming producer paths reject removed ChoiceSet relationships despite unchanged target presence', () => {
    assert.ok(tamper(b => { evidence(b, '3Z0FXRjOLUkhlBLG').incomingReferences.pop(); }).some(e => e.includes('incoming producer paths')));
});

test('Fur Coat and Mud Sport fractions do not certify one-step units or damaging-hit removal', () => {
    assert.equal(row(base, '43yyWrfv6Iv651Dx').coverageState, 'unresolved');
    assert.equal(row(base, '4YyFAI0B3xYo315b').coverageState, 'unresolved');
    assert.match(audit(base).sourceFacts.mudSport.completeEffect, /damaging Electric Type Move/);
    assert.equal(audit(base).sourceFacts.furCoat.equivalenceOfFractionToStepVerified, false);
});

test('Shadow Down signed text/snippet discrepancy and Diamond Storm100 encounter value stay literal', () => {
    const d = row(base, '0Km7iGlBLycSiE9d'); assert.match(d.ruleVersionReview.basis, /snippet says \+2.*subtracts2/);
    const f = row(base, '53hF6XAZWZgIG3xS').fieldReview.find(f => f.recordFieldPath === 'system.duration');
    assert.deepEqual(f.recordValue, {value: 100, unit: 'encounter', expiry: null});
    assert.match(detail(base, '53hF6XAZWZgIG3xS').specificAssessment, /EVEN Accuracy Rolls/);
});

test('optional Tingle full-round rule remains distinct from current turn-end duration', () => {
    assert.match(audit(base).sourceFacts.tingle.completeDefinition, /1 full round/);
    assert.equal(audit(base).sourceFacts.tingle.selectedAsMandatoryCore, false);
    assert.match(detail(base, '5LDjddx5X22YhwpU').specificAssessment, /does not establish a full round/);
    assert.equal(evidence(base, '5LDjddx5X22YhwpU').typedCurrentRoles[0].value, -5);
});

test('Defiant retains its own-Move/Ability exception and copied slugs never become identity', () => {
    assert.match(audit(base).sourceFacts.defiant.completeDefinition, /own Moves or Abilities/);
    assert.match(detail(base, '6FK8sVk0x9R2hce2').specificAssessment, /coaching/);
    assert.match(detail(base, '5d2GvetIiRDpK7Ex').specificAssessment, /lightningrod/);
    assert.match(detail(base, '4xeG1bZjVo4i85Xj').specificAssessment, /bug slug/);
});

test('bound2AP is a binding role; core START/END scene discrepancy and missing Spirit artifact remain', () => {
    const r = evidence(base, '1Ywb3SQJMtSPYynh').typedCurrentRoles[0];
    assert.equal(r.domain, 'bound-ap'); assert.equal(Number(r.value), 2);
    assert.equal(audit(base).sourceFacts.actionPoints.boundApIsSpiritGain, false);
    assert.match(audit(base).sourceFacts.actionPoints.printedRefreshConflict, /START.*END/);
    assert.equal(audit(base).sourceFacts.friendshipSpirit.completeEditionSpecificFrameworkEstablished, false);
    assert.equal(audit(base).sourceFacts.friendshipSpirit.externalRetrievalAssigned, false);
    assert.equal(evidence(base, '5t4UKwwwfctpppb5').typedCurrentRoles[0].domain, 'spirit-maximum');
});

test('page UUID suffix parser retains exact modern/legacy journal and page IDs', () => {
    const literal = 'Compendium.ptu.journals.JournalEntry.XaqlAbknAD3Tpx5E.JournalEntryPage.IbEa7GRGTQS4wjb6';
    assert.deepEqual(effectPageReferences({x: `@UUID[${literal}]{Umbra}`}), [{path: '$.x', literalUuid: literal, journalIdentity: 'journals.XaqlAbknAD3Tpx5E', pageId: 'IbEa7GRGTQS4wjb6'}]);
    assert.equal(effectPageReferences({x: literal.replace('JournalEntry.', '')})[0].pageId, 'IbEa7GRGTQS4wjb6');
    assert.deepEqual(effectPageReferences({x: 'Actor.1234567890abcdef'}), []);
});

test('retaining a journal head cannot conceal a missing actual page suffix', () => {
    const s = audit(base).targetSnapshots.find(s => s.pageReferences.length);
    assert.ok(s);
    assert.ok(tamper(b => { snapshot(b, s.identity).pageReferences[0].pageId = '0000000000000000'; }).some(e => e.includes('exact target/current/prior')));
    assert.ok(tamper(b => { audit(b).pageTargets[0].pageDocument.name = 'a different page'; }).some(e => e.includes('exact page-ID resolution/hash')));
});

test('native weather proposals/manual handling and local Darkness Actor UUIDs remain unpromoted', () => {
    const f = audit(base).sourceFacts.nativeWeather;
    assert.equal(f.independentApprovedAuthoringEstablished, false);
    assert.match(f.introduction, /tier/i); assert.match(f.darkness, /Darkvision|Glow/);
    const n = audit(base).nativeContexts.find(n => n.pageId === 'rzEXd4hoGRL4V2AS'); assert.match(n.rawText, /Actor\.[A-Za-z0-9]{16}/);
    assert.ok(tamper(b => { audit(b).nativeContexts[0].independentAuthoringClaim = true; }).some(e => e.includes('native page/source authority')));
});

test('Umbra adds Cursed after the full typed Persistent-or-Volatile trigger, preserving the triggering affliction', () => {
    const f = umbraSourceFacts(audit(base), sourceReviewText);
    assert.equal(f.journalIdentity, 'journals.XaqlAbknAD3Tpx5E'); assert.equal(f.pageId, 'IbEa7GRGTQS4wjb6');
    assert.equal(f.curse.qualifyingCreature, 'Ghost, Dark, or Fairy-Type');
    assert.equal(f.curse.trigger, 'a Persistent or Volatile Status Affliction'); assert.equal(f.curse.consequence, 'also Cursed');
    assert.equal(f.curse.triggeringAfflictionReplacedOrRemoved, false);
    assert.match(f.darknessClause, /all non-Ghost, Dark, and Fairy-Type creatures/);
    assert.match(f.illuminationNote, /Global Illumination.*normal light sources.*Glow Capability.*Darkvision/);
    assert.deepEqual(f.manualNotes.map(n => n.clause), ['curse', 'hazardCreation', 'hazardContact']);
    assert.ok(f.manualNotes.every(n => n.text === 'This part of the effect is not Automated!'));
    assert.equal(row(base, '0AFgft7HHsIp6gdQ').coverageState, 'unresolved');
    assert.equal(detail(base, '0AFgft7HHsIp6gdQ').specificAssessment, umbraSourceAssessment(f));
});

test('Umbra Hazard creation and the separate contact loss keep exact qualifiers, units and unadjudicated wording', () => {
    const f = audit(base).sourceFacts.nativeWeather.umbraClauses;
    assert.equal(f.hazardCreation.qualifyingCreator, 'the Ghost, Dark, or Fairy-Type');
    assert.equal(f.hazardCreation.affectedMoves, 'Hazard Keyword');
    assert.equal(f.hazardCreation.rangeIncrease, 2); assert.equal(f.hazardCreation.hazardNumberIncreasePercent, 50); assert.equal(f.hazardCreation.printedMinimum, 1);
    assert.equal(f.hazardContact.trigger, 'a creature comes into contact with or is affected by a Hazard');
    assert.equal(f.hazardContact.qualifyingCreatorLiteral, 'Ghost, Dark, and Fairy-Type creature');
    assert.equal(f.hazardContact.lossLiteral, 'a Tick of Hit Points');
    assert.equal(f.hazardContact.normalEffectsRelationship, "the Hazard's normal effects");
    assert.equal(f.hazardContact.creatureReferentAndCreatorConjunction, 'not adjudicated beyond the literal source');
    assert.match(f.hazardContact.clause, /that creature loses.*in addition to/);
});

test('Umbra additive consequence cannot become replacement/removal even with consistent summaries and refreshed derived hashes', () => {
    for (const wrong of ['Cursed replaces the triggering affliction.', 'Remove the triggering affliction and apply Cursed.']) {
        const es = tamper(b => changeUmbraAssessment(b, s => s.replace('Cursed is additional; the triggering Persistent or Volatile Status Affliction is retained, without replacement or removal.', wrong)));
        assert.ok(es.some(e => e.includes('Umbra additive consequence')));
    }
});

test('Umbra qualifying creature and both affliction kinds cannot disappear from the assessment trigger', () => {
    for (const [from, to] of [['When a Ghost, Dark, or Fairy-Type creature inflicts', 'When a creature inflicts'],
        ['a Persistent or Volatile Status Affliction', 'any condition'], ['a Persistent or Volatile Status Affliction', 'a Persistent Status Affliction']]) {
        assert.ok(tamper(b => changeUmbraAssessment(b, s => s.replace(from, to))).some(e => e.includes('Umbra additive consequence')));
    }
});

test('Umbra cannot broaden Hazard counts, omit contact HP loss or normal effects, or drop manual notes', () => {
    const f = audit(base).sourceFacts.nativeWeather.umbraClauses;
    for (const change of [
        s => s.replace(f.hazardCreation.clause, 'All count-based effects gain50%.'),
        s => s.replace(f.hazardContact.clause, ''),
        s => s.replace('in addition to the Hazard\'s normal effects.', 'instead of the Hazard\'s normal effects.'),
        s => s.replaceAll('This part of the effect is not Automated!', 'This effect is automated.')
    ]) assert.ok(tamper(b => changeUmbraAssessment(b, change)).some(e => e.includes('Umbra additive consequence')));
});

test('Umbra structured interpretations must still derive from unchanged literal clauses after all derived hashes refresh', () => {
    for (const change of [
        f => { f.curse.relationship = 'replacement'; f.curse.triggeringAfflictionReplacedOrRemoved = true; },
        f => { f.hazardCreation.hazardNumberIncreasePercent = 100; },
        f => { f.hazardContact.qualifyingCreatorLiteral = 'any creature'; },
        f => { f.hazardContact.clause = ''; f.hazardContact.normalEffectsRelationship = null; }
    ]) assert.ok(tamper(b => {
        const f = detail(b, '0AFgft7HHsIp6gdQ').nativeWeatherComparison;
        change(f); audit(b).sourceFacts.nativeWeather.umbraClauses = structuredClone(f);
        changeUmbraAssessment(b, () => umbraSourceAssessment(f));
    }).some(e => e.includes('Umbra additive consequence')));
});

test('Desiccating Heat -999 damage is not activation prevention; older Burn and future target remain distinct', () => {
    const e = evidence(base, '6qF9MzHQZJAeRBr6');
    assert.equal(e.typedCurrentRoles[1].value, -999);
    assert.ok(e.references.some(r => r.targetIdentity === 'effects.NA1Vn8A2h6JIIUhj'));
    assert.ok(e.references.some(r => r.targetIdentity === 'effects.YirEcq7HUwGSPBBO'));
    assert.ok(snapshot(base, 'effects.NA1Vn8A2h6JIIUhj').priorSourceReview);
    assert.equal(snapshot(base, 'effects.YirEcq7HUwGSPBBO').priorSourceReview, null);
    assert.match(detail(base, '6qF9MzHQZJAeRBr6').specificAssessment, /not activation prevention/);
});

test('Morpeko profile and Smoggy weather do not invent mode/Ability/Poison Weather Ball authoring', () => {
    assert.equal(evidence(base, '1Xf6TOopEqz6zM2r').incomingReferences.length, 0);
    assert.match(detail(base, '1Xf6TOopEqz6zM2r').specificAssessment, /not this \+5/);
    assert.ok(evidence(base, '6Q9VhUg1Q1xsLO6r').references.some(r => r.targetIdentity === 'moves.LXy6yDEKAAhhev26'));
    assert.match(detail(base, '6Q9VhUg1Q1xsLO6r').specificAssessment, /does NOT define/);
});

test('Acuity stack caps/consumption are missing authoring, and Take Heart retains its actual ALL-stat body', () => {
    assert.match(detail(base, '3IYiSrYDWlUDCq8t').specificAssessment, /rank1 caps2 and rank2 caps4/);
    assert.match(detail(base, '3IYiSrYDWlUDCq8t').specificAssessment, /prerequisites remain advisory/);
    assert.match(detail(base, '6v8hDmCirI3SoXOT').specificAssessment, /ALL stats1 and cure all status/);
    assert.equal(evidence(base, '6v8hDmCirI3SoXOT').typedCurrentRoles.length, 5);
});

test('source absence and name-only generation exclusions remain rejected after hash refresh', () => {
    assert.ok(tamper(b => { evidence(b, '6DECoenDdxGNv3y8').finiteSourceSearch.sourceAbsenceClaim = true; }).some(e => e.includes('finite discovery')));
    assert.ok(tamper(b => { detail(b, '3VLO3GqPLRdvhLKT').completeCurrentGenerationEstablished = true; row(b, '3VLO3GqPLRdvhLKT').coverageState = 'excluded'; })
        .some(e => e.includes('source/version/scope limit')));
});

test('all240 historical observations preserve14 exact-ID presences and capital Special legacy paths', () => {
    const all = Object.values(audit(base).currentRecordAudit).flatMap(e => e.exportLineage.snapshots);
    assert.equal(all.length, 240); assert.equal(all.filter(s => s.recordFound).length, 14);
    const old = evidence(base, '3Z0FXRjOLUkhlBLG').exportLineage.snapshots.filter(s => s.recordFound);
    assert.ok(old.some(s => s.historicalNormativeValues.rules.some(r => r.path === 'system.modifiers.damageReduction.Special')));
    assert.ok(tamper(b => {
        const s = evidence(b, '3Z0FXRjOLUkhlBLG').exportLineage.snapshots.find(s => s.recordFound);
        s.historicalNormativeValues.rules[1].path = 'system.modifiers.damageReduction.special.mod';
    }).some(e => e.includes('historical observations')));
});

test('historical archive and database provenance cannot drift from the preserved four-export registry', () => {
    assert.ok(tamper(b => { audit(b).historicalExports[0].archiveSha256 = '0'.repeat(64); })
        .some(e => e.includes('historical observations')));
    assert.ok(tamper(b => { b.temporarySpeciesSource = null; }).some(e => e.includes('historical observations')));
});

test('duplicated summary, record class and needed-artifact text must agree with the exact source assessment', () => {
    for (const change of [
        b => { row(b, '64zLtavH5iBUPWqa').ruleVersionReview.basis = 'The source specifies one stage.'; },
        b => { row(b, '64zLtavH5iBUPWqa').recordClass = 'standard'; },
        b => { row(b, '64zLtavH5iBUPWqa').missingEvidence.neededArtifact = 'No source needed.'; }
    ]) assert.ok(tamper(change).some(e => e.includes('source/version/scope limit')));
});

test('own F3a cycles never become earlier source evidence', () => {
    for (const id of ['43yyWrfv6Iv651Dx', '5LDjddx5X22YhwpU', '6FK8sVk0x9R2hce2']) assert.equal(snapshot(base, `effects.${id}`).priorSourceReview, null);
    assert.ok(tamper(b => { snapshot(b, 'effects.43yyWrfv6Iv651Dx').priorSourceReview = row(b, '43yyWrfv6Iv651Dx'); })
        .some(e => e.includes('prior chronology')));
});

test('synthetic future-H review cannot retroactively alter F3a prior availability', () => {
    assert.deepEqual(tamper(b => { b.files['fixture-future-h.json'] = {records: [{identity: 'journals.XaqlAbknAD3Tpx5E', coverageState: 'unresolved'}]}; }), []);
});

test('changed genuinely earlier F1 evidence still fails frozen chronology', () => {
    assert.ok(tamper(b => {
        const path = 'record-source-review/conditions.json'; b.files[path] = structuredClone(b.files[path]);
        b.files[path].records.find(r => r.identity === 'effects.wqzPWKMbwvOWLVoI').ruleVersionReview.basis += 'changed earlier evidence';
    }).some(e => e.includes('prior chronology changed: effects.wqzPWKMbwvOWLVoI')));
});

test('changed genuinely earlier C authoring limits cannot be hidden by a later effect disposition', () => {
    const identity = audit(base).targetSnapshots.find(s => s.identity.startsWith('abilities.') && s.priorSourceReview).identity;
    assert.ok(tamper(b => {
        const path = Object.keys(b.files).find(path => b.files[path].records.some(r => r.identity === identity));
        b.files[path] = structuredClone(b.files[path]);
        b.files[path].records.find(r => r.identity === identity).ruleVersionReview.basis += ' changed earlier Ability authority';
    }).some(e => e.includes('prior chronology changed: ' + identity)));
});

test('chronology never weakens actual linked target and nested UUID path integrity', () => {
    assert.ok(tamper(b => { snapshot(b, 'moves.LXy6yDEKAAhhev26').document.system.effect = 'unrelated'; }).some(e => e.includes('exact target/current/prior')));
    assert.ok(tamper(b => { evidence(b, '6qF9MzHQZJAeRBr6').references[0].nestedReferences.pop(); }).some(e => e.includes('exact nested target/path')));
});

test('typed observation helper keeps formula, selector, signed delta and bound-AP domains distinct', () => {
    const roles = effectRuleRoles({system: {rules: [
        {key: 'ActiveEffectLike', path: 'system.stats.atk.stage.mod', mode: 'subtract', value: 2},
        {key: 'FlatModifier', selectors: 'damage-base', value: 2},
        {key: 'ActionPoint', boundValue: 2},
        {key: 'ActiveEffectLike', path: 'system.spirit.max', mode: 'add', value: 1}
    ]}});
    assert.deepEqual(roles.map(r => [r.domain, r.signedDelta]), [['combat-stage:atk', -2], ['selector-modifier', null], ['bound-ap', null], ['spirit-maximum', 1]]);
});
