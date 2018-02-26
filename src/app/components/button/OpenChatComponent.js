import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import FormButtonComponent from "./FormButtonComponent";
import HotkeyMixin from "../mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	chat: service(),

	classNames: [ "btn-hint" ],
	icon: "fa-comments",
	title: "Open chat",
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
