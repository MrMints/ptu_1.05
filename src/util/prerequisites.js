import {resolveSkillKey, normalizeSkillName, getSkillLabel, SKILLS} from './skills.js';
import {getDocumentSourceId} from './document-source.js';

const ranks = {pathetic:1, untrained:2, novice:3, adept:4, expert:5, master:6, virtuoso:8};
const rankPattern = Object.keys(ranks).join('|');
const single = new RegExp(`^(${rankPattern}) (.+?)(?: Rank)?(?: or higher)?$`, 'i');
const count = new RegExp(`^(?:any )?(\\w+) Skills? at (${rankPattern})(?: Rank)?(?: or higher)?$`, 'i');
const list = new RegExp(`^(?:any )?(\\w+)(?: Skills?)? of (.+) at (${rankPattern})(?: Rank)?(?: or higher)?$`, 'i');
const words = ['zero','one','two','three','four','five','six','seven','eight','nine'];
const number = text => /^\d+$/.test(text) ? Number(text) : text.toLowerCase() === 'a' ? 1 : words.indexOf(text.toLowerCase());
const copy = value => value === undefined ? undefined : structuredClone(value);
const result = (status, kind, details = {}) => ({status, kind, ...details});
const unknown = (reason, details = {}) => result('unverifiable', 'custom', {reason, ...details});
const finite = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value));
const rankValue = (actor, key) => {
    const value = actor?.system?.skills?.[key]?.value?.total;
    return finite(value) && Object.values(ranks).includes(Number(value)) ? Number(value) : null;
};
const items = actor => {
    if (actor?.items == null) return null;
    const collection = actor.items.contents ?? actor.items;
    if (!Array.isArray(collection) && typeof collection?.[Symbol.iterator] !== 'function') return null;
    return Array.from(collection, item => Array.isArray(item) ? item[1] : item);
};
const splitList = text => text.split(/\s+or\s+|,\s*(?:or\s+)?/i).filter(Boolean);

function skill(actor, key, required) {
    const actual = rankValue(actor,key);
    return result(actual === null ? 'unverifiable' : actual >= required ? 'satisfied' : 'unmet', 'skill',
        {skillKey:key, required, actual, ...(actual === null ? {reason:'missing-or-invalid-skill-rank'} : {})});
}

function countSkills(actor, keys, required, minimum) {
    const children = [...new Set(keys)].map(key => Object.hasOwn(SKILLS,key) ? skill(actor,key,minimum) : unknown('unknown-skill-name',{name:key.slice(1)}));
    const actual = children.filter(child => child.status === 'satisfied').length;
    const uncertain = children.filter(child => child.status === 'unverifiable').length;
    return result(actual >= required ? 'satisfied' : actual + uncertain < required ? 'unmet' : 'unverifiable',
        'count', {required, minimumRank:minimum, actual, uncertain, children});
}

/** Exact grammar only. Unknown/custom text remains advisory, never an invented skill or identity. */
export function evaluatePrerequisite(raw, {actor, references = {}, previousRank = null} = {}) {
    if (typeof raw !== 'string' || !raw.trim()) return {...unknown('missing-or-invalid-requirement'), raw:copy(raw)};
    const text = raw.trim().replace(/\s+/g,' ');
    let match;
    let evaluation;
    if (/^GM Permission$/i.test(text)) evaluation = unknown('gm-approval-not-evidenced');
    else if ((match = /^Level (\d+)(?: or higher)?$/i.exec(text))) {
        const value = actor?.system?.level?.current;
        const actual = finite(value) && Number(value) >= 1 ? Number(value) : null;
        evaluation = result(actual === null ? 'unverifiable' : actual >= Number(match[1]) ? 'satisfied' : 'unmet',
            'level', {required:Number(match[1]), actual, ...(actual === null ? {reason:'missing-or-invalid-level'} : {})});
    } else if ((match = list.exec(text)) && number(match[1]) > 0) {
        evaluation = countSkills(actor,splitList(match[2]).map(name=>resolveSkillKey(name) ?? `?${normalizeSkillName(name)}`),number(match[1]),ranks[match[3].toLowerCase()]);
    } else if ((match = count.exec(text)) && number(match[1]) > 0) {
        evaluation = countSkills(actor,Object.keys(SKILLS),number(match[1]),ranks[match[2].toLowerCase()]);
    } else if ((match = /^(?:any )?(\w+) of (.+)$/i.exec(text)) && number(match[1]) > 0) {
        const children = [...new Set(splitList(match[2]))].map(term=>evaluatePrerequisite(term,{actor,references}));
        // This grammar counts distinct evidenced Items, never arbitrary conditions/raw spellings.
        // Minimum skill counts have their own grammar above.
        if (children.some(child=>child.kind !== 'item')) evaluation = unknown('unresolved-item-count-identities',{children});
        else {
            const unique = [...new Map(children.map(child=>[child.requiredIdentity,child])).values()];
            const actual = unique.filter(child=>child.status === 'satisfied').length;
            const uncertain = unique.filter(child=>child.status === 'unverifiable').length;
            const required = number(match[1]);
            evaluation = result(actual >= required ? 'satisfied' : actual + uncertain < required ? 'unmet' : 'unverifiable','item-count',{required,actual,uncertain,children:unique});
        }
    } else if ((match = single.exec(text)) && resolveSkillKey(match[2])) {
        evaluation = skill(actor,resolveSkillKey(match[2]),ranks[match[1].toLowerCase()]);
    } else if (text.includes(',') && !(/\s+or\s+/i.test(text) && single.test(splitList(text)[0]) && splitList(text).slice(1).every(term=>resolveSkillKey(term)))) {
        evaluation = unknown('ambiguous-comma-compound',{children:splitList(text).map(term=>evaluatePrerequisite(term,{actor,references}))});
    } else if (/\s+or\s+/i.test(text)) {
        let inherited = previousRank;
        // Shared-rank lists with an explicit final OR follow core p.38's Grace wording.
        // A bare comma never establishes OR (or AND).
        const children = (text.includes(',') ? splitList(text) : text.split(/\s+or\s+/i)).map(term => {
            const child = evaluatePrerequisite(term,{actor,references,previousRank:inherited});
            if (child.kind === 'skill') inherited = child.required;
            return child;
        });
        evaluation = result(children.some(c=>c.status === 'satisfied') ? 'satisfied' : children.some(c=>c.status === 'unverifiable') ? 'unverifiable' : 'unmet', 'or', {children});
    } else if (previousRank && resolveSkillKey(text)) evaluation = skill(actor,resolveSkillKey(text),previousRank);
    else {
        // Caller-supplied references must come from an evidenced identity mapping, not item labels.
        const reference = references instanceof Map ? references.get(text) : Object.hasOwn(references,text) ? references[text] : undefined;
        const uuid = typeof reference === 'string' ? reference : reference?.uuid;
        const target = uuid ?? (/^(?:Compendium\.[\w.-]+|Actor\.[\w]+)\.Item\.[\w]+$|^Item\.[\w]+$/.test(text) ? text : null);
        if (target) {
            const owned = items(actor);
            const present = owned?.some(item => item.uuid === target || getDocumentSourceId(item) === target);
            evaluation = result(owned === null ? 'unverifiable' : present ? 'satisfied' : 'unmet', 'item',
                {requiredIdentity:target, ...(owned === null ? {reason:'missing-owned-item-collection'} : {})});
        } else evaluation = unknown('custom-or-unresolved-identity');
    }
    return {...evaluation, raw:copy(raw)};
}

