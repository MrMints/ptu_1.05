import test from 'node:test';
import assert from 'node:assert/strict';
import {captureMechanicPreferences as capture, PREFERENCE_CAPTURE_LIMITS as limits} from '../src/util/mechanic-preferences-capture.js';
import {inspectMechanicPreferences} from '../src/util/mechanic-preferences.js';

const choice = id => ({id, label:id, sourceStatus:'synthetic', citation:'Synthetic declaration only.', eligibility:'eligible'});
const definition = (id = 'synthetic', storageScope = 'world') => ({id, label:id, storageScope, choices:[choice('standard'), choice('alternative')]});
const binding = (id = 'synthetic', storageScope = 'world') => ({id, namespace:'synthetic-test', key:id, storageScope, registrationEvidenceRef:'fixture:declaration'});
const manifest = (definitions = [definition()], bindings = [binding()]) => ({schemaVersion:1,
    coverage:{kind:'selected-declarations', evidenceRef:'fixture:selected-only'}, definitions, bindings});
const unavailable = () => ({availability:'unavailable', reason:'not-observed', evidenceRef:null});
const available = value => ({availability:'available', value, evidenceRef:'fixture:ancillary'});
const stored = value => ({state:'present', value, evidenceRef:'fixture:stored'});
const reply = (s = stored('alternative'), changes = {}) => ({schemaVersion:1, id:'synthetic', storageScope:'world',
    stored:s, effective:unavailable(), default:unavailable(), ...changes});
const run = (r = reply(), m = manifest()) => capture(JSON.stringify(m), () => JSON.stringify(r));
const observation = r => JSON.parse(r.requestJson).observations[0];

