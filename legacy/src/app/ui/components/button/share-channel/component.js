import { inject as service } from "@ember/service";
import { t } from "ember-intl";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { twitch as twitchConfig } from "config";


const { "channel-url": channelUrl } = twitchConfig;


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),

	/** @type {TwitchUser} */
	user: null,

	classNames: [ "share-channel-component", "btn-info" ],
	icon: "fa-share-alt",
	_title: t( "components.share-channel.title" ),
	iconanim: true,

	hotkeysNamespace: "sharechannelbutton",
	hotkeys: {
		default() {
			this.click();
		}
	},

	async action( success, failure ) {
		try {
			const url = channelUrl.replace( "{channel}", this.user.login );
			this.nwjs.clipboard.set( url );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
