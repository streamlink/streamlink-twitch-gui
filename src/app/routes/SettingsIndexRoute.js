define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var set = Ember.set;


	return Ember.Route.extend({
		actions: {
			"didTransition": function() {
				var settingsController = this.controllerFor( "settings" );
				var goto = get( settingsController, "lastSubmenu" );
				if ( !goto ) {
					goto = "settings.main";
				}

				set( settingsController, "isAnimated", false );

				this.replaceWith( goto );
			},

			"willTransition": function() {
				return false;
			}
		}
	});

});
