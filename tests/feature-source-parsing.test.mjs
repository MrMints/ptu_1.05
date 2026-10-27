import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeatureDefinition,parseFeatureEffectClauses,featureImplementationNotes,featurePrerequisiteWordingProof,featureEffectWordingProof,featureResourceCostWordingProof,featureSourceNumericTokens} from '../tools/feature-source-parsing.mjs';

test('ranked source prerequisites preserve complete alternatives and distinct rank effects',()=>{
    const definition=parseFeatureDefinition('Smith\n[Ranked 2]\nRank 1 Prerequisites: Novice Technology Education or Novice Occult Education\nRank 2 Prerequisites: Expert Technology Education or Expert Occult Education\nRank 1 Effect: Craft one item.\nRank 2 Effect: Craft two items.\nSpecial: Do not combine ranks.');
    assert.deepEqual(definition.prerequisites.map(s=>[s.rank,s.text]),[
        ['Rank 1','Novice Technology Education or Novice Occult Education'],['Rank 2','Expert Technology Education or Expert Occult Education']]);
    assert.deepEqual(definition.sections.filter(s=>s.kind==='effect').map(s=>s.rank),['Rank 1','Rank 2']);
    assert.equal(definition.sections.at(-1).text,'Do not combine ranks.');
    assert.deepEqual(definition.tags,['Ranked 2']);
});

test('a printed Moves heading cannot silently become an Effect label',()=>{
    const result=parseFeatureDefinition('Power of Rage\n[+HP]\nPrerequisites: Berserker\nStatic\nMoves: Choose Enduring Rage, or White Flame. You gain the chosen Ability.');
    assert.equal(result.sections.at(-1).kind,'moves');
    assert.equal(result.sections.at(-1).text,'Choose Enduring Rage, or White Flame. You gain the chosen Ability.');
    assert.equal(result.frequencies[0].text,'Static');
    assert.equal(result.sections.filter(s=>s.kind==='effect').length,0);
    assert.deepEqual(parseFeatureEffectClauses('Moves: Choose Enduring Rage, or White Flame.').clauses,[{kind:'moves',text:'Choose Enduring Rage, or White Flame.'}]);
    assert.deepEqual(parseFeatureEffectClauses('Effect: Learn the following Moves: Rage and Flail.').clauses,[{kind:'effect',text:'Learn the following Moves: Rage and Flail.'}]);
});

test('source mode frequencies remain separate from acquisition prerequisites',()=>{
    const result=parseFeatureDefinition('Blessing\nPrerequisites: GM Permission\nMessiah: Static\nSigner: Bind 1 AP - Standard Action\nEffect: Choose an ally.\nCondition: The ally must consent.');
    assert.equal(result.prerequisites[0].text,'GM Permission');
    assert.deepEqual(result.sections.filter(s=>s.kind==='profile-frequency').map(s=>[s.label,s.text]),[['Messiah','Static'],['Signer','Bind 1 AP - Standard Action']]);
    assert.equal(result.sections.at(-1).text,'The ally must consent.');
});

test('complete nested Augury and Scrying targets survive multiple Effect sections',()=>{
    const result=parseFeatureDefinition('Divination\n[+Special Defense]\nPrerequisites: Oracle\nDaily x3 - Extended Action\nEffect: You may perform an Augury or Scrying.\nAugury\nTarget: Self\nEffect: A vision may depict past, present or future events.\nScrying\nTarget: An item you are touching, or your current location\nEffect: You see visions over the last 24 hours.');
    assert.equal(result.sections.filter(s=>s.kind==='effect').length,3);
    assert.deepEqual(result.sections.filter(s=>s.kind==='target').map(s=>s.text),['Self','An item you are touching, or your current location']);
    assert.match(result.sections.at(-1).text,/24 hours/);
});

