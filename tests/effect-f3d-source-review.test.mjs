import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectF3dSourceReview,effectF3dSourceFacts,effectF3dFactErrors} from '../tools/effect-f3d-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';

const base=await loadRecordSourceReview(),file='record-source-review/effects-other-d.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const audit=b=>b.effectSlices.find(a=>a.slice==='F3d'),row=(b,id)=>b.files[file].records.find(r=>r.identity===`effects.${id}`),detail=(b,id)=>row(b,id).sourceComparison.effectReview;
const evidence=(b,id)=>audit(b).currentRecordAudit[`effects.${id}`];
function errors(b){const out=[];checkEffectF3dSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:()=>{}});return out;}
function tamper(change){
    const b={...base,files:{...base.files,[file]:structuredClone(base.files[file])},effectSlices:base.effectSlices.map(a=>a.slice==='F3d'?structuredClone(a):a)};
    change(b);
    for(const r of b.files[file].records){const e=audit(b).currentRecordAudit[r.identity];e.dispositionEvidenceSha256=hash(r);e.examinationSha256=hash(r.sourceComparison.effectReview);}
    audit(b).closure.recordEvidenceSemanticSha256=hash(b.files[file]);
    audit(b).closure.examinedDispositionsSemanticSha256=hash(b.files[file].records.map(r=>({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,generationReview:r.generationReview,examination:r.sourceComparison.effectReview})));
    return errors(b);
}
function prose(b,id,change){const r=row(b,id),d=detail(b,id),before=d.specificAssessment;d.specificAssessment=change(before);assert.notEqual(d.specificAssessment,before);r.ruleVersionReview.basis=d.specificAssessment;if(r.missingEvidence)r.missingEvidence.neededArtifact=d.specificAssessment;}
const rejected=(change,pattern)=>assert.ok(tamper(change).some(e=>pattern.test(e)));

