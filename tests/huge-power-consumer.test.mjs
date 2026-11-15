import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {SourceTextModule} from 'node:vm';

// Quarantined cloud candidate. Revision 02 corrections are authored, not yet executed.
// Whole module bodies are retained. Only the exact declared import rows below
// are rebound. Core Document/DataModel and modeled lifecycle boundaries are
// explicitly synthetic and do not establish native Foundry completeness.
const PINS = {
  "src/util/huge-power-bindings.js": {
    "bytes": 405,
    "sha256": "6676cf1728813edc295516ec23dce9981d09577f8a2645b498cba3aad6ded3a0"
  },
  "src/util/huge-power.js": {
    "bytes": 33681,
    "sha256": "3e2a95453e98c17a189de588572b58b460cf75cef581adf704f895f5074104b2"
  },
  "src/util/document-source.js": {
    "bytes": 1386,
    "sha256": "86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0"
  },
  "src/module/system/predication.js": {
    "bytes": 6126,
    "sha256": "2256eb9a084ba37a562536622076c263a9aba970304f71c7fe999f80cea3caf6"
  },
  "src/module/system/schema-data-fields.js": {
    "bytes": 1927,
    "sha256": "7fac2bb045810b6daf2a1b9cece717f4224d065143f3d5c6d873e35d0597ed7e"
  },
  "src/module/rules/rule-element/base.js": {
    "bytes": 14872,
    "sha256": "c5c597a5961121d463c5bee2dcce766258e57178cfba97326ce37ef1fe95a9ce"
  },
  "src/module/rules/rule-element/ae-like.js": {
    "bytes": 8796,
    "sha256": "fbc067a0fff876cafc34c45d9bd57f07df9356ec511facef741716416ff80aca"
  },
  "src/module/rules/index.js": {
    "bytes": 3747,
    "sha256": "6ef928ad96f602ed2061bbacfc38fabff5b45a4968f2bed1fb3deacac64d4845"
  },
  "src/module/item/base.js": {
    "bytes": 24097,
    "sha256": "f5f173135617030a3c6e0f04c999b0674630cf3c66e844e642ce5eed1beec252"
  },
  "src/module/actor/base.js": {
    "bytes": 77020,
    "sha256": "9e43e0fe263696708733a91f721bcdf42e2287d948efee2777c44a820c2f1744"
  },
  "src/module/actor/helpers.js": {
    "bytes": 6096,
    "sha256": "5e93dfbdb398a69b2f6268a053aa043996f64dfc2ce404aa44738660f0c71968"
  },
  "src/module/actor/pokemon/document.js": {
    "bytes": 34678,
    "sha256": "ec4a3cebc1eec9c8b0335ed6f1b1ea4b9887ca44ba3d72e9f3fabdfe86262a2e"
  },
  "src/module/item/index.js": {
    "bytes": 720,
    "sha256": "dc0b4b94c877dbef766b4664f60f7678896f4d488ea5303ae45e4fb1ce0bfc2f"
  },
  "src/module/system/index.js": {
    "bytes": 154,
    "sha256": "7214cb62d77078a071a9993531b4f87bd8f4393f398a5bae4c31e8742801f6eb"
  },
  "src/module/actor/modifiers.js": {
    "bytes": 16767,
    "sha256": "5b70e4ea610677c84a35e387f867ac0ac50f857a67d3f595188de3524d9a124a"
  },
  "src/module/actor/pokemon/level.js": {
    "bytes": 897,
    "sha256": "ff3208c161e07035abdfb721b677f80b9d08e325779a8419272a873cca3df926"
  }
};
const IMPORTS = {
  "src/util/huge-power-bindings.js": [],
  "src/util/huge-power.js": [
    "import {HUGE_POWER_ADMISSIONS, HUGE_POWER_CONTRIBUTORS, HUGE_POWER_PREPARATIONS} from './huge-power-bindings.js';",
    "import {getDocumentSourceId} from './document-source.js';"
  ],
  "src/util/document-source.js": [],
  "src/module/system/predication.js": [],
  "src/module/system/schema-data-fields.js": [
    "import { PTUPredicate, StatementValidator } from \"./predication.js\";"
  ],
  "src/module/rules/rule-element/base.js": [
    "import {HUGE_POWER_ENABLED, noteHugePowerValidity, invalidateHugePowerRule, observeHugePowerPredicate, testRulePredicate} from '../../../util/huge-power.js';",
    "import { PTUActor } from \"../../actor/base.js\";",
    "import { PTUItem } from \"../../item/base.js\";",
    "import { PTUPredicate } from \"../../system/index.js\";",
    "import { PredicateField } from \"../../system/schema-data-fields.js\";"
  ],
  "src/module/rules/rule-element/ae-like.js": [
    "import {beginHugePowerAE, noteHugePowerAE, endHugePowerAE} from '../../../util/huge-power.js';",
    "import { PTUModifier } from \"../../actor/modifiers.js\";",
    "import { ResolvableValueField } from \"../../system/schema-data-fields.js\";",
    "import { RuleElementPTU } from \"./base.js\";"
  ],
  "src/module/rules/index.js": [
    "import {captureHugePowerRule, finishHugePowerRule} from '../../util/huge-power.js';",
    "import { RuleElementPTU } from \"./rule-element/base.js\";",
    "import { AELikeRuleElement } from \"./rule-element/ae-like.js\";",
    "import { GrantItemRuleElement } from \"./rule-element/grant-item/rule-element.js\";",
    "import { RollOptionRuleElement } from \"./rule-element/roll-option.js\";",
    "import { ChoiceSetRuleElement } from \"./rule-element/choice-set/rule-element.js\";",
    "import { FlatModifierRuleElement } from \"./rule-element/flat-modifier.js\";",
    "import { TokenImageRuleElement } from \"./rule-element/token-image.js\";",
    "import { TemporarySpeciesRuleElement } from \"./rule-element/temp-species.js\";",
    "import { TokenNameRuleElement } from \"./rule-element/token-name.js\";",
    "import { TokenLightRuleElement } from \"./rule-element/token-light.js\";",
    "import { TypeOverwriteRuleElement } from \"./rule-element/type-overwrite.js\";",
    "import { TempHPRuleElement } from \"./rule-element/temp-hp.js\";",
    "import { EffectivenessRuleElement } from \"./rule-element/effectiveness.js\";",
    "import { EphemeralEffectRuleElement } from \"./rule-element/ephemeral-effect.js\";",
    "import { ActionPointsRuleElement } from \"./rule-element/ap.js\";",
    "import { ApplyEffectRuleElement } from \"./rule-element/apply-effect.js\";"
  ],
  "src/module/item/base.js": [
    "import { RuleElements } from \"../rules/index.js\";",
    "import { processGrantDeletions } from \"../rules/rule-element/grant-item/helper.js\";",
    "import { sluggify } from \"../../util/misc.js\"",
    "import { GrantItemRuleElement } from \"../rules/rule-element/grant-item/rule-element.js\";",
    "import { getDocumentSourceId, createCompendiumRefreshUpdate } from \"../../util/document-source.js\";",
    "import {isExcludedAcquisitionDocument} from '../../util/content-scope.js';",
    "import {isStarterTrainingGrant} from '../../util/starter-training.js';",
    "import {resolvePreservationSource} from '../../util/preservation.js';",
    "import {prerequisiteView} from '../../util/acquisition.js';",
    "import {hasSavedItemGraph,copySavedItemDocuments} from '../../util/saved-item-graph.js';"
  ],
  "src/module/actor/base.js": [
    "import {beginHugePowerPreparation, markHugePowerStage, openHugePowerApplyPhase, completeHugePowerPreparation, abortHugePowerPreparation, testRulePredicate} from '../../util/huge-power.js';",
    "import { sluggify } from \"../../util/misc.js\";",
    "import { Weather } from \"../apps/weather.js\";",
    "import { PTUCombatant } from \"../combat/combatant.js\";",
    "import { PTUCondition } from \"../item/index.js\";",
    "import { ChatMessagePTU } from \"../message/base.js\";",
    "import { extractEphemeralEffects, processPreUpdateActorHooks } from \"../rules/helpers.js\";",
    "import { PTUAttackCheck } from \"../system/check/attack.js\";",
    "import { PTUDiceCheck, eventToRollParams } from \"../system/check/check.js\";",
    "import { PTUDamageCheck } from \"../system/check/damage.js\";",
    "import { InitiativeRoll } from \"../system/check/rolls/initiative-roll.js\";",
    "import { PTUSkillCheck } from \"../system/check/skill.js\";",
    "import { PTUDamage } from \"../system/damage/damage.js\";",
    "import { PTUMoveDamage } from \"../system/damage/move.js\";",
    "import { ActorConditions } from \"./conditions.js\";",
    "import { IWRData, ImmunityData, ResistanceData, WeaknessData } from \"./iwr.js\";",
    "import { getDocumentSourceId } from \"../../util/document-source.js\";",
    "import {actorPrerequisiteViews} from '../../util/acquisition.js';",
    "import { shouldOfferStarterTraining, selectStarterTraining } from \"../../util/starter-training.js\";",
    "import { getSkillLabel } from \"../../util/skills.js\";",
    "import { PTUModifier, StatisticModifier } from \"./modifiers.js\";"
  ],
  "src/module/actor/helpers.js": [
    "import {HUGE_POWER_ENABLED, selectHugePowerBase} from '../../util/huge-power.js';"
  ],
  "src/module/actor/pokemon/document.js": [
    "import {HUGE_POWER_ENABLED, rememberHugePowerStats, beginHugePowerPokemonDerived, finishHugePowerPokemonDerived} from '../../../util/huge-power.js';",
    "import { PTUActor, PTUSkills } from \"../index.js\";",
    "import { calculateStatTotal } from \"../helpers.js\";",
    "import { calculateLevel } from \"./level.js\";",
    "import { LevelUpForm } from \"../../apps/level-up-form/sheet.js\";",
    "import { sluggify } from \"../../../util/misc.js\";",
    "import { PokemonGenerator } from \"./generator.js\";",
    "import { PTUModifier } from \"../modifiers.js\";"
  ],
  "src/module/item/index.js": [],
  "src/module/system/index.js": [],
  "src/module/actor/modifiers.js": [
    "import { sluggify } from \"../../util/misc.js\";",
    "import { extractModifierAdjustments } from \"../rules/helpers.js\";",
    "import { PTUPredicate } from \"../system/predication.js\";",
    "import { getSkillLabel } from \"../../util/skills.js\";"
  ],
  "src/module/actor/pokemon/level.js": []
};
const fields = ['key','mode','path','phase','value','priority','predicate','ignored'];
const semantic = source => fields.map(key => [key, source[key] ?? (key === 'predicate' ? [] : key === 'ignored' ? false : null)]);
const clone = structuredClone;
let nonce = 0;
const missing = name => { throw Error('Unexpected synthetic boundary: ' + name); };
function freeze(value) {
    if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
    return value;
}
const pinnedSources = new Map();
function pinned(path) {
    if (!pinnedSources.has(path)) pinnedSources.set(path, (async () => {
        const buffer = await readFile(new URL('../' + path, import.meta.url));
        assert.equal(buffer.length, PINS[path].bytes, path);
        assert.equal(createHash('sha256').update(buffer).digest('hex'), PINS[path].sha256, path);
        return buffer.toString('utf8');
    })());
    return pinnedSources.get(path);
}
function unavailable(line, url) {
    const names = /^import\s*\{([^}]+)\}/.exec(line)?.[1].split(',').map(name => name.trim());
    assert.ok(names && names.every(name => /^[A-Za-z_$][\w$]*$/.test(name)), line);
    return url(names.map(name => `export class ${name} { constructor() { throw Error('Unexpected boundary: ${name}'); } }`).join('\n'));
}
async function harness(configuration = {}) {
    const generation = ++nonce;
    // Same-realm modules use short identifiers instead of recursively embedding
    // entire dependency sources in data URLs. No native ESM cache owns these
    // per-fixture module graphs after their explicit tables are released.
    const moduleSources=new Map(), moduleInstances=new Map(), sourceIdentifiers=new Map();
    let generatedBytes=0;
    const url=source=>{
        assert.equal(typeof source,'string');
        if(sourceIdentifiers.has(source))return sourceIdentifiers.get(source);
        assert.ok(moduleSources.size<128,'fixture module-count bound');
        generatedBytes+=Buffer.byteLength(source,'utf8');
        assert.ok(generatedBytes<=512*1024,'fixture generated-source bound');
        const identifier=`ptu-fixture:${generation}:${moduleSources.size}`;
        assert.ok(identifier.length<=48,'fixture identifier bound');
        moduleSources.set(identifier,source);sourceIdentifiers.set(source,identifier);
        return identifier;
    };
    const compile=identifier=>{
        assert.ok(moduleSources.has(identifier),'unknown fixture module: '+identifier);
        if(!moduleInstances.has(identifier))moduleInstances.set(identifier,new SourceTextModule(moduleSources.get(identifier),{
            identifier,
            importModuleDynamically(){throw Error('Unexpected dynamic fixture import');},
        }));
        return moduleInstances.get(identifier);
    };
    const load=async identifier=>{
        const entry=compile(identifier);
        if(entry.status==='unlinked')await entry.link(specifier=>compile(specifier));
        if(entry.status==='linked')await entry.evaluate({timeout:5000});
        assert.equal(entry.status,'evaluated','fixture module did not evaluate');
        return entry.namespace;
    };
    const releaseModules=()=>{moduleSources.clear();moduleInstances.clear();sourceIdentifiers.clear();};
    const counters = {dependencyRecordGetterCalls:0, derivedEvents:[], incompleteBoundaryStates:[], derivedGetterCalls:0, corePreparations:0, initiativeHooks:[], settingReads:[], finalCalls:0, expression:0, writes:0, logs:0, predicates:0, predicateCalls:[], predicateTests:0, formulaInputs:[], writeTrace:[], debounceConstructed:0, debounceInvoked:0};
    const raw = (value, extra={}) => ({key:'ActiveEffectLike',predicate:[],mode:'add',path:'system.modifiers.baseStats.atk.mod',phase:'applyAEs',value,priority:null,...extra});
    const specs = [{source:'Compendium.synthetic.abilities.Item.AAAAAAAAAAAAAAAA',version:configuration.version ?? 'synthetic-february',mode:configuration.mode ?? 'february',raw:raw(Object.hasOwn(configuration,'expression') ? configuration.expression : 7, configuration.rule ?? {}),enabled:configuration.enabled ?? true}];
    if (configuration.contributors) specs.push(
        {source:'Compendium.synthetic.items.Item.VVVVVVVVVVVVVVVV',version:'synthetic-vitamin',category:'vitamin',raw:raw(configuration.vitamin ?? 1),enabled:true},
        {source:'Compendium.synthetic.feats.Item.TTTTTTTTTTTTTTTT',version:'synthetic-trainer',category:'trainer',raw:raw(configuration.trainer ?? 3),enabled:!configuration.unrelatedDisabled});
    if (configuration.twoOperations) {
        specs[0].raw=raw('7');
        specs.push({source:'Compendium.synthetic.feats.Item.DDDDDDDDDDDDDDDD',version:'synthetic-dependent',category:'trainer',raw:raw('@actor.system.modifiers.baseStats.atk.mod'),enabled:true});
    }
    if (configuration.multiple) specs.push({...specs[0],source:'Compendium.synthetic.abilities.Item.BBBBBBBBBBBBBBBB'});
    if(configuration.noAbility)specs.length=0;
    for (const spec of specs) spec.raws = [spec.raw];
    if (configuration.sameItemDisabled) { specs[0].enabled = false; specs[0].raws.push(raw(3)); }
    const rows = specs.flatMap(spec => spec.raws.map((source,index) => freeze({
        ...(index === 0 ? spec : {source:spec.source,version:spec.version,category:'trainer'}),
        index, rules:spec.raws.map(semantic)
    })));
    const model = {};
    const bindingFixture = {
        admissions:Object.freeze(rows.filter(row => row.mode)),
        contributors:Object.freeze(rows.filter(row => row.category)),
        models:Object.freeze([model]),
        countPredicate(receiver,args){counters.predicates++;counters.predicateCalls.push({receiver,args});},
        observeDerived(event,inspection){counters.derivedEvents.push({event,valid:inspection?.valid??null,selected:inspection?.selected??null,reasons:[...(inspection?.reasons??[])]});},
    };
    const globals = new Map();
    const auxiliaryDescriptors=[];
    const replaceDescriptor=(object,key,value)=>{
        auxiliaryDescriptors.push([object,key,Object.getOwnPropertyDescriptor(object,key)]);
        Object.defineProperty(object,key,{value,writable:true,configurable:true});
    };
    const restoreAuxiliary=()=>{
        for(const [object,key,prior] of auxiliaryDescriptors.reverse()) {
            if(prior)Object.defineProperty(object,key,prior);else Reflect.deleteProperty(object,key);
            assert.deepEqual(Object.getOwnPropertyDescriptor(object,key),prior,key);
        }
    };
    const diagnostics = [];
    const diagnosticDescriptors = new Map(['warn','error'].map(name => [name,Object.getOwnPropertyDescriptor(console,name)]));
    for (const [name,descriptor] of diagnosticDescriptors) Object.defineProperty(console,name,{...descriptor,value:(...args)=>diagnostics.push({name,args})});
    const restoreDiagnostics = () => {
        for (const [name,descriptor] of diagnosticDescriptors) {
            Object.defineProperty(console,name,descriptor);
            assert.deepEqual(Object.getOwnPropertyDescriptor(console,name),descriptor);
        }
    };
    const setGlobal = (name,value) => {
        globals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));
        Object.defineProperty(globalThis,name,{value,writable:true,configurable:true});
    };
    const get = (object,path) => path.split('.').reduce((value,key)=>value?.[key],object);
    const set = (object,path,value) => {const keys=path.split('.');const last=keys.pop();let target=object;for(const key of keys)target=target[key]??={};if(path==='system.modifiers.baseStats.atk.mod')counters.writeTrace.push({before:target[last],value});target[last]=value;counters.writes++;return true;};
    const merge = (target,source) => {for(const [key,value] of Object.entries(source??{})){if(value&&typeof value==='object'&&!Array.isArray(value)){target[key]??={};merge(target[key],value);}else target[key]=clone(value);}return target;};
    class Field { constructor() {} }
    class DataModel {
        constructor(source) {
            if(configuration.constructorFailure) throw Error('Synthetic construction failure');
            Object.assign(this,source);
            this.invalid=Object.hasOwn(configuration,'invalidModel') ? configuration.invalidModel : false;
            this.ignored=source.ignored ?? false;
            this.phase=source.phase ?? 'applyAEs';
            this.priority=source.priority ?? 100;
            if(configuration.predicateThrowTripwire) this.predicate.test=function(){counters.predicateTests++;throw Error('Synthetic unsupported predicate tripwire');};
            if(configuration.ownRuleHook) this.afterPrepareData=function(){this.actor.system.modifiers.baseStats.atk.mod+=5;this.actor.system.modifiers.baseStats.atk.mod-=5;};
            if(configuration.incompleteSecondDerived)this.afterPrepareData=function(){this.actor._types.species=[];};
            if(configuration.lateOffset) callbacks.final=function(actor){actor.system.modifiers.baseStats.atk.mod+=5;actor.system.modifiers.baseStats.atk.mod-=5;};
        }
    }
    let reentered=false;
    const callbacks={final(actor){
        if(configuration.dependencyTiming==='final')configuration.dependencyActions.apply();
        if(configuration.dependencyTiming==='embedded-restore')configuration.dependencyActions.restore();
        if(configuration.lateContest==='dice')actor.system.contests.stats.cool.dice=99;
        if(configuration.lateContest==='mod')actor.system.contests.stats.cool.stats.mod=9;
        if(configuration.lateContest==='replace')actor.system.contests=clone(actor.system.contests);
        if(configuration.lateContest==='extra')actor.system.contests.custom='preserve me';
        if(configuration.lateContest==='readonly')Object.defineProperty(actor.system.contests.stats.cool.stats,'value',{writable:false});
        if(configuration.lateContest==='accessor')Object.defineProperty(actor.system.contests.stats.cool.stats,'value',{configurable:true,get(){counters.derivedGetterCalls++;throw Error('Unexpected derived getter');}});
        if(configuration.lateContest==='allocated')actor.system.stats.atk.levelUp+=1;
        if(configuration.lateStats){
            const stats=actor.system.stats;
            counters.lateStatsTargets={stats,attack:stats.atk,contests:actor.system.contests,cool:clone(actor.system.contests.stats.cool),ordinaryAttack:stats.atk.total};
            const getter=function(){counters.derivedGetterCalls++;throw Error('Unexpected late stats getter');};
            if(configuration.lateStats==='root-accessor')Object.defineProperty(actor.system,'stats',{configurable:true,get:getter});
            if(configuration.lateStats==='total-accessor')Object.defineProperty(stats.atk,'total',{configurable:true,get:getter});
            if(configuration.lateStats==='root-readonly')Object.defineProperty(actor.system,'stats',{writable:false});
            if(configuration.lateStats==='total-readonly')Object.defineProperty(stats.atk,'total',{writable:false});
        }
    },afterEmbedded(actor){
        if(configuration.dependencyTiming==='embedded-restore')configuration.dependencyActions.apply();
        if(configuration.reentrant && !reentered)hookListeners.push(actor=>{if(!reentered){reentered=true;actor.prepareData();}});
        if(configuration.throwDerived)hookListeners.push(()=>{throw Error('Synthetic interrupted derived interval');});
        if(configuration.invalidActorDuringConstruction) actor.type='pokemon';
        if(configuration.lateValidation) actor.items[0].rules[0].failValidation('Synthetic disabled validation after construction');
        if(configuration.eraseInvalidity) {
            const rule=actor.items[0].rules[0];rule.invalid=false;rule.ignored=false;
        }
    }};
    const debounceRecords=[];
    function debounce(callback, delay) {
        assert.equal(typeof callback,'function');assert.equal(callback.length,0);assert.equal(delay,50);
        counters.debounceConstructed++;
        const callable=function syntheticDebouncedUpdate(){
            counters.debounceInvoked++;
            throw Error('Unexpected synthetic debouncedUpdate invocation');
        };
        debounceRecords.push(Object.freeze({callback,delay,callable}));
        return callable; // Deliberately no timers or scheduling in this model.
    }
    let actorSeed;
    class CoreActor {
        constructor() {this.id='SYNTHETICACTOR01';this.type='pokemon';this.name='Synthetic';this.flags={ptu:{rollOptions:{all:{}}}};}
        get itemTypes(){return this._types;}
        prepareData() {
            counters.corePreparations++;
            this.system=clone(actorSeed);
            this.prepareBaseData();
            this.prepareEmbeddedDocuments();
            callbacks.afterEmbedded(this);
            this.prepareDerivedData();
        }
        prepareEmbeddedDocuments() {if(configuration.invalidActorDuringConstruction)this.type='unsupported';}
    }
    class CoreItem {
        constructor(source,{parent}) {
            this._source=clone(source);Object.assign(this,clone(source));this.actor=parent;
            this.uuid='Actor.'+parent.id+'.Item.'+source._id;this.id=source._id;
        }
        toObject(){return clone(this._source);}
        prepareSiblingData() {}
    }
    const foundry={abstract:{DataModel},data:{fields:{StringField:Field,NumberField:Field,BooleanField:Field,ArrayField:Field,DataField:Field}},utils:{debounce,deepClone:clone,duplicate:clone,mergeObject:merge,getProperty:get,setProperty:set,randomID:()=>String(++counters.logs)}};
    const game={i18n:{localize:value=>value},combat:null,ptu:{effectTracker:{register:()=>missing('effect registration')},tokenPanel:{refresh(){}}},user:{character:null}};
    setGlobal('foundry',foundry);setGlobal('game',game);setGlobal('Actor',CoreActor);setGlobal('Item',CoreItem);
    setGlobal('canvas',{ready:false});setGlobal('CONFIG',{PTU:{Item:{documentClass:null},data:{natureData:{synthetic:['Attack','Defense']}}}});
    setGlobal('Roll',{
        replaceFormulaData(value,data){counters.expression++;counters.formulaInputs.push(value);return value.replace(/@actor\.([\w.]+)/g,(_match,path)=>String(get(data.actor,path)));},
        safeEval(value){
            if(/^-?\d+$/.test(value))return Number(value);
            let match=/^5 \+ floor\((\d+) \/ 10\)$/.exec(value);if(match)return 5+Math.floor(Number(match[1])/10);
            match=/^(\d+) \+ 7$/.exec(value);if(match)return Number(match[1])+7;
            return missing('formula '+value);
        },
    });
    setGlobal('__ptuHugePowerCloudFixture',bindingFixture);
    const hookListeners=[];
    const hookRegistry={updateInitiative:hookListeners};
    const hooks={call(event,actor){
        assert.equal(event,'updateInitiative');
        counters.initiativeHooks.push({attack:actor.system.stats.atk.total});
        for(const callback of hookRegistry[event])callback(actor);
        return true;
    }};
    if(configuration.realPokemon) {
        replaceDescriptor(Math,'clamp',(value,min,max)=>Math.min(Math.max(value,min),max));
        auxiliaryDescriptors.push([Number.prototype,'signedString',Object.getOwnPropertyDescriptor(Number.prototype,'signedString')]);
        setGlobal('calculateLevel',undefined);
        setGlobal('Hooks',hooks);
        setGlobal('Collection',class SyntheticCollection extends Map {});
        game.settings={get(scope,key){
            assert.equal(scope,'ptu'); counters.settingReads.push(key);
            if(key==='variant.spiritPlaytest')return false;
            if(key==='automation.maxEvasion')return 20;
            return missing('setting '+key);
        }};
        game.actors={get(){return null;}};
        CONFIG.PTU.data.typeEffectiveness={};
        CONFIG.PTU.data.levelProgression=Object.fromEntries(Array.from({length:100},(_,i)=>[i+1,(i+1)*10]));
        CONFIG.PTU.Capabilities={stringArray:[],numericNonMovement:[]};
    }
    const modules=new Map();
    const weather={globalEffects:new Map()};
    setGlobal('__ptuHugePowerCloudWeather',weather);
    const bindingURL=configuration.production ? url(await pinned('src/util/huge-power-bindings.js')) : url(`const f=globalThis.__ptuHugePowerCloudFixture;export const HUGE_POWER_ADMISSIONS=f.admissions;export const HUGE_POWER_CONTRIBUTORS=f.contributors;export const HUGE_POWER_PREPARATIONS=f.models;//${generation}`);
    async function module(path, overrides={}) {
        const original=await pinned(path);
        assert.deepEqual(original.match(/^import[^\n]*/gm)??[],IMPORTS[path],path);
        const inverse=new Map();
        const bound=original.replace(/^import[^\n]*/gm,line=>{
            const specifier=/(['"])([^'"]+)\1;?$/.exec(line);assert.ok(specifier,line);
            const target=overrides[specifier[2]]??unavailable(line,url);
            const replacement=line.slice(0,specifier.index)+specifier[1]+target+specifier[1]+';';inverse.set(replacement,line);return replacement;
        });
        assert.equal(bound.replace(/^import[^\n]*/gm,line=>inverse.get(line)),original);
        const target=url(bound+'\n// isolated loader '+generation+' '+path);modules.set(path,target);return target;
    }
    try {
        const documentSource=await module('src/util/document-source.js');
        const huge=await module('src/util/huge-power.js',{'./huge-power-bindings.js':bindingURL,'./document-source.js':documentSource});
        // Test-only bridge: every entry delegates once with unchanged receiver,
        // arguments, return value and exception. No ordinary-call deduplication.
        const predicateBridgeURL=url(`import * as hp from ${JSON.stringify(huge)};export * from ${JSON.stringify(huge)};const f=globalThis.__ptuHugePowerCloudFixture;export function testRulePredicate(...args){f.countPredicate(this,args);return Reflect.apply(hp.testRulePredicate,this,args);}//${generation}`);
        const predicateBridge=await load(predicateBridgeURL);
        const pokemonBridgeURL=configuration.realPokemon ? url(`import * as hp from ${JSON.stringify(huge)};export * from ${JSON.stringify(huge)};const f=globalThis.__ptuHugePowerCloudFixture;export function beginHugePowerPokemonDerived(...args){const result=Reflect.apply(hp.beginHugePowerPokemonDerived,this,args);f.observeDerived('begin',hp.inspectHugePower(args[0]));return result;}export function finishHugePowerPokemonDerived(...args){const result=Reflect.apply(hp.finishHugePowerPokemonDerived,this,args);f.observeDerived('finish',hp.inspectHugePower(args[0]));return result;}//${generation}`) : huge;
        const predicate=await module('src/module/system/predication.js');
        const schema=await module('src/module/system/schema-data-fields.js',{'./predication.js':predicate});
        const base=await module('src/module/rules/rule-element/base.js',{'../../../util/huge-power.js':predicateBridgeURL,'../../system/index.js':predicate,'../../system/schema-data-fields.js':schema});
        const ae=await module('src/module/rules/rule-element/ae-like.js',{'../../../util/huge-power.js':huge,'../../system/schema-data-fields.js':schema,'./base.js':base});
        const registry=await module('src/module/rules/index.js',{'../../util/huge-power.js':huge,'./rule-element/base.js':base,'./rule-element/ae-like.js':ae});
        const item=await module('src/module/item/base.js',{'../rules/index.js':registry,'../../util/document-source.js':documentSource,'../rules/rule-element/grant-item/rule-element.js':url('export class GrantItemRuleElement {}'),'../../util/misc.js':url('export const sluggify = value => value;')});
        const modifiers=configuration.realPokemon ? await module('src/module/actor/modifiers.js',{'../../util/misc.js':url('export const sluggify = value => value;'),'../system/predication.js':predicate}) : null;
        const level=configuration.realPokemon ? await module('src/module/actor/pokemon/level.js') : null;
        const actor=await module('src/module/actor/base.js',{'../../util/huge-power.js':predicateBridgeURL,'../../util/document-source.js':documentSource,'../apps/weather.js':url('export const Weather=globalThis.__ptuHugePowerCloudWeather;'),...(modifiers?{'./modifiers.js':modifiers}:{})});
        const helpers=await module('src/module/actor/helpers.js',{'../../util/huge-power.js':huge});
        const pokemon=await module('src/module/actor/pokemon/document.js',{'../../../util/huge-power.js':pokemonBridgeURL,'../helpers.js':helpers,'../index.js':url(`export {PTUActor} from ${JSON.stringify(actor)};export class PTUSkills {}`),...(level?{'./level.js':level,'../modifiers.js':modifiers}:{})});
        const hp=await load(huge), rules=await load(registry), ruleBase=await load(base), ruleAE=await load(ae), itemModule=await load(item), actorModule=await load(actor), pokemonModule=await load(pokemon), arithmetic=await load(helpers),predicateModule=await load(predicate),schemaModule=await load(schema);
        CONFIG.PTU.Item.documentClass=configuration.invalidItemClass ? class RejectedItem {} : itemModule.PTUItem;
        class ModelActor extends pokemonModule.PTUPokemonActor {
            prepareBaseData(){(configuration.realPokemon?pokemonModule.PTUPokemonActor:actorModule.PTUActor).prototype.prepareBaseData.call(this);}
            prepareMoves(){return [];}
            prepareDerivedData(){
                actorModule.PTUActor.prototype.prepareDerivedData.call(this);
                for(const stat of Object.values(this.system.modifiers.baseStats))stat.total=stat.value+stat.mod;
                const args={level:this.system.level.current-4,actorStats:this._calcBaseStats(),nature:this.system.nature.value,baseStatModifier:this.system.modifiers.baseStats,twistedPower:Boolean(configuration.twisted)};
                const ordinary=arithmetic.calculateStatTotal(args);
                hp.rememberHugePowerStats(this,args,ordinary,arithmetic.calculateStatTotal);
                this.system.stats=ordinary.stats;
            }
            prepareInitiative(){return {};}
            _setDefaultChanges(){if(configuration.realPokemon)pokemonModule.PTUPokemonActor.prototype._setDefaultChanges.call(this);counters.finalCalls++;callbacks.final(this);}
        }
        if(configuration.realPokemon) {
            // Never replace or copy the actual derived method under test.
            delete ModelActor.prototype.prepareDerivedData;
            delete ModelActor.prototype.prepareMoves;
            delete ModelActor.prototype.prepareInitiative;
            assert.equal(ModelActor.prototype.prepareDerivedData,pokemonModule.PTUPokemonActor.prototype.prepareDerivedData);
        }
        if(configuration.incompleteByTypes) {
            const actualTypes=Object.getOwnPropertyDescriptor(actorModule.PTUActor.prototype,'types').get;
            Object.defineProperty(ModelActor.prototype,'types',{configurable:true,get(){
                const value=Reflect.apply(actualTypes,this,[]);
                if(this.constructed && counters.incompleteBoundaryStates.length===0) {
                    const inspection=hp.inspectHugePower(this);
                    counters.incompleteBoundaryStates.push({valid:inspection?.valid??null,reasons:[...(inspection?.reasons??[])]});
                    this._types.species=[];
                }
                return value;
            }});
        }
        const keys=['hp','atk','def','spatk','spdef','spd'];
        actorSeed={level:{current:configuration.level??20},stats:Object.fromEntries(keys.map(key=>[key,{base:10,value:10,levelUp:key==='atk'?(configuration.points??0):0,mod:{value:0,mod:0},stage:{value:0,mod:0}}])),
            modifiers:{baseStats:Object.fromEntries(keys.map(key=>[key,{value:0,mod:0,total:0}]))},spirit:{value:0},nature:{value:configuration.nature?'synthetic':null},changes:{},typing:['Untyped']};
        if(configuration.realPokemon) {
            Object.assign(actorSeed,{
                background:{increased:{},decreased:{}},skills:{},health:{value:30,injuries:0},tempHp:0,
                tp:{pep:{}},friendship:2,shiny:false,
                contests:{stats:Object.fromEntries(['cool','tough','beauty','smart','cute'].map(key=>[key,{stats:{mod:1},poffins:{value:2,mod:1}}])),voltage:{},appeal:{}}
            });
            actorSeed.level.exp=actorSeed.level.current*10;
            actorSeed.stats.atk.stage.value=configuration.attackStage??0;
            actorSeed.stats.atk.mod.value=configuration.attackModifier??0;
            Object.assign(actorSeed.modifiers,{statPoints:{value:0,mod:0},saveChecks:{value:0,mod:0},initiative:{value:2,mod:0},skillBonus:{value:0,mod:0},capabilities:{all:0},evasion:{physical:{value:1,mod:0},special:{value:0,mod:1},speed:{value:0,mod:0}}});
        }
        const a=new ModelActor();a.system=clone(actorSeed);a.synthetics={speciesOverride:{},typeOverride:{},statisticsModifiers:{}};
        a.items=specs.map((spec,index)=>new itemModule.PTUItem({_id:String(index+1).padStart(16,'0'),name:'Synthetic '+index,type:spec.category==='trainer'?'feat':spec.category==='vitamin'?'item':'ability',img:'synthetic',_stats:{compendiumSource:spec.source},flags:{ptu:{selectedVersion:{id:spec.version},rollOptions:{all:{}}}},system:{enabled:spec.enabled,slug:'synthetic-'+index,rules:clone(spec.raws)}},{parent:a}));
        a.items.contents=a.items;a._types={effect:[],condition:[],species:[{system:{stats:Object.fromEntries(keys.map(key=>[key,10]))}}],move:[]};
        if(configuration.realPokemon) {
            Object.assign(a._types.species[0].system,{types:['Untyped'],skills:{},capabilities:{overland:5},breeding:{eggGroups:['Synthetic']}});
            a._types.species[0].system.stats.atk=configuration.baseAttack??10;
            if(configuration.noSpecies)a._types.species=[];
            if(configuration.noSpeciesSystem)a._types.species=[{}];
        }
        const profile = (prototype, ownCallbacks=[]) => {
            const chain=[];
            for(let current=prototype;current!==null;current=Object.getPrototypeOf(current)) {
                const descriptors=Reflect.ownKeys(current).map(key=>Object.freeze([key,Object.freeze({...Object.getOwnPropertyDescriptor(current,key)})]));
                chain.push(Object.freeze([current,Object.freeze(descriptors)]));
            }
            return Object.freeze({chain:Object.freeze(chain),ownCallbacks:Object.freeze(ownCallbacks.map(([key,descriptor])=>Object.freeze([key,Object.freeze({...descriptor})])))});
        };
        assert.equal(counters.debounceConstructed,1);assert.equal(counters.debounceInvoked,0);
        assert.equal(debounceRecords.length,1);assert.equal(debounceRecords[0].delay,50);
        assert.equal(debounceRecords[0].callable,a.debouncedUpdate);
        assert.notEqual(debounceRecords[0].callback,a.debouncedUpdate);
        const actorCallback=Object.getOwnPropertyDescriptor(a,'debouncedUpdate');
        assert.deepEqual(actorCallback,{value:debounceRecords[0].callable,writable:true,enumerable:true,configurable:true});
        const descriptorObjects=[callbacks,foundry,foundry.abstract,foundry.data,foundry.data.fields,foundry.utils,Roll,
            game,game.user,game.ptu,game.i18n,game.ptu.effectTracker,game.ptu.tokenPanel,canvas,weather,
            CONFIG,CONFIG.PTU,CONFIG.PTU.Item,CONFIG.PTU.data,CONFIG.PTU.data.natureData,CONFIG.PTU.data.natureData.synthetic,
            CoreActor,CoreItem,DataModel,ModelActor,actorModule.PTUActor,pokemonModule.PTUPokemonActor,itemModule.PTUItem,
            ruleBase.RuleElementPTU,ruleAE.AELikeRuleElement,rules.RuleElements,
            predicateModule.PTUPredicate,predicateModule.PTUPredicate.prototype,predicateModule.StatementValidator,
            schemaModule.PredicateField,schemaModule.PredicateField.prototype,schemaModule.ResolvableValueField,schemaModule.ResolvableValueField.prototype,
            ruleAE.AELikeRuleElement.CHANGE_MODES,ruleAE.AELikeRuleElement.PHASES,rules.RuleElements.builtin,rules.RuleElements.custom];
        if(configuration.realPokemon) descriptorObjects.push(bindingFixture,hooks,hookRegistry,Number.prototype,game.settings,game.actors,CONFIG.PTU.Capabilities,CONFIG.PTU.data.typeEffectiveness,CONFIG.PTU.data.levelProgression,Math);
        const ownInventory=object=>Object.freeze(Reflect.ownKeys(object).map(key=>
            Object.freeze([key,Object.freeze({...Object.getOwnPropertyDescriptor(object,key)})])));
        const ownData=(object,key)=>{
            const descriptor=Object.getOwnPropertyDescriptor(object,key);
            assert.ok(descriptor&&Object.hasOwn(descriptor,'value'),'fixture dependency must be own data');
            return Object.freeze({kind:'own-data',object,key,descriptor:Object.freeze({...descriptor})});
        };
        const dependencies=[Object.freeze({kind:'map-size',object:weather.globalEffects,value:0,
            own:ownInventory(weather.globalEffects),chain:profile(Map.prototype).chain}),
            ...(configuration.realPokemon?[ownData(hookListeners,'length'),...[...globals.keys()].map(key=>ownData(globalThis,key))]:[])];
        // Deliberately invalid author-supplied model records, never Item authority.
        if(configuration.dependencySchema==='legacy')dependencies[0]=Object.freeze([weather.globalEffects,'size',0]);
        if(configuration.dependencySchema==='unknown')dependencies[0]=Object.freeze({...dependencies[0],kind:'unqualified'});
        if(configuration.dependencySchema==='accessor-record')dependencies[0]=Object.freeze({...dependencies[0],get object(){counters.dependencyRecordGetterCalls++;throw Error('Unexpected record getter');}});
        if(configuration.dependencySchema==='accessor-kind')dependencies[0]=Object.freeze({...dependencies[0],get kind(){counters.dependencyRecordGetterCalls++;throw Error('Unexpected kind getter');}});
        if(configuration.dependencySchema==='forged-map')dependencies[0]=Object.freeze({...dependencies[0],object:Object.create(Map.prototype)});
        const dependencySchemaKind=configuration.dependencySchema;
        const countedGetter=value=>function(){counters.dependencyRecordGetterCalls++;return value;};
        if(['data-descriptor-prototype-get','data-descriptor-prototype-set','data-descriptor-value-getter','data-descriptor-flags'].includes(dependencySchemaKind)) {
            const original=dependencies[1],descriptor={...original.descriptor};
            if(dependencySchemaKind.startsWith('data-descriptor-prototype-')) {
                const prototype={};Object.defineProperty(prototype,dependencySchemaKind.endsWith('-get')?'get':'set',{get:countedGetter(undefined)});
                Object.setPrototypeOf(descriptor,prototype);
            }
            if(dependencySchemaKind==='data-descriptor-value-getter')Object.defineProperty(descriptor,'value',{get:countedGetter(original.descriptor.value),configurable:true});
            if(dependencySchemaKind==='data-descriptor-flags')descriptor.writable=1;
            dependencies[1]=Object.freeze({...original,descriptor:Object.freeze(descriptor)});
        }
        if(['map-own-every','map-own-iterator','map-inventory-inherited-iterator'].includes(dependencySchemaKind)) {
            const own=[];
            if(dependencySchemaKind==='map-inventory-inherited-iterator'){
                const prototype=Object.create(Array.prototype);Object.defineProperty(prototype,Symbol.iterator,{get:countedGetter(Array.prototype[Symbol.iterator])});Object.setPrototypeOf(own,prototype);
            } else Object.defineProperty(own,dependencySchemaKind==='map-own-every'?'every':Symbol.iterator,{get:countedGetter(dependencySchemaKind==='map-own-every'?Array.prototype.every:Array.prototype[Symbol.iterator])});
            dependencies[0]=Object.freeze({...dependencies[0],own:Object.freeze(own)});
        }
        if(dependencySchemaKind==='map-chain-iterator'||dependencySchemaKind==='map-chain-row-index') {
            const chain=[...dependencies[0].chain];
            if(dependencySchemaKind==='map-chain-iterator')Object.defineProperty(chain,Symbol.iterator,{get:countedGetter(Array.prototype[Symbol.iterator])});
            else {const row=[...chain[0]],value=row[0];Object.defineProperty(row,'0',{get:countedGetter(value),configurable:true});chain[0]=Object.freeze(row);}
            dependencies[0]=Object.freeze({...dependencies[0],chain:Object.freeze(chain)});
        }
        if(['map-inventory-row-index','map-inventory-descriptor-getter','map-inventory-prototype'].includes(dependencySchemaKind)) {
            const chain=[...dependencies[0].chain],inventory=[...chain[0][1]],row=[...inventory[0]];
            if(dependencySchemaKind==='map-inventory-row-index'){const value=row[0];Object.defineProperty(row,'0',{get:countedGetter(value),configurable:true});}
            else {
                const descriptor={...row[1]};
                if(dependencySchemaKind==='map-inventory-descriptor-getter'){const value=descriptor.value;Object.defineProperty(descriptor,'value',{get:countedGetter(value),configurable:true});}
                else {const prototype={};Object.defineProperty(prototype,'get',{get:countedGetter(undefined)});Object.setPrototypeOf(descriptor,prototype);}
                row[1]=Object.freeze(descriptor);
            }
            inventory[0]=Object.freeze(row);chain[0]=Object.freeze([chain[0][0],Object.freeze(inventory)]);
            dependencies[0]=Object.freeze({...dependencies[0],chain:Object.freeze(chain)});
        }
        if(dependencySchemaKind==='dependencies-every'||dependencySchemaKind==='dependencies-iterator')Object.defineProperty(dependencies,dependencySchemaKind==='dependencies-every'?'every':Symbol.iterator,{get:countedGetter(dependencySchemaKind==='dependencies-every'?Array.prototype.every:Array.prototype[Symbol.iterator])});
        Object.assign(model,{kind:'synthetic-closed-preparation-v2',
            actorProfile:profile(ModelActor.prototype,[['debouncedUpdate',actorCallback]]),itemProfile:profile(itemModule.PTUItem.prototype),ruleProfile:profile(ruleAE.AELikeRuleElement.prototype),
            dependencies:Object.freeze(dependencies),
            objects:Object.freeze(descriptorObjects.map(object=>Object.freeze([object,Object.freeze(Reflect.ownKeys(object).map(key=>Object.freeze([key,Object.freeze({...Object.getOwnPropertyDescriptor(object,key)})])))]))),
            ruleClass:ruleAE.AELikeRuleElement,ruleTest:ruleBase.RuleElementPTU.prototype.test,ruleApply:ruleAE.AELikeRuleElement.prototype.apply,
            resolveValue:ruleBase.RuleElementPTU.prototype.resolveValue,resolveInjectedProperties:ruleBase.RuleElementPTU.prototype.resolveInjectedProperties,
            predicatePrimitive:predicateBridge.testRulePredicate,calculateStatTotal:arithmetic.calculateStatTotal});Object.freeze(model);
        const before=a.items.map(i=>i.toObject()), seedBefore=clone(actorSeed);
        const restore=()=>{try{restoreDiagnostics();restoreAuxiliary();for(const [name,prior] of [...globals].reverse()){if(prior)Object.defineProperty(globalThis,name,prior);else Reflect.deleteProperty(globalThis,name);assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,name),prior,name);}}finally{releaseModules();}};
        return {a,hp,weather,pokemonModule,hookListeners,predicateBridge,arithmetic,ruleBase,ruleAE,rules,itemModule,callbacks,counters,configuration,actorSeed,model,diagnostics,debounceRecords,
            preserve(){assert.deepEqual(a.items.map(i=>i.toObject()),before);assert.deepEqual(actorSeed,seedBefore);},restore};
    } catch(error) {try{restoreDiagnostics();restoreAuxiliary();for(const [name,prior] of [...globals].reverse()){if(prior)Object.defineProperty(globalThis,name,prior);else Reflect.deleteProperty(globalThis,name);}}finally{releaseModules();}throw error;}
}
async function scenario(options,fn){const h=await harness(options);try{await fn(h);h.preserve();}finally{h.restore();}}

