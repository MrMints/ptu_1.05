import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewWords} from '../tools/record-source-review.mjs';
import {itemSourceWords} from '../tools/item-source-review.mjs';
import {checkSpiritSourceReview} from '../tools/spirit-source-review.mjs';
const base=await loadRecordSourceReview(),file='record-source-review/spirit-actions.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex'),words=v=>itemSourceWords(v,sourceReviewWords);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
function errors(b){const errors=[];checkSpiritSourceReview(b,{audit:b.itemSource,batch:b.batchManifest.batches.find(b=>b.id==='E2'),rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,words,fail:(ok,m)=>{if(!ok)errors.push(m);}});return errors;}
function tamper(change){const b={...base,files:{...base.files,[file]:structuredClone(base.files[file])},itemSource:structuredClone(base.itemSource)};change(b);
 for(const row of b.files[file].records){const d=row.sourceComparison.spiritReview,e=b.itemSource.currentRecordAudit[row.identity];for(const c of [...d.currentClaims,...row.sourceComparison.currentClaims])c.normalizedSha256=textHash(words(c.text));e.spiritReviewSha256=hash(d);e.dispositionEvidenceSha256=hash(row);}
 b.itemSource.completedSlices.E2e.spiritSourceSemanticSha256=hash(b.itemSource.spiritSource);b.itemSource.completedSlices.E2e.recordEvidenceSemanticSha256=hash(b.files[file]);return errors(b);}
const row=(b,id)=>b.files[file].records.find(r=>r.identity===`spirit-actions.${id}`);
test('all34 actions retain precise authoring limits, costs, triggers and136 same-ID histories',()=>{
 assert.deepEqual(errors(base),[]);assert.equal(base.files[file].records.length,34);assert.ok(base.files[file].records.every(r=>r.coverageState==='unresolved'));
 assert.equal(base.itemSource.completedSlices.E2e.restOnlyActions,12);assert.equal(base.itemSource.spiritSource.historicalClaimComparisons.effect.equal,136);
});
test('a native wiki pointer and unchanged history cannot become independent action authority',()=>{
 const es=tamper(b=>{b.itemSource.spiritSource.independentActionDefinitions=34;for(const r of b.files[file].records){r.coverageState='reviewed';r.sourceComparison.spiritReview.completeSpiritActionAuthoringEstablished=true;}});
 assert.ok(es.some(e=>e.includes('promoted to complete authoring')));assert.ok(es.some(e=>e.includes('authority, identity')));
});
test('rest-only body and Extended Action trigger remain separate constraints',()=>{
 const d=row(base,'5flSoZTeFmviBByQ').sourceComparison.spiritReview;assert.equal(d.restOnlyClausePresent,true);assert.equal(d.currentTrigger,'Extended Action');assert.equal(d.currentActive,false);
 const es=tamper(b=>{row(b,'5flSoZTeFmviBByQ').sourceComparison.spiritReview.restOnlyClausePresent=false;});assert.ok(es.some(e=>e.includes('complete current cost/trigger')));
});
test('the Intercept at-zero exception does not turn stored text1 into a demonstrated free use',()=>{
 const d=row(base,'E48L5So0QCNB2H65').sourceComparison.spiritReview;assert.equal(d.currentCost,'1');assert.ok(d.specificClaimAssessment.includes('can-use-at0-Spirit'));
 const es=tamper(b=>{row(b,'E48L5So0QCNB2H65').sourceComparison.spiritReview.currentCost=0;});assert.ok(es.some(e=>e.includes('complete current cost/trigger')));
});
test('fresh claim/disposition hashes cannot conceal a changed die or decrement',()=>{
 for(const [from,to]of [['d100','d20'],['25','20']]){
  const es=tamper(b=>{const r=row(b,'S0k2ZszrWjpqVcSP');let changed=0;for(const c of [...r.sourceComparison.spiritReview.currentClaims,...r.sourceComparison.currentClaims]){const updated=c.text.replace(from,to);changed+=Number(updated!==c.text);c.text=updated;}assert.ok(changed>=2);});
  assert.ok(es.some(e=>e.includes('complete current cost/trigger')));
 }
});
test('original Intercept checks and Endure frequency cannot be rewritten as Spirit permissions',()=>{
 const es=tamper(b=>{const p=b.itemSource.parentContexts.find(p=>p.id==='e2-spirit-parent:core:242');p.rawText=p.rawText.replace('Action: Full Action, Interrupt','Action: Free');p.rawSha256=textHash(p.rawText);});assert.ok(es.some(e=>e.includes('original/native context changed')));
 assert.ok(row(base,'93qZOZHrm18pdrKd').sourceComparison.spiritReview.specificClaimAssessment.includes('no persistent Move UUID'));
});
test('different Secret Stash tiers and Recoup scopes retain separate stable IDs',()=>{
 for(const [id,cost]of [['nIlmxT7S0pfX0Nt1','1'],['rxMrzUVxIKOGzuEY','2'],['zIDGYGDAZjC0turS','3']])assert.equal(row(base,id).sourceComparison.spiritReview.currentCost,cost);
 assert.notEqual(row(base,'4DxC0IWNh4O2XYvC').identity,row(base,'Kx69xfAIR6c0Q2IZ').identity);
 const es=tamper(b=>{row(b,'rxMrzUVxIKOGzuEY').sourceComparison.spiritReview.currentCost='1';});assert.ok(es.some(e=>e.includes('complete current cost/trigger')));
});
test('the exact original1020 membership is fully addressed without expanding later families',()=>{
 const batch=base.batchManifest.batches.find(b=>b.id==='E2'),rows=batch.slices.flatMap(s=>base.files[s.recordFile].records);
 assert.equal(rows.length,1020);assert.equal(new Set(rows.map(r=>r.identity)).size,1020);assert.equal(batch.membershipSha256,'e013adf47a526f4df852de1b353c5f504a9a143b37604cd5df06ad1360b6a6cd');
 assert.equal(base.index.coverage.completeAddressableClassification,false);assert.ok(rows.every(r=>r.productionPolicyPromotion===false&&r.behavioralVerification==='not-run'));
});
