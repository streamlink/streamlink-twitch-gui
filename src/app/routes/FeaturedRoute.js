define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			var store = get( this, "store" );

			return Promise.all([
				store.findAll( "twitchStreamsSummary", null, { reload: true } ),
				store.query( "twitchStreamsFeatured", {
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
