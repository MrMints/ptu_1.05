import {readFile} from 'node:fs/promises';
import {H_PINS} from './journal-source-pins.mjs';
import {jsonHash as digest,textHash,journalPages,journalMetadata,journalPageFacts,journalFieldDifferences,journalCriticalFacts,journalCriticalFactErrors,journalVirtuosoFacts,journalVirtuosoFactErrors} from './journal-source-derivation.mjs';

const AUDIT='journal-source-evidence-h.json', RECORDS='record-source-review/journals.json';
const hash=value=>value===undefined?null:digest(value);
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export async function loadJournalSourceReview() {
    let journalSource=null;
    try {journalSource=await json('docs/data/'+AUDIT);} catch(e) {if(e.code!=='ENOENT')throw e;}
    const journalPriorHashes=Object.fromEntries(await Promise.all(Object.keys(H_PINS.priorData).map(async path=>[path,hash(await json(path))])));
    return {journalSource,journalPriorHashes};
}

// Validate the actual current H bundle, never an F/G historical projection.
// Hashes bind completed manual examinations; fresh literal derivation also
// checks exact page paths, full tables/references, source roles and deltas.
export function checkJournalSourceReview(bundle,{fail,actualMap,rows,citations=()=>{}}) {
    const a=bundle.journalSource,h=bundle.batchManifest?.batches.find(b=>b.id==='H');
    fail(a&&bundle.index.journalSourceEvidence===AUDIT,'H source evidence missing or current index concealed');
    if(!a)return;
    fail(!bundle.historicalSourceView,'H current validation received a historical source projection');
    fail(a.schemaVersion===1&&a.batch==='H'&&a.startingRevision==='b65acfe057258627dfdbdca648e4e0ace622bc69','H original admission checkpoint changed');
    fail(a.scope===H_PINS.scope&&same(a.acceptedBaseCi,H_PINS.acceptedBaseCi),'H Generations1–8 scope or accepted-base CI evidence changed');
    fail(a.membershipSha256===H_PINS.membership&&h?.membershipSha256===H_PINS.membership&&same(a.originalTuples,H_PINS.tuples)&&same(h?.members,H_PINS.tuples),'H frozen parent tuples changed');
    fail(a.sourceFingerprint===H_PINS.sourceFingerprint&&bundle.index.sourceFingerprint===H_PINS.sourceFingerprint&&a.diagnosticSha256===H_PINS.diagnostic&&bundle.batchManifest?.candidateSnapshot.sha256===H_PINS.diagnostic,'H source fingerprint/diagnostic changed');
    fail(hash(bundle.batchManifest.batches.filter(b=>b.id!=='H'))===H_PINS.nonHMetadata&&a.nonHMetadataSemanticSha256===H_PINS.nonHMetadata,'H earlier acceptance or nonH metadata changed');
    fail(hash(bundle.batchManifest.batches.map(b=>[b.id,b.membershipSha256,b.members]))===H_PINS.allMemberships,'H all-nine frozen memberships changed');
    fail(a.acceptedGSourceRevision==='b1de70bfb2a3e30fd6454c4e7f04195693a54464'&&a.acceptedGSourceEvidenceSemanticSha256==='a7a0a988cddcf15ace07f1c54dbb2f8dc62088d3d6badb1814527ff116366ba7'&&hash(bundle.organizationalSource)===a.acceptedGSourceEvidenceSemanticSha256,'H accepted G source checkpoint changed');
    fail(same(a.priorPayloadPins,H_PINS.priorPayloads)&&Object.entries(H_PINS.priorPayloads).every(([p,pin])=>hash(bundle.files[p])===pin),'H prior45 source payloads changed');
    fail(same(a.priorDataPins,H_PINS.priorData)&&same(bundle.journalPriorHashes,H_PINS.priorData),'H prior95 data artifacts/19 whole audits changed');
    fail(a.sourceExaminationComplete===true&&a.fullHAcceptance===false&&a.pendingIndependentCoordinatorAndPlannerAcceptance===true&&a.full04Acceptance===false&&a.OPEN05===false&&a.productionPolicyPromotion===false&&a.behavioralVerification==='not-run'&&a.sourceAbsenceClaim===false,'H source examination promoted acceptance/content/behavior or invented absence');
    fail(hash(a.boundaries)===H_PINS.boundaries&&Object.values(a.boundaries??{}).every(v=>v===false),'H scope/acquisition/variant/world/image/runtime boundaries changed');
    fail(hash(a.sourceKindRules)===H_PINS.sourceKinds,'H optional source kinds or independent adaptation limits changed');
    fail(h?.status==='source-comparisons-complete'&&h.slices.length===1&&h.slices[0].id==='H1'&&h.slices[0].recordFile===RECORDS&&same(h.slices[0].members,H_PINS.tuples),'H current slice closure missing or altered');
    const pending=h?.acceptance?.status==='pending-substantive-review';
    const accepted=h?.acceptance?.status==='accepted-source-examination'
        &&h.acceptance.revision==='11e9bd1af5350939aed7a94c1e49f575e5438029'
        &&h.acceptance.ciRun===40975872374&&h.acceptance.documentationJob===123803628738&&h.acceptance.validationJob===123803628461
        &&h.acceptance.sourceEvidenceSemanticSha256===hash(a)
        &&same(h.acceptance.reviewedCounts,{reviewed:1,unresolved:1})
        &&same(h.acceptance.embeddedPageCounts,{correspondence:194,metadata:9,unresolved:68})
        &&h.acceptance.validationReport==='docs/validation/2026-10-29-h-source-review.md#substantive-full-h-acceptance'
        &&h.acceptanceHistory?.length===1&&h.acceptanceHistory[0].status==='pending-substantive-review'
        &&h.acceptanceHistory[0].sourceEvidenceSemanticSha256===hash(a);
    fail((pending||accepted)&&bundle.index.OPEN05===false
        &&(!bundle.index.full04SourceAcceptance||accepted),'H independent acceptance/full04/05 gate changed');
    const recordFile=bundle.files[RECORDS];
    fail(recordFile&&hash(recordFile)===H_PINS.records&&a.closure?.recordEvidenceSemanticSha256?.H1===H_PINS.records,'H root record evidence changed');
    fail(hash(a.rootExaminations)===H_PINS.roots&&hash(a.pageExaminations)===H_PINS.pages&&a.closure?.pageEvidenceSemanticSha256===H_PINS.pages,'H manually examined root/page findings changed');
    fail(hash(a.sourceRegistry)===H_PINS.registry&&a.closure?.sourceRegistrySemanticSha256===H_PINS.registry,'H examined original coordinate registry changed');
    fail(hash(a.sourcePrimitives)===H_PINS.primitives&&a.closure?.sourcePrimitivesSemanticSha256===H_PINS.primitives,'H bounded original excerpts/roles changed');
    fail(hash(a.originalVisualExaminations)===H_PINS.qa&&a.originalVisualExaminations?.length===36&&a.originalVisualExaminations.every(q=>q.visualInspectionComplete&&q.matchesCachedExtraction),'H actual original raster examination evidence changed');
    if(!Array.isArray(a.pageExaminations)||!a.rootExaminations||!a.sourceRegistry||!Array.isArray(a.sourcePrimitives))return;
    const pages=[];
    for(const [identity,pin] of H_PINS.tuples) {
        const actual=actualMap.get(identity),root=a.rootExaminations[identity],row=rows.get(identity);
        fail(actual&&hash(actual.data)===pin&&root?.contentHash===pin&&row?.contentHash===pin,'H actual frozen parent/hash missing: '+identity);
        if(!actual||!root)continue;
        let children;
        try {children=journalPages(identity,actual.data);} catch(e) {fail(false,'H actual page identities malformed: '+identity);continue;}
        pages.push(...children);
        fail(same(root.allTopLevelFields,Object.keys(actual.data))&&same(root.metadata,journalMetadata(actual.data))&&same(root.storedPageIds,actual.data.pages.map(p=>p._id)),'H parent complete metadata/order changed: '+identity);
        fail(same(root.pageExaminationIdentities,children.map(p=>p.identity))&&root.sourceExaminationComplete===true,'H parent lacks every exact embedded page: '+identity);
        fail(root.recordEvidenceSemanticSha256===hash(row),'H root examination/record evidence disagree: '+identity);
        const exams=a.pageExaminations.filter(p=>p.parentIdentity===identity);
        const citedPaths=new Set(exams.flatMap(p=>p.examinedOriginalContexts).map(id=>a.sourceRegistry?.[id]?.path));
        fail(row?.sources?.filter(s=>s.path?.startsWith('Core System/')).length===citedPaths.size&&row.sources.filter(s=>s.path?.startsWith('Core System/')).every(s=>citedPaths.has(s.path)),'H root citations do not match its actually examined page contexts: '+identity);
        fail(same(row?.sourceComparison?.journalReview?.pageEvidence,exams.map(p=>[p.identity,hash(p)])),'H root page evidence binding changed: '+identity);
        fail(row?.coverageState===(identity===H_PINS.tuples[0][0]?'unresolved':'reviewed'),'H root disposition changed: '+identity);
    }
    fail(pages.length===271&&a.pageExaminations.length===271&&new Set(a.pageExaminations.map(p=>p.identity)).size===271,'H 271 exact page examinations missing/duplicated');
    const pageIds=new Set(pages.map(p=>p.identity)),prior=new Map(Object.entries(bundle.files).filter(([p])=>Object.hasOwn(H_PINS.priorPayloads,p)).flatMap(([file,f])=>f.records.map(row=>[row.identity,{file,row}])));
    const pageById=new Map(pages.map(p=>[p.identity,p]));let tables=0,enrichers=0,media=0;
    for(const [index,p] of pages.entries()) {
        const exam=a.pageExaminations[index];
        fail(exam?.identity===p.identity&&exam.parentIdentity===p.parentIdentity&&exam.index===p.index&&exam.path===p.path&&exam.pageHash===p.pageHash,'H exact stored page identity/order/path/hash changed: '+p.identity);
        if(!exam)continue;
        const facts=journalPageFacts(p,pageIds,prior);
        fail(same(exam.currentExtraction,facts),'H literal full-page extraction/table/reference/metadata mismatch: '+p.identity);
        tables+=facts.html.tables.length;enrichers+=facts.enrichers.length;media+=facts.html.media.length;
        fail(typeof exam.specificAssessment==='string'&&exam.specificAssessment.length>=80&&textHash(exam.specificAssessment)===exam.assessmentTextSha256,'H specific source interpretation absent or changed: '+p.identity);
        fail(exam.examinedOriginalContexts?.every(c=>Object.hasOwn(a.sourceRegistry,c)),'H examination cites unexamined original context: '+p.identity);
        fail(exam.sourceExaminationComplete===true&&exam.currentFullBodyAndMetadataActuallyRead===true&&exam.fullAvailableSourceHistoryAndAlternativeContextsExamined===true&&exam.sourceAbsenceClaim===false&&exam.canonicalRelationshipClaim===false&&exam.wholeCurrentVersionApproved===false&&exam.supportedGenerationApproved===false&&exam.productionPolicyPromotion===false&&exam.actualBehavior==='not-run','H page interpretation promoted current identity/version/behavior: '+p.identity);
    }
    fail(tables===22&&enrichers===690&&media===2,'H complete native table/reference/remote-figure inventory changed');
    const refs=new Map(bundle.references.documents.map(r=>['Core System/'+r.path,r]));
    fail(Object.keys(a.sourceRegistry).length===493&&a.sourcePrimitives.length===13,'H original coordinate/excerpt coverage changed');
    for(const [id,s] of Object.entries(a.sourceRegistry)) {
        const ref=refs.get(s.path);
        fail(s.id===id&&ref?.sha256===s.sha256&&s.pdfPages?.length===1&&s.pdfPages[0]>=1&&s.pdfPages[0]<=ref.pdfPages&&s.canonicalRelationshipClaim===false&&s.currentTargetVersionApproved===false,'H exact original source coordinate/citation changed: '+id);
    }
    for(const p of a.sourcePrimitives) {
        const context=a.sourceRegistry[p.coordinate];
        fail(p.textSha256===textHash(p.text)&&p.rawSourcePageTextSha256===context?.rawSourcePageTextSha256&&same(p.citation,{path:context?.path,sha256:context?.sha256,pdfPages:context?.pdfPages})&&p.normalizedStart>=0,'H original excerpt/source coordinate mismatch: '+p.id);
    }
    const critical=journalCriticalFacts(pages,a.sourcePrimitives);
    fail(same(critical,a.sourceCriticalFacts),'H reported source critical facts disagree with literal source/native roles');
    for(const error of journalCriticalFactErrors(critical))fail(false,error);
    const virtuoso=journalVirtuosoFacts(pages,a.pageExaminations,a.sourceRegistry,bundle.featureSource?.sourceDefinitions?.find(u=>u.id==='core:52:feature-line54'));
    for(const error of journalVirtuosoFactErrors(virtuoso))fail(false,error);
    const hist=a.history;
    fail(hist&&hash(hist)===H_PINS.history&&a.closure?.historySemanticSha256===H_PINS.history,'H same-repository complete historical evidence changed');
    if(hist) {
        fail(hist.sourceAbsenceClaim===false&&hist.canonicalIdentityOrVersionApprovalGranted===false&&hist.registry?.length===4&&hist.parentObservations?.length===8&&hist.pageObservations?.length===1084&&Object.keys(hist.historicalDocuments??{}).length===226,'H bounded history coverage or authority limits changed');
        const keys=new Set(),counts={};
        for(const old of hist.pageObservations??[]) {
            const key=old.revision+':'+old.identity,p=pageById.get(old.identity),doc=hist.historicalDocuments[old.identity];
            fail(!keys.has(key)&&p&&old.parentIdentity===p.parentIdentity&&old.pageId===p.document._id&&old.key===`!journal.pages!${p.parentIdentity.split('.').at(-1)}.${p.document._id}`,'H historical exact key/membership changed: '+key);keys.add(key);
            counts[old.status]=(counts[old.status]??0)+1;
            if(old.status==='found')fail(doc&&old.databaseReadPerformed===true&&old.rawValueReturned==='object'&&hash(doc)===old.contentHash&&old.historicalParentIndex===p?.index&&old.sameStoredIndex===true&&same(old.fieldDifferences,journalFieldDifferences(doc,p.document)),'H full historical page/delta mismatch: '+key);
            else if(old.status==='not-found')fail(old.databaseReadPerformed===true&&old.rawValueReturned==='undefined'&&old.contentHash===null&&old.fieldDifferences===null,'H exact-key absence confused with null/not-read: '+key);
            else fail(old.status==='pack-not-present-in-revision'&&old.databaseReadPerformed===false&&old.rawValueReturned==='not-read'&&old.contentHash===null&&old.fieldDifferences===null,'H absent pack mistaken for an available DB lookup: '+key);
        }
        fail(same(counts,{'pack-not-present-in-revision':542,'not-found':90,found:452}),'H historical status partition changed');
        for(const old of hist.parentObservations??[])if(old.status==='found') {
            fail(hash(old.rawDatabaseValue)===old.rawParentSemanticSha256&&old.historicalOnlyPageIds.length===0&&same(old.historicalPageIds,old.rawDatabaseValue.pages.map(p=>typeof p==='string'?p:p._id)),'H full historical parent or stored page membership changed');
        }
    }
    const pageCounts={};for(const p of a.pageExaminations)pageCounts[p.outcome]=(pageCounts[p.outcome]??0)+1;
    fail(same(a.closure?.pageCounts,pageCounts)&&same(a.closure?.rootCounts,{reviewed:1,unresolved:1})&&h?.closure?.embeddedPagesExamined===271,'H derived closure counts changed');
    fail(h?.closure?.sourceEvidenceSemanticSha256===hash(a)&&h?.acceptance?.sourceEvidenceSemanticSha256===hash(a),'H aggregate audit bindings disagree');
    fail(bundle.index.coverage?.completeAddressableClassification===true&&same(bundle.index.coverage.counts,{reviewed:3643,excluded:124,unresolved:3628,unreviewed:0}),'H root source disposition totals incomplete or conflated with supported totals');
    citations(a);
}
