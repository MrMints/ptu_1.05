# Invalid modern provenance in preservation migrations

## Scope and test inputs

The offline case uses synthetic Item snapshots at base `86187c2de1d607996aac268947a18c06e0efc203`. A saved Item carries a non-null malformed modern value and a valid legacy UUID for a different source version. The test expects manual review, zero source lookups, and an unchanged snapshot after each of two calls. Controls cover a valid modern UUID, an invalid nonempty modern string, null and absent modern values, and existing intentional field values.

The checked source routes and SHA-256 values are recorded below.

| Path | SHA-256 |
| --- | --- |
| `src/util/preservation.js` | `6fb1f090699bfea1052dfcbee44fdbfb5c841f8c8a30767a12bd33d349ab0976` |
| `src/util/document-source.js` | `86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0` |
| `src/module/migration/migrations/111-prereq-items.js` | `09906b3ce721aa7bab99e03c92a5c1fec80501ac32ae099f1b8f0d4eae98b579` |
| `src/module/migration/migrations/113-keywords.js` | `09af4ef14a6c882e7ec599a656fce828353b6d80e7bbb806fd3d7c54242ad518` |
| `src/module/migration/migrations/115-rules-automation.js` | `f3ec9691f8c432bfab9025b7f0b827c5bc18ca960fa7ad139d237e0c03342221` |
| `tests/preservation-invalid-modern.test.mjs` (8,932 bytes) | `d20e50682a7bd8280b9dac2fc91499568995e625ec4f308f08644a0588ae5ce2` |

Static inspection found that `getDocumentSourceId` falls back to the legacy UUID when the modern value is non-string. The three migration entry points use `resolvePreservationSource` to fill missing fields. The test checks whether that combination copies data from the legacy version. The established null and absent fallback remains a compatibility requirement.

## Runtime verification

The initial gate stopped before project-code execution because the bundled executable did not match the November 4 SHA-256 `6c2c4171cffbd96e3454b78c5d345fac6ff75702411e2a569ad53bd9f860cd20`.

Plan independently verified the current executable for this offline batch. The file is 93,713,712 bytes and has file and product version `24.22.1`, with last write time `2026-11-06T08:41:55Z`. Windows reported a valid Authenticode signature for OpenAI OpCo, LLC with thumbprint `DE62726DB667B59DB0FD14B38F858D16C96804A0`. P05 confirmed `node --version` reported `v24.22.1` and checked the newly admitted SHA-256 in the command below. The reason for the difference from the old pin is unknown.

## Ordinary execution

Working directory `D:\Projects\PTU 1.05 on Foundry`. The PowerShell tool used `login:false` and `tty:false`.

```powershell
$ErrorActionPreference = 'Stop'
$testPath = 'tests/preservation-invalid-modern.test.mjs'
if ((Get-FileHash -LiteralPath $testPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne 'd20e50682a7bd8280b9dac2fc91499568995e625ec4f308f08644a0588ae5ce2') { throw 'Test byte mismatch' }
$nodePath = 'C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if ((Get-FileHash -LiteralPath $nodePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne '86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17') { throw 'Runtime byte mismatch' }
& $nodePath --test $testPath
exit $LASTEXITCODE
```

Receipt `0bb374` terminated with exit 1 and no pending session. The Node test runner reported `spawn EPERM` (`errno -4048`) when it tried to start its test process. The one file-level failure represents **zero test bodies executed**. The run provides no assertion result or evidence of actual field population. No Foundry world, Actor, settings, or persisted document was tested.

## Managed execution

After the ordinary run had terminated, Plan admitted one command-specific managed request for the identical command. The request kept the normal Windows account and used the execution-boundary permission without administrator elevation or a reusable permission. The current runtime and test hashes passed the command guards.

Receipt `34d058` executed nine test bodies. Five passed and four failed with `ERR_ASSERTION`. Zero were cancelled, skipped or marked todo. Node exited 1 with no pending session.

| Route | Observed for each malformed value |
| --- | --- |
| `resolvePreservationSource` | Both calls looked up and returned the synthetic legacy UUID. Neither issued a warning. The saved snapshot itself stayed intact. |
| `Migration111PrereqItems` | One legacy lookup copied `prerequisites`. The second call retained the field. |
| `Migration113Keywords` | One legacy lookup copied `keywords` and `range`. The second call retained both fields. |
| `Migration115RulesAutomation` | One legacy lookup copied `rules` and `referenceEffect`. The second call retained both fields. |

