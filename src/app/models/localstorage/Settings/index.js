import {
	attr,
	Model
} from "ember-data";
import { fragment } from "model-fragments";
import { isWin } from "utils/node/platform";


/**
 * @class Settings
 */
export default Model.extend({
	advanced: attr( "boolean", { defaultValue: false } ),
	gui: fragment( "settingsGui", { defaultValue: {} } ),
	streaming: fragment( "settingsStreaming", { defaultValue: {} } ),
	streams: fragment( "settingsStreams", { defaultValue: {} } ),
	chat_method         : attr( "string",  { defaultValue: "default" } ),
	chat_command        : attr( "string",  { defaultValue: "" } ),
	notification: fragment( "settingsNotification", { defaultValue: {} } )

}).reopenClass({

	toString() { return "Settings"; },

	chat_methods: [
		// TODO: change to "browser"
		{ id: "default",  label: "Default Browser" },
		// TODO: change to "default"
		{ id: "irc",      label: "Internal IRC Client", disabled: true },
		{ id: "chromium", label: "Chromium" },
		{ id: "chrome",   label: "Google Chrome" },
		{ id: "msie",     label: "Internet Explorer", disabled: !isWin },
		{ id: "chatty",   label: "Chatty" },
		{ id: "custom",   label: "Custom application" }
	]
});
