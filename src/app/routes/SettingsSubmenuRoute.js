define([
	"Ember"
], function(
	Ember
) {

	return Ember.Route.extend({
		controllerName: "settings",

		disableAutoRefresh: true,

		model: function() {
			return this.modelFor( "settings" );
		}
	});

});
