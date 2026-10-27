import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,recordSourceReviewErrors,parseSourceFeatureRules,sourceReviewWords} from '../tools/record-source-review.mjs';
import {checkFeatureSourceReview} from '../tools/feature-source-review.mjs';
import {parseFeatureDefinition} from '../tools/feature-source-parsing.mjs';
import {moveSourceNumericTokens} from '../tools/move-source-parsing.mjs';

const original=await loadRecordSourceReview();
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):value;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex'),textHash=value=>createHash('sha256').update(value).digest('hex');
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const check=data=>{
    const errors=[],actualMap=new Map(data.source.rows.map(r=>[r.identity,r])),rows=new Map(Object.values(data.files).flatMap(f=>f.records).map(r=>[r.identity,r]));
    checkFeatureSourceReview(data,{fail:(ok,message)=>{if(!ok)errors.push(message);},rows,actualMap,hash,equal,textHash,normalizedText:sourceReviewWords,parseFeatureRules:parseSourceFeatureRules,citations:()=>{}});
    return errors;
};
const fork=()=>({...original,featureSource:{...original.featureSource},featureSearch:{...original.featureSearch},files:{...original.files}});
const rowFork=(id)=>{
    const data=fork(),path=Object.keys(data.files).find(path=>data.files[path].records.some(r=>r.identity===id)),row=structuredClone(data.files[path].records.find(r=>r.identity===id));
    data.files[path]={...data.files[path],records:data.files[path].records.map(r=>r.identity===id?row:r)};return{data,row};
};
const rederiveSourceUnit=unit=>{
    unit.rawDefinitionSha256=textHash(unit.rawDefinition);unit.definition=parseFeatureDefinition(unit.rawDefinition);
    unit.body=unit.definition.sections.filter(s=>!['prerequisites','frequency','profile-frequency','cost','tags'].includes(s.kind)).map(s=>s.kind==='unlabelled'?s.text:`${s.label}: ${s.text}`).join('\n');
    unit.ruleStructure=parseSourceFeatureRules(unit.body);unit.orderedContentWords=unit.ruleStructure.clauses.map(c=>sourceReviewWords(c.text)).join(' ');unit.numericTokens=moveSourceNumericTokens(unit.ruleStructure);
    unit.definitionNormalizedSha256=textHash(sourceReviewWords(unit.rawDefinition));
    unit.fieldWordViews={prerequisites:unit.definition.prerequisites.map(s=>sourceReviewWords(s.text)),frequency:unit.definition.frequencies.map(s=>sourceReviewWords(s.text)),cost:unit.definition.costs.map(s=>sourceReviewWords(s.text)),keywords:unit.definition.tags.map(sourceReviewWords)};
    unit.anchors.at(-1).endLine=unit.anchors[0].startLine+unit.rawDefinition.split('\n').length-1;
};
const refreshComparisonAndClosure=({data,row})=>{
    const cs=[row.sourceComparison,...row.competingSourceComparisons],old=data.featureSource.currentRecordAudit.find(m=>m.identity===row.identity);
    const mirror={...old,sourceComparisons:cs.map(c=>({sourceUnit:c.sourceUnit,evidenceSemanticSha256:hash(c)}))};
    data.featureSource.currentRecordAudit=data.featureSource.currentRecordAudit.map(m=>m.identity===row.identity?mirror:m);
    data.batchManifest=structuredClone(data.batchManifest);const slice=data.batchManifest.batches.find(b=>b.id==='E1').slices.find(s=>s.id===row.frozenQueue.slice);
    slice.closure.evidenceSemanticSha256=hash(data.files[slice.recordFile]);
};
test('complete prepared E1 evidence passes without source-to-policy or predicate approval',()=>{
    assert.deepEqual(check(original),[]);
    assert.equal(original.featureSource.productionPolicyPromotion,false);
    assert.equal(original.featureSource.preparedCounts.records>=85,true);
});
test('selected prerequisite arrays and raw backups cannot substitute for one another',()=>{
    const{data,row}=rowFork('edges.FTh106Tw4v67qQzx');
    row.sourceComparison.fields.find(f=>f.field==='prerequisites').recordValue=['Master Command'];
    assert.ok(check(data).some(e=>e.includes('Feature literal source/current field changed')));
});
test('a matching name cannot approve the changed Elemental Connection version',()=>{
    const{data,row}=rowFork('edges.fURF8NQAVF1jzsBc');
    assert.equal(row.coverageState,'unresolved');row.coverageState='reviewed';row.sourceComparison.correspondenceSupported=true;
    const errors=check(data);assert.ok(errors.some(e=>e.includes('Feature counterpart lacks complete content')));assert.ok(errors.some(e=>e.includes('Feature reviewed state has no complete examined correspondence')));
});
test('bounded layout observations cannot turn into a general wording override',()=>{
    const{data,row}=rowFork('edges.KjZ1VN3rZpnoSRVk');
    row.sourceComparison.manualSourceDisposition.effectWordingProof='any-similar-words';
    assert.ok(check(data).some(e=>e.includes('Feature bounded source observation unsupported')));
});
test('All Ranks and literal source section boundaries are checked against complete raw definitions',()=>{
    const data=fork(),unit=structuredClone(data.featureSource.sourceDefinitions.find(u=>u.label==='Type Expertise'));
    unit.definition.prerequisites[0].text='None';data.featureSource.sourceDefinitions=data.featureSource.sourceDefinitions.map(u=>u.id===unit.id?unit:u);
    const errors=check(data);assert.ok(errors.some(e=>e.includes('Feature full definition census/boundaries changed')));assert.ok(errors.some(e=>e.includes('Feature complete source sections/roles changed')));
});

