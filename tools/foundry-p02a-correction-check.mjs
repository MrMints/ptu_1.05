// Explicit GM/player diagnostics restricted to the disposable PTU verification world.
const batch='P02-A-correction-2026-10-26';
const clone=v=>foundry.utils.deepClone(v),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(v))))).map(n=>n.toString(16).padStart(2,'0')).join('');
const marked=d=>d.flags.ptu?.p02ac?.batch===batch;
const getActor=(group,type,kind)=>game.actors.find(a=>marked(a)&&a.flags.ptu.p02ac.group===group&&a.flags.ptu.p02ac.role===type+':'+kind);
const counter=actor=>actor.itemTypes.condition.find(i=>i.flags.ptu?.p02acCounter)??actor.itemTypes.condition.find(i=>i.system.slug==='cancellation-counter');
const child=()=>game.items.find(i=>marked(i)&&i.flags.ptu.p02ac.role==='child-source');
const numeric=a=>{const s=a.toObject().system;return{skills:s.skills,stats:s.stats,level:s.level,health:s.health,money:s.money};};
function conditionData(){return{name:'Cancellation Counter',type:'condition',flags:{ptu:{p02acCounter:true}},system:{slug:'cancellation-counter',value:{isValued:true,value:1},rules:[],description:'Synthetic cancellation counter'}};}
async function actorData(group,type,role){
    const data={name:'P02AC '+group+' '+role,type,flags:{ptu:{p02ac:{batch,group,role},starterTraining:{status:'pending'}}},system:{health:{value:30}},items:[conditionData()]};
    if(type==='pokemon'){const species=game.items.fromCompendium(await fromUuid('Compendium.ptu.species.Item.QE7WhquxeuebiEVQ'));species.system.rules=[];data.items.unshift(species);}
    return data;
}
function choiceData(type){return{name:'P02AC cancellable '+type,type,flags:{ptu:{selectedVersion:{id:'synthetic-choice',label:'Synthetic saved choice'}}},system:{prerequisites:['Master Focus','GM Permission','Custom retained requirement'],notes:'Custom retained notes',rules:[{key:'ChoiceSet',flag:'selected',adjustName:false,choices:[{label:'Keep original',value:'original'},{label:'Keep revised',value:'revised'}]}]}};}
function graph(kind='edge'){const parent='p02acparent00001',childId='p02acchild000001',template=kind==='condition'?game.items.find(i=>marked(i)&&i.flags.ptu.p02ac.role==='condition-source'):child();return[
    {_id:parent,name:'P02AC saved parent',type:'feat',flags:{ptu:{selectedVersion:{id:'synthetic-original'},rulesSelections:{saved:'custom'},itemGrants:{savedEdge:{id:childId,onDelete:'detach'}}}},system:{prerequisites:['Master Focus','GM Permission'],notes:'Custom parent notes',slug:'p02ac-saved-parent',stackSlugs:true,rules:[{key:'GrantItem',uuid:template.uuid,flag:'savedEdge',allowduplicate:true}]}},
    {_id:childId,name:'P02AC saved child',type:kind,flags:{ptu:{selectedVersion:{id:'synthetic-revised'},grantedBy:{id:parent,onDelete:'cascade'}}},system:{prerequisites:['Custom child requirement'],notes:'Custom child notes',slug:'p02ac-saved-child',stackSlugs:true,rules:[],...(kind==='condition'?{value:{isValued:true,value:4}}:{})}}
];}
const protectedItem=i=>{const d=i.toObject();return{id:i.id,uuid:i.uuid,name:d.name,type:d.type,system:d.system,flags:d.flags,diagnostic:i.prerequisiteDiagnostic};};
const persistedItems=actor=>Promise.all(actor.items.map(async i=>({id:i.id,uuid:i.uuid,type:i.type,systemHash:await hash(i.toObject().system),flagsHash:await hash(i.toObject().flags),raw:i.system.prerequisites,version:i.flags.ptu?.selectedVersion,slug:i.system.slug,value:i.type==='condition'?i.value:undefined,grantedBy:i.flags.ptu?.grantedBy,itemGrants:i.flags.ptu?.itemGrants,reportHash:await hash(i.prerequisiteDiagnostic)})));

