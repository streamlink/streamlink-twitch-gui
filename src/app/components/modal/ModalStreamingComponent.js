import {
	get,
	set,
	computed,
	inject,
	run
} from "ember";
import { streamprovider } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import HotkeyMixin from "mixins/HotkeyMixin";
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


export default ModalDialogComponent.extend( HotkeyMixin, {
	streaming: service(),
	settings: service(),

	layout,

	classNames: [
		"modal-streaming-component"
	],

	error : readOnly( "streaming.error" ),
	active: readOnly( "streaming.active" ),

	qualities,
	versionMin: computed( "settings.streamprovider", function() {
		const streamprovider = get( this, "settings.streamprovider" );
		const type = providers[ streamprovider ][ "type" ];

		return versionMin[ type ];
	}),

	providername: computed( "settings.streamprovider", function() {
		const streamprovider = get( this, "settings.streamprovider" );

		return providers[ streamprovider ][ "name" ];
	}),


	hotkeys: [
		{
			code: [ "Escape", "Backspace" ],
			action() {
				if ( get( this, "active" ) ) {
					this.send( "close" );
				} else {
					this.send( "abort" );
				}
			}
		},
		{
			code: [ "KeyQ", "KeyX" ],
			action() {
				if ( get( this, "active" ) ) {
					this.send( "shutdown" );
				} else {
					this.send( "abort" );
				}
			}
		},
		{
			code: "KeyL",
			action: "toggleLog"
		}
	],


	actions: {
		download( success, failure ) {
			const streamprovider = get( this, "settings.streamprovider" );
			const provider = providers[ streamprovider ][ "type" ];

			openBrowser( downloadUrl[ provider ] )
				.then( success, failure )
				.then( () => this.send( "close" ) );
		},

		abort() {
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				set( active, "aborted", true );
			}
			this.send( "close" );
		},

		close() {
			const streamingService = get( this, "streaming" );
			get( this, "modal" ).closeModal( streamingService );
			schedule( "destroy", () => {
				set( streamingService, "active", null );
			});
		},

		shutdown() {
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				active.kill();
			}
			this.send( "close" );
		},

		toggleLog() {
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				active.toggleProperty( "showLog" );
			}
		}
	}
});
