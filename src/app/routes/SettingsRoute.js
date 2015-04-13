define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			return this.settings.cloneModel();
		},

		actions: {
			willTransition: function( transition ) {
				var model = get( this.controller, "model" );

				// if the user has changed any values
				if ( !this.settings.compareModelClone( model ) ) {
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
