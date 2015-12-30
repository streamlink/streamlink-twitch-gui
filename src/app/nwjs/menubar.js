define([
	"nwjs/nwWindow",
	"nwjs/menu"
], function(
	nwWindow,
	Menu
) {

	var macNativeMenuBar;

	function createMacNativeMenuBar( appname ) {
		if ( macNativeMenuBar ) { return; }
		macNativeMenuBar = Menu.create({ type: "menubar" });
		macNativeMenuBar.createMacBuiltin( appname );
		nwWindow.menu = macNativeMenuBar.menu;
	}


	return {
		createMacNativeMenuBar: createMacNativeMenuBar
	};

});
