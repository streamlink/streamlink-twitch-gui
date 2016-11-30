import {
	get,
	inject,
	Component
} from "Ember";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";


const { service } = inject;


export default Component.extend({
	routing: service( "-routing" ),

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
		let url = get( this, "url" );
		get( this, "routing" ).openBrowserOrTransitionToChannel( url );
	},

	openUrlInBrowser() {
		let url = get( this, "url" );
		openBrowser( url );
	},

	copyUrl() {
		let url = get( this, "url" );
		setClipboard( url );
	},

	didInsertElement() {
		this._super( ...arguments );
		this.$().on( "click", function( e ) {
			if ( e.button !== 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		});
	}
});
