define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.settings.constructor.readAttributes( this.settings );
		},

		actions: {
			willTransition: function( transition ) {
				var	controller	= this.controller,
					modal		= Ember.get( controller, "controllers.modal" ),
					model		= Ember.get( controller, "model" ),
					settings	= this.settings,
					hasChanged	= !Object.keys( model ).every(function( attr ) {
						return model.get( attr ) === settings.get( attr );
					});

				// if the user has changed any values
				if ( hasChanged ) {
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
