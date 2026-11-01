import {createHash} from 'node:crypto';
import {FEATURE_REVIEW_PIN,FEATURE_REVIEW_RUNTIME,FEATURE_REVIEW_CASES,featureReviewEvidenceErrors} from './check-feature-review-evidence.mjs';

const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const clone=structuredClone;
export const attemptHash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(stable(v))).digest('hex');
const digest=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const itemId=v=>typeof v==='string'&&/^[A-Za-z0-9]{16}$/.test(v);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const protectedProductionIds=new Set(['ViZpn17qLA4ACQGa','celnYjQjM3jjtAnZ','e9dQ3NmVm7EuQBO5','i1OAz3lvuCRIm3n9','UKk9BnAZtm1xMoRB']);
const proof=(path,sha256)=>({path,sha256,private:true});
const previous={head:'6b686b6be2d1af34b566687a10297ec75c330641',semanticSha256:'0510ec645c3ff7651da975b1c6dbc1b92a7a5c24dfdf3a3a9e3fe3a3993eb079',path:'docs/validation/p05-feature-review-native.json',status:'blocked',nativeCases:{passed:0,failed:0,notRun:28},
    proofs:[proof('logs/server-stdout.log','fbc34addcb8f943d3475904bb4ffeaab33e1bf31688e67c3e2974743fc6b787f'),proof('logs/server-stderr.log','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),proof('raw/startup-stop.json','cebdf31751711d01fe8bcd0cfb547512b39cf2debe418159ca2ba358cbb96c2f'),proof('raw/offline-closure.json','199d7a8800d849e4f7489538b5488a8a4c599c276adcee886f58cd5a1c12a6cb'),proof('raw/offline-closure-final.json','40bfaaaa044fe4ad8fb98b64db7b1f2661df63ee158a626e0b47764d6a2d8d06')],
    preservedFiles:[{path:'docs/validation/p05-feature-review-native.json',canonicalSha256:'5ba1f5f2059f58412b97cf3729c3662540ba01f95b84ee4ae0c5a80bdecb090f'},{path:'tools/check-feature-review-evidence.mjs',canonicalSha256:'51bc41aa89281ab556255db16f917705b1bc385abe3157179ad2cd7cf265fc4d'},{path:'tests/feature-review-evidence.test.mjs',canonicalSha256:'e4126029b187188c9dbae1a6418412a4b92e328d53a09e69adc583590adf9ff4'}],
    residual:{settingsValuesUnchanged:true,usersRolesSecurityUnchanged:true,actorsItemsUnchanged:true,fullyRestored:false,uncertain:true,returnToSetup:false,settingMetadataChanges:[{key:'core.moduleConfiguration',paths:['_stats.modifiedTime']},{key:'core.compendiumConfiguration',paths:['_stats.modifiedTime']}],worldManifestChanges:['lastPlayed','packs.0.package','packs.0.id','packs.0.packageType','packs.0.packageName','packs.0.index','packs.0.folders']},
    history:['initial45','intermediate69/70/74','affected544','corrected86/combined106','family-bypass0/6','intermediate-test-compile-failure','restoration-array-order-failure/path-keyed6890-success','screenshot-EPERM/TEMP-denial/owner-unsaved','old-headCI2493','accepted-headCI2505','native0/28']};
const transformationCounts=[[22,8,0,0],[100,26,0,0],[671,259,0,0],[0,6,0,0],[96,22,0,0],[19,5,0,0],[0,0,1937,0],[0,2,548,34],[65,367,0,0],[0,24,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0],[6,1,0,0],[0,6,0,0]];
const profiles=[
    ['abilities','Item',634,631,0],['moves','Item',1310,1294,0],['feats','Item',1402,1324,0],['edges','Item',86,85,0],['items','Item',854,843,0],['capabilities','Item',148,144,0],['habitats','RollTable',1962,25,1937],['rolltables','RollTable',604,17,582],['effects','Item',673,614,0],['species','Item',1814,1806,0],['macros','Macro',6,6,0],['references','Item',336,335,0],['spirit-actions','Item',42,34,0],['journals','JournalEntry',273,2,271],['poke-edges','Item',41,38,0]
].map(([name,type,total,primary,embedded],n)=>({database:`ptu.${name}`,path:`packs/${name}`,type,total,primary,embedded,folders:total-primary-embedded,transformations:{legacySources:transformationCounts[n][0],exportSources:transformationCounts[n][1],packResults:transformationCounts[n][2],textResults:transformationCounts[n][3],pageCategories:type==='JournalEntry'?embedded:0}}));
const fixtureRoles=[...['target-trainer','target-pokemon','denied-trainer','source-parent'].map(role=>({role,kind:'Actor'})),...['target-trainer','target-pokemon'].flatMap(parent=>['feature-0','feature-1','edge','pokeedge','item'].map(s=>({role:`${parent}-${s}`,kind:'embeddedItem',parent}))),{role:'source-parent-feature-0',kind:'embeddedItem',parent:'source-parent'},...['core-control','optional-control','unresolved-control','denied-control'].map(role=>({role,kind:'worldItem'})),...['pack-core','pack-optional'].map(role=>({role,kind:'packItem',parent:'test-pack'})),{role:'test-pack',kind:'Pack'},{role:'test-macro',kind:'Macro'}];
for(const r of fixtureRoles)r.type=r.kind==='Actor'?(r.role==='target-pokemon'?'pokemon':'character'):r.kind==='Macro'?'script':r.kind==='Pack'?'Item':r.kind==='embeddedItem'&&!r.role.includes('feature-')?r.role.split('-').at(-1):'feat';
const casePlans=FEATURE_REVIEW_CASES.map(id=>({id,actorRole:id==='player-denied-actor'?'denied-trainer':id.includes('pokemon')?'target-pokemon':'target-trainer',incomingRoles:id.includes('pack-')?['pack-core','pack-optional']:id.includes('source-parent')?['source-parent-feature-0']:id==='player-denied-incoming'?['denied-control']:id==='gm-unresolved-custom'?['unresolved-control']:id==='gm-incoming-batch-conflicts'?['core-control','optional-control','optional-control']:id.includes('pokemon')?['core-control']:['optional-control'],incomingOrder:id.includes('pack-')?'native-collection':'explicit',outcome:/denied|pack-none|pack-revoked/.test(id)?'not-opened':'review-requested',dismissal:/close|cancel|escape|dismissal/.test(id)}));
export const FEATURE_REVIEW_ATTEMPT_CONTRACT=freeze({schemaVersion:1,id:'p05-feature-review-attempt-preparation-v1',admission:'pending',pin:clone(FEATURE_REVIEW_PIN),runtime:clone(FEATURE_REVIEW_RUNTIME),cases:[...FEATURE_REVIEW_CASES],casePlans,previous,
    target:{world:FEATURE_REVIEW_PIN.world,title:'PTU verification (disposable)',worldPath:'D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/worlds/ptu-verification',systemPath:'D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/systems/ptu'},accounts:[{id:FEATURE_REVIEW_PIN.player,name:'PTU 02 Player',role:1},{id:FEATURE_REVIEW_PIN.gm,name:'Gamemaster',role:4}],coveredPlayers:[FEATURE_REVIEW_PIN.player],fixtures:{counts:{Actor:4,embeddedItem:11,worldItem:4,packItem:2,Macro:1,Pack:1},roles:fixtureRoles,pack:'world.p05-feature-review-fixtures'},
    access:{observerRoles:['target-trainer','target-pokemon','source-parent','core-control','optional-control','unresolved-control'],limitedRole:'test-macro',deniedRoles:['denied-trainer','denied-control'],playerPack:['NONE','OBSERVER','NONE'],trusted:'NONE',assistant:'NONE',globalPermissions:'unchanged'},
    conversion:{admission:'pending',databases:profiles,totals:{primary:7198,embedded:2790,changed:9988,folders:197,stored:10185},permittedFields:['_stats.coreVersion','_stats.exportSource','flags.core.sourceId','_stats.compendiumSource','flags.exportSource','TableResult:text/type/documentCollection/documentId/name/documentUuid/description/_stats','JournalEntryPage:category'],preserve:['record-ids','database-coordinates','system-values','all-unlisted-fields','excluded-inventory'],gameplayVerified:false},
    externalDecisions:['trusted owner native/core-conversion admission','residual metadata disposition','privately verified normal Setup exit','fresh exclusive world ownership/backups/identities/runtime','mandatory action-time approvals','verified private capture route','independent evidence/admission review']});

/** A plan only: no date, fresh batch, generated IDs, consent, live service or IO. */
export function createPendingFeatureReviewAttempt(){const c=FEATURE_REVIEW_ATTEMPT_CONTRACT;return {schemaVersion:1,contract:c.id,kind:'feature-review-attempt',status:'prepared',admission:{status:'pending',ownerDecision:null,actionTimeDecision:null,setupExitVerified:false},attempt:{id:null,mode:'not-run'},pin:clone(c.pin),target:clone(c.target),accounts:clone(c.accounts),coveredPlayers:clone(c.coveredPlayers),previous:clone(c.previous),fixturePlan:clone(c.fixtures),resources:[],accessPlan:clone(c.access),accessChanges:[],conversionPlan:clone(c.conversion),conversion:{state:'not-run',records:[]},runtime:Object.entries(c.runtime).map(([path,packaged])=>({path,packaged,installed:null,served:null})),cases:c.cases.map((id,n)=>({id,expected:clone(c.casePlans[n]),result:'not-run',reason:'Admission pending; not executed',observed:null,raw:[]})),restoration:{state:'not-run',priorResidualRetained:true,fullyRestored:false,cancelled:false},claims:{nativeComplete:false,authorized:false,administratorAccess:false,previousWorldUnchanged:false,full05:false,pre06:false,gameplay:false,merge:false,release:false}};}

/** Interpret a capture without treating its source/classifier as authority. */
export function reviewAttemptObservationErrors(id,o,resources=[]){
    const errors=[],check=(ok,s)=>{if(!ok)errors.push(s);},c=FEATURE_REVIEW_ATTEMPT_CONTRACT;
    if(!o||typeof o!=='object')return ['Observation object required'];
    if(!Array.isArray(resources)||resources.some(r=>!plain(r)))return ['Observation manifest entries required'];
    check(c.cases.includes(id),'Unknown case identity');check(['synthetic','native'].includes(o.source),'Observation source required');
    check(o.core===c.pin.core&&o.world===c.target.world&&o.userId===(id.startsWith('gm-')?c.pin.gm:c.pin.player),'Native identity/role mismatch');
    check(digest(o.beforeSha256)&&o.beforeSha256===o.afterSha256&&o.statePreserved===true,'Review state changed');
    check(Array.isArray(o.checks)&&o.checks.length>0&&o.checks.every(x=>x?.passed===true),'Observation checks failed/missing');
    const denied=/denied|pack-none|pack-revoked/.test(id);
    if(o.resolutionDenied===true){check(denied&&o.bodyExecuted===false&&o.launchStatus==='not-opened'&&o.coverage==='resolution-denial','Resolution denial is not launcher-body coverage');}
    else {check(o.bodyExecuted===true&&o.coverage==='launcher-body','Actual launcher-body coverage required');check(o.launchStatus===(denied?'not-opened':'review-requested'),'Review/denial outcome mismatch');}
    if(!denied&&/close|cancel|escape|dismissal/.test(id))check(o.dismissed===true&&o.consentType==='undefined','Dismissal is not consent');
    const plan=c.casePlans.find(p=>p.id===id),actor=resources.find(r=>r.uuid===o.actorUuid&&r.kind==='Actor');check(Boolean(actor)&&actor.role===plan?.actorRole,'Observed Actor must match the fixed case/manifest role');
    const expectedIncoming=plan?.incomingRoles.map(role=>resources.find(r=>r.role===role)?.uuid),incoming=o.incomingUuids;check(Array.isArray(incoming)&&expectedIncoming?.every(Boolean)&&(plan.incomingOrder==='explicit'?same(incoming,expectedIncoming):incoming.length===expectedIncoming.length&&new Set(incoming).size===incoming.length&&incoming.every(uuid=>expectedIncoming.includes(uuid))),'Incoming target coordinates/repetitions differ from the fixed case');
    for(const key of ['nativeComplete','authorized','approved','confirmed','canAcquire','canApply'])check(!Object.hasOwn(o,key),'Observation cannot authenticate completion/consent');return errors;
}

/** Exact physical conversion of one captured JSON record. No datastore reads. */
export function coreConversionRowErrors(row){
    const errors=[],c=FEATURE_REVIEW_ATTEMPT_CONTRACT,p=c.conversion.databases.find(p=>p.database===row?.database),b=row?.before,a=row?.after;
    if(!p||!plain(b)||!plain(a))return ['Unknown conversion database/record'];
    const child=row.documentType==='TableResult'||row.documentType==='JournalEntryPage';
    const coordinate=child?`Compendium.${p.database}.${p.type}.${row.parentId}.${row.documentType}.${b._id}`:`Compendium.${p.database}.${row.documentType}.${b._id}`;
    if(!itemId(b._id)||a._id!==b._id||row.coordinate!==coordinate||child&&!itemId(row.parentId)||!child&&row.parentId!=null||b.uuid!=null&&b.uuid!==coordinate||a.uuid!=null&&a.uuid!==coordinate)errors.push('Changed record identity/coordinate');
    if(!same(b.system,a.system))errors.push('Changed system values');
    if(row.documentType==='Folder'){if(!same(b,a))errors.push('Folder records must remain unchanged');return errors;}
    if(Object.hasOwn(b,'_stats')&&!plain(b._stats))return [...errors,'Unexpected predecessor core stats'];
    const embedded=row.documentType==='TableResult'&&p.type==='RollTable'||row.documentType==='JournalEntryPage'&&p.type==='JournalEntry';
    if(row.documentType!==p.type&&!embedded)return [...errors,'Unexpected document classifier'];
    const expected=clone(b),stats=expected._stats;
    if(!stats){if(row.documentType!=='TableResult')return [...errors,'Unexpected absent core stats'];expected._stats=Object.fromEntries(['coreVersion','systemId','systemVersion','createdTime','modifiedTime','lastModifiedBy','compendiumSource','duplicateSource','exportSource'].map(k=>[k,null]));}
    else if(!['12.327','12.329'].includes(stats.coreVersion))errors.push('Unexpected predecessor core version');
    expected._stats.coreVersion=c.pin.core;
    if(!Object.hasOwn(expected._stats,'exportSource'))expected._stats.exportSource=null;
    const legacy=expected.flags?.core?.sourceId;
    if(legacy!==undefined){if(typeof legacy!=='string'||expected._stats.compendiumSource!=null&&expected._stats.compendiumSource!==legacy)errors.push('Conflicting legacy/modern target');expected._stats.compendiumSource=legacy;delete expected.flags.core.sourceId;}
    const exported=expected.flags?.exportSource;
    if(exported!==undefined){if(!plain(exported))errors.push('Unexpected export provenance');else{const normalized={worldId:exported.world||null,uuid:null,coreVersion:exported.coreVersion||null,systemId:exported.system||null,systemVersion:exported.systemVersion||null};if(stats?.exportSource!=null&&!same(stats.exportSource,normalized))errors.push('Conflicting export provenance');expected._stats.exportSource=normalized;}delete expected.flags.exportSource;}
    if(row.documentType==='JournalEntryPage'&&!Object.hasOwn(expected,'category'))expected.category=null;
    if(row.documentType==='TableResult'){
        if(typeof b.text!=='string')errors.push('Unexpected table-result text type');
        if(b.type==='pack'&&typeof b.documentCollection==='string'&&/^[\w-]+\.[\w-]+$/.test(b.documentCollection)&&itemId(b.documentId)){expected.type='document';expected.name=b.text;expected.documentUuid=`Compendium.${b.documentCollection}.${b.documentId}`;expected.description='';if(b.documentUuid!=null&&b.documentUuid!==expected.documentUuid||b.name!=null&&b.name!==b.text||b.description)errors.push('Conflicting modern table-result coordinates/text');}
        else if(b.type==='text')expected.description=b.text;
        else errors.push('Unexpected table-result predecessor/target');
        delete expected.text;delete expected.documentCollection;delete expected.documentId;
    }
    if(!same(expected,a))errors.push('Unexpected core conversion field/value');return errors;
}
export function auditCoreConversions(records){
    if(!Array.isArray(records))return ['Conversion records required'];const c=FEATURE_REVIEW_ATTEMPT_CONTRACT,errors=[],seen=new Set(),counts=new Map(c.conversion.databases.map(p=>[p.database,{total:0,primary:0,embedded:0,folders:0,legacySources:0,exportSources:0,packResults:0,textResults:0,pageCategories:0}]));let changed=0;
    const roots=new Set(records.filter(r=>r&&c.conversion.databases.some(p=>p.database===r.database&&p.type===r.documentType)).map(r=>JSON.stringify([r.database,r.before?._id])));
    for(const r of records){errors.push(...coreConversionRowErrors(r));const key=JSON.stringify([r?.database,r?.coordinate]);if(seen.has(key))errors.push('Duplicate conversion coordinate');seen.add(key);const count=counts.get(r?.database);if(count){count.total++;const embedded=['TableResult','JournalEntryPage'].includes(r.documentType);count[r.documentType==='Folder'?'folders':embedded?'embedded':'primary']++;if(embedded&&!roots.has(JSON.stringify([r.database,r.parentId])))errors.push('Embedded parent coordinate absent');if(r.before?.flags?.core?.sourceId!==undefined)count.legacySources++;if(r.before?.flags?.exportSource!==undefined)count.exportSources++;if(r.documentType==='TableResult')count[r.before?.type==='pack'?'packResults':'textResults']++;if(r.documentType==='JournalEntryPage'&&!Object.hasOwn(r.before??{},'category'))count.pageCategories++;}if(!same(r?.before,r?.after))changed++;}
    for(const p of c.conversion.databases)for(const key of ['total','primary','embedded','folders'])if(counts.get(p.database)[key]!==p[key])errors.push('Incomplete database '+key+' denominator '+p.database);
    for(const p of c.conversion.databases)for(const[key,value]of Object.entries(p.transformations))if(counts.get(p.database)[key]!==value)errors.push('Core transformation count mismatch '+p.database+'/'+key);
    if(records.length!==c.conversion.totals.stored)errors.push('Incomplete full conversion denominator');if(changed!==c.conversion.totals.changed)errors.push('Changed-record denominator mismatch');return errors;
}
export function classifyCoreConversions(records){const errors=auditCoreConversions(records);return {changeClass:errors.length?'unexpected-or-incomplete':'matches-planned-core-conversion',admission:'pending',mayProceed:false,errors};}

export function featureReviewAttemptErrors(e,previousStopped){
    const c=FEATURE_REVIEW_ATTEMPT_CONTRACT,errors=[],check=(ok,s)=>{if(!ok)errors.push(s);};
    if(!plain(e))return ['Attempt object required'];
    check(same(Object.keys(e).sort(),Object.keys(createPendingFeatureReviewAttempt()).sort()),'Unknown/missing attempt field');
    for(const key of ['resources','accessChanges','runtime','cases'])if(!Array.isArray(e[key]))return [...errors,'Attempt array required: '+key];
    if(['resources','runtime','cases'].some(key=>e[key].some(row=>!plain(row))))return [...errors,'Malformed attempt array entry'];
    check(e.schemaVersion===1&&e.contract===c.id&&e.kind==='feature-review-attempt'&&e.status==='prepared','Fixed preparation contract/status required');
    check(same(e.admission,{status:'pending',ownerDecision:null,actionTimeDecision:null,setupExitVerified:false}),'Record cannot manufacture owner/action-time/Setup admission');
    check(same(e.pin,c.pin)&&same(e.target,c.target)&&same(e.accounts,c.accounts)&&same(e.coveredPlayers,c.coveredPlayers),'Original artifact/runtime/world/accounts required');
    check(same(e.previous,c.previous),'Previous stopped attempt/proofs/residual history changed');
    check(featureReviewEvidenceErrors(previousStopped).length===0,'Unchanged independently pinned stopped record required');
    check(same(e.fixturePlan,c.fixtures)&&same(e.accessPlan,c.access)&&same(e.conversionPlan,c.conversion),'Finite fixture/access/exact conversion plan changed');
    check(e.attempt?.mode==='not-run'&&e.attempt.id===null||e.attempt?.mode==='synthetic'&&typeof e.attempt.id==='string'&&e.attempt.id.startsWith('synthetic-'),'No fresh live batch is admitted');
    const resources=Array.isArray(e.resources)?e.resources:[];check(Array.isArray(e.resources),'Fixture resources required');
    if(e.attempt?.mode==='not-run')check(resources.length===0,'Unexecuted preparation cannot contain created fixtures');
    const uuids=new Set(),roles=new Set();for(const r of resources){const role=c.fixtures.roles.find(p=>p.role===r?.role);check(Boolean(role)&&role.kind===r.kind&&role.type===r.type&&!roles.has(r.role),'Unapproved/duplicate fixture role/type');roles.add(r?.role);check(r?.created===false&&r?.synthetic===true&&r?.batch===e.attempt.id,'No native fixture creation admitted');check(itemId(r?.id)&&!protectedProductionIds.has(r.id)&&typeof r?.uuid==='string'&&!uuids.has(r.uuid),'Fixture identity invalid/duplicate/production');uuids.add(r?.uuid);if(!role)continue;
        if(role.kind==='Actor')check(r.uuid===`Actor.${r.id}`,'Actor target coordinate changed');else if(role.kind==='worldItem')check(r.uuid===`Item.${r.id}`,'World Item coordinate changed');else if(role.kind==='Macro')check(r.uuid===`Macro.${r.id}`,'Macro coordinate changed');else if(role.kind==='Pack')check(r.uuid===`Compendium.${c.fixtures.pack}`&&r.collection===c.fixtures.pack,'Test pack coordinate changed');else{const parent=resources.find(p=>p.role===role.parent);check(Boolean(parent)&&r.parentUuid===parent.uuid&&r.uuid===(role.kind==='packItem'?`Compendium.${c.fixtures.pack}.Item.${r.id}`:`${parent?.uuid}.Item.${r.id}`),'Embedded/pack target coordinate changed');}}
    if(resources.length)check(resources.length===23&&roles.size===23,'Finite fixture manifest incomplete');
    check(Array.isArray(e.accessChanges)&&e.accessChanges.length===0,'No access/security change admitted');
    const runtime=Array.isArray(e.runtime)?e.runtime:[];check(runtime.length===16&&new Set(runtime.map(r=>r?.path)).size===16,'Complete runtime denominator');for(const r of runtime){const known=Object.hasOwn(c.runtime,r?.path);check(known&&r.packaged===c.runtime[r.path],'Packaged runtime mismatch');if(!r)continue;for(const key of ['installed','served']){if(r[key]!==null)check(known&&r[key]===c.runtime[r.path],key+' runtime mismatch');check(r[key]===null,key+' execution claim unadmitted');}}
    check(e.conversion?.state==='not-run'&&Array.isArray(e.conversion.records)&&e.conversion.records.length===0,'Core conversion remains unadmitted');
    const cases=Array.isArray(e.cases)?e.cases:[];check(cases.length===28&&new Set(cases.map(r=>r?.id)).size===28&&c.cases.every(id=>cases.some(r=>r?.id===id)),'Fixed28-case denominator');
    for(const row of cases){if(!plain(row)){errors.push('Case object required');continue;}check(same(row.expected,c.casePlans.find(p=>p.id===row.id)),'Fixed case expectations required');check(['not-run','synthetic-observation'].includes(row.result),'Native outcomes unadmitted');if(row.result==='not-run')check(row.observed===null&&Array.isArray(row.raw)&&row.raw.length===0&&typeof row.reason==='string'&&row.reason.length>0,'Not-run cannot claim observation');else{check(e.attempt?.mode==='synthetic'&&row.observed?.source==='synthetic','Synthetic observations are not native execution');errors.push(...reviewAttemptObservationErrors(row.id,row.observed,resources));check(Array.isArray(row.raw)&&row.raw.length>0,'Raw synthetic observation binding required');for(const ref of Array.isArray(row.raw)?row.raw:[])check(ref?.private===true&&/^raw\/[A-Za-z0-9._-]+\.json$/.test(ref.path)&&digest(ref.sha256),'Raw observation path/hash invalid');}}
    const cancelled=e.restoration?.state==='cancelled';check(same(e.restoration,{state:cancelled?'cancelled':'not-run',priorResidualRetained:true,fullyRestored:false,cancelled}),'Restoration/cancellation cannot erase prior residual changes');
    if(cancelled)check(resources.length===0&&cases.every(r=>r?.result==='not-run'),'Cancelled preparation cannot claim fixture/native execution');
    check(same(e.claims,{nativeComplete:false,authorized:false,administratorAccess:false,previousWorldUnchanged:false,full05:false,pre06:false,gameplay:false,merge:false,release:false}),'Native/authorization/restoration/acceptance claims refused');return [...new Set(errors)];
}
export function evaluateFeatureReviewAttempt(e,previousStopped,{requireNativeComplete=false}={}){
    const errors=featureReviewAttemptErrors(e,previousStopped);if(requireNativeComplete)errors.push('Native completion refused: independent fresh admission/evidence review pending');
    return {integrity:errors.length?'failed':'passed',admission:'pending',nativeAccepted:false,nativeCases:{passed:0,failed:0,notRun:28},syntheticObservations:Array.isArray(e?.cases)?e.cases.filter(c=>c?.result==='synthetic-observation').length:0,externalDecisions:[...FEATURE_REVIEW_ATTEMPT_CONTRACT.externalDecisions],errors};
}
