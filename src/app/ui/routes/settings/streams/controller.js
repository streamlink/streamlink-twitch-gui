import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { streaming as streamingConfig } from "config";
import {
	qualities,
	qualitiesLivestreamer,
	qualitiesStreamlink
} from "data/models/stream/model";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";


const { providers } = streamingConfig;


export default Controller.extend({
	// can't use the fragment's isStreamlink computed property here
	// the controller's model is an ObjectBuffer instance
	isStreamlink: computed( "model.streaming.provider", function() {
		const provider = get( this, "model.streaming.provider" );

		return providers[ provider ][ "type" ] === "streamlink";
	}),

	qualitiesLivestreamer,
	qualitiesStreamlink,
	contentStreamingQuality: qualities,

	DEFAULT_VODCAST_REGEXP
});
