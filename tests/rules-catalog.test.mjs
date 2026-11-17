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
test('readable source coverage cannot be replaced by an adoption-permission gap', () => {
    const data = structuredClone(original);
    data.supplements.entries = data.supplements.entries.filter(x => !x.sources[0].pdfPages.includes(120));
    data.supplements.entries[0].disposition.blocksCataloging = true;
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('source unit coverage incomplete: throhs')));
    assert.ok(errors.some(x => x.includes('Readable supplemental page unaccounted: throhs 120')));
    assert.ok(errors.some(x => x.includes('Supplemental/regional disposition missing')));
});
test('dex candidates require substantive field readings and repeated printed slots', () => {
    const data = structuredClone(original);
    delete data.dex.profileDeltas[0].changes[0].sourceInterpretation;
    data.dex.profileDeltas.find(x => x.id === 'r04-d0128').changes = [];
    delete data.supplements.entries.find(x => x.id === 'r04-p0021').explicitVariantDeltas;
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Profile field interpretation missing')));
    assert.ok(errors.some(x => x.includes('Bellossom repeated printed ability slots')));
    assert.ok(errors.some(x => x.includes('Explicit variant substitutions missing')));
});
test('regional catalogs must account for every profile and composite coordinate', () => {
    const data = structuredClone(original);
    data.regional.entries[0].combinedPdfPage++;
    data.regional.entries.pop();
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Regional composite page offset wrong')));
    assert.ok(errors.some(x => x.includes('Regional profile/page coverage incomplete: hisui')));
});
test('source text retains Digital Avatar conflict and avoids reported word defects', () => {
    const row = original.supplements.entries.find(x => x.id === 'r04-p0177');
    assert.match(row.currentInterpretation, /2d6/);
    assert.match(row.currentInterpretation, /3d6 only if no skill previously/);
    assert.match(row.disposition.specificQuestionOrNote, /Same edition/);
    assert.equal(row.disposition.category, 'rule-ambiguity');
    const data = structuredClone(original);
    data.supplements.entries.find(x => x.id === 'r04-p0197').currentInterpretation = 'Upgraderare Researcherfieldchoices';
    data.supplements.entries.find(x => x.id === 'r04-p0236').printedOptions.pop();
    assert.ok(rulesCatalogErrors(data).some(x => x.includes('Unreadable merged/split source prose')));
    assert.ok(rulesCatalogErrors(data).some(x => x.includes('all ten printed condition outcomes')));
});
test('same-rule reprints retain one identity without approving runtime mappings', () => {
    const data = structuredClone(original);
    data.supplements.entries.find(x => x.label === 'Type Sync fantasy reprint').canonicalId = 'another-rule';
    data.regional.entries[0].stableIdentities = ['species.0000000000000000'];
    const errors = rulesCatalogErrors(data);
    assert.ok(errors.some(x => x.includes('Type Sync reprints must share one source identity')));
    assert.ok(errors.some(x => x.includes('must not invent runtime mappings')));
});
