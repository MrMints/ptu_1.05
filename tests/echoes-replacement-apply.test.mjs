import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {closeSync, fstatSync, lstatSync, openSync, readSync, realpathSync} from 'node:fs';
import {dirname, isAbsolute, join, parse, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const workspace = resolve(fileURLToPath(root));
const limit = 200 * 1024 * 1024;
const digest = (algorithm, value) => createHash(algorithm).update(value).digest('hex');
const copy = structuredClone;
const same = (actual, expected) => {
    try { assert.deepEqual(actual, expected); return true; } catch { return false; }
};
const utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true});
const runtime = [
    ['package.json', 589, 'df135a39f198db5bf1bc9136b608c0cc2c592241'],
    ['src/util/echoes-replacement-plan.js', 43779, '33d583b0446f457da7f69a3fa75078f4a5a96cd2'],
    ['src/util/rule-version-registry.js', 6196, 'd5753450386cc200d01d1cd161a0122d07d6ea5b'],
    ['src/util/rule-version-preview.js', 13099, '9118635571b4836f7ce8ee4a775b759a92f9b679'],
    ['tools/rule-version-echoes-admission.mjs', 17440, '9f3f301993827c75c6162bd9067a1cd557dac30d'],
    ['src/util/rule-versions.js', 11058, '700a37b025c670ab602e4fc1ff0fdaf0bdd02f03'],
    ['src/util/prerequisites.js', 10611, '032297697ea56d82061ef036ede812df497fa7b9'],
    ['tools/rule-version-echoes-draft.mjs', 13340, '02d2633953d4ecbd04b6da67bf36a314329afa70'],
    ['src/util/document-source.js', 1386, 'ebb47fa13c5c1d9c03084136cf3fee053ae3ec21'],
    ['src/util/skills.js', 2693, '7319614d73e6615fba673b147bdddc344743703a'],
    ['tools/rule-version-pilot.mjs', 16805, '4d4482d66d19a207b675460deed456b36ed4694d'],
];
const fixedData = [
    ['css/images/icons/feat_icon.png', 8735, 'af9fadae4567487008c9868e6237d7f669318012'],
    ['docs/data/ability-source-evidence.json', 2228887, '04f5636f0eb444e2b5a9da0f73b0cdc6af058800'],
    ['docs/data/feature-source-evidence.json', 9481207, '5d29ce7d8d9af3955d92b2beb6749022b447bfd9'],
    ['docs/data/move-source-evidence.json', 5481968, 'aabee9a4e15432475d5f035439d5d76605ea7be3'],
    ['docs/data/record-source-review/abilities-core.json', 10506397, 'f6d7459fe86db6eafce277fd761cdc621b4509bc'],
    ['docs/data/record-source-review/features-core.json', 45124665, 'ca14fa64d30eff6f0e50e64e595353f49f0414c1'],
    ['docs/data/record-source-review/moves-anchored.json', 46820679, '1950046178a02bbed1afb763a18cde9c70c7f662'],
    ['docs/data/record-source-review/pokemon-edges.json', 1825614, '2d89078aad2e6670920d7179880f73b05fc8610d'],
    ['docs/data/rule-version-echoes-admission.json', 43979, 'b64493d20566cb05f3d50379f16f978d5ef193da'],
    ['docs/data/rule-version-echoes-draft.json', 28694, '27fc9d6d5d0eb656822d46232aab0a7288b1cc54'],
    ['docs/data/rule-version-pilot.json', 70517, 'ee30dedc56191e17b4b7bdff5250aedfeaf690c3'],
    ['docs/data/rules-revisions.json', 886057, '6ef31f696a4d23e39bf2b564bdc0ea776101cba0'],
    ['docs/data/source-authority.json', 22614, '51f8310d375c5bf2e2609d379eb7c7a975c179fd'],
    ['docs/validation/p05-echoes-readiness.md', 30460, '2697f322620ba701ecab6d53dd160834fed42413'],
    ['system.json', 4746, 'ce24de1cadba076fbfcff130f961c93d191826df'],
    ['template.json', 18633, 'f753ba3d552b3043d9fc43d073cb58440bbaad87'],
];
const records = {
    'moves.Y5R5mbVcGq6fwoFj': 'packs/moves/_source/Y5R5mbVcGq6fwoFj.json',
    'abilities.oNB76oqVYrjhYd7W': 'packs/abilities/_source/oNB76oqVYrjhYd7W.json',
    'feats.aJ47Z5z6Az9c8Dy8': 'packs/feats/_source/aJ47Z5z6Az9c8Dy8.json',
    'poke-edges.WkzCUjTOCTI60Uwg': 'packs/poke-edges/_source/WkzCUjTOCTI60Uwg.json',
    'abilities.nuGa21WQ0QD07kQj': 'packs/abilities/_source/nuGa21WQ0QD07kQj.json'
};
const evidence = [
    'system.json', 'docs/data/source-authority.json', 'template.json',
    'docs/data/ability-source-evidence.json', 'docs/data/move-source-evidence.json', 'docs/data/feature-source-evidence.json',
    'docs/data/record-source-review/abilities-core.json', 'docs/data/record-source-review/moves-anchored.json',
    'docs/data/record-source-review/features-core.json', 'docs/data/record-source-review/pokemon-edges.json'
];
const notePath = 'docs/validation/p05-echoes-readiness.md';
const iconPath = 'css/images/icons/feat_icon.png';
const admissionPath = 'docs/data/rule-version-echoes-admission.json';
const draftPath = 'docs/data/rule-version-echoes-draft.json';
const pilotPath = 'docs/data/rule-version-pilot.json';
const revisionsPath = 'docs/data/rules-revisions.json';

