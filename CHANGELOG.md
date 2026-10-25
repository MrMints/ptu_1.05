# Changelog

## Unreleased

### PTU 03 skill compatibility
- Accept the core Technology Edu abbreviation and normalize NPC prerequisite spacing; reject rank phrases embedded in unknown text and unknown skill names in skill lists.
- Resolve core/Carbon names in the legacy species helper through stable skill keys, and use consistent labels for skill modifier helpers without changing numerical calculations.
- Wrap the longer core Education labels between words in existing actor skill columns.
- Correct nine explicit skill text fields in eight inherited source documents; preserve proper titles, class names, IDs, rules and provenance. Record the selective review and unchanged-data hashes; content approval remains separate.
- Add all-17 skill numeric/presentation checks, source-change guards and a disposable Foundry acceptance runner. See the section-03 handoff for verified runtime coverage and remaining limitations.

### PTU 02 integration and compatibility
- Read current Foundry compendium identity before legacy sourceId flags without rewriting provenance or deriving identity from names. Preserve owned quantity (including zero), disabled state, labels and custom SVG images during refresh; leave missing/custom sources unchanged.
- Replace disposable setup merging with a locked, staged system replacement and a recoverable backup. Refuse active Foundry data and unsafe paths; preserve licensing, configuration and worlds.
- Report missing starter training instead of throwing during trainer creation; the original `edges.xiZydXM8sex5CP7O` identity remains unresolved. Avoid observer-sheet initialization writes.
- Add focused compatibility/setup tests and a Generation 1 integration runner. Record the acceptance matrix and remaining content/release blockers in `docs/validation/2026-10-25-foundry-integration.md`; this is not rules, campaign-upgrade or release certification.

- Limit the project plan and all nine chat instructions to approved Generations 1–8 content; exclude Generation 9 and later from supported recovery, variants, verification, automation and releases. Reclassify the current 24-target consumer-only recovery backlog as outside acceptance while preserving historical evidence and shared older-content dependencies. Physical pack/UI exclusion remains pending; no campaign data or content IDs are removed.

- Prepare PTU 02's remaining acceptance instructions: bounded identity-backed recovery, legacy source-reference compatibility, safe disposable setup, grouped integration checks, and an explicit completed-versus-blocked handoff. Implementation remains paused until an explicit start.

### Compendium reference investigation
- Classify all 682 unresolved targets with field-level evidence: 658 historical provenance targets and 24 active rule/species targets across three records; preserve the legacy sourceId runtime caveat.
- Confirm the 24 active targets are missing in v13.351, reproduce omitted generator content and a TemporarySpecies null dereference, and record explicit unresolved dispositions after checking two historical snapshots.
- Add a repeatable reference audit, coverage tests and disposable-world diagnostics. Preserve all source records, UUIDs and historical metadata pending authoritative identity evidence.

### Foundry installation and packs
- Verify owner-activated Foundry v13.351 startup and all 15 declared packs in the disposable world; record the clean archive installation and pack-loading evidence.
- Add a repeatable GM diagnostic that compares pack indexes, loaded documents and folders against source IDs and reports invalid records. Gameplay, permissions and unresolved reference targets remain separate acceptance work.
- Document setup warnings and the setup helper's merge behavior, including how to test a clean archive copy.

### Project foundation
- Split the roadmap into nine scoped, initially idle project chats with dependency gates, focused context, shared-checkout coordination and concise handoffs; correct the move-ledger path in the roadmap.
- Establish repository-local documentation, source provenance, verification tracking, build tooling, and PR documentation checks.
- Replace inherited publishing and cross-repository data-sync workflows with PR validation and an explicit draft-release workflow.
- Recover historical compendium sources with stable IDs. Recovery establishes a starting point, not PTU 1.05 rules correctness; see the recovery report.
- Keep local reference PDFs and disposable Foundry data outside Git and release archives.

### Skill terminology
- Restore Pokémon Education, Medicine Education, General Education, Technology Education, Occult Education, Charm, Focus, and Intimidate.
- Preserve internal skill keys and accept former Carbon names when parsing prerequisites.
- Present corrected names on existing actor background selectors without rewriting stored ranks or modifiers.
- Replace label-dependent Education classification in the legacy helper with explicit skill keys.

### Compatibility and limitations
- Target Foundry v13.351 for testing; compatibility claims advance only after integration verification.
- Standard/revised rules selection and comprehensive move automation remain tracked work until their acceptance evidence is recorded.
- Historical packs contain inherited PTR content and may predate later Carbon edits. Missing or conflicting content is not silently treated as verified.
