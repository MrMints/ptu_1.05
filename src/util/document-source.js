/** Read identity without changing provenance or inferring it from a label. Core v12+ wins. */
export function getDocumentSourceId(document) {
    const current = document?._stats?.compendiumSource;
    if (typeof current === 'string' && current.length) return current;
    const legacy = document?.flags?.core?.sourceId;
    return typeof legacy === 'string' && legacy.length ? legacy : undefined;
}

/** Conservative refresh: fill absent system fields; existing values need explicit replacement review. */
export function createCompendiumRefreshUpdate(current, latest, defaultImage) {
    if (!latest || current.type !== latest.type) throw new Error('Compendium item type must match.');
    const system = structuredClone(current.system);
    const hasAutomation = Object.hasOwn(system, 'rules') || Object.hasOwn(system, 'referenceEffect');
    for (const [field, value] of Object.entries(latest.system)) {
        // Refresh is not a schema migration and must not declare one completed.
        if (hasAutomation && ['rules', 'referenceEffect'].includes(field)) continue;
        if (field === 'keywords' && Object.hasOwn(system, 'tags')) continue;
        if (field !== 'schema' && !Object.hasOwn(system, field)) system[field] = structuredClone(value);
    }
    return {
        img: defaultImage && current.img === defaultImage ? latest.img : current.img,
        system
    };
}
