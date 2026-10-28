// Offline F3g source/current examination; no runtime or policy consumer.
import {effectReferences,effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='e8df84290fab7627911eacf5552574a8b372dd79e9e7a8378a73fb9b386def1c';
const SOURCE_PRIMITIVES = 'ef7d24faca7fcab7e95b055a8c7e687703d074c7390048f29fbc82ed740b815c';
const EXAMINED_DISPOSITIONS = 'ac16d6606079bab7fc76d01bfcdd714dc1cd930c88578adb3b2bc8c86c20ea1e';
const HISTORICAL_OBSERVATIONS = 'e4bac676f1512bd5b2a9695d41e72b1d674c62bd3f41f193134b2b21a4ed18d0';
export const effectF3gRuleRoles=effectOtherRuleRoles;
export const effectF3gSourceSpecifications=[
 ['meteorUser','unit','core:430:move-line82',/user's Attack ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','15'],
 ['omenRecipient','unit','core:325:ability-line24',/Choose a Pokemon or Trainer within ([0-9]+) meters/,'5'],
 ['omenAccuracy','unit','core:325:ability-line24',/target's Accuracy is lowered by ([0-9]+)/,'2'],
 ['auraPrimary','unit','feb:13:ability-line72',/user and all allies within ([0-9]+) meters gain a \+([0-9]+) Bonus to Damage Rolls with Moves matching the user's Primary Type/,'3','5'],
 ['benedictionTiming','unit','core:189:feature-line21',/after the Blessing and the attack that triggered it are resolved/],
 ['benedictionLight','unit','core:189:feature-line21',/Light Screen: \+([0-9]+) Sp. Defense Combat Stage/,'1'],
 ['benedictionSafeguard','unit','core:189:feature-line21',/Safeguard: \+([0-9]+) Evasion/,'1'],
 ['cosmicBoth','unit','core:419:move-line3',/user's Defense ([0-9]+) Combat Stage and raise the user's Special Defense ([0-9]+) Combat Stage/,'1','1'],
 ['rainOriginal','unit','core:433:move-line75',/Water-Type Attacks gain a \+([0-9]+) bonus to Damage Rolls, and Fire-Type Attacks suffer a -([0-9]+) Damage penalty/,'5','5'],
 ['rainNativeDB','native','1BAkTJOr6EgKdt6j',/Water-Type Attacks gain \+([0-9]+) DB, and Fire-Type Attacks have their DB decreased by ([0-9]+)/,'2','2'],
 ['rainElectric','native','1BAkTJOr6EgKdt6j',/All creatures gain \+([0-9]+) Accuracy with Electric-Type Moves/,'1'],
 ['electroAttacker','unit','core:357:move-line3',/adds their Speed Stat, including Combat Stages, in addition to their Special Attack/],
 ['electroDefender','unit','core:357:move-line3',/Defender in turn subtracts both their Special Defense and Speed Stats from the damage dealt before applying Type Effectiveness/],
 ['tailwindAllies','unit','core:376:move-line3',/remainder of the encounter, all allied trainers and Pokemon gain \+([0-9]+) to their Initiative/,'5'],
 ['tailwindNoStack','unit','core:376:move-line3',/Multiple instances of Tailwind cannot stack/],
 ['hailOriginalTick','unit','core:389:move-line15',/all non-Ice Type Pokemon lose a Tick of Hit Points at the beginning of their turn/],
 ['snowyCrit','native','ZYjNu2vxlx8lAGBt',/Ice-Type Moves are Critical Hits on (19-20).*?already has an extended Critical Hit range, that range is increased by \+([0-9]+)/,'19-20','2'],
 ['snowyDR','native','ZYjNu2vxlx8lAGBt',/Ice-Type creatures gain \+([0-9]+) Physical Damage Reduction/,'5'],
 ['bubbleOmission','unit','core:432:move-line57',/Bubble Beam lowers the target's Speed on ([0-9]+)\+/,'18'],
 ['bubbleDB','unit','core:432:move-line57',/Damage Base ([0-9]+)/,'8'],
 ['sageMaximum','unit','core:189:feature-line3',/Occult Education Rank doubled or their Tick Value, whichever is higher, for one full round/],
 ['sageNoStack','unit','core:189:feature-line3',/Multiple uses of Sage from different Trainers do not stack on one target/],
 ['sageExceptionFrequency','page','core:189',/Highly Responsive to Prayers.*?Scene x([0-9]+) - Free Action/,'3'],
 ['sageStackException','page','core:189',/Multiple instances of Sage's effect that you use may stack when used this way/],
 ['crushEven','unit','core:394:move-line15',/target's Defense ([0-9]+) Combat Stage on Even-?Numbered Rolls/,'1'],
 ['snowWarningOriginal','unit','core:330:ability-line18',/Weather changes to Hail for ([0-9]+) rounds/,'5'],
 ['hailstormCrit','native','FTqtnKvnn0QYJjHC',/Ice-Type Moves are Critical Hits on (19-20).*?already has an extended Critical Hit range, that range is increased by \+([0-9]+)/,'19-20','2'],
 ['hailstormFreeze','native','FTqtnKvnn0QYJjHC',/Ice-Type Moves and Physical Steel-Type Moves now Freeze on ([0-9]+)\+\s*\. If the Move already Freezes, the Effect Range for Freeze increases by ([0-9]+)/,'19','1'],
 ['hailstormHazards','native','FTqtnKvnn0QYJjHC',/Spikes and Stealth Rock Hazards gain the Ice-Type/],
 ['whiteoutCrit','native','2C7HSokfWnJFysjJ',/Critical Hits on (18-20).*?already has an extended Critical Hit range, that range is increased by \+([0-9]+)/,'18-20','3'],
 ['whiteoutNonIce','native','2C7HSokfWnJFysjJ',/All non-Ice Type creatures lose a Tick of Hit Points at the end of their turn, and are always Slowed/],
 ['whiteoutWater','native','2C7HSokfWnJFysjJ',/Damaging Water-Type Moves deal damage as if they were Ice-Type/],
 ['whiteoutHazards','native','2C7HSokfWnJFysjJ',/All Hazards gain the Ice-Type/],
 ['whiteoutFreeze','native','2C7HSokfWnJFysjJ',/Ice-Type Moves and Physical Steel-Type Moves now Freeze on ([0-9]+)\+\s*\. If the Move already Freezes, the Effect Range for Freeze increases by ([0-9]+)/,'18','2'],
 ['forecastReset','unit','core:318:ability-line35',/returns to Normal Type if it is in normal weather or foggy weather/],
 ['weatherBallOriginal','unit','core:413:move-line3',/weather effect is on the field, Weather Ball has a Damage Base of ([0-9]+)/,'10'],
 ['bloomAppearance','unit','core:303:capability-bloom',/Sunny weather it transforms; changing its appearance from the closed bud, purple-petal form into the pink open flower form/],
 ['flusterVolatile','unit','core:46:feature-line15',/hit with a Move with the Social keyword, the target takes a -([0-9]+) penalty to Save Checks against Volatile Status Afflictions for ([0-9]+) full round/,'2','1'],
 ['supersonicMiss','unit','core:410:move-line32',/On miss, the target suffers a -([0-9]+) penalty to Accuracy Rolls for one full round/,'2'],
 ['octazookaEven','unit','core:433:move-line54',/On an Even-?Numbered Roll, the target's Accuracy is Lowered by ([0-9]+)/,'1'],
 ['hammerUser','unit','core:365:move-line40',/user lowers their Speed ([0-9]+) Combat Stage/,'1'],
 ['hammerAC','unit','core:365:move-line40',/AC: ([0-9]+)/,'3'],
 ['magneticOriginal','unit','core:357:move-line65',/targets with the Minus or Plus Ability have their Defense and Special Defense raised by \+([0-9]+) Combat Stage/,'1'],
 ['splashJump','unit','core:409:move-line38',/single Jump, adding \+([0-9]+) to their Long Jump and High Jump values/,'1'],
 ['splashEndpoint','unit','core:409:move-line38',/gains \+([0-9]+) Evasion until the end of their next turn/,'2'],
 ['closeCombatUser','unit','core:363:move-line56',/user's Defense and Special Defense are each lowered by -([0-9]+) Combat Stage/,'1'],
 ['terrainGrounded','unit','core:356:move-line59',/Pokemon and Trainers touching the ground are immune to Sleep/],
 ['terrainDamage','unit','core:356:move-line59',/Electric-Type attacks used by Pokemon and Trainers touching the ground gain a \+([0-9]+) Bonus to Damage Rolls/,'10'],
 ['justifiedOriginal','unit','core:321:ability-line70',/hit by a damaging Dark Type Move Effect: The user may raise its Attack ([0-9]+) Combat Stage/,'1'],
 ['justifiedOptional','unit','feb:6:ability-line30',/hit by a damaging Dark Type Move or Attack of Opportunity/],
 ['justifiedIntercept','unit','feb:6:ability-line30',/always gains a \+([0-9]+) bonus to Skill Checks made to Intercept/,'4'],
 ['aromaticAllies','unit','core:360:move-line4',/All allies in Aromatic Mist's area of effect have their Special Defense raised ([0-9]+) Combat Stage/,'1'],
 ['helperSingle','unit','core:320:ability-line18',/Move that targets a single Ally, that Ally gains a \+([0-9]+) Bonus to Accuracy and Skill Checks until the end of the user's next turn/,'1'],
 ['songUser','page','core:164',/Regardless of the Area of Effect, Songs always affect the user/],
 ['songActions','page','core:164',/As a Full Action, you may trigger (two) Songs, each with an Area of Effect of Burst ([0-9]+)/,'two','4'],
 ['songMight','page','core:164',/Song of Might ([0-9]+) AP.*?All Allies in the Area of Effect gain a \+([0-9]+) Bonus to Damage Rolls until the end of your next turn/,'1','5'],
 ['punchHit','unit','core:366:move-line46',/successfully hits a target, the user's Attack is raised by \+([0-9]+) Combat Stage/,'1'],
 ['punchFrequency','unit','core:366:move-line46',/Frequency: (EOT)/,'EOT'],
 ['earthAllTargets','unit','core:385:move-line71',/Special Defense of all Legal Targets ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','16'],
 ['playRoughBound','unit','core:361:move-line84',/target's Attack ([0-9]+) Combat Stage on (17-20) during Accuracy Check/,'1','17-20'],
];
export function effectF3gSourceFacts(audit,cleanText){
 const unit=id=>{const u=audit.sourceDefinitions.find(u=>u.id===id);return cleanText(u?.rawDefinition??u?.completeSourceUnit?.effect??'');};
 const page=id=>cleanText(audit.parentContexts.find(p=>p.id===id)?.rawText??'');
 const native=id=>cleanText(audit.nativeContexts.find(p=>p.pageId===id)?.rawText??'');
 const get={unit,page,native},system=id=>audit.rootCurrentSystems?.[id]??audit.targetSnapshots.find(s=>s.identity===id)?.document?.system;
 const root=id=>system('effects.'+id),move=id=>system('moves.'+id);
 return {observations:Object.fromEntries(effectF3gSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),
  definitions:Object.fromEntries(audit.sourceDefinitions.map(u=>[u.id,unit(u.id)])),
  sourceBoundaries:{bubbleAmountOrStagePrinted:/Speed (?:by|[+-]?\d)|Combat Stage/i.test(unit('core:432:move-line57')),independentCurrentShadowNuclearCRWeatherFrameworkApproved:false,justifiedAooQualifierAdjudicated:false},
  currentObservations:{bubbleDB:[move('0O3ntZlEtOYU7vqT')?.damageBase,move('MkQLfqYsti5jwzTm')?.damageBase],speedDR:root('kHGvVHRG6TqNt7op')?.rules,sageRules:root('lQBCt9nEw2ZElij1')?.rules,sageBody:root('lQBCt9nEw2ZElij1')?.effect,
   filletBody:root('lJCquXHCivdCMsZp')?.effect,filletRules:root('lJCquXHCivdCMsZp')?.rules,magneticBody:move('TvQ1jJr71rELMuTc')?.effect,magneticRules:root('nlFYpVcKOUob2cBS')?.rules,
   esperReference:move('KkMY9ELz4sIimIQB')?.referenceEffect,esperExecutable:move('KkMY9ELz4sIimIQB')?.rules.find(r=>r.key==='ApplyEffect'),esperActualTarget:system('effects.aHbD8Xyqg3NIVJXY')?.rules,
   justifiedPath:root('oWoo3iPRRLEUYkZU')?.rules[0]?.path,flusterRule:root('n1GqXEIcRzrAtMli')?.rules[0],flusterDuration:root('n1GqXEIcRzrAtMli')?.duration,
   snowyRules:root('kdMo2CqufGgmJUyg')?.rules,hailstormRules:root('lwfzwWniBPCUy4Lm')?.rules,whiteoutRules:root('lyGTa3a3oLvpX3t9')?.rules,
   terrainRule:root('oMC7M6N3hUs3m1eG')?.rules[0],hammerAC:move('uX0GA4opzRCtDQVY')?.ac,punchFrequency:move('fCWLpvekbsjaPVHA')?.frequency,
   shadyRules:root('qh5v2VAjp8YFIUT5')?.rules,playRoughRange:move('MayZhpGvJzcbv8BT')?.rules[0]?.range},
  manualWeatherNotes:{hailstorm:(native('FTqtnKvnn0QYJjHC').match(/This part of the effect is not Automated!/g)??[]).length,whiteout:(native('2C7HSokfWnJFysjJ').match(/This part of the effect is not Automated!/g)??[]).length},
  unresolvedExecution:{reproducedGameplayFailure:false,sourceAmountsAndStoredFieldsEstablishWholeVersion:false,critAndFreezeAlternativeBranchesVerified:false,actualUseAndPreservation:'not-run'}};
}
export function effectF3gFactErrors(f){
 const errors=[];
 for(const[key,kind,id,re,...values]of effectF3gSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source recipient/unit/condition');}
 if(Object.values(f.sourceBoundaries).some(Boolean))errors.push('printed omission/independent authoring/qualifier boundary');
 const c=f.currentObservations;
 if(JSON.stringify(c.bubbleDB)!=='["7","7"]')errors.push('BubbleBeam two current DB7 values');
 if(c.speedDR?.length!==2||!c.speedDR.every(r=>r.value==='@actor.system.stats.spd.total'&&r.phase==='afterDerived')||c.speedDR[0]?.path!=='system.modifiers.damageReduction.physical.mod'||c.speedDR[1]?.path!=='system.modifiers.damageReduction.special.mod')errors.push('SpeedDR exact additive current typed expressions');
 if(c.sageRules?.length!==2||!c.sageRules.every(r=>r.value==='max(floor({actor|system.health.total}/10),0)')||!/edit the last 0 in both rules/.test(c.sageBody??''))errors.push('Sage literal formula/manual rank instruction');
 if(c.filletBody!=='+1 Atk CS, +1 Def CS, +1 Spd CS'||JSON.stringify(c.filletRules?.map(r=>[r.path,r.value]))!==JSON.stringify(['atk','spatk','spd'].map(s=>[`system.stats.${s}.stage.mod`,2])))errors.push('FilletAway static body/rule contradiction');
 if(!/Electric-Type or have the Magnetic Capability/.test(c.magneticBody??'')||!c.magneticRules?.every(r=>r.mode==='subtract'&&r.value===1))errors.push('MagneticFlux original positive/current choice-negative distinction');
 if(c.esperReference!=='Compendium.ptu.effects.Item.o5wKWO9OtUvgm6NO'||c.esperExecutable?.uuid!=='Compendium.ptu.effects.Item.aHbD8Xyqg3NIVJXY'||c.esperExecutable.affects!=='origin'||!c.esperActualTarget?.every(r=>r.mode==='subtract'&&r.value===1))errors.push('EsperWing exact executable/reference and signed target discrepancy');
 if(c.justifiedPath!=='system.stats.atk.stages.mod'||c.flusterRule?.selectors!=='save-check'||JSON.stringify(c.flusterRule?.predicate)!=='[]'||c.flusterDuration?.expiry!=='turn-end')errors.push('Justified plural literal and Flustering unrestricted save/endpoint');
 if(c.snowyRules?.[0]?.value!==1||c.hailstormRules?.[0]?.value!==1||c.whiteoutRules?.[0]?.value!==2)errors.push('native cold current crit-only modifiers');
 for(const [rs,range]of [[c.hailstormRules,'19'],[c.whiteoutRules,'18']]){const r=rs?.filter(r=>r.key==='ApplyEffect');if(r?.length!==2||r[0]?.selectors!=='ice-damage-received'||r[1]?.selectors!=='steel-damage-received'||!r[1]?.predicate?.includes('move:category:physical')||!r.every(r=>r.range===range&&r.uuid==='Compendium.ptu.effects.Item.7F4dkJoDuD7wNcEK'))errors.push('cold fixed Freeze/physical Steel paths');}
 if(c.terrainRule?.selectors!=='electric-damage-base'||c.terrainRule?.value!==2||JSON.stringify(c.terrainRule?.predicate)!=='[]'||c.hammerAC!=='2'||c.punchFrequency!=='At-Will'||c.playRoughRange!=='17')errors.push('terrain typed units and current Move differences');
 if(c.shadyRules?.[0]?.value!==c.shadyRules?.[1]?.value||JSON.stringify(c.shadyRules?.[2]?.value)!=='["{actor|species.system.types}","Shadow"]')errors.push('Shady literal image and nested type expressions');
 if(f.manualWeatherNotes.hailstorm!==2||f.manualWeatherNotes.whiteout!==3)errors.push('complete native manual notes');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.sourceAmountsAndStoredFieldsEstablishWholeVersion!==false||f.unresolvedExecution.critAndFreezeAlternativeBranchesVerified!==false||f.unresolvedExecution.actualUseAndPreservation!=='not-run')errors.push('source/static review promoted to behavior or whole version');
 return errors;
}
export function effectF3gFindings(identity,facts){return {sourceFactsRole:'Complete independent raw definitions and parent/native clauses are scoped by exact per-ID source links; no canonical/current-version or runtime approval.',sourceBoundaries:facts.sourceBoundaries,actualUse:'not-run',fullCurrentVersionEstablished:false,
 ...(['kHGvVHRG6TqNt7op','lQBCt9nEw2ZElij1','lJCquXHCivdCMsZp','nlFYpVcKOUob2cBS','o5wKWO9OtUvgm6NO','oWoo3iPRRLEUYkZU','n1GqXEIcRzrAtMli','kdMo2CqufGgmJUyg','lwfzwWniBPCUy4Lm','lyGTa3a3oLvpX3t9','oMC7M6N3hUs3m1eG','qh5v2VAjp8YFIUT5','kjC2cYH3BwlhXga6'].includes(identity.split('.')[1])?{currentObservations:facts.currentObservations}: {})};}
export function effectF3gSemanticRequirements(){return {
 iA0lJV2Ftpscl6aB:[/USER ATTACK1 COMBAT STAGE on15\+/,/ORIGIN.*15 path/],
 iEqWJwbrNV48sAXB:[/POKEMON OR TRAINER WITHIN5METERS/,/SCENE\/SWIFT/,/RAPID/],
 iHia9ZGQYY02FmCk:[/damage-base2.*not direct damage2/,/no incoming UUID producer or actor-Type condition/],
 iMEih8csttUKHcVd:[/EPHEMERAL TO ORIGIN on shadow-attack/,/No independently approved complete Shadow\/HyperMode authoring/],
 iMqiaI1FNcjldpWk:[/ALLIES WITHIN3METERS/,/MOVES MATCHING USER PRIMARY TYPE/,/unlinked Dark/],
 iNfiGKyKNYhNWRBi:[/LIGHTSCREEN SPECIALDEFENSE1/,/AFTER BOTH BLESSING AND TRIGGERING ATTACK RESOLVE/],
 ibXN762EDR6GmwAK:[/ALLIES WITHIN3METERS/,/unlinked Shadow/,/no.*whole subsystem/],
 ioB998hEO5qD4Bum:[/USER DEFENSE1 AND SPECIALDEFENSE1/,/duration100 ENCOUNTERS/],
 ivcFORwpOWT0PAwd:[/WATER DB\+2\/FIRE DB-2/,/ELECTRIC ACCURACY\+1/,/DAMAGE\+5\/FIRE DAMAGE-5/],
 kHGvVHRG6TqNt7op:[/PHYSICAL AND SPECIAL DR add actor SPEED TOTAL/,/USER ADDS SPEED INCLUDING STAGES TO SPECIALATTACK/,/SUBTRACTS BOTH SPECIALDEFENSE AND SPEED BEFORE TYPE EFFECTIVENESS/],
 kPWQIe8hEv6JIfEw:[/HIGHER TARGET ATTACK OR SPECIALATTACK/,/no executable selection branch/,/not full independent PTU Move authoring/],
 kPy5nQeKyYsCBrZv:[/EPHEMERAL TO TARGET.*target:types:shadow/,/Effectiveness fighting\/value2/,/body says.*18\+.*actual.*19/],
 kQdPof3rxBVN6BiS:[/ALL ALLIED TRAINERS AND POKEMON INITIATIVE5/,/MULTIPLE INSTANCES CANNOT STACK/,/does not independently author.*canonical alternative/],
 kSiliSDfQ3w7MNPW:[/ONE ADJACENT ALLY/,/FIVE ROUNDS/,/independent PTU\/PTR\/homebrew authoring and generation remain unavailable/],
 kdMo2CqufGgmJUyg:[/BASE ICE CRITICAL19-20.*EXISTING EXTENDED CRIT RANGE\+2/,/no alternative extended-range branch/,/BEGINNING-TURN TICK LOSS/],
 kjC2cYH3BwlhXga6:[/OMITS THE AMOUNT AND COMBAT-STAGE UNIT/,/not an extraction tail/,/Source DB8.*BOTH CURRENT DB7/],
 lJCquXHCivdCMsZp:[/ATTACK\/SPECIALATTACK\/SPEED2.*HALF MAXHP/,/BODY\/SNIPPET say ATTACK\/DEFENSE\/SPEED1/,/STATIC BODY\/RULE CONTRADICTION/],
 lQBCt9nEw2ZElij1:[/MAX\(DOUBLE TRAINER OCCULT RANK,TARGET TICK\).*ONE FULL ROUND/,/HighlyResponsiveToPrayers SCENEX3\/FREE explicitly permits STACKING/,/BINDS2AP\/while-bound/,/not an actual trainer-rank lookup/],
 llEEyZBsfTIiPLxv:[/TARGET DEFENSE1.*EVEN-NUMBERED/,/even:true/],
 lwfzwWniBPCUy4Lm:[/BASECRIT19-20\/EXISTING CRIT\+2/,/ICE OR PHYSICAL STEEL FREEZE19\+\/EXISTING FREEZE\+1/,/Two manual notes/],
 lyGTa3a3oLvpX3t9:[/BASECRIT18-20\/EXISTING CRIT\+3/,/NON-ICE END-TURN TICK AND ALWAYS SLOWED/,/DAMAGING WATER AS ICE/,/ALL HAZARDS ICE/,/EXISTING FREEZE\+2/,/Three manual notes/],
 mDpTmAZRYjaS0uNs:[/USER\/ALLIES WITHIN3METERS/,/MOVES MATCHING USER PRIMARY TYPE/,/EMPTY SLUG/],
 mHxISV2xM8XfmSIJ:[/SAFEGUARD EVASION1/,/AFTER BOTH BLESSING AND TRIGGERING ATTACK RESOLVE/,/not three stacked benefits/],
 mMr9GOhuO4YM0v5o:[/NORMAL reset.*fog/,/UNCONDITIONAL FIRE ARRAY/,/tier DB8\/10\/12.*storedDB8/],
 miokClfWX2SW58kc:[/CHERRIM APPEARANCE.*CLOSED PURPLE BUD.*OPEN PINK FLOWER IN SUNNY/,/no executable weather activation/,/mixed string shiny predicates/],
 n1GqXEIcRzrAtMli:[/SAVE CHECKS-2 AGAINST VOLATILE AFFLICTIONS FOR ONE FULL ROUND WHEN HIT BY A SOCIAL MOVE/,/not an add veto/,/lacks the volatile-only predicate/],
 n3v7hO3picQOgFNY:[/ON MISS.*ACCURACY-2 FOR ONE FULL ROUND/,/referenceEffect to separate Confused/,/No automatic miss trigger/],
 nDEV77l0d4x7pnIz:[/TARGET ACCURACY1 ON EVEN-NUMBERED ROLL/,/not an Evasion\/stat stage/],
 nOd3v02f918iW2aV:[/USER SPEED1 COMBAT STAGE/,/AC3/,/stores AC2/],
 nlFYpVcKOUob2cBS:[/Original MagneticFlux.*RAISES.*PLUS OR MINUS/,/chooses\+1 OR-1.*ELECTRIC TYPES OR MAGNETIC/,/negative helper SUBTRACTS1/],
 o5wKWO9OtUvgm6NO:[/BODY\/REFERENCE.*SPEED\+1/,/actual ApplyEffect.*aHbD8Xyqg3NIVJXY/,/STATIC EXECUTABLE-TARGET VERSUS REFERENCE discrepancy/,/No reproduced gameplay/],
 o6ScOYInR7tlYlA9:[/LONG AND HIGH JUMP\+1/,/EVASION2 UNTIL END OF USER NEXT TURN/,/TURN-START/],
 oEJCJK91P8dzHas4:[/USER DEFENSE1 AND SPECIALDEFENSE1/,/rather than reversing signs or assigning losses to the target/],
 oMC7M6N3hUs3m1eG:[/GROUNDED POKEMON AND TRAINERS SLEEP IMMUNITY/,/DAMAGE ROLLS\+10.*DAMAGEBASE\+2/,/distinct units/],
 oWoo3iPRRLEUYkZU:[/February6 explicitly adds ATTACK OF OPPORTUNITY/,/ALWAYS INTERCEPT SKILLS\+4/,/PLURAL system.stats.atk.stages.mod/,/not an adjudicated/],
 olm2VRK6NeZrRmHs:[/ALL ALLIES IN BURST1 SPECIALDEFENSE1/,/not unconditionally every creature/],
 oy9yit4Z1FNnQZSo:[/MOVE TARGETING ONE ALLY.*ACCURACY1 AND SKILLCHECKS1 UNTIL END OF USER NEXT TURN/,/reference/],
 pJWwZt4iBDBNd0U2:[/DAMAGE ROLLS\+5 UNTIL END OF USER NEXT TURN/,/SONGS ALWAYS AFFECT USER/,/FULL\/twoSongs\/Burst4/,/CR framework/],
 pOAH4kjw9zTft5k2:[/IF IT SUCCESSFULLY HITS/,/ATWILL rather than originalEOT/],
 psUtSPNbj7U8siCT:[/ALL LEGAL TARGETS ON16\+/,/not predicates on the helper itself/],
 qB11qo6ylw2GV8bX:[/IF NOT SUNNY.*SUNNY IMMEDIATELY RESOLVES/,/Alola39 only supplies level47 acquisition/],
 qVxU03cPaURRvWbA:[/ON17-20 DURING ACCURACY CHECK/,/UPPER BOUND20/,/open threshold/],
 qh5v2VAjp8YFIUT5:[/NORMAL in normal\/FOGGY/,/BOTH SHINY\/NONSHINY the SAME NONSHINY sprite/,/no assumed flattening/],
};}

const sourceLinks={"iA0lJV2Ftpscl6aB":["core:430:move-line82"],"iEqWJwbrNV48sAXB":["core:325:ability-line24"],"iMqiaI1FNcjldpWk":["feb:13:ability-line72"],"iNfiGKyKNYhNWRBi":["core:189:feature-line21"],"ibXN762EDR6GmwAK":["feb:13:ability-line72"],"ioB998hEO5qD4Bum":["core:419:move-line3"],"ivcFORwpOWT0PAwd":["core:433:move-line75"],"kHGvVHRG6TqNt7op":["core:357:move-line3"],"kQdPof3rxBVN6BiS":["core:376:move-line3","core:304:capability-guster"],"kdMo2CqufGgmJUyg":["core:389:move-line15"],"kjC2cYH3BwlhXga6":["core:432:move-line57"],"lQBCt9nEw2ZElij1":["core:189:feature-line3","core:189:feature-line42"],"llEEyZBsfTIiPLxv":["core:394:move-line15"],"lwfzwWniBPCUy4Lm":["core:330:ability-line18","core:389:move-line15","f1:core:246:frozen","f1:feb:2:vulnerable"],"lyGTa3a3oLvpX3t9":["core:389:move-line15","f1:core:248:slowed","f1:core:246:frozen","f1:feb:2:vulnerable"],"mDpTmAZRYjaS0uNs":["feb:13:ability-line72"],"mHxISV2xM8XfmSIJ":["core:189:feature-line21"],"mMr9GOhuO4YM0v5o":["core:318:ability-line35","core:413:move-line3"],"mUfq8siRgcMsFvFT":["f1:core:247:confused","f1:feb:2:confusion"],"miokClfWX2SW58kc":["core:303:capability-bloom"],"n1GqXEIcRzrAtMli":["core:46:feature-line15","core:48:feature-line46","core:55:feature-line10"],"n3v7hO3picQOgFNY":["core:410:move-line32","core:362:move-line3"],"nDEV77l0d4x7pnIz":["core:433:move-line54"],"nOd3v02f918iW2aV":["core:365:move-line40"],"nlFYpVcKOUob2cBS":["core:357:move-line65"],"o6ScOYInR7tlYlA9":["core:409:move-line38"],"oEJCJK91P8dzHas4":["core:363:move-line56"],"oMC7M6N3hUs3m1eG":["core:356:move-line59"],"oWoo3iPRRLEUYkZU":["core:321:ability-line70","feb:6:ability-line30"],"olm2VRK6NeZrRmHs":["core:360:move-line4"],"oy9yit4Z1FNnQZSo":["core:320:ability-line18"],"pJWwZt4iBDBNd0U2":["core:164:feature-line3"],"pOAH4kjw9zTft5k2":["core:366:move-line46"],"psUtSPNbj7U8siCT":["core:385:move-line71"],"qVxU03cPaURRvWbA":["core:361:move-line84"],"qh5v2VAjp8YFIUT5":["core:318:ability-line35","core:413:move-line3"]};
const nativeLinks={"ivcFORwpOWT0PAwd":["7znCkHSW9AWIyFIA","1BAkTJOr6EgKdt6j"],"kdMo2CqufGgmJUyg":["7znCkHSW9AWIyFIA","ZYjNu2vxlx8lAGBt"],"lwfzwWniBPCUy4Lm":["7znCkHSW9AWIyFIA","FTqtnKvnn0QYJjHC","ZYjNu2vxlx8lAGBt","dQEKXsTMNe7jOaqH"],"lyGTa3a3oLvpX3t9":["7znCkHSW9AWIyFIA","2C7HSokfWnJFysjJ","FTqtnKvnn0QYJjHC","ZYjNu2vxlx8lAGBt","dQEKXsTMNe7jOaqH"]};

export function checkEffectF3gSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3g');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3g');
    if (!audit) { fail(!slice.recordFile, 'F3g completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3g record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3g' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3g frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3g independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3g exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 57 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 61 && audit.nativeContexts.length === 8, 'F3g bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3g full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3g complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3g full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3g exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3gSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3gFactErrors(facts).length === 0, 'F3g independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3gFactErrors(facts).join('; '));
    const proseRequirements = effectF3gSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.completeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentWeatherPlaytestAuthoringEstablished === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3g missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3g'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 118 && snapshots.size === audit.targetSnapshots.length, 'F3g exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3g exact current target/prior chronology changed: ' + s.identity);
    }

    fail(equal(audit.independentUseContextSnapshots, []), 'F3g no invented independent producer relationship');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3g full relative embedded native context missing');
    }
    fail(embeds.length === 3 && equal(embeds, audit.nativeContextEmbeds), 'F3g literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3g literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3g exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3f').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3g independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F3g full root-system inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3g per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3g exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3gFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3g source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3g independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F3g per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F3g unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3g complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3g actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectF3gRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3g complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3g exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3g exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3g incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3g complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3g historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3g finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 22, unresolved: 38}) && equal(counts, closure.counts), 'F3g bounded correspondence/limit counts changed');
}
