import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateEchoesVersionDraft} from '../tools/rule-version-echoes-draft.mjs';
import {diagnosePrerequisites, formatPrerequisiteDiagnostics} from '../src/util/prerequisites.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const draft = JSON.parse(read('docs/data/rule-version-echoes-draft.json'));
const evidencePaths = ['system.json', 'docs/data/source-authority.json', 'template.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const ids = ['moves.Y5R5mbVcGq6fwoFj', 'abilities.oNB76oqVYrjhYd7W', 'feats.aJ47Z5z6Az9c8Dy8', 'poke-edges.WkzCUjTOCTI60Uwg', 'abilities.nuGa21WQ0QD07kQj'];
const inputs = {pilot: JSON.parse(read('docs/data/rule-version-pilot.json')), revisions: read('docs/data/rules-revisions.json'),
    sourceEvidence: Object.fromEntries(evidencePaths.map(p => [p, read(p)])),
    currentRecords: Object.fromEntries(ids.map(id => { const [pack, key] = id.split('.'); return [id, read(`packs/${pack}/_source/${key}.json`)]; })),
    existingFeatIds: readdirSync(new URL('../packs/feats/_source/', import.meta.url)).filter(x => x.endsWith('.json')).map(x => x.slice(0, -5))};
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sources = JSON.parse(inputs.sourceEvidence['docs/data/feature-source-evidence.json']);
const definitions = ['core:140:feature-line35', 'may:7:feature-line27'].map(id => sources.sourceDefinitions.find(x => x.id === id));
function rejected(label, change, expected) {
    test(label, () => {
        const d = structuredClone(draft);
        const i = {...inputs, pilot: structuredClone(inputs.pilot), sourceEvidence: {...inputs.sourceEvidence}, currentRecords: {...inputs.currentRecords}, existingFeatIds: [...inputs.existingFeatIds]};
        change(d, i);
        const issues = validateEchoesVersionDraft(d, i);
        assert.ok(issues.some(x => x.includes(expected)), JSON.stringify(issues));
    });
}

test('actual two-role draft passes complete upstream/source/schema/identity integrity', () => {
    assert.deepEqual(validateEchoesVersionDraft(draft, inputs), []);
    assert.deepEqual(draft.roles.map(x => x.role), ['baseline', 'revised']);
    const template = JSON.parse(inputs.sourceEvidence['template.json']);
    const expectedFields = [...new Set([...Object.keys(template.Item.templates.base), ...Object.keys(template.Item.feat).filter(x => x !== 'templates')])].sort();
    for (const row of draft.roles) {
        assert.equal(row.item.type, 'feat');
        assert.deepEqual(Object.keys(row.item.system).sort(), expectedFields);
        assert.deepEqual(row.item.system.rules, []);
        assert.deepEqual(row.item.system.keywords, []);
        assert.equal(row.item.system.class, '');
        assert.equal(row.item.system.schema.version, null);
        assert.equal(row.productionMapping, null);
        assert.equal(row.generationEligibility, 'unclassified');
        for (const key of ['_id', '_stats', 'flags', 'ownership', 'useCount', 'automation']) assert.equal(Object.hasOwn(row.item, key) || Object.hasOwn(row.item.system, key), false);
    }
});

test('both complete printed definitions independently establish the only leaf difference and typed mechanics', () => {
    assert.equal(definitions[0].definition.prerequisites[0].text, 'Master General Education');
    assert.match(definitions[1].definition.prerequisites[0].text, /^Breadth of Knowledge, Master General\s+Education$/);
    for (const unit of definitions) {
        assert.deepEqual(unit.definition.sections.map(x => x.kind), ['prerequisites', 'frequency', 'trigger', 'effect']);
        assert.equal(unit.definition.sections[1].text, 'Daily x2 – Free Action');
        assert.equal(unit.definition.sections[2].text, 'Y ou or your Pokémon make a roll');
        assert.equal(unit.definition.sections[3].text, 'Y ou may roll twice and keep the best result.');
    }
    assert.deepEqual(draft.roles[0].item.system.prerequisites, ['Master General Education']);
    assert.deepEqual(draft.roles[1].item.system.prerequisites, ['Breadth of Knowledge', 'Master General Education']);
    for (const row of draft.roles) {
        assert.equal(row.item.system.frequency, 'Daily x2 – Free Action');
        assert.equal(row.item.system.effect, 'Trigger: You or your Pokémon make a roll\nEffect: You may roll twice and keep the best result.');
    }
    assert.match(draft.representation.fracturedPronoun, /Y ou.*You/);
});

test('parent restrictions stay visible without becoming leaf prerequisites, tags or executable grants', () => {
    const parent = sources.parentFrames.find(x => x.id === 'core-parent-researcher');
    assert.equal(draft.parentContext.jsonSha256, digest(parent));
    assert.match(draft.parentContext.summary, /chooses two Fields.*one qualifying Feature.*chosen Fields.*different Fields/);
    assert.equal(draft.parentContext.disposition, 'context-only');
    assert.equal(draft.parentContext.leafPrerequisitesAdded, false);
    assert.equal(draft.parentContext.executableGrants, false);
    for (const row of draft.roles) assert.ok(row.item.system.prerequisites.every(x => !x.includes('Researcher')));
    assert.deepEqual(draft.unresolvedAuthoring.map(x => x.code).sort(), ['class-and-branch-metadata', 'historical-provenance-and-adoption', 'parent-selection-and-grants']);
});

test('proposed pair identities are distinct from every finite installed ID and the unresolved historical pointer', () => {
    const all = draft.roles.flatMap(x => [x.proposedIdentity.itemId, x.proposedIdentity.versionId]);
    all.push(draft.roles[0].proposedIdentity.canonicalId);
    assert.equal(new Set(all).size, 5);
    assert.equal(draft.roles[0].proposedIdentity.canonicalId, draft.roles[1].proposedIdentity.canonicalId);
    for (const id of all) {
        assert.match(id, /^[A-Za-z0-9]{16}$/);
        assert.equal(inputs.existingFeatIds.includes(id), false);
        assert.equal(['aJ47Z5z6Az9c8Dy8', 'ta6bKIiHCuccjTqU'].includes(id), false);
    }
    const inherited = JSON.parse(inputs.currentRecords[ids[2]]);
    assert.equal(inherited._stats.compendiumSource, 'Compendium.ptu.feats.ta6bKIiHCuccjTqU');
    assert.notEqual(inherited._id, draft.roles[1].proposedIdentity.itemId);
});

// Diagnostic adapters are temporary test snapshots, never installed documents.
// The Breadth reference/actor UUIDs below are explicitly synthetic identity evidence.
const references = {'Breadth of Knowledge': {uuid: 'Item.0000000000000099'}};
const actor = (rank = 6, items = []) => ({uuid: 'Actor.0000000000000088', system: {skills: {generalEd: {value: {total: rank}}}}, items});
function report(row, snapshot, refs = references) {
    const item = {...structuredClone(row.item), _id: row.proposedIdentity.itemId};
    return diagnosePrerequisites({actor: snapshot, item, selectedVersion: {id: row.proposedIdentity.versionId, label: `${row.source.edition} (non-runtime draft)`}, references: refs});
}

test('actual draft requirements yield separate item-attributed advisory reports for Master without Breadth', () => {
    const a = actor();
    const before = digest({a, draft, references});
    const core = report(draft.roles[0], a), may = report(draft.roles[1], a);
    assert.equal(core.advisory, true);
    assert.equal(core.satisfied.length, 1);
    assert.equal(core.unmet.length, 0);
    assert.equal(may.satisfied.length, 1);
    assert.equal(may.unmet.length, 1);
    assert.equal(may.unmet[0].raw, 'Breadth of Knowledge');
    assert.equal(may.unmet[0].requiredIdentity, references['Breadth of Knowledge'].uuid);
    for (const [index, r] of [core, may].entries()) {
        const row = draft.roles[index];
        assert.equal(r.identity.id, row.proposedIdentity.itemId);
        assert.equal(r.identity.selectedVersion.id, row.proposedIdentity.versionId);
        assert.deepEqual(r.identity.source, row.item.system.source);
        assert.deepEqual(r.rawRequirements, row.item.system.prerequisites);
        assert.equal(r.identity.sourceId, null);
        assert.equal(r.identity.uuid, null);
        assert.deepEqual(r.attributionIssues, []);
        for (const key of ['allowed', 'canAcquire', 'acquisitionDecision', 'grants']) assert.equal(Object.hasOwn(r, key), false);
    }
    const text = formatPrerequisiteDiagnostics(may).unmet[0];
    assert.ok(text.includes(draft.roles[1].proposedIdentity.itemId));
    assert.ok(text.includes('May 2015 playtest'));
    assert.ok(text.includes('Breadth of Knowledge'));
    assert.equal(digest({a, draft, references}), before);
    assert.equal(a.items.length, 0);
    assert.equal(a.system.skills.generalEd.value.total, 6);
    assert.ok(draft.roles.every(x => x.item.system.enabled));
});

test('known missing requirements and unavailable/custom facts remain separate without grants or rank changes', () => {
    const missing = actor(2);
    const before = digest({missing, draft});
    const core = report(draft.roles[0], missing), may = report(draft.roles[1], missing);
    assert.equal(core.unmet.length, 1);
    assert.equal(may.unmet.length, 2);
    assert.deepEqual(may.unmet.map(x => x.kind), ['item', 'skill']);
    const mixed = report(draft.roles[1], missing, {});
    assert.equal(mixed.unmet.length, 1);
    assert.equal(mixed.unverifiable.length, 1);
    assert.equal(mixed.unverifiable[0].reason, 'custom-or-unresolved-identity');
    const unavailable = {uuid: missing.uuid, system: {skills: {}}};
    const unknown = report(draft.roles[1], unavailable);
    assert.equal(unknown.unmet.length, 0);
    assert.equal(unknown.unverifiable.length, 2);
    assert.deepEqual(unknown.unverifiable.map(x => x.reason), ['missing-owned-item-collection', 'missing-or-invalid-skill-rank']);
    assert.equal(digest({missing, draft}), before);
    assert.equal(missing.system.skills.generalEd.value.total, 2);
    assert.equal(missing.items.length, 0);
});

test('both actual draft requirements can be satisfied using explicit synthetic identity evidence', () => {
    const a = actor(6, [{uuid: references['Breadth of Knowledge'].uuid}]);
    const before = digest(a);
    const may = report(draft.roles[1], a);
    assert.equal(may.satisfied.length, 2);
    assert.equal(may.unmet.length + may.unverifiable.length, 0);
    assert.equal(digest(a), before);
});

test('repeated validation and LF/CRLF schema transport preserve all supplied inputs and identities', () => {
    const before = digest({draft, inputs});
    assert.deepEqual(validateEchoesVersionDraft(draft, inputs), []);
    assert.deepEqual(validateEchoesVersionDraft(draft, inputs), []);
    const i = {...inputs, sourceEvidence: {...inputs.sourceEvidence, 'template.json': inputs.sourceEvidence['template.json'].replaceAll('\r\n', '\n')}};
    assert.deepEqual(validateEchoesVersionDraft(draft, i), []);
    assert.equal(digest({draft, inputs}), before);
});

rejected('swapped core and May source roles', d => [d.roles[0].source, d.roles[1].source] = [d.roles[1].source, d.roles[0].source], 'source-role');
rejected('May prerequisite omitted', d => d.roles[1].item.system.prerequisites.shift(), 'complete-source-or-neutral-fields');
rejected('May prerequisite blended into core', d => d.roles[0].item.system.prerequisites.unshift('Breadth of Knowledge'), 'complete-source-or-neutral-fields');
rejected('Master prerequisite omitted', d => d.roles[0].item.system.prerequisites = [], 'complete-source-or-neutral-fields');
rejected('parent restriction invented as a leaf prerequisite', d => d.roles[0].item.system.prerequisites.push('Researcher'), 'complete-source-or-neutral-fields');
rejected('changed printed frequency count', d => d.roles[0].item.system.frequency = 'Daily x1 – Free Action', 'complete-source-or-neutral-fields');
rejected('changed printed action', d => d.roles[1].item.system.frequency = 'Daily x2 – Standard Action', 'complete-source-or-neutral-fields');
rejected('Pokémon omitted from trigger', d => d.roles[0].item.system.effect = 'Trigger: You make a roll\nEffect: You may roll twice and keep the best result.', 'complete-source-or-neutral-fields');
rejected('best result changed to worst', d => d.roles[1].item.system.effect = d.roles[1].item.system.effect.replace('best', 'worst'), 'complete-source-or-neutral-fields');
rejected('complete effect omitted', d => d.roles[0].item.system.effect = 'Trigger: You or your Pokémon make a roll', 'complete-source-or-neutral-fields');
rejected('parent context omitted', d => d.parentContext = null, 'parent-context');
rejected('parent context falsely applies prerequisites', d => d.parentContext.leafPrerequisitesAdded = true, 'parent-context');
rejected('inherited Branch tags copied', d => d.roles[1].item.system.keywords = ['General Research Field', 'Branch'], 'complete-source-or-neutral-fields');
rejected('inherited class copied', d => d.roles[1].item.system.class = 'Researcher (General)', 'complete-source-or-neutral-fields');
rejected('executable grant introduced', d => d.roles[0].item.system.rules.push({key: 'GrantItem', uuid: 'Item.0000000000000099'}), 'complete-source-or-neutral-fields');
rejected('inherited automation property copied', d => d.roles[1].item.system.automation = [], 'complete-source-or-neutral-fields');
rejected('inherited use counter copied', d => d.roles[1].item.system.useCount = 0, 'complete-source-or-neutral-fields');
rejected('inherited permission assignment copied', d => d.roles[1].item.ownership = {default: 3}, 'item-envelope');
rejected('forged modern provenance copied', d => d.roles[1].item._stats = {compendiumSource: 'Compendium.ptu.feats.ta6bKIiHCuccjTqU'}, 'item-envelope');
rejected('stored campaign selection introduced', d => d.roles[1].item.flags = {ptu: {selectedVersion: 'latest'}}, 'item-envelope');
rejected('runtime identity placed outside proposed identity fields', d => d.roles[0]._id = d.roles[0].proposedIdentity.itemId, 'role-envelope');
rejected('current Echoes ID reused', d => d.roles[0].proposedIdentity.itemId = 'aJ47Z5z6Az9c8Dy8', 'proposed-id-or-collision');
rejected('historical Echoes ID reused', d => d.roles[1].proposedIdentity.itemId = 'ta6bKIiHCuccjTqU', 'proposed-id-or-collision');
rejected('another installed feat ID reused', (d,i) => d.roles[0].proposedIdentity.itemId = i.existingFeatIds.find(x => x !== 'aJ47Z5z6Az9c8Dy8'), 'proposed-id-or-collision');
rejected('duplicate proposed Item IDs', d => d.roles[1].proposedIdentity.itemId = d.roles[0].proposedIdentity.itemId, 'distinct-proposed-pair-identities');
rejected('duplicate version IDs', d => d.roles[1].proposedIdentity.versionId = d.roles[0].proposedIdentity.versionId, 'distinct-proposed-pair-identities');
rejected('unrelated canonical identities substituted', d => d.roles[1].proposedIdentity.canonicalId = '0000000000000001', 'distinct-proposed-pair-identities');
rejected('catalog coordinate used as identity', d => d.roles[0].proposedIdentity.canonicalId = 'r04-c0192', 'proposed-id-or-collision');
rejected('wrong proposed Item ID length', d => d.roles[0].proposedIdentity.itemId = 'short', 'proposed-id-or-collision');
rejected('wrong Item type', d => d.roles[0].item.type = 'edge', 'complete-source-or-neutral-fields');
rejected('stale schema hash', d => d.schemaEvidence.jsonSha256 = '0'.repeat(64), 'schema-binding');
rejected('stale upstream pilot hash', d => d.upstream.pilotJsonSha256 = '0'.repeat(64), 'upstream-binding');
rejected('stale actual current prerequisite data', (d,i) => { const c = JSON.parse(i.currentRecords[ids[2]]); c.system.prerequisites.shift(); i.currentRecords[ids[2]] = JSON.stringify(c); }, 'upstream-pilot: record-hash');
rejected('stale actual source definition data', (d,i) => { const p = 'docs/data/feature-source-evidence.json', e = JSON.parse(i.sourceEvidence[p]); e.sourceDefinitions.find(x => x.id === definitions[0].id).definition.sections[2].text = 'Changed trigger'; i.sourceEvidence[p] = JSON.stringify(e); }, 'upstream-pilot: evidence-file-hash');
rejected('stale definition binding', d => d.roles[0].definitionEvidence.jsonSha256 = '0'.repeat(64), 'definition-binding');
rejected('source-to-field decision omitted', d => d.roles[0].fieldDecisions.pop(), 'field-decision-membership');
rejected('forged source field hash', d => d.roles[0].fieldDecisions.find(x => x.target === 'system.effect').sourceValueJsonSha256 = [], 'field-decision');
rejected('missing role', d => d.roles.pop(), 'role-membership');
rejected('extra role', d => d.roles.push(structuredClone(d.roles[0])), 'role-membership');
rejected('false production approval', d => d.approvals.production = true, 'unapproved-envelope');
rejected('false behavioral verification', d => d.roles[0].approvals.behavioralVerification = 'passed', 'role-approval');
rejected('false runtime implementation approval', d => d.roles[0].approvals.implemented = true, 'role-approval');
rejected('false automation approval', d => d.approvals.automation = true, 'unapproved-envelope');
rejected('false eligibility promotion', d => d.roles[0].generationEligibility = 'eligible', 'role-approval');
rejected('non-null production mapping', d => d.roles[1].productionMapping = {documentUuid: 'Compendium.ptu.feats.Item.aJ47Z5z6Az9c8Dy8'}, 'role-approval');
rejected('optional playtest relabelled official errata', d => d.roles[1].source.status = 'official-errata', 'source-role');
rejected('invented publication day', d => d.roles[1].source.publicationDate = '2015-05-01', 'source-role');
rejected('collision inventory changed', (d,i) => i.existingFeatIds.pop(), 'collision-inventory-binding');
rejected('malformed existing-ID inventory', (d,i) => i.existingFeatIds = null, 'collision-inventory-shape');
rejected('malformed raw schema JSON', (d,i) => i.sourceEvidence['template.json'] = '{', 'serialized-input-shape');
rejected('malformed raw current JSON', (d,i) => i.currentRecords[ids[2]] = '{', 'upstream-pilot: input-json');
rejected('malformed source map', (d,i) => i.sourceEvidence = null, 'input-shape');
rejected('malformed role containers', d => d.roles = {}, 'role-membership');

test('null and missing serialized containers return issue arrays', () => {
    assert.deepEqual(validateEchoesVersionDraft(null, inputs), ['draft-shape']);
    assert.deepEqual(validateEchoesVersionDraft(draft, null), ['input-shape']);
    assert.ok(validateEchoesVersionDraft(draft, {}).includes('input-shape'));
});
