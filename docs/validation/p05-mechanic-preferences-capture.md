# P05 provider-injected preference capture interface

## Scope and status

This isolated utility accepts an explicit serialized declaration/binding manifest and a caller-supplied synchronous provider. It produces detached stored-evidence observations for the existing read-only preferences validator. It does not discover PTU settings, establish a production key map, call Foundry settings APIs, change existing consumers, register anything, save/apply preferences, activate gameplay, or prove full P05 completion.

The candidate passed matching independent review and the 55-case focused run described below. Its bounded result is substantively accepted. No native test is included in this package. Existing native preferences evidence covers supplied-evidence rendering and dismissal, not this new capture interface.

## Input contract

`captureMechanicPreferences(manifestJson, provider)` takes exactly two arguments. The first is a JSON string with exactly:

- `schemaVersion: 1`.
- `coverage: {kind: "selected-declarations", evidenceRef}`. This describes only the listed declarations; it is never a claim to cover all settings.
- `definitions`: the existing review schema's supplied definitions, including exactly one eligible standard choice per mechanic. Source/citation/eligibility declarations are not independent rules approval.
- `bindings`: zero or more `{id, namespace, key, storageScope, registrationEvidenceRef}` records. IDs must uniquely match a definition and its world/client scope. Namespace/key/scope tuples are unique. Registration references are caller-supplied attribution, not verification of a host registration.

The provider receives one detached, deeply frozen binding at a time. It is called at most once per binding, in manifest order, and must return a JSON string with exactly:

```json
{
  "schemaVersion": 1,
  "id": "synthetic-example",
  "storageScope": "world",
  "stored": {"state": "present", "value": false, "evidenceRef": "fixture:stored"},
  "effective": {"availability": "unavailable", "reason": "not-observed", "evidenceRef": null},
  "default": {"availability": "unavailable", "reason": "not-observed", "evidenceRef": null}
}
```

The example is synthetic, not a PTU setting map.

Stored evidence has four exact shapes:

1. Present: `{state:"present", value, evidenceRef}`. The value is preserved, including false, zero, null, empty strings, custom objects and arrays.
2. Absent: `{state:"absent", evidenceRef}`. A nonempty evidence reference is required. An effective getter or missing callback does not establish absence.
3. Unknown: `{state:"unknown", reason, evidenceRef}`.
4. Present but unavailable: `{state:"present-unavailable", reason, evidenceRef}`.

Unavailable reasons are `not-observed`, `incomplete`, or `unreadable`; their evidence reference may be null. Each effective/default field is independently either `{availability:"available", value, evidenceRef}` or `{availability:"unavailable", reason, evidenceRef}`. Available evidence requires a nonempty reference.

Identity/scope mismatch, extra/missing fields, contradictory shape (such as absent plus value), invalid serialized data or provider failure yields an explicit unknown observation, never an inferred default or absence. Valid explicit false/zero/null is capture evidence even when the existing preference validator correctly rejects that value as a choice token.

## Inconsistency and provenance

Raw stored evidence is not replaced by an effective/default value. A present stored value disagreeing structurally with an available effective value, or proved absence with disagreeing effective/default values, is recorded as `inconsistent-observation`. Both reported values remain in the detached evidence record. The review observation becomes unknown/incomplete so no choice is silently selected. Object key ordering alone is not a disagreement.

This is a conservative interface rule, not a claim that every host transforms values identically. A future adapter must establish the meanings of its raw/effective/default observations before integration. It must not mislabel a derived getter as a stored value.

Unmapped declarations are listed explicitly and become unknown/not-observed. Effective/default values never upgrade unknown stored presence. A valid absent observation may lead the existing validator to its pure standard fallback; this is not proof of a registered Foundry default. Explicitly stored standard remains a distinct stored-origin observation.

## Bounds, failures and trust

Limits are exported as `PREFERENCE_CAPTURE_LIMITS` and count UTF-16 code units, not bytes:

| Boundary | Limit |
| --- | --- |
| Manifest JSON | 32,768 characters |
| One provider reply | 4,096 characters |
| Aggregate accepted/reserved reply accounting | 32,768 characters |
| Definitions and callbacks | 64 each |
| Resulting review request JSON | 65,536 characters |
| Serialized capture result | 131,072 characters |

Before each callback the utility reserves room for a maximum reply. If that would exceed the aggregate allowance, that and later unaffordable bindings are visibly skipped, without callback or retry. Oversized strings charge a full reservation; non-string/throwing replies are not inspected. The call count remains bounded independently.

