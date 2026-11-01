// Offline host bridge. Importing performs no IO or operating-system queries.
import {readFile,lstat,realpath,mkdir,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify,TextDecoder} from 'node:util';
import {resolve,relative,dirname,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {FEATURE_REVIEW_ADMITTED_CONTRACT as C,admittedCanonical as canonical,admittedBaselineErrors,admittedInputErrors,publicAdmittedPacketErrors,mergeAdmittedControllerSegment,buildAdmittedFeatureReviewInputs,issueAdmittedControllerPacket} from './feature-review-admitted-contract.mjs';
import {admittedSystemManifest,checkAdmittedFeatureReview,replayAdmittedControllerHistory} from './check-feature-review-admitted.mjs';
import {ACTION_GUARDS} from './feature-review-execution-verifier.mjs';

export const TARGET_ROOT=C.target.worldPath.split('/Data/')[0];
export const sha256=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:canonical(value)).digest('hex');
const equal=(a,b)=>canonical(a)===canonical(b);
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const run=promisify(execFile);
export const SYNTHETIC_CACHE_ROOT=fileURLToPath(new URL('../.cache/',import.meta.url));
const operators=new WeakSet();
export const isFeatureReviewOperator=value=>operators.has(value);
export function requireSyntheticRoot(root){const rel=relative(resolve(SYNTHETIC_CACHE_ROOT),resolve(root));if(!rel||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error('STOP: synthetic work must stay in a distinct ignored cache batch');}

/** Validate the WHOLE decoded tree before cloning, canonicalizing or serializing it. */
export function assertFiniteJson(value,seen=new Set(),depth=0) {
    if(value===null||typeof value==='string'||typeof value==='boolean')return value;
    if(typeof value==='number'){if(!Number.isFinite(value))throw Error('STOP: unrepresentable captured JSON');return value;}
    if(depth>128||!value||typeof value!=='object'||seen.has(value)||![Object.prototype,Array.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('STOP: unrepresentable captured JSON');
    seen.add(value);
    for(const key of Reflect.ownKeys(value)){
        if(Array.isArray(value)&&key==='length')continue;
        const descriptor=Object.getOwnPropertyDescriptor(value,key);
        if(typeof key!=='string'||!descriptor?.enumerable||!Object.hasOwn(descriptor,'value')||Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))throw Error('STOP: unrepresentable captured JSON');
        assertFiniteJson(descriptor.value,seen,depth+1);
    }
    if(Array.isArray(value)&&Object.keys(value).length!==value.length)throw Error('STOP: unrepresentable captured JSON');
    seen.delete(value);return value;
}
// Exact decimal identity: coefficient digits and a base-10 scale, never a power expansion.
function decimalLexemeKey(lexeme) {
    const [,sign,integer,fraction='',exponent='0']=/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(lexeme);
    const digits=(integer+fraction).replace(/^0+/,'');
    if(!digits)return '0'; // Preserve the existing JSON handling of either spelling of zero.
    const coefficient=digits.replace(/0+$/,'');
    const scale=BigInt(exponent)-BigInt(fraction.length)+BigInt(digits.length-coefficient.length);
    return sign+coefficient+'e'+scale;
}
export function parseFiniteJson(bytes) {
    try{
        if(typeof bytes!=='string'&&!Buffer.isBuffer(bytes))throw Error();
        const text=typeof bytes==='string'?bytes:bytes.toString('utf8');
        if(Buffer.isBuffer(bytes)&&!Buffer.from(text,'utf8').equals(bytes))throw Error();
        const value=assertFiniteJson(JSON.parse(text)); // Validate syntax before tokenizing.
        // Complete quoted strings (including escapes) are skipped; only number tokens are captured.
        // Inspect every original token, including values hidden by duplicate object keys.
        for(const [,lexeme]of text.matchAll(/"(?:[^"\\]|\\[\s\S])*"|(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/g)) {
            if(lexeme===undefined)continue;
            const decoded=JSON.parse(lexeme);
            if(!Number.isFinite(decoded)||decimalLexemeKey(lexeme)!==decimalLexemeKey(JSON.stringify(decoded)))throw Error();
        }
        return value;
    }catch{throw Error('STOP: unrepresentable captured JSON');} // Never echo a decoder's record excerpt.
}

export async function containedPath(root,path,{directory=false,missing=false}={}) {
    root=resolve(root);path=resolve(path);const rel=relative(root,path);
    if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error('STOP: path outside approved root');
    for(let p=path;;p=dirname(p)) {
        try {const s=await lstat(p);if(s.isSymbolicLink()||!s.isFile()&&!s.isDirectory())throw Error('STOP: link/unexpected filesystem object');}
        catch(e){if(!(missing&&e.code==='ENOENT'))throw e;}
        if(dirname(p)===p)break;
    }
    if(!missing){const s=await lstat(path);if(directory?!s.isDirectory():!s.isFile())throw Error('STOP: path kind mismatch');const normalize=p=>process.platform==='win32'?p.toLowerCase():p;if(normalize(resolve(await realpath(path)))!==normalize(path))throw Error('STOP: ambiguous canonical path');}
    return path;
}
export async function pinnedFiles(root,bindings) {
    if(!Array.isArray(bindings)||!bindings.length)throw Error('STOP: explicit file pins required');
    const seen=new Set(),rows=[];
    for(const b of bindings){if(!b||!hex(b.sha256)||seen.has(b.path))throw Error('STOP: malformed/duplicate file binding');seen.add(b.path);const path=await containedPath(root,resolve(root,b.path));const hash=sha256(await readFile(path));if(hash!==b.sha256)throw Error('STOP: pinned file mismatch');rows.push({path,sha256:hash});}
    return rows;
}

// Filter at the CIM provider BEFORE retrieving any command-line property.
// Normal account only. The caller must obtain any required managed approval; no fallback/elevation.
// These helpers perform string processing only, including under the synthetic test executor.
const PROCESS_MATCHING=String.raw`# PTU pure matching begin
function ConvertTo-PtuWindowsPath([string]$Path) {
 if($Path -notmatch '^[A-Za-z]:[\\/]'){return $null}
 $Path=$Path.Replace([char]47,[char]92)
 $parts=New-Object 'System.Collections.Generic.List[string]'
 foreach($part in $Path.Substring(3).Split([char]92)) {
  if($part -eq '' -or $part -eq '.'){continue}
  if($part -eq '..'){if($parts.Count -eq 0){return $null};$parts.RemoveAt($parts.Count-1);continue}
  if($part -match '[\x00-\x1f:<>|?*\"]' -or $part.EndsWith('.') -or $part.EndsWith(' ')){return $null}
  $parts.Add($part)
 }
 return $Path.Substring(0,2)+'\'+($parts -join '\')
}
function Get-PtuTargetClassification([AllowNull()][string]$CommandLine) {
 if([string]::IsNullOrWhiteSpace($CommandLine)){return 'unknown'}
 $tokens=New-Object 'System.Collections.Generic.List[string]'
 $token=New-Object Text.StringBuilder
 $quoted=$false;$started=$false;$i=0
 while($i -lt $CommandLine.Length) {
  $c=$CommandLine[$i]
  if(($c -eq [char]32 -or $c -eq [char]9) -and !$quoted) {
   if($started){$tokens.Add($token.ToString());[void]$token.Clear();$started=$false}
   $i++;continue
  }
  $started=$true
  if($c -eq [char]92) {
   $slashes=0
   while($i -lt $CommandLine.Length -and $CommandLine[$i] -eq [char]92){$slashes++;$i++}
   if($i -lt $CommandLine.Length -and $CommandLine[$i] -eq [char]34) {
    for($j=0;$j -lt [Math]::Floor($slashes/2);$j++){[void]$token.Append([char]92)}
    if($slashes%2){[void]$token.Append([char]34)}elseif($quoted -and $i+1 -lt $CommandLine.Length -and $CommandLine[$i+1] -eq [char]34){[void]$token.Append([char]34);$i++}else{$quoted=!$quoted}
    $i++
   }else{for($j=0;$j -lt $slashes;$j++){[void]$token.Append([char]92)}}
   continue
  }
  if($c -eq [char]34){if($quoted -and $i+1 -lt $CommandLine.Length -and $CommandLine[$i+1] -eq [char]34){[void]$token.Append([char]34);$i++}else{$quoted=!$quoted};$i++;continue}
  [void]$token.Append($c);$i++
 }
 if($quoted){return 'unknown'}
 if($started){$tokens.Add($token.ToString())}
 $paths=New-Object 'System.Collections.Generic.List[string]'
 for($n=1;$n -lt $tokens.Count;$n++) {
  $arg=$tokens[$n]
  if($arg.Equals('--dataPath',[StringComparison]::OrdinalIgnoreCase)) {
   $n++;if($n -ge $tokens.Count -or $tokens[$n].StartsWith('--')){return 'unknown'}
   $paths.Add($tokens[$n])
  }elseif($arg.StartsWith('--dataPath=',[StringComparison]::OrdinalIgnoreCase)){$paths.Add($arg.Substring(11))}
  elseif($arg -match '^--dataPath:'){return 'unknown'}
 }
 if($paths.Count -eq 0){return 'unrelated'}
 if($paths.Count -ne 1){return 'unknown'}
 $path=ConvertTo-PtuWindowsPath $paths[0];$target=ConvertTo-PtuWindowsPath $ptuTarget
 if(!$path -or !$target){return 'unknown'}
 if($path.Equals($target,[StringComparison]::OrdinalIgnoreCase)){return 'target'}
 if($path.StartsWith($target+'\',[StringComparison]::OrdinalIgnoreCase)){return 'unknown'}
 return 'unrelated'
}
# PTU pure matching end`;
export const PROCESS_QUERY = `$ErrorActionPreference='Stop'
$ptuTarget='D:\\Projects\\PTU 1.05 on Foundry\\.foundry-test'
${PROCESS_MATCHING}
$ptuStart=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$ptuMatches=@();$ptuUnreadable=@();$ptuProcessError=$null;$ptuPortError=$null;$ptuListeners=@();$ptuPortAbsent=$false
try {
 $ptuRows=@(Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='electron.exe' OR Name LIKE 'Foundry%.exe'" -Property Name,ProcessId,CommandLine -ErrorAction Stop)
 $ptuMatches=@($ptuRows|Where-Object {(Get-PtuTargetClassification $_.CommandLine) -eq 'target'}|Select-Object ProcessId,Name)
 $ptuUnreadable=@($ptuRows|Where-Object {(Get-PtuTargetClassification $_.CommandLine) -eq 'unknown'}|Select-Object ProcessId,Name)
} catch {$ptuProcessError='process-query-failed'}
try {$ptuListeners=@(Get-NetTCPConnection -LocalPort 30001 -State Listen -ErrorAction Stop|Select-Object LocalAddress,LocalPort,OwningProcess)}
catch {if($_.FullyQualifiedErrorId -like 'CmdletizationQuery_NotFound*'){$ptuPortAbsent=$true}else{$ptuPortError='port-query-failed'}}
[pscustomobject]@{target=$ptuTarget;startedMs=$ptuStart;observedMs=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds();matches=$ptuMatches;unreadable=$ptuUnreadable;processError=$ptuProcessError;listeners=$ptuListeners;portAbsent=$ptuPortAbsent;portError=$ptuPortError;lockExists=(Test-Path -LiteralPath ($ptuTarget+'\\Config\\options.json.lock'))}|ConvertTo-Json -Depth 5 -Compress`;

export async function observeHostState({mode='native',query,now=Date.now}={}) {
    if(!['native','synthetic'].includes(mode)||mode==='native'&&query)throw Error('STOP: synthetic OS adapter cannot attest native state');
    let value;
    if(mode==='synthetic'){if(typeof query!=='function')throw Error('STOP: synthetic query required');value=await query(PROCESS_QUERY);}
    else {if(process.platform!=='win32')throw Error('STOP: approved native process query requires Windows');const {stdout}=await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',PROCESS_QUERY],{windowsHide:true,maxBuffer:65536});value=parseFiniteJson(stdout);}
    return {kind:'p05-host-observation-v1',mode,...value,receivedMs:now()};
}
export function requireHostState(o,{mode='native',state='stopped',ownedPid=null,now=Date.now()}={}) {
    const target=v=>typeof v==='string'?v.replaceAll('\\','/').replace(/\/+$/,'').toLowerCase():null;
    if(o?.kind!=='p05-host-observation-v1'||o.mode!==mode||target(o.target)!==target(TARGET_ROOT)||!Number.isSafeInteger(o.observedMs)||!Number.isSafeInteger(o.startedMs)||o.startedMs>o.observedMs||o.observedMs>now||now-o.startedMs>60000||o.processError!==null||o.portError!==null||!Array.isArray(o.matches)||!Array.isArray(o.unreadable)||o.unreadable.length||!Array.isArray(o.listeners)||typeof o.lockExists!=='boolean')throw Error('STOP: unknown/stale host state');
    if(state==='stopped') {if(o.matches.length||o.listeners.length||o.portAbsent!==true||o.lockExists)throw Error('STOP: disposable target is not verified stopped');}
    else if(state==='running'){if(!Number.isSafeInteger(ownedPid)||ownedPid<=0||o.matches.length!==1||o.matches[0].ProcessId!==ownedPid||!o.listeners.length||o.listeners.some(l=>l.OwningProcess!==ownedPid||l.LocalPort!==30001)||o.portAbsent!==false||!o.lockExists)throw Error('STOP: exact owned runtime/listener/lock required');}
    else throw Error('STOP: invalid operating phase');
    return o;
}

export const ACL_TRANSPORT_LIMITS=Object.freeze({timeoutMs:10000,maxBytes:65536});
export const ACL_PROCESS_PREAMBLE="$ErrorActionPreference='Stop';[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);$OutputEncoding=[Console]::OutputEncoding;";
const aclFields=['ownerMatches','hasOwner','hasSystem','unexpectedRules','rules','inheritance'];
const aclInheritance=new Set(['ContainerInherit, ObjectInherit','ObjectInherit, ContainerInherit']);
const utf8Bom=Buffer.from([0xef,0xbb,0xbf]);
const aclErrors=new WeakSet();
function aclBytesMetadata(stdout,stderr) {
    const bytes=b=>Buffer.isBuffer(b)?b.length:null;
    const digest=b=>Buffer.isBuffer(b)&&b.length<=ACL_TRANSPORT_LIMITS.maxBytes?sha256(b):null;
    return {stdoutBytes:bytes(stdout),stderrBytes:bytes(stderr),stdoutSha256:digest(stdout),stderrSha256:digest(stderr)};
}
function aclTransportError(stage,status,stdout,stderr,metadata={}) {
    const error=Error('STOP: ACL transport refused ('+stage+'/'+status+')');error.name='AclTransportError';
    error.stack=error.name+': '+error.message;aclErrors.add(error);
    error.diagnostic=Object.freeze({stage,status,...aclBytesMetadata(stdout,stderr),encoding:'unvalidated',...metadata});
    return error; // No cause, process exception, command, path or output is attached.
}
// Pure byte decoding/validation is not an observation of native privacy.
export function decodePrivateAclTransport(stdout) {
    const empty=Buffer.alloc(0);
    if(!Buffer.isBuffer(stdout)||!stdout.length||stdout.length>ACL_TRANSPORT_LIMITS.maxBytes)throw aclTransportError('decode','byte-boundary',stdout,empty);
    const leading=stdout.subarray(0,3).equals(utf8Bom),body=leading?stdout.subarray(3):stdout,framing=leading?'single-leading-bom':'none';
    if(body.includes(utf8Bom))throw aclTransportError('decode','misplaced-or-repeated-framing',stdout,empty,{framing:'rejected'});
    let text;try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(body);}catch{throw aclTransportError('decode','invalid-utf8',stdout,empty,{encoding:'invalid-or-unsupported',framing});}
    let facts;try{facts=parseFiniteJson(text);}catch{throw aclTransportError('decode','json-or-number',stdout,empty,{encoding:'utf-8',framing});}
    // Inspect raw key occurrences too: JSON.parse alone would hide duplicate fields.
    const names=Array.from(text.matchAll(/"(?:[^"\\]|\\[\s\S])*"(?=[ \t\r\n]*:)/g),m=>JSON.parse(m[0]));
    if(!facts||typeof facts!=='object'||Array.isArray(facts)||Object.keys(facts).length!==aclFields.length||names.length!==aclFields.length||new Set(names).size!==aclFields.length||names.some(k=>!aclFields.includes(k))||
        !['ownerMatches','hasOwner','hasSystem'].every(k=>typeof facts[k]==='boolean'&&facts[k]===true)||
        !Number.isSafeInteger(facts.unexpectedRules)||facts.unexpectedRules!==0||!Number.isSafeInteger(facts.rules)||facts.rules<2||
        !Array.isArray(facts.inheritance)||facts.inheritance.length!==facts.rules||facts.inheritance.some(v=>typeof v!=='string'||!aclInheritance.has(v)))throw aclTransportError('projection','not-established',stdout,empty,{encoding:'utf-8',framing});
    return {kind:'decoded-acl-projection',facts,transport:{...aclBytesMetadata(stdout,empty),encoding:'utf-8',framing}};
}
// Native verification supplies its fixed command below. This process primitive grants no privacy authority.
// Limits may only be lowered for controlled-output tests; native callers do not accept overrides.
export async function runPrivateAclTransport(file,args,limits={}) {
    let timeoutMs,maxBytes;
    try {
        if(!limits||typeof limits!=='object'||Array.isArray(limits)||Object.entries(Object.getOwnPropertyDescriptors(limits)).some(([k,v])=>!['timeoutMs','maxBytes'].includes(k)||!Object.hasOwn(v,'value')))throw Error();
        timeoutMs=limits.timeoutMs??ACL_TRANSPORT_LIMITS.timeoutMs;maxBytes=limits.maxBytes??ACL_TRANSPORT_LIMITS.maxBytes;
        if(typeof file!=='string'||!file||!Array.isArray(args)||args.some(v=>typeof v!=='string')||!Number.isSafeInteger(timeoutMs)||timeoutMs<=0||timeoutMs>ACL_TRANSPORT_LIMITS.timeoutMs||!Number.isSafeInteger(maxBytes)||maxBytes<=0||maxBytes>ACL_TRANSPORT_LIMITS.maxBytes)throw Error();
    }catch{throw aclTransportError('request','invalid',null,null);}
    let stdout,stderr;
    try{({stdout,stderr}=await run(file,args,{encoding:'buffer',windowsHide:true,timeout:timeoutMs,maxBuffer:maxBytes,killSignal:'SIGKILL'}));}
    catch(error){
        const status=error?.code==='ERR_CHILD_PROCESS_STDIO_MAXBUFFER'?'output-limit':error?.killed===true?'timeout':error?.signal?'signal':Number.isSafeInteger(error?.code)?'nonzero-exit':'spawn-failure';
        const signals=new Set(['SIGTERM','SIGKILL','SIGINT','SIGABRT','SIGHUP']);
        throw aclTransportError('process',status,error?.stdout,error?.stderr,{exitCode:Number.isSafeInteger(error?.code)&&error.code>=0&&error.code<=4294967295?error.code:null,signal:typeof error?.signal==='string'?(signals.has(error.signal)?error.signal:'other'):null});
    }
    if(!Buffer.isBuffer(stdout)||!Buffer.isBuffer(stderr)||stdout.length>maxBytes||stderr.length>maxBytes)throw aclTransportError('process','byte-boundary',stdout,stderr);
    if(stderr.length)throw aclTransportError('process','stderr',stdout,stderr);
    return decodePrivateAclTransport(stdout);
}

export async function verifyPrivateDirectory(path,{mode='native',syntheticRoot}={}) {
    if(mode==='synthetic'){requireSyntheticRoot(syntheticRoot);await containedPath(syntheticRoot,path,{directory:true});return {mode,path:resolve(path),kind:'synthetic-privacy-only'};}
    if(mode!=='native'||process.platform!=='win32')throw aclTransportError('request','native-unavailable',null,null);
    try {
        const base=['.setup-backups','.setup-staging'].find(p=>{const r=relative(resolve(TARGET_ROOT,p),resolve(path));return r && r!=='..'&&!r.startsWith('..'+sep)&&!isAbsolute(r);});
        if(!base)throw aclTransportError('path','outside-private-root',null,null);
        await containedPath(resolve(TARGET_ROOT,base),path,{directory:true});
        // Read-only ACL inspection. The one path is a safely quoted PowerShell literal.
        const command=`$p=$args[0];$a=Get-Acl -LiteralPath $p -ErrorAction Stop;$me=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;$principals=@($a.Access|ForEach-Object {$_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value}|Sort-Object -Unique);$bad=@($a.Access|Where-Object {$_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($me,'S-1-5-18') -or $_.AccessControlType -ne 'Allow'});[pscustomobject]@{ownerMatches=($a.GetOwner([Security.Principal.SecurityIdentifier]).Value -eq $me);hasOwner=($principals -contains $me);hasSystem=($principals -contains 'S-1-5-18');unexpectedRules=$bad.Count;rules=$a.Access.Count;inheritance=@($a.Access|ForEach-Object {[string]$_.InheritanceFlags})}|ConvertTo-Json -Compress`;
        // -Command argument binding differs across shells; quote doubling prevents interpolation.
        const literal="'"+resolve(path).replaceAll("'","''")+"'";
        const script=ACL_PROCESS_PREAMBLE+`try {& {${command}} ${literal};exit 0}catch{[Console]::Error.Write('ACL query failed');exit 1}`;
        const {facts}=await runPrivateAclTransport('powershell.exe',['-NoProfile','-NonInteractive','-Command',script]);
        return {mode,path:resolve(path),kind:'observed-owner-system-privacy',facts};
    }catch(error){if(aclErrors.has(error))throw error;throw aclTransportError('path','unverified',null,null);}
}

const externalNames=['supported-usage','coordinator-ownership','allowed-hours','normal-access','action-approval'];
export function operatingHoursBoundary(time) {
    if(!Number.isSafeInteger(time))throw Error('STOP: operating clock unavailable');
    const fmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',weekday:'short',hour:'2-digit',hourCycle:'h23'});
    const blackout=t=>{const parts=Object.fromEntries(fmt.formatToParts(new Date(t)).map(p=>[p.type,p.value]));return !['Sat','Sun'].includes(parts.weekday)&&Number(parts.hour)>=8&&Number(parts.hour)<17;};
    if(blackout(time))throw Error('STOP: weekday operating blackout');
    let end=time+60000;
    if(blackout(end)){let lo=time,hi=end;while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(blackout(mid))hi=mid;else lo=mid;}end=hi;}
    return end;
}
export function externalObservationErrors(value,{mode,now}) {
    const errors=[];
    try{assertFiniteJson(value);}catch{return ['Unrepresentable executor observations'];}
    if(!value||value.mode!==mode||!Array.isArray(value.observations)||value.observations.length!==externalNames.length)return ['Trusted executor observations required'];
    for(const name of externalNames){const rows=value.observations.filter(o=>o.name===name),o=rows[0];if(rows.length!==1||o.outcome!=='verified'||typeof o.source!=='string'||!o.source||!Number.isSafeInteger(o.observedMs)||o.observedMs>now||now-o.observedMs>60000||!Number.isSafeInteger(o.boundaryMs)||o.boundaryMs<=now)errors.push('Fresh executor observation required: '+name);}
    return errors;
}