for(const [mode,expected] of [['core',20],['february',17]])test('bound synthetic '+mode+' uses a real constructed rule and final Actor interval',()=>scenario({mode},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,expected);assert.equal(h.hp.inspectHugePower(h.a).selected,mode);assert.equal(h.a.items[0].rules.length,1);
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,expected);
    h.a.prepareDerivedData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
}));
for(const [mode,expected] of [['core',29],['february',23]])for(const points of [0,4])test(mode+' classified Nature/Vitamin/Trainer with '+points+' allocated points',()=>scenario({mode,contributors:true,nature:true,points},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,expected+points);assert.equal(h.a.system.modifiers.baseStats.atk.mod,11);
}));
test('disabled February stays ignored and outside ordinary active rules',()=>scenario({enabled:false,contributors:true,nature:true},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,23);assert.equal(h.a.items[0].enabled,false);assert.equal(h.a.items[0].rules[0].ignored,true);assert.ok(!h.a.rules.includes(h.a.items[0].rules[0]));
}));
test('disabled Core has no exception',()=>scenario({mode:'core',enabled:false,contributors:true,nature:true},h=>{h.a.prepareData();assert.equal(h.a.system.stats.atk.total,16);assert.equal(h.hp.inspectHugePower(h.a).valid,false);}));
for(const [level,bonus] of [[9,5],[10,6],[19,6],[20,7]])test('February level '+level+' uses current level, not allocated level',()=>scenario({level,points:4,expression:'5 + floor(@actor.system.level.current / 10)'},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,10+bonus+4);assert.equal(h.counters.expression,1);
}));
test('ordinary helper without an Ability keeps base 10',()=>scenario({production:true},h=>{
    const result=h.arithmetic.calculateStatTotal({actorStats:h.actorSeed.stats,baseStatModifier:h.actorSeed.modifiers.baseStats});assert.equal(result.stats.atk.total,10);
}));
test('repeated additive current plus 7 preserves ordinary 0 to 7 to 21',()=>scenario({expression:'@actor.system.modifiers.baseStats.atk.mod + 7',rule:{phase:'beforeDerived'}},h=>{
    h.a.prepareData();assert.equal(h.a.system.modifiers.baseStats.atk.mod,21);assert.equal(h.a.system.stats.atk.total,31);
    assert.deepEqual(h.counters.writeTrace,[{before:0,value:7},{before:7,value:21}]);
    assert.deepEqual(h.counters.formulaInputs,Array(2).fill('@actor.system.modifiers.baseStats.atk.mod + 7'));
    assert.equal(h.counters.expression,2);assert.equal(h.counters.predicates,2);assert.equal(h.hp.inspectHugePower(h.a).valid,false);assert.equal(h.hp.inspectHugePower(h.a).selected,null);
}));
test('distinct literal plus 7 then observed-current addition preserves 0 to 7 to 14',()=>scenario({twoOperations:true},h=>{
    // The first numeric literal is represented as '7' so both ordinary value
    // resolutions are observable through the unchanged formula resolver path.
    h.a.prepareData();assert.equal(h.a.system.modifiers.baseStats.atk.mod,14);assert.equal(h.a.system.stats.atk.total,24);
    assert.deepEqual(h.counters.writeTrace,[{before:0,value:7},{before:7,value:14}]);
    assert.deepEqual(h.counters.formulaInputs,['7','@actor.system.modifiers.baseStats.atk.mod']);
    assert.equal(h.counters.expression,2);assert.equal(h.counters.logs,2);
    assert.equal(h.hp.inspectHugePower(h.a).valid,false);assert.equal(h.hp.inspectHugePower(h.a).selected,null);
}));
for(const options of [{multiple:true},{invalidModel:true},{constructorFailure:true},{rule:{ignored:true}},{rule:{predicate:['absent']}},{expression:Infinity},{expression:[7]},{rule:{mode:'multiply'}},{twisted:true},{contributors:true,unrelatedDisabled:true}])test('unsupported/invalid context retains ordinary behavior '+JSON.stringify(options),()=>scenario(options,h=>{
    h.a.prepareData();assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
}));
test('a late unknown callback with offsetting writes cannot be justified by reconciliation',()=>scenario({mode:'core',lateOffset:true},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a).valid,false);assert.equal(h.hp.inspectHugePower(h.a).selected,null);
}));
test('logging failure preserves actual mutation and rejects managed arithmetic',()=>scenario({mode:'core'},h=>{
    const original=h.ruleAE.AELikeRuleElement.prototype._logChange;
    h.ruleAE.AELikeRuleElement.prototype._logChange=function(){throw Error('Synthetic log failure after mutation');};
    try{h.a.prepareData();assert.equal(h.a.system.modifiers.baseStats.atk.mod,7);assert.equal(h.a.system.stats.atk.total,17);assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);}
    finally{h.ruleAE.AELikeRuleElement.prototype._logChange=original;}
}));
test('failValidation invalidation precedes a throwing logger',()=>scenario({mode:'core'},h=>{
    h.a.prepareData();const rule=h.a.items[0].rules[0];const prior=console.error;
    console.error=()=>{throw Error('Synthetic logger failure');};
    try{assert.throws(()=>rule.failValidation('invalidate after selection'),/logger failure/);assert.equal(h.hp.inspectHugePower(h.a).valid,false);}
    finally{console.error=prior;}
    h.a.prepareDerivedData();assert.equal(h.a.system.stats.atk.total,17);
}));
test('throwing real predicate preserves the ordinary exception',()=>scenario({rule:{predicate:['throw']}},h=>{
    const prior=h.ruleBase.RuleElementPTU.prototype.resolveInjectedProperties;
    h.ruleBase.RuleElementPTU.prototype.resolveInjectedProperties=function(value,...args){if(Array.isArray(value))throw Error('Synthetic predicate failure');return prior.call(this,value,...args);};
    try{assert.throws(()=>h.a.prepareData(),/predicate failure/);assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);}finally{h.ruleBase.RuleElementPTU.prototype.resolveInjectedProperties=prior;}
}));
test('changed identity, version, custom constructor or invalid key cannot be promoted',async()=>{
    for(const change of ['source','version','conflict','custom','key','actor','item-class'])await scenario({mode:'core'},h=>{
        if(change==='source')h.a.items[0]._stats.compendiumSource='Compendium.other.items.Item.AAAAAAAAAAAAAAAA';
        if(change==='version')h.a.items[0].flags.ptu.selectedVersion.id='unmapped';
        if(change==='key')h.a.items[0].system.rules[0].key=42;
        if(change==='conflict')h.a.items[0].flags.core={sourceId:'Compendium.conflicting.items.Item.CCCCCCCCCCCCCCCC'};
        if(change==='actor')h.a.type='character';
        if(change==='item-class')CONFIG.PTU.Item.documentClass=class OtherItem {};
        if(change==='custom')h.rules.RuleElements.custom.ActiveEffectLike=class extends h.ruleAE.AELikeRuleElement {};
        h.a.prepareData();assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
    });
});
test('empty production tables avoid new capture/context/diagnostics, even with hostile objects',()=>scenario({production:true},h=>{
    const hostile=new Proxy({}, {get(){throw Error('Unexpected new capture');}});
    assert.equal(h.hp.beginHugePowerPreparation(hostile),null);assert.equal(h.hp.captureHugePowerRule(hostile,0,hostile,hostile),null);assert.equal(h.hp.inspectHugePower(hostile),null);
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a),null);
}));


