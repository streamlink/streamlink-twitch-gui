define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			return this.settings.constructor.readAttributes( this.settings );
		},

		actions: {
			willTransition: function( transition ) {
				var model    = get( this.controller, "model" );
				var settings = this.settings;
				var isEqual  = Object.keys( model ).every(function( attr ) {
					return get( model, attr ) === get( settings, attr );
				});

				// if the user has changed any values
				if ( !isEqual ) {
					// stay here...
					transition.abort();

					// and let the user decide
					this.send( "openModal", "settingsModal", this.controller, {
						modalHead: "Please confirm",
						modalBody: "Do you want to apply your changes?",
						previousTransition: transition
					});
				}
			}
		}
	});

});
