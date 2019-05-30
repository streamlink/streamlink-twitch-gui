import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),

	tagName: "a",
	classNameBindings: [
		":external-link-component",
		"channel::external-link"
	],
	attributeBindings: [
		"href",
		"title",
		"tabindex"
	],

	href: "#",
	tabindex: -1,

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
			this.router.transitionTo( "channel", channel );
		} else {
			this.nwjs.openBrowser( this.url );
		}
	},

	contextMenu( event ) {
		if ( get( this, "channel" ) ) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		const url = this.url;
		this.nwjs.contextMenu( event, [
			{
				label: [ "contextmenu.open-in-browser" ],
				click: () => this.nwjs.openBrowser( url )
			},
			{
				label: [ "contextmenu.copy-link-address" ],
				click: () => this.nwjs.clipboard.set( url )
			}
		]);
	}
});
