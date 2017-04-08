import { TextField } from "Ember";
import Menu from "nwjs/Menu";
import {
	get as getClipboard,
	set as setClipboard
} from "nwjs/Clipboard";


export default TextField.extend({
	attributeBindings: [ "autoselect:data-selectable" ],

	autoselect: false,

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const element = this.element;
		const start = element.selectionStart;
		const end = element.selectionEnd;

		const clip = getClipboard();

		const menu = Menu.create();

		menu.items.pushObjects([
			{
				label  : "Copy",
				enabled: start !== end,
				click() {
					const selected = element.value.substr( start, end - start );
					setClipboard( selected );
				}
			},
			{
				label  : "Paste",
				enabled: !element.readOnly && !element.disabled && clip && clip.length,
				click() {
					const value = element.value;
					const before = value.substr( 0, element.selectionStart );
					const after = value.substr( element.selectionEnd );

					element.value = before + clip + after;
					element.selectionStart = element.selectionEnd = before.length + clip.length;
				}
			}
		]);

		menu.popup( event );
	},

	focusIn() {
		if ( !this.attrs.autofocus || !this.attrs.autoselect ) { return; }

		this.element.setSelectionRange( 0, this.element.value.length );
	},

	keyDown( event ) {
		if ( event.originalEvent.code === "Escape" ) {
			this.$().trigger( "blur" );
			return;
		}

		return this._super( ...arguments );
	}
});
