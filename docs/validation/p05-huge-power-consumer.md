# P05 Huge Power: guarded calculation and focused validation

## Current status

The local implementation has passed independent code and result review and **112 focused synthetic tests**. Production admission, contributor and preparation tables remain frozen and empty, so this does **not** activate a Huge Power rule variant in a game. Native Foundry lifecycle/DataModel completeness, production source bindings, full-suite acceptance and release readiness remain unproven.

Base revision: `2c35cc5356871ad03e17877883d8d15af852435f`. This report records the isolated ten-path candidate against that base. It does not claim a remote push, merge, release, installation, live-world modification or completion of the wider P05 workstream. Historical test results below belong to their stated checkpoints and are not silently promoted to the latest revision.

## Implementation and compatibility

Unmapped production behavior stays ordinary. Source/version identity is never inferred from names, translations, slugs, the inherited formula or an editable flag. The inherited Ability reference `packs/abilities/_source/oNB76oqVYrjhYd7W.json` is unchanged and is not an approved production binding. Pure Power is separate and untouched. Supported project scope remains Generations 1–8; inherited excluded records and saved/custom selections are preserved.

The implementation captures exact owning Item, source index and raw semantic evidence before constructor normalization. Construction validity is recorded independently before enabled handling can overwrite ignored state. Later `failValidation` invalidates on entry. Predicate evaluation uses a shared lexical primitive in the dependency-neutral Huge Power utility; Actor base has no direct RuleElement import.

AELike operations retain ordinary order, evaluation and immediate writes. Receipts observe already resolved path/current/change/result values and distinguish an actual write from subsequent logging. Producers are not suppressed, deferred, replayed or rolled back. Unsupported arrays, nonfinite values, expressions/read sets, callbacks, constructors, phases, identities and incomplete receipts reject the managed candidate. Numeric reconciliation alone does not excuse an unknown or offsetting write.

The separate candidate is selected only after the modeled preparation interval includes superclass preparation, after hooks, the explicit derived pass, initiative, origin changes and sidebar refresh. It reconstructs classified inputs while excluding the exact bound Ability slot, rather than guessing or subtracting its side effects. An opaque single-use ticket applies the selected value before allocated points, mods and stages, retaining the existing minimum Base Attack clamp before allocated points. Unsupported Twisted Power and hybrid-attack interactions remain ordinary. Reentrancy, out-of-band derived calculations and incomplete domains invalidate selection; a fresh full preparation creates a fresh context.

The disabled February exception keeps the real rule ignored and outside the ordinary active list. Its actual constructed record must independently qualify within the proved modeled domain. It does not fabricate an enabled flag, predicate option or Item facade. Captured values must be finite numeric literals, including zero, or exactly `5 + floor(@actor.system.level.current / 10)`; checking does not resolve, coerce or evaluate them. The initially supported managed predicate domain is empty predicates only. Other predicates cannot authorize selection.

The synthetic preparation profile binds complete prototype descriptor chains, own descriptors and dependency inventories for the modeled Actor, Items and rules. It covers Item callbacks, rule hooks, utility/Roll/localization methods, constructors and static members, predicate/schema classes, configuration, registry and AELike modes. Added, removed or substituted keys and unexpected own callbacks fail closed. A constructor-created Actor `debouncedUpdate` is allowed only with its exact captured callable identity and data-property descriptor; replacement, deletion, accessor substitution or unrelated own functions reject the profile.

When production tables are empty, the fast path avoids managed contexts, capture, classification, predicates and ticket reads. Tests substitute bindings only in their isolated module graph; no production setter, activation flag or persistent preference was added.

## Rule evidence and arithmetic

The existing project evidence identifies **PTU 1.05 Core p.320** and **February 2016 optional playtest p.5** as the relevant references. February is an optional playtest, not official errata. This implementation uses the reviewed arithmetic contract; it does not establish new source/version mappings or reproduce original PDFs.

- Core: double eligible Base Attack plus Nature and classified Vitamins; add classified Trainer Feature contributions outside that multiplier.
- February: add `5 + floor(system.level.current / 10)`, replacing the exact bound Ability slot rather than stacking with it.
- Neutral base 10 at level 20: ordinary 10, Core 20, February 17.
- Base 10, Nature +2, Vitamin +1, Trainer +3 and legacy slot +7: ordinary/Core/February 23/29/23. Four downstream allocated points yield 27/33/27.
- Disabled February: ordinary 16 and managed 23 only after all applicable qualification checks. Disabled Core has no exception.
- February level 9/10/19/20 bonuses: 5/6/6/7, independent of allocation-adjusted level.
- With base 10, February +7, Vitamin 0, Trainer -30 and four allocated points, the clamp-before-allocation result is 5, not 1.
- Two distinct ordinary operations, literal +7 then adding the observed current modifier, preserve writes 0→7→14, two resolver calls, two logs and ordinary Attack 24.
- Repeating the additive `current + 7` rule instead preserves 0→7→21 and ordinary Attack 31. These are different fixtures, not interchangeable expectations.

