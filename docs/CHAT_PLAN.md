# PTU work split across focused chats

Current partial D checkpoint: 04 retains sole checkout ownership while held after D1's 110 source dispositions (90 correspondences / 20 unresolved). D2/D3 remain unstarted and full D requires completion, passing documented-revision CI and substantive review. [Checkpoint and limits](validation/2026-10-26-d1-source-checkpoint.md). E1/full04/05 remain held; P03-NPC is parked for separately assigned work and review. No other chat is started or messaged by this checkpoint.

All nine section chats start idle in the local **PTU 1.05 on Foundry** project at `D:\Projects\PTU 1.05 on Foundry`. The owner must explicitly start each chat. This is organizational preparation, not authorization to resume implementation. The app tool creates local project chats but does not expose a ChatGPT Work-mode selector; the owner accepted idle local project chats as the fallback. Model and effort settings inherit the app default and are not changed by these instructions.

## Section ownership

All sections use PTU 1.05 mechanics plus approved content through Generation 8. Generation 9 is excluded from intended support; inherited inventory counts do not establish supported scope. Preserve historical data and campaigns. The [scope ledger](data/supported-content-scope.json) records known excluded consumers and the planned compatibility-safe browsing/acquisition/release boundary; no physical exclusion is claimed yet.

The [scope policy](SCOPE.md) is authoritative for every chat: **Generations 1–8 only; Generation 9 and later excluded**. It supersedes broader wording in initial chat messages and older handoffs. Source records retained for history are not supported release content. This correction does not start an idle chat.

The [owner amendment and pre-05 ledger](PRE_05_RECONCILIATION.md) are also authoritative for all nine chats. Preserve source-backed original/revised choices and advisory, itemized Feature/Edge prerequisites across supported characters/routes. All nine read-only assessments at `49561d92` identified concrete impact; they are not implementation acceptance. Historical 01–03 passes retain their limits. P03/P02-P are accepted at `c547e3ac`/`d7dc7f0b`; P02-A is substantively accepted at evidence head `48f05f2e`, runtime `416c645e`, with CI 40303951797. P01 is substantively accepted at `70f651ea` after CI40310640951 and planner review. Explicitly assigned **04** now owns the checkout for frozen D source examination only, with no shared-world work. **05 is blocked** until all amended prior gates and full original 04 pass; E1 and later families remain held for D review. No brief update starts a chat.

| Chat | Roadmap milestone | Dependency and deliverable |
| --- | --- | --- |
| [PTU 01 - Foundation and documentation gates](workstreams/01-foundation.md) | 1 | Maintain documented PR/CI/protection gates; do not repeat completed setup. |
| [PTU 02 - Content recovery and Foundry integration](workstreams/02-content-foundry.md) | 2 | Reuse the installed v13.351 pack baseline and reconcile content; owner activation is complete. |
| [PTU 03 - Core skill terminology compatibility](workstreams/03-skills.md) | 3 | Finish terminology compatibility using 02 for in-world validation. |
| [PTU 04 - Rules sources and revision catalog](workstreams/04-rules-catalog.md) | 4 (sources) | Sole writer explicitly assigned to frozen D after accepted P01; stop for D review before E1. |
| [PTU 05 - Rule variants and selection migrations](workstreams/05-revision-selection.md) | 4 (implementation) | Use accepted 04 decisions and 02 baseline for variants/settings/migrations. |
| [PTU 06 - Core gameplay calculations](workstreams/06-core-gameplay.md) | 5 (shared behavior) | Use 02 and 04, coordinating effective-rule interfaces with 05. |
| [PTU 07 - Move data and behavior verification](workstreams/07-move-verification.md) | 5 (moves) | Audit bounded move families using accepted 04–06 behavior. |
| [PTU 08 - Assisted gameplay automation](workstreams/08-assisted-automation.md) | 6 (automation) | Automate verified subsystems from 04–07 with preview/apply safeguards. |
| [PTU 09 - Upgrade validation and releases](workstreams/09-release-validation.md) | 6 (release) | Validate the selected release scope after all applicable gates; publication needs explicit authorization. |

## Start and context protocol

1. The initial chat message is a parked brief. It requests only a one-line acknowledgement and forbids tool calls or project work. There are no goals, timers, automations or automatic handoffs.
2. Start a section by telling that chat to begin the next scoped batch. An example is: “Resume PTU 02: complete the remaining Generations 1–8 acceptance work in the updated brief; reuse completed checks and stop with a concise handoff.”
3. On start, read the repository rules, shared status and assigned brief first. Read only dependency handoffs and files needed for the next bounded batch. Do not import this planning conversation, all other chats, the full PDF corpus or the full move ledger into every context.
4. Reuse recorded provenance and passing checks when inputs and the tested commit remain applicable. Search for specific rules/pages and ledger entries. Run related tests once per batch; rerun affected checks after changes. Release validation remains comprehensive.
5. Preserve user-provided model guidance in AGENTS.md. Keep a model stable through a coherent batch; do not claim instruction text changed a model setting. No model recommendation or override is introduced by this split.

## Shared checkout and handoffs

All chats point to the same checkout, not isolated copies. Only one may edit files, switch branches, commit or run the shared Foundry world at a time. Do not use concurrent chat activity as permission to overwrite work. Check for dirty files and an active owner before mutations; if another chat owns the batch, wait for the owner to coordinate. Create separate worktrees only if the owner explicitly requests them. Read-only source analysis can proceed independently only when explicitly started.

Keep cross-chat state in short versioned handoffs in each section file: tested commit, PR, changes, authoritative decisions, tests/results, unresolved issues, next action, and affected interfaces. Include uncertainty. The next chat must check dependencies against the current repository rather than relying on conversation memory. The coordinator/owner decides when to start another section; section completion never starts another chat automatically.

## Existing baseline to reuse

Draft PR [#4](https://github.com/MrMints/ptu_1.05/pull/4), original implementation commit `a38f7f5c13db408d4bb28febffe921589039dd9e`: project rules/gates, eight skill-label corrections, 7,395 source documents in 15 packs, source checksums and a 1,184-move ledger. The original CI run passed. Structural checks do not establish rules correctness. Foundry reached license activation; no in-world scenario was certified. There are 682 unresolved explicit compendium targets to investigate, including historical metadata. This baseline is not a completed release.

The subsequent [PTU 02 pack baseline](validation/2026-10-24-foundry-packs.md) records owner activation, world startup and all-pack loading in v13.351. Gameplay, permissions and content repairs remain open; use the section handoff for the current shared-session state.

The [reference investigation](validation/2026-10-25-compendium-references.md) records all 682 targets: 658 provenance targets with a legacy runtime caveat and 24 active missing targets. Under the corrected scope, their currently recorded active consumers are excluded Generation 9 content; those consumer-only repairs no longer block Generations 1–8. Preserve the diagnostic results and investigate any independently evidenced in-scope consumer. Source content and UUIDs remain unchanged.

Track integration/content/skills under [#1](https://github.com/MrMints/ptu_1.05/issues/1), rules/catalog/selection under [#2](https://github.com/MrMints/ptu_1.05/issues/2), and gameplay/moves/automation/releases under [#3](https://github.com/MrMints/ptu_1.05/issues/3). Narrower issues may be created during authorized work when useful.

