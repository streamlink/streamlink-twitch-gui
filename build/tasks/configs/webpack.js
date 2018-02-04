const webpack = require( "webpack" );
const BabiliPlugin = require( "babili-webpack-plugin" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const ExtractTextPlugin = require( "extract-text-webpack-plugin" );
const LessPluginCleanCSS = require( "less-plugin-clean-css" );
const NwjsPlugin = require( "../common/nwjs-webpack-plugin" );
const emberFeatures = require( "../../../src/config/ember-features.json" );
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
const pDependencies = r( ".", "node_modules" );
const pCacheBabel = r( tmpdir(), "babel-cache" );


const resolveModuleDirectories = [
	"web_modules",
	"node_modules"
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
	// Ember import polyfill
	// translates `import foo from "@ember/bar"` into `Ember.baz`
	// requires those imports to be ignored
	{
		test: /\.js$/,
		exclude: [
			pDependencies,
			r( pRoot, "web_modules" )
		],
		loader: "babel-loader",
		options: {
			presets: [],
			plugins: [
				require( "babel-plugin-ember-modules-api-polyfill" )
			],
			cacheDirectory: pCacheBabel
		}
	},
	// Ember-Data
	{
		test: /\.js$/,
		include: r( pDependencies, "ember-data", "addon" ),
		loader: "babel-loader",
		options: {
			presets: [],
			plugins: [
				[ require( "babel-plugin-feature-flags" ), {
					import: {
						module: "ember-data/-private/features"
					},
					features: emberFeatures
				} ],
				require( "babel6-plugin-strip-heimdall" ),
				require( "babel6-plugin-strip-class-callcheck" )
			],
			cacheDirectory: pCacheBabel
		}
	},
	{
		enforce: "pre",
		test: /\.js$/,
		loader: "eslint-loader",
		exclude: pDependencies,
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
			packageJson: r( pProjectRoot, "package.json" ),
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


const loadersEmberProductionBuild = [
	{
		test: /\.js$/,
		include: r( pDependencies, "ember-data", "addon" ),
		loader: "babel-loader",
		options: {
			presets: [],
			plugins: [
				// https://github.com/emberjs/data/blob/v2.11.3/lib/stripped-build-plugins.js#L48
				[ require( "babel-plugin-filter-imports" ), {
					imports: {
						"ember-data/-private/debug": [
							"instrument",
							"assert",
							"assertPolymorphicType",
							"debug",
							"deprecate",
							"info",
							"runInDebug",
							"warn",
							"debugSeal"
						]
					}
				}]
			],
			cacheDirectory: pCacheBabel
		}
	}
];


// the inject-loader used by some tests requires es2015 modules to be transpiled
const loaderBabelTest = {
	test: /\.js$/,
	exclude: pDependencies,
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
				"fixtures"    : pTestFixtures,

				// app folders
				"config"      : r( pApp, "config" ),
				"nwjs"        : r( pApp, "nwjs" ),
				"initializers": r( pApp, "initializers" ),
				"instance-initializers": r( pApp, "instance-initializers" ),
				"services"    : r( pApp, "services" ),
				"helpers"     : r( pApp, "helpers" ),
				"models"      : r( pApp, "models" ),
				"controllers" : r( pApp, "controllers" ),
				"routes"      : r( pApp, "routes" ),
				"components"  : r( pApp, "components" ),
				"store"       : r( pApp, "store" ),
				"utils"       : r( pApp, "utils" ),

				// explicit lib/module paths
				"shim"        : r( pRoot, "shim" ),
				"ember"       : r( pRoot, "web_modules", "ember" ),
				"ember-data/version$": r( pRoot, "web_modules", "ember-data", "version" ),
				"ember-data/app": r( pDependencies, "ember-data", "app" ),
				"ember-data"  : r( pDependencies, "ember-data", "addon" ),
				"ember-inflector": r( pDependencies, "ember-inflector", "addon" ),
				"qunit$"      : r( pTest, "web_modules", "qunit" ),
				"ember-qunit$": "ember-qunit",
				"ember-qunit" : "ember-qunit/lib/ember-qunit",
				"ember-test-helpers$": "ember-test-helpers",
				"ember-test-helpers" : "ember-test-helpers/lib/ember-test-helpers",
				"require"     : r( pTest, "web_modules", "require" )
			}
		},

		resolveLoader: {
			modules: [
				pRoot,
				...resolveLoaderModuleDirectories
			]
		},

		module: {
			noParse: /\/ember-source\/dist\/ember\.(debug|prod)\.js$/
		},

		plugins: [
			// don't split the main module into multiple chunks
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

			// Split "main" entry point into webpack manifest, dependency bundles and app code.
			// Select all modules to be bundled and narrow the selection down in each new chunk.
			// This looks weird and can probably be improved, but it works...
			new webpack.optimize.CommonsChunkPlugin({
				name: "dependencies",
				minChunks({ resource }) {
					return resource
						&& (
							   resource.startsWith( pDependencies )
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

			// ignore all @ember imports (see Ember import polyfill)
			new webpack.IgnorePlugin( /@ember/, pRoot ),

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
				...loadersEmberProductionBuild,
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
				/\/ember-source\/dist\/ember\.debug\.js$/,
				r( pDependencies, "ember-source", "dist", "ember.prod.js" )
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
