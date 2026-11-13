# Trainer Feature-drop receiver conformance

## Scope

The focused receiver test passed on Node v24.22.1. It directly calls the actual trainer sheet's `_onDropItem` with simulated dependencies. It checks owner refusal, ordinary creation and same-Actor sort delegation, and linked-copy delivery through the actual saved-item graph helper. The existing acquisition tests cover embedded creation or the base sheet's folder route. Production code is unchanged.

## Source and loader bindings

The authoring baseline is `72564657aa20bfe256cc552d326f7abca4ee8f1d`. The character receiver is at lines 398–459 of its module, and its graph helper import is present at line 632.

| Committed input | Bytes | Git blob |
| --- | ---: | --- |
| `src/module/actor/character/sheet.js` | 19,593 | `9b9f366716830da7f8a3e32495c7ef7f9f335bb9` |
| `src/module/actor/sheet.js` | 11,169 | `b335e41f91e551bf01c5d3ff099c0f27d29a0490` |
| `src/util/saved-item-graph.js` | 7,380 | `5e452de4fdd14538226a5aa77288b0fd226cf6cf` |
| `tests/acquisition.test.mjs` | 16,911 | `2023f0b8193a689aae769cd234b848e5d3b8b38c` |
| `tests/acquisition-preservation.test.mjs` | 15,083 | `33ad741557347ec2f109b86d460be996b7291c3b` |

The two tests are static references. The focused loader is written to read each of the three production files once. It checks each committed byte length and SHA-256 after allowing only CRLF-to-LF normalization for comparison. It keeps the original decoded working text for module loading and reports the actual working-byte counts separately during execution. No working-copy source measurements were taken during authoring.

| Runtime module | SHA-256 of committed bytes | Import binding |
| --- | --- | --- |
| Character sheet | `f57579b0720033cbb3aeccf2751d42a492aa8c72f1816a4cd49dad3aae23997f` | Nine imports, including the trailing graph import. Real base sheet and graph helper, synthetic acquisition and UI or presentation exports. |
| Base sheet | `1d9185fc2eee131488d81e054c3949cd4de419b14df0f0a93fbe47fcb4f44b42` | Four imports. Same real graph module, synthetic actor config, acquisition and scope. |
| Saved-item graph | `00a88150b7d599079632e014bbe64b568e2abaddd19d9fd703305d67b0040f38` | Two imports. Shared synthetic scope and a starter-training tripwire. |

The loader verifies the complete import lists and reversibility of specifier substitutions before evaluating the in-memory ESM modules. Production bodies and exports are preserved. UI, acquisition and starter-training exports fail visibly if invoked. The shared scope double accepts only the graph fixture documents.

The synthetic superclass is installed during module loading. Each case creates the receiver from the actual character sheet prototype and verifies the intended inheritance through the real base sheet to the synthetic superclass. Sheet construction and native dispatch have tripwires. Case globals and the loading-time superclass binding are restored and checked against their original property descriptors, including absence.

## Planned cases

| Case | Expected receiver behavior |
| --- | --- |
| Non-owner destination | Return `false` before resolution, conversion, DOM access, confirmation, creation or sorting. |
| Ordinary external Feature | Resolve exactly once and give inherited creation one complete detached Feature snapshot as its sole argument. Return its exact sentinel. The compendium identifier is fixture metadata. |
| Same-Actor Feature | Resolve exactly once and call inherited sorting with the original event and a complete detached snapshot with the existing Item ID. Return its exact sentinel. |
| Saved Feature and linked Edge, consent granted | Resolve the selected parent, expand through its source collection, check both synthetic documents, confirm before generating two fresh IDs, and call graph creation once. Return its exact sentinel. |
| Same saved graph, consent declined | Confirm once and return an empty array without generating IDs or calling creation or sorting. |

Both saved-graph cases require a confirmation with `defaultYes: false` that identifies the additional Edge by name and UUID. The source Actor contains the Feature and Edge with reciprocal saved links. The permitted changes in the captured copy are the two `_id` values and their internal link IDs. Exact snapshots preserve deletion actions, prerequisites, selected versions, rule selections, provenance, raw `system.enabled: false`, and nested custom values. The creation stub captures the payload and `{ parent: destinationActor, pack: null, keepId: true }`. It returns a sentinel without remapping or persisting anything.

The assertions compare the original fixtures, source documents, explicit Actor data, and collection membership and object identity independently. The controlled DOM provides no category or Item target. Document and Actor mutation APIs are tripwires.

## Validation limits

The harness simulates Item resolution, permissions, DOM traversal, confirmation, ID generation and persistence boundaries. Native Foundry dispatch, sheet registration, real `fromDropData` behavior, actual permissions, database persistence, Item-creation policy and installed-pack access are outside its scope. Grant and effect execution, effective automation behavior, cross-client atomicity, canonical benefits, rank, repetition and mechanical stacking remain unverified. The test does not presume a production defect.

Focused command:

```text
node --test tests/character-feature-drop-conformance.test.mjs
```

## Focused result

The command above ran once on Node v24.22.1 and exited 0. All five subcases passed, and Node reported six total passes including the parent test, with zero failures, cancellations, skips or todos. The complete runner output was retained without truncation.

The non-owner case stopped before resolution. Ordinary creation received one detached Feature snapshot. The same-Actor case delegated sorting with the original event and Item ID. The consent case delivered the remapped Feature and linked Edge with the expected reciprocal links and creation options. The decline case returned an empty array with no generated IDs or creation. The state-preservation and global descriptor restoration assertions passed.

The loader read the three pinned production modules once each, totaling 39,018 working bytes. It reported 20,225 bytes for the character sheet, 11,413 for the base sheet and 7,380 for the graph helper. The two sheet files matched their committed pins after CRLF-to-LF comparison, and the helper matched directly.
