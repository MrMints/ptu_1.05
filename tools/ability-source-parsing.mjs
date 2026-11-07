// Source-only parsing. These definitions never enter runtime selection policy.
const ordinary = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const headerKey = value => ordinary(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function extractAbilityDefinitions(book, pages, ranges, options = {}) {
    const records = [], rejected = [];
    for (const [first, last] of ranges) {
        let active = null;
        const finish = () => {
            if (!active) return;
            const raw = active.lines.map(line => line.text).join('\n').trim();
            const marker = raw.search(/\b(?:Effect|Trigger|Target|Bonus|Special)\s*:/i);
            const header = marker < 0 ? raw : raw.slice(0, marker).trim(), body = marker < 0 ? '' : raw.slice(marker).trim();
            const headerFields = {};
            const headerMarkers = [...header.matchAll(/\b(Range|Keywords)\s*:/gi)];
            for (let ordinal = 0; ordinal < headerMarkers.length; ordinal++) {
                const entry = headerMarkers[ordinal], end = headerMarkers[ordinal + 1]?.index ?? header.length;
                headerFields[entry[1].toLowerCase()] = ordinary(header.slice(entry.index + entry[0].length, end));
            }
            const frequency = ordinary(header.slice(0, headerMarkers[0]?.index ?? header.length));
            const anchor = active.parts.map(part => ({pdfPage: part.page, startLine: part.startLine, endLine: part.endLine}));
            const unit = {id: `${book}:${active.page}:ability-line${active.startLine}`, book, label: ordinary(active.label),
                aliases: ordinary(active.label).split(/\s*\/\s*/).map(headerKey), frequency, headerFields, body, rawDefinition: `${active.label}\n${raw}`,
                heading: active.heading, anchors: anchor, nextBoundary: active.nextBoundary ?? 'end of explicit definition range'};
            if (!/^(?:Static|Scene|Daily|At[ -]Will|Special|One Time Use)\b/i.test(frequency) || !/\bEffect\s*:/i.test(body)) rejected.push({...unit, reason: 'A name/slot/mention without a complete frequency/effect definition is not a definition.'});
            else records.push(unit);
            active = null;
        };
        for (let page = first; page <= last; page++) {
            const lines = String(pages[page] ?? '').split(/\r?\n/);
            let stopped = false;
            for (let ordinal = 0; ordinal < lines.length; ordinal++) {
                const line = lines[ordinal], trimmed = line.trim();
                if ((options.stopHeadings ?? []).includes(trimmed)) { if (active) active.nextBoundary = trimmed; finish(); stopped = true; break; }
                if (!trimmed || /^(?:Indices and Reference|Trainer Classes|Feb 2016 Playtest|Sept 2015 Playtest|Genre and Setting|Chapter One: Genre and Setting|\d+|Ability List:.*|Altered\s+Abilities|New\s+Abilities!)$/.test(trimmed)) continue;
                const match = line.match(/^\s*Ability:\s*([^\n]+)$/) ?? ((options.extraHeadings ?? []).includes(trimmed) ? [line, trimmed] : null);
                if (match) {
                    if (active) active.nextBoundary = ordinary(line);
                    finish(); active = {label: match[1], heading: ordinary(line), page, startLine: ordinal + 1, lines: [], parts: []}; continue;
                }
                if (!active) continue;
                active.lines.push({page, ordinal: ordinal + 1, text: line});
                const lastPart = active.parts.at(-1);
                if (!lastPart || lastPart.page !== page) active.parts.push({page, startLine: ordinal + 1, endLine: ordinal + 1});
                else lastPart.endLine = ordinal + 1;
            }
            if (stopped) break;
        }
        finish();
    }
    return {records, rejected};
}

export function parseAbilityRuleClauses(value, clean = ordinary) {
    const literalParagraphEscapes = (String(value ?? '').match(/\\n/g) ?? []).length;
    let text = clean(String(value ?? '').replace(/\\n/g, '\n')), tags = [];
    const takeTag = (match, tag) => { tags.push(tag); return ''; };
    // Only explicit standalone keyword markers are separated. A word embedded
    // in a rule sentence, or an apparent source typo such as movesf, is retained.
    text = text.replace(/^\s*(Defensive|Immune)[.:]?\s*(?=(?:Effect|Trigger|Target)\s*:)/i, takeTag);
    text = text.replace(/(^|[.!?]\s+)(Defensive|Immune)[.!](?=\s|$)/gi, (match, separator, tag) => {
        tags.push(tag); return separator;
    });
    text = text.replace(/(^|[.!?]\s+)(Defensive|Immune)[.!]?\s*$/i, (match, separator, tag) => {
        tags.push(tag); return separator.trimEnd();
    }).trim();
    const markers = [...text.matchAll(/\b(Trigger|Target|Effect|Bonus|Special|Connection|Note)\s*(?::|[–—-](?=\s))/gi)];
    const clauses = [];
    if (!markers.length) { if (text) clauses.push({kind: 'effect', text}); }
    else {
        if (text.slice(0, markers[0].index).trim()) clauses.push({kind: 'effect', text: text.slice(0, markers[0].index).trim()});
        for (let ordinal = 0; ordinal < markers.length; ordinal++) {
            const marker = markers[ordinal], end = markers[ordinal + 1]?.index ?? text.length, body = text.slice(marker.index + marker[0].length, end).trim();
            if (body) clauses.push({kind: marker[1].toLowerCase(), text: body});
        }
    }
    if (clauses.some(clause => clause.kind === 'connection')) tags.push('Connection');
    return {clauses, explicitTags: [...new Set(tags.map(tag => tag[0].toUpperCase() + tag.slice(1).toLowerCase()))].sort(),
        representation: {literalParagraphEscapes, basis: 'Literal backslash-n sequences are separately interpreted as paragraph separators for this structured comparison only; raw current/source hashes retain their exact stored strings. No rule-word spelling is repaired.'}};
}
