// Exact owner-excluded consumers: docs/data/supported-content-scope.json.
// This is deliberately a partial policy. All other inherited records need source review.
export const EXCLUDED_CONTENT = Object.freeze([
    'effects.3w7uQfBvzzxATXis', 'species.dkQPNz0RLbgzWMLq', 'species.jAIJeRtRc1sUekjO'
]);
export const CONTENT_SCOPE_NOTICE = 'Content approval is incomplete. Some listed inherited entries have not been reviewed for PTU 1.05.';
export function contentIdentity(value) {
    if (typeof value !== 'string') return null;
    const uuid = /^Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})$/.exec(value);
    if (uuid) return `${uuid[1]}.${uuid[2]}`;
    return /^[\w-]+\.[A-Za-z0-9]{16}$/.test(value) ? value : null;
}
export const isExcludedContent = value => EXCLUDED_CONTENT.includes(contentIdentity(value));
export const isExcludedAcquisitionDocument = document => Boolean(document?.pack) && isExcludedContent(document.uuid);
export const filterNewContent = (records, identity = row => row.uuid) => records.filter(row => !isExcludedContent(identity(row)));
export function assertCompleteSupportedContent(inventory) {
    if (!inventory.completeSupportedScope || inventory.counts.unclassifiedGeneration || inventory.counts.unapprovedRuleVersion
        || inventory.dependencies.blockers.length) throw new Error('Supported-content release blocked: source classification, approval or dependencies remain unresolved.');
}