export async function verifyPrivatePacketReceipt({plan,packetBytes,packetFile,privateRoot}) {
    if(admittedInputErrors(plan).length||!plan?.handoff?.issued||typeof packetBytes!=='string'||await readFile(await containedPath(privateRoot,packetFile),'utf8')!==packetBytes)throw Error('STOP: exact private issued packet bytes required');
    const packet=parseFiniteJson(packetBytes),hash=sha256(packetBytes),issued=plan.handoff.issued;
    if(publicAdmittedPacketErrors(packet).length||issued.packetSha256!==hash||issued.packetBytes!==packetBytes||issued.baselineSha256!==sha256(plan.baseline)||packet.anchor.checkpointSha256!==sha256(plan.checkpoint)||!equal(issued.packet,packet))throw Error('STOP: private packet receipt mismatch');
    const replay=await replayAdmittedControllerHistory(plan);
    if(replay.status!==(plan.handoff.acceptedSegments.length?'passed':'not-run'))throw Error('STOP: private history replay failed');
    const reconstructed=await issueAdmittedControllerPacket(plan,{packetId:packet.anchor.packetId,segmentId:packet.anchor.segmentId,userId:packet.audience.userId,phase:packet.phase,bootstrapMacroUuid:packet.baselineChecks.bootstrapMacroUuid});
    if(reconstructed.packetBytes!==packetBytes)throw Error('STOP: private issued packet differs from validated global checkpoint');
    const previous=plan.handoff.acceptedSegments.findLast(a=>a.segment.identity.user===packet.audience.userId),globalPrevious=plan.handoff.acceptedSegments.at(-1);
    if(packet.anchor.revision>0&&!globalPrevious)throw Error('STOP: private merge acknowledgement missing');
    for(const segment of plan.handoff.acceptedSegments){if(!/^[A-Za-z0-9._-]+$/.test(segment.segmentId))throw Error('STOP: unsafe segment receipt name');const bytes=await readFile(await containedPath(privateRoot,resolve(privateRoot,'segments',segment.segmentId+'.json')),'utf8');if(bytes!==segment.segmentBytes||sha256(bytes)!==segment.segmentSha256)throw Error('STOP: private segment bytes changed');}
    const globalPrefixSha256=sha256(plan.handoff.acceptedSegments.map(a=>({segmentId:a.segmentId,packetSha256:a.packetSha256,segmentSha256:a.segmentSha256})));
    return {packet,acknowledgement:{packetSha256:hash,checkpointSha256:packet.anchor.checkpointSha256,revision:packet.anchor.revision,principal:packet.audience.userId,precedingSegmentId:previous?.segmentId??null,precedingSegmentSha256:previous?.segmentSha256??null,globalPrefixSha256}};
}

