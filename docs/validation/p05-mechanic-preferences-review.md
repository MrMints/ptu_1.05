# Mechanic Preferences Review

**Focused validation and bounded local review accepted.** One focused invocation on Node v24.22.1 reported all sixteen named subcases and the parent passing: 17 total passes, with zero failures, cancellations, skips or todos. The review window remains unregistered and operates only on supplied serialized evidence. The authoring checkpoint and subsequent execution evidence are distinguished below.

## Interface and boundaries

Construct the unregistered window explicitly with `new MechanicPreferencesReview(requestJson, mode).render(true)`. The default mode is `"current"`. The only other accepted mode is `"preset-preview"`. Each instance delegates the exact input once to the selected API and keeps that API's frozen report. Later views derive only from that report. The application reads supplied evidence and does not change settings or selected Items. Preset proposals confer no consent.

Current rows use report order and exact identifiers. Definition and observation evidence uses the report's indices. Ambiguous occurrences are all visible, and a selected choice is displayed only when its definition is unambiguous. Malformed records remain visible under supplied evidence. Stored, basic, and effective values use explicit JSON, preserving the distinction between an absent field and `null`, `false`, zero, empty strings, arrays, or custom objects. Observation availability, provenance, issue codes and paths, and unassessed source declarations are separate. The projection distinguishes unavailable `null` from an available empty object.

Preset proposals preserve report order and exact fields, including both difference flags and their `null` values. The template keeps current rows visible when preset validation fails and displays an empty current result when the API returns one. Expandable evidence includes full rows, declarations, observations, proposals, supplied presets, and the retained raw input and report. The template escapes supplied text using standard Handlebars double braces.

Close, Cancel, Escape, and simulated header close enter one dismissal path. That path marks the instance closed before invoking the base lifecycle and returns the same promise to every caller. A listener rebind removes the previous namespaced handlers, including when the view receives a different HTML root. Successful completion has no result value. Base errors are preserved, and further rendering and close retries are suppressed. This contract does not establish native Foundry dispatch or interrupt an in-progress native render.

## Frozen reference manifest

All references are pinned at `36d0a15b63d24ca2543cb1a70d8efa8611af1f63`. Existing tests are static references.

| Path | Bytes | Git blob |
| --- | ---: | --- |
| `src/util/mechanic-preferences.js` | 19,286 | `a93bd2cff90e1f34ad964d66384b2c84a57f5978` |
| `tests/mechanic-preferences.test.mjs` | 32,781 | `03795dc31d28d582cc4e6b7d474678a311b36c97` |
| `src/util/rule-versions.js` | 11,058 | `700a37b025c670ab602e4fc1ff0fdaf0bdd02f03` |
| `src/util/document-source.js` | 1,386 | `ebb47fa13c5c1d9c03084136cf3fee053ae3ec21` |
| `src/util/rule-version-registry.js` | 6,196 | `d5753450386cc200d01d1cd161a0122d07d6ea5b` |
| `docs/validation/p05-mechanic-preferences.md` | 14,629 | `2f1f6a6f42dcd486e1bd8416b5dfeabfca9cf97d` |
| `src/module/apps/feature-acquisition-review.js` | 7,152 | `1d9f37acdc0d06500216a3bb6e38d587ac6977bc` |
| `static/templates/apps/feature-acquisition-review.hbs` | 4,251 | `5f028b9068a977071155887cad59bcf5c763651f` |
| `package.json` | 589 | `df135a39f198db5bf1bc9136b608c0cc2c592241` |
| `pnpm-lock.yaml` | 30,326 | `bf21a76b748f44c0a4a8cb04de6f6b35401b90f0` |

## Working source and renderer bindings

An independent read verified the four working API modules below. Each was strict UTF-8, without a BOM, CRLF, or lone CR. All raw bytes matched the corresponding committed bytes. The planned loader reads only these four existing modules, once each, validates strict UTF-8 and the byte-order mark explicitly, checks for lone CR, and compares the committed pins with only CRLF-to-LF normalization in memory. It keeps the original decoded text for linking and reports actual working hashes and line-ending counts.

| Working API module | Bytes | LF | Raw and committed SHA-256 |
| --- | ---: | ---: | --- |
| `src/util/mechanic-preferences.js` | 19,286 | 317 | `de585d7b5ba9d0d0b75135fdefdad27ec9f3badd0ea0d1d6e0164c155ab6f8d1` |
| `src/util/rule-versions.js` | 11,058 | 160 | `ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9` |
| `src/util/document-source.js` | 1,386 | 24 | `86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0` |
| `src/util/rule-version-registry.js` | 6,196 | 91 | `93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5` |

| Installed renderer file | Bytes | SHA-256 |
| --- | ---: | --- |
| `node_modules/handlebars/package.json` | 3,622 | `cf06251288836dd2ba6d8d1a83dbe4c8c944556c34e17a3263c86325115d2a3c` |
| `node_modules/handlebars/dist/handlebars.js` | 215,867 | `5e25e8190da08af70e4ef544849e51c37a95125cacc86d4dbfca46cde9979af4` |

