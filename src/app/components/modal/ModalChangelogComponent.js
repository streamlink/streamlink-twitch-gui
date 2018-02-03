import { get } from "@ember/object";
import { main as config } from "config";
import { manifest } from "nwjs/App";
import ModalDialogComponent from "./ModalDialogComponent";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalChangelogComponent.hbs";


const { urls: { "release": releaseUrl } } = config;
const { version } = manifest;


export default ModalDialogComponent.extend({
	layout,

	"class": "modal-changelog",

	version,


	actions: {
		showChangelog( success, failure ) {
			let version = get( this, "version" );

			openBrowser( releaseUrl, {
				version
			})
				.then( success, failure )
				.then( () => this.send( "close" ) );
		}
	}
});