test('F3d closes only its60 frozen source examinations;579 remain outside its closure and prior F3c stays whole',()=>{
    assert.deepEqual(errors(base),[]);
    const f=base.batchManifest.batches.find(b=>b.id==='F');
    assert.equal(f.status,'in-progress');assert.equal(f.acceptance.status,'pending-substantive-review');
    assert.equal(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d'].includes(s.id)).reduce((n,s)=>n+s.records,0),579);
    assert(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g','F3h','F4a','F4b'].includes(s.id)).every(s=>s.status==='not-started'&&!s.recordFile));
    assert.deepEqual(audit(base).closure.counts,{reviewed:31,unresolved:29});assert.equal(audit(base).closure.fullFAcceptance,false);
    assert.equal(base.index.coverage.completeAddressableClassification,false);
    assert.equal(hash(base.files['record-source-review/effects-other-c.json']),'02dc039aba02e258720171a326e5aff9edefaa0280c0e15434c7a15f6778785c');
    assert.equal(hash(base.files['record-source-review/effects-other-b.json']),'a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977');
});
test('complete source/current/relationship/history census is literal and bounded',()=>{
    const a=audit(base);assert.equal(a.sourceDefinitions.length,75);assert.equal(a.parentContexts.length,97);assert.equal(a.nativeContexts.length,5);
    assert.equal(a.targetSnapshots.length,133);assert.equal(a.pageTargets.length,4);assert(a.pageTargets.every(p=>p.pageFound));
    assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.currentRules.length,0),106);
    assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.references.length,0),13);
    assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.incomingReferences.length,0),76);
    const histories=Object.values(a.currentRecordAudit).flatMap(e=>e.exportLineage.snapshots);
    assert.equal(histories.length,240);assert.equal(histories.filter(h=>h.recordFound).length,14);
    assert.deepEqual([0,1,2,3].map(i=>Object.values(a.currentRecordAudit).filter(e=>e.exportLineage.snapshots[i].recordFound).length),[1,3,5,5]);
    assert(histories.filter(h=>h.recordFound).every(h=>h.historicalNormativeValues.stackSlugs===null));
});
test('source consequences keep signed stages, recipients and phase/threshold qualifiers',()=>{
    const f=audit(base).sourceFacts;assert.deepEqual(effectF3dFactErrors(f),[]);assert.equal(Object.keys(f.moveConsequences).length,19);
    assert.equal(f.moveConsequences['core:380:move-line36'].signedDelta,3);assert.equal(f.moveConsequences['core:414:move-line34'].signedDelta,-2);
    assert.match(f.moveConsequences['core:407:move-line85'].recipientRole,/Set-Up/);assert.match(f.moveConsequences['core:434:move-line3'].qualifier,/Even/);
    assert.equal(f.sing.evasionDelta,-2);assert.match(f.sing.endpoint,/user's next turn/);
});
test('legacy bound field retains2 with its unit and never implies execution',()=>{
    const e=evidence(base,'QSBfXnEJ10NZnk0Z'),r=e.typedCurrentRoles[0];
    assert.deepEqual(e.currentRules[0].object,{key:'ActionPoint',bound:2});assert.equal(r.legacyBoundField,'bound');assert.equal(r.legacyBoundValue,2);
    assert.equal(r.value,2);assert.equal(r.domain,'legacy-bound-ap-field');assert.equal(r.legacyFieldUseVerified,false);
    assert.equal(audit(base).sourceFacts.oneWithWinds.boundAp,2);
});
test('Ice Ball counter arithmetic and original Melee source do not certify a sequence',()=>{
    const f=audit(base).sourceFacts.iceBall;assert.equal(f.base,3);assert.equal(f.successGain,3);assert.equal(f.cap,15);assert.match(f.range,/Melee/);
    assert.deepEqual([0,1,2,3,4].map(flag=>f.base+Math.min(Math.max(flag,0),4)*f.successGain),[3,6,9,12,15]);
    assert.equal(f.counterExecutionVerified,false);assert.match(f.stops,/or are not able to hit any target/);
});
test('Baleful Brume cannot-exit rule stays distinct from Enshrouded save DC and all recipient exceptions survive',()=>{
    const f=audit(base).sourceFacts.balefulBrume;assert.match(f.hyperMode,/cannot exit/);assert.equal(f.saveDcPrinted,false);assert.equal(f.manualNotes,3);
    assert.match(f.allVulnerable,/all creatures/);assert.match(f.stageFrequency,/Twice/);assert.match(f.xdException,/At-Will/);assert.equal(f.saveBonusEquivalentVerified,false);
});
test('F3d prior chronology includes F3c, excludes own cycles and future-H evidence',()=>{
    const f=base.batchManifest.batches.find(b=>b.id==='F'),ids=priorSourceIdentities(base.batchManifest,'F','F3d');
    assert(f.slices.find(s=>s.id==='F3c').members.every(([id])=>ids.has(id)));assert(f.slices.find(s=>s.id==='F3d').members.every(([id])=>!ids.has(id)));
    assert(base.batchManifest.batches.find(b=>b.id==='H').members.every(([id])=>!ids.has(id)));
});

const proseCases=[
 ['Sing endpoint','MlJSSeAT9abuLZ3G','END OF USER NEXT TURN','end of target next turn'],
 ['Stat Ace Pokemon level','MyYrBqIyO9fbUcoZ','per10 POKEMON LEVELS','per10 TRAINER LEVELS'],
 ['SpAtk Ace base role','Picrxhf78VAPO6kx','POKEMON BASE STAT1','POKEMON COMBAT STAGE1'],
 ['Invisibility Moves restriction','NLLlGOUIm42a4Ifr','prohibits MOVES','prohibits all actions'],
 ['Bone Wielder Thick Club','OG1a1uZlWaHbc5zx','REQUIRES HOLDING THICK CLUB','requires no held item'],
 ['Brightest Flame rank','OfTEYe9myW3JWve8','TYPE-LINKED SKILL RANK','unconditional8 damage'],
 ['Athlete default stage','P1blVI7CcAMLkyTJ','DEFAULT STAGE','ordinary current stage'],
 ['Spray Down duration role','Q1riP3kQOmXsC87S','3 TURNS','3 ROUNDS'],
 ['One With Winds legacy field','QSBfXnEJ10NZnk0Z','ActionPoint.bound:2, NOT boundValue','ActionPoint.boundValue:2'],
 ['Champion offensive window','QSOJqOsxP8TMxxZi','EVEN LEVELS42–50','even levels32–40'],
 ['Brume Hyper Mode prohibition','QkotgyK9W5G6BlZM','CANNOT EXIT HYPER MODE','gain saveDC2'],
 ['Brume XD exception','QkotgyK9W5G6BlZM','TWICE/SCENE or XD-SERIES AT-WILL','once/scene for all creatures'],
 ['Vicious exclusive alternative','S6HPnUwePesar48A','CHOOSES ONE','grants both'],
 ['Rock Head same foe/movement','TIXFtoJsuH3sklKu','AT LEAST4 METERS IN A STRAIGHT LINE TOWARD THAT FOE','any movement toward any creature'],
 ['Ice Ball inability stop','TLumhP0tLbp1YgsE','MISSES ANY TARGET OR CANNOT HIT ANY TARGET THAT TURN','misses a target'],
 ['Shell Cannon conditional speeds','UOwQkZpkwdU7kCHU','WHEN DOING SO','at all times'],
 ['Lightning Rod version trigger','UdRHrCM7dkAVKUh3','EACH ELECTRIC HIT','only the redirect'],
 ['Grace daily/max distinction','RnonNxaBj0Z4nMXH','ONLY spirit.max+1, not spirit.value','spirit.value+1'],
 ['Battery next attack','MBT9OVsk9pyQZGKO','NEXT SPECIAL ATTACK','all attacks'],
 ['Salt Cure encoding','N5xGMM4iaDJ2UWnn','ROCK2','Water1.5x'],
 ['Toxic Thread Tick unit','T0v32qQRuZnSVXaD','ONE TICK and Speed-2','one HP and Speed-2'],
 ['Skull Bash phase','OHzeb2NdEhHbnrHc','USER Defense1 at SET-UP','target Defense1 at Resolution'],
 ['Geomancy phase','PWFiPAiS6UNblMEi','Resolution raises USER SpAtk/SpDef/Speed2 EACH','Set-Up raises stages'],
 ['Defend Order unusual lifetime','SwTrCa9QaIudkmyX','NOT certified as the source lifetime','verified as the source lifetime']
];
for(const[title,id,from,to]of proseCases)test('independent prose check rejects changed '+title+' after assessment hashes refresh',()=>rejected(b=>prose(b,id,s=>s.replace(from,to)),/independent source-semantic prose clause/));

const rawCases=[
 ['Sing end actor','unit','core:407:move-line60','user’s next','target’s next'],
 ['Stat Ace level scale','unit','core:112:feature-line3','every 10 Levels','every 20 Levels'],
 ['Invisibility minute cap','unit','core:305:capability-invisibility','up to 4 minutes','up to 5 minutes'],
 ['Bone Wielder held requirement','unit','core:313:ability-line3','Thick Club','any item'],
 ['Brightest Flame dynamic rank','unit','core:123:feature-line4','Type-Linked Skill Rank','fixed eight damage'],
 ['Athlete default stage','unit','core:155:feature-line3','default State','current State'],
 ['Spray Down turn unit','unit','core:330:ability-line79','3 turns','3 rounds'],
 ['One With Winds binding','unit','throhs:75:feature-line9','Bind 2 AP','Drain 2 AP'],
 ['Champion option boundary','page','core:19','Level 42','Level 32'],
 ['Baleful Brume cannot exit','native','6ykh6wKs7S5DJlXw','cannot exit Hyper Mode','gain +2 to Hyper Mode saves'],
 ['Vicious choice','unit','core:334:ability-line67','choose one effect','gain both effects'],
 ['Rock Head distance','unit','feb:8:ability-line54','at least 4 meters','at least 1 meter'],
 ['Ice Ball cap','unit','core:389:move-line37','maximum of DB 15','maximum of DB 18'],
 ['Shell Cannon movement','unit','core:329:ability-line49','straight line','any path'],
 ['Lightning Rod trigger','unit','core:322:ability-line62','each time they are hit','only when they redirect'],
 ['Grace unsupported Spirit','unit','core:53:feature-line71','2 more Poffins','2 more Spirit Poffins'],
 ['Cotton Guard amount','unit','core:380:move-line36','Defense 3','Defense 2'],
 ['Razor Shell parity','unit','core:434:move-line3','Even-Numbered','Odd-Numbered'],
 ['Memento trigger','unit','core:351:move-line77','becomes Fainted','becomes Injured']
];
for(const[title,kind,id,from,to]of rawCases)test('independent source facts reject changed '+title+' after source hashes/facts refresh',()=>rejected(b=>{
    const a=audit(b),u=kind==='unit'?a.sourceDefinitions.find(u=>u.id===id):kind==='page'?a.parentContexts.find(p=>p.id===id):a.nativeContexts.find(n=>n.pageId===id),key=kind==='unit'?'rawDefinition':'rawText';
    const before=u[key];u[key]=before.replace(from,to);assert.notEqual(u[key],before);if(kind==='unit')u.rawSha256=textHash(u.rawDefinition);if(kind==='page')u.rawSha256=textHash(u.rawText);
    a.sourceFacts=effectF3dSourceFacts(a,sourceReviewText);
},/independent signed\/recipient\/trigger\/timing\/typed-unit source facts/));

test('signed source findings cannot be reversed by refreshing row hashes',()=>rejected(b=>{detail(b,'TLCE3NR1GCYkV2Zn').sourceFindings.moveConsequence.signedDelta=2;},/source-derived assessment/));
test('source traces cannot discard the separate original Bone Wielder',()=>rejected(b=>{const d=detail(b,'OG1a1uZlWaHbc5zx');d.sourceDefinitionIds=d.sourceDefinitionIds.filter(id=>id!=='core:313:ability-line3');},/per-ID complete source\/parent\/native trace/));
test('name-only generation exclusion is rejected separately from absence',()=>rejected(b=>{row(b,'N5xGMM4iaDJ2UWnn').generationReview={status:'excluded',basis:'Name looks like Generation9'};},/unestablished generation cannot be promoted by names/));
test('finite no-hits never prove source absence',()=>rejected(b=>{audit(b).sourceAbsenceClaim=true;},/frozen\/source-only boundary/));
test('missing Spirit authoring cannot be promoted',()=>rejected(b=>{audit(b).authoringLimits.friendshipSpirit.completeFrameworkEstablished=true;},/missing authoring\/unrun foundation promoted/));
test('genuinely earlier target reviews cannot be omitted',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>s.priorSourceReview&&s.identity.startsWith('abilities.'));assert(s);s.priorSourceReview=null;s.priorReviewSemanticSha256=null;},/exact current target\/prior chronology/));
test('own-slice cycles cannot become prior authority',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>row(b,s.identity.split('.')[1]));assert(s);const r=row(b,s.identity.split('.')[1]);s.priorSourceReview=structuredClone(r);s.priorReviewSemanticSha256=hash(r);},/exact current target\/prior chronology/));
test('incoming UUID paths remain exact even with a valid target elsewhere',()=>rejected(b=>{evidence(b,'Mhib4AloLNBCjDqn').incomingReferences[0].path='$.system.rules[99].uuid';},/exact outgoing\/incoming path/));
test('legacy AP2 cannot disappear into a null boundValue role',()=>rejected(b=>{const r=evidence(b,'QSBfXnEJ10NZnk0Z').typedCurrentRoles[0];r.value=null;r.legacyBoundValue=null;},/complete current rule\/role\/literal\/page suffix/));
test('duplicated field summaries agree with actual fields',()=>rejected(b=>{row(b,'Lc6kerYZQyCpjHMh').sourceComparison.fields[0].recordValue='invented';},/complete current fields/));
test('per-field status cannot claim actual gameplay verification',()=>rejected(b=>{const r=row(b,'Lc6kerYZQyCpjHMh');r.fieldReview[0].status='gameplay-certified';r.sourceComparison.fields[0].status='gameplay-certified';},/actual field\/hash\/status disagreement/));
test('literal native page IDs cannot be substituted by a matching title',()=>rejected(b=>{audit(b).nativeContexts.find(n=>n.pageId==='6ykh6wKs7S5DJlXw').pageId='same-title';},/exact native page\/authority/));
test('absent history cannot become present without complete fields',()=>rejected(b=>{const e=Object.values(audit(b).currentRecordAudit).find(e=>!e.exportLineage.snapshots[0].recordFound);e.exportLineage.snapshots[0].recordFound=true;e.exportLineage.snapshots[0].sameStableId=true;},/historical field\/omission/));
test('optional playtest source cannot be relabeled official errata',()=>rejected(b=>{audit(b).sourceDefinitions.find(u=>u.id==='feb:8:ability-line54').completeSourceUnit.sourceKind='official-errata';},/complete reused source unit/));
test('static source evidence cannot become acquisition or preservation certification',()=>rejected(b=>{detail(b,'RnonNxaBj0Z4nMXH').actualAcquisitionPreservationAndGameplay='verified';},/source-derived assessment/));