function git(args, input) {
    return execFileSync('git', args, {cwd: fileURLToPath(root), input, encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024, timeout: 15000, windowsHide: true});
}

function trackedInventory() {
    const rows = git(['ls-tree', '-r', '-l', '-z', 'HEAD', '--', 'packs']).split('\0');
    const inventory = [];
    for (const row of rows) {
        const tab = row.indexOf('\t');
        const path = row.slice(tab + 1);
        if (!/^packs\/[^/]+\/_source\/[^/]+\.json$/.test(path)) continue;
        assert.match(path, /^packs\/[\w.-]+\/_source\/[\w.-]+\.json$/);
        const match = /^100644 blob ([a-f0-9]{40}) +([0-9]+)$/.exec(row.slice(0, tab));
        assert.ok(match, 'tracked pack source must be a regular committed blob');
        inventory.push([path, Number(match[2]), match[1]]);
    }
    inventory.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    assert.equal(inventory.length, 7395);
    assert.equal(new Set(inventory.map(([path]) => path)).size, 7395);
    assert.equal(inventory.reduce((sum, [, bytes]) => sum + bytes, 0), 36553797);
    assert.equal(digest('sha256', inventory.map(([path, bytes, blob]) => blob + ' ' + bytes + ' ' + path + '\n').join('')),
        'd607bbf143f3a83e83abaf8040d2b9c7e6d65b38805b785d1f606dc928270baf');
    assert.ok(Object.values(records).every(path => inventory.some(([candidate]) => candidate === path)));
    return inventory;
}

function gitBlob(bytes) {
    return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

function withinWorkspace(rootPath, filePath) {
    const subpath = relative(rootPath, filePath);
    return subpath !== '' && subpath !== '..' && !subpath.startsWith('..' + sep) && !isAbsolute(subpath);
}

function assertUnlinkedDirectories(directory) {
    const drive = parse(directory).root;
    const parts = relative(drive, directory).split(sep).filter(Boolean);
    let current = drive;
    for (const part of ['', ...parts]) {
        current = join(current, part);
        const entry = lstatSync(current);
        assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'fixture ancestor must be an unlinked directory');
    }
}

function fixtureEntry(path) {
    assert.ok(path.split('/').every(part => /^[\w.-]+$/.test(part) && part !== '.' && part !== '..'),
        'fixture path must use literal workspace segments');
    const file = resolve(workspace, path);
    assert.ok(withinWorkspace(workspace, file), 'fixture path must be inside the workspace');
    assertUnlinkedDirectories(dirname(file));
    const entry = lstatSync(file);
    assert.ok(entry.isFile() && !entry.isSymbolicLink(), 'fixture input must be a regular file');
    const canonicalWorkspace = realpathSync.native(workspace);
    const canonicalFile = realpathSync.native(file);
    assert.equal(relative(workspace, canonicalWorkspace), '', 'workspace path must be canonical');
    assert.ok(withinWorkspace(canonicalWorkspace, canonicalFile), 'canonical fixture path escaped the workspace');
    assert.equal(relative(file, canonicalFile), '', 'fixture path must be canonical');
    return {file, entry};
}

function readBounded(path, budget) {
    const {file, entry} = fixtureEntry(path);
    const fd = openSync(file, 'r');
    try {
        const stat = fstatSync(fd);
        assert.ok(stat.isFile() && stat.size === entry.size && stat.dev === entry.dev && stat.ino === entry.ino,
            'fixture input changed before open');
        const current = fixtureEntry(path).entry;
        assert.ok(current.size === stat.size && current.dev === stat.dev && current.ino === stat.ino,
            'fixture input changed after open');
        assert.ok(stat.size <= limit - budget.bytes, 'fixture pass exceeds 200 MiB');
        const bytes = Buffer.alloc(stat.size);
        let offset = 0;
        while (offset < bytes.length) {
            const count = readSync(fd, bytes, offset, bytes.length - offset, null);
            budget.bytes += count;
            assert.ok(count > 0, 'fixture input truncated');
            offset += count;
        }
        assert.equal(fstatSync(fd).size, stat.size, 'fixture input changed size');
        return bytes;
    } finally {
        closeSync(fd);
    }
}

