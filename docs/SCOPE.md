# Supported content scope

Owner decision, 2026-10-25: this project uses **PTU 1.05 mechanics plus approved Pokémon content from Generations 1–8 only. Generation 9 and later are excluded.** This is a project scope boundary, not a claim that the original core book contains every generation or that every inherited fan-made record is approved.

The [content-selection amendment](PRE_05_RECONCILIATION.md) applies to every section. Original/non-errata and revised alternatives for Moves, Abilities, Features and Edges remain separately selectable when source-backed, with accurate edition/status labels. Features/Edges are addable to any supported trainer/Pokémon despite unmet game-rule prerequisites, with persistent itemized non-blocking unmet/unverifiable diagnostics. This owner policy does not rewrite printed prerequisite facts, approve unclassified content, bypass permissions, change effect-use conditions or expand Generation scope. Earlier ambiguous “check prerequisites” or “before acquisition” policy wording cannot impose a game-prerequisite veto.

## Applies to every section

- Recovery, source interpretation, standard/revised variants, skill/gameplay fixtures, move verification, automation, browsing/acquisition and release acceptance must stay within Generations 1–8.
- Exclude species/forms, moves, abilities, items and mechanics introduced in Generation 9, as well as Generation 9-specific revisions of older content. Keep the approved PTU rules version for older content; do not import newer game balance changes silently.
- Earlier wording such as "all supplied content", "all inherited moves", "later generations" or bulk standard/revised presets does not expand this boundary. Mixed references may be inventoried, but only approved in-scope portions inform supported behavior.
- Use source provenance and stable document identity to classify content. Labels, a shared name, a stored slug or association with an excluded Pokémon are not sufficient to establish a target's generation. Unclassified records require review and do not automatically become supported content.

## Inherited content and references

Preserve original local reference documents, historical audit results, stable IDs, user-authored content and saved campaigns. This decision does not authorize blanket deletion or silent rewrites. Compatibility measures that protect saved data do not grant support to Generation 9 gameplay.

Separate inventory size from supported-scope totals and verification coverage. Mark excluded and unclassified content separately; neither counts as verified. Do not expand the supported denominator to all 1,184 inherited move rows or all 7,395 recovered records.

The existing audit found 24 missing active targets referenced by Dipplin, Hydrapple and the Terapagos effect. Those consumers are outside the selected scope. Their unresolved links remain recorded as historical failures; recovering them solely for these consumers is not required for Generation 1–8 acceptance. A target may itself be older/shared content: independently evidenced in-scope consumers still require investigation. The [scope ledger](data/supported-content-scope.json) records the current consumer IDs and audit fingerprint; changed consumers invalidate that disposition until reviewed. The 658 provenance targets remain preserved with their documented compatibility caveat.

## Planned enforcement and ownership

| Owner | Required work when explicitly started |
| --- | --- |
| 01 | Keep repository rules, documentation and CI scope claims consistent. |
| 02 | Inventory inherited content, exclude Generation 9-only recovery from acceptance, and implement safe packaging/content separation when evidence is sufficient. Use Generations 1–8 integration fixtures. |
| 03 | Complete skill compatibility with in-scope fixtures while preserving shared stable skill APIs. |
| 04 | Supply authoritative content/version classifications and source precedence; distinguish approved, excluded and unclassified records. |
| 05 | Apply those classifications to content browsing/acquisition and variant presets; preserve existing campaign selections. |
| 06 | Verify shared calculations under approved rules without adding Generation 9-specific mechanics. |
| 07 | Audit only in-scope move versions; report excluded/unclassified inventory separately. |
| 08 | Automate verified in-scope behavior only. |
| 09 | Verify shipped playable packs, new-world browsing/acquisition, presets and installation artifacts exclude Generation 9 content; validate upgrade/custom-data preservation. |

The eventual supported release must omit Generation 9 playable content from shipped packs and new-content selection, while preserving existing campaign data through a documented compatibility approach. A future release must not quietly ship excluded content simply because its source records were retained for provenance.

**Current state:** PTU 02 implements partial stable-ID guards for the three reviewed exclusions at browser/actual compendium acquisition, new rule-grant and generator boundaries. Saved Item restoration/copy preserves provenance and user data. The [source inventory](data/content-eligibility.json) defaults unreviewed records to unclassified and separates generation eligibility, rule-version approval and verification. Development candidates retain inherited records and original pack UUID resolution, including excluded records. Supported builds/releases refuse incomplete classification/dependencies; physical supported-package exclusion and complete UI selection are not implemented. See the [bounded correction](validation/2026-10-25-corrective02.md). Full catalog approval belongs to 04, selection/version design to 04/05 and supported-release/upgrade acceptance ultimately to 09. The original 02 install/pack-load/missing-inventory gate and amended P03/P02-P/P02-A foundations are accepted within the [current ledger](PRE_05_RECONCILIATION.md); none passes future release scope. Keep the PR in draft. No idle chat is started by this correction.
