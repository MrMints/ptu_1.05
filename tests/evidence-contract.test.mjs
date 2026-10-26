import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadEvidenceContract, evidenceContractErrors, decodeFiles, evidenceTextHash, EVIDENCE_PATHS} from '../tools/evidence-contract.mjs';

const baseline = await loadEvidenceContract();
const fixture = () => ({...baseline, contract: structuredClone(baseline.contract),
    binding: structuredClone(baseline.binding)});
const rejects = (mutate, pattern) => {
    const input = fixture(); mutate(input);
    assert.ok(evidenceContractErrors(input).some(message => pattern.test(message)), pattern.toString());
};

test('complete bounded evidence and linked superseding observations pass without claiming automated accuracy', () => {
    assert.deepEqual(evidenceContractErrors(baseline), []);
    assert.equal(baseline.binding.observations.length, 26);
    assert.equal(baseline.contract.cases.filter(c => c.result === 'fail').length, 5);
    assert.equal(baseline.contract.claims.automatedAccuracyReview, false);
});
test('omitted route and omitted actor coverage cannot shrink the supported denominator', () => {
    rejects(x => x.contract.routes.splice(0, 1), /Omitted supported route/);
    rejects(x => delete x.contract.routes[0].coverage.pokemon, /Omitted supported route\/actor/);
});
test('evidence/status annotation cannot silently change route text or predicate classification', () => {
    rejects(x => {
        x.inventory = structuredClone(x.inventory);
        x.inventory.routes[1].path = x.inventory.routes[1].path.replace('→', 'â†’');
    }, /Route semantics changed/);
    rejects(x => {
        x.inventory = structuredClone(x.inventory);
        x.inventory.predicateInventory.classification = x.inventory.predicateInventory.classification.replace('Poké', 'PokÃ©');
    }, /Route semantics changed/);
});
test('routes must reference a passing case for that actor and route', () => {
    rejects(x => x.contract.routes[0].coverage.character = ['invented-observation'], /Unsupported route coverage/);
});
test('missing expected, observed and raw observed outcomes are rejected separately', () => {
    rejects(x => delete x.contract.cases[0].expected, /Missing expected outcome/);
    rejects(x => delete x.contract.cases[0].observed, /Missing observed outcome/);
    rejects(x => {
        const row = x.contract.cases[0];
        x.files = {...x.files, [row.run]: structuredClone(x.files[row.run])};
        delete x.files[row.run].scenarios[row.scenarioIndex].observed;
    }, /Missing raw observed outcome/);
});
test('current correction cases cannot be dropped from an otherwise passing manifest', () => {
    rejects(x => x.contract.cases.splice(0, 1), /Omitted required correction case/);
});
test('a passing label cannot overwrite a retained raw failure', () => {
    rejects(x => x.contract.cases.find(c => c.result === 'fail').result = 'pass', /Result contradicts raw observation/);
});
test('failed required cases need accepted dispositions and linked passing successors', () => {
    rejects(x => delete x.contract.cases.find(c => c.result === 'fail').disposition, /lacks accepted disposition/);
    rejects(x => x.contract.cases.find(c => c.result === 'fail').disposition.status = 'pending', /lacks accepted disposition/);
    rejects(x => x.contract.cases.find(c => c.result === 'fail').disposition.supersededBy = ['missing'], /Invalid superseding observation/);
    rejects(x => {
        const failed = x.contract.cases.find(c => c.result === 'fail');
        failed.disposition.supersededBy = [failed.id];
    }, /Invalid superseding observation/);
});
test('not-run required cases cannot be counted as complete', () => {
    rejects(x => {
        const row = x.contract.cases[0]; row.result = 'not-run';
        x.files = {...x.files, [row.run]: structuredClone(x.files[row.run])};
        x.files[row.run].scenarios[row.scenarioIndex].result = 'not-run';
    }, /lacks accepted disposition/);
});
test('dispositions need reciprocal explicit supersession links', () => {
    rejects(x => delete x.contract.cases.find(c => c.addresses?.length).addresses, /Invalid superseding observation/);
});
test('stale labels require all 26 reviewed exact execution/fixture bindings', () => {
    rejects(x => x.binding.observations.pop(), /26 runtime contradictions/);
    rejects(x => x.binding.observations[0].originalGroup = 'final-416c', /runtime\/fixture contradiction/);
    rejects(x => x.binding.observations[0].source = 'Actor.invented.Item.invented', /runtime\/fixture contradiction/);
    rejects(x => x.binding.observations[0].executionId = 'other-execution', /runtime\/fixture contradiction/);
});
test('archive, served source hash and reviewed fresh-client history are required', () => {
    rejects(x => x.binding.artifact.sha256 = '0'.repeat(64), /archive identity mismatch/);
    rejects(x => x.binding.servedItemBaseSha256 = '0'.repeat(64), /served source hash/);
    rejects(x => delete x.binding.installation.freshClients, /installation\/fresh-client history/);
    rejects(x => x.binding.review.status = 'pending', /Binding review is unresolved/);
});
test('runtime contradiction and historical results relabeled as current are rejected', () => {
    rejects(x => x.contract.cases[0].testedRuntime = '0'.repeat(40), /Unresolved runtime contradiction/);
    rejects(x => x.contract.cases.find(c => c.source === 'historical').evidenceKind = 'current-observation', /Current\/reused evidence conflated/);
    rejects(x => delete x.contract.cases.find(c => c.source === 'historical').reuseLimit, /Current\/reused evidence conflated/);
});
test('changed raw bundle or fixture capture requires renewed review', () => {
    rejects(x => x.contract.inputs.correction.textSha256 = '0'.repeat(64), /Changed correction evidence/);
    rejects(x => x.binding.fixtures.textSha256 = '0'.repeat(64), /fixture context missing or changed/);
});
test('unsupported completion claims and absent limitations are rejected', () => {
    for (const claim of ['productionVariants', 'releaseReady', 'open05', 'full04', 'automatedAccuracyReview'])
        rejects(x => x.contract.claims[claim] = true, /Unsupported completion claim/);
    rejects(x => x.contract.claims.p01 = 'accepted', /Unsupported completion claim/);
    rejects(x => x.contract.limitations = [], /Explicit limitations required/);
});
test('repeated raw scenario labels remain distinct by exact array index', () => {
    const rows = baseline.contract.cases.filter(c => c.run === 'final416-post-reload-repeat.json');
    assert.equal(rows.length, 8);
    assert.equal(new Set(rows.map(c => c.id)).size, 8);
    rejects(x => x.contract.cases[0].scenarioIndex = 999, /Missing exact observation reference/);
});
test('pooled evidence refuses missing and circular references', () => {
    assert.throws(() => decodeFiles({files: {a: {data: {$ref:'missing'}}}, objects:{}}), /Invalid evidence reference/);
    assert.throws(() => decodeFiles({files: {a: {data: {$ref:'loop'}}}, objects:{loop:{$ref:'loop'}}}), /Invalid evidence reference/);
});
test('actual fixture evidence passes LF/CRLF transport changes but not changed values', async () => {
    const original = (await readFile(EVIDENCE_PATHS.fixtures, 'utf8')).replaceAll('\r\n', '\n');
    const windows = original.replaceAll('\n', '\r\n');
    assert.deepEqual(JSON.parse(original), JSON.parse(windows));
    assert.equal(evidenceTextHash(original), baseline.binding.fixtures.textSha256);
    assert.equal(evidenceTextHash(windows), baseline.binding.fixtures.textSha256);
    const input = fixture();
    input.hashes = {...input.hashes, fixtures: evidenceTextHash(windows)};
    assert.deepEqual(evidenceContractErrors(input), []);
    const changed = original.replace('final-bce58', 'other-fixture');
    assert.notEqual(changed, original);
    input.hashes.fixtures = evidenceTextHash(changed);
    assert.ok(evidenceContractErrors(input).some(e => /fixture context missing or changed/.test(e)));
    // Escaped line endings are actual JSON string content, not checkout transport.
    assert.notEqual(evidenceTextHash('{"value":"a\\r\\nb"}'), evidenceTextHash('{"value":"a\\nb"}'));
});
