# Compendium reference classification — 2026-10-25

All **682 targets are classified and have explicit dispositions**. The total remains
682: **658 historical provenance targets** and **24 active rule/species targets**.
The active targets are confirmed missing in Foundry v13.351; they were not repaired.

Runtime/content baseline: `5e4946a7a09a0ab3605b3b33b27f4f1624617e0d`, branch
`codex/ptu-foundation`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4).
No runtime code, source pack record, UUID, rule choice or campaign selection changed.

## Changes

The audit now walks individual JSON string fields and records each missing UUID's
source, JSON pointer, character offset and consumer profile. It preserves the original
structural target/source inventory. Unknown fields require review. Runtime investigation
dispositions are reused only while their occurrence fingerprints still match.

- [Every target and occurrence](../data/compendium-reference-audit.json), including
  field profiles, code references, fingerprints and dispositions.
- [All 24 active target investigations](../data/reference-investigations.json), including
  bounded history checks and candidates that do not establish identity.
- [Live reproduction evidence](2026-10-25-compendium-references.json), including exact
  resolution results, provenance/import counts, dry-run outcomes and limitations.

`tools/compendium-references.mjs` implements classification;
`tools/audit-content.mjs` regenerates the reports. Five focused tests cover typed and
legacy UUIDs, repeated occurrences, source deduplication, token boundaries, unknown
fields, mixed runtime/metadata targets and complete current-source coverage.
`tools/prepare-foundry-reference-check.mjs` and `tools/foundry-reference-check.macro.js`
provide a repeatable disposable-world reproduction; see [TESTING.md](../TESTING.md).

## Classification and source decisions

| Field | Occurrences | Unique targets | Disposition |
| --- | ---: | ---: | --- |
| `flags.core.sourceId` | 667 | 658 | Preserve legacy import provenance; record runtime caveat |
| `_stats.compendiumSource` | 667 | Same 658 | Preserve import provenance |
| `system.abilities.basic[].uuid` | 2 | 1 | Investigated; unresolved identity |
| `system.capabilities.other[].uuid` | 2 | 1 | Investigated; unresolved identity |
| `system.moves.level[].uuid` | 3 | 3 | Investigated; unresolved identity |
| `system.moves.machine[].uuid` | 28 | 13 | Investigated; unresolved identity |
| `system.moves.tutor[].uuid` | 10 | 5 | Investigated; unresolved identity |
| `system.rules[2].uuid` (TemporarySpecies) | 1 | 1 | Investigated; unresolved identity |

There are 1,380 occurrences. The provenance targets occur in 667 feats; the 46 active
occurrences are confined to Dipplin (`species.dkQPNz0RLbgzWMLq`), Hydrapple
(`species.jAIJeRtRc1sUekjO`) and Terapagos: Normal Forme (`effects.3w7uQfBvzzxATXis`).
No targets span both categories in this baseline; mixed targets are classified as runtime
by the tool rather than being hidden as metadata.

