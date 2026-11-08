import {createHash} from 'node:crypto';
import {isDeepStrictEqual as equal} from 'node:util';
import {pathToFileURL} from 'node:url';

const BASE = 'c95f62ea9198c63aab934eab0b32b93cd6e0f320';
const HUGE = 'abilities.oNB76oqVYrjhYd7W';
const PURE = 'abilities.nuGa21WQ0QD07kQj';
const UNIT_IDS = ['core:320:ability-line34', 'feb:5:ability-line83'];
const PURE_UNIT = 'core:327:ability-line18';
const FILES = {
    'system.json': ['f9009d19bace3df3008cb17d2476c6b59dad85733a34f968ea022610c09afea2', '7ab49214e6c7b94d06b936cd09005403dc4a73df4e1d2be6326c1e77d2204087'],
    'template.json': ['153a42fcfd7449f3de6d87949ec05c569c1e33eae6fbdd79f0ab8f46282ca7c9', 'bffa4c1e57a3b3208affcbc7a9d4a37fc36f0081f8c6b54c0831172ad351c3b2'],
    'docs/data/ability-source-evidence.json': ['9a2c90f182919563c6ff20c15899235b1f07aa840c2ef83cb78ca126f15b63ff', '29cc72e8f7c43ff5dfbd7ec61eec2f7125f5a5a5510dd272587d26b77ccb1ad2'],
    'docs/data/rules-revisions.json': ['b81ac60cafed64bc8944fac1ee907a2f9e99497e4ce25411781e48afbd250c51', 'cfa30b3a5917953fcc645dde18fb23b05bd7ae5e8d9f0efce41d05a616d7af26'],
    'docs/data/source-authority.json': ['2667a37b048a8ede853027ecfd75cd41c994f23302113960995e50307f5ea171', 'a6e3b1b806381850ef61dc42b3abb9c9e63eeea597087cde12de841cb7e79f54'],
    'docs/data/references.json': ['61f699296584d114ed2d9168f2e8bf3096a3aae2b03e8d51399b4b1bfc9ef96c', '8aa029ddb35d85f16ae96d402ac3bdada661ca17404f2668dda6d8381e4b4548'],
    'docs/data/record-source-review/abilities-core.json': ['fd4d11967475fc917c9d50bab1d16a12bff0d03bf0aeebeeb0a54a6fe910261c', 'fe7805fe8ddd54c936c9b91bca8a2392d5285b29d1525de0b33d558d680f06af']
};
const IDENTITIES = [
    {itemId:'ypjzWxMaeA5IzjQb', canonicalId:'OnXtELEC8HtZL2xT', versionId:'N77AbLpO4cfdubJU'},
    {itemId:'Z4qnGQ3gbYYIs66d', canonicalId:'OnXtELEC8HtZL2xT', versionId:'jAM8ro6ZClgBEbOl'}
];
const EXCLUDED_IDS = ['oNB76oqVYrjhYd7W', 'nuGa21WQ0QD07kQj', 'aJ47Z5z6Az9c8Dy8', 'ta6bKIiHCuccjTqU',
    'ViZpn17qLA4ACQGa', 'e9dQ3NmVm7EuQBO5', 'UKk9BnAZtm1xMoRB', 'celnYjQjM3jjtAnZ', 'i1OAz3lvuCRIm3n9'];
const APPROVALS = {production:false, behavioralVerification:'not-run', implemented:false, automation:false};
const REPRESENTATION = {
    whitespace:'Join whitespace within each accepted printed field using one space; retain frequency and effect as separate typed fields.',
    spelling:'Preserve all rule words, spelling, accents, numbers and punctuation; no Pokemon spelling repair or numerical interpretation.',
    name:'Display Huge Power for this exact pair; retain the combined February heading as evidence without authoring or merging Pure Power.',
    effect:'Copy the complete single effect clause into system.effect; do not replace cannot-disable with Innate or copy executable rules.'
};
const UNRESOLVED = ['production-identity-and-adoption', 'cannot-disable-and-calculation-execution', 'saved-custom-repeats-stacking-transfer'];
const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value) ?? 'undefined');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keys = (value, expected) => object(value) && equal(Object.keys(value).sort(), [...expected].sort());
const normalize = value => value.replace(/\s+/g, ' ').trim();
const fileHashes = raw => {const lf=raw.replaceAll('\r\n','\n');return {lf:sha(lf),crlf:sha(lf.replaceAll('\n','\r\n'))};};
const one = (rows, predicate) => {const matches=rows.filter(predicate);if(matches.length!==1)throw Error('membership');return matches[0];};
const pointer = (value, path) => path.split('/').slice(1).reduce((v,k)=>v?.[k],value);

