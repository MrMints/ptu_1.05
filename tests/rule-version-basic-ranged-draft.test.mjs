import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateBasicRangedVersionDraft as validate } from '../tools/rule-version-basic-ranged-draft.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const draft = JSON.parse(read('docs/data/rule-version-basic-ranged-draft.json'));
const inputs = {
    featureEvidence: read('docs/data/feature-source-evidence.json'),
    itemTemplate: read('template.json'),
    preservationRecord: read('packs/poke-edges/_source/WkzCUjTOCTI60Uwg.json')
};
const globalBefore = structuredClone({ draft, inputs });
const checkGlobals = () => assert.deepEqual({ draft, inputs }, globalBefore);
const twice = (candidate, supplied) => {
    // Snapshot the actual arguments after the caller's intentional tampering.
    const before = structuredClone({ candidate, supplied });
    const first = validate(candidate, supplied);
    assert.deepEqual({ candidate, supplied }, before);
    assert.deepEqual(validate(candidate, supplied), first);
    assert.deepEqual({ candidate, supplied }, before);
    checkGlobals();
    return first;
};

test('pinned inputs validate twice without changing either argument', () => {
    assert.deepEqual(twice(draft, inputs), []);
});

test('the other exact LF/CRLF inputs preserve the same source facts', () => {
    const opposite = raw => raw.includes('\r\n')
        ? raw.replaceAll('\r\n', '\n') : raw.replaceAll('\n', '\r\n');
    const supplied = {
        ...inputs, featureEvidence: opposite(inputs.featureEvidence), itemTemplate: opposite(inputs.itemTemplate)
    };
    assert.deepEqual(twice(draft, supplied), []);
});

test('source roles stay distinct and the September change removes Level 20 only', () => {
    const [core, september] = draft.roles;
    assert.equal(core.source.status, 'standard-baseline');
    assert.equal(core.source.publicationDate, null);
    assert.equal(core.source.datePrecision, 'unknown');
    assert.deepEqual(core.source.pdfPages, [205]);
    assert.equal(september.source.status, 'optional-playtest');
    assert.equal(september.source.publicationDate, '2015-09');
    assert.equal(september.source.datePrecision, 'month');
    assert.deepEqual(september.source.pdfPages, [9]);
    assert.notEqual(core.source.sha256, september.source.sha256);
    assert.equal(september.composition.removedRequirement, 'Level 20');
    assert.deepEqual(core.item.system.prerequisites, ['Level 20', ...september.item.system.prerequisites]);
    assert.equal(core.item.system.effect, september.item.system.effect);
    assert.deepEqual({ ...core.mechanics, minimumLevel: null }, september.mechanics);
    assert.match(draft.evidence.core.rawText, /Prerequisites: Level 20,/);
    assert.match(draft.evidence.september.rawText, /now has no Level Prerequisite\./);
});

test('six literal choices, printed cost, modified Struggle range, distinct repetition and context are retained', () => {
    const [core, september] = draft.roles;
    for (const role of [core, september]) {
        const { mechanics, item } = role;
        assert.deepEqual(mechanics.chooseOneCapability.labels, ['Firestarter', 'Fountain', 'Freezer', 'Guster', 'Materializer', 'Zapper']);
        assert.equal(mechanics.chooseOneCapability.runtimeIds, null);
        assert.deepEqual(mechanics.cost, { amount: 1, unit: 'Tutor Point' });
        assert.deepEqual(mechanics.struggle, { condition: 'Modified by the chosen Capability', maxRangeMeters: 6 });
        assert.deepEqual(mechanics.repetition, { allowed: true, differentCapabilityEachTime: true });
        assert.deepEqual(item.system.rules, []);
    }
    assert.deepEqual(draft.evidence.framework.source.pdfPages, [204]);
    assert.equal(draft.frameworkContext.trainingHours, 1);
    assert.equal(draft.frameworkContext.implementsPrintedGate, false);
    assert.equal(draft.acquisition.prerequisites, 'advisory');
    assert.equal(draft.acquisition.automaticRefund, false);
    assert.deepEqual(draft.schemaEvidence.cost, {
        source: '1 Tutor Point', templateDefault: 0, inheritedSerialization: '1 TP',
        proposedInactiveSerialization: '1 Tutor Point'
    });
    assert.equal(draft.schemaEvidence.declaredSystemFields.length, 13);
    assert.deepEqual(draft.schemaEvidence.legacySystemFields, ['name', 'useCount']);
    assert.equal(draft.preservationControl.legacyAutomation.choiceCount, 17);
    assert.equal(draft.preservationControl.legacyAutomation.adopted, false);
    checkGlobals();
});