## Harness boundaries

`tests/huge-power-consumer.test.mjs` loads complete hash-pinned module bodies and rejects changes to declared import rows. The real rule factory, RuleElement, AELike, Actor preparation body, predicate implementation, document-source helper and stat helper run with explicit synthetic Core Actor, Core Item, DataModel/field and service adapters. Unexpected constructors fail.

The positive lifecycle adapter replaces Pokémon derived preparation with a narrow arithmetic model. Although the complete Pokémon module is loaded, that model does not establish the native derived receiver, health/contest consumers or real Foundry DataModel behavior. A future nonempty production preparation model requires independent proof of its complete domain.

The Actor-first ESM smoke preserves actual Actor, Item-index, Item, rule registry, RuleElement and AELike edges. Other dependencies and Foundry globals remain explicit substitutes. Its bounded Node child uses `--experimental-vm-modules`, a 10-second process timeout, 32 KiB per-stream buffers and a 5-second VM limit.

A test-only delegating import bridge counts actual predicate primitive entries while preserving receiver, arguments, return values and exceptions. It distinguishes once-per-full-preparation managed behavior, repeated derived calculation and fresh preparation without deduplicating ordinary invocations. Unsupported potentially throwing predicate instances are negative tripwires, not supported predicates.

## Retained review findings and corrections

### Initial static review

The initial nine JavaScript artifacts passed Node v24.22.1 syntax-only checks. Syntax success did not establish behavior. Independent review then identified five static defects, corrected before the first behavioral run:

1. A new Actor-to-RuleElement initialization edge was removed by moving the predicate primitive into the dependency-neutral utility. The Actor-first import smoke was added.
2. The synthetic preparation profile was extended to bind complete prototype/dependency descriptor inventories and reject callback/accessor shadowing, unknown or zero-net callbacks and changed descriptors.
3. The minimum clamp was retained before allocation; the negative-contribution fixture's expected value became 5 rather than 1.
4. The real calculator reads the ticket property only while admissions are enabled; an empty-table getter tripwire covers that boundary.
5. Admission now distinguishes genuinely absent provenance from present false, zero, null, undefined, empty-string, object or array values. Valid legacy fallback is allowed only when modern identity is truly absent. The inherited document-source helper is unchanged.

All nine artifacts again passed syntax-only checks. A subsequent independent review corrected a test oracle: repeated `current + 7` produces 21 rather than 14. A separate two-operation fixture preserves the required 0→7→14 case. No production arithmetic was changed to fit that mistaken oracle.

### First focused execution: failed, incomplete diagnostics

The first invocation on 2026-11-15 used:

```text
node --test --test-concurrency=1 tests/huge-power-consumer.test.mjs
```

Its retained runner summary reported 61 tests: **1 passed, 60 failed**, zero cancelled/skipped/todo. The sole pass was the Actor-first empty-table import smoke. The first retained error was `TypeError: foundry.utils.debounce is not a function` during Actor initialization. That identifies a missing harness facility; it does not prove every failure had that cause.

Expanded data-URL error stacks reached the 196,608-byte outer-output allowance. The supervisor stopped only the owned process group with SIGKILL, recovered exit -9 after 10.486727 seconds and verified cessation. Diagnostics are incomplete because of that cap, so this was not a clean terminal test completion. Retained stdout SHA-256: `0a3c1cc1ad99f5acc6f33d4a7337ed568c260a32903be29c845709ac5da8dfb6`; stderr was empty. A separate 65,536-byte reservation covered the two internally captured smoke-child streams.

### Debounce/profile and reporter correction

Retained Actor source also showed a constructor-created `debouncedUpdate` field. The earlier profile rejected every own function, so adding a debounce double alone would still reject the positive synthetic domain. The correction added a counting double that validates a zero-argument callback and delay 50, returns a distinct identifiable callable, schedules no timer and throws if called. The profile binds exactly that callable and descriptor. Tests cover replacement, deletion, accessor and descriptor changes, nonfunctions and unrelated own callbacks. Item and Rule profiles still admit no own callbacks. This does not claim that those two findings explain all sixty earlier failures.

