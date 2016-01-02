define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"nwjs/menu",
	"utils/platform",
	"json!root/metadata"
], function(
	Ember,
	nwGui,
	nwWindow,
	Menu,
	platform,
	metadata
) {

	var setProperties = Ember.setProperties;

	var Tray = nwGui.Tray;

	var isDarwin = platform.isDarwin;

	var config         = metadata.package.config;
	var displayName    = config[ "display-name" ];
	var trayIconImg    = config[ "tray-icon" ];
	var trayIconImgOSX = config[ "tray-icon-osx" ];

	function getScale() {
		var dpr = window.devicePixelRatio;
		return dpr > 2
			? "@3x"
			: dpr > 1
			? "@2x"
			: "";
	}


	return Ember.Object.extend({
		init: function() {
			var self = this;
			var menu = Menu.create({
				items: [
					{
						label: "Toggle window",
						click: function() {
							self.tray.emit( "click" );
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

			// https://github.com/nwjs/nw.js/issues/1870#issuecomment-94958663
			// reapply menu property, so NWjs updates it
			menu.on( "update", function() {
				if ( self.tray ) {
					self.tray.menu = menu.menu;
				}
			});

			setProperties( this, {
				tray: null,
				menu: menu
			});
		},


		remove: function() {
			if ( this.tray ) {
				this.tray.remove();
				this.tray = null;
			}
		},

		add: function( click ) {
			var icon = isDarwin
				? trayIconImgOSX
				: trayIconImg;

			var tray = new Tray({
				icon   : icon.replace( "{hidpi}", getScale() ),
				tooltip: displayName
			});
			tray.menu = this.menu.menu;
			tray.on( "click", click );

			this.tray = tray;
		}

	}).create();

});