test('independent Training blocks and section titles cannot be reabsorbed into legitimate Feature Notes',()=>{
    for(const[id,tail]of[
        ['core:60:feature-line17',original.featureSource.generalContexts.find(c=>c.id==='training-feature-use').rawText],
        ['core:59:feature-line46','Pokémon Raising and Battling Features']]){
        const data=fork(),unit=structuredClone(data.featureSource.sourceDefinitions.find(u=>u.id===id));
        assert.ok(unit.definition.sections.some(s=>s.kind==='note'));
        unit.rawDefinition+='\n'+tail;rederiveSourceUnit(unit);
        data.featureSource.sourceDefinitions=data.featureSource.sourceDefinitions.map(u=>u.id===id?unit:u);
        data.featureSource.sourceDefinitionCensus={...data.featureSource.sourceDefinitionCensus,definitionSetSemanticSha256:hash(data.featureSource.sourceDefinitions)};
        assert.ok(check(data).some(e=>e.includes('Feature independent source boundary or legitimate Note changed: '+id)));
    }
});

test('a correct independent-block boundary must still retain the complete legitimate Note',()=>{
    for(const id of ['core:59:feature-line46','core:60:feature-line17']){
        const data=fork(),unit=structuredClone(data.featureSource.sourceDefinitions.find(u=>u.id===id));
        const note=unit.definition.sections.find(s=>s.kind==='note');assert.ok(note.text.length>50);
        unit.rawDefinition=unit.rawDefinition.slice(0,unit.rawDefinition.indexOf('\nNote:'));rederiveSourceUnit(unit);
        data.featureSource.sourceDefinitions=data.featureSource.sourceDefinitions.map(u=>u.id===id?unit:u);
        data.featureSource.sourceDefinitionCensus={...data.featureSource.sourceDefinitionCensus,definitionSetSemanticSha256:hash(data.featureSource.sourceDefinitions)};
        assert.ok(check(data).some(e=>e.includes('Feature independent source boundary or legitimate Note changed: '+id)));
    }
});
test('a finite search cannot drop its native pages or a frozen member',()=>{
    const data=fork(),path='feature-source-search-e1a.json',search=original.featureSearch[path];
    data.featureSearch[path]={...search,sourceRegistry:{...search.sourceRegistry,nativePages:search.sourceRegistry.nativePages.slice(1)},records:{...search.records}};
    delete data.featureSearch[path].records['edges.1i2mJIMNRjkHEfAn'];const errors=check(data);
    assert.ok(errors.some(e=>e.includes('Feature finite corpus/membership coverage changed')));assert.ok(errors.some(e=>e.includes('Feature native corpus silently shrank')));assert.ok(errors.some(e=>e.includes('Feature finite authoring search missing or changed')));
});
test('every material executable object retains its actual value and selector',()=>{
    const{data,row}=rowFork('edges.AlaVe40v8FCAz0yc');row.implementationFieldEvidence.ruleElements[0].currentRule.value=99;
    assert.ok(check(data).some(e=>e.includes('Feature exact executable objects changed')));
});
test('a UUID target at another path does not validate the declared dependency path',()=>{
    const selected=original.featureSource.currentRecordAudit.find(m=>Object.values(original.files).some(f=>f.records.some(r=>r.identity===m.identity&&r.dependencyEvidence?.length)));
    const{data,row}=rowFork(selected.identity);row.dependencyEvidence[0].paths[0]='$.system.unrelated';
    assert.ok(check(data).some(e=>e.includes('Feature exact UUID targets/paths changed')));
});
test('historical current-field equality must describe the exact selected record',()=>{
    const{data,row}=rowFork('edges.0RcsE8QznKmcVYF9'),snapshot=row.exportLineage.snapshots.find(s=>s.recordFound);
    snapshot.fieldComparisons[0].currentJsonSha256='0'.repeat(64);
    assert.ok(check(data).some(e=>e.includes('Feature exact export current fields/lineage changed')));
});
test('the two printed Training durations remain separate even after a self-consistent context edit',()=>{
    const data=fork(),context=structuredClone(data.featureSource.generalContexts.find(c=>c.id==='training-feature-use'));
    context.rawText=context.rawText.replace('at least an hour','one minute');context.rawSha256=textHash(context.rawText);context.normalizedSha256=textHash(sourceReviewWords(context.rawText));
    data.featureSource.generalContexts=data.featureSource.generalContexts.map(c=>c.id===context.id?context:c);
    assert.ok(check(data).some(e=>e.includes('Feature parent rank/training/printed prerequisite facts missing')));
});
test('new slice encodings cannot hide a changed original E1 tuple',()=>{
    const data=fork();data.batchManifest=structuredClone(original.batchManifest);const b=data.batchManifest.batches.find(b=>b.id==='E1');b.slices.find(s=>s.id==='E1e').members.pop();
    const errors=check(data);assert.ok(errors.some(e=>e.includes('Feature original frozen family changed')));assert.ok(errors.some(e=>e.includes('Feature frozen partition changed: E1e')));
});

