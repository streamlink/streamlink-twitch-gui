define( [ "ember", "text!root/metadata.json" ], function( Ember, metadata ) {

	metadata = JSON.parse( metadata );

	Ember.Application.initializer({
		name: "metadata",

		initialize: function( container ) {
			container.register( "record:metadata", metadata, { instantiate: false } );
			container.injection( "route",      "metadata", "record:metadata" );
			container.injection( "controller", "metadata", "record:metadata" );
		}
	});

	// return parsed metadata, so other initializers can use it, too
	return metadata;

});
