// Offline F3h source/current examination; no runtime or policy consumer.
import {effectReferences,effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='da5a46fdbec94e121361cf997b9143d14f535e4f119457e8cd85630ddb737263';
const SOURCE_PRIMITIVES='7ba90a7c7d73a91e17f28665c8c007cb9d0f45bdf51a1f084c56f3535acebb0e';
const EXAMINED_DISPOSITIONS='8e2582edfba0393432ab1f901606e0c67d455c733a38fd7aac3202ec56f1236b';
const HISTORICAL_OBSERVATIONS='a502e804f8b6000fdef780b2c65113f535c0ae78d1009125d5b1be34279dafe1';
export const effectF3hRuleRoles=effectOtherRuleRoles;
export const effectF3hSourceSpecifications=[
 ['rageEndpoint','unit','core:404:move-line47',/Until the end of the user's next turn, if the user is Enraged/],
 ['rageDamage','unit','core:404:move-line47',/gains \+([0-9]+) Attack Combat Stage whenever they are damaged/,'1'],
 ['rattledTypes','unit','core:327:ability-line57',/hit by a Bug, Dark, or Ghost Type Move/],
 ['rattledSpeed','unit','core:327:ability-line57',/Speed is raised by \+([0-9]+) Combat Stage/,'1'],
 ['rattledOptional','unit','feb:8:ability-line33',/may immediately Disengage as a Free Action/],
 ['ominousUser','unit','core:378:move-line35',/On ([0-9]+)\+, the user has each of its stats raised by \+([0-9]+) Combat Stage/,'19','1'],
 ['aquaRecipient','unit','core:311:ability-line58',/An adjacent Ally uses a damaging Water-Type Move/],
 ['aquaDamage','unit','core:311:ability-line58',/allied target gains a \+([0-9]+) Bonus to its damage roll with the triggering Move/,'5'],
 ['aquaSingle','unit','core:311:ability-line58',/may not benefit from more than one instance/],
 ['bugOmission','unit','core:346:move-line27',/Bug Buzz lowers the Special Defense of all targets on ([0-9]+)\+/,'19'],
 ['bugRange','unit','core:346:move-line27',/Cone ([0-9]+) or Close Blast ([0-9]+)/,'2','2'],
 ['seedAmount','unit','core:383:move-line45',/All Legal Targets have their Special Defense lowered ([0-9]+) Combat Stage/,'1'],
 ['angerGain','unit','core:311:ability-line45',/receives a Critical Hit, they become Enraged and gain \+([0-9]+) Attack Combat Stages/,'6'],
 ['minimizeSize','unit','core:402:move-line34',/gains \+([0-9]+) Evasion, and user's size is lowered to Small for the remainder of the encounter/,'4'],
 ['shrinkDistinct','unit','core:307:capability-shrinkable',/Using Shrinkable is not the same as using the Move Minimize/],
 ['captivateGender','unit','core:393:move-line3',/may not affect something that is the same gender as the user or something that is genderless/],
 ['victoryPokemon','unit','core:334:ability-line75',/Any allied Pokemon in the encounter gain a \+([0-9]+) Bonus to Accuracy Rolls/,'2'],
 ['shadowStage','unit','core:378:move-line63',/foe's Special Defense ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','17'],
 ['slowBoth','unit','core:330:ability-line3',/For ([0-9]+) rounds after joining an encounter, the user's Speed and Attack Stats are halved and they have ([0-9]+) Damage Reduction/,'3','10'],
 ['chipAny','unit','core:393:move-line15',/Ignore any Armor, Damage Reduction, or changes in the target's Defense or Special Defense/],
 ['magnetTurns','unit','core:357:move-line52',/gains the Levitate Ability for ([0-9]+) turns/,'5'],
 ['magnetCommand','unit','core:357:move-line52',/Swift Action if the user is otherwise given an action that consumes a Command/],
 ['glaciateGround','unit','core:389:move-line3',/On an Even-?Numbered Roll, all Legal Targets on the ground are Slowed/],
 ['forecastFog','unit','core:318:ability-line35',/returns to Normal Type if it is in normal weather or foggy weather/],
 ['electroAdd','unit','core:357:move-line3',/adds their Speed Stat, including Combat Stages, in addition to their Special Attack/],
 ['electroDefender','unit','core:357:move-line3',/subtracts both their Special Defense and Speed Stats.*before applying Type Effectiveness/],
 ['empowerAction','unit','feb:12:ability-line36',/Scene - Swift Action.*self-targeting Status-Class Move as a Free Action/],
 ['athleticIdentity','page','core:54',/Athletic Initiative Prerequisites: Adept Athletics Effect: You learn the Move Agility/],
 ['auraPrimary','unit','feb:13:ability-line72',/user and all allies within ([0-9]+) meters gain a \+([0-9]+) Bonus to Damage Rolls with Moves matching the user's Primary Type/,'3','5'],
 ['shadyDC','native','57kFkOqy9xY60WP8',/DC for all Hyper Mode Saves increases by \+([0-9]+)/,'2'],
 ['tuleSize','native','6ePgZ3VcQU5qUr65',/Bug-Type creatures count as ([0-9]+) sizes smaller/,'2'],
 ['tuleFlanked','native','6ePgZ3VcQU5qUr65',/Flanked creatures take \+([0-9]+) bonus damage from all Damaging Attacks/,'10'],
 ['tuleRanks','native','6ePgZ3VcQU5qUr65',/were ([0-9]+) Skill Ranks higher .*above Master confers an additional \+([0-9]+)/,'2','3'],
 ['heavyVision','native','0GMIk3XYbhKK4xrZ',/see clearly in a ([0-9]+)m radius.*Every meter beyond.*-([0-9]+) penalty to Accuracy Rolls and Perception Checks/,'2','2'],
 ['heavyRanks','native','0GMIk3XYbhKK4xrZ',/were ([0-9]+) Skill Rank higher.*above Master confers an additional \+([0-9]+)/,'1','2'],
];
export function effectF3hSourceFacts(audit,cleanText){
 const unit=id=>{const u=audit.sourceDefinitions.find(u=>u.id===id);return cleanText(u?.rawDefinition??u?.completeSourceUnit?.effect??'');};
 const page=id=>cleanText(audit.parentContexts.find(p=>p.id===id)?.rawText??'');
 const native=id=>cleanText(audit.nativeContexts.find(p=>p.pageId===id)?.rawText??'');
 const get={unit,page,native};
 const root=id=>audit.rootCurrentSystems?.['effects.'+id];
 return {observations:Object.fromEntries(effectF3hSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),
  sourceBoundaries:{bugAmountOrStagePrinted:/Special Defense (?:by |lowered )?[+-]?\d|Combat Stage/i.test(unit('core:346:move-line27')),independentCurrentShadowNuclearWeatherFrameworkApproved:false},
  currentObservations:{shadyRules:root('ri69iVYZA3joXmI1')?.rules,trailPath:root('tpoqnKENIo3TS5dQ')?.rules[0]?.path,shadowPath:root('x2CZnRYV8WNoA8JY')?.rules[0]?.path,
   aquaSelector:root('tfUh1LAtD1s76w9D')?.rules[0]?.selectors,tanglingGrant:root('yeB0636J5xIOKKIW')?.rules.find(r=>r.key==='GrantItem'),
   slowRules:root('z4QbPFO9V20OxfKg')?.rules,slowDuration:root('z4QbPFO9V20OxfKg')?.duration,magnetDuration:root('zW6HxBflztnc9odZ')?.duration,
   chipRules:root('zWy9FNpUefVctV7m')?.rules,minimizeRules:root('wRtj45jcqtCRKdv5')?.rules,hiddenRules:root('wKlB25Mu17lmwpKB')?.rules,
   saltSteel:root('rcjxP5up4cCL3Zl2')?.rules[0],victorySelector:root('wznfaAte7p4woIZq')?.rules[0]?.selectors,
   fogRules:root('sY0fzMJmAQ5N9Vty')?.rules,heavyRules:root('uw7VK1VsedaJlhl2')?.rules},
  nativeDefinitions:Object.fromEntries(audit.nativeContexts.map(n=>[n.pageId,native(n.pageId)])),
  unresolvedExecution:{reproducedGameplayFailure:false,sourceAmountsAndStoredFieldsEstablishWholeVersion:false,actualUseAndPreservation:'not-run'}};
}
export function effectF3hFactErrors(f){
 const errors=[];
 for(const[key,kind,id,re,...values]of effectF3hSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source recipient/unit/condition');}
 if(Object.values(f.sourceBoundaries).some(Boolean))errors.push('printed omission/independent authoring boundary');
 const c=f.currentObservations;
 if(c.trailPath!=='system.stats.spd.stages.mod'||c.shadowPath!=='system.stats.spdef.mod.mod'||c.aquaSelector!=='water-damage')errors.push('typed paths/selectors');
 if(c.tanglingGrant?.uuid!==undefined||JSON.stringify(c.tanglingGrant?.predicate)!=='["Compendium.ptu.effects.Item.I2nVAxBFKDMe8EQt"]')errors.push('TanglingHair predicate UUID is not grant uuid');
 if(c.shadyRules?.[0]?.selectors!=='save-check'||c.shadyRules?.[0]?.value!==2||c.shadyRules?.[1]?.value!==2)errors.push('Shady save roll versus DC and DB');
 if(c.slowRules?.some(r=>r.path?.includes('.atk.'))||!c.slowRules?.some(r=>r.path==='system.stats.spd.mod'&&r.mode==='multiply'&&r.value===0.5)||c.slowDuration?.unit!=='unlimited')errors.push('SlowStart exact missing Attack/Speed path/unlimited');
 if(c.magnetDuration?.value!==5||c.magnetDuration?.unit!=='rounds')errors.push('MagnetRise stored rounds versus turns');
 if(c.chipRules?.length!==8||!c.chipRules.every(r=>r.mode==='downgrade'&&r.value===0)||c.chipRules.find(r=>r.path==='system.modifiers.damageReduction.special.value')?.phase!=='applyAEs')errors.push('ChipAway eight downgrade-zero paths/phases');
 if(c.minimizeRules?.some(r=>r.key==='RollOption'||r.path?.includes('size'))||c.minimizeRules?.find(r=>r.key==='TokenImage')?.scale!==0.6)errors.push('Minimize display scale is not size or historical RollOption');
 if(c.hiddenRules?.find(r=>r.key==='TokenImage')?.alpha!==0.6||c.hiddenRules?.filter(r=>r.key==='ActiveEffectLike').some(r=>r.predicate?.length))errors.push('Hidden unqualified Evasion and alpha');
 if(c.saltSteel?.type!=='rock'||c.saltSteel?.value!==4||JSON.stringify(c.victorySelector)!=='["attack-roll"]'||c.fogRules?.length!==0||c.heavyRules?.length!==0)errors.push('Salt/Victory/Fog literal rules');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.sourceAmountsAndStoredFieldsEstablishWholeVersion!==false||f.unresolvedExecution.actualUseAndPreservation!=='not-run')errors.push('source/static promoted to behavior');
 return errors;
}
export function effectF3hFindings(identity,facts){return {sourceFactsRole:'Complete independent raw definitions and parent/native clauses are scoped by exact per-ID links; no canonical/current-version or runtime approval.',sourceBoundaries:facts.sourceBoundaries,actualUse:'not-run',fullCurrentVersionEstablished:false};}
export function effectF3hSemanticRequirements(){return {
 qhnEZKHJMKCDaFs1:[/WHEN DAMAGED WHILE ENRAGED/,/until end of USER NEXT TURN/],
 qxuFA6LTsY9SltMO:[/Optional February8 separately adds IMMEDIATE DISENGAGE AS FREE ACTION/],
 ri69iVYZA3joXmI1:[/DC OF ALL HYPERMODE SAVES2/,/SAVE ROLL and SAVE DIFFICULTY/],
 sY0fzMJmAQ5N9Vty:[/BUG TWO SIZES SMALLER/,/STEALTH TWO RANKS HIGHER.*ABOVE MASTER\+3/],
 uw7VK1VsedaJlhl2:[/BUG ONE SIZE SMALLER/,/MAIN BATTLE sets TULEFOG.*fallback sets HeavyFog5rounds/],
 se1v1evZPza3JA2q:[/NORMAL in FOGGY/,/UNCONDITIONALLY overwrites PSYCHIC ARRAY/,/SAME NONSHINY/],
 uCCc1VJUkVObkeyV:[/NUCLEAR ARRAY/,/SAME NONSHINY/,/not a printed Nuclear addition/],
 t4ifa9tJzmbvrTUs:[/AthleticInitiative core36\/54 grants AGILITY/,/visible\/itemized advisory, non-blocking/],
 uH3r0Og4TM9sGsUh:[/OMITS THE AMOUNT AND COMBAT-STAGE UNIT/,/actual printed omission/],
 w4YUb7furQl4ZqD8:[/GAINS6 ATTACK COMBAT STAGES, not sets Attack to maximum/],
 wRtj45jcqtCRKdv5:[/scale0.6 IS NOT A SIZE FIELD/,/Historical versions.*cannot-attack/,/explicitly NOT Minimize/],
 wznfaAte7p4woIZq:[/ALLIED POKEMON IN ENCOUNTER/,/ARRAY selector/],
 x2CZnRYV8WNoA8JY:[/system.stats.spdef.mod.mod, NOT stage.mod/,/damage-dealt/],
 yeB0636J5xIOKKIW:[/ONLY IN PREDICATE AND NO uuid FIELD/],
 yBTMIwTqL1OBi6z8:[/ADDS USER SPEED INCLUDING STAGES TO SPECIALATTACK/,/SUBTRACTS BOTH SPECIALDEFENSE AND SPEED/],
 z4QbPFO9V20OxfKg:[/SPEED AND ATTACK STATS FOR3ROUNDS AFTER JOINING/,/NO ATTACK RULE/],
 zWy9FNpUefVctV7m:[/NO PRINTED POSITIVE-ONLY LIMIT/,/EIGHT DOWNGRADE0/,/negative changes/],
 zW6HxBflztnc9odZ:[/LEVITATE FOR5TURNS/,/stores5ROUNDS/],
 zg5BJA3J6vPpNNI2:[/SLOWS GROUNDED TARGETS/,/EMPTY PREDICATE/,/not a reproduced airborne-target failure/],
};}

const sourceLinks={"qhnEZKHJMKCDaFs1":["core:404:move-line47"],"qxuFA6LTsY9SltMO":["core:327:ability-line57","feb:8:ability-line33"],"r7ZOjaTRKonc8FBS":["core:378:move-line35"],"rE5BofGfyeADpjZg":["core:351:move-line23"],"sVBpYPGtLbcklZIL":["feb:13:ability-line72"],"se1v1evZPza3JA2q":["core:318:ability-line35","core:413:move-line3"],"t4ifa9tJzmbvrTUs":["core:406:move-line20","feb:12:ability-line36"],"tOcc4Jxj8sbqfvl2":["core:357:move-line18"],"tfUh1LAtD1s76w9D":["core:311:ability-line58"],"uCCc1VJUkVObkeyV":["core:318:ability-line35","core:413:move-line3"],"uH3r0Og4TM9sGsUh":["core:346:move-line27"],"uw7VK1VsedaJlhl2":["core:316:ability-line36","feb:4:ability-line73"],"vm2BX3GeRQJf8ceT":["core:426:move-line4"],"vuSI4u51Amk64Qjc":["core:383:move-line45"],"w4YUb7furQl4ZqD8":["core:311:ability-line45","f1:core:247:rage","core:404:move-line47"],"wRtj45jcqtCRKdv5":["core:402:move-line34","core:307:capability-shrinkable"],"wSj804ABTQ8Hrd7r":["core:393:move-line3"],"wy0n2XJqupaVQhMR":["core:370:move-line66"],"wznfaAte7p4woIZq":["core:334:ability-line75"],"x2CZnRYV8WNoA8JY":["core:378:move-line63"],"x7UpUaDg110bXO0g":["core:356:move-line48"],"xN7h6F7P4ICyYLnc":["core:421:move-line46"],"yBTMIwTqL1OBi6z8":["core:357:move-line3"],"yeB0636J5xIOKKIW":["f1:core:248:slowed"],"z4QbPFO9V20OxfKg":["core:330:ability-line3"],"zW6HxBflztnc9odZ":["core:357:move-line52","core:322:ability-line42"],"zWy9FNpUefVctV7m":["core:393:move-line15"],"zdodc9aTUJwdQ96l":["core:411:move-line32"],"zg5BJA3J6vPpNNI2":["core:389:move-line3","f1:core:248:slowed"]};
const nativeLinks={"ri69iVYZA3joXmI1":["7znCkHSW9AWIyFIA","57kFkOqy9xY60WP8"],"sY0fzMJmAQ5N9Vty":["7znCkHSW9AWIyFIA","6ePgZ3VcQU5qUr65"],"uw7VK1VsedaJlhl2":["7znCkHSW9AWIyFIA","0GMIk3XYbhKK4xrZ","6ePgZ3VcQU5qUr65"]};

export function checkEffectF3hSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3h');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3h');
    if (!audit) { fail(!slice.recordFile, 'F3h completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3h record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3h' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3h frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3h independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3h exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 64 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 53 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 43 && audit.nativeContexts.length === 6, 'F3h bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3h full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3h complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3h full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3h exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3hSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3hFactErrors(facts).length === 0, 'F3h independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3hFactErrors(facts).join('; '));
    const proseRequirements = effectF3hSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.completeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentWeatherPlaytestAuthoringEstablished === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3h missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3h'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 130 && snapshots.size === audit.targetSnapshots.length, 'F3h exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3h exact current target/prior chronology changed: ' + s.identity);
    }

    fail(equal(audit.independentUseContextSnapshots, []), 'F3h no invented independent producer relationship');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3h full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F3h literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3h literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3h exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3g').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3h independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F3h full root-system inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3h per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3h exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3hFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3h source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3h independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F3h per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F3h unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3h complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3h actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectF3hRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3h complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3h exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3h exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3h incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3h complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3h historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3h finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 18, unresolved: 46}) && equal(counts, closure.counts), 'F3h bounded correspondence/limit counts changed');
}
