import test from 'node:test';
import assert from 'node:assert/strict';
import {extractMoveDefinitions, extractContestDefinitions, parseMoveRuleClauses} from '../tools/move-source-parsing.mjs';

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
