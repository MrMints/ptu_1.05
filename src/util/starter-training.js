import {getDocumentSourceId} from './document-source.js';

// Original relationship in eed5c4c9^; PTU 1.05 core pp. 13, 18, 60.
export const STARTER_TRAINING_GRANT = 'Compendium.ptu.effects.Item.fm0TZUuQK0uRhkJA';
export const STARTER_TRAINING_CHOICES = Object.freeze([
    'Compendium.ptu.feats.Item.TQ6scoBM3iZKMuZT',
    'Compendium.ptu.feats.Item.MolTHMn3UrNiIZ3h',
    'Compendium.ptu.feats.Item.FLSt79Zix8j69T07',
    'Compendium.ptu.feats.Item.WfLcIrUmRwblAaYr'
]);
const pending = new WeakMap();
export const isStarterTrainingGrant = item => item?.pack ? item.uuid === STARTER_TRAINING_GRANT : getDocumentSourceId(item) === STARTER_TRAINING_GRANT;
export const hasStarterTraining = actor => actor.flags?.ptu?.starterTraining?.status === 'complete'
    || [...actor.items].some(item => item.flags?.ptu?.starterTrainingGrant === STARTER_TRAINING_GRANT
        && STARTER_TRAINING_CHOICES.includes(getDocumentSourceId(item)));

// Only a newly created empty trainer. Imported/populated/duplicated actors are left intact.
export function shouldOfferStarterTraining(data, context = {}) {
    return data.type === 'character' && !(data.items?.length) && !data.flags?.ptu?.starterTraining
        && !data._stats?.compendiumSource && !data._stats?.duplicateSource
        && !context.keepId && !context.keepEmbeddedIds;
}

export function selectStarterTraining(actor, {load, copy, warn}) {
    if (!actor.isOwner) return Promise.resolve({status:'not-owner'});
    if (hasStarterTraining(actor)) return Promise.resolve({status:'complete'});
    if (actor.flags?.ptu?.starterTraining?.status !== 'pending') return Promise.resolve({status:'not-new'});
    if (pending.has(actor)) return pending.get(actor);
    const operation = (async () => {
        const effect = await load(STARTER_TRAINING_GRANT);
        if (effect?.type !== 'effect' || effect.uuid !== STARTER_TRAINING_GRANT) throw new Error('Original starter-training effect is unavailable.');
        const source = copy(effect);
        const choice = source.system.rules.find(rule => rule.key === 'ChoiceSet');
        const grant = source.system.rules.find(rule => rule.key === 'GrantItem');
        if (JSON.stringify(choice?.choices?.map(row => row.value)) !== JSON.stringify(STARTER_TRAINING_CHOICES)
            || grant?.uuid !== '{item|flags.ptu.rulesSelections.move}' || !grant.replaceSelf) {
            throw new Error('Starter-training source relationships changed; review them before selection.');
        }
        const owned = new Set([...actor.items].map(getDocumentSourceId));
        choice.choices = choice.choices.filter(row => !owned.has(row.value)).map(({value}) => ({value}));
        choice.allowNoSelection = false;
        grant.allowduplicate = false; // Current rule schema; inherited allowDuplicate is not this field.
        grant.overwrites = {flags:{ptu:{starterTrainingGrant:STARTER_TRAINING_GRANT}}};
        source._stats ??= {};
        source._stats.compendiumSource = STARTER_TRAINING_GRANT;
        try {
            const created = await actor.createEmbeddedDocuments('Item', [source], {ptuStarterTraining:true});
            const selected = created.filter(item => item.flags?.ptu?.starterTrainingGrant === STARTER_TRAINING_GRANT
                && STARTER_TRAINING_CHOICES.includes(getDocumentSourceId(item)));
            if (selected.length !== 1) throw new Error('Starter-training selection did not create exactly one Feature.');
            await actor.setFlag('ptu','starterTraining',{status:'complete',itemId:selected[0].id,sourceId:getDocumentSourceId(selected[0])});
            return {status:'complete',itemId:selected[0].id};
        } catch (error) {
            if (!error.message.includes('No selection made')) throw error;
            warn('PTU | Training selection cancelled. Use Choose Starter Training on this trainer sheet to choose later.');
            return {status:'cancelled'};
        }
    })();
    pending.set(actor, operation);
    return operation.finally(() => pending.delete(actor));
}
