import {MigrationBase} from '../base.js';
import {resolvePreservationSource, fillMissingFields} from '../../../util/preservation.js';

export class Migration111PrereqItems extends MigrationBase {
    static version = 0.111;

    async updateItem(item) {
        if (!['feat', 'edge', 'pokeedge'].includes(item.type) || Object.hasOwn(item.system, 'prerequisites')) return;
        const source = await resolvePreservationSource(item);
        if (source) fillMissingFields(item.system, source.system, ['prerequisites']);
    }
}
