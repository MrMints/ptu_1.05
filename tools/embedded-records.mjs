import { isDeepStrictEqual } from 'node:util';

// Legacy exports can contain an embedded record twice: inline and in its collection.
// Only identical records are safe to collapse; conflicting IDs require investigation.
export function deduplicateEmbedded(value, repairs = [], path = '$') {
    if (Array.isArray(value)) {
        const seen = new Map();
        return value.flatMap((entry, index) => {
            if (entry && typeof entry === 'object' && entry._id) {
                if (seen.has(entry._id)) {
                    if (!isDeepStrictEqual(entry, seen.get(entry._id))) throw new Error(`Conflicting embedded ID at ${path}: ${entry._id}`);
                    repairs.push({ path, id: entry._id });
                    return [];
                }
                seen.set(entry._id, entry);
            }
            return [deduplicateEmbedded(entry, repairs, `${path}[${index}]`)];
        });
    }
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, deduplicateEmbedded(entry, repairs, `${path}.${key}`)]));
    return value;
}
