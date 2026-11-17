// GM-only diagnostic for the named disposable world. Synthetic fixtures are not approved variants.
const batch='P02-A-2026-10-26';
const packFeature='Compendium.ptu.feats.Item.TQ6scoBM3iZKMuZT';
const canonical=uuid=>uuid?.replace(/^(Compendium\.[\w-]+\.[\w-]+)\.([A-Za-z0-9]{16})$/,'$1.Item.$2');
const speciesId='Compendium.ptu.species.Item.QE7WhquxeuebiEVQ';
const copy=value=>foundry.utils.deepClone(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const check=(ok,message)=>{if(!ok)throw Error(message);};
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))).map(n=>n.toString(16).padStart(2,'0')).join('');
const numerics=actor=>{const d=actor.toObject().system;return{skills:d.skills,stats:d.stats,level:d.level,health:d.health,money:d.money};};
const source=role=>game.items.find(item=>item.flags.ptu?.p02a?.batch===batch&&item.flags.ptu.p02a.role===role);
const fixtureActor=role=>game.actors.filter(actor=>actor.flags.ptu?.p02a?.batch===batch&&actor.flags.ptu.p02a.role===role).at(-1);
const views=actor=>actor.prerequisiteDiagnostics;
const player=()=>game.users.find(user=>!user.isGM);
const owned=actor=>actor.items.filter(item=>['feat','edge','pokeedge'].includes(item.type));
async function actorData(type,role,items=[]){
    const data={name:'P02A '+role,type,flags:{ptu:{p02a:{batch,role},...(type==='character'?{starterTraining:{status:'pending'}}:{})}},system:{health:{value:30}},items:copy(items)};
    if(type==='pokemon'){
        const species=game.items.fromCompendium(await fromUuid(speciesId));species.system.rules=[];data.items.unshift(species);data.system.level={exp:0,current:5};
    }
    return data;
}
async function addMarker(items,key){for(const item of items)await item.setFlag('ptu','p02aCase',key);return items;}

