import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {resolve,join,relative,sep,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {FEATURE_REVIEW_ADMITTED_CONTRACT as C,createAdmittedFeatureReviewPlan,buildAdmittedFeatureReviewInputs,issueAdmittedControllerPacket,mergeAdmittedControllerSegment,admittedBaselineErrors,admittedCanonical,admittedMappings} from '../tools/feature-review-admitted-contract.mjs';
import {decodeStoredRecords,bindOpaqueUsers,captureStoppedStoreEvidence,resolvePinnedReader,readPrivateCapture,collectorMain} from '../tools/collect-feature-review-evidence.mjs';
import {TARGET_ROOT,PROCESS_QUERY,sha256,containedPath,pinnedFiles,observeHostState,requireHostState,operatingHoursBoundary,externalObservationErrors,createFeatureReviewOperator,admittedSystemManifest,verifyPrivatePacketReceipt,verifyPrivateMacroAbsence,savePrivateControllerSegment,saveCapturedProof,parseFiniteJson,assertFiniteJson} from '../tools/feature-review-operator.mjs';
import {createExecutionVerifier,readNativeBrowserFacts,ACTION_GUARDS} from '../tools/feature-review-execution-verifier.mjs';
import {joinAdmittedConversionCaptures} from '../tools/check-feature-review-admitted.mjs';
import {refreshFeatureReviewPacket} from '../tools/foundry-feature-review-check.mjs';
import {decodePrivateAclTransport,runPrivateAclTransport,ACL_PROCESS_PREAMBLE,ACL_TRANSPORT_LIMITS,verifyPrivateDirectory} from '../tools/feature-review-operator.mjs';
const id=n=>String(n).padStart(16,'0'),copy=structuredClone,time=Date.parse('2026-11-01T16:20:00Z'),cacheRoot=resolve('.cache');
const exec=promisify(execFile);
// Execute ONLY the generated pure classification lines, never the OS queries or lock lookup.
async function generatedProcessRows(rows){
    const lines=PROCESS_QUERY.split('\n'),target=lines.find(l=>l.startsWith('$ptuTarget=')),helpers=PROCESS_QUERY.match(/# PTU pure matching begin\n([\s\S]*?)# PTU pure matching end/)?.[1]??'';
    const predicates=['Matches','Unreadable'].map(name=>lines.find(l=>l.trimStart().startsWith('$ptu'+name+'=@($ptuRows')));
    assert.ok(predicates.every(Boolean));
    const encoded=Buffer.from(JSON.stringify(rows)).toString('base64');
    const script=target+'\n'+helpers+'\n$ptuRows=@();$ptuDecoded=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(\''+encoded+'\'))|ConvertFrom-Json;foreach($ptuRow in $ptuDecoded){if($ptuRow -is [Array] -or $null -eq $ptuRow.ProcessId){throw "Nested or malformed synthetic process row"};$ptuRows+= $ptuRow}\n'+predicates.join('\n')+'\n[pscustomobject]@{matches=$ptuMatches;unreadable=$ptuUnreadable}|ConvertTo-Json -Depth 5 -Compress';
    assert.doesNotMatch(script,/Get-CimInstance|Get-NetTCPConnection|Test-Path|Get-Acl/);
    const {stdout}=await exec(process.platform==='win32'?'powershell.exe':'pwsh',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,maxBuffer:65536});
    assert.doesNotMatch(stdout,/CommandLine|UNRELATED-COMMAND-CANARY/);return JSON.parse(stdout.replace(/^\uFEFF/,''));
}
async function temp(fn){await fs.mkdir(cacheRoot,{recursive:true});const root=await fs.mkdtemp(join(cacheRoot,'feature-review-operator-'));try{return await fn(root);}finally{const rel=relative(cacheRoot,root);assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+sep));await fs.rm(root,{recursive:true,force:true});}}
const aclCanary='SYNTHETIC-ACL-SECRET-CANARY';
const aclFacts=()=>({ownerMatches:true,hasOwner:true,hasSystem:true,unexpectedRules:0,rules:2,inheritance:['ContainerInherit, ObjectInherit','ContainerInherit, ObjectInherit']});
const aclBytes=value=>Buffer.from(JSON.stringify(value));
const aclEmit=bytes=>'process.stdout.write(Buffer.from('+JSON.stringify(bytes.toString('base64'))+',"base64"));';
async function aclRefusal(action){
    let failure;try{await action();}catch(error){failure=error;}assert.ok(failure,'must refuse');
    const dump=Object.getOwnPropertyNames(failure).map(k=>String(failure[k])).join('\n')+JSON.stringify(failure);
    assert.doesNotMatch(dump,/SYNTHETIC-ACL-SECRET-CANARY/);assert.ok(failure.diagnostic);assert.match(failure.message,/^STOP: ACL transport refused/);
    assert.equal(failure.stack,failure.name+': '+failure.message);
    assert.ok(['request','process','decode','projection','path'].includes(failure.diagnostic.stage));
    const allowed=['stage','status','stdoutBytes','stderrBytes','stdoutSha256','stderrSha256','encoding','framing','exitCode','signal'];
    assert.ok(Object.keys(failure.diagnostic).every(k=>allowed.includes(k)));assert.ok(Object.isFrozen(failure.diagnostic));
    for(const value of Object.values(failure.diagnostic))assert.ok(value===null||typeof value==='string'&&value.length<=64||Number.isSafeInteger(value)&&value>=0);
    assert.doesNotMatch(JSON.stringify(failure),/"(?:stdout|stderr|command|cmd|cause|path)":/);return failure;
}
test('ACL transport normal UTF8 remains a decoded projection without native authority',async()=>{
    const result=await runPrivateAclTransport(process.execPath,['-e',aclEmit(aclBytes(aclFacts()))]);assert.deepEqual(result.facts,aclFacts());assert.equal(result.kind,'decoded-acl-projection');assert.equal(result.mode,undefined);assert.equal(result.path,undefined);
});
test('ACL transport permits one leading UTF8 BOM as explicit framing',async()=>{
    const bytes=Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),aclBytes(aclFacts())]);const result=await runPrivateAclTransport(process.execPath,['-e',aclEmit(bytes)]);assert.deepEqual(result.facts,aclFacts());
});
for(const [name,change]of [
    ['boolean coercion',v=>v.ownerMatches='true'],['extra field',v=>v.extra=aclCanary],['string count',v=>v.rules='2'],['inheritance substring',v=>v.inheritance[0]='notContainerInherit-notObjectInherit'],['count mismatch',v=>v.inheritance.pop()]
])test('ACL transport strict projection refuses '+name,()=>{const facts=aclFacts();change(facts);return aclRefusal(()=>decodePrivateAclTransport(aclBytes(facts)));});
test('ACL transport stderr refuses even when stdout is valid',()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(aclBytes(aclFacts()))+'process.stderr.write('+JSON.stringify(aclCanary)+');'])));
test('ACL transport process exception redacts command stdout and stderr',()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(Buffer.from(aclCanary))+'process.stderr.write('+JSON.stringify(aclCanary)+');process.exit(3);'])));
test('ACL transport finite timeout refuses a delayed synthetic child',()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e','setTimeout(()=>{'+aclEmit(aclBytes(aclFacts()))+'},1200);'],{timeoutMs:200,maxBytes:65536})));
test('ACL transport output cap refuses complete JSON beyond the cap',()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(Buffer.concat([aclBytes(aclFacts()),Buffer.alloc(512,32)]))],{timeoutMs:10000,maxBytes:256})));
const aclSecretBytes=()=>aclBytes({...aclFacts(),extra:aclCanary});
const aclBadBytes=[
    ['invalid UTF8',()=>Buffer.concat([Buffer.from(aclCanary),Buffer.from([0xff])])],
    ['truncated UTF8',()=>Buffer.concat([Buffer.from(aclCanary),Buffer.from([0xe2,0x82])])],
    ['UTF16LE BOM',()=>Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(aclSecretBytes().toString(),'utf16le')])],
    ['UTF16LE unmarked',()=>Buffer.from(aclSecretBytes().toString(),'utf16le')],
    ['UTF16BE',()=>Buffer.concat([Buffer.from([0xfe,0xff]),Buffer.from(aclSecretBytes().toString(),'utf16le').swap16()])],
    ['repeated BOM',()=>Buffer.concat([Buffer.from([0xef,0xbb,0xbf,0xef,0xbb,0xbf]),aclSecretBytes()])],
    ['BOM after whitespace',()=>Buffer.concat([Buffer.from(' '),Buffer.from([0xef,0xbb,0xbf]),aclSecretBytes()])],
    ['trailing BOM',()=>Buffer.concat([aclSecretBytes(),Buffer.from([0xef,0xbb,0xbf])])],
    ['empty',()=>Buffer.alloc(0)],['only whitespace',()=>Buffer.from(' \r\n\t')],
    ['noisy prefix',()=>Buffer.concat([Buffer.from(aclCanary+' warning\n'),aclBytes(aclFacts())])],
    ['noisy suffix',()=>Buffer.concat([aclBytes(aclFacts()),Buffer.from(aclCanary)])],
    ['multiple documents',()=>Buffer.concat([aclBytes(aclFacts()),Buffer.from('\n'),aclSecretBytes()])],
    ['truncated document',()=>aclSecretBytes().subarray(0,-1)],
    ['BOM inside string',()=>aclBytes({...aclFacts(),inheritance:['ContainerInherit, ObjectInherit','\ufeff'+aclCanary]})]
];
for(const [name,bytes]of aclBadBytes){
    test('ACL transport portable decoder refuses '+name,()=>aclRefusal(()=>decodePrivateAclTransport(bytes())));
    test('ACL transport shared child rejects '+name,()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(bytes())])));
}
for(const [name,change]of [
    ...['ownerMatches','hasOwner','hasSystem'].flatMap(k=>[[k+' false',v=>v[k]=false],[k+' wrong type',v=>v[k]=aclCanary]]),
    ...['ownerMatches','hasOwner','hasSystem','unexpectedRules','rules','inheritance'].map(k=>['missing '+k,v=>delete v[k]]),
    ['negative unexpected count',v=>v.unexpectedRules=-1],['unexpected rule',v=>v.unexpectedRules=1],['unexpected count boolean',v=>v.unexpectedRules=false],['unexpected count string',v=>v.unexpectedRules='0'],
    ['negative rule count',v=>v.rules=-2],['one rule',v=>{v.rules=1;v.inheritance.pop();}],['fractional rules',v=>v.rules=2.5],['unsafe count',v=>v.rules=9007199254740992],
    ['inheritance not array',v=>v.inheritance=aclCanary],['inheritance null',v=>v.inheritance=null],['inheritance extra entry',v=>v.inheritance.push('ContainerInherit, ObjectInherit')],['inheritance nonstring',v=>v.inheritance[0]=true],
    ['only container flag',v=>v.inheritance[0]='ContainerInherit'],['only object flag',v=>v.inheritance[0]='ObjectInherit'],['no inheritance',v=>v.inheritance[0]='None'],['duplicate flags',v=>v.inheritance[0]='ContainerInherit, ObjectInherit, ObjectInherit'],['extra flags',v=>v.inheritance[0]='ContainerInherit, ObjectInherit, '+aclCanary],['flag whitespace',v=>v.inheritance[0]=' ContainerInherit, ObjectInherit']
])test('ACL transport projection rejects '+name,()=>{const value=aclFacts();change(value);return aclRefusal(()=>decodePrivateAclTransport(aclBytes(value)));});
test('ACL transport accepts exact alternative flag order and consistent larger count',()=>{
    const facts=aclFacts();facts.rules=3;facts.inheritance.push('ObjectInherit, ContainerInherit');assert.deepEqual(decodePrivateAclTransport(aclBytes(facts)).facts,facts);
    assert.deepEqual(decodePrivateAclTransport(Buffer.from(' \r\n'+JSON.stringify(aclFacts())+'\t\r\n')).facts,aclFacts());
});
test('ACL transport duplicate and escaped-duplicate fields are refused',async()=>{
    for(const key of ['ownerMatches','\\u006fwnerMatches'])await aclRefusal(()=>decodePrivateAclTransport(Buffer.from(JSON.stringify(aclFacts()).replace('{','{"'+key+'":false,'))));
    assert.deepEqual(decodePrivateAclTransport(Buffer.from(JSON.stringify(aclFacts()).replace('"ownerMatches"','"\\u006fwnerMatches"'))).facts,aclFacts());
});
test('ACL transport retains the lossless parser gate before projection',async()=>{
    for(const token of ['9007199254740993','1.0000000000000001','1e-400','1e309']){const error=await aclRefusal(()=>decodePrivateAclTransport(Buffer.from(JSON.stringify(aclFacts()).replace('"rules":2','"rules":'+token))));assert.equal(error.diagnostic.stage,'decode');}
});
test('ACL transport pure decoder requires bounded bytes without string coercion',async()=>{
    for(const value of [aclCanary,null,undefined,Buffer.from(aclCanary.repeat(3000))])await aclRefusal(()=>decodePrivateAclTransport(value));
});
test('ACL transport rejects nonempty whitespace stderr',()=>aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(aclBytes(aclFacts()))+'process.stderr.write(" \\r\\n");'])));
test('ACL transport stderr byte limit is also bounded',async()=>{
    const error=await aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e',aclEmit(aclBytes(aclFacts()))+'process.stderr.write('+JSON.stringify(aclCanary.repeat(100))+');'],{maxBytes:256}));assert.equal(error.diagnostic.status,'output-limit');
});
test('ACL transport child signal or termination is refused',async()=>{
    const error=await aclRefusal(()=>runPrivateAclTransport(process.execPath,['-e','process.stdout.write('+JSON.stringify(aclCanary)+');process.kill(process.pid,"SIGTERM");']));assert.ok(['signal','nonzero-exit'].includes(error.diagnostic.status));
});
test('ACL transport spawn errors redact synthetic command path',()=>temp(root=>aclRefusal(()=>runPrivateAclTransport(join(root,aclCanary+'.exe'),[aclCanary]))));
test('ACL transport invalid requests cannot raise limits or leak getters',async()=>{
    for(const limits of [null,{timeoutMs:0},{timeoutMs:ACL_TRANSPORT_LIMITS.timeoutMs+1},{maxBytes:0},{maxBytes:ACL_TRANSPORT_LIMITS.maxBytes+1},{shell:aclCanary},Object.defineProperty({},'timeoutMs',{get(){throw Error(aclCanary);}})])await aclRefusal(()=>runPrivateAclTransport(process.execPath,[aclCanary],limits));
});
const aclShell=process.platform==='win32'?'powershell.exe':'pwsh';
async function aclSyntheticShell(body){const script=ACL_PROCESS_PREAMBLE+body;assert.doesNotMatch(script,/Get-Acl|Get-CimInstance|Get-NetTCPConnection|Test-Path|Get-Content|Get-Item/);return runPrivateAclTransport(aclShell,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')]);}
const aclPsLiteral=value=>"'"+value.replaceAll("'","''")+"'";
test('ACL transport synthetic '+aclShell+' executes shared UTF8 preamble',async()=>{assert.deepEqual((await aclSyntheticShell('[Console]::Out.Write('+aclPsLiteral(JSON.stringify(aclFacts()))+')')).facts,aclFacts());});
test('ACL transport synthetic '+aclShell+' permits one explicit BOM',async()=>{const result=await aclSyntheticShell('[Console]::Out.Write([char]0xfeff);[Console]::Out.Write('+aclPsLiteral(JSON.stringify(aclFacts()))+')');assert.equal(result.transport.framing,'single-leading-bom');});
test('ACL transport synthetic '+aclShell+' preserves UTF8 before schema rejection',async()=>{const error=await aclRefusal(()=>aclSyntheticShell('[Console]::Out.Write('+aclPsLiteral(JSON.stringify({...aclFacts(),extra:aclCanary+'é'}))+')'));assert.equal(error.diagnostic.stage,'projection');assert.equal(error.diagnostic.encoding,'utf-8');});
test('ACL transport synthetic '+aclShell+' terminates on error and redacts stderr',async()=>{const error=await aclRefusal(()=>aclSyntheticShell('Write-Error '+aclPsLiteral(aclCanary)+';[Console]::Out.Write('+aclPsLiteral(JSON.stringify(aclFacts()))+')'));assert.equal(error.diagnostic.stage,'process');});
async function aclSyntheticCommandRoute(body,argument){
    const wrapper=verifyPrivateDirectory.toString().match(/const script=ACL_PROCESS_PREAMBLE\+`([^`]+)`;/)?.[1];assert.ok(wrapper);assert.equal(wrapper.split('${command}').length,2);assert.equal(wrapper.split('${literal}').length,2);
    const script=ACL_PROCESS_PREAMBLE+wrapper.replace('${command}',body).replace('${literal}',aclPsLiteral(argument));
    assert.doesNotMatch(script,/Get-Acl|Get-CimInstance|Get-NetTCPConnection|Test-Path|Get-Content|Get-Item/);
    return runPrivateAclTransport(aclShell,['-NoProfile','-NonInteractive','-Command',script]);
}
test('ACL transport native Command wrapper preserves synthetic literal argument and JSON pipeline',async()=>{
    const argument="Synthetic spaces and O'Brien "+aclCanary,expected=Buffer.from(argument).toString('base64');
    const body="$p=$args[0];$expected=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('"+expected+"'));[pscustomobject]@{ownerMatches=($args.Count -eq 1 -and $p -ceq $expected);hasOwner=$true;hasSystem=$true;unexpectedRules=0;rules=2;inheritance=@('ContainerInherit, ObjectInherit','ContainerInherit, ObjectInherit')}|ConvertTo-Json -Compress";
    const result=await aclSyntheticCommandRoute(body,argument);assert.deepEqual(result.facts,aclFacts());assert.equal(result.transport.stderrBytes,0);assert.equal(result.transport.stderrSha256,sha256(Buffer.alloc(0)));assert.doesNotMatch(JSON.stringify(result),/SYNTHETIC-ACL-SECRET-CANARY/);
});
test('ACL transport native Command wrapper redacts a synthetic producer failure',async()=>{
    const error=await aclRefusal(()=>aclSyntheticCommandRoute("throw '"+aclCanary+"'","Synthetic spaces and O'Brien "+aclCanary));assert.equal(error.diagnostic.stage,'process');assert.equal(error.diagnostic.exitCode,1);assert.ok(error.diagnostic.stderrBytes>0);
});
test('ACL transport native verifier retains a fixed query without test injection',async()=>{
    const source=verifyPrivateDirectory.toString();assert.match(source,/mode='native',syntheticRoot/);assert.match(source,/runPrivateAclTransport\('powershell.exe'/);assert.match(source,/Get-Acl -LiteralPath \$p -ErrorAction Stop/);assert.match(ACL_PROCESS_PREAMBLE,/ErrorActionPreference='Stop'/);assert.match(ACL_PROCESS_PREAMBLE,/OutputEncoding/);
    await temp(root=>aclRefusal(()=>verifyPrivateDirectory(join(root,aclCanary))));
});
async function capture(o){try{return await captureStoppedStoreEvidence(o);}catch(error){const p=JSON.parse(await fs.readFile(join(o.outputRoot,'failure.json'),'utf8'));throw Error(error.message+' [synthetic step='+p.step+', store='+p.database+']');}}
const raw=(key,value)=>({key:Buffer.from(key),value:Buffer.isBuffer(value)?value:Buffer.from(JSON.stringify(value))});
const host=(state='stopped')=>({target:TARGET_ROOT.replaceAll('/','\\'),startedMs:time,observedMs:time,matches:state==='running'?[{ProcessId:123,Name:'node.exe'}]:[],unreadable:[],processError:null,listeners:state==='running'?[{LocalAddress:'127.0.0.1',LocalPort:30001,OwningProcess:123}]:[],portAbsent:state==='stopped',portError:null,lockExists:state==='running'});
const external=()=>({mode:'synthetic',observations:['supported-usage','coordinator-ownership','allowed-hours','normal-access','action-approval'].map(name=>({name,source:'synthetic-test:'+name,outcome:'verified',observedMs:time,boundaryMs:time+60000}))});
const operator=root=>createFeatureReviewOperator({mode:'synthetic',syntheticRoot:root,externalObservations:external,query:async()=>host(),now:()=>time});
async function store(root,path,rows){const dir=join(root,path);await fs.mkdir(dir,{recursive:true});await fs.writeFile(join(dir,'CURRENT'),'MANIFEST-000001\n');await fs.writeFile(join(dir,'rows.json'),JSON.stringify(rows.map(r=>({key:r.key.toString('base64'),value:r.value.toString('base64')}))));}
const adapter={binding:{kind:'synthetic-reader',version:'self-generated-test-store'},async read(path){const rows=JSON.parse(await fs.readFile(join(path,'rows.json'),'utf8'));await fs.writeFile(join(path,'reader-working-write'),'only working copy');return rows.map(r=>({key:Buffer.from(r.key,'base64'),value:Buffer.from(r.value,'base64')}));}};
function baseline(){const ids=Object.fromEntries(C.collections.map(k=>[k,k==='actors'?[id(1)]:[]]));return {ids,world:{id:C.target.world,title:C.target.title,system:'ptu',packs:[],playtime:0,lastPlayed:'2026-11-01T00:00:00Z'},packConfiguration:{},settings:['core.moduleConfiguration','core.compendiumConfiguration'].map((key,n)=>({_id:id(20+n),key,value:{},_stats:{modifiedTime:1}})),protectedDocuments:[{collection:'actors',id:id(1),data:{_id:id(1),name:'Synthetic'}}],users:C.accounts.users.map(u=>({...u,ownership:null,permissions:{},recordSha256:sha256('opaque-'+u.id)})),priorSystem:[{path:'system.json',kind:'file',sha256:sha256('synthetic prior system')}],backupManifestSha256:sha256('synthetic backup'),configurationSha256:sha256('synthetic config')};}
async function issued(observedBaseline=baseline()){const p=createAdmittedFeatureReviewPlan();const plan=buildAdmittedFeatureReviewInputs(p,{mode:'synthetic',batch:'synthetic-operator',baseline:observedBaseline,runtime:p.runtime.map(r=>({...r,installed:r.packaged}))});return issueAdmittedControllerPacket(plan,{packetId:'operator-packet',segmentId:'operator-segment',userId:C.pin.gm,phase:'initial',bootstrapMacroUuid:'Macro.'+id(900)});}
const facts=()=>({sessionId:'synthetic-browser-session',identity:{world:C.pin.world,title:C.target.title,core:C.pin.core,system:'ptu',systemVersion:C.pin.system,user:C.pin.gm,accounts:copy(C.accounts.users)},schema:0.115,worldSystemVersion:'4.4.3',permissions:{},modules:{}});
async function verifierFixture(action='begin'){
    const i=await issued(),packet=i.packet,packetSha256=sha256(i.packetBytes);let wall=time,mono=100,live=facts();
    const verifier=createExecutionVerifier({mode:'synthetic',packet,packetSha256,readFacts:()=>copy(live),now:()=>wall,monotonic:()=>mono});
    const witness={kind:'p05-operator-action-v1',mode:'synthetic',id:'synthetic-action',observedMs:time,expiresMs:time+60000,boundaryMs:time+60000,sessionId:live.sessionId,principal:C.pin.gm,batch:packet.batch,packet:copy(packet),packetSha256,anchor:copy(packet.anchor),action,browserFacts:copy(live),operatorRecordSha256:sha256('synthetic operator record'),acknowledgement:{packetSha256,checkpointSha256:packet.anchor.checkpointSha256,revision:0,principal:C.pin.gm,precedingSegmentId:null,precedingSegmentSha256:null,globalPrefixSha256:sha256([])},macroAbsence:action==='setup'?{macroUuid:packet.baselineChecks.bootstrapMacroUuid,baselineSha256:sha256(i.plan.baseline),observedMs:time,receiptSha256:sha256('synthetic computed absence')}:null,failureRef:null};
    const context=(operation=action)=>({policy:copy(C.policy),gates:copy(C.externalGates),batch:packet.batch,identity:copy(live.identity),anchor:copy(packet.anchor),packetSha256,baselineChecks:copy(packet.baselineChecks),operation});
    return {i,packet,packetSha256,verifier,witness,context,setLive:f=>{live=f;},advance:ms=>{wall+=ms;mono+=ms;},setWall:v=>{wall=v;}};
}

test('raw hierarchy assembles actual referenced records losslessly and accounts for folders',()=>{
    const rows=[raw('!actors!'+id(1),{_id:id(1),items:[id(2)],effects:[],unlisted:{keep:['x',null]}}),raw('!actors.items!'+id(1)+'.'+id(2),{_id:id(2),effects:[id(3)],system:{value:4}}),raw('!actors.items.effects!'+id(1)+'.'+id(2)+'.'+id(3),{_id:id(3),disabled:false})];
    const r=decodeStoredRecords(rows,{database:'actors',rootCollection:'actors'});assert.equal(r.ledger.length,3);assert.equal(r.records.length,3);assert.deepEqual(r.documents[0].data,{_id:id(1),items:[{_id:id(2),effects:[{_id:id(3),disabled:false}],system:{value:4}}],effects:[],unlisted:{keep:['x',null]}});
    assert.deepEqual(r.records[0].data,JSON.parse(rows[0].value));
    const folder=decodeStoredRecords([raw('!folders!'+id(5),{_id:id(5),folder:null})],{database:'ptu.feats',rootCollection:'items',pack:true});assert.equal(folder.records[0].coordinate,'Compendium.ptu.feats.Folder.'+id(5));
});
test('singleton embedded documents retain null, exact IDs and nested children',()=>{
    const r=decodeStoredRecords([raw('!scenes!'+id(1),{_id:id(1),tokens:[id(2)]}),raw('!scenes.tokens!'+id(1)+'.'+id(2),{_id:id(2),delta:id(3)}),raw('!scenes.tokens.delta!'+id(1)+'.'+id(2)+'.'+id(3),{_id:id(3),items:[],effects:[]})],{database:'scenes',rootCollection:'scenes'});assert.equal(r.documents[0].data.tokens[0].delta._id,id(3));
});
test('pinned v13 hierarchy distinguishes Cards/Card and scene/playlist sounds',()=>{
    const cards=decodeStoredRecords([raw('!cards!'+id(1),{_id:id(1),cards:[id(2)]}),raw('!cards.cards!'+id(1)+'.'+id(2),{_id:id(2),system:{keep:true}})],{database:'cards',rootCollection:'cards'});assert.equal(cards.records[1].documentType,'Card');
    for(const [collection,type]of [['scenes','AmbientSound'],['playlists','PlaylistSound']]){const r=decodeStoredRecords([raw('!'+collection+'!'+id(1),{_id:id(1),sounds:[id(2)]}),raw('!'+collection+'.sounds!'+id(1)+'.'+id(2),{_id:id(2)})],{database:collection,rootCollection:collection});assert.equal(r.records[1].documentType,type);}
    assert.throws(()=>decodeStoredRecords([raw('!scenes.levels!'+id(1)+'.'+id(2),{_id:id(2)})],{database:'scenes',rootCollection:'scenes'}),/unregistered/);
    assert.throws(()=>decodeStoredRecords([raw('!cards.cards.cards!'+id(1)+'.'+id(2)+'.'+id(3),{_id:id(3)})],{database:'cards',rootCollection:'cards'}),/unregistered/);
});
for(const [name,rows]of [
    ['unexplained key',[raw('metadata',{})]],
    ['wrong store',[raw('!items!'+id(1),{_id:id(1)})]],
    ['duplicate key',[raw('!actors!'+id(1),{_id:id(1)}),raw('!actors!'+id(1),{_id:id(1)})]],
    ['identity mismatch',[raw('!actors!'+id(1),{_id:id(2)})]],
    ['missing child',[raw('!actors!'+id(1),{_id:id(1),items:[id(2)]})]],
    ['orphan child',[raw('!actors.items!'+id(1)+'.'+id(2),{_id:id(2)})]],
    ['inline competing representation',[raw('!actors!'+id(1),{_id:id(1),items:[{_id:id(2)}]})]],
    ['repeated child',[raw('!actors!'+id(1),{_id:id(1),items:[id(2),id(2)]})]],
    ['unregistered child',[raw('!actors.unknown!'+id(1)+'.'+id(2),{_id:id(2)})]],
    ['invalid value',[raw('!actors!'+id(1),Buffer.from('INVALID-PRIVATE-RECORD'))]]
])test('raw accounting refuses '+name,()=>assert.throws(()=>decodeStoredRecords(rows,{database:'actors',rootCollection:'actors'}),/STOP:/));

test('User value canary is hashed without UTF8 or JSON decoding',()=>{
    const value=Buffer.from('CREDENTIAL-CANARY\xff');value.toString=()=>{throw Error('MUST NEVER DECODE');};
    const result=decodeStoredRecords([{key:Buffer.from('!users!'+C.pin.gm),value}],{database:'users',rootCollection:'users'});
    assert.equal(result.opaqueUsers[0].recordSha256,sha256(value));assert.doesNotMatch(JSON.stringify(result),/CREDENTIAL-CANARY|valueBase64/);
});
for(const [name,lexeme]of [['positive','1e309'],['negative','-1e309'],['nested','[null,{"deeper":1e309}]']])test('stored JSON refuses '+name+' overflow without changing values',()=>{
    const value=Buffer.from('{"_id":"'+id(1)+'","system":{"syntheticOverflow":'+lexeme+'}}');assert.throws(()=>decodeStoredRecords([{key:Buffer.from('!items!'+id(1)),value}],{database:'synthetic',rootCollection:'items'}),/STOP:/);
});
test('normal finite numbers, strings and null retain exact decoded values',()=>{
    const data={_id:id(1),system:{values:[Number.MAX_VALUE,-Number.MAX_VALUE,1e-300,0,null,'1e309']}};const value=decodeStoredRecords([raw('!items!'+id(1),data)],{database:'synthetic',rootCollection:'items'});assert.deepEqual(value.records[0].data,data);
});
const numericLossCases=[['integer','9007199254740993','9007199254740992'],['decimal','1.0000000000000001','1'],['underflow','1e-400','0']];
for(const [kind,lexeme]of numericLossCases)for(const sign of ['', '-'])for(const nested of [false,true])test('numeric lexeme rejects '+kind+(sign?' negative':' positive')+(nested?' nested':' scalar'),()=>{
    const token=sign+lexeme,value=nested?'[null,{"deeper":'+token+'}]':token;
    const source=Buffer.from('{"_id":"'+id(1)+'","system":{"PRIVATE-NUMERIC-CANARY":'+value+'}}');
    const outcomes=[()=>parseFiniteJson(value),()=>decodeStoredRecords([{key:Buffer.from('!items!'+id(1)),value:source}],{database:'synthetic',rootCollection:'items'})].map(run=>{try{run();return 'ACCEPTED';}catch(error){return error.message;}});
    assert.deepEqual(outcomes,['STOP: unrepresentable captured JSON','STOP: invalid or unrepresentable stored document encoding']);
});
for(const [kind,lexeme,stable]of numericLossCases)test('numeric lexeme conversion boundary rejects hidden '+kind+' change',()=>{
    const captures=[conversionData(false),conversionData(true)];
    for(const [n,stores]of captures.entries())stores[0].rows[0].value=Buffer.from(stores[0].rows[0].value.toString().replace('"unlisted":[null,1,"keep"]','"unlisted":[null,'+(n?lexeme:stable)+',"keep"]'));
    let comparisons=0;
    assert.throws(()=>{
        const values=captures.map(stores=>stores.flatMap(s=>decodeStoredRecords(s.rows,{database:s.profile.database,rootCollection:{Item:'items',RollTable:'tables',Macro:'macros',JournalEntry:'journal'}[s.profile.type],pack:true}).records));
        comparisons++;const batch='synthetic-numeric-conversion';
        const result=joinAdmittedConversionCaptures({kind:'conversion-before',origin:'captured-store-payloads',source:'synthetic',batch,records:values[0]},{kind:'conversion-after',origin:'captured-store-payloads',source:'synthetic',batch,records:values[1]},{mode:'synthetic',batch});
        assert.deepEqual(result.errors,[]);
    },/STOP: invalid or unrepresentable stored document encoding/);
    assert.equal(comparisons,0);
});
for(const [kind,lexeme]of numericLossCases)test('numeric lexeme '+kind+' capture retains private failure and exact copies',()=>temp(async root=>{
    const o=await syntheticWorld(root),value=Buffer.from('{"_id":"'+id(1)+'","system":{"PRIVATE-NUMERIC-CANARY":'+lexeme+'}}');await store(o.sourceRoot,'data/items',[{key:Buffer.from('!items!'+id(1)),value}]);const before=await admittedSystemManifest(o.sourceRoot);
    await assert.rejects(captureStoppedStoreEvidence(o),/private failure\/copies retained/);const proof=JSON.parse(await fs.readFile(join(o.outputRoot,'failure.json'),'utf8'));
    assert.equal(proof.status,'failed');assert.equal(proof.sourceUnchanged,true);assert.equal(proof.immutableUnchanged,true);assert.deepEqual(await admittedSystemManifest(o.sourceRoot),before);assert.deepEqual(await admittedSystemManifest(join(o.outputRoot,'immutable')),before);
    for(const file of ['capture.json','provenance.json'])await assert.rejects(fs.stat(join(o.outputRoot,file)),/ENOENT/);
    assert.doesNotMatch(JSON.stringify(proof),/PRIVATE-NUMERIC-CANARY|9007199254740993|1\.0000000000000001|1e-400/);
}));
test('numeric spellings preserve equivalent decimal magnitudes and existing zeros',()=>{
    for(const [source,expected]of [['1',1],['1.0',1],['1e0',1],['1.00e+0000',1],['100e-2',1],['0.0100e2',1],['-100.00e-2',-1],['0.1000',0.1],['9007199254740992',9007199254740992],['9007199254740994',9007199254740994],['9.007199254740992e15',9007199254740992],['900719925474099200',900719925474099200],['1000000000000000100',1000000000000000100],['1e21',1e21],['1e23',1e23],['1.797693134862315700e+00000308',Number.MAX_VALUE],['5.0e-324',Number.MIN_VALUE],['0.000e-400',0],['-0',-0],['-0.000e+400',-0]])assert.equal(parseFiniteJson(source),expected);
});
test('serialized finite representatives retain large values decimals and subnormals',()=>{
    const values=[Number.MAX_VALUE,-Number.MAX_VALUE,Number.MIN_VALUE,-Number.MIN_VALUE,1e-323,2.2250738585072014e-308,1e-300,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,Number.MAX_SAFE_INTEGER+3,2**100,1e100,0.1,0.2,0.3,0.30000000000000004,1.2345678901234567,0,null,'1e-400'];
    const data={_id:id(1),system:{values}};assert.deepEqual(parseFiniteJson(Buffer.from(JSON.stringify(data))),data);assert.deepEqual(decodeStoredRecords([raw('!items!'+id(1),data)],{database:'synthetic',rootCollection:'items'}).documents[0].data,data);
});
test('numeric-looking strings and escaped property names stay strings',()=>{
    const value={'1e-400':'9007199254740993','9007199254740993':'1.0000000000000001','escaped"1e-400\\tail':'before \\"9007199254740993 after',array:['{"value":1e-400}','1.0000000000000001','9007199254740993','line\n1e-400',null]};
    const source=JSON.stringify(value).replace('"1e-400":','"\\u0031e-400":');assert.deepEqual(parseFiniteJson(source),value);
    for(const text of ['9007199254740993','1e-400','1.0000000000000001'])assert.equal(parseFiniteJson(JSON.stringify(text)),text);
});
test('huge numeric exponents reject changed magnitude without expanding powers',()=>{
    const huge='9'.repeat(10000);
    for(const sign of ['', '-'])for(const exponent of [huge,'-'+huge])assert.throws(()=>parseFiniteJson(sign+'1e'+exponent),{message:'STOP: unrepresentable captured JSON'});
    assert.deepEqual(parseFiniteJson('[0e'+huge+',-0.000e-'+huge+']'),[0,-0]);
});
test('long coefficient and exponent spellings normalize without magnitude expansion',()=>{
    const zeros='0'.repeat(10000);
    assert.equal(parseFiniteJson('1'+zeros+'e-10000'),1);assert.equal(parseFiniteJson('-0.'+zeros+'1e10001'),-1);assert.equal(parseFiniteJson('1e+'+zeros+'0'),1);
});
test('every original number is checked even behind duplicate property names',()=>{
    for(const token of [...numericLossCases.map(c=>c[1]),'1e309'])assert.throws(()=>parseFiniteJson('{"value":'+token+',"value":0}'),{message:'STOP: unrepresentable captured JSON'});
    assert.deepEqual(parseFiniteJson('{"value":"1e-400","value":1.0}'),{value:1});
});
test('invalid numeric syntax encoding and private excerpts retain generic errors',()=>{
    for(const text of ['{"PRIVATE-NUMERIC-CANARY":01}','{"PRIVATE-NUMERIC-CANARY":1.}','{"PRIVATE-NUMERIC-CANARY":1e+}','{"PRIVATE-NUMERIC-CANARY":NaN}','{"PRIVATE-NUMERIC-CANARY":"unterminated}', '[1e-400,]'])assert.throws(()=>parseFiniteJson(text),{message:'STOP: unrepresentable captured JSON'});
    assert.throws(()=>parseFiniteJson(Buffer.from([0xff])),{message:'STOP: unrepresentable captured JSON'});
});
test('numeric precision in manifests refuses before any store read or copy',async()=>{
    for(const [,token]of numericLossCases)await temp(async root=>{
        const o=await syntheticWorld(root),path=join(o.sourceRoot,'world.json'),bytes=(await fs.readFile(path,'utf8')).replace('"playtime":0','"playtime":'+token);await fs.writeFile(path,bytes);o.sourceBindings=[{path:'world.json',sha256:sha256(bytes)}];let reads=0;o.reader={binding:{kind:'synthetic-reader'},read:async()=>{reads++;return [];}};
        await assert.rejects(captureStoppedStoreEvidence(o),/unrepresentable/);assert.equal(reads,0);assert.deepEqual(await fs.readdir(o.outputRoot),[]);
    });
});
test('all decoded capture/manifest trees reject non-finite values and unsafe in-memory JSON',()=>{
    for(const bytes of ['{"world":{"playtime":1e309}}','{"outputs":[{"nested":-1e309}]}'])assert.throws(()=>parseFiniteJson(Buffer.from(bytes)),/unrepresentable/);
    assert.deepEqual(parseFiniteJson('{"values":[1,null,"1e309"]}'),{values:[1,null,'1e309']});
    for(const value of [[,1],Object.assign([1],{extra:2}),{value:Infinity}])assert.throws(()=>assertFiniteJson(value),/unrepresentable/);
});
test('non-finite world manifest refuses before any database read or copy',()=>temp(async root=>{
    const o=await syntheticWorld(root),path=join(o.sourceRoot,'world.json'),bytes=(await fs.readFile(path,'utf8')).replace('"playtime":0','"playtime":1e309');await fs.writeFile(path,bytes);o.sourceBindings=[{path:'world.json',sha256:sha256(bytes)}];let reads=0;o.reader={binding:{kind:'synthetic-reader'},read:async()=>{reads++;return [];}};
    await assert.rejects(captureStoppedStoreEvidence(o),/unrepresentable/);assert.equal(reads,0);assert.deepEqual(await fs.readdir(o.outputRoot),[]);
}));
test('fresh separate User projection has exact opaque IDs and permitted fields',()=>{
    const opaque=C.accounts.users.map(u=>({id:u.id,recordSha256:sha256(u.id)}));const observation={mode:'synthetic',source:'normal-authorized-foundry-ui',sessionId:'synthetic-session',observedMs:time,users:C.accounts.users.map(u=>({...u,ownership:null,permissions:{}}))};
    assert.equal(bindOpaqueUsers(opaque,observation,{mode:'synthetic',capturedMs:time}).length,2);
    for(const change of [o=>o.users.pop(),o=>o.users[0].password='CANARY',o=>o.observedMs=time-300001,o=>o.observedMs=time+1,o=>o.mode='native',o=>o.users[1].id=o.users[0].id]){const bad=copy(observation);change(bad);assert.throws(()=>bindOpaqueUsers(opaque,bad,{mode:'synthetic',capturedMs:time}),/STOP:/);}
});

test('query filters runtime names at provider and never emits command lines',()=>{
    assert.match(PROCESS_QUERY,/-Filter "Name='node.exe' OR Name='electron.exe' OR Name LIKE 'Foundry%.exe'" -Property Name,ProcessId,CommandLine/);
    assert.match(PROCESS_QUERY,/Get-NetTCPConnection -LocalPort 30001 -State Listen/);assert.match(PROCESS_QUERY,/CmdletizationQuery_NotFound/);assert.match(PROCESS_QUERY,/Select-Object ProcessId,Name/);assert.doesNotMatch(PROCESS_QUERY,/Select-Object[^\n]*CommandLine|Stop-Process|Start-Process|Set-Acl/);
});
test('generated process predicate detects forward slash equivalent target',async()=>{
    const r=await generatedProcessRows([{Name:'node.exe',ProcessId:201,CommandLine:'node.exe main.js --dataPath "D:/Projects/PTU 1.05 on Foundry/.foundry-test" --port 30001'}]);assert.deepEqual(r.matches.map(r=>r.ProcessId),[201]);assert.deepEqual(r.unreadable,[]);
});
test('generated predicate handles lexical Windows equivalents and refuses ambiguous process rows',async()=>{
    const slash=TARGET_ROOT,back=slash.replaceAll('/','\\');
    const commands=[
        ['target',`node.exe main.mjs --dataPath "${back}" --port 30001`],
        ['target',`node.exe main.mjs --dataPath "${slash.toLowerCase()}"`],
        ['target',`node.exe main.mjs --dataPath="${slash.replace('/PTU','\\PTU').replace('/.foundry','\\.foundry')}"`],
        ['target',`node.exe main.mjs "--dataPath=${back}"`],
        ['target',`node.exe\tmain.mjs\t--dataPath\t"${slash}"`],
        ['target',`node.exe main.mjs --dataPath "${slash.replace('/.foundry-test','/unused/../.foundry-test/')}"`],
        ['target',`"C:\\Program Files\\node.exe" main.mjs --dataPath "${back.replaceAll('\\','\\\\')}"`],
        ['unrelated',`node.exe main.mjs --dataPath "${slash}-other"`],
        ['unrelated',`node.exe main.mjs --dataPath "D:/Projects/other/.foundry-test"`],
        ['unrelated',`node.exe main.mjs --log "${slash}" --note "UNRELATED-COMMAND-CANARY"`],
        ['unrelated',`node.exe main.mjs --dataPath "D:/other" --message "cache at ${slash}"`],
        ['unrelated',`node.exe main.mjs --comment "the argument --dataPath ${slash} is unrelated"`],
        ['unrelated',`node.exe main.mjs\u00a0--dataPath "${slash}"`],
        ['unknown','node.exe main.mjs --dataPath'],
        ['unknown','node.exe main.mjs --dataPath .foundry-test'],
        ['unknown',`node.exe main.mjs --dataPath "${slash}`],
        ['unknown',`node.exe main.mjs --dataPath "${slash}" --dataPath "D:/other"`],
        ['unknown',`node.exe main.mjs --dataPath "${slash}/child"`],
        ['unknown',`node.exe main.mjs --dataPath "\\\\?\\${back}"`],
        ['unknown',`node.exe main.mjs --dataPath "${slash}."`],
        ['unknown',`node.exe main.mjs --dataPath "${slash}"""`],
        ['unknown',`node.exe main.mjs --dataPath "${slash}\\\\"""`],
        ['unknown','node.exe main.mjs --dataPath D:relative'],
        ['unknown',null],['unknown','   ']
    ];
    const rows=commands.map(([kind,CommandLine],n)=>({Name:n%2?'electron.exe':'node.exe',ProcessId:n+300,CommandLine})),r=await generatedProcessRows(rows);
    assert.deepEqual(r.matches.map(v=>v.ProcessId),commands.flatMap(([kind],n)=>kind==='target'?[n+300]:[]));
    assert.deepEqual(r.unreadable.map(v=>v.ProcessId),commands.flatMap(([kind],n)=>kind==='unknown'?[n+300]:[]));
});
test('synthetic OS observations enforce stopped and exact owned running states',async()=>{
    const stopped=await observeHostState({mode:'synthetic',query:async()=>host(),now:()=>time});assert.equal(requireHostState(stopped,{mode:'synthetic',now:time}),stopped);
    const running=await observeHostState({mode:'synthetic',query:async()=>host('running'),now:()=>time});requireHostState(running,{mode:'synthetic',state:'running',ownedPid:123,now:time});
    assert.throws(()=>requireHostState(running,{mode:'synthetic',now:time}),/STOP:/);assert.throws(()=>requireHostState(running,{mode:'synthetic',state:'running',ownedPid:999,now:time}),/STOP:/);
    await assert.rejects(observeHostState({mode:'native',query:async()=>host()}),/synthetic OS adapter/);
});
for(const [name,mutate]of [['process error',o=>o.processError='denied'],['port error',o=>o.portError='denied'],['unknown absent result',o=>o.portAbsent=false],['unreadable candidate',o=>o.unreadable=[{ProcessId:5}]],['lock',o=>o.lockExists=true],['stale',o=>o.startedMs=time-60001],['future',o=>o.observedMs=time+1],['wrong target',o=>o.target='D:/other'],['test/native mismatch',o=>o.mode='native']])test('host refusal: '+name,async()=>{const o=await observeHostState({mode:'synthetic',query:async()=>host(),now:()=>time});mutate(o);assert.throws(()=>requireHostState(o,{mode:'synthetic',now:time}),/STOP:/);});
test('executor observations require fresh sources and preserve actual hours boundaries',()=>{
    assert.deepEqual(externalObservationErrors(external(),{mode:'synthetic',now:time}),[]);const e=external();e.observations[0].observedMs=time-60001;assert.ok(externalObservationErrors(e,{mode:'synthetic',now:time}).length);
    assert.throws(()=>operatingHoursBoundary(Date.parse('2026-11-02T13:00:00Z')),/blackout/);assert.equal(operatingHoursBoundary(Date.parse('2026-11-02T12:59:30Z')),Date.parse('2026-11-02T13:00:00Z'));assert.equal(operatingHoursBoundary(time),time+60000);
    assert.throws(()=>createFeatureReviewOperator({mode:'native',externalObservations:external,query:async()=>host()}),/STOP:/);
});
test('containment and pins refuse escapes, links and changed bytes',()=>temp(async root=>{
    const file=join(root,'pin');await fs.writeFile(file,'one');await pinnedFiles(root,[{path:'pin',sha256:sha256('one')}]);await assert.rejects(containedPath(root,resolve(root,'../outside'),{missing:true}),/outside/);
    await fs.writeFile(file,'two');await assert.rejects(pinnedFiles(root,[{path:'pin',sha256:sha256('one')}]),/mismatch/);
    const link=join(root,'link');await fs.symlink(root,link,process.platform==='win32'?'junction':'dir');await assert.rejects(containedPath(root,link,{directory:true}),/link/);
}));

