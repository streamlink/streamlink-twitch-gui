import {
	get,
	inject
} from "ember";
import { main as config } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import layout from "templates/components/modal/ModalFirstrunComponent.hbs";


const { service } = inject;


export default ModalDialogComponent.extend({
	routing: service( "-routing" ),
	versioncheck: service(),

	layout,

	"class": "modal-firstrun",

	config,


	actions: {
		settings() {
			get( this, "routing" ).transitionTo( "settings" );
			this.send( "start" );
		},

		start() {
			this.send( "close" );
			get( this, "versioncheck" ).checkForNewRelease();
		}
	}
});
