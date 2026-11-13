import test from 'node:test';
import assert from 'node:assert/strict';
import {previewRuleVersionReplacement as preview} from '../src/util/rule-version-preview.js';

// Explicitly synthetic relationships and records. No inherited mapping or real rule approval.
const types = ['move', 'ability', 'feat', 'edge', 'pokeedge'];
const id = n => String(n).padStart(16, '0');
function fixtures(type = 'feat') {
    const make = revised => {
        const n = types.indexOf(type) * 2 + Number(revised) + 1;
        const uuid = `Compendium.fixture.${type}s.Item.${id(n)}`;
        const version = {id:`fixture:${type}:${revised ? 'revised' : 'original'}`,
            label:revised ? 'Synthetic optional revision' : 'Synthetic original', kind:revised ? 'revised' : 'original'};
        const metadata = {schemaVersion:1, documentUuid:uuid, type, version, generationEligibility:'eligible',
            canonical:{id:`fixture:benefit:${type}`, evidence:'Explicit synthetic relationship only'},
            source:{id:`fixture:source:${n}`, edition:'Synthetic preview fixture', status:'synthetic',
                publicationDate:null, citation:'Test assertion, not production approval'}};
        const item = {_id:id(n + 100), uuid:`Actor.${id(1000)}.Item.${id(n + 100)}`, type, name:'Same visible name',
            _stats:{compendiumSource:uuid}, flags:{ptu:{selectedVersion:{...version}, rulesSelections:{capability:'fixture:one'}}, user:{note:'keep'}},
            system:{source:{value:'Synthetic fixture'}, prerequisites:revised ? ['Master Focus', 'GM Permission', 'Custom condition'] : ['Novice Focus'],
                description:revised ? 'Synthetic revised description' : 'Synthetic original description',
                rules:[{key:'Synthetic', value:revised ? 7 : 2}], uses:{value:0, max:2}, cost:1,
                enabled:false, free:false, effectUseCondition:'Synthetic separate condition', custom:{rank:2}}};
        return {metadata, item};
    };
    const original = make(false), revised = make(true);
    const actor = {uuid:`Actor.${id(1000)}`, system:{level:{current:1}, skills:{focus:{value:{total:3}}}},
        items:[structuredClone(original.item)]};
    return {actor, current:original.item, candidate:revised.item, versions:[original.metadata, revised.metadata]};
}
function freeze(value) {
    if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
    return value;
}

for (const type of types) test(`${type}: evidenced alternates expose detached own data and advisory deficiencies`, () => {
    const input = fixtures(type), before = structuredClone(input);
    freeze(input);
    const r = preview(input);
    assert.equal(r.inspectionOnly, true); assert.equal(r.relationship.status, 'alternate-versions');
    assert.equal(r.relationship.canonicalId, `fixture:benefit:${type}`);
    assert.deepEqual(r.current.snapshot, before.current); assert.deepEqual(r.candidate.snapshot, before.candidate);
    assert.notEqual(r.current.attribution.selectedVersion.id, r.candidate.attribution.selectedVersion.id);
    assert.deepEqual(r.prerequisites.report.rawRequirements, input.candidate.system.prerequisites);
    assert.deepEqual(r.prerequisites.report.requirements.map(v => v.status), ['unmet', 'unverifiable', 'unverifiable']);
    assert.equal(r.prerequisites.formatted.unmet.length, 1); assert.equal(r.prerequisites.formatted.unknown.length, 2);
    assert.equal(r.prerequisites.report.advisory, true);
    assert.deepEqual(input, before);
});

test('same selection still exposes custom system differences and complete non-system snapshots', () => {
    const input = fixtures(); input.candidate = structuredClone(input.current);
    input.candidate.system.custom.rank = 5; input.candidate.flags.user.note = 'different custom note';
    const r = preview(input);
    assert.equal(r.relationship.status, 'same-selection');
    assert.deepEqual(r.differences.changes, [{path:['system', 'custom', 'rank'],
        before:{present:true, value:2}, after:{present:true, value:5}}]);
    assert.equal(r.current.snapshot.flags.user.note, 'keep');
    assert.equal(r.candidate.snapshot.flags.user.note, 'different custom note');
    assert.equal(r.prerequisites.report.unmet.length, 0);
});

