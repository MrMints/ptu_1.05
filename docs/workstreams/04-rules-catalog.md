# PTU 04 - Rules sources and revision catalog

Status: Owner-authorized source/catalog stage completed with recorded authority/evidence and coverage limits on 2026-10-25. Stopped for handoff; full section acceptance is incomplete. No automatic restart or section 05 start.

## On explicit start

Read [the scope policy](../SCOPE.md) first: **Generations 1–8 only; Generation 9 and later excluded**. This overrides broader earlier prompts and handoffs. Do not recover, verify, automate or ship excluded content as supported. Preserve historical evidence, campaign data and IDs; assess older/shared targets independently. Inventory counts are not supported-scope totals, and physical exclusion is not yet complete. An instruction update alone does not start this chat.

Read `AGENTS.md`, `docs/CHAT_PLAN.md`, `docs/STATUS.md` and this file. Check the current branch, working tree and relevant dependency handoffs. The saved baseline may be stale; do not repeat completed work. Only one chat may edit the shared checkout or use the shared Foundry data directory at a time.

## Dependencies
Existing reference inventory. This source-analysis chat need not wait for Foundry activation, but still waits for an explicit start.

## Scope

Boundary: PTU 1.05 mechanics plus approved supporting content through Generation 8. Supplied Generation 9 references may be inventoried as excluded evidence, but must not enter supported rules/content acceptance. Do not infer generation from display names or claim the original core contains every later generation. Record inherited inventory separately from supported scope.
Own source authority: editions, duplicate hashes, printed/PDF page references, standard/revised deltas and unresolved conflicts. Use the supplied core as the standard baseline. Later explicit revisions supersede earlier revisions only within the revised version; approved supplements/Pokédex material through Generation 8 never silently override core. Catalog supplied material in stages, distinguishing excluded evidence from supported Features, Edges, Moves, Abilities and independent mechanics.

## Targeted context
docs/data/references.json; tools/reference-catalog.py; ROADMAP.md rules policy; only the relevant documents/pages under Core System. GitHub issue #2.

## Completion gate
Every identified revision has provenance, baseline/revised interpretation, precedence and a recorded conflict disposition or manual-adjudication requirement. A catalog is not a claim of implemented behavior.

## Outside this scope
Runtime coding, content-ID migrations, uploading supplied PDFs, treating documents as agent instructions, or silently deciding unresolved rule conflicts.

## Handoff
When an authorized batch ends, record its commit/PR, changed files, source decisions, exact tests and outcomes, unresolved issues, next bounded action and downstream interface changes here. Keep this concise; link larger evidence instead of copying it. Update relevant status/ledger/changelog documentation in the same PR. Report implemented, verified and automated separately. Do not start or message another chat automatically.

## Source/catalog handoff — 2026-10-25

- Branch `codex/ptu-foundation`, clean starting head `9d678f05cbdc864aeab205fdecc7eb6950bd9d22`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4), [issue #2](https://github.com/MrMints/ptu_1.05/issues/2). Final pushed commit/CI metadata are recorded in the completion comment; this source commit adds no production inputs. Owner/coordinator confirmed planner acceptance of currently due 01–03 gates and sole 04 checkout ownership.
- Implemented artifacts: [source guide](../RULES_SOURCES.md), four new source/catalog JSON artifacts, appended reconciliation decisions, reference-refresh metadata safeguards, catalog validator and six corruption/consistency tests. [Full validation](../validation/2026-10-25-rules-catalog.md). Original reference inventory/review metadata preserved; originals remain local.
- Coverage: 26 paths / 18 unique hashes / eight duplicate aliases; 283 packet entries (May 56/September 35/February 192), six supporting guidance/edition entries; 450 old/plus page/profile candidates, all with manual dispositions. Combined 1,014-page text is old 747 + Alola 117 + Galar 120 + Hisui 30. Counts are neither supported/playable nor behavior-verified totals.
- Accepted source decisions: standard core stays default; chronology only inside explicitly revised selections; duplicate/composite filenames confer no precedence; separate Huge/Pure identities; source eligibility, version approval, data review and behavior verification stay independent. Bulbasaur five-slot ability attribution matches plus p12 and exact inherited UUID history; whole record remains unclassified because other fields differ. No species/ability rewrite or inferred destination UUID.
- Missing-source decisions: core supports concepts behind all 12 earlier-only IDs, but retention/reintroduction needs exact relationship evidence and owner selection. Missing enhancements export/four incomplete Carbon snapshots remain evidence gaps. One earliest species blob was locally unavailable; four existing exports were reused. No complete missing-artifact extraction or Generation 9-only recovery claimed.
- Verified/automated: six focused tests, catalog integrity, 7,395-record structural validation and 26 original hash/page/duplicate checks pass. Composition/field comparisons are machine-assisted; critical source pages inspected visually. Runtime/packs/compiler are unchanged from accepted 02/03 inputs, so Foundry/gameplay/migrations/full local rebuild were not rerun. CI repeats its configured automated jobs on the pushed head; no Code Review diagnostic retry.
- Remaining acceptance: 26 manual revision dispositions; exact inherited record/UUID/dependency review for dex candidates; Game of Throhs item-level coverage 31–45,47–93,creation 105/120; Porygon 21–39,41–87; Blessed 36–71. Need explicit adopted modules, missing prior edition/Version Notes evidence and original complete DB/JSON exports. See guide for exact rulings on Books, ranks, capture conversion, replacement sets, Mummy, Sap Sipper, recursive triggers and Twisted Power. **This is a completed catalog stage with blockers/unfinished coverage, not full 04 acceptance.**
- Downstream: 05 may consume accepted unaffected source decisions only after owner start, but must not treat candidate rows as whole-record approval. Promote approved classifications into runtime/build policy explicitly; preserve IDs/saved selections, use individual variants/independent mechanics and visible manual resolution. No variant implementation, runtime guard, migration or behavior certification added here.
- Checkout/world: after final push/CI handoff 04 releases shared-checkout ownership and stops. Foundry was not started or touched; last stopped/Setup state is accepted 02 evidence, not a fresh 04 process/port test. Other chats remain idle. No other-chat messages, merge, tag, release, publication, goal or automation; do not start 05 automatically.