test('UUID and Embed labels containing role words cannot create false clauses',()=>{
    const uuid='@UUID[Compendium.ptu.feats.Item.abcdefghijklmnop]{Effect: Decoy}';
    const embed='@Embed[Compendium.ptu.feats.Item.abcdefghijklmnop]{Trigger: Decoy}';
    const result=parseFeatureEffectClauses(`Trigger - An ally acts.\nEffect: Use ${uuid} and ${embed}.\nSpecial: Spend 2 TP.`);
    assert.deepEqual(result.clauses.map(c=>c.kind),['trigger','effect','special']);
    assert.ok(result.clauses[1].text.includes(uuid));
    assert.ok(result.clauses[1].text.includes(embed));
    assert.equal(result.clauses[2].text,'Spend 2 TP.');
});

test('acquisition rank requirements cannot consume separately labeled use conditions',()=>{
    const result=parseFeatureDefinition('Choice\nPrerequisites: Adept Focus,\nNovice Command or Charm\nCost: 2 Tutor Points\nCondition: Target has at least 2 TP remaining\nEffect: Select a Move.\nNote: May target a Pokémon only once.');
    assert.equal(result.prerequisites[0].text,'Adept Focus,\nNovice Command or Charm');
    assert.equal(result.costs[0].text,'2 Tutor Points');
    assert.equal(result.sections.find(s=>s.kind==='condition').text,'Target has at least 2 TP remaining');
    assert.equal(result.sections.at(-1).text,'May target a Pokémon only once.');
});

test('All Ranks and literal typo/semicolon headers retain their printed evidence',()=>{
    const all=parseFeatureDefinition('Type Expertise\n[Ranked 2]\nAll Ranks Prerequisites: Level 9, 3 Moves of the Chosen\nType in your Move List\nStatic\nEffect: STAB is never applied to Struggle Attacks.');
    assert.equal(all.prerequisites[0].rank,'All Ranks');
    assert.equal(all.prerequisites[0].text,'Level 9, 3 Moves of the Chosen\nType in your Move List');
    const typo=parseFeatureDefinition('Godslayer\nPerquisites: GM Permission\nStandard Action - EOT\nTarget: A Legendary Pokémon.\nEffect: Attempt to shatter one Aura.');
    assert.equal(typo.prerequisites[0].label,'Perquisites');
    assert.equal(typo.prerequisites[0].text,'GM Permission');
    assert.equal(typo.frequencies[0].text,'Standard Action - EOT');
    const semicolon=parseFeatureDefinition('Code Injection\nPrerequisites; Corrupt Reality\n1 AP - Standard Action\nEffect: Each target may be affected only once per Scene.');
    assert.equal(semicolon.prerequisites[0].printedDelimiter,';');
    assert.equal(semicolon.prerequisites[0].text,'Corrupt Reality');
});

test('an implementation note cannot consume an earlier mechanical blockquote',()=>{
    const mechanical='<blockquote>Target must have at least 2 TP.</blockquote>';
    const implementation='<blockquote>The automation prompt does not validate the target.</blockquote>';
    const notes=featureImplementationNotes(`${mechanical}\nEffect: Spend 2 TP.\n${implementation}`);
    assert.deepEqual(notes,[{startOffset:mechanical.length+'\nEffect: Spend 2 TP.\n'.length,rawText:implementation}]);
});

