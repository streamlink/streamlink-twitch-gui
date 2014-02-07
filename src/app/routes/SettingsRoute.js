define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.store.find( "settings", 1 );
		},

		actions: {
			willTransition: function( transition ) {
				var	controller	= this.get( "controller" ),
					modal		= this.get( "controller.controllers.modal" );

				function retry() {
					transition.retry();
				}

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
								controller.send( "apply", retry );
							}),
							new modal.Button( "Discard", "btn-danger", "fa-trash-o", function() {
								controller.send( "discard" );
								retry();
							}),
							new modal.Button( "Cancel", "btn-neutral", "fa-times" )
						]
					);
				}
			}
		}
	});

});
