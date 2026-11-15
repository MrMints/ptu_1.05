# Huge Power dependency observation

Package: `HP-DEPENDENCY-OBSERVATION-20261115-01`
Parent: `c145a1543a7d6c661008f35750bdc7410e3682f4`

## Scope and status

This bounded cloud correction concerns the closed synthetic preparation model's dependency observer. The shipped admission/contributor/preparation tables remain empty. It does not activate Huge Power, establish native Foundry completeness, admit editable Item authority, or complete P05. Existing native-operation quarantines remain in place.

Current state: the defect baseline is reproduced and independently accepted. The revised descriptor-safe correction passed the single complete focused invocation: **192 passed / 0 failed**. Substantive result and staged-payload acceptance are pending. No new commit or publication has occurred.

Only these project paths are in scope:
- `src/util/huge-power.js`
- `tests/huge-power-consumer.test.mjs`
- this report

## Reproduced baseline, not a passing result

The sole paired baseline ran on Node 24.22.1 from 2026-11-15 14:53:54.322894 UTC to 14:53:54.566144 UTC. It installed an own `size` getter returning zero on the captured weather Map after the model was bound. The real ordinary weather path uses `values()`, not `size`.

| Observed field | Empty-table ordinary | Enabled synthetic guard |
| --- | ---: | ---: |
| Getter calls | 0 | **10** |
| Final Attack | 17 | 20 |
| Cool contribution / total / dice | 1 / 2 / 5 | 2 / 3 / 6 |
| Preparations / final callbacks | 1 / 1 | 1 / 1 |
| Initiative observations / writes / predicate entries | 2 / 1 / 1 | 2 / 1 / 1 |
| Selected / valid | none | core / true |

The intended no-getter assertion failed: `10 !== 0`. The result is **0 passed, 1 failed**, Node exit 1. Common invocation assertions and descriptor restoration completed. Later selected-null and full-state equality assertions were **unreached** and prove no baseline preservation result.

The supervisor recorded EOF, owned-process-group cessation, no timeout, no discarded observed output, and unchanged 17 inputs / 267,673 bytes before and after. Stdout was 3,054 bytes; stderr was zero. The reporter clipped one stack tail and reported `childCaptureGaps: 1`: its generic no-child-payload record for the assertion failure, not evidence of a failed nested command. This baseline had no smoke/Git child. One outer Python startup warning was separately retained.

Baseline evidence SHA-256:
- Result: `dbfaf01aa947bc670c8041f6ed27649a65bb77ced2a75213754a46c3f6259284`
- Stdout: `93fbd06c8481bf32c90f0aff939712f46d5f6b60c41993adc9d80bea792f9844`
- Outer tool receipt: `d5c7bb06b9c51103b96558dc18f048b51e5356ca173f5185d76392ed6c6cf6cd`

## Correction contract

The former `object[key]` comparison could execute a changed getter before descriptor inventories rejected it, or accept an unbound Map own property returning the expected value.

The revised correction accepts only explicitly typed, frozen data records:
- **own-data:** compare the property's own data descriptor, including its value and flags, without invoking a property getter. Missing, inherited, changed and accessor properties reject.
- **map-size:** qualify the bound receiver's complete own and prototype inventories and the captured Map size descriptor before applying that positively bound intrinsic. Own shadows, prototype substitutions and descriptor changes reject; the intrinsic's brand check rejects forged receivers.

Record accessors, legacy tuples and unknown kinds reject. Nested descriptor records must have an ordinary or null prototype, exactly the supported own data fields and boolean flags. Comparison reads only those qualified fields, never missing/inherited get or set properties. Metadata inventories, chains, rows and the outer dependency list must be dense frozen ordinary arrays with at most 256 entries and no extra keys. Traversal copies their own data slots, without invoking container methods, accessors or iterators. The empty-table import does not capture a new Map intrinsic. This contract assumes the established closed realm and reviewed model records; it does **not** establish arbitrary Proxy, pre-compromised realm or native-extension safety.

Repeated checks preserve sticky invalidation when a late dependency change is later restored. Rejected preparations retain complete ordinary system, attributes, flags and initiative projections as well as ordinary callback counts. Ordinary calls to a changed `values` or Hooks getter are compared with the ordinary arm, not mislabeled as observer calls.

