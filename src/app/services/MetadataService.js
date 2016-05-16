define([
	"Ember",
	"config",
	"json!root/metadata"
], function(
	Ember,
	config,
	metadata
) {

	var alias = Ember.computed.alias;


	return Ember.Service.extend({
		metadata: metadata,
		config  : config,

		package     : alias( "metadata.package" ),
		dependencies: alias( "metadata.dependencies" ),
		contributors: alias( "metadata.contributors" )
	});

});
