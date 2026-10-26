// Disposable UI probe: selections are made through the normal bundled Tagify widget.
export async function openNpcIdentityProbe({phase='baseline'}={}) {
    if(game.world.id!=='ptu-verification')throw Error('Disposable world only');
    const {PTUNpcQuickBuild}=await import('/systems/ptu/src/module/apps/npc-quick-build/sheet.js');
    const {actorPrerequisiteViews}=await import('/systems/ptu/src/util/acquisition.js');
    const runtimeBindings=await Promise.all(['src/module/apps/npc-quick-build/document.js','src/module/apps/npc-quick-build/sheet.js','src/module/apps/npc-quick-build/selection.js','static/templates/apps/npc-quick-build-sheet.hbs'].map(async path=>{
        const bytes=await fetch(`/systems/ptu/${path}`,{cache:'no-store'}).then(r=>r.arrayBuffer());
        return {path,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')};
    }));
    const sheet=new PTUNpcQuickBuild();
    sheet.data.trainer.partySize=phase==='baseline'?0:1;sheet.data.party={};sheet.data.trainer.name=`P03 NPC ${phase}`;
    if(sheet.data.trainer.partySize)sheet.data.resetPokemonSlot('slot1');
    await sheet.data.preload();
    let fixtures=[];
    if(phase!=='baseline'&&game.user.isGM) {
        const pack=game.packs.get('world.p03-npc-identity')??await CompendiumCollection.createCompendium({name:'p03-npc-identity',label:'P03 NPC identity fixtures (disposable)',type:'Item'});
        fixtures=await pack.getDocuments();
        for(const kind of ['class','feat','edge','species'])for(const version of ['A','B']) {
            const role=`${kind}-${version}`;if(fixtures.some(i=>i.getFlag('ptu','npcIdentityRole')===role))continue;
            let input;
            if(kind==='species') {
                input=(await fromUuid('Compendium.ptu.species.Item.QE7WhquxeuebiEVQ')).toObject();delete input._id;
                input.effects=[];input._stats={};input.flags={};
            }else input={type:kind==='class'?'feat':kind,system:{prerequisites:[version==='A'?'Master Focus':'Adept Charm','GM Permission'],effect:`Synthetic ${role} effect`,keywords:kind==='class'?['Class']:[],rules:kind==='feat'?[{key:'ChoiceSet',flag:'npcProbeChoice',choices:[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}]}]:[]}};
            input.name=`NPC Identity ${kind}`;input.system.source={value:`Synthetic diagnostic ${role}`};
            input.flags={ptu:{npcIdentityRole:role,selectedVersion:{id:`synthetic-${role}`,label:`Synthetic ${role}`},npcCustom:{role,preserve:'exact'}}};
            fixtures.push(await Item.create(input,{pack:pack.collection}));
        }
        await pack.getIndex({fields:['system.keywords','system.class','system.prerequisites','system.source']});
        const browser=game.ptu.compendiumBrowser,settings=foundry.utils.deepClone(browser.settings);
        try {
            for(const kind of ['feats','edges','species'])browser.settings[kind][pack.collection]={load:true};
            await sheet.data.preload();
        }finally{browser.settings=settings;}
    }
    sheet.data.page=2;
    const probe={phase,sheet,initialActorIds:game.actors.map(a=>a.id),initialFolderIds:game.folders.map(f=>f.id),observations:[]};
    globalThis.__npcIdentityProbe=probe;
    const hook=Hooks.on('ptu.preTrainerGenerated',(actorData,data)=>{if(data===sheet.data){actorData.flags.ptu.npcIdentityProbe={phase,session:sheet.appId};}});
    await sheet.renderAsync(true);
    const snapshot=()=>({phase,foundry:game.version,runtimeBindings,user:{id:game.user.id,isGM:game.user.isGM,canCreateActor:game.user.can('ACTOR_CREATE')},
        rendered:sheet.rendered,page:sheet.data.page,selections:{classes:sheet.data.trainer.classes.selected,features:sheet.data.trainer.features.selected,edges:sheet.data.trainer.edges.selected},
        computed:[...sheet.data.trainer.features.computed,...sheet.data.trainer.edges.computed],subSelectables:sheet.data.trainer.subSelectables,
        party:Object.fromEntries(Object.entries(sheet.data.party).map(([key,p])=>[key,{configured:p.configured,uuid:p.species.uuid,selected:p.species.selected,name:p.species.name}])),
        sex:sheet.data.trainer.sex,selectionIssues:sheet.data.selectionIssues,
        fixtureSources:fixtures.map(i=>({uuid:i.uuid,source:i.toObject()})),
        ranks:Object.fromEntries(Object.entries(sheet.data.trainer.skills).map(([k,s])=>[k,s.value])),warnings:sheet.data.warnings,
        reports:sheet.data.prerequisiteReports,actorIds:game.actors.map(a=>a.id),folderIds:game.folders.map(f=>f.id),
        newActors:game.actors.filter(a=>!probe.initialActorIds.includes(a.id)).map(a=>({uuid:a.uuid,source:a.toObject()})),
        savedProbeActors:game.actors.filter(a=>a.flags.ptu?.npcIdentityProbe||a.items.some(i=>i.flags.ptu?.npcIdentityRole)).map(a=>({uuid:a.uuid,source:a.toObject(),diagnostics:actorPrerequisiteViews(a)})),
        medicalOptions:sheet.data.multiselects.features.options.filter(o=>o.uuid?.endsWith('WscZukROrNeC7Ayp')||o.uuid?.endsWith('bNVcfm2VHWfhEQGi'))});
    new Dialog({title:'P03 NPC identity probe',content:`<button type="button" data-npc-action="capture">Capture NPC state</button><button type="button" data-npc-action="refresh">Refresh twice and capture</button><button type="button" data-npc-action="rename">Rename fixture B and refresh</button><textarea id="npc-identity-result" readonly style="width:100%;height:280px"></textarea>`,buttons:{},close:()=>Hooks.off('ptu.preTrainerGenerated',hook),
        render:html=>html.find('[data-npc-action]').on('click',async event=>{
            try{
                if(event.currentTarget.dataset.npcAction==='refresh'){await sheet.renderAsync(true);await sheet.renderAsync(true);}
                if(event.currentTarget.dataset.npcAction==='rename'){
                    await fixtures.find(i=>i.getFlag('ptu','npcIdentityRole')==='feat-B').update({name:'NPC Identity renamed Feature B'});
                    await sheet.renderAsync(true);
                }
                const result=structuredClone(snapshot());probe.observations.push(result);html.find('#npc-identity-result').val(JSON.stringify(result,null,2));
            }catch(error){html.find('#npc-identity-result').val(JSON.stringify({error:error.message,stack:error.stack},null,2));}
        })},{width:430,height:420,left:0,top:0}).render(true);
    return probe;
}