const words=value=>String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().match(/[a-z0-9]+|[+%/]|-(?=\d)/g)?.join(' ')??'';
const prerequisite=text=>[{rank:null,text}];
test('bounded prerequisite observations cannot erase distinct ranks, parents or non-skill choices',()=>{
    assert.equal(featurePrerequisiteWordingProof([],prerequisite('None'),words),'printed-none-versus-empty-prerequisite-representation');
    assert.equal(featurePrerequisiteWordingProof([],prerequisite('Expert Focus'),words),null);
    assert.equal(featurePrerequisiteWordingProof(['Expert Charm or Focus'],prerequisite('Expert Charm or Expert Focus'),words),'printed-repeated-skill-rank-shorthand');
    assert.equal(featurePrerequisiteWordingProof(['Expert Charm or Focus'],prerequisite('Expert Charm or Master Focus'),words),null);
    assert.equal(featurePrerequisiteWordingProof(['Expert Charm or Focus','Trainer'],prerequisite('Expert Charm or Expert Focus'),words),null);
    assert.equal(featurePrerequisiteWordingProof(['Adept Intuition or Pokémon Education or Technology Education'],prerequisite('Adept Intuition, Pokémon Education, or Technology Education'),words),'printed-canonical-skill-serial-or-list');
    assert.equal(featurePrerequisiteWordingProof(['Adept Focus or Any Feature or GM Permission'],prerequisite('Adept Focus, Any Feature, or GM Permission'),words),null);
    assert.equal(featurePrerequisiteWordingProof(['Novice Technology Education'],prerequisite('Novice Technology'),words),'printed-education-skill-shorthand');
    assert.equal(featurePrerequisiteWordingProof(['Novice Technology Education'],prerequisite('Expert Technology'),words),null);
});

test('known layout and frequency placement cannot hide altered arithmetic or a new action',()=>{
    const source={ruleStructure:parseFeatureEffectClauses('Effect: Turn 4 Y ellow Shards into a Stone.'),definition:{frequencies:[]}};
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Turn 4 Yellow Shards into a Stone.'),source,words),'pdf-capital-yellow-word-gap');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Turn 3 Yellow Shards into a Stone.'),source,words),null);
    const tag={ruleStructure:parseFeatureEffectClauses('Effect: Create a Tag.'),definition:{frequencies:[{text:'Special – Extended Action'}]}};
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Special - Extended Action.\nCreate a Tag.'),tag,words),'printed-special-frequency-stored-in-effect');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Special - Standard Action.\nCreate a Tag.'),tag,words),null);
});

test('a Level-Up wrap observation requires the literal wrap and preserves the complete rule',()=>{
    const source={rawDefinition:'Lessons\nEffect: Choose a Level-\nUp Move. Repeat up to three times with the same Evolution.',ruleStructure:parseFeatureEffectClauses('Choose a LevelUp Move. Repeat up to three times with the same Evolution.'),definition:{frequencies:[]}};
    const current=parseFeatureEffectClauses('Choose a Level-Up Move. Repeat up to three times with the same Evolution.');
    assert.equal(featureEffectWordingProof(current,source,words),'printed-level-up-line-wrap');
    assert.equal(featureEffectWordingProof(current,{...source,rawDefinition:'Lessons\nEffect: Choose a LevelUp Move.'},words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Choose a Level-Up Move. Repeat up to four times with the same Evolution.'),source,words),null);
});

test('expanding a printed prerequisite-list reference preserves every choice and repeat condition',()=>{
    const source={rawDefinition:'Ranged Attacks',definition:{prerequisites:prerequisite('Level 20, one of Firestarter, Fountain, Freezer, Guster, Materializer, or Zapper'),frequencies:[]},ruleStructure:parseFeatureEffectClauses('Choose one of the Capabilities listed in the prerequisites for this Poké Edge. Struggle Attacks modified by that Capability have a range of 6 meters. This Poké Edge may be taken multiple times, selecting a different Capability each time.')};
    const body='Choose one of Firestarter, Fountain, Freezer, Guster, Materializer, or Zapper. Struggle Attacks modified by that Capability have a range of 6 meters. This Poké Edge may be taken multiple times, selecting a different Capability each time.';
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(body),source,words),'printed-prerequisite-list-reference-expanded');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(body.replace('or Zapper','or Malevolent')),source,words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(body.replace(/ This Poké Edge.*/,'')),source,words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Struggle Attacks modified by Guster have a range of 6 meters.'),source,words),null);
});

