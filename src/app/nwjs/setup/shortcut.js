define([
	"Ember",
	"nwjs/nwGui",
	"utils/node/resolvePath",
	"utils/node/platform",
	"utils/node/denodify",
	"utils/node/fs/stat",
	"json!root/metadata",
	"commonjs!fs",
	"commonjs!path"
], function(
	Ember,
	nwGui,
	resolvePath,
	platform,
	denodify,
	stat,
	metadata,
	FS,
	PATH
) {

	var get = Ember.get;
	var App = nwGui.App;
	var isWinGte8 = platform.isWinGte8;


	function getStartmenuShortcutPath() {
		var displayName   = metadata.package.config[ "display-name" ];
		var startmenuPath = metadata.package.config[ "windows-shortcut-path" ];
		var resolved = resolvePath( startmenuPath );
		var filename = displayName + ".lnk";
		return PATH.join( resolved, filename );
	}

	function createStartmenuShortcutWin8() {
		// register AppUserModelID
		// this is required for toast notifications on windows 8+
		// https://github.com/nwjs/nwjs/wiki/Notification#windows
		var shortcut = getStartmenuShortcutPath();
		App.createShortcut( shortcut );
	}

	function removeStartmenuShortcutWin8() {
		var shortcut = getStartmenuShortcutPath();
		var unlink   = denodify( FS.unlink );
		stat( shortcut )
			.then(function() {
				return unlink( shortcut );
			})
			.catch(function() {});
	}


	return {
		createStartmenuShortcut: function( settings ) {
			if ( !isWinGte8 ) { return; }

			settings.addObserver( "notify_shortcut", function() {
				var value = get( settings, "notify_shortcut" );
				if ( value ) {
					createStartmenuShortcutWin8();
				} else {
					removeStartmenuShortcutWin8();
				}
			});
		}
	};

});
