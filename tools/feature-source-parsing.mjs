// Source evidence only. This module does not evaluate actor prerequisites.
import {moveSourceNumericTokens} from './move-source-parsing.mjs';
const ordinary = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const role = label => label.toLowerCase().replace(/\s+/g, '-');
const header = /^\s*((?:(?:All\s+)?Ranks?\s*(?:[^:;\n]+?\s+)?)?(?:Prerequisites?|Perquisites|Effects?)|Moves|Frequency|Cost|Ingredients?|Trigger|Targets?|Conditions?|Requirements?|Notes?|Special|Connection|Bonus|Static|\d+\s+AP\s+Effect|Scene\s+Effect)\s*([:;])\s*(.*)$/i;
const frequency = /^(?:(?:Ranks?\s+[^:]+:\s*)?(?:Static|At[ -]Will|Daily|Scene|Bind\s+\d+\s+AP|Drain\s+\d+\s+AP|\d+\s+AP|x\d+\s+Uses|(?:Standard|Swift|Free|Extended|Shift)\s+Action|One[ -]Time\s+Use|Special))\b/i;

export function parseFeatureDefinition(rawDefinition) {
    const lines = String(rawDefinition ?? '').split(/\r?\n/), sections = [];
    for (let ordinal = 1; ordinal < lines.length; ordinal++) {
        const line = lines[ordinal], text = line.trim(), match = line.match(header);
        const profile = line.match(/^\s*(Signer|Messiah)\s*:\s*(.*)$/i);
        if (profile) {
            sections.push({kind: 'profile-frequency', rank: null, label: profile[1], text: profile[2], startLine: ordinal + 1, endLine: ordinal + 1});
        } else if (match) {
            const rank = ordinary(match[1]).match(/^((?:All\s+)?Ranks?(?:\s+.+?)?)\s+(Prerequisites?|Perquisites|Effects?)$/i);
            sections.push({kind: role(rank?.[2] ?? match[1]).replace(/^(?:prerequisite|perquisites)$/, 'prerequisites').replace(/^effects$/, 'effect'), rank: rank?.[1] ?? null,
                label: ordinary(match[1]), printedDelimiter: match[2], text: match[3], startLine: ordinal + 1, endLine: ordinal + 1});
        } else if (text && /^\s*(?:\[[^\]\n]+\]\s*)+$/.test(line) && !sections.some(section => section.kind === 'effect')) {
            sections.push({kind: 'tags', rank: null, label: 'printed tags', text: line, startLine: ordinal + 1, endLine: ordinal + 1});
        } else if (text && frequency.test(text) && !sections.some(section => section.kind === 'effect')) {
            sections.push({kind: 'frequency', rank: null, label: 'unlabelled printed frequency/action', text: line, startLine: ordinal + 1, endLine: ordinal + 1});
        } else if (sections.length) {
            sections.at(-1).text += `\n${line}`;
            sections.at(-1).endLine = ordinal + 1;
        } else if (text) sections.push({kind: 'unlabelled', rank: null, label: 'unlabelled source text', text: line, startLine: ordinal + 1, endLine: ordinal + 1});
    }
    for (const section of sections) section.text = section.text.trim();
    return {heading: lines[0] ?? '', sections, prerequisites: sections.filter(section => section.kind === 'prerequisites'),
        frequencies: sections.filter(section => section.kind === 'frequency'), costs: sections.filter(section => section.kind === 'cost'),
        tags: sections.filter(section => section.kind === 'tags').flatMap(section => [...section.text.matchAll(/\[([^\]]+)\]/g)].map(match => match[1])),
        limitation: 'Literal version-specific prerequisite/rank alternatives and ordered sections are evidence, not executable predicates. Acquisition diagnostics are advisory; triggers, costs, targets and effect-use conditions remain separate.'};
}

