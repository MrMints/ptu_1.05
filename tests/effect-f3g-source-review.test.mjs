import test from 'node:test';
import assert from 'node:assert/strict';
import {assertFullFSourceAccepted} from './helpers/full-f-acceptance.mjs';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectF3gSourceReview,effectF3gSourceFacts,effectF3gFactErrors,effectF3gSourceSpecifications} from '../tools/effect-f3g-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';
const base=await loadRecordSourceReview(),file='record-source-review/effects-other-g.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const audit=b=>b.effectSlices.find(a=>a.slice==='F3g'),row=(b,id)=>b.files[file].records.find(r=>r.identity===`effects.${id}`),detail=(b,id)=>row(b,id).sourceComparison.effectReview;
const evidence=(b,id)=>audit(b).currentRecordAudit[`effects.${id}`];
function errors(b){const out=[];checkEffectF3gSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:()=>{}});return out;}
function clone(){return {...base,files:{...base.files,[file]:structuredClone(base.files[file])},effectSlices:base.effectSlices.map(a=>a.slice==='F3g'?structuredClone(a):a)};}
function tamper(change){
 const b=clone();change(b);
 for(const r of b.files[file].records){const e=audit(b).currentRecordAudit[r.identity];e.dispositionEvidenceSha256=hash(r);e.examinationSha256=hash(r.sourceComparison.effectReview);}
 audit(b).closure.recordEvidenceSemanticSha256=hash(b.files[file]);
 audit(b).closure.examinedDispositionsSemanticSha256=hash(b.files[file].records.map(r=>({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,generationReview:r.generationReview,examination:r.sourceComparison.effectReview})));
 audit(b).closure.sourcePrimitivesSemanticSha256=hash(Object.fromEntries(['sourceDefinitions','printedDefinitions','parentContexts','nativeContexts','sourceUnitRoles'].map(k=>[k,audit(b)[k]])));
 audit(b).closure.historicalObservationsSemanticSha256=hash(Object.entries(audit(b).currentRecordAudit).map(([identity,e])=>({identity,exportLineage:e.exportLineage})));
 return errors(b);
}
function prose(b,id,from,to){const r=row(b,id),d=detail(b,id),before=d.specificAssessment;d.specificAssessment=before.replace(from,to);assert.notEqual(d.specificAssessment,before,`fixture ${id}: ${from}`);r.ruleVersionReview.basis=d.specificAssessment;if(r.missingEvidence)r.missingEvidence.neededArtifact=d.specificAssessment;}
const rejected=(change,re)=>assert.ok(tamper(change).some(e=>re.test(e)));

