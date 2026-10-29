import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview} from '../tools/record-source-review.mjs';
import {fullFSourceCheckpointView} from '../tools/source-review-order.mjs';
import {checkOrganizationalSourceReview, organizationalSourceFactErrors} from '../tools/organizational-source-review.mjs';
import {organizationalKind, organizationalReferences, organizationalFolderFacts, organizationalTableFacts,
    organizationalMacroFacts, organizationalSourceFacts, printedRollBands} from '../tools/organizational-source-derivation.mjs';

const base = await loadRecordSourceReview(), audit = base.organizationalSource;
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const textHash = v => createHash('sha256').update(v).digest('hex');
const equal = (a,b) => {try {assert.deepEqual(a,b);return true;} catch {return false;}};
const actualMap = new Map(base.source.rows.map(r => [r.identity,r]));
const files = ['folders','habitats','rolltables','macros'].map(n => 'record-source-review/organization-'+n+'.json');
const row = (identity,b=base) => files.flatMap(p=>b.files[p].records).find(r=>r.identity===identity);
const detail = identity => row(identity).sourceComparison.organizationalReview.currentExtraction;
function errors(b=base) {
    const out=[];
    checkOrganizationalSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),
        actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,citations:()=>{}});
    return out;
}
// Restore each changed primitive after a synchronous check, avoiding a copy of
// all earlier source corpora per fixture. Unchanged checksums are deliberate:
// independent literal pins must reject coordinated self-reported changes too.
function changed(object,key,value,pattern) {
    const present=Object.hasOwn(object,key),before=object[key];
    try {object[key]=value;assert(errors().some(m=>pattern.test(m)),String(pattern));}
    finally {if(present)object[key]=before;else delete object[key];}
}