Manifest parsing allows at most 8,192 nodes and depth 12; a reply allows 512 nodes and depth 8. Duplicate object names, unsafe integers, fractions, exponent notation and negative zero are rejected rather than silently normalized. JSON data is detached by parsing. Returned objects, getters, proxies, promises and thenables are not traversed or awaited. A thrown object's message/getters are not inspected; failures use fixed diagnostic codes and do not leak arbitrary exception text.

Arbitrary injected callbacks are **not proven pure, interruptible, cancellable or wall-clock bounded**. A callback can perform side effects, block or schedule asynchronous work before returning. The caller must provide a trusted finite synchronous provider and, when needed, external process supervision. The utility bounds its call count and accepted data, not callback CPU, allocation or side effects. No sandbox guarantee is implied.

The result is deeply frozen and contains selected coverage, per-binding detached evidence/disposition, call count, issues, a serialized review request and a compact validator summary. `captured` means complete stored observation capture, not approved rules or valid choice values. `partial` retains unknowns/failures/inconsistencies. Invalid input makes no provider calls. If final request/result bounds cannot retain the evidence, the utility returns a small `invalid` envelope with `evidenceDiscarded:true` and the actual callback count; no request is released and no silent truncation/retry occurs.

The existing validator is composed directly with its complete retained import closure. No validator stub is substituted.

## Focused oracle plan

The dedicated suite exercises:

- Selected coverage, detached/frozen data, explicit false/zero/null/custom values and absence versus stored standard.
- Unknown/present-unavailable with available effective/default values, unmapped declarations and client/world separation.
- Wrong identity/scope, malformed and contradictory provider shapes, disagreement retention and structural key-order equality.
- Throwing callbacks, returned accessors/thenables/promises, duplicate JSON names, number integrity, node/depth/character bounds and aggregate reply reservation.
- Duplicate bindings/physical addresses, unregistered supplied IDs, invalid standard declarations, missing attribution, over-limit manifests and no-call preflight rejection.
- Exactly one call per binding with no retry, 64-call ceiling, prototype-named data and no access to global settings.
- Five semantic rows from the retained synthetic native fixture composed through the actual validator. This reuses supplied oracle data; it does not rerun or extend native acceptance.

The focused validation used the bounded 120-second/512-KiB supervisor described in the verified result below. The initial preflight failure and the successful reserved projection attempt are both preserved. This focused pass is not full-suite or native acceptance.

## Verified focused result (2026-11-16)

The focused capture suite passed **55 tests**, with **zero failures, cancellations, skips or todos**. It executed once in a private projection containing the exact four retained validator modules, the unchanged candidate utility and test, minimal ESM metadata, and a pinned inventory. This was not an execution of the original package script, a full portable suite, or a native Foundry test.

An earlier supervised attempt stopped during preflight because the documentation-only checkout did not contain the validator modules. It ran no Node/test bodies. That failure remains part of the evidence; it was not treated as a behavioral pass.

The successful supervised run completed at **18:59:18 UTC** in **2.595 seconds**, including preflight, the focused invocation, postflight and cleanup. All 55 individual outcomes agreed with the aggregate counts. The complete process capture was 4,584 bytes, including 4,178 bytes from the focused tests, with no discarded or possibly-unread output. The launcher, controller and watchdog exited successfully.

All four candidate files, the parent revision, the exact repository delta, every projected file and the projection inventory matched before and after. No live owned processes or cleanup errors remained. Independent substantive review accepted this bounded result.

The exercised candidate utility SHA-256 is `4ad4aefd9978fe65aa94d3ed4fa093a4309b386ae00d253a635a70049bcce11e`; the focused test SHA-256 is `3102413faeefdb1e76cca235bc1e522a18688f36957aa7443b8d89bae3660404`. The retained real validator closure was used without substitute modules or ambient dependencies. The projection manifest lists seven payload files and is itself pinned separately.

This evidence does not establish production key mappings, arbitrary callback purity, live settings capture, native integration or gameplay activation. The original failure and both consumed supervisor attempts are retained; no further focused invocation was performed. Broader verification remains subject to exact-head CI and its separate acceptance.

## Unresolved production integration

The retained config registration only identifies the presentation class. The retained init code imports `registerSettings` from `src/module/system/index.js`; that export and the actual downstream registration/storage implementation are not available in this packet. The exact downstream file/range and production mechanic-to-key map remain unestablished, not guessed. The native preservation probe's four selected setting names are preservation sentinels, not a mechanic preference mapping.

Future live integration requires verified registration declarations, namespace/key/scope/default/value constraints, raw presence and storage APIs, complete declared coverage, caller access policy and an appropriate isolated test. These integration points have not been established by this package. There is no menu-opener, GM-enforcement, live capture, save/apply or new-world-default claim here.

Huge Power remains disabled. Raw direct `prepareData()` re-entry remains unsupported. Forge is not accessed. No merge or release is part of this package.
