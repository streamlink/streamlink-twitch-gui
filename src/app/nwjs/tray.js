define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/nwWindow",
	"nwjs/menu"
], function(
	Ember,
	nwGui,
	nwWindow,
	Menu
) {

	var get = Ember.get;
	var isOSX = process.platform === "darwin";

	var Tray = nwGui.Tray;


	return Ember.Object.extend({
		init: function( name, icon, iconOSX ) {
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

			this.setProperties({
				name   : name,
				icon   : icon,
				iconOSX: iconOSX,
				tray   : null,
				menu   : menu
			});
		},

		_buildTray: function() {
			var tray = new Tray({
				icon   : get( this, "iconRes" ),
				tooltip: get( this, "name" )
			});
			tray.menu = this.menu.menu;
			return tray;
		},


		remove: function() {
			if ( this.tray ) {
				this.tray.remove();
				this.tray = null;
			}
		},

		add: function( click ) {
			this.tray = this._buildTray();
			this.tray.on( "click", click );
		},

		iconRes: function() {
			var dpr = window.devicePixelRatio;

			if ( isOSX ) {
				var hidpi = dpr > 2
					? "@3x"
					: dpr > 1
						? "@2x"
						: "";

				return get( this, "iconOSX" )
					.replace( "{res}", 18 )
					.replace( "{hidpi}", hidpi );

			} else {
				var res = dpr > 2
					? 48
					: dpr > 1
						? 32
						: 16;

				return get( this, "icon" )
					.replace( "{res}", res );
			}
		}.property( "icon", "iconOSX" )

	}).create();

});
