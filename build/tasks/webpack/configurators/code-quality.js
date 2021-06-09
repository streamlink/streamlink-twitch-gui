const { pRoot } = require( "../paths" );

const ESLintWebpackPlugin = require( "eslint-webpack-plugin" );


/**
 * Code quality related configurations
 */
module.exports = {
	common( config ) {
		config.plugins.push( new ESLintWebpackPlugin({
			context: pRoot,
			emitError: true,
			failOnError: true
		}) );
	}
};
