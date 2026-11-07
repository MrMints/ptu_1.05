import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {itemSourceWords} from '../tools/item-source-review.mjs';
import {equipmentComparableWords,equipmentRawPrimitives} from '../tools/equipment-source-derivation.mjs';
import {checkEquipmentSourceReview,equipmentDisposition} from '../tools/equipment-source-review.mjs';

const base=await loadRecordSourceReview(),file='record-source-review/equipment.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const words=v=>itemSourceWords(v,sourceReviewWords),comparable=v=>equipmentComparableWords(v,words);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
function errors(b){const errors=[],rows=new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r]));
 checkEquipmentSourceReview(b,{audit:b.itemSource,batch:b.batchManifest.batches.find(b=>b.id==='E2'),rows,actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,words,cleanText:sourceReviewText,citations:()=>{},fail:(ok,m)=>{if(!ok)errors.push(m);}});return errors;}
function copy(){return {...base,files:{...base.files,[file]:structuredClone(base.files[file])},itemSource:{...base.itemSource,equipmentSource:structuredClone(base.itemSource.equipmentSource),parentContexts:structuredClone(base.itemSource.parentContexts),completedSlices:structuredClone(base.itemSource.completedSlices),currentRecordAudit:structuredClone(base.itemSource.currentRecordAudit)}};}
function refresh(b){const a=b.itemSource,s=a.equipmentSource,c=a.completedSlices.E2d,units=new Map(s.units.map(u=>[u.id,u])),docs=new Map(b.source.rows.map(r=>[r.identity,r.data]));
 s.sourceDefinitionSetSemanticSha256=hash(s.units);s.tableSetSemanticSha256=hash(s.tables);c.equipmentSourceDefinitionSetSemanticSha256=hash(s.units);c.equipmentTableSetSemanticSha256=hash(s.tables);c.equipmentTargetSnapshotSetSemanticSha256=hash(s.targetSnapshots);
 const counts={};let bodies=0;
 for(const row of b.files[file].records){const d=row.sourceComparison.equipmentReview,e=a.currentRecordAudit[row.identity],doc=docs.get(row.identity);let body=false,price=false;
  for(const cmp of d.sourceComparisons){const u=units.get(cmp.sourceUnit),parsed=doc.system.cost==null||String(doc.system.cost).trim()===''?null:Number(doc.system.cost);
   cmp.sourceEvidenceSha256=hash(u);cmp.matchingEffectViewIndices=u.effectViews.flatMap((v,i)=>comparable(v.text)===comparable(doc.system.effect)?[i]:[]);cmp.sourceViewComparableSha256=u.effectViews.map(v=>textHash(comparable(v.text)));cmp.priceFacts=u.priceFacts;cmp.currentParsedPrice=parsed;cmp.priceCorrespondence=u.priceFacts.length?u.priceFacts.some(f=>f.amount===parsed):parsed===null;body||=cmp.matchingEffectViewIndices.length>0;price||=cmp.priceCorrespondence;}
  d.bodyCorrespondence=body;d.priceCorrespondence=price;row.coverageState=equipmentDisposition(row.identity,body,price,d.category);row.recordClass=row.coverageState==='reviewed'?'examined-item-source-correspondence':'examined-item-version-or-authority-limit';e.equipmentReviewSha256=hash(d);e.dispositionEvidenceSha256=hash(row);counts[row.coverageState]=(counts[row.coverageState]??0)+1;bodies+=Number(body);
 }c.counts=counts;c.bodyCorrespondences=bodies;c.recordEvidenceSemanticSha256=hash(b.files[file]);}