test('minimum Base Attack is clamped before four allocated points',()=>scenario({contributors:true,vitamin:0,trainer:-30,points:4},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.value,1);assert.equal(h.a.system.stats.atk.total,5);assert.equal(h.hp.inspectHugePower(h.a).selected,'february');
}));
test('inactive actual calculator never reads the new ticket getter',()=>scenario({production:true},h=>{
    const input={actorStats:h.actorSeed.stats,baseStatModifier:h.actorSeed.modifiers.baseStats};
    Object.defineProperty(input,'hugePowerTicket',{get(){throw Error('Inactive ticket access');}});
    assert.equal(h.arithmetic.calculateStatTotal(input).stats.atk.total,10);
}));
for(const location of ['modern','legacy'])for(const value of [false,0,null,undefined,'',{},[]])test('malformed present '+location+' provenance '+String(value)+' cannot qualify',()=>scenario({mode:'core'},h=>{
    const item=h.a.items[0],source=item._stats.compendiumSource;
    item.flags.core={sourceId:source};
    if(location==='modern')item._stats.compendiumSource=value;else item.flags.core.sourceId=value;
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);
}));
test('missing modern provenance may use an exact valid legacy identity',()=>scenario({mode:'core'},h=>{
    const item=h.a.items[0];item.flags.core={sourceId:item._stats.compendiumSource};delete item._stats.compendiumSource;
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,20);assert.equal(h.hp.inspectHugePower(h.a).selected,'core');
}));
test('an unrelated disabled rule on the same Item rejects the exception',()=>scenario({sameItemDisabled:true},h=>{
    h.a.prepareData();assert.equal(h.a.items.length,1);assert.equal(h.a.items[0].rules.length,2);assert.ok(h.a.items[0].rules.every(rule=>rule.ignored));
    assert.equal(h.a.rules.length,0);assert.equal(h.a.system.stats.atk.total,10);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
}));
for(const shadow of ['function','accessor','nonfunction'])test('own Item sibling callback '+shadow+' cannot join the domain',()=>scenario({mode:'core'},h=>{
    let calls=0;const item=h.a.items[0];const write=()=>{calls++;h.a.system.modifiers.baseStats.atk.mod+=5;h.a.system.modifiers.baseStats.atk.mod-=5;};
    Object.defineProperty(item,'prepareSiblingData',shadow==='accessor'?{configurable:true,get(){return write;}}:{configurable:true,value:shadow==='function'?write:undefined});
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
    assert.equal(calls,shadow==='nonfunction'?0:1);
}));
for(const name of ['prepareSiblingData','prepareActorData','prepareRuleElements'])test('Item prototype callback identity '+name+' is bound',()=>scenario({mode:'core'},h=>{
    const prototype=h.itemModule.PTUItem.prototype,prior=Object.getOwnPropertyDescriptor(prototype,name),original=prototype[name];
    Object.defineProperty(prototype,name,{configurable:true,writable:true,value:function(...args){this.actor.system.modifiers.baseStats.atk.mod+=5;this.actor.system.modifiers.baseStats.atk.mod-=5;return original?.apply(this,args);}});
    try{h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);}
    finally{if(prior)Object.defineProperty(prototype,name,prior);else Reflect.deleteProperty(prototype,name);assert.deepEqual(Object.getOwnPropertyDescriptor(prototype,name),prior);}
}));
for(const name of ['onApplyActiveEffects','beforePrepareData','afterPrepareData'])test('RuleElement zero-net callback replacement '+name+' is rejected',()=>scenario({mode:'core'},h=>{
    const prototype=h.ruleAE.AELikeRuleElement.prototype,prior=Object.getOwnPropertyDescriptor(prototype,name);let calls=0;
    Object.defineProperty(prototype,name,{...prior,value:function(...args){calls++;this.actor.system.modifiers.baseStats.atk.mod+=5;this.actor.system.modifiers.baseStats.atk.mod-=5;return prior.value.apply(this,args);}});
    try{h.a.prepareData();assert.ok(calls>0);assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);}
    finally{Object.defineProperty(prototype,name,prior);assert.deepEqual(Object.getOwnPropertyDescriptor(prototype,name),prior);}
}));
test('own RuleElement hook introduced during construction cannot authorize selection',()=>scenario({mode:'core',ownRuleHook:true},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.hp.inspectHugePower(h.a).valid,false);assert.equal(h.hp.inspectHugePower(h.a).selected,null);
}));
test('expected constructor diagnostics are captured without leaking console descriptors',()=>scenario({constructorFailure:true},h=>{
    h.a.prepareData();assert.ok(h.diagnostics.some(record=>record.name==='warn'&&String(record.args[0]).includes('Error creating rule element')));
    assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
}));



