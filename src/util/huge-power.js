import {HUGE_POWER_ADMISSIONS, HUGE_POWER_CONTRIBUTORS, HUGE_POWER_PREPARATIONS} from './huge-power-bindings.js';
import {getDocumentSourceId} from './document-source.js';

export const HUGE_POWER_ENABLED = HUGE_POWER_ADMISSIONS.length > 0;
const contexts = new WeakMap();
const invalidRules = new WeakSet();
const tickets = new WeakMap();
const PATH = 'system.modifiers.baseStats.atk.mod';
const stages = Object.freeze(['core', 'hooks', 'derived', 'initiative', 'origins', 'refresh']);
const fields = Object.freeze(['key', 'mode', 'path', 'phase', 'value', 'priority', 'predicate', 'ignored']);
const finite = n => typeof n === 'number' && Number.isFinite(n);
// Pure qualification only. Never resolve a disabled producer to prove its domain.
const supportedValue = value => finite(value) || value === '5 + floor(@actor.system.level.current / 10)';
const plain = value => JSON.parse(JSON.stringify(value));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function freeze(value) {
    if (value && typeof value === 'object') {
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
}
function invalidate(context, reason) {
    if (!context) return;
    context.valid = false;
    if (context.reasons.length < 16 && !context.reasons.includes(reason)) context.reasons.push(reason);
}
function actorOf(value) { try { return value?.actor; } catch { return undefined; } }
function safely(actor, fn) {
    if (!HUGE_POWER_ENABLED) return;
    const context = contexts.get(actor);
    if (!context) return;
    try { return fn(context); } catch { invalidate(context, 'observer-failure'); }
}
function semantics(source) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
    if (Object.keys(source).some(key => !fields.includes(key) && key !== 'label')) return null;
    return fields.map(key => [key, source[key] ?? (key === 'predicate' ? [] : key === 'ignored' ? false : null)]);
}
function identity(item) {
    // Missing provenance may use the other representation. Present malformed
    // provenance, including falsy values, must never become fallback authority.
    const field = (record, key) => {
        if (record === undefined || record === null) return {present: false, valid: true};
        if (typeof record !== 'object' || Array.isArray(record)) return {present: true, valid: false};
        if (!(key in record)) return {present: false, valid: true};
        const value = record[key];
        return {present: true, valid: typeof value === 'string' && value.length > 0, value};
    };
    const modern = field(item?._stats, 'compendiumSource');
    const legacy = field(item?.flags?.core, 'sourceId');
    if (!modern.valid || !legacy.valid || (modern.present && legacy.present && modern.value !== legacy.value)) return null;
    const source = getDocumentSourceId(item);
    const version = item?.flags?.ptu?.selectedVersion?.id;
    return typeof source === 'string' && source.length > 0 && typeof version === 'string' && version.length > 0 ? {source, version} : null;
}
const descriptorKeys = Object.freeze(['value', 'get', 'set', 'writable', 'enumerable', 'configurable']);
function sameDescriptor(actual, expected) {
    return Boolean(actual && expected) && descriptorKeys.every(key => actual[key] === expected[key]);
}
function inventoryMatches(object, descriptors) {
    if (!Object.isFrozen(descriptors)) return false;
    const keys = Reflect.ownKeys(object);
    return keys.length === descriptors.length && descriptors.every(([key, descriptor]) =>
        keys.includes(key) && Object.isFrozen(descriptor) && sameDescriptor(Object.getOwnPropertyDescriptor(object, key), descriptor));
}
function profileMatches(receiver, profile, allowActorCallback = false) {
    if (!receiver || !Object.isFrozen(profile) || !Object.isFrozen(profile.chain) || profile.chain.length === 0) return false;
    let prototype = Object.getPrototypeOf(receiver);
    const inheritedCallbacks = new Set();
    for (const [expectedPrototype, descriptors] of profile.chain) {
        if (prototype !== expectedPrototype || !Object.isFrozen(descriptors)) return false;
        const keys = Reflect.ownKeys(prototype);
        if (keys.length !== descriptors.length) return false;
        for (const [key, descriptor] of descriptors) {
            if (!keys.includes(key) || !Object.isFrozen(descriptor) ||
                !sameDescriptor(Object.getOwnPropertyDescriptor(prototype, key), descriptor)) return false;
            if (typeof descriptor.value === 'function' || descriptor.get || descriptor.set) inheritedCallbacks.add(key);
        }
        prototype = Object.getPrototypeOf(prototype);
    }
    if (prototype !== null) return false;
    // The closed synthetic Actor profile may bind only its constructor-created
    // debounce field. Item and Rule profiles retain the no-own-callback rule.
    const ownCallbacks = profile.ownCallbacks;
    if (!Array.isArray(ownCallbacks) || !Object.isFrozen(ownCallbacks) ||
        ownCallbacks.length !== (allowActorCallback ? 1 : 0)) return false;
    for (const row of ownCallbacks) {
        if (!Object.isFrozen(row) || row.length !== 2) return false;
        const [key, expected] = row;
        if (key !== 'debouncedUpdate' || inheritedCallbacks.has(key) || !Object.isFrozen(expected) ||
            typeof expected.value !== 'function' || expected.get || expected.set ||
            !sameDescriptor(Object.getOwnPropertyDescriptor(receiver, key), expected)) return false;
    }
    // Deletion, replacement and accessor substitutions are rejected above;
    // unrelated own callbacks and nonfunction shadows remain rejected here.
    return Reflect.ownKeys(receiver).every(key => {
        const descriptor = Object.getOwnPropertyDescriptor(receiver, key);
        if (ownCallbacks.some(([name]) => name === key)) return true;
        return !inheritedCallbacks.has(key) && typeof descriptor.value !== 'function' && !descriptor.get && !descriptor.set;
    });
}
function modelMatches(actor, model) {
    // No native model is shipped. A synthetic profile binds complete Actor,
    // Item and Rule prototype/descriptor inventories, not only select methods.
    if (!Object.isFrozen(model) || model.kind !== 'synthetic-closed-preparation-v2' ||
        !Object.isFrozen(model.dependencies) || !Object.isFrozen(model.objects) ||
        !profileMatches(actor, model.actorProfile, true) ||
        !model.dependencies.every(([object, key, value]) => object[key] === value) ||
        !model.objects.every(([object, descriptors]) => inventoryMatches(object, descriptors))) return false;
    const items = Array.from(actor.items?.contents ?? actor.items ?? []);
    return items.every(item => profileMatches(item, model.itemProfile) &&
        (item.rules ?? []).every(rule => profileMatches(rule, model.ruleProfile)));
}
export function beginHugePowerPreparation(actor) {
    if (!HUGE_POWER_ENABLED) return null;
    try {
        const previous = contexts.get(actor);
        if (previous?.active) { invalidate(previous, 'reentrant-preparation'); return null; }
        const model = HUGE_POWER_PREPARATIONS.find(candidate => modelMatches(actor, candidate));
        if (!model || actor.type !== 'pokemon') return null;
        const context = {token: Object.freeze({}), model, active: true, valid: true,
            records: [], receipts: [], reasons: [], stage: 0, phase: false, snapshot: null};
        contexts.set(actor, context);
        return context.token;
    } catch { return null; }
}
export function markHugePowerStage(actor, token, stage) {
    if (!HUGE_POWER_ENABLED || !token) return;
    safely(actor, context => {
        if (context.token !== token || stages[context.stage++] !== stage || !modelMatches(actor, context.model))
            invalidate(context, 'incomplete-preparation-interval');
    });
}
export function openHugePowerApplyPhase(actor) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actor, context => {
        if (!context.active || context.phase) { invalidate(context, 'repeated-apply-phase'); return; }
        context.phase = true;
        const atk = actor.system.modifiers.baseStats.atk;
        context.initial = freeze(plain({value: atk.value, mod: atk.mod, level: actor.system.level.current}));
        if (atk.value !== 0 || atk.mod !== 0 || !finite(context.initial.level)) invalidate(context, 'unclassified-initial-contribution');
    });
}
export function captureHugePowerRule(item, sourceIndex, source, constructor) {
    if (!HUGE_POWER_ENABLED) return null;
    return safely(actorOf(item), context => {
        if (!context.active || context.phase) { invalidate(context, 'unexpected-construction-phase'); return null; }
        const id = identity(item);
        const rawRules = item.system.rules.map(semantics);
        const matches = [...HUGE_POWER_ADMISSIONS, ...HUGE_POWER_CONTRIBUTORS].filter(row =>
            id && row.source === id.source && row.version === id.version && row.index === sourceIndex && equal(row.rules, rawRules));
        const row = matches.length === 1 ? matches[0] : null;
        const record = {item, sourceIndex, uuid: item.uuid, identity: id, raw: freeze(plain(semantics(source))),
            rules: freeze(plain(rawRules)), row, constructor, rule: null, valid: false, predicate: undefined, calls: 0};
        context.records.push(record);
        if (!row || constructor !== context.model.ruleClass || rawRules.some(value => value === null)) invalidate(context, 'unmapped-or-custom-rule');
        return record;
    });
}
export function noteHugePowerValidity(rule, actorValid, itemValid, dataValid) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actorOf(rule), context => {
        const record = context.records.find(row => row.item === rule.item && row.sourceIndex === rule.sourceIndex && row.rule === null);
        if (!record) { invalidate(context, 'missing-construction-capture'); return; }
        record.rule = rule;
        record.valid = actorValid === true && itemValid === true && dataValid === true &&
            !invalidRules.has(rule) && record.raw?.find(([key]) => key === 'ignored')?.[1] === false;
        if (!record.valid) invalidate(context, 'invalid-construction');
    });
}
export function finishHugePowerRule(item, record, rule) {
    if (!HUGE_POWER_ENABLED || !record) return;
    safely(actorOf(item), context => {
        if (!rule || record.rule !== rule || rule.constructor !== context.model.ruleClass || !record.valid ||
            !profileMatches(rule, context.model.ruleProfile))
            invalidate(context, 'construction-did-not-complete');
        record.constructed = Boolean(rule && record.rule === rule);
    });
}
export function invalidateHugePowerRule(rule) {
    if (!HUGE_POWER_ENABLED) return;
    invalidRules.add(rule);
    try { safely(actorOf(rule), context => invalidate(context, 'rule-validation-failure')); } catch { /* no change to ordinary validation */ }
}
export function observeHugePowerPredicate(rule, result) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actorOf(rule), context => {
        const record = context.records.find(row => row.rule === rule);
        if (!record) { invalidate(context, 'unrecorded-predicate'); return; }
        record.predicate = result;
        if (result !== true) invalidate(context, 'predicate-not-true');
    });
}
export function beginHugePowerAE(rule) {
    if (!HUGE_POWER_ENABLED) return null;
    return safely(actorOf(rule), context => {
        const record = context.records.find(row => row.rule === rule);
        if (!context.active || !context.phase || !record) { invalidate(context, 'unaccounted-producer'); return null; }
        record.calls++;
        const receipt = {record, written: false, logged: false};
        context.receipts.push(receipt);
        if (rule.phase !== 'applyAEs' || rule.mode !== 'add' || rule.path !== PATH || record.calls !== 1)
            invalidate(context, 'unsupported-producer-domain');
        return receipt;
    });
}
export function noteHugePowerAE(rule, receipt, event, values = null) {
    if (!HUGE_POWER_ENABLED || !receipt) return;
    safely(actorOf(rule), context => {
        if (event === 'resolved') {
            Object.assign(receipt, values);
            if (receipt.path !== PATH || ![receipt.current, receipt.change, receipt.result].every(finite) ||
                receipt.result !== receipt.current + receipt.change) invalidate(context, 'non-additive-or-nonfinite');
            const rawValue = receipt.record.raw.find(([key]) => key === 'value')[1];
            if (!supportedValue(rawValue)) invalidate(context, 'unproven-expression-read-set');
        } else if (event === 'written') receipt.written = true;
        else if (event === 'logged') receipt.logged = true;
        else invalidate(context, event);
    });
}
export function endHugePowerAE(rule, receipt) {
    if (!HUGE_POWER_ENABLED || !receipt) return;
    safely(actorOf(rule), context => {
        if (!receipt.written || !receipt.logged || receipt.record.predicate !== true || invalidRules.has(rule))
            invalidate(context, 'incomplete-producer-receipt');
    });
}
export function rememberHugePowerStats(actor, args, ordinary, calculate) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actor, context => {
        if (!context.active || !context.phase || calculate !== context.model.calculateStatTotal) {
            invalidate(context, 'out-of-band-derived-calculation'); return;
        }
        if (args.twistedPower || actor.rollOptions?.all?.['pokeedge:hybrid-attacker']) invalidate(context, 'unreviewed-transform');
        context.snapshot = freeze({args: plain(args), ordinary: plain(ordinary), currentLevel: actor.system.level.current});
    });
}
// A real Pokemon derived interval has eager consumers of final Attack. Keep
// their ordinary output private until the complete Actor interval is proven.
// These descriptors describe plain data in the closed preparation model, not a
// native Foundry/DataModel admission. Accessors and unexplained state fall back.
function dataDescriptor(object, key, writable = false) {
    const descriptor = object && Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value') ||
        (writable && descriptor.writable !== true)) throw Error('Unsupported derived data property');
    return descriptor;
}
function captureDerivedTree(root) {
    const seen = new Set(); let fields = 0;
    function capture(value, depth = 0) {
        if (value === null || ['string', 'boolean'].includes(typeof value) || finite(value))
            return Object.freeze({scalar: true, value});
        if (!value || typeof value !== 'object' || depth > 12 || seen.has(value) || seen.size >= 256)
            throw Error('Unsupported derived data graph');
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null)
            throw Error('Unsupported derived data prototype');
        seen.add(value);
        const keys = Reflect.ownKeys(value);
        if ((fields += keys.length) > 2048 || keys.some(key => typeof key !== 'string'))
            throw Error('Unsupported derived data inventory');
        const properties = keys.map(key => {
            const descriptor = dataDescriptor(value, key);
            return Object.freeze({key, descriptor: Object.freeze({...descriptor}), child: capture(descriptor.value, depth + 1)});
        });
        // Do not recursively freeze or mutate the live ordinary result.
        return Object.freeze({scalar: false, object: value, prototype, properties: Object.freeze(properties)});
    }
    return capture(root);
}
function derivedTreeMatches(value, snapshot) {
    if (snapshot.scalar) return Object.is(value, snapshot.value);
    if (value !== snapshot.object || Object.getPrototypeOf(value) !== snapshot.prototype) return false;
    const keys = Reflect.ownKeys(value);
    return keys.length === snapshot.properties.length && snapshot.properties.every(row =>
        keys.includes(row.key) && sameDescriptor(Object.getOwnPropertyDescriptor(value, row.key), row.descriptor) &&
        derivedTreeMatches(row.descriptor.value, row.child));
}
export function beginHugePowerPokemonDerived(actor) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actor, context => {
        const count = (context.pokemonDerivedCount ?? 0) + 1;
        context.pokemonDerivedCount = count;
        context.pokemonDerived = null;
        context.snapshot = null;
        if (!context.active || !context.phase || !((count === 1 && context.stage === 0) || (count === 2 && context.stage === 2)))
            invalidate(context, 'incomplete-pokemon-derived');
    });
}
export function finishHugePowerPokemonDerived(actor) {
    if (!HUGE_POWER_ENABLED) return;
    safely(actor, context => {
        if (!context.active || !context.snapshot || !context.pokemonDerivedCount) {
            invalidate(context, 'incomplete-pokemon-derived'); return;
        }
        try {
            const system = dataDescriptor(actor, 'system').value;
            const stats = dataDescriptor(system, 'stats', true);
            const contests = dataDescriptor(system, 'contests');
            context.pokemonDerived = Object.freeze({system, stats: Object.freeze({...stats}),
                contests: Object.freeze({...contests}), statsTree: captureDerivedTree(stats.value),
                contestTree: captureDerivedTree(contests.value), stage: context.stage});
        } catch { invalidate(context, 'unsupported-pokemon-derived-state'); }
    });
}
function pokemonDerivedSnapshot(actor, context) {
    if (context.pokemonDerivedCount === undefined) return null; // Earlier closed helper-only model.
    const snapshot = context.pokemonDerived;
    if (context.pokemonDerivedCount !== 2 || !snapshot || snapshot.stage !== 2) {
        invalidate(context, 'incomplete-pokemon-derived'); return null;
    }
    const system = dataDescriptor(actor, 'system').value;
    if (system !== snapshot.system || !sameDescriptor(Object.getOwnPropertyDescriptor(system, 'stats'), snapshot.stats) ||
        !sameDescriptor(Object.getOwnPropertyDescriptor(system, 'contests'), snapshot.contests) ||
        !derivedTreeMatches(snapshot.stats.value, snapshot.statsTree) || !derivedTreeMatches(snapshot.contests.value, snapshot.contestTree)) {
        invalidate(context, 'late-pokemon-derived-change'); return null;
    }
    return snapshot;
}
function pokemonCandidateUpdate(actor, context, candidate) {
    const snapshot = pokemonDerivedSnapshot(actor, context);
    if (!snapshot) return null;
    const expected = plain(context.snapshot.ordinary.stats), actual = plain(candidate.stats);
    delete expected.atk.value; delete expected.atk.total;
    delete actual.atk.value; delete actual.atk.total;
    if (!equal(actual, expected) || candidate.pointsSpend !== context.snapshot.ordinary.pointsSpend ||
        !finite(candidate.stats.atk.value) || !finite(candidate.stats.atk.total)) {
        invalidate(context, 'unexpected-pokemon-candidate'); return null;
    }
    const field = (object, key) => dataDescriptor(object, key).value;
    const contests = snapshot.contests.value;
    const cool = field(field(contests, 'stats'), 'cool');
    const stats = field(cool, 'stats'), poffins = field(cool, 'poffins');
    const value = dataDescriptor(stats, 'value', true), total = dataDescriptor(stats, 'total', true), dice = dataDescriptor(cool, 'dice', true);
    const mod = field(stats, 'mod'), poffinValue = field(poffins, 'value'), poffinMod = field(poffins, 'mod');
    const poffinTotal = field(poffins, 'total'), voltage = field(field(contests, 'voltage'), 'value');
    const ordinaryValue = Math.min(Math.floor(context.snapshot.ordinary.stats.atk.total / 10), 3);
    if (![value.value, total.value, dice.value, mod, poffinValue, poffinMod, poffinTotal, voltage].every(finite) ||
        value.value !== ordinaryValue || total.value !== Math.min(ordinaryValue + mod, 3) ||
        poffinTotal !== poffinValue + poffinMod || dice.value !== total.value + poffinTotal + voltage) {
        invalidate(context, 'unsupported-pokemon-derived-state'); return null;
    }
    const nextValue = Math.min(Math.floor(candidate.stats.atk.total / 10), 3);
    const nextTotal = Math.min(nextValue + mod, 3);
    return {stats, cool, value: nextValue, total: nextTotal, dice: nextTotal + poffinTotal + voltage};
}