function verifyIntegrity(inputs) {
    const attributes = git(['check-attr', '-z', '--stdin', 'text', 'eol', 'working-tree-encoding', 'filter'],
        inputs.map(([path]) => path + '\0').join('')).split('\0');
    assert.equal(attributes.pop(), '');
    assert.equal(attributes.length, inputs.length * 12);
    for (const [index, [path]] of inputs.entries()) {
        const expected = path.startsWith('packs/') ? ['set', 'lf', 'unspecified', 'unspecified']
            : ['unspecified', 'unspecified', 'unspecified', 'unspecified'];
        assert.deepEqual(attributes.slice(index * 12, index * 12 + 12),
            ['text', 'eol', 'working-tree-encoding', 'filter'].flatMap((key, slot) => [path, key, expected[slot]]));
    }

    const budget = {bytes: 0};
    const hashes = new Map();
    let autocrlf;
    for (const [path, size, blob] of inputs) {
        const bytes = readBounded(path, budget);
        if (bytes.length !== size || gitBlob(bytes) !== blob) {
            assert.ok(!path.endsWith('.png') && !runtime.some(([modulePath]) => modulePath === path),
                'unexpected binary or runtime-module representation');
            const text = utf8.decode(bytes);
            assert.ok(!text.startsWith('\uFEFF') && !/\r(?!\n)/.test(text));
            const normalized = Buffer.from(text.replace(/\r\n/g, '\n'));
            assert.ok(normalized.length === size && gitBlob(normalized) === blob, 'fixture binding mismatch');
            if (!path.startsWith('packs/')) {
                autocrlf ??= git(['config', '--get', 'core.autocrlf']).trim();
                assert.equal(autocrlf, 'true');
            }
        }
        hashes.set(path, digest('sha256', bytes));
    }
    return {hashes, bytes: budget.bytes};
}

function identityRow(path, source) {
    const selected = source.flags?.ptu?.selectedVersion;
    return {path, id: source._id, filenameId: path.slice(path.lastIndexOf('/') + 1, -5),
        selectedVersionId: selected == null ? null : typeof selected === 'string' ? selected : selected.id,
        sourceId: source._stats?.compendiumSource ?? source.flags?.core?.sourceId ?? null};
}

function assemble(inventory, hashes) {
    const keep = new Set([...Object.values(records), ...evidence, notePath, iconPath,
        admissionPath, draftPath, pilotPath, revisionsPath]);
    const cache = new Map();
    const budget = {bytes: 0};
    const documents = [];
    for (const [path] of [...fixedData, ...inventory]) {
        const bytes = readBounded(path, budget);
        assert.equal(digest('sha256', bytes), hashes.get(path), 'fixture changed after integrity pass');
        if (path === iconPath) {
            cache.set(path, hashes.get(path));
            continue;
        }
        const raw = utf8.decode(bytes);
        if (path.startsWith('packs/')) documents.push(identityRow(path, JSON.parse(raw)));
        if (path === notePath) {
            const notes = [...raw.matchAll(/^> (Researcher[^\r\n]+)$/gm)];
            assert.equal(notes.length, 1, 'Researcher context binding');
            cache.set(path, notes[0][1]);
        } else if (keep.has(path)) cache.set(path, raw);
    }
    const upstream = {
        pilot: JSON.parse(cache.get(pilotPath)), revisions: cache.get(revisionsPath),
        sourceEvidence: Object.fromEntries(evidence.map(path => [path, cache.get(path)])),
        currentRecords: Object.fromEntries(Object.entries(records).map(([key, path]) => [key, cache.get(path)])),
        contextNote: cache.get(notePath), iconSha256: cache.get(iconPath)
    };
    return {admission: cache.get(admissionPath), draft: cache.get(draftPath), upstream,
        inventory: {schemaVersion: 1, documents, mappings: []}, bytes: budget.bytes};
}

const itemPins = [
    '1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289',
    '98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54'
];
const expectedMappings = [
    ['ViZpn17qLA4ACQGa', 'celnYjQjM3jjtAnZ', 'PTU 1.05 supplied core', 'original', 'r04-s12',
        'PTU 1.05 supplied core', 'core', null, 'Core System/Pokemon Tabletop United 1.05 Core.pdf', 140,
        'core:140:feature-line35', 'f126c984f96400ae0c953d2d112e4f5999e25eb23f3af851297f00870be82d80'],
    ['e9dQ3NmVm7EuQBO5', 'i1OAz3lvuCRIm3n9', 'May 2015 playtest (optional)', 'revised', 'r04-s02',
        'May 2015 playtest', 'optional-playtest', '2015-05', 'Core System/1.05 Errata/PTU May 2015 Playtest Packet.pdf', 7,
        'may:7:feature-line27', 'c5a578cd887346c246030350b3ee93e2bab83c5c94dc824e813c15e62c566e89']
];

let approved;
let inspect;
let apply;
let acquisition;
before(async () => {
    const inventory = trackedInventory();
    const integrity = verifyIntegrity([...runtime, ...fixedData, ...inventory]);
    const fixture = assemble(inventory, integrity.hashes);
    acquisition = 'Tracked collision identities: 7395. Integrity bytes: ' + integrity.bytes
        + '. Assembly bytes: ' + fixture.bytes + '.';
    const {compileEchoesAdmission} = await import('../tools/rule-version-echoes-admission.mjs');
    const compiled = compileEchoesAdmission(fixture.admission, fixture.draft, JSON.stringify(fixture.upstream),
        JSON.stringify(fixture.inventory));
    assert.equal(compiled.status, 'prepared-not-installed');
    const {items, mappings} = compiled.bundle;
    assert.equal(items.length, 2);
    assert.equal(mappings.length, 2);
    for (const [index, entry] of expectedMappings.entries()) {
        const [itemId, versionId, label, kind, authority, edition, status, date, path, page, definition, sourceHash] = entry;
        assert.equal(items[index].item._id, itemId);
        assert.equal(digest('sha256', JSON.stringify(items[index].item)), itemPins[index]);
        assert.equal(items[index].contentHash, itemPins[index]);
        assert.deepEqual(mappings[index], {
            schemaVersion: 1, documentUuid: 'Compendium.ptu.feats.Item.' + itemId,
            type: 'feat', generationEligibility: 'eligible', version: {id: versionId, label, kind},
            canonical: {id: 'UKk9BnAZtm1xMoRB', evidence: 'Owner-approved complete core140/May7 Echoes pair; '
                + definition + '; ' + sourceHash + '; separate Researcher parent context.'},
            source: {id: authority, edition, status, publicationDate: date, citation: path + ', printed/PDF p.' + page}
        });
    }
    approved = Object.fromEntries(['core', 'may'].map((role, index) => [role, {
        itemJson: JSON.stringify(items[index].item), mapping: copy(mappings[index])
    }]));
    ({planEchoesReplacement: inspect} = await import('../src/util/echoes-replacement-plan.js'));
    ({applyEchoesReplacement: apply} = await import('../src/util/echoes-replacement-apply.js'));
});

