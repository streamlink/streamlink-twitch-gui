define([
	"Ember",
	"utils/ember/ObjectBuffer"
], function(
	Ember,
	ObjectBuffer
) {

	var get = Ember.get;
	var set = Ember.set;

	var settingsRouteNames = /^settings\.\w+$/;


	return Ember.Route.extend({
		settings: Ember.inject.service(),
		modal   : Ember.inject.service(),

		disableAutoRefresh: true,

		model: function() {
			var settings = get( this, "settings.content" );
			return ObjectBuffer.create({
				content: settings.toJSON()
			});
		},

		resetController: function( controller, isExiting ) {
			if ( isExiting ) {
				set( controller, "isAnimated", false );
			}
		},

		actions: {
			willTransition: function( transition ) {
				// don't show modal when transitioning between settings subroutes
				if ( transition && settingsRouteNames.test( transition.targetName ) ) {
					return true;
				}

				// check whether the user has changed any values
				if ( !get( this, "controller.model.isDirty" ) ) { return; }

				// stay here...
				transition.abort();

				// and let the user decide
				get( this, "modal" ).openModal( "confirm", this.controller, {
					previousTransition: transition
				});
			}
		}
	});

});
