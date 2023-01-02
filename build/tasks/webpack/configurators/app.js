const { resolve } = require( "path" );
const { pRoot, pConfig } = require( "../paths" );
const Date = require( "../../common/date" );


/**
 * Application content specific configurations
 */
module.exports = {
	common( config, grunt ) {
		// YAML config files
		config.module.rules.push({
			test: /\.ya?ml$/,
			include: pConfig,
			type: "json",
			use: [
				{
					loader: "yaml-loader",
					options: {
						asJSON: true
					}
				}
			]
		});

		// embed additional HTML files - used by the AuthService's HTTP server
		config.module.rules.push({
			test: /\.html$/,
			loader: "raw-loader"
		});

		// metadata
		config.module.rules.push({
			test: /metadata\.js$/,
			use: [
				"optimized-json-loader",
				{
					// see `build/tasks/webpack/loaders/metadata-loader.js`
					loader: "metadata-loader",
					options: {
						version: grunt.config( "version" ),
						package: grunt.config( "package" ),
						built: new Date().toISOString()
					}
				}
			]
		});

		// themes
		config.module.rules.push({
			enforce: "pre",
			test: /\.less$/,
			include: pRoot,
			// see `build/tasks/webpack/loaders/themes-loader.js`
			loader: "themes-loader",
			options: {
				config: resolve( pConfig, "themes.json" ),
				themesVarName: "THEMES",
				themesPath: "~ui/styles/themes/"
			}
		});

		// flag icons
		config.module.rules.push({
			enforce: "pre",
			test: /[\/\\]flag-icon[\/\\]styles\.less$/,
			use: [
				{
					// see `build/tasks/webpack/loaders/flag-icons-loader.js`
					loader: "flag-icons-loader",
					options: {
						config: resolve( pConfig, "langs.yml" ),
						ignore: [ "en" ]
					}
				}
			]
		});
	},

	prod( config ) {
		const TerserWebpackPlugin = require( "terser-webpack-plugin" );

		config.optimization.minimizer.unshift(
			new TerserWebpackPlugin({
				extractComments: false,
				parallel: true,
				terserOptions: {
					compress: {
						passes: 3
					}
				}
			})
		);
	}
};
