define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function( transition ) {
			// access to this route is restricted
			// but don't block the initial transition
			if ( transition.sequence > 0 ) {
				transition.abort();
			}
		},

		actions: {
			"didTransition": function() {
				// redirect to user defined homepage and don't create a history entry
				var homepage = this.settings.get( "gui_homepage" );
				this.router.replaceWith( homepage || "/featured" );
			}
		}
	});

});
