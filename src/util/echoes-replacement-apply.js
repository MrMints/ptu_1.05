import {planEchoesReplacement} from './echoes-replacement-plan.js';

const byPort = new WeakMap();
const MAX_JSON = 1048576;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const token = value => typeof value === 'string' && value.length > 0 && value.length <= 256;

function exact(value, keys) {
    return record(value) && Object.keys(value).length === keys.length
        && keys.every(key => Object.hasOwn(value, key));
}

function sameJson(actual, expected) {
    if (actual === expected) return true;
    if (Array.isArray(expected)) {
        return Array.isArray(actual) && actual.length === expected.length
            && expected.every((value, index) => sameJson(actual[index], value));
    }
    return record(expected) && record(actual) && Object.keys(actual).length === Object.keys(expected).length
        && Object.keys(expected).every(key => Object.hasOwn(actual, key) && sameJson(actual[key], expected[key]));
}

function parseHostJson(value) {
    if (typeof value !== 'string' || value.length > MAX_JSON || new TextEncoder().encode(value).length > MAX_JSON) {
        throw new TypeError('invalid-host-json');
    }
    const parsed = JSON.parse(value);
    // Host serialization is compact, lossless JSON. Reject duplicate keys and numbers
    // that the parser would silently coerce before comparing snapshot values.
    if (JSON.stringify(parsed) !== value) throw new TypeError('invalid-host-json');
    return parsed;
}

function outcome(status, reason, writeAttempts = 0, confirmedWrites = 0, verifiedApplications = 0) {
    return {status, reason, writeAttempts, confirmedWrites, verifiedApplications};
}

function exclusionsAffirmed(value) {
    const keys = ['callbacksExcluded', 'combatExcluded', 'recalculationExcluded',
        'retargetingUnnecessary', 'selectedItemOnly'];
    return exact(value, keys) && keys.every(key => value[key] === true);
}

function copyField(destination, source, key) {
    if (Object.hasOwn(source, key)) destination[key] = source[key];
    else delete destination[key];
}

function prepare(request, plan) {
    const {before, selection, approved} = request;
    const row = before.items.find(item => item.id === selection.itemId);
    const source = JSON.parse(row.source.valueJson);
    const {itemJson, mapping} = approved[selection.targetRole];
    const definition = JSON.parse(itemJson);
    const selected = source.flags?.ptu?.selectedVersion;
    const createsSelection = selected == null;
    if (createsSelection && !plan.bindings.requiredAcknowledgements.includes('selection-created')) {
        throw new TypeError('selection-creation-unreviewed');
    }

    // The planner has accepted these containers. Existing objects keep all other members.
    for (const key of ['effect', 'prerequisites', 'frequency']) copyField(source.system, definition.system, key);
    copyField(source.system.source, definition.system.source, 'value');
    source._stats ??= {};
    source._stats.compendiumSource = mapping.documentUuid;
    source.flags ??= {};
    source.flags.ptu ??= {};
    const {id, label} = mapping.version;
    source.flags.ptu.selectedVersion = typeof selected === 'string' ? id : {...selected, id, label};

    const nextSourceJson = JSON.stringify(source);
    const target = {role: selection.targetRole, itemJson, mapping: structuredClone(mapping), createsSelection};
    return {nextSourceJson, target};
}

function readBackMatches(value, request, nextSourceJson) {
    const {actor, membership, items} = request.before;
    const fresh = parseHostJson(value);
    if (!exact(fresh, ['actor', 'membership', 'items', 'history'])
        || !sameJson(fresh.actor, actor) || !sameJson(fresh.membership, membership)
        || !sameJson(fresh.history, request.history) || !Array.isArray(fresh.items)
        || fresh.items.length !== items.length) return false;

    const rows = new Map(fresh.items.map(row => [row?.id, row]));
    return items.every(row => {
        const current = rows.get(row.id);
        if (!exact(current, ['id', 'uuid', 'type', 'coverage', 'source'])
            || current.uuid !== row.uuid || current.type !== row.type || current.coverage !== row.coverage) return false;
        if (row.source.state !== 'present') return sameJson(current.source, row.source);
        if (!exact(current.source, ['state', 'valueJson']) || current.source.state !== 'present') return false;
        const expected = row.id === request.selection.itemId ? nextSourceJson : row.source.valueJson;
        return sameJson(parseHostJson(current.source.valueJson), JSON.parse(expected));
    });
}

function reconcile(actor, reason, attempts, writes) {
    actor.uncertain = true;
    return outcome('reconciliation-required', reason, attempts, writes);
}

async function saveAndVerify(port, actor, request, operationId, revisionToken, admissionToken, nextSourceJson) {
    const {selection} = request;
    const conditionalSave = port.conditionalSave.bind(port);
    let receiptToken;
    try {
        const saved = await conditionalSave({selection, operationId, revisionToken, admissionToken, nextSourceJson});
        if (exact(saved, ['status', 'writes']) && saved.writes === 0
            && (saved.status === 'stale' || saved.status === 'refused')) {
            return outcome(saved.status, 'conditional-zero-write', 1);
        }
        if (!exact(saved, ['status', 'writes', 'receiptToken']) || saved.status !== 'committed'
            || saved.writes !== 1 || !token(saved.receiptToken)) {
            return reconcile(actor, 'save-outcome-unknown', 1, 'unknown');
        }
        receiptToken = saved.receiptToken;
    } catch {
        return reconcile(actor, 'save-outcome-unknown', 1, 'unknown');
    }

    try {
        const fresh = await port.readBack({selection, receiptToken});
        if (exact(fresh, ['status', 'snapshotJson']) && fresh.status === 'ready') {
            if (readBackMatches(fresh.snapshotJson, request, nextSourceJson)) {
                return outcome('applied', 'verified-readback', 1, 1, 1);
            }
            return reconcile(actor, 'readback-mismatch', 1, 1);
        }
    } catch {
        // A committed write still requires reconciliation when fresh evidence is unavailable.
    }
    return reconcile(actor, 'readback-unavailable', 1, 1);
}

