import {FeatureAcquisitionReview} from './feature-acquisition-review.js';
import {SKILLS} from '../../util/skills.js';

const own = (value,key) => Object.hasOwn(value,key);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype,null].includes(Object.getPrototypeOf(value));
const put = (value,key,data) => Object.defineProperty(value,key,{value:data,enumerable:true,writable:true,configurable:true});
class CaptureError extends Error {
    constructor(path,reason) {super(reason);this.issue = {path,reason};}
}
const fail = (path,reason) => {throw new CaptureError(path,reason);};
function read(path,action,reason) {
    try {return action();} catch (error) {if (error instanceof CaptureError) throw error;fail(path,reason);}
}

function slots(value,path) {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) fail(path,'dense-array-required');
    const descriptors = Object.getOwnPropertyDescriptors(value), length = descriptors.length.value;
    const keys = Reflect.ownKeys(descriptors).filter(key=>key !== 'length');
    if (keys.length !== length) fail(path,'dense-array-required');
    for (const key of keys) {
        if (typeof key !== 'string' || !/^(?:0|[1-9]\d*)$/.test(key) || Number(key) >= length) fail(path,'array-index-required');
        if (!descriptors[key].enumerable || !own(descriptors[key],'value')) fail([...path,key],'data-property-required');
    }
    return Array.from({length},(_,index)=>descriptors[index].value);
}

// Serialization is deliberate here, but snapshot/context data must still contain
// only ordinary JSON values. Never invoke supplied getters or conversion hooks.
function data(value,path,ancestors = new Set()) {
    if (value === null || ['string','boolean'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'object' || ancestors.has(value)) fail(path,'serialized-data-required');
    const next = new Set(ancestors).add(value);
    if (Array.isArray(value)) return slots(value,path).map((entry,index)=>data(entry,[...path,String(index)],next));
    if (!plain(value)) fail(path,'plain-data-required');
    const result = {};
    for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string') fail(path,'string-key-required');
        const descriptor = Object.getOwnPropertyDescriptor(value,key);
        if (!descriptor.enumerable || !own(descriptor,'value')) fail([...path,key],'data-property-required');
        put(result,key,data(descriptor.value,[...path,key],next));
    }
    return result;
}

function options(input) {
    if (!plain(input)) fail([],'plain-launch-request-required');
    const fields = ['actor','incoming','registry','versions','references','mechanicChoices','sourceCollections'], result = {};
    for (const key of Reflect.ownKeys(input)) {
        if (typeof key !== 'string' || !fields.includes(key)) fail(typeof key === 'string' ? [key] : [],'unknown-launch-option');
        const descriptor = Object.getOwnPropertyDescriptor(input,key);
        if (!descriptor.enumerable || !own(descriptor,'value')) fail([key],'request-field-not-data');
        put(result,key,descriptor.value);
    }
    for (const key of ['actor','incoming']) if (!own(result,key)) fail([key],'request-field-required');
    if (!own(result,'registry') && !own(result,'versions')) fail([],'explicit-mappings-required');
    return result;
}

function access(document,path,user,collections,kind) {
    read(path,()=>{
        if (document === null || typeof document !== 'object' || typeof document.testUserPermission !== 'function') fail(path,'read-permission-unavailable');
        if (document.testUserPermission(user,'OBSERVER') !== true) fail(path,'read-permission-denied-or-uncertain');
        if ('visible' in document && document.visible !== true) fail(path,'visibility-denied-or-uncertain');
        if (document.documentName !== kind) fail(path,'document-kind-unestablished');
        if (document.pack != null && document.pack !== '') {
            if (typeof document.pack !== 'string') fail(path,'source-collection-unestablished');
            const matches = collections.filter((collection,index)=>read(['sourceCollections',String(index)],()=>collection?.collection === document.pack,'collection-metadata-unreadable'));
            if (matches.length !== 1) fail(path,'explicit-source-collection-required');
            const collection = matches[0];
            if (typeof collection.testUserPermission !== 'function' || collection.testUserPermission(user,'OBSERVER') !== true) fail(path,'source-collection-read-denied-or-uncertain');
        }
        if (kind === 'Item' && document.parent != null) access(document.parent,[...path,'parent'],user,collections,'Actor');
    },'read-access-unreadable');
}

