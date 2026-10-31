import {getDocumentSourceId} from './document-source.js';

export const RULE_VERSION_SCHEMA = 1;
export const STANDARD_RULE_DEFAULT = 'standard';
const itemTypes = new Set(['move', 'ability', 'feat', 'edge', 'pokeedge']);
const sourceStatuses = new Set(['core', 'official-errata', 'optional-playtest', 'supplement', 'custom', 'synthetic']);
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const copy = value => value === undefined ? undefined : structuredClone(value);
const documentUuid = value => typeof value === 'string' && /^(?:Compendium\.[\w-]+\.[\w-]+\.(?:Item\.)?|Item\.|Actor\.[\w]+\.Item\.)[A-Za-z0-9]{16}$/.test(value);

// Preserve known date precision; null means unknown, never a guessed publication day.
function publicationDate(value) {
    if (value === null) return true;
    if (typeof value !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1 || (month !== undefined && (month < 1 || month > 12))) return false;
    if (day === undefined) return true;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return day >= 1 && day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** Shape checks only. A citation/eligible declaration is not production or behavior approval. */
export function ruleVersionMetadataErrors(record) {
    if (!object(record)) return ['metadata-missing-or-invalid'];
    const errors = [];
    if (record.schemaVersion !== RULE_VERSION_SCHEMA) errors.push('unsupported-metadata-schema');
    if (!documentUuid(record.documentUuid)) errors.push('document-identity-invalid');
    if (!itemTypes.has(record.type)) errors.push('unsupported-item-type');
    if (!object(record.version) || !text(record.version.id) || !text(record.version.label)) errors.push('version-identity-missing');
    if (!['original', 'revised', 'addition'].includes(record.version?.kind)) errors.push('version-kind-unestablished');
    if (!['eligible', 'excluded', 'unclassified'].includes(record.generationEligibility)) errors.push('generation-eligibility-unestablished');
    const source = record.source;
    if (!object(source) || !text(source.id) || !text(source.edition) || !text(source.citation)) errors.push('source-attribution-incomplete');
    if (!sourceStatuses.has(source?.status)) errors.push('source-status-unestablished');
    if (!publicationDate(source?.publicationDate)) errors.push('source-date-invalid');
    // Null explicitly retains an unknown relationship. Catalog coordinates are evidence, not runtime IDs.
    if (record.canonical !== null && (!object(record.canonical) || !text(record.canonical.id)
        || /^r04-/.test(record.canonical.id) || !text(record.canonical.evidence))) errors.push('canonical-relationship-unevidenced');
    return errors;
}

function snapshot(item) {
    const data = item?.toObject?.() ?? item;
    const sourceId = getDocumentSourceId(data) ?? null;
    const uuid = item?.uuid ?? null;
    return {data, identity:{uuid, id:item?.id ?? data?._id ?? null, sourceId,
        // An actual pack document's own UUID wins over historical export provenance.
        mappingUuid:item?.pack ? uuid : sourceId ?? uuid},
    storedSelection:copy(data?.flags?.ptu?.selectedVersion)};
}

function selectionFromSnapshot({data, identity, storedSelection}, versions) {
    const issues = [];
    let metadata = null;
    if (!Array.isArray(versions)) issues.push('version-registry-invalid');
    else if (!text(identity.mappingUuid)) issues.push('document-identity-unestablished');
    else {
        const matches = versions.filter(record => record?.documentUuid === identity.mappingUuid);
        if (matches.length !== 1) issues.push(matches.length ? 'ambiguous-document-mapping' : 'document-mapping-unestablished');
        else {
            const record = matches[0];
            issues.push(...ruleVersionMetadataErrors(record));
            if (record.type !== data?.type) issues.push('mapped-item-type-conflict');
            if (record.generationEligibility !== 'eligible') issues.push('mapping-outside-approved-generation-scope');
            const selectedId = typeof storedSelection === 'string' ? storedSelection : storedSelection?.id;
            if (storedSelection !== undefined && storedSelection !== null && !text(selectedId)) issues.push('stored-version-identity-unestablished');
            else if (text(selectedId) && selectedId !== record.version?.id) issues.push('stored-version-conflict');
            // Edition/version tokens may be shared by distinct benefits, but one evidenced
            // canonical version must not silently point to competing source documents.
            if (text(record.canonical?.id) && text(record.version?.id) && versions.some(other => other !== record
                && other?.canonical?.id === record.canonical.id && other?.version?.id === record.version.id)) issues.push('ambiguous-canonical-version');
            if (issues.length === 0) metadata = copy(record);
        }
    }
    return {schemaVersion:RULE_VERSION_SCHEMA, status:metadata ? 'resolved' : 'unresolved',
        identity:copy(identity), storedSelection, selectedVersion:metadata ? copy(metadata.version) : null,
        canonical:metadata ? copy(metadata.canonical) : null, source:metadata ? copy(metadata.source) : null,
        rawPrerequisites:copy(data?.system?.prerequisites), issues};
}

/** Exact supplied mappings only: no names, catalog promotion, latest-version fallback or document writes. */
export function lookupSelectedRuleVersion(item, {versions = []} = {}) {
    return selectionFromSnapshot(snapshot(item), versions);
}

/** Owned data stays authoritative, including custom rules/choices and unresolved legacy selections. */
export function lookupEffectiveRule(item, {versions = [], mechanicChoices = {}} = {}) {
    const state = snapshot(item);
    return {selection:selectionFromSnapshot(state, versions), system:copy(state.data?.system),
        mechanicChoices:copy(mechanicChoices)};
}

/** Independent mechanic preference; an absent choice uses standard, never a selected item's version. */
export function lookupMechanicChoice(id, choices = {}) {
    if (!text(id) || !object(choices)) return {status:'unresolved', value:null, issue:'mechanic-choices-invalid'};
    if (!Object.hasOwn(choices, id)) return {status:'default', value:STANDARD_RULE_DEFAULT};
    return text(choices[id]) ? {status:'explicit', value:choices[id]}
        : {status:'unresolved', value:copy(choices[id]), issue:'mechanic-choice-invalid'};
}
