import { get } from "Ember";
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
		showChangelog( success ) {
			let version = get( this, "version" );

			if ( version && releaseUrl ) {
				let url = releaseUrl.replace( "{version}", version );
				openBrowser( url );

				if ( success instanceof Function ) {
					success();
				}
			}

			this.send( "close" );
		}
	}
});
