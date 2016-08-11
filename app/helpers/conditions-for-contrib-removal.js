import Ember from 'ember';
import permissions from 'ember-osf/const/permissions';

/**
 * conditionsForContribRemoval helper - used to determine if the removing a particular
 * contributor will still satisfy two conditions 1) @ least one registered admin 2) @ least one
 * bibliographic contributor
 *
 */
export function conditionsForContribRemoval(params/*, hash*/) {
    var [contributorToRemove, contributors] = params;
    if (contributors) {
        var minRegisteredAdmins = false;
        var minBibliographic = false;
        contributors.forEach(function(contributor) {
            if (contributor.id !== contributorToRemove.id) {
                if (contributor.get('permission') === permissions.ADMIN && contributor.get('unregisteredContributor') === null) {
                    minRegisteredAdmins = true;
                }
                if (contributor.get('bibliographic')) {
                    minBibliographic = true;
                }
            }
        });
        return minRegisteredAdmins && minBibliographic;
    } else {
        return params;
    }
}

export default Ember.Helper.helper(conditionsForContribRemoval);
