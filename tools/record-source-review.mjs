import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readPackSources} from './pack-sources.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const labelKey = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const textHash = value => createHash('sha256').update(value).digest('hex');
// Match the review ledger's documented text representation: decode HTML,
// replace UUID markup with its visible label, join PDF hyphenated line wraps,
// fold Unicode punctuation/accents, then retain words, signs, %, and fractions.
const textEntities = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', frac14: '¼', frac12: '½', frac34: '¾', eacute: 'é'};
const cleanText = value => String(value || '').replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (match, code) => {
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(code[1].toLowerCase() === 'x' ? 2 : 1), code[1].toLowerCase() === 'x' ? 16 : 10));
    return textEntities[code] ?? match;
}).replace(/@UUID\[[^\]]+\]\{(?:Effect: |Order: )?([^}]+)\}/g, '$1').replace(/@UUID\[[^\]]+\]/g, '').replace(/<[^>]*>/g, ' ')
    .replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').replaceAll('Y ou', 'You').replaceAll('Y et', 'Yet').replaceAll('Poké mon', 'Pokémon')
    .normalize('NFKD').replace(/\p{M}/gu, '').replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replaceAll('×', 'x').replaceAll('¼', '1/4').replaceAll('½', '1/2').replaceAll('¾', '3/4').replace(/\s+/g, ' ').trim();
