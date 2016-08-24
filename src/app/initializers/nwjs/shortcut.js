import { get } from "Ember";
import {
	main,
	dirs
} from "config";
import { App } from "nwjs/nwGui";
import resolvePath from "utils/node/resolvePath";
import { isWinGte8 } from "utils/node/platform";
import denodify from "utils/node/denodify";
import { stat } from "utils/node/fs/stat";
import FS from "fs";
import PATH from "path";


const { "display-name": displayName } = main;
const { "windows-shortcut": windowsShortcut } = dirs;
const { createShortcut } = App;

const shortcutName = `${displayName}.lnk`;
const shortcutPath = resolvePath( windowsShortcut );


function getStartmenuShortcutPath() {
	return PATH.join( shortcutPath, shortcutName );
}

function createStartmenuShortcutWin8() {
	// register AppUserModelID
	// this is required for toast notifications on windows 8+
	// https://github.com/nwjs/nwjs/wiki/Notification#windows
	var shortcut = getStartmenuShortcutPath();
	createShortcut( shortcut );
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


export function createStartmenuShortcut( settings ) {
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
