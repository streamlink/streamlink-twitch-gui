var FS = require( "fs" );
var PATH = require( "path" );
var webpack = require( "webpack" );
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
var pTemplates = r( pRoot, "templates" );
var pVendor = r( pRoot, "vendor" );
var pWebModules = r( pRoot, "web_modules" );


// exclude modules/files from the js bundle
var cssExtractTextPlugin = new ExtractTextPlugin( "styles.css" );


module.exports = {
	// common options
	// the grunt-webpack merges the "options" objects with each task config (nested)
	options: {
		context: j( ".", "src" ),

		output: {
			// name each file by their entry module name
			filename: "[name].js",
			// don't use the webpack:// protocol in sourcemaps
			devtoolModuleFilenameTemplate: "/[resource-path]"
		},

		entry: {
			// the "main" module is our real entry module
			main: "main",
			// a list of modules in a separated vendor module file
			vendor: FS.readdirSync( pWebModules )
				.sort()
				.map(function( name ) {
					return name.replace( /\.\w+$/, "" );
				})
		},

		resolve: {
			modulesDirectories: [
				"web_modules",
				"node_modules"
			],
			alias: {
				// folder aliases
				"root"        : pRoot,
				"styles"      : pStyles,
				"templates"   : pTemplates,
				"vendor"      : pVendor,

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
				"gui"         : r( pApp, "gui" ),

				// vendor aliases (TODO: rename vendor modules)
				"jquery"      : "JQuery"
			}
		},

		resolveLoader: {
			root: r( pRoot ),
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
					test: /\.less$/,
					include: pStyles,
					loader: cssExtractTextPlugin.extract([
						"css?sourceMap&-url&-import",
						"less?sourceMap&strictMath&strictUnits&relativeUrls&noIeCompat"
					])
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
				}
			]
		},

		plugins: [
			// don't split the main module into multiple chunks
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

			// extract all vendor modules for a quicker app rebuild
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendor",
				minChunks: Infinity
			}),

			// don't include css stylesheets in the js bundle
			cssExtractTextPlugin,

			// ignore l10n modules of momentjs
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ )
		]
	},


	// -----
	// task configs
	// -----


	dev: {
		output: {
			path: r( "build", "tmp", "app" )
		},

		resolve: {
			root: pApp
		},

		target: "node-webkit",
		devtool: "source-map",

		plugins: [
			new webpack.DefinePlugin({
				DEBUG: true
			}),

			new NwjsPlugin({
				files: r( "build", "tmp", "**" ),
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
			path: r( "build", "tmp", "app" )
		},

		resolve: {
			root: pApp
		},

		target: "node-webkit",

		plugins: [
			// use non-debug versions of ember and ember-data in production builds
			new webpack.NormalModuleReplacementPlugin(
				/vendor\/ember\/ember\.debug\.js$/,
				r( pRoot, "vendor", "ember", "ember.prod.js" )
			),
			new webpack.NormalModuleReplacementPlugin(
				/vendor\/ember-data\/ember-data\.js$/,
				r( pRoot, "vendor", "ember-data", "ember-data.prod.js" )
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
				"<%= grunt.config('main.display-name') %>",
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
			path: r( "build", "tmp" )
		},

		resolve: {
			root: pTest,
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

		target: "web"
	}
};
