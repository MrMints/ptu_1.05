// Disposable GM-only P03 foundation check. Not installed in the system archive.
export async function runP03Check() {
    if (!game.user.isGM || game.world.id !== 'ptu-verification') throw Error('Disposable GM only.');
    const {NpcQuickBuildData} = await import('/systems/ptu/src/module/apps/npc-quick-build/document.js');
    const {PTUNpcQuickBuild} = await import('/systems/ptu/src/module/apps/npc-quick-build/sheet.js');
    const {diagnosePrerequisites,evaluatePrerequisite} = await import('/systems/ptu/src/util/prerequisites.js');
    const check=(ok,message)=>{if(!ok)throw Error(message);};
    const report={batch:'P03-2026-10-26',foundry:game.version,system:game.system.version,scenarios:[]};
    const record=async(id,fn)=>{try{report.scenarios.push({id,result:'passed',evidence:await fn()});}catch(e){report.scenarios.push({id,result:'failed',error:e.message,stack:e.stack});}};
    const fixtures=[];
    const lifecycle={created:[],reused:[],roleCounts:{}};
    for (const [role,type,prerequisites] of [
        ['original','feat',['Master Focus','GM Permission','Synthetic dependency']],
        ['revised','feat',['Novice Focus','Custom condition']],
        ['edge','edge',['Level 99','Adept Technology Edu']],
        ['dependency','edge',[]]
    ]) {
        const existing=game.items.filter(i=>i.getFlag('ptu','p03Fixture')===role);
        check(existing.length<=1,`Duplicate persisted fixture role: ${role}`);
        let doc=existing[0];
        if(doc) lifecycle.reused.push(doc.uuid);
        if (!doc) doc=await Item.create({name:role==='edge'||role==='dependency'?`P03 ${role}`:'P03 Same Name',type,
            flags:{ptu:{p03Fixture:role}},system:{prerequisites,source:{value:'Explicit synthetic diagnostic fixture'},rules:[]}});
        if(!existing.length) lifecycle.created.push(doc.uuid);
        lifecycle.roleCounts[role]=game.items.filter(i=>i.getFlag('ptu','p03Fixture')===role).length;
        fixtures.push(doc);
    }
    const [original,revised,edge,dependency]=fixtures;
    report.fixtureLifecycle=lifecycle;
    report.persistedFixtures=fixtures.map(i=>({uuid:i.uuid,source:i.toObject()}));
    const versions={[original.uuid]:{id:'synthetic-original',label:'Synthetic non-errata'},[revised.uuid]:{id:'synthetic-revised',label:'Synthetic errata'},[edge.uuid]:'synthetic edge'};
    const data=new NpcQuickBuildData();
    data.trainer.partySize=0;data.party={};data.trainer.level=5;
    data.trainer.features.selected=[original,revised].map(doc=>({uuid:doc.uuid,label:doc.name,value:doc.uuid}));
    data.trainer.edges.selected=[{uuid:edge.uuid,label:edge.name,value:edge.uuid}];
    data._staticMultiselects.features.options=[...data.trainer.features.selected];
    data._staticMultiselects.edges.options=[...data.trainer.edges.selected,{uuid:dependency.uuid,label:dependency.name,value:dependency.uuid}];
    data.prerequisiteContext={selectedVersions:versions,references:{'Synthetic dependency':dependency.uuid}};
    const before=structuredClone({features:data.trainer.features.selected,edges:data.trainer.edges.selected,
        ranks:Object.fromEntries(Object.entries(data.trainer.skills).map(([k,s])=>[k,s.value])),items:fixtures.map(i=>i.toObject())});
    await record('actual-module-refresh-with-content',async()=>{
        await data.refresh();await data.refresh();
        const after={features:data.trainer.features.selected,edges:data.trainer.edges.selected,ranks:Object.fromEntries(Object.entries(data.trainer.skills).map(([k,s])=>[k,s.value])),items:fixtures.map(i=>i.toObject())};
        check(JSON.stringify(before)===JSON.stringify(after),'Explicit inputs or source Items changed.');
        check(data.trainer.features.computed.length===2&&data.trainer.edges.computed.length===1,'Dependencies added or selections dropped.');
        check(data.warnings.unmet.length===5&&data.warnings.unknown.length===2,'Incorrect itemized warning counts.');
        return {before,after,reports:data.prerequisiteReports,warnings:data.warnings};
    });
    await record('same-name-renamed-version-reports',async()=>{
        const a=data.prerequisiteReports[0],b=data.prerequisiteReports[1];
        check(a.identity.uuid!==b.identity.uuid&&a.identity.selectedVersion.id!==b.identity.selectedVersion.id,'Versions merged.');
        check(a.requirements[0].required===6&&b.requirements[0].required===3,'Wrong version prerequisites.');
        const renamed={...original.toObject(),uuid:original.uuid,name:'Renamed synthetic original'};
        const r=diagnosePrerequisites({actor:data.prerequisiteActor({level:5,allComputed:[],skillsComputed:{focus:2}}),item:renamed,selectedVersion:versions[original.uuid]});
        check(r.identity.uuid===a.identity.uuid&&r.requirements[0].actual===2&&r.requirements[0].required===6,'Rename changed identity/evaluation.');
        return {original:a.identity,revised:b.identity,renamed:r.identity};
    });
    await record('comma-negative-or-list-positive',async()=>{
        const actor={system:{skills:{athletics:{value:{total:4}},combat:{value:{total:1}}}}};
        const rows=['Adept Athletics, Novice Combat','Adept Athletics or Novice Combat','Two of Athletics, Combat at Novice'].map(raw=>evaluatePrerequisite(raw,{actor}));
        check(rows.map(r=>r.status).join(',')==='unverifiable,satisfied,unmet','Comma/OR/count semantics failed.');
        return rows;
    });
    await record('distinct-item-count-negative-and-positive',async()=>{
        const actor={system:{skills:{focus:{value:{total:3}}}},items:[original,revised]};
        const references={Original:original.uuid,Alias:original.uuid,Revised:revised.uuid};
        const rows=['Two of Novice Focus or Novice Focus Rank','Two of Original or Alias','Two of Original or Revised','Two of Focus or Willpower at Novice'].map(raw=>evaluatePrerequisite(raw,{actor,references}));
        check(rows.map(r=>r.status).join(',')==='unverifiable,unmet,satisfied,unmet','Item count identity/skill overlap failed.');
        return rows;
    });
    await record('recompute-without-input-mutation',async()=>{
        const old=structuredClone(data.prerequisiteReports);
        data.trainer.skills.focus.value=6;
        await data.refresh();
        check(old[0].requirements[0].status==='unmet'&&data.prerequisiteReports[0].requirements[0].status==='satisfied','Actor changes not reflected.');
        check(data.trainer.features.computed.length===2&&data.trainer.edges.computed.length===1,'Recompute changed content.');
        return {old,new:data.prerequisiteReports};
    });
    await record('actual-npc-form-with-advisory-warnings',async()=>{
        const sheet=new PTUNpcQuickBuild();sheet.data=data;sheet.data.page=2;
        await sheet.renderAsync(true);
        check(sheet.rendered,'Form not rendered.');
        const root=sheet.element[0];
        check(root.querySelector('.warning-title')?.textContent.includes('Advisory'),'Advisory title missing.');
        check(root.querySelectorAll('.warnings .unmet').length===3&&root.querySelectorAll('.warnings .unknown').length===2,'Visible warnings incorrect.');
        check(root.textContent.includes('Synthetic non-errata')&&root.textContent.includes('Synthetic errata'),'Version attribution not visible.');
        check(root.querySelector('.next-page')&&!root.querySelector('.next-page').disabled,'Warnings blocked progression.');
        return {rendered:true,warnings:data.warnings,fixtureUuids:fixtures.map(i=>i.uuid),noActorCreated:true};
    });
    const text=JSON.stringify(report,null,2).replaceAll('&','&amp;').replaceAll('<','&lt;');
    new Dialog({title:'P03 foundation result',content:`<textarea id="p03-result" readonly style="width:100%;height:500px">${text}</textarea>`,buttons:{close:{label:'Close'}}},{width:900,height:620}).render(true);
    return report;
}
