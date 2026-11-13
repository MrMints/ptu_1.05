import test from 'node:test';
import assert from 'node:assert/strict';
import {extractMoveDefinitions, extractContestDefinitions, parseMoveRuleClauses, moveSourceNumericTokens, moveSourceWordingProof, extractMoveUseConditions} from '../tools/move-source-parsing.mjs';

test('complete Move boundaries retain continuation, Special, weapon conditions and repeated effects', () => {
    const pages = {1: 'Move: Example\nType: Steel\nFrequency: Scene\nAC: None\nClass: Status\nRange: Self, Shield\nSet-Up Effect: Choose one\n', 2: 'Indices and Reference\nally.\nResolution Effect: Gain +2.\nSpecial: Grants Reach.\nLimitation: Melee Weapons Only\nMove: Next\nType: Normal\nFrequency: EOT\nEffect: None\nJousting Samurott\nUnrelated narrative'};
    const parsed = extractMoveDefinitions('fixture', pages, [[1, 2]], {boundaries: [/^Jousting Samurott$/]});
    assert.equal(parsed.records.length, 2);
    assert.deepEqual(parsed.records[0].anchors.map(part => part.pdfPage), [1, 2]);
    assert.match(parsed.records[0].effectText, /Choose one\s+ally/);
    assert.match(parsed.records[0].effectText, /Special: Grants Reach/);
    assert.equal(parsed.records[0].dependentConditions[0].value, 'Melee Weapons Only');
    assert.doesNotMatch(parsed.records[1].rawDefinition, /Unrelated narrative/);
    assert.equal(parsed.records[1].nextBoundary, 'Jousting Samurott');
});

test('typed setup and resolution clauses are not lost through ordered-word comparison', () => {
    const source = parseMoveRuleClauses('Set-Up Effect: Choose one target. Resolution Effect: Deal 5 damage. Special: Grants Reach.');
    assert.deepEqual(source.clauses.map(clause => clause.kind), ['set-up-effect', 'resolution-effect', 'special']);
    const current = parseMoveRuleClauses('Trigger: Hit.\\nDeal 5 damage.');
    assert.equal(current.representation.literalParagraphEscapes, 1);
    assert.equal(current.clauses[0].kind, 'trigger');
    assert.match(current.clauses[0].text, /Deal 5 damage/);
});

test('Contest tables preserve X dice and stop before general mechanics', () => {
    const units = extractContestDefinitions('core', {504: 'Contest Effects\nInversed Appeal: Xd6 – X is equal to 5 minus your\ncurrent Voltage.\nUnsettling: 5d6 – You lose 2 Voltage.\nContest Mechanics\nRoll Charm for Cute.'}, [504]);
    assert.equal(units.length, 2);
    assert.equal(units[0].dice, 'X');
    assert.match(units[0].effectText, /current Voltage/);
    assert.doesNotMatch(units[1].effectText, /Roll Charm/);
    assert.equal(units[1].nextBoundary, 'Contest Mechanics');
    assert.equal(extractMoveDefinitions('core', {1: 'Move: The first line contains the Name\nType: Next is the Elemental Type\nFrequency: The rate of use'}, [[1, 1]]).rejected.length, 1);
});

test('printed weapon-rank headings cannot become a preceding Move limitation', () => {
    const parsed = extractMoveDefinitions('fixture', {1: 'Move: First\nType: Normal\nFrequency: EOT\nEffect: Hit.\nLimitation: Melee Weapons Only\nExpert Arcane Weapon Moves\nMove: Second\nType: Normal\nFrequency: Scene\nEffect: Hit twice.'}, [[1, 1]]);
    assert.equal(parsed.records.length, 2);
    assert.equal(parsed.records[0].nextBoundary, 'Expert Arcane Weapon Moves');
    assert.equal(parsed.records[0].dependentConditions[0].value, 'Melee Weapons Only');
    assert.doesNotMatch(parsed.records[0].rawDefinition, /Expert Arcane/);
});

test('wording proofs preserve spaced and Unicode minus signs and unknown arithmetic', () => {
    const norm = text => text.toLowerCase().match(/[a-z0-9]+|[+%/]|-(?=\d)/g)?.join(' ') ?? '';
    const record = parseMoveRuleClauses('Lower Attack by 1 Combat Stage.');
    for (const text of ['Lower Attack -1 Combat Stage.', 'Lower Attack - 1 Combat Stage.', 'Lower Attack −1 Combat Stage.']) {
        const source = parseMoveRuleClauses(text);
        assert.deepEqual(moveSourceNumericTokens(source), ['-1']);
        assert.equal(moveSourceWordingProof(record, {ruleStructure: source, dependentConditions: []}, norm), null);
    }
    const uncertain = parseMoveRuleClauses('Lower Attack ≥1 Combat Stage.');
    assert.ok(moveSourceNumericTokens(uncertain).includes('unrecognized-sign:≥'));
    assert.equal(moveSourceWordingProof(record, {ruleStructure: uncertain, dependentConditions: []}, norm), null);
    const positive = parseMoveRuleClauses('Lower Attack by +1 Combat Stage.');
    assert.equal(moveSourceWordingProof(positive, {ruleStructure: parseMoveRuleClauses('Lower Attack + 1 Combat Stage.'), dependentConditions: []}, norm), 'stat-change-by-insertion');
    assert.deepEqual(moveSourceNumericTokens(parseMoveRuleClauses('Damage Base 11 (3d10+10/27).')), moveSourceNumericTokens(parseMoveRuleClauses('Damage Base 11 (3d10+10 / 27).')));
    assert.deepEqual(moveSourceNumericTokens(parseMoveRuleClauses('Lose 1/2 HP.')), moveSourceNumericTokens(parseMoveRuleClauses('Lose 1 ⁄ 2 HP.')));
    assert.notDeepEqual(moveSourceNumericTokens(parseMoveRuleClauses('Lose 1/-2 HP.')), moveSourceNumericTokens(parseMoveRuleClauses('Lose 1/2 HP.')));
});

test('stored use-condition cues retain complete UUIDs and stay separate from effect clauses', () => {
    const uuid = '@UUID[Compendium.ptu.moves.Item.abcdefghijklmnop]{Effect: Example}';
    const cues = extractMoveUseConditions(`Hit. Requirement: user is prepared.\\nRequires ${uuid}.`);
    assert.equal(cues[0].text, 'user is prepared.');
    assert.equal(cues[1].text, `Requires ${uuid}.`);
    assert.deepEqual(extractMoveUseConditions(`Requirement: ${uuid}\nEffect: Deal damage.`).map(value => value.text), [uuid]);
});
