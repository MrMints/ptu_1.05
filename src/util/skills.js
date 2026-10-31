/** Persistent skill keys are an API. Labels and aliases must never rename them. */
export const SKILLS = Object.freeze({
    acrobatics: { name: "Acrobatics", aliases: [] },
    athletics: { name: "Athletics", aliases: [] },
    charm: { name: "Charm", aliases: ["Charisma"] },
    combat: { name: "Combat", aliases: [] },
    command: { name: "Command", aliases: [] },
    generalEd: { name: "General Education", aliases: ["Education", "General Ed", "General Edu", "General"] },
    medicineEd: { name: "Medicine Education", aliases: ["Biochemistry", "Medicine Ed", "Medicine Edu", "Medicine"] },
    occultEd: { name: "Occult Education", aliases: ["Occultism", "Occult Ed", "Occult Edu", "Occult"] },
    pokemonEd: { name: "Pokémon Education", aliases: ["Zoology", "Pokemon Ed", "Pokemon Edu", "Pokemon"] },
    techEd: { name: "Technology Education", aliases: ["Engineering", "Tech Education", "Technology Ed", "Technology Edu", "Tech Ed", "Tech Edu", "Technology", "Tech"] },
    focus: { name: "Focus", aliases: ["Willpower"] },
    guile: { name: "Guile", aliases: [] },
    intimidate: { name: "Intimidate", aliases: ["Intimidation"] },
    intuition: { name: "Intuition", aliases: [] },
    perception: { name: "Perception", aliases: [] },
    stealth: { name: "Stealth", aliases: [] },
    survival: { name: "Survival", aliases: [] }
});

export const EDUCATION_SKILLS = Object.freeze(["generalEd", "medicineEd", "occultEd", "pokemonEd", "techEd"]);

export function normalizeSkillName(value) {
    return typeof value === "string" ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase() : "";
}

const aliases = new Map(Object.entries(SKILLS).flatMap(([key, { name, aliases }]) =>
    [key, name, ...aliases].map(alias => [normalizeSkillName(alias), key])));

/** Resolve exact known names independently of the current UI language. */
export function resolveSkillKey(value) {
    return aliases.get(normalizeSkillName(value)) ?? null;
}

export function getSkillLabel(key, i18n = globalThis.game?.i18n) {
    if (!Object.hasOwn(SKILLS, key)) return key;
    for (const translationKey of [`PTU.Skills.${key}`, `SKILL.${key}`]) {
        const label = i18n?.localize(translationKey);
        if (label && label !== translationKey) return label;
    }
    return SKILLS[key].name;
}

/** A sheet-only copy: old stored labels and numeric actor data remain untouched. */
export function presentSkills(skills, i18n = globalThis.game?.i18n) {
    return Object.fromEntries(Object.entries(skills ?? {}).map(([key, value]) =>
        [key, { ...value, label: Object.hasOwn(SKILLS, key) ? getSkillLabel(key, i18n) : value.label, slug: key }]));
}
