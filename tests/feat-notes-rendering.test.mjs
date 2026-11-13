import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Handlebars from 'handlebars';
import {prerequisiteView} from '../src/util/acquisition.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const template = await read('static/templates/item/feat-sheet.hbs');
const diagnosticPartial = await read('static/templates/partials/prerequisite-diagnostics.hbs');
const locale = JSON.parse(await read('static/lang/en.json'));
const draft = JSON.parse(await read('docs/data/rule-version-echoes-draft.json'));
const readiness = await read('docs/validation/p05-echoes-readiness.md');
const contextNote = readiness.match(/^> (Researcher[^\r\n]+)$/m)?.[1];
assert.ok(contextNote, 'Use the accepted recommendation as detached fixture text.');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function freeze(value) {
    if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
    return value;
}
function renderer(notesLabel = locale.ITEM.Notes) {
    const engine = Handlebars.create(), calls = [];
    engine.registerHelper('localize', key => {
        calls.push(key);
        return key === 'ITEM.Notes' ? notesLabel : key.split('.').reduce((v,k)=>v?.[k],locale) ?? key;
    });
    engine.registerHelper('json', value => JSON.stringify(value));
    engine.registerHelper('checked', value => value ? 'checked' : '');
    engine.registerPartial('systems/ptu/static/templates/partials/prerequisite-diagnostics.hbs', diagnosticPartial);
    // The unrelated rule-editor panel is outside overview rendering coverage.
    // The actual advisory partial and whole Feature template are compiled unchanged.
    engine.registerPartial('systems/ptu/static/templates/partials/rules/rule-partial.hbs', '');
    return {render:engine.compile(template), calls};
}
function fixture(index, notes, editLocked = true) {
    const row = draft.roles[index], item = structuredClone(row.item);
    item._id = row.proposedIdentity.itemId;
    item.flags = {ptu:{selectedVersion:{id:row.proposedIdentity.versionId,label:`${row.source.edition} (render fixture)`}},user:{note:'Preserve custom data'}};
    if (notes === undefined) delete item.system.notes; else item.system.notes = notes;
    let updates = 0;
    item.update = () => {updates++; throw Error('Rendering must never update an Item.');};
    const actor = {system:{skills:{generalEd:{value:{total:2}}}},items:[]};
    const data = {item, actor, name:item.name, data:{img:'icons/svg/item-bag.svg'}, editable:!editLocked, editLocked,
        itemEffect:item.system.effect, referenceEffect:null, prerequisiteViews:[prerequisiteView(item,actor)]};
    return {data, row, updates:()=>updates};
}
function decode(text) {
    return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => entity[0] === '#'
        ? String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase()==='x'?2:1),entity[1].toLowerCase()==='x'?16:10))
        : ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[entity]);
}
function notesSection(html) {
    const section = html.match(/<section\b[^>]*class="feature-notes"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(section, 'The rendered overview must contain a separate Notes section.');
    const body = section[1].match(/<div\b([^>]*class="feature-notes-text"[^>]*)>([\s\S]*?)<\/div>/);
    assert.ok(body, 'Notes must be rendered as their own text content.');
    return {html:section[0], text:decode(body[2]), bodyAttributes:body[1]};
}
const mechanics = html => html.match(/<div class="move-effect">([\s\S]*?)<\/div>/)?.[1];
function rawPrerequisites(html) {
    const input = html.match(/<input\b[^>]*name="system.prerequisites"[^>]*value="([^"]*)"/);
    assert.ok(input);
    return JSON.parse(decode(input[1]));
}

for (let index=0;index<2;index++) for (const editLocked of [true,false]) {
    test(`actual ${index?'May':'core'} template shows supplied context in a read-only Notes section (${editLocked?'locked view':'editable view'})`, () => {
        const f=fixture(index,contextNote,editLocked), before=hash(f.data), originalDraft=hash(draft), r=renderer();
        freeze(f.data);
        const html=r.render(f.data), section=notesSection(html);
        assert.equal(section.text,contextNote);
        assert.match(section.html,/<h3>Notes<\/h3>/);
        assert.ok(r.calls.includes('ITEM.Notes'));
        assert.ok(html.indexOf('class="feature-notes"')>html.indexOf('class="move-effect"'));
        assert.ok(html.indexOf('class="feature-notes"')<html.indexOf('class="tab details'));
        assert.doesNotMatch(section.html,/<(?:input|textarea|button|select|a|form)\b|\bdata-edit\s*=/i);
        assert.equal(mechanics(html),f.row.item.system.effect);
        assert.deepEqual(rawPrerequisites(html),f.row.item.system.prerequisites);
        assert.equal(hash(f.data),before); assert.equal(hash(draft),originalDraft); assert.equal(f.updates(),0);
    });
}

