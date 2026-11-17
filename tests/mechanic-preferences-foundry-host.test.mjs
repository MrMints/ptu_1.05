import test from 'node:test';
import assert from 'node:assert/strict';
let sequence = 0;
const target = 'ptu.variant.trainerAdvancement';
const modes = ['original','data-revamp','short-track','ptr-update','long-track'];
async function fresh() {
    return import('../src/util/mechanic-preferences-foundry-host.js?fixture=' + (++sequence));
}
function fixture() {
    class Document { get id() { return this._id; } }
    class User extends Document {
        constructor() { super(); this._id='gm'; Object.defineProperty(this,'role',{value:4,configurable:true}); }
    }
    class Setting extends Document {
        constructor(id, key=target, user=null, raw='"original"', prepared='original') {
            super(); this._id=id; this.key=key; this.user=user; this.value=prepared;
            this._source=Object.seal({_id:id,key,user,value:raw});
        }
    }
    class Users extends Map { constructor(user) { super([[user.id,user]]); this.current=user; } }
    class WorldSettings extends Map { [Symbol.iterator]() { return this.values(); } }
    class ClientSettings {
        constructor(world) {
            this.storage=new Map([['world',world]]);
            this.settings=new Map([[target,{namespace:'ptu',key:'variant.trainerAdvancement',type:String,scope:'world',
                default:'original',choices:Object.fromEntries(modes.map(m=>[m,m])),requiresReload:true,config:false}]]);
        }
    }
    class Game { get user() { return this.users.current; } }
    const user=new User(), users=new Users(user), world=new WorldSettings(), game=new Game();
    game.userId='gm'; game.data={userId:'gm'}; game.users=users; game.settings=new ClientSettings(world);
    const core={Game,User,Users,Setting,WorldSettings,ClientSettings};
    const config={User:{documentClass:User,collection:Users},Setting:{documentClass:Setting}};
    const document=new Setting('selected'); world.set('selected',document);
    return {core,user,users,world,game,config,document,reg:game.settings.settings.get(target),
        add(id,key,user,raw,prepared) { const d=new Setting(id,key,user,raw,prepared); world.set('slot'+world.size,d); return d; }};
}
async function using(run) {
    const oldGame=Object.getOwnPropertyDescriptor(globalThis,'game'), oldConfig=Object.getOwnPropertyDescriptor(globalThis,'CONFIG');
    const f=fixture(), host=await fresh();
    Object.defineProperty(globalThis,'game',{value:f.game,configurable:true,writable:true});
    Object.defineProperty(globalThis,'CONFIG',{value:f.config,configurable:true,writable:true});
    try { await run(f,host); }
    finally {
        if(oldGame) Object.defineProperty(globalThis,'game',oldGame); else delete globalThis.game;
        if(oldConfig) Object.defineProperty(globalThis,'CONFIG',oldConfig); else delete globalThis.CONFIG;
    }
}
function bind(f,h) { assert.equal(h.bindTrainerAdvancementFoundryHost(f.core).status,'bound'); }
function stopped(r) { assert.notEqual(r.status,'observed'); assert.equal(r.provider,null); assert.equal(r.evidence,null); }
function observed(r) { assert.equal(r.status,'observed'); assert.equal(r.provider.mapping,null); assert.equal(r.atomicity,'not-established'); }

test("import is inert even when actual-global access throws", async () => {
    const oldGame=Object.getOwnPropertyDescriptor(globalThis,'game'),oldConfig=Object.getOwnPropertyDescriptor(globalThis,'CONFIG');let reads=0;
    try { for(const key of ['game','CONFIG']) Object.defineProperty(globalThis,key,{configurable:true,get(){reads++;throw Error('secret');}});
        await fresh(); assert.equal(reads,0);
    } finally {if(oldGame)Object.defineProperty(globalThis,'game',oldGame);else delete globalThis.game;if(oldConfig)Object.defineProperty(globalThis,'CONFIG',oldConfig);else delete globalThis.CONFIG;}
});

