import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/util/mechanic-preferences.js';
import {lookupEffectiveRule, lookupMechanicChoice} from '../src/util/rule-versions.js';
import {previewRuleVersionReplacement} from '../src/util/rule-version-preview.js';

const inspect = api.inspectMechanicPreferences, preview = api.previewMechanicPreset;
const clone = value => structuredClone(value);
const choice = (id = 'standard', eligibility = 'eligible') => ({id, label:'Same synthetic label',
    sourceStatus:'synthetic', citation:'Synthetic assertion only', eligibility});
const definition = (id = 'fixture:reach', storageScope = 'world') => ({id, label:'Same synthetic label',
    storageScope, choices:[choice(), choice('fixture:optional')]});
const observation = (state = 'absent', value = undefined, id = 'fixture:reach', storageScope = 'world') => ({id,
    storageScope, state, evidenceRef:'fixture:evidence', ...(state === 'present' ? {value} : {}),
    ...(['unknown', 'present-unavailable'].includes(state) ? {reason:'not-observed'} : {})});
const request = () => ({schemaVersion:1, definitions:[definition()], observations:[observation()]});
const preset = (value = 'standard') => ({id:'fixture:preset', label:'Synthetic preset',
    assignments:[{mechanicId:'fixture:reach', value}]});
const run = (input, fn = inspect) => fn(JSON.stringify(input));
const codes = result => result.issues.map(issue => issue.code);
const row = result => result.current[0];
function frozen(value) {
    if (value !== null && typeof value === 'object') {
        assert.ok(Object.isFrozen(value));
        Object.values(value).forEach(frozen);
    }
}
function size(value) {
    return 1 + (value !== null && typeof value === 'object' ? Object.values(value).reduce((sum, child) => sum + size(child), 0) : 0);
}
function depth(value) {
    return value !== null && typeof value === 'object' && Object.keys(value).length
        ? 1 + Math.max(...Object.values(value).map(depth)) : 0;
}
function unavailable(result, code, rawJson = null, snapshot = null) {
    assert.equal(result.availability, 'unavailable');
    assert.deepEqual(result.input, {rawJson, snapshot});
    assert.deepEqual(result.current, []);
    assert.deepEqual(result.choiceProjection, {availability:'unavailable', choices:null});
    assert.deepEqual(result.preset, {availability:result.mode === 'current' ? 'not-requested' : 'unavailable', presetId:null, proposals:[]});
    assert.equal(result.issues[0].code, code);
    frozen(result);
}

test('exact two synchronous exports and report field sets', () => {
    assert.deepEqual(Object.keys(api).sort(), ['inspectMechanicPreferences', 'previewMechanicPreset']);
    const result = run(request());
    assert.deepEqual(Object.keys(result), ['schemaVersion', 'kind', 'mode', 'inspectionOnly', 'availability',
        'sourceApproval', 'input', 'current', 'choiceProjection', 'preset', 'issues']);
    assert.equal(result.schemaVersion, 1); assert.equal(result.kind, 'ptu-mechanic-preferences-v1');
    assert.equal(result.mode, 'current'); assert.equal(result.inspectionOnly, true);
    assert.equal(result.sourceApproval, 'not-assessed');
    assert.deepEqual(Object.keys(row(result)), ['id', 'definitionStatus', 'declaredStorageScope', 'before',
        'basicChoice', 'membership', 'effective', 'provenance', 'issueCodes']);
    assert.deepEqual(Object.keys(row(result).provenance), ['definitionIndices', 'observationIndices', 'choiceIndex',
        'evidenceRef', 'sourceStatus', 'citation', 'eligibility']);
    frozen(result);
});