for (const [label,notes] of [['missing',undefined],['empty',''],['null',null]]) {
    test(`actual template hides the Notes section for ${label} notes`, () => {
        const f=fixture(0,notes), before=hash(f.data), r=renderer(), html=r.render(freeze(f.data));
        assert.doesNotMatch(html,/class="feature-notes(?:-text)?"/);
        assert.equal(r.calls.includes('ITEM.Notes'),false);
        assert.equal(mechanics(html),f.row.item.system.effect); assert.equal(hash(f.data),before); assert.equal(f.updates(),0);
    });
}

test('ordinary custom notes show exactly their own text without manufactured Researcher/manual facts', () => {
    const text='A custom reminder for this character.', f=fixture(1,text), html=renderer().render(f.data), section=notesSection(html);
    assert.equal(section.text,text); assert.doesNotMatch(section.html,/Choose two Fields|unverified\/manual/);
    assert.equal(mechanics(html),f.row.item.system.effect);
});

test('actual rendering preserves multiline Unicode notes and declares wrapping without changing the data', () => {
    const text='First line\nPokémon — 第二行\r\n  Indented third line', f=fixture(0,text), before=hash(f.data);
    const section=notesSection(renderer().render(freeze(f.data)));
    assert.equal(section.text,text);
    assert.match(section.bodyAttributes,/white-space:\s*pre-wrap/);
    assert.match(section.bodyAttributes,/overflow-wrap:\s*anywhere/);
    assert.equal(hash(f.data),before); assert.equal(f.updates(),0);
});

test('long unbroken text remains complete and uses the same wrapping presentation', () => {
    const text='LongUnbrokenReminder'.repeat(600)+'\nEnd of note.', f=fixture(1,text);
    const section=notesSection(renderer().render(f.data));
    assert.equal(section.text,text); assert.match(section.bodyAttributes,/overflow-wrap:\s*anywhere/);
    assert.doesNotMatch(section.html,/text-overflow:\s*ellipsis/);
});

test('HTML-like note content renders as literal escaped text, never active elements or event attributes', () => {
    const text='<img src=x onerror="alert(1)"><script>alert(2)</script></div><a href="javascript:alert(3)">x</a> & \' " ` =', f=fixture(0,text);
    const html=renderer().render(f.data), section=notesSection(html);
    assert.equal(section.text,text);
    assert.doesNotMatch(section.html,/<(?:img|script|a|iframe|svg)\b|\bonerror\s*=\s*["']/i);
    assert.match(section.html,/&lt;img/); assert.match(section.html,/&quot;/);
    assert.equal(mechanics(html),f.row.item.system.effect); assert.equal(f.updates(),0);
});

test('existing Notes localization is used for heading and accessible label', () => {
    const f=fixture(1,'A note'), r=renderer('Fixture Notes Label'), section=notesSection(r.render(f.data));
    assert.match(section.html,/aria-label="Fixture Notes Label"/);
    assert.match(section.html,/<h3>Fixture Notes Label<\/h3>/);
    assert.equal(r.calls.filter(x=>x==='ITEM.Notes').length,2);
});

test('raw and advisory prerequisites remain separate from supplied parent context for both actual versions', () => {
    for (let index=0;index<2;index++) {
        const f=fixture(index,contextNote), view=f.data.prerequisiteViews[0], html=renderer().render(f.data), section=notesSection(html);
        assert.equal(section.text,contextNote); assert.equal(view.report.advisory,true);
        assert.deepEqual(view.report.rawRequirements,f.row.item.system.prerequisites);
        assert.equal(view.report.unmet.length,1); assert.equal(view.report.unverifiable.length,index?1:0);
        assert.ok(html.includes(`data-prerequisite-item-id="${f.row.proposedIdentity.itemId}"`));
        assert.ok(html.includes('Game-rule prerequisites are advisory.'));
        assert.doesNotMatch(section.html,/data-prerequisite-item-id|prerequisites-unmet|prerequisites-unverifiable/);
        if(index)assert.ok(html.includes('Breadth of Knowledge'));
        assert.deepEqual(rawPrerequisites(html),f.row.item.system.prerequisites);
        assert.equal(f.data.item.flags.ptu.grantedBy,undefined); assert.equal(f.data.item.flags.ptu.itemGrants,undefined);
    }
});

test('actual template AST binds notes only to an escaped output inside a simple existence block', () => {
    const ast=Handlebars.parse(template), blocks=[], outputs=[];
    function visit(value) {
        if(!value||typeof value!=='object')return;
        if(value.type==='BlockStatement'&&value.params?.[0]?.original==='item.system.notes')blocks.push(value);
        if(value.type==='MustacheStatement'&&value.path?.original==='item.system.notes')outputs.push(value);
        Object.values(value).forEach(child=>Array.isArray(child)?child.forEach(visit):visit(child));
    }
    visit(ast);
    assert.equal(blocks.length,1); assert.equal(blocks[0].path.original,'if'); assert.equal(blocks[0].inverse,undefined);
    assert.equal(outputs.length,1); assert.equal(outputs[0].escaped,true);
});
