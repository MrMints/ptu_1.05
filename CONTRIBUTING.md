# Contributing

Use Node 22 or newer and pnpm 11.25.0. Run `pnpm install --frozen-lockfile`.
Run a related batch with `pnpm test` and `pnpm validate`. Before a release also run
`pnpm packs:verify` and `pnpm build`, then the Foundry integration batch in `docs/TESTING.md`.

Use focused branches and PRs against the default branch (currently `master`). Every PR must
add an Unreleased changelog entry and complete the PR template. Test results must distinguish
pass/fail/not run; presence of a checkbox is not evidence. Review documentation for accuracy.

Preserve persistent identifiers, source provenance, and user data. Skill terminology changes
must preserve rule selectors and numeric behavior. Never globally replace terms in content.
Use `docs/data/references.json` for local reference identities and cite printed/PDF pages.

Squash merge only after required checks pass. Ordinary merges are not releases. For a release,
update both package and system versions, promote Unreleased entries into a dated version,
complete the integration batch, and record its evidence. The manual release workflow creates
a draft; inspect the archive and notes before explicitly publishing it. Never release with
unresolved installation errors or claim unaudited content is verified.