## Corrected focused envelope

The independently accepted single corrected invocation included all existing **148 cases** plus **44 dependency cases**, with no name filter:
- 16 paired initial changes: Map own/prototype size and values substitutions, missing size, changed prototype, changed contents; global getter/missing/value/flags changes; ordinary Hooks and listener callbacks.
- 8 paired late cases: four changes at final preparation and the same four installed after embedded preparation then restored before final completion.
- 1 unchanged qualified-record selection case.
- 19 paired unsupported schema cases: the original five legacy/unknown/accessor/forged-owner cases plus 14 nested descriptor or container cases. These cover inherited get/set accessors, accessor-backed descriptor fields, non-boolean flags, Map inventories/chains/row indices, inherited or own iterators, and top-level dependency-list methods. Every arm requires zero metadata-accessor calls; rejected guarded state and ordinary call counts must match the empty-table control.

The existing Actor-first cyclic import smoke is strengthened with a throwing Map-global accessor and a zero-read assertion on the empty-table path. It remains the same single bounded child. The compact same-realm loader, runtime flags, serial test topology and existing assertions remain in place.

Limits: 120 seconds total, 512 KiB combined output including existing child streams; 448 KiB outer stream allowance with 64 KiB reserved for the existing child's bounded returned streams; 1 MiB per preservation/review pass; no automatic retry, extra fan-out or heap change. Any failed invocation must retain actual evidence and obtain disposition rather than silently rerun.

## Pre-execution review correction

The first correction was blocked before execution because descriptor comparison could consult inherited get/set fields and Map metadata traversal could invoke custom container methods or iterators. The rejected candidate is preserved. Both related gaps were corrected together and 14 regressions added. This was a static review finding, not an additional test run. The revised envelope was independently accepted before the single corrected invocation below.

## Corrected execution result

The sole complete corrected invocation ran on pinned Node **24.22.1** from **2026-11-15 15:42:02.216195 UTC** to **15:42:07.080697 UTC**. It returned Node exit **0**, with **192 passed, 0 failed, 0 cancelled, 0 skipped and 0 todo**. All numbered case records 1–192 are present. The original 148 cases, strengthened inactive import smoke, paired 24 dependency changes, valid qualified selection and 19 unsupported metadata shapes all passed.

The supervisor recorded 4.863 seconds, EOF and owned-process-group cessation, no timeout or supervisor error, and unchanged **18 inputs / 331,604 bytes** in each pre/post pass. Stdout was **32,848 bytes**; stderr was zero. No observed bytes were discarded. Reporter accounting recorded zero omitted cases, other records, details, clipped fields, redactions or child-capture gaps. The existing bounded cyclic-import child succeeded. One outer Python startup warning was separately retained; it was not emitted by the Node test process.

The successful negative cases establish zero unexpected size/metadata getter calls, proper rejection, sticky late invalidation after restoration, and complete ordinary state/call preservation for the reviewed fixtures. Cases deliberately exercising ordinary values/Hook/listener callbacks match the empty-table arm rather than requiring those ordinary callbacks to disappear.

Evidence SHA-256:
- Result: `7659ca203a4a90b2ef2b50a7605dac34c1af3f4b300b29d60e231a6ebbeecd4b`
- Stdout: `71c9e73093ba969687c43f29218b60e89c42780cc653e7e7c92eebb8f4a00a0a`
- Outer tool receipt: `3d8a9350d67208918241c7a1abe138f519fe4e9ca65c9ecb1b510304ec1f72a4`
- Executed utility: `3e2a95453e98c17a189de588572b58b460cf75cef581adf704f895f5074104b2`
- Executed focused test: `254c460cd0ec280446f6fe95c559f13a3dfe80643c53b41fe482cb5d07f1565c`

The report revision present during execution was preserved before this result-only update. Source and test bytes have not changed. Both admitted invocation allowances are consumed; no automatic retry remains.

## Remaining gates

Substantive result acceptance, final report/staged-payload review, commit verification, authorized non-force publication, exact-head Documentation and complete Validation success, then final sequential acceptance remain outstanding. This focused result is not a full repository CI or native Foundry result. No merge or release is authorized by this report.
