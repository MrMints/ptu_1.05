# Huge Power: Pokémon derived-data consistency

## Status

A real-method synthetic baseline reproduced an inconsistency: final guarded Core Attack became 20 while the Pokémon's Cool contest contribution remained 1 rather than 2. A narrow correction and expanded regression matrix are authored. **The reserved harness-only diagnostic passed all 148 cases after the loader-memory correction, and independent review accepted the complete synthetic focused evidence.** The original final invocation failed with heap exhaustion and remains separately recorded below. This document does not claim native Foundry completeness, activation, publication acceptance or completion of P05.

Production admission, contributor and preparation tables remain empty. Ordinary production behavior is therefore unchanged. The separately accepted predecessor `dddcf34494611b49782096826287dbbe5a902b84` has successful repository CI; that success is not evidence that this new correction passes.

The published candidate `bf1b860be0a71e06f47415501fbf197b1b4f1b28` subsequently failed full repository CI because an existing Echoes fixture still pinned the earlier package manifest. The separately reviewed, one-row pin correction has now passed all 194 focused Huge Power and Echoes cases. Corrective-head full CI and final publication acceptance remain pending; the details and failed CI outcome are retained below.

## Scope and evidence

This extends the [previous Huge Power consumer validation](p05-huge-power-consumer.md), using its accepted arithmetic and source references: PTU 1.05 Core p.320 and February 2016 optional playtest p.5. February is an optional playtest, not official errata. No original PDF or new source/version mapping was established by this batch. Supported content remains Generations 1–8.

The new case runs the complete actual Pokémon `prepareDerivedData()` method, its stat/evasion/capability helpers, the actual Actor preparation body, actual Item/rule factory/AELike/predicate execution, actual initiative construction and the empty-inventory move path. Complete source bodies are hash-pinned and only declared imports are rebound. The fixture asserts method identity instead of substituting the earlier simplified derived calculation.

The relevant order is:

1. Ordinary rule execution and stat calculation.
2. Pokémon derived fields, including contest contributions from those ordinary stats.
3. The second ordinary derived pass already present in Actor preparation, followed by initiative, origins and refresh boundaries.
4. Guarded final selection of a private Huge Power stat candidate.

Before this correction, the last step replaced `system.stats` without updating the eagerly calculated Cool contribution. This finding concerns the admitted closed synthetic domain; it is not an observed live-world defect.

## Reproduced baseline

One baseline invocation ran on 2026-11-15 from 10:57:36.885 to 10:57:37.329 UTC:

- Node exit 1; **0 passed, 1 failed**, with no cancelled, skipped or todo cases.
- Failure: Cool contribution was **1**, expected **2**.
- Preceding assertions established final Core Attack 20, two ordinary initiative observations at Attack 17, one Core preparation, one final callback, one producer write and one predicate entry.
- Later assertions for Cool total and dice were not reached. Their expected values follow from the reviewed calculation, not independently observed baseline assertions.
- All 17 pinned inputs were unchanged. Streams reached EOF, no bytes were discarded, and the owned process group ceased.
- The sole case outcome was retained. One error-stack tail was explicitly shortened. Two outer Python startup warnings were preserved separately; Node stderr was empty.

Independent result review classified this as a reproduced inconsistency, not a fixture failure. The baseline has not been rerun or relabeled as a pass.

## Authored correction

The actual Pokémon method marks the beginning and successful completion of each derived interval. The observer discards earlier completion state at each start, so an incomplete later call cannot borrow an earlier result. A candidate requires the expected two ordinary intervals in the complete Actor sequence.

The completed ordinary stats and contests are retained through bounded, plain-data descriptor inventories. Accessors, unsupported object graphs, nonfinite values, repeated or incomplete intervals and late changes reject selection. Writable target properties and complete relevant data inventories must still match immediately before publication of the candidate.

