define([
	"Ember",
	"nwjs/menu",
	"nwjs/openBrowser",
	"hbs!templates/components/channel/ChannelPanelItemComponent"
], function(
	Ember,
	Menu,
	openBrowser,
	layout
) {

	var get = Ember.get;


	return Ember.Component.extend({
		layout: layout,
		tagName: "li",
		classNames: [ "channel-panel-item-component" ],

		openBrowser: "openBrowser",

		didInsertElement: function() {
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

		contextMenu: function( event ) {
			var target = event.target;
			if ( target.tagName === "IMG" && target.classList.contains( "withLink" ) ) {
				return this.linkContentMenu( event, get( this, "panel.link" ) );
			}
			if ( target.tagName === "A" && target.classList.contains( "external-link" ) ) {
				return this.linkContentMenu( event, target.href );
			}
		},

		linkContentMenu: function( event, url ) {
			var menu = Menu.create();
			menu.items.pushObject({
				label: "Open in browser",
				click: openBrowser.bind( null, url )
			});

			menu.popup( event );
		},

		actions: {
			"openBrowser": function( url ) {
				this.sendAction( "openBrowser", url );
			}
		}
	});

});
