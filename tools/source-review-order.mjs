// Frozen review chronology for offline evidence snapshots, independent of names
// and of a later disposition's self-declared queue metadata.
export function priorSourceIdentities(manifest, batchId, sliceId) {
    const batchIndex = manifest.batches.findIndex(batch => batch.id === batchId);
    if (batchIndex < 0) throw new Error(`Unknown source review batch: ${batchId}`);
    const batch = manifest.batches[batchIndex], sliceIndex = batch.slices.findIndex(slice => slice.id === sliceId);
    if (sliceIndex < 0) throw new Error(`Unknown source review slice: ${sliceId}`);
    return new Set([
        ...manifest.baseline.members,
        ...manifest.batches.slice(0, batchIndex).flatMap(batch => batch.members),
        ...batch.slices.slice(0, sliceIndex).flatMap(slice => slice.members)
    ].map(([identity]) => identity));
}

// F's source audits bind the then-unstarted G/H metadata. Keep that historical
// perspective separate from validation of the actual current G/H queues.
// Tuple identities, hashes and every A–F payload/acceptance remain unmodified.
export function fullFSourceCheckpointView(bundle) {
    const manifest = bundle.batchManifest;
    const allowed = new Set([
        ...manifest.baseline.members,
        ...manifest.batches.filter(b => !['G', 'H'].includes(b.id)).flatMap(b => b.members)
    ].map(([identity]) => identity));
    const files = Object.fromEntries(Object.entries(bundle.files).filter(([, file]) => file.records.every(row => allowed.has(row.identity))));
    const records = Object.values(files).flatMap(file => file.records), counts = {reviewed: 0, excluded: 0, unresolved: 0, unreviewed: 0}, sourceClassCounts = {};
    for (const row of records) {
        if (Object.hasOwn(counts, row.coverageState)) counts[row.coverageState]++;
        sourceClassCounts[row.recordClass] = (sourceClassCounts[row.recordClass] ?? 0) + 1;
    }
    counts.unreviewed += bundle.source.rows.length - records.length;
    const index = {...bundle.index, recordFiles: bundle.index.recordFiles.filter(path => Object.hasOwn(files, path)),
        coverage: {...bundle.index.coverage, explicitRecordDispositions: records.length, counts, sourceClassCounts, completeAddressableClassification: counts.unreviewed === 0}};
    delete index.organizationalSourceEvidence;
    delete index.journalSourceEvidence;
    return {...bundle, index, files, organizationalSource: null, journalSource: null,
        batchManifest: {...manifest, batches: manifest.batches.map(batch => ['G', 'H'].includes(batch.id)
            ? {id: batch.id, count: batch.count, membershipSha256: batch.membershipSha256, members: batch.members,
                status: 'not-started', closure: null, slices: []} : batch)},
        historicalSourceView: {throughBatch: 'F', currentLaterQueuesValidatedHere: false}};
}

// G's accepted source audit records H as not started. This projection is used
// only by G's unchanged checks; H is always validated on the raw current bundle.
export function fullGSourceCheckpointView(bundle) {
    const manifest=bundle.batchManifest;
    const held=manifest.batches.find(b=>b.id==='H');
    const ids=new Set(held.members.map(([identity])=>identity));
    const files=Object.fromEntries(Object.entries(bundle.files).filter(([,f])=>f.records.every(r=>!ids.has(r.identity))));
    const records=Object.values(files).flatMap(f=>f.records),counts={reviewed:0,excluded:0,unresolved:0,unreviewed:0},sourceClassCounts={};
    for(const r of records){counts[r.coverageState]++;sourceClassCounts[r.recordClass]=(sourceClassCounts[r.recordClass]??0)+1;}
    counts.unreviewed=bundle.source.rows.length-records.length;
    const index={...bundle.index,recordFiles:bundle.index.recordFiles.filter(p=>Object.hasOwn(files,p)),coverage:{...bundle.index.coverage,explicitRecordDispositions:records.length,counts,sourceClassCounts,completeAddressableClassification:false}};
    delete index.journalSourceEvidence;
    return {...bundle,index,files,journalSource:null,batchManifest:{...manifest,batches:manifest.batches.map(b=>b.id==='H'?{id:b.id,count:b.count,membershipSha256:b.membershipSha256,members:b.members,status:'not-started',closure:null,slices:[]}:b)},historicalSourceView:{throughBatch:'G',currentLaterQueuesValidatedHere:false}};
}
