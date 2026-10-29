import test from 'node:test';
import assert from 'node:assert/strict';
import {assertFullFSourceAccepted} from './helpers/full-f-acceptance.mjs';
import {loadRecordSourceReview, recordSourceReviewErrors, parseSourceAcquisition, parseSourceLevelAcquisition, extractSourceAcquisitionSection, unqualifiedAcquisitionKeys, parseCompactSourceProfiles} from '../tools/record-source-review.mjs';

const original = await loadRecordSourceReview();
const copy = () => ({...original, ...structuredClone({index: original.index, files: original.files, dependencyReview: original.dependencyReview, dex: original.dex, batchManifest: original.batchManifest, acquisitionAudit: original.acquisitionAudit, generationScope: original.generationScope, unmatchedSpecies: original.unmatchedSpecies, abilitySource: original.abilitySource, moveSource: original.moveSource})});
const records = data => Object.values(data.files).flatMap(file => file.records);
test('record source snapshot keeps exact inventory, separate field axes and complete first dependency coverage', () => {
    assert.deepEqual(recordSourceReviewErrors(original), []);
});

test('full-F pending examination can become the exact accepted decision without changing source checkpoints', () => {
    const data = copy(), batch = data.batchManifest.batches.find(value => value.id === 'F');
    const accepted = structuredClone(batch);
    batch.status = 'in-progress';
    batch.closure = null;
    batch.acceptance = structuredClone(batch.acceptanceHistory[0]);
    delete batch.acceptanceHistory;
    assert.throws(() => assertFullFSourceAccepted(batch), assert.AssertionError);
    assert.deepEqual(recordSourceReviewErrors(data), []);
    Object.assign(batch, accepted);
    assertFullFSourceAccepted(batch);
    assert.deepEqual(recordSourceReviewErrors(data), []);
    assert.deepEqual(data.batchManifest.batches.filter(value => ['G', 'H'].includes(value.id))
        .map(value => [value.id, value.status]), [['G', 'not-started'], ['H', 'not-started']]);
});

test('an acceptance label cannot advance G past an explicitly unfinished F', () => {
    const data = copy(), batch = data.batchManifest.batches.find(value => value.id === 'F');
    batch.status = 'in-progress';
    batch.closure = null;
    assert.equal(batch.acceptance.status, 'accepted-source-examination');
    assert.throws(() => assertFullFSourceAccepted(batch), assert.AssertionError);
    data.batchManifest.batches.find(value => value.id === 'G').status = 'in-progress';
    assert(recordSourceReviewErrors(data).includes('Frozen batch sequence skipped unfinished predecessor: G'));
});

test('complete F examinations without substantive acceptance still block G independently of closure', () => {
    const data = copy(), batch = data.batchManifest.batches.find(value => value.id === 'F');
    batch.acceptance = structuredClone(batch.acceptanceHistory[0]);
    assert.equal(batch.status, 'source-comparisons-complete');
    assert.throws(() => assertFullFSourceAccepted(batch), assert.AssertionError);
    data.batchManifest.batches.find(value => value.id === 'G').status = 'in-progress';
    const errors = recordSourceReviewErrors(data);
    assert(errors.includes('Frozen family review gate not cleared: G'));
    assert(!errors.includes('Frozen batch sequence skipped unfinished predecessor: G'));
});

