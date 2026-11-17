// Offline reference evidence; never a runtime rule, identity or eligibility policy.
import {effectReferences as referenceUuidOccurrences,effectLiteralReferences as referenceLiterals} from './effect-source-review.mjs';
import {effectPageReferences as referencePageOccurrences} from './effect-slice-source-review.mjs';
import {priorSourceIdentities} from './source-review-order.mjs';
const MEMBERSHIP='57847bddee4e8a90aa3487a0e2558d5fca906500136343539a6223c81a4a59e6';
const SOURCE_PRIMITIVES='bfb2030f0cfe4a15cb2a8f637b225c92db5f99ad29bb96dd9b8b9efe38b98f7e',EXAMINED_DISPOSITIONS='d55803c449361c96b54b9c2b12a617d9e17d3a0cc24f20e16cf068a60b3a0314',HISTORICAL_OBSERVATIONS='b6a0c070e12e3a99628ab30d7e33a87e076eb8aded6247f1915027fa2a601785',FULL_F_RECONCILIATION='5e1701588ebcd2bbb1045459fb401d0bd54dbd0000f3fda9e82e08ac6da32e37',SIGNATURE_IMAGE='c21525a0f41b575d5875ba9f93ca02fba4c5866d9c4663081aa70d9f81aac25c';
export const referenceF4dRuleRoles=doc=>(doc?.system?.rules??[]).map((object,i)=>({path:`$.system.rules[${i}]`,object,interpretation:'Stored object only; no effect semantics inferred for a descriptive reference.'}));
export const referenceF4dSignatureColumns={left:[['Cone, Line, Burst, and Blast Moves',['Scattershot','Shock and Awe','Vicious Storm']],['Single Target Moves',['Guarding Strike','Unbalancing Blow','Reliable Attack']]],right:[['Damaging Moves',['Alternative Energy','Bloodied Speed','Double Down']],['Status Moves',['Burst of Motivation','Supreme Concentration','Double Curse']]]};
export const referenceF4dMovementChoices=['Art of Stealth','Athletic Initiative','Mounted Prowess','Nimble Movement','Slippery','Stamina','Swimmer','Wallrunner'];
export const referenceF4dTypePairs=[['Earth Ball','Grass','Ground'],['Haunt Ball','Dark','Ghost'],['Solid Ball','Rock','Steel'],['Heat Ball','Electric','Fire'],['Mystic Ball','Dragon','Psychic'],['Air Ball','Flying','Ice'],['Mold Ball','Poison','Fighting'],['Gossamer Ball','Normal','Fairy']];
export const referenceF4dSourceSpecifications=[
 ['energyBranches','printed','f4d:energy',/one full round.*?next Normal-Type attack.*?same Type as this Attack.*?already Normal-Typed.*?one step more Super-Effective/],
 ['lockHit','printed','f4d:lock',/cannot be Intercepted.*?if hits.*?Evasion still applies.*?can still Miss/],
 ['resilienceRoles','unit','blessed:56:feature-line4',/Messiah: Static Signer: Standard Action.*?Choose two Types.*?Resistance or Immunity.*?Signer Effect: Choose a single Type.*?end of the Scene.*?different Type each time/],
 ['might','printed','f4d:might',/([0-9]+) AP - Special.*?All Allies.*?\+([0-9]+).*?Damage Rolls.*?end of your next turn/,'1','5'],
 ['songsFour','printed','f4d:songs',/always affect the user.*?Sonic.*?Swift.*?same.*?Dance.*?Shift.*?Burst ([0-9]+).*?Standard.*?one Song.*?Burst ([0-9]+).*?Full.*?two Songs.*?Burst ([0-9]+)/,'2','4','4'],
 ['therian','unit','blessed:61:feature-line26',/Daily - Free Action.*?level ups or \[\+Any Stat\] tags.*?rest of the encounter.*?ended early.*?Standard Action.*?deactivates if you Faint/],
 ['hardenedThresholds','printed','f4d:hardened',/beyond the ([0-9]+)th.*?([0-9]+) or more injuries.*?\+([0-9]+).*?Critical Hit and Effect Range.*?([0-9]+) or more injuries.*?\+([0-9]+) Evasion.*?\+([0-9]+).*?Initiative.*?([0-9]+) or more injuries.*?\+([0-9]+) Damage Reduction.*?([0-9]+) or more injuries.*?Loss of Hit Points \(but not damage\).*?([0-9]+) or more injuries.*?one step further/,'5','1','1','3','1','5','5','5','7','9'],
 ['hardenedParent','unit','core:105:feature-line3',/apply Brutal Training as a Training action.*?up to three injuries.*?at least one Injury.*?Hardened/],
 ['scrying','printed','f4d:scrying',/item you are touching, or your current location.*?last ([0-9]+) hours.*?jumbled or unclear.*?GM.*?next page/,'24'],
 ['blackYin','unit','blessed:67:feature-line25',/allies within ([0-9]+) meters.*?may choose.*?movement speeds by ([0-9]+).*?evasion by ([0-9]+).*?three rounds/,'5','1','2'],
 ['salty','unit','core:132:feature-line3',/Salty Surprise Effect:.*?hit by an attack.*?([0-9]+) Temporary Hit Points.*?Salty Flavors.*?([0-9]+) Temporary Hit Points.*?dislikes Salty Food.*?Enraged/,'5','10'],
 ['heightened','unit','core:162:feature-line29',/Inner Focus Ability ([0-9]+) AP - Shift Action.*?Focus Energy as a Free Action/,'2'],
 ['totalSolitude','printed','f4d:total-solitude',/lose your Aura.*?Mindlock.*?cannot receive Aura Pulse or Telepathic.*?other than Type Ace, Channeler or Aura Guardian.*?Feats.*?refunded/],
 ['chemPain','unit','core:144:feature-line58',/Chemical Warfare.*?\$([0-9]+).*?Burn or Poison/,'50'],
 ['chemShut','unit','core:144:feature-line64',/Caustic Chemistry.*?\$([0-9]+).*?Paralysis or Sleep/,'50'],
 ['chemDisorient','unit','core:144:feature-line53',/Chemist.*?\$([0-9]+).*?Rage or Confusion/,'50'],
 ['chemEnhancers','unit','core:144:feature-line47',/Chemist.*?\$([0-9]+).*?X-Item, Dire Hit, or Guard Spec/,'100'],
 ['blazeArmor','unit','blessed:66:feature-line47',/([0-9]+) AP - Free Action, Interrupt.*?next Attack.*?Fire Type.*?melee range.*?([0-9]+\/[0-9]+)th.*?maximum HP.*?Apply weakness and resistance.*?Do not apply stats/,'2','1/8'],
 ['expandedConditional','unit','blessed:69:feature-line18',/either the Telepath or Telekinetic.*?possess both.*?Trainer Classes.*?instead.*?Godslayer/],
 ['impromptu','printed','f4d:impromptu',/([0-9]+) AP - Free Action.*?Attack of Opportunity.*?Hazard Keyword or an At-Will or EOT Frequency Status-Class Move targeting that foe instead of a Struggle Attack/,'1'],
 ['curveOrdering','printed','f4d:curve',/hit a target with a Poke Ball.*?may deal damage.*?Struggle Attack.*?before any.*?Ball's functions/],
 ['fastPitch','printed','f4d:fast',/([0-9]+) AP - Standard Action, Priority \(Advanced\).*?immediately throw a Poke Ball/,'1'],
 ['unbalancingExpiry','printed','f4d:unbalancing',/Whether.*?hits or misses.*?next time.*?Damaging Attack or one full round.*?whichever comes first/],
 ['vulnerableBase','printed','f4d:vulnerable-core',/cannot apply Evasion of any sort against attacks/],
 ['vulnerableNote','printed','f4d:vulnerable-feb',/Blinded, Sleeping, Fainted, Frozen, and Tripped.*?always considered Vulnerable/],
 ['dataCraft','unit','porygon:84:feature-line52',/Upgrader.*?build and install.*?Datajack Augmentaion.*?\$([0-9]+)/,'250'],
 ['dataStore','page','porygon:57',/Datajack Slot: n\/a Cost: \$([0-9]+) Capacity Used: ([0-9]+)/,'500','0'],
 ['callOrder','printed','f4d:call',/Instinctive Aptitude Edge.*?even if.*?do not meet.*?If you already have this Edge, gain another Edge for which you qualify.*?Combat or tense situations \(never Extended Actions\).*?spend AP.*?\+([0-9]+)d([0-9]+) instead of \+([0-9]+)/,'1','6','2'],
 ['twistedSigns','printed','f4d:twisted',/Elemental Types.*?\+([0-9]+).*?Intimidation.*?(-[0-9]+).*?Charm and Guile/,'4','-4'],
 ['negateEmotion','unit','blessed:60:feature-line35',/([0-9]+) AP - Standard Action.*?within ([0-9]+) meters.*?Enraged, Confused, and Infatuation.*?remainder of the encounter.*?Pathetic Rank.*?fifteen minutes.*?([0-9]+) hours/,'3','8','24'],
 ['tutorBands','printed','f4d:tutor',/under Level ([0-9]+).*?At-Will or EOT.*?Damage Base of ([0-9]+).*?Level ([0-9]+) to ([0-9]+).*?Scene Frequency.*?Damage Base of ([0-9]+).*?Level ([0-9]+) and above.*?no restrictions/,'20','7','20','29','9','30'],
 ['inheritance','printed','f4d:tutor',/Inheritance Moves.*?Heal Pulse.*?only Inheritance Move.*?Level ([0-9]+).*?Level ([0-9]+) slot.*?empty/,'30','20'],
 ['whiteYang','unit','blessed:67:feature-line3',/allies within ([0-9]+) meters.*?may choose.*?movement speeds by ([0-9]+).*?Attack and Special Attack.*?([0-9]+) Combat Stage.*?Accuracy by ([0-9]+).*?three rounds/,'5','2','1','2'],
 ['skySpirit','unit','blessed:63:feature-line72',/Clear as a result of Defog or Air Lock.*?five rounds.*?foes within ([0-9]+).*?Sky and Levitate.*?halved.*?Allies within ([0-9]+).*?add ([0-9]+).*?Initiative/,'10','10','10'],
 ['hypergeometryChoice','unit','blessed:69:feature-line74',/one meter greater or one meter less.*?may not.*?avoid melee.*?chosen when an action is announced and cannot be changed.*?single target attack.*?target of your choice in an adjacent square/],
 ['towerUse','unit','blessed:62:feature-line44',/([0-9]+) AP - Free Action.*?You or your Pokemon.*?Blessing Keyword.*?one additional use of the Blessing/,'1'],
 ['captureChoice','printed','f4d:capture-skills',/gain a Skill Edge for which you qualify.*?Acrobatics, Athletics, Stealth, Survival, Guile, or Perception.*?up to two times/],
 ['handymanException','printed','f4d:handyman',/item or a non-Weapon.*?Skill Check.*?Skill Rank.*?substitute Survival.*?does not affect prerequisites for Books/],
 ['hatCondition','printed','f4d:hat',/Head Equipment worth at least \$([0-9]+).*?([0-9]+) Damage Reduction against Critical Hits.*?does not stack.*?Head Equipment/,'1000','15'],
 ['wearCondition','unit','may:4:feature-line19',/Expert Survival.*?Body Equipment worth at least \$([0-9]+).*?\+([0-9]+) Damage Reduction.*?does not stack.*?Body Equipment/,'1000','5'],
 ['capCraft','printed','f4d:ammo',/Bean Cap for \$([0-9]+), a Glue Cap for \$([0-9]+), or a Net Cap for \$([0-9]+)/,'25','50','100'],
 ['capStore','page','may:6',/Cost per Cap: \$([0-9]+).*?Glue Cap.*?Cost per Cap: \$([0-9]+).*?Net Cap.*?Cost per Cap: \$([0-9]+)/,'50','100','200'],
 ['originalFlinch','printed','f4d:flinch-core',/not take actions during your next turn that round.*?does not carry over onto the next round/],
 ['optionalFlinch','printed','f4d:flinch-feb',/Upon becoming Flinched.*?Initiative by ([0-9]+).*?rest of the Scene.*?Vulnerable for ([0-9]+) full round.*?stack.*?switched out removes.*?Initiative-lowering/,'5','1'],
 ['originalSuppression','printed','f4d:suppression-core',/cannot benefit from PP Ups.*?At-Will Moves become EOT.*?EOT and Scene x([0-9]+) Moves become Scene/,'2'],
 ['optionalSuppression','printed','f4d:suppression-feb',/cannot use Moves.*?other than.*?At-Will.*?always lasts ([0-9]+) full round/,'1'],
 ['surefooted','printed','f4d:surefooted',/\+([0-9]+).*?Skill Checks.*?climb, balance, or maintain footing.*?Push and Trip.*?ignore one meter and receive one less Injury/,'2'],
 ['marsh','printed','f4d:marsh',/do not lose Hit Points from Poison.*?([0-9]+) instead of ([0-9]+) Combat Stages.*?still count as Poisoned/,'1','2'],
 ['deepDiver','printed','f4d:deep',/Swimming Capability is equal to.*?Overland Capability instead of half.*?minutes equal to.*?Survival Rank/],
 ['mindGames','printed','f4d:mind-games',/Scene x([0-9]+).*?Social keyword.*?Vulnerable for one full round.*?Rage, Suppression, Infatuation, or Confusion.*?once per Scene per foe.*?object of Infatuation is your Pokemon, regardless of gender/,'2'],
 ['escapeArtist','printed','f4d:escape',/([0-9]+) AP - Free Action.*?adjacent foe.*?Status-Class.*?cannot provoke.*?Disengage.*?once per Scene per Pokemon/,'1'],
 ['changingNature','unit','core:89:feature-line3',/loses a Tutor Point.*?either raises the same Stat.*?or lowers the same Stat/],
 ['bodyCraft','unit','porygon:84:feature-line69',/Efficient Installation.*?Medical Nanobots.*?\$([0-9]+).*?Wired Reflexes.*?\$([0-9]+)/,'1000','1500'],
 ['nanoStore','page','porygon:57',/Medical Nanobots Slot: Body Cost: \$([0-9]+) Capacity Used: ([0-9]+)/,'2000','2'],
 ['reflexStore','page','porygon:58',/Wired Reflexes Slot: Body Cost: \$([0-9]+) Capacity Used: ([0-9]+)/,'3000','3'],
 ['standardScatter','printed','f4d:signature-table',/Scattershot.*?normal range.*?([0-9]+)m, ([0-9]+) Targets/,'4','3'],
 ['currentScatter','current','uiCdtBpTenpQXxNJ',/Scattershot.*?normal range.*?([0-9]+)m, ([0-9]+) Targets/,'6','2'],
 ['standardShock','printed','f4d:signature-table',/Shock and Awe.*?-([0-9]+).*?Save Checks.*?-([0-9]+).*?Evasion.*?hit.*?misses/,'2','1'],
 ['currentShock','current','uiCdtBpTenpQXxNJ',/Shock and Awe.*?-([0-9]+).*?Save Checks.*?-([0-9]+).*?Accuracy and Evasion.*?hit.*?misses/,'3','1'],
 ['standardGuard','printed','f4d:signature-table',/Guarding Strike.*?If this Move hits.*?\+([0-9]+) Damage Reduction against the target.*?end of their next turn/,'5'],
 ['currentGuard','current','uiCdtBpTenpQXxNJ',/Guarding Strike.*?If this Move hits.*?resists.*?one step further.*?end of their next turn/],
 ['standardAlternative','printed','f4d:signature-table',/Alternative Energy.*?Switch the Class.*?Physical to Special or vice versa/],
 ['currentAlternative','current','uiCdtBpTenpQXxNJ',/Alternative Energy.*?either.*?switch the Class.*?or.*?other Defense stat/],
 ['standardDouble','printed','f4d:signature-table',/Double Down.*?Double Strike.*?only once.*?either roll.*?Damage Base of ([0-9]+) or less.*?Special-Case Damage/,'4'],
 ['currentDouble','current','uiCdtBpTenpQXxNJ',/Double Down.*?Bonus Damage equal to double its Damage Base.*?\+([0-9]+) AC/,'2'],
 ['standardBurst','printed','f4d:signature-table',/Burst of Motivation.*?any Stats with negative.*?\+([0-9]+).*?above \+([0-9]+)/,'2','0'],
 ['currentBurst','current','uiCdtBpTenpQXxNJ',/Burst of Motivation.*?reset one of its Stats with negative.*?to its default/],
 ['currentSupreme','current','uiCdtBpTenpQXxNJ',/Supreme Concentration.*?Once per scene.*?Rapid Action.*?regular Frequency/],
 ['standardDoubleCurse','printed','f4d:signature-table',/Double Curse.*?additional foe.*?1-Target Moves/],
 ['currentDoubleEffect','current','uiCdtBpTenpQXxNJ',/Double Effect.*?additional target.*?Double Curse may not.*?non-Status.*?Copycat, Sketch, or Transform/],
];
export function referenceF4dSourceFacts(audit,cleanText){
 const get={unit:id=>cleanText(audit.sourceDefinitions.find(u=>u.id===id)?.rawDefinition??''),printed:id=>cleanText(audit.printedDefinitions.find(u=>u.id===id)?.rawDefinition??''),page:id=>cleanText(audit.parentContexts.find(u=>u.id===id)?.rawText??''),current:id=>cleanText(audit.rootCurrentSystems['references.'+id]?.effect??'')};
 const root=id=>audit.rootCurrentSystems['references.'+id],move=get.printed('f4d:movement'),type=get.printed('f4d:type-mod'),table=audit.printedDefinitions.find(u=>u.id==='f4d:signature-table');
 const names=referenceF4dTypePairs.map(x=>x[0]).join('|'),pairs=[...type.matchAll(new RegExp('('+names+')[;,] ([A-Za-z]+) and ([A-Za-z]+)','g'))].map(m=>m.slice(1));
 return{observations:Object.fromEntries(referenceF4dSourceSpecifications.map(([key,kind,id,re])=>{const m=get[kind](id).match(re);return[key,{clause:m?.[0]??null,values:m?.slice(1)??[]}];})),movementChoices:move.match(/Choose one of (.*?)\. You gain/)?.[1]?.replace(', or ', ', ').split(', '),typePairs:pairs,signatureVisual:{columns:table?.visualColumnAssignments,imageSha256:table?.fullPageVisualSha256},
 currentObservations:{allRootRulesEmpty:Object.values(audit.rootCurrentSystems).every(s=>Array.isArray(s.rules)&&s.rules.length===0),allRootSystemsExactlyDescriptive:Object.values(audit.rootCurrentSystems).every(s=>Object.keys(s).join(',')==='origin,effect,snippet,rules,enabled,slug,schema,referenceEffect,source,stackSlugs,keywords'),callMalformed:/you already have this Edge, gain another Edge for which you add \+1d6 instead of \+2\. qualify\./.test(root('qdVwv0sd3S5yuB9m').effect),crGroundsource:/Groundsource/.test(root('rHM6JJFVmVOpH2kV').effect),originalNoGroundsource:!/Groundsource/.test(root('uj0ebWF0lvq4hwoL').effect),crRapid:/Once per scene.*?Rapid Action/.test(root('uiCdtBpTenpQXxNJ').effect),flinchCure:/remove the initiative penalty/.test(root('vEAaFXRF9LJskQD1').effect),suppressionException:/unless a Move or Ability specifies otherwise/.test(root('wI8sXPrUnRQj1cMz').effect),rawCurrencyPreserved:['tyBLvmG9EILHlfXA','vxmTUkt5u4r4LgEA','vyK4Gl2wIgNCNl3E'].every(id=>root(id).effect.includes('₽'))},
 sourceScope:{fullCurrentGenerationEstablished:false,independentWholeCRFrameworkEstablished:false,independentHidingFrameworkEstablished:false,independentDynamaxAdaptationAuthoringEstablished:false,missingFriendshipSpiritArtifactReplacedByBlessing:false,sourceAbsenceClaim:false},unresolvedExecution:{reproducedGameplayFailure:false,descriptiveReferenceImpliesExecutableEffects:false,actualUseAcquisitionPreservation:'not-run'}};
}
export function referenceF4dFactErrors(f){
 const errors=[];for(const[key,kind,id,re,...values]of referenceF4dSourceSpecifications){const o=f.observations[key];if(!o?.clause||JSON.stringify(o.values)!==JSON.stringify(values))errors.push(key+' source condition/quantity/role');}
 if(JSON.stringify(f.movementChoices)!==JSON.stringify(referenceF4dMovementChoices))errors.push('complete eight MovementMastery choices');
 if(JSON.stringify(f.typePairs)!==JSON.stringify(referenceF4dTypePairs))errors.push('all eight exact TypeBall pairs');
 if(JSON.stringify(f.signatureVisual.columns)!==JSON.stringify(referenceF4dSignatureColumns)||f.signatureVisual.imageSha256!==SIGNATURE_IMAGE)errors.push('source-backed four-box twelve-entry Signature layout');
 if(Object.values(f.currentObservations).some(x=>x!==true))errors.push('literal current shape/omission/variant/raw-symbol fields');
 if(Object.values(f.sourceScope).some(Boolean))errors.push('source/identity/absent-authoring promoted');
 if(f.unresolvedExecution.reproducedGameplayFailure!==false||f.unresolvedExecution.descriptiveReferenceImpliesExecutableEffects!==false||f.unresolvedExecution.actualUseAcquisitionPreservation!=='not-run')errors.push('descriptive review promoted to behavior');return errors;
}
export const referenceF4dFindings=(identity,facts)=>({role:'Complete source clauses and current descriptive fields retain exact per-reference source links; no canonical, executable, whole-version or generation approval.',sourceScope:facts.sourceScope,actualUse:'not-run',fullCurrentVersionEstablished:false});
export function referenceF4dFullFReconciliation(bundle,hash){
 const f=bundle.batchManifest.batches.find(b=>b.id==='F'),all=[],slices=[];
 for(const s of f.slices){
  const recordFile=s.recordFile??(s.id==='F4d'?'record-source-review/references-d.json':null),file=bundle.files[recordFile],records=file?.records??[],expected=new Map(s.members);
  const evidence=s.id==='F1'?bundle.effectSource:s.id==='F2'?bundle.temporarySpeciesSource:s.id.startsWith('F3')?bundle.effectSlices.find(a=>a.slice===s.id):bundle.referenceSlices.find(a=>a.slice===s.id);
  const evidenceFile=s.id==='F1'?'effect-source-evidence.json':s.id==='F2'?'temporary-species-source-evidence.json':`${s.id.startsWith('F3')?'effect':'reference'}-source-evidence-${s.id.toLowerCase()}.json`;
  const counts={};for(const r of records){counts[r.coverageState]=(counts[r.coverageState]??0)+1;all.push({...r,recordFile});}
  slices.push({slice:s.id,records:s.records,membershipSha256:s.membershipSha256,recordFile,sourceEvidenceFile:evidenceFile,recordSemanticSha256:file?hash(file):null,sourceEvidenceBinding:s.id==='F4d'?{kind:'own-source-primitives-and-dispositions',sourcePrimitivesSemanticSha256:evidence?.closure?.sourcePrimitivesSemanticSha256,examinedDispositionsSemanticSha256:evidence?.closure?.examinedDispositionsSemanticSha256}:{kind:'preserved-whole-earlier-audit',semanticSha256:evidence?hash(evidence):null},counts,exactFrozenTupleCoverage:records.length===s.members.length&&new Set(records.map(r=>r.identity)).size===s.members.length&&records.every(r=>expected.get(r.identity)===r.contentHash),sourceOnly:records.every(r=>r.behavioralVerification==='not-run'&&r.productionPolicyPromotion===false)});
 }
 const seen=new Map(all.map(r=>[r.identity,r])),counts={};for(const r of all)counts[r.coverageState]=(counts[r.coverageState]??0)+1;
 return{fullFMembershipSha256:f.membershipSha256,fullFTuplesSemanticSha256:hash(f.members),diagnosticSha256:bundle.batchManifest.candidateSnapshot.sha256,sourceFingerprint:bundle.index.sourceFingerprint,slices,recordDispositions:all.length,distinctIdentities:seen.size,counts,unexaminedFrozenTuples:f.members.filter(([id,h])=>seen.get(id)?.contentHash!==h),unassignedDispositions:all.filter(r=>!f.members.some(([id,h])=>id===r.identity&&h===r.contentHash)).map(r=>r.identity),nonexcludedSourceExaminations:all.filter(r=>r.coverageState!=='excluded').length,scopeOnlyExclusions:all.filter(r=>r.coverageState==='excluded').map(r=>({identity:r.identity,contentHash:r.contentHash,recordFile:r.recordFile,scopeProofSemanticSha256:hash(r.generationReview?.scopeExclusionEvidence??null),mechanicalSourceExaminationPerformed:r.sourceComparison.referenceReview.mechanicalSourceExaminationPerformed})),fullFAcceptance:false,pendingIndependentF4dAndPlannerAcceptance:true,supportedContentCountEstablished:false,productionPolicyPromotion:false,behavioralVerification:'not-run',laterBatches:bundle.batchManifest.batches.filter(b=>['G','H'].includes(b.id)).map(b=>({id:b.id,count:b.count,membershipSha256:b.membershipSha256,status:b.status}))};
}
export function referenceF4dSemanticRequirements(){return{
 kXk71c22c1v9bpYK:[/INDEPENDENT PTU AUTHORING\/VERSION LIMIT/,/NOT AUTHORING THIS FRAMEWORK/,/not absence/],qdVwv0sd3S5yuB9m:[/CURRENT PARAGRAPH IS MALFORMED\/REORDERED/,/SOURCE IS AVAILABLE AND VISUALLY READ/,/NOT EXTENDED/],rCa00HrkeLnLKduK:[/INDEPENDENT HIDING FRAMEWORK AUTHORITY LIMIT/,/SMALL4\/MEDIUM2\/LARGE1\/HUGE-GIGANTIC0/,/DO NOT AUTHOR THIS WHOLE CURRENT FRAMEWORK/i],rHM6JJFVmVOpH2kV:[/ADDS5DR AGAINST RAW GROUNDSOURCE/,/UNESTABLISHED IN COMPLETE ORIGINAL/,/WORKS EVERYWHERE/],uiCdtBpTenpQXxNJ:[/12ENTRIES/,/ALL FOUR BOXES\/THREE EACH/,/Three equal leaves/,/Two actual histories say SupremeSWIFT, currentRAPID/],vEAaFXRF9LJskQD1:[/EXTRA CURE CLAUSE IS NOT ESTABLISHED/,/ORIGINAL CORE247/,/OPTIONAL FEB2/],wI8sXPrUnRQj1cMz:[/HAS NO PRINTED EXCEPTION TAIL/,/ORIGINAL CORE247/,/ATWILL TO EOT/],
 jIYS6tXrR8hNWfyB:[/FOR ONE FULL ROUND NEXT NORMAL ATTACK TO HIT TARGET USES LINKED ATTACK TYPE/,/ONE STEP MORE EFFECTIVE/],pXORMX2fcGpdZkXD:[/EVASION STILL APPLIES AND MOVE CAN MISS/],kKTs3eOXh8g9NAUY:[/SEVEN COMPLETE BENEFITS/,/HPLOSS IMMUNITY NOT DAMAGE/],pSdnrBtUUHsNctFZ:[/ONLY OPTIONAL FEB2 ADDITION NOTE/,/BASELINE CANNOT APPLY EVASION OF ANY SORT/],riOUpWnJCLgBCJR8:[/COMPLETE OPTIONAL SEPTEMBER9 SOURCE IS AVAILABLE/,/UNDER20 ATWILL\/EOT MAXDB7,20-29 UPTO SCENE\/MAXDB9,30PLUS UNRESTRICTED/,/not a Feature\/Edge acquisition veto/],r2nUvK0BRQuBP08O:[/ALL FOUR HISTORIES SAY INTIMIDATION/,/CURRENT SAYS INTIMIDATE/,/CHARM-4\/GUILE-4/],ogD5CmhDaYoamUOK:[/DISTINCT THROHS81/,/not canonical\/counterpart identity/],jN3tF0axWjHQ3BNs:[/DISTINCT CORE127/,/INDIVIDUAL DICE SHOWING1/],wHQXfH4e6Wkef3Xi:[/DISTINCT PERFORMANCE ENHANCERS/,/4900/],pmH0X5jWdzgo3dQC:[/STORE PRICE500\/CAPACITY0/,/separate roles/],zFN2psnsbSBIeGrm:[/Porygon57-58 ARE2000\/3000/,/no price conflict/],vyK4Gl2wIgNCNl3E:[/CRAFT BEAN25\/GLUE50\/NET100/,/PURCHASE50\/100\/200/],pRR274fhDlaJ3Wgn:[/DAMAGING HIT OR ONE FULL ROUND WHICHEVER FIRST/,/current CR table omits/],uj0ebWF0lvq4hwoL:[/NO ADDED GROUNDSOURCE DR5/,/WORKS EVERYWHERE/],tFzKx65JSmLERPOe:[/CHOSEN WHEN ACTION ANNOUNCED/,/CANNOT SWITCH TO AVOID MELEE/],mlvWV2f3Jzmkffs2:[/ONLY IF BOTH ALREADY FROM THEIR RESPECTIVE TRAINER CLASSES/],n5aAKVDki8xdC73D:[/APPLY WEAKNESS\/RESISTANCE NOT STATS/],ykWKbombKUYBiDw7:[/ONE OF FOUR EXISTING VOLATILES/,/ONCE SCENE PER FOE/],vidEsN1cH2BY5wYI:[/ONCE SCENE PER POKEMON/],yrRxcxnjaO97zKaX:[/EITHER RAISE SAME STAT OR LOWER SAME STAT/,/not both or unrestricted/],
 };}

const sourceLinks={"jIYS6tXrR8hNWfyB":["throhs:54:feature-line11","throhs:54:feature-line19","throhs:54:feature-line33"],"jN3tF0axWjHQ3BNs":["blessed:59:feature-line73"],"jSN6wAIauThvSDcg":["blessed:56:feature-line4"],"jjOGxMxotrLRI4YS":["core:164:feature-line3"],"jn6nfKxXCLvrDbrW":["blessed:61:feature-line26"],"kKTs3eOXh8g9NAUY":["core:105:feature-line3"],"kTxUvwMNYtPNBPXQ":["core:186:feature-line3","core:186:feature-line8"],"kZaLwooF8RksrUnO":["blessed:67:feature-line25"],"kvCKnSCT1fmxIFkT":["core:75:feature-line47"],"l2V3D7HeGsmlbN1G":["core:132:feature-line3"],"l6ZVFM1TXORJEJ4A":["blessed:58:feature-line70"],"l7AHefBzQJp3M5hL":["core:132:feature-line3"],"lAr7bo65XLQyiSik":["blessed:63:feature-line37"],"lBXnwUXQFvNkPmbw":["core:162:feature-line29"],"lDJoJoK53OrNIq1S":["blessed:69:feature-line70"],"lPhSLhsRp70tq2P7":["blessed:50:feature-line3"],"lX3SCsKYZDmtKd9S":["blessed:63:feature-line28"],"m4bcj46XVLE9vm02":["core:144:feature-line58"],"m5Khn0gtG06AQXd5":["blessed:62:feature-line51"],"mNjw5QDbvlFnzTTi":["core:138:feature-line45"],"mU2KYq8NHPCkTQaO":["core:144:feature-line64"],"mlvWV2f3Jzmkffs2":["blessed:69:feature-line18"],"n5aAKVDki8xdC73D":["blessed:66:feature-line47"],"nQJYcZ6sOs4qqhsM":["core:108:feature-line3"],"ogD5CmhDaYoamUOK":["blessed:63:feature-line13"],"p5jKDbfz4h9Hwdnn":["blessed:63:feature-line45"],"pF9d51sOl0U4HNgm":["core:144:feature-line47","core:144:feature-line53","core:144:feature-line58","core:144:feature-line64"],"pRR274fhDlaJ3Wgn":["core:75:feature-line47"],"pXORMX2fcGpdZkXD":["throhs:54:feature-line11","throhs:54:feature-line19","throhs:54:feature-line33"],"pmH0X5jWdzgo3dQC":["porygon:84:feature-line52"],"puhMrcKwed0nEl9Q":["core:144:feature-line53"],"qUYQCIe07uydVwXO":["blessed:70:feature-line11"],"qWz1Re2Hy51kPz7H":["core:141:feature-line9"],"r2nUvK0BRQuBP08O":["blessed:50:feature-line3"],"r8efxgDT5q0CZLXz":["blessed:60:feature-line35"],"rHM6JJFVmVOpH2kV":["core:150:feature-line25"],"rcTXpzkdOt05xMee":["core:138:feature-line40"],"riOUpWnJCLgBCJR8":["core:88:feature-line3","core:88:feature-line29","core:88:feature-line35","core:134:feature-line24"],"sD6L6Jg4iUWGUSjx":["blessed:67:feature-line3"],"sRBBQxOkIJXfOmFy":["blessed:63:feature-line72"],"t9m4Sty2XqVzSiGR":["blessed:62:feature-line73"],"tFzKx65JSmLERPOe":["blessed:69:feature-line74"],"tW7bWyoC9rHCya81":["blessed:65:feature-line32"],"taJP7wa952HRx994":["blessed:62:feature-line44"],"tpImQdy5uwR1awPk":["blessed:61:feature-line41"],"txJ6b2xxHd4T86XJ":["blessed:69:feature-line62"],"u6K024lCbAhpMEqo":["blessed:69:feature-line37"],"uBGT5tVIP6FmkqfT":["blessed:68:feature-line3"],"uBnUdTTsmxetAcG0":["blessed:63:feature-line41"],"uiCdtBpTenpQXxNJ":["core:75:feature-line47"],"uj0ebWF0lvq4hwoL":["core:150:feature-line25"],"upHmZLokRIl9ndw4":["blessed:69:feature-line12"],"uvvZ0SWG8w5u9a87":["core:75:feature-line47"],"v1Hvm4Sa0jXfC2M7":["blessed:64:feature-line34"],"vWq4j2VP5KxiWj6J":["blessed:71:feature-line12"],"vb3qz2gYOTRFyFkW":["porygon:82:feature-line43","porygon:82:feature-line48","porygon:82:feature-line53"],"vi31VfAbslN6mNxc":["blessed:68:feature-line56"],"vidEsN1cH2BY5wYI":["core:108:feature-line3"],"vxmTUkt5u4r4LgEA":["may:4:feature-line19"],"vyK4Gl2wIgNCNl3E":["may:5:feature-line45"],"wHQXfH4e6Wkef3Xi":["core:144:feature-line47"],"wRM11yRmSn0YL3Gh":["blessed:64:feature-line20"],"wb2XxEQFxcGTdlWi":["core:150:feature-line25"],"xJWDjzqPAL4mjKeS":["core:138:feature-line50"],"xkXxcXyUz3OZqdLP":["blessed:61:feature-line13"],"xtcVo6X8K375j7Cf":["core:150:feature-line25"],"ykWKbombKUYBiDw7":["core:108:feature-line3"],"yrRxcxnjaO97zKaX":["core:89:feature-line3"],"zFN2psnsbSBIeGrm":["porygon:84:feature-line69"]};

const printedLinks={"jIYS6tXrR8hNWfyB":["f4d:energy"],"jjOGxMxotrLRI4YS":["f4d:might","f4d:songs"],"kKTs3eOXh8g9NAUY":["f4d:hardened"],"kTxUvwMNYtPNBPXQ":["f4d:scrying"],"kvCKnSCT1fmxIFkT":["f4d:vicious","f4d:signature-table"],"lPhSLhsRp70tq2P7":["f4d:total-solitude"],"nQJYcZ6sOs4qqhsM":["f4d:impromptu"],"oCbNYdXL9EM5YyXo":["f4d:curve"],"pJLz9aGZzPMhMMZd":["f4d:fast"],"pRR274fhDlaJ3Wgn":["f4d:unbalancing","f4d:signature-table"],"pSdnrBtUUHsNctFZ":["f4d:vulnerable-core","f4d:vulnerable-feb"],"pXORMX2fcGpdZkXD":["f4d:lock"],"qdVwv0sd3S5yuB9m":["f4d:call"],"r2nUvK0BRQuBP08O":["f4d:twisted"],"rHM6JJFVmVOpH2kV":["f4d:surefooted"],"riOUpWnJCLgBCJR8":["f4d:tutor"],"t5X8rqL9tPVk8SWD":["f4d:handyman"],"tdhGpjXjYnFGsg5r":["f4d:capture-skills"],"tyBLvmG9EILHlfXA":["f4d:hat"],"uh9UnhtFBk0zm7I2":["f4d:type-mod"],"uiCdtBpTenpQXxNJ":["f4d:signature-table"],"uj0ebWF0lvq4hwoL":["f4d:surefooted"],"uvvZ0SWG8w5u9a87":["f4d:supreme","f4d:signature-table"],"vEAaFXRF9LJskQD1":["f4d:flinch-core","f4d:flinch-feb"],"vTluGGX2UcIVjpV8":["f4d:eye"],"vidEsN1cH2BY5wYI":["f4d:escape"],"vxTIOSmVaQEzI7JO":["f4d:movement"],"vyK4Gl2wIgNCNl3E":["f4d:ammo"],"wI8sXPrUnRQj1cMz":["f4d:suppression-core","f4d:suppression-feb"],"wb2XxEQFxcGTdlWi":["f4d:marsh"],"xtcVo6X8K375j7Cf":["f4d:deep"],"ykWKbombKUYBiDw7":["f4d:mind-games"]};

const nativeLinks={};

export function checkReferenceF4dSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, cleanText, normalizedText, citations} = context;
    const batch = bundle.batchManifest.batches.find(b => b.id === 'F'), slice = batch.slices.find(s => s.id === 'F4d');
    const audit = bundle.referenceSlices?.find(a => a.slice === 'F4d');
    if (!audit) { fail(!slice.recordFile, 'F4d completed slice missing independent source audit'); return; }
    const file = bundle.files[slice.recordFile];
    if (!file) { fail(false, 'F4d record file missing'); return; }
    const closure = audit.closure;
    fail(audit.batch === 'F' && audit.slice === 'F4d' && audit.recordKind === 'reference' && file.recordKind === 'reference' && audit.membershipSha256 === MEMBERSHIP && slice.membershipSha256 === MEMBERSHIP
        && audit.fullFMembershipSha256 === batch.membershipSha256 && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256
        && audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.sourceAbsenceClaim === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'F4d frozen/source-only boundary changed');
    const primitives = Object.fromEntries(['sourceDefinitions', 'printedDefinitions', 'parentContexts', 'nativeContexts', 'sourceUnitRoles'].map(k => [k, audit[k]]));
    fail(hash(primitives) === SOURCE_PRIMITIVES && closure.sourcePrimitivesSemanticSha256 === SOURCE_PRIMITIVES, 'F4d independently examined complete source primitives changed');
    const dispositions = file.records.map(r => ({identity: r.identity, contentHash: r.contentHash, coverageState: r.coverageState,
        generationReview: r.generationReview, examination: r.sourceComparison.referenceReview}));
    fail(hash(dispositions) === EXAMINED_DISPOSITIONS && closure.examinedDispositionsSemanticSha256 === EXAMINED_DISPOSITIONS, 'F4d exact-ID examined source/version dispositions changed');
    fail(hash(file) === closure.recordEvidenceSemanticSha256 && closure.records === 83 && closure.sourceExaminationComplete === true
        && closure.fullFAcceptance === false && audit.sourceDefinitions.length === 87 && audit.printedDefinitions.length === 35
        && audit.parentContexts.length === 92 && audit.nativeContexts.length === 0, 'F4d bounded closure/context census changed');
    const units = new Map(audit.sourceDefinitions.map(u => [u.id, u])), parents = new Map(audit.parentContexts.map(p => [p.id, p]));
    for (const p of parents.values()) { citations(p); fail(textHash(p.rawText) === p.rawSha256, 'F4d full source parent changed: ' + p.id); }
    for (const u of units.values()) {
        const original = u.collection.split('.').reduce((v, k) => v?.[k], bundle[u.namespace])?.find(v => v.id === u.id);
        fail(original && equal(original, u.completeSourceUnit) && hash(original) === u.sourceUnitSemanticSha256
            && (!u.rawDefinition || textHash(u.rawDefinition) === u.rawSha256 && u.rawSha256 === (original.rawDefinitionSha256 ?? original.rawSha256))
            && u.parentContextIds.every(id => parents.has(id)) && u.canonicalRelationshipClaim === false
            && u.productionPolicyPromotion === false && u.behavioralVerification === 'not-run', 'F4d complete reused source unit changed: ' + u.id);
    }
    for (const u of audit.printedDefinitions) {
        const p = parents.get(u.parentContextId);
        fail(p && p.rawText.split('\n').slice(u.startLine - 1, u.endLine).join('\n').trimEnd() === u.rawDefinition
            && textHash(u.rawDefinition) === u.rawSha256 && u.canonicalRelationshipClaim === false && u.productionPolicyPromotion === false
            && u.behavioralVerification === 'not-run', 'F4d full printed definition/boundary changed: ' + u.id);
    }
    for (const n of audit.nativeContexts) {
        const j = actualMap.get(n.journalIdentity), p = j?.data.pages?.find(p => p._id === n.pageId);
        fail(j?.contentHash === n.journalContentHash && p && hash(p) === n.pageJsonSha256 && p.text.content === n.rawText
            && n.independentAuthoringClaim === false && n.productionPolicyPromotion === false && n.behavioralVerification === 'not-run', 'F4d exact native page/authority changed: ' + n.pageId);
    }
    const facts = referenceF4dSourceFacts(audit, cleanText);
    fail(equal(facts, audit.sourceFacts) && referenceF4dFactErrors(facts).length === 0, 'F4d independent signed/recipient/trigger/timing/typed-unit source facts changed: ' + referenceF4dFactErrors(facts).join('; '));
    const proseRequirements = referenceF4dSemanticRequirements(facts);
    fail(audit.authoringLimits.actualAcquisitionAndPreservation === 'not-run' && audit.authoringLimits.runtimeVariantFrameworkImplemented === false
        && audit.authoringLimits.independentHidingFrameworkEstablished === false && audit.authoringLimits.independentDynamaxAdaptationAuthoringEstablished === false && audit.authoringLimits.independentWholeCurrentCRFrameworkEstablished === false && audit.authoringLimits.independentSpiritFrameworkEstablished === false && audit.authoringLimits.descriptiveReferencesImplementEffects === false
        && audit.authoringLimits.nameBasedGenerationClassification === false && audit.authoringLimits.foundationAssessment.startsWith('No actual supported acquisition'), 'F4d missing authoring/unrun foundation promoted');
    const priorIds = priorSourceIdentities(bundle.batchManifest, 'F', 'F4d'), snapshots = new Map(audit.targetSnapshots.map(s => [s.identity, s]));
    fail(snapshots.size === 0 && snapshots.size === audit.targetSnapshots.length, 'F4d exact target inventory changed');
    for (const s of snapshots.values()) {
        const a = actualMap.get(s.identity), prior = priorIds.has(s.identity) ? rows.get(s.identity) ?? null : null;
        fail(s.contentHash === (a?.contentHash ?? null) && equal(s.document, a?.data ?? null) && equal(s.priorSourceReview, prior)
            && s.priorReviewSemanticSha256 === (prior ? hash(prior) : null) && equal(s.pageReferences, referencePageOccurrences(a?.data)), 'F4d exact current target/prior chronology changed: ' + s.identity);
    }

    fail(audit.independentUseContextSnapshots.length === 0, 'F4d complete incoming-use page census changed');
    for(const c of audit.independentUseContextSnapshots){
        const source=actualMap.get(c.sourceIdentity)?.data;
        const actual=c.contextPath.slice(2).replaceAll('[','.').replaceAll(']','').split('.').reduce((v,k)=>v?.[k],source);
        fail(c.sourceIdentity==='journals.cP772AChmDjr486z' && c.contextPath==='$.pages[113]' && actual?._id==='H8YHTff4MxyPydws'
            && equal(c.contextDocument,actual) && hash(actual)===c.contextJsonSha256
            && equal(c.references,referenceUuidOccurrences(actual,c.contextPath))
            && c.references.every(r=>snapshots.has(r.targetIdentity)), 'F4d actual complete incoming page/path/UUID scope changed');
    }
    const embeds = [];
    for (const n of audit.nativeContexts) for (const m of n.rawText.matchAll(/@Embed\[\.([A-Za-z0-9]+)(?:[^\]]*)\]/g)) {
        const p = actualMap.get(n.journalIdentity)?.data.pages?.find(p => p._id === m[1]);
        embeds.push({journalIdentity:n.journalIdentity,sourcePageId:n.pageId,literal:m[0],targetPageId:m[1],targetPageJsonSha256:p ? hash(p) : null,authorityLimit:'Literal context-only resolution; no H closure or production/source promotion.'});
        fail(p && audit.nativeContexts.some(n => n.journalIdentity === embeds.at(-1).journalIdentity && n.pageId === m[1]), 'F4d full relative embedded native context missing');
    }
    fail(embeds.length === 0 && equal(embeds, audit.nativeContextEmbeds), 'F4d literal relative native embed/page-ID/hash changed');
    const incoming = new Map(slice.members.map(([id]) => [id, []]));
    for (const [sourceIdentity, a] of actualMap) for (const ref of referenceUuidOccurrences(a.data)) incoming.get(ref.targetIdentity)?.push({sourceIdentity, sourceContentHash: a.contentHash, ...ref});
    const allPages = [...slice.members.flatMap(([id]) => referencePageOccurrences(actualMap.get(id)?.data)), ...audit.targetSnapshots.flatMap(s => s.pageReferences)];
    fail(equal([...new Set(allPages.map(r => `${r.journalIdentity}.${r.pageId}`))], audit.pageTargets.map(p => `${p.journalIdentity}.${p.pageId}`)), 'F4d literal page-target inventory changed');
    for (const p of audit.pageTargets) {
        const actual = actualMap.get(p.journalIdentity)?.data.pages?.find(a => a._id === p.pageId) ?? null;
        fail(p.pageFound === (actual !== null) && p.pageJsonSha256 === (actual ? hash(actual) : null) && equal(p.pageDocument, actual), 'F4d exact page-ID/hash changed');
    }
    fail(equal(audit.historicalExports, bundle.referenceSlices.find(a => a.slice === 'F4c').historicalExports)
        && hash(Object.entries(audit.currentRecordAudit).map(([identity, e]) => ({identity, exportLineage: e.exportLineage}))) === HISTORICAL_OBSERVATIONS,
    'F4d independently captured same-ID history/provenance changed');
    const order = list => [...list].sort((a, b) => `${a.sourceIdentity}:${a.path}:${a.literalUuid}`.localeCompare(`${b.sourceIdentity}:${b.path}:${b.literalUuid}`));
    fail(equal(Object.keys(audit.rootCurrentSystems), slice.members.map(([id]) => id)), 'F4d full root-system inventory changed');
    fail(equal(audit.rootLabels, Object.fromEntries(slice.members.map(([id]) => [id, actualMap.get(id)?.data.name]))), 'F4d literal root-label inventory changed');
    fail(equal(Object.keys(audit.currentRecordAudit), slice.members.map(([id]) => id)), 'F4d per-ID audit inventory changed');
    const full=referenceF4dFullFReconciliation(bundle,hash);
    fail(equal(full,audit.fullFReconciliation) && hash(full)===FULL_F_RECONCILIATION, 'F4d full frozen F939 tuple/source-evidence reconciliation changed');
    fail(full.recordDispositions===939 && full.distinctIdentities===939 && full.slices.length===14 && full.slices.every(s=>s.exactFrozenTupleCoverage&&s.sourceOnly)
        && full.unexaminedFrozenTuples.length===0 && full.unassignedDispositions.length===0 && equal(full.counts,{reviewed:564,unresolved:374,excluded:1})
        && full.nonexcludedSourceExaminations===938 && full.scopeOnlyExclusions.length===1 && full.scopeOnlyExclusions[0].identity==='references.ZF71mNCnts5vWOJe'
        && full.scopeOnlyExclusions[0].mechanicalSourceExaminationPerformed===false && full.fullFAcceptance===false && full.pendingIndependentF4dAndPlannerAcceptance===true
        && full.supportedContentCountEstablished===false && full.behavioralVerification==='not-run' && full.productionPolicyPromotion===false
        && full.laterBatches.every(b=>b.status==='not-started') && full.laterBatches.reduce((n,b)=>n+b.count,0)===247, 'F4d full-F readiness became acceptance, supported approval or later work');
    const counts = {};
    for (const [identity, contentHash] of slice.members) {
        const r = rows.get(identity), e = audit.currentRecordAudit[identity], doc = actualMap.get(identity)?.data, d = r?.sourceComparison?.referenceReview;
        fail(r && e && d && doc?.type === 'reference' && r.contentHash === contentHash && e.contentHash === contentHash, 'F4d exact reference examination missing: ' + identity);
        if (!r || !e || !d || !doc) continue;
        counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
        fail(hash(r) === e.dispositionEvidenceSha256 && hash(d) === e.examinationSha256 && r.ruleVersionReview.basis === d.specificAssessment
            && r.behavioralVerification === 'not-run' && r.productionPolicyPromotion === false
            && r.recordClass === (d.partialTextualCorrespondence ? 'examined-reference-source-correspondence' : 'examined-reference-version-or-authority-limit')
            && (d.partialTextualCorrespondence || r.missingEvidence?.neededArtifact === d.specificAssessment)
            && d.sourceDefinitionIds.every(id => units.has(id) || audit.printedDefinitions.some(u => u.id === id)) && d.parentContextIds.every(id => parents.has(id))
            && d.nativeContextIds.every(id => audit.nativeContexts.some(n => n.pageId === id)) && d.specificAssessment.length > 250
            && equal(d.sourceFindings, referenceF4dFindings(identity, facts)) && d.completeCurrentGenerationEstablished === false
            && d.canonicalRelationshipClaim === false && d.sourceAbsenceClaim === false && d.fieldCorrespondenceOnly === true
            && d.actualAcquisitionPreservationAndGameplay === 'not-run' && d.selectedVersionStatus === 'not-verified; original/non-errata, optional playtest and explicitly labelled errata remain separate'
            && r.coverageState === (d.partialTextualCorrespondence ? 'reviewed' : 'unresolved') && r.sourceComparison.sourceAbsenceClaim === false,
        'F4d source-derived assessment/version/scope limits changed: ' + identity);
        fail((proseRequirements[identity.split('.')[1]] ?? []).every(re => re.test(d.specificAssessment)), 'F4d independent source-semantic prose clause changed: ' + identity);
        const shortId = identity.split('.')[1];
        fail((printedLinks[shortId]??[]).every(id=>d.printedDefinitionIds.includes(id)&&audit.printedDefinitions.some(u=>u.id===id&&d.parentContextIds.includes(u.parentContextId))), 'F4d complete printed leaf/table/guidance trace changed: '+identity);
        fail(d.referenceType==='reference'&&d.interpretationKind==='descriptive-source-examination; no effect semantics manufactured'&&doc.system.rules.length===0&&doc.effects.length===0&&d.prerequisitePolicy.includes('non-blocking'), 'F4d descriptive reference/type/advisory contract changed: '+identity);
        fail((sourceLinks[shortId] ?? []).every(id => d.sourceDefinitionIds.includes(id)
            && units.get(id)?.parentContextIds.every(id => d.parentContextIds.includes(id)))
            && (!nativeLinks[shortId] || nativeLinks[shortId].every(id => d.nativeContextIds.includes(id))), 'F4d per-ID complete source/parent/native trace changed: ' + identity);
        fail(r.generationReview.status === d.generationEvidenceStatus && d.generationEvidenceStatus === (d.sourceDefinitionIds.length || d.printedDefinitionIds.length ? 'partially-supported' : 'unavailable') && d.completeCurrentGenerationEstablished === false, 'F4d unestablished generation cannot be promoted by names: ' + identity);

        fail(equal(d.currentOtherFields, Object.fromEntries(Object.entries(doc).filter(([k]) => !['system', 'effects'].includes(k))))
            && equal(r.sourceComparison.fields, r.fieldReview)
            && equal(audit.rootCurrentSystems[identity], doc.system) && hash(doc.system) === e.currentSystemSha256 && hash(doc.effects ?? []) === e.currentEffectsSha256
            && equal(Object.keys(doc.system), e.currentSystemFieldKeys) && equal(r.fieldReview.map(f => f.recordFieldPath), [...Object.keys(doc.system).map(k => `system.${k}`), 'effects']), 'F4d complete current fields changed: ' + identity);
        for (const f of r.fieldReview) { const value = f.recordFieldPath.split('.').reduce((v, k) => v?.[k], doc) ?? null;
            const field = f.recordFieldPath.replace(/^system\./, '');
            const status = ['rules','enabled','referenceEffect','effects'].includes(field) ? 'implementation-data-not-behavior-certified' : 'exact-current-field-retained';
            fail(equal(value, f.recordValue) && hash(value) === f.recordJsonSha256 && f.status === status, 'F4d actual field/hash/status disagreement: ' + identity + ' ' + f.recordFieldPath); }
        fail(equal(e.currentRules, doc.system.rules.map((object, i) => ({path: `$.system.rules[${i}]`, object, jsonSha256: hash(object)})))
            && equal(e.typedCurrentRoles, referenceF4dRuleRoles(doc)) && equal(e.literalReferences, referenceLiterals(doc))
            && equal(e.pageReferences, referencePageOccurrences(doc)), 'F4d complete current rule/role/literal/page suffix changed: ' + identity);
        fail(equal(e.references.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(doc))
            && equal(order(e.incomingReferences), order(incoming.get(identity))) && e.incomingReferences.every(r => snapshots.has(r.sourceIdentity)), 'F4d exact outgoing/incoming path changed: ' + identity);
        for (const ref of e.references) fail(snapshots.has(ref.targetIdentity) && ref.targetContentHash === (actualMap.get(ref.targetIdentity)?.contentHash ?? null)
            && equal(ref.nestedReferences.map(({path, literalUuid, targetIdentity}) => ({path, literalUuid, targetIdentity})), referenceUuidOccurrences(actualMap.get(ref.targetIdentity)?.data))
            && ref.nestedReferences.every(r => snapshots.has(r.targetIdentity) && r.targetContentHash === (actualMap.get(r.targetIdentity)?.contentHash ?? null)), 'F4d exact nested reference changed: ' + identity);
        for (const ref of e.incomingReferences) { const use=audit.independentUseContextSnapshots.find(c=>c.sourceIdentity===ref.sourceIdentity&&ref.path.startsWith(c.contextPath)); fail(use && use.references.some(r=>r.path===ref.path&&r.literalUuid===ref.literalUuid&&r.targetIdentity===identity)&&use.references.every(r=>snapshots.has(r.targetIdentity)), 'F4d page-scoped incoming use outgoing target omitted: ' + identity); }
        const claims = r.sourceComparison.currentClaims;
        fail(normalizedText(claims.map(c => c.text).join(' ')) === normalizedText(doc.system.effect)
            && claims.every(c => c.normalizedSha256 === textHash(normalizedText(c.text)) && equal(c.numericTokens, c.text.match(/[+-]?\d+(?:\/\d+|d\d+)?%?/g) ?? [])), 'F4d complete current text/numeric claims changed: ' + identity);
        fail(e.exportLineage.snapshots.length === 4 && e.exportLineage.snapshots.every((s, i) => {
            const h = audit.historicalExports[i], pack = h.packs.find(p => p.pack === 'references');
            return s.revision === h.revision && s.packTree === pack.tree && s.extraction === pack.extraction && s.sourceRecords === pack.sourceRecords
                && (!s.recordFound || s.sameStableId === true && Array.isArray(s.fieldComparisons)
                    && Object.keys(doc.system).every(k => s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.currentJsonSha256 === hash(doc.system[k])))
                    && Object.entries(s.historicalNormativeValues ?? {}).every(([k, v]) => Array.isArray(s.fieldComparisons)
                        && s.fieldComparisons.some(f => f.recordFieldPath === `system.${k}` && f.historicalJsonSha256 === hash(v))));
        }), 'F4d historical field/omission changed: ' + identity);
        fail(e.finiteSourceSearch.pdfPagesConsidered === 2652 && e.finiteSourceSearch.nativePagesConsidered === 271
            && e.finiteSourceSearch.queriesForDiscoveryOnly.length && e.finiteSourceSearch.sourceAbsenceClaim === false, 'F4d finite discovery became source absence/completion: ' + identity);
    }
    fail(equal(counts, {reviewed: 76, unresolved: 7}) && equal(counts, closure.counts), 'F4d bounded correspondence/limit counts changed');
}
