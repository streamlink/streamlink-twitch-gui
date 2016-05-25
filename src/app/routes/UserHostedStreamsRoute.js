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
		itemSelector: ".stream-item-component",

		modelName: "twitchStreamsHosted",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then( toArray )
				.then(function( records ) {
					// The target (stream) reference is loaded asynchronously
					// just get the PromiseProxy object and wait for it to resolve
					var targets  = records.mapBy( "target" );
					var promises = targets.map(function( streamPromise ) {
						var stream = streamPromise.content;
						// reload the stream record if it has already been loaded
						var promise = get( stream, "isLoaded" )
							? stream.reload()
							: streamPromise;

						// preload the stream's preview image
						return promise.then( preload( "preview.medium_nocache" ) );
					});

					// wait for everything to resolve and return the hosts list
					return Promise.all( promises )
						.then(function() {
							return records;
						});
				});
		}
	});

});
