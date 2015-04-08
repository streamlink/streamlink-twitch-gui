define( [ "controllers/ChannelController" ], function( ChannelController ) {

	return ChannelController.extend({
		needs: [ "channel" ],
		modelBinding: "controllers.channel.model"
	});

});
