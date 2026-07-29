const { merge } = require( "lodash" );
const globalBabelConfig = require( "./babel.config" );


function isTestTarget( target ) {
	return target === "test" || target === "testdev" || target === "coverage";
}

function buildBabelConfig( config ) {
	return merge( {}, globalBabelConfig, config );
}


module.exports = {
	isTestTarget,
	buildBabelConfig
};
