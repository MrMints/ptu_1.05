// NPC widget identities are document UUIDs plus an explicit local repeat ordinal.
// Labels remain presentation/search text and never resolve a selected document.
const uuidPattern=/^(?:Compendium\.[\w.-]+|Actor\.[\w]+)\.Item\.[\w]+$|^Item\.[\w]+$/;
const isUuid=value=>typeof value==='string'&&uuidPattern.test(value);
const repeatValue=(uuid,n)=>n===1?uuid:`${uuid}::repeat:${n}`;
function ordinal(value,uuid) {
    if(value===uuid)return 1;
    const suffix=typeof value==='string'&&value.startsWith(`${uuid}::repeat:`)?value.slice(uuid.length+9):'';
    const n=/^[1-9]\d*$/.test(suffix)?Number(suffix):null;
    return Number.isSafeInteger(n)&&n>=2?n:null;
}

export function documentOption(document,packLabel='') {
    const uuid=document.uuid;
    if(!isUuid(uuid))throw Error('NPC document option requires an exact Item UUID.');
    const source=document.system?.source;
    return {label:document.name,value:uuid,uuid,prerequisites:structuredClone(document.system?.prerequisites??[]),class:document.system?.class,
        sourceContext:[document.system?.class,typeof source==='string'?source:source?.value,packLabel,uuid].filter(Boolean).join(' | ')};
}

/** Copy-only adapter, including exact-UUID legacy selections. Ambiguous names stay unresolved. */
export function documentSelections(selections=[]) {
    const used=new Set();
    return Object.values(selections).map(selection=>{
        const uuid=isUuid(selection?.uuid)?selection.uuid:isUuid(selection?.value)?selection.value:null;
        if(!uuid)return {...selection,identityIssue:'document identity unestablished; select an exact source again'};
        let n=ordinal(selection.value,uuid)??1;
        while(used.has(repeatValue(uuid,n)))n++;
        const value=repeatValue(uuid,n);used.add(value);
        return {...selection,uuid,value};
    });
}

export function repeatDocumentOptions(options,selections) {
    const result=options.map(option=>({...option}));
    const selected=documentSelections(selections);
    const values=new Set(result.map(o=>o.value));
    const used=new Set(selected.map(o=>o.value));
    for(const selection of selected) {
        if(selection.identityIssue)continue;
        const base=options.find(o=>o.uuid===selection.uuid)??selection;
        const add=n=>{
            const value=repeatValue(selection.uuid,n);
            if(values.has(value))return;
            result.push({...base,originalLabel:base.originalLabel??base.label,label:`${base.originalLabel??base.label} (${n})`,value});values.add(value);
        };
        const current=ordinal(selection.value,selection.uuid);if(current>1)add(current);
        let next=2;while(used.has(repeatValue(selection.uuid,next)))next++;add(next);
    }
    return result;
}

export function subchoiceKey(selectionValue,index) {
    // Foundry form paths split on dots; percent encoding is reversible and collision-free.
    return `item-${encodeURIComponent(selectionValue).replaceAll('.','%2E')}-${index}`;
}

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function documentDropdownItem(option) {
    return `<div value="${escape(option.value)}" uuid="${escape(option.uuid)}" class="tagify__dropdown__item${option.crossClass?' crossclass':''}" tabindex="0" role="option"><span>${escape(option.label)}</span><small style="display:block;white-space:normal">${escape(option.sourceContext??option.uuid)}</small></div>`;
}

/** Keep Tagify's name-to-whitelist normalization out of document acquisition. */
export function documentTagify(Base) {
    return class extends Base {
        normalizeTags(input) {
            const options=this.settings.whitelist;
            const exact=(Array.isArray(input)?input:[input]).filter(tag=>tag&&typeof tag==='object'&&
                options.some(option=>option.value===tag.value&&option.uuid===tag.uuid));
            return exact.length ? super.normalizeTags(exact) : [];
        }
    };
}
