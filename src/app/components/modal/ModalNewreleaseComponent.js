import Ember from "Ember";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/modal/ModalNewreleaseComponent.hbs";


var get = Ember.get;
var readOnly = Ember.computed.readOnly;


export default ModalDialogComponent.extend({
	versioncheck: Ember.inject.service(),

	layout: layout,
	"class": "modal-newrelease",

	outdated: readOnly( "versioncheck.versionOutdated" ),
	latest  : readOnly( "versioncheck.versionLatest" ),


	actions: {
		"download": function( success ) {
			var url = get( this, "versioncheck.downloadURL" );
			if ( url ) {
				openBrowser( url );
				if ( success instanceof Function ) {
					success();
				}
			}

			this.send( "ignore" );
		},

		"ignore": function() {
			get( this, "versioncheck" ).ignoreRelease();
			this.send( "close" );
		}
	}
});
