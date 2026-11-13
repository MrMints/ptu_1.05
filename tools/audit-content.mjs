import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { auditCompendiumReferences, REFERENCE_PROFILES } from './compendium-references.mjs';

const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const manifest = await readJSON('system.json');
const documents = [];
for (const pack of manifest.packs) {
    for (const file of (await readdir(`packs/${pack.name}/_source`)).sort()) {
        if (file.endsWith('.json')) documents.push({ pack: pack.name, documentType: pack.type, data: await readJSON(`packs/${pack.name}/_source/${file}`) });
    }
}
const references = auditCompendiumReferences(documents);
if (references.targetCounts.unclassified) throw new Error('Unclassified compendium fields require review before refreshing the audit.');
let investigations = { targets: [] };
try { investigations = await readJSON('docs/data/reference-investigations.json'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const reviews = new Map(investigations.targets.map(row => [row.target, row]));
for (const target of references.targets) {
    target.occurrenceFingerprint = createHash('sha256').update(JSON.stringify(target.occurrences)).digest('hex');
    const review = reviews.get(target.target);
    if (review?.occurrenceFingerprint === target.occurrenceFingerprint) {
        target.disposition = review.disposition;
        target.investigation = `docs/data/reference-investigations.json#${target.target}`;
    } else if (review) {
        target.disposition = 'needs-revalidation';
    }
}
const referenceReport = {
    schemaVersion: 1,
    scope: 'Explicit missing Compendium.ptu targets in declared pack source strings; field-level classification, not proof of rules correctness.',
    sourceFingerprint: createHash('sha256').update(JSON.stringify(documents)).digest('hex'),
    profiles: REFERENCE_PROFILES,
    ...references
};
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
    missingReferences: references.targets.map(({target, sources}) => ({target, sources})),
    referenceClassification: {
        report: 'docs/data/compendium-reference-audit.json',
        targetCounts: references.targetCounts, occurrenceCounts: references.occurrenceCounts,
        caveat: 'Historical provenance includes legacy sourceId fields read by refresh/migration code; it is not certified inert.'
    },
    missingContent: ['enhancements has no complete recovered snapshot; original poke-edges restored under its stable pack name', 'later Carbon edits and source/version attribution require reconciliation'],
    packs: manifest.packs.map(pack => ({ name: pack.name, documents: documents.filter(row => row.pack === pack.name).length }))
};
await writeFile('docs/data/move-verification.json', JSON.stringify(ledger, null, 2) + '\n');
await writeFile('docs/data/content-audit.json', JSON.stringify(report, null, 2) + '\n');
await writeFile('docs/data/compendium-reference-audit.json', JSON.stringify(referenceReport, null, 2) + '\n');
console.log(JSON.stringify({ documents: report.sourceDocuments, packs: report.declaredPacks, moves: report.moves, verifiedMoves: report.verifiedMoves, unresolvedReferenceTargets: references.targets.length, classifications: references.targetCounts }));
