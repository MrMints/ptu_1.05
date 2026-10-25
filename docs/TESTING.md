# Batch testing

All supported behavior tests follow [SCOPE.md](SCOPE.md): **Generations 1–8 only; Generation 9 and later excluded**. Use in-scope fixtures. Historical Generation 9 diagnostics remain evidence, not an active recovery/verification backlog. Shared older content is still tested when it has an independent in-scope use. Future release validation must check exclusion from shipped playable packs, new acquisition and presets while preserving legacy campaigns; this exclusion is not implemented by the documentation update.

## Automated batch
Run `pnpm test`, `pnpm validate`, `pnpm packs:verify`, and `pnpm build`.
The pack round trip checks semantic equality and stable IDs. It is not a rules audit.
Run `node tools/audit-content.mjs` to refresh the structural audit and move inventory without losing recorded review status.

## Foundry v13.351 batch
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
