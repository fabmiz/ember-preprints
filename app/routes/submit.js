import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ConfirmationMixin from 'ember-onbeforeunload/mixins/confirmation';
import ResetScrollMixin from '../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../mixins/setup-submit-controller';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Creates a preprint record
 * @class Submit Route Handler
 */
export default Route.extend(ConfirmationMixin, ResetScrollMixin, CasAuthenticatedRouteMixin, SetupSubmitControllerMixin, { // eslint-disable-line max-len
    store: service(),
    i18n: service(),
    currentUser: service('currentUser'),
    panelActions: service('panelActions'),
    confirmationMessage: computed('i18n', function() {
        return this.get('i18n').t('submit.abandon_preprint_confirmation');
    }),
    model() {
        // Store the empty preprint to be created on the model hook for page. Node will be fetched
        // internally during submission process.
        return this.get('store').createRecord('preprint', {
            subjects: [],
        });
    },
    afterModel() {
        return this.get('theme.provider').then(this._getPageNotFound.bind(this));
    },
    setupController(controller, model) {
        this.setupSubmitController(controller, model);
        controller._setCurrentProvider();
        return this._super(...arguments);
    },
    isPageDirty() {
        // If true, shows a confirmation message when leaving the page
        // True if the user already created/chosen a project node
        return this.controller.get('hasDirtyFields');
    },
    _getPageNotFound(provider) {
        if (!provider.get('allowSubmissions')) {
            this.replaceWith('page-not-found');
        }
    },
});
