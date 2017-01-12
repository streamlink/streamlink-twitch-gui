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
import layout from "templates/components/modal/ModalStreamingComponent.hbs";


const { readOnly } = computed;
const { service } = inject;
const { schedule } = run;
const {
	providers,
	"download-url": downloadUrl,
	"version-min": versionMin
} = streamprovider;


export default ModalDialogComponent.extend({
	streaming: service(),
	settings: service(),

	layout,

	"class": "modal-streaming",

	error : readOnly( "streaming.error" ),
	active: readOnly( "streaming.active" ),

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
		download() {
			let streamprovider = get( this, "settings.streamprovider" );
			let provider = providers[ streamprovider ][ "type" ];

			if ( downloadUrl[ provider ] ) {
				openBrowser( downloadUrl[ provider ] );
				return Promise.resolve();
			}

			return Promise.reject();
		},

		abort() {
			set( this, "streaming.abort", true );
			get( this, "modal" ).closeModal( get( this, "streaming" ) );
		},

		close() {
			get( this, "modal" ).closeModal( get( this, "streaming" ) );
			schedule( "destroy", this, function() {
				set( this, "streaming.active", null );
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
