import { Window } from "nwjs/nwGui";


// get the main application window
const nwWindow = Window.get();
nwWindow.removeAllListeners();


// don't open new windows
nwWindow.on( "new-win-policy", ( frame, url, policy ) => {
	policy.ignore();
});
nwWindow.on( "navigation", ( frame, url, policy ) => {
	policy.ignore();
});


let hidden    = true;
let focused   = true;
let maximized = false;
let minimized = false;

nwWindow.on( "focus", () => focused = true );
nwWindow.on( "blur",  () => focused = false );
nwWindow.on( "maximize", () => maximized = true );
nwWindow.on( "minimize", () => minimized = true );
// called when unmaximizing or restoring from minimized state
nwWindow.on( "restore", () => {
	if ( minimized ) {
		minimized = false;
	} else {
		maximized = false;
	}
});


export function toggleVisibility( bool ) {
	if ( bool === undefined ) { bool = hidden; }
	nwWindow[ bool ? "show" : "hide" ]();
	hidden = !bool;
}

export function toggleMaximize( bool ) {
	if ( bool === undefined ) { bool = maximized; }
	nwWindow[ bool ? "restore" : "maximize" ]();
}

export function toggleMinimize( bool ) {
	if ( bool === undefined ) { bool = minimized; }
	nwWindow[ bool ? "restore" : "minimize" ]();
}

export function setShowInTaskbar( bool ) {
	nwWindow.setShowInTaskbar( bool );
}

export function isHidden() {
	return hidden;
}

export function isFocused() {
	return focused;
}

export function isMaximized() {
	return maximized;
}

export function isMinimized() {
	return minimized;
}


export default nwWindow;
