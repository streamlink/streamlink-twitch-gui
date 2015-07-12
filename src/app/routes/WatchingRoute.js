define( [ "Ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			/** @type {Array} */
			var records = get( this.controllerFor( "livestreamer" ), "model" );

			return Promise.all( records.map(function( record ) {
				return get( record, "stream" ).reload();
			}) )
				.then( preload( "@each.preview.@each.large_nocache" ) )
				// return the original record array
				.then(function() { return records; });
		}
	});

});
