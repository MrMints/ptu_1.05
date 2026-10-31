import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const PROOF='full04-acceptance.json';
const PROOF_HASH='26bad33210f1a93e8805896f20b3d998d9a3ef991799548ec4798004d3f3458b';
const SOURCE_HEAD='11e9bd1af5350939aed7a94c1e49f575e5438029';
const HELD='held; zero unreviewed rows alone is insufficient; substantive final source review and passing integrity/CI gates still required';
const json=async path=>JSON.parse(await readFile(path,'utf8'));

export async function loadFull04Acceptance() {
    let full04Review=null;
    try {full04Review=await json('docs/data/'+PROOF);} catch(e) {if(e.code!=='ENOENT')throw e;}
    const full04InputHashes={};
    for(const path of Object.keys(full04Review?.inputSemanticSha256??{})) {
        try {full04InputHashes[path]=hash(await json(path));} catch(e) {if(e.code!=='ENOENT')throw e;full04InputHashes[path]=null;}
    }
    return {full04Review,full04InputHashes};
}

// This is a historical human decision bound to its actual source/foundation
// evidence, not a completeness counter or authority to start a worker.
// Current A-H content checks still run on the raw bundle independently.
export function full04AcceptanceErrors(bundle) {
    const errors=[],fail=(ok,message)=>{if(!ok)errors.push(message);};
    const {index,batchManifest:manifest,full04Review:proof}=bundle;
    const accepted=manifest?.full04Acceptance?.status==='accepted-source-and-pre05-foundations';
    fail(index?.OPEN05===false,'Full04 acceptance cannot start05');
    fail(index?.full04SourceAcceptance===accepted,'Full04 index/decision disagree');
    if(!accepted) {
        fail(manifest?.full04Acceptance===HELD,'Full04 lacks the historical held state or substantive acceptance');
        return errors;
    }
    fail(!bundle.historicalSourceView,'Full04 current acceptance cannot use a historical source projection');
    fail(index.full04AcceptanceEvidence===PROOF&&proof&&hash(proof)===PROOF_HASH,'Full04 substantive review evidence missing or changed');
    if(!proof)return errors;
    const acceptance=manifest.full04Acceptance;
    fail(acceptance.revision===SOURCE_HEAD&&acceptance.evidence===PROOF&&acceptance.evidenceSemanticSha256===PROOF_HASH
        &&acceptance.validationReport===proof.validationReport&&manifest.full04AcceptanceHistory?.length===1
        &&manifest.full04AcceptanceHistory[0]===HELD,'Full04 decision lacks exact reviewed revision/evidence/history');
    fail(acceptance.OPEN05===false&&acceptance.productionPolicyPromotion===false&&acceptance.behavioralVerification==='not-run'
        &&manifest.productionPolicyPromotion===false&&manifest.behavioralVerification==='not-run'
        &&index.productionPolicyPromotion===false&&index.behavioralVerification==='not-run','Full04 source acceptance promoted policy or behavior');
    fail(bundle.journalSource?.sourceExaminationComplete===true
        &&hash(bundle.journalSource)==='5d35d33e42c2bfb276b0a7f1ac0ff2b49ddebb29f9d2aaa4e4583e5794ccb573'
        &&index.journalSourceEvidence==='journal-source-evidence-h.json','Full04 requires actual unchanged current H evidence');
    for(const expected of proof.sourceFamilyAcceptances) {
        const batch=manifest.batches.find(b=>b.id===expected.id);
        fail(batch?.status==='source-comparisons-complete'&&batch.membershipSha256===expected.membershipSha256
            &&hash(batch.acceptance)===expected.acceptanceSemanticSha256,'Full04 requires accepted original source family '+expected.id);
    }
    fail(Object.keys(bundle.full04InputHashes??{}).length===17
        &&Object.entries(proof.inputSemanticSha256).every(([path,pin])=>bundle.full04InputHashes?.[path]===pin),
    'Full04 original catalog/foundation inputs missing or changed; substantive reassessment required');
    return errors;
}
