define(function() {

	return function( buildMap, pluginName, moduleName, write ) {
		if ( !buildMap.hasOwnProperty( moduleName ) ) { return; }

		write.asModule(
			moduleName,
			"define(function(){return " + buildMap[ moduleName ] + "})"
		);
	};

});
