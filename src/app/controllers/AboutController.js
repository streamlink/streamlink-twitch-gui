define([
	"Ember",
	"config",
	"json!root/metadata"
], function(
	Ember,
	config,
	metadata
) {

	var get = Ember.get;


	return Ember.Controller.extend({
		metadata: metadata,

		nwjsVersion: config.main[ "nwjs-version" ],

		dependencies: function() {
			var deps = get( this, "metadata.dependencies" );
			return Object.keys( deps ).map(function( key ) {
				return {
					title  : key,
					version: deps[ key ]
				};
			});
		}.property( "metadata.dependencies" )
	});

});
