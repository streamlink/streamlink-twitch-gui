import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


export default ModalDialogComponent.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	versioncheck: service(),

	layout,

	"class": "modal-newrelease",

	outdated: readOnly( "versioncheck.versionOutdated" ),
	latest  : readOnly( "versioncheck.versionLatest" ),


	actions: {
		async download( success, failure ) {
			try {
				this.nwjs.openBrowser( this.versioncheck.downloadURL );
				await success();
				this.send( "ignore" );
			} catch ( err ) {
				await failure( err );
			}
		},

		ignore() {
			this.versioncheck.ignoreRelease();
			this.send( "close" );
		}
	}
});
