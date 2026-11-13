# P05 Item-sheet render purity — 2026-11-06

## Admission and boundary

Plan turn `01a1af69-223f-75b0-a5cd-daa3a66a226c`, final `msg_05b44f39781bfcb5016aed6b6eb45087d1a5ad17f3016c1f22`, separately admitted this seven-path offline repair. The coordinator assigned existing P05 sole checkout ownership from clean `a2e99de8a7d643edeba16a67057cfc7fdf762524`, without world ownership. Saved model/effort and usage, hours, sole-writer and review gates remain unchanged.

Only `PTUItemSheet.getData()` changes in production. Previously its editable path called the real `_updateIcon({update:true})`, which could submit a duplicated complete Item source to a persistent update. Actor descendant callbacks rerender open sibling Item sheets, reaching that path. Aliased render inputs could also let presentation-only token-panel defaults mutate owned flags.

The correction detaches `data.item` and the optional legacy `data.data` before preparing presentation defaults. Editable icon selection uses the existing helper with the detached source and `update:false`; the resulting icon is also projected into `data.data.img`, used by the templates. Custom icons remain unchanged. Read-only icon presentation retains its prior behavior. No persistent icon repair is performed. Token-panel defaults remain presentation-only. Prerequisite rerender callbacks, itemized advisory diagnostics, rule forms, custom state and separate context notes remain present.

Item base, Actor callbacks, provenance/refresh utilities, acquisition/version resolvers, accepted pair definitions and five IDs, packs, settings, manifests, dependencies and workflows are unchanged. No protected validator or frozen historical evidence binding was edited. This is not a replacement operation or installation.

## Behavioral regression and retained failures

The new suite executes actual production Item, Item-sheet and Actor class bodies with the established VM class-loading approach. Only ESM linkage and external Foundry services are supplied by controlled doubles. The decisive cases use the real Item `_updateIcon`; no counting substitute replaces it. Synthetic document updates are recorded and their asynchronous completion observed, including the original fire-and-forget helper call. Renders queued by the real Actor callback are also awaited through completion.

| Execution | Receipt | Result |
| --- | --- | --- |
| Unchanged production baseline | `ee9579` | **6 passed / 12 failed**, exit 1; zero cancelled/skipped/todo |
| Corrected focused suite, unchanged test bytes | `2e84dd` | **18/18 passed**, exit 0; zero failed/cancelled/skipped/todo |
| Exact nine-file affected group | start `4cfa41`, session `12405`, terminal `6fd998` | **299/299 passed**, exit 0; zero failed/cancelled/skipped/todo; process ended |

The baseline failures are product assertions, not loader/harness failures. Four editable/default-icon cases and both open-sibling callback cases observe a real persistent-update attempt. Aliased/custom and read-only cases detect the owned `showInTokenPanel` mutation. The diagnostics and rule-form/context cases also fail their zero-write assertion. Six controls pass. The complete baseline failure output remains in this chat's receipt; it is not replaced by the later pass.

Two read-only metadata-formatting commands (`88d1e0`, `ad14af`) failed PowerShell parsing before their bodies ran; corrected metadata reads succeeded. The first Plan history lookup used an oversized output limit and returned an argument error; the corrected bounded lookup returned the complete admission. These are separate preparation errors, not test results or access refusals. No managed execution request was refused in this batch.

Finalization metadata also retains the connector's GitHub 422 large-diff generation error and `22cd0a`: the approved metadata-only CLI command stopped because `gh` was unavailable on PATH, before either subsequent Git lookup ran. No remote write or test execution occurred in that command. The connector's dedicated metadata-only `get_pr_info` and branch-ref GET then verified the open draft PR4, exact repository/branch and accepted predecessor. Neither error was an access refusal; no unchanged retry or CLI/runtime replacement was used.

Corrected coverage includes initial and repeated renders; both default SVG icons and custom icons; editable/read-only; detached and aliased inputs; open/closed sibling sheets; complete owned/sibling/Actor snapshot equality; detached presentation edits; exact advisory item identity; separate known-unmet/custom-unknown entries; refreshed diagnostics after an externally supplied skill change; rule forms; effect enrichment; and separate source-context notes. The generic acquisition sheet test now asserts nonpersisting helper arguments and supplies the necessary duplicate service. Its helper stub is supplemental; the new decisive suite exercises the real helper.

The Actor fixture explicitly has `game.combat === null`. The callback's conditional `#updateInitiative()` path is **not tested or established safe**. This batch also does not establish behavior of arbitrary third-party rendering services or native Foundry operation.

## Execution bindings

