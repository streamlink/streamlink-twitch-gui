define( [ "Ember", "nwjs/nwGui", "utils/semver" ], function( Ember, nwGui, semver ) {

	var OS   = require( "os" ).release();
	var win8 = "6.2.0";
	var path = "%@\\Microsoft\\Windows\\Start Menu\\Programs\\%@.lnk";

	function createAppShortcut( name ) {
		if (
			// check if current platform is windows
			   process.platform === "win32"
			// check if windows version is >= 8
			&& semver.sort([ OS, win8 ]).shift() === win8
		) {
			// register AppUserModelID
			// this is required for toast notifications on windows 8+
			// https://github.com/nwjs/nwjs/wiki/Notification#windows
			var shortcut = path.fmt( process.env.APPDATA, name );
			nwGui.App.createShortcut( shortcut );
		}
	}


	return {
		create: createAppShortcut
	};

});
