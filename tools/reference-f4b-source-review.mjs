// Offline descriptive-reference source review; never a runtime effect policy.
import {effectReferences as referenceUuidOccurrences,effectLiteralReferences as referenceLiterals} from './effect-source-review.mjs';
import {effectPageReferences as referencePageOccurrences} from './effect-slice-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='385e22931f75e2469329a2367d8a9287226d2c30068e709f2876c69bb8ba666d';
const SOURCE_PRIMITIVES='ece525950e09f63f3e37876e8727b808716d8b73be93abaa6def5b5a49a53aa8',EXAMINED_DISPOSITIONS='4700a9567d702cb043b703bfc5865257856c5553eca0d88d201c1c35ad18166f',HISTORICAL_OBSERVATIONS='cec794e322cb75bd843b0cf49e49c282db8fe4fca5d73a6337feb81552255813';
export const referenceF4bRuleRoles=doc=>(doc?.system?.rules??[]).map((object,i)=>({path:`$.system.rules[${i}]`,object,interpretation:'Stored object only; no effect semantics inferred for a descriptive reference.'}));
export const referenceF4bTypeSkills=[['Bug','Command','Survival'],['Dark','Guile','Stealth'],['Dragon','Command','Intimidate'],['Electric','Focus','Technology Education'],['Fairy','Charm','Guile'],['Fighting','Combat','Intuition'],['Fire','Focus','Intimidate'],['Flying','Acrobatics','Perception'],['Ghost','Intimidate','Occult Education'],['Grass','Survival','General Education'],['Ground','Perception','Intuition'],['Ice','Athletics','Survival'],['Normal','Charm','Intuition'],['Poison','Intimidate','Stealth'],['Psychic','Focus','Occult Education'],['Rock','Combat','Survival'],['Steel','Athletics','Intimidate'],['Water','Athletics','Intuition']];
const LOOK_TABLE_COLUMNS={"scene":[["Ace Trainer","Critical Moment","Commander's Voice"],["Capture Specialist","Capture Techniques (False Strike and Catch Combo only)","Poke Ball Crafter"],["Enduring Soul","Staying Power","Medic Training"],["Trickster","Sleight","Command Versatility"],["Researcher","Chemical Warfare","Repel Crafter"],["Roughneck","Mettle","Defender"]],"actionPoint":[["Coordinator","Nuanced Performance","Grace"],["Juggler","Round Trip","Quick Switch"],["Chef","Hits the Spot","Basic Cooking"],["Fashionista","Style is Eternal","Groomer"],["Athlete","Coaching","Swimmer"],["Tumbler","Quick Gymnastics","Acrobat"]]};
const LOOK_TABLE_IMAGE="59d619969426ae5dadefa0f00c3f92ec5505a5272d98026335a5d8ccb3f44967";
export const referenceF4bSourceSpecifications=[
 ['typeChoices','page','core:119',/each Type requiring one of two Type-Linked Skills/],
 ['typeRepeat','page','core:119',/take Type Ace multiple times.*?different Type.*?Skill prerequisites for Type Ace always match the Type-Linked Skills/],
 ['typeTwoPrerequisites','unit','core:119:feature-line3',/Prerequisites: ([0-9]+) Different Pokemon.*?Prerequisites: Elemental Connection.*?([0-9]+) Pokemon/,'2','1'],
 ['lookUses','unit','core:86:feature-line49',/x([0-9]+) Uses - Extended Action.*?do not need to meet their normal prerequisites.*?must meet their Prerequisites listed here.*?once.*?Scene Features.*?once.*?Action Point Features/,'2'],
 ['lookSceneAce','unit','core:86:feature-line49',/Ace Trainer Critical Moment Commander's Voice/],
 ['lookSceneCapture','unit','core:86:feature-line49',/Capture Specialist Capture Techniques \(False Strike and Catch Combo only\) Poke Ball Crafter/],
 ['lookSceneEnduring','unit','core:86:feature-line49',/Enduring Soul Staying Power Medic Training/],
 ['lookSceneTrickster','unit','core:86:feature-line49',/Trickster Sleight Command Versatility/],
 ['lookSceneResearcher','unit','core:86:feature-line49',/Researcher Chemical Warfare Repel Crafter/],
 ['lookSceneRoughneck','unit','core:86:feature-line49',/Roughneck Mettle Defender/],
 ['lookApCoordinator','unit','core:86:feature-line49',/Coordinator Nuanced Performance Grace/],
 ['lookApJuggler','unit','core:86:feature-line49',/Juggler Round Trip Quick Switch/],
 ['lookApChef','unit','core:86:feature-line49',/Chef Hits the Spot Basic Cooking/],
 ['lookApFashion','unit','core:86:feature-line49',/Fashionista Style is Eternal Groomer/],
 ['lookApAthlete','unit','core:86:feature-line49',/Athlete Coaching Swimmer/],
 ['lookApTumbler','unit','core:86:feature-line49',/Tumbler Quick Gymnastics Acrobat/],
 ['signatureCost','unit','core:75:feature-line47',/loses ([0-9]+) Tutor Points.*?one Signature Technique at a time.*?([0-9]+) Tutor Point is refunded/,'2','1'],
 ['shockCategory','page','core:76',/Cone, Line, Burst, and Blast Moves.*?Shock and Awe.*?-([0-9]+) penalty to Save Checks and a -([0-9]+) Penalty to Evasion.*?end of the user's next turn.*?whether the attack hits or misses/,'2','1'],
 ['guardRecipient','page','core:76',/Single Target Moves.*?Guarding Strike.*?If this Move hits.*?\+([0-9]+) Damage Reduction against the target of the attack until the end of their next turn/,'5'],
 ['reliableMiss','printed','f4b:reliable',/If the Move misses its target, its Frequency is not spent.*?immediately make a Struggle Attack as a Free Action.*?Cannot be applied to Moves with the Smite keyword/],
 ['solePrice','printed','f4b:sole',/Feet Equipment worth at least \$([0-9]+).*?while Shifting.*?still trigger any Hazards.*?start or end of your turn.*?Reactive Hazards.*?cannot be triggered/,'1000'],
 ['wayfarerScope','printed','f4b:wayfarer',/Survival Skill.*?defending against Disarm, Grapple, Push, and Trip.*?When wielding a Weapon.*?Damage Base.*?qualify for a Weapon's Moves/],
 ['warpAlternatives','printed','f4b:warp',/Cone, Line, Burst, or Blast.*?Instead of its usual range.*?Burst ([0-9]+), Cone ([0-9]+), Close Blast ([0-9]+), Line ([0-9]+), or ([0-9]+)-Target with a range of ([0-9]+)/,'1','2','2','4','2','4'],
 ['berserkUnit','printed','f4b:berserk',/([0-9]+)-Target.*?Vulnerable for ([0-9]+) full round.*?Critical Hit Range.*?\+([0-9]+)/,'1','1','3'],
 ['shellChoice','printed','f4b:shell',/Scene x([0-9]+).*?Free Action or otherwise as a Standard Action.*?one type of Hazard.*?all allied instances.*?half your Guile Rank.*?do not have to remain contiguous.*?layers of Toxic Spikes/,'2'],
 ['snareSign','printed','f4b:snare',/subtract (-[0-9]+) from Capture Rolls.*?drawn into an encounter by Bait.*?currently distracted by Bait.*?Stuck because of a Glue Cannon/,'-10'],
 ['wrestleAction','unit','core:162:feature-line22',/([0-9]+) AP - Swift Action.*?begin your turn with Dominance.*?two different Grappling Effects as a Full Action/,'1'],
 ['paragonRoles','printed','f4b:paragon',/Messiah: Static Signer: Swift Action.*?Body, Mind or Spirit.*?\+([0-9]+).*?Signer Effect:.*?\+([0-9]+).*?end of the Scene.*?different Skill Group each time/,'2','1'],
 ['fossilOriginal','printed','f4b:fossils',/create an Egg from a viable Fossil.*?hatched at Level ([0-9]+).*?Gender, Nature, Abilities, Moves and such determined by the GM/,'10'],
 ['fossilFind','printed','f4b:fossils',/Adept Pokemon Education or Survival or the Paleontologist Edge.*?Easy \(DC ([0-9]+)\).*?Moderate \(DC ([0-9]+)\).*?Hard \(DC ([0-9]+)\).*?not always possible to find Fossils/,'15','18','25'],
 ['wonderCraft','printed','f4b:wonder',/At-Will - Extended Action.*?create a Wonder Launcher for \$([0-9]+)/,'5000'],
 ['wonderPurchase','page','core:295',/Expert-Level Medicine or Technology.*?([0-9]+) AP.*?within ([0-9]+) meters.*?do not cause the target to forfeit any actions.*?cost \$([0-9,]+) or more/,'1','8','10,000'],
 ['limbCraft','unit','porygon:84:feature-line63',/Synthetic Muscle Augmentation for \$([0-9]+).*?Embedded Weaponry Augmentation for \$([0-9]+)/,'1000','2000'],
 ['limbPurchase','page','porygon:57',/Synthetic Muscle Slot: Limbs Cost: \$([0-9]+) Capacity Used: ([0-9]+).*?Embedded Weaponry Slot: Limbs Cost: \$([0-9]+) Capacity Used: ([0-9]+)/,'2000','2','4000','3'],
 ['roboticsSizes','unit','porygon:80:feature-line33',/Small Pokebot for \$([0-9]+).*?Medium Pokebot for \$([0-9]+).*?Large Pokebot for \$([0-9]+).*?begin at Level ([0-9]+)/,'1000','2000','3000','5'],
 ['wiredAvailable','page','porygon:81',/Wired Compatibility Core.*?choose up to two.*?Moves and one of its Abilities.*?loses access to its other Moves.*?Appliance Form/],
 ['kitbashLiteral','unit','porygon:80:feature-line45',/Prerequisites: Overclocked.*?Sympathetic Drives and Repair Nanites/],
 ['confusionOptional','printed','f4b:feb-confusion',/cannot take Attacks of Opportunity.*?even attacks without rolls.*?([0-9]+)d([0-9]+).*?On ([0-9]+), after the attack is resolved.*?half their Attack.*?half or their Special Attack.*?two Ticks.*?Status Move.*?Save of ([0-9]+)\+.*?end of turn/,'1','2','1','16'],
 ['confusionOriginal','printed','f4b:core-confusion',/beginning of their turn.*?([0-9]+)-([0-9]+).*?Typeless Physical Struggle Attack as a Standard Action.*?no other actions.*?resisted ([0-9]+) Step.*?([0-9]+)-([0-9]+).*?([0-9]+) or higher/,'1','8','1','9','15','16'],
 ['momentumReset','printed','f4b:momentum',/begins each Scene with ([0-9]+) Momentum.*?end of each Combat round.*?\+([0-9]+).*?hits a Tagged foe.*?\+([0-9]+).*?maximum of ([0-9]+).*?lost when.*?Faints.*?recalled.*?combat ends/,'0','1','1','6'],
 ['learningLimit','printed','f4b:ball-modifications',/Learning Modification.*?within ([0-9]+) levels.*?Learning, Fabulous and Power Modification work once on a Pokemon. Ever/,'8'],
 ['powerUnit','printed','f4b:ball-modifications',/Power Modification.*?retains the conditional capture modifier.*?raised ([0-9]+)d([0-9]+) levels upon capture/,'1','4'],
 ['weatherReplace','printed','f4b:ball-modifications',/Weather Modification.*?Instead of when in low light.*?subtracts ([0-9]+) from its Capture Rolls.*?corresponding weather/,'20'],
 ['d100Original','page','core:214',/Roll ([0-9]+)d([0-9]+), and subtract the Trainer's Level/,'1','100'],
 ['d20Optional','page','sep:8',/now a ([0-9]+)d([0-9]+) roll where you aim to meet or exceed/,'1','20'],
 ['conversion','page','sep:8',/Flip the sign on all modifiers, then divide by ([0-9]+).*?Snare gives a \+([0-9]+) bonus/,'5','2'],
 ['terrainEverywhere','unit','core:150:feature-line25',/two Terrain Talents.*?Naturewalk.*?do not have to be in the corresponding terrain.*?They work everywhere/],
 ['caveDistinction','printed','f4b:cave',/do not suffer Blindness.*?Low-Light.*?Totally Blinded.*?instead suffer the penalties of Blindness.*?Survival Checks instead of Acrobatics.*?immune to Stealth Rock/],
 ['basicFive','unit','core:138:feature-line8',/\$([0-9]+).*?chosen Fashionista Skill.*?Accessory Slot.*?Held Items by Pokemon.*?Adorable Fashion.*?Elegant Fashion.*?Rad Fashion.*?Rough Fashion.*?Slick Fashion/,'500'],
 ['heartyLimits','unit','core:132:feature-line54',/up to five Hearty Meals.*?Trainers as an Extended Action.*?\+([0-9]+) to their Max AP.*?next extended rest.*?one Hearty Meal.*?([0-9]+) minutes/,'2','20'],
 ['spicyRole','unit','core:132:feature-line3',/Spicy Wrap Effect:.*?Physical attack.*?\+([0-9]+) additional Damage.*?Spicy Food.*?\+([0-9]+).*?dislikes Spicy Food.*?Enraged/,'5','10'],
 ['soulMessiah','unit','blessed:55:feature-line66',/One Time Use\/([0-9]+).*?Trainer or Pokemon dies.*?set to ([0-9]+) Injuries.*?half the normal rate.*?([0-9]+) HP/,'10','5','1'],
 ['soulSigner','unit','blessed:55:feature-line66',/Signer: Interrupt.*?Signer Trigger:.*?below ([0-9]+) HP.*?If being Knocked Out alone would set them to ([0-9]+) injuries.*?set to ([0-9]+)/,'0','10','9'],
 ['colossusSequence','unit','blessed:66:feature-line3',/([0-9]+) AP - Standard Action.*?next three rounds.*?Attack and Speed halved.*?end of the third round.*?Attack and Speed by two Combat Stages/,'2'],
 ['loyaltyTemporary','unit','blessed:59:feature-line22',/([0-9]+) AP - Free Action.*?Your Pokemon.*?as if it were one Loyalty higher for the rest of this turn/,'1'],
 ['craftReduction','unit','blessed:66:feature-line11',/pay ([0-9]+)% less when crafting/,'20'],
 ['deadZoneUnit','unit','blessed:70:feature-line79',/Daily\/([0-9]+).*?next ten minutes.*?wireless communication within ten meters/,'15'],
];
export function referenceF4bSourceFacts(audit,cleanText){
 const get={unit:id=>cleanText(audit.sourceDefinitions.find(u=>u.id===id)?.rawDefinition??''),printed:id=>cleanText(audit.printedDefinitions.find(u=>u.id===id)?.rawDefinition??''),page:id=>cleanText(audit.parentContexts.find(u=>u.id===id)?.rawText??'')};
 const typeText=get.printed('f4b:type-skills'),types=referenceF4bTypeSkills.map(([t])=>t).join('|'),typeSkills=[...typeText.matchAll(new RegExp('('+types+'):\\s*(.*?)\\s*(?=(?:'+types+'):|Note:|$)','g'))].map(m=>[m[1],...m[2].split(' or ')]);
 const root=id=>audit.rootCurrentSystems['references.'+id],native=cleanText(audit.nativeContexts[0]?.rawText??'');
 return {lookColumnAssignments:audit.printedDefinitions.find(u=>u.id==='f4b:look-table')?.visualColumnAssignments,lookTableImage:audit.printedDefinitions.find(u=>u.id==='f4b:look-table')?.fullPageVisualSha256,observations:Object.fromEntries(referenceF4bSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),typeSkills,
 currentObservations:{allRootRulesEmpty:Object.values(audit.rootCurrentSystems).every(s=>Array.isArray(s.rules)&&s.rules.length===0),allRootSystemsExactlyDescriptive:Object.values(audit.rootCurrentSystems).every(s=>Object.keys(s).join(',')==='origin,effect,snippet,rules,enabled,slug,schema,referenceEffect,source,stackSlugs,keywords'),typePlaceholder:root('FJFrGh3B3Ybd1vBL').effect,lookPlaceholder:root('OjFwyh29VOqXIJAM').effect,wrestleRapid:/1 AP.*?Rapid Action/.test(root('MFJzVmEBzI9vudGf').effect),paragonRapid:/Signer: Rapid Action/.test(root('O6BYap68R4OMCHbk').effect),fossilTrainer:/determined by the Trainer and approved by the GM/.test(root('Jck2a3f0rEoM8A7w').effect),fossilEgg:/create an Egg/.test(root('Jck2a3f0rEoM8A7w').effect),guidancePTR:/rules and mechanics of PTR/.test(root('QFXCg2H84HrGz8k9').effect),confusionAfter:/after the attack is resolved/.test(root('LgiszLN9BcIBZRc6').effect),confusionRawTypo:/half or their Special Attack/.test(root('LgiszLN9BcIBZRc6').effect)},
 sourceScope:{fullCurrentGenerationEstablished:false,independentWholeCRFrameworkEstablished:false,independentPTRGuidanceAuthoringEstablished:false,missingFriendshipSpiritArtifactReplacedByBlessing:false,sourceAbsenceClaim:false},
 nativeUse:{pageId:audit.nativeContexts[0]?.pageId,kantoian:/The Gifts - Kantoian/.test(native),galarianTodo:/The Gifts- Galarian TODO/.test(native),independentSourceAuthority:false},unresolvedExecution:{reproducedGameplayFailure:false,descriptiveReferenceImpliesExecutableEffects:false,actualUseAcquisitionPreservation:'not-run'}};
}
export function referenceF4bFactErrors(f){
 const errors=[];for(const[key,kind,id,re,...values]of referenceF4bSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source condition/quantity/role');}
 if(JSON.stringify(f.typeSkills)!==JSON.stringify(referenceF4bTypeSkills))errors.push('complete18-entry type-skill OR table');
 if(JSON.stringify(f.lookColumnAssignments)!==JSON.stringify(LOOK_TABLE_COLUMNS)||f.lookTableImage!==LOOK_TABLE_IMAGE)errors.push('source-backed six Scene/six AP table columns');
 const c=f.currentObservations;if(c.allRootRulesEmpty!==true||c.allRootSystemsExactlyDescriptive!==true||c.typePlaceholder!=='Create appropriate typing table'||c.lookPlaceholder!=='Shoud list the proper edges & features'||!c.wrestleRapid||!c.paragonRapid||!c.fossilTrainer||c.fossilEgg!==false||!c.guidancePTR||!c.confusionAfter||!c.confusionRawTypo)errors.push('literal current shape/placeholder/action/CR/optional text');
 if(Object.values(f.sourceScope).some(Boolean))errors.push('source/identity/scope/absent-authoring promoted');
 if(f.nativeUse.pageId!=='H8YHTff4MxyPydws'||!f.nativeUse.kantoian||!f.nativeUse.galarianTodo||f.nativeUse.independentSourceAuthority!==false)errors.push('native exact Kantoian/Galarian boundary');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.descriptiveReferenceImpliesExecutableEffects!==false||f.unresolvedExecution.actualUseAcquisitionPreservation!=='not-run')errors.push('descriptive review promoted to behavior');return errors;
}
export function referenceF4bFindings(identity,facts){return{role:'Complete source clauses and current descriptive fields retain exact per-reference source links; no canonical, executable, whole-version or generation approval.',sourceScope:facts.sourceScope,actualUse:'not-run',fullCurrentVersionEstablished:false};}
export function referenceF4bSemanticRequirements(){return{
 FJFrGh3B3Ybd1vBL:[/COMPLETE18-TYPE TABLE IS AVAILABLE/,/ONE OF TWO SKILLS/,/NOT MISSING SOURCE/],OjFwyh29VOqXIJAM:[/FULL TABLE IS AVAILABLE/,/ONE SCENE-LIST FEATURE AND ONE AP-LIST FEATURE/,/SIX SCENE AND SIX AP ROWS/,/NOT THE NEARBY DILETTANTE EDGE LIST/],
 MFJzVmEBzI9vudGf:[/ALL FOUR SAME-ID HISTORIES SAY SWIFT/,/CURRENT SAYS RAPID/,/TWO DIFFERENT GRAPPLING EFFECTS AS FULL ACTION/],O6BYap68R4OMCHbk:[/HISTORIES SAY SIGNER SWIFT/,/CURRENT SIGNER RAPID/,/GROUP SKILL CHECKS2/,/GROUP CHECKS1 UNTIL END OF SCENE/],
 Jck2a3f0rEoM8A7w:[/STANDARD CREATES AN EGG/,/GM-DETERMINED ATTRIBUTES/,/TRAINER-DETERMINED ATTRIBUTES SUBJECT TO GM APPROVAL/,/NO GUARANTEE EVEN AT HARD25/],QFXCg2H84HrGz8k9:[/PTR-LABELLED RECOMMENDATION/,/COMPLETE INDEPENDENT CURRENT PTR AUTHORING IS UNESTABLISHED/],
 HJ0OjCZYqnjlKES7:[/CONE\/LINE\/BURST\/BLAST/,/SAVE CHECK-2 and EVASION-1/,/END OF USERS NEXT TURN/,/WHETHER HIT OR MISS/],KRSXJ62Z8mqhB0rQ:[/SINGLE-TARGET/,/IF HIT, USER DR5 AGAINST THAT ATTACK TARGET/],HONb9dD2w0hBxo0i:[/SINGLE-TARGET ONLY/,/IF THE MOVE MISSES/,/IMMEDIATE FREE STRUGGLE/,/CANNOT APPLY TO SMITE/],
 HzWqaASxIm8cSh1R:[/FEET EQUIPMENT VALUE AT LEAST1000/,/START OR END OF TURN/,/REACTIVE HAZARDS SUCH AS STEALTH ROCK CANNOT TRIGGER/],QS8lWDRWgkcP0fYJ:[/DEFENDING OPPOSED DISARM\/GRAPPLE\/PUSH\/TRIP/,/STRUGGLE DAMAGE BASE AND WEAPON MOVE QUALIFICATION/],
 LgiszLN9BcIBZRc6:[/OPTIONAL FEB2016 PAGE2/,/ON1 AFTER ATTACK/,/ORIGINAL CORE247 instead STARTTURN SAVE/,/BOTH COMPLETE ALTERNATIVES/],LPP5JiIn6JvG2w7v:[/FREE WHEN PLACING HAZARDS, OTHERWISE STANDARD/,/ONE CHOSEN HAZARD TYPE HALF YOUR GUILE RANK/,/NONCONTIGUOUS/],
 TIcgJjb8dg4ncUVU:[/END OF COMBAT ROUND/,/ON HIT TAGGED FOE/,/MAXIMUM6/,/LOSES ALL ON FAINT\/RECALL\/COMBAT END/],Tg399r4Ole9IvrbJ:[/MESSIAH ONE TIME USE\/10 EXTENDED/,/SETS5INJURIES HEALING AT HALF NORMAL RATE AND1HP/,/SIGNER INTERRUPT triggers BELOW0HP/,/NOT A GENERAL INJURY CAP/,/NOT THE MISSING FRIENDSHIP\/SPIRIT FRAMEWORK ARTIFACT/],
 GNdI0Lk6XwOvClYw:[/CRAFT5000/,/PURCHASE10000OR MORE/,/COST\/USE ROLES/],PnlcuG8lLi9xMmM2:[/CRAFT\/INSTALL SYNTHETIC MUSCLE1000 AND EMBEDDED WEAPONRY2000/,/PURCHASE2000\/4000/,/DIFFERENT ROLES, NOT A CONTRADICTION/],GnOE5NC9blGZ77lt:[/FOUR COMPLETE ORIGINAL PORYGON80 RECIPES/,/LEVEL5/,/ALL SEVEN parts including WiredCore/,/OVERCLOCKED/],
 JWR86xMhMjgY5hN2:[/SUBTRACTS20 FROM CAPTURE ROLL/,/INSTEAD OF LOW LIGHT/,/D20 sign-flip\/divide5/],OEjj14lLJEwTYSQ4:[/NEXT LEVELUP MOVE ONLY IF WITHIN8LEVELS/,/ONCE EVER PER POKEMON/],UeeEBjhgY9AGgC9K:[/RETAINS ITS CONDITIONAL CAPTURE MODIFIER/,/1D4LEVELS UPON CAPTURE/,/ONCE EVER PER POKEMON/],
 K24Mww4alZrOwtv2:[/SUBTRACTS-10 FROM CAPTURE ROLLS/,/FISHED TARGETS/,/Do not normalize/],SLL8cTfeP1QGMDS1:[/EXACTLY FIVE BASIC OPTIONS/,/Practical\/Focused\/Incense are SEPARATE RECIPES/],Qtp2UOCWXPfNN5MX:[/UP TO FIVE TRAINER/,/MAXAP2 UNTIL NEXT EXTENDED REST/,/SPOILS20MIN/,/MUSHROOMS ONLY/],
 IQjARFuWQ97HPDUx:[/HAIL AND FROZEN IMMUNITY/,/ICE ATTACK DR5/,/WORKS EVERYWHERE/],QkvB83ymOYgCXftq:[/COMPLETE DARKNESS CAUSES ORDINARY BLINDNESS INSTEAD OF TOTAL/,/STEALTH ROCK IMMUNITY/,/WORKS EVERYWHERE/],K41ug5sH6FK2ZsCj:[/THIS EXACT ID under KANTOIAN/,/GALARIAN TODO AUTHORS NO COUNTERPART/],
 HO51xFZDZKJGksKx:[/UP TO THREE.*WITHIN10METERS/,/SAME-NAMED WARPER.*TELEPORT AND ALLY SWITCH/],Ls0GcAMflItwVy4O:[/KYUREM/i,/EMPTY TAO/,/ARTICUNO.*ELEMENTAL SOUL/],Kg08CfmKZ5IIhFYd:[/THREE ROUNDS BOTH ATTACK AND SPEED ARE HALVED/,/AT END OF THIRD BOTH GAIN TWO COMBAT STAGES/],KkbLwc2L4KzeXLw0:[/AS IF ONE LOYALTY HIGHER FOR REST OF THIS TURN/],
 SPMUO2lZwmgUeCkE:[/RANK2\/SINGLE-TARGET/,/VULNERABLE FOR ONE FULL ROUND/,/CRITICAL HIT RANGE\+3/],L6FARt9x9lPKsbMM:[/REPLACES RANGE/,/BURST1\/CONE2\/CLOSEBLAST2\/LINE4\/2TARGET-RANGE4/],
};}

const sourceLinks={"FFJ07rUIJlrcuftj":["blessed:67:feature-line62"],"FJFrGh3B3Ybd1vBL":["core:119:feature-line3"],"FVpj0vmyR1g5xdyJ":["blessed:62:feature-line61"],"Fhnls91zJvztFgtH":["blessed:66:feature-line55"],"FsaXK2dtt9kP3HlZ":["core:138:feature-line3"],"G3b06yUGZxIeBi37":["blessed:66:feature-line11"],"GfNyVFaL3pG4ieEb":["blessed:61:feature-line9"],"GnOE5NC9blGZ77lt":["porygon:80:feature-line33","porygon:80:feature-line41","porygon:80:feature-line45","porygon:80:feature-line49"],"HJ0OjCZYqnjlKES7":["core:75:feature-line47"],"HO51xFZDZKJGksKx":["core:195:feature-line8","blessed:64:feature-line50"],"HONb9dD2w0hBxo0i":["core:75:feature-line47"],"I9chbUzgBCkDEgBh":["core:138:feature-line8"],"IC8lXKRZpSGO7hFy":["blessed:66:feature-line15"],"IQjARFuWQ97HPDUx":["core:150:feature-line25"],"IzdvMVqUGv3E0etW":["blessed:59:feature-line64"],"J3X6N4lRLbYW6qyq":["blessed:65:feature-line42"],"JaC2CGqH3qpoJiwp":["core:132:feature-line3"],"K41ug5sH6FK2ZsCj":["blessed:58:feature-line58"],"KRSXJ62Z8mqhB0rQ":["core:75:feature-line47"],"Kg08CfmKZ5IIhFYd":["blessed:66:feature-line3"],"KkbLwc2L4KzeXLw0":["blessed:59:feature-line22"],"KxPxcSeSr0z3yBZ6":["core:164:feature-line3"],"L5SlKhHM4SJH9UYB":["blessed:70:feature-line21","blessed:54:feature-line30"],"L6FARt9x9lPKsbMM":["throhs:54:feature-line3","throhs:54:feature-line19","throhs:54:feature-line33"],"LPP5JiIn6JvG2w7v":["core:108:feature-line3"],"LkuwnX0KG1eaV4FE":["core:150:feature-line25"],"Lr1pg01mYx2iTvQP":["blessed:65:feature-line67"],"Ls0GcAMflItwVy4O":["blessed:58:feature-line50","blessed:67:feature-line53"],"MDDtt5kSC9dWVOV7":["core:141:feature-line19"],"MFJzVmEBzI9vudGf":["core:162:feature-line22"],"MJRJNFTKfzRkNakQ":["blessed:63:feature-line32"],"MSWox3TQ0TVUJNFI":["blessed:60:feature-line48"],"MVI0NGm5VVWycmlr":["core:138:feature-line8"],"MpVeWLO6W2DYCwIZ":["blessed:59:feature-line12","blessed:60:feature-line73"],"MpxMDMcwbMKafAoS":["blessed:65:feature-line51"],"N26ZjyrK84Jdxqz9":["blessed:68:feature-line38"],"ND4bypQupS24jnba":["blessed:62:feature-line14"],"NEunMg1HBMCfl6ay":["blessed:65:feature-line9"],"NeeQBCgogbkPzALB":["blessed:63:feature-line60"],"Nrj5IX1uTO6ql5VF":["core:141:feature-line14"],"NsLUafQixnvyCWYt":["core:150:feature-line25"],"O4T0DYGhoHlwrcmb":["blessed:61:feature-line55"],"O59ah0hx6aIihlVf":["core:142:feature-line40"],"OiGlsU6xt9i1HnLN":["blessed:50:feature-line3"],"OjFwyh29VOqXIJAM":["core:86:feature-line49"],"OyPMURRsAYi1hi6G":["core:142:feature-line52"],"P1FNtIklfdHfJz5d":["blessed:58:feature-line62"],"PK3drpwjFGPsKU2W":["blessed:60:feature-line77"],"Pha5kunxNJxTWptp":["blessed:61:feature-line66"],"PnlcuG8lLi9xMmM2":["porygon:84:feature-line63"],"QXzQRVlNPrLEwRS1":["blessed:69:feature-line66"],"Qd5GGNfXbYlxjWVd":["blessed:64:feature-line3"],"QgYCbLkmKYHQHNay":["blessed:67:feature-line57"],"QkvB83ymOYgCXftq":["core:150:feature-line25"],"Qs80HP7ivbF8e28G":["core:89:feature-line22"],"Qtp2UOCWXPfNN5MX":["core:132:feature-line54"],"REigmoGbvEKFjszC":["blessed:68:feature-line20"],"RUbK1X2h813FPJfB":["blessed:63:feature-line9"],"S0NKjxTA2L7MJwzH":["blessed:63:feature-line64"],"SBL4kraYS2U6AlQW":["blessed:70:feature-line65"],"SE49PSSWiQvnb9Mi":["blessed:68:feature-line48"],"SLL8cTfeP1QGMDS1":["core:138:feature-line8"],"SLZxScF7wlDSmAKs":["blessed:70:feature-line79"],"SPMUO2lZwmgUeCkE":["throhs:54:feature-line11","throhs:54:feature-line19","throhs:54:feature-line33"],"SteSF2pXH4m6JJeD":["blessed:62:feature-line55"],"TIcgJjb8dg4ncUVU":["core:96:feature-line3"],"TctrQNmUZPHL2uRl":["blessed:60:feature-line67"],"TfXpnBnkzNlvdJME":["blessed:67:feature-line11"],"Tg399r4Ole9IvrbJ":["blessed:55:feature-line66"],"UETkZKBkj9z9QkWt":["blessed:61:feature-line18"],"UX8M6xT3aUrUHfmA":["blessed:58:feature-line66"]};

const printedLinks={"FJFrGh3B3Ybd1vBL":["f4b:type-skills"],"GNdI0Lk6XwOvClYw":["f4b:wonder"],"HJ0OjCZYqnjlKES7":["f4b:shock"],"HONb9dD2w0hBxo0i":["f4b:reliable"],"HzWqaASxIm8cSh1R":["f4b:sole"],"I9chbUzgBCkDEgBh":["f4b:adorable"],"IQjARFuWQ97HPDUx":["f4b:arctic"],"JWR86xMhMjgY5hN2":["f4b:ball-modifications"],"Jck2a3f0rEoM8A7w":["f4b:fossils"],"K24Mww4alZrOwtv2":["f4b:snare"],"KLukPDAfZmpqZYo4":["f4b:cap"],"KRSXJ62Z8mqhB0rQ":["f4b:guarding"],"KxPxcSeSr0z3yBZ6":["f4b:courage"],"L6FARt9x9lPKsbMM":["f4b:warp"],"LPP5JiIn6JvG2w7v":["f4b:shell"],"LgiszLN9BcIBZRc6":["f4b:core-confusion","f4b:feb-confusion"],"LkuwnX0KG1eaV4FE":["f4b:dune"],"MVI0NGm5VVWycmlr":["f4b:elegant"],"O6BYap68R4OMCHbk":["f4b:paragon"],"OEjj14lLJEwTYSQ4":["f4b:ball-modifications"],"OiGlsU6xt9i1HnLN":["f4b:carrion"],"OjFwyh29VOqXIJAM":["f4b:look-table"],"QS8lWDRWgkcP0fYJ":["f4b:wayfarer"],"QkvB83ymOYgCXftq":["f4b:cave"],"RU6ok1dtRlDhTo3a":["f4b:blessed-strike"],"SPMUO2lZwmgUeCkE":["f4b:berserk"],"TIcgJjb8dg4ncUVU":["f4b:momentum"],"UeeEBjhgY9AGgC9K":["f4b:ball-modifications"]};

const nativeLinks={"K41ug5sH6FK2ZsCj":["H8YHTff4MxyPydws"]};

export function checkReferenceF4bSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F4b');
    const audit = bundle.referenceSlices?.find(a => a.slice === 'F4b');
    if (!audit) { fail(!slice.recordFile, 'F4b completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F4b record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F4b' && audit.recordKind === 'reference' && file.recordKind === 'reference' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F4b frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F4b independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.referenceReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F4b exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 84 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 85 && audit.printedDefinitions.length === 27
        && audit.parentContexts.length === 92 && audit.nativeContexts.length === 1, 'F4b bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F4b full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F4b complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F4b full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F4b exact native page/authority changed: ' + n.pageId);
    }
    const facts = referenceF4bSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && referenceF4bFactErrors(facts).length === 0, 'F4b independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + referenceF4bFactErrors(facts).join('; '));
    const proseRequirements = referenceF4bSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.independentPTRGuidanceAuthoringEstablished === false && audit.authoringLimits.independentWholeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentSpiritFrameworkEstablished === false && audit.authoringLimits.descriptiveReferencesImplementEffects === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F4b missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F4b'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 180 && snapshots.size === audit.targetSnapshots.length, 'F4b exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, referencePageOccurrences(a?.data)), 'F4b exact current target/prior chronology changed: ' + s.identity);
    }

    fail(audit.independentUseContextSnapshots.length === 1, 'F4b complete incoming-use page census changed');
    for(const c of audit.independentUseContextSnapshots){
        const source=actualMap.get(c.sourceIdentity)?.data;
        const actual=c.contextPath.slice(2).replaceAll('[','.').replaceAll(']','').split('.').reduce((v,k)=>v?.[k],source);
        fail(c.sourceIdentity==='journals.cP772AChmDjr486z' && c.contextPath==='$.pages[113]' && actual?._id==='H8YHTff4MxyPydws'
            && equal(c.contextDocument,actual) && hash(actual)===c.contextJsonSha256
            && equal(c.references,referenceUuidOccurrences(actual,c.contextPath))
            && c.references.every(r=>snapshots.has(r.targetIdentity)), 'F4b actual complete incoming page/path/UUID scope changed');
    }
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F4b full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F4b literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of referenceUuidOccurrences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => referencePageOccurrences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F4b literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F4b exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.referenceSlices.find(a => a.slice === 'F4a').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F4b independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F4b full root-system inventory changed');
    fail(equal(audit.rootLabels, Object.fromEntries(slice.members.map(([id]) => [id, actualMap.get(id)?.data.name]))), 'F4b literal root-label inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F4b per-ID audit inventory changed');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.referenceReview;
        fail(r && e && d && doc?.type === 'reference' && r.contentHash === contentHash && e.contentHash === contentHash, 'F4b exact reference examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialTextualCorrespondence ? 'examined-reference-source-correspondence' : 'examined-reference-version-or-authority-limit')
            && (d.partialTextualCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, referenceF4bFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata, optional playtest and explicitly labelled errata remain separate'
            && r.coverageState === (d.partialTextualCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F4b source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F4b independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((printedLinks[shortId]??[]).every(id=>d.printedDefinitionIds.includes(id)&&audit.printedDefinitions.some(u=>u.id===id&&d.parentContextIds.includes(u.parentContextId))), 'F4b complete printed leaf/table/guidance trace changed: '+identity);
        fail(d.referenceType==='reference'&&d.interpretationKind==='descriptive-source-examination; no effect semantics manufactured'&&doc.system.rules.length===0&&doc.effects.length===0&&d.prerequisitePolicy.includes('non-blocking'), 'F4b descriptive reference/type/advisory contract changed: '+identity);
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F4b per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length || d.printedDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F4b unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F4b complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F4b actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, referenceF4bRuleRoles(doc)) && equal(e.literalReferences, referenceLiterals(doc))
            && equal(e.pageReferences, referencePageOccurrences(doc)), 'F4b complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F4b exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F4b exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) { const use=audit.independentUseContextSnapshots.find(c=>c.sourceIdentity===ref.sourceIdentity&&ref.path.startsWith(c.contextPath)); fail(use && use.references.some(r=>r.path===ref.path&&r.literalUuid===ref.literalUuid&&r.targetIdentity===identity)&&use.references.every(r=>snapshots.has(r.targetIdentity)), 'F4b page-scoped incoming use outgoing target omitted: ' + identity); }
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F4b complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'references');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F4b historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F4b finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 78, unresolved: 6}) && equal(counts, closure.counts), 'F4b bounded correspondence/limit counts changed');
}
