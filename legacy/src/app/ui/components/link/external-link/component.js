import Component from "@ember/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import getStreamFromUrl from "utils/getStreamFromUrl";
import t from "translation-key";


export default Component.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),

	tagName: "a",
	classNameBindings: [
		":external-link-component",
		"isInternal::external-link"
	],
	attributeBindings: [
		"href",
		"title",
		"tabindex"
	],

	href: "#",
	tabindex: -1,

	isInternal: computed( "url", "channel", function() {
		return !this.url || this.channel;
	}),

	channel: computed( "url", function() {
		return this.url && getStreamFromUrl( this.url );
	}),

	title: computed( "url", "channel", function() {
		return this.channel
			? null
			: this.url;
	}),

	click( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		if ( this.channel ) {
			this.router.transitionTo( "channel", this.channel );
		} else if ( this.url ) {
			this.nwjs.openBrowser( this.url );
		}
	},

	contextMenu( event ) {
		const { url } = this;
		if ( !url || this.channel ) { return; }

		event.preventDefault();
		event.stopImmediatePropagation();

		this.nwjs.contextMenu( event, [
			{
				label: [ t`contextmenu.open-in-browser` ],
				click: () => this.nwjs.openBrowser( url )
			},
			{
				label: [ t`contextmenu.copy-link-address` ],
				click: () => this.nwjs.clipboard.set( url )
			}
		]);
	}
});
