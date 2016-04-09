define([
	"utils/semver",
	"commonjs!os"
], function(
	semver,
	OS
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


	return {
		platform: platform,
		release : release,

		isWin   : isWin,
		isDarwin: isDarwin,
		isLinux : isLinux,

		isWinGte8: isWinGte8
	};

});
