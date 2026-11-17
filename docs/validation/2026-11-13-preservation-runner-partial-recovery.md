# Preservation runner partial recovery

## Scope and input bindings

The approved migration-preservation plan calls for preserving custom content and existing selections across repeated migrations. The existing single-Item failure test and successful three-Item round-trip test leave a distinct case open. A save can apply one batch before a later save rejects. This regression checks recovery from that serialized partial state using the real runner and migration 0.111.

The checkout and actual remote branch both pointed to `3a48f9675f1d95d8831d3192b3e278837d9c869f` before writing. Preflight `6f66a6` verified a clean working tree, empty index, no conflicting Git operation, both output paths absent and all six source bindings. Coordinator usage receipt `5841fe` at 2026-11-13T04:17:14.751Z reported 82% weekly remaining.

| Path | Committed blob | Committed bytes and SHA-256 | Working bytes and SHA-256 | Representation evidence |
| --- | --- | --- | --- | --- |
| `src/module/migration/runner/index.js` | `8bcb5aab8e177dc5586c227f05f9f6e3ce17e8f8` | 15345, `14932e7c2b0fe057f135f388d2ce6d37704b887d04bf907bcdaa61da504694c4` | 15751, `ad0ff2850ee261cd5a5f6aee9bc0b92d16ad33c52dbcf21757cf11ae39b87745` | 406 CRLF to 406 LF (4bce7b) |
| `tests/preservation.test.mjs` | `f67591aa6d9934c6613ef68b98277c1d90b28e4b` | 15473, `739f48b37948c3819bc11a8eecab3e613860e6aa084bcf36670f0c7d92396660` | 15473, `739f48b37948c3819bc11a8eecab3e613860e6aa084bcf36670f0c7d92396660` | Exact |
| `src/module/migration/runner/base.js` | `d66e6c577138b2624f3b47276eb574b8c6f233a1` | 7288, `ac6c76f47aa9df4a2b0cda6a71e6f1351068fcf2ded22e14250b08c575c39489` | 7532, `c0626f0e2f136b6b8396382e51acdad7cef3cc7dba80496b99e9e58dcf90201c` | 244 CRLF to 244 LF (d361bd) |
| `src/module/migration/migrations/111-prereq-items.js` | `fc93bce94fede4cac095766cb0fab1dce2dcb551` | 528, `eec59d7743b1bc9737861996b986faba7af69ecc9f57bb97e2576e37b8bf8863` | 529, `09906b3ce721aa7bab99e03c92a5c1fec80501ac32ae099f1b8f0d4eae98b579` | 1 CRLF plus 11 LF to 12 LF (ae47a4) |
| `src/util/preservation.js` | `2b278ef0b18e5757158e7cd4fd34878410aba318` | 2126, `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` | 2126, `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` | Exact (ae47a4) |
| `tests/preservation-runner-roundtrip.test.mjs` | `80313af8877caefcea281127b827c0edee36b15b` | 8307, `598a25772861d1a9033e686c312eae1efe1d2e1fdfc24eb68ac2820557b25403` | 8307, `598a25772861d1a9033e686c312eae1efe1d2e1fdfc24eb68ac2820557b25403` | Exact, static reference |

The preflight verified the committed and index identities separately from the actual working-file lengths and hashes. The prior in-memory CRLF comparisons were reused. No file, line-ending setting or filter was changed. The earlier tests were static references for the harness pattern and were neither imported nor rerun.

## Observed first run

The fixtures contain 51 synthetic Feature Items with unique 16-character Item IDs and legacy UUIDs. Modern provenance is null. Item and simulated world schema start at 0.110. Each synthetic legacy source supplies a distinct prerequisite marker. The fixtures include an original-version selection, custom nested fields and flags, and intentional false, zero, null and empty-array values.

The save double captures detached complete updates and requires `{noHook: true, pack: null}`. It rejects unknown or duplicate IDs and unexpected collection writes. It replaces complete stored records. The first save applied Items 1–50. The second save captured the computed update for Item 51 and threw the deliberate error before applying it. The test requires rejection with that exact error object. The runner logged the intentional error and the enclosing test passed.

The first 50 stored records matched the captured detached snapshots, with the expected prerequisites and Item schema 0.111. The computed update for Item 51 also contained its expected prerequisite and schema 0.111, while its stored record retained schema 0.110 and missing prerequisites. The recorded first-call sequence was a 50-record applied save followed by a one-record rejected save. There were no simulated world-schema writes, and its value remained 0.110. Input fixtures stayed unchanged.

## Observed reload and retry

The test serialized the actual partial store and the simulated world-schema value, asserted exact JSON reconstruction including the complete emitted Item schema records, and created fresh Item wrappers. It disabled the deliberate failure and invoked a fresh runner normally at the retained schema. It used neither forced execution nor a reset of any Item version or fixture.

The retry saved 50 (`partial000000001` through `partial000000050`), then 1 (`partial000000051` through `partial000000051`). Its only UUID lookup was `Compendium.p05partial.features.Item.0000000000000051`, for the previously unapplied Item. The recorded order was two applied saves followed by one simulated world-schema write to 0.111. The test permits repeated saves of previously migrated Items.

All 51 final stored and wrapped records had their expected prerequisites and Item schema 0.111, with original IDs, names, provenance, selections and custom state preserved. The first 50 prerequisites matched the serialized partial state. No warnings were observed. Original global descriptors, including property absence, were restored and checked in `finally`.

## Focused execution

The complete authored test matched the inspected on-disk bytes (10,258 bytes, SHA-256 `c8e279f53284c9db52b5cbbcf3994877aae579a1ab58914682b72821f9b31800`). Receipt `0d5e83` verified `v24.22.1` and SHA-256 `86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17` immediately before the single managed execution request. The invocation used the normal Windows account and the project working directory.

```powershell
& 'C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test 'tests/preservation-runner-partial-recovery.test.mjs'
```

Receipt `f35fd4` exited 0 with **1 passed**, zero failed, cancelled, skipped or todo, and no pending session. The logged injected second-save error was expected. No other failure appeared and no additional test was submitted.

The in-memory save double demonstrates recovery from the modeled partial state. Real Foundry database persistence, transactionality, settings preservation, live migrations, runtime adoption and full P05 remain unverified. The assertions cover Item schema 0.111 and lossless serialization of emitted records. The internal construction of schema metadata is outside this case.
