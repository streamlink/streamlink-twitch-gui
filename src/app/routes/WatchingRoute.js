define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			var records = get( this.controllerFor( "livestreamer" ), "model" );

			return Promise.resolve( records.mapBy( "stream" ).toArray() )
				.then( preload( "preview.large_nocache" ) )
				// return the original record array
				.then(function() { return records; });
		}
	});

});