A candidate must preserve every non-Attack stat field and allocated-point accounting. Cool contribution, total and dice are calculated privately from the final Attack and unchanged ordinary contest modifiers, poffins and voltage. Only the validated stat result and those three dependent fields are written. No preparation, hook, rule producer, formula or predicate is replayed, and no candidate is exposed to the ordinary callbacks.

Unsupported contexts retain ordinary results and a non-authorizing diagnostic. The correction does not add production bindings or broaden the supported native model.

## Focused coverage

The full existing Huge Power test body is retained. Added cases cover:

- Core, February, disabled February, no Ability and empty production admissions.
- Contest threshold crossings and the contribution cap, allocated points, stages, flat modifiers, Nature, classified Vitamins and Trainer contributions.
- Complete ordinary-state comparison after excluding only the intended Attack and Cool outputs, including unrelated derived fields, flags and saved-input preservation.
- Repeated full and direct derived preparation, exact ordinary invocation counts and unchanged producer/predicate counts.
- Late contest data changes, replacement, extra custom state, read-only targets, accessors and allocated-point changes.
- Missing species/system data, incomplete later derivation, reentrancy and an interrupted derived body.
- Unknown listeners or replaced hook services, plus exact cleanup of modified global and prototype descriptors.

The concrete correction, fixture and execution envelope passed independent review before the one final complete focused invocation. That invocation failed as recorded below. Static syntax and whitespace checks are not behavioral results.

## Synthetic boundary and limitations

Core Document/Item/DataModel behavior remains explicitly modeled. The fixture uses synthetic settings, an empty listener registry, an empty move/skill/effect inventory, no weather effects, no trainer, an empty struggle-type catalog and a callback-free debounce double. Actual move preparation reaches its empty Collection result. Initiative action construction is real, but later roll callbacks are not invoked. Skill-dependent preparation, trainer callbacks, populated move behavior, live settings and saved worlds are not established by these tests.

Unexpected unavailable service calls fail rather than reaching a real service. No production settings or world data are read or changed. Full native preparation closure, production eligibility/reservations/mappings, actual-world preservation and safe activation remain separate gates. Green repository CI, when obtained for a future exact commit, will not remove these limitations or authorize activation, merge or release.


## Pre-execution review corrections

Static independent review held the first correction because live stats could be serialized before late descriptor rejection, and its incomplete-second-pass test was already rejected for an unknown Rule callback. Neither finding was a newly executed failure. The revised candidate validates the completed descriptors before live-stat traversal and again before committing a candidate. Root/nested stat accessor tripwires and read-only target cases are added.

The old unknown-callback negative is retained. A separate, explicitly modeled data-availability boundary delegates the actual types getter and removes only synthetic species after a valid first completion. Test-only observer bridges delegate each real start/end marker once with unchanged arguments and receiver. They must establish a valid first finish, a valid second begin and no second finish, while the actual Pokémon derived method remains unchanged. This isolates incomplete completion from the Rule profile gate. The failed original final invocation did not establish outcomes for these new cases; the reserved diagnostic later completed them as recorded below.

## Failed final invocation and harness diagnosis

The complete focused file ran once on 2026-11-15 from 11:30:22.088 to 11:30:46.655 UTC. Node exited 1 after 111 individual passes and a file-level failure caused by JavaScript heap exhaustion near 2 GiB. Of 148 planned cases, 37 have no individual outcome, including the Actor-first cycle smoke and all new Pokémon cases. No cases were deliberately filtered, skipped or weakened. The file-level failure is not a completed 148-case result.

All 17 pinned inputs were preserved. The supervisor recorded 21,356 stdout bytes, no discarded bytes, complete stream EOF and cessation of the owned process group. Reporter omissions were zero, but that does not establish suite completeness. Node's diagnostic stderr events were retained inside the reporter output; the outer Node stderr stream was empty. The two outer Python startup warnings were retained separately.

Independent static diagnosis found recursively embedded, nonce-distinguished data-URL module graphs. For the first non-Pokémon fixture, 206,818 original bytes expanded to 2,550,279 rewritten bytes and 3,400,692 URL characters across eleven named modules alone. Fresh native ESM identities accumulated across scenarios; restoring globals did not unload them. This mechanism is established and strongly consistent with the OOM, but the exact fatal allocation and dominant retained structure were not measured.

