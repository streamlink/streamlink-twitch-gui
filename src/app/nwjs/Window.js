import { Window } from "nwjs/nwGui";


// get the main application window
const nwWindow = Window.get();
nwWindow.removeAllListeners();


let hidden    = true;
let focused   = true;
let maximized = false;
let minimized = false;

nwWindow.on( "focus",      function onFocus()      { focused   = true;  } );
nwWindow.on( "blur",       function onBlur()       { focused   = false; } );
nwWindow.on( "maximize",   function onMaximize()   { maximized = true;  } );
nwWindow.on( "unmaximize", function onUnmaximize() { maximized = false; } );
nwWindow.on( "minimize",   function onMinimize()   { minimized = true;  } );
nwWindow.on( "restore",    function onRestore()    { minimized = false; } );


export function toggleVisibility( bool ) {
	if ( bool === undefined ) { bool = hidden; }
	nwWindow[ bool ? "show" : "hide" ]();
	hidden = !bool;
}

export function toggleMaximize( bool ) {
	if ( bool === undefined ) { bool = maximized; }
	nwWindow[ bool ? "unmaximize" : "maximize" ]();
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
