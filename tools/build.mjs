import { ZipArchive } from 'archiver';
import { createWriteStream } from 'node:fs';
import { access, mkdir, copyFile, readFile } from 'node:fs/promises';
import { finished } from 'node:stream/promises';
import {createContentInventory} from './content-scope.mjs';
import {assertCompleteSupportedContent} from '../src/util/content-scope.js';

await mkdir('dist', { recursive: true });
const scope=await createContentInventory();
if(process.argv.includes('--supported'))assertCompleteSupportedContent(scope);
await import('node:fs/promises').then(fs=>fs.writeFile('dist/content-scope-status.json',JSON.stringify({
    kind:'development-candidate',counts:scope.counts,completeSupportedScope:false,
    packageCompatibilityDecision:scope.packageCompatibilityDecision,packageDisposition:scope.packageDisposition,
    knownNewAcquisitionExclusions:scope.records.filter(r=>r.generationEligibility==='excluded').map(r=>r.identity),
    dependencyBlockers:scope.dependencies.blockers.length
},null,2)+'\n'));
const manifest = JSON.parse(await readFile('system.json', 'utf8'));
const archive = new ZipArchive({ zlib: { level: 6 } });
const output = createWriteStream('dist/system.zip');
archive.on('error', error => output.destroy(error));
archive.on('warning', error => output.destroy(error));
archive.pipe(output);
// Explicit allowlist: no local PDFs, development data, credentials, caches or source databases.
for (const dir of ['src', 'static', 'css', 'images']) archive.directory(dir, dir);
for (const file of ['system.json', 'template.json', 'README.md', 'CHANGELOG.md']) archive.file(file, { name: file });
archive.file('dist/content-scope-status.json',{name:'content-scope-status.json'});
for (const pack of manifest.packs) {
    await access(`.cache/compiled-packs/${pack.name}/CURRENT`);
    archive.glob('**/*', { cwd: `.cache/compiled-packs/${pack.name}`, ignore: ['LOCK', 'LOG', 'LOG.old', 'lost/**'] }, { prefix: pack.path });
}
await archive.finalize();
await finished(output);
await copyFile('system.json', 'dist/system.json');
console.log(`Built dist/system.zip (${output.bytesWritten} bytes) and dist/system.json`);
console.log('Development candidate only: supported-content classification/package compatibility remains blocked; see content-scope-status.json.');