test('declared selected coverage is explicit, detached and not a production mapping', () => {
    const m = manifest(), raw = JSON.stringify(m); let argument;
    const r = capture(raw, b => { argument = b; return JSON.stringify(reply()); });
    assert.equal(r.status, 'captured'); assert.equal(r.productionMapping, false); assert.equal(r.providerCalls, 1);
    assert.deepEqual(r.coverage, {kind:'selected-declarations', evidenceRef:'fixture:selected-only',
        declaredIds:['synthetic'], mappedIds:['synthetic'], unmappedIds:[]});
    assert.equal(JSON.stringify(m), raw); assert.notEqual(argument, m.bindings[0]);
    assert.ok(Object.isFrozen(argument)); assert.ok(Object.isFrozen(r.records[0].evidence.stored));
    assert.throws(() => { r.records[0].evidence.stored.value = 'changed'; }, TypeError);
});
for (const value of [false, 0, null, '', 'standard', 'alternative', {custom:[false, 0, null]}]) {
    test('preserves explicit stored JSON value ' + JSON.stringify(value), () => {
        const r = run(reply(stored(value)));
        assert.equal(r.status, 'captured'); assert.deepEqual(observation(r).value, value);
        const review = inspectMechanicPreferences(r.requestJson);
        assert.equal(review.current[0].before.presence, 'present');
        assert.deepEqual(review.current[0].before.value, value);
        if (['standard', 'alternative'].includes(value)) assert.equal(review.current[0].effective.origin, 'stored');
        else assert.equal(review.current[0].effective.availability, 'unavailable');
    });
}
test('proved absence and explicit standard are distinct, not host default evidence', () => {
    const absent = run(reply({state:'absent', evidenceRef:'fixture:absence'}));
    assert.equal(observation(absent).state, 'absent');
    assert.equal(inspectMechanicPreferences(absent.requestJson).current[0].effective.origin, 'standard-fallback');
    assert.equal(absent.records[0].evidence.default.availability, 'unavailable');
    assert.equal(inspectMechanicPreferences(run(reply(stored('standard'))).requestJson).current[0].effective.origin, 'stored');
});
for (const state of ['unknown', 'present-unavailable']) {
    test(state + ' remains unavailable despite effective/default values', () => {
        const r = run(reply({state, reason:'unreadable', evidenceRef:null}, {effective:available('standard'), default:available('standard')}));
        assert.equal(r.status, 'partial'); assert.equal(observation(r).state, state);
        assert.equal(inspectMechanicPreferences(r.requestJson).current[0].effective.availability, 'unavailable');
    });
}
test('unmapped declarations are explicit unknowns and never invoke provider', () => {
    let calls = 0;
    const r = capture(JSON.stringify(manifest([definition()], [])), () => { calls++; throw Error(); });
    assert.equal(calls, 0); assert.equal(r.status, 'partial');
    assert.deepEqual(r.coverage.unmappedIds, ['synthetic']); assert.equal(observation(r).state, 'unknown');
});
test('client scope is preserved without world fallback', () => {
    const r = run(reply(stored('standard'), {storageScope:'client'}), manifest([definition('synthetic', 'client')], [binding('synthetic', 'client')]));
    assert.equal(observation(r).storageScope, 'client');
});
for (const [name, change] of [
    ['wrong id', r => { r.id = 'other'; }],
    ['wrong scope', r => { r.storageScope = 'client'; }],
    ['absence with a value', r => { r.stored = {state:'absent', value:'standard', evidenceRef:'fixture:absence'}; }],
    ['presence without value', r => { r.stored = {state:'present', evidenceRef:'fixture:presence'}; }],
    ['presence without evidence', r => { r.stored.evidenceRef = null; }],
    ['unknown with a value', r => { r.stored = {state:'unknown', value:0, reason:'incomplete', evidenceRef:null}; }],
    ['missing default evidence state', r => { delete r.default; }],
    ['extra reply field', r => { r.extra = true; }],
    ['invalid effective evidence', r => { r.effective = {availability:'available', value:false, evidenceRef:null}; }]
]) {
    test('rejects provider ' + name + ' without retry or false absence', () => {
        const value = reply(); change(value); const r = run(value);
        assert.equal(r.providerCalls, 1); assert.equal(r.status, 'partial');
        assert.equal(observation(r).state, 'unknown'); assert.equal(r.records[0].evidence, null);
        assert.equal(r.issues[0].code, 'provider-shape-or-identity');
    });
}
test('present versus effective disagreement is retained, not silently selected', () => {
    const r = run(reply(stored(false), {effective:available(0)}));
    assert.equal(r.records[0].disposition, 'inconsistent'); assert.equal(r.records[0].evidence.stored.value, false);
    assert.equal(r.records[0].evidence.effective.value, 0); assert.equal(observation(r).state, 'unknown');
});
test('absent effective/default disagreement is retained', () => {
    const r = run(reply({state:'absent', evidenceRef:'fixture:absence'}, {effective:available('alternative'), default:available('standard')}));
    assert.equal(r.records[0].disposition, 'inconsistent'); assert.equal(observation(r).reason, 'incomplete');
});
test('object key order alone is not an evidence disagreement', () => {
    const r = run(reply(stored({a:0, b:false}), {effective:available({b:false, a:0})}));
    assert.equal(r.status, 'captured'); assert.equal(r.records[0].disposition, 'observed');
});
test('throwing provider is recorded once without inspecting its thrown object', () => {
    let calls = 0, getters = 0; const failure = {get message() { getters++; throw Error(); }};
    const r = capture(JSON.stringify(manifest()), () => { calls++; throw failure; });
    assert.equal(calls, 1); assert.equal(getters, 0); assert.equal(r.issues[0].code, 'provider-threw');
});
test('provider object getters, thenables and toJSON are never invoked', () => {
    let touched = 0;
    const value = {get then() { touched++; }, get toJSON() { touched++; }, get stored() { touched++; }};
    const r = capture(JSON.stringify(manifest()), () => value);
    assert.equal(touched, 0); assert.equal(r.issues[0].code, 'provider-return-type');
});
test('resolved promises are rejected without awaiting', () => {
    const r = capture(JSON.stringify(manifest()), () => Promise.resolve(JSON.stringify(reply())));
    assert.equal(r.issues[0].code, 'provider-return-type');
});
for (const [name, raw] of [
    ['syntax', '{'],
    ['duplicate member', '{"schemaVersion":1,"schemaVersion":1}'],
    ['escaped duplicate member', '{"id":1,"\\u0069d":2}'],
    ['fraction', '{"value":1.5}'],
    ['exponent', '{"value":1e2}'],
    ['negative zero', '{"value":-0}'],
    ['unsafe integer', '{"value":9007199254740992}'],
    ['too deep', '['.repeat(10) + '0' + ']'.repeat(10)],
    ['too many nodes', '[' + Array(513).fill('0').join(',') + ']'],
    ['oversized', ' '.repeat(limits.replyChars + 1)]
]) {
    test('rejects provider serialized ' + name, () => {
        const r = capture(JSON.stringify(manifest()), () => raw);
        assert.equal(r.providerCalls, 1); assert.equal(r.issues[0].code, 'provider-data-invalid');
        assert.equal(observation(r).state, 'unknown');
    });
}
for (const [name, modify] of [
    ['duplicate binding', m => m.bindings.push(m.bindings[0])],
    ['duplicate physical address', m => { m.definitions.push(definition('second')); m.bindings.push({...binding('second'), key:'synthetic'}); }],
    ['unknown mechanic', m => { m.bindings[0].id = 'not-declared'; }],
    ['scope mismatch', m => { m.bindings[0].storageScope = 'client'; }],
    ['missing registration evidence', m => { m.bindings[0].registrationEvidenceRef = ''; }],
    ['duplicate definition', m => m.definitions.push(m.definitions[0])],
    ['invalid standard declaration', m => { m.definitions[0].choices[0].eligibility = 'excluded'; }],
    ['undeclared coverage shape', m => { m.coverage.kind = 'all-settings'; }],
    ['65 bindings', m => { m.definitions = Array.from({length:65}, (_,i) => definition('m'+i)); m.bindings = m.definitions.map(d => binding(d.id)); }]
]) {
    test('invalid manifest ' + name + ' invokes no provider', () => {
        const m = manifest(); modify(m); let calls = 0;
        const r = capture(JSON.stringify(m), () => { calls++; return JSON.stringify(reply()); });
        assert.equal(r.status, 'invalid'); assert.equal(calls, 0); assert.equal(r.providerCalls, 0); assert.equal(r.requestJson, null);
    });
}
test('serialized manifest boundary rejects objects without invoking accessors', () => {
    let touched = 0;
    const r = capture({get toJSON() { touched++; }}, () => { touched++; });
    assert.equal(r.status, 'invalid'); assert.equal(touched, 0);
});
test('manifest size and arity are bounded', () => {
    assert.equal(capture(' '.repeat(limits.manifestChars+1), () => '').status, 'invalid');
    assert.equal(capture(JSON.stringify(manifest())).issues[0].code, 'arguments-invalid');
    assert.equal(capture(JSON.stringify(manifest()), () => '', 3).issues[0].code, 'arguments-invalid');
});
test('one call per binding even after failure, never a retry', () => {
    const defs = ['first','second'].map(id => definition(id)), seen = [];
    const r = capture(JSON.stringify(manifest(defs, defs.map(d => binding(d.id)))), b => {
        seen.push(b.id); if (b.id === 'first') throw Error('private text is not emitted');
        return JSON.stringify(reply(stored('standard'), {id:b.id}));
    });
    assert.deepEqual(seen, ['first','second']); assert.equal(r.providerCalls, 2);
    assert.equal(JSON.parse(r.requestJson).observations[1].value, 'standard');
    assert.ok(!JSON.stringify(r).includes('private text'));
});
test('at most 64 callbacks, including empty evidence failures', () => {
    const defs = Array.from({length:64}, (_,i) => definition('m'+i)); let calls = 0;
    const r = capture(JSON.stringify(manifest(defs, defs.map(d => binding(d.id)))), () => { calls++; return ''; });
    assert.equal(calls, 64); assert.equal(r.providerCalls, 64); assert.equal(r.status, 'partial');
});
test('aggregate reply reservation skips remaining calls visibly', () => {
    const defs = Array.from({length:20}, (_,i) => definition('m'+i)); let calls = 0;
    const r = capture(JSON.stringify(manifest(defs, defs.map(d => binding(d.id)))), b => {
        calls++; const raw = JSON.stringify(reply(stored('x'.repeat(3000)), {id:b.id})); assert.ok(raw.length <= limits.replyChars); return raw;
    });
    assert.ok(calls > 0 && calls < 20); assert.equal(calls, r.providerCalls);
    assert.ok(r.issues.some(i => i.code === 'reply-budget-exhausted')); assert.equal(r.records.length, 20);
    assert.ok(JSON.stringify(r).length <= limits.outputChars);
});
test('custom __proto__ is detached data, not prototype mutation', () => {
    const value = JSON.parse('{"__proto__":{"owned":true},"constructor":false}');
    const r = run(reply(stored(value)));
    assert.ok(Object.hasOwn(observation(r).value, '__proto__'));
    assert.equal({}.owned, undefined); assert.deepEqual(observation(r).value, value);
});
test('capture never touches global settings or storage APIs', () => {
    const before = Object.getOwnPropertyDescriptor(globalThis, 'game'); let touched = 0;
    Object.defineProperty(globalThis, 'game', {configurable:true, get() { touched++; throw Error('global access'); }});
    try { assert.equal(run().status, 'captured'); assert.equal(touched, 0); }
    finally { if (before) Object.defineProperty(globalThis, 'game', before); else delete globalThis.game; }
});

