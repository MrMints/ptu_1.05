import test from 'node:test';
import assert from 'node:assert/strict';
import {assertFullFSourceAccepted} from './helpers/full-f-acceptance.mjs';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectF3fSourceReview,effectF3fSourceFacts,effectF3fFactErrors} from '../tools/effect-f3f-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';
const base=await loadRecordSourceReview(),file='record-source-review/effects-other-f.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const audit=b=>b.effectSlices.find(a=>a.slice==='F3f'),row=(b,id)=>b.files[file].records.find(r=>r.identity===`effects.${id}`),detail=(b,id)=>row(b,id).sourceComparison.effectReview;
const evidence=(b,id)=>audit(b).currentRecordAudit[`effects.${id}`];
function errors(b){const out=[];checkEffectF3fSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:()=>{}});return out;}
function tamper(change){
 const b={...base,files:{...base.files,[file]:structuredClone(base.files[file])},effectSlices:base.effectSlices.map(a=>a.slice==='F3f'?structuredClone(a):a)};
 change(b);
 for(const r of b.files[file].records){const e=audit(b).currentRecordAudit[r.identity];e.dispositionEvidenceSha256=hash(r);e.examinationSha256=hash(r.sourceComparison.effectReview);}
 audit(b).closure.recordEvidenceSemanticSha256=hash(b.files[file]);
 audit(b).closure.examinedDispositionsSemanticSha256=hash(b.files[file].records.map(r=>({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,generationReview:r.generationReview,examination:r.sourceComparison.effectReview})));
 return errors(b);
}
function prose(b,id,from,to){const r=row(b,id),d=detail(b,id),before=d.specificAssessment;d.specificAssessment=before.replace(from,to);assert.notEqual(d.specificAssessment,before);r.ruleVersionReview.basis=d.specificAssessment;if(r.missingEvidence)r.missingEvidence.neededArtifact=d.specificAssessment;}
const rejected=(change,re)=>assert.ok(tamper(change).some(e=>re.test(e)));
test('historical checkpoint remains bounded after full-F acceptance: only60 F3f examinations close;459 originalF stay outside its closure and F3e stays whole',()=>{
 assert.deepEqual(errors(base),[]);const f=base.batchManifest.batches.find(b=>b.id==='F');
 assertFullFSourceAccepted(f);assert.equal(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f'].includes(s.id)).reduce((n,s)=>n+s.records,0),459);
 assert(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g','F3h','F4a','F4b','F4c','F4d'].includes(s.id)).every(s=>!s.recordFile&&s.status==='not-started'));
 assert.deepEqual(audit(base).closure.counts,{reviewed:36,unresolved:24});assert.equal(audit(base).closure.fullFAcceptance,false);assert.equal(base.index.coverage.completeAddressableClassification,false);
 assert.equal(hash(base.files['record-source-review/effects-other-e.json']),'4a85dab1c701fada5abfaafb370893b910ecd5bf4997703fd8704249b75ba35c');
 assert.equal(hash(base.effectSlices.find(a=>a.slice==='F3e')),'f10f13fa89c7057982102fa5d27db4d71f4186d0958c41eb31fdaa74a8fcbaee');
});
test('complete source/current/relationship/history census includes all absent targets',()=>{
 const a=audit(base);assert.equal(a.sourceDefinitions.length,74);assert.equal(a.parentContexts.length,84);assert.equal(a.nativeContexts.length,5);assert.equal(a.targetSnapshots.length,139);assert.equal(a.pageTargets.length,4);assert(a.pageTargets.every(p=>p.pageFound));
 assert.equal(Object.keys(a.rootCurrentSystems).length,60);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.currentRules.length,0),132);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.references.length,0),15);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.incomingReferences.length,0),76);
 const h=Object.values(a.currentRecordAudit).flatMap(e=>e.exportLineage.snapshots);assert.equal(h.length,240);assert.equal(h.filter(h=>h.recordFound).length,20);assert.deepEqual([0,1,2,3].map(i=>Object.values(a.currentRecordAudit).filter(e=>e.exportLineage.snapshots[i].recordFound).length),[2,3,7,8]);
 assert.deepEqual(a.targetSnapshots.filter(s=>!s.document).map(s=>s.identity).sort(),['feats.Qbd04TGSzL3weZM4','feats.sWT86hW5OrDgkb3h','feats.yjDIVmsmUoOqC4Zc']);
});
test('signed stat/text discrepancies and threshold differences stay literal',()=>{
 const f=audit(base).sourceFacts,c=f.currentObservations;assert.deepEqual(effectF3fFactErrors(f),[]);assert.deepEqual(f.observations.ironThreshold.values,['1','15']);assert.equal(c.ironThreshold,'19');
 assert.equal(c.wearBody,'-1 Spd CS');assert.equal(c.wearRule.path,'system.stats.def.stage.mod');assert.equal(c.screechBody,'+2 Def CS');assert.equal(c.screechRule.mode,'subtract');assert.equal(c.growthBody,'+1 Atk CS, +1 Sp.Atk CS');assert(c.growthRules.every(r=>r.value===2));
 assert(c.growthProducerRules.every(r=>r.key==='GrantItem'));assert.equal(c.growthProducerReference,'Compendium.ptu.effects.Item.Uq3ErLQLOvNwmIZd');
});
test('Hardened string state and temporaryHP have distinct typed roles',()=>{
 const h=evidence(base,'ed6GkfPq9AmYTTnf').typedCurrentRoles[0],t=evidence(base,'gsePGwVgjU3VgjIK').typedCurrentRoles.at(-1);
 assert.equal(h.domain,'literal-string-state');assert.equal(h.value,'true');assert.equal(h.literalValueType,'string');assert.equal(h.executionVerified,false);
 assert.equal(t.domain,'temporary-hit-points');assert.equal(t.unit,'hit-points');assert.equal(t.literalDerivedExpression,'@actor.system.health.tick');assert.equal(t.executionVerified,false);
});
test('source omission and conditional ambiguity do not acquire invented units or rulings',()=>{
 const f=audit(base).sourceFacts;assert.equal(f.sourceBoundaries.energyCombatStagePrinted,false);assert.deepEqual(f.observations.energyOmission.values,['1','19']);assert.equal(f.sourceBoundaries.autotomizeWeightConditionEquivalenceVerified,false);assert.match(f.observations.autotomizeConditional.clause,/If the user can/);
 assert.equal(row(base,'c01eM7WOC6z1pPt8').generationReview.status,'unavailable');assert.equal(detail(base,'c01eM7WOC6z1pPt8').completeCurrentGenerationEstablished,false);
});
test('captureRateD100 and half damage/one resistance step stay distinct from current fields',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(f.observations.captureRoll.values,['1d100']);assert.deepEqual(f.observations.captureLegendary.values,['30']);assert.equal(f.currentObservations.captureRule.selectors,'capture-dc');assert.equal(f.currentObservations.captureRule.value,-30);assert.equal(f.unresolvedExecution.captureDcEqualsD100RateVerified,false);
 assert.match(f.observations.multiscaleOriginalHalving.clause,/after applying your Defenses/);assert.match(f.observations.multiscaleOptional.clause,/all damage.*one step/);assert.equal(f.currentObservations.multiscale.value.brackets[0].value,0.5);assert.equal(f.unresolvedExecution.multiscaleHalfStepEqualsEitherSourceVerified,false);
});
test('older Autotomize empty weight value and Hardened half step are preserved',()=>{
 const h=evidence(base,'eO5ycOqENdnKlMiJ').exportLineage.snapshots.find(h=>h.historicalNormativeValues?.rules);assert.equal(h.historicalNormativeValues.rules[0].path,'system.stats.spd.stage.value');assert.equal(h.historicalNormativeValues.rules[1].path,'system.size.weightClass');assert.equal(h.historicalNormativeValues.rules[1].value,'');assert.equal(h.historicalNormativeValues.stackSlugs,null);
 const hardened=evidence(base,'ed6GkfPq9AmYTTnf').exportLineage.snapshots.find(h=>h.historicalNormativeValues?.rules?.some(r=>r.path==='system.modifiers.resistanceSteps.mod'));assert.equal(hardened.historicalNormativeValues.rules.at(-1).value,0.5);assert.equal(evidence(base,'ed6GkfPq9AmYTTnf').currentRules.at(-1).object.value,1);
});
test('native physicalSteel and creator/type/hazard qualifiers are not silently automated',()=>{
 const a=audit(base),f=a.sourceFacts,b=f.currentObservations.blisteringBurnBranches;assert.deepEqual(b[0].predicate,[]);assert(b[0].selectors.includes('steel-damage-received'));assert(b[1].predicate.includes('move:category:physical'));
 assert.deepEqual(f.observations.eclipseHazardCount.values,['2','50','1']);assert.match(f.observations.eclipseNoStats.clause,/do not apply stats/);assert.equal((a.nativeContexts.find(n=>n.pageId==='JO37oFyHv5GBPjbE').rawText.match(/This part of the effect is not Automated!/g)??[]).length,3);assert.equal(a.authoringLimits.independentWeatherPlaytestAuthoringEstablished,false);
});
test('prior chronology includes F3e and excludes own/future-H reviews',()=>{
 const ids=priorSourceIdentities(base.batchManifest,'F','F3f');for(const r of base.files['record-source-review/effects-other-e.json'].records)assert(ids.has(r.identity));for(const r of base.files[file].records)assert(!ids.has(r.identity));for(const s of audit(base).targetSnapshots)assert.equal(s.priorSourceReview!==null,ids.has(s.identity));
});
const proseMutations=[
 ['beTypIG3f7skgGa4','on15+','on19+'],['bqiqznj14sIHOpBR','BODY/SNIPPET say SPEED-1','BODY/SNIPPET say DEFENSE-1'],['cWsAKHAhbzeqLVF0','BODY/SNIPPET say DEFENSE+2','BODY/SNIPPET say DEFENSE-2'],
 ['cdt6QIX2JFQxhRft','actual objects ADD2 EACH','actual objects ADD1 EACH'],['cdt6QIX2JFQxhRft','no executable Sunny selection branch','verified automatic Sunny selection branch'],
 ['bwQniJ8g4OIydZsO','does NOT print HP1+floor','prints HP1+floor'],['c01eM7WOC6z1pPt8','crossing BELOW50%MAXHP','being AT OR BELOW50%MAXHP'],
 ['c7ZNDXTlYlsS6RNW','NO WEATHER PREDICATE','a verified Hail predicate'],['crEfVwJadvsB2AqO','Optional February8 is SCENE','Optional February8 is STATIC'],['crEfVwJadvsB2AqO','DAMAGING GRASS HIT','any Grass interaction'],
 ['d5w5ffrIIYmFUUzj','literal STRING valueFairy','normalized arrayFairy'],['d8214x5aNOxtEyxX','firstFIVE values are literal0','firstFIVE values calculate Intuition'],['d8214x5aNOxtEyxX','CHANNELED TARGET WHILE BOUND','any target indefinitely'],
 ['dBg5buuImguROMaE','END OF USER NEXT TURN','END OF TARGET CURRENT TURN'],['dBg5buuImguROMaE','Static1+3=4 fits optional totals only','Static2+3=4 fits original totals'],
 ['dBlJnKax0KQUYnG5','SOMETHING OTHER THAN ITS OWN MOVES OR ABILITIES','any effect including self drops'],['dZ06WIu0DfK78NlS','hasAC2','hasAC5'],
 ['dmO40gFAbDtV0qXh','VIGOR on SPECIAL hits','VIGOR on PHYSICAL hits'],['dmO40gFAbDtV0qXh','Caps2/4','Caps4/8'],['dyk9GIGBhVo3NGGZ','WEIGHT UNCHANGED','WEIGHT multiplied1.25'],
 ['eKMSueJhHjN1MZMp','AND CONFUSES','with no other consequence'],['eO5ycOqENdnKlMiJ','IF THE USER CAN','ONLY IF WEIGHTCLASS REDUCED'],['eR9gulcKs9v9SF8V','AFTER BOTH BLESSING AND TRIGGERING ATTACK RESOLVE','BEFORE BLESSING RESOLVES'],
 ['eb0gaKKWEKuxSv3x','AT-WILL/SELF','EOT/BURST1'],['ed6GkfPq9AmYTTnf','7injuries HPLOSS IMMUNITY BUT NOT DAMAGE','7injuries DAMAGE IMMUNITY'],['ed6GkfPq9AmYTTnf','STRINGtrue','BOOLEANtrue'],
 ['eiHI7pSRauVpiEMD','SUBTRACT30 FROM TARGET CAPTURE RATE','ADD30 TO CAPTURE ROLL'],['epkSS2waHGQnfOxM','NEXT WEAPON ATTACK WITH LONG-RANGE WEAPON','all ranged attacks indefinitely'],
 ['fEmaSXw3MALAOeLp','Do not certify0.5step as halving or oneStep','Certify0.5step as halving and oneStep'],['fNSwwM06WlrPmrFS','BOTH actual Move frequencies areEOT','Electric Move is Scene'],
 ['fRleASN88UKiuYYY','BODY says HAIL OR SNOWY TERRAIN','BODY correctly says SANDSTORM'],['fXsxr8akxM4wQfdy','ALL STEEL without physicalpredicate','only PHYSICAL STEEL in both paths'],
 ['ffZ3CBx2pIzPXKE3','DOES NOT PRINT COMBAT STAGE','explicitly prints COMBAT STAGE'],['fg5XPpmaao3GV9Fh','EACH SPECIFIC FOE ONLY ONCE PER SCENE','the same foe any number of times'],
 ['gsePGwVgjU3VgjIK','ONE TICK TEMPORARY HP','ONE HP HEALING'],['hKDt3x8jXspwaFA2','RANGED ONE-TARGET MOVES','all attacks'],['hLb7ocQlqnlM7BE7','SCENEx2/SELF','SCENE/SELF'],
 ['hOh1BF2Izda9i1Mu','DEFAULT five nonHP STAGES+1 AND gain1STAGE','ordinary stages+1 only'],['i8425lVaQaZt2U1H','count50percentMIN1','count100percentMIN0'],['i8425lVaQaZt2U1H','weakness-resistance-NOSTATS','damage includes stats']
];
for(const[id,from,to]of proseMutations)test('rejects refreshed-hash interpretation '+id+' '+from,()=>rejected(b=>prose(b,id,from,to),/independent source-semantic prose clause/));
const sourceMutations=[
 ['unit','core:430:move-line13','15+','19+','ironThreshold'],['unit','core:289:move-line36','Defense','Speed','wearStat'],['unit','core:330:ability-line13','+2 while','+1 while','snowOriginal'],
 ['unit','feb:8:ability-line76','\nScene\n','\nStatic\n','sipperOptionalFrequency'],['unit','core:328:ability-line68','damaging Grass','non-damaging Grass','sipperOriginalHit'],
 ['unit','core:406:move-line73','lowered 2','raised 2','screechSign'],['unit','core:398:move-line32','double the amount','halve the amount','sunnyGrowth'],
 ['unit','core:410:move-line68','negative','positive','sweetFloor'],['page','sep:4','+1 Evasion','+2 Evasion','shieldOptional'],
 ['unit','core:314:ability-line3','other than','including','competitiveExclusion'],['unit','core:305:capability-inflatable','125%','150%','inflatedPercent'],['unit','core:305:capability-inflatable','does not','does','inflatedWeight'],
 ['unit','core:429:move-line4','the user can','Weight Class was lowered','autotomizeConditional'],['unit','core:189:feature-line21','after the Blessing','before the Blessing','sageTiming'],
 ['unit','core:399:move-line75','At-Will','EOT','howlFrequency'],['page','core:105','7 or more injuries','6 or more injuries','hardenedSeven'],['page','core:105','one step further','two steps further','hardenedNine'],
 ['page','core:105','0 Hit Points or less','1 Hit Point or less','pressOnDoubling'],['page','core:214','Roll 1d100','Roll 1d20','captureRoll'],
 ['unit','throhs:59:feature-line3','next Weapon Attack','every Weapon Attack','aimWeapon'],['unit','core:324:ability-line66','after applying your Defenses','before applying your Defenses','multiscaleOriginalHalving'],
 ['unit','feb:7:ability-line40','one step further','half a step further','multiscaleOptional'],['unit','feb:9:ability-line15','sandy terrain','snowy terrain','sandOptional'],
 ['unit','throhs:44:move-line42','Special Attack on','Special Attack Combat Stage on','energyOmission'],['unit','feb:6:ability-line25','once per Scene','once per round','intimidateOnce'],
 ['unit','core:155:feature-line46','Temporary Hit Points','healing','adrenalineTemp'],['unit','core:312:ability-line19','Ranged, 1-Target','all','beamMoves'],
 ['native','YBWVC5IMxZYqnabl','Physical Steel-Type','all Steel-Type','blisteringPhysical'],['native','JO37oFyHv5GBPjbE','50%','100%','eclipseHazardCount'],['native','JO37oFyHv5GBPjbE','do not apply stats','apply stats','eclipseNoStats']
];
for(const[kind,id,from,to,key]of sourceMutations)test('rejects recomputed source meaning '+key,()=>rejected(b=>{
 const a=audit(b),u=(kind==='unit'?a.sourceDefinitions:kind==='page'?a.parentContexts:a.nativeContexts).find(u=>(kind==='native'?u.pageId:u.id)===id),field=kind==='unit'?'rawDefinition':'rawText',before=u[field];u[field]=before.replace(from,to);assert.notEqual(u[field],before);u.rawSha256=textHash(u[field]);a.sourceFacts=effectF3fSourceFacts(a,sourceReviewText);a.closure.sourcePrimitivesSemanticSha256=hash(Object.fromEntries(['sourceDefinitions','printedDefinitions','parentContexts','nativeContexts','sourceUnitRoles'].map(k=>[k,a[k]])));
},new RegExp('independent signed.*'+key)));
test('rejects Boolean normalization of literal Hardened string despite recomputed facts',()=>rejected(b=>{const a=audit(b);a.rootCurrentSystems['effects.ed6GkfPq9AmYTTnf'].rules[0].value=true;a.sourceFacts=effectF3fSourceFacts(a,sourceReviewText);},/independent signed.*Hardened literal string state/));
test('rejects a physical predicate invented in the broad Steel branch',()=>rejected(b=>{const a=audit(b);a.rootCurrentSystems['effects.fXsxr8akxM4wQfdy'].rules[5].predicate=['move:category:physical'];a.sourceFacts=effectF3fSourceFacts(a,sourceReviewText);},/independent signed.*Blistering broad/));
test('rejects an invented missing feat',()=>rejected(b=>{audit(b).targetSnapshots.find(s=>s.identity==='feats.yjDIVmsmUoOqC4Zc').document={name:'invented',system:{}};},/exact current target\/prior chronology/));
test('rejects body UUID navigation recast as executable Sunny application',()=>rejected(b=>{evidence(b,'cdt6QIX2JFQxhRft').incomingReferences[0].path='$.system.rules[0].uuid';},/exact outgoing\/incoming path/));
test('rejects UUID suffix corruption while the correct target remains',()=>rejected(b=>{evidence(b,'d6UryG8AFhTby6jQ').literalReferences[0].literalUuid+='other';},/literal\/page suffix/));
test('rejects typedTempHP reassigned as ordinary healing',()=>rejected(b=>{evidence(b,'gsePGwVgjU3VgjIK').typedCurrentRoles.at(-1).domain='healing';},/complete current rule\/role/));
test('rejects exact current root-system disagreement',()=>rejected(b=>{audit(b).rootCurrentSystems['effects.c01eM7WOC6z1pPt8'].duration.value=6;},/complete current fields changed/));
test('rejects retained current field changed in both duplicated arrays',()=>rejected(b=>{const r=row(b,'eKMSueJhHjN1MZMp'),f=r.fieldReview.find(f=>f.recordFieldPath==='system.duration');f.recordValue.value=20;f.recordJsonSha256=hash(f.recordValue);r.sourceComparison.fields=r.fieldReview;},/actual field\/hash\/status disagreement/));
test('rejects historical empty string weight subtraction normalized to1',()=>rejected(b=>{const h=evidence(b,'eO5ycOqENdnKlMiJ').exportLineage.snapshots.find(h=>h.historicalNormativeValues?.rules);h.historicalNormativeValues.rules[1].value=1;},/historical field\/omission/));
test('rejects historical half-step replaced by current1',()=>rejected(b=>{const h=evidence(b,'ed6GkfPq9AmYTTnf').exportLineage.snapshots.find(h=>h.historicalNormativeValues?.rules?.some(r=>r.path==='system.modifiers.resistanceSteps.mod'));h.historicalNormativeValues.rules.at(-1).value=1;},/historical field\/omission/));
test('rejects historical missing stackSlugs normalized tofalse',()=>rejected(b=>{evidence(b,'bwQniJ8g4OIydZsO').exportLineage.snapshots.find(h=>h.recordFound).historicalNormativeValues.stackSlugs=false;},/historical field\/omission/));
test('rejects own review presented as earlier evidence',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>s.identity==='effects.cdt6QIX2JFQxhRft');s.priorSourceReview=row(b,'cdt6QIX2JFQxhRft');s.priorReviewSemanticSha256=hash(s.priorSourceReview);},/exact current target\/prior chronology/));
test('rejects name-based whole-generation promotion of an untraced helper',()=>rejected(b=>{detail(b,'c01eM7WOC6z1pPt8').completeCurrentGenerationEstablished=true;},/unestablished generation cannot be promoted/));
test('rejects source comparison promoted to verified gameplay',()=>rejected(b=>{row(b,'bqiqznj14sIHOpBR').behavioralVerification='verified';},/source-derived assessment/));
test('rejects original source alternative removed from SapSipper trace',()=>rejected(b=>{detail(b,'crEfVwJadvsB2AqO').sourceDefinitionIds=detail(b,'crEfVwJadvsB2AqO').sourceDefinitionIds.filter(id=>id!=='core:328:ability-line68');},/per-ID complete source\/parent\/native trace/));

