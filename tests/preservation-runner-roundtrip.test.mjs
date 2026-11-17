import assert from 'node:assert/strict';
import test from 'node:test';
import {Migration111PrereqItems} from '../src/module/migration/migrations/111-prereq-items.js';
import {MigrationRunner} from '../src/module/migration/runner/index.js';

const initialVersion = 0.110;
const targetVersion = 0.111;
const absent = Symbol('absent modern provenance');
const cases = [
    {
        id: 'roundtrip0000001', name: 'Synthetic malformed Feature', modern: false,
        legacy: 'Compendium.p05roundtrip.features.Item.AAAAAAAAAAAAAAAA',
        prerequisites: ['Synthetic malformed source marker']
    },
    {
        id: 'roundtrip0000002', name: 'Synthetic null Feature', modern: null,
        legacy: 'Compendium.p05roundtrip.features.Item.BBBBBBBBBBBBBBBB',
        prerequisites: ['Synthetic null source marker']
    },
    {
        id: 'roundtrip0000003', name: 'Synthetic absent Feature', modern: absent,
        legacy: 'Compendium.p05roundtrip.features.Item.CCCCCCCCCCCCCCCC',
        prerequisites: ['Synthetic absent source marker']
    }
];

function feature({id, name, modern, legacy}) {
    const stats = {duplicateSource: null};
    if (modern !== absent) stats.compendiumSource = modern;

    return {
        _id: id, name, type: 'feat', _stats: stats,
        flags: {
            core: {sourceId: legacy},
            ptu: {selectedVersion: {id: 'synthetic-original', choices: []}},
            custom: {saved: {enabled: false, count: 0, note: null}}
        },
        system: {
            schema: {version: initialVersion},
            enabled: false, quantity: 0, referenceEffect: null,
            custom: {nested: {selections: []}}
        }
    };
}

function itemCollection(store, saves) {
    return {
        contents: Array.from(store, ([id, snapshot]) => ({
            id, name: snapshot.name, type: snapshot.type,
            toObject: () => structuredClone(store.get(id))
        })),
        documentClass: {
            async updateDocuments(updates, options) {
                const captured = structuredClone({updates, options});
                saves.push(captured);
                assert.deepEqual(captured.options, {noHook: true, pack: null});

                const seen = new Set();
                for (const {_id: id} of captured.updates) {
                    assert.ok(store.has(id), 'save must target an existing synthetic Item');
                    assert.ok(!seen.has(id), 'save must not duplicate a synthetic Item ID');
                    seen.add(id);
                }
                for (const snapshot of captured.updates) {
                    store.set(snapshot._id, structuredClone(snapshot));
                }
                return [];
            }
        }
    };
}

test('Feature preservation survives runner save, JSON reload and a current-schema run', async () => {
    const inputs = cases.map(feature);
    const original = structuredClone(inputs);
    const store = new Map(inputs.map(item => [item._id, structuredClone(item)]));
    const saves = [];
    const lookups = [];
    const warnings = [];
    const schemaWrites = [];
    let worldSchema = initialVersion;
    const items = itemCollection(store, saves);
    const empty = {contents: [], documentClass: {
        async updateDocuments() { assert.fail('unexpected write to an empty collection'); }
    }};
    const game = {
        version: '13.351',
        system: {version: '4.4.3'},
        i18n: {format: key => key, localize: key => key},
        settings: {
            get(scope, key) {
                assert.deepEqual([scope, key], ['ptu', 'worldSchemaVersion']);
                return worldSchema;
            },
            async set(scope, key, value) {
                assert.deepEqual([scope, key], ['ptu', 'worldSchemaVersion']);
                schemaWrites.push(value);
                worldSchema = value;
            }
        },
        actors: empty, items, journal: [], macros: [], tables: [], users: [], scenes: []
    };
    const globals = {
        game,
        foundry: {utils: {
            deepClone: structuredClone,
            diffObject: (before, after) => JSON.stringify(before) === JSON.stringify(after) ? {} : after
        }},
        ui: {notifications: {info() {}, error() {}, warn: message => warnings.push(message)}},
        $: () => ({length: 0}),
        fromUuid: async uuid => {
            lookups.push(uuid);
            const entry = cases.find(candidate => candidate.legacy === uuid);
            assert.ok(entry, 'lookup must use one of the synthetic legacy UUIDs');
            return {uuid, type: 'feat', name: entry.name, system: {
                prerequisites: structuredClone(entry.prerequisites)
            }};
        }
    };
    const previous = new Map(Object.keys(globals).map(
        key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]
    ));

    try {
        for (const [key, value] of Object.entries(globals)) {
            Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
        }
        await new MigrationRunner([new Migration111PrereqItems()]).runMigration();

        assert.deepEqual(inputs, original);
        assert.deepEqual([...store.keys()], cases.map(entry => entry.id));
        assert.equal(saves.length, 1);
        assert.deepEqual(saves[0].updates.map(item => item._id).sort(), cases.map(entry => entry.id));
        assert.deepEqual([...lookups].sort(), cases.slice(1).map(entry => entry.legacy));
        assert.equal(warnings.length, 1);
        assert.match(warnings[0], /\(roundtrip0000001\).*review manually/i);
        assert.ok(!warnings[0].includes(cases[0].legacy));
        assert.deepEqual(schemaWrites, [targetVersion]);
        assert.equal(worldSchema, targetVersion);

        for (const [index, entry] of cases.entries()) {
            const stored = store.get(entry.id);
            const captured = saves[0].updates.find(item => item._id === entry.id);
            const expected = structuredClone(original[index]);
            assert.equal(stored.system.schema.version, targetVersion);
            expected.system.schema = structuredClone(stored.system.schema);
            if (index === 0) {
                assert.ok(!Object.hasOwn(stored.system, 'prerequisites'));
            } else {
                expected.system.prerequisites = entry.prerequisites;
            }
            assert.deepEqual(stored, expected);
            assert.deepEqual(captured, stored);
            assert.notStrictEqual(captured, stored);
            assert.notStrictEqual(captured.system, stored.system);
        }

        const saved = {records: [...store.values()], worldSchema};
        const reloaded = JSON.parse(JSON.stringify(saved));
        assert.deepEqual(reloaded, saved);
        assert.deepEqual(saved.records, items.contents.map(document => document.toObject()));
        const reloadedStore = new Map(reloaded.records.map(item => [item._id, item]));
        game.items = itemCollection(reloadedStore, saves);
        worldSchema = reloaded.worldSchema;
        assert.deepEqual(game.items.contents.map(document => document.toObject()), saved.records);
        assert.notStrictEqual(game.items.contents[0], items.contents[0]);

        const previousActivity = {saves: saves.length, lookups: lookups.length, warnings: warnings.length};
        await new MigrationRunner([new Migration111PrereqItems()]).runMigration();

        assert.deepEqual({saves: saves.length, lookups: lookups.length, warnings: warnings.length}, previousActivity);
        assert.deepEqual([...reloadedStore.values()], saved.records);
        assert.deepEqual(game.items.contents.map(document => document.toObject()), saved.records);
        assert.equal(worldSchema, targetVersion);
        assert.ok(schemaWrites.length === 1 || schemaWrites.length === 2);
        assert.ok(schemaWrites.every(version => version === targetVersion));
        assert.deepEqual(inputs, original);
    } finally {
        for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else delete globalThis[key];
        }
        for (const [key, descriptor] of previous) {
            assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, key), descriptor);
        }
    }
});