test('same-name unrelated benefits stay unrelated and renaming/localization never changes a relationship', () => {
    const input = fixtures('ability');
    for (const name of ['Same visible name', 'Renamed original', 'Pouvoir traduit']) {
        input.current.name = name;
        assert.equal(preview(input).relationship.status, 'alternate-versions');
    }
    input.versions[1].canonical = {id:'fixture:unrelated', evidence:'Synthetic distinct benefit'};
    input.current.name = input.candidate.name;
    assert.equal(preview(input).relationship.status, 'unrelated-benefits');
});

test('revision-only addition and null or unevidenced canonical relationships never invent counterparts', () => {
    const input = fixtures('ability'); input.versions[1].version.kind = 'addition'; input.versions[1].canonical = null;
    const r = preview(input);
    assert.equal(r.candidate.attribution.selectedVersion.kind, 'addition');
    assert.equal(r.relationship.status, 'unresolved');
    assert.ok(r.relationship.issues.includes('candidate-canonical-relationship-unestablished'));
    assert.equal(input.versions.length, 2);
    delete input.versions[1].canonical;
    assert.equal(preview(input).relationship.status, 'unresolved');
});

test('duplicate/conflicting mappings and unsupported schema/type remain explicit without first-match fallback', () => {
    const mutations = [i => i.versions.push(structuredClone(i.versions[1])),
        i => {i.candidate.flags.ptu.selectedVersion.id = 'fixture:other';},
        i => {i.versions[1].schemaVersion = 2;}, i => {i.versions[1].type = 'item';},
        i => {i.versions[1].version = {...i.versions[0].version};},
        i => {i.candidate.type = 'item';}];
    for (const mutate of mutations) {
        const input = fixtures(); mutate(input);
        const r = preview(input);
        assert.equal(r.relationship.status, 'unresolved');
        assert.ok(r.current.attribution.issues.length + r.candidate.attribution.issues.length > 0);
        assert.deepEqual(r.candidate.snapshot, input.candidate);
    }
});

test('unknown authoritative provenance never falls back to an old legacy stamp or another same-name instance', () => {
    const input = fixtures(); input.candidate.flags.core = {sourceId:input.versions[1].documentUuid};
    input.candidate._stats.compendiumSource = `Compendium.fixture.feats.Item.${id(9999)}`;
    const r = preview(input);
    assert.equal(r.relationship.status, 'unresolved'); assert.equal(r.candidate.attribution.selectedVersion, null);
    assert.ok(r.candidate.attribution.issues.includes('document-mapping-unestablished'));
    assert.ok(r.prerequisites.report.attributionIssues.includes('rule-version-unestablished'));
    assert.deepEqual(r.prerequisites.report.rawRequirements, input.candidate.system.prerequisites);
});

test('excluded and unclassified declarations preserve snapshots but do not establish alternatives', () => {
    for (const generationEligibility of ['excluded', 'unclassified']) {
        const input = fixtures(); input.versions[1].generationEligibility = generationEligibility;
        const r = preview(input);
        assert.equal(r.relationship.status, 'unresolved'); assert.equal(r.candidate.attribution.status, 'unresolved');
        assert.deepEqual(r.candidate.snapshot, input.candidate);
        assert.ok(r.outsidePreview.includes('acquisition-scope'));
    }
});

test('exact explicit UUIDs and consistent local IDs are required; type and same-owned-identity conflicts stay explicit', () => {
    for (const mutate of [i => {delete i.candidate.uuid;}, i => {i.candidate.uuid = 7;},
        i => {i.candidate._id = id(999);}, i => {i.candidate.id = id(999);},
        i => {i.candidate.uuid = i.current.uuid; i.candidate._id = i.current._id;}]) {
        const input = fixtures(); mutate(input); const r = preview(input);
        assert.equal(r.relationship.status, 'unresolved');
    }
    const input = fixtures(); const ability = fixtures('ability');
    input.candidate = ability.candidate; input.versions.push(...ability.versions);
    assert.deepEqual(preview(input).relationship, {status:'unresolved', issues:['item-type-mismatch']});
});

