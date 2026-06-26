import Controller from "@ember/controller";
import { get, computed, set } from "@ember/object";
import { equal } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { streaming as streamingConfig } from "config";
import {
	default as SettingsStreaming,
	ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH as inputPassthrough
} from "data/models/settings/streaming/fragment";
import { platform } from "utils/node/platform";


const {
	"client-integrity-docs": contentClientIntegrityDocs,
	providers
} = streamingConfig;
const { playerInput: contentStreamingPlayerInput } = SettingsStreaming;


function settingsAttrMeta( attr, prop ) {
	return computed(function() {
		return SettingsStreaming.metaForProperty( attr ).options[ prop ];
	});
}


export default Controller.extend({
	/** @type {IntlService} */
	intl: service(),
	/** @type {NwjsService} */
	nwjs: service(),

	platform,
	providers,
	contentClientIntegrityDocs,
	contentStreamingPlayerInput,

	contentStreamingProvider: computed(function() {
		return Object.keys( providers )
			// exclude unsupported providers
			.filter( id => providers[ id ][ "exec" ][ platform ] )
			.map( id => ({
				id,
				label: providers[ id ][ "label" ]
			}) );
	}),

	// can't use the fragment's providerName computed property here
	// the controller's model is an ObjectBuffer instance
	providerName: computed( "model.streaming.provider", function() {
		const provider = get( this, "model.streaming.provider" );

		return providers[ provider ][ "name" ];
	}),

	playerInputDocumentation: computed( "model.streaming.player_input", function() {
		const input = get( this, "model.streaming.player_input" );

		return contentStreamingPlayerInput.findBy( "id", input ).documentation;
	}),

	playerInputPassthrough: equal( "model.streaming.player_input", inputPassthrough ),

	hlsLiveEdgeDefault: settingsAttrMeta( "hls_live_edge", "defaultValue" ),
	hlsLiveEdgeMin: settingsAttrMeta( "hls_live_edge", "min" ),
	hlsLiveEdgeMax: settingsAttrMeta( "hls_live_edge", "max" ),

	streamSegmentThreadsDefault: settingsAttrMeta( "stream_segment_threads", "defaultValue" ),
	streamSegmentThreadsMin: settingsAttrMeta( "stream_segment_threads", "min" ),
	streamSegmentThreadsMax: settingsAttrMeta( "stream_segment_threads", "max" ),

	retryStreamsDefault: settingsAttrMeta( "retry_streams", "defaultValue" ),
	retryStreamsMin: settingsAttrMeta( "retry_streams", "min" ),
	retryStreamsMax: settingsAttrMeta( "retry_streams", "max" ),

	retryOpenDefault: settingsAttrMeta( "retry_open", "defaultValue" ),
	retryOpenMin: settingsAttrMeta( "retry_open", "min" ),
	retryOpenMax: settingsAttrMeta( "retry_open", "max" ),

	twitchOAuthPending: false,
	twitchOAuthMessage: null,
	twitchOAuthMessageClass: null,

	actions: {
		async connectTwitchAccount( success, failure ) {
			set( this, "twitchOAuthPending", true );
			set( this, "twitchOAuthMessage", null );
			set( this, "twitchOAuthMessageClass", null );

			try {
				const token = await this.nwjs.openTwitchLogin();
				set( this, "model.streaming.twitch_oauth_token", token );
				set(
					this,
					"twitchOAuthMessage",
					this.intl.t( "settings.streaming.twitch-oauth.success" ).toString()
				);
				set( this, "twitchOAuthMessageClass", "text-success" );
				success();
			} catch ( e ) {
				set(
					this,
					"twitchOAuthMessage",
					this.intl.t( "settings.streaming.twitch-oauth.error" ).toString()
				);
				set( this, "twitchOAuthMessageClass", "text-danger" );
				failure();
			} finally {
				set( this, "twitchOAuthPending", false );
			}
		}
	}
});
