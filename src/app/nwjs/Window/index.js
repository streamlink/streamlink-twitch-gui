import { Window } from "nwjs/nwGui";
import { manifest } from "nwjs/App";


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


let visible   = manifest.window.show;
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


export function getFocused() {
	return focused;
}

export function setFocused( focus ) {
	if ( focus ) {
		nwWindow.focus();
	} else {
		nwWindow.blur();
	}
}


export function getVisibility() {
	return visible;
}

export function setVisibility( show ) {
	if ( show && !visible ) {
		nwWindow.show();
	} else if ( !show && visible ) {
		nwWindow.hide();
	}
	// no onShow / onHide event callbacks
	visible = show;
}

export function toggleVisibility() {
	setVisibility( !visible );
}


export function getMaximized() {
	return maximized;
}

export function setMaximized( maximize ) {
	if ( maximize && !maximized ) {
		nwWindow.maximize();
	} else if ( !maximize && maximized ) {
		nwWindow.restore();
	}
}

export function toggleMaximized() {
	setMaximized( !maximized );
}


export function getMinimized() {
	return minimized;
}

export function setMinimized( minimize ) {
	if ( minimize && !minimized ) {
		nwWindow.minimize();
	} else if ( !minimize && minimized ) {
		nwWindow.restore();
	}
}

export function toggleMinimized() {
	setMinimized( !minimized );
}


export function setShowInTaskbar( show ) {
	nwWindow.setShowInTaskbar( show );
}


/** @type {Window} */
export const window = nwWindow.window;


export default nwWindow;