test('constructor debounce double is counted, bound and never scheduled',()=>scenario({mode:'core'},h=>{
    assert.equal(h.counters.debounceConstructed,1);assert.equal(h.counters.debounceInvoked,0);
    const [record]=h.debounceRecords;
    assert.equal(record.delay,50);assert.equal(typeof record.callback,'function');
    assert.equal(h.a.debouncedUpdate,record.callable);
    assert.deepEqual(Object.getOwnPropertyDescriptor(h.a,'debouncedUpdate'),h.model.actorProfile.ownCallbacks[0][1]);
    assert.ok(Object.isFrozen(h.model.actorProfile.ownCallbacks));
    assert.ok(Object.isFrozen(h.model.actorProfile.ownCallbacks[0]));
    assert.ok(Object.isFrozen(h.model.actorProfile.ownCallbacks[0][1]));
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,'core');
    assert.equal(h.counters.debounceConstructed,1);assert.equal(h.counters.debounceInvoked,0);
    assert.throws(()=>h.a.debouncedUpdate(),/Unexpected synthetic debouncedUpdate invocation/);
    assert.equal(h.counters.debounceInvoked,1);
}));
for(const change of ['replacement','deletion','accessor','nonfunction','descriptor','unrelated-function'])test('Actor own callback rejects '+change,()=>scenario({mode:'core'},h=>{
    let getterCalls=0;const original=Object.getOwnPropertyDescriptor(h.a,'debouncedUpdate');
    if(change==='replacement')h.a.debouncedUpdate=function replacement(){};
    if(change==='deletion')delete h.a.debouncedUpdate;
    if(change==='accessor')Object.defineProperty(h.a,'debouncedUpdate',{configurable:true,get(){getterCalls++;return original.value;}});
    if(change==='nonfunction')h.a.debouncedUpdate=undefined;
    if(change==='descriptor')Object.defineProperty(h.a,'debouncedUpdate',{...original,enumerable:false});
    if(change==='unrelated-function')h.a.extraCallback=function unrelated(){};
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,17);
    assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
    assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);assert.equal(getterCalls,0);
    assert.equal(h.counters.debounceInvoked,0);
}));


