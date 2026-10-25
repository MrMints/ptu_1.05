import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const manifest = await readJSON('system.json');
const documents = [];
for (const pack of manifest.packs) {
    for (const file of (await readdir(`packs/${pack.name}/_source`)).sort()) {
        if (file.endsWith('.json')) documents.push({ pack: pack.name, documentType: pack.type, data: await readJSON(`packs/${pack.name}/_source/${file}`) });
    }
}
const ids = new Set(documents.map(({ pack, data }) => `${pack}.${data._id}`));
const missing = new Map();
for (const { pack, data } of documents) {
    const json = JSON.stringify(data);
    for (const match of json.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|RollTable|JournalEntry|Macro)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)) {
        const target = `${match[1]}.${match[2]}`;
        if (!ids.has(target)) {
            if (!missing.has(target)) missing.set(target, new Set());
            missing.get(target).add(`${pack}.${data._id}`);
        }
    }
}
let prior = [];
try { prior = await readJSON('docs/data/move-verification.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const old = new Map(prior.map(row => [row.identity, row]));
const ledger = documents.filter(row => row.data.type === 'move').map(({ pack, data }) => {
    const identity = `${pack}.${data._id}`;
    const contentHash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const previous = old.get(identity);
    return {
        identity, name: data.name, contentHash, version: 'inherited-unclassified',
        sourceReferences: [], dataReview: 'not-reviewed', automationCoverage: 'not-assessed',
        tests: [], unresolvedIssues: ['Rules version and authoritative source require review.'],
        ...(previous?.contentHash === contentHash ? previous : {}),
        ...(previous && previous.contentHash !== contentHash ? { previousEvidence: previous, unresolvedIssues: ['Content changed; previous evidence must be revalidated.'] } : {})
    };
});
const report = {
    sourceDocuments: documents.length, declaredPacks: manifest.packs.length,
    moves: ledger.length, verifiedMoves: ledger.filter(row => row.dataReview === 'verified').length,
    referenceScope: 'Explicit Compendium.ptu UUIDs in JSON, including descriptions and historical metadata; not a runtime link check.',
    missingReferences: [...missing].sort(([a], [b]) => a.localeCompare(b)).map(([target, sources]) => ({ target, sources: [...sources].sort() })),
    missingContent: ['enhancements has no complete recovered snapshot; original poke-edges restored under its stable pack name', 'later Carbon edits and source/version attribution require reconciliation'],
    packs: manifest.packs.map(pack => ({ name: pack.name, documents: documents.filter(row => row.pack === pack.name).length }))
};
await writeFile('docs/data/move-verification.json', JSON.stringify(ledger, null, 2) + '\n');
await writeFile('docs/data/content-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ documents: report.sourceDocuments, packs: report.declaredPacks, moves: report.moves, verifiedMoves: report.verifiedMoves, unresolvedReferenceTargets: missing.size }));
