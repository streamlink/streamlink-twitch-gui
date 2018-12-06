import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import $ from "jquery";
import { set as setClipboard } from "nwjs/Clipboard";
import { openBrowser } from "nwjs/Shell";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	nwjs: service(),
	routing: service( "-routing" ),

	didInsertElement() {
		/** @type {HTMLAnchorElement[]} */
		const anchors = Array.from( this.element.querySelectorAll( "a" ) );
		anchors.forEach( anchor => {
			const $anchor = $( anchor );
			const url = anchor.href;
			const channel = getStreamFromUrl( url );

			$anchor.on( "mousedown mouseup keyup keydown keypress", event => {
				event.preventDefault();
				event.stopImmediatePropagation();
			});

			$anchor.on( "click", event => {
				event.preventDefault();
				event.stopImmediatePropagation();
				if ( event.button === 0 || event.button === 1 ) {
					if ( channel ) {
						const routing = get( this, "routing" );
						routing.transitionTo( "channel", channel );
					} else {
						openBrowser( url );
					}
				}
			});

			// external link
			if ( !channel ) {
				anchor.classList.add( "external-link" );
				anchor.title = url;

				$anchor.on( "contextmenu", event => {
					event.preventDefault();
					event.stopImmediatePropagation();

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
				});
			}
		});

		return this._super( ...arguments );
	}
});
