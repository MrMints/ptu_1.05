const UUID_PATTERN = /Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|RollTable|JournalEntry|Macro)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g;

// Classify by field semantics, never by a document's display name.
export const REFERENCE_PROFILES = {
    'import-provenance': {
        classification: 'historical-metadata',
        disposition: 'preserve-provenance',
        consumer: 'Historical core provenance. Core import preparation replaces it with the acquired UUID; the modern-first source accessor can read it on existing/raw documents. Preserve it; do not guess replacements.',
        evidence: ['Foundry v13.351 common/data/fields.mjs:3203', 'Foundry v13.351 client/documents/abstract/world-collection.mjs:118', 'src/util/document-source.js:2']
    },
    'legacy-import-provenance': {
        classification: 'historical-metadata',
        disposition: 'preserve-provenance-with-runtime-caveat',
        consumer: 'Legacy provenance is the source accessor fallback when current core identity is absent; refresh and migration consumers still read it. Do not treat it as proven inert.',
        evidence: ['src/util/document-source.js:2', 'src/module/item/base.js:359', 'src/module/migration/migrations/111-prereq-items.js:32']
    },
    'species-ability': {
        classification: 'runtime-reference', disposition: 'needs-investigation',
        consumer: 'PokemonGenerator.create resolves ability UUIDs and skips a missing result; evolution/level-up can dereference the result.',
        evidence: ['src/module/actor/pokemon/generator.js:169', 'src/module/actor/pokemon/document.js:663']
    },
    'species-capability': {
        classification: 'runtime-reference', disposition: 'needs-investigation',
        consumer: 'PokemonGenerator.create resolves capability UUIDs and skips a missing result.',
        evidence: ['src/module/actor/pokemon/generator.js:184']
    },
    'species-move': {
        classification: 'runtime-reference', disposition: 'needs-investigation',
        consumer: 'Species sheet resolves linked moves. Level entries are also consumed by generator and level-up workflows; this does not imply machine/tutor generator coverage.',
        evidence: ['src/module/item/species/sheet.js:72', 'src/module/actor/pokemon/generator.js:157', 'src/module/apps/level-up-form/document.js:281']
    },
    'temporary-species': {
        classification: 'runtime-reference', disposition: 'needs-investigation',
        consumer: 'TemporarySpecies constructor reads fromUuidSync(uuid).system; a missing result can throw and the rule factory drops the failed rule.',
        evidence: ['src/module/rules/rule-element/temp-species.js:15', 'src/module/rules/index.js:52']
    }
};

export function referenceProfile(path, data) {
    const key = path.join('.');
    if (key === '_stats.compendiumSource') return 'import-provenance';
    if (key === 'flags.core.sourceId') return 'legacy-import-provenance';
    if (data.type === 'species') {
        if (/^system\.abilities\.(basic|advanced|high)\.\d+\.uuid$/.test(key)) return 'species-ability';
        if (/^system\.capabilities\.other\.\d+\.uuid$/.test(key)) return 'species-capability';
        if (/^system\.moves\.(level|machine|egg|tutor)\.\d+\.uuid$/.test(key)) return 'species-move';
    }
    if (/^system\.rules\.\d+\.uuid$/.test(key)
        && data.system?.rules?.[Number(path[2])]?.key === 'TemporarySpecies') return 'temporary-species';
    return null; // New fields must be reviewed instead of silently becoming metadata.
}

function pointer(path) {
    return '/' + path.map(key => key.replaceAll('~', '~0').replaceAll('/', '~1')).join('/');
}

export function auditCompendiumReferences(documents) {
    const ids = new Set(documents.map(({pack, data}) => `${pack}.${data._id}`));
    const targets = new Map();
    function walk(value, path, source, data) {
        if (typeof value === 'string') {
            for (const match of value.matchAll(UUID_PATTERN)) {
                const target = `${match[1]}.${match[2]}`;
                if (ids.has(target)) continue;
                const profile = referenceProfile(path, data);
                if (!targets.has(target)) targets.set(target, []);
                targets.get(target).push({
                    source, pointer: pointer(path), offset: match.index, uuid: match[0],
                    profile, classification: REFERENCE_PROFILES[profile]?.classification ?? 'unclassified'
                });
            }
        } else if (value && typeof value === 'object') {
            for (const [key, child] of Object.entries(value)) walk(child, [...path, key], source, data);
        }
    }
    for (const {pack, data} of documents) walk(data, [], `${pack}.${data._id}`, data);
    const rows = [...targets].sort(([a], [b]) => a.localeCompare(b)).map(([target, occurrences]) => {
        occurrences.sort((a, b) => a.source.localeCompare(b.source) || a.pointer.localeCompare(b.pointer) || a.offset - b.offset);
        const classes = new Set(occurrences.map(occurrence => occurrence.classification));
        const classification = classes.has('unclassified') ? 'unclassified'
            : classes.has('runtime-reference') ? 'runtime-reference' : 'historical-metadata';
        return {
            target, classification,
            disposition: classification === 'historical-metadata'
                ? occurrences.some(row => row.profile === 'legacy-import-provenance')
                    ? 'preserve-provenance-with-runtime-caveat' : 'preserve-provenance'
                : 'needs-investigation',
            sources: [...new Set(occurrences.map(occurrence => occurrence.source))].sort(), occurrences
        };
    });
    const targetCounts = {}, occurrenceCounts = {}, profileCounts = {};
    for (const row of rows) {
        targetCounts[row.classification] = (targetCounts[row.classification] ?? 0) + 1;
        for (const occurrence of row.occurrences) {
            occurrenceCounts[occurrence.classification] = (occurrenceCounts[occurrence.classification] ?? 0) + 1;
            profileCounts[occurrence.profile ?? 'unclassified'] = (profileCounts[occurrence.profile ?? 'unclassified'] ?? 0) + 1;
        }
    }
    return {targetCounts, occurrenceCounts, profileCounts, targets: rows};
}
