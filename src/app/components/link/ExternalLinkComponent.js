import {
	get,
	getOwner,
	Component
} from "Ember";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";


export default Component.extend({
	tagName: "a",
	classNameBindings: [ ":external-link" ],
	attributeBindings: [ "href" ],

	href: "#",

	action: "openBrowser",

	click( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		if ( event.button === 0 ) {
			this.openUrl();
		}
	},

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		var menu = Menu.create();

		menu.items.pushObjects([
			{
				label: "Open in browser",
				click: this.openUrlInBrowser.bind( this )
			},
			{
				label: "Copy URL",
				click: this.copyUrl.bind( this )
			}
		]);

		menu.popup( event );
	},

	openUrl() {
		var url = get( this, "url" );
		if ( !url ) { return; }
		var applicationRoute = getOwner( this ).lookup( "route:application" );
		applicationRoute.send( "openBrowser", url );
	},

	openUrlInBrowser() {
		var url = get( this, "url" );
		openBrowser( url );
	},

	copyUrl() {
		var url = get( this, "url" );
		setClipboard( url );
	},

	didInsertElement() {
		this._super.apply( this, arguments );
		this.$().on( "click", function( e ) {
			if ( e.button !== 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		});
	}
});
