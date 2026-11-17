// Inert collector. Only explicit calls open databases, and only on disposable working copies.
import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,join,dirname,relative,sep} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {FEATURE_REVIEW_ADMITTED_CONTRACT as C,admittedCanonical as canonical,admittedBaselineErrors,admittedClosureErrors} from './feature-review-admitted-contract.mjs';
import {joinAdmittedConversionCaptures} from './check-feature-review-admitted.mjs';
import {containedPath,sha256,admittedSystemManifest,verifyPrivateDirectory,pinnedFiles,isFeatureReviewOperator,requireSyntheticRoot,SYNTHETIC_CACHE_ROOT,parseFiniteJson,assertFiniteJson} from './feature-review-operator.mjs';

export const STORAGE_BINDINGS=Object.freeze([
    {path:'dist/database/backend/level-database.mjs',sha256:'b41674c35e5eebcb7ca5ad79664d9307ed2b0d16b6337205efcc9fbc8e5fa795'},
    {path:'dist/database/backend/server-document.mjs',sha256:'91da9efe90f7234d178c8aa8a4cfe36fdcc7a2c734456dac669ac1f5c552b7ef'},
    {path:'dist/database/fields-extensions.mjs',sha256:'bd6dca9200cc131d3ce262e8fb7d9346653fedae4844daa47b6c52fec261a588'},
    {path:'common/documents/actor.mjs',sha256:'ab70630e8f88b258e03d65fe1a27dcd8bcfeeba4d09bdb74a28d3630ce75ee3e'},
    {path:'common/documents/item.mjs',sha256:'2e82f38075d02acb3ddcd00fae280a777993ff7ad11e25ac9e49d4369d8a3f79'},
    {path:'common/documents/cards.mjs',sha256:'6fbc42f3b7080b11e6730153f04d5ae87259b832225bb85297417a108ee2a547'},
    {path:'common/documents/combat.mjs',sha256:'9a140521d79ade6d2942cdbbcd5d12e6879be2fe29d0bbb069622255f108e316'},
    {path:'common/documents/journal-entry.mjs',sha256:'fc3249fa45da481680caad2138eac7dcc3486ce2946c317ad83f5f00b76a8672'},
    {path:'common/documents/playlist.mjs',sha256:'34d28a1f308da8d2ee1678cade6fd79e40c803ae1a7501b1ef7cb97c5c3c7e93'},
    {path:'common/documents/roll-table.mjs',sha256:'f4bec4b77f4dd6a0de5255c47680e7626cf057241afe3a1956453d0121f7363a'},
    {path:'common/documents/token.mjs',sha256:'71aeb6f1e403bb2225282d4e6545607ea7768555e98511c43a0cadd165e59e43'},
    {path:'common/documents/actor-delta.mjs',sha256:'0be275c374052d2447f62cd7f4422d17f5e0156589e1293d50e6f238afe96c19'},
    {path:'common/documents/region.mjs',sha256:'1665bee125f80ee387a5ca65376c2c2dca7a4e95bb6087d9d49724a9d10262fb'},
    {path:'common/documents/scene.mjs',sha256:'d6fd4b622519fb04b00290fedcf1db69a492d0eea5543ed257f9d9bad146e4ac'}
]);
for(const binding of STORAGE_BINDINGS)Object.freeze(binding);
const TYPES={actors:'Actor',items:'Item',folders:'Folder',macros:'Macro',messages:'ChatMessage',scenes:'Scene',cards:'Cards',combats:'Combat',journal:'JournalEntry',playlists:'Playlist',tables:'RollTable',settings:'Setting',users:'User',fog:'FogExploration'};
// EmbeddedCollectionField stores ID arrays; EmbeddedDocumentField stores a single ID/null.
const HIERARCHY={Actor:{items:'Item',effects:'ActiveEffect'},Item:{effects:'ActiveEffect'},Cards:{cards:'Card'},Combat:{combatants:'Combatant',groups:'CombatantGroup'},JournalEntry:{pages:'JournalEntryPage',categories:'JournalEntryCategory'},Playlist:{sounds:'PlaylistSound'},RollTable:{results:'TableResult'},Token:{delta:'ActorDelta'},ActorDelta:{items:'Item',effects:'ActiveEffect'},Region:{behaviors:'RegionBehavior'},Scene:{drawings:'Drawing',tokens:'Token',lights:'AmbientLight',notes:'Note',regions:'Region',sounds:'AmbientSound',templates:'MeasuredTemplate',tiles:'Tile',walls:'Wall'}};
const id=v=>typeof v==='string'&&/^[A-Za-z0-9]{16}$/.test(v),equal=(a,b)=>canonical(a)===canonical(b);
const workingRoots=new Set();
const inside=(root,path)=>{const rel=relative(resolve(root),resolve(path));return rel&&rel!=='..'&&!rel.startsWith('..'+sep)&&!rel.startsWith(sep)&&!/^\w:/.test(rel);};
async function copyIntoPrivateDirectory(source,destination,verifyDirectory){
    for(const entry of await readdir(source,{withFileTypes:true})){
        if(entry.isSymbolicLink()||!entry.isFile()&&!entry.isDirectory())throw Error('STOP: unexpected copy object');
        const input=join(source,entry.name),output=join(destination,entry.name),stat=await lstat(input);
        if(stat.isSymbolicLink()||!stat.isFile()&&!stat.isDirectory())throw Error('STOP: linked copy object');
        if(stat.isDirectory()){await mkdir(output);await verifyDirectory(output);await copyIntoPrivateDirectory(input,output,verifyDirectory);}
        else await writeFile(output,await readFile(input),{flag:'wx'}); // Inherit destination privacy; never copy source ACLs.
    }
}

