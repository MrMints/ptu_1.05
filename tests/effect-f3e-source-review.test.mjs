import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectF3eSourceReview,effectF3eSourceFacts,effectF3eFactErrors,effectF3eFindings} from '../tools/effect-f3e-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';
const base=await loadRecordSourceReview(),file='record-source-review/effects-other-e.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const audit=b=>b.effectSlices.find(a=>a.slice==='F3e'),row=(b,id)=>b.files[file].records.find(r=>r.identity===`effects.${id}`),detail=(b,id)=>row(b,id).sourceComparison.effectReview;
const evidence=(b,id)=>audit(b).currentRecordAudit[`effects.${id}`];
function errors(b){const out=[];checkEffectF3eSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:()=>{}});return out;}
function tamper(change){
 const b={...base,files:{...base.files,[file]:structuredClone(base.files[file])},effectSlices:base.effectSlices.map(a=>a.slice==='F3e'?structuredClone(a):a)};
 change(b);
 for(const r of b.files[file].records){const e=audit(b).currentRecordAudit[r.identity];e.dispositionEvidenceSha256=hash(r);e.examinationSha256=hash(r.sourceComparison.effectReview);}
 audit(b).closure.recordEvidenceSemanticSha256=hash(b.files[file]);
 audit(b).closure.examinedDispositionsSemanticSha256=hash(b.files[file].records.map(r=>({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,generationReview:r.generationReview,examination:r.sourceComparison.effectReview})));
 return errors(b);
}
function prose(b,id,from,to){const r=row(b,id),d=detail(b,id),before=d.specificAssessment;d.specificAssessment=before.replace(from,to);assert.notEqual(d.specificAssessment,before);r.ruleVersionReview.basis=d.specificAssessment;if(r.missingEvidence)r.missingEvidence.neededArtifact=d.specificAssessment;}
const rejected=(change,re)=>assert.ok(tamper(change).some(e=>re.test(e)));

