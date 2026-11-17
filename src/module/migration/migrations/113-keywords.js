import {MigrationBase} from '../base.js';
import {resolvePreservationSource, fillMissingFields} from '../../../util/preservation.js';

export class Migration113Keywords extends MigrationBase {
    static version = 0.113;

    async updateItem(item) {
        if (!['feat', 'move', 'item'].includes(item.type)) return;
        // Retain raw legacy tags; a local array can supply its structural successor.
        if (!Object.hasOwn(item.system, 'keywords') && Array.isArray(item.system.tags)) {
            item.system.keywords = structuredClone(item.system.tags);
        }
        const fields = ['keywords', ...(item.type === 'move' ? ['range'] : [])];
        if (fields.every(field => Object.hasOwn(item.system, field))) return;
        // Unknown legacy tags must not be silently replaced with source keywords.
        const missing = fields.filter(field => field !== 'keywords' || !Object.hasOwn(item.system, 'tags'));
        if (missing.every(field => Object.hasOwn(item.system, field))) return;
        const source = await resolvePreservationSource(item);
        if (source) fillMissingFields(item.system, source.system, missing);
    }
}
