define([
	"ember",
	"controllers/ChannelControllerMixin"
], function( Ember, ChannelControllerMixin ) {

	var get = Ember.get;

	return Ember.Controller.extend( ChannelControllerMixin, {
		needs: [ "channel" ],
		model: Ember.computed.alias( "controllers.channel.model" ),

		stream : Ember.computed.alias( "model.stream" ),
		channel: Ember.computed.alias( "model.channel" ),


		_loadSubscriptionAndFollowingData: function() {
			var channel = get( this, "channel" );
			this.checkUserSubscribesChannel( channel );
			this.checkUserFollowsChannel( channel );
		}.on( "init" ),

		age: function() {
			return ( new Date() - get( this, "channel.created_at" ) ) / ( 24 * 3600 * 1000 );
		}.property( "channel.created_at" ),

		previewImage: function() {
			return get( this, "stream.preview.large_nocache" )
				|| get( this, "channel.video_banner" );
		}.property( "stream.preview.large_nocache", "channel.video_banner" ),

		language: function() {
			var codes = get( this, "config.language_codes" ),
			    lang  = codes[ get( this, "channel.broadcaster_language" ) ];
			return lang ? lang[ "lang" ] : "";
		}.property( "channel.broadcaster_language" ),

		followersPerDay: function() {
			return get( this, "channel.followers" ) / get( this, "age" );
		}.property( "age", "channel.followers" ),

		viewsPerDay: function() {
			return get( this, "channel.views" ) / get( this, "age" );
		}.property( "age", "channel.views" ),


		actions: {
			"startStream": function( stream ) {
				if ( !stream ) { return; }
				this.send( "openLivestreamer", stream );
			}
		}
	});

});
