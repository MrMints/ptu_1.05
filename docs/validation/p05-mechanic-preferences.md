# P05 mechanic-preference inspection v1 — local validation checkpoint

## Admission and checkpoint

Accepted starting revision: `a172557ce7f55aa6e5faf341d45d5c31face9be3`, `codex/ptu-foundation`, existing draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). Contract sources are P05 turns `01a1ae1f-a612-7523-b44c-0667d1a862fe` and binding addendum `01a1ae2c-3cf8-75c1-a0fc-c2b616511180`. Plan turn `01a1ae32-bac4-7bc3-9f74-bf006c4975a0` accepted them, qualified the projection domain and separately admitted this implementation. Coordinator turn `01a1ae37-4df1-7002-9255-e7860bff0a30` assigned sole checkout ownership; the subsequent scope correction preserved that assignment.

Only six paths are admitted:

- [src/util/mechanic-preferences.js](../../src/util/mechanic-preferences.js)
- [tests/mechanic-preferences.test.mjs](../../tests/mechanic-preferences.test.mjs)
- [docs/RULE_VERSIONS.md](../RULE_VERSIONS.md#mechanic-preference-inspection-v1--unvalidated-draft)
- This report
- [P05 workstream handoff](../workstreams/05-revision-selection.md#p05-mechanic-preference-v1-draft-checkpoint--2026-11-05-indianapolis)
- [CHANGELOG.md](../../CHANGELOG.md)

The documentation-only checkpoint left two source/test files and four documentation changes uncommitted. At the initial stopped checkpoint, **no assertion-body tests passed or failed: execution was refused before test-file entry**. The separately approved one-shot managed validation later passed **429/429**, with unchanged source/test bytes; its finite record follows. No stage/commit/push, PR metadata update or new CI occurred during that checkpoint. Later explicit coordinator disposition resumes original scoped finalization; exact final documented-head normal CI and formal independent/Plan implementation acceptance remain outstanding.

## Pre-mutation observations

The checkout was clean at the accepted base, with matching local/tracking heads. GitHub's metadata-only `get_pr_info` reported the same remote head, `MrMints/ptu_1.05`, branch `codex/ptu-foundation`, open/draft/unmerged PR4. Other local PTU section chats were notLoaded; Plan was idle. Existing tracked dependencies were unchanged; no existing target file was overwritten for the three new paths.

Own-context observation through the existing native PowerShell route confirmed `-NoProfile`, FileSystem provider and provider/process directory `D:\Projects\PTU 1.05 on Foundry`; authenticated, non-System, non-anonymous, non-administrator identity with impersonation `None`, profile `C:\Users\mathi`. Saved model/effort was unchanged. Supported weekly usage was above the 5% hold and hours were outside the Indianapolis weekday 08:00–17:00 blackout. No balances or reset predictions are stored as lasting project policy.

Retained setup failures: full-PR connector retrieval returned GitHub 422 (`diff not_available`, taking too long); `gh` was not on PATH; the direct Git remote query could not connect through configured proxy `127.0.0.1`. No network workaround or repeat of that Git query followed. The supported metadata-only connector supplied PR/remote-head evidence. A history read requested an unsupported output bound before being corrected to the supported 20,000-character limit; no process or mutation resulted from that tool-input error.

## Prepared implementation and conventions

The [API guide](../RULE_VERSIONS.md#mechanic-preference-inspection-v1--unvalidated-draft) documents exact input records, report fields, presence semantics, preset dispositions and limits. The module exports only synchronous `inspectMechanicPreferences` and `previewMechanicPreset`, each accepting one primitive JSON string. It reuses protected `lookupMechanicChoice`, keeping basic string classification, choice membership and eligibility separate. No caller-object hooks, Item argument, callback, production mechanic catalog, registration, persistent settings, legacy mapping, migration, active consumer or update payload is introduced.

The private scan follows successful JSON syntax validation, retains decoded keys to reject duplicate members, and validates number lexemes before returning parsed data. Only canonical decimal safe-integer tokens are admitted; no rounded/underflowed saved number is returned as preserved data. Whitespace is examined only for nonblank validation; padded IDs and choices retain exact identity. All ID-keyed projection/lookup maps created by this module have null prototypes and own data keys, including `__proto__` and `constructor`.

Root depth is **0**. A container and each primitive JSON value count as one node; object member names do not count. Maximum depth **12** and count **8,192** are inclusive. All declared collection/text bounds are common input-admissibility failures, including recognized preview fields; arbitrary saved/custom payload strings retain only whole-document bounds. Raw length is measured in UTF-16 units, not UTF-8 bytes. Syntax, duplicate, limit and unsupported-number failures retain bounded raw input with null snapshot; admissible common envelope/schema failures retain the decoded snapshot. Malformed rows remain inspectable, block a complete projection and cannot manufacture absence.

An available projection covers only its explicitly reported domain. Omitted undeclared IDs prove no storage absence. Consumers must not replace an unavailable null projection with `{}` or pass an omitted ID to a helper to manufacture fallback. Preset proposals remain separate from current choices. Unknown/invalid/custom storage is preserved; no precedence, overwrite, permission or application authority is conferred. Declarations always remain `sourceApproval:"not-assessed"`.

## Actual validation and retained failure

The existing Node executable was reverified against SHA-256 `6c2c4171cffbd96e3454b78c5d345fac6ff75702411e2a569ad53bd9f860cd20`. This binds local bytes only and makes no official-distribution provenance claim.

Execution receipt **`d4d2ea`** used native PowerShell `C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe`, `login:false`, `tty:false`, working directory `D:\Projects\PTU 1.05 on Foundry`. The exact admitted Node command used `--test --test-concurrency=1` and these nine absolute test paths in the Plan-specified argument order:

1. `D:\Projects\PTU 1.05 on Foundry\tests\mechanic-preferences.test.mjs`
2. `D:\Projects\PTU 1.05 on Foundry\tests\rule-versions.test.mjs`
3. `D:\Projects\PTU 1.05 on Foundry\tests\rule-version-registry.test.mjs`
4. `D:\Projects\PTU 1.05 on Foundry\tests\rule-version-preview.test.mjs`
5. `D:\Projects\PTU 1.05 on Foundry\tests\rule-version-acquisition-review.test.mjs`
6. `D:\Projects\PTU 1.05 on Foundry\tests\preservation.test.mjs`
7. `D:\Projects\PTU 1.05 on Foundry\tests\acquisition-preservation.test.mjs`
8. `D:\Projects\PTU 1.05 on Foundry\tests\documentation.test.mjs`
9. `D:\Projects\PTU 1.05 on Foundry\tests\evidence-contract.test.mjs`

The parent ran, but Node's default test isolation refused every test-file process:

```text
Error: spawn EPERM
errno: -4048
code: 'EPERM'
syscall: 'spawn'
tests 9
suites 0
pass 0
fail 9
cancelled 0
skipped 0
todo 0
duration_ms 18.3706
```

These are **nine failed test-file wrapper entries**, not nine failed product assertions. **Zero test bodies executed.** Outer tool exit was **1**, with no active session. No implementation import/syntax success or candidate behavior can be inferred from that run. At that stopped checkpoint no retry, alternate runtime/shell, test-isolation bypass, guard relaxation or managed exception followed. The later one-shot action below had separate admission and managed approval. Ordinary repository test processes do not consume held stopped-backup slots.

Cases prepared but unexecuted at the initial checkpoint covered: zero-hook arity/type rejection; syntax/decoded duplicates and validation precedence; canonical number endpoints and rejected numeric forms; all declared size/count boundaries; depth/node conventions; row shape/duplicate/scope/evidence failures; preserved custom/null/nonmember/ineligible values; exact padded/prototype-sensitive IDs; all preset dispositions, duplicates and preset-only error independence; projection-domain limits; deterministic deeply frozen output; and complete repeated/custom original/errata/playtest Item composition through unchanged existing helpers. The later 429-pass grouped run exercised this new suite and the eight protected suites. The new suite contains no subprocess launcher or filesystem-writing fixture.

### Separately approved one-shot managed validation

Plan turn `01a1ae4b-01bd-7b23-870f-de17bea0ae8b` accepted the stopped-run disposition only and separately admitted one action-specific managed-review request; implementation acceptance remained withheld. The coordinator assigned that request in P05 turn `01a1ae55-4124-7283-8214-b4f7389e7dfc` after specific owner approval. No failed request was retried through another route.

Preflight receipt `dae49f` matched all 21 ordered `{path,sha256}` rows to manifest SHA-256 `2ec3cbfac5622f62530e5d1e204c1d9887e8854e4d3705de133fbc815461c55d` (`JSON.stringify(rows)`, UTF-8, no trailing newline). It also matched the pinned Node, six-path scope, unchanged base and protected inputs; confirmed exclusive ownership, eligible usage/hours and no active/uncertain ordinary test session; and observed native PowerShell/`-NoProfile`, correct working directory and authenticated normal profile `C:\Users\mathi`, administrator false, impersonation None. This historical 21-row manifest binds the pre-documentation validation candidate; the current documentation update necessarily produces new six-file checkpoint bindings.

The original unescaped `cmd` argument for command record `exec-daac91d5-7a2f-4527-be66-43b00143bcfe` was recovered from retained conversation tool input, without reconstructing the display-escaped command. The unchanged payload retained its Node-hash guard, same nine-suite argument order, `--test --test-concurrency=1` and parent exit-code propagation. Its single `require_escalated` request used the same native shell, working directory, `login:false`, `tty:false`, no reusable prefix and normal unelevated account. Managed review allowed the action; this did not grant administrator privileges.

Execution receipt **`4718dd`** yielded session **`77461`**. A read-only session observation returned `982c76` with no new output. Terminal receipt **`04fa56`** ended the session with **exit 0**, no active session and **no execution uncertainty**. Complete output was retained without truncation:

```text
tests 429
suites 0
pass 429
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 46430.9629
```

The logged injected write/embedded failures occurred within passing preservation failure-handling controls; the final runner counted no failed tests. No correction, further run, file edit, stage/commit/push, PR/CI/network action or held harness action followed that invocation. The present follow-up is separately assigned local documentation/static review only. It preserves the original failure, successful local validation and still-outstanding acceptance/CI gates as separate observations.

## Static checkpoint review

Read-only audit receipt `3562a8` confirmed exactly the six admitted paths, no protected tracked changes from the accepted base, unchanged local/tracking HEAD, and both complete API-guide/workstream text prefixes after CRLF normalization. All **177 local Markdown path links** in the four documentation files resolved. Tracked `git diff --check` and trailing-whitespace inspection of the three new files passed. This is a static checkpoint, not an executed syntax/behavior test. Git warned that LF would become CRLF when it next touches the three edited tracked documents; no line-ending normalization action followed.

Draft source bindings at this checkpoint:

| File | Raw SHA-256 |
| --- | --- |
| New module | `de585d7b5ba9d0d0b75135fdefdad27ec9f3badd0ea0d1d6e0164c155ab6f8d1` |
| New tests | `3388052e37dc585d1433af7e1acd611e468d9522dd492723637017e02dbf3ef0` |

Existing protected helper, existing-suite and package/lock hashes were captured before mutation and remained outside the exact changed-path set. No native/runtime/security files or held cache inputs were touched by this batch.

## Compatibility, limits and next gates

This draft changes no existing helper/settings/catalog/pack/test/package/workflow, persistent ID, UUID, skill key, macro path, saved campaign, acquisition prerequisite or selected Item. Caller declarations do not approve supported production content. Generation 1–8 scope and distinct source-backed selections remain; no implementation/default/live integration or full P05/pre06 acceptance follows from prepared source.

The scope-recovery detour retrieved retained historical receipts only. No held command was submitted or executed. Receipt `7335c7` remains UNCERTAIN with cessation previously confirmed; ordinal 5 consumed, **5 consumed/cap9/4 held**, no retry. Native review remains **0 passed / 0 failed / 28 not run**. No world/private/server/actor/installation/security/credential/model action occurred.

The initial execution restriction stopped that run; separately approved managed validation subsequently passed locally. The documentation-only assignment then updated four files and performed static review without execution or publication, ending STOP/HOLD with ownership retained. Its broader finalization handoff had been rejected before delivery; no operation from it was retried or routed around during that checkpoint.

The later explicit coordinator disposition, after specific owner approval, resumes the original six-path finalization only. It permits the scoped commit, normal push to the existing branch, required existing draft-PR4 documentation update and normal Documentation/Validation CI on the exact final documented commit. No new local Node/candidate/test execution, source/test change, managed exception, force/default push, merge, release or version bump is assigned. A real refusal stops that action without another route or proxy/configuration change. P05 retains ownership through final-head CI and clean local/tracking/actual-remote/open-unmerged-draft-PR4 agreement, then explicitly RELEASES/STOPS for independent followed by substantive Plan implementation acceptance. Local passes do not provide CI or formal implementation acceptance. Final head/run/job receipts belong in the completion handoff and PR record; this report is finalized before the required CI. No other writer or later batch starts automatically.
