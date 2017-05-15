import {
	get,
	computed,
	inject,
	Component
} from "ember";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { service } = inject;


export default Component.extend({
	routing: service( "-routing" ),

	tagName: "a",
	classNameBindings: [
		":external-link-component",
		"channel::external-link"
	],
	attributeBindings: [
		"href",
		"title"
	],

	href: "#",

	channel: computed( "url", function() {
		const url = get( this, "url" );
		return getStreamFromUrl( url );
	}),

	title: computed( "url", "channel", function() {
		return get( this, "channel" )
			? null
			: get( this, "url" );
	}),

	click( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const routingService = get( this, "routing" );
		const channel = get( this, "channel" );
		if ( channel ) {
			routingService.transitionTo( "channel", channel );
		} else {
			const url = get( this, "url" );
			openBrowser( url );
		}
	},

	contextMenu( event ) {
		if ( get( this, "channel" ) ) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		const menu = Menu.create();
		const url = get( this, "url" );

		menu.items.pushObjects([
			{
				label: "Open in browser",
				click: () => openBrowser( url )
			},
			{
				label: "Copy link address",
				click: () => setClipboard( url )
			}
		]);

		menu.popup( event );
	}
});
