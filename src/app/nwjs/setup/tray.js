import config from "config";
import nwWindow from "nwjs/nwWindow";
import tray from "nwjs/tray";
import platform from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


	var displayName = config.main[ "display-name" ];
	var trayIcons   = config.files[ "icons" ][ "tray" ][ platform.platform ];

	if ( platform.isWin ) {
		Object.keys( trayIcons ).forEach(function( key ) {
			trayIcons[ key ] = resolvePath( "%NWJSAPPPATH%/" + trayIcons[ key ] );
		});
	}


	function createTrayIcon() {
		// apply a tray icon+menu to the main application window
		nwWindow.tray = tray.create({
			tooltip: displayName,
			icons  : trayIcons,
			items  : [
				{
					label: "Toggle window",
					click: function() {
						nwWindow.tray.click();
					}
				},
				{
					label: "Close application",
					click: function() {
						nwWindow.close();
					}
				}
			]
		});

		// prevent tray icons from stacking up when refreshing the page or devtools
		nwWindow.on( "shutdown", nwWindow.tray.remove.bind( nwWindow.tray ) );
	}


	export default {
		createTrayIcon: createTrayIcon
	};