export function selectHugePowerBase(ticket, ordinary) {
    if (!HUGE_POWER_ENABLED || !ticket) return ordinary;
    const selection = tickets.get(ticket);
    if (!selection || !selection.context.valid || !selection.context.active) return ordinary;
    return selection.attack;
}
export function completeHugePowerPreparation(actor, token, disabledPredicate) {
    if (!HUGE_POWER_ENABLED || !token) return;
    safely(actor, context => {
        if (context.token !== token) { invalidate(context, 'stale-preparation-token'); return; }
        try {
            if (context.stage !== stages.length || !modelMatches(actor, context.model) || !context.snapshot || !context.phase)
                invalidate(context, 'final-domain-not-established');
            if (!context.valid) return;
            // Reject late descriptors before the existing code reads or
            // serializes live stats. Candidate publication rechecks them below.
            if (context.pokemonDerivedCount !== undefined && !pokemonDerivedSnapshot(actor, context)) return;
            const owned = Array.from(actor.items?.contents ?? actor.items ?? []);
            const expectedCount = owned.reduce((count, item) => count + (item.system.rules?.length ?? 0), 0);
            if (expectedCount !== context.records.length || context.records.some(record => !owned.includes(record.item) || record.item.actor !== actor)) {
                invalidate(context, 'unaccounted-rule-inventory'); return;
            }
            const managed = context.records.filter(record => HUGE_POWER_ADMISSIONS.includes(record.row));
            if (managed.length !== 1) { invalidate(context, 'ambiguous-managed-slot'); return; }
            const selected = managed[0];
            for (const record of context.records) {
                const rule = record.rule;
                if (!record.constructed || !record.valid || invalidRules.has(rule) || rule.invalid !== false ||
                    record.item.uuid !== record.uuid || !equal(identity(record.item), record.identity) ||
                    !equal(record.item.system.rules.map(semantics), record.rules) ||
                    rule.test !== context.model.ruleTest || rule.apply !== context.model.ruleApply ||
                    rule.resolveValue !== context.model.resolveValue || rule.resolveInjectedProperties !== context.model.resolveInjectedProperties)
                    invalidate(context, 'binding-or-validity-changed');
                if (!rule || rule.phase !== 'applyAEs' || rule.mode !== 'add' || rule.path !== PATH || rule.predicate.length !== 0)
                    invalidate(context, 'unsupported-rule-shape');
                if (record.item.enabled) {
                    if (rule.ignored || record.calls !== 1 || record.predicate !== true) invalidate(context, 'missing-enabled-observation');
                } else {
                    if (record !== selected || record.row.mode !== 'february' || record.calls !== 0 || !rule.ignored)
                        invalidate(context, 'unsupported-disabled-rule');
                    // This branch deliberately has no ordinary resolved receipt.
                    // Qualify the captured value/read set without coercion or evaluation.
                    const rawValue = record.raw?.find(([key]) => key === 'value')?.[1];
                    if (!supportedValue(rawValue)) invalidate(context, 'unproven-disabled-value-read-set');
                }
            }
            if (!context.valid) return;
            const snapshot = context.snapshot;
            if (snapshot.currentLevel !== context.initial.level || actor.system.level.current !== snapshot.currentLevel ||
                !equal(actor.system.stats, snapshot.ordinary.stats) || !equal(actor.system.modifiers.baseStats, snapshot.args.baseStatModifier))
                invalidate(context, 'late-input-or-output-change');
            const atk = actor.system.modifiers.baseStats.atk;
            let ordinaryMod = 0, vitamin = 0, trainer = 0;
            for (const receipt of context.receipts) {
                if (receipt.current !== ordinaryMod) invalidate(context, 'unexplained-write-order');
                ordinaryMod = receipt.result;
                if (receipt.record === selected) continue;
                if (receipt.record.row.category === 'vitamin') vitamin += receipt.change;
                else if (receipt.record.row.category === 'trainer') trainer += receipt.change;
                else invalidate(context, 'unclassified-contributor');
            }
            if (atk.value !== 0 || atk.mod !== ordinaryMod || atk.total !== ordinaryMod) invalidate(context, 'unexplained-final-aggregate');
            if (!context.valid) return;
            if (!selected.item.enabled) {
                // Empty, real predicate is phase-stable; do not manufacture enabled options.
                if (disabledPredicate !== context.model.predicatePrimitive || disabledPredicate(selected.rule) !== true)
                    invalidate(context, 'disabled-predicate-not-true');
            }
            if (!context.valid) return;
            const base = snapshot.ordinary.stats.atk.base;
            const attack = selected.row.mode === 'core' ? 2 * (base + vitamin) + trainer :
                selected.row.mode === 'february' ? base + vitamin + trainer + 5 + Math.floor(snapshot.currentLevel / 10) : NaN;
            if (!finite(base) || !finite(attack)) { invalidate(context, 'nonfinite-candidate'); return; }
            const ticket = Object.freeze({}); tickets.set(ticket, {context, attack});
            try {
                const candidate = context.model.calculateStatTotal({...plain(snapshot.args), hugePowerTicket: ticket});
                if (!context.valid || !modelMatches(actor, context.model)) return;
                const dependent = pokemonCandidateUpdate(actor, context, candidate);
                if (!context.valid || !modelMatches(actor, context.model)) return;
                // All targets are unchanged writable data properties in this
                // closed model. No callback, hook or preparation is replayed.
                if (dependent) {
                    dependent.stats.value = dependent.value;
                    dependent.stats.total = dependent.total;
                    dependent.cool.dice = dependent.dice;
                }
                actor.system.stats = candidate.stats;
                context.selected = selected.row.mode;
            } finally { tickets.delete(ticket); }
        } catch { invalidate(context, 'final-observer-failure'); }
        finally { context.active = false; }
    });
}
export function abortHugePowerPreparation(actor, token) {
    if (!HUGE_POWER_ENABLED || !token) return;
    safely(actor, context => {
        if (context.token === token && context.active) { invalidate(context, 'incomplete-preparation'); context.active = false; }
    });
}
export function inspectHugePower(actor) {
    if (!HUGE_POWER_ENABLED) return null;
    const context = contexts.get(actor);
    return context ? Object.freeze({valid: context.valid, selected: context.selected ?? null, reasons: Object.freeze([...context.reasons])}) : null;
}

/** The ordinary predicate primitive is shared, never dispatched through an override. */
export function testRulePredicate(rule, options) {
    if(rule.predicate.length === 0) return true;
    const optionSet = new Set([
        ...(options ?? rule.actor.getRollOptions()),
        ...rule.item.getRollOptions(),
    ]);
    return rule.resolveInjectedProperties(rule.predicate).test(optionSet);
}
