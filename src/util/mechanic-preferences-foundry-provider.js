import {captureMechanicPreferences} from './mechanic-preferences-capture.js';

export const TRAINER_PROVIDER_LIMITS = Object.freeze({requestChars:2048, authorityChars:1024,
    observationChars:8192, sourceChars:4096, outputChars:32768, authorityCalls:1, observationCalls:1});
const L = TRAINER_PROVIDER_LIMITS;
const ID = 'ptu.trainer-advancement';
const MODES = ['original', 'data-revamp', 'short-track', 'ptr-update', 'long-track'];
const rec = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const exact = (v, keys) => rec(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const text = (v, max = 128) => typeof v === 'string' && v.length <= max && v.trim().length > 0;
const reason = v => ['not-observed', 'incomplete', 'unreadable'].includes(v);
const freeze = v => { if (v !== null && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const equal = (a, b) => {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const ak = Object.keys(a).sort(), bk = Object.keys(b).sort();
    return ak.length === bk.length && ak.every((k, i) => k === bk[i] && equal(a[k], b[k]));
};
// Only primitive JSON strings are parsed. No returned object/thenable is traversed.
// Callbacks themselves are trusted executable dependencies, not proven pure or bounded.
function parse(raw, max, maxNodes = 512, maxDepth = 8) {
    if (typeof raw !== 'string' || raw.length > max) throw new Error('serialized-boundary');
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
        if (/^-?\d/.test(token) && (!/^(?:0|-?[1-9][0-9]*)$/.test(token) || !Number.isSafeInteger(Number(token)))) throw new Error('number-invalid');
        if (token === '{' || token === '[') stack.push({object:token === '{', keyExpected:true, keys:new Set()});
    }
    return value;
}
const unavailable = () => ({availability:'unavailable', reason:'not-observed', evidenceRef:null});
const ancillary = v => exact(v, ['availability', 'value', 'evidenceRef']) && v.availability === 'available' && text(v.evidenceRef, 512) ||
    exact(v, ['availability', 'reason', 'evidenceRef']) && v.availability === 'unavailable' && reason(v.reason) && (v.evidenceRef === null || text(v.evidenceRef, 512));
const tuple = v => v.namespace === 'ptu' && v.key === 'variant.trainerAdvancement' && v.storageScope === 'world';
const manifest = JSON.stringify({schemaVersion:1,
    coverage:{kind:'selected-declarations', evidenceRef:'trainer-original-source-decision-v1:bounded-core-family'},
    definitions:[{id:ID, label:'Trainer advancement', storageScope:'world', choices:[{id:'standard', label:'PTU 1.05 core baseline',
        sourceStatus:'core', eligibility:'eligible', citation:'PTU 1.05 Core SHA256 e5e0371031601c3ad0a04056771c17599a2d8826e5a5102ccd37f9b368108907, pp13,15-16,18-21,461; selected baseline family, not complete gameplay conformance.'}]}],
    bindings:[{id:ID, namespace:'ptu', key:'variant.trainerAdvancement', storageScope:'world', registrationEvidenceRef:'accepted-source-declaration:trainerAdvancement'}]});
function result(status, code, counts, evidence = null, mapping = null, decoding = null, casting = 'unavailable') {
    const capture = status === 'invalid' || status === 'denied' ? null : captureMechanicPreferences(manifest, () => JSON.stringify({
        schemaVersion:1, id:ID, storageScope:'world', stored:mapping ? {state:'present', value:'standard', evidenceRef:'explicit-map:original-to-standard'} :
            {state:'unknown', reason:'incomplete', evidenceRef:null}, effective:unavailable(), default:unavailable()}));
    const out = {schemaVersion:1, kind:'ptu-trainer-advancement-provider-v1', status, issue:code,
        calls:{...counts}, evidenceDiscarded:evidence === null && counts.observation > 0,
        sourceRepresentation:'loaded-model-source-not-disk', atomicity:'not-established',
        mappingStatus:'prospective-unreserved', sourceApproval:'not-assessed',
        evidence, mapping, decoding, casting, capture};
    if (JSON.stringify(out).length > L.outputChars) return freeze({schemaVersion:1, kind:out.kind, status:'invalid',
        issue:'output-limit', calls:{...counts}, evidenceDiscarded:true, evidence:null, mapping:null, capture:null});
    return freeze(out);
}

/**
 * Isolated, synchronous adapter. Both ports are trusted finite functions. Authorization
 * must be established by the caller's trusted authority implementation; callerRef is not
 * a credential and a supplied Boolean never grants access. No global/Foundry API is read.
 * Functions may execute traps/side effects or schedule later work; this utility does not
 * prove purity, universally detect Proxies, cancel work, or enforce a wall-clock limit.
 */
export function captureTrainerAdvancement(requestJson, authorize, observe) {
    const calls = {authority:0, observation:0};
    if (arguments.length !== 3 || typeof authorize !== 'function' || typeof observe !== 'function') return result('invalid', 'arguments-invalid', calls);
    let request;
    try { request = parse(requestJson, L.requestChars, 64, 4); } catch { return result('invalid', 'request-invalid', calls); }
    if (!exact(request, ['schemaVersion', 'namespace', 'key', 'storageScope', 'mechanicId', 'mapping', 'callerRef']) ||
        request.schemaVersion !== 1 || !tuple(request) || request.mechanicId !== ID || !text(request.callerRef) ||
        !exact(request.mapping, ['original']) || request.mapping.original !== 'standard') return result('invalid', 'request-contract', calls);
    freeze(request);
    let authority;
    calls.authority++;
    try { authority = parse(authorize(request), L.authorityChars, 64, 4); } catch { return result('denied', 'authority-unavailable', calls); }
    if (!exact(authority, ['schemaVersion', 'callerRef', 'decision', 'role', 'evidenceRef']) || authority.schemaVersion !== 1 ||
        authority.callerRef !== request.callerRef || authority.decision !== 'authorized' || authority.role !== 'gm' || !text(authority.evidenceRef, 512)) {
        return result('denied', 'authority-not-granted', calls);
    }
    let observation;
    calls.observation++;
    try { observation = parse(observe(request), L.observationChars); } catch { return result('partial', 'observation-unavailable', calls); }
    if (!exact(observation, ['schemaVersion', 'namespace', 'key', 'storageScope', 'registration', 'presence', 'loadedSource', 'decoded', 'effective', 'overrideEvidence', 'consistency']) ||
        observation.schemaVersion !== 1 || !tuple(observation) ||
        !['registration', 'loadedSource', 'decoded', 'effective', 'overrideEvidence'].every(k => ancillary(observation[k])) ||
        !exact(observation.presence, ['state', 'evidenceRef']) || !['present', 'not-loaded', 'unknown'].includes(observation.presence.state) ||
        !(observation.presence.evidenceRef === null || text(observation.presence.evidenceRef, 512)) ||
        (observation.presence.state !== 'unknown' && !text(observation.presence.evidenceRef, 512)) ||
        !exact(observation.consistency, ['status', 'before', 'after', 'evidenceRef']) ||
        !['no-change-detected', 'changed', 'unknown'].includes(observation.consistency.status) ||
        ![observation.consistency.before, observation.consistency.after, observation.consistency.evidenceRef].every(v => v === null || text(v, 512))) {
        return result('partial', 'observation-contract', calls);
    }
    const evidence = {authority, observation};
    const partial = (code, decoding = null, casting = 'unavailable') => result('partial', code, calls, evidence, null, decoding, casting);
    const reg = observation.registration;
    if (reg.availability !== 'available' || !exact(reg.value, ['type', 'scope', 'default', 'choices', 'requiresReload', 'config']) ||
        reg.value.type !== 'String' || reg.value.scope !== 'world' || reg.value.default !== 'original' || reg.value.requiresReload !== true || reg.value.config !== false ||
        !equal(reg.value.choices, MODES)) return partial('registration-unsupported');
    const {presence, loadedSource, decoded, effective, overrideEvidence, consistency} = observation;
    // Missing loaded membership is not database absence. Never feed `absent` to the
    // generic capture interface, so its standard fallback cannot manufacture a mapping.
    if (presence.state !== 'present') return partial('presence-unestablished');
    if (loadedSource.availability !== 'available' || typeof loadedSource.value !== 'string') return partial('source-unavailable');
    let parsed;
    try { parsed = parse(loadedSource.value, L.sourceChars); } catch { return partial('source-decode-invalid'); }
    const decoding = {status:'parsed', value:parsed};
    if (decoded.availability !== 'available' || !equal(parsed, decoded.value)) return partial('decoded-mismatch', decoding);
    if (effective.availability !== 'available') return partial('effective-unavailable', decoding);
    const casting = equal(decoded.value, effective.value) ? 'unchanged-observed' : 'changed-observed';
    if (casting !== 'unchanged-observed') return partial('effective-mismatch', decoding, casting);
    if (overrideEvidence.availability !== 'available' || !exact(overrideEvidence.value, ['status']) || overrideEvidence.value.status !== 'none-reported') return partial('override-unresolved', decoding, casting);
    if (consistency.status !== 'no-change-detected' || !text(consistency.evidenceRef, 512) || !text(consistency.before, 512) ||
        !text(consistency.after, 512) || consistency.before !== consistency.after) return partial('consistency-unresolved', decoding, casting);
    if (decoded.value !== 'original') return partial('physical-value-unmapped', decoding, casting);
    return result('mapped', null, calls, evidence, {mechanicId:ID, physicalValue:'original', canonicalChoice:'standard',
        evidenceRef:'trainer-original-source-decision-v1:explicit-original-map', meaning:'selected-core-baseline-family-not-gameplay-conformance'}, decoding, casting);
}
