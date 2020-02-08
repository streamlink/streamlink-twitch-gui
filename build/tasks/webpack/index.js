/**
 * Modular Webpack configurations for multiple GruntJS build targets defined by various topics
 *
 * Each config of the `target` subdir is a Webpack grunt-task target and extends the common config
 * of the `config.js` file. This merged config tree is then "decorated" by the configurators
 * which apply their configurations to specific build targets.
 *
 * Custom Webpack plugins can be found in the `plugins` subdir.
 * Custom loaders are located in the `/src/web_loaders` directory.
 */
module.exports = function( grunt ) {
	const merge = require( "lodash/merge" );

	const targets = require( "./targets" );
	const defaultConfig = require( "./config" );
	const configurators = require( "./configurators" );

	const { hasOwnProperty } = {};

	// get target config objects
	for ( const [ target, targetConfig ] of Object.entries( targets ) ) {
		// return a target function, so that the config only needs to get built when executed
		targets[ target ] = () => {
			// first, deeply clone common config object
			const config = merge( {}, defaultConfig );

			// copy the target's config onto it
			// targets can be functions which will receive the grunt config + instance as params
			merge( config, typeof targetConfig === "function"
				? targetConfig( grunt )
				: targetConfig
			);

			// then apply configurators and also pass the grunt config + instance
			for ( const configurator of configurators ) {
				// first the configurator's common target
				if ( hasOwnProperty.call( configurator, "common" ) ) {
					configurator[ "common" ]( config, grunt, target );
				}
				// then the configurator's specific target
				if ( hasOwnProperty.call( configurator, target ) ) {
					configurator[ target ]( config, grunt );
				}
			}

			return config;
		};
	}

	return targets;
};
