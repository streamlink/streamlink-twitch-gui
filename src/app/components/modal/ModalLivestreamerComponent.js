import {
	get,
	set,
	computed,
	inject,
	run
} from "Ember";
import { streamprovider } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import qualities from "models/LivestreamerQualities";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalLivestreamerComponent.hbs";


const { readOnly } = computed;
const { service } = inject;
const { schedule } = run;
const {
	providers,
	"download-url": downloadUrl,
	"version-min": versionMin
} = streamprovider;


export default ModalDialogComponent.extend({
	livestreamer: service(),
	settings: service(),

	layout,

	"class": "modal-livestreamer",

	error : readOnly( "livestreamer.error" ),
	active: readOnly( "livestreamer.active" ),

	qualities,
	versionMin: computed( "settings.streamprovider", function() {
		let streamprovider = get( this, "settings.streamprovider" );
		let type = providers[ streamprovider ][ "type" ];

		return versionMin[ type ];
	}),

	providername: computed( "settings.streamprovider", function() {
		let streamprovider = get( this, "settings.streamprovider" );

		return providers[ streamprovider ][ "name" ];
	}),


	actions: {
		download( success ) {
			let streamprovider = get( this, "settings.streamprovider" );
			let provider = providers[ streamprovider ][ "type" ];

			if ( downloadUrl[ provider ] ) {
				openBrowser( downloadUrl[ provider ] );
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
