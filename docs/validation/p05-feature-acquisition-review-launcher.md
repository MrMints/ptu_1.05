# P05 explicit document-to-Feature-review launcher

## Assignment and accepted baseline — 2026-10-31

Coordinator assigns existing P05 sole checkout ownership/no world for exactly11 paths from clean `8b9fb67b3b5d6122157a83041eb3bcc74b7d5258`, MrMints/ptu_1.05, codex/ptu-foundation, existing open draftPR4. This bridge belongs to the original [P05 browsing/security scope](../workstreams/05-revision-selection.md#scope) and [preview-before-application contract](2026-10-29-p05-foundation-acceptance.md#remaining-original-05-contract), not an extension of earlier13/12/11-path allowlists. Entry verified clean local/tracking/actual remote/draftPR4 agreement, absent new paths, current operating guards and released prior ownership. Saved settings remain; no account usage/reset forecasts are stored.

Completed planner01a19404-3c35-7130-be8e-a5c1d7118201 substantively ACCEPTED the explicit snapshot dialog at8b9fb67b, examined its class/template/locale/tests, reused separate independent479/479, six probes and [CI41244522994](https://github.com/MrMints/ptu_1.05/actions/runs/41244522994),2,330/2,330/no failures/skips and all later gates, then STOPPED/released. Those were separate executions, not planner reruns. Documentation job124665070243, Validation124665070017 and artifact13059368791 bind that accepted head; digest `d64b230ccc48f6ce1bc82af2aaaca64f068fa482d61a3eb39a8334aa41fd165d`. Acceptance covers snapshot presentation, not native-world integration, acquisition/replacement/prevention or full05/pre06.

## Explicit integration API

The named export `launchFeatureAcquisitionReview` is in `src/module/apps/feature-acquisition-review-launcher.js`. A deliberately authored caller supplies actual document references and explicit data; no caller/menu/hook is registered by this batch:

```js
const outcome = launchFeatureAcquisitionReview({
    actor: suppliedActor,
    incoming: suppliedFeatureItems,
    registry: suppliedRegistry,
    sourceCollections: suppliedCompendiumCollections,
    references: suppliedReferences,
    mechanicChoices: suppliedMechanicChoices
});
```

Use exact `versions` instead of `registry` for accepted exact mode. Both own fields remain a conflict, including an explicitly undefined value; no mode wins silently. Missing both stops before document content capture. Plain malformed/null/undefined mapping values reach the accepted inspector as unresolved data; accessor/nonserialized contexts stop with explicit issues instead of being dropped or replaced. Optional references/choices retain accepted undefined defaults. Omit `sourceCollections` when no compendium context is used; otherwise supply an ordinary array of the actual relevant collections, with unique matching `.collection` and confirmed read permission. No pack loading, global collection search, UUID/name resolution, source-file read or default registry is added. Unknown callbacks/options are rejected, not passed to Application.

The synchronous result is either `{status:'review-requested', review}` or `{status:'not-opened', issues:[{path,reason}]}`. A requested render is not confirmation that native DOM rendering finished and is never acquisition permission. Failures identify input positions/reasons without copying hidden names, values or exception messages. The returned review is the unchanged accepted `FeatureAcquisitionReview`; it calls the unchanged inspector. Close/Cancel/Escape/header/repeated dismissal retain the accepted undefined/no-consent result. No apply, transfer, grant, suppression, permission result or update plan is returned.

## Access, identity and capture boundary

The existing actor privacy threshold is OBSERVER ([actor read boundary](../../src/module/actor/base.js)); source Item/pack read checks also use `testUserPermission(currentUser,'OBSERVER')` ([saved-source checks](../../src/util/saved-item-graph.js)). This bridge uses that read threshold; acquisition ownership gates remain in the unchanged [sheet write routes](../../src/module/actor/sheet.js). A read review establishes no acquisition authority.

An established current-user ID and strict true OBSERVER results are required. Missing/throwing/uncertain checks stop; present visibility metadata must also be true. No ownership/GM/reference-possession fallback is used. Actor and all incoming document/source-parent/explicit pack contexts are checked before actor membership is read. The complete actor Item collection is then enumerated through its supplied array or normal `.contents` interface, and every member, including non-Features/custom Items, is preflighted before any snapshot or prepared fact is captured. Inaccessible or malformed members are not silently omitted. Permission, membership-reference/order, identity and current-user changes are rechecked before dialog construction; failure opens no partial review.

Capture deliberately calls permitted `toObject()` interfaces after preflight, accepts only detached ordinary data and checks snapshot identity against actual document metadata. Actual UUID/id/_id, raw modern/legacy provenance, stored selected-version flags, repeated instances, subchoices/counters and custom data survive. Added snapshot uuid/id/pack values come only from verified actual document metadata; conflicting snapshot fields fail instead of being overwritten. No identities are generated or redirected. Supported identity contexts match the accepted inspector: world Actor and world/compendium/Actor-owned Item identities. Temporary, synthetic-token/compendium-Actor or other unsupported/conflicting contexts stop explicitly; there is no invented world counterpart.

Complete captured Item membership is assigned to the actor diagnostic snapshot. The separate review-owned list selects only stable `type === 'feat'`, never names/class labels. Incoming candidates never enter membership. Each launch captures again; no source snapshots are cached across launches, and existing review instances retain their detached inspection when documents later change.

The current evaluator reads prepared `actor.system.level.current` and `actor.system.skills[key].value.total` ([evaluator](../../src/util/prerequisites.js), [17 stable keys](../../src/util/skills.js)). The adapter copies these exact current values without recalculation/coercion, replacing only their raw-source diagnostic projection. Missing prepared fields remove stale raw totals, leaving the accepted evaluator to report unverifiable conditions. Unreadable/nonserialized facts fail explicitly. Other serialized actor/Item state remains; actual documents are never changed. No `prepareData`, roll-data, rank adjustment or gameplay/effect method is called.

## Validation and retained corrections

Actual launcher function bodies execute through the unchanged dialog class, real Handlebars template and inspector with explicit Document/Application/current-user/permission/localization doubles. Test-only ESM linkage gives the Application-bound dialog a unique module URL, avoiding interference with the existing dialog suite's separate double; no function/class/template/inspector body is replaced by a mirrored report. Import-time service traps assert no automatic work. Native permission services and real Foundry/DOM/focus/world behavior remain unrun.

Separate executions:

- First80 cases:79 pass/1 fail/0 skips. The supposed incoming-only core prerequisite was already satisfied by owned core provenance; the test control now uses the unowned May identity. Existing evaluator behavior was correct.
- Two new preflight regressions reproduce0/2 pass: an unestablished current-user ID and a world Actor UUID with conflicting pack context incorrectly requested a review. The adapter now rejects both before serialization; no protected helper/policy was changed.
- Expanded88/88 pass, followed by combined519/519 including those88. Both executions retain their separate timings.
- Added one positive accessible source-parent Item/explicit-reference case; final combined16-file affected suite passes520/520, including89 launcher cases,0 failures/0 skips. It includes launcher/dialog/inspector, registry/lookup/preview, NPC selection/versions, Feature browser, readiness, acquisition/preservation/prerequisites/document-source and documentation/evidence. This is not89 plus520 distinct checks.

Coverage includes ordered authorization before content/serialization, actor/incoming/owned/non-Feature/source-parent/pack denial and missing/throwing/uncertain access, current-user identity, complete mixed membership, all stable prepared skill facts versus raw source, unavailable facts, exact provenance/versions/repeats/custom state, unsupported/temporary/conflicting IDs, snapshot failures/accessors, explicit/conflicting/invalid/missing mappings, unknown callbacks, no incoming grants, fresh captures/independent views, membership/permission/user/identity changes and every accepted dismissal route. Frozen source data is unchanged; forbidden mutation/evaluation/settings/network/global collection service calls remain zero.

## Protected history and exit gates

Only the new module/test/report and eight named documents are writable. Existing dialog/inspector/registry/lookup/preview/prerequisite/acquisition/NPC/browser/source implementations, every prior test, locales/templates, G evidence/bindings/transition, compiler/source evidence/approved IDs/full definitions/packs/eligibility, manifests/dependencies/workflows, originals/licenses and campaigns remain unchanged.

Measured accepted-baseline prefixes are622 complete cumulative-acceptance lines and66 complete dialog-report lines. Both entire UTF-8/LF-aware texts remain before new appendices. Older dated assignment/hold/checkpoint paragraphs are historical, clarified by the current assignment without erasure. Preserve dialog43/44 localization assumption,0/1 reentrant defect/correction,47/48 source-status expectation, worker431 including52 plus separate20 docs, independent479/six, staged EOF stop/correction and CI2,330 separately. All earlier inspector67/68/73/0-of-2/75/379/separate20/independent427/six/denial/authorized retry/CI2,278 and NPC/G/compiler/source histories remain distinct, including failed NPC CI41221389968 and later G reconciliation.

Existing P05 alone owns this batch/no world through normal CI on the final documented head, clean local/tracking/actual remote/open draftPR4 agreement and explicit RELEASE/STOP for independent then planner acceptance. Current weekday-only08:00 inclusive–17:00 exclusive Indianapolis blackout, weekly latch/resumption/capacity guards and saved settings remain; no weekend work/approval blackout is revived. No next batch/chat or real-world validation starts automatically. No installation/default activation/exposure/world access/actor generation, acquisition authorization/prevention/application/replacement/effects/migration/gameplay, full05/pre06, merge or release is accepted. Service-double verification is not live Foundry integration, a world transaction or permission/install/reload certification; separate admission is required.

## References

- [Accepted dialog contract/history](p05-feature-acquisition-review-dialog.md), [inspector](p05-feature-version-acquisition-review.md), [source/admission](p05-echoes-admission.md), [scope](../SCOPE.md), [pre05 gates](../PRE_05_RECONCILIATION.md), [API contract](../RULE_VERSIONS.md).
- [New launcher](../../src/module/apps/feature-acquisition-review-launcher.js), [new tests](../../tests/feature-acquisition-review-launcher.test.mjs), [NPC history](p05-npc-rule-version-selection.md), [G reconciliation](p05-g-implementation-binding-reconciliation.md).

## Local closure

Final combined520/520 includes89 launcher cases,0 failures/0 skips. A subsequent20/20 documentation/evidence execution is separate. Native syntax/P01,370 local links across nine changed documents, exact11-path scope, complete622/66 historical prefixes, tracked and new-file whitespace checks pass. All protected inputs remain unchanged; no native world/DOM/focus/permission/install/reload or full local package rebuild is claimed.

Canonical-LF SHA-256 values are `8d221eed995dc90b55866d6933f0f7c3992a30ccb5723a7cc66991d0725c4cdf` for the launcher and `02c67acddb555e54be6acc13c820f3621a0f5a043fcd8e17946075f163d3337d` for its tests. A documentation-only checkpoint will bind the implementation commit below. Final documented-head normal CI and clean-head agreement still precede explicit RELEASE/STOP and independent/planner acceptance.
