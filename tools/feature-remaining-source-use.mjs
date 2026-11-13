// Frozen E1e evidence integrity; no runtime, selector or acquisition consumer.
export function checkFeatureRemainingSourceUse(bundle, context) {
    const {fail, actualMap, hash, equal} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'E1'), slice = batch?.slices.find(s => s.id === 'E1e');
    if (!slice?.recordFile) return;
    const audit = bundle.featureSource, rows = bundle.files[slice.recordFile]?.records ?? [];
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u]));
    const frames = new Map(audit.parentFrames.map(f => [f.id, f]));
    const modifiers = new Map(audit.sourceModifiers.map(m => [m.id, m]));
    const natives = new Map(audit.nativeContexts.map(n => [n.id, n]));
    const inventory = audit.remainingSourceUseInventory ?? {};
    fail(hash(inventory) === '5130355578cf27ee007f8a37ed90a7fca0213b82f416a75a021df39fc64561b9'
        && inventory.newNativeContextIds?.length === 11 && inventory.matchedNativePageKeys?.length === 12
        && inventory.supportingDefinitionBindings?.length === 14
        && inventory.finiteNoCandidateExcerptsExamined === 53 && inventory.finiteNoCandidatePrintedLocatorsExamined === 49,
    'Feature E1e examined underlying/native inventory changed');
    fail(rows.length === 268 && rows.filter(r => r.coverageState === 'reviewed').length === 20
        && rows.filter(r => r.coverageState === 'unresolved').length === 248
        && hash(rows.map(r => [r.identity, hash(r.sourceUseEvidence?.assessment ?? null)])) === 'f50180d5ac623371bdd124dd412778081754982227ab0f6e715e2b9a81357168',
    'Feature E1e itemized source-use dispositions changed');
    const frozen = new Map(batch.slices.flatMap(s => s.members.map(([id, h]) => [id, {slice: s.id, hash: h}])));
    const counts = {noHeadingCandidate: 0, underlyingDefinitions: 0, wordEqualFields: 0, identityOnlyBodies: 0, materialAxes: 0, rules: 0, dependencies: 0};
    for (const row of rows) {
        const doc = actualMap.get(row.identity)?.data, a = row.sourceUseEvidence?.assessment;
        fail(doc && a, 'Feature E1e complete source-use assessment missing: ' + row.identity);
        if (!doc || !a) continue;
        const s = doc.system, comparisons = [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean);
        fail(a.identity === row.identity && a.contentHash === row.contentHash && a.coverageDisposition === row.coverageState
            && equal(a.currentPrerequisites, s.prerequisites) && equal(a.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null)
            && equal(a.currentFrequency, s.frequency ?? null) && equal(a.currentCost, s.cost ?? null)
            && equal(a.currentKeywords, s.keywords ?? []) && equal(a.currentRules, s.rules ?? []) && equal(a.currentRuleHashes, (s.rules ?? []).map(hash))
            && equal(a.currentImplementationNotes, row.currentRecordEvidence.implementationNotes)
            && equal(a.currentTypedRuleSections, row.currentRecordEvidence.currentRuleStructure)
            && a.productionPolicyPromotion === false && a.behavioralVerification === 'not-run'
            && row.generationReview.status === (row.coverageState === 'reviewed' ? 'partially-supported' : 'unavailable'),
        'Feature E1e current fields or source-only scope changed: ' + row.identity);
        fail(equal(a.sourceDefinitions.map(d => d.sourceUnit).sort(), comparisons.map(c => c.sourceUnit).sort()),
            'Feature E1e original heading candidates changed: ' + row.identity);
        const expected = inventory.supportingDefinitionBindings?.find(b => b.identity === row.identity);
        fail(equal(a.underlyingDefinitions.map(d => d.sourceUnit), expected?.sourceUnits ?? [])
            && equal(row.sourceSearch.supportingSourceUnits, expected?.sourceUnits ?? [])
            && (!expected || expected.contentHash === row.contentHash),
        'Feature E1e known underlying source definition missing: ' + row.identity);
        counts.underlyingDefinitions += a.underlyingDefinitions.length;
        for (const d of [...a.sourceDefinitions, ...a.underlyingDefinitions]) {
            const u = units.get(d.sourceUnit), c = comparisons.find(c => c.sourceUnit === d.sourceUnit);
            fail(u && d.sourceDefinitionEvidenceSha256 === hash(u) && equal(d.source, u.source)
                && equal(d.printedPrerequisiteAlternatives, u.definition.prerequisites) && equal(d.printedFrequencyAlternatives, u.definition.frequencies)
                && equal(d.printedCosts, u.definition.costs) && equal(d.printedTags, u.definition.tags)
                && equal(d.completeTypedRuleSections, u.ruleStructure) && d.sourceParentFrameBindings.length > 0,
            'Feature E1e complete printed source facts changed: ' + row.identity);
            if (a.sourceDefinitions.includes(d)) fail(c && d.sourceRole === c.sourceRole
                && equal(d.orderedWordDifferences, c.ruleStructureComparison.orderedWordDifferences)
                && d.typedClausesEqual === c.ruleStructureComparison.allTypedClausesEqual
                && d.numericCorrespondenceSupported === c.ruleStructureComparison.numericCorrespondenceSupported
                && d.bodyCorrespondenceSupported === (c.correspondenceSupported || !!c.manualSourceDisposition?.correspondenceSupported),
            'Feature E1e exact candidate comparison changed: ' + row.identity);
            else fail(d.bodyCorrespondenceSupported === false, 'Feature E1e underlying source was promoted to current identity: ' + row.identity);
            for (const b of d.sourceParentFrameBindings) {
                const f = frames.get(b.id);
                fail(f && b.frameEvidenceSha256 === hash(f) && f.source.path === u?.source.path
                    && u.anchors.some(p => f.source.pdfPages.includes(p.pdfPage)) && a.parentFrameIds.includes(b.id),
                'Feature E1e complete parent/table relationship changed: ' + row.identity);
            }
        }
        fail(equal(a.parentFrameIds, a.parentFrameBindings.map(b => b.id))
            && a.parentFrameBindings.every(b => frames.has(b.id) && b.frameEvidenceSha256 === hash(frames.get(b.id)))
            && a.sourceModifierBindings.every(b => modifiers.has(b.id) && b.evidenceSha256 === hash(modifiers.get(b.id)))
            && equal(row.sourceUseEvidence.nativeContexts, a.nativeContexts.map(b => b.id))
            && a.nativeContexts.every(b => natives.has(b.id) && b.evidenceSha256 === hash(natives.get(b.id))),
        'Feature E1e exact source/native/modifier bindings changed: ' + row.identity);
        if (!comparisons.length) {
            counts.noHeadingCandidate++;
            const f = a.finiteNoHeadingCandidateExamination;
            fail(f && f.sourcePageCount === 2652 && f.nativePageCount === 271 && f.sourceAbsenceClaim === false
                && equal(f.knownUnderlyingSourceUnits, a.underlyingDefinitions.map(d => d.sourceUnit))
                && row.coverageState === 'unresolved' && typeof a.exactCurrentAuthoringLimit === 'string'
                && a.exactCurrentAuthoringLimit.includes(row.identity) && a.exactCurrentAuthoringLimit.includes(row.contentHash),
            'Feature E1e finite no-heading examination cannot prove source absence or current identity: ' + row.identity);
        }
        if (a.wordEqualFieldReconciliation) {
            counts.wordEqualFields++;
            const f = a.wordEqualFieldReconciliation;
            fail(equal(f.currentPrerequisites, s.prerequisites) && equal(f.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null)
                && equal(f.currentFrequency, s.frequency ?? null) && equal(f.currentCost, s.cost ?? null)
                && f.productionPolicyPromotion === false && f.actorEvaluation === 'not-run',
            'Feature E1e equal body cannot replace prerequisite/frequency facts: ' + row.identity);
            for (const d of f.printedSourceFields) {
                const u = units.get(d.sourceUnit);
                fail(u && equal(d.prerequisites, u.definition.prerequisites) && equal(d.frequency, u.definition.frequencies) && equal(d.cost, u.definition.costs),
                    'Feature E1e equal-body complete source fields changed: ' + row.identity);
            }
        }
        counts.identityOnlyBodies += a.identityOnlyBodyLimits.length;
        for (const d of a.identityOnlyBodyLimits) {
            const c = comparisons.find(c => c.sourceUnit === d.sourceUnit);
            fail(c && c.namedHeaderCandidate === false && c.ruleStructureComparison.allOrderedWordsEqual
                && c.ruleStructureComparison.allTypedClausesEqual && c.ruleStructureComparison.numericCorrespondenceSupported
                && row.coverageState === 'unresolved', 'Feature E1e identical body cannot invent inherited identity: ' + row.identity);
        }
        for (const m of a.materialFieldReconciliation) {
            counts.materialAxes++;
            fail(m.identity === row.identity && m.contentHash === row.contentHash && equal(m.currentRules, s.rules ?? [])
                && equal(m.currentRuleHashes, (s.rules ?? []).map(hash)) && m.currentEffect === s.effect
                && equal(m.currentFrequency, s.frequency ?? null) && equal(m.currentKeywords, s.keywords ?? [])
                && row.coverageState === 'unresolved' && m.versionAuthorityUnresolved === true && m.sourceAbsenceClaim === false
                && m.productionPolicyPromotion === false && m.behavioralVerification === 'not-run',
            'Feature E1e exact material formula/flag/reference/use limit changed: ' + row.identity);
        }
        counts.rules += a.executableSourceReview.length;
        fail(a.executableSourceReview.length === (s.rules ?? []).length && a.executableSourceReview.every((r, i) => r.ordinal === i
            && r.currentRuleHash === hash(s.rules[i]) && r.kind === s.rules[i].key
            && equal(r.sourceDefinitionIds.slice().sort(), comparisons.map(c => c.sourceUnit).sort())
            && equal(r.underlyingSourceDefinitionIds, a.underlyingDefinitions.map(d => d.sourceUnit)) && equal(r.sourceParentFrameIds, a.parentFrameIds)),
        'Feature E1e exact executable source examination missing: ' + row.identity);
        counts.dependencies += a.dependencyBindings.length;
        fail(equal(a.dependencyBindings.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash})),
            row.dependencyEvidence.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash}))),
        'Feature E1e exact dependency relationships changed: ' + row.identity);
        for (const d of a.dependencyBindings) {
            fail(d.targetContentHash === (actualMap.get(d.target)?.contentHash ?? null)
                && d.sourceTargetApproval === 'not-established-by-consumer' && d.behavioralVerification === 'not-run',
            'Feature E1e exact target or scope limit changed: ' + row.identity);
            const old = d.existingPublishedTargetReview;
            if (old) {
                const r = bundle.files[old.recordFile]?.records.find(r => r.identity === d.target);
                fail(r && hash(r) === old.recordEvidenceSha256 && r.contentHash === old.currentContentHash
                    && r.coverageState === old.coverageState && r.recordClass === old.recordClass && equal(r.sources ?? [], old.sources)
                    && d.unpublishedTargetLimit === null, 'Feature E1e earlier target source/scope disposition changed: ' + row.identity);
            } else if (d.unpublishedTargetLimit && typeof d.unpublishedTargetLimit === 'object') {
                const saved = frozen.get(d.target);
                fail(saved && d.unpublishedTargetLimit.frozenSlice === saved.slice && d.unpublishedTargetLimit.currentContentHash === saved.hash,
                    'Feature E1e unaccepted target promoted: ' + row.identity);
            } else fail(typeof d.unpublishedTargetLimit === 'string', 'Feature E1e target evidence limit missing: ' + row.identity);
        }
        if (row.identity === 'feats.l1bMdIUsBsxeri0D') fail(a.underlyingDefinitions.some(d => d.sourceUnit === 'core:61:feature-line8')
            && a.sourceDefinitions.some(d => d.sourceUnit === 'core:61:feature-line23' && d.printedPrerequisiteAlternatives.length === 0),
        'Feature E1e actual parent grant became a child prerequisite');
    }
    fail(equal(counts, {noHeadingCandidate: 131, underlyingDefinitions: 17, wordEqualFields: 23, identityOnlyBodies: 3,
        materialAxes: 12, rules: 136, dependencies: 218}), 'Feature E1e complete source-use counts changed');
}