test('accepted full-F closure rejects changed outcomes and slice bindings independently', () => {
    for (const change of [
        batch => { batch.closure.counts.reviewed--; batch.closure.counts.unresolved++; },
        batch => { batch.closure.sliceEvidenceSemanticSha256.F4d = '0'.repeat(64); }
    ]) {
        const data = copy(), batch = data.batchManifest.batches.find(value => value.id === 'F');
        change(batch);
        assert.throws(() => assertFullFSourceAccepted(batch), assert.AssertionError);
        assert(recordSourceReviewErrors(data).includes('Closed family aggregate counts/evidence disagree: F'));
    }
});
test('record review rejects stale hashes and duplicated source dispositions', () => {
    const data = copy(), file = Object.values(data.files)[0];
    file.records[0].contentHash = '0'.repeat(64);
    file.records.push(structuredClone(file.records[0]));
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('identity/hash stale')));
    assert.ok(errors.some(x => x.includes('Duplicate record disposition')));
});
test('all 87 relationships require exact reviewed source and target evidence', () => {
    const data = copy();
    data.dependencyReview.relationships.pop();
    data.dependencyReview.relationships[0].targetContentHash = '0'.repeat(64);
    data.dependencyReview.relationships[1].relationshipData = [];
    data.dependencyReview.relationships[2].paths = ['$.system.nonexistent'];
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('Missing required dependency disposition')));
    assert.ok(errors.some(x => x.includes('source/target review or hash missing')));
    assert.ok(errors.some(x => x.includes('separate source/target field evidence')));
    assert.ok(errors.some(x => x.includes('UUID paths do not describe exact current source')));
});

test('duplicated record evidence cannot disagree in fieldReview alone', () => {
    const data = copy(), row = records(data).find(value => value.identity === 'moves.50Vtl0u0jPevwY4K');
    row.fieldReview.find(value => value.field === 'type').sourceValue = 'Fire';
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Duplicated fieldReview/sourceComparison evidence disagrees')));
});

test('Tackle damageBase evidence must equal the unchanged current record', () => {
    const data = copy(), row = records(data).find(value => value.identity === 'moves.50Vtl0u0jPevwY4K');
    for (const fields of [row.fieldReview, row.sourceComparison.fields]) fields.find(value => value.field === 'damageBase').recordValue = 5;
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Declared field evidence does not describe exact current record: moves.50Vtl0u0jPevwY4K damageBase')));
});

test('capability and skill evidence must equal the unchanged current species fields', () => {
    for (const kind of ['capability', 'skill']) {
        const data = copy(), row = records(data).find(value => value.identity === 'species.04HUofEWMHdMr0Ya');
        for (const fields of [row.fieldReview, row.sourceComparison.fields]) {
            if (kind === 'capability') fields.find(value => value.field === 'system.capabilities numeric fields').values[0].record += 1;
            else fields.find(value => value.field === 'system.skills six printed entries').values[0].record.value += 1;
        }
        assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Declared field evidence does not describe exact current record: species.04HUofEWMHdMr0Ya')), kind);
    }
});

test('an acquisition path must contain its exact UUID even when that target remains elsewhere', () => {
    const data = copy(), relation = data.dependencyReview.relationships.find(value => value.paths.some(path => path.includes('.moves.machine[')) && value.paths.length > 1);
    const other = data.dependencyReview.relationships.find(value => value.source === relation.source && value.target !== relation.target && value.paths.some(path => path.includes('.moves.machine[')));
    assert.ok(relation && other);
    const trueOtherPath = relation.paths.find(path => !path.includes('.moves.machine['));
    relation.paths = relation.paths.map(path => path.includes('.moves.machine[') ? other.paths.find(path => path.includes('.moves.machine[')) : path);
    assert.ok(relation.paths.includes(trueOtherPath));
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Dependency UUID paths do not describe exact current source')));
});

test('all 95 form/branch/skill cases retain examined dispositions and required form citations', () => {
    const data = copy(), batch = data.index.finiteFormBranchBatch, row = data.files[batch.recordFile].records.find(value => value.sourceComparison.derivedFormEvidence?.kind === 'printed-mega-table');
    assert.equal(batch.records, 95);
    assert.deepEqual(batch.counts, {reviewed: 81, unresolved: 14});
    row.sources = row.sources.filter(value => !value.pdfPages.includes(206));
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Derived Mega evidence lost the additional-Ability rule citation')));
    data.files[batch.recordFile].records[0].coverageState = 'unreviewed';
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Finite available-source case became pending or stale')));
});

