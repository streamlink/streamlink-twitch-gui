const { merge } = require( "lodash" );
const globalBabelConfig = require( "./babel.config" );


function buildBabelConfig( config ) {
	return merge( {}, globalBabelConfig, config );
}


module.exports = {
	buildBabelConfig
};
