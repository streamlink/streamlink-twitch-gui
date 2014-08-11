define( [ "ember", "utils/twitch", "utils/preload" ], function( Ember, twitch, preload ) {

	return Ember.Route.extend({
		model: function() {
			return Promise.resolve(
				this.controllerFor( "livestreamer" ).get( "streams" )
			)
				.then(function( streams ) {
					return Promise.all( streams.map(function( stream ) {
						return twitch( "streams/" + Ember.get( stream, "stream.channel.name" ) )
							.then(function( data ) {
								if ( !data || !data.stream ) {
									throw new Error( "Invalid payload" );
								}
								// replace the old stream object with the new one
								stream.stream = data.stream;
							});
					}) )
						.then(function() {
							return streams;
						});
				})
				.then( preload( "@each.stream.@each.preview.@each.large" ) );
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );
			controller.set( "qualities", this.store.modelFor( "settings" ).prototype.qualities );
		}
	});

});
