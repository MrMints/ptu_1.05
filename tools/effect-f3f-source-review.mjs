// Offline F3f source/current examination; no runtime or policy consumer.
import {effectReferences,effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='125a3ec6948cc741fe90399f0e9f2ff64af56e9426f2f7d20144195e624dfb9c';
const SOURCE_PRIMITIVES = '3f0be224bee0232ea95766368d7b1b4eb25e6eb4f68a5cc69a0f5dc6d72ce9c6';
const EXAMINED_DISPOSITIONS = '7f77b28ba9be95d5dc3c6965d96513bf0f14bb49f0c00eb070cc0b538f2dc623';
const HISTORICAL_OBSERVATIONS = '37e699a67315d7940fc9877319f8430c5b84e3139425baa48cc6a1d0bf20442e';
export function effectF3fRuleRoles(doc){return effectOtherRuleRoles(doc).map((role,i)=>{
 const r=doc.system.rules[i];
 if(r.key==='TempHP')return {...role,domain:'temporary-hit-points',unit:'hit-points',value:r.value,literalDerivedExpression:r.value,executionVerified:false};
 if(r.path==='system.modifiers.hardened')return {...role,domain:'literal-string-state',value:r.value,literalValueType:typeof r.value,executionVerified:false};
 return role;
});}
const sourceSpecifications=[
 ['ironThreshold','unit','core:430:move-line13',/target's Defense ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','15'],
 ['wearStat','unit','core:289:move-line36',/target's Defense by ([0-9]+) Combat Stage on Even-?Numbered Rolls/,'1'],
 ['enduringOriginal','unit','core:99:feature-line3',/add to your Pokemon's HP stat when they level up, ignoring Base Relation/],
 ['snowOriginal','unit','core:330:ability-line13',/Evasion is increased by \+([0-9]+) while in Hail/,'2'],
 ['snowOptional','unit','feb:9:ability-line65',/gains \+([0-9]+) Evasion. This is increased to \+([0-9]+) Evasion while in Hail or snowy terrain/,'1','2'],
 ['snowAdjacent','unit','feb:9:ability-line65',/user and adjacent allies do not lose Hit Points due to the Hail/],
 ['mudBomb','unit','core:386:move-line51',/Accuracy is lowered by -([0-9]+) on ([0-9]+)\+/,'1','16'],
 ['leafUser','unit','core:382:move-line13',/Lower the user's Special Attack ([0-9]+) Combat Stages after damage/,'2'],
 ['screechSign','unit','core:406:move-line73',/All Legal Targets have their Defense lowered ([0-9]+) Combat Stages/,'2'],
 ['sunnyGrowth','unit','core:398:move-line32',/If it is Sunny, double the amount of Combat Stages gained/],
 ['rockTombAccuracy','unit','core:427:move-line3',/AC: ([0-9]+)/,'5'],
 ['sweetFloor','unit','core:410:move-line68',/Total Evasion may not be lowered to a negative value/],
 ['sipperOriginalHit','unit','core:328:ability-line68',/If a damaging Grass Type attack hits the user, the user gains \+([0-9]+) Attack Combat Stage/,'1'],
 ['sipperOriginalFrequency','unit','core:328:ability-line68',/Sap Sipper Static/],
 ['sipperOptionalFrequency','unit','feb:8:ability-line76',/Sap Sipper Scene/],
 ['sipperOptionalChoice','unit','feb:8:ability-line76',/If the user is hit by a Grass-Type attack, they gain \+([0-9]+) CS in their choice of Attack or Special Attack/,'1'],
 ['boneBoundary','unit','feb:4:ability-line3',/Bone Club, Bonemerang, and Bone Rush Moves ignore immunity against Ground-Type Moves/],
 ['forecastRock','unit','core:318:ability-line35',/Rock Type if there is a Sandstorm/],
 ['weatherBallOriginal','unit','core:413:move-line3',/When a weather effect is on the field, Weather Ball has a Damage Base of ([0-9]+)/,'10'],
 ['shieldOriginalBase','unit','equipment:core:294:table0:row6',/Light Shields grant \+([0-9]+) Evasion/,'2'],
 ['shieldReadied','unit','equipment:core:294:table0:row6',/Standard Action to instead grant \+([0-9]+) Evasion and ([0-9]+) Damage Reduction until the end of your next turn/,'4','10'],
 ['shieldSlowed','unit','equipment:core:294:table0:row6',/cause you to become Slowed for that duration/],
 ['shieldOptional','page','sep:4',/Light Shields \(now just Shields\) grant a \+([0-9]+) Evasion.*?rather than \+([0-9]+)/,'1','2'],
 ['shieldHeavyRemoval','page','sep:4',/Heavy Shields are removed from the system/],
 ['competitiveExclusion','unit','core:314:ability-line3',/something other than its own Moves or Abilities/],
 ['competitiveAmount','unit','core:314:ability-line3',/Special Attack is raised ([0-9]+) Combat Stages/,'2'],
 ['muddyAccuracy','unit','core:433:move-line41',/AC: ([0-9]+)/,'5'],
 ['muddyThreshold','unit','core:433:move-line41',/On ([0-9]+)\+, the Accuracy of all targets is lowered by ([0-9]+)/,'16','1'],
 ['snarlTargets','unit','core:353:move-line3',/All Legal Targets have their Special Attack lowered ([0-9]+) Combat Stage/,'1'],
 ['inflatedPercent','unit','core:305:capability-inflatable',/expand its size up to ([0-9]+)% of its normal size as a Standard Action/,'125'],
 ['inflatedWeight','unit','core:305:capability-inflatable',/does not change its weight/],
 ['inflatedTerrain','unit','core:305:capability-inflatable',/-([0-9]+) Penalty to Evasion, but become Blocking Terrain; you may not target through an Inflated Pokemon/,'1'],
 ['inflatedRevert','unit','core:305:capability-inflatable',/Returning to normal size is a Shift Action/],
 ['swaggerAccuracy','unit','core:410:move-line43',/AC: ([0-9]+)/,'4'],
 ['swaggerTarget','unit','core:410:move-line43',/target's Attack is raised ([0-9]+) Combat Stages. Swagger Confuses the target/,'2'],
 ['autotomizeWeight','unit','core:429:move-line4',/Weight Class is one value lower, to a minimum of ([0-9]+)/,'1'],
 ['autotomizeConditional','unit','core:429:move-line4',/If the user can, the user's Speed is raised by \+([0-9]+) Combat Stages/,'2'],
 ['autotomizeEndpoint','unit','core:429:move-line4',/For the remainder of the Encounter/],
 ['sageTiming','unit','core:189:feature-line21',/after the Blessing and the attack that triggered it are resolved/],
 ['sageAccuracy','unit','core:189:feature-line21',/Lucky Chant: \+([0-9]+) Accuracy/,'1'],
 ['howlFrequency','unit','core:399:move-line75',/Frequency: At-Will/],
 ['howlUser','unit','core:399:move-line75',/Range: Self Effect: Raise the user's Attack ([0-9]+) Combat stage/,'1'],
 ['hardenedOne','page','core:105',/1 or more injuries, they gain \+1 to Critical Hit and Effect Range/],
 ['hardenedThree','page','core:105',/3 or more injuries, they gain \+1 Evasion and \+5 to Initiative/],
 ['hardenedFive','page','core:105',/5 or more injuries, they gain \+5 Damage Reduction/],
 ['hardenedSeven','page','core:105',/7 or more injuries, they are immune to Loss of Hit Points \(but not damage\) from all effects/],
 ['hardenedNine','page','core:105',/9 or more injuries, they resist all damage one step further/],
 ['pressOnDoubling','page','core:105',/Master: While acting at 0 Hit Points or less, your Pokemon's Critical Hit, Effect Range, Evasion, Initiative, Damage Reduction, and Resistance Bonuses from being Hardened are doubled/],
 ['fightOriginalTrigger','unit','throhs:49:feature-line33',/Hit Points are lowered to or below 0 while Enraged/],
 ['fightOriginalFaint','unit','throhs:49:feature-line33',/Faint upon reaching -([0-9]+)% of your Max Hit Points/,'50'],
 ['captureRoll','page','core:214',/Roll (1d100), and subtract the Trainer's Level/,'1d100'],
 ['captureDirection','page','core:214',/roll under or equal to the Pokemon's Capture Rate/],
 ['captureLegendary','page','core:214',/Legendary Pokemon subtract ([0-9]+) from the Pokemon's Capture Rate/,'30'],
 ['aimWeapon','unit','throhs:59:feature-line3',/next Weapon Attack with a long-range Weapon/],
 ['aimAmounts','unit','throhs:59:feature-line3',/\+([0-9]+) to its Accuracy Roll and Critical Hit Range/,'2'],
 ['aimEndpoint','unit','throhs:59:feature-line3',/until used or until the start of your next turn/],
 ['multiscaleOriginalHalving','unit','core:324:ability-line66',/damage from a Move, half the total damage before applying weakness and resistance, after applying your Defenses/],
 ['multiscaleOptional','unit','feb:7:ability-line40',/While at full Hit Points, all damage taken is resisted one step further/],
 ['sandOriginal','unit','core:328:ability-line63',/Evasion is increased by \+([0-9]+) while in a Sandstorm/,'2'],
 ['sandOptional','unit','feb:9:ability-line15',/gains \+([0-9]+) Evasion. This is increased to \+([0-9]+) Evasion while in a Sandstorm or sandy terrain/,'1','2'],
 ['droughtOriginal','unit','core:316:ability-line45',/Scene - Free Action.*Sunny for ([0-9]+) rounds/,'5'],
 ['droughtOptional','unit','feb:4:ability-line76',/Scene x3 - Swift Action.*Sunny for ([0-9]+) full round/,'1'],
 ['nobleTargets','unit','core:402:move-line81',/lowers all targets' Attack and Special Attack by ([0-9]+) Combat Stage/,'1'],
 ['energyOmission','unit','throhs:44:move-line42',/You gain \+([0-9]+) Special Attack on ([0-9]+)\+/,'1','19'],
 ['intimidateOriginal','unit','core:321:ability-line53',/Scene - Swift Action/],
 ['intimidateOptional','unit','feb:6:ability-line25',/At-Will - Swift Action/],
 ['intimidateOnce','unit','feb:6:ability-line25',/target a specific foe only once per Scene/],
 ['hardenUser','unit','core:398:move-line55',/Raise the user's Defense ([0-9]+) Combat Stage/,'1'],
 ['honeTyped','unit','core:351:move-line56',/Accuracy is raised by \+([0-9]+), and the user gains \+([0-9]+) Attack Combat Stage/,'1','1'],
 ['playNiceTarget','unit','core:403:move-line63',/target's Attack by ([0-9]+) Combat Stage/,'1'],
 ['mirrorThreshold','unit','core:431:move-line3',/Accuracy lowered by -([0-9]+) on ([0-9]+)\+/,'2','16'],
 ['adrenalineGate','unit','core:155:feature-line46',/lowered to half or your Maximum Hit Points or less/],
 ['adrenalineTrained','unit','core:155:feature-line46',/\+1 Combat Stage in each of your Trained Stats/],
 ['adrenalineTemp','unit','core:155:feature-line46',/cured of up to two Status Afflictions, and gain a Tick of Temporary Hit Points/],
 ['adrenalineOnce','unit','core:155:feature-line46',/used only once per Scene/],
 ['rockSmashThreshold','unit','core:367:move-line3',/target's Defense ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','17'],
 ['nastyUser','unit','core:352:move-line3',/Raise the user's Special Attack ([0-9]+) Combat Stages/,'2'],
 ['motorHit','unit','core:324:ability-line47',/Whenever an Electric Type attack hits the Pokemon, raise their Speed by \+([0-9]+) Combat Stage/,'1'],
 ['beamMoves','unit','core:312:ability-line19',/Effect Range and Critical Hit Range of the user's Ranged, 1-Target Moves are increased by ([0-9]+)/,'3'],
 ['coilFrequency','unit','core:414:move-line68',/Frequency: Scene x([0-9]+)/,'2'],
 ['acidThreshold','unit','core:414:move-line4',/target's Special Defense ([0-9]+) Combat Stage on ([0-9]+)\+/,'1','18'],
 ['tailUser','unit','core:349:move-line3',/Raise the user's Special Attack ([0-9]+) Combat Stages/,'3'],
 ['blisteringPhysical','native','YBWVC5IMxZYqnabl',/Fire-Type Moves and Physical Steel-Type Moves now inflict .*Burn.* on ([0-9]+)\+/,'19'],
 ['blisteringExistingRange','native','YBWVC5IMxZYqnabl',/already Burns, the Effect Range for Burn increases by ([0-9]+)/,'2'],
 ['blisteringSave','native','YBWVC5IMxZYqnabl',/non-Fire and Grass Type creatures suffer -([0-9]+) to their Accuracy and Save rolls/,'2'],
 ['blisteringWater','native','YBWVC5IMxZYqnabl',/one step more effective on Water-Types \(if a Move is Resisted, it is now Neutral\)/],
 ['eclipseDamage','native','JO37oFyHv5GBPjbE',/Ghost, Dark, and Fairy-Type Attacks gain \+([0-9]+) DB/,'3'],
 ['eclipseStatus','native','JO37oFyHv5GBPjbE',/inflicts a Persistent or Volatile Status Affliction on a target, that target is also Cursed. The target is also .*Suppressed/],
 ['eclipseHazardCount','native','JO37oFyHv5GBPjbE',/Hazard.*increase their Range by \+([0-9]+), and the number of Hazards they create is increased by ([0-9]+)% \(minimum ([0-9]+)\)/,'2','50','1'],
 ['eclipseBlessing','native','JO37oFyHv5GBPjbE',/Blessings.*receive an additional activation/],
 ['eclipseHazardLoss','native','JO37oFyHv5GBPjbE',/loses a Tick of Hit Points and becomes .*Suppressed/],
 ['eclipseTypeChoice','native','JO37oFyHv5GBPjbE',/creator of the Hazard can choose to make the Hazard deal damage as though it were Ghost, Dark, or Fairy-Type, depending on which of these Types the creator/],
 ['eclipseNoStats','native','JO37oFyHv5GBPjbE',/apply Weakness and Resistance for the Hazard's damage dealt and do not apply stats/]
];
export function effectF3fSourceFacts(audit,cleanText){
 const unit=id=>{const u=audit.sourceDefinitions.find(u=>u.id===id);return cleanText(u?.rawDefinition??u?.completeSourceUnit?.effect??'');};
 const page=id=>cleanText(audit.parentContexts.find(p=>p.id===id)?.rawText??'');
 const native=id=>cleanText(audit.nativeContexts.find(p=>p.pageId===id)?.rawText??'');
 const get={unit,page,native},system=id=>audit.rootCurrentSystems?.[id]??audit.targetSnapshots.find(s=>s.identity===id)?.document?.system;
 const observations=Object.fromEntries(sourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];}));
 const root=id=>system('effects.'+id),move=id=>system('moves.'+id),ability=id=>system('abilities.'+id);
 return {observations,definitions:Object.fromEntries(audit.sourceDefinitions.map(u=>[u.id,unit(u.id)])),
  sourceBoundaries:{energyCombatStagePrinted:/Combat Stage|\bCS\b/.test(unit('throhs:44:move-line42')),originalEnduringFormulaPrinted:/every 10|floor\(|\+1 HP/.test(unit('core:99:feature-line3')),originalFightGrantsHardened:/Hardened/.test(unit('throhs:49:feature-line33')),autotomizeWeightConditionEquivalenceVerified:false,independentSpiritFrameworkEstablished:false},
  currentObservations:{ironThreshold:move('bpb9SFiI7s9wqGyb')?.rules[0]?.range,wearBody:root('bqiqznj14sIHOpBR')?.effect,wearRule:root('bqiqznj14sIHOpBR')?.rules[0],screechBody:root('cWsAKHAhbzeqLVF0')?.effect,screechRule:root('cWsAKHAhbzeqLVF0')?.rules[0],growthBody:root('cdt6QIX2JFQxhRft')?.effect,growthRules:root('cdt6QIX2JFQxhRft')?.rules,growthProducerRules:move('Bcv2CeJg9qU1q0Cb')?.rules,growthProducerReference:move('Bcv2CeJg9qU1q0Cb')?.referenceEffect,
   sapFrequency:ability('vKXX0T04RnD0Olx5')?.frequency,rockTombAC:move('TYpDbl848dGUkN3q')?.ac,muddyWaterAC:move('updKSTwGuQaZfbTk')?.ac,swaggerAC:move('arxy479cTjkB8mML')?.ac,howlFrequency:move('IcjwAnfajBTDL3IF')?.frequency,howlRange:move('IcjwAnfajBTDL3IF')?.range,coilFrequency:move('yCI1ct0Zqqt1KLeZ')?.frequency,
   hardenedState:root('ed6GkfPq9AmYTTnf')?.rules[0],multiscale:root('fEmaSXw3MALAOeLp')?.rules[0],blisteringBurnBranches:root('fXsxr8akxM4wQfdy')?.rules.filter(r=>r.key==='ApplyEffect'),sandBody:root('fRleASN88UKiuYYY')?.effect,captureRule:root('eiHI7pSRauVpiEMD')?.rules[0],adrenalineTemp:root('gsePGwVgjU3VgjIK')?.rules.find(r=>r.key==='TempHP')},
  unresolvedExecution:{reproducedGameplayFailure:false,captureDcEqualsD100RateVerified:false,multiscaleHalfStepEqualsEitherSourceVerified:false,actualUseAndPreservation:'not-run'}};
}
export function effectF3fFactErrors(f){
 const errors=[];
 for(const[key,kind,id,re,...values]of sourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source recipient/unit/condition');}
 if(Object.values(f.sourceBoundaries).some(Boolean))errors.push('printed omission/identity/conditional authoring boundary');
 const c=f.currentObservations;
 if(c.ironThreshold!=='19'||c.wearBody!=='-1 Spd CS'||c.wearRule?.path!=='system.stats.def.stage.mod'||c.wearRule?.mode!=='subtract'||c.wearRule?.value!==1)errors.push('current IronTail/WearDown threshold and text/path');
 if(c.screechBody!=='+2 Def CS'||c.screechRule?.mode!=='subtract'||c.screechRule?.value!==2||c.growthBody!=='+1 Atk CS, +1 Sp.Atk CS'||!c.growthRules?.every(r=>r.value===2)||c.growthProducerRules?.some(r=>r.key==='ApplyEffect')||c.growthProducerReference!=='Compendium.ptu.effects.Item.Uq3ErLQLOvNwmIZd')errors.push('Screech/SunnyGrowth signed text/rule/link limits');
 if(c.sapFrequency!=='Static'||c.rockTombAC!=='3'||c.muddyWaterAC!=='2'||c.swaggerAC!=='5'||c.howlFrequency!=='EOT'||c.howlRange!=='Burst 1'||c.coilFrequency!=='Scene')errors.push('current/source frequency/accuracy differences');
 if(c.hardenedState?.value!=='true'||typeof c.hardenedState?.value!=='string'||c.hardenedState?.path!=='system.modifiers.hardened')errors.push('Hardened literal string state');
 const m=c.multiscale;
 if(m?.value?.brackets?.[0]?.start!==100||m?.value?.brackets?.[0]?.end!==100||m?.value?.brackets?.[0]?.value!==0.5||m?.value?.brackets?.[1]?.end!==99||m?.phase!=='afterDerived')errors.push('Multiscale literal percent/half-step field');
 const b=c.blisteringBurnBranches;
 if(b?.length!==2||JSON.stringify(b[0]?.selectors)!==JSON.stringify(['fire-damage-received','steel-damage-received'])||JSON.stringify(b[0]?.predicate)!=='[]'||!b[1]?.predicate?.includes('move:category:physical'))errors.push('Blistering broad and physical Steel branches');
 if(!/Hail or snowy terrain/.test(c.sandBody??'')||c.captureRule?.selectors!=='capture-dc'||c.captureRule?.value!==-30||c.adrenalineTemp?.value!=='@actor.system.health.tick')errors.push('SandVeil copied body/capture typed role/temporaryHP expression');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.captureDcEqualsD100RateVerified!==false||f.unresolvedExecution.multiscaleHalfStepEqualsEitherSourceVerified!==false||f.unresolvedExecution.actualUseAndPreservation!=='not-run')errors.push('source/static data promoted to execution');
 return errors;
}
export function effectF3fFindings(identity,facts){return {sourceFactsRole:'Independent clauses and complete definitions are scoped by each exact-ID source/parent links; no current canonical/version approval.',sourceBoundaries:facts.sourceBoundaries,
 ...( ['beTypIG3f7skgGa4','bqiqznj14sIHOpBR','cWsAKHAhbzeqLVF0','cdt6QIX2JFQxhRft','ed6GkfPq9AmYTTnf','fEmaSXw3MALAOeLp','fXsxr8akxM4wQfdy','eiHI7pSRauVpiEMD','gsePGwVgjU3VgjIK'].includes(identity.split('.')[1])?{currentObservations:facts.currentObservations}:{}),
 actualUse:'not-run',fullCurrentVersionEstablished:false};}
export function effectF3fSemanticRequirements(){return {
 beTypIG3f7skgGa4:[/TARGET DEFENSE1.*on15\+/,/body AND actual target ApplyEffect use19\+/,/not printed15\+/,/without.*reproduced engine failure/],
 bqiqznj14sIHOpBR:[/TARGET DEFENSE1.*EVEN-NUMBERED/,/BODY\/SNIPPET say SPEED-1/,/rule subtractsDEFENSE1/,/STATIC BODY\/RULE CONTRADICTION/],
 bwQniJ8g4OIydZsO:[/HP ON LEVEL-UP.*IGNORING BASE RELATIONS/,/does NOT print HP1\+floor/,/Independent complete current F&S\/CR authoring\/version remains unestablished/],
 c01eM7WOC6z1pPt8:[/crossing BELOW50%MAXHP/,/rises ABOVE50%/,/five unconditional/,/unavailable dated PTU\/PTR\/homebrew authoring and generation/,/Do not classify or recover newer-game rules from its name/],
 c7ZNDXTlYlsS6RNW:[/Original.*EVASION2 IN HAIL/,/BASE EVASION1.*TOTAL2/,/NO WEATHER PREDICATE/,/static1\+1=2/],
 cU0ndyjgpqN9xF6O:[/USER SPECIALATTACK2.*AFTER DAMAGE/,/NO INCOMING PRODUCER/,/No current Move identity or canonical relationship is invented/],
 cWsAKHAhbzeqLVF0:[/ALL LEGAL TARGETS DEFENSE2/,/BODY\/SNIPPET say DEFENSE\+2/,/rule SUBTRACTS2/,/STATIC SIGN CONTRADICTION/],
 cdt6QIX2JFQxhRft:[/DOUBLED TO2 EACH IF SUNNY/,/BODY\/SNIPPET say1 EACH/,/actual objects ADD2 EACH/,/BODY UUID link/,/no executable Sunny selection branch/],
 cexHI5oWpcHzbp2T:[/TARGET SPEED1/,/AC5/,/storesAC3/,/separate Materializer grant/],
 ciADvbrPLkN1ZMKb:[/TARGETS HIT EVASION-2/,/TOTAL EVASION NEVER BELOW0/,/no nonnegative floor/],
 crEfVwJadvsB2AqO:[/STATIC.*DAMAGING GRASS HIT/,/Optional February8 is SCENE/,/CHOICE OF ATTACK OR SPECIALATTACK/,/BUT STATIC frequency/,/no.*bothstats/i],
 cu9YXnbzXCyrAjyc:[/DEFENSE1 on17\+/,/complete independent PTU Move authoring\/version remains unestablished/i,/not an independently authored ShadowBone counterpart/],
 d5w5ffrIIYmFUUzj:[/literal STRING valueFairy/,/no normalization to an array is authorized/],
 d6UryG8AFhTby6jQ:[/ROCK TYPE IN SANDSTORM/,/tiered8\/10\/12/,/unconditionally overwritesROCK/,/not exact wrapper\/whole-version authority/],
 d8214x5aNOxtEyxX:[/CHANNELED TARGET WHILE BOUND/,/Bind2AP\/STANDARD/,/SEPARATE bound-AP helper/,/firstFIVE values are literal0/,/manually copy\/edit/,/Independent complete Spirit\/CR authoring remains unavailable/],
 dBg5buuImguROMaE:[/BASE EVASION2.*readiedTOTAL4\/DR10/,/September4.*base to1/,/adds3Evasion\/10physical-specialDR/,/Static1\+3=4 fits optional totals only/,/END OF USER NEXT TURN/,/not certified equivalent/],
 dBlJnKax0KQUYnG5:[/SPECIALATTACK2/,/SOMETHING OTHER THAN ITS OWN MOVES OR ABILITIES/,/No bonus from self-inflicted drops/],
 dZ06WIu0DfK78NlS:[/ACCURACY1 on16\+/,/AC5/,/hasAC2/,/separate movement action/],
 dmO40gFAbDtV0qXh:[/VIGOR on SPECIAL hits/,/NEXT PHYSICAL DAMAGE for5PERSTACK/,/Caps2\/4/,/crossgain2/,/no counter cleanup\/cap object/,/rank prerequisites as advisory/],
 dnCNQ2ErN6FZQ6Sp:[/Not-Yet Fully Implemented/,/BOOLEANfalse/,/not.*changing PokemonType/i],
 duriZg23equSn4vh:[/USER DEFENSE2\/SPDEFENSE2.*BODY UUID/,/ALLIES IN BURST3 DEFENSE1\/SPDEFENSE1.*referenceEffect/,/100encounters/,/Move has rules\[\]/],
 dyk9GIGBhVo3NGGZ:[/UP TO125PERCENT as STANDARD/,/WEIGHT UNCHANGED/,/EVASION-1.*BLOCKING TERRAIN/,/revertSHIFT/,/not certified actor-size\/blocking implementation/],
 eKMSueJhHjN1MZMp:[/TARGET ATTACK2.*AND CONFUSES/,/AC4/,/hasAC5/,/not proof of Confusion/],
 eO5ycOqENdnKlMiJ:[/WEIGHTCLASS1 to MINIMUM1/,/IF THE USER CAN/,/without certifying.*tyingSpeed/,/stage.value.*EMPTY STRING/,/no source-condition ruling/],
 eR9gulcKs9v9SF8V:[/1AP\/FREE/,/ACCURACY1 only AFTER BOTH BLESSING AND TRIGGERING ATTACK RESOLVE/,/does not invent a canonical rename/],
 eb0gaKKWEKuxSv3x:[/AT-WILL\/SELF/,/EOT\/BURST1/,/USER AND ALLIES/,/without approving broader recipients/],
 ed6GkfPq9AmYTTnf:[/thresholds1injury/,/3injuries EVASION1\/INITIATIVE5/,/5injuries DR5/,/7injuries HPLOSS IMMUNITY BUT NOT DAMAGE/,/9injuries RESIST1STEP/,/STRINGtrue/,/Older actual9injury rule was0.5 versus current1/,/not CR becomeEnraged->Hardened grant/],
 eiHI7pSRauVpiEMD:[/1D100 UNDER OR EQUAL CAPTURE RATE/,/SUBTRACT30 FROM TARGET CAPTURE RATE/,/not a bonus to the capture roll/,/does not establish conversion/],
 epkSS2waHGQnfOxM:[/NEXT WEAPON ATTACK WITH LONG-RANGE WEAPON/,/Accuracy2\/CRITRANGE2/,/UNTIL USED OR START OF YOUR NEXT TURN/,/unconditionally adds2/,/Prer.*advisory acquisition/],
 fEmaSXw3MALAOeLp:[/HALVES MOVE DAMAGE AFTER DEFENSES BEFORE WEAKNESS\/RESISTANCE/,/ALL DAMAGE ONE STEP FURTHER/,/adds0.5 resistanceSteps/,/Do not certify0.5step as halving or oneStep/],
 fNSwwM06WlrPmrFS:[/TARGET DEFENSE1/,/ONCE PER SCENE/,/BOTH actual Move frequencies areEOT/,/without.*certifying runtime frequency failure/],
 fRleASN88UKiuYYY:[/EVASION2 IN SANDSTORM/,/BASE1\/TOTAL2.*SANDSTORM OR SANDY TERRAIN/,/BODY says HAIL OR SNOWY TERRAIN/,/not permission to apply the copied Hail condition/],
 fXsxr8akxM4wQfdy:[/PHYSICAL STEEL BURN19\+ OR existingBurnRange\+2/,/ALL STEEL without physicalpredicate/,/second PHYSICAL STEEL rule/,/static, not reproduced burns/,/Original Drought5rounds.*optional1fullround/],
 ffZ3CBx2pIzPXKE3:[/YOU GAIN SPECIALATTACK1 ON19\+/,/DOES NOT PRINT COMBAT STAGE/,/Preserve source omission/,/Clarification.*not another extraction/],
 fg5XPpmaao3GV9Fh:[/SCENE\/SWIFT/,/AT-WILL\/SWIFT/,/EACH SPECIFIC FOE ONLY ONCE PER SCENE/,/AT-WILL\/RAPID/],
 g0Dr7ZmsyNb8ne4U:[/ATTACK1 COMBAT STAGE AND ACCURACY1/,/two DIFFERENT TYPED QUANTITIES/],
 g78JnWwkLifmGJ00:[/DYNAMAX AND A FLYING MOVE/,/ALL ALLIES IN BURST5 SPEED1/,/attackCone9/,/Complete independent Max\/Dynamax authoring\/version.*not supplied/],
 gH0wbGOtZTQcmfY5:[/ALL LEGAL TARGETS ACCURACY2 ON16\+/,/not15\/17/],
 gsePGwVgjU3VgjIK:[/HALF MAXHP OR LESS/,/ONLY ONCE PER SCENE/,/TRAINED STATS\+1STAGE/,/cureUP TO TWO STATUS AFFLICTIONS/,/ONE TICK TEMPORARY HP/,/not fixedHP1 or healing/],
 hKDt3x8jXspwaFA2:[/EFFECTRANGE3 AND CRITICALHITRANGE3/,/RANGED ONE-TARGET MOVES/,/omit ranged\/one-target predicates/,/not all-attacks crit3/],
 hLb7ocQlqnlM7BE7:[/SCENEx2\/SELF/,/ACCURACY1/,/storesSCENE frequency/,/frequency difference/],
 hOh1BF2Izda9i1Mu:[/DEFAULT five nonHP STAGES\+1 AND gain1STAGE/,/no explicit default-stage setter/,/do not independently author/],
 i8425lVaQaZt2U1H:[/GHOST\/DARK\/FAIRY DB3/,/CursedANDSuppressed/,/count50percentMIN1/,/extraBLESSINGactivation/,/weakness-resistance-NOSTATS/,/MANUAL notes/,/not independent approved weather authoring/]
};}

const sourceLinks={"beTypIG3f7skgGa4":["core:430:move-line13"],"bqiqznj14sIHOpBR":["core:289:move-line36"],"bwQniJ8g4OIydZsO":["core:99:feature-line3"],"c7ZNDXTlYlsS6RNW":["core:330:ability-line13","feb:9:ability-line65","core:389:move-line15"],"cFMPuhlcnYbpHTMD":["core:386:move-line51"],"cU0ndyjgpqN9xF6O":["core:382:move-line13"],"cWsAKHAhbzeqLVF0":["core:406:move-line73"],"cdt6QIX2JFQxhRft":["core:398:move-line32","core:305:capability-inflatable","core:372:move-line57"],"cexHI5oWpcHzbp2T":["core:427:move-line3","core:306:capability-materializer"],"ciADvbrPLkN1ZMKb":["core:410:move-line68"],"crEfVwJadvsB2AqO":["core:328:ability-line68","feb:8:ability-line76"],"cu9YXnbzXCyrAjyc":["core:313:ability-line3","feb:4:ability-line3"],"d6UryG8AFhTby6jQ":["core:318:ability-line35","core:413:move-line3","core:427:move-line40"],"dBg5buuImguROMaE":["equipment:core:294:table0:row6","f1:core:248:slowed"],"dBlJnKax0KQUYnG5":["core:314:ability-line3"],"dZ06WIu0DfK78NlS":["core:433:move-line41"],"dqug0lkN2cNObB7t":["core:353:move-line3"],"dyk9GIGBhVo3NGGZ":["core:305:capability-inflatable"],"eKMSueJhHjN1MZMp":["core:410:move-line43"],"eO5ycOqENdnKlMiJ":["core:429:move-line4"],"eR9gulcKs9v9SF8V":["core:189:feature-line21"],"eb0gaKKWEKuxSv3x":["core:399:move-line75"],"ed6GkfPq9AmYTTnf":["core:105:feature-line3","throhs:49:feature-line33"],"epkSS2waHGQnfOxM":["throhs:59:feature-line3"],"fEmaSXw3MALAOeLp":["core:324:ability-line66","feb:7:ability-line40"],"fRleASN88UKiuYYY":["core:328:ability-line63","feb:9:ability-line15","core:427:move-line40"],"fXsxr8akxM4wQfdy":["core:316:ability-line45","feb:4:ability-line76","core:372:move-line57","f1:core:246:burned"],"fbgZoGswXrn6VMYc":["core:402:move-line81"],"ffZ3CBx2pIzPXKE3":["throhs:44:move-line42"],"fg5XPpmaao3GV9Fh":["core:321:ability-line53","feb:6:ability-line25"],"furDPMEDN2zDTNpu":["core:398:move-line55"],"g0Dr7ZmsyNb8ne4U":["core:351:move-line56"],"gGq4Rr0ngJ0a1jj1":["core:403:move-line63"],"gH0wbGOtZTQcmfY5":["core:431:move-line3"],"gsePGwVgjU3VgjIK":["core:155:feature-line46"],"gzlbSQBRtmCeso3c":["equipment:core:297:table0:row12"],"h19SgdKxaVsB8cyP":["core:367:move-line3"],"h1Jaqhwr9pUithTH":["core:352:move-line3"],"hCTbNW1Isw6W5BwJ":["core:324:ability-line47"],"hKDt3x8jXspwaFA2":["core:312:ability-line19"],"hLb7ocQlqnlM7BE7":["core:414:move-line68"],"hfe2s7t6fb8huiiQ":["core:414:move-line4"],"i7axyfULMSmDT42u":["core:349:move-line3"],"i8425lVaQaZt2U1H":["f1:core:247:suppressed","f1:feb:2:suppression"]};
const nativeLinks={"fXsxr8akxM4wQfdy":["7znCkHSW9AWIyFIA","YBWVC5IMxZYqnabl"],"i8425lVaQaZt2U1H":["7znCkHSW9AWIyFIA","JO37oFyHv5GBPjbE","rzEXd4hoGRL4V2AS","NAEMeEwuP73MtrDX"]};

export function checkEffectF3fSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3f');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3f');
    if (!audit) { fail(!slice.recordFile, 'F3f completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3f record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3f' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3f frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3f independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3f exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 74 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 84 && audit.nativeContexts.length === 5, 'F3f bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3f full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3f complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3f full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3f exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3fSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3fFactErrors(facts).length === 0, 'F3f independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3fFactErrors(facts).join('; '));
    const proseRequirements = effectF3fSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.completeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentWeatherPlaytestAuthoringEstablished === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3f missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3f'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 139 && snapshots.size === audit.targetSnapshots.length, 'F3f exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3f exact current target/prior chronology changed: ' + s.identity);
    }

    fail(equal(audit.independentUseContextSnapshots, []), 'F3f no invented independent producer relationship');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3f full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F3f literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3f literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3f exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3e').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3f independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F3f full root-system inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3f per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3f exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3fFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3f source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3f independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F3f per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F3f unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3f complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3f actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectF3fRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3f complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3f exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3f exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3f incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3f complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3f historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3f finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 36, unresolved: 24}) && equal(counts, closure.counts), 'F3f bounded correspondence/limit counts changed');
}
