import { get } from "@ember/object";
import { translationMacro as t } from "ember-i18n/addon";
import { set as setClipboard } from "nwjs/Clipboard";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	classNames: [ "btn-info" ],
	icon: "fa-share-alt",
	_title: t( "components.share-channel.title" ),
	iconanim: true,

	hotkeys: [
		{
			code: "KeyU",
			action() {
				this.click();
			}
		}
	],

	action() {
		const url = get( this, "channel.url" );

		return setClipboard( url );
	}
});
