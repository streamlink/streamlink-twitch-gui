import { defineProperty } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { players as playersConfig } from "config";
import { typeKey } from "../player/fragment";


class SettingsStreamingPlayers extends Fragment {}

defineProperty(
	SettingsStreamingPlayers.prototype,
	"default",
	fragment( "settings-streaming-player", { defaultValue: {} } )
);

for ( const [ type ] of Object.entries( playersConfig ) ) {
	const prop = fragment( "settings-streaming-player", {
		defaultValue: {
			[ typeKey ]: `settings-streaming-player-${type}`
		},
		polymorphic: true,
		typeKey
	});
	defineProperty( SettingsStreamingPlayers.prototype, type, prop );
}


export default SettingsStreamingPlayers;
