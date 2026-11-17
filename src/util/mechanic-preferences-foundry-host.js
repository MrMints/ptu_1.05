import {captureTrainerAdvancement, TRAINER_PROVIDER_LIMITS} from './mechanic-preferences-foundry-provider.js';

export const TRAINER_HOST_LIMITS = Object.freeze({records:256, prototypeDepth:16, fieldChars:512});
const TARGET = 'ptu.variant.trainerAdvancement';
const MODES = Object.freeze(['original', 'data-revamp', 'short-track', 'ptr-update', 'long-track']);
const CLASSES = Object.freeze(['Game', 'User', 'Users', 'Setting', 'WorldSettings', 'ClientSettings']);
const KEYS = ['user', 'id', 'get', 'values', Symbol.iterator];
const mapPrototype = Map.prototype;
const mapGet = mapPrototype.get;
const mapIteratorPrototype = Object.getPrototypeOf(new Map().values());
const mapNext = mapIteratorPrototype.next;
const gopd = Object.getOwnPropertyDescriptor;
const gpo = Object.getPrototypeOf;
const mapGetDescriptor = gopd(mapPrototype, 'get');
const mapNextDescriptor = gopd(mapIteratorPrototype, 'next');
let binding = null;

const failures = new WeakMap();
function fail(stage, reason) {
    const token = Object.freeze({});
    failures.set(token, {stage, reason});
    throw token;
}
function record(value) { return value !== null && typeof value === 'object'; }
function own(object, key, stage, optional = false) {
    if (!record(object) && typeof object !== 'function') fail(stage, 'unsupported-container');
    const d = gopd(object, key);
    if (!d) {
        if (optional) return {present:false, value:undefined};
        fail(stage, 'missing-field');
    }
    if (!Object.hasOwn(d, 'value')) fail(stage, 'unsupported-accessor');
    return {present:true, value:d.value};
}
function value(object, key, stage) { return own(object, key, stage).value; }
function id(value) { return typeof value === 'string' && value.length > 0 && value.length <= 128; }
function field(value) { return typeof value === 'string' && value.length > 0 && value.length <= TRAINER_HOST_LIMITS.fieldChars; }
function descriptorEqual(a, b) {
    if (!a || !b) return a === b;
    return ['value', 'get', 'set', 'writable', 'enumerable', 'configurable'].every(k =>
        Object.hasOwn(a, k) === Object.hasOwn(b, k) && Object.is(a[k], b[k]));
}
function chain(proto) {
    const out = [];
    for (let p = proto; p !== null; p = gpo(p)) {
        if (out.length === TRAINER_HOST_LIMITS.prototypeDepth) fail('qualification', 'prototype-limit');
        out.push({object:p, parent:gpo(p), descriptors:KEYS.map(k => gopd(p, k))});
    }
    return out;
}
function resolution(object, key) {
    for (let p = object, n = 0; p !== null && n <= TRAINER_HOST_LIMITS.prototypeDepth; p = gpo(p), n++) {
        const d = gopd(p, key);
        if (d) return {owner:p, descriptor:d};
    }
    fail('qualification', 'missing-native-path');
}
function verifyIntrinsics() {
    if (Map.prototype !== mapPrototype || !descriptorEqual(gopd(mapPrototype, 'get'), mapGetDescriptor) ||
        !descriptorEqual(gopd(mapIteratorPrototype, 'next'), mapNextDescriptor))
        fail('qualification', 'intrinsic-substitution');
}
function mapLookup(store, key, stage, storage = false) {
    verifyIntrinsics();
    if (!record(store) || gpo(store) !== mapPrototype || gopd(store, 'get') ||
        (storage && gopd(store, 'world'))) fail(stage, 'unsupported-map-binding');
    const lookup = resolution(store, 'get');
    if (lookup.owner !== mapPrototype || !descriptorEqual(lookup.descriptor, mapGetDescriptor))
        fail(stage, 'shadowed-map-lookup');
    return mapGet.call(store, key);
}
function verifyBinding() {
    if (!binding) fail('qualification', 'bootstrap-unqualified');
    verifyIntrinsics();
    for (const name of CLASSES) {
        const pin = binding[name];
        if (value(pin.constructor, 'prototype', 'qualification') !== pin.prototype) fail('qualification', 'prototype-substitution');
        for (const step of pin.chain) {
            if (gpo(step.object) !== step.parent || KEYS.some((k, i) => !descriptorEqual(gopd(step.object, k), step.descriptors[i])))
                fail('qualification', 'prototype-substitution');
        }
    }
}
function native(object, name, stage) {
    if (!record(object) || gpo(object) !== binding[name].prototype) fail(stage, 'unsupported-native-binding');
}
function path(object, name, key, getter) {
    native(object, name, 'qualification');
    const actual = resolution(object, key), expected = resolution(binding[name].prototype, key);
    if (actual.owner !== expected.owner || !descriptorEqual(actual.descriptor, expected.descriptor))
        fail('qualification', 'shadowed-native-path');
    const fn = getter ? expected.descriptor.get : expected.descriptor.value;
    if (typeof fn !== 'function' || (getter && Object.hasOwn(expected.descriptor, 'value')))
        fail('qualification', 'unsupported-native-path');
    return fn;
}
function frozen(value) {
    if (record(value)) { for (const v of Object.values(value)) frozen(v); Object.freeze(value); }
    return value;
}
function output(status, stage, reason, evidence = null, provider = null) {
    return frozen({schemaVersion:1, kind:'ptu-trainer-advancement-foundry-host-v1', status, stage, reason,
        qualification:'trusted-bootstrap-required-not-native-verified', atomicity:'not-established',
        sourceRepresentation:'loaded-model-source-not-disk', overrideAssessment:'unresolved',
        evidence, provider});
}

