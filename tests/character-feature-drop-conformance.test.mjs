import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const importLine = /^[ \t]*import\b[^\r\n]*/gm;
const toModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const reject = name => { throw new Error('Unexpected boundary: ' + name); };

async function readPinned(path, bytes, sha256, t) {
    const working = await readFile(new URL('../' + path, import.meta.url));
    const source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(working);
    const normalized = source.replace(/\r\n/g, '\n');
    assert.equal(Buffer.byteLength(normalized), bytes, path);
    assert.equal(createHash('sha256').update(normalized).digest('hex'), sha256, path);
    t.diagnostic(path + ': ' + working.length + ' working bytes; ' + bytes + ' pinned committed bytes');
    return source;
}

function bindImports(source, bindings) {
    assert.deepEqual(source.match(importLine) ?? [], bindings.map(([line]) => line));
    const rewritten = new Map(bindings.map(([line, url]) => {
        const specifier = /(['"])([^'"]+)\1;$/;
        assert.match(line, specifier);
        return [line, line.replace(specifier, (_match, quote) => quote + url + quote + ';')];
    }));
    const inverse = new Map([...rewritten].map(([before, after]) => [after, before]));
    const bound = source.replace(importLine, line => rewritten.get(line));
    assert.equal(bound.replace(importLine, line => inverse.get(line)), source);
    return toModule(bound);
}

function unavailableExports(...names) {
    return toModule(names.map(name =>
        'export function ' + name + '() { throw new Error("Unexpected boundary: ' + name + '"); }',
    ).join('\n'));
}

async function withGlobals(values, fn) {
    const installed = [];
    try {
        for (const [key, value] of Object.entries(values)) {
            const prior = Object.getOwnPropertyDescriptor(globalThis, key);
            Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
            installed.push({ key, prior });
        }
        return await fn();
    } finally {
        for (const { key, prior } of installed.reverse()) {
            if (prior) Object.defineProperty(globalThis, key, prior);
            else Reflect.deleteProperty(globalThis, key);
        }
        for (const { key, prior } of installed) {
            assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, key), prior, key);
        }
    }
}

const sheetBoundaries = new WeakMap();

class ActorSheet {
    constructor() { reject('sheet construction'); }
    _onDrop() { reject('native drop dispatch'); }
    _onDropItem() { reject('native Item drop dispatch'); }
    _onDropItemCreate(...args) { return sheetBoundaries.get(this).create(...args); }
    _onSortItem(...args) { return sheetBoundaries.get(this).sort(...args); }
}