test('private packet receipt binds exact issued bytes and rejects changed baseline',()=>temp(async root=>{
    const i=await issued(),file=join(root,'packet.json');await fs.writeFile(file,i.packetBytes);const receipt=await verifyPrivatePacketReceipt({plan:i.plan,packetBytes:i.packetBytes,packetFile:file,privateRoot:root});assert.equal(receipt.acknowledgement.precedingSegmentId,null);
    const changed=copy(i.plan);changed.baseline.protectedDocuments[0].data.name='changed';await assert.rejects(verifyPrivatePacketReceipt({plan:changed,packetBytes:i.packetBytes,packetFile:file,privateRoot:root}),/STOP:/);
    await fs.writeFile(file,'{}');await assert.rejects(verifyPrivatePacketReceipt({plan:i.plan,packetBytes:i.packetBytes,packetFile:file,privateRoot:root}),/STOP:/);
}));
test('macro absence reads the private baseline and rejects forged absent claims',()=>temp(async root=>{
    const b=baseline(),file=join(root,'baseline.json'),bytes=JSON.stringify(b),uuid='Macro.'+id(900);await fs.writeFile(file,bytes);
    const receipt=await verifyPrivateMacroAbsence({baselineFile:file,privateRoot:root,macroUuid:uuid,expectedBaselineSha256:sha256(bytes),observedMs:time});assert.equal(receipt.macroUuid,uuid);
    b.ids.macros=[id(900)];b.protectedDocuments.push({collection:'macros',id:id(900),data:{_id:id(900)}});assert.deepEqual(admittedBaselineErrors(b),[]);await fs.writeFile(file,JSON.stringify(b));
    await assert.rejects(verifyPrivateMacroAbsence({baselineFile:file,privateRoot:root,macroUuid:uuid,expectedBaselineSha256:sha256(JSON.stringify(b)),observedMs:time,absent:true}),/absence/);
}));

