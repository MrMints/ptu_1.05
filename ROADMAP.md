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

## Terminal cleanup and 1.0.0 publication

Terminal completion belongs to [section 09](docs/workstreams/09-release-validation.md), after accepted sections 01–08 and all required source dispositions. Preserve every existing scope, original/revised selection, advisory-prerequisite, compatibility and pre-05 gate.

First perform a bounded readability pass: clarify non-obvious intent, invariants and compatibility decisions with useful comments. Avoid cosmetic churn, redundant comments and behavior-changing refactors. Remove files only when reference, dynamic-loading, asset, build and compatibility checks demonstrate that they are obsolete; record the rationale and retain recoverable Git history. Preserve licenses/notices, required assets, migrations, IDs, campaign/custom data and audit/source evidence. Supplied originals remain local and unpackaged.

Prepare the fork's terminal release as **1.0.0**, including matching package/system metadata, repository tag convention, manifest/download destinations, dated changelog, release notes and installation instructions. Test and document the transition from inherited **4.4.3** or other higher version numbers without assuming automatic updating or resetting meaningful migration schema numbers or identities. Preserve campaign/custom selections throughout that transition.

After cleanup and release-metadata preparation, run all applicable tests and required CI against the final candidate, including packaged fresh installation, upgrades, repeated migrations, security, selected variants and preservation checks. Bind results to the actual commit and archive digest. Reconcile the final merged/tagged commit after squash merging; changed package inputs require renewed affected validation.

Follow documented PR, default-branch and draft-release gates. Record release eligibility and the owner's conditional terminal publication decision before publishing 1.0.0. This amendment authorizes neither starting 09 nor publication now.

Finish by verifying the remote default-branch documentation, release/tag target, version, public raw installation manifest, download and packaged manifest agree. Replace the actual GitHub installation placeholder/unreleased notice with verified instructions. Under **How to Install**, retain the exact subheading **PTU 1.05 Classic** and description **The original Pokemon Tabletop United 1.05 system.** These are README presentation only; they do not change the Foundry system title/ID, compatibility, schema or saved-data identity. Keep the honest unreleased notice until the terminal release supplies a verified raw manifest link.

The proposed raw entry point while the default branch remains `master` is `https://raw.githubusercontent.com/MrMints/ptu_1.05/master/system.json`; it is not a verified 1.0.0 installer today. Recheck the actual branch, remote JSON and its update/download chain, using only this repository's validated destinations. Do not report publication complete until the public installation route succeeds.
