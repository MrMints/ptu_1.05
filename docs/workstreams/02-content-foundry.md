# PTU 02 - Content recovery and Foundry integration

Status: NOT STARTED. Creation of a chat is not authorization to work. Wait for the owner to explicitly start this section. No tool calls, research, edits, tests, commits, messages or background work before that instruction.

## On explicit start
Read `AGENTS.md`, `docs/CHAT_PLAN.md`, `docs/STATUS.md` and this file. Check the current branch, working tree and relevant dependency handoffs. The saved baseline may be stale; do not repeat completed work. Only one chat may edit the shared checkout or use the shared Foundry data directory at a time.

## Dependencies
Foundation baseline. Foundry v13.351 currently reaches license activation only; the owner must complete normal licensing/setup before in-world checks.

## Scope
Own clean installation, historical content reconciliation, manifest/pack integrity, isolated Foundry setup and startup failures. Investigate the 682 unresolved explicit compendium targets, distinguishing runtime references from historical metadata. Recover only evidence-backed missing content with provenance and stable IDs. Coordinate the shared test-world session; other chats must not start another process against the same data directory.

## Targeted context
docs/TESTING.md; docs/data/recovery.json; docs/data/content-audit.json; tools/packs.mjs; tools/build.mjs; tools/foundry-setup.mjs; system.json; relevant packs/*/_source files. GitHub issue #1.

## Completion gate
A clean checkout builds and installs; every declared pack loads in v13.351; missing content and unresolved references have explicit dispositions; startup/integration evidence is recorded.

## Outside this scope
Certification of move rules, standard/revised selection, broad automation or overwriting user campaigns.

## Handoff
When an authorized batch ends, record its commit/PR, changed files, source decisions, exact tests and outcomes, unresolved issues, next bounded action and downstream interface changes here. Keep this concise; link larger evidence instead of copying it. Update relevant status/ledger/changelog documentation in the same PR. Report implemented, verified and automated separately. Do not start or message another chat automatically.

