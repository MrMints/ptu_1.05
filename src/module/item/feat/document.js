import { PTUItem } from '../index.js';
class PTUFeat extends PTUItem {
    get category() {
        if(this.system.keywords?.includes("Class")) return "class";
        return "feat";
    }

    get isClass() {
        return this.category === "class";
    }

    /** @override */
    get rollable() {
        return this.system?.frequency && this.system.frequency !== "Static";
    }

    // Class labels are presentation data. Preserve saved exact grants; only an explicit
    // same-sheet group action may establish a new owned-ID relationship.

    /** @override */
    prepareActorData() {
        const { actor } = this;
        const prefix = this.isClass ? "class" : "feat";
        const slug = this.slug;
        actor.rollOptions.all[`${prefix}:${slug}`] = true;
    }

    /** @override */
    prepareSiblingData() {
        const itemGrants = this.flags.ptu.itemGrants;
        if(!itemGrants) return this.grants = [];
        this.grants = Object.values(itemGrants).flatMap((grant) => {
            if(grant.id === this._id) return [];
            return this.actor?.items.get(grant.id) ? [this.actor.items.get(grant.id)] : [];
        }).sort((a,b) => (a.sort || 0) - (b.sort || 0));
    }

    /** @override */
    getRollOptions(prefix = "feat") {
        return [
            ...super.getRollOptions(prefix),
            `${prefix}:category:${this.category}`,
        ]
    }
}

export { PTUFeat }