test("unqualified bootstrap cannot observe settings", async () => {
    await using((f,h)=>{let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("caller Boolean or alternate game argument cannot authorize capture", async () => {
    await using((f,h)=>{bind(f,h);for(const arg of [true,f.game,{isGM:true}]){const r=h.captureFoundryTrainerAdvancement(arg);stopped(r);assert.equal(r.stage,'arguments');}});
});

test("ordinary inherited IDs, null world sentinel and actual-global user agreement are observed", async () => {
    await using((f,h)=>{bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.provider.issue,'override-unresolved');assert.equal(r.provider.evidence.observation.loadedSource.value,'"original"');assert.equal(r.provider.evidence.observation.decoded.value,'original');assert.equal(r.provider.evidence.observation.effective.value,'original');assert.equal(r.evidence.loadedPresence,'present');assert.equal(r.provider.evidence.observation.overrideEvidence.availability,'unavailable');assert.ok(Object.isFrozen(r.provider.evidence.observation));assert.equal(Object.hasOwn(f.document,'id'),false);});
});

test("assistant fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:3});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("player fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:1});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("unknown fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:undefined});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("string role fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:'4'});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("higher role fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:5});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("null role fails before any settings access", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.user,'role',{value:null});let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("missing current cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.users.current=null;let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("stale current cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.users.set('gm',new f.core.User());let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("missing map member cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.users.delete('gm');let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("session mismatch cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.game.data.userId='other';let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("empty session ID cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.game.userId='';let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("document ID mismatch cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.user._id='other';let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("caller fixture replacement cannot authorize", async () => {
    await using((f,h)=>{bind(f,h);f.users.current={_id:'gm',role:4};let reads=0;Object.defineProperty(f.game,'settings',{get(){reads++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});
});

test("User document class substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);f.config.User.documentClass=class Other{};stopped(h.captureFoundryTrainerAdvancement());});
});

test("Users collection class substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);f.config.User.collection=class Other{};stopped(h.captureFoundryTrainerAdvancement());});
});

test("Setting document class substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);f.config.Setting.documentClass=class Other{};stopped(h.captureFoundryTrainerAdvancement());});
});

test("game prototype substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);Object.setPrototypeOf(f.game,{});stopped(h.captureFoundryTrainerAdvancement());});
});

test("users prototype substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);Object.setPrototypeOf(f.users,Map.prototype);stopped(h.captureFoundryTrainerAdvancement());});
});

test("native getter substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.core.Game.prototype,'user',{get(){return f.user;}});stopped(h.captureFoundryTrainerAdvancement());});
});

test("native values substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);f.core.WorldSettings.prototype.values=function(){return Map.prototype.values.call(this);};stopped(h.captureFoundryTrainerAdvancement());});
});

test("document identity shadow substitution is rejected", async () => {
    await using((f,h)=>{bind(f,h);Object.defineProperty(f.document,'id',{get(){throw Error('do not invoke');}});stopped(h.captureFoundryTrainerAdvancement());});
});

test("Setting CONFIG.collection is not a prerequisite", async () => {
    await using((f,h)=>{f.config.Setting.collection=null;bind(f,h);observed(h.captureFoundryTrainerAdvancement());});
});

test("ordinary zero loaded records never imply database absence or call getInvalid", async () => {
    await using((f,h)=>{f.world.clear();f.world.getInvalid=()=>{throw Error('prohibited');};bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.loadedPresence,'not-loaded');assert.equal(r.provider.issue,'presence-unestablished');assert.equal(r.provider.mapping,null);});
});

test("exactly 256 records complete both traversals", async () => {
    await using((f,h)=>{for(let i=1;i<256;i++)f.add('d'+i,'other.'+i,null,'"x"','x');bind(f,h);observed(h.captureFoundryTrainerAdvancement());});
});

test("257th record fields are not inspected", async () => {
    await using((f,h)=>{for(let i=1;i<256;i++)f.add('d'+i,'other.'+i,null,'"x"','x');let reads=0;const overflow=new Proxy({}, {get(){reads++;throw Error();},getOwnPropertyDescriptor(){reads++;throw Error();},getPrototypeOf(){reads++;throw Error();}});f.world.set('overflow',overflow);bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(r.reason,'membership-overflow');assert.equal(reads,0);});
});