export async function runP02ACorrectionCheck(){
    assert(game.world.id==='ptu-verification','Disposable world only.');
    const plan=await(await fetch('/ptu02-correction/plan.json',{cache:'no-store'})).json();
    const report={batch,phase:plan.phase,group:plan.group,runtime:plan.runtime,executionId:crypto.randomUUID(),user:game.user.id,isGM:game.user.isGM,foundry:game.version,scenarios:[]};
    report.servedItemBaseSha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await(await fetch('/systems/ptu/src/module/item/base.js',{cache:'no-store'})).arrayBuffer()))).map(n=>n.toString(16).padStart(2,'0')).join('');
    const record=async(id,fn)=>{try{const observed=await fn();report.scenarios.push({id,result:'pass',observed});if(observed?.runs)report.graphObservations=report.graphObservations?.filter(row=>row.actor!==observed.actor);}catch(e){report.scenarios.push({id,result:'fail',error:e.message,stack:e.stack});}};
    if(plan.phase==='init'){
        assert(game.user.isGM,'GM setup only.');
        report.baseline={actors:await Promise.all(game.actors.map(async d=>({id:d.id,hash:await hash(d.toObject())}))),items:await Promise.all(game.items.map(async d=>({id:d.id,hash:await hash(d.toObject())}))),scenes:await Promise.all(game.scenes.map(async d=>({id:d.id,hash:await hash(d.toObject())}))),schema:game.settings.get('ptu','worldSchemaVersion')};
        await record('new-isolated-fixtures',async()=>{
            assert(!getActor(plan.group,'character','feat'),'Group already exists; preserve and choose a new group.');
            if(!child())await Item.create({name:'P02AC genuine grant source',type:'edge',ownership:{default:2},flags:{ptu:{p02ac:{batch,role:'child-source'},selectedVersion:'synthetic new grant'}},system:{prerequisites:['Custom new-grant requirement'],notes:'Template notes',rules:[]}});
            if(!game.items.find(i=>marked(i)&&i.flags.ptu.p02ac.role==='condition-source'))await Item.create({...conditionData(),flags:{ptu:{p02ac:{batch,role:'condition-source'}}},ownership:{default:2}});
            const actors=[];for(const type of ['character','pokemon'])for(const kind of ['feat','edge','observer']){const actor=await Actor.create(await actorData(plan.group,type,type+':'+kind));assert(counter(actor)?.value===1,'Counter did not initialize at one.');actors.push({role:type+':'+kind,uuid:actor.uuid,counter:counter(actor).toObject()});}
            const player=game.users.find(u=>!u.isGM);for(const actor of game.actors.filter(a=>marked(a)&&a.flags.ptu.p02ac.group===plan.group))await actor.update({['ownership.'+player.id]:actor.flags.ptu.p02ac.role.endsWith(':observer')?2:3});
            let macro=game.macros.find(m=>m.flags.ptu?.p02ac===batch);if(!macro)macro=await Macro.create({name:'P02-A correction check (disposable)',type:'script',ownership:{default:2},flags:{ptu:{p02ac:batch}},command:"const {runP02ACorrectionCheck}=await import('/ptu02-correction/check.mjs?v='+Date.now());await runP02ACorrectionCheck();"});
            return{actors,macro:macro.uuid,player:player.id};
        });
    }else if(plan.phase==='mixed'){
        const actor=getActor(plan.group,plan.actorType,plan.itemType),existing=counter(actor),before=actor.toObject(),beforeValue=existing.value,input=[existing.toObject(),choiceData(plan.itemType)];
        await record(plan.actorType+':'+plan.itemType+':'+plan.action+(plan.prepared?':prepared':''),async()=>{
            const {sluggify}=await import('/systems/ptu/src/util/misc.js');const matched=actor.itemTypes.condition.find(c=>c.slug===sluggify(input[0].name.replaceAll(/\d/g,'')));assert(matched?.id===existing.id,'Fixture does not reach existing-condition increment path.');report.matchedExistingConditionId=matched.id;
            let cancelled=false,created;try{if(plan.prepared){const prepared=await CONFIG.Item.documentClass.prepareCreation(input,{parent:actor});report.preparedState={hash:await hash(actor.toObject()),value:existing.value};assert(same(before,actor.toObject()),'Preparation persisted a condition/other write.');created=await CONFIG.Item.documentClass.createDocuments(prepared,{parent:actor});}else created=await actor.createEmbeddedDocuments('Item',input);}catch(e){if(!e.message.includes('No selection made'))throw e;cancelled=true;}
            const observed={actor:actor.uuid,before,after:actor.toObject(),beforeValue,afterValue:existing.value,cancelled,created:created?.map(protectedItem),numericBefore:numeric({toObject:()=>before}),numericAfter:numeric(actor)};report.mixedObservation=observed;
            if(plan.action==='cancel')assert(cancelled&&same(before,actor.toObject()),'Cancellation changed the complete saved actor.');
            else{assert(!cancelled&&created.length===1&&existing.value===beforeValue+1,'Success did not apply one condition increment and one Item.');assert(same(input[1].system.prerequisites,created[0].system.prerequisites)&&same(input[1].flags.ptu.selectedVersion,created[0].flags.ptu.selectedVersion),'Custom raw/version data changed.');assert(same(observed.numericBefore,observed.numericAfter),'Acquisition changed unrelated numeric state.');}
            return observed;
        });
    }else if(plan.phase==='graphs'){
        assert(game.user.isGM,'GM fresh graph actors only.');
        for(const type of ['character','pokemon'])for(const mode of ['keep','condition-keep','copy','condition-copy','manual-keep','manual-copy','manual-condition-keep','manual-condition-copy','prepared','new-rule'])await record(type+':graph:'+mode,async()=>{
            const keep=mode.endsWith('keep'),actor=await Actor.create(await actorData(plan.group,type,type+':graph:'+mode+':'+report.executionId)),input=graph(mode.includes('condition')?'condition':'edge'),runs=[];
            if(mode.startsWith('manual'))input[0].system.rules=[];
            if(mode.startsWith('manual-condition')){const flags=input[1].flags;input[1]={...counter(actor).toObject(),_id:input[1]._id,flags};input[1].system.value.value=4;input[1].system.prerequisites=['Custom same-slug condition'];input[1].system.notes='Custom child notes';input[1].system.stackSlugs=true;}
            const original=clone(input);
            if(mode==='new-rule')input[0].system.rules.push({key:'GrantItem',uuid:child().uuid,flag:'newEdge',allowduplicate:true});
            for(let run=0;run<(mode.endsWith('copy')?2:1);run++){
                const before=actor.toObject(),beforeItems=actor.items.map(i=>i.toObject());const added=mode==='prepared'?await CONFIG.Item.documentClass.createDocuments(await CONFIG.Item.documentClass.prepareCreation(input,{parent:actor}),{parent:actor}):await actor.createEmbeddedDocuments('Item',input,keep?{keepId:true}:{});
                const row={beforeHash:await hash(before),afterHash:await hash(actor.toObject()),numericBefore:numeric({toObject:()=>before}),numericAfter:numeric(actor),itemIdsBefore:before.items.map(i=>i._id),itemIdsAfter:actor.items.map(i=>i.id),existingItems:await Promise.all(beforeItems.map(async i=>({id:i._id,beforeHash:await hash(i),afterHash:await hash(actor.items.get(i._id).toObject())}))),added:added.map(protectedItem)};runs.push(row);report.graphObservations??=[];report.graphObservations.push({actor:actor.uuid,mode,run,...row});
                assert(row.existingItems.every(i=>i.beforeHash===i.afterHash),'Graph acquisition changed an existing Item.');
                assert(added.length===(mode==='new-rule'?3:2),'Saved graph replayed or lost a child.');const [parent,savedChild]=added;
                assert(parent.flags.ptu.itemGrants.savedEdge.id===savedChild.id&&savedChild.flags.ptu.grantedBy.id===parent.id,'Reciprocal saved relationship changed.');
                if(keep)assert(parent.id===input[0]._id&&savedChild.id===input[1]._id,'ID-preserving restore changed IDs.');else assert(parent.id!==input[0]._id&&savedChild.id!==input[1]._id,'Copy did not assign independent IDs.');
                for(const [index,item] of [parent,savedChild].entries())for(const key of ['prerequisites','notes','slug','stackSlugs'])assert(same(item.toObject().system[key],original[index].system[key]),'Saved custom '+key+' changed.');
                for(const [index,item] of [parent,savedChild].entries())assert(same(item.flags.ptu.selectedVersion,original[index].flags.ptu.selectedVersion),'Saved version context changed.');
                if(mode.includes('condition'))assert(savedChild.value===4&&counter(actor).value===1,'Saved condition value was merged or incremented.');
                if(mode==='new-rule')assert(parent.flags.ptu.itemGrants.newEdge.id===added[2].id&&added[2].flags.ptu.grantedBy.id===parent.id,'Genuine new grant was suppressed.');
                assert(same(numeric({toObject:()=>before}),numeric(actor)),'Graph copy changed numeric actor state.');
            }
            if(keep){const before=actor.toObject();let denied=false;try{await actor.createEmbeddedDocuments('Item',input,{keepId:true});}catch(e){denied=true;}assert(denied&&same(before,actor.toObject()),'Repeated saved-ID restore changed the owned graph.');}
            return{actor:actor.uuid,mode,input,runs};
        });
    }else if(plan.phase==='ambiguous-graphs'){
        assert(game.user.isGM,'GM fresh ambiguity fixtures.');
        for(const type of ['character','pokemon'])for(const keep of [true,false])for(const kind of ['missing-flag','blank-flag','one-sided','duplicate-id'])await record(type+':unestablished-rule-association:'+(keep?'keep':'copy')+':'+kind,async()=>{
            const actor=await Actor.create(await actorData(plan.group,type,type+':ambiguous:'+keep+':'+kind+':'+report.executionId)),input=graph(kind==='blank-flag'?'condition':'edge'),before=actor.toObject();if(kind==='missing-flag')delete input[0].system.rules[0].flag;if(kind==='blank-flag')input[0].system.rules[0].flag='';if(kind==='one-sided')input[1].flags.ptu.grantedBy.id='unprovenparent01';if(kind==='duplicate-id')input.push(clone(input[1]));let error=null,added;
            try{added=await actor.createEmbeddedDocuments('Item',input,keep?{keepId:true}:{});}catch(e){error=e.message;}
            const observed={actor:actor.uuid,input,before,after:actor.toObject(),error,added:added?.map(protectedItem)};report.ambiguousObservations??=[];report.ambiguousObservations.push(observed);
            assert(error&&/association|incomplete|inconsistent|Ambiguous saved grant/.test(error)&&same(before,actor.toObject()),'Unestablished saved association replayed or changed the saved actor.');return observed;
        });
    }else if(plan.phase==='nested'){
        await record(plan.actorType+':fresh-nested-choice-and-grant',async()=>{
            let nested=game.items.find(i=>marked(i)&&i.flags.ptu.p02ac.role==='nested-source');
            if(!nested){assert(game.user.isGM,'GM prepares nested source.');nested=await Item.create({name:'P02AC nested Feature',type:'feat',ownership:{default:2},flags:{ptu:{p02ac:{batch,role:'nested-source'},selectedVersion:'synthetic nested'}},system:{prerequisites:['Master Focus','GM Permission'],rules:[{key:'GrantItem',uuid:child().uuid,flag:'child',allowduplicate:true}]}});}
            const actor=getActor(plan.group,plan.actorType,'feat'),before=actor.toObject(),added=await actor.createEmbeddedDocuments('Item',[{name:'P02AC nested genuine choice',type:'effect',system:{rules:[{key:'ChoiceSet',flag:'chosen',adjustName:false,choices:[{label:'Nested Feature',value:nested.uuid},{label:'Edge only',value:child().uuid}]},{key:'GrantItem',uuid:'{item|flags.ptu.rulesSelections.chosen}',replaceSelf:true,allowduplicate:true}]}}]);
            assert(added.length===2&&added.some(i=>i.type==='feat')&&added.some(i=>i.type==='edge'),'Nested grant was suppressed or replayed.');assert(same(numeric({toObject:()=>before}),numeric(actor)),'Nested grant changed unrelated actor values.');return{actor:actor.uuid,before,after:actor.toObject(),added:added.map(protectedItem)};
        });
    }else if(plan.phase==='starter-start'){
        assert(game.user.isGM,'GM starter fixture.');assert(!getActor(plan.group,'character','starter'),'Starter fixture exists; inspect rather than recreating.');await Actor.create({name:'P02AC one-time starter',type:'character',system:{health:{value:30}},flags:{ptu:{p02ac:{batch,group:plan.group,role:'character:starter'}}}});return;
    }else if(plan.phase==='starter-check'){
        await record('actual-new-starter-choice-and-repeat-denial',async()=>{const actor=getActor(plan.group,'character','starter');assert(actor?.flags.ptu.starterTraining.status==='complete'&&actor.itemTypes.feat.length===1,'New starter did not complete once.');const before=actor.toObject();await actor.selectStarterTraining();assert(same(before,actor.toObject()),'Completed starter repeated.');return{actor:actor.uuid,saved:actor.toObject(),diagnostics:actor.prerequisiteDiagnostics};});
    }else if(plan.phase==='non-owner'){
        assert(!game.user.isGM,'Actual player only.');
        for(const type of ['character','pokemon'])for(const mode of ['mixed','keep','copy','prepared'])await record(type+':observer:'+mode,async()=>{
            const actor=getActor(plan.group,type,'observer'),before=actor.toObject(),input=mode==='mixed'?[counter(actor).toObject(),choiceData('feat')]:graph();let result,denied=false;
            try{result=mode==='prepared'?await CONFIG.Item.documentClass.prepareCreation(input,{parent:actor}):await actor.createEmbeddedDocuments('Item',input,mode==='keep'?{keepId:true}:{});}catch(e){denied=true;}
            assert(same(before,actor.toObject())&&(!result||result.length===0),'Non-owner changed actor or staged an acquisition.');return{actor:actor.uuid,before,after:actor.toObject(),denied,empty:!result?.length};
        });
    }else if(plan.phase==='checkpoint'){
        assert(game.user.isGM,'GM checkpoint only.');report.expected={actors:await Promise.all(game.actors.filter(marked).map(async a=>({id:a.id,hash:await hash(a.toObject()),items:await persistedItems(a)})))};
        await record('nonempty-saved-correction-fixtures',async()=>{assert(report.expected.actors.length>=12,'Missing correction fixtures.');return{actors:report.expected.actors.length};});
    }else if(plan.phase==='reload'){
        assert(game.user.isGM,'GM reload comparison only.');const expected=await(await fetch('/ptu02-correction/expected.json',{cache:'no-store'})).json(),baseline=await(await fetch('/ptu02-correction/baseline.json',{cache:'no-store'})).json();
        await record('exact-correction-actors-graphs-custom-data-and-reports-after-reload',async()=>{assert(expected.actors.length>=12,'Empty expected fixtures.');for(const row of expected.actors){const actor=game.actors.get(row.id);assert(actor&&await hash(actor.toObject())===row.hash,'Saved correction actor changed: '+row.id);assert(same(await persistedItems(actor),row.items),'Saved graph/custom/report changed: '+row.id);}return{actors:expected.actors.length,items:expected.actors.reduce((n,a)=>n+a.items.length,0),rows:expected.actors};});
        await record('preexisting-actors-items-scenes-and-world-schema-unchanged',async()=>{for(const [key,collection] of [['actors',game.actors],['items',game.items],['scenes',game.scenes]])for(const row of baseline[key])assert(await hash(collection.get(row.id).toObject())===row.hash,'Protected '+key+' changed: '+row.id);assert(game.settings.get('ptu','worldSchemaVersion')===baseline.schema,'World schema changed.');return{actors:baseline.actors.length,items:baseline.items.length,scenes:baseline.scenes.length,schema:baseline.schema};});
    }else throw Error('Unknown correction phase');
    new Dialog({title:'P02-A correction result',content:`<h2>${report.scenarios.filter(s=>s.result==='pass').length}/${report.scenarios.length} passed</h2><textarea id="p02ac-result" style="width:100%;height:330px">${foundry.utils.escapeHTML(JSON.stringify(report,null,2))}</textarea>`,buttons:{close:{label:'Close'}}},{width:1000,height:650}).render(true);return report;
}
