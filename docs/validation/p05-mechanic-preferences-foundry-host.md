# P05 explicit trainer-advancement Foundry host (Stage B)

## Historical Stage B scope and state

This four-path Stage B adds an explicitly invoked actual-global host around the unchanged accepted trainer provider. The parent is `51cda27024ea8f7ab38c0ec3c57ddcf22a9d0f46`. The primary portable attempt failed and is preserved below. The single reviewed corrective attempt subsequently **passed all 258 portable cases**: 55 unchanged capture cases, 95 unchanged provider cases and 108 host cases. This is focused portable verification, not native Foundry compatibility, an activated integration or a full repository test-suite result.

The module exports `bindTrainerAdvancementFoundryHost(core)` and the no-argument `captureFoundryTrainerAdvancement()`. Importing it does not inspect a Foundry session or settings. No hook, initialization binding, menu, setting registration, mutation, migration, activation or automatic consumer is installed.

## Trust boundary

A separately vetted bootstrap must supply the actual trusted Game, User, Users, Setting, WorldSettings and ClientSettings class references. That installer is **not included or activated**. Binding pins those references and relevant prototype chains; it is not an authentication grant, proof that a bootstrap was uncompromised, or native compatibility acceptance. An unqualified host fails closed. The capture does not accept caller-supplied game objects, Users, authority Booleans or observation callbacks.

On explicit invocation, capture obtains actual global roots and checks relevant CONFIG class selections, the exact supported prototype representations and full-GM role exactly 4. It requires current User, Game.user, collection lookup and session/world user IDs to agree, then compares these identities and authority again after observation. Assistant role 3 is not enough. This establishes only the checked client-side linkage, not fresh server authentication or protection against privileged hostile JavaScript.

## Loaded-setting evidence

Only `ptu.variant.trainerAdvancement` in the `"world"` entry of the `ClientSettings.storage` Map is selected. CONFIG.Setting.collection is not required. Two complete, ordered metadata traversals inspect at most 256 loaded records each. A single extra completion probe never inspects the overflow value or its fields. Duplicate IDs, objects or exact targets, unsupported membership and incomplete/overflow traversal fail unknown. User-specific same-key records are not world records: the ordinary world sentinel is exact null, not a falsey or nullish substitute.

Selected identity follows the qualified inherited Document.id path and agrees with the own _id. The selected source and prepared values are inspected via ordinary data descriptors, without native construction, reset, preparation, serialization, cloning or getInvalid recovery. Loaded absence is not database absence, because invalid/unloaded source records may have been omitted during initialization. Unrelated record IDs, keys and user references stay internal and are not returned.

The host distinguishes missing, undefined, null, supported primitives and unsupported/oversize representations. It encodes only detached, explicitly permitted primitive evidence for the existing JSON provider ports, never native objects or serialization hooks. Original physical text is preserved; registration defaults are not substituted for absent values. Only the prior provider's original-to-standard mapping is in scope; other modes remain unresolved.

**Unknown override evidence stays unavailable.** This host has no source-backed proof that no overrides exist, so even an ordinary original-mode observation currently remains a partial provider result with no mapping. It does not invent `none-reported`, expose a new mapping authorization or activate gameplay. Bootstrap/CONFIG/session qualification and a later override policy need separate native evaluation before any operational integration.

## Pre-execution correction history

The first matching review blocked execution before any attempt was consumed. It identified an object-shaped storage assumption in both host and fixtures, and a missing check for substitution of the native Map iterator's `next`. V2 uses the source-backed storage Map and qualified `get("world")` resolution, preserving container/entry identity checks and rejecting misleading own `.world` properties or lookup shadows. It verifies the pinned Map lookup and iterator-next descriptors before use, throughout iteration and at final qualification, instead of silently bypassing changed native methods. The added regressions restore changed intrinsic descriptors in `finally`.

V1 remains failed pre-execution review evidence, not a failed behavioral test. The expanded 258-case V2 package subsequently received matching pre-execution acceptance. Its primary invocation is recorded below; pre-execution acceptance was not a behavioral pass or native compatibility result.

## Consistency and limitations

The paired observation compares relevant global/core/CONFIG, session/user, manager/store/registration, ordered membership and selected source/prepared identities and values. Changes invalidate target evidence. This is synchronous but **not atomic**: ABA and transient changes, arbitrary privileged code and unknown overrides cannot be excluded. Reflection can invoke Proxy traps; there is no universal Proxy detection or trap-free guarantee. Synthetic fixtures are a portable contract test, not native authority proof.

## Verification and preservation

