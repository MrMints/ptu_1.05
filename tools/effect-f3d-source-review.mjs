// Offline F3d source/current evidence. No runtime, acquisition or policy consumer.
import {effectReferences, effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const MEMBERSHIP = '8120536071f8c07bfeabb1c42fd6eae289a80de2a2597e708b3bbd24d735e0a4';
const SOURCE_PRIMITIVES = 'e36d96105e164b6b7b012d4143d9678864b7cc350fd157c6f6b9c02d42f9ad7b';
const EXAMINED_DISPOSITIONS = '729d4364262c0718af42a513eda56cee770ffa9d9b1af8142b37587abd12146b';
const HISTORICAL_OBSERVATIONS = '4d2c0d56e0add7f5c17865976af9f1ae256bd53d14d1f28c1af708787f298679';

export function effectF3dRuleRoles(doc) {
    return effectOtherRuleRoles(doc).map((role,i) => doc.system.rules[i].key === 'ActionPoint'
        ? {...role, domain: Object.hasOwn(doc.system.rules[i], 'bound') ? 'legacy-bound-ap-field' : role.domain,
            value: doc.system.rules[i].bound ?? role.value, legacyBoundField: Object.hasOwn(doc.system.rules[i], 'bound') ? 'bound' : null,
            legacyBoundValue: doc.system.rules[i].bound ?? null, legacyFieldUseVerified: false}
        : role);
}

export function effectF3dSourceFacts(audit, cleanText) {
    const unit = id => {const u=audit.sourceDefinitions.find(u => u.id === id);return cleanText(u?.rawDefinition ?? u?.completeSourceUnit?.effect ?? '');};
    const page = id => cleanText(audit.parentContexts.find(p => p.id === id)?.rawText ?? '');
    const nativeRaw = id => audit.nativeContexts.find(p => p.pageId === id)?.rawText ?? '';
    const native = id => cleanText(nativeRaw(id));
    const take = (s,re) => s.match(re)?.[0] ?? null;
    const number = (s,re) => { const m=s.match(re); return m ? Number(m[1]) : null; };
    const sing=unit('core:407:move-line60'), ace=unit('core:112:feature-line3'), invis=unit('core:305:capability-invisibility');
    const bone=unit('core:313:ability-line3'), boneOptional=unit('feb:4:ability-line3'), fire=unit('core:123:feature-line4');
    const athlete=unit('core:155:feature-line3'), spray=unit('core:330:ability-line79'), sprayOptional=unit('feb:10:ability-line17');
    const wind=unit('throhs:75:feature-line9'), champion=take(page('core:19'),/Level 40.*$/), brume=native('6ykh6wKs7S5DJlXw');
    const vicious=unit('core:334:ability-line67'), rock=unit('core:328:ability-line15'), rockOptional=unit('feb:8:ability-line54');
    const ball=unit('core:389:move-line37'), shell=unit('core:329:ability-line49'), rod=unit('core:322:ability-line62'), rodOptional=unit('feb:6:ability-line60');
    const grace=unit('core:53:feature-line71'), dusty=native('HDXMSgAoga7IZ5sh');
    return {
        sing:{completeDefinition:sing,missInstead:take(sing,/On a miss, Sing instead causes targets to become Slowed/),evasionDelta:-number(sing,/-([0-9]+) penalty to their Evasion/),endpoint:take(sing,/until the end of the user's next turn/),twoRoundsEquivalentVerified:false},
        statAce:{completeDefinition:ace,recipient:take(ace,/Your Pokemon have their Chosen Base Stat increased by \+1/),levelsPerGain:number(ace,/every ([0-9]+) Levels/),levelExample:take(ace,/Level 20 Pokemon would have your Chosen Stat's base value increased by \+3/),trainerMilestoneRulePrinted:/Milestone/.test(ace)},
        invisibility:{completeDefinition:invis,action:take(invis,/as a Shift Action/),moves:take(invis,/may not perform Moves while invisible/),attackPenalty:number(invis,/roll \+([0-9]+) during Accuracy/),maxMinutes:number(invis,/up to ([0-9]+) minutes/),reuseWait:take(invis,/wait two plus the number of minutes they spent invisible/),attackRestrictionEquivalentVerified:false},
        boneWielder:{originalDefinition:bone,optionalDefinition:boneOptional,heldClub:take(bone,/only functional if the user is holding a Thick Club item/),originalAccuracy:number(bone,/\+([0-9]+) Accuracy Bonus/),originalRemovalProtection:take(bone,/cannot be disarmed/),optionalMoves:take(boneOptional,/Bone Club, Bonemerang, and Bone Rush Moves ignore immunity against Ground-Type Moves/),optionalGhostPrinted:/Ghost|Shadow Bone/.test(boneOptional)},
        brightestFlame:{completeDefinition:fire,burnThreshold:number(fire,/roll of ([0-9]+)\+/),existingRangeAddition:number(fire,/increased by \+([0-9]+)/),damageRole:take(fire,/additional damage equal to your Type-Linked Skill Rank against Burned targets/),universalEightPrinted:/\+8|eight|8 damage/i.test(fire),septemberActualChange:take(page('sep:9'),/Incandescence \[Orders\]/)},
        athlete:{completeDefinition:athlete,exercise:take(athlete,/After an hour of exercise/),choice:take(athlete,/two different Stats besides HP/),defaultStage:take(athlete,/default State of Trained Stats is \+1 Combat Stages instead of 0/),twoAtTime:take(athlete,/two Trained Stats at a time/),ordinaryAddedStageEquivalentVerified:false},
        sprayDown:{originalDefinition:spray,optionalDefinition:sprayOptional,originalFrequency:take(spray,/Scene - Free Action/),optionalFrequency:take(sprayOptional,/Scene x2 - Free Action/),trigger:take(spray,/hits an airborne target with a ranged 1-target attack/),turns:number(spray,/for ([0-9]+) turns/),grounding:take(spray,/knocked down to ground level/),immunity:take(spray,/may be hit by Ground-?Type Moves even if normally immune/),roundsEquivalentVerified:false},
        oneWithWinds:{completeDefinition:wind,boundAp:number(wind,/Bind ([0-9]+) AP/),action:take(wind,/Standard Action/),range:take(wind,/Acrobatics Rank plus Perception Rank in meters/),legacyBoundFieldExecutionVerified:false},
        champion:{completeSourceBoundary:champion,level:number(champion??'',/Level ([0-9]+)/),evenLevels:take(champion??'',/every even-numbered Level Up from Level 42 through Level 50/),edges:take(champion??'',/Gain two Edges for which you qualify/),feature:take(champion??'',/Gain one General Feature for which you qualify/),lifelongGrantPrinted:/Lifelong Learning/.test(champion??''),lifelongDefinition:unit('core:88:feature-line42')},
        balefulBrume:{completeDefinition:brume,shadowDb:number(brume,/Shadow-Type Attacks gain \+([0-9]+) DB/),hyperMode:take(brume,/Shadow-Type creatures cannot exit Hyper Mode/),saveDcPrinted:/Save|DC/.test(brume),allVulnerable:take(brume,/all creatures are Vulnerable/),tick:take(brume,/All non-Shadow-Type creatures lose a Tick of Hit Points at the end of their turn/),incoming:take(brume,/non-Shadow-Type creatures take \+5 bonus damage when they take Super Effective damage and \+5 bonus damage when damaged by a Critical Hit/),stageFrequency:take(brume,/Twice per Scene/),xdException:take(brume,/XD-Series Shadow Pokemon may instead do this At-Will/),manualNotes:(nativeRaw('6ykh6wKs7S5DJlXw').match(/This part of the effect is not Automated!/g)??[]).length,saveBonusEquivalentVerified:false},
        vicious:{completeDefinition:vicious,trigger:take(vicious,/user uses Hone Claws/),alternative:take(vicious,/choose one effect/),actionAlternative:take(vicious,/another Standard Action this round/),critBonus:number(vicious,/Critical Hit Range on all attacks by \+([0-9]+)/),critLifetime:take(vicious,/remainder of the encounter/)},
        rockHead:{originalDefinition:rock,optionalDefinition:rockOptional,originalDicePrinted:/2d6/.test(rock),meters:number(rockOptional,/at least ([0-9]+) meters/),path:take(rockOptional,/in a straight line towards a foe before attacking that foe with a physical attack/),dice:take(rockOptional,/\+2d6 Bonus to the Damage Roll against that foe/)},
        iceBall:{completeDefinition:ball,base:number(ball,/Damage Base ([0-9]+):/),successGain:number(ball,/Damage Base by \+([0-9]+)/),cap:number(ball,/maximum of DB ([0-9]+)/),stops:take(ball,/until they miss any target with Ice Ball, or are not able to hit any target with Ice Ball during their turn/),range:take(ball,/Range: Melee, 1 Target/),counterExecutionVerified:false},
        shellCannon:{completeDefinition:shell,actor:take(shell,/When Blastoise uses/),accuracy:number(shell,/\+([0-9]+) to their Accuracy Roll/),damage:number(shell,/\+([0-9]+) Bonus Damage/),conditionalMoves:take(shell,/When using Aqua Jet, Dive, Tackle, or Waterfall/),straightShift:take(shell,/must shift in a straight line to their target/),speed:number(shell,/Overland and Swim Speeds are increased by \+([0-9]+) when doing so/)},
        lightningRod:{originalDefinition:rod,optionalDefinition:rodOptional,originalEveryHit:take(rod,/each time they are hit by an Electric attack, the user's Special Attack is raised 1 Combat Stage/),optionalAfterRedirect:take(rodOptional,/user's Special Attack is then raised by \+1 Combat Stage/),optionalEveryHitPrinted:/each time/.test(rodOptional)},
        grace:{completeDefinition:grace,extraPoffins:take(grace,/2 more Poffins each/),tradeRetention:take(grace,/these extra dice from additional Poffins are not lost/),nonGraceCap:take(grace,/may not benefit from more than 6 Dice gained from Poffins/),spiritPrinted:/Spirit/.test(grace),independentSpiritFrameworkEstablished:false},
        dusty:{completeDefinition:dusty,damageBasePenalty:number(dusty,/DB decreased by ([0-9]+)/),specialDr:number(dusty,/\+([0-9]+) Special Damage Reduction/),independentApprovedWeatherAuthoring:false},
        moveConsequences:Object.fromEntries(stageSpecifications.map(([id,re,sign,expected,role,qualifier])=>{const s=unit(id),n=number(s,re);return[id,{completeDefinition:s,signedDelta:n===null?null:sign*n,recipientRole:take(s,role),qualifier:take(s,qualifier)}];})),
        definitions:Object.fromEntries(audit.sourceDefinitions.map(u=>[u.id,unit(u.id)]))
    };
}

export function effectF3dFactErrors(f) {
    const errors=[],need=(ok,label)=>{if(!ok)errors.push(label);};
    need(f.sing.missInstead && f.sing.evasionDelta===-2 && f.sing.endpoint && !f.sing.twoRoundsEquivalentVerified,'Sing miss/recipient endpoint');
    need(f.statAce.recipient && f.statAce.levelsPerGain===10 && f.statAce.levelExample && !f.statAce.trainerMilestoneRulePrinted,'Stat Ace Pokemon base/level');
    need(f.invisibility.action && f.invisibility.moves && f.invisibility.attackPenalty===4 && f.invisibility.maxMinutes===4 && f.invisibility.reuseWait,'Invisibility actions/minutes/Moves');
    need(f.boneWielder.heldClub && f.boneWielder.originalAccuracy===1 && f.boneWielder.originalRemovalProtection && f.boneWielder.optionalMoves && !f.boneWielder.optionalGhostPrinted,'Bone Wielder original/optional/Ghost limit');
    need(f.brightestFlame.burnThreshold===18 && f.brightestFlame.existingRangeAddition===3 && f.brightestFlame.damageRole && !f.brightestFlame.universalEightPrinted && f.brightestFlame.septemberActualChange,'Brightest Flame range/rank/change boundary');
    need(f.athlete.exercise && f.athlete.choice && f.athlete.defaultStage && f.athlete.twoAtTime && !f.athlete.ordinaryAddedStageEquivalentVerified,'Athlete default stage/choices/exercise');
    need(f.sprayDown.originalFrequency && f.sprayDown.optionalFrequency && f.sprayDown.trigger && f.sprayDown.turns===3 && f.sprayDown.grounding && f.sprayDown.immunity && !f.sprayDown.roundsEquivalentVerified,'Spray Down turns/rounds/action/trigger');
    need(f.oneWithWinds.boundAp===2 && f.oneWithWinds.action && f.oneWithWinds.range && !f.oneWithWinds.legacyBoundFieldExecutionVerified,'One With Winds bound AP/range');
    need(f.champion.level===40 && f.champion.evenLevels && f.champion.edges && f.champion.feature && !f.champion.lifelongGrantPrinted,'Champion40 bounded options42-50');
    need(f.balefulBrume.shadowDb===2 && f.balefulBrume.hyperMode && !f.balefulBrume.saveDcPrinted && f.balefulBrume.allVulnerable && f.balefulBrume.tick && f.balefulBrume.incoming && f.balefulBrume.stageFrequency && f.balefulBrume.xdException && f.balefulBrume.manualNotes===3 && !f.balefulBrume.saveBonusEquivalentVerified,'Baleful Brume Hyper Mode/recipients/notes/exception');
    need(f.vicious.trigger && f.vicious.alternative && f.vicious.actionAlternative && f.vicious.critBonus===2 && f.vicious.critLifetime,'Vicious alternative/encounter');
    need(!f.rockHead.originalDicePrinted && f.rockHead.meters===4 && f.rockHead.path && f.rockHead.dice,'Rock Head optional physical same-foe straight4m');
    need(f.iceBall.base===3 && f.iceBall.successGain===3 && f.iceBall.cap===15 && f.iceBall.stops && f.iceBall.range && !f.iceBall.counterExecutionVerified,'Ice Ball typed DB/counter/stops/range');
    need(f.shellCannon.actor && f.shellCannon.accuracy===2 && f.shellCannon.damage===4 && f.shellCannon.conditionalMoves && f.shellCannon.straightShift && f.shellCannon.speed===2,'Shell Cannon conditional actor/moves/speeds');
    need(f.lightningRod.originalEveryHit && f.lightningRod.optionalAfterRedirect && !f.lightningRod.optionalEveryHitPrinted,'Lightning Rod original-hit/optional-redirect');
    need(f.grace.extraPoffins && f.grace.tradeRetention && f.grace.nonGraceCap && !f.grace.spiritPrinted && !f.grace.independentSpiritFrameworkEstablished,'Grace Poffins/Spirit separate');
    need(f.dusty.damageBasePenalty===2 && f.dusty.specialDr===5 && !f.dusty.independentApprovedWeatherAuthoring,'Dusty DB/special DR/native authority');
    for(const[id,re,sign,expected]of stageSpecifications){const m=f.moveConsequences[id];need(m?.signedDelta===expected && m.recipientRole && m.qualifier,'Move signed/recipient/qualifier '+id);}
    return errors;
}

export function effectF3dFindings(identity,facts) {
    const key=factLinks[identity.split('.')[1]];
    const stage=stageFactLinks[identity.split('.')[1]];
    return key ? {[key]:facts[key]} : stage ? {moveConsequence:facts.moveConsequences[stage]} : {fieldExaminationOnly:true,fullCurrentVersionEstablished:false,actualUse:'not-run'};
}

export function effectF3dSemanticRequirements(f) {
    return {
        MlJSSeAT9abuLZ3G:[/MISS.*INSTEAD/,new RegExp('Evasion'+f.sing.evasionDelta),/END OF USER NEXT TURN/,/not certified equivalent/],
        MyYrBqIyO9fbUcoZ:[/POKEMON BASE STAT1/,/per10 POKEMON LEVELS/,/TRAINER floor\(level\/20\)/,/navigation links are not automatic/],
        Picrxhf78VAPO6kx:[/POKEMON BASE STAT1/,/per10 POKEMON LEVELS/,/TRAINER floor\(level\/20\)/,/navigation links are not automatic/],
        NLLlGOUIm42a4Ifr:[/SHIFT ACTION/,/prohibits MOVES/,/AT MOST4 MINUTES/,/TWO PLUS MINUTES SPENT INVISIBLE/,/helper says no ATTACKS/],
        OG1a1uZlWaHbc5zx:[/REQUIRES HOLDING THICK CLUB/,/THREE MOVES.*GROUND/,/SHADOW BONE\/GHOST/,/engine-wide immunity failure/],
        OfTEYe9myW3JWve8:[/EXISTING BURN RANGE instead gains\+3/,/TYPE-LINKED SKILL RANK/,/fixed8/,/INCANDESCENCE, not Brightest Flame/],
        P1blVI7CcAMLkyTJ:[/AFTER ONE HOUR/,/TWO DIFFERENT NON-HP STATS/,/DEFAULT STAGE/,/not certified equivalent/],
        Q1riP3kQOmXsC87S:[/SCENE\/FREE/,/SCENE x2\/FREE/,/AIRBORNE.*RANGED1-TARGET/,/3 TURNS/,/3rounds\/turn-END/,/not equivalence/],
        QSBfXnEJ10NZnk0Z:[/BIND2AP\/STANDARD/,/ACROBATICS RANK PLUS PERCEPTION RANK METERS/,/ActionPoint\.bound:2, NOT boundValue/,/not a verified engine binding/],
        QSOJqOsxP8TMxxZi:[/Level40 CHAMPION/,/EVEN LEVELS42–50/,/OR2EDGES OR1GENERAL FEATURE/,/NO GrantItem/,/complete independent PTR/i],
        QkotgyK9W5G6BlZM:[/CANNOT EXIT HYPER MODE/,/DOES NOT print an increased save DC/,/SAVE-CHECK BONUS\+2/,/ALL-CREATURE VULNERABILITY/,/TWICE\/SCENE or XD-SERIES AT-WILL/,/THREE manual notes/,/No Enshrouded DC clause/],
        S6HPnUwePesar48A:[/CHOOSES ONE/,/STANDARD ACTION THIS ROUND OR CRITICAL RANGE\+2/,/REMAINDER OF ENCOUNTER/,/No automatic both-options/],
        TIXFtoJsuH3sklKu:[/ONLY ignores RECOIL/,/PHYSICAL attack/,/AT LEAST4 METERS IN A STRAIGHT LINE TOWARD THAT FOE/,/no universal2d6/],
        TLumhP0tLbp1YgsE:[/DB3 and adds3 per SUCCESSIVE use to MAX DB15/,/MISSES ANY TARGET OR CANNOT HIT ANY TARGET THAT TURN/,/counter1 is not DB1/,/Range4 differs from original MELEE/,/unestablished/],
        UOwQkZpkwdU7kCHU:[/BLASTOISE.*NINE SPECIFIED MOVES/,/Only AQUA JET\/DIVE\/TACKLE\/WATERFALL/,/STRAIGHT-LINE SHIFT TO TARGET/,/WHEN DOING SO/,/not universal speed\/attack/],
        UdRHrCM7dkAVKUh3:[/EACH ELECTRIC HIT/,/AFTER REDIRECT/,/Versions have different triggers/],
        RnonNxaBj0Z4nMXH:[/TWO EXTRA POFFINS/,/6-DICE cap/,/DO NOT author SPIRIT/,/ONLY spirit\.max\+1, not spirit\.value/,/DAILY.*MAX4.*EXPERT/,/never silently raised\/gated\/added/],
        OMjhFmpjqqaYBskG:[/TIER1/,/FIRE\/ELECTRIC DB-2/,/SPECIAL DR\+5/,/TURN-START Tick/,/not independent approved/],
        MBT9OVsk9pyQZGKO:[/ADJACENT ALLY/,/NEXT SPECIAL ATTACK/,/2d6\+4, or3d6\+6 INSTEAD/,/unlimited storage/,/unestablished/],
        N5xGMM4iaDJ2UWnn:[/WATER and STEEL/,/ROCK2/,/Steel helper stores ROCK4/,/Generation9 recovery/,/unestablished/],
        T0v32qQRuZnSVXaD:[/TWO BRANCHES/,/ALREADY POISONED.*ONE TICK and Speed-2/,/SpDef-2 is a different role/,/Do not substitute HP2/],
        OHzeb2NdEhHbnrHc:[/USER Defense1 at SET-UP/,/only RESOLUTION attacks/,/never assigns.*attacked target/],
        PWFiPAiS6UNblMEi:[/SET-UP from RESOLUTION/,/Set-Up forbids shifting/,/Resolution raises USER SpAtk\/SpDef\/Speed2 EACH/],
        SwTrCa9QaIudkmyX:[/USER Defense1 AND Special Defense1/,/100-ENCOUNTER/,/NOT certified as the source lifetime/]
    };
}

const factLinks={MlJSSeAT9abuLZ3G:'sing',MyYrBqIyO9fbUcoZ:'statAce',Picrxhf78VAPO6kx:'statAce',NLLlGOUIm42a4Ifr:'invisibility',OG1a1uZlWaHbc5zx:'boneWielder',OfTEYe9myW3JWve8:'brightestFlame',P1blVI7CcAMLkyTJ:'athlete',Q1riP3kQOmXsC87S:'sprayDown',QSBfXnEJ10NZnk0Z:'oneWithWinds',QSOJqOsxP8TMxxZi:'champion',QkotgyK9W5G6BlZM:'balefulBrume',S6HPnUwePesar48A:'vicious',TIXFtoJsuH3sklKu:'rockHead',TLumhP0tLbp1YgsE:'iceBall',UOwQkZpkwdU7kCHU:'shellCannon',UdRHrCM7dkAVKUh3:'lightningRod',RnonNxaBj0Z4nMXH:'grace',OMjhFmpjqqaYBskG:'dusty'};
const stageFactLinks={MPgTZ8QcPNal4lC3:'core:397:move-line14',Mhib4AloLNBCjDqn:'core:347:move-line61',OGQV7DMAZFEwB2Ma:'core:423:move-line3',OHzeb2NdEhHbnrHc:'core:407:move-line85',OPqyV5DPPAwDhfG5:'core:398:move-line22',PK2dsGRBlBsD4yqV:'core:380:move-line45',PL88yhrvOchgllAA:'core:380:move-line36',PLfjF8fWQRPxnr1b:'core:354:move-line4',PWFiPAiS6UNblMEi:'core:361:move-line23',QXstaqQofzAUn774:'core:388:move-line4',QiM1lYbyKd8CpfpL:'core:434:move-line3',RaNWzf3670xZl3TU:'core:374:move-line15',RzJizJiENgnmhr5x:'core:382:move-line24',Su5H2spXaplLMexD:'core:354:move-line25',SwTrCa9QaIudkmyX:'core:346:move-line38',TLCE3NR1GCYkV2Zn:'core:414:move-line34',Tg1ey33pd5jw2FAN:'core:351:move-line77',TgMuE0qRzHnqDTTs:'core:386:move-line61',ThL1hEgLScReEGFU:'core:418:move-line52'};

const stageSpecifications=[
 ['core:397:move-line14',/-([0-9]+)/,-1,-1,/Accuracy of all Legal Targets/,/Range: Cone 2/],
 ['core:347:move-line61',/\+([0-9]+) Combat Stage/,1,1,/user's Special Attack, Special Defense, and Speed/,/Range: Self/],
 ['core:423:move-line3',/Special Defense ([0-9]+) Combat Stage/,-1,-1,/target's Special Defense/,/on 17\+/],
 ['core:407:move-line85',/\+([0-9]+) Defense CS/,1,1,/Set-Up Effect: The use gains/,/Resolution Effect/],
 ['core:398:move-line22',/Attack ([0-9]+) Combat Stage/,-1,-1,/all Legal Targets Attack/,/Friendly, Sonic, Social/],
 ['core:380:move-line45',/Speed lowered ([0-9]+) Combat Stage/,-1,-2,/All Legal Targets/,/Powder/],
 ['core:380:move-line36',/Defense ([0-9]+) Combat Stage/,1,3,/user's Defense/,/Range: Self/],
 ['core:354:move-line4',/Special Attack ([0-9]+) Combat Stage/,-1,-2,/user's Special Attack/,/after damage/],
 ['core:361:move-line23',/Speed by ([0-9]+) Combat Stage/,1,2,/user raises its Special Attack, Special Defense, and Speed/,/Resolution Effect/],
 ['core:388:move-line4',/Attack ([0-9]+) Combat Stage/,-1,-1,/target's Attack/,/on 18\+/],
 ['core:434:move-line3',/Defense ([0-9]+) Combat Stage/,-1,-1,/Target's Defense/,/Even-Numbered Roll/],
 ['core:374:move-line15',/-([0-9]+) Combat Stage/,-1,-1,/user's Defense and Special Defense/,/Frequency: Scene x2/],
 ['core:382:move-line24',/-([0-9]+)/,-1,-1,/all legal targets have their Accuracy lowered/,/Small or Medium targets in the central square/],
 ['core:354:move-line25',/Attack ([0-9]+) Combat Stage/,1,1,/user's Attack/,/user's Speed 1 Combat Stage/],
 ['core:346:move-line38',/Special Defense ([0-9]+) Combat Stage/,1,1,/user's Defense and Special Defense/,/Range: Self/],
 ['core:414:move-line34',/Special Defense ([0-9]+) Combat Stage/,-1,-2,/target's Special Defense/,/Range: 4, 1 Target/],
 ['core:351:move-line77',/-([0-9]+) CS/,-1,-2,/target has each of their stats lowered/,/when the user becomes Fainted/],
 ['core:386:move-line61',/-([0-9]+) Combat Stage/,-1,-1,/target's Speed/,/Range: 3, 1 Target/],
 ['core:418:move-line52',/Special Attack ([0-9]+) Combat Stage/,1,1,/user's Special Attack/,/user's Special Defense 1 Combat Stage/]
];

const sourceLinks={"MPgTZ8QcPNal4lC3":["core:397:move-line14","core:304:capability-glow"],"Mhib4AloLNBCjDqn":["core:347:move-line61"],"MlJSSeAT9abuLZ3G":["core:407:move-line60","f1:core:248:slowed","f1:core:247:sleep"],"MyYrBqIyO9fbUcoZ":["core:112:feature-line3"],"Picrxhf78VAPO6kx":["core:112:feature-line3"],"NLLlGOUIm42a4Ifr":["core:305:capability-invisibility"],"OG1a1uZlWaHbc5zx":["core:313:ability-line3","feb:4:ability-line3"],"OGQV7DMAZFEwB2Ma":["core:423:move-line3","core:308:capability-telekinetic"],"OHzeb2NdEhHbnrHc":["core:407:move-line85"],"OMjhFmpjqqaYBskG":["core:427:move-line40"],"OPqyV5DPPAwDhfG5":["core:398:move-line22"],"OfTEYe9myW3JWve8":["core:123:feature-line4","f1:core:246:burned"],"Oo3KS2Vp7COwrfI1":["feb:13:ability-line72","equipment:core:297:table0:row12"],"Srla7jG7VjnC84xn":["feb:13:ability-line72","equipment:core:297:table0:row12"],"P1blVI7CcAMLkyTJ":["core:155:feature-line3"],"PK2dsGRBlBsD4yqV":["core:380:move-line45"],"PL88yhrvOchgllAA":["core:380:move-line36"],"PLfjF8fWQRPxnr1b":["core:354:move-line4"],"PWFiPAiS6UNblMEi":["core:361:move-line23"],"Q1riP3kQOmXsC87S":["core:330:ability-line79","feb:10:ability-line17"],"QSBfXnEJ10NZnk0Z":["throhs:75:feature-line9"],"QSOJqOsxP8TMxxZi":["core:88:feature-line42"],"QSyN1IhbBRMcrhAF":["equipment:core:297:table0:row12"],"QXstaqQofzAUn774":["core:388:move-line4","core:304:capability-freezer"],"QiM1lYbyKd8CpfpL":["core:434:move-line3"],"RaNWzf3670xZl3TU":["core:374:move-line15","core:363:move-line56"],"RnonNxaBj0Z4nMXH":["core:53:feature-line71","core:38:feature-line45","core:46:feature-line4","core:48:feature-line32","core:49:feature-line4","core:51:feature-line47"],"RzJizJiENgnmhr5x":["core:382:move-line24"],"S6HPnUwePesar48A":["core:334:ability-line67","core:351:move-line56"],"Su5H2spXaplLMexD":["core:354:move-line25"],"SwTrCa9QaIudkmyX":["core:346:move-line38"],"T0v32qQRuZnSVXaD":["f1:core:246:poisoned"],"T2n07CO2M82Er8Sz":["f1:core:248:stuck"],"TIXFtoJsuH3sklKu":["core:328:ability-line15","feb:8:ability-line54"],"TLCE3NR1GCYkV2Zn":["core:414:move-line34"],"TLumhP0tLbp1YgsE":["core:389:move-line37","core:394:move-line48","sep:4:move-line27"],"Tg1ey33pd5jw2FAN":["core:351:move-line77"],"TgMuE0qRzHnqDTTs":["core:386:move-line61"],"ThL1hEgLScReEGFU":["core:418:move-line52"],"UOwQkZpkwdU7kCHU":["core:329:ability-line49"],"UdRHrCM7dkAVKUh3":["core:322:ability-line62","feb:6:ability-line60"]};
const nativeLinks={OMjhFmpjqqaYBskG:'HDXMSgAoga7IZ5sh',QkotgyK9W5G6BlZM:'6ykh6wKs7S5DJlXw'};

export function checkEffectF3dSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3d');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3d');
    if (!audit) { fail(!slice.recordFile, 'F3d completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3d record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3d' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3d frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3d independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3d exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 75 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 97 && audit.nativeContexts.length === 5, 'F3d bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3d full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3d complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3d full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3d exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3dSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3dFactErrors(facts).length === 0, 'F3d independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3dFactErrors(facts).join('; '));
    const proseRequirements = effectF3dSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.friendshipSpirit.completeFrameworkEstablished === false && audit.authoringLimits.friendshipSpirit.externalRetrievalAssigned === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3d missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3d'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 133 && snapshots.size === audit.targetSnapshots.length, 'F3d exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3d exact current target/prior chronology changed: ' + s.identity);
    }

    fail(equal(audit.independentUseContextSnapshots, []), 'F3d no invented independent producer relationship');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3d full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F3d literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3d literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3d exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3c').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3d independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3d per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3d exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3dFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3d source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3d independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || d.nativeContextIds.includes(nativeLinks[shortId])), 'F3d per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === 'partially-supported' && d.completeCurrentGenerationEstablished === false, 'F3d unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3d complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3d actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectF3dRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3d complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3d exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3d exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3d incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3d complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3d historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3d finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 31, unresolved: 29}) && equal(counts, closure.counts), 'F3d bounded correspondence/limit counts changed');
}