/** Data only: parsed draft; inputs={pilot:raw JSON,sourceEvidence:fixed raw JSON
 * map,currentRecords:two raw JSON strings,packPaths:tracked filename paths}.
 * Pure integrity/authoring validation; no I/O, allocation or runtime approval. */
export function validateHugePowerVersionDraft(draft, inputs) {
    if (!object(draft)) return ['draft-shape'];
    if (!keys(inputs,['pilot','sourceEvidence','currentRecords','packPaths'])) return ['input-shape'];
    const issues=[],check=(ok,code)=>{if(!ok)issues.push(code);};
    try {
        check(keys(draft,['schemaVersion','status','scope','productionMapping','generationEligibility','approvals','representation',
            'schemaEvidence','upstream','collisionInventory','identityAllocation','negativeControl','unresolvedAuthoring',
            'sourcePairRationale','identityDecision','validationLimit','roles','proposedIdentityJsonSha256']), 'draft-envelope');
        check(draft.schemaVersion===1 && draft.status==='draft-not-production-approved' && draft.scope==='Generations 1–8 only', 'draft-status');
        check(draft.productionMapping===null && draft.generationEligibility==='unclassified' && equal(draft.approvals,APPROVALS), 'unapproved-envelope');
        check(equal(draft.representation,REPRESENTATION),'representation');
        check(keys(inputs.sourceEvidence,Object.keys(FILES)) && keys(inputs.currentRecords,[HUGE,PURE]) && typeof inputs.pilot==='string','input-membership');
        if(issues.includes('input-membership'))return issues;
        const source={},bindings={};
        for(const [path,pin] of Object.entries(FILES)) {
            const raw=inputs.sourceEvidence[path];if(typeof raw!=='string')return [...issues,'input-json:'+path];
            source[path]=JSON.parse(raw);bindings[path]={rawFileSha256:fileHashes(raw),jsonSha256:hash(source[path])};
            check(bindings[path].rawFileSha256.lf===pin[0] && bindings[path].jsonSha256===pin[1],'protected-input:'+path);
        }
        const pilot=JSON.parse(inputs.pilot);
        check(hash(pilot)==='abe2c88035f9e6444b3eedb0b36cc23c0fbda41272fe337a55bdb8e3e7696101','protected-pilot');
        if(issues.some(x=>x.startsWith('protected-')))return issues;
        const accepted=one(pilot.cases,x=>x.caseId==='r04-r0046');
        check(accepted.current.identity===HUGE && hash(accepted)==='752574680adb90cb4ae89aecc3014306572051220d56283e27fadf90575cd5ef','case-binding');
        const evidence=source['docs/data/ability-source-evidence.json'];
        const units=UNIT_IDS.map(id=>one(evidence.sourceDefinitions,x=>x.id===id));
        const pureUnit=one(evidence.sourceDefinitions,x=>x.id===PURE_UNIT);
        const reviews=source['docs/data/record-source-review/abilities-core.json'].records;
        const review=one(reviews,x=>x.identity===HUGE);
        const catalog=one(source['docs/data/rules-revisions.json'].entries,x=>x.id==='r04-r0046');
        const authorities=accepted.roles.map(r=>one(source['docs/data/source-authority.json'].sources,x=>x.id===r.source.authorityId));
        const references=accepted.roles.map(r=>one(source['docs/data/references.json'].documents,x=>'Core System/'+x.path===r.source.path));
        check(hash(catalog)===accepted.catalogEntryJsonSha256 && catalog.kind==='ability' && equal(catalog.stableIdentities,[]),'catalog-binding');
        check(hash(review)===accepted.current.review.jsonSha256 && hash(review.exportLineage)===accepted.current.review.lineageJsonSha256,'review-lineage-binding');
        const current={},currentBindings={};
        for(const id of [HUGE,PURE]) {
            const raw=inputs.currentRecords[id];if(typeof raw!=='string')return [...issues,'input-json:'+id];
            current[id]=JSON.parse(raw);const pin=id===HUGE?accepted.current:pilot.negativeControl.current;
            const key=id.split('.')[1];
            check(sha(raw)===pin.rawFileSha256 && hash(current[id])===pin.jsonSha256,'current-record-binding:'+id);
            check(current[id]._id===key && current[id]._key==='!items!'+key && current[id].type==='ability','current-record-identity:'+id);
            currentBindings[id]={path:pin.path,rawFileSha256:sha(raw),jsonSha256:hash(current[id])};
        }
        const manifest=source['system.json'];
        check(manifest.id==='ptu' && manifest.packs.some(x=>x.name==='abilities'&&x.type==='Item'&&x.path==='packs/abilities'),'manifest-identity');
        const expectedUpstream={baseline:BASE,pilotJsonSha256:hash(pilot),caseId:accepted.caseId,caseJsonSha256:hash(accepted),
            sourceFiles:bindings,currentRecords:currentBindings,catalogEntryJsonSha256:hash(catalog),
            authorityEntriesJsonSha256:authorities.map(hash),referenceEntriesJsonSha256:references.map(hash),
            auditJsonSha256:hash(one(evidence.currentRecordAudit,x=>x.identity===HUGE)),
            reviewJsonSha256:hash(review),exportLineageJsonSha256:hash(review.exportLineage)};
        check(equal(draft.upstream,expectedUpstream),'upstream-binding');
        const schema=source['template.json'],{templates,...ability}=schema.Item.ability,base=schema.Item.templates.base;
        check(equal(templates,['base']),'schema-template-lineage');
        const defaults={...base,...ability};
        check(Object.keys(defaults).length===13,'ability-schema-field-count');
        check(equal(draft.schemaEvidence,{path:'template.json',rawFileSha256:bindings['template.json'].rawFileSha256,
            jsonSha256:hash(schema),basePointer:'/Item/templates/base',typePointer:'/Item/ability',requiredSystemFields:Object.keys(defaults).sort()}),'schema-binding');
        const paths=inputs.packPaths;
        check(Array.isArray(paths)&&paths.every(p=>typeof p==='string'&&/^packs\/[\w-]+\/_source\/[A-Za-z0-9]{16}\.json$/.test(p))
            &&new Set(paths).size===paths.length,'inventory-shape');
        if(!Array.isArray(paths)||issues.includes('inventory-shape'))return issues;
        const sortedPaths=[...paths].sort(),ids=[...new Set(paths.map(p=>p.split('/').at(-1).slice(0,-5)))].sort();
        check(equal(draft.collisionInventory,{method:'SHA256(JSON.stringify(sorted unique tracked pack-source filename IDs))',
            trackedPathCount:paths.length,count:ids.length,jsonSha256:hash(ids),trackedPathsJsonSha256:hash(sortedPaths)}),'inventory-binding');
        check(keys(draft.identityAllocation,['generator','setsGenerated','regenerations','explicitExclusions','exactIdCollisionSearch'])
            && draft.identityAllocation.generator==='node:crypto.randomInt over 62 alphanumeric symbols'
            && draft.identityAllocation.setsGenerated===1 && draft.identityAllocation.regenerations===0
            && equal(draft.identityAllocation.explicitExclusions,EXCLUDED_IDS)
            && equal(draft.identityAllocation.exactIdCollisionSearch,{passes:1,matches:0,exitCode:1,commit:BASE,
                scope:['tracked packs/*/_source/*.json','tracked docs/data/**/*.json']}),'allocation-receipt');
        check(equal(draft.negativeControl,{purpose:'separate-identity-only',identity:PURE,documentUuid:pilot.negativeControl.current.documentUuid,
            coreDefinitionId:PURE_UNIT,coreDefinitionJsonSha256:hash(pureUnit),sharedRevisedDefinitionId:UNIT_IDS[1],
            currentRecordJsonSha256:hash(current[PURE]),proposalCase:false,canonicalMerge:false}),'pure-power-separate');
        check(Array.isArray(draft.unresolvedAuthoring)&&equal(draft.unresolvedAuthoring.map(x=>x.code).sort(),[...UNRESOLVED].sort())
            &&draft.unresolvedAuthoring.every(x=>typeof x.detail==='string'&&x.detail.length>40),'unresolved-obligations');
        for(const key of ['sourcePairRationale','identityDecision','validationLimit'])check(typeof draft[key]==='string'&&draft[key].length>60,'review-explanation:'+key);
        const rows=draft.roles;
        check(Array.isArray(rows)&&equal(rows.map(x=>x?.role),['baseline','revised']),'role-membership');
        if(!Array.isArray(rows)||issues.includes('role-membership'))return issues;
        for(let index=0;index<2;index++) {
            const row=rows[index],role=index?'revised':'baseline',unit=units[index],sourceRole=accepted.roles.find(x=>x.role===role);
            check(keys(row,['role','source','definitionEvidence','productionMapping','generationEligibility','approvals','proposedIdentity','item','fieldDecisions']),'role-envelope:'+role);
            check(equal(row.source,sourceRole.source) && authorities[index].sha256===row.source.sha256
                && authorities[index].preferredPath===row.source.path && authorities[index].role===row.source.status
                && references[index].sha256===row.source.sha256 && references[index].authority==='owner-selected','source-role:'+role);
            check(equal(unit.ruleStructure.clauses.map(x=>x.kind),['effect'])&&unit.frequency==='Static'&&equal(unit.ruleStructure.explicitTags,[]),'complete-source-fields:'+role);
            check(equal(row.definitionEvidence,{file:'docs/data/ability-source-evidence.json',id:unit.id,jsonSha256:hash(unit),
                rawDefinitionSha256:unit.rawDefinitionSha256,definitionNormalizedSha256:unit.definitionNormalizedSha256,evidenceSemanticSha256:unit.evidenceSemanticSha256}),'definition-binding:'+role);
            check(row.productionMapping===null&&row.generationEligibility==='unclassified'&&equal(row.approvals,APPROVALS),'role-approval:'+role);
            check(equal(row.proposedIdentity,IDENTITIES[index]),'identity-proposal-binding:'+role);
            if(object(row.proposedIdentity))for(const id of Object.values(row.proposedIdentity))check(typeof id==='string'&&/^[A-Za-z0-9]{16}$/.test(id)&&!ids.includes(id)&&!EXCLUDED_IDS.includes(id),'identity-collision:'+role);
            const expected={name:'Huge Power',type:'ability',system:{...structuredClone(defaults),effect:normalize(unit.ruleStructure.clauses[0].text),
                frequency:unit.frequency,source:{value:row.source.edition+' — p.'+row.source.pdfPages[0]}}};
            check(keys(row.item,['name','type','system'])&&equal(row.item,expected),'complete-source-or-neutral-fields:'+role);
            const targets=['name','type',...Object.keys(defaults).map(k=>'system.'+k)].sort();
            check(Array.isArray(row.fieldDecisions)&&equal(row.fieldDecisions.map(x=>x.target).sort(),targets),'field-decision-membership:'+role);
            for(const d of row.fieldDecisions??[]) {
                const field=d.target.startsWith('system.')?d.target.slice(7):null;
                const pointers=d.target==='name'?['/label']:field==='effect'?['/ruleStructure/clauses/0/text']:field==='frequency'?['/frequency']:field==='source'?['role:/source']:[];
                const basis=d.target==='name'?'source-pair-display':d.target==='type'?'schema-type':field==='source'?'source-attribution':pointers.length?'source-leaf':'neutral-schema-default';
                const schemaPointer=d.target==='type'?'/Item/ability':!field||pointers.length?null:Object.hasOwn(ability,field)?'/Item/ability/'+field:'/Item/templates/base/'+field;
                check(keys(d,['target','basis','schemaPointer','sourcePointers','sourceValueJsonSha256','draftValueJsonSha256','reason'])
                    &&d.basis===basis&&d.schemaPointer===schemaPointer&&equal(d.sourcePointers,pointers)
                    &&equal(d.sourceValueJsonSha256,pointers.map(p=>hash(p==='role:/source'?row.source:pointer(unit,p))))
                    &&d.draftValueJsonSha256===hash(d.target.split('.').reduce((v,k)=>v?.[k],row.item))
                    &&typeof d.reason==='string'&&d.reason.length>30,'field-decision:'+role+':'+d.target);
            }
        }
        const proposed=rows.flatMap(r=>[r.proposedIdentity.itemId,r.proposedIdentity.versionId]);
        check(rows[0].proposedIdentity.canonicalId===rows[1].proposedIdentity.canonicalId&&new Set([...proposed,rows[0].proposedIdentity.canonicalId]).size===5,'distinct-pair-identities');
        check(draft.proposedIdentityJsonSha256===hash(rows.map(r=>r.proposedIdentity)),'identity-fingerprint');
    } catch {issues.push('serialized-input-shape');}
    return [...new Set(issues)];
}

// Fixed read-only development adapter; no originals, runtime or output payloads.
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
    const {readFile}=await import('node:fs/promises');
    const {execFileSync}=await import('node:child_process');
    const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
    try {
        const inputs={pilot:await read('docs/data/rule-version-pilot.json'),
            sourceEvidence:Object.fromEntries(await Promise.all(Object.keys(FILES).map(async p=>[p,await read(p)]))),
            currentRecords:Object.fromEntries(await Promise.all([HUGE,PURE].map(async id=>[id,await read('packs/abilities/_source/'+id.split('.')[1]+'.json')]))),
            packPaths:execFileSync('git',['ls-files','--','packs/*/_source/*.json'],{cwd:new URL('../',import.meta.url),encoding:'utf8'}).trim().split(/\r?\n/)};
        const issues=validateHugePowerVersionDraft(JSON.parse(await read('docs/data/rule-version-huge-power-draft.json')),inputs);
        if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
        else console.log('Two non-runtime Huge Power Ability drafts pass fixed source/schema/identity checks; no production adoption or gameplay behavior is verified.');
    }catch(error){console.error('Huge Power input read/JSON failed; no targets written: '+error.message);process.exitCode=1;}
}
