import { inject as service } from "@ember/service";
import { main as config } from "config";
import { manifest } from "nwjs/App";
import ModalDialogComponent from "../modal-dialog/component";
import layout from "./template.hbs";


const { urls: { "release": releaseUrl } } = config;
const { version } = manifest;


export default ModalDialogComponent.extend({
	/** @type {NwjsService} */
	nwjs: service(),

	layout,

	"class": "modal-changelog",

	version,


	actions: {
		async showChangelog( success, failure ) {
			try {
				this.nwjs.openBrowser( releaseUrl, { version } );
				await success();
				this.send( "close" );
			} catch ( err ) {
				await failure( err );
			}
		}
	}
});
