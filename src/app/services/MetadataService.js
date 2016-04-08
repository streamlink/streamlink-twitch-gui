define([
	"Ember",
	"json!root/metadata"
], function(
	Ember,
	metadata
) {

	var alias = Ember.computed.alias;


	return Ember.Service.extend({
		metadata: metadata,

		package     : alias( "metadata.package" ),
		config      : alias( "metadata.package.config" ),
		dependencies: alias( "metadata.dependencies" ),
		contributors: alias( "metadata.contributors" )
	});

});