test('deterministic path arrays distinguish missing/null, key names, object order and ordered whole arrays', () => {
    const input = fixtures();
    input.current.system = JSON.parse('{"same":{"b":2,"a":1},"nullToMissing":null,"ordered":["a","b"],"nested":{"x.y":null},"a/b":1,"__proto__":{"safe":1}}');
    input.candidate.system = JSON.parse('{"__proto__":{"safe":2},"a/b":2,"nested":{"x.y":{},"added":null},"ordered":["b","a"],"missingToNull":null,"same":{"a":1,"b":2}}');
    const changes = preview(input).differences.changes;
    assert.deepEqual(changes.map(c => c.path), [['system','__proto__','safe'], ['system','a/b'],
        ['system','missingToNull'], ['system','nested','added'], ['system','nested','x.y'], ['system','nullToMissing'], ['system','ordered']]);
    assert.deepEqual(changes.find(c => c.path.at(-1) === 'missingToNull'), {path:['system','missingToNull'],
        before:{present:false}, after:{present:true,value:null}});
    assert.deepEqual(changes.find(c => c.path.at(-1) === 'nullToMissing'), {path:['system','nullToMissing'],
        before:{present:true,value:null}, after:{present:false}});
    assert.deepEqual(changes.at(-1).before.value, ['a','b']); assert.deepEqual(changes.at(-1).after.value, ['b','a']);
    assert.equal(Object.prototype.safe, undefined);
});

test('missing whole system, null, arrays and scalar changes keep exact presence and values', () => {
    const input = fixtures(); delete input.current.system; input.candidate.system = null;
    assert.deepEqual(preview(input).differences.changes, [{path:['system'], before:{present:false}, after:{present:true,value:null}}]);
    input.current.system = null; input.candidate.system = {custom:[1,null,{x:2}]};
    assert.deepEqual(preview(input).differences.changes[0].after.value, input.candidate.system);
    input.current.system = {custom:[1,null,{x:2}]};
    assert.deepEqual(preview(input).differences.changes, []);
});

test('scalar comparison does not coerce types or erase signed zero in supplied snapshots', () => {
    const input = fixtures(); input.current.system = {value:-0, number:1}; input.candidate.system = {value:0, number:'1'};
    const changes = preview(input).differences.changes;
    assert.deepEqual(changes.map(c => c.path), [['system','number'], ['system','value']]);
    assert.equal(typeof changes[0].before.value, 'number'); assert.equal(typeof changes[0].after.value, 'string');
    assert.ok(Object.is(changes[1].before.value, -0)); assert.ok(Object.is(changes[1].after.value, 0));
});

test('candidate diagnostics preserve raw text, aliases and unresolved prerequisite identities without a veto', () => {
    const input = fixtures('edge'); input.actor.system.skills.techEd = {value:{total:2}};
    input.candidate.system.prerequisites = ['  Novice   Technology Edu  ', 'Unknown prerequisite item', 'Level 1', 'GM Permission'];
    const r = preview(input);
    assert.equal(r.relationship.status, 'alternate-versions');
    assert.deepEqual(r.prerequisites.report.requirements.map(x => x.status), ['unmet','unverifiable','satisfied','unverifiable']);
    assert.equal(r.prerequisites.report.unmet[0].skillKey, 'techEd');
    assert.equal(r.prerequisites.report.unmet[0].raw, '  Novice   Technology Edu  ');
    assert.equal(r.prerequisites.report.identity.selectedVersion.id, input.versions[1].version.id);
    assert.equal(r.prerequisites.report.identity.uuid, input.candidate.uuid);
});

