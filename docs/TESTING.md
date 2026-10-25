# Batch testing

All supported behavior tests follow [SCOPE.md](SCOPE.md): **Generations 1–8 only; Generation 9 and later excluded**. Use in-scope fixtures. Historical Generation 9 diagnostics remain evidence, not an active recovery/verification backlog. Shared older content is still tested when it has an independent in-scope use. Partial guards cover three reviewed identities; future release validation must check complete exclusion from shipped playable packs, new acquisition and presets while preserving legacy campaigns. Complete release exclusion is not implemented.

## Automated batch
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

Inherited source classifications have a separate check: `node tools/record-source-review.mjs` and
`node --test --test-isolation=none tests/record-source-review.test.mjs tests/rules-catalog.test.mjs`.
The current 19-test batch checks source evidence and finite coverage, not gameplay. A valid snapshot may
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
does not fall back to historical metadata or a matching label. Refresh updates source
system data while preserving owned quantity, enabled state, custom name/image and source
identity; comprehensive campaign and rule-selection migrations remain with chat 09.

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