async function loadModules(t) {
    const scope = toModule(`
        export const checks = new WeakMap();
        export function isExcludedAcquisitionDocument(document) {
            const check = checks.get(document);
            if (!check) throw new Error('Unexpected scope document');
            check();
            return false;
        }
    `);
    const acquisition = unavailableExports('assignFeatureGroup', 'actorPrerequisiteViews');
    const graph = bindImports(await readPinned(
        'src/util/saved-item-graph.js', 7380,
        '00a88150b7d599079632e014bbe64b568e2abaddd19d9fd703305d67b0040f38', t,
    ), [
        ["import {isExcludedAcquisitionDocument} from './content-scope.js';", scope],
        ["import {isStarterTrainingGrant} from './starter-training.js';", unavailableExports('isStarterTrainingGrant')],
    ]);
    const base = bindImports(await readPinned(
        'src/module/actor/sheet.js', 11169,
        '1d9185fc2eee131488d81e054c3949cd4de419b14df0f0a93fbe47fcb4f44b42', t,
    ), [
        ['import { ActorConfig } from "./sheet/actor-config.js";', unavailableExports('ActorConfig')],
        ["import {isExcludedAcquisitionDocument} from '../../util/content-scope.js';", scope],
        ["import {actorPrerequisiteViews} from '../../util/acquisition.js';", acquisition],
        ["import {hasSavedItemGraph,copySavedItemDocuments} from '../../util/saved-item-graph.js';", graph],
    ]);
    const character = bindImports(await readPinned(
        'src/module/actor/character/sheet.js', 19593,
        'f57579b0720033cbb3aeccf2751d42a492aa8c72f1816a4cd49dad3aae23997f', t,
    ), [
        ['import { ItemSummaryRenderer } from "../sheet/item-summary.js";', unavailableExports('ItemSummaryRenderer')],
        ['import { InventoryConfigSheet } from "../sheet/inventory-config.js";', unavailableExports('InventoryConfigSheet')],
        ['import { PTUPartySheet } from "../../apps/party/sheet.js";', unavailableExports('PTUPartySheet')],
        ['import { Statistic } from "../../system/statistic/index.js";', unavailableExports('Statistic')],
        ['import { PTUDexSheet } from "../../apps/dex/sheet.js";', unavailableExports('PTUDexSheet')],
        ['import { PTUActorSheet } from "../sheet.js";', base],
        ['import { presentSkills } from "../../../util/skills.js";', unavailableExports('presentSkills')],
        ["import {assignFeatureGroup} from '../../../util/acquisition.js';", acquisition],
        ["import {hasSavedItemGraph,copySavedItemDocuments} from '../../../util/saved-item-graph.js';", graph],
    ]);

    const { PTUActorSheet, PTUCharacterSheet } = await withGlobals(
        { foundry: { appv1: { sheets: { ActorSheet } } } },
        async () => {
            const { PTUActorSheet } = await import(base);
            const { PTUCharacterSheet } = await import(character);
            return { PTUActorSheet, PTUCharacterSheet };
        },
    );
    assert.equal(Object.getPrototypeOf(PTUCharacterSheet.prototype), PTUActorSheet.prototype);
    assert.equal(Object.getPrototypeOf(PTUActorSheet.prototype), ActorSheet.prototype);
    assert.ok(Object.hasOwn(PTUCharacterSheet.prototype, '_onDropItem'));
    assert.equal(PTUCharacterSheet.prototype._onDropItemCreate, ActorSheet.prototype._onDropItemCreate);
    assert.equal(PTUCharacterSheet.prototype._onSortItem, ActorSheet.prototype._onSortItem);
    const { checks } = await import(scope);
    return { PTUCharacterSheet, checks };
}

function makeSource(id, name, type, version) {
    return {
        _id: id,
        name,
        type,
        img: 'synthetic.webp',
        effects: [],
        _stats: {
            compendiumSource: 'Compendium.p05receiver.sources.Item.' + id,
            duplicateSource: null,
            exportSource: 'synthetic-export-' + version,
        },
        flags: {
            core: { sourceId: 'synthetic-legacy-' + version },
            ptu: {
                selectedVersion: { id: version, label: name + ' version', extra: false },
                rulesSelections: { saved: 'choice-' + version },
            },
            synthetic: { retained: { falseValue: false, zero: 0, empty: [], unset: null } },
        },
        system: {
            prerequisites: ['Synthetic prerequisite for ' + name],
            enabled: false,
            custom: { marker: version, values: [false, 0, null, []] },
        },
    };
}

class ItemCollection extends Map {
    constructor(role, trace) {
        super();
        this.role = role;
        this.trace = trace;
    }

    get(id) {
        this.trace.push([this.role + ':get', id]);
        return super.get(id);
    }

    values() {
        this.trace.push([this.role + ':values']);
        return super.values();
    }

    getName(name) {
        assert.equal(this.role, 'destination');
        this.trace.push(['destination:getName', name]);
        assert.equal(this.size, 0);
        return undefined;
    }
}

function makeActor(role, isOwner, trace) {
    return {
        name: 'Synthetic ' + role,
        uuid: role === 'destination' ? 'Actor.DESTINATION00001' : 'Actor.SOURCEACTOR00001',
        type: 'character',
        isOwner,
        flags: { synthetic: { preserved: true } },
        system: { note: role, custom: [false, 0, null, []] },
        items: new ItemCollection(role, trace),
        update: () => reject('Actor.update'),
        delete: () => reject('Actor.delete'),
        createEmbeddedDocuments: () => reject('Actor.createEmbeddedDocuments'),
        updateEmbeddedDocuments: () => reject('Actor.updateEmbeddedDocuments'),
        deleteEmbeddedDocuments: () => reject('Actor.deleteEmbeddedDocuments'),
    };
}