test('missing actor fields and missing/null/empty prerequisite lists remain distinct advisory observations', () => {
    for (const actor of [undefined, null, {}, {system:{skills:{}}}]) {
        const input = fixtures(); input.actor = actor;
        const r = preview(input); assert.equal(r.relationship.status, 'alternate-versions');
        assert.equal(r.prerequisites.report.unmet.length, 0);
        assert.equal(r.prerequisites.report.unverifiable.length, 3);
    }
    for (const mode of ['missing','null','empty']) {
        const input = fixtures();
        if (mode === 'missing') delete input.candidate.system.prerequisites;
        else input.candidate.system.prerequisites = mode === 'null' ? null : [];
        const r = preview(input);
        assert.equal(r.prerequisites.report.unverifiable.length, mode === 'empty' ? 0 : 1);
        assert.deepEqual(r.prerequisites.report.rawRequirements, input.candidate.system.prerequisites);
        assert.equal(r.relationship.status, 'alternate-versions');
    }
});

test('explicit evidenced prerequisite references use the supplied actor, without grants or source substitution', () => {
    const input = fixtures(); input.candidate.system.prerequisites = ['Required original', 'Missing second'];
    input.references = {'Required original':input.versions[0].documentUuid, 'Missing second':input.versions[1].documentUuid};
    const before = structuredClone(input), r = preview(input);
    assert.deepEqual(r.prerequisites.report.requirements.map(x => x.status), ['satisfied', 'unmet']);
    assert.equal(r.relationship.status, 'alternate-versions'); assert.deepEqual(input, before);
});

test('malformed reference identity is explicit and never guessed to be a known unmet item', () => {
    const input = fixtures(); input.candidate.system.prerequisites = ['Malformed reference'];
    for (const reference of ['a display name', {uuid:{}}, null]) {
        const r = preview({...input, references:{'Malformed reference':reference}});
        assert.equal(r.relationship.status, 'alternate-versions');
        assert.equal(r.prerequisites.report.unmet.length, 0); assert.equal(r.prerequisites.report.unverifiable.length, 1);
        assert.ok(r.contextIssues.some(i => i.reason === 'prerequisite-reference-identity-invalid'));
    }
});

for (const type of ['pokeedge','feat','edge']) test(`${type}: repeated/ranked owned instances and their choices remain independent`, () => {
    const input = fixtures(type), other = structuredClone(input.current);
    other._id = id(500); other.uuid = `Actor.${id(1000)}.Item.${id(500)}`;
    other.flags.ptu.rulesSelections.capability = 'fixture:two'; other.system.custom.rank = 3;
    input.actor.items.push(other);
    const before = structuredClone(input); freeze(input);
    const r = preview(input);
    assert.equal(r.current.snapshot.uuid, input.current.uuid);
    assert.deepEqual(r.current.snapshot.flags.ptu.rulesSelections, {capability:'fixture:one'});
    assert.equal(r.current.snapshot.system.cost, 1); assert.equal(r.current.snapshot.system.enabled, false);
    assert.equal(r.current.snapshot.system.effectUseCondition, 'Synthetic separate condition');
    assert.deepEqual(input, before); assert.equal(input.actor.items.length, 2);
});

test('all nested outputs are detached; repeat and JSON-restored previews give identical reports', () => {
    const input = fixtures(); input.mechanicChoices = {'fixture:mechanic':'optional'};
    const before = structuredClone(input); freeze(input);
    const first = preview(input);
    assert.deepEqual(preview(input), first); assert.deepEqual(preview(JSON.parse(JSON.stringify(input))), first);
    first.current.snapshot.flags.user.note = 'edited'; first.candidate.snapshot.system.rules.push({extra:true});
    first.current.attribution.source.edition = 'edited'; first.candidate.attribution.canonical.id = 'edited';
    first.differences.changes.find(c => c.path.at(-1) === 'prerequisites').after.value.push('edited');
    first.prerequisites.report.rawRequirements.push('edited'); first.mechanics.choices['fixture:mechanic'] = 'edited';
    assert.deepEqual(input, before);
});

