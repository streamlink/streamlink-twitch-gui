import {
	get,
	inject
} from "ember";
import EmbeddedHtmlLinksComponent from "components/link/EmbeddedHtmlLinksComponent";
import Menu from "nwjs/Menu";
import { openBrowser } from "nwjs/Shell";
import { set as setClipboard } from "nwjs/Clipboard";
import layout from "templates/components/channel/ChannelPanelItemComponent.hbs";


const { service } = inject;


export default EmbeddedHtmlLinksComponent.extend({
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
	},

	actions: {
		openBrowser( url ) {
			get( this, "routing" ).openBrowserOrTransitionToChannel( url );
		}
	}
});