test('F3e closes only60 source examinations and leaves519 originalF records outside its closure',()=>{
 assert.deepEqual(errors(base),[]);const f=base.batchManifest.batches.find(b=>b.id==='F');
 assert.equal(f.status,'in-progress');assert.equal(f.acceptance.status,'pending-substantive-review');
 assert.equal(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e'].includes(s.id)).reduce((n,s)=>n+s.records,0),519);
 assert(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g','F3h','F4a','F4b'].includes(s.id)).every(s=>!s.recordFile&&s.status==='not-started'));
 assert.deepEqual(audit(base).closure.counts,{reviewed:28,unresolved:32});assert.equal(audit(base).closure.fullFAcceptance,false);
 assert.equal(base.index.coverage.completeAddressableClassification,false);
 assert.equal(hash(base.files['record-source-review/effects-other-d.json']),'bd55f1eba0f1bbe6f688ecc0b268910f8babfd1f0184c05db94a7429d94bd12b');
 assert.equal(hash(base.effectSlices.find(a=>a.slice==='F3d')),'8d70a8a0c3cf7a8fa076f4366f7dbf678b33bc3cba283c5075b4b861c5639338');
});
test('complete literal source/current/relationship/history census',()=>{
 const a=audit(base);assert.equal(a.sourceDefinitions.length,63);assert.equal(a.parentContexts.length,71);assert.equal(a.nativeContexts.length,14);
 assert.equal(a.targetSnapshots.length,129);assert.equal(a.pageTargets.length,13);assert(a.pageTargets.every(p=>p.pageFound));
 assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.currentRules.length,0),115);
 assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.references.length,0),20);
 assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.incomingReferences.length,0),58);
 const h=Object.values(a.currentRecordAudit).flatMap(e=>e.exportLineage.snapshots);assert.equal(h.length,240);assert.equal(h.filter(h=>h.recordFound).length,19);
 assert.deepEqual([0,1,2,3].map(i=>Object.values(a.currentRecordAudit).filter(e=>e.exportLineage.snapshots[i].recordFound).length),[2,5,6,6]);
 assert.deepEqual(a.targetSnapshots.filter(s=>!s.document).map(s=>s.identity).sort(),['feats.FscR61Z2dXQUshuh','feats.h9CcAYwKDwVa93kU']);
});
test('original Shell Shield action differs from optional addedDR and action',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(effectF3eFactErrors(f),[]);
 assert.equal(f.sourceBoundaries.originalShellAddsTen,false);assert.deepEqual(f.observations.shellOptionalDr.values,['10','1']);
 assert.match(f.observations.shellOriginalAction.clause,/Free Action/);assert.match(f.observations.shellOptionalAction.clause,/Standard Action/);
});
test('Shadow Meld numeric source support does not certify tint or actions',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(f.observations.shadowNumbers.values,['4','1']);
 const r=evidence(base,'WhF3JNuRUGCCx4Xt').currentRules.map(r=>r.object);assert.equal(r[4].tint,'#222224');assert(!Object.hasOwn(r[4],'predicate'));
 assert(r.slice(0,4).every(r=>r.predicate.includes('species:gengar')));
});
test('Esper Wing contradiction is exact producer path with separate reference, not reproduced behavior',()=>{
 const c=audit(base).sourceFacts.currentContradiction;
 assert.match(c.body,/Speed by 1/);assert.match(c.actualApply.uuid,/aHbD8Xyqg3NIVJXY$/);assert.match(c.separateReference,/o5wKWO9OtUvgm6NO$/);assert.equal(c.reproducedGameplayFailure,false);
 const r=evidence(base,'aHbD8Xyqg3NIVJXY').currentRules;assert(r.every(r=>r.object.mode==='subtract'&&r.object.value===1));
});
test('typed DR formulas, plural stages path and Effectiveness attack types remain literal',()=>{
 const t=audit(base).sourceFacts.currentTypedLimits;assert.equal(t.engineExecutionVerified,false);
 assert.match(t.cut[0].value,/@actor\.modifiers\.damageReduction\.physical/);assert.equal(t.cut[0].priority,99);
 assert.equal(t.windveiled[0].path,'system.stats.spd.stages.mod');assert.equal(t.heartfulTarget[0].type,'fairy');assert.equal(t.infernalTarget[0].type,'fire');
});
test('Song of Life is original5DR, not healing, and its user/activation framework is retained',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(f.observations.songQuantity.values,['5']);assert.match(f.observations.songAlwaysUser.clause,/always affect the user/);
 assert.match(detail(base,'YaiVsWb3XBv5dgag').specificAssessment,/Four activation routes/);
});
test('prior chronology includes wholeF3d and excludes own/future evidence',()=>{
 const ids=priorSourceIdentities(base.batchManifest,'F','F3e');assert(ids.has('effects.WhF3JNuRUGCCx4Xt')===false);
 for(const r of base.files['record-source-review/effects-other-d.json'].records)assert(ids.has(r.identity));
 for(const r of base.files[file].records)assert(!ids.has(r.identity));
 for(const s of audit(base).targetSnapshots)assert.equal(s.priorSourceReview!==null,ids.has(s.identity));
});

