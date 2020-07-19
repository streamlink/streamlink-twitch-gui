const { resolve: r } = require( "path" );
const { pApp, pTest } = require( "../paths" );

const webpack = require( "webpack" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );


/**
 * Configurations for creating valid NW.js builds
 */
module.exports = {
	_nwjs( config, grunt, path, isProd = false ) {
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
				{
					loader: "parse-json-loader",
					options: {
						grunt
					}
				}
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

	dev( ...args ) {
		this._nwjs( ...args, pApp );
	},

	prod( ...args ) {
		this._nwjs( ...args, pApp, true );
	},

	test( ...args ) {
		this._nwjs( ...args, pTest );
	},

	testdev( ...args ) {
		this._nwjs( ...args, pTest );
	},

	coverage( ...args ) {
		this._nwjs( ...args, pTest );
	}
};
