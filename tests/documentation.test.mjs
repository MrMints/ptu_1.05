import test from 'node:test';
import assert from 'node:assert/strict';
import { documentationErrors } from '../tools/documentation.mjs';

const complete = ['Changes', 'Validation', 'Compatibility', 'Limitations', 'References'].map(title => `## ${title}\nConcrete recorded evidence for this section.\n`).join('\n');
test('documentation gate rejects missing changelog or incomplete sections', () => {
    assert.deepEqual(documentationErrors(complete, ['CHANGELOG.md']), []);
    assert.equal(documentationErrors(complete, ['src/example.js']).length, 1);
    assert.equal(documentationErrors('', ['CHANGELOG.md']).length, 5);
    assert.ok(documentationErrors(complete.replace('## Validation', '## Other'), ['CHANGELOG.md']).some(e => e.includes('Validation')));
});
