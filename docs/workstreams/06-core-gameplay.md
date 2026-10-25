# PTU 06 - Core gameplay calculations

Status: NOT STARTED. Creation of a chat is not authorization to work. Wait for the owner to explicitly start this section. No tool calls, research, edits, tests, commits, messages or background work before that instruction.

## On explicit start

Read [the scope policy](../SCOPE.md) first: **Generations 1–8 only; Generation 9 and later excluded**. This overrides broader earlier prompts and handoffs. Do not recover, verify, automate or ship excluded content as supported. Preserve historical evidence, campaign data and IDs; assess older/shared targets independently. Inventory counts are not supported-scope totals, and physical exclusion is not yet complete. An instruction update alone does not start this chat.

Read `AGENTS.md`, `docs/CHAT_PLAN.md`, `docs/STATUS.md` and this file. Check the current branch, working tree and relevant dependency handoffs. The saved baseline may be stale; do not repeat completed work. Only one chat may edit the shared checkout or use the shared Foundry data directory at a time.

## Dependencies
Working v13.351 baseline from chat 02 and authoritative source decisions from chat 04. Coordinate rule-switch interfaces with chat 05 before claiming variant correctness.

## Scope
Stabilize shared accuracy, evasion, damage, STAB, effectiveness, criticals, rounding, boundary values, conditions and turn behavior. Prioritize data loss/startup problems and incorrect gameplay. Every fix needs a reproducible case and authoritative source. Extend current rule elements incrementally; keep pure calculation separate from document mutation.

## Targeted context
Only relevant combat/check/damage/condition/rule-element modules, source catalog entries and existing focused tests. docs/TESTING.md and GitHub issue #3.

## Completion gate
Shared calculations match selected rules under boundary tests and relevant Foundry token/permission/turn-transition checks; unresolved behavior and manual portions are recorded.

## Outside this scope
Move-by-move data review, broad actor refactors, content-version UX and new release publication.

## Handoff
When an authorized batch ends, record its commit/PR, changed files, source decisions, exact tests and outcomes, unresolved issues, next bounded action and downstream interface changes here. Keep this concise; link larger evidence instead of copying it. Update relevant status/ledger/changelog documentation in the same PR. Report implemented, verified and automated separately. Do not start or message another chat automatically.

