import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRecordSourceReview,sourceReviewWords,sourceReviewText} from '../tools/record-source-review.mjs';
import {checkItemSourceReview,itemDefinitionEffect,itemSourceWords} from '../tools/item-source-review.mjs';

const base = await loadRecordSourceReview();
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textHash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,canonical(v)])) : value;
const equal = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const words = value => itemSourceWords(value,sourceReviewWords);
function errors(bundle) {
    const errors = [], rows = new Map(Object.values(bundle.files).flatMap(f => f.records).map(r => [r.identity,r]));
    checkItemSourceReview(bundle,{fail:(ok,message) => {if (!ok) errors.push(message);},rows,actualMap:new Map(bundle.source.rows.map(r => [r.identity,r])),hash,equal,textHash,normalizedText:sourceReviewWords,cleanText:sourceReviewText,citations:() => {}});
    return errors;
}
function mutated(change) {const b = structuredClone(base);change(b);return errors(b);}
const units = new Map(base.itemSource.sourceDefinitions.map(u => [u.id,u]));
const file = 'record-source-review/capabilities.json';
const row = id => base.files[file].records.find(r => r.identity === `capabilities.${id}`);

test('all frozen E2a records have substantive source evidence with bounded correspondence counts',() => {
    assert.deepEqual(errors(base),[]);
    assert.equal(base.files[file].records.length,143);
    assert.deepEqual(base.itemSource.completedSlices.E2a.counts,{unresolved:78,reviewed:65});
});
test('PDF line-wrap repair preserves compound Type boundaries and signed numeric facts',() => {
    assert.equal(words('Ice-\nTyped'),words('Ice-Typed'));
    assert.notEqual(words('+4 Evasion'),words('-4 Evasion'));
    assert.notEqual(words('125%'),words('25%'));
    assert.notEqual(words('1/2 Focus'),words('2 Focus'));
    assert.equal(words('same\\ncondition'),words('same\ncondition'));
});
test('Living Weapon retains the entire next-page movement/action/rank continuation',() => {
    const u = units.get('core:305:capability-livingweapon');
    assert.deepEqual(u.anchors.map(a => a.pdfPage),[305,306]);
    assert.match(u.effect,/total amount Shifted/);
    assert.match(u.effect,/requisite Combat Skill Rank/);
    assert.match(u.effect,/Swift Action/);
    assert.match(u.effect,/cannot benefit from its No Guard/);
    assert.equal(row('TWMWSGsosGFwe02z').coverageState,'unresolved');
});
test('Pack Mon and Sprouter keep real continuation tails instead of page truncations',() => {
    assert.deepEqual(units.get('core:306:capability-packmon').anchors.map(a => a.pdfPage),[306,307]);
    assert.match(units.get('core:306:capability-packmon').effect,/may attack if it does not/);
    assert.deepEqual(units.get('core:307:capability-sprouter').anchors.map(a => a.pdfPage),[307,308]);
    assert.match(units.get('core:307:capability-sprouter').effect,/Berries to instantly give yield/);
});
test('Multiform uses the exact standalone note rather than the earlier capability-list occurrence',() => {
    for (const book of ['old-dex','plus-dex']) {
        const u = units.get(`${book}:724:capability-multiform`);
        assert.match(itemDefinitionEffect(u),/^Deoxys may change/);
        assert.doesNotMatch(u.effect,/Skill List|TM\/HM Move List|Leer/);
    }
    assert.match(units.get('old-dex:724:capability-multiform').effect,/four forms/);
    assert.doesNotMatch(units.get('plus-dex:724:capability-multiform').effect,/four forms/);
});
test('identical Origin Forme headings keep distinct species and item/action conditions',() => {
    assert.match(units.get('old-dex:740:capability-originforme').effect,/Reverse World/);
    assert.match(units.get('hisui:27:capability-dialgaoriginforme').effect,/Adamant Crystal/);
    assert.match(units.get('hisui:28:capability-palkiaoriginforme').effect,/Lustrous Globe/);
    assert.equal(row('aJkDk9xPLVyxdQ2u').coverageState,'unresolved');
});
test('February capabilities retain optional-playtest authority',() => {
    const optional = base.itemSource.sourceDefinitions.filter(u => u.id.startsWith('feb:'));
    assert.equal(optional.length,3);
    assert.ok(optional.every(u => u.sourceKind === 'optional-playtest' && equal(u.source.pdfPages,[14])));
});
test('core and F&S versions retain distinct IDs and explicit Loyalty/Spirit limits',() => {
    assert.equal(row('AwHMDdbqCI2nugGD').coverageState,'reviewed');
    assert.equal(row('kRSSXHrlw9CbaRRt').coverageState,'unresolved');
    assert.match(row('AwHMDdbqCI2nugGD').fieldReview.find(f => f.field === 'system.effect').recordValue,/Loyalty/);
    assert.match(row('kRSSXHrlw9CbaRRt').fieldReview.find(f => f.field === 'system.effect').recordValue,/less spirit/);
});
test('same-ID export evidence preserves the Coin Collector uncovered1–6 range',() => {
    const e = base.itemSource.currentRecordAudit['capabilities.5hsha8xM8X5twsle'];
    assert.match(e.exportLineage.snapshots[0].historicalNormativeValues.effect,/1-12/);
    assert.match(row('5hsha8xM8X5twsle').fieldReview.find(f => f.field === 'system.effect').recordValue,/7-12/);
    assert.match(e.interpretation,/leaves1–6 undefined/);
    assert.equal(row('5hsha8xM8X5twsle').coverageState,'unresolved');
});
test('copied robot framework paragraphs do not collapse two stable capability IDs',() => {
    for (const id of ['qFAC8MRGkTYwKXOn','v9cqvYbgXApfw0gb']) {
        assert.equal(row(id).coverageState,'unresolved');
        assert.ok(row(id).sourceComparison.candidateDefinitions.some(c => c.sourceUnit === 'porygon:52:capability-pokebot'));
    }
    assert.match(units.get('porygon:52:capability-pokebot').effect,/never add STAB/);
});
test('a changed UUID path is rejected even when the same true target still exists',() => {
    const result = mutated(b => {b.itemSource.currentRecordAudit['capabilities.6sANE4BU79H8FAUR'].references[0].path = '$.system.effect';});
    assert.ok(result.some(e => e.includes('exact UUID path')));
});
test('target numeric rules are examined independently of a matching target UUID/hash declaration',() => {
    const result = mutated(b => {b.source.rows.find(r => r.identity === 'effects.NLLlGOUIm42a4Ifr').data.system.rules[1].value = -4;});
    assert.ok(result.some(e => e.includes('target evidence')));
});
test('adding Toxic Thread cannot be blessed by rewriting the candidate exact-match declaration',() => {
    const result = mutated(b => {
        const id = 'capabilities.FgI0NCLyoQbTmVvh', r = b.files[file].records.find(r => r.identity === id), a = b.itemSource.currentRecordAudit[id];
        r.sourceComparison.candidateDefinitions[0].exactOrderedWords = true;
        a.candidateDefinitions[0].exactOrderedWords = true;
    });
    assert.ok(result.some(e => e.includes('candidate definition/word comparison')));
});
test('empty effects and finite no-hit locators cannot become a source absence claim',() => {
    const result = mutated(b => {b.itemSource.currentRecordAudit['capabilities.1k7NbjmcutJ3XJSj'].finiteSourceSearch.sourceAbsenceClaim = true;});
    assert.ok(result.some(e => e.includes('finite locators')));
});
test('current claim summaries cannot omit a cost/condition number while the current field remains elsewhere',() => {
    const result = mutated(b => {
        const r = b.files[file].records.find(r => r.identity === 'capabilities.AuEP6rvUEPPBwEXX');
        r.sourceComparison.currentClaims[2].text = 'A Spiritomb may then freely teleport.';
    });
    assert.ok(result.some(e => e.includes('numeric/conditional claims incomplete')));
});
