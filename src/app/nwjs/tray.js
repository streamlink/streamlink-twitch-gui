define( [ "nwGui", "nwWindow", "ember" ], function( nwGui, nwWindow, Ember ) {

	var get = Ember.get;

	return Ember.Object.extend({

		init: function( name, icon ) {
			this.setProperties({
				name: name,
				icon: icon,
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
			var res = process.platform !== "darwin" || dpr > 2
				? 48
				: dpr > 1
					? 32
					: 16;
			return get( this, "icon" ).replace( "{res}", res );
		}.property( "icon" ),

		_buildTray: function() {
			var tray = new nwGui.Tray({
				icon   : get( this, "iconRes" ),
				tooltip: get( this, "name" )
			});
			tray.menu = get( this, "menu" );
			tray.iconsAreTemplates = false;
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
