const { resolve: r } = require( "path" );
const { tmpdir } = require( "os" );


const pProjectRoot = r( __dirname, "..", "..", ".." );
const pRoot = r( pProjectRoot, "src" );
const pApp = r( pRoot, "app" );
const pConfig = r( pRoot, "config" );
const pTest = r( pRoot, "test" );
const pTestFixtures = r( pTest, "fixtures" );
const pImages = r( pRoot, "img" );
const pDependencies = r( pProjectRoot, "node_modules" );
const pCacheBabel = r( tmpdir(), "babel-cache" );


module.exports = {
	pProjectRoot,
	pRoot,
	pApp,
	pConfig,
	pTest,
	pTestFixtures,
	pImages,
	pDependencies,
	pCacheBabel
};
