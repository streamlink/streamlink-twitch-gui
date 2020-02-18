const { resolve: r } = require( "path" );
const { pApp, pTest } = require( "../paths" );

const webpack = require( "webpack" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );


/**
 * Configurations for creating valid NW.js builds
 */
module.exports = {
	_nwjs( config, path, isProd = false ) {
		// NW.js package.json
		config.module.rules.push({
			type: "javascript/auto",
			test: {
				or: [
					r( pApp, "package.json" ),
					r( pTest, "package.json" )
				]
			},
			use: [
				{
					loader: "file-loader",
					options: {
						name: "package.json"
					}
				},
				"parse-json-loader"
			]
		});

		// generate the index.html
		config.plugins.push(
			new HtmlWebpackPlugin({
				minify: isProd && {
					collapseWhitespace: true
				},
				inject: "body",
				hash: false,
				template: r( path, "index.html" )
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
		this._nwjs( config, pApp );
	},

	prod( config ) {
		this._nwjs( config, pApp, true );
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
