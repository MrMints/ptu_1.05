import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateRuleVersionPilot} from '../tools/rule-version-pilot.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const proposal = JSON.parse(read('docs/data/rule-version-pilot.json'));
const identities = ['moves.Y5R5mbVcGq6fwoFj', 'abilities.oNB76oqVYrjhYd7W', 'feats.aJ47Z5z6Az9c8Dy8', 'poke-edges.WkzCUjTOCTI60Uwg', 'abilities.nuGa21WQ0QD07kQj'];
const files = ['system.json', 'docs/data/source-authority.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const inputs = {
    revisions: read('docs/data/rules-revisions.json'),
    sourceEvidence: Object.fromEntries(files.map(p => [p, read(p)])),
    currentRecords: Object.fromEntries(identities.map(id => { const [pack, key] = id.split('.'); return [id, read(`packs/${pack}/_source/${key}.json`)]; }))
};
const digest = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const role = (p, index, revised = true) => p.cases[index].roles[revised ? 1 : 0];
function rejected(label, change, expected) {
    test(label, () => {
        const p = structuredClone(proposal);
        const i = {...inputs, currentRecords: {...inputs.currentRecords}, sourceEvidence: {...inputs.sourceEvidence}};
        change(p, i);
        const issues = validateRuleVersionPilot(p, i);
        assert.ok(issues.some(x => x.includes(expected)), JSON.stringify(issues));
    });
}
function definition(family, id) {
    return JSON.parse(inputs.sourceEvidence[`docs/data/${family}-source-evidence.json`]).sourceDefinitions.find(x => x.id === id);
}

test('real bounded proposal binds four categories and five exact records without production approval', () => {
    assert.deepEqual(validateRuleVersionPilot(proposal, inputs), []);
    assert.deepEqual(proposal.cases.map(x => x.type), ['move', 'ability', 'feat', 'pokeedge']);
    assert.equal(proposal.negativeControl.proposalCase, false);
    for (const row of proposal.cases) {
        assert.equal(row.runtimeCanonicalId, null);
        for (const r of row.roles) {
            assert.equal(r.wholeRecordMapping, false);
            assert.equal(r.approvals.production, false);
            assert.equal(r.approvals.behavioralVerification, 'not-run');
        }
    }
});

test('Defense Curl actual complete definitions expose the mixed effect, action and exact-ID lineage gap', () => {
    const core = definition('move', 'core:394:move-line48');
    const revised = definition('move', 'sep:4:move-line27');
    const current = JSON.parse(inputs.currentRecords[identities[0]]);
    assert.match(core.ruleStructure.clauses[0].text, /Swift Action/);
    assert.doesNotMatch(core.ruleStructure.clauses[0].text, /Combat Stage/);
    assert.match(revised.ruleStructure.clauses[0].text, /end of the Scene/);
    assert.doesNotMatch(revised.ruleStructure.clauses[0].text, /Damage Reduction/);
    assert.match(current.system.effect, /10 Damage Reduction and \+1 Defense Combat Stage/);
    assert.match(current.system.effect, /Rapid Action/);
    assert.doesNotMatch(current.system.effect, /end of the Scene/);
    assert.equal(proposal.cases[0].current.audit, null);
    assert.equal(proposal.cases[0].current.review, null);
    assert.ok(proposal.cases[0].roles.every(x => x.candidateDocumentUuid === null));
});

test('Huge and Pure Power remain separate despite shared February text and inherited numeric automation', () => {
    assert.match(definition('ability', 'core:320:ability-line34').ruleStructure.clauses[0].text, /doubled.*not bonuses from Trainer Features/);
    assert.match(definition('ability', 'feb:5:ability-line83').ruleStructure.clauses[0].text, /cannot be disabled in any way/);
    const huge = JSON.parse(inputs.currentRecords[identities[1]]);
    const pure = JSON.parse(inputs.currentRecords[identities[4]]);
    assert.notEqual(huge._id, pure._id);
    assert.deepEqual(proposal.negativeControl.sourceEvidence.map(x => x.id), ['core:327:ability-line18', 'feb:5:ability-line83']);
    assert.equal(huge.system.effect, pure.system.effect);
    assert.match(huge.system.effect, /Innate/);
    assert.doesNotMatch(huge.system.effect, /cannot be disabled/);
    assert.match(huge.system.rules[0].value, /5 \+ floor/);
    assert.equal(role(proposal, 1).evidence[0].fields.find(x => x.pointer.includes('clauses')).disposition, 'partial');
});

