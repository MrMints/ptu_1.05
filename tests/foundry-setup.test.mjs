import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,readFile,readdir,symlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import lockfile from 'proper-lockfile';
import {setupFoundry} from '../tools/foundry-setup.mjs';

async function fixture() {
    await mkdir('.cache',{recursive:true});
    const root=await mkdtemp(resolve('.cache/setup-test-'));
    for(const dir of ['src','static','css','images','.cache/compiled-packs/example','.foundry-test/Config','.foundry-test/Data/worlds/ptu-verification']) await mkdir(join(root,dir),{recursive:true});
    await writeFile(join(root,'system.json'),JSON.stringify({id:'ptu',version:'test',packs:[{name:'example',path:'packs/example'}]}));
    await writeFile(join(root,'template.json'),'{}');
    await writeFile(join(root,'.cache/compiled-packs/example/CURRENT'),'MANIFEST-000001\n');
    await writeFile(join(root,'.cache/compiled-packs/example/MANIFEST-000001'),'fixture');
    await writeFile(join(root,'.foundry-test/Config/options.json'),'private options');
    await writeFile(join(root,'.foundry-test/Data/worlds/ptu-verification/world.json'),'saved disposable world');
    return root;
}

test('repeated setup replaces stale files, preserves a recoverable copy and leaves config/world bytes intact',async()=>{
    const root=await fixture();
    const first=await setupFoundry({workspace:root});
    await writeFile(join(first.system,'packs/example/stale.ldb'),'old database file');
    const second=await setupFoundry({workspace:root});
    assert.ok(second.backup);
    assert.equal(await readFile(join(second.backup,'packs/example/stale.ldb'),'utf8'),'old database file');
    assert.ok(!(await readdir(join(second.system,'packs/example'))).includes('stale.ldb'));
    assert.equal(await readFile(join(root,'.foundry-test/Config/options.json'),'utf8'),'private options');
    assert.equal(await readFile(join(root,'.foundry-test/Data/worlds/ptu-verification/world.json'),'utf8'),'saved disposable world');
});

test('Foundry lock refuses setup before changing the installed system',async()=>{
    const root=await fixture();
    const release=await lockfile.lock(join(root,'.foundry-test/Config/options.json'),{realpath:false});
    try { await assert.rejects(setupFoundry({workspace:root}),/Stop Foundry/); }
    finally { await release(); }
});

test('unsafe manifest paths are rejected and existing copies are untouched',async()=>{
    const root=await fixture();
    const installed=await setupFoundry({workspace:root});
    await writeFile(join(root,'system.json'),JSON.stringify({id:'ptu',packs:[{name:'../escape',path:'packs/../escape'}]}));
    await assert.rejects(setupFoundry({workspace:root}),/Unsafe pack path/);
    assert.equal(await readFile(join(installed.system,'template.json'),'utf8'),'{}');
});

test('data-directory junction/symlink is refused',async()=>{
    const target=await mkdtemp(resolve('.cache/setup-outside-'));
    const root=await mkdtemp(resolve('.cache/setup-linked-'));
    await symlink(target,join(root,'.foundry-test'),process.platform==='win32'?'junction':'dir');
    await assert.rejects(setupFoundry({workspace:root}),/symbolic link\/junction/);
    assert.deepEqual(await readdir(target),[]);
});
