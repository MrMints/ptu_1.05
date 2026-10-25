import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
export async function loadRulesCatalog() {
    const names = {
        references: 'references', authority: 'source-authority', revisions: 'rules-revisions',
        dex: 'dex-source-comparison', bulbasaur: 'bulbasaur-source-review', reconciliation: 'content-reconciliation-search'
    };
    const bundle = Object.fromEntries(await Promise.all(Object.entries(names).map(async ([key, file]) => [key, await json(`docs/data/${file}.json`)])));
    bundle.stableDocuments = {};
    const identities = new Set([bundle.bulbasaur.identity, ...bundle.dex.profileDeltas.flatMap(x => x.stableIdentities), ...bundle.revisions.entries.flatMap(x => x.stableIdentities)]);
    for (const link of Object.values(bundle.bulbasaur.stableRelationshipEvidence.currentAbilityUuids).flat()) {
        const match = link.uuid.match(/^Compendium\.ptu\.([a-z-]+)\.Item\.([A-Za-z0-9]{16})$/);
        if (match) identities.add(`${match[1]}.${match[2]}`);
    }
    for (const identity of identities) {
        if (!/^[a-z-]+\.[A-Za-z0-9]{16}$/.test(identity)) continue;
        const [pack, id] = identity.split('.');
        try { bundle.stableDocuments[identity] = await json(`packs/${pack}/_source/${id}.json`); } catch { /* reported below */ }
    }
    return bundle;
}

