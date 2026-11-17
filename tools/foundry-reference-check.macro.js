// Read-only pack probes and temporary/dry-run objects; no actor or compendium writes.
const fixture = await (await fetch('/ptu02-checks/reference-fixture.json', {cache:'no-store'})).json();
if (!game.ready || !game.user.isGM || game.world.id !== 'ptu-verification'
    || game.system.id !== fixture.systemId || game.system.version !== fixture.systemVersion) {
    throw new Error('Use the matching disposable PTU verification world as GM.');
}
const uuid = target => { const [pack,id] = target.split('.'); return `Compendium.ptu.${pack}.Item.${id}`; };
const report = {foundryVersion: game.version, systemVersion: game.system.version,
    checkedAt: new Date().toISOString(), sourceFingerprint: fixture.sourceFingerprint,
    runtime: [], provenance: {sources: 0, loadedLegacyFlags: 0, matchingHistoricalStats: 0,
        sourceIdGetterDefined: 0, importsStampedWithCurrentUuid: 0, importsRetainingLegacyFlag: 0}, dryRuns: []};
for (const row of fixture.runtime) {
    try {
        const result = await fromUuid(row.occurrences[0].uuid);
        report.runtime.push({target: row.target, result: result ? 'resolved' : 'missing'});
    } catch (error) { report.runtime.push({target: row.target, result:'error', error:error.message}); }
}
// One full pack read, then inspect every affected feat without importing it into the world.
await game.packs.get('ptu.feats').getDocuments();
for (const row of fixture.provenance) {
    const document = await fromUuid(uuid(row.source));
    if (!document) throw new Error(`Missing source document ${row.source}`);
    const imported = game.items.fromCompendium(document);
    report.provenance.sources++;
    if (document.flags?.core?.sourceId) report.provenance.loadedLegacyFlags++;
    if (document._stats.compendiumSource === row.compendiumSource) report.provenance.matchingHistoricalStats++;
    if (document.sourceId) report.provenance.sourceIdGetterDefined++;
    if (imported._stats.compendiumSource === document.uuid) report.provenance.importsStampedWithCurrentUuid++;
    if (imported.flags?.core?.sourceId) report.provenance.importsRetainingLegacyFlag++;
}
const sourceIds = [...new Set(fixture.runtime.flatMap(row => row.sources))].sort();
for (const source of sourceIds) {
    const document = await fromUuid(uuid(source));
    if (document.type === 'species') {
        const occurrences = fixture.runtime.flatMap(row => row.occurrences).filter(row => row.source === source);
        const groups = {
            abilities: occurrences.filter(row => row.profile === 'species-ability'),
            capabilities: occurrences.filter(row => row.profile === 'species-capability'),
            moves: occurrences.filter(row => row.profile === 'species-move' && row.pointer.startsWith('/system/moves/level/'))
        };
        for (const [kind, references] of Object.entries(groups)) {
            if (!references.length) continue;
            const generator = new game.ptu.species.generator(document);
            // Exercise create's reference-resolution path deterministically; no rules/stat generation claim.
            Object.assign(generator, {prepared:true, size:{width:1,height:1}, stats:{}, shiny:false,
                level:1, nature:'Hardy', gender:'Male', img:document.img, tokenImg:document.img,
                moves:[], abilities:[], capabilities:[]});
            const values = references.map(row => row.pointer.split('/').slice(1,-1).reduce((data,key) => data[key], document.toObject()));
            generator[kind] = kind === 'abilities' ? values.map(data => ({tier:'basic',data})) : values;
            try {
                const generated = await generator.create({folder:null,generate:false});
                report.dryRuns.push({source,kind,selectedReferences:values.length,generatedContentItems:generated.items.length - 1,
                    result:generated.items.length === 1 ? 'missing-selected-content-omitted' : 'unexpected-content'});
            } catch (error) { report.dryRuns.push({source,kind,result:'error',error:error.message}); }
        }
    } else if (document.system.rules?.some(rule => rule.key === 'TemporarySpecies')) {
        const {TemporarySpeciesRuleElement} = await import('/systems/ptu/src/module/rules/rule-element/temp-species.js');
        const actor = new CONFIG.PTU.Actor.documentClasses.pokemon({name:'PTU 02 temporary reference probe',type:'pokemon'});
        // Document.clone preserves its original parent in v13; construct an ephemeral owned item explicitly.
        const item = new document.constructor(document.toObject(), {parent:actor});
        if (item.actor !== actor) throw new Error('TemporarySpecies probe requires a temporary owned item.');
        const data = structuredClone(document.system.rules.find(rule => rule.key === 'TemporarySpecies'));
        try {
            const rule = new TemporarySpeciesRuleElement(data,item,{suppressWarnings:true});
            report.dryRuns.push({source,kind:'TemporarySpecies',result:'constructed',hasSpecies:!!rule.species});
        } catch (error) { report.dryRuns.push({source,kind:'TemporarySpecies',result:'constructor-error',error:error.message,stack:error.stack.split('\n').slice(0,4)}); }
    }
}
const text = JSON.stringify(report, null, 2).replaceAll('&','&amp;').replaceAll('<','&lt;');
new Dialog({title:'PTU 02 reference investigation',content:`<textarea id="ptu02-reference-result" readonly style="width:100%;height:500px">${text}</textarea>`,
    buttons:{close:{label:'Close'}}},{width:900,height:620}).render(true);
