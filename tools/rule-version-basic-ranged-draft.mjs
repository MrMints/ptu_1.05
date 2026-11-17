import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Frozen inputs and proposal-local IDs. None are runtime mapping decisions.
const PINS = {
  "commit": "f14f0b4b2e7f37b9658b3d609dd15f70ce9df7de",
  "files": {
    "featureEvidence": {
      "path": "docs/data/feature-source-evidence.json",
      "blob": "5d29ce7d8d9af3955d92b2beb6749022b447bfd9",
      "raw": {
        "lf": {
          "bytes": 9481207,
          "sha256": "7ce6733c54a2ec853fff10f7366cd3c27655f3a9acc4858e2ffb1767f3d44c10"
        },
        "crlf": {
          "bytes": 9678863,
          "sha256": "a2be64a49886c37ff3e723b1ad3508d5c7cbf9a0ba4d6c77e27e893aa951d73d"
        }
      }
    },
    "itemTemplate": {
      "path": "template.json",
      "blob": "f753ba3d552b3043d9fc43d073cb58440bbaad87",
      "raw": {
        "lf": {
          "bytes": 18633,
          "sha256": "153a42fcfd7449f3de6d87949ec05c569c1e33eae6fbdd79f0ab8f46282ca7c9"
        },
        "crlf": {
          "bytes": 19515,
          "sha256": "97a664dc78173c5e4c1601661286187710384118bea2fc2ddf55c1a4974f9bc4"
        }
      }
    },
    "preservationRecord": {
      "path": "packs/poke-edges/_source/WkzCUjTOCTI60Uwg.json",
      "blob": "3cfa877f92f1b008453ba445fc70f481d8c194d8",
      "raw": {
        "lf": {
          "bytes": 3200,
          "sha256": "cb2c9e49b7e3dcd788ad103834fd212d4417bc22563e6218e2c5ae9690d34570"
        }
      }
    }
  },
  "units": {
    "core": {
      "id": "core:205:feature-line39",
      "collection": "sourceDefinitions",
      "jsonSha256": "786cffb2a6c7078e1316ac5620f50a0059880510db84b705e9c484efccd78f85",
      "rawSha256": "6340e4ec81f7c5cb8d749dfbeaabccea69e5eb044751afe3a764f088f7bdb189"
    },
    "september": {
      "id": "sep-basic-ranged-level-directive",
      "collection": "generalContexts",
      "jsonSha256": "16a7ec1fdc2492493c260de4319bba349b776905e8872915c1072c15098db34c",
      "rawSha256": "7c04b57535cddecff338beae990d7679b27cee6415a33158cdc57190c7e7202e"
    },
    "framework": {
      "id": "poke-edge-framework",
      "collection": "generalContexts",
      "jsonSha256": "4ec5c9a740f506d97ed70482ec0e3a56e3857bd183447cfc502b1568e61f283b",
      "rawSha256": "2f6f5529b660ecac2b41d82acf02a90fb66e422a90fa061141dfaa82742cd0a5"
    }
  },
  "identities": [
    {
      "itemId": "CzQfjub6IRiN5EQx",
      "canonicalId": "uNTHgHbSDxgvMgpP",
      "versionId": "AAYXo2kDNeFElPkv"
    },
    {
      "itemId": "wFvfkLLJlpuOb3mf",
      "canonicalId": "uNTHgHbSDxgvMgpP",
      "versionId": "Bfhf75KagSKrJekI"
    }
  ],
  "identitySha256": "59c612474fcc3301e574c2e657c745c38780393d00570935dc3028222e6b6ab4",
  "schema": {
    "base": "7539a3f58cd4ed8f70769cbac1483cc4752a5654bd1c035bf1dba5f5b1a65940",
    "pokeedge": "76bb04451655a0f986ac9299b7934fe65797689ab96559670cb799c63c35c39a"
  },
  "inventory": {
    "method": "SHA256(JSON.stringify(sorted unique tracked pack-source filename IDs))",
    "trackedPathCount": 7395,
    "count": 7394,
    "jsonSha256": "22f7417fac6c4a09048c5a7b2cf2e26969307b31133a09c25283bc98539f44bf",
    "trackedPathsJsonSha256": "3753c69c130ce2274f5ed4b0c648b221d53e0b6488a25fcc2d45439425c1f056"
  },
  "allocation": {
    "generator": "node:crypto.randomInt over 62 alphanumeric symbols",
    "setsGenerated": 1,
    "regenerations": 0,
    "receipt": "c7bb8d",
    "executable": {
      "productVersion": "24.22.1",
      "bytes": 93713712,
      "sha256": "86f361a88f4cc3ecaf1ea93236b0d8edf07bf00fe87ad9f60305513f58fc2c17"
    },
    "exactIdCollisionSearch": {
      "passes": 1,
      "matches": 0,
      "exitCode": 1,
      "commit": "f14f0b4b2e7f37b9658b3d609dd15f70ce9df7de",
      "scope": [
        ":(glob)packs/*/_source/*.json",
        ":(glob)docs/data/**/*.json",
        ":(exclude,glob)docs/data/record-source-review/**"
      ]
    }
  }
};
const CONTRACT = {
  "schemaVersion": 1,
  "status": "inactive-source-only-draft",
  "scope": "Generations 1–8 only",
  "productionMapping": false,
  "generationEligibility": "unresolved",
  "approvals": {
    "production": false,
    "behavioralVerification": "not-run",
    "implemented": false,
    "automation": false
  },
  "case": {
    "caseId": "r04-r0248",
    "groupingCoordinate": "r04-c0247",
    "runtimeCanonicalId": null,
    "runtimeCounterpartId": null
  },
  "representation": {
    "mode": "proposal-only",
    "inRuntimeRegistry": false,
    "selectable": false,
    "wholeRecordMapping": false,
    "runtimeCapabilityIds": null,
    "capabilityLabelsAreSourceMetadata": true
  },
  "acquisition": {
    "prerequisites": "advisory",
    "diagnosticsImplementation": "held",
    "ownershipAndSecurity": "separate",
    "supportedScope": "separate",
    "effectUseConditions": "separate",
    "automaticTpSpend": false,
    "automaticRefund": false,
    "automaticGrants": false,
    "automaticRankChanges": false,
    "disableOrRemoveForUnmetPrerequisites": false
  },
  "frameworkContext": {
    "unitId": "poke-edge-framework",
    "application": "context-only",
    "trainingHours": 1,
    "printedPrerequisiteGate": true,
    "printedRemovalAndRefund": true,
    "implementsPrintedGate": false
  },
  "unresolvedAuthoring": [
    "runtime-capability-identities-and-mapping",
    "whole-record-mapping-and-adoption",
    "saved-choice-transfer-and-repetition",
    "advisory-diagnostics-and-effect-use",
    "selection-flow-and-new-world-settings",
    "runtime-cost-serialization"
  ],
  "validationLimit": "Checks only this inactive pair and its fixed inputs. Human source interpretation, runtime behavior, adoption and production approval remain separate."
};
const FIELD_DECISIONS = {
  "origin": "Provisional neutral empty string.",
  "effect": "Complete core effect text with only whitespace joined. The September directive leaves it intact.",
  "snippet": "Provisional neutral empty string.",
  "rules": "Empty. The inherited Type chooser and Struggle option are not adopted.",
  "enabled": "Provisional template true. Unmet prerequisites do not disable the Item.",
  "slug": "Provisional null. Preserve the inherited slug in the control.",
  "schema": "Provisional null version and migration fields. Preserve inherited version 0.11.",
  "referenceEffect": "Provisional neutral empty string.",
  "source": "Explicit source-role attribution. Do not copy Homebrew or PTR Compendiums.",
  "stackSlugs": "Provisional template false. Repetition is a separate source obligation.",
  "keywords": "Provisional empty array.",
  "prerequisites": "Source display text only. Core Level 20 and a six-Capability choice. September removes only Level 20.",
  "cost": "Provisional printed-text serialization. Keep source cost, template zero and inherited 1 TP distinct."
};

