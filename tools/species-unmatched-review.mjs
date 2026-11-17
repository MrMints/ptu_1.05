// Integrity of the frozen B-unmatched evidence. Source interpretation remains
// manual: CI has neither the local PDFs nor the cached historical databases.
export function checkUnmatchedSpecies(bundle, context) {
    if (!bundle.index.unmatchedSpeciesEvidence) return;
    const {unmatchedSpecies: audit, batchManifest, files, index} = bundle;
    const {fail, rows, actualMap, hash, equal, labelKey, currentFieldEvidence, citations} = context;
    const slice = batchManifest.batches.find(batch => batch.id === 'B').slices.find(value => value.id === 'B-unmatched');
    const file = files[slice.recordFile], memberIds = new Set(slice.members.map(([identity]) => identity));
    fail(audit?.sourceFingerprint === index.sourceFingerprint && audit.frozenSlice === slice.id && equal(audit.members, slice.members)
        && audit.membershipSha256 === slice.membershipSha256 && file?.records.length === 616
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'Unmatched species frozen scope/policy changed');
    const comparisonRows = new Map(audit.currentFieldAndDependencyAudit.map(row => [row.identity, row])), candidateMap = new Map();
    const refs = value => {
        const targets = new Map();
        const visit = (child, path) => {
            if (Array.isArray(child)) return child.forEach((entry, ordinal) => visit(entry, `${path}[${ordinal}]`));
            if (child && typeof child === 'object') return Object.entries(child).forEach(([key, entry]) => visit(entry, `${path}.${key}`));
            if (typeof child !== 'string') return;
            for (const match of child.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)) {
                const target = `${match[1]}.${match[2]}`;
                if (!targets.has(target)) targets.set(target, new Set());
                targets.get(target).add(path);
            }
        };
        visit(value, '$.system'); return targets;
    };
    let profiles = 0, compact = 0, negatives = 0, scopeConflicts = 0;
    for (const row of file?.records ?? []) {
        const actual = actualMap.get(row.identity), system = actual?.data.system, evidence = row.currentRecordEvidence;
        if (row.coverageState === 'excluded') negatives++;
        if (row.recordClass === 'examined-scope-identity-conflict') scopeConflicts++;
        const lineage = row.exportLineage;
        fail(lineage?.snapshots.length === 4 && lineage.snapshots.every(snapshot => audit.historicalExports.some(source => source.revision === snapshot.revision && source.speciesPackTree === snapshot.speciesPackTree)), `Unmatched export lineage incomplete/stale: ${row.identity}`);
        for (const snapshot of lineage?.snapshots ?? []) if (snapshot.recordFound) {
            fail(snapshot.sameStableId === true && /^[a-f0-9]{64}$/.test(snapshot.historicalContentHash) && snapshot.fieldComparisons?.length > 0, `Unmatched export lacks exact record/field lineage: ${row.identity}`);
            for (const field of snapshot.fieldComparisons ?? []) {
                const value = field.recordFieldPath.split('.').reduce((object, key) => object?.[key], actual?.data) ?? null;
                fail(field.currentJsonSha256 === hash(value) && field.equal === (field.currentJsonSha256 === field.historicalJsonSha256), `Unmatched export current/changed field evidence disagrees: ${row.identity}`);
            }
        }
        if (!evidence) {
            fail(row.coverageState === 'excluded' || row.recordClass === 'examined-scope-identity-conflict', `Unmatched record lacks current normative evidence: ${row.identity}`);
            if (row.coverageState !== 'excluded') fail(row.missingEvidence?.neededArtifact.includes(row.identity) && row.missingEvidence.currentContentHash === row.contentHash
                && row.negativeScopeCandidateReview?.selectedPokemonId === null && !row.sourceComparison, `Unmatched scope identity limit is imprecise: ${row.identity}`);
            continue;
        }
        const fieldAudit = comparisonRows.get(row.identity), inventory = Object.keys(system);
        fail(equal(evidence.fieldInventory, inventory) && equal(Object.keys(evidence.fieldHashes), inventory)
            && inventory.every(key => evidence.fieldHashes[key] === hash(system[key])) && equal(fieldAudit?.currentFieldHashes, evidence.fieldHashes)
            && evidence.sourceLabel === system.source?.value, `Unmatched current field inventory/value evidence disagrees: ${row.identity}`);
        const dependencies = refs(system), recorded = new Map((row.dependencyEvidence ?? []).map(entry => [entry.target, entry]));
        fail(recorded.size === dependencies.size && recorded.size === row.dependencyEvidence?.length && fieldAudit?.dependencyTargetCount === recorded.size, `Unmatched dependency target coverage disagrees: ${row.identity}`);
        for (const [target, paths] of dependencies) {
            const entry = recorded.get(target), actualTarget = actualMap.get(target);
            fail(entry && equal(entry.paths, [...paths].sort()) && entry.targetContentHash === (actualTarget?.contentHash ?? null)
                && entry.resolvedLabelForReview === (actualTarget?.data.name ?? null) && entry.ruleVersionApproval === 'not-established-by-consumer'
                && entry.behavioralVerification === 'not-run', `Unmatched dependency exact paths/target evidence disagrees: ${row.identity} ${target}`);
        }
        fail(fieldAudit?.dependencyPathCount === [...dependencies.values()].reduce((count, paths) => count + paths.size, 0)
            && fieldAudit.sourceSearchSemanticSha256 === hash(row.sourceSearch), `Unmatched source/dependency audit changed: ${row.identity}`);
        for (const locator of row.sourceSearch?.linkedOlderProfiles ?? []) fail(rows.get(locator.linkedIdentity)?.frozenQueue?.slice !== 'B-unmatched'
            && rows.get(locator.linkedIdentity)?.sourceComparison?.sourceProfile === locator.profile, `Unmatched candidate locator uses its unfinished family as authority: ${row.identity}`);
        const candidates = [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean), ids = candidates.map(value => value.sourceProfile);
        fail(new Set(ids).size === ids.length && equal([...ids].sort(), [...(fieldAudit.sourceProfiles ?? [])].sort())
            && equal([...ids].sort(), [...(row.normativeFieldCoverage?.comparedSourceProfiles ?? [])].sort()), `Unmatched available candidate comparisons incomplete: ${row.identity}`);
        if (!row.sourceComparison?.compactSourceEvidence) fail(row.coverageState === 'unresolved' && row.missingEvidence?.currentContentHash === row.contentHash
            && row.missingEvidence.neededArtifact.includes(row.identity) && row.missingEvidence.neededArtifact.includes(String(system.number))
            && equal([...ids].sort(), [...(row.missingEvidence.examinedSourceProfiles ?? [])].sort()), `Unmatched authoring limitation is generic or falsely approved: ${row.identity}`);
        for (const candidate of candidates) {
            profiles++; candidateMap.set(`${row.identity}:${candidate.sourceProfile}`, candidate);
            for (const field of candidate.fields) currentFieldEvidence(row, actual, field);
            const fields = new Map(candidate.fields.map(field => [field.field, field]));
            const expected = {baseStats: fields.get('system.stats')?.status === 'supported', types: fields.get('system.types')?.status === 'supported',
                abilitySlots: fields.get('system.abilities exact UUID-resolved slot order')?.status === 'supported', evolutionLevels: fields.get('system.evolutions levels')?.status === 'supported'};
            const abilities = ['basic', 'advanced', 'high'].flatMap(tier => (system.abilities?.[tier] ?? []).map(link => actualMap.get(`abilities.${link.uuid.split('.').at(-1)}`)?.data.name));
            fail(equal(fields.get('system.abilities exact UUID-resolved slot order')?.recordValue, abilities) && equal(fields.get('system.evolutions levels')?.recordValue, system.evolutions.map(entry => entry.level))
                && equal(candidate.independentGroups, expected) && candidate.equalMechanicalGroups === Object.values(expected).filter(Boolean).length, `Unmatched candidate current groups/counts disagree: ${row.identity} ${candidate.sourceProfile}`);
            if (expected.types) fail(equal(fields.get('system.types').recordValue.map(labelKey).sort(), fields.get('system.types').sourceValue.map(labelKey).sort()), `Unmatched candidate supported Types disagree: ${row.identity}`);
            if (expected.abilitySlots) fail(equal(fields.get('system.abilities exact UUID-resolved slot order').recordValue.map(labelKey), fields.get('system.abilities exact UUID-resolved slot order').sourceValue.map(labelKey)), `Unmatched candidate supported slots disagree: ${row.identity}`);
            if (candidate.compactSourceEvidence) {
                compact++;
                fail(candidate.compactSourceEvidence.unparsedLevelEntries?.length === 0 && candidate.compactSourceEvidence.anchor?.contextNormalizedSha256
                    && fields.get('system.evolutions levels')?.status === 'unavailable-source-omission'
                    && ['machine', 'egg', 'tutor'].every(group => fields.get(`system.moves.${group}`)?.status === 'unavailable-source-omission'), `Compact source omissions/grammar were guessed: ${row.identity}`);
            }
        }
    }
    const seen = new Set();
    for (const section of audit.sourceAcquisitionAudit) {
        const candidate = candidateMap.get(`${section.identity}:${section.sourceProfile}`), field = candidate?.fields.find(value => value.field === `system.moves.${section.group}`), key = `${section.identity}:${section.sourceProfile}:${section.group}`;
        fail(memberIds.has(section.identity) && candidate && ['level', 'machine', 'egg', 'tutor'].includes(section.group) && !seen.has(key)
            && section.rawNormalizedSha256 === field?.sourceTableNormalizedSha256 && (field?.sourceTablePresent ? section.entryCount === field.sourceParsing?.entryCount : section.entryCount === 0), `Unmatched acquisition source coverage/field evidence changed: ${key}`);
        seen.add(key);
    }
    for (const [key] of candidateMap) for (const group of ['level', 'machine', 'egg', 'tutor']) fail(seen.has(`${key}:${group}`), `Unmatched acquisition section missing: ${key}:${group}`);
    for (const [identity, profile, group, key] of audit.sourceLiteralFlags.literal) {
        const field = candidateMap.get(`${identity}:${profile}`)?.fields.find(value => value.field === `system.moves.${group}`);
        fail(field?.sourceLiteralDispositions?.some(value => value.parsedKey === key && value.interpretation?.length > 80)
            && field.missingSourceEntries.some(value => (typeof value === 'string' ? value : value.moveKeyForComparison) === key), `Unmatched literal source token erased or unexamined: ${identity} ${profile} ${key}`);
    }
    for (const [identity, profile, group, key, printedType] of audit.sourceLiteralFlags.types) {
        const field = candidateMap.get(`${identity}:${profile}`)?.fields.find(value => value.field === `system.moves.${group}`);
        fail(field?.sourceTypeColumnIssues?.some(value => value.key === key && value.printedType === printedType) && field.status === 'manual-question', `Unmatched printed Type conflict lost: ${identity} ${profile}`);
    }
    fail(equal(audit.counts, {records: 616, sourceProfileComparisons: profiles, sourceAcquisitionSections: seen.size, directCompactProfiles: compact, negativeScopeOnly: negatives, scopeIdentityConflicts: scopeConflicts})
        && comparisonRows.size === 603, 'Unmatched source/current/negative-scope coverage counts disagree');
    citations(audit);
}
