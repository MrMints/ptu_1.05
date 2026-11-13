import { compilePack, extractPack } from '@foundryvtt/foundryvtt-cli';
import { mkdir, readdir, readFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const command = process.argv[2];
const manifest = JSON.parse(await readFile('system.json', 'utf8'));
await mkdir('.cache', { recursive: true });
const summary = [];
for (const pack of manifest.packs) {
    const source = join('packs', pack.name, '_source');
    if (command === 'recover') {
        await mkdir(source, { recursive: true });
        await extractPack(join('.cache/recovery/packs', pack.name), source, {
            documentType: pack.type, omitVolatile: false,
            transformName: doc => `${doc._id}.json`, jsonOptions: { space: 2 }
        });
    } else if (command === 'build' || command === 'verify') {
        await compilePack(source, join('.cache/compiled-packs', pack.name));
        if (command === 'verify') {
            const roundtrip = await mkdtemp('.cache/roundtrip-');
            await extractPack(join('.cache/compiled-packs', pack.name), roundtrip, {
                documentType: pack.type, omitVolatile: false, transformName: doc => `${doc._id}.json`
            });
            const expected = (await readdir(source)).filter(f => f.endsWith('.json')).sort();
            const actual = (await readdir(roundtrip)).filter(f => f.endsWith('.json')).sort();
            assert.deepEqual(actual, expected, `${pack.name}: document IDs changed`);
            for (const file of expected) {
                assert.deepEqual(JSON.parse(await readFile(join(roundtrip, file))), JSON.parse(await readFile(join(source, file))), `${pack.name}/${file}: content changed`);
            }
        }
    } else throw new Error('Use recover, build, or verify');
    summary.push({ pack: pack.name, documents: (await readdir(source)).filter(f => f.endsWith('.json')).length });
}
console.table(summary);
