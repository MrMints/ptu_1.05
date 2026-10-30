# Source/version lookup contract

The first bounded PTU 05 batch adds an isolated, synchronous API in [rule-versions.js](../src/util/rule-versions.js). No live workflow imports it yet. It does not create variant documents, register settings, change existing world defaults, acquire content, replace Items, run migrations or execute rules. Standard PTU 1.05 is the default for an absent **mechanic choice in this API**; existing settings and saved worlds are untouched. See the [validation and deferred interfaces](validation/2026-10-29-p05-foundation.md).

## Metadata v1

Callers supply a bounded array of explicit mappings. There is no production registry in this batch. `ruleVersionMetadataErrors(record)` checks shape and known status values, not the truth of a source claim, approval of inherited content or behavioral correctness. A record has these separate fields:

| Field | Contract |
| --- | --- |
| `schemaVersion` | `1`; unknown schema versions are unresolved. |
| `documentUuid` | Exact typed or legacy compendium Item UUID, world Item UUID or owned Actor Item UUID. Never a display name, slug or catalog coordinate. UUID spellings are not normalized or guessed. |
| `type` | `move`, `ability`, `feat`, `edge` or `pokeedge`; must match the selected record. |
| `version` | `{id, label, kind}` with explicit nonempty ID/label and `original`, `revised` or `addition` kind. A revision-only addition has no invented original. Version tokens may be shared by distinct canonical benefits; competing mappings of one canonical/version pair remain unresolved. |
| `canonical` | `null` for an unestablished relationship, or `{id, evidence}` for an explicitly evidenced runtime relationship. `r04-*` catalog coordinates remain citations, not canonical runtime IDs. A shared name never establishes this relationship. |
| `source` | `{id, edition, status, publicationDate, citation}`. Status is explicitly `core`, `official-errata`, `optional-playtest`, `supplement`, `custom` or `synthetic`. A path containing “Errata” never supplies status. Dates retain known precision (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`); unknown is explicitly `null`. |
| `generationEligibility` | Explicit `eligible`, `excluded` or `unclassified` declaration. Only `eligible` can resolve attribution. This is not rule-version/content approval, an acquisition permission or a new scope filter. Future production mappings need actual accepted Generations 1–8 evidence under [SCOPE.md](SCOPE.md). |

Full rules and prerequisites live in the selected/owned Item, not the metadata. Citations and optional-source chronology do not merge, supersede or supply missing fields to that Item. The accepted [full04 handoff](validation/2026-10-30-full04-acceptance.md) supplies source evidence and specific unresolved obligations; it does not provide automatically approved runtime mappings.

## Read interfaces

- `lookupSelectedRuleVersion(item, {versions})` returns attribution status/issues, exact document/owned/source identities, a detached copy of the stored selection, mapped version/source/canonical metadata when resolved, and the owned raw prerequisites. Missing/ambiguous mappings, conflicting types/selection IDs, malformed metadata and noneligible scope declarations return `unresolved` with no selected-version fallback. `canonical: null` can coexist with known source/version attribution; it cannot support a guessed nonstacking group.
- `lookupEffectiveRule(item, {versions, mechanicChoices})` adds a detached snapshot of the **complete owned `system`**, without overlaying source or other-version data. This preserves custom descriptions, prerequisite text, rule elements, uses, costs and conditions. Attribution resolution does not certify that custom/owned fields equal a printed source, approve them or authorize automation. Unknown mappings still return the exact saved snapshot for preservation/manual inspection.
- `lookupMechanicChoice(id, choices)` returns an explicit string choice for that independent mechanic ID, or `standard` when no own property exists. Empty/invalid explicit values return `unresolved`; they are not silently reset. Choice values are preferences, not verified mechanics. This batch defines no supported-mechanic catalog, presets or adapters for existing Boolean/enum settings.

Identity uses the accepted modern-first `_stats.compendiumSource`/legacy `flags.core.sourceId` accessor. An actual compendium Document uses its own UUID rather than historical export provenance. A plain owned snapshot with source provenance uses that source without falling back to a convenient old stamp or another same-name record. A vanished transient provenance stamp remains an unknown mapping; no identity is reconstructed from text.

An existing `flags.ptu.selectedVersion` string or object is never rewritten. If present, its explicit ID must agree with the exact supplied mapping. A label-only flag cannot establish version identity. Renaming a display label does not change an established ID. With no stored flag, an exact supplied document mapping can establish attribution without writing a flag. No arbitrary raw `_id` is converted into a pack UUID.

The returned `selectedVersion` object is compatible with the accepted `diagnosePrerequisites({actor, item, selectedVersion, references})` interface. Pass the selected Item and its exact raw prerequisites. The focused test exercises this composition; production actor/item views and NPC selectors remain on their accepted interfaces. Do not bypass current ownership/security, acquisition/scope checks, genuine choices or effect-use predicates using a read result.

## Deferred integration

Later assigned batches must establish/promote exact source-backed production variant mappings and their approval/verification evidence, persist explicit variant choices safely, and integrate browser/selector labels and filters. Replacement transactions, repeat-aware duplicate-benefit checks, setting/preset registration, safe versioned migrations, calculation/automation consumers and package/release exclusion are not implemented here. A repeatable Poké Edge can have multiple owned instances with distinct capability choices; this lookup never deduplicates them by source, canonical identity or label.

Any demonstrated earlier acquisition/diagnostic/preservation contradiction reopens its affected prior gate before dependent work. This batch demonstrated none in the focused Node regressions; no new live Foundry or campaign observation is claimed.
