# P05 isolated Echoes replacement planner — local validation

This implements the corrected paper contract admitted by Plan turn `01a1b326-8853-7ab0-b383-9ab459c78a89` (decision `msg_05b44f39781bfcb5016aee60fc6cac87d1a151b3f6446d1598`). The original proposal, normative P/S/Q correction and consolidated interface addendum remain the design evidence. This document records implementation and local tests, not independent or planner implementation acceptance.

Accepted starting head: `8bc3c398ad4eb2c51ff750992d25b6dcfacc6634`, repository `MrMints/ptu_1.05`, branch `codex/ptu-foundation`. Existing P05 received exclusive checkout ownership for this six-path local batch. Publication is held: no commit, push, PR metadata, remote CI, installation, activation or world operation is included.

## Implemented boundary

`src/util/echoes-replacement-plan.js` has one synchronous export, `planEchoesReplacement`, accepting exactly one primitive JSON string. Private decoding, UTF-8, SHA-256, canonicalization and intent-description functions remain in that module. The only imports are the existing pure supplied-registry and replacement-preview APIs. There are no Node APIs, Foundry globals, filesystem/network operations, clock/random generation or supplied executable interfaces in production code.

Every result is detached and deeply frozen. The common root fields are `schemaVersion`, `kind`, `status`, `inspectionOnly`, `bindings`, `attribution`, `fieldDecisions`, `preservationRequirements`, `prerequisites`, `historyIntent`, `issues` and `applicationConditions`. Unavailable sections are null. `inspectionOnly` is always true; every application condition remains unresolved. There is no update object, consumer wiring, callback, permission verdict or persisted history.

Statuses distinguish refused input, required review, a descriptive conditional plan, genuine no-change and cancellation under reported-unattempted lifecycle evidence. Uncertain/in-flight/unknown lifecycle, a related intent or any valid non-null resume reference requires reconciliation. A cancellation or deterministic repeated intent never proves an earlier operation had no effects.

## Fixed definitions and interfaces

| Role | Source Item | Version | Complete Item J |
| --- | --- | --- | --- |
| core | `ViZpn17qLA4ACQGa` | `celnYjQjM3jjtAnZ` | `1178d3f9f2ff20b96bd3f933e86b7fb43cc7f195ac6a17032428d9057d680289` |
| may | `e9dQ3NmVm7EuQBO5` | `i1OAz3lvuCRIm3n9` | `98f3860983c5064bb2a69a1a0c3621cba250df806b09f8fcb92f0896acecea54` |

Canonical identity remains `UKk9BnAZtm1xMoRB`. Labels are **PTU 1.05 supplied core** and **May 2015 playtest (optional)**. May is an optional playtest, not official errata. These prepared definitions remain uninstalled.

Both full compiler-shaped mapping records are required. Validation compares all seven top-level fields and complete version/canonical/source metadata with the established compiler construction, including authority, publication precision, citations and relationship evidence. It does not authenticate a mapping from a display name or a self-declared hash.

The adapter builds the supplied registry in fixed core/May order and calls `previewRuleVersionReplacement` in explicit registry mode without a `versions` property. Candidate UUID metadata is added only after checking its complete original Item hash; it claims no installed pack membership. Captured source identity/interface conflicts are checked before preview lookup. Unknown modern provenance cannot acquire attribution through legacy fallback. Unknown context is passed as unknown, not as an observed default setting.

The new tests construct the actual accepted compiler bundle in memory using its repository-only declared inputs and existing pack-source identity inventory. Before constructing owned fixtures they assert both complete Item pins and every mapping field. They do not import another test suite, write fixture files or read original PDFs. The inventory includes inherited excluded records; its size is not an in-scope content total. Supported scope remains Generations 1–8.

## JSON, hashes and review sequence

The input schema is the accepted request envelope: selection; actor/membership/complete Item source/lifecycle evidence; both approved definitions; independent prerequisite Actor, mechanic and reference evidence; raw history evidence; and explicit review state. Protocol records are closed. Evidence preserves absent, present (including null), unavailable and unknown states. Invalid field types are not silently converted into absence.

The bounded decoder rejects decoded duplicate keys at every JSON boundary, unsafe prototype-related property names, invalid syntax/Unicode and leading BOMs. It uses safe own data properties and one aggregate node budget including embedded JSON. General strings are limited to 32,768 UTF-8 bytes, keys and explicit UUID/label fields to 256. Each decoded JSON boundary has a maximum depth of 24. Protocol numbers must be safe integers. Snapshot numbers must have a finite, non-lossy canonical JSON number spelling; unsupported lexemes produce review without an approval seal rather than being rounded, replaced by null or normalized. Numeric loss is distinct from uncertain/manual usage semantics.

