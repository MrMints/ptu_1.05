import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const A = 'Compendium.p05identity.sources.Item.AAAAAAAAAAAAAAAA';
const legacyA = 'Compendium.p05identity.sources.AAAAAAAAAAAAAAAA';
const B = 'Compendium.p05identity.sources.Item.BBBBBBBBBBBBBBBB';
const otherPackA = 'Compendium.p05identity.other.Item.AAAAAAAAAAAAAAAA';

const granterId = 'GRANTER000000001';
const ownedId = 'EXISTING00000001';
const grantId = 'GRANTED000000001';
const flag = 'syntheticIdentityGrant';
const featureName = 'Synthetic matching Feature';
const importLine = /^import\b[^\r\n]*/gm;

const cases = [
    ['modern wins over conflicting legacy; legacy request', { modern: A, legacy: B }, legacyA, false, false],
    ['absent modern uses legacy; typed request', { legacy: legacyA }, A, false, false],
    ['null modern uses legacy; typed request', { modern: null, legacy: legacyA }, A, false, false],
    ['false modern uses legacy; typed request', { modern: false, legacy: legacyA }, A, false, false],
    ['allowduplicate permits a matching source', { modern: A, legacy: B }, legacyA, true, true],
    ['different modern source wins over matching legacy', { modern: B, legacy: A }, A, false, true],
    ['same ID suffix in a different pack', { modern: otherPackA, legacy: A }, A, false, true],
    ['invalid nonempty modern string wins over matching legacy', { modern: 'synthetic invalid source', legacy: A }, A, false, true],
    ['matching labels and duplicate/export provenance alone', { duplicateOnly: true }, A, false, true],
];

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');

async function readPinnedSource(path, bytes, sha256) {
    const source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
        .decode(await readFile(new URL('../' + path, import.meta.url)));
    // Bind the committed source while tolerating only Git's CRLF checkout representation.
    const committed = source.replace(/\r\n/g, '\n');
    assert.equal(Buffer.byteLength(committed), bytes, path);
    assert.equal(createHash('sha256').update(committed).digest('hex'), sha256, path);
    return source;
}

