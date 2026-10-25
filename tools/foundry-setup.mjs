import {mkdir, cp, readFile, writeFile, lstat, rename, mkdtemp, realpath} from 'node:fs/promises';
import {resolve, join, relative, isAbsolute, sep, basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import lockfile from 'proper-lockfile';

function within(root, path) {
    const part = relative(root, path);
    if (!part || part === '..' || part.startsWith('..' + sep) || isAbsolute(part)) throw new Error(`Path is outside the intended test area: ${path}`);
}

async function safePath(root, path) {
    within(root, path);
    let current = root;
    for (const part of relative(root, path).split(sep)) {
        current = join(current, part);
        try {
            if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing a symbolic link/junction: ${current}`);
        } catch (error) {
            if (error.code === 'ENOENT') break;
            throw error;
        }
    }
}

async function exists(path) {
    try { await lstat(path); return true; }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

/** Refresh only this workspace's disposable installation. No database is opened or deleted. */
export async function setupFoundry({workspace = process.cwd()} = {}) {
    workspace = resolve(workspace);
    const canonical = await realpath(workspace);
    const normalize = path => process.platform === 'win32' ? path.toLowerCase() : path;
    if (normalize(canonical) !== normalize(workspace)) throw new Error('Workspace must not traverse a symbolic link/junction.');
    const data = resolve(workspace, '.foundry-test');
    await safePath(workspace, data);
    await safePath(workspace, join(data, 'Config'));
    await mkdir(join(data, 'Config'), {recursive:true});
    const options = join(data, 'Config/options.json');
    await safePath(data, options);
    // Same lock target, library and stale interval used by Foundry v13.351.
    // Holding this lock also prevents Foundry starting during refresh.
    let release;
    try { release = await lockfile.lock(options, {realpath:false, stale:10000, update:1000, retries:0}); }
    catch (error) {
        if (error.code === 'ELOCKED') throw new Error('Stop Foundry before refreshing .foundry-test (data-directory lock is held).');
        throw error;
    }
    let backup = null;
    const system = join(data, 'Data/systems/ptu');
    try {
        await safePath(data, system);
        const manifest = JSON.parse(await readFile(join(workspace, 'system.json'), 'utf8'));
        if (manifest.id !== 'ptu') throw new Error('Disposable setup is scoped to the ptu system.');
        for (const pack of manifest.packs) {
            if (!/^[a-z0-9-]+$/.test(pack.name) || pack.path !== `packs/${pack.name}`) throw new Error('Unsafe pack path.');
            const compiled = join(workspace, '.cache/compiled-packs', pack.name);
            await safePath(workspace, compiled);
            const current = (await readFile(join(compiled, 'CURRENT'), 'utf8')).trim();
            if (!/^MANIFEST-\d+$/.test(current)) throw new Error(`Invalid generated pack CURRENT: ${pack.name}`);
            await readFile(join(compiled, current));
        }
        const stagingRoot = join(data, '.setup-staging');
        const backupsRoot = join(data, '.setup-backups');
        await safePath(data, stagingRoot);
        await safePath(data, backupsRoot);
        await mkdir(stagingRoot, {recursive:true});
        await mkdir(backupsRoot, {recursive:true});
        const stage = join(await mkdtemp(join(stagingRoot, 'ptu-')), 'ptu');
        await safePath(data, stage);
        await mkdir(stage);
        const copy = async (source, destination, generatedPack = false) => {
            await safePath(workspace, source);
            await cp(source, destination, {recursive:true, filter:async path => {
                if ((await lstat(path)).isSymbolicLink()) throw new Error(`Refusing a source symbolic link: ${path}`);
                return !generatedPack || !['LOCK','LOG','LOG.old','lost'].includes(basename(path));
            }});
        };
        for (const dir of ['src','static','css','images']) await copy(join(workspace,dir),join(stage,dir));
        for (const file of ['system.json','template.json']) await copy(join(workspace,file),join(stage,file));
        for (const pack of manifest.packs) await copy(join(workspace,'.cache/compiled-packs',pack.name),join(stage,pack.path),true);
        const world = join(data, 'Data/worlds/ptu-verification');
        await safePath(data, world);
        await mkdir(world, {recursive:true});
        const worldManifest = join(world,'world.json');
        if (!await exists(worldManifest)) await writeFile(worldManifest, JSON.stringify({
            id:'ptu-verification', title:'PTU verification (disposable)', system:'ptu',
            coreVersion:'13.351', systemVersion:manifest.version, description:'Isolated PTU batch testing world.'
        },null,2)+'\n');
        await mkdir(join(data,'Data/systems'), {recursive:true});
        if (await exists(system)) {
            if (!(await lstat(system)).isDirectory()) throw new Error('Disposable system path must be a directory.');
            backup = join(await mkdtemp(join(backupsRoot,'ptu-')),'ptu');
            await safePath(data, backup);
            await rename(system,backup);
        }
        try { await rename(stage,system); }
        catch (error) { if (backup) await rename(backup,system); throw error; }
        return {data, system, backup};
    } finally { await release(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const result = await setupFoundry();
    console.log(`Refreshed disposable system: ${result.system}\nPrevious copy: ${result.backup ?? '(first installation)'}\nConfig, licensing and worlds preserved. Stop Foundry before running setup again.`);
}
