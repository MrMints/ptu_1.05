import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {readPackSources} from './pack-sources.mjs';
import {contentIdentity,EXCLUDED_CONTENT,assertCompleteSupportedContent} from '../src/util/content-scope.js';

export async function createContentInventory() {
    const manifest=JSON.parse(await readFile('system.json','utf8'));
    const {rows,sourceFingerprint,policyFingerprint}=await readPackSources(manifest);
    const review=JSON.parse(await readFile('docs/data/content-eligibility-review.json','utf8'));
    const map=new Map(review.records.map(row=>[row.identity,row]));
    const records=rows.map(row=>{
        const decision=map.get(row.identity);
        if(decision&&decision.contentHash!==row.contentHash)throw new Error(`Content classification is stale: ${row.identity}`);
        return {identity:row.identity,contentHash:row.contentHash,...decision};
    });
    const identities=new Set(rows.map(row=>row.identity));
    const dependencies={checkedRecords:[],blockers:[]};
    for(const row of rows.filter(row=>map.get(row.identity)?.generationEligibility==='eligible')) {
        const targets=[...new Set([...JSON.stringify(row.data).matchAll(/Compendium\.ptu\.[\w-]+\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?[A-Za-z0-9]{16}(?![A-Za-z0-9])/g)].map(m=>contentIdentity(m[0])))];
        dependencies.checkedRecords.push({identity:row.identity,targets});
        for(const target of targets)if(!identities.has(target)||!map.has(target)||map.get(target).ruleVersionApproval!=='approved')dependencies.blockers.push({source:row.identity,target,status:!identities.has(target)?'missing-target':EXCLUDED_CONTENT.includes(target)?'excluded-target':'unapproved-dependency'});
    }
    const counts={sourceRecords:rows.length,eligible:records.filter(r=>r.generationEligibility==='eligible').length,
        excluded:records.filter(r=>r.generationEligibility==='excluded').length,
        unclassifiedGeneration:records.filter(r=>!r.generationEligibility||r.generationEligibility==='unclassified').length,
        unapprovedRuleVersion:records.filter(r=>r.generationEligibility!=='excluded'&&r.ruleVersionApproval!=='approved').length};
    return {schemaVersion:1,policy:'docs/SCOPE.md',sourceFingerprint,policyFingerprint,
        defaultStatus:{generationEligibility:'unclassified',ruleVersionApproval:'unclassified',verification:'not-reviewed'},
        counts,records,dependencies,completeSupportedScope:false,
        packageCompatibilityDecision:'unresolved-original-UUID-preservation',
        packageDisposition:'Development candidate retains original pack records for saved UUID references; known exclusions are blocked in new acquisition. Supported release/package removal remains blocked.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
    const inventory=await createContentInventory();
    if(process.argv.includes('--require-complete'))assertCompleteSupportedContent(inventory);
    await writeFile('docs/data/content-eligibility.json',JSON.stringify(inventory,null,2)+'\n');
    console.log(JSON.stringify({counts:inventory.counts,dependencyBlockers:inventory.dependencies.blockers.length,completeSupportedScope:false}));
}