test('historical checkpoint remains bounded after full-F acceptance: only60 F3g source examinations close;399 F stay outside its closure and no later work starts',()=>{
 assert.deepEqual(errors(base),[]);const f=base.batchManifest.batches.find(b=>b.id==='F');
 assertFullFSourceAccepted(f);assert.equal(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g'].includes(s.id)).reduce((n,s)=>n+s.records,0),399);
 assert(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g','F3h','F4a','F4b','F4c','F4d'].includes(s.id)).every(s=>!s.recordFile&&s.status==='not-started'));
 assert.deepEqual(audit(base).closure.counts,{reviewed:22,unresolved:38});assert.equal(audit(base).closure.fullFAcceptance,false);assert.equal(base.index.coverage.completeAddressableClassification,false);
 // Normalize only the assigned F3h, F4a, F4b, F4c and F4d records to retain the accepted F3g census.
 const acceptedCounts={...base.index.coverage.counts},later=[...base.files['record-source-review/effects-other-h.json'].records,...base.files['record-source-review/references-a.json'].records,...base.files['record-source-review/references-b.json'].records,...base.files['record-source-review/references-c.json'].records,...base.files['record-source-review/references-d.json'].records];
 for(const r of later)acceptedCounts[r.coverageState]--;acceptedCounts.unreviewed+=later.length;
 assert.deepEqual(acceptedCounts,{reviewed:3111,excluded:123,unresolved:3515,unreviewed:646});
});
test('complete source/current/relationship/native/history census retains all literal paths',()=>{
 const a=audit(base);assert.equal(a.sourceDefinitions.length,57);assert.equal(a.parentContexts.length,61);assert.equal(a.nativeContexts.length,8);assert.equal(a.nativeContextEmbeds.length,3);assert.equal(a.targetSnapshots.length,118);assert(a.targetSnapshots.every(s=>s.document));assert.equal(a.pageTargets.length,7);assert(a.pageTargets.every(p=>p.pageFound));
 assert.equal(Object.keys(a.rootCurrentSystems).length,60);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.currentRules.length,0),99);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.references.length,0),11);assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.incomingReferences.length,0),59);
 const h=Object.values(a.currentRecordAudit).flatMap(e=>e.exportLineage.snapshots);assert.equal(h.length,240);assert.equal(h.filter(h=>h.recordFound).length,18);assert.deepEqual([0,1,2,3].map(i=>Object.values(a.currentRecordAudit).filter(e=>e.exportLineage.snapshots[i].recordFound).length),[2,4,6,6]);
});
test('printed omissions and complete original boxed Songs are facts, not extraction defaults',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(effectF3gFactErrors(f),[]);assert.equal(f.sourceBoundaries.bubbleAmountOrStagePrinted,false);assert.deepEqual(f.observations.bubbleDB.values,['8']);assert.deepEqual(f.currentObservations.bubbleDB,['7','7']);
 assert.match(f.observations.songUser.clause,/always affect the user/);assert.deepEqual(f.observations.songActions.values,['two','4']);assert.deepEqual(f.observations.songMight.values,['1','5']);
});
test('Sage rank/Tick maximum, three-use stacking exception and manual zero remain separate',()=>{
 const f=audit(base).sourceFacts;assert.match(f.observations.sageMaximum.clause,/whichever is higher/);assert.deepEqual(f.observations.sageExceptionFrequency.values,['3']);assert.match(f.observations.sageStackException.clause,/may stack/);
 assert(f.currentObservations.sageRules.every(r=>r.value==='max(floor({actor|system.health.total}/10),0)'));assert.match(f.currentObservations.sageBody,/edit the last 0/);
 assert.match(detail(base,'lQBCt9nEw2ZElij1').specificAssessment,/SCENEX3\/FREE.*STACKING/);
});
test('signed paths and damage versus DB roles preserve actual static contradictions',()=>{
 const c=audit(base).sourceFacts.currentObservations;assert.equal(c.filletBody,'+1 Atk CS, +1 Def CS, +1 Spd CS');assert.deepEqual(c.filletRules.map(r=>r.path),['system.stats.atk.stage.mod','system.stats.spatk.stage.mod','system.stats.spd.stage.mod']);assert(c.filletRules.every(r=>r.value===2));
 assert.equal(c.justifiedPath,'system.stats.atk.stages.mod');assert.equal(c.terrainRule.selectors,'electric-damage-base');assert.equal(c.terrainRule.value,2);assert.deepEqual(audit(base).sourceFacts.observations.terrainDamage.values,['10']);
 assert(c.speedDR.every(r=>r.value==='@actor.system.stats.spd.total'));assert.match(audit(base).sourceFacts.observations.electroDefender.clause,/both their Special Defense and Speed/);
});
test('EsperWing reference is Speed gain while the executable path reaches VCreate losses',()=>{
 const c=audit(base).sourceFacts.currentObservations;assert.equal(c.esperReference,'Compendium.ptu.effects.Item.o5wKWO9OtUvgm6NO');assert.equal(c.esperExecutable.uuid,'Compendium.ptu.effects.Item.aHbD8Xyqg3NIVJXY');assert.equal(c.esperExecutable.affects,'origin');assert(c.esperActualTarget.every(r=>r.mode==='subtract'&&r.value===1));
 assert.equal(audit(base).sourceFacts.unresolvedExecution.reproducedGameplayFailure,false);
});
test('cold weather source alternatives/manual notes are distinct from fixed stored modifiers',()=>{
 const f=audit(base).sourceFacts;assert.deepEqual(f.observations.snowyCrit.values,['19-20','2']);assert.deepEqual(f.observations.whiteoutCrit.values,['18-20','3']);assert.deepEqual(f.observations.hailstormFreeze.values,['19','1']);assert.deepEqual(f.observations.whiteoutFreeze.values,['18','2']);assert.deepEqual(f.manualWeatherNotes,{hailstorm:2,whiteout:3});
 assert.deepEqual([f.currentObservations.snowyRules[0].value,f.currentObservations.hailstormRules[0].value,f.currentObservations.whiteoutRules[0].value],[1,1,2]);
});
test('prior chronology includes accepted F3f but excludes own and future F3h/H',()=>{
 const ids=priorSourceIdentities(base.batchManifest,'F','F3g'),f=base.batchManifest.batches.find(b=>b.id==='F');assert(ids.has('effects.eR9gulcKs9v9SF8V'));assert(!ids.has('effects.iA0lJV2Ftpscl6aB'));assert(!ids.has(f.slices.find(s=>s.id==='F3h').members[0][0]));assert(!ids.has(base.batchManifest.batches.find(b=>b.id==='H').members[0][0]));
});
test('same-ID history preserves eighteen omitted stackSlugs as null',()=>{
 const h=Object.values(audit(base).currentRecordAudit).flatMap(e=>e.exportLineage.snapshots).filter(s=>s.recordFound);assert.equal(h.length,18);assert(h.every(s=>s.historicalNormativeValues.stackSlugs===null));assert.equal(h.reduce((n,s)=>n+s.fieldComparisons.length,0),324);
});

