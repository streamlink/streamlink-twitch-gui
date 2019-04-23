import { defineProperty } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { streaming as streamingConfig } from "config";


const { providers } = streamingConfig;

class SettingsStreamingProviders extends Fragment {}

for ( const [ provider ] of Object.entries( providers ) ) {
	const prop = fragment( "settings-streaming-provider", { defaultValue: {} } );
	defineProperty( SettingsStreamingProviders.prototype, provider, prop );
}


export default SettingsStreamingProviders;
