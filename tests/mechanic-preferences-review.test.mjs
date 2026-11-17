import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import * as nodeModule from 'node:module';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';

const appPath = 'src/module/apps/mechanic-preferences-review.js';
const templatePath = 'static/templates/apps/mechanic-preferences-review.hbs';
const sourcePins = [
    ['mechanic-preferences.js', 19286, 'de585d7b5ba9d0d0b75135fdefdad27ec9f3badd0ea0d1d6e0164c155ab6f8d1'],
    ['rule-versions.js', 11058, 'ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9'],
    ['document-source.js', 1386, '86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0'],
    ['rule-version-registry.js', 6196, '93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5'],
];
const rendererPins = [
    ['node_modules/handlebars/package.json', 3622, 'cf06251288836dd2ba6d8d1a83dbe4c8c944556c34e17a3263c86325115d2a3c'],
    ['node_modules/handlebars/dist/handlebars.js', 215867, '5e25e8190da08af70e4ef544849e51c37a95125cacc86d4dbfca46cde9979af4'],
];

const decode = new TextDecoder('utf-8', {fatal:true, ignoreBOM:true});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(new URL('../' + path, import.meta.url));
const json = value => JSON.stringify(value, null, 2);
const own = Object.hasOwn;

function sourceText(bytes, path) {
    assert.equal(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), false, path + ' BOM');
    const source = decode.decode(bytes);
    assert.doesNotMatch(source, /\r(?!\n)/, path + ' lone CR');
    return source;
}

async function readSources(t) {
    const sources = new Map([['app', sourceText(await read(appPath), appPath)]]);
    let total = 0;
    for (const [name, length, sha] of sourcePins) {
        const bytes = await read('src/util/' + name);
        total += bytes.length;
        assert.ok(total <= 64 * 1024);
        const source = sourceText(bytes, name);
        const normalized = source.replace(/\r\n/g, '\n');
        assert.equal(Buffer.byteLength(normalized), length, name);
        assert.equal(hash(normalized), sha, name);
        const crlf = (source.match(/\r\n/g) ?? []).length;
        const lf = (source.match(/(?<!\r)\n/g) ?? []).length;
        t.diagnostic(name + ': ' + bytes.length + ' working bytes; ' + hash(bytes) + '; ' + lf + ' LF, ' + crlf + ' CRLF');
        sources.set(name, source);
    }
    sources.set('bridge', `
        import {inspectMechanicPreferences as inspect, previewMechanicPreset as preview} from './mechanic-preferences.js';
        export const calls = [];
        export function inspectMechanicPreferences(...args) {
            const report = inspect(...args);
            calls.push({name:'inspect', args, report, snapshot:structuredClone(report), original:JSON.stringify(report)});
            return report;
        }
        export function previewMechanicPreset(...args) {
            const report = preview(...args);
            calls.push({name:'preview', args, report, snapshot:structuredClone(report), original:JSON.stringify(report)});
            return report;
        }
    `);
    return sources;
}

function registerGraph(sources) {
    const root = 'ptu-mechanic-review://' + randomUUID() + '/';
    const entries = new Map([...sources].map(([name, source]) => [root + name, source]));
    const edges = new Map([
        ['app', new Map([['../../util/mechanic-preferences.js', 'bridge']])],
        ['bridge', new Map([['./mechanic-preferences.js', 'mechanic-preferences.js']])],
        ['mechanic-preferences.js', new Map([['./rule-versions.js', 'rule-versions.js']])],
        ['rule-versions.js', new Map([
            ['./document-source.js', 'document-source.js'],
            ['./rule-version-registry.js', 'rule-version-registry.js'],
        ])],
        ['rule-version-registry.js', new Map([['./rule-versions.js', 'rule-versions.js']])],
        ['document-source.js', new Map()],
    ]);
    const hooks = nodeModule.registerHooks({
        resolve(specifier, context, nextResolve) {
            if (context.parentURL?.startsWith(root)) {
                const name = edges.get(context.parentURL.slice(root.length))?.get(specifier);
                assert.ok(name, 'Unexpected private import: ' + specifier);
                return {url:root + name, shortCircuit:true};
            }
            if (specifier.startsWith(root)) {
                assert.equal(context.parentURL, import.meta.url);
                assert.ok(specifier === root + 'app' || specifier === root + 'bridge');
                return {url:specifier, shortCircuit:true};
            }
            return nextResolve(specifier, context);
        },
        load(url, context, nextLoad) {
            if (!url.startsWith(root)) return nextLoad(url, context);
            assert.ok(entries.has(url), 'Unexpected private module: ' + url);
            return {format:'module', source:entries.get(url), shortCircuit:true};
        },
    });
    return {hooks, app:root + 'app', bridge:root + 'bridge'};
}

