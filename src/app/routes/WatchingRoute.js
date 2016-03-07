define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		livestreamer: Ember.inject.service(),

		model: function() {
			var records = get( this, "livestreamer.model" );

			return Promise.resolve( records.toArray().mapBy( "stream" ) )
				.then( preload( "preview.large_nocache" ) )
				// return the original record array
				.then(function() { return records; });
		}
	});

});