test('frozen work queues reject stale memberships, duplicates and skipped predecessor closure', () => {
    const data = copy(), batch = data.batchManifest.batches.find(value => value.id === 'B');
    batch.members[0][1] = '0'.repeat(64);
    batch.members[1] = [...batch.members[2]];
    // Construct the unfinished predecessor explicitly; the real F is now accepted.
    data.batchManifest.batches.find(value => value.id === 'F').status = 'in-progress';
    data.batchManifest.batches.find(value => value.id === 'G').status = 'in-progress';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(value => value.includes('Frozen batch membership changed: B')));
    assert.ok(errors.some(value => value.includes('Frozen batch duplicate/stale identity/hash')));
    assert.ok(errors.some(value => value.includes('Frozen batch sequence skipped unfinished predecessor: G')));
});

test('printed species slices retain exact membership and related edition catalog references', () => {
    const data = copy(), slice = data.batchManifest.batches.find(value => value.id === 'B').slices.find(value => value.recordFile);
    const file = data.files[slice.recordFile], row = file.records.find(value => value.catalogReferences.length);
    row.catalogReferences[0].entryId = 'nonexistent-source-entry';
    file.records[0].frozenQueue.membershipSha256 = '0'.repeat(64);
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(value => value.includes('edition/region catalog reference is missing or unrelated')));
    assert.ok(errors.some(value => value.includes('Frozen slice evidence file/membership disagrees')));
});

test('additional High Abilities and form-condition notes preserve ambiguity and exact configured-rule evidence', () => {
    const data = copy(), row = records(data).find(value => value.sourceComparison?.fields.some(field => field.additionalPrintedHighAbilities));
    for (const fields of [row.fieldReview, row.sourceComparison.fields]) fields.find(value => value.field === 'system.abilities exact UUID-resolved slot order').status = 'supported';
    row.sourceComparison.independentGroups.abilitySlots = true;
    row.sourceComparison.equalMechanicalGroups += 1;
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Additional printed High Abilities cannot be silently discarded')));
    const changed = copy(), hoopa = records(changed).find(value => value.identity === 'species.QAUxFV2raCCHWsHU');
    for (const fields of [hoopa.fieldReview, hoopa.sourceComparison.fields]) fields.find(value => value.sourceProfileNote?.heading === 'Confined').recordJsonSha256 = '0'.repeat(64);
    assert.ok(recordSourceReviewErrors(changed).some(value => value.includes('Declared field evidence does not describe exact current record: species.QAUxFV2raCCHWsHU')));
    const nectar = copy(), oricorio = records(nectar).find(value => value.identity === 'species.TAgWXcWZQDxvvKt2');
    for (const fields of [oricorio.fieldReview, oricorio.sourceComparison.fields]) fields.find(value => value.field === 'system.types').sourceConditionalPrimaryTypes.yellow = 'Fire';
    assert.ok(recordSourceReviewErrors(nectar).some(value => value.includes('Printed nectar condition and Type evidence disagree')));
});

