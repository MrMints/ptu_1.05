import assert from 'node:assert/strict';
import test from 'node:test';
import {Migration111PrereqItems} from '../src/module/migration/migrations/111-prereq-items.js';
import {MigrationRunner} from '../src/module/migration/runner/index.js';

const initialVersion = 0.110;
const targetVersion = 0.111;
const batchSize = 50;
const settingsKey = ['ptu', 'worldSchemaVersion'];

function syntheticFeature(number) {
    const id = 'partial' + String(number).padStart(9, '0');
    const legacy = 'Compendium.p05partial.features.Item.' + String(number).padStart(16, '0');
    return {
        _id: id,
        name: 'Synthetic Feature ' + number,
        type: 'feat',
        _stats: {compendiumSource: null},
        flags: {
            core: {sourceId: legacy},
            ptu: {selectedVersion: {id: 'synthetic-original', choices: []}},
            custom: {preserved: {enabled: false, count: 0, note: null}}
        },
        system: {
            schema: {version: initialVersion},
            enabled: false, quantity: 0, referenceEffect: null,
            custom: {nested: {selections: []}}
        }
    };
}

function itemCollection(store, save) {
    return {
        contents: Array.from(store, ([id, record]) => ({
            id, name: record.name, type: record.type,
            toObject: () => structuredClone(store.get(id))
        })),
        documentClass: {updateDocuments: save}
    };
}

function indexRecords(records) {
    return new Map(records.map(record => [record._id, record]));
}

function assertMigrated(snapshot, original, prerequisites) {
    assert.equal(snapshot.system.schema.version, targetVersion);
    const expected = structuredClone(original);
    expected.system.schema = structuredClone(snapshot.system.schema);
    expected.system.prerequisites = prerequisites;
    assert.deepEqual(snapshot, expected);
}