/** Resolve from the pinned CLI context, not from this module or incidental hoisting. */
export async function resolvePinnedReader() {
    const cliEntry=import.meta.resolve('@foundryvtt/foundryvtt-cli'),cliRequire=createRequire(cliEntry),cliPackage=cliRequire('./package.json');
    if(cliPackage.version!=='3.0.5')throw Error('STOP: CLI dependency version mismatch');
    const readerEntry=cliRequire.resolve('classic-level'),readerRequire=createRequire(readerEntry),readerPackage=readerRequire('./package.json');
    if(readerPackage.version!=='3.0.0')throw Error('STOP: locked classic-level version mismatch');
    const nativePath=readerRequire('node-gyp-build').path(dirname(readerEntry));
    const paths=[fileURLToPath(cliEntry),join(dirname(fileURLToPath(cliEntry)),'package.json'),readerEntry,join(dirname(readerEntry),'binding.js'),join(dirname(readerEntry),'package.json'),nativePath];
    const files=[];for(const path of paths)files.push({path,sha256:sha256(await readFile(path))});
    const {ClassicLevel}=cliRequire('classic-level');
    return {binding:{kind:'resolved-classic-level',cliVersion:cliPackage.version,version:readerPackage.version,platform:process.platform,arch:process.arch,node:process.versions.node,abi:process.versions.modules,files},
        async read(path){
            const synthetic=inside(SYNTHETIC_CACHE_ROOT,path)&&relative(resolve(SYNTHETIC_CACHE_ROOT),resolve(path)).split(sep)[0].startsWith('feature-review-operator-');
            if(!synthetic&&![...workingRoots].some(root=>inside(root,path)))throw Error('STOP: reader requires a verified working copy or self-generated compatibility batch');
            await containedPath(path,path,{directory:true});await containedPath(path,join(path,'CURRENT'));
            const db=new ClassicLevel(path,{keyEncoding:'buffer',valueEncoding:'buffer',createIfMissing:false,errorIfExists:false});
            try{await db.open();const rows=[];for await(const [key,value] of db.iterator({keyEncoding:'buffer',valueEncoding:'buffer',fillCache:false}))rows.push({key:Buffer.from(key),value:Buffer.from(value)});return rows;}
            finally{await db.close();}
        }};
}