The test is written to register synchronous Node module hooks before private graph import. An allowlist binds the app's API import to a counting bridge that delegates to the real API. The API imports rule versions, which imports document-source and the registry. The registry imports rule versions. Native ESM linking handles that cycle. The original module bodies and exports remain intact. Private graph imports outside the allowlist fail, and unrelated Node imports delegate normally. Hooks are deregistered in cleanup. Deregistration does not clear the module cache.

The test will verify the Handlebars 4.7.10 standalone compiler bundle, evaluate it in a fresh VM context with CommonJS bindings, and compile the actual template. A counting external `require` throws if reached, and the context receives no host `process`. The VM context isolates renderer state for testing. It is not a security sandbox. Host tripwires cover live settings, documents, UUID resolution, hooks, dialogs, chat, enrichment, registration and network access. Cleanup restores original host descriptors, including absent properties, and drops the test's renderer reference.

## Planned conformance cases

| Case | Planned assertion |
| --- | --- |
| Current-mode selection | Omitted, undefined, and explicit current mode select inspection once per instance without rendering. |
| Preview-mode selection | Preview selects the real preview API once and retains its report. |
| Invalid modes | Invalid primitives, boxed strings, and hostile or revoked objects reject before coercion, API calls or construction. |
| Invalid requests | Input type, JSON syntax, and common shape failures display the selected API's actual response. |
| Available current results | World and client declarations retain distinct evidence, selected choices, and fallback or stored origins. |
| Unavailable observations | Missing, unknown, and present-unavailable observations retain distinct evidence and no inferred fallback. |
| Explicit saved values | Null, false, zero, empty strings, arrays and nested custom values remain visible, including unresolved values. |
| Identity and declarations | Duplicate labels, padded and prototype-sensitive IDs, duplicates, and malformed records produce no guessed identities. |
| Valid preset dispositions | Proposed, same, conflict, and blocked retain both difference fields and leave current rows unchanged. |
| Invalid presets | Invalid, multiple, duplicate, and ineligible proposals show exact issues. Current rows follow the real common-input contract. |
| Projection domain | Unavailable null, available empty, and available limited projections retain their distinct domains. |
| Actual escaped rendering | The pinned compiler and actual template escape hostile values and expose only Close and Cancel buttons. |
| Retention and isolation | Mutable returned views and changed ambient fake state do not recapture or change reports. |
| Lifecycle and event binding | Base render arguments and return, namespaced rebinding, non-Escape behavior, and all four dismissal routes. |
| Concurrent/reentrant dismissal | One shared promise, one delayed base close, undefined completion, and no subsequent base render. |
| Failed dismissal | Synchronous throws and asynchronous rejections preserve the exact error and prevent retry. |

The preset matrix expects `proposed / true / false` for absence to standard, `same / false / false` for explicit standard, and `conflict / true / true` for an eligible alternative to standard. Explicit null, false, zero, or custom invalid values produce `conflict / true / null`. Unknown and present-unavailable values produce `blocked / null / null`. Absence to an eligible alternative produces `proposed / true / true`.

## Acquisition and execution status

The initial authoring pass acquired 127,654 committed-reference bytes and 219,489 renderer bytes. Its working-source guard stopped after 19,286 bytes with an ambiguous BOM-or-lone-CR diagnostic. The later independent pass verified 37,926 working bytes and did not establish which historical predicate fired. The original retained reference and renderer payloads were unavailable in the continuation, so exactly those inputs were reacquired once. The supplemental pass retained 127,654 committed-reference bytes and 219,489 renderer bytes and performed zero working-source reads. This authoring continuation presented 26,947 bytes of source excerpts from retained inputs.

At the authoring checkpoint, the following focused command required separate admission. Its subsequent separately admitted result is recorded below.

```text
node --test --test-concurrency=1 tests/mechanic-preferences-review.test.mjs
```

The authored capability reviews serialized evidence only. Live settings access, real permissions, native rendering, persistence, preset application, gameplay effects, production catalogs and full P05 completion remain unverified.

## Focused execution result

The focused command above ran once on Node v24.22.1 and exited 0. All sixteen named subcases and the parent passed. No rerun followed.

The recorded terminal summary was:

```text
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 139.0806
```

The supplied terminal record reports complete runner output retained without truncation. Independent review has not inspected the full raw stdout.

All sixteen cases in the planned matrix passed, including real API selection, indexed evidence, saved-value distinctions, preset dispositions, projection domains, actual escaped template rendering, report retention, event binding, concurrent/reentrant dismissal and failed dismissal. The test used the pinned Handlebars 4.7.10 compiler and the allowlisted API graph with simulated Application boundaries.

The runner emitted size, hash and line-ending diagnostics for the four API modules, totaling 37,926 working bytes. The eight declared loader-input lengths sum to 267,914 bytes. That aggregate is calculated from pinned lengths; the runner did not emit it as a measured total.

A separate report-update attempt stopped with a PowerShell overload-conversion error before opening the report for writing. Subsequent checks matched all ten pre-run pins. This report-only correction records the retained test result and adds no execution.

Native Foundry rendering and lifecycle dispatch, real permissions, live settings capture or application, persistence, gameplay effects, production catalogs and full P05 completion remain unverified.