function tamper(change){const b=copy();change(b);refresh(b);return {bundle:b,errors:errors(b)};}
const row=(b,id)=>b.files[file].records.find(r=>r.identity===`items.${id}`);
test('all500 remaining items retain207 independent source units and93 exact targets',()=>{
 assert.deepEqual(errors(base),[]);assert.equal(base.files[file].records.length,500);assert.equal(base.itemSource.equipmentSource.units.length,207);assert.equal(base.itemSource.equipmentSource.targetSnapshots.length,93);
 assert.deepEqual(base.itemSource.completedSlices.E2d.counts,{unresolved:353,reviewed:147});assert.equal(base.itemSource.completedSlices.E2d.currentRules,203);assert.equal(base.itemSource.completedSlices.E2d.exactReferences,152);
});
test('a changed Booster price/view cannot manufacture a correspondence after full derived refresh',()=>{
 const result=tamper(b=>{const u=b.itemSource.equipmentSource.units.find(u=>u.labelForDiscovery==='Stat Boosters');u.priceFacts[0].amount=6000;u.effectViews[0].text=base.source.rows.find(r=>r.identity==='items.7WtvMDdV1JsPC1gO').data.system.effect;});
 assert.equal(row(result.bundle,'7WtvMDdV1JsPC1gO').coverageState,'reviewed');assert.ok(result.errors.some(e=>e.includes('do not reconstruct from raw source')));
});
test('editing raw price cells and all derived hashes still fails the independent source fingerprint',()=>{
 const result=tamper(b=>{const s=b.itemSource.equipmentSource,u=s.units.find(u=>u.labelForDiscovery==='Stat Boosters');s.tables['297'][0].cells[10][2]='$6000';u.tableAnchor.rawCells[2]='$6000';u.priceFacts[0].amount=6000;});
 assert.ok(result.errors.some(e=>e.includes('independently read raw source')));
});
test('DB expansion preserves the distinct Damage Bonus layer and all conditions/signs',()=>{
 assert.equal(comparable('+3 DB to one Poison-Type attack'),comparable('+3 Damage Base to one Poison-Type attack'));
 for(const pair of [['+3 Damage Bonus','+3 Damage Base'],['untransformed Ditto','Ditto'],['-4 Combat Stages','+4 Combat Stages'],['one hour','one Scene']])assert.notEqual(comparable(pair[0]),comparable(pair[1]));
 const result=tamper(b=>{const u=b.itemSource.equipmentSource.units.find(u=>u.labelForDiscovery==='Metal Powder');u.effect=u.effect.replace('untransformed ','');u.effectViews.forEach(v=>v.text=v.text.replace('untransformed ',''));});
 assert.ok(result.errors.some(e=>e.includes('do not reconstruct from raw source')));
});
test('complete Spray Case continuation and one-case/action parents cannot disappear',()=>{
 const u=base.itemSource.equipmentSource.units.find(u=>u.labelForDiscovery==='Spray Case');assert.deepEqual(u.source.pdfPages,[44,45]);assert.equal(u.proseAnchor.segments.length,2);assert.ok(u.effect.includes('may be refilled numerous times'));
 const result=tamper(b=>{const p=b.itemSource.parentContexts.find(p=>p.id==='e2-equipment-parent:porygon:44');p.rawText=p.rawText.replace('only have one case','have any number of cases');p.rawSha256=textHash(p.rawText);});
 assert.ok(result.errors.some(e=>e.includes('independently read raw source')));
});
test('price roles separate per-length, ingredient/product, upgrade and minimum prices',()=>{
 const units=base.itemSource.equipmentSource.units;
 assert.ok(units.find(u=>u.labelForDiscovery==='Rope').priceFacts.every(p=>p.role==='price-per-25-feet'));
 assert.deepEqual(units.find(u=>u.labelForDiscovery==='Flashlight').priceFacts.map(p=>[p.amount,p.role]),[[200,'regular-flashlight-price'],[400,'waterproof-upgrade-fee'],[600,'regular-plus-waterproof-upgrade-total']]);
 assert.equal(units.find(u=>u.labelForDiscovery==='Poffin Mixer').priceFacts.length,3);
 assert.equal(units.find(u=>u.labelForDiscovery==='Rare Candy').priceFacts[0].role,'qualified-minimum-or-more-not-fixed-retail');
 const result=tamper(b=>{b.itemSource.equipmentSource.units.find(u=>u.labelForDiscovery==='Rare Candy').priceFacts[0].role='unqualified-fixed-retail';});assert.ok(result.errors.some(e=>e.includes('do not reconstruct from raw source')));
});
test('optional books keep study/rank/AP and rest-renewal parents under full refresh',()=>{
 const result=tamper(b=>{const p=b.itemSource.parentContexts.find(p=>p.id==='e2-equipment-parent:may:7');p.rawText=p.rawText.replace('must be gained sequentially','may be gained in any order');p.rawSha256=textHash(p.rawText);});assert.ok(result.errors.some(e=>e.includes('independently read raw source')));
 assert.equal(row(base,'kM3RW6tPnSrXhQS1').sourceComparison.equipmentReview.selectedVersionStatus,'not-verified; no automatic adoption or blended-version authority');
});
test('original armor and separate September changes do not become one approved version',()=>{
 const source=base.itemSource.equipmentSource;assert.ok(source.units.some(u=>u.book==='sep'&&u.kind==='optional-equipment-revision'));
 const result=tamper(b=>{const u=b.itemSource.equipmentSource.units.find(u=>u.labelForDiscovery==='September Armor and Shields');u.sourceKind='standard-core';});assert.ok(result.errors.some(e=>e.includes('source kind')||e.includes('independently read raw source')));
});
test('Latias predicate observations remain exact source-only target evidence',()=>{
 const s=base.itemSource.equipmentSource.targetSnapshots.find(s=>s.identity==='effects.PgQftQ9zGvCBG3Rt');assert.deepEqual(s.document.system.rules.find(r=>r.key==='TemporarySpecies').predicate,['species:absol']);
 const result=tamper(b=>{const s=b.itemSource.equipmentSource.targetSnapshots.find(s=>s.identity==='effects.PgQftQ9zGvCBG3Rt');s.document.system.rules.find(r=>r.key==='TemporarySpecies').predicate=['species:latias'];s.contentHash=hash(s.document);});assert.ok(result.errors.some(e=>e.includes('complete direct-target')));
 assert.equal(row(base,'50oppn6s7DqVi98x').behavioralVerification,'not-run');
});
test('a nested species/Ability reference path cannot be swapped with a target still elsewhere',()=>{
 const result=tamper(b=>{const s=b.itemSource.equipmentSource.targetSnapshots.find(s=>s.identity==='effects.e7pXhJNuFE6LqW3f');s.dependencies[0].path='$.rules[999].uuid';});assert.ok(result.errors.some(e=>e.includes('nested UUID path')));
});
test('foreign choice targets and local origin IDs stay literal and unresolved by names',()=>{
 const d=row(base,'AT2gaIwem67KxHGi').sourceComparison.equipmentReview;assert.equal(d.referenceLiterals.filter(r=>r.path.includes('choices')).length,7);assert.ok(d.referenceLiterals.some(r=>r.resolution.startsWith('external-compendium')));
 const result=tamper(b=>{row(b,'AT2gaIwem67KxHGi').sourceComparison.equipmentReview.referenceLiterals[0].literalUuid='Item.AT2gaIwem67KxHGi';});assert.ok(result.errors.some(e=>e.includes('literal reference path')));
 assert.ok(row(base,'07kfLIHwK6KUkBV1').sourceComparison.equipmentReview.referenceLiterals.some(r=>r.resolution==='world-local-identity-not-resolved-by-display-label'));
});
test('closed A/B/C payloads remain fixed while the remaining-item slice is appended',()=>{
 for(const [file,expected]of [['capabilities','eebbaecb943974923b9d4b87dcb937a7f054f9f763dbd2f8d95f570ed721ca2f'],['technical-machines','3f8dfaff836fd917e130c3d4bc0dd8b2c7696d18dbb9f4418fe7efafcc615622'],['consumables','79a8b65fcee951de4b0fe88e36148b0dbb8b7d7efe789b9c3e5adbc9ce8c9211']])assert.equal(hash(base.files[`record-source-review/${file}.json`]),expected);
});
