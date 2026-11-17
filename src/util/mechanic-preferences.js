import {lookupMechanicChoice} from './rule-versions.js';

// Supplied declarations only: no persistent settings, catalog, Item or application authority.
const scopes = new Set(['world', 'client']);
const sources = new Set(['core', 'official-errata', 'optional-playtest', 'supplement', 'custom', 'synthetic']);
const eligibilities = new Set(['eligible', 'excluded', 'unclassified']);
const reasons = new Set(['not-observed', 'incomplete', 'unreadable']);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit = 128) => typeof value === 'string' && value.length <= limit && value.trim().length > 0;
const exact = (value, keys) => record(value) && Object.keys(value).length === keys.length
    && keys.every(key => Object.hasOwn(value, key));
const lexical = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const copy = value => structuredClone(value);
function freeze(value) {
    if (value !== null && typeof value === 'object') {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}

function blank(mode) {
    return {schemaVersion:1, kind:'ptu-mechanic-preferences-v1', mode, inspectionOnly:true,
        availability:'unavailable', sourceApproval:'not-assessed', input:{rawJson:null, snapshot:null}, current:[],
        choiceProjection:{availability:'unavailable', choices:null},
        preset:{availability:mode === 'current' ? 'not-requested' : 'unavailable', presetId:null, proposals:[]}, issues:[]};
}

// JSON.parse establishes syntax first. This private iterative scan retains original number lexemes
// and decoded object keys without a reviver, evaluation, recursive parsing or last-member winners.
// Root depth is 0. Each JSON value (including a container) is one node; member names are not nodes.
function scan(raw) {
    const tokens = /"(?:[^"\\]|\\[\s\S])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g;
    const stack = [];
    let nodes = 0, duplicate = null, limit = null, number = null;
    const path = segment => [...stack.slice(1).map(frame => frame.segment), ...(segment === undefined ? [] : [segment])];
    for (const match of raw.matchAll(tokens)) {
        const token = match[0], frame = stack.at(-1);
        if (token === '}' || token === ']') { stack.pop(); continue; }
        if (token === ',') {
            if (frame.kind === 'object') frame.keyExpected = true;
            else frame.index++;
            continue;
        }
        if (token === ':') continue;
        if (frame?.kind === 'object' && frame.keyExpected) {
            frame.key = JSON.parse(token);
            if (frame.keys.has(frame.key) && duplicate === null) duplicate = path(frame.key);
            frame.keys.add(frame.key);
            frame.keyExpected = false;
            continue;
        }
        const segment = frame ? frame.kind === 'object' ? frame.key : frame.index : undefined;
        nodes++;
        if ((nodes > 8192 || stack.length > 12) && limit === null) limit = path(segment);
        if (/^-?\d/.test(token)) {
            const magnitude = token.startsWith('-') ? token.slice(1) : token;
            if ((!/^(?:0|-?[1-9][0-9]*)$/.test(token) || magnitude.length > 16
                || magnitude.length === 16 && magnitude > '9007199254740991') && number === null) number = path(segment);
        }
        if (token === '{' || token === '[') stack.push({segment, kind:token === '{' ? 'object' : 'array',
            keyExpected:true, keys:new Set(), key:null, index:0});
    }
    return {duplicate, limit, number};
}

// Every declared bound is input admissibility, including recognized preview fields. Arbitrary
// saved/custom payload strings have only the document bounds, not a choice-token length limit.
function declaredLimit(input) {
    if (!record(input)) return null;
    let failure = null;
    const length = (value, max, path) => {
        if (failure === null && (typeof value === 'string' || Array.isArray(value)) && value.length > max) failure = path;
    };
    if (Array.isArray(input.definitions)) {
        length(input.definitions, 64, ['definitions']);
        input.definitions.forEach((definition, i) => {
            if (!record(definition)) return;
            const p = ['definitions', i];
            length(definition.id, 128, [...p, 'id']); length(definition.label, 256, [...p, 'label']);
            if (!Array.isArray(definition.choices)) return;
            length(definition.choices, 32, [...p, 'choices']);
            definition.choices.forEach((choice, j) => {
                if (!record(choice)) return;
                const c = [...p, 'choices', j];
                length(choice.id, 128, [...c, 'id']); length(choice.label, 256, [...c, 'label']);
                length(choice.citation, 1024, [...c, 'citation']);
            });
        });
    }
    if (Array.isArray(input.observations)) {
        length(input.observations, 256, ['observations']);
        input.observations.forEach((observation, i) => {
            if (!record(observation)) return;
            length(observation.id, 128, ['observations', i, 'id']);
            length(observation.evidenceRef, 1024, ['observations', i, 'evidenceRef']);
        });
    }
    if (Array.isArray(input.presetRequests)) input.presetRequests.forEach((preset, i) => {
        if (!record(preset)) return;
        const p = ['presetRequests', i];
        length(preset.id, 128, [...p, 'id']); length(preset.label, 256, [...p, 'label']);
        if (!Array.isArray(preset.assignments)) return;
        length(preset.assignments, 128, [...p, 'assignments']);
        preset.assignments.forEach((assignment, j) => {
            if (!record(assignment)) return;
            length(assignment.mechanicId, 128, [...p, 'assignments', j, 'mechanicId']);
            length(assignment.value, 128, [...p, 'assignments', j, 'value']);
        });
    });
    return failure;
}

