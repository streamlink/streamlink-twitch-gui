define([
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"nwjs/menu",
	"utils/node/platform",
	"json!root/metadata"
], function(
	nwGui,
	nwWindow,
	Menu,
	platform,
	metadata
) {

	var MenuItem = nwGui.MenuItem;
	var isDarwin = platform.isDarwin;

	var displayName = metadata.package.config[ "display-name" ];


	function createNativeMenuBarDarwin( controller ) {
		var menubar = Menu.create({ type: "menubar" });
		menubar.createMacBuiltin( displayName );
		menubar = menubar.menu;

		// Add a preferences menu item to the main menubar submenu
		var mainMenu = menubar.items[ 0 ].submenu;
		mainMenu.insert( new MenuItem({ type: "separator" }), 1 );
		var preferences = new MenuItem({
			type: "normal",
			label: "Preferences",
			key: ",",
			modifier: "cmd"
		});
		preferences.click = controller.send.bind( controller, "goto", "settings" );
		mainMenu.insert( preferences, 2 );

		return menubar;
	}


	return {
		createNativeMenuBar: function( controller ) {
			if ( !isDarwin ) { return; }

			nwWindow.menu = createNativeMenuBarDarwin( controller );
		}
	};

});