test('repeated acquisition headings and normative tails cannot become fictitious Move names', () => {
    assert.deepEqual(parseSourceAcquisition('45 Attract TM Move List 06 Toxic, 10 Hidden Power', true).entries, ['attract', 'toxic', 'hiddenpower']);
    assert.deepEqual(parseSourceAcquisition('Mew can learn any TM/HM', true), {entries: [], annotatedEntries: [], repeatedHeadings: [], boundary: 'universal-machine'});
    assert.equal(parseSourceAcquisition('Mew can be tutored to learn any Move.').boundary, 'universal-tutoring');
    for (const tail of ['Small HP: 4 Attack: 7', '*Sky Forme Shaymin can transform', 'Zygarde Cube Move List Core Enforcer', 'Note: second Advanced Ability', 'Ultra Burst Type: Psychic/Dragon']) {
        assert.deepEqual(parseSourceAcquisition(`Worry Seed ${tail}`).entries, ['worryseed']);
    }
    const applin = records(original).find(value => value.identity === 'species.A0sBewaxj0epSaUU'), machine = applin.fieldReview.find(value => value.field === 'system.moves.machine');
    assert.ok(machine.missingSourceEntries.includes('toxic'));
    assert.ok(!machine.missingSourceEntries.includes('attracttmmovelist06toxic'));
    assert.ok(machine.duplicateCurrentEntries.some(value => value.resolvedLabel === 'Attract' && value.count === 2 && value.paths.length === 2));
    const mew = records(original).find(value => value.identity === 'species.FYhHsV9BRatX7zQH');
    for (const group of ['machine', 'tutor']) assert.equal(mew.fieldReview.find(value => value.field === `system.moves.${group}`).status, 'source-universal-acquisition');
    const changed = copy(), corrupt = records(changed).find(value => value.identity === applin.identity);
    for (const fields of [corrupt.fieldReview, corrupt.sourceComparison.fields]) fields.find(value => value.field === 'system.moves.machine').duplicateCurrentEntries[0].paths[0] = '$.system.moves.machine[999].uuid';
    assert.ok(recordSourceReviewErrors(changed).some(value => value.includes('Declared field evidence does not describe exact current record: species.A0sBewaxj0epSaUU')));
});
test('available Phione, Tentacruel, Magneton and Torchic profiles cannot become unavailable through heading parsing', () => {
    const data = copy();
    for (const regression of data.index.readingOrderRegressions) {
        const row = records(data).find(x => x.identity === regression.identity);
        assert.ok(row.sourceComparison.fields.find(x => x.field === 'system.stats' && x.status === 'supported'));
        row.coverageState = 'unresolved';
        row.sourceComparison.equalMechanicalGroups = 0;
    }
    assert.equal(recordSourceReviewErrors(data).filter(x => x.includes('Available reading-order profile lost')).length, 4);
});
test('source evidence cannot promote production approval, gameplay or completion', () => {
    const data = copy();
    data.index.productionPolicyPromotion = true;
    data.index.coverage.completeAddressableClassification = true;
    records(data)[0].behavioralVerification = 'verified';
    const errors = recordSourceReviewErrors(data);
    assert.ok(errors.some(x => x.includes('promote policy')));
    assert.ok(errors.some(x => x.includes('approve policy/behavior')));
    assert.ok(errors.some(x => x.includes('while addressable inventory remains')));
});
test('evolution evidence cannot be lost through capability-scalar scoring overwrite', () => {
    const data = copy(), row = records(data).find(x => x.identity === 'species.04HUofEWMHdMr0Ya');
    assert.equal(row.sourceComparison.equalMechanicalGroups, 4);
    assert.equal(row.sourceComparison.independentGroups.evolutionLevels, true);
    row.sourceComparison.equalMechanicalGroups = 3;
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('independent-group count/evidence disagree')));
    const changed = copy(), evidence = records(changed).find(x => x.identity === row.identity).sourceComparison;
    evidence.fields.find(x => x.field === 'system.evolutions levels').recordValue = [999];
    assert.ok(recordSourceReviewErrors(changed).some(x => x.includes('does not describe current record fields')));
});
test('an excluded consumer does not establish exclusion of a shared older target', () => {
    const data = copy(), row = records(data).find(x => x.identity.startsWith('abilities.'));
    row.coverageState = 'excluded';
    row.generationReview = {status: 'excluded', basis: 'referenced by excluded consumer'};
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('consumer/name alone cannot exclude target')));
});
test('Darmanitan learning schedule is editorial without changing either source value', () => {
    const data = copy();
    const change = data.dex.profileDeltas.find(x => x.id === 'r04-d0418').changes.find(x => x.field === 'levelMoves');
    change.sourceInterpretation.category = 'optional-profile-rule-change';
    assert.ok(recordSourceReviewErrors(data).some(x => x.includes('Darmanitan unchanged learning schedule')));
});