function metadata(document,path,kind,owner) {
    return read(path,()=>{
        const {id,uuid,type,pack,parent,isTemporary} = document;
        if (isTemporary === true) fail(path,'temporary-document-identity');
        if (typeof id !== 'string' || typeof uuid !== 'string' || typeof type !== 'string' || !type) fail(path,'document-identity-unavailable');
        if (kind === 'Actor') {
            if (pack || parent != null || !/^\w+$/.test(id) || uuid !== `Actor.${id}`) fail(path,'actor-identity-unsupported');
        } else {
            if (!/^[A-Za-z0-9]{16}$/.test(id)) fail(path,'item-identity-unsupported');
            if (owner && parent !== owner) fail(path,'owned-item-context-conflict');
            if (parent != null) {
                const source = metadata(parent,[...path,'parent'],'Actor');
                if (pack || uuid !== `${source.uuid}.Item.${id}`) fail(path,'item-identity-context-conflict');
            } else if (pack) {
                if (typeof pack !== 'string' || !/^[\w-]+\.[\w-]+$/.test(pack)
                    || ![`Compendium.${pack}.Item.${id}`,`Compendium.${pack}.${id}`].includes(uuid)) fail(path,'item-identity-context-conflict');
            } else if (uuid !== `Item.${id}`) fail(path,'item-identity-context-conflict');
        }
        return {id,uuid,type,pack,parent};
    },'document-identity-unreadable');
}

function snapshot(document,identity,path) {
    return read(path,()=>{
        if (typeof document.toObject !== 'function') fail(path,'serialization-unavailable');
        const value = data(document.toObject(),path);
        if (!plain(value) || value._id !== identity.id || value.type !== identity.type || !plain(value.system)
            || own(value,'name') && typeof value.name !== 'string' || own(value,'toObject')) fail(path,'document-snapshot-malformed');
        for (const key of ['id','uuid']) if (own(value,key) && value[key] !== identity[key]) fail([...path,key],'snapshot-identity-conflict');
        if (own(value,'pack') && value.pack != null && value.pack !== identity.pack) fail([...path,'pack'],'snapshot-source-context-conflict');
        put(value,'uuid',identity.uuid);put(value,'id',identity.id);
        if (identity.pack) put(value,'pack',identity.pack);
        return value;
    },'document-serialization-failed');
}

function evaluatorFacts(actor,value) {
    read(['actor','system'],()=>{
        const current = actor.system, level = current?.level?.current, skills = current?.skills;
        const system = value.system;
        for (const key of ['level','skills']) {
            if (own(system,key) && !plain(system[key])) fail(['actor','system',key],'snapshot-facts-malformed');
            if (!own(system,key)) put(system,key,{});
        }
        delete system.level.current;
        if (level !== undefined) put(system.level,'current',data(level,['actor','system','level','current']));
        for (const key of Object.keys(SKILLS)) {
            const total = skills?.[key]?.value?.total;
            if (own(system.skills,key) && !plain(system.skills[key])) fail(['actor','system','skills',key],'snapshot-facts-malformed');
            if (!own(system.skills,key) && total === undefined) continue;
            if (!own(system.skills,key)) put(system.skills,key,{});
            const skill = system.skills[key];
            if (own(skill,'value') && !plain(skill.value)) fail(['actor','system','skills',key,'value'],'snapshot-facts-malformed');
            if (!own(skill,'value')) put(skill,'value',{});
            delete skill.value.total;
            if (total !== undefined) put(skill.value,'total',data(total,['actor','system','skills',key,'value','total']));
        }
    },'evaluator-facts-unreadable');
}

