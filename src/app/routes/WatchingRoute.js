define([
	"ember",
	"utils/preload"
], function( Ember, preload ) {

	return Ember.Route.extend({
		model: function() {
			var	store	= this.store,
				streams	= this.controllerFor( "livestreamer" ).get( "streams" );

			return Promise.all( streams.map(function( elem ) {
				return store.find( "twitchStream", Ember.get( elem, "name" ) )
					.then(function( stream ) {
						// add the new stream record to the stream object
						elem.stream = stream;
						return stream;
					});
			}) )
				.then( preload( "@each.preview.@each.large" ) )
				// return the original streams array reference!!!
				.then(function() { return streams; });
		}
	});

});
