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
