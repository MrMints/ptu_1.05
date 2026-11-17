import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {prerequisiteView} from '../src/util/acquisition.js';
import {SKILLS} from '../src/util/skills.js';

// Load unchanged production class bodies; replace ESM linkage and Foundry services,
// not the icon helper, sheet getData, or Actor notification/rerender methods.
async function load(path, name, globals) {
    const source = (await readFile(new URL(`../${path}`, import.meta.url), 'utf8'))
        .replace(/^import .*;?\r?\n/gm, '').replace(/^export /gm, '')
        .replace(/^\{ PTUItem, PTUItemProxy \}\s*$/gm, '');
    return vm.runInNewContext(`${source}\n${name}`, {console, ...globals}, {filename:path});
}
const plain = value => JSON.parse(JSON.stringify(value));
const duplicate = value => structuredClone(value?.toObject ? value.toObject() : value);
const defaultIcon = '/systems/ptu/static/css/images/icons/feat_icon.png';
const contextNote = 'Researcher context only; parent selection remains manual.';

async function harness({editable=true, aliased=false, img='icons/svg/item-bag.svg', rules=[]}={}) {
    const writes = [], pending = [], renders = [], forms = [], enrichments = [];
    const game = {combat:null, i18n:{localize:key=>key}};
    class CoreItem {
        constructor(source, actor) {this._source=duplicate(source); this.actor=actor; this.apps={}; this.rules=[];}
        get id() {return this._source._id;}
        get _id() {return this.id;}
        get uuid() {return `${this.actor.uuid}.Item.${this.id}`;}
        get type() {return this._source.type;}
        get name() {return this._source.name;}
        get img() {return this._source.img;}
        get flags() {return this._source.flags;}
        get system() {return this._source.system;}
        getFlag(scope, key) {return this.flags[scope]?.[key];}
        toObject() {return duplicate(this._source);}
        update(change) {
            writes.push({id:this.id, change:duplicate(change)});
            // The real helper's fire-and-forget update must be observed to completion.
            const operation=Promise.resolve().then(()=>Object.assign(this._source, duplicate(change)));
            pending.push(operation);
            return operation;
        }
    }
    class CoreActor {
        _onUpdate() {}
        _onUpdateDescendantDocuments() {}
        _onCreateDescendantDocuments() {}
        _onDeleteDescendantDocuments() {}
        update(change) {writes.push({actor:true, change:duplicate(change)}); return Promise.resolve();}
    }
    class CoreSheet {
        async getData() {
            return {item:aliased ? this.item : this.item.toObject(),
                data:aliased ? this.item._source : this.item.toObject(), editable:this.isEditable};
        }
        render(force) {
            renders.push({id:this.item.id, force});
            const operation=this.getData().then(data=>{this.view=data;});
            pending.push(operation);
            return this;
        }
    }
    class RuleForm {
        constructor(options) {this.options=options; forms.push(this);}
        async render() {return `<section>${this.options.rule.key}</section>`;}
    }
    const foundry = {appv1:{sheets:{ItemSheet:CoreSheet}}, utils:{duplicate, mergeObject:(a,b)=>({...a,...b})},
        applications:{ux:{TextEditor:{implementation:{enrichHTML:async text=>{enrichments.push(text); return text;}}}}}};
    const globals = {foundry, game, CONFIG:{PTU:{data:{}}}, prerequisiteView,
        RuleElements:{all:{SyntheticRule:{}}}, RULE_ELEMENT_FORMS:{}, RuleElementForm:RuleForm, sortStringRecord:o=>o};
    const ItemClass=await load('src/module/item/base.js', 'PTUItem', {...globals, Item:CoreItem});
    const ActorClass=await load('src/module/actor/base.js', 'PTUActor', {...globals, Actor:CoreActor});
    const Sheet=await load('src/module/item/sheet/sheet.js', 'PTUItemSheet', globals);
    const actor=Object.create(ActorClass.prototype);
    actor.uuid='Actor.actor00000000001'; actor.flags={custom:{keep:true}};
    actor.system={skills:Object.fromEntries(Object.keys(SKILLS).map(key=>[key,{value:{total:2}}]))};
    const source=id=>({_id:id, type:'feat', name:'Custom owned name', img,
        flags:{ptu:{selectedVersion:{id:'custom-version',label:'Saved version'}},custom:{keep:'flag'}},
        system:{prerequisites:['Master Focus','Custom condition'],rules:duplicate(rules),effect:'Selected effect',
            referenceEffect:'Item.reference0000001',notes:contextNote,enabled:false,free:true,uses:{value:1,max:2},
            custom:{keep:['subchoice']}}});
    const item=new ItemClass(source('item000000000001'),actor), sibling=new ItemClass(source('item000000000002'),actor);
    actor.items=[item,sibling];
    const makeSheet=document=>{
        const sheet=new Sheet(); sheet.item=sheet.object=document; sheet.isEditable=editable; sheet.rendered=true;
        document.apps.sheet=sheet; return sheet;
    };
    const sheet=makeSheet(item), siblingSheet=makeSheet(sibling);
    const snapshot=()=>duplicate({actor:{uuid:actor.uuid,flags:actor.flags,system:actor.system},
        items:actor.items.map(item=>({uuid:item.uuid,source:item.toObject()}))});
    async function settle() {
        let completed=0;
        while(completed<pending.length) {const batch=pending.slice(completed); completed=pending.length; await Promise.all(batch);}
        await Promise.resolve();
        assert.equal(completed,pending.length,'All queued renders and document updates completed.');
    }
    return {actor,item,sibling,sheet,siblingSheet,writes,renders,forms,enrichments,snapshot,settle,game};
}

