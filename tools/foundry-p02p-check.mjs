// Named disposable world only. Exercises preservation, not P02-A acquisition or gameplay.
const batch='P02-P-2026-10-26';
const featureA='Compendium.ptu.feats.Item.TQ6scoBM3iZKMuZT';
const featureB='Compendium.ptu.feats.Item.FLSt79Zix8j69T07';
const moveId='Compendium.ptu.moves.Item.aS33KlxhRCP0s5Zd';
const clone=value=>foundry.utils.deepClone(value);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))).map(n=>n.toString(16).padStart(2,'0')).join('');
const protectedData=item=>{
    const data=item.toObject();
    return {id:item.id,name:data.name,img:data.img,source:data._stats.compendiumSource,legacy:data.flags.core?.sourceId,
        version:data.flags.ptu.selectedVersion,selection:data.flags.ptu.rulesSelections,grants:data.flags.ptu.itemGrants,
        system:data.system};
};

export async function runP02PCheck(){
    if(!game.user.isGM||game.world.id!=='ptu-verification')throw Error('Use GM in the disposable ptu-verification world only.');
    const {Migration111PrereqItems}=await import('/systems/ptu/src/module/migration/migrations/111-prereq-items.js');
    const {Migration113Keywords}=await import('/systems/ptu/src/module/migration/migrations/113-keywords.js');
    const {Migration115RulesAutomation}=await import('/systems/ptu/src/module/migration/migrations/115-rules-automation.js');
    const {MigrationRunner}=await import('/systems/ptu/src/module/migration/runner/index.js');
    const {resolvePreservationSource}=await import('/systems/ptu/src/util/preservation.js');
    const {diagnosePrerequisites}=await import('/systems/ptu/src/util/prerequisites.js');
    const plan=await(await fetch('/ptu02-preservation/plan.json',{cache:'no-store'})).json();
    const report={batch,phase:plan.phase,foundry:game.version,system:game.system.version,scenarios:[]};
    const check=(ok,message)=>{if(!ok)throw Error(message);};
    const record=async(id,action)=>{try{report.scenarios.push({id,result:'pass',observed:await action()});}catch(error){report.scenarios.push({id,result:'fail',error:error.message,stack:error.stack});}};
    const migrations=()=>[new Migration111PrereqItems(),new Migration113Keywords(),new Migration115RulesAutomation()];
    const existingActors=game.actors.filter(actor=>actor.flags.ptu?.p02pFixture!==batch);
    const actorHashes=await Promise.all(existingActors.map(async actor=>({id:actor.id,hash:await hash(actor.toObject())})));
    const itemHashes=await Promise.all(game.items.map(async item=>({id:item.id,hash:await hash(item.toObject())})));
    report.preexisting={actors:actorHashes,items:itemHashes,worldSchema:game.settings.get('ptu','worldSchemaVersion')};
    let actor=game.actors.find(actor=>actor.flags.ptu?.p02pFixture===batch);
    const selected=()=>actor.items.filter(item=>item.flags.ptu?.p02pRole);
    if(plan.phase==='check'){
        await record('create-or-reuse-disposable-owned-fixtures',async()=>{
            check(game.actors.filter(actor=>actor.flags.ptu?.p02pFixture===batch).length<=1,'Duplicate test actor.');
            if(!actor)actor=await Actor.create({name:'P02-P preservation only',type:'character',system:{health:{value:30}},flags:{ptu:{p02pFixture:batch}},items:[
                ['original',featureA,featureB,['Master Focus','GM Permission']],
                ['revised',featureB,featureA,['Novice Focus','Custom requirement']]
            ].map(([role,uuid,legacy,prerequisites])=>({name:'P02-P Same Name',type:'feat',
                _stats:{compendiumSource:uuid},flags:{core:{sourceId:legacy},ptu:{p02pRole:role,selectedVersion:{id:'synthetic-'+role,label:'Synthetic '+role},rulesSelections:{choice:'saved-'+role},itemGrants:{saved:{id:'saved-grant-id',onDelete:'detach'}}}},
                system:{prerequisites,keywords:['Custom'],range:'Custom range',rules:[],referenceEffect:null,enabled:false}}))});
            check(actor&&selected().length===2,'Fixture actor or selected items changed.');
            await selected().find(item=>item.flags.ptu.p02pRole==='original').update({img:'icons/svg/book.svg'});
            return{actor:actor.uuid,items:selected().map(protectedData),syntheticVersionLabels:true,productionVariantsCreated:false};
        });
        await record('actual-three-migrations-preserve-owned-snapshots-twice',async()=>{
            const before=actor.toObject();const runner=new MigrationRunner(migrations());
            const first=await runner.getUpdatedActor(before,runner.migrations),second=await runner.getUpdatedActor(first,runner.migrations);
            check(equal(first,second),'Repeated migration changed a completed snapshot.');
            for(const old of before.items){const updated=first.items.find(i=>i._id===old._id);for(const field of ['prerequisites','keywords','range','rules','referenceEffect','enabled'])check(equal(updated.system[field],old.system[field]),'Protected system field changed: '+field);check(equal(updated.flags,old.flags),'Saved selections/grants changed.');}
            // Persist only the migration fields; sending unrelated HP would invoke auto-faint behavior.
            await actor.update({'system.schema':first.system.schema});
            await actor.updateEmbeddedDocuments('Item',first.items.filter(item=>item.flags.ptu?.p02pRole));
            const values=raw=>({id:raw._id,schema:raw.system.schema,items:raw.items.filter(item=>item.flags.ptu?.p02pRole)});
            return{before:values(before),first:values(first),second:values(second),persisted:values(actor.toObject()),protectedFieldsExact:true};
        });
        await record('exact-source-conflict-rename-and-successful-missing-field-updates',async()=>{
            const results=[];
            for(const owned of selected()){
                const raw=owned.toObject();raw.name='Renamed exact-ID fixture';raw.system.schema={version:0.110};delete raw.system.prerequisites;
                const matched=await resolvePreservationSource(raw);check(matched.uuid===raw._stats.compendiumSource,'Legacy provenance replaced modern selection.');
                const runner=new MigrationRunner([new Migration111PrereqItems()]);const updated=await runner.getUpdatedItem(raw,runner.migrations);
                check(equal(updated.system.prerequisites,matched.system.prerequisites),'Exact version prerequisite fill failed.');
                results.push({identity:matched.uuid,rawRequirements:updated.system.prerequisites,flagsPreserved:equal(updated.flags,raw.flags),sourceName:matched.name});
            }
            const move=await fromUuid(moveId),raw=move.toObject();raw._stats.compendiumSource=moveId;raw.system.schema={version:0.110};delete raw.system.keywords;delete raw.system.range;delete raw.system.rules;delete raw.system.referenceEffect;
            const runner=new MigrationRunner(migrations());const updated=await runner.getUpdatedItem(raw,runner.migrations);
            check(equal(updated.system.keywords,move.system.keywords)&&equal(updated.system.range,move.system.range),'0.113 legitimate fill failed.');
            check(equal(updated.system.rules,move.system.rules)&&equal(updated.system.referenceEffect,move.system.referenceEffect),'0.115 legitimate payload fill failed.');
            check(equal(await runner.getUpdatedItem(updated,runner.migrations),updated),'Automation duplicated on repeat.');
            return{features:results,move:{uuid:moveId,keywords:updated.system.keywords,range:updated.system.range,rules:updated.system.rules,referenceEffect:updated.system.referenceEffect},noMoveBehaviorExecuted:true};
        });
        await record('missing-ambiguous-custom-and-legacy-snapshots-preserved',async()=>{
            const seed=selected()[0].toObject(),rows=[];
            for(const [role,modern,legacy] of [['missing','Compendium.ptu.feats.Item.0000000000000000',featureB],['invalid','ambiguous identity',featureB],['custom',null,null],['legacy',null,featureA.replace('.Item.','.')]]){
                const raw=clone(seed);delete raw.system.prerequisites;raw.system.schema={version:0.110};
                raw._stats.compendiumSource=modern;raw.flags.core.sourceId=legacy;const before=clone(raw);
                const updated=await new MigrationRunner([new Migration111PrereqItems()]).getUpdatedItem(raw,[new Migration111PrereqItems()]);
                check(equal(raw,before),'Migration changed caller input.');
                if(role==='legacy')check(equal(updated.system.prerequisites,(await fromUuid(featureA)).system.prerequisites),'Full legacy identity did not resolve.');
                else check(!Object.hasOwn(updated.system,'prerequisites'),'Unresolved record got guessed prerequisites.');
                check(equal(updated.flags,raw.flags)&&equal(updated._stats,raw._stats),'Identity/protected metadata changed.');rows.push({role,before,after:updated});
            }
            return{rows};
        });
        await record('actual-owned-refresh-repeat-and-permission-boundary',async()=>{
            const rows=[];
            for(const owned of selected()){const before=protectedData(owned);await owned.refreshFromCompendium();const first=protectedData(owned);await owned.refreshFromCompendium();const second=protectedData(owned);
                check(equal(first,second),'Repeated refresh changed saved fields.');
                for(const field of Object.keys(before.system))check(equal(first.system[field],before.system[field]),'Refresh overwrote existing '+field);
                for(const field of ['id','name','source','legacy','version','selection','grants'])check(equal(first[field],before[field]),'Refresh changed identity/selection '+field);
                const isDefault=before.img===owned.constructor.DEFAULT_ICON;
                check(isDefault?first.img===(await fromUuid(before.source)).img:first.img===before.img,'Refresh changed a custom image or failed default-image update.');
                rows.push({before,first,second});}
            const player=game.users.find(user=>!user.isGM);check(player&&!actor.canUserModify(player,'update'),'Ordinary non-owner permission changed.');
            let called=false;await selected()[0].refreshFromCompendium.call({isOwned:true,isOwner:false,update:()=>{called=true;}});check(!called,'Non-owner refresh reached update.');
            return{rows,nonOwner:{user:player.id,canUpdate:false,guardReachedUpdate:false},otherClientPermissionUiNotExercised:true};
        });
        await record('actual-document-schema-failure-and-safe-retry',async()=>{
            const owned=selected()[0];await owned.update({'system.schema.version':0.110});
            const before=owned.toObject();let fail=true;
            const migration={version:0.115,updateItem:async raw=>{raw.system.p02pRecovered='supported synthetic update';if(fail)throw Error('P02-P injected failure');}};
            let rejected=false;try{await MigrationRunner.ensureSchemaVersion(owned,[migration]);}catch(error){rejected=error.message==='P02-P injected failure';}
            const failureAfter=owned.toObject();
            check(rejected&&equal(failureAfter,before),'Failed transformation changed or falsely stamped the actual document.');
            fail=false;await MigrationRunner.ensureSchemaVersion(owned,[migration]);const recovered=owned.toObject();await owned.update(recovered,{diff:false,recursive:false});
            const first=owned.toObject();await MigrationRunner.ensureSchemaVersion(owned,[migration]);check(equal(first,owned.toObject()),'Completed retry changed on repeat.');
            check(owned.system.schema.version===0.115&&owned.system.p02pRecovered==='supported synthetic update','Recovery did not persist.');
            return{before,failureAfter,rejected,recovered,persisted:owned.toObject(),worldSchemaUnchanged:game.settings.get('ptu','worldSchemaVersion')===report.preexisting.worldSchema};
        });
        report.expectedPersisted=selected().map(protectedData);
        report.actor=actor.uuid;
    }else if(plan.phase==='reload'){
        const baseline=await(await fetch('/ptu02-preservation/expected.json',{cache:'no-store'})).json();
        await record('persisted-reload-and-preexisting-world-data',async()=>{
            check(actor&&equal(selected().map(protectedData),baseline.expectedPersisted),'Reload changed selected/protected fields.');
            check(equal(report.preexisting,baseline.preexisting),'Pre-existing actors/Items or world schema changed.');
            return{actor:actor.uuid,items:selected().map(protectedData),preexistingActorCount:actorHashes.length,preexistingItemCount:itemHashes.length,allHashesMatch:true};
        });
        await record('accepted-p03-reports-retain-raw-selected-version-inputs',async()=>{
            const rows=selected().map(item=>{const before=protectedData(item),result=diagnosePrerequisites({actor,item,selectedVersion:item.flags.ptu.selectedVersion});check(equal(before,protectedData(item)),'Diagnostic mutated saved values.');check(equal(result.rawRequirements,item.system.prerequisites),'Diagnostic switched raw versions.');return result;});
            return{rows};
        });
    }else throw Error('Unknown preservation phase');
    const passed=report.scenarios.filter(row=>row.result==='pass').length;
    const summary=`<h2>P02-P: ${passed}/${report.scenarios.length} preservation checks passed</h2><p>Foundry ${report.foundry}; ${report.phase}. P02-A remains held for planner review.</p><ul>${report.scenarios.map(row=>`<li>${row.result.toUpperCase()}: ${row.id}</li>`).join('')}</ul>`;
    new Dialog({title:'P02-P preservation result',content:summary+'<textarea id="p02p-result" style="width:100%;height:350px">'+foundry.utils.escapeHTML(JSON.stringify(report,null,2))+'</textarea>',buttons:{close:{label:'Close'}}},{width:1000,height:760}).render(true);
    return report;
}