test('mechanic preferences never alter selections or fields, even for invalid explicit preferences', () => {
    const input = fixtures('move'), base = preview(input);
    for (const mechanicChoices of [{}, {'fixture:a':'standard','fixture:b':'revised'}, {'fixture:a':null}, null]) {
        const r = preview({...input, mechanicChoices});
        assert.deepEqual(r.current, base.current); assert.deepEqual(r.candidate, base.candidate);
        assert.deepEqual(r.differences, base.differences); assert.deepEqual(r.mechanics.choices, mechanicChoices);
        assert.equal(r.mechanics.default, 'standard');
    }
});

test('malformed/missing inputs remain explicit instead of becoming repaired Items or an empty successful diff', () => {
    const empty = preview();
    assert.equal(empty.relationship.status, 'unresolved'); assert.equal(empty.differences.status, 'unavailable');
    assert.ok(empty.current.inputIssues.length); assert.ok(empty.candidate.inputIssues.length);
    assert.ok(empty.prerequisites.report.unverifiable.length);
    for (const candidate of [null, 7, [], {uuid:7, _id:7}, {name:{toString:2}}, {toObject:'not callable'}]) {
        const r = preview({...fixtures(), candidate});
        assert.equal(r.relationship.status, 'unresolved'); assert.ok(r.candidate.inputIssues.length);
        assert.deepEqual(r.candidate.snapshot, candidate);
    }
    const r = preview({...fixtures(), actor:{items:[null]}, versions:null, references:null});
    assert.equal(r.relationship.status, 'unresolved');
    assert.ok(r.contextIssues.some(i => i.reason === 'actor-items-invalid'));
    assert.ok(r.contextIssues.some(i => i.reason === 'versions-not-array'));
    assert.ok(r.contextIssues.some(i => i.reason === 'references-not-object'));
});

test('live methods, accessors, cycles and nonserialized data are rejected without calling them', () => {
    let calls = 0;
    const live = {toObject(){calls++; throw Error('Live query');}};
    const accessor = Object.defineProperty({}, 'uuid', {enumerable:true,get(){calls++; throw Error('Getter');}});
    const cycle = {}; cycle.system = cycle;
    for (const candidate of [live, accessor, cycle, new Date(), {custom:undefined}, {custom:NaN}, {custom:[,1]}]) {
        const r = preview({...fixtures(), candidate});
        assert.equal(r.relationship.status, 'unresolved'); assert.equal(r.candidate.snapshotAvailable, false);
        assert.ok(r.candidate.inputIssues.length);
    }
    assert.equal(calls, 0);
});

test('malformed request roots and request-field accessors are explicit and never invoked', () => {
    for (const root of [null, 42, [], 'invalid request']) {
        const r = preview(root);
        assert.equal(r.relationship.status, 'unresolved');
        assert.ok(r.contextIssues.some(i => i.reason === 'request-not-plain-object'));
    }
    let calls = 0;
    const input = fixtures();
    Object.defineProperty(input, 'candidate', {get(){calls++; throw Error('Request query');}});
    const r = preview(input);
    assert.equal(calls, 0); assert.equal(r.relationship.status, 'unresolved');
    assert.ok(r.contextIssues.some(i => i.reason === 'request-field-not-data'));
});

test('malformed source label does not coerce custom objects or hide the raw diagnostic report', () => {
    const input = fixtures(); input.candidate.system.source = {value:{toString:2}};
    const r = preview(input);
    assert.deepEqual(r.prerequisites.issues, ['source-label-not-text']);
    assert.equal(r.prerequisites.formatted, null); assert.equal(r.prerequisites.report.unmet.length, 1);
    assert.deepEqual(r.candidate.snapshot, input.candidate);
});

