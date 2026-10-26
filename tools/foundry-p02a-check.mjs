// GM-only diagnostic for the named disposable world. Synthetic fixtures are not approved variants.
const batch='P02-A-2026-10-26';
const packFeature='Compendium.ptu.feats.Item.TQ6scoBM3iZKMuZT';
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
            await route('browser',async()=>{const browser=game.ptu.compendiumBrowser;await browser.loadTab('feats');check(browser.tabs.feats.indexData.some(i=>i.uuid===packFeature),'Real browser entry unavailable.');await browser.close();return actor.sheet.emulateItemDrop({type:'Item',uuid:packFeature});});
            await route('native-compendium',async()=>{const doc=await game.items.importFromCompendium('ptu.feats',packFeature.split('.').at(-1),{name:'P02A native import'});return actor.sheet.emulateItemDrop({type:'Item',uuid:doc.uuid});});
            await route('owned-world-copy',()=>actor.createEmbeddedDocuments('Item',[source('revised').toObject()]));
            await route('mixed-folder',async()=>{let folder=game.folders.find(f=>f.flags.ptu?.p02aFolder===batch);if(!folder)folder=await Folder.create({name:'P02A mixed source folder',type:'Item',flags:{ptu:{p02aFolder:batch}}});for(const role of ['feature','edge','pokeedge'])await source(role).update({folder:folder.id});return actor.sheet._onDropFolder(null,{type:'Folder',uuid:folder.uuid});},3);
            await route('json-restore',async()=>{const [item]=await actor.createEmbeddedDocuments('Item',[{name:'P02A restore destination',type:'feat'}]);await item.importFromJSON(JSON.stringify(source('feature').toObject()));check(same(item.system.prerequisites,source('feature').system.prerequisites),'JSON restore changed raw requirements.');return[item];});
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
                const target=token.actor,key='canvas:'+type+':'+linked,before=numerics(target);let created;
                {
                    const wait=new Promise((resolve,reject)=>{const listener=Hooks.on('createItem',item=>{if(item.parent?.uuid===target.uuid){Hooks.off('createItem',listener);clearTimeout(timer);resolve(item);}});const timer=setTimeout(()=>{Hooks.off('createItem',listener);reject(Error('Canvas drop timed out'));},10000);});
                    Hooks.call('dropCanvasData',canvas,{type:'Item',uuid:source('feature').uuid,x:token.x+50,y:token.y+50});created=await wait;await addMarker([created],key);
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
        await record('owner-observer-and-recompute-setup',async()=>{const rows=[];for(const type of ['character','pokemon']){const actor=fixtureActor(type);await actor.update({['ownership.'+player().id]:3});let observer=fixtureActor(type+':observer');if(!observer)observer=await Actor.create(await actorData(type,type+':observer',['feature','edge','pokeedge'].map(role=>source(role).toObject())));await observer.update({['ownership.'+player().id]:2});check(actor.canUserModify(player(),'update')&&!observer.canUserModify(player(),'update'),'Ownership boundary incorrect.');rows.push({type,owner:actor.uuid,observer:observer.uuid,ownerAllowed:true,observerDenied:true});}return{player:player().id,rows};});
    }else if(plan.phase==='recompute'){
        await record('rank-and-prerequisite-change-recompute',async()=>{const rows=[];for(const type of ['character','pokemon']){const actor=fixtureActor(type),item=owned(actor).find(i=>i.type==='feat'),before=copy(item.prerequisiteDiagnostic);await actor.update({'system.skills.focus.value.value':6});const ranked=copy(item.prerequisiteDiagnostic);check(ranked.report.unmet.length===before.report.unmet.length-1,'Rank change did not recompute.');const raw=copy(item.system.prerequisites);await item.update({'system.prerequisites':['Level 999','Custom changed requirement']});const changed=copy(item.prerequisiteDiagnostic);check(changed.unmet.length===1&&changed.unknown.length===1,'Changed raw prerequisite report incorrect.');await item.update({'system.prerequisites':raw});rows.push({actor:actor.uuid,item:item.uuid,before,ranked,changed,restored:item.prerequisiteDiagnostic});}return{rows};});
    }else if(plan.phase==='shape'){
        await record('version-attribution-shapes-on-actual-item-and-actor-views',async()=>{
            const actor=fixtureActor('character'),item=owned(actor).find(i=>i.type==='edge'),before=item.toObject(),rows=[];
            await item.update({'system.prerequisites':['Untrained Focus']});
            for(const value of [{},'   ',[],42,true,{unrelated:'version'},null,'synthetic-original',{id:'synthetic-original'},{label:'Explicit synthetic label'}]){
                await item.update({'flags.ptu.selectedVersion':value});const snapshot=item.toObject(),view=item.prerequisiteDiagnostic,actorView=views(actor).find(v=>v.id===item.id);
                const meaningful=typeof value==='string'&&value.trim()||value&&typeof value==='object'&&!Array.isArray(value)&&(value.id||value.label);
                check(view.report.satisfied.length===1&&view.report.unmet.length===0,'Attribution changed prerequisite truth.');check(view.clear===Boolean(meaningful)&&actorView.clear===view.clear,'Empty/unsupported attribution reported as clear.');check(same(snapshot,item.toObject()),'Diagnostic mutated saved values.');rows.push({value,clear:view.clear,attribution:view.report.attributionIssues});
            }
            await item.update({'system.prerequisites':before.system.prerequisites,'flags.ptu.selectedVersion':before.flags.ptu.selectedVersion});return{item:item.uuid,rows,rawRestored:true};
        });
    }else if(plan.phase==='preserve'){
        await record('accepted-p02p-boundaries-after-acquisition',async()=>{
            const actor=game.actors.find(a=>a.flags.ptu?.p02a?.batch===batch&&owned(a).some(i=>i.sourceId===packFeature)),item=actor&&owned(actor).find(i=>i.sourceId===packFeature);check(item,'Actual acquired pack fixture missing.');
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
    }else if(plan.phase==='reload'){
        const baseline=await(await fetch('/ptu02-acquisition/baseline.json',{cache:'no-store'})).json();
        await record('preexisting-data-and-persisted-reports',async()=>{for(const row of baseline.actors)check(await digest(game.actors.get(row.id).toObject())===row.hash,'Pre-existing actor changed: '+row.id);for(const row of baseline.items)check(await digest(game.items.get(row.id).toObject())===row.hash,'Pre-existing world Item changed: '+row.id);check(game.settings.get('ptu','worldSchemaVersion')===baseline.worldSchema,'World schema changed.');return{actors:baseline.actors.length,items:baseline.items.length,unchanged:true,fixtures:['character','pokemon','npc','starter'].map(role=>{const actor=fixtureActor(role);return{role,actor:actor.uuid,reports:views(actor),numeric:numerics(actor)};})};});
    }else throw Error('Unknown acquisition phase');
    const escaped=foundry.utils.escapeHTML(JSON.stringify(report,null,2));
    new Dialog({title:'P02-A acquisition result',content:`<h2>${report.scenarios.filter(s=>s.result==='pass').length}/${report.scenarios.length} P02-A checks passed</h2><ul>${report.scenarios.map(s=>`<li>${s.result}: ${s.id}</li>`).join('')}</ul><textarea id="p02a-result" style="width:100%;height:350px">${escaped}</textarea>`,buttons:{close:{label:'Close'}}},{width:1000,height:760}).render(true);
    return report;
}