const ROLES = ['baseline', 'revised'];
const CAPABILITIES = ['Firestarter', 'Fountain', 'Freezer', 'Guster', 'Materializer', 'Zapper'];
const ROLE_LABELS = [
    'PTU 1.05 Core (PDF p. 205)',
    'September 2015 Optional Playtest (PDF p. 9), composed with PTU 1.05 Core (PDF p. 205)'
];
const sections = ['upstream', 'evidence', 'schemaEvidence', 'fieldDecisions', 'preservationControl',
    'collisionInventory', 'identityAllocation', 'roles', 'proposedIdentityJsonSha256'];
const sha = text => createHash('sha256').update(text, 'utf8').digest('hex');
const hash = value => sha(JSON.stringify(value) ?? 'undefined');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const keys = (value, expected) => object(value) && same(Object.keys(value).sort(), [...expected].sort());
const normalize = text => text.replace(/\s+/gu, ' ').trim();

function readPinnedInputs(inputs, check) {
    if (!check(keys(inputs, Object.keys(PINS.files)), 'input-membership')) return null;
    const parsed = {};
    for (const [name, file] of Object.entries(PINS.files)) {
        const raw = inputs[name];
        const digest = typeof raw === 'string' ? sha(raw) : null;
        const bytes = typeof raw === 'string' ? Buffer.byteLength(raw, 'utf8') : -1;
        if (!check(Object.values(file.raw).some(pin => pin.sha256 === digest && pin.bytes === bytes), 'input-pin:' + name)) continue;
        try {
            const value = JSON.parse(raw);
            if (check(object(value), 'input-json:' + name)) parsed[name] = value;
        } catch {
            check(false, 'input-json:' + name);
        }
    }
    return Object.keys(parsed).length === Object.keys(PINS.files).length ? parsed : null;
}

