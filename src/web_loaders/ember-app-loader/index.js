/*!
 * A custom ember-app-loader which builds a simple namespace for Ember's default resolver.
 * Based on the Ember Module Unification RFC
 * https://github.com/emberjs/rfcs/blob/master/text/0143-module-unification.md
 *
 * With modification suited for this specific application:
 * - Only imports a defined set of groups/collections
 * - Doesn't have any logic regarding main modules and addons
 * - Doesn't support private collections (ignores those collections and modules)
 * - Has a customized list of supported types and collection types
 * - Infinitely nests module names (with exceptions in the components collection)
 * - Imports and runs initializers and instance initializers
 */

const IMPORTS = require( "./imports" );
const getFiles = require( "./get-files" );
const getModuleExportsFactory = require( "./get-module-exports" );
const parse = require( "./parse" );
const build = require( "./build" );
const { join } = require( "path" );


module.exports = function() {
	const callback = this.async();
	const getModuleExports = getModuleExportsFactory( this );
	const cachedFs = this.fs;
	const context = this.query.context;

	this.cacheable();

	const modules = [];
	for ( const importObj of IMPORTS ) {
		const dir = join( context, importObj.dir );
		if ( !cachedFs.statSync( dir ).isDirectory() ) {
			continue;
		}

		// make the directory where we're reading from a recursive build dependency
		this.addContextDependency( dir );

		// get the list of all matching files of that directory
		const files = getFiles( cachedFs, context, importObj );

		// get the names of all ember app modules (async)
		modules.push( ...parse( files, getModuleExports ) );
	}

	Promise.all( modules )
		.then( build )
		.then(
			output => callback( null, output ),
			error => callback( error )
		);
};
