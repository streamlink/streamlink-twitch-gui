import { Controller } from "ember";
import {
	default as SettingsStreams,
	DEFAULT_VODCAST_REGEXP
} from "models/localstorage/Settings/streams";
import { isDarwin } from "utils/node/platform";


export default Controller.extend({
	SettingsStreams,
	DEFAULT_VODCAST_REGEXP,
	isDarwin
});