function makeDocument(source, { parent = null, pack = null, user, trace, observer = false }) {
    const data = structuredClone(source);
    const document = {
        id: data._id,
        uuid: parent ? parent.uuid + '.Item.' + data._id : 'Compendium.' + pack + '.Item.' + data._id,
        name: data.name,
        type: data.type,
        category: data.type,
        parent,
        pack,
        flags: data.flags,
        system: data.system,
        toObject() {
            trace.push(['snapshot', document.id]);
            return structuredClone(data);
        },
        testUserPermission(candidate, level) {
            assert.equal(observer, true, 'Observer check outside the saved graph');
            assert.equal(candidate, user);
            assert.equal(level, 'OBSERVER');
            trace.push(['permission', document.id]);
            return true;
        },
        update: () => reject('Item.update'),
        delete: () => reject('Item.delete'),
    };
    const inspect = () => ({
        source: structuredClone(data),
        id: document.id,
        uuid: document.uuid,
        name: document.name,
        type: document.type,
        category: document.category,
        parent: document.parent,
        pack: document.pack,
        flags: structuredClone(document.flags),
        system: structuredClone(document.system),
    });
    return { document, inspect };
}

function inspectActor(actor) {
    const { name, uuid, type, isOwner, flags, system } = actor;
    return structuredClone({ name, uuid, type, isOwner, flags, system });
}

function rememberActor(actor) {
    const data = inspectActor(actor);
    const items = actor.items;
    const members = [...items];
    return () => {
        assert.deepEqual(inspectActor(actor), data);
        assert.equal(actor.items, items);
        const current = [...items];
        assert.deepEqual(current.map(([id]) => id), members.map(([id]) => id));
        for (const [index, [, item]] of current.entries()) {
            assert.equal(item, members[index][1]);
        }
    };
}

const modes = [
    ['non-owner stops before resolution', 'non-owner'],
    ['ordinary external Feature delegates one bare snapshot', 'ordinary'],
    ['same-Actor Feature delegates sorting with the original event', 'sort'],
    ['consent copies and remaps the saved Feature and linked Edge', 'accept'],
    ['declining the linked copy leaves the graph unchanged', 'decline'],
];

