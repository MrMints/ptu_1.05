import {createHash} from 'node:crypto';
import {isDeepStrictEqual as equal} from 'node:util';
import {pathToFileURL} from 'node:url';
import {validateEchoesVersionDraft} from './rule-version-echoes-draft.mjs';
import {ruleVersionMetadataErrors} from '../src/util/rule-versions.js';

const BASE = '39244cf2b0d3ae9cbc11ec5e924abdd57e559f71';
const DRAFT = 'fd95fa42db9996f073d9dc3eb0274a3310011ab154b85128ca0880a6ff91cc03';
const UPSTREAM = '7017ba65eacd78dfbdfdd5b15ce5f397e8635ebbf2fb8b06c51cabbc8d2861c6';
const INVENTORY = '47a105b0225ca2c0ac31c5425e81f7da05658cb23e4b4d3963c5eebd979ea269';
const CONTEXT = 'Researcher — General Research Field (core pp.139–140). Choose two Fields; the parent grants one qualifying Feature, restricts later selections to those Fields, and may repeat with two different Fields. Parent selection and owned grouping remain unverified/manual. This context adds no leaf prerequisite or automatic grant.';
const IDENTITIES = [
    {role:'baseline', itemId:'ViZpn17qLA4ACQGa', canonicalId:'UKk9BnAZtm1xMoRB', versionId:'celnYjQjM3jjtAnZ', label:'PTU 1.05 supplied core'},
    {role:'revised', itemId:'e9dQ3NmVm7EuQBO5', canonicalId:'UKk9BnAZtm1xMoRB', versionId:'i1OAz3lvuCRIm3n9', label:'May 2015 playtest (optional)'}
];
const REQUIREMENTS = [
    'production-registry-and-legacy-UUID-adapter', 'core-default-and-individually-optional-browsing-selection',
    'alternate-benefit-repeat-and-transfer-policy', 'acquisition-route-security-and-saved-state-preservation',
    'authoritative-pack-and-eligibility-ledger-integration', 'application-time-repository-and-live-campaign-collision-checks',
    'repeat-idempotency-cancellation-failure-recovery-reload-and-safe-rollback', 'artifact-bound-disposable-Foundry-world-verification'
];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keys = (value, expected) => object(value) && equal(Object.keys(value).sort(), [...expected].sort());
const evidencePaths = ['system.json', 'docs/data/source-authority.json', 'template.json',
    ...['ability', 'move', 'feature'].map(x => `docs/data/${x}-source-evidence.json`),
    ...['abilities-core', 'moves-anchored', 'features-core', 'pokemon-edges'].map(x => `docs/data/record-source-review/${x}.json`)];
const recordIds = ['moves.Y5R5mbVcGq6fwoFj', 'abilities.oNB76oqVYrjhYd7W', 'feats.aJ47Z5z6Az9c8Dy8', 'poke-edges.WkzCUjTOCTI60Uwg', 'abilities.nuGa21WQ0QD07kQj'];

/** Four explicit JSON strings; never accepts live objects, getters or Document APIs.
 * Pure, all-or-nothing preparation. Declared consent is not authenticated by code. */