export async function runP02ACheck(){
    check(game.user.isGM&&game.world.id==='ptu-verification','Use GM only in ptu-verification.');
    const plan=await(await fetch('/ptu02-acquisition/plan.json',{cache:'no-store'})).json();
    const report={batch,phase:plan.phase,executionId:crypto.randomUUID(),testedRuntime:plan.testedRuntime??'unbound',injectedNumericFault:plan.injectNumericFault??null,foundry:game.version,system:game.system.version,scenarios:[]};
    const record=async(id,action)=>{try{report.scenarios.push({id,result:'pass',observed:await action()});}catch(error){report.scenarios.push({id,result:'fail',error:error.message,stack:error.stack});}};
    if(plan.phase==='init'){
        report.baseline={actors:await Promise.all(game.actors.map(async d=>({id:d.id,hash:await digest(d.toObject())}))),items:await Promise.all(game.items.map(async d=>({id:d.id,hash:await digest(d.toObject())}))),worldSchema:game.settings.get('ptu','worldSchemaVersion'),scene:game.scenes.active?.id};
        await record('synthetic-source-and-actor-fixtures',async()=>{
            for(const [role,type,requirements] of [['feature','feat',['Master Focus','Level 99','GM Permission']],['revised','feat',['Novice Charm','Level 2','Custom condition']],['edge','edge',['Untrained Focus']],['pokeedge','pokeedge',['Custom condition']]]){
                if(!source(role))await Item.create({name:role==='feature'||role==='revised'?'P02A Same Name':'P02A '+role,type,ownership:{default:2},flags:{ptu:{p02a:{batch,role},selectedVersion:{id:'synthetic-'+role,label:'Synthetic '+role}}},system:{prerequisites:requirements,rules:[],enabled:true,quantity:1,notes:'Custom saved text'}});
            }
            for(const type of ['character','pokemon'])if(!fixtureActor(type))await Actor.create(await actorData(type,type,['feature','edge','pokeedge'].map(role=>source(role).toObject())));
            return{sources:['feature','revised','edge','pokeedge'].map(role=>({role,uuid:source(role).uuid,requirements:source(role).system.prerequisites})),actors:['character','pokemon'].map(role=>({role,uuid:fixtureActor(role).uuid})),synthetic:true};
        });
    }else if(plan.phase==='routes'){
        for(const type of ['character','pokemon']){
            if(plan.actorTypes&&!plan.actorTypes.includes(type))continue;
            let actor=fixtureActor(type);
            async function route(id,action,expected=1){
                if(plan.routes&&!plan.routes.includes(id)){report.scenarios.push({id:type+':'+id,result:'not-run',reason:'Outside this selected rerun; requires a separately linked passing execution.'});return;}
                await record(type+':'+id,async()=>{
                const key=type+':'+id;
                actor=await Actor.create(await actorData(type,key+':'+report.executionId,['feature','edge','pokeedge'].map(role=>source(role).toObject())));
                const before=numerics(actor),beforeItems=actor.items.map(i=>i.id);let items;
                try{items=await action();
                // Deliberate negative harness check on this newly created task-owned fixture only.
                if(plan.injectNumericFault===key)await actor.update({'system.money':Number(before.money??0)+1});
                check(items.length===expected,'Unexpected added Item count.');check(same(before,numerics(actor)),'Route changed numeric actor state.');
                for(const item of items){const view=views(actor).find(v=>v.id===item.id);check(view,'Owned item has no persistent diagnostic.');check(item.system.enabled!==false,'Acquisition disabled the item.');}
                await addMarker(items,key);check(same(before,numerics(actor)),'Marker update changed numeric state.');
                }catch(error){report.failedExecutions??=[];report.failedExecutions.push({route:key,actor:actor.uuid,numericBefore:before,numericAfter:numerics(actor),itemIdsBefore:beforeItems,itemIdsAfter:actor.items.map(i=>i.id)});throw error;}
                return{actor:actor.uuid,executed:true,freshFixture:true,executionId:report.executionId,numericBefore:before,numericAfter:numerics(actor),itemIdsBefore:beforeItems,itemIdsAfter:actor.items.map(i=>i.id),items:items.map(i=>({uuid:i.uuid,type:i.type,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic})),numericsUnchanged:true};
            });}
            await route('direct-embedded',()=>actor.createEmbeddedDocuments('Item',[source('feature').toObject()]));
            await route('sheet-new',async()=>{const items=await actor.sheet._onItemCreate({preventDefault(){},currentTarget:{dataset:{type:'edge'}}});await items[0].update({'system.prerequisites':['Level 99','Custom condition'],'flags.ptu.selectedVersion':{id:'synthetic-new'}});return items;});
            await route('sheet-drop',()=>actor.sheet._onDropItem({preventDefault(){},target:document.createElement('div')},{type:'Item',uuid:source('feature').uuid}));
            await route('browser',async()=>{const browser=game.ptu.compendiumBrowser;await browser.loadTab('feats');const entry=browser.tabs.feats.indexData.find(i=>canonical(i.uuid)===packFeature);check(entry,'Real browser entry unavailable.');await browser.close();return actor.sheet.emulateItemDrop({type:'Item',uuid:entry.uuid});});
            await route('native-compendium',async()=>{const doc=await game.items.importFromCompendium(game.packs.get('ptu.feats'),packFeature.split('.').at(-1),{name:'P02A native import'});return actor.sheet.emulateItemDrop({type:'Item',uuid:doc.uuid});});
            await route('owned-world-copy',()=>actor.createEmbeddedDocuments('Item',[source('revised').toObject()]));
            await route('mixed-folder',async()=>{const folder=await Folder.create({name:'P02A fresh mixed '+type,type:'Item',flags:{ptu:{p02aFolder:batch,executionId:report.executionId}}});for(const role of ['feature','edge','pokeedge'])await source(role).update({folder:folder.id});return actor.sheet._onDropFolder(null,{type:'Folder',uuid:folder.uuid});},3);
            await route('json-restore',async()=>{const restored=await Item.create({name:'P02A JSON restore destination',type:'feat'});await restored.importFromJSON(JSON.stringify(source('feature').toObject()));check(same(restored.system.prerequisites,source('feature').system.prerequisites),'JSON restore changed raw requirements.');return actor.createEmbeddedDocuments('Item',[restored.toObject()]);});
            await route('item-duplicate',async()=>[await owned(actor)[0].clone({},{save:true,addSource:true})]);
            await route('repeat-add',()=>actor.createEmbeddedDocuments('Item',[source('feature').toObject(),source('feature').toObject()]),2);
            for(const kind of plan.routes?[]:['inline-actor','actor-duplicate'])await record(type+':'+kind,async()=>{
                const result=kind==='inline-actor'?await Actor.create(await actorData(type,type+':'+kind+':'+report.executionId,['feature','edge','pokeedge'].map(role=>source(role).toObject()))):await actor.clone({name:'P02A duplicated '+type,flags:{ptu:{p02a:{batch,role:type+':'+kind+':'+report.executionId}}}},{save:true,addSource:true});
                check(owned(result).length>=3&&views(result).length===owned(result).length,'Inline/copy diagnostics or kinds missing.');return{actor:result.uuid,executed:true,freshFixture:true,types:owned(result).map(i=>i.type),reports:views(result),noStarterRetrofit:result.flags.ptu?.starterTraining?.status!=='complete'};
            });
        }
        if(!plan.routes)await record('npc-explicit-selection-and-generation',async()=>{
            const {NpcQuickBuildData}=await import('/systems/ptu/src/module/apps/npc-quick-build/document.js');const data=new NpcQuickBuildData();data.trainer.name='P02A generated NPC';data.trainer.level=5;data.trainer.partySize=0;data.party={};
            data.trainer.features.selected=[{uuid:source('feature').uuid,label:source('feature').name,value:source('feature').uuid}];data.trainer.edges.selected=[{uuid:source('edge').uuid,label:source('edge').name,value:source('edge').uuid}];
            for(const skill of Object.values(data.trainer.skills))skill.value=2;await data.refresh();
            check(data.trainer.features.computed.length===1&&data.trainer.edges.computed.length===1,'NPC refresh added dependencies.');
            const result=await data.generate();await result.setFlag('ptu','p02a',{batch,role:'npc'});
            check(owned(result).length===2&&result.system.skills.focus.value.value===2,'NPC changed selection/ranks.');check(views(result).length===2,'NPC diagnostics missing.');return{actor:result.uuid,items:owned(result).map(i=>({type:i.type,requirements:i.system.prerequisites,version:i.flags.ptu.selectedVersion})),reports:views(result),focusRank:result.system.skills.focus.value.value,pendingStarter:result.flags.ptu.starterTraining.status};
        });
    }else if(plan.phase==='canvas'){
        await record('linked-unlinked-canvas-token-drop',async()=>{
            let scene=game.scenes.find(s=>s.flags.ptu?.p02a===batch);if(!scene)scene=await Scene.create({name:'P02A canvas routes',width:1200,height:900,grid:{size:100},flags:{ptu:{p02a:batch}}});await scene.view();
            const rows=[];let x=100;
            for(const type of ['character','pokemon'])for(const linked of [true,false]){
                const actor=fixtureActor(type);let token=scene.tokens.find(t=>t.flags.ptu?.p02aToken===type+':'+linked);
                if(!token)[token]=await scene.createEmbeddedDocuments('Token',[{name:'P02A '+type+' '+linked,actorId:actor.id,actorLink:linked,x,y:200,width:1,height:1,flags:{ptu:{p02aToken:type+':'+linked}}}]);x+=220;
                await canvas.tokens.draw();
                const target=token.actor,key='canvas:'+type+':'+linked,before=numerics(target);let created;
                const point=token.object.center;
                {
                    const wait=new Promise((resolve,reject)=>{const listener=Hooks.on('createItem',item=>{if(item.parent?.uuid===target.uuid){Hooks.off('createItem',listener);clearTimeout(timer);resolve(item);}});const timer=setTimeout(()=>{Hooks.off('createItem',listener);reject(Error('Canvas drop timed out'));},10000);});
                    Hooks.call('dropCanvasData',canvas,{type:'Item',uuid:source('feature').uuid,x:point.x,y:point.y});created=await wait;await addMarker([created],key);
                }
                check(views(target).some(v=>v.id===created.id),'Token actor diagnostics missing.');check(same(before,numerics(target)),'Canvas drop changed numeric state.');rows.push({actor:target.uuid,token:token.uuid,linked,executed:true,numericBefore:before,numericAfter:numerics(target),item:created.uuid,diagnostic:created.prerequisiteDiagnostic});
            }
            return{scene:scene.uuid,rows};
        });
    }else if(plan.phase==='choice'){
        const actor=fixtureActor(plan.actorType);
        await record(plan.actorType+':'+plan.action,async()=>{
            let nested=source('nested');if(!nested)nested=await Item.create({name:'P02A nested Feature',type:'feat',flags:{ptu:{p02a:{batch,role:'nested'},selectedVersion:'synthetic nested'}},system:{prerequisites:['Master Focus'],rules:[{key:'GrantItem',uuid:source('pokeedge').uuid,allowduplicate:true}]}});
            const before=actor.toObject(),beforeNumeric=numerics(actor),beforeFolders=game.folders.size,beforeActors=game.actors.size;
            const wrapper={name:'P02A genuine choice',type:'effect',system:{rules:[{key:'ChoiceSet',flag:'chosen',adjustName:false,choices:[{label:'Nested Feature',value:nested.uuid},{label:'Edge',value:source('edge').uuid}]},{key:'GrantItem',uuid:'{item|flags.ptu.rulesSelections.chosen}',replaceSelf:true,allowduplicate:true}]}};
            if(plan.action==='cancel'||plan.action==='select'){
                let result,cancelled=false;try{result=await actor.createEmbeddedDocuments('Item',[wrapper]);}catch(error){if(!error.message.includes('No selection made'))throw error;cancelled=true;}
                if(plan.action==='cancel')check(cancelled&&same(actor.toObject(),before),'Cancellation changed saved actor/items.');
                else{check(!cancelled&&result.some(i=>i.type==='feat')&&result.some(i=>i.type==='pokeedge'),'Nested choice/grant failed.');check(same(numerics(actor),beforeNumeric),'Nested grants changed numeric state.');}
                return{cancelled,items:result?.map(i=>({uuid:i.uuid,type:i.type,requirements:i.system.prerequisites,diagnostic:i.prerequisiteDiagnostic})),savedStateUnchangedOnCancel:cancelled?true:undefined};
            }
            if(plan.action==='npc-cancel'){
                const {NpcQuickBuildData}=await import('/systems/ptu/src/module/apps/npc-quick-build/document.js');const data=new NpcQuickBuildData();data.trainer.level=5;data.party={};data.trainer.partySize=0;
                const choiceSource=await Item.create({name:'P02A NPC choice source',type:'feat',system:{prerequisites:['Level 99'],rules:wrapper.system.rules}});
                data.trainer.features.selected=[{uuid:choiceSource.uuid,label:choiceSource.name,value:choiceSource.uuid}];await data.refresh();let cancelled=false;try{await data.generate();}catch(error){if(!error.message.includes('No selection made'))throw error;cancelled=true;}
                check(cancelled&&game.actors.size===beforeActors&&game.folders.size===beforeFolders,'NPC cancellation wrote an actor/folder.');return{cancelled,actorCountUnchanged:true,folderCountUnchanged:true};
            }
            if(plan.action==='conditions'){
                const result=await actor.createEmbeddedDocuments('Item',[{name:'P02A conditional effect',type:'effect',system:{rules:[{key:'GrantItem',predicate:['p02a:not-present'],uuid:nested.uuid}]}}]);
                check(result.length===1&&actor.items.size===before.items.length+1,'Conditional effect predicate was bypassed.');
                return{conditionalEffectPreserved:true,onlyWrapperCreated:result.map(i=>i.uuid)};
            }
            throw Error('Unknown choice action');
        });
    }else if(plan.phase==='starter-start'){
        check(!fixtureActor('starter'),'Starter fixture already exists; inspect it.');await Actor.create({name:'P02A starter entitlement',type:'character',system:{health:{value:30},skills:Object.fromEntries(['athletics','command','charm','intimidate'].map(k=>[k,{value:{value:1}}]))},flags:{ptu:{p02a:{batch,role:'starter'}}}});return;
    }else if(plan.phase==='starter-check'){
        await record('one-time-starter-entitlement',async()=>{const actor=fixtureActor('starter'),before=actor.toObject();check(actor.flags.ptu.starterTraining.status==='complete'&&actor.itemTypes.feat.length===1,'Starting choice not completed once.');await actor.selectStarterTraining();check(same(before,actor.toObject()),'Completed starter repeated.');return{actor:actor.uuid,item:actor.itemTypes.feat[0].uuid,raw:actor.itemTypes.feat[0].system.prerequisites,status:actor.flags.ptu.starterTraining};});
    }else if(plan.phase==='permissions'){
        for(const item of game.items.filter(i=>i.flags.ptu?.p02a?.batch===batch))await item.update({'ownership.default':2});
        let playerMacro=game.macros.find(m=>m.flags.ptu?.p02aPlayer===batch);if(!playerMacro)playerMacro=await Macro.create({name:'P02-A player boundary check (disposable)',type:'script',command:"const {runP02APlayerCheck}=await import('/ptu02-acquisition/check.mjs?v='+Date.now()); await runP02APlayerCheck();",ownership:{default:2},flags:{ptu:{p02aPlayer:batch}}});
        report.playerMacro={id:playerMacro.id,role:player().role,script:player().can('MACRO_SCRIPT'),actorCreate:player().can('ACTOR_CREATE')};
        await record('owner-observer-and-recompute-setup',async()=>{const rows=[];for(const type of ['character','pokemon']){const actor=fixtureActor(type);await actor.update({['ownership.'+player().id]:3});let observer=fixtureActor(type+':observer');if(!observer)observer=await Actor.create(await actorData(type,type+':observer',['feature','edge','pokeedge'].map(role=>source(role).toObject())));await observer.update({['ownership.'+player().id]:2});check(actor.canUserModify(player(),'update')&&!observer.canUserModify(player(),'update'),'Ownership boundary incorrect.');rows.push({type,owner:actor.uuid,observer:observer.uuid,ownerAllowed:true,observerDenied:true});}return{player:player().id,rows};});
    }else if(plan.phase==='recompute'){
        await record('rank-and-prerequisite-change-recompute',async()=>{
            const rows=[];report.recomputeObservations=rows;
            for(const type of ['character','pokemon']){
                const actor=fixtureActor(type),item=owned(actor).find(i=>i.type==='feat'),raw=copy(item.system.prerequisites),rankDocument=type==='pokemon'?actor.species:actor,rankPath=type==='pokemon'?'system.skills.focus.value':'system.skills.focus.value.value',rank=foundry.utils.getProperty(rankDocument.toObject(),rankPath);
                const row={actor:actor.uuid,item:item.uuid};rows.push(row);
                try{
                    row.rankInput={document:rankDocument.uuid,path:rankPath,original:rank};
                    await rankDocument.update({[rankPath]:2});row.before=copy(item.prerequisiteDiagnostic);
                    await rankDocument.update({[rankPath]:6});row.ranked=copy(item.prerequisiteDiagnostic);
                    check(row.before.report.unmet.some(r=>r.skillKey==='focus'&&r.actual===2)&&row.ranked.report.satisfied.some(r=>r.skillKey==='focus'&&r.actual===6),'Rank change did not recompute.');
                    await item.update({'system.prerequisites':['Level 999','Custom changed requirement']});row.changed=copy(item.prerequisiteDiagnostic);
                    check(row.changed.unmet.length===1&&row.changed.unknown.length===1,'Changed raw prerequisite report incorrect.');
                }finally{await item.update({'system.prerequisites':raw});if(!plan.keepRank)await rankDocument.update({[rankPath]:rank});row.restored=copy(item.prerequisiteDiagnostic);}
            }return{rows};
        });
    }else if(plan.phase==='rank-change'){
        await record('single-species-rank-change-with-open-feature-sheet',async()=>{const actor=fixtureActor('pokemon'),item=owned(actor).find(i=>i.type==='feat'),before=copy(item.prerequisiteDiagnostic);await actor.species.update({'system.skills.focus.value':plan.rank});return{actor:actor.uuid,item:item.uuid,before,after:item.prerequisiteDiagnostic};});
    }else if(plan.phase==='shape'){
        await record('version-attribution-shapes-on-actual-item-and-actor-views',async()=>{
            const actor=fixtureActor('character'),item=owned(actor).find(i=>i.type==='edge'),before=item.toObject(),rows=[];
            try{await item.update({'system.prerequisites':['Untrained Focus']});
            for(const value of [{},'   ',[],42,true,{unrelated:'version'},null,'synthetic-original',{id:'synthetic-original'},{label:'Explicit synthetic label'}]){
                await item.unsetFlag('ptu','selectedVersion');await item.setFlag('ptu','selectedVersion',value);const snapshot=item.toObject(),view=item.prerequisiteDiagnostic,actorView=views(actor).find(v=>v.id===item.id);
                const meaningful=typeof value==='string'&&value.trim()||value&&typeof value==='object'&&!Array.isArray(value)&&(value.id||value.label);
                const row={requested:value,stored:copy(item.flags.ptu.selectedVersion),itemDiagnostic:copy(view),actorDiagnostic:copy(actorView)};rows.push(row);report.shapeObservations=rows;
                check(same(row.requested,row.stored),'Fixture flag value was merged or normalized.');
                check(view.report.satisfied.length===1&&view.report.unmet.length===0,'Attribution changed prerequisite truth.');check(view.clear===Boolean(meaningful)&&actorView.clear===view.clear,'Empty/unsupported attribution reported as clear.');check(same(snapshot,item.toObject()),'Diagnostic mutated saved values.');
            }
            return{item:item.uuid,rows,rawRestored:true};
            }finally{await item.update({'system.prerequisites':before.system.prerequisites});await item.unsetFlag('ptu','selectedVersion');if(before.flags.ptu.selectedVersion!==undefined)await item.setFlag('ptu','selectedVersion',before.flags.ptu.selectedVersion);}
        });
    }else if(plan.phase==='preserve'){
        await record('accepted-p02p-boundaries-after-acquisition',async()=>{
            const actor=game.actors.find(a=>a.flags.ptu?.p02a?.batch===batch&&owned(a).some(i=>canonical(i.sourceId)===packFeature)),item=actor&&owned(actor).find(i=>canonical(i.sourceId)===packFeature);check(item,'Actual acquired pack fixture missing.');
            await item.update({'system.prerequisites':['GM Permission','Custom saved requirement'],'system.keywords':['Custom saved keyword'],'system.range':'Custom saved range','system.rules':[],'system.referenceEffect':null});
            const before=item.toObject();await item.refreshFromCompendium();await item.refreshFromCompendium();const after=item.toObject();
            for(const field of Object.keys(before.system))check(same(before.system[field],after.system[field]),'Refresh changed protected '+field);check(same(before.flags,after.flags),'Refresh changed grants/selections.');
            const {MigrationRunner}=await import('/systems/ptu/src/module/migration/runner/index.js');let fail=true;const migration={version:0.115,updateItem:async raw=>{raw.system.p02aRecovered=true;if(fail)throw Error('P02A injected failure');}};
            await item.update({'system.schema.version':0.110});const failureBefore=item.toObject();let rejected=false;try{await MigrationRunner.ensureSchemaVersion(item,[migration]);}catch(error){rejected=error.message==='P02A injected failure';}check(rejected&&same(failureBefore,item.toObject()),'False schema stamp or mutation after failure.');
            fail=false;await MigrationRunner.ensureSchemaVersion(item,[migration]);await item.update(item.toObject(),{diff:false,recursive:false});check(item.system.schema.version===0.115&&item.system.p02aRecovered,'Retry did not recover.');
            return{before,after,failureBefore,failureUnchanged:true,recovered:item.toObject(),worldSchema:game.settings.get('ptu','worldSchemaVersion')};
        });
    }else if(plan.phase==='scope'){
        await record('scope-stays-separate-from-advisory-prerequisites',async()=>{
            const actor=fixtureActor('pokemon'),before=actor.toObject(),blocked=[];
            for(const uuid of ['Compendium.ptu.species.Item.dkQPNz0RLbgzWMLq','Compendium.ptu.species.Item.jAIJeRtRc1sUekjO','Compendium.ptu.effects.Item.3w7uQfBvzzxATXis']){
                let denied=false;try{await actor.sheet.emulateItemDrop({type:'Item',uuid});}catch(error){denied=error.message.includes('excluded');}check(denied,'Known excluded acquisition was not denied.');blocked.push(uuid);
            }
            check(same(actor.toObject(),before),'Excluded guard input changed actor.');return{blocked,noExcludedBehaviorExecuted:true};
        });
    }else if(plan.phase==='identity'){
        await record('same-name-distinct-version-and-rename',async()=>{
            const rows=[];
            for(const type of ['character','pokemon']){
                const actor=fixtureActor(type),[original,revised]=await actor.createEmbeddedDocuments('Item',[source('feature').toObject(),source('revised').toObject()]);
                const before=[original,revised].map(i=>({id:i.id,raw:copy(i.system.prerequisites),version:copy(i.flags.ptu.selectedVersion),diagnostic:i.prerequisiteDiagnostic}));
                check(original.name===revised.name&&!same(before[0].raw,before[1].raw),'Distinct same-name fixture not established.');
                await original.update({name:'Localized <b>Feature</b>'});
                check(same(before[0].raw,original.system.prerequisites)&&same(before[0].version,original.flags.ptu.selectedVersion),'Rename changed selected requirements/version.');
                const row={actor:actor.uuid,before,after:[original,revised].map(i=>({uuid:i.uuid,name:i.name,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic}))};rows.push(row);report.identityObservations=rows;
                const first=original.prerequisiteDiagnostic.report,second=revised.prerequisiteDiagnostic.report;
                check(same(first.rawRequirements,before[0].raw)&&same(second.rawRequirements,before[1].raw),'Selected raw requirements were substituted.');
                check(first.unmet.some(r=>r.skillKey==='focus'&&r.required===6&&r.actual===2)&&second.unmet.some(r=>r.skillKey==='charm'&&r.required===3&&r.actual===2),'Selected version skill reports were substituted.');
            }return{rows,syntheticVersions:true};
        });
    }else if(plan.phase==='display'){
        const actor=fixtureActor(plan.actorType);await actor.sheet.render(true);
        if(plan.itemSheet)await owned(actor).find(i=>i.type==='feat').sheet.render(true);
        return;
    }else if(plan.phase==='ui-verify'){
        await record('observer-ui-unchanged-and-owner-ui-created-pokeedge',async()=>{
            const expected=await(await fetch('/ptu02-acquisition/player-expected.json',{cache:'no-store'})).json(),rows=[];
            for(const type of ['character','pokemon']){const row=expected.scenarios.find(s=>s.id===type+':observer:direct').observed,actor=fixtureActor(type+':observer'),actual=await digest(actor.toObject());check(actual===row.beforeHash,'Observer UI changed actor '+type);rows.push({actor:actor.uuid,beforeHash:row.beforeHash,afterHash:actual});}
            const item=fixtureActor('character').items.get(plan.createdItemId);check(item?.type==='pokeedge'&&item.prerequisiteDiagnostic.report.attributionIssues.length===1,'Owner UI Poké Edge creation missing.');
            return{observers:rows,ownerCreatedItem:{uuid:item.uuid,raw:item.toObject(),diagnostic:item.prerequisiteDiagnostic}};
        });
    }else if(plan.phase==='token-audit'){
        const expected=await(await fetch('/ptu02-acquisition/expected-tokens.json',{cache:'no-store'})).json();
        await record('original-token-checkpoint-protected-items-and-inherited-base-additions',async()=>{
            const rows=[];report.tokenAudit=rows;
            for(const row of expected.tokens){const token=await fromUuid(row.uuid),actual=owned(token.actor).map(i=>({id:i.id,uuid:i.uuid,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic})),observed={uuid:token.uuid,tokenSourceUnchanged:await digest(token.toObject())===row.hash,actorHashUnchanged:await digest(token.actor.toObject())===row.actorHash,reportsHashUnchanged:await digest(views(token.actor))===row.reportsHash,expectedItems:row.items,actualItems:actual,additionalInheritedIds:actual.filter(i=>!row.items.some(e=>e.id===i.id)).map(i=>i.id)};rows.push(observed);check(observed.tokenSourceUnchanged,'Persisted token source changed.');for(const item of row.items){const found=actual.find(i=>i.id===item.id);check(found&&same(found,item),'Previously acquired token Item/report changed: '+item.id);}}
            for(const row of rows){const token=await fromUuid(row.uuid),base=game.actors.get(token.actorId);row.baseActor=base.uuid;row.additionalItemsMatchBase=row.additionalInheritedIds.every(id=>{const item=token.actor.items.get(id),baseItem=base.items.get(id);return baseItem&&same(item.system.prerequisites,baseItem.system.prerequisites)&&same(item.flags.ptu?.selectedVersion,baseItem.flags.ptu?.selectedVersion);});check(row.additionalItemsMatchBase,'Additional token Items do not match exact base identities.');}
            return{rows};
        });
    }else if(plan.phase==='checkpoint'){
        report.persisted=plan.tokensOnly?[]:await Promise.all(game.actors.filter(a=>a.flags.ptu?.p02a?.batch===batch).map(async a=>({id:a.id,role:a.flags.ptu.p02a.role,hash:await digest(a.toObject()),reportsHash:await digest(views(a)),itemIds:a.items.map(i=>i.id)})));
        const scene=game.scenes.find(s=>s.flags.ptu?.p02a===batch);check(scene,'Task scene missing.');
        report.scenePersisted={uuid:scene.uuid,hash:await digest(scene.toObject()),tokens:await Promise.all(scene.tokens.filter(t=>t.flags.ptu?.p02aToken).map(async t=>({uuid:t.uuid,role:t.flags.ptu.p02aToken,linked:t.actorLink,hash:await digest(t.toObject()),actor:t.actor.uuid,actorHash:await digest(t.actor.toObject()),reportsHash:await digest(views(t.actor)),items:owned(t.actor).map(i=>({id:i.id,uuid:i.uuid,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic}))})))};
        check(report.scenePersisted.tokens.length===4&&report.scenePersisted.tokens.filter(t=>!t.linked).length===2&&report.scenePersisted.tokens.every(t=>t.items.length>=4),'Nonempty linked/unlinked acquired token fixtures required.');
        await record(plan.tokensOnly?'stable-token-checkpoint':'pre-reload-saved-fixture-checkpoint',async()=>({actors:report.persisted.length,items:report.persisted.reduce((n,a)=>n+a.itemIds.length,0),tokens:report.scenePersisted.tokens.length}));
    }else if(plan.phase==='reload'||plan.phase==='token-reload'){
        if(plan.phase==='reload'){
        const baseline=await(await fetch('/ptu02-acquisition/baseline.json',{cache:'no-store'})).json();
        await record('preexisting-data-and-persisted-reports',async()=>{for(const row of baseline.actors)check(await digest(game.actors.get(row.id).toObject())===row.hash,'Pre-existing actor changed: '+row.id);for(const row of baseline.items)check(await digest(game.items.get(row.id).toObject())===row.hash,'Pre-existing world Item changed: '+row.id);check(game.settings.get('ptu','worldSchemaVersion')===baseline.worldSchema,'World schema changed.');return{actors:baseline.actors.length,items:baseline.items.length,unchanged:true,fixtures:['character','pokemon','npc','starter'].map(role=>{const actor=fixtureActor(role);return{role,actor:actor.uuid,reports:views(actor),numeric:numerics(actor)};})};});
        const expected=await(await fetch('/ptu02-acquisition/expected.json',{cache:'no-store'})).json();
        await record('every-recorded-task-fixture-and-report-after-reload',async()=>{
            check(expected.length>0,'Empty actor checkpoint.');
            for(const row of expected){const actor=game.actors.get(row.id);check(actor&&await digest(actor.toObject())===row.hash,'Saved task actor changed: '+row.id);check(await digest(views(actor))===row.reportsHash,'Derived saved report changed: '+row.id);}
            return{actors:expected.length,items:expected.reduce((n,a)=>n+a.itemIds.length,0),exactHashes:true,rows:expected};
        });
        }
        const expectedScene=await(await fetch('/ptu02-acquisition/expected-tokens.json',{cache:'no-store'})).json();
        await record('linked-and-unlinked-token-source-items-and-reports-after-reload',async()=>{
            check(expectedScene.tokens.length===4&&expectedScene.tokens.filter(t=>!t.linked).length===2,'Four expected token fixtures, including two unlinked, required.');
            const scene=await fromUuid(expectedScene.uuid);check(scene&&await digest(scene.toObject())===expectedScene.hash,'Task scene source changed.');
            const rows=[];for(const row of expectedScene.tokens){check(row.items.length>=4,'Empty token acquisition checkpoint.');const token=await fromUuid(row.uuid);check(token&&token.actor.uuid===row.actor&&await digest(token.toObject())===row.hash,'Saved token identity/source changed: '+row.uuid);check(await digest(token.actor.toObject())===row.actorHash&&await digest(views(token.actor))===row.reportsHash,'Saved synthetic/world token actor or report changed: '+row.uuid);rows.push({uuid:token.uuid,linked:token.actorLink,actor:token.actor.uuid,tokenHash:await digest(token.toObject()),actorHash:await digest(token.actor.toObject()),reportsHash:await digest(views(token.actor)),items:owned(token.actor).map(i=>({id:i.id,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic}))});}
            return{scene:scene.uuid,sceneHash:await digest(scene.toObject()),rows,exactHashes:true};
        });
    }else throw Error('Unknown acquisition phase');
    const escaped=foundry.utils.escapeHTML(JSON.stringify(report,null,2));
    new Dialog({title:'P02-A acquisition result',content:`<h2>${report.scenarios.filter(s=>s.result==='pass').length}/${report.scenarios.length} P02-A checks passed</h2><ul>${report.scenarios.map(s=>`<li>${s.result}: ${s.id}</li>`).join('')}</ul><textarea id="p02a-result" style="width:100%;height:350px">${escaped}</textarea>`,buttons:{close:{label:'Close'}}},{width:1000,height:760}).render(true);
    return report;
}

