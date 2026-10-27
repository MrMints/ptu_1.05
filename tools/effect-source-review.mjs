// Offline source evidence only. No runtime, acquisition or policy consumer.
import {itemSourceWords} from './item-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const F1_SOURCE_PRIMITIVES = 'a31c43959eeb7bc4b9f0498d2de39baaa41d64dbadd9af0760a2e2f2ee58f46c';
// Binds each examined identity/hash to its actual cited source-concept evidence.
// All38 current generation/version identities remain incompletely established.
const F1_SCOPE_DISPOSITIONS = 'a1b99d08024e5aa08c3bdf51b59aa611514e6b01879ae3ab111cfc83534c40ca';
const F_MEMBERSHIP = '791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6';
const REVIEWED_CONDITIONS = new Set([
    '299X6pActAV8ITz7', 'BuK1xNKNhBn1DZDu', 'GUKAMwsFi0EJ56WD', 'I2nVAxBFKDMe8EQt',
    'NA1Vn8A2h6JIIUhj', 'OzGm9ZwyLd8yEhCK', 'Su7r4LU2xSVK9WY6', 'XWqLLq9Vb9h0eZwh',
    'bgmIrNI1jJHTVwVN', 'g2QutQJutABxFIw6', 'uqo5H1DwUuAiaYRA', 'wqzPWKMbwvOWLVoI'
].map(id => `effects.${id}`));