export function compileEchoesAdmission(admissionJson, draftJson, upstreamJson, inventoryJson) {
    const issues = [], parsed = [];
    const check = (ok, code) => {if (!ok) issues.push(code);};
    for (const [index, raw] of [admissionJson, draftJson, upstreamJson, inventoryJson].entries()) {
        try {if (typeof raw !== 'string') throw Error(); const data = JSON.parse(raw); if (!object(data)) throw Error(); parsed[index] = data;}
        catch {issues.push(`input-json:${['admission', 'draft', 'upstream', 'repositoryInventory'][index]}`);}
    }
    const blocked = () => ({schemaVersion:1, status:'blocked', issues:[...new Set(issues)], bundle:null});
    if (issues.length) return blocked();
    const [a, draft, upstream, inventory] = parsed;
    try {
        check(keys(a, ['schemaVersion', 'status', 'scope', 'baseline', 'contentDecision', 'implementation', 'b1Acceptance', 'bindings',
            'sourceDefinitions', 'representation', 'parentContext', 'presentation', 'icon', 'identities', 'historicalInventory', 'repositoryInventory', 'hashMethods']), 'admission-envelope');
        check(a.schemaVersion === 1 && a.status === 'content-approved-preparation-only' && a.scope === 'Generations 1–8 only' && a.baseline === BASE, 'admission-status-or-baseline');
        check(keys(a.bindings, ['draftJsonSha256', 'upstreamJsonSha256', 'representationJsonSha256', 'parentContextJsonSha256']), 'binding-envelope');
        check(keys(a.hashMethods, ['json', 'upstream', 'item']) && a.hashMethods.json === 'SHA256(JSON.stringify(parsed JSON)); stored property order, no rule normalization'
            && a.hashMethods.upstream === 'JSON hash of parsed pilot, revisions, sourceEvidence and currentRecords in the declared fixed path/key order; raw source fingerprints remain in accepted evidence'
            && a.hashMethods.item === 'JSON hash of complete generated pack-source Item; matches existing pack-source contentHash method', 'hash-methods');
        const decision = a.contentDecision;
        check(hash(decision) === 'd50a412645601669f05725ccdc75d0067651e02e59ee55bc79ecfb5f8f3d1dfa', 'content-decision-record');
        check(keys(decision, ['content', 'identities', 'coreDefault', 'mayIndividuallyOptional', 'preserveExistingSelections', 'consent', 'policyReference', 'validationLimit'])
            && decision.content === 'approved' && decision.identities === 'approved' && decision.coreDefault === true
            && decision.mayIndividuallyOptional === true && decision.preserveExistingSelections === true, 'content-decision');
        check(keys(decision?.consent, ['response', 'reference', 'proposalReferences', 'scope']) && decision.consent.response === 'yes'
            && decision.consent.reference === 'Sentinel_6cef80e7ba9c81918906001a083e3b7c'
            && equal(decision.consent.proposalReferences, ['Sentinel_9298a3ddfd1c819182d2a054fc4b34c5', 'Sentinel_4f71e321aa508191923bdc099c902bc9'])
            && typeof decision.consent.scope === 'string' && decision.consent.scope.length > 80
            && decision.policyReference === 'Sentinel_a1d21adfdce48191a1837fe17adc95ab'
            && typeof decision.validationLimit === 'string' && decision.validationLimit.includes('cannot authenticate'), 'external-consent-declaration');
        check(equal(a.implementation, {compiler:'pending-independent-acceptance', installation:'not-installed', behavioralVerification:'not-run', automation:false}), 'implementation-separation');
        check(keys(a.b1Acceptance, ['head', 'ciRun', 'evidence']) && a.b1Acceptance.head === BASE && a.b1Acceptance.ciRun === 41159839996
            && hash(a.b1Acceptance) === '445979813f485ae50f29ae288b10b14eea2183f0f4c8c281e7c653e7c8fdb31d', 'b1-binding');
        check(hash(draft) === DRAFT && a.bindings?.draftJsonSha256 === DRAFT, 'accepted-draft-fingerprint');
        check(keys(upstream, ['pilot', 'revisions', 'sourceEvidence', 'currentRecords', 'contextNote', 'iconSha256']), 'upstream-envelope');
        const normalized = {pilot:upstream.pilot, revisions:JSON.parse(upstream.revisions),
            sourceEvidence:Object.fromEntries(evidencePaths.map(path => [path, JSON.parse(upstream.sourceEvidence[path])])),
            currentRecords:Object.fromEntries(recordIds.map(id => [id, JSON.parse(upstream.currentRecords[id])]))};
        check(hash(normalized) === UPSTREAM && a.bindings?.upstreamJsonSha256 === UPSTREAM, 'accepted-upstream-fingerprint');
        issues.push(...validateEchoesVersionDraft(draft, {...upstream, existingFeatIds:a.historicalInventory?.ids}).map(x => `draft:${x}`));
        check(equal(a.historicalInventory && Object.fromEntries(Object.entries(a.historicalInventory).filter(([k]) => k !== 'ids')), draft.collisionInventory), 'historical-inventory-binding');
        check(equal(a.representation, draft.representation) && a.bindings?.representationJsonSha256 === hash(draft.representation), 'representation-binding');
        check(equal(a.parentContext, draft.parentContext) && a.bindings?.parentContextJsonSha256 === hash(draft.parentContext), 'parent-context-binding');
        check(equal(a.sourceDefinitions, draft.roles.map(r => ({role:r.role, source:r.source, definitionEvidence:r.definitionEvidence}))), 'source-definition-bindings');
        check(equal(a.identities, IDENTITIES), 'exact-approved-identities');
        check(equal(a.presentation, {class:'Researcher', keywords:[], notes:CONTEXT}) && upstream.contextNote === CONTEXT, 'approved-presentation');
        check(keys(a.icon, ['path', 'itemPath', 'sha256']) && a.icon.path === 'css/images/icons/feat_icon.png'
            && a.icon.itemPath === 'systems/ptu/css/images/icons/feat_icon.png' && /^[a-f0-9]{64}$/.test(a.icon.sha256)
            && a.icon.sha256 === 'be56e75a31fc74bfc832cf34ef369e8bd9d84833431afbe30a144a9eb5d76340'
            && a.icon.sha256 === upstream.iconSha256, 'icon-binding');
        check(keys(inventory, ['schemaVersion', 'documents', 'mappings']) && inventory.schemaVersion === 1 && Array.isArray(inventory.documents) && Array.isArray(inventory.mappings), 'repository-inventory-shape');
        const proposed = new Set(IDENTITIES.flatMap(x => [x.itemId, x.versionId, x.canonicalId]));
        const seenPaths = new Set(), seenMappings = new Set(), seenVersions = new Set();
        for (const entry of inventory.documents ?? []) {
            check(keys(entry, ['path', 'id', 'filenameId', 'selectedVersionId', 'sourceId'])
                && typeof entry.path === 'string' && /^packs\/[\w-]+\/_source\/[A-Za-z0-9]{16}\.json$/.test(entry.path)
                && entry.path.endsWith(`/${entry.filenameId}.json`) && entry.id === entry.filenameId
                && (entry.selectedVersionId === null || typeof entry.selectedVersionId === 'string')
                && (entry.sourceId === null || typeof entry.sourceId === 'string'), 'repository-document-shape');
            check(!seenPaths.has(entry.path), 'repository-duplicate-path'); seenPaths.add(entry.path);
            for (const id of [entry.id, entry.filenameId, entry.selectedVersionId, entry.sourceId?.split('.').at(-1)]) {
                check(!proposed.has(id), `repository-identity-collision:${id}`);
            }
        }
        for (const mapping of inventory.mappings ?? []) {
            issues.push(...ruleVersionMetadataErrors(mapping).map(x => `inventory-mapping:${x}`));
            const key = `${mapping.canonical?.id}:${mapping.version?.id}`;
            check(!seenMappings.has(mapping.documentUuid) && !seenVersions.has(key), 'repository-duplicate-mapping');
            seenMappings.add(mapping.documentUuid); seenVersions.add(key);
            for (const id of [mapping.documentUuid?.split('.').at(-1), mapping.canonical?.id, mapping.version?.id]) check(!proposed.has(id), `repository-identity-collision:${id}`);
        }
        check(keys(a.repositoryInventory, ['baseline', 'count', 'jsonSha256', 'method', 'mappingStatus', 'liveCampaignClearance'])
            && a.repositoryInventory.baseline === BASE && a.repositoryInventory.count === 7395 && a.repositoryInventory.jsonSha256 === INVENTORY
            && a.repositoryInventory.method === 'SHA256(JSON.stringify({schemaVersion:1,documents:all repository pack-source identity summaries sorted by path,mappings:[]})); no excluded records removed'
            && a.repositoryInventory?.mappingStatus === 'no-production-registry-at-baseline' && a.repositoryInventory?.liveCampaignClearance === false
            && inventory.documents?.length === 7395 && hash(inventory) === INVENTORY, 'current-repository-inventory-binding');
        if (issues.length) return blocked();

        const items = [], mappings = [], eligibilityReviews = [];
        for (const identity of IDENTITIES) {
            const role = draft.roles.find(r => r.role === identity.role);
            const item = {...structuredClone(role.item), _id:identity.itemId, _key:`!items!${identity.itemId}`,
                img:a.icon.itemPath, effects:[], flags:{ptu:{selectedVersion:{id:identity.versionId, label:identity.label}}}};
            item.system.class = a.presentation.class;
            item.system.keywords = [];
            item.system.notes = a.presentation.notes;
            const contentHash = hash(item), uuid = `Compendium.ptu.feats.Item.${identity.itemId}`;
            const mapping = {schemaVersion:1, documentUuid:uuid, type:'feat', generationEligibility:'eligible',
                version:{id:identity.versionId, label:identity.label, kind:identity.role === 'baseline' ? 'original' : 'revised'},
                canonical:{id:identity.canonicalId, evidence:`Owner-approved complete core140/May7 Echoes pair; ${role.definitionEvidence.id}; ${role.definitionEvidence.jsonSha256}; separate Researcher parent context.`},
                source:{id:role.source.authorityId, edition:role.source.edition, status:identity.role === 'baseline' ? 'core' : 'optional-playtest',
                    publicationDate:role.source.publicationDate, citation:`${role.source.path}, printed/PDF p.${role.source.pdfPages[0]}`}};
            issues.push(...ruleVersionMetadataErrors(mapping).map(x => `${identity.role}:metadata:${x}`));
            items.push({role:identity.role, targetPath:`packs/feats/_source/${identity.itemId}.json`, contentHash, item});
            mappings.push(mapping);
            eligibilityReviews.push({identity:`feats.${identity.itemId}`, contentHash, generationEligibility:'eligible', ruleVersionApproval:'approved',
                verification:'not-run', sourceReferences:[{path:role.source.path, sha256:role.source.sha256, pages:[...role.source.pdfPages]}],
                relationshipEvidence:mapping.canonical.evidence, reviewedFields:['complete source leaf', 'separate parent context', 'exact identity and presentation envelope'],
                limitations:['Prospective row only; no installed registry/pack/consumer or live campaign collision clearance.', 'Content approved; behavior, effect-use and gameplay automation not verified.'],
                verificationEvidence:'docs/validation/p05-echoes-admission.md'});
        }
        if (issues.length) return blocked();
        return {schemaVersion:1, status:'prepared-not-installed', issues:[], bundle:{items, mappings, eligibilityReviews,
            preparation:{status:'prepared-not-installed', contentApproval:'approved', consentAuthentication:'external-evidence-not-authenticated-by-compiler',
                defaultVersionId:IDENTITIES[0].versionId, optionalVersionIds:[IDENTITIES[1].versionId], installation:false,
                behavioralVerification:'not-run', automation:false, integrationRequirements:[...REQUIREMENTS]}}};
    } catch {issues.push('serialized-evidence-shape'); return blocked();}
}

