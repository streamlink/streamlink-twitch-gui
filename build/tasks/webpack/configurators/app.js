const { resolve } = require( "path" );
const { pRoot, pProjectRoot, pConfig } = require( "../paths" );


/**
 * Application content specific configurations
 */
module.exports = {
	common( config ) {
		// embed additional HTML files - used by the AuthService's HTTP server
		config.module.rules.push({
			test: /\.html$/,
			loader: "raw-loader"
		});

		// metadata
		config.module.rules.push({
			test: /metadata\.js$/,
			// see `src/web_loaders/metadata-loader.js`
			loader: "metadata-loader",
			options: {
				dependencyProperties: [ "dependencies", "devDependencies" ],
				packageJson: resolve( pProjectRoot, "package.json" ),
				donationConfigFile: resolve( pConfig, "main.json" )
			}
		});

		// themes
		config.module.rules.push({
			enforce: "pre",
			test: /\.less$/,
			include: pRoot,
			// see `src/web_loaders/themes-loader.js`
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
			// see `src/web_loaders/flag-icons-loader.js`
			loader: "flag-icons-loader",
			options: {
				config: resolve( pConfig, "langs.json" ),
				ignore: [ "en" ]
			}
		});
	}
};
