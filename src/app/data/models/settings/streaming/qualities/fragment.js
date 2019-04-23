import { defineProperty } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { qualities } from "data/models/stream/model";


class SettingsStreamingQualities extends Fragment {}

for ( const { id } of qualities ) {
	const prop = fragment( "settings-streaming-quality", { defaultValue: {} } );
	defineProperty( SettingsStreamingQualities.prototype, id, prop );
}


export default SettingsStreamingQualities;
