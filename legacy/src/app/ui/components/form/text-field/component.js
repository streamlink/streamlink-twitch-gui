import TextField from "@ember/component/text-field";
import { inject as service } from "@ember/service";
import t from "translation-key";


export default TextField.extend({
	/** @type {NwjsService} */
	nwjs: service(),

	attributeBindings: [ "autoselect:data-selectable" ],

	autoselect: false,

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const element = this.element;
		const start = element.selectionStart;
		const end = element.selectionEnd;

		const nwjs = this.nwjs;
		const clip = nwjs.clipboard.get();
		nwjs.contextMenu( event, [
			{
				label: [ t`contextmenu.copy` ],
				enabled: start !== end,
				click() {
					const selected = element.value.slice( start, end);
					nwjs.clipboard.set( selected );
				}
			},
			{
				label: [ t`contextmenu.paste` ],
				enabled: !element.readOnly && !element.disabled && clip && clip.length,
				click() {
					const value = element.value;
					const before = value.slice( 0, element.selectionStart );
					const after = value.slice( element.selectionEnd );

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

	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		if ( event.key === "Escape" ) {
			this.element.blur();
			return;
		}

		return this._super( ...arguments );
	}
});
