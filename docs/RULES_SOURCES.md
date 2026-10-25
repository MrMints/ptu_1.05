# Rules sources and optional revisions

The owner-selected PTU 1.05 core remains the standard baseline. Supported content ends at Generation 8 under [SCOPE.md](SCOPE.md). An optional source interpretation does not approve an inherited pack record, certify gameplay, or change a campaign selection.

## Catalog artifacts

| Artifact | Evidence and limits |
| --- | --- |
| [Reference inventory](data/references.json) | The existing 26 paths, SHA-256 hashes, page counts and review metadata are preserved. There are 18 unique hashes and eight duplicate paths. |
| [Source authority and coverage](data/source-authority.json) | One coverage/disposition per unique hash, aliases, edition limits, page conventions and completed required supplemental ranges. |
| [Revision catalog](data/rules-revisions.json) | 283 playtest entries: 56 May 2015, 35 September 2015 and 192 February 2016. Six additional entries record Hisui guidance and Porygon edition limitations. Each has baseline/revised interpretation, source hashes/pages, precedence, proposed selection unit and conflict disposition. Summaries do not replace full rules text. |
| [Supplemental source units](data/supplement-rules-catalog.json) | 699 current-source units: Blessed 235, Porygon 241, Throhs 223. Each has source hash/pages, interpretation, core relationship or optional addition/variant, dependencies, selection unit and a specific disposition. Tables retain their options. |
| [Dex comparison](data/dex-source-comparison.json) | All 747 old-versus-plus positions and all 450 changed candidates have substantive source interpretations. Field deltas distinguish optional changes, editorial corrections, wrapping and appended form rules. Bellossom's duplicate printed slot labels survive extraction; Scizor is punctuation only. These are not 450 approved inherited species. |
| [Regional profiles](data/regional-dex-catalog.json) | All 259 profiles: Alola 114, Galar 118, Hisui 27. Profile facts, acquisition-table fingerprints/counts, form-rule interpretations, source/combined coordinates, edition limits and selection implications are recorded; covers, contents and Hisui guidance account for all other pages. Whole movelists remain local. |
| [Bulbasaur review](data/bulbasaur-source-review.json) | Exact stable species/ability relationships, standard/plus attribution, remaining field mismatches and finite historical evidence. |
| [Reconciliation ledger](data/content-reconciliation-search.json) | Prior searches preserved; section-04 dispositions cover all 12 earlier-only IDs and missing enhancement/Carbon evidence. |
| [Inherited record classification](data/record-source-classification.json) | Separate source-review snapshot with exact inventory IDs/hashes. Initial checkpoint: 92 reviewed, three preserved owner exclusions, zero unresolved record identities in this checkpoint and 7,300 explicitly unreviewed. Broader diagnostics remain work in progress; no production approval is promoted. |
| [Initial dependency dispositions](data/record-dependency-review.json) | All 87 relationships from the six eligible roots: source/target hashes, actual UUID paths, identity/generation/version/field findings and acquisition evidence. Target definitions and source-record membership are separate checks. |

`r04-*` identifiers are catalog coordinates. They are not document IDs, slugs or migrations. Labels help a reader find a topic; they never authorize a runtime identity mapping. The catalog leaves runtime mappings unestablished unless exact export/relationship evidence is recorded. Huge Power and Pure Power retain separate canonical coordinates despite one combined printed revision.

## Authority and editions

Use May, September and February as separately selected optional versions. A later explicit entry supersedes an earlier entry only within the selected revised lineage. February's Gluttony adds a per-Scene buff-use limit to May's changes; February's Sequence drops September's allied qualifier; February's Eggscellence adds a Normal-type qualification. These are explicit version differences, not permission to edit standard content.

The supplied combined dex has identical whitespace-normalized page text to the following sequence:

| Component PDF | Combined PDF pages | Offset |
| --- | --- | --- |
| Old 1.05 dex, 747 pages | 1–747 | 0 |
| Ultra Alola booklet version 10, 117 pages | 748–864 | 747 |
| Galar plus Armor/Crown, 120 pages | 865–984 | 864 |
| Hisui, 30 pages | 985–1014 | 984 |

This is text-composition evidence, not byte/image identity. The combined title does not make its old profiles a revised edition. Duplicate hashes likewise supply aliases, not independent corroboration.

