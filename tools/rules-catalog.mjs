import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
export async function loadRulesCatalog() {
    const names = {
        references: 'references', authority: 'source-authority', revisions: 'rules-revisions',
        dex: 'dex-source-comparison', bulbasaur: 'bulbasaur-source-review', reconciliation: 'content-reconciliation-search',
        supplements: 'supplement-rules-catalog', regional: 'regional-dex-catalog'
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
    const {references, authority, revisions, dex, bulbasaur, reconciliation, supplements, regional, stableDocuments = {}} = bundle;
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
    for (const data of [authority, revisions, dex, bulbasaur, reconciliation.section04SourceDisposition, supplements, regional]) visit(data);
    const categories = new Set(['rule-ambiguity', 'missing-source-identity-evidence', 'optional-campaign-selection', 'implementation-design-05', 'source-label-correction']);
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
        fail(categories.has(row.reviewDisposition?.category) && row.reviewDisposition.blocksCurrentSourceCatalog === false && row.reviewDisposition.question, `Revision review category/question missing: ${row.id}`);
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
        fail(row.sourceReview?.status === 'substantive-current-source-comparison-complete' && row.sourceReview.summary && row.selectionDependencies?.length, `Profile source interpretation missing: ${row.id}`);
        for (const change of row.changes) fail(change.sourceInterpretation?.summary && change.sourceInterpretation.category && Array.isArray(change.sourceInterpretation.tokenChanges), `Profile field interpretation missing: ${row.id} ${change.field}`);
        fail(row.implemented === false && row.behavioralVerification === 'not-run', `Profile must not certify runtime/gameplay: ${row.id}`);
        for (const identity of row.stableIdentities) fail(stableDocuments[identity], `Unknown stable profile identity: ${identity}`);
    }
    fail(dex.profileDeltas.length === 450, 'All 450 changed dex candidates must retain source dispositions');
    fail(dex.profileDeltas.find(x => x.id === 'r04-d0128')?.changes.some(x => x.field === 'printedAbilitySlots' && x.standardSourceValue.length === 5 && x.revisedSourceValue.length === 5), 'Bellossom repeated printed ability slots must survive extraction');
    const sourceRows = [...supplements.entries, ...regional.entries], sourceIds = new Set();
    for (const row of sourceRows) {
        fail(!sourceIds.has(row.id), `Duplicate supplemental/regional source ID: ${row.id}`); sourceIds.add(row.id);
        fail(row.canonicalId && row.sources.length && row.currentEdition && row.baseline.relationship && row.baseline.interpretation && row.currentInterpretation && row.difference && row.precedence && row.selection.unit && row.selection.versionLabel && row.selection.dependencies, `Incomplete supplemental/regional interpretation: ${row.id}`);
        fail(categories.has(row.disposition?.category) && row.disposition.specificQuestionOrNote && row.disposition.blocksCataloging === false && row.disposition.sourceCatalogStatus === 'current-source-interpretation-recorded', `Supplemental/regional disposition missing: ${row.id}`);
        for (const key of ['generationEligibility', 'ruleVersionApproval', 'dataReview', 'behavioralVerification']) fail(typeof row[key] === 'string' && row[key], `Missing source review axis ${key}: ${row.id}`);
        fail(row.implemented === false && row.behavioralVerification === 'not-run' && row.stableIdentities.length === 0, `Source unit must not invent runtime mappings or certification: ${row.id}`);
        const prose = [row.currentInterpretation, ...(Array.isArray(row.selection.dependencies) ? row.selection.dependencies : [row.selection.dependencies]), row.disposition.specificQuestionOrNote].join(' ').replaceAll('QE7WhquxeuebiEVQ', '');
        fail(!/edit ion|catalog able|compiledp|conceal me nt|An a to my|reflect ion|Overlan d|Upgraderare|Researcherfieldchoices|Extendedupgradeselectedexistingaugmentation/.test(prose) && !/\b\w*[a-z][A-Z]\w*\b/.test(prose), `Unreadable merged/split source prose: ${row.id}`);
        if (row.disposition.category === 'rule-ambiguity') fail(!row.disposition.specificQuestionOrNote.startsWith('No further source ambiguity'), `Ambiguity needs a specific question: ${row.id}`);
    }
    const requiredCoverage = {
        blessed: {part: 'Blessed and the Damned.pdf', ranges: [[36, 71]], count: 235, nonrule: []},
        porygon: {part: 'Do Porygon Dream of Mareep.pdf', ranges: [[21, 39], [41, 87]], count: 241, nonrule: [75, 87]},
        throhs: {part: 'Game of Throhs.pdf', ranges: [[31, 45], [47, 93], [105, 105], [120, 120]], count: 223, nonrule: []}
    };
    for (const [key, requirement] of Object.entries(requiredCoverage)) {
        const rows = supplements.entries.filter(x => x.sources[0].path === `Core System/${requirement.part}`);
        const pages = new Set(rows.flatMap(x => x.sources[0].pdfPages));
        fail(rows.length === requirement.count, `Supplemental source unit coverage incomplete: ${key}`);
        fail(JSON.stringify(supplements.coverage[key].interpretedPages) === JSON.stringify([...pages].sort((a, b) => a - b)), `Supplemental page evidence stale: ${key}`);
        for (const [first, last] of requirement.ranges) for (let page = first; page <= last; page++) fail(pages.has(page) || requirement.nonrule.includes(page), `Readable supplemental page unaccounted: ${key} ${page}`);
    }
    const sync = supplements.entries.filter(x => x.label.startsWith('Type Sync'));
    fail(sync.length === 2 && sync[0].canonicalId === sync[1].canonicalId && sync.every(x => x.crossSourceUnits.length === 2), 'Type Sync reprints must share one source identity');
    for (const [key, total, profiles, offset] of [['alola', 117, 114, 747], ['galar', 120, 118, 864], ['hisui', 30, 27, 984]]) {
        const rows = regional.entries.filter(x => x.id.startsWith(`r04-${key}-`)), coverage = regional.coverage[key];
        const pages = [...rows.flatMap(x => x.sources[0].pdfPages), ...coverage.nonprofilePages.map(x => x.pdfPage)];
        fail(rows.length === profiles && coverage.totalPages === total && coverage.profilePages === profiles && new Set(pages).size === total && pages.length === total && pages.every(x => x >= 1 && x <= total), `Regional profile/page coverage incomplete: ${key}`);
        for (const row of rows) {
            fail(row.combinedPdfPage === offset + row.sources[0].pdfPages[0], `Regional composite page offset wrong: ${row.id}`);
            for (const field of ['stats', 'type', 'abilities', 'evolution', 'capabilities', 'skills']) fail(row.sourceFacts[field]?.length, `Regional source field missing: ${row.id} ${field}`);
            for (const field of ['levelMoves', 'machineMoves', 'eggMoves', 'tutorMovesAndNotes']) {
                const evidence = row.moveAcquisitionEvidence?.[field];
                fail(typeof evidence?.present === 'boolean' && /^[a-f0-9]{64}$/.test(evidence.normalizedFieldSha256) && Number.isInteger(evidence.entriesDetected) && evidence.entriesDetected >= 0 && evidence.printedAcquisition, `Regional acquisition evidence missing: ${row.id} ${field}`);
            }
        }
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
    for (const data of [authority, dex, bulbasaur, reconciliation.section04SourceDisposition, supplements, regional]) fail(data.runtimePolicyPromotion === false, 'Source analysis must not promote runtime policy');
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const data = await loadRulesCatalog();
    const errors = rulesCatalogErrors(data);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Rules catalog: ${data.authority.documentCount} paths / ${data.authority.uniqueHashCount} hashes, ${data.revisions.entries.length} revision/guidance entries, ${data.supplements.entries.length} supplemental units, ${data.dex.profileDeltas.length} profile comparisons, ${data.regional.entries.length} regional profiles, 12 historical candidates. Structure/references/coverage only; gameplay unverified.`);
}
