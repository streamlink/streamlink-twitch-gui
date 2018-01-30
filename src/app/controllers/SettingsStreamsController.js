import {
	get,
	computed,
	Controller
} from "ember";
import {
	streaming as streamingConfig
} from "config";
import {
	default as qualities,
	qualitiesLivestreamer,
	qualitiesStreamlink
} from "models/stream/qualities";
import { DEFAULT_VODCAST_REGEXP } from "models/localstorage/Settings/streams";


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
