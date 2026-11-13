import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

// Frozen review coordinates, not runtime version/canonical identities.
const cases = [
    ['r04-r0232', 'moves.Y5R5mbVcGq6fwoFj', 'move', 'move', 'core:394:move-line48', 'sep:4:move-line27', null],
    ['r04-r0046', 'abilities.oNB76oqVYrjhYd7W', 'ability', 'ability', 'core:320:ability-line34', 'feb:5:ability-line83', 'abilities-core'],
    ['r04-r0192', 'feats.aJ47Z5z6Az9c8Dy8', 'feat', 'feature', 'core:140:feature-line35', 'may:7:feature-line27', 'features-core'],
    ['r04-r0248', 'poke-edges.WkzCUjTOCTI60Uwg', 'pokeedge', 'feature', 'core:205:feature-line39', 'sep-basic-ranged-level-directive', 'pokemon-edges']
];
const control = 'abilities.nuGa21WQ0QD07kQj';
const evidencePaths = ['system.json', 'docs/data/source-authority.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const sha = text => createHash('sha256').update(text).digest('hex');
const hash = value => sha(JSON.stringify(value) ?? 'undefined');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const text = value => typeof value === 'string' && value.trim().length > 20;
const recordPath = identity => { const [pack, id] = identity.split('.'); return `packs/${pack}/_source/${id}.json`; };
const at = (value, pointer) => pointer.split('/').slice(1).reduce((v, k) => v?.[k], value);
const approvals = {production: false, behavioralVerification: 'not-run', implemented: false, automation: false};

// These are complete mechanical field slices, not a paraphrase-based comparator.
function sourceSlices(unit, collection) {
    if (collection === 'parentFrames') return ['/sourcePageSegments', '/interpretation'];
    if (collection !== 'sourceDefinitions') return ['/rawText'];
    if (unit.definition) return unit.definition.sections.map((_, i) => `/definition/sections/${i}`);
    if (unit.fields) return Object.keys(unit.fields).map(k => `/fields/${k}`);
    return ['/frequency', ...unit.ruleStructure.clauses.map((_, i) => `/ruleStructure/clauses/${i}`)];
}

/**
 * Pure integrity check of the four-case non-runtime proposal. Inputs are raw UTF-8
 * JSON strings: revisions, a path-keyed sourceEvidence map, and an identity-keyed
 * currentRecords map (four records plus the separate Pure Power control).
 * No I/O occurs here. Interpretation and approval require substantive review.
 */
export function validateRuleVersionPilot(proposal, {revisions, sourceEvidence, currentRecords} = {}) {
    const issues = [];
    const check = (ok, message) => { if (!ok) issues.push(message); };
    const parse = (raw, label) => {
        try {
            if (typeof raw !== 'string') throw new Error();
            const value = JSON.parse(raw);
            if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
            return value;
        }
        catch { issues.push(`input-json: ${label}`); return null; }
    };
    if (!proposal || typeof proposal !== 'object') return ['proposal-shape'];
    const p = proposal;
    try {
    check(p.schemaVersion === 1 && p.status === 'proposal-not-production-approved', 'proposal-status');
    check(same(p.approvals, approvals), 'unapproved-states');
    check(p.scope === 'Generations 1–8 only' && p.runtimeCanonicalId === null, 'scope-or-runtime-identity');
    check(same(p.hashMethods, {
        rawFile: 'SHA256 of exact UTF-8 file bytes; evidence JSON pins LF and CRLF checkout representations separately',
        json: 'SHA256 of JSON.stringify(JSON.parse(raw UTF-8)); stored property order, no sorting or rule normalization',
        source: 'Existing named definition/normalization hashes are copied as evidence, never substituted for raw-file or JSON hashes'
    }), 'hash-methods');
    const rev = parse(revisions, 'revisions');
    const inputFiles = {};
    check(same(Object.keys(sourceEvidence ?? {}).sort(), [...evidencePaths].sort()), 'evidence-input-membership');
    check(same(Object.keys(currentRecords ?? {}).sort(), [...cases.map(x => x[1]), control].sort()), 'record-input-membership');
    const bindings = p.evidenceFiles;
    check(Array.isArray(bindings) && same(bindings.map(x => x?.path).sort(), [...evidencePaths].sort()), 'evidence-file-membership');
    for (const path of evidencePaths) {
        const raw = sourceEvidence?.[path];
        inputFiles[path] = parse(raw, path);
        const b = bindings?.find?.(x => x?.path === path);
        if (typeof raw === 'string') {
            const lf = raw.replaceAll('\r\n', '\n');
            check(same(b?.rawFileSha256, {lf: sha(lf), crlf: sha(lf.replaceAll('\n', '\r\n'))}), `evidence-file-hash: ${path}`);
            check(b?.jsonSha256 === hash(inputFiles[path]), `evidence-json-hash: ${path}`);
        }
    }
    check(p.revisionsJsonSha256 === hash(rev), 'revisions-hash');
    if (typeof revisions === 'string') {
        const lf = revisions.replaceAll('\r\n', '\n');
        check(same(p.revisionsRawFileSha256, {lf: sha(lf), crlf: sha(lf.replaceAll('\n', '\r\n'))}), 'revisions-raw-hash');
    }
    if (!rev || Object.values(inputFiles).some(x => !x)) return issues;
    const manifest = inputFiles['system.json'];
    const authority = inputFiles['docs/data/source-authority.json'];
    const seen = new Set();
    check(Array.isArray(p.cases) && same(p.cases.map(x => x?.caseId).sort(), cases.map(x => x[0]).sort()), 'case-membership');

    function inspectRecord(binding, identity, type) {
        const raw = currentRecords?.[identity];
        const data = parse(raw, identity);
        const [pack, id] = identity.split('.');
        const uuid = `Compendium.ptu.${pack}.Item.${id}`;
        check(binding?.identity === identity && binding?.path === recordPath(identity), `record-identity: ${identity}`);
        check(binding?.documentUuid === uuid && !seen.has(uuid), `candidate-identity-duplicate: ${identity}`);
        seen.add(uuid);
        check(manifest.id === 'ptu' && manifest.packs?.some(x => x.name === pack && x.path === `packs/${pack}` && x.type === 'Item' && x.system === 'ptu'), `pack-identity: ${identity}`);
        if (!data) return null;
        check(data._id === id && data.type === type && data._key === `!items!${id}`, `record-type-or-key: ${identity}`);
        check(binding?.rawFileSha256 === sha(raw) && binding?.jsonSha256 === hash(data), `record-hash: ${identity}`);
        check(same(binding?.provenance, {source: data.system?.source, modern: data._stats?.compendiumSource ?? null, legacy: data.flags?.core?.sourceId ?? null}), `record-provenance: ${identity}`);
        check(same(binding?.systemFieldHashes, Object.fromEntries(Object.entries(data.system).map(([k,v]) => [k, hash(v)]))), `current-field-hashes: ${identity}`);
        return data;
    }
    function inspectRef(ref, file, collection, id) {
        const unit = inputFiles[file]?.[collection]?.find(x => x.id === id);
        check(ref?.file === file && ref?.collection === collection && ref?.id === id && !!unit, `evidence-reference: ${id}`);
        if (!unit) return null;
        check(ref?.jsonSha256 === hash(unit), `evidence-unit-hash: ${id}`);
        const named = Object.fromEntries(['rawDefinitionSha256', 'definitionNormalizedSha256', 'evidenceSemanticSha256', 'rawSha256', 'normalizedSha256'].filter(k => unit[k]).map(k => [k, unit[k]]));
        check(same(ref?.existingHashes, named), `named-evidence-hashes: ${id}`);
        const fields = ref?.fields;
        check(Array.isArray(fields) && same(fields.map(x => x?.pointer).sort(), sourceSlices(unit, collection).sort()), `complete-source-fields: ${id}`);
        for (const f of fields ?? []) {
            check(f?.jsonSha256 === hash(at(unit, f?.pointer ?? '')), `source-field-hash: ${id} ${f?.pointer}`);
            check(['correspondence', 'conflict', 'partial', 'unresolved', 'context-only'].includes(f?.disposition) && text(f?.reason), `source-field-disposition: ${id} ${f?.pointer}`);
        }
        return unit;
    }
    for (const [caseId, identity, type, family, baselineId, revisedId, reviewName] of cases) {
        const row = p.cases?.find?.(x => x?.caseId === caseId);
        if (!row) continue;
        const catalog = rev.entries?.find(x => x.id === caseId);
        check(!!catalog && row.catalogEntryJsonSha256 === hash(catalog) && catalog.stableIdentities?.length === 0, `catalog-binding: ${caseId}`);
        check(row.type === type && row.runtimeCanonicalId === null && same(row.approvals, approvals), `case-type-or-approval: ${caseId}`);
        check(row.sourceRelationship?.catalogGroupingCoordinate === catalog?.canonicalId && text(row.sourceRelationship?.basis), `source-relationship: ${caseId}`);
        const data = inspectRecord(row.current, identity, type);
        const evidenceFile = `docs/data/${family}-source-evidence.json`;
        const audit = inputFiles[evidenceFile].currentRecordAudit.find(x => x.identity === identity);
        check(same(row.current?.audit, audit ? {file: evidenceFile, identity, contentHash: audit.contentHash, jsonSha256: hash(audit)} : null), `audit-binding: ${caseId}`);
        if (audit && data) check(audit.contentHash === hash(data), `audit-current-content: ${caseId}`);
        if (reviewName) {
            const file = `docs/data/record-source-review/${reviewName}.json`;
            const review = inputFiles[file].records.find(x => x.identity === identity);
            check(!!review && same(row.current?.review, {file, identity, jsonSha256: hash(review), lineageJsonSha256: hash(review?.exportLineage)}), `review-lineage-binding: ${caseId}`);
        } else {
            check(row.current?.review === null && row.current?.audit === null && text(row.current?.missingAudit), `missing-exact-audit: ${caseId}`);
            check(!inputFiles['docs/data/record-source-review/moves-anchored.json'].records.some(x => x.identity === identity), `unexpected-exact-audit: ${caseId}`);
        }
        const contexts = type === 'pokeedge' ? [['generalContexts', 'poke-edge-framework']]
            : type === 'feat' ? [['parentFrames', 'core-parent-researcher']] : [];
        check(Array.isArray(row.contextEvidence) && same(row.contextEvidence.map(x => x?.id), contexts.map(x => x[1])), `context-membership: ${caseId}`);
        contexts.forEach(([collection, id], i) => inspectRef(row.contextEvidence?.[i], evidenceFile, collection, id));
        check(Array.isArray(row.roles) && same(row.roles.map(x => x?.role).sort(), ['baseline', 'revised']), `role-membership: ${caseId}`);
        for (const [index, roleName, unitId] of [[0, 'baseline', baselineId], [1, 'revised', revisedId]]) {
            const role = row.roles?.find?.(x => x?.role === roleName);
            if (!role) continue;
            const source = (index === 0 ? catalog?.baseline?.sources : catalog?.sources)?.[0];
            const auth = authority.sources.find(x => x.preferredPath === source?.path);
            const dates = {feb: '2016-02', may: '2015-05', sep: '2015-09'};
            check(!!auth && same(role.source, {authorityId: auth.id, path: source?.path, sha256: source?.sha256, edition: auth.edition,
                status: auth.role, publicationDate: index ? dates[catalog?.version] : null, datePrecision: index ? 'month' : 'unknown',
                pdfPages: source?.pdfPages, printedPages: source?.printedPages}), `source-role: ${caseId} ${roleName}`);
            check(auth?.sha256 === source?.sha256, `authority-fingerprint: ${caseId} ${roleName}`);
            check(role.runtimeVersionId === null && role.wholeRecordMapping === false && same(role.approvals, approvals), `role-promotion: ${caseId} ${roleName}`);
            const expectedCandidate = index && reviewName ? row.current?.documentUuid : null;
            check(role.candidateDocumentUuid === expectedCandidate, `role-candidate: ${caseId} ${roleName}`);
            check(text(role.mappingLimit) && text(role.authoringObligation), `role-obligations: ${caseId} ${roleName}`);
            check(text(role.sourceMeaning), `source-meaning: ${caseId} ${roleName}`);
            const expectedRefs = caseId === 'r04-r0248' && index
                ? [[evidenceFile, 'sourceDefinitions', baselineId], [evidenceFile, 'generalContexts', revisedId]]
                : [[evidenceFile, 'sourceDefinitions', unitId]];
            check(Array.isArray(role.evidence) && same(role.evidence.map(x => x?.id), expectedRefs.map(x => x[2])), `role-evidence-membership: ${caseId} ${roleName}`);
            expectedRefs.forEach(([file, collection, id], i) => {
                const unit = inspectRef(role.evidence?.[i], file, collection, id);
                const expectedSource = collection === 'sourceDefinitions' && caseId === 'r04-r0248' && index ? catalog.baseline.sources[0] : source;
                check(unit?.source?.path === expectedSource?.path && unit?.source?.sha256 === expectedSource?.sha256 && same(unit?.source?.pdfPages, expectedSource?.pdfPages), `definition-source: ${caseId} ${id}`);
            });
            // Finite contradiction guards; these do not certify arbitrary prose.
            const dispositions = role.evidence?.[0]?.fields ?? [];
            const required = caseId === 'r04-r0232' ? ['/fields/effect', 'conflict']
                : caseId === 'r04-r0046' ? ['/ruleStructure/clauses/0', index ? 'partial' : 'conflict']
                : ['/definition/sections/0', index ? 'correspondence' : 'conflict'];
            check(dispositions.some(x => x.pointer === required[0] && x.disposition === required[1]), `known-case-disposition: ${caseId} ${roleName}`);
        }
        const requiredObligations = ['identity-and-authoring', 'adoption', 'effect-use', 'preservation-and-stacking'];
        if (type === 'feat' || type === 'pokeedge') requiredObligations.push('advisory-prerequisites');
        if (type === 'move') requiredObligations.push('quick-curl-independent', 'swift-versus-rapid', 'missing-exact-id-lineage');
        if (type === 'ability') requiredObligations.push('cannot-disable-versus-innate', 'pure-power-separate');
        if (type === 'pokeedge') requiredObligations.push('six-capability-choice', 'one-tp-and-training', 'six-meter-struggle', 'different-capability-repeat', 'level20-removal-only');
        check(Array.isArray(row.obligations) && same(row.obligations.map(x => x?.code).sort(), requiredObligations.sort()) && row.obligations.every(x => text(x.detail)), `case-obligations: ${caseId}`);
    }
    inspectRecord(p.negativeControl?.current, control, 'ability');
    check(p.negativeControl?.purpose === 'separate-identity-only' && p.negativeControl?.runtimeCanonicalId === null && p.negativeControl?.proposalCase === false, 'negative-control-separation');
    const controlFile = 'docs/data/ability-source-evidence.json';
    const controlAudit = inputFiles[controlFile].currentRecordAudit.find(x => x.identity === control);
    check(!!controlAudit && same(p.negativeControl?.audit, {file: controlFile, identity: control, contentHash: controlAudit.contentHash, jsonSha256: hash(controlAudit)}), 'negative-control-audit');
    check(same(p.negativeControl?.sourceEvidence?.map(x => x.id), ['core:327:ability-line18', 'feb:5:ability-line83']), 'negative-control-source-membership');
    ['core:327:ability-line18', 'feb:5:ability-line83'].forEach((id, i) => inspectRef(p.negativeControl?.sourceEvidence?.[i], controlFile, 'sourceDefinitions', id));
    } catch {
        // Malformed serialized containers are unresolved; callers still receive
        // an issue array rather than a coercion/iteration exception.
        issues.push('input-or-proposal-shape');
    }
    return issues;
}

// Optional bounded local CLI: only the fixed JSON inputs, never PDFs or runtime.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const {readFile} = await import('node:fs/promises');
    const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    const proposal = JSON.parse(await read('docs/data/rule-version-pilot.json'));
    const sourceEvidence = Object.fromEntries(await Promise.all(evidencePaths.map(async path => [path, await read(path)])));
    const currentRecords = Object.fromEntries(await Promise.all([...cases.map(x => x[1]), control].map(async id => [id, await read(recordPath(id))])));
    const issues = validateRuleVersionPilot(proposal, {revisions: await read('docs/data/rules-revisions.json'), sourceEvidence, currentRecords});
    if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
    else console.log('Four non-runtime proposals pass integrity checks; interpretation and production approval remain unestablished.');
}
