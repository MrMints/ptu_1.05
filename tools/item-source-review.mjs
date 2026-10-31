// Source evidence only. No runtime, acquisition, migration or policy consumer.
import {checkMachineSourceReview} from './machine-source-review.mjs';
import {checkConsumableSourceReview} from './consumable-source-review.mjs';
import {checkEquipmentSourceReview} from './equipment-source-review.mjs';
import {checkSpiritSourceReview} from './spirit-source-review.mjs';
export function itemSourceWords(value, normalizedText) {
    return normalizedText(String(value ?? '').replace(/\\n/g, '\n').replace(/-\s*\n\s*(?=(?:Typed|Type)\b)/g, '-'));
}

export function itemDefinitionEffect(unit) {
    const raw = unit.rawDefinition ?? '';
    if (unit.kind === 'printed-framework-definition') return raw
        .replace(/^The Vacuum (?:Tolerance|Immunity) capability\s*/, '')
        .replace(/^Hazard (?:Tolerance|Immunity)\s*/, '');
    if (unit.kind === 'printed-profile-note' && !raw.split('\n')[0].includes(':')) return raw.slice(raw.indexOf('\n') + 1);
    return raw.replace(/^\s*[^\n:]+:\s*/, '');
}

function references(value, path = '$') {
    if (Array.isArray(value)) return value.flatMap((child, i) => references(child, `${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => references(child, `${path}.${key}`));
    if (typeof value !== 'string') return [];
    return [...value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)]
        .map(match => ({path, literalUuid: match[0], targetIdentity: `${match[1]}.${match[2]}`}));
}

export function checkItemSourceReview(bundle, context) {
    if (!bundle.index.itemSourceEvidence) return;
    const {fail, rows, actualMap, hash, equal, textHash, normalizedText, citations} = context;
    const audit = bundle.itemSource, batch = bundle.batchManifest.batches.find(b => b.id === 'E2');
    const words = value => itemSourceWords(value, normalizedText);
    fail(audit?.batch === 'E2' && audit.sourceFingerprint === bundle.index.sourceFingerprint
        && audit.membershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run' && audit.sourceAbsenceClaim === false,
    'E2 frozen scope, diagnostic or source-only limits changed');
    const definitions = new Map((audit?.sourceDefinitions ?? []).map(u => [u.id, u]));
    const parents = new Map((audit?.parentContexts ?? []).map(p => [p.id, p]));
    const natives = new Map((audit?.nativeContexts ?? []).map(p => [p.pageId, p]));
    fail(definitions.size === audit?.sourceDefinitions?.length && parents.size === audit?.parentContexts?.length && natives.size === audit?.nativeContexts?.length,
        'E2 duplicate source definition or parent/native context');
    for (const unit of definitions.values()) {
        citations(unit);
        fail(unit.rawSha256 === textHash(unit.rawDefinition) && unit.rawDefinition === unit.anchors.map(a => a.rawText).join('\n')
            && unit.anchors.every(a => a.rawSha256 === textHash(a.rawText) && a.startLine >= 1 && a.endLine >= a.startLine && a.rawText.split('\n').length === a.endLine - a.startLine + 1)
            && words(unit.effect) === words(itemDefinitionEffect(unit)) && unit.normalizedEffectSha256 === textHash(words(unit.effect))
            && ['standard-core', 'optional-playtest', 'supplemental-source'].includes(unit.sourceKind)
            && unit.productionPolicyPromotion === false && unit.behavioralVerification === 'not-run' && unit.canonicalIdentityClaim === false,
        'E2 complete source boundary, effect extraction or authority changed: ' + unit.id);
    }
    for (const parent of parents.values()) {
        citations(parent);
        fail(parent.rawSha256 === textHash(parent.rawText) && parent.interpretation?.length > 30
            && parent.productionPolicyPromotion === false && parent.behavioralVerification === 'not-run', 'E2 parent/use context changed: ' + parent.id);
    }
    for (const native of natives.values()) {
        const journal = actualMap.get(native.journalIdentity), page = journal?.data.pages?.find(p => p._id === native.pageId);
        fail(journal?.contentHash === native.journalContentHash && page && hash(page) === native.pageJsonSha256 && page.text.content === native.rawText
            && native.productionPolicyPromotion === false && native.behavioralVerification === 'not-run', 'E2 native context or authority changed: ' + native.pageId);
    }
    fail(audit?.historicalExports?.length === 4 && audit.historicalExports.every(h => /^[a-f0-9]{40}$/.test(h.revision)
        && /^[a-f0-9]{64}$/.test(h.archiveSha256) && h.packs.length === 3 && h.packs.every(p => p.extraction === 'complete' && p.manifestPresent && p.sourceRecords > 0
            && /^[a-f0-9]{40}$/.test(p.tree) && p.databaseFiles.every(f => /^[a-f0-9]{64}$/.test(f.sha256)))), 'E2 historical export extraction evidence incomplete');
    fail(audit?.searchCorpus?.length === 12 && audit.searchCorpus.reduce((n, c) => n + c.pages, 0) === 2652,
        'E2 finite source corpus changed');
    const reviewed = new Set();
    for (const slice of batch.slices.filter(s => s.recordFile)) {
        const closure = audit.completedSlices[slice.id], file = bundle.files[slice.recordFile];
        fail(closure?.records === slice.records && hash(file) === closure?.recordEvidenceSemanticSha256, 'E2 slice evidence changed: ' + slice.id);
        const sourceUnits = (closure?.sourceDefinitionIds ?? []).map(id => definitions.get(id));
        const parentContexts = (closure?.parentContextIds ?? []).map(id => parents.get(id));
        const nativeContexts = (closure?.nativeContextIds ?? []).map(id => natives.get(id));
        fail(sourceUnits.every(Boolean) && hash(sourceUnits) === closure.sourceDefinitionSetSemanticSha256
            && parentContexts.every(Boolean) && hash(parentContexts) === closure.parentContextSetSemanticSha256
            && nativeContexts.every(Boolean) && hash(nativeContexts) === closure.nativeContextSetSemanticSha256, 'E2 source/use inventory changed: ' + slice.id);
        const counts = {};
        for (const [identity, contentHash] of slice.members) {
            reviewed.add(identity);
            const row = rows.get(identity), actual = actualMap.get(identity), evidence = audit.currentRecordAudit[identity], doc = actual?.data;
            fail(row && evidence && actual?.contentHash === contentHash && evidence.contentHash === contentHash
                && hash(row) === evidence.dispositionEvidenceSha256 && row.frozenQueue.batch === 'E2' && row.frozenQueue.slice === slice.id,
            'E2 exact disposition missing/stale: ' + identity);
            if (!row || !evidence || !doc) continue;
            counts[row.coverageState] = (counts[row.coverageState] ?? 0) + 1;
            fail(equal(evidence.currentSystemFieldKeys, Object.keys(doc.system)) && evidence.currentSystemSha256 === hash(doc.system)
                && evidence.currentEffectsSha256 === hash(doc.effects ?? []) && equal(row.fieldReview.filter(f => f.recordFieldPath?.startsWith('system.')).map(f => f.recordFieldPath), Object.keys(doc.system).map(key => `system.${key}`)),
            'E2 current field coverage incomplete: ' + identity);
            for (const field of row.fieldReview) {
                const value = field.recordFieldPath.split('.').reduce((v, key) => v?.[key], doc) ?? null;
                fail(field.recordJsonSha256 === hash(value) && equal(field.recordValue, value), 'E2 current field changed: ' + identity + ' ' + field.recordFieldPath);
            }
            fail(evidence.currentRules.length === (doc.system.rules ?? []).length && evidence.currentRules.every((rule, i) => rule.path === `$.system.rules[${i}]`
                && equal(rule.object, doc.system.rules[i]) && rule.jsonSha256 === hash(doc.system.rules[i]) && rule.interpretation?.length > 40), 'E2 current executable object missing: ' + identity);
            const expectedReferences = references(doc);
            fail(equal(expectedReferences, evidence.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity}))), 'E2 exact UUID path changed: ' + identity);
            for (const reference of evidence.references) {
                const target = actualMap.get(reference.targetIdentity);
                fail(reference.targetContentHash === (target?.contentHash ?? null) && reference.targetType === (target?.data.type ?? null)
                    && (!target || reference.targetSystemSha256 === hash(target.data.system ?? null) && equal(reference.targetSystem, target.data.system ?? null) && reference.targetSourceAssessment?.length > 40),
                'E2 target evidence changed: ' + identity + ' ' + reference.path);
            }
            const lineage = evidence.exportLineage;
            fail(lineage?.snapshots?.length === 4 && lineage.snapshots.every((s, i) => {
                const historic = audit.historicalExports[i], pack = historic.packs.find(p => p.pack === identity.split('.')[0]);
                return s.revision === historic.revision && s.packTree === pack?.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                    && (!s.recordFound || s.sameStableId === true && /^[a-f0-9]{64}$/.test(s.historicalContentHash) && s.fieldComparisons.length >= Object.keys(doc.system).length
                        && Object.keys(doc.system).every(key => s.fieldComparisons.some(f => f.recordFieldPath === `system.${key}` && f.currentJsonSha256 === hash(doc.system[key]))));
            }), 'E2 stable-ID historical evidence incomplete: ' + identity);
            const search = evidence.finiteSourceSearch;
            fail(search?.pdfPagesConsidered === 2652 && search.nativePagesConsidered === 271 && search.queriesForDiscoveryOnly?.length
                && search.sourceAbsenceClaim === false && row.sourceComparison.sourceAbsenceClaim === false && evidence.interpretation?.length > 70,
            'E2 finite locators became source absence/completion: ' + identity);
            const claims = row.sourceComparison.currentClaims;
            fail(Array.isArray(claims) && words(claims.map(c => c.text).join(' ')) === words(doc.system.effect)
                && claims.every(c => c.normalizedSha256 === textHash(words(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])),
            'E2 current numeric/conditional claims incomplete: ' + identity);
            fail(equal(evidence.candidateDefinitions, row.sourceComparison.candidateDefinitions), 'E2 duplicated candidate evidence disagrees: ' + identity);
            for (const candidate of evidence.candidateDefinitions) {
                const unit = definitions.get(candidate.sourceUnit);
                fail(unit && candidate.sourceEvidenceSha256 === hash(unit) && candidate.sourceEffectSha256 === unit.normalizedEffectSha256
                    && candidate.recordEffectSha256 === textHash(words(doc.system.effect)) && candidate.exactOrderedWords === (words(doc.system.effect) === words(unit.effect))
                    && candidate.sourceKind === unit.sourceKind && (candidate.exactOrderedWords ? candidate.wordDifferences.length === 0 : candidate.wordDifferences.length > 0),
                'E2 candidate definition/word comparison stale: ' + identity);
            }
            const editorialOnly = identity === 'capabilities.a1N1M1GMjMClaOdj' && evidence.candidateDefinitions.some(c => `a ${words(doc.system.effect)}` === words(definitions.get(c.sourceUnit)?.effect));
            if (slice.id === 'E2a') fail(row.coverageState === ((evidence.candidateDefinitions.some(c => c.exactOrderedWords) || editorialOnly) ? 'reviewed' : 'unresolved'),
                'Capability source correspondence bypassed exact body/editorial evidence: ' + identity);
        }
        fail(equal(counts, closure.counts), 'E2 per-slice correspondence counts disagree: ' + slice.id);
    }
    fail(equal([...reviewed].sort(), Object.keys(audit?.currentRecordAudit ?? {}).sort()), 'E2 current-record audit leaked into an unstarted slice or lost a record');
    checkMachineSourceReview(bundle,{...context,audit,batch,words});
    checkConsumableSourceReview(bundle,{...context,audit,batch,words});
    checkEquipmentSourceReview(bundle,{...context,audit,batch,words});
    checkSpiritSourceReview(bundle,{...context,audit,batch,words});
}