function sourceHolder(a,kind,id){const key=kind==='unit'?'rawDefinition':'rawText',row=kind==='unit'?a.sourceDefinitions.find(u=>u.id===id):kind==='page'?a.parentContexts.find(p=>p.id===id):a.nativeContexts.find(p=>p.pageId===id);assert(row,id);return{row,key};}
const qualitative={benedictionTiming:['after','before'],electroAttacker:['in addition to','instead of'],electroDefender:['both','only'],tailwindNoStack:['cannot stack','may stack'],hailOriginalTick:['beginning','end'],sageMaximum:['whichever is higher','whichever is lower'],sageNoStack:['do not stack','always stack'],sageStackException:['may stack','cannot stack'],hailstormHazards:['Spikes and Stealth Rock','All Hazards'],whiteoutNonIce:['non-Ice','Ice'],whiteoutWater:['Damaging','All'],whiteoutHazards:['All Hazards','Spikes'],forecastReset:['foggy','Sunny'],bloomAppearance:['Sunny','Rainy'],terrainGrounded:['touching the ground','airborne'],justifiedOptional:['or Attack of Opportunity','only during a Dark Move'],songUser:['always affect','never affect']};
test('normalizing source transport alone does not change semantic facts',()=>{
 const a=structuredClone(audit(base));for(const[,kind,id]of effectF3gSourceSpecifications){const{row,key}=sourceHolder(a,kind,id);row[key]=sourceReviewText(row[key]);}
 assert.deepEqual(effectF3gFactErrors(effectF3gSourceFacts(a,sourceReviewText)),[]);
});
for(const[key,kind,id,re]of effectF3gSourceSpecifications)test(`rejects changed raw source meaning: ${key}`,()=>{
 rejected(b=>{const a=audit(b),h=sourceHolder(a,kind,id),clean=sourceReviewText(h.row[h.key]),match=clean.match(re);assert(match,`source fixture ${key}`);let changed;
  if(qualitative[key]){const[from,to]=qualitative[key];changed=match[0].replace(from,to);}else{assert(match[1],`numeric fixture ${key}`);changed=match[0].replace(match[1],match[1]==='two'?'three':match[1]==='EOT'?'At-Will':match[1]==='17-20'?'17-19':match[1]==='19-20'?'18-20':'99');}
  assert.notEqual(changed,match[0],key);h.row[h.key]=clean.replace(match[0],changed);h.row.rawSha256=textHash(h.row[h.key]);a.sourceFacts=effectF3gSourceFacts(a,sourceReviewText);
 },/independent signed\/recipient\/trigger\/timing\/typed-unit source facts changed/);
});

