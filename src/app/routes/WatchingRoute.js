define([
	"ember",
	"utils/preload"
], function( Ember, preload ) {

	return Ember.Route.extend({
		model: function() {
			var streams = this.controllerFor( "livestreamer" ).get( "streams" );

			return Promise.all( streams.map(function( elem ) {
				// reload the stream record
				// this will query the twitch.tv API with the record's ID (channel name)
				return elem.stream.reload()
					// return the streams array element instead of the stream record
					.then(function() { return elem; })
			}) )
				.then( preload( "@each.stream.@each.preview.@each.large" ) )
				// return the original streams array reference!!!
				.then(function() { return streams; });
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );

			controller.set( "qualities", this.store.modelFor( "settings" ).prototype.qualities );
		}
	});

});
