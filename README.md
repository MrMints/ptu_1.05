# Pokemon Tabletop United 1.05
This is a forked version of the Pokemon Carbon system from [animenerdfreddurst](https://github.com/animenerdfreddurst/pokemon_carbon)

This fork restores standard PTU 1.05 terminology, repairs inherited content and bugs, and develops verified, assisted automation. The initial integration target is Foundry v13.351.

Supported scope is **Generations 1–8 only**, using PTU 1.05 mechanics and approved supporting material. **Generation 9 and later are excluded.** Inherited development packs still contain excluded records; physical packaging/UI exclusion is pending. See the [scope policy](docs/SCOPE.md) for classification, compatibility and release requirements.

Development is staged. Historical content recovery is not rules verification. Standard/revised selection and the complete move audit are not implemented yet. See [current status](docs/STATUS.md), the [roadmap](ROADMAP.md), and [changelog](CHANGELOG.md).

## How to Install
No validated release is published by this development batch. Do not use the manifest download URL until the corresponding release exists.

For development, install Node.js 22 or newer and pnpm 11.25.0, then run:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm validate
pnpm packs:verify
pnpm build
```

The build creates `dist/system.zip` and `dist/system.json`. Extract the archive into an isolated Foundry user-data `Data/systems/ptu` directory, or use `pnpm test:foundry:setup` for the disposable workspace installation. Never point tests at a campaign. Follow [testing instructions](docs/TESTING.md) for activation and startup.

Readable JSON in `packs/*/_source/` is authoritative; databases are generated. The [recovery report](docs/data/recovery.json) records historical commits. [Source references](docs/data/references.json) record local document checksums and page references; supplied rulebooks remain local and are excluded from Git and installation archives.

## Contributing and releases

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md). Every PR must update the Unreleased changelog and document changes, validation, compatibility, limitations and references. Routine merges do not increment the version or publish a release. Release publication requires matching version/tag metadata and recorded integration evidence.

## Special Thanks
* [cswendrowski](https://github.com/cswendrowski) for starting Foundry
* https://www.theworldofpokemon.com/ for their amazing pokedex entries 
* npaisley for their work on the pokemon carbon system
* animenerdfreddurst for making pokemon carbon; please take anything from this project for your own use.

## Disclaimer
Generative AI has been used on some or all portions of this project from the first committed changes of this fork and thereafter.

## Copyright
Pokémon © 2002-2025 Pokémon. © 1995-2025 Nintendo/Creatures Inc./GAME FREAK inc. TM, ® and Pokémon character names are trademarks of Nintendo.
No copyright or trademark infringement is intended in using Pokémon content for the Pokemon Tabletop United 1.05 for FoundryVTT System.