test('five retained synthetic native-fixture semantic rows compose with the actual validator', () => {
    const definitions = [{"id":"ptu-sandbox-review-absent","label":"Synthetic absent","storageScope":"world","choices":[{"id":"standard","label":"Standard","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"},{"id":"alternative","label":"Alternative","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"}]},{"id":"ptu-sandbox-review-saved","label":"Synthetic saved","storageScope":"world","choices":[{"id":"standard","label":"Standard","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"},{"id":"alternative","label":"Alternative","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"}]},{"id":"ptu-sandbox-review-custom","label":"<b data-ptu-review-probe=\"literal\">literal markup</b>","storageScope":"world","choices":[{"id":"standard","label":"Standard","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"},{"id":"alternative","label":"Alternative","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"}]},{"id":"ptu-sandbox-review-unknown","label":"Synthetic unknown","storageScope":"world","choices":[{"id":"standard","label":"Standard","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"},{"id":"alternative","label":"Alternative","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"}]},{"id":"ptu-sandbox-review-excluded","label":"Synthetic excluded","storageScope":"world","choices":[{"id":"standard","label":"Standard","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"eligible"},{"id":"alternative","label":"Alternative","sourceStatus":"synthetic","citation":"Synthetic test declaration; not a rules claim.","eligibility":"excluded"}]}];
    const observations = [{"id":"ptu-sandbox-review-absent","storageScope":"world","state":"absent","evidenceRef":"synthetic:absent"},{"id":"ptu-sandbox-review-saved","storageScope":"world","state":"present","evidenceRef":"synthetic:saved","value":"alternative"},{"id":"ptu-sandbox-review-custom","storageScope":"world","state":"present","evidenceRef":"synthetic:custom","value":{"customLabel":"Retain exactly","ranks":[1,2]}},{"id":"ptu-sandbox-review-unknown","storageScope":"world","state":"unknown","evidenceRef":"synthetic:unknown","reason":"not-observed"},{"id":"ptu-sandbox-review-excluded","storageScope":"world","state":"present","evidenceRef":"synthetic:excluded","value":"alternative"}];
    const expected = [{"id":"ptu-sandbox-review-absent","before":{"presence":"absent","availability":"available"},"effective":{"availability":"available","value":"standard","origin":"standard-fallback"},"membership":"member"},{"id":"ptu-sandbox-review-custom","before":{"presence":"present","availability":"available","value":{"customLabel":"Retain exactly","ranks":[1,2]}},"effective":{"availability":"unavailable","value":null,"origin":"none"},"membership":"not-applicable"},{"id":"ptu-sandbox-review-excluded","before":{"presence":"present","availability":"available","value":"alternative"},"effective":{"availability":"unavailable","value":null,"origin":"none"},"membership":"member"},{"id":"ptu-sandbox-review-saved","before":{"presence":"present","availability":"available","value":"alternative"},"effective":{"availability":"available","value":"alternative","origin":"stored"},"membership":"member"},{"id":"ptu-sandbox-review-unknown","before":{"presence":"unknown","availability":"unavailable"},"effective":{"availability":"unavailable","value":null,"origin":"none"},"membership":"unavailable"}];
    const m = manifest(definitions, definitions.map(d => binding(d.id, d.storageScope)));
    const r = capture(JSON.stringify(m), b => {
        const original = observations.find(o => o.id === b.id);
        const {id, storageScope, ...stored} = original;
        return JSON.stringify(reply(stored, {id, storageScope}));
    });
    const actual = inspectMechanicPreferences(r.requestJson);
    assert.deepEqual(actual.current.map(({id,before,effective,membership}) => ({id,before,effective,membership})), expected);
    assert.equal(actual.choiceProjection.availability, 'unavailable');
    assert.equal(r.productionMapping, false);
});