function sourceBinding(unit, optional) {
    return {
        authorityId: optional ? 'r04-s03' : 'r04-s12',
        status: optional ? 'optional-playtest' : 'standard-baseline',
        publicationDate: optional ? '2015-09' : null,
        datePrecision: optional ? 'month' : 'unknown',
        path: unit.source.path,
        sha256: unit.source.sha256,
        pdfPages: unit.source.pdfPages
    };
}

function inspectEvidence(evidence, featureEvidence, check) {
    check(keys(evidence, Object.keys(PINS.units)), 'evidence-membership');
    const result = {};
    for (const [key, pin] of Object.entries(PINS.units)) {
        const rows = featureEvidence[pin.collection];
        const matches = Array.isArray(rows) ? rows.filter(row => row?.id === pin.id) : [];
        if (!check(matches.length === 1, 'unit-membership:' + key)) continue;
        const unit = matches[0];
        const rawText = key === 'core' ? unit.rawDefinition : unit.rawText;
        if (!check(typeof rawText === 'string' && hash(unit) === pin.jsonSha256 && sha(rawText) === pin.rawSha256, 'unit-pin:' + key)) continue;
        const source = sourceBinding(unit, key === 'september');
        check(same(evidence?.[key], { ...pin, source, rawText }), 'evidence:' + key);
        result[key] = { unit, source, rawText };
    }
    return Object.keys(result).length === Object.keys(PINS.units).length ? result : null;
}

function inspectSchema(draft, template, record, sourceCost, check) {
    const base = template.Item?.templates?.base;
    const edge = template.Item?.pokeedge;
    if (!check(hash(base) === PINS.schema.base && hash(edge) === PINS.schema.pokeedge, 'template-slices')) return null;
    const declaredSystemFields = [...Object.keys(base), 'prerequisites', 'cost'];
    const legacySystemFields = Object.keys(record.system).filter(key => !declaredSystemFields.includes(key));
    check(declaredSystemFields.length === 13 && same(legacySystemFields, ['name', 'useCount']), 'record-field-boundary');
    check(record._id === 'WkzCUjTOCTI60Uwg' && record._key === '!items!WkzCUjTOCTI60Uwg' &&
        record.type === 'pokeedge', 'preservation-identity');
    check(same(draft.schemaEvidence, {
        baseTemplate: 'Item.templates.base', itemTemplate: 'Item.pokeedge',
        declaredSystemFields, legacySystemFields,
        cost: {
            source: sourceCost, templateDefault: edge.cost,
            inheritedSerialization: record.system.cost, proposedInactiveSerialization: sourceCost
        }
    }), 'schema-evidence');
    check(same(draft.preservationControl, {
        role: 'preservation-only',
        identity: 'poke-edges.WkzCUjTOCTI60Uwg',
        uuid: 'Compendium.ptu.poke-edges.Item.WkzCUjTOCTI60Uwg',
        wholeRecordMapping: false,
        sourceLabel: record.system.source.value,
        legacySystemFields,
        envelopeFields: Object.keys(record),
        preserveSavedSelections: true,
        preserveOwnershipAndSecurity: true,
        preserveExistingRecordBytes: true,
        legacyAutomation: {
            choiceCount: record.system.rules[0].choices.length,
            choiceFlag: record.system.rules[0].flag, domain: record.system.rules[1].domain, adopted: false
        }
    }), 'preservation-control');
    return { base, declaredSystemFields };
}

