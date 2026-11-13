// Offline descriptive reference evidence only; never a runtime eligibility or effect policy.
import {effectReferences as referenceUuidOccurrences,effectLiteralReferences as referenceLiterals} from './effect-source-review.mjs';
import {effectPageReferences as referencePageOccurrences} from './effect-slice-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='7e909816259f9bff53fc7762be7f3c3f3590bc44a9a83e7ae028addad06678c3';
const SOURCE_PRIMITIVES='6a962987382972884546aa7db66573f10ea8b828a5ba8fee12f9ce887ca496b5',EXAMINED_DISPOSITIONS='44b6029ef23efb29b36bc925dff19206bec3c612dbe137282b705f3d63a68fe0',HISTORICAL_OBSERVATIONS='cd5a20e61fce9dbe8f305db95c4e9a67c3b57f5714fb681545c52aca458f5e91',SCOPE_PROOF='c2c150b85d51c102ac7993661334db7e87c9d7fb2068e8909f87182aef70f17b';
export const referenceF4cRuleRoles=doc=>(doc?.system?.rules??[]).map((object,i)=>({path:`$.system.rules[${i}]`,object,interpretation:'Stored object only; no effect semantics inferred for a descriptive reference.'}));
export const referenceF4cDilettanteEdges=['Acrobat','Apricorn Balls','Basic Balls','Basic Cooking','Basic Martial Arts','Beast Master','Breeder','Dynamism','Gem Lore','Grace','Green Thumb','Groomer','Instinctive Aptitude','Instruction','Intimidating Presence','Iron Mind','Medic Training','Mounted Prowess','Repel Crafter','Slippery','Swimmer','Train the Reserves'];
export const referenceF4cDilettanteFeatures=['Command Versatility',"Commander's Voice",'Defender','Dive','First Aid Expertise','Let Me Help You With That','Poke Ball Crafter','PokeManiac','Press','Quick Switch','Skill Monkey','Species Savant','any [Training] Feature','Tutoring','Walk It Off'];
export const referenceF4cSourceSpecifications=[
 ['blessedPower','unit','blessed:55:feature-line43',/Signer: Swift Action.*?Damaging Move.*?Patron's Level Up List.*?Damage Base of ([0-9]+) or lower.*?matches one of their Types.*?until of combat/,'8'],
 ['pummeling','unit','core:162:feature-line33',/([0-9]+) AP - Free Action.*?hit a foe with a Move affected by Iron Fist.*?Accuracy Rolls and Evasion against that foe.*?maximum of your Combat Rank.*?turn without successfully hitting.*?Tag.*?bonus is lost/,'1'],
 ['sightConsent','unit','blessed:59:feature-line52',/one.*?Latias.*?other.*?Latios.*?both you and your Link Partner give mental consent and are conscious.*?never hit each other with Area of Effect Moves unless you want/],
 ['sharedHP','unit','blessed:67:feature-line73',/Daily x([0-9]+) - Standard Action.*?Allied Pokemon or Trainer.*?remaining Hit Points.*?split these Hit Points as you wish/,'3'],
 ['originalParalysis','printed','f4c:core-paralysis',/Speed Stat is lowered by ([0-9]+) Combat Stages.*?beginning of each turn.*?DC ([0-9]+).*?cannot take any Standard, Shift, or Swift.*?Electric Type.*?immune/,'4','5'],
 ['optionalParalysis','printed','f4c:feb-paralysis',/Initiative is halved.*?([0-9]+)\+ at start.*?Standard OR Shift.*?not both.*?Vulnerable for ([0-9]+) full round.*?cannot take attacks of opportunity for ([0-9]+) full round/,'11','1','1'],
 ['burstStatus','page','core:76',/Status Moves.*?Burst of Motivation.*?After this Move is Resolved.*?negative Combat Stages.*?\+([0-9]+).*?cannot put Combat Stages above \+([0-9]+)/,'2','0'],
 ['scatterCategory','page','core:76',/Cone, Line, Burst, and Blast Moves.*?Scattershot.*?Instead of.*?normal range.*?([0-9]+)m, ([0-9]+) Targets/,'4','3'],
 ['signatureCost','unit','core:75:feature-line47',/loses ([0-9]+) Tutor Points.*?one Signature Technique at a time.*?([0-9]+) Tutor Point is refunded/,'2','1'],
 ['snackBitter','unit','core:132:feature-line3',/Bitter Treat Effect:.*?hit by a Special Attack.*?\+([0-9]+).*?Bitter Food.*?\+([0-9]+).*?dislikes Bitter Food.*?Enraged/,'5','10'],
 ['snackSour','unit','core:132:feature-line3',/Sour Candy Effect:.*?hit by a Physical Attack.*?\+([0-9]+).*?Sour Food.*?\+([0-9]+).*?dislikes Sour Food.*?Enraged/,'5','10'],
 ['snackDry','unit','core:132:feature-line3',/Dry Wafer Effect:.*?making a Special attack.*?\+([0-9]+).*?Dry Food.*?\+([0-9]+).*?dislikes Dry Food.*?Enraged/,'5','10'],
 ['songsBranches','printed','f4c:songs',/always affect the user.*?Sonic.*?Swift Action.*?same as.*?Dance.*?Shift Action.*?Burst ([0-9]+).*?Standard.*?one Song.*?Burst ([0-9]+).*?Full.*?two Songs.*?Burst ([0-9]+)/,'2','4','4'],
 ['danceFixed','printed','f4c:dance',/\+([0-9]+) Combat Stages to a single Stat.*?\+([0-9]+) Combat Stage to two different Stats.*?Once chosen, this cannot be changed.*?Dragon Dance, Quiver Dance, and Swords Dance/,'2','1'],
 ['danceTemplate','printed','f4c:dance',/Type: Normal Frequency: EOT AC: None Class: Status Range: Self Effect: Contest Type: Contest Effect: Get Ready!/],
 ['emptyTao','unit','blessed:67:feature-line46',/next three rounds.*?all Pokemon and Trainers within ([0-9]+) meters.*?all Combat Stages locked to zero/,'5'],
 ['stigmata','printed','f4c:stigmata',/more than ([0-9]+) Injuries.*?extensive medical care and rest.*?no longer take max HP penalties from Injuries/,'3'],
 ['rainbowRetune','unit','core:142:feature-line56',/Two Shards of each Color.*?Accessory Item, Head Slot Item, or Hand or Off-Hand Item.*?Extended Action.*?Expert Occult Education.*?change which Stat.*?Rainbow Amulet/],
 ['channelTruth','printed','f4c:channel',/intentions, emotions, and motivations.*?neither party may be deceitful.*?all of its Moves, Abilities, and Capabilities.*?Intercept Maneuvers.*?regardless of Loyalty.*?Fainted.*?stop Channeling.*?past hour.*?isn't League Legal/],
 ['channelLimit','unit','core:179:feature-line3',/At-Will - Swift Action.*?Hostile.*?DC of ([0-9]+).*?Free Action.*?up to your Intuition Rank.*?further than ([0-9]+) meters.*?stop being Channeled/,'15','20'],
 ['insightRoles','unit','blessed:56:feature-line15',/Messiah: Scene - Swift Action Signer: Swift Action.*?Pacts, Patrons, or Allegiances.*?Signer Effect:.*?one of.*?weaknesses.*?not of who or what.*?harm your Patron/],
 ['ancientDice','printed','f4c:ancient',/Messiah: Static Signer: Free Action.*?extra Dice on Education: Occult checks.*?any Check dealing with Occult.*?Signer Effect:.*?Education: Occult check.*?additional Two Dice/],
 ['toolsRoles','printed','f4c:tools',/\+([0-9]+).*?Accuracy Rolls.*?Pok.*?Balls, Hand Nets, Lassos, Weighted Nets, and Glue Cannons.*?\+([0-9]+).*?Athletics.*?reeling.*?\+([0-9]+) to ([0-9]+)d([0-9]+).*?Bait or a Fishing Lure/,'2','2','4','1','20'],
 ['fabulousHP','printed','f4c:fabulous',/\+([0-9]+) dice.*?If the Stat boosted is HP.*?two Contest Stats except.*?lowered Stat.*?([0-9]+) die each.*?Beauty=SpAtk, Cool=Attack, Cute=Speed, Smart=SpDef, Tough=Def/,'2','1'],
 ['onceEver','printed','f4c:ball-modifications',/Learning, Fabulous and Power Modification work once on a Pokemon. Ever.*?release and recapture/],
 ['radSave','printed','f4c:rad',/Command.*?once a Scene.*?Free Action.*?\+([0-9]+).*?single Save Check/,'4'],
 ['roughFoe','printed','f4c:rough',/Intimidate.*?once a Scene.*?Free Action.*?foe within ([0-9]+) meters.*?(-[0-9]+).*?all rolls for one full round/,'5','-2'],
 ['stormRound','unit','blessed:70:feature-line42',/Scene - Standard Action.*?([0-9]+) rounds.*?all combatants.*?Heal Block.*?all effects deal only Typeless damage.*?beginning of each round.*?([0-9]+\/[0-9]+)th.*?maximum Hit Points/,'5','1/16'],
 ['originalInfatuation','printed','f4c:core-infatuation',/beginning of each turn.*?([0-9]+)-([0-9]+).*?may not target.*?([0-9]+)-([0-9]+).*?without restriction.*?([0-9]+) or higher.*?cured/,'1','10','11','18','19'],
 ['optionalInfatuation','printed','f4c:feb-infatuation',/(-[0-9]+).*?Damage Rolls that do not include.*?Crush.*?do include.*?Attack and Special Attack are halved.*?([0-9]+)\+ made at end of turn/,'-5','16'],
 ['emotionDice','unit','blessed:60:feature-line31',/Reroll all dice.*?roll of ([0-9]+).*?Charm and Intuition Checks/,'1'],
 ['banish','unit','blessed:64:feature-line71',/single Target within ([0-9]+) meters.*?([0-9]+)d([0-9]+)\+([0-9]+) rounds.*?no loss of time.*?same spot.*?nearest unoccupied space/,'8','1','2','1'],
 ['lifeDuration','printed','f4c:life',/([0-9]+) AP - Special.*?All Allies.*?([0-9]+) Damage Reduction.*?end of your next turn/,'1','5'],
 ['preserves','unit','core:132:feature-line76',/\$([0-9]+), any Berry, Herb, or Mushroom.*?x([0-9]+) Units.*?same effect as the consumable/,'50','2'],
 ['luckRoles','unit','blessed:55:feature-line54',/Messiah Trigger.*?fail.*?Signer Trigger.*?roll.*?Messiah Effect:.*?reroll.*?Signer Effect:.*?\+([0-9]+).*?Skill Check.*?\+([0-9]+).*?Accuracy Roll/,'4','2'],
 ['softLanding','unit','core:162:feature-line52',/fall damage, or miss with Jump Kick or High Jump Kick.*?half your Combat Rank.*?miss with Jump Kick or High Jump Kick.*?lose no Hit Points/],
 ['dilettanteChoices','unit','core:86:feature-line10',/Ranked ([0-9]+).*?both an Edge and a General Feature.*?even if.*?do not meet the Skill prerequisites.*?must meet any other Prerequisites.*?Whenever.*?Skill Rank applications or Skill Checks.*?General Education or Perception/,'4'],
 ['searing','unit','blessed:66:feature-line41',/([0-9]+) AP - Free Action.*?next Struggle Attack with an equipped weapon.*?\+([0-9]+) Damage Steps.*?Fire Type/,'2','2'],
 ['drainWill','unit','blessed:60:feature-line3',/within ([0-9]+) meters.*?Contested Focus.*?If you win.*?Shift or Standard.*?([0-9]+)d([0-9]+) turns.*?Regardless.*?(-[0-9]+).*?all rolls.*?fifteen minutes outside.*?([0-9]+) hours/,'8','1','2','-3','24'],
 ['whirlwind','unit','core:162:feature-line61',/Technician ([0-9]+) AP - Full Action.*?Rock Smash.*?any number of adjacent foes.*?not count as Flanked for one full round/,'1'],
 ['spiritJustice','unit','blessed:61:feature-line4',/Spirit Modifier instead of.*?Body Modifier.*?Combat Skill Checks.*?\+([0-9]+).*?Disarming or resisting Disarming/,'2'],
 ['dreamspinnerBoth','unit','blessed:65:feature-line23',/Prerequisites: Major Gift - Oneiromancy, Major Gift - Dream Augury/],
 ['invert','unit','blessed:66:feature-line64',/next ([0-9]+) rounds.*?weaknesses and resistances exchanged.*?Double resistance.*?immunity beyond.*?double weaknesses.*?double weaknesses become double resistance/,'5'],
 ['augurySelf','printed','f4c:augury',/Target: Self.*?past, present, or future.*?clarity.*?ability to remember.*?next page/],
 ['auguryGuidance','page','core:187',/negotiate.*?method.*?relatively easy.*?regardless of their location.*?don't ALW AYS do this.*?give incomplete information/],
 ['doubleLimit','printed','f4c:double',/Double Strike.*?only once.*?either roll.*?Damage Base of ([0-9]+) or less.*?may not be applied.*?Damage Base change.*?Special-Case Damage/,'4'],
 ['traceurUrban','printed','f4c:traceur',/\+([0-9]+).*?Jump Capabilities.*?half your Survival Rank.*?Evasion against Push, Trip, and Attack of Opportunity/,'1'],
 ['duneDesert','printed','f4c:dune',/immune.*?Sandstorm, Sand-Attack, and Sand Tomb.*?([0-9]+) Damage Reduction against Fire/,'5'],
];
export function referenceF4cSourceFacts(audit,cleanText){
 const get={unit:id=>cleanText(audit.sourceDefinitions.find(u=>u.id===id)?.rawDefinition??''),printed:id=>cleanText(audit.printedDefinitions.find(u=>u.id===id)?.rawDefinition??''),page:id=>cleanText(audit.parentContexts.find(u=>u.id===id)?.rawText??'')};
 const d=get.unit('core:86:feature-line10'),edges=d.match(/Edges: (.*?)\.\s*[^A-Za-z]*Features:/)?.[1]?.split(', '),features=d.match(/Features: (.*?)\. Whenever/)?.[1]?.split(', ');
 const root=id=>audit.rootCurrentSystems['references.'+id],native=cleanText(audit.nativeContexts[0]?.rawText??'');
 return {observations:Object.fromEntries(referenceF4cSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),dilettante:{edges,features},
 currentObservations:{allRootRulesEmpty:Object.values(audit.rootCurrentSystems).every(s=>Array.isArray(s.rules)&&s.rules.length===0),allRootSystemsExactlyDescriptive:Object.values(audit.rootCurrentSystems).every(s=>Object.keys(s).join(',')==='origin,effect,snippet,rules,enabled,slug,schema,referenceEffect,source,stackSlugs,keywords'),dilettantePlaceholder:root('fvYfm45ELRcaY4a9').effect,powerRapid:/Signer: Rapid Action/.test(root('Uk2cfeJO0ATH2tR2').effect),songsRapid:/Rapid Action/.test(root('Z0sGUWoQHDuC4BLf').effect),insightBothRapid:(root('bXVPBPJm8s9Hu68o').effect.match(/Rapid Action/g)??[]).length===2,traceurBodyDesert:/Sandstorm, Sand-Attack, and Sand Tomb/.test(root('jAcwIHOyVjJWr0Ar').effect),whirlwindRockSmash:/Rock Smash/.test(root('gS0LzGf5jGGCAhVo').effect)},
 sourceScope:{fullCurrentGenerationEstablished:false,independentWholeCRFrameworkEstablished:false,independentMaxZAdaptationAuthoringEstablished:false,missingFriendshipSpiritArtifactReplacedByBlessing:false,sourceAbsenceClaim:false},nativeUse:{pageId:audit.nativeContexts[0]?.pageId,kantoian:/The Gifts - Kantoian/.test(native),galarianTodo:/The Gifts- Galarian TODO/.test(native),independentSourceAuthority:false},unresolvedExecution:{reproducedGameplayFailure:false,descriptiveReferenceImpliesExecutableEffects:false,actualUseAcquisitionPreservation:'not-run'}};
}
export function referenceF4cFactErrors(f){
 const errors=[];for(const[key,kind,id,re,...values]of referenceF4cSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source condition/quantity/role');}
 if(JSON.stringify(f.dilettante.edges)!==JSON.stringify(referenceF4cDilettanteEdges)||JSON.stringify(f.dilettante.features)!==JSON.stringify(referenceF4cDilettanteFeatures))errors.push('complete22-Edge15-Feature Dilettante lists');
 const c=f.currentObservations;if(!c.allRootRulesEmpty||!c.allRootSystemsExactlyDescriptive||!c.powerRapid||!c.songsRapid||!c.insightBothRapid||!c.traceurBodyDesert||!c.whirlwindRockSmash||!c.dilettantePlaceholder)errors.push('literal current shape/placeholder/action/body');
 if(Object.values(f.sourceScope).some(Boolean))errors.push('source/identity/scope/absent-authoring promoted');
 if(f.nativeUse.pageId!=='H8YHTff4MxyPydws'||!f.nativeUse.kantoian||!f.nativeUse.galarianTodo||f.nativeUse.independentSourceAuthority!==false)errors.push('native exact Kantoian/Galarian boundary');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.descriptiveReferenceImpliesExecutableEffects!==false||f.unresolvedExecution.actualUseAcquisitionPreservation!=='not-run')errors.push('descriptive review promoted to behavior');return errors;
}
export function referenceF4cFindings(identity,facts){return identity==='references.ZF71mNCnts5vWOJe'?{role:'Exact-ID/content-hash scope-only exclusion; raw fields preserved, no mechanical source examination.',mechanicalSourceExaminationPerformed:false,normativeSourceApproval:false,recoveryOrVariantApproval:false,actualUse:'not-run'}:{role:'Complete source clauses and current descriptive fields retain exact per-reference source links; no canonical, executable, whole-version or generation approval.',sourceScope:facts.sourceScope,actualUse:'not-run',fullCurrentVersionEstablished:false};}
export function isReferenceF4cScopeExclusion(bundle,row,actual,hash,equal){
 const proof=row?.generationReview?.scopeExclusionEvidence,audit=bundle.referenceSlices?.find(a=>a.slice==='F4c'),types=bundle.generationScope?.files?.find(f=>f.file==='types.csv');
 return row?.identity==='references.ZF71mNCnts5vWOJe'&&row.contentHash==='34732e84d777cec27f34c07218c3d3145d9ffd1e9c1c4e77cbcdfcfdab6c5acc'&&actual?.contentHash===row.contentHash&&actual.data.type==='reference'
  && proof&&hash(proof)===SCOPE_PROOF&&equal(proof,audit?.scopeExclusionEvidence)&&equal(proof.cachedTypeSource,types)
  && ['Paldea','Tera Orb','Tera Type','Stellar'].every(marker=>actual.data.system.effect.includes(marker))
  && row.coverageState==='excluded'&&row.generationReview.status==='excluded'&&row.sourceComparison.referenceReview.scopeExclusionOnly===true
  && row.sourceComparison.referenceReview.mechanicalSourceExaminationPerformed===false&&row.productionPolicyPromotion===false&&row.behavioralVerification==='not-run';
}
export function referenceF4cSemanticRequirements(){return {
 Uk2cfeJO0ATH2tR2:[/ALL FOUR SAME-ID HISTORIES SAY SIGNER SWIFT/,/CURRENT SIGNER RAPID/,/DB8OR LOWER/],
 Z0sGUWoQHDuC4BLf:[/ALL FOUR SAME-ID HISTORIES SAY SONIC SWIFT/,/CURRENT SONIC RAPID/,/ALWAYS AFFECTS USER/,/FOUR BRANCHES/],
 bXVPBPJm8s9Hu68o:[/CURRENT BOTH RAPID/,/ONE WEAKNESS/,/NOT WHO\/WHAT/],
 fvYfm45ELRcaY4a9:[/FULL SOURCE IS AVAILABLE/,/22Edges\/15Featureentries/,/NOT LOOKANDLEARN TABLE/],
 jAcwIHOyVjJWr0Ar:[/TITLE TRACEUR URBAN BUT BODY DUNEWALKER/,/BOTH SOURCE LEAVES AVAILABLE/,/WORKS EVERYWHERE/],
 gS0LzGf5jGGCAhVo:[/FIRST THREE SAME-ID HISTORIES INSTEAD CONTAIN HEIGHTENED INTENSITY/,/FOURTH matches current/,/NOFLANKED1ROUND/],
 ZKmKehxih52NeNdi:[/INDEPENDENT PTU AUTHORING\/VERSION LIMIT/,/NOT AUTHORITY FOR THIS COMPLETE MAXMOVE FRAMEWORK/,/no source absence/i],
 dhL6lPSNB78lNr3c:[/INDEPENDENT PTU AUTHORING\/VERSION LIMIT/,/NO SOURCE ABSENCE CLAIM/],
 ZF71mNCnts5vWOJe:[/SCOPE EXCLUSION ONLY/,/NO MECHANICAL SOURCE EXAMINATION/,/no consumer-driven exclusion/],
 X9qlsbeHMiKrhZ8V:[/INITIATIVE HALF/,/STARTTURN SAVE11/,/ORIGINAL CORE246/,/BOTH COMPLETE ALTERNATIVES/],
 etrYWOU1KcUmhnOl:[/DOES NOT INCLUDE CRUSH/,/ENDTURN SAVE16/,/ORIGINAL CORE247 STARTTURN/,/BOTH COMPLETE ALTERNATIVES/],
 ZCS1rVwrjjGG0VZ6:[/NORMAL\/EOT\/ACNONE\/STATUS\/SELF\/GETREADY/,/ONCE CHOSEN CANNOT CHANGE/,/FIVE CONTESTSTAT MAPPINGS/],
 ZYpB23WkG26CNVNX:[/THREE CASE RECIPE GROUPS AND SIX MODIFICATIONS/,/ONCE EVER PER POKEMON/,/feats.hRrOZUUem3uGm8hq/,/\$\.system.effect/],
 VuNyWXgwUdhFkbXa:[/BOTH CONSCIOUS AND BOTH MENTALLY CONSENTING/],
 YZf29W4xPMu1ybCg:[/ALL FIVE COMPLETE ORIGINAL PORYGON84 RECIPES/,/not crafting-price conflicts/],
 gNrukO5IsH99832y:[/REGARDLESS WIN ALLROLLS-3/,/IMMUNE FURTHER USE24H/],
 cEcrxUTwXGjHUEHh:[/HP-BOOSTED NATURE/,/EXCEPT LOWEREDSTAT/,/ONCE EVER PER POKEMON/],
 gVCM65BXyPAMJ8r7:[/DISTINCT KYUREM/,/GALARIAN TODO AUTHORS NO COUNTERPART/],
 XYexTW8Ih0QlXR1S:[/THIS EXACT ID/,/GALARIAN TODO AUTHORS NO COUNTERPART/],
 iXMQXX1fHETK34Go:[/COMPLETE NEXT-PAGE187 GM GUIDANCE/,/DISTINCT FROM LUNAR DREAM AUGURY/],
 bL7fkdXmofLXjoAn:[/RETUNING IS EXTENDED ACTION/,/distinct accepted F4a CR Standard/],
 bPB96maA7rybMi6p:[/TRUTHFUL/,/VAGUE PAST-HOUR MEMORIES/,/NOT LEAGUE LEGAL/],
 dNlnVU6YRG77EMqV:[/ONE SAVE CHECK/],h0kk8W1FywL0n0V1:[/FOE WITHIN5M ALLROLLS-2 FOR ONE FULL ROUND/],
 XFRpj49uTnIIx4Xq:[/STATUS-MOVE ONLY/,/NEVER ABOVE0/],Y93mq2bUelK9iDOb:[/REPLACES RANGE WITH4M\/3TARGETS/],j6DZ4i3eEBV0u3eG:[/ONLY ONCE EITHER ROLL/,/DB4ORLESS EXCLUDES/],
 };
}

const sourceLinks={"Uk2cfeJO0ATH2tR2":["blessed:55:feature-line43"],"Up4iCkN5JyRuP3Uk":["core:162:feature-line33"],"UpYQ1DK4AswzVGOE":["porygon:80:feature-line49"],"VjoJc8bQ6V3e3rc2":["blessed:66:feature-line76"],"VuNyWXgwUdhFkbXa":["blessed:59:feature-line52"],"WMqbK2fiICHXSGAr":["blessed:59:feature-line68"],"WNkPb84r7KpOjVsz":["may:3:feature-line3"],"WZjWYlssRx8bpI6N":["blessed:67:feature-line73"],"Waxwh0s7pPCy1jOT":["porygon:82:feature-line48"],"Wqtn22gCvmSL71hU":["blessed:61:feature-line50"],"X9006ewZpK1hnSCe":["blessed:61:feature-line46"],"XFRpj49uTnIIx4Xq":["core:75:feature-line47"],"XYexTW8Ih0QlXR1S":["blessed:58:feature-line54"],"XowzwNxWBcgDpXQf":["core:142:feature-line34"],"Y93mq2bUelK9iDOb":["core:75:feature-line47"],"YEuKDIALD23rzEZa":["core:132:feature-line3"],"YGBqoHCoHX8yesHt":["porygon:82:feature-line43"],"YRxNscpZNYprenXV":["blessed:67:feature-line41"],"YZf29W4xPMu1ybCg":["porygon:84:feature-line52","porygon:84:feature-line57","porygon:84:feature-line63","porygon:84:feature-line69","porygon:84:feature-line75"],"Z0eMdPbQko8tylMz":["blessed:59:feature-line44"],"Z0sGUWoQHDuC4BLf":["core:164:feature-line3"],"ZCS1rVwrjjGG0VZ6":["core:157:feature-line3","core:157:feature-line8"],"ZEGoryrIFmi2lrtR":["blessed:67:feature-line46"],"ZELM6DPIlQvc4Mwo":["blessed:67:feature-line15"],"ZO3hAXPIjdpbLQ3c":["blessed:64:feature-line67"],"ZYpB23WkG26CNVNX":["porygon:82:feature-line8","porygon:82:feature-line43","porygon:82:feature-line48","porygon:82:feature-line53"],"aBrvpJfpy6A3cFGt":["core:132:feature-line3"],"aG5vYZCbZSHd7B8K":["blessed:60:feature-line57"],"aOOu52tQdvU6fCaY":["blessed:70:feature-line52"],"aRfr2RkfTAUuly1f":["blessed:65:feature-line4"],"azczlbQfO5y3J7XS":["porygon:82:feature-line53"],"b0wUxNDvXPGevYZg":["blessed:62:feature-line10"],"bF0VtMjlZAT1oAhm":["blessed:50:feature-line3"],"bL7fkdXmofLXjoAn":["core:142:feature-line56"],"bPB96maA7rybMi6p":["core:179:feature-line3"],"bXVPBPJm8s9Hu68o":["blessed:56:feature-line15"],"bZX0XyXaICfBRDNq":["blessed:62:feature-line5"],"bajfkZcAu5T2Pqt7":["core:132:feature-line3"],"c0YI1VbLWES68BWg":["blessed:59:feature-line17"],"cEeEmFkD3dnBuvkv":["core:142:feature-line46"],"cFayvGpvxAF36gMG":["blessed:68:feature-line70"],"cwNWwGm254zSgX41":["blessed:59:feature-line33"],"dCwEbCxqs2FwAMjn":["blessed:68:feature-line33"],"dNlnVU6YRG77EMqV":["core:137:feature-line3"],"dQ3pQXZtBVg9vEwd":["core:79:feature-line51"],"diyUd80jHWoZ8QJO":["core:75:feature-line47"],"dyeL0hpSXSe1djBw":["core:132:feature-line66"],"ebrJeZiugZ9St5Kg":["blessed:70:feature-line42"],"effc470IUIHipz3S":["core:132:feature-line87"],"emQt7p2JFNWmlQwV":["blessed:64:feature-line79"],"epUrftwqj9U10a7C":["blessed:65:feature-line63"],"f75E3geKzoFNi6mH":["blessed:60:feature-line31"],"f9heuvlESQeh7CZA":["porygon:80:feature-line41"],"fA0hWV1NeufjEHmd":["blessed:64:feature-line71"],"fGXQ5qou9RKhRzgK":["core:164:feature-line3"],"fIEefyw8NQS7ysxI":["core:132:feature-line76"],"fTlWMdC4AT3JirzY":["blessed:55:feature-line54"],"fbiWQ19poAmcUUYX":["core:162:feature-line52"],"fvYfm45ELRcaY4a9":["core:86:feature-line10"],"fyulIO72hNLgz0Dv":["blessed:66:feature-line59"],"g2ENJ2HwILA5DJVf":["blessed:66:feature-line31"],"gF2f7DOhYUns3qYy":["blessed:66:feature-line41"],"gNrukO5IsH99832y":["blessed:60:feature-line3"],"gS0LzGf5jGGCAhVo":["core:162:feature-line61"],"gUxW2eaFQ409lkqB":["blessed:61:feature-line4"],"gVCM65BXyPAMJ8r7":["blessed:58:feature-line50","blessed:67:feature-line53"],"h0kk8W1FywL0n0V1":["core:137:feature-line3"],"h0xrKDLhLNwESAh7":["core:79:feature-line59"],"hONZq8fzK0bsTQxv":["blessed:63:feature-line68"],"hb2VBERHKbPHh1HD":["blessed:68:feature-line10"],"hfsg5vZ5J2puSg3T":["blessed:65:feature-line23"],"hgeMNpc17XOFPvCv":["blessed:66:feature-line64"],"iXMQXX1fHETK34Go":["core:186:feature-line3","core:186:feature-line8"],"j6DZ4i3eEBV0u3eG":["core:75:feature-line47"],"jAcwIHOyVjJWr0Ar":["core:150:feature-line25"],"jDbIAyrlw3PsiAoI":["blessed:68:feature-line16"]};

const printedLinks={"WNkPb84r7KpOjVsz":["f4c:frisk"],"X9qlsbeHMiKrhZ8V":["f4c:core-paralysis","f4c:feb-paralysis"],"XFRpj49uTnIIx4Xq":["f4c:burst"],"Y93mq2bUelK9iDOb":["f4c:scatter"],"Z0sGUWoQHDuC4BLf":["f4c:songs"],"ZCS1rVwrjjGG0VZ6":["f4c:dance"],"ZYpB23WkG26CNVNX":["f4c:ball-modifications"],"bF0VtMjlZAT1oAhm":["f4c:stigmata"],"bPB96maA7rybMi6p":["f4c:channel"],"bdkhDY1yYn4MPP2d":["f4c:tools"],"bxAMXMpavL2OvhlA":["f4c:ancient"],"cEcrxUTwXGjHUEHh":["f4c:fabulous","f4c:ball-modifications"],"dNlnVU6YRG77EMqV":["f4c:rad"],"diyUd80jHWoZ8QJO":["f4c:alternative"],"etrYWOU1KcUmhnOl":["f4c:core-infatuation","f4c:feb-infatuation"],"fGXQ5qou9RKhRzgK":["f4c:life","f4c:songs"],"h0kk8W1FywL0n0V1":["f4c:rough"],"iXMQXX1fHETK34Go":["f4c:augury"],"j6DZ4i3eEBV0u3eG":["f4c:double"],"jAcwIHOyVjJWr0Ar":["f4c:traceur","f4c:dune"]};

const nativeLinks={"XYexTW8Ih0QlXR1S":["H8YHTff4MxyPydws"],"gVCM65BXyPAMJ8r7":["H8YHTff4MxyPydws"]};

export function checkReferenceF4cSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F4c');
    const audit = bundle.referenceSlices?.find(a => a.slice === 'F4c');
    if (!audit) { fail(!slice.recordFile, 'F4c completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F4c record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F4c' && audit.recordKind === 'reference' && file.recordKind === 'reference' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F4c frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F4c independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.referenceReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F4c exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 84 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 94 && audit.printedDefinitions.length === 23
        && audit.parentContexts.length === 79 && audit.nativeContexts.length === 1, 'F4c bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F4c full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F4c complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F4c full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F4c exact native page/authority changed: ' + n.pageId);
    }
    const facts = referenceF4cSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && referenceF4cFactErrors(facts).length === 0, 'F4c independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + referenceF4cFactErrors(facts).join('; '));
    const proseRequirements = referenceF4cSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.independentMaxZAdaptationAuthoringEstablished === false && audit.authoringLimits.independentWholeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentSpiritFrameworkEstablished === false && audit.authoringLimits.descriptiveReferencesImplementEffects === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F4c missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F4c'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 182 && snapshots.size === audit.targetSnapshots.length, 'F4c exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, referencePageOccurrences(a?.data)), 'F4c exact current target/prior chronology changed: ' + s.identity);
    }

    fail(audit.independentUseContextSnapshots.length === 2, 'F4c complete incoming-use page census changed');
    for(const c of audit.independentUseContextSnapshots){
        const source=actualMap.get(c.sourceIdentity)?.data;
        const actual=c.contextPath==='$'?source:c.contextPath.slice(2).replaceAll('[','.').replaceAll(']','').split('.').reduce((v,k)=>v?.[k],source);
        fail(((c.sourceIdentity==='journals.cP772AChmDjr486z' && c.contextPath==='$.pages[113]' && actual?._id==='H8YHTff4MxyPydws') || (c.sourceIdentity==='feats.hRrOZUUem3uGm8hq' && c.contextPath==='$' && actual?._id==='hRrOZUUem3uGm8hq'))
            && equal(c.contextDocument,actual) && hash(actual)===c.contextJsonSha256
            && equal(c.references,referenceUuidOccurrences(actual,c.contextPath))
            && c.references.every(r=>snapshots.has(r.targetIdentity)), 'F4c actual complete incoming page/path/UUID scope changed');
    }
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F4c full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F4c literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of referenceUuidOccurrences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => referencePageOccurrences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F4c literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F4c exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.referenceSlices.find(a => a.slice === 'F4b').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F4c independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F4c full root-system inventory changed');
    fail(equal(audit.rootLabels, Object.fromEntries(slice.members.map(([id]) => [id, actualMap.get(id)?.data.name]))), 'F4c literal root-label inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F4c per-ID audit inventory changed');
    fail(closure.inScopeCandidatesExamined===83 && closure.scopeOnlyExcluded===1 && closure.normativeExaminationIncludesExcluded===false, 'F4c scope exclusion was counted as mechanical source examination');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.referenceReview;
        fail(r && e && d && doc?.type === 'reference' && r.contentHash === contentHash && e.contentHash === contentHash, 'F4c exact reference examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        if(d.scopeExclusionOnly || identity==='references.ZF71mNCnts5vWOJe') fail(isReferenceF4cScopeExclusion(bundle,r,actualMap.get(identity),hash,equal) && d.sourceDefinitionIds.length===0 && d.printedDefinitionIds.length===0 && d.parentContextIds.length===0 && d.nativeContextIds.length===0 && d.sourceFindings.normativeSourceApproval===false && d.sourceFindings.recoveryOrVariantApproval===false, 'F4c exact-ID preserved Gen9 scope proof/authority boundary changed');
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.scopeExclusionOnly ? 'excluded-generation9-reference-preserved' : d.partialTextualCorrespondence ? 'examined-reference-source-correspondence' : 'examined-reference-version-or-authority-limit')
            && (d.scopeExclusionOnly || d.partialTextualCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, referenceF4cFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === !d.scopeExclusionOnly
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata, optional playtest and explicitly labelled errata remain separate'
            && r.coverageState === (d.scopeExclusionOnly ? 'excluded' : d.partialTextualCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F4c source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F4c independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((printedLinks[shortId]??[]).every(id=>d.printedDefinitionIds.includes(id)&&audit.printedDefinitions.some(u=>u.id===id&&d.parentContextIds.includes(u.parentContextId))), 'F4c complete printed leaf/table/guidance trace changed: '+identity);
        fail(d.referenceType==='reference'&&d.interpretationKind===(d.scopeExclusionOnly?'scope-only preservation; no mechanical examination':'descriptive-source-examination; no effect semantics manufactured')&&doc.system.rules.length===0&&doc.effects.length===0&&d.prerequisitePolicy.includes('non-blocking'), 'F4c descriptive reference/type/advisory contract changed: '+identity);
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F4c per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.scopeExclusionOnly ? 'excluded' : d.sourceDefinitionIds.length || d.printedDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F4c unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F4c complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = d.scopeExclusionOnly ? 'scope-preservation-only' : ['rules','enabled','referenceEffect','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F4c actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, referenceF4cRuleRoles(doc)) && equal(e.literalReferences, referenceLiterals(doc))
            && equal(e.pageReferences, referencePageOccurrences(doc)), 'F4c complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F4c exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F4c exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) { const use=audit.independentUseContextSnapshots.find(c=>c.sourceIdentity===ref.sourceIdentity&&ref.path.startsWith(c.contextPath)); fail(use && use.references.some(r=>r.path===ref.path&&r.literalUuid===ref.literalUuid&&r.targetIdentity===identity)&&use.references.every(r=>snapshots.has(r.targetIdentity)), 'F4c page-scoped incoming use outgoing target omitted: ' + identity); }
        const claims = r.sourceComparison.currentClaims;
        fail((d.scopeExclusionOnly ? claims.length===0 : normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect))
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F4c complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'references');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F4c historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F4c finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 76, unresolved: 7, excluded: 1}) && equal(counts, closure.counts), 'F4c bounded correspondence/limit counts changed');
}
