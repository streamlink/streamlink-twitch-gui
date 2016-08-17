module.exports = function( grunt ) {
	var name  = "package";
	var descr = "Build a package";

	function setConfig( key, pattern, replacement ) {
		return function( data ) {
			grunt.config.set(
				"package." + key,
				pattern && replacement
					? data.replace( pattern, replacement )
					: data
			);
			return data;
		};
	}

	var reEscapeXmlChars = /[&<>"']/g;
	function fnEscapeXmlChars( char ) {
		switch ( char ) {
			case "&":  return "&amp;";
			case "<":  return "&lt;";
			case ">":  return "&gt;";
			case "\"": return "&quot;";
			case "'":  return "&apos;";
			default:   return char;
		}
	}

	grunt.task.registerMultiTask( name, descr, function() {
		var done = this.async();
		var options = this.options({
			changelog: false,
			checksums: false
		});
		var tasks = this.data.tasks;
		var packageJSON = grunt.config.get( "package" );
		var promises = [];


		if ( options.changelog ) {
			promises.push(
				require( "../common/release-changelog" )( options, packageJSON )
					.then( setConfig( "changelog" ) )
					.then( setConfig( "changelogEscaped", reEscapeXmlChars, fnEscapeXmlChars ) )
			);
		}

		if ( options.checksums ) {
			promises.push(
				require( "../common/release-checksums" )( options, packageJSON )
					.then( setConfig( "checksums" ) )
			);
		}

		if ( options.checksumAtom ) {
			promises.push(
				require( "../common/download-and-hash" )( options.githubReleasesAtom )
					.then( setConfig( "checksumAtom" ) )
			);
		}

		Promise.all( promises )
			.then(function() {
				grunt.task.run( tasks || [] );
			})
			.then( done, grunt.fail.fatal );
	});

};
