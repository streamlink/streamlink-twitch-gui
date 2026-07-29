/**
 * @param {string} source
 * @this {LoaderContext}
 * @return {string}
 */
module.exports = function svgoLoader( source ) {
	const { optimize } = require( "svgo" );

	const {
		plugins = [{ name: "preset-default" }],
		...options
	} = this.getOptions();

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
