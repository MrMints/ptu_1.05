import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readPackSources} from './pack-sources.mjs';
import {checkUnmatchedSpecies} from './species-unmatched-review.mjs';
import {parseAbilityRuleClauses} from './ability-source-parsing.mjs';
import {checkAbilitySourceReview} from './ability-source-review.mjs';
import {parseMoveRuleClauses} from './move-source-parsing.mjs';
import {checkMoveSourceReview} from './move-source-review.mjs';
import {parseFeatureEffectClauses} from './feature-source-parsing.mjs';
import {checkFeatureSourceReview} from './feature-source-review.mjs';
import {checkItemSourceReview} from './item-source-review.mjs';
import {checkEffectSourceReview} from './effect-source-review.mjs';
import {checkTemporarySpeciesSourceReview} from './temporary-species-source-review.mjs';
import {checkEffectSliceSourceReview} from './effect-slice-source-review.mjs';
import {checkEffectOtherSourceReview} from './effect-other-source-review.mjs';
import {checkEffectF3cSourceReview} from './effect-f3c-source-review.mjs';
import {checkEffectF3dSourceReview} from './effect-f3d-source-review.mjs';
import {checkEffectF3eSourceReview} from './effect-f3e-source-review.mjs';
import {checkEffectF3fSourceReview} from './effect-f3f-source-review.mjs';
import {checkEffectF3gSourceReview} from './effect-f3g-source-review.mjs';
import {checkEffectF3hSourceReview} from './effect-f3h-source-review.mjs';
import {checkReferenceF4aSourceReview} from './reference-f4a-source-review.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const labelKey = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const textHash = value => createHash('sha256').update(value).digest('hex');
// Match the review ledger's documented text representation: decode HTML,
// replace UUID markup with its visible label, join PDF hyphenated line wraps,
// fold Unicode punctuation/accents, then retain words, signs, %, and fractions.
const textEntities = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', frac14: '¼', frac12: '½', frac34: '¾', eacute: 'é'};
const cleanText = value => String(value || '').replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (match, code) => {
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(code[1].toLowerCase() === 'x' ? 2 : 1), code[1].toLowerCase() === 'x' ? 16 : 10));
    return textEntities[code] ?? match;
}).replace(/@UUID\[[^\]]+\]\{(?:Effect: |Order: )?([^}]+)\}/g, '$1').replace(/@UUID\[[^\]]+\]/g, '').replace(/<[^>]*>/g, ' ')
    .replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').replaceAll('Y ou', 'You').replaceAll('Y et', 'Yet').replaceAll('Poké mon', 'Pokémon')
    .normalize('NFKD').replace(/\p{M}/gu, '').replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replaceAll('×', 'x').replaceAll('¼', '1/4').replaceAll('½', '1/2').replaceAll('¾', '3/4').replace(/\s+/g, ' ').trim();