const proseMutations=[
 ['UnsGmd87w66COoVb','adds NO10DR','adds10DR'],
 ['UnsGmd87w66COoVb','STANDARD ACTION INTERRUPT AND10DR','FREE ACTION INTERRUPT AND10DR'],
 ['WhF3JNuRUGCCx4Xt','grantsSTEALTH4/EVASION1','no printed numeric bonuses'],
 ['WhF3JNuRUGCCx4Xt','tint#222224 is UNCONDITIONAL','tint#222224 is Gengar-only'],
 ['UnvYG2084ke5reQE','per10 POKEMON LEVELS','per20 TRAINER LEVELS'],
 ['Uq3ErLQLOvNwmIZd','SUNNY doubles BOTH gains to2','SUNNY grants only1'],
 ['VFdii6AArwnxfDAU','SUCCESSFUL HIT AND EVEN-NUMBERED ROLL','EVEN-NUMBERED ROLL including misses'],
 ['VIzi2QdVNob8Fudb','on18+','on17+'],
 ['Vc8riaddym8tBktm','MINUS OR PLUS ABILITY TARGETS','ElectricType targets'],
 ['WAcvxvCy4zhBruao','MELEE attacker','all attackers'],
 ['WHF44ZYCCgFEXlpX','Optional September4 instead raises USER DEFENSE1','Original also raises USER DEFENSE1'],
 ['Wm1ZxSNW7iJTHVg7','TEMPORARY HP equal1/16MAX','healing5HP'],
 ['WwkHKAosnhprNpkJ','BEFORE STAB/OTHER MODIFIERS','AFTER STAB/OTHER MODIFIERS'],
 ['X6oZMBR5sgezfaZV','NO DARK FORM','DARK FORM'],
 ['YaiVsWb3XBv5dgag','AREA5 DAMAGE REDUCTION','AREA5 HEALING'],
 ['YaiVsWb3XBv5dgag','ALWAYS AFFECT USER','never affect user'],
 ['XLGCJDfkKi1nHPLr','POISONED OR BADLYPOISONED','BADLYPOISONED ONLY'],
 ['YQYxjFgbTbujbgNj','2TICKS END-TURN AND are ALWAYS SLOWED','2HP and no movement penalty'],
 ['YirEcq7HUwGSPBBO','not certified universally equivalent','certified universally equivalent'],
 ['ZFqIS5WZUGaFHhxH','GRASS-TYPE POKEMON IN BURST2','all Trainers IN BURST4'],
 ['ZlTAJ7wtshgov2B4','ALL creatures count as DAMP','Water creatures count as DAMP'],
 ['ZlTAJ7wtshgov2B4','maxONCE PER RESOLUTION/noAoEstack','once per target stacking'],
 ['aHbD8Xyqg3NIVJXY','STATIC PATH/BODY CONTRADICTION','VERIFIED RUNTIME FAILURE'],
 ['aVm0441s0adbinyC','MELEE/PASS','MELEE/one-target'],
 ['aVm0441s0adbinyC','UP TO5 DAMAGE REDUCTION','DEFENSE5'],
 ['b5SB3DE0oxrQOAgf','spd.stages.mod (PLURAL stages)','spd.stage.mod (ordinary)'],
 ['bHFPSVqFwplErRwk','DAMAGING RANGED ATTACKS WITH AC','all attacks'],
 ['bcqSFuBrcVMXAMFW','START OF EVERY TURN heal1TICK','END OF OWN TURN heal10HP'],
 ['beQpq1CpBRR2Z1M6','ATTACK1 OR SPECIALATTACK1 COMBAT STAGE','ATTACK1 AND SPECIALATTACK1 COMBAT STAGE']
];
for(const[id,from,to]of proseMutations)test('rejects refreshed-hash prose change '+id+' '+from,()=>rejected(b=>prose(b,id,from,to),/independent source-semantic prose clause/));

const sourceMutations=[
 ['unit','core:329:ability-line60','a Free','a Standard','shellOriginalAction'],
 ['unit','feb:9:ability-line51','+10','+11','shellOptionalDr'],
 ['unit','core:112:feature-line3','every 10','every 20','statAce'],
 ['unit','core:369:move-line60','successfully hits','misses','fieryHit'],
 ['unit','core:357:move-line65','Minus or Plus','Electric or Magnetic','magneticRecipients'],
 ['unit','core:430:move-line24','was Melee','was Ranged','kingsMelee'],
 ['unit','core:435:move-line60','15 Damage','10 Damage','withdrawOriginalDr'],
 ['unit','sep:4:move-line40','raised 1','raised 2','withdrawOptionalStage'],
 ['unit','core:307:capability-shadowmeld','+4 bonus','+5 bonus','shadowNumbers'],
 ['unit','core:328:ability-line26','1/16th','1/8th','rootOriginalTemp'],
 ['unit','core:311:ability-line33','Melee Move','Ranged Move','ambushOriginalMelee'],
 ['unit','core:318:ability-line35','Ice Type','Dark Type','forecastIce'],
 ['unit','core:394:move-line37','up to 5','up to 6','cutDr'],
 ['unit','core:61:feature-line33','Bind 2 AP','Bind 3 AP','trickBound'],
 ['unit','core:317:ability-line78','+5 Bonus','+1 Bonus','flashOriginal'],
 ['page','core:164','always affect the user','never affect the user','songAlwaysUser'],
 ['native','km9RudFAY1778m0q','<strong>two</strong>','<strong>one</strong>','neutrinoAbilities'],
 ['native','a6wZkR8rJNlKHrFe','4m radius','5m radius','fogRadius'],
 ['native','Ituwb8YlUkp5boxz','Vulnerable','Flinched','acidStatus'],
 ['native','y5XB5KR2FF2XysmZ','two Ticks','two Hit Points','dustRecipients'],
 ['native','P9g71CQGub5KzQHo','doesn’t stack','stacks','delugeNoStack'],
 ['native','HdTyaqw3uARLJjZf','3 minus','4 minus','galePushFormula'],
 ['native','4faymH1bVfUFQiUM','Physical Steel-Type','all Steel-Type','desiccatingPhysical'],
 ['native','YBWVC5IMxZYqnabl','Resisted','Super Effective','blisteringStep']
];
for(const[kind,id,from,to,key]of sourceMutations)test('rejects recomputed raw source meaning '+key,()=>rejected(b=>{
 const a=audit(b),u=(kind==='unit'?a.sourceDefinitions:kind==='page'?a.parentContexts:a.nativeContexts).find(u=>(kind==='native'?u.pageId:u.id)===id),field=kind==='unit'?'rawDefinition':'rawText',before=u[field];
 u[field]=before.replace(from,to);assert.notEqual(u[field],before);u.rawSha256=textHash(u[field]);
 a.sourceFacts=effectF3eSourceFacts(a,sourceReviewText);
 a.closure.sourcePrimitivesSemanticSha256=hash(Object.fromEntries(['sourceDefinitions','printedDefinitions','parentContexts','nativeContexts','sourceUnitRoles'].map(k=>[k,a[k]])));
},new RegExp('independent signed.*'+key)));

