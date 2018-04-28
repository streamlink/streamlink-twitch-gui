import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	nwjs: service(),
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

		const url = get( this, "url" );
		const nwjs = get( this, "nwjs" );

		nwjs.contextMenu( event, [
			{
				label: [ "contextmenu.open-in-browser" ],
				click: () => openBrowser( url )
			},
			{
				label: [ "contextmenu.copy-link-address" ],
				click: () => setClipboard( url )
			}
		]);
	}
});
