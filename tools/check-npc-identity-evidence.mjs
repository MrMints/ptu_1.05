import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {getDocumentSourceId} from '../src/util/document-source.js';

const base='docs/validation/p03-npc-raw/';
const read=async name=>JSON.parse(await readFile(base+name,'utf8'));
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value))).digest('hex');
const bytesHash=bytes=>createHash('sha256').update(bytes).digest('hex');
const equal=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const baseline=await read('baseline-live.json'),init=await read('final-matrix-initial.json'),selected=await read('final-matrix-selected.json'),removed=await read('final-matrix-removed-base.json'),renamed=await read('final-matrix-renamed.json'),before=await read('final-matrix-before-generation.json'),generated=await read('final-matrix-generated.json'),reload=await read('final-inspection-restored.json');
const cancelBefore=await read('final-cancel-before.json'),cancelAfter=await read('final-cancel-after.json'),playerBefore=await read('player-before.json'),playerSelected=await read('player-selected.json'),playerAfter=await read('player-denied.json');
const artifact=await read('artifact-binding.json'),ci=await read('runtime-ci.json'),access=await read('macro-access-restored.json');
const pasted=await read('ambiguous-paste-no-selection.json'),speciesRemoved=await read('final-matrix-species-removed.json'),permissionBaseline=await read('final-reload-inspection.json');
const roles=Object.fromEntries(init.fixtureSources.map(i=>[i.source.flags.ptu.npcIdentityRole,i.uuid]));
const choiceMap=s=>Object.fromEntries(Object.values(s.subSelectables).map(c=>[c.selectionId,c.selected]));
const expectedChoices={[roles['feat-B']]:'beta',[roles['feat-A']]:'alpha',[roles['feat-A']+'::repeat:2']:'beta'};
const trainer=generated.newActors.find(a=>a.source.type==='character');
const medical=['Compendium.ptu.feats.Item.bNVcfm2VHWfhEQGi','Compendium.ptu.feats.Item.WscZukROrNeC7Ayp'];
const selectedItem=i=>Boolean(i.flags.ptu?.npcIdentityRole)||medical.includes(getDocumentSourceId(i));
const itemData=i=>({id:i._id,name:i.name,type:i.type,img:i.img,system:i.system,flags:i.flags,effects:i.effects,sourceId:getDocumentSourceId(i)});
const actorItems=a=>a.source.items.filter(selectedItem).map(itemData).sort((a,b)=>a.id.localeCompare(b.id));
const cases=[];
function check(id,expected,fn){try{const observed=fn();cases.push({id,result:'passed',expected,observed});}catch(e){cases.push({id,result:'failed',expected,error:e.message});}}

