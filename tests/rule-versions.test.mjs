import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupSelectedRuleVersion, lookupEffectiveRule, lookupMechanicChoice,
    ruleVersionMetadataErrors} from '../src/util/rule-versions.js';
import {diagnosePrerequisites, formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';

// Entirely synthetic contracts, not new pack records or approval of inherited/source counterparts.
const types = ['move', 'ability', 'feat', 'edge', 'pokeedge'];
const id = n => String(n).padStart(16, '0');
function fixture(type = 'feat', revised = false) {
    const n = types.indexOf(type) * 2 + Number(revised) + 1;
    const documentUuid = `Compendium.fixture.${type}s.Item.${id(n)}`;
    const version = {id:`fixture:${type}:${revised ? 'revised' : 'original'}`,
        label:`Synthetic ${revised ? 'revised' : 'original'}`, kind:revised ? 'revised' : 'original'};
    const metadata = {schemaVersion:1, documentUuid, type, version,
        generationEligibility:'eligible', canonical:{id:`fixture:benefit:${type}`, evidence:'Synthetic relationship assertion; no production mapping'},
        source:{id:`fixture:source:${n}`, edition:'Explicit synthetic contract fixture', status:'synthetic',
            publicationDate:null, citation:'This test fixture is not a published rule source'}};
    const item = {_id:id(100 + n), uuid:`Actor.${id(100)}.Item.${id(100 + n)}`, type, name:'Same visible name',
        _stats:{compendiumSource:documentUuid}, flags:{ptu:{selectedVersion:structuredClone(version),
            rulesSelections:{capability:'fixture:capability:one'}}, user:{note:'preserve'}},
        system:{prerequisites:revised ? ['Master Focus', 'Custom condition'] : ['Novice Focus'],
            description:revised ? 'Synthetic revised effect' : 'Synthetic original effect',
            rules:[{key:'Synthetic', value:revised ? 7 : 2}], enabled:true, free:false,
            uses:{value:0, max:2}, custom:{selection:'keep'}}};
    return {metadata, item};
}
function freeze(value) {
    if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
    return value;
}

for (const type of types) test(`${type}: selected record supplies complete effective data without blending versions`, () => {
    const original = fixture(type), revised = fixture(type, true);
    const versions = [original.metadata, revised.metadata];
    const before = structuredClone({original, revised, versions});
    freeze(original); freeze(revised); freeze(versions);
    for (const current of [original, revised]) {
        const result = lookupEffectiveRule(current.item, {versions, mechanicChoices:{'fixture:capture':'custom'}});
        assert.equal(result.selection.status, 'resolved');
        assert.equal(result.selection.identity.sourceId, current.metadata.documentUuid);
        assert.deepEqual(result.selection.selectedVersion, current.metadata.version);
        assert.deepEqual(result.selection.rawPrerequisites, current.item.system.prerequisites);
        assert.deepEqual(result.system, current.item.system);
        assert.equal(result.system.rules.length, 1);
        assert.deepEqual(result.mechanicChoices, {'fixture:capture':'custom'});
    }
    assert.deepEqual({original, revised, versions}, before);
});

test('renaming/localization and identical labels never establish or change document/canonical identity', () => {
    const first = fixture('ability'), second = fixture('ability', true);
    second.metadata.canonical = {id:'fixture:different-benefit', evidence:'Synthetic distinct relationship'};
    const versions = [first.metadata, second.metadata];
    for (const name of ['Renamed by user', 'Puissance', first.item.name]) {
        assert.equal(lookupSelectedRuleVersion({...first.item, name}, {versions}).canonical.id, first.metadata.canonical.id);
    }
    assert.equal(lookupSelectedRuleVersion(second.item, {versions}).canonical.id, 'fixture:different-benefit');
    const unknown = {...first.item, _stats:{compendiumSource:`Compendium.fixture.abilities.Item.${id(999)}`}};
    const result = lookupSelectedRuleVersion(unknown, {versions});
    assert.equal(result.status, 'unresolved'); assert.equal(result.selectedVersion, null);
    assert.ok(result.issues.includes('document-mapping-unestablished'));
});

test('modern source identity wins; pack documents use their actual identity rather than old export provenance', () => {
    const original = fixture(), revised = fixture('feat', true), versions = [original.metadata, revised.metadata];
    const data = structuredClone(revised.item);
    data.flags.core = {sourceId:original.metadata.documentUuid};
    assert.equal(lookupSelectedRuleVersion(data, {versions}).selectedVersion.id, revised.metadata.version.id);
    const legacy = structuredClone(original.item); delete legacy._stats;
    legacy.flags.core = {sourceId:original.metadata.documentUuid};
    assert.equal(lookupSelectedRuleVersion(legacy, {versions}).status, 'resolved');
    const pack = {...original.item, pack:'fixture.feats', uuid:original.metadata.documentUuid,
        _stats:{compendiumSource:revised.metadata.documentUuid}};
    assert.equal(lookupSelectedRuleVersion(pack, {versions}).selectedVersion.id, original.metadata.version.id);
    // Never fall back to a convenient old stamp if the authoritative source is unknown.
    data._stats.compendiumSource = 'Compendium.fixture.feats.Item.unknown000000001';
    assert.equal(lookupSelectedRuleVersion(data, {versions}).status, 'unresolved');
});

test('stored selection conflicts/malformed attribution remain unresolved without selecting a default', () => {
    const f = fixture(), versions = [f.metadata];
    for (const selectedVersion of ['legacy-choice', {id:'other-version', label:f.metadata.version.label},
        {label:f.metadata.version.label}, {}, 42, '']) {
        const item = structuredClone(f.item); item.flags.ptu.selectedVersion = selectedVersion;
        const before = structuredClone(item), result = lookupEffectiveRule(item, {versions});
        assert.equal(result.selection.status, 'unresolved'); assert.equal(result.selection.selectedVersion, null);
        assert.deepEqual(result.selection.storedSelection, selectedVersion);
        assert.deepEqual(result.system, before.system); assert.deepEqual(item, before);
    }
    const renamed = structuredClone(f.item); renamed.flags.ptu.selectedVersion.label = 'Custom display label';
    const report = lookupSelectedRuleVersion(renamed, {versions});
    assert.equal(report.status, 'resolved'); assert.equal(report.storedSelection.label, 'Custom display label');
    delete renamed.flags.ptu.selectedVersion;
    assert.equal(lookupSelectedRuleVersion(renamed, {versions}).status, 'resolved');
    assert.equal(renamed.flags.ptu.selectedVersion, undefined);
});

test('revision-only addition does not manufacture an original, a canonical counterpart or a revised world default', () => {
    const f = fixture('ability', true); f.metadata.version.kind = 'addition'; f.metadata.canonical = null;
    const versions = freeze([f.metadata]);
    const result = lookupEffectiveRule(f.item, {versions});
    assert.equal(result.selection.status, 'resolved'); assert.equal(result.selection.canonical, null);
    assert.equal(result.selection.selectedVersion.kind, 'addition'); assert.equal(versions.length, 1);
    assert.deepEqual(lookupMechanicChoice('fixture:general-rule'), {status:'default', value:'standard'});
    assert.deepEqual(result.system, f.item.system);
});

test('duplicate document/version mappings and type conflicts never pick a first match', () => {
    const f = fixture(), other = fixture('feat', true);
    for (const versions of [[f.metadata, structuredClone(f.metadata)],
        [f.metadata, {...other.metadata, version:f.metadata.version}]]) {
        assert.equal(lookupSelectedRuleVersion(f.item, {versions}).status, 'unresolved');
    }
    const conflict = {...f.metadata, type:'ability'};
    assert.ok(lookupSelectedRuleVersion(f.item, {versions:[conflict]}).issues.includes('mapped-item-type-conflict'));
});

test('shared edition tokens do not merge distinct canonical benefits or document IDs', () => {
    const first = fixture('ability'), second = fixture('ability', true);
    second.metadata.canonical = {id:'fixture:other-ability', evidence:'Synthetic separate benefit'};
    second.metadata.version = {...first.metadata.version};
    second.item.flags.ptu.selectedVersion = {...first.metadata.version};
    const versions = [first.metadata, second.metadata];
    assert.equal(lookupSelectedRuleVersion(first.item, {versions}).status, 'resolved');
    assert.equal(lookupSelectedRuleVersion(second.item, {versions}).status, 'resolved');
    assert.notEqual(lookupSelectedRuleVersion(first.item, {versions}).canonical.id,
        lookupSelectedRuleVersion(second.item, {versions}).canonical.id);
});

test('unmapped/custom and incomplete data retain exact saved data through repeat lookup and JSON reload', () => {
    const f = fixture(); f.item.system.prerequisites = null; f.item.system.rules = [];
    const before = structuredClone(f.item);
    const first = lookupEffectiveRule(f.item);
    for (let n = 0; n < 2; n++) assert.deepEqual(lookupEffectiveRule(JSON.parse(JSON.stringify(f.item))), first);
    assert.equal(first.selection.status, 'unresolved'); assert.equal(first.selection.rawPrerequisites, null);
    assert.deepEqual(first.system, before.system); assert.deepEqual(f.item, before);
    assert.equal(lookupEffectiveRule().selection.status, 'unresolved');
    assert.ok(lookupSelectedRuleVersion(f.item, {versions:null}).issues.includes('version-registry-invalid'));
    assert.equal(lookupSelectedRuleVersion(f.item, {versions:[null, {}, 1]}).status, 'unresolved');
});

test('scope and source status are separate declarations; a filename cannot turn a playtest into official errata', () => {
    const f = fixture(); f.metadata.source = {...f.metadata.source, status:'optional-playtest',
        edition:'Synthetic optional packet', citation:'Synthetic /Errata/ fixture, not official errata', publicationDate:'2015-05'};
    assert.equal(lookupSelectedRuleVersion(f.item, {versions:[f.metadata]}).source.status, 'optional-playtest');
    for (const generationEligibility of ['excluded', 'unclassified']) {
        const result = lookupEffectiveRule(f.item, {versions:[{...f.metadata, generationEligibility}]});
        assert.equal(result.selection.status, 'unresolved'); assert.equal(result.selection.selectedVersion, null);
        assert.deepEqual(result.system, f.item.system); // Preservation, not scope approval or acquisition permission.
    }
    f.metadata.source.status = 'unknown';
    assert.equal(lookupSelectedRuleVersion(f.item, {versions:[f.metadata]}).status, 'unresolved');
});

test('metadata requires explicit schema, source, version and canonical evidence without inventing precision', () => {
    const {metadata} = fixture();
    assert.deepEqual(ruleVersionMetadataErrors(metadata), []);
    for (const date of [null, '2015', '2015-05', '2016-02-29']) {
        assert.deepEqual(ruleVersionMetadataErrors({...metadata, source:{...metadata.source, publicationDate:date}}), []);
    }
    for (const date of [undefined, '', '0000', '2015-13', '2015-02-29', '2016-04-31']) {
        assert.ok(ruleVersionMetadataErrors({...metadata, source:{...metadata.source, publicationDate:date}}).includes('source-date-invalid'));
    }
    for (const bad of [null, {...metadata, schemaVersion:2}, {...metadata, documentUuid:''},
        {...metadata, documentUuid:'r04-r0232'}, {...metadata, type:'item'},
        {...metadata, version:{id:'v', label:'label'}}, {...metadata, generationEligibility:null},
        {...metadata, canonical:{id:'fixture:guessed'}}, {...metadata, canonical:{id:'r04-c0046', evidence:'catalog coordinate only'}},
        {...metadata, source:{...metadata.source, citation:''}}]) assert.ok(ruleVersionMetadataErrors(bad).length);
});

test('effective data feeds existing version-specific advisory diagnostics without granting or raising skills', () => {
    const a = {uuid:'Actor.fixture', system:{level:{current:1}, skills:{focus:{value:{total:3}}}}, items:[]};
    const original = fixture(), revised = fixture('feat', true), versions = [original.metadata, revised.metadata];
    const before = structuredClone({a, original, revised});
    for (const f of [original, revised]) {
        const effective = lookupEffectiveRule(f.item, {versions});
        const report = diagnosePrerequisites({actor:a, item:{...f.item, system:effective.system}, selectedVersion:effective.selection.selectedVersion});
        const warnings = formatPrerequisiteDiagnostics(report);
        assert.equal(report.advisory, true); assert.equal(report.identity.selectedVersion.id, f.metadata.version.id);
        assert.deepEqual(report.rawRequirements, f.item.system.prerequisites);
        assert.equal(warnings.unmet.length, f === original ? 0 : 1);
        assert.equal(warnings.unknown.length, f === original ? 0 : 1);
    }
    assert.deepEqual({a, original, revised}, before);
});

test('repeatable Poke Edge instances keep independent owned identity, choices, costs and conditions', () => {
    const f = fixture('pokeedge'), second = structuredClone(f.item);
    f.item.system.cost = 1; f.item.system.useCondition = 'Synthetic capability use condition';
    second._id = id(888); second.uuid = `Actor.${id(100)}.Item.${second._id}`;
    second.flags.ptu.rulesSelections.capability = 'fixture:capability:two';
    const items = freeze([f.item, second]), versions = freeze([f.metadata]), before = structuredClone(items);
    for (let n = 0; n < 2; n++) {
        const outputs = items.map(item => lookupEffectiveRule(item, {versions}));
        assert.notEqual(outputs[0].selection.identity.uuid, outputs[1].selection.identity.uuid);
        assert.equal(outputs[0].selection.canonical.id, outputs[1].selection.canonical.id);
        assert.deepEqual(outputs.map(o => o.system), before.map(i => i.system));
        assert.deepEqual(outputs.map(o => o.selection.storedSelection), before.map(i => i.flags.ptu.selectedVersion));
    }
    assert.deepEqual(items, before);
});

test('independent mechanics default to standard; explicit choices never replace selected content', () => {
    const f = fixture('move', true), versions = [f.metadata];
    const choices = freeze({'fixture:mechanic-a':'original', 'fixture:mechanic-b':'optional-playtest'});
    const before = structuredClone({f, choices});
    assert.deepEqual(lookupMechanicChoice('fixture:mechanic-a', choices), {status:'explicit', value:'original'});
    assert.deepEqual(lookupMechanicChoice('fixture:mechanic-b', choices), {status:'explicit', value:'optional-playtest'});
    assert.deepEqual(lookupMechanicChoice('fixture:mechanic-c', choices), {status:'default', value:'standard'});
    for (const mechanicChoices of [{}, choices]) {
        const output = lookupEffectiveRule(f.item, {versions, mechanicChoices});
        assert.equal(output.selection.selectedVersion.id, f.metadata.version.id);
        assert.deepEqual(output.system, f.item.system);
    }
    assert.equal(lookupMechanicChoice('a', {a:null}).status, 'unresolved');
    assert.equal(lookupMechanicChoice('a', null).status, 'unresolved');
    assert.equal(lookupMechanicChoice('', choices).status, 'unresolved');
    assert.equal(lookupMechanicChoice('a', Object.create({a:'revised'})).value, 'standard');
    assert.deepEqual({f, choices}, before);
});

test('Foundry-style document reads once and output mutation cannot write back metadata, choices or owned state', () => {
    const f = fixture(), versions = [f.metadata], choices = {capture:'standard'};
    const before = structuredClone({f, choices}); let reads = 0;
    const document = {uuid:f.item.uuid, id:f.item._id, toObject(){reads++; return structuredClone(f.item);},
        update(){throw Error('No writes allowed');}, actor:{isOwner:false}};
    const output = lookupEffectiveRule(document, {versions, mechanicChoices:choices});
    assert.equal(reads, 1); assert.equal(output.selection.status, 'resolved');
    output.system.prerequisites.push('Edited output'); output.system.custom.selection = 'edited';
    output.selection.source.edition = 'edited'; output.selection.canonical.id = 'edited';
    output.selection.selectedVersion.id = 'edited'; output.selection.storedSelection.id = 'edited';
    output.mechanicChoices.capture = 'edited';
    assert.deepEqual({f, choices}, before);
});