function membership(actor) {
    return read(['actor','items'],()=>{
        const collection = actor.items;
        return slots(Array.isArray(collection) ? collection : collection?.contents,['actor','items']);
    },'owned-membership-unreadable');
}

/** Explicit read-only bridge. Source collections are supplied permission contexts,
 * never searched/loaded. A requested view is not acquisition consent or authority. */
export function launchFeatureAcquisitionReview(input) {
    try {
        const supplied = read([],()=>options(input),'launch-request-unreadable');
        const incoming = read(['incoming'],()=>slots(supplied.incoming,['incoming']),'incoming-unreadable');
        const collections = own(supplied,'sourceCollections') ? read(['sourceCollections'],()=>slots(supplied.sourceCollections,['sourceCollections']),'source-context-unreadable') : [];
        const request = {};
        for (const key of ['registry','versions','references','mechanicChoices']) if (own(supplied,key)) {
            put(request,key,supplied[key] === undefined ? undefined : read([key],()=>data(supplied[key],[key]),'context-unreadable'));
        }
        const user = read([],()=>game.user,'current-user-unavailable');
        if (user === null || typeof user !== 'object') fail([],'current-user-unavailable');
        const userId = read([],()=>user.id,'current-user-unavailable');
        if (typeof userId !== 'string' || !userId.trim()) fail([],'current-user-unavailable');
        const actor = supplied.actor;
        access(actor,['actor'],user,collections,'Actor');
        incoming.forEach((item,index)=>access(item,['incoming',String(index)],user,collections,'Item'));
        // Every member matters to prerequisite membership, even non-Features.
        // All access checks precede any protected snapshot/content capture.
        const owned = membership(actor);
        owned.forEach((item,index)=>access(item,['owned',String(index)],user,collections,'Item'));
        const actorIdentity = metadata(actor,['actor'],'Actor');
        const ownedIdentities = owned.map((item,index)=>metadata(item,['owned',String(index)],'Item',actor));
        const incomingIdentities = incoming.map((item,index)=>metadata(item,['incoming',String(index)],'Item'));
        for (const [index,identity] of incomingIdentities.entries()) if (identity.type !== 'feat') fail(['incoming',String(index)],'incoming-feature-required');
        const actorSnapshot = snapshot(actor,actorIdentity,['actor']);
        const items = owned.map((item,index)=>snapshot(item,ownedIdentities[index],['owned',String(index)]));
        const candidates = incoming.map((item,index)=>snapshot(item,incomingIdentities[index],['incoming',String(index)]));
        evaluatorFacts(actor,actorSnapshot);
        put(actorSnapshot,'items',items);
        const after = membership(actor);
        if (after.length !== owned.length || after.some((item,index)=>item !== owned[index])) fail(['actor','items'],'membership-changed-during-capture');
        const documents = [[actor,actorIdentity,['actor'],'Actor'],...owned.map((item,index)=>[item,ownedIdentities[index],['owned',String(index)],'Item']),
            ...incoming.map((item,index)=>[item,incomingIdentities[index],['incoming',String(index)],'Item'])];
        for (const [document,before,path,kind] of documents) {
            access(document,path,user,collections,kind);
            const after = metadata(document,path,kind);
            if (['id','uuid','type','pack','parent'].some(key=>before[key] !== after[key])) fail(path,'document-changed-during-capture');
        }
        if (read([],()=>game.user !== user || user.id !== userId,'current-user-unreadable')) fail([],'current-user-changed-during-capture');
        request.actor = actorSnapshot;request.owned = items.filter(item=>item.type === 'feat');request.incoming = candidates;
        const review = new FeatureAcquisitionReview(request);
        review.render(true);
        return {status:'review-requested',review};
    } catch (error) {
        return {status:'not-opened',issues:[error instanceof CaptureError ? error.issue : {path:[],reason:'launch-unreadable'}]};
    }
}
