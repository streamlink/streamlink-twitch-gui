define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.settings.constructor.readAttributes( this.settings );
		},

		actions: {
			willTransition: function( transition ) {
				var model    = Ember.get( this.controller, "model" ),
				    settings = this.settings;

				// if the user has changed any values
				if ( !Object.keys( model ).every(function( attr ) {
					return model.get( attr ) === settings.get( attr );
				}) ) {
					// stay here...
					transition.abort();

					// and let the user decide
					this.send( "openModal", "settingsModal", this.controller, {
						modalHead: "Please confirm",
						modalBody: "Do you want to apply your changes?",
						transition: transition
					});
				}
			}
		}
	});

});
