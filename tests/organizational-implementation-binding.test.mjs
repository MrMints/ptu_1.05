import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {organizationalImplementationBindingErrors as errors, loadOrganizationalSourceReview} from '../tools/organizational-source-review.mjs';
import {G_IMPLEMENTATION_PATHS} from '../tools/organizational-source-derivation.mjs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const audit=JSON.parse(read('docs/data/organizational-source-evidence-g.json'));
const transition=JSON.parse(read('docs/data/g-implementation-binding-transition.json'));
const path='src/module/apps/npc-quick-build/document.js';
const frozen=audit.implementationContexts.find(code=>code.path===path);
const current=read(path).replace(/\r\n/g,'\n');
const hash=text=>createHash('sha256').update(text).digest('hex');
const semantic=value=>hash(JSON.stringify(value));
const clone=value=>structuredClone(value);
const check=(code=frozen,text=current,record=transition)=>errors(code,text,record);
const part=(text,start,end)=>text.split('\n').slice(start-1,end).join('\n');

test('exact archived6fc4bd55 predecessor and pinned2e16908e successor preserve the frozen G excerpt',()=>{
    assert.equal(semantic(transition),'1b0e4a3ebe3c2ceaa25b6ce6b1355629f24b58b0a6948ed10662840ffe25e9eb');
    assert.equal(transition.predecessor.revision,'6fc4bd55ac33843895ed09df46a50fa13d43439e');
    assert.equal(transition.successor.revision,'2e16908ea5c349d5376c2adc8e24c6e4ad51041a');
    assert.equal(hash(transition.predecessor.canonicalLfText),'e8992f5a19165b025c64a7366afcb584b0e2e367174657cc3ca6379a959c97e4');
    assert.equal(hash(current),'5fc6dcb7b5adac0002ef70b0646c524cb05744975641f407e523fa60bede4532');
    assert.equal(part(transition.predecessor.canonicalLfText,608,653),frozen.contexts[0].rawText);
    assert.equal(part(current,693,738),frozen.contexts[0].rawText);
    assert.notEqual(part(current,608,653),frozen.contexts[0].rawText);
    assert.deepEqual(check(),[]);
});
for(const missing of [undefined,null,{},[],false,'transition'])test(`missing/malformed transition ${JSON.stringify(missing)} rejects the changed live file`,()=>{
    assert.ok(errors(frozen,current,missing).length);
});
const tampering={
    schema:r=>r.schemaVersion=2,
    status:r=>r.status='accepted-gameplay',
    path:r=>r.path='src/module/apps/npc-quick-build/sheet.js',
    predecessorRevision:r=>r.predecessor.revision='0'.repeat(40),
    successorRevision:r=>r.successor.revision='0'.repeat(40),
    predecessorHash:r=>r.predecessor.canonicalLfSha256='0'.repeat(64),
    successorHash:r=>r.successor.canonicalLfSha256='0'.repeat(64),
    archive:r=>r.predecessor.canonicalLfText+='// changed archive\n',
    archiveAndRefreshedHash:r=>{r.predecessor.canonicalLfText+='// coordinated change\n';r.predecessor.canonicalLfSha256=hash(r.predecessor.canonicalLfText);},
    excerptHash:r=>r.excerpt.canonicalLfSha256='0'.repeat(64),
    oldStart:r=>r.excerpt.predecessor.startLine++,
    oldEnd:r=>r.excerpt.predecessor.endLine++,
    newStart:r=>r.excerpt.successor.startLine++,
    newEnd:r=>r.excerpt.successor.endLine++,
    purpose:r=>r.purpose='Owner accepts runtime activation',
    extraField:r=>r.allowAnySuccessor=true,
    selfReportedDigest:r=>r.semanticSha256=semantic(r)
};
for(const [name,change] of Object.entries(tampering))test(`independent transition pin rejects ${name}`,()=>{
    const record=clone(transition);change(record);assert.ok(check(frozen,current,record).length);
});
test('unknown successor outside the preserved excerpt rejects even when the transition hash is refreshed',()=>{
    const changed=current+'\n// unknown successor\n';
    assert.equal(part(changed,693,738),frozen.contexts[0].rawText);
    assert.ok(check(frozen,changed).length);
    const record=clone(transition);record.successor.canonicalLfSha256=hash(changed);
    assert.ok(check(frozen,changed,record).length);
});
test('excerpt changes and coordinated line/hash refreshes cannot replace frozen G evidence',()=>{
    const code=clone(frozen),changed=current.replace(frozen.contexts[0].rawText,frozen.contexts[0].rawText.replace('randomizePartyPokemon','alteredPartyPokemon'));
    assert.ok(check(frozen,changed).length);
    const record=clone(transition);record.successor.canonicalLfSha256=hash(changed);code.contexts[0].rawText=part(changed,693,738);record.excerpt.canonicalLfSha256=hash(code.contexts[0].rawText);
    assert.ok(check(code,changed,record).length);
});
test('archived predecessor cannot stand in for the required live successor or hide a rollback',()=>{
    assert.ok(check(frozen,transition.predecessor.canonicalLfText).length);
});
test('live successor cannot be omitted or replaced with non-text data',()=>{
    for(const text of [undefined,null,{},[],false])assert.ok(errors(frozen,text,transition).length);
});
test('frozen G metadata remains independently checked without editing original evidence',()=>{
    const before=semantic(audit),prior=semantic(transition);
    for(const change of [c=>c.canonicalLfSha256=transition.successor.canonicalLfSha256,c=>c.codeExecuted=true,c=>c.contexts[0].startLine=693,c=>c.contexts[0].endLine=738,c=>c.contexts[0].rawText+='\n',c=>c.contexts=[],c=>c.contexts.push(clone(c.contexts[0]))]){const code=clone(frozen);change(code);assert.ok(check(code).length);}
    assert.deepEqual(check(),[]);assert.equal(semantic(audit),before);assert.equal(semantic(transition),prior);
});
test('all14 other implementation paths retain strict original whole-file and line binding',()=>{
    const other=audit.implementationContexts.filter(code=>code.path!==path);assert.equal(other.length,14);
    for(const code of other){assert.ok(G_IMPLEMENTATION_PATHS.includes(code.path));const text=read(code.path).replace(/\r\n/g,'\n');assert.deepEqual(errors(code,text,transition),[]);assert.ok(errors(code,text+'\n// unapproved\n',transition).length);}
});
test('unlisted paths cannot borrow either a frozen binding or the NPC transition',()=>{
    const code={...clone(frozen),path:'src/custom-npc.js',canonicalLfSha256:hash(current)};
    assert.ok(errors(code,current,transition).length);
});
test('validation does not execute archived code or access a file named by transition data',()=>{
    const record=clone(transition);record.path='../../outside.js';record.predecessor.canonicalLfText='throw Error("must never execute");';record.predecessor.canonicalLfSha256=hash(record.predecessor.canonicalLfText);
    assert.doesNotThrow(()=>check(frozen,current,record));assert.ok(check(frozen,current,record).length);
});
test('loader retains the actual live code and loads transition separately from immutable G evidence',async()=>{
    const loaded=await loadOrganizationalSourceReview({organizationalSourceEvidence:'organizational-source-evidence-g.json'});
    assert.equal(loaded.organizationalCode[path],current);assert.notEqual(loaded.organizationalCode[path],transition.predecessor.canonicalLfText);
    assert.deepEqual(loaded.organizationalImplementationBindingTransition,transition);
    assert.equal(semantic(loaded.organizationalSource),semantic(audit));
    assert.deepEqual(errors(frozen,loaded.organizationalCode[path],loaded.organizationalImplementationBindingTransition),[]);
    for(const text of Object.values(loaded.organizationalCode))assert.equal(text.includes('\r\n'),false);
});