The frozen focused batch runs unchanged capture/provider suites and the complete host suite sequentially under a reviewed 120-second whole-envelope supervisor, pinned Node and owned-process watchdog. Preparation/static checks are separate from behavioral tests. Both granted supervisor attempts are consumed: the failed primary and the separately reviewed successful correction. No third attempt or automatic retry is available.

All existing provider/capture production and test bytes remain unchanged. The repository delta is limited to this module, its tests, this report and the Unreleased changelog entry. No native session/settings query or test, Foundry/Forge access, secret acquisition, security change, publication, merge or release is part of this Stage B. Huge Power remains disabled, raw prepareData re-entry remains unsupported, and P05 is incomplete.

## Primary portable attempt and reserved correction — 2026-11-17

The single released primary invocation ran from 07:31:42.061 to 07:31:45.552 UTC, within its 120-second envelope. Complete default-reporter output records **258 tests: 257 passed, 1 failed, 0 cancelled/skipped/todo**. The failed case is `world store drift discards target evidence`. The host discarded the changed-store observation as required; the following fixture counter assertion expected two traversals but saw three. Constructing the replacement WorldSettings from the instrumented collection called its iterator, which delegates to values(), adding a fixture-only traversal. This is not reclassified as a pass.

The correction constructs the replacement from explicit fixture entries before instrumenting traversal. It preserves both the changed-store rejection assertion and the exact two-pass expectation. Production host bytes are unchanged. Separately, the supervisor expected TAP summary lines but Node emitted its default reporter, so its machine summary was empty. The corrective command explicitly selects TAP rather than weakening result-count checks. Both corrections received matching independent review before the **one reserved corrective attempt**. No automatic retry or third attempt was allowed.

The primary outer/controller exits were 1, and watchdog exit was 0. All output was retained (21,567 diagnostic bytes), with no discarded or possibly unread bytes, no reader/cleanup errors, verified owned cessation and unchanged pre/post repository/candidate/projection identities. Primary receipt SHA256: `6ddc4dc2f33f50618e1bad00b98dbe14d84240d2e0f98fcf52465946224678e6`; controller SHA256: `fc0a272b8a5ad6397588f643c2e07842b0f82067778042e94a507e062370d943`; complete diagnostic SHA256: `f13f4e46c8883d907aa74bb62ccd34b343e541e0fcc1408a1973c7f135043f1a`. These remain retained primary-failure records and are not reclassified by the later pass.


## Corrective portable result — 2026-11-17

The one reserved corrective invocation ran from 07:44:07.537 to 07:44:11.096 UTC, taking 3.559 seconds within the 120-second whole-envelope limit. Complete TAP output and machine-parsed counters agree: **258 tests passed; 0 failed, cancelled, skipped or todo**. All three selected suites ran sequentially and unfiltered. The corrective fixture retained the changed-store rejection and exact two-traversal assertion. Production host and protected provider/capture code and tests were unchanged from the accepted pre-execution package.

Outer, controller and independent watchdog exits were all 0. Complete diagnostic capture retained 49,141 bytes with zero discarded or possibly unread bytes and no reader or cleanup errors. Pre/post repository, candidate, protected dependency, projection and runtime identities matched. Owned-process cessation was verified; no live owned process remained. The independent terminal review accepted this bounded portable result without granting native compatibility or operational integration.

Corrective receipt SHA256: `88dc5bfc4c34780b4732c4dca7ddd4a5f45c487deea085363ee33848d95904d2`; controller SHA256: `388a195da67ff64bff56ed654df9c1a32571382d0c47f0e5ef7ef1dc8e207faa`; complete diagnostic SHA256: `5b6ad89c1a397617f55affdc3ed9925a25e010094cdbe0a74a6bb39e92dd6602`. Earlier failure evidence is retained separately.

The current deliverable is an uninstalled explicit host, its focused tests and this report. Native bootstrap/CONFIG/session qualification, actual loaded-world behavior, override authority and any installation or activation remain unverified and unreleased. No additional behavior run is implied by the documentation-only result update. P05 remains incomplete.

## Accepted bounded native host verification — 2026-11-17

This follow-on evaluates the unchanged host/provider/capture closure at public source revision `af64d6a69e34ee1b430960d5c2085790eff42d14`. The earlier sections retain the historical Stage B portable checkpoint. Independent review has now accepted the portable bootstrap qualification and the bounded native result below. This is **not full P05 acceptance, production mapping, installation or activation**.

### Preserved failure and correction history

