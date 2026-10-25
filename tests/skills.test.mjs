import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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

test('legacy species input accepts every core/Carbon name without changing numeric or background behavior', () => {
    for (const [key, { name, aliases }] of Object.entries(SKILLS)) {
        for (const alias of [key, name, ...aliases]) {
            const skills = Object.fromEntries(Object.keys(SKILLS).map(k => [k, {
                label: 'stale', value: { value: 2, mod: 0 }, modifier: { value: 0, mod: 0 }
            }]));
            calculateSkills(skills, { Skills: { [` ${alias.toUpperCase().replaceAll(' ', '  ')} `]: { Dice: 5, Mod: -2 }, Unknown: { Dice: 99, Mod: 99 } } },
                { increased: { one: key }, decreased: { one: key } }, 3);
            assert.equal(skills[key].value.value, 5, alias);
            assert.equal(skills[key].value.mod, 0, alias);
            assert.equal(skills[key].modifier.value, -2, alias);
            assert.equal(skills[key].modifier.mod, 3, alias);
            assert.equal(Object.keys(skills).length, 17);
        }
    }
});

test('all 17 existing skill presentations preserve numeric data, custom labels and key selectors', () => {
    const skills = Object.fromEntries(Object.entries(SKILLS).map(([key, { name, aliases }], i) => [key, {
        label: aliases[0] ?? name, slug: key, value: { value: 2 + i % 5, mod: i % 3 - 1, total: 1 + i % 6 },
        modifier: { value: i - 8, mod: 2, total: i - 6 }, rank: 'novice', type: i % 3
    }]));
    const original = structuredClone(skills);
    const presented = presentSkills(skills, { localize: key => key });
    for (const [key, {name}] of Object.entries(SKILLS)) {
        assert.equal(presented[key].label, name);
        assert.deepEqual({...presented[key], label: original[key].label}, original[key]);
    }
    assert.deepEqual(skills, original);
});

test('selective source terminology changes preserve all other content, identities and rule data', async () => {
    const review = JSON.parse(await readFile('docs/data/skill-terminology-review.json'));
    assert.equal(review.documents.length, 17);
    assert.equal(review.documents.filter(row => row.changedFields.length).length, 8);
    for (const row of review.documents) {
        const document = JSON.parse(await readFile(row.path));
        assert.equal(`${row.path.split('/')[1]}.${document._id}`, row.identity);
        for (const field of row.changedFields) {
            assert.match(field.pointer, /^\/system\/(effect|prerequisites\/\d+)$/);
            assert.equal(field.before.replaceAll('Intimidation', 'Intimidate'), field.after);
            const parts = field.pointer.slice(1).split('/');
            const key = parts.pop();
            const parent = parts.reduce((value, part) => value[part], document);
            assert.equal(parent[key], field.after);
            parent[key] = field.before;
        }
        assert.equal(createHash('sha256').update(JSON.stringify(document)).digest('hex'), row.baselineHash,
            `${row.identity}: unexpected change beyond the reviewed text fields`);
    }
});
