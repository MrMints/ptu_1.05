# Changelog

## Unreleased

### Project foundation
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
