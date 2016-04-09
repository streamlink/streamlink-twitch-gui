define([
	"nwjs/nwWindow",
	"nwjs/tray",
	"utils/node/platform",
	"json!root/metadata"
], function(
	nwWindow,
	tray,
	platform,
	metadata
) {

	function createTrayIcon() {
		var config = metadata.package.config;

		// apply a tray icon+menu to the main application window
		nwWindow.tray = tray.create({
			tooltip: config[ "display-name" ],
			icon   : platform.isDarwin
				? config[ "tray-icon-osx" ]
				: config[ "tray-icon" ],
			items  : [
				{
					label: "Toggle window",
					click: function() {
						nwWindow.tray.click();
					}
				},
				{
					label: "Close application",
					click: function() {
						nwWindow.close();
					}
				}
			]
		});

		// prevent tray icons from stacking up when refreshing the page or devtools
		nwWindow.on( "shutdown", nwWindow.tray.remove.bind( nwWindow.tray ) );
	}


	return {
		createTrayIcon: createTrayIcon
	};

});
