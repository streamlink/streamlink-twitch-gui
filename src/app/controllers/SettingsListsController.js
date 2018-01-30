import { Controller } from "ember";
import SettingsStreams from "models/localstorage/Settings/streams";
import { isDarwin } from "utils/node/platform";


const {
	contentName: contentStreamsName,
	info: contentStreamsInfo,
	click: contentStreamsClick
} = SettingsStreams;


export default Controller.extend({
	contentStreamsName,
	contentStreamsInfo,
	contentStreamsClick,
	isDarwin
});
