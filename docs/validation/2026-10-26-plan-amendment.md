# Owner selection/prerequisite plan amendment

Baseline: `49561d92c8021b6393cd916a48e9696c55b48ef5`, branch `codex/ptu-foundation`, existing draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4). The owner authorized a documentation-only amendment after 04 released the clean checkout. The private chat assessments were reconciled into the public [pre-05 ledger](../PRE_05_RECONCILIATION.md); their acknowledgment is not implementation acceptance.

## Changes

Shared project/contribution/scope/roadmap/chat/status/testing policy and all nine workstream briefs now require source-backed selectable original/revised alternatives for Moves, Abilities, Features and Edges, plus visible persistent itemized non-blocking Feature/Edge prerequisite diagnostics. The ledger assigns sequential 03 evaluator/solver, 02 preservation/acquisition/display, 01 evidence and 04 source corrections with actual observed acceptance requirements. 05 and D remain held under that dependency disposition. Existing accepted evidence keeps its original limits.

The only source-catalog data change is two matching policy strings in Hero's Journey (`r04-r0168`): its printed three-versus-four-rank conflict remains unresolved, but manual adjudication of affected behavior no longer blocks acquisition. No source definition, citation, edition, ID, interpretation or frozen work membership is changed. C source-examination acceptance is recorded in prose; its older machine-ledger pending state is explicitly left for 04's next authorized reconciliation.

## Validation

- Passed: 12 focused tests (`documentation.test.mjs` plus the 11 catalog tests), using `node --test --test-isolation=none`; no tests were added for this policy-only edit.
- Passed: `node tools/rules-catalog.mjs` and `node tools/validate.mjs` (17 skill mappings, 15 packs and 7,395 inherited source documents). These establish structure/integrity, not gameplay.
- Passed: 122 changed-document local file links; all nine briefs reference the contract; semantic JSON comparison permits exactly `/entries/167/conflict/details/0` and `/entries/167/reviewDisposition/question`; no runtime/pack/tool/test/manifest/dependency changes.
- Passed: repository-configured `git diff --check`. An earlier ad-hoc check disabled Windows newline normalization and falsely treated existing CRLF lines as trailing whitespace; the normal check passes without content repair or Git configuration changes.
- Normal Documentation/Validation CI is required on the pushed documentation revision, with its result in the completion handoff; baseline C's green run does not certify this new revision. External PR/issue metadata is deliberately unchanged for this batch; the current amendment is documented in this same PR's files and changelog.

## Compatibility

No runtime, pack, migration code, world data, production policy, original references, version or model settings change. Stable IDs, macro paths, skill keys and saved/custom choices remain unchanged. Legacy migration/refresh/failure findings are inspected risks requiring reproduction and bounded correction, not claims of observed campaign corruption. No destructive migration is selected by this plan.

## Limitations

This batch implements policy/documentation only. It does not implement or verify variant selection, advisory warnings, new acquisition routes or migration safeguards. No Foundry session, gameplay test, migration execution or local packaging run is performed; unchanged historical results are reused within their stated limits. Automated documentation checks establish structure, not factual accuracy or complete runtime behavior. Numbered implementation chats remain idle pending explicit assignment. No issue/PR metadata edit, default-branch update, merge, release or publication is performed.

## References

Owner amendment dated 2026-10-25; [reconciliation and required proof](../PRE_05_RECONCILIATION.md); [scope](../SCOPE.md); [source guide](../RULES_SOURCES.md); [02 evidence](2026-10-25-corrective02.md); [03 evidence](2026-10-25-skills.md); [C source evidence](2026-10-25-record-batches.md#complete-c-source-evidence); related issues [#1](https://github.com/MrMints/ptu_1.05/issues/1), [#2](https://github.com/MrMints/ptu_1.05/issues/2), [#3](https://github.com/MrMints/ptu_1.05/issues/3).
