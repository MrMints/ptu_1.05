import {inspectMechanicPreferences} from './mechanic-preferences.js';

export const PREFERENCE_CAPTURE_LIMITS = Object.freeze({
    manifestChars:32768, replyChars:4096, totalReplyChars:32768,
    requestChars:65536, outputChars:131072, providerCalls:64
});
const LIMITS = PREFERENCE_CAPTURE_LIMITS;
const scopes = new Set(['world', 'client']);
const reasons = new Set(['not-observed', 'incomplete', 'unreadable']);
const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const exact = (v, keys) => record(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const text = (v, max = 128) => typeof v === 'string' && v.length <= max && v.trim().length > 0;
const ref = v => v === null || text(v, 1024);
function freeze(v) {
    if (v !== null && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
    return v;
}

// Only serialized data crosses the provider boundary. Parsing does not invoke returned
// getters, toJSON or thenables. Duplicate names and lossy number spellings are rejected.
function parse(raw, max, maxNodes = 8192, maxDepth = 12) {
    if (typeof raw !== 'string') throw new Error('input-type');
    if (raw.length > max) throw new Error('input-limit');
    const value = JSON.parse(raw), stack = [];
    let nodes = 0;
    const tokens = /"(?:[^"\\]|\\[\s\S])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g;
    for (const match of raw.matchAll(tokens)) {
        const token = match[0], frame = stack.at(-1);
        if (token === '}' || token === ']') { stack.pop(); continue; }
        if (token === ',') { if (frame?.object) frame.keyExpected = true; continue; }
        if (token === ':') continue;
        if (frame?.object && frame.keyExpected) {
            const key = JSON.parse(token);
            if (frame.keys.has(key)) throw new Error('duplicate-member');
            frame.keys.add(key); frame.keyExpected = false; continue;
        }
        if (++nodes > maxNodes || stack.length > maxDepth) throw new Error('data-limit');
        if (/^-?\d/.test(token) && (!/^(?:0|-?[1-9][0-9]*)$/.test(token) || !Number.isSafeInteger(Number(token)))) {
            throw new Error('number-invalid');
        }
        if (token === '{' || token === '[') stack.push({object:token === '{', keyExpected:true, keys:new Set()});
    }
    return value;
}
const same = (a, b) => {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const ak = Object.keys(a).sort(), bk = Object.keys(b).sort();
    return ak.length === bk.length && ak.every((k, i) => k === bk[i] && same(a[k], b[k]));
};
function storedValid(v) {
    if (!record(v)) return false;
    if (v.state === 'present') return exact(v, ['state', 'value', 'evidenceRef']) && text(v.evidenceRef, 1024);
    if (v.state === 'absent') return exact(v, ['state', 'evidenceRef']) && text(v.evidenceRef, 1024);
    return ['unknown', 'present-unavailable'].includes(v.state) &&
        exact(v, ['state', 'reason', 'evidenceRef']) && reasons.has(v.reason) && ref(v.evidenceRef);
}
function ancillaryValid(v) {
    return exact(v, ['availability', 'value', 'evidenceRef']) && v.availability === 'available' && text(v.evidenceRef, 1024) ||
        exact(v, ['availability', 'reason', 'evidenceRef']) && v.availability === 'unavailable' && reasons.has(v.reason) && ref(v.evidenceRef);
}
const unknown = (id, storageScope, reason = 'not-observed') => ({id, storageScope, state:'unknown', reason, evidenceRef:null});
function invalid(code, providerCalls = 0, evidenceDiscarded = false) {
    return freeze({schemaVersion:1, kind:'ptu-preference-capture-v1', status:'invalid', productionMapping:false,
        providerCalls, evidenceDiscarded, coverage:null, records:[], requestJson:null, reviewSummary:null, issues:[{code}]});
}

/**
 * Capture explicitly supplied bindings through a synchronous, caller-controlled provider.
 * This module never reads global settings or writes storage. Arbitrary callbacks are NOT
 * proven pure, cancellable or time-bounded: callers must supply a trusted finite provider.
 * The callback is invoked at most once per binding. Promise/object returns are not awaited
 * or inspected. This is not a Foundry adapter or an authoritative production key map.
 */
