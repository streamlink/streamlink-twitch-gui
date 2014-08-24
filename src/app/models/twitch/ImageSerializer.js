define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({

		normalize: function( type, payload ) {
			payload.id = Math.floor( Math.random() * 1e16 );
			return payload;
		}

	});

});