The authored harness-only remedy uses short identifiers and a per-fixture `SourceTextModule` table in the current realm, without changing runtime implementation, production body text, import inverse checks or any case assertion. It rejects unknown or dynamic fixture imports, bounds each fixture to 128 modules, 48-character identifiers and 512 KiB generated source, and releases its tables during cleanup. It requires Node's experimental VM-module flag. No heap increase, forced garbage collection, test filtering or additional process fan-out is proposed. The existing separate Actor-first cycle smoke remains unchanged.

The baseline and failed final allowances remain consumed. The exact corrected fixture and diagnostic envelope received independent pre-execution acceptance before the single conditional harness-only diagnostic. No further local invocation allowance remains.


## Successful reserved harness-only diagnostic

The diagnostic ran on 2026-11-15 from 11:46:17.054 to 11:46:21.284 UTC:

- **148 passed, 0 failed, 0 cancelled, 0 skipped and 0 todo**, confirmed by 148 sequential individual case numbers and both Node summaries.
- The Actor-first actual-cycle smoke passed as case 112. All 36 real-Pokémon cases, numbered 113–148, passed. Two pre-existing pairs share display names; distinct case numbers, not name uniqueness, establish completeness.
- Node exit 0; supervisor elapsed time 4.229512 seconds. All 19 preservation inputs, totaling 314,353 bytes, matched the accepted manifest.
- Complete retained output was 26,050 stdout bytes and zero outer Node stderr bytes. There were no omitted outcomes/details, clipped fields, redactions, discarded bytes or unread stream remainder. The owned process group ceased.
- The tool display was shortened by its return budget. Acceptance rests on independent reading of the complete retained JSONL and matched hashes, not on that shortened display. The two outer Python startup warnings remain part of the retained tool receipt; no outer Node stderr was captured.

The original Core inconsistency now passes its explicit final Attack 20, Cool contribution 2, Cool total 3 and Cool dice 6 assertions. The wider matrix confirms ordinary-state preservation, contributor and threshold cases, unchanged ordinary invocation counts, late-descriptor rejection and independent incomplete-second-pass rejection within the declared closed synthetic domain.

Independent result review accepted this successful reserved diagnostic as the corrected focused evidence. It did not relabel the original final invocation as successful. Completion without OOM is demonstrated; peak heap use and general leak freedom were not measured. Production tables remain empty, and all native Foundry and activation limitations above remain.

Evidence identifiers:

- Accepted diagnostic manifest SHA-256: `89fc6fa134ca70cacfcbbdf258a275931dc68398b2b233dde82d5d6973b8ceeb`.
- Result SHA-256: `5fed91e89985dc635d8415880664f5027035be0dd7fafccd504471684a519222`.
- Complete stdout SHA-256: `1bd53b949a4eec33b44523e2d5a77fcb2eccb1dd8b93efc0251207eaf7ca1e49`.

Exact-commit repository CI and publication acceptance are separate gates, not inferred from this focused result. Repository CI must exercise the committed test script with its VM-module flag. This batch does not authorize native activation, merge or release.

## Repository CI failure and narrow fixture repair