The first follow-on portable preflight stopped because its checker incorrectly required five sparse-checkout files to be materialized. It did not run test bodies. A separately reviewed correction verified the exact HEAD blobs, skip-worktree entries and absent filesystem paths; its complete focused batch passed **328/328**.

The first native attempt then failed an unlabelled CONFIG qualification check before any host capture or Setting fixture. It stopped with verified process cleanup and retained evidence. Its exact failed comparison remains unidentified. Subsequent source review showed that PTU selects its own `PTUUser` subclass; that static finding is not retroactive proof of the historical failed comparison.

The private bootstrap correction preserves the official core references separately, verifies the canonical PTUUser module bytes before importing that exact module, and checks direct constructor/prototype ancestry, exact configured/current-user identity and inherited authority paths. It never derives trust from a constructor name or invokes PTUUser preparation helpers or its settings getter. Each of the three CONFIG comparisons now has a separate diagnostic label. A pre-execution review also caught three historical-preservation keys incorrectly naming the new files; those keys were corrected before the additional test invocation. None of these changes altered production host, provider, capture or dependency bytes.

### Accepted portable bootstrap qualification

The complete focused batch passed **356/356**, with zero failures, cancellations, skips or todos: 258 protected production-interface cases, 70 earlier private harness cases and 28 added bootstrap regressions. All 328 earlier cases/assertions were preserved. This is a focused batch, not the full repository suite.

The whole invocation took **4.4286 seconds** within its 120-second limit. All 17 commands, including four syntax checks, succeeded. Outer, controller and watchdog exits were 0. Complete diagnostic capture retained 66,293 bytes with no discarded or possibly unread bytes or reader errors. Exact private/projection/runtime pins, all 11 HEAD blobs, six materialized inputs and five sparse absences matched before and after. The repository stayed unchanged and owned-process cessation was verified.

### Accepted native observations

One disposable local Foundry 13.351 / PTU 4.4.3 session completed four actual-global captures and one reload. Both page phases verified all eight served assets and the canonical 699-byte PTUUser source. The independently labelled `User.documentClass`, `User.collection` and `Setting.documentClass` comparisons all passed, together with the reviewed client/session qualification.

| Observation | Observed result |
| --- | --- |
| No loaded selected record | Host observation completed; provider remained `partial / presence-unestablished`. |
| One explicitly created original Setting | Loaded source text and prepared value were observed separately; provider remained `partial / override-unresolved`. |
| Stable repeat | The selected identity, values and host evidence matched. |
| After one reload | The same selected identity, values and host evidence were observed again; override uncertainty remained. |

An ordinary `ClientSettings.get` outside host capture separately returned the registered `original` default when no selected record was loaded. That API return is not a persisted-record observation and was not substituted into the host's absent-value evidence.

The seven explicitly guarded mutator slots recorded **zero attempts during capture**, and their guards were restored. The ordinary-API creation and deletion of the single owned test Setting occurred outside capture. Only that newly created selected Setting was deleted, with loaded absence verified afterwards. No other fixture or production mapping was created.

### Cessation, preservation and diagnostic limits

The whole native supervisor completed in **139.922 seconds**. The owned native phase, outer process and watchdog exited 0; the Job was empty. Browser launch/close settled, and Foundry and the proxy closed. No resource or cleanup error was recorded. All eleven historical before/after preservation summaries matched, including the failed native attempt.

The network record contains three closed owned tunnels, zero proxy DNS calls and zero unverified tunnel closures. There were **21 denials: 16 details retained and five explicitly omitted**. One denied-client connection reset was classified as a nonfatal policy closure. There were zero fatal proxy errors, **not zero proxy errors**.

Server capture was complete at 12,292 bytes with no discard. Server-log contents were not separately reviewed, so complete capture does not certify engine-log cleanliness. Storage inventory was terminally stable and remained within the reviewed capacity/free-space bounds; no storage-monitor error was recorded.

### What this result does not establish

- Loaded absence is still **presence-unestablished**, not persisted-database absence or a complete new-world baseline.
- Explicit original mode is still **override-unresolved**. Source text, decoded/prepared values and an ordinary default return remain separate evidence.
- Paired checks are non-atomic and cannot exclude transient or ABA changes. Seven guarded mutation slots do not prove universal purity.
- The successful private, explicitly vetted bootstrap is **not installed in production**. It does not certify general authentication, uncompromised provenance, production mapping or activation.
- The failed earlier CONFIG comparison remains unidentified; the later pass does not rewrite that failure.
- Huge Power remains disabled, raw `prepareData()` re-entry remains unsupported, and P05 is incomplete.

This update records accepted evidence only. No additional behavioral run, production change, merge or release is implied.
