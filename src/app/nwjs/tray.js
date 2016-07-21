define([
	"Ember",
	"nwjs/nwGui",
	"nwjs/menu"
], function(
	Ember,
	nwGui,
	Menu
) {

	var get = Ember.get;
	var setProperties = Ember.setProperties;

	var Tray = nwGui.Tray;

	function getScale() {
		var dpr = window.devicePixelRatio;
		return dpr > 2
			? "@3x"
			: dpr > 1
			? "@2x"
			: "";
	}


	return Ember.Object.extend({
		tooltip: null,
		icon   : null,
		items  : null,
		menu   : null,
		tray   : null,

		init: function() {
			var self = this;
			var menu = Menu.create({
				items: this.items || []
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
			if ( !this.tray ) { return; }
			this.tray.remove();
			this.tray = null;
		},

		add: function( click ) {
			this.remove();

			var icon    = get( this, "icon" ).replace( "{hidpi}", getScale() );
			var tooltip = get( this, "tooltip" );

			var tray = new Tray({
				icon   : icon,
				tooltip: tooltip
			});
			tray.menu = this.menu.menu;
			tray.on( "click", click );

			this.tray = tray;
		},

		click: function() {
			if ( !this.tray ) { return; }
			this.tray.emit( "click" );
		},

		removeOnClick: function() {
			if ( !this.tray ) { return; }
			this.tray.once( "click", this.remove.bind( this ) );
		}
	});

});