test('Echoes binds the complete changed prerequisites and unchanged typed frequency/trigger/effect', () => {
    const core = definition('feature', 'core:140:feature-line35');
    const may = definition('feature', 'may:7:feature-line27');
    assert.equal(core.definition.prerequisites[0].text, 'Master General Education');
    assert.match(may.definition.prerequisites[0].text, /Breadth of Knowledge, Master General/);
    assert.deepEqual(core.ruleStructure.clauses, may.ruleStructure.clauses);
    assert.deepEqual(core.definition.sections.map(x => x.kind), ['prerequisites', 'frequency', 'trigger', 'effect']);
    assert.deepEqual(JSON.parse(inputs.currentRecords[identities[2]]).system.prerequisites, ['Breadth of Knowledge', 'Master General Education']);
    assert.equal(role(proposal, 2, false).evidence[0].fields[0].disposition, 'conflict');
    assert.equal(role(proposal, 2).evidence[0].fields[0].disposition, 'correspondence');
    assert.ok(proposal.cases[2].obligations.some(x => x.code === 'advisory-prerequisites'));
    assert.equal(proposal.cases[2].current.provenance.modern, 'Compendium.ptu.feats.ta6bKIiHCuccjTqU');
    assert.notEqual(role(proposal, 2).candidateDocumentUuid, proposal.cases[2].current.provenance.modern);
});

test('Basic Ranged combines the narrow directive with complete core choice/cost/use/repetition and context', () => {
    const core = definition('feature', 'core:205:feature-line39');
    const source = JSON.parse(inputs.sourceEvidence['docs/data/feature-source-evidence.json']);
    const directive = source.generalContexts.find(x => x.id === 'sep-basic-ranged-level-directive');
    assert.match(core.definition.prerequisites[0].text, /Level 20/);
    for (const name of ['Firestarter', 'Fountain', 'Freezer', 'Guster', 'Materializer', 'Zapper']) assert.ok(core.definition.prerequisites[0].text.includes(name));
    assert.equal(core.definition.costs[0].text, '1 Tutor Point');
    assert.match(core.ruleStructure.clauses[0].text, /Struggle Attacks.*6 meters.*different Capability each time/);
    assert.match(directive.rawText, /no Level Prerequisite/);
    assert.doesNotMatch(directive.rawText, /Tutor Point|6 meters/);
    const current = JSON.parse(inputs.currentRecords[identities[3]]);
    assert.doesNotMatch(current.system.prerequisites.join(' '), /Level/);
    assert.equal(current.system.rules[0].choices.length, 17);
    assert.equal(current.system.cost, '1 TP');
    assert.deepEqual(role(proposal, 3).evidence.map(x => x.id), ['core:205:feature-line39', 'sep-basic-ranged-level-directive']);
    assert.equal(proposal.cases[3].contextEvidence[0].id, 'poke-edge-framework');
});

test('repeated validation is deterministic and preserves proposal and every supplied raw input', () => {
    const before = digest({proposal, inputs});
    assert.deepEqual(validateRuleVersionPilot(proposal, inputs), []);
    assert.deepEqual(validateRuleVersionPilot(proposal, inputs), []);
    assert.equal(digest({proposal, inputs}), before);
});

test('LF/CRLF evidence checkout representations validate without confusing raw and semantic hashes', () => {
    const i = {...inputs, revisions: inputs.revisions.replaceAll('\r\n', '\n'), sourceEvidence: Object.fromEntries(Object.entries(inputs.sourceEvidence).map(([p,s]) => [p,s.replaceAll('\r\n', '\n')]))};
    assert.deepEqual(validateRuleVersionPilot(proposal, i), []);
    assert.notEqual(proposal.cases[0].current.rawFileSha256, proposal.cases[0].current.jsonSha256);
});

