import Component from "@ember/component";
import { inject as service } from "@ember/service";
import getStreamFromUrl from "utils/getStreamFromUrl";


const DISABLED_EVENTS = "mousedown mouseup keyup keydown keypress".split( " " );


export default Component.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),

	didInsertElement() {
		/** @type {HTMLAnchorElement[]} */
		const anchors = Array.from( this.element.querySelectorAll( "a" ) );
		for ( const anchor of anchors ) {
			const url = anchor.href;
			const channel = getStreamFromUrl( url );

			for ( const eventName of DISABLED_EVENTS ) {
				anchor.addEventListener( eventName, event => {
					event.preventDefault();
					event.stopImmediatePropagation();
				});
			}

			anchor.addEventListener( "click", /** @type {MouseEvent} */ event => {
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

				anchor.addEventListener( "contextmenu", /** @type {MouseEvent} */ event => {
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
		}

		return this._super( ...arguments );
	}
});
