import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { streaming as streamingConfig } from "config";


const { providers } = streamingConfig;

const attributes = {};
for ( const [ provider ] of Object.entries( providers ) ) {
	attributes[ provider ] = fragment( "settingsStreamingProvider", { defaultValue: {} } );
}


export default Fragment.extend( attributes );
