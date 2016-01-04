define([
	"Ember",
	"nwjs/menu",
	"nwjs/clipboard"
], function(
	Ember,
	Menu,
	clipboard
) {

	var get = Ember.get;

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
				this.openURL();
			}
		},

		contextMenu: function( event ) {
			if ( this.attrs.noContextmenu ) { return; }

			var menu = Menu.create();

			menu.items.pushObjects([
				{
					label: "Open URL",
					click: this.openURL.bind( this )
				},
				{
					label: "Copy URL",
					click: this.copyURL.bind( this )
				}
			]);

			menu.popup( event.originalEvent.x, event.originalEvent.y );
		},

		openURL: function() {
			var url = get( this, "url" );
			this.sendAction( "action", url );
		},

		copyURL: function() {
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
