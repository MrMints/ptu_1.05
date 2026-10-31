// Offline evidence derivation. These functions neither draw tables nor run macros.
export const G_MEMBERSHIP = 'd869b57527f08370214f974601820047f3fcee593edecedf0d43544e2c8360c9';
export const G_IMPLEMENTATION_PATHS = [
    'src/scripts/game-ptu.js', 'src/scripts/macros/dex-sync.js', 'src/scripts/macros/pokedex.js',
    'src/scripts/macros/rotom-form-change.js', 'src/module/apps/type-matrix.js', 'src/util/misc.js',
    'src/module/rules/rule-element/temp-species.js', 'src/module/rules/rule-element/type-overwrite.js',
    'src/module/rules/rule-element/token-image.js', 'src/module/rules/rule-element/grant-item/rule-element.js',
    'src/module/rules/rule-element/ae-like.js', 'src/module/apps/species-mass-generator/document.js',
    'src/module/apps/species-mass-generator/sheet.js', 'src/module/apps/npc-quick-build/document.js',
    'src/scripts/hooks/currs-enricher.js'
];
export function organizationalKind(doc) {
    const match = typeof doc?._key === 'string' && doc._key.match(/^!(folders|tables|macros)!([A-Za-z0-9]{16})$/);
    return match && match[2] === doc._id ? match[1] : null;
}
export function organizationalReferences(value, path = '$') {
    const links = [];
    if (Array.isArray(value)) return value.flatMap((child, i) => organizationalReferences(child, `${path}[${i}]`));
    if (value && typeof value === 'object') {
        if (typeof value.documentCollection === 'string' && /^ptu\.[\w-]+$/.test(value.documentCollection)
            && /^[A-Za-z0-9]{16}$/.test(value.documentId ?? '')) {
            links.push({path, kind: 'explicit-result-document-fields', targetIdentity: value.documentCollection.slice(4) + '.' + value.documentId,
                documentCollection: value.documentCollection, documentId: value.documentId});
        }
        return [...links, ...Object.entries(value).flatMap(([key, child]) => organizationalReferences(child, `${path}.${key}`))];
    }
    if (typeof value !== 'string') return [];
    return [...value.matchAll(/Compendium\.ptu\.([\w-]+)\.(?:(Item|Actor|Macro|JournalEntry|RollTable|Folder)\.)?([A-Za-z0-9]{16})(?![A-Za-z0-9])|@Compendium\[ptu\.([\w-]+)\.(?:(Item|Actor|Macro|JournalEntry|RollTable|Folder)\.)?([A-Za-z0-9]{16})\]/g)]
        .map(m => ({path, kind: 'literal-compendium-reference', literal: m[0], targetIdentity: `${m[1] ?? m[4]}.${m[3] ?? m[6]}`, explicitDocumentType: m[2] ?? m[5] ?? null}));
}
export function organizationalLiteralFields(value, path = '$') {
    if (Array.isArray(value)) return value.flatMap((child, i) => organizationalLiteralFields(child, `${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, child]) => organizationalLiteralFields(child, `${path}.${k}`));
    return typeof value === 'string' && /Compendium\.|@Compendium\[|@UUID\[|@Poke\[|game\.ptu\.|https?:\/\//.test(value)
        ? [{path, literal: value}] : [];
}
export function organizationalFolderFacts(identity, doc, actualMap, priorRows, hash) {
    const pack = identity.split('.')[0], chain = [], seen = new Set([identity]);
    let parentId = doc.folder, cycle = false;
    while (parentId) {
        const parentIdentity = `${pack}.${parentId}`, parent = actualMap.get(parentIdentity);
        chain.push({identity: parentIdentity, contentHash: parent?.contentHash ?? null, key: parent?.data._key ?? null,
            collectionType: parent?.data.type ?? null, exactFolderKind: organizationalKind(parent?.data) === 'folders'});
        if (!parent || seen.has(parentIdentity)) { cycle = seen.has(parentIdentity); break; }
        seen.add(parentIdentity); parentId = parent.data.folder;
    }
    const children = [...actualMap.values()].filter(r => r.pack === pack && r.data.folder === doc._id).map(r => {
        const prior = priorRows.get(r.identity);
        return {identity: r.identity, contentHash: r.contentHash, key: r.data._key, parent: r.data.folder,
            priorRecordFile: prior?.file ?? null, priorCoverage: prior?.row.coverageState ?? null,
            priorDispositionSha256: prior ? hash(prior.row) : null, excludedChildMechanicsExamined: false};
    });
    return {pack, collectionType: doc.type, sorting: doc.sorting, sort: doc.sort, color: doc.color ?? null,
        colorFieldPresent: Object.hasOwn(doc, 'color'), ownershipFieldPresent: Object.hasOwn(doc, 'ownership'),
        parentChain: chain, cycle, children, organizationOnly: true, contentScopeInheritedFromFolder: false,
        sourceOrCanonicalIdentityInferredFromLabel: false, gameplayItemClassification: false};
}
// A diagnostic label probe only: no accent removal, taxonomy aliases or rules
// identity. Raw habitat fields and exact UUIDs remain separate evidence.
const fold = value => String(value ?? '').toLowerCase().replace(/\s+/g, '');
export function organizationalTableFacts(doc, actualMap, priorRows, hash) {
    const sidesMatch = String(doc.formula ?? '').match(/^1d([1-9]\d*)$/), sides = sidesMatch ? Number(sidesMatch[1]) : null;
    const coverage = sides && sides <= 100000 ? Array.from({length: sides}, () => []) : [];
    const results = (doc.results ?? []).map((result, index) => {
        const links = organizationalReferences(result, `$.results[${index}]`), explicit = links.find(l => l.kind === 'explicit-result-document-fields'),
            target = explicit ? actualMap.get(explicit.targetIdentity) : null, prior = explicit ? priorRows.get(explicit.targetIdentity) : null,
            excluded = prior?.row.coverageState === 'excluded', sourceHabitat = excluded ? null : prior?.row.fieldReview?.find(f => f.field === 'system.habitats') ?? null;
        const range = result.range, validRange = Array.isArray(range) && range.length === 2 && range.every(Number.isInteger) && range[0] <= range[1];
        if (validRange && coverage.length) for (let n = Math.max(1, range[0]); n <= Math.min(sides, range[1]); n++) coverage[n - 1].push(index);
        const currentHabitats = excluded ? null : target?.data.system?.habitats ?? null;
        return {index, path: `$.results[${index}]`, resultId: result._id, rawType: result.type, rawWeight: result.weight,
            rawRange: range, rawDrawn: result.drawn, resultKey: result._key, validRange, rangeWidth: validRange ? range[1] - range[0] + 1 : null,
            targetIdentity: explicit?.targetIdentity ?? null, targetFound: !!target, targetContentHash: target?.contentHash ?? null,
            targetKind: target ? organizationalKind(target.data) ?? 'gameplay-document' : null,
            priorRecordFile: prior?.file ?? null, priorDispositionSha256: prior ? hash(prior.row) : null,
            priorCoverage: prior?.row.coverageState ?? null, excludedOnlyTarget: excluded,
            currentTargetHabitats: currentHabitats, priorPrintedHabitatField: sourceHabitat,
            casefoldLabelPresentInCurrentHabitat: Array.isArray(currentHabitats) ? currentHabitats.some(h => fold(h) === fold(doc.name)) : null,
            casefoldLabelPresentInPrintedHabitat: Array.isArray(sourceHabitat?.sourceValue) ? sourceHabitat.sourceValue.some(h => fold(h) === fold(doc.name)) : null,
            labelProbeEstablishesPlacementOrCanonicalIdentity: false, links, literalFields: organizationalLiteralFields(result, `$.results[${index}]`)};
    });
    return {formula: doc.formula, replacement: doc.replacement, displayRoll: doc.displayRoll, resultCount: results.length,
        results, dieSides: sides, rangeCoverage: coverage.map((indices, index) => ({roll: index + 1, resultIndices: indices})),
        uncoveredRolls: coverage.flatMap((indices, index) => indices.length ? [] : [index + 1]),
        overlappingRolls: coverage.flatMap((indices, index) => indices.length > 1 ? [{roll: index + 1, resultIndices: indices}] : []),
        weightRangeWidthDifferences: results.filter(r => r.validRange && r.rawWeight !== r.rangeWidth).map(r => r.index),
        missingExactTargets: results.filter(r => r.targetIdentity && !r.targetFound).map(r => ({path: r.path, targetIdentity: r.targetIdentity})),
        links: organizationalReferences(doc), literalFields: organizationalLiteralFields(doc), arithmeticOnly: true,
        probabilitiesOrSelectionAuthorityApproved: false, actualDrawBehavior: 'not-run', scopeFilterImplemented: false};
}
export function organizationalMacroFacts(identity, doc, implementationContexts) {
    const command = doc.command ?? '', text = path => implementationContexts.find(c => c.path === path)?.contexts.map(c => c.rawText).join('\n') ?? '';
    const body = identity === 'macros.1RNSAw20k8gBHhUd' ? text('src/scripts/macros/dex-sync.js')
        : identity === 'macros.1TTtVKjm2sNhVhZk' ? text('src/scripts/macros/pokedex.js')
        : identity === 'macros.H929lnw6f59DTuWQ' ? text('src/scripts/macros/rotom-form-change.js')
        : identity === 'macros.XGxaPZzFSyRg8ykw' ? text('src/module/apps/type-matrix.js') : command;
    return {literalCommand: command, type: doc.type, scope: doc.scope, author: doc.author, ownership: doc.ownership,
        gamePtuPaths: [...new Set([...command.matchAll(/game\.ptu(?:\.[A-Za-z_$][\w$]*)+/g)].map(m => m[0]))],
        implementationItemQueries: [...body.matchAll(/game\.ptu\.item\.get\("([^"]+)", "([^"]+)"\)/g)].map(m => ({query: m[1], itemType: m[2], stableTargetUuidEstablished: false})),
        dynamicTargetUuids: identity === 'macros.sYZbyUkyC8f4nCek' ? ['TRANSFORMEE_TOKEN.actor.items.filter(i => i.type == "species")[0].uuid', 'item.uuid'] : [],
        transform: identity === 'macros.sYZbyUkyC8f4nCek' ? {
            copyStatsFlagDefault: command.match(/I_WANT_TRANSFORM_TO_ALSO_COPY_SKILLS_BASESTATS_AND_PROPER_SIZE\s*=\s*(true|false)/)?.[1] ?? null,
            capitalizedAllowDuplicateLiteral: /allowDuplicate:\s*false/.test(command), lowercaseAllowduplicateWritten: /allowduplicate\s*:/.test(command),
            suppliedTypeOverwriteFlag: /key:\s*"TypeOverwrite"[^}]*\boverwrite\s*:/.test(command),
            explicitStatsOrSkillsAssignment: /["'`]system\.(?:stats|skills)[."'`]/.test(command),
            explicitDurationField: /\bduration\s*:/.test(command),
            movementKeys: (command.match(/for \(const capName of \[([^\]]+)\]/)?.[1].match(/"([^"]+)"/g) ?? []).map(s => s.slice(1, -1)),
            effectDeletionByNamePrefix: /i\.name\.startsWith\("Transformed into "\)/.test(command),
            targetRetrievedAfterDeletionLoop: command.indexOf('game.user.targets.first()') > command.indexOf('e.delete()'),
            deletionAwaitedInLoop: /await\s+e\.delete\(/.test(command),
            grantSchemaUsesLowercaseField: /allowduplicate:.*?BooleanField/.test(text('src/module/rules/rule-element/grant-item/rule-element.js')),
            typeImplementationRequiresOverwriteBranch: /if \(this\.overwrite\)/.test(text('src/module/rules/rule-element/type-overwrite.js')),
            lifecycleRestorationVerified: false} : null,
        spriteUtility: identity === 'macros.HAtYcPnHQzB8JzY8' ? {
            allPokemonActorsSelected: /game\.actors\.filter\(a => a\.type === "pokemon"\)/.test(command),
            prototypeAndActiveTokensUpdated: /prototypeToken\.texture\.src/.test(command) && /getActiveTokens\(\)/.test(command),
            explicitCustomImageWarning: /IF YOU HAVE CUSTOM IMAGES DON'T RUN THIS/.test(command),
            updatesAwaited: /await\s+(?:mon|token\.document)\.update/.test(command), customArtPreservationVerified: false} : null,
        codeExecuted: false, actualPermissionBehavior: 'not-run', actualSideEffects: 'not-run',
        sourceVersionOrCanonicalTargetApproved: false, scopeFilterImplemented: false};
}
export const cleanOrganizationalSource = value => String(value ?? '').replace(/\r\n/g, '\n').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2')
    .replaceAll('Y ou', 'You').replace(/\s+/g, ' ').trim();
export function organizationalSourceBlock(audit, id, start, end) {
    const raw = audit.parentContexts.find(p => p.id === id)?.rawText ?? '', first = raw.indexOf(start);
    if (first < 0) return null;
    const last = end ? raw.indexOf(end, first + start.length) : raw.length;
    return last < 0 ? null : raw.slice(first, last).trimEnd();
}
export function printedRollBands(raw) {
    if (typeof raw !== 'string') return [];
    const rows = []; let row = null;
    for (const line of raw.split('\n')) {
        const match = line.trim().match(/^(\d{1,2})\s*(?:[-–]\s*(\d{1,2}))?\s+(.+)$/);
        if (match) { row = {range: [Number(match[1]), Number(match[2] ?? match[1])], text: match[3].trim()}; rows.push(row); }
        else if (row && line.trim() && !/^Abilities$/.test(line.trim())) row.text += ' ' + line.trim();
    }
    return rows;
}
export function organizationalSourceFacts(audit) {
    const block = (...args) => organizationalSourceBlock(audit, ...args), clean = value => cleanOrganizationalSource(value),
        cap = (text, re, n = 1) => clean(text).match(re)?.[n] ?? null,
        number = (text, re, n = 1) => { const value = cap(text, re, n); return value === null ? null : Number(value); };
    const dowsing = block('core:284', 'Dowsing Rod', 'Poffin Mixer'), pickup = block('core:310', 'Pickup:', '\nAbilities\n'),
        luck = block('core:462', '1-4 Nope.avi', 'Conversion Rate:'), pickupAbility = block('core:326', 'Ability: Pickup', 'Ability: Pixilate'),
        originalPoltergeist = block('core:326', 'Ability: Poltergeist', 'Ability: Polycephaly'), optionalPoltergeist = block('feb:7', 'Ability:\tPoltergeist', 'Ability:\tPressure'),
        transform = block('core:412', 'Move: Transform', 'Move: Tri Attack'), booster = block('core:297', 'Type Boosters', 'Type Brace'),
        brace = block('core:297', 'Type Brace', 'Winter Cloak'), plate = block('core:297', 'Type Plate', 'Mega Stone'),
        tm = audit.parentContexts.find(p => p.id === 'core:300')?.rawText, chart = audit.parentContexts.find(p => p.id === 'core:301')?.rawText;
    return {
        dowsing: {completeDefinition: dowsing, minutes: number(dowsing, /spending (\d+) minutes/), dailyUses: cap(dowsing, /number of times per day equal to ([^.]+)/),
            rankDice: cap(dowsing, /roll (1d6 per Occult Education Rank)/), terrain: cap(dowsing, /If the area being searched is (.*?)roll \+1d6/),
            stunt: cap(dowsing, /If you have (Skill Stunt \(Dowsing\).*?additional 1d6)/), successThreshold: number(dowsing, /results in (\d+) or higher/),
            shardQuantity: number(dowsing, /you find (\d+) Shard/), colors: cap(dowsing, /random color: (.*?)\. You may/),
            optionalReroll: cap(dowsing, /You (may reroll any die that result in 6, gaining that shard and potentially more)/),
            crystalResonance: block('core:142', 'Crystal Resonance', 'Rainbow Light'), optionalBook: block('may:8', 'Dowsing\tFor\tDummies', 'How\tto\tAvoid')},
        pickup: {completeKeyword: pickup, bands: printedRollBands(block('core:310', 'Roll Item Type Other', '\nAbilities\n')),
            specificItemDecision: cap(pickup, /chart determines (the category of Item, but the GM decides what the specific Item is)/),
            completeAbility: pickupAbility, minutes: number(pickupAbility, /at least (\d+) minutes/), dailyExtended: cap(pickupAbility, /(Daily – Extended Action)/)},
        luck: {bands: printedRollBands(luck), parentCondition: cap(audit.parentContexts.find(p => p.id === 'core:462')?.rawText, /(once per route.*?chart as little or as much as you wish)/),
            money: cap(luck, /(1d4 x100 bucks!)/), conversionIsOptionalSourceNote: true, currencyConversionImplemented: false},
        habitat: {guide: block('core:448', 'Pokémon Habitat List', null), sourceIsPlacementGuidance: true, uniformProbabilitiesEstablished: false,
            ecologyParentIds: ['core:443', 'core:444', 'core:445'], fullListParentIds: ['core:448', 'core:449', 'core:450', 'core:451', 'core:452'],
            nativeCredit: audit.nativeContexts?.find(p => p.contextPath === '$.pages[78]')?.contextDocument.text.content.match(/https:\/\/theworldofpokemon\.com/)?.[0] ?? null,
            creditedSourceFetched: false, taxonomyAliasesEstablished: false},
        poltergeist: {original: originalPoltergeist, optional: optionalPoltergeist,
            optionalLevel: number(optionalPoltergeist, /level (\d+) or higher/), originalFan: cap(originalPoltergeist, /(Fan Rotom:.*?Keen Eye)/),
            optionalFan: cap(optionalPoltergeist, /(Fan\s*Rotom:.*?Hurricane)/), optionalStandard: cap(optionalPoltergeist, /(Standard\s*Rotom:.*?None)/),
            separatelySelectableVersionsRequired: true},
        transform: {completeDefinition: transform, rangeMeters: number(transform, /within (\d+) meters/), literalMovePronoun: cap(transform, /(gains all of the user’s Moves)/),
            unchangedStats: cap(transform, /(The user’s Stats do not change from using Transform)/), expiry: cap(transform, /(until the user is switched out, KO’ d or until the end of the encounter)/),
            voluntaryEnd: cap(transform, /(on its turn as a free action, regaining its previous Move List)/), cannotMiss: cap(transform, /(Transform cannot miss)/),
            optionalImposter: block('feb:6', 'Ability:\tImposter', 'Ability:\tInner\tFocus')},
        typedItems: {booster, brace, plate, boosterDamageBonus: number(booster, /\+(\d+) Damage Bonus/), boosterCost: number(booster, /\$(\d+)/),
            braceDamageReduction: number(brace, /holder (\d+) Damage Reduction/), braceCost: number(brace, /\$(\d+)/),
            plateCombination: cap(plate, /(both a Type Booster and a Type Brace)/), plateListedPrice: cap(plate, /(--)/),
            confidePrintedTm: number(chart, /(\d+) - Confide/), confidePrintedCost: number(chart, /\d+ - Confide \$(\d+)/),
            confideMove: block('core:393', 'Move: Confide', 'Move: Constrict'),
            tmHours: cap(tm, /(about an hour to take effect)/), tmTutorPoints: number(tm, /cost a Pokémon (\d+) Tutor Point/),
            tmTutorMoveLimit: number(tm, /only (\d+) of a Pokémon’s Moves/), tmHmUses: cap(tm, /(TMs are dispensable, one-time use items\. HMs on the other hand can be used once per day)/)},
        survival: {completeParent: audit.parentContexts.find(p => p.id === 'core:40')?.rawText ?? null,
            scoutingPurpose: cap(audit.parentContexts.find(p => p.id === 'core:40')?.rawText, /(learn basic information about it.*?Apricorns or Berries are commonly found in it)/),
            densityDcs: [number(audit.parentContexts.find(p => p.id === 'core:40')?.rawText, /about a (\d+)/),
                number(audit.parentContexts.find(p => p.id === 'core:40')?.rawText, /require a check of (\d+) or so/),
                number(audit.parentContexts.find(p => p.id === 'core:40')?.rawText, /require a check of (\d+)\+/)],
            additionalInformationMargin: number(audit.parentContexts.find(p => p.id === 'core:40')?.rawText, /margin of success of at least (\d+)/),
            currentForagingQuantityFrameworkEstablished: false},
        fossil: {completeParent: audit.parentContexts.find(p => p.id === 'core:216')?.rawText ?? null, findingOrRevivalIsNotEdgeAcquisitionVeto: true},
        sourceAbsenceClaim: false, productionPolicyPromotion: false, behavioralVerification: 'not-run'
    };
}
