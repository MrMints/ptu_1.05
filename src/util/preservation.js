import {getDocumentSourceId} from './document-source.js';
import {isExcludedContent} from './content-scope.js';

/** Full typed/legacy compendium Item identities only. Never search names, slugs or ID suffixes. */
export function compendiumItemIdentity(uuid) {
    const match = typeof uuid === 'string' && uuid.match(/^Compendium\.([\w-]+)\.([\w-]+)\.(?:Item\.)?([A-Za-z0-9]{16})$/);
    return match ? `Compendium.${match[1]}.${match[2]}.Item.${match[3]}` : null;
}

export function preservationWarning(item, reason) {
    const identity = getDocumentSourceId(item) ?? item._id ?? 'custom record';
    globalThis.ui?.notifications?.warn?.(`PTU | Preserved ${item.name ?? item.type} (${identity}): ${reason}`);
}

/** Modern provenance wins even if unresolved; never fall back to a different version. */
export async function resolvePreservationSource(item, {resolve = uuid => fromUuid(uuid), warn = preservationWarning} = {}) {
    const sourceId = getDocumentSourceId(item);
    const identity = compendiumItemIdentity(sourceId);
    if (!identity || isExcludedContent(identity)) {
        warn(item, 'no eligible exact compendium identity; review manually.');
        return null;
    }
    // Resolver exceptions fail migration rather than stamping success or guessing another source.
    const document = await resolve(sourceId);
    if (!document || compendiumItemIdentity(document.uuid) !== identity || document.type !== item.type) {
        warn(item, 'the exact source is missing or does not match its identity/type; review manually.');
        return null;
    }
    return document;
}

/** Existing null/empty/custom values are intentional without an evidenced replacement baseline. */
export function fillMissingFields(target, source, fields) {
    for (const field of fields) {
        if (!Object.hasOwn(target, field) && Object.hasOwn(source, field)) target[field] = structuredClone(source[field]);
    }
}
