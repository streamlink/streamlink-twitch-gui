import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import FormButtonComponent from "../form-button/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";


export default FormButtonComponent.extend( HotkeyMixin, {
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
