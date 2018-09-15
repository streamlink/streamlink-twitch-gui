const { resolve } = require( "path" );
const { pRoot, pTest } = require( "../paths" );

const webpack = require( "webpack" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );


/**
 * Configurations for creating valid NW.js builds
 */
module.exports = {
	_nwjs( config, path ) {
		// NW.js package.json
		config.plugins.push(
			new CopyWebpackPlugin([
				{ from: resolve( path, "package.json" ) }
			])
		);

		// generate the index.html
		config.plugins.push(
			new HtmlWebpackPlugin({
				inject: "head",
				hash: false,
				template: resolve( path, "index.html" )
			})
		);
	},

	common( config ) {
		// split chunks
		config.plugins.unshift(
			new webpack.optimize.SplitChunksPlugin()
		);
	},

	dev( config ) {
		this._nwjs( config, pRoot );
	},

	prod( config ) {
		this._nwjs( config, pRoot );
	},

	test( config ) {
		this._nwjs( config, pTest );
	},

	testdev( config ) {
		this._nwjs( config, pTest );
	},

	coverage( config ) {
		this._nwjs( config, pTest );
	}
};
