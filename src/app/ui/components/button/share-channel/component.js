import { inject as service } from "@ember/service";
import { t } from "ember-intl";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),

	classNames: [ "btn-info" ],
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
			this.nwjs.clipboard.set( this.channel.url );
			await success();
		} catch ( err ) {
			await failure( err );
		}
	}
});
