import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

export const FEATURE_REVIEW_PIN=Object.freeze({commit:'e63595a2f6bb51358d5b66a66b594e6868e5286b',run:41250223014,artifact:13061542688,
    outerSha256:'be63c04bf0e555c513a5ae933ca3ddb3991fde4dae0a9ae3f93df54698854710',
    innerSha256:'7a6b89a38cd602a4643dce9cd1022b43cacd5f2b645f91013c2a48fdb929e8cd',core:'13.351',system:'4.4.3',world:'ptu-verification',
    gm:'lMqIt6G1J6gh89ut',player:'iVkqwxalI3cGJahD'});
export const FEATURE_REVIEW_CASES=Object.freeze([
    'gm-trainer-core-to-optional','gm-pokemon-optional-to-core','gm-owned-repeats-membership','gm-incoming-batch-conflicts',
    'gm-unresolved-custom','gm-escaped-render-focus-scroll','gm-close','gm-cancel','gm-escape','gm-header-close','gm-repeated-dismissal',
    'gm-fresh-capture','gm-reload-preservation','player-trainer-review','player-pokemon-review','player-source-parent-readable',
    'player-denied-actor','player-denied-incoming','player-denied-source-parent','player-pack-none','player-pack-observer','player-pack-revoked',
    'player-close','player-cancel','player-escape','player-header-close','player-repeated-dismissal','player-reload-preservation'
]);
export const FEATURE_REVIEW_RUNTIME=Object.freeze({
    'system.json':'f9009d19bace3df3008cb17d2476c6b59dad85733a34f968ea022610c09afea2',
    'template.json':'153a42fcfd7449f3de6d87949ec05c569c1e33eae6fbdd79f0ab8f46282ca7c9',
    'src/ptr.js':'fc02e7cfef9d3c16772a12b2833e7a2a9a6a092172f900e8dede32fc4f18d45c',
    'src/scripts/hooks/ready.js':'7e492ec2fa9d3223c0cfba68f1a31d32d035540d976ee2b9f1b9229376c76d6a',
    'src/module/migration/runner/base.js':'ac6c76f47aa9df4a2b0cda6a71e6f1351068fcf2ded22e14250b08c575c39489',
    'src/module/apps/feature-acquisition-review-launcher.js':'8d221eed995dc90b55866d6933f0f7c3992a30ccb5723a7cc66991d0725c4cdf',
    'src/module/apps/feature-acquisition-review.js':'cffc668c7c47068d85ada8820755a2b982e40e2d5e02078950a204f7833a6fbd',
    'src/util/rule-version-acquisition-review.js':'2d5083e7229af4994bcf9f9f7f28bbe89ce23a2d58786876fd4ffa42f97d195b',
    'src/util/rule-version-registry.js':'93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5',
    'src/util/rule-version-preview.js':'12ffc1c984f78034bb15d2af7d466f4cd583e70e54520cda97315a944735664f',
    'src/util/rule-versions.js':'ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9',
    'src/util/prerequisites.js':'d3a6626420c26f52e31b07fd428cf63a455a6bcfc36b7a979a62bf34400d3649',
    'src/util/skills.js':'5bb8390d3bf44e4dddfeca8534a7c0a35e74b380e39f203e8e671d41ad4aea76',
    'src/util/document-source.js':'86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0',
    'static/templates/apps/feature-acquisition-review.hbs':'f435949aa8db9bf3f1bfc54b9c2f66e4b0efb65ec36c22a1964642bb56572ba6',
    'static/lang/en.json':'f4d4b9de4093e7ec4b12b1f5f7d19dd2730950a381410282abff39485140c0fa'
});
const hashPattern=/^[a-f0-9]{64}$/;
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const forbiddenIds=new Set(['ViZpn17qLA4ACQGa','celnYjQjM3jjtAnZ','e9dQ3NmVm7EuQBO5','i1OAz3lvuCRIm3n9','UKk9BnAZtm1xMoRB']);
const expectedCounts={Actor:4,embeddedItem:11,worldItem:4,packItem:2,Macro:1,Pack:1};
const backupPins={worldBackupEntriesSha256:'daf6cad8948b8893ef14a8382db9e1a980ee46e72d0caa7bf01dda25cf76d6b2',systemBackupEntriesSha256:'baa475a74bab1ce68b27dc0e1514335688192b2f1b2cd6d4acfe79d79bd89e5b'};
export function featureReviewEvidenceErrors(evidence) {
    const errors=[],check=(ok,why)=>{if(!ok)errors.push(why);};
    if(!evidence||typeof evidence!=='object')return ['Evidence object required'];
    for(const key of ['cases','runtime','mutations','screenshots'])if(!Array.isArray(evidence[key]))return ['Evidence array required: '+key];
    if(!Array.isArray(evidence.manifest?.resources))return ['Fixture manifest array required'];
    if(evidence.cases.some(c=>!c||typeof c!=='object'||!Array.isArray(c.raw))||evidence.manifest.resources.some(r=>!r||typeof r!=='object')||evidence.runtime.some(r=>!r||typeof r!=='object')||evidence.mutations.some(r=>!r||typeof r!=='object'))return ['Malformed evidence entry'];
    check(evidence.schemaVersion===1,'Evidence schema');check(['prepared','completed','blocked'].includes(evidence.status),'Execution status');
    check(same(evidence.pin,FEATURE_REVIEW_PIN),'Pinned artifact/runtime identity');
    check(evidence.target?.world===FEATURE_REVIEW_PIN.world&&evidence.target?.title==='PTU verification (disposable)','Exact disposable world');
    check(evidence.target?.worldPath==='D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/worlds/ptu-verification'
        &&evidence.target?.systemPath==='D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/systems/ptu','Contained target paths');
    check(same(evidence.accounts?.users,[{id:FEATURE_REVIEW_PIN.player,name:'PTU 02 Player',role:1},{id:FEATURE_REVIEW_PIN.gm,name:'Gamemaster',role:4}]),'Unexpected account/principal');
    check(same(evidence.accounts?.coveredPlayers,[FEATURE_REVIEW_PIN.player]),'PLAYER role coverage');
    check(evidence.preflight?.privateBackupsVerified===true&&evidence.preflight?.noReparsePoints===true&&evidence.preflight?.stoppedBeforeMutation===true,'Verified private offline backup/containment');
    check(evidence.preflight?.schemaVersion===0.115&&evidence.preflight?.thirdPartyModulesEnabled===false&&(evidence.preflight?.migrationRequired===false||evidence.status==='blocked'&&evidence.preflight?.migrationRequired===true&&evidence.executionGate?.migrationObserved===true),'Migration/startup hold');
    check(evidence.claims?.full05===false&&evidence.claims?.pre06===false&&evidence.claims?.acquisition===false&&evidence.claims?.replacement===false
        &&evidence.claims?.duplicateBenefitPrevention===false&&evidence.claims?.release===false&&evidence.claims?.independentAcceptance===false,'Unsupported scope/acceptance claim');
    if(evidence.status==='blocked'){
        check(evidence.executionGate?.status==='blocked'&&typeof evidence.executionGate.reason==='string'&&evidence.executionGate.reason.length>0,'Blocked execution explanation');
        const refs=Array.isArray(evidence.executionGate?.raw)?evidence.executionGate.raw:[];
        check(refs.length>0,'Blocked execution evidence');
        for(const ref of refs)check(ref?.private===true&&/^(?:raw\/[A-Za-z0-9._-]+\.json|logs\/[A-Za-z0-9._-]+\.log)$/.test(ref?.path)&&hashPattern.test(ref?.sha256),'Private execution-gate evidence');
        if(evidence.executionGate?.kind==='startup-core-package-migration'){
            check(same(refs.map(r=>r?.path).sort(),['logs/server-stderr.log','logs/server-stdout.log','raw/offline-closure-final.json','raw/offline-closure.json','raw/startup-stop.json']),'Complete retained startup/closure proof set');
            for(const[key,value]of Object.entries(backupPins))check(evidence.preflight?.[key]===value,'Original private backup pin '+key);
            check(evidence.executionGate.migrationObserved===true&&evidence.executionGate.sessionEntered===false&&evidence.executionGate.fixtureSetup===false&&evidence.executionGate.packRoleGrantApplied===false,'Stopped before session/fixtures/access');
            check(evidence.cases.every(c=>c.result==='not-run'&&c.observed===null&&c.raw.length===0)&&evidence.manifest.resources.length===0&&evidence.mutations.length===0,'Startup stop cannot claim native case/fixture coverage');
            check(evidence.runtime.every(r=>r.served===null)&&evidence.screenshots.length===0&&evidence.screenshotDisposition==='unsaved-owner-directed','No served-module/screenshot certification');
            check(evidence.restoration?.preexistingDocumentsUnchanged===false&&evidence.restoration?.uncertain===true&&evidence.restorationDetail?.worldOverwritten===false&&evidence.restorationDetail?.returnToSetup===false,'Residual world/Setup restoration hold');
            check(evidence.restorationDetail?.settingsValuesUnchanged===true&&evidence.restorationDetail?.userRecordsCanonicalUnchanged===true,'Bounded protected-data preservation');
            check(same(evidence.restorationDetail?.settingMetadataChanges,[{key:'core.moduleConfiguration',paths:['_stats.modifiedTime']},{key:'core.compendiumConfiguration',paths:['_stats.modifiedTime']}]),'Retain setting timestamp changes');
            check(same(evidence.restorationDetail?.worldManifestChanges,['lastPlayed','packs.0.package','packs.0.id','packs.0.packageType','packs.0.packageName','packs.0.index','packs.0.folders']),'Retain world manifest changes');
            check(evidence.executionGate.totalMigratedRecords===7198&&Object.keys(evidence.executionGate.migratedPackRecords??{}).length===15&&Object.values(evidence.executionGate.migratedPackRecords??{}).reduce((a,b)=>a+b,0)===7198,'Logged primary migration denominator');
            check(evidence.offlineDiagnosis?.changedStoredRecords===9988&&evidence.offlineDiagnosis?.embeddedRecordsChanged===2790&&evidence.offlineDiagnosis?.recordIdsUnchanged===true&&evidence.offlineDiagnosis?.systemFieldsCanonicalUnchanged===true&&evidence.offlineDiagnosis?.gameplayVerified===false,'Offline physical-conversion limits');
        }
    }
    const resources=evidence.manifest?.resources??[],ids=new Set(),counts={};
    check(same(evidence.manifest?.expectedCounts,expectedCounts),'Finite fixture denominator');
    for(const r of resources){check(r.batch===evidence.batch&&r.created===true,'Manifest ownership marker');check(typeof r.uuid==='string'&&!ids.has(r.uuid),'Duplicate/missing fixture UUID');ids.add(r.uuid);check(!forbiddenIds.has(r.id),'Production ID allocated');check(Object.hasOwn(expectedCounts,r.kind),'Unapproved fixture kind');counts[r.kind]=(counts[r.kind]??0)+1;}
    for(const [kind,max]of Object.entries(expectedCounts))check((counts[kind]??0)<=max,'Fixture count exceeds '+kind);
    const cases=evidence.cases??[];check(Array.isArray(cases)&&cases.length===FEATURE_REVIEW_CASES.length,'Missing native case');
    check(new Set(cases.map(c=>c.id)).size===cases.length&&FEATURE_REVIEW_CASES.every(id=>cases.some(c=>c.id===id)),'Changed/duplicate case denominator');
    for(const c of cases){
        check(['passed','failed','not-run'].includes(c.result),'Case result '+c.id);
        check(typeof c.expected==='string'&&c.expected.length>0,'Expected outcome '+c.id);
        if(c.result==='not-run'&&!c.observed?.resolutionDenied){check(typeof c.reason==='string'&&c.reason.length>0&&c.observed===null&&c.raw.length===0,'Not-run reason/absence of observation '+c.id);continue;}
        if(c.result==='not-run'){check(typeof c.reason==='string'&&c.reason.length>0&&c.observed.bodyExecuted===false,'Resolution denial is not launcher body coverage '+c.id);}
        check(typeof c.expected==='string'&&c.expected.length>0,'Expected outcome '+c.id);
        check(c.observed?.coreVersion===FEATURE_REVIEW_PIN.core&&c.observed?.world===FEATURE_REVIEW_PIN.world&&c.observed?.native===true,'Native execution identity '+c.id);
        check(c.observed?.userId===(c.id.startsWith('gm-')?FEATURE_REVIEW_PIN.gm:FEATURE_REVIEW_PIN.player),'Native role '+c.id);
        check(Array.isArray(c.raw)&&c.raw.length>0,'Missing raw capture binding '+c.id);
        for(const ref of c.raw??[])check(ref.private===true&&/^raw\/[A-Za-z0-9._-]+\.json$/.test(ref.path)&&hashPattern.test(ref.sha256),'Private raw path/hash '+c.id);
        if(c.result==='passed'){
            check(c.observed?.bodyExecuted===true,'Launcher body coverage '+c.id);
            check(c.observed?.statePreserved===true&&hashPattern.test(c.observed.beforeSha256)&&c.observed.beforeSha256===c.observed.afterSha256,'Unapproved review mutation '+c.id);
            check(c.observed?.checks?.length>0&&c.observed.checks.every(x=>x.passed===true),'Unsupported passing claim '+c.id);
            if(/denied|pack-none|pack-revoked/.test(c.id))check(c.observed.launchStatus==='not-opened'&&c.observed.bodyExecuted===true,'Direct denial proof '+c.id);
            else check(c.observed.launchStatus==='review-requested','Actual review proof '+c.id);
            if(/close|cancel|escape|dismissal/.test(c.id))check(c.observed.dismissed===true&&c.observed.consentType==='undefined','Dismissal/no-consent '+c.id);
        }
    }
    for(const mutation of evidence.mutations??[]){
        const resource=resources.find(r=>r.uuid===mutation.uuid);
        check(ids.has(mutation.uuid)&&['create','access','fresh-capture','delete','pack-configuration','macro-tag'].includes(mutation.kind),'Unapproved mutation target/kind');
        check(mutation.userId===FEATURE_REVIEW_PIN.gm,'Mutation principal');
        if(mutation.kind==='fresh-capture')check(resource?.role==='target-trainer'&&Array.isArray(mutation.paths)&&same([...mutation.paths].sort(),['flags.ptu.p05ReviewCustom','system.level.milestones','system.skills.generalEd.value.value']),'Unapproved fixture update');
        if(mutation.kind==='access')check(mutation.principal===FEATURE_REVIEW_PIN.player&&[0,1,2].includes(mutation.level)&&['target-trainer','target-pokemon','source-parent','core-control','optional-control','unresolved-control','test-macro'].includes(resource?.role)&&(resource?.kind==='Macro'?mutation.level<=1:mutation.level!==1),'Unapproved access principal/level/resource');
        if(mutation.kind==='pack-configuration')check(resource?.kind==='Pack'&&resource?.role==='test-pack'&&mutation.role==='PLAYER'&&['NONE','OBSERVER'].includes(mutation.level),'Unapproved pack role/level');
        if(mutation.kind==='macro-tag')check(resource?.kind==='Macro'&&resource?.role==='test-macro','Unapproved macro tagging');
    }
    for(const binding of evidence.runtime??[]){check(Object.hasOwn(FEATURE_REVIEW_RUNTIME,binding.path)&&hashPattern.test(binding.packaged)&&FEATURE_REVIEW_RUNTIME[binding.path]===binding.packaged,'Packaged runtime hash');if(binding.installed!=null)check(binding.installed===binding.packaged,'Installed runtime hash');if(binding.served!=null)check(binding.served===binding.packaged,'Served runtime hash');}
    check((evidence.runtime??[]).length===Object.keys(FEATURE_REVIEW_RUNTIME).length&&new Set((evidence.runtime??[]).map(r=>r.path)).size===Object.keys(FEATURE_REVIEW_RUNTIME).length&&Object.keys(FEATURE_REVIEW_RUNTIME).every(path=>(evidence.runtime??[]).some(r=>r.path===path)),'Missing runtime binding');
    if(evidence.status==='completed'){
        check(evidence.executionGate?.migrationObserved!==true,'Observed migration cannot complete native review');
        for(const [kind,count]of Object.entries(expectedCounts))check(counts[kind]===count,'Incomplete fixture set '+kind);
        check(!cases.some(c=>c.result==='failed'),'Failed native result cannot complete');
        check(cases.every(c=>c.result==='passed'||c.observed?.resolutionDenied===true&&c.observed.bodyExecuted===false),'Unexecuted native result cannot complete');
        check(same(evidence.access?.packPlayerTransitions,['NONE','OBSERVER','NONE']),'Pack access transition/restoration');
        check(evidence.access?.trusted==='NONE'&&evidence.access?.assistant==='NONE'&&evidence.access?.otherPackSettingsUnchanged===true,'Unapproved pack/global access change');
        for(const binding of evidence.runtime??[])check(binding.installed===binding.packaged&&binding.served===binding.packaged,'Complete native byte binding');
        check((evidence.screenshots??[]).length>=2,'Native screenshots missing');
        check(new Set((evidence.screenshots??[]).map(ref=>ref.path)).size===(evidence.screenshots??[]).length,'Duplicate screenshot');
        for(const ref of evidence.screenshots??[])check(ref.private===true&&/^screenshots\/[A-Za-z0-9._-]+\.jpg$/.test(ref.path)&&hashPattern.test(ref.sha256)&&ref.caseIds?.some(id=>FEATURE_REVIEW_CASES.includes(id)),'Private screenshot path/hash');
        for(const role of ['gm-','player-'])check(evidence.screenshots?.some(ref=>ref.caseIds?.some(id=>id.startsWith(role))),'Missing role screenshot '+role);
        for(const key of ['fixturesRemoved','accessRestored','preexistingDocumentsUnchanged','usersRolesPermissionsUnchanged','priorSystemRestored','serverStopped','portFree','lockReleased','privateBackupsRetained'])check(evidence.restoration?.[key]===true,'Restoration proof '+key);
        check(evidence.restoration?.uncertain===false,'Restoration uncertainty');
    }
    check(evidence.claims?.nativeAllCasesPassed===cases.every(c=>c.result==='passed'),'Native success claim disagrees with results');
    return errors;
}

