# PTU 05 first bounded foundation batch — 2026-10-29 Indianapolis

## Changes and authorization

The coordinator explicitly assigned only the metadata/lookup batch to existing PTU 05, with sole checkout ownership and no shared-world ownership. Admission was a clean `codex/ptu-foundation` at accepted bookkeeping revision `94f91afd7e9e1e73b7220b321159a6ad40b612cd`, matching local/origin and actual open draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). GitHub independently confirmed [CI 40986434461](https://github.com/MrMints/ptu_1.05/actions/runs/40986434461), Documentation `123838443038` and Validation `123838442843`, both successful with test/validate/pack/build/upload steps. The [full04/pre05 acceptance](2026-10-30-full04-acceptance.md) and its precise source/foundation limitations remain intact.

Implemented: [metadata validation and pure lookup helpers](../../src/util/rule-versions.js), [focused tests](../../tests/rule-versions.test.mjs), and [API/compatibility documentation](../RULE_VERSIONS.md). The source/version record separates document identity, canonical relationship evidence, source status/date and version identity. Effective rules come from a detached complete selected/owned Item snapshot. Independent mechanic choices use standard when absent and cannot replace item selections. Unknown/conflicting mappings remain unresolved and saved/custom fields remain unchanged.

No production registry, pack source, existing runtime consumer, setting, permission, actor rank, campaign, source original or source-approval ledger changes. Synthetic fixtures cover all four categories plus the distinct Poké Edge type; they are not approved production alternatives. The existing accepted advisory diagnostics and acquisition/preservation behavior remain separate.

## Validation

**85/85 focused Node tests pass**, zero failed/skipped: 18 new lookup/contract cases plus 67 affected prerequisite, acquisition, graph preservation, legacy migration, NPC identity, source-refresh and scope cases. Command:

```text
node --test --test-isolation=none tests/rule-versions.test.mjs tests/prerequisites.test.mjs tests/acquisition.test.mjs tests/acquisition-preservation.test.mjs tests/preservation.test.mjs tests/npc-selection.test.mjs tests/document-source.test.mjs tests/content-scope.test.mjs
```

The legacy preservation tests log deliberate injected write/embedded failures while their assertions pass; these are expected fault-path observations, not new runtime failures. They use controlled in-memory IO and do not run the shared Foundry world or migrate saved campaigns.

An additional **20/20 documentation/evidence-contract tests pass**, for 105 distinct local tests total. Structural source validation passes (manifest, 17 skills, 15 packs, 7,395 records), as do JavaScript syntax, the P01 evidence contract, the unchanged NPC evidence replay (13/13 families, 55 retained hashes), 177 local Markdown path links across eight changed/new documents, and diff whitespace checks. Replay validates retained evidence/current input hashes; it is not fresh UI execution. No existing runtime consumer imports the new module.

| Input/action | Observed result and boundary |
| --- | --- |
| Synthetic original/revised Move, Ability, Feature, Edge and Poké Edge snapshots | Correct exact-source/version attribution and complete owned rules/prerequisites; no cross-version overlay. Frozen inputs remain exact. |
| Same names, renamed/localized labels, shared edition IDs under distinct canonical benefits | UUIDs and explicit relationship evidence determine attribution; labels do not identify content. |
| Revision-only addition; absent canonical relationship | Only the supplied version exists; no invented counterpart, canonical group or revised mechanic default. |
| Unknown/malformed/duplicate/conflicting mappings, old selection flags, excluded/unclassified declarations | Unresolved issues remain explicit, with stored selections and complete saved system data preserved; no latest/core fallback. |
| Modern/legacy source conflict and actual pack with historical provenance | Modern owned source wins; the actual pack Document uses its own UUID. Unknown authoritative provenance does not fall back. |
| Synthetic version pair composed with accepted prerequisite evaluator | Satisfied original versus unmet/custom revised requirements report their own version; no grant, rank increase or prerequisite rewrite. |
| Two repeated Poké Edge instances and repeated/JSON-round-trip reads | Independent owned identities/subchoices remain; costs/use conditions and all saved data are preserved. No duplicate-ban or replacement implementation. |
| Independent mechanic choices; invalid explicit value; output edits | Absent choice returns standard, explicit choices remain separate, invalid choices stay unresolved; detached results cannot write back to inputs. |

The ordinary final documented-head CI is separately required before checkout release. Its exact head/run/jobs and clean local/origin/actual remote/open draft PR agreement are returned in the final chat handoff; prior CI is not evidence for these changes.

## Compatibility and earlier gates

The new module is isolated and does not change existing call paths. The accepted P03/P02-P/corrected P02-A/P01/P03-NPC interfaces and full04 source decisions are reused within their recorded limits. The affected Node cases pass against current code; no earlier-foundation contradiction was demonstrated. No new physical UI/permission/reload/archive observation is inferred from those unit tests. Historical failed observations and accepted dispositions remain untouched.

System ID `ptu`, skill keys, document UUIDs, macro paths, all existing sources/records, original PDFs, saved/custom selections and terminal amendment `066f0623` are preserved. Metadata validation does not approve content or certify automation. Existing world settings/defaults do not change; the new API's standard fallback is not a claim that all new-world rule behavior has been integrated.

## Deferred interfaces and limitations

Later authorized 05 batches own exact approved variant mapping/persistence; production labels/filters; repeat-aware benefit protection; explicit replacement/cancellation; supported mechanic definitions and adapters/settings/presets; safe new migrations; live diagnostic integration and actual original/revised route tests. Calculations and automation need separately verified consumers of the selected snapshot; release packaging and broad upgrades retain later gates. No unresolved inherited record was promoted and no Generation 9 content/revision was acquired or developed.

Not run locally: full repository suite, pack rebuild/round trip, archive build, Foundry UI/permission/persistence tests, actual world migrations or releases. Normal CI must perform its configured full tests/source/pack/build/upload gates on the final documented head. This is not full PTU 05 acceptance; stop for substantive review of the bounded batch.

## References and ownership

[Owner contract](../PRE_05_RECONCILIATION.md), [scope](../SCOPE.md), [05 brief](../workstreams/05-revision-selection.md), [accepted full04/source examples and obligations](2026-10-30-full04-acceptance.md), and the unchanged source catalogs referenced there. Catalog coordinates such as Defense Curl `r04-r0232`, Huge Power `r04-r0046`, Echoes `r04-r0192` and Basic Ranged Attacks `r04-r0248` remain source evidence, not runtime mappings or production fixture approval.

The current owner instruction supersedes earlier hours prose: no new/resumed batch or review 08:00 inclusive–17:00 exclusive Indianapolis, at every balance. An already-running bounded turn may finish safely, then hold. Existing weekly usage-latch/resumption rules remain; no account values or reset forecasts are stored here. Saved model/effort are unchanged. Sole checkout ownership ends only with the successful final-head CI/clean-agreement handoff, explicitly RELEASE/STOP; no world, other chat, merge or publication is started.
