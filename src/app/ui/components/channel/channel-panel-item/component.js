import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import EmbeddedHtmlLinksComponent from "ui/components/link/embedded-html-links/component";
import layout from "./template.hbs";
import "./styles.less";


export default EmbeddedHtmlLinksComponent.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),

	layout,

	tagName: "li",
	classNames: [ "channel-panel-item-component" ],

	contextMenu( event ) {
		const target = event.target;
		if ( target.tagName === "IMG" && target.classList.contains( "withLink" ) ) {
			return this.linkContentMenu( event, get( this, "panel.link" ) );
		}
		if ( target.tagName === "A" && target.classList.contains( "external-link" ) ) {
			return this.linkContentMenu( event, target.href );
		}
	},

	linkContentMenu( event, url ) {
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
	},

	actions: {
		openBrowser( url ) {
			this.router.openBrowserOrTransitionToChannel( url );
		}
	}
});
