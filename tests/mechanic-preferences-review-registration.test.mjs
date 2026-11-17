import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {open} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import {test} from 'node:test';

const pins = [
    ["src/scripts/config/index.js",10591,"eb21ec1567f99d71b98232f81a54ecac33001b7d","6ec5f0212039ddcdc26061d5ef6fbbc4f339cdbceb7c5bf3f677e09ad05b5ab7"],
    ["src/scripts/hooks/init.js",4285,"f333a2407c2496dd2b2d87827e9c2bfc5b7d2542","4b638989e7a5971a2ffc4a04d986b4a5cf65b7e245df4c773b080a1b4a930dfc"],
    ["src/module/apps/mechanic-preferences-review.js",5816,"f0f117b362ba9babbad8d697b9b280d261b1e708","50a6d2a681d710775861259a9a0eb44fd81a438481dc5d4903dfe9ac0510daab"],
    ["src/util/mechanic-preferences.js",19286,"a93bd2cff90e1f34ad964d66384b2c84a57f5978","de585d7b5ba9d0d0b75135fdefdad27ec9f3badd0ea0d1d6e0164c155ab6f8d1"],
    ["src/util/rule-versions.js",11058,"700a37b025c670ab602e4fc1ff0fdaf0bdd02f03","ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9"],
    ["src/util/document-source.js",1386,"ebb47fa13c5c1d9c03084136cf3fee053ae3ec21","86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0"],
    ["src/util/rule-version-registry.js",6196,"d5753450386cc200d01d1cd161a0122d07d6ea5b","93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5"],
];
const configImports = [
    ["./automation.js",["automation"]],
    ["../../module/actor/index.js",["PTUActor","PTUTrainerActor","PTUPokemonActor","PTUCharacterSheet","PTUPokemonSheet","PTUSkills"]],
    ["../../module/item/index.js",["PTUItemProxy","PTUItem","PTUEffect","PTUEdge","PTUFeat","PTUMove","PTUSpecies","PTUSpeciesSheet","PTUItemItem","PTUCondition","PTUItemSheet","PTUEffectSheet","PTUEdgeSheet","PTUFeatSheet","PTUMoveSheet"]],
    ["../../module/combat/document.js",["PTUCombat"]],
    ["./data/index.js",["levelProgression","typeEffectiveness","natureData","pokemonData","dbData","helpText"]],
    ["./data/pokeball-themes.js",["pokeballStyles","pokeballShapes"]],
    ["../../module/rules/index.js",["RuleElements"]],
    ["../../module/system/predication.js",["PTUPredicate"]],
    ["../../module/actor/base.js",["PTUActorProxy"]],
    ["../../util/enricher.js",["Enricher"]],
    ["../../util/misc.js",["sluggify"]],
    ["./data/tms.js",["default"]],
    ["../../module/apps/party/index.js",["PTUPartySheet"]],
    ["../../module/apps/pokemon-training/index.js",["PTUPokemonTrainingSheet"]],
    ["../../module/active-effect.js",["ActiveEffectPTU"]],
    ["./effects.js",["statusEffects"]],
    ["../../module/canvas/status-effect.js",["StatusEffects"]],
    ["../../module/canvas/token/index.js",["PTUToken"]],
    ["../../module/apps/species-drag-in/sheet.js",["PTUSpeciesDragOptionsPrompt"]],
    ["../../module/apps/species-mass-generator/sheet.js",["PTUSpeciesMassGenerator"]],
    ["../../module/apps/npc-quick-build/sheet.js",["PTUNpcQuickBuild"]],
    ["../../module/apps/level-up-form/sheet.js",["LevelUpForm"]],
    ["../../module/apps/level-up-form/document.js",["LevelUpData"]],
    ["../../module/system/check/rolls/attack-roll.js",["AttackRoll"]],
    ["../../module/system/check/rolls/roll.js",["CheckRoll"]],
    ["../../module/apps/sidebar/chatlog.js",["PTUChatLog"]],
    ["../../module/message/base.js",["ChatMessagePTU","PTUChatMessageProxy"]],
    ["../../module/system/damage/roll.js",["DamageRoll"]],
    ["../../module/message/damage.js",["DamageMessagePTU"]],
    ["../../module/message/attack.js",["AttackMessagePTU"]],
    ["../../module/item/item/pokeball.js",["PokeballItem"]],
    ["../../module/system/check/rolls/capture-roll.js",["CaptureRoll"]],
    ["../../module/system/check/rolls/initiative-roll.js",["InitiativeRoll"]],
    ["../../module/combat/combatant.js",["PTUCombatant"]],
    ["../../module/combat/config.js",["PTUCombatTrackerConfig"]],
    ["../../module/combat/tracker.js",["PTUCombatTracker"]],
    ["../../module/canvas/token/document.js",["PTUTokenDocument"]],
    ["../../module/user.js",["PTUUser"]],
    ["../../module/item/contestmove/document.js",["PTUContestMove"]],
    ["../../module/item/contestmove/sheet.js",["PTUContestMoveSheet"]],
    ["../../module/apps/hotbar.js",["PTUHotBar"]],
    ["../../module/canvas/token/sheet.js",["PTUTokenConfig"]],
    ["../../module/apps/compendium-browser/index.js",["PackLoader"]],
    ["../../module/apps/rulebook-journal.js",["default"]],
    ["../../module/item/effect-types/base.js",["BaseEffectPTU"]],
];
const initImports = [
    ["../game-ptu.js",["GamePTU"]],
    ["../../module/system/index.js",["registerSettings"]],
    ["../handlebars.js",["registerHandlebarsHelpers"]],
    ["../sheets.js",["registerSheets"]],
    ["../templates.js",["registerTemplates"]],
    ["../../module/canvas/helpers.js",["measureDistances"]],
    ["../../module/item/collection.js",["PTUItems"]],
];
const reviewSpecifier = "../../module/apps/mechanic-preferences-review.js";
const reviewImport = "import { MechanicPreferencesReview } from '../../module/apps/mechanic-preferences-review.js';";
const effectImport = "import { BaseEffectPTU } from '../../module/item/effect-types/base.js';";
const slot = ["  mechanicPreferencesReview: {","    sheetClass: MechanicPreferencesReview","  },"];
const decode = new TextDecoder('utf-8', {fatal:true, ignoreBOM:true});
const hash = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');

