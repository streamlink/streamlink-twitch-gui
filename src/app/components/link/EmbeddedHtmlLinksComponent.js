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
			.forEach( obj => {
				const { anchor, channel } = obj;
				const url = anchor.href;
				const $anchor = $( anchor );
				let click;

				// internal link
				if ( channel ) {
					click = () => routing.transitionTo( "channel", channel );

				// external link
				} else {
					click = () => openBrowser( url );
					$anchor
						.addClass( "external-link" )
						.prop( "title", url )
						.on( "mouseup mousedown click dblclick keyup keydown keypress", e => {
							e.preventDefault();
						})
						.on( "contextmenu", event => {
							event.preventDefault();
							event.stopImmediatePropagation();

							const menu = Menu.create();
							menu.items.pushObjects([
								{
									label: "Open in browser",
									click
								},
								{
									label: "Copy link address",
									click: () => setClipboard( url )
								}
							]);

							menu.popup( event );
						});
				}

				$anchor.mouseup( event => {
					event.preventDefault();
					event.stopImmediatePropagation();
					click( event );
				});
			});

		return this._super( ...arguments );
	}
});
