import { action, get, set, computed } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { classNames, layout } from "@ember-decorators/component";
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
import { hotkey, hotkeysNamespace } from "utils/decorators";
import template from "./template.hbs";
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


@layout( template )
@classNames( "modal-streaming-component" )
@hotkeysNamespace( "modalstreaming" )
export default class ModalStreamingComponent extends ModalDialogComponent {
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {StreamingService} */
	@service streaming;
	/** @type {SettingsService} */
	@service settings;
	/** @type {DS.Store} */
	@service store;


	/** @type {Stream} */
	modalContext;

	/** @alias modalContext.error */
	@readOnly( "modalContext.error" )
	error;

	@computedError( LogError )
	isLogError;
	@computedError( ProviderError )
	isProviderError;
	@computedError( PlayerError )
	isPlayerError;
	@computedError( VersionError )
	isVersionError;
	@computedError( UnableToOpenError )
	isUnableToOpenError;
	@computedError( NoStreamsFoundError )
	isNoStreamsFoundError;
	@computedError( TimeoutError )
	isTimeoutError;
	@computedError( HostingError )
	isHostingError;

	qualities = qualities;
	@computed( "settings.content.streaming.providerType" )
	get versionMin() {
		const type = this.settings.content.streaming.providerType;

		return validationProviders[ type ][ "version" ];
	}

	@readOnly( "settings.content.streaming.providerName" )
	providerName;


	@hotkey( "close" )
	hotkeyClose() {
		if ( this.modalContext.isPreparing ) {
			this.send( "abort" );
		} else {
			this.send( "close" );
		}
	}

	@hotkey( "confirm" )
	hotkeyConfirm() {
		if ( this.isHostingError ) {
			this.send( "startHosted" );
		} else if ( this.modalContext.hasEnded ) {
			this.send( "restart" );
		}
	}

	@hotkey( "shutdown" )
	hotkeyShutdown() {
		if ( this.modalContext.isPreparing ) {
			this.send( "abort" );
		} else {
			this.send( "shutdown" );
		}
	}

	@hotkey( "log" )
	hotkeyLog() {
		this.send( "toggleLog" );
	}


	@action
	async download( success, failure ) {
		try {
			const { providerType } = this.settings.content.streaming;
			this.nwjs.openBrowser( downloadUrl[ providerType ] );
			await success();
			this.send( "close" );
		} catch ( err ) {
			await failure( err );
		}
	}

	@action
	abort() {
		const { modalContext } = this;
		if ( !modalContext.isDestroyed ) {
			set( modalContext, "isAborted", true );
			modalContext.destroyRecord();
		}
		this.send( "close" );
	}

	@action
	async shutdown() {
		this.modalContext.kill();
		this.send( "close" );
	}

	@action
	async restart( success ) {
		const { modalContext } = this;
		if ( !modalContext.isDestroyed ) {
			if ( success ) {
				await success();
			}
			this.streaming.launchStream( modalContext )
				.catch( () => {} );
		}
	}

	@action
	async startHosted( success, failure ) {
		const { modalContext } = this;
		if ( modalContext.isDestroyed ) { return; }
		const channel = get( modalContext, "error.channel" );
		if ( !channel ) { return; }
		try {
			const user = await this.store.queryRecord( "twitchUser", channel );
			const stream = await get( user, "stream" );
			if ( success ) {
				await success();
			}
			this.send( "close" );
			this.streaming.startStream( stream )
				.catch( () => {} );
		} catch ( e ) {
			if ( failure ) {
				await failure();
			}
		}
	}

	@action
	toggleLog() {
		const { modalContext } = this;
		if ( !modalContext.isDestroyed ) {
			modalContext.toggleProperty( "showLog" );
		}
	}
}