test('Meowstic paragraph boundary preserves Zen Headbutt and both Helping Hand occurrences', () => {
    const parsed = parseSourceAcquisition('Helping Hand, Zen Headbutt\n(M) Helping Hand (N), (M) Mean Look (N), (F) Magical Leaf (N)');
    assert.deepEqual(parsed.entries, ['helpinghand', 'zenheadbutt', 'helpinghand', 'meanlook', 'magicalleaf']);
    assert.deepEqual(parsed.annotatedEntries[0], {key: 'helpinghand', qualifiers: ['M', 'N']});
    assert.deepEqual(unqualifiedAcquisitionKeys(parsed), ['helpinghand', 'zenheadbutt']);
    for (const identity of ['species.B56tEVSEIVOBj6n0', 'species.UdauaTVa0WtKqKAh']) {
        const row = records(original).find(value => value.identity === identity), tutor = row.fieldReview.find(value => value.field === 'system.moves.tutor');
        assert.deepEqual(row.fieldReview, row.sourceComparison.fields);
        assert.ok(!tutor.missingSourceEntries.includes('zenheadbuttmhelpinghand'));
        assert.ok(!tutor.unsupportedCurrentEntries.some(value => value.target === 'moves.bbYMsmddMV20isEx'));
        assert.ok(tutor.conditionalSourceEntries.some(value => value.key === 'helpinghand' && value.qualifiers.join(',') === 'M,N'));
        assert.ok(tutor.sourceAcquisitionParsing.sourceDuplicateKeys.some(value => value.key === 'helpinghand' && value.occurrences === 2));
        assert.ok(row.fieldReview.find(value => value.field === 'system.moves.level').missingSourceEntries.some(value => value.sourceGenderQualifier === 'M'));
        assert.ok(row.fieldReview.find(value => value.field === 'system.abilities exact UUID-resolved slot order').sourceConditionalSlots);
    }
});

test('actual numbered, empty, malformed-heading and secondary-stat boundaries stay separate', () => {
    assert.deepEqual(parseSourceAcquisition('06 Toxic, 08 Bulk Up. 10 Hidden Power', true).entries, ['toxic', 'bulkup', 'hiddenpower']);
    assert.equal(parseSourceAcquisition('None').boundary, 'empty-list');
    assert.deepEqual(parseSourceAcquisition('Unknown Source Move, Wise Guard').entries, ['unknownsourcemove', 'wiseguard']);
    const page = 'TM/HM Move List\n96 Nature Power\nsTutor Move List\nZen Headbutt\nDARMANITAN Zen Mode\n\nBase Stats:\nHP: 11';
    const machine = extractSourceAcquisitionSection(page, 'machine'), tutor = extractSourceAcquisitionSection(page, 'tutor');
    assert.equal(machine.closingHeading, 'sTutor Move List');
    assert.deepEqual(parseSourceAcquisition(machine.raw, true).entries, ['naturepower']);
    assert.deepEqual(parseSourceAcquisition(tutor.raw).entries, ['zenheadbutt']);
    assert.deepEqual(parseSourceAcquisition(extractSourceAcquisitionSection('Tutor Move List\nZen Headbutt\n375. DARMANITAN Zen Mode\n\nBase Stats:\nHP: 11', 'tutor').raw).entries, ['zenheadbutt']);
    const repeated = extractSourceAcquisitionSection('TM Move List\n45 Attract\nTM Move List\n06 Toxic\nTutor Move List\nSnore', 'machine');
    assert.deepEqual(parseSourceAcquisition(repeated.raw, true).entries, ['attract', 'toxic']);
});

test('level grammar separates literal Type errors and retains gender and printed markers', () => {
    const rows = parseSourceLevelAcquisition('45 Wild Charge - Charge\n47 Endeavor - NormalOne\n46 Heavy Slam - Eteel\n60 Outrage - Dragon |\n(M) 55 Quick Guard - Fighting');
    assert.deepEqual(rows.map(value => [value.key, value.printedType]), [['wildcharge', 'Charge'], ['endeavor', 'NormalOne'], ['heavyslam', 'Eteel'], ['outrage', 'Dragon'], ['quickguard', 'Fighting']]);
    assert.deepEqual(rows[3].trailingMarkers, ['|']);
    assert.deepEqual(rows[4].qualifiers, ['M']);
    assert.deepEqual(parseSourceLevelAcquisition('Evo Unknown Move - Unprinted')[0], {level: 'evolution-event', key: 'unknownmove', printedType: 'Unprinted', qualifiers: [], leadingMarkers: [], trailingMarkers: []});
});