for (const editable of [true,false]) for (const aliased of [false,true]) {
    for (const img of ['icons/svg/item-bag.svg','icons/svg/mystery-man.svg','custom/owned.webp']) {
        test(`initial and repeated renders are pure: editable=${editable}, aliased=${aliased}, icon=${img}`,async()=>{
            const h=await harness({editable,aliased,img}), before=h.snapshot();
            const first=await h.sheet.getData(); await h.settle();
            const second=await h.sheet.getData(); await h.settle();
            assert.equal(h.writes.length,0,`Real icon helper attempted persistent updates: ${JSON.stringify(h.writes)}`);
            assert.deepEqual(h.snapshot(),before,'Owned Item, sibling and Actor state must remain identical.');
            const expected=editable && img.startsWith('icons/svg/') ? defaultIcon : img;
            assert.equal(first.item.img,expected); assert.equal(first.data.img,expected);
            assert.deepEqual(plain(second),plain(first));
            assert.notEqual(first.item,h.item); assert.notEqual(first.item.system,h.item.system);
            assert.notEqual(first.data,h.item._source);
            // Token-panel defaults belong to presentation only, even when core input aliases a Document.
            assert.equal(first.item.flags.ptu.showInTokenPanel,true);
            first.item.system.custom.keep.push('presentation edit'); first.data.flags.custom.keep='presentation edit';
            assert.deepEqual(h.snapshot(),before);
        });
    }
}

for (const open of [true,false]) for (const aliased of [false,true]) {
    test(`actual descendant callback preserves sibling/source state: open=${open}, aliased=${aliased}`,async()=>{
        const h=await harness({aliased}); h.sheet.rendered=false; h.siblingSheet.rendered=open;
        const before=h.snapshot(); assert.equal(h.game.combat,null,'Explicitly out of combat; initiative is not exercised.');
        for(let i=0;i<2;i++) {
            h.actor._onUpdateDescendantDocuments(h.actor,'items',[h.item],[{}],{},'synthetic-user');
            await h.settle();
        }
        assert.equal(h.renders.length,open?2:0); assert.ok(h.renders.every(r=>r.id===h.sibling.id&&r.force===false));
        assert.equal(h.writes.length,0,`Open sibling reached real persistent icon path: ${JSON.stringify(h.writes)}`);
        assert.deepEqual(h.snapshot(),before);
        if(open)assert.equal(h.siblingSheet.view.data.img,defaultIcon);
    });
}

test('actual Actor skill changes still refresh itemized unmet/custom diagnostics without secondary writes',async()=>{
    const h=await harness({aliased:true}); h.sheet.rendered=false;
    h.actor._onUpdateDescendantDocuments(h.actor,'items',[h.item],[{}],{},'synthetic-user'); await h.settle();
    const first=h.siblingSheet.view.prerequisiteViews[0];
    assert.equal(first.report.advisory,true); assert.equal(first.report.unmet[0].raw,'Master Focus');
    assert.equal(first.report.unverifiable[0].raw,'Custom condition');
    assert.equal(first.report.identity.id,h.sibling.id);
    // Simulate an already-authorized external change before notifying the actual Actor callback.
    h.actor.system.skills.focus.value.total=6; const afterSkillChange=h.snapshot();
    h.actor._onUpdate({system:{skills:{focus:{value:{total:6}}}}},{},'synthetic-user'); await h.settle();
    const second=h.siblingSheet.view.prerequisiteViews[0];
    assert.equal(second.report.unmet.length,0); assert.equal(second.report.satisfied[0].raw,'Master Focus');
    assert.equal(second.report.unverifiable[0].raw,'Custom condition');
    assert.equal(first.report.unmet.length,1,'The earlier detached report remains unchanged.');
    assert.equal(h.writes.length,0); assert.deepEqual(h.snapshot(),afterSkillChange);
});

test('rule forms, effect enrichment and separate source-context notes survive pure rendering',async()=>{
    const rules=[{key:'SyntheticRule',value:3},{key:'UnknownRule',custom:{keep:true}}];
    const h=await harness({rules,aliased:true}), before=h.snapshot(), data=await h.sheet.getData(); await h.settle();
    assert.equal(data.item.system.notes,contextNote); assert.equal(data.itemEffect,'Selected effect');
    assert.equal(data.referenceEffect,'@UUID[Item.reference0000001]');
    assert.ok(h.enrichments.every(text=>!text.includes(contextNote)));
    assert.deepEqual(plain(data.rules.elements.map(row=>row.rule)),rules);
    assert.equal(h.forms.length,2); assert.equal(h.forms[0].options.item,h.item);
    assert.equal(h.forms[1].options.index,1); assert.equal(data.rules.elements[1].template,'<section>UnknownRule</section>');
    assert.equal(h.writes.length,0); assert.deepEqual(h.snapshot(),before);
});
