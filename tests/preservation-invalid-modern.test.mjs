import assert from 'node:assert/strict';
import test from 'node:test';
import {isDeepStrictEqual} from 'node:util';
import {Migration111PrereqItems} from '../src/module/migration/migrations/111-prereq-items.js';
import {Migration113Keywords} from '../src/module/migration/migrations/113-keywords.js';
import {Migration115RulesAutomation} from '../src/module/migration/migrations/115-rules-automation.js';
import {resolvePreservationSource} from '../src/util/preservation.js';

const modernId = 'Compendium.p05test.versions.Item.AAAAAAAAAAAAAAAA';
const legacyId = 'Compendium.p05test.versions.Item.BBBBBBBBBBBBBBBB';
const absent = Symbol('absent modern provenance');
const malformedValues = [
    ['zero', 0],
    ['false', false],
    ['array', [modernId]],
    ['object', {uuid: modernId}]
];
const routes = [
    {Migration: Migration111PrereqItems, type: 'feat', fields: ['prerequisites']},
    {Migration: Migration113Keywords, type: 'move', fields: ['keywords', 'range']},
    {Migration: Migration115RulesAutomation, type: 'move', fields: ['rules', 'referenceEffect']}
];

function savedItem(type, modern) {
    const item = {
        _id: 'saved00000000001',
        name: 'Renamed saved Item',
        type,
        _stats: {duplicateSource: 'Item.CCCCCCCCCCCCCCCC'},
        flags: {
            core: {sourceId: legacyId},
            ptu: {selectedVersion: {id: 'saved-version'}, rulesSelections: {choice: 'saved'}},
            custom: {preserved: true}
        },
        system: {schema: {version: 0.110}, enabled: false, quantity: 0, custom: {value: null}}
    };
    if (modern !== absent) item._stats.compendiumSource = structuredClone(modern);
    return item;
}

function source(uuid, type) {
    const version = uuid === modernId ? 'modern' : 'legacy';
    return {uuid, type, name: 'Same source name', system: {
        prerequisites: [version],
        keywords: [version],
        range: {target: version},
        rules: [{key: 'RollOption', option: version}],
        referenceEffect: uuid
    }};
}

function sourceSpy(type) {
    const lookups = [];
    const warnings = [];
    return {
        lookups,
        warnings,
        async resolve(uuid) {
            lookups.push(uuid);
            assert.ok(uuid === modernId || uuid === legacyId, 'unexpected synthetic source lookup');
            return source(uuid, type);
        }
    };
}

async function withMigrationSource(type, run) {
    const spy = sourceSpy(type);
    const descriptors = Object.getOwnPropertyDescriptors(globalThis);
    globalThis.fromUuid = spy.resolve;
    globalThis.ui = {notifications: {warn: message => spy.warnings.push(message)}};
    try {
        await run(spy);
    } finally {
        for (const key of ['fromUuid', 'ui']) {
            if (descriptors[key]) Object.defineProperty(globalThis, key, descriptors[key]);
            else delete globalThis[key];
        }
    }
}

function diagnosticSummary(spy) {
    return {
        lookups: spy.lookups,
        warnings: spy.warnings.length,
        allManualReview: spy.warnings.every(message => /review manually/i.test(message))
    };
}