export async function savePrivateControllerSegment({plan,segmentBytes,privateRoot,mode='native',syntheticRoot}) {
    if(plan.mode!==mode)throw Error('STOP: private segment mode mismatch');
    await verifyPrivateDirectory(privateRoot,{mode,syntheticRoot});
    const segment=parseFiniteJson(segmentBytes);
    if(!/^[A-Za-z0-9._-]+$/.test(segment.segmentId))throw Error('STOP: unsafe segment receipt name');
    const merged=await mergeAdmittedControllerSegment(plan,segment,{segmentBytes});
    const directory=await containedPath(privateRoot,joinPath(privateRoot,'segments'),{missing:true});await mkdir(directory,{recursive:true});await verifyPrivateDirectory(directory,{mode,syntheticRoot});
    const path=await containedPath(privateRoot,joinPath(directory,segment.segmentId+'.json'),{missing:true});
    try{await writeFile(path,segmentBytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||await readFile(path,'utf8')!==segmentBytes)throw Error('STOP: changed private segment receipt');}
    const evidence=structuredClone(merged.evidence);evidence.status='incomplete';
    const add=ref=>{if(!evidence.raw.some(r=>r.path===ref.path))evidence.raw.push(ref);};
    add(await saveRawProof(privateRoot,'controller-segment',segmentBytes,{mode,syntheticRoot}));
    add(await saveRawProof(privateRoot,'checkpoint',JSON.stringify({kind:'checkpoint',source:mode,batch:merged.batch,value:merged.checkpoint}),{mode,syntheticRoot}));
    for(const capture of segment.captures)add(await saveRawProof(privateRoot,'case',JSON.stringify({kind:'case',source:mode,batch:merged.batch,value:capture}),{mode,syntheticRoot}));
    return buildAdmittedFeatureReviewInputs(merged,{evidence}); // Save/replay this private plan before browser acknowledgement.
}
const joinPath=(...parts)=>resolve(...parts);

