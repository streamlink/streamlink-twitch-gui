define([
	"Ember",
	"nwjs/menu",
	"nwjs/clipboard",
	"nwjs/openBrowser"
], function(
	Ember,
	Menu,
	clipboard,
	openBrowser
) {

	var get = Ember.get;
	var getOwner = Ember.getOwner;


	return Ember.Component.extend({
		tagName: "a",
		classNameBindings: [ ":external-link" ],
		attributeBindings: [ "href" ],

		href: "#",

		action: "openBrowser",

		click: function( event ) {
			event.preventDefault();
			event.stopImmediatePropagation();

			if ( event.button === 0 ) {
				this.openUrl();
			}
		},

		contextMenu: function( event ) {
			if ( this.attrs.noContextmenu ) { return; }

			var menu = Menu.create();

			menu.items.pushObjects([
				{
					label: "Open in browser",
					click: this.openUrlInBrowser.bind( this )
				},
				{
					label: "Copy URL",
					click: this.copyUrl.bind( this )
				}
			]);

			menu.popup( event );
		},

		openUrl: function() {
			var url = get( this, "url" );
			if ( !url ) { return; }
			var applicationRoute = getOwner( this ).lookup( "route:application" );
			applicationRoute.send( "openBrowser", url );
		},

		openUrlInBrowser: function() {
			var url = get( this, "url" );
			openBrowser( url );
		},

		copyUrl: function() {
			var url = get( this, "url" );
			clipboard.set( url );
		},

		didInsertElement: function() {
			this._super.apply( this, arguments );
			this.$().on( "click", function( e ) {
				if ( e.button !== 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) {
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			});
		}
	});

});
