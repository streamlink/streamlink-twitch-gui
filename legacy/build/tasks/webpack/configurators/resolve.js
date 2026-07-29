const { pApp, pTest } = require( "../paths" );
const { isTestTarget } = require( "../utils" );


/**
 * Resolver configurations for each build target
 */
module.exports = {
	common( config, grunt, target ) {
		// set the first module resolve path
		config.resolve.modules.unshift(
			isTestTarget( target )
				? pTest
				: pApp
		);
	}
};