async function saveRawProof(privateRoot,kind,bytes,{mode,syntheticRoot}) {
    const directory=await containedPath(privateRoot,resolve(privateRoot,'raw'),{missing:true});await mkdir(directory,{recursive:true});await verifyPrivateDirectory(directory,{mode,syntheticRoot});
    const hash=sha256(bytes),name=kind+'-'+hash+'.json',path=await containedPath(privateRoot,resolve(directory,name),{missing:true});
    try{await writeFile(path,bytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||!Buffer.from(await readFile(path)).equals(Buffer.from(bytes)))throw Error('STOP: private raw proof collision');}
    return {path:'raw/'+name,sha256:hash,kind,private:true};
}

/** Turn a verified collector output into the UNCHANGED checker's raw envelope. */
export async function saveCapturedProof({captureFile,provenanceFile,captureRoot,privateRoot,mode='native',syntheticRoot,batch}) {
    await verifyPrivateDirectory(privateRoot,{mode,syntheticRoot});
    await verifyPrivateDirectory(captureRoot,{mode,syntheticRoot});
    const {readPrivateCapture}=await import('./collect-feature-review-evidence.mjs');
    const provenanceBytes=await readFile(await containedPath(captureRoot,provenanceFile)),provenance=parseFiniteJson(provenanceBytes),kind=provenance.stage;
    if(!['baseline','conversion-before','conversion-after','closure'].includes(kind)||typeof batch!=='string'||!(mode==='synthetic'?/^synthetic-[A-Za-z0-9-]+$/:/^p05-feature-review-[0-9TZ]+-[a-f0-9]{8}$/).test(batch))throw Error('STOP: captured stage/batch required');
    const value=await readPrivateCapture({captureFile,provenanceFile,privateRoot:captureRoot,mode,stage:kind});
    const captureBytes=await readFile(await containedPath(captureRoot,captureFile));if(sha256(captureBytes)!==provenance.outputs.find(o=>o.path==='capture.json')?.sha256)throw Error('STOP: captured bytes changed before proof save');
    const bytes=kind.startsWith('conversion-')?captureBytes:JSON.stringify({kind,source:mode,batch,value});
    if(kind.startsWith('conversion-')&&(value.batch!==batch||value.source!==mode))throw Error('STOP: conversion batch mismatch');
    const ref=await saveRawProof(privateRoot,kind,bytes,{mode,syntheticRoot});
    return {value,ref,provenanceSha256:sha256(provenanceBytes)};
}

