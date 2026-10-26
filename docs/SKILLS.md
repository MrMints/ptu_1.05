# Core skill terminology and compatibility

The Carbon conversion (`cac202abb44b2a3a1df0a1302d12814dbd2249b2`) changed skill labels and identifiers. A later correction (`907adef5c99fd2e591d0f03889e7f06519ede90a`) restored identifiers while leaving the labels. The inspected history does not explain why those particular labels were chosen.

| Core name | Legacy label | Persistent identifier |
|---|---|---|
| Pokémon Education | Zoology | pokemonEd |
| Medicine Education | Biochemistry | medicineEd |
| General Education | Education | generalEd |
| Technology Education | Engineering | techEd |
| Occult Education | Occultism | occultEd |
| Charm | Charisma | charm |
| Focus | Willpower | focus |
| Intimidate | Intimidation | intimidate |

Evidence: local `Core System/Pokemon Tabletop United 1.05 Core.pdf`, PDF pages 33, 38, 41–45, 48 and 50. Document identity and checksums are in `data/references.json`.

`src/util/skills.js` owns labels and exact name resolution. Parsing accepts stable keys, core names, established abbreviations and Carbon aliases, normalizing case, whitespace and accents. Unknown names return null. A sheet presentation copy corrects built-in names without updating saved values. Both English translation namespaces and new-actor defaults use core names. Education classification uses the five explicit keys.

No database-key migration is introduced. Macro selectors and calculation paths remain stable. Historical chat and user-authored prose are not rewritten. The legacy species helper resolves known core/Carbon input names into the existing keys; it ignores unknown names without creating new skill entries. The current species generator already consumes stable skill keys.

The NPC prerequisite parser normalizes whitespace before evaluating exact skill names. Core abbreviations include `Medicine Edu` and `Technology Edu` (core pp. 42, 45). A rank embedded in unknown text is not a valid skill prerequisite. Known alternatives and minimum ranks retain their existing meaning.

The [selective terminology review](data/skill-terminology-review.json) records all 17 inherited documents containing the eight former labels. Nine text fields in eight documents change only an unambiguous `Intimidation` skill reference to `Intimidate` (core p. 38). Proper names such as **Flustering Charisma**, **DIY Engineering**, **Researcher (Occultism)**, the **Willpower** aura and Azelf's narrative title remain intact. Numeric rules, UUIDs, slugs, class names and historical provenance are unchanged. These inherited records remain unclassified for content/version approval; a terminology correction does not approve their gameplay or expand supported scope.

## Supported skill macro interfaces

Use stable keys for actor properties and selectors. For example, `actor.attributes.skills.pokemonEd.roll({targets: []})` rolls Pokémon Education; `actor.prepareSkill('focus').roll()` rolls Focus. Existing callbacks, targets, DCs, options and selectors such as `skill-pokemonEd` remain supported. Display names and translated strings are not actor-property keys. Name aliases are accepted at the documented parsing boundary, not as new persistent properties.

The exported legacy `PTUSkills.calculate({actor, context: {skill: 'pokemonEd', options: []}})` and `createSkillModifier({actor, skill: 'pokemonEd', domains: []})` retain stable keys, dice and modifiers. Their labels use the same core/localized presentation. The inherited Transform macro explicitly marks itself unreviewed; its optional skill-copying mode is outside supported skill-macro acceptance.

Foundry acceptance results and limitations are recorded in the [section-03 validation report](validation/2026-10-25-skills.md) and [handoff](workstreams/03-skills.md). Supported gameplay fixtures use Generation 1 species identities under [SCOPE.md](SCOPE.md); no Generation 9 behavior is certified.

## Advisory prerequisite interface (P03)

Import `diagnosePrerequisites`, `evaluatePrerequisite` and `formatPrerequisiteDiagnostics` from `src/util/prerequisites.js`. They are synchronous and perform no document lookups, writes, grants, skill increases or permission checks. For an owned Item or snapshot, call `diagnosePrerequisites({actor, item, selectedVersion, references})`. Supply prepared skill ranks at `actor.system.skills[key].value.total`, level at `actor.system.level.current` and the actual owned Item collection. Missing data remains unverifiable. Do not substitute a browser summary for `item.system.prerequisites`.

The report contains `schemaVersion: 1`, `advisory: true`, item/actor/source identity, a copied `selectedVersion`, complete `rawRequirements`, `attributionIssues`, and individual `requirements` partitioned into `satisfied`, `unmet` and `unverifiable`. Supply an evidenced selected-version string or metadata object explicitly; the evaluator does not infer a rules edition from a display name, catalog coordinate, software version or world default. Missing version attribution is reported separately. `references` is an object or Map of exact requirement text to an evidenced UUID (or `{uuid}`), not a name search. Modern compendium provenance takes precedence over the legacy flag; a rename does not change identity. Without such a relationship, textual Item names remain unverifiable.

P02-A validates attribution shape without defining production variants: a nonblank string,
or a non-array object with a nonblank string `id` or `label`, supplies explicit context.
Empty objects, blank strings, arrays and unrelated scalars remain unchanged in the report
and saved flag, but produce `rule-version-unestablished`. This never changes satisfied
requirements to unmet and does not approve the supplied edition/source claim.

Supported exact forms include single minimum skills, levels, explicit OR, inherited-rank alternatives, minimum skill counts, explicit skill lists and counts of evidenced Item identities. Alias-equivalent skills count once. A shared-rank list with an explicit final OR follows core p. 38's Grace wording. A bare comma compound such as `Adept Athletics, Novice Combat` remains unverifiable, even if one clause is satisfied. Commas inside explicit count/list grammar retain their list meaning. Custom syntax and textual `GM Permission` without approval evidence remain unverifiable; the current GM user's identity is not approval evidence.

`formatPrerequisiteDiagnostics(report)` returns escaped-by-consumer text lists `{unmet, unknown}` with raw requirements, identity/source/version and known required/current values. Render them as text, never unescaped HTML. The NPC panel uses these lists; ranks and explicit selections survive refresh. `NpcQuickBuildData.checkTextPrereq` and `allItemPrereqs` retain their callable compatibility shapes, but grant/rank/automatic-choice proposal fields are deliberately empty. Optional randomizers still filter known-unmet candidates using a hypothetical skill ceiling; explicit selection remains available. Explicit randomize actions can change the draft and are not passive prerequisite evaluation.

P02-A connects this interface to derived trainer/Pokémon and owned Item reports, actor/embedded-input refresh hooks and the supported acquisition routes. Reports survive through saved raw inputs rather than persisted report flags; ordinary ownership, scope and genuine choices remain. See the [P02-A observations and limits](validation/2026-10-26-p02a.md), pending substantive acceptance, and the accepted [P03 interface evidence](validation/2026-10-26-p03.md). No production variant selector is installed.
