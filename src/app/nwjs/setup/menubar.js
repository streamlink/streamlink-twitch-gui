define([
	"nwjs/nwWindow",
	"nwjs/menu",
	"utils/node/platform",
	"json!root/metadata"
], function(
	nwWindow,
	Menu,
	platform,
	metadata
) {

	var isDarwin = platform.isDarwin;

	var displayName = metadata.package.config[ "display-name" ];

	function createNativeMenuBarDarwin() {
		var menubar = Menu.create({ type: "menubar" });
		menubar.createMacBuiltin( displayName );
		return menubar.menu;
	}


	return {
		createNativeMenuBar: function() {
			if ( !isDarwin ) { return; }

			nwWindow.menu = createNativeMenuBarDarwin();
		}
	};

});
