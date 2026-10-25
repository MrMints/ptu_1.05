# Implementation status

Latest batch: PTU 03 completed core skill terminology compatibility for all 17 stable skill interfaces, using Generation 1 fixtures. See the [skill acceptance matrix and limits](validation/2026-10-25-skills.md). PTU 02's starter-training/content-classification/release-exclusion blockers remain open; section-03 acceptance does not pass those gates.

Scope correction, 2026-10-25: **Generations 1–8 only; Generation 9 and later excluded**, under [SCOPE.md](SCOPE.md). Inherited packs still contain excluded records; authoritative classifications and physical package/UI exclusion remain pending. The 24 pack targets used only by the recorded excluded consumers remain preserved historical failures, not an active Generation 9 recovery requirement.

Work is organized into nine local project chats in [CHAT_PLAN.md](CHAT_PLAN.md).
Each new batch needs an explicit start; section completion does not start another chat.

## Implemented

- Repository rules, contribution guidance, issue/PR templates, changelog, CI documentation/validation jobs and a gated draft-release workflow.
- Readable JSON sources for 7,395 documents in 15 declared packs, with historical provenance and unchanged document IDs. Removed 2,485 exactly duplicated embedded records from 41 exports; conflicting duplicates are rejected. See `data/export-repairs.json`.
- Build and semantic round-trip tooling, an isolated Foundry setup, source checksums for 26 supplied references, and a move verification ledger.
- Eight corrected English skill names; stable identifiers, core/Carbon alias resolution, sheet presentation for existing actors, and explicit Education key classification.
- Complete legacy species-name resolution, core Technology Edu input, normalized/exact NPC skill prerequisites, consistent modifier labels, Education word wrapping and selective source-text corrections. See [SKILLS.md](SKILLS.md) and the field-level review ledger; no key migration or content approval.
- A repeatable disposable-world pack-loading diagnostic with source-ID expectations, separate document/folder counts and invalid-record reporting.
- A field-level reference audit and targeted live diagnostic, with explicit dispositions for all 682 unresolved targets. Historical metadata is preserved; unknown reference fields require review.
- Modern-first source accessors with legacy fallback; safe owned refresh preserves quantity, disabled state, custom labels/images and provenance. Missing sources do not trigger guessed mappings.
- Locked/staged disposable system replacement with recoverable backups, path checks and active-server refusal. Config/licensing/worlds are preserved.
- Visible warning for missing starter training instead of a trainer-creation crash, and read-only inventory defaults for observer sheets. The missing original training record is not recovered.

## Verified evidence

- PTU 03 runtime/content/CSS commit `1c586021e192cc28111c84189cb07b3a84828501`: 23 automated tests (7 skill tests), source validation, all 15 pack semantic round trips and archive build pass. All 3,495 runtime/static files match the archive and final disposable installation. See the [skill evidence](validation/2026-10-25-skills.md).
- Foundry v13.351 skill batch: all 17 skills across existing/generated trainer/Pokémon data, 183 parser cases, backgrounds, four sheet types, 34 real rolls/chat/callbacks, stable selectors, modifier/legacy helpers and 68 actual dialogs pass. Manual Pokémon Education contested flow preserves DC/outcome. Exact skill source/numeric data and populated background choices survive form close/client reload; the pre-existing empty-slot `""` → `"blank"` form normalization is explicitly recorded. General campaign upgrades, rule correctness and layout are not certified.
- Final skill world returned to Setup, managed server is terminal and port 30001 refuses connections. Only disposable fixtures/backups remain. Other chats were not started or messaged; no merge/release/version increase.

- Runtime/content/build commit `83ae248dba2415be815768a0a2c836cf3ebb11a9`: 20 tests, source/manifest validation and final archive build pass. Source packs/IDs are unchanged; prior semantic round trips apply and CI repeats them.
- Final clean archive in v13.351: all 15 packs load, 7,198 documents + 197 folders, exact source IDs and zero invalid records. New level-5 Bulbasaur generation, basic sheets, actual level-up to 7, Type Matrix macro, modern/legacy identity and repeated refresh, custom/deleted-source safety, linked/unlinked tokens, actual player owned-name edit/observer view, server restart and client reload pass within the recorded limits. See the [matrix and JSON](validation/2026-10-25-foundry-integration.md).
- Setup passed repeated real runs and an actual live-lock refusal; final archive installation preserved Config/world bytes. The world returned to Setup, the managed server is stopped, and port 30001 refuses connections. Only disposable fixtures remain. PTU 03 can proceed on unaffected paths after explicit start; other chats remain idle.

- Earlier scope-only documentation batch: all nine briefs and nine shared documents contain the boundary; 45 local links resolved then. The scope ledger matches the audit fingerprint, 24 active targets/46 occurrences and the three exact excluded consumer IDs. That batch changed no runtime/pack inputs and reran no gameplay tests.
- Earlier foundation's seven focused tests cover skill mappings, aliases, stored values, Education classification, documentation gates and duplicate-record handling; they remain included in the current 20-test run.
- Manifest paths, 17 skill definitions and 7,395 source documents validate.
- All 15 packs compile and round-trip with semantic equality and stable IDs.
- The archive builds and contains all declared pack manifests; supplied references, test data and source JSON are excluded.
- The owner activated the isolated Foundry v13.351 data directory. See the earlier [pack baseline](validation/2026-10-24-foundry-packs.md) for historical evidence. The inherited manifest verification version remains 13.350; basic integration does not certify broader gameplay or releases.
- The [reference investigation](validation/2026-10-25-compendium-references.md) classifies 1,380 occurrences: 1,334 provenance occurrences (658 targets, 667 feats) and 46 active occurrences (24 targets, Dipplin/Hydrapple/Terapagos effect). All 24 active UUIDs fail to resolve in v13.351. Targeted dry runs confirm omitted selected generator content and a TemporarySpecies constructor failure. These are confirmed failures, not passing gameplay checks.
- Five focused reference-audit tests pass, including complete coverage against current source fields. All 667 affected feats retain historical provenance; core import preparation stamps the acquired UUID. Current owned-item refresh is now verified in the narrow integration matrix; comprehensive legacy campaign migrations remain outside it.

## Remaining acceptance work

- [Integration and content reconciliation (#1)](https://github.com/MrMints/ptu_1.05/issues/1): obtain authoritative original/export identity and rule/source evidence for `edges.xiZydXM8sex5CP7O`; trainer creation warns and grants no missing training. Complete authoritative supported/excluded/unclassified content classification (04), safe packaging/acquisition separation (02/05) and release/upgrade acceptance (09). Existing enhancements/later Carbon reconciliation remains evidence-dependent. Preserve the 658 provenance targets and excluded-consumer diagnostics; do not resume Generation 9-only recovery. Section-03 skill terminology acceptance passes within its matrix; rules, variants, other macro families, move automation, general layout and campaign upgrades remain assigned work. Empty background-slot placeholder normalization remains a documented inherited UI behavior, without numeric or populated-selection loss.
- [Rules and revisions (#2)](https://github.com/MrMints/ptu_1.05/issues/2): sourced standard/revised content and independent mechanic switches are not implemented.
- [Moves and automation (#3)](https://github.com/MrMints/ptu_1.05/issues/3): 1,184 inherited moves are inventoried; zero are claimed verified by this batch. Existing automation has not been certified against core rules.

No public release is created, no version is incremented, and the development branch is not merged. Review this batch as a draft until integration limitations are resolved. Automated documentation checks establish structure; a reviewer must assess accuracy.