test("duplicate object yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.world.set('other-slot',f.document);bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("duplicate ID yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.add('selected','other.key',null,'null',null);bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("duplicate exact world target yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.add('second',target,null,'null',null);bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("invalid loaded document yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.world.set('invalid',{});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("undefined world sentinel yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.document.user=undefined;bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("blank world sentinel yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.document.user='';bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("false world sentinel yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.document.user=false;bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("zero world sentinel yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.document.user=0;bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("object world sentinel yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{f.document.user=f.user;bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("missing record ID yields unknown rather than a selected fallback", async () => {
    await using((f,h)=>{delete f.document._id;bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("user-specific same key is not the world target", async () => {
    await using((f,h)=>{f.document.user='gm';f.document._source.user='gm';bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.loadedPresence,'not-loaded');});
});

test("throwing traversal is bounded and sanitized", async () => {
    await using((f,h)=>{f.core.WorldSettings.prototype.values=function(){throw new Error('PRIVATE DETAIL');};bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(JSON.stringify(r).includes('PRIVATE DETAIL'),false);});
});

test("incomplete custom iterator is bounded and sanitized", async () => {
    await using((f,h)=>{f.core.WorldSettings.prototype.values=function(){return {next(){return {done:false};}};};bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(JSON.stringify(r).includes('PRIVATE DETAIL'),false);});
});

test("malformed custom completion is bounded and sanitized", async () => {
    await using((f,h)=>{f.core.WorldSettings.prototype.values=function(){return {next(){return {done:'yes'};}};};bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(JSON.stringify(r).includes('PRIVATE DETAIL'),false);});
});

test("unrelated values and serialization hooks are never read", async () => {
    await using((f,h)=>{const other=f.add('private-id','private.key','private-user','"x"','x');let calls=0;Object.defineProperty(other,'value',{get(){calls++;throw Error();}});for(const object of [f.game,f.user,f.document,f.reg,other,f.document._source]){if(Object.isExtensible(object))Object.defineProperty(object,'toJSON',{value(){calls++;throw Error();}});}bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(calls,0);const raw=JSON.stringify(r);for(const text of ['private-id','private.key','private-user'])assert.equal(raw.includes(text),false);});
});

test("selected prepared accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.document,"value",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("selected source reference accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.document,"_source",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("registration default accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.reg,"default",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("registration choice accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.reg.choices,"original",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("record key accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.document,"key",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("record user accessor is rejected without calling it", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.document,"user",{get(){calls++;throw Error('private');}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("selected source accessor is rejected without invocation", async () => {
    await using((f,h)=>{let calls=0;f.document._source={_id:'selected',key:target,user:null};Object.defineProperty(f.document._source,'value',{get(){calls++;throw Error();}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("null versus null preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value=null;f.document.value=null;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"null");assert.equal(r.evidence.preparedValue,"null");assert.equal(r.provider.mapping,null);});
});

test("undefined versus undefined preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value=undefined;f.document.value=undefined;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"undefined");assert.equal(r.evidence.preparedValue,"undefined");assert.equal(r.provider.mapping,null);});
});

test("JSON null versus prepared null preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value='null';f.document.value=null;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"string");assert.equal(r.evidence.preparedValue,"null");assert.equal(r.provider.mapping,null);});
});

test("JSON false versus false preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value='false';f.document.value=false;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"string");assert.equal(r.evidence.preparedValue,"boolean");assert.equal(r.provider.mapping,null);});
});

test("JSON zero versus zero preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value='0';f.document.value=0;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"string");assert.equal(r.evidence.preparedValue,"number");assert.equal(r.provider.mapping,null);});
});

test("object source and prepared preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value={toJSON(){throw Error();}};f.document.value={toJSON(){throw Error();}};bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"unsupported");assert.equal(r.evidence.preparedValue,"unsupported");assert.equal(r.provider.mapping,null);});
});

test("non-finite numbers preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value=NaN;f.document.value=Infinity;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"unsupported-number");assert.equal(r.evidence.preparedValue,"unsupported-number");assert.equal(r.provider.mapping,null);});
});

test("negative zero preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value=-0;f.document.value=-0;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"unsupported-number");assert.equal(r.evidence.preparedValue,"unsupported-number");assert.equal(r.provider.mapping,null);});
});

test("oversize strings preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value='x'.repeat(4097);f.document.value='x'.repeat(4097);bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"oversize-string");assert.equal(r.evidence.preparedValue,"oversize-string");assert.equal(r.provider.mapping,null);});
});

test("symbol and bigint preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value=Symbol('private');f.document.value=1n;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"unsupported");assert.equal(r.evidence.preparedValue,"unsupported");assert.equal(r.provider.mapping,null);});
});

test("JSON object versus primitive preserves representation without manufacturing values", async () => {
    await using((f,h)=>{f.document._source.value='{}';f.document.value='original';bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,"string");assert.equal(r.evidence.preparedValue,"string");assert.equal(r.provider.mapping,null);});
});

test("missing source/prepared fields stay distinct from undefined", async () => {
    await using((f,h)=>{f.document._source={_id:'selected',key:target,user:null};delete f.document.value;bind(f,h);const r=h.captureFoundryTrainerAdvancement();observed(r);assert.equal(r.evidence.sourceValue,'missing');assert.equal(r.evidence.preparedValue,'missing');});
});

test("source metadata disagrees with selected document", async () => {
    await using((f,h)=>{f.document._source.user='other';bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});
});

test("addition drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.add('added','other',null,'null',null);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("removal drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.world.delete('selected');}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("replacement drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.world.set('selected',new f.core.Setting('selected'));}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("key drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document.key='other';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("user drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document.user='gm';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("id drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document._id='changed';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("raw value drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document._source.value='null';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("prepared value drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document.value='changed';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("source reference drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.document._source={...f.document._source};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("registration reference drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.settings.settings.set(target,{...f.reg});}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("registration field drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.reg.default='changed';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("world store drift discards target evidence", async () => {
    await using((f,h)=>{const replacement=new f.core.WorldSettings([['selected',f.document]]);let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.settings.storage.set('world',replacement);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("data object drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.data={userId:'gm'};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("game object drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){globalThis.game=Object.assign(new f.core.Game(),f.game);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("current replacement drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){const u=new f.core.User();f.users.set('gm',u);f.users.current=u;}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("role revocation drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){Object.defineProperty(f.user,'role',{value:3});}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("CONFIG replacement drift discards target evidence", async () => {
    await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){globalThis.CONFIG={...f.config};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});
});

test("membership reordering is conservatively changed", async () => {
    await using((f,h)=>{const other=f.add('other','other',null,'null',null);let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){this.delete('selected');this.set('selected',f.document);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.ok(other);});
});

test("final native getter role loss invalidates observation", async () => {
    await using((f,h)=>{let calls=0;Object.defineProperty(f.core.Game.prototype,'user',{get(){if(++calls===2)Object.defineProperty(f.user,'role',{value:3});return this.users.current;}});bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(r.status,'denied');assert.equal(calls,2);});
});

test("hostile thrown value is not inspected or serialized", async () => {
    await using((f,h)=>{let calls=0;const thrown=new Proxy({}, {getPrototypeOf(){calls++;throw Error();},get(){calls++;throw Error();}});f.core.WorldSettings.prototype.values=function(){throw thrown;};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});
});

test("trusted bootstrap cannot be rebound and performs no global observation", async () => {
    await using((f,h)=>{Object.defineProperty(globalThis,'game',{configurable:true,get(){throw Error();}});bind(f,h);assert.equal(h.bindTrainerAdvancementFoundryHost(f.core).status,'unsupported');});
});

test("bootstrap rejects accessor-supplied core class without invoking it", async () => {
    await using((f,h)=>{let reads=0;Object.defineProperty(f.core,'User',{get(){reads++;throw Error();}});assert.equal(h.bindTrainerAdvancementFoundryHost(f.core).status,'unsupported');assert.equal(reads,0);});
});

test("settings manager reference drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.settings=new f.core.ClientSettings(f.world);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("storage container reference drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.settings.storage=new Map([['world',f.world]]);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("registration map reference drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.settings.settings=new Map([[target,f.reg]]);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("registration choices reference drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.reg.choices={...f.reg.choices};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("registration choice label drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.reg.choices.original='changed label';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("users collection reference drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.users=new f.core.Users(f.user);}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("world session ID drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.data.userId='changed';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("current user ID drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.game.userId='changed';}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("CONFIG User container drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.config.User={...f.config.User};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("CONFIG Setting container drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){f.config.Setting={...f.config.Setting};}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("prototype path during observation drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){Object.defineProperty(f.core.Game.prototype,'user',{get(){return this.users.current;}});}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("prepared field presence drift discards target evidence", async () => {await using((f,h)=>{let passes=0;f.core.WorldSettings.prototype.values=function(){if(++passes===2){delete f.document.value;}return Map.prototype.values.call(this);};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(passes,2);});});

test("object-shaped storage substitute fails before selected values", async () => {await using((f,h)=>{f.game.settings.storage={world:f.world};let reads=0;Object.defineProperty(f.document,'value',{get(){reads++;throw Error();}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(reads,0);});});

test("misleading own storage.world is not used", async () => {await using((f,h)=>{f.game.settings.storage.world=f.world;bind(f,h);const r=h.captureFoundryTrainerAdvancement();stopped(r);assert.equal(r.reason,'unsupported-map-binding');});});

test("shadowed storage get is rejected without invocation", async () => {await using((f,h)=>{let calls=0;f.game.settings.storage.get=()=>{calls++;return f.world;};bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});});

test("storage lookup accessor is rejected without invocation", async () => {await using((f,h)=>{let calls=0;Object.defineProperty(f.game.settings.storage,'get',{get(){calls++;return Map.prototype.get;}});bind(f,h);stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);});});

test("missing world Map entry does not use registration defaults", async () => {await using((f,h)=>{f.game.settings.storage.delete('world');bind(f,h);stopped(h.captureFoundryTrainerAdvancement());});});

test("iterator next function changed after binding is rejected and restored", async () => {await using((f,h)=>{bind(f,h);const p=Object.getPrototypeOf(new Map().values()),d=Object.getOwnPropertyDescriptor(p,'next');let calls=0;try{Object.defineProperty(p,'next',{...d,value(){calls++;throw Error('unexpected');}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);}finally{Object.defineProperty(p,'next',d);}observed(h.captureFoundryTrainerAdvancement());});});

test("iterator next accessor changed after binding is rejected without invocation", async () => {await using((f,h)=>{bind(f,h);const p=Object.getPrototypeOf(new Map().values()),d=Object.getOwnPropertyDescriptor(p,'next');let calls=0;try{Object.defineProperty(p,'next',{configurable:d.configurable,enumerable:d.enumerable,get(){calls++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);}finally{Object.defineProperty(p,'next',d);}observed(h.captureFoundryTrainerAdvancement());});});

test("iterator next mutation during values is rejected and restored", async () => {await using((f,h)=>{const p=Object.getPrototypeOf(new Map().values()),d=Object.getOwnPropertyDescriptor(p,'next');let calls=0;f.core.WorldSettings.prototype.values=function(){Object.defineProperty(p,'next',{...d,value(){calls++;throw Error();}});return Map.prototype.values.call(this);};bind(f,h);try{stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);}finally{Object.defineProperty(p,'next',d);}});});

test("final qualification detects iterator next changed by final authority path", async () => {await using((f,h)=>{const p=Object.getPrototypeOf(new Map().values()),d=Object.getOwnPropertyDescriptor(p,'next');let calls=0;Object.defineProperty(f.core.Game.prototype,'user',{get(){if(++calls===2)Object.defineProperty(p,'next',{...d,value(){throw Error();}});return this.users.current;}});bind(f,h);try{stopped(h.captureFoundryTrainerAdvancement());}finally{Object.defineProperty(p,'next',d);}});});

test("Map get prototype substitution is rejected rather than bypassed", async () => {await using((f,h)=>{bind(f,h);const d=Object.getOwnPropertyDescriptor(Map.prototype,'get');let calls=0;try{Object.defineProperty(Map.prototype,'get',{...d,value(){calls++;throw Error();}});stopped(h.captureFoundryTrainerAdvancement());assert.equal(calls,0);}finally{Object.defineProperty(Map.prototype,'get',d);}observed(h.captureFoundryTrainerAdvancement());});});