test('report marks unassessed authority and transfer/stack/use decisions, with no executable payload', () => {
    const r = preview(fixtures());
    assert.deepEqual(r.outsidePreview, ['ownership-and-permissions','production-source-approval','acquisition-scope',
        'state-transfer-policy','repeat-and-stacking-policy','effect-use-authorization']);
    for (const key of ['canApply','authorized','update','payload','transaction','permission']) assert.equal(Object.hasOwn(r,key), false);
    assert.equal(r.relationship.status, 'alternate-versions'); assert.equal(r.inspectionOnly, true);
});

test('correction: unsupported direct/wrapper item collections are explicit without losing valid skill/level facts', () => {
    for (const items of ['not a collection', '', 42, 0, true, false, {}, {contents:'not a collection'},
        {contents:''}, {contents:42}, {contents:0}, {contents:false}, {contents:null}, {contents:{}}]) {
        const input = fixtures(); input.actor.items = items;
        input.candidate.system.prerequisites = ['Required original', 'Novice Focus', 'Level 1', 'Master Focus', 'Level 2'];
        input.references = {'Required original':input.versions[0].documentUuid};
        const before = structuredClone(input); freeze(input);
        const r = preview(input);
        assert.equal(r.relationship.status, 'alternate-versions');
        assert.ok(r.contextIssues.some(i => i.input === 'actor' && i.reason === 'actor-items-invalid'));
        assert.deepEqual(r.prerequisites.report.requirements.map(v => v.status), ['unverifiable','satisfied','satisfied','unmet','unmet']);
        assert.equal(r.prerequisites.formatted.unmet.length, 2);
        assert.ok(r.prerequisites.report.unmet.every(v => v.kind !== 'item'));
        assert.deepEqual(input, before);
    }
});

test('correction: malformed serialized wrapper entries do not throw or invent a known missing item', () => {
    for (const entry of [null, 42, 'scalar', true, []]) for (const mixed of [false, true]) {
        const input = fixtures(); input.actor.items = {contents:mixed ? [input.current, entry] : [entry]};
        input.candidate.system.prerequisites = ['Required original', 'Novice Focus', 'Level 1'];
        input.references = {'Required original':input.versions[0].documentUuid};
        const before = structuredClone(input); freeze(input);
        const r = preview(input);
        assert.ok(r.contextIssues.some(i => i.reason === 'actor-items-invalid'));
        assert.equal(r.relationship.status, 'alternate-versions');
        assert.deepEqual(r.prerequisites.report.requirements.map(v => v.status), ['unverifiable','satisfied','satisfied']);
        assert.deepEqual(input, before);
    }
});

test('correction: malformed direct entries quarantine the collection without erasing unrelated actor facts', () => {
    for (const entry of [null, 42, 'scalar', false, []]) {
        const input = fixtures(); input.actor.items = [input.current, entry];
        input.candidate.system.prerequisites = ['Required original', 'Novice Focus', 'Level 1'];
        input.references = {'Required original':input.versions[0].documentUuid};
        const before = structuredClone(input); freeze(input);
        const r = preview(input);
        assert.equal(r.relationship.status, 'alternate-versions');
        assert.ok(r.contextIssues.some(i => i.reason === 'actor-items-invalid'));
        assert.deepEqual(r.prerequisites.report.requirements.map(v => v.status), ['unverifiable','satisfied','satisfied']);
        assert.deepEqual(input, before);
    }
});

test('correction: numeric non-index array properties cannot produce a complete empty diff', () => {
    for (const key of ['4294967295', '4294967296', '9007199254740991', '9007199254740992']) {
        const input = fixtures(); input.current.system = {custom:[]}; input.candidate.system = {custom:[]};
        input.current.system.custom[key] = 'unserialized-extra';
        const before = Object.getOwnPropertyDescriptors(input.current.system.custom); freeze(input);
        const r = preview(input);
        assert.equal(r.current.snapshotAvailable, false);
        assert.ok(r.current.inputIssues.some(i => i.reason === 'non-array-index' && i.path.at(-1) === key));
        assert.equal(r.differences.status, 'unavailable'); assert.equal(r.relationship.status, 'unresolved');
        assert.deepEqual(Object.getOwnPropertyDescriptors(input.current.system.custom),
            Object.fromEntries(Object.entries(before).map(([k,v]) => [k, {...v, configurable:false, writable:false}])));
    }
});

