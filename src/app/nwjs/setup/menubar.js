define([
	"config",
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"nwjs/menu",
	"utils/node/platform"
], function(
	config,
	nwGui,
	nwWindow,
	Menu,
	platform
) {

	var MenuItem = nwGui.MenuItem;
	var isDarwin = platform.isDarwin;

	var displayName = config.main[ "display-name" ];


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

		// Add a refresh menu item to the view menubar submenu
		var viewMenu = menubar.items[ 2 ].submenu;
		var refresh = new MenuItem({
			type: "normal",
			label: "Refresh",
			key: "r",
			modifiers: "cmd"
		});
		refresh.click = controller.send.bind( controller, "refresh" );
		viewMenu.insert( refresh, 0 );

		return menubar;
	}


	return {
		createNativeMenuBar: function( controller ) {
			if ( !isDarwin ) { return; }

			nwWindow.menu = createNativeMenuBarDarwin( controller );
		}
	};

});