/** Reads the ACTUAL private baseline; no absent/ack flag is accepted. */
export async function verifyPrivateMacroAbsence({baselineFile,privateRoot,macroUuid,expectedBaselineSha256,observedMs}) {
    const bytes=await readFile(await containedPath(privateRoot,baselineFile)),baseline=parseFiniteJson(bytes);
    if(sha256(bytes)!==expectedBaselineSha256||admittedBaselineErrors(baseline).length||!/^Macro\.[A-Za-z0-9]{16}$/.test(macroUuid)||baseline.ids.macros.includes(macroUuid.split('.')[1]))throw Error('STOP: macro absence against private baseline failed');
    const receipt={macroUuid,baselineSha256:expectedBaselineSha256,observedMs};return {...receipt,receiptSha256:sha256(receipt)};
}

/** Recheck the measured baseline copy and fresh backup bytes, not a readiness flag. */
export async function verifyBaselineReadiness({plan,baselineCapture,privateRoot,priorSystemRoot,backupManifestFile,mode,syntheticRoot}) {
    await verifyPrivateDirectory(privateRoot,{mode,syntheticRoot});
    const {readPrivateCapture}=await import('./collect-feature-review-evidence.mjs');
    const captured=await readPrivateCapture({...baselineCapture,mode,stage:'baseline'});
    if(!equal(captured,plan.baseline))throw Error('STOP: captured/private plan baseline mismatch');
    await containedPath(privateRoot,priorSystemRoot,{directory:true});
    if(!equal(await admittedSystemManifest(priorSystemRoot),plan.baseline.priorSystem))throw Error('STOP: fresh prior-system backup changed');
    const manifestPath=await containedPath(privateRoot,backupManifestFile);
    if(sha256(await readFile(manifestPath))!==plan.baseline.backupManifestSha256)throw Error('STOP: fresh backup-manifest bytes changed');
    const provenance=parseFiniteJson(await readFile(await containedPath(baselineCapture.privateRoot,baselineCapture.provenanceFile)));
    const opaque=provenance.opaqueBindings;
    if(!Array.isArray(opaque)||sha256(opaque)!==plan.baseline.configurationSha256)throw Error('STOP: opaque baseline bindings mismatch');
    if(mode==='native'&&!equal(opaque.map(o=>resolve(o.path)).sort(),['options.json','license.json'].map(p=>resolve(TARGET_ROOT,'Config',p)).sort()))throw Error('STOP: exact opaque configuration bindings required');
    for(let n=0;n<opaque.length;n++){
        const binding=opaque[n],source=await containedPath(mode==='native'?resolve(TARGET_ROOT,'Config'):syntheticRoot,binding.path),copy=await containedPath(baselineCapture.privateRoot,resolve(dirname(baselineCapture.provenanceFile),'opaque-'+(n+1)+'.bin'));
        if(sha256(await readFile(source))!==binding.sha256||sha256(await readFile(copy))!==binding.sha256)throw Error('STOP: opaque source/backup bytes changed');
    }
    return {kind:'measured-baseline-backup-readiness',mode,baselineSha256:sha256(captured),backupManifestSha256:plan.baseline.backupManifestSha256,priorSystemSha256:sha256(plan.baseline.priorSystem),provenanceSha256:sha256(provenance)};
}

