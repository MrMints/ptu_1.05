// Source-examination grammar only; no runtime import or policy promotion.
const ordinary = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const key = value => ordinary(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const kind = value => ordinary(value).toLowerCase().replace(/\s+/g, '-');
const ruleKinds = new Set(['effect', 'set-up-effect', 'resolution-effect', 'trigger', 'target', 'special', 'connection', 'bonus', 'note']);
const fieldHeader = /^\s*(Type|Frequency|AC|Class|Range|Contest\s+Type|Contest\s+Effect|Special|Limitations?|Weapon\s+Suggestions|Trigger|Target|(?:Set[- ]Up\s+|Resolution\s+)?Effect|Prerequisites|Cost|Connection|Bonus|Note)\s*:\s*(.*)$/i;

export function extractMoveDefinitions(book, pages, ranges, options = {}) {
    const records = [], rejected = [];
    for (const [first, last] of ranges) {
        let active = null;
        const finish = () => {
            if (!active) return;
            const segments = [];
            for (const line of active.lines) {
                const db = line.text.match(/^\s*Damage\s+Base(?:\s+([^:]+?))?\s*:\s*(.*)$/i), match = line.text.match(fieldHeader);
                if (db) segments.push({kind: 'damage-base', label: 'Damage Base', value: ordinary(db[1] ?? db[2]), printedRoll: db[1] ? db[2] : null, lines: [{page: line.page, line: line.line}]});
                else if (match) segments.push({kind: kind(match[1]).replace('setup-effect', 'set-up-effect'), label: ordinary(match[1]), value: match[2], lines: [{page: line.page, line: line.line}]});
                else if (segments.length) { segments.at(-1).value += `\n${line.text}`; segments.at(-1).lines.push({page: line.page, line: line.line}); }
            }
            const fields = {};
            for (const segment of segments) (fields[segment.kind] ??= []).push(segment.value.trim());
            const rules = segments.filter(segment => ruleKinds.has(segment.kind));
            const unit = {id: `${book}:${active.page}:move-line${active.startLine}`, book, label: ordinary(active.label), aliases: [key(active.label)], heading: active.heading,
                fields, segments, effectText: rules.map(segment => `${segment.label}: ${segment.value.trim()}`).join('\n'),
                dependentConditions: segments.filter(segment => ['limitation', 'limitations', 'prerequisites', 'cost', 'weapon-suggestions'].includes(segment.kind)),
                rawDefinition: `${active.heading}\n${active.lines.map(line => line.text).join('\n')}`, anchors: active.parts, nextBoundary: active.nextBoundary ?? 'end of explicit definition range'};
            if (!fields.type?.length || !fields.frequency?.some(value => /^(?:At[ -]Will|EOT|Scene|Daily|Static|See Text|See Effect)\b/i.test(ordinary(value)))) rejected.push({...unit, reason: 'Printed header explanation/mention lacks a complete literal Move Type/frequency definition.'});
            else records.push(unit);
            active = null;
        };
        for (let page = first; page <= last; page++) {
            const lines = String(pages[page] ?? '').split(/\r?\n/);
            for (let ordinal = 0; ordinal < lines.length; ordinal++) {
                const line = lines[ordinal], text = line.trim();
                if ((options.boundaries ?? []).some(pattern => pattern.test(text))) { if (active) active.nextBoundary = ordinary(line); finish(); continue; }
                if (!text || /^(?:\d+|Indices and Reference|Gear and Items|Gear and Alchemy|Genre and Setting|Sept 2015 Playtest|Master Weapon Moves|(?:Bug|Dark|Dragon|Electric|Fairy|Fighting|Fire|Flying|Ghost|Grass|Ground|Ice|Normal|Poison|Psychic|Rock|Steel|Water) Moves)$/.test(text)) continue;
                const heading = line.match(/^\s*Move:\s*(.+)$/) ?? ((options.extraHeadings ?? []).includes(text) ? [line, text] : null);
                if (heading) { if (active) active.nextBoundary = ordinary(line); finish(); active = {label: heading[1], heading: ordinary(line), page, startLine: ordinal + 1, lines: [], parts: []}; continue; }
                if (!active) continue;
                active.lines.push({page, line: ordinal + 1, text: line});
                const part = active.parts.at(-1);
                if (!part || part.pdfPage !== page) active.parts.push({pdfPage: page, startLine: ordinal + 1, endLine: ordinal + 1});
                else part.endLine = ordinal + 1;
            }
        }
        finish();
    }
    return {records, rejected};
}

export function parseMoveRuleClauses(value, clean = ordinary) {
    const raw = String(value ?? ''), text = clean(raw.replace(/\\n/g, '\n'));
    const markers = [...text.matchAll(/\b(Set[- ]Up\s+Effect|Resolution\s+Effect|Effect|Trigger|Target|Special|Connection|Bonus|Note)\s*(?::|[–—-](?=\s))/gi)], clauses = [];
    if (!markers.length) { if (text) clauses.push({kind: 'effect', text}); }
    else {
        if (text.slice(0, markers[0].index).trim()) clauses.push({kind: 'effect', text: text.slice(0, markers[0].index).trim()});
        for (let ordinal = 0; ordinal < markers.length; ordinal++) {
            const marker = markers[ordinal], body = text.slice(marker.index + marker[0].length, markers[ordinal + 1]?.index ?? text.length).trim();
            if (body) clauses.push({kind: kind(marker[1]), text: body});
        }
    }
    return {clauses, representation: {literalParagraphEscapes: (raw.match(/\\n/g) ?? []).length, basis: 'Literal backslash-n is a paragraph representation only. Typed labels and every ordered rule word remain separate; raw field hashes retain stored strings and no source spelling is repaired.'}};
}

export function extractContestDefinitions(book, pages, selectedPages) {
    const records = [];
    for (const page of selectedPages) {
        const lines = String(pages[page] ?? '').split(/\r?\n/); let active = null;
        const finish = boundary => {
            if (!active) return;
            records.push({id: `${book}:${page}:contest-line${active.startLine}`, book, label: ordinary(active.label), aliases: [key(active.label)], heading: active.heading,
                dice: active.dice, effectText: active.lines.join('\n').trim(), rawDefinition: `${active.heading}\n${active.lines.join('\n')}`, anchors: [{pdfPage: page, startLine: active.startLine, endLine: active.endLine}], nextBoundary: boundary});
            active = null;
        };
        for (let ordinal = 0; ordinal < lines.length; ordinal++) {
            const line = lines[ordinal], text = line.trim();
            if (text === 'Contest Mechanics') { finish(text); break; }
            const heading = line.match(/^\s*([^:]+?)\s*:\s*([\dXx]+)d6\s*[–—-]\s*(.*)$/);
            if (heading) { finish(ordinary(line)); active = {label: heading[1], heading: ordinary(line), dice: heading[2].toUpperCase(), startLine: ordinal + 1, endLine: ordinal + 1, lines: [heading[3]]}; }
            else if (active && text && !/^\d+$/.test(text)) { active.lines.push(line); active.endLine = ordinal + 1; }
        }
        finish('end of explicit Contest Effect table');
    }
    return records;
}

export function extractCompactGlitchMoves(book, pageText, page = 39) {
    if (!/ideas for new Glitch Type Moves/.test(pageText)) throw new Error('Compact Type authority must be the explicit printed Glitch-Type introduction.');
    const lines = pageText.split(/\r?\n/), blocks = []; let active = null;
    for (let ordinal = 0; ordinal < lines.length; ordinal++) {
        const text = lines[ordinal].trim();
        if (text === 'Glitch Affliction') { if (active) blocks.push(active); active = null; break; }
        if (/^.+?\s+-\s+AC\s+/.test(text)) { if (active) blocks.push(active); active = {startLine: ordinal + 1, endLine: ordinal + 1, text}; }
        else if (active && text) { active.text += `\n${text}`; active.endLine = ordinal + 1; }
    }
    if (active) blocks.push(active);
    return blocks.map((block, ordinal) => {
        const parts = block.text.split(/\s+-\s+/), label = parts.shift(), ac = parts.shift()?.match(/^AC\s+(.+)$/)?.[1], frequency = parts.shift();
        const db = parts[0]?.match(/^DB\s+(\d+):\s*(.+)$/), damageBase = db ? (parts.shift(), db[1]) : null;
        const category = parts.shift(), range = parts.shift(), effect = parts.join(' - ');
        if (!ac || !frequency || !['Physical', 'Special', 'Status'].includes(category) || !range || !effect) throw new Error(`Unparsed available compact Move: ${block.text}`);
        const fields = {type: ['Glitch'], frequency: [frequency], ac: [ac], class: [category], range: [range], effect: [effect]};
        if (damageBase) fields['damage-base'] = [damageBase];
        return {id: `${book}:${page}:compact-move-line${block.startLine}`, book, label, aliases: [key(label)], heading: label, fields,
            segments: Object.entries(fields).flatMap(([kind, values]) => values.map(value => ({kind, label: kind, value}))),
            effectText: `Effect: ${effect}`, dependentConditions: [], rawDefinition: block.text,
            anchors: [{pdfPage: page, startLine: block.startLine, endLine: block.endLine}], nextBoundary: blocks[ordinal + 1]?.text.split(/\s+-\s+/)[0] ?? 'Glitch Affliction',
            compactSourceEvidence: {typeBasis: 'Here are a few ideas for new Glitch Type Moves.', printedDamageRoll: db?.[2] ?? null, omittedFields: ['Contest Type', 'Contest Effect']}};
    });
}
