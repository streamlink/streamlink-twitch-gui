const { getOptions } = require( "loader-utils" );
const { extendDefaultPlugins, optimize } = require( "svgo" );


/**
 * @param {string} source
 * @this {LoaderContext}
 * @return {string}
 */
module.exports = function svgoLoader( source ) {
	const {
		extendDefaultPlugins: defaultPlugins = [],
		plugins = [],
		...options
	} = getOptions( this );

	const result = optimize( source, {
		...options,
		path: this.resourcePath,
		plugins: extendDefaultPlugins( defaultPlugins ).concat( plugins )
	});

	if ( result.error ) {
		throw result.error;
	}

	return result.data;
};
