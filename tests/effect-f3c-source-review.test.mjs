import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewText,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkEffectF3cSourceReview,effectF3cSourceFacts,effectF3cFactErrors} from '../tools/effect-f3c-source-review.mjs';
import {priorSourceIdentities} from '../tools/source-review-order.mjs';

const base=await loadRecordSourceReview(),file='record-source-review/effects-other-c.json';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),textHash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const audit=b=>b.effectSlices.find(a=>a.slice==='F3c'),row=(b,id)=>b.files[file].records.find(r=>r.identity===`effects.${id}`),detail=(b,id)=>row(b,id).sourceComparison.effectReview;
const evidence=(b,id)=>audit(b).currentRecordAudit[`effects.${id}`];
function errors(b){const out=[];checkEffectF3cSourceReview(b,{fail:(ok,m)=>{if(!ok)out.push(m);},rows:new Map(Object.values(b.files).flatMap(f=>f.records).map(r=>[r.identity,r])),actualMap:new Map(b.source.rows.map(r=>[r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:()=>{}});return out;}
function tamper(change){
    const b={...base,files:{...base.files,[file]:structuredClone(base.files[file])},effectSlices:base.effectSlices.map(a=>a.slice==='F3c'?structuredClone(a):a)};
    change(b);
    for(const r of b.files[file].records){const e=audit(b).currentRecordAudit[r.identity];e.dispositionEvidenceSha256=hash(r);e.examinationSha256=hash(r.sourceComparison.effectReview);}
    audit(b).closure.recordEvidenceSemanticSha256=hash(b.files[file]);
    audit(b).closure.examinedDispositionsSemanticSha256=hash(b.files[file].records.map(r=>({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,generationReview:r.generationReview,examination:r.sourceComparison.effectReview})));
    return errors(b);
}
function prose(b,id,change){const r=row(b,id),d=detail(b,id),before=d.specificAssessment;d.specificAssessment=change(before);assert.notEqual(d.specificAssessment,before);r.ruleVersionReview.basis=d.specificAssessment;if(r.missingEvidence)r.missingEvidence.neededArtifact=d.specificAssessment;}
const rejected=(change,pattern)=>assert.ok(tamper(change).some(e=>pattern.test(e)));

test('F3c examines only its60 frozen records, 639 F records remain outside its own closure and preserves whole accepted F3b/F3a artifacts',()=>{
    assert.deepEqual(errors(base),[]);
    const f=base.batchManifest.batches.find(b=>b.id==='F');
    assert.equal(f.status,'in-progress');assert.equal(f.acceptance.status,'pending-substantive-review');
    assert.equal(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c'].includes(s.id)).reduce((n,s)=>n+s.records,0),639);
    assert(f.slices.filter(s=>!['F1','F2','F3a','F3b','F3c','F3d','F3e','F3f','F3g','F3h'].includes(s.id)).every(s=>s.status==='not-started'&&!s.recordFile));
    assert.deepEqual(audit(base).closure.counts,{reviewed:21,unresolved:39});assert.equal(audit(base).closure.fullFAcceptance,false);
    assert.equal(base.index.coverage.completeAddressableClassification,false);
    assert.equal(hash(base.files['record-source-review/effects-other-b.json']),'a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977');
    assert.equal(hash(base.effectSlices.find(a=>a.slice==='F3b')),'143b529579056fd9e0da7af7e42f232b9c8959a68341cb8927589109741418ad');
    assert.equal(hash(base.files['record-source-review/effects-other-a.json']),'609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee');
});
test('all complete sources retain typed roles, source conditions and source-only limits',()=>{
    const a=audit(base),f=a.sourceFacts;assert.deepEqual(effectF3cFactErrors(f),[]);
    assert.equal(a.sourceDefinitions.length,58);assert.equal(a.parentContexts.length,78);assert.equal(a.nativeContexts.length,17);
    assert.equal(f.enshrouded.sourceRole,'dc-increase');assert.equal(f.radshower.sourceRole,'incoming-damage-bonus');
    assert.equal(f.chargeBeam.attackAccuracyRollIsThisSeparateRoll,false);assert.equal(f.chokingCloud.criticalHitAlwaysMeansRoll20,false);
    assert.equal(f.enshrouded.manualNoteCount,3);assert.equal(f.thunderstorm.lostTicks,3);
});
test('Storm Drain keeps the actual printed line break and distinguishes every-hit from optional post-redirect gain',()=>{
    const a=audit(base),u=a.sourceDefinitions.find(u=>u.id==='core:331:ability-line67');
    assert.match(u.rawDefinition,/Water-\nType attack/);assert.match(a.sourceFacts.stormDrain.originalEveryWaterHit,/each time/);
    assert.match(a.sourceFacts.stormDrain.optionalAfterRedirect,/then raised/);assert.equal(a.sourceFacts.stormDrain.optionalEveryHitPrinted,false);
});
test('Fluffy Charge quantities use separate original Ability/Move sources; renamed Sage reuses only the evidenced consequence',()=>{
    const a=audit(base),f=a.sourceFacts;
    assert.equal(f.fluffyCharge.abilityDefenseDelta,1);assert.equal(f.fluffyCharge.abilitySpecialDefensePrinted,false);assert.equal(f.fluffyCharge.moveSpecialDefenseDelta,1);
    assert.deepEqual(a.independentUseContextSnapshots.map(s=>s.identity),['moves.qRvLgOrsmdXEsBsU','effects.4wH3FJEq07P2aiBC']);
    assert.deepEqual(a.independentUseContextSnapshots[1].document.system.rules,[{key:'RollOption',option:'charge:bonus'}]);
    assert.match(f.sageBenediction.distinctOriginalTitle,/Benediction/);assert.match(f.sageBenediction.afterBoth,/Blessing and the attack/);
    assert.equal(f.sageBenediction.renamedCrCanonicalRelationshipEstablished,false);
});
test('all current fields, exact paths, native page IDs and complete relative category contexts are retained',()=>{
    const a=audit(base);assert.equal(a.targetSnapshots.length,124);assert.equal(a.pageTargets.length,12);assert(a.pageTargets.every(p=>p.pageFound));
    assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.currentRules.length,0),122);
    assert.equal(Object.values(a.currentRecordAudit).reduce((n,e)=>n+e.incomingReferences.length,0),55);
    assert.equal(a.nativeContextEmbeds.length,6);assert(a.nativeContextEmbeds.every(e=>a.nativeContexts.some(n=>n.pageId===e.targetPageId)));
});
test('all240 history observations preserve16 presences and omissions; prior chronology includes F3b but excludes own/future slices',()=>{
    const a=audit(base),counts=[0,0,0,0];for(const e of Object.values(a.currentRecordAudit))e.exportLineage.snapshots.forEach((s,i)=>{if(s.recordFound)counts[i]++;});
    assert.deepEqual(counts,[1,3,6,6]);
    const ids=priorSourceIdentities(base.batchManifest,'F','F3c'),f=base.batchManifest.batches.find(b=>b.id==='F');
    assert(f.slices.find(s=>s.id==='F3b').members.every(([id])=>ids.has(id)));
    assert(f.slices.find(s=>s.id==='F3c').members.every(([id])=>!ids.has(id)));
    assert(f.slices.find(s=>s.id==='F3d').members.every(([id])=>!ids.has(id)));
    assert(a.targetSnapshots.some(s=>s.priorSourceReview));assert(a.targetSnapshots.some(s=>!s.priorSourceReview));
});

const proseCases=[
    ['Quick Curl optional Interrupt/action/lifetime','DWTWJkEea6wZgRAr','STANDARD ACTION INTERRUPT','Swift Action'],
    ['Type Strategist strict under-third threshold','DlVJLO2Cd61pB3Xc','UNDER1/3','AT OR BELOW1/3'],
    ['Fluffy Charge does not assign the Move clause to the Ability','Fest7tdgmN3e67BK','without attributing the Special Defense clause to the Ability itself','as an additional Special Defense clause printed by the Ability itself'],
    ['Stench keeps conditional attack Flinch penalty','G3Dm3BBBe6vN0391','WHEN the user Flinches a foe WITH AN ATTACK','whenever the user uses any Move'],
    ['Storm Drain original each-hit is separate from optional redirect','HzuXzHaliXLwU4Sm','EACH Water HIT','only the redirected Move'],
    ['Spinning Dance has incapacitation conditions','HYaM8gqE57Ud6kPB','IF NOT Fainted, Paralyzed or Asleep','regardless of incapacitation'],
    ['Reckless Vulnerability belongs to the Order target','FMhkR9rKCkyJTOVo','THAT POKEMON becomes Vulnerable1 FULL ROUND','the attacked foe becomes Vulnerable1 FULL ROUND'],
    ['Pinpoint penalty is before weakness/resistance','Jphgqcq54ao72CpW','5 LESS DAMAGE BEFORE weakness/resistance','5 LESS DAMAGE AFTER weakness/resistance'],
    ['Sage waits for both Blessing and triggering attack','JyUJFDshzL34NCx1','AFTER BOTH the Blessing AND triggering attack','after only the Blessing'],
    ['Pumped switch cleanup remains explicit','GGzbwfYV5wqMIF9u','SWITCHING ends','SWITCHING preserves'],
    ['Charge Beam uses a separate post-hit roll','LJ30o41BPZ43Jlxd','SUCCESSFUL HIT, THEN a SEPARATE1d20 roll7+','the attack Accuracy roll7+'],
    ['Rapid Spin source omits added Speed stage','Hh6VvJMUarY6SCQP','NO Speed increase','a Speed increase'],
    ['Dragon Rage fixed HP loss is not an ordinary damage rewrite','IK1rQX84Oel7pChQ','LOSE15HP','take ordinary DB5 damage'],
    ['Sonic Boom downgrade does not override negative stages','JTLLBpOZZG18eJTY','DOWNGRADES','OVERRIDES'],
    ['Duststorm Fly and other movement penalties stay distinct','DkBFKH0w90KHOHYf','Fly-3/OTHER Movement-1','all Movement-3'],
    ['Choking Cloud needs a critical Slice hit','DrzQrsJTYAVYfae3','CRITICAL HIT from a SLICE Move','roll20 from any Move'],
    ['Glowy retains random non-Nuclear Ability disabling','Ea9xpePsg9JDCrZF','RANDOMLY DISABLES one Ability','automatically grants all Abilities'],
    ['Enshrouded raises a DC rather than a save-roll bonus','F8rAIOXaWcw9uDDv','raises the DC of Hyper Mode saves by2','adds2 to Hyper Mode save rolls'],
    ['Cyclone Initiative includes Flying Type itself','GQKD8EKwCeB7Wpeo','Flying-TYPE creatures OR Fly/Levitate-capable','only Fly/Levitate-capable'],
    ['Radshower incoming damage is not DR subtraction equivalence','K3TwnRkMysI9iP29','not certified equivalent to current DR-subtract10','verified equivalent to current DR-subtract10'],
    ['Thunderstorm loses ticks rather than flat HP','L76G6hMXT01pms8o','DC8 SAVE failure for3 TICKS','DC8 SAVE failure for3 HP'],
    ['Venom Drench remains poisoned-target-only','K09Vbcxe9lbpvNEQ','ALL POISONED targets','ALL targets']
];
for(const[title,id,from,to]of proseCases)test(title+' survives refreshed row/file/disposition hashes',()=>{
    rejected(b=>prose(b,id,text=>text.replace(from,to)),/independent source-semantic prose clause/);
});

const rawCases=[
    ['optional Quick Curl DR','unit','feb:8:ability-line11','+10 Damage Reduction','+20 Damage Reduction'],
    ['Storm Drain every-hit clause','unit','core:331:ability-line67','each time they are hit','only once when they are hit'],
    ['Charge next-turn qualifier','unit','core:356:move-line14','on their \nnext turn','at any time'],
    ['Sage dependent attack resolution','unit','core:189:feature-line21','and the attack that triggered it','alone'],
    ['Enshrouded DC role','native','o2sGLH6NV9dXHcfT','The DC for all Hyper Mode Saves increases by +2','All Hyper Mode Save Rolls gain +2'],
    ['Radshower damage role','native','KPTl4Ok92yhWblt7','take +10 bonus damage from all attacks','gain +10 Damage Reduction against all attacks'],
    ['Thunderstorm tick unit','native','18guO0fFJfsCaMDp','lose 3 Ticks of Hit Points','lose 3 Hit Points']
];
for(const[title,kind,id,from,to]of rawCases)test('independent source facts reject changed '+title+' after derived hashes/facts refresh',()=>{
    rejected(b=>{
        const a=audit(b),u=kind==='unit'?a.sourceDefinitions.find(u=>u.id===id):a.nativeContexts.find(n=>n.pageId===id),key=kind==='unit'?'rawDefinition':'rawText';
        const before=u[key];u[key]=before.replace(from,to);assert.notEqual(u[key],before);if(kind==='unit')u.rawSha256=textHash(u.rawDefinition);
        a.sourceFacts=effectF3cSourceFacts(a,sourceReviewText);
    },/independent signed\/recipient\/trigger\/timing\/typed-unit source facts/);
});

test('signed stage findings cannot be reversed by refreshing assessment hashes',()=>rejected(b=>{detail(b,'EjQwuBuIqKQOQQ7M').sourceFindings.stageMove.signedDelta=1;},/source-derived assessment/));
test('a source/parent trace cannot omit the connected Charge source',()=>rejected(b=>{const d=detail(b,'Fest7tdgmN3e67BK');d.sourceDefinitionIds=d.sourceDefinitionIds.filter(id=>id!=='core:356:move-line14');},/per-ID complete source\/parent\/native trace/));
test('name-only generation exclusion fails independently of source absence',()=>rejected(b=>{row(b,'H9mxpEaLJzdhN3KO').generationReview={status:'excluded',basis:'The display name looks like Generation9'};},/unestablished generation cannot be promoted by names/));
test('finite no-hits cannot become a source-absence assertion',()=>rejected(b=>{audit(b).sourceAbsenceClaim=true;},/frozen\/source-only boundary/));
test('complete Friendship and Spirit authoring cannot be promoted from native/context evidence',()=>rejected(b=>{audit(b).authoringLimits.friendshipSpirit.completeFrameworkEstablished=true;},/missing authoring\/unrun foundation promoted/));
test('genuinely earlier source review is required at the exact snapshot',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>s.priorSourceReview&&s.identity.startsWith('abilities.'));assert(s);s.priorSourceReview=null;s.priorReviewSemanticSha256=null;},/exact current target\/prior chronology/));
test('an own-slice cycle cannot become its own prior source authority',()=>rejected(b=>{const s=audit(b).targetSnapshots.find(s=>row(b,s.identity.split('.')[1]));assert(s);const r=b.files[file].records.find(r=>r.identity===s.identity);s.priorSourceReview=structuredClone(r);s.priorReviewSemanticSha256=hash(r);},/exact current target\/prior chronology/));
test('incoming UUID paths remain exact even when the true target appears elsewhere',()=>rejected(b=>{const e=evidence(b,'EgI6KwJEMPfiHq6t');assert.equal(e.incomingReferences.length,2);e.incomingReferences[0].path='$.system.rules[99].uuid';},/exact outgoing\/incoming path/));
test('complete current rule selectors and predicates cannot be replaced by matching quantities',()=>rejected(b=>{evidence(b,'DlVJLO2Cd61pB3Xc').currentRules[0].object.value.brackets[0].end=34;},/complete current rule\/role\/literal\/page suffix/));
test('duplicated field summaries must agree with the actual complete field review',()=>rejected(b=>{row(b,'DSXd33NkJkdeFnnc').sourceComparison.fields[0].recordValue='invented';},/complete current fields/));
test('per-field status cannot claim gameplay certification',()=>rejected(b=>{const r=row(b,'DSXd33NkJkdeFnnc');r.fieldReview[0].status='gameplay-certified';r.sourceComparison.fields[0].status='gameplay-certified';},/actual field\/hash\/status disagreement/));
test('relative native embeds resolve by literal page ID and hash',()=>rejected(b=>{audit(b).nativeContextEmbeds[0].targetPageId='same-title-is-not-an-id';},/literal relative native embed\/page-ID\/hash/));
test('the independent Charged context is really flag-only, not an invented automatic stage grant',()=>rejected(b=>{audit(b).independentUseContextSnapshots[1].document.system.rules.push({key:'ActiveEffectLike',path:'system.stats.spdef.stage.mod',mode:'add',value:1});},/Charge source identity or actual Charged flag-only/));
test('an absent historical observation cannot become a present record without complete fields',()=>rejected(b=>{const e=Object.values(audit(b).currentRecordAudit).find(e=>!e.exportLineage.snapshots[0].recordFound);e.exportLineage.snapshots[0].recordFound=true;e.exportLineage.snapshots[0].sameStableId=true;},/historical field\/omission/));
test('optional complete source status cannot be relabeled official errata',()=>rejected(b=>{audit(b).sourceDefinitions.find(u=>u.id==='feb:8:ability-line11').completeSourceUnit.sourceKind='official-errata';},/complete reused source unit/));
test('source review cannot be promoted to actual acquisition/preservation verification',()=>rejected(b=>{detail(b,'JyUJFDshzL34NCx1').actualAcquisitionPreservationAndGameplay='verified';},/source-derived assessment/));
