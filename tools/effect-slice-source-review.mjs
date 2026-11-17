// Offline frozen effect-source examinations. No gameplay or policy consumer.
import {effectReferences, effectLiteralReferences} from './effect-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const MEMBERSHIP = '3595bbfb07f6476a4eb2647f8e698c0425f617a2e47a8971f280218db1f14286';
const SOURCE_PRIMITIVES = 'a631d3ee0e2f8d1c256e2f08a034f437e2c93343b09feb7e7c9f52bb093e25c9';
const EXAMINED_DISPOSITIONS = 'bccb108cb15a7be9dce76ccf71297d6533b3a02ed3df4352fe6849995e85b177';
const HISTORICAL_OBSERVATIONS = 'df783b975a3e327e7cbc497e8bff117a1af072efface6430b7b3c18d9f887f95';

// Preserve the suffix which the older general reference parser deliberately
// leaves on the journal head. Never infer a page by title or a local Actor ID.
export function effectPageReferences(value, path = '$') {
    if (Array.isArray(value)) return value.flatMap((v, i) => effectPageReferences(v, `${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => effectPageReferences(v, `${path}.${k}`));
    if (typeof value !== 'string') return [];
    return [...value.matchAll(/Compendium\.ptu\.journals\.(?:JournalEntry\.)?([A-Za-z0-9]{16})\.JournalEntryPage\.([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)]
        .map(m => ({path, literalUuid: m[0], journalIdentity: `journals.${m[1]}`, pageId: m[2]}));
}

// Typed observations of actual rule objects, never executable interpretations.
export function effectRuleRoles(doc) {
    return (doc?.system?.rules ?? []).map((r, i) => {
        const stat = r.path?.match(/^system\.stats\.(atk|def|spatk|spdef|spd)\.stage\.mod$/)?.[1];
        const base = r.path?.match(/^system\.modifiers\.baseStats\.(atk|def|spatk|spdef|spd)\.mod$/)?.[1];
        const domain = stat ? `combat-stage:${stat}` : base ? `base-stat:${base}`
            : r.path?.includes('.evasion.') ? 'evasion-modifier' : r.path?.includes('.acBonus.') ? 'accuracy-modifier'
            : r.path?.includes('.damageReduction.') ? 'damage-reduction' : r.path?.includes('.resistanceSteps.') ? 'stored-resistanceSteps-unit-unverified'
            : r.path === 'system.spirit.max' ? 'spirit-maximum' : r.path?.startsWith('flags.ptu.') ? 'persistent-flag'
            : r.key === 'ActionPoint' ? 'bound-ap' : r.key === 'Effectiveness' ? 'stored-effectiveness-unit-unverified'
            : r.key === 'FlatModifier' ? 'selector-modifier' : r.key;
        return {path: `$.system.rules[${i}]`, key: r.key, domain, targetPath: r.path ?? null, operation: r.mode ?? null,
            value: r.key === 'ActionPoint' ? r.boundValue ?? null : r.value ?? null,
            signedDelta: typeof r.value === 'number' && ['add', 'subtract'].includes(r.mode) ? (r.mode === 'subtract' ? -r.value : r.value) : null,
            selectors: r.selectors ?? null, predicate: r.predicate ?? null};
    });
}

// These clauses are read independently from the retained native page. Keep the
// contact clause's literal conjunction/pronoun, rather than choosing a referent.
export function umbraSourceFacts(audit, cleanText) {
    const page = audit.nativeContexts.find(p => p.journalIdentity === 'journals.XaqlAbknAD3Tpx5E' && p.pageId === 'IbEa7GRGTQS4wjb6');
    const raw = page?.rawText ?? '';
    const text = html => cleanText(html.replace(/@CompSearch\[[^\]]+\]\{([^}]+)\}/g, '$1'));
    const clauses = [...raw.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => text(m[1]));
    const notes = [...raw.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/g)].map(m => text(m[1]));
    const [damage = '', darkness = '', curse = '', creation = '', contact = ''] = clauses;
    return {journalIdentity: page?.journalIdentity ?? null, pageId: page?.pageId ?? null,
        damageClause: damage, darknessClause: darkness, illuminationNote: notes[0] ?? null,
        curse: {clause: curse,
            qualifyingCreature: curse.match(/^When a (.*?) creature inflicts/)?.[1] ?? null,
            trigger: curse.match(/inflicts (.*?) on a target/)?.[1] ?? null,
            consequence: curse.match(/that target is (.*?)\.$/)?.[1] ?? null,
            relationship: /that target is also Cursed\./.test(curse) ? 'additional Cursed; triggering affliction retained' : 'unestablished',
            triggeringAfflictionReplacedOrRemoved: /that target is also Cursed\./.test(curse) ? false : null},
        hazardCreation: {clause: creation,
            qualifyingCreator: creation.match(/^When used by a creature with (.*?), all Moves/)?.[1] ?? null,
            affectedMoves: creation.match(/all Moves with the (.*?) increase/)?.[1] ?? null,
            rangeIncrease: Number(creation.match(/Range by \+([0-9]+)/)?.[1] ?? NaN),
            hazardNumberIncreasePercent: Number(creation.match(/number of Hazards they create is increased by ([0-9]+)%/)?.[1] ?? NaN),
            printedMinimum: Number(creation.match(/\(minimum ([0-9]+)\)/)?.[1] ?? NaN)},
        hazardContact: {clause: contact,
            trigger: contact.match(/^When (.*?) created by /)?.[1] ?? null,
            qualifyingCreatorLiteral: contact.match(/created by (.*?), that creature/)?.[1] ?? null,
            lossLiteral: contact.match(/that creature loses (.*?), in addition/)?.[1] ?? null,
            normalEffectsRelationship: contact.match(/in addition to (.*?)\.$/)?.[1] ?? null,
            creatureReferentAndCreatorConjunction: 'not adjudicated beyond the literal source'},
        manualNotes: [
            {clause: 'curse', text: notes[1] ?? null},
            {clause: 'hazardCreation', text: notes[2] ?? null},
            {clause: 'hazardContact', text: notes[3] ?? null}
        ]};
}

export function umbraSourceAssessment(facts) {
    return 'The current FlatModifier adds2 to exactly ghost/dark/fairy damage-base selectors. '
        + `The complete retained native Umbra page says: "${facts.damageClause}" "${facts.darknessClause}" `
        + `Its affliction clause is: "${facts.curse.clause}" Cursed is additional; the triggering Persistent or Volatile Status Affliction is retained, without replacement or removal. `
        + `Its separate Hazard-creation clause is: "${facts.hazardCreation.clause}" Range+2 concerns those Moves' Range; +50% (minimum1) concerns the number of Hazards they create, not arbitrary count-based effects. `
        + `Its separate contact/affected-by-Hazard clause is: "${facts.hazardContact.clause}" The literal "that creature" and "Ghost, Dark, and Fairy-Type creature" are retained without resolving referent or conjunction ambiguity beyond the source. `
        + `Illumination implementation note: "${facts.illuminationNote}" `
        + facts.manualNotes.map(n => `${n.clause} note: "${n.text}"`).join(' ')
        + ' All three clauses remain explicitly manual, not automated. Full weather Introduction describes a PTR overhaul proposal with unfinished distribution and tier priority/cancellation limits. Darkness has its own lighting-radius/accuracy/perception rules and local Actor UUIDs. A matching native +2DB clause is not independent approved authoring of this current weather effect, its lifecycle or omitted objects; unlimited expiry does not establish global application/removal. The unresolved source/version/use disposition remains.';
}

export function effectSliceSourceFacts(audit, cleanText) {
    const unit = id => cleanText(audit.sourceDefinitions.find(u => u.id === id)?.rawDefinition ?? '');
    const page = id => cleanText(audit.parentContexts.find(p => p.id === id)?.rawText ?? '');
    const native = id => cleanText(audit.nativeContexts.find(p => p.pageId === id)?.rawText ?? '');
    const number = (text, expression) => { const m = text.match(expression); return m ? Number(m[1]) : null; };
    const take = (text, expression) => text.match(expression)?.[0] ?? null;
    const belly = unit('core:391:move-line77'), bubble = unit('core:432:move-line47'), original = unit('core:394:move-line48'), optional = unit('sep:4:move-line27');
    const stock = unit('core:409:move-line50'), spit = unit('core:409:move-line26'), swallow = unit('core:410:move-line53');
    return {
        bellyDrum: {operation: take(belly, /gains/), attackStageDelta: number(belly, /gains \+([0-9]+) Attack Combat Stages/),
            cost: take(belly, /loses Hit Points equal to 1[\/⁄]2 of their Max Hit Points/), costUnit: 'fraction-of-max-hp'},
        bubble: {printedEffect: take(bubble, /Effect: Bubble lowers.*?16\+\./),
            speedStageAmount: number(bubble, /Speed (?:by )?([0-9]+) Combat Stages?/), omissionIsNotOneStage: true},
        defenseCurl: {original: {damageReduction: number(original, /gains ([0-9]+) Damage Reduction/),
            accuracyPenalty: number(original, /Accuracy is lowered by (-[0-9]+)/), exitAction: take(original, /as a Swift Action/),
            defenseStageIncreasePrinted: /Defense.*raised.*Combat Stage/.test(original)},
        optional: {defenseStageDelta: number(optional, /Defense is raised ([0-9]+) Combat Stage/),
            duration: take(optional, /until the end of the Scene or they are Recalled or Take a Breather/),
            classification: 'optional September2015 playtest; not silently adopted as core or labeled official erratum'}},
        stockpile: {maximumCount: number(stock, /maximum of ([0-9]+)/),
            defensePerCount: number(stock, /Defense ([0-9]+) Combat Stage/),
            specialDefensePerCount: number(stock, /Special Defense ([0-9]+) Combat Stage/),
            zeroCleanup: take(stock, /If a Stockpiled count is set to 0.*?removed\./)},
        swallow: {oneCountPercent: number(swallow, /healed ([0-9]+)%/), twoCount: take(swallow, /healed half of their full Hit Point value/),
            threeCount: take(swallow, /healed back to full Hit Points/), reset: take(swallow, /Stockpiled count is set to 0/),
            zero: take(swallow, /no Stockpiled count, Swallow does nothing/)} ,
        spitUp: {damageBasePerCount: number(spit, /Damage Base is increased by \+([0-9]+)/),
            zero: take(spit, /no Stockpiled count, Spit Up cannot be used/), resetClausePrinted: /(?:reset|set to 0|count becomes 0)/i.test(spit)},
        statAce: {pokemonLevelStep: number(unit('core:112:feature-line3'), /every ([0-9]+) Levels/),
            example: take(unit('core:112:feature-line3'), /Level 20 Pokemon.*?increased by \+3/),
            repeatedStat: take(unit('core:112:feature-line3'), /take Stat Ace multiple times, choosing different Stats each time/),
            prerequisiteHeaders: (unit('core:112:feature-line3').match(/Prerequisites:/g) ?? []).length},
        partingShot: {attackAndSpecialAttack: take(unit('core:352:move-line33'), /Effect:.*$/)},
        mudSport: {completeEffect: take(unit('core:386:move-line71'), /Effect:.*$/), equivalenceOfFractionToStepVerified: false},
        furCoat: {completeDefinition: unit('core:319:ability-line10'), equivalenceOfFractionToStepVerified: false},
        tingle: {completeDefinition: unit('feb:13:ability-line51'), selectedAsMandatoryCore: false},
        defiant: {completeDefinition: unit('core:315:ability-line47'), selfLossExceptionMustRemainSeparate: true},
        stages: {completeContext: page('core:235'), hpIsOrdinaryStage: false},
        accuracyAndEvasion: {completeContext: page('core:234'), ordinaryStatMultiplierSubstitutionPermitted: false},
        stab: {completeContext: page('core:236'), unit: 'damage-base; distinct from direct damage and equipment price'},
        actionPoints: {intro: page('core:16'), bind: page('core:57'), stratagem: page('core:61'), combat: page('core:221'),
            printedRefreshConflict: 'core16 START scene / core221 END scene; neither silently replaces the other', boundApIsSpiritGain: false},
        nativeWeather: {introduction: native('7znCkHSW9AWIyFIA'), umbra: native('IbEa7GRGTQS4wjb6'), umbraClauses: umbraSourceFacts(audit, cleanText), heat: native('4faymH1bVfUFQiUM'),
            smoggy: native('IAEQNRN3dhavHlYn'), darkness: native('rzEXd4hoGRL4V2AS'), independentApprovedAuthoringEstablished: false},
        friendshipSpirit: {nativePointer: native('p1lv6FIGyWpjIpmK'), completeEditionSpecificFrameworkEstablished: false, externalRetrievalAssigned: false}
    };
}

export function checkEffectSliceSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3a');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3a');
    if (!audit) { fail(!slice.recordFile, 'F3a completed slice is missing its independent source audit'); return; }
    fail((bundle.index.effectSliceSourceEvidenceFiles ?? []).length === bundle.effectSlices.length
        && audit.batch === 'F' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3a frozen/source-only boundary changed');
    const file = bundle.files[slice.recordFile], closure = audit.closure;
    if (!file) { fail(false, 'F3a record file missing'); return; }
    const primitives = Object.fromEntries(['sourceDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES,
        'F3a independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS,
        'F3a exact-ID source/version/typed-role dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 35 && audit.parentContexts.length === 50
        && audit.nativeContexts.length === 6, 'F3a bounded closure or context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3a full printed parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === original.rawDefinitionSha256)
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3a complete independent source unit changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const journal = actualMap.get(n.journalIdentity), page = journal?.data.pages?.find(p => p._id === n.pageId);
        fail(journal?.contentHash === n.journalContentHash && page && hash(page) === n.pageJsonSha256 && page.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run',
        'F3a exact native page/source authority changed: ' + n.pageId);
    }
    const facts = effectSliceSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && facts.bellyDrum.attackStageDelta === 6 && facts.bellyDrum.operation === 'gains'
        && facts.bellyDrum.cost && facts.bubble.printedEffect && facts.bubble.speedStageAmount === null
        && facts.defenseCurl.original.defenseStageIncreasePrinted === false && facts.defenseCurl.original.damageReduction === 10
        && facts.defenseCurl.original.accuracyPenalty === -4 && facts.defenseCurl.original.exitAction
        && facts.defenseCurl.optional.defenseStageDelta === 1 && facts.defenseCurl.optional.duration
        && facts.stockpile.maximumCount === 3 && facts.stockpile.defensePerCount === 1 && facts.stockpile.specialDefensePerCount === 1
        && facts.stockpile.zeroCleanup && facts.swallow.oneCountPercent === 25 && facts.swallow.twoCount && facts.swallow.threeCount
        && facts.swallow.reset && facts.swallow.zero && facts.spitUp.damageBasePerCount === 8 && facts.spitUp.zero
        && facts.spitUp.resetClausePrinted === false && facts.statAce.pokemonLevelStep === 10 && facts.statAce.example
        && facts.statAce.repeatedStat && facts.statAce.prerequisiteHeaders === 2,
    'F3a independently read signed/omitted/optional/count/cost/formula source roles changed');
    const umbra = facts.nativeWeather.umbraClauses, umbraDetail = rows.get('effects.0AFgft7HHsIp6gdQ')?.sourceComparison?.effectReview;
    fail(umbra.journalIdentity === 'journals.XaqlAbknAD3Tpx5E' && umbra.pageId === 'IbEa7GRGTQS4wjb6'
        && umbra.curse.qualifyingCreature === 'Ghost, Dark, or Fairy-Type'
        && umbra.curse.trigger === 'a Persistent or Volatile Status Affliction' && umbra.curse.consequence === 'also Cursed'
        && umbra.curse.relationship === 'additional Cursed; triggering affliction retained' && umbra.curse.triggeringAfflictionReplacedOrRemoved === false
        && umbra.hazardCreation.qualifyingCreator === 'the Ghost, Dark, or Fairy-Type'
        && umbra.hazardCreation.affectedMoves === 'Hazard Keyword' && umbra.hazardCreation.rangeIncrease === 2
        && umbra.hazardCreation.hazardNumberIncreasePercent === 50 && umbra.hazardCreation.printedMinimum === 1
        && umbra.hazardContact.trigger === 'a creature comes into contact with or is affected by a Hazard'
        && umbra.hazardContact.qualifyingCreatorLiteral === 'Ghost, Dark, and Fairy-Type creature'
        && umbra.hazardContact.lossLiteral === 'a Tick of Hit Points' && umbra.hazardContact.normalEffectsRelationship === "the Hazard's normal effects"
        && umbra.manualNotes.every(n => n.text === 'This part of the effect is not Automated!')
        && equal(umbraDetail?.nativeWeatherComparison, umbra) && umbraDetail?.specificAssessment === umbraSourceAssessment(umbra),
    'F3a Umbra additive consequence, full trigger, separate Hazard/contact clauses or manual/source limits changed');
    fail(audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition')
        && audit.authoringLimits.friendshipSpirit.completeFrameworkEstablished === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.runtimeVariantFrameworkImplemented === false,
    'F3a missing authoring or unrun foundations promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3a'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 107 && snapshots.size === audit.targetSnapshots.length, 'F3a exact target inventory changed');
    for (const s of snapshots.values()) {
        const actual = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (actual?.contentHash ?? null) && equal(s.document, actual?.data ?? null)
            && equal(s.priorSourceReview, prior) && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null)
            && equal(s.pageReferences, effectPageReferences(actual?.data)), 'F3a exact target/current/prior chronology changed: ' + s.identity);
    }
    const allPageRefs = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    const pageKeys = [...new Set(allPageRefs.map(r => `${r.journalIdentity}.${r.pageId}`))];
    fail(equal(pageKeys, audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3a complete literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const page = actualMap.get(p.journalIdentity)?.data.pages?.find(page => page._id === p.pageId) ?? null;
        fail(p.pageFound === (page !== null) && p.pageJsonSha256 === (page ? hash(page) : null) && equal(p.pageDocument, page)
            && p.authority === 'Literal page resolution only; no new authoring, canonical relationship, generation recovery or H examination.',
        'F3a exact page-ID resolution/hash changed: ' + p.journalIdentity + '.' + p.pageId);
    }
    const allHistory = Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}));
    fail(hash(allHistory) === HISTORICAL_OBSERVATIONS && audit.historicalExports.length === 4
        && equal(audit.historicalExports, bundle.temporarySpeciesSource?.historicalExports),
        'F3a complete independently captured historical observations changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, actual] of actualMap) for (const ref of effectReferences(actual.data))
        incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: actual.contentHash, ...ref});
    const order = a => [...a].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3a per-ID inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const row = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = row?.sourceComparison?.effectReview;
        fail(row && e && d && doc?.type === 'effect' && row.contentHash === contentHash && e.contentHash === contentHash, 'F3a exact effect examination missing: ' + identity);
        if (!row || !e || !d || !doc) continue;
        counts[row.coverageState] = (counts[row.coverageState] ?? 0) + 1;
        fail(hash(row) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256
            && row.ruleVersionReview.basis === d.specificAssessment
            && row.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || row.missingEvidence?.neededArtifact === d.specificAssessment
                && row.missingEvidence.sourceAbsenceClaim === false && row.missingEvidence.implementationOrAuthoringLimitNotUnexaminedInput === true)
            && d.specificAssessment.length > 250 && d.sourceDefinitionIds.every(id => units.has(id))
            && d.parentContextIds.every(id => parents.has(id)) && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id))
            && d.completeCurrentGenerationEstablished === false && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false
            && d.fieldCorrespondenceOnly === true && d.actualAcquisitionPreservationAndGameplay === 'not-run'
            && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && row.sourceComparison.sourceAbsenceClaim === false && row.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved'),
        'F3a per-ID source/version/scope limit bypassed: ' + identity);
        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys)
            && equal(row.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3a complete current fields changed: ' + identity);
        for (const f of row.fieldReview) {
            const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256, 'F3a actual field/hash disagreement: ' + identity + ' ' + f.recordFieldPath);
        }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3a complete rule/typed/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)),
        'F3a exact outgoing/incoming producer paths changed: ' + identity);
        for (const ref of e.references) {
            fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
                && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
                && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)),
            'F3a exact nested target/path changed: ' + identity);
        }
        const claims = row.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])),
        'F3a complete inherited numeric/text claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3a same-ID historical field/delta comparison changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false,
        'F3a finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 21, unresolved: 39}) && equal(counts, closure.counts), 'F3a bounded correspondence/limit counts changed');
}
