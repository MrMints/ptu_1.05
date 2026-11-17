# Foundry v13.351 startup and pack baseline — 2026-10-24

Result: **setup and pack-loading checks pass, with the warnings below**. This is the
initial PTU 02 batch, not completion of the section or release acceptance.
Machine-readable evidence: [2026-10-24-foundry-packs.json](2026-10-24-foundry-packs.json).

## Changes

Tested runtime/content/build commit: `7d6bfefe80bfe9fe919505d90634f6cad2244a07`,
on `codex/ptu-foundation`, in draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4).
The tree was clean when testing began. This follow-up adds diagnostics and documentation;
it changes no system runtime, source pack records, rules, IDs or campaign selections.

Added `tools/prepare-foundry-pack-check.mjs` and `tools/foundry-pack-check.macro.js`.
The preparation command derives expected document and folder IDs from every declared
source pack. The GM macro reads each pack's index and full documents, then compares
types, ID sets, duplicate counts and invalid-record lists. It executes no pack macros
and imports no content into the world. See [testing instructions](../TESTING.md).

## Validation

- `pnpm test` could not spawn test workers in the sandbox (`spawn EPERM`).
  `node --test --test-isolation=none tests/*.test.mjs` passed all seven tests.
- `pnpm validate` passed: manifest paths, 17 skill mappings, 15 packs and 7,395 source records.
- `pnpm packs:verify` passed for all 15 packs, including semantic equality and stable IDs.
- `pnpm build` produced `dist/system.zip` (1,108,932,439 bytes) and `dist/system.json`.
  Archive SHA-256: `360668f3a1b167a6556f957982245075279db7dd9b54b11a140479dcf04d07c8`.
- `pnpm test:foundry:setup` completed. All 6,735 packaged runtime files compared against
  the installed copy had identical SHA-256 hashes; README/changelog were outside that
  runtime comparison. The archive contained every declared pack manifest and no local
  reference documents, source JSON, test data, docs or cache paths.
- The owner completed normal license activation for `.foundry-test` through Foundry.
  Installed executable: `D:\Foundry\Foundry Virtual Tabletop\resources\app\main.mjs`;
  actual version 13.351, local Node 24.19.0, port 30001, UPnP disabled.
- The new `ptu-verification` world launched; GM login succeeded. Core pack migrations
  completed on the disposable installation. The empty-world system migration reported
  0/0 actors and 0/0 items; that does not validate campaign migration preservation.
- The GM diagnostic passed for the setup-helper copy at 23:52 EDT. Foundry was stopped,
  the old disposable system copy preserved under `.cache/ptu02/setup-helper-system-backup`,
  and the ZIP extracted into a new system directory. The clean archive copy launched,
  connected all 15 pack databases, and passed the same diagnostic at 23:56 EDT.
- After a client reload, all 15 packs passed again at 23:57 EDT. Each index and full
  document/folder set matched source IDs, with zero missing, unexpected, duplicate or
  invalid records. The JSON includes all three per-pack reports and UTC timestamps.
- `node tools/prepare-foundry-pack-check.mjs` and
  `node --check tools/foundry-pack-check.macro.js` passed. The repository macro was
  saved and executed in the clean and reloaded world.

| Pack | Content documents | Folders |
| --- | ---: | ---: |
| abilities | 631 | 3 |
| moves | 1,294 | 16 |
| feats | 1,324 | 78 |
| edges | 85 | 1 |
| items | 843 | 11 |
| capabilities | 144 | 4 |
| habitats | 25 | 0 |
| rolltables | 17 | 5 |
| effects | 614 | 59 |
| species | 1,806 | 8 |
| macros | 6 | 0 |
| references | 335 | 1 |
| spirit-actions | 34 | 8 |
| journals | 2 | 0 |
| poke-edges | 38 | 3 |
| **Total** | **7,198** | **197** |

The earlier 7,395-document structural total includes 197 Folder records. The move
pack also contains inherited item subtypes; these counts do not change the separate
1,184-move ledger or certify any move's rules.

## Compatibility

All testing used the isolated data directory, with one Foundry process at a time.
The clean copy used the built archive, retained the disposable configuration/world,
and replaced only the disposable system directory while the server was stopped.
License files, world databases, raw logs and screenshots remain ignored local files.
The original system copy is preserved as a cache backup. No campaign was used.

The system ID, pack names, macro paths, skill keys and source IDs are unchanged.
The manifest's inherited `compatibility.verified` remains `13.350`; this focused test
does not establish complete v13.351 compatibility.

## Limitations

- Setup/client warning: unknown manifest keys `type` and `templateVersion`.
- Client warnings: the V1 Application framework is deprecated. Observed system callers
  include TokenPanel, CompendiumBrowser, TypeMatrix and the initial migration summary;
  the test-only result Dialog also uses V1. No framework migration was attempted.
- Server warning: the configured latest-release manifest URL was unavailable. This
  development candidate has no public release. No release or update was published.
- Client viewport errors were logged, including 1280×720 in the hidden clean/reload tab.
  This batch cannot certify layout or clipping. Captured client logs showed no other
  error messages, and server JSON logs showed no error-level entries in the batch.
- The setup helper merges into an existing copy and leaves obsolete database files.
  Matching installed bytes alone does not establish a clean installation. The clean
  ZIP extraction and subsequent live checks address that limitation for this batch;
  the helper itself is unchanged.
- Pack loading does not establish runtime reference resolution, rules correctness,
  prerequisite/generator behavior or pack macro execution. The existing inventory of
  682 unresolved explicit targets is unchanged and still needs dispositions.
- Player permissions, actor sheets, gameplay, revision selection and campaign upgrades
  were not tested. The diagnostic is GM-only and not a scheduled or CI-driven world test.

## Session handoff

Both managed server handles are terminal. Port 30001 refused connections after the
final stop. The initial session logged a successful shutdown after Return to Setup;
the clean-install session was stopped with Ctrl+C and no final graceful-shutdown log
was observed. Do not infer campaign migration or recovery guarantees from this test.

The activated configuration, disposable world, GM and saved diagnostic remain in
`.foundry-test`. Before reuse, verify no live process owns that data path or port.
Do not run the setup helper against a live server. No other section was started or
messaged. Next bounded action: classify the 682 reference targets by runtime field
and historical metadata, then investigate evidence-backed runtime failures.

## References

[Issue #1](https://github.com/MrMints/ptu_1.05/issues/1),
[PTU 02 brief/handoff](../workstreams/02-content-foundry.md),
[recovery provenance](../data/recovery.json), [structural inventory](../data/content-audit.json),
`system.json` and `packs/*/_source/` at the tested commit.
The diagnostic APIs were checked against the locally installed v13.351
`client/documents/collections/compendium-collection.mjs` (`getIndex`, `getDocuments`,
`folders`, `invalidDocumentIds`) and confirmed through the live GM run.
No rule-source decision or gameplay fix was made in this batch.
