import {inspectFeatureVersionAcquisition} from '../../util/rule-version-acquisition-review.js';

const labelKeys = ['title','limits','advisory','collections','owned','incoming','status','count','issues','noIssues',
    'actor','membership','actorFacts','candidates','index','name','unavailable','uuid','localId','sourceId','legacySourceId',
    'mappingUuid','storedVersion','version','source','canonical','resolved','unresolved','snapshot','evidence',
    'prerequisites','unmet','unknown','noneReported','nonTextRequirement','ownedComparisons','incomingComparisons',
    'noComparisons','alternate','sameVersion','unrelated','relationship','identities','versions','differences',
    'contextIssues','close','cancel','mappingMode','snapshotAvailable','complete','invalidEntries','known','partial','idAlias'];
const text = (value, fallback) => typeof value === 'string' ? value : fallback;

// Only accepted, detached inspector output reaches these presentation helpers.
// JSON text stays text in the template; no enrichment, coercion or trusted HTML.
function view(inspection, labels) {
    const json = value => JSON.stringify(value, null, 2) ?? labels.unavailable;
    const string = value => text(value, labels.unavailable);
    const issues = values => (values ?? []).map(json);
    const state = value => ({complete:labels.complete, 'invalid-entries':labels.invalidEntries,
        unavailable:labels.unavailable, known:labels.known, partial:labels.partial})[value] ?? string(value);
    const entry = value => {
        const snapshot = value.snapshot, attribution = value.attribution;
        return {index:value.index, name:string(snapshot?.name), snapshotAvailable:json(value.snapshotAvailable),
            attribution:attribution?.status === 'resolved' ? labels.resolved : labels.unresolved,
            identity:[
                [labels.uuid, string(snapshot?.uuid)], [labels.localId, string(snapshot?._id)],
                [labels.sourceId, string(snapshot?._stats?.compendiumSource)],
                [labels.legacySourceId, string(snapshot?.flags?.core?.sourceId)],
                [labels.mappingUuid, string(attribution?.identity?.mappingUuid)],
                [labels.storedVersion, json(snapshot?.flags?.ptu?.selectedVersion)], [labels.idAlias, string(snapshot?.id)]
            ].map(([label,value])=>({label,value})),
            versionLabel:string(attribution?.selectedVersion?.label), version:json(attribution?.selectedVersion),
            sourceLabel:string(attribution?.source?.edition), sourceStatus:string(attribution?.source?.status), source:json(attribution?.source),
            canonical:json(attribution?.canonical), inputIssues:issues(value.inputIssues),
            attributionIssues:issues(attribution?.issues), snapshot:json(snapshot)};
    };
    const pair = value => ({...value,
        label:({'alternate-versions':labels.alternate,'same-version':labels.sameVersion,
            'unrelated-benefits':labels.unrelated})[value.relationship.status] ?? labels.unresolved,
        relationship:json(value.relationship), identities:json(value.identities), versions:json(value.versions),
        differences:json(value.differences), inputIssues:json(value.inputIssues), contextIssues:json(value.contextIssues)});
    const ownedComparisons = inspection.ownedComparisons.map(pair);
    return {labels, mappingMode:inspection.mappingMode,
        collections:Object.entries(inspection.collections).map(([key,value])=>({label:labels[key],
            status:state(value.status), count:json(value.count), issues:issues(value.inputIssues)})),
        actor:{status:state(inspection.actor.status), membership:state(inspection.actor.membership),
            snapshotAvailable:json(inspection.actor.snapshotAvailable), snapshot:json(inspection.actor.snapshot),
            issues:issues(inspection.actor.inputIssues)}, contextIssues:issues(inspection.contextIssues),
        owned:inspection.owned.map(entry), candidates:inspection.candidates.map(value=>{
            const report = value.prerequisites.report, formatted = value.prerequisites.formatted;
            const requirements = (values, lines) => values.map((requirement,index)=>({
                text:text(lines?.[index],text(requirement.raw,labels.nonTextRequirement)), detail:json(requirement)}));
            return {...entry(value), unmet:requirements(report.unmet,formatted?.unmet),
                unknown:[...requirements(report.unverifiable,formatted?.unknown),
                    ...report.attributionIssues.map(reason=>({text:string(reason),detail:json({reason})}))],
                prerequisiteEvidence:json(value.prerequisites), prerequisiteContext:issues(value.prerequisiteContextIssues),
                ownedComparisons:ownedComparisons.filter(pair=>pair.candidateIndex === value.index)};
        }), candidateComparisons:inspection.candidateComparisons.map(pair)};
}

/** Explicit snapshot-only review: new FeatureAcquisitionReview(request).render(true).
 * Accepts precisely the inspector request, not live Documents or app callbacks.
 * Construction captures one detached inspection; dismissal never returns consent. */
export class FeatureAcquisitionReview extends Application {
    #inspection;
    #closing;
    #closed = false;

    constructor(request) {
        const inspection = inspectFeatureVersionAcquisition(request);
        super();
        this.#inspection = inspection;
    }

    static get defaultOptions() {
        return {...super.defaultOptions, classes:['ptu','feature-acquisition-review'],
            title:'PTU.FeatureAcquisitionReview.title', width:760, height:640, resizable:true,
            template:'systems/ptu/static/templates/apps/feature-acquisition-review.hbs'};
    }

    getData() {
        const labels = Object.fromEntries(labelKeys.map(key=>{
            const fullKey = `PTU.FeatureAcquisitionReview.${key}`;
            return [key,text(game.i18n.localize(fullKey),fullKey)];
        }));
        return view(structuredClone(this.#inspection),labels);
    }

    render(force, options) {
        return this.#closed ? this : super.render(force, options);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[data-action="close"], button[data-action="cancel"]')
            .off('click.ptuFeatureAcquisitionReview').on('click.ptuFeatureAcquisitionReview', event=>this._onDismiss(event));
        html.off('keydown.ptuFeatureAcquisitionReview')
            .on('keydown.ptuFeatureAcquisitionReview', event=>this._onReviewKeyDown(event));
    }

    async _onDismiss(event) {
        event.preventDefault();
        await this.close();
    }

    async _onReviewKeyDown(event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        await this.close();
    }

    close() {
        this.#closed = true;
        // Store the promise before entering the base lifecycle, which may itself
        // dispatch another dismissal event. Its return value is never consent.
        this.#closing ??= Promise.resolve().then(async()=>{await super.close();});
        return this.#closing;
    }
}
