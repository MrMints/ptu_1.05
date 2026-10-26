// Frozen D source integrity. No runtime, acquisition or policy consumer.
export function checkMoveSourceReview(bundle, context) {
    if (!bundle.index.moveSourceEvidence) return;
    const {moveSource: audit, batchManifest, files, index} = bundle;
    const {fail, actualMap, hash, equal, textHash, normalizedText: norm, parseMoveRules, citations} = context;
    const batch = batchManifest.batches.find(batch => batch.id === 'D'), census = audit?.sourceDefinitionCensus;
    const expected = {D1: [110, '294e921236116139928451507341a0a1f2138c9a83fa897492a814a1e965f715'], D2: [581, '84a59050aa2d1dc302f6c020d4e46a0fde6d35842ed9c323b306eb965a07665f'], D3: [537, '8f035b2f36d725eddd74c60f7002acb576a1f98815ce5487f303a1ee4acf666f']};
    fail(audit?.sourceFingerprint === index.sourceFingerprint && audit.batch === 'D' && audit.membershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === batchManifest.candidateSnapshot.sha256
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'Move frozen scope/policy/diagnostic changed');
    const units = new Map((audit?.sourceDefinitions ?? []).map(unit => [unit.id, unit]));
    fail(census?.fullMoves === 660 && census.contestEffects === 44 && census.printedModifiers === 1 && units.size === 705 && census.definitionSetSemanticSha256 === '96d38e4c2b922de2af35cd1ac86de7e397785ae25a8491e3a93fa51b4af1aa4c' && census.definitionSetSemanticSha256 === hash(audit.sourceDefinitions)
        && census.rejectedSourceHeaders.length === 1 && census.rejectedSourceHeaders[0].id === 'core:337:move-line19', 'Move complete source census/boundaries changed');
    const key = structure => structure.clauses.map(clause => [clause.kind, norm(clause.text)]), words = keys => keys.map(value => value[1]).join(' ');
    const entryMap = new Map(audit.currentRecordAudit.map(row => [row.identity, row]));
    const counts = Object.fromEntries(['records', 'reviewed', 'unresolved', 'sourceComparisons', 'equalWordsDifferentTypedRoles', 'explicitNoEffectRepresentations', 'dependencyTargets', 'dependencyPaths'].map(key => [key, 0]));
    const refs = (value, path = '$.system', found = new Map()) => {
        if (Array.isArray(value)) value.forEach((child, ordinal) => refs(child, `${path}[${ordinal}]`, found));
        else if (value && typeof value === 'object') Object.entries(value).forEach(([name, child]) => refs(child, `${path}.${name}`, found));
        else if (typeof value === 'string') for (const match of value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)) {
            const target = `${match[1]}.${match[2]}`;
            if (!found.has(target)) found.set(target, new Set());
            found.get(target).add(path);
        }
        return found;
    };
    let predecessorClosed = true;
    for (const slice of batch.slices) {
        fail(slice.records === expected[slice.id]?.[0] && slice.membershipSha256 === expected[slice.id]?.[1]
            && equal(audit.frozenSlices.find(value => value.id === slice.id), {id: slice.id, count: slice.records, membershipSha256: slice.membershipSha256}), `Move frozen partition changed: ${slice.id}`);
        if (slice.recordFile) fail(predecessorClosed, `Move slice skipped unfinished predecessor: ${slice.id}`);
        predecessorClosed &&= slice.status === 'source-comparisons-complete';
        for (const row of files[slice.recordFile]?.records ?? []) {
            counts.records++; counts[row.coverageState]++;
            const actual = actualMap.get(row.identity), system = actual?.data.system, evidence = row.currentRecordEvidence, entry = entryMap.get(row.identity), inventory = Object.keys(system ?? {}), current = parseMoveRules(system?.effect), ck = key(current), cw = words(ck);
            fail(equal(evidence?.fieldInventory, inventory) && equal(Object.keys(evidence?.fieldHashes ?? {}), inventory) && inventory.every(name => evidence.fieldHashes[name] === hash(system[name]))
                && equal(evidence?.fieldHashes, entry?.currentFieldHashes) && equal(evidence?.currentRuleStructure, current) && equal(row.normativeFieldCoverage?.currentSystemFields, inventory), `Move exact current field/structure evidence disagrees: ${row.identity}`);
            const saved = row.frozenQueue?.savedPrimarySourceUnit;
            fail(row.frozenQueue?.diagnosticSha256 === audit.diagnosticSha256 && (slice.id === 'D1' ? actual.data.type === 'contestmove' : actual.data.type === 'move' && (slice.id === 'D2' ? !!saved : !saved)), `Move saved partition attribution changed: ${row.identity}`);
            const comparisons = [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean), ids = comparisons.map(value => value.sourceUnit);
            fail(new Set(ids).size === ids.length && equal([...ids].sort(), [...row.sourceSearch.examinedCompleteDefinitionCandidates].sort()) && equal([...ids].sort(), [...row.normativeFieldCoverage.comparedSourceUnits].sort())
                && entry?.sourceSearchSemanticSha256 === hash(row.sourceSearch) && entry.lineageSemanticSha256 === hash(row.exportLineage), `Move alternatives/search/lineage coverage changed: ${row.identity}`);
            let hasProvenCorrespondence = false;
            for (const comparison of comparisons) {
                counts.sourceComparisons++;
                const unit = units.get(comparison.sourceUnit), st = comparison.ruleStructureComparison, fields = new Map(comparison.fields.map(field => [field.field, field]));
                fail(unit && comparison.sourceDefinitionEvidenceSha256 === unit.evidenceSemanticSha256 && equal(comparison.source, unit.source) && equal(comparison.anchor.pageSegments, unit.anchors)
                    && comparison.anchor.heading === unit.heading && comparison.anchor.nextBoundary === unit.nextBoundary && comparison.anchor.rawDefinitionSha256 === unit.rawDefinitionSha256
                    && comparison.anchor.definitionContextNormalizedSha256 === unit.definitionNormalizedSha256 && comparison.anchor.completeDefinition === (unit.definitionCompleteness === 'complete printed definition')
                    && equal(comparison.sourceDependentConditions, unit.dependentConditions), `Move complete source boundaries/conditions changed: ${row.identity} ${comparison.sourceUnit}`);
                fail(entry?.comparisonSemanticSha256[comparison.sourceUnit] === hash(comparison), `Move duplicated comparison audit changed: ${row.identity}`);
                if (!unit) continue;
                const sk = key(unit.ruleStructure), sw = words(sk), sameWords = cw === sw, typed = equal(ck, sk), none = ['', 'none'].includes(cw) && ['', 'none'].includes(sw) && ck.length <= 1 && sk.length === 1 && sk[0][0] === 'effect';
                const scalar = value => { const text = norm(value).replace('range ', '').replace('see text', 'see effect'); return ['none', '--', '-', ''].includes(text) ? '' : text === 'x see effect' ? 'x' : text; };
                const parts = value => [...new Set(String(value).split(',').map(value => scalar(value).replace(/target (\d+)/g, '$1 target')).filter(Boolean))].sort();
                const actualRange = `${system.range === null ? 'None' : system.range}, ${(system.keywords ?? []).join(', ')}`;
                const independent = unit.kind === 'contest-effect' ? system.dice === (unit.dice === 'X' ? -1 : Number(unit.dice))
                    : [['type', 'type'], ['ac', 'ac'], ['damageBase', 'damage-base'], ['category', 'class']].filter(([field, sourceKey]) => unit.fields[sourceKey]?.length === 1 && scalar(system[field]) === scalar(unit.fields[sourceKey][0])).length
                        + (unit.fields.range?.length === 1 && equal(parts(actualRange), parts(unit.fields.range[0])) ? 1 : 0) >= 3;
                const supported = comparison.namedHeaderCandidate && independent && (sameWords || none);
                fail(comparison.independentCurrentFieldsSupport === independent && comparison.correspondenceSupported === supported, `Move counterpart lacks independent fields/full content: ${row.identity}`);
                hasProvenCorrespondence ||= supported || comparison.manualSourceDisposition?.correspondenceSupported === true && comparison.manualSourceDisposition.sources?.some(source => source.path === 'Core System/Pokemon Tabletop United 1.05 Core.pdf' && source.pdfPages.includes(264));
                if (sameWords && !typed) counts.equalWordsDifferentTypedRoles++;
                if (none && !sameWords) counts.explicitNoEffectRepresentations++;
                fail(equal(st.recordClauseKey, ck) && equal(st.sourceClauseKey, sk) && st.recordOrderedContentSha256 === textHash(cw) && st.sourceOrderedContentSha256 === textHash(sw)
                    && st.exactCompleteOrderedContent === sameWords && st.exactTypedClauseLabelsAndContent === typed && st.explicitNoEffectRepresentation === none
                    && st.typedClauseDisposition === (typed ? 'same-typed-labels-and-content' : sameWords ? 'same-ordered-content-different-label-boundaries' : none ? 'explicit-no-effect-representation' : 'examined-complete-content-difference')
                    && equal(st.recordRepresentation, current.representation) && st.roleLimitation.includes('do not certify typed-role or behavioral equivalence'), `Move ordered content/typed-role evidence disagrees: ${row.identity}`);
                fail(fields.get('effect')?.sourceNormalizedSha256 === unit.sourceNormalizedEffectSha256, `Move complete printed effect changed: ${row.identity}`);
                if (unit.kind === 'contest-effect') fail(fields.get('dice')?.recordValue === system.dice && fields.get('dice').sourceValue === `${unit.dice}d6`
                    && fields.get('type')?.recordValue === system.type && fields.get('type').sourceValue === null && fields.get('frequency')?.recordValue === system.frequency, `Contest effect literal dice/parameter evidence changed: ${row.identity}`);
                else for (const [field, sourceKey] of [['type', 'type'], ['frequency', 'frequency'], ['ac', 'ac'], ['damageBase', 'damage-base'], ['category', 'class']]) {
                    const values = unit.fields[sourceKey] ?? [], expectedValue = values.length === 1 ? values[0] : null;
                    fail(equal(fields.get(field)?.recordValue, system[field] ?? null) && equal(fields.get(field)?.sourceValue, expectedValue) && equal(fields.get(field)?.sourceAlternatives, values), `Move literal source/current scalar changed: ${row.identity} ${field}`);
                }
                fail(row.sources.some(source => equal(source, comparison.source)) && comparison.productionPolicyPromotion === false && comparison.behavioralVerification === 'not-run', `Move source citation/policy changed: ${row.identity}`);
            }
            if (row.coverageState === 'reviewed') fail(hasProvenCorrespondence, `Move reviewed state has no complete examined correspondence: ${row.identity}`);
            if (row.coverageState === 'unresolved') fail(row.missingEvidence?.currentContentHash === row.contentHash && row.missingEvidence.neededArtifact.includes(row.identity)
                && equal(row.missingEvidence.examinedSourceUnits, ids), `Move precise authoring/version limit missing: ${row.identity}`);
            if (!comparisons.length && slice.status === 'source-comparisons-complete') fail(row.sourceSearch.availableCandidateCoverage === 'finite-corpus-search-complete-no-full-authoring-definition'
                && row.sourceSearch.printedPassageLocators && row.sourceSearch.nativeJournalLocators, `Move absent definition is an unexamined search/parser gap: ${row.identity}`);
            const native = row.sourceSearch.supportingContestPlaytestContext;
            if (actual.data.type === 'contestmove') {
                const journal = actualMap.get(native?.journalIdentity), page = journal?.data.pages?.find(page => page._id === native.pageId);
                fail(journal?.contentHash === native?.journalContentHash && page && hash(page) === native.pageJsonSha256 && textHash(norm(page.text.content)) === native.textNormalizedSha256
                    && norm(page.text.content).includes('playtest content'), `Contest compiled playtest context changed: ${row.identity}`);
            }
            fail(row.exportLineage?.snapshots.length === 4 && row.exportLineage.snapshots.every(snapshot => audit.historicalExports.some(source => source.revision === snapshot.revision && source.movesPackTree === snapshot.movesPackTree)), `Move cached export provenance missing: ${row.identity}`);
            for (const snapshot of row.exportLineage?.snapshots ?? []) if (snapshot.recordFound) {
                fail(snapshot.sameStableId === true && snapshot.fieldComparisons.length === inventory.length, `Move historical field coverage changed: ${row.identity}`);
                for (const field of snapshot.fieldComparisons) {
                    const value = field.recordFieldPath.split('.').reduce((object, name) => object?.[name], actual.data) ?? null;
                    fail(field.currentJsonSha256 === hash(value) && field.equal === (field.currentJsonSha256 === field.historicalJsonSha256), `Move historical field comparison disagrees: ${row.identity}`);
                }
            }
            const targets = refs(system), recorded = new Map(row.dependencyEvidence.map(value => [value.target, value]));
            fail(recorded.size === targets.size && recorded.size === row.dependencyEvidence.length && entry?.dependencyTargetCount === targets.size, `Move dependency target coverage changed: ${row.identity}`);
            for (const [target, paths] of targets) {
                const value = recorded.get(target), actualTarget = actualMap.get(target);
                fail(value && equal(value.paths, [...paths].sort()) && value.targetContentHash === (actualTarget?.contentHash ?? null) && value.resolvedLabelForReview === (actualTarget?.data.name ?? null)
                    && value.ruleVersionApproval === 'not-established-by-consumer' && value.behavioralVerification === 'not-run', `Move exact dependency paths/target changed: ${row.identity} ${target}`);
            }
            const paths = [...targets.values()].reduce((total, paths) => total + paths.size, 0);counts.dependencyTargets += targets.size;counts.dependencyPaths += paths;
            fail(entry?.dependencyPathCount === paths, `Move dependency path count changed: ${row.identity}`);
        }
    }
    fail(equal(audit.counts, counts) && counts.records === entryMap.size, 'Move aggregate source coverage disagrees');
    citations(audit);
}
