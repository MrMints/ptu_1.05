import {readFile,lstat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname,sep,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {FEATURE_REVIEW_ATTEMPT_CONTRACT as contract,createPendingFeatureReviewAttempt,evaluateFeatureReviewAttempt,attemptHash} from './feature-review-attempt-contract.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
export function preservedAttemptSourceErrors(contents){const errors=[];for(const ref of contract.previous.preservedFiles){const text=contents?.[ref.path];if(typeof text!=='string'||attemptHash(text.replaceAll('\r\n','\n'))!==ref.canonicalSha256)errors.push('Preserved stopped file missing/changed '+ref.path);}return errors;}
async function capturePath(directory,path){
    if(typeof directory!=='string'||typeof path!=='string')throw Error('Capture path required');const base=resolve(directory),file=resolve(base,path),rel=relative(base,file);
    if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error('Capture path escape');
    for(let p=file;;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink())throw Error('Capture reparse/link refused');if(p===base)break;if(dirname(p)===p)throw Error('Capture outside root');}
    if(!(await lstat(file)).isFile())throw Error('Regular capture file required');return file;
}
async function captureFile(directory,path){return readFile(await capturePath(directory,path));}
async function archiveHash(directory,path){const hash=createHash('sha256');for await(const chunk of createReadStream(await capturePath(directory,path)))hash.update(chunk);return hash.digest('hex');}
/** Pure-file replay, never a database interface. Previous proof paths/hashes
 * come from the independent contract, never a submitted classifier/ref list. */
async function replayFiles(evidence,{rawDirectory,previousProofDirectory,artifactDirectory}={}){
    const errors=[];let previousProofReplay='not-run-private-proof-root-required';
    if(previousProofDirectory){previousProofReplay='passed';for(const ref of contract.previous.proofs){try{if(attemptHash(await captureFile(previousProofDirectory,ref.path))!==ref.sha256)throw Error('Hash mismatch');}catch{errors.push('Previous stopped proof missing/altered '+ref.path);previousProofReplay='failed';}}}
    let syntheticRawReplay='not-required';
    for(const row of Array.isArray(evidence?.cases)?evidence.cases:[]){if(row?.result==='not-run')continue;syntheticRawReplay='passed';if(!Array.isArray(row?.raw)||row.raw.length===0){errors.push('Missing raw observation '+row?.id);syntheticRawReplay='failed';continue;}
        for(const ref of row.raw){try{if(ref?.private!==true||!/^raw\/[A-Za-z0-9._-]+\.json$/.test(ref.path))throw Error('Unsafe capture reference');const bytes=await captureFile(rawDirectory,ref.path);if(attemptHash(bytes)!==ref.sha256)throw Error('Hash mismatch');const value=JSON.parse(bytes);if(value.caseId!==row.id||!same(value.observed,row.observed))throw Error('Observed capture mismatch');}catch{errors.push('Raw observation missing/altered '+row?.id);syntheticRawReplay='failed';}}
    }
    let artifactReplay='not-run-original-archive-root-required';
    if(artifactDirectory){artifactReplay='passed';for(const[path,hash]of [['archive/artifact-13061542688.zip',contract.pin.outerSha256],['archive/system.zip',contract.pin.innerSha256]]){try{if(await archiveHash(artifactDirectory,path)!==hash)throw Error('Archive mismatch');}catch{errors.push('Original archive missing/mismatched '+path);artifactReplay='failed';}}}
    return {errors,previousProofReplay,syntheticRawReplay,artifactReplay,nativeAccepted:false};
}
// Both public entry points apply the same independent contract before raw IO.
export async function replayFeatureReviewAttempt(evidence,options={}){return checkFeatureReviewAttempt(evidence,options);}
export async function checkFeatureReviewAttempt(evidence=createPendingFeatureReviewAttempt(),options={}){
    const contents={};for(const ref of contract.previous.preservedFiles){try{contents[ref.path]=await readFile(resolve(root,ref.path),'utf8');}catch{/* Fixed source failure is reported below. */}}
    let previous;try{previous=JSON.parse(contents[contract.previous.path]);}catch{/* Validator rejects missing prior record. */}
    const result=evaluateFeatureReviewAttempt(evidence,previous,{requireNativeComplete:options.requireNativeComplete===true});result.errors.push(...preservedAttemptSourceErrors(contents));
    if(result.errors.length){result.integrity='failed';result.previousProofReplay='not-run-invalid-or-unadmitted-input';result.syntheticRawReplay='not-run-invalid-or-unadmitted-input';result.artifactReplay='not-run-invalid-or-unadmitted-input';return result;}
    const replay=await replayFiles(evidence,options);result.errors.push(...replay.errors);
    if(options.requireNativeComplete===true&&replay.previousProofReplay!=='passed')result.errors.push('Native completion requires replay of all unchanged prior private proofs');
    result.integrity=result.errors.length?'failed':'passed';result.previousProofReplay=replay.previousProofReplay;result.syntheticRawReplay=replay.syntheticRawReplay;result.artifactReplay=replay.artifactReplay;return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
    const args=process.argv.slice(2),options={};let evidence=createPendingFeatureReviewAttempt();
    try{for(let i=0;i<args.length;i++){const arg=args[i];if(arg==='--input')evidence=JSON.parse(await readFile(args[++i],'utf8'));else if(arg==='--raw-dir')options.rawDirectory=args[++i];else if(arg==='--previous-proof-dir')options.previousProofDirectory=args[++i];else if(arg==='--artifact-dir')options.artifactDirectory=args[++i];else if(arg==='--require-native-complete')options.requireNativeComplete=true;else throw Error('Unknown option: '+arg);}
        const result=await checkFeatureReviewAttempt(evidence,options);console.log(JSON.stringify(result));if(result.errors.length)process.exitCode=1;
    }catch(error){console.log(JSON.stringify({integrity:'failed',admission:'pending',nativeAccepted:false,errors:[String(error)]}));process.exitCode=1;}
}