All four malformed inputs (`0`, `false`, an array and a plain object) produced those results with zero warnings. In every migration case the original snapshot, excluding the newly populated fields, matched both structurally and as serialized JSON after each call. The malformed value, stable IDs, saved selections and custom state were retained. Valid modern precedence, invalid nonempty modern refusal, null and absent legacy support, and repeat preservation of existing intentional field values all passed.

## Proposed correction for review

In `src/util/preservation.js`, use a local source-selection guard for the resolver and default warning. When `_stats.compendiumSource` is non-null and non-string, treat the source as unresolved, use the saved Item ID for the warning, and leave all source fields untouched. Use the current helper for strings, null and absent values so established lookup and refresh behavior continues. The focused follow-up is `preservation-invalid-modern.test.mjs`, `preservation.test.mjs` and `document-source.test.mjs`.

This receipt reproduces the bug in in-memory entry points. Persisted migration, settings and world behavior remain unverified.

## Local correction

Plan admitted a change to `src/util/preservation.js` at base `86187c2de1d607996aac268947a18c06e0efc203`. Its SHA-256 changed from `6fb1f090699bfea1052dfcbee44fdbfb5c841f8c8a30767a12bd33d349ab0976` to `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` (2,126 bytes). Diff inspection and `git diff --check` passed.

The resolver and its default warning share a private guard. A non-null, non-undefined, non-string modern value is unresolved before the legacy helper can be consulted. The warning uses the saved Item ID when available. Strings, null and undefined still use `getDocumentSourceId`. Public exports, the general source helper, migration bodies and test files retain their existing behavior and bytes where applicable.

One command-specific managed execution used the same working directory and normal account with `login:false` and `tty:false`. The execution-boundary approval applied to this invocation without administrator elevation or a reusable permission.

```powershell
$ErrorActionPreference = 'Stop'
$pins = [ordered]@{
    'src/util/preservation.js' = 'd22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb'
    'tests/preservation-invalid-modern.test.mjs' = 'd20e50682a7bd8280b9dac2fc91499568995e625ec4f308f08644a0588ae5ce2'
    'tests/preservation.test.mjs' = '739f48b37948c3819bc11a8eecab3e613860e6aa084bcf36670f0c7d92396660'
    'tests/document-source.test.mjs' = '959ca638260369eb20b470bcac31ee47cdf335909e6b7997707fb804194f4c2b'
}
foreach ($pin in $pins.GetEnumerator()) {
    if ((Get-FileHash -LiteralPath $pin.Key -Algorithm SHA256).Hash.ToLowerInvariant() -cne $pin.Value) { throw "File identity mismatch: $($pin.Key)" }
}
$nodePath = 'C:\Users\mathi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if ((Get-FileHash -LiteralPath $nodePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne '86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17') { throw 'Runtime byte mismatch' }
& $nodePath --test 'tests/preservation-invalid-modern.test.mjs' 'tests/preservation.test.mjs' 'tests/document-source.test.mjs'
exit $LASTEXITCODE
```

Receipt `0c4908` exited 0 with no pending session. All 28 tests passed (9 malformed-provenance and compatibility cases, 15 preservation cases and 4 document-source cases). Zero failed, were cancelled, skipped or marked todo. The existing preservation suite emitted its intentional injected write and embedded failure diagnostics while passing their assertions.

All four previously failing cases now confirm zero legacy lookups, no new fields, preserved snapshots and manual-review warnings. Positive controls confirm valid modern precedence, invalid nonempty modern refusal, null and absent fallback, and intentional value preservation. Static review checked the saved Item ID fallback in the default warning. The focused tests check that the warning requests manual review.

Retained run history includes ordinary startup failure `0bb374` (zero bodies), managed baseline `34d058` (five passes and four regression failures) and corrected managed group `0c4908` (28 passes). This evidence is limited to synthetic snapshots and mocked migration interfaces. Persisted Foundry migration, settings and world behavior remain unverified. No broader suite was run.
