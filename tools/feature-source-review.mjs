// Frozen E1 source evidence only; no runtime or acquisition consumer.
import {parseFeatureDefinition,featureImplementationNotes,featurePrerequisiteWordingProof,featureEffectWordingProof,featureResourceCostWordingProof} from './feature-source-parsing.mjs';
import {moveSourceNumericTokens} from './move-source-parsing.mjs';

export function checkFeatureSourceReview(bundle, context) {
    if (!bundle.index.featureSourceEvidence) return;
    const {fail,rows,actualMap,hash,equal,textHash,normalizedText:norm,parseFeatureRules,citations}=context;
    const audit=bundle.featureSource,batch=bundle.batchManifest.batches.find(b=>b.id==='E1'),census=audit?.sourceDefinitionCensus;
    fail(audit?.batch==='E1'&&audit.sourceFingerprint===bundle.index.sourceFingerprint&&audit.membershipSha256===batch.membershipSha256&&audit.diagnosticSha256===bundle.batchManifest.candidateSnapshot.sha256
        &&audit.productionPolicyPromotion===false&&audit.behavioralVerification==='not-run','Feature frozen scope/policy/diagnostic changed');
    const units=new Map((audit?.sourceDefinitions??[]).map(unit=>[unit.id,unit]));
    fail(units.size===1000&&census.units===1000&&census.definitionSetSemanticSha256==='835f51faa0dcaf382e28f2c48b02408ecf83496f44a8588c08a58d86818a4710'&&census.definitionSetSemanticSha256===hash(audit.sourceDefinitions)
        &&census.unassignedPrerequisiteLocators.length===0&&census.rejectedSourceHeaders.length===1&&census.rejectedSourceHeaders[0].id==='core:57:feature-line7','Feature full definition census/boundaries changed');
    const key=structure=>structure.clauses.map(c=>[c.kind,norm(c.text)]),words=structure=>key(structure).map(c=>c[1]).join(' ');
    const safeNumbers=(a,b)=>equal(a,b)&&![...a,...b].some(value=>value.startsWith('unrecognized-sign:'));
    for(const unit of units.values()) {
        const definition=parseFeatureDefinition(unit.rawDefinition),body=definition.sections.filter(s=>!['prerequisites','frequency','profile-frequency','cost','tags'].includes(s.kind)).map(s=>s.kind==='unlabelled'?s.text:`${s.label}: ${s.text}`).join('\n');
        fail(unit.rawDefinitionSha256===textHash(unit.rawDefinition)&&equal(unit.definition,definition)&&unit.body===body&&equal(unit.ruleStructure,parseFeatureRules(body))
            &&unit.orderedContentWords===words(unit.ruleStructure)&&equal(unit.numericTokens,moveSourceNumericTokens(unit.ruleStructure)),'Feature complete source sections/roles changed: '+unit.id);
    }
    const independentLeafBounds={
        'core:59:feature-line46':[61,'1289200015c721e8b0915bd0c902c9e3737e7321a1c98f35874bf84e74c0d8df'],
        'core:60:feature-line17':[30,'e2188900cd4e706eb1f0faf8852a3f65994a6ab6ddc3b5e002c1bdf2186b2fd3'],
        'core:61:feature-line42':[52,'edd4ff3091df5275552d0da2952ba64e63cb11441f2c91258b2ef5be49f13498'],
        'core:119:feature-line24':[35,'2405658b9b4df957ccc2fe4c4a6d7d5a1aa230e80e492c414c3de834d6bcd22d'],
        'core:164:feature-line45':[52,'2a2970e5b81571812c7e34febfe4561ec6110b3fb2b3a4a600f62ad63fee0914'],
        'throhs:52:feature-line16':[34,'22c8dd9ec9d1862c74ae90af0892ef5d30dbebeb3fca7a1989f3e8360ddc554e'],
        'throhs:63:feature-line38':[68,'567b9626f044fd41583e369ef681026d8a46ac9e080e6f42ed2f5826f8166c73']};
    for(const[id,[end,rawSha]]of Object.entries(independentLeafBounds)){
        const unit=units.get(id);
        fail(unit?.anchors.at(-1).endLine===end&&unit.rawDefinitionSha256===rawSha&&textHash(unit.rawDefinition)===rawSha,'Feature independent source boundary or legitimate Note changed: '+id);
    }
    const boundaryAudit=audit.sourcePreparationCorrections?.boundaryPatternCorrection;
    fail(boundaryAudit?.unitsExamined===1000&&boundaryAudit.candidateUnits.length===13&&equal(boundaryAudit.affectedUnclosedUnitIds.slice().sort(),Object.keys(independentLeafBounds).sort())
        &&boundaryAudit.candidateUnits.every(c=>typeof c.disposition==='string'&&c.disposition.length>15)&&boundaryAudit.closedPayloads.length===2&&boundaryAudit.closedPayloads.every(c=>c.changedSourceDefinitionsReferenced.length===0&&c.candidateMembershipChanges.length===0&&hash(bundle.files[c.recordFile])===c.evidenceSemanticSha256),'Feature finite independent-boundary audit or closed payload preservation changed');
    const contexts=new Map((audit.generalContexts??[]).map(c=>[c.id,c]));
    fail(contexts.size>=8&&[...contexts.values()].every(c=>c.rawSha256===textHash(c.rawText)&&c.normalizedSha256===textHash(norm(c.rawText))&&c.behavioralVerification==='not-run'),'Feature complete parent/use context changed');
    fail(audit.generalContextSetSemanticSha256==='c97bd66ecd1236053e15f3b79dbf10d9b622c515abb8f53f058a375ca77fdb5f'&&audit.generalContextSetSemanticSha256===hash(audit.generalContexts),'Feature bound parent/use context inventory changed');
    fail(hash({nativeContexts:audit.nativeContexts,sourceScopeReadings:audit.sourceScopeReadings})==='1fabfae83bfbf575b9dc56764a1886759c7c5cba5e694ef15136b37b83189f8a','Feature bound native/visual source readings changed');
    const natives=new Map((audit.nativeContexts??[]).map(c=>[c.id,c])),scopes=new Map((audit.sourceScopeReadings??[]).map(c=>[c.id,c]));
    for(const native of natives.values()){
        const journal=actualMap.get(native.journalIdentity),page=journal?.data.pages?.find(p=>p._id===native.pageId);
        fail(journal?.contentHash===native.journalContentHash&&page&&hash(page)===native.pageJsonSha256&&native.rawText===page.text.content&&native.rawSha256===textHash(native.rawText)
            &&native.normalizedSha256===textHash(norm(native.rawText))&&native.behavioralVerification==='not-run'&&native.productionPolicyPromotion===false,'Feature exact native context changed: '+native.id);
    }
    for(const scope of scopes.values()){
        const unit=units.get(scope.sourceUnit);
        fail(unit&&scope.sourceDefinitionEvidenceSha256===hash(unit)&&equal(scope.source,unit.source)&&unit.rawDefinition===scope.leafRawText+scope.trailingContextRawText&&scope.leafRawSha256===textHash(scope.leafRawText)
            &&scope.leafStartLine===unit.anchors[0].startLine&&scope.leafEndLine-scope.leafStartLine+1===scope.leafRawText.split('\n').length&&scope.behavioralVerification==='not-run'&&scope.productionPolicyPromotion===false,'Feature visual leaf/context boundary changed: '+scope.id);
    }
    fail(/half an hour/.test(contexts.get('feature-tags')?.rawText??'')&&/at least an hour/.test(contexts.get('training-feature-use')?.rawText??'')
        &&!/Agility Training/.test(contexts.get('training-feature-use')?.rawText??'')&&/four Classes/.test(contexts.get('class-framework')?.rawText??'')
        &&/latter ranks/i.test(contexts.get('feature-tags')?.rawText??'')&&/is removed/.test(contexts.get('poke-edge-framework')?.rawText??''),'Feature parent rank/training/printed prerequisite facts missing');
    const expectedSlices={E1a:[85,'185845a5bd831cabddcd8f925e19ec94d285d6fdf5d41f65b7db664852dacb14'],E1b:[38,'04c79cb1a036eca7584a663f191e743cc7f702542ab0115a8d12fb4dee3c5b97'],E1c:[665,'2828422ca3cb0eaf54c6a485607e9b460630ed3d74be4897c6bacaece68aad29'],E1d:[387,'d7ae3c274162cd964d939fb317f70a8cc4d856ef86ee5b5035b23b08d268d6ea'],E1e:[268,'c82f7a90bc593fb1b0ad22ae45f8e43a42df74801038124749f764f60d6ff07b']};
    const membershipHash=members=>textHash([...members].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([i,h])=>`${i}\t${h}\n`).join(''));
    fail(batch.count===1443&&batch.membershipSha256==='60db69771fd299bf4618c8e6f228a7eddb01590adaa81377cd535103e7e7a1e5'&&membershipHash(batch.members)===batch.membershipSha256
        &&membershipHash(batch.slices.flatMap(s=>s.members))===batch.membershipSha256,'Feature original frozen family changed');
    for(const slice of batch.slices)fail(slice.members.length===slice.records&&slice.records===expectedSlices[slice.id]?.[0]&&slice.membershipSha256===expectedSlices[slice.id]?.[1]&&membershipHash(slice.members)===slice.membershipSha256,'Feature frozen partition changed: '+slice.id);
    const historical=audit.historicalExportCensus??[];
    fail(equal(historical.map(r=>r.revision),['059ffdc5bd47cb0531e95936de5319736c043721','5bf20d15dc244eab54dbad283d137c0a316ccedd','be63a651ad65ba09d1e4d9344b3d2973f739cc75','17ccf810c77f71d3ce3a0a9fc53067d1f8c3fddd'])
        &&historical.every(r=>r.packs.length===3&&r.packs.every(p=>p.manifestPresent&&p.extraction==='complete'&&p.sourceRecords>0)),'Feature historical export census changed');
    for(const artifact of audit.sourceSearchArtifacts??[]) {
        const search=bundle.featureSearch?.[artifact.path],registry=search?.sourceRegistry,slice=batch.slices.find(s=>s.id===artifact.slice);
        fail(search&&hash(search)===artifact.evidenceSemanticSha256&&search.slice===slice?.id&&search.productionPolicyPromotion===false&&search.behavioralVerification==='not-run','Feature finite search artifact changed: '+artifact.slice);
        if(!registry||!slice)continue;
        fail(registry.sourcePageCount===2652&&registry.pages.length===2652&&registry.nativePageCount===271&&registry.nativePages.length===271
            &&Object.values(registry.sourceCorpusCensus).reduce((sum,r)=>sum+r.pagesExamined,0)===2652&&equal(Object.keys(search.records).sort(),slice.members.map(r=>r[0]).sort()),'Feature finite corpus/membership coverage changed: '+slice.id);
        const nativeIds=[];
        for(const page of registry.nativePages){
            const journal=actualMap.get(page.journalIdentity),actualPage=journal?.data.pages?.find(p=>p._id===page.pageId);nativeIds.push(`${page.journalIdentity}:${page.pageId}`);
            fail(journal?.contentHash===page.journalContentHash&&actualPage&&hash(actualPage)===page.pageJsonSha256&&textHash(norm(actualPage.text.content))===page.textNormalizedSha256,'Feature finite native page changed: '+page.id);
        }
        const actualNativeIds=[...actualMap.entries()].filter(([i])=>i.startsWith('journals.')).flatMap(([i,r])=>(r.data.pages??[]).map(p=>`${i}:${p._id}`));
        fail(equal(nativeIds.sort(),actualNativeIds.sort()),'Feature native corpus silently shrank');
        for(const p of registry.passages)fail(registry.pages[p.pageOrdinal]&&p.startLine>0&&p.endLine>=p.startLine&&/^[a-f0-9]{64}$/.test(p.rawSha256),'Feature finite passage coordinates missing');
        for(const row of Object.values(search.records)){
            fail(actualMap.get(row.identity)?.contentHash===row.contentHash&&row.sourceAbsenceClaim===false,'Feature finite current identity/source absence changed: '+row.identity);
            for(const [page,passages,labels,phrases]of row.printedLocators)fail(registry.pages[page]&&passages.every(p=>registry.passages[p]?.pageOrdinal===page)&&labels.every(i=>row.searchLabelsForDiscoveryOnly[i])&&phrases.every(i=>row.twelveWordPhraseLocatorsForDiscoveryOnly[i]),'Feature finite printed locator changed: '+row.identity);
            for(const [page,labels,phrases]of row.nativeLocators)fail(registry.nativePages[page]&&labels.every(i=>row.searchLabelsForDiscoveryOnly[i])&&phrases.every(i=>row.twelveWordPhraseLocatorsForDiscoveryOnly[i]),'Feature finite native locator changed: '+row.identity);
        }
        citations(registry);
    }
    const expectedRefs=system=>{
        const found=new Map();
        const visit=(value,path='$.system')=>{
            if(Array.isArray(value))value.forEach((x,i)=>visit(x,`${path}[${i}]`));
            else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>visit(v,`${path}.${k}`));
            else if(typeof value==='string')for(const m of value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)){
                const id=`${m[1]}.${m[2]}`;if(!found.has(id))found.set(id,new Set());found.get(id).add(path);
            }
        };visit(system);return [...found].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([target,paths])=>({target,paths:[...paths].sort(),targetContentHash:actualMap.get(target)?.contentHash??null}));
    };
    const published=batch.slices.filter(s=>s.recordFile).flatMap(s=>bundle.files[s.recordFile].records),mirrors=new Map(audit.currentRecordAudit.map(r=>[r.identity,r]));
    const counts={records:0,reviewed:0,unresolved:0,sourceComparisons:0,dependencyRelationships:0,dependencyPaths:0};
    fail(equal([...mirrors.keys()],published.map(r=>r.identity)),'Feature complete published current audit missing');
    for(const row of published){
        const doc=actualMap.get(row.identity)?.data;if(!doc)continue;const system=doc.system,mirror=mirrors.get(row.identity),inventory=Object.keys(system),stored=row.currentRecordEvidence;
        counts.records++;counts[row.coverageState]++;
        fail(row.recordType===doc.type&&row.labelForReview===doc.name&&equal(stored.systemFieldInventory,inventory)&&equal(stored.systemFieldHashes,Object.fromEntries(Object.entries(system).map(([k,v])=>[k,hash(v)])))
            &&equal(stored.documentFieldHashes,Object.fromEntries(Object.entries(doc).map(([k,v])=>[k,hash(v)])))&&equal(stored.currentPrerequisiteArray,system.prerequisites??null)
            &&equal(stored.currentPrerequisiteBackup,doc.flags?.ptu?.prereqBackup??null),'Feature exact current field/backup inventory changed: '+row.identity);
        const notes=featureImplementationNotes(system.effect).map(n=>({...n,rawSha256:textHash(n.rawText)}));let body=system.effect;for(const note of notes)body=body.replace(note.rawText,'');
        const current=parseFeatureRules(body),cw=words(current),rn=moveSourceNumericTokens(current);
        fail(equal(notes,stored.implementationNotes)&&equal(current,stored.currentRuleStructure),'Feature exact current clauses/implementation note changed: '+row.identity);
        const cs=([row.sourceComparison].filter(Boolean)).concat(row.competingSourceComparisons??[]);let proven=false;
        fail(equal(row.sourceSearch.completeDefinitionCandidates.slice().sort(),cs.map(c=>c.sourceUnit).sort())&&equal(row.sourceSearch.examinedCompleteDefinitionCandidates,cs.map(c=>c.sourceUnit)),'Feature available candidate was not examined: '+row.identity);
        for(const c of cs){
            counts.sourceComparisons++;const unit=units.get(c.sourceUnit);if(!unit){fail(false,'Feature unknown source unit: '+c.sourceUnit);continue;}
            const d=unit.definition,fields=new Map(c.fields.map(f=>[f.field,f])),st=c.ruleStructureComparison,sw=words(unit.ruleStructure),sn=moveSourceNumericTokens(unit.ruleStructure),backup=doc.flags?.ptu?.prereqBackup??null;
            const facts={prerequisites:[system.prerequisites??null,d.prerequisites],frequency:[system.frequency??null,d.frequencies],cost:[system.cost??null,d.costs],keywords:[system.keywords??null,d.tags],prerequisiteBackup:[backup,d.prerequisites]};
            for(const [name,[actual,source]]of Object.entries(facts))fail(equal(fields.get(name)?.recordValue,actual)&&equal(fields.get(name)?.[name==='keywords'?'sourceValue':'sourceAlternatives'],source),'Feature literal source/current field changed: '+row.identity+' '+name);
            const pre=d.prerequisites.map(p=>norm(p.text)),frequency=d.frequencies.map(p=>norm(p.text)),cost=d.costs.map(p=>norm(p.text));
            const equalFields={prerequisites:pre.includes(norm((system.prerequisites??[]).join(', '))),frequency:frequency.includes(norm(system.frequency)),cost:cost.includes(norm(system.cost)),keywords:equal((system.keywords??[]).map(norm).sort(),d.tags.map(norm).sort()),prerequisiteBackup:!!norm(backup)&&pre.includes(norm(backup))};
            fail(Object.entries(equalFields).every(([k,v])=>fields.get(k)?.exactOrderedWords===v),'Feature literal field observation changed: '+row.identity);
            const independent=equalFields.prerequisites||equalFields.prerequisiteBackup||equalFields.frequency||equalFields.cost||equalFields.keywords&&d.tags.length>0,named=row.sourceSearch.aliasesForDiscoveryOnly.some(a=>unit.aliases.includes(a)),numeric=safeNumbers(rn,sn),supported=named&&independent&&cw===sw&&numeric;
            fail(c.namedHeaderCandidate===named&&c.independentCurrentFieldSupport===independent&&c.correspondenceSupported===supported,'Feature counterpart lacks complete content/independent fields: '+row.identity);
            fail(equal(st.recordClauseKey,key(current))&&equal(st.sourceClauseKey,key(unit.ruleStructure))&&st.allOrderedWordsEqual===(cw===sw)&&st.allTypedClausesEqual===equal(key(current),key(unit.ruleStructure))
                &&st.recordOrderedWordsSha256===textHash(cw)&&st.sourceOrderedWordsSha256===textHash(sw)&&equal(st.recordNumericTokens,rn)&&equal(st.sourceNumericTokens,sn)&&st.numericCorrespondenceSupported===numeric
                &&(cw===sw||st.orderedWordDifferences.length>0),'Feature full signed/typed source comparison changed: '+row.identity);
            const pp=featurePrerequisiteWordingProof(system.prerequisites,d.prerequisites,norm),ep=featureEffectWordingProof(current,unit,norm,body),cp=featureResourceCostWordingProof(system.cost,d.costs),manual=c.manualSourceDisposition;
            if(manual)fail(manual.prerequisiteWordingProof===pp&&manual.effectWordingProof===ep&&(manual.costWordingProof??null)===cp&&manual.correspondenceSupported===true&&named&&(independent||pp||cp)&&((cw===sw&&numeric)||ep)&&equal(manual.sources,[unit.source]),'Feature bounded source observation unsupported: '+row.identity);
            proven ||= supported||!!manual;
            const expectedAnchor={heading:unit.heading,startLine:unit.anchors[0].startLine,endLine:unit.anchors.at(-1).endLine,pageSegments:unit.anchors,
                definitionContextNormalizedSha256:unit.definitionNormalizedSha256,rawDefinitionSha256:unit.rawDefinitionSha256,nextBoundary:unit.nextBoundary,completeDefinition:true};
            fail(equal(c.anchor,expectedAnchor),'Feature comparison anchor does not bind complete source unit: '+row.identity+' '+unit.id);
            fail(c.sourceDefinitionEvidenceSha256===hash(unit)&&equal(c.source,unit.source)&&c.anchor.rawDefinitionSha256===unit.rawDefinitionSha256&&c.anchor.definitionContextNormalizedSha256===unit.definitionNormalizedSha256
                &&c.sourceLabel===unit.label&&c.sourceRole===(unit.book==='core'?'standard core definition':'explicit optional source definition')
                &&c.productionPolicyPromotion===false&&c.behavioralVerification==='not-run','Feature source boundary/citation/policy changed: '+row.identity);
        }
        if(row.coverageState==='reviewed')fail(proven,'Feature reviewed state has no complete examined correspondence: '+row.identity);
        if(row.coverageState==='unresolved')fail(row.missingEvidence?.currentContentHash===row.contentHash&&row.missingEvidence.sourceAbsenceClaim===false&&row.missingEvidence.neededArtifact.includes(row.identity)&&equal(row.missingEvidence.examinedSourceUnits,cs.map(c=>c.sourceUnit)),'Feature precise authoring/conflict limit missing: '+row.identity);
        const finite=row.sourceSearch.finiteCorpusSearch,searched=bundle.featureSearch?.[finite?.artifact]?.records?.[row.identity];
        fail(searched&&finite.recordKey===row.identity&&finite.recordEvidenceSemanticSha256===hash(searched)&&finite.sourceAbsenceClaim===false&&equal(searched.completeDefinitionCandidates.slice().sort(),cs.map(c=>c.sourceUnit).sort())
            &&equal(row.sourceSearch.printedPassageLocators,searched.printedLocators.map(r=>r[0]))&&equal(row.sourceSearch.nativeJournalLocators,searched.nativeLocators.map(r=>r[0])),'Feature finite authoring search missing or changed: '+row.identity);
        fail(row.sourceSearch.generalContexts.length>0&&row.sourceSearch.generalContexts.every(id=>contexts.has(id))&&row.normativeFieldCoverage.acquisitionPolicy.includes('advisory'),'Feature parent/advisory source context missing: '+row.identity);
        fail((row.sourceSearch.additionalContexts??[]).every(id=>contexts.has(id))&&(row.sourceSearch.supportingSourceUnits??[]).every(id=>units.has(id)),'Feature additional parent/underlying source context missing: '+row.identity);
        const use=row.sourceUseEvidence;
        if(row.frozenQueue.slice==='E1b')fail(use&&typeof use.interpretation==='string'&&use.interpretation.length>80,'Feature material source/use review missing: '+row.identity);
        if(use)fail(equal(use.currentRuleHashes,(system.rules??[]).map(hash))&&equal(use.sourceContexts,row.sourceSearch.additionalContexts)&&use.sourceContexts.every(id=>contexts.has(id))&&use.scopedDefinitionReadings.every(id=>scopes.has(id)&&cs.some(c=>c.sourceUnit===scopes.get(id).sourceUnit))
            &&use.nativeContexts.every(id=>natives.has(id))&&(!use.versionAuthorityUnresolved||row.coverageState==='unresolved')&&use.behavioralVerification==='not-run'&&use.productionPolicyPromotion===false&&mirror.sourceUseEvidenceSemanticSha256===hash(use),'Feature material source/use conditions or version limit changed: '+row.identity);
        const implementation=row.implementationFieldEvidence;
        fail(implementation.ruleElements.length===(system.rules??[]).length&&implementation.ruleElements.every((r,i)=>r.ordinal===i&&equal(r.currentRule,system.rules[i])&&r.currentJsonSha256===hash(system.rules[i]))
            &&equal(implementation.automation,system.automation??null)&&equal(implementation.documentEffects,doc.effects??null)&&implementation.behavioralVerification==='not-run','Feature exact executable objects changed: '+row.identity);
        const refs=expectedRefs(system);counts.dependencyRelationships+=refs.length;counts.dependencyPaths+=refs.reduce((n,r)=>n+r.paths.length,0);
        fail(equal(row.dependencyEvidence.map(r=>({target:r.target,paths:r.paths,targetContentHash:r.targetContentHash})),refs),'Feature exact UUID targets/paths changed: '+row.identity);
        fail(row.exportLineage.snapshots.length===4&&row.exportLineage.snapshots.every((snap,i)=>{
            const h=historical[i],p=h.packs.find(p=>p.pack===row.identity.split('.')[0]);
            return snap.revision===h.revision&&snap.packTree===p.tree&&snap.sourceRecords===p.sourceRecords&&(!snap.recordFound||snap.sameStableId&&snap.historicalContentHash&&snap.historicalLabelForDiscoveryOnly
                &&equal(snap.fieldComparisons.map(f=>f.recordFieldPath),inventory.map(k=>'system.'+k))&&snap.fieldComparisons.every(f=>f.currentJsonSha256===hash(system[f.recordFieldPath.slice(7)])&&f.equal===(f.currentJsonSha256===f.historicalJsonSha256)));
        }),'Feature exact export current fields/lineage changed: '+row.identity);
        fail(mirror?.contentHash===row.contentHash&&mirror.coverageState===row.coverageState&&equal(mirror.systemFieldHashes,stored.systemFieldHashes)&&equal(mirror.sourceComparisons,cs.map(c=>({sourceUnit:c.sourceUnit,evidenceSemanticSha256:hash(c)})))
            &&mirror.dependencyEvidenceSemanticSha256===hash(row.dependencyEvidence)&&mirror.exportLineageSemanticSha256===hash(row.exportLineage)&&mirror.implementationEvidenceSemanticSha256===hash(implementation),'Feature duplicated current audit changed: '+row.identity);
    }
    fail(equal(counts,audit.preparedCounts),'Feature aggregate source counts changed');
    citations(audit);
}
