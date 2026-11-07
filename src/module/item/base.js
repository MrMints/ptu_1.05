import { RuleElements } from "../rules/index.js";
import { processGrantDeletions } from "../rules/rule-element/grant-item/helper.js";
import { sluggify } from "../../util/misc.js"
import { GrantItemRuleElement } from "../rules/rule-element/grant-item/rule-element.js";
import { getDocumentSourceId, createCompendiumRefreshUpdate } from "../../util/document-source.js";
import {isExcludedAcquisitionDocument} from '../../util/content-scope.js';
import {isStarterTrainingGrant} from '../../util/starter-training.js';
import {resolvePreservationSource} from '../../util/preservation.js';
import {prerequisiteView} from '../../util/acquisition.js';
import {hasSavedItemGraph,copySavedItemDocuments} from '../../util/saved-item-graph.js';

const preparedCreations=new WeakMap();

class PTUItem extends Item {

    clone(data={}, context={}) {
        if (!context.save || !hasSavedItemGraph(this)) return super.clone(data,context);
        return copySavedItemDocuments([this],{...context,parent:this.parent,pack:this.pack,changes:data})
            .then(items=>items[0]);
    }

    get prerequisiteDiagnostic() {
        return prerequisiteView(this);
    }

    static async fromDropData(data) {
        // Core stamps provenance on the original Document. Saved graph copies must
        // leave that source intact, including when expanded copying is cancelled.
        const source=data.uuid&&!data.data?await foundry.utils.fromUuid(data.uuid):null;
        const document=source?.documentName===this.documentName&&hasSavedItemGraph(source)?source:await super.fromDropData(data);
        if (isExcludedAcquisitionDocument(document)) throw new Error('PTU | This compendium record is excluded from new acquisition by the Generations 1–8 scope.');
        if (document.pack && isStarterTrainingGrant(document)) throw new Error('PTU | Use Choose Starter Training on a newly created trainer.');
        return document;
    }

    get sourceId() {
        return getDocumentSourceId(this);
    }

    get schemaVersion() {
        return Number(this.system.schema?.version) || null;
    }

    get slug() {
        return this.system.slug || sluggify(this.name);
    }

    get grantedBy() {
      // return this.flags.ptu.grantedBy ? this.actor?.items.get(this.flags.ptu.grantedBy.id) : null;
      const id = this.flags.ptu.grantedBy?.id ?? "";
      return ((id === this.id) ? null : (this.actor?.items.get(id) ?? null));
    }

    get grantedBySameType() {
        return this.grantedBy?.type === this.type;
    }

    get isGranted() {
        return this.flags.ptu.grantedBy ? this.flags.ptu.grantedBy.onDelete != "detach" : false;
    }

    get hasAutomation() {
        return this.rules.length > 0 && this.rules.some((rule) => !rule.ignored);
    }

    get realId() {
        return this.id;
    }

    get rollOptions() {
        return this.flags.ptu?.rollOptions;
    }

    get rollable() {
        return false;
    }

    get usable() {
        return false;
    }

    get range() {
        return this.system.range?.split(",").map(r => r.trim()) ?? [];
    }

    get referenceEffect() {
        return this.system.referenceEffect ?? null;
    }

    get schemaVersion() {
        return Number(this.system.schema?.version) || null;
    }

    get isClass() {
        return this.img.includes("class");
    }

    get enabled() {
        return !!(this.system.enabled ?? true)
    }

    /** Change state of whether items automation should be enabled or disabled. If called
     *  without argument, toggles between on and off.
     * @param newState
     * @return {Promise<abstract.Document|*>}
     */
    async toggleEnableState(newState = !this.enabled) {
        await this.update({ "system.enabled": newState })
        for (const rule of this.rules) {
            if (rule.ignored || !(rule instanceof GrantItemRuleElement)) continue;
            return this.actor.update({ "system.timestamp": Date.now() })
        }
    }

    /** @override */
    prepareBaseData() {
        this.flags.ptu = foundry.utils.mergeObject({ rulesSelections: {} }, this.flags.ptu ?? {});

        this.flags.ptu = foundry.utils.mergeObject(this.flags.ptu ?? {}, {
            rollOptions: {
                all: {
                    [`item:id:${this._id}`]: true,
                    [`item:slug:${this.slug}`]: true,
                    [`item:type:${this.type}`]: true,
                    [`${this.type}:${this.slug}`]: true
                },
                item: {
                    [`item:id:${this._id}`]: true,
                    [`item:slug:${this.slug}`]: true,
                    [`item:type:${this.type}`]: true,
                    [`${this.type}:${this.slug}`]: true,
                }
            }
        });

        if (this.enabled) {
            this.flags.ptu.rollOptions.all[`item:enabled`] = true;
            this.flags.ptu.rollOptions.item[`item:enabled`] = true;
        }
    }

