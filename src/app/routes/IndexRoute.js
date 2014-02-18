define([
	"ember",
	"utils/preload",
	"models/Summary",
	"models/Featured"
], function( Ember, preload, ModelSummary, ModelFeatured ) {

	return Ember.Route.extend({
		model: function() {
			return Ember.RSVP.all([
				ModelSummary(),
				ModelFeatured( 5, 0 )
			])
				.then(function( models ) {
					return {
						summary: models[0],
						featured: models[1].featured
					};
				})
				// load preview image with a higher resolution
				// ugly... will be changed in the future
				.then(function( data ) {
					( data.featured || [] ).forEach(function( featured ) {
						featured.stream.preview = featured.stream.preview.replace(
							/(\d+)x(\d+)\.(\w+)$/,
							function( _, x, y, format ) {
								return ( 2 * +x ) + "x" + ( 2 * +y ) + "." + format;
							}
						);
					});
					return data;
				})
				.then( preload([
					"featured.@each.image",
					"featured.@each.stream.@each.preview"
				]) );
		}
	});

});