rejected('stale exact current raw hash', p => p.cases[0].current.rawFileSha256 = '0'.repeat(64), 'record-hash');
rejected('actual current prerequisite omission cannot reuse old evidence', (p,i) => {
    const current = JSON.parse(i.currentRecords[identities[2]]);
    current.system.prerequisites.shift();
    i.currentRecords[identities[2]] = JSON.stringify(current);
}, 'record-hash');
rejected('stale evidence file bytes', (p,i) => i.sourceEvidence['docs/data/move-source-evidence.json'] += ' ', 'evidence-file-hash');
rejected('stale source definition hash', p => role(p, 0).evidence[0].jsonSha256 = '0'.repeat(64), 'evidence-unit-hash');
rejected('named normalized hash cannot replace raw evidence hash', p => role(p, 1).evidence[0].existingHashes.rawDefinitionSha256 = role(p, 1).evidence[0].existingHashes.definitionNormalizedSha256, 'named-evidence-hashes');
rejected('stale actual source mechanical field', (p,i) => {
    const path = 'docs/data/feature-source-evidence.json', data = JSON.parse(i.sourceEvidence[path]);
    data.sourceDefinitions.find(x => x.id === 'may:7:feature-line27').definition.sections.shift();
    i.sourceEvidence[path] = JSON.stringify(data);
}, 'evidence-unit-hash');
rejected('stale exact-ID audit/lineage binding', p => p.cases[1].current.review.lineageJsonSha256 = '0'.repeat(64), 'review-lineage-binding');
rejected('wrong candidate UUID', p => role(p, 2).candidateDocumentUuid = 'Compendium.ptu.feats.Item.0000000000000000', 'role-candidate');
rejected('duplicate role candidate from another case', p => role(p, 2).candidateDocumentUuid = role(p, 1).candidateDocumentUuid, 'role-candidate');
rejected('duplicate exact record candidate', p => p.cases[2].current.documentUuid = p.cases[1].current.documentUuid, 'candidate-identity-duplicate');
rejected('missing frozen case', p => p.cases.pop(), 'case-membership');
rejected('extra frozen case', p => p.cases.push(structuredClone(p.cases[0])), 'case-membership');
rejected('Pure Power substituted for Huge Power', p => p.cases[1].current = structuredClone(p.negativeControl.current), 'record-identity');
rejected('catalog grouping coordinate used as runtime canonical identity', p => p.cases[1].runtimeCanonicalId = 'r04-c0046', 'case-type-or-approval');
rejected('catalog case coordinate used as runtime version identity', p => role(p, 1).runtimeVersionId = 'r04-r0046', 'role-promotion');
rejected('wrong source edition/status role', p => role(p, 2).source.status = 'official-errata', 'source-role');
rejected('invented core publication date', p => role(p, 2, false).source.publicationDate = '2015-01-01', 'source-role');
rejected('wrong source page or fingerprint', p => role(p, 0).source.pdfPages = [394], 'source-role');
rejected('wrong source definition role', p => role(p, 2).evidence = structuredClone(role(p, 2, false).evidence), 'role-evidence-membership');
rejected('wrong distinct Poké Edge type', p => p.cases[3].type = 'edge', 'case-type-or-approval');
rejected('invented missing original counterpart', p => role(p, 3, false).candidateDocumentUuid = 'Compendium.ptu.poke-edges.Item.1234567890123456', 'role-candidate');
rejected('false production approval', p => p.approvals.production = true, 'unapproved-states');
rejected('false behavioral verification', p => role(p, 2).approvals.behavioralVerification = 'passed', 'role-promotion');
rejected('false implementation approval', p => p.cases[3].approvals.implemented = true, 'case-type-or-approval');
rejected('false automation approval', p => p.approvals.automation = true, 'unapproved-states');
rejected('whole-record promotion from field correspondence', p => role(p, 2).wholeRecordMapping = true, 'role-promotion');
rejected('Echoes revised prerequisite evidence omitted', p => role(p, 2).evidence[0].fields.shift(), 'complete-source-fields');
rejected('Basic Ranged cost evidence omitted', p => role(p, 3).evidence[0].fields.splice(1, 1), 'complete-source-fields');
rejected('Basic Ranged complete use/repetition evidence omitted', p => role(p, 3).evidence[0].fields.pop(), 'complete-source-fields');
rejected('Basic Ranged training context omitted', p => p.cases[3].contextEvidence = [], 'context-membership');
rejected('Basic Ranged repeat obligation omitted', p => p.cases[3].obligations = p.cases[3].obligations.filter(x => x.code !== 'different-capability-repeat'), 'case-obligations');
rejected('Huge Power cannot-disable delta falsely marked correspondence', p => role(p, 1).evidence[0].fields[1].disposition = 'correspondence', 'known-case-disposition');
rejected('negative control promoted to fifth proposal', p => p.negativeControl.proposalCase = true, 'negative-control-separation');
rejected('invalid serialized evidence returns issues', (p,i) => i.sourceEvidence['system.json'] = '{', 'input-json');
rejected('malformed proposal containers return issues', p => p.cases = {}, 'case-membership');

test('integrity validation does not certify human source interpretation', () => {
    const p = structuredClone(proposal);
    role(p, 2).sourceMeaning = 'This deliberately incorrect human interpretation still needs substantive review.';
    assert.deepEqual(validateRuleVersionPilot(p, inputs), []);
    assert.match(p.validationLimit, /Human substantive review/);
});
