import {lookupEffectiveRule, STANDARD_RULE_DEFAULT} from './rule-versions.js';
import {diagnosePrerequisites, formatPrerequisiteDiagnostics} from './prerequisites.js';

const own = (value, key) => value !== null && typeof value === 'object' && Object.hasOwn(value, key);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const copy = value => value === undefined ? undefined : structuredClone(value);
const itemUuid = value => typeof value === 'string' && /^(?:Compendium\.[\w-]+\.[\w-]+\.(?:Item\.)?|Item\.|Actor\.[\w]+\.Item\.)[A-Za-z0-9]{16}$/.test(value);

// Inspect descriptors without calling getters, toJSON, toObject or any other live interface.
function serializedIssues(value, path = [], ancestors = new Set()) {
    if (value === null || ['string', 'boolean'].includes(typeof value)
        || (typeof value === 'number' && Number.isFinite(value))) return [];
    if (typeof value !== 'object') return [{path, reason:'not-serialized-data'}];
    if (ancestors.has(value)) return [{path, reason:'cyclic-data'}];
    if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
        return [{path, reason:'non-plain-object'}];
    }
    const next = new Set(ancestors).add(value), issues = [];
    for (const key of Reflect.ownKeys(value)) {
        if (Array.isArray(value) && key === 'length') continue;
        if (typeof key !== 'string') {issues.push({path, reason:'symbol-key'}); continue;}
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor.enumerable || !own(descriptor, 'value')) issues.push({path:[...path, key], reason:'non-data-property'});
        else if (Array.isArray(value) && !/^(0|[1-9]\d*)$/.test(key)) issues.push({path:[...path, key], reason:'non-array-index'});
        else issues.push(...serializedIssues(descriptor.value, [...path, key], next));
    }
    if (Array.isArray(value)) for (let i = 0; i < value.length; i++) {
        if (!own(value, i)) issues.push({path:[...path, String(i)], reason:'sparse-array'});
    }
    return issues;
}

function readInput(value) {
    const issues = value === undefined ? [{path:[], reason:'input-missing'}] : serializedIssues(value);
    return {available:issues.length === 0, value:issues.length ? undefined : copy(value), issues};
}

function itemInput(value) {
    const input = readInput(value);
    if (input.available && !record(input.value)) input.issues.push({path:[], reason:'item-snapshot-not-object'});
    if (record(input.value)) {
        if (own(input.value, 'toObject')) input.issues.push({path:['toObject'], reason:'live-document-interface-not-allowed'});
        if (own(input.value, 'name') && typeof input.value.name !== 'string') input.issues.push({path:['name'], reason:'item-name-invalid'});
        if (!itemUuid(input.value.uuid)) input.issues.push({path:['uuid'], reason:'explicit-item-uuid-required'});
        const uuidId = typeof input.value.uuid === 'string' ? input.value.uuid.split('.').at(-1) : null;
        for (const key of ['id', '_id']) if (own(input.value, key) && input.value[key] !== uuidId) {
            input.issues.push({path:[key], reason:'item-id-uuid-conflict'});
        }
    }
    return input;
}

