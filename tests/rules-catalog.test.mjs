import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRulesCatalog, rulesCatalogErrors} from '../tools/rules-catalog.mjs';

const original = await loadRulesCatalog();
test('source catalog citations, coverage, stable IDs and independent review axes are consistent', () => {
    assert.deepEqual(rulesCatalogErrors(original), []);
});
test('catalog rejects a citation to wrong edition/hash or nonexistent page', () => {
    const data = structuredClone(original);
    data.revisions.entries[0].sources[0].sha256 = '0'.repeat(64);
    data.revisions.entries[1].sources[0].pdfPages = [99999];
    assert.ok(rulesCatalogErrors(data).some(x => x.includes('Citation hash/path mismatch')));
    assert.ok(rulesCatalogErrors(data).some(x => x.includes('Citation page out of range')));
});
test('catalog refuses guessed stable mappings and stale reviewed species bytes', () => {
    const data = structuredClone(original);
    data.revisions.entries[0].stableIdentities = ['abilities.0000000000000000'];
    data.stableDocuments[data.bulbasaur.identity].system.stats.hp += 1;
    data.bulbasaur.stableRelationshipEvidence.currentAbilityUuids.basic[0].uuid = 'Compendium.ptu.abilities.Item.0000000000000000';
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Unknown stable identity')));
    assert.ok(errors.some(x => x.includes('review hash is stale')));
    assert.ok(errors.some(x => x.includes('Missing exact ability relationship')));
});
test('catalog keeps composite offsets and distinct source identities', () => {
    const data = structuredClone(original);
    data.dex.composition[1].pdfPageOffset += 1;
    data.revisions.entries.find(x => x.label === 'Pure Power').canonicalId = data.revisions.entries.find(x => x.label === 'Huge Power').canonicalId;
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Composite page mapping')));
    assert.ok(errors.some(x => x.includes('keep separate identities')));
});
test('catalog cannot turn source evidence into approval or gameplay certification', () => {
    const data = structuredClone(original);
    data.bulbasaur.ruleVersionApproval = 'approved';
    data.authority.runtimePolicyPromotion = true;
    data.revisions.entries[0].behavioralVerification = 'verified';
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('must not approve whole')));
    assert.ok(errors.some(x => x.includes('must not promote runtime')));
    assert.ok(errors.some(x => x.includes('must not certify runtime')));
});
test('catalog requires reasons for manual rulings and all historical candidate dispositions', () => {
    const data = structuredClone(original);
    const row = data.revisions.entries.find(x => x.conflict.disposition.startsWith('manual'));
    row.conflict.details = [];
    data.reconciliation.section04SourceDisposition.earlierOnlyRecords.pop();
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Manual ruling lacks reason')));
    assert.ok(errors.some(x => x.includes('finite original ID inventory')));
});
