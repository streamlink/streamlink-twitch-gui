import { getProperties, setProperties } from "@ember/object";
import { debounce } from "@ember/runloop";
import { vars as varsConfig } from "config";
import nwWindow from "nwjs/Window";
import reset from "nwjs/Window/reset";
import nwScreen from "nwjs/Screen";
import { isWin } from "utils/node/platform";


const {
	"time-window-event-debounce": timeDebounce,
	"time-window-event-ignore": timeIgnore
} = varsConfig;
const { screens } = nwScreen;


let ignore = false;


function isWindowFullyVisible() {
	const { x: wX, y: wY, width: wWidth, height: wHeight } = nwWindow;

	// the window needs to be fully visible on one screen
	return screens.some( screen => {
		const { bounds: { x: sX, y: sY, width: sWidth, height: sHeight } } = screen;

		// substract screen offset from window position
		const posX = wX - sX;
		const posY = wY - sY;

		// check boundaries
		return posX >= 0
		    && posY >= 0
		    && posX + wWidth <= sWidth
		    && posY + wHeight <= sHeight;
	});
}


function debounceEvent( windowRecord, fn ) {
	return ( ...args ) => debounce( null, fn, windowRecord, ...args, timeDebounce, false );
}


function unignoreEventListeners() {
	ignore = false;
}

function ignoreEventListeners() {
	ignore = true;
	debounce( unignoreEventListeners, timeIgnore );
}


function save( windowRecord, data ) {
	setProperties( windowRecord, data );
	return windowRecord.save();
}


function onResize( windowRecord, width, height ) {
	if ( ignore ) { return; }
	// validate window position
	if ( !isWindowFullyVisible() ) { return; }

	return save( windowRecord, { width, height } );
}

function onMove( windowRecord, x, y ) {
	if ( ignore ) { return; }
	// double check on Windows: NW.js moves the window to
	// [    -8,    -8] when maximizing...
	// [-32000,-32000] when minimizing...
	if ( isWin && ( x === -8 && y === -8 || x === -32000 && x === -32000 ) ) { return; }
	// validate window position
	if ( !isWindowFullyVisible() ) { return; }

	return save( windowRecord, { x, y } );
}

function onMaximize( windowRecord, maximized ) {
	return save( windowRecord, { maximized } );
}


async function restoreWindowFromRecord( windowRecord ) {
	const {
		x, y, width, height, maximized
	} = getProperties( windowRecord, "x", "y", "width", "height", "maximized" );

	if ( x !== null && y !== null ) {
		nwWindow.moveTo( x, y );
	}

	if ( width !== null && height !== null ) {
		nwWindow.resizeTo( width, height );
	}

	await new Promise( resolve => process.nextTick( resolve ) );

	if ( maximized ) {
		nwWindow.maximize();
	}
}

async function resetWindowIfOutOfBounds() {
	// validate window position and reset if it's invalid
	const visible = isWindowFullyVisible();
	if ( !visible ) {
		await reset();
	}
}


export default async function( application ) {
	const store = application.lookup( "service:store" );
	const windowRecord = await store.findOrCreateRecord( "window" );

	// restore the window before attaching event listeners
	await restoreWindowFromRecord( windowRecord );

	// listen for maximize and restore events
	nwWindow.on( "maximize", () => onMaximize( windowRecord, true ) );
	nwWindow.on(  "restore", () => onMaximize( windowRecord, false ) );

	// after these events, NW.js will trigger resizeTo or moveTo, so temporarily ignore those
	nwWindow.on( "maximize", ignoreEventListeners );
	nwWindow.on( "minimize", ignoreEventListeners );

	// resize and move events need to be debounced
	// the maximize events are triggered afterwards
	nwWindow.on( "resize", debounceEvent( windowRecord, onResize ) );
	nwWindow.on(   "move", debounceEvent( windowRecord, onMove ) );

	// listen for screen changes
	nwScreen.on( "displayBoundsChanged", () => resetWindowIfOutOfBounds( windowRecord ) );

	// validate restored window position and reset if it's invalid
	await resetWindowIfOutOfBounds( windowRecord );
}
