# Batch testing

## P03-NPC identity checks

Run `node --test --test-isolation=none tests/npc-selection.test.mjs tests/prerequisites.test.mjs tests/skills.test.mjs tests/acquisition.test.mjs` (38 passing). Tests execute the actual bundled dropdown and actual NPC preload/refresh/generation with controlled Foundry IO. Retained failing baseline evidence and Node/live boundaries are in [the validation report](validation/2026-10-26-p03-npc.md).

Run `node tools/check-npc-identity-evidence.mjs --current` to replay 13 captured scenario families, verify 55 raw-file hashes and compare the four current production files with tested commit text. Omit `--current` only when reviewing historical evidence after later runtime changes; raw assertions/hashes still run. This read-only checker does not launch Foundry or certify a new runtime.

For fresh live work, install the candidate only after stopping the disposable server, copy `tools/foundry-npc-identity-check.mjs` to `.foundry-test/Data/p03-checks/`, and use a saved Script macro importing `/p03-checks/foundry-npc-identity-check.mjs` and calling `openNpcIdentityProbe({phase:'final-matrix'})` in `ptu-verification`. This creates/reuses 8 synthetic compendium Items and opens actual controls; select through normal dropdown clicks, capture state/refresh, remove/re-add/rename and Submit. Do not inject selection arrays. Keep distinct phase snapshots, clicked UUID/order, generated raw data and installed/served/archive hashes. The runner's `final-cancel` phase supports actual unresolved-choice cancellation; a player probe requires access to its macro and real ACTOR_CREATE denial. The recorded owner-approved temporary Observer grant was restored to Default; world roles/core permissions were unchanged. Do not assume that grant authorizes future access changes.

Reload generated actors and compare exact selected owned IDs/source IDs, full system/flags/choices and diagnostics. Check ordinary actor-sheet display. Return world to Setup and stop the owned server, verify port/lock and restore temporary UI/access changes. Synthetic source/version labels do not approve production variants. No unsaved builder-draft persistence or general species rules certification is implied.


## D source checks

Remaining D2/D3 adds signed/arithmetic lexical guards and finite source-search integrity to the same focused command below. The 18 Move parser/evidence tests cover synthetic spaced/Unicode minus negatives, actual Mud Bomb/Acrobatics/source boundaries, optional alternatives, weapon/use conditions, executable fields, fixed Hidden Power non-approval, complete underlying rules and exact native-page substitution. Synthetic fixtures do not establish new real discrepancies. Together with the 39 record/Ability tests, the complete source batch has 57 tests. [Current source examination and limits](validation/2026-10-26-move-source-review.md). Reuse unaffected accepted runtime/catalog observations; no world is started for source tooling.

Run `node --test --test-isolation=none tests/record-source-review.test.mjs tests/ability-source-parsing.test.mjs tests/ability-source-review.test.mjs tests/move-source-parsing.test.mjs tests/move-source-review.test.mjs` and `node tools/record-source-review.mjs`. The Move regressions exercise actual Curse, compact Glitch, Gravity, source-boundary and Contest counter/identity evidence. Corrupt literal dice, current/history fields, source words or frozen memberships must fail. Equal ordered words do not establish typed-role or behavioral equivalence. [Historical D1 coverage](validation/2026-10-26-d1-source-checkpoint.md) records its then-unstarted D2/D3 slices; the current report above supersedes that progress state; CI does not read local PDFs or certify gameplay.

## P01 evidence-contract checks

Run `node --test --test-isolation=none tests/documentation.test.mjs tests/evidence-contract.test.mjs` and `node tools/evidence-contract.mjs` after evidence-contract changes. The existing Documentation entrypoint runs the contract; the Validation test glob includes its negative tests. The [contract](data/p01-evidence-contract.json) links all 16 supported routes to observed cases and distinguishes current from reused evidence. The [runtime binding](validation/2026-10-26-p02a-runtime-binding.json) resolves 26 label contradictions through reviewed installation/client/hash evidence without editing raw reports. Exact indices distinguish repeated scenario labels.

