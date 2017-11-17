import {
	get,
	computed,
	inject
} from "ember";
import ModalDialogComponent from "./ModalDialogComponent";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalNewreleaseComponent.hbs";


const { readOnly } = computed;
const { service } = inject;


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