/** Exact raw accounting. No model construction, defaults, repair or source reconstruction. */
export function decodeStoredRecords(raw,{database,rootCollection,pack=false}={}) {
    if(!Array.isArray(raw)||!TYPES[rootCollection])throw Error('STOP: raw store/classifier required');
    const entries=new Map(),ledger=[],opaqueUsers=[];
    for(const r of raw){
        if(!Buffer.isBuffer(r.key)||!Buffer.isBuffer(r.value))throw Error('STOP: raw bytes required');
        const key=r.key.toString('utf8');if(!Buffer.from(key,'utf8').equals(r.key)||entries.has(key))throw Error('STOP: invalid/duplicate raw key');
        const m=/^!([a-z]+(?:\.[a-z]+)*)!([A-Za-z0-9]{16}(?:\.[A-Za-z0-9]{16})*)$/.exec(key);
        if(!m)throw Error('STOP: unexplained raw key');
        const path=m[1].split('.'),ids=m[2].split('.');
        if(path.length!==ids.length||path[0]!==rootCollection&&!(pack&&path.length===1&&path[0]==='folders'))throw Error('STOP: unexpected store key');
        const types=[TYPES[path[0]]];for(let n=1;n<path.length;n++){const type=HIERARCHY[types.at(-1)]?.[path[n]];if(!type)throw Error('STOP: unregistered embedded hierarchy');types.push(type);}
        const row={key,keySha256:sha256(r.key),valueSha256:sha256(r.value),bytes:r.value.length,path,ids,types};
        if(path[0]==='users'){
            if(path.length!==1)throw Error('STOP: unexpected User child');
            // NEVER decode the value. Identity comes from the raw key plus separately timed UI projection.
            opaqueUsers.push({id:ids[0],recordSha256:row.valueSha256});entries.set(key,{...row,opaque:true});
            ledger.push({...row,opaque:true});continue;
        }
        let data;try{data=parseFiniteJson(r.value);}catch{throw Error('STOP: invalid or unrepresentable stored document encoding');}
        if(!data||typeof data!=='object'||Array.isArray(data)||!id(data._id)||data._id!==ids.at(-1)||!Buffer.from(r.value.toString('utf8'),'utf8').equals(r.value))throw Error('STOP: stored identity/encoding mismatch');
        entries.set(key,{...row,data});ledger.push({...row,valueBase64:r.value.toString('base64')});
    }
    const used=new Set(),documents=[],records=[];
    function assemble(entry) {
        if(used.has(entry.key))throw Error('STOP: duplicate embedded reference');used.add(entry.key);
        const data=structuredClone(entry.data),type=entry.types.at(-1);
        for(const field of Object.keys(HIERARCHY[type]??{})){
            const kind=type==='Token'&&field==='delta'?'one':'many';
            if(!Object.hasOwn(data,field))continue; // Preserve absence exactly; orphans fail below.
            const value=data[field];
            if(kind==='many'&&!Array.isArray(value)||kind==='one'&&value!==null&&!id(value))throw Error('STOP: conflicting embedded representation');
            const references=kind==='many'?value:value===null?[]:[value];
            if(references.some(v=>!id(v))||new Set(references).size!==references.length)throw Error('STOP: invalid/duplicate embedded IDs');
            const children=references.map(child=>{
                const key=`!${[...entry.path,field].join('.')}!${[...entry.ids,child].join('.')}`,record=entries.get(key);
                if(!record||record.opaque)throw Error('STOP: missing embedded record');return assemble(record);
            });
            data[field]=kind==='many'?children:children[0]??null;
        }
        return data;
    }
    for(const entry of entries.values())if(!entry.opaque&&entry.path.length===1){documents.push({collection:entry.path[0],id:entry.ids[0],data:assemble(entry)});}
    for(const entry of entries.values()){
        if(entry.opaque){used.add(entry.key);continue;}
        const type=entry.types.at(-1);
        if(!type)throw Error('STOP: unknown document type');
        let coordinate;
        if(pack){if(entry.path.length>2)throw Error('STOP: unrepresentable compendium child');coordinate=`Compendium.${database}.${entry.path.length===1?type+'.'+entry.ids[0]:TYPES[entry.path[0]]+'.'+entry.ids[0]+'.'+type+'.'+entry.ids[1]}`;}
        else coordinate=entry.types.map((type,n)=>type+'.'+entry.ids[n]).join('.');
        records.push({database,documentType:type,parentId:entry.ids.length>1?entry.ids.at(-2):null,coordinate,data:structuredClone(entry.data)});
    }
    if(used.size!==entries.size)throw Error('STOP: orphan/unaccounted stored record');
    return {records:records.sort((a,b)=>a.coordinate.localeCompare(b.coordinate)),documents:documents.sort((a,b)=>a.collection.localeCompare(b.collection)||a.id.localeCompare(b.id)),opaqueUsers:opaqueUsers.sort((a,b)=>a.id.localeCompare(b.id)),ledger:ledger.sort((a,b)=>a.key.localeCompare(b.key))};
}