const proseMutations=[
 ['iA0lJV2Ftpscl6aB','USER ATTACK1','TARGET ATTACK1'],['iEqWJwbrNV48sAXB','SCENE/SWIFT','SCENE/STANDARD'],['iHia9ZGQYY02FmCk','not direct damage2','direct damage2'],
 ['iMEih8csttUKHcVd','EPHEMERAL TO ORIGIN','PERSISTENT TO EVERYONE'],['iMqiaI1FNcjldpWk','WITHIN3METERS','WITHIN10METERS'],['iNfiGKyKNYhNWRBi','AFTER BOTH BLESSING AND TRIGGERING ATTACK RESOLVE','BEFORE THE BLESSING'],
 ['ibXN762EDR6GmwAK','ALLIES WITHIN3METERS','FOES WITHIN5METERS'],['ioB998hEO5qD4Bum','duration100 ENCOUNTERS','duration1 ROUND'],['ivcFORwpOWT0PAwd','WATER DB+2/FIRE DB-2','WATER DAMAGE+2/FIRE DAMAGE-2'],
 ['kHGvVHRG6TqNt7op','SUBTRACTS BOTH SPECIALDEFENSE AND SPEED','SUBSTITUTES SPEED FOR SPECIALDEFENSE'],['kPWQIe8hEv6JIfEw','HIGHER TARGET ATTACK OR SPECIALATTACK','TARGET ATTACK ONLY'],
 ['kPy5nQeKyYsCBrZv','EPHEMERAL TO TARGET','PERSISTENT TO ORIGIN'],['kQdPof3rxBVN6BiS','MULTIPLE INSTANCES CANNOT STACK','ALL INSTANCES STACK'],['kSiliSDfQ3w7MNPW','ONE ADJACENT ALLY','ALL ALLIES ON THE FIELD'],
 ['kdMo2CqufGgmJUyg','EXISTING EXTENDED CRIT RANGE+2','EXISTING EXTENDED CRIT RANGE+1'],['kjC2cYH3BwlhXga6','OMITS THE AMOUNT AND COMBAT-STAGE UNIT','PRINTS ONE COMBAT STAGE'],
 ['lJCquXHCivdCMsZp','BODY/SNIPPET say ATTACK/DEFENSE/SPEED1','BODY/SNIPPET say ATTACK/SPECIALATTACK/SPEED2'],['lQBCt9nEw2ZElij1','permits STACKING','forbids all STACKING'],
 ['llEEyZBsfTIiPLxv','EVEN-NUMBERED ROLLS','ODD-NUMBERED ROLLS'],['lwfzwWniBPCUy4Lm','EXISTING FREEZE+1','EXISTING FREEZE+2'],['lyGTa3a3oLvpX3t9','DAMAGING WATER AS ICE','ALL WATER AS ICE'],
 ['mDpTmAZRYjaS0uNs','USER PRIMARY TYPE','MOVE PRIMARY TYPE'],['mHxISV2xM8XfmSIJ','not three stacked benefits','three stacked benefits'],['mMr9GOhuO4YM0v5o','UNCONDITIONAL FIRE ARRAY','SUN-PREDICATED FIRE ARRAY'],
 ['miokClfWX2SW58kc','OPEN PINK FLOWER IN SUNNY','OPEN PINK FLOWER IN RAIN'],['n1GqXEIcRzrAtMli','AGAINST VOLATILE AFFLICTIONS','AGAINST ALL CONDITIONS'],
 ['n3v7hO3picQOgFNY','ON MISS','ON HIT'],['nDEV77l0d4x7pnIz','EVEN-NUMBERED ROLL','ODD-NUMBERED ROLL'],['nOd3v02f918iW2aV','stores AC2','stores AC3'],
 ['nlFYpVcKOUob2cBS','negative helper SUBTRACTS1','negative helper ADDS1'],['o5wKWO9OtUvgm6NO','actual ApplyEffect goes to aHbD8Xyqg3NIVJXY','actual ApplyEffect goes to o5wKWO9OtUvgm6NO'],
 ['o6ScOYInR7tlYlA9','END OF USER NEXT TURN','START OF USER NEXT TURN'],['oEJCJK91P8dzHas4','USER DEFENSE1 AND SPECIALDEFENSE1','TARGET DEFENSE1 AND SPECIALDEFENSE1'],
 ['oMC7M6N3hUs3m1eG','DAMAGE ROLLS+10','DAMAGEBASE+2'],['oWoo3iPRRLEUYkZU','PLURAL system.stats.atk.stages.mod','SINGULAR system.stats.atk.stage.mod'],
 ['olm2VRK6NeZrRmHs','ALL ALLIES IN BURST1','ALL CREATURES IN BURST1'],['oy9yit4Z1FNnQZSo','UNTIL END OF USER NEXT TURN','UNTIL END OF RECIPIENT NEXT TURN'],
 ['pJWwZt4iBDBNd0U2','SONGS ALWAYS AFFECT USER','SONGS NEVER AFFECT USER'],['pOAH4kjw9zTft5k2','ATWILL rather than originalEOT','ATWILL matching originalATWILL'],
 ['psUtSPNbj7U8siCT','ALL LEGAL TARGETS ON16+','ONE TARGET ON18+'],['qB11qo6ylw2GV8bX','IF NOT SUNNY','ALWAYS'],['qVxU03cPaURRvWbA','UPPER BOUND20','NO UPPER BOUND'],
 ['qh5v2VAjp8YFIUT5','BOTH SHINY/NONSHINY the SAME NONSHINY sprite','DIFFERENT SHINY/NONSHINY sprites']
];
for(const[id,from,to]of proseMutations)test(`rejects refreshed-hash semantic assessment mutation: ${id}`,()=>rejected(b=>prose(b,id,from,to),/independent source-semantic prose clause changed/));