Bulbasaur `species.QE7WhquxeuebiEVQ` has the five ability slots printed in the supplied 1.05+ dex p.12. The old/combined p.12 profile instead supplies the standard-era slots. February's removed Photosynthesis/new Empower corroborates the optional lineage, but the exact publication date/pairing of the supplied plus PDF is not proven. The inherited machine list contains Work Up and omits four HM entries from all three compared profiles; its tutor list omits Sleep Talk, which remains in its machine list. These fields prevent whole-record approval. Existing eligibility, unclassified rule approval and integration-fixture status remain unchanged. No species or ability list was rewritten.

The fantasy, science-fiction and legendary books describe optional toolkits. They do not silently amend core. Hisui's advice about newer movelists, merged Tutor lists and evolution requirements is source evidence for optional choices, not instructions to fetch or adopt newer-game data. Generation 9 remains excluded.

## Page references

All PDF references are one-based. Use printed and PDF numbers separately. On the numbered core, playtest and dex pages cited in the catalog, they agree. `Indices and Reference.pdf` starts at printed 303 on PDF page 1; its excerpt offset is +302. Its separate-file page number must never be cited as printed page 1. Covers, character sheets and standalone charts use PDF-only references unless a printed label is verified. Do not infer full-document equality with core from the excerpt's offset or cover.

## Conflicts and manual choices

Review categories separate rule ambiguity, missing source/identity evidence, optional campaign selection and implementation design for 05. All 289 revision/guidance entries have this classification: 14 rule questions, six source/identity evidence limits, two optional campaign choices and 267 implementation-design dispositions. The supplemental catalog records 106 rule questions, 41 source/identity evidence limits, 89 optional campaign choices, 462 implementation-design dispositions and one source-label correction. These are unit counts, not distinct questions or gameplay approvals. Important decisions include:

| Source issue | Required disposition before affected implementation |
| --- | --- |
| May p.3 Hero's Journey | Choose three or four ranks; the printed header and prerequisite list disagree. |
| May Books / September Medic | Specify AP Drain versus Binding lifecycle for combined use. Retain rank prerequisites and rest behavior. |
| September p.7 Affliction Techniques | Decide how core Hyper Cures' old Medical Techniques prerequisite qualifies after replacement. |
| September capture | Specify conversion/rounding for nonmultiples of five, milestone/level handling and omitted natural-roll interactions; never mix d100 targets and d20 modifiers. |
| September armor | Resolve omitted Heavy Armor Speed penalty and Special Armor price before affected implementation. |
| General Research, Cheerleader and shield replacements | Explicit replacement, nonstacking, saved choices and refund UI belong to already-authorized 05 design after owner start. They are not requests for extra permission to read/catalog the source. |
| February p.7 Mummy | Printed effect names the user's own Ability. Choose literal behavior or a documented correction; no silent attacker-target substitution. |
| February p.8 Sap Sipper | Resolve bare Scene frequency, missing action/trigger and immunity timing. |
| February p.12 Combo Striker | Resolve recursive free Struggle chains before automation; no invented cap. |
| Core p.330 Solid Rock / core p.236 chart | Record the standard multiplier ruling; February DR does not retroactively correct standard. |
| February p.1 Twisted Power / September p.9 Mixed Power | February calls it a Poké Edge but supplies no new edge block. Specify identity/effect and nonstacking treatment; old class grants explicitly retain old abilities. |
| Optional combinations | Review Defense Curl/Withdraw connections, changed conditions, Books/Inheritance timing and source-specific species slots. Undefined combinations remain manual. |
| Porygon pp.70/77 Digital Avatar | Same edition gives 2d6 Technology versus 3d6 only if no prior skill; page order is not explicit errata. |
| Porygon p.58 augmentation example | Medical Nanobots capacity2 plus Dermal Plating3 totals5; example says6. Resolve the example without silently changing item costs. |
| Porygon pp.65–66 vehicle example | Aggregate calculation reaches46 Breach, then prose calls34 the disabling threshold. Preserve the general formula and conflicting worked example separately. |
| Blessed pp.29–30/ 37 Concept Aura | Eight gods/sixteen Types conflicts with nine/eighteen examples; no complete unmatched-concept-to-aura map is supplied. Legacy Body/Mind/Spirit and some Feature references also lack a current counterpart. |
| Dex evolution chains | Old Vullaby/Mandibuzz and nine plus chains disagree internally, including Gurdurr's printed minimum 250 versus 20 on adjacent line profiles. Source order supplies no precedence. |