test('rejects literal producer path change with true target still elsewhere',()=>rejected(b=>{const e=evidence(b,'aHbD8Xyqg3NIVJXY');e.incomingReferences.find(r=>r.sourceIdentity==='moves.KkMY9ELz4sIimIQB').path='$.system.referenceEffect';},/exact outgoing\/incoming path/));
test('rejects lost UUID suffix even with the same target',()=>rejected(b=>{evidence(b,'UhXINRTcKLKHoi67').literalReferences[0].literalUuid+='different';},/literal\/page suffix/));
test('rejects invented missing feat target',()=>rejected(b=>{audit(b).targetSnapshots.find(s=>s.identity==='feats.FscR61Z2dXQUshuh').document={name:'invented',system:{}};},/exact current target\/prior chronology/));
test('rejects current field disagreement updated in both duplicated fields',()=>rejected(b=>{const r=row(b,'V8QBZMEeIinYP9Nt'),f=r.fieldReview.find(f=>f.recordFieldPath==='system.duration');f.recordValue.value=9;f.recordJsonSha256=hash(f.recordValue);r.sourceComparison.fields=r.fieldReview;},/actual field\/hash\/status disagreement/));
test('rejects a typed current stage changed to damage with fresh per-rule hash',()=>rejected(b=>{const r=evidence(b,'V8QBZMEeIinYP9Nt').currentRules[0];r.object.path='system.modifiers.damage.mod';r.jsonSha256=hash(r.object);},/complete current rule\/role/));
test('rejects native page substitution without matching name authority',()=>rejected(b=>{audit(b).nativeContexts.find(n=>n.pageId==='Ituwb8YlUkp5boxz').pageId='IAEQNRN3dhavHlYn';},/exact native page\/authority/));
test('rejects later/own evidence inserted as genuine prior',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>s.identity==='effects.aHbD8Xyqg3NIVJXY');s.priorSourceReview=row(b,'aHbD8Xyqg3NIVJXY');s.priorReviewSemanticSha256=hash(s.priorSourceReview);},/exact current target\/prior chronology/));
test('rejects historical omission normalized to false',()=>rejected(b=>{const h=evidence(b,'Wt0bzGOtDVlfzZeb').exportLineage.snapshots.find(h=>h.recordFound);h.historicalNormativeValues.stackSlugs=false;},/historical field\/omission/));
test('rejects historical stage.value quietly changed to stage.mod',()=>rejected(b=>{const h=evidence(b,'Wt0bzGOtDVlfzZeb').exportLineage.snapshots.find(h=>h.recordFound);h.historicalNormativeValues.rules[0].path='system.stats.spd.stage.mod';},/historical field\/omission/));
test('rejects source correspondence promoted to behavior',()=>rejected(b=>{row(b,'UnsGmd87w66COoVb').behavioralVerification='verified';},/source-derived assessment/));
test('rejects name-based whole-generation approval',()=>rejected(b=>{detail(b,'X6oZMBR5sgezfaZV').completeCurrentGenerationEstablished=true;},/unestablished generation cannot be promoted/));
test('rejects canonical counterpart invention',()=>rejected(b=>{detail(b,'VvCEzUbF86Et0J2h').canonicalRelationshipClaim=true;},/source-derived assessment/));
test('rejects complete source trace dropped from revised Withdraw',()=>rejected(b=>{detail(b,'WHF44ZYCCgFEXlpX').sourceDefinitionIds=detail(b,'WHF44ZYCCgFEXlpX').sourceDefinitionIds.filter(id=>!id.startsWith('core:435:'));},/per-ID complete source\/parent\/native trace/));
test('rejects advisory acquisition collapsed into actual use approval',()=>rejected(b=>{audit(b).authoringLimits.actualAcquisitionAndPreservation='verified';},/missing authoring\/unrun foundation/));