check('baseline-live-failure-retained','Clicked row must retain its UUID; baseline fails and final is checked separately.',()=>{
 assert.equal(baseline.clickedUuid,medical[0]);assert.equal(baseline.observed.selections.features[0].uuid,medical[1]);
 return {baselineResult:'failed',clicked:baseline.clickedUuid,resolved:baseline.observed.selections.features[0].uuid,dropdownOrder:baseline.dropdownRows.map(r=>r.uuid)};
});
check('final-installed-artifact-binding','All four changed production files equal the served, installed and archived bytes; committed text matches.',()=>{
 for(const r of [init,selected,removed,renamed,before,generated,reload,playerBefore,playerAfter])for(const b of r.runtimeBindings)assert.equal(artifact.bindings.find(a=>a.path===b.path).sha256,b.sha256);
 return artifact;
});
check('ambiguous-paste-refused','Bare Medical Techniques text must not select a record.',()=>{assert.equal(pasted.selections.features.length,0);return{selected:pasted.selections.features};});
check('ordinary-all-type-selection','Two classes, both Medical Techniques, two synthetic Features plus repeat, two Edges and plain Nonbinary retain exact values.',()=>{
 assert.deepEqual(selected.selections.classes.map(i=>i.uuid),[roles['class-A'],roles['class-B']]);
 assert.deepEqual(selected.selections.features.map(i=>i.value),[...medical,roles['feat-A'],roles['feat-B'],roles['feat-A']+'::repeat:2']);
 assert.deepEqual(selected.selections.edges.map(i=>i.uuid),[roles['edge-A'],roles['edge-B']]);assert.equal(selected.sex[0].value,'Nonbinary');
 for(const [uuid,requirements] of [[medical[0],['Medic','Adept Medicine Education']],[medical[1],['Apothecary','Expert Medicine Education']]])assert.deepEqual(selected.computed.find(i=>i.uuid===uuid).system.prerequisites,requirements);
 return {classes:selected.selections.classes,features:selected.selections.features,edges:selected.selections.edges,sex:selected.sex};
});
check('independent-repeat-rename-choices','Independent alpha/beta/beta choices survive refresh, base removal/re-add and source rename.',()=>{
 assert.ok(equal(choiceMap(selected),expectedChoices));assert.ok(equal(choiceMap(renamed),expectedChoices));
 assert.ok(equal(choiceMap(removed),{[roles['feat-B']]:'beta',[roles['feat-A']+'::repeat:2']:'beta'}));
 assert.equal(renamed.computed.find(i=>i.uuid===roles['feat-B']).name,'NPC Identity renamed Feature B');
 return {before:choiceMap(selected),afterRemoval:choiceMap(removed),afterRename:choiceMap(renamed)};
});
check('advisory-no-rank-or-dependency-changes','All 17 explicit ranks remain 2; nine explicit trainer Items generate despite 9 unmet and 11 unverifiable messages.',()=>{
 assert.equal(Object.keys(before.ranks).length,17);assert.ok(Object.values(before.ranks).every(n=>n===2));
 assert.equal(before.warnings.unmet.length,9);assert.equal(before.warnings.unknown.length,11);assert.equal(trainer.source.items.length,9);
 for(const s of Object.values(trainer.source.system.skills))assert.equal(s.value.value,2);
 assert.ok(trainer.source.items.every(i=>i.system.enabled!==false));
 return {ranks:before.ranks,unmet:before.warnings.unmet.length,unverifiable:before.warnings.unknown.length,generatedItems:trainer.source.items.length};
});
check('species-change-remove-generation','Removal clears the source; both separately chosen species survive refresh and generate their own source/custom/version Item.',()=>{
 assert.equal(speciesRemoved.party.slot1.configured,false);assert.equal(speciesRemoved.party.slot1.uuid,'');
 assert.equal(before.party.slot1.uuid,roles['species-B']);assert.equal(before.party.slot2.uuid,roles['species-A']);
 const pokemon=generated.newActors.filter(a=>a.source.type==='pokemon');assert.equal(pokemon.length,2);
 assert.deepEqual(pokemon.map(a=>getDocumentSourceId(a.source.items.find(i=>i.type==='species'))).sort(),[roles['species-A'],roles['species-B']].sort());
 return pokemon.map(a=>({uuid:a.uuid,items:actorItems(a)}));
});
check('generated-custom-data-and-selections','Every selected source retains its requirements, effect, custom/version data and intended ChoiceSet selection.',()=>{
 const expectedSource=[...before.fixtureSources.map(i=>({uuid:i.uuid,source:i.source})),...before.computed.filter(i=>medical.includes(i.uuid)).map(i=>({uuid:i.uuid,source:i}))];
 for(const a of generated.newActors)for(const i of a.source.items.filter(selectedItem)){
  const source=expectedSource.find(s=>s.uuid===getDocumentSourceId(i));assert.ok(source);assert.deepEqual(i.system.prerequisites,source.source.system.prerequisites);assert.equal(i.system.effect,source.source.system.effect);assert.deepEqual(i.flags.ptu?.selectedVersion,source.source.flags.ptu?.selectedVersion);assert.deepEqual(i.flags.ptu?.npcCustom,source.source.flags.ptu?.npcCustom);
 }
 const repeated=trainer.source.items.filter(i=>getDocumentSourceId(i)===roles['feat-A']);assert.equal(repeated.length,2);assert.equal(new Set(repeated.map(i=>i._id)).size,2);assert.deepEqual(repeated.map(i=>i.system.rules.find(r=>r.key==='ChoiceSet').selection).sort(),['alpha','beta']);
 assert.equal(trainer.source.items.find(i=>getDocumentSourceId(i)===roles['feat-B']).system.rules.find(r=>r.key==='ChoiceSet').selection,'beta');assert.equal(trainer.source.system.sex,'Nonbinary');
 return {trainerUuid:trainer.uuid,selectedItems:actorItems(trainer)};
});
check('real-choice-cancellation-no-writes','Cancelling an unresolved ChoiceSet creates no actors/folders or changes to explicit ranks/selections.',()=>{
 assert.equal(cancelAfter.newActors.length,0);assert.deepEqual(cancelAfter.actorIds,cancelBefore.actorIds);assert.deepEqual(cancelAfter.folderIds,cancelBefore.folderIds);assert.deepEqual(cancelAfter.ranks,cancelBefore.ranks);assert.deepEqual(cancelAfter.selections,cancelBefore.selections);assert.ok(equal(choiceMap(cancelAfter),choiceMap(cancelBefore)));return{actorsUnchanged:true,foldersUnchanged:true,choices:choiceMap(cancelAfter)};
});
check('actual-player-permission-first-denial','Real role-1 player retains both exact selections but cannot create NPC actors or folders.',()=>{
 assert.equal(playerAfter.user.isGM,false);assert.equal(playerAfter.user.canCreateActor,false);assert.deepEqual(playerSelected.selections.features.map(i=>i.uuid),medical);assert.equal(playerAfter.newActors.length,0);assert.deepEqual(playerAfter.actorIds,playerBefore.actorIds);assert.deepEqual(playerAfter.folderIds,playerBefore.folderIds);return{user:playerAfter.user,selected:playerSelected.selections.features.map(i=>i.uuid),actorsUnchanged:true,foldersUnchanged:true};
});
check('temporary-macro-access-restored','Owner-approved Observer access returns to original Default/None; actual world roles/permissions remain unchanged.',()=>{
 assert.equal(access.approved,true);assert.equal(access.observed.label,'Default');assert.equal(reload.testMacroOwnership.default,0);assert.equal(Object.hasOwn(reload.testMacroOwnership,playerAfter.user.id),false);assert.deepEqual(reload.testUserPermissions,permissionBaseline.testUserPermissions);return{access,macroOwnership:reload.testMacroOwnership,worldUserPermissions:reload.testUserPermissions,note:'The UI Default sentinel is -20; no explicit player override remains. The initial -1 sentinel assumption was a reporting-harness error.'};
});
check('actual-client-reload-item-preservation','All final generated selected Items retain exact owned IDs, source identity, complete system/custom/choice data after reload.',()=>{
 const rows=[];for(const a of generated.newActors){const saved=reload.savedProbeActors.find(b=>b.uuid===a.uuid);assert.ok(saved);const prior=actorItems(a),current=actorItems(saved);assert.ok(equal(prior,current),`Item persistence differs on ${a.uuid}`);rows.push({actorUuid:a.uuid,selectedItems:current.length,beforeSha256:hash(prior),afterSha256:hash(current)});}
 assert.equal(reload.savedProbeActors.length,7);return rows;
});
check('source-records-preserved','Eight exact source identities remain; only the deliberate B label and modification metadata may change.',()=>{
 const fields=[];for(const entry of init.fixtureSources){const after=reload.fixtureSources.find(i=>i.uuid===entry.uuid);assert.ok(after);const left=structuredClone(entry.source),right=structuredClone(after.source);if(left.flags.ptu.npcIdentityRole==='feat-B'){delete left.name;delete right.name;delete left._stats.modifiedTime;delete right._stats.modifiedTime;}assert.ok(equal(left,right),`Unexpected source mutation ${entry.uuid}`);fields.push({uuid:entry.uuid,beforeSha256:hash(entry.source),afterSha256:hash(after.source),deliberateRename:entry.source.flags.ptu.npcIdentityRole==='feat-B'});}assert.equal(reload.fixtureSources.length,8);return fields;
});

const report=JSON.parse(await readFile('docs/validation/2026-10-26-p03-npc.json','utf8'));
for(const entry of report.retained) {
 assert.match(entry.path,new RegExp('^p03-npc-raw/[a-zA-Z0-9._-]+$'));
 assert.equal(bytesHash(await readFile('docs/validation/'+entry.path)),entry.sha256,entry.path);
}
if(process.argv.includes('--current'))for(const binding of artifact.bindings) {
 const current=(await readFile(binding.path,'utf8')).replaceAll('\r\n','\n');
 assert.equal(hash(current),binding.commitBlobSha256,binding.path+' changed since the tested runtime');
}
console.log(JSON.stringify({passed:cases.filter(c=>c.result==='passed').length,total:cases.length,retainedHashes:report.retained.length,failures:cases.filter(c=>c.result==='failed')}));
if(cases.some(c=>c.result==='failed'))process.exitCode=1;