const actorId = '0000000000000400';
const actorUuid = 'Actor.' + actorId;
const itemId = '0000000000000501';
const otherId = '0000000000000502';
const itemUuid = actorUuid + '.Item.' + itemId;
const canary = 'private-echoes-fixture-canary';
const present = value => ({state: 'present', valueJson: JSON.stringify(value)});
const absent = () => ({state: 'absent'});
const exclusions = {
    callbacksExcluded: true, combatExcluded: true, recalculationExcluded: true,
    retargetingUnnecessary: true, selectedItemOnly: true
};
const reviewChoices = {
    leaf: 'replace-reviewed', automation: 'preserve-reviewed', grants: 'preserve-reviewed',
    otherInstances: 'preserve-all', presentation: 'preserve', legacy: 'preserve-raw', usage: 'preserve-raw'
};
const schemaHistory = {schemaVersion: 1, canonicalId: 'UKk9BnAZtm1xMoRB', entries: []};
const otherRole = role => role === 'core' ? 'may' : 'core';

function owned(role, id) {
    const source = JSON.parse(approved[role].itemJson);
    source._id = id;
    delete source._key;
    source._stats = {compendiumSource: approved[role].mapping.documentUuid, createdTime: 123,
        modifiedTime: 456, coreVersion: 'synthetic', systemId: 'ptu', systemVersion: '0',
        lastModifiedBy: canary, duplicateSource: null, exportSource: {uuid: canary}};
    return source;
}

function makeStore(role = 'core', enrich = true) {
    const source = owned(role, itemId);
    if (enrich) {
        source.name = canary + '-name';
        source.img = canary + '-image';
        source.system.notes = canary + '-notes';
        source.system.class = canary + '-class';
        source.system.source.extra = {flag: false, note: canary};
        source.system.usage = {remaining: 0, maximum: 2};
        source.system.subchoices = ['keep'];
        source.system.grants = {[otherId]: {id: otherId, action: 'delete'}};
        source.system.custom = {empty: [], disabled: false, none: null};
        source.system.schema = {version: 0.111, custom: true};
        source.effects = [{changes: [], label: canary}];
        source.flags.user = {secret: canary};
        source.flags.core = {sourceId: {opaque: canary}};
        source.flags.ptu.selectedVersion.custom = {tag: canary};
        source.flags.ptu.ruleVersionHistory = copy(schemaHistory);
    }
    const companion = owned('core', otherId);
    if (enrich) companion.system.grantedBy = {id: itemId, action: 'detach'};
    const actor = {id: actorId, uuid: actorUuid, type: 'character', pack: present(null), tokenAncestor: absent()};
    const membership = {coverage: 'all-items', entries: [source, companion].map(item =>
        ({id: item._id, uuid: actorUuid + '.Item.' + item._id, type: item.type}))};
    return {actor, membership, sources: new Map([[itemId, source], [otherId, companion]]),
        mechanics: {skills: {generalEd: {value: {total: 2}}}, custom: {saved: canary}},
        choices: {}, references: {}, targets: copy(approved),
        userAuthorized: true, parentAuthorized: true, itemAuthorized: true,
        confirmation: true, selectionCreation: true, supported: true,
        excluded: copy(exclusions), unresolved: false, writes: 0};
}

function scope(store) {
    const items = store.membership.entries.map(entry => ({
        ...entry, coverage: 'complete-source', source: present(store.sources.get(entry.id))
    }));
    const ledger = store.sources.get(itemId).flags?.ptu?.ruleVersionHistory;
    return {actor: copy(store.actor), membership: copy(store.membership), items,
        history: ledger === undefined ? absent() : present(ledger)};
}

function captureState(store) {
    const {actor, membership, items, history} = scope(store);
    return {before: {actor, membership, items, lifecycle: {state: 'reported-unattempted', relatedIntent: null}},
        context: {prerequisiteActor: present({_id: actor.id, uuid: actor.uuid, type: actor.type,
            system: copy(store.mechanics), items: items.map(row => ({...JSON.parse(row.source.valueJson), uuid: row.uuid}))}),
            mechanicChoices: present(store.choices), references: present(store.references)}, history};
}

