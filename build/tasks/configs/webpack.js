const webpack = require( "webpack" );
const BabiliPlugin = require( "babili-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const LessPluginCleanCSS = require( "less-plugin-clean-css" );
const NwjsPlugin = require( "../common/nwjs-webpack-plugin" );
const { resolve: r } = require( "path" );
const { tmpdir } = require( "os" );


// path definitions
const pProjectRoot = r( "." );
const pRoot = r( ".", "src" );
const pApp = r( pRoot, "app" );
const pConfig = r( pRoot, "config" );
const pTest = r( pRoot, "test" );
const pTestFixtures = r( pTest, "fixtures" );
const pStyles = r( pRoot, "styles" );
const pImages = r( pRoot, "img" );
const pTemplates = r( pRoot, "templates" );
const pModulesBower = r( ".", "bower_components" );
const pModulesNpm = r( ".", "node_modules" );
const pCacheBabel = r( tmpdir(), "babel-cache" );


const resolveModuleDirectories = [
	"web_modules",
	"node_modules",
	"bower_components"
];
const resolveLoaderModuleDirectories = [
	"web_loaders",
	...resolveModuleDirectories
];


// exclude modules/files from the js bundle
const cssExtractTextPlugin = new ExtractTextPlugin({
	filename: "[name].css"
});
const lessExtractTextPlugin = new ExtractTextPlugin({
	filename: "main.css"
});


const commonLoaders = [
	{
		enforce: "pre",
		test: /\.js$/,
		loader: "eslint-loader",
		exclude: [
			pModulesNpm,
			pModulesBower
		],
		options: {
			failOnError: true
		}
	},
	{
		test: /\.hbs$/,
		loader: "hbs-loader"
	},
	{
		test: /\.html$/,
		loader: "raw-loader"
	},
	{
		test: /metadata\.js$/,
		loader: "metadata-loader",
		options: {
			dependencyProperties: [ "dependencies", "devDependencies" ],
			packageNpm: r( pProjectRoot, "package.json" ),
			packageBower: r( pProjectRoot, "bower.json" ),
			donationConfigFile: r( pConfig, "main.json" )
		}
	},
	// Vendor stylesheets (don't parse anything)
	{
		test: /\.css$/,
		exclude: pStyles,
		loader: cssExtractTextPlugin.extract({
			use: [
				{
					loader: "css-loader",
					options: {
						sourceMap: true,
						minify: false,
						url: false,
						import: false
					}
				}
			]
		})
	},
	// Application stylesheets (extract fonts and images)
	{
		test: /app\.less$/,
		include: pStyles,
		loader: lessExtractTextPlugin.extract({
			use: [
				{
					loader: "css-loader",
					options: {
						sourceMap: true,
						minify: true,
						url: true,
						import: false
					}
				},
				{
					loader: "less-loader",
					options: {
						sourceMap: true,
						strictMath: true,
						strictUnits: true,
						relativeUrls: true,
						noIeCompat: true,
						lessPlugins: [
							new LessPluginCleanCSS({
								advanced: true
							})
						]
					}
				},
				{
					loader: "flag-icons-loader",
					options: {
						config: r( pConfig, "langs.json" ),
						ignore: [ "en" ]
					}
				},
				{
					loader: "themes-loader",
					options: {
						config: r( pConfig, "themes.json" ),
						themesVarName: "THEMES",
						themesPath: "themes/"
					}
				}
			]
		})
	},
	// Assets
	{
		test: /\.(jpe?g|png|svg|woff2)$/,
		loader: "file-loader",
		options: {
			name: "[path][name].[ext]"
		}
	}
];


// the inject-loader used by some tests requires es2015 modules to be transpiled
const loaderBabelTest = {
	test: /\.js$/,
	exclude: [
		pModulesNpm,
		pModulesBower
	],
	loader: "babel-loader",
	options: {
		presets: [],
		plugins: [
			"babel-plugin-transform-es2015-modules-commonjs"
		],
		cacheDirectory: pCacheBabel
	}
};


module.exports = {
	// common options
	// the grunt-webpack merges the "options" objects with each task config (nested)
	options: {
		cache: true,

		stats: {
			modules: false,
			chunks: false,
			chunkModules: false,
			children: false,
			timings: true,
			warnings: true
		},

		performance: {
			hints: "warning",
			maxEntrypointSize: Infinity,
			maxAssetSize: Infinity
		},

		context: pRoot,

		output: {
			// name each file by their entry module name
			filename: "[name].js",
			// don't use the webpack:// protocol in sourcemaps
			devtoolModuleFilenameTemplate: "/[resource-path]"
		},

		// the entry module
		entry: "main",

		resolve: {
			alias: {
				// folder aliases
				"root"        : pRoot,
				"styles"      : pStyles,
				"img"         : pImages,
				"templates"   : pTemplates,
				"bower"       : pModulesBower,
				"fixtures"    : pTestFixtures,

				// app folders
				"config"      : r( pApp, "config" ),
				"nwjs"        : r( pApp, "nwjs" ),
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

				// explicit lib/module paths
				"shim"        : r( pRoot, "shim" ),
				"ember"       : r( pRoot, "web_modules", "ember" ),
				"ember-data"  : r( pRoot, "web_modules", "ember-data" )
			}
		},

		resolveLoader: {
			modules: [
				pRoot,
				...resolveLoaderModuleDirectories
			]
		},

		plugins: [
			// don't split the main module into multiple chunks
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

			// Split "main" entry point into webpack manifest, bower/npm bundles and app code.
			// Select all modules to be bundled and narrow the selection down in each new chunk.
			// This looks weird and can probably be improved, but it works...
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendor.bower",
				minChunks({ resource }) {
					return resource
						&& (
							   resource.startsWith( pModulesBower )
							|| resource.startsWith( pModulesNpm )
							|| resource.startsWith( pTemplates )
						);
				}
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendor.npm",
				minChunks({ resource }) {
					return resource
						&& (
							   resource.startsWith( pModulesNpm )
							|| resource.startsWith( pTemplates )
						);
				}
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: "templates",
				minChunks({ resource }) {
					return resource
						&& resource.startsWith( pTemplates );
				}
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: "manifest",
				minChunks: Infinity
			}),

			// don't include css stylesheets in the js bundle
			cssExtractTextPlugin,
			lessExtractTextPlugin,

			// ignore l10n modules of momentjs
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),

			// ignore abstract-socket (and its binding dependency)
			new webpack.IgnorePlugin( /abstract-socket/, /dbus-native/ )
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
			modules: [
				pApp,
				...resolveModuleDirectories
			]
		},

		target: "node-webkit",
		devtool: "source-map",

		module: {
			rules: [
				...commonLoaders
			]
		},

		plugins: [
			// NW.js package.json
			new CopyWebpackPlugin([
				{ from: r( pRoot, "package.json" ) }
			]),

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
			modules: [
				pApp,
				...resolveModuleDirectories
			]
		},

		target: "node-webkit",

		module: {
			rules: [
				...commonLoaders,
				{
					test: /\.svg$/,
					loader: "svgo-loader",
					options: {
						plugins: [
							{ removeTitle: true },
							{ removeUselessStrokeAndFill: false }
						]
					}
				}
			]
		},

		plugins: [
			// NW.js package.json
			new CopyWebpackPlugin([
				{ from: r( pRoot, "package.json" ) }
			]),

			new HtmlWebpackPlugin({
				inject: "head",
				hash: false,
				template: r( pRoot, "index.html" )
			}),

			new webpack.DefinePlugin({
				DEBUG: false
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

			// minifiy and optimize production code
			new BabiliPlugin(),

			// add license banner
			new webpack.BannerPlugin({
				banner: [
					"<%= main['display-name'] %>",
					"@version v<%= package.version %>",
					"@date <%= grunt.template.today('yyyy-mm-dd') %>",
					"@copyright <%= package.author %>"
				].join( "\n" ),
				entryOnly: true
			})
		]
	},


	test: {
		output: {
			path: "<%= dir.tmp_test %>"
		},

		resolve: {
			modules: [
				pTest,
				...resolveModuleDirectories
			],
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

		target: "node-webkit",

		module: {
			rules: [
				loaderBabelTest,
				...commonLoaders
			]
		},

		plugins: [
			// NW.js package.json
			new CopyWebpackPlugin([
				{ from: r( pTest, "package.json" ) }
			]),

			new HtmlWebpackPlugin({
				inject: "body",
				hash: false,
				template: r( pTest, "index.html" )
			}),

			new webpack.DefinePlugin({
				DEBUG: false
			}),

			// ignore Windows binary dependencies in tests
			new webpack.IgnorePlugin( /\.exe$/ )
		]
	},


	testdev: {
		output: {
			path: "<%= dir.tmp_test %>"
		},

		entry: "main-dev",
		devtool: "source-map",

		resolve: {
			modules: [
				pTest,
				...resolveModuleDirectories
			],
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

		target: "node-webkit",

		module: {
			rules: [
				loaderBabelTest,
				...commonLoaders
			]
		},

		plugins: [
			// NW.js package.json
			new CopyWebpackPlugin([
				{ from: r( pTest, "package.json" ) }
			]),

			new HtmlWebpackPlugin({
				inject: "body",
				hash: false,
				template: r( pTest, "index.html" )
			}),

			new webpack.DefinePlugin({
				DEBUG: false
			}),

			new NwjsPlugin({
				files: "<%= dir.tmp_test %>/**",
				argv: "--remote-debugging-port=8888",
				rerunOnExit: true,
				log: true,
				logStdOut: false,
				logStdErr: false
			}),

			// ignore Windows binary dependencies in tests
			new webpack.IgnorePlugin( /\.exe$/ )
		],

		watch: true,
		keepalive: true,
		failOnError: false
	}
};
