define( [ "ember", "text!root/metadata.json" ], function( Ember, metadata ) {

	Ember.Application.initializer({
		name: "metadata",

		initialize: function( container ) {
			container.register( "record:metadata", JSON.parse( metadata ), { instantiate: false } );
			container.injection( "route",      "metadata", "record:metadata" );
			container.injection( "controller", "metadata", "record:metadata" );
		}
	});

});
