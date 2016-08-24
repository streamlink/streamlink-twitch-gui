import Ember from "Ember";
import config from "config";
import nwGui from "nwjs/nwGui";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/modal/ModalChangelogComponent.hbs";


var get = Ember.get;

var changelogUrl = config.update[ "changelog-url" ];


export default ModalDialogComponent.extend({
	layout: layout,
	"class": "modal-changelog",

	version: nwGui.App.manifest.version,


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
