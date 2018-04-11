import attr from "ember-data/attr";
import Model from "ember-data/model";
import SettingsStreaming from "data/models/settings/streaming/fragment";
import SettingsStreams from "data/models/settings/streams/fragment";
import SettingsNotification from "data/models/settings/notification/fragment";


/**
 * @type {Object.<string,[(Model|Fragment),string,string]>}
 */
const attributes = {
	streaming_quality: [ SettingsStreaming, "quality", "streaming.quality" ],
	streams_chat_open: [ SettingsStreams, "chat_open", "streams.chat_open" ],
	notification_enabled: [ SettingsNotification, "enabled", "notification.enabled" ]
};

for ( const [ name, [ settings, prop, settingsPath ] ] of Object.entries( attributes ) ) {
	const meta = settings.metaForProperty( prop );
	if ( !meta || !meta.isAttribute ) { continue; }

	attributes[ name ] = attr( meta.type, {
		defaultValue: null,
		// the ChannelSettingsController needs this attribute option
		settingsPath
	});
}


export default Model.extend( attributes ).reopenClass({
	toString() { return "ChannelSettings"; }
});
