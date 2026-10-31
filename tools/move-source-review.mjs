// Frozen D source integrity. No runtime, acquisition or policy consumer.
import {moveSourceWordingProof, moveSourceNumericTokens, extractMoveUseConditions} from './move-source-parsing.mjs';
export function checkMoveSourceReview(bundle, context) {
    if (!bundle.index.moveSourceEvidence) return;
    const {moveSource: audit, batchManifest, files, index} = bundle;
    const {fail, actualMap, hash, equal, textHash, normalizedText: norm, parseMoveRules, citations} = context;
    const batch = batchManifest.batches.find(batch => batch.id === 'D'), census = audit?.sourceDefinitionCensus;
    const expected = {D1: [110, '294e921236116139928451507341a0a1f2138c9a83fa897492a814a1e965f715'], D2: [581, '84a59050aa2d1dc302f6c020d4e46a0fde6d35842ed9c323b306eb965a07665f'], D3: [537, '8f035b2f36d725eddd74c60f7002acb576a1f98815ce5487f303a1ee4acf666f']};
    fail(audit?.sourceFingerprint === index.sourceFingerprint && audit.batch === 'D' && audit.membershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === batchManifest.candidateSnapshot.sha256
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'Move frozen scope/policy/diagnostic changed');
    const units = new Map((audit?.sourceDefinitions ?? []).map(unit => [unit.id, unit]));
    fail(census?.fullMoves === 660 && census.contestEffects === 44 && census.printedModifiers === 1 && units.size === 705 && census.definitionSetSemanticSha256 === '211eea6c475632f827e2a0bd6b5312aa083d5f509ce7a483e99b91f4d055578f' && census.definitionSetSemanticSha256 === hash(audit.sourceDefinitions)
        && census.rejectedSourceHeaders.length === 1 && census.rejectedSourceHeaders[0].id === 'core:337:move-line19', 'Move complete source census/boundaries changed');
    const key = structure => structure.clauses.map(clause => [clause.kind, norm(clause.text)]), words = keys => keys.map(value => value[1]).join(' ');
    const entryMap = new Map(audit.currentRecordAudit.map(row => [row.identity, row]));
    const counts = Object.fromEntries(['records', 'reviewed', 'unresolved', 'sourceComparisons', 'equalWordsDifferentTypedRoles', 'explicitNoEffectRepresentations', 'dependencyTargets', 'dependencyPaths'].map(key => [key, 0]));
    const numericSafe = (a, b) => ![...a, ...b].some(value => value.startsWith('unrecognized-sign:')) && equal(a, b);
    const contexts = new Map((audit.generalUseContexts ?? []).map(value => [value.id, value]));
    const supportingRules = new Map();
    fail(contexts.size === 6 && [...contexts.values()].every(value => value.rawSha256 === textHash(value.rawText) && value.normalizedSha256 === textHash(norm(value.rawText)) && value.behavioralVerification === 'not-run'), 'Move general use-condition context changed');
    fail(equal(audit.sourceBoundaryCorrections?.changes?.map(value => value.id), ['core:289:move-line47', 'throhs:45:move-line3']) && units.get('throhs:45:move-line3')?.dependentConditions[0].value === 'Melee Weapons Only', 'Move printed rank heading contaminated a source condition');
    for (const artifact of audit.sourceSearchArtifacts ?? []) {
        const search = bundle.moveSearch?.[artifact.path], registry = search?.sourceRegistry, slice = batch.slices.find(value => value.id === artifact.slice);
        fail(search && hash(search) === artifact.evidenceSemanticSha256 && search.slice === slice?.id && search.productionPolicyPromotion === false && search.behavioralVerification === 'not-run', `Move finite search artifact changed: ${artifact.slice}`);
        if (!registry || !slice) continue;
        if (slice.id === 'D3') {
            const underlying = registry.underlyingSourceRules;
            fail(underlying?.definitions?.length === 40 && hash(underlying) === '072130dd0dde25d8bc6b43c95eb362fefb3f5df0b3e9b2dcae9f9d8dbe371c82', 'Move underlying non-Move source census changed');
            for (const unit of underlying?.definitions ?? []) {
                supportingRules.set(unit.id, unit);
                fail(unit.rawDefinitionSha256 === textHash(unit.rawDefinition) && equal(unit.ruleStructure, parseMoveRules(unit.rawDefinition.replace(/^[\s\S]*?(?=\b(?:Trigger|Effect):)/, ''))) && unit.definitionCompleteness.includes('not an independently printed Move'), `Move underlying source boundary/role changed: ${unit.id}`);
            }
            fail(underlying?.sharedUseContexts?.length === 3 && underlying.sharedUseContexts.every(value => value.rawText.length > 100 && value.rawSha256 === textHash(value.rawText)), 'Move parent Song/Intercept use conditions missing');
        }
        fail(registry.sourcePageCount === 2652 && registry.pages.length === 2652 && registry.nativePageCount === 271 && registry.nativePages.length === 271
            && Object.values(registry.sourceCorpusCensus).reduce((sum, value) => sum + value.pagesExamined, 0) === 2652
            && equal(Object.keys(search.records).sort(), slice.members.map(value => value[0]).sort()) && registry.sourceTemplateEvidence.templates.length === 5, `Move finite corpus/membership/template coverage changed: ${artifact.slice}`);
        const nativeIds = new Set();
        for (const page of registry.nativePages) {
            const journal = actualMap.get(page.journalIdentity), actualPage = journal?.data.pages?.find(value => value._id === page.pageId);
            nativeIds.add(`${page.journalIdentity}:${page.pageId}`);
            fail(journal?.contentHash === page.journalContentHash && actualPage && hash(actualPage) === page.pageJsonSha256 && textHash(norm(actualPage.text.content)) === page.textNormalizedSha256, `Move finite native page changed: ${page.id}`);
        }
        const actualNativeIds = [...actualMap.entries()].filter(([identity]) => identity.startsWith('journals.')).flatMap(([identity, value]) => (value.data.pages ?? []).map(page => `${identity}:${page._id}`));
        fail(equal([...nativeIds].sort(), actualNativeIds.sort()), 'Move native corpus silently shrank');
        for (const template of registry.sourceTemplateEvidence.templates) fail(template.rawDefinitionSha256 === textHash(template.rawDefinition) && template.kind === 'parameterized-source-template' && template.definitionCompleteness.includes('selected values'), 'Move parameterized source template changed');
        for (const passage of registry.passages) fail(registry.pages[passage.pageOrdinal] && passage.startLine > 0 && passage.endLine >= passage.startLine && /^[a-f0-9]{64}$/.test(passage.rawSha256) && /^[a-f0-9]{64}$/.test(passage.normalizedSha256), 'Move finite passage location/hash missing');
        for (const row of Object.values(search.records)) {
            fail(actualMap.get(row.identity)?.contentHash === row.contentHash && row.sourceAbsenceClaim === false, `Move finite search current identity changed: ${row.identity}`);
            for (const [page, passages, labels, phrases] of row.printedLocators) fail(registry.pages[page] && passages.every(ordinal => registry.passages[ordinal]?.pageOrdinal === page) && labels.every(ordinal => row.searchLabelsForDiscoveryOnly[ordinal]) && phrases.every(ordinal => row.twelveWordPhraseLocatorsForDiscoveryOnly[ordinal]), `Move finite printed locator changed: ${row.identity}`);
            for (const [page, labels, phrases] of row.nativeLocators) fail(registry.nativePages[page] && labels.every(ordinal => row.searchLabelsForDiscoveryOnly[ordinal]) && phrases.every(ordinal => row.twelveWordPhraseLocatorsForDiscoveryOnly[ordinal]), `Move finite native locator changed: ${row.identity}`);
        }
        citations(registry);
    }
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
                const signed = slice.id !== 'D1', rn = moveSourceNumericTokens(current), sn = moveSourceNumericTokens(unit.ruleStructure), safe = numericSafe(rn, sn);
                const supported = comparison.namedHeaderCandidate && independent && (sameWords || none) && (!signed || safe);
                fail(comparison.independentCurrentFieldsSupport === independent && comparison.correspondenceSupported === supported, `Move counterpart lacks independent fields/full content: ${row.identity}`);
                const proof = signed && moveSourceWordingProof(current, unit, norm), manual = comparison.manualSourceDisposition;
                if (signed && manual) fail(manual.proof === proof && proof && comparison.namedHeaderCandidate && independent && manual.correspondenceSupported === true && manual.sources.some(source => equal(source, unit.source)), `Move bounded wording proof is not supported: ${row.identity}`);
                hasProvenCorrespondence ||= supported || (signed ? !!proof && !!manual : manual?.correspondenceSupported === true && manual.sources?.some(source => source.path === 'Core System/Pokemon Tabletop United 1.05 Core.pdf' && source.pdfPages.includes(264)));
                if (signed) fail(st.numericEvidenceFormat === 'signed-spaced-unicode-v2' && equal(st.recordNumericTokens, rn) && equal(st.sourceNumericTokens, sn) && st.numericCorrespondenceSupported === safe
                    && (sameWords || st.orderedContentWordDifferences.length > 0), `Move signed numeric/ordered-difference evidence changed: ${row.identity}`);
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
                if (signed) {
                    const range = unit.fields.range ?? [], ct = unit.fields['contest-type'] ?? [], ce = unit.fields['contest-effect'] ?? [];
                    fail(fields.get('range+keywords')?.recordValue === actualRange && fields.get('range+keywords')?.sourceValue === (range.length === 1 ? range[0] : null)
                        && equal(fields.get('range+keywords')?.recordParts, parts(actualRange)) && equal(fields.get('range+keywords')?.sourceParts, range.length === 1 ? parts(range[0]) : [])
                        && equal(fields.get('contestType/effect')?.recordValue, system.contestType ?? null) && fields.get('contestType/effect')?.sourceValue === (ct.length === 1 && ce.length === 1 ? `${ct[0]} - ${ce[0]}` : null), `Move literal range/keyword/Contest evidence changed: ${row.identity}`);
                }
                fail(row.sources.some(source => equal(source, comparison.source)) && comparison.productionPolicyPromotion === false && comparison.behavioralVerification === 'not-run', `Move source citation/policy changed: ${row.identity}`);
            }
            if (row.coverageState === 'reviewed') fail(hasProvenCorrespondence, `Move reviewed state has no complete examined correspondence: ${row.identity}`);
            if (slice.id !== 'D1') {
                const finite = row.sourceSearch.finiteCorpusSearch, searched = bundle.moveSearch?.[finite?.artifact]?.records?.[row.identity];
                fail(searched && finite.recordKey === row.identity && finite.recordEvidenceSemanticSha256 === hash(searched) && finite.sourceAbsenceClaim === false
                    && equal(row.sourceSearch.printedPassageLocators, searched.printedLocators.map(value => value[0])) && equal(row.sourceSearch.nativeJournalLocators, searched.nativeLocators.map(value => value[0]))
                    && equal([...searched.completeDefinitionCandidates].sort(), [...ids].sort()), `Move finite authoring search missing or changed: ${row.identity}`);
                fail(row.sourceSearch.generalUseContexts?.length >= 2 && row.sourceSearch.generalUseContexts.every(id => contexts.has(id)) && row.sourceSearch.generalUseContexts.includes('move-action-and-frequency') && row.sourceSearch.generalUseContexts.includes('move-class-range-effect-capability'), `Move general source-use conditions missing: ${row.identity}`);
                const rules = row.implementationFieldEvidence?.ruleElements;
                fail(rules?.length === (system.rules ?? []).length && rules.every((value, ordinal) => value.ordinal === ordinal && equal(value.currentRule, system.rules[ordinal]) && value.currentJsonSha256 === hash(system.rules[ordinal])) && row.implementationFieldEvidence.behavioralVerification === 'not-run', `Move exact executable field evidence changed: ${row.identity}`);
                if (slice.id === 'D3') {
                    fail(equal(row.sourceSearch.currentUseConditions, extractMoveUseConditions(system.effect)) && equal(row.sourceSearch.currentUntracedNumericTokens, moveSourceNumericTokens(current))
                        && equal(row.sourceSearch.exactAuthoringDisposition?.currentFieldInventory, inventory) && row.sourceSearch.exactAuthoringDisposition.currentContentHash === row.contentHash, `Move exact remaining authoring/use-condition fields changed: ${row.identity}`);
                    for (const comparison of row.sourceSearch.supportingRuleComparisons ?? []) {
                        const unit = supportingRules.get(comparison.sourceRule), sw = unit && words(key(unit.ruleStructure)), headerFields = {};
                        for (const match of (unit?.rawDefinition ?? '').matchAll(/^\s*(Action|AC|Class|Range):\s*(.*)$/gm)) (headerFields[match[1].toLowerCase()] ??= []).push(match[2].trim());
                        if (unit?.kind === 'musician-song') headerFields['cost/frequency'] = [unit.rawDefinition.split('\n')[1].trim()];
                        fail(unit && comparison.rawDefinitionSha256 === unit.rawDefinitionSha256 && equal(comparison.source, unit.source) && comparison.sourceKind === unit.kind
                            && equal(comparison.currentRuleStructure, current) && equal(comparison.sourceRuleStructure, unit.ruleStructure) && comparison.recordOrderedContentSha256 === textHash(cw) && comparison.sourceOrderedContentSha256 === textHash(sw)
                            && comparison.allOrderedWordsEqual === (cw === sw) && equal(comparison.printedHeaderFields, headerFields)
                            && equal(comparison.currentMechanicalFields, Object.fromEntries(['type','frequency','ac','damageBase','category','range','keywords','contestType','isStruggle'].map(field => [field, system[field] ?? null])))
                            && comparison.sourceRelationshipApproval === 'underlying-source-facts-only; exact inherited wrapper/version relationship and behavior remain separate' && comparison.behavioralVerification === 'not-run', `Move underlying rule comparison changed: ${row.identity}`);
                    }
                    const expectedLinked = [];
                    const visit = (value, path = '$.system') => {
                        if (Array.isArray(value)) value.forEach((child, ordinal) => visit(child, `${path}[${ordinal}]`));
                        else if (value && typeof value === 'object') Object.entries(value).forEach(([key, child]) => visit(child, `${path}.${key}`));
                        else if (typeof value === 'string') for (const match of value.matchAll(/Compendium\.ptu\.journals\.([A-Za-z0-9]{16})\.JournalEntryPage\.([A-Za-z0-9]{16})/g)) expectedLinked.push([path, match[0], `journals.${match[1]}`, match[2]]);
                    };
                    visit(system);
                    fail(equal(row.sourceSearch.linkedNativeDefinitions?.map(value => [value.fieldPath, value.exactUuid, value.journalIdentity, value.pageId]), expectedLinked), `Move linked native page/UUID paths changed: ${row.identity}`);
                    for (const linked of row.sourceSearch.linkedNativeDefinitions ?? []) {
                        const journal = actualMap.get(linked.journalIdentity), page = journal?.data.pages?.find(value => value._id === linked.pageId);
                        fail(page && journal.contentHash === linked.journalContentHash && hash(page) === linked.pageJsonSha256 && textHash(norm(page.text.content)) === linked.textNormalizedSha256, `Move complete linked native definition changed: ${row.identity}`);
                    }
                }
            }
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
