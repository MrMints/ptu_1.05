import {deriveConsumableUnit,consumableRawPrimitives,consumableComparableWords} from './consumable-source-derivation.mjs';

// Fresh original-PDF/cell/continuation review fixes these raw primitives.
// Derived fields and refreshed output hashes cannot replace this source basis.
const ORIGINAL_C_PRIMITIVES = '7fb5ae318387de9fe2c67592b15206ca7a06562d00e0a25a8451e14bf6a23189';
const values = ['effect','tier','baseCaptureModifier','printedPriceCell','priceFacts','weakeningBerryFacts','modificationCostFact','onceEverOnPokemon','derivedProductPriceFacts','parameterFacts'];

export function checkConsumableSourceReview(bundle, context) {
    const {audit,batch,rows,actualMap,hash,equal,textHash,words,fail,citations,cleanText} = context;
    const slice = batch.slices.find(s => s.id === 'E2c');if (!slice?.recordFile) return;
    const source = audit.consumableSource, closure = audit.completedSlices.E2c, parents = new Map(audit.parentContexts.map(p => [p.id,p]));
    const selectedParents = closure.parentContextIds.map(id => parents.get(id));
    fail(source?.sourceDefinitions?.length === 161 && hash(consumableRawPrimitives(source,selectedParents)) === ORIGINAL_C_PRIMITIVES,
        'E2c independently read raw source cells/prose/complete parents changed');
    fail(source.sourceDefinitionSetSemanticSha256 === hash(source.sourceDefinitions) && closure.consumableSourceDefinitionSetSemanticSha256 === hash(source.sourceDefinitions)
        && source.tableSetSemanticSha256 === hash(source.tables) && closure.consumableTableSetSemanticSha256 === hash(source.tables)
        && source.productionPolicyPromotion === false && source.behavioralVerification === 'not-run' && source.sourceAbsenceClaim === false,
    'E2c source inventory or source-only limits changed');
    const units = new Map(source.sourceDefinitions.map(u => [u.id,u])), derived = new Map();
    const comparable = value => consumableComparableWords(value,words);
    for (const unit of units.values()) {
        citations(unit);
        if (unit.tableAnchor) {
            const a = unit.tableAnchor, table = source.tables[String(a.pdfPage)]?.[a.tableIndex];
            fail(table && hash(table) === a.tableSemanticSha256 && equal(table.cells[a.rowIndex],a.rawCells), 'E2c exact raw table/cell association changed: ' + unit.id);
        } else {
            const a = unit.proseAnchor;
            fail(a.rawSha256 === textHash(a.rawText) && a.startLine >= 1 && a.endLine >= a.startLine && a.rawText.split('\n').length === a.endLine-a.startLine+1,
                'E2c prose boundary changed: ' + unit.id);
        }
        try {
            const expected = deriveConsumableUnit(unit,source.tables,parents,cleanText);derived.set(unit.id,expected);
            fail(values.every(key => equal(expected[key] ?? null,unit[key] ?? null))
                && equal(expected.effectViews,unit.effectViews.map(({text,parentContextIds,sourceKind}) => ({text,parentContextIds,sourceKind}))),
            'E2c derived fields/views do not reconstruct from raw source: ' + unit.id);
            fail(unit.effectWordsSha256 === textHash(words(expected.effect)) && unit.effectViews.every(v => v.wordsSha256 === textHash(words(v.text)))
                && unit.canonicalTargetClaim === false && unit.productionPolicyPromotion === false && unit.behavioralVerification === 'not-run',
            'E2c definition word hash or canonical/behavior limit changed: ' + unit.id);
        } catch (error) {fail(false,'E2c derived fields/views do not reconstruct from raw source: ' + unit.id + ' ' + String(error));}
    }
    const states = {}, kinds = {};let bodyMatches = 0, ruleCount = 0, referenceCount = 0;
    for (const [identity] of slice.members) {
        const row = rows.get(identity), doc = actualMap.get(identity)?.data, evidence = audit.currentRecordAudit[identity], detail = row?.sourceComparison.consumableReview;
        if (!doc || !detail || !evidence) {fail(false,'E2c complete item/source audit missing: ' + identity);continue;}
        fail(evidence.consumableReviewSha256 === hash(detail) && detail.fieldCorrespondenceOnly === true
            && detail.selectedVersionStatus === 'not-verified; no automatic adoption or blended-version authority'
            && detail.knownSourceDoesNotImplyExecution === true && detail.productionPolicyPromotion === false && detail.behavioralVerification === 'not-run',
        'E2c partial-field/selected-version/behavior limits changed: ' + identity);
        fail(equal(detail.currentLegacyMetadata,{quantity:doc.system.quantity,consumable:doc.system.consumable,automationPresent:Object.hasOwn(doc.system,'automation'),automation:doc.system.automation ?? null,
            useCountPresent:Object.hasOwn(doc.system,'useCount'),useCount:doc.system.useCount ?? null}) && doc.system.quantity === '1', 'E2c inherited scalar types/defaults changed: ' + identity);
        const cost = doc.system.cost, parsedPrice = cost == null || String(cost).trim() === '' ? null : /^\d+$/.test(String(cost)) ? Number(cost) : NaN;
        fail(!Number.isNaN(parsedPrice), 'E2c current price has an unexamined nonliteral expression: ' + identity);
        let body = false, price = false, base = null;
        const expectedFacts = [];
        for (const comparison of detail.sourceComparisons) {
            const unit = units.get(comparison.sourceUnit), expected = derived.get(comparison.sourceUnit);
            if (!unit || !expected) {fail(false,'E2c unknown/unreconstructed source candidate: ' + identity);continue;}
            const matching = expected.effectViews.flatMap((v,i) => comparable(v.text) === comparable(doc.system.effect) ? [i] : []);
            let priceFacts = expected.priceFacts;
            if (expected.modificationCostFact) priceFacts = [{amount:expected.modificationCostFact.cash,role:'modification-fee-plus-existing-ball',requiredIngredient:expected.modificationCostFact.requiredIngredient,retailPriceEstablished:false}];
            if (expected.derivedProductPriceFacts?.[doc.name]) priceFacts = [expected.derivedProductPriceFacts[doc.name]];
            const priceMatches = priceFacts.length ? priceFacts.some(f => f.amount === parsedPrice) : parsedPrice === null;
            const baseMatches = unit.kind === 'capture-ball' ? typeof doc.system.modifier === 'number' && doc.system.modifier === expected.baseCaptureModifier : null;
            fail(comparison.sourceEvidenceSha256 === hash(unit) && equal(comparison.matchingEffectViewIndices,matching)
                && comparison.currentEffectComparableSha256 === textHash(comparable(doc.system.effect))
                && equal(comparison.sourceViewComparableSha256,expected.effectViews.map(v => textHash(comparable(v.text))))
                && equal(comparison.priceFacts,priceFacts) && comparison.currentParsedPrice === parsedPrice && comparison.priceCorrespondence === priceMatches
                && comparison.currentBaseModifierPresent === Object.hasOwn(doc.system,'modifier') && comparison.currentBaseModifierValue === (doc.system.modifier ?? null)
                && comparison.sourceBaseModifierValue === expected.baseCaptureModifier && comparison.baseModifierCorrespondence === baseMatches,
            'E2c source/current amount, condition, tier, price role or modifier comparison changed: ' + identity);
            expectedFacts.push({sourceUnit:unit.id,kind:unit.kind,effect:expected.effect,tier:expected.tier,priceFacts,
                weakeningBerryFacts:expected.weakeningBerryFacts ?? null,modificationCostFact:expected.modificationCostFact ?? null,onceEverOnPokemon:expected.onceEverOnPokemon ?? null});
            body ||= matching.length > 0;price ||= priceMatches;if (baseMatches !== null) base = baseMatches;
        }
        const state = body && price && base !== false ? 'reviewed' : 'unresolved';
        fail(equal(detail.sourceFacts,expectedFacts) && detail.currentEffectComparableSha256 === textHash(comparable(doc.system.effect))
            && detail.bodyCorrespondence === body && detail.priceCorrespondence === price && detail.baseModifierCorrespondence === base && row.coverageState === state,
        'E2c field correspondence or precise unresolved disposition bypassed source evidence: ' + identity);
        states[row.coverageState] = (states[row.coverageState] ?? 0) + 1;
        const kind = detail.sourceComparisons.length ? units.get(detail.sourceComparisons[0].sourceUnit)?.kind : 'current-authoring-limit';kinds[kind] = (kinds[kind] ?? 0) + 1;
        bodyMatches += Number(body);ruleCount += evidence.currentRules.length;referenceCount += evidence.references.length;
    }
    fail(equal(states,closure.counts) && equal(kinds,closure.sourceKindCounts) && bodyMatches === closure.bodyCorrespondences
        && ruleCount === closure.currentRules && referenceCount === closure.exactReferences, 'E2c source/field/implementation aggregate counts disagree');
}
