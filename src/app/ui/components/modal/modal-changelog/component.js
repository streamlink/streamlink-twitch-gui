import { inject as service } from "@ember/service";
import { main as mainConfig } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


const { urls: { "release": releaseUrl } } = mainConfig;


export default ModalDialogComponent.extend( /** @class ModalChangelogComponent */ {
	/** @type {NwjsService} */
	nwjs: service(),

	/** @type {VersioncheckService} */
	modalContext: null,

	layout,
	classNames: [ "modal-changelog-component" ],


	actions: {
		/** @this {ModalChangelogComponent} */
		async showChangelog( success, failure ) {
			try {
				const { version } = this.modalContext;
				this.nwjs.openBrowser( releaseUrl, { version } );
				await success();
				this.send( "close" );
			} catch ( err ) /* istanbul ignore next */ {
				await failure( err );
			}
		}
	}
});
