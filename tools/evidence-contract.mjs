import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

// The supported denominator is policy, not whatever a submitted report contains.
export const REQUIRED_ROUTES = ['sheet-new', 'sheet-drop', 'browser', 'native-compendium',
    'canvas-linked', 'canvas-unlinked', 'mixed-folder', 'direct-embedded', 'inline-actor',
    'json-restore', 'owned-world-copy', 'item-duplicate', 'actor-duplicate', 'npc-explicit',
    'starter', 'nested-grant-choice'];
export const EVIDENCE_PATHS = {
    contract: 'docs/data/p01-evidence-contract.json',
    binding: 'docs/validation/2026-10-26-p02a-runtime-binding.json',
    correction: 'docs/validation/2026-10-26-p02a-correction.json',
    historical: 'docs/validation/2026-10-26-p02a.json',
    inventory: 'docs/data/p02a-routes.json',
    fixtures: 'docs/validation/2026-10-26-p02a-copy-fixtures.json',
};
const present = value => typeof value === 'string' ? value.trim().length > 0
    : value !== null && typeof value === 'object' && Object.keys(value).length > 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha256 = value => createHash('sha256').update(value).digest('hex');
// Git may check text out as CRLF. Only transport line endings are normalized;
// escaped JSON values, whitespace within lines and all other bytes remain significant.
export const evidenceTextHash = bytes => sha256(bytes.toString('utf8').replaceAll('\r\n', '\n'));
export const routePolicyHash = inventory => sha256(JSON.stringify({
    baselineCommit: inventory.baselineCommit, testedRuntime: inventory.testedRuntime,
    routes: inventory.routes.map(({id, entry, path, acquisitionPrerequisites, security}) =>
        ({id, entry, path, acquisitionPrerequisites, security})),
    predicateInventory: inventory.predicateInventory, boundary: inventory.boundary,
}));
const sha = value => /^[a-f0-9]{40}$/.test(value ?? '');
const digest = value => /^[a-f0-9]{64}$/.test(value ?? '');
export const caseId = (source, run, scenario, index) => `${source}/${run}#${index}:${scenario}`;

export function decodeFiles(bundle) {
    const cache = new Map(), active = new Set();
    const decode = value => {
        if (Array.isArray(value)) return value.map(decode);
        if (!value || typeof value !== 'object') return value;
        if (Object.keys(value).length === 1 && '$ref' in value) {
            const key = value.$ref;
            if (cache.has(key)) return cache.get(key);
            if (active.has(key) || !Object.hasOwn(bundle.objects ?? {}, key)) throw Error(`Invalid evidence reference: ${key}`);
            active.add(key);
            const result = decode(bundle.objects[key]);
            active.delete(key); cache.set(key, result); return result;
        }
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, decode(child)]));
    };
    return Object.fromEntries(Object.entries(bundle.files).map(([name, file]) => [name, decode(file.data)]));
}

export async function loadEvidenceContract() {
    const values = await Promise.all(Object.entries(EVIDENCE_PATHS).map(async ([key, path]) => {
        const bytes = await readFile(path);
        return [key, {data: JSON.parse(bytes), sha256: evidenceTextHash(bytes)}];
    }));
    const loaded = Object.fromEntries(values);
    return {...Object.fromEntries(values.map(([key, value]) => [key, value.data])),
        hashes: {correction: loaded.correction.sha256, historical: loaded.historical.sha256, fixtures: loaded.fixtures.sha256},
        files: decodeFiles(loaded.correction.data)};
}

