define([
	"nwjs/nwGui",
	"utils/resolvePath",
	"utils/platform",
	"json!root/metadata",
	"commonjs!path"
], function(
	nwGui,
	resolvePath,
	platform,
	metadata,
	PATH
) {

	var App = nwGui.App;

	var isWinGte8 = platform.isWinGte8;

	var displayName   = metadata.package.config[ "display-name" ];
	var startmenuPath = metadata.package.config[ "windows-shortcut-path" ];

	function createStartmenuShortcutWin8() {
		// register AppUserModelID
		// this is required for toast notifications on windows 8+
		// https://github.com/nwjs/nwjs/wiki/Notification#windows
		var resolved = resolvePath( startmenuPath );
		var filename = displayName + ".lnk";
		var shortcut = PATH.join( resolved, filename );
		App.createShortcut( shortcut );
	}


	return {
		createStartmenuShortcut: function() {
			if ( isWinGte8 ) {
				createStartmenuShortcutWin8();
			}
		}
	};

});
