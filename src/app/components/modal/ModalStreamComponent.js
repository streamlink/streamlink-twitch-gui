import {
	get,
	set,
	computed,
	inject,
	run
} from "Ember";
import { streamprovider } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import qualities from "models/stream/qualities";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalStreamComponent.hbs";


const { readOnly } = computed;
const { service } = inject;
const { schedule } = run;
const {
	providers,
	"download-url": downloadUrl,
	"version-min": versionMin
} = streamprovider;


export default ModalDialogComponent.extend({
	streamservice: service( "stream" ),
	settings: service(),

	layout,

	"class": "modal-stream",

	error : readOnly( "streamservice.error" ),
	active: readOnly( "streamservice.active" ),

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
			get( this, "streamservice" ).openChat( channel );
		},

		abort() {
			set( this, "streamservice.abort", true );
			get( this, "modal" ).closeModal( get( this, "streamservice" ) );
		},

		close() {
			get( this, "modal" ).closeModal( get( this, "streamservice" ) );
			schedule( "destroy", this, function() {
				set( this, "streamservice.active", null );
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