for (const fn of [inspect, preview]) test(`${fn.name}: rejects caller objects without any hook`, () => {
    let hooks = 0;
    const hooked = {get value() { hooks++; throw Error('getter'); },
        toString() { hooks++; throw Error('coercion'); }, toJSON() { hooks++; throw Error('JSON hook'); }};
    const proxy = new Proxy(hooked, {get() { hooks++; throw Error('get'); }, ownKeys() { hooks++; throw Error('keys'); },
        getPrototypeOf() { hooks++; throw Error('prototype'); }});
    const revoked = Proxy.revocable({}, {}); revoked.revoke();
    for (const value of [hooked, proxy, revoked.proxy, new String('{}'), null, undefined, 1, true, Symbol('x'), () => {}]) {
        unavailable(fn(value), 'input-type');
    }
    unavailable(fn(), 'arguments-invalid');
    unavailable(fn(proxy, hooked), 'arguments-invalid');
    unavailable(fn('{}', undefined), 'arguments-invalid');
    assert.equal(hooks, 0);
});

for (const raw of ['', '{', '{"a":1,}', '[1,]', 'undefined', '\uFEFF{}', '{"a":"\n"}']) {
    test(`syntax rejection retains bounded raw ${JSON.stringify(raw)}`, () => unavailable(inspect(raw), 'json-syntax', raw));
}
for (const raw of ['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"x":[{"a":0,"a":1}]}',
    '{"__proto__":0,"\\u005f_proto__":1}']) {
    test(`decoded duplicate members refuse ${raw}`, () => unavailable(inspect(raw), 'json-duplicate-member', raw));
}
test('syntax precedes duplicate detection, which precedes limits and numeric failures', () => {
    unavailable(inspect('{"a":0,"a":1,}'), 'json-syntax', '{"a":0,"a":1,}');
    const raw = '{"a":-0,"a":' + '['.repeat(15) + '0' + ']'.repeat(15) + '}';
    unavailable(inspect(raw), 'json-duplicate-member', raw);
});

for (const token of ['0', '1', '-1', '9007199254740991', '-9007199254740991']) test(`canonical integer ${token} preserved`, () => {
    const input = request(); input.observations = [observation('present', null)];
    const raw = JSON.stringify(input).replace('"value":null', `"value":${token}`);
    const result = inspect(raw);
    assert.equal(result.availability, 'available');
    assert.equal(row(result).before.value, Number(token));
    assert.equal(result.input.rawJson, raw); assert.equal(result.input.snapshot.observations[0].value, Number(token));
});
for (const token of ['-0', '1e-324', '9007199254740991.1', '9007199254740992', '-9007199254740992', '1.0', '1e3', '0.5', '1e309']) {
    test(`unsupported numeric lexeme ${token} rejected before snapshot`, () => {
        const raw = JSON.stringify({...request(), observations:[observation('present', null)]}).replace('"value":null', `"value":${token}`);
        unavailable(inspect(raw), 'json-number-invalid', raw);
    });
}
test('numbers anywhere fail admissibility, while quoted numeric strings remain exact', () => {
    const raw = JSON.stringify({...request(), presetRequests:-1}).replace('"presetRequests":-1', '"presetRequests":1e-324');
    unavailable(preview(raw), 'json-number-invalid', raw);
    const input = request(); input.observations = [observation('present', '-0')];
    assert.equal(row(run(input)).before.value, '-0');
    assert.equal(row(run(input)).basicChoice.status, 'explicit');
});

test('raw UTF-16 bound accepts 65536 units and refuses 65537 without retention', () => {
    const raw = JSON.stringify(request()).padEnd(65536, ' ');
    assert.equal(inspect(raw).availability, 'available');
    unavailable(inspect(raw + ' '), 'input-limit');
    const unicode = JSON.stringify({...request(), observations:[observation('present', '😀')]});
    assert.equal(inspect(unicode.padEnd(65536, ' ')).availability, 'available');
});
test('depth convention root zero; values at depth12 admitted, depth13 refused', () => {
    const input = request(); input.observations = [observation('present', null)];
    let value = null;
    while (depth({...input, observations:[observation('present', value)]}) < 12) value = [value];
    input.observations[0].value = value;
    assert.equal(depth(input), 12); assert.equal(run(input).availability, 'available');
    input.observations[0].value = [value];
    const raw = JSON.stringify(input); unavailable(inspect(raw), 'input-limit', raw);
});
test('8192 value nodes admitted; member names excluded; node8193 refused', () => {
    const input = request(); input.observations = [observation('present', [])];
    input.observations[0].value = Array(8192 - size(input)).fill(null);
    assert.equal(size(input), 8192); assert.equal(run(input).availability, 'available');
    input.observations[0].value.push(null);
    const raw = JSON.stringify(input); unavailable(inspect(raw), 'input-limit', raw);
});
test('very deeply nested bounded JSON refuses without recursive scanner overflow', () => {
    const raw = '['.repeat(20000) + '0' + ']'.repeat(20000);
    unavailable(inspect(raw), 'input-limit', raw);
});

