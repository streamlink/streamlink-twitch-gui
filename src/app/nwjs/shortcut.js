define([
	"json!root/metadata",
	"nwjs/nwGui",
	"utils/semver",
	"utils/resolvePath",
	"utils/platform",
	"commonjs!path"
], function(
	metadata,
	nwGui,
	semver,
	resolvePath,
	platform,
	PATH
) {

	var config = metadata.package.config[ "notifications-toast-windows" ];

	function createShortcut( name ) {
		if ( platform.isWinGte8 ) {
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
