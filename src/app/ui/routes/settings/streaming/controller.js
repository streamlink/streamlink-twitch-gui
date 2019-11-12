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


export default Controller.extend({
	platform,
	providers,
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

	hlsSegmentThreadsDefault: settingsAttrMeta( "hls_segment_threads", "defaultValue" ),
	hlsSegmentThreadsMin: settingsAttrMeta( "hls_segment_threads", "min" ),
	hlsSegmentThreadsMax: settingsAttrMeta( "hls_segment_threads", "max" ),

	retryStreamsDefault: settingsAttrMeta( "retry_streams", "defaultValue" ),
	retryStreamsMin: settingsAttrMeta( "retry_streams", "min" ),
	retryStreamsMax: settingsAttrMeta( "retry_streams", "max" ),

	retryOpenDefault: settingsAttrMeta( "retry_open", "defaultValue" ),
	retryOpenMin: settingsAttrMeta( "retry_open", "min" ),
	retryOpenMax: settingsAttrMeta( "retry_open", "max" )
});
