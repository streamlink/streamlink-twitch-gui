import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { qualitiesStreamlink } from "models/stream/qualities/index";


const attributes = {};
for ( const { id } of qualitiesStreamlink ) {
	attributes[ id ] = fragment( "settingsStreamingQuality", { defaultValue: {} } );
}


export default Fragment.extend( attributes );
