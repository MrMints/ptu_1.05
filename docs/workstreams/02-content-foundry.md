# PTU 02 - Content recovery and Foundry integration

Status: Reference classification/investigation batch completed on 2026-10-25. The remaining-work instructions below are prepared, but implementation is paused until the owner explicitly starts it. Do not start other sections.

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

## Remaining-work instruction — prepared 2026-10-25

This is a parked instruction update, not a start signal. When the owner says "Start the remaining PTU 02 work," complete the addressable work below in related batches. That start authorizes continuation across these batches without asking for routine permission again. Do not stop after each batch merely to request another start. Stop at the final handoff, a user pause, or a genuine blocker that prevents further independent progress. No scheduled or automatic future runs.

### 1. Confirm and reuse the current baseline

Check the current branch, dirty files, active chat ownership and Foundry process/port before mutations. Read the latest handoff and reference investigation rather than repeating the full audit. Verify which inputs have changed since recorded passing tests. Work only in this repository and its disposable world; do not restart or overwrite a server/data directory owned by another chat. Preserve all original supplied references locally.

### 2. Bounded recovery of the 24 active missing targets

Use the existing target/occurrence/disposition ledgers and record a finite search inventory of relevant, previously uninspected repository commits, pack transitions and repository-owned historical artifacts. Search exact UUIDs and original export relationships first; skip the two snapshots already checked unless new evidence justifies returning to them. Record searched revisions and outcomes once. Do not repeatedly extract the same databases or expand into unrelated repositories.

Recover or retarget only when authoritative identity evidence supports the mapping. Same names or stored slugs alone are insufficient. Preserve document IDs and relationships; edit readable sources, rebuild affected packs, verify semantic round trips and exercise the affected generator/TemporarySpecies paths in v13.351. Preserve the 658 provenance targets; they are not a cleanup backlog.

If the bounded inventory yields no sufficient identity evidence, record the exact missing evidence and affected behavior in issue #1 and the handoff. Leave unresolved records honestly classified, without guessing replacements or silently removing content. Continue independent acceptance work. A separate defensive fix may prevent a reproduced crash or silent omission if it reports the missing dependency and leaves consequential state unchanged; this does not count as recovering or verifying the missing content.

### 3. Fix reproduced legacy source-reference compatibility

Trace the documented legacy sourceId accessor/import issue through actual v13 import, refresh and related consumers. Implement the smallest evidence-backed compatibility fix if reproducible. Preserve historical provenance and custom content; never rewrite metadata or use displayed names as identity. Test current core source identity, supported legacy identity, missing/deleted source, custom items, repeated import/refresh and relevant saved/reloaded state. Record any migration implications explicitly. Do not extend this into broad campaign migration certification owned by chat 09.

### 4. Finish the installation and integration baseline

Address the setup-helper risk of merging stale database files: require the disposable server to be stopped, validate resolved paths within the intended test area, preserve a recoverable copy, and refresh generated packs without mixing old/new database files. Verify repeated setup and clean archive installation where inputs changed. Do not delete campaign data or manipulate a live database.

In one coordinated v13.351 session, test basic trainer/Pokémon sheets, compendium acquisition, representative full generation and level-up UI, saved/reloaded actor state, linked/unlinked tokens, and GM/player ownership boundaries. Inspect bundled macro code before executing it and use only disposable actors/scenes. Verify basic macro execution and reference integrity without claiming move-rule correctness. Include the affected missing-reference paths separately from an unaffected baseline.

Fix reproducible content-loading/startup/integration defects within section 02; for failures owned by another section, capture a minimal case and explicit disposition without silently taking over that section. Chat 03 owns complete skill terminology acceptance, chats 04–08 own rules/behavior/automation, and chat 09 owns comprehensive upgrade/release acceptance. Record manifest warnings, V1 deprecations, viewport limitations and the unpublished update URL with their actual severity. Do not publish a release or raise compatibility claims merely to silence warnings.

### 5. Validate, document and hand off

Maintain an acceptance matrix with passed, failed, blocked and not-run outcomes, tested commits, reproducible steps and source/evidence links. Run affected test batches after changes; rerun packaging and live affected scenarios when runtime/content/build inputs change. Reuse unchanged evidence and keep output concise. A full fresh packaging/integration batch is required if the existing evidence no longer covers the final inputs.

Update this handoff, docs/STATUS.md, relevant audit/validation reports, issue #1, the Unreleased changelog and the current PR description together. Reuse draft PR #4 if it remains the appropriate branch/PR; inspect current state first. Commit/push documented work and check its CI. Do not merge, release, start another chat or send cross-chat messages without explicit owner authorization.

At the final handoff, state: what was implemented; what actually passed; unresolved failures and exact external evidence needed; whether chat 03 can proceed on unaffected paths; tested commit/PR; and shared-world/server state. Stop the server you started safely. Distinguish "all addressable work finished with blockers" from "all section acceptance gates passed." Missing content must never be represented as repaired simply because its limitation is documented.

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