export function bindOpaqueUsers(opaque,observation,{mode,capturedMs,maxAgeMs=300000}) {
    assertFiniteJson(observation);
    if(observation?.mode!==mode||observation.source!=='normal-authorized-foundry-ui'||typeof observation.sessionId!=='string'||!observation.sessionId||!Number.isSafeInteger(observation.observedMs)||observation.observedMs>capturedMs||capturedMs-observation.observedMs>maxAgeMs||!Array.isArray(observation.users))throw Error('STOP: fresh separate User projection required');
    const permitted=['id','name','role','ownership','permissions'];
    if(!equal(observation.users.map(u=>u.id).sort(),opaque.map(u=>u.id).sort())||new Set(observation.users.map(u=>u.id)).size!==opaque.length)throw Error('STOP: opaque/User projection ID mismatch');
    return [...opaque].map(r=>{const u=observation.users.find(u=>u.id===r.id);if(!equal(Object.keys(u).sort(),permitted.sort())||typeof u.name!=='string'||!Number.isInteger(u.role)||!(u.ownership===null||u.ownership&&typeof u.ownership==='object')||!u.permissions||typeof u.permissions!=='object')throw Error('STOP: invalid nonsecret User projection');return {...structuredClone(u),recordSha256:r.recordSha256};}).sort((a,b)=>a.id.localeCompare(b.id));
}

export async function readPrivateCapture({captureFile,provenanceFile,privateRoot,mode,stage}) {
    if(mode==='native')await verifyPrivateDirectory(privateRoot,{mode});else if(mode==='synthetic'){requireSyntheticRoot(privateRoot);await containedPath(SYNTHETIC_CACHE_ROOT,privateRoot,{directory:true});}else throw Error('STOP: explicit capture mode required');
    const provenance=parseFiniteJson(await readFile(await containedPath(privateRoot,provenanceFile)));
    if(provenance.kind!=='p05-store-provenance-v1'||provenance.mode!==mode||provenance.stage!==stage||provenance.status!=='captured'||provenance.sourceVersion?.runtime!==C.pin.commit)throw Error('STOP: captured provenance binding required');
    if(!Array.isArray(provenance.outputs)||!equal(provenance.outputs.map(o=>o.path).sort(),['capture.json','raw-ledger.json'])||resolve(provenance.outputRoot)!==resolve(dirname(provenanceFile))||sha256(provenance.sourceManifest)!==provenance.sourceManifestSha256)throw Error('STOP: complete capture provenance required');
    const immutable=await containedPath(privateRoot,join(dirname(provenanceFile),'immutable'),{directory:true});
    if(!equal(await admittedSystemManifest(immutable),provenance.sourceManifest))throw Error('STOP: immutable capture bytes changed');
    const bytes=await readFile(await containedPath(privateRoot,captureFile)),binding=provenance.outputs.find(o=>o.path==='capture.json');
    if(binding?.sha256!==sha256(bytes)||resolve(dirname(provenanceFile),'capture.json')!==resolve(captureFile))throw Error('STOP: prior capture bytes/provenance mismatch');
    for(const output of provenance.outputs){if(!['capture.json','raw-ledger.json'].includes(output.path))throw Error('STOP: unexpected captured output');const file=await containedPath(privateRoot,join(dirname(provenanceFile),output.path));if(sha256(await readFile(file))!==output.sha256)throw Error('STOP: captured output changed');}
    return parseFiniteJson(bytes);
}