| Bound | Limit |
| --- | ---: |
| Request / output | 1,048,576 UTF-8 bytes each |
| Aggregate decoded value nodes | 32,768 |
| Membership / supplied complete sources | 1,024 / 64 |
| Structural selected reference component | 64 nodes / 128 directed edges |
| Each source / approved Item JSON | 262,144 / 65,536 bytes |
| Prerequisite Actor / reference context | 131,072 bytes each |
| Mechanic evidence | 16,384 bytes |
| History / entry / entries | 65,536 bytes / 4,096 bytes / 32 |

**J** hashes UTF-8 `JSON.stringify` of the complete strictly decoded Item, retaining JavaScript property enumeration behavior. It is checked before preview augmentation. Formatting or Unicode escape changes can preserve J, while ordinary member reordering can change it. Retained pins were not changed.

**C** explicitly emits object members in UTF-16 lexical order, including integer-like names; arrays retain order and embedded JSON strings retain their exact text. **H** is SHA-256 of UTF-8 C. Raw working-file hashes below are a third, separate domain.

P contains exactly domain `ptu.echoes.inspection.v1`, request `schemaVersion`, `kind`, `selection`, `before`, `approved`, `context`, `history`, and complete `review.choices` as `choices`. S = H(P). Action, expected seal, resume reference, acknowledgements and proposed intent are excluded.

Inspect → choose and reinspect → acknowledge that unchanged S → request plan. Changed evidence/choices invalidate the old seal. Missing/stale seals or acknowledgements require review; malformed, duplicated, unknown or nonapplicable codes are refused. Acknowledgement order is irrelevant.

Q contains exactly domain `ptu.echoes.intent-review.v1`, S as `inspectionSeal`, complete choices and sorted unique applicable `acknowledgedCodes`. Entry `bindings.review` = H(Q). Operation ID = H(complete entry with its own ID omitted). This is the non-circular chain: evidence/choices → S → H(Q) → entry → operation ID. No intent authenticates a person, inspection or execution.

## Preservation and intent history

Only complete effect, prerequisites, frequency, source-attribution value, coherent active compendium provenance and selected-version ID/label are described as target-definition changes. Unknown source-object members and supported selected-version extras are preserved. Same-target custom/provenance/selection repairs require separate review; a valid alias is not cosmetically rewritten.

Owned identity, presentation, notes/class, unrelated flags/custom fields, enabled/free state, migration stamps, usage/consumption, subchoices, raw grant IDs/actions, other instances and Actor ranks/mechanics remain protected. Unknown/manual/partial/exhausted usage has no reset, counter calculation, refill, new pool or semantic veto. Prerequisites stay version-specific, itemized and advisory; the candidate is never inserted into captured prerequisite membership. Separate Researcher context adds no inferred Field or grant.

Both automation and grant preservation require explicit preserve-reviewed choices and preservation-reported acknowledgements on a replacement. Other owned Features require preserve-all review. Custom leaf replacement and missing/null selected-version creation add their applicable acknowledgements. Exact legacy-only attribution, retained conflict and retained opaque legacy data remain distinct. Raw legacy values are never rewritten.

Reference coverage conservatively follows exact supplied owned IDs/UUIDs wherever serialized source values or dictionary keys refer to them. It requires all owned Features and every connected endpoint source, and enforces component limits. It does **not** infer grant semantics from property names or certify arbitrary automation compatibility. Preserving data that actually requires rewriting/retargeting is outside this planner; unresolved semantic compatibility and all live conditions remain for separately admitted review. No named custom schema is silently migrated.

The protected binding includes all supplied state except the specifically described target changes and narrowly conditional stock metadata tagging. Creation time and duplicate/export/other stats remain protected; no blanket Actor metadata or rollback exemption is claimed. Core tagging changes still require future stock-path evidence. The complete before binding includes the supplied metadata for staleness detection.

History at `flags.ptu.ruleVersionHistory` is an immutable, v1, fixed-canonical ledger of **intents**. Existing values must agree with selected source evidence. Sequence, instance identity, complete entry hashes, prefix hashes, public definitions and privacy shapes are checked. Unknown schema versions require review; malformed history, tampering, collision or invalid prefix refuses. Capacity stops the earliest bound; no pruning, truncation, overwrite or migration exists. A full valid ledger still permits genuine no-change.

