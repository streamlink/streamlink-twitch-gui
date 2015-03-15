define( [ "ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function( params ) {
			var store   = this.store;
			var channel = get( params, "channel" );

			// unload all cached stream records first
			//store.unloadAll( "twitchStream" );

			// try to find a stream record if the channel is broadcasting
			return store.find( "twitchStream", channel )
				.then(function( stream ) {
					return {
						stream : stream,
						channel: get( stream, "channel" )
					};
				}, function() {
					// if the channel is not online, just *fetch* the channel record
					return store.fetch( "twitchChannel", channel )
						.then(function( channel ) {
							return {
								channel: channel
							};
						});
				})
				.then( preload([
					"stream.preview.large_nocache",
					"channel.logo",
					"channel.video_banner"
				]) );
		}
	});

});
