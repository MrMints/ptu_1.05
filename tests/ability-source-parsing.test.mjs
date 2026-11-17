import test from 'node:test';
import assert from 'node:assert/strict';
import {extractAbilityDefinitions, parseAbilityRuleClauses} from '../tools/ability-source-parsing.mjs';
import {parseSourceAbilityRules} from '../tools/record-source-review.mjs';

test('explicit Defensive and Immune markers keep distinct complete tag names', () => {
    for (const tag of ['Defensive', 'Immune']) {
        for (const text of [`${tag}: Effect: The user resists Fire.`, `Effect: The user resists Fire. ${tag}.`]) {
            const parsed = parseSourceAbilityRules(text);
            assert.deepEqual(parsed.explicitTags, [tag]);
            assert.deepEqual(parsed.clauses, [{kind: 'effect', text: 'The user resists Fire.'}]);
        }
    }
    assert.notDeepEqual(parseSourceAbilityRules('Effect: Resist Fire. Defensive.').explicitTags, parseSourceAbilityRules('Effect: Resist Fire. Immune.').explicitTags);
    assert.equal(parseSourceAbilityRules('Effect: The user is immune to burns.').clauses[0].text, 'The user is immune to burns.');
    const middle = parseSourceAbilityRules('Effect: Resist Fire. Defensive. Do not lose HP to Burn.');
    assert.deepEqual(middle.explicitTags, ['Defensive']);
    assert.equal(middle.clauses[0].text, 'Resist Fire.  Do not lose HP to Burn.');
});

test('source spelling, clause roles and literal paragraph representation remain visible', () => {
    const heatproof = parseSourceAbilityRules('Effect: The user resists Fire Type movesf one step further, and does not lose Hit Points from the Burn Condition.');
    assert.match(heatproof.clauses[0].text, /movesf/);
    assert.deepEqual(heatproof.explicitTags, []);
    const current = parseSourceAbilityRules('Trigger: The user is hit.\\nThe user gains +1 Speed. Defensive.');
    assert.equal(current.representation.literalParagraphEscapes, 1);
    assert.equal(current.clauses[0].kind, 'trigger');
    assert.match(current.clauses[0].text, /gains \+1 Speed/);
    const source = parseAbilityRuleClauses('Trigger: The user is hit. Effect: The user gains +1 Speed.');
    assert.deepEqual(source.clauses.map(clause => clause.kind), ['trigger', 'effect']);
});

test('definition boundaries separate header fields, continuation and following content', () => {
    const pages = {1: 'Ability: Gentle Vibe\nScene – Standard Action\nRange: Burst 2\nEffect: All targets\n', 2: 'Indices and Reference\nlose rage.\nAbility: Water Veil\nStatic\nKeywords: Immune\nEffect: No burns.\nMoves\nType: Fire'};
    const parsed = extractAbilityDefinitions('fixture', pages, [[1, 2]], {stopHeadings: ['Moves']});
    assert.equal(parsed.records.length, 2);
    assert.deepEqual(parsed.rejected, []);
    assert.equal(parsed.records[0].frequency, 'Scene – Standard Action');
    assert.deepEqual(parsed.records[0].headerFields, {range: 'Burst 2'});
    assert.match(parsed.records[0].body, /All targets\s+lose rage/);
    assert.deepEqual(parsed.records[0].anchors.map(part => part.pdfPage), [1, 2]);
    assert.equal(parsed.records[1].frequency, 'Static');
    assert.deepEqual(parsed.records[1].headerFields, {keywords: 'Immune'});
    assert.equal(parsed.records[1].nextBoundary, 'Moves');
    assert.doesNotMatch(parsed.records[1].body, /Type: Fire/);
    assert.equal(extractAbilityDefinitions('slot', {1: 'Ability: Neuroforce\nHP: 10\nAttack: 20'}, [[1, 1]]).rejected.length, 1);
});
