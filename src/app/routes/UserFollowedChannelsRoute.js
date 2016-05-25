define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/ember/toArray",
	"utils/ember/mapBy",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	toArray,
	mapBy,
	preload
) {

	var get = Ember.get;


	return UserIndexRoute.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".channel-item-component",

		queryParams: {
			sortby: {
				refreshModel: true
			},
			direction: {
				refreshModel: true
			}
		},

		modelName: "twitchChannelsFollowed",

		model: function( params ) {
			return get( this, "store" ).query( this.modelName, {
				offset   : get( this, "offset" ),
				limit    : get( this, "limit" ),
				sortby   : params.sortby || "created_at",
				direction: params.direction || "desc"
			})
				.then( toArray )
				.then( mapBy( "channel" ) )
				.then( preload( "logo" ) );
		},

		fetchContent: function() {
			return this.model({
				sortby   : get( this, "controller.sortby" ),
				direction: get( this, "controller.direction" )
			});
		}
	});

});
