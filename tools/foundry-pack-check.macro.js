// Run as a Script macro in the disposable world after preparing the source-ID fixture.
const expected = await (await fetch('/ptu02-checks/expected-packs.json')).json();
if (!game.ready || !game.user.isGM || game.world.id !== 'ptu-verification'
    || game.system.id !== expected.systemId || game.system.version !== expected.systemVersion) {
    throw new Error('Use the matching disposable PTU verification world as GM.');
}
const diff = (expectedIds, actualIds) => ({
    missing: expectedIds.filter(id => !actualIds.includes(id)),
    unexpected: actualIds.filter(id => !expectedIds.includes(id)),
    duplicateCount: actualIds.length - new Set(actualIds).size
});
const report = {
    systemId: game.system.id, systemVersion: game.system.version, foundryVersion: game.version,
    world: game.world.id, checkedAt: new Date().toISOString(), packs: []
};
for (const source of expected.packs) {
    const row = {
        pack: `ptu.${source.name}`, expectedDocuments: source.documents.length,
        expectedFolders: source.folders.length
    };
    try {
        const pack = game.packs.get(row.pack);
        if (!pack) throw new Error('Declared pack is absent from game.packs');
        const index = await pack.getIndex();
        const documents = await pack.getDocuments();
        row.index = index.size;
        row.documents = documents.length;
        row.folders = pack.folders.size;
        row.indexIds = diff(source.documents, [...index.keys()]);
        row.documentIds = diff(source.documents, documents.map(document => document.id));
        row.folderIds = diff(source.folders, [...pack.folders.keys()]);
        row.invalidDocuments = [...new Set([
            ...pack.invalidDocumentIds, ...documents.filter(document => document.invalid).map(document => document.id)
        ])];
        row.invalidFolders = [...pack.folders.values()].filter(folder => folder.invalid).map(folder => folder.id);
        row.documentType = pack.documentName;
        row.result = [row.indexIds, row.documentIds, row.folderIds]
            .every(ids => !ids.missing.length && !ids.unexpected.length && !ids.duplicateCount)
            && !row.invalidDocuments.length && !row.invalidFolders.length
            && pack.documentName === source.type ? 'pass' : 'fail';
    } catch (error) {
        row.result = 'error';
        row.error = error.message;
    }
    report.packs.push(row);
}
report.result = report.packs.length === expected.packs.length
    && report.packs.every(pack => pack.result === 'pass') ? 'pass' : 'fail';
new Dialog({
    title: 'PTU 02 pack-loading result',
    content: `<textarea id="ptu02-result" readonly style="width:100%;height:580px">${JSON.stringify(report, null, 2)}</textarea>`,
    buttons: { close: { label: 'Close' } }
}, { width: 900, height: 700 }).render(true);