test('Poké Edge omissions remain unresolved even when the complete effect has a bounded correspondence',()=>{
    for(const id of ['poke-edges.USLnQPfAyIKDFw1z','poke-edges.T8Unk7KdVRkoinYo']){
        const{data,row}=rowFork(id);
        assert.equal(row.coverageState,'unresolved');
        assert.equal(row.sourceComparison.manualSourceDisposition.correspondenceSupported,true);
        row.coverageState='reviewed';
        assert.ok(check(data).some(e=>e.includes('Feature material source/use conditions or version limit changed')));
    }
});

test('the September level-only directive cannot become permission for an extra capability',()=>{
    const data=fork(),context=structuredClone(data.featureSource.generalContexts.find(c=>c.id==='sep-basic-ranged-level-directive'));
    context.rawText+=' Malevolent is also permitted.';context.rawSha256=textHash(context.rawText);context.normalizedSha256=textHash(sourceReviewWords(context.rawText));
    data.featureSource.generalContexts=data.featureSource.generalContexts.map(c=>c.id===context.id?context:c);
    data.featureSource.generalContextSetSemanticSha256=hash(data.featureSource.generalContexts);
    assert.ok(check(data).some(e=>e.includes('Feature bound parent/use context inventory changed')));
});

test('boxed source readings cannot silently absorb an illustration caption',()=>{
    const data=fork(),scope=structuredClone(data.featureSource.sourceScopeReadings.find(c=>c.sourceUnit==='porygon:70:feature-line31'));
    scope.leafRawText+=scope.trailingContextRawText;scope.trailingContextRawText='';scope.leafRawSha256=textHash(scope.leafRawText);scope.leafEndLine=46;
    data.featureSource.sourceScopeReadings=data.featureSource.sourceScopeReadings.map(c=>c.id===scope.id?scope:c);
    assert.ok(check(data).some(e=>e.includes('Feature bound native/visual source readings changed')));
});