Manual disposition is not an implementation blocker for every unrelated topic. It is a requirement to keep the affected behavior visibly unverified until resolved. The catalog does not claim standard/revised variants, settings or automatic compatibility checks exist.

## Completed readable coverage and remaining evidence

Core supports the rule concepts behind all 12 earlier-only Poké Edge IDs. That does not establish a destination UUID or authority to undo later removals. Preserve their historical exports. The owner must choose retention/reintroduction with an exact relationship map before implementation. A manifest declaration cannot reconstruct the missing enhancements database; the four previously selected Carbon snapshots still lack their matching manifests. Needed evidence remains original complete DB/JSON exports with IDs and relationships. No Generation 9-only recovery resumed.

All required readable supplemental coverage is complete: Throhs pp. 31–45,47–93 and creation 105/120; Porygon pp. 21–39,41–87; Blessed pp. 36–71. Class introductions are tied to their rules units; Porygon75/87 are chapter covers. Optional module adoption is an in-game configuration decision and never a prerequisite to cataloging. Type Sync is a shared reprint with a consistent core rank formula; Weapon of Choice reprints core p.55. Neither creates a new permission/rules blocker.

Earlier Porygon editions, Blessed's referenced edition notes/legacy definitions and exact missing exports remain unavailable for their specific historical/identity questions. This limits those comparisons, not current-source interpretation. All dex candidates and regional source profiles are interpreted; inherited record/UUID relationships, whole-record data approval and behavioral verification remain separate downstream work. No newer-game lookup or Generation9 recovery is needed to finish this catalog. Final section acceptance is for owner review with these finite rulings/evidence limits visible.

## Implementation handoff and validation

The readable-source subgate was accepted at `a35cec20`; full section 04 remains held for inherited-record classification. The first batch covers 88 distinct source/target records; four additional extraction regressions retain independently corroborated profiles. Of 92 reviewed records, 55 are standard-source topics, 1 matches an optional version, 27 are mixed and 9 are supporting helpers. A reviewed mixed record may retain precise conflicts or unprinted fields; it is not an approved playable record.

Findings include Tackle DB 4 versus core p.411 DB 5, Energy Ball range 4 versus core p.380 range 8, Empower Rapid versus February p.12 Swift, altered Return/Frustration formulas and incomplete Training helper lifecycle encoding. Bulbasaur's machine Work Up link lacks plus p.12 support. Core p.206 adds a Mega Ability rather than replacing the current list; unprinted secondary form fields are not silently inherited. Darmanitan's learning schedule is unchanged and editorial; both sourced values are preserved.

Remaining families continue with definition-level anchors, competing candidates and explicit normative-field coverage. A failed parser/name index or available candidate awaiting review is unreviewed work. Similarity ranks candidates; it does not establish identity, an entire version or approval. [Record validation/current remaining work](validation/2026-10-25-record-sources.md) records this correction separately from accepted readable coverage.

Section 05, only after explicit owner start, should use accepted source decisions to design individually selected Feature/Edge/Move/Ability versions, independent general mechanic settings, compatibility constraints and explicit replacements. Standard must remain the new-world default. Preserve existing `ptu` IDs, UUIDs, macro paths, user content and campaign choices. Promote classifications into runtime/build policy in a separate reviewed change with exact record hashes, identities and tested behavior. These source artifacts are deliberately not read by production eligibility policy.

Run `node tools/rules-catalog.mjs` and `node --test --test-isolation=none tests/rules-catalog.test.mjs` for catalog checks. CI uses the normal test runner. With local supplied references and `pypdf`, `python tools/reference-catalog.py --check` checks hashes/pages/duplicate relationships without rewriting metadata. Refresh refuses changed hashes or missing reviewed files; ordinary refresh preserves existing review fields.

CI validates the catalog's structure and internal consistency. It does not receive the local PDFs, repeat their extraction, or certify the source interpretations.

See [section-04 validation](validation/2026-10-25-rules-catalog.md) and the [handoff](workstreams/04-rules-catalog.md). Structural validation and source comparisons are automated evidence; no gameplay, migration or move-behavior certification was performed here.
