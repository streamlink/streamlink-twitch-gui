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

			return Ember.RSVP.hash({
				summary : store.findAll( "twitchStreamsSummary", { reload: true } )
					.then( toArray ),
				featured: store.query( "twitchStreamsFeatured", {
					offset: 0,
					limit : 5
				})
					.then( toArray )
			})
				.then(function( data ) {
					return Promise.resolve( data.featured )
						.then( preload([
							"image",
							"stream.preview.large_nocache"
						]) )
						.then(function() {
							return data;
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