export function rulesCatalogErrors(bundle) {
    const errors = [];
    const fail = (ok, message) => { if (!ok) errors.push(message); };
    const {references, authority, revisions, dex, bulbasaur, reconciliation, stableDocuments = {}} = bundle;
    const refs = new Map();
    for (const ref of references.documents) {
        fail(!refs.has(ref.path), `Duplicate reference path: ${ref.path}`);
        fail(/^[a-f0-9]{64}$/.test(ref.sha256), `Invalid reference hash: ${ref.path}`);
        refs.set(ref.path, ref);
    }
    for (const ref of references.documents) if (ref.duplicateOf) fail(refs.get(ref.duplicateOf)?.sha256 === ref.sha256, `Duplicate hash mismatch: ${ref.path}`);
    const hashes = new Set(references.documents.map(x => x.sha256));
    fail(authority.documentCount === refs.size && authority.uniqueHashCount === hashes.size && authority.duplicatePathCount === refs.size - hashes.size, 'Source coverage counts differ from physical inventory');
    fail(authority.sources.length === hashes.size && new Set(authority.sources.map(x => x.sha256)).size === hashes.size, 'Source authority must cover each unique hash exactly once');
    const coveredPaths = authority.sources.flatMap(x => [x.preferredPath, ...x.aliases]);
    fail(coveredPaths.length === refs.size && new Set(coveredPaths).size === refs.size, 'Source authority aliases must cover all paths exactly once');
    for (const source of authority.sources) {
        for (const path of [source.preferredPath, ...source.aliases]) fail(refs.get(path.replace(/^Core System\//, ''))?.sha256 === source.sha256, `Authority source hash/path mismatch: ${path}`);
        fail(source.authorityBasis && source.coverageLimitation && source.pageMapping?.rule, `Incomplete source coverage: ${source.id}`);
        for (const [first, last] of source.reviewedPdfPageRanges) fail(Number.isInteger(first) && first >= 1 && last >= first && last <= source.pdfPages, `Coverage pages out of range: ${source.id}`);
    }
    const visit = value => {
        if (!value || typeof value !== 'object') return;
        if (value.path?.startsWith('Core System/') && value.sha256) {
            const ref = refs.get(value.path.slice(12));
            fail(ref?.sha256 === value.sha256, `Citation hash/path mismatch: ${value.path}`);
            if (value.pdfPages) for (const page of value.pdfPages) fail(Number.isInteger(page) && page >= 1 && page <= ref?.pdfPages, `Citation page out of range: ${value.path} ${page}`);
            if (value.printedPages?.length) fail(value.printedPages.length === value.pdfPages?.length && value.pageConvention, `Printed/PDF convention missing: ${value.path}`);
        }
        for (const child of Object.values(value)) if (typeof child === 'object') visit(child);
    };
    for (const data of [authority, revisions, dex, bulbasaur, reconciliation.section04SourceDisposition]) visit(data);
    const ids = new Set(), variants = new Set();
    for (const row of revisions.entries) {
        fail(/^r04-r\d{4}$/.test(row.id) && !ids.has(row.id), `Invalid/duplicate revision ID: ${row.id}`); ids.add(row.id);
        fail(/^r04-c\d{4}$/.test(row.canonicalId), `Missing canonical identity: ${row.id}`);
        const variant = `${row.canonicalId}:${row.version}`;
        fail(!variants.has(variant), `Duplicate canonical version: ${variant}`); variants.add(variant);
        fail(['feature', 'edge', 'move', 'ability', 'mechanic'].includes(row.kind), `Unknown revision kind: ${row.id}`);
        fail(row.sources.length && row.baseline.interpretation && row.revised.interpretation && row.difference && row.precedence && row.selection.label && row.selection.unit && row.conflict.disposition, `Incomplete interpretation/disposition: ${row.id}`);
        for (const key of ['generationEligibility', 'ruleVersionApproval', 'dataReview', 'behavioralVerification']) fail(typeof row[key] === 'string' && row[key].length > 0, `Missing independent review axis ${key}: ${row.id}`);
        fail(row.implemented === false && row.behavioralVerification === 'not-run', `Catalog must not certify runtime/gameplay: ${row.id}`);
        if (row.conflict.disposition.startsWith('manual')) fail(row.conflict.details.length > 0, `Manual ruling lacks reason: ${row.id}`);
        for (const identity of row.stableIdentities) fail(stableDocuments[identity], `Unknown stable identity: ${identity}`);
    }
    const huge = revisions.entries.find(x => x.label === 'Huge Power' && x.version === 'feb');
    const pure = revisions.entries.find(x => x.label === 'Pure Power' && x.version === 'feb');
    fail(huge && pure && huge.canonicalId !== pure.canonicalId, 'Huge Power/Pure Power must keep separate identities');
    let offset = 0;
    for (const part of dex.composition) {
        fail(part.pdfPageOffset === offset && part.combinedPdfPages[0] === offset + 1 && part.combinedPdfPages[1] === offset + part.comparedPages && part.normalizedTextMismatches === 0, 'Composite page mapping is inconsistent');
        offset += part.comparedPages;
    }
    fail(offset === refs.get('Complete Pokedex Gen 1-8.pdf')?.pdfPages, 'Composite coverage must reach final page');
    const dexIds = new Set();
    for (const row of dex.profileDeltas) {
        fail(!dexIds.has(row.id), `Duplicate profile comparison: ${row.id}`); dexIds.add(row.id);
        fail(row.canonicalId && row.sources.length >= 2 && row.baseline.interpretation && row.revised.interpretation && row.precedence && row.selectionLabel && row.conflict.details.length && row.conflict.disposition, `Incomplete profile interpretation: ${row.id}`);
        for (const change of row.changes) fail(change.field && JSON.stringify(change.standardSourceValue) !== JSON.stringify(change.revisedSourceValue), `Empty profile delta: ${row.id}`);
        fail(row.implemented === false && row.behavioralVerification === 'not-run', `Profile must not certify runtime/gameplay: ${row.id}`);
        for (const identity of row.stableIdentities) fail(stableDocuments[identity], `Unknown stable profile identity: ${identity}`);
    }
    fail(bulbasaur.identity === 'species.QE7WhquxeuebiEVQ' && stableDocuments[bulbasaur.identity]?._id === 'QE7WhquxeuebiEVQ', 'Bulbasaur stable identity changed');
    const doc = stableDocuments[bulbasaur.identity];
    if (doc) fail(createHash('sha256').update(JSON.stringify(doc)).digest('hex') === bulbasaur.contentHash, 'Bulbasaur review hash is stale');
    fail(JSON.stringify(doc?.system.abilities) === JSON.stringify(bulbasaur.stableRelationshipEvidence.currentAbilityUuids), 'Bulbasaur ability relationships differ from reviewed stable UUID slots');
    for (const link of Object.values(bulbasaur.stableRelationshipEvidence.currentAbilityUuids).flat()) {
        const match = link.uuid.match(/^Compendium\.ptu\.abilities\.Item\.([A-Za-z0-9]{16})$/);
        fail(match && stableDocuments[`abilities.${match[1]}`]?._id === match[1], `Missing exact ability relationship: ${link.uuid}`);
    }
    fail(bulbasaur.ruleVersionApproval === 'unclassified', 'Source attribution must not approve whole Bulbasaur record');
    const retained = reconciliation.section04SourceDisposition.earlierOnlyRecords;
    const original = reconciliation.results[0].newStableIds.map(id => `poke-edges.${id}`);
    fail(retained.length === original.length && retained.every(x => original.includes(x.originalIdentity) && x.sources.length && x.disposition && x.neededDecision), 'Historical candidate dispositions must preserve finite original ID inventory');
    for (const data of [authority, dex, bulbasaur, reconciliation.section04SourceDisposition]) fail(data.runtimePolicyPromotion === false, 'Source analysis must not promote runtime policy');
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const data = await loadRulesCatalog();
    const errors = rulesCatalogErrors(data);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Rules catalog: ${data.authority.documentCount} paths / ${data.authority.uniqueHashCount} hashes, ${data.revisions.entries.length} entries, ${data.dex.profileDeltas.length} profile comparisons, 12 historical candidates. Structure/references only; gameplay unverified.`);
}