export function effectReferences(value, path = '$') {
    if (Array.isArray(value)) return value.flatMap((child, i) => effectReferences(child, `${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => effectReferences(child, `${path}.${key}`));
    if (typeof value !== 'string') return [];
    return [...value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])|@Compendium\[ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})\]/g)]
        .map(match => ({path, literalUuid: match[0], targetIdentity: `${match[1] ?? match[3]}.${match[2] ?? match[4]}`}));
}

export function effectLiteralReferences(value, path = '$') {
    if (Array.isArray(value)) return value.flatMap((child, i) => effectLiteralReferences(child, `${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => effectLiteralReferences(child, `${path}.${key}`));
    return typeof value === 'string' && /Compendium\.|@Compendium\[|(?:Actor|Item|Macro|JournalEntry)\.[A-Za-z0-9]{16}|https?:\/\/|flags\.ptu\.|@(?:actor|item)\.|\{(?:actor|item)\|/.test(value)
        ? [{path, literal: value}] : [];
}

// Retain the actual printed phrases for the fields most easily confused across
// editions. These are source observations, never a runtime condition model.
export function conditionSourceFacts(audit, cleanText) {
    const raw = id => cleanText(audit.sourceDefinitions.find(unit => unit.id === id)?.rawDefinition ?? '');
    const capture = (id, expression) => raw(id).match(expression)?.[0] ?? null;
    return {
        originalParalysis: {
            speed: capture('f1:core:246:paralysis', /Speed Stat is lowered by 4 Combat Stages/),
            save: capture('f1:core:246:paralysis', /beginning of each turn.*?DC 5 Save Check/),
            failedActions: capture('f1:core:246:paralysis', /cannot take any Standard, Shift, or Swift Actions/)
        },
        optionalParalysis: {
            initiative: capture('f1:feb:2:paralysis', /Initiative is halved/),
            save: capture('f1:feb:2:paralysis', /11\+ at start of the user's turn/),
            failedActions: capture('f1:feb:2:paralysis', /Standard OR Shift Action that round, but not both/)
        },
        originalConfusion: {
            timing: capture('f1:core:247:confused', /beginning of their turn/),
            selfAttack: capture('f1:core:247:confused', /1-8.*?Typeless Physical Struggle Attack.*?no other actions this turn/),
            cure: capture('f1:core:247:confused', /16 or higher.*?cured of confusion/)
        },
        optionalConfusion: {
            die: capture('f1:feb:2:confusion', /roll 1d2\. On 1, after the attack is resolved/),
            loss: capture('f1:feb:2:confusion', /half their Attack Stat.*?two Ticks of Hit Poitns/),
            cure: capture('f1:feb:2:confusion', /16\+ made at end of turn/)
        },
        badlyPoisoned: capture('f1:core:246:poisoned', /instead loses 5 Hit Points.*?10, 20, 40, etc/),
        sleepActions: capture('f1:core:247:sleep', /Free and Swift Actions that would cure Sleep/),
        vortex: {
            damage: capture('f1:core:341:vortex', /Tick of Hit Points at the beginning of each turn/),
            save: capture('f1:core:341:vortex', /At the end of each turn.*?roll 1d20/),
            schedule: capture('f1:core:341:vortex', /lowered by 6.*?20, 14, 8, 2, Dispel/)
        },
        bane: capture('f1:throhs:45:bane', /start of their next three turns.*?-2 penalty to all Save Checks on those turns/),
        originalCheered: capture('f1:core:93:cheerleader', /give up the Cheered condition.*?roll twice, and take the best result/),
        optionalCheered: capture('f1:sep:3:cheers', /Cheered for 1 full round.*?cannot be lowered by foe's attacks, features, or abilities/)
    };
}

export function checkEffectSourceReview(bundle, context) {
    if (!bundle.index.effectSourceEvidence) return;
    const {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations} = context;
    const audit = bundle.effectSource, batch = bundle.batchManifest.batches.find(b => b.id === 'F');
    const words = value => itemSourceWords(value, normalizedText);
    fail(audit?.batch === 'F' && audit.sourceFingerprint === bundle.index.sourceFingerprint
        && audit.membershipSha256 === F_MEMBERSHIP && batch.membershipSha256 === F_MEMBERSHIP
        && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run' && audit.sourceAbsenceClaim === false,
    'F scope, original membership or source-only boundary changed');
    if (!audit) return;
    const slice = batch.slices.find(s => s.id === 'F1');
    if (!slice?.recordFile) return;
    const closure = audit.completedSlices.F1, file = bundle.files[slice.recordFile];
    const primitives = {
        definitions: audit.sourceDefinitions, reusedDefinitions: audit.reusedSourceDefinitions, parents: audit.parentContexts,
        natives: audit.nativeContexts.map(({journalIdentity, journalContentHash, pageId, pageJsonSha256, rawText}) => ({journalIdentity, journalContentHash, pageId, pageJsonSha256, rawText}))
    };
    fail(hash(primitives) === F1_SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === F1_SOURCE_PRIMITIVES,
        'F1 independently examined source definitions/parent contexts changed');
    const definitions = new Map(audit.sourceDefinitions.map(unit => [unit.id, unit]));
    const reused = new Map(audit.reusedSourceDefinitions.map(unit => [unit.id, unit]));
    fail(definitions.size === 38 && reused.size === 3 && audit.parentContexts.length === 24 && audit.nativeContexts.length === 8,
        'F1 complete source/context inventory changed');
    for (const unit of definitions.values()) {
        citations(unit);
        fail(unit.rawSha256 === textHash(unit.rawDefinition) && unit.anchor.startLine >= 1
            && unit.rawDefinition.split('\n').length === unit.anchor.endLine - unit.anchor.startLine + 1
            && unit.canonicalIdentityClaim === false && unit.productionPolicyPromotion === false && unit.behavioralVerification === 'not-run',
        'F1 complete source anchor or authority changed: ' + unit.id);
        const parent = audit.parentContexts.find(p => equal(p.source.path, unit.source.path) && p.source.pdfPages.includes(unit.anchor.pdfPage));
        fail(parent && parent.rawText.split('\n').slice(unit.anchor.startLine - 1, unit.anchor.endLine).join('\n').trimEnd() === unit.rawDefinition,
            'F1 definition no longer matches complete parent: ' + unit.id);
    }
    for (const unit of reused.values()) {
        const original = bundle.itemSource?.[unit.namespace]?.[unit.collection]?.find(u => u.id === unit.sourceUnitId);
        fail(original && hash(original) === unit.sourceUnitSemanticSha256 && equal(unit.completeSourceUnit, original)
            && unit.canonicalIdentityClaim === false && unit.productionPolicyPromotion === false && unit.behavioralVerification === 'not-run',
        'F1 reused accepted item definition changed: ' + unit.id);
    }
    for (const parent of audit.parentContexts) {
        citations(parent);
        fail(parent.rawSha256 === textHash(parent.rawText) && parent.productionPolicyPromotion === false && parent.behavioralVerification === 'not-run',
            'F1 complete parent/source-only limit changed: ' + parent.id);
    }
    for (const native of audit.nativeContexts) {
        const journal = actualMap.get(native.journalIdentity), page = journal?.data.pages?.find(p => p._id === native.pageId);
        fail(page && hash(page) === native.pageJsonSha256 && journal.contentHash === native.journalContentHash && page.text.content === native.rawText
            && native.authority === 'inherited-explanatory-context; not independent complete authoring or a canonical relationship'
            && native.productionPolicyPromotion === false && native.behavioralVerification === 'not-run', 'F1 inherited native context or authority changed: ' + native.pageId);
    }
    const facts = conditionSourceFacts(audit, cleanText);
    const leaves = value => value && typeof value === 'object' ? Object.values(value).flatMap(leaves) : [value];
    fail(equal(facts, audit.conditionSourceFacts) && leaves(facts).every(value => typeof value === 'string' && value.length > 8),
        'F1 original/playtest timing, numeric roles or source facts changed');
    fail(audit.authoringLimits?.friendshipSpirit?.completeActionAndResourceFrameworkEstablished === false
        && audit.authoringLimits.friendshipSpirit.externalRetrievalAssigned === false
        && audit.authoringLimits.friendshipSpirit.nativePointerPageId === 'p1lv6FIGyWpjIpmK'
        && audit.authoringLimits.friendshipSpirit.externalLocator === 'https://1e.ptr.wiki/Rules/Playtests/Spirit-Friendship'
        && audit.authoringLimits.friendshipSpirit.limit.length > 200
        && audit.authoringLimits.shadowSubsystem.completeIndependentAuthoringEstablished === false
        && audit.authoringLimits.tieredWeather.completeIndependentAuthoringEstablished === false,
    'F1 inherited links/subsystem claims promoted to complete independent authoring');
    fail(audit.historicalExports.length === 4 && audit.historicalExports.every(h => /^[a-f0-9]{40}$/.test(h.revision)
        && /^[a-f0-9]{64}$/.test(h.archiveSha256) && h.packs.length === 2 && h.packs.every(p => p.extraction === 'complete' && p.manifestPresent
            && p.sourceRecords > 0 && /^[a-f0-9]{40}$/.test(p.tree) && p.databaseFiles.every(f => /^[a-f0-9]{64}$/.test(f.sha256)))),
    'F1 four disposable same-repository export observations incomplete');
    const snapshots = new Map(audit.targetSnapshots.map(target => [target.identity, target]));
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F1');
    fail(snapshots.size === audit.targetSnapshots.length, 'F1 duplicate relationship target snapshot');
    for (const target of snapshots.values()) {
        const actual = actualMap.get(target.identity), prior = priorIds.has(target.identity) ? rows.get(target.identity) : null;
        fail(target.contentHash === (actual?.contentHash ?? null) && equal(target.document, actual?.data ?? null)
            && equal(target.priorSourceReview, prior ? {coverageState: prior.coverageState, recordEvidenceSemanticSha256: hash(prior)} : null),
        'F1 exact target snapshot/prior source limits changed: ' + target.identity);
    }
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, actual] of actualMap) for (const reference of effectReferences(actual.data)) {
        incoming.get(reference.targetIdentity)?.push({sourceIdentity, sourceContentHash: actual.contentHash, ...reference});
    }
    const expectedIds = slice.members.map(([id]) => id);
    const scopeDispositions = new Map((audit.scopeDispositions ?? []).map(d => [d.identity, d]));
    fail(hash(audit.scopeDispositions) === F1_SCOPE_DISPOSITIONS && equal([...scopeDispositions.keys()], expectedIds),
        'F1 exact-ID generation evidence inventory changed');
    fail(equal(expectedIds, Object.keys(audit.currentRecordAudit)) && closure.records === 38 && hash(file) === closure.recordEvidenceSemanticSha256,
        'F1 exact frozen evidence set incomplete or leaked into another slice');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const row = rows.get(identity), actual = actualMap.get(identity), evidence = audit.currentRecordAudit[identity], doc = actual?.data;
        const detail = row?.sourceComparison?.conditionReview;
        fail(row && evidence && doc?.type === 'condition' && evidence.contentHash === contentHash && actual.contentHash === contentHash,
            'F1 exact current condition evidence missing: ' + identity);
        if (!row || !evidence || !doc || !detail) continue;
        const scope = scopeDispositions.get(identity);
        fail(scope && scope.contentHash === contentHash && row.contentHash === contentHash
            && equal(row.generationReview, scope.generationReview) && equal(detail.sourceDefinitionIds, scope.sourceDefinitionIds)
            && scope.fullCurrentGenerationEstablished === false,
        'F1 exact-ID generation disposition lost its examined source evidence: ' + identity);
        counts[row.coverageState] = (counts[row.coverageState] ?? 0) + 1;
        fail(row.coverageState === (REVIEWED_CONDITIONS.has(identity) ? 'reviewed' : 'unresolved')
            && evidence.dispositionEvidenceSha256 === hash(row) && evidence.conditionReviewSha256 === hash(detail)
            && detail.sourceDefinitionIds.every(id => definitions.has(id) || reused.has(id)) && detail.specificAssessment.length > 150
            && detail.parentContextIds.every(id => audit.parentContexts.some(p => p.id === id))
            && detail.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id))
            && equal(detail.bossParentContextIds, ['f1-parent:core:487', 'f1-parent:core:488', 'f1-parent:core:489'])
            && detail.nativeBossContextId === 'ymn5ysE8cvl4fyZx' && detail.bossRoleAndBehaviorEstablished === false
            && detail.selectedVersionStatus === 'not-verified; no automatic adoption or blended-version authority'
            && detail.counterSequencing === 'not-run' && detail.timingAndUseVerification === 'not-run' && detail.canonicalRelationshipClaim === false
            && detail.fieldCorrespondenceOnly === true && detail.sourceAbsenceClaim === false && row.sourceComparison.sourceAbsenceClaim === false,
        'F1 precise version/identity/counter/behavior limit bypassed: ' + identity);
        fail(equal(detail.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && evidence.currentSystemSha256 === hash(doc.system) && evidence.currentEffectsSha256 === hash(doc.effects ?? [])
            && equal(evidence.currentSystemFieldKeys, Object.keys(doc.system))
            && equal(row.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']),
        'F1 current fields/durations/persistent/counter/embedded evidence incomplete: ' + identity);
        for (const field of row.fieldReview) {
            const value = field.recordFieldPath.split('.').reduce((v, key) => v?.[key], doc) ?? null;
            fail(equal(field.recordValue, value) && field.recordJsonSha256 === hash(value), 'F1 exact current field changed: ' + identity + ' ' + field.recordFieldPath);
        }
        fail(equal(evidence.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(evidence.literalReferenceClaims, effectLiteralReferences(doc)), 'F1 exact executable rule or literal selector changed: ' + identity);
        const refs = effectReferences(doc);
        fail(equal(refs, evidence.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity}))), 'F1 exact outgoing UUID path changed: ' + identity);
        for (const reference of evidence.references) {
            const target = actualMap.get(reference.targetIdentity);
            fail(snapshots.has(reference.targetIdentity) && reference.targetContentHash === (target?.contentHash ?? null)
                && equal(reference.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(target?.data))
                && reference.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)),
            'F1 nested target/path evidence changed: ' + identity + ' ' + reference.path);
        }
        const ordered = values => [...values].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
        fail(equal(ordered(evidence.incomingReferences), ordered(incoming.get(identity))) && evidence.incomingReferences.every(r => snapshots.has(r.sourceIdentity)),
            'F1 incoming producer/path evidence changed: ' + identity);
        const claims = row.sourceComparison.currentClaims;
        fail(words(claims.map(c => c.text).join(' ')) === words(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(words(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])),
        'F1 complete current numeric/conditional claims changed: ' + identity);
        fail(evidence.exportLineage.snapshots.length === 4 && evidence.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && /^[a-f0-9]{64}$/.test(s.historicalContentHash)
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([key, value]) => s.fieldComparisons.some(f => f.recordFieldPath === `system.${key}` && f.historicalJsonSha256 === hash(value)))
                    && Object.keys(doc.system).every(key => s.fieldComparisons.some(f => f.recordFieldPath === `system.${key}` && f.currentJsonSha256 === hash(doc.system[key]))));
        }), 'F1 complete same-ID historical field comparison changed: ' + identity);
        fail(evidence.finiteSourceSearch.pdfPagesConsidered === 2652 && evidence.finiteSourceSearch.nativePagesConsidered === 271
            && evidence.finiteSourceSearch.queriesForDiscoveryOnly.length > 0 && evidence.finiteSourceSearch.sourceAbsenceClaim === false,
        'F1 finite locator became source absence or approval: ' + identity);
    }
    fail(equal(counts, {reviewed: 12, unresolved: 26}) && equal(counts, closure.counts), 'F1 source correspondence/precise-limit census changed');
    const alternatives = {
        bzZaLfYxVyKbJOCo: ['f1:core:246:paralysis', 'f1:feb:2:paralysis'],
        pLKjxFPUOZQHAcXH: ['f1:core:247:confused', 'f1:feb:2:confusion'],
        xE6uIFWZoYXAZQxA: ['f1:core:247:flinch', 'f1:feb:2:flinch'],
        ABTHN2VM50VQabZq: ['f1:core:247:infatuation', 'f1:feb:2:infatuation'],
        uxkB2vhF5HGjQAZY: ['f1:core:247:suppressed', 'f1:feb:2:suppression'],
        pZO043r8mNBFfbCD: ['f1:core:93:cheerleader', 'f1:sep:3:cheers']
    };
    for (const [id, expected] of Object.entries(alternatives)) fail(equal(rows.get(`effects.${id}`)?.sourceComparison.conditionReview.sourceDefinitionIds, expected),
        'F1 distinct original/optional definitions lost: ' + id);
}