test('Tutor Point abbreviations cannot equate slots, different amounts or conditional costs',()=>{
    const cost=text=>[{text}];
    assert.equal(featureResourceCostWordingProof('2 TP',cost('2 Tutor Points')),'printed-tutor-point-abbreviation');
    assert.equal(featureResourceCostWordingProof('1 TP',cost('1 Tutor Point')),'printed-tutor-point-abbreviation');
    for(const [current,source] of [['1 TP','2 Tutor Points'],['1 Tutor Slot','1 Tutor Point'],['0','1 Tutor Point'],['2 TP','2 Tutor Points per target'],['2 TP','2 AP']])assert.equal(featureResourceCostWordingProof(current,cost(source)),null);
});

test('numbered Momentum bullets cannot hide a real negative modifier',()=>{
    const source={rawDefinition:'Manual\nEffect: Choose an effect.\n » 1 Momentum: Add +2 Damage.\n » 2 Momentum: Set Initiative to 0.',ruleStructure:parseFeatureEffectClauses('Choose an effect.\n » 1 Momentum: Add +2 Damage.\n » 2 Momentum: Set Initiative to 0.'),definition:{frequencies:[]}};
    const raw='Choose an effect.\n- 1 Momentum: Add +2 Damage.\n- 2 Momentum: Set Initiative to 0.';
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(raw),source,words,raw),'printed-numbered-momentum-bullets');
    const altered=raw.replace('+2 Damage','-2 Damage');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(altered),source,words,altered),null);
    const inline=raw.replace('\n- 1 Momentum:', ' Pay - 1 Momentum:');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(inline),source,words,inline),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(raw),source,words),null);
});

test('rule-compound layout observations require the actual printed hyphen wrap',()=>{
    const source={rawDefinition:'Rock Rule\nEffect: Rock-\nType attacks deal +2 on Super-\nEffective hits.',definition:{frequencies:[]},ruleStructure:parseFeatureEffectClauses('RockType attacks deal +2 on SuperEffective hits.')};
    const current=parseFeatureEffectClauses('Rock-Type attacks deal +2 on Super-Effective hits.');
    assert.equal(featureEffectWordingProof(current,source,words),'printed-rule-compound-line-wrap');
    assert.equal(featureEffectWordingProof(current,{...source,rawDefinition:'RockType attacks deal +2 on SuperEffective hits.'},words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Fire-Type attacks deal +2 on Super-Effective hits.'),source,words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Rock-Type attacks deal -2 on Super-Effective hits.'),source,words),null);
});

test('qualified Static and Scene effects retain their complete continuation instead of becoming frequencies',()=>{
    const source='Hypergeometry\nPrerequisites: All patron Major Gifts\nStatic | Scene - Standard Action, Interrupt\nStatic Effect: You may treat the distance as one meter greater or less.\nThe value cannot change after an action is announced.\nScene Effect: You may activate this once per\nScene when hit by a single target attack. The attack\ninstead hits a target in an adjacent square.';
    const definition=parseFeatureDefinition(source);
    assert.equal(definition.frequencies.length,1);
    assert.equal(definition.sections.find(s=>s.kind==='static-effect').text,'You may treat the distance as one meter greater or less.\nThe value cannot change after an action is announced.');
    assert.match(definition.sections.find(s=>s.kind==='scene-effect').text,/Scene when hit[\s\S]*adjacent square\./);
    const body=definition.sections.filter(s=>['static-effect','scene-effect'].includes(s.kind)).map(s=>s.label+': '+s.text).join('\n');
    assert.deepEqual(parseFeatureEffectClauses(body).clauses.map(c=>c.kind),['static-effect','scene-effect']);
});

test('a literal trigger-ing wrap cannot create another Trigger clause',()=>{
    const source='Trigger: You hit with a Move.\nEffect: The effect depends on the trigger-\ning Move. Apply -2 Combat Stages.';
    const clauses=parseFeatureEffectClauses(source).clauses;
    assert.deepEqual(clauses.map(c=>c.kind),['trigger','effect']);
    assert.match(clauses[1].text,/trigger- ing Move/);
    assert.deepEqual(parseFeatureEffectClauses('Trigger - You hit.\nEffect - Apply -2 Combat Stages.').clauses.map(c=>c.kind),['trigger','effect']);
    assert.notDeepEqual(featureSourceNumericTokens(parseFeatureEffectClauses(source)),featureSourceNumericTokens(parseFeatureEffectClauses(source.replace('-2','+2'))));
});

