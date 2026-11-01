// Browser-compatible fixed policy. Importing or constructing a plan performs no IO.
const bindings = {
  "pin": {
    "commit": "e63595a2f6bb51358d5b66a66b594e6868e5286b",
    "run": 41250223014,
    "artifact": 13061542688,
    "outerSha256": "be63c04bf0e555c513a5ae933ca3ddb3991fde4dae0a9ae3f93df54698854710",
    "innerSha256": "7a6b89a38cd602a4643dce9cd1022b43cacd5f2b645f91013c2a48fdb929e8cd",
    "core": "13.351",
    "system": "4.4.3",
    "world": "ptu-verification",
    "gm": "lMqIt6G1J6gh89ut",
    "player": "iVkqwxalI3cGJahD"
  },
  "runtime": {
    "system.json": "f9009d19bace3df3008cb17d2476c6b59dad85733a34f968ea022610c09afea2",
    "template.json": "153a42fcfd7449f3de6d87949ec05c569c1e33eae6fbdd79f0ab8f46282ca7c9",
    "src/ptr.js": "fc02e7cfef9d3c16772a12b2833e7a2a9a6a092172f900e8dede32fc4f18d45c",
    "src/scripts/hooks/ready.js": "7e492ec2fa9d3223c0cfba68f1a31d32d035540d976ee2b9f1b9229376c76d6a",
    "src/module/migration/runner/base.js": "ac6c76f47aa9df4a2b0cda6a71e6f1351068fcf2ded22e14250b08c575c39489",
    "src/module/apps/feature-acquisition-review-launcher.js": "8d221eed995dc90b55866d6933f0f7c3992a30ccb5723a7cc66991d0725c4cdf",
    "src/module/apps/feature-acquisition-review.js": "cffc668c7c47068d85ada8820755a2b982e40e2d5e02078950a204f7833a6fbd",
    "src/util/rule-version-acquisition-review.js": "2d5083e7229af4994bcf9f9f7f28bbe89ce23a2d58786876fd4ffa42f97d195b",
    "src/util/rule-version-registry.js": "93d8c8341d73102415894b47ba4a989f0600498ca478cd3e5503b044097b10d5",
    "src/util/rule-version-preview.js": "12ffc1c984f78034bb15d2af7d466f4cd583e70e54520cda97315a944735664f",
    "src/util/rule-versions.js": "ec4fb514b4bdb022f70bc65dab7d8a547e2f829c1529a9224df3d6883fcc20c9",
    "src/util/prerequisites.js": "d3a6626420c26f52e31b07fd428cf63a455a6bcfc36b7a979a62bf34400d3649",
    "src/util/skills.js": "5bb8390d3bf44e4dddfeca8534a7c0a35e74b380e39f203e8e671d41ad4aea76",
    "src/util/document-source.js": "86a6ba2b69bb83e2e27d3df86249d99c60df17a4e544e4515018bbbf0c0385e0",
    "static/templates/apps/feature-acquisition-review.hbs": "f435949aa8db9bf3f1bfc54b9c2f66e4b0efb65ec36c22a1964642bb56572ba6",
    "static/lang/en.json": "f4d4b9de4093e7ec4b12b1f5f7d19dd2730950a381410282abff39485140c0fa"
  },
  "target": {
    "world": "ptu-verification",
    "title": "PTU verification (disposable)",
    "worldPath": "D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/worlds/ptu-verification",
    "systemPath": "D:/Projects/PTU 1.05 on Foundry/.foundry-test/Data/systems/ptu"
  },
  "accounts": {
    "users": [
      {
        "id": "iVkqwxalI3cGJahD",
        "name": "PTU 02 Player",
        "role": 1
      },
      {
        "id": "lMqIt6G1J6gh89ut",
        "name": "Gamemaster",
        "role": 4
      }
    ],
    "coveredPlayers": [
      "iVkqwxalI3cGJahD"
    ]
  },
  "fixtures": {
    "counts": {
      "Actor": 4,
      "embeddedItem": 11,
      "worldItem": 4,
      "packItem": 2,
      "Macro": 1,
      "Pack": 1
    },
    "roles": [
      {
        "role": "target-trainer",
        "kind": "Actor",
        "type": "character"
      },
      {
        "role": "target-pokemon",
        "kind": "Actor",
        "type": "pokemon"
      },
      {
        "role": "denied-trainer",
        "kind": "Actor",
        "type": "character"
      },
      {
        "role": "source-parent",
        "kind": "Actor",
        "type": "character"
      },
      {
        "role": "target-trainer-feature-0",
        "kind": "embeddedItem",
        "parent": "target-trainer",
        "type": "feat"
      },
      {
        "role": "target-trainer-feature-1",
        "kind": "embeddedItem",
        "parent": "target-trainer",
        "type": "feat"
      },
      {
        "role": "target-trainer-edge",
        "kind": "embeddedItem",
        "parent": "target-trainer",
        "type": "edge"
      },
      {
        "role": "target-trainer-pokeedge",
        "kind": "embeddedItem",
        "parent": "target-trainer",
        "type": "pokeedge"
      },
      {
        "role": "target-trainer-item",
        "kind": "embeddedItem",
        "parent": "target-trainer",
        "type": "item"
      },
      {
        "role": "target-pokemon-feature-0",
        "kind": "embeddedItem",
        "parent": "target-pokemon",
        "type": "feat"
      },
      {
        "role": "target-pokemon-feature-1",
        "kind": "embeddedItem",
        "parent": "target-pokemon",
        "type": "feat"
      },
      {
        "role": "target-pokemon-edge",
        "kind": "embeddedItem",
        "parent": "target-pokemon",
        "type": "edge"
      },
      {
        "role": "target-pokemon-pokeedge",
        "kind": "embeddedItem",
        "parent": "target-pokemon",
        "type": "pokeedge"
      },
      {
        "role": "target-pokemon-item",
        "kind": "embeddedItem",
        "parent": "target-pokemon",
        "type": "item"
      },
      {
        "role": "source-parent-feature-0",
        "kind": "embeddedItem",
        "parent": "source-parent",
        "type": "feat"
      },
      {
        "role": "core-control",
        "kind": "worldItem",
        "type": "feat"
      },
      {
        "role": "optional-control",
        "kind": "worldItem",
        "type": "feat"
      },
      {
        "role": "unresolved-control",
        "kind": "worldItem",
        "type": "feat"
      },
      {
        "role": "denied-control",
        "kind": "worldItem",
        "type": "feat"
      },
      {
        "role": "pack-core",
        "kind": "packItem",
        "parent": "test-pack",
        "type": "feat"
      },
      {
        "role": "pack-optional",
        "kind": "packItem",
        "parent": "test-pack",
        "type": "feat"
      },
      {
        "role": "test-pack",
        "kind": "Pack",
        "type": "Item"
      },
      {
        "role": "test-macro",
        "kind": "Macro",
        "type": "script"
      }
    ],
    "pack": "world.p05-feature-review-fixtures"
  },
  "access": {
    "observerRoles": [
      "target-trainer",
      "target-pokemon",
      "source-parent",
      "core-control",
      "optional-control",
      "unresolved-control"
    ],
    "limitedRole": "test-macro",
    "deniedRoles": [
      "denied-trainer",
      "denied-control"
    ],
    "playerPack": [
      "NONE",
      "OBSERVER",
      "NONE"
    ],
    "trusted": "NONE",
    "assistant": "NONE",
    "globalPermissions": "unchanged"
  },
  "cases": [
    "gm-trainer-core-to-optional",
    "gm-pokemon-optional-to-core",
    "gm-owned-repeats-membership",
    "gm-incoming-batch-conflicts",
    "gm-unresolved-custom",
    "gm-escaped-render-focus-scroll",
    "gm-close",
    "gm-cancel",
    "gm-escape",
    "gm-header-close",
    "gm-repeated-dismissal",
    "gm-fresh-capture",
    "gm-reload-preservation",
    "player-trainer-review",
    "player-pokemon-review",
    "player-source-parent-readable",
    "player-denied-actor",
    "player-denied-incoming",
    "player-denied-source-parent",
    "player-pack-none",
    "player-pack-observer",
    "player-pack-revoked",
    "player-close",
    "player-cancel",
    "player-escape",
    "player-header-close",
    "player-repeated-dismissal",
    "player-reload-preservation"
  ],
  "casePlans": [
    {
      "id": "gm-trainer-core-to-optional",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-pokemon-optional-to-core",
      "actorRole": "target-pokemon",
      "incomingRoles": [
        "core-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-owned-repeats-membership",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-incoming-batch-conflicts",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "core-control",
        "optional-control",
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-unresolved-custom",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "unresolved-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-escaped-render-focus-scroll",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-close",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-cancel",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-escape",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-header-close",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-repeated-dismissal",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "gm-fresh-capture",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "gm-reload-preservation",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "player-trainer-review",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "player-pokemon-review",
      "actorRole": "target-pokemon",
      "incomingRoles": [
        "core-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "player-source-parent-readable",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "source-parent-feature-0"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "player-denied-actor",
      "actorRole": "denied-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "not-opened",
      "dismissal": false
    },
    {
      "id": "player-denied-incoming",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "denied-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "not-opened",
      "dismissal": false
    },
    {
      "id": "player-denied-source-parent",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "source-parent-feature-0"
      ],
      "incomingOrder": "explicit",
      "outcome": "not-opened",
      "dismissal": false
    },
    {
      "id": "player-pack-none",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "pack-core",
        "pack-optional"
      ],
      "incomingOrder": "native-collection",
      "outcome": "not-opened",
      "dismissal": false
    },
    {
      "id": "player-pack-observer",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "pack-core",
        "pack-optional"
      ],
      "incomingOrder": "native-collection",
      "outcome": "review-requested",
      "dismissal": false
    },
    {
      "id": "player-pack-revoked",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "pack-core",
        "pack-optional"
      ],
      "incomingOrder": "native-collection",
      "outcome": "not-opened",
      "dismissal": false
    },
    {
      "id": "player-close",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "player-cancel",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "player-escape",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "player-header-close",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "player-repeated-dismissal",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": true
    },
    {
      "id": "player-reload-preservation",
      "actorRole": "target-trainer",
      "incomingRoles": [
        "optional-control"
      ],
      "incomingOrder": "explicit",
      "outcome": "review-requested",
      "dismissal": false
    }
  ],
  "conversion": {
    "admission": "pending",
    "databases": [
      {
        "database": "ptu.abilities",
        "path": "packs/abilities",
        "type": "Item",
        "total": 634,
        "primary": 631,
        "embedded": 0,
        "folders": 3,
        "transformations": {
          "legacySources": 22,
          "exportSources": 8,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.moves",
        "path": "packs/moves",
        "type": "Item",
        "total": 1310,
        "primary": 1294,
        "embedded": 0,
        "folders": 16,
        "transformations": {
          "legacySources": 100,
          "exportSources": 26,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.feats",
        "path": "packs/feats",
        "type": "Item",
        "total": 1402,
        "primary": 1324,
        "embedded": 0,
        "folders": 78,
        "transformations": {
          "legacySources": 671,
          "exportSources": 259,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.edges",
        "path": "packs/edges",
        "type": "Item",
        "total": 86,
        "primary": 85,
        "embedded": 0,
        "folders": 1,
        "transformations": {
          "legacySources": 0,
          "exportSources": 6,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.items",
        "path": "packs/items",
        "type": "Item",
        "total": 854,
        "primary": 843,
        "embedded": 0,
        "folders": 11,
        "transformations": {
          "legacySources": 96,
          "exportSources": 22,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.capabilities",
        "path": "packs/capabilities",
        "type": "Item",
        "total": 148,
        "primary": 144,
        "embedded": 0,
        "folders": 4,
        "transformations": {
          "legacySources": 19,
          "exportSources": 5,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.habitats",
        "path": "packs/habitats",
        "type": "RollTable",
        "total": 1962,
        "primary": 25,
        "embedded": 1937,
        "folders": 0,
        "transformations": {
          "legacySources": 0,
          "exportSources": 0,
          "packResults": 1937,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.rolltables",
        "path": "packs/rolltables",
        "type": "RollTable",
        "total": 604,
        "primary": 17,
        "embedded": 582,
        "folders": 5,
        "transformations": {
          "legacySources": 0,
          "exportSources": 2,
          "packResults": 548,
          "textResults": 34,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.effects",
        "path": "packs/effects",
        "type": "Item",
        "total": 673,
        "primary": 614,
        "embedded": 0,
        "folders": 59,
        "transformations": {
          "legacySources": 65,
          "exportSources": 367,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.species",
        "path": "packs/species",
        "type": "Item",
        "total": 1814,
        "primary": 1806,
        "embedded": 0,
        "folders": 8,
        "transformations": {
          "legacySources": 0,
          "exportSources": 24,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.macros",
        "path": "packs/macros",
        "type": "Macro",
        "total": 6,
        "primary": 6,
        "embedded": 0,
        "folders": 0,
        "transformations": {
          "legacySources": 0,
          "exportSources": 1,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.references",
        "path": "packs/references",
        "type": "Item",
        "total": 336,
        "primary": 335,
        "embedded": 0,
        "folders": 1,
        "transformations": {
          "legacySources": 0,
          "exportSources": 1,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.spirit-actions",
        "path": "packs/spirit-actions",
        "type": "Item",
        "total": 42,
        "primary": 34,
        "embedded": 0,
        "folders": 8,
        "transformations": {
          "legacySources": 0,
          "exportSources": 0,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      },
      {
        "database": "ptu.journals",
        "path": "packs/journals",
        "type": "JournalEntry",
        "total": 273,
        "primary": 2,
        "embedded": 271,
        "folders": 0,
        "transformations": {
          "legacySources": 6,
          "exportSources": 1,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 271
        }
      },
      {
        "database": "ptu.poke-edges",
        "path": "packs/poke-edges",
        "type": "Item",
        "total": 41,
        "primary": 38,
        "embedded": 0,
        "folders": 3,
        "transformations": {
          "legacySources": 0,
          "exportSources": 6,
          "packResults": 0,
          "textResults": 0,
          "pageCategories": 0
        }
      }
    ],
    "totals": {
      "primary": 7198,
      "embedded": 2790,
      "changed": 9988,
      "folders": 197,
      "stored": 10185
    },
    "permittedFields": [
      "_stats.coreVersion",
      "_stats.exportSource",
      "flags.core.sourceId",
      "_stats.compendiumSource",
      "flags.exportSource",
      "TableResult:text/type/documentCollection/documentId/name/documentUuid/description/_stats",
      "JournalEntryPage:category"
    ],
    "preserve": [
      "record-ids",
      "database-coordinates",
      "system-values",
      "all-unlisted-fields",
      "excluded-inventory"
    ],
    "gameplayVerified": false
  },
  "previous": {
    "head": "6b686b6be2d1af34b566687a10297ec75c330641",
    "semanticSha256": "0510ec645c3ff7651da975b1c6dbc1b92a7a5c24dfdf3a3a9e3fe3a3993eb079",
    "path": "docs/validation/p05-feature-review-native.json",
    "status": "blocked",
    "nativeCases": {
      "passed": 0,
      "failed": 0,
      "notRun": 28
    },
    "proofs": [
      {
        "path": "logs/server-stdout.log",
        "sha256": "fbc34addcb8f943d3475904bb4ffeaab33e1bf31688e67c3e2974743fc6b787f",
        "private": true
      },
      {
        "path": "logs/server-stderr.log",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "private": true
      },
      {
        "path": "raw/startup-stop.json",
        "sha256": "cebdf31751711d01fe8bcd0cfb547512b39cf2debe418159ca2ba358cbb96c2f",
        "private": true
      },
      {
        "path": "raw/offline-closure.json",
        "sha256": "199d7a8800d849e4f7489538b5488a8a4c599c276adcee886f58cd5a1c12a6cb",
        "private": true
      },
      {
        "path": "raw/offline-closure-final.json",
        "sha256": "40bfaaaa044fe4ad8fb98b64db7b1f2661df63ee158a626e0b47764d6a2d8d06",
        "private": true
      }
    ],
    "preservedFiles": [
      {
        "path": "docs/validation/p05-feature-review-native.json",
        "canonicalSha256": "5ba1f5f2059f58412b97cf3729c3662540ba01f95b84ee4ae0c5a80bdecb090f"
      },
      {
        "path": "tools/check-feature-review-evidence.mjs",
        "canonicalSha256": "51bc41aa89281ab556255db16f917705b1bc385abe3157179ad2cd7cf265fc4d"
      },
      {
        "path": "tests/feature-review-evidence.test.mjs",
        "canonicalSha256": "e4126029b187188c9dbae1a6418412a4b92e328d53a09e69adc583590adf9ff4"
      }
    ],
    "residual": {
      "settingsValuesUnchanged": true,
      "usersRolesSecurityUnchanged": true,
      "actorsItemsUnchanged": true,
      "fullyRestored": false,
      "uncertain": true,
      "returnToSetup": false,
      "settingMetadataChanges": [
        {
          "key": "core.moduleConfiguration",
          "paths": [
            "_stats.modifiedTime"
          ]
        },
        {
          "key": "core.compendiumConfiguration",
          "paths": [
            "_stats.modifiedTime"
          ]
        }
      ],
      "worldManifestChanges": [
        "lastPlayed",
        "packs.0.package",
        "packs.0.id",
        "packs.0.packageType",
        "packs.0.packageName",
        "packs.0.index",
        "packs.0.folders"
      ]
    },
    "history": [
      "initial45",
      "intermediate69/70/74",
      "affected544",
      "corrected86/combined106",
      "family-bypass0/6",
      "intermediate-test-compile-failure",
      "restoration-array-order-failure/path-keyed6890-success",
      "screenshot-EPERM/TEMP-denial/owner-unsaved",
      "old-headCI2493",
      "accepted-headCI2505",
      "native0/28"
    ]
  },
  "preserved": [
    {
      "path": "docs/validation/p05-feature-review-native.json",
      "canonicalSha256": "5ba1f5f2059f58412b97cf3729c3662540ba01f95b84ee4ae0c5a80bdecb090f"
    },
    {
      "path": "tools/check-feature-review-evidence.mjs",
      "canonicalSha256": "51bc41aa89281ab556255db16f917705b1bc385abe3157179ad2cd7cf265fc4d"
    },
    {
      "path": "tests/feature-review-evidence.test.mjs",
      "canonicalSha256": "e4126029b187188c9dbae1a6418412a4b92e328d53a09e69adc583590adf9ff4"
    },
    {
      "path": "tools/feature-review-attempt-contract.mjs",
      "canonicalSha256": "7dcc0c11bc2366b09610aa33b212743ea9d35ad7c199b9e8408ca250d8648dd8"
    },
    {
      "path": "tools/check-feature-review-attempt.mjs",
      "canonicalSha256": "68e5390bb668856996d44f0d4e99e938736536d4d1fc7e4fc5c7a04bc7640541"
    },
    {
      "path": "tests/feature-review-attempt-contract.test.mjs",
      "canonicalSha256": "c10e0bcf052ffa1174509e5d3dd88065b79fb3cacb9fc9b924f83a76b12122e9"
    },
    {
      "path": "docs/validation/p05-feature-review-native.md",
      "canonicalSha256": "84ccd23f6db6b07e24445542174c06355646cfa0512d581838dbe0697920fbb2"
    }
  ],
  "preservedPrefixes": [
    {
      "path": "docs/validation/p05-feature-review-attempt-preparation.md",
      "length": 22832,
      "canonicalSha256": "6a9df34b89c4d923a249f7f5d4bee7ca5cc533ceae05d936c2d2cff0a7f6d3c2"
    }
  ],
  "originalBackups": {
    "manifestPath": "offline-backup-manifest.json",
    "manifestSha256": "df17f5613ef4eb7fdb57b5dcb699fd718650fa48be72561798baad38e1980c40",
    "worldEntriesSha256": "daf6cad8948b8893ef14a8382db9e1a980ee46e72d0caa7bf01dda25cf76d6b2",
    "systemEntriesSha256": "baa475a74bab1ce68b27dc0e1514335688192b2f1b2cd6d4acfe79d79bd89e5b"
  }
};

const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const admittedCanonical=v=>JSON.stringify(sort(v));
function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}
const copy=structuredClone,same=(a,b)=>admittedCanonical(a)===admittedCanonical(b),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),id=v=>typeof v==='string'&&/^[A-Za-z0-9]{16}$/.test(v);
const forbidden=new Set(['ViZpn17qLA4ACQGa','celnYjQjM3jjtAnZ','e9dQ3NmVm7EuQBO5','i1OAz3lvuCRIm3n9','UKk9BnAZtm1xMoRB']);
const collections=['actors','items','folders','macros','messages','scenes','cards','combats','journal','playlists','tables'];
export const FEATURE_REVIEW_ADMITTED_CONTRACT=freeze({...bindings,id:'p05-feature-review-owner-admitted-preparation-v1',schemaVersion:1,
    policy:{decision:'owner-approved-bounded-policy',owner:{thread:'01a17125-dca0-7a33-b3f2-c82b9f7b15f9',turn:'01a19588-9604-7df0-9bde-df74269fec32',message:'01a19588-96a3-72a2-bc72-e489febda7c6'},proposal:{thread:'01a17409-a030-7475-8d31-7fd4cf1e80f1',turn:'01a19580-e1be-73fa-9660-7f2ebb25f543'},assignment:{thread:'01a170e3-c169-77e3-9df1-73fd8a2d830a',turn:'01a1958a-b433-74c3-9524-19a35f47b1f3'},acceptanceHead:'e450abafb1cda6070868ecbc053f381449d120c6',conversion:'fixed-15-database-format-only',worldOverwrite:false,completeWorldRestoration:false,credentials:false,screenshots:'remain-unsaved'},
    collections,externalGates:['exact-final-head-CI','independent-review','planner-review','fresh-supported-usage','exclusive-checkout-and-world-ownership','fresh-private-backups','original-archives-and-installed-served-runtime','exact-accounts-schema-and-normal-access','mandatory-action-time-approvals','verified-private-capture-route'],
    residualPolicy:{world:['lastPlayed','playtime'],settings:['core.moduleConfiguration','core.compendiumConfiguration'],settingPaths:['_stats.modifiedTime'],packMetadata:'retain-fresh-baseline-exactly',playtime:{unit:'seconds',calculation:'sum(Math.round((endMs-startMs)/1000))',overlappingIntervals:false},normalExit:'GM-deactivation-and-Setup-navigation-distinct-from-administrator-authentication'}});
const C=FEATURE_REVIEW_ADMITTED_CONTRACT;
const claims=()=>({authorized:false,nativeAccepted:false,completeWorldRestoration:false,worldOverwrite:false,administratorAccess:false,full05:false,pre06:false,merge:false,release:false});
const emptyCheckpoint=()=>({phase:'initial',resources:[],mappings:[],packMappings:[],mutations:[],operations:[],captures:[],failure:null});
/** Inert, no fresh IDs, IO, backups, verified access or execution authority. */
export function createAdmittedFeatureReviewPlan(){return {schemaVersion:1,contract:C.id,kind:'admitted-feature-review-plan',policy:copy(C.policy),reviewState:'held-for-implementation-review',executionReadiness:'not-authenticated-by-record',externalGates:Object.fromEntries(C.externalGates.map(k=>[k,null])),mode:'not-run',batch:null,pin:copy(C.pin),target:copy(C.target),accounts:copy(C.accounts),fixturePlan:copy(C.fixtures),accessPlan:copy(C.access),conversionPlan:copy(C.conversion),previous:copy(C.previous),runtime:Object.entries(C.runtime).map(([path,packaged])=>({path,packaged,installed:null,served:null})),baseline:null,checkpoint:emptyCheckpoint(),evidence:{status:'not-run',conversion:null,closure:null,raw:[]},claims:claims(),handoff:{revision:0,issued:null,acceptedSegments:[],genesisCheckpoint:null}};}
function keys(v,list){return object(v)&&same(Object.keys(v).sort(),[...list].sort());}
export function admittedMappings(resources,batch,pack=false){return (pack?['pack-core','pack-optional']:['core-control','optional-control']).map((role,n)=>{const r=resources.find(r=>r.role===role),version=n?'optional':'core';return {schemaVersion:1,documentUuid:r?.uuid,type:'feat',generationEligibility:'eligible',version:{id:`${batch}-${version}`,kind:n?'revised':'original',label:`Synthetic ${version} control`},source:{id:batch,edition:'Synthetic native validation controls',status:'synthetic',citation:'Synthetic test only; no production content authority',publicationDate:null},canonical:{id:batch+(pack?'-pack':'-world'),evidence:'Explicit synthetic pair for native validation only'}};});}
export function admittedManifestErrors(resources,batch,baseline,mode){
    const errors=[];if(!Array.isArray(resources))return ['Manifest array required'];const roles=new Set(),uuids=new Set();
    const baselineUuids=new Set(object(baseline?.ids)?Object.entries(baseline.ids).flatMap(([k,ids])=>(Array.isArray(ids)?ids:[]).map(v=>`${({actors:'Actor',items:'Item',macros:'Macro'})[k]??k}.${v}`)):[]);
    for(const r of resources){if(!object(r)){errors.push('Malformed manifest entry');continue;}const p=C.fixtures.roles.find(p=>p.role===r.role);if(!p||roles.has(r.role)||p.kind!==r.kind||p.type!==r.type)errors.push('Unapproved manifest role/type');roles.add(r.role);
        if(r.batch!==batch||r.created!==true||r.synthetic!==(mode==='synthetic')||forbidden.has(r.id)||(r.kind==='Pack'?r.id!==C.fixtures.pack:!id(r.id))||uuids.has(r.uuid)||baselineUuids.has(r.uuid))errors.push('Manifest identity/ownership/baseline mismatch');uuids.add(r.uuid);
        if(!p)continue;const parent=resources.find(v=>v?.role===p.parent),expected=p.kind==='Actor'?`Actor.${r.id}`:p.kind==='worldItem'?`Item.${r.id}`:p.kind==='Macro'?`Macro.${r.id}`:p.kind==='Pack'?`Compendium.${C.fixtures.pack}`:p.kind==='packItem'?`Compendium.${C.fixtures.pack}.Item.${r.id}`:`${parent?.uuid}.Item.${r.id}`;
        if(r.uuid!==expected||p.parent&&r.parentUuid!==parent?.uuid||p.kind==='Pack'&&r.collection!==C.fixtures.pack)errors.push('Manifest parent/pack coordinate mismatch');
        const permitted=['uuid','id','kind','role','type','batch','created','synthetic',...(p.parent?['parentUuid']:[]),...(p.kind==='Pack'?['collection']:[])];if(!keys(r,permitted))errors.push('Unlisted manifest field');
    }if(resources.length>23)errors.push('Manifest exceeds finite23');return errors;
}
function runtimeErrors(rows,{installed=false,served=false}={}){const errors=[];if(!Array.isArray(rows)||rows.length!==16||new Set(rows.map(r=>r?.path)).size!==16)return ['Complete fixed16 runtime bindings required'];for(const r of rows){if(!keys(r,['path','packaged','installed','served'])||r.packaged!==C.runtime[r.path]||!Object.hasOwn(C.runtime,r.path)||r.installed!==(installed?r.packaged:null)||r.served!==(served?r.packaged:null))errors.push('Runtime binding mismatch');}return errors;}
function baselineErrors(b){const errors=[];if(!keys(b,['ids','packConfiguration','world','settings','protectedDocuments','users','priorSystem','backupManifestSha256','configurationSha256']))return ['Fresh complete baseline required'];if(!keys(b.ids,collections)||collections.some(k=>!Array.isArray(b.ids[k])||b.ids[k].some(x=>!id(x))||new Set(b.ids[k]).size!==b.ids[k].length))errors.push('Complete baseline IDs required');if(!object(b.packConfiguration)||!object(b.world)||b.world.id!==C.target.world||!Array.isArray(b.world.packs)||!Array.isArray(b.settings)||!Array.isArray(b.protectedDocuments)||!Array.isArray(b.users)||!Array.isArray(b.priorSystem)||(!hex(b.backupManifestSha256)||!hex(b.configurationSha256)))errors.push('Malformed baseline');if(!b.settings?.length||!b.protectedDocuments?.length||!b.users?.length||!b.priorSystem?.length)errors.push('Empty protected baseline');if(Array.isArray(b.world?.packs)&&b.world.packs.some(p=>p?.name==='p05-feature-review-fixtures'))errors.push('Fixture namespace pre-exists');return errors;}
export function admittedBaselineErrors(b){const errors=baselineErrors(b);if(errors.length)return errors;
    if(!same(b.users.map(u=>({id:u?.id,name:u?.name,role:u?.role})),C.accounts.users)||b.users.some(u=>!keys(u,['id','name','role','ownership','permissions','recordSha256'])||!(u.ownership===null||object(u.ownership))||!object(u.permissions)||!hex(u.recordSha256)))errors.push('Exact credential-free account/security baseline required');
    const seen=new Set();for(const r of b.protectedDocuments){const key=JSON.stringify([r?.collection,r?.id]);if(!keys(r,['collection','id','data'])||!C.collections.includes(r.collection)||!id(r.id)||r.data?._id!==r.id||seen.has(key))errors.push('Malformed/duplicate protected payload');seen.add(key);}
    for(const k of C.collections)if(!same(b.protectedDocuments.filter(r=>r?.collection===k).map(r=>r.id).sort(),[...b.ids[k]].sort()))errors.push('Protected baseline denominator differs '+k);
    const settings=new Set();for(const s of b.settings){if(!object(s)||!id(s._id)||typeof s.key!=='string'||!Object.hasOwn(s,'value')||settings.has(s.key))errors.push('Setting baseline identity/value missing');settings.add(s.key);}for(const k of C.residualPolicy.settings)if(!settings.has(k))errors.push('Named core setting baseline missing');
    const paths=new Set();for(const r of b.priorSystem){if(!keys(r,['path','kind','sha256'])||typeof r.path!=='string'||!/^(?![\\/])(?:[^\\/]+\/)*[^\\/]+$/.test(r.path)||r.path.split('/').some(p=>p==='.'||p==='..'||p.includes(':'))||!['file','directory'].includes(r.kind)||(r.kind==='file'?!hex(r.sha256):r.sha256!==null)||paths.has(r.path))errors.push('Malformed prior-system byte manifest');paths.add(r?.path);}if(!b.priorSystem.some(r=>r.path==='system.json'&&r.kind==='file'))errors.push('Prior-system manifest lacks system.json');return errors;}
export function admittedCheckpointErrors(cp,plan){
    const errors=[];if(!keys(cp,['phase','resources','mappings','packMappings','mutations','operations','captures','failure']))return ['Checkpoint fields differ'];if(!['initial','gm','player','reload','cleanup'].includes(cp.phase)||['resources','mappings','packMappings','mutations','operations','captures'].some(k=>!Array.isArray(cp[k])))return ['Malformed checkpoint'];
    if(['resources','mappings','packMappings','mutations','operations','captures'].some(k=>cp[k].some(v=>!object(v))))return ['Malformed checkpoint entry'];
    errors.push(...admittedManifestErrors(cp.resources,plan.batch,plan.baseline,plan.mode));
    for(const r of cp.resources){if(cp.mutations.filter(m=>m?.kind==='create'&&m.uuid===r.uuid&&m.userId===C.pin.gm&&m.batch===plan.batch).length!==1)errors.push('Fixture lacks its unique GM creation receipt');}
    if(cp.mappings.length&&!same(cp.mappings,admittedMappings(cp.resources,plan.batch)))errors.push('World mapping data mismatch');if(cp.packMappings.length&&!same(cp.packMappings,admittedMappings(cp.resources,plan.batch,true)))errors.push('Pack mapping data mismatch');
    if(cp.phase==='initial'&&(cp.resources.length||cp.mappings.length||cp.packMappings.length||cp.mutations.length||cp.operations.length||cp.captures.length||cp.failure!==null))errors.push('Initial checkpoint must be empty');
    for(const m of cp.mutations){const r=cp.resources.find(r=>r.uuid===m?.uuid);if(!r||m.batch!==plan.batch||m.userId!==C.pin.gm||!['create','macro-tag','access','pack-configuration','fresh-capture','delete','delete-with-parent'].includes(m.kind))errors.push('Unapproved mutation receipt');if(m?.kind==='access'&&(m.principal!==C.pin.player||!(r?.role==='test-macro'?[0,1]:[0,2]).includes(m.level)||!(C.access.observerRoles.includes(r?.role)||r?.role==='test-macro')))errors.push('Grant outside finite policy');if(m?.kind==='pack-configuration'&&(r?.role!=='test-pack'||m.role!=='PLAYER'||!['NONE','OBSERVER'].includes(m.level)))errors.push('Pack grant outside finite policy');if(m?.kind==='fresh-capture'&&(r?.role!=='target-trainer'||!same(m.paths,['system.level.milestones','system.skills.generalEd.value.value','flags.ptu.p05ReviewCustom'])))errors.push('Fixture mutation outside finite policy');}
    const levels=['NONE'];for(const m of cp.mutations.filter(m=>m?.kind==='pack-configuration'))if(levels.at(-1)!==m.level)levels.push(m.level);if(!same(levels,C.access.playerPack.slice(0,levels.length)))errors.push('Pack role sequence outside NONE/OBSERVER/NONE');if(cp.mutations.filter(m=>m?.kind==='fresh-capture').length>1)errors.push('Repeated unapproved fixture mutation');
    for(const o of cp.operations){if(!object(o)||!['setup','grants','pack-access','begin','fresh-update','checkpoint','cleanup-before-macro-delete','macro-deleted','resume','checkpoint-import','failure'].includes(o.kind))errors.push('Unknown operation checkpoint');if(o.kind==='pack-access'&&(!['NONE','OBSERVER'].includes(o.level)||!cp.mutations.some(m=>m.kind==='pack-configuration'&&m.level===o.level)))errors.push('Pack access control receipt requires an approved level and actual mutation receipt');}
    const seen=new Set();for(const capture of cp.captures){const e=admittedCaptureErrors(capture,cp.resources,plan.mode);errors.push(...e);if(seen.has(capture?.caseId))errors.push('Duplicate case capture');seen.add(capture?.caseId);if(!cp.operations.some(o=>o.kind==='begin'&&o.caseId===capture.caseId&&o.status===capture.summary?.launchStatus&&o.bodyExecuted===capture.summary?.bodyExecuted&&o.resolutionDenied===capture.summary?.resolutionDenied))errors.push('Actual begin/body/resolution checkpoint missing');}
    if(cp.captures.length&&cp.resources.length!==23)errors.push('Case observations require the complete finite manifest');
    if(cp.failure!==null&&(!object(cp.failure)||typeof cp.failure.reason!=='string'))errors.push('Malformed failure checkpoint');
    if(['player','reload'].includes(cp.phase)&&(cp.resources.length!==23||cp.mappings.length!==2||cp.packMappings.length!==2||!cp.operations.some(o=>o?.kind==='setup')))errors.push('Incomplete handoff checkpoint');
    if((cp.captures.length||['player','reload'].includes(cp.phase)||cp.operations.some(o=>o.kind==='grants'))&&(!cp.operations.some(o=>o.kind==='grants'&&same(o.coveredPlayers,C.accounts.coveredPlayers))||[...C.access.observerRoles,C.access.limitedRole].some(role=>!cp.mutations.some(m=>m.kind==='access'&&m.uuid===cp.resources.find(r=>r.role===role)?.uuid&&m.principal===C.pin.player&&m.level===(role===C.access.limitedRole?1:2)))))errors.push('Recorded grants/handoff lack actual finite grant receipts');
    if(cp.operations.filter(o=>o.kind==='setup').length>1||cp.operations.filter(o=>o.kind==='grants').length>1||cp.operations.some(o=>o.kind==='setup'&&(!same(o.counts,C.fixtures.counts)||cp.resources.length!==23)))errors.push('Setup/grant operation counts differ from actual finite manifest');
    return [...new Set(errors)];
}
export function admittedInputErrors(p){
    if(!jsonData(p))return ['Input must contain finite plain JSON data only'];
    const errors=[];if(!keys(p,Object.keys(createAdmittedFeatureReviewPlan())))return ['Fixed admitted input fields required'];const expected=createAdmittedFeatureReviewPlan();for(const k of ['schemaVersion','contract','kind','policy','reviewState','executionReadiness','externalGates','pin','target','accounts','fixturePlan','accessPlan','conversionPlan','previous','claims'])if(!same(p[k],expected[k]))errors.push('Fixed admitted policy/history/readiness changed: '+k);
    if(!['not-run','synthetic','native'].includes(p.mode))errors.push('Unknown observation mode');
    if(p.mode==='not-run'){if(p.batch!==null||p.baseline!==null||!same(p.checkpoint,emptyCheckpoint())||!same(p.evidence,expected.evidence))errors.push('Unexecuted preparation contains observations');errors.push(...runtimeErrors(p.runtime));}
    else{if(typeof p.batch!=='string'||!(p.mode==='synthetic'?/^synthetic-[A-Za-z0-9-]+$/:/^p05-feature-review-[0-9TZ]+-[a-f0-9]{8}$/).test(p.batch))errors.push('Explicit mode-bound batch required');errors.push(...admittedBaselineErrors(p.baseline),...runtimeErrors(p.runtime,{installed:true}),...admittedCheckpointErrors(p.checkpoint,p));}
    if(!keys(p.handoff,['revision','issued','acceptedSegments','genesisCheckpoint'])||!Number.isSafeInteger(p.handoff.revision)||p.handoff.revision<0||!Array.isArray(p.handoff.acceptedSegments)||p.handoff.revision!==p.handoff.acceptedSegments.length)errors.push('Malformed private handoff history');
    if(p.handoff?.issued!=null&&(!keys(p.handoff.issued,['packet','packetBytes','packetSha256','baselineSha256'])||publicAdmittedPacketErrors(p.handoff.issued.packet).length||typeof p.handoff.issued.packetBytes!=='string'||!hex(p.handoff.issued.packetSha256)||!hex(p.handoff.issued.baselineSha256)))errors.push('Malformed issued packet binding');
    if(Array.isArray(p.handoff?.acceptedSegments)&&p.handoff.acceptedSegments.some(a=>!keys(a,['segmentId','segmentSha256','segmentBytes','packetBytes','packetSha256','segment','packet'])||!hex(a.segmentSha256)||!hex(a.packetSha256)||typeof a.segmentBytes!=='string'||typeof a.packetBytes!=='string'||publicAdmittedPacketErrors(a.packet).length))errors.push('Malformed accepted segment binding');
    if(p.mode==='not-run'&&!same(p.handoff,expected.handoff))errors.push('Held preparation cannot manufacture private segment history');
    if(p.mode==='native'&&p.handoff?.genesisCheckpoint!==null&&!same(p.handoff?.genesisCheckpoint,emptyCheckpoint()))errors.push('Native genesis must precede every fixture/capture');
    if(p.handoff?.genesisCheckpoint!==null&&p.handoff?.genesisCheckpoint!==undefined)errors.push(...admittedCheckpointErrors(p.handoff.genesisCheckpoint,p));
    if(!keys(p.evidence,['status','conversion','closure','raw'])||!['not-run','incomplete','blocked','failed','captured'].includes(p.evidence?.status)||!Array.isArray(p.evidence?.raw))errors.push('Malformed evidence state');
    for(const ref of Array.isArray(p.evidence?.raw)?p.evidence.raw:[])if(!keys(ref,['path','sha256','kind','private'])||ref.private!==true||!/^raw\/[A-Za-z0-9._-]+\.json$/.test(ref.path)||!hex(ref.sha256)||!['case','conversion-before','conversion-after','closure','baseline','checkpoint','backup-manifest','controller-segment'].includes(ref.kind))errors.push('Unsafe/malformed raw reference');
    if(p.evidence?.conversion!==null){const v=p.evidence?.conversion;if(!keys(v,['source','before','after'])||v.source!==p.mode||!['before','after'].every(k=>keys(v[k],['path','sha256'])&&Array.isArray(p.evidence.raw)&&p.evidence.raw.some(r=>r.kind==='conversion-'+k&&r.path===v[k].path&&r.sha256===v[k].sha256)))errors.push('Complete captured before/after references required');}
    return [...new Set(errors)];
}
function jsonData(value,seen=new Set(),depth=0){
    if(value===null||typeof value==='string'||typeof value==='boolean')return true;if(typeof value==='number')return Number.isFinite(value);
    if(depth>128||typeof value!=='object'||!Array.isArray(value)&&!object(value)||Array.isArray(value)&&Object.getPrototypeOf(value)!==Array.prototype||seen.has(value))return false;
    seen.add(value);let count=0;for(const key of Reflect.ownKeys(value)){if(Array.isArray(value)&&key==='length')continue;if(typeof key!=='string'){seen.delete(value);return false;}if(Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length)){seen.delete(value);return false;}const d=Object.getOwnPropertyDescriptor(value,key);if(!d?.enumerable||!Object.hasOwn(d,'value')||!jsonData(d.value,seen,depth+1)){seen.delete(value);return false;}count++;}seen.delete(value);return !Array.isArray(value)||count===value.length;
}
/** Populate explicitly supplied observations; never generates or authenticates them. */
export function admittedCheckpointTransitionErrors(previous,next){const errors=[];for(const k of ['resources','mappings','packMappings','mutations','operations','captures'])if(!Array.isArray(previous?.[k])||!Array.isArray(next?.[k])||!same(next[k].slice(0,previous[k].length),previous[k]))errors.push('Checkpoint erased/rewrote '+k);if(previous?.failure!==null&&!same(previous?.failure,next?.failure))errors.push('Checkpoint erased/replaced the first failure');return errors;}
export function buildAdmittedFeatureReviewInputs(plan,observations={}){if(admittedInputErrors(plan).length)throw Error('Invalid base admitted plan');if(Object.keys(observations).some(k=>!['mode','batch','baseline','runtime','checkpoint','evidence'].includes(k)))throw Error('Unapproved input override');const value={...copy(plan),...copy(observations)},errors=admittedInputErrors(value);if(plan.mode!=='not-run'){for(const k of ['mode','batch','baseline','runtime'])if(!same(plan[k],value[k]))errors.push('Existing run baseline/identity changed '+k);errors.push(...admittedCheckpointTransitionErrors(plan.checkpoint,value.checkpoint));if(!same(value.evidence.raw.slice(0,plan.evidence.raw.length),plan.evidence.raw))errors.push('Prior raw proof bindings erased');}if(errors.length)throw Error(errors.join('; '));return value;}
export async function admittedControllerInputs(plan,options={}){return createAdmittedControllerPacket(plan,options);}
export function admittedIdentityErrors(identity,{gm=false}={}){if(!object(identity))return ['Native identity required'];const errors=[];if(identity.world!==C.pin.world||identity.title!==C.target.title||identity.core!==C.pin.core||identity.system!=='ptu'||identity.systemVersion!==C.pin.system||!same(identity.accounts,C.accounts.users)||![C.pin.gm,C.pin.player].includes(identity.user)||gm&&identity.user!==C.pin.gm)errors.push('Exact native world/runtime/accounts/principal required');return errors;}
export function admittedCaptureErrors(c,resources,mode){
    if(!keys(c,['source','caseId','summary','identity','runtime','targets','permissions','prepared','resolution','navigation','view','issues','before','after','events','dom'])||!C.cases.includes(c.caseId))return ['Unknown/malformed case capture'];const errors=[],p=C.casePlans.find(p=>p.id===c.caseId),s=c.summary;
    if(c.source!==mode||!['synthetic','native'].includes(c.source))errors.push('Synthetic/native substitution');errors.push(...admittedIdentityErrors(c.identity),...runtimeErrors(c.runtime,{installed:true,served:true}));
    if(!object(s)||s.native!==true||s.coreVersion!==C.pin.core||s.world!==C.pin.world||s.userId!==(c.caseId.startsWith('gm-')?C.pin.gm:C.pin.player)||s.userId!==c.identity?.user||typeof s.bodyExecuted!=='boolean'||typeof s.resolutionDenied!=='boolean'||typeof s.statePreserved!=='boolean'||!hex(s.beforeSha256)||!hex(s.afterSha256)||!Array.isArray(s.checks)||s.checks.length===0||s.checks.some(r=>!object(r)||typeof r.name!=='string'||typeof r.passed!=='boolean')||Array.isArray(s.checks)&&new Set(s.checks.map(r=>r?.name)).size!==s.checks.length)errors.push('Malformed observed summary');
    const actor=resources.find(r=>r.role===p.actorRole),incoming=p.incomingRoles.map(role=>resources.find(r=>r.role===role)?.uuid),t=c.targets;
    if(!object(t)||t.actor!==actor?.uuid||!Array.isArray(t.incoming)||incoming.some(v=>!v)||(p.incomingOrder==='explicit'?!same(t.incoming,incoming):t.incoming.length!==2||new Set(t.incoming).size!==2||t.incoming.some(v=>!incoming.includes(v))))errors.push('Actual requested targets/repetitions differ');
    if(!same(t?.sourceParents,c.caseId.includes('source-parent')?[resources.find(r=>r.role==='source-parent')?.uuid]:[])||!same(t?.packs,c.caseId.includes('pack-')?[C.fixtures.pack]:[]))errors.push('Actual source-parent/pack context differs');
    if(!keys(c.permissions,['actor','incoming','sourceParents','packs'])||!(c.permissions.actor===null||typeof c.permissions.actor==='boolean')||!Array.isArray(c.permissions.incoming)||c.permissions.incoming.some(r=>!keys(r,['uuid','readable'])||typeof r.uuid!=='string'||typeof r.readable!=='boolean')||!Array.isArray(c.permissions.sourceParents)||!Array.isArray(c.permissions.packs))errors.push('Actual permission observations required');
    if(c.permissions?.actor===true?(!keys(c.prepared,['level','rank'])||!Number.isFinite(c.prepared.level)||!Number.isFinite(c.prepared.rank)):c.prepared!==null)errors.push('Prepared facts require actual Actor read permission');
    if(t?.resolvedActor!==null&&t?.resolvedActor!==t?.actor||!Array.isArray(t?.resolvedIncoming)||t.resolvedIncoming.some(v=>!t.incoming.includes(v))||!same(t?.resolvedIncoming,c.permissions?.incoming?.map(r=>r.uuid)))errors.push('Resolved target/permission context differs');
    if(!validSnapshot(c.before)||!validSnapshot(c.after)||!Array.isArray(c.events)||!object(c.navigation)||!Number.isFinite(c.navigation.timeOrigin)||c.navigation.timeOrigin<=0)errors.push('Actual snapshots/events/navigation required');
    if(Array.isArray(c.events)&&c.events.some(e=>!object(e)||!['focusin','keydown','click'].includes(e.event)))errors.push('Malformed actual event');
    if(s?.resolutionDenied&&(s.bodyExecuted||s.launchStatus!=='not-opened'||c.view!==null||!c.resolution?.error))errors.push('Resolution denial cannot claim launcher coverage');if(!s?.resolutionDenied&&s?.bodyExecuted!==true)errors.push('Launcher body coverage missing');
    if(s?.launchStatus==='review-requested'&&!object(c.view))errors.push('Actual dialog view required');if(!Array.isArray(c.issues))errors.push('Launcher issues required');return [...new Set(errors)];
}
function validSnapshot(s){if(!keys(s,['collections','packRows','settingsSha256','usersSha256'])||!keys(s.collections,C.collections)||!hex(s.settingsSha256)||!hex(s.usersSha256)||!Array.isArray(s.packRows))return false;return [...Object.values(s.collections),s.packRows].every(rows=>Array.isArray(rows)&&new Set(rows.map(r=>r?.id)).size===rows.length&&rows.every(r=>keys(r,['id','sha256'])&&id(r.id)&&hex(r.sha256)));}
/** Compare captured closure payloads. No filesystem or world access. */
export function admittedClosureErrors(b,closure,resources){
    const errors=[];if(!jsonData(closure)||admittedBaselineErrors(b).length||!Array.isArray(resources)||resources.some(r=>!object(r))||!keys(closure,['world','settings','protectedDocuments','users','system','sessions','runWindow','cleanup','exit','process','originalBackups','configurationSha256','claims']))return ['Complete captured closure and owned manifest required'];
    const w=closure.world,window=closure.runWindow;if(!object(w)||!object(window)||!Number.isSafeInteger(window.startMs)||!Number.isSafeInteger(window.endMs)||window.endMs<window.startMs)return ['Malformed closure world/time window'];
    const expected=copy(b.world);if(w.lastPlayed!==expected.lastPlayed){const t=Date.parse(w.lastPlayed);if(!Number.isFinite(t)||t<window.startMs-1000||t>window.endMs)errors.push('Unexpected lastPlayed');expected.lastPlayed=w.lastPlayed;}
    let seconds=0,end=window.startMs;if(!Array.isArray(closure.sessions))errors.push('Measured session intervals required');else for(const s of closure.sessions){if(!keys(s,['startMs','endMs'])||!Number.isSafeInteger(s.startMs)||!Number.isSafeInteger(s.endMs)||s.startMs<end||s.endMs<s.startMs||s.endMs>window.endMs)errors.push('Invalid/overlapping measured session interval');else{seconds+=Math.round((s.endMs-s.startMs)/1000);end=s.endMs;}}
    if(!Number.isSafeInteger(b.world.playtime)||b.world.playtime<0||w.playtime!==b.world.playtime+seconds)errors.push('Playtime differs from native rounded seconds');expected.playtime=w.playtime;if(!same(expected,w))errors.push('Unexpected world/pack metadata change');
    if(!Array.isArray(closure.settings)||closure.settings.length!==b.settings.length)errors.push('Settings denominator changed');else{const seen=new Set();for(const before of b.settings){const after=closure.settings.find(s=>s?._id===before._id&&s.key===before.key);if(!after||seen.has(after._id)){errors.push('Setting identity changed');continue;}seen.add(after._id);const e=copy(before);if(C.residualPolicy.settings.includes(before.key)&&after._stats?.modifiedTime!==before._stats?.modifiedTime){const t=after._stats?.modifiedTime;if(!Number.isSafeInteger(t)||t<window.startMs||t>window.endMs)errors.push('Unexpected setting timestamp');if(!object(e._stats))errors.push('Missing predecessor setting metadata');else e._stats.modifiedTime=t;}if(!same(e,after))errors.push('Unexpected setting value/metadata change');}}
    if(closure.configurationSha256!==b.configurationSha256)errors.push('Opaque server configuration bytes changed');
    if(!same(b.protectedDocuments,closure.protectedDocuments)||!same(b.users,closure.users))errors.push('Protected documents/security changed');if(!same(b.priorSystem,closure.system)||!closure.system?.length)errors.push('Prior disposable system byte manifest differs');
    if(!same(closure.originalBackups,{retained:true,manifestSha256:C.originalBackups.manifestSha256,worldEntriesSha256:C.originalBackups.worldEntriesSha256,systemEntriesSha256:C.originalBackups.systemEntriesSha256}))errors.push('Original backups changed/unverified');
    if(!keys(closure.cleanup,['uncertain','grantsRestored','packConfiguration','removed'])||closure.cleanup.uncertain!==false||closure.cleanup.grantsRestored!==true||!same(closure.cleanup.packConfiguration,b.packConfiguration)||!Array.isArray(closure.cleanup.removed)||!same([...closure.cleanup.removed].sort(),resources.map(r=>r.uuid).sort()))errors.push('Cleanup/access/configuration incomplete or uncertain');
    if(!keys(closure.exit,['gmDeactivated','setupNavigated','administratorAuthentication','route','worldActive'])||closure.exit.gmDeactivated!==true||closure.exit.setupNavigated!==true||closure.exit.route!=='/setup'||closure.exit.worldActive!==false||!['not-required','unverified','confirmed-by-owner'].includes(closure.exit.administratorAuthentication))errors.push('Normal exit/Setup navigation unavailable or unverified');
    if(!keys(closure.process,['owned','stopped','portReleased','lockReleased','pid','dataPath'])||closure.process.owned!==true||closure.process.stopped!==true||closure.process.portReleased!==true||closure.process.lockReleased!==true||!Number.isSafeInteger(closure.process.pid)||closure.process.pid<=0||closure.process.dataPath!==C.target.worldPath.split('/Data/')[0])errors.push('Owned-process closure uncertain');if(!same(closure.claims,claims()))errors.push('Closure cannot authenticate authority/full restoration');return [...new Set(errors)];
}

// Public control packets contain fixture facts and commitments only. Private
// baselines, observations and detailed failures never enter this data format.
const publicKind='public-feature-review-controller-packet';
const mutationKinds=['create','macro-tag','access','pack-configuration','fresh-capture','delete','delete-with-parent'];
const controlKinds=['setup','grants','pack-access'];
const token=v=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,100}$/.test(v);
export async function admittedDataSha256(value){const text=typeof value==='string'?value:admittedCanonical(value),bytes=new TextEncoder().encode(text),hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');}
function publicResource(r){const value={uuid:r.uuid,id:r.id,kind:r.kind,role:r.role,type:r.type,batch:r.batch,created:r.created,synthetic:r.synthetic};if(r.parentUuid!==undefined)value.parentUuid=r.parentUuid;if(r.kind==='Pack')value.collection=r.collection;return value;}
function receiptFields(kind){return mutationKinds.includes(kind)?['kind','uuid','userId','batch',...(kind==='access'?['principal','level']:kind==='pack-configuration'?['role','level']:kind==='fresh-capture'?['paths']:[])]:kind==='setup'?['kind','counts']:kind==='grants'?['kind','coveredPlayers']:kind==='pack-access'?['kind','level']:null;}
function publicReceipt(r){const fields=receiptFields(r.kind);if(!fields)throw Error('Unknown public receipt');return Object.fromEntries(fields.map(k=>[k,copy(r[k])]));}
export function publicControlState(packet){return {phase:packet.phase,resources:packet.resources.map(publicResource),mappings:copy(packet.mappings),packMappings:copy(packet.packMappings),mutations:packet.controlReceipts.filter(r=>mutationKinds.includes(r.kind)).map(publicReceipt),operations:packet.controlReceipts.filter(r=>controlKinds.includes(r.kind)).map(publicReceipt),captures:[],failure:null};}
export function publicAdmittedControlErrors(control,{mode,batch,completedCaseIds=[]}={}){const errors=admittedCheckpointErrors({...control,captures:[],failure:null},{mode,batch,baseline:null});if(completedCaseIds.length){const asHandoff={...control,phase:'reload',captures:[],failure:null};errors.push(...admittedCheckpointErrors(asHandoff,{mode,batch,baseline:null}));}return [...new Set(errors)];}
export function publicAdmittedPacketErrors(packet){
    if(!jsonData(packet)||!keys(packet,['schemaVersion','kind','contract','mode','batch','audience','anchor','phase','runtime','resources','mappings','packMappings','controlReceipts','resume','baselineChecks']))return ['Explicit public controller packet required; private plans are forbidden'];
    const errors=[];if(packet.schemaVersion!==1||packet.kind!==publicKind||packet.contract!==C.id||!['not-run','synthetic','native'].includes(packet.mode))errors.push('Fixed public packet contract required');
    if(!keys(packet.audience,['userId','role'])||!keys(packet.anchor,['packetId','segmentId','revision','checkpointSha256'])||!keys(packet.resume,['completedCaseIds','stopLatched','firstFailureRef'])||!keys(packet.baselineChecks,['bootstrapMacroUuid','packConfigurationSha256']))return [...errors,'Unknown public nested field'];
    if(!['initial','gm','player','reload','cleanup'].includes(packet.phase)||!Number.isSafeInteger(packet.anchor.revision)||packet.anchor.revision<0||!Array.isArray(packet.controlReceipts)||!Array.isArray(packet.resources)||!Array.isArray(packet.mappings)||!Array.isArray(packet.packMappings)||!Array.isArray(packet.resume.completedCaseIds)||new Set(packet.resume.completedCaseIds).size!==packet.resume.completedCaseIds.length||packet.resume.completedCaseIds.some(v=>!C.cases.includes(v))||typeof packet.resume.stopLatched!=='boolean')return [...errors,'Malformed public control state'];
    if(packet.resume.stopLatched?!hex(packet.resume.firstFailureRef):packet.resume.firstFailureRef!==null)errors.push('Stop latch/failure commitment differs');
    if(packet.mode==='not-run'){if(packet.batch!==null||!same(packet.audience,{userId:null,role:null})||!same(packet.anchor,{packetId:null,segmentId:null,revision:0,checkpointSha256:null})||packet.phase!=='initial'||packet.resources.length||packet.mappings.length||packet.packMappings.length||packet.controlReceipts.length||packet.resume.completedCaseIds.length||packet.resume.stopLatched||!same(packet.baselineChecks,{bootstrapMacroUuid:null,packConfigurationSha256:null}))errors.push('Held public packet cannot contain fresh observations');}
    else{const account=C.accounts.users.find(u=>u.id===packet.audience.userId);if(!account||account.role!==packet.audience.role||packet.phase==='initial'&&account.id!==C.pin.gm||packet.phase==='player'&&account.id!==C.pin.player||packet.phase==='gm'&&account.id!==C.pin.gm||packet.phase==='cleanup'&&account.id!==C.pin.gm)errors.push('Public audience/phase mismatch');if(typeof packet.batch!=='string'||!(packet.mode==='synthetic'?/^synthetic-[A-Za-z0-9-]+$/:/^p05-feature-review-[0-9TZ]+-[a-f0-9]{8}$/).test(packet.batch)||!token(packet.anchor.packetId)||!token(packet.anchor.segmentId)||!hex(packet.anchor.checkpointSha256))errors.push('Explicit public segment anchor required');if(!/^Macro\.[A-Za-z0-9]{16}$/.test(packet.baselineChecks.bootstrapMacroUuid)||!hex(packet.baselineChecks.packConfigurationSha256))errors.push('Private baseline commitments/bootstrap observation required');}
    if(!Array.isArray(packet.runtime)||packet.runtime.length!==16||new Set(packet.runtime.map(r=>r?.path)).size!==16)errors.push('Fixed public16 runtime bindings required');else for(const r of packet.runtime)if(!keys(r,['path','packaged','installed'])||r.packaged!==C.runtime[r.path]||!Object.hasOwn(C.runtime,r.path)||r.installed!==(packet.mode==='not-run'?null:r.packaged))errors.push('Public runtime binding mismatch');
    for(const r of packet.controlReceipts){const fields=receiptFields(r?.kind);if(!fields||!keys(r,fields))errors.push('Unlisted public receipt field/kind');}
    errors.push(...admittedManifestErrors(packet.resources,packet.batch,null,packet.mode));
    if(errors.length)return [...new Set(errors)];errors.push(...publicAdmittedControlErrors(publicControlState(packet),{mode:packet.mode,batch:packet.batch,completedCaseIds:packet.resume.completedCaseIds}));
    const macro=packet.resources.find(r=>r.role==='test-macro');if(macro&&macro.uuid!==packet.baselineChecks.bootstrapMacroUuid)errors.push('Bootstrap macro/manifest mismatch');return [...new Set(errors)];
}
/** Construct each public field explicitly. Hashes are consistency commitments,
 * never owner consent, access verification or native-execution authority. */
export async function createAdmittedControllerPacket(plan,options={}){
    const errors=admittedInputErrors(plan);if(errors.length)throw Error(errors.join('; '));if(!object(options)||Object.keys(options).some(k=>!['packetId','segmentId','userId','phase','bootstrapMacroUuid'].includes(k)))throw Error('Unknown packet-construction option');
    if(plan.mode==='not-run'){if(Object.keys(options).length)throw Error('Held preparation cannot acquire identifiers/audience');return {schemaVersion:1,kind:publicKind,contract:C.id,mode:'not-run',batch:null,audience:{userId:null,role:null},anchor:{packetId:null,segmentId:null,revision:0,checkpointSha256:null},phase:'initial',runtime:plan.runtime.map(r=>({path:r.path,packaged:r.packaged,installed:null})),resources:[],mappings:[],packMappings:[],controlReceipts:[],resume:{completedCaseIds:[],stopLatched:false,firstFailureRef:null},baselineChecks:{bootstrapMacroUuid:null,packConfigurationSha256:null}};}
    const account=C.accounts.users.find(u=>u.id===options.userId),macro=plan.checkpoint.resources.find(r=>r.role==='test-macro')?.uuid??options.bootstrapMacroUuid;
    if(!account||!token(options.packetId)||!token(options.segmentId)||!/^Macro\.[A-Za-z0-9]{16}$/.test(macro)||options.bootstrapMacroUuid&&options.bootstrapMacroUuid!==macro||plan.baseline.ids.macros.includes(macro?.split('.')[1]))throw Error('Explicit audience/IDs and a privately excluded new macro required');
    const receipts=[...plan.checkpoint.mutations.map(publicReceipt),...plan.checkpoint.operations.filter(r=>controlKinds.includes(r.kind)).map(publicReceipt)];
    const packet={schemaVersion:1,kind:publicKind,contract:C.id,mode:plan.mode,batch:plan.batch,audience:{userId:account.id,role:account.role},anchor:{packetId:options.packetId,segmentId:options.segmentId,revision:plan.handoff.revision,checkpointSha256:await admittedDataSha256(plan.checkpoint)},phase:options.phase??plan.checkpoint.phase,runtime:plan.runtime.map(r=>({path:r.path,packaged:r.packaged,installed:r.installed})),resources:plan.checkpoint.resources.map(publicResource),mappings:copy(plan.checkpoint.mappings),packMappings:copy(plan.checkpoint.packMappings),controlReceipts:receipts,resume:{completedCaseIds:plan.checkpoint.captures.map(c=>c.caseId),stopLatched:plan.checkpoint.failure!==null,firstFailureRef:plan.checkpoint.failure?await admittedDataSha256(plan.checkpoint.failure):null},baselineChecks:{bootstrapMacroUuid:macro,packConfigurationSha256:await admittedDataSha256(plan.baseline.packConfiguration)}};
    const publicErrors=publicAdmittedPacketErrors(packet);if(publicErrors.length)throw Error(publicErrors.join('; '));return packet;
}
export async function issueAdmittedControllerPacket(plan,options){
    if(plan.mode==='not-run')throw Error('No executable segment may be issued from held preparation');
    if(plan.mode==='native'&&plan.handoff.revision===0&&!same(plan.checkpoint,emptyCheckpoint()))throw Error('Native segment history must start before fixture creation');
    const packet=await createAdmittedControllerPacket(plan,options),packetBytes=JSON.stringify(packet),packetSha256=await admittedDataSha256(packetBytes),baselineSha256=await admittedDataSha256(plan.baseline);
    if(plan.handoff.acceptedSegments.some(r=>r.segmentId===packet.anchor.segmentId))throw Error('Accepted segment ID cannot be reused');
    if(plan.handoff.issued){if(plan.handoff.issued.packetBytes!==packetBytes||plan.handoff.issued.baselineSha256!==baselineSha256)throw Error('One outstanding serial handoff only; stale/forked issue refused');return {plan:copy(plan),packet,packetBytes};}
    const next=copy(plan);if(next.handoff.genesisCheckpoint===null)next.handoff.genesisCheckpoint=copy(plan.checkpoint);next.handoff.issued={packet:copy(packet),packetBytes,packetSha256,baselineSha256};return {plan:next,packet,packetBytes};
}
function operationErrors(o){if(!object(o)||typeof o.kind!=='string')return ['Malformed local operation'];const fields={setup:['kind','counts'],grants:['kind','coveredPlayers'],'pack-access':['kind','level'],begin:['kind','caseId','status','bodyExecuted','resolutionDenied'],'fresh-update':['kind','oldView','oldViewAfter','oldCaptureUnchanged','beforeActor','afterActor','before','after','prepared'],checkpoint:['kind','snapshot'],'cleanup-before-macro-delete':['kind','snapshot'],'macro-deleted':['kind'],resume:['kind','userId','navigation'],'checkpoint-import':['kind','userId','navigation'],failure:['kind','reason',...(Object.hasOwn(o,'operation')?['operation']:[]),...(Object.hasOwn(o,'caseId')?['caseId']:[]),...(Object.hasOwn(o,'checks')?['checks']:[])]}[o.kind];return !fields||!keys(o,fields)?['Unknown/unlisted local operation field']:[];}
export function admittedControllerSegmentErrors(segment,packet){
    if(!jsonData(segment)||!keys(segment,['packetId','segmentId','parentRevision','parentCheckpointSha256','packetSha256','identity','runtime','navigation','events','mutations','captures','controlState','firstFailure']))return ['Explicit browser-local segment required'];
    const errors=publicAdmittedPacketErrors(packet);if(errors.length)return errors;
    if(segment.packetId!==packet.anchor.packetId||segment.segmentId!==packet.anchor.segmentId||segment.parentRevision!==packet.anchor.revision||segment.parentCheckpointSha256!==packet.anchor.checkpointSha256||!hex(segment.packetSha256))errors.push('Segment packet/parent anchor mismatch');
    errors.push(...admittedIdentityErrors(segment.identity),...runtimeErrors(segment.runtime,{installed:true,served:true}));
    if(!keys(segment.identity,['world','title','core','system','systemVersion','user','accounts'])||segment.identity?.user!==packet.audience.userId)errors.push('Segment audience/principal substitution');
    if(!keys(segment.navigation,['timeOrigin','type'])||!Number.isFinite(segment.navigation.timeOrigin)||segment.navigation.timeOrigin<=0||!Array.isArray(segment.events)||!Array.isArray(segment.mutations)||!Array.isArray(segment.captures)||!keys(segment.controlState,['phase','resources','mappings','packMappings']))return [...errors,'Malformed local segment arrays/control state'];
    if(!Array.isArray(segment.controlState.resources)||!Array.isArray(segment.controlState.mappings)||!Array.isArray(segment.controlState.packMappings))return [...errors,'Malformed local resources/mappings'];
    if(!(packet.audience.userId===C.pin.player?['player','reload']:['initial','gm','reload','cleanup']).includes(segment.controlState.phase))errors.push('Segment control phase/principal mismatch');
    if(!same(segment.controlState.resources.slice(0,packet.resources.length),packet.resources))errors.push('Segment rewrote prior manifest');
    if(!same(segment.controlState.mappings.slice(0,packet.mappings.length),packet.mappings)||!same(segment.controlState.packMappings.slice(0,packet.packMappings.length),packet.packMappings))errors.push('Segment erased prior mapping data');
    if(packet.audience.userId===C.pin.player&&(segment.mutations.length||!same(segment.controlState.resources,packet.resources)||!same(segment.controlState.mappings,packet.mappings)||!same(segment.controlState.packMappings,packet.packMappings)))errors.push('Player segment cannot manufacture GM mutations/control changes');
    const controls=publicControlState(packet),prefix=copy(controls),seenMutations=new Set(),seenCaptures=new Set(),operations=[],known=new Set(packet.resources.map(r=>r.uuid)),deleted=new Set(controls.mutations.filter(r=>['delete','delete-with-parent'].includes(r.kind)).map(r=>r.uuid));
    let firstFailure=null;
    const levelFor=role=>{const uuid=prefix.resources.find(r=>r.role===role)?.uuid;return prefix.mutations.filter(m=>m.kind==='access'&&m.uuid===uuid&&m.principal===C.pin.player).at(-1)?.level??0;};
    const setupReady=()=>prefix.resources.length===23&&prefix.resources.every(r=>known.has(r.uuid)&&!deleted.has(r.uuid))&&prefix.mappings.length===2&&prefix.packMappings.length===2&&same(prefix.mappings,admittedMappings(prefix.resources,packet.batch))&&same(prefix.packMappings,admittedMappings(prefix.resources,packet.batch,true))&&prefix.operations.some(o=>o.kind==='setup'&&same(o.counts,C.fixtures.counts));
    const grantsReady=()=>setupReady()&&prefix.operations.some(o=>o.kind==='grants'&&same(o.coveredPlayers,C.accounts.coveredPlayers))&&[...C.access.observerRoles,C.access.limitedRole].every(role=>prefix.mutations.some(m=>m.kind==='access'&&m.uuid===prefix.resources.find(r=>r.role===role)?.uuid&&m.principal===C.pin.player&&m.level===(role===C.access.limitedRole?1:2)));
    function requireReviewPrefix(caseId){
        const gm=packet.audience.userId===C.pin.gm;
        if(!C.cases.includes(caseId)||caseId.startsWith('gm-')!==gm||!(gm?['gm','reload']:['player','reload']).includes(prefix.phase)||packet.resume.stopLatched||firstFailure!==null||!grantsReady()||admittedCheckpointErrors(prefix,{mode:packet.mode,batch:packet.batch,baseline:null}).length){errors.push('Review event-prefix lacks prior complete creation/setup/grants or permitted phase');return;}
        if(caseId.includes('source-parent')&&levelFor('source-parent')!==(caseId==='player-denied-source-parent'?0:2))errors.push('Source-parent event-prefix access does not match the case');
        if(caseId.includes('pack-')){
            const levels=prefix.mutations.filter(m=>m.kind==='pack-configuration').map(m=>m.level),current=levels.at(-1)??'NONE';
            if(current!==(caseId==='player-pack-observer'?'OBSERVER':'NONE'))errors.push('Pack event-prefix access does not match the case');
            if(caseId==='player-pack-revoked'&&(!levels.includes('OBSERVER')||!packet.resume.completedCaseIds.includes('player-pack-observer')&&![...seenCaptures].some(n=>segment.captures[n]?.caseId==='player-pack-observer')))errors.push('Revoked event-prefix lacks prior Observer capture/control');
        }
    }
    for(let n=0;n<segment.events.length;n++){
        const e=segment.events[n];if(!object(e)||e.sequence!==n){errors.push('Reordered/noncontiguous local event');continue;}
        if(e.kind==='operation'){
            if(!keys(e,['sequence','kind','value'])||!object(e.value)){errors.push('Unlisted operation event');continue;}
            const o=e.value;errors.push(...operationErrors(o));
            if(o.kind==='begin')requireReviewPrefix(o.caseId);
            if(packet.audience.userId===C.pin.player&&['setup','grants','pack-access','fresh-update','cleanup-before-macro-delete','macro-deleted'].includes(o.kind))errors.push('Player segment cannot manufacture GM operations');
            if(['resume','checkpoint-import'].includes(o.kind)&&(o.userId!==packet.audience.userId||!same(o.navigation,segment.navigation)))errors.push('Local navigation/principal substitution');
            if(o.kind==='setup'){
                // Mapping construction completes with setup, after its fixture creates.
                prefix.mappings=copy(segment.controlState.mappings);prefix.packMappings=copy(segment.controlState.packMappings);
                if(prefix.phase!=='gm'||prefix.resources.length!==23||prefix.resources.some(r=>deleted.has(r.uuid))||!same(o.counts,C.fixtures.counts)||prefix.mappings.length!==2||prefix.packMappings.length!==2)errors.push('Setup event-prefix lacks its prior finite fixture creation/mappings');
            }
            if(o.kind==='grants'&&(!setupReady()||[...C.access.observerRoles,C.access.limitedRole].some(role=>levelFor(role)!==(role===C.access.limitedRole?1:2))))errors.push('Grants event-prefix lacks prior setup and actual finite access receipts');
            if(o.kind==='pack-access'&&!prefix.mutations.some(m=>m.kind==='pack-configuration'&&m.level===o.level))errors.push('Pack event-prefix lacks prior configuration receipt');
            if(['cleanup-before-macro-delete','macro-deleted'].includes(o.kind))prefix.phase='cleanup';
            operations.push(o);prefix.operations.push(o);
            if(o.kind==='failure'&&firstFailure===null){firstFailure=copy(o);delete firstFailure.kind;}
        }else if(e.kind==='mutation'){
            if(!keys(e,['sequence','kind','index'])||e.index!==seenMutations.size||!object(segment.mutations[e.index])){errors.push('Mutation event order/index mismatch');continue;}
            seenMutations.add(e.index);const m=segment.mutations[e.index],fields=receiptFields(m.kind),resource=segment.controlState.resources.find(r=>r?.uuid===m.uuid);
            if(!fields||!keys(m,fields)||m.userId!==packet.audience.userId)errors.push('Mutation source/field mismatch');
            if(m.kind==='create'){
                if(known.has(m.uuid)||!resource||resource.parentUuid&&!known.has(resource.parentUuid))errors.push('Creation order/adoption mismatch');
                if(resource&&!known.has(m.uuid))prefix.resources.push(resource);known.add(m.uuid);if(prefix.phase==='initial')prefix.phase='gm';
            }else if(!known.has(m.uuid)||deleted.has(m.uuid))errors.push('Mutation precedes creation or follows deletion');
            if(m.kind==='delete-with-parent'&&!deleted.has(resource?.parentUuid))errors.push('Embedded deletion lacks owned parent deletion');
            if(['delete','delete-with-parent'].includes(m.kind)){deleted.add(m.uuid);prefix.phase='cleanup';}
            // Only source-parent NONE is an approved review-time named revocation.
            if(m.kind==='access'&&m.level===0&&resource?.role!=='source-parent')prefix.phase='cleanup';
            prefix.mutations.push(m);
        }else if(e.kind==='capture'){
            if(!keys(e,['sequence','kind','index'])||e.index!==seenCaptures.size||!object(segment.captures[e.index])){errors.push('Capture event order/index mismatch');continue;}
            const c=segment.captures[e.index];requireReviewPrefix(c.caseId);seenCaptures.add(e.index);
            errors.push(...admittedCaptureErrors(c,segment.controlState.resources,packet.mode));
            if(firstFailure!==null)errors.push('Local stopped segment cannot resume reviews');
            if(c.identity?.user!==packet.audience.userId||!same(c.navigation,segment.navigation)||!operations.some(o=>o.kind==='begin'&&o.caseId===c.caseId&&o.status===c.summary?.launchStatus&&o.bodyExecuted===c.summary?.bodyExecuted&&o.resolutionDenied===c.summary?.resolutionDenied))errors.push('Capture did not originate in this segment/principal');
        }else errors.push('Unknown local event kind');
    }
    if(seenMutations.size!==segment.mutations.length||seenCaptures.size!==segment.captures.length)errors.push('Unreferenced local observations');
    if(!same(firstFailure,segment.firstFailure))errors.push('Local first failure erased/substituted');if(packet.resume.stopLatched&&segment.captures.length)errors.push('Stopped segment cannot resume reviews');
    if(prefix.phase==='cleanup'&&segment.controlState.phase!=='cleanup')errors.push('Segment rewrote causal cleanup phase');
    if(segment.captures.some(c=>packet.resume.completedCaseIds.includes(c?.caseId))||new Set(segment.captures.map(c=>c?.caseId)).size!==segment.captures.length)errors.push('Duplicate/recounted case');
    const combined={phase:segment.controlState.phase,resources:segment.controlState.resources,mappings:segment.controlState.mappings,packMappings:segment.controlState.packMappings,mutations:[...controls.mutations,...segment.mutations],operations:[...controls.operations,...operations],captures:segment.captures,failure:segment.firstFailure};
    errors.push(...admittedCheckpointErrors(combined,{mode:packet.mode,batch:packet.batch,baseline:null}));return [...new Set(errors)];
}
export async function mergeAdmittedControllerSegment(plan,segment,{segmentBytes=JSON.stringify(segment)}={}){
    const errors=admittedInputErrors(plan);if(errors.length)throw Error(errors.join('; '));if(!same(JSON.parse(segmentBytes),segment))throw Error('Segment bytes/semantic value differ');const segmentSha256=await admittedDataSha256(segmentBytes),accepted=plan.handoff.acceptedSegments.find(r=>r.segmentId===segment.segmentId);
    if(accepted){if(accepted.segmentSha256!==segmentSha256||accepted.segmentBytes!==segmentBytes)throw Error('Accepted segment ID reused with different bytes');const acceptedErrors=admittedControllerSegmentErrors(segment,accepted.packet);if(acceptedErrors.length)throw Error(acceptedErrors.join('; '));return copy(plan);}
    const issued=plan.handoff.issued;if(!issued)throw Error('No outstanding privately issued packet');const packet=issued.packet;
    if(issued.packetSha256!==await admittedDataSha256(issued.packetBytes)||!same(JSON.parse(issued.packetBytes),packet)||issued.baselineSha256!==await admittedDataSha256(plan.baseline)||packet.anchor.revision!==plan.handoff.revision||packet.anchor.checkpointSha256!==await admittedDataSha256(plan.checkpoint)||segment.packetSha256!==issued.packetSha256)throw Error('Changed private baseline/history or stale packet bytes');
    const reconstructed=await createAdmittedControllerPacket(plan,{packetId:packet.anchor.packetId,segmentId:packet.anchor.segmentId,userId:packet.audience.userId,phase:packet.phase,bootstrapMacroUuid:packet.baselineChecks.bootstrapMacroUuid});if(!same(reconstructed,packet))throw Error('Issued packet differs from latest validated private checkpoint');
    const segmentErrors=admittedControllerSegmentErrors(segment,packet);if(segmentErrors.length)throw Error(segmentErrors.join('; '));
    const next=copy(plan),cp=next.checkpoint;cp.resources=copy(segment.controlState.resources);cp.mappings=copy(segment.controlState.mappings);cp.packMappings=copy(segment.controlState.packMappings);cp.phase=segment.controlState.phase;
    for(const e of segment.events){if(e.kind==='operation')cp.operations.push(copy(e.value));else if(e.kind==='mutation')cp.mutations.push(copy(segment.mutations[e.index]));else if(e.kind==='capture')cp.captures.push(copy(segment.captures[e.index]));}
    if(cp.failure===null&&segment.firstFailure!==null)cp.failure=copy(segment.firstFailure);if(cp.failure!==null&&cp.phase==='initial')cp.phase='cleanup';
    next.handoff.acceptedSegments.push({segmentId:segment.segmentId,segmentSha256,segmentBytes,packetBytes:issued.packetBytes,packetSha256:issued.packetSha256,segment:copy(segment),packet:copy(packet)});next.handoff.revision++;next.handoff.issued=null;
    const finalErrors=admittedInputErrors(next);if(finalErrors.length)throw Error(finalErrors.join('; '));return next;
}