test('finite acquisition audit rejects lost sections, erased literals and unexamined flags', () => {
    assert.deepEqual(original.acquisitionAudit.counts, {species: 1075, sections: 4300, literalTokenFlags: 21, typeColumnFlags: 3});
    for (const defect of ['section', 'flag', 'literal', 'context', 'candidate']) {
        const data = copy(), audit = data.acquisitionAudit;
        if (defect === 'section') audit.sections.pop();
        if (defect === 'flag') audit.flagDispositions[0].disposition = 'unreviewed';
        if (defect === 'context') audit.sections.find(value => value.anchor).anchor.contextNormalizedSha256 = '0'.repeat(64);
        if (defect === 'candidate') audit.flagDispositions.find(value => value.candidateComparison).candidateComparison.fields[0].recordValue = 'Unprinted';
        if (defect === 'literal') {
            const flag = audit.flagDispositions.find(value => value.parsedKey === 'wiseguard'), row = records(data).find(value => value.identity === flag.id.split(':')[0]);
            for (const fields of [row.fieldReview, row.sourceComparison.fields]) fields.find(value => value.field === 'system.moves.egg').missingSourceEntries = [];
        }
        const errors = recordSourceReviewErrors(data);
        const messages = {section: 'Acquisition audit section missing', flag: 'flag lacks a precise retained disposition', literal: 'erased a literal source token', context: 'source context invalid', candidate: 'Declared field evidence does not describe exact current record'};
        assert.ok(errors.some(value => value.includes(messages[defect])), defect);
    }
});

test('negative-scope exclusions require exact current numeric, Type and both metric facts', () => {
    for (const defect of ['height', 'type', 'generation', 'identity']) {
        const data = copy(), row = records(data).find(value => value.frozenQueue?.slice === 'B-scope'), proof = row.generationReview.exclusionEvidence, fact = data.generationScope.facts[proof.datasetEvidenceKey];
        if (defect === 'height') fact.heightDecimetres += 1;
        if (defect === 'type') fact.typeSlots[0].identifier = 'unprinted';
        if (defect === 'generation') fact.generationId = 8;
        if (defect === 'identity') proof.independentRecordFields = {name: row.labelForReview};
        assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Negative-scope proof does not establish exact numeric/Type/two-metric identity')), defect);
    }
});

test('negative-scope provenance retains the four previously verified cached Git blob identities', () => {
    const data = copy();
    data.generationScope.files[0].gitBlobSha = '0'.repeat(40);
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Negative-scope cached source provenance changed')));
});