// Revision 02: exercise the disabled exception itself, not only enabled siblings.
function assertDisabledOrdinary(h,reason) {
    assert.equal(h.a.items[0].enabled,false);
    assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);
    assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);
    if(reason) assert.ok(h.hp.inspectHugePower(h.a)?.reasons.includes(reason),JSON.stringify(h.hp.inspectHugePower(h.a)));
    assert.equal(h.a.system.stats.atk.total,10);
    assert.equal(h.counters.expression,0);assert.equal(h.counters.writes,0);
    assert.equal(h.counters.predicates,0);
}
for(const value of [0,7,-3,0.5,'5 + floor(@actor.system.level.current / 10)'])test('disabled February positively qualifies '+String(value)+' without evaluating its producer',()=>scenario({enabled:false,expression:value},h=>{
    assert.ok(Object.hasOwn(h.a.items[0].system.rules[0],'value'));
    assert.deepEqual(h.a.items[0].system.rules[0].value,value);
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,'february');assert.equal(h.a.system.stats.atk.total,17);
    assert.equal(h.a.items[0].enabled,false);assert.equal(h.a.items[0].rules[0].ignored,true);assert.equal(h.a.rules.length,0);
    assert.equal(h.counters.expression,0);assert.equal(h.counters.writes,0);assert.equal(h.counters.logs,0);assert.equal(h.counters.predicates,1);
}));
for(const [label,value] of [['false',false],['true',true],['null',null],['undefined',undefined],['NaN',NaN],['Infinity',Infinity],['negative Infinity',-Infinity],['array',[7]],['object',{}],['numeric string','7'],['empty string',''],['malformed formula','5 + floor('],['dependent expression','@actor.system.modifiers.baseStats.atk.mod + 7']])test('disabled February rejects unsupported value '+label,()=>scenario({enabled:false,expression:value},h=>{
    // Explicit null and undefined must survive fixture creation, never default to seven.
    assert.ok(Object.hasOwn(h.a.items[0].system.rules[0],'value'));
    assert.deepEqual(h.a.items[0].system.rules[0].value,value);
    h.a.prepareData();assertDisabledOrdinary(h,'unproven-disabled-value-read-set');
}));
for(const [label,options,reason] of [
    ['DataModel invalid',{invalidModel:true},'invalid-construction'],
    ['DataModel validity unknown',{invalidModel:null},'invalid-construction'],
    ['constructor failure',{constructorFailure:true},'construction-did-not-complete'],
    ['source explicitly ignored',{rule:{ignored:true}},'invalid-construction'],
    ['Actor validity during construction',{invalidActorDuringConstruction:true},'invalid-construction'],
    ['Item class validity during construction',{invalidItemClass:true},'invalid-construction'],
    ['later validation failure',{lateValidation:true},'rule-validation-failure'],
    ['DataModel flags cannot erase invalidity',{invalidModel:true,eraseInvalidity:true},'invalid-construction'],
    ['ignored flag cannot erase captured invalidity',{rule:{ignored:true},eraseInvalidity:true},'invalid-construction'],
    ['later flags cannot erase validation failure',{lateValidation:true,eraseInvalidity:true},'rule-validation-failure']
])test('disabled February independent validity gate: '+label,()=>scenario({enabled:false,...options},h=>{
    h.a.prepareData();assert.ok(h.hp.inspectHugePower(h.a),'context was admitted before the independent validity check');
    assertDisabledOrdinary(h,reason);
    if(options.eraseInvalidity){assert.equal(h.a.items[0].rules[0].invalid,false);assert.equal(h.a.items[0].rules[0].ignored,false);}
}));
for(const [label,predicate,tripwire] of [['negative',['absent'],false],['enabled-dependent',['item:enabled'],false],['potentially throwing',['throw'],true]])test('disabled February rejects '+label+' predicate before primitive evaluation',()=>scenario({enabled:false,rule:{predicate},predicateThrowTripwire:tripwire},h=>{
    h.a.prepareData();assertDisabledOrdinary(h,'unsupported-rule-shape');assert.equal(h.counters.predicateTests,0);
    if(tripwire)assert.throws(()=>h.a.items[0].rules[0].predicate.test(new Set()),/unsupported predicate tripwire/);
}));
test('managed primitive delegates once per full preparation, not per repeated derived calculation',()=>scenario({enabled:false},h=>{
    h.a.prepareData();const first=h.a.items[0].rules[0];
    assert.equal(h.counters.predicates,1);assert.equal(h.hp.inspectHugePower(h.a).selected,'february');
    assert.deepEqual(h.counters.predicateCalls[0].args,[first]);assert.equal(h.counters.predicateCalls[0].receiver,undefined);
    h.a.prepareDerivedData();h.a.prepareDerivedData();assert.equal(h.counters.predicates,1);assert.equal(h.a.system.stats.atk.total,10);
    h.a.prepareData();const second=h.a.items[0].rules[0];assert.notEqual(second,first);
    assert.equal(h.counters.predicates,2);assert.deepEqual(h.counters.predicateCalls[1].args,[second]);assert.equal(h.a.system.stats.atk.total,17);
    assert.equal(h.counters.expression,0);assert.equal(h.counters.writes,0);
}));
test('predicate bridge preserves receiver, arguments, false return and the original exception',()=>scenario({enabled:false},h=>{
    const receiver={sentinel:true},options=['actual-option'],failure=Error('Original predicate exception');
    let calls=0;const falseRule={predicate:['absent'],actor:{getRollOptions(){throw Error('Explicit options lost');}},item:{getRollOptions(){return ['item-option'];}},resolveInjectedProperties(value){assert.equal(value,this.predicate);return {test(set){calls++;assert.deepEqual([...set],['actual-option','item-option']);return false;}};}};
    assert.equal(Reflect.apply(h.predicateBridge.testRulePredicate,receiver,[falseRule,options]),false);
    assert.equal(calls,1);assert.equal(h.counters.predicates,1);assert.equal(h.counters.predicateCalls[0].receiver,receiver);assert.equal(h.counters.predicateCalls[0].args[1],options);
    const throwingRule={...falseRule,resolveInjectedProperties(){throw failure;}};
    assert.throws(()=>Reflect.apply(h.predicateBridge.testRulePredicate,receiver,[throwingRule,options]),error=>error===failure);
    assert.equal(h.counters.predicates,2);assert.equal(calls,1);
}));
test('disabled later validation remains invalid even when its logger throws',()=>scenario({enabled:false},h=>{
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,'february');const rule=h.a.items[0].rules[0],prior=console.error;
    console.error=()=>{throw Error('Synthetic disabled logger failure');};
    try{assert.throws(()=>rule.failValidation('late disabled failure'),/disabled logger failure/);assert.equal(h.hp.inspectHugePower(h.a).valid,false);assert.ok(h.hp.inspectHugePower(h.a).reasons.includes('rule-validation-failure'));}
    finally{console.error=prior;}
    h.a.prepareDerivedData();assert.equal(h.a.system.stats.atk.total,10);assert.equal(h.counters.predicates,1);
}));
for(const change of ['source','version','conflict','unbound-legacy','missing-provenance','key'])test('disabled February unmapped identity: '+change,()=>scenario({enabled:false},h=>{
    const item=h.a.items[0];
    if(change==='source')item._stats.compendiumSource='Compendium.other.items.Item.AAAAAAAAAAAAAAAA';
    if(change==='version')item.flags.ptu.selectedVersion.id='unmapped';
    if(change==='conflict')item.flags.core={sourceId:'Compendium.conflicting.items.Item.CCCCCCCCCCCCCCCC'};
    if(change==='unbound-legacy'){delete item._stats.compendiumSource;item.flags.core={sourceId:'Compendium.legacy.items.Item.LLLLLLLLLLLLLLLL'};}
    if(change==='missing-provenance'){delete item._stats.compendiumSource;delete item.flags.core;}
    if(change==='key')item.system.rules[0].key=42;
    h.a.prepareData();assert.ok(h.hp.inspectHugePower(h.a),'unmapped record is rejected within an admitted context');assertDisabledOrdinary(h);
}));
for(const change of ['actor','custom','item-class'])test('disabled February rejects changed domain before context admission: '+change,()=>scenario({enabled:false},h=>{
    if(change==='actor')h.a.type='character';
    if(change==='custom')h.rules.RuleElements.custom.ActiveEffectLike=class extends h.ruleAE.AELikeRuleElement {};
    if(change==='item-class')CONFIG.PTU.Item.documentClass=class OtherItem {};
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a),null);assertDisabledOrdinary(h);
}));
test('disabled February exact admitted legacy fallback remains distinct from unbound legacy',()=>scenario({enabled:false},h=>{
    const item=h.a.items[0];item.flags.core={sourceId:item._stats.compendiumSource};delete item._stats.compendiumSource;
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,'february');assert.equal(h.a.system.stats.atk.total,17);
    assert.equal(h.counters.expression,0);assert.equal(h.counters.writes,0);assert.equal(h.counters.predicates,1);
}));