function bucket(rows, key) {
    const groups = new Map();
    rows.forEach((row, index) => {
        if (!record(row) || !text(row[key])) return;
        if (!groups.has(row[key])) groups.set(row[key], []);
        groups.get(row[key]).push(index);
    });
    return groups;
}

function inspect(mode, args) {
    const result = blank(mode);
    const fail = (code, path = []) => { result.issues = [{code, path}]; return freeze(result); };
    if (args.length !== 1) return fail('arguments-invalid');
    const raw = args[0];
    if (typeof raw !== 'string') return fail('input-type');
    if (raw.length > 65536) return fail('input-limit');
    result.input.rawJson = raw;
    let input;
    try { input = JSON.parse(raw); } catch { return fail('json-syntax'); }
    const scanned = scan(raw);
    if (scanned.duplicate !== null) return fail('json-duplicate-member', scanned.duplicate);
    const bound = scanned.limit ?? declaredLimit(input);
    if (bound !== null) return fail('input-limit', bound);
    if (scanned.number !== null) return fail('json-number-invalid', scanned.number);
    result.input.snapshot = input;
    const allowed = ['schemaVersion', 'definitions', 'observations', ...(mode === 'preset-preview' ? ['presetRequests'] : [])];
    if (!record(input) || Object.keys(input).some(key => !allowed.includes(key))) return fail('request-shape');
    if (input.schemaVersion !== 1) return fail('schema-version', ['schemaVersion']);
    for (const field of ['definitions', 'observations']) {
        if (!Array.isArray(input[field])) return fail('request-shape', [field]);
    }

    const issues = [], seenIssues = new Set();
    const issue = (phase, code, path, codes) => {
        const key = JSON.stringify([code, path]);
        if (!seenIssues.has(key)) { seenIssues.add(key); issues.push({phase, code, path}); }
        codes?.add(code);
    };
    const definitionGroups = bucket(input.definitions, 'id'), observationGroups = bucket(input.observations, 'id');
    let malformed = false;
    const definitions = input.definitions.map((definition, i) => {
        let valid = exact(definition, ['id', 'label', 'storageScope', 'choices']) && text(definition.id)
            && text(definition.label, 256) && scopes.has(definition.storageScope) && Array.isArray(definition.choices);
        const codes = new Set(), p = ['definitions', i];
        const choiceValid = [];
        if (record(definition) && Array.isArray(definition.choices)) {
            definition.choices.forEach((choice, j) => {
                choiceValid[j] = exact(choice, ['id', 'label', 'sourceStatus', 'citation', 'eligibility'])
                    && text(choice.id) && text(choice.label, 256) && sources.has(choice.sourceStatus)
                    && text(choice.citation, 1024) && eligibilities.has(choice.eligibility);
                if (!choiceValid[j]) { valid = false; issue(1, 'definition-shape', [...p, 'choices', j], codes); }
            });
            for (const indices of bucket(definition.choices, 'id').values()) if (indices.length > 1) {
                valid = false;
                for (const j of indices) issue(1, 'definition-choice-duplicate', [...p, 'choices', j, 'id'], codes);
            }
            if (definition.choices.filter((choice, j) => choiceValid[j] && choice.id === 'standard'
                && choice.eligibility === 'eligible').length !== 1) {
                valid = false; issue(1, 'definition-standard-missing', [...p, 'choices'], codes);
            }
        }
        if (!valid) { malformed = true; issue(1, 'definition-shape', p, codes); }
        const indices = definitionGroups.get(definition?.id);
        if (indices?.length > 1) issue(1, 'definition-duplicate-id', [...p, 'id'], codes);
        return {valid, value:definition, codes};
    });
    const observations = input.observations.map((observation, i) => {
        const state = observation?.state;
        const conditional = state === 'present' ? ['value'] : ['unknown', 'present-unavailable'].includes(state) ? ['reason'] : [];
        const valid = exact(observation, ['id', 'storageScope', 'state', 'evidenceRef', ...conditional])
            && text(observation.id) && scopes.has(observation.storageScope)
            && (['present', 'absent'].includes(state) ? text(observation.evidenceRef, 1024)
                : ['unknown', 'present-unavailable'].includes(state)
                    && (observation.evidenceRef === null || text(observation.evidenceRef, 1024)) && reasons.has(observation.reason));
        const codes = new Set(), p = ['observations', i];
        if (!valid) { malformed = true; issue(2, 'observation-shape', p, codes); }
        if (observationGroups.get(observation?.id)?.length > 1) issue(2, 'observation-duplicate-id', [...p, 'id'], codes);
        return {valid, value:observation, codes};
    });

    const ids = [...new Set([...definitionGroups.keys(), ...observationGroups.keys()])].sort(lexical);
    const rows = new Map();
    for (const id of ids) {
        const di = definitionGroups.get(id) ?? [], oi = observationGroups.get(id) ?? [];
        const d = di.length === 1 ? definitions[di[0]] : null, o = oi.length === 1 ? observations[oi[0]] : null;
        const codes = new Set([...di.flatMap(i => [...definitions[i].codes]), ...oi.flatMap(i => [...observations[i].codes])]);
        const row = {id, definitionStatus:di.length > 1 ? 'ambiguous' : !d ? 'missing' : d.valid ? 'valid' : 'invalid',
            declaredStorageScope:d && scopes.has(d.value.storageScope) ? d.value.storageScope : null,
            before:{presence:'unknown', availability:'unavailable'}, basicChoice:{status:'not-evaluated', value:null},
            membership:'unavailable', effective:{availability:'unavailable', value:null, origin:'none'},
            provenance:{definitionIndices:[...di], observationIndices:[...oi], choiceIndex:null, evidenceRef:null,
                sourceStatus:null, citation:null, eligibility:null}, issueCodes:[]};
        const p = oi.length ? ['observations', oi[0]] : ['observations'];
        if (!di.length) issue(2, 'mechanic-unregistered', p, codes);
        if (!oi.length) issue(2, 'observation-missing', p, codes);
        const mismatch = o?.valid && row.declaredStorageScope !== null && o.value.storageScope !== row.declaredStorageScope;
        if (mismatch) issue(2, 'observation-scope-mismatch', [...p, 'storageScope'], codes);
        if (o?.valid && !mismatch) {
            row.provenance.evidenceRef = o.value.evidenceRef;
            const state = o.value.state;
            row.before = {presence:state === 'present-unavailable' ? 'present' : state === 'unknown' ? 'unknown' : state,
                availability:['present', 'absent'].includes(state) ? 'available' : 'unavailable'};
            if (state === 'present') row.before.value = copy(o.value.value);
            if (row.before.availability === 'unavailable') issue(2, 'observation-unavailable', p, codes);
        }
        if (row.before.availability === 'available' && (row.before.presence === 'present' || row.definitionStatus === 'valid')) {
            const choices = Object.create(null);
            if (row.before.presence === 'present') choices[id] = copy(row.before.value);
            const basic = lookupMechanicChoice(id, choices);
            row.basicChoice = {status:basic.status, value:basic.value};
            if (basic.status === 'unresolved') {
                row.membership = 'not-applicable'; issue(2, 'value-invalid', [...p, 'value'], codes);
            } else if (row.definitionStatus === 'valid') {
                const index = d.value.choices.findIndex(choice => choice.id === basic.value);
                row.membership = index < 0 ? 'nonmember' : 'member';
                if (index < 0) issue(2, 'choice-not-allowed', [...p, 'value'], codes);
                else {
                    const choice = d.value.choices[index];
                    Object.assign(row.provenance, {choiceIndex:index, sourceStatus:choice.sourceStatus,
                        citation:choice.citation, eligibility:choice.eligibility});
                    if (choice.eligibility !== 'eligible') issue(2, 'choice-ineligible', [...p, 'value'], codes);
                    else row.effective = {availability:'available', value:basic.value,
                        origin:row.before.presence === 'absent' ? 'standard-fallback' : 'stored'};
                }
            }
        }
        row.issueCodes = [...codes].sort(lexical);
        result.current.push(row); rows.set(id, row);
    }
    result.availability = 'available';
    if (!malformed && result.current.every(row => row.effective.availability === 'available')) {
        const choices = Object.create(null);
        for (const row of result.current) choices[row.id] = row.effective.value;
        result.choiceProjection = {availability:'available', choices};
    }
    if (mode === 'preset-preview') previewPreset(input, result, definitions, definitionGroups, rows, issue);
    const positions = path => path.filter(part => typeof part === 'number');
    issues.sort((a, b) => {
        if (a.phase !== b.phase) return a.phase - b.phase;
        const ap = positions(a.path), bp = positions(b.path);
        for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
            if (ap[i] === undefined) return -1;
            if (bp[i] === undefined) return 1;
            if (ap[i] !== bp[i]) return ap[i] - bp[i];
        }
        return lexical(a.code, b.code) || lexical(JSON.stringify(a.path), JSON.stringify(b.path));
    });
    result.issues = issues.map(({code, path}) => ({code, path}));
    return freeze(result);
}

