import TextField from "@ember/component/text-field";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { get as getClipboard, set as setClipboard } from "nwjs/Clipboard";


export default TextField.extend({
	nwjs: service(),

	attributeBindings: [ "autoselect:data-selectable" ],

	autoselect: false,

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const element = this.element;
		const start = element.selectionStart;
		const end = element.selectionEnd;

		const clip = getClipboard();
		const nwjs = get( this, "nwjs" );
		nwjs.contextMenu( event, [
			{
				label: [ "contextmenu.copy" ],
				enabled: start !== end,
				click() {
					const selected = element.value.substr( start, end - start );
					setClipboard( selected );
				}
			},
			{
				label: [ "contextmenu.paste" ],
				enabled: !element.readOnly && !element.disabled && clip && clip.length,
				click() {
					const value = element.value;
					const before = value.substr( 0, element.selectionStart );
					const after = value.substr( element.selectionEnd );

					element.value = `${before}${clip}${after}`;
					element.selectionStart = element.selectionEnd = before.length + clip.length;
				}
			}
		]);
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