test('empty-table Actor-first import preserves actual Actor/Item/Rule cycles',async()=>{
    const sources=Object.fromEntries(await Promise.all(Object.keys(PINS).map(async path=>[path,await pinned(path)])));
    const runner=String.raw`
import {SourceTextModule,createContext} from 'node:vm';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const input=JSON.parse(readFileSync(0,'utf8'));
const context=createContext({Actor:class {},Item:class {},foundry:{abstract:{DataModel:class {}},data:{fields:{DataField:class {},ArrayField:class {},StringField:class {},NumberField:class {},BooleanField:class {}}}}});
let dependencyIntrinsicReads=0;
Object.defineProperty(context,'Map',{get(){dependencyIntrinsicReads++;throw Error('Inactive dependency intrinsic capture');},configurable:true});
const resolve=(from,specifier)=>path.posix.normalize(path.posix.join(path.posix.dirname(from),specifier));
const externals=new Map(),modules=new Map(),edges=[];
for(const [from,source] of Object.entries(input)) {
    for(const match of source.matchAll(/^(?:import|export)\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/gm)) {
        const target=resolve(from,match[2]);if(Object.hasOwn(input,target))continue;
        const names=externals.get(target)??new Set();
        for(const name of match[1].split(',').map(value=>value.trim())){assert.match(name,/^[A-Za-z_$][\w$]*$/);names.add(name);}
        externals.set(target,names);
    }
}
for(const [name,source] of Object.entries(input))modules.set(name,new SourceTextModule(source,{context,identifier:name}));
for(const [name,names] of externals)modules.set(name,new SourceTextModule([...names].map(value=>'export class '+value+' { constructor(){throw Error("Unexpected smoke boundary");} }').join('\n'),{context,identifier:name}));
const entry=modules.get('src/module/actor/base.js');
await entry.link((specifier,from)=>{const target=resolve(from.identifier,specifier);edges.push([from.identifier,target]);assert.ok(modules.has(target),target);return modules.get(target);});
await entry.evaluate({timeout:5000});
for(const [from,to] of [
 ['src/module/actor/base.js','src/module/item/index.js'],
 ['src/module/item/index.js','src/module/item/base.js'],
 ['src/module/item/base.js','src/module/rules/index.js'],
 ['src/module/rules/index.js','src/module/rules/rule-element/base.js'],
 ['src/module/rules/index.js','src/module/rules/rule-element/ae-like.js'],
 ['src/module/rules/rule-element/base.js','src/module/actor/base.js'],
 ['src/module/rules/rule-element/base.js','src/module/item/base.js'],
 ['src/module/rules/rule-element/ae-like.js','src/module/rules/rule-element/base.js']
])assert.ok(edges.some(edge=>edge[0]===from&&edge[1]===to),from+' -> '+to);
assert.equal(typeof entry.namespace.PTUActor,'function');
assert.equal(typeof modules.get('src/module/rules/rule-element/ae-like.js').namespace.AELikeRuleElement,'function');
assert.equal(modules.get('src/util/huge-power.js').namespace.HUGE_POWER_ENABLED,false);
assert.equal(dependencyIntrinsicReads,0);
process.stdout.write('Actor-first actual-edge smoke passed\n');
`;
    // One bounded synthetic child is part of the future focused-test admission.
    // It receives only the cached pinned text on stdin and reads no project files.
    const result=spawnSync(process.execPath,['--experimental-vm-modules','--input-type=module','-e',runner],{
        input:JSON.stringify(sources),encoding:'utf8',timeout:10000,maxBuffer:32768,windowsHide:true
    });
    assert.equal(result.error,undefined);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/actual-edge smoke passed/);
});

