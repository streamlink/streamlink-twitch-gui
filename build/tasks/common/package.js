module.exports = {
	getReleaseNotes: function( version ) {
		var reSplit  = /\n## /g;
		var reFormat = new RegExp([
			"^\\[v?(\\d+\\.\\d+\\.\\d+(?:-\\S+)?)]", // version match
			"\\((\\S+)\\)\\s", // release link match
			"\\((\\d{4}-\\d{2}-\\d{2})\\)", // release date match
			"(\\r\\n|\\n){2}", // spacing match
			"([\\s\\S]+)$" // release notes match
		].join(""));

		var releases = require( "fs" )
			.readFileSync( "CHANGELOG.md" )
			.toString()
			.split( reSplit )
			.slice( 1 )
			.map(function( release ) {
				return reFormat.exec( release );
			})
			.filter(function( release ) {
				return release !== null
					&& release[1] === version;
			});

		if ( releases.length !== 1 || !releases[0][5] ){
			throw new Error( "Release notes for '" + version + "' not found." );
		}

		return releases[0][5].trim();
	}
};