const limits = [
    ['definitions64', input => { input.definitions = Array.from({length:64}, (_, i) => definition(`fixture:${i}`)); }, input => input.definitions.push(definition('fixture:extra'))],
    ['observations256', input => { input.observations = Array.from({length:256}, (_, i) => observation('absent', undefined, `fixture:${i}`)); }, input => input.observations.push(observation())],
    ['choices32', input => { input.definitions[0].choices = [choice(), ...Array.from({length:31}, (_, i) => choice(`fixture:${i}`))]; }, input => input.definitions[0].choices.push(choice('extra'))],
    ['definition ID128', input => { input.definitions[0].id = 'a'.repeat(128); }, input => input.definitions[0].id += 'a'],
    ['observation ID128', input => { input.observations[0].id = 'a'.repeat(128); }, input => input.observations[0].id += 'a'],
    ['choice token128', input => { input.definitions[0].choices[1].id = 'a'.repeat(128); }, input => input.definitions[0].choices[1].id += 'a'],
    ['definition label256', input => { input.definitions[0].label = 'a'.repeat(256); }, input => input.definitions[0].label += 'a'],
    ['choice label256', input => { input.definitions[0].choices[0].label = 'a'.repeat(256); }, input => input.definitions[0].choices[0].label += 'a'],
    ['citation1024', input => { input.definitions[0].choices[0].citation = 'a'.repeat(1024); }, input => input.definitions[0].choices[0].citation += 'a'],
    ['evidence1024', input => { input.observations[0].evidenceRef = 'a'.repeat(1024); }, input => input.observations[0].evidenceRef += 'a'],
    ['assignments128', input => { input.presetRequests[0].assignments = Array.from({length:128}, (_, i) => ({mechanicId:`fixture:${i}`, value:'standard'})); }, input => input.presetRequests[0].assignments.push({mechanicId:'extra', value:'standard'})],
    ['preset ID128', input => { input.presetRequests[0].id = 'a'.repeat(128); }, input => input.presetRequests[0].id += 'a'],
    ['preset label256', input => { input.presetRequests[0].label = 'a'.repeat(256); }, input => input.presetRequests[0].label += 'a'],
    ['assignment ID128', input => { input.presetRequests[0].assignments[0].mechanicId = 'a'.repeat(128); }, input => input.presetRequests[0].assignments[0].mechanicId += 'a'],
    ['assignment token128', input => { input.presetRequests[0].assignments[0].value = 'a'.repeat(128); }, input => input.presetRequests[0].assignments[0].value += 'a']
];
for (const [name, at, over] of limits) test(`bound ${name}: inclusive then common rejection`, () => {
    const input = {...request(), presetRequests:[preset()]}; at(input);
    assert.equal(run(input, preview).availability, 'available');
    over(input); const raw = JSON.stringify(input); unavailable(preview(raw), 'input-limit', raw);
});
test('tree bound precedes numeric admissibility', () => {
    const input = request(); input.definitions[0].label = 'a'.repeat(257);
    const raw = JSON.stringify({...input, extra:0}).replace('"extra":0', '"extra":1e3');
    unavailable(inspect(raw), 'input-limit', raw);
});

