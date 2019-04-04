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
module.exports = function() {
	const targets = require( "./targets" );
	const defaultConfig = require( "./config" );
	const configurators = require( "./configurators" );


	const { hasOwnProperty } = {};
	function copyDeep( objA, objB ) {
		// all enumerable properties
		for ( const [ key, value ] of Object.entries( objB ) ) {
			// primitive types
			if ( typeof value !== "object" ) {
				objA[ key ] = objB[ key ];

			// copy special primitive-objects
			} else if (
				   value.constructor === RegExp
				|| value.constructor === Date
				|| value.constructor === String
				|| value.constructor === Number
				|| value.constructor === Boolean
			) {
				objA[ key ] = new value.constructor( value );

			// property is already an object with the same constructor: recursively copy properties
			} else if (
				   hasOwnProperty.call( objA, key )
				&& typeof objA[ key ] === "object"
				&& objA[ key ].constructor === value.constructor
			) {
				copyDeep( objA[ key ], value );

			// create new nested object and copy its properties recursively
			} else {
				objA[ key ] = copyDeep( new value.constructor(), value );
			}
		}

		return objA;
	}


	// get target config objects
	for ( const [ target, targetConfig ] of Object.entries( targets ) ) {
		// return a target function, so grunt-webpack passes the grunt config + instance as params
		targets[ target ] = ( ...args ) => {
			// first, deeply clone common config object
			const config = copyDeep( {}, defaultConfig );

			// copy the target's config onto it
			// targets can be functions which will receive the grunt config + instance as params
			copyDeep( config, typeof targetConfig === "function"
				? targetConfig( ...args )
				: targetConfig
			);

			// then apply configurators and also pass the grunt config + instance
			for ( const configurator of configurators ) {
				// first the configurator's common target
				if ( hasOwnProperty.call( configurator, "common" ) ) {
					configurator[ "common" ]( config, ...args );
				}
				// then the configurator's specific target
				if ( hasOwnProperty.call( configurator, target ) ) {
					configurator[ target ]( config, ...args );
				}
			}

			return config;
		};
	}


	return targets;
};
