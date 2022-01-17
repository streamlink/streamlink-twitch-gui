import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { twitch as twitchConfig } from "config";
import "./styles.less";


const { "channel-url": channelUrl } = twitchConfig;


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),

	/** @type {TwitchUser} */
	user: null,

	classNames: [ "channel-button-component", "btn-primary" ],
	icon: "fa-twitch",
	iconanim: true,

	_title: computed( "intl.locale", "user.display_name", function() {
		const { display_name: name } = this.user;

		return this.intl.t( "components.channel-button.title", { name } );
	}),

	hotkeysNamespace: "followbutton",
	hotkeys: {
		default() {
			this.click();
		}
	},

	async action( success, failure ) {
		try {
			this.nwjs.openBrowser( channelUrl, { channel: this.user.login } );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
