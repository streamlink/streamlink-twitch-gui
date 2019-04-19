import TextField from "@ember/component/text-field";
import { inject as service } from "@ember/service";
import { attribute } from "@ember-decorators/component";
import t from "translation-key";


export default class TextFieldComponent extends TextField {
	/** @type {NwjsService} */
	@service nwjs;

	@attribute( "data-selectable" )
	autoselect = false;

	autofocus = false;
	noContextmenu = false;

	contextMenu( event ) {
		if ( this.noContextmenu ) { return; }

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
					const selected = element.value.substr( start, end - start );
					nwjs.clipboard.set( selected );
				}
			},
			{
				label: [ t`contextmenu.paste` ],
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
	}

	focusIn() {
		if ( !this.autofocus || !this.autoselect ) { return; }

		this.element.setSelectionRange( 0, this.element.value.length );
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		if ( event.key === "Escape" ) {
			this.element.blur();
			return;
		}

		return super.keyDown( ...arguments );
	}
}
