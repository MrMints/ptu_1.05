// Offline F2 evidence integrity. These checks never acquire an item, apply an
// effect, select a rules version, or certify actor/campaign preservation.
import {effectReferences, effectLiteralReferences} from './effect-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const MEMBERSHIP = '9b22550cbcf62669b928a9ce9f39ea9b22e2e046075c550df67e6b7e859b8abd';
const SOURCE_PRIMITIVES = '2beeb094ff9ec6b9c10dc429751beee93e5088e9cb15f78296a2007709cdba42';
const EXAMINED_DISPOSITIONS = 'fdd12c2af2db78ce669d99ec3514ff8db59df5bd07b5e78488e1d2886161e46f';
const HISTORICAL_OBSERVATIONS = 'f7d9045411f310151e59539f655a9d845c5329f24a2576e9307559e33982ec94';
const EXCLUDED_TARGETS = [
    ['effects.MRwgSGklIvxzFrgk', 'species.bsN60L9oZQ3DM31I'],
    ['effects.e6eWrcu5JugErmjT', 'species.eSkv7LB0cQ4zYLpM']
];
const STAT_NAMES = {atk: 'Attack', def: 'Defense', spatk: 'Special Attack', spdef: 'Special Defense', spd: 'Speed'};
const DELTA_NAMES = {atk: 'Atk', def: 'Def', spatk: 'Sp\\. Atk', spdef: 'Sp\\. Def', spd: 'Speed'};

// Read signed roles from the complete printed notes. Omitted HP stays omitted;
// the two different source bases are not collapsed into an invented target ID.
export function ultraBurstSourceCalculation(unit, cleanText) {
    const note = cleanText(unit.rawDefinition), parent = unit.completeParentText;
    const base = {}, deltas = {}, result = {};
    for (const [key, label] of Object.entries(STAT_NAMES)) {
        const value = parent.match(new RegExp(`^${label}:\\s+([0-9]+)`, 'm'));
        const delta = note.match(new RegExp(`([+-][0-9]+) ${DELTA_NAMES[key]}(?:,|$)`));
        base[key] = value ? Number(value[1]) : null;
        deltas[key] = delta ? Number(delta[1]) : null;
        result[key] = value && delta ? base[key] + deltas[key] : null;
    }
    return {base, deltas, result, hpDeltaPrinted: /[+-][0-9]+ HP\b/.test(note)};
}

export function temporarySpeciesSourceFacts(audit, cleanText) {
    const page = id => cleanText(audit.parentContexts.find(p => p.id === id)?.rawText ?? '');
    const take = (id, expression) => page(id).match(expression)?.[0] ?? null;
    return {
        mega: {
            heldItems: take('core:206', /Pok[eé]mon must be holding.*?Mega Ring\./),
            additionalAbility: take('core:206', /Ability gained from Mega Evolution is always added.*?replace a current Ability\./),
            duplicateFallback: take('core:206', /cannot gain two instances.*?does not currently have\./),
            statAlternatives: take('core:206', /There are two ways.*?Base Relations to do so\./),
            actionAndScene: take('core:206', /triggered on either.*?rest of the Scene\./),
            stoneRemoval: take('core:206', /Mega Stones cannot be removed.*?Magician\./),
            customPermissionAndLimit: take('core:206', /Of course, you may decide.*?change in Type\./)
        },
        deoxys: {
            outsideBattle: take('plus-dex:726', /Deoxys may change.*?outside of battle\./),
            printedDefenseTail: page('plus-dex:726').slice(-13),
            attackBasicAbility: take('plus-dex:725', /Basic Ability 1: Weird Power/),
            defenseBasicAbility: take('plus-dex:726', /Basic Ability 1: Sturdy/),
            speedBasicAbility: take('plus-dex:727', /Basic Ability 1: Speed Boost/)
        },
        ultraBurst: audit.ultraBurstSourceDefinitions.map(unit => ({id: unit.id, ...ultraBurstSourceCalculation(unit, cleanText),
            ability: cleanText(unit.rawDefinition).match(/Ability: Neuroforce/)?.[0] ?? null,
            replacementAndGlow: cleanText(unit.rawDefinition).match(/Adv Ability 1 becomes Illuminate; Gains Glow\./)?.[0] ?? null})),
        originalZen: take('core:336', /Ability: Zen Mode.*$/),
        optionalZen: take('feb:11', /Ability: Zen Mode.*?Move List\./),
        relicSong: take('core:405', /As long as Meloetta knows Relic Song.*?same HP Stat\./),
        stanceChange: take('core:331', /Ability: Stance Change.*?Full Action\./),
        giratina: take('plus-dex:740', /Giratina is in its Origin Forme.*?Altered Forme\./),
        hoopa: take('plus-dex:747', /Confined.*$/),
        shaymin: take('plus-dex:719', /\*Sky Forme Shaymin can.*$/),
        inheritedNativeMegaAction: cleanText(audit.nativeContexts.find(n => n.pageId === 'xkjg2V434caYYxQG')?.rawText ?? '')
            .match(/Mega Evolution can be triggered.*?Rapid Action\./)?.[0] ?? null,
        campaignPacingAdvice: take('core:470', /The proper timing.*$/)
    };
}

