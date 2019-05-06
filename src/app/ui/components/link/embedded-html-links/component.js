import Component from "@ember/component";
import { inject as service } from "@ember/service";
import $ from "jquery";
import getStreamFromUrl from "utils/getStreamFromUrl";


export default Component.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),

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
						this.router.transitionTo( "channel", channel );
					} else {
						this.nwjs.openBrowser( url );
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
				});
			}
		});

		return this._super( ...arguments );
	}
});