function inspectRoles(draft, evidence, schema, mechanicsText, check) {
    if (!check(Array.isArray(draft.roles) && same(draft.roles.map(role => role?.role), ROLES), 'role-membership')) return;
    const proposed = draft.roles.map(role => role.proposedIdentity);
    check(same(proposed, PINS.identities) && hash(proposed) === PINS.identitySha256 &&
        draft.proposedIdentityJsonSha256 === PINS.identitySha256, 'identity-allocation');

    for (const [i, role] of draft.roles.entries()) {
        const name = ROLES[i];
        const revised = i === 1;
        check(keys(role, ['role', 'source', 'proposedIdentity', 'runtimeVersionId', 'productionMapping',
            'approvals', 'composition', 'mechanics', 'item']), 'role-shape:' + name);
        check(same(role.source, evidence[revised ? 'september' : 'core'].source), 'role-source:' + name);
        check(role.runtimeVersionId === null && role.productionMapping === false &&
            same(role.approvals, CONTRACT.approvals), 'role-promotion:' + name);
        check(same(role.composition, {
            baseDefinition: PINS.units.core.id,
            directive: revised ? PINS.units.september.id : null,
            removedRequirement: revised ? 'Level 20' : null
        }), 'composition:' + name);
        check(same(role.mechanics, {
            minimumLevel: revised ? null : 20,
            chooseOneCapability: { labels: CAPABILITIES, runtimeIds: null },
            cost: { amount: 1, unit: 'Tutor Point' },
            struggle: { condition: 'Modified by the chosen Capability', maxRangeMeters: 6 },
            repetition: { allowed: true, differentCapabilityEachTime: true }
        }), 'mechanics:' + name);
        const system = {
            ...schema.base, effect: mechanicsText.effect,
            source: { value: ROLE_LABELS[i] },
            prerequisites: revised ? [mechanicsText.choice] : ['Level 20', mechanicsText.choice],
            cost: mechanicsText.cost
        };
        check(keys(role.item?.system, schema.declaredSystemFields), 'item-fields:' + name);
        check(same(role.item, {
            _id: PINS.identities[i].itemId, name: 'Basic Ranged Attacks', type: 'pokeedge', system
        }), 'item:' + name);
    }
}

/** Pure integrity check. Inputs are three raw UTF-8 strings. No I/O or mutation. */
export function validateBasicRangedVersionDraft(draft, inputs) {
    const issues = [];
    const check = (ok, code) => {
        if (!ok) issues.push(code);
        return ok;
    };
    if (!object(draft)) return ['draft-shape'];
    try {
        check(keys(draft, [...Object.keys(CONTRACT), ...sections]), 'draft-membership');
        for (const [key, value] of Object.entries(CONTRACT)) check(same(draft[key], value), 'draft:' + key);
        check(same(draft.upstream, { commit: PINS.commit, files: PINS.files }), 'upstream');
        check(same(draft.collisionInventory, PINS.inventory), 'collision-inventory');
        check(same(draft.identityAllocation, PINS.allocation), 'allocation-receipt');
        check(same(draft.fieldDecisions, FIELD_DECISIONS), 'field-decisions');
        const parsed = readPinnedInputs(inputs, check);
        if (!parsed) return issues;
        const evidence = inspectEvidence(draft.evidence, parsed.featureEvidence, check);
        if (!evidence) return issues;

        const definition = evidence.core.unit.definition;
        const prereq = normalize(definition.prerequisites[0].text);
        const cost = definition.costs[0].text;
        const effect = normalize(definition.sections.find(section => section.kind === 'effect').text);
        const choice = 'one of ' + CAPABILITIES.slice(0, -1).join(', ') + ', or ' + CAPABILITIES.at(-1);
        check(prereq === 'Level 20, ' + choice && cost === '1 Tutor Point', 'core-mechanics-source');
        check(normalize(evidence.september.rawText) ===
            'Poké Edge Changes Basic Ranged Attacks now has no Level Prerequisite.', 'level-only-source');
        const schema = inspectSchema(draft, parsed.itemTemplate, parsed.preservationRecord, cost, check);
        if (schema) inspectRoles(draft, evidence, schema, { choice, cost, effect }, check);
    } catch {
        issues.push('input-or-draft-shape');
    }
    return issues;
}

// Optional local entry point. Four fixed text inputs, no output files.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    if (process.argv.length !== 2) {
        console.error('This CLI accepts no arguments.');
        process.exitCode = 2;
    } else {
        try {
            const { readFile } = await import('node:fs/promises');
            const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
            const draft = JSON.parse(await read('docs/data/rule-version-basic-ranged-draft.json'));
            const inputs = Object.fromEntries(await Promise.all(Object.entries(PINS.files)
                .map(async ([name, file]) => [name, await read(file.path)])));
            const issues = validateBasicRangedVersionDraft(draft, inputs);
            if (issues.length) {
                console.error(issues.join('\n'));
                process.exitCode = 1;
            } else {
                console.log('Basic Ranged inactive draft passes integrity checks. Runtime behavior and adoption remain unverified.');
            }
        } catch {
            console.error('Unable to read or parse the fixed Basic Ranged draft inputs.');
            process.exitCode = 1;
        }
    }
}
