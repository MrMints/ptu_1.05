import test from 'node:test';
import assert from 'node:assert/strict';
import {captureTrainerAdvancement as capture, TRAINER_PROVIDER_LIMITS as limits} from '../src/util/mechanic-preferences-foundry-provider.js';
import {inspectMechanicPreferences} from '../src/util/mechanic-preferences.js';
const request = () => ({schemaVersion:1, namespace:'ptu', key:'variant.trainerAdvancement', storageScope:'world',
    mechanicId:'ptu.trainer-advancement', mapping:{original:'standard'}, callerRef:'fixture:caller'});
const authority = () => ({schemaVersion:1, callerRef:'fixture:caller', decision:'authorized', role:'gm', evidenceRef:'fixture:trusted-authority'});
const available = value => ({availability:'available', value, evidenceRef:'fixture:observed'});
const unavailable = () => ({availability:'unavailable', reason:'not-observed', evidenceRef:null});
const observation = () => ({schemaVersion:1, namespace:'ptu', key:'variant.trainerAdvancement', storageScope:'world',
    registration:available({type:'String', scope:'world', default:'original', choices:['original','data-revamp','short-track','ptr-update','long-track'], requiresReload:true, config:false}),
    presence:{state:'present', evidenceRef:'fixture:loaded-membership'}, loadedSource:available('"original"'), decoded:available('original'), effective:available('original'),
    overrideEvidence:available({status:'none-reported'}), consistency:{status:'no-change-detected', before:'rev1', after:'rev1', evidenceRef:'fixture:non-atomic-read'}});
const run = (o = observation(), a = authority(), q = request()) => capture(JSON.stringify(q), () => JSON.stringify(a), () => JSON.stringify(o));
const assertUnknown = r => {
    assert.equal(r.mapping, null);
    if (r.capture) {
        assert.equal(JSON.parse(r.capture.requestJson).observations[0].state, 'unknown');
        assert.equal(inspectMechanicPreferences(r.capture.requestJson).current[0].effective.availability, 'unavailable');
    }
};

