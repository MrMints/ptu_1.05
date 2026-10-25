# PTU 04 source/catalog validation — 2026-10-25

Branch: `codex/ptu-foundation`; clean starting head `9d678f05cbdc864aeab205fdecc7eb6950bd9d22`. The owner-authorized coordinator assigned section 04 sole shared-checkout ownership and reported all other numbered chats idle. The existing planner accepted the currently due 01–03 requirements. No other chat was started or messaged.

## Results

| Check | Outcome |
| --- | --- |
| Existing physical reference inventory | PASS: all 26 originals retain their SHA-256/page counts and duplicate relationships; existing review metadata preserved. 18 unique hashes, eight duplicate paths. |
| Packet coverage | 283 entries: May 56, September 35, February 192. Includes all 164 February printed ability blocks, split Huge/Pure identities, 18 removals, condition/capability changes and the 2015 content/mechanics. Six supporting guidance/edition entries bring total to 289. These are source entries, not playable-record totals. |
| Optional source comparisons | PASS within method: all 1,014 combined-dex page texts match four components after whitespace normalization. No claim of PDF-object/image identity. |
| Old/plus comparison | All 747 old page positions accounted. 450 changed comparisons, including two Hoopa additions; 448 have extracted field differences/additions, two retain text/layout or unparsed differences. Every candidate requires manual field/identity/dependency review. |
| Bulbasaur | Source/version attribution resolved for five ability slots using plus p12, exact inherited UUIDs and reused historical exports. Standard old/combined profile differs. Whole record remains unclassified because machine/tutor/narrative fields are not fully supported by compared pages. |
| Finite reconciliation | All 12 earlier-only IDs get core concept citations and explicit retention decisions. Missing enhancements export and four incomplete Carbon snapshots remain blocked evidence. No additional Carbon DB extraction or Generation 9 recovery. |
| Catalog checks | PASS: `node tools/rules-catalog.mjs`; citation hashes/pages, coverage/aliases, canonical versions, stable source identity/hash, composition offsets, independent review axes and all 12 historical dispositions. |
| Focused tests | PASS: six tests via `node --test --test-isolation=none tests/rules-catalog.test.mjs`; includes corrupted hashes/pages, guessed IDs, stale species hash, merged identities, composite offset, false approval/verification and missing manual reasons/dispositions. |
| Existing source structure | PASS: `node tools/validate.mjs`: manifest, 17 skill mappings, 15 packs and 7,395 inherited source records. This does not approve 7,395 records. |
| Original preservation | PASS: `python tools/reference-catalog.py --check` using bundled Python/pypdf. No original or reference-review metadata changes. |
| Documentation/preservation checks | PASS: 38 local Markdown links resolve, `git diff --check` passes, and prior reconciliation metadata plus all reference/production eligibility ledgers retain semantic equality. |
| Visual source checks | Local render inspection: plus dex p12, February pp2/7/8 and Indices PDF1/printed303. Earlier 02 old/combined Bulbasaur p12 and 03 core terminology evidence reused. Full relevant packet text was inspected; source summaries are paraphrases. |
| Runtime/pack reuse | PASS: no diff from 9d678f05 in `packs`, `src`, `static`, template/manifest/package/lock files, build or pack compiler. Reuse 02 runtime/build `a0415a905401bb23ee0c43c084ce1ae4049d5096`, its integration matrix and 03 skill evidence within their recorded limits. |
| Foundry, migrations, gameplay/moves, full local pack rebuild | NOT RUN: this section changes documentation/catalog tools only. No demonstrated need to restart the disposable world or repeat unaffected runtime batches. CI independently repeats its configured checks. |

The initial catalog test found a descriptive `unclassified (unchanged)` value where the guard required the canonical `unclassified` status. The new source review was normalized; all six affected tests then passed. Original eligibility/policy data never changed. One local source-parser alternation was corrected before producing the comparison artifact; unpaired spelling/Forme headings were manually checked against independent stats/type/size/evolution fields. These fixes changed no production data.

An attempted exact earliest-species-tree read at `02517e8f042787b9eb951764283655557fc967f1` encountered unavailable promisor blob `d88bcac93161e4412da83b9aef27e19203f4018b`; Git's implicit network fetch could not connect. No complete extraction, absence finding or alternate diagnostic route is claimed. Four already extracted later snapshots supplied exact unchanged species/ability relationships. This does not block the independently proven plus-profile attribution.

## Acceptance and limits

The source/catalog stage is documented; **full section-04 acceptance remains incomplete**. There are 26 manual revision dispositions plus manual review on all 450 dex candidates. Unfinished supplemental item-level coverage and missing edition/export evidence are listed precisely in [the source guide](../RULES_SOURCES.md) and [coverage ledger](../data/source-authority.json). These are not silently approved modules. Owner/GM rulings are needed only for the affected conflicts/combinations; unrelated source decisions can be reviewed independently.

No runtime enforcement, content pack, persistent ID, campaign selection, existing approval ledger or behavior certification changes. The new source artifacts are not production policy inputs. No PDF or full extracted book text is committed/uploaded. Local extracts/renders stay under ignored `.cache/rules04/`.

## Commit, CI and checkout handoff

This report belongs to the documented section-04 catalog commit in draft [PR #4](https://github.com/MrMints/ptu_1.05/pull/4), tracked under [issue #2](https://github.com/MrMints/ptu_1.05/issues/2). The final handoff/comment records the exact pushed commit and normal GitHub workflow-run/job metadata after push. Earlier 02 CI 40223456718 applies to the unchanged baseline, not to this new head. Code Review diagnostics were not requested or retried.

Section 04 does not acquire or use the shared Foundry data directory. Last stopped/Setup state is the accepted 02 evidence; no fresh port/process assertion is made here. After the final documented push/CI handoff, section 04 stops and releases shared-checkout ownership. Other chats remain idle until the owner explicitly starts them. No merge, tag, release, publication, automation or section 05 start.
