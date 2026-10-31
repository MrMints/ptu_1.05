// Integrity checks for the frozen C source examination. Local PDFs remain
// external evidence; these checks do not certify interpretation or gameplay.
export function checkAbilitySourceReview(bundle, context) {
    const {index, abilitySource: audit, batchManifest, files} = bundle;
    const batch = batchManifest?.batches.find(value => value.id === 'C');
    if (!index.abilitySourceEvidence) {
        context.fail(!batch?.slices.some(slice => slice.recordFile), 'Ability source audit missing for prepared C evidence');
        return;
    }
    const {fail, actualMap, hash, equal, textHash, normalizedText, parseAbilityRules, citations} = context;
    const expected = {C1: [222, '3e7ec43624964df6355274b1e945b2cbc4a7b7919f2562904343585ba420bc57'],
        C2: [152, '23135edfa95d9ba526ef672e1c97c1c045d034538962a4239d7a3dcef183000e'],
        C3: [252, '0ec90bde39c6b7a3ef6374d44ddd775fd34f7d0c671fa86f7c899bd0360e956d']};
    fail(audit?.batch === 'C' && audit.sourceFingerprint === index.sourceFingerprint && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run'
        && audit.diagnosticSha256 === batchManifest.candidateSnapshot.sha256, 'Ability source scope/policy/diagnostic boundary changed');
    const units = new Map((audit?.sourceDefinitions ?? []).map(unit => [unit.id, unit])), census = audit?.sourceDefinitionCensus;
    fail(units.size === audit?.sourceDefinitions?.length && census?.count === units.size && census.definitionSetSemanticSha256 === hash(audit.sourceDefinitions)
        && census.rejectedDefinitionHeaders.length === 0, 'Ability complete definition census/hash changed');
    fail(census?.count === 536 && census.definitionSetSemanticSha256 === 'aed91a24537d8d48766b4636f763a64f68b0cc33b90fff042f4e5e275b41aeda'
        && equal(census.byBook, {core: 367, feb: 164, sep: 3, throhs: 1, porygon: 1}), 'Ability bounded complete-definition streams changed');
    const key = structure => structure?.clauses.map(clause => [clause.kind, normalizedText(clause.text)]);
    const words = keys => keys.map(value => value[1]).join(' ');
    const references = (value, path = '$.system', targets = new Map()) => {
        if (Array.isArray(value)) value.forEach((entry, ordinal) => references(entry, `${path}[${ordinal}]`, targets));
        else if (value && typeof value === 'object') Object.entries(value).forEach(([name, child]) => references(child, `${path}.${name}`, targets));
        else if (typeof value === 'string') for (const match of value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)) {
            const target = `${match[1]}.${match[2]}`;
            if (!targets.has(target)) targets.set(target, new Set());
            targets.get(target).add(path);
        }
        return targets;
    };
    const entryMap = new Map((audit?.currentRecordAudit ?? []).map(entry => [entry.identity, entry]));
    const counts = {records: 0, reviewed: 0, completeSourceComparisons: 0, differentTypedBoundariesWordEqual: 0, dependencyTargets: 0, dependencyPaths: 0, unresolved: 0};
    let predecessorClosed = true;
    for (const slice of batch?.slices ?? []) {
        fail(slice.records === expected[slice.id]?.[0] && slice.membershipSha256 === expected[slice.id]?.[1]
            && equal(audit.frozenSlices.find(value => value.id === slice.id), {id: slice.id, count: slice.records, membershipSha256: slice.membershipSha256}), `Ability frozen partition changed: ${slice.id}`);
        if (slice.recordFile) fail(predecessorClosed, `Ability slice skipped unfinished predecessor: ${slice.id}`);
        predecessorClosed &&= slice.status === 'source-comparisons-complete';
        for (const row of files[slice.recordFile]?.records ?? []) {
            counts.records++; counts[row.coverageState]++;
            const actual = actualMap.get(row.identity), system = actual?.data.system, evidence = row.currentRecordEvidence, entry = entryMap.get(row.identity);
            const inventory = Object.keys(system ?? {}), current = parseAbilityRules(system?.effect), currentKey = key(current);
            fail(equal(evidence?.fieldInventory, inventory) && equal(Object.keys(evidence?.fieldHashes ?? {}), inventory)
                && inventory.every(name => evidence.fieldHashes[name] === hash(system[name])) && equal(evidence.fieldHashes, entry?.currentFieldHashes)
                && equal(evidence.currentRuleStructure, current) && equal(row.normativeFieldCoverage?.currentSystemFields, inventory), `Ability current field/structure evidence disagrees: ${row.identity}`);
            const saved = row.frozenQueue?.savedPrimarySourceUnit ?? '';
            fail(row.frozenQueue?.diagnosticSha256 === audit.diagnosticSha256 && (slice.id === 'C1' ? saved.startsWith('core:') : slice.id === 'C2' ? saved.startsWith('feb:') : !/^(?:core|feb):/.test(saved)), `Ability saved partition attribution changed: ${row.identity}`);
            const comparisons = [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean), ids = comparisons.map(value => value.sourceUnit);
            fail(new Set(ids).size === ids.length && equal([...ids].sort(), [...(row.sourceSearch?.examinedCompleteDefinitionCandidates ?? [])].sort())
                && equal([...ids].sort(), [...(row.normativeFieldCoverage?.comparedSourceUnits ?? [])].sort())
                && entry?.sourceSearchSemanticSha256 === hash(row.sourceSearch) && entry.lineageSemanticSha256 === hash(row.exportLineage), `Ability candidates/search/lineage coverage changed: ${row.identity}`);
            for (const comparison of comparisons) {
                counts.completeSourceComparisons++;
                const unit = units.get(comparison.sourceUnit), structure = comparison.ruleStructureComparison, fields = new Map(comparison.fields.map(field => [field.field, field]));
                fail(unit && comparison.sourceDefinitionEvidenceSha256 === unit.evidenceSemanticSha256 && equal(comparison.source, unit.source)
                    && comparison.anchor?.completeDefinition === true && comparison.anchor.definitionContextNormalizedSha256 === unit.definitionNormalizedSha256
                    && equal(comparison.anchor.pageSegments, unit.anchors) && comparison.anchor.heading === unit.heading && comparison.anchor.nextBoundary === unit.nextBoundary
                    && comparison.anchor.startLine === unit.anchors[0]?.startLine && comparison.anchor.endLine === unit.anchors.at(-1)?.endLine, `Ability complete source boundary/definition changed: ${row.identity} ${comparison.sourceUnit}`);
                fail(entry?.comparisonSemanticSha256[comparison.sourceUnit] === hash(comparison), `Ability duplicated comparison audit changed: ${row.identity}`);
                if (!unit) continue;
                const sourceKey = key(unit.ruleStructure), wordEqual = words(currentKey) === words(sourceKey), typedEqual = equal(currentKey, sourceKey);
                if (wordEqual && !typedEqual) counts.differentTypedBoundariesWordEqual++;
                fail(equal(structure?.recordClauseKey, currentKey) && equal(structure?.sourceClauseKey, sourceKey)
                    && structure.recordOrderedContentSha256 === textHash(words(currentKey)) && structure.sourceOrderedContentSha256 === textHash(words(sourceKey))
                    && structure.exactCompleteClauseContent === wordEqual && structure.exactTypedClauseLabelsAndContent === typedEqual
                    && structure.typedClauseDisposition === (typedEqual ? 'same-typed-labels-and-content' : wordEqual ? 'same-ordered-content-different-label-boundaries' : 'examined-complete-content-difference')
                    && structure.roleLimitation?.includes('do not establish parsed-role or behavioral equivalence'), `Ability ordered content/typed-role disposition disagrees: ${row.identity}`);
                fail(equal(structure?.recordExplicitTags, current.explicitTags) && equal(structure?.sourceExplicitTags, unit.ruleStructure.explicitTags)
                    && structure.explicitKeywordMarkersEqual === equal(current.explicitTags, unit.ruleStructure.explicitTags)
                    && equal(structure.recordRepresentation, current.representation), `Ability literal tags/paragraph representation changed: ${row.identity}`);
                fail(fields.get('frequency')?.recordValue === system.frequency && fields.get('frequency').sourceValue === unit.frequency
                    && fields.get('effect')?.sourceNormalizedSha256 === unit.sourceNormalizedEffectSha256
                    && equal(fields.get('keywords')?.recordValue, system.keywords) && equal(fields.get('keywords').sourceValue, unit.ruleStructure.explicitTags)
                    && equal(comparison.sourceHeaderFields, unit.headerFields), `Ability source frequency/effect/keyword fields disagree: ${row.identity}`);
                fail(row.sources.some(source => equal(source, comparison.source)) && comparison.productionPolicyPromotion === false && comparison.behavioralVerification === 'not-run', `Ability candidate lost citations or promotes policy: ${row.identity}`);
            }
            if (row.coverageState === 'unresolved') fail(row.missingEvidence?.currentContentHash === row.contentHash && row.missingEvidence.neededArtifact.includes(row.identity)
                && equal(row.missingEvidence.examinedSourceUnits, ids), `Ability examined authoring/version limit is generic or incomplete: ${row.identity}`);
            if (slice.id === 'C3') {
                const search = row.sourceSearch;
                fail(search?.primaryAuthorityFromSlotOrJournal === false && search.sourceCorpusEvidence === 'docs/data/ability-source-evidence.json#remainingAbilitySearchCorpus'
                    && search.completeLeafSearchStatus === (ids.length ? 'all-available-complete-candidates-examined' : 'precise-original-authoring-definition-unavailable')
                    && Array.isArray(search.printedPassageLocators) && Array.isArray(search.nativeJournalLocators) && Array.isArray(search.linkedNativeDefinitions), `Ability remaining source search is incomplete or promotes a locator: ${row.identity}`);
                fail(row.coverageState === 'unresolved' || comparisons.some(comparison => comparison.namedHeaderCandidate && comparison.ruleStructureComparison.exactCompleteClauseContent), `Ability copied/slot-only definition cannot approve current identity: ${row.identity}`);
                for (const locator of [...(search.nativeJournalLocators ?? []), ...(search.linkedNativeDefinitions ?? [])]) {
                    const journal = actualMap.get(locator.journalIdentity), page = journal?.data.pages?.find(page => page._id === locator.pageId);
                    fail(journal?.contentHash === locator.journalContentHash && page && hash(page) === locator.pageJsonSha256
                        && textHash(normalizedText(page.text?.content)) === locator.textNormalizedSha256, `Ability native source page identity/hash changed: ${row.identity} ${locator.pageId}`);
                }
                for (const locator of search.printedPassageLocators ?? []) fail(locator.completeDefinitionClaim === false && locator.passages.every(passage => passage.startLine >= 1 && passage.endLine >= passage.startLine && /^[a-f0-9]{64}$/.test(passage.contextNormalizedSha256)), `Ability printed locator became a fictitious complete definition: ${row.identity}`);
            }
            fail(row.exportLineage?.snapshots.length === 4 && row.exportLineage.snapshots.every(snapshot => audit.historicalExports.some(source => snapshot.revision === source.revision && snapshot.abilitiesPackTree === source.abilitiesPackTree)), `Ability exact cached export lineage missing: ${row.identity}`);
            for (const snapshot of row.exportLineage?.snapshots ?? []) if (snapshot.recordFound) {
                fail(snapshot.sameStableId === true && snapshot.fieldComparisons.length === inventory.length, `Ability historical field coverage changed: ${row.identity}`);
                for (const field of snapshot.fieldComparisons) {
                    const value = field.recordFieldPath.split('.').reduce((object, name) => object?.[name], actual.data) ?? null;
                    fail(field.currentJsonSha256 === hash(value) && field.equal === (field.currentJsonSha256 === field.historicalJsonSha256), `Ability historical current/changed field evidence disagrees: ${row.identity}`);
                }
            }
            const targets = references(system), recorded = new Map(row.dependencyEvidence.map(value => [value.target, value]));
            fail(recorded.size === targets.size && recorded.size === row.dependencyEvidence.length && entry?.dependencyTargetCount === targets.size, `Ability exact dependency target coverage changed: ${row.identity}`);
            for (const [target, paths] of targets) {
                const found = recorded.get(target), targetRow = actualMap.get(target);
                fail(found && equal(found.paths, [...paths].sort()) && found.targetContentHash === (targetRow?.contentHash ?? null)
                    && found.resolvedLabelForReview === (targetRow?.data.name ?? null) && found.ruleVersionApproval === 'not-established-by-consumer'
                    && found.behavioralVerification === 'not-run', `Ability exact dependency path/target changed: ${row.identity} ${target}`);
            }
            const paths = [...targets.values()].reduce((total, values) => total + values.size, 0);
            counts.dependencyTargets += targets.size; counts.dependencyPaths += paths;
            fail(entry?.dependencyPathCount === paths, `Ability dependency path count changed: ${row.identity}`);
        }
    }
    fail(equal(audit.counts, counts) && counts.records === entryMap.size, 'Ability source aggregate coverage disagrees');
    fail(equal(Object.keys(expected), batch?.slices.map(slice => slice.id)), 'Ability frozen slices missing/reordered');
    if (batch?.slices.find(slice => slice.id === 'C3').recordFile) {
        const corpus = audit.remainingAbilitySearchCorpus;
        fail(corpus?.cachedPagesExamined === 2652 && corpus.standaloneDefinitionCount === 536 && corpus.tableOnlyAbilityHeaders.length === 102
            && corpus.nativeJournals.length === 2 && corpus.nativeJournals.reduce((sum, journal) => sum + journal.pagesExamined, 0) === 271, 'Ability remaining source corpus/slot census incomplete');
        for (const journal of corpus?.nativeJournals ?? []) fail(actualMap.get(journal.identity)?.contentHash === journal.contentHash, 'Ability native search corpus changed');
    }
    citations(audit);
}