function request(store, targetRole = 'may', action = 'request-plan') {
    const input = {schemaVersion: 1, kind: 'ptu-echoes-replacement-request',
        selection: {actorId, actorUuid, itemId, itemUuid, targetRole},
        ...captureState(store), approved: copy(approved),
        review: {action: 'inspect', expectedSeal: null, resumeIntent: null, choices: copy(reviewChoices), acknowledgements: []}};
    if (action === 'request-plan') {
        const inspected = inspect(JSON.stringify(input));
        assert.ok(inspected.bindings, 'fixture inspection must return bindings');
        input.review.expectedSeal = inspected.bindings.inspectionSeal;
        input.review.acknowledgements = inspected.bindings.requiredAcknowledgements.map(code =>
            ({code, reviewSeal: inspected.bindings.inspectionSeal}));
    }
    input.review.action = action;
    return JSON.stringify(input);
}

function expectedReplacement(original, role) {
    const expected = copy(original);
    const definition = JSON.parse(approved[role].itemJson);
    for (const key of ['effect', 'prerequisites', 'frequency']) {
        delete expected.system[key];
        if (Object.hasOwn(definition.system, key)) expected.system[key] = definition.system[key];
    }
    delete expected.system.source.value;
    if (Object.hasOwn(definition.system.source, 'value')) expected.system.source.value = definition.system.source.value;
    expected._stats ??= {};
    expected._stats.compendiumSource = approved[role].mapping.documentUuid;
    expected.flags ??= {};
    expected.flags.ptu ??= {};
    const {id, label} = approved[role].mapping.version;
    const old = expected.flags.ptu.selectedVersion;
    expected.flags.ptu.selectedVersion = typeof old === 'string' ? id : {...old, id, label};
    return expected;
}

function canWrite(store) {
    return store.userAuthorized && store.parentAuthorized && store.itemAuthorized
        && store.confirmation && store.supported && !store.unresolved;
}

function currentBinding(store, role) {
    return JSON.stringify({revision: store.writes, snapshot: captureState(store), target: store.targets[role] ?? null,
        authorized: canWrite(store), exclusions: store.excluded, selectionCreation: store.selectionCreation});
}

let portSequence = 0;
function adapter(store, faults = {}) {
    const prefix = canary + '-port-' + ++portSequence + '-';
    const revisions = new Map(), admissions = new Map(), receipts = new Map();
    const calls = {capture: 0, authorize: 0, conditionalSave: 0, readBack: 0};
    let sequence = 0;
    const issue = kind => prefix + kind + '-' + ++sequence;

    function criticalSave({selection, operationId, revisionToken, admissionToken, nextSourceJson}) {
        const admission = admissions.get(admissionToken);
        if (!admission || admission.used || admission.operationId !== operationId || admission.revisionToken !== revisionToken
            || !same(admission.selection, selection) || admission.nextSourceJson !== nextSourceJson) {
            return {status: 'refused', writes: 0};
        }
        admission.used = true;
        const revision = revisions.get(revisionToken);
        if (!revision || revision.binding !== currentBinding(store, selection.targetRole)
            || !canWrite(store) || !same(store.excluded, exclusions)) {
            return {status: 'stale', writes: 0};
        }

        // No await between the last check and the one target-only replacement.
        if (faults.save === 'throw-before') { store.unresolved = true; throw new Error(canary); }
        const item = JSON.parse(nextSourceJson);
        assert.equal(item._id, selection.itemId);
        store.sources.set(selection.itemId, item);
        store.writes++;
        if (faults.save === 'throw-after') { store.unresolved = true; throw new Error(canary); }
        if (faults.save === 'invalid') { store.unresolved = true; return {status: 'committed', writes: 2, receiptToken: canary}; }
        const receiptToken = issue('receipt');
        receipts.set(receiptToken, copy(selection));
        return {status: 'committed', writes: 1, receiptToken};
    }

    const port = {
        capture({selection}) {
            calls.capture++;
            if (faults.capture === 'throw') throw new Error(canary);
            if (faults.capture === 'unavailable') return {status: 'unavailable'};
            if (store.unresolved) return {status: 'reconciliation-required'};
            const operationId = faults.operationId ?? issue('operation');
            const revisionToken = issue('revision');
            const snapshotJson = JSON.stringify(captureState(store));
            revisions.set(revisionToken, {selection: copy(selection), operationId,
                binding: currentBinding(store, selection.targetRole), snapshotJson});
            return {status: 'ready', operationId, revisionToken, snapshotJson, operationState: 'clear'};
        },
        authorize({selection, operationId, revisionToken, reviewedRequestJson, nextSourceJson, target}) {
            calls.authorize++;
            faults.beforeAuthorize?.(store);
            if (faults.authorize === 'throw') throw new Error(canary);
            if (!store.confirmation) return {status: 'cancelled'};
            if (!canWrite(store)) return {status: 'denied'};
            const revision = revisions.get(revisionToken);
            if (!revision || revision.operationId !== operationId || !same(revision.selection, selection)
                || revision.binding !== currentBinding(store, selection.targetRole)) return {status: 'review-required'};

            const definition = store.targets[selection.targetRole];
            if (!definition) return {status: 'review-required'};
            const source = store.sources.get(selection.itemId);
            if (!source || selection.actorUuid !== store.actor.uuid
                || !store.membership.entries.some(row => row.uuid === selection.itemUuid && row.id === selection.itemId)) {
                return {status: 'denied'};
            }
            const reviewed = JSON.parse(reviewedRequestJson);
            const {before, context, history} = reviewed;
            const expectedTarget = {...definition, role: selection.targetRole,
                createsSelection: source.flags?.ptu?.selectedVersion == null};
            if (!same(reviewed.selection, selection) || !same({before, context, history}, JSON.parse(revision.snapshotJson))
                || !same(target, expectedTarget) || !same(JSON.parse(nextSourceJson), expectedReplacement(source, selection.targetRole))) {
                return {status: 'review-required'};
            }
            const admissionToken = issue('admission');
            admissions.set(admissionToken, {selection: copy(selection), operationId, revisionToken, nextSourceJson, used: false});
            return {status: 'admitted', admissionToken, exclusions: copy(store.excluded),
                selectionCreationConfirmed: store.selectionCreation};
        },
        conditionalSave(args) {
            calls.conditionalSave++;
            faults.atBoundary?.(store, args);
            if (faults.gate) return faults.gate.then(() => criticalSave(args));
            return criticalSave(args);
        },
        readBack({selection, receiptToken}) {
            calls.readBack++;
            assert.deepEqual(receipts.get(receiptToken), selection);
            if (faults.readBack) store.unresolved = true;
            if (faults.readBack === 'throw') throw new Error(canary);
            if (faults.readBack === 'unavailable') return {status: 'unavailable'};
            const current = scope(store);
            if (faults.readBack === 'selected') {
                const changed = JSON.parse(current.items[0].source.valueJson);
                changed._stats.modifiedTime++;
                current.items[0].source = present(changed);
            }
            if (faults.readBack === 'other') {
                const changed = JSON.parse(current.items[1].source.valueJson);
                changed.name = canary;
                current.items[1].source = present(changed);
            }
            if (faults.readBack === 'history') current.history = absent();
            if (faults.readBack === 'actor') current.actor.type = 'pokemon';
            if (faults.readBack === 'membership') current.membership.entries.pop();
            if (faults.readBack === 'lossy-json') {
                current.items[0].source.valueJson = current.items[0].source.valueJson.replace(
                    '"modifiedTime":456', '"modifiedTime":789,"modifiedTime":456'
                );
            }
            return {status: 'ready', snapshotJson: JSON.stringify(current)};
        }
    };
    return {port, calls};
}