async function verifyCase({ PTUCharacterSheet, checks }, mode) {
    const trace = [];
    const user = Object.freeze({ id: 'synthetic-observer' });
    const saved = mode === 'accept' || mode === 'decline';
    const destination = makeActor('destination', mode !== 'non-owner', trace);
    const sourceActor = saved ? makeActor('source', false, trace) : null;
    const selectedSource = makeSource('FEATUREPARENT001', 'Synthetic Feature', 'feat', 'synthetic-feature-version');
    const childSource = makeSource('LINKEDCHILD00001', 'Synthetic linked Edge', 'edge', 'synthetic-edge-version');
    if (saved) {
        selectedSource.flags.ptu.itemGrants = { savedEdge: { id: childSource._id, onDelete: 'detach' } };
        childSource.flags.ptu.grantedBy = { id: selectedSource._id, onDelete: 'cascade' };
    }
    const parent = mode === 'sort' ? destination : sourceActor;
    const selected = makeDocument(selectedSource, {
        parent, pack: parent ? null : 'p05receiver.sources', user, trace, observer: saved,
    });
    const linked = saved ? makeDocument(childSource, { parent, user, trace, observer: true }) : null;
    if (parent) parent.items.set(selected.document.id, selected.document);
    if (linked) {
        parent.items.set(linked.document.id, linked.document);
        for (const { document } of [selected, linked]) {
            checks.set(document, () => trace.push(['scope', document.id]));
        }
    }

    const actorChecks = [destination, ...(sourceActor ? [sourceActor] : [])].map(rememberActor);
    const documentChecks = [selected, ...(linked ? [linked] : [])].map(item => [item, item.inspect()]);
    const originalFixtures = structuredClone([selectedSource, childSource]);
    const request = { type: 'Item', uuid: selected.document.uuid };
    const requestBefore = structuredClone(request);
    const event = { target: {
        closest(selector) {
            assert.equal(selector, '[data-item-id]');
            trace.push(['native:closest']);
            return null;
        },
    } };
    const originalTarget = event.target;
    const receiver = Object.create(PTUCharacterSheet.prototype);
    receiver.actor = destination;
    const ordinary = [], sort = [], graph = [], confirmations = [], ids = [];
    const sentinels = { ordinary: Symbol('ordinary creation'), sort: Symbol('sort'), graph: Symbol('graph creation') };
    const freshIds = ['COPIEDPARENT0001', 'COPIEDCHILD00001'];

    sheetBoundaries.set(receiver, {
        create(...args) {
            trace.push(['ordinary:create']);
            ordinary.push({ args, snapshot: structuredClone(args[0]) });
            return sentinels.ordinary;
        },
        sort(...args) {
            trace.push(['sort']);
            sort.push({ args, snapshot: structuredClone(args[1]) });
            return sentinels.sort;
        },
    });

    const result = await withGlobals({
        Item: { implementation: {
            async fromDropData(data) {
                assert.equal(data, request);
                assert.deepEqual(data, requestBefore);
                trace.push(['resolve', data.uuid]);
                return selected.document;
            },
        } },
        foundry: { utils: {
            deepClone(source) {
                trace.push(['clone', source._id]);
                return structuredClone(source);
            },
            randomID() {
                assert.ok(ids.length < freshIds.length, 'Unexpected extra ID generation');
                const id = freshIds[ids.length];
                ids.push(id);
                trace.push(['id', id]);
                return id;
            },
            mergeObject(target, changes, options) {
                assert.deepEqual(changes, {});
                assert.deepEqual(options, { insertKeys: false, performDeletions: true, inplace: true });
                trace.push(['merge', target._id]);
                return target;
            },
        } },
        CONFIG: { Item: { documentClass: {
            createDocuments(...args) {
                assert.equal(args.length, 2);
                const [sources, options] = args;
                trace.push(['graph:create']);
                graph.push({ sources: structuredClone(sources), options: { ...options } });
                return sentinels.graph;
            },
            canUserCreate: () => reject('world Item creation permission'),
        } } },
        game: new Proxy({ user }, {
            get(target, key) {
                assert.equal(key, 'user', 'Only synthetic user access is supported');
                return target.user;
            },
        }),
        Dialog: {
            async confirm(options) {
                trace.push(['confirm']);
                confirmations.push({ ...options });
                assert.ok(saved);
                return mode === 'accept' ? options.yes() : options.no();
            },
        },
        $(target) {
            assert.equal(target, originalTarget);
            trace.push(['$']);
            return {
                closest(selector) {
                    assert.equal(selector, '.color-wrapper');
                    trace.push(['$:closest']);
                    return {
                        data(key) {
                            assert.equal(key, 'category');
                            trace.push(['$:data']);
                            return undefined;
                        },
                    };
                },
            };
        },
    }, () => receiver._onDropItem(event, request));

    assert.deepEqual(request, requestBefore);
    assert.equal(event.target, originalTarget);
    assert.equal(receiver.actor, destination);
    for (const verify of actorChecks) verify();
    for (const [item, before] of documentChecks) {
        const after = item.inspect();
        assert.equal(after.parent, before.parent);
        assert.deepEqual(after, before);
    }
    assert.deepEqual([selectedSource, childSource], originalFixtures);

    assert.equal(ordinary.length, mode === 'ordinary' ? 1 : 0);
    assert.equal(sort.length, mode === 'sort' ? 1 : 0);
    assert.equal(graph.length, mode === 'accept' ? 1 : 0);
    assert.equal(confirmations.length, saved ? 1 : 0);
    assert.deepEqual(ids, mode === 'accept' ? freshIds : []);
    if (mode === 'non-owner') {
        assert.equal(result, false);
        assert.deepEqual(trace, []);
        return;
    }

    const originalId = selectedSource._id;
    const resolve = ['resolve', request.uuid];
    assert.deepEqual(trace.filter(([name]) => name === 'resolve'), [resolve]);
    const ordinaryPrefix = [resolve, ['snapshot', originalId], ['$'], ['$:closest'], ['$:data'], ['native:closest']];
    if (mode === 'ordinary') {
        assert.equal(result, sentinels.ordinary);
        const [{ args, snapshot }] = ordinary;
        assert.equal(args.length, 1);
        assert.equal(Array.isArray(args[0]), false);
        assert.notEqual(args[0].flags, selected.document.flags);
        assert.notEqual(args[0].system, selected.document.system);
        assert.deepEqual(snapshot, selectedSource);
        assert.deepEqual(trace, [...ordinaryPrefix, ['destination:getName', selectedSource.name], ['ordinary:create']]);
        return;
    }
    if (mode === 'sort') {
        assert.equal(result, sentinels.sort);
        const [{ args, snapshot }] = sort;
        assert.equal(args.length, 2);
        assert.equal(args[0], event);
        assert.notEqual(args[1].flags, selected.document.flags);
        assert.notEqual(args[1].system, selected.document.system);
        assert.deepEqual(snapshot, selectedSource);
        assert.deepEqual(trace, [...ordinaryPrefix, ['sort']]);
        return;
    }

    const childId = childSource._id;
    const [confirmation] = confirmations;
    assert.equal(confirmation.title, 'Copy linked Items');
    assert.equal(confirmation.defaultYes, false);
    assert.equal(typeof confirmation.yes, 'function');
    assert.equal(typeof confirmation.no, 'function');
    assert.ok(confirmation.content.includes(childSource.name));
    assert.ok(confirmation.content.includes(linked.document.uuid));
    const beforeConfirm = trace.slice(0, trace.findIndex(([name]) => name === 'confirm'));
    assert.deepEqual(beforeConfirm.slice(0, 3), [resolve, ['snapshot', originalId], ['source:get', originalId]]);
    assert.ok(beforeConfirm.some(([name, id]) => name === 'source:get' && id === childId));
    const checksOnce = [['permission', originalId], ['scope', originalId], ['permission', childId], ['scope', childId]];
    const sourceChecks = calls => calls.filter(([name]) => name === 'permission' || name === 'scope');
    assert.deepEqual(sourceChecks(beforeConfirm), checksOnce);
    const graphSteps = calls => calls.filter(([name]) =>
        !['snapshot', 'source:get', 'source:values', 'permission', 'scope'].includes(name),
    );
    if (mode === 'decline') {
        assert.deepEqual(result, []);
        assert.deepEqual(sourceChecks(trace), checksOnce);
        assert.deepEqual(graphSteps(trace), [resolve, ['confirm']]);
        assert.deepEqual(trace.at(-1), ['confirm']);
        return;
    }

    assert.equal(result, sentinels.graph);
    assert.equal(new Set([...freshIds, originalId, childId]).size, 4);
    assert.deepEqual(sourceChecks(trace), [...checksOnce, ...checksOnce]);
    assert.deepEqual(graphSteps(trace), [
        resolve, ['confirm'], ['id', freshIds[0]], ['id', freshIds[1]],
        ['clone', originalId], ['merge', originalId], ['clone', childId], ['graph:create'],
    ]);
    const [call] = graph;
    assert.equal(call.options.parent, destination);
    assert.deepEqual(call.options, { parent: destination, pack: null, keepId: true });
    const [expectedParent, expectedChild] = structuredClone([selectedSource, childSource]);
    expectedParent._id = freshIds[0];
    expectedParent.flags.ptu.itemGrants.savedEdge.id = freshIds[1];
    expectedChild._id = freshIds[1];
    expectedChild.flags.ptu.grantedBy.id = freshIds[0];
    assert.deepEqual(call.sources, [expectedParent, expectedChild]);
}

test('trainer Feature-drop receiver delegates actual Item drops to the expected boundaries', async t => {
    const modules = await loadModules(t);
    for (const [name, mode] of modes) {
        await t.test(name, () => verifyCase(modules, mode));
    }
});
