define( [ "ember", "utils/preload" ], function( Ember, preload ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			/** @type {Array} streams */
			var streams = get( this.controllerFor( "livestreamer" ), "streams" );

			return Promise.all( streams.map(function( elem ) {
				return get( elem, "stream" ).reload();
			}) )
				.then( preload( "@each.preview.@each.large_nocache" ) )
				// return the original streams array reference!!!
				.then(function() { return streams; });
		}
	});

});
