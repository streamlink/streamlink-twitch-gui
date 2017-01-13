import {
	get,
	inject,
	Component
} from "Ember";
import Menu from "nwjs/Menu";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/channel/ChannelPanelItemComponent.hbs";


const { service } = inject;


export default Component.extend({
	routing: service( "-routing" ),

	layout,

	tagName: "li",
	classNames: [ "channel-panel-item-component" ],

	didInsertElement() {
		let routing = get( this, "routing" );

		this.$( "a" )
			.addClass( "external-link" )
			.each(function() {
				this.setAttribute( "title", this.href );
			})
			.click(function( e ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				routing.openBrowserOrTransitionToChannel( this.href );
			});

		this._super( ...arguments );
	},

	contextMenu( event ) {
		var target = event.target;
		if ( target.tagName === "IMG" && target.classList.contains( "withLink" ) ) {
			return this.linkContentMenu( event, get( this, "panel.link" ) );
		}
		if ( target.tagName === "A" && target.classList.contains( "external-link" ) ) {
			return this.linkContentMenu( event, target.href );
		}
	},

	linkContentMenu( event, url ) {
		var menu = Menu.create();
		menu.items.pushObject({
			label: "Open in browser",
			click: () => openBrowser( url )
		});

		menu.popup( event );
	},

	actions: {
		openBrowser( url ) {
			get( this, "routing" ).openBrowserOrTransitionToChannel( url );
		}
	}
});
