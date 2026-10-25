# PTU 02 - Content recovery and Foundry integration

Status: Reference classification/investigation batch completed on 2026-10-25. Remaining section acceptance work needs a new explicit batch start. Stop with the handoff below; do not start other sections.

## On explicit start
Read `AGENTS.md`, `docs/CHAT_PLAN.md`, `docs/STATUS.md` and this file. Check the current branch, working tree and relevant dependency handoffs. The saved baseline may be stale; do not repeat completed work. Only one chat may edit the shared checkout or use the shared Foundry data directory at a time.

## Dependencies
Foundation baseline in draft PR #4. The owner completed normal licensing/setup for the isolated Foundry v13.351 instance during this batch; the disposable world now launches.

## Scope
Own clean installation, historical content reconciliation, manifest/pack integrity, isolated Foundry setup and startup failures. Investigate the 682 unresolved explicit compendium targets, distinguishing runtime references from historical metadata. Recover only evidence-backed missing content with provenance and stable IDs. Coordinate the shared test-world session; other chats must not start another process against the same data directory.

## Targeted context
docs/TESTING.md; docs/data/recovery.json; docs/data/content-audit.json; tools/packs.mjs; tools/build.mjs; tools/foundry-setup.mjs; system.json; relevant packs/*/_source files. GitHub issue #1.

## Completion gate
A clean checkout builds and installs; every declared pack loads in v13.351; missing content and unresolved references have explicit dispositions; startup/integration evidence is recorded.

## Outside this scope
Certification of move rules, standard/revised selection, broad automation or overwriting user campaigns.

## Latest handoff — reference classification, 2026-10-25

- Runtime/content baseline: `5e4946a7a09a0ab3605b3b33b27f4f1624617e0d`, branch `codex/ptu-foundation`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). This follow-up changes audit/test tools and documentation only. Source packs, IDs and runtime code are unchanged.
- Implemented: reference classification in `tools/compendium-references.mjs` and the existing audit command; JSON occurrence/disposition ledgers; fixture preparation and GM reference diagnostic; five focused tests. See the [investigation/evidence](../validation/2026-10-25-compendium-references.md).
- Verified: all 682 targets and 1,380 occurrences covered. Preserve 658 provenance targets (667 feats, 1,334 occurrences) with a legacy runtime caveat. All 24 active targets (46 occurrences in Dipplin, Hydrapple and the Terapagos Normal Forme effect) fail live resolution. Dry runs omit selected missing items; TemporarySpecies throws on a null target. Core import preparation stamps current UUIDs for all 667 affected feats, with legacy flags absent.
- Dispositions: every target is recorded. The 24 content targets remain `unresolved-no-identity-evidence`; two complete historical snapshots contain none of their exact IDs, and 10 same-stored-slug candidates do not establish identity. No recovery, retargeting, rule adjudication or provenance cleanup was performed. The total remains 682.
- Validation: five reference tests, generated-inventory/occurrence coverage, audit determinism, syntax checks and live v13.351 probes. Reuse the earlier pack/build baseline because runtime/content/build inputs are unchanged; CI results are attached to PR #4. This does not certify full generation, level-up UI, persistent actor effect application or campaign upgrades.
- Next bounded action: obtain authoritative UUID/export history for the 24 active targets, then make evidence-backed recovery or reference repairs. Track the separate v13 legacy `sourceId` accessor/import compatibility issue; do not fix it by changing historical metadata or matching display names.
- Shared session: the world returned to Setup; the managed server handle is terminal and port 30001 refused connections after stop. No actor or compendium records were written by probes. A new disposable diagnostic macro remains available. No other chat was started or messaged.

## Earlier handoff — isolated setup and pack loading, 2026-10-24

- Tested runtime/content/build baseline: `7d6bfefe80bfe9fe919505d90634f6cad2244a07`, branch `codex/ptu-foundation`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). Follow-up changes add diagnostics and evidence only; no runtime, source pack, identifier, selection or rule changes.
- Implemented: `tools/prepare-foundry-pack-check.mjs` and `tools/foundry-pack-check.macro.js`; updated testing instructions, status and Unreleased changelog. Detailed [evidence](../validation/2026-10-24-foundry-packs.md) links the machine-readable results.
- Verified: owner-activated v13.351 startup, clean archive installation, 15 pack indexes and full document/folder loads with matching source IDs and no invalid records. Totals: 7,198 documents + 197 folders = 7,395 source records. Client reload evidence is recorded in the report.
- Automated: seven tests pass with `node --test --test-isolation=none tests/*.test.mjs` (normal test workers hit sandbox `spawn EPERM`); manifest/source validation, all-pack compile/semantic round trip, archive build and installed-file checks pass. The GM pack diagnostic was executed inside Foundry; licensing, world launch and UI actions were manual/UI-driven.
- Source decisions: no recovery or rule adjudication in this batch. The 682-target unresolved-reference inventory is unchanged. A loadable pack does not prove that links, macros or rules are correct.
- Limitations: manifest unknown-key warnings (`type`, `templateVersion`), V1 application deprecations and unavailable public update manifest. Setup-helper refresh merges old database files; clean archive testing used a replacement disposable system directory with the old copy preserved in `.cache/ptu02/`. Viewport warnings prevent any layout certification. Actor sheets, player permissions, generators, rules, campaign upgrades and pack macro execution were not checked.
- Next bounded action: classify the 682 explicit reference targets by runtime field versus historical metadata, beginning with actionable runtime references. Broader in-world scenarios can reuse this pack baseline after checking runtime/content inputs.
- Downstream interface: isolated `ptu-verification` is activated and has a GM plus the diagnostic macro. Session state and shutdown are recorded in the evidence. Do not refresh or reuse the data while another process owns it; check the live process/port before starting one. No other chat is started or messaged by this handoff.

