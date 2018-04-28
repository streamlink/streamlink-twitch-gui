import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import EmbeddedHtmlLinksComponent from "ui/components/link/embedded-html-links/component";
import { openBrowser } from "nwjs/Shell";
import { set as setClipboard } from "nwjs/Clipboard";
import layout from "./template.hbs";
import "./styles.less";


export default EmbeddedHtmlLinksComponent.extend({
	nwjs: service(),
	routing: service( "-routing" ),

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
	},

	actions: {
		openBrowser( url ) {
			get( this, "routing" ).openBrowserOrTransitionToChannel( url );
		}
	}
});
