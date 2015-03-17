define( [ "ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function( params ) {
			var store = this.store,
			    id    = get( params, "channel" );

			// try to find a stream record if the channel is broadcasting
			return store.fetch( "twitchStream", id )
				.then(function( stream ) {
					return {
						stream : stream,
						channel: get( stream, "channel" )
					};
				}, function() {
					// if the channel is not online, just *fetch* the channel record
					return store.fetch( "twitchChannel", id )
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
