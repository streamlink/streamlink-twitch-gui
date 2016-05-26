define([
	"Ember"
], function(
	Ember
) {

	var set = Ember.set;


	return Ember.Route.extend({
		controllerName: "settings",

		disableAutoRefresh: true,

		model: function() {
			return this.modelFor( "settings" );
		},

		deactivate: function() {
			var settingsController = this.controllerFor( "settings" );
			set( settingsController, "lastSubmenu", this.routeName );
			set( settingsController, "isAnimated", true );
		}
	});

});