const normalizedText = value => (cleanText(value).toLowerCase().match(/[a-z0-9]+|[+%/]|-(?=\d)/g) ?? []).join(' ');
// Legacy empty-string list slots carry no values; nonempty scalar lists are an
// evidence error, not an invitation to compare individual characters.
const normalizedLabels = values => Array.isArray(values) ? values.map(labelKey).sort() : values == null || values === '' ? [] : null;
const json = async path => JSON.parse(await readFile(path, 'utf8'));
export function parseSourceAbilityRules(value) { return parseAbilityRuleClauses(value, cleanText); }
export function parseSourceMoveRules(value) { return parseMoveRuleClauses(value, cleanText); }
export function parseSourceFeatureRules(value) { return parseFeatureEffectClauses(value, cleanText); }
export const sourceReviewText = cleanText;
export const sourceReviewWords = normalizedText;
export function parseSourceAcquisition(value, machine = false) {
    let text = cleanText(value);
    if (/^None[.!]?$/i.test(text)) return {entries: [], annotatedEntries: [], repeatedHeadings: [], boundary: 'empty-list'};
    if (/\bMew can learn any TM\s*\/\s*HM\b/i.test(text)) return {entries: [], annotatedEntries: [], repeatedHeadings: [], boundary: 'universal-machine'};
    if (/\bMew can be tutored to learn any Move\b/i.test(text)) return {entries: [], annotatedEntries: [], repeatedHeadings: [], boundary: 'universal-tutoring'};
    const footer = text.match(/\*?(?:\bMega Evolution\b|\bUltra Burst\b|\bMultiform\b|\bTherian Forme\b|\bConfined\b|\bDragon Fusion\b|\bForme Change\b|\bOrigin Forme\b|\bSky Forme\b|\bZygarde Cube Move List\b|\bNote\s*:|\bSmall\s+HP\s*:)/i);
    const boundary = footer?.[0]?.replace(/^\*/, '') ?? null;
    if (footer) text = text.slice(0, footer.index);
    const repeatedHeadings = [...text.matchAll(/\b(?:TM(?:\s*\/\s*HM)?|HM|TR|Egg|Tutor)\s+Move\s+List\b/gi)].map(match => match[0]);
    text = text.replace(/\b(?:TM(?:\s*\/\s*HM)?|HM|TR|Egg|Tutor)\s+Move\s+List\b/gi, ',');
    // A qualified sublist can begin on a new line without a preceding comma.
    // The printed M/F prefix is its own entry boundary, never part of the
    // preceding Move name; N remains an annotation on the following entry.
    text = text.replace(/([^,\s])\s+(?=\([MF]\)\s+[A-Za-z])/g, '$1, ');
    if (machine) text = text.replace(/([^,\s])\s+(?=(?:A\d+|\d{2,3})\s+[A-Za-z])/g, '$1, ');
    const tokens = text.split(',').map(entry => (machine ? entry.replace(/^\s*(?:A\d+|\d+)\s*/, '') : entry).trim()).filter(Boolean);
    const annotatedEntries = tokens.map(entry => ({key: labelKey(entry.replace(/^\([MF]\)\s*/, '').replace(/\(N\)/g, '')),
        qualifiers: [...(entry.match(/^\(([MF])\)/)?.slice(1) ?? []), ...(/\(N\)/.test(entry) ? ['N'] : [])]}));
    return {entries: annotatedEntries.map(entry => entry.key), annotatedEntries: annotatedEntries.filter(entry => entry.qualifiers.length), repeatedHeadings, boundary};
}
export function extractSourceAcquisitionSection(pageText, group) {
    const text = String(pageText ?? ''), headings = [...text.matchAll(/^[ \t]*(s?)(Level\s+Up|TM(?:\s*\/\s*HM)?|HM|TR|Egg|Tutor)\s+Move\s+List[ \t]*\r?$/gmi)];
    const kind = match => /^(?:TM|HM|TR)/i.test(match[2]) ? 'machine' : /^Level/i.test(match[2]) ? 'level' : match[2].toLowerCase();
    const first = headings.findIndex(match => kind(match) === group);
    if (first < 0) return null;
    const start = headings[first], following = headings.slice(first + 1), nextList = following.find(match => kind(match) !== group);
    // A secondary Zen Mode stat block follows the tutor list on plus p.418.
    // Keep that independently reviewed block outside the acquisition section.
    const statBlock = [...text.matchAll(/^[ \t]*(?:\d+\.\s*)?[A-Z][A-Z \t-]+[ \t]+Zen Mode[ \t]*\r?\n(?=\s*Base Stats:)/gm)].find(match => match.index > start.index);
    const end = statBlock && (!nextList || statBlock.index < nextList.index) ? statBlock : nextList, stop = end?.index ?? text.length;
    return {raw: text.slice(start.index + start[0].length, stop), startLine: text.slice(0, start.index).split('\n').length,
        endLine: text.slice(0, stop).split('\n').length, openingHeading: start[0].trim(), closingHeading: end?.[0].trim() ?? null,
        repeatedHeadings: following.filter(match => match.index < stop).map(match => match[0].trim())};
}
export function parseSourceLevelAcquisition(value) {
    const text = cleanText(value), entries = [];
    const rows = /(?:^|\s)(?:([§*])\s*)?(?:\(([MF])\)\s*)?(Evo|\d+)\s+([A-Za-z].*?)(?=\s+(?:[§*]\s*)?(?:\([MF]\)\s*)?(?:Evo|\d+)\s+[A-Za-z]|$)/g;
    for (const match of text.matchAll(rows)) {
        const qualifiers = [...(match[2] ? [match[2]] : []), ...[...match[4].matchAll(/\(([MFN])\)/g)].map(value => value[1])];
        const trailingMarkers = /\|\s*$/.test(match[4]) ? ['|'] : [];
        let body = match[4].replace(/\(([MFN])\)/g, '').replace(/\s*\|\s*$/, '').trim(), printedType = null;
        const type = body.match(/^(.*?)\s+-\s*([A-Za-z]+)\s*$/) ?? body.match(/^(.*?)-\s*(Normal|Fire|Water|Grass|Electric|Ice|Fighting|Poison|Ground|Flying|Psychic|Bug|Rock|Ghost|Dragon|Dark|Steel|Fairy)\s*$/i);
        if (type) { body = type[1].trim(); printedType = type[2]; }
        entries.push({level: /^\d+$/.test(match[3]) ? Number(match[3]) : 'evolution-event', key: labelKey(body), printedType, qualifiers,
            leadingMarkers: match[1] ? [match[1]] : [], trailingMarkers});
    }
    return entries;
}
export function unqualifiedAcquisitionKeys(parsed) {
    const counts = new Map();
    for (const entry of parsed.annotatedEntries) if (entry.qualifiers.some(value => ['M', 'F'].includes(value))) counts.set(entry.key, (counts.get(entry.key) ?? 0) + 1);
    // Subtract qualified occurrences, not every occurrence of their label.
    // Meowstic prints Helping Hand both normally and in its male Natural list.
    return [...parsed.entries].reverse().filter(key => {
        if (!counts.get(key)) return true;
        counts.set(key, counts.get(key) - 1); return false;
    }).reverse();
}
export function parseCompactSourceProfiles(pageText) {
    const text = String(pageText ?? ''), starts = [...text.matchAll(/^([A-Za-z][A-Za-z -]+)\s+\(([A-Za-z]+)\)\s*\nHP\s+(\d+)\s*\/\s*ATK\s+(\d+)\s*\/\s*DEF\s+(\d+)\s*\/\s*SP\s*\.\s*ATK\s+(\d+)\s*\/\s*SP\s*\.\s*DEF\s+(\d+)\s*\/\s*SPEED\s+(\d+)\s*\n([^\n]+)\n/gm)];
    return starts.map((match, index) => {
        const tail = text.indexOf('Building Trainers and Campaigns for Babel', match.index), stop = Math.min(starts[index + 1]?.index ?? text.length, tail < 0 ? text.length : tail);
        const raw = text.slice(match.index, stop), body = text.slice(match.index + match[0].length, stop), caps = body.indexOf('Capabilities:'), skills = body.indexOf('Skills:');
        const levelRaw = body.slice(0, caps < 0 ? body.length : caps), levelRows = [], unparsedLevelEntries = [];
        for (const entry of cleanText(levelRaw).split(',').map(value => value.trim()).filter(Boolean)) {
            const row = entry.match(/^(.+?)\s+(\d+)$/);
            if (row) levelRows.push({name: row[1], level: Number(row[2])}); else unparsedLevelEntries.push(entry);
        }
        const tiers = match[9].split('/').map(value => value.split(',').map(label => label.trim()).filter(Boolean));
        return {label: match[1].trim(), stats: Object.fromEntries(['hp', 'atk', 'def', 'spatk', 'spdef', 'spd'].map((key, ordinal) => [key, Number(match[ordinal + 3])])), types: [match[2]],
            abilitySlots: tiers.flatMap((values, tier) => values.map((label, ordinal) => [tier === 0 ? `Basic Ability ${ordinal + 1}` : tier === 1 ? `Adv Ability ${ordinal + 1}` : 'High Ability', label])),
            levelRows, levelText: levelRows.map(row => `${row.level} ${row.name}`).join(' '), levelRaw, unparsedLevelEntries,
            capabilities: caps < 0 ? null : cleanText(body.slice(caps + 13, skills < 0 ? body.length : skills)), skills: skills < 0 ? null : cleanText(body.slice(skills + 7)).replace(/\s*artist unknown.*$/i, '').replace(/\s*art by .*$/i, ''),
            anchor: {startLine: text.slice(0, match.index).split('\n').length, endLine: text.slice(0, stop).split('\n').length, contextNormalizedSha256: textHash(normalizedText(raw))},
            raw};
    });
}
const referencePaths = (value, target, path = '$') => {
    if (Array.isArray(value)) return value.flatMap((child, index) => referencePaths(child, target, `${path}[${index}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => referencePaths(child, target, `${path}.${key}`));
    if (typeof value !== 'string') return [];
    const matches = [...value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])/g)];
    return matches.some(match => `${match[1]}.${match[2]}` === target) ? [path] : [];
};
export async function loadRecordSourceReview() {
    const index = await json('docs/data/record-source-classification.json');
    const files = {};
    for (const path of index.recordFiles) {
        if (!/^record-source-review\/[a-z-]+\.json$/.test(path)) throw new Error(`Invalid review artifact path: ${path}`);
        files[path] = await json(`docs/data/${path}`);
    }
    const [inventory, references, dependencyReview, manifest] = await Promise.all([
        json(index.inventory), json('docs/data/references.json'), json(`docs/data/${index.dependencyReview}`), json('system.json')
    ]);
    const source = await readPackSources(manifest);
    const protectedHashes = Object.fromEntries(await Promise.all(index.protectedPolicyArtifacts.map(async item => [item.path, hash(await json(item.path))])));
    const moveSource = index.moveSourceEvidence ? await json(`docs/data/${index.moveSourceEvidence}`) : null;
    const moveSearch = Object.fromEntries(await Promise.all((moveSource?.sourceSearchArtifacts ?? []).map(async item => {
        if (!/^move-source-search-d[23]\.json$/.test(item.path)) throw new Error(`Invalid Move search artifact path: ${item.path}`);
        return [item.path, await json(`docs/data/${item.path}`)];
    })));
    const featureSource=index.featureSourceEvidence?await json(`docs/data/${index.featureSourceEvidence}`):null;
    const featureSearch=Object.fromEntries(await Promise.all((featureSource?.sourceSearchArtifacts??[]).map(async item=>{
        if(!/^feature-source-search-e1[a-e]\.json$/.test(item.path))throw new Error(`Invalid Feature search artifact path: ${item.path}`);
        return [item.path,await json(`docs/data/${item.path}`)];
    })));
    return {index, files, inventory, references, dependencyReview, source, protectedHashes, dex: await json('docs/data/dex-source-comparison.json'), regional: await json('docs/data/regional-dex-catalog.json'), batchManifest: index.batchManifest ? await json(`docs/data/${index.batchManifest}`) : null,
        acquisitionAudit: await json('docs/data/acquisition-boundary-audit.json'), generationScope: index.generationScopeEvidence ? await json(`docs/data/${index.generationScopeEvidence}`) : null,
        unmatchedSpecies: index.unmatchedSpeciesEvidence ? await json(`docs/data/${index.unmatchedSpeciesEvidence}`) : null,
        abilitySource: index.abilitySourceEvidence ? await json(`docs/data/${index.abilitySourceEvidence}`) : null,
        moveSource, moveSearch, featureSource, featureSearch, itemSource: index.itemSourceEvidence ? await json(`docs/data/${index.itemSourceEvidence}`) : null,
        effectSource: index.effectSourceEvidence ? await json(`docs/data/${index.effectSourceEvidence}`) : null,
        temporarySpeciesSource: index.temporarySpeciesSourceEvidence ? await json(`docs/data/${index.temporarySpeciesSourceEvidence}`) : null,
        referenceSlices: await Promise.all((index.referenceSliceSourceEvidenceFiles ?? []).map(path => {
            if (!/^reference-source-evidence-f4a\.json$/.test(path)) throw new Error(`Invalid reference audit path: ${path}`);
            return json(`docs/data/${path}`);
        })),
        effectSlices: await Promise.all((index.effectSliceSourceEvidenceFiles ?? []).map(path => {
            if (!/^effect-source-evidence-f3[a-h]\.json$/.test(path)) throw new Error(`Invalid effect audit path: ${path}`);
            return json(`docs/data/${path}`);
        }))};
}

export function recordSourceReviewErrors(bundle) {
    const errors = [], fail = (ok, message) => { if (!ok) errors.push(message); };
    const {index, files, inventory, references, dependencyReview, source, protectedHashes, dex, regional, batchManifest, acquisitionAudit, generationScope} = bundle;
    const inventoryMap = new Map(inventory.records.map(row => [row.identity, row]));
    const actualMap = new Map(source.rows.map(row => [row.identity, row]));
    const links = values => (values ?? []).map(link => {
        const match = link.uuid?.match(/Compendium\.ptu\.([\w-]+)\.(?:Item\.)?([A-Za-z0-9]{16})$/), target = match ? `${match[1]}.${match[2]}` : null;
        return {target, label: actualMap.get(target)?.data.name ?? null, level: link.level};
    });
    const currentFieldEvidence = (row, actual, field) => {
        const system = actual?.data.system ?? {}, name = field.field;
        const check = ok => fail(ok, `Declared field evidence does not describe exact current record: ${row.identity} ${name}`);
        if (field.recordFieldPath && field.recordJsonSha256) {
            const value = field.recordFieldPath.split('.').reduce((object, key) => object?.[key], actual?.data);
            check(field.recordJsonSha256 === hash(value ?? null));
            if (Object.hasOwn(field, 'recordValue')) check(equal(field.recordValue, value ?? null));
        }
        if (field.sourceProfileNote) {
            const note = field.sourceProfileNote;
            fail(note.heading && note.interpretation && note.disposition && note.relevantCurrentFields?.length && Number.isInteger(note.anchor?.startLine) && note.anchor.startLine >= 1
                && Number.isInteger(note.anchor.endLine) && note.anchor.endLine >= note.anchor.startLine && /^[a-f0-9]{64}$/.test(note.anchor.contextNormalizedSha256), `Profile note lacks bounded source context/disposition: ${row.identity}`);
        }
        if (Object.hasOwn(field, 'recordValue')) {
            if (['type', 'frequency', 'ac', 'damageBase', 'category', 'prerequisites', 'keywords', 'cost', 'origin'].includes(name)) check(equal(field.recordValue, system[name] ?? null));
            else if (name === 'range+keywords') check(field.recordValue === `${Object.hasOwn(system, 'range') ? system.range === null ? 'None' : system.range : ''}, ${(system.keywords ?? []).join(', ')}`);
            else if (name === 'contestType/effect') check(equal(field.recordValue, system.contestType ?? null));
            else if (/^system\.(?:stats|types|effect|size\.[a-zA-Z]+|breeding\.(?:genderRatio|hatchRate))$/.test(name)) {
                const value = name.split('.').reduce((object, key) => object?.[key], actual?.data);
                check(equal(field.recordValue, value ?? null));
            } else if (['system.diet', 'system.habitats', 'system.breeding.eggGroups', 'system.capabilities.naturewalk'].includes(name)) {
                const value = name.split('.').reduce((object, key) => object?.[key], actual?.data);
                check(equal(field.recordValue, normalizedLabels(value)));
            } else if (name === 'system.effect and bonus values in system.rules') check(field.recordValue === system.effect);
        }
        if (['move', 'ability'].includes(actual?.data.type) && name === 'effect' && field.recordNormalizedSha256) {
            let text = normalizedText(cleanText(system.effect).replace(/^Effect:\s*/, ''));
            if (text === 'none' && field.sourceNormalizedSha256 === textHash('')) text = '';
            check(field.recordNormalizedSha256 === textHash(text));
        }
        if (actual?.data.type !== 'species') return;
        if (field.sourceRange) check(Number.isFinite(field.sourceRange.minimum) && Number.isFinite(field.sourceRange.maximum) && field.sourceRange.minimum <= field.sourceRange.maximum
            && field.withinPrintedRange === (typeof field.recordValue === 'number' && field.recordValue >= field.sourceRange.minimum && field.recordValue <= field.sourceRange.maximum));
        if (field.status === 'supported' && Object.hasOwn(field, 'recordValue') && Object.hasOwn(field, 'sourceValue') && !['system.types', 'system.abilities exact UUID-resolved slot order'].includes(name)) check(equal(field.recordValue, field.sourceValue));
        if (name === 'system.skills six printed entries') {
            check(field.values?.length === 6 && new Set(field.values.map(value => value.key)).size === 6);
            for (const value of field.values ?? []) {
                const skill = system.skills?.[value.key];
                check(equal(value.record, {value: skill?.value ?? null, modifier: skill?.modifier ?? null}));
                if (value.status === 'supported') check(equal(value.record, value.source));
            }
        } else if (name === 'system.capabilities numeric fields') {
            for (const value of field.values ?? []) check(value.record === (system.capabilities?.[value.field] ?? 0));
            if (field.status === 'supported') check(field.values.every(value => value.record === value.source));
        } else if (name === 'system.capabilities.other exact UUID targets') {
            check(equal(field.targetFindings?.map(value => ({target: value.target, label: value.resolvedLabel})), links(system.capabilities?.other).map(value => ({target: value.target, label: value.label}))));
            if (field.status === 'supported') check(field.targetFindings.every(value => value.printedPresence === true));
        } else if (name === 'system.evolutions requirements') {
            if (field.recordRestrictions) check(equal(field.recordRestrictions, (system.evolutions ?? []).flatMap(entry => entry.other?.restrictions ?? []).filter(Boolean)));
            if (field.currentBranches) check(equal(field.currentBranches, links(system.evolutions).map((value, ordinal) => ({ordinal, target: value.target, resolvedLabelForReview: value.label, level: value.level, restrictions: (system.evolutions[ordinal].other?.restrictions ?? []).filter(Boolean)}))));
        } else if (['system.number', 'system.form', 'system.dexentry'].includes(name)) check(field.recordNormalizedSha256 === textHash(normalizedText(system[name.split('.')[1]])));
        else if (/^system\.moves\.(level|machine|egg|tutor)$/.test(name)) {
            const group = name.split('.')[2], entries = links(system.moves?.[group]);
            check(field.recordEntryCount === entries.length);
            if (field.currentEntries) check(equal(field.currentEntries, entries.map(entry => ({target: entry.target, resolvedLabel: entry.label, level: entry.level ?? null}))));
            for (const value of field.unsupportedCurrentEntries ?? []) check(entries.some(entry => entry.target === value.target && entry.label === value.resolvedLabel && (entry.level ?? null) === (value.level ?? null)));
            if (field.status === 'supported') check(!field.unsupportedCurrentEntries?.length && !field.missingSourceEntries?.length);
            for (const key of field.missingSourceEntries ?? []) if (typeof key === 'string') fail(!/(?:tmmovelist|tmhmmovelist|eggmovelist|tutormovelist|zygardecubemovelist|mewcanlearnanytmhm|mewcanbetutoredtolearnanymove|smallhp\d+attack)/i.test(key), `Acquisition heading/rule became a fictitious Move: ${row.identity} ${name}`);
            if (field.duplicateCurrentEntries) {
                const targets = new Map();
                entries.forEach((entry, index) => { if (entry.target) { const list = targets.get(entry.target) ?? []; list.push(index); targets.set(entry.target, list); } });
                const duplicates = [...targets].filter(([, positions]) => positions.length > 1).map(([target, positions]) => ({target, resolvedLabel: actualMap.get(target)?.data.name, count: positions.length, paths: positions.map(index => `$.system.moves.${group}[${index}].uuid`)}));
                check(equal(field.duplicateCurrentEntries, duplicates));
            }
            for (const entry of field.conditionalSourceEntries ?? []) check(entry.currentContains === entries.some(value => labelKey(value.label) === entry.key));
        }
    };
    fail(index.sourceFingerprint === inventory.sourceFingerprint && source.sourceFingerprint === inventory.sourceFingerprint, 'Record source inventory fingerprint is stale');
    fail(index.productionPolicyPromotion === false && index.behavioralVerification === 'not-run', 'Source review cannot promote policy or gameplay certification');
    for (const item of index.protectedPolicyArtifacts) fail(protectedHashes[item.path] === item.semanticSha256, `Protected policy/reference artifact changed: ${item.path}`);
    const refs = new Map(references.documents.map(row => [`Core System/${row.path}`, row]));
    const citations = value => {
        if (!value || typeof value !== 'object') return;
        if (value.path?.startsWith('Core System/')) {
            const ref = refs.get(value.path);
            fail(ref?.sha256 === value.sha256, `Record citation hash/path mismatch: ${value.path}`);
            for (const page of value.pdfPages ?? value.pages ?? []) fail(Number.isInteger(page) && page >= 1 && page <= ref?.pdfPages, `Record citation page invalid: ${value.path} ${page}`);
        }
        for (const child of Object.values(value)) if (child && typeof child === 'object') citations(child);
    };
    const rows = new Map(), counts = {reviewed: 0, excluded: 0, unresolved: 0, unreviewed: 0};
    for (const [path, file] of Object.entries(files)) {
        fail(file.productionPolicyPromotion === false, `Review artifact promotes policy: ${path}`);
        for (const row of file.records) {
            fail(!rows.has(row.identity), `Duplicate record disposition: ${row.identity}`); rows.set(row.identity, row);
            const expected = inventoryMap.get(row.identity), actual = actualMap.get(row.identity);
            fail(expected && actual && expected.contentHash === row.contentHash && actual.contentHash === row.contentHash, `Record identity/hash stale or unknown: ${row.identity}`);
            fail(Object.hasOwn(counts, row.coverageState), `Unknown record coverage state: ${row.identity}`);
            if (Object.hasOwn(counts, row.coverageState)) counts[row.coverageState]++;
            fail(row.identityReview?.status === 'supported' && row.identityReview.basis && row.recordClass && row.generationReview?.status && row.ruleVersionReview?.status && row.ruleVersionReview.basis, `Incomplete record disposition: ${row.identity}`);
            fail(row.productionPolicyPromotion === false && row.behavioralVerification === 'not-run', `Record review cannot approve policy/behavior: ${row.identity}`);
            if (row.coverageState === 'reviewed') fail(row.sources?.length && row.fieldReview?.length && row.normativeFieldCoverage, `Reviewed record lacks source/field evidence: ${row.identity}`);
            const comparison = row.sourceComparison;
            if (comparison?.fields) fail(equal(row.fieldReview, comparison.fields), `Duplicated fieldReview/sourceComparison evidence disagrees: ${row.identity}`);
            for (const field of row.fieldReview ?? []) currentFieldEvidence(row, actual, field);
            if (comparison?.sourceProfile) {
                fail(comparison.fields.length > 6 && (row.coverageState !== 'reviewed' || comparison.correspondenceSupported && (comparison.equalMechanicalGroups >= 2 || comparison.supplementalCorrespondence)), `Species correspondence lacks independent mechanical fields: ${row.identity}`);
                const fields = new Map(comparison.fields.map(field => [field.field, field]));
                const expectedGroups = {
                    baseStats: fields.get('system.stats')?.status === 'supported',
                    types: fields.get('system.types')?.status === 'supported',
                    abilitySlots: fields.get('system.abilities exact UUID-resolved slot order')?.status === 'supported',
                    evolutionLevels: fields.get('system.evolutions levels')?.status === 'supported'
                };
                const stats = fields.get('system.stats'), types = fields.get('system.types'), abilities = fields.get('system.abilities exact UUID-resolved slot order'), evolution = fields.get('system.evolutions levels');
                const currentAbilityLabels = ['basic', 'advanced', 'high'].flatMap(tier => (actual?.data.system.abilities?.[tier] ?? []).map(link => actualMap.get(`abilities.${link.uuid.split('.').at(-1)}`)?.data.name));
                fail(equal(stats?.recordValue, actual?.data.system.stats) && equal(types?.recordValue, actual?.data.system.types)
                    && equal(abilities?.recordValue, currentAbilityLabels) && equal(evolution?.recordValue, actual?.data.system.evolutions.map(entry => entry.level)), `Species comparison does not describe current record fields: ${row.identity}`);
                if (expectedGroups.baseStats) fail(equal(stats.recordValue, stats.sourceValue), `Supported species stats differ from source evidence: ${row.identity}`);
                if (stats?.sourceStatVariants && stats.status === 'supported') fail(Object.keys(stats.sourceStatVariants).length === 4 && equal(stats.sourceValue, stats.sourceStatVariants[stats.sourceStatVariant]), `Printed size/stat variant evidence disagrees: ${row.identity}`);
                if (expectedGroups.types) fail(equal(types.recordValue.map(labelKey).sort(), types.sourceValue.map(labelKey).sort()), `Supported species Types differ from source evidence: ${row.identity}`);
                if (expectedGroups.abilitySlots) fail(equal(abilities.recordValue.map(labelKey), abilities.sourceValue.map(labelKey)), `Supported species slots differ from source evidence: ${row.identity}`);
                if (expectedGroups.evolutionLevels) fail(equal(evolution.recordValue, evolution.sourceValue), `Supported evolution levels differ from source evidence: ${row.identity}`);
                fail(Object.keys(comparison.independentGroups ?? {}).length === 4 && Object.entries(expectedGroups).every(([key, value]) => comparison.independentGroups[key] === value)
                    && comparison.equalMechanicalGroups === Object.values(expectedGroups).filter(Boolean).length, `Species independent-group count/evidence disagree: ${row.identity}`);
                if (comparison.supplementalCorrespondence) {
                    const extra = ['system.size.height', 'system.size.weight', 'system.skills six printed entries'];
                    fail(equal(comparison.supplementalCorrespondence.fieldNames, extra) && extra.every(name => fields.get(name)?.status === 'supported') && (expectedGroups.types || expectedGroups.evolutionLevels), `Supplemental species correspondence lacks metric/skill evidence: ${row.identity}`);
                }
                if (comparison.derivedFormEvidence?.kind === 'printed-mega-table') fail(row.sources.some(citation => citation.path === 'Core System/Pokemon Tabletop United 1.05 Core.pdf' && citation.pdfPages?.includes(206)), `Derived Mega evidence lost the additional-Ability rule citation: ${row.identity}`);
                const [book, pageText] = comparison.sourceProfile.split(':'), page = Number(pageText), notes = comparison.fields.filter(field => field.sourceProfileNote).map(field => field.sourceProfileNote.heading);
                if (['old-dex', 'plus-dex'].includes(book) && [735, 736, 737].includes(page)) fail(notes.includes('Dragon Fusion'), `Printed fusion condition note lost: ${row.identity}`);
                if (book === 'plus-dex' && [746, 747].includes(page)) fail(notes.includes('Confined'), `Printed Confined condition note lost: ${row.identity}`);
                if (book === 'hisui' && [25, 26].includes(page) || row.identity === 'species.SDC4tyMN9t0C2ULR') fail(notes.includes('Note'), `Printed Basculin ancestry condition lost: ${row.identity}`);
                if (book === 'alola' && page === 23) fail(notes.includes('Forme Change'), `Printed nectar/form condition lost: ${row.identity}`);
                if (['old-dex', 'plus-dex'].includes(book) && page === 683) fail(notes.includes('Universal machine learning') && notes.includes('Universal tutoring'), `Printed Mew acquisition permissions lost: ${row.identity}`);
                if (['old-dex', 'plus-dex'].includes(book) && [558, 559].includes(page)) fail(notes.includes('Size/stat variants'), `Printed size/stat table disposition lost: ${row.identity}`);
                if (['old-dex', 'plus-dex'].includes(book) && [719, 720].includes(page)) fail(notes.includes('Sky Forme'), `Printed Sky Forme condition lost: ${row.identity}`);
                if (book === 'alola' && [100, 101, 102].includes(page) || ['old-dex', 'plus-dex'].includes(book) && page === 744) fail(notes.includes('Zygarde Cube Move List'), `Printed separate Cube acquisition list lost: ${row.identity}`);
                if (book === 'alola' && page === 23) {
                    fail(types?.status === 'source-conditional-variable' && equal(types.sourceValue, ['Special', 'Flying'])
                        && equal(types.sourceConditionalPrimaryTypes, {red: 'Fire', yellow: 'Electric', pink: 'Psychic', purple: 'Ghost'}), `Printed nectar condition and Type evidence disagree: ${row.identity}`);
                }
                if (book === 'plus-dex' && [22, 55, 59, 356].includes(page)) fail(abilities?.status === 'source-internal-ambiguity' && abilities.additionalPrintedHighAbilities && notes.includes('High Abilities'), `Additional printed High Abilities cannot be silently discarded: ${row.identity}`);
            }
            if (comparison?.sourceUnit && !['move', 'ability'].includes(actual?.data.type)) fail(comparison.anchor?.definitionContextNormalizedSha256 && comparison.anchor.heading && comparison.anchor.startLine >= 1, `Record source lacks anchored definition context: ${row.identity}`);
            if (row.coverageState === 'excluded') {
                const proof = row.generationReview.exclusionEvidence;
                fail(expected?.generationEligibility === 'excluded' || proof?.independentRecordFields, `Excluded consumer/name alone cannot exclude target: ${row.identity}`);
                if (proof) {
                    const fact = generationScope?.facts[proof.datasetEvidenceKey], system = actual?.data.system, fields = proof.independentRecordFields;
                    fail(actual?.data.type === 'species' && Number.isInteger(system?.number) && fact?.speciesId === system.number
                        && fact.pokemonSpeciesId === fact.speciesId && Number.isInteger(fact.pokemonId) && fact.pokemonId > 0
                        && proof.datasetEvidenceKey === `${fact.speciesId}:${fact.pokemonId}` && fact.generationId >= 9 && proof.externalGeneration === fact.generationId
                        && equal(fields, {number: system.number, types: system.types, height: system.size.height, weight: system.size.weight})
                        && equal(system.types.map(labelKey).sort(), fact.typeSlots.map(slot => labelKey(slot.identifier)).sort())
                        && fact.typeSlots.every(slot => slot.pokemonId === fact.pokemonId && generationScope.typeDefinitions[slot.typeId] === slot.identifier)
                        && system.size.height === fact.heightDecimetres / 10 && system.size.weight === fact.weightHectograms / 10
                        && row.sources.some(cite => cite.path === 'docs/data/generation-scope-evidence.json' && cite.datasetEvidenceKey === proof.datasetEvidenceKey), `Negative-scope proof does not establish exact numeric/Type/two-metric identity: ${row.identity}`);
                }
            }
            for (const reference of row.catalogReferences ?? []) {
                const entry = reference.artifact === 'docs/data/dex-source-comparison.json' ? dex.profileDeltas.find(value => value.id === reference.entryId)
                    : reference.artifact === 'docs/data/regional-dex-catalog.json' ? regional.entries.find(value => value.id === reference.entryId) : null;
                fail(entry && row.sources.some(citation => entry.sources.some(source => source.path === citation.path && source.sha256 === citation.sha256 && equal(source.pdfPages, citation.pdfPages))), `Profile edition/region catalog reference is missing or unrelated: ${row.identity}`);
            }
            citations(row);
        }
    }
    counts.unreviewed += inventoryMap.size - rows.size;
    checkUnmatchedSpecies(bundle, {fail, rows, actualMap, hash, equal, labelKey, currentFieldEvidence, citations});
    checkAbilitySourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, parseAbilityRules: parseSourceAbilityRules, citations});
    checkMoveSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, parseMoveRules: parseSourceMoveRules, citations});
    checkFeatureSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, parseFeatureRules: parseSourceFeatureRules, citations});
    checkItemSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkTemporarySpeciesSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectSliceSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectOtherSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3cSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3dSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3eSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3fSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3gSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkEffectF3hSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    checkReferenceF4aSourceReview(bundle, {fail, rows, actualMap, hash, equal, textHash, normalizedText, cleanText, citations});
    if (index.generationScopeEvidence) {
        const expected = {'pokemon_species.csv': ['67f0da856d395bbe058cf961edce6ef2f805d1d8', 'e66e2eeb25fd3836b0ebab6bf87bbf01960aa3c0555e2bac495fa8393c5e0c45'],
            'pokemon.csv': ['bb32b1763d2462160f49ce88b4a1d800e4f195e1', '16c81c33188b0eac403aa2f759fcbe9e42c611f722d263f5b5a6a5bff9f8ce6b'],
            'pokemon_types.csv': ['5567064b22c77c4082c1dfb30674102c669968d8', 'f1fc4bfd657a034ea3bf6972423b10276424aa068577b304a78a08996425ba05'],
            'types.csv': ['d0ec10c324fb7d1529269ddbffac4778fdf99836', '37f039c8d722f47d51ba1c5c5ecf9b7007235b1a9a1af2827645c777b70307c8']};
        fail(generationScope?.productionPolicyPromotion === false && generationScope.behavioralVerification === 'not-run' && generationScope.files.length === 4
            && new Set(generationScope.files.map(file => file.file)).size === 4 && generationScope.files.every(file => equal([file.gitBlobSha, file.canonicalLfSha256], expected[file.file])
                && file.immutableBlobUrl === `https://api.github.com/repos/PokeAPI/pokeapi/git/blobs/${file.gitBlobSha}`), 'Negative-scope cached source provenance changed');
    }
    fail(index.coverage.totalInventoryRecords === inventoryMap.size && index.coverage.explicitRecordDispositions === rows.size, 'Record coverage inventory/disposition counts differ');
    for (const [state, count] of Object.entries(counts)) fail((index.coverage.counts[state] ?? 0) === count, `Record coverage count wrong: ${state}`);
    const sourceClasses = {};
    for (const row of rows.values()) sourceClasses[row.recordClass] = (sourceClasses[row.recordClass] ?? 0) + 1;
    fail(equal(index.coverage.sourceClassCounts, sourceClasses), 'Record source-class counts differ from explicit dispositions');
    fail(index.coverage.completeAddressableClassification === (counts.unreviewed === 0), 'Cannot claim completed classification while addressable inventory remains unreviewed');

    const expectedRelations = new Set(inventory.dependencies.checkedRecords.flatMap(row => row.targets.map(target => `${row.identity}>${target}`)));
    const seenRelations = new Set();
    fail(dependencyReview.sourceFingerprint === source.sourceFingerprint && dependencyReview.productionPolicyPromotion === false, 'Dependency review fingerprint/policy boundary wrong');
    fail(dependencyReview.relationshipCount === expectedRelations.size && dependencyReview.relationshipCount === 87 && dependencyReview.recordCount === 88, 'First dependency batch must cover 88 records and 87 relationships');
    for (const relation of dependencyReview.relationships) {
        const key = `${relation.source}>${relation.target}`, from = actualMap.get(relation.source), to = actualMap.get(relation.target);
        fail(expectedRelations.has(key) && !seenRelations.has(key), `Unexpected/duplicate dependency disposition: ${key}`); seenRelations.add(key);
        fail(rows.has(relation.source) && rows.has(relation.target) && from?.contentHash === relation.sourceContentHash && to?.contentHash === relation.targetContentHash, `Dependency source/target review or hash missing: ${key}`);
        fail(relation.paths?.length && relation.identity?.status === 'supported' && relation.generation?.status && relation.ruleVersion?.status && relation.relevantDataFields?.length && relation.relationshipData?.length && relation.sourceReferences?.length, `Dependency lacks separate source/target field evidence: ${key}`);
        fail(equal(relation.relevantDataFields, rows.get(relation.target)?.fieldReview) && equal(relation.sourceReferences, rows.get(relation.target)?.sources), `Dependency duplicated target field/source evidence disagrees: ${key}`);
        fail(relation.behavioralVerification === 'not-run' && relation.productionPolicyPromotion === false, `Dependency cannot certify policy/behavior: ${key}`);
        if (from && to) {
            const actualPaths = [...new Set(referencePaths(from.data, relation.target))].sort();
            fail(actualPaths.length && equal(actualPaths, [...new Set(relation.paths ?? [])].sort()), `Dependency UUID paths do not describe exact current source: ${key}`);
        }
        citations(relation);
    }
    fail(seenRelations.size === expectedRelations.size && [...expectedRelations].every(key => seenRelations.has(key)), 'Missing required dependency disposition');
    for (const regression of index.readingOrderRegressions) {
        const row = rows.get(regression.identity);
        fail(row?.contentHash === regression.contentHash && row.coverageState === 'reviewed' && row.sourceComparison?.sourceProfile === regression.sourceProfile && row.sourceComparison.equalMechanicalGroups >= 2, `Available reading-order profile lost: ${regression.identity}`);
    }
    fail(index.readingOrderRegressions.length === 4, 'Four reported source extraction regressions must remain covered');
    if (index.finiteFormBranchBatch) {
        const batch = index.finiteFormBranchBatch, file = files[batch.recordFile], cases = new Map(batch.cases.map(row => [row.identity, row]));
        fail(batch.records === 95 && batch.cases.length === 95 && cases.size === 95 && file?.records.length === 95 && batch.noPendingExtraction === true, 'Finite form/branch/skill batch must retain all 95 examined cases');
        const batchCounts = {reviewed: 0, unresolved: 0};
        for (const row of file?.records ?? []) {
            const expected = cases.get(row.identity);
            fail(expected?.contentHash === row.contentHash && expected.sourceProfile === row.sourceComparison?.sourceProfile && expected.coverageState === row.coverageState
                && Object.hasOwn(batchCounts, row.coverageState) && !row.fieldReview.some(field => field.status === 'unreviewed'), `Finite available-source case became pending or stale: ${row.identity}`);
            if (Object.hasOwn(batchCounts, row.coverageState)) batchCounts[row.coverageState]++;
            if (row.coverageState === 'unresolved') fail(row.missingEvidence?.examinedSourceProfile === row.sourceComparison?.sourceProfile && row.missingEvidence.neededArtifact && row.missingEvidence.differingFields?.length, `Examined variant conflict lacks a precise evidence limit: ${row.identity}`);
        }
        fail(equal(batch.counts, batchCounts), 'Finite form/branch/skill batch coverage counts differ');
    }
    if (index.acquisitionBoundaryAudit) {
        const audit = acquisitionAudit, groups = ['level', 'machine', 'egg', 'tutor'];
        const scoped = (audit?.recordFiles ?? []).flatMap(path => files[path]?.records ?? []).filter(row => row.sourceComparison?.sourceProfile);
        const expected = scoped.map(row => [row.identity, row.contentHash]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
        const membership = textHash(expected.map(([identity, contentHash]) => `${identity}\t${contentHash}\n`).join(''));
        fail(index.acquisitionBoundaryAudit === 'acquisition-boundary-audit.json' && audit?.sourceFingerprint === inventory.sourceFingerprint
            && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run', 'Acquisition audit inputs or policy boundary changed');
        fail(expected.length === 1075 && equal(audit?.members, expected) && audit.membershipSha256 === membership, 'Acquisition audit finite identity/hash membership changed');
        const memberIds = new Set(expected.map(([identity]) => identity)), sections = new Map(), flagUses = new Map(), flagMap = new Map((audit?.flagDispositions ?? []).map(flag => [flag.id, flag]));
        fail(flagMap.size === audit?.flagDispositions?.length, 'Acquisition audit repeats a flag disposition');
        for (const section of audit?.sections ?? []) {
            const key = `${section.identity}:${section.group}`, row = rows.get(section.identity), field = row?.fieldReview.find(value => value.field === `system.moves.${section.group}`);
            fail(!sections.has(key) && groups.includes(section.group) && memberIds.has(section.identity), `Acquisition audit duplicate/outside section: ${key}`);
            sections.set(key, section);
            fail(section.sourceProfile === row?.sourceComparison?.sourceProfile && section.evidenceSemanticSha256 === hash(field ?? null)
                && /^[a-f0-9]{64}$/.test(section.rawNormalizedSha256) && /^[a-f0-9]{64}$/.test(section.parsedSha256)
                && Number.isInteger(section.entryCount) && section.entryCount >= 0, `Acquisition audit evidence changed: ${key}`);
            if (section.anchor) fail(Number.isInteger(section.anchor.startLine) && section.anchor.startLine >= 1 && section.anchor.endLine >= section.anchor.startLine
                && section.anchor.contextNormalizedSha256 === section.rawNormalizedSha256, `Acquisition audit source context invalid: ${key}`);
            else fail(field?.sourceTablePresent !== true && field?.sourceTableNormalizedSha256 === textHash('') && section.entryCount === 0, `Acquisition audit omitted an available source section: ${key}`);
            const issues = field?.sourceTokenDispositions ?? [];
            fail(equal(section.flagIds, issues.map(issue => issue.auditFlag)), `Acquisition audit flag coverage disagrees: ${key}`);
            for (const id of section.flagIds) {
                flagUses.set(id, (flagUses.get(id) ?? 0) + 1);
                const flag = flagMap.get(id), issue = issues.find(value => value.auditFlag === id);
                fail(flag && id.startsWith(`${key}:`) && issue?.parsedKey === flag.parsedKey && issue?.printedLiteral === flag.printedLiteral
                    && issue?.disposition === flag.disposition && flag.sourceProfile === section.sourceProfile, `Acquisition audit flag evidence disagrees: ${id}`);
            }
        }
        for (const [identity] of expected) for (const group of groups) fail(sections.has(`${identity}:${group}`), `Acquisition audit section missing: ${identity}:${group}`);
        const dispositions = new Set(['source-internal-label-conflict', 'source-literal-identity-limit', 'defined-source-label-current-spelling-conflict', 'source-punctuation-conflict', 'source-literal-definition-limit', 'source-type-column-conflict']);
        for (const flag of flagMap.values()) {
            fail(flagUses.get(flag.id) === 1 && dispositions.has(flag.disposition) && flag.interpretation?.length > 80
                && flag.productionPolicyPromotion === false, `Acquisition audit flag lacks a precise retained disposition: ${flag.id}`);
            const [identity, group] = flag.id.split(':'), row = rows.get(identity), field = row?.fieldReview.find(value => value.field === `system.moves.${group}`);
            if (flag.kind === 'literal-source-token') {
                fail(field?.missingSourceEntries.some(value => (typeof value === 'string' ? value : value.moveKeyForComparison) === flag.parsedKey), `Acquisition audit erased a literal source token: ${flag.id}`);
                const candidate = flag.candidateComparison, actual = actualMap.get(candidate?.target);
                fail(actual?.contentHash === candidate?.contentHash && candidate?.fields.length === 8 && candidate.productionPolicyPromotion === false, `Acquisition audit candidate identity/fields changed: ${flag.id}`);
                for (const value of candidate?.fields ?? []) currentFieldEvidence({identity: candidate.target}, actual, value);
            } else {
                fail(flag.kind === 'printed-type-column' && flag.disposition === 'source-type-column-conflict' && field?.status === 'manual-question', `Acquisition audit lost the printed Type conflict: ${flag.id}`);
                for (const target of flag.currentTargets ?? []) fail(actualMap.get(target.target)?.data.system.type === target.currentType, `Acquisition audit current Type evidence changed: ${flag.id}`);
            }
        }
        const counts = {species: expected.length, sections: sections.size, literalTokenFlags: [...flagMap.values()].filter(flag => flag.kind === 'literal-source-token').length,
            typeColumnFlags: [...flagMap.values()].filter(flag => flag.kind === 'printed-type-column').length};
        fail(sections.size === expected.length * 4 && equal(audit?.counts, counts), 'Acquisition audit coverage counts disagree');
        for (const correction of audit?.syntaxCorrections ?? []) {
            const field = rows.get(correction.identity)?.fieldReview.find(value => value.field === `system.moves.${correction.group}`);
            fail(equal(correction.afterMissing, field?.missingSourceEntries) && equal(correction.afterUnsupported, field?.unsupportedCurrentEntries), `Acquisition audit correction evidence disagrees: ${correction.identity}`);
        }
        citations(audit);
    }
    if (index.batchManifest) {
        const expected = {
            A: [95, '641a2a3b83dc514217cd1aed95835e0a53041e44751cb586658996dec727e44b'], B: [1702, '62dcf6e7a97297623b5634e9ad1143f87226c0b646f2127c76b3638be23d2b9c'],
            C: [626, 'fb8df981d10192adcc72421ac6d39b03b4c4b5204a7dac5d4ba0fff50996f7da'], D: [1228, 'ea02c8c451a1c7f9a1b163e0f6d2790ff39ab0ab8e2f619357ebb264956ee26d'],
            E1: [1443, '60db69771fd299bf4618c8e6f228a7eddb01590adaa81377cd535103e7e7a1e5'], E2: [1020, 'e013adf47a526f4df852de1b353c5f504a9a143b37604cd5df06ad1360b6a6cd'],
            F: [939, '791f002be4cff6961167f4f01b9847efaa21a97c8c40755335f3bd8dd5bf8da6'], G: [245, 'd869b57527f08370214f974601820047f3fcee593edecedf0d43544e2c8360c9'],
            H: [2, '731e0b0fe3a3e6a08cf5726d56f7cc86139c837098e4b8bc9a62d095372054b6']
        };
        const membershipHash = members => textHash([...members].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([identity, contentHash]) => `${identity}\t${contentHash}\n`).join(''));
        fail(batchManifest?.sourceFingerprint === inventory.sourceFingerprint && batchManifest.inventory.semanticSha256 === hash(inventory) && batchManifest.productionPolicyPromotion === false && batchManifest.behavioralVerification === 'not-run', 'Frozen batch inputs or policy boundary changed');
        fail(batchManifest.candidateSnapshot.sha256 === '1f14e7a53bde741803a4384fe60da4d29b66c380a005ba455d8117300efd0d90' && equal(batchManifest.sequence, Object.keys(expected)), 'Frozen candidate snapshot or batch sequence changed');
        const assigned = new Set();
        const inspectMembers = (members, title) => {
            for (const [identity, contentHash] of members) {
                fail(!assigned.has(identity) && inventoryMap.get(identity)?.contentHash === contentHash && actualMap.get(identity)?.contentHash === contentHash, `Frozen batch duplicate/stale identity/hash: ${title} ${identity}`);
                assigned.add(identity);
            }
        };
        inspectMembers(batchManifest.baseline.members, 'baseline');
        fail(batchManifest.baseline.count === 95 && batchManifest.baseline.members.length === 95 && membershipHash(batchManifest.baseline.members) === batchManifest.baseline.membershipSha256, 'Frozen baseline membership changed');
        let predecessorClosed = true, predecessorReviewHeld = false;
        for (const batch of batchManifest.batches) {
            const shape = expected[batch.id];
            fail(shape && batch.count === shape[0] && batch.members.length === shape[0] && batch.membershipSha256 === shape[1] && membershipHash(batch.members) === shape[1], `Frozen batch membership changed: ${batch.id}`);
            inspectMembers(batch.members, batch.id);
            if (batch.status !== 'not-started') fail(predecessorClosed, `Frozen batch sequence skipped unfinished predecessor: ${batch.id}`);
            if (batch.status !== 'not-started') fail(!predecessorReviewHeld, `Frozen family review gate not cleared: ${batch.id}`);
            const batchIds = new Set(batch.members.map(([identity]) => identity)), sliced = new Set();
            for (const slice of batch.slices) {
                fail(slice.members.length === slice.records && membershipHash(slice.members) === slice.membershipSha256, `Frozen slice membership changed: ${slice.id}`);
                for (const [identity, contentHash] of slice.members) {
                    fail(batchIds.has(identity) && !sliced.has(identity) && inventoryMap.get(identity)?.contentHash === contentHash, `Frozen slice duplicate/stale/outside batch: ${slice.id} ${identity}`);
                    sliced.add(identity);
                    if (slice.status === 'source-comparisons-complete') fail(['reviewed', 'excluded', 'unresolved'].includes(rows.get(identity)?.coverageState), `Closed slice retains unfinished record: ${slice.id} ${identity}`);
                }
                if (slice.recordFile) {
                    const evidence = files[slice.recordFile];
                    fail(evidence?.frozenSlice === slice.id && equal(evidence.records.map(row => [row.identity, row.contentHash]), slice.members)
                        && evidence.records.every(row => row.frozenQueue?.batch === batch.id && row.frozenQueue.slice === slice.id && row.frozenQueue.membershipSha256 === slice.membershipSha256), `Frozen slice evidence file/membership disagrees: ${slice.id}`);
                    if (slice.status === 'source-comparisons-complete') fail(slice.closure?.evidenceSemanticSha256 === hash(evidence), `Closed slice evidence changed without a recorded review: ${slice.id}`);
                }
            }
            if (batch.status === 'source-comparisons-complete') {
                fail(batch.closure && batch.members.every(([identity]) => ['reviewed', 'excluded', 'unresolved'].includes(rows.get(identity)?.coverageState)), `Closed batch retains unfinished records/evidence: ${batch.id}`);
                if (batch.id !== 'A') fail(sliced.size === batch.count && batch.slices.every(slice => slice.status === 'source-comparisons-complete'), `Closed batch lacks complete frozen slices: ${batch.id}`);
                if (batch.id !== 'A') {
                    const actualCounts = {};
                    for (const [identity] of batch.members) { const state = rows.get(identity)?.coverageState; actualCounts[state] = (actualCounts[state] ?? 0) + 1; }
                    fail(equal(batch.closure?.counts, actualCounts) && equal(batch.closure?.sliceEvidenceSemanticSha256, Object.fromEntries(batch.slices.map(slice => [slice.id, slice.closure?.evidenceSemanticSha256]))), `Closed family aggregate counts/evidence disagree: ${batch.id}`);
                }
            }
            predecessorClosed = predecessorClosed && batch.status === 'source-comparisons-complete';
            predecessorReviewHeld ||= batch.acceptance?.status === 'pending-substantive-review';
        }
        fail(batchManifest.batches.length === 9 && assigned.size === inventoryMap.size && batchManifest.totalQueuedRecords === 7300 && batchManifest.remainingAfterA === 7205, 'Frozen batches do not partition the full inventory');
    }
    const learning = dex.profileDeltas.find(row => row.id === 'r04-d0418')?.changes.find(change => change.field === 'levelMoves');
    fail(learning && learning.sourceInterpretation.category === 'editorial-correction' && hash({standardSourceValue: learning.standardSourceValue, revisedSourceValue: learning.revisedSourceValue}) === index.acceptedSourceInvariants.darmanitanLearningValuesSha256, 'Darmanitan unchanged learning schedule must retain values and editorial classification');
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const data = await loadRecordSourceReview(), errors = recordSourceReviewErrors(data);
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Record source snapshot valid: ${JSON.stringify(data.index.coverage.counts)}; ${data.dependencyReview.relationshipCount} relationships. Complete classification: ${data.index.coverage.completeAddressableClassification}. No policy/behavior promotion.`);
}