test('compact Porygon stat, slot and reversed Move-Level grammar retains real profiles', () => {
    const parsed = parseCompactSourceProfiles('Aviateon (Flying)\nHP 10 / ATK 6 / DEF 7 / SP .ATK 11 / SP .DEF 7 / SPEED 13\nCloud Nine, Serene Grace / Windveiled, Blow Away / Confidence\nSand-Attack 5, Gust 9, Unknown Source Move 13\nCapabilities: Overland 6, Swim 3, Sky 7\nSkills: Athl 4d6, Acro 5d6+2\nartist unknown');
    assert.equal(parsed.length, 1);
    assert.deepEqual(parsed[0].stats, {hp: 10, atk: 6, def: 7, spatk: 11, spdef: 7, spd: 13});
    assert.deepEqual(parsed[0].abilitySlots[2], ['Adv Ability 1', 'Windveiled']);
    assert.deepEqual(parseSourceLevelAcquisition(parsed[0].levelText).map(value => [value.level, value.key, value.printedType]), [[5, 'sandattack', null], [9, 'gust', null], [13, 'unknownsourcemove', null]]);
    const compact = records(original).filter(row => row.sourceComparison?.compactSourceEvidence);
    assert.equal(compact.length, 10);
    for (const row of compact) {
        assert.equal(row.coverageState, 'reviewed');
        assert.equal(row.sourceComparison.independentGroups.evolutionLevels, false);
        for (const group of ['machine', 'egg', 'tutor']) assert.equal(row.fieldReview.find(field => field.field === `system.moves.${group}`).status, 'unavailable-source-omission');
    }
    const corroseon = compact.find(row => row.identity === 'species.6p9Aq8JeY7236EW6'), caps = corroseon.fieldReview.find(field => field.field === 'system.capabilities numeric fields');
    assert.equal(caps.values.find(value => value.field === 'overland').source, null);
    assert.equal(caps.sourceLiteralIssues[0].literal, 'Oveland 6');
    const dungeon = compact.find(row => row.identity === 'species.U3wajsyQAAgVpTw4');
    assert.match(dungeon.sourceComparison.compactSourceEvidence.readabilityLimitation, /embedded PDF text.*obscured/);
    assert.ok(dungeon.fieldReview.some(field => field.sourceProfileNote?.heading === 'Embedded PDF text and rendered-glyph readability'));
});

test('unmatched exact dependency paths remain required even when a target occurs elsewhere', () => {
    const data = copy(), row = records(data).find(value => value.dependencyEvidence?.some(entry => entry.paths.length > 1));
    row.dependencyEvidence.find(entry => entry.paths.length > 1).paths.pop();
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Unmatched dependency exact paths/target evidence disagrees')));
});

test('unmatched available counterparts, literals and current/history fields cannot become generic completion', () => {
    for (const defect of ['candidate', 'literal', 'current', 'history', 'scope']) {
        const data = copy(), row = records(data).find(value => value.frozenQueue?.slice === 'B-unmatched' && value.competingSourceComparisons?.length);
        if (defect === 'candidate') row.competingSourceComparisons.pop();
        if (defect === 'literal') {
            const source = records(data).find(value => value.identity === 'species.QZeXl01nbodoExGa');
            for (const fields of [source.fieldReview, source.sourceComparison.fields]) fields.find(field => field.field === 'system.moves.level').missingSourceEntries = [];
        }
        if (defect === 'current') {
            const source = records(data).find(value => value.frozenQueue?.slice === 'B-unmatched' && value.currentRecordEvidence);
            source.currentRecordEvidence.fieldHashes.stats = '0'.repeat(64);
        }
        if (defect === 'history') row.exportLineage.snapshots.find(value => value.recordFound).fieldComparisons[0].currentJsonSha256 = '0'.repeat(64);
        if (defect === 'scope') data.unmatchedSpecies.members.pop();
        const expected = {candidate: 'Unmatched available candidate comparisons incomplete', literal: 'Unmatched literal source token erased', current: 'Unmatched current field inventory/value evidence disagrees', history: 'Unmatched export current/changed field evidence disagrees', scope: 'Unmatched species frozen scope/policy changed'};
        assert.ok(recordSourceReviewErrors(data).some(value => value.includes(expected[defect])), defect);
    }
});

test('completed B comparisons do not bypass its required predecessor review before C', () => {
    const data = copy();
    data.batchManifest.batches.find(value => value.id === 'B').acceptance.status = 'pending-substantive-review';
    data.batchManifest.batches.find(value => value.id === 'C').status = 'in-progress';
    assert.ok(recordSourceReviewErrors(data).some(value => value.includes('Frozen family review gate not cleared: C')));
    const wrongCounts = copy();
    wrongCounts.batchManifest.batches.find(value => value.id === 'B').closure.counts.reviewed++;
    assert.ok(recordSourceReviewErrors(wrongCounts).some(value => value.includes('Closed family aggregate counts/evidence disagree: B')));
});
