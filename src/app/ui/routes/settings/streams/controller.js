import Controller from "@ember/controller";
import {
	qualities,
	qualitiesLivestreamer,
	qualitiesStreamlink
} from "data/models/stream/model";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";
import isStreamlinkMixin from "../-mixins/is-streamlink";


export default Controller.extend( isStreamlinkMixin, {
	qualitiesLivestreamer,
	qualitiesStreamlink,
	contentStreamingQuality: qualities,

	DEFAULT_VODCAST_REGEXP
});
