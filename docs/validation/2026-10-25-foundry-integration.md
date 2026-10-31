# PTU 02 — remaining integration acceptance

All addressable work in the current brief is finished with blockers. **All section and release acceptance gates have not passed.** Starter training remains missing, and authoritative content classification plus physical Generation 9 exclusion remain pending. PTU 03 can use the unaffected installation/actor baseline after an explicit start; no other chat was started or messaged.

Runtime/content/build baseline: `83ae248dba2415be815768a0a2c836cf3ebb11a9`, branch `codex/ptu-foundation`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4), [issue #1](https://github.com/MrMints/ptu_1.05/issues/1). Foundry **13.351**, system **4.4.3**, Node **24.19.0**. The [JSON evidence](2026-10-25-foundry-integration.json) records exact tested Git objects, archive checksum, raw diagnostic results, dispositions and shutdown. Subsequent changes are evidence/handoffs and the test-only runner's fresh-generation phase; installed runtime and source packs match this baseline. This is an installation candidate, not a release certificate. The inherited manifest verification version stays 13.350.

## Changes and reproductions

- Core import preparation stores `_stats.compendiumSource`; the inherited actor/item accessors read only `flags.core.sourceId`. The modern-first accessor now reads both without modifying either. Modern identity wins even when its target is deleted; names, stored slugs and duplicate/export metadata do not supply identity. The existing explicit name/type discovery helper remains; no new identity mappings or provenance cleanup were introduced.
- Acquiring Potion `Compendium.ptu.items.Item.2kQmUgVMnwb8JfW4`, setting quantity **0**, enabled **false**, a custom label and `icons/svg/d20-grey.svg`, then refreshing twice reproduced image replacement. The inherited refresh also read obsolete `data.quantity`. The fix reads owned state from `system`, preserves name/flags/source identity, and replaces an image only when it equals the document class's default icon. Core modification timestamps may change normally. Missing/custom/deleted sources leave the document unchanged; type mismatch is refused. This is not campaign migration certification or rule-selection migration.
- Creating an empty trainer reproduced a null dereference at the automatic starter-training UUID `Compendium.ptu.edges.Item.xiZydXM8sex5CP7O`. Creation now succeeds with a visible warning and no guessed grant. This prevents the crash; **the content is not recovered**.
- A player opening an observer-only trainer caused inventory-column initialization writes, rejected by core twice. Persist columns only for an editable sheet, and supply defaults in memory for observers. The final observer UI has disabled fields and no denied-update errors. An owned trainer name edit saves and is visible to GM after reload. This is a basic ownership check, not an adversarial security audit.
- Disposable setup now uses Foundry's `Config/options.json` mutex with matching `proper-lockfile` 4.1.2 semantics, validates paths, stages a new system directory and preserves the prior copy under `.foundry-test/.setup-backups/`. No old/new database files are merged and no database is opened by setup. Config/licensing/world bytes are preserved. The lock also prevents a server starting during replacement. Never remove a held lock or use this on a campaign installation.

## Acceptance matrix

| Check | Outcome | Evidence and practical limit |
| --- | --- | --- |
| Safe setup, repeated replacement, live-lock refusal | Passed | Four setup tests; two real stopped-server runs preserved Config/world bytes. The running server refused refresh. Old copies remain recoverable. |
| Clean archive installation/startup | Passed | Fresh validated extraction, prior system renamed outside `Data/systems`, unchanged Config/world bytes; all installed `src` bytes match checkout. ZIP: 1,108,934,595 bytes, 6,833 entries, SHA-256 in JSON. No local PDFs, source JSON, test tools/data or credentials packaged. |
| Every declared pack | Passed structurally | Final archive: 15 indexes/full loads, **7,198 documents + 197 folders**, exact source IDs, zero invalid/missing/unexpected/duplicate IDs. Loading inherited excluded records does not certify their behavior or support. |
| Modern/legacy source identity | Passed, bounded | Actual acquired item, repeated core import preparation, live item/actor class legacy construction, four helper tests. No metadata rewrite or display-name mapping. |
| Refresh/custom/deleted sources | Passed | Repeated owned refresh preserves zero/disabled/custom SVG/name; missing source reports error without changes; custom source unchanged. |
| Trainer and Pokémon sheets | Passed basic render | `PTUCharacterSheet` / `PTUPokemonSheet`; skill values visible. Pokémon render from first session reused after unrelated guards; trainer rendered again from final archive. Full skill and layout acceptance remains with 03. |
| Full generation | Passed basic integration | Final archive creates a fresh level-5 Bulbasaur from `Compendium.ptu.species.Item.QE7WhquxeuebiEVQ`: species, two moves, one ability and one capability saved. No evolution; no move/rule correctness claim. |
| Level-up UI | Passed basic flow | Actual form 5→6 and 6→7, one HP point allocated and submitted each time. Level 7/completion marker survive client reload. Selection of new moves/abilities, evolution, cancellation and numerical rule certification not run. |
| Macro execution/reference integrity | Passed, bounded | All seven bundled commands inspected before use. Type Matrix's exact `game.ptu.typeMatrix.render(true)` executed and chart appeared. Other macro behavior not certified. Static literal UUID scan of current `src/**/*.js` finds only the starter-training missing target. Dynamic references are not comprehensively certified. |
| Linked/unlinked tokens | Passed basic persistence | Linked token shares actor marker; unlinked synthetic actor keeps independent marker, including after restart/client reload. Combat/automation not tested. |
| GM/player boundaries | Passed basic UI/model checks | Separate player session edits owned trainer; observer fields disabled, core denies updates, final observer render has no denied writes. GM-owned archive-generation actor is absent from player directory. |
| Save/reload | Passed | Server restart then client reload preserve actor/item IDs, source identity, quantity/disabled state, player edit, level and both token markers. |
| Starter-training content | **Blocked** | Exact record missing. Defensive warning verified; original grant remains absent. Evidence needed below. |
| Supported release pack/UI exclusion | **Blocked** | Classification and compatibility policy required from 04, then 02/05 separation/filtering and 09 acceptance. Inherited packs still contain Generation 9/unclassified content. |
| Complete skills, rules, variants, moves, automation, campaign upgrades | Not run | Assigned sections 03–09; no unsupported certification or release. |
| Layout/clipping | Not run | Browser viewport 1280×720 is below Foundry's 1024×768 minimum. Functional controls worked; no layout acceptance claim. |

Automated verification: **20/20 tests**, `pnpm validate` (17 skills, 15 packs, 7,395 sources), source syntax checks and `pnpm build` pass. Local command: `node --test --test-isolation=none tests/*.test.mjs`; sandbox worker spawn is restricted. One intermediate setup test hit an `EPERM` rename; subsequent full runs passed without code changes. No pack sources or compiler inputs changed, so prior semantic round-trip evidence is reused locally; PR CI repeats it. Keep CI outcome separate from UI-driven verification.

## Reproduce the disposable session

1. Stop Foundry, generate packs, run `pnpm test:foundry:setup`. It swaps a staged installation and reports its preserved backup. For a clean ZIP test, validate extraction paths/allowlist, extract to a fresh directory, hold the same data lock, preserve the old system outside `Data/systems`, then rename the fresh directory into place. Retain Config/worlds. Do not overwrite live database files.
2. Start v13.351 as documented in [TESTING.md](../TESTING.md), with `.foundry-test`, port 30001 and UPnP off. Owner activation already exists. Launch only `ptu-verification`; join as GM.
3. Copy `tools/foundry-integration-check.mjs` to `.foundry-test/Data/ptu02-checks/`. Set `integration-plan.json` there to `{"phase":"setup"}`. Save a Script macro with:

   ```js
   const {runIntegrationCheck} = await import('/ptu02-checks/foundry-integration-check.mjs?v=' + Date.now());
   await runIntegrationCheck();
   ```

4. Execute phases `setup`, `generation`, `compatibility`, `trainer-sheet`, `pokemon-sheet`, `macro`, `level-up`, then `reload`, saving each result's JSON. The runner requires GM in the disposable world and flags fixtures by stable verification markers. `generation` creates a fresh extra actor. `level-up` opens the real form; allocate the point and submit. It restores the earlier level-up-screen setting after completion. A rerun advances the fixture's current level; it is not a no-op.
5. Join `http://localhost:30001` as the fixture player in a separate browser session/hostname while GM uses `127.0.0.1`. Inspect owned versus observer actors, save an owned name edit, check disabled observer fields and logs. Do not grant player script privileges. Reload GM and run `reload`; the persisted fixture markers identify actors independently of their names.
6. Run the existing source-ID pack diagnostic from [the pack baseline](2026-10-24-foundry-packs.md). This only loads/indexes packs; do not execute excluded content behavior. Return to Setup through the UI, confirm `/` redirects to `/setup`, then stop the server and verify port refusal.

The first session's initial image failure and observer warnings are preserved in JSON/local logs. The final archive retests affected paths; no Generation 9 behavioral probes were run after scope correction. Raw local screenshots/logs remain under ignored `.cache/remaining-02/`; no licensing/config contents or private hashes are committed.

## Content dispositions and finite search inventory

The [scope ledger](../data/supported-content-scope.json) still matches the current source fingerprint and all 24 active targets/46 occurrences. Only the three recorded excluded consumers use those pack fields. The four extra historical transitions inspected **before** the scope correction (`059ffdc5`, `5bf20d15`, `be63a651`, `17ccf810`) contain none of the exact 24 target records; JSON records revisions, pack trees and counts. Earlier `b36aca6a` and `ba75061` inspections remain historical evidence. Repository releases returned an empty list. No authoritative identity bridge was established, no same-name/slug retarget was made, and no further Generation 9 search was performed. A shared target's generation is not inferred from these consumers. The **658 provenance targets remain preserved**, with current/legacy accessor caveats updated in the audit profiles. Pack audit totals stay 682; the newly reproduced code literal is outside that pack-source audit universe.

For **starter training**, bounded independent investigation checked:

- Current recovered sources from `b36aca6a08139594ade65908f4e22ed6227ac85e`: no exact ID anywhere in the packs.
- `ba75061ae39ca3976ddfb67d8511512e720dfe2b`: 86 edge records extracted, exact ID absent. Only the ignored copy's CURRENT line endings were normalized for extraction.
- Call introduction `eed5c4c98915545fa8e825e8a2afbd4b4a1c9f28`: edge CURRENT refers to missing `MANIFEST-002224`; snapshot is incomplete. Retained raw files also show no exact ID. Failed extraction is not evidence of a complete absence in that lost database.

Needed: an authoritative original record/export retaining `xiZydXM8sex5CP7O`, or explicit original-to-current UUID relationship evidence, plus source/page support for the intended automatic grant. A similar training label is insufficient. There is no justified further local search inventory without that evidence. Chat 04 must resolve content/rule identity before 02 restores/retargets it. New trainer creation is usable with the warning and manual review; automatic training remains unverified/missing.

Existing incomplete enhancements/later Carbon reconciliation and full content-version approval also remain in the [content audit](../data/content-audit.json). A complete original export and accepted source/version classifications are needed; inventory recovery does not establish approval. Supported/excluded/unclassified totals and physical package/UI enforcement remain unfinished. Preserve custom content, campaign selections and stable IDs during the later compatibility design.

## Warnings and final session state

Inherited manifest keys `type`/`templateVersion` produce warnings; V1 applications are deprecated (core announces removal in v16); the unpublished public update URL has no manifest. None prevented the recorded startup/pack/functional checks. Generator preparation briefly warns about no species before embedding it; final actors have the species. The intentional deleted-source fixture reports an expected error. The final server log has no observed runtime errors; final player client errors are viewport warnings only. No version, compatibility ceiling or release was changed to silence warnings.

The world returned to Setup before stopping the managed server. Terminal handle completed with Ctrl+C exit 1, and port **30001 refuses connections**. No final graceful-process log line was captured, so this is verified world unload plus process/port stop, not a claim about an unobserved shutdown log. Disposable actors, player, scene/tokens and three diagnostic macros remain for the next explicitly started batch; installed system is the clean archive and backups remain outside `Data/systems`. All other chats remain idle. Chat 03 can proceed with unaffected trainer/Pokémon/skill paths; release readiness and complete section acceptance remain blocked as above.
