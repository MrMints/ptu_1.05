import {createHash} from 'node:crypto';
import {isDeepStrictEqual as equal} from 'node:util';
import {pathToFileURL} from 'node:url';
import {validateRuleVersionPilot} from './rule-version-pilot.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value) ?? 'undefined').digest('hex');
const sha = value => createHash('sha256').update(value).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const explanation = value => typeof value === 'string' && value.trim().length > 20;
const fileHashes = raw => { const lf = raw.replaceAll('\r\n', '\n'); return {lf: sha(lf), crlf: sha(lf.replaceAll('\n', '\r\n'))}; };
const evidencePaths = ['system.json', 'docs/data/source-authority.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const recordIds = ['moves.Y5R5mbVcGq6fwoFj', 'abilities.oNB76oqVYrjhYd7W', 'feats.aJ47Z5z6Az9c8Dy8', 'poke-edges.WkzCUjTOCTI60Uwg', 'abilities.nuGa21WQ0QD07kQj'];
const unitIds = ['core:140:feature-line35', 'may:7:feature-line27'];
const approvals = {production: false, behavioralVerification: 'not-run', implemented: false, automation: false};
const representation = {
    whitespace: 'Join extracted whitespace within a printed field using one space; retain the typed field boundaries.',
    fracturedPronoun: 'Replace only the extracted Y ou token with You; preserve all other rule words, accents, numbers and punctuation.',
    prerequisites: 'Split the evidenced comma-separated May conjunction into two array entries; core remains one entry. No added parent requirement.',
    effect: 'Render the complete printed Trigger and Effect as separately labelled lines; frequency/action stays in its own field.'
};
const normalize = value => value.replaceAll('Y ou', 'You').replace(/\s+/g, ' ').trim();
const pointer = (value, path) => path.split('/').slice(1).reduce((v, k) => v?.[k], value);

/** Parsed draft/pilot, raw UTF-8 ledger maps, and an explicit feat filename-ID
 * inventory. Pure validation only: no IDs are generated, no payload is emitted. */
export function validateEchoesVersionDraft(draft, inputs = {}) {
    const issues = [];
    const check = (ok, message) => { if (!ok) issues.push(message); };
    if (!object(draft)) return ['draft-shape'];
    if (!object(inputs)) return ['input-shape'];
    const {pilot, revisions, sourceEvidence, currentRecords, existingFeatIds} = inputs;
    try {
        check(draft.schemaVersion === 1 && draft.status === 'draft-not-production-approved', 'draft-status');
        check(equal(Object.keys(draft).sort(), ['schemaVersion', 'status', 'scope', 'productionMapping', 'generationEligibility', 'approvals',
            'representation', 'schemaEvidence', 'upstream', 'collisionInventory', 'parentContext', 'unresolvedAuthoring', 'sourcePairRationale',
            'identityDecision', 'validationLimit', 'roles', 'proposedIdentityJsonSha256'].sort()) && draft.scope === 'Generations 1–8 only', 'draft-envelope');
        check(draft.productionMapping === null && draft.generationEligibility === 'unclassified' && equal(draft.approvals, approvals), 'unapproved-envelope');
        check(equal(draft.representation, representation), 'representation-decision');
        check(object(pilot) && object(sourceEvidence) && object(currentRecords), 'input-shape');
        if (issues.includes('input-shape')) return issues;
        check(equal(Object.keys(sourceEvidence).sort(), [...evidencePaths, 'template.json'].sort()), 'source-input-membership');
        const upstream = validateRuleVersionPilot(pilot, {revisions, sourceEvidence: Object.fromEntries(evidencePaths.map(path => [path, sourceEvidence[path]])), currentRecords});
        issues.push(...upstream.map(x => `upstream-pilot: ${x}`));
        if (upstream.length) return issues;
        const schemaRaw = sourceEvidence['template.json'];
        if (typeof schemaRaw !== 'string') return [...issues, 'schema-input'];
        const schema = JSON.parse(schemaRaw);
        const base = schema.Item.templates.base;
        const {templates, ...feat} = schema.Item.feat;
        check(equal(templates, ['base']) && schema.Item.types.includes('feat'), 'schema-template-lineage');
        const defaults = {...base, ...feat};
        check(equal(draft.schemaEvidence, {path: 'template.json', rawFileSha256: fileHashes(schemaRaw), jsonSha256: hash(schema),
            basePointer: '/Item/templates/base', typePointer: '/Item/feat', requiredSystemFields: Object.keys(defaults).sort()}), 'schema-binding');
        const sourceFile = 'docs/data/feature-source-evidence.json';
        const evidence = JSON.parse(sourceEvidence[sourceFile]);
        const definitions = unitIds.map(id => evidence.sourceDefinitions.find(x => x.id === id));
        const parent = evidence.parentFrames.find(x => x.id === 'core-parent-researcher');
        const current = JSON.parse(currentRecords[recordIds[2]]);
        const accepted = pilot.cases.find(x => x.caseId === 'r04-r0192');
        check(equal(draft.upstream, {pilotJsonSha256: hash(pilot), caseJsonSha256: hash(accepted), revisionsJsonSha256: hash(JSON.parse(revisions)),
            currentRecord: recordIds[2], currentJsonSha256: hash(current), auditJsonSha256: accepted.current.audit.jsonSha256,
            exportLineageJsonSha256: accepted.current.review.lineageJsonSha256}), 'upstream-binding');
        check(Array.isArray(existingFeatIds) && existingFeatIds.every(x => typeof x === 'string' && /^[A-Za-z0-9]{16}$/.test(x)) && new Set(existingFeatIds).size === existingFeatIds.length, 'collision-inventory-shape');
        if (!Array.isArray(existingFeatIds)) return issues;
        const inventory = [...existingFeatIds].sort();
        check(inventory.includes('aJ47Z5z6Az9c8Dy8'), 'collision-inventory-current-missing');
        check(equal(draft.collisionInventory, {directory: 'packs/feats/_source', method: 'SHA256(JSON.stringify(sorted unique current .json filename IDs))', count: inventory.length, jsonSha256: hash(inventory)}), 'collision-inventory-binding');
        const context = {file: sourceFile, collection: 'parentFrames', id: parent.id, jsonSha256: hash(parent), source: parent.source,
            summary: parent.interpretation.split(' Preserve')[0], disposition: 'context-only', leafPrerequisitesAdded: false, executableGrants: false};
        check(equal(draft.parentContext, context), 'parent-context');
        const unresolvedCodes = ['class-and-branch-metadata', 'parent-selection-and-grants', 'historical-provenance-and-adoption'];
        check(Array.isArray(draft.unresolvedAuthoring) && equal(draft.unresolvedAuthoring.map(x => x.code).sort(), unresolvedCodes.sort()) && draft.unresolvedAuthoring.every(x => explanation(x.detail)), 'unresolved-authoring');
        check(explanation(draft.sourcePairRationale) && explanation(draft.identityDecision) && explanation(draft.validationLimit), 'review-explanations');
        const rows = draft.roles;
        check(Array.isArray(rows) && equal(rows.map(x => x?.role).sort(), ['baseline', 'revised']), 'role-membership');
        if (!Array.isArray(rows)) return issues;
        const allIds = [];
        const identities = [];
        for (let index = 0; index < 2; index++) {
            const role = index ? 'revised' : 'baseline';
            const row = rows.find(x => x?.role === role);
            if (!row) continue;
            check(equal(Object.keys(row).sort(), ['role', 'source', 'definitionEvidence', 'productionMapping', 'generationEligibility',
                'approvals', 'proposedIdentity', 'item', 'fieldDecisions'].sort()), `role-envelope: ${role}`);
            const unit = definitions[index];
            check(equal(unit.definition.sections.map(x => x.kind), ['prerequisites', 'frequency', 'trigger', 'effect']), `complete-source-sections: ${role}`);
            check(equal(row.source, accepted.roles.find(x => x.role === role).source), `source-role: ${role}`);
            check(equal(row.definitionEvidence, {file: sourceFile, id: unit.id, jsonSha256: hash(unit), rawDefinitionSha256: unit.rawDefinitionSha256,
                definitionNormalizedSha256: unit.definitionNormalizedSha256}), `definition-binding: ${role}`);
            check(row.productionMapping === null && row.generationEligibility === 'unclassified' && equal(row.approvals, approvals), `role-approval: ${role}`);
            const identity = row.proposedIdentity;
            check(object(identity) && equal(Object.keys(identity).sort(), ['canonicalId', 'itemId', 'versionId']), `proposed-identity-shape: ${role}`);
            if (object(identity)) {
                for (const id of Object.values(identity)) check(typeof id === 'string' && /^[A-Za-z0-9]{16}$/.test(id)
                    && !inventory.includes(id) && !['aJ47Z5z6Az9c8Dy8', 'ta6bKIiHCuccjTqU'].includes(id), `proposed-id-or-collision: ${role}`);
                allIds.push(identity.itemId, identity.versionId);
                identities.push(identity);
            }
            const sections = unit.definition.sections;
            const normalized = sections.map(x => normalize(x.text));
            const expected = {name: normalize(unit.heading), type: 'feat', system: {...structuredClone(defaults),
                prerequisites: normalized[0].split(/,\s*/), frequency: normalized[1],
                effect: `Trigger: ${normalized[2]}\nEffect: ${normalized[3]}`,
                source: {value: `${row.source.edition} — p.${row.source.pdfPages[0]}`}}};
            check(object(row.item) && equal(Object.keys(row.item).sort(), ['name', 'system', 'type']), `item-envelope: ${role}`);
            check(equal(row.item, expected), `complete-source-or-neutral-fields: ${role}`);
            // Every typed draft field has an independently hashed source/default
            // decision. The source values come from the accepted actual units.
            const targets = ['name', 'type', ...Object.keys(defaults).map(k => `system.${k}`)].sort();
            check(Array.isArray(row.fieldDecisions) && equal(row.fieldDecisions.map(x => x.target).sort(), targets), `field-decision-membership: ${role}`);
            for (const decision of row.fieldDecisions ?? []) {
                const key = decision.target;
                const field = key.startsWith('system.') ? key.slice(7) : null;
                const sourceIndices = field === 'prerequisites' ? [0] : field === 'frequency' ? [1] : field === 'effect' ? [2, 3] : [];
                const expectedPointers = key === 'name' ? ['/heading'] : sourceIndices.map(i => `/definition/sections/${i}`);
                const basis = key === 'name' ? 'source-heading' : key === 'type' ? 'schema-type'
                    : field === 'source' ? 'source-attribution' : sourceIndices.length ? 'source-leaf' : 'neutral-schema-default';
                const schemaPointer = key === 'type' ? '/Item/types' : !field || sourceIndices.length || field === 'source' ? null
                    : Object.hasOwn(feat, field) ? `/Item/feat/${field}` : `/Item/templates/base/${field}`;
                check(decision.basis === basis && decision.schemaPointer === schemaPointer && equal(decision.sourcePointers, expectedPointers)
                    && equal(decision.sourceValueJsonSha256, expectedPointers.map(p => hash(pointer(unit, p))))
                    && decision.draftValueJsonSha256 === hash(key.split('.').reduce((v,k) => v?.[k], row.item)) && explanation(decision.reason), `field-decision: ${role} ${key}`);
            }
        }
        check(identities.length === 2 && identities[0].canonicalId === identities[1].canonicalId
            && new Set([...allIds, identities[0].canonicalId]).size === 5, 'distinct-proposed-pair-identities');
        check(draft.proposedIdentityJsonSha256 === hash(rows.map(x => x.proposedIdentity)), 'proposed-identity-fingerprint');
    } catch {
        issues.push('serialized-input-shape');
    }
    return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const {readFile, readdir} = await import('node:fs/promises');
    const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    const sourceEvidence = Object.fromEntries(await Promise.all([...evidencePaths, 'template.json'].map(async p => [p, await read(p)])));
    const currentRecords = Object.fromEntries(await Promise.all(recordIds.map(async id => { const [pack, key] = id.split('.'); return [id, await read(`packs/${pack}/_source/${key}.json`)]; })));
    const existingFeatIds = (await readdir(new URL('../packs/feats/_source/', import.meta.url))).filter(x => x.endsWith('.json')).map(x => x.slice(0, -5));
    const issues = validateEchoesVersionDraft(JSON.parse(await read('docs/data/rule-version-echoes-draft.json')), {
        pilot: JSON.parse(await read('docs/data/rule-version-pilot.json')), revisions: await read('docs/data/rules-revisions.json'), sourceEvidence, currentRecords, existingFeatIds});
    if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
    else console.log('Two non-runtime Echoes drafts pass source/schema/identity integrity; production adoption and behavior remain unapproved.');
}
