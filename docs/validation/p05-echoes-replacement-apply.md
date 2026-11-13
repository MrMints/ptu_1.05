# Echoes replacement executor validation

## Status

The isolated Echoes replacement executor is implemented and locally accepted for the modeled host. The existing planner remains inspection-only. A live Foundry adapter and consumer registration remain unimplemented. Real authority, installed-pack access, persistence, effect execution and cross-client atomicity remain unverified.

Local validation used project base `8ab6ce20c1ead7dd4c5be0dee915a6a8052eb69e`. Published CI at that base does not cover the local executor, test and report. Full P05 completion and release readiness remain unverified.

| Local artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/util/echoes-replacement-apply.js` | 11,851 | `182c47335ae598e1bcc230776758eae80d49c2f81fa31f7752379224878a9f99` |
| `tests/echoes-replacement-apply.test.mjs` | 42,873 | `caa3bc00919a5049a5d9f9607ab458691c46c1531e71ef9b27df824dd0de544f` |

## Executor contract

`applyEchoesReplacement(inputJson, applicationPort)` passes the existing JSON request to `planEchoesReplacement`. The caller supplies a stable, trusted host port. The host independently verifies the current user and parent/Item authority, target access, membership, context, operation state and explicit confirmation of the exact proposed replacement. The planner's result does not confer authority.

| Port method | Required success evidence | Other outcomes |
| --- | --- | --- |
| `capture({selection})` | `ready` with a host-issued `operationId`, `revisionToken`, `operationState: 'clear'` and `snapshotJson` containing exactly `before`, `context` and `history`. | `unavailable` or `reconciliation-required`. |
| `authorize({selection, operationId, revisionToken, reviewedRequestJson, nextSourceJson, target})` | `admitted` with an `admissionToken`, affirmative `exclusions` and a boolean `selectionCreationConfirmed`. `target` carries the role, approved definition and mapping, and whether selection creation is proposed. | `cancelled`, `denied` or `review-required`. |
| `conditionalSave({selection, operationId, revisionToken, admissionToken, nextSourceJson})` | `committed` with `writes: 1` and a `receiptToken`. | `stale` or `refused` with a guaranteed `writes: 0`. An exception or ambiguous response leaves the write count unknown. |
| `readBack({selection, receiptToken})` | `ready` with `snapshotJson` containing exactly fresh `actor`, `membership`, `items` and `history`. | Unavailability, exceptions and mismatches require reconciliation after a confirmed write. |

The operation ID and tokens are opaque, nonempty strings of at most 256 UTF-16 code units. The host serializes snapshot JSON with `JSON.stringify` so the executor can validate and compare complete values. The executor requires a fresh capture matching the reviewed request before building a detached replacement. A fresh `no-change` result makes no save.

The host must affirm `callbacksExcluded`, `combatExcluded`, `recalculationExcluded`, `retargetingUnnecessary` and `selectedItemOnly`. It must check revision and admission tokens, the exact admitted payload, membership, captured sources, target, authority, confirmation, context and operation state in the same critical section as the selected Item write. The synthetic host performs that check and replacement synchronously. A process-local lock prevents overlap on a stable port and Actor. The conditional write also protects against competing callers through other port handles when the host enforces the contract.

### Replacement and preservation

| Owned path | Replacement rule |
| --- | --- |
| `system.effect`, `system.prerequisites`, `system.frequency` | Copy the target fields' complete values and presence. Prerequisite diagnostics remain advisory. |
| `system.source.value` | Copy target value and presence. Preserve the remaining `system.source` fields. |
| `_stats.compendiumSource` | On a version change, set the exact target mapping UUID. |
| `flags.ptu.selectedVersion` | Set the target `id` and `label` on an object, preserving its other properties. Keep a supported string representation as a version ID. For null or missing selection, create `{id, label}` only with the `selection-created` acknowledgment and independent host confirmation. |

The executor preserves all other owned fields, including the raw `flags.core.sourceId`, intent history, Item identity, presentation, effects, grants, actions, usage, subchoices, custom fields and other `_stats` members. Readback compares the complete expected selected source, other captured sources, Actor identity, membership and history. The prerequisite Actor projection may reflect the replacement. The May mapping remains **May 2015 playtest (optional)**.

### Save accounting

| Outcome | Write attempts | Confirmed writes | Verified applications |
| --- | ---: | ---: | ---: |
| Pre-save refusal, cancellation or no change | 0 | 0 | 0 |
| Conditional stale or refused | 1 | 0 | 0 |
| Committed and verified by readback | 1 | 1 | 1 |
| Save exception or ambiguous response | 1 | unknown | 0 |
| Committed with unavailable or mismatched readback | 1 | 1 | 0 |
| Duplicate or later request blocked by prior uncertainty | 0 | 0 | 0 |

The private ledger binds each host operation ID to the Actor, Item and exact reviewed request for that port. An identical duplicate returns its sanitized historical disposition with zero new attempts. Reusing an ID for different input is refused. A fresh ID permits a new operation after a known zero-write result. Uncertainty stays latched for the lifetime of the port/Actor pair, regardless of later IDs, seals or cancellation. A host must retain unresolved operation state across its own lifetime boundaries. The executor exposes closed reason codes and accounting and provides no automatic retry, rollback, latch clearing or intent-history write.

## Local validation

Run from the repository root with Node.js 24.22.1.

```sh
node --test tests/echoes-replacement-apply.test.mjs
node --test --test-name-pattern '^uncertainty: ' tests/echoes-replacement-apply.test.mjs
```

| Invocation | Result |
| --- | --- |
| Initial full invocation | Exit 1. The shared setup hook failed on the tracked manifest digest. Node reported 0 passed and 46 hook failures. Zero case bodies ran, both fixture-body passes read zero bytes, and the compiler and executor were never loaded. Repeated diagnostics were truncated. |
| Full invocation after the manifest pin correction | Exit 1. All 46 case bodies ran, with 45 passes and one failed test assertion. The integrity pass read 161,964,294 bytes and fixture assembly read 161,827,298 bytes. The compiler returned `prepared-not-installed`, and both complete Item pins and every mapping field passed. The displayed failure output was truncated and Node abbreviated the long request value. |
| Filtered uncertainty invocation after the assertion correction | Exit 0. All 11 selected cases passed with no failures or output truncation. Both fixture passes completed under their enforced limits. The compiler returned `prepared-not-installed`, and both Item pins and every mapping field passed. This invocation emitted no numerical acquisition totals. |

In the full invocation, the pre-mutation save-exception case failed because the test expected a different request after rebuilding it from unchanged state. It had already checked the initial uncertainty outcome and zero actual writes. Its later latch assertions were not reached.

The filtered invocation verified those assertions. The rebuilt May request matched the original, and a distinct current-target request received `no-change` from the planner. Even after the simulated host cleared its unresolved flag, the stable port refused the current-target, cancellation, rebuilt and original requests with `prior-uncertainty` and zero new write attempts or writes. The cross-port reconciliation, protected-state and final capture/save counter assertions passed.

The other 35 case bodies were outside the filtered invocation. They are unchanged and retain their passing evidence from the full invocation. The results provide combined local evidence. No single full-suite pass on the final test revision was recorded.

| Cases | Coverage |
| --- | --- |
| 6 replacements and representations | Core to May and May to core through the same stable port, supported selection representations, legacy-only active provenance, advisory prerequisites, protected fields, other Items and history. |
| 13 capture and admission cases | Authority denial, declined confirmation, missing or changed targets, missing or false context exclusions, fresh cancellation and no-change, stale capture, planner refusal, and pre-save exceptions. |
| 12 conditional boundary cases | Changes to selected or other sources, membership, target, authority, confirmation, context, choices and operation state, plus a substituted payload. |
| 4 lock and ledger cases | Fresh operations after zero-write outcomes, duplicates and conflicting ID reuse, same-port overlap and competing handles. |
| 11 uncertainty cases | Save exceptions before or after mutation, invalid save responses, and unavailable, exceptional or mismatched readback. |

## Source and fixture bindings

The planner and reference test matched their committed bytes at the validation base. The reference test supplies the fixture recipe. The focused suite imports the planner and compiler directly.

| Path | Bytes | Git blob | Working SHA-256 |
| --- | ---: | --- | --- |
| `tests/echoes-replacement-plan.test.mjs` | 39336 | `bc417a62ebffe1ed0b3dbb700fefce31870509dc` | `31d9b51ffb70f31ed1051a747722f9eafa03ac0c9202afe28bf9b85931ede214` |
| `src/util/echoes-replacement-plan.js` | 43779 | `33d583b0446f457da7f69a3fa75078f4a5a96cd2` | `07db2bd6f81335d8fd1d24b479878237755376dc4519e9b039f6f9108a027840` |
| `src/util/rule-version-registry.js` | 6196 | `d5753450386cc200d01d1cd161a0122d07d6ea5b` | `93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5` |
| `src/util/rule-version-preview.js` | 13099 | `9118635571b4836f7ce8ee4a775b759a92f9b679` | `12ffc1c984f78034bb15d2af7d466f4cd583e70e54520cda97315a944735664f` |
| `tools/rule-version-echoes-admission.mjs` | 17440 | `9f3f301993827c75c6162bd9067a1cd557dac30d` | `7ebd23f4aa886af5ba044c394caf1eacb94f825129282acda4eb1d07ebea1a18` |
| `src/util/rule-versions.js` | 11058 | `700a37b025c670ab602e4fc1ff0fdaf0bdd02f03` | `ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9` |
| `src/util/prerequisites.js` | 10611 | `032297697ea56d82061ef036ede812df497fa7b9` | `d3a6626420c26f52e31b07fd428cf63a455a6bcfc36b7a979a62bf34400d3649` |
| `tools/rule-version-echoes-draft.mjs` | 13340 | `02d2633953d4ecbd04b6da67bf36a314329afa70` | `05c8c99805a65afbea85ddc75bd44d8f8fb11a13b9a1625ef94cdbf7bb0e6a97` |
| `src/util/document-source.js` | 1386 | `ebb47fa13c5c1d9c03084136cf3fee053ae3ec21` | `86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0` |
| `src/util/skills.js` | 2693 | `7319614d73e6615fba673b147bdddc344743703a` | `5bb8390d3bf44e4dddfeca8534a7c0a35e74b380e39f203e8e671d41ad4aea76` |
| `tools/rule-version-pilot.mjs` | 16805 | `4d4482d66d19a207b675460deed456b36ed4694d` | `1782930976b4e5b9922acd3d8f13dcd9d0356528b232bf551f7e313efd32d172` |
| `package.json` | 589 | `df135a39f198db5bf1bc9136b608c0cc2c592241` | `7309abf857ada93d3bc4ce8fc60ab9bb867fe5e075ddbf4153e3dded07336b3c` |

The compiler uses the following pinned fixture inputs. The icon is used for its hash and the readiness document supplies only the Researcher context note. The five listed pack records are the only complete pack inputs. Source PDF citations are metadata strings.

| Fixture input | Committed bytes | Git blob |
| --- | ---: | --- |
| `css/images/icons/feat_icon.png` | 8735 | `af9fadae4567487008c9868e6237d7f669318012` |
| `docs/data/ability-source-evidence.json` | 2228887 | `04f5636f0eb444e2b5a9da0f73b0cdc6af058800` |
| `docs/data/feature-source-evidence.json` | 9481207 | `5d29ce7d8d9af3955d92b2beb6749022b447bfd9` |
| `docs/data/move-source-evidence.json` | 5481968 | `aabee9a4e15432475d5f035439d5d76605ea7be3` |
| `docs/data/record-source-review/abilities-core.json` | 10506397 | `f6d7459fe86db6eafce277fd761cdc621b4509bc` |
| `docs/data/record-source-review/features-core.json` | 45124665 | `ca14fa64d30eff6f0e50e64e595353f49f0414c1` |
| `docs/data/record-source-review/moves-anchored.json` | 46820679 | `1950046178a02bbed1afb763a18cde9c70c7f662` |
| `docs/data/record-source-review/pokemon-edges.json` | 1825614 | `2d89078aad2e6670920d7179880f73b05fc8610d` |
| `docs/data/rule-version-echoes-admission.json` | 43979 | `b64493d20566cb05f3d50379f16f978d5ef193da` |
| `docs/data/rule-version-echoes-draft.json` | 28694 | `27fc9d6d5d0eb656822d46232aab0a7288b1cc54` |
| `docs/data/rule-version-pilot.json` | 70517 | `ee30dedc56191e17b4b7bdff5250aedfeaf690c3` |
| `docs/data/rules-revisions.json` | 886057 | `6ef31f696a4d23e39bf2b564bdc0ea776101cba0` |
| `docs/data/source-authority.json` | 22614 | `51f8310d375c5bf2e2609d379eb7c7a975c179fd` |
| `docs/validation/p05-echoes-readiness.md` | 30460 | `2697f322620ba701ecab6d53dd160834fed42413` |
| `packs/abilities/_source/nuGa21WQ0QD07kQj.json` | 1416 | `d0aab58e973c0ffa528fd6b84509486c1b881180` |
| `packs/abilities/_source/oNB76oqVYrjhYd7W.json` | 1416 | `5b7ef64826cc37eb9ec3e92451cf78d70a5ff55c` |
| `packs/feats/_source/aJ47Z5z6Az9c8Dy8.json` | 1556 | `29eae2305f7a38307d547d4f6788312f882e3a2f` |
| `packs/moves/_source/Y5R5mbVcGq6fwoFj.json` | 2062 | `8b93264580b2b23070fa8e9c7af06985569c8297` |
| `packs/poke-edges/_source/WkzCUjTOCTI60Uwg.json` | 3200 | `3cfa877f92f1b008453ba445fc70f481d8c194d8` |
| `system.json` | 4746 | `ce24de1cadba076fbfcff130f961c93d191826df` |
| `template.json` | 18633 | `f753ba3d552b3043d9fc43d073cb58440bbaad87` |

### Canonical tracked inventory

The suite reads the execution checkout's `HEAD` tree with `git ls-tree -r -l -z HEAD -- packs`. It selects tracked `packs/*/_source/*.json` blobs and checks their modes, paths, sizes and identities. The inventory has 7,395 unique records and 36,553,797 committed bytes. These figures describe the collision inventory.

Sort by ordinal path order. Encode each row as UTF-8 without a BOM, with the blob ID, one space, decimal byte size, one space, the repository-relative path and a final LF. Independent reproduction at the validation base produced 663,335 serialized bytes with SHA-256 `d607bbf143f3a83e83abaf8040d2b9c7e6d65b38805b785d1f606dc928270baf`. The generation recipe for the original manifest pin is unknown.

The fixture reader checks ancestor links, canonical workspace containment and opened-file identity before reading. Adversarial symlink, junction and concurrent filesystem replacement scenarios were not tested. It binds working files to the committed identities and checks applicable Git attributes. It permits exact CRLF-to-LF equivalence for eligible text fixtures and requires raw equality for runtime modules and the icon. It executes no Git filters. One integrity pass and one cached assembly pass each enforce a 200 MiB actual-read limit. The compiler runs once per invocation and checks complete Item pins and every mapping field before constructing detached synthetic fixtures.
