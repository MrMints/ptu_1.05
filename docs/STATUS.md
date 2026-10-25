# Implementation status

Latest batch: PTU 02 isolated Foundry v13.351 startup and pack loading. Stop after the recorded handoff; the six-milestone roadmap and remaining PTU 02 acceptance work are not complete.

Work is organized into nine local project chats in [CHAT_PLAN.md](CHAT_PLAN.md).
Each new batch needs an explicit start; section completion does not start another chat.

## Implemented

- Repository rules, contribution guidance, issue/PR templates, changelog, CI documentation/validation jobs and a gated draft-release workflow.
- Readable JSON sources for 7,395 documents in 15 declared packs, with historical provenance and unchanged document IDs. Removed 2,485 exactly duplicated embedded records from 41 exports; conflicting duplicates are rejected. See `data/export-repairs.json`.
- Build and semantic round-trip tooling, an isolated Foundry setup, source checksums for 26 supplied references, and a move verification ledger.
- Eight corrected English skill names; stable identifiers, core/Carbon alias resolution, sheet presentation for existing actors, and explicit Education key classification.
- A repeatable disposable-world pack-loading diagnostic with source-ID expectations, separate document/folder counts and invalid-record reporting.

## Verified in the local batch

- Seven focused tests pass: skill mappings, alias normalization, stored-value preservation, Education classification, documentation gates, and duplicate-record handling.
- Manifest paths, 17 skill definitions and 7,395 source documents validate.
- All 15 packs compile and round-trip with semantic equality and stable IDs.
- The archive builds and contains all declared pack manifests; supplied references, test data and source JSON are excluded.
- The owner activated the isolated Foundry v13.351 data directory. The disposable world launches and all 15 declared packs load as GM: 7,198 content documents and 197 folders match source IDs with no invalid records. See the [pack baseline](validation/2026-10-24-foundry-packs.md) for clean archive/reload evidence and warnings. The inherited manifest verification version has not been raised; gameplay and permissions remain unverified.

## Remaining acceptance work

- [Integration and content reconciliation (#1)](https://github.com/MrMints/ptu_1.05/issues/1): actors, prerequisites, generators, pack macro behavior, permissions, campaign upgrades and selective compendium terminology corrections. Setup warnings and the helper's merge behavior are recorded in the pack baseline. The audit still records 682 unresolved explicit compendium reference targets, including historical metadata; their dispositions remain future work. This inventory is not a count of confirmed runtime failures.
- [Rules and revisions (#2)](https://github.com/MrMints/ptu_1.05/issues/2): sourced standard/revised content and independent mechanic switches are not implemented.
- [Moves and automation (#3)](https://github.com/MrMints/ptu_1.05/issues/3): 1,184 inherited moves are inventoried; zero are claimed verified by this batch. Existing automation has not been certified against core rules.

No public release is created, no version is incremented, and the development branch is not merged. Review this batch as a draft until integration limitations are resolved. Automated documentation checks establish structure; a reviewer must assess accuracy.