export function parseFeatureEffectClauses(value, clean = ordinary) {
    const raw = String(value ?? ''), text = raw.replace(/\\n/g, '\n');
    const masked = text.replace(/@(?:UUID|Embed)\[[^\]]*\](?:\{[^}]*\})?/g, reference => '_'.repeat(reference.length));
    const markers = [...masked.matchAll(/\b((?:Ranks?\s+[^:\n]+?\s+)?(?:Effect|Trigger|Target|Condition|Requirement|Special|Connection|Bonus|Note|Moves))\s*(?::|[–—-](?=\s))/gi)]
        .filter(match=>match[1].toLowerCase()!=='moves'||/^\s*$/.test(masked.slice(masked.lastIndexOf('\n',match.index-1)+1,match.index))), clauses = [];
    if (!markers.length) { if (clean(text)) clauses.push({kind: 'effect', text: clean(text)}); }
    else {
        if (clean(text.slice(0, markers[0].index))) clauses.push({kind: 'effect', text: clean(text.slice(0, markers[0].index))});
        for (let ordinal = 0; ordinal < markers.length; ordinal++) {
            const marker = markers[ordinal], body = clean(text.slice(marker.index + marker[0].length, markers[ordinal + 1]?.index ?? text.length));
            if (body) clauses.push({kind: role(marker[1]), text: body});
        }
    }
    return {clauses, representation: {literalParagraphEscapes: (raw.match(/\\n/g) ?? []).length,
        basis: 'Raw fields/UUID paths remain exact. Typed clauses and ordered words are separate views; equal words do not establish role, prerequisite, identity or behavioral equivalence.'}};
}

export function featureImplementationNotes(value) {
    return [...String(value ?? '').matchAll(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi)]
        .filter(match => /automation|automated/i.test(match[0]))
        .map(match => ({startOffset: match.index, rawText: match[0]}));
}

// These observations retain the literal current/source prerequisite fields. They
// do not select a version, evaluate an actor, or turn acquisition into a veto.
export function featurePrerequisiteWordingProof(current, sources, norm) {
    if (!Array.isArray(current) || sources.length !== 1 || sources[0].rank !== null) return null;
    const raw = sources[0].text, source = norm(raw), record = norm(current.join(', '));
    if (record === source) return null;
    if (source === 'none' && current.every(value => ['', '-'].includes(String(value).trim()))) return 'printed-none-versus-empty-prerequisite-representation';
    if (current.length !== 1) return null;
    const rank = '(pathetic|untrained|novice|adept|expert|master)';
    const education = text => text.replace(/\b(?:technology(?: edu(?:cation)?)?|tech education)\b/g, 'technology education').replace(/\bmedicine edu\b/g, 'medicine education');
    if (new RegExp(`^${rank}\\b`).test(source) && education(record) === education(source)) return 'printed-education-skill-shorthand';
    const repeated = source.match(new RegExp(`^${rank} (.+) or \\1 (.+)$`));
    if (repeated && !/[,;()]/.test(raw) && record === `${repeated[1]} ${repeated[2]} or ${repeated[3]}`) return 'printed-repeated-skill-rank-shorthand';
    const list = ordinary(raw).match(new RegExp(`^${rank} (.+)$`, 'i'));
    if (list && !/[;()]/.test(raw)) {
        const parts = list[2].split(',').map(value => value.trim()), last = parts.at(-1);
        const skills = new Set(['acrobatics','athletics','combat','stealth','survival','general education','medicine education','occult education','pokemon education','technology education','charm','command','guile','intimidate','intuition','focus','perception']);
        if (parts.length >= 3 && /^or\s+/i.test(last)) {
            parts[parts.length - 1] = last.replace(/^or\s+/i, '');
            if (parts.every(value => skills.has(norm(value))) && record === `${list[1].toLowerCase()} ${parts.map(norm).join(' or ')}`) return 'printed-canonical-skill-serial-or-list';
        }
    }
    return null;
}

