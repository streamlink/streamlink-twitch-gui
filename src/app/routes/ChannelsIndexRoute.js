define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload",
	"models/Streams"
], function( Ember, InfiniteScroll, preload, ModelStreams ) {

	return Ember.Route.extend( InfiniteScroll, {
		model: function() {
			return ModelStreams({
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) {
					return Ember.getWithDefault( data, "streams", [] );
				})
				.then( preload( "@each.preview.@each.medium" ) );
		}
	});

});
