import {
	main,
	files
} from "config";
import { Tray } from "nwjs/nwGui";
import Menu from "nwjs/Menu";
import nwWindow, {
	getVisibility,
	toggleVisibility,
	setShowInTaskbar
} from "nwjs/Window";
import {
	platform,
	isWin
} from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";


const { "display-name": displayName } = main;
let { icons: { tray: { [ platform ]: trayIcons } } } = files;


let tray = null;
let items = [
	{
		label: "Toggle window",
		click
	},
	{
		label: "Close application",
		click() {
			nwWindow.close();
		}
	}
];

let menu = Menu.create({ items });

// https://github.com/nwjs/nw.js/issues/1870#issuecomment-94958663
// reapply menu property, so NWjs updates it
menu.on( "update", function() {
	if ( tray ) {
		tray.menu = menu.menu;
	}
});


// prevent tray icons from stacking up when refreshing the page or devtools
nwWindow.window.addEventListener( "beforeunload", hide, false );


export function show( click ) {
	let dpr = window.devicePixelRatio;
	let icons = Object.assign( {}, trayIcons );

	if ( isWin && !DEBUG ) {
		Object.keys( icons ).forEach(function( key ) {
			icons[ key ] = resolvePath( "%NWJSAPPPATH%", icons[ key ] );
		});
	}

	tray = new Tray({
		icon: icons[ dpr > 2 ? "@3x" : dpr > 1 ? "@2x" : "@1x" ],
		tooltip: displayName
	});
	tray.menu = menu.menu;
	tray.on( "click", click );
}

export function hide() {
	if ( !tray ) { return; }
	tray.remove();
	tray = null;
}

export function click() {
	if ( !tray ) { return; }
	tray.emit( "click" );
}

export function hideOnClick() {
	if ( !tray ) { return; }
	tray.once( "click", hide );
}

export function getMenu() {
	return menu;
}

export function setShowInTray( bool, taskbar ) {
	// always remove the tray icon...
	// we need a new click event listener in case the taskbar param has changed
	hide();
	if ( bool ) {
		show(function() {
			toggleVisibility();
			// also toggle taskbar visiblity on click (gui_integration === both)
			if ( taskbar ) {
				setShowInTaskbar( getVisibility() );
			}
		});
	}
}