test('concrete synthetic operator binds private bytes, serial merge, refresh and stable callback',()=>temp(async root=>{
    const collection=await syntheticWorld(root);await capture(collection);const baselineFile=join(collection.outputRoot,'capture.json'),baselineCapture={captureFile:baselineFile,provenanceFile:join(collection.outputRoot,'provenance.json'),privateRoot:root};
    const first=await issued(JSON.parse(await fs.readFile(baselineFile,'utf8'))),packetFile=join(root,'packet-0.json'),runtime=join(root,'runtime');await fs.mkdir(runtime);await fs.writeFile(join(runtime,'pin'),'synthetic runtime');await fs.writeFile(packetFile,first.packetBytes);
    let replays=0;
    const op=createFeatureReviewOperator({mode:'synthetic',syntheticRoot:root,externalObservations:external,query:async()=>host('running'),now:()=>time,replayAdapter:async()=>{replays++;return {kind:'synthetic-replay-adapter',integrity:'passed',previousProofReplay:'passed',originalBackupReplay:'passed',artifactReplay:'passed',conversion:'complete-captured-format-match',controllerReplay:'passed'};}});
    const base={ownedPid:123,plan:first.plan,packetBytes:first.packetBytes,packetFile,privateRoot:root,browserFacts:facts(),bindings:[{path:'pin',sha256:sha256('synthetic runtime')}],runtimeRoot:runtime,baselineFile,baselineSha256:sha256(JSON.stringify(first.plan.baseline)),baselineCapture,priorSystemRoot:collection.context.priorSystemRoot,backupManifestFile:collection.context.backupManifestFile};
    const setup=await op.prepareAction({...base,action:'setup'});assert.equal(setup.mode,'synthetic');assert.ok(setup.macroAbsence.receiptSha256);assert.doesNotMatch(JSON.stringify(setup),/protectedDocuments|recordSha256|preexisting|acceptedSegments/);
    const v=createExecutionVerifier({mode:'synthetic',packet:first.packet,packetSha256:sha256(first.packetBytes),readFacts:facts,now:()=>time,monotonic:()=>100});v.armAction(setup);
    const context=(w,operation)=>({policy:C.policy,gates:C.externalGates,batch:w.batch,identity:facts().identity,anchor:w.anchor,packetSha256:w.packetSha256,baselineChecks:w.packet.baselineChecks,operation});v.verifyExecution(context(setup,'setup'));v.verifyExecution({...context(setup,'bootstrap-macro'),packetSha256:null});v.verifyExecution({...context(setup,'verify-private-macro-absence'),packetSha256:null,macroUuid:setup.macroAbsence.macroUuid,macroId:id(900)});v.disarm();
    const segment={packetId:first.packet.anchor.packetId,segmentId:first.packet.anchor.segmentId,parentRevision:first.packet.anchor.revision,parentCheckpointSha256:first.packet.anchor.checkpointSha256,packetSha256:sha256(first.packetBytes),identity:facts().identity,runtime:first.packet.runtime.map(r=>({...r,served:r.packaged})),navigation:{timeOrigin:1000,type:'navigate'},events:[],mutations:[],captures:[],controlState:{phase:first.packet.phase,resources:[],mappings:[],packMappings:[]},firstFailure:null};
    const merged=await savePrivateControllerSegment({plan:first.plan,segmentBytes:JSON.stringify(segment),privateRoot:root,mode:'synthetic',syntheticRoot:root});
    const second=await issueAdmittedControllerPacket(merged,{packetId:'next-packet',segmentId:'next-segment',userId:C.pin.gm,phase:'initial',bootstrapMacroUuid:first.packet.baselineChecks.bootstrapMacroUuid});const nextFile=join(root,'packet-1.json');await fs.writeFile(nextFile,second.packetBytes);
    const nextBase={...base,plan:second.plan,packetBytes:second.packetBytes,packetFile:nextFile};const refresh=await op.prepareAction({...nextBase,action:'refresh'});v.armAction(refresh);assert.equal(v.verifyExecution({...context(refresh,'verify-private-segment-ack'),precedingSegmentId:segment.segmentId,precedingSegmentSha256:sha256(JSON.stringify(segment))}),undefined);v.disarm();
    const begin=await op.prepareAction({...nextBase,action:'begin'});v.armAction(begin);v.verifyExecution(context(begin,'begin'));v.verifyExecution(context(begin,'begin'));v.disarm();assert.equal(replays,3);
    await fs.appendFile(join(root,'segments',segment.segmentId+'.json'),' ');await assert.rejects(op.prepareAction({...nextBase,action:'begin'}),/segment bytes changed/);
    await fs.appendFile(join(collection.context.priorSystemRoot,'system.json'),'changed');await assert.rejects(op.prepareAction({...nextBase,action:'begin'}),/prior-system backup changed/);
}));

