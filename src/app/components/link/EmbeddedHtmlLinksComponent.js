import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import $ from "jquery";
import { set as setClipboard } from "nwjs/Clipboard";
import Menu from "nwjs/Menu";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	i18n: service(),
	routing: service( "-routing" ),

	didInsertElement() {
		const i18n = get( this, "i18n" );
		const routing = get( this, "routing" );

		const labelOpenInBrowser = i18n.t( "contextmenu.open-in-browser" ).toString();
		const labelCopyLinkAddress = i18n.t( "contextmenu.copy-link-address" ).toString();

		[ ...this.element.querySelectorAll( "a" ) ]
			.map( anchor => ({
				anchor,
				channel: getStreamFromUrl( anchor.href )
			}) )
			.forEach( ({ anchor, channel }) => {
				const url = anchor.href;
				const $anchor = $( anchor );

				// channel link
				if ( channel ) {
					$anchor.mouseup( event => {
						// left click
						if ( event.button !== 0 ) { return; }
						event.preventDefault();
						event.stopImmediatePropagation();
						routing.transitionTo( "channel", channel );
					});
					return;
				}

				// external link
				$anchor
					.addClass( "external-link" )
					.prop( "title", url )
					.on( "mousedown click dblclick keyup keydown keypress", event => {
						event.preventDefault();
					})
					.on( "contextmenu", event => {
						event.preventDefault();
						event.stopImmediatePropagation();

						const menu = Menu.create();
						menu.items.pushObjects([
							{
								label: labelOpenInBrowser,
								click: () => openBrowser( url )
							},
							{
								label: labelCopyLinkAddress,
								click: () => setClipboard( url )
							}
						]);

						menu.popup( event );
					})
					.mouseup( event => {
						// left or middle click
						if ( event.button !== 0 && event.button !== 1 ) { return; }
						event.preventDefault();
						event.stopImmediatePropagation();
						openBrowser( url );
					});
			});

		return this._super( ...arguments );
	}
});
