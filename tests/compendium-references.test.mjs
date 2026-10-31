import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {auditCompendiumReferences, referenceProfile} from '../tools/compendium-references.mjs';

const id = '0123456789abcdef';
const missing = 'fedcba9876543210';
const uuid = `Compendium.ptu.moves.Item.${missing}`;
const doc = data => ({pack: 'species', data: {_id: id, type: 'species', ...data}});

test('typed and legacy UUIDs retain every occurrence but deduplicate target and source inventories', () => {
    const data = doc({system: {moves: {level: [{uuid}, {uuid: uuid.replace('.Item.', '.')}]}}});
    const before = structuredClone(data);
    const report = auditCompendiumReferences([data]);
    assert.deepEqual(data, before);
    assert.equal(report.targets.length, 1);
    assert.equal(report.targets[0].occurrences.length, 2);
    assert.deepEqual(report.targets[0].sources, [`species.${id}`]);
    assert.equal(report.targets[0].classification, 'runtime-reference');
    assert.equal(report.targets[0].occurrences[1].pointer, '/system/moves/level/1/uuid');
    assert.deepEqual(auditCompendiumReferences([data, {pack: 'moves', data: {_id: missing}}]).targets, []);
});

test('metadata is preserved with a legacy runtime caveat and mixed targets stay runtime references', () => {
    const data = doc({_stats: {compendiumSource: uuid}, flags: {core: {sourceId: uuid}}});
    const historical = auditCompendiumReferences([data]).targets[0];
    assert.equal(historical.classification, 'historical-metadata');
    assert.equal(historical.disposition, 'preserve-provenance-with-runtime-caveat');
    assert.deepEqual(new Set(historical.occurrences.map(row => row.profile)), new Set(['import-provenance', 'legacy-import-provenance']));
    data.data.system = {moves: {machine: [{uuid}]}};
    assert.equal(auditCompendiumReferences([data]).targets[0].classification, 'runtime-reference');
});

test('unknown fields and unfamiliar rule types require review; JSON pointers escape object keys', () => {
    const data = doc({'custom/key~': uuid, system: {rules: [{key: 'Unknown', uuid}]}});
    const row = auditCompendiumReferences([data]).targets[0];
    assert.equal(row.classification, 'unclassified');
    assert.equal(row.occurrences[0].pointer, '/custom~1key~0');
    assert.equal(referenceProfile(['system','rules','0','uuid'], {system:{rules:[{key:'TemporarySpecies'}]}}), 'temporary-species');
});

test('UUID token boundaries do not accept longer IDs or a different system namespace', () => {
    const result = auditCompendiumReferences([doc({_stats: {compendiumSource: `${uuid}x Compendium.other.moves.Item.${missing}`}})]);
    assert.equal(result.targets.length, 0);
});

test('committed reference inventory covers every current source occurrence without changing the structural target list', async () => {
    const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
    const manifest = await readJSON('system.json');
    const documents = [];
    for (const pack of manifest.packs) for (const file of (await readdir(`packs/${pack.name}/_source`)).sort()) {
        if (file.endsWith('.json')) documents.push({pack:pack.name, data:await readJSON(`packs/${pack.name}/_source/${file}`)});
    }
    const computed = auditCompendiumReferences(documents);
    const structural = await readJSON('docs/data/content-audit.json');
    const recorded = await readJSON('docs/data/compendium-reference-audit.json');
    assert.deepEqual(computed.targets.map(({target,sources}) => ({target,sources})), structural.missingReferences);
    assert.deepEqual(computed.targetCounts, recorded.targetCounts);
    assert.deepEqual(computed.occurrenceCounts, recorded.occurrenceCounts);
    assert.deepEqual(computed.targets.map(({target,classification,occurrences}) => ({target,classification,occurrences})),
        recorded.targets.map(({target,classification,occurrences}) => ({target,classification,occurrences})));
    assert.equal(computed.targetCounts.unclassified ?? 0, 0);
    assert.ok(recorded.targets.every(row => row.disposition !== 'needs-investigation' && row.disposition !== 'needs-revalidation'));
});