Public recognized pointer/version values and exact absence/null may be inline. Opaque retained legacy values use type/byte-length/digest plus `retained-in-place`. Supported selection objects retain a public ID/label projection and whole/untouched-property bindings. Extras remain on the Item; they are not archived in history. Unsupported/private selections cannot be silently overwritten. No whole Actor/Item, private notes/paths, freeform reviewer text, credential, timestamp or applied/completion state is written into an intent.

`historyIntent` describes one entry and expected prior binding; it is not a ledger-after payload or a persistence/readback receipt. Editable hashes establish consistency, not tamper-proof history, authority or wall time.

## Local execution evidence

All three runs used pinned Node `6c2c4171cffbd96e3454b78c5d345fac6ff75702411e2a569ad53bd9f860cd20` through pinned native PowerShell `362a356ce7f0940ec74f73a8fc2c990a2cc24a38a11c90bbd8eca947110ad139`, with `login:false`, `tty:false`, the approved normal Windows account (identity verified in the local managed-review receipts), observed `-NoProfile` and no administrator token. Each command separately passed managed review after fresh usage/hours/ownership, clean protected base and source/test/runtime byte checks. No reusable permission prefix was requested.

At each run, supported weekly usage was 29% used / 71% remaining in the unchanged 10,080-minute cycle resetting at `1794380164`, above the ≤5% hold threshold and after Friday blackout. No reset or budget increase was used. Existing P05 was the assigned sole checkout writer.

| Run | Receipt / process | Outcome |
| --- | --- | --- |
| Initial focused, 2026-11-06 23:52:28 UTC | start `9ae0b7`, session `26682`, terminal `06c1dc` | **33 passed**, 0 failed/cancelled/skipped/todo, exit 0, ended |
| Corrected focused, 23:54:34 UTC | `06a8e6`, no continuing session | **34 passed**, 0 failed/cancelled/skipped/todo, exit 0, ended |
| Exact nine-file affected group, 23:55:35 UTC | start `135327`, session `66966`, terminal `aa3e49` | **386 passed**, 0 failed/cancelled/skipped/todo, exit 0, ended; 156,399.5429 ms |

The initial successful run is retained. A subsequent contract audit found that inspect-with-resume needed reconciliation rather than refusal; the correction added that regression plus explicit UUID/label boundary coverage before the second focused run. There were no assertion failures in these focused runs. Earlier project failures, preparation errors and unavailable historical observations remain unchanged in their original evidence; this batch does not erase them.

The focused suite covers both replacement directions and trainer/Pokémon contexts; no-change/cancel; unmet/unknown diagnostics; preservation of presentation, usage, flags, choices and references; modern/legacy/selection states; J versus H; SHA standard vectors including the million-a vector and an independent Node crypto oracle; integer-like/Unicode canonical order; duplicate keys at every embedded boundary; malformed Unicode/numbers/bounds; stale seals/acknowledgements; intent/history prefix/capacity/privacy/resume/determinism; inert input interfaces and frozen output. Test-only VM instrumentation accesses unchanged private hashing code with import/export scaffolding removed in the same runtime; public behavioral tests use the actual normal module import. Production exports are unchanged by instrumentation.

The admitted grouped command lists exactly: `echoes-replacement-plan`, `rule-version-echoes-admission`, `rule-version-echoes-readiness`, `rule-version-registry`, `rule-versions`, `rule-version-preview`, `rule-version-acquisition-review`, `prerequisites`, and `document-source` test files. The existing admission test's compiler CLI subprocess uses Node filesystem-write denial; it reads declared repository inputs only.