for (const [input, code] of [[null, 'request-shape'], [[], 'request-shape'], [{...request(), extra:true}, 'request-shape'],
    [{...request(), schemaVersion:2}, 'schema-version'], [{schemaVersion:1, observations:[]}, 'request-shape'],
    [{...request(), observations:null}, 'request-shape']]) {
    test(`common envelope failure ${JSON.stringify(input).slice(0, 65)}`, () => {
        const raw = JSON.stringify(input); unavailable(inspect(raw), code, raw, input);
    });
}
test('inspection rejects preview field; preview treats missing preset as preset-only failure', () => {
    const input = request(), raw = JSON.stringify({...input, presetRequests:[]});
    unavailable(inspect(raw), 'request-shape', raw, JSON.parse(raw));
    const result = run(input, preview), current = run(input);
    assert.equal(result.availability, 'available'); assert.equal(result.preset.availability, 'unavailable');
    assert.deepEqual(result.current, current.current); assert.deepEqual(result.choiceProjection, current.choiceProjection);
});

const badDefinitions = [
    ['null', () => null], ['invalid ID', d => ({...d, id:' '})], ['empty label', d => ({...d, label:''})],
    ['scope', d => ({...d, storageScope:'actor'})], ['extra field', d => ({...d, extra:true})],
    ['choice shape', d => ({...d, choices:[{...choice(), extra:true}]})],
    ['source', d => ({...d, choices:[{...choice(), sourceStatus:'errata-by-name'}]})],
    ['citation', d => ({...d, choices:[{...choice(), citation:' '}]})],
    ['eligibility', d => ({...d, choices:[{...choice(), eligibility:'approved'}]})],
    ['missing standard', d => ({...d, choices:[choice('optional')]})],
    ['ineligible standard', d => ({...d, choices:[choice('standard', 'excluded')]})],
    ['duplicate standard', d => ({...d, choices:[choice(), choice()]})],
    ['duplicate other', d => ({...d, choices:[choice(), choice('optional'), choice('optional')]})]
];
for (const [name, change] of badDefinitions) test(`invalid definition preserved: ${name}`, () => {
    const input = request(); input.definitions[0] = change(input.definitions[0]); const result = run(input);
    assert.equal(result.availability, 'available'); assert.deepEqual(result.input.snapshot, input);
    assert.equal(result.choiceProjection.choices, null); assert.ok(codes(result).includes('definition-shape'));
    assert.ok(result.current.every(r => r.effective.availability === 'unavailable'));
});
test('duplicate definitions and choices mark every indexed occurrence without winners', () => {
    const input = request(); input.definitions.push(clone(input.definitions[0]));
    let result = run(input); assert.equal(row(result).definitionStatus, 'ambiguous');
    assert.deepEqual(result.issues.filter(i => i.code === 'definition-duplicate-id').map(i => i.path),
        [['definitions', 0, 'id'], ['definitions', 1, 'id']]);
    input.definitions.pop(); input.definitions[0].choices.push(clone(input.definitions[0].choices[1]));
    result = run(input); assert.deepEqual(result.issues.filter(i => i.code === 'definition-choice-duplicate').map(i => i.path),
        [['definitions', 0, 'choices', 1, 'id'], ['definitions', 0, 'choices', 2, 'id']]);
});

for (const scope of ['world', 'client']) test(`${scope}: observed absence falls back; explicit standard retains stored origin`, () => {
    const input = {schemaVersion:1, definitions:[definition('fixture:reach', scope)], observations:[observation('absent', undefined, 'fixture:reach', scope)]};
    const absent = row(run(input)); assert.deepEqual(absent.before, {presence:'absent', availability:'available'});
    assert.deepEqual(absent.basicChoice, {status:'default', value:'standard'});
    assert.deepEqual(absent.effective, {availability:'available', value:'standard', origin:'standard-fallback'});
    assert.equal(absent.provenance.choiceIndex, 0);
    input.observations = [observation('present', 'standard', 'fixture:reach', scope)];
    assert.equal(row(run(input)).effective.origin, 'stored');
    assert.equal(row(run(input)).basicChoice.status, 'explicit');
});
test('missing observations cannot acquire default fallback or leak an empty projection', () => {
    const input = request(); input.observations = [];
    const result = run(input); assert.equal(row(result).basicChoice.status, 'not-evaluated');
    assert.deepEqual(row(result).before, {presence:'unknown', availability:'unavailable'});
    assert.equal(result.choiceProjection.choices, null); assert.ok(codes(result).includes('observation-missing'));
});
for (const state of ['unknown', 'present-unavailable']) for (const reason of ['not-observed', 'incomplete', 'unreadable']) {
    test(`${state}/${reason}: unavailable evidence never falls back`, () => {
        const input = request(); input.observations = [{...observation(state), reason, evidenceRef:null}];
        const result = run(input); assert.deepEqual(row(result).before,
            {presence:state === 'unknown' ? 'unknown' : 'present', availability:'unavailable'});
        assert.equal(row(result).basicChoice.status, 'not-evaluated');
        assert.ok(codes(result).includes('observation-unavailable'));
    });
}
const badObservations = [null, {...observation(), evidenceRef:null}, {...observation(), value:null},
    {...observation(), reason:'incomplete'}, {...observation('present', null), evidenceRef:''},
    {id:'fixture:reach', storageScope:'world', state:'present', evidenceRef:'fixture:evidence'},
    {...observation('unknown'), reason:'guessed'}, {...observation('unknown'), value:'standard'},
    {...observation(), state:'missing'}, {...observation(), storageScope:'actor'}, {...observation(), id:''},
    {...observation(), extra:'not allowed'}];
