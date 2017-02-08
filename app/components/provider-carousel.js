import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays active preprint providers in a horizontal carousel with five providers per slide. Does not auto-advance.
 * Handles display on two pages: index (lightLogo=true) and discover (lightLogo=false).  If using elsewhere, need to add more customization
 * around how provider logos and links are built.
 *
 * Sample usage:
 * ```handlebars
 * {{provider-carousel
 *  providers=providers
}}
 * ```
 * @class provider-carousel
 */
export default Ember.Component.extend(Analytics, {
    _resizeListener: null,
    providers: Ember.A(), // Pass in preprint providers
    itemsPerSlide: 5, // Default
    lightLogo: true, // Light logos by default, for Index page.
    numProviders: Ember.computed('providers', function() {
        return this.get('providers').length;
    }),
    numSlides: Ember.computed('numProviders', 'itemsPerSlide', function() {
        return Math.ceil(this.get('numProviders')/this.get('itemsPerSlide'));
    }),
    slides: Ember.computed('numSlides', 'providers', 'itemsPerSlide', function() {
        const numSlides = this.get('numSlides');
        const itemsPerSlide = this.get('itemsPerSlide');
        return new Array(numSlides).fill().map((_, i) => {
            return this.get('providers').slice(i * itemsPerSlide, i * itemsPerSlide + itemsPerSlide);
        });
    }),
    setSlideItems: function() {
        // On xs screens, show one provider per slide. Otherwise, five.
        if (window.innerWidth < 768) {
            this.set('itemsPerSlide', 1);
        } else {
            this.set('itemsPerSlide', 5);
        }
    },
    didInsertElement: function () {
        // On xs screen, display one provider per slide
        Ember.$('.carousel').carousel();
    },
    init: function() {
        // Set resize listener so number of providers per slide can be changed
        this._super(...arguments);
        this.setSlideItems();
        this._resizeListener = Ember.run.bind(this, this.setSlideItems);
        Ember.$(window).on('resize', this._resizeListener);
    },
    willDestroy: function() {
        // Unbinds _resizeListener
        if (this._resizeListener) {
            Ember.$(window).off('resize', this._resizeListener);
        }
    }
});

