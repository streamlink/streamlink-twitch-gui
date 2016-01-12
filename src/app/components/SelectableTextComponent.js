define([
	"Ember",
	"nwjs/menu",
	"nwjs/clipboard"
], function(
	Ember,
	Menu,
	clipboard
) {

	return Ember.Component.extend({
		tagName: "div",

		classNameBindings: [ "class" ],
		attributeBindings: [ "selectable:data-selectable" ],

		"class"   : "",
		selectable: true,

		contextMenu: function( event ) {
			if ( this.attrs.noContextmenu ) { return; }

			var selection = window.getSelection();
			var selected  = selection.toString();

			var menu = Menu.create();
			menu.items.pushObject({
				label  : "Copy selection",
				enabled: selected.length,
				click  : function() {
					clipboard.set( selected );
				}
			});

			menu.popup( event.originalEvent.x, event.originalEvent.y );
		}
	});

});
