define( [ "Ember", "utils/ember/ObjectBuffer" ], function( Ember, ObjectBuffer ) {

	var get = Ember.get;

	return Ember.Route.extend({
		settings: Ember.inject.service(),

		disableAutoRefresh: true,

		model: function() {
			var settings = get( this, "settings.content" );
			return ObjectBuffer.create({
				content: settings.toJSON()
			});
		},

		actions: {
			willTransition: function( transition ) {
				// if the user has changed any values
				if ( get( this.controller, "model.isDirty" ) ) {
					// stay here...
					transition.abort();

					// and let the user decide
					this.send( "openModal", "settings", this.controller, {
						previousTransition: transition
					});
				}
			}
		}
	});

});
