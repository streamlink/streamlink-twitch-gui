define( [ "ember", "text!root/oauth.json" ], function( Ember, OAuth ) {

	Ember.Application.initializer({
		name: "user",
		after: "store",

		initialize: function( container, application ) {
			var store = container.lookup( "store:main" );

			// OAuth metadata record
			container.register( "record:oauth", JSON.parse( OAuth ), { instantiate: false } );
			container.register( "controller:userAuth", container.resolve( "controller:userAuth" ) );
			container.injection( "controller:userAuth", "oauth", "record:oauth" );


			// wait for the promise to resolve first
			application.deferReadiness();

			store.find( "auth" )
				.then(function( records ) {
					return records.content.length
						? records.objectAt( 0 )
						: store.createRecord( "auth", { id: 1 } ).save();
				})
				.then(function( auth ) {
					container.register( "record:auth", auth, { instantiate: false } );
					container.injection( "route",      "auth", "record:auth" );
					container.injection( "controller", "auth", "record:auth" );
					container.injection( "adapter",    "auth", "record:auth" );

					// now we're ready
					application.advanceReadiness();
				});
		}
	});

});
