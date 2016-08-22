import Ember from "Ember";
import Menu from "nwjs/menu";
import clipboard from "nwjs/clipboard";


	export default Ember.TextField.extend({
		attributeBindings: [ "autoselect:data-selectable" ],

		autoselect: false,

		contextMenu: function( event ) {
			if ( this.attrs.noContextmenu ) { return; }

			var element = this.element;
			var start   = element.selectionStart;
			var end     = element.selectionEnd;

			var clip    = clipboard.get();

			var menu = Menu.create();

			menu.items.pushObjects([
				{
					label  : "Copy",
					enabled: start !== end,
					click  : function() {
						var selected = element.value.substr( start, end - start );
						clipboard.set( selected );
					}
				},
				{
					label  : "Paste",
					enabled: !element.readOnly && !element.disabled && clip && clip.length,
					click  : function() {
						var value  = element.value;
						var before = value.substr( 0, element.selectionStart );
						var after  = value.substr( element.selectionEnd );

						element.value = before + clip + after;
						element.selectionStart = element.selectionEnd = before.length + clip.length;
					}
				}
			]);

			menu.popup( event );
		},

		focusIn: function() {
			if ( !this.attrs.autofocus || !this.attrs.autoselect ) { return; }

			this.element.setSelectionRange( 0, this.element.value.length );
		}
	});
