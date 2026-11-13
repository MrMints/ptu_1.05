import {createRuleVersionRegistry} from './rule-version-registry.js';
import {previewRuleVersionReplacement} from './rule-version-preview.js';

// An isolated inspection protocol. Nothing in this module is an Item update or an authority check.
const CANONICAL = 'UKk9BnAZtm1xMoRB';
const PAIR = {
    core:{id:'ViZpn17qLA4ACQGa', version:'celnYjQjM3jjtAnZ', label:'PTU 1.05 supplied core',
        hash:'1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289',
        authority:'r04-s12', edition:'PTU 1.05 supplied core', date:null, page:140,
        path:'Core System/Pokemon Tabletop United 1.05 Core.pdf', definition:'core:140:feature-line35',
        evidence:'f126c984f96400ae0c953d2d112e4f5999e25eb23f3af851297f00870be82d80'},
    may:{id:'e9dQ3NmVm7EuQBO5', version:'i1OAz3lvuCRIm3n9', label:'May 2015 playtest (optional)',
        hash:'98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54',
        authority:'r04-s02', edition:'May 2015 playtest', date:'2015-05', page:7,
        path:'Core System/1.05 Errata/PTU May 2015 Playtest Packet.pdf', definition:'may:7:feature-line27',
        evidence:'c5a578cd887346c246030350b3ee93e2bab83c5c94dc824e813c15e62c566e89'}
};
const PARENT = 'Researcher — General Research Field (core pp.139–140). Choose two Fields; the parent grants one qualifying Feature, restricts later selections to those Fields, and may repeat with two different Fields. Parent selection and owned grouping remain unverified/manual. This context adds no leaf prerequisite or automatic grant.';
const ACKS = ['legacy-only-current', 'legacy-conflict-retained', 'opaque-legacy-retained',
    'custom-leaf-replacement', 'automation-preservation-reported', 'grant-preservation-reported',
    'other-instances-preserved', 'selection-created'];
const CHOICES = {leaf:['unreviewed', 'replace-reviewed'], automation:['unreviewed', 'preserve-reviewed'],
    grants:['unreviewed', 'preserve-reviewed'], otherInstances:['unreviewed', 'preserve-all'],
    presentation:['preserve'], legacy:['preserve-raw'], usage:['preserve-raw']};
const LIVE = ['live-identity-and-membership', 'current-user-and-parent-item-authority', 'stock-provider-and-runtime',
    'supported-scope', 'candidate-installation-and-access', 'history-outcome-reconciliation',
    'callback-isolation', 'combat-exclusion-or-substantiation', 'persistence-and-readback'];
const own = (o, k) => o !== null && typeof o === 'object' && Object.hasOwn(o, k);
const object = o => o !== null && typeof o === 'object' && !Array.isArray(o);
const hex = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const id = x => typeof x === 'string' && /^[A-Za-z0-9]{16}$/.test(x);
const role = x => x === 'core' || x === 'may';
const lexical = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const clone = value => structuredClone(value);
function freeze(value) {
    if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
    return value;
}
function fail(code, path = [], review = false) {throw {protocolFailure:true, code, path, review};}
function exact(value, keys, path) {
    if (!object(value) || Object.keys(value).length !== keys.length || keys.some(k => !own(value, k))) fail('record-shape', path);
}
function oneOf(value, options, path) {if (!options.includes(value)) fail('protocol-value', path);}

// Validate scalar Unicode rather than allowing TextEncoder's replacement of isolated surrogates.
function utf8(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff) {
            const lo = text.charCodeAt(++i);
            if (!(lo >= 0xdc00 && lo <= 0xdfff)) fail('unicode-scalar');
            c = 0x10000 + ((c - 0xd800) << 10) + lo - 0xdc00;
        } else if (c >= 0xdc00 && c <= 0xdfff) fail('unicode-scalar');
        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) bytes.push(0xc0 | c >> 6, 0x80 | c & 63);
        else if (c < 0x10000) bytes.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
        else bytes.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
    }
    return bytes;
}
const SHA_K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256(text) {
    const b = utf8(text), bits = b.length * 8, h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    b.push(128); while (b.length % 64 !== 56) b.push(0);
    for (let i = 7; i >= 0; i--) b.push(Math.floor(bits / 2 ** (8 * i)) & 255);
    const rotr = (n, r) => n >>> r | n << (32 - r), w = new Array(64);
    for (let p = 0; p < b.length; p += 64) {
        for (let i = 0; i < 16; i++) w[i] = b[p + i * 4] << 24 | b[p + i * 4 + 1] << 16 | b[p + i * 4 + 2] << 8 | b[p + i * 4 + 3];
        for (let i = 16; i < 64; i++) {
            const x = w[i - 15], y = w[i - 2];
            w[i] = (w[i - 16] + (rotr(x,7) ^ rotr(x,18) ^ x >>> 3) + w[i - 7] + (rotr(y,17) ^ rotr(y,19) ^ y >>> 10)) | 0;
        }
        let [a,c,d,e,f,g,j,k] = h;
        for (let i = 0; i < 64; i++) {
            const t = (k + (rotr(f,6) ^ rotr(f,11) ^ rotr(f,25)) + ((f & g) ^ (~f & j)) + SHA_K[i] + w[i]) | 0;
            const u = ((rotr(a,2) ^ rotr(a,13) ^ rotr(a,22)) + ((a & c) ^ (a & d) ^ (c & d))) | 0;
            k=j; j=g; g=f; f=(e+t)|0; e=d; d=c; c=a; a=(t+u)|0;
        }
        [a,c,d,e,f,g,j,k].forEach((v,i) => {h[i] = (h[i] + v) | 0;});
    }
    return h.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}