async function loadRenderer() {
    const [packageJson, bundle] = await Promise.all(rendererPins.map(async ([path, length, sha]) => {
        const bytes = await read(path);
        assert.equal(bytes.length, length, path);
        assert.equal(hash(bytes), sha, path);
        return decode.decode(bytes);
    }));
    assert.equal(JSON.parse(packageJson).version, '4.7.10');
    const required = [];
    const module = {exports:{}};
    const context = {module, exports:module.exports, require(name) {
        required.push(name);
        assert.fail('Renderer attempted external require: ' + name);
    }};
    const template = sourceText(await read(templatePath), templatePath);
    runInNewContext(bundle, context, {filename:'pinned-handlebars.js', timeout:10000});
    const renderer = module.exports;
    assert.equal(renderer.VERSION, '4.7.10');
    assert.equal(typeof renderer.compile, 'function');
    const render = renderer.compile(template);
    return {render, required};
}

function applicationBoundary() {
    const calls = {construct:[], render:[], close:[], listeners:[]};
    const renderResult = Object.freeze({rendered:true});
    const baseCloseResult = Object.freeze({approved:true, changes:['synthetic sentinel']});
    const baseOptions = Object.freeze({syntheticBase:true});
    const behavior = {close:() => baseCloseResult};
    class Application {
        constructor(...args) { calls.construct.push({app:this, args}); }
        static get defaultOptions() { return baseOptions; }
        render(...args) {
            calls.render.push({app:this, args});
            return renderResult;
        }
        activateListeners(html) { calls.listeners.push({app:this, html}); }
        close(...args) {
            calls.close.push({app:this, args});
            return behavior.close();
        }
        headerClose(options) { return this.close(options); }
    }
    return {Application, calls, renderResult, behavior, baseOptions};
}

function listenerBoundary() {
    const targets = new Map();
    const channel = target => {
        if (targets.has(target)) return targets.get(target);
        const handlers = [];
        const binding = {
            off(event) {
                assert.match(event, /^(click|keydown)\.ptuMechanicPreferencesReview$/);
                for (let i = handlers.length - 1; i >= 0; i--) {
                    if (handlers[i].event === event) handlers.splice(i, 1);
                }
                return binding;
            },
            on(event, fn) { handlers.push({event, fn}); return binding; },
        };
        const entry = {binding, handlers};
        targets.set(target, entry);
        return entry;
    };
    const root = channel('root');
    const html = {
        ...root.binding,
        find(selector) {
            assert.match(selector, /^button\[data-action="(close|cancel)"\]$/);
            return channel(selector).binding;
        },
    };
    const dispatch = (target, type, key) => {
        const event = {key, prevented:0, stopped:0,
            preventDefault() { this.prevented++; },
            stopPropagation() { this.stopped++; },
        };
        const returns = channel(target).handlers.filter(h => h.event.split('.')[0] === type).map(h => h.fn(event));
        return {event, returns};
    };
    return {
        html,
        counts:() => [...targets.values()].map(t => t.handlers.length),
        click:action => dispatch('button[data-action="' + action + '"]', 'click'),
        key:key => dispatch('root', 'keydown', key),
    };
}

function forbidGlobals() {
    const changed = [];
    const forbidden = [];
    const trap = name => {
        forbidden.push(name);
        assert.fail('Forbidden host access: ' + name);
    };
    function set(key, descriptor) {
        const prior = Object.getOwnPropertyDescriptor(globalThis, key);
        Object.defineProperty(globalThis, key, {...descriptor, configurable:true});
        changed.push({key, prior});
    }
    return {
        forbidden, set,
        install(Application) {
            set('Application', {value:Application, writable:true});
            for (const key of [
                'game', 'canvas', 'CONFIG', 'Hooks', 'Dialog', 'DialogV2', 'ChatMessage', 'TextEditor',
                'Actor', 'Item', 'Document', 'fromUuid', 'fromUuidSync', 'fetch', 'XMLHttpRequest', 'WebSocket',
                'EventSource', 'navigator', 'ui', 'foundry', 'renderTemplate', 'document', 'window', '$',
            ]) set(key, {get:() => trap(key), set:() => trap(key)});
        },
        restore() {
            for (const {key, prior} of changed.reverse()) {
                if (prior) Object.defineProperty(globalThis, key, prior);
                else Reflect.deleteProperty(globalThis, key);
            }
            for (const {key, prior} of changed) assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, key), prior, key);
        },
    };
}