function previewPreset(input, result, definitions, groups, rows, issue) {
    const requests = input.presetRequests, root = ['presetRequests'];
    if (!Array.isArray(requests)) { issue(3, 'presets-shape', root); return; }
    if (!requests.length) { result.preset.availability = 'not-requested'; return; }
    if (requests.length > 1) { issue(3, 'multiple-presets-unsupported', root); return; }
    const request = requests[0], p = [...root, 0];
    if (record(request) && text(request.id)) result.preset.presetId = request.id;
    if (!exact(request, ['id', 'label', 'assignments']) || !text(request.id) || !text(request.label, 256)
        || !Array.isArray(request.assignments)) { issue(3, 'presets-shape', p); return; }
    const duplicates = bucket(request.assignments, 'mechanicId');
    let valid = true;
    request.assignments.forEach((assignment, i) => {
        const a = [...p, 'assignments', i];
        if (!exact(assignment, ['mechanicId', 'value']) || !text(assignment.mechanicId) || !text(assignment.value)) {
            valid = false; issue(3, 'preset-assignment-shape', a);
        }
        if (!record(assignment) || !text(assignment.mechanicId)) return;
        if (duplicates.get(assignment.mechanicId).length > 1) {
            valid = false; issue(3, 'preset-assignment-duplicate', [...a, 'mechanicId']);
        }
        const indices = groups.get(assignment.mechanicId);
        const definition = indices?.length === 1 ? definitions[indices[0]] : null;
        if (!indices) { valid = false; issue(3, 'preset-mechanic-unregistered', [...a, 'mechanicId']); }
        else if (!definition?.valid) { valid = false; issue(3, 'preset-definition-unavailable', [...a, 'mechanicId']); }
        else if (text(assignment.value)) {
            const choice = definition.value.choices.find(choice => choice.id === assignment.value);
            if (!choice) { valid = false; issue(3, 'preset-choice-not-allowed', [...a, 'value']); }
            else if (choice.eligibility !== 'eligible') { valid = false; issue(3, 'preset-choice-ineligible', [...a, 'value']); }
        }
    });
    if (!valid) return;
    result.preset.availability = 'available';
    result.preset.proposals = request.assignments.map((assignment, i) => {
        const row = rows.get(assignment.mechanicId), available = row.before.availability === 'available';
        const same = available && row.before.presence === 'present' && row.before.value === assignment.value;
        const disposition = !available ? 'blocked' : row.before.presence === 'absent' ? 'proposed' : same ? 'same' : 'conflict';
        const codes = new Set();
        if (disposition === 'blocked') issue(3, 'preset-before-unavailable', [...p, 'assignments', i], codes);
        if (disposition === 'conflict') issue(3, 'preset-explicit-conflict', [...p, 'assignments', i], codes);
        return {mechanicId:assignment.mechanicId, before:copy(row.before),
            proposed:{presence:'present', availability:'available', value:assignment.value}, disposition,
            storedWouldDiffer:available ? !same : null,
            preferenceWouldDiffer:row.effective.availability === 'available' ? row.effective.value !== assignment.value : null,
            issueCodes:[...codes].sort(lexical)};
    }).sort((a, b) => lexical(a.mechanicId, b.mechanicId));
}

/** Inspect only explicitly supplied serialized storage evidence; never capture or write settings. */
export function inspectMechanicPreferences(requestJson) { return inspect('current', arguments); }

/** Preview one advisory preset; no update payload, application or precedence policy. */
export function previewMechanicPreset(requestJson) { return inspect('preset-preview', arguments); }
