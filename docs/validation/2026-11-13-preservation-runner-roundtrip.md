# Preservation runner round-trip

## Scope and source bindings

Base `7e6b9bb949ff268aa02559f06df8ccf75ea73158` on `codex/ptu-foundation`. Local HEAD, tracking ref and the actual remote agreed before writing. The checkout was clean and the two output paths were absent. The coordinator's same-account usage receipt at 2026-11-13 02:36:04.940 UTC showed 82% weekly remaining. Current preflight receipt `aeb1e9` verified the five committed blob and index bindings and the raw working hashes used for the run.

The five paths below are the exact manifest recovered from the request paired with receipt `84acb2` (recovery receipt `68763f`). Each path is tracked and admitted for this batch. The reference test supplied existing harness patterns and was not imported or rerun.

| Admitted path | Committed Git blob | Committed bytes and SHA-256 | Working bytes and SHA-256 | Committed / working line endings | Comparison receipt |
| --- | --- | --- | --- | --- | --- |
| `src/module/migration/runner/index.js` | `8bcb5aab8e177dc5586c227f05f9f6e3ce17e8f8` | 15345, `14932e7c2b0fe057f135f388d2ce6d37704b887d04bf907bcdaa61da504694c4` | 15751, `ad0ff2850ee261cd5a5f6aee9bc0b92d16ad33c52dbcf21757cf11ae39b87745` | 406 LF / 406 CRLF | `4bce7b` |
| `tests/preservation.test.mjs` | `f67591aa6d9934c6613ef68b98277c1d90b28e4b` | 15473, `739f48b37948c3819bc11a8eecab3e613860e6aa084bcf36670f0c7d92396660` | 15473, `739f48b37948c3819bc11a8eecab3e613860e6aa084bcf36670f0c7d92396660` | 177 LF / 177 LF | `77c48e` |
| `src/module/migration/runner/base.js` | `d66e6c577138b2624f3b47276eb574b8c6f233a1` | 7288, `ac6c76f47aa9df4a2b0cda6a71e6f1351068fcf2ded22e14250b08c575c39489` | 7532, `c0626f0e2f136b6b8396382e51acdad7cef3cc7dba80496b99e9e58dcf90201c` | 244 LF / 244 CRLF | `d361bd` |
| `src/module/migration/migrations/111-prereq-items.js` | `fc93bce94fede4cac095766cb0fab1dce2dcb551` | 528, `eec59d7743b1bc9737861996b986faba7af69ecc9f57bb97e2576e37b8bf8863` | 529, `09906b3ce721aa7bab99e03c92a5c1fec80501ac32ae099f1b8f0d4eae98b579` | 12 LF / 1 CRLF and 11 LF | `ae47a4` |
| `src/util/preservation.js` | `2b278ef0b18e5757158e7cd4fd34878410aba318` | 2126, `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` | 2126, `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` | 43 LF / 43 LF | `ae47a4` |

The retained comparisons verified strict UTF-8 without BOM or lone CR. The working copies of the runner index, runner base and migration 0.111 matched the committed byte sequences after only in-memory CRLF-to-LF normalization. Migration 0.111 has mixed line endings and one extra byte. The reference test and preservation helper matched raw bytes. For the normalized entries, text, eol, working-tree-encoding and filter attributes were unspecified. Effective system Git configuration was `core.autocrlf=true`, with `core.eol` and `core.safecrlf` unset. No custom filter ran and no source or configuration was changed. The historical cause of the representations was not established.

Earlier Plan inspection retained a declaration-selection failure, two acquisitions of `runner/index.js` totaling 30,690 bytes and one direct acquisition of `runner/base.js` totaling 7,288 bytes. Presentation was limited to the admitted methods and import. Preflight `c64b44` stopped on the runner index raw mismatch. Preflight `1c3fb4` hit a BOM-check false positive in the shell guard, reproduced on synthetic text by `521d49`. With ordinal comparison, preflight `84acb2` verified the index representation and stopped on the runner base raw mismatch. Preflight `77c48e` stopped on an opaque migration representation predicate. Independent receipt `ae47a4` proved the migration's exact normalized equality. These were preflight failures. No focused test had been submitted before this run.

## In-memory save and reload contract

The test runs `MigrationRunner` with only `Migration111PrereqItems`. Three synthetic Feature snapshots start at schema 0.110 with no prerequisites and distinct legacy UUIDs. The malformed `false` case keeps its provenance and gains no prerequisites. It produces one manual-review warning that names the saved Item ID, and the lookup recorder confirms that only the null and absent controls resolve their own legacy sources.

Synthetic wrappers return detached snapshots. The save double captures detached full updates and requires `{noHook: true, pack: null}`. It rejects duplicate and unexpected Item IDs and replaces each stored snapshot in full. Assertions cover captured and stored records, all stable IDs, names, provenance, original version selections, custom flags and fields, intentional false, zero, null and empty arrays, and unchanged input fixtures. The allowed Item changes are the complete schema record at target 0.111 and the two compatibility-control prerequisite additions. The simulated world schema advances to 0.111.

The test serializes the saved records and simulated world schema to JSON, checks exact reconstructed values including each complete schema record, and uses fresh wrappers. A fresh runner uses the reloaded current schema without force or a lowered version. It performs no additional Item save, lookup or warning, and the test permits a repeat write of the same simulated schema value. Original global property descriptors, including absence, are restored and checked in a finally block.

## Focused execution

Test `tests/preservation-runner-roundtrip.test.mjs` was inspected in full before submission. Its SHA-256 is `598a25772861d1a9033e686c312eae1efe1d2e1fdfc24eb68ac2820557b25403` (8,307 bytes). The runtime reported `v24.22.1` and matched SHA-256 `86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17` immediately before the one command-specific managed execution request. It ran with the normal Windows account, without administrator elevation or reusable permission, from `D:\Projects\PTU 1.05 on Foundry`.

```powershell
& 'C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test 'tests/preservation-runner-roundtrip.test.mjs'
```

Receipt `219842` exited 0 with **1 passed**, zero failed, cancelled, skipped or todo, and no pending session. The accepted 28-test preservation group was not rerun. The one focused submission allowance was consumed.

The test exercises an offline reconstruction with an in-memory replacement store. It does not verify real Foundry persistence, settings, world migration or full P05. The internal construction performed by `updateSchemaRecord` remains uninspected. Assertions check the observed target version and preservation of the complete emitted schema record through reload.
