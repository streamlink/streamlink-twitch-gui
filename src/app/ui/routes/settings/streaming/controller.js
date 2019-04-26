import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import { streaming as streamingConfig } from "config";
import {
	default as SettingsStreaming,
	ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH as inputPassthrough
} from "data/models/settings/streaming/fragment";
import { platform } from "utils/node/platform";


const { providers } = streamingConfig;
const { playerInput: contentStreamingPlayerInput } = SettingsStreaming;


function settingsAttrMeta( attr, prop ) {
	return computed(function() {
		return SettingsStreaming.metaForProperty( attr ).options[ prop ];
	});
}


export default class SettingsStreamingController extends Controller {
	platform = platform;
	providers = providers;
	contentStreamingPlayerInput = contentStreamingPlayerInput;

	@computed()
	get contentStreamingProvider() {
		return Object.keys( providers )
			// exclude unsupported providers
			.filter( id => providers[ id ][ "exec" ][ platform ] )
			.map( id => ({
				id,
				label: providers[ id ][ "label" ]
			}) );
	}

	// can't use the fragment's providerName computed property here
	// the controller's model is an ObjectBuffer instance
	@computed( "model.streaming.provider" )
	get providerName() {
		const provider = get( this, "model.streaming.provider" );

		return providers[ provider ][ "name" ];
	}

	@computed( "model.streaming.player_input" )
	get playerInputDocumentation() {
		const input = get( this, "model.streaming.player_input" );

		return contentStreamingPlayerInput.findBy( "id", input ).documentation;
	}

	@equal( "model.streaming.player_input", inputPassthrough )
	playerInputPassthrough;

	@settingsAttrMeta( "hls_live_edge", "defaultValue" )
	hlsLiveEdgeDefault;
	@settingsAttrMeta( "hls_live_edge", "min" )
	hlsLiveEdgeMin;
	@settingsAttrMeta( "hls_live_edge", "max" )
	hlsLiveEdgeMax;

	@settingsAttrMeta( "hls_segment_threads", "defaultValue" )
	hlsSegmentThreadsDefault;
	@settingsAttrMeta( "hls_segment_threads", "min" )
	hlsSegmentThreadsMin;
	@settingsAttrMeta( "hls_segment_threads", "max" )
	hlsSegmentThreadsMax;

	@settingsAttrMeta( "retry_streams", "defaultValue" )
	retryStreamsDefault;
	@settingsAttrMeta( "retry_streams", "min" )
	retryStreamsMin;
	@settingsAttrMeta( "retry_streams", "max" )
	retryStreamsMax;

	@settingsAttrMeta( "retry_open", "defaultValue" )
	retryOpenDefault;
	@settingsAttrMeta( "retry_open", "min" )
	retryOpenMin;
	@settingsAttrMeta( "retry_open", "max" )
	retryOpenMax;
}