function assertSnapshot(actual, expected) {
    assert.deepEqual(actual, expected);
    assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

test('resolver preserves malformed modern provenance without resolving the legacy version', async () => {
    const actual = [];
    for (const [label, modern] of malformedValues) {
        const item = savedItem('move', modern);
        const before = structuredClone(item);
        const spy = sourceSpy(item.type);
        const outcomes = [];
        for (let pass = 0; pass < 2; pass++) {
            const result = await resolvePreservationSource(item, {
                resolve: spy.resolve,
                warn: (warnedItem, message) => {
                    assert.equal(warnedItem, item);
                    spy.warnings.push(message);
                }
            });
            outcomes.push(result?.uuid ?? null);
            assertSnapshot(item, before);
        }
        actual.push({label, outcomes, ...diagnosticSummary(spy)});
    }
    const expected = malformedValues.map(([label]) => ({
        label, outcomes: [null, null], lookups: [], warnings: 2, allManualReview: true
    }));
    assert.deepEqual(actual, expected);
});

for (const {Migration, type, fields} of routes) {
    test(Migration.name + ' preserves missing fields for malformed modern provenance', async () => {
        const actual = [];
        for (const [label, modern] of malformedValues) {
            await withMigrationSource(type, async spy => {
                const item = savedItem(type, modern);
                const before = structuredClone(item);
                const migration = new Migration();
                const legacySystem = source(legacyId, type).system;
                const rounds = [];
                for (let pass = 0; pass < 2; pass++) {
                    await migration.updateItem(item);
                    const addedFields = fields.filter(field => Object.hasOwn(item.system, field));
                    const stripped = structuredClone(item);
                    for (const field of addedFields) delete stripped.system[field];
                    assertSnapshot(stripped, before);
                    rounds.push({
                        addedFields,
                        copiedFromLegacy: addedFields.filter(field => isDeepStrictEqual(item.system[field], legacySystem[field])),
                        unchanged: isDeepStrictEqual(item, before) && JSON.stringify(item) === JSON.stringify(before)
                    });
                }
                actual.push({label, rounds, ...diagnosticSummary(spy)});
            });
        }
        const expected = malformedValues.map(([label]) => ({
            label,
            rounds: Array.from({length: 2}, () => ({addedFields: [], copiedFromLegacy: [], unchanged: true})),
            lookups: [],
            warnings: 2,
            allManualReview: true
        }));
        assert.deepEqual(actual, expected);
    });
}

for (const {label, modern, expectedId} of [
    {label: 'valid modern wins over a different legacy version', modern: modernId, expectedId: modernId},
    {label: 'nonempty invalid modern stays unresolved', modern: 'not-a-compendium-identity', expectedId: null},
    {label: 'null modern retains legacy support', modern: null, expectedId: legacyId},
    {label: 'absent modern retains legacy support', modern: absent, expectedId: legacyId}
]) {
    test(label, async () => {
        const item = savedItem('move', modern);
        const before = structuredClone(item);
        const spy = sourceSpy(item.type);
        const resolved = await resolvePreservationSource(item, {
            resolve: spy.resolve,
            warn: (_item, message) => spy.warnings.push(message)
        });
        assert.equal(resolved?.uuid ?? null, expectedId);
        assertSnapshot(item, before);
        assert.deepEqual(diagnosticSummary(spy), {
            lookups: expectedId ? [expectedId] : [], warnings: expectedId ? 0 : 1, allManualReview: true
        });

        for (const {Migration, type, fields} of routes) {
            await withMigrationSource(type, async migrationSpy => {
                const saved = savedItem(type, modern);
                const expected = structuredClone(saved);
                if (expectedId) {
                    const sourceSystem = source(expectedId, type).system;
                    for (const field of fields) expected.system[field] = sourceSystem[field];
                }
                const migration = new Migration();
                for (let pass = 0; pass < 2; pass++) {
                    await migration.updateItem(saved);
                    assertSnapshot(saved, expected);
                }
                assert.deepEqual(diagnosticSummary(migrationSpy), {
                    lookups: expectedId ? [expectedId] : [], warnings: expectedId ? 0 : 2, allManualReview: true
                });
            });
        }
    });
}

test('existing intentional field values survive malformed modern provenance on repeat', async () => {
    for (const [{Migration, type}, values] of [
        [routes[0], {prerequisites: null}],
        [routes[1], {keywords: [], range: {target: 'custom'}}],
        [routes[2], {rules: [{key: 'Custom'}], referenceEffect: null}]
    ]) {
        await withMigrationSource(type, async spy => {
            const item = savedItem(type, false);
            Object.assign(item.system, values);
            const before = structuredClone(item);
            const migration = new Migration();
            for (let pass = 0; pass < 2; pass++) {
                await migration.updateItem(item);
                assertSnapshot(item, before);
            }
            assert.deepEqual(spy.lookups, []);
            assert.deepEqual(spy.warnings, []);
        });
    }
});