test('runner recovers from a failed second save using the serialized partial store', async context => {
    const inputs = Array.from({length: batchSize + 1}, (_, index) => syntheticFeature(index + 1));
    const originals = structuredClone(inputs);
    const ids = originals.map(record => record._id);
    const legacyIds = originals.map(record => record.flags.core.sourceId);
    const sources = new Map(legacyIds.map((uuid, index) => [
        uuid, {uuid, type: 'feat', system: {prerequisites: ['Synthetic prerequisite ' + (index + 1)]}}
    ]));
    assert.equal(new Set(ids).size, 51);
    assert.ok(ids.every(id => id.length === 16));
    assert.equal(sources.size, 51);

    const injected = new Error('Injected partial recovery failure before applying Item 51');
    const history = [];
    const saves = [];
    const lookups = [];
    const warnings = [];
    let failFinalBatch = true;
    let worldSchema = initialVersion;
    let store = indexRecords(structuredClone(inputs));

    async function save(updates, options) {
        const captured = structuredClone({updates, options});
        saves.push(captured);
        assert.deepEqual(captured.options, {noHook: true, pack: null});
        const targets = captured.updates.map(record => record._id);
        assert.ok(targets.length > 0 && targets.length <= batchSize);
        assert.equal(new Set(targets).size, targets.length, 'duplicate Item in save group');
        assert.ok(targets.every(id => store.has(id)), 'save targets only existing Items');
        if (failFinalBatch) {
            assert.ok(saves.length <= 2, 'unexpected save after injected failure');
            assert.deepEqual(targets, saves.length === 1 ? ids.slice(0, batchSize) : ids.slice(batchSize));
            if (saves.length === 2) {
                history.push({kind: 'rejected-save', ids: targets});
                throw injected;
            }
        }
        for (const record of captured.updates) {
            store.set(record._id, structuredClone(record));
        }
        history.push({kind: 'applied-save', ids: targets});
        return [];
    }

    const empty = {contents: [], documentClass: {
        async updateDocuments() { assert.fail('unexpected write outside the Item collection'); }
    }};
    const firstCollection = itemCollection(store, save);
    const game = {
        version: '13.351',
        system: {version: '4.4.3'},
        i18n: {format: key => key, localize: key => key},
        settings: {
            get(scope, key) {
                assert.deepEqual([scope, key], settingsKey);
                return worldSchema;
            },
            async set(scope, key, value) {
                assert.deepEqual([scope, key], settingsKey);
                history.push({kind: 'world-schema', value});
                worldSchema = value;
            }
        },
        actors: empty, items: firstCollection, journal: [], macros: [], tables: [], users: [], scenes: []
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
            assert.ok(sources.has(uuid), 'lookup targets only a synthetic legacy UUID');
            return structuredClone(sources.get(uuid));
        }
    };
    const previous = new Map(Object.keys(globals).map(
        key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]
    ));

    try {
        for (const [key, value] of Object.entries(globals)) {
            Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
        }

        await assert.rejects(
            () => new MigrationRunner([new Migration111PrereqItems()]).runMigration(),
            error => error === injected
        );
        assert.deepEqual(history, [
            {kind: 'applied-save', ids: ids.slice(0, batchSize)},
            {kind: 'rejected-save', ids: ids.slice(batchSize)}
        ]);
        assert.equal(worldSchema, initialVersion);
        assert.deepEqual([...store.keys()], ids);
        assert.deepEqual([...lookups].sort(), legacyIds);
        assert.deepEqual(warnings, []);
        assert.deepEqual(inputs, originals);

        for (const [index, captured] of saves[0].updates.entries()) {
            const stored = store.get(ids[index]);
            assert.deepEqual(stored, captured);
            assert.notStrictEqual(stored, captured);
            assert.notStrictEqual(stored.system, captured.system);
            assertMigrated(stored, originals[index], sources.get(legacyIds[index]).system.prerequisites);
        }
        const remainingId = ids.at(-1);
        const remainingUuid = legacyIds.at(-1);
        const unapplied = saves[1].updates[0];
        assertMigrated(unapplied, originals.at(-1), sources.get(remainingUuid).system.prerequisites);
        assert.deepEqual(store.get(remainingId), originals.at(-1));
        assert.equal(store.get(remainingId).system.schema.version, initialVersion);
        assert.ok(!Object.hasOwn(store.get(remainingId).system, 'prerequisites'));

        const partial = {records: [...store.values()], worldSchema};
        const reloaded = JSON.parse(JSON.stringify(partial));
        assert.deepEqual(reloaded, partial);
        assert.notStrictEqual(reloaded.records[0].system.schema, partial.records[0].system.schema);
        store = indexRecords(reloaded.records);
        game.items = itemCollection(store, save);
        worldSchema = reloaded.worldSchema;
        assert.notStrictEqual(game.items.contents[0], firstCollection.contents[0]);
        assert.deepEqual(game.items.contents.map(document => document.toObject()), partial.records);
        assert.equal(worldSchema, initialVersion);

        const saveStart = saves.length;
        const eventStart = history.length;
        const lookupStart = lookups.length;
        failFinalBatch = false;
        await new MigrationRunner([new Migration111PrereqItems()]).runMigration();

        const retrySaves = saves.slice(saveStart);
        const retryEvents = history.slice(eventStart);
        const retryLookups = lookups.slice(lookupStart);
        const retryIds = retrySaves.map(batch => batch.updates.map(record => record._id));
        assert.deepEqual(retryLookups, [remainingUuid]);
        assert.ok(retryIds.flat().includes(remainingId));
        assert.deepEqual(retryEvents, [
            ...retryIds.map(targets => ({kind: 'applied-save', ids: targets})),
            {kind: 'world-schema', value: targetVersion}
        ]);
        assert.equal(worldSchema, targetVersion);
        assert.deepEqual([...store.keys()], ids);
        assert.deepEqual(game.items.contents.map(document => document.toObject()), [...store.values()]);
        assert.deepEqual(warnings, []);
        assert.deepEqual(inputs, originals);

        for (const [index, id] of ids.entries()) {
            const stored = store.get(id);
            const prerequisites = sources.get(legacyIds[index]).system.prerequisites;
            assertMigrated(stored, originals[index], prerequisites);
            if (index < batchSize) {
                assert.deepEqual(stored.system.prerequisites, partial.records[index].system.prerequisites);
            }
        }

        context.diagnostic(JSON.stringify({
            failureBatches: history.slice(0, eventStart).map(event => [event.kind, event.ids.length]),
            persistedBeforeRetry: batchSize,
            unappliedId: remainingId,
            worldSchemaAfterFailure: reloaded.worldSchema,
            retryBatches: retryIds.map(targets => ({count: targets.length, first: targets[0], last: targets.at(-1)})),
            retryLookups,
            retryEventOrder: retryEvents.map(event => event.kind),
            worldSchemaAfterRetry: worldSchema
        }));
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
