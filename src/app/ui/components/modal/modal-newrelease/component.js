import { inject as service } from "@ember/service";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend( /** @class ModalNewreleaseComponent */ {
	/** @type {NwjsService} */
	nwjs: service(),

	/** @type {VersioncheckService} */
	modalContext: null,

	layout,
	classNames: [ "modal-newrelease-component" ],


	actions: {
		/** @this {ModalNewreleaseComponent} */
		async download( success, failure ) {
			try {
				this.nwjs.openBrowser( this.modalContext.release.html_url );
				await success();
				this.send( "ignore" );
			} catch ( err ) /* istanbul ignore next */ {
				await failure( err );
			}
		},

		/** @this {ModalNewreleaseComponent} */
		ignore() {
			this.modalContext.ignoreRelease();
			this.send( "close" );
		}
	}
});