test('AP amounts in printed mode labels remain numeric evidence after separating the roles',()=>{
    const a=parseFeatureEffectClauses('Target: Self\nStatic: Sense nearby patrons.\n2 AP Effect: Disable a Gift within 8 meters.'),b=parseFeatureEffectClauses('Target: Self\nStatic: Sense nearby patrons.\n1 AP Effect: Disable a Gift within 8 meters.');
    assert.deepEqual(a.clauses.map(c=>c.kind),['target','static','2-ap-effect']);
    assert.deepEqual(featureSourceNumericTokens(a),['2','8']);
    assert.deepEqual(featureSourceNumericTokens(b),['1','8']);
    const unit={rawDefinition:'Mode\n2 AP Effect: Disable a Gift within 8 meters.',definition:{frequencies:[]},ruleStructure:a};
    assert.equal(featureEffectWordingProof(b,unit,words),null);
});

test('Arcane and youhave layout observations need their actual raw evidence and unchanged signed values',()=>{
    const arcane={rawDefinition:'Arcane Training\nEffect: Gain +5 Damage with Ar -\ncane Weapon Attacks.',definition:{frequencies:[]},ruleStructure:parseFeatureEffectClauses('Gain +5 Damage with Ar cane Weapon Attacks.')};
    const current=parseFeatureEffectClauses('Gain +5 Damage with Arcane Weapon Attacks.');
    assert.equal(featureEffectWordingProof(current,arcane,words),'printed-arcane-spaced-line-wrap');
    assert.equal(featureEffectWordingProof(current,{...arcane,rawDefinition:'Arcane Training without a wrap'},words),null);
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Gain -5 Damage with Arcane Weapon Attacks.'),arcane,words),null);
    const glyph={rawDefinition:'Glyph\nEffect: You may channel any Glyph youhave set down.',definition:{frequencies:[]},ruleStructure:parseFeatureEffectClauses('You may channel any Glyph youhave set down.')};
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('You may channel any Glyph you have set down.'),glyph,words),'printed-youhave-word-gap');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('You may channel any Glyph an ally has set down.'),glyph,words),null);
});

test('supplement gaps require literal raw evidence and cannot hide changed rule words or signs',()=>{
    for (const [raw,printed,current] of [
        ['into i nto the zone','Attacks from or i nto the zone take -3.','Attacks from or into the zone take -3.'],
        ['per -\nceive the shape','You may per ceive objects within 6 meters.','You may perceive objects within 6 meters.'],
        ['Topsy-\nTur v y','You learn Topsytur v y and Metronome.','You learn Topsy-Turvy and Metronome.']
    ]) {
        const unit={rawDefinition:raw,definition:{frequencies:[]},ruleStructure:parseFeatureEffectClauses(printed)};
        assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(current),unit,words),'printed-supplement-literal-word-gap');
        assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(current),{...unit,rawDefinition:'No literal source gap'},words),null);
        assert.equal(featureEffectWordingProof(parseFeatureEffectClauses(current+' This grants another Move.'),unit,words),null);
    }
    const unit={rawDefinition:'Ghost-\nTyped attacks',definition:{frequencies:[]},ruleStructure:parseFeatureEffectClauses('GhostTyped attacks deal +2 damage.')};
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Ghost-Typed attacks deal +2 damage.'),unit,words),'printed-rule-compound-line-wrap');
    assert.equal(featureEffectWordingProof(parseFeatureEffectClauses('Ghost-Typed attacks deal -2 damage.'),unit,words),null);
});