// Checks consistency, references and coverage; never decides whether a human review is accurate.
export function evidenceContractErrors({contract: c, binding: b, correction, historical, inventory, files, hashes, fixtures}) {
    const errors = [], check = (ok, message) => {if (!ok) errors.push(message);};
    const reviewOK = review => review?.status === 'accepted' && sha(review.evidenceHead)
        && present(review.threadId) && present(review.turnId) && present(review.decision);
    check(c.schemaVersion === 1 && b.schemaVersion === 1, 'Unsupported evidence schema.');
    check(c.hashEncoding === 'UTF-8 with CRLF normalized to LF' && b.hashEncoding === c.hashEncoding,
        'Evidence hash encoding must be explicit.');
    check(c.routePolicySha256 === routePolicyHash(inventory), 'Route semantics changed outside the accepted evidence/status annotation.');
    check(sha(c.testedRuntime) && c.testedRuntime === correction.runtime, 'Contract runtime contradicts correction.');
    check(reviewOK(c.review), 'Accepted acquisition review needs its explicit decision and revision.');
    check(c.review?.evidenceHead === b.review?.evidenceHead && reviewOK(b.review), 'Binding review is unresolved.');
    check(c.claims?.acquisitionFoundation === 'accepted-with-limitations'
        && c.claims?.p01 === 'pending-substantive-review'
        && c.claims?.full04 === false && c.claims?.open05 === false
        && c.claims?.productionVariants === false && c.claims?.releaseReady === false
        && c.claims?.automatedAccuracyReview === false, 'Unsupported completion claim.');
    check(Array.isArray(c.limitations) && c.limitations.length > 0 && c.limitations.every(present), 'Explicit limitations required.');
    for (const source of ['correction', 'historical']) {
        check(c.inputs?.[source]?.path === EVIDENCE_PATHS[source] && c.inputs[source].textSha256 === hashes[source]
            && digest(c.inputs[source].rawCaptureSha256), `Changed ${source} evidence requires review.`);
    }
    check(b.evidenceTextSha256 === hashes.correction && digest(b.evidenceRawCaptureSha256), 'Binding does not identify the original evidence text/captured bytes.');
    const artifact = files['archive-install.json'], runtimeFiles = files['source-copy-runtime-files.json'];
    check(b.verifiedRuntime === c.testedRuntime && artifact?.commit === c.testedRuntime, 'Binding/artifact runtime contradiction.');
    check(b.artifact?.sha256 === artifact?.archiveSha256 && digest(b.artifact?.sha256)
        && b.artifact?.bytes === artifact?.archiveBytes && b.artifact?.entries === artifact?.entries
        && artifact?.result === 'pass', 'Binding archive identity mismatch.');
    check(b.installation?.record === 'archive-install.json' && b.installation?.runtimeFilesRecord === 'source-copy-runtime-files.json'
        && b.installation?.matchedFiles === runtimeFiles?.fileCount && runtimeFiles?.fileCount === 3503
        && present(b.installation?.history) && present(b.installation?.freshClients)
        && present(b.installation?.reviewReference), 'Reviewed installation/fresh-client history missing.');
    const sourceHash = runtimeFiles?.files.find(row => row.path === 'src/module/item/base.js')?.sha256;
    check(digest(b.servedItemBaseSha256) && b.servedItemBaseSha256 === sourceHash, 'Final served source hash contradicts artifact file record.');
    check(b.fixtures?.path === EVIDENCE_PATHS.fixtures && b.fixtures?.textSha256 === hashes.fixtures
        && digest(b.fixtures?.rawCaptureSha256)
        && fixtures?.group === 'final-bce58' && present(b.fixtures?.context), 'Actual copy fixture context missing or changed.');
    const fixtureResult = fixtures?.scenarios?.[0]?.observed;
    const fixtureActors = (fixtureResult?.rows ?? []).map(row => row.actor);
    const fixtureItems = [...(fixtureResult?.rows ?? []).flatMap(row => row.items.map(item => item.uuid)),
        ...(fixtureResult?.world ?? []).map(item => item.uuid),
        ...(files['final416-checkpoint-stable.json']?.expected?.worldItems ?? []).map(item => `Item.${item.id}`)];
    const stale = Object.entries(files).filter(([name, run]) => name.startsWith('final416-') && run.scenarios?.length && run.runtime !== c.testedRuntime);
    const bindings = new Map((b.observations ?? []).map(row => [row.file, row]));
    check(stale.length === 26 && bindings.size === 26 && b.observations?.length === 26, 'All 26 runtime contradictions require individual bindings.');
    for (const [name, run] of stale) {
        const row = bindings.get(name), observed = run.scenarios[0]?.observed;
        check(row && row.originalRuntime === run.runtime && row.originalGroup === run.group
            && row.executionId === run.executionId && row.rawSha256 === correction.files[name].rawSha256
            && same(row.scenarioIds, run.scenarios.map(s => s.id))
            && row.source === observed?.source && row.destination === observed?.destination
            && row.verifiedRuntime === b.verifiedRuntime && row.servedItemBaseSha256 === run.servedItemBaseSha256
            && row.servedItemBaseSha256 === sourceHash && present(row.fixtureContext), `Unresolved runtime/fixture contradiction: ${name}`);
        check(fixtureItems.includes(observed?.source)
            && (fixtureActors.includes(observed?.destination) || observed?.destination === 'World Items'), `Copy uses unestablished fixture context: ${name}`);
    }
    for (const name of bindings.keys()) check(stale.some(([n]) => n === name), `Unexpected runtime binding: ${name}`);

    const cases = new Map();
    for (const row of c.cases ?? []) {
        check(!cases.has(row.id), `Duplicate evidence case: ${row.id}`); cases.set(row.id, row);
        const run = row.source === 'correction' ? files[row.run] : row.source === 'historical' ? historical.runs[row.run] : null;
        const scenario = run?.scenarios?.[row.scenarioIndex];
        check(row.id === caseId(row.source, row.run, row.scenario, row.scenarioIndex)
            && scenario?.id === row.scenario && Number.isInteger(row.scenarioIndex), `Missing exact observation reference: ${row.id}`);
        check(present(row.expected), `Missing expected outcome: ${row.id}`);
        check(present(row.observed), `Missing observed outcome: ${row.id}`);
        check(scenario && (present(scenario.observed) || (scenario.result !== 'pass' && present(scenario.error))), `Missing raw observed outcome: ${row.id}`);
        check(row.result === scenario?.result && ['pass', 'fail', 'not-run'].includes(row.result), `Result contradicts raw observation: ${row.id}`);
        check(row.executionId === run?.executionId && present(row.executionId), `Execution identity mismatch: ${row.id}`);
        const rawRuntime = run?.runtime ?? run?.testedRuntime;
        const effective = row.source === 'correction' && bindings.has(row.run) ? bindings.get(row.run).verifiedRuntime : rawRuntime;
        check(sha(row.testedRuntime) && row.testedRuntime === effective, `Unresolved runtime contradiction: ${row.id}`);
        check(row.source === 'historical' ? row.evidenceKind === 'reused-historical' && present(row.reuseLimit)
            : row.evidenceKind === 'current-observation', `Current/reused evidence conflated: ${row.id}`);
    }
    // Current observations cannot disappear by removing their declaration from the contract.
    for (const [run, data] of Object.entries(files).filter(([name]) => name.startsWith('final416-'))) {
        for (const [index, s] of (data.scenarios ?? []).entries()) check(cases.has(caseId('correction', run, s.id, index)), `Omitted required correction case: ${run}#${index}:${s.id}`);
    }
    for (const row of cases.values()) {
        if (row.result === 'pass') continue;
        const d = row.disposition;
        check(d?.status === 'accepted' && d.reviewTurn === c.review?.turnId && present(d.reason)
            && Array.isArray(d.supersededBy) && d.supersededBy.length > 0, `Failed/not-run case lacks accepted disposition: ${row.id}`);
        for (const id of d?.supersededBy ?? []) {
            const successor = cases.get(id);
            check(successor?.result === 'pass' && id !== row.id && successor?.addresses?.includes(row.id), `Invalid superseding observation: ${row.id} -> ${id}`);
        }
    }
    const routes = new Map((c.routes ?? []).map(row => [row.id, row]));
    check(routes.size === c.routes?.length, 'Duplicate supported route.');
    for (const id of REQUIRED_ROUTES) {
        const row = routes.get(id);
        check(!!row && inventory.routes.some(r => r.id === id), `Omitted supported route: ${id}`);
        for (const actor of ['npc-explicit', 'starter'].includes(id) ? ['character'] : ['character', 'pokemon']) {
            const ids = row?.coverage?.[actor];
            check(Array.isArray(ids) && ids.length > 0, `Omitted supported route/actor: ${id}/${actor}`);
            for (const reference of ids ?? []) {
                const target = cases.get(reference);
                check(target?.result === 'pass' && target.routes?.includes(id) && target.actors?.includes(actor), `Unsupported route coverage: ${id}/${actor}/${reference}`);
            }
        }
        check(present(row?.limitations), `Missing route limitations: ${id}`);
    }
    for (const row of inventory.routes) check(routes.has(row.id) && REQUIRED_ROUTES.includes(row.id), `Route inventory not reconciled: ${row.id}`);
    return errors;
}

export async function checkEvidenceContract() {
    return evidenceContractErrors(await loadEvidenceContract());
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const errors = await checkEvidenceContract();
    if (errors.length) throw Error(errors.join('\n'));
    console.log('P01 evidence structure, route coverage and runtime bindings pass; substantive accuracy requires human review.');
}