test('failed leases retain a failure reference and require fresh safe-action acknowledgement',async()=>{
    const f=await verifierFixture();f.verifier.armAction(f.witness);f.advance(60000);assert.throws(()=>f.verifier.verifyExecution(f.context()),/expired/);const first=f.verifier.disarm().failureRef;
    const next={...copy(f.witness),id:'fresh-safe-action',observedMs:time+60000,expiresMs:time+120000,boundaryMs:time+120000,action:'export',failureRef:first};f.verifier.armAction(next);f.verifier.verifyExecution(f.context('export'));assert.equal(f.verifier.disarm().failureRef,first);
});

test('verifier requires arming, bounded nested guards, explicit disarm and no replay',async()=>{
    const f=await verifierFixture();f.verifier.armAction(f.witness);assert.equal(f.verifier.verifyExecution(f.context()),undefined);assert.equal(f.verifier.verifyExecution(f.context()),undefined);assert.throws(()=>f.verifier.verifyExecution(f.context()),/replayed/);const r=f.verifier.disarm();assert.ok(r.failureRef);assert.throws(()=>f.verifier.armAction(f.witness),/replayed/);
});
for(const [name,mutate]of [['wrong session',w=>w.sessionId='foreign'],['wrong principal',w=>w.principal=C.pin.player],['wrong action',w=>w.action='actor-generation'],['future',w=>w.observedMs=time+1],['stale',w=>w.observedMs=time-60001],['overlong lease',w=>w.expiresMs=time+60001],['boundary',w=>w.boundaryMs=time+1],['missing ack',w=>w.acknowledgement={ack:true}],['wrong packet',w=>w.packetSha256='a'.repeat(64)],['mode',w=>w.mode='native']])test('verifier rejects '+name,async()=>{const f=await verifierFixture();mutate(f.witness);assert.throws(()=>f.verifier.armAction(f.witness),/STOP:/);});
for(const [name,mutate]of [['schema',x=>x.schema=0.116],['system',x=>x.identity.systemVersion='other'],['session',x=>x.sessionId+='changed'],['permission',x=>x.permissions.CREATE_ACTOR=true],['module',x=>x.modules.unapproved=true],['principal',x=>x.identity.user=C.pin.player],['account',x=>x.identity.accounts.push({id:id(8),name:'unexpected',role:1})]])test('every verifier invocation rereads '+name,async()=>{const f=await verifierFixture();f.verifier.armAction(f.witness);const live=facts();mutate(live);f.setLive(live);assert.throws(()=>f.verifier.verifyExecution(f.context()),/changed/);});
test('lease expiry, backward clock and overlapping actions stop without automatic renewal',async()=>{
    const a=await verifierFixture();a.verifier.armAction(a.witness);a.advance(60000);assert.throws(()=>a.verifier.verifyExecution(a.context()),/expired/);assert.throws(()=>a.verifier.verifyExecution(a.context()),/not armed/);
    const b=await verifierFixture();b.verifier.armAction(b.witness);b.setWall(time-1);assert.throws(()=>b.verifier.verifyExecution(b.context()),/clock/);
    const c=await verifierFixture();c.verifier.armAction(c.witness);assert.throws(()=>c.verifier.armAction({...c.witness,id:'other'}),/overlapping/);
});
test('action completion refuses elapsed asynchronous work and incomplete guard sequences',async()=>{
    const f=await verifierFixture('export');f.verifier.armAction(f.witness);f.verifier.verifyExecution(f.context());f.advance(60000);assert.throws(()=>f.verifier.disarm(),/completion exceeded/);assert.ok(f.verifier.disarm().failureRef);
    const g=await verifierFixture('setup');g.verifier.armAction(g.witness);g.verifier.verifyExecution(g.context());assert.throws(()=>g.verifier.disarm(),/incomplete guard/);
});
test('bootstrap nested order and exact macro identity are enforced',async()=>{
    const f=await verifierFixture('setup');f.verifier.armAction(f.witness);f.verifier.verifyExecution(f.context('setup'));f.verifier.verifyExecution({...f.context('bootstrap-macro'),packetSha256:null});f.verifier.verifyExecution({...f.context('verify-private-macro-absence'),packetSha256:null,macroUuid:f.witness.macroAbsence.macroUuid,macroId:id(900)});assert.equal(f.verifier.disarm().failureRef,null);
    const g=await verifierFixture('setup');g.verifier.armAction(g.witness);assert.throws(()=>g.verifier.verifyExecution(g.context('bootstrap-macro')),/reordered/);
    const h=await verifierFixture('setup');h.witness.macroAbsence={absent:true};assert.throws(()=>h.verifier.armAction(h.witness),/macro-absence/);
});
test('native verifier disallows test browser observers and checks target before accounts',async()=>{
    const f=await verifierFixture();assert.throws(()=>createExecutionVerifier({mode:'native',packet:{...f.packet,mode:'native'},packetSha256:f.packetSha256,readFacts:facts}),/STOP:/);
    const prior=Object.getOwnPropertyDescriptor(globalThis,'game');let reads=0;Object.defineProperty(globalThis,'game',{configurable:true,value:{world:{id:'campaign'},get users(){reads++;throw Error('no');}}});try{assert.throws(readNativeBrowserFacts,/target/);assert.equal(reads,0);}finally{if(prior)Object.defineProperty(globalThis,'game',prior);else delete globalThis.game;}
});