Every test invocation received command-specific managed allowance through the native PowerShell route, with `login:false`, `tty:false`, no reusable prefix and a 10,000 ms initial yield. Inline guards checked the normal `DESKTOP-AUTBHJG\mathi` account, `C:\Users\mathi`, unelevated identity, observed `-NoProfile`, workspace, fresh usage/time, accepted base, exact checkout scope and bound bytes before launching Node. There was no runtime/shell/loader substitution or access-refusal workaround. The sole-writer assignment remained active through validation.

- Workspace: `D:\Projects\PTU 1.05 on Foundry`.
- Node: `C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`, SHA-256 `6c2c4171cffbd96e3454b78c5d345fac6ff75702411e2a569ad53bd9f860cd20`.
- PowerShell: `C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe`, SHA-256 `362a356ce7f0940ec74f73a8fc2c990a2cc24a38a11c90bbd8eca947110ad139`.
- Fresh usage snapshots at 06:05:57, 06:07:47 and 06:08:27 UTC: supported weekly 10,080-minute window **25% used / 75% remaining**, `resetsAt:1794380164`, ordinary usage allowed, same already-alerted cycle, no reset or hold. All executions preceded Friday's 13:00–22:00 UTC blackout. The ≤5% checkpoint and actual verified 100%-reset recovery rule remain.

The complete guarded raw commands are retained in the action-specific tool requests. These hashes cover their exact UTF-8 text (LF, no appended newline):

| Invocation | Bytes | SHA-256 |
| --- | ---: | --- |
| Baseline | 3163 | `19480788cabbe6172615f0964618ed347aea67ffdb51a46c2f321d96e86764a9` |
| Corrected focused | 3248 | `b2b06868fd8d66837a3b6a2a6ca0aa296bb93c99ef8a119f40e30a5491e77434` |
| Affected group | 4659 | `06304fed48902509875da05f34074e72c81b585f87db51a05e294d4b26057ab5` |

The baseline bound eight inputs; corrected focused retained those pins except the deliberately corrected sheet. The affected invocation bound sixteen source/test inputs and checked that protected tracked files still matched the accepted HEAD. Key raw working-file bindings:

| File | SHA-256 |
| --- | --- |
| Original sheet | `96959531ef152df097d2040e2cc2f12522841375123ed3a1b94a78e9ede7e217` |
| Corrected sheet | `3ca7aea1a22c999b703c2308c8009b0f243f7411691a99aadf36f11a7666b6e1` |
| New regression, baseline and corrected | `f7ee145ab11b25ba8bd1477a2f0ccc79122d369edd3f34363ff2d562caabb527` |
| Updated acquisition test | `d6d549fc6978eadb88c72dddf2974e415b15f683e626338dedd67a138fcac588` |
| Protected Item base | `a763b57fc6b0e069988820d36fc9547ce8066b667a3290bbf3c40e37d9883f9a` |
| Protected Actor base | `a8b8a671bc12b9fce8d44d44a455f3a6edc3d0e3414fbc52999b76a5fef36f8e` |

Focused payload: `node --test --test-reporter=spec tests/item-sheet-render-purity.test.mjs`. Affected payload, through the same verified absolute runtime:

```text
node --test --test-reporter=spec tests/item-sheet-render-purity.test.mjs tests/acquisition.test.mjs tests/acquisition-preservation.test.mjs tests/prerequisites.test.mjs tests/document-source.test.mjs tests/rule-version-echoes-readiness.test.mjs tests/rule-version-acquisition-review.test.mjs tests/feature-acquisition-review-dialog.test.mjs tests/feature-acquisition-review-launcher.test.mjs
```

## Finalization and remaining gates

The authorized finalization is limited to these seven code/test/documentation paths, the existing `codex/ptu-foundation` branch in `MrMints/ptu_1.05` and draft PR4. Normal Documentation and Validation CI must pass on the final documented head, including full tests, validation, pack verification and build. Final run/job outcomes and clean local/tracking/actual-remote/PR-head agreement belong in the final handoff and PR evidence; local 299/299 is not that CI receipt. Independent review and substantive Plan acceptance follow explicit P05 release.

Future replacement application still requires supported active-provenance retargeting and normal update-authority/readback proof. The conditional combat callback must be substantiated or its triggering context explicitly excluded and rechecked. Unknown/manual usage remains preserved uncertainty, not a blanket replacement blocker; this batch adds no consumption automation, reset, refill or second charge. No replacement apply, migration, rollback promise or all-route isolation claim follows from this rendering correction.

No live/private/world/actor/server access, capture/backup, native execution, pair installation, new source/API/vendor retrieval, settings/security/model change, worker, default activation, merge or release occurred. Original native runtime/artifact selection, settings-capture/useDexExp limitations and held `7335c7` remain unchanged: **UNCERTAIN, cessation confirmed, five consumed / cap nine / four held / no retry**. Native review remains **0 passed / 0 failed / 28 not run**. Repository tests do not spend that separate ledger.
