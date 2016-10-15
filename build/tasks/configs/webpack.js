var PATH = require( "path" );
var OS = require( "os" );
var webpack = require( "webpack" );
var SplitByPathPlugin = require( "webpack-split-by-path" );
var HtmlWebpackPlugin = require( "html-webpack-plugin" );
var CopyWebpackPlugin = require( "copy-webpack-plugin" );
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var LessPluginCleanCSS = require( "less-plugin-clean-css" );
var NwjsPlugin = require( "../common/nwjs-webpack-plugin" );


var r = PATH.resolve;
var j = PATH.join;


// path definitions
var pRoot = r( ".", "src" );
var pApp = r( pRoot, "app" );
var pTest = r( pRoot, "test" );
var pStyles = r( pRoot, "styles" );
var pImages = r( pRoot, "img" );
var pTemplates = r( pRoot, "templates" );
var pModulesBower = r( ".", "bower_components" );
var pModulesNpm = r( ".", "node_modules" );


// exclude modules/files from the js bundle
var cssExtractTextPlugin  = new ExtractTextPlugin( "vendor.css" );
var lessExtractTextPlugin = new ExtractTextPlugin( "main.css" );


module.exports = {
	// common options
	// the grunt-webpack merges the "options" objects with each task config (nested)
	options: {
		stats: {
			timings: true,
			children: false
		},

		context: j( ".", "src" ),

		output: {
			// name each file by their entry module name
			filename: "[name].js",
			// don't use the webpack:// protocol in sourcemaps
			devtoolModuleFilenameTemplate: "/[resource-path]"
		},

		// the entry module
		entry: "main",

		resolve: {
			modulesDirectories: [
				"web_modules",
				"node_modules",
				"bower_components"
			],
			alias: {
				// folder aliases
				"root"        : pRoot,
				"styles"      : pStyles,
				"img"         : pImages,
				"templates"   : pTemplates,
				"bower"       : pModulesBower,

				// app folders
				"config"      : r( pApp, "config" ),
				"initializers": r( pApp, "initializers" ),
				"mixins"      : r( pApp, "mixins" ),
				"services"    : r( pApp, "services" ),
				"helpers"     : r( pApp, "helpers" ),
				"models"      : r( pApp, "models" ),
				"controllers" : r( pApp, "controllers" ),
				"routes"      : r( pApp, "routes" ),
				"components"  : r( pApp, "components" ),
				"store"       : r( pApp, "store" ),
				"utils"       : r( pApp, "utils" ),
				"gui"         : r( pApp, "gui" )
			}
		},

		resolveLoader: {
			root: pRoot,
			modulesDirectories: [
				"web_loaders",
				"web_modules",
				"node_loaders",
				"node_modules"
			]
		},

		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: [
						pModulesNpm,
						pModulesBower
					],
					loader: "babel",
					query: {
						presets: [],
						plugins: [
							"babel-plugin-transform-es2015-modules-commonjs",
							"babel-plugin-transform-es2015-shorthand-properties",
							"babel-plugin-transform-es2015-block-scoping",
							"babel-plugin-transform-es2015-destructuring",
							"babel-plugin-transform-es2015-computed-properties",
							"babel-plugin-transform-es2015-template-literals",
							"babel-plugin-transform-es2015-spread",
							"babel-plugin-transform-es2015-parameters"
						],
						cacheDirectory: r( OS.tmpdir(), "babel-cache" )
					}
				},
				{
					test: /\.hbs$/,
					loader: "hbs-loader"
				},
				{
					test: /\.json$/,
					loader: "json-loader"
				},
				{
					test: /\.html$/,
					loader: "raw-loader"
				},
				{
					test: /metadata\.js$/,
					loader: "metadata-loader"
				},
				// Vendor stylesheets (don't parse anything)
				{
					test: /\.css$/,
					include: pModulesBower,
					loader: cssExtractTextPlugin.extract([
						"css?sourceMap&-minify&-url&-import"
					])
				},
				// Application stylesheets (extract fonts and images)
				{
					test: /app\.less$/,
					include: pStyles,
					loader: lessExtractTextPlugin.extract([
						"css?sourceMap&minify&url&-import",
						"less?sourceMap&strictMath&strictUnits&relativeUrls&noIeCompat",
						"flag-icons-loader",
						"themes-loader"
					])
				},
				// Assets
				{
					test: /\.(jpe?g|png|svg|woff2)$/,
					loader: "file?name=[path][name].[ext]"
				}
			]
		},

		plugins: [
			// don't split the main module into multiple chunks
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

			// split into chunks by module path
			new SplitByPathPlugin([
				{
					name: "vendor.bower",
					path: pModulesBower
				},
				{
					name: "vendor.npm",
					path: pModulesNpm
				},
				{
					name: "templates",
					path: pTemplates
				}
			]),

			// NW.js package.json
			new CopyWebpackPlugin([
				{ from: "package.json" }
			]),

			// don't include css stylesheets in the js bundle
			cssExtractTextPlugin,
			lessExtractTextPlugin,

			// ignore l10n modules of momentjs
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ )
		]
	},


	// -----
	// task configs
	// -----


	dev: {
		output: {
			path: "<%= dir.tmp_dev %>"
		},

		resolve: {
			root: pApp
		},

		target: "node-webkit",
		devtool: "source-map",

		plugins: [
			new HtmlWebpackPlugin({
				inject: "head",
				hash: false,
				template: r( pRoot, "index.html" )
			}),

			new webpack.DefinePlugin({
				DEBUG: true
			}),

			new NwjsPlugin({
				files: "<%= dir.tmp_dev %>/**",
				argv: "--remote-debugging-port=8888",
				rerunOnExit: true,
				log: true,
				logStdOut: false,
				logStdErr: false
			})
		],

		watch: true,
		keepalive: true,
		failOnError: false
	},


	prod: {
		output: {
			path: "<%= dir.tmp_prod %>"
		},

		resolve: {
			root: pApp
		},

		target: "node-webkit",

		module: {
			loaders: [
				{
					test: /\.svg$/,
					loader: "svgo?" + JSON.stringify({
						plugins: [
							{ removeTitle: true },
							{ removeUselessStrokeAndFill: false }
						]
					})
				}
			]
		},

		plugins: [
			new HtmlWebpackPlugin({
				inject: "head",
				hash: false,
				template: r( pRoot, "index.html" )
			}),

			// use non-debug versions of ember and ember-data in production builds
			new webpack.NormalModuleReplacementPlugin(
				/\/ember\/ember\.debug\.js$/,
				r( pModulesBower, "ember", "ember.prod.js" )
			),
			new webpack.NormalModuleReplacementPlugin(
				/\/ember-data\/ember-data\.js$/,
				r( pModulesBower, "ember-data", "ember-data.prod.js" )
			),

			// minify
			new webpack.optimize.UglifyJsPlugin({
				sourceMap: false,
				compress: {
					warnings: false
				},
				mangle: {
					props: false
				},
				beautify: false,
				screwIE8: true,
				preserveComments: /(?:^!|@(?:license|preserve|cc_on))/
			}),

			// add license banner
			new webpack.BannerPlugin([
				"<%= main['display-name'] %>",
				"@version v<%= package.version %>",
				"@date <%= grunt.template.today('yyyy-mm-dd') %>",
				"@copyright <%= package.author %>"
			].join( "\n" ), {
				entryOnly: true
			})
		],

		// optimize css
		lessLoader: {
			lessPlugins: [
				new LessPluginCleanCSS({
					advanced: true
				})
			]
		}
	},


	test: {
		output: {
			path: "<%= dir.tmp_test %>"
		},

		resolve: {
			root: pTest,
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

		target: "web",

		plugins: [
			new HtmlWebpackPlugin({
				inject: "body",
				hash: false,
				template: r( pTest, "index.html" )
			})
		]
	}
};
