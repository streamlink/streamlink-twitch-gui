define([
	"ember",
	"utils/preload",
	"models/Streams"
], function( Ember, preload, ModelStreams ) {

	return Ember.Route.extend({
		model: function() {
			return ModelStreams()
				.then( preload( "streams.@each.preview" ) );
		}
	});

});
