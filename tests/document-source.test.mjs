import test from 'node:test';
import assert from 'node:assert/strict';
import {getDocumentSourceId, createCompendiumRefreshUpdate} from '../src/util/document-source.js';

test('current core identity wins over legacy provenance without mutating either field', () => {
    const data = {_stats:{compendiumSource:'Compendium.custom.items.Item.0123456789abcdef'},flags:{core:{sourceId:'Compendium.ptu.items.oldoldoldoldoldo'}}};
    const before = structuredClone(data);
    assert.equal(getDocumentSourceId(data), data._stats.compendiumSource);
    assert.deepEqual(data, before);
});

test('legacy identities remain supported; labels and duplicate/export sources never supply identity', () => {
    assert.equal(getDocumentSourceId({flags:{core:{sourceId:'Item.0123456789abcdef'}}}), 'Item.0123456789abcdef');
    assert.equal(getDocumentSourceId({_stats:{compendiumSource:null},flags:{core:{sourceId:'Compendium.ptu.edges.0123456789abcdef'}}}), 'Compendium.ptu.edges.0123456789abcdef');
    assert.equal(getDocumentSourceId({name:'A known item',system:{slug:'known-item'},_stats:{duplicateSource:'Compendium.ptu.items.0123456789abcdef'}}), undefined);
    assert.equal(getDocumentSourceId({}), undefined);
});

test('refresh preserves zero quantity, disabled state, custom image, metadata, flags and identity', () => {
    const current={_id:'owned-id',name:'Custom label',type:'item',img:'custom.png',system:{quantity:0,enabled:false,description:'old'},flags:{custom:{selection:2}},_stats:{compendiumSource:'original'}};
    const latest={_id:'source-id',name:'Source label',type:'item',img:'source.png',system:{quantity:1,enabled:true,description:'new'},flags:{},_stats:{compendiumSource:'historical'}};
    const before=[structuredClone(current),structuredClone(latest)];
    const updates=createCompendiumRefreshUpdate(current,latest);
    assert.deepEqual(updates,{img:'custom.png',system:{quantity:0,enabled:false,description:'new'}});
    assert.deepEqual([current,latest],before);
    assert.deepEqual(Object.keys(updates).sort(),['img','system']);
    const repeated=createCompendiumRefreshUpdate({...current,...updates},latest);
    assert.deepEqual(repeated,updates);
});

test('refresh updates default SVG images and rejects a source of the wrong type', () => {
    const current={type:'feat',img:'default.svg',system:{enabled:true}};
    const latest={type:'feat',img:'source.png',system:{enabled:false,rules:[]}};
    assert.equal(createCompendiumRefreshUpdate(current,latest,'default.svg').img,'source.png');
    assert.equal(createCompendiumRefreshUpdate({...current,img:'custom.svg'},latest,'default.svg').img,'custom.svg');
    assert.throws(()=>createCompendiumRefreshUpdate(current,{...latest,type:'move'}),/type must match/);
});
