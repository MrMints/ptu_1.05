// Evidence integrity for frozen E1d. This has no runtime or acquisition consumer.
export function checkFeatureSupplementSourceUse(bundle, context) {
    const {fail, actualMap, hash, equal} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'E1');
    const slice = batch?.slices.find(s => s.id === 'E1d');
    if (!slice?.recordFile) return;
    const rows = bundle.files[slice.recordFile]?.records ?? [], audit = bundle.featureSource;
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u]));
    const frames = new Map(audit.parentFrames.map(f => [f.id, f]));
    const modifiers = new Map(audit.sourceModifiers.map(m => [m.id, m]));
    const natives = new Map(audit.nativeContexts.map(n => [n.id, n]));
    const inventory = audit.supplementSourceUseInventory ?? {};
    fail(hash(inventory) === '7f8900b5f3aa9598c186a8f1e8b7bb0fa86a29756844e94c6b90bf9547482ea4'
        && inventory.parentFrameIds?.length === 44
        && hash(inventory.parentFrameIds.map(id => frames.get(id))) === 'c2c21944632c08df301f447953df4d2d14e79c91fe3a572b60a3c51772e86965',
    'Feature E1d full supplemental parent/table inventory changed');
    fail(rows.length === 387 && rows.filter(r => r.coverageState === 'reviewed').length === 184
        && rows.filter(r => r.coverageState === 'unresolved').length === 203
        && hash(rows.map(r => [r.identity, hash(r.sourceUseEvidence?.assessment ?? null)])) === '450660b07f25f479749ebbabfc0bc3de8f37b5d8a4b890022f251eecc7ef760e',
    'Feature E1d itemized source-use dispositions changed');
    const frozen = new Map(batch.slices.flatMap(s => s.members.map(([id, h]) => [id, {slice: s.id, hash: h}])));
    const counts = {fieldAxes: 0, materialAxes: 0, executableObjects: 0, dependencyRelationships: 0};
    for (const row of rows) {
        const doc = actualMap.get(row.identity)?.data, a = row.sourceUseEvidence?.assessment;
        fail(a && doc, 'Feature E1d complete source-use review missing: ' + row.identity);
        if (!a || !doc) continue;
        const s = doc.system, comparisons = [row.sourceComparison, ...(row.competingSourceComparisons ?? [])].filter(Boolean);
        fail(a.identity === row.identity && a.contentHash === row.contentHash && a.coverageDisposition === row.coverageState
            && equal(a.currentPrerequisites, s.prerequisites) && equal(a.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null)
            && equal(a.currentFrequency, s.frequency ?? null) && equal(a.currentCost, s.cost ?? null)
            && equal(a.currentKeywords, s.keywords ?? []) && equal(a.currentRules, s.rules ?? [])
            && equal(a.currentRuleHashes, (s.rules ?? []).map(hash)) && equal(a.currentImplementationNotes, row.currentRecordEvidence.implementationNotes)
            && equal(a.generalAdditionalContexts, row.sourceSearch.additionalContexts)
            && a.productionPolicyPromotion === false && a.behavioralVerification === 'not-run'
            && row.generationReview.status === (row.coverageState === 'reviewed' ? 'partially-supported' : 'unavailable'),
        'Feature E1d current fields or bounded disposition changed: ' + row.identity);
        fail(equal(a.sourceDefinitions.map(d => d.sourceUnit).sort(), comparisons.map(c => c.sourceUnit).sort()),
            'Feature E1d complete source candidates changed: ' + row.identity);
        for (const d of a.sourceDefinitions) {
            const u = units.get(d.sourceUnit), c = comparisons.find(c => c.sourceUnit === d.sourceUnit);
            fail(u && c && d.sourceDefinitionEvidenceSha256 === hash(u) && equal(d.source, u.source) && d.sourceRole === c.sourceRole
                && equal(d.printedPrerequisiteAlternatives, u.definition.prerequisites) && equal(d.printedFrequencyAlternatives, u.definition.frequencies)
                && equal(d.printedCosts, u.definition.costs) && equal(d.printedTags, u.definition.tags)
                && equal(d.completeTypedRuleSections, u.ruleStructure) && equal(d.orderedWordDifferences, c.ruleStructureComparison.orderedWordDifferences)
                && d.typedClausesEqual === c.ruleStructureComparison.allTypedClausesEqual
                && d.numericCorrespondenceSupported === c.ruleStructureComparison.numericCorrespondenceSupported
                && d.bodyCorrespondenceSupported === (c.correspondenceSupported || !!c.manualSourceDisposition?.correspondenceSupported)
                && d.sourceParentFrameBindings.length > 0,
            'Feature E1d complete printed source facts changed: ' + row.identity);
            for (const b of d.sourceParentFrameBindings) {
                const f = frames.get(b.id);
                fail(f && b.frameEvidenceSha256 === hash(f) && f.source.path === u?.source.path
                    && u.anchors.some(p => f.source.pdfPages.includes(p.pdfPage)) && a.parentFrameIds.includes(b.id),
                'Feature E1d full parent relationship changed: ' + row.identity);
            }
        }
        const sourceIds = a.sourceDefinitions.map(d => d.sourceUnit);
        const requiredFrames = [];
        if (sourceIds.some(id => /^porygon:(80|81):/.test(id))) requiredFrames.push('porygon-parent-pokebot-control-and-complexity');
        if (sourceIds.some(id => /^porygon:(82|83):/.test(id))) requiredFrames.push('porygon-parent-capture-technology-use');
        if (sourceIds.some(id => /^porygon:(84|85):/.test(id))) requiredFrames.push('porygon-parent-augmentation-use-and-capacity');
        if (sourceIds.some(id => id.startsWith('blessed:'))) requiredFrames.push('blessed-parent-gift-framework',
            'blessed-parent-blessing-tables-and-patron-stats', 'blessed-parent-gift-kinds-and-limits');
        fail(requiredFrames.every(id => a.parentFrameIds.includes(id)),
            'Feature E1d known recipe/Blessing/effect-use context missing: ' + row.identity);
        if (sourceIds.some(id => id.startsWith('throhs:'))) fail(a.sourceModifierBindings.some(b => b.id === 'feb1-old-class-ability-exception'),
            'Feature E1d old Class-granted Ability exception lost: ' + row.identity);
        fail(equal(a.parentFrameIds, a.parentFrameBindings.map(b => b.id))
            && a.parentFrameBindings.every(b => frames.has(b.id) && b.frameEvidenceSha256 === hash(frames.get(b.id)))
            && a.sourceModifierBindings.every(b => modifiers.has(b.id) && b.evidenceSha256 === hash(modifiers.get(b.id)))
            && equal(row.sourceUseEvidence.nativeContexts, a.nativeContexts.map(b => b.id))
            && a.nativeContexts.every(b => natives.has(b.id) && b.evidenceSha256 === hash(natives.get(b.id))),
        'Feature E1d exact full source/context binding changed: ' + row.identity);
        for (const f of a.fieldReconciliations) {
            counts.fieldAxes++;
            const u = units.get(f.sourceUnit);
            fail(u && f.identity === row.identity && f.contentHash === row.contentHash && equal(f.currentValue, s[f.axis])
                && equal(f.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null) && equal(f.source, u.source)
                && f.sourceDefinitionEvidenceSha256 === hash(u)
                && equal(f.printedValues, f.axis === 'prerequisites' ? u.definition.prerequisites : u.definition.frequencies)
                && f.sourceAbsenceClaim === false && f.actorEvaluation === 'not-run' && f.productionPolicyPromotion === false
                && (!f.versionAuthorityUnresolved || row.coverageState === 'unresolved'),
            'Feature E1d prerequisite/frequency reconciliation changed: ' + row.identity);
        }
        for (const m of a.materialFieldReconciliation) {
            counts.materialAxes++;
            fail(m.identity === row.identity && m.contentHash === row.contentHash && m.versionAuthorityUnresolved === true
                && row.coverageState === 'unresolved' && equal(m.currentRules, s.rules ?? [])
                && equal(m.currentRuleHashes, (s.rules ?? []).map(hash)) && equal(m.currentKeywords, s.keywords ?? [])
                && m.currentEffect === s.effect && equal(m.sourceUnits.slice().sort(), comparisons.map(c => c.sourceUnit).sort())
                && m.sourceAbsenceClaim === false && m.productionPolicyPromotion === false && m.behavioralVerification === 'not-run',
            'Feature E1d material stored choice/tag limit changed: ' + row.identity);
            if (m.axis === 'missing-printed-gift-tag') fail(!s.keywords.includes('Gift')
                && a.sourceDefinitions.some(d => d.printedTags.includes('Gift'))
                && a.sourceModifierBindings.some(b => b.id === 'sep7-gift-substitution'),
            'Feature E1d known Gift substitution was lost: ' + row.identity);
            if (m.axis === 'shared-two-choice-storage-flag') fail(s.rules.filter(r => r.key === 'ChoiceSet').filter(r => r.flag === 'move').length === 2
                && s.rules.filter(r => r.key === 'GrantItem').filter(r => r.uuid === '{item|flags.ptu.rulesSelections.move}').length === 2,
            'Feature E1d actual shared choice flag was replaced: ' + row.identity);
        }
        counts.executableObjects += a.executableSourceReview.length;
        fail(a.executableSourceReview.length === (s.rules ?? []).length && a.executableSourceReview.every((r, i) => r.ordinal === i
            && r.currentRuleHash === hash(s.rules[i]) && r.kind === s.rules[i].key
            && equal(r.sourceDefinitionIds.slice().sort(), comparisons.map(c => c.sourceUnit).sort()) && equal(r.sourceParentFrameIds, a.parentFrameIds)),
        'Feature E1d stored executable source review missing: ' + row.identity);
        counts.dependencyRelationships += a.dependencyBindings.length;
        fail(equal(a.dependencyBindings.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash})),
            row.dependencyEvidence.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash}))),
        'Feature E1d exact dependency relationships changed: ' + row.identity);
        for (const d of a.dependencyBindings) {
            fail(d.targetContentHash === (actualMap.get(d.target)?.contentHash ?? null)
                && d.sourceTargetApproval === 'not-established-by-consumer' && d.behavioralVerification === 'not-run',
            'Feature E1d exact target evidence changed: ' + row.identity);
            const old = d.existingPublishedTargetReview;
            if (old) {
                const r = bundle.files[old.recordFile]?.records.find(r => r.identity === d.target);
                fail(r && hash(r) === old.recordEvidenceSha256 && r.contentHash === old.currentContentHash
                    && r.coverageState === old.coverageState && r.recordClass === old.recordClass && equal(r.sources ?? [], old.sources)
                    && d.unpublishedTargetLimit === null, 'Feature E1d independent earlier target review changed: ' + row.identity);
            } else if (d.unpublishedTargetLimit && typeof d.unpublishedTargetLimit === 'object') {
                const saved = frozen.get(d.target);
                fail(saved && d.unpublishedTargetLimit.frozenSlice === saved.slice && d.unpublishedTargetLimit.currentContentHash === saved.hash,
                    'Feature E1d unaccepted target was promoted: ' + row.identity);
            } else fail(typeof d.unpublishedTargetLimit === 'string', 'Feature E1d target source limit missing: ' + row.identity);
        }
        if (row.identity === 'feats.lIbnu1npmuEtBwFh') fail(a.sourceDefinitions.length === 0 && row.coverageState === 'unresolved'
            && a.parentFrameIds.includes('blessed-parent-aura-framework-and-hivemind')
            && a.dependencyBindings.some(d => d.target === 'abilities.cERfnFsIgZ0D6NUL'),
        'Feature E1d Hivemind Aura/Feature kind boundary changed');
    }
    fail(equal(counts, {fieldAxes: 44, materialAxes: 14, executableObjects: 532, dependencyRelationships: 323}),
        'Feature E1d field/executable/dependency examination coverage changed');
}
