import {isExcludedAcquisitionDocument} from './content-scope.js';
import {isStarterTrainingGrant} from './starter-training.js';

const links = item => item.flags?.ptu ?? {};
const grants = item => Object.values(links(item).itemGrants ?? {});
const related = (item, id) => links(item).grantedBy?.id === id || grants(item).some(edge => edge?.id === id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fail = message => {throw Error(`PTU | Saved Item copy: ${message}`);};

/** Only the selected Document's real collection establishes the meaning of local IDs. */
async function sourceContext(item) {
    if (item.parent?.items) return {key:item.parent, collection:item.parent.items, name:item.parent.name};
    if (item.pack) {
        const pack=game.packs.get(item.pack);
        if (!pack || !pack.testUserPermission(game.user, 'OBSERVER')) fail('source collection is inaccessible.');
        await pack.getDocuments();
        return {key:pack, collection:pack, name:pack.title};
    }
    if (!item.parent && !item.pack) return {key:game.items, collection:game.items, name:'World Items'};
    fail('source collection is not established.');
}

export function hasSavedItemGraph(item) {
    if (links(item).grantedBy?.id || grants(item).length) return true;
    const collection=item.parent?.items ?? (!item.pack && !item.parent ? game.items : null);
    return collection ? [...collection.values()].some(other => related(other, item.id)) : false;
}

function validateGraph(items) {
    const byId=new Map(items.map(item => [item._id,item]));
    if (byId.size!==items.length) fail('ambiguous local IDs.');
    for (const item of items) {
        const metadata=links(item).itemGrants;
        if ((metadata!=null && (typeof metadata!=='object'||Array.isArray(metadata))) || grants(item).some(edge=>!edge||typeof edge!=='object'||typeof edge.id!=='string'||!edge.id)) fail('malformed saved grant metadata; inspect this source graph.');
        for (const edge of grants(item)) {
            const target=byId.get(edge.id);
            if (!target || links(target).grantedBy?.id!==item._id) fail('incomplete or inconsistent reciprocal links.');
        }
        const parentId=links(item).grantedBy?.id;
        if (parentId && !grants(byId.get(parentId) ?? {}).some(edge => edge.id===item._id)) fail('incomplete or inconsistent reciprocal links.');
    }
}

async function collect(selected) {
    const contexts=new Map(), documents=[];
    for (const item of selected) {
        const context=await sourceContext(item);
        if (context.collection.get(item.id)!==item) fail('selected Document is no longer in its source collection.');
        let group=contexts.get(context.key);
        if (!group) contexts.set(context.key, group={...context, documents:new Set()});
        const pending=[item];
        while (pending.length) {
            const current=pending.shift();
            if (group.documents.has(current)) continue;
            if (!current.testUserPermission(game.user,'OBSERVER')) fail('a linked Item is inaccessible.');
            if (isExcludedAcquisitionDocument(current) || (current.pack && isStarterTrainingGrant(current))) fail('a linked compendium Item is excluded from acquisition.');
            group.documents.add(current);
            const ids=[links(current).grantedBy?.id,...grants(current).map(edge=>edge?.id)].filter(Boolean);
            for (const id of ids) {
                const next=context.collection.get(id);
                if (!next) fail('a linked Item is missing from this source collection.');
                pending.push(next);
            }
            // Detect one-sided incoming links within this same established context.
            for (const other of context.collection.values()) if (related(other,current.id)) pending.push(other);
        }
    }
    for (const group of contexts.values()) {
        validateGraph([...group.documents].map(item=>item.toObject()));
        documents.push(...group.documents);
    }
    const ordered=[...new Set([...selected,...documents])];
    return {contexts, documents:ordered, snapshots:ordered.map(item=>item.toObject())};
}

function checkDestination({parent,pack}) {
    if (parent) {if (!parent.isOwner) fail('destination ownership is required.');}
    else if (pack) {
        const collection=game.packs.get(pack);
        if (!collection || collection.locked || !collection.testUserPermission(game.user,'OWNER')) fail('destination compendium is not writable.');
    }
    else if (!CONFIG.Item.documentClass.canUserCreate(game.user)) fail('permission to create world Items is required.');
}

/** Copy actual Documents, expanding only their own reciprocal components after explicit consent. */
export async function copySavedItemDocuments(selected, {parent=null,pack=null,changes={},addSource=false,save,keepId,...context}={}) {
    checkDestination({parent,pack});
    const initial=await collect(selected), selectedSet=new Set(selected);
    const extra=initial.documents.filter(item=>!selectedSet.has(item));
    if (extra.length) {
        const content=`<p>Copying ${selected.map(item=>escape(item.name)).join(', ')} also copies ${extra.length} linked Item(s) from ${[...initial.contexts.values()].map(group=>escape(group.name)).join(', ')}:</p><ul>${extra.map(item=>`<li>${escape(item.name)} (${escape(item.uuid)})</li>`).join('')}</ul><p>Destination: ${escape(parent?.name ?? pack ?? 'World Items')}. The saved relationships and selections will be preserved with new IDs.</p>`;
        const accepted=await Dialog.confirm({title:'Copy linked Items',content,yes:()=>true,no:()=>false,defaultYes:false});
        if (!accepted) return [];
    }
    checkDestination({parent,pack});
    const current=await collect(selected);
    if (initial.documents.length!==current.documents.length || initial.documents.some((item,i)=>item!==current.documents[i]) || JSON.stringify(initial.snapshots)!==JSON.stringify(current.snapshots)) fail('source changed while confirming; inspect it and retry.');
    const sources=[], idMaps=new Map();
    for (const group of current.contexts.values()) {
        const ids=new Map([...group.documents].map(item=>[item.id,foundry.utils.randomID()]));
        idMaps.set(group.key,ids);
    }
    for (const [index,item] of current.documents.entries()) {
        const group=[...current.contexts.values()].find(group=>group.documents.has(item)), ids=idMaps.get(group.key);
        let source=foundry.utils.deepClone(current.snapshots[index]);
        if (index===0) source=foundry.utils.mergeObject(source,changes,{insertKeys:false,performDeletions:true,inplace:true});
        source._id=ids.get(item.id);
        for (const edge of grants(source)) {if (!ids.has(edge.id)) fail('copy overrides changed a saved relationship.');edge.id=ids.get(edge.id);}
        if (links(source).grantedBy?.id) {const id=links(source).grantedBy.id;if (!ids.has(id)) fail('copy overrides changed a saved relationship.');links(source).grantedBy.id=ids.get(id);}
        if (addSource && selectedSet.has(item)) {source._stats??={};source._stats.duplicateSource=item.uuid;source._stats.exportSource=null;}
        sources.push(source);
    }
    validateGraph(sources);
    return CONFIG.Item.documentClass.createDocuments(sources,{...context,parent,pack,keepId:true});
}
