define( [ "nwGui", "nwWindow", "ember" ], function( nwGui, nwWindow, Ember ) {

	var get = Ember.get;
	var isOSX = process.platform === "darwin";

	return Ember.Object.extend({

		init: function( name, icon, iconOSX ) {
			this.setProperties({
				name: name,
				icon: icon,
				iconOSX: iconOSX,
				tray: null,
				menu: this._buildMenu()
			});
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
		}.property( "icon", "iconOSX" ),

		_buildTray: function() {
			var tray = new nwGui.Tray({
				icon   : get( this, "iconRes" ),
				tooltip: get( this, "name" )
			});
			tray.menu = get( this, "menu" );
			return tray;
		},

		_buildMenu: function() {
			var menu = new nwGui.Menu();

			menu.append( new nwGui.MenuItem({
				label: "Toggle visibility",
				click: function() {
					this.tray.emit( "click" );
				}.bind( this )
			}) );

			menu.append( new nwGui.MenuItem({
				label: "Close application",
				click: function() {
					nwWindow.close();
				}
			}) );

			return menu;
		}

	}).create();

});