Required failures/not-run cases need accepted dispositions and reciprocal links to passing superseding observations; a later pass never erases the earlier failure. Record expected/observed outcomes, execution/runtime/artifact identities and explicit limits. Structure checks do not establish accuracy, appropriate reuse/dispositions or actual route behavior. See [P01 validation](validation/2026-10-26-p01.md). No new production variants, full 04, OPEN-05 or release readiness is certified.


All supported behavior tests follow [SCOPE.md](SCOPE.md): **Generations 1–8 only; Generation 9 and later excluded**. Use in-scope fixtures. Historical Generation 9 diagnostics remain evidence, not an active recovery/verification backlog. Shared older content is still tested when it has an independent in-scope use. Partial guards cover three reviewed identities; future release validation must check complete exclusion from shipped playable packs, new acquisition and presets while preserving legacy campaigns. Complete release exclusion is not implemented.

## Amended pre-05 acceptance

The required observed matrix and correction owners are in [PRE_05_RECONCILIATION.md](PRE_05_RECONCILIATION.md#required-observed-acceptance). These are open acceptance requirements, not passing scenarios. Record initial inputs, exact actor/item/source/version identity, action/route, expected and observed results, persisted values, tested commit and evidence. Test non-mutating satisfied/unmet/unverifiable reporting, every supported trainer/Pokémon add route, persistent visible reports, same-name/renamed/version-specific records, repeat add/reload, ownership denial and separate effect/scope conditions. Single/multiple/mixed and custom/unknown requirements must not be hidden by automatic dependency grants or skill increases.

Before 05, reproduce and correct the bounded 0.111/0.113/0.115, refresh and migration-failure preservation risks on disposable fixtures, including repeated runs, modern/legacy identity conflicts, custom fields/automation and failure without a false successful schema stamp. Existing starter/skill evidence remains limited to its historical cases. P01 must test that incomplete/failed/not-run required evidence cannot pass the amended gate; human review checks actual accuracy. After 05, repeat against real accepted variant pairs across all four categories; 09 binds the complete matrix to the tested archive digest and commit. Do not treat scenario names alone as evidence.

## Automated batch

P03's focused batch is `node --test --test-isolation=none tests/prerequisites.test.mjs tests/skills.test.mjs` (16 tests). The real NPC refresh regression executes the actual class with fixture-controlled Foundry IO; the separate live runner imports the installed modules normally. For the latter, copy `tools/foundry-p03-check.mjs` into `.foundry-test/Data/p03-checks/`, launch the disposable `ptu-verification` world as GM, and execute a saved Script macro importing `/p03-checks/foundry-p03-check.mjs` and calling `runP03Check()`. It retains four flagged synthetic world Items and no new actors. Capture the result textarea and inspect the actual NPC warning panel/navigation. These fixtures establish diagnostic identity separation, not approved original/errata production variants. [P03 evidence](validation/2026-10-26-p03.md) records inputs, observations and untested route/persistence boundaries. On Windows, restricted child-process/filesystem permissions can produce `spawn EPERM` or staged-directory rename `EPERM`; distinguish these from failed assertions and rerun the affected disposable batch with normal filesystem permissions.

Run `pnpm test`, `pnpm validate`, `pnpm packs:verify`, and `pnpm build`.
The pack round trip checks semantic equality and stable IDs. It is not a rules audit.
Run `node tools/audit-content.mjs` to refresh the structural audit and move inventory without losing recorded review status.

Run `node tools/content-scope.mjs` to regenerate the all-record ID/hash inventory from
the source-linked review ledger. Generation eligibility, rule-version approval and
verification are independent fields; folders are included in source counts. The commands
`node tools/content-scope.mjs --require-complete` and `node tools/build.mjs --supported`
currently **must refuse** incomplete catalog/dependency approval. Normal `pnpm build`
produces a development candidate with `content-scope-status.json` and preserves original
pack UUID resolution; it does not produce a certified supported release.

### Source catalog checks

Run `node tools/rules-catalog.mjs` and the 11-test `tests/rules-catalog.test.mjs` batch
after catalog changes. CI includes these tests in the normal suite. They check citation
hashes/page bounds, source coverage, independent review states, canonical identities,
stable species hashes and historical dispositions; they do not certify rules behavior.
With local originals and `pypdf`, run `python tools/reference-catalog.py --check` to
check the physical inventory without overwriting review metadata. See
[the source guide](RULES_SOURCES.md) for catalog coverage and manual conflicts.

The focused batch also rejects missing required supplemental pages, regional profile/combined-page gaps,
uninterpreted dex fields, lost repeated printed slots, split/merged prose defects, duplicate reprint identities
and accidental source-to-runtime approval. It checks catalog consistency; it does not parse PDFs in CI or
certify the interpreted rules, inherited record mappings or gameplay.

## Foundry v13.351 batch

P02-A exposes `actor.prerequisiteDiagnostics` and `item.prerequisiteDiagnostic` as derived
views of the accepted P03 interface. Actor and Feature/Edge/Poké Edge sheets display the
same escaped, itemized reports; no report flags are persisted. Existing saved
`flags.ptu.selectedVersion` is reported as supplied and shape-validated, never inferred.
Trainer and Pokémon collections include all three distinct Item types, without inventing
new budgets. Ownership/scope checks and genuine effect/choice predicates remain separate.
Creating/importing an Item with a class label does not guess a class grant; deliberate
same-sheet grouping uses exact owned IDs. Complete reciprocal JSON/inline restoration preserves supplied choices; incomplete or
unestablished saved graphs refuse unchanged rather than guessing/replaying grants. NPC generation resolves choices on a temporary
actor before creating folders/actors, and leaves its normal starter entitlement pending
for explicit selection rather than opening a competing prompt during generation.

The [earlier P02-A matrix](validation/2026-10-26-p02a.md) retains its bounded route/UI observations; subsequent review reproduced mixed cancellation and saved-grant gaps. The [correction matrix and raw evidence](validation/2026-10-26-p02a-correction.md) supersedes broad cancellation/no-replay claims: runtime `416c645e`, 34 focused/140 final full local passes, actual source-aware clone/drop/folder consent and cancellation, raw complete/ambiguous graphs, player security and reload proof. The first 2/3 reload and exact ordinary core stamp/derived-attribution difference remain explicit; stable reload is 3/3. Pending substantive acceptance; implementation tests do not approve content/rules.

For a saved Item with reciprocal linked Items, Duplicate/save and cross-actor sheet drops collect the full component only from its actual accessible source collection. An explicit Copy linked Items prompt lists additional Items and the destination, with No as default. Confirm to create independent IDs and internal relationships; No or Close changes nothing. A partial raw payload without an established origin cannot infer partners from names, provenance or other actors. Malformed linked components require review; unrelated null metadata must not block ordinary unlinked copying. Ordinary core unlinked drop provenance can be transient in memory and affect report identity.sourceId after reload; the correction evidence isolates that limit.

On a trainer, open Features & Edges to inspect Features, Edges and Poké Edges. On a Pokémon, open Enhancements & Items: the existing Enhancements collection uses the distinct `pokeedge` type, with Features and Edges alongside it. Both the actor and the individual Item show non-blocking unmet and unverifiable/custom requirements. Missing version attribution is separate from prerequisite truth; it does not authorize choosing a different source. Reports update from actor and embedded inputs, including species skills. Ordinary read-only sheets retain diagnostics; their visible Add anchors do not grant permission.

For v13 JSON restoration, import the JSON into a world Item and then copy that restored Item to the actor, or restore supported raw inline/copy data through normal Document APIs. Core embedded `Item.importFromJSON` currently fails because its embedded collection lacks `fromCompendium`; that unsupported core call is retained as a limitation. Restoration is not explicit variant replacement or dependency replay. Unlinked tokens retain core base-plus-delta behavior: later base-actor additions may appear after reload, so persistence checks must compare exact acquired Items and token sources and use stable bases for whole synthetic-actor equality.

Inherited source classifications have a separate check: `node tools/record-source-review.mjs` and
`node --test --test-isolation=none tests/record-source-review.test.mjs tests/ability-source-parsing.test.mjs tests/ability-source-review.test.mjs`.
The current C checkpoint has 39 passing focused tests and 11 unchanged reusable catalog results; normal CI repeats the full configured suite on the documented revision. These check source evidence and finite coverage, not gameplay. Ability checks cover complete source boundaries, Defensive/Immune marker spelling and punctuation, Range/Keywords headers, literal Heatproof wording, different typed-role boundaries despite equal words, exact current fields/UUID paths, missing triggers/numeric conflicts, profile/compiled-copy authority limits and the required C-to-D review gate. B additionally checks cached negative-scope numeric/Type/two-metric identity, compact Porygon blocks, every current unmatched field/hash and dependency path, competing source/profile coverage, recorded historical lineage and the mandatory predecessor review before C. It rejects disagreements
between duplicated evidence, declared values that differ from the current Move/Ability/species fields and
wrong exact acquisition UUID paths even when the real target appears elsewhere. It retains all 95 examined
form/branch/skill cases and the Phione four-group regression. The shared acquisition parser is exercised directly for repeated TM headings, Mew machine/tutoring permissions and normative table tails. The finite acquisition audit binds 1,075 identity/hash members and 4,300 sections to their field evidence, source context and all flagged literal/Type dispositions. Actual Meowstic paragraph, sTutor, numbered-period, None and malformed Type-column/vertical-bar cases have regressions; missing sections, erased literals, unexamined flags and altered current candidate fields are rejected. Source notes retain conditions/stat variants; duplicate acquisition paths and actual Oricorio conditional Type facts have corruption coverage. A valid snapshot may
remain incomplete; unreviewed inventory and protected production approvals must remain visible.
Stop the disposable server before refreshing its copy with `pnpm test:foundry:setup`.
Launch the installed Foundry application using `.foundry-test` as its data path, or use:

```powershell
node 'D:\Foundry\Foundry Virtual Tabletop\resources\app\main.mjs' '--dataPath=D:\Projects\PTU 1.05 on Foundry\.foundry-test' --port=30001 --noupnp
```

Complete the normal Foundry license/setup process if needed. Do not commit license files or test-world databases.
Use the `ptu-verification` world and GM/player accounts. Keep only one process using this data directory.

### Pack-loading check

Prepare source-ID expectations with `node tools/prepare-foundry-pack-check.mjs`.
Join `ptu-verification` as GM, create a Script macro, paste
`tools/foundry-pack-check.macro.js`, save it, reopen it and execute it. The result dialog
reports every declared pack's index, loaded documents, folders, document type, invalid records
and missing/unexpected/duplicate IDs. Folder records count separately from content documents.
Save the JSON result as batch evidence. Repeat after a client reload when checking persistence.
The macro reads packs; it does not import documents, execute pack macros or test rules behavior.
Its fixture is served from the disposable data directory and is excluded from the archive.

`test:foundry:setup` now holds Foundry v13.351's Config/options.json data-directory lock,
stages a fresh system copy, and swaps directories without mixing database files. It refuses
a held lock, unsafe manifest paths and directory junctions. The previous installation stays
recoverable under `.foundry-test/.setup-backups/`; licensing, Config and worlds are preserved.
Build generated packs first. Stop the world through Return to Setup, then stop the server
before setup. Do not remove a held lock or refresh a campaign installation.
For a clean archive test, stop Foundry, preserve the previous disposable `Data/systems/ptu`
directory outside `Data/systems`, and extract `dist/system.zip` into a new `Data/systems/ptu`.
Keep the disposable Config and world directories intact. Never replace a campaign installation.
The [2026-10-24 pack baseline](validation/2026-10-24-foundry-packs.md) records the tested scope and limitations.

### Basic integration and source compatibility

Serve `tools/foundry-integration-check.mjs` from `.foundry-test/Data/ptu02-checks/` only.
The [integration evidence](validation/2026-10-25-foundry-integration.md) records the plan
phases, exact fixture UUIDs, Script macro command and manual UI steps. This runner creates
disposable actors, a player and a scene; it is restricted to GM in `ptu-verification` and
is excluded from the system archive. Read the runner before executing it. Save each result
dialog's JSON and inspect the actual sheet, level-up and player UI. Do not rerun the
Generation 9 reference fixtures as a supported-content acceptance test.

Current `_stats.compendiumSource` takes precedence over legacy `flags.core.sourceId`.
Neither field is migrated or rewritten by the source accessor. A missing modern source
does not fall back to historical metadata or a matching label. Refresh fills absent source
system fields while preserving existing values, owned quantity, custom name/image and source
identity; comprehensive campaign and rule-selection migrations remain with chat 09.

P02-P changes refresh to **fill absent system fields only**. Existing raw prerequisites,
keywords/range, automation payload, schema, custom values and selected-version data remain.
Empty/null values are intentional; they are not permission to copy a source default.
Default images may refresh, but custom images remain. Exact source identity/type must
resolve; missing or ambiguous sources require manual review. Refresh is not a version
replacement or schema migration. Migrations 0.111/0.113/0.115 follow the same preservation
boundary; local legacy tag arrays can populate missing keywords without deleting tags.
Source rules/reference effects are one payload and must not be blended with saved automation.

Run `node --test --test-isolation=none tests/preservation.test.mjs tests/document-source.test.mjs`
for actual migration/runner entrypoints with controlled IO. Test older snapshots, both exact
same-name identities, conflicts, missing/custom records, repeat calls and injected
transformation/write/embedded/free-form failures. A failed run must retain the prior
world/document schema and be retryable. Earlier successfully persisted records are not
rolled back as a cross-document transaction; retain a backup and verify affected values.
No user campaign or live database is a test fixture. P02-A acquisition/display tests remain
held until substantive P02-P review.

For the document/persistence boundary, serve `tools/foundry-p02p-check.mjs` only under
`Data/ptu02-preservation/check.mjs` in `ptu-verification`. Follow the [P02-P reproduction](validation/2026-10-26-p02p.md)
for its normal Script macro, `check` then actual-client `reload` phases, saved expectations,
flagged fixture lifecycle, exact case results and limits. It reads source packs and hashes
pre-existing actors/Items; it writes only named disposable fixtures. It does not run a
forced whole-world migration or certify the later acquisition/variant framework.

### Starting Training and acquisition preservation

A newly created empty trainer opens the four-choice core Training prompt. Choose one;
the starting prerequisite exception applies and four ordinary Features/four Edges remain
available. Cancel creates no item and leaves **Choose Starter Training** on the editable
owner sheet for explicit retry. Existing populated/imported/duplicated trainers are not
retrofitted. A completed choice must survive rename/reload and refuse another helper grant.

Serve `tools/foundry-corrective02-check.mjs` as `Data/ptu02-correction/check.mjs` only.
In the disposable GM world, use a Script macro:

```javascript
const {runCorrective02Check}=await import('/ptu02-correction/check.mjs?v='+Date.now());
await runCorrective02Check();
```

Read the runner before use. Set `Data/ptu02-correction/plan.json` to a phase object.
The recorded sequence is `begin`; `create` with case `choice-0` through `choice-3`
(choose through real UI); `choice` with the corresponding case/index 0–3; `create`
with case `cancel` (cancel UI); `cancel`; `permissions`; `open-sheet` with case;
`acquisition`; `browser`; and `reload`. See the [matrix/raw results](validation/2026-10-25-corrective02.md)
for exact fixtures, manual owner/observer/retry steps and scenario boundaries. Creation
refuses an existing case: inspect preserved fixtures rather than blindly repeating it.
The runner writes disposable actors/Items/flags and temporarily uses original advancement;
the final phase restores the captured setting and checks pre-existing actor hashes.

New acquisitions use actual pack Documents and stable UUIDs. Saved raw Items may retain
excluded provenance: verify actual JSON import, `clone` with save/addSource, owned/world-folder
copy and original-ID restoration without deleting user fields. This is deliberately distinct
from rejecting the three known excluded pack imports/drops, new grants and generator input.
The pack-folder diagnostic intercepts final creation to avoid executing unclassified form
behavior. No Generation 9 gameplay probe is authorized by these boundary checks. The runner
is excluded from packages; full catalog approval and migration acceptance remain staged.

### Skill terminology acceptance

Use `tools/foundry-skills-check.mjs` only in the disposable `ptu-verification` world as GM.
The [section-03 matrix](validation/2026-10-25-skills.md) documents setup, phases, exact
coverage and the manual dialog/contested steps; its JSON preserves the numerical results.
Serve the runner and `docs/data/skill-terminology-review.json` from `Data/ptu03-checks/`,
not from the installed system. It creates flagged trainer/Pokémon fixtures, a trainer
folder and two scene tokens, and writes test chat. Existing campaign data is outside this runner.
Use populated background choices for exact persistence checks; preserve the recorded
empty-slot `""` to `"blank"` observation instead of claiming that source state is identical.
The runner and data directory are excluded from the archive. Restore browser sizing after
layout checks and stop the server at handoff.

### Reference classification and targeted probes

Run `node tools/audit-content.mjs` to regenerate the structural audit, move inventory
and `docs/data/compendium-reference-audit.json`. This preserves the existing unresolved
target list and records every occurrence's source, JSON pointer, UUID and field profile.
Unknown profiles stop the refresh for review. Reviewed runtime dispositions are reused
only while their occurrence fingerprints still match; changed occurrences need revalidation.
The review ledger is `docs/data/reference-investigations.json`. Classification does not repair links.

For the targeted v13.351 reproduction, run `node tools/prepare-foundry-reference-check.mjs`,
then save and execute `tools/foundry-reference-check.macro.js` as a Script macro in
`ptu-verification` as GM. Save the result JSON. It resolves active target UUIDs, inspects
all affected feats and core import preparation, exercises generator `create` with
`generate:false`, and constructs one temporary owned effect/rule. It writes no actor
or compendium records. Creating/saving the test macro itself changes only the disposable world.
The generator fixture bypasses random preparation and does not certify full generation
or gameplay. See the [reference investigation](validation/2026-10-25-compendium-references.md).

The recorded generator/TemporarySpecies reference fixtures use now-excluded Generation 9 consumers. Do not rerun them as a required Generations 1–8 acceptance batch. Preserve the original report, and select independently in-scope fixtures before further behavior checks. Structural reference coverage may continue to inventory excluded records without certifying them.

In one session check clean startup, all declared packs, trainer and Pokémon sheets, species data,
background selectors, all 17 skills, old/new prerequisite aliases, contested rolls, macro selectors,
linked/unlinked tokens, permissions, save/reload and console errors. Check labels for clipping.
Use fixtures with old display labels and non-default ranks/modifiers; compare numeric outcomes before/after.

Future gameplay batches must exercise accuracy/evasion/damage, STAB, effectiveness, criticals,
rounding, status/healing/recoil/multiple-strike/area/delayed moves, independent revision toggles,
cancellation, duplicate application, turn expiry, migrations and custom content.

## Release evidence
Record actual results in `docs/validation/<version>.json`, including systemVersion, foundryVersion,
commit, result and scenarios with IDs: fresh-install, upgrade, permissions, skills, moves, variants,
cancellation, duplicate-application. Include reproducible steps and results. Never mark unrun checks passed.
The release workflow only creates a draft and fails if required evidence or a dated changelog is absent.
The evidence commit must be a tested ancestor of the release commit. Only documentation/evidence may
change afterward; the workflow rejects changed runtime, content, dependency or build inputs.

For terminal 1.0.0 publication, additionally record cleanup/deletion evidence, the tested transition from inherited 4.4.3 or other higher versions, unchanged meaningful schema identities, final commit/tag and archive SHA-256, public raw-manifest response, resolved download, matching packaged manifest and successful installation from the published URL. Verify the actual remote README retains the exact installation heading/description required by [the terminal roadmap](../ROADMAP.md#terminal-cleanup-and-100-publication). Ancestor evidence, local files or a successful draft workflow alone do not establish these results. Prepare release metadata before final artifact validation; reconcile the final merged/tagged commit and repeat affected checks if package inputs change.
