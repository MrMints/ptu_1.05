# PTU 1.05 roadmap

All work belongs to MrMints/ptu_1.05. Target Foundry v13.351 first. Preserve `Core System/` locally.

Supported content stops at **Generation 8**, using PTU 1.05 mechanics and approved supporting material. This does not mean the original core book contains every later generation. Generation 9 inherited data is excluded from intended support, and inventory totals are not supported-content totals. Preserve existing IDs, user content and campaigns; the compatibility-safe exclusion from new-content browsing/acquisition and release scope is planned in [the scope ledger](docs/data/supported-content-scope.json), not yet implemented.

[The scope policy](docs/SCOPE.md) governs all milestones: **Generations 1–8 only; Generation 9 and later excluded**. The saved plan and all chat briefs must be interpreted within this boundary.

The [owner amendment and pre-05 correction ledger](docs/PRE_05_RECONCILIATION.md) govern selectable original/revised content and non-blocking Feature/Edge prerequisites. Affected prior gates reopen without invalidating unchanged historical evidence. Sequential corrections run 03 evaluator/solver → 02 preservation/acquisition/display → 01 evidence checks → 04 remaining source review, each only on explicit assignment. 05 remains blocked until those corrections and full original 04 are substantively accepted. D is held under this amended dependency order.

| Milestone | Gate |
| --- | --- |
| 1. Foundation and documentation | Documented PRs, required checks, Issues, squash-only merges and default-branch protections |
| 2. Reproducible content and testing | Complete in-scope source packs, stable IDs, clean install, isolated test world and explicit excluded-content inventory |
| 3. Skill terminology | Eight restored core labels; unchanged numeric behavior and old-name prerequisite compatibility |
| 4. Rules revisions | Sourced individually selectable content versions, independent mechanic switches, standard new-world defaults |
| 5. Gameplay and move verification | Shared calculations verified; every in-scope move/version through Generation 8 has an explicit outcome and automation coverage |
| 6. Automation and releases | In-scope assisted actions, Generation 9 excluded from shipped playable content/new acquisition, documented limitations, tested installation and upgrades |

Prioritize data loss/startup errors, incorrect gameplay, missing automation, then cosmetics. Defer newer Foundry majors.

## Focused chats
Execute this roadmap through the nine scoped chats in [the chat plan](docs/CHAT_PLAN.md).
Milestones 4–6 are split into source catalog/selection, shared gameplay/move review, and automation/release validation.
Each chat starts idle and needs an explicit owner start instruction. Only one chat edits the shared checkout at a time.
Use its section brief and concise dependency handoffs instead of copying the full planning conversation.

## Rules policy
The [section-04 source guide](docs/RULES_SOURCES.md) and its linked catalogs record source interpretations,
specific manual conflicts and completed required readable coverage. Historical/identity evidence limits remain
explicit. Source review does not promote runtime/build approval or implement variants.

The core book is the standard baseline. Catalog May/September 2015 and February 2016 revisions separately.
Later explicit revisions supersede earlier ones only in the revised version. Supplements and newer Pokédex
material do not silently override core. Conflicts need a documented ruling before verification.

Features, Edges, Moves and Abilities retain separately selectable source-backed original/non-errata and
revised alternatives where applicable, with distinct variant document IDs, evidenced shared canonical
identities, accurate official-errata/optional-playtest labels and visible filters. Do not invent counterparts
or use chronology to remove an available original. Replacements preserve relevant actor state and saved/custom
selections; alternate versions cannot silently stack duplicate benefits. Features and Edges, including Poké Edges,
are addable to supported trainers and Pokémon despite unmet game-rule prerequisites. Show visible persistent
itemized non-blocking warnings for the selected version, distinguishing unmet from unverifiable/custom requirements.
Do not silently raise ranks/add dependencies or retain a contradictory rejection on another add route. Ownership,
scope and actual effect-use conditions remain separate. General mechanics
need individual world switches and bulk presets. World settings never silently replace chosen items.
Existing-world choices need versioned, repeatable migrations; ambiguous legacy rules require review.

## Automation contract
Extend existing rule elements incrementally. Separate calculations from document updates. Consequential
changes use calculate/review/apply, ownership checks, duplicate-application protection and a chat record.
Cancellation changes no state. Undefined interactions require visible manual adjudication.

## Evidence
`docs/data/references.json` inventories supplied documents. `docs/data/recovery.json` identifies recovered databases.
`docs/data/move-verification.json` tracks each recovered move; `docs/data/content-audit.json` records structural findings.
Implemented, verified and automated are different statuses. Structural validation is not gameplay verification.
See `docs/TESTING.md` for release gates and `docs/STATUS.md` for actual results.
