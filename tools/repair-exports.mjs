import { readFile, writeFile, readdir } from 'node:fs/promises';
import { deduplicateEmbedded } from './embedded-records.mjs';
const manifest = JSON.parse(await readFile('system.json'));
const report = [];
for (const pack of manifest.packs) {
    const dir = `packs/${pack.name}/_source`;
    for (const file of (await readdir(dir)).sort()) {
        if (!file.endsWith('.json')) continue;
        const path = `${dir}/${file}`;
        const repairs = [];
        const output = deduplicateEmbedded(JSON.parse(await readFile(path)), repairs);
        if (repairs.length) {
            await writeFile(path, JSON.stringify(output, null, 2) + '\n');
            report.push({ path, removedIdenticalEmbeddedRecords: repairs });
        }
    }
}
if (report.length) await writeFile('docs/data/export-repairs.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Repaired ${report.length} documents; removed ${report.reduce((n, row) => n + row.removedIdenticalEmbeddedRecords.length, 0)} identical embedded records.`);