| Tested file | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/util/echoes-replacement-plan.js` | 41,383 | `26e7f932987215a9c64e36058bc5baf9eb784ed24d61905ed98a771e5331ec44` |
| `tests/echoes-replacement-plan.test.mjs` | 31,668 | `86e56642360df251067d95145c85bb7b73a30b2e687c35c9e063c2edb4382177` |

The first run instead bound source `4503d72e3fce42344799f0761699291bb6bf8f21089b368a9109a4a26b8670d6` and test `f782d84641072d81d1b27c96cc38fb166e843ec2b08d4175553bbdb3e452dbf8`. Its result is not substituted for corrected-byte validation. All eight existing grouped test files remained byte-identical to the accepted base and were pinned in the grouped invocation.

## Remaining gates and handoff

Only the six admitted code/test/documentation paths may differ. The existing RULE_VERSIONS/workstream byte prefixes and all historical changelog text are preserved. The separate vendor ledger remains 21 files / 534,942 bytes; no new vendor read belongs to this batch.

Publication is **held**. The coordinator must use a separately authorized finalization route for the concrete scoped payload, documented-head commit/push and existing draft PR4. Normal Documentation/Validation CI on that final documented head must pass full tests, validation, pack verification and build, with clean local/tracking/remote/PR agreement. Independent review followed by substantive Plan implementation acceptance remains required. Local tests do not satisfy those gates.

Concrete finalization request: review exactly `src/util/echoes-replacement-plan.js`, `tests/echoes-replacement-plan.test.mjs`, this validation report, the appended `docs/RULE_VERSIONS.md` and `docs/workstreams/05-revision-selection.md` sections, and the Unreleased `CHANGELOG.md` entry. Use the source/test byte pins above and final six-file ledger returned in the P05 chat; all other tracked files and existing documentation prefixes remain protected. No publication was performed under this local assignment.

No installed registry, browser/NPC/Item-sheet replacement consumer, default activation, setting, history writer, migration, acquisition/exposure, world/Actor/server access or gameplay/effect-use automation is implemented here. Original runtime `e63595a2f6bb51358d5b66a66b594e6868e5286b`, CI `41250223014` and artifact `13061542688`, storage/useDexExp limits and unavailable historical gate observations are unchanged. Held `7335c7` remains **UNCERTAIN, cessation confirmed, 5 consumed / cap 9 / 4 held / no retry**. Repository tests consume no held synthetic attempt. Native cases remain **0 passed / 0 failed / 28 not run**.

## Prepublication capture-consistency correction — November 6, 2026 Indianapolis

The following correction belongs to the same six-path local batch and supersedes the earlier implementation bytes, not their historical receipts. Independent static review identified two incomplete invariants: reference discovery trusted only the declared membership alias table, and prerequisite Actor `id` could disagree with `_id`/UUID without being checked. Contextual Item identity comparisons likewise accepted a convenient `_id` while ignoring a conflicting `id`. Publication stayed held; existing P05 was explicitly reassigned sole checkout ownership for reproduction and bounded correction only.

### Reproduced failures before correction

Source was still exactly `26e7f932987215a9c64e36058bc5baf9eb784ed24d61905ed98a771e5331ec44`. Added regression test bytes were 33,660 / `a507f371dd1e8b89468b2c246e4a45a2a6e5e02b73ad240507b10703fc777341`. The concrete managed-review-approved invocation selected only `^correction:` tests in `tests/echoes-replacement-plan.test.mjs` using `--test --test-reporter=spec --test-name-pattern=^correction:`. It still assembled the actual admitted compiler fixture from declared repository inputs.

| Regression | Actual unchanged-source result | Required result |
| --- | --- | --- |
| Explicit same-Actor Item UUID absent from both membership and source, in a source value | conditional-plan; seal present; intent present | review-required; no intent |
| Same omitted UUID in a dictionary key | conditional-plan; seal present; intent present | review-required; no intent |
| Omitted endpoint reached through a captured connected source | conditional-plan; seal present; intent present | review-required; no intent |
| Context Actor `id` conflicts with consistent `_id`/UUID | conditional-plan; seal present; intent present | refused; no seal/intent |
| Context Actor supplies conflicting `id` alone | conditional-plan; seal present; intent present | refused; no seal/intent |
| Context Item `id` conflicts with its `_id`, UUID and member | conditional-plan; seal present; intent present | refused; no seal/intent |

This was a real failing execution: **0 passed / 6 failed**, no cancellation/skip/todo, exit **1**, ended, receipt `31ebb4`, 4,058.2088 ms. Start was **2026-11-06 19:11:36 Indianapolis / 2026-11-07 00:11:36 UTC**. Each failure's assertion recorded `observed=conditional-plan; seal=true; intent=true`. No production source was changed before this run. The omitted-UUID baseline used another fixed synthetic endpoint (`...0599`) to establish the invariant beyond the review's `...0502` example; corrected coverage includes both. Original **33/33**, **34/34** and **386/386** runs remain above and are not represented as corrected-byte validation.

### Bounded implementation correction

- Reference scanning now recognizes an exact `Actor.<selectedActorId>.Item.<16-character Item ID>` in both serialized values and dictionary keys even if the endpoint is absent from the declared alias table. An unlisted explicit same-Actor endpoint contradicts `all-items` coverage and requires reconciliation. Selected connected endpoints also require source capture; missing or unavailable capture cannot be acknowledged away. Component limits remain 64 nodes/128 edges. No membership entry, source snapshot or relationship is created, deleted, repaired or retargeted.
- Existing membership-backed bare IDs still participate in conservative structural coverage. A foreign-Actor UUID, compendium UUID, malformed/suffixed UUID or unknown bare custom string is not converted into an owned endpoint. It stays opaque and preserved under the existing explicit review boundary. This establishes capture consistency, not broader grant semantics or automation compatibility.
- Every explicitly supplied prerequisite Actor `id`, `_id`, `uuid` and type must agree with the selected subject. Every supplied contextual Item `id`, `_id` and UUID must identify the same declared member; explicit UUIDs must belong to that Actor, and supplied type must agree with membership. Contradictory or malformed identity evidence refuses before an inspection seal is produced. No convenient identity field, stale acknowledgement or partial capture erases a conflicting one.
- Valid partial, absent, unavailable and unknown prerequisite facts remain nonblocking diagnostic uncertainty. When an otherwise noncontradictory contextual Item lacks an evidenced UUID or identity, the separate diagnostic Actor projection retains captured skills/levels while marking its Item membership unavailable. The exact original context evidence remains sealed; no missing identity or owned collection is invented and no incomplete collection becomes known empty. Unmet skill prerequisites still remain unmet, advisory and nonblocking.

The new tests retain the six failed regressions and add both endpoint IDs, value/key forms, source-only versus membership-and-source omissions, unavailable source cells, self/reciprocal/other-instance controls, opaque foreign/custom values, all contextual identity fields, membership/type conflicts, partial direct/wrapper collections and preserved unmet/unverifiable diagnostics. These are bounded capture/identity checks only; there is no new public API, consumer, application/history writer, setting or live operation.

### Corrected executions and bindings

Each correction execution independently passed its command-specific managed review and fresh usage/hours/ownership, accepted protected-base, six-file/runtime/source/test byte and normal-account/observed `-NoProfile` gates. Pinned Node/PowerShell and normal unelevated account are unchanged from the original evidence above. Supported weekly usage was still 29% used / 71% remaining, unchanged 10,080-minute cycle/reset `1794380164`, with no hold/reset/budget change; all work occurred after Friday blackout. These tests are separate from held producer attempts.

| Run | Indianapolis / UTC start | Receipt | Result |
| --- | --- | --- | --- |
| Unchanged-source regression reproduction | Nov 6 19:11:36 / Nov 7 00:11:36 | `31ebb4`, no continuing session | **0 passed / 6 failed**, exit 1, ended |
| Corrected full focused suite | Nov 6 19:14:26 / Nov 7 00:14:26 | `70a037`, no continuing session | **47 passed / 0 failed**, 0 cancelled/skipped/todo, exit 0, ended; 4,964.8488 ms |
| Final corrected exact nine-file affected group | Nov 6 19:15:20 / Nov 7 00:15:20 | start `c257b0`, session `94475`, terminal `7d7a68` | **399 passed / 0 failed**, 0 cancelled/skipped/todo, exit 0, ended; 156,554.3717 ms |

| Corrected tested file | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/util/echoes-replacement-plan.js` | 43,779 | `07db2bd6f81335d8fd1d24b479878237755376dc4519e9b039f6f9108a027840` |
| `tests/echoes-replacement-plan.test.mjs` | 39,336 | `31d9b51ffb70f31ed1051a747722f9eafa03ac0c9202afe28bf9b85931ede214` |

The final affected command uses exactly the same nine test paths listed above, now with corrected source/test pins and fresh pins for the eight unchanged existing tests. It includes the previously disclosed write-denied compiler CLI subprocess. Documentation completion does not substitute for final documented-head CI. The final six-file working-byte ledger and safe ownership disposition are returned in this P05 chat after terminal cessation and scope verification.

All three correction invocations have terminal results, with no pending or uncertain execution: baseline assertion exit 1, corrected focused exit 0, corrected group exit 0. No source or test edit followed corrected validation. Documentation-only completion retains prior raw document prefixes/changelog history and the six reproduced failures. Read-only independent review may now assess the concrete corrected local payload, subject to coordinator sequencing; publication remains held and no later batch is started.

All earlier holds remain: no commit/push/PR edit/new CI/merge/release, private/world access or held native action. Further read-only independent review and substantive Plan implementation acceptance remain outstanding. The protected accepted base, old document prefixes/history, vendor ledger, saved model/effort, uncertain old 22:00 observations, original runtime/artifact and storage/useDexExp limits are unchanged. Held `7335c7` stays **UNCERTAIN, cessation confirmed, 5 consumed / cap 9 / 4 held / no retry**; native stays **0 passed / 0 failed / 28 not run**.
