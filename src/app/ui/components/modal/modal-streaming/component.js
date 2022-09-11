import { set, computed } from "@ember/object";
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
	TimeoutError
} from "services/streaming/errors";
import layout from "./template.hbs";
import "./styles.less";


const {
	"download-url": downloadUrl,
	validation: {
		providers: validationProviders
	}
} = streamingConfig;


function computedError( Class ) {
	return computed( "error", function() {
		return this.error instanceof Class;
	});
}


export default ModalDialogComponent.extend( /** @class ModalStreamingComponent */ {
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {StreamingService} */
	streaming: service(),
	/** @type {SettingsService} */
	settings: service(),
	/** @type {DS.Store} */
	store: service(),

	layout,

	classNames: [ "modal-streaming-component" ],

	/** @type {Stream} */
	modalContext: null,

	error: readOnly( "modalContext.error" ),

	isLogError: computedError( LogError ),
	isProviderError: computedError( ProviderError ),
	isPlayerError: computedError( PlayerError ),
	isVersionError: computedError( VersionError ),
	isUnableToOpenError: computedError( UnableToOpenError ),
	isNoStreamsFoundError: computedError( NoStreamsFoundError ),
	isTimeoutError: computedError( TimeoutError ),

	qualities,
	versionMin: computed( "settings.content.streaming.providerType", function() {
		const type = this.settings.content.streaming.providerType;

		return validationProviders[ type ][ "version" ];
	}),

	providerName: readOnly( "settings.content.streaming.providerName" ),


	hotkeysNamespace: "modalstreaming",
	hotkeys: {
		/** @this {ModalStreamingComponent} */
		close() {
			if ( this.modalContext.isPreparing ) {
				this.send( "abort" );
			} else {
				this.send( "close" );
			}
		},
		/** @this {ModalStreamingComponent} */
		confirm() {
			if ( this.modalContext.hasEnded ) {
				this.send( "restart" );
			}
		},
		/** @this {ModalStreamingComponent} */
		shutdown() {
			if ( this.modalContext.isPreparing ) {
				this.send( "abort" );
			} else {
				this.send( "shutdown" );
			}
		},
		log: "toggleLog"
	},


	actions: {
		/** @this {ModalStreamingComponent} */
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

		/** @this {ModalStreamingComponent} */
		abort() {
			const { modalContext } = this;
			if ( !modalContext.isDestroyed ) {
				set( modalContext, "isAborted", true );
				modalContext.destroyRecord();
			}
			this.send( "close" );
		},

		/** @this {ModalStreamingComponent} */
		async shutdown() {
			this.modalContext.kill();
			this.send( "close" );
		},

		/** @this {ModalStreamingComponent} */
		async restart( success ) {
			const { modalContext } = this;
			if ( !modalContext.isDestroyed ) {
				if ( success ) {
					await success();
				}
				this.streaming.launchStream( modalContext )
					.catch( () => {} );
			}
		},

		/** @this {ModalStreamingComponent} */
		toggleLog() {
			const { modalContext } = this;
			if ( !modalContext.isDestroyed ) {
				modalContext.toggleProperty( "showLog" );
			}
		}
	}
});
