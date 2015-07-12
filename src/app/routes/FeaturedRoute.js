define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	return Ember.Route.extend({
		model: function() {
			return Promise.all([
				this.store.findAll( "twitchStreamsSummary", null ),
				this.store.findQuery( "twitchStreamsFeatured", {
					offset: 0,
					limit: 5
				})
			])
				.then(function( data ) {
					return {
						summary: data[0].toArray()[0],
						featured: data[1].toArray()
					};
				})
				.then( preload([
					"featured.@each.image",
					"featured.@each.stream.@each.preview.@each.large_nocache"
				]) );
		}
	});

});