/**
 * Explicit trusted-bootstrap boundary, not an authorization grant or native attestation.
 * A separately vetted installer supplies core class references, never a User, game,
 * authority Boolean or executable observation port. No installer is included or wired.
 * These pins detect later substitutions only; a compromised bootstrap cannot be proven
 * safe here. The actual-global capture below always performs its own user checks.
 */
export function bindTrainerAdvancementFoundryHost(core) {
    try {
        if (arguments.length !== 1 || binding || !record(core) || gpo(core) !== Object.prototype ||
            Reflect.ownKeys(core).length !== CLASSES.length) fail('qualification', 'bootstrap-contract');
        verifyIntrinsics();
        const next = {};
        for (const name of CLASSES) {
            const constructor = value(core, name, 'qualification');
            if (typeof constructor !== 'function') fail('qualification', 'bootstrap-contract');
            const prototype = value(constructor, 'prototype', 'qualification');
            if (!record(prototype)) fail('qualification', 'bootstrap-contract');
            next[name] = {constructor, prototype, chain:chain(prototype)};
        }
        for (const [name, key, getter] of [['Game','user',true], ['User','id',true], ['Setting','id',true],
            ['Users','get',false], ['WorldSettings','values',false], ['WorldSettings',Symbol.iterator,false]]) {
            const d = resolution(next[name].prototype, key).descriptor;
            if (typeof (getter ? d.get : d.value) !== 'function') fail('qualification', 'unsupported-native-path');
        }
        binding = next;
        return frozen({status:'bound', nativeCompatibility:'unverified', activation:'not-installed'});
    } catch (error) {
        return frozen({status:'unsupported', reason:failures.get(error)?.reason ?? 'bootstrap-unreadable'});
    }
}
function authority() {
    verifyBinding();
    const game = value(globalThis, 'game', 'authority'), config = value(globalThis, 'CONFIG', 'qualification');
    native(game, 'Game', 'qualification');
    const userConfig = value(config, 'User', 'qualification'), settingConfig = value(config, 'Setting', 'qualification');
    if (value(userConfig, 'documentClass', 'qualification') !== binding.User.constructor ||
        value(userConfig, 'collection', 'qualification') !== binding.Users.constructor ||
        value(settingConfig, 'documentClass', 'qualification') !== binding.Setting.constructor)
        fail('qualification', 'config-substitution');
    const data = value(game, 'data', 'authority'), users = value(game, 'users', 'authority');
    native(users, 'Users', 'qualification');
    const userId = value(game, 'userId', 'authority'), dataUserId = value(data, 'userId', 'authority');
    const user = value(users, 'current', 'authority');
    native(user, 'User', 'authority');
    const current = path(game, 'Game', 'user', true).call(game);
    const member = path(users, 'Users', 'get', false).call(users, userId);
    const documentId = path(user, 'User', 'id', true).call(user);
    const sourceId = value(user, '_id', 'authority'), role = value(user, 'role', 'authority');
    if (!id(userId) || userId !== dataUserId || documentId !== userId || sourceId !== userId ||
        user !== current || user !== member) fail('authority', 'current-user-disagreement');
    if (role !== 4) fail('authority', 'full-gm-required');
    verifyBinding();
    if (value(globalThis, 'game', 'authority') !== game || value(globalThis, 'CONFIG', 'qualification') !== config ||
        value(game, 'data', 'authority') !== data || value(game, 'users', 'authority') !== users ||
        value(users, 'current', 'authority') !== user || value(config, 'User', 'qualification') !== userConfig ||
        value(config, 'Setting', 'qualification') !== settingConfig) fail('authority', 'authority-changed');
    return {game, vector:[game, config, userConfig, settingConfig, data, users, user, current, member, userId, dataUserId, documentId, sourceId, role]};
}
function same(a, b) { return a.length === b.length && a.every((v, i) => Object.is(v, b[i])); }
function registration(manager) {
    const store = value(manager, 'settings', 'registration');
    const entry = mapLookup(store, TARGET, 'registration');
    if (!record(entry) || gpo(entry) !== Object.prototype) fail('registration', 'registration-unavailable');
    const keys = ['namespace', 'key', 'type', 'scope', 'default', 'choices', 'requiresReload', 'config'];
    const fields = keys.map(k => value(entry, k, 'registration'));
    const [namespace, key, type, scope, defaultValue, choices, requiresReload, config] = fields;
    if (!record(choices) || gpo(choices) !== Object.prototype) fail('registration', 'unsupported-choices');
    const choiceKeys = Reflect.ownKeys(choices);
    if (choiceKeys.length !== MODES.length || choiceKeys.some((k, i) => k !== MODES[i])) fail('registration', 'unsupported-choices');
    const labels = MODES.map(k => value(choices, k, 'registration'));
    if (labels.some(label => !field(label)) || namespace !== 'ptu' || key !== 'variant.trainerAdvancement' ||
        type !== String || scope !== 'world' || defaultValue !== 'original' || requiresReload !== true || config !== false)
        fail('registration', 'registration-unsupported');
    return {vector:[store, entry, ...fields, ...labels], value:{type:'String', scope, default:defaultValue,
        choices:[...MODES], requiresReload, config}};
}
function context(game) {
    const manager = value(game, 'settings', 'settings');
    native(manager, 'ClientSettings', 'qualification');
    const storage = value(manager, 'storage', 'settings');
    const world = mapLookup(storage, 'world', 'settings', true);
    native(world, 'WorldSettings', 'qualification');
    path(world, 'WorldSettings', Symbol.iterator, false);
    return {world, registration:registration(manager), vector:[manager, storage, world]};
}
function metadata(document) {
    native(document, 'Setting', 'membership');
    const storedId = value(document, '_id', 'membership');
    const documentId = path(document, 'Setting', 'id', true).call(document);
    const key = value(document, 'key', 'membership'), user = value(document, 'user', 'membership');
    if (!id(documentId) || storedId !== documentId || !field(key) || !(user === null || id(user)))
        fail('membership', 'unsupported-record');
    return [document, documentId, key, user];
}
function traversal(world) {
    verifyIntrinsics();
    const iterator = path(world, 'WorldSettings', 'values', false).call(world);
    verifyIntrinsics();
    if (!record(iterator) || gpo(iterator) !== mapIteratorPrototype || gopd(iterator, 'next'))
        fail('membership', 'unsupported-iterator');
    const rows = [], objects = new Set(), ids = new Set();
    let selected = null;
    for (let i = 0; i <= TRAINER_HOST_LIMITS.records; i++) {
        verifyIntrinsics();
        const next = resolution(iterator, 'next');
        if (next.owner !== mapIteratorPrototype || !descriptorEqual(next.descriptor, mapNextDescriptor))
            fail('membership', 'shadowed-iterator-next');
        const step = mapNext.call(iterator), done = value(step, 'done', 'membership');
        if (typeof done !== 'boolean') fail('membership', 'incomplete-iteration');
        if (done) return {rows, selected};
        // Do not inspect value (or any overflow-record field) on the completion probe.
        if (i === TRAINER_HOST_LIMITS.records) fail('membership', 'membership-overflow');
        const row = metadata(value(step, 'value', 'membership'));
        if (objects.has(row[0]) || ids.has(row[1])) fail('membership', 'duplicate-record');
        objects.add(row[0]); ids.add(row[1]); rows.push(row);
        if (row[2] === TARGET && row[3] === null) {
            if (selected) fail('membership', 'duplicate-target');
            selected = row;
        }
    }
    fail('membership', 'incomplete-iteration');
}
function selected(row) {
    if (!row) return {vector:[], raw:{present:false, value:undefined}, prepared:{present:false, value:undefined}};
    const document = row[0], source = value(document, '_source', 'selected');
    if (!record(source) || gpo(source) !== Object.prototype) fail('selected', 'unsupported-source');
    const sourceIdentity = ['_id','key','user'].map(k => value(source, k, 'selected'));
    if (!same(sourceIdentity, row.slice(1))) fail('selected', 'source-identity-disagreement');
    const raw = own(source, 'value', 'selected', true), prepared = own(document, 'value', 'selected', true);
    return {raw, prepared, vector:[source, ...sourceIdentity, raw.present, raw.value, prepared.present, prepared.value]};
}
function representation(part) {
    if (!part.present) return 'missing';
    if (part.value === null) return 'null';
    if (part.value === undefined) return 'undefined';
    if (typeof part.value === 'number' && (!Number.isSafeInteger(part.value) || Object.is(part.value, -0))) return 'unsupported-number';
    if (typeof part.value === 'string' && part.value.length > TRAINER_PROVIDER_LIMITS.sourceChars) return 'oversize-string';
    if (['string','number','boolean'].includes(typeof part.value)) return typeof part.value;
    return 'unsupported';
}
const unavailable = () => ({availability:'unavailable', reason:'not-observed', evidenceRef:null});
const available = value => ({availability:'available', value, evidenceRef:'host:selected-loaded-primitive'});
function primitive(part) { return part.present && ['null','string','number','boolean'].includes(representation(part)); }

