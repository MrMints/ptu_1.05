// Source evidence for frozen E1c only. This module has no runtime or acquisition consumer.
export function checkFeatureCoreSourceUse(bundle, context) {
    const {fail, actualMap, hash, equal, textHash, normalizedText: norm} = context;
    const slice = bundle.batchManifest.batches.find(b => b.id === 'E1')?.slices.find(s => s.id === 'E1c');
    if (!slice?.recordFile) return;
    const audit = bundle.featureSource, records = bundle.files[slice.recordFile]?.records ?? [];
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u]));
    const frames = new Map((audit.parentFrames ?? []).map(f => [f.id, f]));
    const modifiers = new Map((audit.sourceModifiers ?? []).map(m => [m.id, m]));
    const natives = new Map((audit.nativeContexts ?? []).map(n => [n.id, n]));
    const visuals = new Map((audit.visualReadings ?? []).map(v => [v.id, v]));
    const inventory = audit.coreSourceUseInventory ?? {};
    const coreFrames = (inventory.parentFrameIds ?? []).map(id => frames.get(id) ?? null);
    const coreModifiers = (inventory.sourceModifierIds ?? []).map(id => modifiers.get(id) ?? null);
    const coreVisuals = (inventory.visualReadingIds ?? []).map(id => visuals.get(id) ?? null);
    fail(hash(inventory) === 'cdf52f32f20236e9b85e606d2757092d4bc77a06ee256de6ee730a82ce7b7855',
        'Feature E1c frozen source-use inventory changed');
    fail(records.length === 665 && coreFrames.length === 69 && coreModifiers.length === 7
        && inventory.nativeContextIds?.length === 4 && coreVisuals.length === 1,
        'Feature E1c complete source-use inventories changed');
    fail(hash(coreFrames) === '256e17d8ee659535ad69d2811521d8749d70cf02c4e2b1afa0b0709f36d2bbc7'
        && hash(coreModifiers) === 'c2619354b331642cb335721333bc86aa915f0a56e45e3b75590b94d8853b070d'
        && hash(coreVisuals) === '879260392a6d753020d0979f5af3310d68b5098eacfb9c5fbcc179fc62e0e567',
    'Feature E1c examined parent/table/modifier/diagram facts changed');
    fail(hash(records.map(r => [r.identity, hash(r.sourceUseEvidence?.assessment ?? null)])) === 'cee3cb15f147704141f93498f8662ca40fd23cc0d0c712cd3cb52e341e35dcff',
        'Feature E1c itemized source-use dispositions changed');
    for (const frame of frames.values()) {
        fail(frame.source.pdfPages.length === frame.sourcePageSegments.length
            && equal(frame.source.pdfPages, frame.sourcePageSegments.map(p => p.pdfPage))
            && frame.sourcePageSegments.every(p => p.rawSha256 === textHash(p.rawText) && p.normalizedSha256 === textHash(norm(p.rawText)))
            && frame.completeDefinitionUnits.every(id => units.has(id))
            && frame.productionPolicyPromotion === false && frame.behavioralVerification === 'not-run',
        'Feature E1c complete source frame changed: ' + frame.id);
    }
    for (const modifier of modifiers.values()) {
        const page = [...frames.values()].filter(f => f.source.path === modifier.source.path)
            .flatMap(f => f.sourcePageSegments).find(p => modifier.source.pdfPages.includes(p.pdfPage));
        fail(page && modifier.rawText === page.rawText.split(/\r?\n/).slice(modifier.startLine - 1, modifier.endLine).join('\n')
            && modifier.rawSha256 === textHash(modifier.rawText) && modifier.normalizedSha256 === textHash(norm(modifier.rawText))
            && modifier.productionPolicyPromotion === false && modifier.behavioralVerification === 'not-run',
        'Feature E1c separately printed modifier changed: ' + modifier.id);
    }
    for (const visual of visuals.values()) {
        const unit = units.get(visual.sourceUnit);
        fail(unit && visual.sourceDefinitionEvidenceSha256 === hash(unit) && equal(visual.source, unit.source)
            && equal(visual.printedClockwiseCycle, ['Grassland', 'Forest', 'Wetlands', 'Ocean', 'Tundra', 'Mountain', 'Cave', 'Urban', 'Desert', 'Grassland'])
            && visual.productionPolicyPromotion === false && visual.behavioralVerification === 'not-run',
        'Feature E1c independently read diagram changed');
    }
    const counts = {prerequisiteAxes: 0, materialAxes: 0, executableObjects: 0, dependencyRelationships: 0};
    const frozen = new Map(bundle.batchManifest.batches.find(b => b.id === 'E1').slices.flatMap(s => s.members.map(([id, h]) => [id, {slice: s.id, hash: h}])));
    for (const row of records) {
        const doc = actualMap.get(row.identity)?.data, use = row.sourceUseEvidence, a = use?.assessment;
        fail(a && doc, 'Feature E1c itemized complete source-use review missing: ' + row.identity);
        if (!a || !doc) continue;
        const system = doc.system, comparisons = [row.sourceComparison, ...row.competingSourceComparisons];
        fail(row.generationReview?.status === (row.coverageState === 'reviewed' ? 'partially-supported' : 'unavailable')
            && row.behavioralVerification === 'not-run' && row.productionPolicyPromotion === false,
        'Feature E1c source evidence cannot certify whole-version generation or gameplay: ' + row.identity);
        const bySource = new Map(comparisons.map(c => [c.sourceUnit, c]));
        fail(a.identity === row.identity && a.contentHash === row.contentHash && a.coverageDisposition === row.coverageState
            && equal(a.currentPrerequisites, system.prerequisites) && equal(a.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null)
            && equal(a.currentFrequency, system.frequency ?? null) && equal(a.currentCost, system.cost ?? null)
            && equal(a.currentKeywords, system.keywords ?? []) && equal(a.currentRules, system.rules ?? [])
            && equal(a.currentRuleHashes, (system.rules ?? []).map(hash)) && equal(a.currentImplementationNotes, row.currentRecordEvidence.implementationNotes)
            && equal(a.generalAdditionalContexts, row.sourceSearch.additionalContexts)
            && a.productionPolicyPromotion === false && a.behavioralVerification === 'not-run',
        'Feature E1c source-use current facts changed: ' + row.identity);
        fail(equal(a.sourceDefinitions.map(d => d.sourceUnit).sort(), comparisons.map(c => c.sourceUnit).sort()),
            'Feature E1c source-use candidate coverage changed: ' + row.identity);
        for (const d of a.sourceDefinitions) {
            const unit = units.get(d.sourceUnit), c = bySource.get(d.sourceUnit);
            if (!unit || !c) { fail(false, 'Feature E1c source-use unknown source: ' + row.identity); continue; }
            fail(d.sourceDefinitionEvidenceSha256 === hash(unit) && equal(d.source, unit.source) && d.sourceRole === c.sourceRole
                && equal(d.printedPrerequisiteAlternatives, unit.definition.prerequisites) && equal(d.printedFrequencyAlternatives, unit.definition.frequencies)
                && equal(d.printedCosts, unit.definition.costs) && equal(d.printedTags, unit.definition.tags) && equal(d.completeTypedRuleSections, unit.ruleStructure)
                && equal(d.orderedWordDifferences, c.ruleStructureComparison.orderedWordDifferences)
                && d.typedClausesEqual === c.ruleStructureComparison.allTypedClausesEqual
                && d.numericCorrespondenceSupported === c.ruleStructureComparison.numericCorrespondenceSupported
                && d.bodyCorrespondenceSupported === (c.correspondenceSupported || !!c.manualSourceDisposition?.correspondenceSupported),
            'Feature E1c source-use complete printed facts changed: ' + row.identity);
            for (const binding of d.sourceParentFrameBindings) {
                const frame = frames.get(binding.id);
                fail(frame && binding.frameEvidenceSha256 === hash(frame) && frame.source.path === unit.source.path
                    && unit.anchors.some(anchor => frame.sourcePageSegments.some(p => p.pdfPage === anchor.pdfPage)),
                'Feature E1c source-use parent relationship changed: ' + row.identity);
            }
        }
        fail(equal(a.parentFrameIds, a.parentFrameBindings.map(b => b.id)) && a.parentFrameBindings.every(b => frames.has(b.id) && b.frameEvidenceSha256 === hash(frames.get(b.id)))
            && a.sourceModifierBindings.every(b => modifiers.has(b.id) && b.evidenceSha256 === hash(modifiers.get(b.id)))
            && equal(use.nativeContexts, a.nativeContexts.map(b => b.id)) && a.nativeContexts.every(b => natives.has(b.id) && b.evidenceSha256 === hash(natives.get(b.id)))
            && a.visualReadings.every(b => visuals.has(b.id) && b.evidenceSha256 === hash(visuals.get(b.id))),
        'Feature E1c exact parent/modifier/native/visual binding changed: ' + row.identity);
        const prereq = a.prerequisiteReconciliation;
        if (prereq) {
            counts.prerequisiteAxes++;
            fail(prereq.identity === row.identity && prereq.contentHash === row.contentHash
                && equal(prereq.currentPrerequisites, system.prerequisites) && equal(prereq.currentPrerequisiteBackup, doc.flags?.ptu?.prereqBackup ?? null)
                && prereq.sourceComparisons.length === comparisons.length && prereq.sourceAbsenceClaim === false
                && prereq.actorEvaluation === 'not-run' && prereq.productionPolicyPromotion === false,
            'Feature E1c prerequisite observation changed: ' + row.identity);
            for (const c of prereq.sourceComparisons) {
                const unit = units.get(c.sourceUnit);
                fail(unit && c.sourceDefinitionEvidenceSha256 === hash(unit) && equal(c.printedPrerequisiteAlternatives, unit.definition.prerequisites)
                    && equal(c.currentPrerequisites, system.prerequisites) && equal(c.source, unit.source),
                'Feature E1c prerequisite full source changed: ' + row.identity);
            }
            for (const p of prereq.parentSourceEvidence) {
                const unit = units.get(p.sourceUnit);
                fail(unit && p.sourceDefinitionEvidenceSha256 === hash(unit) && p.rawDefinition === unit.rawDefinition && equal(p.source, unit.source),
                    'Feature E1c printed grant parent changed: ' + row.identity);
            }
            if (prereq.decision.category === 'printed-grant-parent-distinct-from-child-prerequisite') {
                fail(prereq.parentSourceEvidence.length === 1 && prereq.sourceComparisons.some(c => units.get(c.sourceUnit)?.printedGrantedDefinition
                    && units.get(c.sourceUnit).definition.prerequisites.length === 0), 'Feature E1c printed child grant was replaced by an invented prerequisite: ' + row.identity);
            }
            if (prereq.decision.preferredSourceUnits?.length) fail(prereq.decision.preferredSourceUnits.includes(row.sourceComparison.sourceUnit),
                'Feature E1c complete optional alternative lost: ' + row.identity);
        }
        for (const m of a.materialFieldReconciliation) {
            counts.materialAxes++;
            fail(m.identity === row.identity && m.contentHash === row.contentHash && m.versionAuthorityUnresolved === true
                && row.coverageState === 'unresolved' && m.productionPolicyPromotion === false && m.behavioralVerification === 'not-run',
            'Feature E1c material source/version limit changed: ' + row.identity);
            if (m.axis === 'frequency-action-cost') fail(m.currentFrequency === system.frequency && equal(m.currentCost, system.cost ?? null)
                && equal(m.printedFrequencyAlternatives, units.get(m.sourceUnit)?.definition.frequencies) && equal(m.printedCosts, units.get(m.sourceUnit)?.definition.costs),
            'Feature E1c action/resource difference changed: ' + row.identity);
            else if (m.currentRule) fail(equal(m.currentRule, system.rules[m.ordinal]) && m.currentRuleHash === hash(system.rules[m.ordinal]),
                'Feature E1c added stat evidence changed: ' + row.identity);
            else fail(equal(m.currentRuleObjects, system.rules ?? []) && equal(m.currentRuleHashes, (system.rules ?? []).map(hash))
                && equal(m.currentKeywords, system.keywords) && m.currentEffect === system.effect,
            'Feature E1c material exact selector/grant evidence changed: ' + row.identity);
        }
        counts.executableObjects += a.executableSourceReview.length;
        fail(a.executableSourceReview.length === (system.rules ?? []).length && a.executableSourceReview.every((r, i) => r.ordinal === i
            && r.currentRuleHash === hash(system.rules[i]) && r.kind === system.rules[i].key
            && equal(r.sourceDefinitionIds.slice().sort(), comparisons.map(c => c.sourceUnit).sort()) && equal(r.sourceParentFrameIds, a.parentFrameIds)),
        'Feature E1c material executable source review missing: ' + row.identity);
        counts.dependencyRelationships += a.dependencyBindings.length;
        fail(equal(a.dependencyBindings.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash})),
            row.dependencyEvidence.map(d => ({target: d.target, paths: d.paths, targetContentHash: d.targetContentHash}))),
        'Feature E1c dependency source binding changed: ' + row.identity);
        for (const dep of a.dependencyBindings) {
            const old = dep.existingPublishedTargetReview, target = actualMap.get(dep.target);
            fail(dep.targetContentHash === (target?.contentHash ?? null) && dep.sourceTargetApproval === 'not-established-by-consumer' && dep.behavioralVerification === 'not-run',
                'Feature E1c exact target/hash changed: ' + row.identity);
            if (old) {
                const targetRow = bundle.files[old.recordFile]?.records.find(r => r.identity === dep.target);
                fail(targetRow && old.recordEvidenceSha256 === hash(targetRow) && old.currentContentHash === targetRow.contentHash
                    && old.coverageState === targetRow.coverageState && old.recordClass === targetRow.recordClass && equal(old.sources, targetRow.sources ?? [])
                    && dep.unpublishedTargetLimit === null, 'Feature E1c prior target review was substituted: ' + row.identity);
            } else if (dep.unpublishedTargetLimit && typeof dep.unpublishedTargetLimit === 'object') {
                const saved = frozen.get(dep.target);
                fail(saved && dep.unpublishedTargetLimit.frozenSlice === saved.slice && dep.unpublishedTargetLimit.currentContentHash === saved.hash,
                    'Feature E1c unaccepted frozen target was promoted: ' + row.identity);
            } else fail(typeof dep.unpublishedTargetLimit === 'string', 'Feature E1c unavailable target source limit missing: ' + row.identity);
        }
    }
    fail(equal(counts, {prerequisiteAxes: 54, materialAxes: 73, executableObjects: 507, dependencyRelationships: 337}),
        'Feature E1c itemized prerequisite/material/executable/dependency coverage changed');
}
