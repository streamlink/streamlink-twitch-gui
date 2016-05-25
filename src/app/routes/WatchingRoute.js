define([
	"Ember",
	"utils/ember/toArray",
	"utils/ember/mapBy",
	"utils/preload"
], function(
	Ember,
	toArray,
	mapBy,
	preload
) {

	var get = Ember.get;


	return Ember.Route.extend({
		livestreamer: Ember.inject.service(),

		model: function() {
			var records = get( this, "livestreamer.model" );

			return Promise.resolve( records )
				.then( toArray )
				.then( mapBy( "stream" ) )
				.then( preload( "preview.large_nocache" ) )
				// return the original record array
				.then(function() { return records; });
		}
	});

});
