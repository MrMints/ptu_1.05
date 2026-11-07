import {lookupSelectedRuleVersion, ruleVersionMetadataErrors} from './rule-versions.js';
import {matchRuleVersionRegistry} from './rule-version-registry.js';
import {previewRuleVersionReplacement} from './rule-version-preview.js';

const absent = Symbol('unavailable-data');
const own = (value,key) => Object.hasOwn(value,key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const plain = value => object(value) && [Object.prototype,null].includes(Object.getPrototypeOf(value));
const uuid = value => typeof value === 'string' && /^(?:Compendium\.[\w-]+\.[\w-]+\.(?:Item\.)?|Item\.|Actor\.[\w]+\.Item\.)[A-Za-z0-9]{16}$/.test(value);
const issue = (path,reason) => ({path,reason});
const property = (target,key,value) => Object.defineProperty(target,key,{value,enumerable:true,writable:true,configurable:true});

// Read only descriptors. In particular, never enumerate a sparse length, call a
// getter/iterator, or use a document's toObject/toJSON interface.
function arraySlots(value,path) {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return {issues:[issue(path,'dense-plain-array-required')]};
    const keys = Reflect.ownKeys(value), indices = new Set(), issues = [];
    const length = Object.getOwnPropertyDescriptor(value,'length').value;
    for (const key of keys) {
        if (key === 'length') continue;
        if (typeof key !== 'string') {issues.push(issue(path,'symbol-key'));continue;}
        const index = Number(key);
        if (!Number.isInteger(index) || index < 0 || index >= 4294967295 || String(index) !== key) {issues.push(issue([...path,key],'non-array-index'));continue;}
        indices.add(index);
        const descriptor = Object.getOwnPropertyDescriptor(value,key);
        if (!descriptor.enumerable || !own(descriptor,'value')) issues.push(issue([...path,key],'non-data-property'));
    }
    if (indices.size !== length) {
        let missing = 0;while (indices.has(missing)) missing++;
        issues.push(issue([...path,String(missing)],'sparse-array'));
    }
    return issues.length ? {issues} : {issues,values:Array.from({length},(_,index)=>Object.getOwnPropertyDescriptor(value,String(index)).value)};
}

function data(value,path = [],ancestors = new Set()) {
    if (value === null || ['string','boolean'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) return {value,issues:[]};
    if (typeof value !== 'object') return {value:absent,issues:[issue(path,value === absent || value === undefined ? 'input-missing' : 'not-serialized-data')]};
    if (ancestors.has(value)) return {value:absent,issues:[issue(path,'cyclic-data')]};
    const next = new Set(ancestors).add(value);
    if (Array.isArray(value)) {
        const slots = arraySlots(value,path);
        if (slots.issues.length) return {value:absent,issues:slots.issues};
        const children = slots.values.map((entry,index)=>data(entry,[...path,String(index)],next));
        const issues = children.flatMap(child=>child.issues);
        return {value:issues.length ? absent : children.map(child=>child.value),issues};
    }
    if (!plain(value)) return {value:absent,issues:[issue(path,'plain-object-required')]};
    const result = {}, issues = [];
    for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== 'string') {issues.push(issue(path,'symbol-key'));continue;}
        const descriptor = Object.getOwnPropertyDescriptor(value,key);
        if (!descriptor.enumerable || !own(descriptor,'value')) {issues.push(issue([...path,key],'non-data-property'));continue;}
        const child = data(descriptor.value,[...path,key],next);issues.push(...child.issues);
        if (child.value !== absent) property(result,key,child.value);
    }
    return {value:result,issues};
}

function read(value) {
    try {const result = data(value);return {...result,available:result.issues.length === 0};}
    catch {return {available:false,value:absent,issues:[issue([],'serialized-data-unreadable')]};}
}

function request(options) {
    const values = {}, provided = new Set(), issues = [];
    const keys = ['owned','incoming','actor','registry','versions','mechanicChoices','references'];
    try {
        if (!plain(options)) return {values,provided,issues:[{input:'request',...issue([],'plain-request-required')}]};
        for (const key of Reflect.ownKeys(options)) {
            if (typeof key !== 'string') {issues.push({input:'request',...issue([],'symbol-key')});continue;}
            if (!keys.includes(key)) {issues.push({input:'request',...issue([key],'unknown-option')});continue;}
            provided.add(key);
            const descriptor = Object.getOwnPropertyDescriptor(options,key);
            if (!descriptor.enumerable || !own(descriptor,'value')) issues.push({input:'request',...issue([key],'request-field-not-data')});
            else property(values,key,descriptor.value);
        }
    } catch {issues.push({input:'request',...issue([],'request-unreadable')});}
    return {values,provided,issues};
}