function unique(text, span) {
    const start = text.indexOf(span);
    assert.ok(start >= 0 && text.indexOf(span, start + 1) === -1, 'Expected one span: ' + span);
    return start;
}

function invertConfig(candidate, eol) {
    const importSpan = reviewImport + eol;
    const uiSpan = slot.join(eol) + eol;
    const importAt = unique(candidate, effectImport + eol + importSpan) + effectImport.length + eol.length;
    const uiAt = unique(candidate, eol + uiSpan + '  party: {' + eol) + eol.length;
    assert.equal(unique(candidate, importSpan), importAt);
    assert.equal(unique(candidate, uiSpan), uiAt);
    assert.ok(importAt < uiAt && unique(candidate, 'const ui = {' + eol) < uiAt);
    assert.ok(!candidate.endsWith('\n'));
    return candidate.slice(0, importAt) + candidate.slice(importAt + importSpan.length, uiAt)
        + candidate.slice(uiAt + uiSpan.length);
}

function assertImports(source, count, expected) {
    const declarations = source.split(/\r?\n/).filter(line => /^import\s/.test(line));
    assert.equal(declarations.length, count);
    const bindings = new Map();
    for (const line of declarations) {
        const match = line.match(/^import\s+(.+?)\s+from\s+(['"])([^'"]+)\2;?$/);
        assert.ok(match, line);
        const [, clause,, specifier] = match;
        const names = clause.startsWith('{')
            ? clause.slice(1, -1).split(',').map(name => name.trim())
            : ['default'];
        bindings.set(specifier, [...(bindings.get(specifier) ?? []), ...names]);
    }
    assert.deepEqual([...bindings], expected);
}

async function readSources(t) {
    const sources = new Map();
    let remaining = 64 * 1024;
    for (const [index, [path, length, id, sha]] of pins.entries()) {
        const file = await open(new URL('../' + path, import.meta.url), 'r');
        let bytes;
        try {
            const {size} = await file.stat();
            assert.ok(size > 0 && size <= remaining, 'Production loader input cap');
            bytes = Buffer.alloc(size);
            let offset = 0;
            while (offset < size) {
                const {bytesRead} = await file.read(bytes, offset, size - offset, offset);
                assert.ok(bytesRead > 0, 'Unexpected EOF: ' + path);
                offset += bytesRead;
                remaining -= bytesRead;
            }
            assert.equal((await file.stat()).size, size, path);
        } finally {
            await file.close();
        }
        assert.equal(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), false, path);
        const source = decode.decode(bytes);
        assert.doesNotMatch(source, /\r(?!\n)/, path);
        const crlf = (source.match(/\r\n/g) ?? []).length;
        const lf = (source.match(/(?<!\r)\n/g) ?? []).length;
        let original = source;
        if (index === 0) {
            assert.ok(crlf === 0 || lf === 0, 'Mixed configuration line endings');
            original = invertConfig(source, crlf ? '\r\n' : '\n');
        }
        const canonical = Buffer.from(original.replace(/\r\n/g, '\n'));
        assert.equal(canonical.length, length, path);
        assert.equal(blob(canonical), id, path);
        assert.equal(hash('sha256', canonical), sha, path);
        sources.set(path, source);
        if (index === 0) sources.set('baseline-config', original);
        t.diagnostic(path + ': ' + bytes.length + ' bytes; ' + hash('sha256', bytes) + '; ' + lf + ' LF, ' + crlf + ' CRLF');
    }
    t.diagnostic('Production loader inputs: ' + (64 * 1024 - remaining) + ' bytes');
    assertImports(sources.get('baseline-config'), 47, configImports);
    assertImports(sources.get(pins[0][0]), 48, [...configImports, [reviewSpecifier, ['MechanicPreferencesReview']]]);
    assertImports(sources.get(pins[1][0]), 8, [['../config/index.js', ['PTUCONFIG']], ...initImports]);
    return sources;
}

function makeDoubles(emit, forbid) {
    const modules = new Map();
    const identities = new Set();
    const recorders = new Set(['registerSheets', 'registerHandlebarsHelpers', 'registerSettings', 'registerTemplates']);
    function sentinel(name, body) {
        const value = body ?? function () { forbid(name); };
        identities.add(value);
        return value;
    }
    for (const [specifier, names] of [...configImports, ...initImports]) {
        const exports = Object.create(null);
        for (const name of names) {
            let value;
            if (name === 'pokeballStyles') {
                value = {default:Object.freeze(sentinel('pokeballStyles.default'))};
                identities.add(value);
            } else if (name === 'PTUCombatTrackerConfig') {
                value = sentinel(name);
                value.registerHooks = Object.freeze((...args) => emit('combat.registerHooks', ...args));
            } else if (name === 'GamePTU') {
                value = sentinel(name);
                value.onInit = Object.freeze((...args) => emit('GamePTU.onInit', ...args));
            } else if (recorders.has(name)) {
                value = sentinel(name, (...args) => emit(name, ...args));
            } else {
                value = sentinel(specifier + ':' + name);
            }
            exports[name] = Object.freeze(value);
        }
        assert.equal(modules.has(specifier), false);
        modules.set(specifier, Object.freeze(exports));
    }
    return {modules, identities};
}

function privateGraph(sources, doubles, key) {
    const root = 'ptu-mechanic-registration://' + randomUUID() + '/';
    const entries = new Map();
    const edges = new Map();
    const ids = new Map();
    function add(id, source, imports = []) {
        assert.equal(entries.has(id), false);
        assert.equal(typeof source, 'string');
        entries.set(id, source);
        edges.set(id, new Map(imports));
    }
    for (const [specifier, exports] of doubles) {
        const id = 'double-' + ids.size;
        ids.set(specifier, id);
        const binding = 'const bindings = globalThis[' + JSON.stringify(key) + '].get(' + JSON.stringify(specifier) + ');\n';
        add(id, binding + Object.keys(exports).map(name => name === 'default'
            ? 'export default bindings.default;'
            : 'export const ' + name + ' = bindings.' + name + ';').join('\n'));
    }
    const synthetic = manifest => manifest.map(([specifier]) => [specifier, ids.get(specifier)]);
    add('baseline-config', sources.get('baseline-config'), synthetic(configImports));
    add('candidate-config', sources.get(pins[0][0]), [...synthetic(configImports), [reviewSpecifier, 'review']]);
    for (const side of ['baseline', 'candidate']) {
        add(side + '-init', sources.get(pins[1][0]), [
            ['../config/index.js', side + '-config'], ...synthetic(initImports),
        ]);
    }
    add('review', sources.get(pins[2][0]), [['../../util/mechanic-preferences.js', 'bridge']]);
    add('bridge', `
        import {inspectMechanicPreferences as inspect, previewMechanicPreset as preview} from './mechanic-preferences.js';
        export const calls = [];
        function record(name, api, args) {
            const report = api(...args);
            calls.push({name, args, report, before:structuredClone(report), serialized:JSON.stringify(report)});
            return report;
        }
        export function inspectMechanicPreferences(...args) { return record('inspect', inspect, args); }
        export function previewMechanicPreset(...args) { return record('preview', preview, args); }
    `, [['./mechanic-preferences.js', 'preferences']]);
    add('preferences', sources.get(pins[3][0]), [['./rule-versions.js', 'versions']]);
    add('versions', sources.get(pins[4][0]), [
        ['./document-source.js', 'document-source'], ['./rule-version-registry.js', 'registry'],
    ]);
    add('document-source', sources.get(pins[5][0]));
    add('registry', sources.get(pins[6][0]), [['./rule-versions.js', 'versions']]);
    const top = new Set(['baseline-config', 'candidate-config', 'baseline-init', 'candidate-init', 'review', 'bridge']);
    const hooks = registerHooks({
        resolve(specifier, context, nextResolve) {
            if (context.parentURL?.startsWith(root)) {
                const id = edges.get(context.parentURL.slice(root.length))?.get(specifier);
                assert.ok(id && entries.has(id), 'Unexpected private import: ' + specifier);
                return {url:root + id, shortCircuit:true};
            }
            if (specifier.startsWith(root)) {
                assert.equal(context.parentURL, import.meta.url);
                assert.ok(top.has(specifier.slice(root.length)));
                return {url:specifier, shortCircuit:true};
            }
            return nextResolve(specifier, context);
        },
        load(url, context, nextLoad) {
            if (!url.startsWith(root)) return nextLoad(url, context);
            const source = entries.get(url.slice(root.length));
            assert.equal(typeof source, 'string');
            return {format:'module', source, shortCircuit:true};
        },
    });
    return {
        url:id => root + id,
        dispose() {
            try { hooks.deregister(); }
            finally { entries.clear(); edges.clear(); }
        },
    };
}

function withDescriptors() {
    const saved = [];
    return {
        set(object, key, descriptor) {
            const prior = Object.getOwnPropertyDescriptor(object, key);
            Object.defineProperty(object, key, {configurable:true, ...descriptor});
            saved.push({object, key, prior});
        },
        restore() {
            for (const {object, key, prior} of saved.reverse()) {
                if (prior) Object.defineProperty(object, key, prior);
                else Reflect.deleteProperty(object, key);
            }
            for (const {object, key, prior} of saved) {
                assert.deepEqual(Object.getOwnPropertyDescriptor(object, key), prior, String(key));
            }
            saved.length = 0;
        },
    };
}

function assertEquivalent(actual, expected, identities, path = 'root') {
    if (identities.has(expected) || typeof expected === 'function' || expected === null || typeof expected !== 'object') {
        assert.equal(actual, expected, path);
        return;
    }
    assert.ok(actual !== null && typeof actual === 'object', path);
    assert.equal(Object.getPrototypeOf(actual), Object.getPrototypeOf(expected), path);
    assert.equal(Object.isExtensible(actual), Object.isExtensible(expected), path);
    const keys = Reflect.ownKeys(expected);
    assert.deepEqual(Reflect.ownKeys(actual), keys, path);
    for (const key of keys) {
        const location = path + '.' + String(key);
        const {value, ...attributes} = Object.getOwnPropertyDescriptor(expected, key);
        const {value:found, ...foundAttributes} = Object.getOwnPropertyDescriptor(actual, key);
        assert.deepEqual(foundAttributes, attributes, location);
        if (Object.hasOwn(attributes, 'writable')) assertEquivalent(found, value, identities, location);
    }
}

const expectedInit = [
    ['console.log', 'Initializing Pokemon Carbon System'],
    ['combat.registerHooks'],
    ['document.querySelector', '#ui-right'],
    ['registerSheets'],
    ['registerHandlebarsHelpers'],
    ['registerSettings'],
    ['registerTemplates'],
    ['game.settings.get', 'ptu', 'devMode'],
    ['GamePTU.onInit'],
];
const expectedListeners = [['Hooks.on', 'init'], ['Hooks.on', 'canvasInit']];

function application() {
    const calls = [];
    const rendered = Object.freeze({synthetic:'render result'});
    class Application {
        constructor(...args) { calls.push(['construct', this, args]); }
        render(...args) {
            calls.push(['render', this, args]);
            return rendered;
        }
        close(...args) {
            calls.push(['close', this, args]);
            return {synthetic:'discarded close result'};
        }
    }
    return {Application, calls, rendered};
}

function syntheticHost(existingRoll, forbid) {
    const log = [];
    const hooks = new Map();
    const constValue = Object.freeze({preserved:true});
    const originalConst = Object.freeze({SYNTHETIC_CONSTANT:constValue});
    const rollList = [existingRoll];
    const config = Object.fromEntries([
        'User', 'Combat', 'Combatant', 'ui', 'Actor', 'Item', 'ActiveEffect', 'Token', 'ChatMessage',
    ].map(key => [key, {}]));
    config.Dice = {rolls:rollList, synthetic:'preserved'};
    const dice = config.Dice;
    const windowSentinel = Object.freeze({synthetic:'window field'});
    const hostWindow = {preserved:windowSentinel};

    function emit(name, ...args) { log.push([name, ...args]); }
    function restrict(label, value) {
        return new Proxy(Object.freeze(value), {
            get(target, key) {
                if (!Object.hasOwn(target, key)) forbid(label + '.' + String(key));
                return target[key];
            },
            set(_target, key) { forbid(label + '.' + String(key) + ' assignment'); },
        });
    }
    const host = {
        CONFIG:config,
        CONST:originalConst,
        window:hostWindow,
        Hooks:restrict('Hooks', {on(name, callback) {
            if ((name !== 'init' && name !== 'canvasInit') || hooks.has(name)) forbid('Hooks.on ' + String(name));
            assert.equal(typeof callback, 'function');
            hooks.set(name, callback);
            emit('Hooks.on', name);
        }}),
        document:restrict('document', {querySelector(selector) {
            assert.equal(selector, '#ui-right');
            emit('document.querySelector', selector);
            return null;
        }}),
        game:restrict('game', {settings:restrict('game.settings', {
            get(...args) {
                assert.deepEqual(args, ['ptu', 'devMode']);
                emit('game.settings.get', ...args);
                return false;
            },
            set() { forbid('game.settings.set'); },
        })}),
    };
    return {host, log, hooks, emit, originalConst, constValue, rollList, dice, windowSentinel};
}

async function inHost(state, synthetic, fn) {
    assert.equal(state.activeHost, null);
    const bindings = withDescriptors();
    state.activeHost = synthetic;
    try {
        for (const [key, value] of Object.entries(synthetic.host)) {
            bindings.set(globalThis, key, {value:key === 'CONST' ? synthetic.initializedConst ?? value : value, writable:true});
        }
        bindings.set(console, 'log', {value:(...args) => synthetic.emit('console.log', ...args), writable:true});
        return await fn();
    } finally {
        try { bindings.restore(); }
        finally { state.activeHost = null; }
    }
}

function verifyInit(synthetic, config, itemCollection, existingRoll) {
    const {host, originalConst, constValue, rollList, dice, windowSentinel} = synthetic;
    const actual = host.CONFIG;
    assert.equal(actual.PTU, config);
    assert.equal(actual.Dice, dice);
    assert.equal(actual.Dice.rolls, rollList);
    assert.equal(actual.Dice.rolls.length, config.Dice.rolls.length + 1);
    assert.equal(actual.Dice.rolls[0], existingRoll);
    for (const [index, roll] of config.Dice.rolls.entries()) assert.equal(actual.Dice.rolls[index + 1], roll);
    assert.deepEqual(Reflect.ownKeys(host.window), ['preserved', 'actor']);
    assert.equal(host.window.preserved, windowSentinel);
    assert.equal(typeof host.window.actor, 'function');
    assert.notEqual(globalThis.CONST, originalConst);
    assert.equal(globalThis.CONST.SYNTHETIC_CONSTANT, constValue);
    assert.deepEqual(globalThis.CONST, {SYNTHETIC_CONSTANT:constValue, STATS_FACTOR:0.5, STATS_SIGMA:3.5});
    assert.ok(Object.isSealed(globalThis.CONST));
    assert.deepEqual(originalConst, {SYNTHETIC_CONSTANT:constValue});
    assert.deepEqual(actual, {
        PTU:config,
        User:{documentClass:config.User.documentClass},
        Combat:{initiative:config.combat.initiative, documentClass:config.combat.documentClass,
            defeatedStatusId:config.combat.defeatedStatusId},
        Combatant:{documentClass:config.combatant.documentClass},
        ui:{combat:config.combat.uiClass, chat:config.ui.chatlog.documentClass, hotbar:config.ui.hotbar.documentClass},
        Actor:{documentClass:config.Actor.proxy},
        Item:{documentClass:config.Item.proxy, collection:itemCollection},
        ActiveEffect:{documentClass:config.ActiveEffect.documentClass},
        Token:{objectClass:config.Token.objectClass, documentClass:config.Token.documentClass},
        ChatMessage:{documentClass:config.ChatMessage.documentClass},
        Dice:{rolls:[existingRoll, ...config.Dice.rolls], synthetic:'preserved'},
        statusEffects:config.statusEffects,
    });
    assert.equal(actual.Combat.initiative, config.combat.initiative);
    assert.equal(actual.Item.collection, itemCollection);
    assert.equal(actual.statusEffects, config.statusEffects);
}

const json = value => JSON.stringify(value, null, 2);
const mechanicId = 'synthetic-registration-mechanic';
const alternative = 'synthetic-registration-alternative';

function freeze(value) {
    if (value !== null && typeof value === 'object') {
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
}

function assertFrozen(value) {
    if (value !== null && typeof value === 'object') {
        assert.ok(Object.isFrozen(value));
        for (const child of Object.values(value)) assertFrozen(child);
    }
}

function reviewRequest(preview) {
    const choice = id => ({id, label:'Synthetic ' + id, sourceStatus:'synthetic',
        citation:'Synthetic registration citation', eligibility:'eligible'});
    const request = {
        schemaVersion:1,
        definitions:[{id:mechanicId, label:'Synthetic registry evidence', storageScope:'world',
            choices:[choice('standard'), choice(alternative)]}],
        observations:[{id:mechanicId, storageScope:'world', state:'absent', evidenceRef:'Synthetic absence evidence'}],
    };
    if (preview) request.presetRequests = [{
        id:'synthetic-registration-preset', label:'Synthetic preset',
        assignments:[{mechanicId, value:alternative}],
    }];
    return freeze(request);
}

async function assertReview(state, mode) {
    const preview = mode === 'preset-preview';
    const fixture = reviewRequest(preview);
    const fixtureBefore = structuredClone(fixture);
    const raw = JSON.stringify(fixture, null, 2) + '\n';
    const {bridgeCalls, app, candidateHost} = state;
    const apiStart = bridgeCalls.length;
    const appStart = app.calls.length;
    const hostBefore = structuredClone(candidateHost.log);
    await inHost(state, candidateHost, async () => {
        assert.equal(CONFIG.PTU, state.candidate);
        const beforeConfig = CONFIG.PTU;
        const beforeRolls = [...CONFIG.Dice.rolls];
        const Review = CONFIG.PTU.ui.mechanicPreferencesReview.sheetClass;
        const instance = new Review(raw, mode);
        assert.equal(Review, state.Review);
        assert.equal(bridgeCalls.length, apiStart + 1);
        const call = bridgeCalls[apiStart];
        assert.equal(call.name, preview ? 'preview' : 'inspect');
        assert.equal(call.args.length, 1);
        assert.equal(typeof call.args[0], 'string');
        assert.equal(call.args[0], raw);
        assert.equal(Object.getPrototypeOf(instance), Review.prototype);
        assert.deepEqual(app.calls.slice(appStart), [['construct', instance, []]]);
        const {report} = call;
        const view = instance.getData();
        assert.equal(view.mode, mode);
        assert.equal(view.report, json(report));
        assert.equal(view.input, json(report.input));
        assert.equal(view.rawJson, raw);
        assert.deepEqual(JSON.parse(view.report), JSON.parse(call.serialized));
        assert.deepEqual(JSON.parse(view.input).snapshot, fixture);
        assert.deepEqual(report.input.snapshot, fixture);
        assert.equal(report.mode, mode);
        assert.deepEqual(report.current.map(row => row.id), [mechanicId]);
        assert.deepEqual(report.current[0].effective, {availability:'available', value:'standard', origin:'standard-fallback'});
        assert.equal(view.current[0].effective, json('standard'));
        assert.equal(view.current[0].origin, 'standard-fallback');
        if (preview) {
            const [proposal] = report.preset.proposals;
            assert.equal(report.preset.availability, 'available');
            assert.equal(report.preset.proposals.length, 1);
            assert.equal(proposal.mechanicId, mechanicId);
            assert.deepEqual(proposal.proposed, {presence:'present', availability:'available', value:alternative});
            assert.equal(proposal.disposition, 'proposed');
            assert.equal(proposal.storedWouldDiffer, true);
            assert.equal(proposal.preferenceWouldDiffer, true);
            assert.equal(view.preset.proposals[0].detail, json(proposal));
        } else {
            assert.equal(report.preset.availability, 'not-requested');
            assert.deepEqual(view.preset.proposals, []);
        }
        assert.equal(instance.render(true), app.rendered);
        assert.equal(await instance.close(), undefined);
        assert.deepEqual(app.calls.slice(appStart), [
            ['construct', instance, []], ['render', instance, [true]], ['close', instance, []],
        ]);
        assert.equal(bridgeCalls.length, apiStart + 1);
        assert.deepEqual(instance.getData(), view);
        assert.equal(CONFIG.PTU, beforeConfig);
        assert.deepEqual(CONFIG.Dice.rolls, beforeRolls);
        assert.equal(globalThis.CONST, candidateHost.initializedConst);
        assertFrozen(report);
        assert.deepEqual(structuredClone(report), call.before);
        assert.equal(JSON.stringify(report), call.serialized);
    });
    assert.deepEqual(candidateHost.log, hostBefore);
    assertFrozen(fixture);
    assert.deepEqual(fixture, fixtureBefore);
    assert.equal(JSON.stringify(fixture, null, 2) + '\n', raw);
}

test('mechanic preferences review registration through the existing initializer', async t => {
    assert.equal(typeof registerHooks, 'function');
    const sources = await readSources(t);
    const app = application();
    const forbidden = [];
    const forbid = name => {
        forbidden.push(name);
        assert.fail('Unexpected host effect: ' + name);
    };
    const state = {app, activeHost:null};
    const {modules, identities} = makeDoubles((name, ...args) => {
        if (state.activeHost === null) forbid(name);
        state.activeHost.emit(name, ...args);
    }, forbid);
    const existingRoll = Object.freeze(function SyntheticExistingRoll() { forbid('existing Dice roll'); });
    identities.add(existingRoll);
    const bindings = withDescriptors();
    let graph;
    try {
        for (const name of ['CONFIG', 'CONST', 'Hooks', 'window', 'document', 'game', 'foundry', 'canvas',
            'Actor', 'Item', 'Document', 'fromUuid', 'fromUuidSync', 'fetch', 'XMLHttpRequest', 'WebSocket',
            'EventSource', 'Dialog', 'DialogV2', 'ChatMessage', 'ui', 'TextEditor', 'renderTemplate', '$']) {
            bindings.set(globalThis, name, {get:() => forbid(name), set:() => forbid(name + ' assignment')});
        }
        bindings.set(console, 'log', {value:() => forbid('console.log outside initializer'), writable:true});
        bindings.set(globalThis, 'Application', {value:app.Application, writable:true});
        const key = '__ptuMechanicRegistration_' + randomUUID();
        assert.equal(Object.hasOwn(globalThis, key), false);
        bindings.set(globalThis, key, {value:modules});
        graph = privateGraph(sources, modules, key);

        await t.test('A. Complete registry preservation and inert loading', async () => {
            const {PTUCONFIG:baseline} = await import(graph.url('baseline-config'));
            const {PTUCONFIG:candidate} = await import(graph.url('candidate-config'));
            const {MechanicPreferencesReview:Review} = await import(graph.url('review'));
            const {calls:bridgeCalls} = await import(graph.url('bridge'));
            const {mechanicPreferencesReview:added, ...ui} = candidate.ui;
            assert.equal(Object.hasOwn(baseline.ui, 'mechanicPreferencesReview'), false);
            assert.deepEqual(Reflect.ownKeys(added), ['sheetClass']);
            assert.equal(Object.getOwnPropertyDescriptor(added, 'sheetClass').value, Review);
            assert.equal(added.sheetClass, Review);
            assertEquivalent({...candidate, ui}, baseline, identities);
            const baselineHost = syntheticHost(existingRoll, forbid);
            const candidateHost = syntheticHost(existingRoll, forbid);
            for (const [side, host] of [['baseline', baselineHost], ['candidate', candidateHost]]) {
                await inHost(state, host, async () => {
                    const {Init} = await import(graph.url(side + '-init'));
                    Init.listen();
                });
                assert.deepEqual(host.log, expectedListeners);
                assert.deepEqual([...host.hooks.keys()], ['init', 'canvasInit']);
                assert.equal(Object.hasOwn(host.host.CONFIG, 'PTU'), false);
            }
            assert.deepEqual(bridgeCalls, []);
            assert.deepEqual(app.calls, []);
            assert.deepEqual(forbidden, []);
            Object.assign(state, {baseline, candidate, Review, bridgeCalls, baselineHost, candidateHost});
        });

        await t.test('B. Actual init binding with unchanged baseline effects', async () => {
            const {baseline, candidate, baselineHost, candidateHost, bridgeCalls} = state;
            const itemCollection = modules.get('../../module/item/collection.js').PTUItems;
            assert.notEqual(baselineHost.hooks.get('init'), candidateHost.hooks.get('init'));
            assert.notEqual(baselineHost.hooks.get('canvasInit'), candidateHost.hooks.get('canvasInit'));
            for (const [host, config] of [[baselineHost, baseline], [candidateHost, candidate]]) {
                await inHost(state, host, async () => {
                    await host.hooks.get('init')();
                    verifyInit(host, config, itemCollection, existingRoll);
                    host.initializedConst = globalThis.CONST;
                });
                assert.deepEqual(host.log, [...expectedListeners, ...expectedInit]);
            }
            const {PTU:baselinePTU, ...baselineConfig} = baselineHost.host.CONFIG;
            const {PTU:candidatePTU, ...candidateConfig} = candidateHost.host.CONFIG;
            assert.equal(baselinePTU, baseline);
            assert.equal(candidatePTU, candidate);
            assertEquivalent(candidateConfig, baselineConfig, identities);
            assertEquivalent(candidateHost.initializedConst, baselineHost.initializedConst, identities);
            assert.notEqual(candidateHost.host.window.actor, baselineHost.host.window.actor);
            assert.deepEqual(Reflect.ownKeys(candidateHost.host.window), Reflect.ownKeys(baselineHost.host.window));
            assert.deepEqual(candidateHost.log, baselineHost.log);
            assert.deepEqual(bridgeCalls, []);
            assert.deepEqual(app.calls, []);
            assert.deepEqual(forbidden, []);
        });

        await t.test('C. Explicit current-mode call through the registry', () => assertReview(state, 'current'));
        await t.test('D. Explicit preview-mode call through the registry', () => assertReview(state, 'preset-preview'));
        assert.deepEqual(forbidden, []);
    } finally {
        try {
            graph?.dispose();
        } finally {
            try { bindings.restore(); }
            finally {
                sources.clear();
                modules.clear();
                identities.clear();
            }
        }
    }
});
