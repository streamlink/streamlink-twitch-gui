import {
	get,
	setProperties,
	computed,
	EmberObject
} from "Ember";
import { Tray } from "nwjs/nwGui";
import Menu from "nwjs/menu";


function getScale() {
	var dpr = window.devicePixelRatio;
	return dpr > 2
		? "@3x"
		: dpr > 1
		? "@2x"
		: "@1x";
}


export default EmberObject.extend({
	tooltip: null,
	icons  : null,
	items  : null,
	menu   : null,
	tray   : null,

	init() {
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
			menu
		});
	},


	icon: computed( "icons", function() {
		var icons = get( this, "icons" );
		return icons[ getScale() ];
	}),


	remove() {
		if ( !this.tray ) { return; }
		this.tray.remove();
		this.tray = null;
	},

	add( click ) {
		this.remove();

		var icon    = get( this, "icon" );
		var tooltip = get( this, "tooltip" );

		var tray = new Tray({
			icon,
			tooltip
		});
		tray.menu = this.menu.menu;
		tray.on( "click", click );

		this.tray = tray;
	},

	click() {
		if ( !this.tray ) { return; }
		this.tray.emit( "click" );
	},

	removeOnClick() {
		if ( !this.tray ) { return; }
		this.tray.once( "click", this.remove.bind( this ) );
	}
});
