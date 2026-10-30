# PTU 05 foundation acceptance and next bounded batch

Decision recorded 2026-10-29, America/Indiana/Indianapolis. This accepts one implementation batch, not full PTU 05, production content, gameplay, automation or a release.

## Substantive decision

**ACCEPT** the metadata/lookup foundation at `295142f6a9b5c805d3886a0b2dc53f2d1459d92d` (implementation checkpoint `cacf37d74423cb3f1679ca5a5226d8c4bf21a295`). The planner examined the entire [helper](../../src/util/rule-versions.js), its 18 new contract tests, the [API contract](../RULE_VERSIONS.md), the [worker handoff](2026-10-29-p05-foundation.md), and composition with the accepted prerequisite/source interfaces. No defect requiring correction was demonstrated within the assigned scope. The coordinator's independent review agrees; this decision also rests on the planner's own code/interface examination and 85/85 independently rerun affected checks.

[Normal source-head CI 40992369967](https://github.com/MrMints/ptu_1.05/actions/runs/40992369967) passed at that exact revision: Documentation `123857561555`, Validation `123857561409`, **1,755 tests / 1,755 passes / zero failures or skips**, followed by source validation, semantic pack verification, build and artifact upload. The actual Validation log confirms those counts. Prior CI alone was not used as evidence for this batch.

The ten-file comparison from accepted base `94f91afd7e9e1e73b7220b321159a6ad40b612cd` contains only the new helper/test and eight documentation files. Existing runtime consumers, prerequisite/acquisition/preservation/source helpers, packs, source/approval ledgers, manifests, workflows, original references, campaign data and terminal requirements are unchanged. The accepted addition to `docs/TESTING.md` is documentation of this batch, not a change to terminal acceptance. No live workflow imports the new helper.

| Reviewed requirement | Decision and boundary |
| --- | --- |
| Distinct document, canonical, version and source identities | Accepted shape contract and exact supplied mapping. Labels never identify content; duplicate/conflicting mappings remain unresolved. A canonical relationship may remain null. A citation or caller assertion is not production approval. |
| Full selected rules without blending | Accepted detached complete owned `system`, including raw prerequisites, rules, costs, uses and custom fields. Unknown attribution still preserves data for inspection; it is not permission to execute it. The API does not promise a complete document export or a replacement payload. |
| Source status/date and scope | Explicit source status and actual date precision are retained; directory names do not promote a playtest. Excluded/unclassified mappings remain unresolved. There is no production registry or new supported-content filter. |
| Saved identity and legacy compatibility | Accepted modern-first provenance, legacy fallback, actual pack UUID precedence, stored-choice conflicts and absent-choice read behavior. No guessed UUID normalization, key migration, flag rewrite or latest-version fallback. |
| All content categories and repeated instances | Synthetic Move, Ability, Feature, Edge and distinct Poké Edge cases pass. Repeated owned instances keep identity and saved choices. This is not approval of real variant pairs, repeat policy or benefit stacking. |
| Advisory selected-version diagnostics | Existing evaluator receives the selected record's own prerequisites and version. Satisfied, unmet and custom/unverifiable results remain distinct; no prerequisite grants, rank increases or acquisition veto are introduced. Live persistent display remains on the earlier accepted interfaces. |
| Independent mechanics and standard baseline | Missing API preferences return standard; explicit/invalid preferences remain distinct. No item replacement, setting registration, preset, supported mechanic catalog or new-world integration is claimed. |
| Purity and preservation | Frozen input, repeated/JSON-round-trip reads, one document snapshot and detached-output checks pass. No document update, world operation or authorization bypass exists in this module. |

The [full04/pre05 decision](2026-10-30-full04-acceptance.md) and accepted P03/P02-P/corrected P02-A/P01/P03-NPC matrices retain their exact limits. No supported-route contradiction was reproduced, so no earlier gate is reopened or waived. Historical failed observations and source dispositions are preserved.

## Remaining original 05 contract

| Obligation | What remains after this acceptance |
| --- | --- |
| Source-backed selectable versions | Promote only exact approved source/document pairs for Moves, Abilities, Features and Edges, including applicable Poké Edges. Evidence must establish each distinct version ID and canonical relationship. Retain additions without invented counterparts and distinguish official errata from optional playtests. |
| Browsing and acquisition | Version labels/filters and explicit choices on supported routes, with scope/security checks and persistent non-blocking selected-version diagnostics. Synthetic lookup tests do not satisfy real pair or live route gates. |
| Explicit replacement and benefits | Preview first, then separately designed application/cancellation/failure recovery preserving relevant actor and item state. Alternate-benefit protection must retain legitimate ranked/repeated instances and their individual choices. |
| Mechanics and consistent consumption | Independently defined settings/presets, standard new-world baseline, and consistent descriptions/calculations/automation. Preferences must never silently replace individually selected content. |
| Existing worlds | Versioned repeatable migrations, ambiguous/custom selection review, save/reload and failure recovery with artifact-bound live evidence. No guessing old identity or rewriting campaigns from a name. |
| Final acceptance | Real approved original/revised pairs, targeted combinations and all relevant supported-route, permission, repeat/cancel/reload/migration evidence. Full05 and06 remain unaccepted/unstarted by this decision. |

Source examination is not production mapping approval. Unresolved exact native identities, missing earlier authoring artifacts, optional-source adoption and rule conflicts retain the gate-specific obligations in full04. They hold the affected mapping, behavior or adoption; they do not block the pure synthetic preview batch below. No owner decision is needed to redefine the agreed standard baseline. No Generation 9 recovery, variant, automation or supported release content is added.

## One next batch: read-only replacement preview

**Prepared only; NOT STARTED.** The coordinator may assign this one batch to the existing 05 chat only after the planner's final successful-CI handoff explicitly releases checkout ownership and fresh operating guards permit. No world ownership is required. Do not combine it with production registry construction, UI, replacement application, settings or migration work.

### Exact implementation boundary

Allowed new implementation files are `src/util/rule-version-preview.js` and `tests/rule-version-preview.test.mjs`. Keep all synthetic fixtures inside that test file. Allowed documentation files are `docs/RULE_VERSIONS.md`, `docs/validation/2026-10-29-p05-foundation-acceptance.md` (append a handoff; retain this decision), `docs/workstreams/05-revision-selection.md`, `docs/STATUS.md`, `docs/CHAT_PLAN.md`, `docs/PRE_05_RECONCILIATION.md` and `CHANGELOG.md`. No other tracked file is authorized by this prompt.

The accepted `src/util/rule-versions.js`, `src/util/prerequisites.js`, `src/util/document-source.js`, acquisition/preservation/NPC helpers, existing tests, source/approval catalogs and packs are read-only dependencies. If a genuine defect prevents the batch, return a finite reproducer and exact correction request for the responsible existing chat; do not expand the allowlist or silently change an earlier gate.

Add one synchronous export:

```text
previewRuleVersionReplacement({actor, current, candidate, versions, mechanicChoices = {}, references = {}} = {})
```

Accept plain serialized snapshots with explicit identity fields; do not query `game`, UUID services, databases, permissions, network or live documents. Reuse `lookupEffectiveRule`, `diagnosePrerequisites` and the existing diagnostic formatter without changing their contracts. The report is for inspection, not an executable update plan.

Required report behavior:

1. Return detached current and candidate snapshots, their separate lookup attribution/issues, independent mechanic preferences, and a relationship assessment. Require exact explicit identities, matching item type and resolved evidenced canonical relationship before identifying alternate versions of the same benefit. Missing/conflicting identity, null canonical relationship, excluded/unclassified metadata or unresolved lookup must remain explicit. Same-name/localized/renamed records never supply a relationship. Same selection is reported distinctly and must still expose custom data differences.
2. Report deterministic differences in `system` using path-segment arrays and separate before/after presence plus value. Preserve missing versus null, object keys, array order, raw prerequisite text and unknown custom fields. Treat arrays as whole values; do not reorder, coerce, merge, omit custom fields or construct an update payload. Complete snapshots retain flags, IDs, provenance, choices, uses and other non-system fields even where no field-transfer policy exists.
3. Evaluate the candidate's own complete prerequisites against the supplied actor using its resolved selected version, or explicit unknown attribution. Return itemized known unmet and separately unverifiable/custom diagnostics. Unmet Feature/Edge/Poké Edge prerequisites must not make the relationship fail or become an acquisition veto. Missing actor data, raw requirements and GM/custom conditions remain visible, never guessed satisfied.
4. Preserve current and candidate data, actor items/ranks, repeated/ranked instances, individual choices, costs and effect-use conditions exactly. Do not pick another same-name instance, deduplicate, add prerequisites, raise ranks, enable/disable effects or determine transferable state. Repeated previews and mutations of returned reports must not affect inputs.
5. Clearly mark actual ownership/permission, production source approval, acquisition scope, transfer policy, repeat/stacking policy and effect-use authorization as outside this preview. A resolved relationship is neither approval nor permission. No `canApply`/authorized flag, write payload, replacement, migration, transaction, user setting or live consumer belongs in this batch. Standard mechanics and individually selected content stay independent.

### Required validation and acceptance

Use explicitly synthetic fixtures with distinct stable document/version/owned identities and declared relationship evidence. Cover all five supported item types, including original/revised pairs; do not represent fixtures as real approved alternatives. Include these positive and negative assertions:

- Established pairs, same selection, same-name unrelated benefits and renamed/localized labels; revision-only addition/null canonical, duplicate/conflicting mappings, unsupported schema/type, unknown modern provenance with old legacy stamp, and excluded/unclassified declarations. No first-match or original/latest/name fallback.
- Original satisfied requirements versus candidate unmet plus custom requirements; missing actor fields, missing/null/empty prerequisite data, known skill aliases and unresolved prerequisite identity. Keep raw text/version attribution and separate unmet/unverifiable outputs; deficiencies do not block preview relationships.
- Saved/custom rules, flags, IDs, capability choices, uses/costs, effect conditions and missing/null/ordered-array differences. Include two repeated Poké Edge instances and ranked/repeated Feature/Edge snapshots; previewing one leaves all other owned instances intact. Do not invent or approve real repeat/stacking policy.
- Deep-frozen input nonmutation, detached outputs, repeated identical preview and JSON-restored snapshots; malformed/missing inputs remain explicit rather than silently repaired. Mechanic preference changes neither replace the candidate/current selection nor blend their fields.

Run the new suite with the accepted 85-case affected group and documentation/evidence checks as one focused batch; investigate failures and rerun only changed/affected cases. Reuse unchanged source and live evidence. Verify the exact allowed-file diff, current evidence contract, local documentation links and whitespace. No Foundry session is appropriate for this isolated unconsumed module; do not claim live cancellation, permission enforcement, persistence, replacement or migration testing. Those need separately authorized artifact-bound UI/apply batches.

Record what is implemented, verified and still manual/unimplemented, exact test totals, source/identity limits and the next dependency. Commit/push only the existing `codex/ptu-foundation` draft PR4. Require normal CI on the final documented head, then verify clean local HEAD/origin tracking/actual remote/open-draft PR4 head agreement and successful tests/source/pack/build/upload jobs. Explicitly RELEASE checkout ownership and STOP for substantive review. Do not start/message another chat, begin another batch, merge or publish.

### Dispatch prompt

After the preceding release and admission checks, send only to the existing 05 chat:

> Complete ONLY the read-only replacement-preview batch specified in `docs/validation/2026-10-29-p05-foundation-acceptance.md`, sections “Exact implementation boundary” and “Required validation and acceptance”. Begin from the coordinator-confirmed clean final accepted review head. Read AGENTS.md, scope, current 05 handoff and those sections; reuse the accepted metadata/lookup and earlier foundation evidence. You are the sole checkout writer for this bounded batch, with no world ownership. Use the exact allowed files/interface and synthetic fixtures; preserve all existing consumers, production/source approvals, IDs, campaigns, standard baseline, independent choices and advisory diagnostics. Hold any affected production promotion without blocking safe synthetic work. Return exact blockers rather than expanding scope. Finish documentation, focused checks, normal CI on the final documented revision, clean local/origin/actual remote/open-draft PR4 agreement, then explicitly RELEASE and STOP for review. Do not start/message any chat or proceed to another batch. Keep saved model/effort. Apply the daily 08:00 inclusive–17:00 exclusive America/Indiana/Indianapolis blackout at every balance; an already-running bounded turn may finish safely then HOLD. At <=5% weekly remaining safely checkpoint INCOMPLETE and latch until a fresh verified actual100% weekly reset plus permitted explicit resumption. Capacity failures wait at least10 minutes and retry unchanged settings under the same guards. Do not store account balances or reset forecasts.

## Acceptance bookkeeping validation and ownership

This planner batch changes eight documentation files only; no new runtime implementation or tests are necessary. The already completed 85/85 independent affected tests and exact source-head CI are reused because their inputs remain unchanged. An additional20/20 documentation/evidence tests pass (105 distinct planner checks in total), together with the P01 evidence contract,168 local Markdown path links, unchanged PR section structure, whitespace and protected-file comparison. Runtime/static/packs/tests/tools/source ledgers/manifests/workflows/README/ROADMAP/TESTING/09-release brief remain exact at the accepted source head. No full local suite, pack rebuild, Foundry, campaign migration or release was rerun for these documentation changes. Final-head normal CI must still pass before release; exact final commit/run/job IDs and clean remote agreement belong in the final handoff, not a guessed self-reference in this file.

The planner owns only this bounded review/bookkeeping until that handoff explicitly RELEASES and STOPS. All other numbered chats remain idle; no shared world, next-batch dispatch, full05/06 acceptance, Issue2/PR metadata edit, merge or publication occurs here. Current daily blackout is 08:00 inclusive–17:00 exclusive Indianapolis; weekly latch/resumption rules and saved model/effort remain. Older ownership/not-started/hours statements are historical checkpoints.

## Replacement-preview implementation handoff — 2026-10-30

Implementation/test/documentation checkpoint: `0e6aacdd5140bf3cd5638c398b9e4c16a93461dd`. The final documented head adds only this checkpoint reference and the matching 05 handoff reference. Normal CI must pass on that final head; its exact SHA/run/jobs and clean head agreement are reported in the final chat handoff, not preclaimed here.

The coordinator explicitly started only the preceding exact batch in the existing05 chat, with sole checkout ownership and no world ownership, from clean accepted review head `83afa7441d5ded0a92b3944ab3e4cc25c86c530e`. Local/origin/actual remote/open draft [PR4](https://github.com/MrMints/ptu_1.05/pull/4) agreed. GitHub independently confirmed [CI41000520328](https://github.com/MrMints/ptu_1.05/actions/runs/41000520328), Documentation123883588415 and Validation123883588786, successful through tests/source/pack/build/upload. This assignment supersedes only historical ownership/not-started statements; the substantive foundation decision above remains intact.

Implemented: [one synchronous preview export](../../src/util/rule-version-preview.js) and [29 explicitly synthetic tests](../../tests/rule-version-preview.test.mjs), plus the seven authorized documentation paths. [API/output details](../RULE_VERSIONS.md#read-only-replacement-preview). No existing implementation/test, source/approval ledger, pack, consumer, setting, world/campaign, original reference or terminal requirement is modified. The existing metadata/lookup, prerequisite evaluator/formatter and source helpers are reused as read-only dependencies.

### Preview validation and observations

**Historical initial preview result:134/134 focused tests passed, zero failed/skipped**:29 preview cases, the accepted85-case affected foundation group, and20 documentation/evidence checks, run as one batch. The previous `133/134` wording was a transcription error, not an observed failed automated run. These passes and CI1784 at `389e8870` did not cover the later reproduced input-boundary gaps recorded in the correction below:

```text
node --test --test-isolation=none tests/rule-version-preview.test.mjs tests/rule-versions.test.mjs tests/prerequisites.test.mjs tests/acquisition.test.mjs tests/acquisition-preservation.test.mjs tests/preservation.test.mjs tests/npc-selection.test.mjs tests/document-source.test.mjs tests/content-scope.test.mjs tests/documentation.test.mjs tests/evidence-contract.test.mjs
```

The preserved legacy fault-path tests intentionally log injected write/embedded errors while assertions pass. Controlled test IO is not a world migration. No existing failure disposition or accepted source evidence was rewritten.

JavaScript syntax, the current P01 evidence contract,170 local Markdown path links across the seven authorized documents, whitespace and the exact nine-file allowlist pass. The complete preexisting acceptance report is an unchanged prefix with this handoff appended. No existing consumer imports the preview. An initial combined Node verification could not spawn Git (`EPERM`); native PowerShell Git reads and a separate Node link check passed without escalating or changing any dependency. This was a sandbox orchestration limitation, not an asserted implementation pass or waived gate.

| Exact synthetic observation | Result and boundary |
| --- | --- |
| Original/revised pair for all five supported Item types | Separate exact attribution and full detached snapshots; evidenced alternate relationship despite candidate known unmet/GM/custom requirements. No production pair approval. |
| Same selection with custom rules/state; same-name unrelated and renamed/localized records | Same selection still exposes its custom system diff and non-system snapshots. Unrelated canonicals remain unrelated; names never establish identity. |
| Addition/null canonical, duplicate/conflicting/unknown mappings, bad schema/type and excluded/unclassified declarations | Explicit unresolved relationship and lookup issues; no original/latest/first-match/name fallback. Unknown modern provenance never adopts an old legacy stamp. |
| Candidate requirements/aliases, explicit and unresolved prerequisite references, missing actor/requirements | Candidate raw text/version drives satisfied, unmet and unverifiable results. Missing/null/empty lists stay distinct. Malformed reference identities remain explicit/unknown, never guessed known unmet. No grants, rank changes or prerequisite veto. |
| Missing/null/object/scalar changes, unusual keys, ordered arrays | Deterministic segment-array system paths with independent presence/value sides. Whole ordered arrays, unknown custom fields and scalar types are retained without coercion/merge. Complete snapshots retain other fields without claiming transfer policy. |
| Two Poké Edge instances and ranked/repeated Feature/Edge snapshots | Only the explicitly supplied current/candidate are inspected; every actor instance, choice, cost, use, disabled value and effect condition is unchanged. No repeat/stacking policy is invented. |
| Frozen inputs, output mutation, repeated/JSON-restored preview | Inputs remain exact and reports are detached/repeatable. Callable/accessor/cyclic/nonserialized inputs are rejected without calling live interfaces; ordinary malformed serialized data remains visible. Invalid source-label objects retain the diagnostic report with explicit unavailable-formatting issue. |
| Mechanic preferences and unassessed authority | Standard context and explicit/invalid preferences remain independent of item selections/diffs. Ownership/security, production approval, acquisition scope, state transfer, repeat/stacking and effect-use authorization are explicitly outside the report. No executable payload or `canApply` flag. |

Focused Node validation establishes this isolated contract and composition, not live replacement/cancellation, permission enforcement, persistence, UI or migration behavior. Existing source and live evidence is reused only within its unchanged historical limits. No full local suite, local pack/archive rebuild, shared Foundry operation or actual campaign migration is run. Normal CI must perform all configured gates on the final documented preview head, separately from the accepted review-head CI.

### Preview compatibility, blockers and next dependency

No genuine earlier-foundation defect was reproduced in the focused batch; no dependency correction or allowlist expansion was needed. There is no new owner decision blocking safe synthetic inspection. Every affected real production mapping/promotion remains held for its exact source, identity, approval and behavior evidence; this pure preview neither supplies nor relaxes it. Preserved data is not permission to execute an unresolved rule. Standard baseline, independent choices and accepted advisory acquisition remain unchanged.

Next dependency is a separately assigned design/review of source-backed mapping approval and replacement application/transfer policy, repeat/stacking semantics, authority/scope checks and artifact-bound live validation. No apply/UI/settings/migration/live consumer or next chat is started by this handoff. Source originals, IDs, saved/custom selections, earlier acceptances, Issue2/PR metadata and terminal release requirements remain unchanged.

Commit/push only the existing draft branch; require successful exact final documented-head normal CI, clean local/origin/actual remote/open-draftPR4 agreement and explicit checkout RELEASE/STOP for substantive review. The final SHA/run/job evidence belongs in the final chat handoff without a guessed self-reference. Current daily08:00 inclusive–17:00 exclusive Indianapolis and weekly latch/resumption guards remain; no balances/reset forecasts are stored, and saved model/effort are unchanged. No world ownership was assigned.

## Preview input-boundary correction — 2026-10-30

Independent review did not accept preview `389e8870f66cc69f93d633405cfdb870eccd5666`. Its actual134/134 focused passes and [CI41006603564](https://github.com/MrMints/ptu_1.05/actions/runs/41006603564) (1,784/1,784, zero fail/skip, all later gates) remain historical successes within their actual coverage. The coordinator explicitly reassigned existing05 sole checkout ownership/no world for only the finite collection/array/evidence correction, from that clean matching local/origin/actual remote/open-draftPR4 head. The original nine-file allowlist and read-only dependencies remain; the substantive first-foundation acceptance above is unchanged.

### Reproduction and actual observations

Before changing implementation, four new regression tests were added to the allowed preview test file and run with its existing29 cases. **New reproduction run:33 tests,29 pass,4 fail,0 skip.** This is a newly observed failing run, not a reinterpretation of the earlier134 passes. The failures were:

| New finite reproducer | Actual pre-fix result |
| --- | --- |
| Valid pair, explicit required-Item reference, `actor.items='not a collection'` | No collection context issue; invalid string iteration supplied a known-missing Item result. |
| Same case, serialized wrapper `actor.items={contents:[null]}` | `TypeError` reading `null.uuid` in the unchanged evaluator, reached through the new preview's unvalidated boundary. Scalar wrapper entries were likewise not validated. |
| Direct malformed entries beside valid Items | Preview quarantined the entire diagnostic actor, losing independently valid skill/level facts. The new assertion expected unavailable item membership plus satisfied skill/level requirements and failed. |
| Empty system arrays plus own `custom['4294967295']='unserialized-extra'` | Snapshot was accepted and comparison could report a complete empty diff. A decimal-string regex had incorrectly accepted a non-index property. |

These are new preview boundary/diagnostic/difference defects, not demonstrated failures of earlier live acquisition/preservation routes or a reason to alter the accepted evaluator. All four new regressions passed after the bounded fix (33/33), then two additional positive/boundary cases were added.

### Correction, validation and limits

The preview now validates direct arrays and serialized `{contents:[...]}` wrappers and identifies unsupported collection shapes and null/scalar/array entries explicitly. Invalid membership is unavailable in a detached diagnostic projection; actor skill/level facts remain usable. Empty arrays/wrappers still establish known absence, populated valid collections still establish presence, and missing/null collections remain unverifiable. The actor and both Item snapshots are not edited, and current/candidate relationships remain independent of these diagnostic deficiencies.

Array keys must be actual canonical indices from0 through4294967294;4294967295 and larger numeric properties, noncanonical numeric spellings and other extras are explicitly rejected. Dense/ordered whole-array comparison is unchanged. Sparse detection records an actual first hole without walking the entire declared length, so legal maximum-index sparse fixtures are rejected safely without conflating their index with an unsupported property. No field is silently discarded into a complete diff.

**Corrected focused result:140/140 tests passed,0 fail/skip** using the existing combined command above:35 preview cases (the original29 plus six correction cases),85 accepted foundation cases and20 documentation/evidence cases. New coverage spans direct/wrapper unsupported shapes, null/scalar/mixed entries, valid empty/missing/populated collection semantics, valid skill/level facts beside unavailable membership, four large non-index keys, adjacent legal upper indices and noncanonical spellings. Frozen inputs, unchanged relationships and all original deterministic/presence/null/whole-array assertions remain required.

Final local checks also pass JavaScript syntax, current P01 evidence structure, manifest/17-skill/15-pack/7,395-source structure,176 local path links across seven allowed documents, whitespace, the exact nine-file diff and preservation of the complete earlier-foundation decision prefix. Read-only comparison against389e8870 confirms unchanged accepted helpers, runtime consumers, source/approval ledgers, packs, manifests, workflows, testing/release requirements and all other protected tracked inputs. These are local static/controlled checks, not new live-route evidence.

Only the allowed preview implementation/test and concise allowed documentation change. No dependency contract, consumer, mapping/source approval, permission query, policy, pack/DB, ID, actor state, campaign, original, terminal requirement or Issue2/PR metadata changes. The unassessed ownership/production/scope/transfer/repeat/effect-use boundaries remain; there is no application payload, authorization flag, UI, live consumer, setting, migration or world operation. No source research or other chat was started. Source/version/original/errata distinctions and standard/independent mechanic choices are unchanged.

Successful normal CI must run on the exact final documented correction head, with clean local/origin/actual remote/open-draftPR4 agreement before explicit RELEASE/STOP for coordinator re-review. No corrected preview acceptance or next batch is claimed here. Existing operating guards and saved model/effort remain; no account values/reset forecasts are stored. New live UI/permission/replacement/persistence/migration tests, full local suite and local pack/build execution are not run by this isolated correction; normal CI remains required.
