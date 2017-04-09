import { get } from "ember";
import { main as config } from "config";
import { App } from "nwjs/nwGui";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalChangelogComponent.hbs";


const { urls: { "release": releaseUrl } } = config;
const { manifest: { version } } = App;


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
