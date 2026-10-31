import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateEmbedded } from '../tools/embedded-records.mjs';

test('collapse identical embedded IDs while preserving ranges, order and ordinary arrays', () => {
    const row = { _id: 'stable', range: [1, 4], text: 'Example' };
    const repairs = [];
    assert.deepEqual(deduplicateEmbedded({ results: [row, structuredClone(row)], values: [1, 1] }, repairs), { results: [row], values: [1, 1] });
    assert.equal(repairs.length, 1);
});
test('conflicting embedded IDs are rejected without mutating input', () => {
    const input = [{ _id: 'same', weight: 1 }, { _id: 'same', weight: 2 }];
    const original = structuredClone(input);
    assert.throws(() => deduplicateEmbedded(input), /Conflicting embedded ID/);
    assert.deepEqual(input, original);
});
