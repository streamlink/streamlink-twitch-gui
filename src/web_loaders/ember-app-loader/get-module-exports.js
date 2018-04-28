const HarmonyExportExpressionDependency
	= require( "webpack/lib/dependencies/HarmonyExportExpressionDependency" );
const HarmonyExportSpecifierDependency
	= require( "webpack/lib/dependencies/HarmonyExportSpecifierDependency" );
const HarmonyExportImportedSpecifierDependency
	= require( "webpack/lib/dependencies/HarmonyExportImportedSpecifierDependency" );


module.exports = function getModuleExportsFactory( loaderContext ) {
	return path => new Promise( ( resolve, reject ) => {
		loaderContext.loadModule( path, ( error, source, sourceMap, { dependencies } ) => {
			if ( error || !dependencies ) {
				return reject( error );
			}

			// does the module have a default export?
			const exports = dependencies.find( d => d instanceof HarmonyExportExpressionDependency )
				// just resolve with the default export name
				? [ "default" ]
				// get the list of all export names instead
				: dependencies
					.filter( d =>
						   d instanceof HarmonyExportSpecifierDependency
						|| d instanceof HarmonyExportImportedSpecifierDependency
					)
					.map( dependency => dependency.name );

			resolve( exports );
		});
	});
};
