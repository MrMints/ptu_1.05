// Derive comparison fields from recorded raw PDF cells/prose/parent rules.
// These functions have no runtime, document-selection or policy consumer.
export const consumableComparableWords = (value, words) => words(value).replace(/\b(?:a|an|the)\b\s*/g,'').trim();

const money = value => {
    const match = String(value ?? '').match(/\$([\d,]+)/);
    return match ? Number(match[1].replaceAll(',','')) : null;
};
const required = (match, message) => {if (!match) throw new Error(message);return match;};

export function consumableRawPrimitives(source, parents) {
    return {
        definitions:source.sourceDefinitions.map(u => ({id:u.id,source:u.source,sourceKind:u.sourceKind,kind:u.kind,labelForDiscovery:u.labelForDiscovery,
            ...(u.tableAnchor ? {tableAnchor:u.tableAnchor} : {proseAnchor:u.proseAnchor})})),
        parents:parents.map(p => ({id:p.id,source:p.source,sourceKind:p.sourceKind,rawText:p.rawText}))
    };
}

export function deriveConsumableUnit(unit, tables, parents, clean) {
    const parent = id => required(parents.get(id),`Missing complete source parent ${id}`);
    const parentText = id => clean(parent(id).rawText);
    let effect, tier = null, baseCaptureModifier = null, printedPriceCell = null;
    if (unit.tableAnchor) {
        const a = unit.tableAnchor, row = required(tables[String(a.pdfPage)]?.[a.tableIndex]?.cells[a.rowIndex],`Missing source row ${unit.id}`);
        if (unit.kind === 'capture-ball') {effect = clean(row[4]);baseCaptureModifier = Number(row[3]);}
        else if (unit.kind === 'berry') {effect = clean(row[3]);tier = Number(row[0]);}
        else {effect = clean(row[1]);printedPriceCell = row[2];}
    } else {
        const raw = unit.proseAnchor.rawText, split = raw.indexOf('\nEffect:');
        effect = clean(split >= 0 ? raw.slice(split + 8) : raw);
    }
    const result = {effect,tier,baseCaptureModifier,printedPriceCell,effectViews:[],priceFacts:[]};
    const add = (text, ids = [], kind = unit.sourceKind) => result.effectViews.push({text:clean(text),parentContextIds:ids,sourceKind:kind});
    add(effect);
    if (printedPriceCell) result.priceFacts.push(money(printedPriceCell) === null
        ? {amount:null,role:'unpriced-not-free',printedCell:printedPriceCell,ingredientCostIncluded:false}
        : {amount:money(printedPriceCell),role:'printed-retail',printedCell:printedPriceCell,ingredientCostIncluded:false});
    if (unit.proseAnchor) {
        const raw = clean(unit.proseAnchor.rawText), amount = money(raw);
        if (unit.kind === 'chef-snack') {
            const match = required(parentText('e2-consumable-parent:core:132').match(/Tasty Snacks Prerequisites: Chef Cost: \$([\d,]+)/),'Missing complete Tasty Snacks creator cost');
            result.priceFacts = [{amount:Number(match[1].replaceAll(',','')),role:'creation-cash',parentContextIds:['e2-consumable-parent:core:132'],ingredientCostIncluded:false}];
        } else if (!['chef-recipe','ball-modification-recipe'].includes(unit.kind) && amount !== null) {
            result.priceFacts = [{amount,role:raw.includes('or more') ? 'minimum-retail' : 'printed-retail',proseAnchorId:unit.id,ingredientCostIncluded:false}];
        }
    }
    if (unit.kind === 'capture-ball') {
        const text = parentText('e2-consumable-parent:core:272');let amount,role;
        if (unit.labelForDiscovery === 'Master Ball') {amount = money(effect);role = 'minimum-worth-sold-nowhere';required(/Worth at least/.test(effect) && /Sold nowhere/.test(effect),'Missing Master Ball worth/availability qualifier');}
        else {
            const pattern = unit.labelForDiscovery === 'Basic Ball' ? /Basic Balls are sold for \$([\d,]+)/ : unit.labelForDiscovery === 'Great Ball' ? /Great Balls for \$([\d,]+)/ : unit.labelForDiscovery === 'Ultra Ball' ? /Ultra Balls for \$([\d,]+)/ : /All Special balls are usually sold for \$([\d,]+)/;
            const match = required(text.match(pattern),'Missing complete original Ball price paragraph');amount = Number(match[1].replaceAll(',',''));
            role = ['Basic Ball','Great Ball','Ultra Ball'].includes(unit.labelForDiscovery) ? 'printed-retail' : 'usual-special-ball-retail-subject-to-availability';
        }
        result.priceFacts = [{amount,role,parentContextIds:['e2-consumable-parent:core:272'],ingredientCostIncluded:false}];
        add(`${effect} ${baseCaptureModifier} Modifier.`);add(`${baseCaptureModifier} Modifier. ${effect}`);add(`${baseCaptureModifier} modifier to catch. ${effect}`);
    }
    if (unit.kind === 'berry') {
        const tierRow = required(tables['280']?.[0]?.cells.find(r => String(r[0]) === String(tier)),'Missing Berry tier price row');
        result.priceFacts = [{amount:money(tierRow[2]),role:'printed-tier-retail',tier,parentContextIds:['e2-consumable-parent:core:280'],ingredientCostIncluded:false}];
        add(`${effect.replaceAll('CS','Combat Stage')} Tier ${tier}.`);
        const footnotes = parentText('e2-consumable-parent:core:283'), suppress = effect.match(/^(HP|Attack|Defense|Special Attack|Special Defense|Speed) Suppressant\*$/);
        if (suppress) {
            required(/Suppressant Berries lower the indicated Base Stat by 1/.test(footnotes) && /only works if the Pokemon's trainer wishes it to/.test(footnotes),'Missing complete Suppressant effect/Trainer-consent footnote');
            add(`Lowers ${suppress[1]} Base Stat by 1 when consumed, only if the Pokémon’s trainer wishes it to. Tier ${tier}.`,['e2-consumable-parent:core:283']);
        }
        const treat = effect.match(/^(Spicy|Dry|Sweet|Bitter|Sour) Treat\*, (.+)$/);
        if (treat) {
            required(/Treat Berries heal 1\/8th/.test(footnotes) && /it heals 1\/6th instead/.test(footnotes) && /dislikes the treat's flavor, the user is Confused/.test(footnotes),'Missing complete Treat flavor alternatives');
            add(`${treat[1]} Treat. Heals 1/8th of the Pokémon’s Max HP. If the user likes the Treat’s flavor, it heals 1/6th instead. If the user dislikes the treat’s flavor, the user is Confused. ${treat[2]}. Tier ${tier}.`,['e2-consumable-parent:core:283']);
        }
        if (effect.startsWith('Weakens')) {
            required(/trade in their Digestion Buff to grant one step of resistance when hit by a Move of the indicated type/.test(footnotes),'Missing complete weakening trigger/one-step/buff footnote');
            const type = required(effect.match(/([A-Za-z]+?)-?type\b/i),'Missing printed weakening Type')[1], superEffective = /super\s*effective/i.test(effect);
            result.weakeningBerryFacts = {type,requiresSuperEffective:superEffective,resistanceSteps:1,requiresTradingBuff:true,tier};
            add(`Grants a Digestion Buff which, when traded in, grants one step of resistance versus a foe's ${superEffective ? 'super effective ' : ''}${type}-type move. Tier ${tier}.`,['e2-consumable-parent:core:283']);
        }
    }
    if (unit.kind === 'vitamin') {
        if (!['Heart Booster','PP Up'].includes(unit.labelForDiscovery)) {
            required(/up to five Vitamins per Pokemon/.test(parentText('e2-consumable-parent:core:299')),'Missing original Vitamin lifetime cap');
            add(`${effect} You may only get use out of up to five Vitamins per Pokémon.`,['e2-consumable-parent:core:299','e2-consumable-parent:core:131']);
        }
        if (unit.labelForDiscovery === 'PP Up') {
            const raw = parent('e2-consumable-parent:core:299').rawText, start = raw.indexOf('At-Will Moves'), end = raw.indexOf('The following aren’t Vitamins');
            required(start >= 0 && end > start,'Missing complete PP Up frequency exceptions');add(`${effect} ${raw.slice(start,end)}`,['e2-consumable-parent:core:299']);
        }
    }
    if (unit.kind === 'refreshment') {
        const sentence = required(parentText('e2-consumable-parent:core:279').match(/A Pokemon or Trainer can only consume one refreshment per half hour, unless they have the Gluttony Ability\./),'Missing complete refreshment/Gluttony parent');
        add(`${effect} ${sentence[0]}`,['e2-consumable-parent:core:279']);
    }
    if (unit.kind === 'bandage' && unit.labelForDiscovery === 'Bandages') {
        const raw = parent('e2-consumable-parent:core:277').rawText, start = raw.indexOf('Bandages are applied'), end = raw.indexOf('Bandages can be found');
        required(start >= 0 && end > start,'Missing full Bandage application/cancellation paragraphs');add(raw.slice(start,end),['e2-consumable-parent:core:277']);
    }
    if (unit.kind === 'misc-food') add(effect.replace(/^Baby Food:\s*/,''));
    if (unit.kind === 'stat-suppressant') add(effect.replace(/^Stat Suppressants:\s*/,'').replace(/ These cost \$500\.$/,''));
    if (unit.kind === 'equipment-minimum-price') add(effect.replace(/^Wonder Launcher\s*/,'').split('Wonder Launchers cost')[0]);
    if (unit.kind === 'bait') {
        const text = effect.replace(/^Bait:\s*/,'').replace(' Bait can be bought for $250.','').replace(", based on your GM's discretion",'')
            .replace(/The Pokemon attracted with bait should usually be of a Level comparable to the party's Pokemon\.\s*/,'');
        add(text);
    }
    if (unit.labelForDiscovery === 'Hearty Meal') add(effect.slice(required(effect.indexOf('When consumed,') >= 0,'Missing complete Hearty Meal consumption effect') && effect.indexOf('When consumed,')),['e2-consumable-parent:core:131','e2-consumable-parent:core:132']);
    for (const original of [...result.effectViews]) {
        const text = original.text.replaceAll('Digestion Buff','Food Buff').replaceAll('Repulsive','Herbal Restorative');
        if (text !== original.text) {
            const may = parentText('e2-consumable-parent:may:11');
            required(may.includes('Digestion Buffs are now called Food Buffs') && may.includes('Repulsive Medicines are now called Herbal Restoratives'),'Missing separately labeled May naming source');
            add(text,['e2-consumable-parent:may:11',...original.parentContextIds],'explicit-errata-in-may-playtest');
        }
    }
    if (unit.labelForDiscovery === 'Bait Mixer') {
        const baitUnit = {id:'parent-bait',sourceKind:'standard-core',kind:'bait',labelForDiscovery:'Bait',proseAnchor:{rawText:parent('e2-consumable-parent:core:274').rawText.split('Collection Jar:')[0].slice(parent('e2-consumable-parent:core:274').rawText.indexOf('Bait:'))}};
        const base = deriveConsumableUnit(baitUnit,tables,parents,clean).effectViews.at(-1).text;
        let vile = base.replace(/\bbait\b/gi,'Vile Bait').replace('a tasty, strong-smelling','a strong-smelling').replace(' It may be used in two ways; to lure Pokemon, or to distract Pokemon.','');
        const dot = vile.indexOf('.') + 1;vile = `${vile.slice(0,dot)} Pokémon that eat it are poisoned.${vile.slice(dot)}`;
        required(/Cost: \$150 or Honey/.test(clean(unit.proseAnchor.rawText)) && /For \$50 more/.test(effect) && /Pokemon that eat it are Poisoned/.test(effect),'Missing complete Bait Mixer costs/product effect');
        add(vile,['e2-consumable-parent:core:132','e2-consumable-parent:core:274']);
        result.derivedProductPriceFacts = Object.fromEntries(['Vile Bait','Super Bait'].map(label => [label,{amount:200,role:'creation-cash-150-plus-50',alternateIngredient:'Honey plus50 Pokédollars',retailPriceEstablished:false}]));
    }
    if (unit.labelForDiscovery === 'Stat Suppressant') {
        const berryStats = parentText('e2-consumable-parent:core:283');
        for (const stat of ['HP','Attack','Defense','Special Attack','Special Defense','Speed']) required(berryStats.includes(`${stat} Suppressant`),`Missing printed ${stat} suppressant option`);
        required(/Base Stats by 1 point and only function if the Trainer/.test(effect),'Missing Base Stat/Trainer scope');
        result.parameterFacts = {permittedStats:['HP','Attack','Defense','Special Attack','Special Defense','Speed'],baseStatChange:-1,trainerConsentRequired:true};
        add("Lowers the user's Attack Base Stat by 1. Only functions if the Trainer wants it to.",['e2-consumable-parent:core:299']);
    }
    if (unit.kind === 'ball-modification-recipe') {
        const match = required(clean(unit.proseAnchor.rawText).match(/Ingredients\/Cost: (.+?) \/ \$([\d,]+)/),'Missing complete modification ingredient plus fee');
        result.modificationCostFact = {cash:Number(match[2].replaceAll(',','')),requiredIngredient:match[1],role:'modification-fee-plus-existing-ball',finishedBallRetailEstablished:false};
        const footer = parentText('e2-consumable-parent:porygon:83');
        required(footer.includes('Learning, Fabulous and Power Modification work once on a Pokemon. Ever.'),'Missing once-ever modification footer');
        result.onceEverOnPokemon = ['Power Modification','Fabulous Modification','Learning Modification'].includes(unit.labelForDiscovery);
    }
    return result;
}