badObservations.forEach((ob, i) => test(`malformed observation ${i} remains inspectable without fallback`, () => {
    const input = request(); input.observations = [ob]; const result = run(input);
    assert.deepEqual(result.input.snapshot, input); assert.ok(codes(result).includes('observation-shape'));
    assert.equal(result.choiceProjection.choices, null); assert.equal(row(result).effective.availability, 'unavailable');
}));
for (const state of ['absent', 'present']) test(`scope mismatch for ${state} invalidates observation inference`, () => {
    const input = request(); input.observations = [observation(state, 'standard', 'fixture:reach', 'client')];
    const result = run(input); assert.equal(row(result).basicChoice.status, 'not-evaluated');
    assert.deepEqual(row(result).before, {presence:'unknown', availability:'unavailable'});
    assert.ok(codes(result).includes('observation-scope-mismatch'));
});
for (const differing of [false, true]) test(`duplicate observations ${differing ? 'conflicting' : 'identical'} poison all indices`, () => {
    const input = request(); input.observations.push(differing ? observation('present', 'fixture:optional') : clone(input.observations[0]));
    const result = run(input); assert.equal(row(result).basicChoice.status, 'not-evaluated');
    assert.deepEqual(row(result).provenance.observationIndices, [0, 1]);
    assert.deepEqual(result.issues.filter(i => i.code === 'observation-duplicate-id').map(i => i.path),
        [['observations', 0, 'id'], ['observations', 1, 'id']]);
    input.observations.reverse(); assert.deepEqual(run(input).current, result.current);
});
for (const value of [null, false, 0, [], {}, {custom:['keep', null]}, '', '   ']) test(`invalid present ${JSON.stringify(value)} preserved`, () => {
    const input = request(); input.observations = [observation('present', value)]; const result = run(input);
    assert.deepEqual(row(result).before, {presence:'present', availability:'available', value});
    assert.deepEqual(row(result).basicChoice, {status:'unresolved', value});
    assert.ok(codes(result).includes('value-invalid')); assert.equal(row(result).effective.availability, 'unavailable');
});
test('unknown nonempty token remains basic explicit and nonmember', () => {
    const input = request(); input.observations = [observation('present', 'custom:unregistered')];
    const result = run(input); assert.equal(row(result).basicChoice.status, 'explicit');
    assert.equal(row(result).membership, 'nonmember'); assert.equal(row(result).effective.availability, 'unavailable');
});
for (const eligibility of ['excluded', 'unclassified']) test(`${eligibility} member preserved without effective preference`, () => {
    const input = request(); input.definitions[0].choices[1].eligibility = eligibility;
    input.observations = [observation('present', 'fixture:optional')]; const result = run(input);
    assert.equal(row(result).membership, 'member'); assert.equal(row(result).provenance.eligibility, eligibility);
    assert.equal(row(result).before.value, 'fixture:optional'); assert.equal(row(result).effective.availability, 'unavailable');
});
test('unknown IDs and arbitrary custom keys stay visible; malformed ID records invent no row', () => {
    const payload = JSON.parse('{"__proto__":{"keep":1},"constructor":["custom"]}');
    const input = request(); input.observations.push(observation('present', payload, 'custom:unknown'));
    input.observations.push({...observation(), id:null}); const result = run(input);
    assert.deepEqual(result.current.map(r => r.id), ['custom:unknown', 'fixture:reach']);
    assert.deepEqual(row(result).before.value, payload); assert.equal(row(result).definitionStatus, 'missing');
    assert.equal(result.choiceProjection.choices, null); assert.equal(result.current[1].effective.value, 'standard');
});