// HP-POKEMON-DERIVED-20261115-01 baseline. This expectation deliberately
// describes required consistency; execute only after the frozen review gate.
test('real Pokemon baseline: final Core Attack and Cool remain consistent',()=>scenario({realPokemon:true,mode:'core'},h=>{
    assert.equal(Object.getPrototypeOf(h.a).prepareDerivedData,h.pokemonModule.PTUPokemonActor.prototype.prepareDerivedData);
    h.a.prepareData();
    assert.equal(h.counters.corePreparations,1);
    assert.equal(h.counters.finalCalls,1);
    assert.deepEqual(h.counters.initiativeHooks,[{attack:17},{attack:17}]);
    assert.equal(h.counters.writes,1);
    assert.equal(h.counters.predicates,1);
    assert.equal(h.hp.inspectHugePower(h.a).selected,'core');
    assert.equal(h.a.system.stats.atk.total,20);
    assert.equal(h.a.system.contests.stats.cool.stats.value,2);
    assert.equal(h.a.system.contests.stats.cool.stats.total,3);
    assert.equal(h.a.system.contests.stats.cool.dice,6);
}));


const pokemonView = h => ({system:clone(h.a.system),attributes:clone(h.a.attributes),flags:clone(h.a.flags),initiative:{slug:h.a.initiative.slug,totalModifier:h.a.initiative.totalModifier,modifiers:clone(h.a.initiative.modifiers)}});
const withoutSelectedFields = view => {
    const output=clone(view);
    delete output.system.stats.atk.value;delete output.system.stats.atk.total;
    delete output.system.contests.stats.cool.stats.value;delete output.system.contests.stats.cool.stats.total;delete output.system.contests.stats.cool.dice;
    return output;
};
for(const row of [
    {mode:'core',expected:20},
    {mode:'core',points:4,expected:24},
    {mode:'core',baseAttack:9,expected:18},
    {mode:'core',baseAttack:15,expected:30},
    {mode:'core',baseAttack:20,expected:40},
    {mode:'core',attackStage:1,expected:24},
    {mode:'core',attackStage:-1,expected:18},
    {mode:'core',attackModifier:2,expected:22},
    {mode:'core',contributors:true,nature:true,points:4,expected:33},
    {mode:'february',expected:17},
    {mode:'february',level:50,expected:20},
    {mode:'february',enabled:false,level:50,expected:20},
    {mode:'february',enabled:false,baseAttack:15,points:4,expected:26},
    {mode:'february',contributors:true,nature:true,points:4,expected:27}
])test('real Pokemon complete ordinary preservation and consistent selection '+JSON.stringify(row),async()=>{
    let ordinary;
    await scenario({...row,realPokemon:true,production:true},h=>{
        h.a.prepareData();ordinary=pokemonView(h);assert.equal(h.hp.inspectHugePower(h.a),null);
        assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.initiativeHooks.length,2);
    });
    await scenario({...row,realPokemon:true},h=>{
        h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,row.mode);
        assert.equal(h.a.system.stats.atk.total,row.expected);
        const contribution=Math.min(Math.floor(row.expected/10),3),cool=h.a.system.contests.stats.cool;
        assert.equal(cool.stats.value,contribution);assert.equal(cool.stats.total,Math.min(contribution+1,3));assert.equal(cool.dice,Math.min(contribution+1,3)+3);
        assert.deepEqual(withoutSelectedFields(pokemonView(h)),withoutSelectedFields(ordinary));
        assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.finalCalls,1);assert.equal(h.counters.initiativeHooks.length,2);
        assert.deepEqual(h.counters.initiativeHooks,Array(2).fill({attack:ordinary.system.stats.atk.total}));
        assert.equal(h.counters.expression,0);assert.equal(h.counters.writes,(row.enabled===false?0:1)+(row.contributors?2:0));
        assert.equal(h.counters.predicates,1+(row.contributors?2:0));assert.equal(h.counters.derivedGetterCalls,0);
        assert.equal(h.counters.debounceInvoked,0);
    });
});
test('real Pokemon repeated full and derived preparation does not replay or compound selection',()=>scenario({realPokemon:true,mode:'core'},h=>{
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,20);assert.equal(h.a.system.contests.stats.cool.stats.value,2);
    h.a.prepareDerivedData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.a.system.contests.stats.cool.stats.value,1);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
    h.a.prepareDerivedData();assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.a.system.contests.stats.cool.stats.value,1);
    assert.equal(h.counters.writes,1);assert.equal(h.counters.predicates,1);assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.initiativeHooks.length,4);
    h.a.prepareData();assert.equal(h.a.system.stats.atk.total,20);assert.equal(h.a.system.contests.stats.cool.stats.value,2);
    assert.equal(h.counters.writes,2);assert.equal(h.counters.predicates,2);assert.equal(h.counters.corePreparations,2);assert.equal(h.counters.initiativeHooks.length,6);
}));
for(const lateContest of ['dice','mod','replace','extra','readonly','allocated'])test('real Pokemon late '+lateContest+' retains complete ordinary result',async()=>{
    let ordinary;
    await scenario({realPokemon:true,mode:'core',production:true,lateContest},h=>{h.a.prepareData();ordinary=pokemonView(h);});
    await scenario({realPokemon:true,mode:'core',lateContest},h=>{
        h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,null);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
        assert.ok(h.hp.inspectHugePower(h.a).reasons.length>0);assert.deepEqual(pokemonView(h),ordinary);
        if(lateContest==='readonly')assert.equal(Object.getOwnPropertyDescriptor(h.a.system.contests.stats.cool.stats,'value').writable,false);
    });
});
test('real Pokemon late accessor is never invoked or overwritten',()=>scenario({realPokemon:true,mode:'core',lateContest:'accessor'},h=>{
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,null);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
    assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.counters.derivedGetterCalls,0);
    const descriptor=Object.getOwnPropertyDescriptor(h.a.system.contests.stats.cool.stats,'value');assert.equal(typeof descriptor.get,'function');assert.equal(Object.hasOwn(descriptor,'value'),false);
    assert.equal(h.a.system.contests.stats.cool.dice,5);
}));
for(const options of [{noSpecies:true},{noSpeciesSystem:true},{incompleteSecondDerived:true},{reentrant:true}])test('real Pokemon incomplete or reentrant interval preserves ordinary '+JSON.stringify(options),async()=>{
    let ordinary;
    await scenario({realPokemon:true,mode:'core',production:true,...options},h=>{h.a.prepareData();ordinary=pokemonView(h);});
    await scenario({realPokemon:true,mode:'core',...options},h=>{
        h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a)?.selected??null,null);assert.notEqual(h.hp.inspectHugePower(h.a)?.valid,true);assert.deepEqual(pokemonView(h),ordinary);
    });
});
test('real Pokemon interrupted derived body never authorizes a partial candidate',()=>scenario({realPokemon:true,mode:'core',throwDerived:true},h=>{
    assert.throws(()=>h.a.prepareData(),/Synthetic interrupted derived interval/);assert.equal(h.hp.inspectHugePower(h.a).selected,null);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
    assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.counters.writes,1);assert.equal(h.counters.predicates,1);assert.equal(h.counters.finalCalls,0);
}));
for(const location of ['listener','global-hooks'])test('real Pokemon unknown '+location+' cannot authorize selection',()=>scenario({realPokemon:true,mode:'core'},h=>{
    let observed=0;
    if(location==='listener')h.hookListeners.push(()=>{observed++;});
    else globalThis.Hooks={call(){observed++;}};
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a),null);assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.a.system.contests.stats.cool.stats.value,1);assert.equal(observed,2);
}));

test('real Pokemon without an Ability remains ordinary with empty admissions',()=>scenario({realPokemon:true,noAbility:true},h=>{
    h.a.prepareData();assert.equal(h.hp.HUGE_POWER_ENABLED,false);assert.equal(h.hp.inspectHugePower(h.a),null);
    assert.equal(h.a.system.stats.atk.total,10);assert.equal(h.a.system.contests.stats.cool.stats.value,1);assert.equal(h.a.system.contests.stats.cool.dice,5);
    assert.equal(h.counters.writes,0);assert.equal(h.counters.predicates,0);assert.equal(h.counters.expression,0);assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.initiativeHooks.length,2);
}));


