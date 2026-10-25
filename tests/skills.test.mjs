import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SKILLS, resolveSkillKey, getSkillLabel, presentSkills, EDUCATION_SKILLS } from '../src/util/skills.js';
import { calculateSkills } from '../src/module/actor/pokemon/skills.js';

test('all core names, historical aliases and identifiers resolve exactly', () => {
    assert.equal(Object.keys(SKILLS).length, 17);
    for (const [key, { name, aliases }] of Object.entries(SKILLS)) {
        for (const text of [key, name, ...aliases]) {
            assert.equal(resolveSkillKey(`  ${text.toUpperCase().replaceAll(' ', '   ')}  `), key);
        }
    }
    assert.equal(resolveSkillKey('Pokemon Education'), 'pokemonEd');
    for (const unknown of ['', 'Zoolog', 'Novice Zoology', 'Occultism Researcher', null, 42]) assert.equal(resolveSkillKey(unknown), null);
});

test('both localization namespaces and all template keys retain the core mapping', async () => {
    const en = JSON.parse(await readFile('static/lang/en.json'));
    const skills = JSON.parse(await readFile('template.json')).Actor.templates.skills.skills;
    assert.deepEqual(Object.keys(skills).sort(), Object.keys(SKILLS).sort());
    for (const [key, { name }] of Object.entries(SKILLS)) {
        assert.equal(en[`SKILL.${key}`], name);
        assert.equal(en.PTU.Skills[key], name);
        assert.equal(skills[key].label, name);
    }
});

test('presentation corrects stale labels without changing persisted values or custom skills', () => {
    const original = { pokemonEd: { label: 'Zoology', value: { value: 5, mod: 1 }, modifier: { value: 3 } }, custom: { label: 'Custom skill', value: 2 } };
    const before = structuredClone(original);
    const presented = presentSkills(original, { localize: key => key });
    assert.equal(presented.pokemonEd.label, 'Pokémon Education');
    assert.deepEqual(presented.pokemonEd.value, original.pokemonEd.value);
    assert.equal(presented.pokemonEd.modifier.value, 3);
    assert.equal(presented.custom.label, 'Custom skill');
    assert.deepEqual(original, before);
    assert.equal(getSkillLabel('pokemonEd', { localize: key => key.startsWith('SKILL.') ? 'Conocimiento Pokémon' : key }), 'Conocimiento Pokémon');
});

test('legacy Education classification is independent of labels and preserves species overrides', () => {
    const skills = Object.fromEntries(Object.keys(SKILLS).map(key => [key, { label: 'unrelated', value: { value: 2, mod: 0 }, modifier: { value: 0, mod: 0 } }]));
    calculateSkills(skills, { Skills: { TechEd: { Dice: 3, Mod: 2 }, Athletics: { Dice: 4, Mod: 1 } } }, { increased: {}, decreased: {} });
    for (const key of EDUCATION_SKILLS.filter(key => key !== 'techEd')) assert.equal(skills[key].value.value, 1);
    assert.equal(skills.techEd.value.value, 3);
    assert.equal(skills.techEd.modifier.value, 2);
    assert.equal(skills.athletics.value.value, 4);
    assert.equal(skills.charm.value.value, 2);
});
