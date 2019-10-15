import Controller from "@ember/controller";
import { qualities } from "data/models/stream/model";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";


export default Controller.extend({
	contentStreamingQuality: qualities,

	DEFAULT_VODCAST_REGEXP
});
