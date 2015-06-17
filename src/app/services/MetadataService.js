define([
	"Ember",
	"text!root/metadata.json"
], function( Ember, metadata ) {

	var alias = Ember.computed.alias;

	metadata = JSON.parse( metadata );

	return Ember.Service.extend({
		metadata: metadata,

		package     : alias( "metadata.package" ),
		config      : alias( "metadata.package.config" ),
		dependencies: alias( "metadata.dependencies" ),
		contributors: alias( "metadata.contributors" )
	});

});