/** Pure, synchronous interface for owned documents or snapshots. No lookups, writes, grants or permission bypass. */
export function diagnosePrerequisites({actor, item, selectedVersion, references = {}} = {}) {
    const data = item?.toObject?.() ?? item;
    const identity = {actorUuid:actor?.uuid ?? null, uuid:item?.uuid ?? null, id:item?.id ?? item?._id ?? null,
        sourceId:getDocumentSourceId(item) ?? null, name:item?.name ?? '', type:item?.type ?? null,
        source:copy(data?.system?.source ?? null), selectedVersion:copy(selectedVersion ?? null)};
    const attributionIssues = [];
    if (!(identity.uuid || identity.id || identity.sourceId)) attributionIssues.push('item-identity-unestablished');
    if (selectedVersion == null) attributionIssues.push('rule-version-unestablished');
    const raw = copy(data?.system?.prerequisites);
    const requirements = Array.isArray(raw) ? raw.map(value=>evaluatePrerequisite(value,{actor,references})) :
        [{...unknown('prerequisite-list-missing-or-invalid'),raw}];
    return {schemaVersion:1, advisory:true, identity, rawRequirements:raw, attributionIssues, requirements,
        satisfied:requirements.filter(r=>r.status === 'satisfied'), unmet:requirements.filter(r=>r.status === 'unmet'),
        unverifiable:requirements.filter(r=>r.status === 'unverifiable')};
}

function detail(requirement) {
    if (requirement.kind === 'skill') return `${getSkillLabel(requirement.skillKey)}: requires ${requirement.required}, current ${requirement.actual ?? 'unverifiable'}`;
    if (requirement.kind === 'level') return `level: requires ${requirement.required}, current ${requirement.actual ?? 'unverifiable'}`;
    if (requirement.children) return requirement.children.map(detail).join('; ');
    if (requirement.kind === 'item') return `required item ${requirement.requiredIdentity}`;
    return requirement.reason;
}

/** Existing NPC warning panel adapter. Consumers must render strings as text, never unescaped HTML. */
export function formatPrerequisiteDiagnostics(report) {
    const id = report.identity;
    const version = id.selectedVersion;
    const attribution = `${id.name || 'Selected item'} [${id.uuid ?? id.sourceId ?? id.id ?? 'identity unestablished'}; source ${typeof id.source === 'string' ? id.source : id.source?.value ?? 'unestablished'}; version ${typeof version === 'string' ? version : version?.label ?? version?.id ?? 'unestablished'}]`;
    const format = (r, label) => `${attribution}: ${label} ${typeof r.raw === 'string' ? r.raw : JSON.stringify(r.raw) ?? '(missing requirement)'} (${detail(r)}).`;
    return {unmet:report.unmet.map(r=>format(r,'Unmet:')),
        unknown:[...report.unverifiable.map(r=>format(r,'Unverifiable:')), ...report.attributionIssues.map(reason=>`${attribution}: Unverifiable: ${reason}.`)]};
}
