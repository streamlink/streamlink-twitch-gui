const { pCacheBabel: cacheDirectory } = require( "./paths" );


// global babel{,-loader} config which will be merged by each specific config
module.exports = {
	// babel-loader config
	cacheDirectory,

	// babel config
	parserOpts: {},
	presets: [],
	plugins: []
};
