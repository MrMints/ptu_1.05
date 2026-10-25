# Implementation status

Current batch: project foundation, historical pack recovery, and core skill terminology. Work pauses after this batch at the owner's request. The six-milestone roadmap is not complete.

The next work is organized into nine idle local project chats in [CHAT_PLAN.md](CHAT_PLAN.md).
Each chat must wait for an explicit start; creating the chats does not resume implementation.

## Implemented

- Repository rules, contribution guidance, issue/PR templates, changelog, CI documentation/validation jobs and a gated draft-release workflow.
- Readable JSON sources for 7,395 documents in 15 declared packs, with historical provenance and unchanged document IDs. Removed 2,485 exactly duplicated embedded records from 41 exports; conflicting duplicates are rejected. See `data/export-repairs.json`.
- Build and semantic round-trip tooling, an isolated Foundry setup, source checksums for 26 supplied references, and a move verification ledger.
- Eight corrected English skill names; stable identifiers, core/Carbon alias resolution, sheet presentation for existing actors, and explicit Education key classification.

## Verified in the local batch

- Seven focused tests pass: skill mappings, alias normalization, stored-value preservation, Education classification, documentation gates, and duplicate-record handling.
- Manifest paths, 17 skill definitions and 7,395 source documents validate.
- All 15 packs compile and round-trip with semantic equality and stable IDs.
- The archive builds and contains all declared pack manifests; supplied references, test data and source JSON are excluded.
- Foundry v13.351 starts with the isolated data directory and reaches license activation. No in-world checks have run. The inherited manifest verification version has not been raised.

## Remaining acceptance work

- [Integration and content reconciliation (#1)](https://github.com/MrMints/ptu_1.05/issues/1): license/setup, pack loading, actors, prerequisites, generators, macros, permissions, reloads and selective compendium terminology corrections. The audit records 682 unresolved explicit compendium reference targets, including historical metadata. This count is an investigation inventory, not a count of confirmed runtime failures.
- [Rules and revisions (#2)](https://github.com/MrMints/ptu_1.05/issues/2): sourced standard/revised content and independent mechanic switches are not implemented.
- [Moves and automation (#3)](https://github.com/MrMints/ptu_1.05/issues/3): 1,184 inherited moves are inventoried; zero are claimed verified by this batch. Existing automation has not been certified against core rules.

No public release is created, no version is incremented, and the development branch is not merged. Review this batch as a draft until integration limitations are resolved. Automated documentation checks establish structure; a reviewer must assess accuracy.