/**
 * No arguments, injected game, authority ports or import-time observations.
 * Uses only actual globals after separately trusted bootstrap; ordinary cooperative
 * native semantics are required. Reflection may trigger Proxy traps: this is not a
 * sandbox, universal Proxy detector, atomic snapshot or defense against privileged JS.
 */
export function captureFoundryTrainerAdvancement() {
    if (arguments.length !== 0) return output('unsupported', 'arguments', 'no-arguments-required');
    try {
        const before = authority(), first = context(before.game), pass1 = traversal(first.world);
        const data1 = selected(pass1.selected), pass2 = traversal(first.world), data2 = selected(pass2.selected);
        const last = context(before.game);
        if (!same(first.vector, last.vector) || !same(first.registration.vector, last.registration.vector) ||
            pass1.rows.length !== pass2.rows.length || pass1.rows.some((row, i) => !same(row, pass2.rows[i])) ||
            !same(data1.vector, data2.vector)) fail('consistency', 'change-detected');
        const after = authority();
        if (!same(before.vector, after.vector)) fail('authority', 'authority-changed');
        const rawKind = representation(data2.raw), preparedKind = representation(data2.prepared);
        let decoded = unavailable();
        if (rawKind === 'string') {
            try {
                const parsed = JSON.parse(data2.raw.value), part = {present:true, value:parsed};
                if (primitive(part)) decoded = available(parsed);
            } catch { /* Preserve invalid stored text; the unchanged provider diagnoses it. */ }
        }
        const observation = {schemaVersion:1, namespace:'ptu', key:'variant.trainerAdvancement', storageScope:'world',
            registration:available(first.registration.value),
            presence:{state:pass2.selected ? 'present' : 'not-loaded', evidenceRef:'host:complete-loaded-membership'},
            loadedSource:rawKind === 'string' ? available(data2.raw.value) : unavailable(), decoded,
            effective:primitive(data2.prepared) ? available(data2.prepared.value) : unavailable(),
            overrideEvidence:unavailable(),
            consistency:{status:'no-change-detected', before:'paired-observation', after:'paired-observation', evidenceRef:'host:non-atomic-two-pass'}};
        const encoded = JSON.stringify(observation);
        if (encoded.length > TRAINER_PROVIDER_LIMITS.observationChars) fail('encoding', 'observation-limit');
        const request = JSON.stringify({schemaVersion:1, namespace:'ptu', key:'variant.trainerAdvancement', storageScope:'world',
            mechanicId:'ptu.trainer-advancement', mapping:{original:'standard'}, callerRef:'host:actual-current-user'});
        const authorization = JSON.stringify({schemaVersion:1, callerRef:'host:actual-current-user', decision:'authorized', role:'gm',
            evidenceRef:'host:paired-actual-current-user-client-linkage'});
        const provider = captureTrainerAdvancement(request, () => authorization, () => encoded);
        return output('observed', 'complete', null, {loadedPresence:observation.presence.state,
            sourceValue:rawKind, preparedValue:preparedKind, membership:'two-complete-bounded-passes',
            nativeAuthentication:'not-established', invalidSourceMembership:'not-observed', transientChanges:'not-excluded'}, provider);
    } catch (error) {
        const known = failures.get(error);
        return output(known?.stage === 'authority' ? 'denied' : 'unsupported',
            known?.stage ?? 'observation', known?.reason ?? 'unreadable');
    }
}
