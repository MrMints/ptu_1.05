# PTU 03 - Core skill terminology compatibility

Status: Section-03 terminology acceptance completed on 2026-10-25 within the documented interfaces/limits. Stopped at final handoff. Other chats remain idle; no section, merge or release is started automatically.

## On explicit start

Read [the scope policy](../SCOPE.md) first: **Generations 1–8 only; Generation 9 and later excluded**. This overrides broader earlier prompts and handoffs. Do not recover, verify, automate or ship excluded content as supported. Preserve historical evidence, campaign data and IDs; assess older/shared targets independently. Inventory counts are not supported-scope totals, and physical exclusion is not yet complete. An instruction update alone does not start this chat.

Read `AGENTS.md`, `docs/CHAT_PLAN.md`, `docs/STATUS.md` and this file. Check the current branch, working tree and relevant dependency handoffs. The saved baseline may be stale; do not repeat completed work. Only one chat may edit the shared checkout or use the shared Foundry data directory at a time.

## Dependencies
Content/Foundry chat provides a working disposable world for integration checks. Static review may begin separately only when explicitly started.

## Scope
Complete acceptance of the eight existing label corrections across all 17 skills: both English namespaces, template defaults, existing actors, prerequisites, generators, backgrounds, dialogs, sheets, chat and macros. Preserve every stable key, numeric value, modifier, selector and macro interface. Accept documented core/Carbon names and abbreviations with case/space/accent normalization; reject unknown names. Correct system-owned references selectively and classify Education skills by keys.

## Targeted context
docs/SKILLS.md; src/util/skills.js; tests/skills.test.mjs; relevant skill, actor sheet, NPC builder and localization files; local core PDF pages 33, 38, 41–45, 48 and 50. GitHub issue #1.

## Completion gate
Core names appear consistently and existing/generated actors, prerequisites and supported macros retain numerical behavior. No database-key migration or global prose replacement.

## Outside this scope
Unrelated skill-balance changes, class-name rewrites, general rules variants and move audits.

## Handoff
When an authorized batch ends, record its commit/PR, changed files, source decisions, exact tests and outcomes, unresolved issues, next bounded action and downstream interface changes here. Keep this concise; link larger evidence instead of copying it. Update relevant status/ledger/changelog documentation in the same PR. Report implemented, verified and automated separately. Do not start or message another chat automatically.

## Final handoff — 2026-10-25

- Tested runtime/content/CSS commit: `1c586021e192cc28111c84189cb07b3a84828501`, branch `codex/ptu-foundation`, draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). Follow-up test-runner/evidence changes do not alter runtime/pack inputs. Full [matrix, reproduction and limitations](../validation/2026-10-25-skills.md), [raw JSON](../validation/2026-10-25-skills.json) and [selective source review](../data/skill-terminology-review.json) are in this PR.
- Implemented: legacy species helper resolves known core/Carbon names to stable keys; Technology Edu/Tech Edu aliases; whitespace-normalized whole-expression NPC skill prerequisites; consistent action/modifier labels; actor Education word wrapping; nine exact text-field corrections in eight inherited documents. Changed runtime files are `src/util/skills.js`, actor `base.js`, `modifiers.js`, Pokémon `skills.js`, NPC builder `document.js` and `static/css/main.css`. Both English namespaces/template defaults reuse the verified baseline.
- Verified: all 17 skills on saved/generated trainer/Pokémon fixtures; 183 real parser cases, unknown/list/OR/count forms, background calculations, four sheet types, 34 real macro/API rolls with numeric/formula/selector/chat/callback checks, 68 dialogs, manual contested DC/outcome, all eight installed document IDs/text fields, exact skill data and populated background selections after form close/client reload. Generation 1 Bulbasaur uses the same authoritative UUID as 02. No Generation 9 gameplay tests or content approval.
- Automated: 23/23 Node tests, including 7 skill tests; validation (17 skills, 15 packs, 7,395 inherited sources), all-pack semantic round trips, changed-JS syntax and final archive pass. Archive SHA-256/size and all 3,495 matching runtime/static files are recorded. Initial Windows fixture rename EPERM and test-harness assertion corrections are documented, with passing affected/final runs. Real Foundry assertions ran through the GM macro; CI repeats Node/source/pack/build checks, not UI actions.
- Compatibility: all stable keys, UUIDs, macro paths, selectors, numeric rules/modifiers, titles/class names and provenance retained. No database-key migration, global prose rewrite or campaign modification. Use stable keys at macro/property boundaries; alias acceptance is a parsing boundary. `PTUModifier` retains its prior sluggification, including Education modifier slugs.
- Limits/blockers: empty Pokémon background slots may normalize from `""` to inherited `"blank"` when the form closes; numerical data and real selections are preserved, and exact empty-placeholder preservation is not claimed. Starter training `edges.xiZydXM8sex5CP7O`, content approval/classification and safe Gen 9 release/acquisition exclusion remain 02/04/05/09 dependencies. Transform's optional skill copying remains explicitly unreviewed. Broad campaign upgrades/rules/variants/moves/other macros/general layout are not certified.
- Shared state: world returned to Setup, owned server handle terminal (Ctrl+C exit 1), port 30001 refuses connections; no final graceful shutdown log line captured. Final runtime installed with recoverable backups. Three section-03 actors, two extra tokens and one diagnostic macro remain flagged in the disposable world. Other chats were not started or messaged. Next owner action: review this handoff and choose the next section explicitly. Stop here; no automatic handoff, merge or release.

