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
		itemSelector: ".channel-component",

		queryParams: {
			sortby: {
				refreshModel: true
			},
			direction: {
				refreshModel: true
			}
		},

		model: function( params ) {
			return get( this, "store" ).query( "twitchChannelsFollowed", {
				offset   : get( this, "offset" ),
				limit    : get( this, "limit" ),
				sortby   : params.sortby || "created_at",
				direction: params.direction || "desc"
			})
				.then(function( data ) {
					return data.toArray().mapBy( "channel" );
				})
				.then( preload( "@each.logo" ) );
		},

		fetchContent: function() {
			return this.model({
				sortby   : get( this, "controller.sortby" ),
				direction: get( this, "controller.direction" )
			});
		}
	});

});
