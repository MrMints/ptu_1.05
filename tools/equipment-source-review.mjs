import {deriveEquipmentUnit,equipmentRawPrimitives,equipmentComparableWords,equipmentReferenceLiterals} from './equipment-source-derivation.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const ORIGINAL_D_PRIMITIVES = 'c71f3190f6051f0bab3d96d89232285efe6cfe0ddc141a16b9000ccb719d46fb';
// Explicit source/implementation contradictions examined in this frozen slice.
const AUTHORITY_LIMITS = new Set(['JbBaAO3Yhz5ktBTe','50oppn6s7DqVi98x','Eb8mMJjJwp00VDoM','0brhQceJnMPR1A1E','2ATwCwaqgiRPmWNi','7BXZMJOuJfLRxJkb','CCeFV1vugoyDAu3c','NyQoentFRsblfiD9','2e0raLBaUD59XRdB','Vi8Xv56BQkGvoo9o','kVo2xHSoM0AMvZs0','MDrPagcMCLgcfebb','JpfkXVU1CrkQP937','horp5SPziquIVMF5','vabigvqHJ9OqFM0V','jw8mH3AFRX9PXDnT','amyGa2iDJk9KgbQM'].map(id => `items.${id}`));
export function equipmentDisposition(identity,body,price,category) {
    return body && price && !AUTHORITY_LIMITS.has(identity) && category !== 'mega-stone-framework-and-exact-effect-target' ? 'reviewed' : 'unresolved';
}

