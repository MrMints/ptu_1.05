# Rules sources and optional revisions

The owner-selected PTU 1.05 core remains the standard baseline. Supported content ends at Generation 8 under [SCOPE.md](SCOPE.md). An optional source interpretation does not approve an inherited pack record, certify gameplay, or change a campaign selection.

## Catalog artifacts

| Artifact | Evidence and limits |
| --- | --- |
| [Reference inventory](data/references.json) | The existing 26 paths, SHA-256 hashes, page counts and review metadata are preserved. There are 18 unique hashes and eight duplicate paths. |
| [Source authority and coverage](data/source-authority.json) | One coverage/disposition per unique hash, aliases, edition limits, page conventions and precise unfinished supplemental ranges. |
| [Revision catalog](data/rules-revisions.json) | 283 playtest entries: 56 May 2015, 35 September 2015 and 192 February 2016. Six additional entries record Hisui guidance and Porygon edition limitations. Each has baseline/revised interpretation, source hashes/pages, precedence, proposed selection unit and conflict disposition. Summaries do not replace full rules text. |
| [Dex comparison](data/dex-source-comparison.json) | All 747 old-versus-plus page positions compared. 450 changed positions are accounted for: 448 contain extracted field differences/additions and two retain text/layout or unparsed differences. These are candidates requiring manual record review, not 450 approved species. |
| [Bulbasaur review](data/bulbasaur-source-review.json) | Exact stable species/ability relationships, standard/plus attribution, remaining field mismatches and finite historical evidence. |
| [Reconciliation ledger](data/content-reconciliation-search.json) | Prior searches preserved; section-04 dispositions cover all 12 earlier-only IDs and missing enhancement/Carbon evidence. |

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

The revision catalog records 26 manual dispositions, including six supporting-source entries. The important decisions are:

| Source issue | Required disposition before affected implementation |
| --- | --- |
| May p.3 Hero's Journey | Choose three or four ranks; the printed header and prerequisite list disagree. |
| May Books / September Medic | Specify AP Drain versus Binding lifecycle for combined use. Retain rank prerequisites and rest behavior. |
| September p.7 Affliction Techniques | Decide how core Hyper Cures' old Medical Techniques prerequisite qualifies after replacement. |
| September capture | Specify conversion/rounding for nonmultiples of five, milestone/level handling and omitted natural-roll interactions; never mix d100 targets and d20 modifiers. |
| September shields/armor and class/field replacements | Decide omitted fields, costs and replacement/refund handling. Preserve saved items/features pending explicit selection. |
| February p.7 Mummy | Printed effect names the user's own Ability. Choose literal behavior or a documented correction; no silent attacker-target substitution. |
| February p.8 Sap Sipper | Resolve bare Scene frequency, missing action/trigger and immunity timing. |
| February p.12 Combo Striker | Resolve recursive free Struggle chains before automation; no invented cap. |
| Core p.330 Solid Rock / core p.236 chart | Record the standard multiplier ruling; February DR does not retroactively correct standard. |
| February p.1 Twisted Power / September p.9 Mixed Power | February calls it a Poké Edge but supplies no new edge block. Specify identity/effect and nonstacking treatment; old class grants explicitly retain old abilities. |
| Optional combinations | Review Defense Curl/Withdraw connections, changed conditions, Books/Inheritance timing and source-specific species slots. Undefined combinations remain manual. |

Manual disposition is not an implementation blocker for every unrelated topic. It is a requirement to keep the affected behavior visibly unverified until resolved. The catalog does not claim standard/revised variants, settings or automatic compatibility checks exist.

## Missing evidence and unfinished coverage

Core supports the rule concepts behind all 12 earlier-only Poké Edge IDs. That does not establish a destination UUID or authority to undo later removals. Preserve their historical exports. The owner must choose retention/reintroduction with an exact relationship map before implementation. A manifest declaration cannot reconstruct the missing enhancements database; the four previously selected Carbon snapshots still lack their matching manifests. Needed evidence remains original complete DB/JSON exports with IDs and relationships. No Generation 9-only recovery resumed.

The source coverage ledger accounts for every document, but **full section-04 acceptance is not complete**. Item-by-item supplemental interpretation/mapping remains for Game of Throhs pp. 31–45, 47–93 and campaign creation pp.105/120; Porygon pp. 21–39, 41–87; and Blessed pp. 36–71. Their optional module adoption is not established by the inventory. Owner decisions must name the adopted modules/content, not approve a mixed document wholesale. Earlier Porygon editions and Blessed's referenced edition notes are also missing, so historical deltas cannot be invented. Regional dex profiles and all machine-assisted dex candidates still need exact per-record identity/data/dependency review. The source-ledger coverage ranges do not certify every paragraph's mechanics.

## Implementation handoff and validation

Section 05, only after explicit owner start, should use accepted source decisions to design individually selected Feature/Edge/Move/Ability versions, independent general mechanic settings, compatibility constraints and explicit replacements. Standard must remain the new-world default. Preserve existing `ptu` IDs, UUIDs, macro paths, user content and campaign choices. Promote classifications into runtime/build policy in a separate reviewed change with exact record hashes, identities and tested behavior. These source artifacts are deliberately not read by production eligibility policy.

Run `node tools/rules-catalog.mjs` and `node --test --test-isolation=none tests/rules-catalog.test.mjs` for catalog checks. CI uses the normal test runner. With local supplied references and `pypdf`, `python tools/reference-catalog.py --check` checks hashes/pages/duplicate relationships without rewriting metadata. Refresh refuses changed hashes or missing reviewed files; ordinary refresh preserves existing review fields.

CI validates the catalog's structure and internal consistency. It does not receive the local PDFs, repeat their extraction, or certify the source interpretations.

See [section-04 validation](validation/2026-10-25-rules-catalog.md) and the [handoff](workstreams/04-rules-catalog.md). Structural validation and source comparisons are automated evidence; no gameplay, migration or move-behavior certification was performed here.