function equal(a, b) {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((value, i) => equal(value, b[i]));
    if (!record(a) || !record(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => own(b, key) && equal(a[key], b[key]));
}

function differences(before, after, beforePresent, afterPresent, path = ['system']) {
    if (beforePresent && afterPresent && record(before) && record(after)) {
        return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().flatMap(key =>
            differences(before[key], after[key], own(before, key), own(after, key), [...path, key]));
    }
    if (beforePresent === afterPresent && (!beforePresent || equal(before, after))) return [];
    return [{path, before:{present:beforePresent, ...(beforePresent ? {value:copy(before)} : {})},
        after:{present:afterPresent, ...(afterPresent ? {value:copy(after)} : {})}}];
}

function relationship(current, candidate) {
    const issues = [];
    for (const [side, input] of [['current', current], ['candidate', candidate]]) {
        if (input.inputIssues.length) issues.push(`${side}-input-unresolved`);
        if (input.attribution?.status !== 'resolved') issues.push(`${side}-attribution-unresolved`);
        else if (!input.attribution.canonical) issues.push(`${side}-canonical-relationship-unestablished`);
    }
    if (issues.length) return {status:'unresolved', issues};
    if (current.snapshot.type !== candidate.snapshot.type) return {status:'unresolved', issues:['item-type-mismatch']};
    const a = current.attribution, b = candidate.attribution;
    if (current.snapshot.uuid === candidate.snapshot.uuid && a.identity.mappingUuid !== b.identity.mappingUuid) {
        return {status:'unresolved', issues:['conflicting-document-identity']};
    }
    if (a.canonical.id !== b.canonical.id) return {status:'unrelated-benefits', issues:[]};
    return {status:a.identity.mappingUuid === b.identity.mappingUuid && a.selectedVersion.id === b.selectedVersion.id
        ? 'same-selection' : 'alternate-versions', canonicalId:a.canonical.id, issues:[]};
}

/** Inspection of serialized snapshots only. No transfer policy, update payload, authority or live IO. */
export function previewRuleVersionReplacement(options = {}) {
    const requestIssues = [], values = {};
    if (!record(options) || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) {
        requestIssues.push({input:'request', path:[], reason:'request-not-plain-object'});
    } else for (const key of ['actor', 'current', 'candidate', 'versions', 'mechanicChoices', 'references']) {
        const descriptor = Object.getOwnPropertyDescriptor(options, key);
        if (descriptor && !own(descriptor, 'value')) requestIssues.push({input:'request', path:[key], reason:'request-field-not-data'});
        else if (descriptor) values[key] = descriptor.value;
    }
    const {actor, current, candidate, versions, mechanicChoices = {}, references = {}} = values;
    const inputs = {actor:readInput(actor), current:itemInput(current), candidate:itemInput(candidate),
        versions:readInput(versions), mechanicChoices:readInput(mechanicChoices), references:readInput(references)};
    const contextIssues = [...requestIssues];
    for (const key of ['actor', 'mechanicChoices', 'references']) {
        const input = inputs[key];
        if (input.available && !record(input.value)) input.issues.push({path:[], reason:`${key}-not-object`});
    }
    if (Array.isArray(inputs.actor.value?.items) && inputs.actor.value.items.some(item => !record(item))) {
        inputs.actor.issues.push({path:['items'], reason:'actor-items-invalid'});
    }
    if (inputs.versions.available && !Array.isArray(inputs.versions.value)) {
        inputs.versions.issues.push({path:[], reason:'versions-not-array'});
    }
    if (record(inputs.references.value)) for (const [key, reference] of Object.entries(inputs.references.value)) {
        const uuid = typeof reference === 'string' ? reference : reference?.uuid;
        if (!itemUuid(uuid)) inputs.references.issues.push({path:[key], reason:'prerequisite-reference-identity-invalid'});
    }
    for (const key of ['actor', 'versions', 'mechanicChoices', 'references']) {
        contextIssues.push(...inputs[key].issues.map(issue => ({input:key, ...issue})));
    }
    const choices = inputs.mechanicChoices.available ? inputs.mechanicChoices.value : null;
    const mappings = inputs.versions.available ? inputs.versions.value : null;
    const sides = {};
    for (const key of ['current', 'candidate']) {
        const input = inputs[key];
        // Identity issues remain explicit, but safe partial snapshots can still expose lookup issues.
        const safe = record(input.value) && !own(input.value, 'toObject')
            && (!own(input.value, 'name') || typeof input.value.name === 'string');
        sides[key] = {snapshotAvailable:input.available, snapshot:input.value, inputIssues:input.issues,
            attribution:safe ? lookupEffectiveRule(input.value, {versions:mappings, mechanicChoices:choices}).selection : null};
    }
    const candidateData = inputs.candidate.value;
    const diagnosticItem = record(candidateData) && !own(candidateData, 'toObject')
        && (!own(candidateData, 'name') || typeof candidateData.name === 'string') ? candidateData : undefined;
    const diagnosticActor = inputs.actor.issues.length === 0 ? inputs.actor.value : undefined;
    const diagnosticReferences = inputs.references.issues.length === 0 ? inputs.references.value : {};
    const report = diagnosePrerequisites({actor:diagnosticActor, item:diagnosticItem,
        selectedVersion:sides.candidate.attribution?.selectedVersion ?? null, references:diagnosticReferences});
    const sourceValue = report.identity.source?.value;
    const sourceLabelInvalid = sourceValue !== undefined && sourceValue !== null && typeof sourceValue === 'object';
    const diffAvailable = record(sides.current.snapshot) && record(sides.candidate.snapshot);
    return {schemaVersion:1, inspectionOnly:true, ...sides, relationship:relationship(sides.current, sides.candidate),
        differences:{status:diffAvailable ? 'complete' : 'unavailable', changes:diffAvailable
            ? differences(sides.current.snapshot.system, sides.candidate.snapshot.system,
                own(sides.current.snapshot, 'system'), own(sides.candidate.snapshot, 'system')) : []},
        prerequisites:{report, formatted:sourceLabelInvalid ? null : formatPrerequisiteDiagnostics(report),
            issues:sourceLabelInvalid ? ['source-label-not-text'] : []},
        mechanics:{default:STANDARD_RULE_DEFAULT, choices:copy(choices)}, contextIssues,
        outsidePreview:['ownership-and-permissions', 'production-source-approval', 'acquisition-scope',
            'state-transfer-policy', 'repeat-and-stacking-policy', 'effect-use-authorization']};
}
