// Disposable-world diagnostic; served under Data/ptu02-correction, never packaged.
const batch='ptu02-correction-20261025';
const find=key=>game.actors.find(a=>a.flags.ptu?.corrective02?.batch===batch&&a.flags.ptu.corrective02.case===key);
const check=(value,message)=>{if(!value)throw Error(message);};
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function runCorrective02Check(){
 check(game.ready&&game.user.isGM&&game.world.id==='ptu-verification','Use GM in the disposable world.');
 const {STARTER_TRAINING_GRANT:grant,STARTER_TRAINING_CHOICES:choices}=await import('/systems/ptu/src/util/starter-training.js');
 const {EXCLUDED_CONTENT,filterNewContent}=await import('/systems/ptu/src/util/content-scope.js');
 const plan=await(await fetch('/ptu02-correction/plan.json',{cache:'no-store'})).json();
 const report={batch,phase:plan.phase,case:plan.case,version:game.version,checkedAt:new Date().toISOString(),scenarios:[]};
 async function record(id,action){try{report.scenarios.push({id,result:'pass',details:await action()});}catch(e){report.scenarios.push({id,result:'fail',error:e.message,stack:e.stack?.split('\n').slice(0,4)});}}
 if(plan.phase==='begin')await record('baseline-and-original-setting',async()=>{
  if(!game.user.flags.ptu?.corrective02State){const preexisting=[];for(const actor of game.actors)preexisting.push({id:actor.id,hash:await hash(actor.toObject())});await game.user.setFlag('ptu','corrective02State',{originalAdvancement:game.settings.get('ptu','variant.trainerAdvancement'),preexisting});}
  await game.settings.set('ptu','variant.trainerAdvancement','original');
  return{originalAdvancement:game.user.flags.ptu.corrective02State.originalAdvancement,preexistingActors:game.user.flags.ptu.corrective02State.preexisting.length};
 });
 else if(plan.phase==='create'){
  check(!find(plan.case),'Case already exists; inspect it instead of recreating.');
  await Actor.create({name:`PTU 02 correction ${plan.case}`,type:'character',flags:{ptu:{corrective02:{batch,case:plan.case}}},
   system:{skills:Object.fromEntries(['athletics','command','charm','intimidate'].map(key=>[key,{value:{value:1}}]))}});
  return; // Choose or cancel the real prompt through UI before the next diagnostic.
 }
 else if(plan.phase==='choice')await record('choice-prerequisite-budget-and-repeat',async()=>{
  const actor=find(plan.case);check(actor,'Fixture missing.');
  const selected=actor.items.filter(i=>i.flags.ptu?.starterTrainingGrant===grant);
  check(selected.length===1&&selected[0].sourceId===choices[plan.index],'Incorrect or duplicate starting choice.');
  check(selected[0].system.free===false,'Bonus was counted against the wrong feature budget.');
  for(const key of ['athletics','command','charm','intimidate'])check(actor.system.skills[key].value.total===1,'Prerequisite-exception fixture not Pathetic.');
  if(!actor.items.some(i=>i.flags.ptu?.corrective02Ordinary))await actor.createEmbeddedDocuments('Item',[
   ...Array.from({length:4},(_,n)=>({name:`Ordinary Feature ${n}`,type:'feat',system:{free:false,rules:[]},flags:{ptu:{corrective02Ordinary:true}}})),
   ...Array.from({length:4},(_,n)=>({name:`Ordinary Edge ${n}`,type:'edge',system:{free:false,rules:[]},flags:{ptu:{corrective02Ordinary:true}}}))]);
  check(actor.system.feats.total===5&&actor.system.feats.max===5&&actor.system.edges.total===4&&actor.system.edges.max===4,'Ordinary starting allocations changed.');
  await selected[0].update({name:`Renamed starting choice ${plan.index}`});
  const before=await hash(actor.toObject());await actor.selectStarterTraining();
  let repeatedBlocked=false;try{game.items.fromCompendium(await fromUuid(grant));}catch(e){repeatedBlocked=e.message.includes('Choose Starter Training');}
  check(repeatedBlocked&&await hash(actor.toObject())===before,'Repeat application changed a completed trainer.');
  return{actor:actor.id,selected:selected[0].id,sourceId:selected[0].sourceId,prerequisitesUnmet:true,features:actor.system.feats,edges:actor.system.edges,repeatUnchanged:true};
 });
 else if(plan.phase==='cancel')await record('cancel-leaves-no-grants',async()=>{const actor=find(plan.case);check(actor?.items.size===0&&actor.flags.ptu.starterTraining.status==='pending','Cancellation changed item/selection state.');return{actor:actor.id,items:actor.items.size,status:actor.flags.ptu.starterTraining.status};});
 else if(plan.phase==='permissions')await record('owner-and-observer',async()=>{
  const player=game.users.get('iVkqwxalI3cGJahD');check(player,'Original disposable player missing.');
  const owner=find('cancel');let observer=find('observer-pending');
  observer??=await Actor.create({name:'PTU 02 observer pending selection',type:'character',flags:{ptu:{starterTraining:{status:'pending'},corrective02:{batch,case:'observer-pending'}}}});
  await owner.update({[`ownership.${player.id}`]:3});await observer.update({[`ownership.${player.id}`]:2});
  check(owner.canUserModify(player,'update')&&!observer.canUserModify(player,'update'),'Ownership boundary changed.');
  return{player:player.id,owner:owner.id,observer:observer.id};
 });
 else if(plan.phase==='open-sheet'){await find(plan.case).sheet._render(true);return;}
 else if(plan.phase==='acquisition'){
  await record('excluded-new-acquisition-and-custom-preservation',async()=>{
   const actor=find('choice-0'),blocked=[];
   for(const identity of EXCLUDED_CONTENT){const[pack,id]=identity.split('.'),uuid=`Compendium.ptu.${pack}.Item.${id}`;
    let worldBlocked=false,dropBlocked=false;
    try{await game.items.importFromCompendium(game.packs.get('ptu.'+pack),id);}catch(e){worldBlocked=e.message.includes('excluded from new acquisition');}
    try{await actor.sheet.emulateItemDrop({type:'Item',uuid});}catch(e){dropBlocked=e.message.includes('excluded from new acquisition');}
    check(worldBlocked&&dropBlocked,'Excluded acquisition succeeded.');blocked.push(identity);}
   const custom=(await actor.createEmbeddedDocuments('Item',[{name:'Dipplin',type:'item',system:{quantity:2,rules:[]},flags:{ptu:{corrective02Custom:true}}}]))[0];check(custom&&custom.system.quantity===2,'Custom item was classified by its label.');
   return{blocked,custom:custom.id,customSourceId:custom.sourceId??null};
  });
  await record('saved-campaign-copy-and-generator-guard',async()=>{
   let actor=find('campaign-copy');actor??=await Actor.create({name:'PTU 02 preserved campaign stub',type:'character',items:[{name:'Preserved legacy source stub',type:'effect',system:{rules:[]},_stats:{compendiumSource:'Compendium.ptu.effects.Item.3w7uQfBvzzxATXis'}}],flags:{ptu:{corrective02:{batch,case:'campaign-copy'}}}});
   check(actor.items.size===1&&!actor.flags.ptu.starterTraining,'Populated campaign copy was changed.');
   const stub=new CONFIG.Item.documentClass({name:'Excluded source stub',type:'species',_stats:{compendiumSource:'Compendium.ptu.species.Item.dkQPNz0RLbgzWMLq'}});
   let rejected=false;try{new game.ptu.species.generator(stub);}catch(e){rejected=e.message.includes('excluded from new generation');}check(rejected,'Excluded generator input was accepted.');
   return{actor:actor.id,item:actor.items.contents[0].id,originalSourcePreserved:actor.items.contents[0].sourceId,generatorRejectedBeforePreparation:true,noExcludedBehaviorExecuted:true};
  });
  await record('world-item-restore-json-duplicate-and-owned-copy',async()=>{
   const provenance='Compendium.ptu.effects.Item.3w7uQfBvzzxATXis';
   const id=foundry.utils.randomID(),custom={authorNote:'Preserved custom data',selection:['custom-a','custom-b']};
   const restored=await Item.create({_id:id,name:'PTU 02 saved world record',type:'effect',system:{rules:[],effect:'Saved user text'},
    flags:{ptu:{corrective02Backup:batch},user:custom},_stats:{compendiumSource:provenance}},{keepId:true});
   check(restored.id===id&&restored.sourceId===provenance&&JSON.stringify(restored.flags.user)===JSON.stringify(custom),'Raw saved-ID restoration was filtered or rewritten.');
   const backup=restored.toObject();await restored.update({'system.effect':'Temporary edit'});
   await restored.importFromJSON(JSON.stringify(backup));
   check(restored.id===id&&restored.system.effect==='Saved user text'&&restored.sourceId===provenance&&JSON.stringify(restored.flags.user)===JSON.stringify(custom),'Supported JSON import changed saved identity/custom data.');
   const duplicate=await restored.clone({name:'PTU 02 duplicate restored record'},{save:true,addSource:true});
   check(duplicate.id!==id&&duplicate.sourceId===provenance&&JSON.stringify(duplicate.flags.user)===JSON.stringify(custom),'World-item duplication lost saved provenance/custom fields.');
   const actor=find('choice-0');const owned=await actor.sheet.emulateItemDrop({type:'Item',uuid:restored.uuid});
   check(owned?.length===1&&owned[0].sourceId===provenance&&JSON.stringify(owned[0].flags.user)===JSON.stringify(custom),'Saved world-item owned copy was filtered or rewritten.');
   const folder=await Folder.create({name:'PTU 02 saved-copy folder',type:'Item'});await restored.update({folder:folder.id});
   const folderCopy=await actor.sheet._onDropFolder(null,{type:'Folder',uuid:folder.uuid});
   check(folderCopy?.length===1&&folderCopy[0].sourceId===provenance&&JSON.stringify(folderCopy[0].flags.user)===JSON.stringify(custom),'Saved world-folder copy was filtered or rewritten.');
   return{restored:restored.id,duplicate:duplicate.id,owned:owned[0].id,folderCopy:folderCopy[0].id,provenance,customFieldsPreserved:true,coreImportApi:'importFromJSON',coreDuplicateApi:'clone(save:true,addSource:true)',creationApi:'Item.create(keepId:true)',metadataLimit:'Core timestamps and duplicateSource update normally; stable original ID/provenance and user fields are preserved.'};
  });
  await record('new-rule-grant-exclusion-preserves-existing-items',async()=>{
   const actor=find('choice-0'),before=actor.items.contents.map(item=>({id:item.id,hash:null}));
   for(const row of before)row.hash=await hash(actor.items.get(row.id).toObject());
   const count=actor.items.size;
   const [wrapper]=await actor.createEmbeddedDocuments('Item',[{name:'PTU 02 blocked grant stub',type:'effect',system:{rules:[{key:'GrantItem',uuid:'Compendium.ptu.effects.Item.3w7uQfBvzzxATXis'}]},flags:{ptu:{corrective02BlockedGrant:true}}}]);
   check(wrapper&&actor.items.size===count+1,'Excluded rule grant added an item.');
   for(const row of before)check(await hash(actor.items.get(row.id).toObject())===row.hash,'Existing item changed during blocked grant.');
   return{wrapper:wrapper.id,noGranteeCreated:true,existingItemsPreserved:before.length,noExcludedBehaviorExecuted:true};
  });
  await record('actual-pack-folder-filter-before-creation',async()=>{
   const actor=find('choice-0'),folder=game.packs.get('ptu.effects').folders.get('DJzDYBNllxgyeiok');
   check(folder,'Recorded source folder missing.');
   const sheet=actor.sheet,original=sheet._onDropItemCreate;let received;
   // Observe the real folder boundary without creating any unclassified/excluded form effects.
   sheet._onDropItemCreate=async data=>{received=data;return[];};
   try{await sheet._onDropFolder(null,{type:'Folder',uuid:folder.uuid});}finally{sheet._onDropItemCreate=original;}
   check(received&&!received.some(row=>row._id==='3w7uQfBvzzxATXis'),'Known excluded source passed the folder boundary.');
   check(received.length===folder.contents.length-1,'Unexpected additional folder filtering.');
   return{folder:folder.uuid,sourceRecords:folder.contents.length,forwardedRecords:received.length,knownExcludedRemoved:1,creationIntercepted:true,noUnclassifiedOrExcludedBehaviorExecuted:true};
  });
 }
 else if(plan.phase==='browser')await record('browser-filter-and-notice',async()=>{
  const browser=game.ptu.compendiumBrowser;
  await browser.tabs.species.init();await browser.tabs.effects.init();
  const rows=[...browser.tabs.species.indexData,...browser.tabs.effects.indexData];
  check(filterNewContent(rows).length===rows.length,'Browser includes an excluded identity.');
  check(rows.some(row=>row.uuid.endsWith('QE7WhquxeuebiEVQ')),'Unaffected Generation 1 fixture absent.');
  await browser.loadTab('species');return{indexed:rows.length,knownExcludedAbsent:true,partialScope:true};
 });
 else if(plan.phase==='reload'){
  await record('all-choices-and-cancel-retry-persist',async()=>{
   const rows=[];for(let index=0;index<4;index++){const actor=find('choice-'+index),selected=actor?.items.filter(i=>i.flags.ptu?.starterTrainingGrant===grant);check(selected?.length===1&&selected[0].sourceId===choices[index],'Saved choice changed.');check(actor.system.feats.total===5&&actor.system.edges.total===4,'Saved allocations changed.');rows.push({actor:actor.id,sourceId:selected[0].sourceId});}
   const retry=find('cancel'),retryItems=retry.items.filter(i=>i.flags.ptu?.starterTrainingGrant===grant);
   check(retry.flags.ptu.starterTraining.status==='complete'&&retryItems.length===1,'Owner retry did not persist.');
   const observer=find('observer-pending');check(observer.flags.ptu.starterTraining.status==='pending'&&observer.items.size===0,'Observer changed the pending selection.');
   return{choices:rows,cancelRetry:{actor:retry.id,sourceId:retryItems[0].sourceId,lastModifiedBy:retryItems[0]._stats.lastModifiedBy},observerPendingUnchanged:true};
  });
  await record('existing-trainers-untouched-and-settings-restored',async()=>{
   const state=game.user.flags.ptu.corrective02State;await game.settings.set('ptu','variant.trainerAdvancement',state.originalAdvancement);
   for(const original of state.preexisting)check(await hash(game.actors.get(original.id).toObject())===original.hash,'Existing actor source changed: '+original.id);
   return{preexistingActors:state.preexisting.length,unchanged:true,settingRestored:game.settings.get('ptu','variant.trainerAdvancement')};
  });
 }
 else throw Error('Unknown correction phase');
 const text=JSON.stringify(report,null,2).replaceAll('&','&amp;').replaceAll('<','&lt;');
 new Dialog({title:'PTU 02 corrective result',content:`<textarea id="ptu02-corrective-result" readonly style="width:100%;height:520px">${text}</textarea>`,buttons:{close:{label:'Close'}}},{width:920,height:640}).render(true);
 return report;
}
