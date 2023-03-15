module.exports = function() {
	this.cacheable( false );

	const { version, package: pkg, built } = this.getOptions();

	return JSON.stringify({
		version,
		built,
		author: pkg.author,
		dependencies: [ "dependencies", "devDependencies" ]
			.reduce( ( obj, key ) => Object.assign( obj, pkg[ key ] ), {} )
	});
};
