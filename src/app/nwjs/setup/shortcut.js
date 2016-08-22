import Ember from "Ember";
import config from "config";
import nwGui from "nwjs/nwGui";
import resolvePath from "utils/node/resolvePath";
import platform from "utils/node/platform";
import denodify from "utils/node/denodify";
import stat from "utils/node/fs/stat";
import FS from "fs";
import PATH from "path";


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


	export default {
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