test('rejects native cold manual note removed despite refreshed source hashes',()=>rejected(b=>{const n=audit(b).nativeContexts.find(n=>n.pageId==='FTqtnKvnn0QYJjHC');n.rawText=n.rawText.replace('This part of the effect is not Automated!','Fully automated');audit(b).sourceFacts=effectF3gSourceFacts(audit(b),sourceReviewText);},/independent signed\/recipient\/trigger/));
test('rejects raw Snowy existing critical-range alternative reduced to the base modifier',()=>rejected(b=>{const a=audit(b),n=a.nativeContexts.find(n=>n.pageId==='ZYjNu2vxlx8lAGBt');n.rawText=n.rawText.replace('+2','+1');a.sourceFacts=effectF3gSourceFacts(a,sourceReviewText);},/independent signed\/recipient\/trigger/));
test('rejects raw Whiteout existing critical-range alternative despite refreshed hashes',()=>rejected(b=>{const a=audit(b),n=a.nativeContexts.find(n=>n.pageId==='2C7HSokfWnJFysjJ');n.rawText=n.rawText.replace('+3','+2');a.sourceFacts=effectF3gSourceFacts(a,sourceReviewText);},/independent signed\/recipient\/trigger/));
test('rejects raw Hailstorm broad Steel Freeze without the physical qualifier',()=>rejected(b=>{const a=audit(b),n=a.nativeContexts.find(n=>n.pageId==='FTqtnKvnn0QYJjHC');n.rawText=n.rawText.replace('Physical Steel-Type','Steel-Type');a.sourceFacts=effectF3gSourceFacts(a,sourceReviewText);},/independent signed\/recipient\/trigger/));
test('rejects changed Sage stacking-exception frequency in refreshed-hash prose',()=>rejected(b=>prose(b,'lQBCt9nEw2ZElij1','SCENEX3/FREE','SCENEX2/FREE'),/independent source-semantic prose clause/));
test('rejects source assessment promoted to verified gameplay',()=>rejected(b=>{row(b,'iA0lJV2Ftpscl6aB').behavioralVerification='verified';},/source-derived assessment/));
test('rejects whole F acceptance from a bounded source slice',()=>rejected(b=>{audit(b).closure.fullFAcceptance=true;},/bounded closure/));
test('rejects name-based whole-generation promotion',()=>rejected(b=>{detail(b,'lJCquXHCivdCMsZp').completeCurrentGenerationEstablished=true;},/source-derived assessment|unestablished generation/));
test('rejects invented canonical counterpart',()=>rejected(b=>{detail(b,'qB11qo6ylw2GV8bX').canonicalRelationshipClaim=true;},/source-derived assessment/));
test('rejects missing original Justified alternative in a selected-version trace',()=>rejected(b=>{const d=detail(b,'oWoo3iPRRLEUYkZU');d.sourceDefinitionIds=d.sourceDefinitionIds.filter(id=>id!=='core:321:ability-line70');},/per-ID complete source\/parent\/native trace/));
test('rejects incoming producer path changed while the target ID remains',()=>rejected(b=>{evidence(b,'iA0lJV2Ftpscl6aB').incomingReferences[0].path='$.system.invalid';},/exact outgoing\/incoming path/));
test('rejects nested Frozen target identity substitution',()=>rejected(b=>{const r=evidence(b,'lwfzwWniBPCUy4Lm').references.find(r=>r.targetIdentity==='effects.7F4dkJoDuD7wNcEK');assert(r.nestedReferences.length);r.nestedReferences[0].targetIdentity='effects.iA0lJV2Ftpscl6aB';},/exact nested reference/));
test('rejects literal page suffix changed independently of the enclosing journal',()=>rejected(b=>{evidence(b,'ivcFORwpOWT0PAwd').pageReferences[0].pageId='ZYjNu2vxlx8lAGBt';},/literal\/page suffix/));
test('rejects missing-versus-false historical stackSlugs normalization',()=>rejected(b=>{const h=evidence(b,'miokClfWX2SW58kc').exportLineage.snapshots.find(s=>s.recordFound);h.historicalNormativeValues.stackSlugs=false;},/historical field\/omission/));
test('rejects current field comparison hash changed inside same-ID history',()=>rejected(b=>{const h=evidence(b,'pJWwZt4iBDBNd0U2').exportLineage.snapshots.find(s=>s.recordFound);h.fieldComparisons[0].currentJsonSha256=hash('fabricated');},/historical field\/omission/));
test('rejects prior review rewritten with a refreshed prior hash',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>s.priorSourceReview);s.priorSourceReview.behavioralVerification='verified';s.priorReviewSemanticSha256=hash(s.priorSourceReview);},/target\/prior chronology/));
test('rejects relative Snow page embedding lost from complete native context',()=>rejected(b=>{audit(b).nativeContextEmbeds.pop();},/literal relative native embed\/page-ID\/hash/));

