# Mechanic preferences review registry

**Authored / not executed.** The registration test defines four planned subcases and a parent. Source verification and syntax-only parsing are separate from test execution.

## Registry surface

The existing initializer publishes the actual `PTUCONFIG` object as `CONFIG.PTU`. The only new registry entry is `ui.mechanicPreferencesReview.sheetClass`, a direct reference to the accepted `MechanicPreferencesReview` class. The caller supplies serialized evidence and selects current inspection or advisory preset preview. Opening the window takes an explicit render call. The registry adds no automatic opening, capture, application, or consent.

## Source bindings and preservation

The base is `9ac347c3a1253b97279dcab7af7cc7da95d17c63`. The metadata check froze the committed blob and byte count of every input before acquisition. All working inputs decoded as strict UTF-8 without a BOM or lone CR. Only CRLF-to-LF conversion in memory was allowed for comparison against the committed blobs.

| Path | Committed bytes | Committed Git blob | Working bytes | Working line endings | Working SHA-256 |
| --- | ---: | --- | ---: | --- | --- |
| `src/scripts/config/index.js` | 10,591 | `eb21ec1567f99d71b98232f81a54ecac33001b7d` | 10,938 | 0 LF, 347 CRLF | `6910bcbed6b67762da1057e0e4fbb7f58e3fc827194a0810a9577067f6b32e98` |
| `src/scripts/hooks/init.js` | 4,285 | `f333a2407c2496dd2b2d87827e9c2bfc5b7d2542` | 4,396 | 0 LF, 111 CRLF | `cc7bd83d0b4f14628e43159664f8cf6e24ea59747c865dbab9f31c28d7a0607b` |
| `src/module/apps/mechanic-preferences-review.js` | 5,816 | `f0f117b362ba9babbad8d697b9b280d261b1e708` | 5,816 | 127 LF, 0 CRLF | `50a6d2a681d710775861259a9a0eb44fd81a438481dc5d4903dfe9ac0510daab` |
| `src/util/mechanic-preferences.js` | 19,286 | `a93bd2cff90e1f34ad964d66384b2c84a57f5978` | 19,286 | 317 LF, 0 CRLF | `de585d7b5ba9d0d0b75135fdefdad27ec9f3badd0ea0d1d6e0164c155ab6f8d1` |
| `src/util/rule-versions.js` | 11,058 | `700a37b025c670ab602e4fc1ff0fdaf0bdd02f03` | 11,058 | 160 LF, 0 CRLF | `ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9` |
| `src/util/document-source.js` | 1,386 | `ebb47fa13c5c1d9c03084136cf3fee053ae3ec21` | 1,386 | 24 LF, 0 CRLF | `86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0` |
| `src/util/rule-version-registry.js` | 6,196 | `d5753450386cc200d01d1cd161a0122d07d6ea5b` | 6,196 | 91 LF, 0 CRLF | `93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5` |
| `docs/RULE_VERSIONS.md` | 77,723 | `308a1b49b0de1997fce80742e31c43c81b1f03bf` | 77,759 | 271 LF, 36 CRLF | `4b401d6ff17186ac54edd1e5293e76fefaae31638cb71d2a693e5e5373e11692` |

The original working configuration has 347 CRLFs and no final newline. The two insertion spans are 95 bytes after the `BaseEffectPTU` import and 81 bytes before the `party` entry. Their zero-based offsets in the original buffer are 3,486 and 7,387. Removing those spans recovers the original working buffer and, after the evidenced CRLF-to-LF conversion in memory, the committed configuration blob. The candidate is 11,114 bytes, SHA-256 `ecc62094fabe5d38130fc808b676fc809faf4cf700bb851db900c94590e334ba`, and still has no final newline.

The guide keeps its 77,759-byte working buffer as an exact prefix. The 777-byte append uses CRLF at the existing CRLF end boundary. Its SHA-256 is `e0983aefafc14a4a3d45820ca84113beb1d371cfb2d6897c3755b7e98bc51a33`. The resulting guide is 78,536 bytes, SHA-256 `bbaee73cde0e0864a53fff906c2c6e4fa2039e4b624e911ccd0c38e9bc5d0bc8`. Removing the suffix recovers the original working guide, including its mixed line endings.

## Test loader and doubles

The future focused run will read the seven production inputs once within a 64 KiB loader-input cap. It will remove the two exact spans from the complete candidate to recover the baseline, verify the canonical byte count, SHA-256 and Git blob, then evaluate both complete configurations under private allowlisted URLs. Both init graphs use the same complete unchanged source with different configuration bindings.

The candidate uses the actual accepted review class, a counting bridge, and the actual four-module API closure. The bridge forwards the unchanged primitive JSON argument to the selected real API, records its report, and returns that same object. The test compares the existing view serialization and parsed evidence against the recorded report. The mode goes to the review constructor. Native Node linking resolves the rule-versions/registry cycle. Unexpected imports from the private graph fail. The test deregisters the synchronous hooks and releases retained sources in cleanup. Module caches may outlive hook deregistration.