function item(value,index,lookupOptions) {
    const input = read(value), snapshot = input.value === absent ? null : input.value, issues = [...input.issues];
    if (!object(snapshot)) issues.push(issue([],'feature-snapshot-required'));
    else {
        if (own(snapshot,'toObject')) issues.push(issue(['toObject'],'live-interface-not-allowed'));
        if (snapshot.type !== 'feat') issues.push(issue(['type'],'feature-type-required'));
        if (own(snapshot,'name') && typeof snapshot.name !== 'string') issues.push(issue(['name'],'item-name-invalid'));
        if (!uuid(snapshot.uuid)) issues.push(issue(['uuid'],'explicit-item-uuid-required'));
        const id = typeof snapshot.uuid === 'string' ? snapshot.uuid.split('.').at(-1) : null;
        for (const key of ['id','_id']) if (own(snapshot,key) && snapshot[key] !== id) issues.push(issue([key],'item-id-uuid-conflict'));
    }
    return {index,snapshotAvailable:input.available && object(snapshot),snapshot,inputIssues:issues,
        attribution:issues.length ? null : lookupSelectedRuleVersion(snapshot,lookupOptions)};
}

function collection(value,lookupOptions) {
    if (value === absent || value === undefined) return {status:'unavailable',count:null,inputIssues:[issue([],'collection-input-missing')],entries:[]};
    let slots;
    try {slots = arraySlots(value,[]);} catch {slots = {issues:[issue([],'collection-unreadable')]};}
    if (slots.issues.length) return {status:'unavailable',count:null,inputIssues:slots.issues,entries:[]};
    const entries = slots.values.map((entry,index)=>item(entry,index,lookupOptions));
    return {status:entries.some(entry=>entry.inputIssues.length) ? 'invalid-entries' : 'complete',count:entries.length,
        inputIssues:entries.flatMap(entry=>entry.inputIssues.map(value=>({...value,path:[String(entry.index),...value.path]}))),entries};
}

function actorContext(value) {
    const input = read(value), snapshot = input.value === absent ? null : input.value, issues = [...input.issues];
    if (!object(snapshot)) return {status:'unavailable',snapshotAvailable:false,snapshot,inputIssues:[...issues,issue([],'actor-snapshot-required')],membership:'unavailable'};
    const diagnostic = {...snapshot};
    if (own(snapshot,'toObject')) {issues.push(issue(['toObject'],'live-interface-not-allowed'));delete diagnostic.toObject;}
    const wrapper = !Array.isArray(snapshot.items) && plain(snapshot.items);
    const membership = Array.isArray(snapshot.items) ? snapshot.items : wrapper ? snapshot.items.contents : null;
    const membershipPath = wrapper ? ['items','contents'] : ['items'];
    if (!Array.isArray(membership)) issues.push(issue(membershipPath,'actor-items-array-required'));
    else for (const [index,entry] of membership.entries()) {
        if (!plain(entry)) issues.push(issue([...membershipPath,String(index)],'actor-item-snapshot-required'));
        else if (own(entry,'toObject')) issues.push(issue([...membershipPath,String(index),'toObject'],'live-interface-not-allowed'));
    }
    const known = !issues.some(value=>value.path[0] === 'items') && Array.isArray(membership)
        && membership.every(entry=>plain(entry) && !own(entry,'toObject'));
    if (!known) issues.push(issue(['items'],'actor-items-unavailable'));
    return {status:issues.length ? 'partial' : 'complete',snapshotAvailable:input.available,snapshot,inputIssues:issues,
        membership:known ? 'known' : 'unavailable',diagnostic:{...diagnostic,items:known ? snapshot.items : null}};
}

/** Pure Feature-only inspection of explicit serialized owned/incoming arrays.
 * Results are evidence, never acquisition permission or an executable plan. */
