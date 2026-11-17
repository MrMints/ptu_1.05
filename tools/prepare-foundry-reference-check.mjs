import {mkdir, readFile, writeFile} from 'node:fs/promises';

const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const manifest = await readJSON('system.json');
const report = await readJSON('docs/data/compendium-reference-audit.json');
const fixture = {systemId: manifest.id, systemVersion: manifest.version, sourceFingerprint: report.sourceFingerprint, runtime: [], provenance: []};
const provenance = new Map();
for (const row of report.targets) {
    if (row.classification === 'runtime-reference') fixture.runtime.push(row);
    else for (const occurrence of row.occurrences) {
        if (provenance.has(occurrence.source)) continue;
        const [pack, id] = occurrence.source.split('.');
        const data = await readJSON(`packs/${pack}/_source/${id}.json`);
        provenance.set(occurrence.source, {
            source: occurrence.source, legacySourceId: data.flags?.core?.sourceId,
            compendiumSource: data._stats?.compendiumSource
        });
    }
}
fixture.provenance = [...provenance.values()].sort((a,b) => a.source.localeCompare(b.source));
await mkdir('.foundry-test/Data/ptu02-checks', {recursive:true});
await writeFile('.foundry-test/Data/ptu02-checks/reference-fixture.json', JSON.stringify(fixture, null, 2) + '\n');
console.log(`Prepared ${fixture.runtime.length} runtime targets and ${fixture.provenance.length} provenance source records. Run tools/foundry-reference-check.macro.js as GM in ptu-verification.`);
