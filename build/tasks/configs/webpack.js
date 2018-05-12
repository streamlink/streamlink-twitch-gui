const webpack = require( "webpack" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const OptimizeCssAssetsPlugin = require( "optimize-css-assets-webpack-plugin" );
const NwjsPlugin = require( "../common/nwjs-webpack-plugin" );
const emberFeatures = require( "../../../src/config/ember-features.json" );
const locales = require( "../../../src/config/locales.json" );
const { resolve: r } = require( "path" );
const { tmpdir } = require( "os" );


// path definitions
const pProjectRoot = r( "." );
const pRoot = r( ".", "src" );
const pApp = r( pRoot, "app" );
const pConfig = r( pRoot, "config" );
const pTest = r( pRoot, "test" );
const pTestFixtures = r( pTest, "fixtures" );
const pImages = r( pRoot, "img" );
const pDependencies = r( ".", "node_modules" );
const pCacheBabel = r( tmpdir(), "babel-cache" );


// regexp for filtering locale config file imports (momentjs, ember-i18n, etc.)
const reLocales = new RegExp( `(${Object.keys( locales.locales ).join( "|" )})\.js$`, "i" );


const resolveModuleDirectories = [
	"web_modules",
	"node_modules"
];
const resolveLoaderModuleDirectories = [
	"web_loaders",
	...resolveModuleDirectories
];


const commonLoaders = [
	{
		test: /ember-app\.js$/,
		loader: "ember-app-loader",
		options: {
			context: pApp
		}
	},
	// Ember import polyfill
	// translates `import foo from "@ember/bar"` into `Ember.baz`
	// requires those imports to be ignored
	{
		test: /\.js$/,
		include: [
			pRoot,
			r( pDependencies, "ember-i18n" )
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
		test: /\.ya?ml$/,
		loader: [
			"json-loader",
			"yaml-loader"
		]
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
		use: [
			MiniCssExtractPlugin.loader,
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
	},
	// Application stylesheets (extract fonts and images)
	{
		test: /\.less$/,
		include: pRoot,
		use: [
			MiniCssExtractPlugin.loader,
			{
				loader: "css-loader",
				options: {
					sourceMap: true,
					minify: false,
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
					noIeCompat: true
				}
			},
			{
				loader: "themes-loader",
				options: {
					config: r( pConfig, "themes.json" ),
					themesVarName: "THEMES",
					themesPath: "~ui/styles/themes/"
				}
			}
		]
	},
	{
		enforce: "pre",
		test: /[\/\\]flag-icon[\/\\]styles\.less$/,
		loader: "flag-icons-loader",
		options: {
			config: r( pConfig, "langs.json" ),
			ignore: [ "en" ]
		}
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

const loaderBabelCoverage = {
	test: /\.js$/,
	exclude: pDependencies,
	loader: "babel-loader",
	options: {
		presets: [],
		plugins: [
			"babel-plugin-transform-es2015-modules-commonjs",
			[ "babel-plugin-istanbul", {
				exclude: [
					"**/src/web_modules/**"
				]
			}]
		],
		cacheDirectory: pCacheBabel
	}
};


// for some reason, this can't be set in grunt-webpack's options object, so add references manually
const optimization = {
	runtimeChunk: true,
	splitChunks: {
		chunks: "all",
		cacheGroups: {
			vendors: {
				name: "vendor",
				test: pDependencies
			},
			template: {
				name: "template",
				test: /\.hbs$/
			},
			test: {
				name: "test",
				test: pTest
			}
		}
	}
};


module.exports = {
	// common options
	// the grunt-webpack merges the "options" objects with each task config (nested)
	options: {
		target: "node-webkit",

		cache: true,

		mode: "development",

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
			// fix default value for node-webkit targets ("global"), which breaks NW.js
			globalObject: "window",
			// don't use the webpack:// protocol in sourcemaps
			devtoolModuleFilenameTemplate: "/[resource-path]"
		},

		// the entry module
		entry: "main",

		resolve: {
			alias: {
				// folder aliases
				"root"        : pRoot,
				"img"         : pImages,
				"fixtures"    : pTestFixtures,

				// app aliases
				"config"      : r( pApp, "config" ),
				"data"        : r( pApp, "data" ),
				"init"        : r( pApp, "init" ),
				"locales"     : r( pApp, "locales" ),
				"nwjs"        : r( pApp, "nwjs" ),
				"services"    : r( pApp, "services" ),
				"ui"          : r( pApp, "ui" ),
				"utils"       : r( pApp, "utils" ),

				// explicit lib/module paths
				"shim"        : r( pRoot, "shim" ),
				"ember"       : r( pRoot, "web_modules", "ember" ),
				"ember-data/version$": r( pRoot, "web_modules", "ember-data", "version" ),
				"ember-data/app": r( pDependencies, "ember-data", "app" ),
				"ember-data"  : r( pDependencies, "ember-data", "addon" ),
				"ember-inflector": r( pDependencies, "ember-inflector", "addon" ),
				"ember-data-model-fragments":
					r( pDependencies, "ember-data-model-fragments", "addon" ),
				"ember-localstorage-adapter":
					r( pDependencies, "ember-localstorage-adapter", "addon" ),
				"ember-i18n$" : r( pRoot, "web_modules", "ember-i18n" ),
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
			noParse: [
				/[\/\\]ember-source[\/\\]dist[\/\\]ember\.(debug|prod)\.js$/,
				/[\/\\]moment[\/\\]moment\.js$/
			]
		},

		plugins: [
			new webpack.optimize.SplitChunksPlugin(),

			// don't include css stylesheets in the js bundle
			new MiniCssExtractPlugin({
				filename: "[name].css"
			}),

			// ignore all @ember imports (see Ember import polyfill)
			new webpack.IgnorePlugin( /@ember/ ),

			// remove ember-i18n's get-locales utility function
			new webpack.NormalModuleReplacementPlugin(
				/ember-i18n[\/\\]addon[\/\\]utils[\/\\]get-locales\.js$/,
				r( pRoot, "web_modules", "ember-i18n", "get-locales.js" )
			),

			// only import locale configs of available locales
			new webpack.ContextReplacementPlugin(
				/moment[\/\\]locale/,
				reLocales
			)
		]
	},


	// -----
	// task configs
	// -----


	dev: {
		output: {
			path: "<%= dir.tmp_dev %>"
		},

		optimization,

		resolve: {
			modules: [
				pApp,
				...resolveModuleDirectories
			]
		},

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
		mode: "production",

		output: {
			path: "<%= dir.tmp_prod %>"
		},

		optimization,

		resolve: {
			modules: [
				pApp,
				...resolveModuleDirectories
			]
		},

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
				/[\/\\]ember-source[\/\\]dist[\/\\]ember\.debug\.js$/,
				r( pDependencies, "ember-source", "dist", "ember.prod.js" )
			),

			// minifiy and optimize production code
			new OptimizeCssAssetsPlugin({
				cssProcessorOptions: {
					autoprefixer: false,
					preset: [ "default", {
						svgo: false
					}]
				}
			}),

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

		optimization,

		resolve: {
			modules: [
				pTest,
				...resolveModuleDirectories
			],
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

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


	coverage: {
		output: {
			path: "<%= dir.tmp_test %>"
		},

		optimization,

		entry: "main-coverage",
		devtool: "inline-source-map",

		resolve: {
			modules: [
				pTest,
				...resolveModuleDirectories
			],
			alias: {
				"tests": r( pTest, "tests" )
			}
		},

		module: {
			rules: [
				loaderBabelCoverage,
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
			})
		]
	},


	testdev: {
		output: {
			path: "<%= dir.tmp_test %>"
		},

		optimization,

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
