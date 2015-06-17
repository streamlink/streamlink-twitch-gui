define( [ "Ember", "utils/ember/ObjectBuffer" ], function( Ember, ObjectBuffer ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			var settings = get( this, "settings" );
			return ObjectBuffer.create({
				content: settings
			});
		},

		actions: {
			willTransition: function( transition ) {
				// if the user has changed any values
				if ( get( this.controller, "model.hasBufferedChanges" ) ) {
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
