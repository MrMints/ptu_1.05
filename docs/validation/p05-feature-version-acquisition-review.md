# P05 pure Feature acquisition conflict inspection

## Assignment and accepted starting point

The coordinator assigns existing05 the exact12-path inspection batch from clean `46eaff244ad58a183e871c9c11ac419c4fc8d05a`, under the original owner-amended P05 replacement/alternate-benefit contract. It does not extend the completed NPC14-path or G11-path repair allowlists. Sole checkout ownership covers this batch only; no world ownership or other chat/batch is assigned. Original scope is in the [workstream](../workstreams/05-revision-selection.md#owner-amendment-and-prerequisite-gate) and [remaining original05 contract](2026-10-29-p05-foundation-acceptance.md#remaining-original-05-contract).

Completed planner turn01a19368-5057-7a21-93d2-31c5d5cf613c substantively ACCEPTED both opt-in NPC selection and the validation-only G repair at46eaff24, then explicitly stopped/released. It reviewed the supplied independent351/351, separate5/5 original failure cases, six further probes and [successful CI41230462059](https://github.com/MrMints/ptu_1.05/actions/runs/41230462059),2,202/2,202/all later gates; those executions were not rerun by the planner. This accepts those bounded components, not acquisition/replacement, alternate-benefit prevention, actor generation, live Foundry behavior, full05 or pre06.

## Changes and API contract

One synchronous export, `inspectFeatureVersionAcquisition(options)`, consumes JSON-data snapshots. It imports the accepted registry matcher, selected-version lookup/metadata validator and replacement preview without editing them. There are no runtime consumers, default registry/data loads, document interfaces or IO.

```js
inspectFeatureVersionAcquisition({
    owned: completeOwnedFeatureSnapshots,
    incoming: incomingFeatureSnapshots,
    actor: actorSnapshot,
    registry: suppliedRegistry,
    mechanicChoices: {},
    references: {}
});
```

`owned` and `incoming` must be explicit dense ordinary arrays, including known empty arrays. Callers supply the complete relevant owned Feature set; this function cannot verify actual world membership or omitted documents. Every entry must be a serialized Feature snapshot (`type: 'feat'`) with an explicit supported Item UUID and consistent own `id`/`_id` where present. Live Documents, getters, functions, class/subclass/iterable containers, sparse arrays, symbol/hidden properties and nonserialized values are rejected without invoking their getters or interfaces. Caller-side snapshot preparation is outside this pure export. No name/translation/slug supplies identity.

Use either `registry` or the accepted exact `versions` array. Explicitly supplying both, even undefined, remains conflicting. Registry structure/alias integrity is checked even with empty collections. Without mappings, attribution remains unavailable; exact mode does not acquire the registry's typed/legacy alias behavior. Invalid/conflicting/excluded/unclassified/custom/unknown attribution cannot establish safe acquisition or an unrelated benefit. Null canonical relationships remain unresolved. Core/May source facts and IDs come only from supplied accepted mappings; no counterparts or another real pair are invented.

`actor` is independent prerequisite context, not ownership/permission proof. Its own explicit `items` array or serialized `{contents: [...]}` supplies prerequisite membership. No incoming Item or supplied owned-review list is silently added to that membership. Missing/malformed/unreadable membership is projected as unavailable, preserving valid skill/level facts. Valid serialized siblings of unsafe actor fields are retained in a marked partial snapshot; unsafe properties are omitted with precise paths. An unsupported actor root is unavailable. Serialized raw interface markers remain visible in the actor snapshot but are excluded from the diagnostic projection. Known empty membership remains distinct from unavailable membership.

Omitted or explicit undefined `mechanicChoices`/`references` retain the accepted empty defaults. Hidden/accessor fields are unavailable, not defaulted. Malformed choices/references retain diagnostics while independent actor facts survive. Choices remain independent from selected content: standard mechanics never replace owned Items or silently select a content version. Explicit invalid identities are preserved without coercion; accepted prerequisite evaluation retains its established fact interpretation.

## Inspection output

| Output | Meaning |
| --- | --- |
| `collections` | Each supplied array is `complete`, `invalid-entries` or `unavailable`. Known count0 differs from unavailable countnull. Entry issues identify exact positions; invalid entries remain present for traversal. |
| `owned` / `candidates` | Every occurrence keeps its original index, safe detached snapshot, raw local/source/UUID/version/custom data, input issues and accepted lookup attribution. `snapshotAvailable` denotes a fully readable object; partial data is explicitly marked. |
| `candidates[].prerequisites` | That candidate's own raw prerequisites/selected version, with satisfied, unmet and unverifiable/custom diagnostics. These are advisory, never an acquisition veto. Separate prerequisite context issues preserve uncertainty. |
| `ownedComparisons` | Full incoming-by-owned Cartesian traversal, including unrelated/unresolved controls. No canonical/name/UUID deduplication. |
| `candidateComparisons` | Every unordered incoming pair exactly once, using original indices. |
| Relationship | Accepted preview facts: `alternate-versions`, `unrelated-benefits`, `unresolved`, or `same-version` (the accepted preview's `same-selection`). Same-version ranked/repeated instances stay distinct, with both identities and separate version records. This does not decide legitimate repetition or stacking. |
| Differences | The accepted preview's system-data differences. Complete flags/custom/subchoice state remains in the central snapshots; no transfer/update payload is generated. |
| `contextIssues`, `mappingMode`, `actor`, `traversal` | Explicit request/context/input completeness. Complete traversal does not establish resolved attribution, actual membership, permission, source approval or acquisition safety. |
| `outsideReview` | Actual membership/ownership/security/source approval/scope, duplicate-benefit prevention, transfer/replacement, repeat/stacking, effect-use authorization and live integration remain unimplemented here. |

Outputs are detached from caller data and JSON-compatible. Repeated references to the same input object still produce separate indexed entries. Returning relationship facts neither merges definitions nor suppresses effects, changes ranks, grants prerequisites, applies a stacking/transfer policy or creates an executable plan. There are no `canAcquire`, `canApply`, allowed/authorized or permission verdicts.

## Validation and retained failures

Fixtures use the accepted detached Echoes compiler bundle, five approved IDs and unchanged source-specific definitions; synthetic unrelated/owned/repeated/custom controls remain isolated in tests. Target pack-source Items remain absent. The bundle hash stays `bf41ea796e3167569358368f37d96652de238ba3cc623e15300d1eea05bd5384`.

The first68-case run passed67/failed1/0 skips: explicit undefined choices incorrectly became unavailable instead of using the accepted standard default. The new adapter's default branch was corrected; expanded boundary/capability checks passed73/73. Two added precise-diagnostic regressions then reproduced0/2 pass: malformed actor entries lacked exact slot diagnostics, and missing collections were not distinguished from wrong containers. Corrections in this new module yielded75/75. One further empty-collection/missing-mapping control was included in the required combined run.

The combined registry/lookup/preview, new/existing NPC, browser, acquisition/preservation/prerequisite/document-source, new review and documentation/evidence run passes379/379,0 failures/0 skips, including76 new review cases. It covers both core/May directions, no owned conflict, batch conflicts, full traversal, ranked/repeated independent state, aliases/exact mode, renamed/same-name/unrelated/custom and unsupported identities, missing/tampered/ambiguous/unavailable mappings, null canonicals, sparse/accessor/function/non-data options, actor fact preservation, own-version advisory unmet/custom requirements, detached frozen input, prototype safety, no incoming grants, and zero document/settings/world/network interface calls. Prior runs retain their separate counts and timing.

Syntax/P01, local links, exact12-path preservation and final documented-head CI remain required. No full local pack/archive rebuild or live Foundry test is appropriate for this unconsumed pure export.

## Compatibility and protected history

Only the new module/test/report and the nine named documents are writable. Accepted registry/lookup/preview/prerequisite/source/selection/browser/NPC implementations and all existing tests remain unchanged. G evidence/primitives/acceptance pins/transition record, compiler/declaration/source/drafts/pilot/approved IDs/full leaf/context definitions, packs/databases/eligibility, dependencies/manifests/workflows, originals/licenses and campaigns remain protected. Complete cumulative/NPC/G report prefixes from46eaff24 are retained.

Failed NPC CI41221389968 remains failed (2,164 pass/5 fail/0 skip; all26 NPC cases passed; no artifact). Its five G whole-file/position binding failures and later5/118/20 reconciliation evidence remain separate from final CI41230462059 success. Earlier producer permission-flag/coordinator CLI-child EPERM failures, adapter145/three failed probes/152-missed defects/four0/4 regressions/corrected4/161/135/20, prefix decoding failure/corrected UTF-8 verification, browser baseline/harness results and NPC warmup/UUID/interface/default histories retain their exact meanings. Nothing rewrites historical approvals or promotes content/eligibility by a later pass.

## Limitations and exit gates

This implements conflict **inspection only**. It does not implement duplicate-benefit prevention, real acquisition/security enforcement, explicit replacement/cancellation/state transfer, effect suppression, migrations, settings/presets or gameplay automation. No installation/default activation/exposure/world access/actor generation/new real pair/merge/release occurs. No full05/pre06 acceptance is claimed. Application/reload/permission/recovery evidence remains artifact-bound future work.

Existing05 retains sole writer ownership/no world through normal CI on the final documented head, clean local/tracking/actual remote/open draftPR4 agreement, then explicit RELEASE/STOP before independent and substantive planner review. No subsequent implementation/chat starts automatically. Saved model/settings and current weekday-only08:00 inclusive–17:00 exclusive Indianapolis/usage-latch/capacity guards remain; weekends have no blackout and the removed weekend approval quiet hours do not recur. No account balances/reset forecasts are stored.

## References

- [Source/version and preview contract](../RULE_VERSIONS.md), [scope](../SCOPE.md), [pre05 gates](../PRE_05_RECONCILIATION.md), [accepted preview](../../src/util/rule-version-preview.js), [selected lookup](../../src/util/rule-versions.js), [registry](../../src/util/rule-version-registry.js).
- [New inspection module](../../src/util/rule-version-acquisition-review.js), [new tests](../../tests/rule-version-acquisition-review.test.mjs), [NPC acceptance/history](p05-npc-rule-version-selection.md), [G reconciliation/history](p05-g-implementation-binding-reconciliation.md), [admission/source facts](p05-echoes-admission.md), [readiness/source pages](p05-echoes-readiness.md).

## Local closure

The required combined affected run passes379/379, including76 new inspection cases,0 failures/0 skips. Earlier67/68,73/73,0/2 and75/75 runs retain their separate meanings. Syntax/P01/whitespace and355 local links across ten changed documents pass. All608 cumulative-report,62 NPC-report and61 G-report lines from46eaff24 remain complete prefixes after UTF-8/LF-aware comparison. Exactly12 paths are changed; every existing implementation/test, G transition/pin, compiler/source/pack/eligibility/dependency/workflow input remains protected. Local documentation/evidence and implementation binding are recorded below after checkpoint creation. No public CI or substantive acquisition-inspection acceptance is claimed before verification.

## Action-time commit authorization hold — 2026-10-31

The first staging/commit command was rejected before process creation. Automatic approval review stated that this new12-path batch was not covered by the trusted approval for the separate11-path repair, and treated the coordinator assignment as untrusted transcript context. This is an authorization hold, not a failed product test. No alternate route or unchanged retry is permitted or attempted.

Read-only verification at20:10UTC confirmed no staged files, no new commit, no push and no new CI. Local HEAD/tracking/open draftPR4 remain `46eaff244ad58a183e871c9c11ac419c4fc8d05a`; the exact12-path working payload remains local and unstaged. Existing05 retains sole writer assignment pending action-specific approval to commit/push this batch. The prior11-path repair's CI2202 success does not cover these uncommitted changes. Content/default/May-source decisions remain settled; no repeated content-policy decision is requested. After recognized authorization, commit binding, exact-head normal CI/clean agreement and RELEASE/STOP still remain required.
