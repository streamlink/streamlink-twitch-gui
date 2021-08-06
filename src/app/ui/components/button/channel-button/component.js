import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import "./styles.less";


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),

	classNames: [ "channel-button-component", "btn-primary" ],
	icon: "fa-twitch",
	iconanim: true,

	_title: computed( "intl.locale", "channel.display_name", function() {
		const { display_name: name } = this.channel;

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
			this.nwjs.openBrowser( this.channel.url );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
