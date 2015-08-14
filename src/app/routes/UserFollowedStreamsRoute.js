define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollRouteMixin,
	preload
) {

	var get = Ember.get;

	return UserIndexRoute.extend( InfiniteScrollRouteMixin, {
		itemSelector: ".stream-component",

		model: function() {
			return get( this, "store" ).query( "twitchStreamsFollowed", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) {
					return data.toArray().mapBy( "stream" );
				})
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		}
	});

});
