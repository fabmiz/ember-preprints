import Ember from 'ember';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    providerUrlRegex: {
        //'bioRxiv': '', doesnt currently have urls
        Cogprints: /cogprints/,
        OSF: /https?:\/\/((?!api).)*osf.io/, // Doesn't match api.osf urls
        PeerJ: /peerj/,
        arXiv: /arxivj/
    },
    didRender() {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$()[0]]);  // jshint ignore:line
    },
    numMaxChars: 300,
    showBody: false,
    footerIcon: Ember.computed('showBody', function() {
        return this.get('showBody') ? 'caret-up' : 'caret-down';
    }),
    result: null,

    shortDescription: Ember.computed('result', function() {
        let result = this.get('result');
        if (result.description && result.description.length > this.numMaxChars) {
            return result.description.substring(0, this.numMaxChars) + '...';
        }
        return result.description.slice();
    }),

    shortContributorList: Ember.computed('result', function() {
        let filtered = this.get('result.contributors').filter(item => !!item.users.bibliographic);
        let nameArr = filtered.slice(0, Math.min(10, filtered.length));
        if (nameArr.length < filtered.length)
            nameArr[nameArr.length - 1].originalLength = filtered.length;
        return nameArr;
    }),

    osfID: Ember.computed('result', function() {
        let re = /osf.io\/(\w+)\/$/;
        // NOTE / TODO : This will have to be removed later. Currently the only "true" preprints are solely from the OSF
        // socarxiv and the like sometimes get picked up by as part of OSF, which is technically true. This will prevent
        // broken links to things that aren't really preprints.
        if (this.get('result.providers.length') === 1 && this.get('result.providers').find(provider => provider.name === 'OSF'))
            for (let i = 0; i < this.get('result.identifiers.length'); i++)
                if (re.test(this.get('result.identifiers')[i]))
                    return re.exec(this.get('result.identifiers')[i])[1];
        return false;
    }),

    hyperlink: Ember.computed('result', function() {
        let re = null;
        for (let i = 0; i < this.get('result.providers.length'); i++) {
            //If the result has multiple providers, and one of them matches, use the first one found.
            re = this.providerUrlRegex[this.get('result.providers')[i].name];
            if (re) break;
        }

        re = re || this.providerUrlRegex.OSF;

        const identifiers = this.get('result.identifiers').filter(ident => ident.startsWith('http://'));

        for (let j = 0; j < identifiers.length; j++)
            if (re.test(identifiers[j]))
                return identifiers[j];

        return identifiers[0];
    }),

    actions: {
        toggleShowBody() {
            this.set('showBody', !this.showBody);

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'result',
                    action: !this.showBody ? 'contract' : 'expand',
                    label: `Preprints - Discover - ${this.result.title}`
                });
        },
        select(item) {
            this.attrs.select(item);
        }
    }

});
