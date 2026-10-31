// Test-only runner. Serve from disposable Data/ptu03-checks, never from the system archive.
const check = (ok, message) => { if (!ok) throw new Error(message); };
const equal = (a, b, message) => check(JSON.stringify(a) === JSON.stringify(b), message);
const batch = 'skills-03-2026-10-25';
const flags = role => ({ptu: {verificationSkills03: {batch, role}}});
const numeric = actor => Object.fromEntries(Object.entries(actor.system.skills).map(([key, skill]) => [key, {
    value: skill.value, modifier: skill.modifier, rank: skill.rank, slug: skill.slug
}]));
function show(report) {
    const text = JSON.stringify(report,null,2).replaceAll('&','&amp;').replaceAll('<','&lt;');
    new Dialog({title:'PTU 03 skill acceptance result',content:`<textarea id="ptu03-result" readonly style="width:100%;height:500px">${text}</textarea>`,buttons:{close:{label:'Close'}}},{width:900,height:620}).render(true);
}

export async function runSkillsCheck() {
    check(game.user.isGM && game.world.id === 'ptu-verification', 'Disposable world GM only.');
    const plan = await fetch('/ptu03-checks/plan.json', {cache:'no-store'}).then(r => r.json());
    const {SKILLS, resolveSkillKey, getSkillLabel} = await import('/systems/ptu/src/util/skills.js');
    const {NpcQuickBuildData} = await import('/systems/ptu/src/module/apps/npc-quick-build/document.js');
    const {createSkillModifier} = await import('/systems/ptu/src/module/actor/modifiers.js');
    const {sluggify} = await import('/systems/ptu/src/util/misc.js');
    const keys = Object.keys(SKILLS);
    const report = {batch, phase:plan.phase, foundryVersion:game.version, systemVersion:game.system.version, scenarios:[]};
    const record = async (id, fn) => {
        try { report.scenarios.push({id, result:'passed', evidence:await fn()}); }
        catch (error) { report.scenarios.push({id, result:'failed', error:error.message, stack:error.stack}); }
    };
    const find = role => game.actors.find(a => {
        const marker = a.getFlag('ptu','verificationSkills03');
        return marker?.batch === batch && marker.role === role;
    });
    let trainer = find('existing-trainer');
    let pokemon = find('generated-pokemon');

    if (plan.phase === 'core') {
        await record('existing-trainer-fixture', async () => {
            if (!trainer) trainer = await Actor.create({name:'PTU 03 — Existing labels', type:'character', flags:flags('existing-trainer'),
                system:{skills:Object.fromEntries(Object.entries(SKILLS).map(([key, skill], i) => [key, {
                    label:skill.aliases[0] ?? skill.name, value:{value:2 + i % 5}, modifier:{value:i % 7 - 3}
                }])), background:{adept:'generalEd',novice:'pokemonEd',pathetic:{one:'focus',two:'charm',three:'intimidate'}}}});
            const old = numeric(trainer);
            const source = trainer.toObject();
            for (const [key, definition] of Object.entries(SKILLS)) source.system.skills[key].label = definition.name;
            const canonical = new CONFIG.Actor.documentClass(source);
            equal(numeric(canonical), old, 'Labels changed existing trainer calculations.');
            await trainer.setFlag('ptu','verificationSkills03Expected', {numeric:old, sourceSkills:trainer.toObject().system.skills, background:trainer.toObject().system.background});
            return {actor:trainer.id, keys, numeric:old, staleStoredLabelsPreserved:true};
        });
        await record('generated-pokemon-all-skills', async () => {
            if (!pokemon) {
                const species = await fromUuid('Compendium.ptu.species.Item.QE7WhquxeuebiEVQ');
                check(species?.system.number === 1 && species.system.form === '', 'Generation 1 identity changed.');
                const generator = new game.ptu.species.generator(species);
                await generator.prepare({minLevel:5,maxLevel:5,shinyChance:0,statRandomness:0,preventEvolution:true,saveDefault:false});
                pokemon = (await generator.create({folder:null,generate:true})).actor;
                await pokemon.update({name:'PTU 03 — Generated Bulbasaur',flags:flags('generated-pokemon')});
            }
            equal(Object.keys(pokemon.system.skills).sort(), [...keys].sort(), 'Generated skill keys changed.');
            const original = numeric(pokemon);
            const update = Object.fromEntries(keys.map((key, i) => [`system.skills.${key}.label`, SKILLS[key].aliases[0] ?? SKILLS[key].name]));
            await pokemon.update(update);
            equal(numeric(pokemon), original, 'Stale labels changed generated Pokemon calculations.');
            await pokemon.setFlag('ptu','verificationSkills03Expected', {numeric:original, sourceSkills:pokemon.toObject().system.skills, background:pokemon.toObject().system.background});
            return {actor:pokemon.id, species:pokemon.species.sourceId, level:pokemon.system.level.current, numeric:original};
        });
        await record('npc-generation-all-skills', async () => {
            let generated = find('generated-trainer');
            const data = new NpcQuickBuildData();
            data.trainer.name = 'PTU 03 — Generated trainer';
            data.trainer.level = 5;
            for (const [i,key] of keys.entries()) data.trainer.skills[key].value = 2 + i % 4;
            data.party = {};
            if (!generated) {
                Hooks.once('ptu.preTrainerGenerated', source => {source.flags = flags('generated-trainer');});
                await data.generate();
                generated = find('generated-trainer');
            }
            check(generated, 'NPC generator did not create a trainer.');
            for (const [key,skill] of Object.entries(generated.system.skills)) {
                check(skill.label === getSkillLabel(key), `${key} NPC stored label`);
                check(skill.value.value === data.trainer.skills[key].value, `${key} NPC value`);
            }
            return {actor:generated.id, keys, numeric:numeric(generated), noPartyOrContentSelections:true};
        });
        await record('prerequisites-all-names-and-ranks', async () => {
            // Only replace content lookup: exercise the real parser without acquiring unclassified content.
            const stub = {multiselects:{classes:{options:[]},features:{options:[]},edges:{options:[]}}, _findFromMultiselect:async()=>null};
            stub.checkTextPrereq = NpcQuickBuildData.prototype.checkTextPrereq.bind(stub);
            let count = 0;
            for (const [key, {name,aliases}] of Object.entries(SKILLS)) for (const alias of [key,name,...aliases]) {
                const text = `  NoViCe   ${alias.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll(' ','   ')}  `;
                for (const value of [2,3,5]) {
                    const result = await stub.checkTextPrereq(text,{level:5,allComputed:[],skillsComputed:{[key]:value}});
                    check(!result.unknown && result.met === (value >= 3) && result.diagnostic.skillKey === key && Object.keys(result.newSkills).length === 0, `${text} at ${value}`);
                    count++;
                }
                check(resolveSkillKey(alias) === key, `${alias} exact resolver`);
            }
            for (const text of ['Novice Zoolog','invented Novice Charm','Novice Charm invented','Two skills at Novice invented','One of Charm or Zoolog at Novice']) {
                const result = await stub.checkTextPrereq(text,{level:5,allComputed:[],skillsComputed:Object.fromEntries(keys.map(k=>[k,6]))});
                check(result.unknown && !result.met, `Unknown prerequisite accepted: ${text}`);
            }
            const ctx = {level:5,allComputed:[],skillsComputed:{medicineEd:2,techEd:3,charm:3,focus:3}};
            for (const text of ['Novice Medicine or Technology Edu','Two of Charm or Willpower at Novice','Two Skills at Novice']) {
                check((await stub.checkTextPrereq(text,ctx)).met, `${text} alternatives/count`);
            }
            return {cases:count, unknownCases:5, alternativesAndCounts:3, keys};
        });
        await record('backgrounds-all-keys', async () => {
            check(trainer && pokemon, 'Fixtures missing.');
            for (const key of keys) for (const actor of [trainer,pokemon]) {
                const source = actor.toObject();
                source.system.background = actor.type === 'character' ? {adept:key,novice:'',pathetic:{one:'',two:'',three:''}} : {increased:{one:key,two:'',three:''},decreased:{one:'',two:'',three:''}};
                const legacy = new CONFIG.Actor.documentClass(source);
                for (const [k, definition] of Object.entries(SKILLS)) source.system.skills[k].label = definition.name;
                const core = new CONFIG.Actor.documentClass(source);
                equal(numeric(legacy),numeric(core), `${actor.type}/${key} background depends on label`);
                check(legacy.system.skills[key].value.mod === (actor.type === 'character' ? 2 : 1), `${key} background modifier`);
            }
            return {keys, trainerAndPokemon:true, transientOnly:true};
        });
        await record('skill-modifier-helper-all-keys', async () => {
            for (const actor of [trainer,pokemon]) for (const key of keys) {
                const modifier = createSkillModifier({actor,skill:key,domains:[`skill-${key}`]});
                check(modifier.label === getSkillLabel(key) && modifier.slug === sluggify(key), `${key} helper label/slug`);
                const stored = actor.system.skills[key].modifier;
                check(modifier.modifier === Number(stored.value) + Number(stored.mod), `${key} helper modifier`);
            }
            return {keys, actors:[trainer.id,pokemon.id]};
        });
        await record('legacy-statistic-and-rule-selectors-all-keys',async () => {
            const {PTUSkills} = await import('/systems/ptu/src/module/actor/skills.js');
            const rows = [];
            for (const key of keys) {
                const source = trainer.toObject();
                source.items.push({name:`PTU 03 ${key} selector`,type:'effect',system:{rules:[{
                    key:'FlatModifier',selectors:[`skill-${key}`],value:2,slug:`ptu03-${key}`,label:'PTU 03 selector bonus'
                }]}});
                const actor = new CONFIG.Actor.documentClass(source);
                const statistic = PTUSkills.calculate({actor,context:{skill:key,options:[]}});
                check(statistic.slug === `${key}-check` && statistic.label === `${getSkillLabel(key)} Check`,`${key} legacy statistic identity/label`);
                check(statistic.data.check.diceModifiers[0].diceNumber === actor.system.skills[key].value.total,`${key} legacy dice`);
                check(statistic.data.check.modifiers.some(m=>m.slug === sluggify(`ptu03-${key}`) && m.modifier === 2),`${key} rule selector no longer resolves`);
                rows.push({key,slug:statistic.slug,ruleSelector:`skill-${key}`,dice:statistic.data.check.diceModifiers[0].diceNumber});
            }
            return rows;
        });
    } else if (plan.phase === 'rolls') {
        for (const actor of [trainer,pokemon]) await record(`${actor?.type}-rolls-all-17`, async () => {
            check(actor, 'Fixture missing.');
            const rows = [];
            for (const key of keys) {
                const action = actor.attributes.skills[key];
                check(action.label === `${getSkillLabel(key)} Check`, `${key} action label`);
                equal(action.domains,['all','check','skill-check',`skill-${key}`], `${key} selectors`);
                let message;
                const rolled = await action.roll({targets:[],event:{shiftKey:!game.settings.get('ptu','skipRollDialog'),ctrlKey:false},callback:(_r,_t,msg)=>{message=msg;}});
                const roll = rolled?.rolls[0];
                check(roll && message, `${key} macro roll/callback`);
                check(roll.dice[0].number === actor.system.skills[key].value.total && roll.dice[0].faces === 6, `${key} dice changed`);
                check(roll.options.totalModifiers === actor.system.skills[key].modifier.total, `${key} modifier changed`);
                check(message.flags.ptu.context.skill === key && message.flags.ptu.context.title === action.label, `${key} chat flags`);
                const html = await message.renderHTML();
                check(html.textContent.includes(getSkillLabel(key)), `${key} chat label`);
                rows.push({key,formula:roll.formula,dice:roll.dice[0].number,modifier:roll.options.totalModifiers,message:message.id,selectors:action.domains});
            }
            return rows;
        });
    } else if (['trainer-sheet','pokemon-sheet'].includes(plan.phase)) {
        await record(plan.phase,async () => {
            const actor = plan.phase === 'trainer-sheet' ? trainer : pokemon;
            check(actor, 'Fixture missing.');
            const source = JSON.stringify(actor.toObject().system.skills);
            await actor.sheet._render(true);
            const root = actor.sheet.element[0];
            const labels = [];
            for (const key of keys) {
                const label = root.querySelector(`label[for="system.skills.${key}.label"]`);
                check(label?.textContent.trim() === getSkillLabel(key), `${key} visible sheet label`);
                const roll = root.querySelector(`.rollable[data-skill="${key}"]`);
                check(roll, `${key} stable sheet roll selector`);
                labels.push({key,label:label.textContent.trim()});
            }
            const selects = [...root.querySelectorAll('select[name^="system.background."]')];
            for (const select of selects) for (const key of keys) {
                const option = [...select.options].find(o=>o.value === key);
                check(option?.textContent.trim() === getSkillLabel(key), `${select.name}/${key} background option`);
            }
            check(selects.length > 0,'No background selectors.');
            equal(JSON.stringify(actor.toObject().system.skills),source,'Sheet rewrote stored skills.');
            return {actor:actor.id,labels,backgroundSelectors:selects.length,sourceUnchanged:true};
        });
    } else if (plan.phase === 'npc-sheet') {
        await record('npc-builder-visible-all-17',async () => {
            const {PTUNpcQuickBuild} = await import('/systems/ptu/src/module/apps/npc-quick-build/sheet.js');
            const sheet = new PTUNpcQuickBuild();
            sheet.data.page = 3;
            // Render the real form without loading/selecting inherited unclassified content.
            await sheet._render(true);
            const labels = [...sheet.element[0].querySelectorAll('.skill-name')].map(e=>e.textContent.trim());
            equal(labels,keys.map(key=>getSkillLabel(key)),'NPC preview labels');
            for (const key of keys) check(sheet.element[0].querySelector(`[data-path="trainer.skills.${key}.value"]`),`${key} NPC selector`);
            return {keys,labels,contentSelection:false};
        });
    } else if (plan.phase === 'species-sheet') {
        await record('species-sheet-all-17',async () => {
            const item = pokemon.species;
            const source = JSON.stringify(item.toObject().system.skills);
            await item.sheet._render(true);
            const root = item.sheet.element[0];
            for (const key of keys) {
                const input = root.querySelector(`[name="system.skills.${key}.value"]`);
                check(input?.parentElement.querySelector('.skill')?.textContent.trim() === getSkillLabel(key),`${key} species skill label`);
            }
            check(source === JSON.stringify(item.toObject().system.skills),'Species sheet rewrote skills.');
            return {keys,item:item.uuid,sourceUnchanged:true};
        });
    } else if (plan.phase === 'dialogs-all') {
        await record('dialogs-all-17-both-actors',async () => {
            const {PTUSkillCheck} = await import('/systems/ptu/src/module/system/check/skill.js');
            const {CheckDialog} = await import('/systems/ptu/src/module/system/check/dialogs/dialog.js');
            const {DiceCheckDialog} = await import('/systems/ptu/src/module/system/check/dialogs/diceDialog.js');
            const rows = [];
            for (const actor of [trainer,pokemon]) for (const key of keys) {
                const action = actor.attributes.skills[key];
                const roll = new PTUSkillCheck({source:{actor,options:action.options},targets:[],selectors:action.domains,action});
                await roll.prepareContexts(action);
                roll.prepareModifiers();
                roll.prepareStatistic();
                for (const [DialogClass,statistic,type] of [[CheckDialog,roll.statistic,'skill'],[DiceCheckDialog,roll.diceStatistic,'check']]) {
                    const dialog = new DialogClass({resolve:()=>{},title:action.label,rollMode:'roll',statistic,type});
                    await dialog._render(true);
                    check(dialog.element[0].querySelector('.window-title')?.textContent.trim() === action.label,`${actor.type}/${key} dialog title`);
                    check(dialog.element[0].querySelector('button.roll'),`${actor.type}/${key} dialog button`);
                    await dialog.close();
                }
                check(roll.statistic.totalModifier === actor.system.skills[key].modifier.total,`${key} dialog modifier`);
                check(roll.diceModifiers[0].diceNumber === actor.system.skills[key].value.total,`${key} dialog dice`);
                rows.push({actor:actor.id,key,title:action.label,dice:roll.diceModifiers[0].diceNumber,modifier:roll.statistic.totalModifier});
            }
            return {renderedDialogs:rows.length*2,rows};
        });
    } else if (plan.phase === 'dialog') {
        check(trainer && pokemon && canvas.scene,'Fixtures/scene missing.');
        const scene = canvas.scene;
        let origin = scene.tokens.find(t=>t.getFlag('ptu','verificationSkills03Role') === 'origin');
        let target = scene.tokens.find(t=>t.getFlag('ptu','verificationSkills03Role') === 'target');
        if (!origin || !target) {
            const docs = await Promise.all([trainer.getTokenDocument({x:300,y:300,actorLink:true}),pokemon.getTokenDocument({x:600,y:300,actorLink:true})]);
            docs[0].updateSource({flags:{ptu:{verificationSkills03Role:'origin'}}});
            docs[1].updateSource({flags:{ptu:{verificationSkills03Role:'target'}}});
            [origin,target] = await scene.createEmbeddedDocuments('Token',docs.map(d=>d.toObject()));
        }
        report.fixtures = {trainer:trainer.id,pokemon:pokemon.id,scene:scene.id,origin:origin.id,target:target.id};
        // Do not await: the two real dialogs must be submitted through the UI.
        record('manual-skill-dialog-and-chat',async () => {
            let message;
            const result = await trainer.attributes.skills.pokemonEd.roll({token:origin.object,targets:[target.object],
                event:{ctrlKey:false,shiftKey:game.settings.get('ptu','skipRollDialog')},callback:(_r,_t,msg)=>{message=msg;}});
            check(result?.rolls[0] && message,'Manual roll cancelled or message missing.');
            check(message.flags.ptu.context.skill === 'pokemonEd','Manual chat lost skill key.');
            return {message:message.id,formula:result.rolls[0].formula,title:message.flags.ptu.context.title,origin:origin.uuid,target:target.uuid};
        }).then(()=>show(report));
        return;
    } else if (plan.phase === 'contested-result') {
        await record('manual-contested-result',async () => {
            const messages = game.messages.filter(m=>m.flags.ptu?.context?.skill === 'pokemonEd' && m.flags.ptu?.origin?.token);
            const original = messages.findLast(m=>m.flags.ptu.origin.actor === trainer.uuid);
            const response = messages.findLast(m=>m.flags.ptu.origin.actor === pokemon.uuid && m.rolls[0]?.options?.dc);
            check(original && response,'Manual contested messages missing.');
            const attack = original.rolls[0], defense = response.rolls[0];
            check(defense.options.dc.value === attack.total,'Contested DC changed.');
            const expected = attack.total > defense.total ? 'hit' : 'miss';
            check(attack.options.outcomes[pokemon.uuid] === expected,'Contested numerical outcome changed.');
            return {original:original.id,response:response.id,originTotal:attack.total,responseTotal:defense.total,dc:defense.options.dc.value,outcome:expected};
        });
    } else if (plan.phase === 'persistence-setup') {
        await record('populated-background-persistence-fixture',async () => {
            check(trainer && pokemon,'Fixtures missing.');
            // Deliberate fixture choices in all six slots distinguish real skill IDs from
            // the inherited form's empty-string -> "blank" placeholder normalization.
            await pokemon.update({'system.background':{
                increased:{one:'athletics',two:'focus',three:'generalEd'},
                decreased:{one:'charm',two:'perception',three:'occultEd'}
            }});
            const rows = [];
            for (const actor of [trainer,pokemon]) {
                const expected = {numeric:numeric(actor),sourceSkills:actor.toObject().system.skills,background:actor.toObject().system.background};
                const source = actor.toObject();
                for (const [key,definition] of Object.entries(SKILLS)) source.system.skills[key].label = definition.name;
                equal(numeric(new CONFIG.Actor.documentClass(source)),expected.numeric,`${actor.type} selected background labels changed numbers`);
                await actor.setFlag('ptu','verificationSkills03Expected',expected);
                rows.push({actor:actor.id,...expected});
            }
            return rows;
        });
    } else if (plan.phase === 'source-text') {
        await record('changed-pack-text-and-identities',async () => {
            const review = await fetch('/ptu03-checks/skill-terminology-review.json',{cache:'no-store'}).then(r=>r.json());
            const rows = [];
            for (const row of review.documents.filter(r=>r.changedFields.length)) {
                const [pack,id] = row.identity.split('.');
                const item = await fromUuid(`Compendium.ptu.${pack}.Item.${id}`);
                check(item?.id === id,`${row.identity} identity`);
                for (const field of row.changedFields) equal(field.pointer.slice(1).split('/').reduce((v,k)=>v[k],item.toObject()),field.after,`${row.identity}${field.pointer}`);
                rows.push({identity:row.identity,fields:row.changedFields.map(f=>f.pointer)});
            }
            return {rows,terminologyOnly:true,contentApproval:false};
        });
    } else if (plan.phase === 'reload') {
        await record('saved-reloaded-all-17', async () => {
            for (const actor of [trainer,pokemon]) {
                check(actor,'Saved fixture missing.');
                const expected = actor.getFlag('ptu','verificationSkills03Expected');
                equal(numeric(actor),expected.numeric,`${actor.type} persisted numeric values`);
                equal(actor.toObject().system.skills,expected.sourceSkills,`${actor.type} source values/labels`);
                equal(actor.toObject().system.background,expected.background,`${actor.type} background keys: ${JSON.stringify({actual:actor.toObject().system.background,expected:expected.background})}`);
            }
            return {trainer:trainer.id,pokemon:pokemon.id,keys,sourceAndNumericValuesPreserved:true};
        });
    } else throw new Error(`Unknown phase: ${plan.phase}`);

    report.fixtures = {trainer:trainer?.id,pokemon:pokemon?.id,generatedTrainer:find('generated-trainer')?.id};
    show(report);
    return report;
}
