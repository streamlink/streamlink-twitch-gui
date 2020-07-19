function lazyGet( obj, prop, callback ) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get() {
			const value = callback( obj );

			Object.defineProperty( obj, prop, {
				enumerable: true,
				get() {
					return value;
				}
			});

			return value;
		}
	});
}


function getVersion( config ) {
	// this needs to be executed synchronously, since loading grunt's config can't be deferred
	const { spawnSync } = require( "child_process" );
	const { status, error, stdout, stderr } = spawnSync(
		"git",
		[ "describe", "--tags", "--dirty" ],
		{
			stdio: [ "ignore", "pipe", "pipe" ],
			maxBuffer: 1024,
			timeout: 4000,
			windowsHide: true
		}
	);

	// use a static version string from package.json if git can't be found or if not a git repo
	if ( error || status !== 0 || stderr.toString().length ) {
		// package.version does not have a leading 'v'
		return `v${config.package.version}`;
	}

	const output = stdout.toString().trim();

	const semver = require( "semver" );
	if ( !semver.parse( output ) ) {
		throw new Error( "Invalid output of `git describe --tags --dirty`" );
	}

	// turn fake prerelease data into build data and make it file name friendly
	// v1.2.3-rc45-67-gdeadbeef-dirty => v1.2.3-rc45+67.gdeadbeef.dirty
	return output.replace(
		/-(\d+-g[a-f0-9]+(-dirty)?)$/,
		( _, s ) => `+${s.replace( /-/g, "." )}`
	);
}


module.exports = function( config ) {
	lazyGet( config, "version", getVersion );
};
