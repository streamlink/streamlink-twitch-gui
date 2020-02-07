const { pApp, pTest } = require( "../paths" );


/**
 * Resolver configurations for each build target
 */
module.exports = {
	_resolve( config, path ) {
		// set the first module resolve path
		config.resolve.modules.unshift( path );
	},

	dev( config ) {
		this._resolve( config, pApp );
	},

	prod( config ) {
		this._resolve( config, pApp );
	},

	test( config ) {
		this._resolve( config, pTest );
	},

	testdev( config ) {
		this._resolve( config, pTest );
	},

	coverage( config ) {
		this._resolve( config, pTest );
	},

	i18n( config ) {
		this._resolve( config, pApp );
	}
};
