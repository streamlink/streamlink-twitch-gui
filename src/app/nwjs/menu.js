define( [ "nwGui", "nwWindow" ], function( nwGui, nwWindow ) {

	var macNativeMenuBar;

	function createMacNativeMenuBar( appname ) {
		if ( macNativeMenuBar ) { return; }
		macNativeMenuBar = new nwGui.Menu({ type: "menubar" });
		macNativeMenuBar.createMacBuiltin( appname, {
			hideEdit  : false,
			hideWindow: false
		});
		nwWindow.menu = macNativeMenuBar;
	}


	return {
		createMacNativeMenuBar: createMacNativeMenuBar
	};

});