test('native Weather proposal context binds the actual journal page instead of a copied claim',()=>{
    const data=fork(),native=structuredClone(data.featureSource.nativeContexts.find(c=>c.id==='native-weather-proposal-introduction'));
    native.rawText+='<p>Climate Controller is now an official core Poké Edge.</p>';native.rawSha256=textHash(native.rawText);native.normalizedSha256=textHash(sourceReviewWords(native.rawText));
    data.featureSource.nativeContexts=data.featureSource.nativeContexts.map(c=>c.id===native.id?native:c);
    assert.ok(check(data).some(e=>e.includes('Feature exact native context changed')));
});

test('material Poké Edge use observations retain the exact current rules and actual supporting contexts',()=>{
    const{data,row}=rowFork('poke-edges.WkzCUjTOCTI60Uwg');
    assert.equal(row.coverageState,'reviewed');
    assert.match(row.sourceUseEvidence.interpretation,/seventeen Type/);
    row.sourceUseEvidence.currentRuleHashes[0]='0'.repeat(64);
    data.featureSource.currentRecordAudit=data.featureSource.currentRecordAudit.map(m=>m.identity===row.identity?{...m,sourceUseEvidenceSemanticSha256:hash(row.sourceUseEvidence)}:m);
    assert.ok(check(data).some(e=>e.includes('Feature material source/use conditions or version limit changed')));
});

test('full validator rejects altered anchors after comparison mirrors and closure digests are refreshed',()=>{
    assert.deepEqual(recordSourceReviewErrors(original),[]);
    const fixture=rowFork('edges.0RcsE8QznKmcVYF9'),c=fixture.row.sourceComparison;
    assert.equal(c.sourceUnit,'core:45:feature-line14');
    c.anchor.heading='UNSUPPORTED ANCHOR';c.anchor.startLine++;c.anchor.pageSegments[0].startLine++;
    refreshComparisonAndClosure(fixture);
    const errors=recordSourceReviewErrors(fixture.data);
    assert.ok(errors.some(e=>e.includes('Feature comparison anchor does not bind complete source unit')));
    assert.ok(!errors.some(e=>e.includes('Feature duplicated current audit changed')||e.includes('Closed slice evidence changed')));
});

test('every duplicated anchor, completeness and citation fact binds directly to its source unit',()=>{
    const mutations=[
        ['heading',c=>{c.anchor.heading='Unsupported';}],['start',c=>{c.anchor.startLine++;}],['end',c=>{c.anchor.endLine++;}],
        ['page segment',c=>{c.anchor.pageSegments[0].startLine++;}],['next boundary',c=>{c.anchor.nextBoundary='Unsupported';}],
        ['completeness',c=>{c.anchor.completeDefinition=false;}],['citation',c=>{c.source.pdfPages=[1];}],
        ['label',c=>{c.sourceLabel='Unsupported';}],['edition role',c=>{c.sourceRole='official errata';}]
    ];
    for(const[label,mutate]of mutations){
        const fixture=rowFork('edges.0RcsE8QznKmcVYF9');mutate(fixture.row.sourceComparison);refreshComparisonAndClosure(fixture);
        const errors=check(fixture.data);
        assert.ok(errors.some(e=>e.includes('Feature comparison anchor does not bind complete source unit')||e.includes('Feature source boundary/citation/policy changed')),label);
        assert.ok(!errors.some(e=>e.includes('Feature duplicated current audit changed')),label);
    }
});
