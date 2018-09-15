const { pRoot } = require( "../paths" );


/**
 * Code quality related configurations
 */
module.exports = {
	common( config ) {
		// eslint loader
		config.module.rules.unshift({
			enforce: "pre",
			test: /\.js$/,
			include: pRoot,
			loader: "eslint-loader",
			options: {
				failOnError: true
			}
		});
	}
};
