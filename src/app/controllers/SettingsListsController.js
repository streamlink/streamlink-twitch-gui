import { Controller } from "ember";
import SettingsStreams from "models/localstorage/Settings/streams";
import { isDarwin } from "utils/node/platform";


export default Controller.extend({
	SettingsStreams,
	isDarwin
});