export function checkEquipmentSourceReview(bundle, context) {
    const {audit,batch,rows,actualMap,hash,equal,textHash,words,fail,citations,cleanText} = context;
    const slice = batch.slices.find(s => s.id === 'E2d');if (!slice?.recordFile) return;
    const source = audit.equipmentSource, closure = audit.completedSlices.E2d, parents = new Map(audit.parentContexts.map(p => [p.id,p]));
    const selectedParents = closure.parentContextIds.map(id => parents.get(id));
    fail(source?.units?.length === 207 && hash(equipmentRawPrimitives(source,selectedParents)) === ORIGINAL_D_PRIMITIVES,
        'E2d independently read raw source cells/prose/complete parents changed');
    fail(source.sourceDefinitionSetSemanticSha256 === hash(source.units) && closure.equipmentSourceDefinitionSetSemanticSha256 === hash(source.units)
        && source.tableSetSemanticSha256 === hash(source.tables) && closure.equipmentTableSetSemanticSha256 === hash(source.tables)
        && source.productionPolicyPromotion === false && source.behavioralVerification === 'not-run' && source.sourceAbsenceClaim === false,
    'E2d source inventory or source-only limits changed');
    const units = new Map(source.units.map(u => [u.id,u])), derived = new Map(), comparable = value => equipmentComparableWords(value,words);
    fail(units.size === source.units.length,'E2d duplicate source definition');
    for (const unit of units.values()) {
        citations(unit);
        if (unit.tableAnchor) {
            const a = unit.tableAnchor, table = source.tables[String(unit.pdfPage)]?.[a.tableIndex];
            fail(table && equal(table.cells[a.rowIndex],a.rawCells),'E2d exact raw table/cell association changed: '+unit.id);
        } else {
            const a = unit.proseAnchor;
            fail(a.rawSha256 === textHash(a.rawText) && a.startLine >= 1 && a.endLine >= a.startLine
                && (a.segments ? a.rawText === a.segments.map(s => s.rawText).join('\n') && a.segments.every(s => s.rawText.split('\n').length === s.endLine-s.startLine+1)
                    : a.rawText.split('\n').length === a.endLine-a.startLine+1),'E2d complete prose continuation boundary changed: '+unit.id);
        }
        try {
            const expected = deriveEquipmentUnit(unit,source.tables,parents,cleanText);derived.set(unit.id,expected);
            fail(['effect','priceFacts','equipmentSlots','effectViews'].every(k => equal(unit[k],expected[k])),
                'E2d derived fields/views do not reconstruct from raw source: '+unit.id);
        } catch (error) {fail(false,'E2d source reconstruction failed: '+unit.id+' '+String(error));}
        fail(unit.canonicalIdentityClaim === false && unit.productionPolicyPromotion === false && unit.behavioralVerification === 'not-run'
            && unit.sourceKind === (unit.book === 'core' ? 'standard-core' : ['may','sep'].includes(unit.book) ? 'optional-playtest' : 'supplemental-source'),
        'E2d source kind, identity or behavior limits changed: '+unit.id);
    }
    const snapshots = new Map(source.targetSnapshots.map(s => [s.identity,s]));
    fail(snapshots.size === 93 && closure.equipmentTargetSnapshotSetSemanticSha256 === hash(source.targetSnapshots),'E2d exact direct-target inventory changed');
    // A frozen checkpoint describes the source dispositions available when its
    // slice was examined. Later F/G/H work must not rewrite that prior evidence.
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'E2', 'E2d');
    const checkPrior = (id,claim) => {const prior=priorIds.has(id)?rows.get(id):null;return equal(claim,prior ? {coverageState:prior.coverageState,evidenceSha256:hash(prior)} : null);};
    for (const snapshot of snapshots.values()) {
        const actual = actualMap.get(snapshot.identity);
        fail(actual && actual.contentHash === snapshot.contentHash && equal(actual.data,snapshot.document) && checkPrior(snapshot.identity,snapshot.priorSourceReview),
            'E2d complete direct-target/prior-source snapshot changed: '+snapshot.identity);
        const expected = equipmentReferenceLiterals(snapshot.document.system ?? {}).filter(r => r.resolution === 'current-repository-target');
        fail(equal(expected,snapshot.dependencies.map(({path,literalUuid,resolution}) => ({path,literalUuid,resolution}))),'E2d nested UUID path changed: '+snapshot.identity);
        for (const reference of snapshot.dependencies) {
            const target = actualMap.get(reference.targetIdentity);
            fail(reference.targetContentHash === (target?.contentHash ?? null) && equal(reference.targetSystem,target?.data.system ?? null)
                && reference.targetSystemSha256 === (target ? hash(target.data.system ?? null) : null) && checkPrior(reference.targetIdentity,reference.priorSourceReview)
                && reference.interpretation.includes('No effect execution'),'E2d nested target/system/prior source changed: '+snapshot.identity+' '+reference.path);
        }
    }
    const states = {}, categories = {};let bodyCount=0, rules=0, references=0;
    for (const [identity] of slice.members) {
        const row=rows.get(identity),doc=actualMap.get(identity)?.data,e=audit.currentRecordAudit[identity],detail=row?.sourceComparison.equipmentReview;
        if (!doc || !e || !detail) {fail(false,'E2d complete item/source audit missing: '+identity);continue;}
        fail(e.equipmentReviewSha256 === hash(detail) && detail.fieldCorrespondenceOnly === true && detail.knownSourceDoesNotImplyExecution === true
            && detail.selectedVersionStatus === 'not-verified; no automatic adoption or blended-version authority'
            && detail.productionPolicyPromotion === false && detail.behavioralVerification === 'not-run' && detail.interpretation.length > 100,
        'E2d partial-field/selected-version/behavior limits changed: '+identity);
        fail(equal(detail.currentOtherFields,Object.fromEntries(Object.entries(doc).filter(([k]) => !['system','effects'].includes(k))))
            && equal(detail.currentClaimFacts,row.sourceComparison.currentClaims) && equal(detail.referenceLiterals,equipmentReferenceLiterals(doc))
            && equal(detail.exactTargetIdentities,[...new Set(e.references.map(r => r.targetIdentity))]) && detail.exactTargetIdentities.every(id => snapshots.has(id)),
        'E2d current metadata, claim or literal reference path changed: '+identity);
        const parsed = doc.system.cost == null || String(doc.system.cost).trim() === '' ? null : /^\d+$/.test(String(doc.system.cost)) ? Number(doc.system.cost) : NaN;
        fail(!Number.isNaN(parsed),'E2d unexamined price expression: '+identity);
        let body=false,price=false;
        for (const comparison of detail.sourceComparisons) {
            const unit=units.get(comparison.sourceUnit),expected=derived.get(comparison.sourceUnit);
            if (!unit || !expected) {fail(false,'E2d missing source candidate: '+identity);continue;}
            const matching=expected.effectViews.flatMap((v,i) => comparable(v.text) === comparable(doc.system.effect) ? [i] : []);
            const pm=expected.priceFacts.length ? expected.priceFacts.some(f => f.amount === parsed) : parsed === null;
            fail(comparison.sourceEvidenceSha256 === hash(unit) && equal(comparison.matchingEffectViewIndices,matching)
                && comparison.currentEffectComparableSha256 === textHash(comparable(doc.system.effect))
                && equal(comparison.sourceViewComparableSha256,expected.effectViews.map(v => textHash(comparable(v.text))))
                && equal(comparison.priceFacts,expected.priceFacts) && comparison.currentParsedPrice === parsed && comparison.priceCorrespondence === pm,
            'E2d current/source amount, condition, slot, price or role comparison changed: '+identity);
            body ||= matching.length>0;price ||= pm;
        }
        fail(detail.bodyCorrespondence === body && detail.priceCorrespondence === price && detail.currentEffectComparableSha256 === textHash(comparable(doc.system.effect))
            && row.coverageState === equipmentDisposition(identity,body,price,detail.category),'E2d source correspondence or authority disposition bypassed: '+identity);
        states[row.coverageState]=(states[row.coverageState]??0)+1;categories[detail.category]=(categories[detail.category]??0)+1;
        bodyCount+=Number(body);rules+=e.currentRules.length;references+=e.references.length;
    }
    fail(equal(states,closure.counts) && equal(categories,closure.categoryCounts) && bodyCount===closure.bodyCorrespondences
        && rules===closure.currentRules && references===closure.exactReferences,'E2d source/current aggregate counts changed');
}