test('exact padded identities match only exact declarations; literal standard is mandatory', () => {
    const input = request(); input.definitions[0].id = input.observations[0].id = ' fixture:reach ';
    input.definitions[0].choices.push(choice(' fixture:optional '), choice(' standard '));
    input.observations[0] = observation('present', ' fixture:optional ', ' fixture:reach ');
    let result = run(input); assert.equal(row(result).effective.value, ' fixture:optional ');
    assert.equal(row(result).id, ' fixture:reach ');
    input.definitions[0].choices = [choice(' standard ')];
    result = run(input); assert.equal(row(result).definitionStatus, 'invalid');
    assert.ok(codes(result).includes('definition-standard-missing'));
    input.definitions[0].choices = [choice(), choice('fixture:optional')];
    assert.equal(row(run(input)).membership, 'nonmember');
});
test('whitespace-only choice cannot pass helper-compatible definition validation', () => {
    const input = request(); input.definitions[0].choices.push(choice('   '));
    assert.equal(row(run(input)).definitionStatus, 'invalid');
});
test('prototype-sensitive IDs are own data keys in null-prototype maps', () => {
    const before = Object.getOwnPropertyDescriptors(Object.prototype);
    const input = {schemaVersion:1, definitions:['__proto__', 'constructor'].map(id => definition(id)),
        observations:['__proto__', 'constructor'].map(id => observation('absent', undefined, id))};
    const result = run(input), map = result.choiceProjection.choices;
    assert.equal(Object.getPrototypeOf(map), null);
    for (const id of ['__proto__', 'constructor']) {
        assert.equal(Object.hasOwn(map, id), true); assert.equal(map[id], 'standard');
        const descriptor = Object.getOwnPropertyDescriptor(map, id);
        assert.equal(descriptor.enumerable, true); assert.equal(descriptor.value, 'standard');
        assert.equal(lookupMechanicChoice(id, map).status, 'explicit');
    }
    assert.deepEqual(Object.getOwnPropertyDescriptors(Object.prototype), before);
});
test('available empty or partial domain supplies no evidence about omitted IDs', () => {
    const empty = run({schemaVersion:1, definitions:[], observations:[]});
    assert.equal(empty.choiceProjection.availability, 'available');
    assert.equal(Object.getPrototypeOf(empty.choiceProjection.choices), null);
    const current = run(request()); assert.deepEqual(Object.keys(current.choiceProjection.choices), ['fixture:reach']);
    assert.equal(Object.hasOwn(current.choiceProjection.choices, 'undeclared'), false);
    const newDomain = request(); newDomain.definitions.push(definition('undeclared'));
    const result = run(newDomain); assert.equal(result.choiceProjection.choices, null);
    assert.equal(result.current.find(r => r.id === 'undeclared').effective.availability, 'unavailable');
});

