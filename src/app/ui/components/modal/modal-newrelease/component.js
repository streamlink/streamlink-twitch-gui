import { get } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import ModalDialogComponent from "../modal-dialog/component";
import { openBrowser } from "nwjs/Shell";
import layout from "./template.hbs";


export default ModalDialogComponent.extend({
	versioncheck: service(),

	layout,

	"class": "modal-newrelease",

	outdated: readOnly( "versioncheck.versionOutdated" ),
	latest  : readOnly( "versioncheck.versionLatest" ),


	actions: {
		download( success, failure ) {
			let url = get( this, "versioncheck.downloadURL" );

			openBrowser( url )
				.then( success, failure )
				.then( () => this.send( "ignore" ) );
		},

		ignore() {
			get( this, "versioncheck" ).ignoreRelease();
			this.send( "close" );
		}
	}
});
