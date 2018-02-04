import attr from "ember-data/attr";
import Model from "ember-data/model";
import { fragment } from "model-fragments";


/**
 * @class Settings
 */
export default Model.extend({
	advanced: attr( "boolean", { defaultValue: false } ),
	gui: fragment( "settingsGui", { defaultValue: {} } ),
	streaming: fragment( "settingsStreaming", { defaultValue: {} } ),
	streams: fragment( "settingsStreams", { defaultValue: {} } ),
	chat: fragment( "settingsChat", { defaultValue: {} } ),
	notification: fragment( "settingsNotification", { defaultValue: {} } )

}).reopenClass({
	toString() { return "Settings"; }
});