function rejected(name, mutate, expected) {
    test(name, () => {
        const candidate = structuredClone(draft);
        const supplied = { ...inputs };
        mutate(candidate, supplied);
        assert.ok(twice(candidate, supplied).includes(expected), expected);
    });
}

rejected('stale source bytes', (_, input) => input.featureEvidence += '\n', 'input-pin:featureEvidence');
rejected('changed template', (_, input) => input.itemTemplate = input.itemTemplate.replace('Homebrew', 'Changed'), 'input-pin:itemTemplate');
rejected('changed preservation control', (_, input) => input.preservationRecord = input.preservationRecord.replace('"1 TP"', '"2 TP"'), 'input-pin:preservationRecord');
rejected('unapproved extra input', (_, input) => input.review = '{}', 'input-membership');
rejected('omitted source fingerprint', d => delete d.roles[0].source.sha256, 'role-source:baseline');
rejected('invented core date', d => d.roles[0].source.publicationDate = '2015-01', 'role-source:baseline');
rejected('playtest promoted to errata', d => d.roles[1].source.status = 'official-errata', 'role-source:revised');
rejected('stale selected unit hash', d => d.evidence.core.jsonSha256 = '0'.repeat(64), 'evidence:core');
rejected('framework omission', d => delete d.evidence.framework, 'evidence-membership');
rejected('revision adds an extra delta', d => d.roles[1].composition.removedRequirement = 'Level and choice', 'composition:revised');
rejected('core level omitted', d => d.roles[0].mechanics.minimumLevel = null, 'mechanics:baseline');
rejected('six-choice list narrowed', d => d.roles[1].mechanics.chooseOneCapability.labels.pop(), 'mechanics:revised');
rejected('range changed', d => d.roles[1].mechanics.struggle.maxRangeMeters = 12, 'mechanics:revised');
rejected('same-capability repetition', d => d.roles[0].mechanics.repetition.differentCapabilityEachTime = false, 'mechanics:baseline');
rejected('printed cost lost', d => d.roles[1].item.system.cost = '1 TP', 'item:revised');
rejected('legacy automation transferred', d => d.roles[1].item.system.rules.push({ key: 'ChoiceSet' }), 'item:revised');
rejected('declared system field omitted', d => delete d.roles[0].item.system.effect, 'item-fields:baseline');
rejected('legacy field transferred', d => d.roles[0].item.system.useCount = 0, 'item-fields:baseline');
rejected('field decision omitted', d => delete d.fieldDecisions.source, 'field-decisions');
rejected('same version ID on both roles', d => d.roles[1].proposedIdentity.versionId = d.roles[0].proposedIdentity.versionId, 'identity-allocation');
rejected('inherited item ID reused', d => d.roles[1].item._id = 'WkzCUjTOCTI60Uwg', 'item:revised');
rejected('runtime capability IDs assigned', d => d.roles[0].mechanics.chooseOneCapability.runtimeIds = ['fire'], 'mechanics:baseline');
rejected('runtime version promotion', d => d.roles[1].runtimeVersionId = d.roles[1].proposedIdentity.versionId, 'role-promotion:revised');
rejected('production approval promotion', d => d.approvals.production = true, 'draft:approvals');
rejected('runtime registry promotion', d => d.representation.inRuntimeRegistry = true, 'draft:representation');
rejected('printed removal/refund made live', d => d.acquisition.automaticRefund = true, 'draft:acquisition');
rejected('preservation control treated as whole-record mapping', d => d.preservationControl.wholeRecordMapping = true, 'preservation-control');
rejected('invented counterpart', d => d.case.runtimeCounterpartId = 'WkzCUjTOCTI60Uwg', 'draft:case');
rejected('collision receipt altered', d => d.identityAllocation.regenerations = 1, 'allocation-receipt');

test('malformed containers produce deterministic issues without mutation', () => {
    assert.deepEqual(twice(null, inputs), ['draft-shape']);
    assert.ok(twice(draft, null).includes('input-membership'));
});
