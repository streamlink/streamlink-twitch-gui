define([
	"json!root/metadata",
	"nwjs/nwGui",
	"utils/semver",
	"utils/resolvePath",
	"commonjs!path",
	"commonjs!os"
], function(
	metadata,
	nwGui,
	semver,
	resolvePath,
	PATH,
	OS
) {

	var config = metadata.package.config[ "notifications-toast-windows" ];

	var vers = OS.release();
	var win8 = config[ "version-min" ];

	function createShortcut( name ) {
		if (
			// check if current platform is windows
			   process.platform === "win32"
			// check if windows version is >= 8
			&& semver.sort([ vers, win8 ]).shift() === win8
		) {
			// register AppUserModelID
			// this is required for toast notifications on windows 8+
			// https://github.com/nwjs/nwjs/wiki/Notification#windows
			var resolved = resolvePath( config[ "shortcut-path" ] );
			var filename = name + ".lnk";
			var shortcut = PATH.join( resolved, filename );
			nwGui.App.createShortcut( shortcut );
		}
	}


	return {
		createShortcut: createShortcut
	};

});
