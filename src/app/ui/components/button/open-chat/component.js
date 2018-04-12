import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	chat: service(),

	classNames: [ "btn-hint" ],
	icon: "fa-comments",
	_title: t( "components.open-chat.title" ),
	iconanim: true,

	hotkeys: [
		{
			code: "KeyC",
			action() {
				this.click();
			}
		}
	],

	action() {
		const channel = get( this, "channel" );
		const chat = get( this, "chat" );

		return chat.openChat( channel );
	}
});
