import { get } from "@ember/object";
import { set as setClipboard } from "nwjs/Clipboard";
import FormButtonComponent from "./FormButtonComponent";
import HotkeyMixin from "../mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	classNames: [ "btn-info" ],
	icon: "fa-share-alt",
	title: "Copy channel url to clipboard",
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
