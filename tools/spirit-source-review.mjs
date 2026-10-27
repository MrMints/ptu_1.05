const ORIGINAL_E_CONTEXT = 'd67ae5983f5046a82bcf29d41f35e578ea57e3047546a835432e843b692b53e7';
const REST_CLAUSE = 'You can only gain this effect during an Extended Rest, and the effect ends when you take your next Extended Rest.';
export function checkSpiritSourceReview(bundle,context) {
    const {audit,batch,rows,actualMap,hash,equal,textHash,words,fail}=context;
    const slice=batch.slices.find(s=>s.id==='E2e');if(!slice?.recordFile)return;
    const closure=audit.completedSlices.E2e,source=audit.spiritSource,native=audit.nativeContexts.find(n=>n.pageId===source.nativePointerPageId),parents=closure.parentContextIds.map(id=>audit.parentContexts.find(p=>p.id===id));
    fail(hash({parents:parents.map(({id,source,sourceKind,rawText})=>({id,source,sourceKind,rawText})),nativePageSha256:native?.pageJsonSha256})===ORIGINAL_E_CONTEXT,
        'E2e independently examined original/native context changed');
    fail(source.sourceStatus==='complete-action-authoring-not-established-by-approved-local-artifacts' && source.independentActionDefinitions===0
        && source.nativePointerPageId==='p1lv6FIGyWpjIpmK' && source.nativePointerPageSha256===native?.pageJsonSha256
        && source.externalAuthoringLocator==='https://1e.ptr.wiki/Rules/Playtests/Spirit-Friendship' && native?.rawText.includes(source.externalAuthoringLocator)
        && source.sourceAbsenceClaim===false && source.productionPolicyPromotion===false && source.behavioralVerification==='not-run'
        && source.fullCurrentClaimsPreserved===true && closure.spiritSourceSemanticSha256===hash(source),
    'E2e navigation/history promoted to complete authoring or behavior');
    let rest=0;const historical={};
    for(const key of ['effect','cost','trigger','active'])historical[key]={pairs:0,equal:0};
    for(const [identity]of slice.members){
        const row=rows.get(identity),e=audit.currentRecordAudit[identity],d=row?.sourceComparison.spiritReview,doc=actualMap.get(identity)?.data;
        if(!row||!e||!d||!doc){fail(false,'E2e exact current action audit missing: '+identity);continue;}
        const s=doc.system,isRest=s.effect.includes(REST_CLAUSE);rest+=Number(isRest);
        fail(e.spiritReviewSha256===hash(d) && d.currentCost===s.cost && d.currentTrigger===s.trigger && d.currentActive===s.active && d.restOnlyClausePresent===isRest
            && typeof s.cost==='string' && ['1','2','3'].includes(s.cost) && typeof s.active==='boolean' && (!isRest||s.active===false&&s.trigger==='Extended Action')
            && equal(d.currentOtherFields,Object.fromEntries(Object.entries(doc).filter(([k])=>!['system','effects'].includes(k))))
            && equal(d.currentClaims,row.sourceComparison.currentClaims) && words(d.currentClaims.map(c=>c.text).join(' '))===words(s.effect)
            && d.currentClaims.every(c=>c.normalizedSha256===textHash(words(c.text))) && s.rules.length===0 && e.references.length===0,
        'E2e complete current cost/trigger/active/conditional claims changed: '+identity);
        fail(row.coverageState==='unresolved' && d.completeSpiritActionAuthoringEstablished===false && d.nativeAuthorityStatus==='external-navigation-and-inherited-original-context-only'
            && d.nativePointerPageId===source.nativePointerPageId && d.nativePointerPageSha256===native.pageJsonSha256 && d.externalAuthoringLocator===source.externalAuthoringLocator
            && d.authoringArtifactLimit.length>100 && d.specificClaimAssessment.length>100 && d.fieldCorrespondenceOnly===true
            && d.selectedVersionStatus==='not-verified; no automatic adoption or blended-version authority' && d.productionPolicyPromotion===false && d.behavioralVerification==='not-run',
        'E2e unavailable action authority, identity or selected-version limit bypassed: '+identity);
        for(const snap of e.exportLineage.snapshots)for(const key of Object.keys(historical)){
            const comparison=snap.fieldComparisons.find(f=>f.recordFieldPath===`system.${key}`);historical[key].pairs++;historical[key].equal+=Number(comparison?.equal===true);
        }
    }
    fail(equal(historical,source.historicalClaimComparisons) && Object.values(historical).every(v=>v.pairs===136&&v.equal===136)
        && rest===12 && closure.restOnlyActions===rest && closure.currentRules===0 && closure.exactReferences===0 && equal(closure.counts,{unresolved:34}),
    'E2e exact historical/current source-only census changed');
}
