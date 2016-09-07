import {
	get,
	set,
	computed,
	inject,
	run
} from "Ember";
import { livestreamer } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import Settings from "models/localstorage/Settings";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/modal/ModalLivestreamerComponent.hbs";


const { readOnly } = computed;
const { service } = inject;
const { schedule } = run;
const {
	"download-url": livestreamerDownloadUrl,
	"version-min": versionMin
} = livestreamer;


export default ModalDialogComponent.extend({
	livestreamer: service(),

	layout,

	"class": "modal-livestreamer",

	error : readOnly( "livestreamer.error" ),
	active: readOnly( "livestreamer.active" ),

	qualities: Settings.qualities,
	versionMin,


	actions: {
		download( success ) {
			if ( livestreamerDownloadUrl ) {
				openBrowser( livestreamerDownloadUrl );
				if ( success instanceof Function ) {
					success();
				}
			}
		},

		chat( channel ) {
			get( this, "livestreamer" ).openChat( channel );
		},

		abort() {
			set( this, "livestreamer.abort", true );
			get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
		},

		close() {
			get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
			schedule( "destroy", this, function() {
				set( this, "livestreamer.active", null );
			});
		},

		shutdown() {
			var active = get( this, "active" );
			if ( active ) {
				active.kill();
			}
			this.send( "close" );
		},

		toggleLog() {
			var active = get( this, "active" );
			if ( active ) {
				active.toggleProperty( "showLog" );
			}
		}
	}
});
