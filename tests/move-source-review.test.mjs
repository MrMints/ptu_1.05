import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRecordSourceReview, recordSourceReviewErrors} from '../tools/record-source-review.mjs';

const original = await loadRecordSourceReview();
const copy = () => ({...original, index: structuredClone(original.index), moveSource: structuredClone(original.moveSource), batchManifest: structuredClone(original.batchManifest),
    files: Object.fromEntries(Object.entries(original.files).map(([path, file]) => [path, path.includes('/moves-') ? structuredClone(file) : file]))});
const rows = data => Object.entries(data.files).filter(([path]) => path.includes('/moves-')).flatMap(([, file]) => file.records);

test('actual Move corpus preserves Curse, unprefixed/compact definitions and true boundaries', () => {
    const units = original.moveSource.sourceDefinitions;
    const curse = units.find(unit => unit.label === 'Curse');
    assert.deepEqual(curse.fields.frequency, ['See Text']);
    assert.match(curse.ruleStructure.clauses.map(clause => clause.text).join(' '), /cannot be prevented/);
    const holdHands = units.find(unit => unit.id.startsWith('sep:4:') && unit.label === 'Hold Hands');
    assert.deepEqual(holdHands.fields['contest-effect'], ['Get Ready!']);
    assert.match(holdHands.nextBoundary, /^Heavy Shields/);
    const phalanx = units.find(unit => unit.label === 'Phalanx');
    assert.equal(phalanx.nextBoundary, 'Jousting Samurott');
    assert.doesNotMatch(phalanx.ruleStructure.clauses.map(clause => clause.text).join(' '), /samurai/);
    const glitch = units.filter(unit => unit.compactSourceEvidence);
    assert.equal(glitch.length, 8);
    assert.ok(glitch.every(unit => unit.fields.type[0] === 'Glitch' && !unit.fields['contest-type']));
    assert.ok(units.some(unit => unit.label === 'Shock Quartz'));
    const gravity = units.find(unit => unit.id.startsWith('porygon:21:'));
    assert.equal(gravity.definitionCompleteness, 'printed-effect-replacement-with-parent-reference');
    assert.equal(gravity.fields.frequency, undefined);
    assert.match(gravity.dependentConditions[0].value, /Home Gravity/);
});

test('Contest counter and same-Move conflicts remain precise despite matching dice', () => {
    const data = copy(), tease = rows(data).find(row => row.labelForReview === 'Tease');
    assert.equal(tease.coverageState, 'unresolved');
    assert.match(tease.missingEvidence.neededArtifact, /Fumble/);
    const reliable = rows(data).find(row => row.labelForReview === 'Reliable');
    assert.equal(reliable.coverageState, 'unresolved');
    assert.match(reliable.missingEvidence.neededArtifact, /SAME Move/);
    tease.coverageState = 'reviewed';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move reviewed state has no complete examined correspondence')));
});

test('Contest X sentinel, original table words and source identities are independently guarded', () => {
    const data = copy(), row = rows(data).find(row => row.labelForReview === 'Reflective Appeal');
    assert.equal(row.currentRecordEvidence.fieldHashes.dice.length, 64);
    assert.equal(row.sourceComparison.fields.find(field => field.field === 'dice').recordValue, -1);
    for (const fields of [row.fieldReview, row.sourceComparison.fields]) fields.find(field => field.field === 'dice').sourceValue = '100d6';
    row.sourceComparison.ruleStructureComparison.sourceClauseKey[0][1] = 'gain 100 voltage';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Contest effect literal dice/parameter evidence changed')));
    assert.ok(errors.some(message => message.includes('Move ordered content/typed-role evidence disagrees')));
});

test('new D evidence cannot change its frozen partition or cached current-field lineage', () => {
    const data = copy(), row = rows(data)[0];
    row.currentRecordEvidence.fieldHashes.frequency = '0'.repeat(64);
    row.exportLineage.snapshots.find(snapshot => snapshot.recordFound).fieldComparisons[0].currentJsonSha256 = '0'.repeat(64);
    data.batchManifest.batches.find(batch => batch.id === 'D').slices[2].membershipSha256 = '0'.repeat(64);
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Move exact current field/structure evidence disagrees')));
    assert.ok(errors.some(message => message.includes('Move historical field comparison disagrees')));
    assert.ok(errors.some(message => message.includes('Move frozen partition changed: D3')));
});

test('D2 full originals, optional alternatives and weapon-use facts remain separate', () => {
    const hold = rows(original).find(row => row.labelForReview === 'Hold Hands');
    const candidates = [hold.sourceComparison, ...hold.competingSourceComparisons];
    assert.ok(candidates.some(value => value.sourceUnit.startsWith('core:')));
    assert.ok(candidates.some(value => value.sourceUnit.startsWith('sep:4:') && value.sourceRole === 'explicit optional source definition'));
    const secret = rows(original).find(row => row.identity === 'moves.S0yow0ihIKbTGITY');
    assert.ok(secret.sourceSearch.generalUseContexts.includes('arcane-weapon-use'));
    assert.equal(secret.sourceComparison.sourceDependentConditions[0].value, 'Melee Weapons Only');
    assert.equal(secret.sourceComparison.manualSourceDisposition.proof, 'printed-weapon-limitation-stored-in-effect');
    const context = original.moveSource.generalUseContexts.find(value => value.id === 'arcane-weapon-use');
    assert.match(context.rawText, /Occult Education/);
    assert.match(context.rawText, /Arcane Training/);
});