export function inspectFeatureVersionAcquisition(options = {}) {
    const root = request(options), {values,provided} = root;
    const contextIssues = [...root.issues], inputs = {};
    const present = key => provided.has(key) && own(values,key);
    const value = key => present(key) ? values[key] : absent;
    const hasRegistry = provided.has('registry'), hasVersions = provided.has('versions');
    if (!hasRegistry && !hasVersions) contextIssues.push({input:'mappings',path:[],reason:'version-mappings-unavailable'});
    for (const key of ['registry','versions','references','mechanicChoices']) {
        const fallback = ['references','mechanicChoices'].includes(key) && (!provided.has(key) || present(key) && values[key] === undefined) ? {} : absent;
        const optionalDefault = ['references','mechanicChoices'].includes(key) && present(key) && values[key] === undefined;
        inputs[key] = read(value(key) === absent || optionalDefault ? fallback : values[key]);
        if (provided.has(key) || ['references','mechanicChoices'].includes(key)) contextIssues.push(...inputs[key].issues.map(v=>({input:key,...v})));
    }
    const lookupOptions = {...(hasRegistry ? {registry:inputs.registry.available ? inputs.registry.value : null} : {}),
        ...(!hasRegistry || hasVersions ? {versions:hasVersions && inputs.versions.available ? inputs.versions.value : []} : {})};
    if (hasRegistry) {
        // The matcher checks registry integrity before this deliberately absent identity.
        // No fabricated document identity or default registry is used for validation.
        const validation = matchRuleVersionRegistry(lookupOptions.registry,null);
        contextIssues.push(...validation.issues.filter(reason=>reason !== 'registry-document-identity-invalid').map(reason=>({input:'registry',path:[],reason})));
    }
    if (hasVersions && inputs.versions.available) {
        if (!Array.isArray(inputs.versions.value)) contextIssues.push({input:'versions',path:[],reason:'versions-not-array'});
        else for (const [index,record] of inputs.versions.value.entries()) contextIssues.push(...ruleVersionMetadataErrors(record).map(reason=>({input:'versions',path:[String(index)],reason})));
    }
    const actor = actorContext(value('actor'));
    contextIssues.push(...actor.inputIssues.map(v=>({input:'actor',...v})));
    const previewOptions = {actor:actor.diagnostic, ...lookupOptions,
        references:inputs.references.available ? inputs.references.value : null,
        mechanicChoices:inputs.mechanicChoices.available ? inputs.mechanicChoices.value : null};
    const baseline = previewRuleVersionReplacement(previewOptions);
    contextIssues.push(...baseline.contextIssues);
    const owned = collection(value('owned'),lookupOptions), incoming = collection(value('incoming'),lookupOptions);
    const usable = entry => entry.inputIssues.length === 0 ? entry.snapshot : undefined;
    const candidates = incoming.entries.map(entry=>{
        const preview = previewRuleVersionReplacement({...previewOptions,current:usable(entry),candidate:usable(entry)});
        return {...entry,prerequisites:preview.prerequisites,prerequisiteContextIssues:[...actor.inputIssues.map(v=>({input:'actor',...v})),...preview.contextIssues],mechanics:preview.mechanics};
    });
    function pair(current,candidate) {
        const preview = previewRuleVersionReplacement({...previewOptions,current:usable(current),candidate:usable(candidate)});
        const relation = preview.relationship;
        return {relationship:relation.status === 'same-selection' ? {...relation,status:'same-version',selectionRelationship:'same-selection'} : relation,
            differences:preview.differences, inputIssues:{current:current.inputIssues,candidate:candidate.inputIssues},
            identities:{current:current.attribution?.identity ?? null,candidate:candidate.attribution?.identity ?? null},
            versions:{current:current.attribution?.selectedVersion ?? null,candidate:candidate.attribution?.selectedVersion ?? null},contextIssues:preview.contextIssues};
    }
    const ownedComparisons = candidates.flatMap(candidate=>owned.entries.map(current=>({candidateIndex:candidate.index,ownedIndex:current.index,...pair(current,candidate)})));
    const candidateComparisons = candidates.flatMap((current,index)=>candidates.slice(index+1).map(candidate=>({firstIndex:current.index,secondIndex:candidate.index,...pair(current,candidate)})));
    const summary = input => ({status:input.status,count:input.count,inputIssues:input.inputIssues});
    const result = {schemaVersion:1,inspectionOnly:true,collections:{owned:summary(owned),incoming:summary(incoming)},
        actor:{status:actor.status,snapshotAvailable:actor.snapshotAvailable,snapshot:actor.snapshot,membership:actor.membership,inputIssues:actor.inputIssues},
        mappingMode:hasRegistry && hasVersions ? 'conflicting' : hasRegistry ? 'registry' : hasVersions ? 'exact' : 'unavailable',
        owned:owned.entries,candidates,ownedComparisons,candidateComparisons,contextIssues,
        traversal:{ownedComplete:owned.status === 'complete',incomingComplete:incoming.status === 'complete',ownedPairCount:ownedComparisons.length,incomingPairCount:candidateComparisons.length},
        outsideReview:['actual-membership-verification','ownership-and-permissions','production-source-approval','acquisition-scope',
            'duplicate-benefit-prevention','state-transfer-and-replacement','repeat-and-stacking-policy','effect-use-authorization','live-consumer-integration']};
    // Return a detached JSON-compatible graph, with no references to caller data.
    return structuredClone(result);
}