function accounted(result, status, writeAttempts = 0, confirmedWrites = 0, verifiedApplications = 0) {
    assert.deepEqual({status: result.status, writeAttempts: result.writeAttempts,
        confirmedWrites: result.confirmedWrites, verifiedApplications: result.verifiedApplications},
    {status, writeAttempts, confirmedWrites, verifiedApplications});
    assert.equal(typeof result.reason, 'string');
    const publicJson = JSON.stringify(result);
    for (const key of [canary, 'revisionToken', 'admissionToken', 'receiptToken', 'snapshotJson', 'nextSourceJson', 'operationId']) {
        assert.ok(!publicJson.includes(key), 'private execution evidence leaked');
    }
}

function beforeWriteState(store) {
    return {snapshot: captureState(store), mechanics: copy(store.mechanics), sources: copy(store.sources)};
}

test('one stable port applies core to May and May to core with full protected state', async context => {
    context.diagnostic(acquisition);
    const store = makeStore();
    const {port, calls} = adapter(store);
    const initial = beforeWriteState(store);
    for (const role of ['may', 'core']) {
        const old = copy(store.sources.get(itemId));
        const raw = request(store, role);
        const plan = inspect(raw);
        assert.equal(plan.status, 'conditional-plan');
        assert.equal(plan.inspectionOnly, true);
        assert.equal(plan.prerequisites.report.advisory, true);
        if (role === 'may') {
            assert.ok(plan.prerequisites.report.unmet.length);
            assert.ok(plan.prerequisites.report.unverifiable.length);
        }
        accounted(await apply(raw, port), 'applied', 1, 1, 1);
        assert.deepEqual(store.sources.get(itemId), expectedReplacement(old, role));
        assert.deepEqual(store.sources.get(otherId), initial.sources.get(otherId));
        assert.deepEqual(store.mechanics, initial.mechanics);
        assert.deepEqual(scope(store).membership, initial.snapshot.before.membership);
        assert.deepEqual(scope(store).actor, initial.snapshot.before.actor);
        assert.deepEqual(scope(store).history, initial.snapshot.history);
    }
    assert.equal(store.writes, 2);
    assert.deepEqual(calls, {capture: 2, authorize: 2, conditionalSave: 2, readBack: 2});
});

for (const representation of ['string', 'null', 'absent', 'missing-containers']) {
    test('selection representation: ' + representation, async () => {
        const store = makeStore('core', false);
        const item = store.sources.get(itemId);
        if (representation === 'string') item.flags.ptu.selectedVersion = approved.core.mapping.version.id;
        if (representation === 'null') item.flags.ptu.selectedVersion = null;
        if (representation === 'absent') delete item.flags.ptu.selectedVersion;
        if (representation === 'missing-containers') { delete item.flags; }
        const raw = request(store);
        if (representation !== 'string') {
            const {port, calls} = adapter(store);
            store.selectionCreation = false;
            accounted(await apply(raw, port), 'review-required');
            assert.equal(calls.conditionalSave, 0);
            assert.equal(store.writes, 0);
            store.selectionCreation = true;
            const missingAck = JSON.parse(raw);
            missingAck.review.acknowledgements = missingAck.review.acknowledgements.filter(ack => ack.code !== 'selection-created');
            accounted(await apply(JSON.stringify(missingAck), port), 'review-required');
        }
        const expected = expectedReplacement(item, 'may');
        accounted(await apply(raw, adapter(store).port), 'applied', 1, 1, 1);
        assert.deepEqual(store.sources.get(itemId), expected);
    });
}

