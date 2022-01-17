import { and, or } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { t } from "ember-intl";
import { twitch as twitchConfig } from "config";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


const { "emotes-url": twitchEmotesUrl } = twitchConfig;


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {SettingsService} */
	settings: service(),

	/** @type {TwitchUser} */
	user: null,
	/** @type {boolean} */
	showButton: false,

	isEnabled: or( "showButton", "settings.content.streams.twitchemotes" ),
	isVisible: and( "isEnabled", "user.isPartner" ),

	classNames: [ "twitch-emotes-component", "btn-neutral" ],
	icon: "fa-smile-o",
	iconanim: true,
	_title: t( "components.twitch-emotes.title" ),

	hotkeysNamespace: "twitchemotesbutton",
	hotkeys: {
		default() {
			this.click();
		}
	},

	async action( success, failure ) {
		try {
			const { id } = this.user;
			this.nwjs.openBrowser( twitchEmotesUrl, { id } );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
