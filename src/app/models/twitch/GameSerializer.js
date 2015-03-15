define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			box: { deserialize: "records" },
			logo: { deserialize: "records" }
		},

		normalize: function( type, hash ) {
			if ( hash.box ) {
				hash.box._id = hash.name + "_box";
			}
			if ( hash.logo ) {
				hash.logo._id = hash.name + "_logo";
			}
			return this._super.apply( this, arguments );
		},

		typeForRoot: function() {
			return "twitchGame";
		}
	});

});
