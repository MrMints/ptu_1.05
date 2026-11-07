// Offline F3c source/current evidence. No runtime, acquisition or policy consumer.
import {effectReferences, effectLiteralReferences} from './effect-source-review.mjs';
import {effectPageReferences} from './effect-slice-source-review.mjs';
import {effectOtherRuleRoles} from './effect-other-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';

const MEMBERSHIP = '42dd014fa42ab4c3af73fe2c0c965f42d1a757c293bc38e15f51c066c91b5079';
const SOURCE_PRIMITIVES = '4e35efc567bbf1251968818cfcab40b82f6b91d914a84a87ddddd9792f012629';
const EXAMINED_DISPOSITIONS = 'fc15ad2bde92a0bff799b1e542c2899f12c43afbafa87c320c611b142f79d89d';
const HISTORICAL_OBSERVATIONS = '89bf3ade58539f2ebd4e3520e5f1eadcb261f2b5ea1f4f0c8f5929e1d56c9641';

export function effectF3cSourceFacts(audit, cleanText) {
    const unit = id => {
        const u = audit.sourceDefinitions.find(u => u.id === id);
        return cleanText(u?.rawDefinition ?? u?.completeSourceUnit?.proseAnchor?.rawText ?? u?.completeSourceUnit?.effect ?? '');
    };
    const page = id => cleanText(audit.parentContexts.find(p => p.id === id)?.rawText ?? '');
    const nativeRaw = id => audit.nativeContexts.find(p => p.pageId === id)?.rawText ?? '';
    const native = id => cleanText(nativeRaw(id));
    const take = (text, re) => text.match(re)?.[0] ?? null;
    const number = (text, re) => { const m = text.match(re); return m ? Number(m[1]) : null; };
    const quick = unit('core:327:ability-line36'), quickOptional = unit('feb:8:ability-line11');
    const strategist = unit('core:334:ability-line25'), stench = unit('core:331:ability-line51'), stenchOptional = unit('feb:10:ability-line46');
    const drain = unit('core:331:ability-line67'), drainOptional = unit('feb:10:ability-line53');
    const fluffy = unit('core:317:ability-line84'), charge = unit('core:356:move-line14'), spinning = unit('core:330:ability-line69');
    const reckless = unit('core:61:feature-line13'), pinpoint = unit('core:62:feature-line54'), sage = unit('core:189:feature-line21');
    const pumped = unit('core:397:move-line25'), beam = unit('core:356:move-line26');
    const dust = native('EsuHFXwpAtJdxs0Q'), choke = native('gkgZ3BYSGis8Uhxi'), enshrouded = native('o2sGLH6NV9dXHcfT');
    const cyclone = native('CrZdaAJwy5UHjurj'), rad = native('KPTl4Ok92yhWblt7'), thunder = native('18guO0fFJfsCaMDp');
    const stage = (id, re, recipient, qualifier) => { const definition = unit(id), delta = number(definition, re); return {completeDefinition: definition,
        signedDelta: delta === null ? null : -delta, recipient, completeQualifier: take(definition, qualifier)}; };
    return {
        quickCurl: {originalDefinition: quick, optionalDefinition: quickOptional,
            originalAction: take(quick, /use Defense Curl as a Swift Action/), originalAdditionalDrPrinted: /Damage Reduction/.test(quick),
            optionalAction: take(quickOptional, /use Defense Curl as an Standard Action Interrupt/),
            optionalDr: number(quickOptional, /gain \+([0-9]+) Damage Reduction/), optionalLifetime: take(quickOptional, /for 1 full round/),
            automaticDefenseCurlVersionPairingEstablished: false},
        typeStrategist: {completeDefinition: strategist, completeReprint: unit('core:119:ability-line86'),
            ordinaryDr: number(strategist, /gain \+([0-9]+) Damage Reduction/), lowHealthDr: number(strategist, /instead gain \+([0-9]+) Damage Reduction/),
            strictFractionalThreshold: take(strategist, /under 1\/3rd of their Maximum Hit Points/), lifetime: take(strategist, /for one full round/),
            percentageBracketEquivalenceVerified: false},
        stench: {originalDefinition: stench, optionalDefinition: stenchOptional,
            originalFlinch: number(stench, /Flinch Targets on a roll of ([0-9]+)\+/), originalExistingRangeAddition: number(stench, /Effect Range is increased by \+([0-9]+)/),
            optionalFlinch: number(stenchOptional, /Flinch Targets on a roll of ([0-9]+)\+/), optionalExistingRangeAddition: number(stenchOptional, /Effect Range is increased by \+([0-9]+)/),
            optionalAccuracyPenalty: number(stenchOptional, /(-[0-9]+) penalty to Accuracy Rolls/),
            optionalPenaltyTrigger: take(stenchOptional, /Whenever the user Flinches a foe with an attack/), lifetime: take(stenchOptional, /for 1 full round/)},
        stormDrain: {originalDefinition: drain, optionalDefinition: drainOptional,
            originalEveryWaterHit: take(drain, /each time they are hit by a Water-?Type attack, the user's Special Attack is raised 1 Combat Stage/),
            optionalAfterRedirect: take(drainOptional, /the user's Special Attack is then raised by \+1 Combat Stage/),
            optionalEveryHitPrinted: /each time/.test(drainOptional), originalAndOptionalTriggersEquivalent: false},
        fluffyCharge: {completeAbility: fluffy, completeMove: charge,
            abilityDefenseDelta: number(fluffy, /gain \+([0-9]+) CS to Defense/), abilitySpecialDefensePrinted: /Special Defense/.test(fluffy),
            moveSpecialDefenseDelta: number(charge, /Special Defense ([0-9]+) Combat Stage/),
            moveNextTurnElectricClause: take(charge, /If the user performs an Electric Move on their next turn that deals damage, add its Damage Dice Roll an extra time to the damage/),
            automaticCombinationOrDuplicationVerified: false},
        spinningDance: {completeDefinition: spinning, missedAttack: take(spinning, /The user is targeted by an attack, but is missed/),
            condition: take(spinning, /If not Fainted, Paralyzed, or Asleep/), evasionDelta: number(spinning, /gains \+([0-9]+) Evasion/),
            optionalShift: take(spinning, /may immediately Shift 1 meter/)},
        recklessAdvance: {completeDefinition: reckless, damageBonus: number(reckless, /attacks by \+([0-9]+)/),
            boundMeleeScope: take(reckless, /While this Feature is Bound, increase the damage rolls of the target's damaging melee attacks/),
            tripRange: number(reckless, /Trip targets on Accuracy Rolls of ([0-9]+)\+/),
            vulnerableRecipientAndTrigger: take(reckless, /When the target of Reckless Advance hits with a damaging melee attack, they become Vulnerable for one full round/),
            resource: take(reckless, /Bind 2 AP - Standard Action/)},
        pinpointStrike: {completeDefinition: pinpoint, accuracyAndEffectRangeBonus: number(pinpoint, /attacks by \+([0-9]+)/),
            damagePenalty: number(pinpoint, /attacks deal ([0-9]+) less damage/), damagingOnly: take(pinpoint, /target's damaging attacks/),
            ordering: take(pinpoint, /before applying weakness and resistance/), resource: take(pinpoint, /Bind 2 AP - Standard Action/)},
        sageBenediction: {completeDefinition: sage, distinctOriginalTitle: take(sage, /Sage's Benediction/),
            prerequisites: take(sage, /Prerequisites: Sacred Shield or Mystic Defense, Adept Occult Education/),
            priceAndAction: take(sage, /1 AP - Free Action/), trigger: take(sage, /An ally activates one of your Moves with the Blessing Keyword/),
            afterBoth: take(sage, /after the Blessing and the attack that triggered it are resolved/),
            reflectDefenseDelta: number(sage, /Reflect: \+([0-9]+) Defense Combat Stage/), completeReflect: unit('core:424:move-line3'),
            renamedCrCanonicalRelationshipEstablished: false},
        pumped: {completeDefinition: pumped, criticalRangeExtension: number(pumped, /Critical Range is extended by ([0-9]+)/),
            unextendedAlternative: take(pumped, /or 18\+ if the Critical Range is not otherwise extended/),
            switchEnds: take(pumped, /Being switched will cause this effect to end/), getLuckyIndependentAuthoringEstablished: false},
        chargeBeam: {completeDefinition: beam, separateSuccessfulHitThenRoll: take(beam, /If Charge Beam successfully hits a target, roll 1d20/),
            separateRollThreshold: number(beam, /On a roll of ([0-9]+)\+/), selfSpecialAttackDelta: number(beam, /Special Attack is raised by \+([0-9]+) Combat Stage/),
            attackAccuracyRollIsThisSeparateRoll: false},
        stageMoves: {
            babyDollEyes: stage('core:360:move-line14', /Attack is lowered ([0-9]+) Combat Stage/, 'target', /The target's Attack is lowered 1 Combat Stage/),
            featherDance: stage('core:374:move-line36', /Attack lowered ([0-9]+) Combat Stage/, 'all-legal-targets', /All legal targets have their Attack lowered 2 Combat Stages/),
            lowSweep: stage('core:366:move-line14', /Speed ([0-9]+) Combat Stage/, 'target', /Lowers the target's Speed 1 Combat Stage/),
            leer: stage('core:400:move-line57', /Defense lowered by ([0-9]+) Combat Stage/, 'all-legal-targets', /All legal targets have their Defense lowered by 1 Combat Stage/),
            crunch: stage('core:350:move-line40', /Defense ([0-9]+) Combat Stage/, 'target', /Crunch lowers the target's Defense 1 Combat Stage on 17\+/),
            energyBall: stage('core:380:move-line55', /Special Defense ([0-9]+) Combat Stage/, 'foe', /Energy Ball lowers the foe's Special Defense 1 Combat Stage on 17\+/),
            charm: stage('core:360:move-line23', /Attack ([0-9]+) Combat Stage/, 'target', /Charm lowers the target's Attack 2 Combat Stages/),
            metalSound: stage('core:430:move-line72', /Special Defense lowered ([0-9]+) Combat Stage/, 'all-legal-targets', /All Legal Targets have their Special Defense lowered 2 Combat Stages/),
            venomDrench: stage('core:416:move-line71', /Speed lowered by ([0-9]+) Combat Stage/, 'all-poisoned-targets', /All Poisoned targets have their Attack, Special Attack, and Speed lowered by 1 Combat Stage\. Venom Drench cannot miss/),
            frighten: stage('core:318:ability-line73', /Speed ([0-9]+) Combat Stage/, 'pokemon-or-trainer-within-5m', /Scene - Swift Action Target: A Pokemon or Trainer within 5 meters/)
        },
        rapidSpin: {completeDefinition: unit('core:404:move-line60'), speedStagePrinted: /Speed|Combat Stage/.test(unit('core:404:move-line60')),
            originalDamageBase: number(unit('core:404:move-line60'), /Damage Base ([0-9]+):/),
            cleanup: take(unit('core:404:move-line60'), /destroys all Hazards within 5 meters, removes Leech Seeds, and removes the user's Trapped or Stuck status/)},
        fixedHp: {dragonRage: unit('core:354:move-line45'), sonicBoom: unit('core:409:move-line3'),
            dragonHpLoss: number(unit('core:354:move-line45'), /lose ([0-9]+) Hit Points/), sonicHpLoss: number(unit('core:409:move-line3'), /lose ([0-9]+) Hit Points/),
            sourceDragonClass: take(unit('core:354:move-line45'), /Class: Special/), sourceSonicClass: take(unit('core:409:move-line3'), /Class: Special/),
            ordinaryDrOrStageRewriteEquivalenceVerified: false},
        generic: {accuracyAndEvasion: page('core:234'), stages: page('core:235'), stabAndTypes: page('core:236'),
            optionalTypeAura: unit('feb:13:ability-line72'), typeBooster: unit('equipment:core:297:table0:row12'),
            fixedTypeHelperCanonicalRelationshipsEstablished: false},
        duststorm: {completeDefinition: dust, specialDr: number(dust, /\+([0-9]+) Special Damage Reduction/),
            endTurnTick: take(dust, /All non-Ground, Rock and Steel Type creatures lose a Tick of Hit Points at the end of their turn/),
            specialRanged: take(dust, /Special Ranged Moves suffer -1 Accuracy versus target\(s\) 4 or more meters away/),
            movement: take(dust, /All non-Ground and Rock Type creatures receive a penalty of -3 to their Fly Movement Capability \(if applicable\) and a penalty of -1 to all of their other Movement Capabilities/),
            allFlyLevitatePathEquivalenceVerified: false},
        chokingCloud: {completeDefinition: choke, criticalSlicePoison: take(choke, /When a creature takes a Critical Hit.*?Slice.*?Poisoned/),
            afflictionVulnerability: take(choke, /While a creature is afflicted with.*?Poisoned.*?Badly Poisoned.*?Vulnerable/),
            dragConditionNoteCount: (nativeRaw('gkgZ3BYSGis8Uhxi').match(/Drag @UUID/g) ?? []).length,
            partialAutomationNote: take(choke, /This effect is only partially Automated/), criticalHitAlwaysMeansRoll20: false},
        glowy: {completeDefinition: native('2sJWuEyR9S47v7bf'),
            randomAbility: take(native('2sJWuEyR9S47v7bf'), /Non-Nuclear-Type creatures have one of their Abilities randomly disabled/)},
        enshrouded: {completeDefinition: enshrouded, hyperModeDcIncrease: number(enshrouded, /DC for all Hyper Mode Saves increases by \+([0-9]+)/),
            sourceRole: /DC for all Hyper Mode Saves increases/.test(enshrouded) ? 'dc-increase' : null,
            optionalStage: take(enshrouded, /Once per Scene, when a Shadow-Type creature gains at least one Combat Stage, they may add \+1 Combat Stage to any one of the Stats affected/),
            manualNoteCount: (nativeRaw('o2sGLH6NV9dXHcfT').match(/not Automated/g) ?? []).length, dcAndSaveBonusEquivalent: false},
        cyclone: {completeDefinition: cyclone,
            initiativeRecipients: take(cyclone, /Flying-Type creatures, creatures with the Fly and\/or Levitate Movement Capabilities, and creatures with the Wind Rider Ability gain \+10 to their Initiative/),
            extraMovement: take(cyclone, /Flying-Type creatures and creatures with the Wind Rider Ability gain an additional \+2 bonus to their Fly and\/or Levitate Capability, if able/),
            resistance: take(cyclone, /The Flying-Type now resists the Types it is normally weak against/),
            bothPushConsequences: take(cyclone, /When Pushed, all creatures are Pushed an additional X meters.*Target\(s\) hit by this Move are Pushed 1 meter/),
            fixedEffectivenessFactorVerified: false, windRiderNativeUuidIsScopeProof: false},
        radshower: {completeDefinition: rad,
            incomingDamageBonus: number(rad, /take \+([0-9]+) bonus damage from all attacks/),
            sourceRole: /take \+10 bonus damage from all attacks/.test(rad) ? 'incoming-damage-bonus' : null,
            physicalSteel: take(rad, /Nuclear-Type Moves and Physical Steel-Type Moves/),
            existingFlinchAddition: number(rad, /Effect Range for Flinches increases by ([0-9]+)/),
            manualNoteCount: (nativeRaw('KPTl4Ok92yhWblt7').match(/not Automated/g) ?? []).length, drSubtractionEquivalenceVerified: false},
        thunderstorm: {completeDefinition: thunder, swimSubstitution: take(thunder, /All Water-Type creatures may utilize their Swim Capability in place of their Overland Capability/),
            physicalRanged: take(thunder, /Physical Ranged Moves suffer -1 Accuracy versus target\(s\) 4 or more meters away/),
            dc: number(thunder, /DC ([0-9]+) Save/), lostTicks: number(thunder, /lose ([0-9]+) Ticks of Hit Points/),
            attackAndOrigin: take(thunder, /Electric-Type Ranged Attack originating from the creature's square/),
            interactions: take(thunder, /apply Weakness, Resistance, and applicable Abilities/),
            manualNoteCount: (nativeRaw('18guO0fFJfsCaMDp').match(/not Automated/g) ?? []).length, overlandExpressionEquivalenceVerified: false},
        weatherBaseline: {sandstorm: unit('core:427:move-line40'), rainDance: unit('core:433:move-line75'),
            sandStreamOriginal: unit('core:328:ability-line58'), sandStreamOptional: unit('feb:9:ability-line9'),
            drizzleOriginal: unit('core:316:ability-line36'), drizzleOptional: unit('feb:4:ability-line73'),
            introduction: native('7znCkHSW9AWIyFIA'), independentApprovedTieredWeatherAuthoringEstablished: false},
        unavailableAuthoring: {profileContextsAreFullMoveDefinitions: false, friendshipSpiritCompleteFrameworkEstablished: false,
            namesDetermineGeneration: false, finiteNoHitsProveSourceAbsence: false}
    };
}

export const effectF3cFindingKeys = {
    DWTWJkEea6wZgRAr: ['quickCurl'], DlVJLO2Cd61pB3Xc: ['typeStrategist'], Fest7tdgmN3e67BK: ['fluffyCharge'],
    G3Dm3BBBe6vN0391: ['stench'], HzuXzHaliXLwU4Sm: ['stormDrain'], HYaM8gqE57Ud6kPB: ['spinningDance'],
    FMhkR9rKCkyJTOVo: ['recklessAdvance'], Jphgqcq54ao72CpW: ['pinpointStrike'], JyUJFDshzL34NCx1: ['sageBenediction'],
    GGzbwfYV5wqMIF9u: ['pumped'], LJ30o41BPZ43Jlxd: ['chargeBeam'], Hh6VvJMUarY6SCQP: ['rapidSpin'],
    IK1rQX84Oel7pChQ: ['fixedHp'], JTLLBpOZZG18eJTY: ['fixedHp'],
    DkBFKH0w90KHOHYf: ['duststorm', 'weatherBaseline'], DrzQrsJTYAVYfae3: ['chokingCloud', 'weatherBaseline'],
    Ea9xpePsg9JDCrZF: ['glowy', 'weatherBaseline'], F8rAIOXaWcw9uDDv: ['enshrouded', 'weatherBaseline'],
    GQKD8EKwCeB7Wpeo: ['cyclone', 'weatherBaseline'], K3TwnRkMysI9iP29: ['radshower', 'weatherBaseline'],
    L76G6hMXT01pms8o: ['thunderstorm', 'weatherBaseline']
};
const stageIdentities = {EjQwuBuIqKQOQQ7M:'babyDollEyes',EmCJsKEn8oqgmVs9:'featherDance',EvaFS9Nr7uhEW7Wn:'lowSweep',F9VypMoQOMfLM50d:'leer',GCENT4iWor5LENnk:'crunch',GOHWQsbv3nbLHYn1:'energyBall',Gvu45ox6G9QOFBuN:'charm',Jv9p3aM5DsGBoIoN:'metalSound',K09Vbcxe9lbpvNEQ:'venomDrench',Kqd1VcN7pWbuUFu8:'frighten'};
export function effectF3cFindings(identity, facts) {
    const id = identity.split('.')[1];
    return stageIdentities[id] ? {stageMove: facts.stageMoves[stageIdentities[id]]}
        : Object.fromEntries((effectF3cFindingKeys[id] ?? ['generic', 'unavailableAuthoring']).map(k => [k, facts[k]]));
}

export function effectF3cSemanticRequirements(facts) {
    return {
        DWTWJkEea6wZgRAr: [/Swift Action/, /STANDARD ACTION INTERRUPT/, new RegExp(`adds${facts.quickCurl.optionalDr} Damage Reduction`), /1 FULL ROUND/, /Original\/optional Defense Curl/],
        DlVJLO2Cd61pB3Xc: [/UNDER1\/3/, /1 FULL ROUND/, /percentage rounding/],
        Fest7tdgmN3e67BK: [/Charge core356 separately prints Special Defense\+1/, /without attributing the Special Defense clause to the Ability itself/, /only charge:bonus, not a stage object/],
        G3Dm3BBBe6vN0391: [/Original Stench gives Flinch19\+ or existing Flinch-range\+2/, /18\+ or existing-range\+3/, /WHEN the user Flinches a foe WITH AN ATTACK/, /1 FULL ROUND/],
        HzuXzHaliXLwU4Sm: [/EACH Water HIT/, /AFTER the redirect/, /not to identical triggers across versions/],
        HYaM8gqE57Ud6kPB: [/ATTACK targets but MISSES/, /IF NOT Fainted, Paralyzed or Asleep/, /MAY immediately Shift1 meter/],
        FMhkR9rKCkyJTOVo: [/WHILE BOUND/, /damaging MELEE/, /Trip foes on18\+/, /TARGET OF THE ORDER/, /THAT POKEMON becomes Vulnerable1 FULL ROUND/],
        Jphgqcq54ao72CpW: [/Bind2AP/, /DAMAGING attacks/, /Accuracy2 and EffectRange2/, /5 LESS DAMAGE BEFORE weakness\/resistance/],
        JyUJFDshzL34NCx1: [/Original SAGE’S BENEDICTION/, /ONE OF YOUR BLESSING MOVES/, /AFTER BOTH the Blessing AND triggering attack/, /renamed CR identity\/canonical.*unestablished/],
        GGzbwfYV5wqMIF9u: [/18\+ if NOT OTHERWISE EXTENDED/, /SWITCHING ends/, /Get Lucky.*unestablished/],
        LJ30o41BPZ43Jlxd: [/SUCCESSFUL HIT, THEN a SEPARATE1d20 roll7\+/, /not an Accuracy roll7\+/],
        Hh6VvJMUarY6SCQP: [/DB2/, /ALL Hazards within5m/, /Trapped OR Stuck/, /NO Speed increase/],
        IK1rQX84Oel7pChQ: [/LOSE15HP/, /remains SPECIAL/, /OVERRIDES/, /including negative values/],
        JTLLBpOZZG18eJTY: [/15HP LOSS/, /SPECIAL/, /DOWNGRADES/, /negative stages remain distinct/],
        DkBFKH0w90KHOHYf: [/SPECIAL DR10/, /Special Ranged Accuracy1 at4m\+/, /Fly-3\/OTHER Movement-1/, /turn START/, /extra Levitate-specific penalty is not printed/],
        DrzQrsJTYAVYfae3: [/CRITICAL HIT from a SLICE Move/, /range20 is not a universal critical-hit condition/, /BOTH|Both.*drag-the-condition/],
        Ea9xpePsg9JDCrZF: [/RANDOMLY DISABLES one Ability/, /non-Nuclear/],
        F8rAIOXaWcw9uDDv: [new RegExp(`raises the DC of Hyper Mode saves by${facts.enshrouded.hyperModeDcIncrease}`), /DC\+2 is a different typed role.*BONUS\+2/, /SHADOW creature optionally adding1 stage/, /once per Scene when gaining at least one stage/, /ALL THREE manual notes/],
        GQKD8EKwCeB7Wpeo: [/Flying-TYPE creatures OR Fly\/Levitate-capable/, /Initiative predicate omits Flying-Type itself/, /BOTH Push consequences/],
        K3TwnRkMysI9iP29: [/\+10 INCOMING DAMAGE/, /not certified equivalent.*DR-subtract10/, /PHYSICAL Steel/, /OR add2 to an existing Flinch range/],
        L76G6hMXT01pms8o: [/MAY substitute Swim for Overland/, /Physical RANGED Accuracy-1 at4m\+/, /DC8 SAVE failure for3 TICKS/, /creature’s SQUARE/, /weakness\/resistance\/applicable Abilities/],
        K09Vbcxe9lbpvNEQ: [/ALL POISONED/, /CANNOT MISS/, /not broadened to unpoisoned/]
    };
}

export function effectF3cFactErrors(f) {
    const errors = [];
    const need = (ok, name) => { if (!ok) errors.push(name); };
    const walk = (v, path = '') => { if (v === null || v === '') errors.push('missing complete source clause ' + path);
        else if (v && typeof v === 'object') for (const [k, child] of Object.entries(v)) walk(child, path + '.' + k); };
    walk(f);
    need(f.quickCurl.originalAdditionalDrPrinted === false && f.quickCurl.optionalDr === 10 && f.quickCurl.automaticDefenseCurlVersionPairingEstablished === false, 'Quick Curl original/optional action/DR roles');
    need(f.typeStrategist.ordinaryDr === 5 && f.typeStrategist.lowHealthDr === 10 && f.typeStrategist.percentageBracketEquivalenceVerified === false, 'Type Strategist strict fractional threshold');
    need(f.stench.originalFlinch === 19 && f.stench.originalExistingRangeAddition === 2 && f.stench.optionalFlinch === 18
        && f.stench.optionalExistingRangeAddition === 3 && f.stench.optionalAccuracyPenalty === -2, 'Stench original/optional triggers and penalty');
    need(f.stormDrain.optionalEveryHitPrinted === false && f.stormDrain.originalAndOptionalTriggersEquivalent === false, 'Storm Drain each-hit/redirect distinction');
    need(f.fluffyCharge.abilityDefenseDelta === 1 && f.fluffyCharge.abilitySpecialDefensePrinted === false
        && f.fluffyCharge.moveSpecialDefenseDelta === 1 && f.fluffyCharge.automaticCombinationOrDuplicationVerified === false, 'Fluffy Charge two independent source roles');
    need(f.spinningDance.evasionDelta === 1 && f.recklessAdvance.damageBonus === 8 && f.recklessAdvance.tripRange === 18, 'Spinning Dance/Reckless Advance source conditions');
    need(f.pinpointStrike.accuracyAndEffectRangeBonus === 2 && f.pinpointStrike.damagePenalty === 5, 'Pinpoint typed bonuses and pre-resistance penalty');
    need(f.sageBenediction.reflectDefenseDelta === 1 && f.sageBenediction.renamedCrCanonicalRelationshipEstablished === false, 'Benediction source identity/timing');
    need(f.pumped.criticalRangeExtension === 2 && f.pumped.getLuckyIndependentAuthoringEstablished === false, 'Pumped conditional extension and source identity');
    need(f.chargeBeam.separateRollThreshold === 7 && f.chargeBeam.selfSpecialAttackDelta === 1 && f.chargeBeam.attackAccuracyRollIsThisSeparateRoll === false, 'Charge Beam separate post-hit roll');
    const deltas = {babyDollEyes:-1,featherDance:-2,lowSweep:-1,leer:-1,crunch:-1,energyBall:-1,charm:-2,metalSound:-2,venomDrench:-1,frighten:-2};
    for (const [key, value] of Object.entries(deltas)) need(f.stageMoves[key].signedDelta === value, 'signed/recipient stage source ' + key);
    need(f.rapidSpin.originalDamageBase === 2 && f.rapidSpin.speedStagePrinted === false, 'Rapid Spin source omission');
    need(f.fixedHp.dragonHpLoss === 15 && f.fixedHp.sonicHpLoss === 15 && f.fixedHp.ordinaryDrOrStageRewriteEquivalenceVerified === false, 'fixed HP loss is not a DR/stage rewrite');
    need(f.generic.fixedTypeHelperCanonicalRelationshipsEstablished === false && f.duststorm.specialDr === 10
        && f.duststorm.allFlyLevitatePathEquivalenceVerified === false, 'typed generic/Duststorm roles');
    need(f.chokingCloud.dragConditionNoteCount === 2 && f.chokingCloud.criticalHitAlwaysMeansRoll20 === false, 'Choking Cloud critical-hit and manual conditions');
    need(f.enshrouded.hyperModeDcIncrease === 2 && f.enshrouded.sourceRole === 'dc-increase'
        && f.enshrouded.manualNoteCount === 3 && f.enshrouded.dcAndSaveBonusEquivalent === false, 'Enshrouded DC role and all manual notes');
    need(f.cyclone.fixedEffectivenessFactorVerified === false && f.cyclone.windRiderNativeUuidIsScopeProof === false, 'Cyclone source recipients/resistance/scope');
    need(f.radshower.incomingDamageBonus === 10 && f.radshower.sourceRole === 'incoming-damage-bonus'
        && f.radshower.existingFlinchAddition === 2 && f.radshower.manualNoteCount === 2 && f.radshower.drSubtractionEquivalenceVerified === false, 'Radshower damage/DR and Flinch roles');
    need(f.thunderstorm.dc === 8 && f.thunderstorm.lostTicks === 3 && f.thunderstorm.manualNoteCount === 1
        && f.thunderstorm.overlandExpressionEquivalenceVerified === false, 'Thunderstorm conditional attack/tick roles');
    need(f.weatherBaseline.independentApprovedTieredWeatherAuthoringEstablished === false && Object.values(f.unavailableAuthoring).every(v => v === false), 'unavailable authoring/source/scope boundaries');
    return errors;
}

const sourceLinks = {
    DWTWJkEea6wZgRAr:['core:327:ability-line36','feb:8:ability-line11'],DlVJLO2Cd61pB3Xc:['core:119:ability-line86','core:334:ability-line25'],
    Fest7tdgmN3e67BK:['core:317:ability-line84','core:356:move-line14'],G3Dm3BBBe6vN0391:['core:331:ability-line51','feb:10:ability-line46'],
    HzuXzHaliXLwU4Sm:['core:331:ability-line67','feb:10:ability-line53'],HYaM8gqE57Ud6kPB:['core:330:ability-line69'],
    FMhkR9rKCkyJTOVo:['core:61:feature-line13'],Jphgqcq54ao72CpW:['core:62:feature-line54'],JyUJFDshzL34NCx1:['core:189:feature-line21','core:424:move-line3'],
    GGzbwfYV5wqMIF9u:['core:397:move-line25'],LJ30o41BPZ43Jlxd:['core:356:move-line26'],Hh6VvJMUarY6SCQP:['core:404:move-line60'],
    IK1rQX84Oel7pChQ:['core:354:move-line45'],JTLLBpOZZG18eJTY:['core:409:move-line3'],
    EjQwuBuIqKQOQQ7M:['core:360:move-line14'],EmCJsKEn8oqgmVs9:['core:374:move-line36'],EvaFS9Nr7uhEW7Wn:['core:366:move-line14'],
    F9VypMoQOMfLM50d:['core:400:move-line57'],GCENT4iWor5LENnk:['core:350:move-line40'],GOHWQsbv3nbLHYn1:['core:380:move-line55'],
    Gvu45ox6G9QOFBuN:['core:360:move-line23'],Jv9p3aM5DsGBoIoN:['core:430:move-line72'],K09Vbcxe9lbpvNEQ:['core:416:move-line71'],Kqd1VcN7pWbuUFu8:['core:318:ability-line73']
};
const nativeLinks = {DkBFKH0w90KHOHYf:'EsuHFXwpAtJdxs0Q',DrzQrsJTYAVYfae3:'gkgZ3BYSGis8Uhxi',Ea9xpePsg9JDCrZF:'2sJWuEyR9S47v7bf',F8rAIOXaWcw9uDDv:'o2sGLH6NV9dXHcfT',GQKD8EKwCeB7Wpeo:'CrZdaAJwy5UHjurj',K3TwnRkMysI9iP29:'KPTl4Ok92yhWblt7',L76G6hMXT01pms8o:'18guO0fFJfsCaMDp'};

export function checkEffectF3cSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F3c');
    const audit = bundle.effectSlices?.find(a => a.slice === 'F3c');
    if (!audit) { fail(!slice.recordFile, 'F3c completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F3c record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F3c' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F3c frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F3c independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.effectReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F3c exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 60 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 58 && audit.printedDefinitions.length === 0
        && audit.parentContexts.length === 78 && audit.nativeContexts.length === 17, 'F3c bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F3c full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F3c complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F3c full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F3c exact native page/authority changed: ' + n.pageId);
    }
    const facts = effectF3cSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && effectF3cFactErrors(facts).length === 0, 'F3c independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + effectF3cFactErrors(facts).join('; '));
    const proseRequirements = effectF3cSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.friendshipSpirit.completeFrameworkEstablished === false && audit.authoringLimits.friendshipSpirit.externalRetrievalAssigned === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F3c missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F3c'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 124 && snapshots.size === audit.targetSnapshots.length, 'F3c exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, effectPageReferences(a?.data)), 'F3c exact current target/prior chronology changed: ' + s.identity);
    }

    const useContexts = audit.independentUseContextSnapshots ?? [];
    fail(equal(useContexts.map(s => s.identity), ['moves.qRvLgOrsmdXEsBsU','effects.4wH3FJEq07P2aiBC']), 'F3c complete independent Charge use contexts missing');
    for (const s of useContexts) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === a?.contentHash && equal(s.document, a?.data) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && s.canonicalRelationshipClaim === false && s.behavioralVerification === 'not-run', 'F3c independent current Charge context/prior changed: ' + s.identity);
    }
    fail(useContexts[0]?.priorSourceReview?.sourceComparison?.sourceUnit === 'core:356:move-line14'
        && useContexts[0]?.document.system.referenceEffect === 'Compendium.ptu.effects.Item.4wH3FJEq07P2aiBC'
        && equal(useContexts[1]?.document.system.rules, [{key:'RollOption',option:'charge:bonus'}]), 'F3c Charge source identity or actual Charged flag-only observation changed');
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F3c full relative embedded native context missing');
    }
    fail(embeds.length === 6 && equal(embeds, audit.nativeContextEmbeds), 'F3c literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of effectReferences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => effectPageReferences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F3c literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F3c exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3b').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F3c independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F3c per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.effectReview;
        fail(r && e && d && doc?.type === 'effect' && r.contentHash === contentHash && e.contentHash === contentHash, 'F3c exact effect examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialFieldCorrespondence ? 'examined-effect-source-correspondence' : 'examined-effect-version-or-authority-limit')
            && (d.partialFieldCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, effectF3cFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata and optional/explicit-errata definitions remain separate'
            && r.coverageState === (d.partialFieldCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F3c source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F3c independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || d.nativeContextIds.includes(nativeLinks[shortId])), 'F3c per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === 'partially-supported' && d.completeCurrentGenerationEstablished === false, 'F3c unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F3c complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','duration','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F3c actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, effectOtherRuleRoles(doc)) && equal(e.literalReferences, effectLiteralReferences(doc))
            && equal(e.pageReferences, effectPageReferences(doc)), 'F3c complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F3c exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), effectReferences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F3c exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) fail(effectReferences(actualMap.get(ref.sourceIdentity)?.data).every(r => snapshots.has(r.targetIdentity)), 'F3c incoming producer outgoing target omitted: ' + identity);
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F3c complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'effects');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F3c historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F3c finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 21, unresolved: 39}) && equal(counts, closure.counts), 'F3c bounded correspondence/limit counts changed');
}
