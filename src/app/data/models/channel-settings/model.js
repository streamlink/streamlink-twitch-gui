import attr from "ember-data/attr";
import Model from "ember-data/model";
import SettingsStreaming from "data/models/settings/streaming/fragment";
import SettingsStreams from "data/models/settings/streams/fragment";
import SettingsNotification from "data/models/settings/notification/fragment";
import { name } from "utils/decorators";


const settingsAttribute = ( Settings, attribute, settingsPath ) => () => {
	const meta = Settings.metaForProperty( attribute );
	if ( !meta || !meta.isAttribute ) { return; }

	return attr( meta.type, {
		defaultValue: null,
		// the ChannelSettingsController needs this attribute option
		settingsPath
	});
};


@name( "ChannelSettings" )
export default class ChannelSettings extends Model {
	@settingsAttribute( SettingsStreaming, "quality", "streaming.quality" )
	streaming_quality;
	@settingsAttribute( SettingsStreaming, "low_latency", "streaming.low_latency" )
	streaming_low_latency;
	@settingsAttribute( SettingsStreaming, "disable_ads", "streaming.disable_ads" )
	streaming_disable_ads;
	@settingsAttribute( SettingsStreams, "chat_open", "streams.chat_open" )
	streams_chat_open;
	@settingsAttribute( SettingsNotification, "enabled", "notification.enabled" )
	notification_enabled;
}
