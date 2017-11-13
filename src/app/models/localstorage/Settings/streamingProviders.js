import {
	Fragment,
	fragment
} from "model-fragments";
import {
	streaming as streamingConfig
} from "config";


const { providers } = streamingConfig;

const attributes = {};
for ( const [ provider ] of Object.entries( providers ) ) {
	attributes[ provider ] = fragment( "settingsStreamingProvider", { defaultValue: {} } );
}


export default Fragment.extend( attributes );