const earlierPayloadPins={"record-source-review/starter-dependencies.json":"9788624afb1b417314b60d555b44db35dd7daa0db61981b29facef0ef3900a64","record-source-review/reading-order-regressions.json":"fe03a646cc0a391072f07dd2f88ffc41c1d982c4840cafb4d0c3328bb590b572","record-source-review/known-exclusions.json":"a513ee1c408bff7adee0be8fca91d76f044489d09795c61842f47f326a248f95","record-source-review/form-branch-skills.json":"c03b8ae2c94312021473dc6861ad503b3af7b80b27f92480de065622563a08de","record-source-review/species-classic-early.json":"0f0a2373bf1fe6a9c2b5bed22f20edbedc66672c96f56f0d7927aa748e89964a","record-source-review/species-classic-middle.json":"55c4f791926444d18dcd01542101749f30f24469f5e7b50cb5e22647cc45374e","record-source-review/species-classic-late.json":"7a00e3eda8ea6585793815bddbb17b45833f34373fdbf1f29240ce4b95f44d7b","record-source-review/species-classic-final.json":"340680cd7723ce9a79ae2d30225b42239017a016d8dced61daffb3e96dbb5e86","record-source-review/species-regional.json":"0dfa0cfe3da337d0ca5c7bd70d31e48d39f2533e0aca3f8e9881b564ad7d79d7","record-source-review/species-scope.json":"43cd46a5ab888c590b7f59cb8dfd1e44798c4f21bef9630c59469fd64f28bec4","record-source-review/species-unmatched.json":"578c3c90b0a0de680023e89f913e1b9f54f2619d7dfd2877c14ba8aa2d8a7bea","record-source-review/abilities-core.json":"fe7805fe8ddd54c936c9b91bca8a2392d5285b29d1525de0b33d558d680f06af","record-source-review/abilities-packet.json":"38dc3f346497b42d974755a69962f45d9c706346c18ae59a3519960b4f921755","record-source-review/abilities-remaining.json":"260969fe7ee04c6a71a82d3ac8d7d9efcafff34a84dda047a8567fc868645927","record-source-review/moves-contest.json":"6ca6c78cda13020a8200b7aea3378d3ed2a92f47a54dab891e8e0c50908d2e6d","record-source-review/moves-anchored.json":"ccff9d89252604b3abae59b5c46d3d32b86cbc1c6c5cd4d88cde535367245678","record-source-review/moves-remaining.json":"f045ea975d2ade7a41b9dd09db8d4fc242d51faead3d0912a25fdd3d8349d8eb","record-source-review/edges.json":"f4030cae2b4fda2993dd0ca80a3ca48dd4a3a4b5c0846588b3bed37ece6f3494","record-source-review/pokemon-edges.json":"392a9be69f5e3f6d9ae4b6dcc6d7ceebe11a02ac4bc98b7db9b35e821d50b75e","record-source-review/features-core.json":"048171c57a0bb8ae8210fc3785c38b1bd7b8cf587d6e50a63be3d761b9a1b17f","record-source-review/features-supplemental.json":"151df633b7fa9cc185cbd3b0d6fd2ed4d605602c6aeec7f26e0bf3543868adf6","record-source-review/features-remaining.json":"3265059cc4af99f5a827b43486536c70d1121053cdec5f8cbcfb49d136ecb10e","record-source-review/capabilities.json":"eebbaecb943974923b9d4b87dcb937a7f054f9f763dbd2f8d95f570ed721ca2f","record-source-review/technical-machines.json":"3f8dfaff836fd917e130c3d4bc0dd8b2c7696d18dbb9f4418fe7efafcc615622","record-source-review/consumables.json":"79a8b65fcee951de4b0fe88e36148b0dbb8b7d7efe789b9c3e5adbc9ce8c9211","record-source-review/equipment.json":"1c01a0c62879d8c93ce34ce864ab389cf88b38d999be24d0f1ba3d6efe54c532","record-source-review/spirit-actions.json":"89e79ad81da75a4d4205dd5db197609b26e0a03fe750f2e2611c54e5b70d603f","record-source-review/conditions.json":"1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d","record-source-review/temporary-species.json":"fac63d37f6bd5560786efc5e814f807931d94ba13be573ad02835d3f002ac774","record-source-review/effects-other-a.json":"609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee","record-source-review/effects-other-b.json":"a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977","record-source-review/effects-other-c.json":"02dc039aba02e258720171a326e5aff9edefaa0280c0e15434c7a15f6778785c","record-source-review/effects-other-d.json":"bd55f1eba0f1bbe6f688ecc0b268910f8babfd1f0184c05db94a7429d94bd12b","record-source-review/effects-other-e.json":"4a85dab1c701fada5abfaafb370893b910ecd5bf4997703fd8704249b75ba35c","record-source-review/effects-other-f.json":"35e29b488894674e134d3542f1e1773ccde0fd9b0caacba9835a5409fccccb6b"};
const earlierAuditPins={"ability-source-evidence.json":"29cc72e8f7c43ff5dfbd7ec61eec2f7125f5a5a5510dd272587d26b77ccb1ad2","move-source-evidence.json":"30933a00d3f09eb2295dea531eb4cf1ad8d0425485a51e96efbb5b14422f5b81","feature-source-evidence.json":"9b9508bfd5049fd6a18136359022eeb8353f6e27785247cf2a144aa27bb7bf5d","item-source-evidence.json":"cbb51491dd93924664674e366a3e3742ecd28c91cd90e725f14e076611d71b32","effect-source-evidence.json":"e0ec14cea2efeeae560accf82a9786ea48d8834fd3a251726dab2a748f134282","temporary-species-source-evidence.json":"f4224980b64fbccad4dc1206313393854dd1c835e5b8c5e4bf0391daaf3a3439","effect-source-evidence-f3a.json":"ffb59dfd1e254a002f57925933555aa6ae06977c6c9c03d00bff348eddf4de47","effect-source-evidence-f3b.json":"143b529579056fd9e0da7af7e42f232b9c8959a68341cb8927589109741418ad","effect-source-evidence-f3c.json":"344cb5bc93c0f4aae6df66784e9e6f0876a236beb528a952cf85b0de83926e33","effect-source-evidence-f3d.json":"8d70a8a0c3cf7a8fa076f4366f7dbf678b33bc3cba283c5075b4b861c5639338","effect-source-evidence-f3e.json":"f10f13fa89c7057982102fa5d27db4d71f4186d0958c41eb31fdaa74a8fcbaee","effect-source-evidence-f3f.json":"a271827bbfeb79558aa8a09293a47e2ae255721eaf450608eb4e698aed808612"};
const earlierAudits=Object.fromEntries(await Promise.all(Object.keys(earlierAuditPins).map(async p=>[p,JSON.parse(await readFile(new URL('../docs/data/'+p,import.meta.url),'utf8'))])));
test('all35 earlier payloads/12 whole audits and exact nonF/otherF metadata stay fixed',()=>{
 assert.equal(Object.keys(earlierPayloadPins).length,35);assert.equal(Object.keys(earlierAuditPins).length,12);
 for(const[p,h]of Object.entries(earlierPayloadPins))assert.equal(hash(base.files[p]),h,p);
 for(const[p,h]of Object.entries(earlierAuditPins))assert.equal(hash(earlierAudits[p]),h,p);
 const f=base.batchManifest.batches.find(b=>b.id==='F');assert.equal(f.membershipSha256,'791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6');
 assert.equal(hash(base.batchManifest.batches.filter(b=>b.id!=='F')),"c8523e7b53b8c8b2b2956f80a6a9252eb8f8f42af6f42868a3358af86519deed");
 assert.equal(hash(f.slices.filter(s=>s.id!=='F3g').map(s=>{if(!['F3h','F4a','F4b','F4c','F4d'].includes(s.id))return s;const original={...s,status:'not-started',closure:null};delete original.recordFile;return original;})),"02005090fcf16fd8dfb51f0508878b56739478cfb869847aad2057c3919961d9");
});
