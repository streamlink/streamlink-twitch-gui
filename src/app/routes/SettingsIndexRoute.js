define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var set = Ember.set;


	return Ember.Route.extend({
		controllerName: "settings",

		actions: {
			"didTransition": function() {
				var goto = get( this, "controller.lastSubmenu" );
				if ( !goto ) {
					goto = "settings.main";
				}

				set( this, "controller.isAnimated", false );

				this.replaceWith( goto );
			},

			"willTransition": function() {
				return false;
			}
		}
	});

});