The baseline configuration has 47 import declarations covering these 45 synthetic modules. Both graphs share the same sentinel for each imported binding, including duplicate declarations from the Actor and Item modules.

| Configuration specifier | Synthetic exports |
| --- | --- |
| `./automation.js` | `automation` |
| `../../module/actor/index.js` | `PTUActor`, `PTUTrainerActor`, `PTUPokemonActor`, `PTUCharacterSheet`, `PTUPokemonSheet`, `PTUSkills` |
| `../../module/item/index.js` | `PTUItemProxy`, `PTUItem`, `PTUEffect`, `PTUEdge`, `PTUFeat`, `PTUMove`, `PTUSpecies`, `PTUSpeciesSheet`, `PTUItemItem`, `PTUCondition`, `PTUItemSheet`, `PTUEffectSheet`, `PTUEdgeSheet`, `PTUFeatSheet`, `PTUMoveSheet` |
| `../../module/combat/document.js` | `PTUCombat` |
| `./data/index.js` | `levelProgression`, `typeEffectiveness`, `natureData`, `pokemonData`, `dbData`, `helpText` |
| `./data/pokeball-themes.js` | `pokeballStyles`, `pokeballShapes` |
| `../../module/rules/index.js` | `RuleElements` |
| `../../module/system/predication.js` | `PTUPredicate` |
| `../../module/actor/base.js` | `PTUActorProxy` |
| `../../util/enricher.js` | `Enricher` |
| `../../util/misc.js` | `sluggify` |
| `./data/tms.js` | `default (tmData)` |
| `../../module/apps/party/index.js` | `PTUPartySheet` |
| `../../module/apps/pokemon-training/index.js` | `PTUPokemonTrainingSheet` |
| `../../module/active-effect.js` | `ActiveEffectPTU` |
| `./effects.js` | `statusEffects` |
| `../../module/canvas/status-effect.js` | `StatusEffects` |
| `../../module/canvas/token/index.js` | `PTUToken` |
| `../../module/apps/species-drag-in/sheet.js` | `PTUSpeciesDragOptionsPrompt` |
| `../../module/apps/species-mass-generator/sheet.js` | `PTUSpeciesMassGenerator` |
| `../../module/apps/npc-quick-build/sheet.js` | `PTUNpcQuickBuild` |
| `../../module/apps/level-up-form/sheet.js` | `LevelUpForm` |
| `../../module/apps/level-up-form/document.js` | `LevelUpData` |
| `../../module/system/check/rolls/attack-roll.js` | `AttackRoll` |
| `../../module/system/check/rolls/roll.js` | `CheckRoll` |
| `../../module/apps/sidebar/chatlog.js` | `PTUChatLog` |
| `../../module/message/base.js` | `ChatMessagePTU`, `PTUChatMessageProxy` |
| `../../module/system/damage/roll.js` | `DamageRoll` |
| `../../module/message/damage.js` | `DamageMessagePTU` |
| `../../module/message/attack.js` | `AttackMessagePTU` |
| `../../module/item/item/pokeball.js` | `PokeballItem` |
| `../../module/system/check/rolls/capture-roll.js` | `CaptureRoll` |
| `../../module/system/check/rolls/initiative-roll.js` | `InitiativeRoll` |
| `../../module/combat/combatant.js` | `PTUCombatant` |
| `../../module/combat/config.js` | `PTUCombatTrackerConfig` |
| `../../module/combat/tracker.js` | `PTUCombatTracker` |
| `../../module/canvas/token/document.js` | `PTUTokenDocument` |
| `../../module/user.js` | `PTUUser` |
| `../../module/item/contestmove/document.js` | `PTUContestMove` |
| `../../module/item/contestmove/sheet.js` | `PTUContestMoveSheet` |
| `../../module/apps/hotbar.js` | `PTUHotBar` |
| `../../module/canvas/token/sheet.js` | `PTUTokenConfig` |
| `../../module/apps/compendium-browser/index.js` | `PackLoader` |
| `../../module/apps/rulebook-journal.js` | `default (PTURuleBookJournal)` |
| `../../module/item/effect-types/base.js` | `BaseEffectPTU` |

The init module's `../config/index.js` import binds to the corresponding actual configuration. These are the seven other synthetic modules.

| Init specifier | Synthetic exports |
| --- | --- |
| `../game-ptu.js` | `GamePTU` |
| `../../module/system/index.js` | `registerSettings` |
| `../handlebars.js` | `registerHandlebarsHelpers` |
| `../sheets.js` | `registerSheets` |
| `../templates.js` | `registerTemplates` |
| `../../module/canvas/helpers.js` | `measureDistances` |
| `../../module/item/collection.js` | `PTUItems` |

Unexpected calls and construction fail. `pokeballStyles.default` has its own stable sentinel. The combat hook and the four registration functions record the expected calls. `GamePTU.onInit` also records its call. `measureDistances` is identifiable and fails if invoked. The real modules behind these doubles remain unloaded.

## Planned conformance