const earlierPayloadPins={"record-source-review/starter-dependencies.json":"9788624afb1b417314b60d555b44db35dd7daa0db61981b29facef0ef3900a64","record-source-review/reading-order-regressions.json":"fe03a646cc0a391072f07dd2f88ffc41c1d982c4840cafb4d0c3328bb590b572","record-source-review/known-exclusions.json":"a513ee1c408bff7adee0be8fca91d76f044489d09795c61842f47f326a248f95","record-source-review/form-branch-skills.json":"c03b8ae2c94312021473dc6861ad503b3af7b80b27f92480de065622563a08de","record-source-review/species-classic-early.json":"0f0a2373bf1fe6a9c2b5bed22f20edbedc66672c96f56f0d7927aa748e89964a","record-source-review/species-classic-middle.json":"55c4f791926444d18dcd01542101749f30f24469f5e7b50cb5e22647cc45374e","record-source-review/species-classic-late.json":"7a00e3eda8ea6585793815bddbb17b45833f34373fdbf1f29240ce4b95f44d7b","record-source-review/species-classic-final.json":"340680cd7723ce9a79ae2d30225b42239017a016d8dced61daffb3e96dbb5e86","record-source-review/species-regional.json":"0dfa0cfe3da337d0ca5c7bd70d31e48d39f2533e0aca3f8e9881b564ad7d79d7","record-source-review/species-scope.json":"43cd46a5ab888c590b7f59cb8dfd1e44798c4f21bef9630c59469fd64f28bec4","record-source-review/species-unmatched.json":"578c3c90b0a0de680023e89f913e1b9f54f2619d7dfd2877c14ba8aa2d8a7bea","record-source-review/abilities-core.json":"fe7805fe8ddd54c936c9b91bca8a2392d5285b29d1525de0b33d558d680f06af","record-source-review/abilities-packet.json":"38dc3f346497b42d974755a69962f45d9c706346c18ae59a3519960b4f921755","record-source-review/abilities-remaining.json":"260969fe7ee04c6a71a82d3ac8d7d9efcafff34a84dda047a8567fc868645927","record-source-review/moves-contest.json":"6ca6c78cda13020a8200b7aea3378d3ed2a92f47a54dab891e8e0c50908d2e6d","record-source-review/moves-anchored.json":"ccff9d89252604b3abae59b5c46d3d32b86cbc1c6c5cd4d88cde535367245678","record-source-review/moves-remaining.json":"f045ea975d2ade7a41b9dd09db8d4fc242d51faead3d0912a25fdd3d8349d8eb","record-source-review/edges.json":"f4030cae2b4fda2993dd0ca80a3ca48dd4a3a4b5c0846588b3bed37ece6f3494","record-source-review/pokemon-edges.json":"392a9be69f5e3f6d9ae4b6dcc6d7ceebe11a02ac4bc98b7db9b35e821d50b75e","record-source-review/features-core.json":"048171c57a0bb8ae8210fc3785c38b1bd7b8cf587d6e50a63be3d761b9a1b17f","record-source-review/features-supplemental.json":"151df633b7fa9cc185cbd3b0d6fd2ed4d605602c6aeec7f26e0bf3543868adf6","record-source-review/features-remaining.json":"3265059cc4af99f5a827b43486536c70d1121053cdec5f8cbcfb49d136ecb10e","record-source-review/capabilities.json":"eebbaecb943974923b9d4b87dcb937a7f054f9f763dbd2f8d95f570ed721ca2f","record-source-review/technical-machines.json":"3f8dfaff836fd917e130c3d4bc0dd8b2c7696d18dbb9f4418fe7efafcc615622","record-source-review/consumables.json":"79a8b65fcee951de4b0fe88e36148b0dbb8b7d7efe789b9c3e5adbc9ce8c9211","record-source-review/equipment.json":"1c01a0c62879d8c93ce34ce864ab389cf88b38d999be24d0f1ba3d6efe54c532","record-source-review/spirit-actions.json":"89e79ad81da75a4d4205dd5db197609b26e0a03fe750f2e2611c54e5b70d603f","record-source-review/conditions.json":"1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d","record-source-review/temporary-species.json":"fac63d37f6bd5560786efc5e814f807931d94ba13be573ad02835d3f002ac774","record-source-review/effects-other-a.json":"609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee","record-source-review/effects-other-b.json":"a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977","record-source-review/effects-other-c.json":"02dc039aba02e258720171a326e5aff9edefaa0280c0e15434c7a15f6778785c","record-source-review/effects-other-d.json":"bd55f1eba0f1bbe6f688ecc0b268910f8babfd1f0184c05db94a7429d94bd12b"};
const earlierAuditPins={"ability-source-evidence.json":"29cc72e8f7c43ff5dfbd7ec61eec2f7125f5a5a5510dd272587d26b77ccb1ad2","move-source-evidence.json":"30933a00d3f09eb2295dea531eb4cf1ad8d0425485a51e96efbb5b14422f5b81","feature-source-evidence.json":"9b9508bfd5049fd6a18136359022eeb8353f6e27785247cf2a144aa27bb7bf5d","item-source-evidence.json":"cbb51491dd93924664674e366a3e3742ecd28c91cd90e725f14e076611d71b32","effect-source-evidence.json":"e0ec14cea2efeeae560accf82a9786ea48d8834fd3a251726dab2a748f134282","temporary-species-source-evidence.json":"f4224980b64fbccad4dc1206313393854dd1c835e5b8c5e4bf0391daaf3a3439","effect-source-evidence-f3a.json":"ffb59dfd1e254a002f57925933555aa6ae06977c6c9c03d00bff348eddf4de47","effect-source-evidence-f3b.json":"143b529579056fd9e0da7af7e42f232b9c8959a68341cb8927589109741418ad","effect-source-evidence-f3c.json":"344cb5bc93c0f4aae6df66784e9e6f0876a236beb528a952cf85b0de83926e33","effect-source-evidence-f3d.json":"8d70a8a0c3cf7a8fa076f4366f7dbf678b33bc3cba283c5075b4b861c5639338"};
const earlierAudits=Object.fromEntries(await Promise.all(Object.keys(earlierAuditPins).map(async p=>[p,JSON.parse(await readFile(new URL('../docs/data/'+p,import.meta.url),'utf8'))])));
test('all33 earlier payloads/10 whole audits and frozen nonF/otherF metadata are preserved',()=>{
 assert.equal(Object.keys(earlierPayloadPins).length,33);assert.equal(Object.keys(earlierAuditPins).length,10);
 for(const[p,h]of Object.entries(earlierPayloadPins))assert.equal(hash(base.files[p]),h,p);
 for(const[p,h]of Object.entries(earlierAuditPins))assert.equal(hash(earlierAudits[p]),h,p);
 const f=base.batchManifest.batches.find(b=>b.id==='F');
 assert.equal(f.membershipSha256,'791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6');
 assert.equal(hash(base.batchManifest.batches.filter(b=>b.id!=='F')),'c8523e7b53b8c8b2b2956f80a6a9252eb8f8f42af6f42868a3358af86519deed');
 // Assigned F3f/F3g/F3h/F4a/F4b may advance their own administrative closures; every frozen tuple and
 // all other metadata remain covered by the original F3e checkpoint pin.
 const outsideF3e=f.slices.filter(s=>s.id!=='F3e').map(s=>{if(!['F3f','F3g','F3h','F4a','F4b'].includes(s.id))return s;const original={...s,status:'not-started',closure:null};delete original.recordFile;return original;});
 assert.equal(hash(outsideF3e),'cf8a831a0d9ed547abcfa322b654a558c8034d7918b6a7f41fdd6b85e811a938');
});
