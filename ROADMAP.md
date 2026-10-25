# PTU 1.05 roadmap

All work belongs to MrMints/ptu_1.05. Target Foundry v13.351 first. Preserve `Core System/` locally.

| Milestone | Gate |
| --- | --- |
| 1. Foundation and documentation | Documented PRs, required checks, Issues, squash-only merges and default-branch protections |
| 2. Reproducible content and testing | Complete source packs, stable IDs, clean install, isolated test world |
| 3. Skill terminology | Eight restored core labels; unchanged numeric behavior and old-name prerequisite compatibility |
| 4. Rules revisions | Sourced individually selectable content versions, independent mechanic switches, standard new-world defaults |
| 5. Gameplay and move verification | Shared calculations verified; every move/version has an explicit outcome and automation coverage |
| 6. Automation and releases | Assisted outcome application, documented limitations, tested installation and upgrades |

Prioritize data loss/startup errors, incorrect gameplay, missing automation, then cosmetics. Defer newer Foundry majors.

## Focused chats
Execute this roadmap through the nine scoped chats in [the chat plan](docs/CHAT_PLAN.md).
Milestones 4–6 are split into source catalog/selection, shared gameplay/move review, and automation/release validation.
Each chat starts idle and needs an explicit owner start instruction. Only one chat edits the shared checkout at a time.
Use its section brief and concise dependency handoffs instead of copying the full planning conversation.

## Rules policy
The core book is the standard baseline. Catalog May/September 2015 and February 2016 revisions separately.
Later explicit revisions supersede earlier ones only in the revised version. Supplements and newer Pokédex
material do not silently override core. Conflicts need a documented ruling before verification.

Features, Edges, Moves and Abilities need distinct variant document IDs, shared canonical identities,
revision/source metadata and visible filters. Replacements must preserve relevant actor state and
check prerequisites; alternate versions cannot silently stack duplicate benefits. General mechanics
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
