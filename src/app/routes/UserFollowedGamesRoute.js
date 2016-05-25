define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/ember/toArray",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	toArray,
	preload
) {

	var get = Ember.get;


	return UserIndexRoute.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".game-item-component",

		queryParams: {
			all: {
				refreshModel: true
			}
		},

		modelName: "twitchGamesLiveFollowed",
		modelNameAll: "twitchGamesFollowed",

		model: function( params ) {
			// query parameters are strings
			var modelname = params.all === "true"
				? this.modelNameAll
				: this.modelName;

			return get( this, "store" ).query( modelname, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then( toArray )
				.then( preload( "box.large" ) );
		},

		fetchContent: function() {
			return this.model({
				all: get( this, "controller.all" )
			});
		}
	});

});
