// Explicit disposable-world controller. Importing this module performs no action.
import {FEATURE_REVIEW_ADMITTED_CONTRACT as admittedContract,publicAdmittedPacketErrors,publicAdmittedControlErrors,publicControlState,admittedIdentityErrors,admittedDataSha256} from './feature-review-admitted-contract.mjs';
export const nativeCaseIds=Object.freeze(['gm-trainer-core-to-optional','gm-pokemon-optional-to-core','gm-owned-repeats-membership','gm-incoming-batch-conflicts','gm-unresolved-custom','gm-escaped-render-focus-scroll','gm-close','gm-cancel','gm-escape','gm-header-close','gm-repeated-dismissal','gm-fresh-capture','gm-reload-preservation','player-trainer-review','player-pokemon-review','player-source-parent-readable','player-denied-actor','player-denied-incoming','player-denied-source-parent','player-pack-none','player-pack-observer','player-pack-revoked','player-close','player-cancel','player-escape','player-header-close','player-repeated-dismissal','player-reload-preservation']);
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const copy=value=>structuredClone(value);
const equal=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
// getData exposes membership through its own localized label map. Verify the
// captured stable identities/types as well; a collection count alone is partial.
export function hasCompleteMixedMembership(view) {
    try {
        const actor=JSON.parse(view.actor.snapshot),items=actor?.items;
        if(view.actor.membership!==view.labels.known||view.actor.status!==view.labels.complete||view.actor.snapshotAvailable!=='true'||view.actor.issues.length!==0||!Array.isArray(items)||items.length!==5||view.owned.length!==2)return false;
        const types=items.map(i=>i?.type).sort(),ids=items.map(i=>i?.uuid);
        if(!equal(types,['edge','feat','feat','item','pokeedge'])||ids.some(id=>typeof id!=='string')||new Set(ids).size!==5)return false;
        const features=items.filter(i=>i.type==='feat').map(i=>i.uuid);
        return view.owned.every((row,n)=>row.snapshotAvailable==='true'&&JSON.parse(row.snapshot)?.uuid===features[n]);
    } catch {return false;}
}
export function nativeGuard(config,identity,{gm=false}={}) {
    if(config.executionGate?.migrationObserved===true||config.status==='blocked')throw Error('STOP: recorded native execution hold; no automatic resumption');
    if(identity.world!==config.pin.world||identity.title!=='PTU verification (disposable)'||identity.core!==config.pin.core||identity.system!=='ptu'||identity.systemVersion!==config.pin.system)throw Error('STOP: native runtime/world identity mismatch');
    if(!equal(identity.accounts,config.accounts.users)||!equal(identity.accounts.filter(u=>u.role===1).map(u=>u.id),config.accounts.coveredPlayers))throw Error('STOP: unexpected principal/role');
    if(![config.pin.gm,config.pin.player].includes(identity.user)||gm&&identity.user!==config.pin.gm)throw Error('STOP: unauthorized mutation principal');
}
export function ownedFixture(manifest,uuid,batch,kind) {
    const rows=manifest.filter(r=>r.uuid===uuid);
    if(rows.length!==1||rows[0].batch!==batch||rows[0].created!==true||kind&&rows[0].kind!==kind)throw Error('STOP: fixture ownership uncertain');
    return rows[0];
}
async function digest(value){const bytes=typeof value==='string'?new TextEncoder().encode(value):value;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
export function featureReviewCheckpoint(state){return copy({phase:state.phase,resources:state.manifest,mappings:state.mappings,packMappings:state.packMappings,mutations:state.mutations,operations:state.operations,captures:state.captures,failure:state.failure});}
export function featureReviewPreparedFacts(actor,readable){return readable===true?{level:actor.system.level.current,rank:actor.system.skills.generalEd.value.total}:null;}
export function featureReviewRevokedDocuments(retained){if(!Array.isArray(retained)||retained.length!==2)throw Error('STOP: revoked review requires actual Documents retained in this browser from the permitted Observer phase');return retained;}
export function admittedControllerGuard(packet,identity,{gm=false,verifyExecution,operation='control',packetSha256=null,extra={}}={}) {
    const errors=publicAdmittedPacketErrors(packet);if(errors.length)throw Error('STOP: public packet invalid: '+errors.join('; '));
    if(packet.mode!=='native')throw Error('STOP: preparation/synthetic input cannot execute');
    const identityErrors=admittedIdentityErrors(identity,{gm});if(identityErrors.length||identity.user!==packet.audience.userId)throw Error('STOP: exact packet audience/world/runtime/principal required');
    if(typeof verifyExecution!=='function')throw Error('STOP: separate trusted operator execution checks required; JSON is not authority');
    if(verifyExecution(copy({policy:admittedContract.policy,gates:admittedContract.externalGates,batch:packet.batch,identity,anchor:packet.anchor,packetSha256,baselineChecks:packet.baselineChecks,operation,...extra}))!==undefined)throw Error('STOP: execution verifier must throw on refusal, not return approval booleans');
    nativeGuard({pin:admittedContract.pin,accounts:admittedContract.accounts},identity,{gm});
}
export function verifyFeatureReviewBootstrap(packet,identity,macro,verifyExecution){
    admittedControllerGuard(packet,identity,{gm:true,verifyExecution,operation:'bootstrap-macro'});
    if(!macro||macro.documentName!=='Macro'||macro.uuid!==packet.baselineChecks.bootstrapMacroUuid||macro.author?.id!==admittedContract.pin.gm||macro.ownership.default!==0||Object.entries(macro.ownership).some(([principal,level])=>principal==='default'?level!==0:principal!==admittedContract.pin.gm||level!==3)||macro.getFlag('ptu','p05ReviewBatch'))throw Error('STOP: new macro identity/ownership uncertain');
    admittedControllerGuard(packet,identity,{gm:true,verifyExecution,operation:'verify-private-macro-absence',extra:{macroUuid:macro.uuid,macroId:macro.id}});
}
export async function refreshFeatureReviewPacket({packet,next,exported,localEventCount,pendingReview,identity,verifyExecution,packetSha256},retainedReferences){
    if(pendingReview||!exported||exported.eventCount!==localEventCount)throw Error('STOP: unfinished review or unexported observations');
    if(exported.segment.firstFailure&&(!next.resume?.stopLatched||!packet.resume.stopLatched&&next.resume?.firstFailureRef!==await admittedDataSha256(exported.segment.firstFailure)))throw Error('STOP: local first failure not acknowledged');
    const errors=publicAdmittedPacketErrors(next);if(errors.length)throw Error('STOP: public refresh invalid: '+errors.join('; '));
    if(next.batch!==packet.batch||next.mode!==packet.mode||next.audience.userId!==packet.audience.userId||next.anchor.revision<=packet.anchor.revision||next.anchor.segmentId===packet.anchor.segmentId||packet.resume.stopLatched&&!next.resume.stopLatched||packet.resume.firstFailureRef&&next.resume.firstFailureRef!==packet.resume.firstFailureRef||exported.segment.captures.some(c=>!next.resume.completedCaseIds.includes(c.caseId)))throw Error('STOP: stale/forked refresh or cleared failure');
    admittedControllerGuard(next,identity,{verifyExecution,operation:'verify-private-segment-ack',packetSha256,extra:{precedingSegmentId:packet.anchor.segmentId,precedingSegmentSha256:exported.sha256}});
    return {packet:copy(next),retainedReferences};
}
export async function openFeatureReviewCheck({macro,inputs,packetBytes,verifyExecution}={}) {
    let plan=inputs,sourceBytes=packetBytes;if(!plan){const response=await fetch('/p05-review-checks/fixed-inputs.json',{cache:'no-store'});if(!response.ok)throw Error('Fixed public inputs unavailable');sourceBytes=await response.text();plan=JSON.parse(sourceBytes);}
    if(plan?.status==='blocked'||plan?.executionGate?.migrationObserved===true)nativeGuard(plan,{});
    const inputErrors=publicAdmittedPacketErrors(plan);if(inputErrors.length)throw Error('STOP: public packet invalid: '+inputErrors.join('; '));
    if(plan.mode!=='native')throw Error('STOP: preparation/synthetic input cannot execute');
    sourceBytes??=JSON.stringify(plan);if(!equal(JSON.parse(sourceBytes),plan))throw Error('STOP: packet byte/value mismatch');let activePacketSha256=await admittedDataSha256(sourceBytes);
    const config={pin:admittedContract.pin,accounts:admittedContract.accounts,batch:plan.batch,runtime:plan.runtime};
    const identity=()=>{if(game.world?.id!==admittedContract.pin.world||game.world?.title!==admittedContract.target.title||game.version!==admittedContract.pin.core||game.system?.id!=='ptu'||game.system?.version!==admittedContract.pin.system)throw Error('STOP: native world/runtime identity mismatch');return {world:game.world.id,title:game.world.title,core:game.version,system:game.system.id,systemVersion:game.system.version,user:game.user.id,accounts:game.users.map(u=>({id:u.id,name:u.name,role:u.role})).sort((a,b)=>a.id.localeCompare(b.id))};};
    let state=null,current=null,exported=null,activeOperation='open';
    const guard=(gm=false,operation=activeOperation)=>{admittedControllerGuard(plan,identity(),{gm,verifyExecution,operation,packetSha256:activePacketSha256});if(state){const seed=publicControlState(plan),control={phase:state.phase,resources:state.manifest,mappings:state.mappings,packMappings:state.packMappings,mutations:[...seed.mutations,...state.mutations],operations:[...seed.operations,...state.operations.filter(o=>['setup','grants','pack-access'].includes(o.kind))],captures:[],failure:null};const e=publicAdmittedControlErrors(control,{mode:plan.mode,batch:plan.batch,completedCaseIds:[...plan.resume.completedCaseIds,...state.captures.map(c=>c.caseId)]});if(e.length)throw Error('STOP: live fixture-control bounds: '+e.join('; '));if(exported&&!['export','refresh'].includes(operation))throw Error('STOP: exported segment awaits private acknowledgement');}};guard();
    if(game.settings.get('ptu','worldSchemaVersion')!==0.115||game.settings.get('ptu','worldSystemVersion')!=='4.4.3'||Object.values(game.settings.get('core','moduleConfiguration')).some(Boolean))throw Error('STOP: migration/module gate');
    const runtime=[];
    for(const binding of config.runtime){const r=await fetch(`/systems/ptu/${binding.path}`,{cache:'no-store'});if(!r.ok)throw Error('STOP: missing served runtime');const served=await digest(await r.arrayBuffer());runtime.push({...binding,served});if(served!==binding.packaged)throw Error(`STOP: served runtime mismatch ${binding.path}`);}
    const {launchFeatureAcquisitionReview:launch}=await import('/systems/ptu/src/module/apps/feature-acquisition-review-launcher.js');
    const {createRuleVersionRegistry}=await import('/systems/ptu/src/util/rule-version-registry.js');
    const navigation=()=>({timeOrigin:performance.timeOrigin,type:performance.getEntriesByType('navigation')[0]?.type??null});
    state={batch:config.batch,identity:identity(),runtime,navigation:navigation(),manifest:plan.resources.map(copy),mappings:copy(plan.mappings),packMappings:copy(plan.packMappings),phase:plan.phase,mutations:[],captures:[],operations:[],events:[],failure:null};
    let retainedPackDocuments=[],controller,packRegistry=state.packMappings.length?createRuleVersionRegistry(state.packMappings):null;
    if(packRegistry&&packRegistry.status!=='ready')throw Error('STOP: packet registry reconstruction failed');
    const operation=value=>{state.operations.push(copy(value));state.events.push({sequence:state.events.length,kind:'operation',value:copy(value)});};
    const record=(kind,resource,extra={})=>{const index=state.mutations.length;state.mutations.push({kind,uuid:resource.uuid,userId:game.user.id,batch:config.batch,...extra});state.events.push({sequence:state.events.length,kind:'mutation',index});};
    const captureRecord=value=>{const index=state.captures.length;state.captures.push(value);state.events.push({sequence:state.events.length,kind:'capture',index});};
    const fail=value=>{state.failure??=copy(value);if(state.phase==='initial')state.phase='cleanup';operation({kind:'failure',...copy(value)});};
    const stopped=()=>plan.resume.stopLatched||state.failure!==null;
    const priorOperation=kind=>plan.controlReceipts.some(o=>o.kind===kind)||state.operations.some(o=>o.kind===kind);
    const allMutations=()=>[...plan.controlReceipts.filter(r=>['create','macro-tag','access','pack-configuration','fresh-capture','delete','delete-with-parent'].includes(r.kind)),...state.mutations];
    if(state.manifest.length)operation({kind:'resume',userId:game.user.id,navigation:navigation()});
    const segment=()=>({packetId:plan.anchor.packetId,segmentId:plan.anchor.segmentId,parentRevision:plan.anchor.revision,parentCheckpointSha256:plan.anchor.checkpointSha256,packetSha256:activePacketSha256,identity:copy(state.identity),runtime:copy(runtime),navigation:copy(state.navigation),events:copy(state.events),mutations:copy(state.mutations),captures:copy(state.captures),controlState:{phase:state.phase,resources:copy(state.manifest),mappings:copy(state.mappings),packMappings:copy(state.packMappings)},firstFailure:copy(state.failure)});
    const output=()=>controller?.element?.find('[data-p05-output]').val(exported?exported.bytes:JSON.stringify({status:'unexported-local-observations',packetId:plan.anchor.packetId,segmentId:plan.anchor.segmentId,eventCount:state.events.length,stopLatched:stopped(),firstFailureRef:plan.resume.firstFailureRef}));
    const exportSegment=async()=>{guard(false,'export');if(current)throw Error('STOP: finish/dismiss the current review before export');const value=segment(),bytes=JSON.stringify(value);exported={segment:value,bytes,sha256:await admittedDataSha256(bytes),eventCount:state.events.length};output();return copy(value);};
    const flag=role=>({ptu:{p05ReviewBatch:config.batch,p05ReviewRole:role}});
    const ownership={default:0,[config.pin.gm]:3};
    const add=(document,kind,role)=>{const p=admittedContract.fixtures.roles.find(p=>p.role===role),r={uuid:kind==='Pack'?`Compendium.${document.collection}`:document.uuid,id:kind==='Pack'?document.collection:document.id,kind,role,type:document.type,batch:config.batch,created:true,synthetic:false};if(kind==='Pack'){r.type='Item';r.collection=document.collection;}if(p?.parent)r.parentUuid=state.manifest.find(r=>r.role===p.parent)?.uuid;state.manifest.push(r);record('create',r);return r;};
    const find=role=>state.manifest.find(r=>r.role===role);
    const doc=async role=>{const r=find(role);if(!r)throw Error('STOP: missing manifest role '+role);ownedFixture(state.manifest,r.uuid,config.batch);const d=await fromUuid(r.uuid);if(!d||d.getFlag('ptu','p05ReviewBatch')!==config.batch)throw Error('STOP: manifest/native fixture mismatch '+role);return d;};
    const pack=()=>{const r=find('test-pack');ownedFixture(state.manifest,r.uuid,config.batch,'Pack');const p=game.packs.get('world.p05-feature-review-fixtures');if(!p||p.collection!==r.id)throw Error('STOP: new pack identity mismatch');return p;};
    const selectedUsers=()=>game.users.map(u=>({id:u.id,name:u.name,role:u.role,ownership:u.ownership,permissions:u.permissions})).sort((a,b)=>a.id.localeCompare(b.id));
    async function snapshot(){
        guard();const collections={};
        for(const key of ['actors','items','folders','macros','messages','scenes','cards','combats','journal','playlists','tables'])if(game[key]){
            collections[key]=await Promise.all(game[key].contents.filter(d=>game.user.isGM||d.testUserPermission(game.user,'OBSERVER')).map(async d=>({id:d.id,sha256:await digest(JSON.stringify(stable(d.toObject())))})));collections[key].sort((a,b)=>a.id.localeCompare(b.id));
        }
        const settings=game.settings.storage.get('world').contents.map(s=>({key:s.key,value:s.value})).sort((a,b)=>a.key.localeCompare(b.key));
        const packRows=[];if(find('test-pack')){const p=game.packs.get('world.p05-feature-review-fixtures');if(p?.testUserPermission(game.user,'OBSERVER'))for(const d of await p.getDocuments())packRows.push({id:d.id,sha256:await digest(JSON.stringify(stable(d.toObject())))});}
        const value={collections,packRows,settingsSha256:await digest(JSON.stringify(stable(settings))),usersSha256:await digest(JSON.stringify(stable(selectedUsers())))};
        return {sha256:await digest(JSON.stringify(stable(value))),value};
    }
    function feature(role,prerequisites=[]){return {name:`Synthetic P05 ${role} <img src=x onerror="throw 1"> & \"quoted\"`,type:'feat',ownership:copy(ownership),effects:[],flags:flag(role),system:{prerequisites,effect:'Synthetic diagnostic text only; no benefit or rule',rules:[],source:{value:'Synthetic native review fixture, Generations 1–8 only'}}};}
    const metadata=(document,version,canonical)=>({schemaVersion:1,documentUuid:document.uuid,type:'feat',generationEligibility:'eligible',version:{id:`${config.batch}-${version}`,kind:version==='core'?'original':'revised',label:`Synthetic ${version} control`},source:{id:config.batch,edition:'Synthetic native validation controls',status:'synthetic',citation:'Synthetic test only; no production content authority',publicationDate:null},canonical:{id:canonical,evidence:'Explicit synthetic pair for native validation only'}});
    async function setup(){
        guard(true);if(state.manifest.length||game.packs.has('world.p05-feature-review-fixtures'))throw Error('STOP: fixture namespace already occupied');
        verifyFeatureReviewBootstrap(plan,identity(),macro,verifyExecution);
        state.phase='gm';
        const mr=add(macro,'Macro','test-macro');await macro.update({'flags.ptu.p05ReviewBatch':config.batch,'flags.ptu.p05ReviewRole':'test-macro'});record('macro-tag',mr);
        const controls={};for(const role of ['core-control','optional-control','unresolved-control','denied-control']){const d=await Item.create(feature(role,role==='optional-control'?['Level 10','Master General Education','GM Permission']:['Level 1']));add(d,'worldItem',role);controls[role]=d;output();}
        const newPack=await CompendiumCollection.createCompendium({name:'p05-feature-review-fixtures',label:'Synthetic P05 Feature review (disposable)',type:'Item',ownership:{PLAYER:'NONE',TRUSTED:'NONE',ASSISTANT:'NONE'}});add(newPack,'Pack','test-pack');
        for(const version of ['core','optional']){const d=await Item.create(feature(`pack-${version}`,['Level 10','GM Permission']),{pack:newPack.collection});add(d,'packItem',`pack-${version}`);}
        for(const [role,type,version]of [['target-trainer','character','core'],['target-pokemon','pokemon','optional'],['denied-trainer','character',null],['source-parent','character','core']]){
            const source=controls[`${version}-control`],items=[];
            if(version)for(let n=0;n<(role==='source-parent'?1:2);n++){const f=feature(`${role}-feature-${n}`);delete f.ownership;f.flags.ptu.selectedVersion={id:`${config.batch}-${version}`};f.flags.ptu.p05ReviewCustom={subchoice:n?'beta':'alpha',counter:n+1};if(n)f.flags.core={sourceId:source.uuid};else f._stats={compendiumSource:source.uuid};items.push(f);}
            if(role.startsWith('target-'))for(const t of ['edge','pokeedge','item'])items.push({name:`Synthetic mixed ${t}`,type:t,system:{rules:[]},effects:[],flags:flag(`${role}-${t}`)});
            const d=await Actor.create({name:`Synthetic P05 ${role}`,type,ownership:copy(ownership),flags:{...flag(role),ptu:{...flag(role).ptu,p05ReviewCustom:'alpha'}},items,system:{level:{milestones:2},skills:{generalEd:{value:{value:2}}}}},{renderSheet:false,keepEmbeddedIds:true});add(d,'Actor',role);for(const i of d.items)add(i,'embeddedItem',i.getFlag('ptu','p05ReviewRole'));output();
        }
        if(state.manifest.length!==23)throw Error('STOP: finite fixture count mismatch');
        state.mappings=[metadata(controls['core-control'],'core',config.batch+'-world'),metadata(controls['optional-control'],'optional',config.batch+'-world')];
        const pc=await doc('pack-core'),po=await doc('pack-optional');state.packMappings=[metadata(pc,'core',config.batch+'-pack'),metadata(po,'optional',config.batch+'-pack')];packRegistry=createRuleVersionRegistry(state.packMappings);if(packRegistry.status!=='ready')throw Error('STOP: synthetic pack mapping invalid');
        state.phase='gm';operation({kind:'setup',counts:state.manifest.reduce((a,r)=>(a[r.kind]=(a[r.kind]??0)+1,a),{})});output();
    }
    async function access(role,level){guard(true);const d=await doc(role),r=find(role);if(![0,1,2].includes(level))throw Error('STOP: invalid named-player access');await d.update({[`ownership.${config.pin.player}`]:level});if(d.ownership[config.pin.player]!==level)throw Error('STOP: access result mismatch');record('access',r,{principal:config.pin.player,level});}
    async function grants(){if(priorOperation('grants'))throw Error('STOP: finite grants already applied');for(const role of ['target-trainer','target-pokemon','source-parent','core-control','optional-control','unresolved-control'])await access(role,2);await access('test-macro',1);operation({kind:'grants',coveredPlayers:config.accounts.coveredPlayers});}
    async function packAccess(level){guard(true);if(!['NONE','OBSERVER'].includes(level))throw Error('STOP: invalid pack role');const p=pack(),before=copy(game.settings.get('core','compendiumConfiguration'));await p.configure({ownership:{PLAYER:level,TRUSTED:'NONE',ASSISTANT:'NONE'}});const after=copy(game.settings.get('core','compendiumConfiguration'));delete before[p.collection];delete after[p.collection];if(!equal(before,after)||p.ownership.PLAYER!==level||p.ownership.TRUSTED!=='NONE'||p.ownership.ASSISTANT!=='NONE')throw Error('STOP: unapproved pack configuration result');record('pack-configuration',find('test-pack'),{role:'PLAYER',level});operation({kind:'pack-access',level});}
    async function begin(id){
        guard();if(stopped()||current)throw Error('STOP: pending/failing case');if(plan.resume.completedCaseIds.includes(id)||state.captures.some(c=>c.caseId===id))throw Error('STOP: case already captured');if(!priorOperation('grants'))throw Error('STOP: verified finite grants required before cases');if(!nativeCaseIds.includes(id)||id.startsWith('gm-')!==game.user.isGM)throw Error('STOP: native case/role mismatch');
        const before=await snapshot(),actor=await fromUuid(find(id.includes('pokemon')?'target-pokemon':id==='player-denied-actor'?'denied-trainer':'target-trainer').uuid);
        const casePlan=admittedContract.casePlans.find(p=>p.id===id),targets={actor:find(casePlan.actorRole).uuid,incoming:casePlan.incomingRoles.map(role=>find(role).uuid),sourceParents:id.includes('source-parent')?[find('source-parent').uuid]:[],packs:id.includes('pack-')?[admittedContract.fixtures.pack]:[]};
        let incoming,sourceCollections=[],bodyExecuted=true,resolutionDenied=false,resolutionError=null,options={versions:state.mappings};
        try{
            if(id.includes('pack-')){const p=pack();sourceCollections=[p];options={registry:packRegistry};if(id==='player-pack-revoked')incoming=featureReviewRevokedDocuments(retainedPackDocuments);else{incoming=await p.getDocuments();if(id==='player-pack-observer')retainedPackDocuments=incoming;}if(!incoming.length)throw Error('Native pack document resolution denied');targets.incoming=incoming.map(d=>d.uuid);}
            else if(id.includes('source-parent'))incoming=[await fromUuid(state.manifest.find(r=>r.role==='source-parent-feature-0').uuid)];
            else if(id==='player-denied-incoming')incoming=[await fromUuid(find('denied-control').uuid)];
            else if(id==='gm-unresolved-custom')incoming=[await doc('unresolved-control')];
            else if(id==='gm-incoming-batch-conflicts')incoming=[await doc('core-control'),await doc('optional-control'),await doc('optional-control')];
            else incoming=[await doc(id.includes('pokemon')?'core-control':'optional-control')];
            if(!actor||incoming.some(i=>!i)){bodyExecuted=false;resolutionDenied=true;resolutionError='Native requested document unavailable';}
        }catch(error){if(id==='player-pack-revoked'||!/denied|pack-none/.test(id))throw error;bodyExecuted=false;resolutionDenied=true;resolutionError=String(error);incoming=[];}
        const permissions={actor:actor?actor.testUserPermission(game.user,'OBSERVER'):null,incoming:incoming.filter(Boolean).map(d=>({uuid:d.uuid,readable:d.testUserPermission(game.user,'OBSERVER')})),sourceParents:incoming.filter(d=>d?.parent).map(d=>({uuid:d.parent.uuid,readable:d.parent.testUserPermission(game.user,'OBSERVER')})),packs:sourceCollections.map(p=>({collection:p.collection,readable:p.testUserPermission(game.user,'OBSERVER')}))};
        targets.resolvedActor=actor?.uuid??null;targets.resolvedIncoming=incoming.filter(Boolean).map(d=>d.uuid);
        const result=resolutionDenied?{status:'not-opened',issues:[{reason:'native-resolution-denied-before-launcher'}]}:launch({actor,incoming,sourceCollections,...options});
        current={id,before,result,actor,incoming,bodyExecuted,resolutionDenied,resolutionError,targets,permissions,navigation:navigation(),events:[],view:null};
        if(result.review){const view=result.review.getData();current.view=copy(view);Hooks.once('renderFeatureAcquisitionReview',(app,html)=>{if(app!==result.review)return;const root=html[0];for(const event of ['focusin','keydown','click'])root.addEventListener(event,e=>current?.events.push({event,key:e.key??null,action:e.target?.closest?.('[data-action]')?.dataset?.action??e.target?.dataset?.action??null,tag:e.target?.tagName??null}));});}
        operation({kind:'begin',caseId:id,status:result.status,bodyExecuted,resolutionDenied});output();
    }
    async function finish(){
        guard();if(!current)throw Error('No current case');const c=current,review=c.result.review,checks=[];const check=(name,passed)=>checks.push({name,passed:passed===true});
        const denial=/denied|pack-none|pack-revoked/.test(c.id);let dismissed=false,consent;
        if(denial)check('Native read denial',c.result.status==='not-opened');
        else{
            check('Actual launcher opened',c.result.status==='review-requested');
            if(review){
                const v=c.view,actorSnapshot=JSON.parse(v.actor.snapshot);check('Complete mixed membership',hasCompleteMixedMembership(v));
                check('Prepared level captured',actorSnapshot.system.level.current===c.actor.system.level.current);check('Prepared rank captured',actorSnapshot.system.skills.generalEd.value.total===c.actor.system.skills.generalEd.value.total);
                check('Repeated owned Features preserved',v.owned[0].identity.some(i=>i.value===c.actor.items.contents[0].uuid)&&v.owned[1].identity.some(i=>i.value===c.actor.items.contents[1].uuid));
                if(c.id==='gm-incoming-batch-conflicts')check('Every incoming occurrence/pair',v.candidates.length===3&&v.candidateComparisons.length===3);
                if(c.id==='gm-unresolved-custom')check('Unresolved remains visible',v.candidates[0].attribution===game.i18n.localize('PTU.FeatureAcquisitionReview.unresolved'));
                if(c.id.includes('source-parent'))check('Embedded Item inherits readable parent',c.incoming[0].parent.testUserPermission(game.user,'OBSERVER')&&c.incoming[0].testUserPermission(game.user,'OBSERVER'));
                const root=review.element?.[0],content=root?.querySelector('.window-content');
                if(c.id==='gm-escaped-render-focus-scroll'){
                    check('Escaped Feature label remains text',root?.textContent.includes('<img src=x onerror="throw 1">')&&!root?.querySelector('img[onerror]'));
                    check('Actual keyboard focus',c.events.some(e=>e.event==='focusin'));
                    check('Content can scroll',content?.scrollHeight>content?.clientHeight);
                    check('Actual scroll observed',Boolean(c.dom?.scrollTop>0));
                }
                if(/close|cancel|escape|dismissal/.test(c.id)){dismissed=!review.rendered&&!review.element?.[0]?.isConnected;check('Native UI dismissed before observation',dismissed);consent=await review.close();check('Dismissal returned undefined',consent===undefined);if(c.id.includes('repeated')){const a=review.close(),b=review.close();check('Repeated dismissal shares one promise',a===b&&(await a)===undefined);}}
                else{consent=await review.close();dismissed=!review.rendered&&!review.element?.[0]?.isConnected;}
            }
        }
        const after=await snapshot();check('Documents/settings unchanged',c.before.sha256===after.sha256);
        const summary={native:true,coreVersion:game.version,world:game.world.id,userId:game.user.id,launchStatus:c.result.status,bodyExecuted:c.bodyExecuted,resolutionDenied:c.resolutionDenied,statePreserved:c.before.sha256===after.sha256,beforeSha256:c.before.sha256,afterSha256:after.sha256,checks,dismissed,consentType:typeof consent};
        const capture={source:plan.mode,caseId:c.id,summary,identity:identity(),runtime,targets:c.targets,permissions:c.permissions,prepared:featureReviewPreparedFacts(c.actor,c.permissions.actor),resolution:{error:c.resolutionError},navigation:c.navigation,view:c.view,issues:c.result.issues??[],before:c.before.value,after:after.value,events:c.events,dom:c.dom??null};captureRecord(capture);current=null;
        if(checks.some(c=>!c.passed)){fail({caseId:c.id,reason:'Native review assertion failed',checks});ui.notifications.error('STOP: native review failed; preserve evidence and clean up only');}output();
    }
    function captureDom(){if(!current?.result.review)throw Error('No rendered review');const root=current.result.review.element[0],content=root.querySelector('.window-content');current.dom={text:root.textContent,html:root.outerHTML,activeTag:document.activeElement?.tagName,scrollTop:content?.scrollTop,scrollHeight:content?.scrollHeight,clientHeight:content?.clientHeight};output();}
    async function fresh(){guard(true);if(current)throw Error('Finish pending case first');if(allMutations().some(m=>m.kind==='fresh-capture'))throw Error('STOP: finite fresh-capture mutation already used');const a=await doc('target-trainer'),incoming=await doc('optional-control');const frozen=launch({actor:a,incoming:[incoming],versions:state.mappings});if(!frozen.review)throw Error('STOP: old capture did not open');const oldView=copy(frozen.review.getData()),before=a.toObject();await a.update({'system.level.milestones':1,'system.skills.generalEd.value.value':3,'flags.ptu.p05ReviewCustom':'beta'});record('fresh-capture',find('target-trainer'),{paths:['system.level.milestones','system.skills.generalEd.value.value','flags.ptu.p05ReviewCustom']});const oldViewAfter=copy(frozen.review.getData()),unchanged=equal(oldView,oldViewAfter);await frozen.review.close();operation({kind:'fresh-update',oldView,oldViewAfter,oldCaptureUnchanged:unchanged,beforeActor:before,afterActor:a.toObject(),before:await digest(JSON.stringify(stable(before))),after:await digest(JSON.stringify(stable(a.toObject()))),prepared:{level:a.system.level.current,rank:a.system.skills.generalEd.value.total}});if(!unchanged)throw Error('STOP: frozen review changed after explicit fixture update');}
    async function cleanup(){
        guard(true);if(current?.result.review)await current.result.review.close();current=null;state.phase='cleanup';
        for(const role of ['target-trainer','target-pokemon','source-parent','core-control','optional-control','unresolved-control','test-macro'])if(find(role))await access(role,0);
        if(find('test-pack')){await packAccess('NONE');const p=pack();for(const role of ['pack-core','pack-optional'])if(find(role)){const d=await doc(role);await d.delete();record('delete',find(role));}if((await p.getDocuments()).length)throw Error('STOP: unowned pack records remain; no pack deletion');await p.deleteCompendium();record('delete',find('test-pack'));const value=copy(game.settings.get('core','compendiumConfiguration'));if(Object.hasOwn(value,p.collection)){delete value[p.collection];await game.settings.set('core','compendiumConfiguration',value);}if(await digest(JSON.stringify(stable(game.settings.get('core','compendiumConfiguration'))))!==plan.baselineChecks.packConfigurationSha256)throw Error('STOP: pack settings restoration uncertain');}
        for(const role of ['target-trainer','target-pokemon','denied-trainer','source-parent'])if(find(role)){const a=await doc(role);for(const item of a.items){ownedFixture(state.manifest,item.uuid,config.batch,'embeddedItem');if(item.getFlag('ptu','p05ReviewBatch')!==config.batch)throw Error('STOP: embedded cleanup ownership uncertain');}await a.delete();record('delete',find(role));for(const r of state.manifest.filter(r=>r.parentUuid===find(role).uuid))record('delete-with-parent',r);}
        for(const role of ['core-control','optional-control','unresolved-control','denied-control'])if(find(role)){const d=await doc(role);await d.delete();record('delete',find(role));}
        operation({kind:'cleanup-before-macro-delete',snapshot:await snapshot()});output();
    }
    const actions={setup,grants,'parent-none':()=>access('source-parent',0),'parent-observer':()=>access('source-parent',2),'pack-observer':()=>packAccess('OBSERVER'),'pack-none':()=>packAccess('NONE'),begin:html=>begin(html.find('[data-p05-case]').val()),finish,'capture-dom':captureDom,fresh,checkpoint:async()=>{operation({kind:'checkpoint',snapshot:await snapshot()});return exportSegment();},cleanup,'delete-macro':async()=>{guard(true);const d=await doc('test-macro');await d.delete();record('delete',find('test-macro'));operation({kind:'macro-deleted'});}};
    controller=new Dialog({title:'P05 native Feature review controller',content:`<p>Explicit disposable fixtures only. Any failure stops reviews; cleanup remains available.</p><select data-p05-case>${nativeCaseIds.filter(id=>id.startsWith('gm-')===game.user.isGM).map(id=>`<option>${id}</option>`).join('')}</select><p>${Object.keys(actions).filter(a=>game.user.isGM||['begin','finish','capture-dom','checkpoint'].includes(a)).map(a=>`<button type="button" data-p05-action="${a}">${a}</button>`).join(' ')}</p><textarea aria-label="P05 private result" data-p05-output readonly style="width:100%;height:200px"></textarea>`,buttons:{},render:html=>{html.find('[data-p05-action]').on('click',async event=>{const requested=event.currentTarget.dataset.p05Action;if(exported&&requested!=='checkpoint'){ui.notifications.error('STOP: exported segment awaits private acknowledgement');return;}try{const action=requested;activeOperation=action;if(stopped()&&!['cleanup','delete-macro','checkpoint'].includes(action))throw Error('STOP: failed attempt permits only owned cleanup/checkpoint');await actions[action](html);}catch(error){fail({operation:event.currentTarget.dataset.p05Action,reason:String(error)});ui.notifications.error(String(error));}output();});output();}},{width:760,height:460});controller.render(true);
    controller.exportSegment=exportSegment;
    // Acknowledged control refresh never imports aggregate GM evidence and never
    // replaces the actual cached pack Documents needed for revocation coverage.
    controller.useCheckpoint=async(next,{packetBytes:bytes=JSON.stringify(next)}={})=>{const sha=await admittedDataSha256(bytes);if(!equal(JSON.parse(bytes),next))throw Error('STOP: refresh byte/value mismatch');const updated=await refreshFeatureReviewPacket({packet:plan,next,exported,localEventCount:state.events.length,pendingReview:Boolean(current),identity:identity(),verifyExecution,packetSha256:sha},retainedPackDocuments);plan=updated.packet;activePacketSha256=sha;retainedPackDocuments=updated.retainedReferences;state.manifest=plan.resources.map(copy);state.mappings=copy(plan.mappings);state.packMappings=copy(plan.packMappings);state.phase=plan.phase;state.mutations=[];state.operations=[];state.captures=[];state.events=[];state.failure=null;exported=null;packRegistry=state.packMappings.length?createRuleVersionRegistry(state.packMappings):null;if(packRegistry&&packRegistry.status!=='ready')throw Error('STOP: packet registry reconstruction failed');operation({kind:'checkpoint-import',userId:game.user.id,navigation:navigation()});output();};
    return controller;
}
