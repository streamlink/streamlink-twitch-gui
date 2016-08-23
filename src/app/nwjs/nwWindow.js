import { Window } from "nwjs/nwGui";


// get the main application window
const nwWindow = Window.get();
nwWindow.removeAllListeners();

nwWindow.window.addEventListener( "beforeunload", function() {
	nwWindow.emit( "shutdown" );
}, false );


var isHidden    = true;
var isMaximized = false;
var isMinimized = false;
var isFocused   = true;

nwWindow.on( "maximize",   function onMaximize()   { isMaximized = true;  } );
nwWindow.on( "unmaximize", function onUnmaximize() { isMaximized = false; } );
nwWindow.on( "minimize",   function onMinimize()   { isMinimized = true;  } );
nwWindow.on( "restore",    function onRestore()    { isMinimized = false; } );
nwWindow.on( "focus",      function onFocus()      { isFocused   = true;  } );
nwWindow.on( "blur",       function onBlur()       { isFocused   = false; } );

nwWindow.toggleMaximize = function toggleMaximize( bool ) {
	if ( bool === undefined ) { bool = isMaximized; }
	nwWindow[ bool ? "unmaximize" : "maximize" ]();
};

nwWindow.toggleMinimize = function toggleMinimize( bool ) {
	if ( bool === undefined ) { bool = isMinimized; }
	nwWindow[ bool ? "restore" : "minimize" ]();
};

nwWindow.toggleVisibility = function toggleVisibility( bool ) {
	if ( bool === undefined ) { bool = isHidden; }
	nwWindow[ bool ? "show" : "hide" ]();
	isHidden = !bool;
};

nwWindow.setShowInTray = function setShowInTray( bool, taskbar ) {
	// always remove the tray icon...
	// we need a new click event listener in case the taskbar param has changed
	nwWindow.tray.remove();
	if ( bool ) {
		nwWindow.tray.add(function() {
			nwWindow.toggleVisibility();
			// also toggle taskbar visiblity on click (gui_integration === both)
			if ( taskbar ) {
				nwWindow.setShowInTaskbar( !isHidden );
			}
		});
	}
};

nwWindow.isFocused = function() {
	return isFocused;
};


export default nwWindow;
