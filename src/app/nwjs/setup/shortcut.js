define([
	"Ember",
	"config",
	"nwjs/nwGui",
	"utils/node/resolvePath",
	"utils/node/platform",
	"utils/node/denodify",
	"utils/node/fs/stat",
	"commonjs!fs",
	"commonjs!path"
], function(
	Ember,
	config,
	nwGui,
	resolvePath,
	platform,
	denodify,
	stat,
	FS,
	PATH
) {

	var get = Ember.get;
	var App = nwGui.App;
	var isWinGte8 = platform.isWinGte8;

	var shortcutPath = resolvePath( config.dirs[ "windows-shortcut" ] );
	var shortcutName = config.main[ "display-name" ] + ".lnk";


	function getStartmenuShortcutPath() {
		return PATH.join( shortcutPath, shortcutName );
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
			settings.notifyPropertyChange( "notify_shortcut" );
		}
	};

});
