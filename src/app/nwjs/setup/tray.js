import {
	main,
	files
} from "config";
import nwWindow from "nwjs/nwWindow";
import tray from "nwjs/tray";
import {
	platform,
	isWin
} from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


const { "display-name": displayName } = main;
let { icons: { tray: { [ platform ]: trayIcons } } } = files;
let initialized = false;


export function createTrayIcon() {
	// make sure platformfixes have been applied
	// FIXME: revisit this when merging nwjs-upgrade
	if ( isWin && !initialized ) {
		Object.keys( trayIcons ).forEach(function( key ) {
			let icon = trayIcons[ key ];
			trayIcons[ key ] = resolvePath( `%NWJSAPPPATH%\\${icon}` );
		});
	}
	initialized = true;

	// apply a tray icon+menu to the main application window
	nwWindow.tray = tray.create({
		tooltip: displayName,
		icons  : trayIcons,
		items  : [
			{
				label: "Toggle window",
				click() {
					nwWindow.tray.click();
				}
			},
			{
				label: "Close application",
				click() {
					nwWindow.close();
				}
			}
		]
	});

	// prevent tray icons from stacking up when refreshing the page or devtools
	nwWindow.on( "shutdown", nwWindow.tray.remove.bind( nwWindow.tray ) );
}
