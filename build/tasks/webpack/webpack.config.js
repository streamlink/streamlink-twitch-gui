const { resolve: r } = require( "path" );
const { pRoot, pApp, pAssets, pLocales, pConfig, pTest, pDependencies } = require( "./paths" );


const resolveModuleDirectories = [
	"web_modules",
	"node_modules"
];
const resolveLoaderModuleDirectories = [
	"web_loaders",
	...resolveModuleDirectories
];


// default target config which each target is based on
module.exports = {
	target: "node-webkit",

	mode: "development",

	context: pApp,
	entry: "main",

	resolve: {
		alias: {
			// directory aliases
			"root": pRoot,
			"assets": pAssets,

			// app aliases
			"config": r( pApp, "config" ),
			"data": r( pApp, "data" ),
			"init": r( pApp, "init" ),
			"locales": pLocales,
			"nwjs": r( pApp, "nwjs" ),
			"services": r( pApp, "services" ),
			"ui": r( pApp, "ui" ),
			"utils": r( pApp, "utils" )
		},
		extensions: [ ".wasm", ".mjs", ".js", ".json", ".ts" ],
		modules: [
			...resolveModuleDirectories
		]
	},

	resolveLoader: {
		modules: [
			pRoot,
			...resolveLoaderModuleDirectories
		]
	},

	module: {
		rules: [],
		noParse: []
	},

	plugins: [],


	output: {
		// name each file by its entry module name
		filename: "[name].js",
		// don't use the webpack:// protocol in sourcemaps
		devtoolModuleFilenameTemplate: "/[resource-path]"
	},

	optimization: {
		runtimeChunk: true,
		splitChunks: {
			chunks: "all",
			minSize: 0,
			maxInitialRequests: Infinity,
			cacheGroups: {
				vendor: {
					name: "vendor",
					test: pDependencies
				},
				config: {
					name: "config",
					test: pConfig
				},
				translation: {
					name: "translation",
					test({ resource }) {
						return resource
						    && resource.startsWith( pLocales )
						    && resource.endsWith( ".yml" );
					}
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
	},


	cache: true,
	performance: {
		hints: "warning",
		maxEntrypointSize: Infinity,
		maxAssetSize: Infinity
	},

	stats: {
		modules: false,
		chunks: false,
		chunkModules: false,
		children: false,
		timings: true,
		warnings: true
	}
};
