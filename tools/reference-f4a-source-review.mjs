// Offline reference-source evidence. These records are descriptive references,
// not manufactured effects, acquisition implementations or runtime policy.
import {effectReferences as referenceUuidOccurrences,effectLiteralReferences as referenceLiterals} from './effect-source-review.mjs';
import {effectPageReferences as referencePageOccurrences} from './effect-slice-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='3f3206793000630cd23fb3a9dffb581bf4a168e8527e52f987cf5313940da88d';
const SOURCE_PRIMITIVES='f7acfd95a5dd82bc72226a08c789bc54a9f28bff32c41eaa98cde1be2eec5c8d';
const EXAMINED_DISPOSITIONS='ba656ec9eda5336e8754a5e632c5b5491f5b79942cc0ef313b79f0d83aebd12b';
const HISTORICAL_OBSERVATIONS='d1dc85987fd945244c6526540b15dd6fc47ad9bf932bbfd60695d387bc96a664';
export const referenceF4aRuleRoles=doc=>(doc?.system?.rules??[]).map((object,i)=>({path:`$.system.rules[${i}]`,object,interpretation:'Stored object only; no effect semantics inferred for a descriptive reference.'}));
export const referenceF4aSourceSpecifications=[
 ['stackedLoss','unit','core:108:feature-line18',/additional ([0-9]+) Hit Points/,'5'],
 ['stackedSave','unit','core:108:feature-line18',/next time the target passes their Save Check for the chosen condition, they become Tripped and Slowed/],
 ['stackedPenalty','unit','core:108:feature-line18',/-([0-9]+) penalty to their Accuracy and Evasion while suffering from the chosen condition/,'2'],
 ['bloodiedCategory','page','core:76',/Damaging Moves.*?Bloodied Speed.*?Priority \(Advanced\) if the user has less than half of their maximum Hit Points/],
 ['curseCategory','page','core:76',/Status Moves.*?Double Curse.*?only to ([0-9]+)-Target Moves/,'1'],
 ['signatureCost','unit','core:75:feature-line47',/target loses ([0-9]+) Tutor Points.*?one Signature Technique at a time.*?([0-9]+) Tutor Point is refunded/,'2','1'],
 ['terrainEverywhere','unit','core:150:feature-line25',/do not have to be in the corresponding terrain.*?They work everywhere/],
 ['traceurUrban','printed','f4a:core:151:traceur',/Traceur - Urban Terrain.*?half your Survival Rank.*?Evasion against Push, Trip, and Attack of Opportunity/],
 ['rainbowRetune','printed','f4a:core:142:recipes',/as an Extended Action.*?change which Stat the Rainbow Amulet is attuned to/],
 ['patronScope','printed','f4a:blessed:57:patron-table',/Features with the \[PATRON STAT\] tag/],
 ['patronFallback','printed','f4a:blessed:57:patron-table',/two highest Stats/],
 ['registeelLiteral','printed','f4a:blessed:57:patron-table',/Registeel: \[\+([0-9]+) Defense or SpDef\]/,'1'],
 ['mendingChoice','printed','f4a:blessed:55:mending',/Heals ([0-9]+) HP\s*, or the Target recovers (two) Injuries/,'30','two'],
 ['mendingSigner','printed','f4a:blessed:55:mending',/Signer Effect: The target recovers ([0-9]+) HP and (one) Injury/,'50','one'],
 ['signerParent','unit','blessed:46:feature-line10',/activated as a Swift Action.*?once per Scene, and cost ([0-9]+) AP/,'1'],
 ['directedRecipient','printed','f4a:throhs:55:directed',/Tick Value against the targets of the triggering Move for one full round/],
 ['overdriveHitCost','printed','f4a:throhs:55:overdrive',/If the triggering attack hits, you lose a Tick of Hit Points.*?Tick Value plus your Occult Education Rank.*?cannot be prevented/],
 ['energyCondition','printed','f4a:throhs:55:energy-finesse',/Arcane Weapon Move and has an Effect Range.*?In addition to its existing Effect Range.*?all natural Even-Numbered Rolls/],
 ['enlargedAlternatives','printed','f4a:throhs:55:enlarged',/Burst ([0-9]+) if Melee ([0-9]+)-Target, or Blast ([0-9]+) if ranged ([0-9]+)-Target/,'1','1','2','1'],
 ['metamagicCost','unit','throhs:54:feature-line3',/([0-9]+) AP - Swift Action.*?use a Special Move.*?Rank ([0-9]+) Power Manipulation/,'1','1'],
 ['rank2Frequency','unit','throhs:54:feature-line11',/Scene x([0-9]+) - Swift Action.*?Special Move.*?Rank ([0-9]+)/,'2','2'],
 ['manipulationException','unit','throhs:54:feature-line19',/Rank 1 Manipulations.*?twice per Scene without spending AP.*?Rank 2 Manipulations.*?once per Scene without activating.*?Frequency/],
 ['originTutorCosts','unit','blessed:62:feature-line29',/loses ([0-9]+) Tutor Points.*?must still pay any Tutor Point costs.*?only target a Pokemon once/,'3'],
 ['giftRepetition','page','blessed:45',/take Touched multiple times, each time for a different Patron/],
 ['noLowerPact','page','blessed:45',/Lower Pantheon Legendaries do not have Pact Gifts/],
 ['cannonCraft','printed','f4a:may:6:recipes',/create a Cap Cannon for \$([0-9]+)/,'2000'],
 ['cannonPurchase','page','may:6',/Capsule Cannons cost \$([0-9]+)/,'5000'],
 ['eyeCraft','unit','porygon:84:feature-line57',/Enhanced Sight Augmentation for \$([0-9]+) and Smart Vision Augmentation for \$([0-9]+)/,'1000','1500'],
 ['eyePurchase','page','porygon:57',/Enhanced Sight Slot: Eyes Cost: \$([0-9]+) Capacity Used: ([0-9]+)/,'2000','1'],
 ['dermalCraft','unit','porygon:84:feature-line75',/Dermal Plating Augmentation for \$([0-9]+).*?Camo Augmentation for \$([0-9]+)/,'2000','4000'],
 ['partsSkillLimit','printed','f4a:porygon:81:parts',/gains ([0-9]+) Skill Ranks.*?select this option (twice)/,'3','twice'],
 ['partsDifferent','printed','f4a:porygon:81:parts',/Basic Combat Parts.*?multiple times, choosing different Moves each time.*?Advanced Combat Parts.*?multiple times, choosing different Moves each time/],
 ['drivesDifferent','printed','f4a:porygon:81:parts',/multiple Sympathetic Drives installed, but no two that bestow the same effect/],
 ['wiredSelection','printed','f4a:porygon:81:parts',/choose up to two of the Pokebot's Moves and one of its Abilities.*?loses access to its other Moves.*?Appliance Form/],
 ['ballsOnceEver','printed','f4a:porygon:83:modifications',/Learning, Fabulous and Power Modification work once on a Pokemon. Ever/],
 ['d100Domain','page','core:214',/Roll ([0-9]+)d([0-9]+), and subtract the Trainer's Level/,'1','100'],
 ['d20Domain','page','sep:8',/now a ([0-9]+)d([0-9]+) roll where you aim to meet or exceed/,'1','20'],
 ['captureConversion','page','sep:8',/Flip the sign on all modifiers, then divide by ([0-9]+)/,'5'],
 ['babyStagesNotCS','printed','f4a:core:213:baby-template',/subtract ([0-9]+), ([0-9]+), or even ([0-9]+) from each.*?Base Stats.*?every ([0-9]+) levels.*?gain \+([0-9]+) to each/,'2','3','4','5','1'],
 ['sweetEndpoint','printed','f4a:core:132:sweet',/gain \+([0-9]+) Evasion until the end of their next turn.*?Sweet Food.*?\+([0-9]+) Accuracy/,'4','4'],
 ['empoweredLimits','unit','core:89:feature-line10',/any three.*?only once.*?even if they do not meet the prerequisites.*?must still follow other limitations/],
 ['versatileNoReroll','unit','core:89:feature-line28',/may NOT activate Versatile Teachings to reroll Abilities that require a roll to determine characteristics/],
 ['coreCheerRepetition','page','core:93',/for Cheered and Excited only one instance may be activated per trigger/],
 ['optionalCheer','page','sep:3',/Cheered for ([0-9]+) full round.*?Combat Stages cannot be lowered by foe's attacks, features, or abilities/,'1'],
 ['scryingAdvice','printed','f4a:core:187:guidance',/player should negotiate their PC's method for scrying and making auguries/],
];
export function referenceF4aSourceFacts(audit,cleanText){
 const unit=id=>cleanText(audit.sourceDefinitions.find(u=>u.id===id)?.rawDefinition??'');
 const printed=id=>cleanText(audit.printedDefinitions.find(u=>u.id===id)?.rawDefinition??'');
 const page=id=>cleanText(audit.parentContexts.find(p=>p.id===id)?.rawText??'');
 const native=id=>cleanText(audit.nativeContexts.find(p=>p.pageId===id)?.rawText??'');
 const get={unit,printed,page,native},root=id=>audit.rootCurrentSystems?.['references.'+id];
 const tags=text=>[...text.matchAll(/([A-Za-z0-9-]+):\s*\[([^\]]+)\]/g)].map(m=>[m[1],m[2]]);
 return {observations:Object.fromEntries(referenceF4aSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),
  patronSourceTags:tags(printed('f4a:blessed:57:patron-table')),patronCurrentTags:tags(root('2AKdfZrCt7GWdmEM')?.effect??''),
  currentObservations:{allRootRulesEmpty:Object.values(audit.rootCurrentSystems).every(s=>Array.isArray(s.rules)&&s.rules.length===0),
   allRootSystemsExactlyDescriptive:Object.values(audit.rootCurrentSystems).every(s=>Object.keys(s).join(',')==='origin,effect,snippet,rules,enabled,slug,schema,referenceEffect,source,stackSlugs,keywords'),
   stackedPlaceholder:root('4DhwT9UVfGPG9jRm')?.effect,mirageRapid:/as a Rapid Action each round/.test(root('4NJ7VF3M7l20hauk')?.effect??''),timeStopRapid:/Rapid Action, Interrupt/.test(root('CV3xcO2tJ4Z15zOO')?.effect??''),
   artificerStandard:/as a Standard Action/.test(root('F7UZkUBE4OI65VPC')?.effect??''),traceurName:audit.targetSnapshots.find(s=>s.identity==='references.F25XxtvGukb1ZHib')?.document?.name??audit.rootLabels?.['references.F25XxtvGukb1ZHib'],
   traceurCity:/The city is your jungle/.test(root('F25XxtvGukb1ZHib')?.effect??''),currentEncouraged:/Encouraged/.test(root('C091rSmSR8nnU0qG')?.effect??''),coreEncouraged:/Encouraged/.test(page('core:93')),
   rawGuidancePlaceholderRetained:(root('EdpJWbICgnwGWUBk')?.effect??'').includes('<insert name here>')},
  sourceScope:{fullCurrentGenerationEstablished:false,independentWholeCRFrameworkEstablished:false,sourceAbsenceClaim:false,missingFriendshipSpiritArtifactReplacedByBlessing:false},
  nativeUse:{pageId:'H8YHTff4MxyPydws',kantoian:/The Gifts - Kantoian/.test(native('H8YHTff4MxyPydws')),galarianTodo:/The Gifts- Galarian TODO/.test(native('H8YHTff4MxyPydws')),independentSourceAuthority:false},
  unresolvedExecution:{reproducedGameplayFailure:false,descriptiveReferenceImpliesExecutableEffects:false,actualUseAcquisitionPreservation:'not-run'}};
}
export function referenceF4aFactErrors(f){
 const errors=[];for(const[key,kind,id,re,...values]of referenceF4aSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source role/condition/quantity');}
 if(f.patronSourceTags.length!==48||JSON.stringify(f.patronSourceTags)!==JSON.stringify(f.patronCurrentTags))errors.push('complete48-entry patron table/choices');
 const c=f.currentObservations;if(c.allRootRulesEmpty!==true||c.allRootSystemsExactlyDescriptive!==true||c.stackedPlaceholder!=='Should list proper table'||c.mirageRapid!==true||c.timeStopRapid!==true||c.artificerStandard!==true||!c.traceurName?.includes('Mountain')||c.traceurCity!==true||c.currentEncouraged!==true||c.coreEncouraged!==false||c.rawGuidancePlaceholderRetained!==true)errors.push('literal current reference shape/placeholder/action/title/body');
 if(Object.values(f.sourceScope).some(Boolean))errors.push('source/current identity or missing authoring promoted');
 if(f.nativeUse.pageId!=='H8YHTff4MxyPydws'||!f.nativeUse.kantoian||!f.nativeUse.galarianTodo||f.nativeUse.independentSourceAuthority!==false)errors.push('exact native page and Kantoian/Galarian boundary');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.descriptiveReferenceImpliesExecutableEffects!==false||f.unresolvedExecution.actualUseAcquisitionPreservation!=='not-run')errors.push('descriptive reference promoted to behavior');
 return errors;
}
export function referenceF4aFindings(identity,facts){return {role:'Complete source clauses and current descriptive fields are scoped by exact per-reference source links; no canonical, executable, whole-version or generation approval.',sourceScope:facts.sourceScope,actualUse:'not-run',fullCurrentVersionEstablished:false};}
export function referenceF4aSemanticRequirements(){return {
 '4DhwT9UVfGPG9jRm':[/CURRENT TEXT IS ONLY Should list proper table/,/FULL TABLE IS AVAILABLE/,/NOT MISSING SOURCE/],
 '30aUKUbmKNxTUmxo':[/DAMAGING MOVES/,/PRIORITY ADVANCED only BELOW HALF MAXHP/],
 'BpoTXHjWLIythNSY':[/STATUS MOVES BOX/,/ONE FOE ONLY TO1TARGET/],
 'AnN4DFNwIcgO2eMF':[/STEALTH CAPABILITY/,/EXPLICITLY SAYS THEY WORK EVERYWHERE/],
 'F25XxtvGukb1ZHib':[/TRACEUR-MOUNTAIN.*TRACEUR-URBAN/,/SUREFOOTED/,/WORK EVERYWHERE/],
 'F7UZkUBE4OI65VPC':[/CURRENT STANDARD versus SOURCE EXTENDED ACTION/,/RainbowLight itself has separate2AP\/Standard/],
 '2AKdfZrCt7GWdmEM':[/48-ENTRY TABLE/,/PATRON STAT/,/REGISTEEL\[\+1 DEFENSE OR SPDEF\]/],
 'EfxmNFWRAWQ8aHQM':[/30HP OR TWO INJURIES/,/50HP AND ONE INJURY/,/Generic Signer46 separately prints SWIFT/,/not the missing Friendship-and-Spirit framework artifact/],
 '4NJ7VF3M7l20hauk':[/CURRENT RAPID versus HISTORICAL\/SOURCE SWIFT/,/DAILY\/25/],
 'CV3xcO2tJ4Z15zOO':[/ALL FOUR actual same-ID histories/,/DAILY\/SWIFT INTERRUPT/,/Current text instead says RAPID/],
 'ANxnNCMeQeg4VeVs':[/FIVE current options/,/DB6 TO11 IF SHIFTED/,/TWO SWIFT clauses/,/TWO TRAINED STATS/],
 'C091rSmSR8nnU0qG':[/MULTIPLE INSTANCES but ONE CHEERED\/EXCITED PER TRIGGER/,/adds ENCOURAGED/,/Neither automatically authors.*CR mixture/],
 'Ca12l8J5X2kFNBu9':[/ALL SEVEN.*INCLUDING WIRED COMPATIBILITY CORE/,/repeatable DIFFERENT/,/maxTWICE/,/UP TO2 MOVES\/1ABILITY/,/bot loses OTHER moves/],
 '0oCW9CsYNjRA6WXn':[/ALL SIX/,/ONCE EVER PER POKEMON/,/D100 ROLL-20.*D20 sign-flip\/divide5/],
 'EzXC7KqeTh77E5ef':[/CRAFT2000/,/PURCHASE prices are Cannon5000/,/different roles, not a contradiction/],
 '5usmWZI8clt5xfSl':[/CRAFT\/INSTALL1000.*1500/,/PURCHASE prices2000\/3000/],
 '5lf7wYfKlpSPRG7h':[/CRAFT\/INSTALL costs2000.*4000/,/PURCHASE4000\/8000/,/capacity example inconsistency remains unadjudicated/],
 '4KmQa7w3ViBr7PTg':[/IF THE ATTACK HITS/,/ONE TICK HP/,/CANNOT BE PREVENTED/],
 'E96dE1iaMcGOJMP3':[/ARCANE WEAPON MOVE WITH AN EFFECT RANGE/,/NATURAL EVEN ROLLS IN ADDITION/],
 'CokfL7bfL1fVLtDK':[/ANY THREE/,/ONCE PER POKEMON/,/WAIVES PREREQUISITES BUT RETAINS OTHER LIMITS/],
 'Eb8Is7NXwMDjAhpI':[/BASIC ABILITY TO BASIC, ADVANCED TO BASIC OR ADVANCED/,/CANNOT REROLL CHARACTERISTICS/],
 '68CWgAlVuv2FSbi3':[/ORIGINAL BIRDS\/BEASTS/,/KANTOIAN/,/GALARIAN TODO authors no counterpart/],
 '8y5qkjIICUuwYaO8':[/WITHIN10METERS/,/GALARIAN TODO does not expand/],
 'EdpJWbICgnwGWUBk':[/COMPLETE GM\/PLAYER GUIDANCE/,/TOP HEADING is extracted AFTER the body/,/not a new activated Feature/],
 '58StsWrZZaFogxWj':[/3TP PLUS ANY NORMAL TUTOR COST/,/ONLY ONCE/],
 '95Z0ep7uSZb4GYce':[/chooses ONE/,/COMBAT STAGE-1, OR NEXT SAVE ROLL-3/],
 '6OR2Bt76V2jmS9qG':[/AS-IF1HP/,/not actually healing/,/THREE OF SIX EXPERT/],
 'Au0ZNfWlMPtdYEJC':[/EVASION4 THROUGH END OF USERS NEXT TURN/,/liked Sweet adds ACCURACY4/,/disliked Sweet ENRAGES/],
};}

const sourceLinks={"0EVKSbyPCs2XLT8d":["blessed:68:feature-line25"],"0GmFYjOJd3oC6GMj":["blessed:63:feature-line56"],"0I0O9vQIC5oxdItt":["core:142:feature-line66","core:142:feature-line4"],"0WbKLToKgxtNih26":["blessed:50:feature-line3"],"0Zug43kvkPCg267e":["blessed:65:feature-line28"],"0aAWHINRDMaI4mYf":["throhs:54:feature-line3","throhs:54:feature-line19","throhs:54:feature-line33"],"0hcqpVvVLjMh7Fg6":["blessed:65:feature-line47"],"0mQPu5ju3Sn4JgHu":["blessed:60:feature-line15"],"0oCW9CsYNjRA6WXn":["porygon:82:feature-line3"],"1FjnzbvNV3P9kCXs":["porygon:82:feature-line3"],"1HcWXGMNeK0JBMW7":["blessed:60:feature-line53"],"1laFy6Yxiio9xqsq":["blessed:59:feature-line9","blessed:64:feature-line25"],"263d64y5esphacQA":["blessed:64:feature-line25","blessed:59:feature-line9"],"2smn6K5kdoqH0RmG":["porygon:80:feature-line45","porygon:80:feature-line3"],"30aUKUbmKNxTUmxo":["core:75:feature-line47"],"39uTqNnHJeWfFI69":["blessed:70:feature-line28"],"3wV9FHoz5oNFESrU":["blessed:61:feature-line22"],"4DhwT9UVfGPG9jRm":["core:108:feature-line18"],"4KmQa7w3ViBr7PTg":["throhs:54:feature-line3","throhs:54:feature-line19","throhs:54:feature-line33"],"4LWpeDJCTZX6uJeH":["blessed:64:feature-line61"],"4NJ7VF3M7l20hauk":["blessed:62:feature-line18"],"4gIHTyFLF0rIFjQg":["blessed:64:feature-line56"],"4q0vV4bzEGqvN4aO":["blessed:68:feature-line74"],"4ukTC5QQPr7Z5s2n":["blessed:68:feature-line42"],"4zgNsnxQRGQgNjuq":["core:137:feature-line3","core:138:feature-line8"],"58StsWrZZaFogxWj":["blessed:62:feature-line29"],"5cU67R3nYXgytMQb":["blessed:68:feature-line62"],"5lf7wYfKlpSPRG7h":["porygon:84:feature-line75","porygon:84:feature-line3"],"5pwIdUM1B6m55V7s":["blessed:62:feature-line66"],"5usmWZI8clt5xfSl":["porygon:84:feature-line57","porygon:84:feature-line3"],"5yL0MnHExZwKfHAD":["blessed:59:feature-line49"],"68CWgAlVuv2FSbi3":["blessed:58:feature-line44"],"6CuKXY9dE78znEpa":["blessed:64:feature-line45"],"6OR2Bt76V2jmS9qG":["core:79:feature-line41"],"70hPJ5Om1my5Zgw5":["blessed:65:feature-line37"],"7CaMXneTmpDyK93G":["core:141:feature-line4","core:141:feature-line27"],"7KGtHlnDiDivamG4":["blessed:70:feature-line59"],"7O0Wb2WhD7dwEZJb":["core:134:feature-line3"],"7bkEEvSMDmf1DgBM":["blessed:64:feature-line8"],"7ffELAYrTKJ9rwRH":["core:132:feature-line82","core:131:feature-line3"],"7pV8b1dx9cZYnjM5":["blessed:59:feature-line4"],"801KpYUKq4Bjbw3r":["core:162:feature-line44","core:161:feature-line3"],"8BO9jDSpbj0XPhJ3":["blessed:62:feature-line40"],"8y5qkjIICUuwYaO8":["blessed:58:feature-line37"],"932Iq7blbnwvyKKt":["blessed:69:feature-line25"],"98MnkOJAGDuSYv7C":["core:132:feature-line45","core:131:feature-line3"],"9O7RgqcH4iPJcMss":["blessed:65:feature-line72"],"9R0mHGvn0DEH51lN":["blessed:64:feature-line39"],"9TkuCHcYCblIvlfK":["blessed:69:feature-line56"],"9gJfVFyn5y85yaHt":["blessed:60:feature-line73","blessed:59:feature-line12"],"9sntH6clVtucK1Xf":["blessed:59:feature-line28"],"9uO7cUPC2yfRo31m":["blessed:67:feature-line20"],"A5ef6sgJt2xJ2Vpj":["throhs:54:feature-line11","throhs:54:feature-line19"],"ABYIBAJzRRuKvMFZ":["blessed:66:feature-line36"],"ADALNbQLjpyt5R17":["porygon:80:feature-line33","porygon:80:feature-line3"],"AMTgY3B9SWYEffNK":["blessed:67:feature-line36"],"ANxnNCMeQeg4VeVs":["core:155:feature-line3"],"AnN4DFNwIcgO2eMF":["core:149:feature-line3","core:150:feature-line25"],"AqaQrYsn3T16VfkQ":["blessed:67:feature-line32"],"Au0ZNfWlMPtdYEJC":["core:132:feature-line3","core:131:feature-line3"],"BCyC6uQgGw9rQ084":["blessed:67:feature-line67"],"BE9DjlHP8EPXIqpI":["blessed:60:feature-line20"],"BpoTXHjWLIythNSY":["core:75:feature-line47"],"BwwvbeWZVO6QrUYc":["blessed:63:feature-line17"],"C091rSmSR8nnU0qG":["core:93:feature-line3","sep:3:feature-line3"],"CV3xcO2tJ4Z15zOO":["blessed:64:feature-line29"],"Ca12l8J5X2kFNBu9":["porygon:80:feature-line3"],"CnTJueNKQInpi6j8":["blessed:60:feature-line62"],"CokfL7bfL1fVLtDK":["core:89:feature-line10","core:88:feature-line3"],"DDTb61chXebgXGZx":["blessed:71:feature-line3"],"E1d6kFotVQrcluMq":["blessed:61:feature-line62"],"E96dE1iaMcGOJMP3":["throhs:54:feature-line3","throhs:54:feature-line19"],"EARImKFq6Uz6Bcgj":["blessed:63:feature-line4"],"Eb8Is7NXwMDjAhpI":["core:89:feature-line28","core:88:feature-line3"],"EdpJWbICgnwGWUBk":["core:186:feature-line3"],"EfxmNFWRAWQ8aHQM":["blessed:46:feature-line10","blessed:48:feature-line3"],"ElvRH3Y0xyENwb2G":["blessed:65:feature-line13"],"EzXC7KqeTh77E5ef":["may:5:feature-line45"],"F25XxtvGukb1ZHib":["core:149:feature-line3","core:150:feature-line25"],"F7UZkUBE4OI65VPC":["core:142:feature-line4","core:142:feature-line66"]};

const printedLinks={"0WbKLToKgxtNih26":["f4a:blessed:50:mark"],"0aAWHINRDMaI4mYf":["f4a:throhs:55:directed"],"0oCW9CsYNjRA6WXn":["f4a:porygon:83:modifications"],"1FjnzbvNV3P9kCXs":["f4a:porygon:83:habitat"],"1nSAyORW0n5iDqgP":["f4a:may:6:mechanical-scrap"],"2AKdfZrCt7GWdmEM":["f4a:blessed:57:patron-table"],"2jtYaNUyIVOVdFMu":["f4a:core:213:baby-template"],"2smn6K5kdoqH0RmG":["f4a:porygon:81:parts"],"30aUKUbmKNxTUmxo":["f4a:core:76:bloodied"],"4KmQa7w3ViBr7PTg":["f4a:throhs:55:overdrive"],"4zgNsnxQRGQgNjuq":["f4a:core:138:slick"],"95Z0ep7uSZb4GYce":["f4a:core:79:devitalizing"],"A5ef6sgJt2xJ2Vpj":["f4a:throhs:55:enlarged"],"ADALNbQLjpyt5R17":["f4a:porygon:81:parts"],"AnN4DFNwIcgO2eMF":["f4a:core:151:forest"],"Au0ZNfWlMPtdYEJC":["f4a:core:132:sweet"],"BpoTXHjWLIythNSY":["f4a:core:76:double-curse"],"Ca12l8J5X2kFNBu9":["f4a:porygon:81:parts"],"E96dE1iaMcGOJMP3":["f4a:throhs:55:energy-finesse"],"EdpJWbICgnwGWUBk":["f4a:core:187:guidance"],"EfxmNFWRAWQ8aHQM":["f4a:blessed:55:mending"],"EzXC7KqeTh77E5ef":["f4a:may:6:recipes"],"F25XxtvGukb1ZHib":["f4a:core:151:traceur"],"F7UZkUBE4OI65VPC":["f4a:core:142:recipes"]};

const nativeLinks={"68CWgAlVuv2FSbi3":["H8YHTff4MxyPydws"],"8y5qkjIICUuwYaO8":["H8YHTff4MxyPydws"]};

export function checkReferenceF4aSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F4a');
    const audit = bundle.referenceSlices?.find(a => a.slice === 'F4a');
    if (!audit) { fail(!slice.recordFile, 'F4a completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F4a record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F4a' && audit.recordKind === 'reference' && file.recordKind === 'reference' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F4a frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F4a independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.referenceReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F4a exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 84 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 89 && audit.printedDefinitions.length === 22
        && audit.parentContexts.length === 75 && audit.nativeContexts.length === 1, 'F4a bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F4a full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F4a complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F4a full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F4a exact native page/authority changed: ' + n.pageId);
    }
    const facts = referenceF4aSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && referenceF4aFactErrors(facts).length === 0, 'F4a independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + referenceF4aFactErrors(facts).join('; '));
    const proseRequirements = referenceF4aSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.independentWholeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentSpiritFrameworkEstablished === false && audit.authoringLimits.descriptiveReferencesImplementEffects === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F4a missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F4a'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 180 && snapshots.size === audit.targetSnapshots.length, 'F4a exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, referencePageOccurrences(a?.data)), 'F4a exact current target/prior chronology changed: ' + s.identity);
    }

    fail(audit.independentUseContextSnapshots.length === 1, 'F4a complete incoming-use page census changed');
    for(const c of audit.independentUseContextSnapshots){
        const source=actualMap.get(c.sourceIdentity)?.data;
        const actual=c.contextPath.slice(2).replaceAll('[','.').replaceAll(']','').split('.').reduce((v,k)=>v?.[k],source);
        fail(c.sourceIdentity==='journals.cP772AChmDjr486z' && c.contextPath==='$.pages[113]' && actual?._id==='H8YHTff4MxyPydws'
            && equal(c.contextDocument,actual) && hash(actual)===c.contextJsonSha256
            && equal(c.references,referenceUuidOccurrences(actual,c.contextPath))
            && c.references.every(r=>snapshots.has(r.targetIdentity)), 'F4a actual complete incoming page/path/UUID scope changed');
    }
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F4a full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F4a literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of referenceUuidOccurrences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => referencePageOccurrences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F4a literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F4a exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.effectSlices.find(a => a.slice === 'F3h').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F4a independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F4a full root-system inventory changed');
    fail(equal(audit.rootLabels, Object.fromEntries(slice.members.map(([id]) => [id, actualMap.get(id)?.data.name]))), 'F4a literal root-label inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F4a per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.referenceReview;
        fail(r && e && d && doc?.type === 'reference' && r.contentHash === contentHash && e.contentHash === contentHash, 'F4a exact reference examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialTextualCorrespondence ? 'examined-reference-source-correspondence' : 'examined-reference-version-or-authority-limit')
            && (d.partialTextualCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, referenceF4aFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata, optional playtest and explicitly labelled errata remain separate'
            && r.coverageState === (d.partialTextualCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F4a source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F4a independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((printedLinks[shortId]??[]).every(id=>d.printedDefinitionIds.includes(id)&&audit.printedDefinitions.some(u=>u.id===id&&d.parentContextIds.includes(u.parentContextId))), 'F4a complete printed leaf/table/guidance trace changed: '+identity);
        fail(d.referenceType==='reference'&&d.interpretationKind==='descriptive-source-examination; no effect semantics manufactured'&&doc.system.rules.length===0&&doc.effects.length===0&&d.prerequisitePolicy.includes('non-blocking'), 'F4a descriptive reference/type/advisory contract changed: '+identity);
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F4a per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length || d.printedDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F4a unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F4a complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F4a actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, referenceF4aRuleRoles(doc)) && equal(e.literalReferences, referenceLiterals(doc))
            && equal(e.pageReferences, referencePageOccurrences(doc)), 'F4a complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F4a exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F4a exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) { const use=audit.independentUseContextSnapshots.find(c=>c.sourceIdentity===ref.sourceIdentity&&ref.path.startsWith(c.contextPath)); fail(use && use.references.some(r=>r.path===ref.path&&r.literalUuid===ref.literalUuid&&r.targetIdentity===identity)&&use.references.every(r=>snapshots.has(r.targetIdentity)), 'F4a page-scoped incoming use outgoing target omitted: ' + identity); }
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F4a complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'references');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F4a historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F4a finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 77, unresolved: 7}) && equal(counts, closure.counts), 'F4a bounded correspondence/limit counts changed');
}
