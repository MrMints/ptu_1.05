import assert from 'node:assert/strict';

/** The later planner decision is separate from immutable slice checkpoint evidence. */
export function assertFullFSourceAccepted(batch) {
    assert.equal(batch.id, 'F');
    assert.equal(batch.status, 'source-comparisons-complete');
    assert.equal(batch.acceptance.status, 'accepted-source-examination');
    assert.equal(batch.acceptance.revision, '725105cf078452cb9a5d3c4dc487395d269f36d4');
    assert.equal(batch.acceptance.ciRun, 40812840976);
    assert.deepEqual(batch.acceptanceHistory.map(entry => entry.status), ['pending-substantive-review']);
    assert.equal(batch.membershipSha256, '791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6');
    assert.equal(batch.members.length, 939);
    assert.equal(batch.slices.length, 14);
    assert(batch.slices.every(slice => slice.status === 'source-comparisons-complete'));
    assert.deepEqual(batch.closure.counts, {reviewed: 564, unresolved: 374, excluded: 1});
    assert.deepEqual(batch.closure.sliceEvidenceSemanticSha256,
        Object.fromEntries(batch.slices.map(slice => [slice.id, slice.closure.evidenceSemanticSha256])));
}