// Emit members explicitly: constructing a sorted object would reorder integer-like keys again.
function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (object(value)) return '{' + Object.keys(value).sort(lexical).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value);
}
const H = value => sha256(canonical(value));
const J = value => sha256(JSON.stringify(value));
const same = (a,b) => canonical(a) === canonical(b);

// Small bounded decoder. It detects decoded duplicate keys and numerical loss BEFORE materialization.
// Embedded JSON is parsed separately using the SAME aggregate node budget, without a reviver.
function decode(raw, maxBytes, budget, path, protocol = false) {
    if (typeof raw !== 'string') fail('json-text-required', path);
    if (utf8(raw).length > maxBytes) fail('json-byte-limit', path);
    let pos = 0;
    const ws = () => {while (/[\x20\x09\x0a\x0d]/.test(raw[pos] ?? '') && pos < raw.length) pos++;};
    const str = key => {
        const start = pos++;
        while (pos < raw.length) {
            const c = raw[pos++];
            if (c === '\\') {pos++; continue;}
            if (c !== '"') continue;
            let s; try {s = JSON.parse(raw.slice(start,pos));} catch {fail('json-syntax', path);}
            const n = utf8(s).length;
            if (n > (key ? 256 : protocol ? 1048576 : 32768)) fail(key ? 'key-byte-limit' : 'scalar-byte-limit', path);
            return s;
        }
        fail('json-syntax', path);
    };
    const value = depth => {
        ws(); if (depth > 24) fail('depth-limit', path);
        if (++budget.nodes > 32768) fail('node-limit', path);
        const c = raw[pos];
        if (c === '"') return str(false);
        if (c === '{') {
            pos++; ws(); const result = Object.create(null), keys = new Set();
            if (raw[pos] === '}') {pos++; return result;}
            while (true) {
                if (raw[pos] !== '"') fail('json-syntax', path);
                const k = str(true); ws(); if (raw[pos++] !== ':') fail('json-syntax', path);
                if (keys.has(k)) fail('duplicate-key', path);
                if (['__proto__','prototype','constructor'].includes(k)) fail('unsafe-property', path);
                keys.add(k); const v = value(depth + 1);
                if (protocol && typeof v === 'string' && !['valueJson', 'itemJson'].includes(k) && utf8(v).length > 32768) fail('scalar-byte-limit', path);
                if (typeof v === 'string' && ['uuid','actorUuid','itemUuid','sourceUuid','documentUuid','label'].includes(k) && utf8(v).length > 256) fail('identity-or-label-byte-limit', path);
                Object.defineProperty(result,k,{value:v,enumerable:true,writable:true,configurable:true});
                ws(); const end = raw[pos++]; if (end === '}') break;
                if (end !== ',') fail('json-syntax', path); ws();
            }
            return result;
        }
        if (c === '[') {
            pos++; ws(); const result = [];
            if (raw[pos] === ']') {pos++; return result;}
            while (true) {
                result.push(value(depth + 1)); ws(); const end = raw[pos++];
                if (end === ']') break; if (end !== ',') fail('json-syntax', path);
            }
            return result;
        }
        for (const [token,v] of [['true',true],['false',false],['null',null]]) if (raw.startsWith(token,pos)) {pos += token.length; return v;}
        const m = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(raw.slice(pos));
        if (!m) fail('json-syntax', path);
        const token = m[0], n = Number(token); pos += token.length;
        if (!Number.isFinite(n) || Number.isInteger(n) && !Number.isSafeInteger(n) || JSON.stringify(n) !== token) fail('numeric-representation', path, !protocol);
        if (protocol && !Number.isSafeInteger(n)) fail('protocol-integer', path);
        return n;
    };
    const result = value(0); ws(); if (pos !== raw.length) fail('json-syntax', path);
    return result;
}
function mappingFor(r) {
    const p = PAIR[r];
    return {schemaVersion:1,documentUuid:`Compendium.ptu.feats.Item.${p.id}`,type:'feat',generationEligibility:'eligible',
        version:{id:p.version,label:p.label,kind:r === 'core' ? 'original' : 'revised'},
        canonical:{id:CANONICAL,evidence:`Owner-approved complete core140/May7 Echoes pair; ${p.definition}; ${p.evidence}; separate Researcher parent context.`},
        source:{id:p.authority,edition:p.edition,status:r === 'core' ? 'core' : 'optional-playtest',publicationDate:p.date,
            citation:`${p.path}, printed/PDF p.${p.page}`}};
}
const sourceUuid = r => mappingFor(r).documentUuid;
function pointerRole(value) {
    return Object.keys(PAIR).find(r => value === sourceUuid(r) || value === sourceUuid(r).replace('.Item.', '.')) ?? null;
}
function choicesValid(value, path) {
    exact(value, Object.keys(CHOICES), path);
    for (const [k, options] of Object.entries(CHOICES)) oneOf(value[k], options, [...path,k]);
}
const observed = (o, path) => {
    let v = o;
    for (const k of path) {if (!own(v,k)) return {state:'absent'}; v = v[k];}
    return {state:'present',valueJson:JSON.stringify(v)};
};
function summary(cell, value, allowed) {
    if (cell.state !== 'present') return clone(cell);
    if (value === null || allowed(value)) return {state:'present',type:value === null ? 'null' : typeof value,value:clone(value)};
    const text = JSON.stringify(value);
    return {state:'present',type:Array.isArray(value) ? 'array' : typeof value,byteLength:utf8(text).length,
        sha256:sha256(text),disposition:'retained-in-place'};
}
function publicSelection(cell, value) {
    if (cell.state !== 'present' || value === null || typeof value === 'string') {
        return summary(cell,value,x => Object.values(PAIR).some(p => x === p.version));
    }
    if (!object(value)) return null;
    const p = Object.values(PAIR).find(p => value.id === p.version);
    if (!p || own(value,'label') && value.label !== null && value.label !== p.label) return null;
    const rest = clone(value); delete rest.id; delete rest.label;
    return {state:'present',type:'selection',id:value.id,label:observed(value,['label']),whole:H(value),untouched:H(rest)};
}
function validateSummary(v, selection = false, opaque = false) {
    if (!object(v)) fail('history-privacy-shape',['history']);
    if (v.state === 'absent') {exact(v,['state'],['history']); return;}
    if (v.state !== 'present') fail('history-privacy-shape',['history']);
    if (v.type === 'selection' && selection) {
        exact(v,['state','type','id','label','whole','untouched'],['history']);
        const p = Object.values(PAIR).find(p => p.version === v.id);
        if (!p || !hex(v.whole) || !hex(v.untouched)) fail('history-selection',['history']);
        if (v.label?.state === 'absent') exact(v.label,['state'],['history']);
        else if (v.label?.state === 'present') {
            exact(v.label,['state','valueJson'],['history']);
            if (v.label.valueJson !== 'null' && v.label.valueJson !== JSON.stringify(p.label)) fail('history-selection',['history']);
        } else fail('history-selection',['history']);
        return;
    }
    if (own(v,'value')) {
        exact(v,['state','type','value'],['history']);
        if (v.type === 'null' && v.value === null) return;
        if (v.type === 'string' && (selection ? Object.values(PAIR).some(p => p.version === v.value) : pointerRole(v.value))) return;
    } else {
        exact(v,['state','type','byteLength','sha256','disposition'],['history']);
        if (['string','number','boolean','object','array'].includes(v.type) && Number.isSafeInteger(v.byteLength)
            && v.byteLength >= 0 && v.byteLength <= 262144 && hex(v.sha256) && v.disposition === 'retained-in-place' && opaque) return;
    }
    fail('history-privacy-shape',['history']);
}
const emptyLedger = () => ({schemaVersion:1,canonicalId:CANONICAL,entries:[]});
function validateLedger(ledger, selection) {
    if (!object(ledger)) fail('history-shape',['history']);
    if (ledger.schemaVersion !== 1) fail('history-version',['history'],true);
    exact(ledger,['schemaVersion','canonicalId','entries'],['history']);
    if (ledger.canonicalId !== CANONICAL || !Array.isArray(ledger.entries)) fail('history-shape',['history']);
    if (ledger.entries.length > 32 || utf8(canonical(ledger)).length > 65536) fail('history-limit',['history']);
    const seen = new Set(), prefix = emptyLedger();
    for (const [i,e] of ledger.entries.entries()) {
        exact(e,['sequence','kind','operationId','instance','from','to','choices','bindings'],['history']);
        if (utf8(canonical(e)).length > 4096) fail('history-entry-limit',['history']);
        if (e.sequence !== i+1 || e.kind !== 'intent' || !hex(e.operationId)) fail('history-entry-shape',['history']);
        exact(e.instance,['actorUuid','itemUuid','itemId'],['history']);
        if (!same(e.instance,{actorUuid:selection.actorUuid,itemUuid:selection.itemUuid,itemId:selection.itemId})) fail('history-instance',['history']);
        exact(e.from,['role','definitionSha256','modern','legacy','selection'],['history']);
        if (!role(e.from.role) || e.from.definitionSha256 !== PAIR[e.from.role].hash) fail('history-definition',['history']);
        validateSummary(e.from.modern); validateSummary(e.from.legacy,false,true); validateSummary(e.from.selection,true);
        const modernRole = pointerRole(e.from.modern.value), legacyRole = pointerRole(e.from.legacy.value);
        if (modernRole ? modernRole !== e.from.role : legacyRole !== e.from.role) fail('history-attribution',['history']);
        const previousSelection = e.from.selection.type === 'selection' ? e.from.selection.id : e.from.selection.value;
        if (previousSelection != null && previousSelection !== PAIR[e.from.role].version) fail('history-selection',['history']);
        exact(e.to,['role','itemId','sourceUuid','versionId','label','definitionSha256'],['history']);
        if (!role(e.to.role) || e.to.role === e.from.role) fail('history-definition',['history']);
        const p = PAIR[e.to.role];
        if (!same(e.to,{role:e.to.role,itemId:p.id,sourceUuid:sourceUuid(e.to.role),versionId:p.version,label:p.label,definitionSha256:p.hash})) fail('history-definition',['history']);
        exact(e.choices,[...Object.keys(CHOICES),'acknowledgedCodes'],['history']);
        const ch = clone(e.choices); delete ch.acknowledgedCodes; choicesValid(ch,['history']);
        const codes = e.choices.acknowledgedCodes;
        if (!Array.isArray(codes) || codes.some(c => !ACKS.includes(c)) || !same(codes,[...new Set(codes)].sort(lexical))) fail('history-acknowledgements',['history']);
        exact(e.bindings,['before','protected','context','historyBefore','review'],['history']);
        if (Object.values(e.bindings).some(x => !hex(x)) || e.bindings.historyBefore !== H(prefix)) fail('history-prefix',['history']);
        const without = clone(e); delete without.operationId;
        if (H(without) !== e.operationId || seen.has(e.operationId)) fail('history-collision-or-digest',['history']);
        seen.add(e.operationId); prefix.entries.push(e);
    }
    return ledger;
}
function blank() {
    return {schemaVersion:1,kind:'ptu-echoes-replacement-report',status:'refused',inspectionOnly:true,bindings:null,
        attribution:null,fieldDecisions:null,preservationRequirements:null,prerequisites:null,historyIntent:null,
        issues:[],applicationConditions:LIVE.map(code => ({code,status:'unresolved'}))};
}
function finish(report) {
    if (utf8(JSON.stringify(report)).length > 1048576) {
        const bounded = blank(); bounded.issues.push({code:'output-byte-limit',path:[]}); return freeze(bounded);
    }
    return freeze(report);
}

