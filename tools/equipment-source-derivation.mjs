// Source-only projections. Stored display labels never establish document IDs.
export function equipmentRawPrimitives(source, parents) {
    return {tables:source.tables,units:source.units.map(({id,book,pdfPage,source,sourceKind,kind,labelForDiscovery,tableAnchor,proseAnchor,priceRole}) =>
        ({id,book,pdfPage,source,sourceKind,kind,labelForDiscovery,tableAnchor:tableAnchor ?? null,proseAnchor:proseAnchor ?? null,priceRole:priceRole ?? null})),
    parents:parents.map(({id,source,sourceKind,rawText}) => ({id,source,sourceKind,rawText}))};
}
export const equipmentComparableWords = (value,words) => words(value).replace(/\bdb\b/g,'damage base').replace(/\boff hand\b/g,'offhand').replace(/\bt echnology\b/g,'technology');
const priceNumbers = text => [...text.matchAll(/\$\s*([\d,]+)/g)].map(m => Number(m[1].replaceAll(',','')));

export function deriveEquipmentUnit(unit, tables, parents, cleanText) {
    const clean = text => cleanText(String(text).replace(/-\s*\n\s*(?=(?:Type|Typed)\b)/g,'-'));
    const parent = (book,page) => parents.get(`e2-equipment-parent:${book}:${page}`)?.rawText ?? '';
    let raw, effect, prices = [], slots = null;
    if (unit.tableAnchor) {
        raw = tables[String(unit.pdfPage)][unit.tableAnchor.tableIndex].cells[unit.tableAnchor.rowIndex];effect = clean(raw[1]);
        if (raw.length === 3) prices = priceNumbers(raw[2]).map(amount => ({amount,role:'printed-item-price'}));
        else if (unit.pdfPage === 298) {
            if (!clean(parent('core',298)).includes('All of these items can be bought for $3000')) throw Error('evolutionary price parent missing');
            prices = [{amount:3000,role:'printed-evolutionary-item-price'}];
        } else prices = priceNumbers(raw[1]).map(amount => ({amount,role:'qualified-price-in-complete-description'}));
    } else {
        raw = unit.proseAnchor.rawText;
        if (unit.kind === 'optional-ranked-book') {
            effect = clean(raw.includes('Description') ? raw.slice(raw.indexOf('Description')).replace(/^Description\s*:?\s*/,'') : raw.split('\n').slice(1).join('\n'));
            effect = effect.replace(/ Examples:[\s\S]*$/,'').replace(/ \*See Herbal[\s\S]*$/,'').replace(/ \*There will also eventually[\s\S]*$/,'');
            if (!clean(parent('may',7)).includes('Books generally cost $1000')) throw Error('tentative book price parent missing');
            prices = [{amount:1000,role:'tentative-general-book-price-with-study-and-rank-conditions'}];
        } else if (unit.book === 'porygon') {
            const at = raw.indexOf('Effect:');if (at < 0) throw Error('supplemental effect boundary missing');
            effect = clean(raw.slice(at+7));const cost = clean(raw.slice(0,at)).match(/Cost\s*:?\s*\$?([\d,]+)/);prices = cost ? [{amount:Number(cost[1].replaceAll(',','')),role:'printed-supplemental-item-price'}] : [];
            slots = clean(raw.slice(0,at).match(/Equipment Slots?:\s*([\s\S]*?)\nCost/)?.[1] ?? '') || null;
        } else if (unit.kind === 'fashion-recipe-product') {
            effect = clean(raw.split('\n').slice(1).join('\n').replace(/\bEffect:\s*/g,''));
            prices = [{amount:500,role:'qualified-recipe-creation-cost-not-retail'}];
        } else {
            effect = clean(raw.replace(/^\s*[^\n:]+:\s*/,''));prices = priceNumbers(raw).map(amount => ({amount,role:unit.priceRole ?? 'qualified-price-in-complete-description'}));
        }
    }
    const views = [{text:effect,sourceKind:unit.sourceKind,derivation:'complete printed effect/paragraph; all qualifiers retained'}];
    const add = (text,derivation) => {if (text && !views.some(v => v.text === text)) views.push({text,sourceKind:unit.sourceKind,derivation});};
    // A separately stored price may remove only an explicit price sentence.
    add(effect.replace(/(?:\s+)?(?:Costs?|[A-Za-z -]+ cost)\s+\$[\d,]+(?:\s+as well)?\.?$/,'').trim(),'explicit trailing price sentence kept separately');
    if (slots) {
        const slotText = slots.replace(/\s*\+\s*/g,' and ').replace(/Main-Hand/g,'Main Hand').replace(/Off-Hand/g,'Off Hand');
        add(`${effect} ${slotText} equipment ${/\+|,/.test(slots) ? 'slots' : 'slot'}.`,'explicit printed equipment slots appended without changing effect');
        add(`Equipment Slot: ${slotText}. ${effect}`,'explicit slot field before complete printed effect');
    }
    if (unit.book === 'core' && unit.pdfPage === 298 && unit.tableAnchor) add(`${effect}.`,'terminal punctuation');
    if (unit.labelForDiscovery === 'Type Boosters') add(effect.replace(/^These items/,'Type Boosters'),'generic item noun only');
    if (unit.labelForDiscovery === 'Stat Boosters') add(effect.replace(/^These items/,'Stat Boosters'),'generic item noun only');
    const id = unit.id;
    if (id === 'equipment:core:284:prose:poffinmixer') prices = [
        {amount:500,role:'recipe-ingredients-plus-berry-produces-two-Poffins'},
        {amount:500,role:'retail-per-Poffin'}, {amount:500,role:'retail-Poffin-Mixer'}];
    if (id === 'equipment:core:274:prose:rope') prices = [100,200,400].map((amount,i) => ({amount,role:'price-per-25-feet',variant:['basic','utility','sturdy'][i]}));
    if (id === 'equipment:core:274:prose:flashlight') prices = [{amount:200,role:'regular-flashlight-price'},{amount:400,role:'waterproof-upgrade-fee'},{amount:600,role:'regular-plus-waterproof-upgrade-total'}];
    if (id === 'equipment:core:295:table1:row1') prices = prices.map(p => ({...p,role:'conditional-availability-GM-discretion-Focus-price'}));
    if (id === 'equipment:core:294:table0:row5') prices = prices.map(p => ({...p,role:'black-market-upwards-minimum-not-public-retail'}));
    if (id === 'equipment:core:299:prose:rarecandy' || id === 'equipment:core:298:prose:reanimationmachine' || id === 'equipment:core:302:prose:magicflute') prices = prices.map(p => ({...p,role:'qualified-minimum-or-more-not-fixed-retail'}));
    return {effect,priceFacts:prices,equipmentSlots:slots,effectViews:views};
}

export function equipmentReferenceLiterals(value,path='$') {
    if (Array.isArray(value)) return value.flatMap((v,i) => equipmentReferenceLiterals(v,`${path}[${i}]`));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([k,v]) => equipmentReferenceLiterals(v,`${path}.${k}`));
    if (typeof value !== 'string') return [];
    return [...value.matchAll(/Compendium\.[\w-]+\.[\w-]+\.(?:(?:Item|Actor|Macro|JournalEntry|RollTable)\.)?[A-Za-z0-9]{16}(?![A-Za-z0-9])|(?<![\w.])(?:Item|Macro)\.[A-Za-z0-9]{16}(?![A-Za-z0-9])/g)]
        .map(m => ({path,literalUuid:m[0],resolution:m[0].startsWith('Compendium.ptu.') ? 'current-repository-target' : m[0].startsWith('Compendium.') ? 'external-compendium-target-not-established-by-this-repository-export-evidence' : 'world-local-identity-not-resolved-by-display-label'}));
}
