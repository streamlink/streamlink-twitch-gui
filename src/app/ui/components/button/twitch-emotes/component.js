import { and, or } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import { twitch } from "config";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


const { "emotes-url": twitchEmotesUrl } = twitch;


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {NwjsService} */
	nwjs: service(),
	settings: service(),

	showButton: false,
	isEnabled: or( "showButton", "settings.streams.twitchemotes" ),
	isVisible: and( "isEnabled", "channel.partner" ),

	classNames: [ "btn-neutral" ],
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
			const { id } = this.channel;
			this.nwjs.openBrowser( twitchEmotesUrl, { id } );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
