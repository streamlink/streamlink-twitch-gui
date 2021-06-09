const loaderUtils = require( "loader-utils" );


module.exports = function() {
	this.cacheable( false );

	const { version, package: pkg, built } = loaderUtils.getOptions( this );

	return JSON.stringify({
		version,
		built,
		author: pkg.author,
		dependencies: [ "dependencies", "devDependencies" ]
			.reduce( ( obj, key ) => Object.assign( obj, pkg[ key ] ), {} )
	});
};
