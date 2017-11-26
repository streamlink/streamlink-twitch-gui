import {
	get,
	inject,
	$,
	Component
} from "ember";
import { set as setClipboard } from "nwjs/Clipboard";
import Menu from "nwjs/Menu";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { service } = inject;


export default Component.extend({
	routing: service( "-routing" ),

	didInsertElement() {
		const routing = get( this, "routing" );

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
								label: "Open in browser",
								click: () => openBrowser( url )
							},
							{
								label: "Copy link address",
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
