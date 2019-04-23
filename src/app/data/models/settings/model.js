import attr from "ember-data/attr";
import Model from "ember-data/model";
import { fragment, name } from "utils/decorators";


@name( "Settings" )
export default class Settings extends Model {
	@attr( "boolean", { defaultValue: false } )
	advanced;
	/** @type {SettingsGui} */
	@fragment( "settings-gui" )
	gui;
	/** @type {SettingsStreaming} */
	@fragment( "settings-streaming" )
	streaming;
	/** @type {SettingsStreams} */
	@fragment( "settings-streams" )
	streams;
	/** @type {SettingsChat} */
	@fragment( "settings-chat" )
	chat;
	/** @type {SettingsNotification} */
	@fragment( "settings-notification" )
	notification;
	/** @type {SettingsHotkeys} */
	@fragment( "settings-hotkeys" )
	hotkeys;
}