export function createFeatureReviewOperator({mode='native',externalObservations,query,now=Date.now,syntheticRoot,replayAdapter}={}) {
    if(!['native','synthetic'].includes(mode)||typeof externalObservations!=='function'||mode==='native'&&(query||replayAdapter||now!==Date.now))throw Error('STOP: trusted executor provider required; JSON does not authenticate external gates');
    if(mode==='synthetic')requireSyntheticRoot(syntheticRoot);
    const checks=async(state,ownedPid)=>{
        const external=await externalObservations(),time=now(),errors=externalObservationErrors(external,{mode,now:time});if(errors.length)throw Error('STOP: '+errors.join('; '));
        const hoursBoundaryMs=operatingHoursBoundary(time);
        const host=await observeHostState({mode,query,now});requireHostState(host,{mode,state,ownedPid,now:now()});return {external,host,hoursBoundaryMs};
    };
    const operator={
        mode,
        async prepareCollection({sourceRoot,outputRoot,bindings,stage}) {
            if(!['baseline','conversion-before','conversion-after','closure'].includes(stage))throw Error('STOP: explicit capture stage required');
            const before=await checks('stopped');
            if(mode==='synthetic')await containedPath(syntheticRoot,sourceRoot,{directory:true});
            else {
                await containedPath(TARGET_ROOT,sourceRoot,{directory:true});
                const isWorld=resolve(sourceRoot)===resolve(C.target.worldPath),isSystem=resolve(sourceRoot)===resolve(C.target.systemPath);
                const privateCopy=['.setup-backups','.setup-staging'].some(p=>{const rel=relative(resolve(TARGET_ROOT,p),resolve(sourceRoot));return rel&&rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel);});
                if(stage.startsWith('conversion-')?!isSystem&&!privateCopy:!isWorld&&!privateCopy)throw Error('STOP: unexpected source target');
                if(stage.startsWith('conversion-')&&!equal(bindings,Object.entries(C.runtime).map(([path,sha256])=>({path,sha256}))))throw Error('STOP: original16 runtime source pins required');
                if(!stage.startsWith('conversion-')&&(bindings.length!==1||bindings[0].path!=='world.json'))throw Error('STOP: exact world manifest source pin required');
            }
            const privacy=await verifyPrivateDirectory(outputRoot,{mode,syntheticRoot}),pins=await pinnedFiles(sourceRoot,bindings);
            if(!stage.startsWith('conversion-')){const world=parseFiniteJson(await readFile(await containedPath(sourceRoot,resolve(sourceRoot,'world.json'))));if(world.id!==C.target.world||world.title!==C.target.title||world.system!=='ptu')throw Error('STOP: exact world manifest identity required before collection');}
            return {mode,stage,before,privacy,pins,sourceRoot:resolve(sourceRoot),outputRoot:resolve(outputRoot),verifyStopped:()=>checks('stopped')};
        },
        async prepareAction({action,ownedPid,plan,packetBytes,packetFile,privateRoot,browserFacts,bindings,runtimeRoot,replayOptions,baselineFile,baselineSha256,baselineCapture,priorSystemRoot,backupManifestFile,failureRef=null}) {
            if(!Object.hasOwn(ACTION_GUARDS,action)||plan.mode!==mode)throw Error('STOP: action/mode mismatch');
            await verifyPrivateDirectory(privateRoot,{mode,syntheticRoot});
            if(mode==='native'&&(resolve(runtimeRoot)!==resolve(C.target.systemPath)||!equal(bindings,Object.entries(C.runtime).map(([path,sha256])=>({path,sha256})))))throw Error('STOP: exact installed original16 runtime pins required');
            const check=await checks('running',ownedPid),pins=await pinnedFiles(runtimeRoot,bindings);
            const backups=await verifyBaselineReadiness({plan,baselineCapture,privateRoot,priorSystemRoot,backupManifestFile,mode,syntheticRoot});
            const receipt=await verifyPrivatePacketReceipt({plan,packetBytes,packetFile,privateRoot});
            const replay=replayAdapter?await replayAdapter(plan,replayOptions):await checkAdmittedFeatureReview(plan,replayOptions);
            if(replay.integrity!=='passed'||replay.previousProofReplay!=='passed'||replay.originalBackupReplay!=='passed'||replay.artifactReplay!=='passed'||replay.conversion!=='complete-captured-format-match'||replay.controllerReplay==='failed')throw Error('STOP: private proof/conversion replay incomplete');
            const observedMs=now(),boundaryMs=Math.min(...check.external.observations.map(o=>o.boundaryMs),...check.external.observations.map(o=>o.observedMs+60000),check.host.startedMs+60000,check.hoursBoundaryMs,operatingHoursBoundary(now()));
            if(observedMs>=boundaryMs)throw Error('STOP: renew operator observations after lengthy replay');
            const macroAbsence=action==='setup'?await verifyPrivateMacroAbsence({baselineFile,privateRoot,macroUuid:receipt.packet.baselineChecks.bootstrapMacroUuid,expectedBaselineSha256:baselineSha256,observedMs}):null;
            const record={kind:'p05-private-operator-record-v1',mode,observedMs,action,check,pins,backups,receipt,replay,macroAbsence};
            const recordBytes=JSON.stringify(record),operatorRecordSha256=sha256(recordBytes);
            await writeFile(await containedPath(privateRoot,resolve(privateRoot,'operator-'+randomUUID()+'.json'),{missing:true}),recordBytes,{flag:'wx'});
            return {kind:'p05-operator-action-v1',mode,id:randomUUID(),observedMs,expiresMs:Math.min(observedMs+60000,boundaryMs),boundaryMs,sessionId:browserFacts.sessionId,principal:browserFacts.identity.user,batch:receipt.packet.batch,packet:receipt.packet,packetSha256:sha256(packetBytes),anchor:receipt.packet.anchor,action,browserFacts:structuredClone(browserFacts),operatorRecordSha256,acknowledgement:receipt.acknowledgement,macroAbsence,failureRef};
        }
    };operators.add(operator);return Object.freeze(operator);
}

// Re-export the accepted byte manifest: no competing preservation validator.
export {admittedSystemManifest};
