# Batch testing

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

`test:foundry:setup` merges into the disposable system copy and can leave obsolete database files.
For a clean archive test, stop Foundry, preserve the previous disposable `Data/systems/ptu`
directory outside `Data/systems`, and extract `dist/system.zip` into a new `Data/systems/ptu`.
Keep the disposable Config and world directories intact. Never replace a campaign installation.
The [2026-10-24 pack baseline](validation/2026-10-24-foundry-packs.md) records the tested scope and limitations.

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
