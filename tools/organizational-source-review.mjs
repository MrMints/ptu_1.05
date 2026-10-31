import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {G_MEMBERSHIP, G_IMPLEMENTATION_PATHS, organizationalKind, organizationalReferences, organizationalLiteralFields,
    organizationalFolderFacts, organizationalTableFacts, organizationalMacroFacts, organizationalSourceFacts, cleanOrganizationalSource} from './organizational-source-derivation.mjs';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textDigest = value => createHash('sha256').update(value).digest('hex');
// These pins bind the independently read original/current/history evidence.
const G_SOURCE_PRIMITIVES = 'ee5dd913b3345fe8623e9e47022c500ea70a8300d35c41b044ad3ea54e586d39';
const G_DISPOSITIONS = '95c72c87baf74e670dbd7cc0e701c458aea6d1e811f3c4fc99fec2edd92a37ea';
const G_HISTORY = 'd1e5fc98cf30fc7076c6772b28cc9fd71db63ac28e1e6973a37186d694455d09';
const G_HISTORY_REGISTRY = 'e9d36981ad05ec5643f5b3fa6cc2f7339032502ffb3d1cce6d4da7570a49848e';
const G_MISSING_HISTORY = '351c78c478790e94d532a5e02f8a2c49dcbd92f1dec80a5f174ab72507eaa570';
const G_QA = 'd87ad8e4b8dff82eccdafac56e3bfab6bb24b3fc5c89b2a04c7835a3965de1aa';
const G_NON_G_METADATA = 'dc14a6ceae244253d9e663a53a5cba9deb210496ea6635d0436da7762f915314';
const G_PRIOR_DATA_PINS = {
    "docs/data/ability-source-evidence.json": "29cc72e8f7c43ff5dfbd7ec61eec2f7125f5a5a5510dd272587d26b77ccb1ad2",
    "docs/data/acquisition-boundary-audit.json": "c76144967801483f329002fe11d4f6ad334fe3929477e92ab93ae2c14688c278",
    "docs/data/bulbasaur-source-review.json": "c20c4d01c93cde450d723002c496cb807f0c808a819c3c9d9ac3527c232495a9",
    "docs/data/compendium-reference-audit.json": "eb795287cd9c15e0bf390804c8fb25f16ab18f32e8ad48e141176cb06ef38133",
    "docs/data/content-audit.json": "cc3d7a775d8a045aa66f8cd6efdf377f1bcbc6f10d61bdeb2a4d8a2567c269cb",
    "docs/data/content-eligibility-review.json": "e661ff729692f48878ad76b82fc9814788157d9a95f540bbce17d5e6bf2df14f",
    "docs/data/content-eligibility.json": "57e42a6a2cfc0a8df754980be288e5581514646adb7d0848fa6c1bd104a867ad",
    "docs/data/content-reconciliation-search.json": "5051bf2ab6890e0220d0ab91e907d37fe6afb7ab7ce8f3595d316dbab69d5606",
    "docs/data/dex-source-comparison.json": "12df2f309d9e26fa4d3f4b4fb58b4812589b54c332e69bcc5115220174d3b766",
    "docs/data/effect-source-evidence-f3a.json": "ffb59dfd1e254a002f57925933555aa6ae06977c6c9c03d00bff348eddf4de47",
    "docs/data/effect-source-evidence-f3b.json": "143b529579056fd9e0da7af7e42f232b9c8959a68341cb8927589109741418ad",
    "docs/data/effect-source-evidence-f3c.json": "344cb5bc93c0f4aae6df66784e9e6f0876a236beb528a952cf85b0de83926e33",
    "docs/data/effect-source-evidence-f3d.json": "8d70a8a0c3cf7a8fa076f4366f7dbf678b33bc3cba283c5075b4b861c5639338",
    "docs/data/effect-source-evidence-f3e.json": "f10f13fa89c7057982102fa5d27db4d71f4186d0958c41eb31fdaa74a8fcbaee",
    "docs/data/effect-source-evidence-f3f.json": "a271827bbfeb79558aa8a09293a47e2ae255721eaf450608eb4e698aed808612",
    "docs/data/effect-source-evidence-f3g.json": "23399b04cd61f488c023d1eedb520673a7703329fab80e51877fe4af3ea35a8c",
    "docs/data/effect-source-evidence-f3h.json": "33587a2535827476cae3906bc030d566d15b9a0d3ed56ea262dff1ff31900b59",
    "docs/data/effect-source-evidence.json": "e0ec14cea2efeeae560accf82a9786ea48d8834fd3a251726dab2a748f134282",
    "docs/data/export-repairs.json": "4d79a166a875caaacbc4835f263ff5689344f5ef41e8d0139d8e55a1b9e26ded",
    "docs/data/feature-source-evidence.json": "9b9508bfd5049fd6a18136359022eeb8353f6e27785247cf2a144aa27bb7bf5d",
    "docs/data/feature-source-search-e1a.json": "e7332a730af99760120720b27c4b7e7334b14eac76be8645bd5901501713df41",
    "docs/data/feature-source-search-e1b.json": "13ae7c28de179d87584ba36327c10fa503338a66742e77b07ecc25fe2ddf4ee4",
    "docs/data/feature-source-search-e1c.json": "a79313a7faea75175805a60f586e402f84ddd9849796f98d695392e6c66988f3",
    "docs/data/feature-source-search-e1d.json": "fa41b4d58f37793a3dfd67e491f37df1a2fbe67df85ce875a79964ec50182e5a",
    "docs/data/feature-source-search-e1e.json": "ebca15f36d9663072adeaeb484e1d69a466e2258970f6f10a39582812f84eebf",
    "docs/data/generation-scope-evidence.json": "d08dcaee298b5d7fd46f94b9ec38f482c109c85010e10d35c74d8a7c40af384c",
    "docs/data/item-source-evidence.json": "cbb51491dd93924664674e366a3e3742ecd28c91cd90e725f14e076611d71b32",
    "docs/data/move-source-evidence.json": "30933a00d3f09eb2295dea531eb4cf1ad8d0425485a51e96efbb5b14422f5b81",
    "docs/data/move-source-search-d2.json": "4aa0e4b5ee45bd6626303305793138fd98d08fe7ccd3e357c51d64278fc326fb",
    "docs/data/move-source-search-d3.json": "af0bf25bc516e6a0b69c48a41e0f073a3bc63db30cca9679c2a60e1b1be589bc",
    "docs/data/move-verification.json": "cca561c91ef73e9975d4d87c5ab0d5897b208f2eb603e4d4b87bca808340f637",
    "docs/data/p01-evidence-contract.json": "aee03a1d2b066a90d26ff4587c4938a0fd174565a077864967570055cbed9d27",
    "docs/data/p02a-routes.json": "c1dfd415f4f6378832b0b8e35fcc25d492828c8f7db528cfd38bcd22ae994258",
    "docs/data/record-dependency-review.json": "46c24cfff5f76677667c5ea38fe0bc2216de575d150bf0dc5feefdb609860578",
    "docs/data/record-source-review/abilities-core.json": "fe7805fe8ddd54c936c9b91bca8a2392d5285b29d1525de0b33d558d680f06af",
    "docs/data/record-source-review/abilities-packet.json": "38dc3f346497b42d974755a69962f45d9c706346c18ae59a3519960b4f921755",
    "docs/data/record-source-review/abilities-remaining.json": "260969fe7ee04c6a71a82d3ac8d7d9efcafff34a84dda047a8567fc868645927",
    "docs/data/record-source-review/capabilities.json": "eebbaecb943974923b9d4b87dcb937a7f054f9f763dbd2f8d95f570ed721ca2f",
    "docs/data/record-source-review/conditions.json": "1be926634ed23ba82fb6d715b11ea23a7a472e9c8f63f6f641bead9cb953669d",
    "docs/data/record-source-review/consumables.json": "79a8b65fcee951de4b0fe88e36148b0dbb8b7d7efe789b9c3e5adbc9ce8c9211",
    "docs/data/record-source-review/edges.json": "f4030cae2b4fda2993dd0ca80a3ca48dd4a3a4b5c0846588b3bed37ece6f3494",
    "docs/data/record-source-review/effects-other-a.json": "609d8f5556e11814871ad78563cdec747f1b41046ad65fcb8730ded7758e30ee",
    "docs/data/record-source-review/effects-other-b.json": "a530a3e80786333d9726a217cf64675f39b472537072b345427e177742cc2977",
    "docs/data/record-source-review/effects-other-c.json": "02dc039aba02e258720171a326e5aff9edefaa0280c0e15434c7a15f6778785c",
    "docs/data/record-source-review/effects-other-d.json": "bd55f1eba0f1bbe6f688ecc0b268910f8babfd1f0184c05db94a7429d94bd12b",
    "docs/data/record-source-review/effects-other-e.json": "4a85dab1c701fada5abfaafb370893b910ecd5bf4997703fd8704249b75ba35c",
    "docs/data/record-source-review/effects-other-f.json": "35e29b488894674e134d3542f1e1773ccde0fd9b0caacba9835a5409fccccb6b",
    "docs/data/record-source-review/effects-other-g.json": "56d24eb2aa2456c95a2903876fd8f24f7c32d718a0a35fecd17db08d4956e99e",
    "docs/data/record-source-review/effects-other-h.json": "4e2dea61637ff90d3cad3e10a2ecb4bb081431053d8f248918b704d77017b8e6",
    "docs/data/record-source-review/equipment.json": "1c01a0c62879d8c93ce34ce864ab389cf88b38d999be24d0f1ba3d6efe54c532",
    "docs/data/record-source-review/features-core.json": "048171c57a0bb8ae8210fc3785c38b1bd7b8cf587d6e50a63be3d761b9a1b17f",
    "docs/data/record-source-review/features-remaining.json": "3265059cc4af99f5a827b43486536c70d1121053cdec5f8cbcfb49d136ecb10e",
    "docs/data/record-source-review/features-supplemental.json": "151df633b7fa9cc185cbd3b0d6fd2ed4d605602c6aeec7f26e0bf3543868adf6",
    "docs/data/record-source-review/form-branch-skills.json": "c03b8ae2c94312021473dc6861ad503b3af7b80b27f92480de065622563a08de",
    "docs/data/record-source-review/known-exclusions.json": "a513ee1c408bff7adee0be8fca91d76f044489d09795c61842f47f326a248f95",
    "docs/data/record-source-review/moves-anchored.json": "ccff9d89252604b3abae59b5c46d3d32b86cbc1c6c5cd4d88cde535367245678",
    "docs/data/record-source-review/moves-contest.json": "6ca6c78cda13020a8200b7aea3378d3ed2a92f47a54dab891e8e0c50908d2e6d",
    "docs/data/record-source-review/moves-remaining.json": "f045ea975d2ade7a41b9dd09db8d4fc242d51faead3d0912a25fdd3d8349d8eb",
    "docs/data/record-source-review/pokemon-edges.json": "392a9be69f5e3f6d9ae4b6dcc6d7ceebe11a02ac4bc98b7db9b35e821d50b75e",
    "docs/data/record-source-review/reading-order-regressions.json": "fe03a646cc0a391072f07dd2f88ffc41c1d982c4840cafb4d0c3328bb590b572",
    "docs/data/record-source-review/references-a.json": "e94d7f86a3abe2b2a21e198c71345b8f487cf5fd5ff7a215376f450de030180c",
    "docs/data/record-source-review/references-b.json": "8e1f91197eedfc525047b5c3a14c924997dbe47c47d58378c502e03061b14774",
    "docs/data/record-source-review/references-c.json": "d42d5a43b93b0ae570fd939d27b9c5a549dae24f217603c589dfd7e55cdd8cbd",
    "docs/data/record-source-review/references-d.json": "789e5db2f235ac9b8e046c05ee232ecefdf168684f25c071843e92a4e4dc7bec",
    "docs/data/record-source-review/species-classic-early.json": "0f0a2373bf1fe6a9c2b5bed22f20edbedc66672c96f56f0d7927aa748e89964a",
    "docs/data/record-source-review/species-classic-final.json": "340680cd7723ce9a79ae2d30225b42239017a016d8dced61daffb3e96dbb5e86",
    "docs/data/record-source-review/species-classic-late.json": "7a00e3eda8ea6585793815bddbb17b45833f34373fdbf1f29240ce4b95f44d7b",
    "docs/data/record-source-review/species-classic-middle.json": "55c4f791926444d18dcd01542101749f30f24469f5e7b50cb5e22647cc45374e",
    "docs/data/record-source-review/species-regional.json": "0dfa0cfe3da337d0ca5c7bd70d31e48d39f2533e0aca3f8e9881b564ad7d79d7",
    "docs/data/record-source-review/species-scope.json": "43cd46a5ab888c590b7f59cb8dfd1e44798c4f21bef9630c59469fd64f28bec4",
    "docs/data/record-source-review/species-unmatched.json": "578c3c90b0a0de680023e89f913e1b9f54f2619d7dfd2877c14ba8aa2d8a7bea",
    "docs/data/record-source-review/spirit-actions.json": "89e79ad81da75a4d4205dd5db197609b26e0a03fe750f2e2611c54e5b70d603f",
    "docs/data/record-source-review/starter-dependencies.json": "9788624afb1b417314b60d555b44db35dd7daa0db61981b29facef0ef3900a64",
    "docs/data/record-source-review/technical-machines.json": "3f8dfaff836fd917e130c3d4bc0dd8b2c7696d18dbb9f4418fe7efafcc615622",
    "docs/data/record-source-review/temporary-species.json": "fac63d37f6bd5560786efc5e814f807931d94ba13be573ad02835d3f002ac774",
    "docs/data/recovery.json": "9bd68af20074d92e5312dfc27787755d777c72a7e88afdf5a01a1e6201b7d02c",
    "docs/data/reference-investigations.json": "f6430c9e0d8ee9f5bb97b8308552e8b7ba1e7dbb2bc4dc917f7a7e0b6508f8a4",
    "docs/data/reference-source-evidence-f4a.json": "84f1ca363401f2f643f96f03c953dae072f9942e108e4bda576e55534882928e",
    "docs/data/reference-source-evidence-f4b.json": "517323b47c68a33205b91cfb95d1ee11387ac6b5db9e3b463efb71cb6ba308d2",
    "docs/data/reference-source-evidence-f4c.json": "02bbcde4014ae6f11a89a984040ffa0fdee049e1cb336cc36465b8818e2876f5",
    "docs/data/reference-source-evidence-f4d.json": "a2c1fd4e7bcde10b8503c5abbb0b40391a97af550cdaad3e52aad87993f12ee5",
    "docs/data/references.json": "8aa029ddb35d85f16ae96d402ac3bdada661ca17404f2668dda6d8381e4b4548",
    "docs/data/regional-dex-catalog.json": "dc8816d743cd848662480dba41727c39d764f8cb646f9396914301d90e07cf35",
    "docs/data/rules-revisions.json": "cfa30b3a5917953fcc645dde18fb23b05bd7ae5e8d9f0efce41d05a616d7af26",
    "docs/data/skill-terminology-review.json": "5fa0c660c53a772c46e8fe4bd0c2482515583c3b2d1638df5ce325d2a63169a8",
    "docs/data/source-authority.json": "a6e3b1b806381850ef61dc42b3abb9c9e63eeea597087cde12de841cb7e79f54",
    "docs/data/species-unmatched-evidence.json": "5cf4705e5407cba7c6f6473b58c62dec431d24b6e4e8eccbe48a5f6e09c0cad1",
    "docs/data/supplement-rules-catalog.json": "349fb09a05ae6c5b6b5e33b520b7b57710d4353fd08764841aca26fe86f190c2",
    "docs/data/supported-content-scope.json": "aea47ea3eb39bca17869816832805dff7b446bce3a62e8d718c922fe94f72161",
    "docs/data/temporary-species-source-evidence.json": "f4224980b64fbccad4dc1206313393854dd1c835e5b8c5e4bf0391daaf3a3439"
}; // PIN_PRIOR_DATA
const G_SLICE_MEMBERSHIPS = {
    G1: 'b92fd91ccedff977100e92c238b63a4c332c8b183fd8c7f30a8b687d6ac14d4f',
    G2: 'baef6f0679d44a2246a5fbbfd384d2082a8c253db974e383470ec9edd18797bf',
    G3: '96cb9652de91acdbaa07ff471f1cb12a3b42ceda987e20ed18b9064d650b63a3',
    G4: 'c8230c6ecef6186f6e4f3279dbc674c78c42acf73491e869e479b50854972989'
};
const G_FILES = ['organization-folders', 'organization-habitats', 'organization-rolltables', 'organization-macros'].map(n => `record-source-review/${n}.json`);
export async function loadOrganizationalSourceReview(index) {
    if (!index.organizationalSourceEvidence) return {organizationalSource: null, organizationalCode: {}, organizationalPriorHashes: {}};
    if (index.organizationalSourceEvidence !== 'organizational-source-evidence-g.json') throw new Error('Invalid organizational source evidence path');
    const organizationalSource = JSON.parse(await readFile('docs/data/organizational-source-evidence-g.json', 'utf8'));
    const organizationalCode = {};
    for (const path of G_IMPLEMENTATION_PATHS) organizationalCode[path] = (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
    const organizationalPriorHashes = {};
    // Fixed, reviewed paths only. Never follow arbitrary paths supplied by JSON.
    for (const path of Object.keys(G_PRIOR_DATA_PINS)) organizationalPriorHashes[path] = digest(JSON.parse(await readFile(path, 'utf8')));
    return {organizationalSource, organizationalCode, organizationalPriorHashes};
}
export function organizationalSourceFactErrors(facts) {
    const errors = [], require = (ok, message) => {if (!ok) errors.push(message);}, clean = cleanOrganizationalSource;
    const expectedNumbers = [['dowsing.minutes', 10], ['dowsing.successThreshold', 4], ['dowsing.shardQuantity', 1], ['pickup.minutes', 5],
        ['poltergeist.optionalLevel', 40], ['transform.rangeMeters', 10], ['typedItems.boosterDamageBonus', 5], ['typedItems.boosterCost', 1800],
        ['typedItems.braceDamageReduction', 15], ['typedItems.braceCost', 2000], ['typedItems.confidePrintedTm', 100], ['typedItems.confidePrintedCost', 1000],
        ['typedItems.tmTutorPoints', 1], ['typedItems.tmTutorMoveLimit', 3], ['survival.additionalInformationMargin', 4]];
    for (const [path, expected] of expectedNumbers) require(path.split('.').reduce((v, k) => v?.[k], facts) === expected, `G printed quantity/role changed: ${path}`);
    require(JSON.stringify(facts.pickup?.bands.map(r => r.range)) === JSON.stringify([[1,5],[6,7],[8,10],[11,13],[14,16],[17,17],[18,18],[19,19],[20,20]]), 'G original Pickup nine category ranges changed');
    require(JSON.stringify(facts.luck?.bands.map(r => r.range)) === JSON.stringify([[1,4],[5,6],[7,8],[9,10],[11,12],[13,16],[17,17],[18,18],[19,19],[20,20]]), 'G original Luck ten category ranges changed');
    const requirements = [
        [facts.dowsing?.dailyUses, /half of the trainer’s Occult Education Rank/, 'daily Dowsing activation limit'],
        [facts.dowsing?.rankDice, /1d6 per Occult Education Rank/, 'rank dice rather than one total die'],
        [facts.dowsing?.terrain, /beach, cave, desert.*sandy or rocky/, 'terrain condition'],
        [facts.dowsing?.stunt, /Skill Stunt \(Dowsing\).*additional 1d6/, 'separate Stunt die'],
        [facts.dowsing?.optionalReroll, /may reroll.*6.*gaining that shard and potentially more/, 'optional six reroll retains first shard'],
        [facts.dowsing?.crystalResonance, /Prerequisites: Crystal Artificer, Skill Stunt \(Dowsing\).*additional 3d6/, 'complete Crystal Resonance parent and modifier'],
        [facts.dowsing?.optionalBook, /Rank 1 - Novice Occult Education.*\+1d6.*Rank 2 - Adept Occult Education.*additional activation.*choose a Shard Color.*all the Shards.*chosen Color/, 'optional book rank/activation/color conditions'],
        [facts.pickup?.specificItemDecision, /category of Item, but the GM decides what the specific Item is/, 'GM specific-item selection'],
        [facts.pickup?.dailyExtended, /Daily – Extended Action/, 'Pickup frequency and action'],
        [facts.luck?.parentCondition, /once per route.*1d20 Luck Roll.*chart as little or as much as you wish/, 'Luck suggested per-route/modifiable use'],
        [facts.luck?.money, /1d4 x100 bucks!/, 'Luck typed money quantity'],
        [facts.habitat?.guide, /compilation.*Pokédex PDF.*Feel free to deviate from this list/, 'habitat guidance and explicit deviations'],
        [facts.poltergeist?.original, /Standard Rotom: Move - Thunder Shock.*Wash Rotom: Move - Hydro Pump. Ability - Aqua Boost.*Fan Rotom: Move - Air Slash. Ability - Keen Eye/, 'original six-form relationships'],
        [facts.poltergeist?.optional, /level 40 or higher.*as if it that Move was on their Move List.*Standard Rotom: Levitate None.*Fan Rotom: Windveiled Hurricane/, 'optional level/availability and form rows'],
        [facts.transform?.literalMovePronoun, /gains all of the user’s Moves/, 'unrepaired printed Transform pronoun'],
        [facts.transform?.completeDefinition, /At-Will.*10, 1 Target.*copies its weight and height and Capabilities/, 'Transform use/target and copied roles'],
        [facts.transform?.unchangedStats, /user’s Stats do not change/, 'Transform unchanged Stats'],
        [facts.transform?.expiry, /switched out, KO’ d or until the end of the encounter/, 'Transform expiry alternatives'],
        [facts.transform?.voluntaryEnd, /on its turn as a free action, regaining its previous Move List/, 'Transform undo timing and restoration'],
        [facts.transform?.cannotMiss, /Transform cannot miss/, 'Transform cannot miss'],
        [facts.transform?.optionalImposter, /If the user is not Transformed.*Free-Action Interrupt/, 'separate optional Imposter condition'],
        [facts.typedItems?.booster, /\+5 Damage Bonus to all direct damage Moves of its Specific Type.*Accessory Item for Trainers/, 'damage bonus/type/user/slot roles'],
        [facts.typedItems?.brace, /holder 15 Damage Reduction against that specific Type.*Accessory Item for Trainers/, 'damage reduction and recipient/type roles'],
        [facts.typedItems?.plateCombination, /both a Type Booster and a Type Brace/, 'Plate combination'],
        [facts.typedItems?.confideMove, /target’s Special Attack is lowered 1 Combat Stage/, 'Confide recipient/stat/stage'],
        [facts.typedItems?.tmHmUses, /one-time use items.*HMs.*once per day/, 'TM versus HM uses'],
        [facts.typedItems?.tmHours, /about an hour/, 'learning delay'],
        [facts.survival?.scoutingPurpose, /learn basic information.*Apricorns or Berries/, 'Survival information versus awarded quantity'],
        [facts.fossil?.completeParent, /Paleontologist.*create an Egg.*hatched at Level 10.*Adept Pokémon Education or Survival or the Paleontologist Edge.*DC 15.*DC 18.*DC 25/, 'complete finding/revival source and distinct use conditions']
    ];
    for (const [raw, re, label] of requirements) require(typeof raw === 'string' && re.test(clean(raw)), `G printed condition/typed interpretation changed: ${label}`);
    require(facts.typedItems?.plateListedPrice === '--', 'G unlisted Plate price became a number');
    require(JSON.stringify(facts.survival?.densityDcs) === JSON.stringify([12,16,20]), 'G Survival information-check density DCs changed');
    require(facts.habitat?.nativeCredit === 'https://theworldofpokemon.com' && facts.habitat.creditedSourceFetched === false && facts.habitat.taxonomyAliasesEstablished === false, 'G habitat credit/authority boundary changed');
    require(facts.habitat?.uniformProbabilitiesEstablished === false && facts.luck?.currencyConversionImplemented === false && facts.survival?.currentForagingQuantityFrameworkEstablished === false,
        'G source guidance promoted a distribution, conversion or foraging framework');
    require(facts.productionPolicyPromotion === false && facts.behavioralVerification === 'not-run' && facts.sourceAbsenceClaim === false, 'G source-only limits changed');
    return errors;
}
export function checkOrganizationalSourceReview(bundle, context) {
    const {fail, rows, actualMap, hash, equal, textHash, citations} = context, audit = bundle.organizationalSource,
        g = bundle.batchManifest?.batches.find(b => b.id === 'G');
    const gRows = G_FILES.flatMap(path => bundle.files[path]?.records ?? []);
    if (!audit) {
        fail(!bundle.index.organizationalSourceEvidence && g?.status === 'not-started' && !gRows.length && !g.slices.length,
            'G source evidence missing for an advanced/current G queue');
        return;
    }
    fail(audit.batch === 'G' && audit.startingRevision === '2d2ee622b75d9715b3315ef6489f886036a04872' && audit.membershipSha256 === G_MEMBERSHIP
        && g?.membershipSha256 === G_MEMBERSHIP && equal(audit.originalTuples, g.members), 'G original frozen tuple membership/base changed');
    fail(audit.sourceFingerprint === bundle.index.sourceFingerprint && audit.diagnosticSha256 === bundle.batchManifest.candidateSnapshot.sha256,
        'G source/diagnostic fingerprint changed');
    fail(audit.schemaVersion === 1 && audit.acceptedFSourceRevision === '725105cf078452cb9a5d3c4dc487395d269f36d4'
        && equal(audit.acceptedBaseCi, {run:40822763341,documentation:123278759463,validation:123278759822,tests:1575})
        && audit.scope === 'PTU1.05/Generations1–8 source examination only; no scope from names, sprites or folders; exact prior exclusions preserved without target mechanics; independently used older/shared targets retained.',
        'G accepted-base evidence or Generations1–8 scope changed');
    fail(hash(bundle.batchManifest.batches.filter(b => b.id !== 'G')) === G_NON_G_METADATA && audit.nonGMetadataSemanticSha256 === G_NON_G_METADATA,
        'G earlier acceptance/nonG metadata or held H changed');
    const f = bundle.batchManifest.batches.find(b => b.id === 'F');
    fail(f.status === 'source-comparisons-complete' && f.acceptance?.status === 'accepted-source-examination'
        && f.acceptance.revision === '725105cf078452cb9a5d3c4dc487395d269f36d4' && f.acceptance.ciRun === 40812840976,
        'G requires the exact substantively accepted F predecessor');
    fail(audit.fullGAcceptance === false && audit.pendingIndependentCoordinatorAndPlannerAcceptance === true && audit.HClosure === false
        && audit.productionPolicyPromotion === false && audit.behavioralVerification === 'not-run' && audit.sourceAbsenceClaim === false,
        'G source checkpoint promoted acceptance/H/production/behavior or source absence');
    const pending = g.acceptance?.status === 'pending-substantive-review';
    const accepted = g.acceptance?.status === 'accepted-source-examination' && /^[a-f0-9]{40}$/.test(g.acceptance.revision ?? '')
        && Number.isInteger(g.acceptance.ciRun) && g.acceptance.sourceEvidenceSemanticSha256 === hash(audit)
        && equal(g.acceptance.reviewedCounts, {reviewed:206, unresolved:39})
        && g.acceptance.validationReport === 'docs/validation/2026-10-29-g-source-review.md#substantive-full-g-acceptance'
        && g.acceptanceHistory?.[0]?.status === 'pending-substantive-review';
    fail(g.status === 'source-comparisons-complete' && (pending || accepted), 'G current closure lacks pending review or exact later substantive acceptance evidence');
    fail(gRows.length === 245 && Object.keys(audit.rootExaminations).length === 245 && Object.keys(audit.rootCurrentDocuments).length === 245
        && equal(g.closure?.counts, {reviewed:206, unresolved:39}) && equal(audit.closure?.counts, {reviewed:206, unresolved:39}), 'G complete kind-specific counts changed');
    fail(Object.keys(audit.priorPayloadPins).length === 41 && Object.entries(audit.priorPayloadPins).every(([p, h]) => bundle.files[p] && hash(bundle.files[p]) === h), 'G prior A–F payload changed');
    fail(equal(audit.priorDataPins, G_PRIOR_DATA_PINS) && equal(bundle.organizationalPriorHashes, G_PRIOR_DATA_PINS), 'G prior whole audits/catalog/policy evidence changed');
    const primitives = {parentContexts:audit.parentContexts, nativeContexts:audit.nativeContexts, implementationContexts:audit.implementationContexts};
    fail(hash(primitives) === G_SOURCE_PRIMITIVES && audit.closure.sourcePrimitivesSemanticSha256 === G_SOURCE_PRIMITIVES, 'G independently read complete source/native/code primitives changed');
    fail(equal(organizationalSourceFacts(audit), audit.sourceFacts), 'G source facts do not reconstruct from original full parents');
    for (const error of organizationalSourceFactErrors(organizationalSourceFacts(audit))) fail(false, error);
    fail(audit.parentContexts.length === 30 && audit.nativeContexts.length === 5 && audit.implementationContexts.length === 15, 'G source parent/context coverage changed');
    for (const p of audit.parentContexts) {fail(p.completePage && textHash(p.rawText) === p.rawTextSha256, 'G incomplete/stale whole original page: ' + p.id); citations(p);}
    for (const code of audit.implementationContexts) {
        const current = bundle.organizationalCode[code.path];
        fail(G_IMPLEMENTATION_PATHS.includes(code.path) && typeof current === 'string' && textHash(current) === code.canonicalLfSha256 && code.codeExecuted === false,
            'G macro/interface implementation binding changed: ' + code.path);
        if (typeof current === 'string') for (const part of code.contexts) fail(current.split(/\n/).slice(part.startLine - 1, part.endLine).join('\n') === part.rawText,
            'G implementation context does not match exact saved lines: ' + code.path);
    }
    const prior = new Map(Object.entries(bundle.files).filter(([p]) => Object.hasOwn(audit.priorPayloadPins, p)).flatMap(([file, data]) => data.records.map(row => [row.identity, {file,row}])));
    const kindCounts = {}, seen = new Set();
    for (const [sliceIndex, path] of G_FILES.entries()) {
        const file = bundle.files[path], slice = g.slices.find(s => s.id === `G${sliceIndex + 1}`);
        fail(file && slice && slice.membershipSha256 === G_SLICE_MEMBERSHIPS[slice?.id] && hash(file) === slice?.closure.evidenceSemanticSha256
            && hash(file) === audit.closure.recordEvidenceSemanticSha256[slice?.id], 'G exact slice record/closure evidence changed: ' + path);
        for (const row of file?.records ?? []) {
            seen.add(row.identity); const actual = actualMap.get(row.identity), saved = audit.rootCurrentDocuments[row.identity], entry = audit.rootExaminations[row.identity], detail = row.sourceComparison?.organizationalReview;
            if (!actual || !saved || !entry || !detail) {fail(false, 'G complete current/root examination missing: ' + row.identity);continue;}
            const doc = actual.data, kind = organizationalKind(doc); kindCounts[kind] = (kindCounts[kind] ?? 0) + 1;
            fail(actual.contentHash === row.contentHash && hash(doc) === saved.contentHash && equal(doc, saved.document) && entry.contentHash === row.contentHash,
                'G actual complete current root/metadata changed: ' + row.identity);
            fail(hash(row) === entry.dispositionEvidenceSha256 && hash(detail) === entry.examinationSha256 && row.ruleVersionReview.basis === detail.specificAssessment
                && detail.sourceExaminationComplete === true && detail.sourceAbsenceClaim === false && detail.canonicalRelationshipClaim === false
                && detail.wholeCurrentVersionApproved === false && detail.supportedGenerationApproved === false && detail.actualBehavior === 'not-run' && detail.productionPolicyPromotion === false,
                'G precise disposition/source-only boundary changed: ' + row.identity);
            fail(equal(row.fieldReview.map(v => v.recordFieldPath), Object.keys(doc)) && row.fieldReview.every(v => equal(v.recordValue, doc[v.recordFieldPath]) && v.recordJsonSha256 === hash(doc[v.recordFieldPath])),
                'G complete actual field/result/command coverage changed: ' + row.identity);
            fail(equal(row.normativeFieldCoverage.allTopLevelFields, Object.keys(doc)) && row.normativeFieldCoverage.organizationalMetadataIsNotGameplay === (kind === 'folders'), 'G folder collection/gameplay kind conflated: ' + row.identity);
            const derived = kind === 'folders' ? organizationalFolderFacts(row.identity, doc, actualMap, prior, hash)
                : kind === 'macros' ? organizationalMacroFacts(row.identity, doc, audit.implementationContexts) : organizationalTableFacts(doc, actualMap, prior, hash);
            fail(equal(derived, detail.currentExtraction), 'G exhaustive current interpretation/relationships changed: ' + row.identity);
            fail(equal(entry.directReferences, organizationalReferences(doc)) && equal(entry.literalFields, organizationalLiteralFields(doc)), 'G modern/legacy/nested path literal changed: ' + row.identity);
            fail(detail.sourceParentIds.every(id => audit.parentContexts.some(p => p.id === id)) && detail.sourceFactGroups.every(id => Object.hasOwn(audit.sourceFacts, id)), 'G unrelated/missing source-parent/fact link: ' + row.identity);
            if (kind === 'folders') fail(detail.kind === 'folders' && row.coverageState === 'reviewed' && derived.organizationOnly && !derived.cycle
                && derived.parentChain.every(p => p.exactFolderKind && p.collectionType === doc.type) && derived.gameplayItemClassification === false && derived.contentScopeInheritedFromFolder === false,
                'G folder hierarchy/provenance review became gameplay/scope approval: ' + row.identity);
            if (kind === 'tables') fail(derived.actualDrawBehavior === 'not-run' && derived.arithmeticOnly && !derived.probabilitiesOrSelectionAuthorityApproved && !derived.scopeFilterImplemented,
                'G table fields/arithmetic promoted actual draws/probabilities/filtering: ' + row.identity);
            if (kind === 'macros') fail(derived.codeExecuted === false && derived.actualPermissionBehavior === 'not-run' && derived.actualSideEffects === 'not-run' && !derived.sourceVersionOrCanonicalTargetApproved,
                'G macro static source promoted execution/permissions/canonical identity: ' + row.identity);
        }
    }
    fail(seen.size === 245 && equal(kindCounts, {folders:197,tables:42,macros:6}), 'G original _key-kind partition changed');
    const dispositions = G_FILES.flatMap(p => bundle.files[p]?.records ?? []).map(r => ({identity:r.identity,contentHash:r.contentHash,coverageState:r.coverageState,examination:r.sourceComparison.organizationalReview}));
    fail(hash(dispositions) === G_DISPOSITIONS && audit.closure.examinedDispositionsSemanticSha256 === G_DISPOSITIONS, 'G individually examined identity/kind/source dispositions changed');
    const targetIds = new Set(Object.values(audit.rootCurrentDocuments).flatMap(r => organizationalReferences(r.document).map(l => l.targetIdentity)));
    fail(targetIds.size === 1394 && equal([...targetIds].sort(), Object.keys(audit.targetSnapshots).sort()) && hash(audit.targetSnapshots) === audit.closure.targetSnapshotsSemanticSha256,
        'G exact root target snapshot set changed');
    let excluded = 0, missing = 0;const nestedExcluded = [];
    for (const [identity, snap] of Object.entries(audit.targetSnapshots)) {
        const actual = actualMap.get(identity), p = prior.get(identity), scopeExcluded = p?.row.coverageState === 'excluded';
        fail(snap.identity === identity && snap.contentHash === (actual?.contentHash ?? null) && snap.priorRecordFile === (p?.file ?? null)
            && snap.priorDispositionSha256 === (p ? hash(p.row) : null) && snap.priorCoverage === (p?.row.coverageState ?? null)
            && snap.sourceGenerationOrVersionApprovalGranted === false && snap.mechanicalExaminationPerformed === false,
            'G target identity/current/prior chronology or approval changed: ' + identity);
        if (scopeExcluded) {excluded++;fail(snap.excludedMechanicalSnapshotOmitted && snap.document === null && equal(snap.priorGenerationReview, p.row.generationReview), 'G excluded-only target mechanics restored/examined: ' + identity);}
        else {if (!actual) missing++;fail(snap.excludedMechanicalSnapshotOmitted === false && equal(snap.document, actual?.data ?? null), 'G older/shared or missing target snapshot changed: ' + identity);}
        if (actual && !scopeExcluded) for (const ref of organizationalReferences(actual.data)) {const targetPrior = prior.get(ref.targetIdentity);if (targetPrior?.row.coverageState === 'excluded') nestedExcluded.push({sourceIdentity:identity,sourceContentHash:actual.contentHash,...ref,
            targetContentHash:actualMap.get(ref.targetIdentity)?.contentHash??null,scopeProofFile:targetPrior.file,scopeProofSemanticSha256:hash(targetPrior.row.generationReview),targetMechanicsExamined:false,olderSharedConsumerExcludedByAssociation:false});}
    }
    fail(excluded === 75 && missing === 32 && equal(nestedExcluded, audit.nestedExcludedEdges) && nestedExcluded.length === 12, 'G exact excluded/missing targets or independent older/shared consumers changed');
    const expectedIncoming = [], contexts = {};
    for (const actual of actualMap.values()) for (const ref of organizationalReferences(actual.data).filter(r => seen.has(r.targetIdentity))) {
        const excludedConsumer = prior.get(actual.identity)?.row.coverageState === 'excluded', match = ref.path.match(/^\$\.pages\[(\d+)\]/), path = match ? `$.pages[${match[1]}]` : '$', doc = match ? actual.data.pages[Number(match[1])] : actual.data, key = actual.identity + ':' + path;
        expectedIncoming.push({sourceIdentity:actual.identity,sourceContentHash:actual.contentHash,...ref,contextKey:key,excludedOnlyConsumer:excludedConsumer});
        contexts[key] ??= {sourceIdentity:actual.identity,contextPath:path,contextHash:hash(doc),contextDocument:excludedConsumer?null:doc,excludedMechanicalSnapshotOmitted:excludedConsumer,
            priorDispositionSha256:prior.has(actual.identity)?hash(prior.get(actual.identity).row):null,nativeContextDoesNotCloseH:true};
    }
    fail(equal(expectedIncoming, audit.incomingReferences) && equal(Object.values(contexts), audit.incomingUseContexts), 'G full incoming use/native context or exact path changed');
    fail(equal(audit.nativeContexts, Object.values(contexts).filter(c => c.sourceIdentity.startsWith('journals.'))), 'G native use contexts do not match actual pages');
    fail(hash(audit.historicalRegistry) === G_HISTORY_REGISTRY && audit.historicalRegistry.length === 4
        && audit.historicalRegistry.reduce((n,r)=>n+r.treeLines.length,0) === 54
        && audit.historicalRegistry.reduce((n,r)=>n+r.filePins.length,0) === 407,
        'G same-repository archive/tree/file provenance changed');
    fail(hash(audit.historicalObservations) === G_HISTORY && audit.closure.historicalObservationsSemanticSha256 === G_HISTORY && audit.historicalObservations.length === 980, 'G actual same-ID historical observations changed');
    let historyFound = 0, missingEmbedded = 0;
    for (const h of audit.historicalObservations) {
        const current = actualMap.get(h.identity)?.data;
        fail(seen.has(h.identity) && current && h.key === current._key && ['found','not-found','pack-not-present-in-revision'].includes(h.status), 'G historical membership/status changed');
        if (h.status !== 'found') {
            fail(h.document === null && (h.status === 'not-found'
                ? h.databaseReadPerformed && h.rawValueReturned === 'undefined' && !Object.hasOwn(h, 'rawDatabaseValue')
                : !h.databaseReadPerformed && h.rawValueReturned === 'not-read' && h.rawDatabaseValue === null),
            'G absent-key versus absent-pack historical representation changed');
            continue;
        }
        historyFound++;fail(h.sameStableId && h.document?._id === current._id && hash(h.document) === h.contentHash, 'G historical exact-ID/body changed');
        const reconstructed = structuredClone(h.rawDatabaseValue);
        if (organizationalKind(current) === 'tables') {const byId = new Map(h.rawEmbeddedResults.map(e => [e.document._id,e.document])); reconstructed.results = (h.rawDatabaseValue.results ?? []).map(id => byId.get(id) ?? null);missingEmbedded += reconstructed.results.filter(x => x === null).length;}
        fail(equal(reconstructed, h.document) && h.missingEmbeddedIds.length === 0, 'G historical results lost parent ID order or embedded objects');
        const keys = [...new Set([...Object.keys(current),...Object.keys(h.document)])];
        fail(equal(keys, Object.keys(h.fieldComparisons)) && keys.every(k => {const f=h.fieldComparisons[k];return f.currentPresent===Object.hasOwn(current,k)&&f.historicalPresent===Object.hasOwn(h.document,k)
            &&f.currentSha256===hash(current[k]??null)&&f.historicalSha256===hash(h.document[k]??null)&&f.equal===(JSON.stringify(current[k])===JSON.stringify(h.document[k]));}), 'G full raw historical/current field comparison changed');
    }
    fail(historyFound === 465 && missingEmbedded === 0, 'G found history or complete embedded boundary counts changed');
    fail(hash(audit.missingTargetHistoricalObservations) === G_MISSING_HISTORY && audit.missingTargetHistoricalObservations.length === 128
        && audit.missingTargetHistoricalObservations.every(h => !actualMap.has(h.identity) && audit.targetSnapshots[h.identity] && h.status==='exact-key-found' && h.document?._id===h.identity.split('.')[1] && hash(h.document)===h.contentHash && h.mechanicalExaminationPerformed===true),
        'G available exact missing-target histories were lost, invented, restored or misclassified');
    const qa = audit.localOriginalQa;
    fail(hash(qa) === G_QA && qa.originalFiles===5 && qa.parentPages.length===30 && qa.visualInspectionComplete===true && Object.keys(qa.visuallyInspectedImageSha256).length===7
        && qa.parentPages.every(p => {const source=audit.parentContexts.find(s=>s.id===p.id);return source&&p.exactCachedTextMatch&&p.sourceSha256===source.source.sha256&&p.freshExtractSha256===textHash(source.rawText);}), 'G fresh original/full-page/actual visual QA changed');
    fail(audit.foundationAssessment.supportedRouteContradictionReproduced===false && audit.foundationAssessment.macroOrFoundryExecution==='not-run'
        && audit.foundationAssessment.newRuntimeCertification===false && audit.foundationAssessment.missingIndependentSpiritCrWeatherAdaptationAuthorityCarriedForward===true
        && audit.foundationAssessment.advisoryFeatureEdgeAcquisitionPreserved && audit.foundationAssessment.actualUseConditionsSeparate
        && equal(audit.foundationAssessment.requiredReopenIfDemonstrated,['P02-A','P02-P','P03-NPC']), 'G foundation assessment waived a demonstrated contradiction or claimed unrun behavior');
}
