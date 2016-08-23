import { get } from "Ember";
import { update } from "config";
import { App } from "nwjs/nwGui";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/modal/ModalChangelogComponent.hbs";


const { "changelog-url": changelogUrl } = update;
const { manifest: { version } } = App;


export default ModalDialogComponent.extend({
	layout,

	"class": "modal-changelog",

	version,


	actions: {
		"showChangelog": function( success ) {
			var version = get( this, "version" );

			if ( version && changelogUrl ) {
				var url = changelogUrl.replace( "{version}", version );
				openBrowser( url );

				if ( success instanceof Function ) {
					success();
				}
			}

			this.send( "close" );
		}
	}
});