function bindImports(source, bindings) {
    assert.deepEqual(source.match(importLine) ?? [], bindings.map(([line]) => line));
    const rewritten = new Map();
    for (const [line, url] of bindings) {
        const specifier = /(['"])([^'"]+)\1;$/;
        assert.match(line, specifier);
        rewritten.set(line, line.replace(specifier, (_match, quote) => quote + url + quote + ';'));
    }
    const bound = source.replace(importLine, line => rewritten.get(line));
    const original = new Map([...rewritten].map(([from, to]) => [to, from]));
    assert.equal(bound.replace(importLine, line => original.get(line)), source);
    return moduleUrl(bound);
}

async function loadModules() {
    const documentSource = bindImports(await readPinnedSource(
        'src/util/document-source.js', 1386,
        '86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0',
    ), []);
    const scope = moduleUrl(`
        export function isExcludedContent(uuid) {
            if (!${JSON.stringify([A, legacyA])}.includes(uuid)) throw new Error('Unexpected scope check');
            return false;
        }
    `);
    const preservation = bindImports(await readPinnedSource(
        'src/util/preservation.js', 2126,
        'd22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb',
    ), [
        ["import {getDocumentSourceId} from './document-source.js';", documentSource],
        ["import {isExcludedContent} from './content-scope.js';", scope],
    ]);
    const item = moduleUrl(`
        import { getDocumentSourceId } from ${JSON.stringify(documentSource)};

        export class PTUItem {
            constructor(source, { parent, onClone, onWrite = parent?.onWrite } = {}) {
                this.source = structuredClone(source);
                this.parent = parent;
                this.onClone = onClone;
                this.onWrite = onWrite;
            }

            get id() { return this.source._id; }
            get name() { return this.source.name; }
            get type() { return this.source.type; }
            get slug() { return this.source.system.slug; }
            get schemaVersion() { return this.source.system.schema.version; }
            get sourceId() { return getDocumentSourceId(this.source); }

            toObject() { return structuredClone(this.source); }

            clone(overrides) {
                if (!overrides || Reflect.ownKeys(overrides).length) throw new Error('Unexpected clone overrides');
                const copy = new PTUItem(this.source, { onWrite: this.onWrite });
                this.onClone?.(copy);
                return copy;
            }

            get rules() {
                if (this.type !== 'feat' || this.source.system.rules.length !== 0) {
                    throw new Error('Expected a Feature with no nested rules');
                }
                return [];
            }

            prepareRuleElements() { return this.rules; }
            update() { return this.onWrite('Item.update'); }
            delete() { return this.onWrite('Item.delete'); }
        }
    `);
    const migrationList = moduleUrl(`
        export class MigrationList {
            static constructFromVersion(version) {
                if (version !== 0.111) throw new Error('Unexpected fixture schema version');
                return [];
            }
        }
    `);
    const migrationRunner = moduleUrl(`
        export class MigrationRunner {
            static ensureSchemaVersion() { throw new Error('Unexpected migration'); }
        }
    `);
    const base = moduleUrl(`
        export class RuleElementPTU {
            constructor(source, item) {
                Object.assign(this, source);
                this.item = item;
                this.actor = item.parent;
            }
            resolveInjectedProperties(uuid) {
                if (uuid !== this.uuid) throw new Error('Expected the literal rule UUID');
                return uuid;
            }
            test() {
                if (this.predicate.length !== 1 || this.predicate[0] !== 'synthetic:owned') {
                    throw new Error('Expected the affirmative synthetic predicate');
                }
                return true;
            }
            failValidation(reason) { throw new Error(reason); }
        }
    `);
    const starterTraining = moduleUrl(`
        export function isStarterTrainingGrant(item) {
            if (item.id !== ${JSON.stringify(granterId)}) throw new Error('Unexpected granter');
            return false;
        }
        export function hasStarterTraining() { throw new Error('Unexpected starter-training branch'); }
    `);
    const grant = bindImports(await readPinnedSource(
        'src/module/rules/rule-element/grant-item/rule-element.js', 10697,
        '72355e29be5221c4a159cd20d7ef6d22e9e6d9cfebd4d14fd38b6a61acd2b172',
    ), [
        ['import { PTUItem } from "../../../item/index.js";', item],
        ['import { MigrationList } from "../../../migration/index.js";', migrationList],
        ['import { MigrationRunner } from "../../../migration/runner/index.js";', migrationRunner],
        ["import {compendiumItemIdentity} from '../../../../util/preservation.js';", preservation],
        ['import { RuleElementPTU } from "../base.js";', base],
        ["import {isStarterTrainingGrant, hasStarterTraining} from '../../../../util/starter-training.js';", starterTraining],
        ["import {isExcludedContent} from '../../../../util/content-scope.js';", scope],
    ]);

    const { PTUItem } = await import(item);
    const { GrantItemRuleElement } = await import(grant);
    return { PTUItem, GrantItemRuleElement };
}

function feature(id, provenance = {}) {
    const source = {
        _id: id,
        name: featureName,
        type: 'feat',
        img: 'synthetic-feature.webp',
        effects: [],
        _stats: { modifiedTime: 17 },
        flags: {
            core: { preserved: 'synthetic core field' },
            ptu: {
                selectedVersion: { id: 'synthetic-original', label: 'Synthetic original', custom: false },
                rulesSelections: { saved: 'synthetic subchoice' },
            },
            synthetic: { custom: { enabled: false, count: 0, value: null, entries: [] } },
        },
        system: {
            slug: 'synthetic-matching-feature',
            schema: { version: 0.111, previous: null },
            prerequisites: ['Synthetic prerequisite'],
            rules: [],
            free: false,
            disabled: true,
            custom: { enabled: false, count: 0, value: null, entries: [] },
        },
    };
    if (Object.hasOwn(provenance, 'modern')) source._stats.compendiumSource = provenance.modern;
    if (Object.hasOwn(provenance, 'legacy')) source.flags.core.sourceId = provenance.legacy;
    if (provenance.duplicateOnly) Object.assign(source._stats, { duplicateSource: A, exportSource: A });
    return source;
}

function mergeObject(target, changes) {
    for (const [key, value] of Object.entries(changes)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            target[key] ??= {};
            mergeObject(target[key], value);
        } else {
            target[key] = structuredClone(value);
        }
    }
    return target;
}

async function verifyCase({ PTUItem, GrantItemRuleElement }, provenance, uuid, allowduplicate, append) {
    const writes = [];
    const onWrite = method => {
        writes.push(method);
        assert.fail('Unexpected persistence call: ' + method);
    };
    const actor = {
        name: 'Synthetic owner',
        allowedItemTypes: ['feat'],
        onWrite,
        createEmbeddedDocuments: () => onWrite('Actor.createEmbeddedDocuments'),
        updateEmbeddedDocuments: () => onWrite('Actor.updateEmbeddedDocuments'),
        deleteEmbeddedDocuments: () => onWrite('Actor.deleteEmbeddedDocuments'),
    };
    const ownedFixture = feature(ownedId, provenance);
    const ownedBefore = structuredClone(ownedFixture);
    const existing = new PTUItem(ownedFixture, { parent: actor });
    const ownedItems = [existing];
    actor.items = ownedItems;

    const granterFixture = feature(granterId);
    granterFixture.system.rules.push({
        key: 'GrantItem', uuid, flag, allowduplicate, reevaluateOnUpdate: false,
        replaceSelf: false, ignored: false, predicate: ['synthetic:owned'],
    });
    const granterBefore = structuredClone(granterFixture);
    const granter = new PTUItem(granterFixture, { parent: actor });
    const itemSource = granter.toObject();
    const pendingItems = [itemSource];
    const ruleSource = itemSource.system.rules[0];
    const rule = new GrantItemRuleElement(ruleSource, granter);

    const resolverFixture = feature('AAAAAAAAAAAAAAAA', { modern: legacyA, legacy: B });
    const resolverBefore = structuredClone(resolverFixture);
    const clones = [];
    const original = new PTUItem(resolverFixture, { onClone: copy => clones.push(copy), onWrite });
    const sources = new Map([[A, original], [legacyA, original]]);
    const lookups = [];
    const generatedIds = [];
    const warnings = [];
    const errors = [];
    const context = { parent: actor, render: false, custom: { marker: [false, 0, null] } };

    const replacements = [
        [globalThis, 'fromUuid', async requested => {
            lookups.push(requested);
            assert.ok(sources.has(requested), 'Unexpected resolver UUID');
            return sources.get(requested);
        }],
        [globalThis, 'foundry', { utils: {
            deepClone: structuredClone,
            mergeObject,
            randomID: () => {
                assert.equal(generatedIds.length, 0, 'Unexpected additional ID generation');
                generatedIds.push(grantId);
                return grantId;
            },
        } }],
        [globalThis, 'ui', { notifications: {
            warn: message => { warnings.push(message); },
            error: message => { errors.push(message); },
        } }],
        [console, 'error', (...args) => { errors.push(args); }],
    ].map(([object, key, value]) => ({ object, key, value, prior: Object.getOwnPropertyDescriptor(object, key) }));

    try {
        for (const { object, key, value } of replacements) {
            Object.defineProperty(object, key, { value, configurable: true, writable: true });
        }
        assert.equal(await rule.preCreate({ itemSource, pendingItems, context, ruleSource }), undefined);
    } finally {
        for (const { object, key, prior } of replacements.reverse()) {
            if (prior) Object.defineProperty(object, key, prior);
            else assert.equal(Reflect.deleteProperty(object, key), true);
            assert.deepEqual(Object.getOwnPropertyDescriptor(object, key), prior);
        }
    }

    assert.deepEqual(errors, []);
    assert.deepEqual(lookups, [uuid]);
    assert.equal(clones.length, 1, 'Resolution must reach a successful Item clone');
    const [cloned] = clones;
    assert.notEqual(cloned, original);
    assert.notEqual(cloned.source, original.source);
    assert.notEqual(cloned.source.system, original.source.system);
    assert.deepEqual(cloned.toObject(), resolverBefore);
    assert.deepEqual(original.toObject(), resolverBefore);
    assert.deepEqual(resolverFixture, resolverBefore);
    assert.deepEqual(granterFixture, granterBefore);
    assert.deepEqual(granter.toObject(), granterBefore);
    assert.deepEqual(ownedFixture, ownedBefore);
    assert.deepEqual(existing.toObject(), ownedBefore);
    assert.equal(actor.items, ownedItems);
    assert.equal(actor.items.length, 1);
    assert.equal(actor.items[0], existing);
    assert.deepEqual(writes, []);

    const expectedGranter = structuredClone(granterBefore);
    const expectedPending = [expectedGranter];
    const expectedContext = { parent: actor, render: false, custom: { marker: [false, 0, null] } };
    if (append) {
        assert.deepEqual(warnings, []);
        assert.deepEqual(generatedIds, [grantId]);
        assert.ok(![granterId, ownedId, resolverBefore._id].includes(grantId));
        const expectedGrant = structuredClone(resolverBefore);
        expectedGrant._id = grantId;
        expectedGrant._stats.compendiumSource = A;
        expectedGrant.flags.core.sourceId = uuid;
        expectedGrant.flags.ptu.grantedBy = { id: granterId, onDelete: 'cascade' };
        expectedGrant.system.free = true;
        expectedGranter.flags.ptu.itemGrants = { [flag]: { id: grantId, onDelete: 'detach' } };
        expectedPending.push(expectedGrant);
        expectedContext.keepId = true;
        assert.notEqual(pendingItems[1], cloned.source);
        assert.notEqual(pendingItems[1]?.system, cloned.source.system);
    } else {
        assert.deepEqual(warnings, ['Item ' + featureName + ' is already granted to ' + actor.name + '.']);
        assert.deepEqual(generatedIds, []);
    }
    assert.equal(pendingItems[0], itemSource);
    assert.equal(context.parent, actor);
    assert.deepEqual(pendingItems, expectedPending);
    assert.deepEqual(context, expectedContext);
}

test('GrantItem compares real source identities before appending a pending Feature', async t => {
    const modules = await loadModules();
    for (const [name, provenance, uuid, allowduplicate, append] of cases) {
        await t.test(name, () => verifyCase(modules, provenance, uuid, allowduplicate, append));
    }
});