for(const lateStats of ['root-accessor','total-accessor','root-readonly','total-readonly'])test('real Pokemon rejects late stats '+lateStats+' before live traversal',()=>scenario({realPokemon:true,mode:'core',lateStats},h=>{
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,null);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
    assert.ok(h.hp.inspectHugePower(h.a).reasons.includes('late-pokemon-derived-change'));assert.equal(h.counters.derivedGetterCalls,0);
    const before=h.counters.lateStatsTargets;assert.equal(before.ordinaryAttack,17);
    assert.strictEqual(h.a.system.contests,before.contests);assert.deepEqual(h.a.system.contests.stats.cool,before.cool);
    const root=Object.getOwnPropertyDescriptor(h.a.system,'stats'),total=Object.getOwnPropertyDescriptor(before.attack,'total');
    if(lateStats==='root-accessor')assert.equal(typeof root.get,'function');else assert.strictEqual(root.value,before.stats);
    if(lateStats==='total-accessor')assert.equal(typeof total.get,'function');else assert.equal(total.value,17);
    if(lateStats==='root-readonly')assert.equal(root.writable,false);
    if(lateStats==='total-readonly')assert.equal(total.writable,false);
    assert.strictEqual(before.stats.atk,before.attack);assert.equal(before.attack.value,17);
}));
test('real Pokemon valid first completion cannot authorize an incomplete second derived pass',async()=>{
    let ordinary;
    await scenario({realPokemon:true,mode:'core',production:true,incompleteByTypes:true},h=>{h.a.prepareData();ordinary=pokemonView(h);});
    await scenario({realPokemon:true,mode:'core',incompleteByTypes:true},h=>{
        assert.equal(Object.getPrototypeOf(h.a).prepareDerivedData,h.pokemonModule.PTUPokemonActor.prototype.prepareDerivedData);
        h.a.prepareData();
        assert.deepEqual(h.counters.derivedEvents,[
            {event:'begin',valid:true,selected:null,reasons:[]},
            {event:'finish',valid:true,selected:null,reasons:[]},
            {event:'begin',valid:true,selected:null,reasons:[]}
        ]);
        assert.deepEqual(h.counters.incompleteBoundaryStates,[{valid:true,reasons:[]}]);
        assert.equal(h.hp.inspectHugePower(h.a).selected,null);assert.equal(h.hp.inspectHugePower(h.a).valid,false);
        assert.deepEqual(h.hp.inspectHugePower(h.a).reasons,['final-domain-not-established']);
        assert.deepEqual(pokemonView(h),ordinary);assert.equal(h.a.system.stats.atk.total,17);assert.equal(h.a.system.contests.stats.cool.stats.value,1);
        assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.initiativeHooks.length,1);assert.equal(h.counters.writes,1);assert.equal(h.counters.predicates,1);
    });
});


// HP-DEPENDENCY-OBSERVATION-20261115-01: all callbacks and state comparisons
// below are paired against actual preparation with the shipped empty tables.
// The changed descriptors remain installed through preparation and are restored
// before the harness's independent preservation/cleanup assertions.
function dependencyMutation(h,kind) {
    const map=h.weather.globalEffects,prototype=Object.getPrototypeOf(map);
    const size=Object.getOwnPropertyDescriptor(prototype,'size');
    const values=Object.getOwnPropertyDescriptor(prototype,'values');
    const globalKey=kind==='global-hooks-getter'?'Hooks':'__ptuHugePowerCloudWeather';
    const globalDescriptor=Object.getOwnPropertyDescriptor(globalThis,globalKey);
    let calls=0,active=false,restoreAction=null;
    const getter=value=>function(){calls++;return value;};
    const throwing=function(){calls++;throw Error('Unexpected dependency getter');};
    const define=(object,key,descriptor)=>{
        const before=Object.getOwnPropertyDescriptor(object,key);
        Object.defineProperty(object,key,descriptor);
        const installed=Object.getOwnPropertyDescriptor(object,key);
        restoreAction=()=>{
            assert.deepEqual(Object.getOwnPropertyDescriptor(object,key),installed,'observer must not rewrite dependency');
            if(before)Object.defineProperty(object,key,before);else Reflect.deleteProperty(object,key);
            assert.deepEqual(Object.getOwnPropertyDescriptor(object,key),before,'dependency descriptor restored');
        };
    };
    return {get calls(){return calls;},get active(){return active;},apply(){
        assert.equal(active,false);active=true;
        if(kind==='map-own-size-getter')define(map,'size',{get:getter(0),configurable:true});
        else if(kind==='map-own-size-throwing')define(map,'size',{get:throwing,configurable:true});
        else if(kind==='map-own-size-data')define(map,'size',{value:0,configurable:true});
        else if(kind==='map-own-values-getter')define(map,'values',{get:getter(values.value),configurable:true});
        else if(kind==='map-prototype-size-getter')define(prototype,'size',{...size,get:getter(0)});
        else if(kind==='map-prototype-size-throwing')define(prototype,'size',{...size,get:throwing});
        else if(kind==='map-prototype-size-missing'){
            assert.equal(Reflect.deleteProperty(prototype,'size'),true);
            restoreAction=()=>{assert.equal(Object.getOwnPropertyDescriptor(prototype,'size'),undefined);Object.defineProperty(prototype,'size',size);assert.deepEqual(Object.getOwnPropertyDescriptor(prototype,'size'),size);};
        }
        else if(kind==='map-prototype-values-getter')define(prototype,'values',{get:getter(values.value),enumerable:values.enumerable,configurable:values.configurable});
        else if(kind==='map-prototype-change'){
            const replacement=Object.create(prototype);Object.setPrototypeOf(map,replacement);
            restoreAction=()=>{assert.equal(Object.getPrototypeOf(map),replacement);Object.setPrototypeOf(map,prototype);assert.equal(Object.getPrototypeOf(map),prototype);};
        }
        else if(kind==='map-content-change'){
            const effect={system:{mode:'disabled'}};map.set('synthetic-disabled',effect);
            restoreAction=()=>{assert.equal(map.get('synthetic-disabled'),effect);assert.equal(map.delete('synthetic-disabled'),true);assert.equal(Reflect.apply(size.get,map,[]),0);};
        }
        else if(kind==='global-weather-getter'||kind==='global-hooks-getter')define(globalThis,globalKey,{get:getter(globalDescriptor.value),configurable:globalDescriptor.configurable,enumerable:globalDescriptor.enumerable});
        else if(kind==='global-weather-value')define(globalThis,globalKey,{...globalDescriptor,value:{}});
        else if(kind==='global-weather-readonly')define(globalThis,globalKey,{...globalDescriptor,writable:false});
        else if(kind==='global-weather-missing'){
            assert.equal(Reflect.deleteProperty(globalThis,globalKey),true);
            restoreAction=()=>{assert.equal(Object.getOwnPropertyDescriptor(globalThis,globalKey),undefined);Object.defineProperty(globalThis,globalKey,globalDescriptor);assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,globalKey),globalDescriptor);};
        }
        else if(kind==='listener-change'){
            const listener=()=>{calls++;};h.hookListeners.push(listener);
            restoreAction=()=>{assert.equal(h.hookListeners.pop(),listener);assert.equal(h.hookListeners.length,0);};
        }
        else assert.fail('Unknown dependency mutation '+kind);
    },restore(){if(active){restoreAction();active=false;}}};
}
const dependencyCalls=h=>({core:h.counters.corePreparations,final:h.counters.finalCalls,
    initiative:clone(h.counters.initiativeHooks),writes:h.counters.writes,predicates:h.counters.predicates,
    expressions:h.counters.expression,debounce:h.counters.debounceInvoked,settings:clone(h.counters.settingReads)});
const dependencyCases=[
    'map-own-size-getter','map-own-size-throwing','map-own-size-data','map-own-values-getter',
    'map-prototype-size-getter','map-prototype-size-throwing','map-prototype-size-missing','map-prototype-values-getter',
    'map-prototype-change','map-content-change','global-weather-getter','global-weather-missing',
    'global-weather-value','global-weather-readonly','global-hooks-getter','listener-change'
].map(kind=>({kind,timing:'initial'}));
for(const timing of ['final','embedded-restore'])for(const kind of [
    'map-own-size-getter','map-prototype-size-getter','global-weather-getter','global-weather-value'
])dependencyCases.push({kind,timing});
for(const {kind,timing} of dependencyCases)test('dependency preservation '+timing+' '+kind,async()=>{
    const observations=[];
    for(const production of [true,false]){
        const actions={};
        await scenario({realPokemon:true,mode:'core',production,dependencyTiming:timing,dependencyActions:actions},h=>{
            const mutation=dependencyMutation(h,kind);actions.apply=()=>mutation.apply();actions.restore=()=>mutation.restore();
            try {
                if(timing==='initial')mutation.apply();
                h.a.prepareData();
                const inspection=h.hp.inspectHugePower(h.a);
                assert.equal(inspection?.selected??null,null);assert.notEqual(inspection?.valid,true);
                if(!production&&timing!=='initial'){
                    assert.ok(inspection,'late mutation started in an admitted interval');
                    assert.equal(inspection.valid,false);assert.ok(inspection.reasons.includes('incomplete-preparation-interval'));
                }
                if(timing==='embedded-restore')assert.equal(mutation.active,false,'restored before final completion; invalidation stays sticky');
                observations.push({view:pokemonView(h),calls:dependencyCalls(h),getterOrListenerCalls:mutation.calls});
                assert.equal(h.a.system.stats.atk.total,17);
                assert.equal(h.a.system.contests.stats.cool.stats.value,1);assert.equal(h.a.system.contests.stats.cool.stats.total,2);assert.equal(h.a.system.contests.stats.cool.dice,5);
                assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.finalCalls,1);assert.equal(h.counters.initiativeHooks.length,2);
                assert.equal(h.counters.writes,1);assert.equal(h.counters.predicates,1);assert.equal(h.counters.dependencyRecordGetterCalls,0);
            } finally {mutation.restore();}
        });
    }
    assert.deepEqual(observations[1],observations[0],'observer must preserve full ordinary state and call counts');
    if(!['map-own-values-getter','map-prototype-values-getter','global-hooks-getter','listener-change'].includes(kind))assert.equal(observations[1].getterOrListenerCalls,0);
    else assert.ok(observations[0].getterOrListenerCalls>0,'ordinary path intentionally exercises this callback');
});
test('qualified own-data and intrinsic Map dependencies retain the supported selection',()=>scenario({realPokemon:true,mode:'core'},h=>{
    assert.equal(h.model.dependencies[0].kind,'map-size');assert.equal(h.model.dependencies[0].value,0);
    assert.ok(h.model.dependencies.slice(1).every(row=>row.kind==='own-data'&&Object.hasOwn(row.descriptor,'value')));
    h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a).selected,'core');assert.equal(h.hp.inspectHugePower(h.a).valid,true);
    assert.equal(h.a.system.stats.atk.total,20);assert.equal(h.a.system.contests.stats.cool.stats.value,2);
    assert.equal(h.counters.corePreparations,1);assert.equal(h.counters.writes,1);assert.equal(h.counters.predicates,1);
}));
for(const dependencySchema of ['legacy','unknown','accessor-record','accessor-kind','forged-map',
    'data-descriptor-prototype-get','data-descriptor-prototype-set','data-descriptor-value-getter','data-descriptor-flags',
    'map-own-every','map-own-iterator','map-chain-iterator','map-chain-row-index','map-inventory-row-index',
    'map-inventory-descriptor-getter','map-inventory-prototype','map-inventory-inherited-iterator','dependencies-every','dependencies-iterator'])test('unqualified dependency schema rejects '+dependencySchema,async()=>{
    let ordinary;
    await scenario({realPokemon:true,mode:'core',production:true,dependencySchema},h=>{h.a.prepareData();ordinary={view:pokemonView(h),calls:dependencyCalls(h)};assert.equal(h.counters.dependencyRecordGetterCalls,0);});
    await scenario({realPokemon:true,mode:'core',dependencySchema},h=>{
        h.a.prepareData();assert.equal(h.hp.inspectHugePower(h.a),null);assert.equal(h.counters.dependencyRecordGetterCalls,0);
        assert.deepEqual({view:pokemonView(h),calls:dependencyCalls(h)},ordinary);
    });
});