// Thin, read-only repository adapter. It reports summaries, never emits target files.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const {readFile, readdir} = await import('node:fs/promises');
    const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    try {
        const upstream = {pilot:JSON.parse(await read('docs/data/rule-version-pilot.json')), revisions:await read('docs/data/rules-revisions.json'),
            sourceEvidence:Object.fromEntries(await Promise.all(evidencePaths.map(async p => [p, await read(p)]))),
            currentRecords:Object.fromEntries(await Promise.all(recordIds.map(async id => {const [pack, key] = id.split('.'); return [id, await read(`packs/${pack}/_source/${key}.json`)];}))),
            contextNote:(await read('docs/validation/p05-echoes-readiness.md')).match(/^> (Researcher[^\r\n]+)$/m)?.[1],
            iconSha256:createHash('sha256').update(await readFile(new URL('../css/images/icons/feat_icon.png', import.meta.url))).digest('hex')};
        const documents = [];
        for (const pack of await readdir(new URL('../packs/', import.meta.url), {withFileTypes:true})) {
            if (!pack.isDirectory()) continue;
            let files;
            try {files = await readdir(new URL(`../packs/${pack.name}/_source/`, import.meta.url));}
            catch (error) {if (error.code === 'ENOENT') continue; throw error;}
            for (const file of files.filter(x => x.endsWith('.json')).sort()) {
                const path = `packs/${pack.name}/_source/${file}`, item = JSON.parse(await read(path)), selected = item.flags?.ptu?.selectedVersion;
                documents.push({path, id:item._id, filenameId:file.slice(0, -5), selectedVersionId:selected == null ? null : typeof selected === 'string' ? selected : selected.id,
                    sourceId:item._stats?.compendiumSource ?? item.flags?.core?.sourceId ?? null});
            }
        }
        documents.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
        // The accepted resolver has no production registry. This explicit empty
        // baseline inventory is not a future registry-discovery or UUID adapter.
        const result = compileEchoesAdmission(await read('docs/data/rule-version-echoes-admission.json'), await read('docs/data/rule-version-echoes-draft.json'),
            JSON.stringify(upstream), JSON.stringify({schemaVersion:1, documents, mappings:[]}));
        console.log(JSON.stringify({status:result.status, issues:result.issues, bundleJsonSha256:result.bundle ? hash(result.bundle) : null, targets:result.bundle?.items.map(x => ({role:x.role, path:x.targetPath, contentHash:x.contentHash})),
            mappings:result.bundle?.mappings.map(x => x.documentUuid), preparation:result.bundle?.preparation}, null, 2));
        if (result.issues.length) process.exitCode = 1;
    } catch {console.error('Admission input read/JSON failed; no targets written.'); process.exitCode = 1;}
}
