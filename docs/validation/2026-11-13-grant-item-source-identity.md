# GrantItem source-identity conformance

## Scope

The focused test passed on Node v24.22.1. It covers the existing GrantItem duplicate comparison using the complete rule element and its real source-identity helpers. The acquisition-preservation reference substitutes a helper that returns null, and the helper tests exercise their functions separately. Production code is unchanged.

The contract is source identity for an already-owned Feature. It does not establish canonical benefit equivalence, rank or repetition policy, or whether benefits stack in play. The observations are limited to the synthetic owned collection and the sources pending creation.

## Source bindings

Authoring used the committed bytes at `9488fff627ecdbaeaccb5fac33a1f747dac282e2`. The six inputs total 47,515 bytes. The three existing tests served as static references.

| Path | Committed bytes | Git blob |
| --- | ---: | --- |
| `src/util/document-source.js` | 1,386 | `ebb47fa13c5c1d9c03084136cf3fee053ae3ec21` |
| `src/util/preservation.js` | 2,126 | `2b278ef0b18e5757158e7cd4fd34878410aba318` |
| `src/module/rules/rule-element/grant-item/rule-element.js` | 10,697 | `a649b6ab205f5f67b9b0b0884fb1e6bf16c7b875` |
| `tests/acquisition-preservation.test.mjs` | 15,083 | `33ad741557347ec2f109b86d460be996b7291c3b` |
| `tests/document-source.test.mjs` | 2,750 | `0b459dda26412f929a48af699929618d63ae89d8` |
| `tests/preservation.test.mjs` | 15,473 | `f67591aa6d9934c6613ef68b98277c1d90b28e4b` |

The runtime loader is confined to the first three files. It verifies the UTF-8 source against the committed lengths and SHA-256 pins after permitting only CRLF-to-LF normalization for the comparison. The original line endings remain in the loaded text. Exact import-declaration lists and reversal of the specifier edits are asserted before evaluation.

| Runtime input | SHA-256 of committed bytes | ESM import binding |
| --- | --- | --- |
| Document-source helper | `86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0` | Zero imports. Loaded unchanged. |
| Preservation helper | `d22ccb1dd5d96cf81e35a8cf7e6af6b7edb096cad3698d2c4c912937d70aecbb` | Two imports. Real document-source helper and synthetic scope check. |
| GrantItem rule element | `72355e29be5221c4a159cd20d7ef6d22e9e6d9cfebd4d14fd38b6a61acd2b172` | Seven imports. Real preservation helper plus synthetic Item, migration list, migration runner, rule base, starter training and scope modules. |

The data-URL modules preserve all production bodies and exports. The synthetic Item's `sourceId` getter calls the real `getDocumentSourceId`. Each case calls the actual `GrantItemRuleElement` constructor and `preCreate`. The Item, rule base, predicate, notifications and Foundry utilities are doubles. The literal UUID, fixed flag, `allowduplicate`, `reevaluateOnUpdate: false`, `replaceSelf: false` and `ignored: false` are supplied explicitly. Each case uses a non-Condition Feature with no migrations or nested rules. Globals and the console error descriptor are restored and checked in a `finally` block.

## Expected cases

- `A` is `Compendium.p05identity.sources.Item.AAAAAAAAAAAAAAAA`.
- `legacyA` is `Compendium.p05identity.sources.AAAAAAAAAAAAAAAA`.
- `B` is `Compendium.p05identity.sources.Item.BBBBBBBBBBBBBBBB`.
- `otherPackA` is `Compendium.p05identity.other.Item.AAAAAAAAAAAAAAAA`.

| Existing Item provenance | Requested UUID | `allowduplicate` | Expected |
| --- | --- | --- | --- |
| Modern `A`, conflicting legacy `B` | `legacyA` | false | Suppress |
| Modern absent, legacy `legacyA` | `A` | false | Suppress |
| Modern null, legacy `legacyA` | `A` | false | Suppress |
| Modern false, legacy `legacyA` | `A` | false | Suppress |
| Modern `A`, conflicting legacy `B` | `legacyA` | true | Append |
| Modern `B`, legacy `A` | `A` | false | Append |
| Modern `otherPackA`, legacy `A` | `A` | false | Append |
| Modern nonempty invalid string, legacy `A` | `A` | false | Append |
| Modern and legacy absent, matching name/slug and duplicate/export provenance | `A` | false | Append |

Each case starts with a fresh pending granter and one already-owned Item. The resolver serves the same synthetic Feature for both spellings of `A`. The owned and resolved Features share a name and slug in every case. The test checks the exact lookup, a successful detached clone, and absence of unexpected notification or console errors.

Suppression must emit one duplicate-policy warning, generate no ID, and leave the context and sole pending granter unchanged, with no new links. An append must add exactly one detached source with a fresh `_id`, normalized `_stats.compendiumSource` set to `A` and `flags.core.sourceId` set to the exact request. The granter's `itemGrants` link uses `detach` and the grantee's reciprocal `grantedBy` link uses `cascade`. The granted Feature gains `system.free: true` and the context gains `keepId: true`. The granter and existing owned Item retain their IDs.

Complete snapshots check preservation of the selected-version flags, rule selections, prerequisites, disabled state, and opaque nested values including false, zero, null and empty arrays. Original fixtures and owned collection membership must remain unchanged. Persistence tripwires must record zero calls.

## Validation limits

The fixtures model an already-owned context. Ownership enforcement happens upstream. The test does not exercise Foundry schema defaults, pack access, a persisted Item write, migrations, nested rules, Conditions or starter-training grants.

Focused command for a later execution:

```text
node --test tests/grant-item-source-identity.test.mjs
```

## Focused result

The command above ran once on Node v24.22.1 and exited 0. All nine case bodies passed. Node reported 10 tests and 10 passes, counting the parent, with zero failures, cancellations, skips and todos. The retained runner output contains all nine case names and the full summary without truncation.

Four cases suppressed the grant with exactly one warning and no generated ID or new grant links. Five cases appended a single detached pending source with the expected source identities, reciprocal links, Feature free flag and context change. All nine passed the complete snapshot, exact resolver call, clone, zero persistence calls, unchanged owned membership and original property descriptor restoration assertions.

The loader completed one read of each of its three production inputs, totaling 14,458 working-tree bytes. The GrantItem source's 10,946-byte CRLF working representation matched its working SHA-256 pin and normalized exactly to the 10,697-byte committed representation. The document-source and preservation helpers matched their committed bytes directly.
