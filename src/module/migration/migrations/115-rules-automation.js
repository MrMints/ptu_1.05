import {MigrationBase} from '../base.js';
import {resolvePreservationSource, fillMissingFields} from '../../../util/preservation.js';

export class Migration115RulesAutomation extends MigrationBase {
    static version = 0.115;
    requiresFlush = true;

    async updateItem(item) {
        if (item.type !== 'move') return;
        // One automation payload: never append to or blend a saved/custom payload.
        if (Object.hasOwn(item.system, 'rules') || Object.hasOwn(item.system, 'referenceEffect')) return;
        const source = await resolvePreservationSource(item);
        if (source) fillMissingFields(item.system, source.system, ['rules', 'referenceEffect']);
    }
}
