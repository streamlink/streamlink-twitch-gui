import {
	get,
	inject,
	$,
	Component
} from "Ember";
import { set as setClipboard } from "nwjs/Clipboard";
import Menu from "nwjs/Menu";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


const { service } = inject;


export default Component.extend({
	routing: service( "-routing" ),
	store: service(),

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
					click = () => get( this, "store" )
						.findRecord( "twitchUser", channel.toLowerCase() )
						.then( user => get( user, "channel" ) )
						.then( channel => routing.transitionTo( "channel", get( channel, "id" ) ) );

				// external link
				} else {
					click = () => openBrowser( url );
					$anchor
						.addClass( "external-link" )
						.prop( "title", url )
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
									label: "Copy address",
									click: () => setClipboard( url )
								}
							]);

							menu.popup( event );
						});
				}

				$anchor.click( event => {
					event.preventDefault();
					event.stopImmediatePropagation();
					click( event );
				});
			});

		this._super( ...arguments );
	}
});
