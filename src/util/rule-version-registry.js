import {ruleVersionMetadataErrors} from './rule-versions.js';

const own = (value, key) => value !== null && typeof value === 'object' && Object.hasOwn(value, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const typed = /^Compendium\.([\w-]+)\.([\w-]+)\.Item\.([A-Za-z0-9]{16})$/;
const identity = /^Compendium\.[\w-]+\.[\w-]+\.(?:Item\.)?[A-Za-z0-9]{16}$/;
const copy = value => structuredClone(value);

// Only serialized data: inspect descriptors before cloning, without invoking getters or toJSON.
function serializedIssues(value, path = [], ancestors = new Set()) {
    if (value === null || ['string', 'boolean'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) return [];
    if (typeof value !== 'object') return [`not-serialized-data:${JSON.stringify(path)}`];
    if (ancestors.has(value)) return [`cyclic-data:${JSON.stringify(path)}`];
    if (Array.isArray(value) && Object.getPrototypeOf(value) !== Array.prototype) return [`non-plain-array:${JSON.stringify(path)}`];
    if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return [`non-plain-object:${JSON.stringify(path)}`];
    const next = new Set(ancestors).add(value), issues = [], indices = new Set();
    for (const key of Reflect.ownKeys(value)) {
        if (Array.isArray(value) && key === 'length') continue;
        if (typeof key !== 'string') {issues.push(`symbol-key:${JSON.stringify(path)}`); continue;}
        if (Array.isArray(value)) {
            const index = Number(key);
            if (!Number.isInteger(index) || index < 0 || index >= 4294967295 || String(index) !== key) {issues.push(`non-array-index:${JSON.stringify([...path, key])}`); continue;}
            indices.add(index);
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor.enumerable || !own(descriptor, 'value')) issues.push(`non-data-property:${JSON.stringify([...path, key])}`);
        else issues.push(...serializedIssues(descriptor.value, [...path, key], next));
    }
    if (Array.isArray(value) && indices.size !== value.length) issues.push(`sparse-array:${JSON.stringify(path)}`);
    return issues;
}

function readData(value) {
    try {const issues = serializedIssues(value); return {issues, value:issues.length ? null : copy(value)};}
    catch {return {issues:['serialized-data-unreadable'], value:null};}
}

function equal(a, b) {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((value, index) => equal(value, b[index]));
    if (!object(a) || !object(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => own(b, key) && equal(a[key], b[key]));
}

/** Explicit canonical mappings only. No default registry, content approval or live interfaces.
 * The existing metadata validator is called at invocation, after module initialization. */
export function createRuleVersionRegistry(mappings) {
    const input = readData(mappings), issues = [...input.issues], aliases = [];
    const invalid = () => ({schemaVersion:1, status:'invalid', issues:[...new Set(issues)], mappings:[], aliases:[]});
    if (issues.length) return invalid();
    if (!Array.isArray(input.value)) {issues.push('mappings-not-array'); return invalid();}
    const documents = new Set(), versions = new Set(), owners = new Map();
    for (const [index, record] of input.value.entries()) {
        issues.push(...ruleVersionMetadataErrors(record).map(issue => `mapping:${index}:${issue}`));
        const match = typeof record?.documentUuid === 'string' ? typed.exec(record.documentUuid) : null;
        if (!match) issues.push(`mapping:${index}:canonical-typed-item-identity-required`);
        if (!record?.canonical) issues.push(`mapping:${index}:canonical-relationship-required`);
        const version = JSON.stringify([record?.canonical?.id, record?.version?.id]);
        if (documents.has(record?.documentUuid)) issues.push('duplicate-document-mapping');
        if (versions.has(version)) issues.push('duplicate-canonical-version');
        documents.add(record?.documentUuid); versions.add(version);
        if (!match) continue;
        const legacy = `Compendium.${match[1]}.${match[2]}.${match[3]}`;
        for (const uuid of [record.documentUuid, legacy]) {
            if (owners.has(uuid)) issues.push('duplicate-or-conflicting-alias');
            owners.set(uuid, record.documentUuid);
            aliases.push({uuid, canonicalUuid:record.documentUuid});
        }
    }
    if (issues.length) return invalid();
    return {schemaVersion:1, status:'ready', issues:[], mappings:input.value, aliases};
}

/** Revalidate the serialized registry and its derived aliases at every boundary.
 * A forged/tampered alias table cannot introduce another relationship. */
export function matchRuleVersionRegistry(registry, uuid) {
    const input = readData(registry);
    const unresolved = issues => ({status:'unresolved', canonicalUuid:null, mappings:[], issues});
    if (input.issues.length) return unresolved(input.issues.map(issue => `registry:${issue}`));
    const value = input.value;
    if (!object(value) || !equal(Object.keys(value).sort(), ['aliases', 'issues', 'mappings', 'schemaVersion', 'status'])
        || value.schemaVersion !== 1 || value.status !== 'ready' || !equal(value.issues, [])) return unresolved(['registry-not-ready-or-invalid']);
    const verified = createRuleVersionRegistry(value.mappings);
    if (verified.status !== 'ready') return unresolved(verified.issues.map(issue => `registry:${issue}`));
    if (!equal(value.aliases, verified.aliases)) return unresolved(['registry-alias-integrity-conflict']);
    if (typeof uuid !== 'string' || !identity.test(uuid)) return unresolved(['registry-document-identity-invalid']);
    const matches = verified.aliases.filter(alias => alias.uuid === uuid);
    if (matches.length !== 1) return unresolved(['document-mapping-unestablished']);
    return {status:'matched', canonicalUuid:matches[0].canonicalUuid, mappings:verified.mappings, issues:[]};
}
