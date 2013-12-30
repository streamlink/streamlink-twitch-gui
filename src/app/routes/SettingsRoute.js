define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.store.find( "settings", 1 );
		},

		actions: {
			willTransition: function( transition ) {
				var	Controller	= this.controller,
					Modal		= this.controllerFor( "modal" );

				function retry() {
					transition.retry();
				}

				// if the user has changed any values
				if ( Controller.get( "hasChanged" ) ) {
					// stay here...
					transition.abort();

					// and let the user decide
					this.controllerFor( "application" ).send( "openModal",
						"Please confirm",
						"Do you want to apply your changes?",
						[
							new Modal.Button( "Apply", "btn-success", "fa-check", function() {
								Controller.send( "apply", retry );
							}),
							new Modal.Button( "Discard", "btn-danger", "fa-trash-o", function() {
								Controller.send( "discard" );
								retry();
							}),
							new Modal.Button( "Cancel", "btn-neutral", "fa-times" )
						]
					);
				}
			}
		}
	});

});