The published candidate `bf1b860be0a71e06f47415501fbf197b1b4f1b28` was tested by [PTU CI run 43711810590, attempt 1](https://github.com/MrMints/ptu_1.05/actions/runs/43711810590). It completed with failure on 2026-11-15 at 12:41:54 UTC. Documentation passed. Validation failed at `pnpm test`; validation, pack verification, build and artifact upload did not run after that failure.

The complete test summary was **3,822 tests: 3,776 passed and 46 failed**, with no cancellations, skips or todos, on Node 22.23.4. Every failure was in `tests/echoes-replacement-apply.test.mjs`: its common integrity hook rejected `package.json` before any of those 46 behavior cases could run. The package test script had legitimately gained the experimental VM-module flag required by the accepted Huge Power harness, but the Echoes fixture still expected the previous 589-byte manifest.

The repair changes only the exact package pin in that fixture, from 589 bytes / Git blob `df135a39f198db5bf1bc9136b608c0cc2c592241` to the already-published 615 bytes / Git blob `76d81ab7182b563883d0ec8857fda73108292111`. It does not alter the package manifest, production code, other fixture pins, test assertions, dependencies, lockfile or CI workflow. The failed CI run remains a failure; it was not rerun or reclassified.

### Successful corrective focused invocation

A separately admitted and independently reviewed final invocation ran on 2026-11-15 from **13:32:40.778 to 13:32:49.904 UTC**, with Node **24.22.1**, the VM-module flag and test concurrency 1:

- **194 passed, 0 failed, 0 cancelled, 0 skipped and 0 todo**: 46 Echoes cases plus all 148 Huge Power cases. Individual outcomes numbered 1–194 and all three summaries agreed.
- The actual Actor-first cycle smoke passed as case 158; all 36 real-Pokémon synthetic cases, 159–194, passed. The prior case bodies and assertions were retained.
- Node exited 0 in 9.126 seconds. Supervisor errors were empty. The owned process group ceased and both streams reached EOF, with no discarded bytes or potentially unread remainder.
- Preflight and postflight each checked **7,442 pinned paths / 159,644,245 bytes**, with no mismatches and identical preservation digest `873f29964c4fc225e29807d82744d21f4d6a20c3cff83ac91d095a171cfb2af8`.
- The Echoes diagnostic confirmed the fixed 7,395-entry collision inventory and its integrity/assembly byte totals. Large retained fixtures were used only for the existing inventory, collision and preservation checks, not as new gameplay support evidence.
- Complete retained output was **32,972 stdout bytes and zero outer Node stderr bytes**. Reporter accounting recorded no omitted case/other records or details, clipping, redaction or child-capture gaps. No child-process failure occurred.
- The private reporter was corrected before execution to preserve bounded child-process status, signal and retained-output accounting even when a failure detail is shortened. Missing measurements are explicit gaps, not assumed zero. No shipped test behavior was changed for that accounting correction.
- The tool display was truncated by its return budget, but independent acceptance inspected the complete retained JSONL and matching hashes. The **two outer Python startup warnings** were retained separately. They were not Node stderr or lost test outcomes.
- Git metadata sizes were measured in a separate bounded **preflight only**, not directly during the test: `ls-tree` returned 772,691 bytes and `check-attr` returned 1,802,625 bytes. The existing caller and its per-command time/buffer limits were unchanged; this is not a claim of direct runtime byte measurement.

Independent result review accepted this complete focused result. The final invocation allowance is consumed and no retry is authorized. The earlier baseline failure, heap-exhausted final invocation, successful reserved harness diagnostic and failed full CI remain distinct outcomes.

Evidence identifiers:

- Failed CI job log SHA-256: `6abda1a66ee09a64d698f42fb388120e3cd639863103b1ed0ba6c6d429cbe377`.
- Corrective manifest SHA-256: `4b7946e3d9c58adec104cb6a84e0107a187d072f4a7be7602a8e90fed0e14a1c`.
- Corrective result SHA-256: `64ba6134d87a2523f734716234c659151bd5f638eb2e9aca1450b02369e101c8`.
- Complete corrective stdout SHA-256: `e5c526cdf8ab18a37e87a1123613211d87f8cdc529777418f7f746789cf98b08`.
- Corrected Echoes caller SHA-256: `0486334a2d308e66225b94af7d92f8452ab7e4c9a80baf3fb4314b7c1f15aa15`.

This Node 24.22.1 focused result does not substitute for the required complete repository workflow on the corrective commit, whose CI uses Node 22.23.4. Production tables remain empty and inactive. Native Foundry completeness, actual-world preservation, activation, P05 completion, merge and release are not established or authorized by this result.