test('exact original maps explicitly through unchanged actual capture and validator', () => {
    const r = run(); assert.equal(r.status, 'mapped'); assert.deepEqual(r.calls, {authority:1, observation:1});
    assert.equal(r.mapping.physicalValue, 'original'); assert.equal(r.mapping.canonicalChoice, 'standard');
    assert.equal(r.evidence.observation.loadedSource.value, '"original"'); assert.equal(r.evidence.observation.decoded.value, 'original');
    assert.equal(r.capture.status, 'captured'); assert.equal(r.capture.providerCalls, 1);
    const v = inspectMechanicPreferences(r.capture.requestJson); assert.equal(v.current[0].effective.value, 'standard');
    assert.equal(v.current[0].effective.origin, 'stored'); assert.equal(r.sourceApproval, 'not-assessed');
    assert.equal(r.mappingStatus, 'prospective-unreserved'); assert.equal(r.atomicity, 'not-established');
});
test('authority precedes all observation, receives detached frozen exact request', () => {
    const q = request(), events = []; let passed;
    const r = capture(JSON.stringify(q), arg => { passed = arg; events.push('authority'); return JSON.stringify(authority()); }, arg => {
        assert.equal(arg, passed); events.push('observation'); return JSON.stringify(observation());
    });
    assert.deepEqual(events, ['authority','observation']); assert.notEqual(passed, q); assert.ok(Object.isFrozen(passed.mapping));
    assert.equal(r.status, 'mapped'); assert.throws(() => { passed.mapping.original = 'changed'; }, TypeError);
});
for (const [name, change] of [
    ['unknown', a => a.decision = 'unknown'], ['denied', a => a.decision = 'denied'], ['non-GM', a => a.role = 'non-gm'],
    ['unknown role', a => a.role = 'unknown'], ['wrong caller', a => a.callerRef = 'other'], ['no evidence', a => a.evidenceRef = null],
    ['extra Boolean grant', a => a.isGM = true], ['wrong version', a => a.schemaVersion = 2]
]) test('authority ' + name + ' stops before any content call', () => {
    const a = authority(); change(a); let called = 0;
    const r = capture(JSON.stringify(request()), () => JSON.stringify(a), () => { called++; throw Error(); });
    assert.equal(called, 0); assert.equal(r.status, 'denied'); assert.deepEqual(r.calls, {authority:1, observation:0}); assert.equal(r.capture, null);
});
for (const [name, change] of [
    ['namespace', q => q.namespace = 'other'], ['key', q => q.key = 'variant.useDexExp'], ['scope', q => q.storageScope = 'client'],
    ['mechanic', q => q.mechanicId = 'other'], ['map target', q => q.mapping.original = 'original'], ['map addition', q => q.mapping['ptr-update'] = 'standard'],
    ['missing map', q => delete q.mapping], ['blank caller', q => q.callerRef = ' '], ['extra field', q => q.extra = true]
]) test('request ' + name + ' rejected before either port', () => {
    const q = request(); change(q); let calls = 0;
    const r = capture(JSON.stringify(q), () => { calls++; }, () => { calls++; });
    assert.equal(r.status, 'invalid'); assert.equal(calls, 0);
});
test('request type, size, arity and callable checks have no object inspection', () => {
    let touched = 0; const q = {get toJSON() { touched++; }};
    assert.equal(capture(q, () => {}, () => {}).status, 'invalid');
    assert.equal(capture(' '.repeat(limits.requestChars + 1), () => {}, () => {}).status, 'invalid');
    assert.equal(capture(JSON.stringify(request()), () => {}).status, 'invalid');
    assert.equal(capture(JSON.stringify(request()), true, () => {}).status, 'invalid');
    assert.equal(capture(JSON.stringify(request()), () => {}, () => {}, 4).status, 'invalid'); assert.equal(touched, 0);
});
for (const stage of ['authority','observation']) {
    test(stage + ' thrown object is not inspected or retried', () => {
        let touches = 0, calls = 0; const failure = {get message() { touches++; throw Error(); }};
        const port = () => { calls++; throw failure; };
        const r = capture(JSON.stringify(request()), stage === 'authority' ? port : () => JSON.stringify(authority()),
            stage === 'observation' ? port : () => { throw Error('must not run'); });
        assert.equal(touches, 0); assert.equal(calls, 1); assertUnknown(r); assert.ok(!JSON.stringify(r).includes('must not run'));
    });
    test(stage + ' returned object, Proxy and thenable are never traversed', () => {
        let touches = 0;
        const values = [{get then() { touches++; }, get toJSON() { touches++; }}, new Proxy({}, {get() { touches++; }, ownKeys() { touches++; return []; }}), Object.create({schemaVersion:1})];
        for (const value of values) {
            const r = capture(JSON.stringify(request()), stage === 'authority' ? () => value : () => JSON.stringify(authority()),
                stage === 'observation' ? () => value : () => { throw Error('must not run'); });
            assertUnknown(r);
        }
        assert.equal(touches, 0);
    });
    test(stage + ' rejection and late settlement cannot change returned result or trigger retry', async () => {
        let resolve, reject, observes = 0;
        const promise = new Promise((a, b) => { resolve = a; reject = b; }); promise.catch(() => {});
        const r = capture(JSON.stringify(request()), stage === 'authority' ? () => promise : () => JSON.stringify(authority()),
            stage === 'observation' ? () => { observes++; return promise; } : () => { observes++; return JSON.stringify(observation()); });
        const frozen = JSON.stringify(r); reject(Error('late private failure')); resolve('too late'); await Promise.resolve();
        assert.equal(JSON.stringify(r), frozen); assert.equal(observes, stage === 'authority' ? 0 : 1); assertUnknown(r);
    });
}
for (const [name, value] of [['false',false],['zero',0],['null',null],['blank',''],['custom','custom-value'], ...['data-revamp','short-track','ptr-update','long-track'].map(v => [v,v])]) {
    test('preserves unmapped physical ' + name + ' without standard fallback', () => {
        const o = observation(); o.loadedSource = available(JSON.stringify(value)); o.decoded = available(value); o.effective = available(value);
        const r = run(o); assert.equal(r.issue, 'physical-value-unmapped'); assert.deepEqual(r.evidence.observation.decoded.value, value);
        assert.deepEqual(r.decoding.value, value); assertUnknown(r);
    });
}
for (const state of ['not-loaded','unknown']) test(state + ' is not storage absence despite original default/effective', () => {
    const o = observation(); o.presence.state = state; const r = run(o);
    assert.equal(r.issue, 'presence-unestablished'); assert.equal(r.evidence.observation.registration.value.default, 'original'); assertUnknown(r);
});
for (const [name, change] of [
    ['unavailable', o => o.registration = unavailable()], ['type', o => o.registration.value.type = 'Boolean'],
    ['scope', o => o.registration.value.scope = 'client'], ['default false', o => o.registration.value.default = false],
    ['choices', o => o.registration.value.choices.pop()], ['reload', o => o.registration.value.requiresReload = false],
    ['config', o => o.registration.value.config = true], ['extra metadata', o => o.registration.value.extra = 'override']
]) test('registration ' + name + ' remains unsupported with evidence retained', () => {
    const o = observation(); change(o); const r = run(o); assert.equal(r.issue, 'registration-unsupported'); assert.ok(r.evidence); assertUnknown(r);
});
for (const [name, change, issue] of [
    ['unavailable source', o => o.loadedSource = unavailable(), 'source-unavailable'],
    ['source false', o => o.loadedSource = available(false), 'source-unavailable'],
    ['source zero', o => o.loadedSource = available(0), 'source-unavailable'],
    ['source null', o => o.loadedSource = available(null), 'source-unavailable'],
    ['decoded mismatch', o => o.decoded = available(false), 'decoded-mismatch'],
    ['decoded unavailable', o => o.decoded = unavailable(), 'decoded-mismatch'],
    ['effective unavailable', o => o.effective = unavailable(), 'effective-unavailable'],
    ['effective false', o => o.effective = available(false), 'effective-mismatch'],
    ['override unknown', o => o.overrideEvidence = unavailable(), 'override-unresolved'],
    ['override value', o => o.overrideEvidence = available({status:'present', value:0}), 'override-unresolved'],
    ['changed', o => o.consistency.status = 'changed', 'consistency-unresolved'],
    ['unknown consistency', o => o.consistency.status = 'unknown', 'consistency-unresolved'],
    ['unequal revision tokens', o => o.consistency.after = 'rev2', 'consistency-unresolved'],
    ['no revision token', o => o.consistency.before = null, 'consistency-unresolved']
]) test(name + ' blocks mapping while retaining all observed layers', () => {
    const o = observation(); change(o); const r = run(o); assert.equal(r.issue, issue); assert.deepEqual(r.evidence.observation, o); assertUnknown(r);
});
test('observed casting change preserves decoded false and effective string', () => {
    const o = observation(); o.loadedSource = available('false'); o.decoded = available(false); o.effective = available('false');
    const r = run(o); assert.equal(r.casting, 'changed-observed'); assert.equal(r.decoding.value, false);
    assert.equal(r.evidence.observation.effective.value, 'false'); assertUnknown(r);
});
for (const raw of ['{','{"a":1,"a":2}','{"a":1,"\\u0061":2}','1.0','1e2','-0','9007199254740992','['.repeat(10)+'0'+']'.repeat(10), '['+Array(513).fill('0').join(',')+']',' '.repeat(limits.sourceChars + 1)]) {
    test('malformed or lossy loaded representation rejected: ' + raw.slice(0,24), () => {
        const o = observation(); o.loadedSource = available(raw); const r = run(o);
        assert.equal(r.issue, 'source-decode-invalid'); assert.equal(r.evidence.observation.loadedSource.value, raw); assertUnknown(r);
    });
}
for (const [name, change] of [
    ['wrong tuple', o => o.namespace = 'other'], ['wrong key', o => o.key = 'variant.useDexExp'], ['wrong scope', o => o.storageScope = 'client'],
    ['extra root', o => o.extra = true], ['missing decoded', o => delete o.decoded], ['absence claim', o => o.presence.state = 'absent'],
    ['available without value', o => delete o.effective.value], ['available without evidence', o => o.effective.evidenceRef = null],
    ['invalid reason', o => o.loadedSource = {availability:'unavailable', reason:'custom', evidenceRef:null}]
]) test('malformed observation ' + name + ' has no fallback', () => {
    const o = observation(); change(o); const r = run(o); assert.equal(r.issue, 'observation-contract');
    assert.equal(r.evidence, null); assert.equal(r.evidenceDiscarded, true); assertUnknown(r);
});
for (const stage of ['authority','observation']) for (const [name, raw] of [
    ['syntax','{'], ['duplicate','{"schemaVersion":1,"schemaVersion":1}'], ['lossy','{"value":1e2}'],
    ['too large',' '.repeat((stage === 'authority' ? limits.authorityChars : limits.observationChars)+1)],
    ['too many nodes','['+Array(513).fill('0').join(',')+']']
]) test(stage + ' bounded serialized rejection ' + name, () => {
    let seen = 0;
    const r = capture(JSON.stringify(request()), stage === 'authority' ? () => raw : () => JSON.stringify(authority()),
        stage === 'observation' ? () => { seen++; return raw; } : () => { seen++; throw Error(); });
    assert.equal(seen, stage === 'authority' ? 0 : 1); assertUnknown(r); assert.ok(JSON.stringify(r).length <= limits.outputChars);
});
test('exact source string formatting remains separate from parsed data', () => {
    const o = observation(); o.loadedSource.value = '  "original" \n'; const r = run(o);
    assert.equal(r.status, 'mapped'); assert.equal(r.evidence.observation.loadedSource.value, '  "original" \n');
});
test('prototype-named data stays detached and does not pollute objects', () => {
    const value = JSON.parse('{"__proto__":{"owned":true},"constructor":false}');
    const o = observation(); o.loadedSource = available(JSON.stringify(value)); o.decoded = available(value); o.effective = available(value);
    const r = run(o); assert.equal({}.owned, undefined); assert.ok(Object.hasOwn(r.decoding.value, '__proto__')); assertUnknown(r);
});
test('request mutation failure is recorded with one callback and no content reads', () => {
    let seen = 0;
    const r = capture(JSON.stringify(request()), arg => { arg.mapping.original = 'other'; return JSON.stringify(authority()); }, () => { seen++; });
    assert.equal(seen, 0); assert.equal(r.issue, 'authority-unavailable');
});
test('all returned evidence is detached and deeply frozen', () => {
    const o = observation(), a = authority(), r = run(o, a); const frozen = JSON.stringify(r);
    o.registration.value.choices[0] = 'changed'; a.role = 'changed';
    assert.equal(JSON.stringify(r), frozen); assert.ok(Object.isFrozen(r.evidence.observation.registration.value.choices));
    assert.throws(() => { r.evidence.observation.decoded.value = false; }, TypeError);
});
test('trusted port callback count is bounded even on partial failure', () => {
    let auth = 0, obs = 0;
    const r = capture(JSON.stringify(request()), () => { auth++; return JSON.stringify(authority()); }, () => { obs++; return ''; });
    assert.equal(auth, limits.authorityCalls); assert.equal(obs, limits.observationCalls); assert.equal(r.capture.providerCalls, 1); assertUnknown(r);
});
test('no global game/settings acquisition is performed', () => {
    const before = Object.getOwnPropertyDescriptor(globalThis, 'game'); let touched = 0;
    Object.defineProperty(globalThis, 'game', {configurable:true, get() { touched++; throw Error(); }});
    try { assert.equal(run().status, 'mapped'); assert.equal(touched, 0); }
    finally { if (before) Object.defineProperty(globalThis, 'game', before); else delete globalThis.game; }
});
