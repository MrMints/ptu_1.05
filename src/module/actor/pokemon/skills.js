import { EDUCATION_SKILLS, resolveSkillKey } from "../../../util/skills.js";

function calculateSkills(skills, speciesData, background, bonus = 0) {
    if (speciesData == null) return skills;
    if (speciesData._id == "ARCEUS") {
        for (let [key, skill] of Object.entries(skills)) {
            skill.value.value = 4;
            skill.modifier.value = 3;
        };
        return skills;
    }

    let speciesSkills = speciesData["Skills"];

    for (let [key, skill] of Object.entries(skills).filter(([key]) => EDUCATION_SKILLS.includes(key))) {
        skill.value.value = 1;
    };

    for (let [key, skill] of Object.entries(speciesSkills)) {
        const skillKey = resolveSkillKey(key);
        if (!skillKey || !skills[skillKey]) continue;
        skills[skillKey].value.value = skill.Dice;
        skills[skillKey].modifier.value = skill.Mod;
    }

    for(let skill of Object.values(background.increased)) {
        if(skills[skill]) {
            skills[skill].value.mod += 1;
        }
    }
    for(let skill of Object.values(background.decreased)) {
        if(skills[skill]) {
            skills[skill].value.mod -= 1;
        }
    }

    if(bonus != 0) {
        for(let [key, skill] of Object.entries(skills)) skill.modifier.mod += bonus;
    }

    return skills;
}

export { calculateSkills }
