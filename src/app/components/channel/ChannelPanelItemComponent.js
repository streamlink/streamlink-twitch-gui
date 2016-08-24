import {
	get,
	Component
} from "Ember";
import Menu from "nwjs/menu";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/channel/ChannelPanelItemComponent.hbs";


export default Component.extend({
	layout,

	tagName: "li",
	classNames: [ "channel-panel-item-component" ],

	openBrowser: "openBrowser",

	didInsertElement() {
		var self = this;

		this.$( "a" )
			.addClass( "external-link" )
			.each(function() {
				this.setAttribute( "title", this.href );
			})
			.click(function( e ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				self.send( "openBrowser", this.href );
			});

		this._super.apply( this, arguments );
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
			click: openBrowser.bind( null, url )
		});

		menu.popup( event );
	},

	actions: {
		openBrowser( url ) {
			if ( !url ) { return; }
			this.sendAction( "openBrowser", url );
		}
	}
});