test('correction: valid direct/wrapper empty and populated collections retain missing/null semantics', () => {
    for (const mode of ['missing', 'null', 'empty', 'wrapper-empty', 'populated', 'wrapper-populated']) {
        const input = fixtures();
        if (mode === 'missing') delete input.actor.items;
        else if (mode === 'null') input.actor.items = null;
        else if (mode === 'empty') input.actor.items = [];
        else if (mode === 'wrapper-empty') input.actor.items = {contents:[]};
        else input.actor.items = mode === 'populated' ? [input.current] : {contents:[input.current]};
        input.candidate.system.prerequisites = ['Required original', 'Novice Focus', 'Level 1'];
        input.references = {'Required original':input.versions[0].documentUuid};
        const before = structuredClone(input); freeze(input);
        const r = preview(input);
        assert.equal(r.relationship.status, 'alternate-versions');
        assert.equal(r.contextIssues.some(i => i.reason === 'actor-items-invalid'), false);
        const membership = ['missing','null'].includes(mode) ? 'unverifiable'
            : ['empty','wrapper-empty'].includes(mode) ? 'unmet' : 'satisfied';
        assert.deepEqual(r.prerequisites.report.requirements.map(v => v.status), [membership,'satisfied','satisfied']);
        assert.deepEqual(preview(JSON.parse(JSON.stringify(input))), r);
        assert.deepEqual(input, before);
    }
});

test('correction: adjacent real/non-index array boundaries preserve dense arrays and reject sparse maxima safely', () => {
    const dense = fixtures(); dense.current.system = {custom:['first','second']}; dense.candidate.system = {custom:['first','second','third']};
    dense.current.system.custom['2'] = 'third';
    assert.equal(preview(dense).current.snapshotAvailable, true);
    assert.deepEqual(preview(dense).differences.changes, []);
    for (const key of ['4294967293','4294967294']) {
        const input = fixtures(); input.current.system = {custom:[]};
        input.current.system.custom[key] = 'real index, but sparse array';
        const beforeKeys = Reflect.ownKeys(input.current.system.custom), beforeLength = input.current.system.custom.length;
        freeze(input);
        const r = preview(input);
        assert.equal(r.current.snapshotAvailable, false);
        assert.ok(r.current.inputIssues.some(i => i.reason === 'sparse-array' && i.path.at(-1) === '0'));
        assert.equal(r.current.inputIssues.some(i => i.reason === 'non-array-index' && i.path.at(-1) === key), false);
        assert.equal(r.differences.status, 'unavailable');
        assert.deepEqual(Reflect.ownKeys(input.current.system.custom), beforeKeys);
        assert.equal(input.current.system.custom.length, beforeLength);
        assert.equal(input.current.system.custom[key], 'real index, but sparse array');
    }
    for (const key of ['01','1.0','-0','+1','1e0']) {
        const input = fixtures(); input.current.system = {custom:[]}; input.current.system.custom[key] = 'non-index';
        assert.ok(preview(input).current.inputIssues.some(i => i.reason === 'non-array-index' && i.path.at(-1) === key));
    }
});

// New identity-formatting probes; the original 35 cases above remain unchanged.
function identityFormattingFixture(type = 'feat') {
    const input = fixtures(type);
    input.actor.system.skills.techEd = {value:{total:3}};
    input.candidate.system.prerequisites = ['  Novice   Technology Edu  ', 'Level 1', 'Master Focus', 'GM Permission', 'Custom condition'];
    return input;
}