test('actual signed Accuracy wording remains unresolved and cannot lose its sign evidence', () => {
    const data = copy(), mud = rows(data).find(row => row.identity === 'moves.BAmSs75wp3OsvF8d');
    assert.equal(mud.coverageState, 'unresolved');
    assert.ok(mud.sourceComparison.ruleStructureComparison.sourceNumericTokens.includes('-1'));
    assert.ok(mud.sourceComparison.ruleStructureComparison.orderedContentWordDifferences.some(value => value.source.includes('-')));
    mud.sourceComparison.ruleStructureComparison.sourceNumericTokens = ['1', '16'];
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move signed numeric/ordered-difference evidence changed')));
});

test('finite search cannot omit a frozen record or truncate the native corpus', () => {
    const data = copy(), name = 'move-source-search-d2.json', originalSearch = original.moveSearch[name];
    data.moveSearch = {...original.moveSearch, [name]: {...originalSearch, records: {...originalSearch.records}, sourceRegistry: {...originalSearch.sourceRegistry, nativePages: originalSearch.sourceRegistry.nativePages.slice(1)}}};
    const row = rows(data).find(row => row.frozenQueue?.slice === 'D2');
    delete data.moveSearch[name].records[row.identity];
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Move finite corpus/membership/template coverage changed')));
    assert.ok(errors.some(message => message.includes('Move native corpus silently shrank')));
    assert.ok(errors.some(message => message.includes('Move finite authoring search missing or changed')));
});

test('literal range fields and inherited executable data must describe the actual current Item', () => {
    const data = copy(), row = rows(data).find(row => row.frozenQueue?.slice === 'D2' && row.implementationFieldEvidence.ruleElements.length);
    row.sourceComparison.fields.find(value => value.field === 'range+keywords').recordValue = 'Range 999';
    row.implementationFieldEvidence.ruleElements[0].currentRule.value = 999;
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Move literal range/keyword/Contest evidence changed')));
    assert.ok(errors.some(message => message.includes('Move exact executable field evidence changed')));
});

test('D3 keeps complete underlying rules without inventing independent Move wrappers', () => {
    const struggle = rows(original).find(row => row.identity === 'moves.YiE3sLyJq5uzNYtM');
    assert.equal(struggle.coverageState, 'unresolved');
    assert.match(struggle.missingEvidence.neededArtifact, /core rule is available/i);
    const source = original.moveSearch['move-source-search-d3.json'].sourceRegistry.underlyingSourceRules;
    assert.equal(source.definitions.filter(unit => unit.kind === 'combat-maneuver').length, 22);
    assert.match(source.definitions.find(unit => unit.kind === 'struggle-framework').rawDefinition, /do not count as Moves/);
    assert.ok(struggle.sourceSearch.supportingRuleComparisons.length);
    const song = rows(original).find(row => row.identity === 'moves.9Z21sxI6QAsDVudC');
    assert.equal(song.sourceSearch.supportingRuleComparisons[0].printedHeaderFields['cost/frequency'][0], '1 AP – Special');
    const data = copy(), altered = rows(data).find(row => row.identity === struggle.identity);
    altered.sourceSearch.supportingRuleComparisons[0].currentMechanicalFields.type = 'Fire';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move underlying rule comparison changed')));
});

test('generic Hidden Power does not silently approve fixed leaves or erase permanent selection', () => {
    const data = copy(), row = rows(data).find(row => row.labelForReview === 'Hidden Power Fairy');
    assert.equal(row.coverageState, 'unresolved');
    assert.match(row.missingEvidence.neededArtifact, /permanent1d20 Type selection/);
    assert.ok(row.sourceComparison.sourceUnit.startsWith('core:399:'));
    row.coverageState = 'reviewed';
    row.sourceComparison.correspondenceSupported = true;
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move reviewed state has no complete examined correspondence')));
});

test('remaining stored use requirements retain the selected Item values', () => {
    const data = copy(), row = rows(data).find(row => row.identity === 'moves.1SJZml5MCrjmus1h');
    assert.match(row.sourceSearch.currentUseConditions[0].text, /Dynamaxed/);
    assert.match(row.sourceSearch.currentUseConditions[0].text, /Dragon Type Move/);
    row.sourceSearch.currentUseConditions[0].text = 'No conditions';
    assert.ok(recordSourceReviewErrors(data).some(message => message.includes('Move exact remaining authoring/use-condition fields changed')));
});

test('a linked native weather page cannot be substituted while retaining its journal root', () => {
    const data = copy(), row = rows(data).find(row => row.frozenQueue?.slice === 'D3' && row.sourceSearch.linkedNativeDefinitions.length);
    row.sourceSearch.linkedNativeDefinitions[0].pageId = 'invalidPage12345';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(message => message.includes('Move linked native page/UUID paths changed')));
    assert.ok(errors.some(message => message.includes('Move complete linked native definition changed')));
});
