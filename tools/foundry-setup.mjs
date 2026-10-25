import { mkdir, cp, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const data = resolve('.foundry-test');
const system = resolve('.foundry-test/Data/systems/ptu');
await mkdir(system, { recursive: true });
for (const dir of ['src', 'static', 'css', 'images']) await cp(dir, `${system}/${dir}`, { recursive: true });
for (const file of ['system.json', 'template.json']) await cp(file, `${system}/${file}`);
const manifest = JSON.parse(await readFile('system.json', 'utf8'));
for (const pack of manifest.packs) await cp(`.cache/compiled-packs/${pack.name}`, `${system}/${pack.path}`, { recursive: true });
const world = resolve('.foundry-test/Data/worlds/ptu-verification');
await mkdir(world, { recursive: true });
try { await access(`${world}/world.json`); }
catch {
    await writeFile(`${world}/world.json`, JSON.stringify({
        id: 'ptu-verification', title: 'PTU verification (disposable)', system: 'ptu',
        coreVersion: '13.351', systemVersion: manifest.version, description: 'Isolated PTU batch testing world.'
    }, null, 2));
}
console.log(`Test data: ${data}\nStop Foundry before refreshing this copy. Configure licensing through Foundry's normal setup.`);