    /** @override */
    _initialize() {
        this.rules = [];
        super._initialize();
    }

    /** @override */
    async delete(context) {
        if (this.actor) {
            await this.actor.deleteEmbeddedDocuments("Item", [this._id], context);
            return this;
        }
        return super.delete(context);
    }

    /** @override */
    async _buildEmbedHTML(config, options = {}) {
        options = { ...options, _embedDepth: options._embedDepth + 1, relativeTo: this };
        if (!this.system?.effect) return document.createElement("div");
        const {
            secrets = options.secrets,
            documents = options.documents,
            links = options.links,
            rolls = options.rolls,
            embeds = options.embeds
        } = config;
        foundry.utils.mergeObject(options, { secrets, documents, links, rolls, embeds });
        const enrichedPage = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.system.effect, options);
        const container = document.createElement("div");
        container.innerHTML = enrichedPage;
        return container;
    }

    /**
     * Retrieve all roll option from the requested domains. Micro-optimized in an excessively verbose for-loop.
     * @param domains The domains of discourse from which to pull options. Always includes the "all" domain.
     */
    getRollOptions(domains = []) {
        if (!Array.isArray(domains)) domains = [domains];
        const withAll = Array.from(new Set(["all", ...domains]));
        const { rollOptions } = this;
        const toReturn = new Set();

        for (const domain of withAll) {
            for (const [option, value] of Object.entries(rollOptions[domain] ?? {})) {
                if (value) toReturn.add(option);
            }
        }

        return Array.from(toReturn).sort();
    }

    /** @override */
    getRollData() {
        return { actor: this.actor, item: this };
    }

    _updateIcon({ source, update } = { source: undefined, update: false }) {
        source ??= foundry.utils.duplicate(this);

        let required = false;
        source.img ||= `/systems/ptu/static/css/images/icons/${source.type}_icon.png`
        if (source.img == "icons/svg/item-bag.svg" || source.img == "icons/svg/mystery-man.svg") {
            if (source.type == "move") {
                source.img = CONFIG.PTU.data.typeEffectiveness[source.system.type.titleCase()].images.icon;
            }
            else if (source.type == "contestmove") {
                source.img = `/systems/ptu/static/css/images/types2/${source.system.type}IC_Icon.png`;
            }
            else {
                source.img = `/systems/ptu/static/css/images/icons/${source.type}_icon.png`;
            }
            required = true;
        }

        if (update && required) return this.update(source);
        else return source;
    }

    /** @override */
    prepareActorData() {
        const { actor } = this;
        if (!actor) return;
        const slug = this.slug;
        actor.rollOptions.all[`${this.type}:${slug}`] = true;
    }

    /** @override */
    static async createDocuments(data = [], context = {}) {
        const actor=context.parent;
        if(actor&&!actor.isOwner){ui.notifications.error('PTU | Ownership is required to add items.');return [];}
        let sources;
        try {
            sources=preparedCreations.has(data)?data:await this.prepareCreation(data,context);
        }catch(error){actor?.reset();throw error;}
        const plan=preparedCreations.get(sources);
        preparedCreations.delete(sources);
        if(plan?.conditionIncrements.length&&plan.parent!==actor)throw Error('PTU | Staged condition changes belong to a different actor.');
        for(const id of plan?.conditionIncrements??[])if(!actor.items.get(id)?.system.value.isValued)throw Error('PTU | A staged condition changed; retry the acquisition.');
        if(actor)context.keepId=true;
        const created=await super.createDocuments(sources,context);
        if(plan?.conditionIncrements.length&&created?.length!==sources.length)throw Error('PTU | Item creation did not complete; staged condition increments were not applied.');
        // No saved effects run until every cancellable choice and Item creation succeeds.
        for(const id of plan?.conditionIncrements??[])await actor.items.get(id)?.increase();
        if (game.combat && sources.some(i => i.type === "condition" && sluggify(i.name) === "fainted")) {
            const combatant = game.combat.getCombatantByActor(actor);
            if (combatant && !combatant.defeated) await combatant.update({ defeated: true });
        }
        return created;
    }

    /** Resolve genuine/nested choices before any Item write; NPC generation uses a temporary actor. */
    static async prepareCreation(data = [], context = {}) {
        const sources = data.map(d=>foundry.utils.deepClone(d.toObject?.()??d));

        const actor = context.parent;
        if (!actor) return sources;
        if(!actor.isOwner)throw Error('PTU | Ownership is required to prepare item creation.');

        const validTypes = actor.allowedItemTypes;
        const items = [];
        const outputSources = [];
        const conditionIncrements=[];
        const keepIds=context.keepId||context.keepEmbeddedIds;
        const counts=new Map();
        for(const source of sources)if(source._id)counts.set(source._id,(counts.get(source._id)??0)+1);
        for(const source of sources)if(counts.get(source._id)>1&&(source.flags?.ptu?.grantedBy?.id||Object.keys(source.flags?.ptu?.itemGrants??{}).length))throw Error('PTU | Ambiguous saved grant node IDs; restore distinct complete graphs separately.');
        const ids=new Map();
        for(const source of sources){const oldId=source._id;source._id=keepIds?(oldId??foundry.utils.randomID()):foundry.utils.randomID();if(oldId&&counts.get(oldId)===1)ids.set(oldId,source._id);}
        // Only exact IDs supplied together can be remapped; external/ambiguous links are never guessed.
        for(const source of sources){
            const ptu=source.flags?.ptu;
            for(const grant of Object.values(ptu?.itemGrants??{}))if(grant?.id){if(counts.get(grant.id)>1)throw Error('PTU | Ambiguous saved grant IDs; restore the complete distinct graph.');if(ids.has(grant.id))grant.id=ids.get(grant.id);}
            if(ptu?.grantedBy?.id&&ids.has(ptu.grantedBy.id))ptu.grantedBy.id=ids.get(ptu.grantedBy.id);
        }
        const restoredRules=new Map(),graphChildren=new Set(),graphMembers=new Set();
        const graphTarget=id=>sources.find(s=>s._id===id)??(keepIds?actor.items.get(id)?._source:null);
        for(const source of sources){
            for(const edge of Object.values(source.flags?.ptu?.itemGrants??{})){
                const target=typeof edge?.id==='string'?graphTarget(edge.id):null;
                if(!target||target.flags?.ptu?.grantedBy?.id!==source._id)throw Error('PTU | Saved grant relationship is incomplete or inconsistent; include its exact parent and child for restoration/copy.');
                graphMembers.add(source._id);graphMembers.add(target._id);graphChildren.add(target._id);
            }
            const parentId=source.flags?.ptu?.grantedBy?.id;
            if(parentId){const parent=graphTarget(parentId);if(!parent||!Object.values(parent.flags?.ptu?.itemGrants??{}).some(edge=>edge?.id===source._id))throw Error('PTU | Saved grant parent is incomplete or inconsistent; include the complete reciprocal graph.');graphMembers.add(source._id);graphMembers.add(parentId);}
        }
        for(const source of sources){
            const savedEdges=Object.entries(source.flags?.ptu?.itemGrants??{});
            const grantRules=(source.system?.rules??[]).filter(rule=>rule.key==='GrantItem');
            if(savedEdges.length&&grantRules.length){
                const flags=grantRules.map(rule=>rule.flag);
                if(flags.some(flag=>typeof flag!=='string'||!flag.trim())||new Set(flags).size!==flags.length||savedEdges.some(([flag,edge])=>typeof edge?.id!=='string'||!edge.id.trim()||!flags.includes(flag)))throw Error('PTU | Saved grant rule-to-edge association is unestablished or ambiguous; review explicit flags and restore the complete graph.');
            }
            for(const [index,rule] of (source.system?.rules??[]).entries()){
                const saved=rule.key==='GrantItem'&&typeof rule.flag==='string'?source.flags?.ptu?.itemGrants?.[rule.flag]:null;
                if(!saved?.id)continue;
                const target=graphTarget(saved.id);
                if(!target||target.flags?.ptu?.grantedBy?.id!==source._id)throw Error('PTU | Saved grant relationship is incomplete or inconsistent; include its exact parent and child for restoration/copy.');
                if(!restoredRules.has(source._id))restoredRules.set(source._id,new Set());
                restoredRules.get(source._id).add(index);graphChildren.add(target._id);
            }
        }
        if(keepIds)for(const source of sources)if(graphMembers.has(source._id)&&actor.items.get(source._id))throw Error('PTU | Saved graph ID already exists; use an ordinary copy for independent IDs.');

        for (const source of sources) {
            source.system??={};
            if (!validTypes.includes(source.type)) {
                ui.notifications.error(`PTU | ${source.type} cannot be added to ${actor.name}`);
                return [];
            }

            if (source.system.stackSlugs&&!graphMembers.has(source._id)) source.system.slug = sluggify(source.name + foundry.utils.randomID());

            const item = new CONFIG.Item.documentClass(source, { parent: actor });

            if (item.type === "condition"&&!graphChildren.has(source._id)) {
                const existing = actor.itemTypes.condition.find(c => c.slug === sluggify(item.name.replaceAll(/\d/g, '')));
                if (existing) {
                    if (existing.system.value.isValued) conditionIncrements.push(existing.id);
                    continue;
                }
            }

            items.push(item);
            outputSources.push(item._source);
        }

        if (!context.keepId) context.keepId = true;

        const getSimpleGrants = async (item) => {
            const granted = (await item.createGrantedItems?.({ size: context.parent?.size })) ?? [];
            if (!granted.length) return [];
            const reparented = granted.map(
                (i) =>
                (i.parent
                    ? i
                    : new CONFIG.Item.documentClass(i._source, { parent: actor }))
            );
            return [...reparented, ...(await Promise.all(reparented.map(getSimpleGrants))).flat()];
        };

        const promiseOutput = await Promise.all(items.map(async item => {
            const grants = await getSimpleGrants(item);
            if (grants.length) return grants;
            return [];
        }))
        items.push(...promiseOutput.flat());

        for (const item of items) {
            item.prepareActorData?.();

            const itemSource=item._source;

            const rules = item.prepareRuleElements();
            for (let i = 0; i < rules.length; i++) {
                const index=rules[i].sourceIndex??i;
                if(restoredRules.get(item.id)?.has(index))continue;
                const ruleSource = itemSource.system.rules[index];
                await rules[i].preCreate?.({ itemSource, ruleSource, pendingItems: outputSources, context });
            }
        }

        preparedCreations.set(outputSources,{conditionIncrements,parent:actor});
        return outputSources;
    }

    /** @override */
    static async deleteDocuments(ids = [], context = {}) {
        ids = Array.from(new Set(ids));
        const actor = context.parent;
        if (actor) {
            const items = ids.flatMap((id) => actor.items.get(id) ?? []);

            for (const item of [...items]) {
                for (const rule of item.rules) {
                    await rule.preDelete?.({ pendingItems: items, context });
                }

                await processGrantDeletions(item, items);
            }
            if (game.combat && items.some(i => i.type === "condition" && i.slug === "fainted")) {
                const combatant = game.combat.getCombatantByActor(actor)
                if (combatant && combatant.defeated) await combatant.update({ defeated: false })
            }

            ids = Array.from(new Set(items.map((i) => i._id)).filter((id) => actor.items.has(id)));
        }
        return super.deleteDocuments(ids, context);
    }

    /** @override */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);

        this._source.system.rules = this._source.system.rules.filter((r) => !r.removeUponCreate);
    }

    /** @override */
    async _preUpdate(changed, options, user) {
        for (const rule of this.rules) {
            await rule.preUpdate?.(changed);
        }

        await super._preUpdate(changed, options, user);
    }

    /** @override */
    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (!(this.actor && game.user.id === userId)) return;

        this.actor.reset();
        const actorUpdates = {};
        for (const rule of this.rules) {
            rule.onCreate?.(actorUpdates);
        }

        const updateKeys = Object.keys(actorUpdates);
        if (updateKeys.length > 0 && !updateKeys.every(k => k === "_id")) this.actor.update(actorUpdates);
    }

    /** @override */
    _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (!(this.actor && game.user.id === userId)) return;

        const actorUpdates = {};
        for (const rule of this.rules) {
            rule.onDelete?.(actorUpdates);
        }

        const updateKeys = Object.keys(actorUpdates);
        if (updateKeys.length > 0 && !updateKeys.every(k => k === "_id")) this.actor.update(actorUpdates);
    }

    prepareRuleElements(options = {}) {
        if (!this.actor) throw new Error("PTU | Item must have an actor to prepare rule elements");

        return (this.rules = this.actor.canHostRuleElements ? RuleElements.fromOwnedItem(this, options) : []);
    }

    async refreshFromCompendium() {
        if (!this.isOwned) return ui.notifications.error("PTU | Item must be owned to refresh from compendium");
        if (!this.isOwner) return ui.notifications.error('PTU | Item ownership is required to refresh.');

        if (!this.sourceId?.startsWith("Compendium.")) {
            console.warn("PTU | Item must be from a compendium to refresh from compendium");
            return;
        }

        const currentSource = this.toObject();
        let latestSource;
        try { latestSource = (await resolvePreservationSource(this))?.toObject(); }
        catch (error) {
            console.warn("PTU | Could not resolve compendium source", this.sourceId, error);
            return ui.notifications.error("PTU | Could not find latest source for item");
        }
        if (!latestSource) return ui.notifications.error("PTU | Could not find latest source for item");
        else if (latestSource.type !== this.type) return ui.notifications.error("PTU | Item type must match latest source type");

        const updates = createCompendiumRefreshUpdate(currentSource, latestSource, this.constructor.DEFAULT_ICON);

        await this.update(updates, { diff: false, recursive: false });
        ui.notifications.info(`PTU | ${this.name}: missing source fields refreshed; existing values and selections preserved. Version replacement requires explicit review.`);
    }

    async use(options = {}) {

    }

    async sendToChat() {
        const tags = await (async () => {
            const tags = [];
            if (this.system.frequency) tags.push({ slug: "frequency", label: game.i18n.localize("PTU.Tags.Frequency"), value: this.system.frequency });
            if (this.system.range) tags.push({ slug: "range", label: game.i18n.localize("PTU.Tags.Range"), value: this.system.range });
            if (this.system.damageBase) tags.push({ slug: "db", label: game.i18n.localize("PTU.Tags.DB"), value: this.system.damageBase + " DB" });
            return tags;
        })();

        const flavor = await (async () => {
            const typeAndCategoryHeader = (() => {
                if (this.type !== "move") return null;

                const header = document.createElement("div");
                header.classList.add("header-bar");
                header.classList.add("type-category");

                const type = document.createElement("div");
                type.classList.add("type-img");

                const typeImg = document.createElement("img");
                typeImg.src = CONFIG.PTU.data.typeEffectiveness[this.system.type].images.bar;
                type.append(typeImg);

                const category = document.createElement("div");
                category.classList.add("type-img");

                const categoryImg = document.createElement("img");
                categoryImg.src = `/systems/ptu/static/css/images/categories/${this.system.category}.png`;
                category.append(categoryImg);

                header.append(category, type);
                return [header]
            })();

            const header = document.createElement("div");
            header.classList.add("header-bar");
            if (this.img) {
                header.append((() => {
                    const img = document.createElement("img");
                    img.classList.add("item-img", "item-icon");
                    img.src = this.img;
                    return img;
                })());
            }
            header.append((() => {
                const h3 = document.createElement("h3");
                h3.classList.add("action");
                h3.innerHTML = this.name;
                return h3;
            })());
            return [header, typeAndCategoryHeader ?? []]
                .flat()
                .map(e => (typeof e === "string" ? e : e.outerHTML))
                .join("");
        })();

        const referenceEffect = this.referenceEffect ? await foundry.applications.ux.TextEditor.implementation.enrichHTML(`@UUID[${foundry.utils.duplicate(this.referenceEffect)}]`, { async: true }) : null;

        const chatData = {
            user: game.user._id,
            item: this,
            tags,
            referenceEffect
        }

        ChatMessage.create({ content: await foundry.applications.handlebars.renderTemplate(`/systems/ptu/static/templates/chat/chat-items.hbs`, chatData), flavor, flags: { ptu: { origin: { item: this.uuid } } } })
    }
}

const PTUItemProxy = new Proxy(PTUItem, {
    construct(_target, args) {
        const subType = args[0]?.system?.subtype;
        if (subType && subType != "item") {
            return new CONFIG.PTU.Item.documentClasses[subType](...args);
        }

        return new CONFIG.PTU.Item.documentClasses[args[0].type](...args);
    }
})

export { PTUItem, PTUItemProxy }