test('all245 G tuples retain kind-specific closure while fullG acceptance/H/full04 stay held',()=>{
    assert.deepEqual(errors(),[]);
    assert.deepEqual(base.index.coverage.counts,{reviewed:3642,excluded:124,unresolved:3627,unreviewed:2});
    assert.equal(base.index.coverage.explicitRecordDispositions,7393);
    assert.equal(base.index.coverage.completeAddressableClassification,false);
    assert.deepEqual(base.batchManifest.batches.find(b=>b.id==='G').closure.counts,{reviewed:206,unresolved:39});
    assert.equal(base.batchManifest.batches.find(b=>b.id==='G').acceptance.status,'pending-substantive-review');
    assert.equal(base.batchManifest.batches.find(b=>b.id==='H').status,'not-started');
    assert.equal(audit.fullGAcceptance,false);
});
test('actual key and case-sensitive ID decide organization kind independently of collection/name',()=>{
    assert.equal(organizationalKind({_key:'!folders!AbCdEfGh12345678',_id:'AbCdEfGh12345678',type:'Item',name:'Transform'}),'folders');
    assert.equal(organizationalKind({_key:'!folders!AbCdEfGh12345678',_id:'abcdefgh12345678',type:'Item'}),null);
    assert.equal(organizationalKind({_key:'!items!AbCdEfGh12345678',_id:'AbCdEfGh12345678',name:'Folder'}),null);
});
test('pack-qualified folder parent/child links preserve same bare ID and independent exclusions',()=>{
    const id='AbCdEfGh12345678', parent='QrStUvWx12345678',child='ZbCdEfGh12345678';
    const doc={_key:'!folders!'+id,_id:id,type:'Item',folder:parent};
    const map=new Map([['one.'+parent,{pack:'one',identity:'one.'+parent,contentHash:'p',data:{_key:'!folders!'+parent,_id:parent,type:'Item',folder:null}}],
        ['two.'+parent,{pack:'two',identity:'two.'+parent,contentHash:'wrong',data:{_key:'!folders!'+parent,_id:parent,type:'Item'}}],
        ['one.'+child,{pack:'one',identity:'one.'+child,contentHash:'c',data:{_id:child,_key:'!items!'+child,folder:id}}]]);
    const p=new Map([['one.'+child,{file:'prior.json',row:{coverageState:'excluded'}}]]), f=organizationalFolderFacts('one.'+id,doc,map,p,hash);
    assert.deepEqual(f.parentChain.map(r=>r.identity),['one.'+parent]);assert.equal(f.children[0].priorCoverage,'excluded');
    assert.equal(f.children[0].excludedChildMechanicsExamined,false);assert.equal(f.contentScopeInheritedFromFolder,false);
    map.get('one.'+parent).data.folder=id;map.set('one.'+id,{pack:'one',identity:'one.'+id,data:doc});
    assert.equal(organizationalFolderFacts('one.'+id,doc,map,p,hash).cycle,true);
});
test('197 actual folders include one empty folder and both same-ID cross-pack folders',()=>{
    const roots=base.files[files[0]].records;
    assert.equal(roots.length,197);assert.equal(roots.reduce((n,r)=>n+r.sourceComparison.organizationalReview.currentExtraction.parentChain.length,0),172);
    assert.equal(roots.reduce((n,r)=>n+r.sourceComparison.organizationalReview.currentExtraction.children.length,0),3937);
    assert.deepEqual(roots.filter(r=>!r.sourceComparison.organizationalReview.currentExtraction.children.length).map(r=>r.identity),['effects.OBbr9mwG7PT0UXjS']);
    assert(row('feats.fJnplwLaGjgef87x'));assert(row('moves.fJnplwLaGjgef87x'));
});
test('modern, legacy and explicit result references retain exact case, path and collection',()=>{
    const value={a:'@UUID[Compendium.ptu.items.Item.AbCdEfGh12345678]',b:'@Compendium[ptu.moves.abcdefgh12345678]',
        c:[{documentCollection:'ptu.habitats',documentId:'QrStUvWx12345678'}]};
    assert.deepEqual(organizationalReferences(value).map(l=>[l.path,l.targetIdentity]),[['$.a','items.AbCdEfGh12345678'],['$.b','moves.abcdefgh12345678'],['$.c[0]','habitats.QrStUvWx12345678']]);
});
test('table range coverage preserves overlapping roles, raw weights and drawn state without probability approval',()=>{
    const d={formula:'1d6',replacement:false,displayRoll:true,results:[{_id:'a',type:'text',range:[1,3],weight:1,drawn:true},
        {_id:'b',type:'pack',range:[3,6],weight:9,drawn:false,documentCollection:'ptu.items',documentId:'AbCdEfGh12345678'}]};
    const f=organizationalTableFacts(d,new Map(),new Map(),hash);
    assert.deepEqual(f.uncoveredRolls,[]);assert.deepEqual(f.overlappingRolls,[{roll:3,resultIndices:[0,1]}]);
    assert.deepEqual(f.weightRangeWidthDifferences,[0,1]);assert.equal(f.results[0].rawDrawn,true);assert.equal(f.replacement,false);
    assert.deepEqual(f.missingExactTargets,[{path:'$.results[1]',targetIdentity:'items.AbCdEfGh12345678'}]);
    assert.equal(f.actualDrawBehavior,'not-run');assert.equal(f.probabilitiesOrSelectionAuthorityApproved,false);
});
test('all42 tables preserve2519 results,1937 habitat result roles and exact missing IDs',()=>{
    const rows=[...base.files[files[1]].records,...base.files[files[2]].records];
    assert.equal(rows.length,42);assert.equal(rows.reduce((n,r)=>n+r.sourceComparison.organizationalReview.currentExtraction.resultCount,0),2519);
    assert.equal(base.files[files[1]].records.reduce((n,r)=>n+r.sourceComparison.organizationalReview.currentExtraction.resultCount,0),1937);
    assert(rows.every(r=>r.sourceComparison.organizationalReview.currentExtraction.uncoveredRolls.length===0));
    assert.equal(Object.values(audit.targetSnapshots).filter(s=>!s.contentHash).length,32);
    assert.equal(detail('rolltables.MlmOVH32wiSuP3sh').results.at(-1).targetIdentity,'rolltables.hvZUPAF9B8WN7Tjk');
});
test('Dowsing reroll and two distinct Foraging self results remain explicit, unexecuted',()=>{
    const d=detail('rolltables.HJLKR2GJX3S7eGAk'), f=detail('rolltables.diOJAiujB4Kpss3K');
    assert.equal(d.results.filter(r=>r.targetIdentity==='rolltables.HJLKR2GJX3S7eGAk').length,1);
    assert.equal(f.results.filter(r=>r.targetIdentity==='rolltables.diOJAiujB4Kpss3K').length,2);
    assert.equal(new Set(f.results.filter(r=>r.targetIdentity==='rolltables.diOJAiujB4Kpss3K').map(r=>r.resultId)).size,2);
    assert.match(audit.sourceFacts.dowsing.optionalReroll,/may reroll/);assert.equal(audit.sourceFacts.survival.currentForagingQuantityFrameworkEstablished,false);
});
test('habitat label probes normalize only case/spacing and cannot invent taxonomy aliases',()=>{
    const id='AbCdEfGh12345678', d={name:'Cafe',formula:'1d1',results:[{_id:'r',range:[1,1],weight:1,documentCollection:'ptu.species',documentId:id}]};
    const map=new Map([['species.'+id,{contentHash:'x',data:{system:{habitats:['Café']}}}]]);
    const p=new Map([['species.'+id,{file:'prior.json',row:{coverageState:'reviewed',fieldReview:[{field:'system.habitats',sourceValue:['Café']}]}}]]);
    const f=organizationalTableFacts(d,map,p,hash).results[0];assert.equal(f.casefoldLabelPresentInCurrentHabitat,false);assert.equal(f.casefoldLabelPresentInPrintedHabitat,false);
    assert.equal(f.labelProbeEstablishesPlacementOrCanonicalIdentity,false);
    map.get('species.'+id).data.system.habitats=[' C A F E '];assert.equal(organizationalTableFacts(d,map,p,hash).results[0].casefoldLabelPresentInCurrentHabitat,true);
});
test('printed row parser handles Unicode ranges and wrapped categories without merging Pickup/Luck',()=>{
    assert.deepEqual(printedRollBands('1–4 Potions\n wrapped condition\n5-6 Other\n20 Rare'),[
        {range:[1,4],text:'Potions wrapped condition'},{range:[5,6],text:'Other'},{range:[20,20],text:'Rare'}]);
    assert.equal(audit.sourceFacts.pickup.bands.length,9);assert.equal(audit.sourceFacts.luck.bands.length,10);
    assert.deepEqual(audit.sourceFacts.pickup.bands[0].range,[1,5]);assert.deepEqual(audit.sourceFacts.luck.bands[0].range,[1,4]);
});
test('full parents derive money, quantities, typed roles, TM number/price, optional variants and expiry',()=>{
    const f=organizationalSourceFacts(audit);assert.deepEqual(f,audit.sourceFacts);assert.deepEqual(organizationalSourceFactErrors(f),[]);
    assert.deepEqual([f.typedItems.boosterDamageBonus,f.typedItems.braceDamageReduction,f.typedItems.confidePrintedTm,f.typedItems.confidePrintedCost,f.typedItems.plateListedPrice],[5,15,100,1000,'--']);
    assert.equal(f.poltergeist.optionalLevel,40);assert.match(f.poltergeist.originalFan,/Air Slash/);assert.match(f.poltergeist.optionalFan,/Hurricane/);
    assert.match(f.transform.literalMovePronoun,/user’s Moves/);assert.match(f.transform.expiry,/switched out.*KO’ d.*end of the encounter/);
});
for(const [group,key] of [['dowsing','dailyUses'],['dowsing','optionalReroll'],['dowsing','crystalResonance'],['dowsing','optionalBook'],
    ['pickup','specificItemDecision'],['pickup','dailyExtended'],['luck','parentCondition'],['luck','money'],['poltergeist','original'],['poltergeist','optional'],
    ['transform','literalMovePronoun'],['transform','unchangedStats'],['transform','expiry'],['transform','voluntaryEnd'],['transform','cannotMiss'],
    ['typedItems','booster'],['typedItems','brace'],['typedItems','tmHmUses'],['typedItems','confideMove'],['survival','scoutingPurpose'],['fossil','completeParent']]) {
    test(`source condition cannot be replaced with an uncited summary: ${group}.${key}`,()=>{
        const f=structuredClone(audit.sourceFacts);f[group][key]='unrestricted automatic benefit';assert(organizationalSourceFactErrors(f).length>0);
    });
}
test('exact excluded bodies stay omitted;12 excluded edges leave10 older/shared consumers intact',()=>{
    const excluded=Object.values(audit.targetSnapshots).filter(s=>s.excludedMechanicalSnapshotOmitted);
    assert.equal(excluded.length,75);assert(excluded.every(s=>s.document===null&&s.mechanicalExaminationPerformed===false));
    assert.equal(audit.nestedExcludedEdges.length,12);assert.equal(new Set(audit.nestedExcludedEdges.map(e=>e.sourceIdentity)).size,10);
    assert(audit.nestedExcludedEdges.every(e=>!e.targetMechanicsExamined&&!e.olderSharedConsumerExcludedByAssociation&&audit.targetSnapshots[e.sourceIdentity].document));
});
test('macro literals bind interfaces and expose Transform field case/default/lifecycle differences without execution',()=>{
    const m=detail('macros.sYZbyUkyC8f4nCek');
    assert.deepEqual([m.transform.copyStatsFlagDefault,m.transform.capitalizedAllowDuplicateLiteral,m.transform.lowercaseAllowduplicateWritten,m.transform.suppliedTypeOverwriteFlag],['false',true,false,false]);
    assert.equal(m.transform.grantSchemaUsesLowercaseField,true);assert.equal(m.transform.typeImplementationRequiresOverwriteBranch,true);
    assert.equal(m.transform.explicitDurationField,false);assert.equal(m.transform.deletionAwaitedInLoop,false);assert.equal(m.transform.movementKeys.length,8);
    const rotom=detail('macros.H929lnw6f59DTuWQ');assert(rotom.implementationItemQueries.length>0);assert(rotom.implementationItemQueries.every(q=>!q.stableTargetUuidEstablished));
    assert.equal(m.codeExecuted,false);assert.equal(m.actualSideEffects,'not-run');
});
test('macro extraction accepts static text only and never invokes the supplied command',()=>{
    globalThis.__organizationalExecutionProbe=false;
    const f=organizationalMacroFacts('macros.other',{command:'globalThis.__organizationalExecutionProbe=true;',ownership:{default:0}},[]);
    assert.equal(globalThis.__organizationalExecutionProbe,false);assert.equal(f.literalCommand,'globalThis.__organizationalExecutionProbe=true;');delete globalThis.__organizationalExecutionProbe;
});
test('history distinguishes465 found bodies,471 omitted undefined keys and44 packs absent without parser absence',()=>{
    const h=audit.historicalObservations;assert.equal(h.length,980);
    assert.equal(h.filter(v=>v.status==='found').length,465);assert.equal(h.filter(v=>v.status==='not-found').length,471);
    assert.equal(h.filter(v=>v.status==='pack-not-present-in-revision').length,44);
    assert(h.filter(v=>v.status==='not-found').every(v=>v.databaseReadPerformed&&v.rawValueReturned==='undefined'&&!Object.hasOwn(v,'rawDatabaseValue')));
    assert(h.filter(v=>v.status==='pack-not-present-in-revision').every(v=>!v.databaseReadPerformed&&v.rawDatabaseValue===null));
    assert.equal(h.filter(v=>v.status==='found').reduce((n,v)=>n+Object.keys(v.fieldComparisons).length,0),5153);
});
test('historical tables reconstruct in parent-ID order while retaining raw iterator records',()=>{
    const tables=audit.historicalObservations.filter(h=>h.status==='found'&&organizationalKind(actualMap.get(h.identity)?.data)==='tables');
    assert(tables.length>0);assert(tables.some(h=>h.rawEmbeddedResults.map(r=>r.document._id).join()!==h.rawDatabaseValue.results.join()));
    for(const h of tables)assert.deepEqual(h.document.results.map(r=>r._id),h.rawDatabaseValue.results);
    assert.equal(tables.reduce((n,h)=>n+h.rawEmbeddedResults.length,0),8907);
    assert.equal(audit.missingTargetHistoricalObservations.length,128);assert(audit.missingTargetHistoricalObservations.every(h=>h.mechanicalExaminationPerformed&&!actualMap.has(h.identity)));
});
test('native complete use contexts preserve wrong Luck/Pickup link and cannot close H',()=>{
    assert.equal(audit.incomingReferences.length,63);assert.equal(audit.incomingUseContexts.length,10);assert.equal(audit.nativeContexts.length,5);
    const gm=audit.nativeContexts.find(p=>p.contextPath==='$.pages[82]');assert.match(gm.contextDocument.text.content,/Luck/);assert.match(gm.contextDocument.text.content,/s0b5aT318cnMx8fX/);
    assert(audit.incomingUseContexts.every(c=>c.nativeContextDoesNotCloseH));assert.equal(audit.sourceFacts.habitat.creditedSourceFetched,false);
});
test('historical F view preserves all41 payloads, actual tuples and acceptance without concealing rawG',()=>{
    const f=fullFSourceCheckpointView(base);assert.equal(Object.keys(f.files).length,41);
    for(const[p,v]of Object.entries(f.files))assert.equal(v,base.files[p]);
    assert.equal(f.batchManifest.batches.find(b=>b.id==='F'),base.batchManifest.batches.find(b=>b.id==='F'));
    const g=f.batchManifest.batches.find(b=>b.id==='G');assert.equal(g.members,base.batchManifest.batches.find(b=>b.id==='G').members);assert.equal(g.status,'not-started');
    assert.equal(base.batchManifest.batches.find(b=>b.id==='G').status,'source-comparisons-complete');
    assert.deepEqual(f.index.coverage.counts,{reviewed:3436,excluded:124,unresolved:3588,unreviewed:247});
    assert.equal(f.organizationalSource,null);assert.equal(f.historicalSourceView.currentLaterQueuesValidatedHere,false);
});
for(const [key,value,pattern] of [['fullGAcceptance',true,/checkpoint promoted/],['HClosure',true,/checkpoint promoted/],
    ['productionPolicyPromotion',true,/checkpoint promoted/],['behavioralVerification','passed',/checkpoint promoted/],['sourceAbsenceClaim',true,/checkpoint promoted/],
    ['membershipSha256','bad',/membership/],['startingRevision','0'.repeat(40),/membership/]])
    test(`raw currentG rejects changed ${key}`,()=>changed(audit,key,value,pattern));
