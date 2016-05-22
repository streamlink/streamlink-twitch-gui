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

		actions: {
			"didTransition": function() {
				set( this, "controller.lastSubmenu", this.routeName );
			}
		}
	});

});
