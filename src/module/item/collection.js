import {isExcludedAcquisitionDocument} from '../../util/content-scope.js';
import {isStarterTrainingGrant} from '../../util/starter-training.js';

/** Guard actual pack acquisition. JSON restore uses a non-pack Document in core v13.351. */
export class PTUItems extends foundry.documents.collections.Items {
    fromCompendium(document, options) {
        if (document instanceof foundry.abstract.Document && isExcludedAcquisitionDocument(document)) {
            throw new Error('PTU | This compendium record is excluded from new acquisition by the Generations 1–8 scope.');
        }
        if (document.pack && isStarterTrainingGrant(document) && !options?.ptuStarterTraining) throw new Error('PTU | Use Choose Starter Training on a newly created trainer.');
        return super.fromCompendium(document, options);
    }
}
