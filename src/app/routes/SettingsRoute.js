define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		actions: {
			willTransition: function( transition ) {
				var	controller	= this.controller,
					modal		= controller.get( "controllers.modal" );

				// if the user has changed any values
				if ( controller.get( "hasChanged" ) ) {
					// stay here...
					transition.abort();

					// and let the user decide
					this.send( "openModal",
						"Please confirm",
						"Do you want to apply your changes?",
						[
							new modal.Button( "Apply", "btn-success", "fa-check", function() {
								controller.send( "apply", transition.retry.bind( transition ) );
							}),
							new modal.Button( "Discard", "btn-danger", "fa-trash-o", function() {
								controller.send( "discard" );
								transition.retry();
							}),
							new modal.Button( "Cancel", "btn-neutral", "fa-times" )
						]
					);
				}
			}
		}
	});

});
