define([
	"ember",
	"text!root/metadata.json"
], function( Ember, metadata ) {

	metadata = JSON.parse( metadata );

	return Ember.Service.extend({
		metadata: metadata,

		package     : Ember.computed.alias( "metadata.package" ),
		config      : Ember.computed.alias( "metadata.package.config" ),
		dependencies: Ember.computed.alias( "metadata.dependencies" ),
		contributors: Ember.computed.alias( "metadata.contributors" )
	});

});
