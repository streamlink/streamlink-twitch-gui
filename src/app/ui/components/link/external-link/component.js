import Component from "@ember/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { attribute, className, classNames, tagName } from "@ember-decorators/component";
import getStreamFromUrl from "utils/getStreamFromUrl";
import t from "translation-key";


@tagName( "a" )
@classNames( "external-link-component" )
export default class ExternalLinkComponent extends Component {
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {RouterService} */
	@service router;

	@attribute
	href = "#";
	@attribute
	tabindex = -1;

	@className( "", "external-link" )
	@computed( "url" )
	get channel() {
		return getStreamFromUrl( this.url );
	}

	@attribute
	@computed( "url", "channel" )
	get title() {
		return this.channel
			? null
			: this.url;
	}

	/**
	 * @param {MouseEvent} event
	 */
	click( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		if ( this.channel ) {
			this.router.transitionTo( "channel", this.channel );
		} else if ( this.url ) {
			this.nwjs.openBrowser( this.url );
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	contextMenu( event ) {
		if ( this.channel ) { return; }

		event.preventDefault();
		event.stopImmediatePropagation();

		const url = this.url;
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
}