test('legacy-only attribution can create missing active provenance without rewriting legacy', async () => {
    const store = makeStore('core', false);
    const item = store.sources.get(itemId);
    item.flags.core = {sourceId: approved.core.mapping.documentUuid};
    delete item._stats;
    const expected = expectedReplacement(item, 'may');
    accounted(await apply(request(store), adapter(store).port), 'applied', 1, 1, 1);
    assert.deepEqual(store.sources.get(itemId), expected);
});

const beforeSaveCases = [
    ['authority denied', store => { store.itemAuthorized = false; }, 'refused'],
    ['declined confirmation', store => { store.confirmation = false; }, 'cancelled'],
    ['unavailable target', store => { delete store.targets.may; }, 'review-required'],
    ['changed definition', store => { store.targets.may.itemJson = '{}'; }, 'review-required'],
    ['unknown callback exclusion', store => { delete store.excluded.callbacksExcluded; }, 'refused'],
    ...Object.keys(exclusions).map(key => ['unsupported ' + key, store => { store.excluded[key] = false; }, 'refused'])
];
for (const [name, setup, status] of beforeSaveCases) {
    test('independent admission: ' + name, async () => {
        const store = makeStore();
        const raw = request(store);
        setup(store);
        const saved = copy(store.sources);
        const {port, calls} = adapter(store);
        accounted(await apply(raw, port), status);
        assert.deepEqual(store.sources, saved);
        assert.equal(calls.conditionalSave, 0);
        assert.equal(store.writes, 0);
    });
}

test('fresh cancellation and no-change capture, stale capture, and planner refusal', async () => {
    const store = makeStore('core', false);
    const {port, calls} = adapter(store);
    const raw = request(store, 'core');
    accounted(await apply(raw, port), 'no-change');
    const cancelled = request(store, 'may', 'cancel');
    accounted(await apply(cancelled, port), 'cancelled');
    assert.equal(calls.capture, 2);
    assert.equal(calls.authorize, 0);
    store.sources.get(itemId).system.notes = canary;
    accounted(await apply(raw, port), 'stale');
    accounted(await apply(cancelled, port), 'stale');
    accounted(await apply(request(store, 'may', 'inspect'), port), 'review-required');
    const malformed = JSON.parse(request(store));
    malformed.approved.may.mapping.version.label = canary;
    accounted(await apply(JSON.stringify(malformed), port), 'refused');
    assert.equal(calls.authorize, 0);
    assert.equal(store.writes, 0);
});

test('pre-save host exceptions are sanitized zero-write refusals', async () => {
    for (const faults of [{capture: 'throw'}, {capture: 'unavailable'}, {authorize: 'throw'}]) {
        const store = makeStore();
        const {port, calls} = adapter(store, faults);
        accounted(await apply(request(store), port), 'refused');
        assert.equal(calls.conditionalSave, 0);
        assert.equal(store.writes, 0);
    }
});

test('a target revision changed before authorization requires fresh review', async () => {
    const store = makeStore();
    const {port, calls} = adapter(store, {beforeAuthorize: current => { current.targets.may.itemJson = '{}'; }});
    accounted(await apply(request(store), port), 'review-required');
    assert.equal(calls.conditionalSave, 0);
    assert.equal(store.writes, 0);
});

const boundaryCases = [
    ['selected source', store => { store.sources.get(itemId).system.notes = 'external edit'; }],
    ['other source', store => { store.sources.get(otherId).system.notes = 'external edit'; }],
    ['membership', store => { store.membership.entries.reverse(); }],
    ['target', store => { store.targets.may.mapping.version.label = 'external edit'; }],
    ['user authority', store => { store.userAuthorized = false; }],
    ['parent authority', store => { store.parentAuthorized = false; }],
    ['Item authority', store => { store.itemAuthorized = false; }],
    ['confirmation', store => { store.confirmation = false; }],
    ['context', store => { store.excluded.recalculationExcluded = false; }],
    ['mechanic choices', store => { store.choices.mode = 'external edit'; }],
    ['operation state', store => { store.unresolved = true; }]
];
for (const [name, change] of boundaryCases) {
    test('conditional boundary: ' + name, async () => {
        const store = makeStore();
        const {port, calls} = adapter(store, {atBoundary: change});
        accounted(await apply(request(store), port), 'stale', 1);
        assert.equal(calls.conditionalSave, 1);
        assert.equal(calls.readBack, 0);
        assert.equal(store.writes, 0);
        assert.equal(store.sources.get(itemId)._stats.compendiumSource, approved.core.mapping.documentUuid);
    });
}

test('conditional port rejects a substituted payload with guaranteed zero writes', async () => {
    const store = makeStore();
    const {port} = adapter(store, {atBoundary: (_state, args) => { args.nextSourceJson = '{}'; }});
    accounted(await apply(request(store), port), 'refused', 1);
    assert.equal(store.writes, 0);
});