export function featureEffectWordingProof(current, unit, norm, currentRaw) {
    const words = structure => structure.clauses.map(clause => norm(clause.text)).join(' ');
    const cw = words(current), sw = words(unit.ruleStructure), rn = moveSourceNumericTokens(current), sn = moveSourceNumericTokens(unit.ruleStructure);
    const sameNumbers = (a,b) => ![...a,...b].some(value => value.startsWith('unrecognized-sign:')) && JSON.stringify(a) === JSON.stringify(b);
    const bulletPattern=/^\s*-\s+(\d+) Momentum:/gm,sourcePattern=/^\s*»\s+(\d+) Momentum:/gm;
    const bullets=[...String(currentRaw??'').matchAll(bulletPattern)].map(m=>m[1]),sourceBullets=[...String(unit.rawDefinition??'').matchAll(sourcePattern)].map(m=>m[1]);
    if(cw===sw&&bullets.length>0&&JSON.stringify(bullets)===JSON.stringify(sourceBullets)){
        const stripped=String(currentRaw).replace(bulletPattern,'$1 Momentum:');
        if(sameNumbers(moveSourceNumericTokens(parseFeatureEffectClauses(stripped)),sn))return 'printed-numbered-momentum-bullets';
    }
    if (cw !== sw && /\by ellow\b/.test(sw) && cw === sw.replace(/\by ellow\b/g, 'yellow') && sameNumbers(rn,sn)) return 'pdf-capital-yellow-word-gap';
    if (/Level-\s*\n\s*Up/.test(unit.rawDefinition??'') && cw !== sw && cw === sw.replace(/\blevelup\b/g,'level up') && sameNumbers(rn,sn)) return 'printed-level-up-line-wrap';
    const wrapped=new Map();
    for(const m of String(unit.rawDefinition??'').matchAll(/\b([A-Za-z]+)-\s*\n\s*([A-Za-z]+)\b/g)){
        const compound=(m[1]+'-'+m[2]).toLowerCase();
        if(/^(?:super-effective|(?:normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)-type|(?:status|physical|special)-class)$/.test(compound))wrapped.set(m[1].toLowerCase()+m[2].toLowerCase(),m[1].toLowerCase()+' '+m[2].toLowerCase());
    }
    if(wrapped.size&&cw!==sw&&cw===sw.split(' ').map(word=>wrapped.get(word)??word).join(' ')&&sameNumbers(rn,sn))return 'printed-rule-compound-line-wrap';
    const reference='the capabilities listed in the prerequisites for this poke edge';
    const choices=unit.definition.prerequisites?.length===1?ordinary(unit.definition.prerequisites[0].text).match(/\bone of\s+(.+)$/i):null;
    if (choices&&sw.includes(reference)&&cw===sw.replace(reference,norm(choices[1]))&&sameNumbers(rn,sn)) return 'printed-prerequisite-list-reference-expanded';
    const frequencies = unit.definition.frequencies;
    if (frequencies.length === 1 && /^Special\s*[–—-]\s*/i.test(frequencies[0].text)) {
        const combined = {clauses:[{kind:'special',text:frequencies[0].text.replace(/^Special\s*[–—-]\s*/i,'')},...unit.ruleStructure.clauses]};
        if (cw === words(combined) && sameNumbers(rn,moveSourceNumericTokens(combined))) return 'printed-special-frequency-stored-in-effect';
    }
    return null;
}

export function featureResourceCostWordingProof(current,sources) {
    if(sources.length!==1)return null;
    const record=String(current??'').trim(),source=sources[0].text.trim(),a=record.match(/^(\d+)\s*(TP|Tutor Points?)$/i),b=source.match(/^(\d+)\s*(TP|Tutor Points?)$/i);
    return a&&b&&a[1]===b[1]&&a[2].toLowerCase()!==b[2].toLowerCase()?'printed-tutor-point-abbreviation':null;
}
