// Test-only runner, served from disposable Data/ptu02-checks. Never shipped with the system.
const batch = 'ptu02-gen1-8-20261025';
const sourceUuid = 'Compendium.ptu.items.Item.2kQmUgVMnwb8JfW4';
const speciesUuid = 'Compendium.ptu.species.Item.QE7WhquxeuebiEVQ';
const flag = kind => ({ptu:{verificationBatch:batch,verificationKind:kind}});
const fixtureActor = kind => game.actors.find(actor => actor.getFlag('ptu','verificationBatch') === batch && actor.getFlag('ptu','verificationKind') === kind);
const check = (value,message) => { if (!value) throw new Error(message); };

export async function runIntegrationCheck() {
    check(game.ready && game.user.isGM && game.world.id === 'ptu-verification' && game.system.id === 'ptu','Use the disposable PTU world as GM.');
    const plan = await (await fetch('/ptu02-checks/integration-plan.json',{cache:'no-store'})).json();
    const report = {batch,phase:plan.phase,foundryVersion:game.version,systemVersion:game.system.version,checkedAt:new Date().toISOString(),scenarios:[]};
    async function record(id, action) {
        try { report.scenarios.push({id,result:'pass',details:await action()}); }
        catch(error) { report.scenarios.push({id,result:'fail',error:error.message,stack:error.stack?.split('\n').slice(0,4)}); }
    }
    let trainer = fixtureActor('trainer');
    let pokemon = fixtureActor('pokemon');
    let observer = fixtureActor('observer');
    let player = game.users.find(user => user.getFlag('ptu','verificationBatch') === batch);
    if (plan.phase === 'setup') {
        await record('trainer-create',async()=>{
            trainer ??= await Actor.create({name:'PTU 02 — Trainer',type:'character',flags:flag('trainer')});
            return {actor:trainer.id,type:trainer.type,sheet:trainer.sheet.constructor.name};
        });
        await record('full-generation',async()=>{
            if (!pokemon) {
                const species = await fromUuid(speciesUuid);
                check(species?.system.number === 1 && species.system.form === '', 'Expected the recorded Generation 1 fixture.');
                const generator = new game.ptu.species.generator(species);
                await generator.prepare({minLevel:5,maxLevel:5,shinyChance:0,statRandomness:0,preventEvolution:true,saveDefault:false});
                const result = await generator.create({folder:null,generate:true});
                pokemon = result.actor;
                await pokemon.update({name:'PTU 02 — Bulbasaur',flags:flag('pokemon')});
            }
            check(pokemon.species?.system.number === 1,'Generated actor has the wrong species.');
            check(pokemon.system.level.current >= 5,'Generation did not save its level.');
            return {actor:pokemon.id,species:pokemon.species.uuid,sourceId:pokemon.species.sourceId,level:pokemon.system.level.current,
                moves:pokemon.itemTypes.move.map(item=>({id:item.id,sourceId:item.sourceId})),abilities:pokemon.itemTypes.ability.length,capabilities:pokemon.itemTypes.capability.length};
        });
        await record('acquisition-and-refresh',async()=>{
            check(trainer,'Trainer fixture missing.');
            const source = await fromUuid(sourceUuid);
            const imported = game.items.fromCompendium(source,{clearFolder:true});
            imported.flags.ptu = {...imported.flags.ptu,verificationCase:'refresh'};
            let item = trainer.items.find(item=>item.getFlag('ptu','verificationCase') === 'refresh');
            item ??= (await trainer.createEmbeddedDocuments('Item',[imported]))[0];
            check(item.sourceId === sourceUuid,'Imported core source identity is not readable.');
            await item.update({'system.quantity':0,'system.enabled':false,name:'PTU 02 custom label',img:'icons/svg/d20-grey.svg'});
            const before = item.toObject();
            await item.refreshFromCompendium();
            await item.refreshFromCompendium();
            check(String(item.system.quantity) === '0','Refresh changed owned quantity.');
            check(item.system.enabled === false,'Refresh changed enabled state.');
            check(item.name === before.name && item.img === before.img,'Refresh changed a custom label or image.');
            check(item._stats.compendiumSource === before._stats.compendiumSource,'Refresh rewrote source provenance.');
            return {actor:trainer.id,item:item.id,sourceId:item.sourceId,quantity:item.system.quantity,enabled:item.system.enabled,customImagePreserved:true};
        });
        await record('custom-and-deleted-source',async()=>{
            check(trainer,'Trainer fixture missing.');
            for(const kind of ['custom','deleted']) {
                let item=trainer.items.find(item=>item.getFlag('ptu','verificationCase')===kind);
                item ??= (await trainer.createEmbeddedDocuments('Item',[{name:`PTU 02 ${kind} source`,type:'item',system:{quantity:3,enabled:false},
                    flags:{ptu:{verificationCase:kind}},_stats:{compendiumSource:kind==='deleted'?'Compendium.ptu.items.Item.0000000000000000':null}}]))[0];
                const before=JSON.stringify(item.toObject());
                await item.refreshFromCompendium();
                check(JSON.stringify(item.toObject())===before,`${kind} source refresh changed the item.`);
            }
            return {customUnchanged:true,deletedUnchanged:true};
        });
        await record('player-and-observer-fixtures',async()=>{
            player ??= await User.create({name:'PTU 02 Player',role:CONST.USER_ROLES.PLAYER,flags:flag('player')});
            observer ??= await Actor.create({name:'PTU 02 — Observer-only trainer',type:'character',flags:flag('observer')});
            await trainer.update({[`ownership.${player.id}`]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER});
            await observer.update({[`ownership.${player.id}`]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER});
            if(pokemon)await pokemon.update({[`ownership.${player.id}`]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER});
            check(trainer.canUserModify(player,'update'),'Player cannot modify the owned trainer.');
            check(!observer.canUserModify(player,'update'),'Observer can modify the GM fixture.');
            return {player:player.id,trainer:trainer.id,observer:observer.id,ownerCanUpdate:true,observerCannotUpdate:true};
        });
        await record('linked-unlinked-tokens',async()=>{
            check(pokemon,'Pokemon fixture missing.');
            let scene=game.scenes.find(scene=>scene.getFlag('ptu','verificationBatch')===batch);
            scene ??= await Scene.create({name:'PTU 02 integration',width:1200,height:800,grid:{size:100},flags:flag('scene')});
            await scene.activate();
            if(scene.tokens.size===0){
                const linked=await pokemon.getTokenDocument({x:100,y:100,actorLink:true});
                const unlinked=await pokemon.getTokenDocument({x:400,y:100,actorLink:false});
                await scene.createEmbeddedDocuments('Token',[linked.toObject(),unlinked.toObject()]);
            }
            const linked=scene.tokens.find(token=>token.actorLink);
            const unlinked=scene.tokens.find(token=>!token.actorLink);
            check(linked&&unlinked,'Token fixtures missing.');
            await linked.actor.setFlag('ptu','verificationTokenMarker','linked-shared');
            await unlinked.actor.setFlag('ptu','verificationTokenMarker','unlinked-only');
            check(pokemon.getFlag('ptu','verificationTokenMarker')==='linked-shared','Linked token did not share actor state.');
            check(unlinked.actor.getFlag('ptu','verificationTokenMarker')==='unlinked-only','Unlinked token state did not persist.');
            return {scene:scene.id,linked:linked.id,unlinked:unlinked.id,linkedSharesActor:true,unlinkedIndependent:true};
        });
    } else if (plan.phase === 'compatibility') {
        await record('legacy-and-repeated-import',async()=>{
            const source=await fromUuid(sourceUuid);
            const first=game.items.fromCompendium(source,{clearFolder:true});
            const second=game.items.fromCompendium(source,{clearFolder:true});
            check(first._stats.compendiumSource===sourceUuid&&second._stats.compendiumSource===sourceUuid,'Repeated import lost current identity.');
            const legacy={...first,_stats:{...first._stats,compendiumSource:null},flags:{core:{sourceId:sourceUuid}}};
            const document=new CONFIG.Item.documentClass(legacy,{parent:trainer});
            check(document.sourceId===sourceUuid,'Legacy identity cannot be read by the live item class.');
            const actor=new CONFIG.Actor.documentClass({name:'Legacy actor fixture',type:'character',flags:{core:{sourceId:'Actor.0123456789abcdef'}}});
            check(actor.sourceId==='Actor.0123456789abcdef','Legacy actor identity cannot be read.');
            return {legacyItem:document.sourceId,legacyActor:actor.sourceId,currentRepeatedImport:true,transientOnly:true};
        });
        await record('trainer-create-missing-training',async()=>{
            const actor=await Actor.create({name:'PTU 02 — Missing training warning',type:'character',flags:flag('missing-training')});
            check(actor?.id&&actor.items.size===0,'Unexpected training granted for an unresolved identity.');
            check(await fromUuid('Compendium.ptu.edges.Item.xiZydXM8sex5CP7O')===null,'Starter-training fixture no longer missing.');
            return {actor:actor.id,starterTraining:'unresolved',created:true,trainingNotRecovered:true};
        });
    } else if (['trainer-sheet','pokemon-sheet'].includes(plan.phase)) {
        await record(plan.phase,async()=>{
            const actor=plan.phase==='trainer-sheet'?trainer:pokemon;
            check(actor,'Actor fixture missing.');
            await actor.sheet._render(true);
            check(actor.sheet.rendered,'Actor sheet did not finish rendering.');
            return {actor:actor.id,sheet:actor.sheet.constructor.name,rendered:true};
        });
    } else if (plan.phase === 'macro') {
        await record('bundled-type-matrix-macro',async()=>{
            const macro=await fromUuid('Compendium.ptu.macros.Macro.XGxaPZzFSyRg8ykw');
            check(macro.command==='game.ptu.typeMatrix.render(true)','Bundled macro changed since code inspection.');
            await macro.execute();
            return {macro:macro.uuid,commandInspected:true};
        });
    } else if (plan.phase === 'level-up') {
        check(pokemon,'Pokemon fixture missing.');
        const {levelProgression}=await import('/systems/ptu/src/scripts/config/data/level-progression.js');
        const oldSetting=game.settings.get('ptu','automation.levelUpScreen');
        await pokemon.setFlag('ptu','verificationLevelUpSetting',oldSetting);
        await game.settings.set('ptu','automation.levelUpScreen',true);
        pokemon.update({'system.level.exp':levelProgression[pokemon.system.level.current+1]})
            .then(async actor=>{await actor.setFlag('ptu','verificationLevelUpComplete',actor.system.level.current);await game.settings.set('ptu','automation.levelUpScreen',oldSetting);})
            .catch(error=>ui.notifications.error(`PTU 02 level-up test: ${error.message}`));
        return; // The real Level-Up form must be submitted through the UI.
    } else if (plan.phase === 'reload') {
        await record('saved-reloaded-state',async()=>{
            check(trainer&&pokemon&&observer&&player,'Saved fixtures missing.');
            const item=trainer.items.find(item=>item.getFlag('ptu','verificationCase')==='refresh');
            check(item?.sourceId===sourceUuid&&String(item.system.quantity)==='0'&&item.system.enabled===false,'Saved item state changed.');
            check(pokemon.species.system.number===1,'Saved species changed.');
            const scene=game.scenes.find(scene=>scene.getFlag('ptu','verificationBatch')===batch);
            const unlinked=scene.tokens.find(token=>!token.actorLink);
            check(pokemon.getFlag('ptu','verificationTokenMarker')==='linked-shared'&&unlinked.actor.getFlag('ptu','verificationTokenMarker')==='unlinked-only','Saved token states changed.');
            return {trainer:trainer.id,trainerName:trainer.name,pokemon:pokemon.id,item:item.id,level:pokemon.system.level.current,levelUpComplete:pokemon.getFlag('ptu','verificationLevelUpComplete'),
                ownedPermission:trainer.canUserModify(player,'update'),observerPermission:observer.canUserModify(player,'update')};
        });
    }
    report.fixtures={trainer:trainer?.id,pokemon:pokemon?.id,observer:observer?.id,player:player?.id};
    const text=JSON.stringify(report,null,2).replaceAll('&','&amp;').replaceAll('<','&lt;');
    new Dialog({title:'PTU 02 integration result',content:`<textarea id="ptu02-integration-result" readonly style="width:100%;height:500px">${text}</textarea>`,buttons:{close:{label:'Close'}}},{width:900,height:620}).render(true);
    return report;
}
