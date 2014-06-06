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
				.then( preload([
					"featured.@each.image",
					"featured.@each.stream.@each.preview.@each.large"
				]) );
		}
	});

});
