import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Test fixtures only: never open or modify a Foundry database.
const manifest = JSON.parse(await readFile('system.json', 'utf8'));
if (manifest.id !== 'ptu') throw new Error('This check is scoped to the PTU system.');
const expected = { systemId: manifest.id, systemVersion: manifest.version, packs: [] };
for (const pack of manifest.packs) {
    const row = { name: pack.name, type: pack.type, documents: [], folders: [] };
    const source = join('packs', pack.name, '_source');
    for (const file of (await readdir(source)).filter(file => file.endsWith('.json'))) {
        const document = JSON.parse(await readFile(join(source, file), 'utf8'));
        const ids = document._key?.startsWith('!folders!') ? row.folders : row.documents;
        ids.push(document._id);
    }
    row.documents.sort();
    row.folders.sort();
    expected.packs.push(row);
}
const fixtures = '.foundry-test/Data/ptu02-checks';
await mkdir(fixtures, { recursive: true });
await writeFile(join(fixtures, 'expected-packs.json'), `${JSON.stringify(expected, null, 2)}\n`);
await copyFile('tools/foundry-pack-check.macro.js', join(fixtures, 'pack-check-macro.js'));
console.log(`Prepared expectations for ${expected.packs.length} packs in ${fixtures}.`);
console.log('As GM in ptu-verification, paste tools/foundry-pack-check.macro.js into a Script macro and execute it.');
