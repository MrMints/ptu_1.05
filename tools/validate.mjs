import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { SKILLS } from '../src/util/skills.js';

const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const manifest = await readJSON('system.json');
assert.equal(manifest.id, 'ptu');
assert.equal(manifest.version, (await readJSON('package.json')).version);
for (const key of ['url', 'manifest', 'download']) assert.ok(manifest[key].includes('MrMints/ptu_1.05'), key);
for (const path of [...manifest.esmodules, ...manifest.scripts, ...manifest.styles, ...manifest.languages.map(l => l.path)]) await access(path);
const english = await readJSON('static/lang/en.json');
const template = await readJSON('template.json');
for (const [key, skill] of Object.entries(SKILLS)) {
    assert.equal(english[`SKILL.${key}`], skill.name);
    assert.equal(english.PTU.Skills[key], skill.name);
    assert.equal(template.Actor.templates.skills.skills[key].label, skill.name);
}
let total = 0;
for (const pack of manifest.packs) {
    assert.equal(pack.path, `packs/${pack.name}`);
    const ids = new Set();
    const dir = join(pack.path, '_source');
    const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
    assert.ok(files.length, `${pack.name}: empty source pack`);
    for (const file of files) {
        const doc = await readJSON(join(dir, file));
        assert.ok(doc._id && !ids.has(doc._id), `${pack.name}/${file}: missing/duplicate ID`);
        assert.ok(doc.name, `${pack.name}/${file}: missing name`);
        ids.add(doc._id);
    }
    total += files.length;
}
console.log(`Validated manifest, 17 skill mappings, ${manifest.packs.length} packs and ${total} source documents. Gameplay verification is separate.`);
