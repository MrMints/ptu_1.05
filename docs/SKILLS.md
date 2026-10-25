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

No database-key migration is introduced. Macro selectors and calculation paths remain stable. Historical chat and user-authored prose are not rewritten. Recovered compendium descriptions and legacy generator data still need selective review; full actor/generator integration is tracked in issue #1.
