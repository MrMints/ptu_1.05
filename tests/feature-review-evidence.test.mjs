import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {FEATURE_REVIEW_PIN as pin,FEATURE_REVIEW_CASES as ids,FEATURE_REVIEW_RUNTIME as runtime,featureReviewEvidenceErrors as errors,replayFeatureReviewCaptures as replay} from '../tools/check-feature-review-evidence.mjs';
import {nativeGuard,ownedFixture,nativeCaseIds} from '../tools/foundry-feature-review-check.mjs';
const hash='a'.repeat(64),copy=structuredClone;
function control(){
    const counts={Actor:4,embeddedItem:11,worldItem:4,packItem:2,Macro:1,Pack:1},batch='synthetic-unit-control';let n=0;
    return {schemaVersion:1,status:'completed',batch,pin:copy(pin),target:{world:pin.world,title:'PTU verification (disposable)',worldPath:'D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/worlds/ptu-verification',systemPath:'D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/systems/ptu'},accounts:{users:[{id:pin.player,name:'PTU 02 Player',role:1},{id:pin.gm,name:'Gamemaster',role:4}],coveredPlayers:[pin.player]},preflight:{privateBackupsVerified:true,noReparsePoints:true,stoppedBeforeMutation:true,schemaVersion:0.115,migrationRequired:false,thirdPartyModulesEnabled:false},manifest:{expectedCounts:counts,resources:Object.entries(counts).flatMap(([kind,count])=>Array.from({length:count},()=>({uuid:`Synthetic.${++n}`,id:`unit${n}`,kind,role:kind==='Actor'?'target-trainer':'control',batch,created:true})))},runtime:Object.entries(runtime).map(([path,packaged])=>({path,packaged,installed:packaged,served:packaged})),cases:ids.map(id=>({id,result:'passed',expected:'Synthetic structural control, never native evidence',observed:{native:true,coreVersion:pin.core,world:pin.world,userId:id.startsWith('gm-')?pin.gm:pin.player,statePreserved:true,beforeSha256:hash,afterSha256:hash,checks:[{name:'synthetic',passed:true}],launchStatus:/denied|pack-none|pack-revoked/.test(id)?'not-opened':'review-requested',bodyExecuted:true,dismissed:true,consentType:'undefined'},raw:[{path:`raw/${id}.json`,sha256:hash,private:true}]})),mutations:[],screenshots:['gm-trainer-core-to-optional','player-trainer-review'].map(id=>({path:`screenshots/${id}.jpg`,sha256:hash,private:true,caseIds:[id]})),access:{packPlayerTransitions:['NONE','OBSERVER','NONE'],trusted:'NONE',assistant:'NONE',otherPackSettingsUnchanged:true},restoration:Object.fromEntries(['fixturesRemoved','accessRestored','preexistingDocumentsUnchanged','usersRolesPermissionsUnchanged','priorSystemRestored','serverStopped','portFree','lockReleased','privateBackupsRetained'].map(k=>[k,true]).concat([['uncertain',false]])),claims:{nativeAllCasesPassed:true,full05:false,pre06:false,acquisition:false,replacement:false,duplicateBenefitPrevention:false,release:false,independentAcceptance:false}};
}
const stoppedEvidence=JSON.parse(await readFile(new URL('../docs/validation/p05-feature-review-native.json',import.meta.url),'utf8'));
test('checked-in stopped evidence is honest and controller denominator agrees',()=>{assert.deepEqual(errors(stoppedEvidence),[]);assert.deepEqual(nativeCaseIds,ids);});
test('complete synthetic structural control is accepted without being native evidence',()=>assert.deepEqual(errors(control()),[]));
const changes={
    'wrong artifact':e=>e.pin.artifact++, 'wrong accepted runtime':e=>e.pin.commit='0'.repeat(40), 'wrong world':e=>e.target.world='campaign',
    'extra principal':e=>e.accounts.users.push({id:'unexpected',role:1}), 'broader PLAYER set':e=>e.accounts.coveredPlayers.push('unexpected'),
    'missing private backup':e=>e.preflight.privateBackupsVerified=false, 'migration':e=>e.preflight.migrationRequired=true,
    'missing case':e=>e.cases.pop(), 'duplicate case':e=>e.cases[1]=copy(e.cases[0]), 'wrong native user':e=>e.cases[0].observed.userId=pin.player,
    'service double claim':e=>e.cases[0].observed.native=false, 'missing capture':e=>e.cases[0].raw=[], 'public capture':e=>e.cases[0].raw[0].private=false,
    'changed raw hash format':e=>e.cases[0].raw[0].sha256='bad', 'review mutation':e=>e.cases[0].observed.afterSha256='b'.repeat(64),
    'unsupported pass':e=>e.cases[0].observed.checks[0].passed=false, 'direct denial not executed':e=>e.cases.find(c=>c.id==='player-denied-actor').observed.bodyExecuted=false,
    'dismissal consent':e=>e.cases.find(c=>c.id==='gm-close').observed.consentType='object', 'missing served binding':e=>e.runtime[0].served=null,
    'changed packaged hash':e=>e.runtime[0].packaged='b'.repeat(64), 'missing runtime path':e=>e.runtime.pop(),
    'extra fixture':e=>e.manifest.resources.push({...e.manifest.resources[0],uuid:'Synthetic.extra'}), 'adopted fixture':e=>e.manifest.resources[0].created=false,
    'wrong batch':e=>e.manifest.resources[0].batch='other', 'production ID':e=>e.manifest.resources[0].id='ViZpn17qLA4ACQGa',
    'unmanifested mutation':e=>e.mutations.push({kind:'delete',uuid:'Actor.preexisting',userId:pin.gm}),
    'player mutation':e=>e.mutations.push({kind:'delete',uuid:e.manifest.resources[0].uuid,userId:pin.player}),
    'extra access principal':e=>e.mutations.push({kind:'access',uuid:e.manifest.resources[0].uuid,userId:pin.gm,principal:'other',level:2}),
    'fixture rules update':e=>e.mutations.push({kind:'fresh-capture',uuid:e.manifest.resources[0].uuid,userId:pin.gm,paths:['system.rules']}),
    'TRUSTED role mutation':e=>e.mutations.push({kind:'pack-configuration',uuid:e.manifest.resources.find(r=>r.kind==='Pack').uuid,userId:pin.gm,role:'TRUSTED',level:'OBSERVER'}),
    'pack access not revoked':e=>e.access.packPlayerTransitions.pop(), 'other pack changed':e=>e.access.otherPackSettingsUnchanged=false,
    'missing screenshot':e=>e.screenshots.pop(), 'screenshot path escape':e=>e.screenshots[0].path='../private.jpg',
    'uncertain restoration':e=>e.restoration.uncertain=true, 'system not restored':e=>e.restoration.priorSystemRestored=false,
    'failed case completed':e=>e.cases[0].result='failed', 'not-run success claim':e=>e.cases[0]={...e.cases[0],result:'not-run',reason:'Never executed'},
    'full05 claim':e=>e.claims.full05=true, 'review acceptance claim':e=>e.claims.independentAcceptance=true,
    'migration reported as complete':e=>e.executionGate={migrationObserved:true},'malformed cases':e=>e.cases={},'null case':e=>e.cases[0]=null,
    'malformed raw references':e=>e.cases[0].raw={},'malformed resources':e=>e.manifest.resources={},'null runtime':e=>e.runtime[0]=null,
    'unexecuted positive launcher':e=>e.cases[0].observed.bodyExecuted=false,
    'denied fixture access grant':e=>{e.manifest.resources[0].role='denied-trainer';e.mutations.push({kind:'access',uuid:e.manifest.resources[0].uuid,userId:pin.gm,principal:pin.player,level:2});},
    'unlisted level field':e=>e.mutations.push({kind:'fresh-capture',uuid:e.manifest.resources[0].uuid,userId:pin.gm,paths:['system.level.unlisted']})
};
for(const [label,change]of Object.entries(changes))test('rejects '+label,()=>{const e=control();change(e);assert.ok(errors(e).length);});
test('native resolution denial retains proof and is not direct launcher coverage',()=>{const e=control(),c=e.cases.find(c=>c.id==='player-pack-none');c.result='not-run';c.reason='Native resolution denied before launcher';c.observed.bodyExecuted=false;c.observed.resolutionDenied=true;e.claims.nativeAllCasesPassed=false;assert.deepEqual(errors(e),[]);c.raw=[];assert.ok(errors(e).length);});
test('blocked startup retains its gate without claiming native review completion',()=>{const e=control();e.status='blocked';e.claims.nativeAllCasesPassed=false;e.cases=e.cases.map(c=>({...c,result:'not-run',reason:'Stopped at startup migration',observed:null,raw:[]}));e.executionGate={status:'blocked',reason:'Observed native package migration',migrationObserved:true,raw:[{private:true,path:'logs/server-stdout.log',sha256:hash}]};assert.deepEqual(errors(e),[]);e.executionGate.raw=[];assert.ok(errors(e).length);});
test('raw replay rejects missing, altered and substituted observations/screenshots',async()=>{
    const dir=await mkdtemp(join(tmpdir(),'p05-evidence-unit-'));assert.ok(resolve(dir).startsWith(resolve(tmpdir())+ '\\')||resolve(dir).startsWith(resolve(tmpdir())+'/'));
    try{await mkdir(join(dir,'raw'));await mkdir(join(dir,'screenshots'));const e=control();for(const c of e.cases){const bytes=JSON.stringify({caseId:c.id,summary:c.observed});await writeFile(join(dir,c.raw[0].path),bytes);c.raw[0].sha256=createHash('sha256').update(bytes).digest('hex');}for(const ref of e.screenshots){const bytes=Buffer.from('synthetic image control');await writeFile(join(dir,ref.path),bytes);ref.sha256=createHash('sha256').update(bytes).digest('hex');}assert.deepEqual(await replay(e,dir),[]);await writeFile(join(dir,e.cases[0].raw[0].path),'{}');assert.ok((await replay(e,dir)).some(x=>x.includes('Changed raw')));await writeFile(join(dir,e.screenshots[0].path),'changed');assert.ok((await replay(e,dir)).some(x=>x.includes('Changed screenshot')));const escaped=copy(e);escaped.cases[0].raw[0].path='../outside.json';assert.ok((await replay(escaped,dir)).includes('Raw path escape'));}finally{await rm(dir,{recursive:true});}
});
test('controller guards exact identity/accounts and ownership before mutation',()=>{const e=control(),identity={world:pin.world,title:e.target.title,core:pin.core,system:'ptu',systemVersion:pin.system,user:pin.gm,accounts:e.accounts.users};assert.doesNotThrow(()=>nativeGuard(e,identity,{gm:true}));for(const change of [i=>i.world='campaign',i=>i.accounts.push({id:'new',role:1}),i=>i.user=pin.player]){const i=copy(identity);change(i);assert.throws(()=>nativeGuard(e,i,{gm:true}),/STOP/);}const r=e.manifest.resources[0];assert.equal(ownedFixture(e.manifest.resources,r.uuid,e.batch),r);assert.throws(()=>ownedFixture(e.manifest.resources,'Actor.preexisting',e.batch));assert.throws(()=>ownedFixture(e.manifest.resources,r.uuid,'other'));});
test('controller refuses to resume a recorded migration hold',()=>{const e=control();e.status='blocked';assert.throws(()=>nativeGuard(e,{}),/recorded native execution hold/);});
const stoppedChanges={
    'missing blocked reason':e=>delete e.executionGate.reason,'missing blocked proof':e=>e.executionGate.raw=[],
    'omitted private closure binding':e=>e.executionGate.raw=e.executionGate.raw.filter(r=>r.path!=='raw/offline-closure-final.json'),
    'changed backup pin':e=>e.preflight.systemBackupEntriesSha256='b'.repeat(64),'false session entry':e=>e.executionGate.sessionEntered=true,
    'false native pass':e=>e.cases[0]=copy(control().cases[0]),'false served certification':e=>e.runtime[0].served=e.runtime[0].packaged,
    'false screenshot claim':e=>e.screenshots=copy(control().screenshots),'false complete restoration':e=>e.restoration.preexistingDocumentsUnchanged=true,
    'erased uncertainty':e=>e.restoration.uncertain=false,'erased timestamp changes':e=>e.restorationDetail.settingMetadataChanges=[],
    'erased manifest changes':e=>e.restorationDetail.worldManifestChanges=[],'false Setup return':e=>e.restorationDetail.returnToSetup=true,
    'changed migration denominator':e=>e.executionGate.totalMigratedRecords--,'false gameplay verification':e=>e.offlineDiagnosis.gameplayVerified=true,
    'omitted not-run expectation':e=>delete e.cases[0].expected,'invented not-run observation':e=>e.cases[0].observed={native:true}
};
for(const[label,change]of Object.entries(stoppedChanges))test('rejects stopped-run '+label,()=>{const e=copy(stoppedEvidence);change(e);assert.ok(errors(e).length);});
test('blocked raw replay rejects missing, altered and semantically substituted offline proof',async()=>{
    const dir=await mkdtemp(join(tmpdir(),'p05-blocked-unit-'));assert.ok(resolve(dir).startsWith(resolve(tmpdir())+'\\')||resolve(dir).startsWith(resolve(tmpdir())+'/'));
    try{await mkdir(join(dir,'raw'));const e=copy(stoppedEvidence),p='raw/offline-closure-final.json',bytes=JSON.stringify({summary:{offlineDiagnosis:e.offlineDiagnosis,restorationDetail:e.restorationDetail,screenshotDisposition:e.screenshotDisposition}});e.executionGate.raw=[{path:p,private:true,sha256:createHash('sha256').update(bytes).digest('hex')}];assert.ok((await replay(e,dir)).some(s=>s.startsWith('Missing execution-gate')));await writeFile(join(dir,p),bytes);assert.deepEqual(await replay(e,dir),[]);e.offlineDiagnosis.changedStoredRecords--;assert.ok((await replay(e,dir)).some(s=>s.startsWith('Offline diagnosis/preservation differs')));await writeFile(join(dir,p),'{}');assert.ok((await replay(e,dir)).some(s=>s.startsWith('Changed execution-gate')));}finally{await rm(dir,{recursive:true});}
});
