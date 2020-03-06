import { get, set, computed } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { streaming as streamingConfig } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import { qualities } from "data/models/stream/model";
import {
	LogError,
	ProviderError,
	PlayerError,
	VersionError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	HostingError
} from "services/streaming/errors";
import layout from "./template.hbs";
import "./styles.less";


const {
	"download-url": downloadUrl,
	validation: {
		providers: validationProviders
	}
} = streamingConfig;


function computedError( classObj ) {
	return computed( "active.error", function() {
		return get( this, "active.error" ) instanceof classObj;
	});
}


export default ModalDialogComponent.extend({
	/** @type {NwjsService} */
	nwjs: service(),
	streaming: service(),
	settings: service(),
	store: service(),

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
	isHostingError: computedError( HostingError ),

	qualities,
	versionMin: computed( "settings.streaming.providerType", function() {
		const type = get( this, "settings.streaming.providerType" );

		return validationProviders[ type ][ "version" ];
	}),

	providerName: readOnly( "settings.streaming.providerName" ),


	hotkeysNamespace: "modalstreaming",
	hotkeys: {
		close() {
			if ( get( this, "active" ) ) {
				this.send( "close" );
			} else {
				this.send( "abort" );
			}
		},
		confirm() {
			if ( get( this, "active.isHostedError" ) ) {
				this.send( "startHosted" );
			} else if ( get( this, "active.hasEnded") ) {
				this.send( "restart" );
			}
		},
		shutdown() {
			if ( get( this, "active" ) ) {
				this.send( "shutdown" );
			} else {
				this.send( "abort" );
			}
		},
		log: "toggleLog"
	},


	actions: {
		async download( success, failure ) {
			try {
				const providerType = this.settings.content.streaming.providerType;
				this.nwjs.openBrowser( downloadUrl[ providerType ] );
				await success();
				this.send( "close" );
			} catch ( err ) {
				await failure( err );
			}
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

		async startHosted( success, failure ) {
			const streamingService = get( this, "streaming" );
			const store = get( this, "store" );
			const active = get( this, "active" );
			if ( !active || get( active, "isDestroyed" ) ) {
				return;
			}
			const channel = get( this, "active.error.channel" );
			if ( !channel ) {
				return;
			}
			try {
				const user = await store.findRecord( "twitchUser", channel );
				const stream = await get( user, "stream" );
				if ( success ) {
					await success();
				}
				streamingService.startStream( stream );
			} catch ( e ) {
				if ( failure ) {
					await failure();
				}
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
