define( [ "controllers/ChannelsChannelController" ], function( ChannelsChannelController ) {

	return ChannelsChannelController.extend({
		needs: [ "channelsChannel" ],
		modelBinding: "controllers.channelsChannel.model"
	});

});
