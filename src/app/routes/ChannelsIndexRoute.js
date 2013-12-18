define( [ "ember", "models/Streams", "utils/preload" ], function( Ember, Model, preload ) {

	return Ember.Route.extend({
		model: function() {
			return preload(
				Model(),
				function( res ) {
					return Object.create( res.streams ).map(function( stream ) {
						return stream.preview;
					});
				}
			);
		}
	});

});
