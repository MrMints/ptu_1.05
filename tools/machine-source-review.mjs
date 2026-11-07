// Printed machine evidence only. Label claims locate source candidates; they
// never select document IDs, active rules, prices or acquisition behavior.
export function parsePrintedMachineCells(label, cost) {
    const code = String(label ?? '').replace(/\s+/g,' ').trim().match(/^(A?\d+)\s*-\s*(.+)$/);
    const price = String(cost ?? '').match(/^\$(\d+)$/);
    return code && price ? {machineCode:code[1], moveLabelForDiscovery:code[2], price:Number(price[1]), teachingRoute:code[1].startsWith('A') ? 'HM' : 'TM'} : null;
}

export function checkMachineSourceReview(bundle, context) {
    const {audit, batch, rows, actualMap, hash, equal, textHash, words, fail, citations} = context;
    const slice = batch.slices.find(s => s.id === 'E2b');
    if (!slice?.recordFile) return;
    const table = audit.machineSourceTable, closure = audit.completedSlices.E2b;
    citations(table);
    fail(table?.entries?.length === 106 && new Set(table.entries.map(e => e.id)).size === 106 && table.tables.length === 2
        && table.tableSemanticSha256 === hash(table.tables) && table.entrySemanticSha256 === hash(table.entries)
        && closure.machineSourceTableSemanticSha256 === hash(table) && table.productionPolicyPromotion === false && table.behavioralVerification === 'not-run',
    'E2b original numbered/cost table incomplete or changed');
    const entries = new Map((table?.entries ?? []).map(e => [e.id,e]));
    for (const entry of entries.values()) {
        const cells = table.tables[entry.tableIndex]?.cells[entry.rowIndex], parsed = parsePrintedMachineCells(entry.rawLabelCell,entry.rawCostCell);
        fail(cells?.[entry.entryColumn] === entry.rawLabelCell && cells?.[entry.entryColumn + 1] === entry.rawCostCell && parsed
            && Object.entries(parsed).every(([key,value]) => entry[key] === value) && entry.canonicalTargetClaim === false && entry.productionPolicyPromotion === false,
        'E2b table label/price/cell association changed: ' + entry.id);
    }
    const key = value => words(value).replace(/[^a-z0-9]/g,'');
    const counts = {}, targetStates = {}, historyCounts = {}, changed = [];
    for (const [identity] of slice.members) {
        const row = rows.get(identity), evidence = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, machine = row?.sourceComparison.machineReview;
        if (!doc || !machine || !evidence) {fail(false,'E2b machine facts missing: ' + identity);continue;}
        const embed = doc.system.effect.match(/^@Embed\[Compendium\.ptu\.moves\.Item\.([A-Za-z0-9]{16})\]$/), label = doc.name.match(/^TM(\d+) - (.+)$/);
        const targetIdentity = embed ? `moves.${embed[1]}` : null, target = actualMap.get(targetIdentity)?.data, targetRow = rows.get(targetIdentity);
        fail(embed && target && targetRow && evidence.machineReviewSha256 === hash(machine)
            && machine.literalEmbed === doc.system.effect && machine.targetIdentity === targetIdentity
            && machine.targetSourceEvidenceSha256 === hash(targetRow) && machine.targetSourceCoverageState === targetRow.coverageState
            && equal(machine.targetSourceRuleVersionReview,targetRow.ruleVersionReview), 'E2b exact embedded target/source disposition changed: ' + identity);
        fail(label && equal(machine.currentClaim, {fieldPath:'$.name',literalLabel:doc.name,machineCodeForDiscoveryOnly:label[1],moveConceptForDiscoveryOnly:label[2],limitation:'The label is a comparison claim only, never a persistent identifier, source identity or behavior selector.'})
            && row.coverageState === 'unresolved' && [null,''].includes(doc.system.cost) && machine.currentPriceStatus === 'unpriced-inherited-field-not-zero'
            && [1,'1'].includes(doc.system.quantity) && machine.currentQuantityValue === doc.system.quantity && doc.system.consumable === true && doc.system.rules.length === 0 && doc.system.automation.length === 0
            && machine.productionPolicyPromotion === false && machine.behavioralVerification === 'not-run', 'E2b unpriced current wrapper or scope limit changed: ' + identity);
        if (!label || !target) continue;
        const byCode = table.entries.filter(e => e.machineCode === label[1]), byConcept = table.entries.filter(e => key(e.moveLabelForDiscovery) === key(label[2]));
        const expected = [...new Map([...byCode,...byConcept].map(e => [e.id,e])).values()];
        const same = !!(byCode.length && byConcept.some(e => e.id === byCode[0].id));
        fail(equal(machine.originalTableRows,expected) && machine.sameOriginalCodeAndConcept === same, 'E2b code/concept/route candidates blended: ' + identity);
        const countKey = same ? 'same-code-and-concept' : 'code/concept differs-or-untraced';counts[countKey] = (counts[countKey] ?? 0) + 1;
        targetStates[targetRow.coverageState] = (targetStates[targetRow.coverageState] ?? 0) + 1;
        for (const attestation of machine.profileMachineAttestations) {
            const example = attestation.firstCompleteSectionExample;
            citations(example);
            fail(example.book === attestation.book && example.code === attestation.printedMachineCode && example.printedLabel === attestation.printedLabelForDiscovery
                && key(example.printedLabel) === key(label[2]) && example.sectionAnchor.startLine >= 1 && example.sectionAnchor.endLine >= example.sectionAnchor.startLine
                && attestation.occurrences > 0 && attestation.interpretation.includes('not supply a global price'), 'E2b profile attestation promoted or changed: ' + identity);
        }
        fail(machine.historicalLiteralComparisons.length === 4 && machine.historicalLiteralComparisons.every((comparison,i) => {
            const historic = evidence.exportLineage.snapshots[i], old = historic.historicalNormativeValues?.effect ?? doc.system.effect, exact = words(old) === words(target.system.effect);
            const category = exact ? 'equal-literal-body' : 'different-literal-body';historyCounts[category] = (historyCounts[category] ?? 0) + 1;
            return comparison.revision === historic.revision && historic.recordFound === true && comparison.historicalRootEffectSha256 === textHash(words(old))
                && comparison.currentResolvedTargetEffectSha256 === textHash(words(target.system.effect)) && comparison.exactOrderedWords === exact
                && (exact ? comparison.wordDifferences.length === 0 : comparison.wordDifferences.length > 0);
        }), 'E2b historical literal/current Move bodies blended: ' + identity);
        if (machine.historicalLiteralComparisons.some(c => !c.exactOrderedWords)) changed.push(identity);
    }
    fail(equal(counts,closure.machineNumberCorrespondences) && equal(targetStates,closure.targetSourceStates) && equal(historyCounts,closure.historicalLiteralComparisons)
        && equal(changed,closure.differentHistoricalBodyIdentities), 'E2b table/target/historical aggregate observations disagree');
}
