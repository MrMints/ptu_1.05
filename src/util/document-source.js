/** Read identity without changing provenance or inferring it from a label. Core v12+ wins. */
export function getDocumentSourceId(document) {
    const current = document?._stats?.compendiumSource;
    if (typeof current === 'string' && current.length) return current;
    const legacy = document?.flags?.core?.sourceId;
    return typeof legacy === 'string' && legacy.length ? legacy : undefined;
}

/** Source-controlled refresh data. Identity, flags, name and owned state remain local. */
export function createCompendiumRefreshUpdate(current, latest, defaultImage) {
    if (!latest || current.type !== latest.type) throw new Error('Compendium item type must match.');
    const system = structuredClone(latest.system);
    if (Object.hasOwn(current.system, 'enabled')) system.enabled = current.system.enabled;
    if (current.type === 'item' && Object.hasOwn(current.system, 'quantity')) {
        system.quantity = current.system.quantity;
    }
    return {
        img: defaultImage && current.img === defaultImage ? latest.img : current.img,
        system
    };
}