export async function replayFeatureReviewCaptures(evidence,rawDirectory) {
    const errors=[],root=resolve(rawDirectory);
    for(const ref of evidence.executionGate?.raw??[]){try{const file=resolve(root,ref.path),rel=relative(root,file);if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error();const bytes=await readFile(file);if(sha(bytes)!==ref.sha256)errors.push('Changed execution-gate evidence '+ref.path);if(ref.path==='raw/offline-closure-final.json'){const proof=JSON.parse(bytes);if(!same(proof.summary,{offlineDiagnosis:evidence.offlineDiagnosis,restorationDetail:evidence.restorationDetail,screenshotDisposition:evidence.screenshotDisposition}))errors.push('Offline diagnosis/preservation differs from private proof');}}catch{errors.push('Missing execution-gate evidence '+ref.path);}}
    for(const c of evidence.cases??[])for(const ref of c.raw??[]){const file=resolve(root,ref.path),rel=relative(root,file);if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep)){errors.push('Raw path escape');continue;}try{const bytes=await readFile(file);if(sha(bytes)!==ref.sha256)errors.push('Changed raw capture '+ref.path);const value=JSON.parse(bytes);if(value.caseId!==c.id||!same(value.summary,c.observed))errors.push('Raw observation differs '+c.id);}catch{errors.push('Missing/unreadable raw capture '+ref.path);}}
    for(const ref of evidence.screenshots??[]){try{const file=resolve(root,ref.path),rel=relative(root,file);if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error();if(sha(await readFile(file))!==ref.sha256)errors.push('Changed screenshot '+ref.path);}catch{errors.push('Missing screenshot '+ref.path);}}
    return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
    const evidence=JSON.parse(await readFile('docs/validation/p05-feature-review-native.json','utf8'));const errors=featureReviewEvidenceErrors(evidence);
    const at=process.argv.indexOf('--raw-dir');if(at>=0)errors.push(...await replayFeatureReviewCaptures(evidence,process.argv[at+1]));
    if(process.argv.includes('--require-complete')&&evidence.status!=='completed')errors.push('Native verification is not complete');
    console.log(JSON.stringify({integrity:errors.length?'failed':'passed',nativeStatus:evidence.status,passed:evidence.cases.filter(c=>c.result==='passed').length,failed:evidence.cases.filter(c=>c.result==='failed').length,notRun:evidence.cases.filter(c=>c.result==='not-run').length,errors}));if(errors.length)process.exitCode=1;
}
