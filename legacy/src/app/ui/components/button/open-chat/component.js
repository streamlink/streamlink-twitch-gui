import { inject as service } from "@ember/service";
import { t } from "ember-intl";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {ChatService} */
	chat: service(),

	/** @type {TwitchUser} */
	user: null,

	classNames: [ "open-chat-component", "btn-hint" ],
	icon: "fa-comments",
	_title: t( "components.open-chat.title" ),
	iconanim: true,

	hotkeysNamespace: "openchatbutton",
	hotkeys: {
		default() {
			this.click();
		}
	},

	action() {
		return this.chat.openChat( this.user.login );
	}
});