function freeze(value) {
    if (value && typeof value === 'object') {
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
}

function assertFrozen(value) {
    if (value && typeof value === 'object') {
        assert.ok(Object.isFrozen(value));
        for (const child of Object.values(value)) assertFrozen(child);
    }
}

const standard = 'standard';
const alternative = 'synthetic-alt';
const choice = (id, eligibility = 'eligible', label = 'Synthetic choice', citation = 'Synthetic citation') =>
    ({id, label, sourceStatus:'synthetic', citation, eligibility});
const definition = (id, storageScope = 'world', label = 'Synthetic mechanic') =>
    ({id, label, storageScope, choices:[choice(standard), choice(alternative), choice('synthetic-excluded', 'excluded')]});
const observation = (id, state, value, storageScope = 'world', evidenceRef = 'Synthetic evidence') => ({
    id, storageScope, state, evidenceRef,
    ...(state === 'present' ? {value} : {}),
    ...(state === 'unknown' || state === 'present-unavailable' ? {reason:'unreadable'} : {}),
});
const request = (definitions = [], observations = []) => ({schemaVersion:1, definitions, observations});
const preset = assignments => ({id:'synthetic-preset', label:'Synthetic preset', assignments});
const assignment = (mechanicId, value = standard) => ({mechanicId, value});
const row = (view, id) => {
    const match = view.current.find(item => item.id === json(id));
    assert.ok(match, 'Missing result for ' + json(id));
    return match;
};
const issue = (view, code, path) => assert.ok(view.issues.some(item =>
    item.code === code && (path === undefined || item.path === json(path))), 'Missing issue ' + code);

function context(Review, bridgeCalls, app, renderer) {
    const fixtures = [];
    const raw = value => {
        const fixture = freeze(value);
        const original = JSON.stringify(fixture);
        fixtures.push({fixture, original, snapshot:structuredClone(fixture)});
        return original;
    };
    const open = (value, ...args) => {
        const count = bridgeCalls.length;
        const instance = new Review(value, ...args);
        assert.equal(bridgeCalls.length, count + 1);
        const call = bridgeCalls[count];
        assert.equal(call.args.length, 1);
        assert.equal(call.args[0], value);
        const view = instance.getData();
        assert.deepEqual(JSON.parse(view.report), JSON.parse(call.original));
        assert.equal(view.input, json(call.report.input));
        return {instance, view, call};
    };
    return {Review, bridgeCalls, app, renderer, raw, open, fixtures};
}

const cases = [
    ['Current-mode selection', ({app, raw, open}) => {
        const input = raw(request());
        for (const modes of [[], ['current'], [undefined]]) {
            const before = app.calls.construct.length;
            const {view, call} = open(input, ...modes);
            assert.equal(call.name, 'inspect');
            assert.equal(view.mode, 'current');
            assert.equal(app.calls.construct.length, before + 1);
            assert.deepEqual(app.calls.construct.at(-1).args, []);
        }
        assert.equal(app.calls.render.length, 0);
    }],

    ['Preview-mode selection', ({app, raw, open}) => {
        const input = raw({...request(), presetRequests:[]});
        const {instance, view, call} = open(input, 'preset-preview');
        assert.equal(call.name, 'preview');
        assert.equal(view.mode, 'preset-preview');
        assert.equal(view.report, json(call.report));
        assert.equal(instance.getData().report, view.report);
        assert.equal(app.calls.render.length, 0);
    }],

    ['Invalid modes', ({Review, bridgeCalls, app}) => {
        let touches = 0;
        const hostile = new Proxy({}, {
            get() { touches++; throw new Error('Mode property read'); },
            getPrototypeOf() { touches++; throw new Error('Mode prototype read'); },
            ownKeys() { touches++; throw new Error('Mode enumeration'); },
        });
        const revoked = Proxy.revocable({}, {});
        revoked.revoke();
        const before = [bridgeCalls.length, app.calls.construct.length, app.calls.render.length];
        for (const mode of [null, '', 'Current', false, 0, 1n, Symbol('current'),
            new String('current'), hostile, revoked.proxy]) {
            assert.throws(() => new Review('{}', mode), {name:'TypeError', message:'Invalid mechanic review mode.'});
        }
        assert.equal(touches, 0);
        assert.deepEqual([bridgeCalls.length, app.calls.construct.length, app.calls.render.length], before);
    }],

    ['Invalid requests', ({raw, open}) => {
        const objectInput = freeze({type:'synthetic nonstring input'});
        const entries = [
            [objectInput, 'input-type'],
            ['{invalid', 'json-syntax'],
            [raw([]), 'request-shape'],
            [raw({...request([definition('held')], [observation('held', 'absent')]), presetRequests:[]}), 'request-shape'],
        ];
        for (const [input, code] of entries) {
            const {view, call} = open(input, 'current');
            assert.equal(call.name, 'inspect');
            assert.equal(view.availability, 'unavailable');
            assert.deepEqual(view.current, []);
            issue(view, code, []);
            assert.equal(view.rawJson, typeof input === 'string' ? input : 'Unavailable');
        }
        const {view, call} = open(objectInput, 'preset-preview');
        assert.equal(call.name, 'preview');
        assert.equal(view.preset.availability, 'unavailable');
        issue(view, 'input-type', []);
        assert.deepEqual(objectInput, {type:'synthetic nonstring input'});
    }],

    ['Available current results', ({raw, open}) => {
        const definitions = [definition('saved', 'client'), definition('absent'), definition('explicit')];
        const observations = [
            observation('explicit', 'present', standard),
            observation('saved', 'present', alternative, 'client'),
            observation('absent', 'absent'),
        ];
        const {view} = open(raw(request(definitions, observations)));
        assert.deepEqual(view.current.map(item => item.id), ['absent', 'explicit', 'saved'].map(json));
        for (const [id, di, oi, ci, origin, presence] of [
            ['absent', 1, 2, 0, 'standard-fallback', 'absent'],
            ['explicit', 2, 0, 0, 'stored', 'present'],
            ['saved', 0, 1, 1, 'stored', 'present'],
        ]) {
            const result = row(view, id);
            const selected = definitions[di].choices[ci];
            assert.equal(result.storageScope, json(definitions[di].storageScope));
            assert.equal(result.presence, presence);
            assert.equal(result.availability, 'available');
            assert.equal(result.stored, presence === 'absent' ? 'Not supplied' : json(selected.id));
            assert.equal(result.basicStatus, presence === 'absent' ? 'default' : 'explicit');
            assert.equal(result.membership, 'member');
            assert.equal(result.effective, json(selected.id));
            assert.equal(result.origin, origin);
            assert.deepEqual(result.definitions, [{index:di, label:json(definitions[di].label), detail:json(definitions[di])}]);
            assert.deepEqual(result.observations, [{index:oi, detail:json(observations[oi])}]);
            assert.deepEqual(result.choice, {index:ci, definitionIndex:di, sourceStatus:json('synthetic'),
                citation:json(selected.citation), eligibility:json('eligible'), detail:json(selected)});
        }
        assert.equal(view.sourceApproval, 'not-assessed');
    }],

    ['Unavailable observations', ({raw, open}) => {
        const observations = [observation('unknown', 'unknown', undefined, 'world', null),
            observation('unavailable', 'present-unavailable')];
        const ids = ['missing', 'unknown', 'unavailable'];
        const {view} = open(raw(request(ids.map(id => definition(id)), observations)));
        for (const [index, id] of ids.entries()) {
            const result = row(view, id);
            assert.equal(result.presence, id === 'unavailable' ? 'present' : 'unknown');
            assert.equal(result.availability, 'unavailable');
            assert.equal(result.stored, 'Not supplied');
            assert.equal(result.origin, 'none');
            assert.equal(result.effectiveAvailability, 'unavailable');
            assert.equal(result.choice, null);
            assert.deepEqual(result.observations, index === 0 ? [] : [{index:index - 1, detail:json(observations[index - 1])}]);
        }
        issue(view, 'observation-missing', ['observations']);
        issue(view, 'observation-unavailable', ['observations', 0]);
        issue(view, 'observation-unavailable', ['observations', 1]);
    }],

    ['Explicit saved values', ({raw, open}) => {
        const values = [null, false, 0, '', [], {['__proto__']:{constructor:[false, 0, null, []]}, inner:{empty:''}}];
        const ids = values.map((_, i) => 'value-' + i);
        const {view, call} = open(raw(request(ids.map(id => definition(id)), ids.map((id, i) => observation(id, 'present', values[i])))));
        for (const [i, id] of ids.entries()) {
            const result = row(view, id);
            assert.equal(result.presence, 'present');
            assert.equal(result.availability, 'available');
            assert.equal(result.stored, json(values[i]));
            assert.equal(result.basicStatus, 'unresolved');
            assert.equal(result.basicValue, json(values[i]));
            assert.equal(result.membership, 'not-applicable');
            assert.equal(result.origin, 'none');
            assert.ok(result.issueCodes.includes('value-invalid'));
            assert.ok(own(call.report.current[i].before, 'value'));
        }
        assert.ok(own(JSON.parse(row(view, ids.at(-1)).stored), '__proto__'));
    }],

    ['Identity and declarations', ({raw, open}) => {
        const definitions = [
            definition(' padded  '), definition('__proto__'), definition('constructor'),
            definition('ambiguous'), definition('ambiguous'),
            {...definition('invalid'), storageScope:'unexpected'},
            {...definition('   '), label:'Synthetic malformed ID'},
        ];
        const observations = [
            observation(' padded  ', 'present', standard), observation('__proto__', 'absent'),
            observation('constructor', 'present', alternative), observation('ambiguous', 'absent'),
            observation('ambiguous', 'present', standard), observation('invalid', 'absent'),
            observation('', 'absent'),
        ];
        const {view} = open(raw(request(definitions, observations)));
        assert.deepEqual(view.current.map(item => item.id), [' padded  ', '__proto__', 'ambiguous', 'constructor', 'invalid'].map(json));
        assert.equal(row(view, 'constructor').effective, json(alternative));
        assert.equal(row(view, '__proto__').origin, 'standard-fallback');
        const ambiguous = row(view, 'ambiguous');
        assert.equal(ambiguous.definitionStatus, 'ambiguous');
        assert.deepEqual(ambiguous.definitions.map(entry => entry.index), [3, 4]);
        assert.deepEqual(ambiguous.observations.map(entry => entry.index), [3, 4]);
        assert.equal(ambiguous.choice, null);
        assert.equal(ambiguous.origin, 'none');
        const invalid = row(view, 'invalid');
        assert.equal(invalid.definitionStatus, 'invalid');
        assert.equal(invalid.choice, null);
        assert.equal(view.suppliedDefinitions[6].detail, json(definitions[6]));
        assert.equal(view.suppliedObservations[6].detail, json(observations[6]));
        issue(view, 'definition-duplicate-id', ['definitions', 3, 'id']);
        issue(view, 'observation-duplicate-id', ['observations', 4, 'id']);
        issue(view, 'definition-shape', ['definitions', 6]);
        issue(view, 'observation-shape', ['observations', 6]);
    }],

    ['Valid preset dispositions', ({raw, open}) => {
        const scenarios = [
            ['absent', 'absent', undefined, standard, 'proposed', true, false],
            ['explicit', 'present', standard, standard, 'same', false, false],
            ['alternative', 'present', alternative, standard, 'conflict', true, true],
            ['null', 'present', null, standard, 'conflict', true, null],
            ['false', 'present', false, standard, 'conflict', true, null],
            ['zero', 'present', 0, standard, 'conflict', true, null],
            ['custom', 'present', {synthetic:[false, null]}, standard, 'conflict', true, null],
            ['unknown', 'unknown', undefined, standard, 'blocked', null, null],
            ['unavailable', 'present-unavailable', undefined, standard, 'blocked', null, null],
            ['alternative-from-absence', 'absent', undefined, alternative, 'proposed', true, true],
        ];
        const definitions = scenarios.map(([id]) => definition(id));
        const observations = scenarios.map(([id, state, value]) => observation(id, state, value));
        const current = open(raw(request(definitions, observations)));
        const preview = open(raw({...request(definitions, observations),
            presetRequests:[preset(scenarios.map(([id,,, value]) => assignment(id, value)).reverse())]}), 'preset-preview');
        const {view, call} = preview;
        assert.equal(view.preset.availability, 'available');
        assert.deepEqual(call.report.current, current.call.report.current);
        assert.deepEqual(view.current, current.view.current);
        assert.deepEqual(view.preset.proposals.map(p => JSON.parse(p.id)), scenarios.map(([id]) => id).sort());
        for (const [id, state, value, proposed, disposition, stored, effective] of scenarios) {
            const proposal = view.preset.proposals.find(item => item.id === json(id));
            const before = JSON.parse(row(view, id).detail).before;
            assert.equal(proposal.before, json(before));
            assert.equal(own(before, 'value'), state === 'present');
            if (state === 'present') assert.deepEqual(before.value, value);
            assert.equal(proposal.proposed, json({presence:'present', availability:'available', value:proposed}));
            assert.equal(proposal.disposition, disposition);
            assert.equal(proposal.storedWouldDiffer, json(stored));
            assert.equal(proposal.preferenceWouldDiffer, json(effective));
            assert.deepEqual(proposal.issueCodes, disposition === 'blocked' ? ['preset-before-unavailable']
                : disposition === 'conflict' ? ['preset-explicit-conflict'] : []);
            assert.equal(proposal.detail, json(call.report.preset.proposals.find(item => item.mechanicId === id)));
        }
    }],

    ['Invalid presets', ({raw, open}) => {
        const common = request([definition('reviewed')], [observation('reviewed', 'absent')]);
        const current = open(raw(common)).view.current;
        const valid = preset([assignment('reviewed')]);
        const inputs = [
            [common, 'presets-shape', ['presetRequests']],
            [{...common, presetRequests:[{id:'malformed'}]}, 'presets-shape', ['presetRequests', 0]],
            [{...common, presetRequests:[valid, valid]}, 'multiple-presets-unsupported', ['presetRequests']],
            [{...common, presetRequests:[preset([assignment('reviewed'), assignment('reviewed')])]},
                'preset-assignment-duplicate', ['presetRequests', 0, 'assignments', 0, 'mechanicId']],
            [{...common, presetRequests:[preset([assignment('reviewed', 'synthetic-excluded')])]},
                'preset-choice-ineligible', ['presetRequests', 0, 'assignments', 0, 'value']],
        ];
        for (const [input, code, path] of inputs) {
            const {view} = open(raw(input), 'preset-preview');
            assert.deepEqual(view.current, current);
            assert.equal(view.preset.availability, 'unavailable');
            assert.deepEqual(view.preset.proposals, []);
            issue(view, code, path);
        }
        const oversized = {...valid, label:'x'.repeat(257)};
        const {view} = open(raw({...common, presetRequests:[oversized]}), 'preset-preview');
        assert.equal(view.availability, 'unavailable');
        assert.deepEqual(view.current, []);
        assert.deepEqual(view.preset.proposals, []);
        issue(view, 'input-limit', ['presetRequests', 0, 'label']);
    }],

    ['Projection domain', ({raw, open}) => {
        const unavailable = open(raw(request([definition('missing')]))).view;
        const empty = open(raw(request())).view;
        const limited = open(raw(request([definition('__proto__'), definition('constructor')], [
            observation('__proto__', 'absent'), observation('constructor', 'present', alternative),
        ])));
        assert.deepEqual(unavailable.projection, {availability:'unavailable', choices:'null'});
        assert.deepEqual(empty.projection, {availability:'available', choices:'{}'});
        assert.equal(limited.view.projection.availability, 'available');
        const choices = JSON.parse(limited.view.projection.choices);
        assert.deepEqual(Object.keys(choices), ['__proto__', 'constructor']);
        assert.equal(choices.__proto__, standard);
        assert.equal(choices.constructor, alternative);
        assert.equal(own(choices, 'toString'), false);
        assert.equal(Object.getPrototypeOf(limited.call.report.choiceProjection.choices), null);
    }],

    ['Actual escaped rendering', ({raw, open, renderer}) => {
        const hostile = tag => '<' + tag + ' onerror="run()"> & {{lookup this "secret"}}';
        const id = hostile('script'), customId = hostile('form'), label = hostile('img'), citation = hostile('a');
        const evidence = hostile('iframe'), custom = {unsafe:hostile('svg')};
        const active = definition(id, 'world', label);
        active.choices[0].citation = citation;
        const input = raw({
            ...request([active, definition(customId)], [observation(id, 'present', standard, 'world', evidence),
                observation(customId, 'present', custom)]),
            presetRequests:[preset([assignment(id)])],
        });
        const {instance} = open(input, 'preset-preview');
        const html = renderer.render(instance.getData());
        const escaped = text => text.replace(/[&<>"'=\x60]/g, char =>
            ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#x27;', '=':'&#x3D;', '\x60':'&#x60;'})[char]);
        for (const tag of ['script', 'form', 'img', 'a', 'iframe', 'svg']) {
            assert.ok(html.includes(escaped('<' + tag)));
            assert.ok(!html.includes('<' + tag + ' '));
        }
        assert.ok(html.includes('<pre>' + escaped(input) + '</pre>'));
        assert.ok(html.includes('{{lookup this'));
        assert.match(html, /Declared citation \(unassessed\)/);
        assert.match(html, /changes no settings or selected Items/);
        assert.match(html, /Proposals confer no consent/);
        assert.doesNotMatch(html, /<(?:input|textarea|select|form|script|iframe)\b|<[^>]*\b(?:onerror|onclick|href)\s*=/i);
        assert.deepEqual(html.match(/<button[^>]*>[^<]*<\/button>/g), [
            '<button type="button" data-action="close">Close</button>',
            '<button type="button" data-action="cancel">Cancel</button>',
        ]);
    }],

    ['Retention and isolation', ({raw, open, app, bridgeCalls}) => {
        const {instance, view, call} = open(raw(request([definition('retained')], [observation('retained', 'absent')])));
        const expected = structuredClone(view);
        const count = bridgeCalls.length;
        view.current[0].origin = 'mutated-view';
        view.current[0].definitions[0].detail = 'mutated-detail';
        view.current[0].issueCodes.push('mutated-issue');
        view.suppliedDefinitions.length = 0;
        view.report = '{}';
        const ambient = {settings:{synthetic:'different'}};
        const ambientReads = [];
        const prior = Object.getOwnPropertyDescriptor(globalThis, 'game');
        Object.defineProperty(globalThis, 'game', {
            ...prior,
            get() {
                ambientReads.push(ambient.settings.synthetic);
                return prior.get();
            },
        });
        try {
            assert.equal(instance.render(true), app.renderResult);
            ambient.settings.synthetic = 'changed again';
            assert.equal(instance.render(false), app.renderResult);
            assert.deepEqual(instance.getData(), expected);
            assert.deepEqual(ambientReads, []);
            assert.equal(bridgeCalls.length, count);
            assert.equal(JSON.stringify(call.report), call.original);
        } finally {
            Object.defineProperty(globalThis, 'game', prior);
            assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, 'game'), prior);
        }
    }],

    ['Lifecycle and event binding', async ({Review, raw, open, app}) => {
        const defaults = Review.defaultOptions;
        assert.equal(defaults.title, 'Mechanic Preferences Review');
        assert.equal(defaults.template, 'systems/ptu/' + templatePath);
        assert.deepEqual(defaults.classes, ['ptu', 'mechanic-preferences-review']);
        assert.equal(defaults.resizable, true);
        assert.ok(defaults.width > 0 && defaults.height > 0);
        assert.equal(defaults.syntheticBase, app.baseOptions.syntheticBase);
        for (const route of ['close', 'cancel', 'Escape', 'header']) {
            const {instance} = open(raw(request()));
            const boundary = listenerBoundary();
            const options = {synthetic:'options'};
            assert.equal(instance.render(true, options), app.renderResult);
            assert.equal(app.calls.render.at(-1).app, instance);
            assert.equal(app.calls.render.at(-1).args[1], options);
            assert.deepEqual(app.calls.render.at(-1).args, [true, options]);
            const baseListeners = app.calls.listeners.length;
            instance.activateListeners(boundary.html);
            instance.activateListeners(boundary.html);
            assert.deepEqual(boundary.counts(), [1, 1, 1]);
            assert.equal(app.calls.listeners.length, baseListeners + 2);
            assert.equal(app.calls.listeners.at(-1).html, boundary.html);
            const nextBoundary = listenerBoundary();
            instance.activateListeners(nextBoundary.html);
            assert.deepEqual(boundary.counts(), [0, 0, 0]);
            assert.deepEqual(nextBoundary.counts(), [1, 1, 1]);
            const closeCount = app.calls.close.length;
            const other = nextBoundary.key('Enter');
            assert.deepEqual(other.returns, [undefined]);
            assert.equal(other.event.prevented, 0);
            assert.equal(other.event.stopped, 0);
            assert.equal(app.calls.close.length, closeCount);
            let closing;
            if (route === 'header') closing = instance.headerClose(options);
            else {
                const result = route === 'Escape' ? nextBoundary.key(route) : nextBoundary.click(route);
                assert.equal(result.event.prevented, 1);
                assert.equal(result.event.stopped, route === 'Escape' ? 1 : 0);
                assert.equal(result.returns.length, 1);
                [closing] = result.returns;
            }
            assert.equal(instance.close(), closing);
            assert.equal(await closing, undefined);
            assert.deepEqual(nextBoundary.counts(), [0, 0, 0]);
            assert.equal(app.calls.close.length, closeCount + 1);
            assert.equal(app.calls.close.at(-1).app, instance);
            assert.deepEqual(app.calls.close.at(-1).args, route === 'header' ? [options] : []);
        }
    }],

    ['Concurrent/reentrant dismissal', async ({raw, open, app}) => {
        const {instance} = open(raw(request()));
        const boundary = listenerBoundary();
        instance.activateListeners(boundary.html);
        const closes = app.calls.close.length, renders = app.calls.render.length;
        const original = app.behavior.close;
        let reentrant, release;
        const delayed = new Promise(resolve => { release = resolve; });
        app.behavior.close = () => {
            [reentrant] = boundary.click('cancel').returns;
            return delayed;
        };
        try {
            const closing = instance.close();
            assert.equal(instance.render(true), instance);
            assert.equal(instance.close(), closing);
            await Promise.resolve();
            assert.equal(reentrant, closing);
            assert.equal(app.calls.close.length, closes + 1);
            release({approved:true, changes:['ignored']});
            assert.equal(await closing, undefined);
            assert.equal(instance.close(), closing);
            assert.equal(instance.render(false), instance);
            assert.equal(app.calls.render.length, renders);
        } finally {
            release();
            app.behavior.close = original;
        }
    }],

    ['Failed dismissal', async ({raw, open, app}) => {
        const original = app.behavior.close;
        try {
            for (const asynchronous of [false, true]) {
                const {instance} = open(raw(request()));
                const failure = new Error(asynchronous ? 'synthetic rejected close' : 'synthetic throwing close');
                app.behavior.close = () => {
                    if (asynchronous) return Promise.reject(failure);
                    throw failure;
                };
                const closes = app.calls.close.length, renders = app.calls.render.length;
                const closing = instance.close();
                assert.equal(instance.close(), closing);
                await assert.rejects(closing, error => error === failure);
                assert.equal(instance.close(), closing);
                await assert.rejects(instance.close(), error => error === failure);
                assert.equal(instance.render(true), instance);
                assert.equal(app.calls.close.length, closes + 1);
                assert.equal(app.calls.render.length, renders);
            }
        } finally {
            app.behavior.close = original;
        }
    }],
];

test('mechanic preference review over the actual serialized API and template', async t => {
    assert.equal(typeof nodeModule.registerHooks, 'function', 'Synchronous module.registerHooks is required');
    const sources = await readSources(t);
    const boundaries = forbidGlobals();
    const app = applicationBoundary();
    let graph, renderer;
    try {
        boundaries.install(app.Application);
        renderer = await loadRenderer();
        graph = registerGraph(sources);
        const {MechanicPreferencesReview} = await import(graph.app);
        const {calls} = await import(graph.bridge);
        assert.equal(Object.getPrototypeOf(MechanicPreferencesReview.prototype), app.Application.prototype);
        const state = context(MechanicPreferencesReview, calls, app, renderer);
        for (const [name, run] of cases) await t.test(name, () => run(state));
        for (const {fixture, original, snapshot} of state.fixtures) {
            assertFrozen(fixture);
            assert.deepEqual(fixture, snapshot);
            assert.equal(JSON.stringify(fixture), original);
        }
        for (const {report, snapshot, original} of calls) {
            assertFrozen(report);
            assert.deepEqual(structuredClone(report), snapshot);
            assert.equal(JSON.stringify(report), original);
            if (report.choiceProjection.choices !== null) {
                assert.equal(Object.getPrototypeOf(report.choiceProjection.choices), null);
            }
        }
        assert.deepEqual(boundaries.forbidden, []);
        assert.deepEqual(renderer.required, []);
    } finally {
        try {
            graph?.hooks.deregister();
        } finally {
            try {
                boundaries.restore();
            } finally {
                sources.clear();
                renderer = null;
            }
        }
    }
});