test('currentG cannot disappear behind the historical F projection',()=>changed(base,'organizationalSource',null,/evidence missing/));
test('earlier accepted F cannot become pending while currentG proceeds',()=>changed(base.batchManifest.batches.find(b=>b.id==='F').acceptance,'status','pending-substantive-review',/accepted F|nonG/));
test('earlier F unfinished state and held H mutation are independently rejected',()=>{
    changed(base.batchManifest.batches.find(b=>b.id==='F'),'status','in-progress',/accepted F|nonG/);
    changed(base.batchManifest.batches.find(b=>b.id==='H'),'status','in-progress',/nonG/);
});
test('self-declared accepted G needs exact substantive evidence and history',()=>changed(base.batchManifest.batches.find(b=>b.id==='G'),'acceptance',{status:'accepted-source-examination'},/closure lacks/));
test('closed earlier payloads cannot be hidden by a historical view',()=>changed(base.files['record-source-review/references-d.json'].records[0],'coverageState','unreviewed',/prior A–F payload/));
test('current complete result bodies and excluded body omission remain independent of refreshed counts',()=>{
    const r=row('rolltables.HJLKR2GJX3S7eGAk');changed(r.fieldReview.find(f=>f.recordFieldPath==='results'),'recordValue',[],/actual field/);
    const s=Object.values(audit.targetSnapshots).find(s=>s.excludedMechanicalSnapshotOmitted);changed(s,'document',{system:{invented:true}},/excluded-only/);
});
test('older/shared target cannot be excluded merely through its nested edge',()=>changed(audit.nestedExcludedEdges[0],'olderSharedConsumerExcludedByAssociation',true,/independent older/));
test('absent exact key cannot acquire a manufactured null/body representation',()=>changed(audit.historicalObservations.find(h=>h.status==='not-found'),'rawDatabaseValue',null,/absent-key/));
test('historical parent result order cannot be replaced by iterator order',()=>{
    const h=audit.historicalObservations.find(h=>h.status==='found'&&h.rawEmbeddedResults.length>1&&h.rawEmbeddedResults.map(r=>r.document._id).join()!==h.rawDatabaseValue.results.join());
    changed(h.document,'results',h.rawEmbeddedResults.map(r=>r.document),/parent ID order/);
});
test('foundation assessment cannot waive demonstrated contradictions or claim unrun verification',()=>changed(audit.foundationAssessment,'supportedRouteContradictionReproduced',true,/foundation assessment/));
test('actual visual QA is required independently of original text equality',()=>changed(audit.localOriginalQa,'visualInspectionComplete',false,/visual QA/));
test('same-repository archived physical provenance cannot be replaced with self-reported histories',()=>changed(audit.historicalRegistry[0],'archiveSha256','0'.repeat(64),/archive\/tree\/file provenance/));
test('accepted-base normal CI evidence cannot be substituted',()=>changed(audit.acceptedBaseCi,'run',0,/accepted-base evidence/));
test('source scope cannot be expanded through audit metadata',()=>changed(audit,'scope','All generations by display name',/Generations1–8 scope/));
test('unexecuted macro review cannot certify runtime foundations',()=>changed(audit.foundationAssessment,'newRuntimeCertification',true,/foundation assessment/));
