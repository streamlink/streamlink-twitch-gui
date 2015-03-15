define( [ "ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Route.extend({
		model: function() {
			var store   = this.store,
			    streams = this.controllerFor( "livestreamer" ).get( "streams" );

			// unload all cached stream records first
			//store.unloadAll( "twitchStream" );

			return Promise.all( streams.map(function( elem ) {
				var id = get( elem, "channel.id" );
				return store.find( "twitchStream", id )
					.then(function( stream ) {
						// add the new stream record to the stream object
						set( elem, "stream", stream );
						return stream;
					});
			}) )
				.then( preload( "@each.preview.@each.large_nocache" ) )
				// return the original streams array reference!!!
				.then(function() { return streams; });
		}
	});

});
