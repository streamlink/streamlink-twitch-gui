define([
	"Ember",
	"mixins/ChannelMixin"
], function( Ember, ChannelMixin ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var or = Ember.computed.or;

	return Ember.Controller.extend( ChannelMixin, {
		metadata: Ember.inject.service(),

		stream : alias( "model.stream" ),
		channel: alias( "model.channel" ),

		previewImage: or( "stream.preview.large_nocache", "channel.video_banner" ),

		_loadSubscriptionAndFollowingData: function() {
			var channel = get( this, "channel" );
			this.checkUserSubscribesChannel( channel );
			this.checkUserFollowsChannel( channel );
		}.observes( "channel" ),

		age: function() {
			var createdAt = get( this, "channel.created_at" );
			return ( new Date() - createdAt ) / ( 24 * 3600 * 1000 );
		}.property( "channel.created_at" ),

		language: function() {
			var codes = get( this, "metadata.config.language_codes" );
			var blang = get( this, "channel.broadcaster_language" );
			var lang  = codes[ blang ];
			return lang ? lang[ "lang" ] : "";
		}.property( "channel.broadcaster_language" ),


		actions: {
			"startStream": function( stream ) {
				if ( !stream ) { return; }
				this.send( "openLivestreamer", stream );
			}
		}
	});

});
