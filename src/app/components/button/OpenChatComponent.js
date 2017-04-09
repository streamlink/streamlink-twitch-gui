import {
	get,
	inject
} from "ember";
import FormButtonComponent from "components/button/FormButtonComponent";
import HotkeyMixin from "mixins/HotkeyMixin";


const { service } = inject;


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
		const chat    = get( this, "chat" );

		return chat.open( channel );
	}
});