const proposalCases = [
    ['absent', undefined, 'standard', 'proposed', true, false],
    ['absent', undefined, 'fixture:optional', 'proposed', true, true],
    ['present', 'standard', 'standard', 'same', false, false],
    ['present', 'fixture:optional', 'standard', 'conflict', true, true],
    ['present', null, 'standard', 'conflict', true, null],
    ['present', {custom:true}, 'standard', 'conflict', true, null],
    ['present', 'custom', 'standard', 'conflict', true, null],
    ['unknown', undefined, 'standard', 'blocked', null, null],
    ['present-unavailable', undefined, 'standard', 'blocked', null, null]
];
for (const [state, value, target, disposition, stored, preference] of proposalCases) test(`preset ${state}/${JSON.stringify(value)} to ${target}`, () => {
    const input = request(); input.observations = [observation(state, value)];
    const current = run(input), result = run({...input, presetRequests:[preset(target)]}, preview);
    assert.deepEqual(result.current, current.current); assert.deepEqual(result.choiceProjection, current.choiceProjection);
    assert.equal(result.preset.availability, 'available'); const p = result.preset.proposals[0];
    assert.deepEqual(Object.keys(p), ['mechanicId', 'before', 'proposed', 'disposition', 'storedWouldDiffer', 'preferenceWouldDiffer', 'issueCodes']);
    assert.deepEqual(p.before, row(current).before);
    assert.deepEqual(p.proposed, {presence:'present', availability:'available', value:target});
    assert.equal(p.disposition, disposition); assert.equal(p.storedWouldDiffer, stored); assert.equal(p.preferenceWouldDiffer, preference);
});
for (const value of [undefined, null, 1, {}, 'bad', [preset(), preset()], [{...preset(), assignments:null}],
    [{...preset(), assignments:[null]}], [{...preset(), assignments:[{mechanicId:'unknown', value:'standard'}]}],
    [{...preset(), assignments:[...preset().assignments, ...preset().assignments]}],
    [{...preset(), assignments:[...preset().assignments, {mechanicId:'fixture:reach', value:'fixture:optional'}]}],
    [{...preset(), assignments:[{mechanicId:'fixture:reach', value:'unknown'}]}]]) {
    test(`preset-only failure preserves current inspection: ${JSON.stringify(value)?.slice(0, 95)}`, () => {
        const input = request(), current = run(input); const result = run({...input, presetRequests:value}, preview);
        assert.equal(result.availability, 'available'); assert.equal(result.preset.availability, 'unavailable');
        assert.deepEqual(result.preset.proposals, []); assert.deepEqual(result.current, current.current);
        assert.deepEqual(result.choiceProjection, current.choiceProjection);
    });
}
test('empty presets not-requested; empty assignments available; valid ID retained on bad assignment', () => {
    assert.equal(run({...request(), presetRequests:[]}, preview).preset.availability, 'not-requested');
    assert.equal(run({...request(), presetRequests:[{...preset(), assignments:[]}]}, preview).preset.availability, 'available');
    const result = run({...request(), presetRequests:[{...preset(), assignments:[null]}]}, preview);
    assert.equal(result.preset.presetId, 'fixture:preset');
});
for (const eligibility of ['excluded', 'unclassified']) test(`preset rejects ${eligibility} requested choice`, () => {
    const input = request(); input.definitions[0].choices[1].eligibility = eligibility;
    const result = run({...input, presetRequests:[preset('fixture:optional')]}, preview);
    assert.equal(result.preset.availability, 'unavailable'); assert.ok(codes(result).includes('preset-choice-ineligible'));
});
test('invalid or duplicate definitions invalidate entire requested preset without changing current', () => {
    for (const duplicate of [false, true]) {
        const input = request(); if (duplicate) input.definitions.push(clone(input.definitions[0]));
        else input.definitions[0].label = '';
        const result = run({...input, presetRequests:[preset()]}, preview);
        assert.equal(result.preset.availability, 'unavailable'); assert.ok(codes(result).includes('preset-definition-unavailable'));
        assert.deepEqual(result.current, run(input).current);
    }
});
test('preset duplicates mark each affected index; distinct proposals sort by exact ID', () => {
    const input = {...request(), presetRequests:[{...preset(), assignments:[...preset().assignments, ...preset().assignments]}]};
    let result = run(input, preview);
    assert.deepEqual(result.issues.filter(i => i.code === 'preset-assignment-duplicate').map(i => i.path),
        [['presetRequests', 0, 'assignments', 0, 'mechanicId'], ['presetRequests', 0, 'assignments', 1, 'mechanicId']]);
    input.definitions.push(definition('A')); input.observations.push(observation('absent', undefined, 'A'));
    input.presetRequests[0].assignments[1].mechanicId = 'A'; result = run(input, preview);
    assert.deepEqual(result.preset.proposals.map(p => p.mechanicId), ['A', 'fixture:reach']);
});
test('repeatability, frozen detached reports, UTF-16 row ordering and fixed issue schema', () => {
    const input = request(); input.definitions = ['z', 'a', 'A', '😀', '\uE000'].map(id => definition(id));
    input.observations = input.definitions.map(d => observation('present', {custom:1}, d.id));
    const raw = JSON.stringify(input), first = inspect(raw), second = inspect(raw);
    assert.deepEqual(first, second); assert.notEqual(first, second); frozen(first); frozen(second);
    assert.deepEqual(first.current.map(r => r.id), ['A', 'a', 'z', '😀', '\uE000']);
    input.observations[0].value.custom = 2;
    assert.equal(first.input.snapshot.observations[0].value.custom, 1);
    assert.throws(() => { first.current[0].before.value.custom = 99; }, TypeError);
    for (const issue of first.issues) {
        assert.deepEqual(Object.keys(issue), ['code', 'path']);
        assert.ok(issue.path.every(part => typeof part === 'string' || Number.isInteger(part)));
    }
});

