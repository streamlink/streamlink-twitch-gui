const { resolve: r } = require( "path" );


const pProjectRoot = r( __dirname, "..", "..", ".." );
const pRoot = r( pProjectRoot, "src" );
const pApp = r( pRoot, "app" );
const pAssets = r( pApp, "assets" );
const pLocales = r( pApp, "locales" );
const pConfig = r( pRoot, "config" );
const pTest = r( pRoot, "test" );
const pTestFixtures = r( pTest, "fixtures" );
const pDependencies = r( pProjectRoot, "node_modules" );


module.exports = {
	pProjectRoot,
	pRoot,
	pApp,
	pAssets,
	pLocales,
	pConfig,
	pTest,
	pTestFixtures,
	pDependencies
};