/** Exactly one primitive JSON string; detached, frozen, descriptive output only. No consumer is registered. */
export function planEchoesReplacement(requestJson) {
    const out = blank();
    try {
        if (arguments.length !== 1 || typeof requestJson !== 'string') fail('one-json-string-required');
        const budget = {nodes:0}, r = decode(requestJson,1048576,budget,[],true), cache = new Map();
        exact(r,['schemaVersion','kind','selection','before','approved','context','history','review'],[]);
        if (r.schemaVersion !== 1 || r.kind !== 'ptu-echoes-replacement-request') fail('request-version');
        const pending = (code,path) => out.issues.push({code,path});
        const evidence = (cell,limit,path) => {
            if (cache.has(cell)) return cache.get(cell);
            if (!object(cell)) fail('evidence-shape',path);
            let v;
            if (cell.state === 'present') {exact(cell,['state','valueJson'],path); v = decode(cell.valueJson,limit,budget,path);}
            else if (cell.state === 'absent') exact(cell,['state'],path);
            else if (cell.state === 'unavailable') {exact(cell,['state','reason'],path); oneOf(cell.reason,['capture-unavailable','not-supplied','redacted'],path);}
            else if (cell.state === 'unknown') {exact(cell,['state','reason'],path); oneOf(cell.reason,['unclassified'],path);}
            else fail('evidence-shape',path);
            cache.set(cell,v); return v;
        };
        exact(r.selection,['actorId','actorUuid','itemId','itemUuid','targetRole'],['selection']);
        const s = r.selection;
        if (!id(s.actorId) || !id(s.itemId) || s.actorUuid !== `Actor.${s.actorId}` || s.itemUuid !== `${s.actorUuid}.Item.${s.itemId}` || !role(s.targetRole)) fail('selection-identity',['selection']);
        exact(r.before,['actor','membership','items','lifecycle'],['before']);
        const {actor,membership,items,lifecycle} = r.before;
        exact(actor,['id','uuid','type','pack','tokenAncestor'],['before','actor']);
        if (actor.id !== s.actorId || actor.uuid !== s.actorUuid || !['character','pokemon'].includes(actor.type)) fail('actor-identity',['before','actor']);
        for (const k of ['pack','tokenAncestor']) {
            const v = evidence(actor[k],1024,['before','actor',k]);
            if (actor[k].state === 'present' && v !== null) fail('non-world-actor',['before','actor',k]);
            if (!['present','absent'].includes(actor[k].state)) pending('world-context-unverified',['before','actor',k]);
        }
        exact(lifecycle,['state','relatedIntent'],['before','lifecycle']);
        oneOf(lifecycle.state,['reported-unattempted','in-flight','uncertain','unknown'],['before','lifecycle']);
        if (lifecycle.relatedIntent !== null && !hex(lifecycle.relatedIntent)) fail('lifecycle-reference',['before','lifecycle']);
        exact(membership,['coverage','entries'],['before','membership']);
        if (membership.coverage !== 'all-items' || !Array.isArray(membership.entries) || membership.entries.length > 1024) fail('membership-coverage-or-limit',['before','membership']);
        if (!Array.isArray(items) || items.length > 64) fail('source-collection-limit',['before','items']);
        const members = new Map(), sources = new Map();
        for (const m of membership.entries) {
            exact(m,['id','uuid','type'],['before','membership']);
            if (!id(m.id) || m.uuid !== `${s.actorUuid}.Item.${m.id}` || typeof m.type !== 'string' || !m.type || utf8(m.type).length > 256 || members.has(m.id)) fail('membership-identity',['before','membership']);
            members.set(m.id,m);
        }
        for (const row of items) {
            exact(row,['id','uuid','type','coverage','source'],['before','items']);
            const m = members.get(row.id);
            if (!m || m.uuid !== row.uuid || m.type !== row.type || sources.has(row.id) || row.coverage !== 'complete-source') fail('source-wrapper',['before','items']);
            const v = evidence(row.source,262144,['before','items','source']);
            if (row.source.state !== 'present') pending('complete-source-unavailable',['before','items','source']);
            else {
                if (!object(v) || v._id !== row.id || v.type !== row.type || own(v,'uuid') && v.uuid !== row.uuid || own(v,'id') && v.id !== row.id) fail('source-identity',['before','items','source']);
                if (own(v,'toObject') || own(v,'pack') && v.pack !== null) fail('source-interface-or-pack',['before','items','source']);
            }
            sources.set(row.id,{row,value:v});
        }
        if (!members.has(s.itemId) || members.get(s.itemId).type !== 'feat') fail('selected-feature-membership',['selection']);
        for (const m of members.values()) if ((m.id === s.itemId || m.type === 'feat') && !sources.has(m.id)) pending('required-source-missing',['before','items']);
        exact(r.approved,['core','may'],['approved']);
        const approved = {};
        for (const k of ['core','may']) {
            const a = r.approved[k]; exact(a,['itemJson','mapping'],['approved',k]);
            const v = decode(a.itemJson,65536,budget,['approved',k,'itemJson']);
            if (J(v) !== PAIR[k].hash || !same(a.mapping,mappingFor(k))) fail('approved-definition-or-mapping',['approved',k]);
            approved[k] = v;
        }
        const registry = createRuleVersionRegistry(['core','may'].map(k => r.approved[k].mapping));
        if (registry.status !== 'ready') fail('approved-registry',['approved']);
        exact(r.context,['prerequisiteActor','mechanicChoices','references'],['context']);
        const context = {};
        for (const k of ['prerequisiteActor','mechanicChoices','references']) {
            const v = evidence(r.context[k],k === 'mechanicChoices' ? 16384 : 131072,['context',k]);
            context[k] = object(v) ? v : null;
            // Diagnostic uncertainty is advisory; never substitute default/empty captured evidence.
            if (r.context[k].state !== 'present' || !object(v)) pending('advisory-context-unavailable',['context',k]);
        }
        if (context.references) for (const reference of Object.values(context.references)) {
            const uuid = typeof reference === 'string' ? reference : reference?.uuid;
            if (typeof uuid === 'string' && utf8(uuid).length > 256) fail('identity-or-label-byte-limit',['context','references']);
        }
        let diagnosticActor = context.prerequisiteActor;
        if (context.prerequisiteActor) {
            const a = context.prerequisiteActor;
            if (own(a,'toObject') || own(a,'uuid') && a.uuid !== s.actorUuid || own(a,'_id') && a._id !== s.actorId
                || own(a,'id') && a.id !== s.actorId || own(a,'type') && a.type !== actor.type) fail('prerequisite-context-identity',['context','prerequisiteActor']);
            const collection = Array.isArray(a.items) ? a.items : object(a.items) ? a.items.contents : null;
            let partialIdentity = false;
            if (Array.isArray(collection)) for (const i of collection) {
                // Check every supplied identity; a convenient _id must not conceal another id.
                // Missing identities remain diagnostic uncertainty, never synthesized snapshots.
                if (!object(i)) {partialIdentity=true; continue;}
                if (own(i,'toObject')) fail('prerequisite-context-membership',['context','prerequisiteActor']);
                const supplied = ['_id','id'].filter(k => own(i,k)).map(k => i[k]);
                if (own(i,'uuid')) {
                    const prefix = `${s.actorUuid}.Item.`;
                    if (typeof i.uuid !== 'string' || !i.uuid.startsWith(prefix) || !id(i.uuid.slice(prefix.length))) fail('prerequisite-context-membership',['context','prerequisiteActor']);
                    supplied.push(i.uuid.slice(prefix.length));
                }
                if (!supplied.length) {partialIdentity=true; continue;}
                if (supplied.some(v => !id(v) || v !== supplied[0])) fail('prerequisite-context-membership',['context','prerequisiteActor']);
                const m = members.get(supplied[0]);
                if (!m || own(i,'uuid') && i.uuid !== m.uuid || own(i,'type') && i.type !== m.type) fail('prerequisite-context-membership',['context','prerequisiteActor']);
                if (!own(i,'uuid')) partialIdentity=true;
            }
            if (partialIdentity) {
                pending('advisory-context-unavailable',['context','prerequisiteActor','items']);
                // Preserve ranks/levels and the raw sealed cell. The diagnostic projection cannot
                // assert complete owned membership or infer a known missing prerequisite from it.
                diagnosticActor={...clone(a),items:null};
            }
        }
        const hist = evidence(r.history,65536,['history']);
        exact(r.review,['action','expectedSeal','resumeIntent','choices','acknowledgements'],['review']);
        const review = r.review;
        oneOf(review.action,['inspect','request-plan','cancel'],['review','action']);
        for (const k of ['expectedSeal','resumeIntent']) if (review[k] !== null && !hex(review[k])) fail('review-reference',['review',k]);
        choicesValid(review.choices,['review','choices']);
        if (!Array.isArray(review.acknowledgements) || review.acknowledgements.length > ACKS.length) fail('acknowledgements-shape',['review','acknowledgements']);
        const ackCodes = new Set();
        for (const ack of review.acknowledgements) {
            exact(ack,['code','reviewSeal'],['review','acknowledgements']);
            if (!ACKS.includes(ack.code) || !hex(ack.reviewSeal) || ackCodes.has(ack.code)) fail('acknowledgement-invalid',['review','acknowledgements']);
            ackCodes.add(ack.code);
        }
        const inspectionSeal = H({domain:'ptu.echoes.inspection.v1',schemaVersion:r.schemaVersion,kind:r.kind,
            selection:r.selection,before:r.before,approved:r.approved,context:r.context,history:r.history,choices:review.choices});
        out.bindings = {inspectionSeal,before:H(r.before),protected:null,context:H(r.context),history:H(r.history),
            approved:{core:PAIR.core.hash,may:PAIR.may.hash},requiredAcknowledgements:[]};
        const current = sources.get(s.itemId)?.value;
        // A missing complete snapshot cannot be made usable by removing its unavailable fields.
        if (!object(current)) {out.status = 'review-required'; return finish(out);}
        if (!object(current.system) || !object(current.system.source) || own(current,'_stats') && !object(current._stats)
            || own(current,'flags') && !object(current.flags) || own(current.flags,'core') && !object(current.flags.core)
            || own(current.flags,'ptu') && !object(current.flags.ptu)) pending('source-container-unresolved',['before','items','source']);
        const modern = own(current,'_stats') && !object(current._stats) ? {state:'unknown',reason:'unclassified'}
            : observed(current,['_stats','compendiumSource']);
        const legacy = observed(current,['flags','core','sourceId']);
        const selected = observed(current,['flags','ptu','selectedVersion']);
        const modernValue = modern.state === 'present' ? JSON.parse(modern.valueJson) : undefined;
        const legacyValue = legacy.state === 'present' ? JSON.parse(legacy.valueJson) : undefined;
        const selectedValue = selected.state === 'present' ? JSON.parse(selected.valueJson) : undefined;
        const required = new Set(), requireAck = code => required.add(code);
        let currentRole = null, legacyOnly = false;
        if (modern.state === 'present' && modernValue !== null) {
            currentRole = pointerRole(modernValue);
            if (!currentRole) pending('modern-attribution-unresolved',['before','items','source']);
        } else if (modern.state === 'absent' || modernValue === null) {
            currentRole = pointerRole(legacyValue); legacyOnly = currentRole !== null;
            if (legacyOnly) requireAck('legacy-only-current');
            else pending('current-attribution-unresolved',['before','items','source']);
        }
        const selectionSummary = publicSelection(selected,selectedValue);
        const missingSelection = selected.state === 'absent' || selectedValue === null;
        const selectedId = typeof selectedValue === 'string' ? selectedValue : selectedValue?.id;
        if (!missingSelection && (!selectionSummary || currentRole && selectedId !== PAIR[currentRole].version)) pending('stored-selection-unresolved',['before','items','source']);
        if (missingSelection) requireAck('selection-created');
        if (legacy.state === 'present' && legacyValue !== null) {
            const lr = pointerRole(legacyValue);
            if (lr && currentRole && lr !== currentRole) requireAck('legacy-conflict-retained');
            else if (!lr) requireAck('opaque-legacy-retained');
        }
        out.attribution = {currentRole,targetRole:s.targetRole,legacyOnly,
            modern:summary(modern,modernValue,x => pointerRole(x) !== null),
            legacy:summary(legacy,legacyValue,x => pointerRole(x) !== null),selection:selectionSummary,
            candidateInstallation:'not-established',parentContext:PARENT};
        const sourceHistory = observed(current,['flags','ptu','ruleVersionHistory']);
        if (r.history.state === 'present' || r.history.state === 'absent') {
            if (sourceHistory.state !== r.history.state || r.history.state === 'present' && !same(JSON.parse(sourceHistory.valueJson),hist)) fail('history-source-mismatch',['history']);
        } else pending('history-unavailable',['history']);
        let ledger = emptyLedger();
        if (r.history.state === 'present') {
            if (hist === null) pending('history-null-unresolved',['history']);
            else ledger = validateLedger(hist,s);
        }
        // Conservatively cover every serialized owned-ID/UUID reference, including dictionary keys.
        // This is structural coverage, not a claim that an arbitrary reference is a grant.
        const aliases = new Map([...members.values()].flatMap(m => [[m.id,m.id],[m.uuid,m.id]])), edges = new Map();
        const ownedPrefix = `${s.actorUuid}.Item.`, unlisted = new Set();
        const endpoint = value => {
            if (typeof value !== 'string') return null;
            if (aliases.has(value)) return aliases.get(value);
            if (!value.startsWith(ownedPrefix) || !id(value.slice(ownedPrefix.length))) return null;
            const target = value.slice(ownedPrefix.length);
            unlisted.add(target); return target;
        };
        const edge = (a,b) => {if (a !== b) {if (!edges.has(a)) edges.set(a,new Set()); edges.get(a).add(b);}};
        for (const [sourceId,entry] of sources) if (object(entry.value)) {
            const walk = v => {
                const target=endpoint(v); if (target !== null) edge(sourceId,target);
                if (v && typeof v === 'object') for (const [k,x] of Object.entries(v)) {const target=endpoint(k); if (target !== null) edge(sourceId,target); walk(x);}
            }; walk(entry.value);
        }
        // An explicit same-Actor UUID can contradict all-items coverage even if its endpoint was
        // omitted from the caller's alias table. Do not insert it into membership or source capture.
        if (unlisted.size) pending('referenced-membership-missing',['before','membership']);
        const component = new Set([s.itemId]), queue = [s.itemId];
        while (queue.length) {
            const a = queue.shift();
            const adjacent = new Set([...(edges.get(a) ?? []), ...[...edges].filter(([,bs]) => bs.has(a)).map(([b]) => b)]);
            for (const b of adjacent) if (!component.has(b)) {component.add(b); queue.push(b);}
        }
        const edgeCount = [...edges].filter(([a]) => component.has(a)).reduce((n,[,bs]) => n + [...bs].filter(b => component.has(b)).length,0);
        if (component.size > 64 || edgeCount > 128) fail('grant-component-limit',['before','items']);
        for (const n of component) if (!sources.has(n)) pending('referenced-source-missing',['before','items']);
        const otherIds = [...members.values()].filter(m => m.type === 'feat' && m.id !== s.itemId).map(m => m.id).sort(lexical);
        // Both dispositions explicitly report preservation; they do not certify compatibility.
        requireAck('automation-preservation-reported'); requireAck('grant-preservation-reported');
        if (otherIds.length) requireAck('other-instances-preserved');
        const leaf = ['effect','prerequisites','frequency'];
        const definitionMatches = currentRole && leaf.every(k => own(current.system,k) === own(approved[currentRole].system,k)
            && (!own(current.system,k) || same(current.system[k],approved[currentRole].system[k])))
            && same(current.system?.source?.value,approved[currentRole].system.source.value);
        if (currentRole && !definitionMatches) requireAck('custom-leaf-replacement');
        out.bindings.requiredAcknowledgements = [...required].sort(lexical);
        // Protect all fields except the explicitly described leaf/provenance/history changes and
        // the stock path's narrow platform tagging. createdTime and export/duplicate metadata stay.
        const protectedSource = clone(current);
        if (object(protectedSource.system)) {
            for (const k of leaf) delete protectedSource.system[k];
            if (object(protectedSource.system.source)) delete protectedSource.system.source.value;
        }
        if (object(protectedSource._stats)) for (const k of ['compendiumSource','modifiedTime','lastModifiedBy','coreVersion','systemId','systemVersion']) delete protectedSource._stats[k];
        if (object(protectedSource.flags?.ptu)) {
            delete protectedSource.flags.ptu.ruleVersionHistory;
            const v = protectedSource.flags.ptu.selectedVersion;
            if (object(v)) {delete v.id; delete v.label;} else delete protectedSource.flags.ptu.selectedVersion;
        }
        out.bindings.protected = H({source:protectedSource,otherSources:r.before.items.filter(i => i.id !== s.itemId),
            actor:r.before.actor,membership:r.before.membership,context:r.context});
        out.preservationRequirements = {ownedIdentity:'preserve',presentation:'preserve-exactly',legacy:'preserve-raw-in-place',
            usage:'preserve-raw-no-calculation-or-reset',automation:'preserve-raw',grants:'preserve-raw-no-retarget',
            subchoices:'preserve-raw',otherInstances:otherIds,structuralComponent:[...component].sort(lexical),
            structuralEdgeCount:edgeCount,actorMechanicsAndRanks:'preserve',unrelatedFlagsAndFields:'preserve',
            coreMetadata:{conditionallyMutable:['modifiedTime','lastModifiedBy','coreVersion','systemId','systemVersion'],
                protected:['createdTime','duplicateSource','exportSource','all-other-stats'],verification:'future-stock-path-evidence-required'}};
        const candidate = {...clone(approved[s.targetRole]),uuid:sourceUuid(s.targetRole)};
        const previewCurrent = {...clone(current),uuid:s.itemUuid};
        // Do not ask the helper to resolve malformed/unknown raw provenance by legacy fallback.
        if (currentRole && !out.issues.some(i => ['source-container-unresolved','stored-selection-unresolved'].includes(i.code))) {
            const p = previewRuleVersionReplacement({actor:diagnosticActor,current:previewCurrent,candidate,registry,
                mechanicChoices:context.mechanicChoices,references:context.references});
            out.prerequisites = {advisory:true,...p.prerequisites,
                contextEvidence:Object.fromEntries(Object.entries(r.context).map(([k,v]) => [k,{state:v.state,sha256:H(v)}])),
                contextIssues:p.contextIssues.map(() => ({code:'preview-context-unresolved',path:['context']}))};
            if (p.current.attribution?.status !== 'resolved' || p.candidate.attribution?.status !== 'resolved') pending('preview-attribution-unresolved',['before','items','source']);
        }
        out.fieldDecisions = [
            ...leaf.map(k => ({field:`system.${k}`,action:'replace-complete-definition',beforeEvidence:observed(current,['system',k]),
                targetDefinitionRef:{role:s.targetRole,definitionSha256:PAIR[s.targetRole].hash,field:k}})),
            {field:'system.source.value',action:'replace-complete-definition',beforeEvidence:observed(current,['system','source','value']),
                targetDefinitionRef:{role:s.targetRole,definitionSha256:PAIR[s.targetRole].hash,field:'source.value'}},
            {field:'active-compendium-provenance',action:'select-target-on-version-change',beforeEvidence:modern,
                targetDefinitionRef:{role:s.targetRole,definitionSha256:PAIR[s.targetRole].hash,field:'source-identity'}},
            {field:'selected-version',action:'select-target-preserving-extra-properties',beforeEvidence:selected,
                targetDefinitionRef:{role:s.targetRole,definitionSha256:PAIR[s.targetRole].hash,field:'version-identity'}}];
        for (const c of ackCodes) if (!required.has(c)) fail('acknowledgement-not-applicable',['review','acknowledgements']);
        if (review.action === 'inspect' && (review.expectedSeal !== null || ackCodes.size)) fail('inspection-review-state',['review']);
        const blockers = out.issues.filter(i => i.code !== 'advisory-context-unavailable');
        if (lifecycle.state !== 'reported-unattempted' || lifecycle.relatedIntent !== null) pending('lifecycle-reconciliation',['before','lifecycle']);
        if (review.resumeIntent !== null) pending('resume-reconciliation',['review','resumeIntent']);
        if (review.action === 'cancel') {
            out.status = lifecycle.state === 'reported-unattempted' && lifecycle.relatedIntent === null && review.resumeIntent === null ? 'cancelled' : 'review-required';
            return finish(out);
        }
        if (lifecycle.state !== 'reported-unattempted' || lifecycle.relatedIntent !== null || review.resumeIntent !== null || blockers.length) {out.status='review-required'; return finish(out);}
        if (currentRole === s.targetRole) {
            if (definitionMatches && !legacyOnly && !missingSelection && !required.has('legacy-conflict-retained')) {
                out.status='no-change'; out.fieldDecisions=[];
            } else {pending('same-target-repair-outside-v1',['selection']); out.status='review-required';}
            return finish(out);
        }
        if (review.action === 'inspect') {out.status='review-required'; return finish(out);}
        if (review.expectedSeal !== inspectionSeal) pending('inspection-seal-mismatch',['review','expectedSeal']);
        for (const ack of review.acknowledgements) if (ack.reviewSeal !== inspectionSeal) pending('acknowledgement-stale',['review','acknowledgements']);
        if ([...required].some(c => !ackCodes.has(c))) pending('acknowledgement-missing',['review','acknowledgements']);
        for (const [k,expected] of [['leaf','replace-reviewed'],['automation','preserve-reviewed'],['grants','preserve-reviewed'],
            ...(otherIds.length ? [['otherInstances','preserve-all']] : [])]) if (review.choices[k] !== expected) pending('choice-unreviewed',['review','choices',k]);
        if (out.issues.some(i => i.code !== 'advisory-context-unavailable')) {out.status='review-required'; return finish(out);}
        if (ledger.entries.length >= 32) {pending('history-capacity',['history']); out.status='review-required'; return finish(out);}
        const codes = [...ackCodes].sort(lexical), historyBefore = H(ledger), p = PAIR[s.targetRole];
        const entry = {sequence:ledger.entries.length+1,kind:'intent',instance:{actorUuid:s.actorUuid,itemUuid:s.itemUuid,itemId:s.itemId},
            from:{role:currentRole,definitionSha256:PAIR[currentRole].hash,modern:out.attribution.modern,
                legacy:out.attribution.legacy,selection:selectionSummary},
            to:{role:s.targetRole,itemId:p.id,sourceUuid:sourceUuid(s.targetRole),versionId:p.version,label:p.label,definitionSha256:p.hash},
            choices:{...clone(review.choices),acknowledgedCodes:codes},bindings:{before:out.bindings.before,protected:out.bindings.protected,
                context:out.bindings.context,historyBefore,review:H({domain:'ptu.echoes.intent-review.v1',inspectionSeal,
                    choices:review.choices,acknowledgedCodes:codes})}};
        entry.operationId = H(entry);
        if (ledger.entries.some(e => e.operationId === entry.operationId)) fail('history-collision-or-digest',['history']);
        if (utf8(canonical(entry)).length > 4096 || utf8(canonical({...ledger,entries:[...ledger.entries,entry]})).length > 65536) {
            pending('history-append-limit',['history']); out.status='review-required'; return finish(out);
        }
        out.historyIntent = {disposition:r.history.state === 'absent' ? 'create-intent-ledger' : 'append-intent-only',
            expectedPriorBinding:historyBefore,entry};
        out.status='conditional-plan'; return finish(out);
    } catch (e) {
        // Do not expose exception text or partially produced seals/intent on invalid materialization.
        const stopped = blank();
        stopped.status = e?.protocolFailure && e.review ? 'review-required' : 'refused';
        stopped.issues.push({code:e?.protocolFailure ? e.code : 'input-inspection-unavailable',path:e?.protocolFailure ? e.path : []});
        return finish(stopped);
    }
}