test('known zero-write outcomes do not permanently lock an Actor', async () => {
    const store = makeStore();
    const faults = {operationId: canary + '-declined'};
    const {port, calls} = adapter(store, faults);
    const raw = request(store);
    store.confirmation = false;
    accounted(await apply(raw, port), 'cancelled');
    const duplicate = await apply(raw, port);
    accounted(duplicate, 'duplicate');
    accounted(duplicate.historical, 'cancelled');
    assert.equal(calls.authorize, 1);
    store.confirmation = true;
    faults.operationId = canary + '-stale';
    faults.atBoundary = current => { current.parentAuthorized = false; };
    accounted(await apply(raw, port), 'stale', 1);
    store.parentAuthorized = true;
    delete faults.atBoundary;
    faults.operationId = canary + '-new';
    accounted(await apply(raw, port), 'applied', 1, 1, 1);
});

test('duplicate accounting is historical and operation-ID reuse cannot bind new input', async () => {
    const store = makeStore();
    const {port, calls} = adapter(store, {operationId: canary + '-fixed'});
    const raw = request(store);
    const first = await apply(raw, port);
    accounted(first, 'applied', 1, 1, 1);
    first.confirmedWrites = 99;
    store.sources.get(itemId).system.notes = 'later edit';
    const duplicate = await apply(raw, port);
    accounted(duplicate, 'duplicate');
    accounted(duplicate.historical, 'applied', 1, 1, 1);
    const conflict = await apply(request(store, 'core'), port);
    accounted(conflict, 'refused');
    assert.equal(conflict.reason, 'operation-id-conflict');
    assert.equal(store.sources.get(itemId).system.notes, 'later edit');
    assert.equal(store.writes, 1);
    assert.equal(calls.conditionalSave, 1);
});

function defer() {
    let release;
    const wait = new Promise(resolve => { release = resolve; });
    return {wait, release};
}

test('one port locks the Actor before any asynchronous work', async () => {
    const store = makeStore();
    const gate = defer();
    const {port, calls} = adapter(store, {gate: gate.wait});
    const raw = request(store);
    const pending = apply(raw, port);
    try {
        const overlap = await apply(raw, port);
        accounted(overlap, 'refused');
        assert.equal(overlap.reason, 'operation-in-flight');
        assert.equal(calls.capture, 1);
    } finally {
        gate.release();
    }
    accounted(await pending, 'applied', 1, 1, 1);
    assert.equal(store.writes, 1);
});

test('two port handles sharing the store rely on the conditional write boundary', async () => {
    const store = makeStore();
    const gate = defer();
    const entered = defer();
    const first = adapter(store, {gate: gate.wait, atBoundary: entered.release});
    const second = adapter(store);
    const raw = request(store);
    const pending = apply(raw, first.port);
    try {
        await Promise.race([entered.wait, pending.then(() => assert.fail('first call did not reach the boundary'))]);
        accounted(await apply(raw, second.port), 'applied', 1, 1, 1);
    } finally {
        gate.release();
    }
    accounted(await pending, 'stale', 1);
    assert.equal(store.writes, 1);
});

const ambiguousCases = [
    ['save threw before mutation', {save: 'throw-before'}, 'unknown', 0],
    ['save threw after mutation', {save: 'throw-after'}, 'unknown', 1],
    ['invalid save response', {save: 'invalid'}, 'unknown', 1],
    ...['throw', 'unavailable', 'selected', 'other', 'history', 'actor', 'membership', 'lossy-json'].map(mode =>
        ['readback ' + mode, {readBack: mode}, 1, 1])
];
for (const [name, faults, confirmed, actual] of ambiguousCases) {
    test('uncertainty: ' + name, async () => {
        const store = makeStore();
        const {port, calls} = adapter(store, faults);
        const raw = request(store);
        const original = copy(store.sources);
        accounted(await apply(raw, port), 'reconciliation-required', 1, confirmed);
        assert.equal(store.writes, actual);
        assert.equal(calls.readBack, confirmed === 'unknown' ? 0 : 1);

        const role = actual ? 'may' : 'core';
        const next = request(store, otherRole(role));
        if (actual === 0) assert.equal(next, raw);
        else assert.notEqual(next, raw);
        const other = adapter(store);
        accounted(await apply(next, other.port), 'reconciliation-required');
        assert.equal(other.calls.conditionalSave, 0);

        // A bad later host assertion cannot clear the first executor's process-local latch.
        store.unresolved = false;
        faults.operationId = canary + '-new-intent';
        const laterRequests = [request(store, role, 'cancel'), next, raw];
        if (actual === 0) {
            const currentTarget = request(store, role);
            assert.ok(currentTarget !== raw, 'current-target request must differ from the original May request');
            assert.equal(inspect(currentTarget).status, 'no-change');
            laterRequests.push(currentTarget);
        }
        for (const later of laterRequests) {
            const stopped = await apply(later, port);
            accounted(stopped, 'reconciliation-required');
            assert.equal(stopped.reason, 'prior-uncertainty');
        }
        assert.equal(calls.capture, 1);
        assert.equal(calls.conditionalSave, 1);
        assert.equal(store.writes, actual);
        assert.deepEqual(store.sources.get(otherId), original.get(otherId));
        assert.deepEqual(store.sources.get(itemId), actual
            ? expectedReplacement(original.get(itemId), 'may') : original.get(itemId));
    });
}
