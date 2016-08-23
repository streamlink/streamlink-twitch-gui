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

if ( isWin ) {
	Object.keys( trayIcons ).forEach(function( key ) {
		let icon = trayIcons[ key ];
		trayIcons[ key ] = resolvePath( `%NWJSAPPPATH%/${icon}` );
	});
}


export function createTrayIcon() {
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
