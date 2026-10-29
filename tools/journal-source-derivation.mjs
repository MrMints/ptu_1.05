import {createHash} from 'node:crypto';
export const jsonHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const textHash = value => createHash('sha256').update(value).digest('hex');
const id = value => /^[A-Za-z0-9]{16}$/.test(value ?? '');
const docTypes = new Set(['Item','Actor','Macro','JournalEntry','RollTable','Folder']);
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0',ndash:'–',mdash:'—',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”',times:'×',frac14:'¼',frac12:'½',frac34:'¾',eacute:'é'};
export function decodeJournalText(value) {
    return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi,(raw,key)=>{
        if (!key.startsWith('#')) return entities[key] ?? raw;
        const n=Number.parseInt(key.slice(key[1].toLowerCase()==='x'?2:1),key[1].toLowerCase()==='x'?16:10);
        return Number.isInteger(n)&&n>=0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):raw;
    });
}
export function journalTarget(kind,payload,parentIdentity,pageIds,prior) {
    if (kind==='CompSearch') return {kind:'dynamic-query',fixedTarget:null,approved:false};
    if (kind==='Poke') return {kind:'currency-literal',value:payload,fixedTarget:null,approved:false};
    if (!['UUID','Embed','Compendium'].includes(kind)) return {kind:'unestablished-enricher',fixedTarget:null,approved:false};
    const literal=kind==='Embed'?payload.split(/\s/)[0]:payload;
    let target=null;
    if (literal.startsWith('.')) {
        const suffix=literal.slice(1);
        if (!id(suffix)) return {kind:'unestablished-relative',literal,fixedTarget:null,approved:false};
        target=parentIdentity+'.JournalEntryPage.'+suffix;
        return {kind:pageIds.has(target)?'exact-frozen-page':'absent-exact-relative-page',fixedTarget:target,approved:false};
    }
    if (literal.startsWith('Actor.')) return {kind:'unestablished-world-actor',fixedTarget:literal,approved:false};
    let bits=literal.split('.');
    if (kind==='Compendium'&&bits[0]==='ptu') bits=['Compendium',...bits];
    if (bits[0]!=='Compendium'||bits[1]!=='ptu') return {kind:'unestablished-reference',literal,fixedTarget:null,approved:false};
    const rootIndex=docTypes.has(bits[3])?4:3;
    if (!/^[\w-]+$/.test(bits[2]??'')||!id(bits[rootIndex])) return {kind:'malformed-compendium-reference',literal,fixedTarget:null,approved:false};
    target=bits[2]+'.'+bits[rootIndex];
    if (bits.length>rootIndex+1) {
        if (bits[rootIndex+1]!=='JournalEntryPage'||!id(bits[rootIndex+2])||bits.length!==rootIndex+3) return {kind:'unestablished-embedded-reference',literal,fixedTarget:null,approved:false};
        target+='.JournalEntryPage.'+bits[rootIndex+2];
        return {kind:pageIds.has(target)?'exact-frozen-page':'unestablished-other-page',fixedTarget:target,approved:false};
    }
    const record=prior.get(target);
    return {kind:record?'prior-exact-record':'unestablished-record',fixedTarget:target,prior:record?{file:record.file,contentHash:record.row.contentHash,coverageState:record.row.coverageState,recordType:record.row.recordType,excluded:record.row.coverageState==='excluded'}:null,approved:false};
}
export function journalEnrichers(raw,parentIdentity,pageIds=new Set(),prior=new Map()) {
    return [...raw.matchAll(/@([A-Za-z]+)\[([^\]]*)\](?:\{([^}]*)\})?/g)].map(m=>({offset:m.index,literal:m[0],kind:m[1],payload:m[2],labelForReviewOnly:m[3]??null,resolution:journalTarget(m[1],m[2],parentIdentity,pageIds,prior)}));
}
// A literal reader, never an HTML renderer. Preserve duplicate attributes and
// explicit cell/span boundaries; neither labels nor cell text creates an ID.
export function journalHtmlTokens(raw) {
    const tokens=[];let i=0;
    while(i<raw.length) {
        if(raw.startsWith('<!--',i)) {const end=raw.indexOf('-->',i+4);const stop=end<0?raw.length:end+3;tokens.push({kind:'comment',raw:raw.slice(i,stop),start:i,end:stop});i=stop;continue;}
        if(raw[i]!=='<') {const end=raw.indexOf('<',i);const stop=end<0?raw.length:end;tokens.push({kind:'text',raw:raw.slice(i,stop),text:decodeJournalText(raw.slice(i,stop)),start:i,end:stop});i=stop;continue;}
        let end=i+1,quote=null;
        for(;end<raw.length;end++) {const c=raw[end];if(quote){if(c===quote)quote=null;}else if(c==='"'||c==="'")quote=c;else if(c==='>')break;}
        const stop=Math.min(end+1,raw.length),body=raw.slice(i,stop),match=body.match(/^<\s*(\/?)\s*([\w:-]+)/);
        if(!match) tokens.push({kind:'literal-markup',raw:body,start:i,end:stop});
        else {const attrs=[];if(!match[1]){const suffix=body.slice(match[0].length).replace(/\/?\s*>$/,'');for(const a of suffix.matchAll(/([^\s=\/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs.push([a[1].toLowerCase(),decodeJournalText(a[2]??a[3]??a[4]??'')]);}
            tokens.push({kind:match[1]?'close':'open',tag:match[2].toLowerCase(),attributes:attrs,selfClosing:/\/\s*>$/.test(body),raw:body,start:i,end:stop});}
        i=stop;
    }
    return tokens;
}
export function journalHtmlFacts(raw) {
    const tokens=journalHtmlTokens(raw),tables=[],stack=[],anchors=[],media=[],headings=[],issues=[];let heading=null;
    for(const t of tokens) {
        const top=stack.at(-1);
        if(t.kind==='text') {if(heading)heading.text+=t.text;if(top?.cell)top.cell.text+=t.text;continue;}
        if(t.kind==='open') {
            if(t.tag==='a')anchors.push(t.attributes);
            if(['img','iframe','audio','video','source','object','embed'].includes(t.tag))media.push({tag:t.tag,attributes:t.attributes});
            if(/^h[1-6]$/.test(t.tag)) {heading={level:Number(t.tag[1]),attributes:t.attributes,text:''};headings.push(heading);}
            if(t.tag==='table') {const table={attributes:t.attributes,rows:[],start:t.start,end:null};tables.push(table);stack.push({table,row:null,cell:null});}
            else if(t.tag==='tr') {if(!top)issues.push('row-outside-table');else {top.row={attributes:t.attributes,cells:[]};top.table.rows.push(top.row);top.cell=null;}}
            else if(['td','th'].includes(t.tag)) {if(!top?.row)issues.push('cell-outside-row');else {top.cell={tag:t.tag,attributes:t.attributes,text:''};top.row.cells.push(top.cell);}}
            else if(t.tag==='br'&&top?.cell)top.cell.text+='\n';
        } else if(t.kind==='close') {
            if(/^h[1-6]$/.test(t.tag))heading=null;
            if(t.tag==='table') {if(!top)issues.push('table-close-without-open');else {top.table.end=t.end;stack.pop();}}
            else if(['td','th'].includes(t.tag)&&top)top.cell=null;
            else if(t.tag==='tr'&&top){top.row=null;top.cell=null;}
        }
    }
    if(stack.length)issues.push('unclosed-table');
    return {rawSha256:textHash(raw),headings,anchors,media,tables,structuralIssues:issues,unresolvedNamedEntities:[...new Set([...raw.matchAll(/&([a-z][\da-z]+);/gi)].map(m=>m[1]).filter(n=>!Object.hasOwn(entities,n)))]};
}
export function journalPages(parentIdentity,doc) {
    if(!Array.isArray(doc.pages)||!id(doc._id)||parentIdentity.split('.').at(-1)!==doc._id)throw Error('Invalid exact parent identity/pages');
    const seen=new Set();
    return doc.pages.map((p,index)=>{
        if(!id(p._id)||seen.has(p._id))throw Error('Duplicate/invalid page identity');seen.add(p._id);
        return {identity:parentIdentity+'.JournalEntryPage.'+p._id,parentIdentity,index,path:`$.pages[${index}]`,pageHash:jsonHash(p),document:p};
    });
}
export function journalPlainText(raw) {return journalHtmlTokens(raw).filter(t=>t.kind==='text').map(t=>t.text).join(' ').replace(/\s+/g,' ').trim();}
export function journalMetadata(doc) {
    return Object.fromEntries(Object.entries(doc).filter(([k])=>k!=='pages').map(([k,v])=>[k,k==='text'?Object.fromEntries(Object.entries(v).filter(([key])=>key!=='content')):v]));
}
export function journalPageFacts(page,pageIds,prior) {
    const doc=page.document,raw=doc.text?.content??'';
    return {identity:page.identity,parentIdentity:page.parentIdentity,index:page.index,path:page.path,pageHash:page.pageHash,
        allTopLevelFields:Object.keys(doc),metadata:journalMetadata(doc),html:journalHtmlFacts(raw),enrichers:journalEnrichers(raw,page.parentIdentity,pageIds,prior)};
}
function flatten(value,path='') {
    return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length
        ?Object.fromEntries(Object.entries(value).flatMap(([k,v])=>Object.entries(flatten(v,path?path+'.'+k:k)))):{[path]:value};
}
export function journalFieldDifferences(before,after) {
    const a=flatten(before),b=flatten(after),out=[];
    for(const path of [...new Set([...Object.keys(a),...Object.keys(b)])].sort()) {
        const oldPresent=Object.hasOwn(a,path),currentPresent=Object.hasOwn(b,path);
        if(oldPresent===currentPresent&&JSON.stringify(a[path])===JSON.stringify(b[path]))continue;
        out.push(path==='text.content'?{path,oldPresent,currentPresent,oldValueSha256:textHash(a[path]??''),currentValueSha256:textHash(b[path]??'')}
            :{path,oldPresent,currentPresent,old:a[path]??null,current:b[path]??null});
    }
    return out;
}
export const VIRTUOSO_JOURNAL_PAGE='journals.cP772AChmDjr486z.JournalEntryPage.2MNSQp6LA1j5wcnT';
// Reuse the already examined E1 source unit by its coordinate identity. This is
// a literal source comparison, not a rank calculator or acquisition predicate.
export function journalVirtuosoFacts(pages,examinations,registry,unit) {
    const page=pages.find(p=>p.identity===VIRTUOSO_JOURNAL_PAGE),exam=examinations.find(p=>p.identity===VIRTUOSO_JOURNAL_PAGE);
    const row=journalHtmlFacts(page?.document.text?.content??'').tables[0]?.rows[7]?.cells.map(c=>c.text.trim())??[];
    const original=String(unit?.rawDefinition??'').replaceAll('\\n','\n').replace(/\s+/g,' ').trim();
    return {pageIdentity:page?.identity??null,pageIndex:page?.index??null,pagePath:page?.path??null,pageHash:page?.pageHash??null,
        pageHasCore52:exam?.examinedOriginalContexts?.includes('core:52')??false,
        nativeRank:row[0]??null,nativeLabelForReviewOnly:row[1]??null,nativeDiceLiteral:row[2]??null,
        sourceUnitIdentity:unit?.id??null,sourcePath:unit?.source?.path??null,sourceSha256:unit?.source?.sha256??null,
        sourcePdfPages:unit?.source?.pdfPages??[],sourcePageTextSha256:unit?.anchors?.find(a=>a.pdfPage===52)?.rawPageSha256??null,
        registryPageTextSha256:registry?.['core:52']?.rawSourcePageTextSha256??null,
        originalPrerequisites:original.match(/Prerequisites: (.*?) Effect:/)?.[1]??null,
        originalChosenSkillMaster:/Effect: Choose a Skill at Master Rank\./.test(original),
        originalEffectiveRank:original.match(/effectively “Rank (\d+)”/)?.[1]??null,
        originalRankDependentFeaturesAndEffects:/for any Features or effects that depend on Skill Rank\./.test(original),
        originalDifferentSkillEachTime:/Virtuoso may be taken multiple times, but you must choose a different Skill each time\./.test(original),
        originalDiceGrant:original.match(/\b\d+d6\b/)?.[0]??null,actualBehavior:'not-run'};
}
export function journalVirtuosoFactErrors(f) {
    const out=[],check=(ok,message)=>{if(!ok)out.push(message);};
    check(f.pageIdentity===VIRTUOSO_JOURNAL_PAGE&&f.pageIndex===7&&f.pagePath==='$.pages[7]'&&f.pageHash==='efdfc4bd6e2f1a0dbcd329e02889ebeed7eca512eebf48e13506245ae4b9d7f8'&&f.pageHasCore52,'H Virtuoso exact page-level core52 binding missing or misassigned');
    check(f.nativeRank==='8'&&f.nativeLabelForReviewOnly==='Virtuoso'&&f.nativeDiceLiteral==='6d6 (still)','H Virtuoso native Rank8/6d6 literal changed or mistaken for8d6');
    check(f.sourceUnitIdentity==='core:52:feature-line54'&&f.sourcePath==='Core System/Pokemon Tabletop United 1.05 Core.pdf'&&f.sourceSha256==='e5e0371031601c3ad0a04056771c17599a2d8826e5a5102ccd37f9b368108907'&&JSON.stringify(f.sourcePdfPages)==='[52]'&&f.sourcePageTextSha256==='a8e0ee1bdfc172ca4c79e94b16873287efa46a6031e4e3aad8c090e850e662bb'&&f.registryPageTextSha256===f.sourcePageTextSha256,'H Virtuoso original conditional source coordinate/edition/anchor changed');
    check(f.originalPrerequisites==='A Skill at Master Rank, Level 20','H Virtuoso original Master Skill/Level20 prerequisites changed');
    check(f.originalChosenSkillMaster&&f.originalEffectiveRank==='8'&&f.originalRankDependentFeaturesAndEffects&&f.originalDifferentSkillEachTime&&f.originalDiceGrant===null,'H Virtuoso conditional effective rank scope replaced with a general dice/rank grant');
    check(f.actualBehavior==='not-run','H Virtuoso source comparison promoted runtime verification');
    return out;
}
// These facts describe literal clauses, not a rules engine or canonical mapping.
// In particular, an omitted phase/die/quantity is kept omitted.
export function journalCriticalFacts(pages,primitives) {
    const native=index=>journalPlainText(pages.find(p=>p.parentIdentity==='journals.cP772AChmDjr486z'&&p.index===index)?.document.text?.content??'');
    const source=id=>primitives.find(p=>p.id===id)?.text??'';
    const diceOrNull=text=>text.match(/\bd(?:20|100)\b/i)?.[0]?.toLowerCase()??null;
    const trickery=native(195),abilities=trickery.match(/following Abilities:\s*([^.]*)/)?.[1]?.split(/,\s*(?:and\s+)?|\s+and\s+/).filter(Boolean)??[];
    const glitch=native(173),death=native(166),loyalty=native(179),peace=native(186);
    return {
        originalRoundDownThreshold:source('core-rounding').match(/decimal is\s*(\.\d+)/i)?.[1]??null,
        nativeRoundDownThreshold:native(40).match(/decimal is\s*(\d+(?:\.\d+)?)/i)?.[1]??null,
        originalTrainingVirtuosoBonus:Number(source('core-training').match(/Virtuoso:\s*\+(\d+)/i)?.[1]??NaN),
        nativeTrainingVirtuosoBonus:Number(native(29).match(/Virtuoso:\s*\+(\d+)/i)?.[1]??NaN),
        nativeDeathAura:{hpFraction:death.match(/lose\s*(1\/\d+)/)?.[1]??null,turnPhase:/\bend of (?:their|the|its) turn\b/i.test(death)?'end':/\bbeginning of (?:their|the|its) turn\b/i.test(death)?'beginning':null},
        nativeGlitch:{chancePercent:Number(glitch.match(/(\d+)%/)?.[1]??NaN),specifiedDie:diceOrNull(glitch)},
        nativeTrickery:{darkStab:/gain STAB on all Dark Type Moves/.test(trickery),extraFlatDamageBonus:/\+5\b/.test(trickery),abilityLabelsForReviewOnly:abilities},
        nativeLoyalty:{initialOperation:/lowered to -3/.test(loyalty)?'set-to':null,initialValue:-3,additionalOperation:/lowered by another -1/.test(loyalty)?'decrease-by':null,additionalValue:1},
        nativePeace:{operation:/set to -6 Combat Stages/.test(peace)?'set-to':null,value:-6},
        nativeAuraStageIncrement:Number(native(161).match(/gain\s*\+(\d+)\s*to each of their Combat Stages/i)?.[1]??NaN),
        originalAuraStageIncrement:Number(source('blessed-aura').match(/gain\s*\+(\d+)\s*to each of their Combat Stages/i)?.[1]??NaN),
        nativeDivineDeathPercent:native(198).match(/-200%/)?.[0]??null,originalDivineDeathPercent:source('blessed-divine-death').match(/-100%/)?.[0]??null,
        nativeCaptureAc:Number(native(34).match(/AC\s*(\d+)/i)?.[1]??NaN),originalCaptureAc:Number(source('core-capture').match(/AC\s*(\d+)/i)?.[1]??NaN),
        nativeCaptureDie:native(34).match(/1d100/)?.[0]??null,
        nativeBooksHasPlaytestLabel:/playtest/i.test(native(96)),bookOriginalKind:primitives.find(p=>p.id==='may-books')?.sourceKind??null,
        nativeBooksHalfHour:/half an hour/.test(native(96)),originalBooksHalfHour:/half an hour/.test(source('may-books')),
        nativeHerbalSecondBlocksBuffAndTempHp:/second time[\s\S]*?un-?\s*able to gain Food Buffs or Temporary Hit Points/i.test(native(228)),
        originalHerbalSecondBlocksBuffAndTempHp:/second time[\s\S]*?un-?\s*able to gain Food Buffs or Temporary Hit Points/i.test(source('may-herbal')),
        nativeHerbalThirdDefaultReduction:/default Combat Stage[\s\S]*?reduced by 1/.test(native(228)),
        originalAvatarTwo:source('porygon-avatar-two').match(/gains a (\dd6)/)?.[1]??null,
        originalAvatarThree:source('porygon-avatar-three').match(/gains a (\dd6)/)?.[1]??null,
        avatarReprintsSameSourceEdition:primitives.find(p=>p.id==='porygon-avatar-two')?.citation?.sha256===primitives.find(p=>p.id==='porygon-avatar-three')?.citation?.sha256,
        originalGlitchVariantDie:source('porygon-glitch').match(/1d20/)?.[0]??null,nativeGlitchVariantBadToken:/1420/.test(native(210)),
        nativeClassMarker205Empty:native(205)==='',nativeDispositionHasReferences:/@(?:UUID|Compendium|CompSearch)/.test(native(35)),
        nativeRequiredLegacyPokeEdgeRemoval:/loses prerequisites[\s\S]*it is removed/.test(native(30)),
        canonicalMappingGranted:false,wholeCurrentVersionApproved:false,executedBehavior:'not-run'
    };
}
export function journalCriticalFactErrors(f) {
    const out=[],check=(ok,message)=>{if(!ok)out.push(message);};
    check(f.originalRoundDownThreshold==='.5'&&f.nativeRoundDownThreshold==='5','H literal original .5/native5 rounding copy defect erased');
    check(f.originalTrainingVirtuosoBonus===15&&f.nativeTrainingVirtuosoBonus===15,'H original/core202 Virtuoso+15 training mistaken for new rank adaptation');
    check(f.nativeDeathAura.hpFraction==='1/10'&&f.nativeDeathAura.turnPhase===null,'H DeathAura per-turn loss acquired an invented turn phase');
    check(f.nativeGlitch.chancePercent===50&&f.nativeGlitch.specifiedDie===null,'H Glitch50% acquired an invented random die');
    check(f.nativeTrickery.darkStab&&!f.nativeTrickery.extraFlatDamageBonus&&JSON.stringify(f.nativeTrickery.abilityLabelsForReviewOnly)===JSON.stringify(['Prankster','Frisk','Infiltrator','Pickpocket','Run Away']),'H Trickery STAB and five Ability labels conflated with +5 damage or persistent identities');
    check(f.nativeLoyalty.initialOperation==='set-to'&&f.nativeLoyalty.additionalOperation==='decrease-by'&&f.nativePeace.operation==='set-to','H set-to/decrease-by combat-stage roles conflated');
    check(f.originalAuraStageIncrement===2&&f.nativeAuraStageIncrement===1,'H original/current Aura stage alternatives blended');
    check(f.originalDivineDeathPercent==='-100%'&&f.nativeDivineDeathPercent==='-200%','H divine death original/current alternatives blended');
    check(f.originalCaptureAc===6&&f.nativeCaptureAc===4&&f.nativeCaptureDie==='1d100','H original capture/native hybrid roles blended');
    check(f.bookOriginalKind==='optional-playtest'&&!f.nativeBooksHasPlaytestLabel&&f.nativeBooksHalfHour&&f.originalBooksHalfHour,'H unmarked optional May Book framework promoted or misattributed');
    check(f.originalHerbalSecondBlocksBuffAndTempHp&&f.nativeHerbalSecondBlocksBuffAndTempHp&&f.nativeHerbalThirdDefaultReduction,'H Herbal second-use prohibition or default-CS third-use penalty reversed');
    check(f.originalAvatarTwo==='2d6'&&f.originalAvatarThree==='3d6'&&f.avatarReprintsSameSourceEdition,'H same-book Digital Avatar alternatives erased or mistaken for chronological editions');
    check(f.originalGlitchVariantDie==='1d20'&&f.nativeGlitchVariantBadToken,'H original1d20/native1420 corruption erased');
    check(f.nativeClassMarker205Empty&&!f.nativeDispositionHasReferences,'H empty marker/complete Disposition page boundaries conflated');
    check(f.nativeRequiredLegacyPokeEdgeRemoval,'H retained legacy acquisition/removal instruction hidden');
    check(f.canonicalMappingGranted===false&&f.wholeCurrentVersionApproved===false&&f.executedBehavior==='not-run','H critical source facts promoted behavior/canonical/version approval');
    return out;
}
