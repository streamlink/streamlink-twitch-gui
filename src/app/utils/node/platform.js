define([
	"utils/semver",
	"json!root/metadata",
	"commonjs!os",
	"commonjs!path"
], function(
	semver,
	metadata,
	OS,
	PATH
) {

	var platform = OS.platform();
	var release  = OS.release();

	function isVersionGte( version ) {
		return semver.sort([ release, version ]).shift() === version;
	}


	var isWin    = platform === "win32";
	var isDarwin = platform === "darwin";
	var isLinux  = platform === "linux";

	var isWinGte8 = isWin && isVersionGte( "6.2.0" );


	var slice = [].slice;
	var tmpdirName = metadata.package.config[ "tempdir" ];
	var tmpdirRoot = [ OS.tmpdir(), tmpdirName ];

	function tmpdir() {
		var args = slice.call( arguments );
		return PATH.resolve.apply( PATH, tmpdirRoot.concat( args ) );
	}


	return {
		platform: platform,
		release : release,

		isWin   : isWin,
		isDarwin: isDarwin,
		isLinux : isLinux,

		isWinGte8: isWinGte8,

		tmpdir: tmpdir
	};

});