export function captureMechanicPreferences(manifestJson, provider) {
    if (arguments.length !== 2 || typeof provider !== 'function') return invalid('arguments-invalid');
    let manifest;
    try { manifest = parse(manifestJson, LIMITS.manifestChars); } catch { return invalid('manifest-invalid'); }
    if (!exact(manifest, ['schemaVersion', 'coverage', 'definitions', 'bindings']) || manifest.schemaVersion !== 1 ||
        !exact(manifest.coverage, ['kind', 'evidenceRef']) || manifest.coverage.kind !== 'selected-declarations' ||
        !text(manifest.coverage.evidenceRef, 1024) || !Array.isArray(manifest.definitions) ||
        !Array.isArray(manifest.bindings) || manifest.definitions.length > 64 || manifest.bindings.length > LIMITS.providerCalls) {
        return invalid('manifest-shape');
    }
    // The complete retained validator closure is used, not a substituted schema stub.
    const declarationReport = inspectMechanicPreferences(JSON.stringify({schemaVersion:1, definitions:manifest.definitions, observations:[]}));
    if (declarationReport.availability !== 'available' ||
        declarationReport.current.some(row => row.definitionStatus !== 'valid') ||
        declarationReport.issues.some(issue => issue.code !== 'observation-missing')) return invalid('definitions-invalid');
    const declarations = new Map(manifest.definitions.map(d => [d.id, d])), mapped = new Set(), addresses = new Set();
    for (const b of manifest.bindings) {
        if (!exact(b, ['id', 'namespace', 'key', 'storageScope', 'registrationEvidenceRef']) ||
            !text(b.id) || !text(b.namespace) || !text(b.key) || !scopes.has(b.storageScope) ||
            !text(b.registrationEvidenceRef, 1024) || !declarations.has(b.id) ||
            declarations.get(b.id).storageScope !== b.storageScope || mapped.has(b.id)) return invalid('binding-invalid');
        const address = JSON.stringify([b.namespace, b.key, b.storageScope]);
        if (addresses.has(address)) return invalid('binding-address-duplicate');
        mapped.add(b.id); addresses.add(address);
    }
    const result = {schemaVersion:1, kind:'ptu-preference-capture-v1', status:'captured', productionMapping:false,
        providerCalls:0, evidenceDiscarded:false,
        coverage:{kind:'selected-declarations', evidenceRef:manifest.coverage.evidenceRef,
            declaredIds:manifest.definitions.map(d => d.id), mappedIds:manifest.bindings.map(b => b.id),
            unmappedIds:manifest.definitions.filter(d => !mapped.has(d.id)).map(d => d.id)},
        records:[], requestJson:null, reviewSummary:null, issues:[]};
    const observations = new Map();
    let replyChars = 0;
    const fail = (binding, code, reason = 'unreadable') => {
        result.status = 'partial';
        result.issues.push({id:binding.id, code});
        observations.set(binding.id, unknown(binding.id, binding.storageScope, reason));
        result.records.push({binding, disposition:code, evidence:null});
    };
    for (const original of manifest.bindings) {
        const binding = freeze(JSON.parse(JSON.stringify(original)));
        // Reserve a full permitted reply before invocation, so aggregate bounds never cause
        // an unplanned second call or a callback after the budget is already exhausted.
        if (replyChars + LIMITS.replyChars > LIMITS.totalReplyChars) { fail(binding, 'reply-budget-exhausted', 'incomplete'); continue; }
        let raw;
        result.providerCalls++;
        try { raw = provider(binding); } catch { fail(binding, 'provider-threw'); continue; }
        if (typeof raw !== 'string') { fail(binding, 'provider-return-type'); continue; }
        // Oversized replies count the maximum reservation; their contents are not retained.
        replyChars += Math.min(raw.length, LIMITS.replyChars);
        let reply;
        try { reply = parse(raw, LIMITS.replyChars, 512, 8); } catch { fail(binding, 'provider-data-invalid'); continue; }
        if (!exact(reply, ['schemaVersion', 'id', 'storageScope', 'stored', 'effective', 'default']) ||
            reply.schemaVersion !== 1 || reply.id !== binding.id || reply.storageScope !== binding.storageScope ||
            !storedValid(reply.stored) || !ancillaryValid(reply.effective) || !ancillaryValid(reply.default)) {
            fail(binding, 'provider-shape-or-identity'); continue;
        }
        const s = reply.stored, e = reply.effective, d = reply.default;
        const inconsistent = s.state === 'present' && e.availability === 'available' && !same(s.value, e.value) ||
            s.state === 'absent' && e.availability === 'available' && d.availability === 'available' && !same(e.value, d.value);
        result.records.push({binding, disposition:inconsistent ? 'inconsistent' : 'observed', evidence:reply});
        if (inconsistent) {
            result.status = 'partial';
            result.issues.push({id:binding.id, code:'inconsistent-observation'});
            observations.set(binding.id, unknown(binding.id, binding.storageScope, 'incomplete'));
        } else {
            observations.set(binding.id, {id:binding.id, storageScope:binding.storageScope, ...s});
            if (['unknown', 'present-unavailable'].includes(s.state)) {
                result.status = 'partial'; result.issues.push({id:binding.id, code:'stored-evidence-unavailable'});
            }
        }
    }
    for (const definition of manifest.definitions) if (!mapped.has(definition.id)) {
        result.status = 'partial';
        result.issues.push({id:definition.id, code:'binding-not-declared'});
        observations.set(definition.id, unknown(definition.id, definition.storageScope));
    }
    const requestJson = JSON.stringify({schemaVersion:1, definitions:manifest.definitions,
        observations:manifest.definitions.map(d => observations.get(d.id))});
    if (requestJson.length > LIMITS.requestChars) return invalid('request-output-limit', result.providerCalls, true);
    const report = inspectMechanicPreferences(requestJson);
    if (report.availability !== 'available' || report.input.snapshot === null) return invalid('review-contract-rejected', result.providerCalls, true);
    result.requestJson = requestJson;
    result.reviewSummary = {availability:report.availability, choiceProjectionAvailability:report.choiceProjection.availability,
        issueCodes:[...new Set(report.issues.map(i => i.code))]};
    if (JSON.stringify(result).length > LIMITS.outputChars) return invalid('capture-output-limit', result.providerCalls, true);
    return freeze(result);
}