const earlierPayloadPins={"record-source-review/starter-dependencies.json":"9788624afb1b417314b60d555b44db35dd7daa0db61981b29facef0ef3900a64","record-source-review/reading-order-regressions.json":"fe03a646cc0a391072f07dd2f88ffc41c1d982c4840cafb4d0c3328bb590b572","record-source-review/known-exclusions.json":"a513ee1c408bff7adee0be8fca91d76f044489d09795c61842f47f326a248f95","record-source-review/form-branch-skills.json":"c03b8ae2c94312021473dc6861ad503b3af7b80b27f92480de065622563a08de","record-source-review/species-classic-early.json":"0f0a2373bf1fe6a9c2b5bed22f20edbedc66672c96f56f0d7927aa748e89964a","record-source-review/species-classic-middle.json":"55c4f791926444d18dcd01542101749f30f24469f5e7b50cb5e22647cc45374e","record-source-review/species-classic-late.json":"7a00e3eda8ea6585793815bddbb17b45833f34373fdbf1f29240ce4b95f44d7b","record-source-review/species-classic-final.json":"340680cd7723ce9a79ae2d30225b42239017a016d8dced61daffb3e96dbb5e86","record-source-review/species-regional.json":"0dfa0cfe3da337d0ca5c7bd70d31e48d39f2533e0aca3f8e9881b564ad7d79d7","record-source-review/species-scope.json":"43cd46a5ab888c590b7f59cb8dfd1e44798c4f21bef9630c59469fd64f28bec4","record-source-review/species-unmatched.json":"578c3c90b0a0de680023e89f913e1b9f54f2619d7dfd2877c14ba8aa2d8a7bea","record-source-review/abilities-core.json":"fe7805fe8ddd54c936c9b91bca8a2392d5285b29d1525de0b33d558d680f06af","record-source-review/abilities-packet.json":"38dc3f346497b42d974755a69962f45d9c706346c18ae59a3519960b4f921755","record-source-review/abilities-remaining.json":"260969fe7ee04c6a71a82d3ac8d7d9efcafff34a84dda047a8567fc868645927","record-source-review/moves-contest.json":"6ca6c78cda13020a8200b7aea3378d3ed2a92f47a54dab891e8e0c50908d2e6d","record-source-review/moves-anchored.json":"ccff9d89252604b3abae59b5c46d3d32b86cbc1c6c5cd4d88cde535367245678","record-source-review/moves-remaining.json":"f045ea975d2ade7a41b9dd09db8d4fc242d51faead3d0912a25fdd3d8349d8eb","record-source-review/edges.json":"f4030cae2b4fda2993dd0ca80a3ca48dd4a3a4b5c0846588b3bed37ece6f3494","record-source-review/pokemon-edges.json":"392a9be69f5e3f6d9ae4b6dcc6d7ceebe11a02ac4bc98b7db9b35e821d50b75e","record-source-review/features-core.json":"048171c57a0bb8ae8210fc3785c38b1bd7b8cf587d6e50a63be3d761b9a1b17f","record-source-review/features-supplemental.json":"151df633b7fa9cc185cbd3b0d6fd2ed4d605602c6aeec7f26e0bf3543868adf6","record-source-review/features-remaining.json":"3265059cc4af99f5a827b43486536c70d1121053cdec5f8cbcfb49d136ecb10e","record-source-review/capabilities.json":"eebbaecb943974923b9d4b87dcb937a7f054f9f763dbd2f8d95f570ed721ca2f","record-source-review/technical-machines.json":"3f8dfaff836fd917e130c3d4bc0dd8b2c7696d18dbb9f4418fe7efafcc615622","record-source-review/consumables.json":"79a8b65fcee951de4b0fe88e36148b0dbb8b7d7efe789b9c3e5adbc9ce8c9211","record-source-review/equipment.json":"1c01a0c62879d8c93ce34ce864ab389cf88b38d999be24d0f1ba3d6efe54c532","record-source-review/spirit-actions.json":"89e79ad81da75a4d4205dd5db197609b26e0a03fe750f2e2611c54e5b70d603f","record-source-review/conditions.json":"1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d","record-source-review/temporary-species.json":"fac63d37f6bd5560786efc5e814f807931d94ba13be573ad02835d3f002ac774","record-source-review/effects-other-a.json":"609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee","record-source-review/effects-other-b.json":"a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977","record-source-review/effects-other-c.json":"02dc039aba02e258720171a326e5aff9edefaa0280c0e15434c7a15f6778785c","record-source-review/effects-other-d.json":"bd55f1eba0f1bbe6f688ecc0b268910f8babfd1f0184c05db94a7429d94bd12b","record-source-review/effects-other-e.json":"4a85dab1c701fada5abfaafb370893b910ecd5bf4997703fd8704249b75ba35c"};
const earlierAuditPins={"ability-source-evidence.json":"29cc72e8f7c43ff5dfbd7ec61eec2f7125f5a5a5510dd272587d26b77ccb1ad2","move-source-evidence.json":"30933a00d3f09eb2295dea531eb4cf1ad8d0425485a51e96efbb5b14422f5b81","feature-source-evidence.json":"9b9508bfd5049fd6a18136359022eeb8353f6e27785247cf2a144aa27bb7bf5d","item-source-evidence.json":"cbb51491dd93924664674e366a3e3742ecd28c91cd90e725f14e076611d71b32","effect-source-evidence.json":"e0ec14cea2efeeae560accf82a9786ea48d8834fd3a251726dab2a748f134282","temporary-species-source-evidence.json":"f4224980b64fbccad4dc1206313393854dd1c835e5b8c5e4bf0391daaf3a3439","effect-source-evidence-f3a.json":"ffb59dfd1e254a002f57925933555aa6ae06977c6c9c03d00bff348eddf4de47","effect-source-evidence-f3b.json":"143b529579056fd9e0da7af7e42f232b9c8959a68341cb8927589109741418ad","effect-source-evidence-f3c.json":"344cb5bc93c0f4aae6df66784e9e6f0876a236beb528a952cf85b0de83926e33","effect-source-evidence-f3d.json":"8d70a8a0c3cf7a8fa076f4366f7dbf678b33bc3cba283c5075b4b861c5639338","effect-source-evidence-f3e.json":"f10f13fa89c7057982102fa5d27db4d71f4186d0958c41eb31fdaa74a8fcbaee"};
const earlierAudits=Object.fromEntries(await Promise.all(Object.keys(earlierAuditPins).map(async p=>[p,JSON.parse(await readFile(new URL('../docs/data/'+p,import.meta.url),'utf8'))])));
test('all34 earlier payloads/11 whole audits, nonF metadata and originalF membership stay fixed',()=>{
 assert.equal(Object.keys(earlierPayloadPins).length,34);assert.equal(Object.keys(earlierAuditPins).length,11);
 for(const[p,h]of Object.entries(earlierPayloadPins))assert.equal(hash(base.files[p]),h,p);
 for(const[p,h]of Object.entries(earlierAuditPins))assert.equal(hash(earlierAudits[p]),h,p);
 const f=base.batchManifest.batches.find(b=>b.id==='F');assert.equal(f.membershipSha256,'791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6');
 assert.equal(hash(base.batchManifest.batches.filter(b=>b.id!=='F')),'c8523e7b53b8c8b2b2956f80a6a9252eb8f8f42af6f42868a3358af86519deed');
});