function assertRawIdentityInspection(input, expectedVersion) {
    const before = structuredClone(input); freeze(input);
    const result = preview(input);
    assert.equal(result.relationship.status, 'unresolved');
    assert.deepEqual(result.current.snapshot, before.current); assert.deepEqual(result.candidate.snapshot, before.candidate);
    assert.ok(result.candidate.inputIssues.some(i => i.reason === 'explicit-item-uuid-required'));
    assert.deepEqual(result.prerequisites.report.rawRequirements, before.candidate.system.prerequisites);
    assert.deepEqual(result.prerequisites.report.identity.id, before.candidate.id ?? before.candidate._id ?? null);
    assert.deepEqual(result.prerequisites.report.requirements.map(v => v.status),
        ['satisfied','satisfied','unmet','unverifiable','unverifiable']);
    assert.equal(result.prerequisites.report.identity.selectedVersion?.id ?? null, expectedVersion);
    assert.equal(result.prerequisites.formatted, null);
    assert.ok(result.prerequisites.issues.includes('identity-formatting-unavailable'));
    assert.equal(result.prerequisites.report.advisory, true);
    assert.deepEqual(preview(input), result);
    assert.deepEqual(preview(JSON.parse(JSON.stringify(input))), result);
    result.candidate.snapshot.flags.user.note = 'mutated output';
    result.prerequisites.report.rawRequirements.push('output only');
    result.prerequisites.report.identity.id = 'output only';
    result.prerequisites.issues.push('output only');
    assert.deepEqual(input, before);
    return result;
}

test('identity formatting: non-text candidate UUID retains raw diagnostics instead of invoking coercion', () => {
    for (const uuid of [{toString:2}, 42, false, []]) {
        const input = identityFormattingFixture(); input.candidate.uuid = uuid;
        const restored = JSON.parse(JSON.stringify(input));
        const result = assertRawIdentityInspection(restored, input.versions[1].version.id);
        assert.deepEqual(result.prerequisites.report.identity.uuid, uuid);
    }
});

test('identity formatting: absent UUID/source with non-text local-ID fallback remains explicit and unknown', () => {
    for (const id of [{toString:2}, 42, false, []]) {
        const input = identityFormattingFixture(); delete input.candidate.uuid; delete input.candidate._stats;
        input.candidate._id = id;
        const restored = JSON.parse(JSON.stringify(input));
        const result = assertRawIdentityInspection(restored, null);
        assert.ok(result.prerequisites.report.attributionIssues.includes('rule-version-unestablished'));
        assert.equal(result.candidate.attribution.status, 'unresolved');
        assert.deepEqual(result.candidate.attribution.storedSelection, input.candidate.flags.ptu.selectedVersion);
    }
});

test('identity formatting control: valid mapped pairs retain formatted diagnostics for every supported type', () => {
    for (const type of types) {
        const input = JSON.parse(JSON.stringify(identityFormattingFixture(type))), before = structuredClone(input); freeze(input);
        const result = preview(input);
        assert.equal(result.relationship.status, 'alternate-versions');
        assert.equal(result.prerequisites.formatted.unmet.length, 1); assert.equal(result.prerequisites.formatted.unknown.length, 2);
        assert.deepEqual(result.prerequisites.issues, []);
        assert.equal(result.prerequisites.report.identity.selectedVersion.id, input.versions[1].version.id);
        assert.deepEqual(preview(input), result); assert.deepEqual(input, before);
    }
});

test('identity formatting control: ordinary missing UUID and fully missing identity remain printable unknowns', () => {
    for (const missingAll of [false, true]) {
        const input = identityFormattingFixture(); delete input.candidate.uuid;
        if (missingAll) {delete input.candidate._id; delete input.candidate._stats;}
        const restored = JSON.parse(JSON.stringify(input)), before = structuredClone(restored); freeze(restored);
        const result = preview(restored);
        assert.equal(result.relationship.status, 'unresolved');
        assert.deepEqual(result.prerequisites.issues, []); assert.ok(result.prerequisites.formatted.unknown.length >= 2);
        assert.deepEqual(result.prerequisites.report.requirements.map(v => v.status),
            ['satisfied','satisfied','unmet','unverifiable','unverifiable']);
        assert.deepEqual(preview(JSON.parse(JSON.stringify(restored))), result); assert.deepEqual(restored, before);
    }
});