| Case | Planned assertion |
| --- | --- |
| A. Complete registry preservation and inert loading | Compare every pre-existing registry key, descriptor, array entry, and shared sentinel. Verify the sole added class slot. Module loading and listener installation leave review construction, API calls, rendering, and settings access at zero. |
| B. Actual init binding with unchanged baseline effects | Run both real init callbacks against separate synthetic hosts. Compare ordered calls, assignments, shared identities, the retained Dice entry, and the sealed replacement constants. Compare generated closures by role and separate identity. |
| C. Explicit current-mode call through the registry | Construct through the published class, check one real inspection call with exact JSON, verify standard fallback and retained evidence, then check explicit render and dismissal without a settings call. |
| D. Explicit preview-mode call through the registry | Check one real preview call with exact JSON, current standard fallback, and a separate proposal with disposition `proposed` and both difference fields true. Verify rendering, dismissal and preservation without a settings call. |

The initializer checks model the DOM-absent and devMode-false branch. Each run records listener installation, the existing log, combat registration, `querySelector("#ui-right")`, sheet registration, Handlebars helper registration, settings registration, template registration, the exact `game.settings.get("ptu", "devMode")` call, and `GamePTU.onInit`. Unexpected host effects have tripwires. The test leaves `canvasInit`, `window.actor` and the drag handler uninvoked. Host and console descriptors are restored in `finally`, including originally absent properties.

## Accounting and limitations

This continuation's single authoring input pass retained **59,076 production bytes** and **77,759 guide bytes**, totaling **136,835 bytes**. It bound fresh working buffers and used retained content for the inverse and prefix comparisons. The earlier interrupted authoring acquisition is separate and its truncated output did not supply the preservation baseline for this continuation. Committed source identity checks used metadata and the retained working buffers. No committed-content pass was needed.

The authoring check permits a single post-authoring pass over the four changed artifacts and the six unchanged production inputs, with the configuration counted only among the changed artifacts. Node identity hashing and the two syntax-only parses are separate from artifact acquisition.

A separately admitted focused run would use:

```text
node --test --test-concurrency=1 tests/mechanic-preferences-review-registration.test.mjs
```

Native Foundry startup and rendering, real settings registration and permissions, persistence, gameplay, and catalog integration remain unverified. The test uses synthetic declarations and records expected initialization calls separately from forbidden effects.

## Authoring completion

The first authoring continuation retained 136,835 input bytes. It created the test and this report, then stopped locally before submitting the tracked edit command because the prepared command exceeded the Windows length guard. Reconciliation read 133,989 bytes and confirmed that both tracked files still matched their original pins. No tool or approval denial was established for that unsubmitted command. The earlier interrupted authoring read also reported 136,835 bytes, with truncated persisted output. Its recovery reads of 113,888 and 8,091 bytes are separate historical accounting.

The bounded completion verified both new-file pins in one 45,292-byte pass. It then read the two original tracked files once, totaling 88,697 bytes, and validated both before writing. The short command was 7,790 characters and contained neither original file. The configuration's two CRLF spans can be removed to recover the exact 10,938-byte original and canonical blob recorded above. It retains no final newline. The guide was appended once with the prepared 777-byte CRLF suffix, whose SHA-256 matched the earlier candidate. The fallback suffix was unnecessary. The complete 77,759-byte original guide was checked as the unchanged prefix.

Node v24.22.1 matched SHA-256 `86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17` in a separate 93,713,712-byte executable check. The two syntax-only commands for the configuration and registration test each exited 0. The test remains 33,434 bytes with SHA-256 `345f43ab07d71b7fdb03fad78041ce7e4275256c00410874570d9b3eb1859e0c`.

This factual report update reads the prior 11,858-byte report once and preserves it as an exact prefix. The post-authoring verification is a separate pass over the four changed artifacts and six unchanged production inputs. **Authored / not executed.** No loader probe, production import, API evaluation, initializer invocation, renderer evaluation, or test run occurred. The four cases remain planned coverage.

## Focused execution result

The focused command above ran once on Node v24.22.1 and exited 0. All four named subcases and the parent passed. The retained runner output includes the full case list and summary without truncation. No rerun followed.

- Passed: A. Complete registry preservation and inert loading
- Passed: B. Actual init binding with unchanged baseline effects
- Passed: C. Explicit current-mode call through the registry
- Passed: D. Explicit preview-mode call through the registry

```text
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 99.8115
```

The runner reported 59,252 production loader bytes across the seven pinned inputs. Its per-file diagnostics reported the actual sizes, SHA-256 hashes, and line endings. The test exercised the complete baseline and candidate configurations and the unchanged initializer under separate synthetic hosts. It also exercised explicit current and preview calls through the published class with the real API. Expected initializer calls were recorded separately from forbidden host effects.

The execution preflight acquired 185,099 bytes across the four artifacts and six unchanged inputs. The Node identity check was separate. This update uses the report retained during preflight and preserves the authoring history above.

This result covers the modeled DOM-absent, devMode-false initialization branch and explicit review calls. Native Foundry startup and rendering, real settings implementations and permissions, live data, persistence, and gameplay remain unverified.