async function applyCaptured(port, actor, request, reviewedRequestJson, plan, captured) {
    const {selection, before, context, history} = request;
    let snapshot;
    try {
        snapshot = parseHostJson(captured.snapshotJson);
    } catch {
        return outcome('refused', 'capture-invalid');
    }
    if (!sameJson(snapshot, {before, context, history})) return outcome('stale', 'capture-mismatch');
    if (plan.status === 'cancelled') return outcome('cancelled', 'request-cancelled');
    if (plan.status === 'no-change') return outcome('no-change', 'capture-matched');

    const {nextSourceJson, target} = prepare(request, plan);
    const {operationId, revisionToken} = captured;
    const createsSelection = target.createsSelection;
    const admission = await port.authorize({selection, operationId, revisionToken, reviewedRequestJson, nextSourceJson, target});
    if (exact(admission, ['status'])) {
        switch (admission.status) {
            case 'cancelled': return outcome('cancelled', 'host-cancelled');
            case 'denied': return outcome('refused', 'host-denied');
            case 'review-required': return outcome('review-required', 'host-review-required');
        }
    }
    if (!exact(admission, ['status', 'admissionToken', 'exclusions', 'selectionCreationConfirmed'])
        || admission.status !== 'admitted' || !token(admission.admissionToken)
        || typeof admission.selectionCreationConfirmed !== 'boolean') {
        return outcome('refused', 'admission-invalid');
    }
    if (!exclusionsAffirmed(admission.exclusions)) return outcome('refused', 'unsupported-context');
    if (createsSelection && admission.selectionCreationConfirmed !== true) {
        return outcome('review-required', 'selection-creation-unconfirmed');
    }
    return saveAndVerify(port, actor, request, operationId, revisionToken, admission.admissionToken, nextSourceJson);
}

/**
 * Apply the exact reviewed replacement through an independently enforcing host.
 * The stable port must issue operation IDs, hold admission and compare-and-save
 * in one critical section, and supply fresh readback. No fallback writer exists.
 */
export async function applyEchoesReplacement(inputJson, applicationPort) {
    if (!record(applicationPort)) return outcome('refused', 'port-unavailable');

    let plan;
    let request;
    try {
        plan = planEchoesReplacement(inputJson);
        if (plan.status === 'refused') return outcome('refused', 'planner-refused');
        request = JSON.parse(inputJson);
        Object.freeze(request.selection);
    } catch {
        return outcome('refused', 'planner-refused');
    }

    let state = byPort.get(applicationPort);
    if (!state) {
        state = {actors: new Map(), operations: new Map()};
        byPort.set(applicationPort, state);
    }
    const {actorUuid, itemUuid} = request.selection;
    let actor = state.actors.get(actorUuid);
    if (!actor) {
        actor = {busy: false, uncertain: false};
        state.actors.set(actorUuid, actor);
    }
    if (actor.uncertain) return reconcile(actor, 'prior-uncertainty', 0, 0);
    if (actor.busy) return outcome('refused', 'operation-in-flight');
    if (plan.status === 'review-required') return outcome('review-required', 'planner-review-required');
    if (!['conditional-plan', 'no-change', 'cancelled'].includes(plan.status)) return outcome('refused', 'planner-refused');

    actor.busy = true;
    let entry;
    let result;
    try {
        const port = applicationPort;
        if (!['capture', 'authorize', 'conditionalSave', 'readBack'].every(key => typeof port[key] === 'function')) {
            return outcome('refused', 'port-unavailable');
        }

        const response = await port.capture({selection: request.selection});
        if (exact(response, ['status']) && response.status === 'reconciliation-required') {
            return reconcile(actor, 'host-reconciliation-required', 0, 0);
        }
        if (exact(response, ['status']) && response.status === 'unavailable') return outcome('refused', 'capture-unavailable');
        if (!exact(response, ['status', 'operationId', 'revisionToken', 'snapshotJson', 'operationState'])
            || response.status !== 'ready' || !token(response.operationId) || !token(response.revisionToken)
            || response.operationState !== 'clear') {
            return outcome('refused', 'capture-invalid');
        }
        const captured = {operationId: response.operationId, revisionToken: response.revisionToken, snapshotJson: response.snapshotJson};
        const previous = state.operations.get(captured.operationId);
        if (previous) {
            if (previous.actorUuid !== actorUuid || previous.itemUuid !== itemUuid || previous.requestJson !== inputJson) {
                return outcome('refused', 'operation-id-conflict');
            }
            if (!previous.result) return outcome('refused', 'operation-in-flight');
            return {...outcome('duplicate', 'historical-disposition'), historical: {...previous.result}};
        }
        entry = {actorUuid, itemUuid, requestJson: inputJson, result: null};
        state.operations.set(captured.operationId, entry);
        result = await applyCaptured(port, actor, request, inputJson, plan, captured);
        return result;
    } catch {
        result = outcome('refused', 'pre-save-unavailable');
        return result;
    } finally {
        if (entry) entry.result = Object.freeze({...result});
        actor.busy = false;
    }
}
