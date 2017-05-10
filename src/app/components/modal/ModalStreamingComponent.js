import {
	get,
	set,
	computed,
	inject
} from "ember";
import { streamprovider } from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import HotkeyMixin from "mixins/HotkeyMixin";
import qualities from "models/stream/qualities";
import {
	LogError,
	ProviderError,
	PlayerError,
	VersionError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError
} from "services/StreamingService/errors";
import { openBrowser } from "nwjs/Shell";
import layout from "templates/components/modal/ModalStreamingComponent.hbs";


const { readOnly } = computed;
const { service } = inject;
const {
	providers,
	"download-url": downloadUrl,
	"version-min": versionMin
} = streamprovider;


function computedError( classObj ) {
	return computed( "active.error", function() {
		return get( this, "active.error" ) instanceof classObj;
	});
}


export default ModalDialogComponent.extend( HotkeyMixin, {
	streaming: service(),
	settings: service(),

	layout,

	classNames: [
		"modal-streaming-component"
	],

	active: readOnly( "streaming.active" ),
	error: readOnly( "active.error" ),

	isLogError: computedError( LogError ),
	isProviderError: computedError( ProviderError ),
	isPlayerError: computedError( PlayerError ),
	isVersionError: computedError( VersionError ),
	isUnableToOpenError: computedError( UnableToOpenError ),
	isNoStreamsFoundError: computedError( NoStreamsFoundError ),
	isTimeoutError: computedError( TimeoutError ),

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
			code: [ "Enter", "NumpadEnter" ],
			action() {
				if ( get( this, "active.hasEnded") ) {
					this.send( "restart" );
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

		close() {
			const streamingService = get( this, "streaming" );
			const active = get( this, "active" );
			streamingService.closeStreamModal( active );
		},

		abort() {
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				set( active, "isAborted", true );
				active.destroyRecord();
			}
			this.send( "close" );
		},

		async shutdown() {
			const active = get( this, "active" );
			if ( active ) {
				active.kill();
			}
			this.send( "close" );
		},

		async restart( success ) {
			const streamingService = get( this, "streaming" );
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				if ( success ) {
					await success();
				}
				streamingService.launchStream( active );
			}
		},

		toggleLog() {
			const active = get( this, "active" );
			if ( active && !get( active, "isDestroyed" ) ) {
				active.toggleProperty( "showLog" );
			}
		}
	}
});