export async function runP02APlayerCheck(){
    check(!game.user.isGM&&game.world.id==='ptu-verification','Use the existing player in the disposable world only.');
    const plan=await(await fetch('/ptu02-acquisition/plan.json',{cache:'no-store'})).json();
    const report={batch,phase:'actual-player',testedRuntime:plan.testedRuntime,executionId:crypto.randomUUID(),user:game.user.id,role:game.user.role,scenarios:[]};
    const record=async(id,fn)=>{try{report.scenarios.push({id,result:'pass',observed:await fn()});}catch(error){report.scenarios.push({id,result:'fail',error:error.message,stack:error.stack});}};
    for(const type of ['character','pokemon']){
        const actor=fixtureActor(type),observer=fixtureActor(type+':observer');
        const actions={
            direct:target=>target.createEmbeddedDocuments('Item',[source('feature').toObject()]),
            sheetNew:target=>target.sheet._onItemCreate({preventDefault(){},currentTarget:{dataset:{type:'edge'}}}),
            sheetDrop:target=>target.sheet.emulateItemDrop({type:'Item',uuid:source('feature').uuid}),
            nativePackDrop:target=>target.sheet.emulateItemDrop({type:'Item',uuid:packFeature}),
            savedJSON:target=>target.createEmbeddedDocuments('Item',[JSON.parse(JSON.stringify(source('revised').toObject()))]),
            mixedFolder:target=>target.sheet._onDropFolder(null,{type:'Folder',uuid:source('feature').folder.uuid}),
            duplicate:async target=>[await owned(target)[0].clone({},{save:true,addSource:true})],
            repeat:target=>target.createEmbeddedDocuments('Item',[source('feature').toObject(),source('feature').toObject()]),
            nestedGrant:target=>target.createEmbeddedDocuments('Item',[source('nested').toObject()])
        };
        for(const [route,action] of Object.entries(actions)){
            await record(type+':owner:'+route,async()=>{const before=numerics(actor),ids=actor.items.map(i=>i.id);const added=await action(actor);check(added?.length&&same(before,numerics(actor)),'Owner addition denied or changed numeric state.');for(const item of added)if(ADVISORY_TYPES.includes(item.type))check(views(actor).some(v=>v.id===item.id),'Player-owned diagnostic missing.');return{actor:actor.uuid,numericBefore:before,numericAfter:numerics(actor),idsBefore:ids,idsAfter:actor.items.map(i=>i.id),added:added.map(i=>({uuid:i.uuid,type:i.type,raw:i.system.prerequisites,version:i.flags.ptu.selectedVersion,diagnostic:i.prerequisiteDiagnostic}))};});
            await record(type+':observer:'+route,async()=>{const before=observer.toObject();let denied=false;try{await action(observer);}catch(error){denied=true;}check(same(before,observer.toObject()),'Observer route changed saved actor.');return{actor:observer.uuid,deniedOrEmpty:true,threw:denied,beforeHash:await digest(before),afterHash:await digest(observer.toObject()),reports:views(observer)};});
        }
    }
    await record('npc-generation-ordinary-role-denial',async()=>{check(!game.user.can('ACTOR_CREATE'),'Fixture player unexpectedly has Actor creation permission.');const {NpcQuickBuildData}=await import('/systems/ptu/src/module/apps/npc-quick-build/document.js');let denied=false;const before={actors:game.actors.size,folders:game.folders.size};try{await new NpcQuickBuildData().generate();}catch(error){denied=error.message.includes('permission');}check(denied&&same(before,{actors:game.actors.size,folders:game.folders.size}),'NPC normal role boundary failed.');return{before,after:{actors:game.actors.size,folders:game.folders.size},denied};});
    const escaped=foundry.utils.escapeHTML(JSON.stringify(report,null,2));new Dialog({title:'P02-A player result',content:`<h2>${report.scenarios.filter(s=>s.result==='pass').length}/${report.scenarios.length} player checks passed</h2><textarea id="p02a-result" style="width:100%;height:350px">${escaped}</textarea>`,buttons:{close:{label:'Close'}}},{width:1000,height:600}).render(true);
    return report;
}
const ADVISORY_TYPES=['feat','edge','pokeedge'];