/** Stages are separately observed. operator is a live bridge, never a request JSON assertion. */
export async function captureStoppedStoreEvidence({mode='native',stage,sourceRoot,outputRoot,sourceBindings,operator,reader,syntheticRoot,storageRoot,usersObservation,opaqueFiles=[],context={},now=Date.now}={}) {
    if(!['native','synthetic'].includes(mode)||!isFeatureReviewOperator(operator)||operator?.mode!==mode||typeof operator.prepareCollection!=='function'||mode==='native'&&(reader||now!==Date.now))throw Error('STOP: explicit trusted collector/operator mode required');
    if(mode==='synthetic')requireSyntheticRoot(syntheticRoot);
    const startedMs=now(),guard=await operator.prepareCollection({sourceRoot,outputRoot,bindings:sourceBindings,stage});
    if(guard.mode!==mode||guard.stage!==stage||guard.sourceRoot!==resolve(sourceRoot)||guard.outputRoot!==resolve(outputRoot)||typeof guard.verifyStopped!=='function')throw Error('STOP: collection guard mismatch');
    const immutable=join(outputRoot,'immutable'),working=join(outputRoot,'working');
    if(mode==='native'){
        const expected=stage.startsWith('conversion-')?[]:['options.json','license.json'].map(p=>resolve(C.target.worldPath.split('/Data/')[0],'Config',p)).sort();
        if(!Array.isArray(opaqueFiles)||!equal(opaqueFiles.map(p=>resolve(p)).sort(),expected))throw Error('STOP: exact stage-bound opaque file list required');
    }
    const sourceResolved=resolve(sourceRoot),outResolved=resolve(outputRoot);
    if(sourceResolved===outResolved||!relative(sourceResolved,outResolved).startsWith('..'+sep)||!relative(outResolved,sourceResolved).startsWith('..'+sep))throw Error('STOP: capture/source trees must be disjoint');
    if((await readdir(outputRoot)).length)throw Error('STOP: empty fresh stage batch required');
    // Fail on an already-used batch. All writes are exclusive and privately contained.
    for(const p of [immutable,working,join(outputRoot,'provenance.json'),join(outputRoot,'failure.json')]){try{await lstat(p);throw Error('STOP: batch already used');}catch(e){if(e.code!=='ENOENT')throw e;}}
    const proof={kind:'p05-store-provenance-v1',mode,stage,sourceRoot:resolve(sourceRoot),outputRoot:resolve(outputRoot),startedMs,sourceBindings:guard.pins,hostBefore:guard.before,privacy:guard.privacy,status:'incomplete',sourceVersion:{expectedCore:C.pin.core,expectedSystem:C.pin.system,runtime:C.pin.commit},outputs:[]};
    let sourceManifest;
    try{
        const collectorPath=fileURLToPath(import.meta.url);proof.collector={path:collectorPath,sha256:sha256(await readFile(collectorPath))};
        const actualReader=reader??await resolvePinnedReader();if(mode==='synthetic'&&reader?.binding?.kind!=='synthetic-reader')throw Error('STOP: synthetic adapter must be explicitly marked');proof.reader=actualReader.binding;
        if(mode==='native'){
            if(!storageRoot)throw Error('STOP: pinned static Foundry layout source required');
            proof.storageBindings=await pinnedFiles(storageRoot,STORAGE_BINDINGS);
        }else proof.storageBindings={kind:'synthetic-layout-test',expected:STORAGE_BINDINGS};
        sourceManifest=await admittedSystemManifest(sourceRoot);proof.sourceManifest=sourceManifest;proof.sourceManifestSha256=sha256(sourceManifest);proof.step='copy';
        proof.step='create-immutable';await mkdir(immutable);await verifyPrivateDirectory(immutable,{mode,syntheticRoot});
        proof.step='copy-immutable';
        const verifyDirectory=path=>verifyPrivateDirectory(path,{mode,syntheticRoot});
        await copyIntoPrivateDirectory(sourceRoot,immutable,verifyDirectory);
        proof.step='verify-immutable';
        if(!equal(await admittedSystemManifest(immutable),sourceManifest)||!equal(await admittedSystemManifest(sourceRoot),sourceManifest))throw Error('STOP: byte copy/source changed');
        proof.step='create-working';await mkdir(working);await verifyPrivateDirectory(working,{mode,syntheticRoot});proof.step='copy-working';await copyIntoPrivateDirectory(immutable,working,verifyDirectory);
        proof.step='verify-working';
        if(!equal(await admittedSystemManifest(working),sourceManifest))throw Error('STOP: working byte copy mismatch');
        await pinnedFiles(sourceRoot,sourceBindings);
        workingRoots.add(resolve(working));
        proof.copyVerifiedMs=now();await guard.verifyStopped();
        const allRecords=[],rawLedger=[],worldDocuments=[],opaqueUsers=[];
        const conversion=stage.startsWith('conversion-'),stores=conversion?C.conversion.databases.map(p=>({name:p.database,path:p.path,collection:({Item:'items',Actor:'actors',RollTable:'tables',Macro:'macros',JournalEntry:'journal'})[p.type],profile:p})): [...C.collections,'settings','users','fog'].map(name=>({name,path:'data/'+name,collection:name}));
        if(!conversion){const dataDir=await containedPath(working,join(working,'data'),{directory:true});for(const entry of await readdir(dataDir,{withFileTypes:true})){if(entry.isSymbolicLink()||!entry.isDirectory()||!stores.some(s=>s.collection===entry.name))throw Error('STOP: unexpected world store/object');}}
        for(const store of stores){
            proof.step='read-store';proof.database=store.name;
            const dbPath=await containedPath(working,join(working,store.path),{directory:true});await containedPath(dbPath,join(dbPath,'CURRENT'));
            const raw=await actualReader.read(dbPath),decoded=decodeStoredRecords(raw,{database:store.name,rootCollection:store.collection,pack:conversion});
            if(store.collection==='fog'&&raw.length)throw Error('STOP: unrepresentable nonempty fog store');
            if(conversion){const p=store.profile,rows=decoded.records,counts={total:rows.length,primary:rows.filter(r=>r.documentType===p.type).length,embedded:rows.filter(r=>['TableResult','JournalEntryPage'].includes(r.documentType)).length,folders:rows.filter(r=>r.documentType==='Folder').length};for(const key of Object.keys(counts))if(counts[key]!==p[key])throw Error('STOP: incomplete conversion denominator');}
            allRecords.push(...decoded.records);worldDocuments.push(...decoded.documents);opaqueUsers.push(...decoded.opaqueUsers);rawLedger.push({database:store.name,path:store.path,records:decoded.ledger});
        }
        const opaque=[];for(const file of opaqueFiles){
            const root=mode==='synthetic'?syntheticRoot:join(C.target.worldPath.split('/Data/')[0],'Config');
            const path=await containedPath(root,file);const before=await readFile(path);opaque.push({path,sha256:sha256(before),bytes:before.length});
            // Preserve as opaque bytes in a distinct private file, never parse/display contents.
            const copy=join(outputRoot,'opaque-'+opaque.length+'.bin');await writeFile(copy,before,{flag:'wx'});if(sha256(await readFile(copy))!==sha256(before)||sha256(await readFile(path))!==sha256(before))throw Error('STOP: opaque bytes changed');
        }
        proof.step='assemble-and-validate';
        let value;
        if(conversion){
            if(typeof context.batch!=='string'||!(mode==='synthetic'?/^synthetic-[A-Za-z0-9-]+$/:/^p05-feature-review-[0-9TZ]+-[a-f0-9]{8}$/).test(context.batch))throw Error('STOP: explicit mode-bound batch required');
            value={kind:stage,origin:'captured-store-payloads',source:mode,batch:context.batch,records:allRecords};
            if(stage==='conversion-after'){const before=await readPrivateCapture({...context.beforeCapture,mode,stage:'conversion-before'});const audit=joinAdmittedConversionCaptures(before,value,{mode,batch:context.batch});if(audit.errors.length)throw Error('STOP: accepted full conversion audit failed');}
        }
        else {
            const worldPath=await containedPath(immutable,join(immutable,'world.json')),world=parseFiniteJson(await readFile(worldPath));
            if(world.id!==C.target.world||world.title!==C.target.title||world.system!=='ptu')throw Error('STOP: world manifest identity mismatch');
            const users=bindOpaqueUsers(opaqueUsers,usersObservation,{mode,capturedMs:now()});
            const documents=worldDocuments.filter(d=>C.collections.includes(d.collection)),settings=worldDocuments.filter(d=>d.collection==='settings').map(d=>d.data);
            const configurationSha256=sha256(opaque),ids=Object.fromEntries(C.collections.map(k=>[k,documents.filter(d=>d.collection===k).map(d=>d.id).sort()]));
            if(stage==='baseline'){
                await verifyPrivateDirectory(context.privateRoot,{mode,syntheticRoot});
                await containedPath(context.privateRoot,context.priorSystemRoot,{directory:true});
                const priorSystem=await admittedSystemManifest(context.priorSystemRoot),backupManifestSha256=sha256(await readFile(await containedPath(context.privateRoot,context.backupManifestFile)));
                const storedPackConfiguration=settings.find(s=>s.key==='core.compendiumConfiguration')?.value;
                const packConfiguration=typeof storedPackConfiguration==='string'?parseFiniteJson(storedPackConfiguration):structuredClone(storedPackConfiguration);
                value={ids,packConfiguration,world,settings,protectedDocuments:documents,users,priorSystem,backupManifestSha256,configurationSha256};
                if(admittedBaselineErrors(value).length)throw Error('STOP: accepted baseline validation failed');
            } else {
                const baseline=await readPrivateCapture({...context.baselineCapture,mode,stage:'baseline'});
                if(mode==='native'&&resolve(context.restoredSystemRoot)!==resolve(C.target.systemPath))throw Error('STOP: exact restored disposable system required');
                await containedPath(mode==='synthetic'?syntheticRoot:C.target.systemPath.split('/Data/')[0],context.restoredSystemRoot,{directory:true});
                const system=await admittedSystemManifest(context.restoredSystemRoot);
                value={...context.closure,world,settings,protectedDocuments:documents,users,system,configurationSha256};
                if(admittedClosureErrors(baseline,value,context.resources).length)throw Error('STOP: accepted closure validation failed');
            }
            proof.userProjection={source:usersObservation.source,observedMs:usersObservation.observedMs,sessionId:usersObservation.sessionId,projectionSha256:sha256(usersObservation.users),rawRecordBindings:opaqueUsers};
        }
        // Reads may write ONLY to working. Recheck BOTH untouched trees and stopped state.
        if(!equal(await admittedSystemManifest(sourceRoot),sourceManifest)||!equal(await admittedSystemManifest(immutable),sourceManifest))throw Error('STOP: source/immutable bytes changed during collection');
        await pinnedFiles(sourceRoot,sourceBindings);
        if(sha256(await readFile(collectorPath))!==proof.collector.sha256)throw Error('STOP: collector changed during capture');
        if(!reader)for(const binding of proof.reader.files)if(sha256(await readFile(binding.path))!==binding.sha256)throw Error('STOP: reader changed during capture');
        if(mode==='native')await pinnedFiles(storageRoot,STORAGE_BINDINGS);
        for(const binding of opaque)if(sha256(await readFile(binding.path))!==binding.sha256)throw Error('STOP: opaque source bytes changed');
        proof.hostAfter=await guard.verifyStopped();proof.finishedMs=now();proof.opaqueBindings=opaque;proof.workingAfterSha256=sha256(await admittedSystemManifest(working));proof.step='finalize';
        for(const [name,data]of [['capture.json',value],['raw-ledger.json',rawLedger]]){assertFiniteJson(data);const bytes=JSON.stringify(data);await writeFile(join(outputRoot,name),bytes,{flag:'wx'});proof.outputs.push({path:name,sha256:sha256(bytes)});}
        proof.status='captured';await writeFile(join(outputRoot,'provenance.json'),JSON.stringify(proof),{flag:'wx'});
        return {mode,stage,status:'captured',outputRoot:resolve(outputRoot),provenanceSha256:sha256(JSON.stringify(proof)),outputHashes:proof.outputs};
    } catch {
        // Error messages from readers/JSON decoders can contain record values. Never echo them.
        proof.status='failed';proof.finishedMs=now();
        if(sourceManifest)try{proof.sourceUnchanged=equal(await admittedSystemManifest(sourceRoot),sourceManifest);proof.immutableUnchanged=equal(await admittedSystemManifest(immutable),sourceManifest);}catch{proof.byteVerification='unknown';}
        await writeFile(join(outputRoot,'failure.json'),JSON.stringify(proof),{flag:'wx'});
        throw Error('STOP: collection failed; private failure/copies retained; no repair or retry');
    } finally {workingRoots.delete(resolve(working));}
}

/** CLI is explicit and held for native execution: a file cannot supply a trusted executor. */
export async function collectorMain(args) {
    if(args.length===1&&args[0]==='--reader-info'){const reader=await resolvePinnedReader();return {kind:'reader-compatibility-only',binding:reader.binding,nativeCollection:false};}
    throw Error('Use --reader-info for inert dependency inspection. Collection requires captureStoppedStoreEvidence with a live trusted operator; request JSON cannot clear execution gates.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)collectorMain(process.argv.slice(2)).then(v=>console.log(JSON.stringify(v))).catch(()=>{console.error('STOP: invalid CLI request or unavailable pinned reader; no collection performed');process.exitCode=1;});
