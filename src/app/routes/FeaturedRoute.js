define([
	"Ember",
	"utils/ember/toArray",
	"utils/preload"
], function(
	Ember,
	toArray,
	preload
) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Route.extend({
		model: function() {
			var store = get( this, "store" );

			return Promise.all([
				store.findAll( "twitchStreamsSummary", { reload: true } )
					.then( toArray ),
				store.query( "twitchStreamsFeatured", {
					offset: 0,
					limit: 5
				})
					.then( toArray )
			])
				.then(function( data ) {
					var summary  = data[0][0];
					var featured = data[1];

					return Promise.resolve( featured )
						.then( preload([
							"image",
							"stream.preview.large_nocache"
						]) )
						.then(function() {
							return {
								summary : summary,
								featured: featured
							};
						});
				});
		},

		resetController: function( controller, isExiting ) {
			if ( isExiting ) {
				set( controller, "isAnimated", false );
			}
		}
	});

});
