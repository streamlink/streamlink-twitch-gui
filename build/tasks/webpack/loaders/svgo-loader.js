const { getOptions } = require( "loader-utils" );
const { optimize } = require( "svgo" );


/**
 * @param {string} source
 * @this {LoaderContext}
 * @return {string}
 */
module.exports = function svgoLoader( source ) {
	const {
		plugins = [{ name: "preset-default" }],
		...options
	} = getOptions( this );

	const result = optimize( source, {
		...options,
		path: this.resourcePath,
		plugins
	});

	if ( result.error ) {
		throw result.error;
	}

	return result.data;
};