A separate, non-shipped reporter uses [Node's custom reporter interface](https://nodejs.org/docs/latest-v24.x/api/test.html#custom-reporters). It bounds error/cause details, redacts expanded data URLs, explicitly accounts for clipping/omissions and preserves failure-event counts and process exit status. Its 128 KiB limit reserves a final accounting record. Formatter-only tests used fabricated events without project imports. A 303-case stress stream retained all 302 failure events and one pass while explicitly counting 144 omitted case records. An additional correction preserved Node's `passed` and `failed` summary counters. These formatter checks are not behavior passes.

### Corrected 68-case checkpoint

The next separately reviewed invocation used Node v24.22.1, the bounded external reporter and the same focused test path. It ran once from 02:33:08.371226 to 02:33:16.105158 UTC on 2026-11-15, elapsed 7.733279 seconds, exit 0.

**68 passed; zero failed, cancelled, skipped or todo.** File and aggregate summaries matched, including the bounded Actor-first smoke. All case outcomes were retained with zero omissions, clipping or redactions. Complete stdout was 12,100 bytes, SHA-256 `42c7ce90a3a62fee7f2d7769458c6873f4c8f635206ba801f058c676ff7d75d3`; stderr was empty. No timeout, output-cap termination or signal occurred; the owned group ceased. The 60-second invocation, 192 KiB outer limit and 64 KiB smoke-stream reservation were respected.

### Disabled-February review and correction

Later substantive review blocked local acceptance despite the 68-case pass. A disabled rule emits no ordinary resolved receipt, so the earlier value/read-set check was skipped: false or candidate-dependent expressions under exact synthetic bindings could reach managed arithmetic. This was a static control-flow finding, not a newly executed production failure. Enabled-path negatives and an unused counter also did not prove the required disabled rejection matrix.

The correction added the pure supported-value qualification described above, before managed predicate admission. Tests now preserve explicit null/undefined rather than defaulting them to seven, cover supported and unsupported values, and distinguish pre-context rejection from independent construction validity. They exercise construction, DataModel, Actor and Item validity; source ignoring; later validation and attempted flag clearing; sticky invalidity; nonempty or potentially throwing predicates; custom/unmapped/legacy identities; and exact valid legacy fallback. The delegating bridge proves the predicate call contract without changing ordinary behavior.

Only the utility, focused test and report changed at this correction. The same independent reviewer accepted its exact implementation/test bytes before the next run.

## Final 112-case focused result

The corrected invocation used Node v24.22.1, the bounded external reporter, concurrency 1 and `tests/huge-power-consumer.test.mjs`. It ran once on 2026-11-15 from **05:43:38.650627 to 05:43:52.845106 UTC**, elapsed **14.194427 seconds**, exit **0**.

- **112 unique sequential PASS outcomes**, including 44 added cases and the unchanged Actor-first smoke.
- Matching file and aggregate summaries: **112 passed; zero failed, cancelled, skipped or todo**.
- Zero omitted cases, other records or details; zero clipped fields or redacted data URLs.
- Complete outer stdout: **19,324 bytes**, SHA-256 `6b7a175ee4373e3f00fa3ee5e71f38aad6fd755777a5ec80cc430593a776f5bd`; stderr empty.
- No timeout, output-cap termination, signal, interruption or discarded outer bytes. The owned process group ceased normally.
- The 120-second invocation, 448 KiB outer capture, 64 KiB smoke-stream reservation and unchanged 128 KiB reporter limits were respected.
- All nineteen implementation, test, reference and reporter inputs matched before and after execution. The run changed no input. A factual report append was the sole post-run project write.

Independent terminal review reconstructed the result entries, verified hashes, independently parsed all 112 outcomes and summaries, inspected the supervisor as text and confirmed preservation. Both blocking findings were resolved for this frozen **local synthetic implementation gate**.

Accepted utility SHA-256: `13cadee0f49e9cbb57f8f53ae489588c4f8dabd882c1dcd810621dd99a3c2b5e`. Accepted focused-test SHA-256: `1d070fd475f3665cc6941dc63ce3d1f0d419f61df1720d49d8983111008d786e`. Preparing this public report does not modify either artifact or rerun behavior.

## Separate compatibility evidence

These results remain revision-specific and were not rerun after the disabled-February correction:

- At the unchanged accepted base, the two mechanic-preference suites passed **22 tests**.
- A separate accepted-base acquisition/preservation/source-identity/Feature-drop batch passed **43 tests** on 2026-11-14.
- A later candidate checkpoint passed a separate **43-case** compatibility batch: acquisition 14, preservation 13, grant identity 10 and character drop 6. Its harness strips imports from unexercised Huge Power paths; it does not establish Huge Power integration.
- A separate earlier candidate checkpoint passed **270 portable cases** covering document-source, Item render purity, prerequisites, invalid-modern identity, partial recovery, round-trip/preservation/saved-copy behavior, mechanic preferences, rule versions, preview and starter training.

None of these counts is a full-suite result for the final correction.

## Remaining prerequisites

Production tables stay empty and this implementation is not activated. Real Foundry/DataModel behavior and the complete native preparation domain, source/version admission and mappings, actual-world preservation, affected integration checks and final-head CI remain separate requirements. Synthetic bindings do not prove a safe native production profile. No build, installation, dependency change, live-world operation, settings change, merge or release is established by these results.

The original private audit remains retained separately; this public report preserves the technical failures, corrections, evidence and limits while omitting account usage, private workstation paths and internal coordination records.