The metadata group is **not an assertion that legacy fields are inert**.
[PTUItem.sourceId and refreshFromCompendium](../../src/module/item/base.js#L362) read
the old flag directly, and [migration 111](../../src/module/migration/migrations/111-prereq-items.js#L32)
has a sourceId fallback. Those paths need separate compatibility review.
In the tested v13.351 installation, all 667 affected feats retained their historical
`_stats.compendiumSource`, had no legacy sourceId flag and returned no value from the
PTU sourceId getter. Core import preparation stamped all 667 with the current UUID and
retained no legacy flags. This agrees with local core `DocumentStatsField._migrateData`
(`common/data/fields.mjs:3203`) and `WorldCollection.fromCompendium`
(`client/documents/abstract/world-collection.mjs:118`). Deleting or rewriting provenance
would not establish correct refresh behavior. Owned-item refresh/campaign upgrades were not tested.

## Actionable failures investigated

All 24 active target UUIDs returned `null` from `fromUuid` in the live GM session.
The per-target ledger records every exact UUID, its stored slug when available,
affected source fields and the explicit `unresolved-no-identity-evidence` disposition.

- Missing Gluttony (`abilities.DUw3xozURebyikaS`) and Stealth
  (`capabilities.v1ksvxUrvIhkV7aD`) affect both species. Four deterministic generator
  dry runs selected those missing entries and returned zero corresponding content
  items. The [generator's resolution loops](../../src/module/actor/pokemon/generator.js#L157)
  explicitly skip a missing result.
- Hydrapple's missing level entries are Withdraw (`moves.ARPgyJJ3JseliM1K`), Astonish
  (`moves.Zp2xGTRJ3Enoj6Ip`) and Syrupy Bomb (`moves.oXkwKDV9PDa2HBR6`). A fifth dry
  run selected all three and omitted all three. The other 18 move targets are in
  machine/tutor fields: live resolution failed, and the
  [species-sheet link handler](../../src/module/item/species/sheet.js#L72) cannot open
  a missing result. Machine/tutor UI clicks and full level-up interactions were not exercised.
- The Terapagos effect points TemporarySpecies at `species.uTLNgrPjP79HCmkW`.
  Constructing that rule with an ephemeral owned item produced
  `Cannot read properties of null (reading 'system')` at
  [temp-species.js:16](../../src/module/rules/rule-element/temp-species.js#L16).
  The [rule factory](../../src/module/rules/index.js#L52) catches constructor exceptions
  and drops a failed rule. Persistent actor effect application was not tested.

Generator probes set `prepared:true` and selected references directly, then called
`create({folder:null, generate:false})`. They isolate the real resolution loop without
random preparation, actor creation or numerical rules certification. The temporary
effect was constructed with an explicit parent: v13 `Document.clone` preserves the
original parent and cannot supply that test context. The saved macro includes this check.

## Historical evidence and recovery limits

The current sources for the four relevant packs come from
`b36aca6a08139594ade65908f4e22ed6227ac85e`. Their pack trees are also identical at
`9e6fccd535fbdbe4b410cfbfdb0425b03ebd2d07`.
The complete snapshot immediately before the February 2024 compendium edits/imports,
`ba75061ae39ca3976ddfb67d8511512e720dfe2b` (parent of `61662a66`), was archived into a
disposable cache and extracted with Foundry CLI 3.0.5. It contained 630 ability,
147 capability, 1,295 move and 1,811 species source records, including folders.
None of the 24 exact missing IDs was present in either inspected snapshot.

Ten move targets have current records with the same explicitly stored slug. That is
a discovery hint, not evidence of the old UUID's identity or content version. Other
similarly named records can have null slugs, and the Terapagos records contain conflicting
labels/slugs/numbers. Display names were not used to select replacement identifiers.
No exhaustive Git-history search or private-world export review was performed; absence
in two snapshots does not establish that a record can never be recovered.

The safe disposition for all 24 is to retain the references and obtain an authoritative
export or ID history before recovery/retargeting. No aliases, duplicate records,
speculative rule content or source-ID rewrites were introduced. All 658 provenance
targets remain in the inventory with preservation dispositions and consumer caveats.

## Validation and compatibility

- `node tools/audit-content.mjs` preserves all 682 original target/source entries and
  the 1,184-move ledger (zero moves certified); all occurrences have reviewed profiles.
- `node --test --test-isolation=none tests/compendium-references.test.mjs`: five pass.
  Process isolation remains a local sandbox limitation from the prior batch.
- Both new diagnostic scripts pass Node syntax checks, fixture preparation completes,
  and the corrected macro was saved and executed in the isolated v13.351 world.
- Source packs and runtime/build inputs are unchanged, so the earlier semantic round-trip,
  build, clean-install and all-pack loading baseline is reused. CI results are attached to PR #4.
- Gameplay, full generation, level-up UI, player permissions and campaign preservation
  are unverified. Known viewport/V1 warnings remain; no layout claim is made.

## Handoff

The world returned to Setup; the setup server was then stopped. Its managed handle is
terminal and port 30001 refused connections. No actor or compendium writes were made
by the probes. The saved diagnostic macro is disposable test-world content; raw logs,
historical database copies, fixtures and screenshots remain ignored local files.
No other section was started or messaged.

Next bounded work: obtain authoritative identities for the 24 active targets, make
evidence-backed repairs, then verify only affected runtime scenarios. Review the
legacy sourceId compatibility path separately while preserving provenance and campaigns.

References: [issue #1](https://github.com/MrMints/ptu_1.05/issues/1),
[PTU 02 handoff](../workstreams/02-content-foundry.md),
[recovery provenance](../data/recovery.json), [pack baseline](2026-10-24-foundry-packs.md).
No gameplay rule-source decision or gameplay fix was made in this batch.
