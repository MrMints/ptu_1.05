import {diagnosePrerequisites,formatPrerequisiteDiagnostics} from './prerequisites.js';

export const ADVISORY_ITEM_TYPES=Object.freeze(['feat','edge','pokeedge']);
export const isAdvisoryItem=item=>ADVISORY_ITEM_TYPES.includes(item?.type);

/** Derived only: never save reports, rewrite requirements, infer a version, or modify actor values. */
export function prerequisiteView(item,actor=item?.actor) {
    if(!isAdvisoryItem(item))return null;
    const report=diagnosePrerequisites({actor,item,selectedVersion:item.flags?.ptu?.selectedVersion});
    const warnings=formatPrerequisiteDiagnostics(report);
    return {id:report.identity.id,name:report.identity.name,report,...warnings,
        clear:warnings.unmet.length===0&&warnings.unknown.length===0};
}

export function actorPrerequisiteViews(actor) {
    return Array.from(actor.items?.contents??actor.items??[],item=>prerequisiteView(item,actor)).filter(Boolean);
}

/** A deliberate same-sheet group action has exact owned IDs; a class label alone is not identity evidence. */
export async function assignFeatureGroup(actor,item,target) {
    if(!actor.isOwner||item?.actor!==actor||item.type!=='feat'||item.isGranted||item===target)return;
    if(target?.isClass&&target.actor!==actor)return;
    const old=actor.items.get(item.flags.ptu?.grantedBy?.id);
    const group=target?.isClass?target:null;
    if(group){
        await item.update({'system.class':group.name,'flags.ptu.grantedBy':{id:group.id,onDelete:'detach'}});
        await group.update({['flags.ptu.itemGrants.'+item.id]:{id:item.id,onDelete:'detach'}});
    }else if(old?.isClass){
        await item.update({'system.class':null,'flags.ptu.-=grantedBy':null});
    }
    if(old?.isClass&&old!==group)await old.update({['flags.ptu.itemGrants.-='+item.id]:null});
}