for (const type of ['move', 'ability', 'feat', 'edge', 'pokeedge']) test(`${type}: projection composition preserves complete repeated/custom Items and all selected versions`, () => {
    const id = n => String(n).padStart(16, '0');
    const mappings = ['core', 'official-errata', 'optional-playtest'].map((status, i) => ({schemaVersion:1,
        documentUuid:`Compendium.fixture.items.Item.${id(i + 1)}`, type,
        version:{id:`fixture:version:${i}`, label:i === 1 ? '[Errata] Synthetic' : 'Same label', kind:i ? 'revised' : 'original'},
        canonical:{id:`fixture:benefit:${type}`, evidence:'Synthetic explicit relationship'}, generationEligibility:'eligible',
        source:{id:`fixture:source:${i}`, edition:'Synthetic', status, citation:'Synthetic only', publicationDate:null}}));
    const item = i => ({_id:id(i + 10), uuid:`Actor.${id(90)}.Item.${id(i + 10)}`, type, name:'Same name',
        _stats:{compendiumSource:mappings[i].documentUuid}, flags:{ptu:{selectedVersion:mappings[i].version,
            subchoices:['keep', 'keep']}, user:{custom:{keep:true}}}, system:{description:`Custom ${i}`, prerequisites:['Master Focus', 'Custom condition'],
            uses:{value:0, max:3}, cost:2, enabled:false, free:false, effectUseCondition:'Separate custom condition', rules:[{key:'Custom', value:i}]}});
    const current = item(0), candidate = item(1), repeated = {...item(0), _id:id(88), uuid:`Actor.${id(90)}.Item.${id(88)}`};
    const input = {actor:{uuid:`Actor.${id(90)}`, system:{level:{current:1}, skills:{}}, items:[current, repeated, item(2)]},
        current, candidate, versions:mappings}; const before = clone(input);
    const report = run({...request(), observations:[observation('present', 'fixture:optional')]});
    const proposal = run({...request(), observations:[observation('present', 'fixture:optional')], presetRequests:[preset()]}, preview);
    assert.equal(proposal.preset.proposals[0].disposition, 'conflict');
    for (const owned of input.actor.items) {
        const effective = lookupEffectiveRule(owned, {versions:mappings, mechanicChoices:report.choiceProjection.choices});
        assert.deepEqual(effective.system, owned.system);
        assert.equal(effective.selection.selectedVersion.id, owned.flags.ptu.selectedVersion.id);
        assert.equal(effective.mechanicChoices['fixture:reach'], 'fixture:optional');
    }
    const result = previewRuleVersionReplacement({...input, mechanicChoices:report.choiceProjection.choices});
    assert.deepEqual(result.current.snapshot, current); assert.deepEqual(result.candidate.snapshot, candidate);
    assert.equal(result.relationship.status, 'alternate-versions');
    assert.deepEqual(result.prerequisites.report.rawRequirements, candidate.system.prerequisites);
    assert.deepEqual(input, before); assert.equal(input.actor.items.length, 3);
    assert.equal(result.mechanics.choices['fixture:reach'], 'fixture:optional');
});