// REAL protected controller + REAL verifier; only IO/session services are doubles.
// Native-shaped packets are necessary to reach the held controller. They are never native evidence.
async function controllerServices(run) {
    const held=createAdmittedFeatureReviewPlan(),plan=buildAdmittedFeatureReviewInputs(held,{mode:'native',batch:'p05-feature-review-20990101T000000Z-1234abcd',baseline:baseline(),runtime:held.runtime.map(r=>({...r,installed:r.packaged}))});
    const genesis=await issueAdmittedControllerPacket(plan,{packetId:'service-genesis',segmentId:'service-genesis-segment',userId:C.pin.gm,phase:'initial',bootstrapMacroUuid:'Macro.'+id(9022)});
    const resources=C.fixtures.roles.map((r,n)=>({role:r.role,kind:r.kind,type:r.type,id:r.kind==='Pack'?C.fixtures.pack:id(9000+n),uuid:r.kind==='Actor'?'Actor.'+id(9000+n):r.kind==='worldItem'?'Item.'+id(9000+n):r.kind==='Macro'?'Macro.'+id(9000+n):r.kind==='Pack'?'Compendium.'+C.fixtures.pack:null,batch:plan.batch,created:true,synthetic:false}));
    for(const r of resources){const p=C.fixtures.roles.find(p=>p.role===r.role);if(p.parent){const parent=resources.find(r=>r.role===p.parent);r.parentUuid=parent.uuid;r.uuid=parent.uuid+'.Item.'+r.id;}if(r.kind==='Pack')r.collection=C.fixtures.pack;}
    const setup={packetId:genesis.packet.anchor.packetId,segmentId:genesis.packet.anchor.segmentId,parentRevision:0,parentCheckpointSha256:genesis.packet.anchor.checkpointSha256,packetSha256:sha256(genesis.packetBytes),identity:facts().identity,runtime:genesis.packet.runtime.map(r=>({...r,served:r.packaged})),navigation:{timeOrigin:1000,type:'navigate'},events:[],mutations:[],captures:[],controlState:{phase:'gm',resources,mappings:admittedMappings(resources,plan.batch),packMappings:admittedMappings(resources,plan.batch,true)},firstFailure:null};
    const mutation=value=>{const index=setup.mutations.length;setup.mutations.push(value);setup.events.push({sequence:setup.events.length,kind:'mutation',index});},operation=value=>setup.events.push({sequence:setup.events.length,kind:'operation',value});
    const remaining=[...resources],known=new Set();while(remaining.length){const n=remaining.findIndex(r=>!r.parentUuid||known.has(r.parentUuid));assert.ok(n>=0);const r=remaining.splice(n,1)[0];mutation({kind:'create',uuid:r.uuid,userId:C.pin.gm,batch:plan.batch});known.add(r.uuid);}
    operation({kind:'setup',counts:copy(C.fixtures.counts)});for(const role of [...C.access.observerRoles,C.access.limitedRole])mutation({kind:'access',uuid:resources.find(r=>r.role===role).uuid,userId:C.pin.gm,batch:plan.batch,principal:C.pin.player,level:role===C.access.limitedRole?1:2});operation({kind:'grants',coveredPlayers:copy(C.accounts.coveredPlayers)});
    const prepared=await mergeAdmittedControllerSegment(genesis.plan,setup),macroUuid=resources.find(r=>r.kind==='Macro').uuid;
    const first=await issueAdmittedControllerPacket(prepared,{packetId:'service-first',segmentId:'service-first-segment',userId:C.pin.gm,phase:'gm',bootstrapMacroUuid:macroUuid});
    const body=await fs.readFile(new URL('../tools/foundry-feature-review-check.mjs',import.meta.url),'utf8');
    const source=body.replace("'./feature-review-admitted-contract.mjs'",JSON.stringify(new URL('../tools/feature-review-admitted-contract.mjs',import.meta.url).href)).replace("'/systems/ptu/src/util/rule-version-registry.js'",JSON.stringify(new URL('../src/util/rule-version-registry.js',import.meta.url).href)).replace("'/systems/ptu/src/module/apps/feature-acquisition-review-launcher.js'",JSON.stringify('data:text/javascript,export function launchFeatureAcquisitionReview(){throw Error(%22No case execution in this service double%22)}'));
    const module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
    const names=['game','fetch','Dialog','sessionStorage'],saved=Object.fromEntries(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)])),backing=new Map();let output='';
    const html={find:()=>({val:v=>{if(v!==undefined)output=v;return output;},on:()=>{}})};
    const values={game:{world:{id:C.pin.world,title:C.target.title},version:C.pin.core,system:{id:'ptu',version:C.pin.system},socket:{id:'synthetic-controller-socket',connected:true},user:{id:C.pin.gm,isGM:true,permissions:{}},users:copy(C.accounts.users),settings:{get:(_scope,key)=>key==='worldSchemaVersion'?0.115:key==='worldSystemVersion'?'4.4.3':{}}},
        fetch:async url=>({ok:true,arrayBuffer:async()=>Buffer.from((await fs.readFile(new URL('../'+url.replace('/systems/ptu/',''),import.meta.url),'utf8')).replaceAll('\r\n','\n'))}),
        sessionStorage:{getItem:key=>backing.get(key)??null,setItem:(key,value)=>backing.set(key,value),removeItem:key=>backing.delete(key)},Dialog:class{constructor(config){this.config=config;this.element=html;}render(){this.config.render(html);}async close(){}}};
    try {
        for(const [name,value]of Object.entries(values))Object.defineProperty(globalThis,name,{configurable:true,value});
        const verifierFor=i=>createExecutionVerifier({mode:'native',packet:i.packet,packetSha256:sha256(i.packetBytes)});
        function witness(i,action,previous=i.plan.handoff.acceptedSegments.findLast(a=>a.segment.identity.user===i.packet.audience.userId)?.segment??null){const observedMs=Date.now(),live=readNativeBrowserFacts();return {kind:'p05-operator-action-v1',mode:'native',id:'synthetic-service-'+action+'-'+Math.random(),observedMs,expiresMs:observedMs+60000,boundaryMs:observedMs+60000,sessionId:live.sessionId,principal:live.identity.user,batch:i.packet.batch,packet:copy(i.packet),packetSha256:sha256(i.packetBytes),anchor:copy(i.packet.anchor),action,browserFacts:live,operatorRecordSha256:sha256('SYNTHETIC-SERVICE-OBSERVATION-NOT-NATIVE'),acknowledgement:{packetSha256:sha256(i.packetBytes),checkpointSha256:i.packet.anchor.checkpointSha256,revision:i.packet.anchor.revision,principal:i.packet.audience.userId,precedingSegmentId:previous?.segmentId??null,precedingSegmentSha256:previous?sha256(JSON.stringify(previous)):null,globalPrefixSha256:sha256(i.plan.handoff.acceptedSegments.map(a=>({segmentId:a.segmentId,packetSha256:a.packetSha256,segmentSha256:a.segmentSha256})))},macroAbsence:null,failureRef:null};}
        const verifier=verifierFor(first);verifier.armAction(witness(first,'open'));const controller=await module.openFeatureReviewCheck({inputs:first.packet,packetBytes:first.packetBytes,verifyExecution:verifier.verifyExecution});verifier.disarm();
        const exportFirst=async()=>{verifier.armAction(witness(first,'export'));const segment=await controller.exportSegment();verifier.disarm();assert.equal(output,JSON.stringify(segment));const merged=await mergeAdmittedControllerSegment(first.plan,segment),next=await issueAdmittedControllerPacket(merged,{packetId:'service-next',segmentId:'service-next-segment',userId:C.pin.gm,phase:'gm',bootstrapMacroUuid:first.packet.baselineChecks.bootstrapMacroUuid});return {segment,next};};
        const selectUser=user=>{game.user={id:user,isGM:user===C.pin.gm,permissions:{}};game.socket.id=user===C.pin.gm?'synthetic-controller-socket':'synthetic-player-socket';};
        await run({first,controller,verifier,verifierFor,witness,exportFirst,open:(i,v)=>module.openFeatureReviewCheck({inputs:i.packet,packetBytes:i.packetBytes,verifyExecution:v.verifyExecution}),backing,selectUser});
    } finally {for(const name of names)if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}
}
test('actual controller and real verifier export/merge/issue/refresh then execute on the SAME callback',()=>controllerServices(async h=>{
    const {segment,next}=await h.exportFirst(),callback=h.verifier.verifyExecution,w=h.witness(next,'refresh',segment);h.verifier.armAction(w);await h.controller.useCheckpoint(next.packet,{packetBytes:next.packetBytes});h.verifier.disarm();assert.equal(h.verifier.verifyExecution,callback);
    h.verifier.armAction(h.witness(next,'export',segment));const local=await h.controller.exportSegment();h.verifier.disarm();assert.equal(local.segmentId,next.packet.anchor.segmentId);assert.equal(local.events[0].value.kind,'checkpoint-import');assert.equal(local.captures.length,0);await mergeAdmittedControllerSegment(next.plan,local);
}));
test('actual controller sealed reload permits open THEN exact private acknowledgement with real verifier',()=>controllerServices(async h=>{
    const {segment,next}=await h.exportFirst(),fresh=h.verifierFor(next);fresh.armAction(h.witness(next,'open',segment));const reloaded=await h.open(next,fresh);const receipt=fresh.disarm();assert.deepEqual(receipt.calls,{open:1,'verify-private-segment-ack':1});fresh.armAction(h.witness(next,'export',segment));const local=await reloaded.exportSegment();fresh.disarm();await mergeAdmittedControllerSegment(next.plan,local);
}));
for(const defect of ['wrong-prefix','missing-ack','wrong-principal'])test('actual controller transition refuses '+defect,()=>controllerServices(async h=>{
    const {segment,next}=await h.exportFirst(),w=h.witness(next,'refresh',segment);
    if(defect==='wrong-prefix')w.acknowledgement.precedingSegmentId='unacknowledged-segment';
    if(defect==='missing-ack')w.acknowledgement={ack:true};
    if(defect==='wrong-principal')w.principal=C.pin.player;
    if(defect==='wrong-prefix'){h.verifier.armAction(w);await assert.rejects(h.controller.useCheckpoint(next.packet,{packetBytes:next.packetBytes}),/acknowledgement mismatch/);}
    else assert.throws(()=>h.verifier.armAction(w),/STOP:/);
    assert.equal(JSON.parse([...h.backing.values()][0]).segmentId,segment.segmentId);
}));
test('actual controller refresh rejects overlap and old witness replay',()=>controllerServices(async h=>{
    const {segment,next}=await h.exportFirst(),w=h.witness(next,'refresh',segment);h.verifier.armAction(w);const results=await Promise.allSettled([h.controller.useCheckpoint(next.packet,{packetBytes:next.packetBytes}),h.controller.useCheckpoint(next.packet,{packetBytes:next.packetBytes})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.match(String(results.find(r=>r.status==='rejected').reason),/in flight/);h.verifier.disarm();assert.throws(()=>h.verifier.armAction(w),/replayed/);
}));
test('actual controller sealed reload refuses stale packet and wrong private acknowledgement',()=>controllerServices(async h=>{
    const {segment,next}=await h.exportFirst(),old=h.verifierFor(h.first);old.armAction(h.witness(h.first,'open'));await assert.rejects(h.open(h.first,old),/sealed segment requires/);
    const fresh=h.verifierFor(next),w=h.witness(next,'open',segment);w.acknowledgement.precedingSegmentSha256='a'.repeat(64);fresh.armAction(w);await assert.rejects(h.open(next,fresh),/acknowledgement mismatch/);
}));
test('same packet cannot acquire a different global prefix commitment',()=>temp(root=>controllerServices(async h=>{
    const s=await interleavedState(root,h);h.verifier.armAction(await s.witness(s.returning,'refresh'));await h.controller.useCheckpoint(s.returning.packet,{packetBytes:s.returning.packetBytes});h.verifier.disarm();
    const w=await s.witness(s.returning,'export');w.acknowledgement.globalPrefixSha256='b'.repeat(64);assert.throws(()=>h.verifier.armAction(w),/private acknowledgement/);assert.ok(h.verifier.disarm().failureRef);
})));
async function interleavedState(root,h){
    await fs.mkdir(join(root,'segments'));await fs.mkdir(join(root,'packets'));
    const packetFile=i=>join(root,'packets',i.packet.anchor.packetId+'.json');
    async function persist(i){for(const a of i.plan.handoff.acceptedSegments){const file=join(root,'segments',a.segmentId+'.json');try{await fs.writeFile(file,a.segmentBytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||await fs.readFile(file,'utf8')!==a.segmentBytes)throw e;}}try{await fs.writeFile(packetFile(i),i.packetBytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||await fs.readFile(packetFile(i),'utf8')!==i.packetBytes)throw e;}}
    const verify=i=>verifyPrivatePacketReceipt({plan:i.plan,packetBytes:i.packetBytes,packetFile:packetFile(i),privateRoot:root});
    async function witness(i,action){await persist(i);const receipt=await verify(i),w=h.witness(i,action);w.acknowledgement=receipt.acknowledgement;return w;}
    const {segment,next}=await h.exportFirst();h.verifier.armAction(await witness(next,'refresh'));await h.controller.useCheckpoint(next.packet,{packetBytes:next.packetBytes});h.verifier.disarm();
    h.verifier.armAction(await witness(next,'export'));const gmSegment=await h.controller.exportSegment();h.verifier.disarm();let merged=await mergeAdmittedControllerSegment(next.plan,gmSegment);
    const player=await issueAdmittedControllerPacket(merged,{packetId:'review-player-packet',segmentId:'review-player-segment',userId:C.pin.player,phase:'player',bootstrapMacroUuid:next.packet.baselineChecks.bootstrapMacroUuid});
    h.selectUser(C.pin.player);const pv=h.verifierFor(player),firstPlayer=await witness(player,'open');assert.equal(firstPlayer.acknowledgement.precedingSegmentId,null);assert.equal(firstPlayer.acknowledgement.globalPrefixSha256,sha256(player.plan.handoff.acceptedSegments.map(a=>({segmentId:a.segmentId,packetSha256:a.packetSha256,segmentSha256:a.segmentSha256}))));pv.armAction(firstPlayer);const pc=await h.open(player,pv);pv.disarm();pv.armAction(await witness(player,'export'));const ps=await pc.exportSegment();pv.disarm();merged=await mergeAdmittedControllerSegment(player.plan,ps);
    const returning=await issueAdmittedControllerPacket(merged,{packetId:'returning-gm-packet',segmentId:'returning-gm-segment',userId:C.pin.gm,phase:'gm',bootstrapMacroUuid:next.packet.baselineChecks.bootstrapMacroUuid});
    await persist(returning);h.selectUser(C.pin.gm);
    return {segment,next,gmSegment,player,pv,pc,ps,returning,witness,verify,packetFile};
}
test('interleaved principal receipt lets the existing GM controller refresh its OWN last segment',()=>temp(root=>controllerServices(async h=>{
    const s=await interleavedState(root,h),w=await s.witness(s.returning,'refresh');assert.equal(w.acknowledgement.precedingSegmentId,s.gmSegment.segmentId);assert.equal(w.acknowledgement.globalPrefixSha256,sha256(s.returning.plan.handoff.acceptedSegments.map(a=>({segmentId:a.segmentId,packetSha256:a.packetSha256,segmentSha256:a.segmentSha256}))));const callback=h.verifier.verifyExecution;h.verifier.armAction(w);await h.controller.useCheckpoint(s.returning.packet,{packetBytes:s.returning.packetBytes});h.verifier.disarm();assert.equal(h.verifier.verifyExecution,callback);
})));
for(const style of ['refresh','sealed-reload'])test('real receipts/verifiers return GM then player through '+style,()=>temp(root=>controllerServices(async h=>{
    const s=await interleavedState(root,h);let gv=h.verifier,gc=h.controller;
    if(style==='refresh'){gv.armAction(await s.witness(s.returning,'refresh'));await gc.useCheckpoint(s.returning.packet,{packetBytes:s.returning.packetBytes});gv.disarm();}
    else{game.socket.id+='-reloaded';gv=h.verifierFor(s.returning);gv.armAction(await s.witness(s.returning,'open'));gc=await h.open(s.returning,gv);assert.deepEqual(gv.disarm().calls,{open:1,'verify-private-segment-ack':1});}
    gv.armAction(await s.witness(s.returning,'export'));const gs=await gc.exportSegment();gv.disarm();const merged=await mergeAdmittedControllerSegment(s.returning.plan,gs);
    const player=await issueAdmittedControllerPacket(merged,{packetId:'return-player-packet',segmentId:'return-player-segment',userId:C.pin.player,phase:'player',bootstrapMacroUuid:s.player.packet.baselineChecks.bootstrapMacroUuid});h.selectUser(C.pin.player);let pv=s.pv,pc=s.pc;
    const callback=pv.verifyExecution;
    if(style==='refresh'){const w=await s.witness(player,'refresh');assert.equal(w.acknowledgement.precedingSegmentId,s.ps.segmentId);assert.equal(w.acknowledgement.globalPrefixSha256,sha256(player.plan.handoff.acceptedSegments.map(a=>({segmentId:a.segmentId,packetSha256:a.packetSha256,segmentSha256:a.segmentSha256}))));pv.armAction(w);await pc.useCheckpoint(player.packet,{packetBytes:player.packetBytes});pv.disarm();assert.equal(pv.verifyExecution,callback);}
    else{game.socket.id+='-reloaded';pv=h.verifierFor(player);pv.armAction(await s.witness(player,'open'));pc=await h.open(player,pv);assert.deepEqual(pv.disarm().calls,{open:1,'verify-private-segment-ack':1});}
    pv.armAction(await s.witness(player,'export'));const result=await pc.exportSegment();pv.disarm();await mergeAdmittedControllerSegment(player.plan,result);
    const receipt=await s.verify(player);assert.doesNotMatch(JSON.stringify(receipt),/segmentBytes|acceptedSegments|protectedDocuments|recordSha256|captures|operations|returning-gm-segment|service-next-segment/);
})));
test('principal-local receipt preserves exact retained references through the protected refresh helper',()=>temp(root=>controllerServices(async h=>{
    const s=await interleavedState(root,h),v=h.verifierFor(s.next),w=await s.witness(s.returning,'refresh'),bytes=JSON.stringify(s.gmSegment),references=[{kind:'synthetic-Document-one'},{kind:'synthetic-Document-two'}];
    v.armAction(w);const result=await refreshFeatureReviewPacket({packet:s.next.packet,next:s.returning.packet,exported:{segment:s.gmSegment,bytes,sha256:sha256(bytes),eventCount:s.gmSegment.events.length},localEventCount:s.gmSegment.events.length,pendingReview:false,identity:readNativeBrowserFacts().identity,verifyExecution:v.verifyExecution,packetSha256:sha256(s.returning.packetBytes)},references);v.disarm();assert.equal(result.retainedReferences,references);assert.equal(result.retainedReferences[0],references[0]);assert.equal(result.retainedReferences[1],references[1]);
})));
for(const defect of ['local-prefix','ack-principal','global-checkpoint','local-bytes','global-bytes','reordered-history','forged-identity','stale-issued','forged-checkpoint','failure-rewrite'])test('interleaved receipt rejects '+defect,()=>temp(root=>controllerServices(async h=>{
    const s=await interleavedState(root,h),i=copy(s.returning);
    if(['local-prefix','ack-principal','global-checkpoint'].includes(defect)){
        const w=await s.witness(s.returning,'refresh');
        if(defect==='local-prefix'){w.acknowledgement.precedingSegmentId=s.ps.segmentId;w.acknowledgement.precedingSegmentSha256=sha256(JSON.stringify(s.ps));h.verifier.armAction(w);await assert.rejects(h.controller.useCheckpoint(s.returning.packet,{packetBytes:s.returning.packetBytes}),/acknowledgement mismatch/);assert.ok(h.verifier.disarm().failureRef);}
        else{if(defect==='ack-principal')w.acknowledgement.principal=C.pin.player;else w.acknowledgement.checkpointSha256='b'.repeat(64);assert.throws(()=>h.verifier.armAction(w),/private acknowledgement/);}
    }else{
        if(defect==='local-bytes')await fs.appendFile(join(root,'segments',s.gmSegment.segmentId+'.json'),' ');
        if(defect==='global-bytes')await fs.appendFile(join(root,'segments',s.ps.segmentId+'.json'),' ');
        if(defect==='reordered-history')[i.plan.handoff.acceptedSegments[1],i.plan.handoff.acceptedSegments[2]]=[i.plan.handoff.acceptedSegments[2],i.plan.handoff.acceptedSegments[1]];
        if(defect==='forged-identity')i.plan.handoff.acceptedSegments[1].segment.identity.user=C.pin.player;
        if(defect==='stale-issued')i.plan.handoff.issued=copy(s.next.plan.handoff.issued);
        if(defect==='forged-checkpoint')i.plan.checkpoint.operations.push({kind:'checkpoint-import',userId:C.pin.gm,navigation:{timeOrigin:1000,type:'navigate'}});
        if(defect==='failure-rewrite')i.plan.handoff.acceptedSegments.at(-1).segment.firstFailure={operation:'export',reason:'Synthetic forged failure'};
        await assert.rejects(s.verify(i),/STOP:/);
    }
    const marker=[...h.backing.values()].map(x=>JSON.parse(x)).find(x=>x.userId===C.pin.gm);assert.equal(marker.segmentId,s.gmSegment.segmentId);assert.equal(marker.status,'sealed');
})));

async function syntheticWorld(root){
    const source=join(root,'source'),output=join(root,'output'),prior=join(root,'prior');await fs.mkdir(source);await fs.mkdir(output);await fs.mkdir(prior);await fs.writeFile(join(prior,'system.json'),'synthetic prior system');await fs.writeFile(join(root,'backup-manifest.json'),'synthetic backup');
    const b=baseline();await fs.writeFile(join(source,'world.json'),JSON.stringify(b.world));
    for(const name of [...C.collections,'settings','users','fog']){let rows=[];if(name==='actors')rows=[raw('!actors!'+id(1),b.protectedDocuments[0].data)];if(name==='settings')rows=b.settings.map(s=>raw('!settings!'+s._id,s));if(name==='users')rows=C.accounts.users.map(u=>raw('!users!'+u.id,Buffer.from('NEVER-DECODE-USER-CREDENTIAL-'+u.id)));await store(source,'data/'+name,rows);}
    const config=join(root,'opaque-config.bin');await fs.writeFile(config,Buffer.from('NEVER-DECODE-CONFIG-CREDENTIAL\xff'));
    return {mode:'synthetic',stage:'baseline',sourceRoot:source,outputRoot:output,sourceBindings:[{path:'world.json',sha256:sha256(JSON.stringify(b.world))}],operator:operator(root),reader:adapter,syntheticRoot:root,usersObservation:{mode:'synthetic',source:'normal-authorized-foundry-ui',sessionId:'synthetic-world-session',observedMs:time,users:C.accounts.users.map(u=>({...u,ownership:null,permissions:{}}))},opaqueFiles:[config],context:{privateRoot:root,priorSystemRoot:prior,backupManifestFile:join(root,'backup-manifest.json')},now:()=>time};
}
test('collector working-copy writes leave source and immutable bytes exact; opaque secrets stay private',()=>temp(async root=>{
    const o=await syntheticWorld(root),before=await admittedSystemManifest(o.sourceRoot),result=await capture(o);assert.equal(result.status,'captured');assert.deepEqual(await admittedSystemManifest(o.sourceRoot),before);assert.deepEqual(await admittedSystemManifest(join(o.outputRoot,'immutable')),before);assert.notDeepEqual(await admittedSystemManifest(join(o.outputRoot,'working')),before);
    const captured=JSON.parse(await fs.readFile(join(o.outputRoot,'capture.json'),'utf8'));assert.deepEqual(admittedBaselineErrors(captured),[]);
    for(const file of ['capture.json','raw-ledger.json','provenance.json'])assert.doesNotMatch(await fs.readFile(join(o.outputRoot,file),'utf8'),/NEVER-DECODE-(USER|CONFIG)-CREDENTIAL/);
    assert.doesNotMatch(JSON.stringify(result),/permissions|recordSha256|NEVER-DECODE/);
    await readPrivateCapture({captureFile:join(o.outputRoot,'capture.json'),provenanceFile:join(o.outputRoot,'provenance.json'),privateRoot:root,mode:'synthetic',stage:'baseline'});
    const proof=await saveCapturedProof({captureFile:join(o.outputRoot,'capture.json'),provenanceFile:join(o.outputRoot,'provenance.json'),captureRoot:root,privateRoot:root,mode:'synthetic',syntheticRoot:root,batch:'synthetic-saved-baseline'});const wrapper=JSON.parse(await fs.readFile(join(root,proof.ref.path),'utf8'));assert.equal(wrapper.kind,'baseline');assert.deepEqual(wrapper.value,captured);assert.equal(sha256(JSON.stringify(wrapper)),proof.ref.sha256);
    await fs.appendFile(join(o.outputRoot,'raw-ledger.json'),' ');await assert.rejects(readPrivateCapture({captureFile:join(o.outputRoot,'capture.json'),provenanceFile:join(o.outputRoot,'provenance.json'),privateRoot:root,mode:'synthetic',stage:'baseline'}),/changed/);
}));
test('separate stopped closure captures reuse the accepted baseline/closure validators',()=>temp(async root=>{
    const o=await syntheticWorld(root);await capture(o);const baselineCapture={captureFile:join(o.outputRoot,'capture.json'),provenanceFile:join(o.outputRoot,'provenance.json'),privateRoot:root};
    const output=join(root,'closure-output');await fs.mkdir(output);
    const closure={sessions:[],runWindow:{startMs:time,endMs:time},cleanup:{uncertain:false,grantsRestored:true,packConfiguration:{},removed:[]},exit:{gmDeactivated:true,setupNavigated:true,administratorAuthentication:'unverified',route:'/setup',worldActive:false},process:{owned:true,stopped:true,portReleased:true,lockReleased:true,pid:123,dataPath:TARGET_ROOT},originalBackups:{retained:true,manifestSha256:C.originalBackups.manifestSha256,worldEntriesSha256:C.originalBackups.worldEntriesSha256,systemEntriesSha256:C.originalBackups.systemEntriesSha256},claims:copy(createAdmittedFeatureReviewPlan().claims)};
    const closed=await capture({...o,stage:'closure',outputRoot:output,context:{baselineCapture,restoredSystemRoot:o.context.priorSystemRoot,resources:[],closure}});assert.equal(closed.status,'captured');const proof=JSON.parse(await fs.readFile(join(output,'provenance.json'),'utf8'));assert.equal(proof.stage,'closure');assert.equal(proof.userProjection.observedMs,time);
}));
test('overflow capture fails privately with source and immutable bytes unchanged',()=>temp(async root=>{
    const o=await syntheticWorld(root),overflow=Buffer.from('{"_id":"'+id(1)+'","system":{"syntheticOverflow":1e309}}');await store(o.sourceRoot,'data/items',[{key:Buffer.from('!items!'+id(1)),value:overflow}]);const before=await admittedSystemManifest(o.sourceRoot);
    await assert.rejects(captureStoppedStoreEvidence(o),/private failure\/copies retained/);const proof=JSON.parse(await fs.readFile(join(o.outputRoot,'failure.json'),'utf8'));assert.equal(proof.status,'failed');assert.equal(proof.sourceUnchanged,true);assert.equal(proof.immutableUnchanged,true);assert.deepEqual(await admittedSystemManifest(o.sourceRoot),before);assert.deepEqual(await admittedSystemManifest(join(o.outputRoot,'immutable')),before);await assert.rejects(fs.stat(join(o.outputRoot,'capture.json')),/ENOENT/);assert.doesNotMatch(JSON.stringify(proof),/syntheticOverflow|1e309/);
}));
test('synthetic providers cannot target actual data or substitute an unbranded collector guard',()=>temp(async root=>{
    assert.throws(()=>createFeatureReviewOperator({mode:'synthetic',syntheticRoot:resolve('.'),externalObservations:external,query:async()=>host()}),/ignored cache/);
    const o=await syntheticWorld(root);await assert.rejects(captureStoppedStoreEvidence({...o,operator:{mode:'synthetic',prepareCollection:async()=>{throw Error('must not run');}}}),/operator mode/);
}));
for(const [name,change]of [['missing store',async o=>{await fs.rm(join(o.sourceRoot,'data/items'),{recursive:true});}],['unexpected store',async o=>{await store(o.sourceRoot,'data/unexpected',[]);}],['reader corruption',async o=>{o.reader={binding:{kind:'synthetic-reader'},read:async()=>{throw Error('PRIVATE-CORRUPTION-CANARY');}};}],['changed source',async o=>{o.reader={binding:{kind:'synthetic-reader'},read:async p=>{await fs.appendFile(join(o.sourceRoot,'world.json'),' ');return adapter.read(p);}};}]])test('collector retains failure and refuses '+name,()=>temp(async root=>{
    const o=await syntheticWorld(root);await change(o);await assert.rejects(captureStoppedStoreEvidence(o),/private failure\/copies retained/);const failure=JSON.parse(await fs.readFile(join(o.outputRoot,'failure.json'),'utf8'));assert.equal(failure.status,'failed');assert.doesNotMatch(JSON.stringify(failure),/PRIVATE-CORRUPTION-CANARY|NEVER-DECODE/);await assert.rejects(fs.stat(join(o.outputRoot,'provenance.json')),/ENOENT/);
}));
test('collector refuses native test adapters, invalid CLI and reused batch without starting collection',()=>temp(async root=>{
    const o=await syntheticWorld(root);await assert.rejects(captureStoppedStoreEvidence({...o,mode:'native'}),/operator mode/);await fs.writeFile(join(o.outputRoot,'owned-marker'),'present');await assert.rejects(captureStoppedStoreEvidence(o),/empty fresh/);await assert.rejects(collectorMain(['--request','any.json']),/trusted operator/);
}));

test('resolved CLI classic-level reader opens ONLY self-generated synthetic stores locally and in CI',()=>temp(async root=>{
    const reader=await resolvePinnedReader();assert.equal(reader.binding.version,'3.0.0');assert.equal(reader.binding.cliVersion,'3.0.5');assert.ok(reader.binding.files.some(f=>f.path.endsWith('.node')&&f.sha256.length===64));
    const r=createRequire(import.meta.resolve('@foundryvtt/foundryvtt-cli')),{ClassicLevel}=r('classic-level'),source=join(root,'synthetic-level');const db=new ClassicLevel(source,{keyEncoding:'buffer',valueEncoding:'buffer'});await db.open();const entry=raw('!items!'+id(1),{_id:id(1),name:'Synthetic native-reader compatibility'});await db.put(entry.key,entry.value);await db.close();
    const immutable=join(root,'immutable'),working=join(root,'working');const before=await admittedSystemManifest(source);await fs.cp(source,immutable,{recursive:true});await fs.cp(immutable,working,{recursive:true});const rows=await reader.read(working);assert.equal(rows.length,1);assert.deepEqual(rows[0],entry);assert.deepEqual(await admittedSystemManifest(source),before);assert.deepEqual(await admittedSystemManifest(immutable),before);
    const missing=join(root,'absent');await assert.rejects(reader.read(missing));await assert.rejects(fs.stat(missing),/ENOENT/);
    const corrupt=join(root,'corrupt');await fs.mkdir(corrupt);await fs.writeFile(join(corrupt,'CURRENT'),'MANIFEST-INVALID\n');await assert.rejects(reader.read(corrupt));
}));

function conversionData(after=false){
    const stores=[];let next=1000;
    for(const p of C.conversion.databases){const collection={Item:'items',RollTable:'tables',Macro:'macros',JournalEntry:'journal'}[p.type],roots=[],rows=[];let ordinal=0;
        function data(type){const d={_id:id(next++),name:'Synthetic stored '+type,system:{unlisted:[null,1,'keep']},flags:{},_stats:{coreVersion:'12.327'}};if(ordinal<p.transformations.legacySources)d.flags.core={sourceId:'Item.'+id(900000)};if(ordinal<p.transformations.exportSources)d.flags.exportSource={world:'synthetic',system:'ptu',coreVersion:'12.327',systemVersion:'4.4.3'};ordinal++;return d;}
        for(let n=0;n<p.primary;n++){const d=data(p.type);roots.push(d);rows.push({path:collection,ids:d._id,data:d});}
        for(let n=0;n<p.embedded;n++){const isTable=p.type==='RollTable',field=isTable?'results':'pages',d=data(isTable?'TableResult':'JournalEntryPage'),parent=roots[0];(parent[field]??=[]).push(d._id);if(isTable){delete d.name;d.type=n<p.transformations.packResults?'pack':'text';d.text='Synthetic text';if(d.type==='pack'){d.documentCollection='ptu.species';d.documentId=id(800000);}}rows.push({path:collection+'.'+field,ids:parent._id+'.'+d._id,data:d});}
        for(let n=0;n<p.folders;n++){const d={_id:id(next++),name:'Synthetic folder',unlisted:true};rows.push({path:'folders',ids:d._id,data:d});}
        if(after)for(const row of rows){const d=row.data;if(row.path==='folders')continue;d._stats.coreVersion=C.pin.core;d._stats.exportSource=null;if(d.flags.core?.sourceId){d._stats.compendiumSource=d.flags.core.sourceId;delete d.flags.core.sourceId;}if(d.flags.exportSource){const e=d.flags.exportSource;d._stats.exportSource={worldId:e.world,uuid:null,coreVersion:e.coreVersion,systemId:e.system,systemVersion:e.systemVersion};delete d.flags.exportSource;}if(row.path.endsWith('.pages'))d.category=null;if(row.path.endsWith('.results')){if(d.type==='pack'){d.type='document';d.name=d.text;d.description='';d.documentUuid='Compendium.'+d.documentCollection+'.'+d.documentId;}else{d.description=d.text;d.name='';}delete d.text;delete d.documentCollection;delete d.documentId;}}
        stores.push({profile:p,rows:rows.map(r=>raw('!'+r.path+'!'+r.ids,r.data))});
    }return stores;
}
test('complete 15-store raw captures pass the unchanged 10185-record conversion join',()=>temp(async root=>{
    let beforeCapture;
    for(const after of [false,true]){
        if(after){const previous=JSON.parse(await fs.readFile(beforeCapture.captureFile,'utf8'));const current={kind:'conversion-after',origin:'captured-store-payloads',source:'synthetic',batch:'synthetic-full-conversion',records:conversionData(true).flatMap(s=>decodeStoredRecords(s.rows,{database:s.profile.database,rootCollection:{Item:'items',RollTable:'tables',Macro:'macros',JournalEntry:'journal'}[s.profile.type],pack:true}).records)};assert.deepEqual(joinAdmittedConversionCaptures(previous,current,{mode:'synthetic',batch:current.batch}).errors,[]);}
        const source=join(root,after?'after-source':'before-source'),output=join(root,after?'after-output':'before-output');await fs.mkdir(source);await fs.mkdir(output);await fs.writeFile(join(source,'binding'),'synthetic');for(const s of conversionData(after))await store(source,s.profile.path,s.rows);
        const result=await capture({mode:'synthetic',stage:after?'conversion-after':'conversion-before',sourceRoot:source,outputRoot:output,sourceBindings:[{path:'binding',sha256:sha256('synthetic')}],operator:operator(root),reader:adapter,syntheticRoot:root,context:{batch:'synthetic-full-conversion',beforeCapture},now:()=>time});assert.equal(result.status,'captured');const captured=JSON.parse(await fs.readFile(join(output,'capture.json'),'utf8'));assert.equal(captured.records.length,10185);assert.equal(captured.records.filter(r=>r.documentType==='Folder').length,197);
        beforeCapture={captureFile:join(output,'capture.json'),provenanceFile:join(output,'provenance.json'),privateRoot:root};
    }
}));
