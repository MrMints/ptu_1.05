import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readPackSources} from './pack-sources.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const labelKey = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
export async function loadRecordSourceReview() {
    const index = await json('docs/data/record-source-classification.json');
    const files = {};
    for (const path of index.recordFiles) {
        if (!/^record-source-review\/[a-z-]+\.json$/.test(path)) throw new Error(`Invalid review artifact path: ${path}`);
        files[path] = await json(`docs/data/${path}`);
    }
    const [inventory, references, dependencyReview, manifest] = await Promise.all([
        json(index.inventory), json('docs/data/references.json'), json(`docs/data/${index.dependencyReview}`), json('system.json')
    ]);
    const source = await readPackSources(manifest);
    const protectedHashes = Object.fromEntries(await Promise.all(index.protectedPolicyArtifacts.map(async item => [item.path, hash(await json(item.path))])));
    return {index, files, inventory, references, dependencyReview, source, protectedHashes, dex: await json('docs/data/dex-source-comparison.json')};
}

export function recordSourceReviewErrors(bundle) {
    const errors = [], fail = (ok, message) => { if (!ok) errors.push(message); };
    const {index, files, inventory, references, dependencyReview, source, protectedHashes, dex} = bundle;
    const inventoryMap = new Map(inventory.records.map(row => [row.identity, row]));
    const actualMap = new Map(source.rows.map(row => [row.identity, row]));
    fail(index.sourceFingerprint === inventory.sourceFingerprint && source.sourceFingerprint === inventory.sourceFingerprint, 'Record source inventory fingerprint is stale');
    fail(index.productionPolicyPromotion === false && index.behavioralVerification === 'not-run', 'Source review cannot promote policy or gameplay certification');
    for (const item of index.protectedPolicyArtifacts) fail(protectedHashes[item.path] === item.semanticSha256, `Protected policy/reference artifact changed: ${item.path}`);
    const refs = new Map(references.documents.map(row => [`Core System/${row.path}`, row]));
    const citations = value => {
        if (!value || typeof value !== 'object') return;
        if (value.path?.startsWith('Core System/')) {
            const ref = refs.get(value.path);
            fail(ref?.sha256 === value.sha256, `Record citation hash/path mismatch: ${value.path}`);
            for (const page of value.pdfPages ?? value.pages ?? []) fail(Number.isInteger(page) && page >= 1 && page <= ref?.pdfPages, `Record citation page invalid: ${value.path} ${page}`);
        }
        for (const child of Object.values(value)) if (child && typeof child === 'object') citations(child);
    };
    const rows = new Map(), counts = {reviewed: 0, excluded: 0, unresolved: 0, unreviewed: 0};
    for (const [path, file] of Object.entries(files)) {
        fail(file.productionPolicyPromotion === false, `Review artifact promotes policy: ${path}`);
        for (const row of file.records) {
            fail(!rows.has(row.identity), `Duplicate record disposition: ${row.identity}`); rows.set(row.identity, row);
            const expected = inventoryMap.get(row.identity), actual = actualMap.get(row.identity);
            fail(expected && actual && expected.contentHash === row.contentHash && actual.contentHash === row.contentHash, `Record identity/hash stale or unknown: ${row.identity}`);
            fail(Object.hasOwn(counts, row.coverageState), `Unknown record coverage state: ${row.identity}`);
            if (Object.hasOwn(counts, row.coverageState)) counts[row.coverageState]++;
            fail(row.identityReview?.status === 'supported' && row.identityReview.basis && row.recordClass && row.generationReview?.status && row.ruleVersionReview?.status && row.ruleVersionReview.basis, `Incomplete record disposition: ${row.identity}`);
            fail(row.productionPolicyPromotion === false && row.behavioralVerification === 'not-run', `Record review cannot approve policy/behavior: ${row.identity}`);
            if (row.coverageState === 'reviewed') fail(row.sources?.length && row.fieldReview?.length && row.normativeFieldCoverage, `Reviewed record lacks source/field evidence: ${row.identity}`);
            const comparison = row.sourceComparison;
            if (comparison?.sourceProfile) {
                fail(comparison.correspondenceSupported && comparison.equalMechanicalGroups >= 2 && comparison.fields.length > 6, `Species correspondence lacks independent mechanical fields: ${row.identity}`);
                const fields = new Map(comparison.fields.map(field => [field.field, field]));
                const expectedGroups = {
                    baseStats: fields.get('system.stats')?.status === 'supported',
                    types: fields.get('system.types')?.status === 'supported',
                    abilitySlots: fields.get('system.abilities exact UUID-resolved slot order')?.status === 'supported',
                    evolutionLevels: fields.get('system.evolutions levels')?.status === 'supported'
                };
                const stats = fields.get('system.stats'), types = fields.get('system.types'), abilities = fields.get('system.abilities exact UUID-resolved slot order'), evolution = fields.get('system.evolutions levels');
                const currentAbilityLabels = ['basic', 'advanced', 'high'].flatMap(tier => (actual?.data.system.abilities?.[tier] ?? []).map(link => actualMap.get(`abilities.${link.uuid.split('.').at(-1)}`)?.data.name));
                fail(equal(stats?.recordValue, actual?.data.system.stats) && equal(types?.recordValue, actual?.data.system.types)
                    && equal(abilities?.recordValue, currentAbilityLabels) && equal(evolution?.recordValue, actual?.data.system.evolutions.map(entry => entry.level)), `Species comparison does not describe current record fields: ${row.identity}`);
                if (expectedGroups.baseStats) fail(equal(stats.recordValue, stats.sourceValue), `Supported species stats differ from source evidence: ${row.identity}`);
                if (expectedGroups.types) fail(equal(types.recordValue.map(labelKey).sort(), types.sourceValue.map(labelKey).sort()), `Supported species Types differ from source evidence: ${row.identity}`);
                if (expectedGroups.abilitySlots) fail(equal(abilities.recordValue.map(labelKey), abilities.sourceValue.map(labelKey)), `Supported species slots differ from source evidence: ${row.identity}`);
                if (expectedGroups.evolutionLevels) fail(equal(evolution.recordValue, evolution.sourceValue), `Supported evolution levels differ from source evidence: ${row.identity}`);
                fail(Object.keys(comparison.independentGroups ?? {}).length === 4 && Object.entries(expectedGroups).every(([key, value]) => comparison.independentGroups[key] === value)
                    && comparison.equalMechanicalGroups === Object.values(expectedGroups).filter(Boolean).length, `Species independent-group count/evidence disagree: ${row.identity}`);
            }
            if (comparison?.sourceUnit && !['move', 'ability'].includes(actual?.data.type)) fail(comparison.anchor?.definitionContextNormalizedSha256 && comparison.anchor.heading && comparison.anchor.startLine >= 1, `Record source lacks anchored definition context: ${row.identity}`);
            if (row.coverageState === 'excluded') fail(expected?.generationEligibility === 'excluded' || row.generationReview.exclusionEvidence?.independentRecordFields, `Excluded consumer/name alone cannot exclude target: ${row.identity}`);
            citations(row);
        }
    }
    counts.unreviewed += inventoryMap.size - rows.size;
    fail(index.coverage.totalInventoryRecords === inventoryMap.size && index.coverage.explicitRecordDispositions === rows.size, 'Record coverage inventory/disposition counts differ');
    for (const [state, count] of Object.entries(counts)) fail((index.coverage.counts[state] ?? 0) === count, `Record coverage count wrong: ${state}`);
    fail(index.coverage.completeAddressableClassification === (counts.unreviewed === 0), 'Cannot claim completed classification while addressable inventory remains unreviewed');

    const expectedRelations = new Set(inventory.dependencies.checkedRecords.flatMap(row => row.targets.map(target => `${row.identity}>${target}`)));
    const seenRelations = new Set();
    fail(dependencyReview.sourceFingerprint === source.sourceFingerprint && dependencyReview.productionPolicyPromotion === false, 'Dependency review fingerprint/policy boundary wrong');
    fail(dependencyReview.relationshipCount === expectedRelations.size && dependencyReview.relationshipCount === 87 && dependencyReview.recordCount === 88, 'First dependency batch must cover 88 records and 87 relationships');
    for (const relation of dependencyReview.relationships) {
        const key = `${relation.source}>${relation.target}`, from = actualMap.get(relation.source), to = actualMap.get(relation.target);
        fail(expectedRelations.has(key) && !seenRelations.has(key), `Unexpected/duplicate dependency disposition: ${key}`); seenRelations.add(key);
        fail(rows.has(relation.source) && rows.has(relation.target) && from?.contentHash === relation.sourceContentHash && to?.contentHash === relation.targetContentHash, `Dependency source/target review or hash missing: ${key}`);
        fail(relation.paths?.length && relation.identity?.status === 'supported' && relation.generation?.status && relation.ruleVersion?.status && relation.relevantDataFields?.length && relation.relationshipData?.length && relation.sourceReferences?.length, `Dependency lacks separate source/target field evidence: ${key}`);
        fail(relation.behavioralVerification === 'not-run' && relation.productionPolicyPromotion === false, `Dependency cannot certify policy/behavior: ${key}`);
        if (from && to) fail(JSON.stringify(from.data).includes(to.data._id), `Dependency target not present in exact current source: ${key}`);
        citations(relation);
    }
    fail(seenRelations.size === expectedRelations.size && [...expectedRelations].every(key => seenRelations.has(key)), 'Missing required dependency disposition');
    for (const regression of index.readingOrderRegressions) {
        const row = rows.get(regression.identity);
        fail(row?.contentHash === regression.contentHash && row.coverageState === 'reviewed' && row.sourceComparison?.sourceProfile === regression.sourceProfile && row.sourceComparison.equalMechanicalGroups >= 2, `Available reading-order profile lost: ${regression.identity}`);
    }
    fail(index.readingOrderRegressions.length === 4, 'Four reported source extraction regressions must remain covered');
    const learning = dex.profileDeltas.find(row => row.id === 'r04-d0418')?.changes.find(change => change.field === 'levelMoves');
    fail(learning && learning.sourceInterpretation.category === 'editorial-correction' && hash({standardSourceValue: learning.standardSourceValue, revisedSourceValue: learning.revisedSourceValue}) === index.acceptedSourceInvariants.darmanitanLearningValuesSha256, 'Darmanitan unchanged learning schedule must retain values and editorial classification');
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const data = await loadRecordSourceReview(), errors = recordSourceReviewErrors(data);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Record source snapshot valid: ${JSON.stringify(data.index.coverage.counts)}; ${data.dependencyReview.relationshipCount} relationships. Complete classification: ${data.index.coverage.completeAddressableClassification}. No policy/behavior promotion.`);
}
