import {inspectMechanicPreferences, previewMechanicPreset} from '../../util/mechanic-preferences.js';

const json = value => JSON.stringify(value, null, 2);
const field = (record, key) => record != null && Object.hasOwn(record, key) ? json(record[key]) : 'Not supplied';
const indexed = records => Array.isArray(records)
    ? records.map((record, index) => ({index, detail:json(record)}))
    : [];
const issues = records => records.map(({code, path}) => ({code, path:json(path)}));

function currentRow(row, snapshot) {
    const {definitionIndices, observationIndices, choiceIndex} = row.provenance;
    const definitions = snapshot.definitions;
    const observations = snapshot.observations;
    const definition = definitionIndices.length === 1 ? definitions[definitionIndices[0]] : null;
    const hasChoice = row.definitionStatus === 'valid' && definition !== null && Number.isInteger(choiceIndex);
    return {
        id:json(row.id), definitionStatus:row.definitionStatus, storageScope:field(row, 'declaredStorageScope'),
        presence:row.before.presence, availability:row.before.availability, stored:field(row.before, 'value'),
        basicStatus:row.basicChoice.status, basicValue:field(row.basicChoice, 'value'), membership:row.membership,
        effectiveAvailability:row.effective.availability, effective:field(row.effective, 'value'), origin:row.effective.origin,
        provenance:json(row.provenance), issueCodes:[...row.issueCodes],
        definitions:definitionIndices.map(index => ({index, label:field(definitions[index], 'label'), detail:json(definitions[index])})),
        observations:observationIndices.map(index => ({index, detail:json(observations[index])})),
        choice:hasChoice ? {
            index:choiceIndex, definitionIndex:definitionIndices[0],
            sourceStatus:field(row.provenance, 'sourceStatus'), citation:field(row.provenance, 'citation'),
            eligibility:field(row.provenance, 'eligibility'), detail:json(definition.choices[choiceIndex]),
        } : null,
        detail:json(row),
    };
}

function proposalRow(proposal) {
    return {
        id:json(proposal.mechanicId), disposition:proposal.disposition,
        before:json(proposal.before), proposed:json(proposal.proposed),
        storedWouldDiffer:field(proposal, 'storedWouldDiffer'),
        preferenceWouldDiffer:field(proposal, 'preferenceWouldDiffer'),
        issueCodes:[...proposal.issueCodes], detail:json(proposal),
    };
}

const eventNamespace = '.ptuMechanicPreferencesReview';

/** Review supplied evidence through an explicit construction, without granting consent. */
export class MechanicPreferencesReview extends Application {
    #report;
    #closed = false;
    #closing;
    #listeners;

    constructor(requestJson, mode = 'current') {
        if (mode !== 'current' && mode !== 'preset-preview') throw new TypeError('Invalid mechanic review mode.');
        const report = mode === 'current'
            ? inspectMechanicPreferences(requestJson)
            : previewMechanicPreset(requestJson);
        super();
        this.#report = report;
    }

    static get defaultOptions() {
        return {...super.defaultOptions, classes:['ptu', 'mechanic-preferences-review'],
            title:'Mechanic Preferences Review', width:760, height:640, resizable:true,
            template:'systems/ptu/static/templates/apps/mechanic-preferences-review.hbs'};
    }

    getData() {
        const report = this.#report;
        const {snapshot, rawJson} = report.input;
        return {
            mode:report.mode, availability:report.availability, sourceApproval:report.sourceApproval,
            current:report.current.map(row => currentRow(row, snapshot)),
            projection:{availability:report.choiceProjection.availability, choices:json(report.choiceProjection.choices)},
            preset:{availability:report.preset.availability, id:json(report.preset.presetId),
                proposals:report.preset.proposals.map(proposalRow)},
            issues:issues(report.issues),
            suppliedDefinitions:indexed(snapshot?.definitions),
            suppliedObservations:indexed(snapshot?.observations),
            suppliedPresets:indexed(snapshot?.presetRequests),
            rawJson:rawJson === null ? 'Unavailable' : rawJson,
            input:json(report.input), report:json(report),
        };
    }

    render(...args) {
        return this.#closed ? this : super.render(...args);
    }

    #removeReviewListeners() {
        if (!this.#listeners) return;
        for (const [target, event] of this.#listeners) target.off(event);
        this.#listeners = undefined;
    }

    activateListeners(html) {
        if (this.#closed) return;
        this.#removeReviewListeners();
        super.activateListeners(html);
        this.#listeners = [];
        const bind = (target, name, handler) => {
            const event = name + eventNamespace;
            target.off(event).on(event, handler);
            this.#listeners.push([target, event]);
        };
        for (const action of ['close', 'cancel']) {
            bind(html.find('button[data-action="' + action + '"]'), 'click', event => {
                event.preventDefault();
                return this.close();
            });
        }
        bind(html, 'keydown', event => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            return this.close();
        });
    }

    close(...args) {
        this.#closed = true;
        // Defer the base call until the shared promise is visible to reentrant handlers.
        this.#closing ??= Promise.resolve()
            .then(() => super.close(...args))
            .then(() => this.#removeReviewListeners());
        return this.#closing;
    }
}