const normalizedText = value => (cleanText(value).toLowerCase().match(/[a-z0-9]+|[+%/]|-(?=\d)/g) ?? []).join(' ');
// Legacy empty-string list slots carry no values; nonempty scalar lists are an
// evidence error, not an invitation to compare individual characters.
const normalizedLabels = values => Array.isArray(values) ? values.map(labelKey).sort() : values == null || values === '' ? [] : null;
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const referencePaths = (value, target, path = '$') => {
    if (Array.isArray(value)) return value.flatMap((child, index) => referencePaths(child, target, `${path}[${index}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => referencePaths(child, target, `${path}.${key}`));
    if (typeof value !== 'string') return [];
    const matches = [...value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)];
    return matches.some(match => `${match[1]}.${match[2]}` === target) ? [path] : [];
};
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
    const links = values => (values ?? []).map(link => {
        const match = link.uuid?.match(/Compendium\.ptu\.([\w-]+)\.(?:Item\.)?([A-Za-z0-9]{16})$/), target = match ? `${match[1]}.${match[2]}` : null;
        return {target, label: actualMap.get(target)?.data.name ?? null, level: link.level};
    });
    const currentFieldEvidence = (row, actual, field) => {
        const system = actual?.data.system ?? {}, name = field.field;
        const check = ok => fail(ok, `Declared field evidence does not describe exact current record: ${row.identity} ${name}`);
        if (Object.hasOwn(field, 'recordValue')) {
            if (['type', 'frequency', 'ac', 'damageBase', 'category', 'prerequisites', 'keywords', 'cost', 'origin'].includes(name)) check(equal(field.recordValue, system[name] ?? null));
            else if (name === 'range+keywords') check(field.recordValue === `${Object.hasOwn(system, 'range') ? system.range === null ? 'None' : system.range : ''}, ${(system.keywords ?? []).join(', ')}`);
            else if (name === 'contestType/effect') check(equal(field.recordValue, system.contestType ?? null));
            else if (/^system\.(?:stats|types|effect|size\.[a-zA-Z]+|breeding\.(?:genderRatio|hatchRate))$/.test(name)) {
                const value = name.split('.').reduce((object, key) => object?.[key], actual?.data);
                check(equal(field.recordValue, value ?? null));
            } else if (['system.diet', 'system.habitats', 'system.breeding.eggGroups', 'system.capabilities.naturewalk'].includes(name)) {
                const value = name.split('.').reduce((object, key) => object?.[key], actual?.data);
                check(equal(field.recordValue, normalizedLabels(value)));
            } else if (name === 'system.effect and bonus values in system.rules') check(field.recordValue === system.effect);
        }
        if (['move', 'ability'].includes(actual?.data.type) && name === 'effect' && field.recordNormalizedSha256) {
            let text = normalizedText(cleanText(system.effect).replace(/^Effect:\s*/, ''));
            if (text === 'none' && field.sourceNormalizedSha256 === textHash('')) text = '';
            check(field.recordNormalizedSha256 === textHash(text));
        }
        if (actual?.data.type !== 'species') return;
        if (field.status === 'supported' && Object.hasOwn(field, 'recordValue') && Object.hasOwn(field, 'sourceValue') && !['system.types', 'system.abilities exact UUID-resolved slot order'].includes(name)) check(equal(field.recordValue, field.sourceValue));
        if (name === 'system.skills six printed entries') {
            check(field.values?.length === 6 && new Set(field.values.map(value => value.key)).size === 6);
            for (const value of field.values ?? []) {
                const skill = system.skills?.[value.key];
                check(equal(value.record, {value: skill?.value ?? null, modifier: skill?.modifier ?? null}));
                if (value.status === 'supported') check(equal(value.record, value.source));
            }
        } else if (name === 'system.capabilities numeric fields') {
            for (const value of field.values ?? []) check(value.record === (system.capabilities?.[value.field] ?? 0));
            if (field.status === 'supported') check(field.values.every(value => value.record === value.source));
        } else if (name === 'system.capabilities.other exact UUID targets') {
            check(equal(field.targetFindings?.map(value => ({target: value.target, label: value.resolvedLabel})), links(system.capabilities?.other).map(value => ({target: value.target, label: value.label}))));
            if (field.status === 'supported') check(field.targetFindings.every(value => value.printedPresence === true));
        } else if (name === 'system.evolutions requirements') {
            if (field.recordRestrictions) check(equal(field.recordRestrictions, (system.evolutions ?? []).flatMap(entry => entry.other?.restrictions ?? []).filter(Boolean)));
            if (field.currentBranches) check(equal(field.currentBranches, links(system.evolutions).map((value, ordinal) => ({ordinal, target: value.target, resolvedLabelForReview: value.label, level: value.level, restrictions: (system.evolutions[ordinal].other?.restrictions ?? []).filter(Boolean)}))));
        } else if (['system.number', 'system.form', 'system.dexentry'].includes(name)) check(field.recordNormalizedSha256 === textHash(normalizedText(system[name.split('.')[1]])));
        else if (/^system\.moves\.(level|machine|egg|tutor)$/.test(name)) {
            const entries = links(system.moves?.[name.split('.')[2]]);
            check(field.recordEntryCount === entries.length);
            for (const value of field.unsupportedCurrentEntries ?? []) check(entries.some(entry => entry.target === value.target && entry.label === value.resolvedLabel && (entry.level ?? null) === (value.level ?? null)));
            if (field.status === 'supported') check(!field.unsupportedCurrentEntries?.length && !field.missingSourceEntries?.length);
        }
    };
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
            if (comparison?.fields) fail(equal(row.fieldReview, comparison.fields), `Duplicated fieldReview/sourceComparison evidence disagrees: ${row.identity}`);
            for (const field of row.fieldReview ?? []) currentFieldEvidence(row, actual, field);
            if (comparison?.sourceProfile) {
                fail(comparison.fields.length > 6 && (row.coverageState !== 'reviewed' || comparison.correspondenceSupported && (comparison.equalMechanicalGroups >= 2 || comparison.supplementalCorrespondence)), `Species correspondence lacks independent mechanical fields: ${row.identity}`);
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
                if (comparison.supplementalCorrespondence) {
                    const extra = ['system.size.height', 'system.size.weight', 'system.skills six printed entries'];
                    fail(equal(comparison.supplementalCorrespondence.fieldNames, extra) && extra.every(name => fields.get(name)?.status === 'supported') && (expectedGroups.types || expectedGroups.evolutionLevels), `Supplemental species correspondence lacks metric/skill evidence: ${row.identity}`);
                }
                if (comparison.derivedFormEvidence?.kind === 'printed-mega-table') fail(row.sources.some(citation => citation.path === 'Core System/Pokemon Tabletop United 1.05 Core.pdf' && citation.pdfPages?.includes(206)), `Derived Mega evidence lost the additional-Ability rule citation: ${row.identity}`);
            }
            if (comparison?.sourceUnit && !['move', 'ability'].includes(actual?.data.type)) fail(comparison.anchor?.definitionContextNormalizedSha256 && comparison.anchor.heading && comparison.anchor.startLine >= 1, `Record source lacks anchored definition context: ${row.identity}`);
            if (row.coverageState === 'excluded') fail(expected?.generationEligibility === 'excluded' || row.generationReview.exclusionEvidence?.independentRecordFields, `Excluded consumer/name alone cannot exclude target: ${row.identity}`);
            citations(row);
        }
    }
    counts.unreviewed += inventoryMap.size - rows.size;
    fail(index.coverage.totalInventoryRecords === inventoryMap.size && index.coverage.explicitRecordDispositions === rows.size, 'Record coverage inventory/disposition counts differ');
    for (const [state, count] of Object.entries(counts)) fail((index.coverage.counts[state] ?? 0) === count, `Record coverage count wrong: ${state}`);
    const sourceClasses = {};
    for (const row of rows.values()) sourceClasses[row.recordClass] = (sourceClasses[row.recordClass] ?? 0) + 1;
    fail(equal(index.coverage.sourceClassCounts, sourceClasses), 'Record source-class counts differ from explicit dispositions');
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
        fail(equal(relation.relevantDataFields, rows.get(relation.target)?.fieldReview) && equal(relation.sourceReferences, rows.get(relation.target)?.sources), `Dependency duplicated target field/source evidence disagrees: ${key}`);
        fail(relation.behavioralVerification === 'not-run' && relation.productionPolicyPromotion === false, `Dependency cannot certify policy/behavior: ${key}`);
        if (from && to) {
            const actualPaths = [...new Set(referencePaths(from.data, relation.target))].sort();
            fail(actualPaths.length && equal(actualPaths, [...new Set(relation.paths ?? [])].sort()), `Dependency UUID paths do not describe exact current source: ${key}`);
        }
        citations(relation);
    }
    fail(seenRelations.size === expectedRelations.size && [...expectedRelations].every(key => seenRelations.has(key)), 'Missing required dependency disposition');
    for (const regression of index.readingOrderRegressions) {
        const row = rows.get(regression.identity);
        fail(row?.contentHash === regression.contentHash && row.coverageState === 'reviewed' && row.sourceComparison?.sourceProfile === regression.sourceProfile && row.sourceComparison.equalMechanicalGroups >= 2, `Available reading-order profile lost: ${regression.identity}`);
    }
    fail(index.readingOrderRegressions.length === 4, 'Four reported source extraction regressions must remain covered');
    if (index.finiteFormBranchBatch) {
        const batch = index.finiteFormBranchBatch, file = files[batch.recordFile], cases = new Map(batch.cases.map(row => [row.identity, row]));
        fail(batch.records === 95 && batch.cases.length === 95 && cases.size === 95 && file?.records.length === 95 && batch.noPendingExtraction === true, 'Finite form/branch/skill batch must retain all 95 examined cases');
        const batchCounts = {reviewed: 0, unresolved: 0};
        for (const row of file?.records ?? []) {
            const expected = cases.get(row.identity);
            fail(expected?.contentHash === row.contentHash && expected.sourceProfile === row.sourceComparison?.sourceProfile && expected.coverageState === row.coverageState
                && Object.hasOwn(batchCounts, row.coverageState) && !row.fieldReview.some(field => field.status === 'unreviewed'), `Finite available-source case became pending or stale: ${row.identity}`);
            if (Object.hasOwn(batchCounts, row.coverageState)) batchCounts[row.coverageState]++;
            if (row.coverageState === 'unresolved') fail(row.missingEvidence?.examinedSourceProfile === row.sourceComparison?.sourceProfile && row.missingEvidence.neededArtifact && row.missingEvidence.differingFields?.length, `Examined variant conflict lacks a precise evidence limit: ${row.identity}`);
        }
        fail(equal(batch.counts, batchCounts), 'Finite form/branch/skill batch coverage counts differ');
    }
    const learning = dex.profileDeltas.find(row => row.id === 'r04-d0418')?.changes.find(change => change.field === 'levelMoves');
    fail(learning && learning.sourceInterpretation.category === 'editorial-correction' && hash({standardSourceValue: learning.standardSourceValue, revisedSourceValue: learning.revisedSourceValue}) === index.acceptedSourceInvariants.darmanitanLearningValuesSha256, 'Darmanitan unchanged learning schedule must retain values and editorial classification');
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const data = await loadRecordSourceReview(), errors = recordSourceReviewErrors(data);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Record source snapshot valid: ${JSON.stringify(data.index.coverage.counts)}; ${data.dependencyReview.relationshipCount} relationships. Complete classification: ${data.index.coverage.completeAddressableClassification}. No policy/behavior promotion.`);
}
