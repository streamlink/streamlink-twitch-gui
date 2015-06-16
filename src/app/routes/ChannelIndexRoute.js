define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	return Ember.Route.extend({
		model: function() {
			return this.modelFor( "channel" );
		},

		afterModel: function( model ) {
			return Promise.resolve( model )
				.then( preload([
					"stream.preview.large_nocache"
				]) );
		},

		refresh: function() {
			return this.container.lookup( "route:channel" ).refresh();
		}
	});

});
