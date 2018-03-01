import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	i18n: service(),
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

		const channel = get( this, "channel" );
		if ( channel ) {
			const routingService = get( this, "routing" );
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
		const i18n = get( this, "i18n" );

		menu.items.pushObjects([
			{
				label: i18n.t( "contextmenu.open-in-browser" ).toString(),
				click: () => openBrowser( url )
			},
			{
				label: i18n.t( "contextmenu.copy-link-address" ).toString(),
				click: () => setClipboard( url )
			}
		]);

		menu.popup( event );
	}
});