export function checkTemporarySpeciesSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch?.slices.find(s => s.id === 'F2');
    if (!bundle.index.temporarySpeciesSourceEvidence) {
        fail(!slice?.recordFile, 'F2 completed slice is missing its source audit');
        return;
    }
    const audit = bundle.temporarySpeciesSource;
    fail(audit?.batch === 'F' && audit.slice === 'F2' && audit.sourceFingerprint === bundle.index.sourceFingerprint
        && audit.membershipSha256 === MEMBERSHIP && slice?.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceAbsenceClaim === false && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run',
    'F2 frozen scope, source-absence or source-only boundary changed');
    if (!audit || !slice?.recordFile) return;
    const file = bundle.files[slice.recordFile], closure = audit.closure;
    const primitives = Object.fromEntries(['parentContexts', 'reusedSourceDefinitions', 'ultraBurstSourceDefinitions', 'deoxysPrintedBoundary', 'nativeContexts'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES,
        'F2 independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison?.temporarySpeciesReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS,
        'F2 exact-ID examined scope/version/source dispositions changed');
    fail(closure.records === 82 && closure.sourceExaminationComplete === true && closure.fullFAcceptance === false
        && hash(file) === closure.recordEvidenceSemanticSha256 && audit.parentContexts.length === 155 && audit.reusedSourceDefinitions.length === 75,
    'F2 bounded closure or complete-source inventory changed');
    const parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) {
        citations(p);
        fail(textHash(p.rawText) === p.rawSha256, 'F2 complete printed parent changed: ' + p.id);
    }
    fail(audit.nativeContexts.length === 2, 'F2 complete inherited Mega context inventory changed');
    for (const n of audit.nativeContexts) {
        const journal = actualMap.get(n.journalIdentity), page = journal?.data.pages?.find(p => p._id === n.pageId);
        fail(journal?.contentHash === n.journalContentHash && page && hash(page) === n.pageJsonSha256 && page.text.content === n.rawText
            && n.authority === 'inherited explanatory/advice context; not independent authoring, a canonical relationship or mandatory acquisition policy'
            && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run',
        'F2 exact inherited native context or authority changed: ' + n.pageId);
    }
    const definitions = new Map(audit.reusedSourceDefinitions.map(u => [u.id, u]));
    for (const u of definitions.values()) {
        const original = bundle[u.namespace]?.sourceDefinitions.find(s => s.id === u.id);
        const printed = u.printedAnchors.map((a, i) => parents.get(u.parentContextIds[i])?.rawText.split('\n').slice(a.startLine - 1, a.endLine).join('\n').trimEnd()).join('\n');
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === original.rawDefinitionSha256
            && u.printedDefinition === printed && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run',
        'F2 reused full original/revised source or literal printed boundary changed: ' + u.id);
    }
    for (const u of audit.ultraBurstSourceDefinitions) {
        citations(u);
        const calculated = ultraBurstSourceCalculation(u, cleanText);
        const sourceParent = parents.get(`alola:${u.source.pdfPages[0]}`);
        fail(sourceParent?.rawText === u.completeParentText && textHash(u.completeParentText) === u.parentSha256
            && textHash(u.rawDefinition) === u.rawSha256
            && u.completeParentText.split('\n').slice(u.startLine - 1).join('\n').trimEnd() === u.rawDefinition
            && equal(calculated.base, u.printedNonHpBaseStats) && equal(calculated.deltas, u.printedNonHpStatDeltas)
            && equal(calculated.result, u.nonHpSourceCalculation) && calculated.hpDeltaPrinted === false && u.hpDeltaPrinted === false
            && u.targetUuidClaim === null && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run',
        'F2 Ultra Burst signed/base/stat/slot/HP/source boundary changed: ' + u.id);
    }
    const facts = temporarySpeciesSourceFacts(audit, cleanText);
    const leaves = v => v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : [v];
    fail(equal(facts, audit.sourceFacts) && leaves(facts).every(v => v !== null && v !== undefined)
        && facts.deoxys.printedDefenseTail === 'Prepare stats'
        && facts.ultraBurst.every(u => equal(u.result, {atk: 17, def: 10, spatk: 17, spdef: 10, spd: 13}) && !u.hpDeltaPrinted),
    'F2 independently read source action, variant, signed-stat, slot or printed-tail facts changed');
    fail(audit.authoringLimits.friendshipSpirit.completeActionAndResourceFrameworkEstablished === false
        && audit.authoringLimits.friendshipSpirit.externalRetrievalAssigned === false
        && audit.authoringLimits.friendshipSpirit.nativePointerPageId === 'p1lv6FIGyWpjIpmK'
        && audit.authoringLimits.friendshipSpirit.limit.length > 200
        && audit.authoringLimits.foundationAssessment.includes('No actual supported acquisition'),
    'F2 missing Spirit authoring or unrun foundations promoted');
    fail(audit.historicalExports.length === 4 && audit.historicalExports.every(h => /^[a-f0-9]{40}$/.test(h.revision)
        && /^[a-f0-9]{64}$/.test(h.archiveSha256) && h.packs.length === 2 && h.packs.every(p => p.extraction === 'complete'
            && p.manifestPresent && /^[a-f0-9]{40}$/.test(p.tree) && p.databaseFiles.every(f => /^[a-f0-9]{64}$/.test(f.sha256)))),
    'F2 complete four-export provenance changed');
    const snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s])), priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F2');
    fail(snapshots.size === 1002 && snapshots.size === audit.targetSnapshots.length, 'F2 exact target inventory changed');
    for (const s of snapshots.values()) {
        const actual = actualMap.get(s.identity), p = priorIds.has(s.identity) ? rows.get(s.identity) : null;
        const prior = p ? {coverageState: p.coverageState, recordClass: p.recordClass, recordEvidenceSemanticSha256: hash(p),
            generationReview: p.generationReview, ruleVersionReview: p.ruleVersionReview, sources: p.sources} : null;
        fail(s.contentHash === (actual?.contentHash ?? null) && equal(s.document, actual?.data ?? null) && equal(s.priorSourceReview, prior),
            'F2 exact target/current/prior chronology changed: ' + s.identity);
    }
    fail(audit.completePriorDirectComparisons.length === 186 && new Set(audit.completePriorDirectComparisons.map(p => p.identity)).size === 186,
        'F2 complete direct target/producer/use-context comparison inventory changed');
    for (const p of audit.completePriorDirectComparisons) {
        const original = priorIds.has(p.identity) ? rows.get(p.identity) : null;
        fail(original && hash(original) === p.recordEvidenceSemanticSha256 && equal(original, p.completePriorSourceReview),
            'F2 complete prior direct definition/alternative/version limits changed: ' + p.identity);
    }
    fail(equal(audit.excludedOnlyRootsNotTraversed, EXCLUDED_TARGETS), 'F2 excluded-only exact target boundary changed');
    fail(hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
        'F2 independently captured complete historical observations changed');
    const skipped = new Map(EXCLUDED_TARGETS), incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, actual] of actualMap) for (const reference of effectReferences(actual.data)) {
        incoming.get(reference.targetIdentity)?.push({sourceIdentity, sourceContentHash: actual.contentHash, ...reference});
    }
    const scope = new Map(audit.scopeDispositions.map(s => [s.identity, s]));
    fail(equal([...scope.keys()], slice.members.map(([id]) => id))
        && equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F2 frozen per-ID examinations incomplete');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const row = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data;
        const d = row?.sourceComparison?.temporarySpeciesReview, sc = scope.get(identity);
        fail(row && e && d && doc?.type === 'effect' && row.contentHash === contentHash && e.contentHash === contentHash,
            'F2 exact current effect examination missing: ' + identity);
        if (!row || !e || !d || !doc) continue;
        counts[row.coverageState] = (counts[row.coverageState] ?? 0) + 1;
        fail(sc.contentHash === contentHash && equal(row.generationReview, sc.generationReview)
            && equal(d.sourceDefinitionIds, sc.sourceDefinitionIds) && equal(d.parentContextIds, sc.parentContextIds)
            && equal(d.nativeContextIds, sc.nativeContextIds) && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id))
            && d.sourceDefinitionIds.every(id => definitions.has(id)) && d.parentContextIds.every(id => parents.has(id))
            && d.specificAssessment.length > 250 && d.completeCurrentGenerationEstablished === false && d.canonicalRelationshipClaim === false
            && d.sourceAbsenceClaim === false && row.sourceComparison.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run'
            && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && row.coverageState === (audit.reviewedFieldCorrespondenceIdentities.includes(identity) ? 'reviewed' : 'unresolved')
            && hash(row) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256,
        'F2 precise per-ID source/version/scope or source-absence limit bypassed: ' + identity);
        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys)
            && equal(row.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']),
        'F2 complete current system/embedded/other fields changed: ' + identity);
        for (const f of row.fieldReview) {
            const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256, 'F2 actual field/hash disagreement: ' + identity + ' ' + f.recordFieldPath);
        }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.literalReferenceClaims, effectLiteralReferences(doc)), 'F2 full executable object or malformed/literal reference changed: ' + identity);
        const temps = doc.system.rules.flatMap((rule, i) => rule.key === 'TemporarySpecies' ? [{path: `$.system.rules[${i}].uuid`, rule,
            targetIdentity: rule.uuid.replace(/^Compendium\.ptu\.([\w-]+)\.(?:Item\.)?/, '$1.')}] : []);
        fail(temps.length === 1 && equal(temps[0], d.temporarySpecies) && skipped.has(identity) === d.excludedOnlyTargetNestedRecoverySkipped,
            'F2 exact TemporarySpecies literal/target/scope changed: ' + identity);
        const target = snapshots.get(d.temporarySpecies.targetIdentity), p = rows.get(d.temporarySpecies.targetIdentity);
        const sourceFields = Object.fromEntries((p?.sourceComparison?.fields ?? []).filter(f => ['system.stats', 'system.types', 'system.abilities exact UUID-resolved slot order'].includes(f.field)).map(f => [f.field, f]));
        fail(target && equal(sourceFields, d.linkedTargetSourceFields) && equal(p?.sourceComparison?.derivedFormEvidence ?? null, d.derivedFormEvidence),
            'F2 linked printed form fields/source omissions changed: ' + identity);
        fail(equal(effectReferences(doc), e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity}))),
            'F2 exact modern/legacy outgoing paths changed: ' + identity);
        for (const ref of e.references) {
            const t = actualMap.get(ref.targetIdentity), expected = skipped.has(identity) ? [] : effectReferences(t?.data);
            fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (t?.contentHash ?? null)
                && equal(expected, ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})))
                && ref.nestedReferences.every(c => snapshots.has(c.targetIdentity) && c.targetContentHash === (actualMap.get(c.targetIdentity)?.contentHash ?? null)),
            'F2 exact nested target/path or excluded-only boundary changed: ' + identity + ' ' + ref.path);
        }
        const order = values => [...values].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
        fail(equal(order(incoming.get(identity)), order(e.incomingReferences)) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)),
            'F2 exact incoming producer paths changed: ' + identity);
        const claims = row.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])),
        'F2 complete inherited numeric/text claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && /^[a-f0-9]{64}$/.test(s.historicalContentHash)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F2 actual same-ID historical field/delta comparison changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false,
        'F2 finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 44, unresolved: 38}) && equal(counts, closure.counts), 'F2 partial correspondence/precise-limit census changed');
}
