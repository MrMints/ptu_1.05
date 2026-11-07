// Offline F3e examination only; no runtime, acquisition or eligibility consumer.
import {effectReferences,effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='3beb4248f37757bc430e7fe1d0cd19735b3babeb60e8235d7402fe46f19ad71e';
const SOURCE_PRIMITIVES = 'dcf220c829c83d4cdb20ecf0bac61b897f72058ed3864b116cdd44873a1e39c2';
const EXAMINED_DISPOSITIONS = '3e97ae56b2bd22440f8d8c5e6043fb2312e91d5bfa43426357e5b3d1f66ec153';
const HISTORICAL_OBSERVATIONS = '0b8699559984d30c033d7763d41400b4ec86c419e4b6eb4e9d454c6fc2d429b2';
export const effectF3eRuleRoles=effectOtherRuleRoles;

// Clauses are independently constrained by source role, recipient and unit.
// Returning captures permits tests to change source meaning and recompute all
// derived hashes, rather than relying on a frozen payload mismatch alone.
const sourceSpecifications=[
 ['shellOriginalAction','unit','core:329:ability-line60',/Withdraw as an Interrupt and a Free Action/],
 ['shellOriginalStop','unit','core:329:ability-line60',/must still use a Shift Action to stop being Withdrawn/],
 ['shellOptionalAction','unit','feb:9:ability-line51',/Standard Action Interrupt/],
 ['shellOptionalDr','unit','feb:9:ability-line51',/gain \+([0-9]+) Damage Reduction for ([0-9]+) full round/,'10','1'],
 ['statAce','unit','core:112:feature-line3',/Chosen Base Stat increased by \+1, and by \+1 more for every ([0-9]+) Levels/,'10'],
 ['statAceExample','unit','core:112:feature-line3',/Level 20 Pokemon would have your Chosen Stat's base value increased by \+3/],
 ['growthSunny','unit','core:398:move-line32',/If it is Sunny, double the amount of Combat Stages gained/],
 ['fieryHit','unit','core:369:move-line60',/successfully hits a foe/],
 ['fieryEven','unit','core:369:move-line60',/user's Special Attack by ([0-9]+) Combat Stage on Even-?Numbered Rolls/,'1'],
 ['focus','unit','core:365:move-line3',/target's Special Defense ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','18'],
 ['magneticRecipients','unit','core:357:move-line65',/All targets with the Minus or Plus Ability/],
 ['magneticAmount','unit','core:357:move-line65',/Defense and Special Defense raised by \+([0-9]+) Combat Stage/,'1'],
 ['magneticArea','unit','core:357:move-line65',/Range: Burst ([0-9]+)/,'4'],
 ['kingsMelee','unit','core:430:move-line24',/triggering attack was Melee ranged/],
 ['kingsAttacker','unit','core:430:move-line24',/attacker's Attack is lowered by ([0-9]+) Combat Stages/,'2'],
 ['withdrawOriginalDr','unit','core:435:move-line60',/immune to Critical Hits and gain ([0-9]+) Damage Reduction/,'15'],
 ['withdrawOriginalRestrictions','unit','core:435:move-line60',/cannot Shift, and may only use self-targeting Moves/],
 ['withdrawOptionalStage','unit','sep:4:move-line40',/user's Defense is raised ([0-9]+) Combat Stage/,'1'],
 ['shadowNumbers','unit','core:307:capability-shadowmeld',/\+([0-9]+) bonus to Stealth rolls, gains \+([0-9]+) to its evasion/,'4','1'],
 ['shadowActions','unit','core:307:capability-shadowmeld',/may not use Standard Actions while melded into shadow. Reforming is a Shift Action/],
 ['rootOriginalTemp','unit','core:328:ability-line26',/Temporary Hit Points equal to (1\/16)th of their Max Hit Points/,'1/16'],
 ['rootOptionalDr','unit','feb:8:ability-line67',/While the user has the Ingrain Coat, they may activate this Ability to gain ([0-9]+) Damage Reduction/,'5'],
 ['ambushOriginalMelee','unit','core:311:ability-line33',/use a Melee Move with a Damage Base of ([0-9]+)/,'6'],
 ['ambushModifierBoundary','unit','core:311:ability-line33',/before applying STAB or other modifiers/],
 ['ambushOptional','unit','feb:3:ability-line17',/If it hits, the target is Flinched and has a -([0-9]+) penalty to Accuracy Rolls for ([0-9]+) full round/,'2','1'],
 ['curseGhost','unit','core:377:move-line25',/loses (1\/3)rd of their Max Hit Points/,'1/3'],
 ['curseUnpreventable','unit','core:377:move-line25',/This Hit Point loss cannot be prevented in any way/],
 ['forecastIce','unit','core:318:ability-line35',/Ice Type if it is Hailing/],
 ['forecastReset','unit','core:318:ability-line35',/returns to Normal Type if it is in normal weather or foggy weather/],
 ['weatherBallOriginal','unit','core:413:move-line3',/When a weather effect is on the field, Weather Ball has a Damage Base of ([0-9]+)/,'10'],
 ['cutDr','unit','core:394:move-line37',/ignores up to ([0-9]+) Damage Reduction \(Defenses are not Damage Reduction\)/,'5'],
 ['cutRange','unit','core:394:move-line37',/Range: Melee, Pass/],
 ['windOriginal','unit','core:335:ability-line79',/Damage Base of their next Flying-Type Move by \+([0-9]+)/,'1'],
 ['windOptional','unit','feb:11:ability-line67',/user gains \+([0-9]+) Speed CS/,'1'],
 ['trickBound','unit','core:61:feature-line33',/Bind ([0-9]+) AP - Standard Action/,'2'],
 ['trickRanged','unit','core:61:feature-line33',/damaging ranged attacks by -([0-9]+)/,'2'],
 ['trickCritical','unit','core:61:feature-line33',/Critical Hit range of those attacks is increased by \+([0-9]+)/,'3'],
 ['trickAc','unit','core:61:feature-line33',/does not affect Moves without an AC value/],
 ['terrainGroundHeal','unit','core:381:move-line53',/all Pokemon and Trainers standing on the ground recover a Tick of Hit Points at the start of every turn/],
 ['terrainDamage','unit','core:381:move-line53',/Grass-Type attacks performed by grounded Pokemon and Trainers gain a \+([0-9]+) bonus to Damage Rolls/,'10'],
 ['terrainRounds','unit','core:381:move-line53',/Grassy for ([0-9]+) rounds/,'5'],
 ['flashOriginal','unit','core:317:ability-line78',/\+([0-9]+) Bonus to their next Damage Roll with a Fire-Type Move/,'5'],
 ['flashOptional','unit','feb:5:ability-line13',/gain \+([0-9]+) CS in their choice of Attack or Special Attack/,'1'],
 ['songQuantity','page','core:164',/All Allies in the Area of Effect gain ([0-9]+) Damage Reduction until the end of your next turn/,'5'],
 ['songAlwaysUser','page','core:164',/Songs always affect the user/],
 ['braceQuantity','unit','equipment:core:297:table0:row13',/holder ([0-9]+) Damage Reduction against that specific Type/,'15'],
 ['plateCombination','unit','equipment:core:297:table0:row16',/both a Type Booster and a Type Brace/],
 ['windyFlying','native','CvjwDBLUgtnD8ebr',/Flying-Type/],
 ['neutrinoIncoming','native','km9RudFAY1778m0q',/\+15/],
 ['fogSize','native','a6wZkR8rJNlKHrFe',/gain \+1 Evasion for each size the attacker is larger than them/],
 ['acidVulnerable','native','Ituwb8YlUkp5boxz',/Vulnerable/],
 ['dustSlowed','native','y5XB5KR2FF2XysmZ',/Slowed/],
 ['delugeDamp','native','P9g71CQGub5KzQHo',/Damp/],
 ['galePush','native','HdTyaqw3uARLJjZf',/Weight Class/],
 ['desiccatingStep','native','4faymH1bVfUFQiUM',/one step/i],
 ['blisteringWater','native','YBWVC5IMxZYqnabl',/Water/]
];
sourceSpecifications.push(
 ['neutrinoAbilities','native','km9RudFAY1778m0q',/Non-Nuclear-Type creatures have two of their Abilities randomly disabled/],
 ['neutrinoDamage','native','km9RudFAY1778m0q',/All non-Nuclear-Type creatures take \+([0-9]+) bonus damage from all attacks/,'15'],
 ['neutrinoFlinch','native','km9RudFAY1778m0q',/Nuclear-Type Moves and Physical Steel-Type Moves now inflict Flinch on ([0-9]+)\+/,'17'],
 ['neutrinoRange','native','km9RudFAY1778m0q',/already Flinches, the Effect Range for Flinches increases by ([0-9]+)/,'4'],
 ['windyInitiative','native','CvjwDBLUgtnD8ebr',/Flying-Type creatures, creatures with the Fly and\/or Levitate Movement Capabilities, and creatures with the Wind Rider Ability gain \+([0-9]+) to their Initiative/,'5'],
 ['fogBug','native','a6wZkR8rJNlKHrFe',/Bug-Type creatures count as ([0-9]+) size smaller/,'1'],
 ['fogRadius','native','a6wZkR8rJNlKHrFe',/see clearly in a ([0-9]+)m radius/,'4'],
 ['fogExceptions','native','a6wZkR8rJNlKHrFe',/does not affect Bug- or Psychic-Type creatures and creatures with Blindsense or detecting senses other than vision/],
 ['gloomyDamage','native','6wkggQtDJlMSKDQT',/Ghost, Dark, and Fairy-Type Attacks gain \+([0-9]+) DB/,'2'],
 ['smogSave','native','IAEQNRN3dhavHlYn',/All non-Poison and Steel-Type creatures receive a -([0-9]+) Penalty to their Save Rolls/,'2'],
 ['acidDbRange','native','Ituwb8YlUkp5boxz',/Poison-Type Attacks gain \+([0-9]+) DB , and gain \+([0-9]+) to their Effect Range/,'3','2'],
 ['acidSave','native','Ituwb8YlUkp5boxz',/non-Poison Type creatures receive a -([0-9]+) Penalty to their Save Rolls/,'4'],
 ['acidTemp','native','Ituwb8YlUkp5boxz',/Poison-Type creatures gain a Tick of Temporary Hit Points, at the end of their turn/],
 ['acidStatus','native','Ituwb8YlUkp5boxz',/Poisoned or Badly Poisoned, they are Vulnerable and have a -([0-9]+) penalty to both Physical and Special Damage Reduction/,'5'],
 ['acidSlice','native','Ituwb8YlUkp5boxz',/Critical Hit from a .*Slice.*they are Badly Poisoned/],
 ['dustRecipients','native','y5XB5KR2FF2XysmZ',/non-Ground, Rock and Steel Type creatures lose two Ticks of Hit Points at the end of their turn, and are always considered Slowed/],
 ['dustRanged','native','y5XB5KR2FF2XysmZ',/Special Ranged Moves suffer -([0-9]+) Accuracy versus target\(s\) ([0-9]+) or more meters/,'3','4'],
 ['dustHealing','native','y5XB5KR2FF2XysmZ',/Rock-Type and Ground-Type creatures heal a Tick of Hit Points at the end of their turn/],
 ['delugeActivation','native','P9g71CQGub5KzQHo',/Fire-Type Attacks fail to activate , and all creatures on the field are treated as if they have the Damp Ability/],
 ['delugeMovement','native','P9g71CQGub5KzQHo',/All creatures may utilize their Swim Capability in place of their Overland Capability, and all non-Water Type creatures cannot use the Flying or Levitate Capability/],
 ['delugeElectric','native','P9g71CQGub5KzQHo',/Damaging Electric Type attack hits any number of targets, all creatures adjacent to the target\(s\) lose ([0-9]+) Tick/,'1'],
 ['delugeNoStack','native','P9g71CQGub5KzQHo',/AoE doesn't stack multiple Ticks on bystanders/],
 ['delugeElectricType','native','P9g71CQGub5KzQHo',/considered to be Electric-Type; apply Weakness, Resistance, and applicable Abilities/],
 ['galePriority','native','HdTyaqw3uARLJjZf',/Flying-Type creatures and creatures with the Wind Rider Ability treat their Flying-Type Moves as having the .*Priority.* Keyword/],
 ['galePushFormula','native','HdTyaqw3uARLJjZf',/additional X meters \(minimum of ([0-9]+)\), where X is equal to ([0-9]+) minus their Weight Class/,'0','3'],
 ['galeExtraPush','native','HdTyaqw3uARLJjZf',/Dash.*Reckless.*Smite.*without the .*Push.*gain the .*Push.*Pushed ([0-9]+) meter/,'1'],
 ['desiccatingTypes','native','4faymH1bVfUFQiUM',/one step more super effective on all Types, and are super effective against Water-Types/],
 ['desiccatingSunny','native','4faymH1bVfUFQiUM',/All Abilities that trigger off of Sunny Weather have their effect values double/],
 ['desiccatingPhysical','native','4faymH1bVfUFQiUM',/Fire-Type Moves and Physical Steel-Type Moves now inflict Burn on ([0-9]+)\+/,'17'],
 ['blisteringStep','native','YBWVC5IMxZYqnabl',/one step more effective on Water-Types \(if a Move is Resisted, it is now Neutral\)/],
 ['blisteringSave','native','YBWVC5IMxZYqnabl',/non-Fire and Grass Type creatures suffer -([0-9]+) to their Accuracy and Save rolls/,'2'],
 ['blisteringPhysical','native','YBWVC5IMxZYqnabl',/Fire-Type Moves and Physical Steel-Type Moves now inflict Burn on ([0-9]+)\+/,'19']
);

export function effectF3eSourceFacts(audit,cleanText){
 const unit=id=>{const u=audit.sourceDefinitions.find(u=>u.id===id);return cleanText(u?.rawDefinition??u?.completeSourceUnit?.effect??'');};
 const page=id=>cleanText(audit.parentContexts.find(p=>p.id===id)?.rawText??'');
 const native=id=>cleanText(audit.nativeContexts.find(p=>p.pageId===id)?.rawText??'');
 const get={unit,page,native};
 const observations=Object.fromEntries(sourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];}));
 const system=id=>audit.targetSnapshots.find(s=>s.identity===id)?.document?.system;
 const esper=system('moves.KkMY9ELz4sIimIQB');
 return {observations,definitions:Object.fromEntries(audit.sourceDefinitions.map(u=>[u.id,unit(u.id)])),
  sourceBoundaries:{originalShellAddsTen:/10 Damage Reduction/.test(unit('core:329:ability-line60')),forecastDarkPrinted:/Dark/.test(unit('core:318:ability-line35')),optionalAmbushMeleePrinted:/Melee/.test(unit('feb:3:ability-line17')),originalWindSpeedStagePrinted:/Speed CS/.test(unit('core:335:ability-line79'))},
  currentContradiction:{body:esper?.effect,actualApply:esper?.rules.find(r=>r.key==='ApplyEffect'),separateReference:esper?.referenceEffect,reproducedGameplayFailure:false},
  currentTypedLimits:{cut:system('effects.aVm0441s0adbinyC')?.rules,windveiled:system('effects.b5SB3DE0oxrQOAgf')?.rules,heartfulTarget:system('effects.rRNxbPYAqUwY5x8x')?.rules,infernalTarget:system('effects.V3p7lsucBjAs7xxW')?.rules,engineExecutionVerified:false}};
}
export function effectF3eFactErrors(f){
 const errors=[];
 for(const[key,kind,id,re,...values]of sourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source recipient/unit/condition');}
 if(Object.values(f.sourceBoundaries).some(Boolean))errors.push('original/optional source boundary');
 const c=f.currentContradiction;
 if(!/user's Speed by 1 Combat Stage/.test(c.body??'')||c.actualApply?.uuid!=='Compendium.ptu.effects.Item.aHbD8Xyqg3NIVJXY'||c.actualApply?.affects!=='origin'||c.separateReference!=='Compendium.ptu.effects.Item.o5wKWO9OtUvgm6NO'||c.reproducedGameplayFailure!==false)errors.push('Esper Wing static producer path/body limit');
 const t=f.currentTypedLimits;
 if(t.cut?.length!==2||!t.cut.every((r,i)=>r.mode==='subtract'&&r.phase==='afterDerived'&&r.priority===99&&r.value===`min(5, @actor.modifiers.damageReduction.${i===0?'physical':'special'}.total)`))errors.push('Cut literal typed DR expression');
 if(t.windveiled?.[0]?.path!=='system.stats.spd.stages.mod'||t.engineExecutionVerified!==false)errors.push('Windveiled literal plural path/unrun');
 if(t.heartfulTarget?.[0]?.type!=='fairy'||t.infernalTarget?.[0]?.type!=='fire')errors.push('attack type effectiveness axes retained');
 return errors;
}
export function effectF3eFindings(identity,facts){
 return {completeSourceFactsAvailable:true,sourceFactsRole:'Independent clauses and exact full definitions in the same audit; per-ID source links delimit application.',
  ...(identity==='effects.aHbD8Xyqg3NIVJXY'?{currentContradiction:facts.currentContradiction}:{}),
  ...(identity==='effects.aVm0441s0adbinyC'||identity==='effects.b5SB3DE0oxrQOAgf'?{currentTypedLimits:facts.currentTypedLimits}:{}),
  actualUse:'not-run',fullCurrentVersionEstablished:false};
}
export function effectF3eSemanticRequirements(){return {
 UhXINRTcKLKHoi67:[/HOLDER15 DAMAGE REDUCTION/,/affects ORIGIN/,/No incoming item producer/,/Booster5 direct damage\/STAB2DB/],
 UnsGmd87w66COoVb:[/INTERRUPT AND FREE ACTION/,/adds NO10DR/,/Optional February9.*STANDARD ACTION INTERRUPT AND10DR/,/ONE FULL ROUND/,/not certified equivalent/],
 UnvYG2084ke5reQE:[/POKEMON.*BASE STAT1/,/per10 POKEMON LEVELS/,/CR trainer floor\(level\/20\)/,/advisory acquisition/],
 Uq3ErLQLOvNwmIZd:[/SUNNY doubles BOTH gains to2/,/actual objects add2 despite body saying1/,/Inflatable/],
 UqeBPxezR8kKEmdD:[/NON-NUCLEAR INCOMING DAMAGE15/,/not a proven equivalent/,/TWO RANDOM/,/PHYSICAL Steel OR existing Flinchrange\+4/],
 V1g2a7Lhik7xaT9q:[/FLYING TYPE OR/,/omits Flying TYPE/,/WindDB2/],
 V3p7lsucBjAs7xxW:[/FAIRY targets/,/type=fire,value2/,/not independently author/,/fixed1\.5/],
 VFdii6AArwnxfDAU:[/SUCCESSFUL HIT AND EVEN-NUMBERED ROLL/,/USER SpecialAttack1/,/not establish a gain on an even miss/],
 VIzi2QdVNob8Fudb:[/TARGET SpecialDefense1/,/on18\+/,/Smite\/Aura/,/empty keyword list/],
 Vc8riaddym8tBktm:[/MINUS OR PLUS ABILITY TARGETS/,/POSITIVE OR NEGATIVE/,/ElectricType OR MagneticCapability/,/frequency differences/],
 VdynW8bacSFsyubM:[/PER SIZE/,/clear4m radius/,/BUG\/PSYCHIC\/BLINDSENSE\/nonvisual/,/rules\[\]/],
 VpHLQKjdMiwwVGRQ:[/NON-THERIAN USER.*\+1/,/THERIAN TARGET.*-1/,/profiles only list acquisition/],
 WAcvxvCy4zhBruao:[/MELEE attacker/,/ATTACK lowered2/,/not a penalty to the shield user/],
 WGGiQ8Oay55WeEjz:[/SAVE CHECKS2/,/no native save penalty/,/No generic.*substitutes for a SaveCheck penalty/],
 WHF44ZYCCgFEXlpX:[/CRIT IMMUNITY and15DR/,/CANNOT SHIFT/,/Optional September4.*DEFENSE1/,/100-ENCOUNTER/,/not a source lifetime/],
 WhF3JNuRUGCCx4Xt:[/GENGAR/,/grantsSTEALTH4\/EVASION1/,/forbids STANDARD ACTIONS/,/tint#222224 is UNCONDITIONAL/,/not a printed tint/],
 Wm1ZxSNW7iJTHVg7:[/TEMPORARY HP equal1\/16MAX/,/INGRAIN COAT/,/Optional February8.*5 DAMAGE REDUCTION/,/no Ingrain predicate/],
 Wt0bzGOtDVlfzZeb:[/USER SPEED2/,/older same-ID exports instead use stage\.value/,/without translating them into a tested migration/],
 WwkHKAosnhprNpkJ:[/MELEE Move DB6 OR LESS BEFORE STAB\/OTHER MODIFIERS/,/Optional February3 omits melee/,/ONE FULL ROUND/,/unlimited lifetime/],
 X3nYX7OzkGqwrnxb:[/NON-GHOST.*ATTACK1\/DEFENSE1.*SPEED1/,/GHOST.*unpreventable1\/3MAXHP/,/within8m/],
 X6oZMBR5sgezfaZV:[/NO DARK FORM/,/unconditionally overwrites DARK/,/tiered8\/10\/12/,/no.*canonical/i],
 XLGCJDfkKi1nHPLr:[/POISONED OR BADLYPOISONED.*VULNERABLE AND.*5physical\/specialDR/,/TEMP HP1Tick GAIN/,/CRITICAL SLICE HIT/,/onlyDR part is automated/],
 XxsE2tDurOsmFpeJ:[/TARGET Attack1 on18\+/,/crit19\+/,/Effectiveness type=fairy,value2/,/not independently author/],
 XyHiyGScso9AO2rr:[/USER Defense2\/SpDefense2/,/ALLIES IN BURST3 Defense1\/SpDefense1/,/100-ENCOUNTER/,/no complete independent/],
 YQYxjFgbTbujbgNj:[/SPECIAL DR10\/Initiative10/,/2TICKS END-TURN AND.*SLOWED/,/heal1Tick END-TURN/,/SPECIAL RANGED Accuracy-3 only at4m/],
 YaiVsWb3XBv5dgag:[/ALL ALLIES IN AREA5 DAMAGE REDUCTION UNTIL END OF YOUR NEXT TURN/,/ALWAYS AFFECT USER/,/Four activation routes/,/Original is not healing/,/not independently approve CR/],
 YirEcq7HUwGSPBBO:[/WATER\/fire-damage-received/,/ONE STEP MORE SUPEREFFECTIVE onALLTYPES/,/ONE STEP MORE EFFECTIVE onWATER/,/not certified universally equivalent/],
 ZFqIS5WZUGaFHhxH:[/only for GRASS-TYPE POKEMON IN BURST2/,/not a benefit to every Trainer/,/no Grass\/Pokemon\/range predicates/],
 ZlTAJ7wtshgov2B4:[/FIRE MOVES FAIL ACTIVATE/,/not certified by damage\/DB-999/,/ALL creatures count as DAMP/,/NON-WATER cannotFly\/Levitate/,/ADJACENT ONE TICK maxONCE PER RESOLUTION\/noAoEstack/],
 aBjOBqdz9Y31ZFyc:[/ICE TYPE IN HAIL/,/unconditionally overwritesIce/,/tiered8\/10\/12/,/identity\/version/],
 aHbD8Xyqg3NIVJXY:[/USER DEFENSE1\/SPECIALDEFENSE1\/SPEED1/,/BODY says USER SPEED\+1/,/THREE-NEGATIVE HELPER/,/STATIC PATH\/BODY CONTRADICTION/,/without declaring a reproduced gameplay/],
 aTWbprrKwjb4xyiu:[/FLYING TYPE ORFly\/Levitate/,/FlyingMovesPRIORITY/,/max\(0,3-WeightClass\)/,/Dash\/Reckless\/Smite/,/omits FlyingTYPE/],
 aVm0441s0adbinyC:[/UP TO5 DAMAGE REDUCTION/,/MELEE\/PASS/,/does not lower Defense by5/,/lacking\.system/,/afterDerived\/priority99/,/without proving.*runtime failure/],
 azrDBZG5il1ybXfH:[/binds3AP\/RAPID/,/YOUR PURIFIED POKEMON WHILE BOUND/,/advisory acquisition diagnostics/,/real binding\/purity\/use conditions remain separate/],
 b5SB3DE0oxrQOAgf:[/NEXT FLYING MOVE DB1/,/optional February11.*SPEED1 COMBAT STAGE/,/spd\.stages\.mod \(PLURAL stages\)/,/not reproduced engine failure/],
 bHFPSVqFwplErRwk:[/BINDS2 AP\/STANDARD/,/DAMAGING RANGED ATTACKS WITH AC/,/Accuracy-2\/CRITRANGE\+3/,/critRange.mod\+3 is UNQUALIFIED/,/advisory acquisition/],
 bcqSFuBrcVMXAMFW:[/GROUNDED POKEMON AND TRAINERS/,/START OF EVERY TURN heal1TICK/,/5ROUNDS/,/noGround predicate and unlimited duration/],
 beQpq1CpBRR2Z1M6:[/NEXT FIRE MOVE DAMAGE\+5/,/Optional February5.*ATTACK1 OR SPECIALATTACK1 COMBAT STAGE/,/either-choice versus both stages/,/choice\/cancellation/]
};}

const sourceLinks={"UhXINRTcKLKHoi67":["equipment:core:297:table0:row13","equipment:core:297:table0:row16","core:142:feature-line40"],"UnsGmd87w66COoVb":["core:329:ability-line60","feb:9:ability-line51","core:435:move-line60","sep:4:move-line40"],"UnvYG2084ke5reQE":["core:112:feature-line3"],"Uq3ErLQLOvNwmIZd":["core:398:move-line32","core:305:capability-inflatable","core:372:move-line57"],"UqeBPxezR8kKEmdD":["f1:core:247:flinch","f1:feb:2:flinch"],"V3p7lsucBjAs7xxW":["f1:core:246:burned"],"V8QBZMEeIinYP9Nt":["core:418:move-line26"],"VFdii6AArwnxfDAU":["core:369:move-line60"],"VIzi2QdVNob8Fudb":["core:365:move-line3"],"Vc8riaddym8tBktm":["core:357:move-line65"],"VdynW8bacSFsyubM":["core:303:capability-blindsense","f1:core:248:blindness"],"VvCEzUbF86Et0J2h":["equipment:core:297:table0:row12"],"VwZgG2GH5ZkPv0VH":["feb:13:ability-line72","equipment:core:297:table0:row12"],"WAcvxvCy4zhBruao":["core:430:move-line24"],"WGGiQ8Oay55WeEjz":["f1:core:247:suppressed","f1:feb:2:suppression"],"WHF44ZYCCgFEXlpX":["core:435:move-line60","sep:4:move-line40"],"WhF3JNuRUGCCx4Xt":["core:307:capability-shadowmeld"],"WhitJEM99DzjqPpE":["core:372:move-line14"],"Wm1ZxSNW7iJTHVg7":["core:328:ability-line26","feb:8:ability-line67","core:381:move-line79"],"Wt0bzGOtDVlfzZeb":["core:418:move-line4"],"WwkHKAosnhprNpkJ":["core:311:ability-line33","feb:3:ability-line17","f1:core:247:flinch","f1:feb:2:flinch"],"X3nYX7OzkGqwrnxb":["core:377:move-line25"],"X6oZMBR5sgezfaZV":["core:318:ability-line35","core:413:move-line3"],"XBde5nFeK2gNVXzg":["core:390:move-line33"],"XLGCJDfkKi1nHPLr":["f1:core:246:poisoned","f1:core:248:vulnerable"],"YQYxjFgbTbujbgNj":["f1:core:248:slowed"],"YT7mT9klCrzON6Hn":["feb:13:ability-line72","equipment:core:297:table0:row12"],"YuZtR4q0GA8rovQl":["core:412:move-line3"],"ZFqIS5WZUGaFHhxH":["core:387:move-line13"],"ZlTAJ7wtshgov2B4":["feb:4:ability-line28","core:315:ability-line3","f1:core:246:burned"],"ZsE1gWTvXKjicyYi":["core:398:move-line22"],"aBjOBqdz9Y31ZFyc":["core:318:ability-line35","core:413:move-line3","core:389:move-line15"],"aHbD8Xyqg3NIVJXY":["core:372:move-line69"],"aVm0441s0adbinyC":["core:394:move-line37"],"an3L20d4q938DHwH":["core:429:move-line39"],"b5SB3DE0oxrQOAgf":["core:335:ability-line79","feb:11:ability-line67"],"bE9eMlfjYacqvVaB":["core:348:move-line13"],"bHFPSVqFwplErRwk":["core:61:feature-line33"],"bcqSFuBrcVMXAMFW":["core:381:move-line53"],"beQpq1CpBRR2Z1M6":["core:317:ability-line78","feb:5:ability-line13"]};
const nativeLinks={"UqeBPxezR8kKEmdD":["7znCkHSW9AWIyFIA","km9RudFAY1778m0q"],"V1g2a7Lhik7xaT9q":["7znCkHSW9AWIyFIA","CvjwDBLUgtnD8ebr"],"VdynW8bacSFsyubM":["7znCkHSW9AWIyFIA","a6wZkR8rJNlKHrFe","rzEXd4hoGRL4V2AS"],"VtrMd7ye9vcTIu6y":["7znCkHSW9AWIyFIA","6wkggQtDJlMSKDQT","rzEXd4hoGRL4V2AS"],"WGGiQ8Oay55WeEjz":["7znCkHSW9AWIyFIA","IAEQNRN3dhavHlYn"],"X6oZMBR5sgezfaZV":["7znCkHSW9AWIyFIA","6wkggQtDJlMSKDQT"],"XLGCJDfkKi1nHPLr":["7znCkHSW9AWIyFIA","Ituwb8YlUkp5boxz"],"YQYxjFgbTbujbgNj":["7znCkHSW9AWIyFIA","y5XB5KR2FF2XysmZ"],"YirEcq7HUwGSPBBO":["7znCkHSW9AWIyFIA","4faymH1bVfUFQiUM","YBWVC5IMxZYqnabl"],"ZlTAJ7wtshgov2B4":["7znCkHSW9AWIyFIA","P9g71CQGub5KzQHo"],"aTWbprrKwjb4xyiu":["7znCkHSW9AWIyFIA","HdTyaqw3uARLJjZf"]};

export function checkEffectF3eSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3e');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3e');
    if (!audit) { fail(!slice.recordFile, 'F3e completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3e record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3e' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3e frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3e independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3e exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 63 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 71 && audit.nativeContexts.length === 14, 'F3e bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3e full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3e complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3e full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3e exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3eSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3eFactErrors(facts).length === 0, 'F3e independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3eFactErrors(facts).join('; '));
    const proseRequirements = effectF3eSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.completeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentWeatherPlaytestAuthoringEstablished === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3e missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3e'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 129 && snapshots.size === audit.targetSnapshots.length, 'F3e exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3e exact current target/prior chronology changed: ' + s.identity);
    }

    fail(equal(audit.independentUseContextSnapshots, []), 'F3e no invented independent producer relationship');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3e full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F3e literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3e literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3e exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3d').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3e independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3e per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3e exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3eFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3e source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3e independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F3e per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === 'partially-supported' && d.completeCurrentGenerationEstablished === false, 'F3e unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3e complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3e actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectF3eRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3e complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3e exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3e exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3e incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3e complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3e historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3e finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 28, unresolved: 32}) && equal(counts, closure.counts), 'F3e bounded correspondence/limit counts changed');
}
